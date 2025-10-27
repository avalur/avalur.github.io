#! /usr/bin/env python3
import numpy as np
import time
import argparse
from datetime import datetime


def get_flops(M, N, K):
    """Calculate number of floating point operations for matrix multiplication."""
    # Each element requires one multiplication and one addition per iteration
    return M * N * K * 2


def measure_performance(M, N, K, num_runs=100):
    """Measure TFLOPS for matrix multiplication."""
    A = np.random.rand(M, K).astype(np.float64)
    B = np.random.rand(K, N).astype(np.float64)

    # Warm-up run
    _ = np.matmul(A, B)

    times = []
    for _ in range(num_runs):
        start = time.perf_counter()
        _ = np.matmul(A, B)
        end = time.perf_counter()
        times.append(end - start)

    avg_time = sum(times) / len(times)
    flops = get_flops(M, N, K)
    tflops = flops / (avg_time * 1e12)  # Convert to TFLOPS

    return tflops


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Matrix multiplication benchmark")
    parser.add_argument("--save", "-s", action="store_true", 
                       help="Save results to file (benchmark_results.txt)")
    args = parser.parse_args()
    
    sizes = [(1000, 1000, 1000), (2000, 2000, 2000), (4000, 4000, 4000)]
    
    # Get comment if saving to file
    comment = None
    if args.save:
        comment = "Enter a short comment for this run "
    
    # Open file in append mode if saving
    file_handle = None
    if args.save:
        file_handle = open("benchmark_results.txt", "a")
        file_handle.write(f"\n--- Benchmark Run: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')} ---\n")
        file_handle.write(f"Comment: {comment}\n")
        file_handle.write("-" * 50 + "\n")
    
    try:
        for M, N, K in sizes:
            tflops = measure_performance(M, N, K)
            result_line = f"Matrix size: {M}x{K} * {K}x{N}, Performance: {tflops:.2f} TFLOPS"
            
            # Print to console
            print(f"Matrix size: {M}x{K} * {K}x{N}")
            print(f"Performance: {tflops:.2f} TFLOPS")
            print("-" * 40)
            
            # Write to file if enabled
            if file_handle:
                file_handle.write(result_line + "\n")
        
        if file_handle:
            file_handle.write("\n")  # Add blank line after this run
            print(f"\nResults saved to benchmark_results.txt")
    
    finally:
        if file_handle:
            file_handle.close()
