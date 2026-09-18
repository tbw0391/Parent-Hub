// Positions are percentages within the right-half container (see wrapper below).
const BALLOONS = [
  { emoji: '🎈', left: '4%', delay: '0.3s', size: 'text-2xl' },
  { emoji: '🎈', left: '30%', delay: '0.8s', size: 'text-3xl' },
  { emoji: '🎈', left: '60%', delay: '0s', size: 'text-4xl' },
  { emoji: '🎈', left: '84%', delay: '1.1s', size: 'text-2xl' },
];

const CONFETTI = [
  { emoji: '🎊', left: '10%', delay: '0s' },
  { emoji: '✨', left: '24%', delay: '0.4s' },
  { emoji: '🎊', left: '38%', delay: '0.9s' },
  { emoji: '✨', left: '52%', delay: '0.2s' },
  { emoji: '🎊', left: '68%', delay: '1.2s' },
  { emoji: '✨', left: '82%', delay: '0.6s' },
  { emoji: '🎊', left: '95%', delay: '0.1s' },
];

export function BirthdayConfetti() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 right-0 w-1/2 overflow-hidden">
      {BALLOONS.map((b, i) => (
        <span
          key={`balloon-${i}`}
          className={`absolute top-1 animate-balloon-float ${b.size}`}
          style={{ left: b.left, animationDelay: b.delay }}
        >
          {b.emoji}
        </span>
      ))}
      {CONFETTI.map((c, i) => (
        <span
          key={`confetti-${i}`}
          className="absolute -top-2 text-xs animate-confetti-fall"
          style={{ left: c.left, animationDelay: c.delay }}
        >
          {c.emoji}
        </span>
      ))}
    </div>
  );
}
