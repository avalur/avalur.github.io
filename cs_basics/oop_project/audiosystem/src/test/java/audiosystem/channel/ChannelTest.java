package audiosystem.channel;

import audiosystem.pin.DataPin;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.concurrent.atomic.AtomicInteger;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Sample tests for Channel and ObservableChannel.
 * Use these as a reference for writing your own tests.
 */
class ChannelTest {

    private Channel channel;

    @BeforeEach
    void setUp() {
        channel = new Channel(10);
    }

    @Test
    @DisplayName("addAudioData and takeAudioData should transfer data correctly")
    void testAddAndTakeAudioData() throws InterruptedException {
        byte[] testData = {0x01, 0x02, 0x03, 0x04};
        channel.addAudioData(testData);

        byte[] result = channel.takeAudioData();
        assertArrayEquals(testData, result);
    }

    @Test
    @DisplayName("Subchannel should store and retrieve data independently")
    void testSubchannelOperations() throws InterruptedException {
        channel.addSubchannel("metadata", 5);
        channel.addSubchannelData("metadata", "test-info");

        Object result = channel.takeSubchannelData("metadata");
        assertEquals("test-info", result);
    }

    @Test
    @DisplayName("Accessing non-existent subchannel should throw exception")
    void testNonExistentSubchannel() {
        assertThrows(IllegalArgumentException.class,
                () -> channel.addSubchannelData("missing", "data"));
    }

    @Test
    @DisplayName("ObservableChannel should notify subscribers when data is added")
    void testObservableNotification() throws InterruptedException {
        ObservableChannel observable = new ObservableChannel(10);
        AtomicInteger notificationCount = new AtomicInteger(0);

        DataPin testPin = notificationCount::incrementAndGet;

        observable.subscribe(testPin);
        observable.addAudioData(new byte[]{1, 2});
        observable.addAudioData(new byte[]{3, 4});

        assertEquals(2, notificationCount.get(), "Pin should be notified for each addAudioData call");
    }

    @Test
    @DisplayName("Unsubscribed pin should not receive notifications")
    void testUnsubscribe() throws InterruptedException {
        ObservableChannel observable = new ObservableChannel(10);
        AtomicInteger count = new AtomicInteger(0);

        DataPin pin = count::incrementAndGet;
        observable.subscribe(pin);
        observable.addAudioData(new byte[]{1, 2});

        observable.unsubscribe(pin);
        observable.addAudioData(new byte[]{3, 4});

        assertEquals(1, count.get(), "Pin should not be notified after unsubscribe");
    }
}
