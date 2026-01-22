#include <stdio.h>
#include <stdlib.h>
#include <emscripten/emscripten.h>

#define MAX_VERTICES 20

typedef struct AdjNode {
    int vertex;
    struct AdjNode* next;
} AdjNode;

typedef struct {
    AdjNode* head;
} AdjList;

AdjList graph[MAX_VERTICES];
int num_vertices = 0;
int visited[MAX_VERTICES];

EMSCRIPTEN_KEEPALIVE
void graph_init(int vertices) {
    num_vertices = vertices < MAX_VERTICES ? vertices : MAX_VERTICES;
    
    for (int i = 0; i < MAX_VERTICES; i++) {
        AdjNode* current = graph[i].head;
        while (current != NULL) {
            AdjNode* temp = current;
            current = current->next;
            free(temp);
        }
        graph[i].head = NULL;
        visited[i] = 0;
    }
}

EMSCRIPTEN_KEEPALIVE
void graph_add_edge(int src, int dest) {
    if (src >= num_vertices || dest >= num_vertices) return;
    
    AdjNode* newNode = (AdjNode*)malloc(sizeof(AdjNode));
    newNode->vertex = dest;
    newNode->next = graph[src].head;
    graph[src].head = newNode;
}

EMSCRIPTEN_KEEPALIVE
void graph_add_edge_undirected(int src, int dest) {
    graph_add_edge(src, dest);
    graph_add_edge(dest, src);
}

EMSCRIPTEN_KEEPALIVE
int graph_has_edge(int src, int dest) {
    if (src >= num_vertices || dest >= num_vertices) return 0;
    
    AdjNode* current = graph[src].head;
    while (current != NULL) {
        if (current->vertex == dest) {
            return 1;
        }
        current = current->next;
    }
    return 0;
}

EMSCRIPTEN_KEEPALIVE
int graph_get_num_vertices() {
    return num_vertices;
}

EMSCRIPTEN_KEEPALIVE
int graph_get_neighbor(int vertex, int position) {
    if (vertex >= num_vertices) return -1;
    
    AdjNode* current = graph[vertex].head;
    for (int i = 0; i < position && current != NULL; i++) {
        current = current->next;
    }
    
    if (current != NULL) {
        return current->vertex;
    }
    return -1;
}

EMSCRIPTEN_KEEPALIVE
int graph_get_degree(int vertex) {
    if (vertex >= num_vertices) return 0;
    
    int count = 0;
    AdjNode* current = graph[vertex].head;
    while (current != NULL) {
        count++;
        current = current->next;
    }
    return count;
}

EMSCRIPTEN_KEEPALIVE
void graph_reset_visited() {
    for (int i = 0; i < num_vertices; i++) {
        visited[i] = 0;
    }
}

EMSCRIPTEN_KEEPALIVE
void graph_dfs_util(int vertex) {
    visited[vertex] = 1;
    
    AdjNode* current = graph[vertex].head;
    while (current != NULL) {
        if (!visited[current->vertex]) {
            graph_dfs_util(current->vertex);
        }
        current = current->next;
    }
}

EMSCRIPTEN_KEEPALIVE
int graph_is_visited(int vertex) {
    if (vertex >= num_vertices) return 0;
    return visited[vertex];
}
