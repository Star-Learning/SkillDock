"use client";

import { Eye, MousePointerClick } from "lucide-react";
import { useSkillStats } from "@/components/skills/useSkillStats";

export function SiteLiveSummary() {
  const { stats, available } = useSkillStats();
  return <div className="mt-4 border-t border-line pt-4">
    <div className="mb-3 flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.12em] text-ink/32"><span className={`h-1.5 w-1.5 rounded-full ${available ? "animate-pulse bg-[#45a66a]" : "bg-ink/20"}`} />近实时站点统计</div>
    <div className="grid grid-cols-2 gap-2"><LiveMetric icon={Eye} value={stats?.site.views} label="页面浏览" available={available} /><LiveMetric icon={MousePointerClick} value={stats?.site.clicks} label="Skill 点击" available={available} /></div>
  </div>;
}

function LiveMetric({ icon: Icon, value, label, available }: { icon: typeof Eye; value?: number; label: string; available: boolean }) {
  return <div className="flex items-center gap-2 rounded-xl bg-paper/65 px-3 py-2.5"><Icon className="h-3.5 w-3.5 text-moss" /><div><strong className="block text-sm font-semibold leading-none text-ink">{available ? value?.toLocaleString("zh-CN") ?? "…" : "—"}</strong><span className="mt-1 block text-[10px] text-ink/34">{label}</span></div></div>;
}

