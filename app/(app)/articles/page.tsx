import { createClient } from '@/lib/supabase/server';
import { getCurrentProfile } from '@/lib/auth';
import { RoleGate } from '@/components/RoleGate';
import type { Article } from '@/lib/database.types';
import { createArticle } from './actions';

export default async function ArticlesPage() {
  const supabase = await createClient();
  const profile = await getCurrentProfile();
  const { data: articles } = await supabase
    .from('articles')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <div className="flex flex-col gap-6 py-6">
      <h1 className="text-xl font-semibold text-acid">Articles</h1>

      <RoleGate profile={profile} minRole="admin">
        <form action={createArticle} className="flex flex-col gap-3 rounded-lg border border-acidDim/30 bg-panel p-4">
          <h2 className="text-sm font-medium text-acidDim">New article</h2>
          <input
            name="title"
            required
            placeholder="Title"
            className="rounded-md border border-acidDim/40 bg-ground px-3 py-2 text-ink outline-none focus:border-acid"
          />
          <textarea
            name="body"
            required
            rows={5}
            placeholder="Write the article..."
            className="rounded-md border border-acidDim/40 bg-ground px-3 py-2 text-ink outline-none focus:border-acid"
          />
          <input
            name="image_url"
            placeholder="Image URL (optional)"
            className="rounded-md border border-acidDim/40 bg-ground px-3 py-2 text-ink outline-none focus:border-acid"
          />
          <button type="submit" className="self-start rounded-md bg-pumpkin px-4 py-2 text-sm font-medium text-ground">
            Publish
          </button>
        </form>
      </RoleGate>

      <div className="flex flex-col gap-4">
        {(articles as Article[] | null)?.length ? (
          (articles as Article[]).map((article) => (
            <article key={article.id} className="rounded-lg border border-acidDim/20 bg-panel p-4">
              {article.image_url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={article.image_url} alt="" className="mb-3 max-h-64 w-full rounded-md object-cover" />
              )}
              <h3 className="text-lg font-medium text-ink">{article.title}</h3>
              <p className="mt-2 whitespace-pre-wrap text-sm text-acidDim">{article.body_richtext}</p>
            </article>
          ))
        ) : (
          <p className="text-sm text-acidDim">No articles yet.</p>
        )}
      </div>
    </div>
  );
}
