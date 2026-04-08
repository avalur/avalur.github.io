package audiosystem.pipeline;

/**
 * Pipeline interface — represents a complete audio processing pipeline
 * from sources through processors to sinks.
 *
 * <p>A pipeline manages the lifecycle of all its components:
 * starting audio flow, coordinating threads, and graceful shutdown.</p>
 */
public interface Pipeline {

    /**
     * Starts the pipeline. Sources begin producing data, processors start
     * transforming it, and sinks begin consuming results.
     *
     * @throws IllegalStateException if the pipeline is already running
     *         or not properly configured
     */
    void start();

    /**
     * Stops the pipeline gracefully. All components are signaled to stop,
     * remaining data in channels is flushed, and resources are released.
     */
    void stop();

    /**
     * @return true if the pipeline is currently running
     */
    boolean isRunning();
}
