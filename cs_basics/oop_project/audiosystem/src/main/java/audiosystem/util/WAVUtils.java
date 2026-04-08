package audiosystem.util;

import java.io.*;
import java.nio.ByteBuffer;
import java.nio.ByteOrder;

/**
 * WAVUtils — utilities for reading and writing WAV file headers.
 *
 * <p>A WAV file consists of a 44-byte RIFF header followed by raw PCM audio data.
 * This class handles the header so you can focus on audio processing.</p>
 *
 * <h3>WAV file structure (44 bytes):</h3>
 * <pre>
 * Offset  Size  Description
 * ------  ----  -----------
 * 0       4     "RIFF" marker
 * 4       4     File size - 8 (little-endian)
 * 8       4     "WAVE" marker
 * 12      4     "fmt " marker
 * 16      4     Format chunk size (16 for PCM)
 * 20      2     Audio format (1 = PCM)
 * 22      2     Number of channels (1 = mono, 2 = stereo)
 * 24      4     Sample rate (e.g., 44100)
 * 28      4     Byte rate (sampleRate * channels * bitsPerSample/8)
 * 32      2     Block align (channels * bitsPerSample/8)
 * 34      2     Bits per sample (e.g., 16)
 * 36      4     "data" marker
 * 40      4     Data chunk size (number of audio data bytes)
 * 44      ...   Raw PCM audio data
 * </pre>
 */
public class WAVUtils {

    /** Standard WAV header size in bytes. */
    public static final int HEADER_SIZE = 44;

    /**
     * Writes a complete WAV file: header + PCM audio data.
     *
     * @param file           output file
     * @param audioData      raw PCM audio data (16-bit signed, little-endian)
     * @param sampleRate     samples per second (e.g., 44100)
     * @param numChannels    1 for mono, 2 for stereo
     * @param bitsPerSample  bits per sample (typically 16)
     * @throws IOException if writing fails
     */
    public static void writeWAV(File file, byte[] audioData,
                                int sampleRate, int numChannels, int bitsPerSample)
            throws IOException {
        try (FileOutputStream fos = new FileOutputStream(file)) {
            fos.write(createHeader(audioData.length, sampleRate, numChannels, bitsPerSample));
            fos.write(audioData);
        }
    }

    /**
     * Creates a 44-byte WAV header for the given audio parameters.
     *
     * @param dataSize       size of the raw audio data in bytes
     * @param sampleRate     samples per second
     * @param numChannels    number of audio channels
     * @param bitsPerSample  bits per sample
     * @return 44-byte array containing the WAV header
     */
    public static byte[] createHeader(int dataSize, int sampleRate,
                                      int numChannels, int bitsPerSample) {
        int byteRate = sampleRate * numChannels * bitsPerSample / 8;
        int blockAlign = numChannels * bitsPerSample / 8;

        ByteBuffer header = ByteBuffer.allocate(HEADER_SIZE).order(ByteOrder.LITTLE_ENDIAN);

        // RIFF header
        header.put("RIFF".getBytes());
        header.putInt(dataSize + 36);       // file size - 8
        header.put("WAVE".getBytes());

        // fmt subchunk
        header.put("fmt ".getBytes());
        header.putInt(16);                  // subchunk size (PCM = 16)
        header.putShort((short) 1);         // audio format (1 = PCM)
        header.putShort((short) numChannels);
        header.putInt(sampleRate);
        header.putInt(byteRate);
        header.putShort((short) blockAlign);
        header.putShort((short) bitsPerSample);

        // data subchunk
        header.put("data".getBytes());
        header.putInt(dataSize);

        return header.array();
    }

    /**
     * Reads a WAV file and returns only the raw PCM audio data (without header).
     *
     * @param file the WAV file to read
     * @return raw PCM audio data
     * @throws IOException if reading fails or the file is not a valid WAV
     */
    public static byte[] readPCMData(File file) throws IOException {
        try (FileInputStream fis = new FileInputStream(file)) {
            byte[] header = new byte[HEADER_SIZE];
            if (fis.read(header) < HEADER_SIZE) {
                throw new IOException("File too small to be a valid WAV file");
            }

            // Validate RIFF header
            if (header[0] != 'R' || header[1] != 'I' || header[2] != 'F' || header[3] != 'F') {
                throw new IOException("Not a valid WAV file: missing RIFF marker");
            }

            // Read data size from header (bytes 40-43, little-endian)
            int dataSize = ByteBuffer.wrap(header, 40, 4).order(ByteOrder.LITTLE_ENDIAN).getInt();

            byte[] audioData = new byte[dataSize];
            int totalRead = 0;
            while (totalRead < dataSize) {
                int read = fis.read(audioData, totalRead, dataSize - totalRead);
                if (read == -1) break;
                totalRead += read;
            }

            return audioData;
        }
    }

    /**
     * Reads the sample rate from a WAV file header.
     *
     * @param file the WAV file
     * @return sample rate in Hz
     * @throws IOException if reading fails
     */
    public static int readSampleRate(File file) throws IOException {
        try (FileInputStream fis = new FileInputStream(file)) {
            byte[] header = new byte[HEADER_SIZE];
            if (fis.read(header) < HEADER_SIZE) {
                throw new IOException("File too small to be a valid WAV file");
            }
            return ByteBuffer.wrap(header, 24, 4).order(ByteOrder.LITTLE_ENDIAN).getInt();
        }
    }

    /**
     * Reads the number of channels from a WAV file header.
     *
     * @param file the WAV file
     * @return number of channels (1 = mono, 2 = stereo)
     * @throws IOException if reading fails
     */
    public static int readNumChannels(File file) throws IOException {
        try (FileInputStream fis = new FileInputStream(file)) {
            byte[] header = new byte[HEADER_SIZE];
            if (fis.read(header) < HEADER_SIZE) {
                throw new IOException("File too small to be a valid WAV file");
            }
            return ByteBuffer.wrap(header, 22, 2).order(ByteOrder.LITTLE_ENDIAN).getShort();
        }
    }

    /**
     * Reads bits per sample from a WAV file header.
     *
     * @param file the WAV file
     * @return bits per sample (e.g., 16)
     * @throws IOException if reading fails
     */
    public static int readBitsPerSample(File file) throws IOException {
        try (FileInputStream fis = new FileInputStream(file)) {
            byte[] header = new byte[HEADER_SIZE];
            if (fis.read(header) < HEADER_SIZE) {
                throw new IOException("File too small to be a valid WAV file");
            }
            return ByteBuffer.wrap(header, 34, 2).order(ByteOrder.LITTLE_ENDIAN).getShort();
        }
    }
}
