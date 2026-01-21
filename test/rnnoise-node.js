// rnnoise-node.js
import createRNNoiseModule from './rnnoise.js';

class RNNoiseNode {
    constructor() {
        this.module = null;
        this.rnnoise = null;
        this.frameSize = 480;
        this.initialized = false;
    }

    async init() {
        if (this.initialized) return;
        
        this.module = await createRNNoiseModule();
        this.rnnoise = this.module._rnnoise_create_wasm();
        this.frameSize = this.module._get_frame_size();
        this.initialized = true;
    }

    processFrame(inputFrame) {
        if (!this.initialized) throw new Error('RNNoise not initialized');
        if (inputFrame.length !== this.frameSize) {
            throw new Error(`Input frame size must be ${this.frameSize}`);
        }

        const inputPtr = this.module._malloc(inputFrame.length * 4);
        const outputPtr = this.module._malloc(inputFrame.length * 4);

        try {
            // Copy input to WASM
            const inputBytes = new Uint8Array(inputFrame.buffer);
            this.module.HEAPU8.set(inputBytes, inputPtr);
            
            // Process frame
            const vadProbability = this.module._rnnoise_process_frame_wasm(
                this.rnnoise, 
                outputPtr, 
                inputPtr
            );
            
            // Copy output
            const outputFrame = new Float32Array(this.frameSize);
            const outputStart = outputPtr / 4;
            for (let i = 0; i < this.frameSize; i++) {
                outputFrame[i] = this.module.HEAPF32[outputStart + i];
            }
            
            return {
                vad: vadProbability,
                audio: outputFrame
            };
            
        } finally {
            this.module._free(inputPtr);
            this.module._free(outputPtr);
        }
    }

    reset() {
        if (this.initialized) {
            this.module._rnnoise_destroy_wasm(this.rnnoise);
            this.rnnoise = this.module._rnnoise_create_wasm();
            console.log('🔄 Estado do RNNoise resetado');
        }
    }

    destroy() {
        if (this.initialized) {
            this.module._rnnoise_destroy_wasm(this.rnnoise);
            this.initialized = false;
        }
    }
}

export default RNNoiseNode;
