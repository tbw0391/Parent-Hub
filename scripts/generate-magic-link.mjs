// Generates a sign-in link for any email without sending an actual email,
// so it bypasses Supabase's built-in mailer rate limit entirely.
// Run with: node --env-file=.env.local scripts/generate-magic-link.mjs you@example.com

import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const email = process.argv[2];

if (!url || !serviceKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}
if (!email) {
  console.error('Usage: node --env-file=.env.local scripts/generate-magic-link.mjs you@example.com');
  process.exit(1);
}

const admin = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const { data, error } = await admin.auth.admin.generateLink({
  type: 'magiclink',
  email,
  options: { redirectTo: 'http://localhost:3000/auth/callback' },
});

if (error) {
  console.error(`Could not generate link for ${email}:`, error.message);
  process.exit(1);
}

console.log(data.properties.action_link);
