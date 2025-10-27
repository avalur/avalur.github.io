#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <math.h>
#include <time.h>
#include <stdbool.h>
#include <stdint.h>
#include <mach/mach_time.h>
#include <mach/mach.h>
#include <sys/resource.h>
#include <dispatch/dispatch.h>
#ifdef USE_ACCELERATE
#include <Accelerate/Accelerate.h>
#endif

#include "bench.h"

// ---------- Timer ----------

double now_seconds(void) {
    static mach_timebase_info_data_t timebase = {0, 0};
    if (timebase.denom == 0) mach_timebase_info(&timebase);
    uint64_t t = mach_absolute_time();
    return (double)t * (double)timebase.numer / (double)timebase.denom / 1e9;
}

// ---------- Memory (RSS) ----------

uint64_t current_rss_bytes(void) {
    struct mach_task_basic_info info;
    mach_msg_type_number_t count = MACH_TASK_BASIC_INFO_COUNT;
    kern_return_t kr = task_info(mach_task_self(), MACH_TASK_BASIC_INFO,
                                 (task_info_t)&info, &count);
    if (kr != KERN_SUCCESS) return 0;
    return (uint64_t)info.resident_size;
}

// ---------- Helpers ----------

void fill_random(double *a, size_t n) {
    for (size_t i = 0; i < n; ++i) {
        a[i] = (double)rand() / (double)RAND_MAX - 0.5; // centered around 0
    }
}

void zero_buf(double *a, size_t n) {
    memset(a, 0, n * sizeof(double));
}

static inline void ops_gemm_classic(int M, int N, int K, unsigned long long *muls, unsigned long long *adds) {
    // We compute C = A * B with C zero-initialized each run
    // For each of M*N elements we do K multiplies and K adds
    unsigned long long mm = (unsigned long long)M * (unsigned long long)N * (unsigned long long)K;
    *muls = mm;
    *adds = mm;
}

// ---------- Algorithms ----------

static bool alg_naive(const double *A, const double *B, double *C, int M, int N, int K, int threads) {
    (void)threads;
    for (int i = 0; i < M; ++i) {
        for (int k = 0; k < K; ++k) {
            double aik = A[i*(size_t)K + k];
            const double *brow = &B[k*(size_t)N];
            double *crow = &C[i*(size_t)N];
            for (int j = 0; j < N; ++j) {
                crow[j] += aik * brow[j];
            }
        }
    }
    return true;
}

static size_t extra_naive(int M, int N, int K, int threads) {
    (void)M; (void)N; (void)K; (void)threads; return 0;
}

static bool alg_blocked(const double *A, const double *B, double *C, int M, int N, int K, int threads) {
    (void)threads;
    // Optimal block size for M3: L1 cache is 128KB per core
    // For doubles: aim for 3 blocks (A_block, B_block, C_block) fitting in L1
    // Use 64 for better cache utilization and SIMD alignment
    const int BS = 64;
    
    // Reorder loops: tile K first (better for accumulation), then N, then M
    for (int kk = 0; kk < K; kk += BS) {
        int kkmax = kk + BS; if (kkmax > K) kkmax = K;
        for (int ii = 0; ii < M; ii += BS) {
            int iimax = ii + BS; if (iimax > M) iimax = M;
            for (int jj = 0; jj < N; jj += BS) {
                int jjmax = jj + BS; if (jjmax > N) jjmax = N;
                // Inner loops: i-k-j order for better vectorization
                for (int i = ii; i < iimax; ++i) {
                    for (int k = kk; k < kkmax; ++k) {
                        double aik = A[i*(size_t)K + k];
                        const double *brow = &B[k*(size_t)N + jj];
                        double *crow = &C[i*(size_t)N + jj];
                        // This inner loop can now be vectorized by compiler
                        for (int j = 0; j < (jjmax - jj); ++j) {
                            crow[j] += aik * brow[j];
                        }
                    }
                }
            }
        }
    }
    return true;
}

static size_t extra_blocked(int M, int N, int K, int threads) {
    (void)M; (void)N; (void)K; (void)threads; return 0; // no extra buffers here
}

