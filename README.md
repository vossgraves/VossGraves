# vossed

This is a [Next.js](https://nextjs.org) project bootstrapped with [v0](https://v0.app).

## Built with v0

This repository is linked to a [v0](https://v0.app) project. You can continue developing by visiting the link below -- start new chats to make changes, and v0 will push commits directly to this repo. Every merge to `main` will automatically deploy.

[Continue working on v0 →](https://v0.app/chat/projects/prj_AYWbKURvQqJEE9TA8mw5tn8iVrtC)

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

## Learn More

To learn more, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.
- [v0 Documentation](https://v0.app/docs) - learn about v0 and how to use it.


## Secure deployment notes

This repository uses the uploaded Voss Graves customization as its canonical visual source. The original particle field, responsive sections, top navigation, content editor, project/file cards, Ask Me flow, and long-press access dialog are preserved.

The database layer is server-only and uses Neon through `DATABASE_URL`. Apply `db/schema.sql` in Neon before enabling editing. Public profile rows and personal profile rows are stored separately, and public rendering never queries the personal tables. Project records carry a `public` or `personal` visibility and are protected by server-side authorization.

Passwords are not read from browser code or plaintext environment variables. Generate Argon2id hashes locally with `pnpm hash-password admin` and `pnpm hash-password personal`, then run the generated SQL in Neon. The app stores only those hashes, verifies them server-side, rate-limits failed attempts, and issues opaque, hashed, revocable HttpOnly sessions. Do not commit generated SQL, password values, `.env` files, or Neon connection strings.

For Vercel, add `DATABASE_URL` to the Personal project’s Production, Preview, and Development environments as needed. Keep the value server-only. The archive’s particle aesthetic remains enabled, but its canvas scales particle count, pixel density, and frame cadence for reduced-motion settings and lower-end devices.
