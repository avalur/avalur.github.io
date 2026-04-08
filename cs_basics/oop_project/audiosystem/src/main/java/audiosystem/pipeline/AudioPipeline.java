package audiosystem.pipeline;

import audiosystem.channel.Channel;
import audiosystem.processing.AudioProcessingStrategy;
import audiosystem.util.SystemLogger;

import java.util.ArrayList;
import java.util.List;

/**
 * AudioPipeline — Builder-pattern implementation for composing audio pipelines.
 *
 * <p>Provides a fluent API for declarative pipeline construction:</p>
 * <pre>{@code
 * Pipeline pipeline = AudioPipeline.builder()
 *     .source(wavFileReader)
 *     .inputChannel(inputChannel)
 *     .processor(volumeControl)
 *     .outputChannel(outputChannel)
 *     .sink(speakerConsumer)
 *     .build();
 *
 * pipeline.start();
 * }</pre>
 *
 * <p><b>TODO for students:</b> Complete this implementation:</p>
 * <ul>
 *   <li>The {@code start()} method should launch sources and sinks in separate threads</li>
 *   <li>The {@code stop()} method should signal all threads to terminate and wait for them</li>
 *   <li>Handle errors gracefully (e.g., source runs out of data, sink fails to write)</li>
 *   <li>Consider using {@link java.util.concurrent.ExecutorService} for thread management</li>
 * </ul>
 */
public class AudioPipeline implements Pipeline {

    private final List<Runnable> sourceRunnables;
    private final List<Runnable> sinkRunnables;
    private final List<Channel> channels;
    private final List<AudioProcessingStrategy> processors;
    private volatile boolean running = false;

    private AudioPipeline(Builder builder) {
        this.sourceRunnables = List.copyOf(builder.sourceRunnables);
        this.sinkRunnables = List.copyOf(builder.sinkRunnables);
        this.channels = List.copyOf(builder.channels);
        this.processors = List.copyOf(builder.processors);
    }

    /**
     * Creates a new pipeline builder.
     */
    public static Builder builder() {
        return new Builder();
    }

    @Override
    public void start() {
        if (running) {
            throw new IllegalStateException("Pipeline is already running");
        }
        running = true;
        SystemLogger.logInfo("Pipeline started with "
                + sourceRunnables.size() + " source(s), "
                + processors.size() + " processor(s), "
                + sinkRunnables.size() + " sink(s)");

        // TODO: Students should implement thread management here.
        // Hint: use ExecutorService to launch source and sink runnables in separate threads.
        // Each source reads data and puts it into a channel.
        // Each sink takes data from a channel and writes it to output.
        // Processors are applied between channels (see AudioProcessorPin for reference).
    }

    @Override
    public void stop() {
        running = false;
        SystemLogger.logInfo("Pipeline stopped");

        // TODO: Students should implement graceful shutdown here.
        // Hint: interrupt threads, close streams, flush channels.
    }

    @Override
    public boolean isRunning() {
        return running;
    }

    // ====================================================================
    // Builder
    // ====================================================================

    public static class Builder {
        private final List<Runnable> sourceRunnables = new ArrayList<>();
        private final List<Runnable> sinkRunnables = new ArrayList<>();
        private final List<Channel> channels = new ArrayList<>();
        private final List<AudioProcessingStrategy> processors = new ArrayList<>();

        private Builder() {}

        /**
         * Adds a source to the pipeline. The Runnable should read audio data
         * and put it into a channel.
         */
        public Builder source(Runnable sourceRunnable) {
            sourceRunnables.add(sourceRunnable);
            return this;
        }

        /**
         * Adds a channel to the pipeline for data flow between components.
         */
        public Builder channel(Channel channel) {
            channels.add(channel);
            return this;
        }

        /**
         * Adds a processor to the pipeline.
         */
        public Builder processor(AudioProcessingStrategy processor) {
            processors.add(processor);
            return this;
        }

        /**
         * Adds a sink to the pipeline. The Runnable should take audio data
         * from a channel and write it to output.
         */
        public Builder sink(Runnable sinkRunnable) {
            sinkRunnables.add(sinkRunnable);
            return this;
        }

        /**
         * Builds and returns the configured pipeline.
         *
         * @throws IllegalStateException if no sources or sinks are configured
         */
        public AudioPipeline build() {
            if (sourceRunnables.isEmpty()) {
                throw new IllegalStateException("Pipeline must have at least one source");
            }
            if (sinkRunnables.isEmpty()) {
                throw new IllegalStateException("Pipeline must have at least one sink");
            }
            return new AudioPipeline(this);
        }
    }
}
