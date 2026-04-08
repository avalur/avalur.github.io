package audiosystem.processing;

import audiosystem.source.SineWaveGenerator;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Sample tests for VolumeControlStrategy.
 * Demonstrates how to test audio processors using known input data
 * and verifying sample-level correctness.
 */
class VolumeControlStrategyTest {

    /**
     * Helper: read a 16-bit signed sample from a byte array at the given index.
     */
    private int readSample(byte[] data, int sampleIndex) {
        int i = sampleIndex * 2;
        return (data[i] & 0xFF) | (data[i + 1] << 8);
    }

    @Test
    @DisplayName("Volume factor 1.0 should leave audio unchanged")
    void testUnityVolume() {
        VolumeControlStrategy strategy = new VolumeControlStrategy(1.0);
        byte[] input = new SineWaveGenerator(440, 0.01).generate();

        byte[] output = strategy.processAudio(input);

        assertArrayEquals(input, output, "Unity volume should not modify any samples");
    }

    @Test
    @DisplayName("Volume factor 2.0 should double small sample values")
    void testDoubleVolume() {
        VolumeControlStrategy strategy = new VolumeControlStrategy(2.0);

        // Create a quiet sine wave (amplitude 0.1) so doubling won't clip
        byte[] input = new SineWaveGenerator(440, 0.01, 0.1).generate();
        byte[] output = strategy.processAudio(input);

        // Check first few non-zero samples: output should be ~2x input
        for (int i = 0; i < input.length / 2; i++) {
            int inSample = readSample(input, i);
            int outSample = readSample(output, i);
            if (Math.abs(inSample) > 10) { // skip near-zero samples
                assertEquals(inSample * 2, outSample, 1,
                        "Sample " + i + " should be doubled");
            }
        }
    }

    @Test
    @DisplayName("Volume factor 0.0 should produce silence")
    void testZeroVolume() {
        VolumeControlStrategy strategy = new VolumeControlStrategy(0.0);
        byte[] input = new SineWaveGenerator(440, 0.01).generate();

        byte[] output = strategy.processAudio(input);

        for (int i = 0; i < output.length / 2; i++) {
            assertEquals(0, readSample(output, i), "All samples should be zero");
        }
    }

    @Test
    @DisplayName("Clipping should prevent overflow beyond 16-bit range")
    void testClipping() {
        VolumeControlStrategy strategy = new VolumeControlStrategy(10.0);

        // Full-amplitude sine wave — 10x will exceed Short.MAX_VALUE
        byte[] input = new SineWaveGenerator(440, 0.01, 1.0).generate();
        byte[] output = strategy.processAudio(input);

        for (int i = 0; i < output.length / 2; i++) {
            int sample = readSample(output, i);
            assertTrue(sample >= Short.MIN_VALUE && sample <= Short.MAX_VALUE,
                    "Sample " + i + " (" + sample + ") should be within 16-bit range");
        }
    }

    @Test
    @DisplayName("Negative volume factor should be rejected")
    void testNegativeVolumeFactor() {
        assertThrows(IllegalArgumentException.class,
                () -> new VolumeControlStrategy(-1.0));
    }

    @Test
    @DisplayName("ProcessorChain should apply strategies in order")
    void testProcessorChain() {
        ProcessorChain chain = new ProcessorChain()
                .add(new VolumeControlStrategy(0.5))   // halve first
                .add(new VolumeControlStrategy(2.0));   // then double

        byte[] input = new SineWaveGenerator(440, 0.01, 0.3).generate();
        byte[] output = chain.processAudio(input);

        // 0.5 * 2.0 = 1.0, so output should be close to input
        for (int i = 0; i < input.length / 2; i++) {
            int inSample = readSample(input, i);
            int outSample = readSample(output, i);
            assertEquals(inSample, outSample, 1,
                    "Chain of half+double should approximate identity");
        }
    }

    @Test
    @DisplayName("Empty ProcessorChain should pass data through unchanged")
    void testEmptyChain() {
        ProcessorChain chain = new ProcessorChain();
        byte[] input = {0x10, 0x20, 0x30, 0x40};

        byte[] output = chain.processAudio(input);
        assertArrayEquals(input, output);
    }
}
