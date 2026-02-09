#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <emscripten/emscripten.h>

#define TABLE_SIZE 10

typedef struct Entry {
    int key;
    int value;
    struct Entry* next;
} Entry;

Entry* table[TABLE_SIZE];

EMSCRIPTEN_KEEPALIVE
int hash_function(int key) {
    return abs(key) % TABLE_SIZE;
}

EMSCRIPTEN_KEEPALIVE
void hashmap_init() {
    for (int i = 0; i < TABLE_SIZE; i++) {
        Entry* current = table[i];
        while (current != NULL) {
            Entry* temp = current;
            current = current->next;
            free(temp);
        }
        table[i] = NULL;
    }
}

EMSCRIPTEN_KEEPALIVE
void hashmap_insert(int key, int value) {
    int index = hash_function(key);
    Entry* newEntry = (Entry*)malloc(sizeof(Entry));
    newEntry->key = key;
    newEntry->value = value;
    newEntry->next = NULL;
    
    if (table[index] == NULL) {
        table[index] = newEntry;
    } else {
        // Check if key exists, update if found
        Entry* current = table[index];
        while (current != NULL) {
            if (current->key == key) {
                current->value = value;
                free(newEntry);
                return;
            }
            if (current->next == NULL) {
                current->next = newEntry;
                return;
            }
            current = current->next;
        }
    }
}

EMSCRIPTEN_KEEPALIVE
int hashmap_get(int key) {
    int index = hash_function(key);
    Entry* current = table[index];
    
    while (current != NULL) {
        if (current->key == key) {
            return current->value;
        }
        current = current->next;
    }
    return -1; // Not found
}

EMSCRIPTEN_KEEPALIVE
int hashmap_delete(int key) {
    int index = hash_function(key);
    Entry* current = table[index];
    Entry* prev = NULL;
    
    while (current != NULL) {
        if (current->key == key) {
            if (prev == NULL) {
                table[index] = current->next;
            } else {
                prev->next = current->next;
            }
            free(current);
            return 1;
        }
        prev = current;
        current = current->next;
    }
    return 0;
}

EMSCRIPTEN_KEEPALIVE
int hashmap_get_bucket_key(int bucket, int position) {
    if (bucket >= TABLE_SIZE) return -1;
    
    Entry* current = table[bucket];
    for (int i = 0; i < position && current != NULL; i++) {
        current = current->next;
    }
    
    if (current != NULL) {
        return current->key;
    }
    return -1;
}

EMSCRIPTEN_KEEPALIVE
int hashmap_get_bucket_value(int bucket, int position) {
    if (bucket >= TABLE_SIZE) return -1;
    
    Entry* current = table[bucket];
    for (int i = 0; i < position && current != NULL; i++) {
        current = current->next;
    }
    
    if (current != NULL) {
        return current->value;
    }
    return -1;
}

EMSCRIPTEN_KEEPALIVE
int hashmap_get_bucket_size(int bucket) {
    if (bucket >= TABLE_SIZE) return 0;
    
    int count = 0;
    Entry* current = table[bucket];
    while (current != NULL) {
        count++;
        current = current->next;
    }
    return count;
}
