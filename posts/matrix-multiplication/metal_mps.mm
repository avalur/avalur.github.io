#import <Foundation/Foundation.h>
#import <Metal/Metal.h>
#import <MetalPerformanceShaders/MetalPerformanceShaders.h>

extern "C" bool metal_gemm_f32(const float *A, const float *B, float *C, int M, int N, int K) {
    @autoreleasepool {
        id<MTLDevice> device = MTLCreateSystemDefaultDevice();
        if (!device) return false;
        if (!MPSSupportsMTLDevice(device)) return false;
        id<MTLCommandQueue> queue = [device newCommandQueue];
        if (!queue) return false;

        // Create buffers
        size_t aCount = (size_t)M * (size_t)K;
        size_t bCount = (size_t)K * (size_t)N;
        size_t cCount = (size_t)M * (size_t)N;
        id<MTLBuffer> Abuf = [device newBufferWithBytes:A length:aCount*sizeof(float) options:MTLResourceStorageModeShared];
        id<MTLBuffer> Bbuf = [device newBufferWithBytes:B length:bCount*sizeof(float) options:MTLResourceStorageModeShared];
        id<MTLBuffer> Cbuf = [device newBufferWithLength:cCount*sizeof(float) options:MTLResourceStorageModeShared];
        if (!Abuf || !Bbuf || !Cbuf) return false;

        // Describe matrices (row-major): MPSMatrix assumes row-major with rowBytes stride
        NSUInteger aRowBytes = K * sizeof(float);
        NSUInteger bRowBytes = N * sizeof(float);
        NSUInteger cRowBytes = N * sizeof(float);
        MPSMatrixDescriptor *Adesc = [MPSMatrixDescriptor matrixDescriptorWithRows:M columns:K rowBytes:aRowBytes dataType:MPSDataTypeFloat32];
        MPSMatrixDescriptor *Bdesc = [MPSMatrixDescriptor matrixDescriptorWithRows:K columns:N rowBytes:bRowBytes dataType:MPSDataTypeFloat32];
        MPSMatrixDescriptor *Cdesc = [MPSMatrixDescriptor matrixDescriptorWithRows:M columns:N rowBytes:cRowBytes dataType:MPSDataTypeFloat32];
        MPSMatrix *Amat = [[MPSMatrix alloc] initWithBuffer:Abuf descriptor:Adesc];
        MPSMatrix *Bmat = [[MPSMatrix alloc] initWithBuffer:Bbuf descriptor:Bdesc];
        MPSMatrix *Cmat = [[MPSMatrix alloc] initWithBuffer:Cbuf descriptor:Cdesc];

        double alpha = 1.0, beta = 0.0; // C = alpha*A*B + beta*C
        MPSMatrixMultiplication *mm = [[MPSMatrixMultiplication alloc] initWithDevice:device transposeLeft:false transposeRight:false resultRows:M resultColumns:N interiorColumns:K alpha:alpha beta:beta];

        id<MTLCommandBuffer> cb = [queue commandBuffer];
        if (!cb) return false;
        [mm encodeToCommandBuffer:cb leftMatrix:Amat rightMatrix:Bmat resultMatrix:Cmat];
        [cb commit];
        [cb waitUntilCompleted];

        // Copy result
        memcpy(C, Cbuf.contents, cCount*sizeof(float));
        return true;
    }
}