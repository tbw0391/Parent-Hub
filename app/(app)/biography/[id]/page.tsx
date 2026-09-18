import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getCurrentProfile, hasRole } from '@/lib/auth';
import type { Child, Profile } from '@/lib/database.types';
import { updateMyDetails, addChild, deleteChild, uploadPhoto } from '../actions';

function formatDate(iso: string) {
  return new Date(iso + 'T00:00:00').toLocaleDateString(undefined, { month: 'long', day: 'numeric' });
}

export default async function BioPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const me = await getCurrentProfile();
  if (!me) redirect('/login');

  const canEdit = me.id === id || hasRole(me, 'admin');
  if (!canEdit) redirect('/biography');

  const { data: profileData } = await supabase.from('profiles').select('*').eq('id', id).single();
  const person = profileData as Profile | null;
  if (!person) notFound();

  const { data: childrenData } = await supabase
    .from('children')
    .select('*')
    .eq('parent_id', id)
    .order('birth_date', { ascending: true });
  const kids = (childrenData as Child[] | null) ?? [];

  return (
    <div className="flex flex-col gap-6 py-6">
      <div>
        <Link href="/biography" className="text-xs text-acidDim hover:text-acid">
          ← Back to Parents
        </Link>
        <h1 className="mt-2 text-xl font-semibold text-acid">Bio</h1>
        <p className="mt-1 text-sm text-acidDim">
          {me.id === id ? 'Edit your info and kids.' : `Editing ${person.display_name || person.email} (admin).`}
        </p>
      </div>

      <form
        action={uploadPhoto}
        className="flex flex-wrap items-end gap-2 rounded-lg border border-acidDim/30 bg-panel p-4"
      >
        <input type="hidden" name="target_id" value={person.id} />
        <label className="flex-1 text-xs text-acidDim">
          Photo
          <input type="file" name="photo" accept="image/*" required className="mt-1 block w-full text-sm text-ink" />
        </label>
        <button type="submit" className="rounded-md bg-pumpkin px-3 py-1.5 text-xs font-medium text-ground">
          Upload photo
        </button>
      </form>

      <form
        action={updateMyDetails}
        className="flex flex-col gap-2 rounded-lg border border-acidDim/30 bg-panel p-4"
      >
        <input type="hidden" name="target_id" value={person.id} />
        <input
          name="display_name"
          required
          placeholder="Name"
          defaultValue={person.display_name ?? ''}
          className="rounded-md border border-acidDim/40 bg-ground px-3 py-2 text-sm text-ink outline-none focus:border-acid"
        />
        <input
          name="profession"
          placeholder="Job"
          defaultValue={person.profession ?? ''}
          className="rounded-md border border-acidDim/40 bg-ground px-3 py-2 text-sm text-ink outline-none focus:border-acid"
        />
        <input
          name="address_line1"
          placeholder="Street address"
          defaultValue={person.address_line1 ?? ''}
          className="rounded-md border border-acidDim/40 bg-ground px-3 py-2 text-sm text-ink outline-none focus:border-acid"
        />
        <div className="flex gap-2">
          <input
            name="city"
            placeholder="City"
            defaultValue={person.city ?? ''}
            className="flex-1 rounded-md border border-acidDim/40 bg-ground px-3 py-2 text-sm text-ink outline-none focus:border-acid"
          />
          <input
            name="state"
            placeholder="State"
            defaultValue={person.state ?? ''}
            className="w-20 rounded-md border border-acidDim/40 bg-ground px-3 py-2 text-sm text-ink outline-none focus:border-acid"
          />
          <input
            name="zip"
            placeholder="ZIP"
            defaultValue={person.zip ?? ''}
            className="w-24 rounded-md border border-acidDim/40 bg-ground px-3 py-2 text-sm text-ink outline-none focus:border-acid"
          />
        </div>
        <input
          name="phone"
          placeholder="Phone"
          defaultValue={person.phone ?? ''}
          className="rounded-md border border-acidDim/40 bg-ground px-3 py-2 text-sm text-ink outline-none focus:border-acid"
        />

        <span className="mt-2 text-xs font-medium text-acidDim">Married?</span>
        <div className="flex gap-4 text-sm text-ink">
          <label className="flex items-center gap-2">
            <input type="radio" name="is_married" value="yes" defaultChecked={person.is_married} /> Yes
          </label>
          <label className="flex items-center gap-2">
            <input type="radio" name="is_married" value="no" defaultChecked={!person.is_married} /> No
          </label>
        </div>
        <input
          name="spouse_name"
          placeholder="Spouse's name"
          defaultValue={person.spouse_name ?? ''}
          className="rounded-md border border-acidDim/40 bg-ground px-3 py-2 text-sm text-ink outline-none focus:border-acid"
        />

        <label className="text-xs text-acidDim">
          Anniversary
          <input
            type="date"
            name="anniversary"
            defaultValue={person.anniversary ?? ''}
            className="mt-1 block rounded-md border border-acidDim/40 bg-ground px-3 py-2 text-sm text-ink outline-none focus:border-acid"
          />
        </label>
        <label className="text-xs text-acidDim">
          Birthday
          <input
            type="date"
            name="birthday"
            defaultValue={person.birthday ?? ''}
            className="mt-1 block rounded-md border border-acidDim/40 bg-ground px-3 py-2 text-sm text-ink outline-none focus:border-acid"
          />
        </label>

        <button type="submit" className="mt-1 self-start rounded-md bg-pumpkin px-3 py-1.5 text-xs font-medium text-ground">
          Save
        </button>
      </form>

      <div className="flex flex-col gap-2 rounded-lg border border-acidDim/30 bg-panel p-4">
        <span className="text-xs font-medium text-acidDim">Kids</span>
        {kids.map((kid) => (
          <form key={kid.id} action={deleteChild} className="flex items-center justify-between text-sm text-ink">
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
          <input type="hidden" name="target_id" value={person.id} />
          <input
            name="name"
            required
            placeholder="Child's name"
            className="rounded-md border border-acidDim/40 bg-ground px-3 py-2 text-sm text-ink outline-none focus:border-acid"
          />
          <input
            type="date"
            name="birth_date"
            required
            className="rounded-md border border-acidDim/40 bg-ground px-3 py-2 text-sm text-ink outline-none focus:border-acid"
          />
          <button type="submit" className="rounded-md bg-pumpkin px-3 py-1.5 text-xs font-medium text-ground">
            Add child
          </button>
        </form>
      </div>
    </div>
  );
}
