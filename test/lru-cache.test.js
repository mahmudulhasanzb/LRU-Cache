/**
 * lru-cache.test.js
 * Comprehensive automated test suite using Node.js built-in test runner (zero external dependencies).
 */

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { Cache, LRUCache, Node, DoublyLinkedList } from '../src/index.js';

describe('LRU Cache Core Specification', () => {

  test('Rejects non-positive or invalid capacity', () => {
    assert.throws(() => Cache(0), TypeError);
    assert.throws(() => Cache(-1), TypeError);
    assert.throws(() => Cache(-100), TypeError);
    assert.throws(() => Cache(1.5), TypeError);
    assert.throws(() => Cache('5'), TypeError);
    assert.throws(() => Cache(NaN), TypeError);
    assert.throws(() => Cache(null), TypeError);
    assert.throws(() => Cache(undefined), TypeError);

    // Valid positive integers should not throw
    assert.doesNotThrow(() => Cache(1));
    assert.doesNotThrow(() => Cache(10));
    assert.doesNotThrow(() => new Cache(2));
    assert.doesNotThrow(() => new LRUCache(2));
  });

  test('Executes exact problem statement example', () => {
    const cache = Cache(2);

    cache.put("A", 10);
    cache.put("B", 20);

    assert.equal(cache.get("A"), 10, 'get("A") should return 10 and make "A" MRU');

    cache.put("C", 30); // Evicts "B" (least recently used)

    assert.equal(cache.get("B"), -1, 'get("B") should return -1 because "B" was evicted');
    assert.equal(cache.get("C"), 30, 'get("C") should return 30');
    assert.equal(cache.get("A"), 10, 'get("A") should return 10');
  });

  test('Operates correctly with capacity = 1', () => {
    const cache = Cache(1);
    assert.equal(cache.capacity, 1);
    assert.equal(cache.size, 0);

    cache.put("x", 100);
    assert.equal(cache.size, 1);
    assert.equal(cache.get("x"), 100);

    cache.put("y", 200);
    assert.equal(cache.size, 1);
    assert.equal(cache.get("x"), -1, '"x" should be evicted');
    assert.equal(cache.get("y"), 200);
  });

  test('Updating an existing key updates value, promotes to MRU, and does not increase size', () => {
    const cache = Cache(2);

    cache.put("key1", "val1");
    cache.put("key2", "val2");
    assert.equal(cache.size, 2);

    // Update key1
    cache.put("key1", "val1_updated");
    assert.equal(cache.size, 2);
    assert.equal(cache.get("key1"), "val1_updated");

    // "key2" should now be the LRU; inserting "key3" should evict "key2"
    cache.put("key3", "val3");
    assert.equal(cache.get("key2"), -1, '"key2" should be evicted');
    assert.equal(cache.get("key1"), "val1_updated");
    assert.equal(cache.get("key3"), "val3");
  });

  test('Repeated get() accesses keep promoting entry to MRU', () => {
    const cache = Cache(3);
    cache.put(1, 'one');
    cache.put(2, 'two');
    cache.put(3, 'three');

    // Access 1 repeatedly
    cache.get(1);
    cache.get(1);

    // Add 4, should evict 2 (which is LRU now)
    cache.put(4, 'four');
    assert.equal(cache.get(2), -1);
    assert.equal(cache.get(1), 'one');
    assert.equal(cache.get(3), 'three');
    assert.equal(cache.get(4), 'four');
  });

  test('Non-existent key returns -1 and does not alter cache', () => {
    const cache = Cache(2);
    cache.put("alpha", 1);
    assert.equal(cache.get("nonExistent"), -1);
    assert.equal(cache.size, 1);
  });

  test('Supports various key and value types', () => {
    const cache = Cache(3);
    const objKey = { id: 42 };
    const numKey = 999;
    const fnVal = () => 'result';

    cache.put(objKey, { data: 'objectValue' });
    cache.put(numKey, fnVal);
    cache.put('strKey', null);

    assert.deepEqual(cache.get(objKey), { data: 'objectValue' });
    assert.equal(cache.get(numKey), fnVal);
    assert.equal(cache.get('strKey'), null);
  });

  test('Utility methods: has, delete, clear, keys, values, entries', () => {
    const cache = Cache(3);
    cache.put("A", 1);
    cache.put("B", 2);
    cache.put("C", 3);

    assert.equal(cache.has("B"), true);
    assert.equal(cache.has("Z"), false);

    assert.deepEqual(cache.keys(), ["C", "B", "A"]);
    assert.deepEqual(cache.values(), [3, 2, 1]);
    assert.deepEqual(cache.entries(), [["C", 3], ["B", 2], ["A", 1]]);

    assert.equal(cache.delete("B"), true);
    assert.equal(cache.delete("B"), false);
    assert.equal(cache.size, 2);
    assert.equal(cache.get("B"), -1);

    cache.clear();
    assert.equal(cache.size, 0);
    assert.equal(cache.get("A"), -1);
    assert.equal(cache.get("C"), -1);
  });
});

