import { createClient } from '@/lib/supabase/server';
import { getCurrentProfile } from '@/lib/auth';
import { RoleGate } from '@/components/RoleGate';
import type { ScheduleEvent } from '@/lib/database.types';
import { createEvent } from './actions';

function formatWhen(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export default async function SchedulePage() {
  const supabase = await createClient();
  const profile = await getCurrentProfile();
  const { data: events } = await supabase
    .from('schedule_events')
    .select('*')
    .order('starts_at', { ascending: true });

  return (
    <div className="flex flex-col gap-6 py-6">
      <h1 className="text-xl font-semibold text-acid">Schedule</h1>

      <RoleGate profile={profile} minRole="admin">
        <form action={createEvent} className="flex flex-col gap-3 rounded-lg border border-acidDim/30 bg-panel p-4">
          <h2 className="text-sm font-medium text-acidDim">New event</h2>
          <input
            name="title"
            required
            placeholder="Event title"
            className="rounded-md border border-acidDim/40 bg-ground px-3 py-2 text-ink outline-none focus:border-acid"
          />
          <input
            type="datetime-local"
            name="starts_at"
            required
            className="rounded-md border border-acidDim/40 bg-ground px-3 py-2 text-ink outline-none focus:border-acid"
          />
          <input
            name="location"
            placeholder="Location (optional)"
            className="rounded-md border border-acidDim/40 bg-ground px-3 py-2 text-ink outline-none focus:border-acid"
          />
          <textarea
            name="description"
            rows={3}
            placeholder="Details (optional)"
            className="rounded-md border border-acidDim/40 bg-ground px-3 py-2 text-ink outline-none focus:border-acid"
          />
          <button type="submit" className="self-start rounded-md bg-pumpkin px-4 py-2 text-sm font-medium text-ground">
            Add event
          </button>
        </form>
      </RoleGate>

      <div className="flex flex-col gap-3">
        {(events as ScheduleEvent[] | null)?.length ? (
          (events as ScheduleEvent[]).map((event) => (
            <div key={event.id} className="rounded-lg border border-acidDim/20 bg-panel p-4">
              <div className="flex items-baseline justify-between gap-2">
                <h3 className="text-base font-medium text-ink">{event.title}</h3>
                <span className="whitespace-nowrap text-xs text-pumpkin">{formatWhen(event.starts_at)}</span>
              </div>
              {event.location && <p className="mt-1 text-xs text-acidDim">{event.location}</p>}
              {event.description && <p className="mt-2 text-sm text-acidDim">{event.description}</p>}
            </div>
          ))
        ) : (
          <p className="text-sm text-acidDim">Nothing on the schedule yet.</p>
        )}
      </div>
    </div>
  );
}
