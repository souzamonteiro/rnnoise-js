// create-test-simple.js
import fs from 'fs';

// Function to create WAV file manually
function createWavFile(filename, audioData, sampleRate = 48000) {
    console.log(`🎵 Creating: ${filename}`);

    const samples = audioData.length;
    const buffer = new ArrayBuffer(44 + samples * 2);
    const view = new DataView(buffer);

    // RIFF/WAVE header 
    writeString(view, 0, 'RIFF');
    view.setUint32(4, 36 + samples * 2, true);
    writeString(view, 8, 'WAVE');

    // Chunk fmt 
    writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true); //PCM 
    view.setUint16(22, 1, true); // mono 
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);

    // Chunk data 
    writeString(view, 36, 'data');
    view.setUint32(40, samples * 2, true);

    // Data 
    for (let i = 0; i < samples; i++) {
        const sample = Math.max(-1, Math.min(1, audioData[i]));
        view.setInt16(44 + i * 2, sample * 32767, true);
    }

    fs.writeFileSync(filename, Buffer.from(buffer));
    console.log('✅ File created');
}

function writeString(view, offset, string) {
    for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
    }
}

// Create test audio
function createTestAudio() {
    const sampleRate = 48000;
    const duration = 5; // seconds
    const samples = duration * sampleRate;
    const audio = new Float32Array(samples);

    // Create audio with simulated voice and noise
    for (let i = 0; i < samples; i++) {
        const t = i / sampleRate;

        // Switch between voice and noise 
        if (t < 2 || (t >= 3 && t < 4)) {
            // Simulated voice 
            const voice =
                Math.sin(2 * Math.PI * 120 * t) * 0.3 +
                Math.sin(2 * Math.PI * 240 * t) * 0.2 +
                (Math.random() - 0.5) * 0.05;
            audio[i] = voice;
        } else {
            // Noise 
            audio[i] = (Math.random() - 0.5) * 0.4;
        }
    }

    return audio;
}

// To execute
const audio = createTestAudio();
createWavFile('test_real.wav', audio);
console.log('💡 Test with: node cli-manual-wav.js test_real.wav result.wav');