describe('DoublyLinkedList Unit Tests', () => {
  test('Sentinel nodes maintain valid empty list boundaries', () => {
    const list = new DoublyLinkedList();
    assert.equal(list.isEmpty(), true);
    assert.equal(list.length, 0);
    assert.equal(list.removeLast(), null);
  });

  test('addFirst, moveToHead, and removeLast behave correctly', () => {
    const list = new DoublyLinkedList();
    const n1 = new Node('k1', 'v1');
    const n2 = new Node('k2', 'v2');
    const n3 = new Node('k3', 'v3');

    list.addFirst(n1);
    list.addFirst(n2);
    list.addFirst(n3);

    assert.equal(list.length, 3);
    assert.deepEqual(list.toArray().map(n => n.key), ['k3', 'k2', 'k1']);

    list.moveToHead(n1);
    assert.deepEqual(list.toArray().map(n => n.key), ['k1', 'k3', 'k2']);

    const evicted = list.removeLast();
    assert.equal(evicted.key, 'k2');
    assert.equal(list.length, 2);
    assert.deepEqual(list.toArray().map(n => n.key), ['k1', 'k3']);
  });
});

describe('Optional Bonus: Time-To-Live (TTL) Support', () => {
  const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  test('Validates TTL parameter', () => {
    const cache = Cache(2);
    assert.throws(() => cache.put("k", "v", -10), TypeError);
    assert.throws(() => cache.put("k", "v", 0), TypeError);
    assert.throws(() => cache.put("k", "v", "100"), TypeError);
  });

  test('Retains item before TTL expires and evicts after expiration', async () => {
    const cache = Cache(2);
    cache.put("temp", "expiringVal", 100); // 100ms TTL

    // Immediate read
    assert.equal(cache.get("temp"), "expiringVal");

    // Wait 120ms
    await sleep(120);

    // Read after expiry
    assert.equal(cache.get("temp"), -1, 'Expired key should return -1');
    assert.equal(cache.size, 0, 'Expired key should be lazily removed from cache');
    assert.equal(cache.has("temp"), false);
  });

  test('Updating a key can update or clear TTL', async () => {
    const cache = Cache(2);
    cache.put("k", "v1", 100);

    // Update with no TTL (persists)
    cache.put("k", "v2", null);

    await sleep(120);
    assert.equal(cache.get("k"), "v2", 'Item should persist since TTL was cleared');
  });
});

describe('Performance & O(1) Benchmark', () => {
  test('100,000 get and put operations complete with strict O(1) speed', () => {
    const cache = Cache(1000);
    const numOps = 100000;
    const startTime = performance.now();

    for (let i = 0; i < numOps; i++) {
      cache.put(i % 2000, i);
      if (i % 2 === 0) {
        cache.get(i % 1500);
      }
    }

    const duration = performance.now() - startTime;
    // 100,000 operations should comfortably finish in well under 250ms in Node V8
    assert.ok(duration < 250, `100,000 operations took ${duration.toFixed(2)}ms (expected < 250ms)`);
  });
});
