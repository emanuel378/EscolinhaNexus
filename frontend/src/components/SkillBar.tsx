interface SkillBarProps {
  label: string;
  value: number;
  max?: number;
}

export function SkillBar({ label, value, max = 5 }: SkillBarProps) {
  const percentual = Math.max(0, Math.min(100, (value / max) * 100));

  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-xs">
        <span className="text-slate-300">{label}</span>
        <span className="font-semibold text-white">{value.toFixed(1).replace(/\.0$/, "")}</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/5">
        <div
          className="h-full rounded-full bg-gradient-to-r from-nexus-primary to-nexus-highlight transition-[width] duration-700 ease-out"
          style={{ width: `${percentual}%` }}
        />
      </div>
    </div>
  );
}
