#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <emscripten/emscripten.h>

#define ALPHABET_SIZE 26

typedef struct CompressedTrieNode {
    char* key; // Substring for this edge
    int is_end_of_word;
    struct CompressedTrieNode* children[ALPHABET_SIZE];
} CompressedTrieNode;

CompressedTrieNode* root = NULL;

// Helper: Create a new node
CompressedTrieNode* create_node(const char* key, int is_end) {
    CompressedTrieNode* node = (CompressedTrieNode*)malloc(sizeof(CompressedTrieNode));
    if (key) {
        node->key = strdup(key);
    } else {
        node->key = NULL;
    }
    node->is_end_of_word = is_end;
    for (int i = 0; i < ALPHABET_SIZE; i++) {
        node->children[i] = NULL;
    }
    return node;
}

// Helper: Find common prefix length
int get_common_prefix_len(const char* s1, const char* s2) {
    int i = 0;
    while (s1[i] && s2[i] && s1[i] == s2[i]) {
        i++;
    }
    return i;
}

EMSCRIPTEN_KEEPALIVE
void graph_init(int dummy) {
    // Resetting... in a real app need to free tree
    root = create_node("", 0); // Root has empty key
}

EMSCRIPTEN_KEEPALIVE
void graph_add_edge(int dummy_src, int dummy_dest) {
    // Legacy function to satisfy interface, no-op or specific logic if needed
}

// The core Compressed Trie Insertion
void insert_recursive(CompressedTrieNode* node, const char* word) {
    if (!word || strlen(word) == 0) {
        node->is_end_of_word = 1;
        return;
    }

    int index = word[0] - 'a';
    if (index < 0 || index >= ALPHABET_SIZE) return;

    CompressedTrieNode* child = node->children[index];

    if (!child) {
        // No edge starts with this char, create one
        node->children[index] = create_node(word, 1);
        return;
    }

    // Compare edge key with word
    int common_len = get_common_prefix_len(child->key, word);
    int key_len = strlen(child->key);
    int word_len = strlen(word);

    if (common_len == key_len) {
        // Full match of current edge, traverse down
        insert_recursive(child, word + common_len);
    } else {
        // Partial match - Split the edge
        // 1. Create split node
        // child->key is "apple", word is "apply"
        // common is "appl" (4)
        // Split "apple" into "appl" -> "e"
        
        char* common_str = (char*)malloc(common_len + 1);
        strncpy(common_str, child->key, common_len);
        common_str[common_len] = '\0';

        char* remaining_key = strdup(child->key + common_len);
        
        // Update child (now the parent of the split)
        free(child->key);
        child->key = common_str;
        
        // Old child content moves to new node
        CompressedTrieNode* new_child = create_node(remaining_key, child->is_end_of_word);
        free(remaining_key);
        
        // Copy children from 'child' to 'new_child'
        for (int i = 0; i < ALPHABET_SIZE; i++) {
            new_child->children[i] = child->children[i];
            child->children[i] = NULL; // Clear moved children
        }
        
        // Link new_child to child
        int split_index = new_child->key[0] - 'a';
        child->children[split_index] = new_child;
        child->is_end_of_word = 0; // It's just a bridge now (usually)

        // Continue insertion for the original word
        if (common_len == word_len) {
            child->is_end_of_word = 1;
        } else {
            insert_recursive(child, word + common_len);
        }
    }
}

EMSCRIPTEN_KEEPALIVE
void graph_insert_word(const char* word) {
    if (!root) graph_init(0);
    insert_recursive(root, word);
}

// Map these for visualization
EMSCRIPTEN_KEEPALIVE
char* graph_get_node_key(long node_ptr) {
    CompressedTrieNode* node = (CompressedTrieNode*)node_ptr;
    return node->key;
}
