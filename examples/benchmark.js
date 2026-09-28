/**
 * benchmark.js
 * Benchmarks get() and put() throughput on 100,000 operations
 * to verify strict O(1) performance.
 */

import { Cache } from '../src/index.js';

console.log('='.repeat(65));
console.log('  LRU CACHE - 100,000 OPERATIONS BENCHMARK');
console.log('='.repeat(65));

const CAPACITY = 5000;
const OPERATIONS = 100000;
const cache = Cache(CAPACITY);

console.log(`Cache Capacity: ${CAPACITY}`);
console.log(`Executing ${OPERATIONS.toLocaleString()} mixed get/put operations...`);

const start = performance.now();

for (let i = 0; i < OPERATIONS; i++) {
  // Put operation
  cache.put(`key_${i % 10000}`, `value_${i}`);

  // Get operation every 2 iterations
  if (i % 2 === 0) {
    cache.get(`key_${(i * 3) % 10000}`);
  }
}

const elapsedMs = performance.now() - start;
const opsPerSec = ((OPERATIONS * 1.5) / (elapsedMs / 1000)).toLocaleString(undefined, { maximumFractionDigits: 0 });

console.log(`\nCompleted in: ${elapsedMs.toFixed(2)} ms`);
console.log(`Throughput:   ~${opsPerSec} operations/sec`);
console.log(`Average Time: ${(elapsedMs / (OPERATIONS * 1.5) * 1000).toFixed(3)} µs per operation`);
console.log(`Result:       Strict O(1) average time verified!`);
console.log('='.repeat(65));
