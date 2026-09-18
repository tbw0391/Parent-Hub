const BALLOONS = [
  { emoji: '🎈', left: '2%', delay: '0s', size: 'text-3xl' },
  { emoji: '🎈', left: '16%', delay: '0.8s', size: 'text-2xl' },
  { emoji: '🎈', left: '82%', delay: '0.3s', size: 'text-4xl' },
  { emoji: '🎈', left: '92%', delay: '1.1s', size: 'text-2xl' },
  { emoji: '🎈', left: '70%', delay: '1.5s', size: 'text-xl' },
];

const CONFETTI = [
  { emoji: '🎊', left: '10%', delay: '0s' },
  { emoji: '✨', left: '24%', delay: '0.4s' },
  { emoji: '🎊', left: '38%', delay: '0.9s' },
  { emoji: '✨', left: '52%', delay: '0.2s' },
  { emoji: '🎊', left: '60%', delay: '1.2s' },
  { emoji: '✨', left: '76%', delay: '0.6s' },
  { emoji: '🎊', left: '88%', delay: '0.1s' },
  { emoji: '✨', left: '97%', delay: '1.4s' },
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
