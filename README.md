# Parent Hub
Todd Wilson
A PWA for parents: Articles, Polls, Prayer & Praise, Lessons, Schedule, and Chat (group + 1:1).
Built with Next.js 15 (App Router) + Supabase (auth, Postgres, Realtime), meant to deploy on
Vercel. Installability comes from a hand-written `public/sw.js` + `public/manifest.json` rather
than a PWA build plugin (see "Notes" below for why).

## Roles

Every signed-up user starts as `parent`. Two higher roles unlock more posting permissions:

| Role | Can post |
|---|---|
| `parent` (default) | Prayer & Praise entries, start chats, send messages, vote in polls |
| `power_user` | everything a parent can, plus Polls and Lessons |
| `admin` | everything a power_user can, plus Articles and Schedule events |

Roles are assigned by editing the `role` column on a user's row in the `profiles` table from the
Supabase Table Editor — there's no in-app role management UI yet.

## 1. Create the Supabase project

1. Create a project at https://supabase.com.
2. In the SQL Editor, run `supabase/migrations/0001_init.sql` — this creates every table, the
   auto-profile trigger, and all row-level security policies.
3. In Authentication → URL Configuration, add your local dev URL
   (`http://localhost:3000/auth/callback`) and your future Vercel URL
   (`https://YOUR-APP.vercel.app/auth/callback`) as redirect URLs.
4. In Authentication → Providers, confirm Email (magic link / OTP) is enabled.
5. Copy your Project URL and anon public key from Project Settings → API.

## 2. Run locally

```bash
cp .env.local.example .env.local
# paste your Supabase URL + anon key into .env.local
npm install
npm run dev
```

Sign in with your own email via the magic link. Your profile row is created automatically with
role `parent`. To test admin/power_user views, open the Supabase Table Editor, find your row in
`profiles`, and change `role` to `power_user` or `admin`.

## 3. Deploy to Vercel

1. Push this project to a GitHub repo.
2. In Vercel, "Add New Project" → import that repo.
3. Add the two environment variables from `.env.local` in Vercel's Project Settings → Environment
   Variables (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`).
4. Deploy. Then go back to Supabase Authentication → URL Configuration and make sure your real
   Vercel URL's `/auth/callback` is in the allowed redirect list.
5. Promote your own account to `admin` in the Supabase Table Editor so you can post Articles and
   Schedule events.

## Notes / next steps you may want

- The PWA icons in `public/icons/` are simple placeholders (purple + acid green) generated for
  this scaffold — swap them for real artwork before sharing installable links widely.
- Image/file attachments for Articles and Lessons currently take a plain URL. If you want parents
  to upload files directly, wire up a Supabase Storage bucket and swap the URL input for a file
  picker that uploads and returns a public URL.
- **Why no `next-pwa`**: the scaffold originally used `next-pwa`, but it's unmaintained and its
  bundled Workbox toolchain pulled in several high-severity vulnerable transitive dependencies.
  It's been replaced with a small hand-written `public/sw.js` (cache the app shell, network-first
  for everything else) registered from `components/RegisterServiceWorker.tsx`. It's enough to make
  the app installable; if you later want richer offline behavior, revisit that file.
- **Also worth knowing**: the scaffold started on Next.js 14.2.x, but `npm audit` turned up a
  critical, unpatched-in-14.x RCE in the Image Optimization API plus several high-severity
  Server Actions/RSC issues — none of which had a 14.x fix. The app was upgraded to the patched
  `15.5.25` release to close those; `next.config.js` also fully disables the Image Optimization
  API (`images.unoptimized: true`) since the app doesn't use `next/image` at all. One remaining
  `npm audit` finding (high-severity PostCSS bugs, bundled *inside* Next's own dependency tree) is
  left as-is — fixing it would mean jumping to the very new Next 16, and the bug only matters if
  an attacker can feed Next's build-time CSS processing untrusted CSS, which nothing in this app
  does. Re-run `npm audit` after any future `next` version bump to see if it's resolved upstream.
- `npm run build` passes in this environment with Node v24.21.0 / npm 11.19.0. If you set up CI or
  a different machine, make sure it's on a similarly current Node LTS.
