# Simple Makefile for the matrix multiplication benchmark on macOS
# Requires: clang

CFLAGS   := -O3 -march=armv8.6-a+fp+simd -ffast-math -funroll-loops -Wall -Wextra -I.

SRC      := bench.c
HDR      := bench.h

all: naive

naive: $(SRC) $(HDR)
	clang $(CFLAGS) -std=c11 -DSKIP_METAL $(SRC) -o bench_naive $(LDFLAGS)

accel: $(SRC) $(HDR)
	clang $(CFLAGS) -std=c11 -DUSE_ACCELERATE -DSKIP_METAL $(SRC) -o bench_accel $(LDFLAGS) -framework Accelerate

metal:
	clang++ $(CFLAGS) -DUSE_ACCELERATE -DACCELERATE_NEW_LAPACK -c bench.c -o bench.o
	clang++ $(CFLAGS) -DUSE_ACCELERATE -DACCELERATE_NEW_LAPACK -fobjc-arc -c metal_mps.mm -o metal_mps.o
	clang++ -O3 bench.o metal_mps.o -o bench_metal -framework Accelerate -framework Metal -framework MetalPerformanceShaders -lobjc

clean:
	rm -f bench_naive bench_accel bench_metal

.PHONY: all clean naive accel metal
