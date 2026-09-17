import { createClient } from '@/lib/supabase/server';
import { getCurrentProfile, hasRole } from '@/lib/auth';
import type { Child, Profile } from '@/lib/database.types';
import { updateMyDetails, addChild, deleteChild, uploadPhoto } from './actions';

const ROLE_LABEL: Record<Profile['role'], string> = {
  parent: 'Parent',
  power_user: 'Power user',
  admin: 'Admin',
};

function formatDate(iso: string) {
  return new Date(iso + 'T00:00:00').toLocaleDateString(undefined, { month: 'long', day: 'numeric' });
}

export default async function ParentsPage() {
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
      <h1 className="text-xl font-semibold text-acid">Parents</h1>
      <p className="text-sm text-acidDim">Everyone signed up for Parent Hub.</p>

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
                  <details className="mt-3">
                    <summary className="cursor-pointer text-xs text-acid">
                      {me?.id === parent.id ? 'Edit my info' : 'Edit (admin)'}
                    </summary>

                    <form
                      action={uploadPhoto}
                      className="mt-3 flex flex-wrap items-end gap-2 rounded-md border border-acidDim/20 bg-ground p-3"
                    >
                      <input type="hidden" name="target_id" value={parent.id} />
                      <label className="flex-1 text-xs text-acidDim">
                        Photo
                        <input
                          type="file"
                          name="photo"
                          accept="image/*"
                          required
                          className="mt-1 block w-full text-sm text-ink"
                        />
                      </label>
                      <button
                        type="submit"
                        className="rounded-md bg-pumpkin px-3 py-1.5 text-xs font-medium text-ground"
                      >
                        Upload photo
                      </button>
                    </form>

                    <form
                      action={updateMyDetails}
                      className="mt-3 flex flex-col gap-2 rounded-md border border-acidDim/20 bg-ground p-3"
                    >
                      <input type="hidden" name="target_id" value={parent.id} />
                      <input
                        name="display_name"
                        required
                        placeholder="Your name"
                        defaultValue={parent.display_name ?? ''}
                        className="rounded-md border border-acidDim/40 bg-panel px-3 py-2 text-sm text-ink outline-none focus:border-acid"
                      />
                      <input
                        name="profession"
                        placeholder="Job"
                        defaultValue={parent.profession ?? ''}
                        className="rounded-md border border-acidDim/40 bg-panel px-3 py-2 text-sm text-ink outline-none focus:border-acid"
                      />
                      <input
                        name="address_line1"
                        placeholder="Street address"
                        defaultValue={parent.address_line1 ?? ''}
                        className="rounded-md border border-acidDim/40 bg-panel px-3 py-2 text-sm text-ink outline-none focus:border-acid"
                      />
                      <div className="flex gap-2">
                        <input
                          name="city"
                          placeholder="City"
                          defaultValue={parent.city ?? ''}
                          className="flex-1 rounded-md border border-acidDim/40 bg-panel px-3 py-2 text-sm text-ink outline-none focus:border-acid"
                        />
                        <input
                          name="state"
                          placeholder="State"
                          defaultValue={parent.state ?? ''}
                          className="w-20 rounded-md border border-acidDim/40 bg-panel px-3 py-2 text-sm text-ink outline-none focus:border-acid"
                        />
                        <input
                          name="zip"
                          placeholder="ZIP"
                          defaultValue={parent.zip ?? ''}
                          className="w-24 rounded-md border border-acidDim/40 bg-panel px-3 py-2 text-sm text-ink outline-none focus:border-acid"
                        />
                      </div>
                      <input
                        name="phone"
                        placeholder="Phone"
                        defaultValue={parent.phone ?? ''}
                        className="rounded-md border border-acidDim/40 bg-panel px-3 py-2 text-sm text-ink outline-none focus:border-acid"
                      />

                      <span className="mt-2 text-xs font-medium text-acidDim">Married?</span>
                      <div className="flex gap-4 text-sm text-ink">
                        <label className="flex items-center gap-2">
                          <input
                            type="radio"
                            name="is_married"
                            value="yes"
                            defaultChecked={parent.is_married}
                          />{' '}
                          Yes
                        </label>
                        <label className="flex items-center gap-2">
                          <input
                            type="radio"
                            name="is_married"
                            value="no"
                            defaultChecked={!parent.is_married}
                          />{' '}
                          No
                        </label>
                      </div>
                      <input
                        name="spouse_name"
                        placeholder="Spouse's name"
                        defaultValue={parent.spouse_name ?? ''}
                        className="rounded-md border border-acidDim/40 bg-panel px-3 py-2 text-sm text-ink outline-none focus:border-acid"
                      />

                      <label className="text-xs text-acidDim">
                        Anniversary
                        <input
                          type="date"
                          name="anniversary"
                          defaultValue={parent.anniversary ?? ''}
                          className="mt-1 block rounded-md border border-acidDim/40 bg-panel px-3 py-2 text-sm text-ink outline-none focus:border-acid"
                        />
                      </label>
                      <label className="text-xs text-acidDim">
                        Birthday
                        <input
                          type="date"
                          name="birthday"
                          defaultValue={parent.birthday ?? ''}
                          className="mt-1 block rounded-md border border-acidDim/40 bg-panel px-3 py-2 text-sm text-ink outline-none focus:border-acid"
                        />
                      </label>

                      <button
                        type="submit"
                        className="mt-1 self-start rounded-md bg-pumpkin px-3 py-1.5 text-xs font-medium text-ground"
                      >
                        Save
                      </button>
                    </form>

                    <div className="mt-3 flex flex-col gap-2 rounded-md border border-acidDim/20 bg-ground p-3">
                      <span className="text-xs font-medium text-acidDim">Kids</span>
                      {kids.map((kid) => (
                        <form
                          key={kid.id}
                          action={deleteChild}
                          className="flex items-center justify-between text-sm text-ink"
                        >
                          <input type="hidden" name="child_id" value={kid.id} />
                          <span>
                            {kid.name} · {formatDate(kid.birth_date)}
                          </span>
                          <button type="submit" className="text-xs text-acidDim hover:text-pumpkin">
                            Remove
                          </button>
                        </form>
                      ))}
                      <form action={addChild} className="flex flex-wrap items-end gap-2">
                        <input type="hidden" name="target_id" value={parent.id} />
                        <input
                          name="name"
                          required
                          placeholder="Child's name"
                          className="rounded-md border border-acidDim/40 bg-panel px-3 py-2 text-sm text-ink outline-none focus:border-acid"
                        />
                        <input
                          type="date"
                          name="birth_date"
                          required
                          className="rounded-md border border-acidDim/40 bg-panel px-3 py-2 text-sm text-ink outline-none focus:border-acid"
                        />
                        <button
                          type="submit"
                          className="rounded-md bg-pumpkin px-3 py-1.5 text-xs font-medium text-ground"
                        >
                          Add child
                        </button>
                      </form>
                    </div>
                  </details>
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
