# Backlog

- [ ] **PWA icons** — placeholders in `public/icons/` need real artwork before sharing install links widely.
- [ ] **File uploads for Articles/Lessons** — attachments currently take a plain URL; wire up a Supabase Storage bucket and swap the URL input for a file picker that uploads and returns a public URL.
- [ ] **In-app role management UI** — roles (`parent`/`power_user`/`admin`) can currently only be changed via the Supabase Table Editor.
- [ ] **Remaining `npm audit` finding** — a high-severity PostCSS issue bundled inside Next's own dependency tree; only closes by jumping to Next 16. Low priority since nothing in the app feeds untrusted CSS to the build. Re-check after future `next` version bumps.
- [ ] **Schedule editing for power_users** — currently only admins can post Schedule events; let power_users update/edit them too.
- [ ] **Birthday banner** — automatically show a banner with the person's picture and a "Happy birthday" message on their birthday.
- [x] **App Store / Play Store links** — for Apps entries, let the poster provide just the app name, then supply both an Apple App Store link and a Google Play link.
