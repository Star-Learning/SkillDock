"use client";

import { Activity, Download, MousePointerClick } from "lucide-react";
import { ActivityTrend } from "./ActivityTrend";
import { useSkillStats } from "./useSkillStats";

export function SkillActivitySummary({ skillId, variant = "compact" }: { skillId?: string; variant?: "compact" | "header" }) {
  const { stats, available } = useSkillStats();
  const activity = skillId ? stats?.skills[skillId] : stats?.totals;
  const uses = activity?.uses;
  const downloads = activity?.downloads;
  const clicks = skillId ? stats?.skills[skillId]?.clicks : stats?.site.clicks;

  if (variant === "header") {
    return <div className="border-t border-line">
      <div className="grid sm:grid-cols-3"><ActivityStat icon={Activity} label="使用次数" value={uses} hint={formatLastTime(skillId ? stats?.skills[skillId]?.lastUsedAt : stats?.updatedAt, "最近使用")} available={available} /><ActivityStat icon={Download} label="下载次数" value={downloads} hint={formatLastTime(skillId ? stats?.skills[skillId]?.lastDownloadedAt : stats?.updatedAt, "最近下载")} available={available} /><ActivityStat icon={MousePointerClick} label="点击次数" value={clicks} hint={formatLastTime(skillId ? stats?.skills[skillId]?.lastClickedAt : stats?.site.lastClickedAt, "最近点击")} available={available} /></div>
      <div className="border-t border-line bg-paper/25 p-4 sm:p-5"><ActivityTrend data={skillId ? stats?.skills[skillId]?.daily : stats?.daily} title="这个 Skill 的近 14 天趋势" updatedAt={stats?.updatedAt} metrics={[{ key: "uses", label: "使用", color: "#5a57d9" }, { key: "downloads", label: "下载", color: "#58b77a" }, { key: "clicks", label: "点击", color: "#e39b47" }]} /></div>
    </div>;
  }

  return <div className="mt-5 grid grid-cols-3 gap-2 border-t border-line pt-5">
    <CompactStat icon={Activity} label="累计使用" value={uses} available={available} />
    <CompactStat icon={Download} label="累计下载" value={downloads} available={available} />
    <CompactStat icon={MousePointerClick} label="累计点击" value={clicks} available={available} />
  </div>;
}

function CompactStat({ icon: Icon, label, value, available }: { icon: typeof Activity; label: string; value?: number; available: boolean }) {
  return <div className="flex items-center gap-3 rounded-2xl bg-paper/65 px-4 py-3">
    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white text-moss"><Icon className="h-4 w-4" /></span>
    <div><strong className="block text-lg font-semibold leading-none text-ink">{displayValue(value, available)}</strong><span className="mt-1 block text-[11px] text-ink/38">{label}</span></div>
  </div>;
}

function ActivityStat({ icon: Icon, label, value, hint, available }: { icon: typeof Activity; label: string; value?: number; hint: string; available: boolean }) {
  return <div className="px-6 py-4 sm:border-l sm:first:border-l-0">
    <p className="flex items-center gap-1.5 text-[11px] text-ink/35"><Icon className="h-3.5 w-3.5 text-moss" />{label}</p>
    <div className="mt-1.5 flex items-end justify-between gap-3"><p className="text-xl font-semibold text-ink">{displayValue(value, available)}</p><p className="text-[11px] text-ink/32">{available ? hint : "仅本地运行时统计"}</p></div>
  </div>;
}

function displayValue(value: number | undefined, available: boolean) {
  if (!available) return "—";
  return value === undefined ? "…" : value.toLocaleString("zh-CN");
}

function formatLastTime(value: string | null | undefined, prefix: string) {
  if (!value) return "暂无记录";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "暂无记录";
  return `${prefix} ${new Intl.DateTimeFormat("zh-CN", { month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit" }).format(date)}`;
}
