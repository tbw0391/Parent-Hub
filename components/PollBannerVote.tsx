'use client';

import { useTransition } from 'react';
import { castVote } from '@/app/(app)/polls/actions';

export function PollBannerVoteButton({
  pollId,
  optionId,
  label,
  allowMultiple,
}: {
  pollId: string;
  optionId: string;
  label: string;
  allowMultiple: boolean;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        const formData = new FormData();
        formData.set('poll_id', pollId);
        formData.set('option_id', optionId);
        startTransition(() => {
          castVote(formData);
        });
      }}
      className="flex w-full items-center gap-2 rounded-md border border-acidDim/40 bg-ground px-3 py-2 text-left text-sm text-ink hover:border-acid disabled:opacity-60"
    >
      <span
        className={
          'flex h-3.5 w-3.5 shrink-0 items-center justify-center border border-acidDim/50 ' +
          (allowMultiple ? 'rounded' : 'rounded-full')
        }
        aria-hidden
      />
      {label}
    </button>
  );
}
