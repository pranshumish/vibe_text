#include <stdio.h>
#include <stdlib.h>
#include <emscripten/emscripten.h>

#define MAX_SIZE 100

typedef struct {
    int data[MAX_SIZE];
    int top;
} Stack;

Stack stack;

EMSCRIPTEN_KEEPALIVE
void stack_init() {
    stack.top = -1;
}

EMSCRIPTEN_KEEPALIVE
int stack_push(int value) {
    if (stack.top >= MAX_SIZE - 1) {
        return 0; // Stack overflow
    }
    stack.data[++stack.top] = value;
    return 1;
}

EMSCRIPTEN_KEEPALIVE
int stack_pop() {
    if (stack.top < 0) {
        return -1; // Stack underflow
    }
    return stack.data[stack.top--];
}

EMSCRIPTEN_KEEPALIVE
int stack_peek() {
    if (stack.top < 0) {
        return -1;
    }
    return stack.data[stack.top];
}

EMSCRIPTEN_KEEPALIVE
int stack_is_empty() {
    return stack.top < 0;
}

EMSCRIPTEN_KEEPALIVE
int stack_size() {
    return stack.top + 1;
}

EMSCRIPTEN_KEEPALIVE
int* stack_get_array() {
    return stack.data;
}

EMSCRIPTEN_KEEPALIVE
int stack_get_at(int index) {
    if (index < 0 || index > stack.top) {
        return -1;
    }
    return stack.data[index];
}
