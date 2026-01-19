#include <emscripten.h>
#include <stdio.h>
#include <string.h>
#include "rnnoise/include/rnnoise.h"

#define FRAME_SIZE 480

EMSCRIPTEN_KEEPALIVE
DenoiseState* rnnoise_create_wasm() {
    return rnnoise_create(NULL);
}

EMSCRIPTEN_KEEPALIVE
void rnnoise_destroy_wasm(DenoiseState* state) {
    rnnoise_destroy(state);
}

EMSCRIPTEN_KEEPALIVE
float rnnoise_process_frame_wasm(DenoiseState* state, float* in, float* out) {
    return rnnoise_process_frame(state, out, in);
}

EMSCRIPTEN_KEEPALIVE
int get_frame_size() {
    return FRAME_SIZE;
}

EMSCRIPTEN_KEEPALIVE
void rnnoise_process_buffer_wasm(DenoiseState* state, float* input, float* output, int num_frames) {
    for (int i = 0; i < num_frames; i++) {
        rnnoise_process_frame(state, output + i * FRAME_SIZE, input + i * FRAME_SIZE);
    }
}
