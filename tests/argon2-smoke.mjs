import assert from "node:assert/strict";
import argon2 from "argon2";

const sample = "local-test-only-password";
const hash = await argon2.hash(sample, {
  type: argon2.argon2id,
  memoryCost: 19_456,
  timeCost: 2,
  parallelism: 1,
});
assert.equal(await argon2.verify(hash, sample), true);
assert.equal(await argon2.verify(hash, "not-the-password"), false);
assert.equal(hash.includes(sample), false);
console.log("Argon2id verification smoke test passed.");
