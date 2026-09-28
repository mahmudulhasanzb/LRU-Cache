import { Cache } from './lruCache.js';

function formatState(cache) {
  const entries = cache.getEntries();
  if (entries.length === 0) return '(empty)';
  return entries.map(e => `[${e.key}: ${e.value}]`).join(' -> ') + ' (MRU -> LRU)';
}

console.log('='.repeat(55));
console.log('           LRU CACHE DEMONSTRATION');
console.log('='.repeat(55));

console.log('\n--- 1. Core LRU Cache Operations ---');
const cache = Cache(2);
console.log('Created cache = Cache(2)');

cache.put("A", 10);
console.log('cache.put("A", 10)  => State:', formatState(cache));

cache.put("B", 20);
console.log('cache.put("B", 20)  => State:', formatState(cache));

console.log('cache.get("A")      =>', cache.get("A"));
console.log('                    => State:', formatState(cache), '("A" promoted to MRU)');

cache.put("C", 30);
console.log('cache.put("C", 30)  => State:', formatState(cache), '("B" evicted as LRU)');

console.log('cache.get("B")      =>', cache.get("B"), '(not found / evicted)');
console.log('cache.get("C")      =>', cache.get("C"));
console.log('cache.get("A")      =>', cache.get("A"));

console.log('\n--- 2. Optional Bonus: TTL / Expiration Support ---');
const ttlCache = Cache(2);
console.log('Created ttlCache = Cache(2)');

ttlCache.put("token", "xyz123", 1000); // 1000ms TTL
ttlCache.put("user", "Alice");        // No expiration

console.log('ttlCache.put("token", "xyz123", 1000) (expires in 1000ms)');
console.log('ttlCache.put("user", "Alice")');
console.log('Immediate read:');
console.log('  ttlCache.get("token") =>', ttlCache.get("token"));
console.log('  ttlCache.get("user")  =>', ttlCache.get("user"));

console.log('\nWaiting 1100ms for "token" to expire...');
setTimeout(() => {
  console.log('Read after expiration:');
  console.log('  ttlCache.get("token") =>', ttlCache.get("token"), '(expired & lazily evicted)');
  console.log('  ttlCache.get("user")  =>', ttlCache.get("user"), '(still active)');
  console.log('\n' + '='.repeat(55));
}, 1100);
