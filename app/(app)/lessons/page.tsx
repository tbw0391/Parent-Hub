import { createClient } from '@/lib/supabase/server';
import { getCurrentProfile } from '@/lib/auth';
import { RoleGate } from '@/components/RoleGate';
import type { Lesson } from '@/lib/database.types';
import { createLesson } from './actions';

export default async function LessonsPage() {
  const supabase = await createClient();
  const profile = await getCurrentProfile();
  const { data: lessons } = await supabase
    .from('lessons')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <div className="flex flex-col gap-6 py-6">
      <h1 className="text-xl font-semibold text-acid">Lessons</h1>

      <RoleGate profile={profile} minRole="power_user">
        <form action={createLesson} className="flex flex-col gap-3 rounded-lg border border-acidDim/30 bg-panel p-4">
          <h2 className="text-sm font-medium text-acidDim">New lesson</h2>
          <input
            name="title"
            required
            placeholder="Lesson title"
            className="rounded-md border border-acidDim/40 bg-ground px-3 py-2 text-ink outline-none focus:border-acid"
          />
          <textarea
            name="description"
            rows={3}
            placeholder="Description (optional)"
            className="rounded-md border border-acidDim/40 bg-ground px-3 py-2 text-ink outline-none focus:border-acid"
          />
          <input
            name="attachment_url"
            placeholder="Attachment / video link (optional)"
            className="rounded-md border border-acidDim/40 bg-ground px-3 py-2 text-ink outline-none focus:border-acid"
          />
          <select
            name="attachment_type"
            defaultValue=""
            className="rounded-md border border-acidDim/40 bg-ground px-3 py-2 text-ink outline-none focus:border-acid"
          >
            <option value="">No attachment</option>
            <option value="pdf">PDF</option>
            <option value="video">Video</option>
            <option value="link">Other link</option>
          </select>
          <button type="submit" className="self-start rounded-md bg-pumpkin px-4 py-2 text-sm font-medium text-ground">
            Post lesson
          </button>
        </form>
      </RoleGate>

      <div className="flex flex-col gap-3">
        {(lessons as Lesson[] | null)?.length ? (
          (lessons as Lesson[]).map((lesson) => (
            <div key={lesson.id} className="rounded-lg border border-acidDim/20 bg-panel p-4">
              <h3 className="text-base font-medium text-ink">{lesson.title}</h3>
              {lesson.description && <p className="mt-2 text-sm text-acidDim">{lesson.description}</p>}
              {lesson.attachment_url && (
                <a
                  href={lesson.attachment_url}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 inline-block text-sm text-acid underline"
                >
                  Open {lesson.attachment_type || 'attachment'} →
                </a>
              )}
            </div>
          ))
        ) : (
          <p className="text-sm text-acidDim">No lessons posted yet.</p>
        )}
      </div>
    </div>
  );
}
