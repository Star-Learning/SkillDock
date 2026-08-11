import { cn } from "@/lib/utils";

export function Difficulty({ value, showLabel = true }: { value: number; showLabel?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2 text-xs text-ink/55" aria-label={`难度 ${value}/5`}>
      {showLabel && <span>难度</span>}
      <span className="flex gap-1" aria-hidden="true">
        {[1, 2, 3, 4, 5].map((dot) => (
          <span key={dot} className={cn("h-1.5 w-1.5 rounded-full", dot <= value ? "bg-moss" : "bg-ink/15")} />
        ))}
      </span>
      <span>{value}/5</span>
    </span>
  );
}
