#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <emscripten/emscripten.h>

#define ALPHABET_SIZE 26

typedef struct TrieNode {
    struct TrieNode* children[ALPHABET_SIZE];
    int is_end_of_word;
    char character;
} TrieNode;

TrieNode* root = NULL;

EMSCRIPTEN_KEEPALIVE
TrieNode* trie_create_node() {
    TrieNode* node = (TrieNode*)malloc(sizeof(TrieNode));
    node->is_end_of_word = 0;
    node->character = '\0';
    
    for (int i = 0; i < ALPHABET_SIZE; i++) {
        node->children[i] = NULL;
    }
    
    return node;
}

void trie_free_node(TrieNode* node) {
    if (node == NULL) return;
    
    for (int i = 0; i < ALPHABET_SIZE; i++) {
        if (node->children[i] != NULL) {
            trie_free_node(node->children[i]);
        }
    }
    free(node);
}

EMSCRIPTEN_KEEPALIVE
void trie_init() {
    if (root != NULL) {
        trie_free_node(root);
    }
    root = trie_create_node();
}

EMSCRIPTEN_KEEPALIVE
void trie_insert(const char* word) {
    if (root == NULL) {
        trie_init();
    }
    
    TrieNode* current = root;
    int length = strlen(word);
    
    for (int i = 0; i < length; i++) {
        char c = word[i];
        if (c < 'a' || c > 'z') continue; // Only lowercase letters
        
        int index = c - 'a';
        
        if (current->children[index] == NULL) {
            current->children[index] = trie_create_node();
            current->children[index]->character = c;
        }
        
        current = current->children[index];
    }
    
    current->is_end_of_word = 1;
}

EMSCRIPTEN_KEEPALIVE
int trie_search(const char* word) {
    if (root == NULL) return 0;
    
    TrieNode* current = root;
    int length = strlen(word);
    
    for (int i = 0; i < length; i++) {
        char c = word[i];
        if (c < 'a' || c > 'z') return 0;
        
        int index = c - 'a';
        
        if (current->children[index] == NULL) {
            return 0;
        }
        
        current = current->children[index];
    }
    
    return current->is_end_of_word;
}

EMSCRIPTEN_KEEPALIVE
int trie_starts_with(const char* prefix) {
    if (root == NULL) return 0;
    
    TrieNode* current = root;
    int length = strlen(prefix);
    
    for (int i = 0; i < length; i++) {
        char c = prefix[i];
        if (c < 'a' || c > 'z') return 0;
        
        int index = c - 'a';
        
        if (current->children[index] == NULL) {
            return 0;
        }
        
        current = current->children[index];
    }
    
    return 1;
}

EMSCRIPTEN_KEEPALIVE
int trie_has_child(int level, int child_index) {
    if (root == NULL) return 0;
    if (child_index >= ALPHABET_SIZE) return 0;
    
    // This is a simplified version for visualization
    // In practice, you'd need to traverse to specific nodes
    if (level == 0) {
        return root->children[child_index] != NULL;
    }
    
    return 0;
}

EMSCRIPTEN_KEEPALIVE
int trie_is_word_end(const char* word) {
    return trie_search(word);
}
