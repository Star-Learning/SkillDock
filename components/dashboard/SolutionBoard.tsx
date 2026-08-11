"use client";

import {
  ArrowUpRight,
  Bot,
  Bookmark,
  History,
  Layers3,
  Download,
  Search,
  Sparkles,
  Workflow,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { AutomationCase } from "@/lib/cases/schema";

type ResourceType = AutomationCase["resourceType"];

const typeMeta: Record<ResourceType, { label: string; shortLabel: string; icon: typeof Workflow; badge: string; iconClass: string }> = {
  workflow: { label: "Workflow", shortLabel: "工作流", icon: Workflow, badge: "bg-[#e4eee0] text-[#315f4c]", iconClass: "bg-[#dfeade] text-[#315f4c]" },
  skill: { label: "Skill", shortLabel: "技能", icon: Sparkles, badge: "bg-[#ece4f5] text-[#705084]", iconClass: "bg-[#ebe2f2] text-[#705084]" },
  agent: { label: "Agent", shortLabel: "智能体", icon: Bot, badge: "bg-[#dde9f4] text-[#366585]", iconClass: "bg-[#dde9f4] text-[#366585]" },
  hybrid: { label: "Hybrid", shortLabel: "混合方案", icon: Layers3, badge: "bg-[#f7e2d3] text-[#a75c2c]", iconClass: "bg-[#f7e2d3] text-[#a75c2c]" },
};

const filters: Array<{ value: "all" | ResourceType; label: string }> = [
  { value: "all", label: "全部" },
  { value: "workflow", label: "Workflow" },
  { value: "skill", label: "Skill" },
  { value: "agent", label: "Agent" },
  { value: "hybrid", label: "混合" },
];

const statusMeta = {
  tested: "已验证",
  partial: "部分验证",
  reference: "方案参考",
} as const;

const FAVORITES_KEY = "solution-center:favorites";
const RECENT_KEY = "solution-center:recent";

function readStoredIds(key: string) {
  try {
    const value = JSON.parse(window.localStorage.getItem(key) ?? "[]");
    return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
  } catch {
    return [];
  }
}

export function SolutionBoard({ items }: { items: AutomationCase[] }) {
  const [query, setQuery] = useState("");
  const [activeType, setActiveType] = useState<"all" | ResourceType>("all");
  const [libraryView, setLibraryView] = useState<"all" | "favorites" | "recent">("all");
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [recentIds, setRecentIds] = useState<string[]>([]);

  useEffect(() => {
    setFavoriteIds(readStoredIds(FAVORITES_KEY));
    setRecentIds(readStoredIds(RECENT_KEY));
  }, []);

  function toggleFavorite(id: string) {
    setFavoriteIds((current) => {
      const next = current.includes(id) ? current.filter((item) => item !== id) : [id, ...current];
      window.localStorage.setItem(FAVORITES_KEY, JSON.stringify(next));
      return next;
    });
  }

  const counts = useMemo(() => Object.fromEntries(filters.map((filter) => [filter.value, filter.value === "all" ? items.length : items.filter((item) => item.resourceType === filter.value).length])), [items]);
  const availableFilters = filters.filter((filter) => filter.value === "all" || counts[filter.value] > 0);
  const showSearch = items.length >= 4;
  const showTypeFilters = availableFilters.length > 2;
  const visibleItems = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    const filtered = items.filter((item) => {
      const matchesType = activeType === "all" || item.resourceType === activeType;
      const matchesView = libraryView === "all" || (libraryView === "favorites" ? favoriteIds.includes(item.id) : recentIds.includes(item.id));
      const haystack = [item.title, item.shortTitle, item.summary, ...item.tags, ...item.aliases, ...item.recommendedStack].join(" ").toLowerCase();
      return matchesType && matchesView && (!normalized || haystack.includes(normalized));
    });
    return libraryView === "recent" ? filtered.sort((a, b) => recentIds.indexOf(a.id) - recentIds.indexOf(b.id)) : filtered;
  }, [activeType, favoriteIds, items, libraryView, query, recentIds]);

  return (
    <div>
      <div className="flex flex-col gap-3 border-b border-line px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <div className="flex gap-1 rounded-xl bg-paper p-1 text-xs">{([ ["all", "全部", null], ["favorites", "收藏", Bookmark], ["recent", "最近", History] ] as const).map(([value, label, Icon]) => <button key={value} type="button" onClick={() => setLibraryView(value)} className={`inline-flex h-8 items-center gap-1.5 rounded-lg px-3 transition ${libraryView === value ? "bg-white font-medium text-ink shadow-sm" : "text-ink/45 hover:text-ink"}`}>{Icon && <Icon className="h-3.5 w-3.5" />}{label}{value === "favorites" && favoriteIds.length > 0 && <span className="text-ink/30">{favoriteIds.length}</span>}</button>)}</div>
        {showSearch && <label className="flex h-10 items-center gap-2 rounded-xl border border-line bg-paper/65 px-3 transition focus-within:border-moss/35 focus-within:bg-white sm:w-72">
            <Search className="h-4 w-4 shrink-0 text-ink/35" />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索需求、工具或关键词" className="min-w-0 flex-1 bg-transparent text-sm text-ink outline-none placeholder:text-ink/32" />
          </label>}
      </div>

      {showTypeFilters && <div className="flex gap-2 overflow-x-auto border-b border-line px-5 py-3">{availableFilters.map((filter) => <button key={filter.value} type="button" onClick={() => setActiveType(filter.value)} className={`whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-medium transition ${activeType === filter.value ? "bg-ink text-white" : "text-ink/45 hover:bg-paper hover:text-ink"}`}>{filter.label}<span className={`ml-1.5 ${activeType === filter.value ? "text-white/55" : "text-ink/30"}`}>{counts[filter.value]}</span></button>)}</div>}

      <div className="p-4 sm:p-5">
        {visibleItems.length > 0 ? <div className="grid gap-4 xl:grid-cols-2">{visibleItems.map((item) => <SolutionCard key={item.id} item={item} isFavorite={favoriteIds.includes(item.id)} onToggleFavorite={() => toggleFavorite(item.id)} />)}</div> : <div className="flex min-h-56 flex-col items-center justify-center rounded-2xl border border-dashed border-line bg-paper/50 px-5 text-center"><Search className="h-7 w-7 text-ink/20" /><p className="mt-4 text-sm font-medium text-ink/65">{libraryView === "favorites" ? "还没有收藏方案" : libraryView === "recent" ? "还没有最近查看记录" : "暂时没有匹配的解决方案"}</p><p className="mt-1 text-xs text-ink/40">{libraryView === "all" ? "换一个关键词试试" : "记录只保存在当前浏览器中"}</p></div>}
      </div>
    </div>
  );
}

