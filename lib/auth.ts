import { createClient } from '@/lib/supabase/server';
import type { Profile, Role } from '@/lib/database.types';

export async function getCurrentProfile(): Promise<Profile | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
  return (data as Profile) ?? null;
}

const ROLE_RANK: Record<Role, number> = { parent: 0, power_user: 1, admin: 2 };

export function hasRole(profile: Profile | null, minRole: Role): boolean {
  if (!profile) return false;
  return ROLE_RANK[profile.role] >= ROLE_RANK[minRole];
}
