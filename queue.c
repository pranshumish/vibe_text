#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include "queue.h"

// Initialize the queue
void initQueue(Queue *q) {
    q->front = 0;
    q->rear = -1;
    q->count = 0;
}

// Check if queue is empty
int isQueueEmpty(Queue *q) {
    return (q->count == 0);
}

// Check if queue is full
int isQueueFull(Queue *q) {
    return (q->count == MAX_QUEUE_SIZE);
}

// Enqueue operation
void enqueue(Queue *q, AutoSaveOperation op) {
    if (isQueueFull(q)) {
        // Remove oldest item if queue is full (FIFO behavior)
        if (q->items[q->front].content != NULL) {
            free(q->items[q->front].content);
        }
        q->front = (q->front + 1) % MAX_QUEUE_SIZE;
        q->count--;
    }
    
    q->rear = (q->rear + 1) % MAX_QUEUE_SIZE;
    
    // Allocate memory for content
    q->items[q->rear].content = (char *)malloc((op.contentLength + 1) * sizeof(char));
    strcpy(q->items[q->rear].content, op.content);
    q->items[q->rear].contentLength = op.contentLength;
    strcpy(q->items[q->rear].filename, op.filename);
    
    q->count++;
}

// Dequeue operation
AutoSaveOperation dequeue(Queue *q) {
    AutoSaveOperation emptyOp = {NULL, 0, ""};
    if (isQueueEmpty(q)) {
        return emptyOp;
    }
    
    AutoSaveOperation op = q->items[q->front];
    q->front = (q->front + 1) % MAX_QUEUE_SIZE;
    q->count--;
    
    return op;
}

