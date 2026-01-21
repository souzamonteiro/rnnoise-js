// rnnoise_wrapper.c
#include <stdlib.h>
#include "rnnoise.h"

#define FRAME_SIZE 480  // Set the frame size as needed

typedef struct {
    DenoiseState* state;
} RNNoiseWrapper;

// Create instance
RNNoiseWrapper* rnnoise_create_wasm() {
    RNNoiseWrapper* wrapper = (RNNoiseWrapper*)malloc(sizeof(RNNoiseWrapper));
    if (!wrapper) return NULL;
    
    // ⚠️ CRITICAL: Use NULL as parameter
    wrapper->state = rnnoise_create(NULL);
    
    if (!wrapper->state) {
        free(wrapper);
        return NULL;
    }
    
    return wrapper;
}

// Destroy instance
void rnnoise_destroy_wasm(RNNoiseWrapper* wrapper) {
    if (wrapper) {
        if (wrapper->state) {
            rnnoise_destroy(wrapper->state);
        }
        free(wrapper);
    }
}

// Process frame
float rnnoise_process_frame_wasm(RNNoiseWrapper* wrapper, float* output, const float* input) {
    if (!wrapper || !wrapper->state || !output || !input) {
        return 0.0f;
    }
    
    return rnnoise_process_frame(wrapper->state, output, input);
}

// Get frame size
int get_frame_size() {
    return FRAME_SIZE;
}

// Alternative buffer function
float rnnoise_process_buffer_wasm(RNNoiseWrapper* wrapper, float* output, const float* input, int length) {
    if (!wrapper || !wrapper->state || length != FRAME_SIZE) {
        return 0.0f;
    }
    return rnnoise_process_frame(wrapper->state, output, input);
}
