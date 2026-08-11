"use client";

import { Activity, ArrowUpRight, CheckCircle2, CircleDot, Download, MousePointerClick, Search, Tags } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import type { ManagedSkill } from "@/lib/skills/schema";
import type { SkillActivity } from "@/lib/skills/stats";
import { getSkillVisual } from "./skill-visual";
import { useSkillStats } from "./useSkillStats";

export function SkillLibrary({ skills }: { skills: ManagedSkill[] }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const { stats } = useSkillStats();
  const categories = useMemo(() => Array.from(new Set(skills.map((skill) => skill.category))), [skills]);
  const visible = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return skills.filter((skill) => {
      if (category !== "all" && skill.category !== category) return false;
      if (!normalized) return true;
      return `${skill.displayName} ${skill.name} ${skill.summary} ${skill.description} ${skill.tags.join(" ")}`.toLowerCase().includes(normalized);
    });
  }, [category, query, skills]);

  return (
    <section id="skills" className="scroll-mt-24 py-9 sm:py-12">
      <div className="flex flex-col gap-6 border-b border-line pb-7 lg:flex-row lg:items-end lg:justify-between">
        <div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-moss">Skill library</p><h2 className="mt-3 text-3xl font-semibold tracking-[-0.045em] text-ink sm:text-4xl">公开 Skill 库</h2><p className="mt-2 text-sm leading-6 text-ink/48">所有内容由维护者统一测试和发布，访客可以免费浏览、下载并在本地使用。{stats ? ` 当前共记录使用 ${stats.totals.uses} 次、下载 ${stats.totals.downloads} 次。` : ""}</p></div>
        <div className="relative w-full lg:w-[360px]"><Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/28" /><input value={query} onChange={(event) => setQuery(event.target.value)} aria-label="搜索 Skill" placeholder="搜索名称、用途或标签…" className="h-12 w-full rounded-2xl border border-line bg-white pl-11 pr-4 text-sm outline-none transition focus:border-moss/40 focus:ring-4 focus:ring-mint" /></div>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-2">
        <div className="flex flex-wrap gap-2">
          <FilterButton active={category === "all"} onClick={() => setCategory("all")}>全部分类</FilterButton>
          {categories.map((item) => <FilterButton key={item} active={category === item} onClick={() => setCategory(item)}>{item}</FilterButton>)}
        </div>
      </div>

      {visible.length > 0 ? <div className="mt-6 grid gap-4 lg:grid-cols-2">{visible.map((skill) => <SkillCard key={skill.id} skill={skill} activity={stats?.skills[skill.id]} />)}</div> : <div className="mt-6 flex min-h-44 items-center justify-center rounded-[24px] border border-dashed border-line bg-white/55 text-sm text-ink/38">没有匹配的 Skill，可以直接告诉 Agent 新增</div>}
    </section>
  );
}

function SkillCard({ skill, activity }: { skill: ManagedSkill; activity?: SkillActivity }) {
  const statusTone = skill.status === "stable" ? "bg-[#e9f8ef] text-[#19713d]" : "bg-[#fff4df] text-[#9a5b16]";
  const visual = getSkillVisual(skill.category);
  const Icon = visual.icon;
  return <Link href={`/skills/${skill.id}/`} data-track-skill={skill.id} className={`group relative overflow-hidden rounded-[26px] border p-5 shadow-card transition duration-300 hover:-translate-y-0.5 hover:shadow-soft sm:p-6 ${visual.card}`}>
    <span className={`absolute inset-x-0 top-0 h-1 ${visual.accentBar}`} />
    <div className="flex items-start justify-between gap-4"><div className="flex min-w-0 items-center gap-3"><span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${visual.iconSurface}`}><Icon className="h-5 w-5" strokeWidth={1.8} /></span><div className="min-w-0"><p className={`inline-flex rounded-lg px-2 py-1 text-[11px] font-medium ${visual.categoryBadge}`}>{skill.category}</p><p className="mt-1 truncate text-xs text-ink/35">{skill.name}</p><h3 className="mt-0.5 truncate text-lg font-semibold tracking-[-0.025em] text-ink">{skill.displayName}</h3></div></div><ArrowUpRight className="h-4 w-4 shrink-0 text-ink/20 transition group-hover:text-ink/55" /></div>
    <p className="mt-5 min-h-12 text-sm leading-6 text-ink/55">{skill.summary}</p>
    <div className="mt-4 flex flex-wrap gap-1.5">{skill.tags.slice(0, 4).map((tag) => <span key={tag} className="rounded-lg bg-paper px-2 py-1 text-[11px] text-ink/45">{tag}</span>)}</div>
    <div className="mt-5 border-t border-line pt-4 text-xs text-ink/42"><div className="flex flex-wrap items-center gap-x-4 gap-y-2"><span className={`rounded-full px-2.5 py-1 font-medium ${statusTone}`}>{skill.status === "stable" ? "稳定版" : "Beta"}</span><span className="inline-flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-[#2d8a52]" />{skill.tests.passed}/{skill.tests.total} 检查通过</span><span className="ml-auto">v{skill.version}</span></div><div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-ink/36"><span className="inline-flex items-center gap-1.5"><Activity className="h-3.5 w-3.5 text-moss" />{formatCount(activity?.uses)} 使用</span><span className="inline-flex items-center gap-1.5"><Download className="h-3.5 w-3.5 text-moss" />{formatCount(activity?.downloads)} 下载</span><span className="inline-flex items-center gap-1.5"><MousePointerClick className="h-3.5 w-3.5 text-moss" />{formatCount(activity?.clicks)} 点击</span></div></div>
  </Link>;
}

function formatCount(value: number | undefined) {
  return value === undefined ? "…" : value.toLocaleString("zh-CN");
}

function FilterButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return <button type="button" onClick={onClick} className={`inline-flex h-9 items-center gap-1.5 rounded-xl px-3 text-xs font-medium transition ${active ? "bg-ink text-white" : "border border-line bg-white text-ink/50 hover:text-ink"}`}>{active ? <CircleDot className="h-3 w-3" /> : <Tags className="h-3 w-3" />}{children}</button>;
}
