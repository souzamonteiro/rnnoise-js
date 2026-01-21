// test-simple.mjs
import RNNoiseNode from './rnnoise-node.js';

async function testSimple() {
    console.log('🧪 Simplified RNNoise test...');
    const processor = new RNNoiseNode();

    try {
        console.log('1. Initializing...');
        await processor.init();

        console.log('2. Creating test frame...');
        const testFrame = new Float32Array(processor.frameSize);
        for (let i = 0; i < processor.frameSize; i++) {
            testFrame[i] = Math.sin(i * 0.1) * 0.01; // Smooth sine wave 
        }

        console.log('3. Processing frame...');
        const result = processor.processFrame(testFrame);

        console.log('✅ Result:');
        console.log(' VAD:', result.vad.toFixed(4));
        console.log(' Audio samples:', result.audio.length);
    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        processor.destroy();
    }
}

testSimple();