#include <stdio.h>
#include <stdlib.h>
#include <emscripten/emscripten.h>

typedef struct Node {
    int data;
    struct Node* next;
    struct Node* prev;
} Node;

Node* head = NULL;
Node* tail = NULL;
int list_size = 0;

EMSCRIPTEN_KEEPALIVE
void list_init() {
    // Free existing list
    Node* current = head;
    while (current != NULL) {
        Node* temp = current;
        current = current->next;
        free(temp);
    }
    head = NULL;
    tail = NULL;
    list_size = 0;
}

EMSCRIPTEN_KEEPALIVE
void list_insert_front(int value) {
    Node* newNode = (Node*)malloc(sizeof(Node));
    newNode->data = value;
    newNode->next = head;
    newNode->prev = NULL;
    
    if (head != NULL) {
        head->prev = newNode;
    }
    head = newNode;
    
    if (tail == NULL) {
        tail = newNode;
    }
    list_size++;
}

EMSCRIPTEN_KEEPALIVE
void list_insert_back(int value) {
    Node* newNode = (Node*)malloc(sizeof(Node));
    newNode->data = value;
    newNode->next = NULL;
    newNode->prev = tail;
    
    if (tail != NULL) {
        tail->next = newNode;
    }
    tail = newNode;
    
    if (head == NULL) {
        head = newNode;
    }
    list_size++;
}

EMSCRIPTEN_KEEPALIVE
int list_delete(int value) {
    Node* current = head;
    
    while (current != NULL) {
        if (current->data == value) {
            if (current->prev != NULL) {
                current->prev->next = current->next;
            } else {
                head = current->next;
            }
            
            if (current->next != NULL) {
                current->next->prev = current->prev;
            } else {
                tail = current->prev;
            }
            
            free(current);
            list_size--;
            return 1;
        }
        current = current->next;
    }
    return 0;
}

EMSCRIPTEN_KEEPALIVE
int list_search(int value) {
    Node* current = head;
    int index = 0;
    
    while (current != NULL) {
        if (current->data == value) {
            return index;
        }
        current = current->next;
        index++;
    }
    return -1;
}

EMSCRIPTEN_KEEPALIVE
int list_get_size() {
    return list_size;
}

EMSCRIPTEN_KEEPALIVE
int list_get_at(int index) {
    if (index < 0 || index >= list_size) {
        return -1;
    }
    
    Node* current = head;
    for (int i = 0; i < index; i++) {
        current = current->next;
    }
    return current->data;
}
