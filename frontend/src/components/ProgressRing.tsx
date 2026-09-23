interface ProgressRingProps {
  value: number;
  max?: number;
  size?: number;
  label: string;
  sublabel?: string;
}

export function ProgressRing({ value, max = 100, size = 96, label, sublabel }: ProgressRingProps) {
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const percentual = Math.max(0, Math.min(100, (value / max) * 100));
  const offset = circumference * (1 - percentual / 100);
  const gradientId = `ring-gradient-${label.replace(/\s+/g, "-")}`;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
          <defs>
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#00B4FF" />
              <stop offset="100%" stopColor="#7ED8FF" />
            </linearGradient>
          </defs>
          <circle cx="50" cy="50" r={radius} fill="none" strokeWidth="8" className="stroke-white/5" />
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            strokeWidth="8"
            strokeLinecap="round"
            stroke={`url(#${gradientId})`}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-[stroke-dashoffset] duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="font-display text-xl font-bold text-white">{sublabel}</span>
        </div>
      </div>
      <span className="text-center text-xs font-medium uppercase tracking-wide text-slate-400">
        {label}
      </span>
    </div>
  );
}
