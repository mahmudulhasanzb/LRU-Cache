import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { Cache, LRUCache } from './lruCache.js';

describe('LRU Cache', () => {
  test('Capacity validation', () => {
    assert.throws(() => Cache(0), /Capacity must be a positive integer/);
    assert.throws(() => Cache(-5), /Capacity must be a positive integer/);
    assert.throws(() => Cache('2'), /Capacity must be a positive integer/);
    assert.doesNotThrow(() => Cache(2));
  });

  test('Required example flow', () => {
    const cache = Cache(2);
    cache.put("A", 10);
    cache.put("B", 20);
    assert.equal(cache.get("A"), 10);
    cache.put("C", 30);
    assert.equal(cache.get("B"), -1);
    assert.equal(cache.get("C"), 30);
    assert.equal(cache.get("A"), 10);
  });

  test('Updating an existing key refreshes its value and recency', () => {
    const cache = Cache(2);
    cache.put("A", 10);
    cache.put("B", 20);
    cache.put("A", 100); // Update A
    cache.put("C", 30);  // Should evict B, not A
    assert.equal(cache.get("A"), 100);
    assert.equal(cache.get("B"), -1);
    assert.equal(cache.get("C"), 30);
  });

  test('TTL bonus expiration', async () => {
    const cache = Cache(2);
    cache.put("temp", "val", 50); // 50ms TTL
    assert.equal(cache.get("temp"), "val");

    await new Promise(resolve => setTimeout(resolve, 70));
    assert.equal(cache.get("temp"), -1);
  });
});
