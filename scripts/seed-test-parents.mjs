// One-off admin script: creates 5 test parent accounts + a seeded group chat.
// Run with: node --env-file=.env.local scripts/seed-test-parents.mjs
// Requires SUPABASE_SERVICE_ROLE_KEY in .env.local (server-only, never exposed to the browser).

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

const TEST_PARENTS = [
  { email: 'alex.rivera@test.parenthub.local', display_name: 'Alex Rivera' },
  { email: 'jamie.chen@test.parenthub.local', display_name: 'Jamie Chen' },
  { email: 'morgan.patel@test.parenthub.local', display_name: 'Morgan Patel' },
  { email: 'taylor.brooks@test.parenthub.local', display_name: 'Taylor Brooks' },
  { email: 'sam.okafor@test.parenthub.local', display_name: 'Sam Okafor' },
];

async function main() {
  const createdIds = [];

  for (const person of TEST_PARENTS) {
    const { data, error } = await admin.auth.admin.createUser({
      email: person.email,
      email_confirm: true,
      user_metadata: { display_name: person.display_name },
    });

    if (error) {
      if (error.message.toLowerCase().includes('already been registered')) {
        console.log(`Already exists, skipping create: ${person.email}`);
        const { data: list } = await admin.auth.admin.listUsers();
        const existing = list.users.find((u) => u.email === person.email);
        if (existing) createdIds.push(existing.id);
        continue;
      }
      console.error(`Failed to create ${person.email}:`, error.message);
      continue;
    }

    createdIds.push(data.user.id);
    console.log(`Created ${person.display_name} <${person.email}>`);
  }

  console.log('\nSign-in links (open one per browser/incognito window to act as that test parent):\n');
  for (const person of TEST_PARENTS) {
    const { data, error } = await admin.auth.admin.generateLink({
      type: 'magiclink',
      email: person.email,
      options: { redirectTo: 'http://localhost:3000/auth/session' },
    });
    if (error) {
      console.error(`Could not generate link for ${person.email}:`, error.message);
      continue;
    }
    console.log(`${person.display_name}: ${data.properties.action_link}`);
  }

  // Seed a group chat between the 5 test parents and every real (non-test) profile already in the app.
  const { data: allProfiles, error: profilesError } = await admin.from('profiles').select('id, email');
  if (profilesError) {
    console.error('Could not read profiles:', profilesError.message);
    return;
  }

  const realProfileIds = allProfiles
    .filter((p) => !p.email.endsWith('@test.parenthub.local'))
    .map((p) => p.id);

  const memberIds = Array.from(new Set([...createdIds, ...realProfileIds]));
  if (memberIds.length < 2) {
    console.log('\nNot enough members to seed a group chat yet.');
    return;
  }

  const { data: group, error: groupError } = await admin
    .from('chat_groups')
    .insert({ name: 'Test Group Chat', is_dm: false, created_by: memberIds[0] })
    .select()
    .single();

  if (groupError) {
    console.error('Could not create seeded group chat:', groupError.message);
    return;
  }

  await admin.from('chat_group_members').insert(memberIds.map((user_id) => ({ group_id: group.id, user_id })));

  const sampleMessages = [
    { sender_id: memberIds[0], body: 'Hey everyone, testing the new chat feature!' },
    { sender_id: memberIds[1 % memberIds.length], body: 'Looks great so far 👍' },
    { sender_id: memberIds[2 % memberIds.length], body: 'Can everyone see this message?' },
  ];
  await admin.from('messages').insert(sampleMessages.map((m) => ({ ...m, group_id: group.id })));

  console.log(`\nSeeded "Test Group Chat" with ${memberIds.length} members and a few sample messages.`);
}

main();
