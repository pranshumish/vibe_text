#include <stdio.h>
#include <stdlib.h>
#include "stack.h"

// Initialize the stack
void initStack(Stack *s) {
    s->top = -1;  // Empty stack
}

// Check if stack is empty
int isStackEmpty(Stack *s) {
    return (s->top == -1);
}

// Check if stack is full
int isStackFull(Stack *s) {
    return (s->top == MAX_STACK_SIZE - 1);
}

// Push operation onto stack
void push(Stack *s, UndoOperation op) {
    if (isStackFull(s)) {
        printf("Stack overflow! Cannot undo more operations.\n");
        return;
    }
    s->top++;
    s->items[s->top] = op;
}

// Pop operation from stack
UndoOperation pop(Stack *s) {
    UndoOperation emptyOp = {'\0', '\0', -1};
    if (isStackEmpty(s)) {
        printf("Stack is empty! Nothing to undo.\n");
        return emptyOp;
    }
    UndoOperation op = s->items[s->top];
    s->top--;
    return op;
}

