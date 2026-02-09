#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <emscripten/emscripten.h>

#define MAX_WORD_LENGTH 64
#define MAX_CHILDREN 10  // Maximum edit distance we care about
#define MAX_RESULTS 20   // Maximum suggestions to return

typedef struct BKTreeNode {
    char word[MAX_WORD_LENGTH];
    struct BKTreeNode* children[MAX_CHILDREN];
} BKTreeNode;

BKTreeNode* root = NULL;

// Calculate Levenshtein distance between two strings
EMSCRIPTEN_KEEPALIVE
int levenshtein_distance(const char* s1, const char* s2) {
    int len1 = strlen(s1);
    int len2 = strlen(s2);
    
    // Create matrix for dynamic programming
    int matrix[len1 + 1][len2 + 1];
    
    // Initialize first column and row
    for (int i = 0; i <= len1; i++) {
        matrix[i][0] = i;
    }
    for (int j = 0; j <= len2; j++) {
        matrix[0][j] = j;
    }
    
    // Fill the matrix
    for (int i = 1; i <= len1; i++) {
        for (int j = 1; j <= len2; j++) {
            int cost = (s1[i-1] == s2[j-1]) ? 0 : 1;
            
            int deletion = matrix[i-1][j] + 1;
            int insertion = matrix[i][j-1] + 1;
            int substitution = matrix[i-1][j-1] + cost;
            
            // Take minimum
            int min = deletion;
            if (insertion < min) min = insertion;
            if (substitution < min) min = substitution;
            
            matrix[i][j] = min;
        }
    }
    
    return matrix[len1][len2];
}

EMSCRIPTEN_KEEPALIVE
BKTreeNode* bk_tree_create_node(const char* word) {
    BKTreeNode* node = (BKTreeNode*)malloc(sizeof(BKTreeNode));
    strncpy(node->word, word, MAX_WORD_LENGTH - 1);
    node->word[MAX_WORD_LENGTH - 1] = '\0';
    
    for (int i = 0; i < MAX_CHILDREN; i++) {
        node->children[i] = NULL;
    }
    
    return node;
}

void bk_tree_free_node(BKTreeNode* node) {
    if (node == NULL) return;
    
    for (int i = 0; i < MAX_CHILDREN; i++) {
        if (node->children[i] != NULL) {
            bk_tree_free_node(node->children[i]);
        }
    }
    free(node);
}

EMSCRIPTEN_KEEPALIVE
void bk_tree_init() {
    if (root != NULL) {
        bk_tree_free_node(root);
    }
    root = NULL;
}

EMSCRIPTEN_KEEPALIVE
void bk_tree_insert(const char* word) {
    if (word == NULL || strlen(word) == 0) return;
    
    // Initialize root if needed
    if (root == NULL) {
        root = bk_tree_create_node(word);
        return;
    }
    
    BKTreeNode* current = root;
    
    while (1) {
        int distance = levenshtein_distance(current->word, word);
        
        // Word already exists (distance 0)
        if (distance == 0) {
            return;
        }
        
        // Distance too large, cap it
        if (distance >= MAX_CHILDREN) {
            distance = MAX_CHILDREN - 1;
        }
        
        // If no child at this distance, insert here
        if (current->children[distance] == NULL) {
            current->children[distance] = bk_tree_create_node(word);
            return;
        }
        
        // Otherwise, traverse to that child
        current = current->children[distance];
    }
}

// Helper structure for search results
typedef struct {
    char words[MAX_RESULTS][MAX_WORD_LENGTH];
    int distances[MAX_RESULTS];
    int count;
} SearchResults;

void bk_tree_search_recursive(BKTreeNode* node, const char* target, int tolerance, SearchResults* results) {
    if (node == NULL || results->count >= MAX_RESULTS) {
        return;
    }
    
    int distance = levenshtein_distance(node->word, target);
    
    // If within tolerance, add to results
    if (distance <= tolerance) {
        strcpy(results->words[results->count], node->word);
        results->distances[results->count] = distance;
        results->count++;
    }
    
    // Search children within range [distance - tolerance, distance + tolerance]
    int min_dist = (distance - tolerance < 0) ? 0 : distance - tolerance;
    int max_dist = (distance + tolerance >= MAX_CHILDREN) ? MAX_CHILDREN - 1 : distance + tolerance;
    
    for (int i = min_dist; i <= max_dist; i++) {
        if (node->children[i] != NULL) {
            bk_tree_search_recursive(node->children[i], target, tolerance, results);
        }
    }
}

EMSCRIPTEN_KEEPALIVE
int bk_tree_search(const char* word, int tolerance) {
    if (root == NULL || word == NULL) return 0;
    
    SearchResults results;
    results.count = 0;
    
    bk_tree_search_recursive(root, word, tolerance, &results);
    
    return results.count;
}

// Get search result at index i (word)
EMSCRIPTEN_KEEPALIVE
const char* bk_tree_get_result_word(int index) {
    static SearchResults cached_results;
    // In a real implementation, we'd cache the last search results
    // For now, this is a placeholder
    if (index >= 0 && index < cached_results.count) {
        return cached_results.words[index];
    }
    return NULL;
}

// Get search result distance at index i
EMSCRIPTEN_KEEPALIVE
int bk_tree_get_result_distance(int index) {
    static SearchResults cached_results;
    if (index >= 0 && index < cached_results.count) {
        return cached_results.distances[index];
    }
    return -1;
}

EMSCRIPTEN_KEEPALIVE
int bk_tree_contains(const char* word) {
    if (root == NULL || word == NULL) return 0;
    
    BKTreeNode* current = root;
    
    while (current != NULL) {
        int distance = levenshtein_distance(current->word, word);
        
        if (distance == 0) {
            return 1;  // Found exact match
        }
        
        if (distance >= MAX_CHILDREN) {
            return 0;
        }
        
        current = current->children[distance];
    }
    
    return 0;
}

// For visualization: get number of children at a node
EMSCRIPTEN_KEEPALIVE
int bk_tree_get_child_count() {
    if (root == NULL) return 0;
    
    int count = 0;
    for (int i = 0; i < MAX_CHILDREN; i++) {
        if (root->children[i] != NULL) {
            count++;
        }
    }
    return count;
}
