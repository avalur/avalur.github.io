package audiosystem.config;

import javafx.application.Application;
import javafx.geometry.Insets;
import javafx.scene.Scene;
import javafx.scene.control.*;
import javafx.scene.layout.*;
import javafx.stage.Stage;

/**
 * ConfigManagerUI — JavaFX application skeleton for the audio processing system.
 *
 * <p><b>TODO for students:</b> Extend this UI to include:</p>
 * <ul>
 *   <li>Source selection (file, microphone, network, generator)</li>
 *   <li>Processor configuration (select processors, adjust parameters)</li>
 *   <li>Sink selection (speakers, file, network)</li>
 *   <li>Start/Stop controls</li>
 *   <li>Real-time audio waveform or spectrum visualization</li>
 *   <li>Logging panel for system messages</li>
 * </ul>
 *
 * <p>Tip: Use {@code Platform.runLater()} for thread-safe UI updates
 * from audio processing threads.</p>
 */
public class ConfigManagerUI extends Application {

    @Override
    public void start(Stage primaryStage) {
        // --- Title ---
        Label titleLabel = new Label("Audio Processing System");
        titleLabel.setStyle("-fx-font-size: 18px; -fx-font-weight: bold;");

        // --- Source selection ---
        Label sourceLabel = new Label("Audio Source:");
        ComboBox<String> sourceCombo = new ComboBox<>();
        sourceCombo.getItems().addAll("WAV File", "Microphone", "Sine Wave Generator");
        sourceCombo.setValue("Sine Wave Generator");

        // --- Processor selection ---
        Label processorLabel = new Label("Processors:");
        CheckBox volumeCheck = new CheckBox("Volume Control");
        // TODO: Add checkboxes for your other processors

        // --- Sink selection ---
        Label sinkLabel = new Label("Audio Sink:");
        ComboBox<String> sinkCombo = new ComboBox<>();
        sinkCombo.getItems().addAll("Speakers", "WAV File");
        sinkCombo.setValue("WAV File");

        // --- Controls ---
        Button startButton = new Button("Start");
        Button stopButton = new Button("Stop");
        stopButton.setDisable(true);
        Label statusLabel = new Label("Status: Ready");

        startButton.setOnAction(event -> {
            statusLabel.setText("Status: Running...");
            startButton.setDisable(true);
            stopButton.setDisable(false);
            // TODO: Start the audio pipeline in a background thread
        });

        stopButton.setOnAction(event -> {
            statusLabel.setText("Status: Stopped");
            startButton.setDisable(false);
            stopButton.setDisable(true);
            // TODO: Stop the audio pipeline
        });

        HBox controlBox = new HBox(10, startButton, stopButton);

        // --- Visualization placeholder ---
        Label vizLabel = new Label("Waveform Visualization:");
        // TODO: Replace this with a Canvas or custom Node for real-time waveform display.
        // Hint: Use javafx.scene.canvas.Canvas and AnimationTimer for smooth rendering.
        Pane vizPlaceholder = new Pane();
        vizPlaceholder.setMinHeight(150);
        vizPlaceholder.setStyle("-fx-border-color: gray; -fx-border-width: 1; -fx-background-color: black;");

        // --- Log area ---
        Label logLabel = new Label("Log:");
        TextArea logArea = new TextArea();
        logArea.setEditable(false);
        logArea.setPrefRowCount(5);
        logArea.setStyle("-fx-font-family: monospace;");

        // --- Layout ---
        VBox root = new VBox(10,
                titleLabel,
                new Separator(),
                sourceLabel, sourceCombo,
                processorLabel, volumeCheck,
                sinkLabel, sinkCombo,
                new Separator(),
                controlBox, statusLabel,
                new Separator(),
                vizLabel, vizPlaceholder,
                new Separator(),
                logLabel, logArea
        );
        root.setPadding(new Insets(15));

        Scene scene = new Scene(root, 500, 650);
        primaryStage.setTitle("Audio Processing System");
        primaryStage.setScene(scene);
        primaryStage.show();
    }

    public static void launchUI(String[] args) {
        launch(args);
    }
}
