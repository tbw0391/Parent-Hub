import { hasRole } from '@/lib/auth';
import type { Profile, Role } from '@/lib/database.types';

export function RoleGate({
  profile,
  minRole,
  children,
}: {
  profile: Profile | null;
  minRole: Role;
  children: React.ReactNode;
}) {
  if (!hasRole(profile, minRole)) return null;
  return <>{children}</>;
}
