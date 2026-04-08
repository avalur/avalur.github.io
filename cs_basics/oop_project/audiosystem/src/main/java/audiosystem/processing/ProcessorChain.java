package audiosystem.processing;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

/**
 * ProcessorChain — Composite Pattern for chaining multiple audio processors.
 *
 * <p>Applies a sequence of {@link AudioProcessingStrategy} instances in order.
 * This allows building complex audio transformations from simple building blocks.</p>
 *
 * <p>Example usage:</p>
 * <pre>{@code
 * ProcessorChain chain = new ProcessorChain()
 *     .add(new NoiseGateStrategy(500))
 *     .add(new VolumeControlStrategy(1.5))
 *     .add(new MonoToStereoStrategy());
 *
 * byte[] result = chain.processAudio(inputData);
 * }</pre>
 *
 * <p><b>TODO for students:</b> Consider whether the order of processors matters.
 * What happens if you apply volume boost before vs. after noise gate?</p>
 */
public class ProcessorChain implements AudioProcessingStrategy {

    private final List<AudioProcessingStrategy> processors = new ArrayList<>();

    /**
     * Adds a processor to the end of the chain.
     * @return this chain, for fluent API usage
     */
    public ProcessorChain add(AudioProcessingStrategy processor) {
        if (processor == null) {
            throw new IllegalArgumentException("Processor must not be null");
        }
        processors.add(processor);
        return this;
    }

    /**
     * Processes audio data by applying all strategies in sequence.
     * The output of each processor becomes the input of the next.
     *
     * @param inputData raw audio data (16-bit PCM little-endian)
     * @return processed audio data after all strategies have been applied
     */
    @Override
    public byte[] processAudio(byte[] inputData) {
        byte[] data = inputData;
        for (AudioProcessingStrategy processor : processors) {
            data = processor.processAudio(data);
        }
        return data;
    }

    /**
     * @return unmodifiable view of the processors in this chain
     */
    public List<AudioProcessingStrategy> getProcessors() {
        return Collections.unmodifiableList(processors);
    }

    /**
     * @return number of processors in the chain
     */
    public int size() {
        return processors.size();
    }
}
