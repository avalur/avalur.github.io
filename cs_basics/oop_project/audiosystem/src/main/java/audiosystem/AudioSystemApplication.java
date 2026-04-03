package audiosystem;

import audiosystem.processing.ProcessorChain;
import audiosystem.processing.VolumeControlStrategy;
import audiosystem.source.SineWaveGenerator;
import audiosystem.util.SystemLogger;
import audiosystem.util.WAVUtils;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import java.io.File;

@SpringBootApplication
public class AudioSystemApplication {

    public static void main(String[] args) {
        SpringApplication.run(AudioSystemApplication.class, args);

        // Quick demo: generate a sine wave, process it, and save as WAV
        demo();
    }

    /**
     * Demonstrates the basic audio processing pipeline:
     * SineWaveGenerator -> ProcessorChain -> WAV file
     */
    private static void demo() {
        try {
            SystemLogger.logInfo("=== Audio Processing System Demo ===");

            // 1. Generate a 2-second 440 Hz sine wave (A4 note)
            SineWaveGenerator generator = new SineWaveGenerator(440.0, 2.0, 0.5);
            byte[] audioData = generator.generate();
            SystemLogger.logInfo("Generated " + audioData.length + " bytes of audio data");

            // 2. Process through a chain of effects
            ProcessorChain chain = new ProcessorChain()
                    .add(new VolumeControlStrategy(1.5));
            // TODO: Add your own processors here, e.g.:
            // .add(new NoiseGateStrategy(500))
            // .add(new MonoToStereoStrategy())

            byte[] processed = chain.processAudio(audioData);
            SystemLogger.logInfo("Processed through " + chain.size() + " processor(s)");

            // 3. Save to WAV file
            File outputFile = new File("demo_output.wav");
            WAVUtils.writeWAV(outputFile, processed,
                    SineWaveGenerator.SAMPLE_RATE, 1, 16);
            SystemLogger.logInfo("Saved to " + outputFile.getAbsolutePath());

            SystemLogger.logInfo("=== Demo complete! ===");
        } catch (Exception e) {
            SystemLogger.logError("Demo failed", e);
        }
    }
}
