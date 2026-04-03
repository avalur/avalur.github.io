package audiosystem.config;

import audiosystem.channel.Channel;
import audiosystem.channel.ObservableChannel;
import audiosystem.processing.AudioProcessingContext;
import audiosystem.processing.VolumeControlStrategy;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Spring configuration for the Audio Processing System.
 *
 * <p>Defines beans for core components. Students should extend this
 * with their own beans (sources, sinks, processors, pipelines).</p>
 */
@Configuration
public class AudioSystemConfig {

    @Value("${audiosystem.channel.buffer-size:1000}")
    private int channelBufferSize;

    @Value("${audiosystem.audio.sample-rate:44100}")
    private int sampleRate;

    @Value("${audiosystem.audio.channels:1}")
    private int numChannels;

    @Value("${audiosystem.audio.bits-per-sample:16}")
    private int bitsPerSample;

    @Bean
    public Channel inputChannel() {
        return new Channel(channelBufferSize);
    }

    @Bean
    public ObservableChannel outputChannel() {
        return new ObservableChannel(channelBufferSize);
    }

    @Bean
    public AudioProcessingContext defaultProcessingContext() {
        AudioProcessingContext context = new AudioProcessingContext();
        context.setStrategy(new VolumeControlStrategy(1.0)); // unity = pass-through
        return context;
    }

    // TODO: Students should add beans for their sources, sinks, and processors.
    // Example:
    //
    // @Bean
    // public ProcessorChain mainProcessorChain() {
    //     return new ProcessorChain()
    //         .add(new NoiseGateStrategy(500))
    //         .add(new VolumeControlStrategy(1.2));
    // }
}
