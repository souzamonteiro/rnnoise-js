//test.mjs
import RNNoiseNode from './rnnoise-node.js';

async function testBasic() {
    console.log('🧪 RNNoise basic test...');
    const processor = new RNNoiseNode();

    try {
        console.log('1. Initializing...');
        await processor.init();
        console.log('✅ Initialization OK');

        console.log('2. Creating test frame...');
        const testFrame = new Float32Array(processor.frameSize);
        for (let i = 0; i < processor.frameSize; i++) {
            testFrame[i] = (Math.random() - 0.5) * 0.01; // Low noise 
        }

        console.log('Frame created:', {
            size: testFrame.length,
            min: Math.min(...testFrame).toFixed(6),
            max: Math.max(...testFrame).toFixed(6),
            avg: (testFrame.reduce((a, b) => a + b) / testFrame.length).toFixed(6)
        });

        console.log('3. Processing frame...');
        const result = processor.processFrame(testFrame);
        console.log('✅ Processing OK');

        console.log('4. Checking results...');
        console.log(' 📊 VAD probability:', result.vad.toFixed(4));
        console.log(' 🎯 Audio samples:', result.audio.length);
        console.log(' 🔊 Audio range:',
            Math.min(...result.audio).toFixed(6), 'to',
            Math.max(...result.audio).toFixed(6));
        console.log(' 💡 Non-zero Audio:',
            result.audio.filter(s => Math.abs(s) > 0.0001).length, 'samples');

        // Test with multiple frames 
        console.log('\n5. Test with multiple frames...');
        for (let i = 0; i < 3; i++) {
            const frame = new Float32Array(processor.frameSize);
            for (let j = 0; j < processor.frameSize; j++) {
                frame[j] = (Math.random() - 0.5) * 0.01;
            }

            const multiResult = processor.processFrame(frame);
            console.log(`Frame ${i + 1}: VAD = ${multiResult.vad.toFixed(4)}`);
        }

        console.log('✅✅✅ Test completed successfully!');
    } catch (error) {
        console.error('❌❌❌ Test error:', error);
        console.error('Stack:', error.stack);
    } finally {
        processor.destroy();
        console.log('🧹 Resources released');
    }
}

// Execute test
testBasic();