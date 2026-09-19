import { monthGridRange } from '@/lib/schedule';

export interface CalendarEntry {
  date: Date;
  title: string;
  kind: 'life' | 'event';
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function dateKey(d: Date) {
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

function buildGrid(year: number, month: number): Date[] {
  const { start } = monthGridRange(year, month);
  return Array.from({ length: 42 }, (_, i) => new Date(start.getFullYear(), start.getMonth(), start.getDate() + i));
}

export function MonthCalendar({ year, month, entries }: { year: number; month: number; entries: CalendarEntry[] }) {
  const today = new Date();
  const days = buildGrid(year, month);

  const entriesByDay = new Map<string, CalendarEntry[]>();
  for (const entry of entries) {
    const key = dateKey(entry.date);
    entriesByDay.set(key, [...(entriesByDay.get(key) ?? []), entry]);
  }

  const monthLabel = new Date(year, month, 1).toLocaleDateString(undefined, { month: 'long', year: 'numeric' });

  return (
    <div className="flex flex-col gap-2">
      <h2 className="text-sm font-medium text-acidDim">{monthLabel}</h2>
      <div className="grid grid-cols-7 gap-px overflow-hidden rounded-lg border border-acidDim/20 bg-acidDim/20 text-xs">
        {WEEKDAYS.map((wd) => (
          <div key={wd} className="bg-panel px-1 py-1 text-center font-medium text-acidDim">
            {wd}
          </div>
        ))}
        {days.map((day) => {
          const inMonth = day.getMonth() === month;
          const isToday = day.toDateString() === today.toDateString();
          const dayEntries = entriesByDay.get(dateKey(day)) ?? [];

          return (
            <div
              key={day.toISOString()}
              className={`flex min-h-20 flex-col gap-0.5 bg-ground p-1 ${inMonth ? '' : 'bg-panel/50'}`}
            >
              <span
                className={
                  'self-start rounded-full px-1.5 text-[11px] ' +
                  (isToday ? 'bg-pumpkin font-semibold text-ground' : inMonth ? 'text-ink' : 'text-acidDim/60')
                }
              >
                {day.getDate()}
              </span>
              <div className="flex flex-col gap-0.5">
                {dayEntries.map((entry, i) => (
                  <span
                    key={i}
                    className={
                      'truncate rounded px-1 py-0.5 text-[10px] leading-tight ' +
                      (entry.kind === 'life' ? 'bg-pumpkin/15 text-pumpkin' : 'bg-acid/10 text-acid')
                    }
                    title={entry.title}
                  >
                    {entry.title}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
