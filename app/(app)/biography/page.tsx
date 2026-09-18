import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { getCurrentProfile, hasRole } from '@/lib/auth';
import type { Child, Profile } from '@/lib/database.types';

const ROLE_LABEL: Record<Profile['role'], string> = {
  parent: 'Parent',
  power_user: 'Power user',
  admin: 'Admin',
};

function formatDate(iso: string) {
  return new Date(iso + 'T00:00:00').toLocaleDateString(undefined, { month: 'long', day: 'numeric' });
}

export default async function BiographyPage() {
  const supabase = await createClient();
  const me = await getCurrentProfile();

  const { data: profilesData } = await supabase
    .from('profiles')
    .select('*')
    .order('display_name', { ascending: true });
  const profiles = (profilesData as Profile[] | null) ?? [];

  const { data: childrenData } = await supabase
    .from('children')
    .select('*')
    .order('birth_date', { ascending: true });
  const children = (childrenData as Child[] | null) ?? [];

  const profileById = new Map(profiles.map((p) => [p.id, p]));
  const kidsByParent = new Map<string, Child[]>();
  for (const child of children) {
    kidsByParent.set(child.parent_id, [...(kidsByParent.get(child.parent_id) ?? []), child]);
  }

  const photoUrlById = new Map<string, string>();
  await Promise.all(
    profiles
      .filter((p) => p.photo_path)
      .map(async (p) => {
        const { data } = await supabase.storage.from('avatars').createSignedUrl(p.photo_path!, 3600);
        if (data?.signedUrl) photoUrlById.set(p.id, data.signedUrl);
      })
  );

  function spouseOf(profile: Profile): Profile | null {
    if (profile.spouse_id) return profileById.get(profile.spouse_id) ?? null;
    const reverse = profiles.find((p) => p.spouse_id === profile.id);
    return reverse ?? null;
  }

  const iAmAdmin = hasRole(me, 'admin');

  return (
    <div className="flex flex-col gap-6 py-6">
      <h1 className="text-xl font-semibold text-acid">Biography</h1>
      <p className="text-sm text-acidDim">Everyone signed up for Parent Hub, and their kids.</p>

      <div className="flex flex-col gap-3">
        {profiles.length ? (
          profiles.map((parent) => {
            const spouse = spouseOf(parent);
            const spouseLabel = spouse?.display_name ?? (parent.is_married ? parent.spouse_name : null);
            const kids = kidsByParent.get(parent.id) ?? [];
            const canEdit = me && (me.id === parent.id || iAmAdmin);
            const photoUrl = photoUrlById.get(parent.id);
            const address = [parent.address_line1, [parent.city, parent.state, parent.zip].filter(Boolean).join(', ')]
              .filter(Boolean)
              .join(' · ');

            return (
              <div key={parent.id} className="rounded-lg border border-acidDim/20 bg-panel p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    {photoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={photoUrl}
                        alt={parent.display_name}
                        className="h-12 w-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-acidDim/10 text-sm font-medium text-acidDim">
                        {parent.display_name.slice(0, 1).toUpperCase()}
                      </div>
                    )}
                    <span className="text-base font-medium text-ink">{parent.display_name || parent.email}</span>
                  </div>
                  {parent.role !== 'parent' && (
                    <span className="rounded-full bg-pumpkin/20 px-2 py-0.5 text-xs font-medium text-pumpkin">
                      {ROLE_LABEL[parent.role]}
                    </span>
                  )}
                </div>

                <dl className="mt-2 flex flex-col gap-1 text-sm text-acidDim">
                  {parent.profession && <div>{parent.profession}</div>}
                  {address && <div>{address}</div>}
                  <div>{parent.email}</div>
                  {parent.phone && <div>{parent.phone}</div>}
                  {spouseLabel && <div>Spouse: {spouseLabel}</div>}
                  {parent.anniversary && <div>Anniversary: {formatDate(parent.anniversary)}</div>}
                  {parent.birthday && <div>Birthday: {formatDate(parent.birthday)}</div>}
                </dl>

                {kids.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {kids.map((kid) => (
                      <span
                        key={kid.id}
                        className="rounded-full border border-acidDim/30 px-2 py-1 text-xs text-ink"
                      >
                        {kid.name} · {formatDate(kid.birth_date)}
                      </span>
                    ))}
                  </div>
                )}

                {canEdit && (
                  <Link
                    href={`/biography/${parent.id}`}
                    className="mt-3 inline-block text-xs text-acid"
                  >
                    {me?.id === parent.id ? 'Edit my info →' : 'Edit (admin) →'}
                  </Link>
                )}
              </div>
            );
          })
        ) : (
          <p className="text-sm text-acidDim">No parents yet.</p>
        )}
      </div>
    </div>
  );
}
