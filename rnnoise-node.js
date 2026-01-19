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
        
        try {
            console.log('🔄 Carregando módulo WASM...');
            this.module = await createRNNoiseModule();
            console.log('✅ Módulo carregado');
            
            // Verificar se HEAPU8 está disponível
            if (!this.module.HEAPU8 || !this.module.HEAPF32) {
                throw new Error('Acesso à memória WASM não disponível');
            }
            
            this.rnnoise = this.module._rnnoise_create_wasm();
            this.frameSize = this.module._get_frame_size();
            this.initialized = true;
            
            console.log('✅ RNNoise inicializado');
            console.log('   Frame size:', this.frameSize);
            console.log('   HEAPU8 disponível:', this.module.HEAPU8.length, 'bytes');
            console.log('   HEAPF32 disponível:', this.module.HEAPF32.length, 'floats');
            
        } catch (error) {
            console.error('❌ Erro na inicialização:', error);
            throw error;
        }
    }

    processFrame(inputFrame) {
        if (!this.initialized) {
            throw new Error('RNNoise not initialized. Call init() first.');
        }

        if (inputFrame.length !== this.frameSize) {
            throw new Error(`Input frame size must be ${this.frameSize}, got ${inputFrame.length}`);
        }

        // Alocar memória para input e output
        const bytesPerSample = 4; // 32-bit floats
        const inputPtr = this.module._malloc(inputFrame.length * bytesPerSample);
        const outputPtr = this.module._malloc(inputFrame.length * bytesPerSample);

        if (!inputPtr || !outputPtr) {
            throw new Error('Failed to allocate memory');
        }

        try {
            // 🔥 AGORA SIM - podemos copiar dados diretamente!
            // Converter Float32Array para bytes e copiar para HEAPU8
            const inputBytes = new Uint8Array(inputFrame.buffer);
            this.module.HEAPU8.set(inputBytes, inputPtr);
            
            console.log('📤 Dados copiados para WASM');
            console.log('   Input pointer:', inputPtr);
            console.log('   Input bytes:', inputBytes.length);
            
            // Processar frame
            const vadProbability = this.module._rnnoise_process_frame_wasm(
                this.rnnoise, 
                outputPtr, 
                inputPtr
            );
            
            console.log('🎯 Frame processado');
            console.log('   VAD probability:', vadProbability);
            
            // 🔥 Copiar resultado de volta usando HEAPF32
            const outputFrame = new Float32Array(this.frameSize);
            
            // Usar HEAPF32 para copiar diretamente (mais eficiente)
            const outputStartIndex = outputPtr / 4; // Dividir por 4 (bytes per float)
            for (let i = 0; i < this.frameSize; i++) {
                outputFrame[i] = this.module.HEAPF32[outputStartIndex + i];
            }
            
            console.log('📥 Dados copiados de volta');
            console.log('   Output range:', 
                Math.min(...outputFrame).toFixed(6), 'a', 
                Math.max(...outputFrame).toFixed(6));
            
            return {
                vad: vadProbability,
                audio: outputFrame
            };
            
        } finally {
            // Liberar memória
            if (inputPtr) this.module._free(inputPtr);
            if (outputPtr) this.module._free(outputPtr);
        }
    }

    destroy() {
        if (this.initialized && this.rnnoise && this.module) {
            this.module._rnnoise_destroy_wasm(this.rnnoise);
            this.rnnoise = null;
            this.initialized = false;
            console.log('🧹 RNNoise destruído');
        }
    }
}

export default RNNoiseNode;
