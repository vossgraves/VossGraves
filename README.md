# Voss Graves

A recovered Next.js portfolio site with the original dark, particle-based visual direction, long-press access entry point, an admin editor, and a protected personal page. Public content, personal content, projects, questions, password hashes, sessions, and rate-limit records are deliberately separated in Neon.

## What is preserved

The public home page keeps the dark minimal aesthetic, animated particle field, radial lighting, the long-press name trigger, the time widget, project cards, social links, question form, and both admin and personal access modes. The particle field adapts to the device: it uses fewer particles, a lower capped pixel ratio, and a 30 FPS budget on lower-end hardware. It pauses in background tabs and becomes a static gradient when reduced motion is requested.

## Security model

Passwords are **never** stored in the source code, client bundle, Git history going forward, or browser-accessible variables. Only Argon2id password hashes are kept in `auth_passwords`. Successful checks create 256-bit opaque, `HttpOnly`, `Secure` (production), `SameSite=Lax` session cookies. Session identifiers are SHA-256 hashed before they reach Neon and expire after 30 minutes by default. Failed login attempts are rate-limited by a hashed request address per access scope.

> The two passwords shared in the task conversation should be replaced with new, unique values before production use. Do not add either value to `.env`, a commit, a Vercel build log, or this README.

## Neon setup

1. In the Neon SQL editor, run `db/schema.sql` once.
2. Create a new random admin password and a new random personal password. Use a password manager rather than reusing the previously shared values.
3. On a trusted computer, run `pnpm hash-password admin` and `pnpm hash-password personal`. Each command prints one `INSERT ... ON CONFLICT` query; run those queries in Neon. The plaintext input is not written to the project.
4. In the Vercel project, set `DATABASE_URL` to the Neon pooled connection string for **Production**, **Preview**, and **Development**. Do not create a `NEXT_PUBLIC_DATABASE_URL` variable.
5. Deploy. The public page will display fallback text if Neon is unreachable, while protected routes intentionally remain unavailable until the database is configured.

## Development

```bash
pnpm install
cp .env.example .env
# Set DATABASE_URL only in your local .env file.
pnpm dev
```

Validate locally with:

```bash
pnpm typecheck
pnpm test:auth
pnpm build
```

## Personal Vercel deployment

Import `Vossgraves/vossgraved.` into the personal Vercel account, select the repository root as the project root, add the `DATABASE_URL` variable, and deploy. Then add `vossgraves.cyou` in the project’s domain settings. Vercel will show the exact DNS record to keep or update at the domain registrar; wait until it shows the domain as verified before changing the production alias.

## Repository policy

The unrelated historical Polaris bot is retained under `legacy-polaris/` so the repository’s previous files are not silently destroyed. The live web app is at the repository root. Before the public push, run a full working-tree and Git-history secret scan. If an old secret is found in history, rotate it at the provider and use a history-rewrite tool before making the repository public.
