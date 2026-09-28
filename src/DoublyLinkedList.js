/**
 * DoublyLinkedList.js
 * Implementation of a Doubly Linked List with Sentinel Head & Tail nodes.
 * Provides strict O(1) insertion, deletion, and node relocation.
 */

export class Node {
  /**
   * @param {*} key - Key associated with the cache entry
   * @param {*} value - Value stored in the cache entry
   * @param {number|null} [expiresAt=null] - Optional TTL expiration timestamp in ms
   */
  constructor(key, value, expiresAt = null) {
    this.key = key;
    this.value = value;
    this.expiresAt = expiresAt;
    this.prev = null;
    this.next = null;
  }

  /**
   * Checks if the node has expired relative to a given timestamp.
   * @param {number} [now=Date.now()] - Current epoch timestamp in ms
   * @returns {boolean} True if node has expired, false otherwise
   */
  isExpired(now = Date.now()) {
    return this.expiresAt !== null && now > this.expiresAt;
  }
}

export class DoublyLinkedList {
  constructor() {
    // Sentinel nodes to eliminate null checks and edge cases at boundaries
    this.head = new Node('__SENTINEL_HEAD__', null); // Most Recently Used (MRU) boundary
    this.tail = new Node('__SENTINEL_TAIL__', null); // Least Recently Used (LRU) boundary

    this.head.next = this.tail;
    this.tail.prev = this.head;
    this.length = 0;
  }

  /**
   * Inserts a node right after the sentinel head (MRU position).
   * Time Complexity: O(1)
   * @param {Node} node
   */
  addFirst(node) {
    node.prev = this.head;
    node.next = this.head.next;
    this.head.next.prev = node;
    this.head.next = node;
    this.length++;
  }

  /**
   * Detaches an existing node from anywhere in the list.
   * Time Complexity: O(1)
   * @param {Node} node
   */
  removeNode(node) {
    if (!node.prev || !node.next) {
      return;
    }
    node.prev.next = node.next;
    node.next.prev = node.prev;
    node.prev = null;
    node.next = null;
    this.length--;
  }

  /**
   * Moves an existing node to the MRU position (right after head).
   * Time Complexity: O(1)
   * @param {Node} node
   */
  moveToHead(node) {
    this.removeNode(node);
    this.addFirst(node);
  }

  /**
   * Removes and returns the least recently used node (node right before tail).
   * Time Complexity: O(1)
   * @returns {Node|null} The evicted LRU node, or null if list is empty
   */
  removeLast() {
    if (this.isEmpty()) {
      return null;
    }
    const lruNode = this.tail.prev;
    this.removeNode(lruNode);
    return lruNode;
  }

  /**
   * Checks if the list has no real data nodes.
   * @returns {boolean}
   */
  isEmpty() {
    return this.head.next === this.tail;
  }

  /**
   * Returns list items ordered from MRU (head) to LRU (tail).
   * @returns {Array<{key: *, value: *, expiresAt: number|null}>}
   */
  toArray() {
    const result = [];
    let current = this.head.next;
    while (current !== this.tail) {
      result.push({
        key: current.key,
        value: current.value,
        expiresAt: current.expiresAt
      });
      current = current.next;
    }
    return result;
  }

  /**
   * Makes the list iterable in MRU to LRU order.
   */
  *[Symbol.iterator]() {
    let current = this.head.next;
    while (current !== this.tail) {
      yield current;
      current = current.next;
    }
  }
}