static bool alg_gcd_mt(const double *A, const double *B, double *C, int M, int N, int K, int threads) {
    // Use blocking within parallel regions + better work distribution
    const int BS = 64;  // block size for inner computation
    int tile = 128;     // increase rows per task to reduce overhead
    if (M < 512) tile = 32;  // smaller tiles for smaller matrices
    
    int tasks = (M + tile - 1) / tile;
    dispatch_queue_t q = dispatch_get_global_queue(QOS_CLASS_USER_INITIATED, 0);
    
    // Optional: cap concurrency if threads parameter is specified
    dispatch_semaphore_t sem = NULL;
    if (threads > 0) {
        sem = dispatch_semaphore_create(threads);
    }
    
    dispatch_apply(tasks, q, ^(size_t t){
        if (sem) dispatch_semaphore_wait(sem, DISPATCH_TIME_FOREVER);
        
        int i0 = (int)(t * tile);
        int i1 = i0 + tile; if (i1 > M) i1 = M;
        
        // Apply blocking within each parallel task
        for (int kk = 0; kk < K; kk += BS) {
            int kkmax = kk + BS; if (kkmax > K) kkmax = K;
            for (int jj = 0; jj < N; jj += BS) {
                int jjmax = jj + BS; if (jjmax > N) jjmax = N;
                for (int i = i0; i < i1; ++i) {
                    for (int k = kk; k < kkmax; ++k) {
                        double aik = A[i*(size_t)K + k];
                        const double *brow = &B[k*(size_t)N + jj];
                        double *crow = &C[i*(size_t)N + jj];
                        // Vectorizable inner loop
                        for (int j = 0; j < (jjmax - jj); ++j) {
                            crow[j] += aik * brow[j];
                        }
                    }
                }
            }
        }
        
        if (sem) dispatch_semaphore_signal(sem);
    });
    
    return true;
}

static size_t extra_gcd(int M, int N, int K, int threads) {
    (void)M; (void)N; (void)K; (void)threads; return 0;
}

#ifdef USE_ACCELERATE
static bool alg_accelerate(const double *A, const double *B, double *C, int M, int N, int K, int threads) {
    (void)threads;
    const double alpha = 1.0, beta = 1.0; // C = alpha*A*B + beta*C
    // Row-major to column-major: use CBLAS with appropriate transposition flags
    // Our A (MxK), B (KxN), C (MxN) in row-major; call cblas_dgemm with CBLAS_ORDER = CblasRowMajor
    cblas_dgemm(CblasRowMajor, CblasNoTrans, CblasNoTrans,
                M, N, K, alpha, A, K, B, N, beta, C, N);
    return true;
}
static size_t extra_accel(int M, int N, int K, int threads) { (void)M; (void)N; (void)K; (void)threads; return 0; }
#else
static bool alg_accelerate(const double *A, const double *B, double *C, int M, int N, int K, int threads) {
    (void)A; (void)B; (void)C; (void)M; (void)N; (void)K; (void)threads; return false;
}
static size_t extra_accel(int M, int N, int K, int threads) { (void)M; (void)N; (void)K; (void)threads; return 0; }
#endif

#ifndef SKIP_METAL
// Metal backend is provided in a separate file when USE_METAL is defined.
// We declare a weak symbol here; if not linked, we'll detect at runtime.
__attribute__((weak)) bool metal_gemm_f32(const float *A, const float *B, float *C, int M, int N, int K);

static bool alg_metal(const double *A, const double *B, double *C, int M, int N, int K, int threads) {
    (void)threads;
    if (!metal_gemm_f32) return false;
    size_t Asz = (size_t)M * (size_t)K;
    size_t Bsz = (size_t)K * (size_t)N;
    size_t Csz = (size_t)M * (size_t)N;
    float *Af = (float*)malloc(Asz * sizeof(float));
    float *Bf = (float*)malloc(Bsz * sizeof(float));
    float *Cf = (float*)calloc(Csz, sizeof(float));
    if (!Af || !Bf || !Cf) { free(Af); free(Bf); free(Cf); return false; }
    for (size_t i = 0; i < Asz; ++i) Af[i] = (float)A[i];
    for (size_t i = 0; i < Bsz; ++i) Bf[i] = (float)B[i];
    bool ok = metal_gemm_f32(Af, Bf, Cf, M, N, K);
    if (ok) {
        for (size_t i = 0; i < Csz; ++i) C[i] += (double)Cf[i];
    }
    free(Af); free(Bf); free(Cf);
    return ok;
}

