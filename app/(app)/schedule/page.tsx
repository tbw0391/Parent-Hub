import { createClient } from '@/lib/supabase/server';
import { getCurrentProfile, hasRole } from '@/lib/auth';
import { RoleGate } from '@/components/RoleGate';
import type { Child, Profile, ScheduleEvent } from '@/lib/database.types';
import { buildLifeEvents, nextOccurrence, RECURRENCE_LABEL } from '@/lib/schedule';
import { createEvent, deleteEvent } from './actions';

interface DisplayEvent {
  id: string;
  title: string;
  recurrence: ScheduleEvent['recurrence'];
  location: string | null;
  description: string | null;
  deletableEventId: string | null;
}

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
  const { data: profilesData } = await supabase.from('profiles').select('*');
  const { data: childrenData } = await supabase.from('children').select('*');

  const now = new Date();
  const scheduleEvents = (events as ScheduleEvent[] | null) ?? [];
  const lifeEvents = buildLifeEvents((profilesData as Profile[]) ?? [], (childrenData as Child[]) ?? []);

  const displayEvents: { event: DisplayEvent; next: Date }[] = [
    ...scheduleEvents.map((event) => ({
      event: {
        id: event.id,
        title: event.title,
        recurrence: event.recurrence,
        location: event.location,
        description: event.description,
        deletableEventId: event.id,
      },
      next: nextOccurrence(event, now),
    })),
    ...lifeEvents.map((life) => ({
      event: {
        id: life.id,
        title: life.title,
        recurrence: life.recurrence,
        location: null,
        description: null,
        deletableEventId: null,
      },
      next: nextOccurrence(life, now),
    })),
  ];

  const upcomingEvents = displayEvents
    .filter(({ event, next }) => event.recurrence !== 'none' || next.getTime() >= now.getTime())
    .sort((a, b) => a.next.getTime() - b.next.getTime());
  const pastEvents = displayEvents
    .filter(({ event, next }) => event.recurrence === 'none' && next.getTime() < now.getTime())
    .sort((a, b) => b.next.getTime() - a.next.getTime());

  const canManage = hasRole(profile, 'admin');

  function EventCard({ event, next }: { event: DisplayEvent; next: Date }) {
    const recurrenceLabel = RECURRENCE_LABEL[event.recurrence];
    return (
      <div className="rounded-lg border border-acidDim/20 bg-panel p-4">
        <div className="flex items-baseline justify-between gap-2">
          <h3 className="text-base font-medium text-ink">{event.title}</h3>
          <span className="whitespace-nowrap text-xs text-pumpkin">{formatWhen(next.toISOString())}</span>
        </div>
        {recurrenceLabel && (
          <span className="mt-1 inline-block rounded-full bg-acid/10 px-2 py-0.5 text-[10px] font-medium uppercase text-acid">
            {recurrenceLabel}
          </span>
        )}
        {event.location && <p className="mt-1 text-xs text-acidDim">{event.location}</p>}
        {event.description && <p className="mt-2 text-sm text-acidDim">{event.description}</p>}
        {canManage && event.deletableEventId && (
          <form action={deleteEvent} className="mt-3 border-t border-acidDim/20 pt-3">
            <input type="hidden" name="event_id" value={event.deletableEventId} />
            <button type="submit" className="text-xs font-medium text-red-500 hover:text-red-600">
              Delete event
            </button>
          </form>
        )}
      </div>
    );
  }

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
          <label className="flex flex-col gap-1 text-sm text-acidDim">
            Repeats
            <select
              name="recurrence"
              defaultValue="none"
              className="rounded-md border border-acidDim/40 bg-ground px-3 py-2 text-ink outline-none focus:border-acid"
            >
              <option value="none">Doesn&apos;t repeat</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>
          </label>
          <button type="submit" className="self-start rounded-md bg-pumpkin px-4 py-2 text-sm font-medium text-ground">
            Add event
          </button>
        </form>
      </RoleGate>

      <div className="flex flex-col gap-3">
        {upcomingEvents.length ? (
          upcomingEvents.map(({ event, next }) => <EventCard key={event.id} event={event} next={next} />)
        ) : (
          <p className="text-sm text-acidDim">Nothing on the schedule yet.</p>
        )}
      </div>

      {pastEvents.length > 0 && (
        <details className="flex flex-col gap-3">
          <summary className="cursor-pointer text-sm font-medium text-acidDim hover:text-ink">
            Past events ({pastEvents.length})
          </summary>
          <div className="mt-3 flex flex-col gap-3">
            {pastEvents.map(({ event, next }) => (
              <EventCard key={event.id} event={event} next={next} />
            ))}
          </div>
        </details>
      )}
    </div>
  );
}
