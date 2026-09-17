// Regenerates sign-in links for the 5 test parents created by seed-test-parents.mjs
// Run with: node --env-file=.env.local scripts/generate-test-links.mjs

import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

const admin = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const TEST_EMAILS = [
  ['Alex Rivera', 'alex.rivera@test.parenthub.local'],
  ['Jamie Chen', 'jamie.chen@test.parenthub.local'],
  ['Morgan Patel', 'morgan.patel@test.parenthub.local'],
  ['Taylor Brooks', 'taylor.brooks@test.parenthub.local'],
  ['Sam Okafor', 'sam.okafor@test.parenthub.local'],
];

for (const [name, email] of TEST_EMAILS) {
  const { data, error } = await admin.auth.admin.generateLink({
    type: 'magiclink',
    email,
    options: { redirectTo: 'http://localhost:3000/auth/session' },
  });
  if (error) {
    console.error(`Could not generate link for ${email}:`, error.message);
    continue;
  }
  console.log(`${name}: ${data.properties.action_link}`);
}
