import { verseOfTheDay } from '@/lib/verses';

export function VerseOfTheDay() {
  const verse = verseOfTheDay();

  return (
    <div className="rounded-lg border border-[#7c3aed]/30 bg-[#7c3aed]/10 px-4 py-3">
      <span className="text-xs font-medium uppercase tracking-wide text-[#7c3aed]">Verse of the Day</span>
      <p className="mt-1 text-sm italic text-ink">&ldquo;{verse.text}&rdquo;</p>
      <p className="mt-1 text-xs font-medium text-acidDim">
        {verse.ref} <span className="font-normal">(ESV)</span>
      </p>
    </div>
  );
}
