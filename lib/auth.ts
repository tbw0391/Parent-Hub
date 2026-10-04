import { cache } from 'react';
import { createClient } from '@/lib/supabase/server';
import type { Profile, Role } from '@/lib/database.types';

// cache() dedupes this within a single request, so the layout, page, and
// banners share one lookup instead of each hitting Supabase separately.
export const getCurrentProfile = cache(async (): Promise<Profile | null> => {
  const supabase = await createClient();
  // getClaims() verifies the JWT locally when the project uses asymmetric
  // signing keys, avoiding a round trip to the Auth server on every render.
  const { data: claimsData } = await supabase.auth.getClaims();
  const userId = claimsData?.claims.sub;
  if (!userId) return null;

  const { data } = await supabase.from('profiles').select('*').eq('id', userId).single();
  return (data as Profile) ?? null;
});

const ROLE_RANK: Record<Role, number> = { parent: 0, power_user: 1, admin: 2 };

export function hasRole(profile: Profile | null, minRole: Role): boolean {
  if (!profile) return false;
  return ROLE_RANK[profile.role] >= ROLE_RANK[minRole];
}