static size_t extra_metal(int M, int N, int K, int threads) {
    (void)threads;
    // Host staging buffers (float) + device buffers (not directly measurable here): estimate staging only
    return ((size_t)M*K + (size_t)K*N + (size_t)M*N) * sizeof(float);
}
#else
static bool alg_metal(const double *A, const double *B, double *C, int M, int N, int K, int threads) {
    (void)A; (void)B; (void)C; (void)M; (void)N; (void)K; (void)threads; return false;
}
static size_t extra_metal(int M, int N, int K, int threads) { (void)M; (void)N; (void)K; (void)threads; return 0; }
#endif

// ---------- Registry ----------

static const algo_t ALGOS_ALL[] = {
    {"naive", ALG_NAIVE, alg_naive, ops_gemm_classic, extra_naive},
    {"blocked", ALG_BLOCKED, alg_blocked, ops_gemm_classic, extra_blocked},
    {"gcd_mt", ALG_GCD_MT, alg_gcd_mt, ops_gemm_classic, extra_gcd},
    {"accelerate", ALG_ACCELERATE, alg_accelerate, ops_gemm_classic, extra_accel},
    {"metal", ALG_METAL, alg_metal, ops_gemm_classic, extra_metal}
};

const algo_t *algorithms_list(size_t *count) {
    if (count) *count = sizeof(ALGOS_ALL)/sizeof(ALGOS_ALL[0]);
    return ALGOS_ALL;
}

// ---------- Benchmark runner ----------

static double sum_all(const double *c, size_t n) {
    double s = 0.0; for (size_t i = 0; i < n; ++i) s += c[i]; return s;
}

bench_result_t run_benchmark(const algo_t *algo, int M, int N, int K, int runs, int threads) {
    bench_result_t R; memset(&R, 0, sizeof(R));
    R.algo = algo; R.M = M; R.N = N; R.K = K; R.runs = runs; R.threads = threads;

    size_t Asz = (size_t)M * (size_t)K;
    size_t Bsz = (size_t)K * (size_t)N;
    size_t Csz = (size_t)M * (size_t)N;

    R.bytes_abcs = (uint64_t)(Asz + Bsz + Csz) * sizeof(double);
    R.extra_bytes = algo->extra_mem_bytes ? algo->extra_mem_bytes(M, N, K, threads) : 0;
    if (algo->ops) algo->ops(M, N, K, &R.muls, &R.adds);

    R.rss_before = current_rss_bytes();

    double *A = (double*)malloc(Asz * sizeof(double));
    double *B = (double*)malloc(Bsz * sizeof(double));
    double *C = (double*)malloc(Csz * sizeof(double));
    if (!A || !B || !C) {
        fprintf(stderr, "Memory allocation failed (%zu, %zu, %zu doubles)\n", Asz, Bsz, Csz);
        free(A); free(B); free(C);
        return R;
    }

    fill_random(A, Asz);
    fill_random(B, Bsz);

    // Warm-up
    zero_buf(C, Csz);
    (void)algo->fn(A, B, C, M, N, K, threads);

    R.rss_after = current_rss_bytes();

    double total = 0.0, tmin = 1e100;
    double checksum_acc = 0.0;

    for (int r = 0; r < runs; ++r) {
        zero_buf(C, Csz);
        double t0 = now_seconds();
        bool ok = algo->fn(A, B, C, M, N, K, threads);
        double t1 = now_seconds();
        if (!ok) { R.ok = false; break; }
        double dt = t1 - t0;
        total += dt;
        if (dt < tmin) tmin = dt;
        checksum_acc += sum_all(C, Csz);
        R.ok = true;
    }

    R.wall_time_s = (runs > 0) ? total / runs : 0.0;
    R.min_time_s = (runs > 0) ? tmin : 0.0;
    double tot_flops = (double)(R.muls + R.adds);
    R.gflops = (R.wall_time_s > 0.0) ? (tot_flops / R.wall_time_s / 1e9) : 0.0;
    R.checksum = checksum_acc;

    free(A); free(B); free(C);
    return R;
}

// ---------- CLI ----------

static void print_usage(const char *prog) {
    fprintf(stderr,
        "Usage: %s [--algo name] [--M n] [--N n] [--K n] [--runs r] [--threads t] [--json] [--save file]\n\n"
        "Algorithms: naive, blocked, gcd_mt, accelerate, metal (if built)\n",
        prog);
}

