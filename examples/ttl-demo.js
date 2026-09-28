/**
 * ttl-demo.js
 * Demonstrates the optional bonus feature: Time-To-Live (TTL) expiration support.
 * 
 * Shows:
 * 1. Storing keys with individual expiration timeouts (ttl in milliseconds).
 * 2. Active retention before expiration.
 * 3. Lazy eviction upon get() access after expiration (returns -1).
 * 4. Memory cleanup without invalidating unexpired items.
 */

import { Cache } from '../src/index.js';

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

function formatState(cache) {
  const entries = cache.dump().mruToLru;
  if (entries.length === 0) return '(empty)';
  return entries.map(e => {
    const ttlInfo = e.ttlRemainingMs !== null ? ` (TTL: ${e.ttlRemainingMs}ms left)` : ' (No TTL)';
    return `[${e.key}: "${e.value}"${ttlInfo}]`;
  }).join(' -> ') + ' (MRU -> LRU)';
}

async function runTTLDemo() {
  console.log('='.repeat(70));
  console.log('  LRU CACHE - OPTIONAL BONUS: TTL EXPIRATION DEMONSTRATION');
  console.log('='.repeat(70));

  console.log('\n[Step 1] Initializing Cache(capacity = 3)');
  const cache = Cache(3);

  console.log('\n[Step 2] Inserting entries with different TTL policies:');
  console.log('  - "tempToken" with 800ms TTL');
  console.log('  - "userProfile" with 2500ms TTL');
  console.log('  - "systemConfig" with no expiration (persistent)');

  cache.put("tempToken", "xyz-auth-token-123", 800);
  cache.put("userProfile", "Mahmudul Hasan", 2500);
  cache.put("systemConfig", "Production_v2.0");

  console.log(`Current State: ${formatState(cache)}`);
  console.log(`Cache Size: ${cache.size}`);

  console.log('\n[Step 3] Immediate reads (before expiration):');
  console.log(`-> get("tempToken")    : "${cache.get("tempToken")}"    (Expected: "xyz-auth-token-123")`);
  console.log(`-> get("userProfile")  : "${cache.get("userProfile")}"  (Expected: "Mahmudul Hasan")`);
  console.log(`-> get("systemConfig") : "${cache.get("systemConfig")}" (Expected: "Production_v2.0")`);

  console.log('\n[Step 4] Waiting 1000ms for "tempToken" to expire...');
  await sleep(1000);

  console.log('\n[Step 5] Reads after 1000ms:');
  const tokenAfterExpiry = cache.get("tempToken");
  console.log(`-> get("tempToken")    : ${tokenAfterExpiry} (Expected: -1 because 800ms TTL expired)`);
  console.log(`   Notice: "tempToken" was lazily evicted on access!`);
  console.log(`-> get("userProfile")  : "${cache.get("userProfile")}" (Still valid)`);
  console.log(`-> get("systemConfig") : "${cache.get("systemConfig")}" (Still valid)`);

  console.log(`\nState after lazy eviction: ${formatState(cache)}`);
  console.log(`Cache Size: ${cache.size} (Decreased from 3 to 2 because expired item was purged)`);

  console.log('\n[Step 6] Inserting a new item without triggering LRU eviction:');
  cache.put("newSession", "active_session_456", 5000);
  console.log(`cache.put("newSession", "active_session_456", 5000)`);
  console.log(`Current State: ${formatState(cache)}`);
  console.log(`Cache Size: ${cache.size} / ${cache.capacity}`);

  console.log('\n[Step 7] Updating existing item "systemConfig" and adding 600ms TTL:');
  cache.put("systemConfig", "Production_v2.1", 600);
  console.log(`Current State: ${formatState(cache)}`);

  console.log('\n[Step 8] Waiting 700ms for updated "systemConfig" to expire...');
  await sleep(700);

  const updatedConfigAfterExpiry = cache.get("systemConfig");
  console.log(`-> get("systemConfig") : ${updatedConfigAfterExpiry} (Expected: -1 after TTL expiration)`);

  console.log('\n' + '='.repeat(70));
  console.log('  TTL BONUS DEMONSTRATION COMPLETE');
  console.log('='.repeat(70));
}

runTTLDemo().catch(console.error);
