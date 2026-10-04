import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ArrowLeft, BarChart3, BookOpen, CalendarDays, Newspaper, Smartphone, Users } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { getCurrentProfile, hasRole } from '@/lib/auth';
import type { Article, Lesson, Poll, Profile, Role, ScheduleEvent, TechRecommendation } from '@/lib/database.types';
import {
  deleteArticle,
  deleteLesson,
  deletePoll,
  deleteScheduleEvent,
  deleteTechRecommendation,
  setUserDisabled,
  updateUserRole,
} from './actions';

const ROLE_LABEL: Record<Role, string> = {
  parent: 'Parent',
  power_user: 'Power user',
  admin: 'Admin',
};

const SECTIONS = [
  { key: 'people', label: 'People', icon: Users, color: '#db2777' },
  { key: 'articles', label: 'Articles', icon: Newspaper, color: '#e11d48' },
  { key: 'schedule', label: 'Schedule', icon: CalendarDays, color: '#ea580c' },
  { key: 'lessons', label: 'Lessons', icon: BookOpen, color: '#059669' },
  { key: 'polls', label: 'Polls', icon: BarChart3, color: '#2563eb' },
  { key: 'technology', label: 'Technology', icon: Smartphone, color: '#0d9488' },
] as const;

type SectionKey = (typeof SECTIONS)[number]['key'];