function SolutionCard({ item, isFavorite, onToggleFavorite }: { item: AutomationCase; isFavorite: boolean; onToggleFavorite: () => void }) {
  const meta = typeMeta[item.resourceType];
  const Icon = meta.icon;
  const status = statusMeta[item.status];

  return (
    <article className="group relative flex min-h-[230px] flex-col overflow-hidden rounded-[20px] border border-line bg-white p-5 transition duration-300 only:xl:col-span-2 hover:border-moss/25">
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-start gap-4">
          <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${meta.iconClass}`}><Icon className="h-4.5 w-4.5" /></span>
          <div className="min-w-0"><h3 className="text-balance text-lg font-semibold leading-snug tracking-[-0.02em] text-ink"><Link href={`/case/${item.slug}`} className="transition hover:text-moss">{item.title}</Link></h3><p className="mt-1.5 text-xs text-ink/38">{meta.label} · {status} · v{item.packageVersion} · {item.agentNames.join(" / ")} 本地执行</p></div>
        </div>
        <button type="button" onClick={onToggleFavorite} aria-label={isFavorite ? "取消收藏" : "收藏方案"} aria-pressed={isFavorite} className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition ${isFavorite ? "bg-mint text-moss" : "text-ink/25 hover:bg-paper hover:text-moss"}`}><Bookmark className={`h-3.5 w-3.5 ${isFavorite ? "fill-current" : ""}`} /></button>
      </div>
      <p className="mt-5 line-clamp-2 max-w-3xl text-sm leading-6 text-ink/52">{item.summary}</p>
      <div className="mt-auto flex items-center justify-end gap-2 border-t border-line/75 pt-4"><a href={item.packagePath} download className="inline-flex h-9 items-center gap-1.5 rounded-full px-3 text-xs font-medium text-ink/48 transition hover:bg-paper hover:text-moss"><Download className="h-3.5 w-3.5" />下载方案包</a><Link href={`/case/${item.slug}`} className="inline-flex h-9 items-center gap-1.5 rounded-full bg-ink px-3.5 text-xs font-semibold text-white transition hover:bg-moss">查看方案 <ArrowUpRight className="h-3.5 w-3.5" /></Link></div>
    </article>
  );
}

export { typeMeta };
