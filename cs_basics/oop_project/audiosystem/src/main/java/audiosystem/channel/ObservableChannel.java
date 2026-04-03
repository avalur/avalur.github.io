package audiosystem.channel;

import audiosystem.pin.DataPin;
import java.util.ArrayList;

/**
 * ObservableChannel extends the functionality of Channel to become an Observable subject,
 * allowing Pins (Observers) to subscribe for data notifications.
 */
public class ObservableChannel extends Channel {

    private ArrayList<DataPin> subscribers = new ArrayList<>();

    public ObservableChannel(int bufferSize) {
        super(bufferSize);
    }

    public void subscribe(DataPin pin) {
        if (!subscribers.contains(pin)) {
            subscribers.add(pin);
        }
    }

    public void unsubscribe(DataPin pin) {
        subscribers.remove(pin);
    }

    @Override
    public void addAudioData(byte[] data) throws InterruptedException {
        super.addAudioData(data);
        // Notify all subscribers (Pins) that new data is available.
        for (DataPin pin : subscribers) {
            pin.notifyDataAvailable();
        }
    }

    public void notifyDataAvailable() {
        for (DataPin pin : subscribers) {
            pin.notifyDataAvailable();
        }
    }
}
