-- Recurring schedule events: weekly/monthly/yearly repeats from starts_at.
alter table schedule_events
  add column if not exists recurrence text not null default 'none'
    check (recurrence in ('none', 'weekly', 'monthly', 'yearly'));
