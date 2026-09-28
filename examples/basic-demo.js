/**
 * basic-demo.js
 * Demonstrates the core LRU Cache operations exactly as specified in the requirements:
 *
 *   cache = Cache(2)
 *   cache.put("A", 10)
 *   cache.put("B", 20)
 *   cache.get("A") -> 10
 *   cache.put("C", 30)
 *   cache.get("B") -> -1
 *   cache.get("C") -> 30
 *   cache.get("A") -> 10
 */

import { Cache } from '../src/index.js';

function formatState(cache) {
  const entries = cache.dump().mruToLru;
  if (entries.length === 0) return '(empty)';
  return entries.map(e => `[${e.key}: ${e.value}]`).join(' -> ') + ' (MRU -> LRU)';
}

console.log('='.repeat(65));
console.log('  LRU CACHE - BASIC OPERATIONS DEMONSTRATION');
console.log('='.repeat(65));

console.log('\n[Step 1] Initializing cache with positive capacity = 2');
const cache = Cache(2);
console.log(`Capacity: ${cache.capacity}, Initial Size: ${cache.size}`);
console.log(`Current State: ${formatState(cache)}\n`);

console.log('[Step 2] cache.put("A", 10)');
cache.put("A", 10);
console.log(`Current State: ${formatState(cache)}\n`);

console.log('[Step 3] cache.put("B", 20)');
cache.put("B", 20);
console.log(`Current State: ${formatState(cache)}\n`);

console.log('[Step 4] cache.get("A")');
const valA1 = cache.get("A");
console.log(`-> Returned: ${valA1} (Expected: 10)`);
console.log(`-> Notice: "A" was promoted to Most Recently Used (MRU) position!`);
console.log(`Current State: ${formatState(cache)}\n`);

console.log('[Step 5] cache.put("C", 30)');
console.log(`-> Capacity exceeded! "B" was the Least Recently Used (LRU) entry and is evicted.`);
cache.put("C", 30);
console.log(`Current State: ${formatState(cache)}\n`);

console.log('[Step 6] cache.get("B")');
const valB = cache.get("B");
console.log(`-> Returned: ${valB} (Expected: -1 because "B" was evicted)\n`);

console.log('[Step 7] cache.get("C")');
const valC = cache.get("C");
console.log(`-> Returned: ${valC} (Expected: 30)`);
console.log(`Current State: ${formatState(cache)}\n`);

console.log('[Step 8] cache.get("A")');
const valA2 = cache.get("A");
console.log(`-> Returned: ${valA2} (Expected: 10)`);
console.log(`Current State: ${formatState(cache)}\n`);

console.log('='.repeat(65));
console.log('  VERIFICATION SUMMARY');
console.log('='.repeat(65));
const passed = (
  valA1 === 10 &&
  valB === -1 &&
  valC === 30 &&
  valA2 === 10
);

console.log(`Specification Test: ${passed ? 'PASSED ALL CHECKS' : 'FAILED'}`);
console.log('='.repeat(65));
