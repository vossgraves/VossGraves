import argon2 from "argon2";
import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

const scope = process.argv[2];
if (!['admin', 'personal'].includes(scope)) {
  console.error('Usage: node scripts/hash-password.mjs admin|personal');
  process.exit(1);
}

const rl = readline.createInterface({ input, output });
const password = await rl.question(`Enter the ${scope} password (input may be visible in some terminals): `);
rl.close();
if (!password || password.length > 256) {
  console.error('Password must be 1–256 characters.');
  process.exit(1);
}

const hash = await argon2.hash(password, {
  type: argon2.argon2id,
  memoryCost: 19_456,
  timeCost: 2,
  parallelism: 1,
});
console.log(`INSERT INTO auth_passwords (scope, password_hash) VALUES ('${scope}', '${hash}') ON CONFLICT (scope) DO UPDATE SET password_hash = EXCLUDED.password_hash, updated_at = NOW();`);
