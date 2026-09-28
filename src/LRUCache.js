/**
 * LRUCache.js
 * High-performance Least Recently Used (LRU) Cache implementation.
 * Supports O(1) get() and put() using a Doubly Linked List and Hash Map.
 * Includes optional TTL (Time-To-Live) expiration support.
 */

import { Node, DoublyLinkedList } from './DoublyLinkedList.js';

export class LRUCache {
  /**
   * Constructs an LRU Cache with a positive capacity.
   * @param {number} capacity - Maximum number of entries the cache can hold.
   * @param {Object} [options={}] - Optional configuration options.
   * @param {number|null} [options.defaultTTL=null] - Default TTL in milliseconds for entries.
   */
  constructor(capacity, options = {}) {
    if (typeof capacity !== 'number' || !Number.isInteger(capacity) || capacity <= 0) {
      throw new TypeError(`Cache capacity must be a positive integer, received: ${capacity}`);
    }

    this._capacity = capacity;
    this._defaultTTL = options.defaultTTL || null;
    this._map = new Map(); // Key -> Node pointer for O(1) lookups
    this._list = new DoublyLinkedList(); // Doubly Linked List for O(1) order tracking
  }

  /**
   * Maximum capacity of the cache.
   * @returns {number}
   */
  get capacity() {
    return this._capacity;
  }

  /**
   * Current number of active (non-expired) items in the cache.
   * @returns {number}
   */
  get size() {
    return this._map.size;
  }

  /**
   * Retrieves the value stored at `key`.
   * If the key exists and has not expired:
   *   - Marks the key as the Most Recently Used (MRU).
   *   - Returns the stored value.
   * Otherwise:
   *   - Returns -1.
   * 
   * Time Complexity: O(1)
   * 
   * @param {*} key - The lookup key.
   * @returns {*} Stored value or -1 if not found / expired.
   */
  get(key) {
    if (!this._map.has(key)) {
      return -1;
    }

    const node = this._map.get(key);

    // TTL check: lazy eviction on access
    if (node.isExpired()) {
      this._evictNode(node);
      return -1;
    }

    // Move accessed node to head of Doubly Linked List (MRU)
    this._list.moveToHead(node);
    return node.value;
  }

  /**
   * Inserts or updates a key/value pair in the cache.
   * - If the key exists, its value is updated, expiration refreshed, and promoted to MRU.
   * - If the key is new:
   *     - If capacity is exceeded, evicts the Least Recently Used (LRU) entry.
   *     - Inserts the new entry at the MRU position.
   * 
   * Time Complexity: O(1)
   * 
   * @param {*} key - Key to store.
   * @param {*} value - Value to associate with key.
   * @param {number|null} [ttl=null] - Optional TTL in milliseconds for this entry.
   * @returns {LRUCache} Current cache instance for chaining.
   */
  put(key, value, ttl = null) {
    const effectiveTTL = ttl !== null ? ttl : this._defaultTTL;
    let expiresAt = null;

    if (effectiveTTL !== null && effectiveTTL !== undefined) {
      if (typeof effectiveTTL !== 'number' || effectiveTTL <= 0) {
        throw new TypeError(`TTL must be a positive number of milliseconds, received: ${effectiveTTL}`);
      }
      expiresAt = Date.now() + effectiveTTL;
    }

    if (this._map.has(key)) {
      // Key already exists: update value and TTL, promote to MRU
      const existingNode = this._map.get(key);
      existingNode.value = value;
      existingNode.expiresAt = expiresAt;
      this._list.moveToHead(existingNode);
      return this;
    }

    // Key is new: check if capacity is reached
    if (this._map.size >= this._capacity) {
      // Evict Least Recently Used (LRU) node from the tail
      const lruNode = this._list.removeLast();
      if (lruNode) {
        this._map.delete(lruNode.key);
      }
    }

    // Create new node and place at the head of list (MRU)
    const newNode = new Node(key, value, expiresAt);
    this._list.addFirst(newNode);
    this._map.set(key, newNode);

    return this;
  }

  /**
   * Checks if a key exists in cache and is not expired without altering LRU order.
   * @param {*} key
   * @returns {boolean}
   */
  has(key) {
    if (!this._map.has(key)) {
      return false;
    }
    const node = this._map.get(key);
    if (node.isExpired()) {
      this._evictNode(node);
      return false;
    }
    return true;
  }

  /**
   * Explicitly removes a key from cache.
   * @param {*} key
   * @returns {boolean} True if removed, false if key did not exist.
   */
  delete(key) {
    if (!this._map.has(key)) {
      return false;
    }
    const node = this._map.get(key);
    this._evictNode(node);
    return true;
  }

  /**
   * Clears all items from the cache.
   */
  clear() {
    this._map.clear();
    this._list = new DoublyLinkedList();
  }

  /**
   * Helper to detach and delete a node from both list and map.
   * @private
   * @param {Node} node
   */
  _evictNode(node) {
    this._list.removeNode(node);
    this._map.delete(node.key);
  }

  /**
   * Returns list of keys ordered from MRU to LRU.
   * @returns {Array<*>}
   */
  keys() {
    const keys = [];
    const now = Date.now();
    for (const node of this._list) {
      if (!node.isExpired(now)) {
        keys.push(node.key);
      }
    }
    return keys;
  }

  /**
   * Returns list of values ordered from MRU to LRU.
   * @returns {Array<*>}
   */
  values() {
    const values = [];
    const now = Date.now();
    for (const node of this._list) {
      if (!node.isExpired(now)) {
        values.push(node.value);
      }
    }
    return values;
  }

  /**
   * Returns array of [key, value] pairs ordered from MRU to LRU.
   * @returns {Array<[*, *]>}
   */
  entries() {
    const entries = [];
    const now = Date.now();
    for (const node of this._list) {
      if (!node.isExpired(now)) {
        entries.push([node.key, node.value]);
      }
    }
    return entries;
  }

  /**
   * Produces a diagnostic snapshot of the cache state.
   * @returns {{ capacity: number, size: number, mruToLru: Array<{key: *, value: *, ttlRemainingMs: number|null}> }}
   */
  dump() {
    const now = Date.now();
    const items = [];
    for (const node of this._list) {
      const expired = node.isExpired(now);
      const ttlRemainingMs = node.expiresAt !== null ? Math.max(0, node.expiresAt - now) : null;
      items.push({
        key: node.key,
        value: node.value,
        expired,
        ttlRemainingMs
      });
    }
    return {
      capacity: this._capacity,
      size: this._map.size,
      mruToLru: items
    };
  }
}

/**
 * Cache factory / constructor that allows instantiation either with or without `new`.
 * Example:
 *   const cache1 = new Cache(2);
 *   const cache2 = Cache(2);
 * 
 * @param {number} capacity - Maximum capacity
 * @param {Object} [options] - Optional settings
 * @returns {LRUCache}
 */
export function Cache(capacity, options) {
  return new LRUCache(capacity, options);
}

// Make `instanceof Cache` check work for instances of LRUCache
Object.defineProperty(Cache, Symbol.hasInstance, {
  value: (instance) => instance instanceof LRUCache
});
