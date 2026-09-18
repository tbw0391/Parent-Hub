const BALLOONS = [
  { emoji: '🎈', left: '6%', delay: '0s', size: 'text-lg' },
  { emoji: '🎈', left: '88%', delay: '0.6s', size: 'text-base' },
  { emoji: '🎈', left: '78%', delay: '1.1s', size: 'text-sm' },
];

const CONFETTI = [
  { emoji: '🎊', left: '15%', delay: '0s' },
  { emoji: '✨', left: '30%', delay: '0.4s' },
  { emoji: '🎊', left: '50%', delay: '0.9s' },
  { emoji: '✨', left: '65%', delay: '0.2s' },
  { emoji: '🎊', left: '95%', delay: '0.7s' },
];

export function BirthdayConfetti() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
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
