// rnnoise_wrapper.c
#include <stdlib.h>
#include "rnnoise.h"

#define FRAME_SIZE 480  // Defina o tamanho do frame conforme necessário

// Estrutura idêntica à do seu código C
typedef struct {
    DenoiseState* state;
} RNNoiseWrapper;

// Criar instância - IDÊNTICO ao seu código
RNNoiseWrapper* rnnoise_create_wasm() {
    RNNoiseWrapper* wrapper = (RNNoiseWrapper*)malloc(sizeof(RNNoiseWrapper));
    if (!wrapper) return NULL;
    
    // ⚠️ CRÍTICO: Usar NULL como parâmetro, igual ao seu código
    wrapper->state = rnnoise_create(NULL);
    
    if (!wrapper->state) {
        free(wrapper);
        return NULL;
    }
    
    return wrapper;
}

// Destruir instância
void rnnoise_destroy_wasm(RNNoiseWrapper* wrapper) {
    if (wrapper) {
        if (wrapper->state) {
            rnnoise_destroy(wrapper->state);
        }
        free(wrapper);
    }
}

// Processar frame - IDÊNTICO ao seu código
float rnnoise_process_frame_wasm(RNNoiseWrapper* wrapper, float* output, const float* input) {
    if (!wrapper || !wrapper->state || !output || !input) {
        return 0.0f;
    }
    
    // ⚠️ CRÍTICO: Chamada idêntica ao seu código funcionando
    return rnnoise_process_frame(wrapper->state, output, input);
}

// Obter tamanho do frame
int get_frame_size() {
    return FRAME_SIZE;
}

// Função de buffer alternativa
float rnnoise_process_buffer_wasm(RNNoiseWrapper* wrapper, float* output, const float* input, int length) {
    if (!wrapper || !wrapper->state || length != FRAME_SIZE) {
        return 0.0f;
    }
    return rnnoise_process_frame(wrapper->state, output, input);
}
