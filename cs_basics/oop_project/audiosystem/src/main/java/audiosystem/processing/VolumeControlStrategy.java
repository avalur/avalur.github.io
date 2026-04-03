package audiosystem.processing;

/**
 * VolumeControlStrategy — adjusts audio volume by scaling 16-bit PCM samples.
 *
 * <p>This is a <b>reference implementation</b> showing how to correctly process
 * 16-bit signed little-endian PCM audio. Use it as a template for your own strategies.</p>
 *
 * <h3>How 16-bit PCM works:</h3>
 * <ul>
 *   <li>Each sample is 2 bytes in <b>little-endian</b> order (low byte first)</li>
 *   <li>Sample values range from -32768 to +32767</li>
 *   <li>After scaling, values must be <b>clipped</b> to this range to prevent overflow</li>
 * </ul>
 */
public class VolumeControlStrategy implements AudioProcessingStrategy {

    private final double volumeFactor;

    /**
     * @param volumeFactor multiplier for sample amplitude.
     *                     1.0 = unchanged, 0.5 = half volume, 2.0 = double volume.
     */
    public VolumeControlStrategy(double volumeFactor) {
        if (volumeFactor < 0) {
            throw new IllegalArgumentException("Volume factor must be non-negative, got: " + volumeFactor);
        }
        this.volumeFactor = volumeFactor;
    }

    @Override
    public byte[] processAudio(byte[] inputData) {
        // 16-bit audio: each sample is 2 bytes. Ensure even length.
        int length = inputData.length - (inputData.length % 2);
        byte[] outputData = new byte[inputData.length];

        for (int i = 0; i < length; i += 2) {
            // Read 16-bit signed sample (little-endian: low byte first)
            int sample = (inputData[i] & 0xFF) | (inputData[i + 1] << 8);

            // Scale the sample
            int scaled = (int) (sample * volumeFactor);

            // Clip to 16-bit signed range to prevent overflow/wrap-around
            scaled = Math.max(Short.MIN_VALUE, Math.min(Short.MAX_VALUE, scaled));

            // Write back in little-endian order
            outputData[i]     = (byte) (scaled & 0xFF);
            outputData[i + 1] = (byte) ((scaled >> 8) & 0xFF);
        }

        // Copy any trailing odd byte unchanged
        if (inputData.length % 2 != 0) {
            outputData[inputData.length - 1] = inputData[inputData.length - 1];
        }

        return outputData;
    }

    public double getVolumeFactor() {
        return volumeFactor;
    }
}
