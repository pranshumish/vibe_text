#ifndef QUEUE_H
#define QUEUE_H

// Queue data structure for AUTO-SAVE functionality
// Uses array-based circular queue implementation

#define MAX_QUEUE_SIZE 50

// Structure to store auto-save operation
typedef struct {
    char *content;      // Content to save
    int contentLength;  // Length of content
    char filename[256]; // Filename to save to
} AutoSaveOperation;

// Queue structure
typedef struct {
    AutoSaveOperation items[MAX_QUEUE_SIZE];
    int front;  // Front index
    int rear;   // Rear index
    int count;  // Number of items in queue
} Queue;

// Function declarations
void initQueue(Queue *q);
int isQueueEmpty(Queue *q);
int isQueueFull(Queue *q);
void enqueue(Queue *q, AutoSaveOperation op);
AutoSaveOperation dequeue(Queue *q);

#endif

