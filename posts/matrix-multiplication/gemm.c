#include <stdio.h>
#include <stdlib.h>
#include <time.h>
#include <string.h>
#include <stdbool.h>
#include <unistd.h>
#include <math.h>

#include <mach/mach_time.h>


// Function to get current time in seconds with high precision
double get_time() {
    static mach_timebase_info_data_t timebase_info;
    static bool timebase_initialized = false;

    if (!timebase_initialized) {
        mach_timebase_info(&timebase_info);
        timebase_initialized = true;
    }

    uint64_t time = mach_absolute_time();
    return (double)time * timebase_info.numer / timebase_info.denom / 1e9;
}

// Calculate number of floating point operations for matrix multiplication
long long get_flops(int M, int N, int K) {
    return (long long)M * N * K * 2;
}

// classical approach with inner loop for B-matrix
void matrix_multiply(double *A, double *B, double *C, int M, int N, int K) {
    for (int i = 0; i < M; i++) {
        for (int k = 0; k < K; k++) {
            for (int j = 0; j < N; j++) {
                C[i * N + j] += A[i * K + k] * B[k * N + j];
            }
        }
    }
}


// Initialize matrix with random values
void init_random_matrix(double *matrix, int rows, int cols) {
    for (int i = 0; i < rows * cols; i++) {
        matrix[i] = (double)rand() / RAND_MAX;
    }
}

// Add this function to prevent optimization
double checksum(double *matrix, int size) {
    double sum = 0.0;
    for (int i = 0; i < size; i++) {
        sum += matrix[i];
    }
    return sum;
}

// Measure FLOPS for matrix multiplication
double measure_performance(int M, int N, int K, int num_runs) {
    // Allocate matrices
    double *A = malloc(M * K * sizeof(double));
    double *B = malloc(K * N * sizeof(double));
    double *C = malloc(M * N * sizeof(double));

    if (!A || !B || !C) {
        fprintf(stderr, "Memory allocation failed\n");
        exit(1);
    }

    // Initialize with random values
    init_random_matrix(A, M, K);
    init_random_matrix(B, K, N);

    // Warm-up run
    matrix_multiply(A, B, C, M, N, K);

    double total_time = 0.0;
    double dummy_sum = 0.0; // Prevent optimization

    for (int run = 0; run < num_runs; run++) {
        double start = get_time();
        matrix_multiply(A, B, C, M, N, K);
        double end = get_time();
        total_time += (end - start);

        // Use the result to prevent optimization
        dummy_sum += checksum(C, M * N);
    }

    // Use dummy_sum to ensure it's not optimized away
    if (dummy_sum < 0) printf("Unexpected negative sum\n");

    double avg_time = total_time / num_runs;
    if (avg_time <= 0.0) {
        fprintf(stderr, "avg_time <= 0 (avg=%.12f). Timing broken.\n", avg_time);
        avg_time = 1e-12; // avoid divide-by-zero, still flag issue
    }

    long long flops = get_flops(M, N, K);
    double gflops = (double) flops / (avg_time * 1e9);
//    printf("FLOPS: %lld\n", flops);
//    printf("AVG TIME: %.2f\n", avg_time * 1e12);
//    printf("TFLOPS: %.4f\n", tflops);

    // Clean up
    free(A);
    free(B);
    free(C);

    return gflops;
}

void print_usage(const char *program_name) {
    printf("Usage: %s [OPTIONS]\n", program_name);
    printf("Options:\n");
    printf("  -s, --save    Save results to file (benchmark_results.txt)\n");
    printf("  -h, --help    Show this help message\n");
}

int main(int argc, char *argv[]) {
    bool save_results = false;

    // Parse command line arguments
    for (int i = 1; i < argc; i++) {
        if (strcmp(argv[i], "-s") == 0 || strcmp(argv[i], "--save") == 0) {
            save_results = true;
        } else if (strcmp(argv[i], "-h") == 0 || strcmp(argv[i], "--help") == 0) {
            print_usage(argv[0]);
            return 0;
        } else {
            printf("Unknown option: %s\n", argv[i]);
            print_usage(argv[0]);
            return 1;
        }
    }

    // Seed random number generator
    srand(time(NULL));

    // Define test sizes
    int sizes[][3] = {
        {1000, 1000, 1000},
        {2000, 2000, 2000},
        {4000, 4000, 4000}
    };
    int num_sizes = sizeof(sizes) / sizeof(sizes[0]);

    FILE *file_handle = NULL;
    char comment[256] = "";

    // Open file if saving results
    if (save_results) {
        printf("Enter a short comment for this run: ");
        if (fgets(comment, sizeof(comment), stdin)) {
            // Remove newline if present
            char *newline = strchr(comment, '\n');
            if (newline) *newline = '\0';
        }

        file_handle = fopen("benchmark_results.txt", "a");
        if (!file_handle) {
            fprintf(stderr, "Failed to open benchmark_results.txt\n");
            return 1;
        }

        // Get current time
        time_t now = time(NULL);
        struct tm *tm_info = localtime(&now);
        char time_str[64];
        strftime(time_str, sizeof(time_str), "%Y-%m-%d %H:%M:%S", tm_info);

        fprintf(file_handle, "\n--- Benchmark Run: %s ---\n", time_str);
        fprintf(file_handle, "Comment: %s\n", comment);
        fprintf(file_handle, "==================================================\n");
    }

    // Run benchmarks
    for (int i = 0; i < num_sizes; i++) {
        int M = sizes[i][0];
        int N = sizes[i][1];
        int K = sizes[i][2];

        printf("Running benchmark for matrix size: %dx%d * %dx%d...\n", M, K, K, N);
        double flops = measure_performance(M, N, K, 10); // Reduced runs for C version

        // Print to console
        printf("Matrix size: %dx%d * %dx%d\n", M, K, K, N);
        printf("Performance: %.2f GFLOPS\n", flops);
        printf("========================================\n");

        // Write to file if enabled
        if (file_handle) {
            fprintf(file_handle, "Matrix size: %dx%d * %dx%d, Performance: %.2f FLOPS\n",
                   M, K, K, N, flops);
        }
    }

    if (file_handle) {
        fprintf(file_handle, "\n");
        fclose(file_handle);
        printf("\nResults saved to benchmark_results.txt\n");
    }

    return 0;
}