static const algo_t *find_algo_by_name(const char *name) {
    size_t cnt; const algo_t *A = algorithms_list(&cnt);
    for (size_t i = 0; i < cnt; ++i) if (strcmp(A[i].name, name) == 0) return &A[i];
    return NULL;
}

static void print_result(const bench_result_t *R, bool json, FILE *out) {
    if (json) {
        fprintf(out,
            "{\"algo\":\"%s\",\"M\":%d,\"N\":%d,\"K\":%d,\"runs\":%d,\"threads\":%d,"
            "\"avg_s\":%.9f,\"min_s\":%.9f,\"muls\":%llu,\"adds\":%llu,\"gflops\":%.4f,"
            "\"bytes_abcs\":%llu,\"extra_bytes\":%llu,\"rss_before\":%llu,\"rss_after\":%llu,\"checksum\":%.6e,\"ok\":%s}\n",
            R->algo->name, R->M, R->N, R->K, R->runs, R->threads,
            R->wall_time_s, R->min_time_s, R->muls, R->adds, R->gflops,
            (unsigned long long)R->bytes_abcs, (unsigned long long)R->extra_bytes,
            (unsigned long long)R->rss_before, (unsigned long long)R->rss_after,
            R->checksum, R->ok ? "true" : "false");
    } else {
        fprintf(out,
            "Algorithm: %s\nSize: %dx% d * %dx%d\nRuns: %d (threads=%d)\nTime: avg %.6fs (min %.6fs)\nOps: muls %llu, adds %llu\nGFLOPS: %.2f\nMemory: A+B+C %llu bytes, extra %llu bytes\nRSS: before %llu bytes, after %llu bytes\nChecksum: %.6e\n%s\n",
            R->algo->name, R->M, R->K, R->K, R->N,
            R->runs, R->threads,
            R->wall_time_s, R->min_time_s, R->muls, R->adds, R->gflops,
            (unsigned long long)R->bytes_abcs, (unsigned long long)R->extra_bytes,
            (unsigned long long)R->rss_before, (unsigned long long)R->rss_after,
            R->checksum, R->ok ? "OK" : "FAILED");
    }
}

int main(int argc, char **argv) {
    const char *algo_name = "naive";
    int M = 1024, N = 1024, K = 1024;
    int runs = 5;
    int threads = 0; // auto
    bool json = false;
    const char *save_file = NULL;

    for (int i = 1; i < argc; ++i) {
        if (!strcmp(argv[i], "--algo") && i+1 < argc) { algo_name = argv[++i]; }
        else if (!strcmp(argv[i], "--M") && i+1 < argc) { M = atoi(argv[++i]); }
        else if (!strcmp(argv[i], "--N") && i+1 < argc) { N = atoi(argv[++i]); }
        else if (!strcmp(argv[i], "--K") && i+1 < argc) { K = atoi(argv[++i]); }
        else if (!strcmp(argv[i], "--runs") && i+1 < argc) { runs = atoi(argv[++i]); }
        else if (!strcmp(argv[i], "--threads") && i+1 < argc) { threads = atoi(argv[++i]); }
        else if (!strcmp(argv[i], "--json")) { json = true; }
        else if (!strcmp(argv[i], "--save") && i+1 < argc) { save_file = argv[++i]; }
        else if (!strcmp(argv[i], "-h") || !strcmp(argv[i], "--help")) { print_usage(argv[0]); return 0; }
        else { fprintf(stderr, "Unknown arg: %s\n", argv[i]); print_usage(argv[0]); return 1; }
    }

    const algo_t *algo = find_algo_by_name(algo_name);
    if (!algo) {
        fprintf(stderr, "Unknown algorithm '%s'\n", algo_name);
        size_t cnt; const algo_t *A = algorithms_list(&cnt);
        fprintf(stderr, "Available: ");
        for (size_t i = 0; i < cnt; ++i) fprintf(stderr, "%s%s", A[i].name, (i+1<cnt)?", ":"\n");
        return 2;
    }

    srand((unsigned)time(NULL));

    bench_result_t R = run_benchmark(algo, M, N, K, runs, threads);
    if (save_file) {
        FILE *f = fopen(save_file, "a");
        if (f) { print_result(&R, json, f); fclose(f); }
        else { perror("open save file"); }
    }
    print_result(&R, json, stdout);

    return R.ok ? 0 : 3;
}
