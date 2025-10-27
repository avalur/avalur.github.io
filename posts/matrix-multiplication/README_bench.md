### Matrix Multiplication Benchmark (macOS / Apple Silicon)

This benchmark measures:
- arithmetic operation counts (multiplications and additions, theoretical per run)
- wall-clock time (average and minimum)
- memory costs (bytes of matrices A+B+C and estimated extra bytes; also reports RSS before/after)
- performance in GFLOPS
- checksum to prevent dead code elimination

It also provides a pluggable algorithm registry including:
- `naive` — single-thread triple loop (row-major)
- `blocked` — cache-friendly tiling
- `gcd_mt` — CPU multithread via GCD (`dispatch_apply`), tuned for M-series multi-core
- `accelerate` — Apple Accelerate/BLAS backend (`cblas_dgemm`) — highly optimized, multithreaded
- `metal` — GPU backend via Metal Performance Shaders (float32 path); compiled optionally

#### Build
Requires clang on macOS.

```
make naive      # CPU only, minimal dependencies
make accel      # CPU + Accelerate (multithreaded, fastest CPU backend)
make metal      # GPU via Metal/MPS + Accelerate (Objective-C++)
```

Notes:
- `accel` and `metal` require the Accelerate and Metal frameworks present on macOS
- `metal` computes in float32 on GPU for speed and converts to/from double on host

#### Run
```
./bench_naive --algo naive --M 2048 --N 2048 --K 2048 --runs 10 --json --save benchmark_results.txt
./bench_naive --algo blocked --M 4096 --N 4096 --K 4096 --runs 5 --json --save benchmark_results.txt
./bench_naive --algo gcd_mt --M 4096 --N 4096 --K 4096 --threads 4 --runs 5 --json --save benchmark_results.txt
./bench_accel --algo accelerate --M 4096 --N 4096 --K 4096 --runs 5 --json --save benchmark_results.txt
./bench_metal --algo metal --M 4096 --N 4096 --K 4096 --runs 5 --json --save benchmark_results.txt
```

Common flags:
- `--algo {naive|blocked|gcd_mt|accelerate|metal}`
- `--M --N --K` — matrix sizes
- `--runs R` — number of timed runs (warm-up is automatic)
- `--threads T` — hint for multithread algos (currently GCD decides automatically)
- `--json` — JSON lines output (easy to parse)
- `--save path` — append results to file

Sample JSON line:
```
{"algo":"accelerate","M":4096,"N":4096,"K":4096,"runs":3,"threads":0,"avg_s":0.251234567,"min_s":0.242100123,"muls":68719476736,"adds":68719476736,"gflops":547.3,"bytes_abcs":1073741824,"extra_bytes":0,"rss_before":1239040000,"rss_after":2310000000,"checksum":1.234567e+09,"ok":true}
```

#### Operation counts
For classical GEMM with `C = A * B` and `C` zeroed each run, we use the exact theoretical counts:
- multiplications = M * N * K
- additions = M * N * K
These are reported per single run. (Optional instrumentation macros can be added later if you need dynamic counting for new algorithms.)

#### Memory costs
- `bytes_abcs` = bytes for A, B, and C (host, double precision)
- `extra_bytes` = algorithm-specific transient buffers on host (for GPU path, only host staging buffers are counted; device VRAM is not directly measured here)
- `rss_before`/`rss_after` = process Resident Set Size before allocation and after warm-up (from `mach_task_basic_info`)

#### Extending with new algorithms
Add an `algo_t` entry in `bench.c` with:
- an `fn(A,B,C,M,N,K,threads)` implementation writing into C (row-major)
- an `ops(M,N,K,&muls,&adds)` estimator
- an `extra_mem_bytes(M,N,K,threads)` estimator

Then expose it in the `ALGOS_ALL` registry.

#### Compatibility & Notes
- Data layout is row-major double-precision for CPU backends. GPU backend uses float32 internally for MPS and converts
- On M3 (and other Apple Silicon), use `bench_accel` for peak CPU performance. `bench_metal` can utilize the integrated GPU
- For reproducible timings, isolate the machine, set `--runs` sufficiently large, and prefer `min_s` over `avg_s` when reporting peak performance
