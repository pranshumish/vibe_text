/**
 * Represents a single state in the history tree
 */
class VersionNode {
  constructor(id, content, parent = null, timestamp = Date.now()) {
    this.id = id;
    this.content = content;
    this.parent = parent;
    this.children = [];
    this.timestamp = timestamp;
  }
}

/**
 * Manages the history tree of the document
 */
export class VersionHistory {
  constructor(initialContent = "") {
    this.root = new VersionNode("root", initialContent);
    this.currentNode = this.root;
    this.nodeCounter = 0;
    this.nodes = new Map(); // Fast lookup by ID
    this.nodes.set("root", this.root);
  }

  /**
   * Adds a new version as a child of the current node
   * @param {string} content - The text content
   * @returns {VersionNode} The new node
   */
  addVersion(content) {
    // If content hasn't changed, don't create a new node
    if (this.currentNode.content === content) {
      return this.currentNode;
    }

    const id = `v${++this.nodeCounter}`;
    const newNode = new VersionNode(id, content, this.currentNode);

    this.currentNode.children.push(newNode);
    this.nodes.set(id, newNode);
    this.currentNode = newNode;

    return newNode;
  }

  /**
   * Moves the current pointer to the parent (Undo)
   * @returns {string|null} The content of the parent, or null if at root
   */
  undo() {
    if (this.currentNode.parent) {
      this.currentNode = this.currentNode.parent;
      return this.currentNode.content;
    }
    return null;
  }

  /**
   * Moves the current pointer to the most recent child (Redo)
   * Strategies:
   * - Most recent child (LIFO for redo)
   * - Last active child (requires tracking 'active child' index)
   * For now, we'll pick the last added child (most recent branch).
   * @returns {string|null} The content of the child, or null if no children
   */
  redo() {
    if (this.currentNode.children.length > 0) {
      // Default to the last child (most recently created branch from this point)
      // This mimics standard redo behavior if you just undid and didn't branch yet.
      // If you branched, this takes you down the new branch.
      const nextNode =
        this.currentNode.children[this.currentNode.children.length - 1];
      this.currentNode = nextNode;
      return this.currentNode.content;
    }
    return null;
  }

  /**
   * Jumps to a specific version by ID
   * @param {string} id
   * @returns {string|null} Content of that version
   */
  jumpTo(id) {
    const targetNode = this.nodes.get(id);
    if (targetNode) {
      this.currentNode = targetNode;
      return targetNode.content;
    }
    return null;
  }

  /**
   * Returns the structure for visualization
   */
  getGraph() {
    return {
      root: this.root,
      currentNodeId: this.currentNode.id,
      totalNodes: this.nodes.size,
    };
  }

  getCurrentContent() {
    return this.currentNode.content;
  }
}