export default async function AdminPage({ searchParams }: { searchParams: Promise<{ section?: string }> }) {
  const me = await getCurrentProfile();
  if (!hasRole(me, 'admin')) redirect('/');

  const supabase = await createClient();

  const [
    { data: profilesData },
    { data: articlesData },
    { data: eventsData },
    { data: lessonsData },
    { data: pollsData },
    { data: techData },
  ] = await Promise.all([
    supabase.from('profiles').select('*').order('display_name', { ascending: true }),
    supabase.from('articles').select('*').order('created_at', { ascending: false }),
    supabase.from('schedule_events').select('*').order('starts_at', { ascending: false }),
    supabase.from('lessons').select('*').order('created_at', { ascending: false }),
    supabase.from('polls').select('*').order('created_at', { ascending: false }),
    supabase.from('tech_recommendations').select('*').order('created_at', { ascending: false }),
  ]);

  const profiles = (profilesData as Profile[] | null) ?? [];
  const articles = (articlesData as Article[] | null) ?? [];
  const events = (eventsData as ScheduleEvent[] | null) ?? [];
  const lessons = (lessonsData as Lesson[] | null) ?? [];
  const polls = (pollsData as Poll[] | null) ?? [];
  const techApps = (techData as TechRecommendation[] | null) ?? [];

  const counts: Record<SectionKey, number> = {
    people: profiles.length,
    articles: articles.length,
    schedule: events.length,
    lessons: lessons.length,
    polls: polls.length,
    technology: techApps.length,
  };

  const { section: sectionParam } = await searchParams;
  const section = SECTIONS.find((s) => s.key === sectionParam);

  if (!section) {
    return (
      <div className="flex flex-col gap-6 py-6">
        <div>
          <h1 className="text-xl font-semibold text-acid">Admin tools</h1>
          <p className="mt-2 text-sm text-acidDim">Pick an area to manage.</p>
        </div>

        <nav className="grid grid-cols-3 gap-2">
          {SECTIONS.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.key}
                href={`/admin?section=${item.key}`}
                className="flex flex-col items-center gap-1 rounded-lg border border-acidDim/30 bg-panel px-2 py-3 text-center text-xs font-medium text-ink transition hover:border-acid"
              >
                <Icon size={18} color={item.color} strokeWidth={2} aria-hidden />
                {item.label}
                <span className="text-[10px] text-acidDim">{counts[item.key]}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 py-6">
      <div>
        <Link href="/admin" className="inline-flex items-center gap-1 text-xs text-acidDim hover:text-acid">
          <ArrowLeft size={14} aria-hidden />
          Admin tools
        </Link>
        <h1 className="mt-2 text-xl font-semibold text-acid">{section.label}</h1>
      </div>

      {section.key === 'people' && (
        <div className="flex flex-col gap-2">
          {profiles.map((person) => {
            const isMe = person.id === me!.id;
            return (
              <div
                key={person.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-acidDim/20 bg-panel p-3"
              >
                <div>
                  <div className="text-sm font-medium text-ink">
                    {person.display_name || person.email} {isMe && <span className="text-xs text-acidDim">(you)</span>}
                  </div>
                  <div className="text-xs text-acidDim">
                    {person.email}
                    {person.disabled_at && <span className="ml-2 text-red-400">Disabled</span>}
                  </div>
                </div>

                {isMe ? (
                  <span className="rounded-full bg-acidDim/10 px-2 py-1 text-xs text-acidDim">
                    {ROLE_LABEL[person.role]}
                  </span>
                ) : (
                  <div className="flex items-center gap-2">
                    <form action={updateUserRole} className="flex items-center gap-2">
                      <input type="hidden" name="target_id" value={person.id} />
                      <select
                        name="role"
                        defaultValue={person.role}
                        className="rounded-md border border-acidDim/40 bg-ground px-2 py-1 text-xs text-ink outline-none focus:border-acid"
                      >
                        <option value="parent">Parent</option>
                        <option value="power_user">Power user</option>
                        <option value="admin">Admin</option>
                      </select>
                      <button
                        type="submit"
                        className="rounded-md bg-pumpkin px-2 py-1 text-xs font-medium text-ground"
                      >
                        Save
                      </button>
                    </form>

                    <form action={setUserDisabled}>
                      <input type="hidden" name="target_id" value={person.id} />
                      <input type="hidden" name="disabled" value={person.disabled_at ? 'false' : 'true'} />
                      <button
                        type="submit"
                        className="rounded-md border border-acidDim/40 px-2 py-1 text-xs text-acidDim hover:border-acid hover:text-acid"
                      >
                        {person.disabled_at ? 'Enable' : 'Disable'}
                      </button>
                    </form>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {section.key === 'articles' && (
        <ContentList
          items={articles}
          label={(a) => a.title}
          deleteAction={deleteArticle}
          empty="No articles yet."
        />
      )}

      {section.key === 'schedule' && (
        <ContentList
          items={events}
          label={(e) => e.title}
          deleteAction={deleteScheduleEvent}
          empty="Nothing on the schedule yet."
        />
      )}

      {section.key === 'lessons' && (
        <ContentList items={lessons} label={(l) => l.title} deleteAction={deleteLesson} empty="No lessons yet." />
      )}

      {section.key === 'polls' && (
        <ContentList items={polls} label={(p) => p.question} deleteAction={deletePoll} empty="No polls yet." />
      )}

      {section.key === 'technology' && (
        <ContentList
          items={techApps}
          label={(a) => a.name}
          deleteAction={deleteTechRecommendation}
          empty="No recommendations yet."
        />
      )}
    </div>
  );
}

function ContentList<T extends { id: string }>({
  items,
  label,
  deleteAction,
  empty,
}: {
  items: T[];
  label: (item: T) => string;
  deleteAction: (formData: FormData) => void | Promise<void>;
  empty: string;
}) {
  if (!items.length) return <p className="text-sm text-acidDim">{empty}</p>;

  return (
    <div className="flex flex-col gap-2">
      {items.map((item) => (
        <div
          key={item.id}
          className="flex items-center justify-between gap-3 rounded-lg border border-acidDim/20 bg-panel px-3 py-2"
        >
          <span className="text-sm text-ink">{label(item)}</span>
          <form action={deleteAction}>
            <input type="hidden" name="id" value={item.id} />
            <button type="submit" className="text-xs text-acidDim hover:text-pumpkin">
              Delete
            </button>
          </form>
        </div>
      ))}
    </div>
  );
}
