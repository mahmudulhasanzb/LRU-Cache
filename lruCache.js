class Node {
  constructor(key, value, expiresAt = null) {
    this.key = key;
    this.value = value;
    this.expiresAt = expiresAt;
    this.prev = null;
    this.next = null;
  }
}

export class LRUCache {
  constructor(capacity) {
    if (!Number.isInteger(capacity) || capacity <= 0) {
      throw new Error("Capacity must be a positive integer");
    }
    this.capacity = capacity;
    this.map = new Map();

    // Sentinel nodes for O(1) doubly linked list operations
    this.head = new Node(null, null); // MRU boundary
    this.tail = new Node(null, null); // LRU boundary
    this.head.next = this.tail;
    this.tail.prev = this.head;
  }

  get(key) {
    if (!this.map.has(key)) {
      return -1;
    }

    const node = this.map.get(key);

    // TTL check (optional bonus feature)
    if (node.expiresAt && Date.now() > node.expiresAt) {
      this._remove(node);
      this.map.delete(key);
      return -1;
    }

    this._moveToHead(node);
    return node.value;
  }

  put(key, value, ttl = null) {
    const expiresAt = typeof ttl === 'number' && ttl > 0 ? Date.now() + ttl : null;

    if (this.map.has(key)) {
      const node = this.map.get(key);
      node.value = value;
      node.expiresAt = expiresAt;
      this._moveToHead(node);
      return;
    }

    if (this.map.size >= this.capacity) {
      const lru = this.tail.prev;
      this._remove(lru);
      this.map.delete(lru.key);
    }

    const newNode = new Node(key, value, expiresAt);
    this._addFirst(newNode);
    this.map.set(key, newNode);
  }

  _addFirst(node) {
    node.prev = this.head;
    node.next = this.head.next;
    this.head.next.prev = node;
    this.head.next = node;
  }

  _remove(node) {
    node.prev.next = node.next;
    node.next.prev = node.prev;
    node.prev = null;
    node.next = null;
  }

  _moveToHead(node) {
    this._remove(node);
    this._addFirst(node);
  }

  // Returns array of entries in MRU -> LRU order
  getEntries() {
    const entries = [];
    let current = this.head.next;
    while (current !== this.tail) {
      entries.push({ key: current.key, value: current.value });
      current = current.next;
    }
    return entries;
  }
}

export function Cache(capacity) {
  return new LRUCache(capacity);
}
