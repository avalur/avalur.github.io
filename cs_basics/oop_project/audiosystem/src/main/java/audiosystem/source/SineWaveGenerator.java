package audiosystem.source;

/**
 * SineWaveGenerator — produces a mathematically perfect sine wave as 16-bit PCM audio.
 *
 * <p>Useful for testing audio processors without needing actual audio files or hardware.
 * You can verify processor correctness mathematically: e.g., doubling volume should
 * double every sample value (before clipping).</p>
 *
 * <p>Generated audio format: 16-bit signed, little-endian, mono, 44100 Hz.</p>
 *
 * <p>Example usage:</p>
 * <pre>{@code
 * // Generate 2 seconds of concert A (440 Hz)
 * SineWaveGenerator gen = new SineWaveGenerator(440.0, 2.0);
 * byte[] audioData = gen.generate();
 *
 * // Generate a quiet tone (amplitude 0.0 to 1.0)
 * SineWaveGenerator quietGen = new SineWaveGenerator(440.0, 1.0, 0.3);
 * byte[] quietAudio = quietGen.generate();
 * }</pre>
 *
 * <p>Common test frequencies:</p>
 * <ul>
 *   <li>261.63 Hz — Middle C (C4)</li>
 *   <li>440.00 Hz — Concert A (A4)</li>
 *   <li>1000.0 Hz — Standard test tone</li>
 * </ul>
 */
public class SineWaveGenerator {

    /** Standard CD-quality sample rate. */
    public static final int SAMPLE_RATE = 44100;

    private final double frequency;
    private final double durationSeconds;
    private final double amplitude;

    /**
     * Creates a sine wave generator with full amplitude.
     *
     * @param frequency       tone frequency in Hz (e.g., 440.0 for concert A)
     * @param durationSeconds duration of the generated audio in seconds
     */
    public SineWaveGenerator(double frequency, double durationSeconds) {
        this(frequency, durationSeconds, 1.0);
    }

    /**
     * Creates a sine wave generator with configurable amplitude.
     *
     * @param frequency       tone frequency in Hz
     * @param durationSeconds duration in seconds
     * @param amplitude       amplitude from 0.0 (silence) to 1.0 (maximum)
     */
    public SineWaveGenerator(double frequency, double durationSeconds, double amplitude) {
        if (frequency <= 0) throw new IllegalArgumentException("Frequency must be positive");
        if (durationSeconds <= 0) throw new IllegalArgumentException("Duration must be positive");
        if (amplitude < 0 || amplitude > 1) throw new IllegalArgumentException("Amplitude must be 0.0 to 1.0");

        this.frequency = frequency;
        this.durationSeconds = durationSeconds;
        this.amplitude = amplitude;
    }

    /**
     * Generates the sine wave as a 16-bit signed little-endian PCM byte array.
     *
     * @return byte array containing the audio data (2 bytes per sample, mono)
     */
    public byte[] generate() {
        int totalSamples = (int) (SAMPLE_RATE * durationSeconds);
        byte[] data = new byte[totalSamples * 2]; // 2 bytes per 16-bit sample

        for (int i = 0; i < totalSamples; i++) {
            // Generate sine wave sample
            double t = (double) i / SAMPLE_RATE;
            double sineValue = Math.sin(2.0 * Math.PI * frequency * t);

            // Scale to 16-bit range with amplitude control
            int sample = (int) (sineValue * Short.MAX_VALUE * amplitude);

            // Write as little-endian 16-bit
            data[2 * i]     = (byte) (sample & 0xFF);
            data[2 * i + 1] = (byte) ((sample >> 8) & 0xFF);
        }

        return data;
    }

    /**
     * Generates a single buffer of audio data (useful for streaming).
     *
     * @param numSamples  number of samples to generate
     * @param startSample the sample index to start from (for continuity)
     * @return byte array containing the audio data
     */
    public byte[] generateBuffer(int numSamples, long startSample) {
        byte[] data = new byte[numSamples * 2];

        for (int i = 0; i < numSamples; i++) {
            double t = (double) (startSample + i) / SAMPLE_RATE;
            double sineValue = Math.sin(2.0 * Math.PI * frequency * t);
            int sample = (int) (sineValue * Short.MAX_VALUE * amplitude);

            data[2 * i]     = (byte) (sample & 0xFF);
            data[2 * i + 1] = (byte) ((sample >> 8) & 0xFF);
        }

        return data;
    }

    public double getFrequency() { return frequency; }
    public double getDurationSeconds() { return durationSeconds; }
    public double getAmplitude() { return amplitude; }
}
