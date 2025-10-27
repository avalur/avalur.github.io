#pragma once
#include <stdbool.h>
#include <stddef.h>
#include <stdint.h>

#ifdef __cplusplus
extern "C" {
#endif

typedef enum {
    ALG_NAIVE = 0,
    ALG_BLOCKED = 1,
    ALG_GCD_MT = 2,
    ALG_ACCELERATE = 3,
    ALG_METAL = 4
} algo_kind_t;

typedef struct {
    const char *name;
    algo_kind_t kind;
    // returns true on success; result written into C (row-major, MxN)
    bool (*fn)(const double *A, const double *B, double *C, int M, int N, int K, int threads);
    // theoretical ops for one GEMM (for the algorithm as implemented)
    void (*ops)(int M, int N, int K, unsigned long long *muls, unsigned long long *adds);
    // extra transient memory used by algorithm (beyond A,B,C), in bytes
    size_t (*extra_mem_bytes)(int M, int N, int K, int threads);
} algo_t;

// Timer utilities

double now_seconds(void);

// Memory usage
// Returns Resident Set Size (RSS) in bytes for current process, or 0 on failure
uint64_t current_rss_bytes(void);

// Initialize matrices
void fill_random(double *a, size_t n);
void zero_buf(double *a, size_t n);

typedef struct {
    const algo_t *algo;
    int M, N, K;
    int runs;
    int threads; // hint for MT algos (0 or <1 means auto)

    // Measurements
    double wall_time_s;        // average per run
    double min_time_s;         // min single-run time
    unsigned long long muls;   // theoretical muls per run
    unsigned long long adds;   // theoretical adds per run
    uint64_t bytes_abcs;       // A+B+C bytes
    uint64_t extra_bytes;      // extra transient bytes estimated
    uint64_t rss_before;       // RSS before allocation
    uint64_t rss_after;        // RSS after allocation, steady state
    double gflops;             // computed as (adds+muls)/1e9 / time
    double checksum;           // sum of C to prevent DCE
    bool ok;                   // algorithm returned success
} bench_result_t;

// Run one benchmark for given algorithm and sizes; allocates and owns A,B,C inside
bench_result_t run_benchmark(const algo_t *algo, int M, int N, int K, int runs, int threads);

// Registry of algorithms available in this build
const algo_t *algorithms_list(size_t *count);

// Metal MPS GEMM (single precision)
bool metal_gemm_f32(const float *A, const float *B, float *C, int M, int N, int K);

#ifdef __cplusplus
}
#endif
