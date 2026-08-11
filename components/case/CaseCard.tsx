import { ArrowUpRight, Clock3 } from "lucide-react";
import Link from "next/link";
import { categoryBySlug } from "@/data/categories";
import type { AutomationCase } from "@/lib/cases/schema";
import { CaseIcon } from "@/components/ui/CaseIcon";
import { Difficulty } from "./Difficulty";
import { TestedBadge } from "./TestedBadge";

export function CaseCard({ item }: { item: AutomationCase }) {
  const category = categoryBySlug[item.category];
  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-[26px] border border-line/90 bg-white p-5 shadow-card transition duration-300 hover:-translate-y-1 hover:border-moss/25 hover:shadow-soft sm:p-6">
      <div className="mb-5 flex items-start justify-between gap-3">
        <CaseIcon icon={item.icon} accent={item.accent} />
        <TestedBadge status={item.status} />
      </div>
      <div className="mb-3 flex items-center gap-2 text-xs font-medium text-ink/48">
        <span>{category?.name}</span>
        <span className="h-1 w-1 rounded-full bg-ink/20" />
        <span>{item.resourceType === "skill" ? "免费 Skill" : item.templateIds.length ? "免费模板" : "完整教程"}</span>
      </div>
      <h3 className="text-[19px] font-semibold leading-snug tracking-[-0.02em] text-ink sm:text-xl">
        <Link href={`/case/${item.slug}`} className="after:absolute after:inset-0">
          {item.shortTitle}
        </Link>
      </h3>
      <p className="mt-3 line-clamp-3 text-sm leading-6 text-ink/62">{item.summary}</p>
      <p className="mt-4 truncate text-xs font-medium text-moss/80">{item.recommendedStack.join(" → ")}</p>
      <div className="mt-auto flex items-end justify-between gap-3 border-t border-line/65 pt-5">
        <div className="space-y-2">
          <Difficulty value={item.difficulty} />
          <span className="flex items-center gap-1.5 text-xs text-ink/50"><Clock3 className="h-3.5 w-3.5" />配置约 {item.setupMinutes} 分钟</span>
        </div>
        <span className="flex h-9 w-9 items-center justify-center rounded-full border border-line bg-paper text-moss transition group-hover:border-moss group-hover:bg-moss group-hover:text-white">
          <ArrowUpRight className="h-4 w-4" />
        </span>
      </div>
    </article>
  );
}
