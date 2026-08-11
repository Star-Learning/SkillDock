"use client";

import { ArrowRight, ChevronRight, Inbox } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { SolutionBoard } from "@/components/dashboard/SolutionBoard";
import { categories, type CategorySlug } from "@/data/categories";
import type { BacklogItem } from "@/data/backlog";
import type { AutomationCase } from "@/lib/cases/schema";

const CATEGORY_KEY = "solution-center:category";

export function LibraryManager({ items, backlogItems }: { items: AutomationCase[]; backlogItems: BacklogItem[] }) {
  const [activeCategory, setActiveCategory] = useState<CategorySlug>("media");

  useEffect(() => {
    const saved = window.localStorage.getItem(CATEGORY_KEY);
    if (saved === "media" || saved === "research") setActiveCategory(saved);
  }, []);

  function selectCategory(category: CategorySlug) {
    setActiveCategory(category);
    window.localStorage.setItem(CATEGORY_KEY, category);
  }

  const activeMeta = categories.find((category) => category.slug === activeCategory) ?? categories[0];
  const visibleItems = useMemo(() => items.filter((item) => item.category === activeCategory), [activeCategory, items]);
  const visibleBacklog = useMemo(() => backlogItems.filter((item) => item.category === activeCategory), [activeCategory, backlogItems]);

  return (
    <section className="border-b border-line/75 bg-white/25">
      <div className="mx-auto grid max-w-6xl gap-9 px-5 py-12 sm:px-8 sm:py-16 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-12 lg:py-20">
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <p className="mb-3 px-1 text-xs font-medium text-ink/38">方案分类</p>
          <nav className="flex gap-2 overflow-x-auto rounded-[22px] border border-line bg-white p-2 shadow-card lg:grid" aria-label="解决方案大类">
            {categories.map((category) => {
              const Icon = category.icon;
              const active = category.slug === activeCategory;
              const total = items.filter((item) => item.category === category.slug).length + backlogItems.filter((item) => item.category === category.slug).length;
              return (
                <button key={category.slug} type="button" aria-pressed={active} onClick={() => selectCategory(category.slug)} className={`group flex min-w-[190px] items-center gap-3 rounded-2xl px-3 py-3 text-left transition lg:min-w-0 ${active ? "bg-ink text-white" : "text-ink/60 hover:bg-paper hover:text-ink"}`}>
                  <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${active ? "bg-white/10 text-white" : `${category.accent} text-moss`}`}><Icon className="h-4 w-4" /></span>
                  <span className="min-w-0 flex-1"><span className="block truncate text-sm font-semibold">{category.name}</span><span className={`mt-0.5 block text-[11px] ${active ? "text-white/45" : "text-ink/32"}`}>{total} 项内容</span></span>
                  <ChevronRight className={`h-4 w-4 shrink-0 ${active ? "text-white/45" : "text-ink/20"}`} />
                </button>
              );
            })}
          </nav>
          <p className="mt-4 hidden px-1 text-xs leading-5 text-ink/38 lg:block">点击分类，右侧内容会立即切换。</p>
        </aside>

        <div className="min-w-0">
          <header className="border-b border-line pb-8">
            <h2 className="text-3xl font-semibold tracking-[-0.04em] text-ink sm:text-4xl">{activeMeta.name}</h2>
            <p className="mt-3 text-sm leading-6 text-ink/48">{activeMeta.description}</p>
          </header>

          <section id="solutions" className="scroll-mt-24 pt-10">
            <div className="flex items-end justify-between gap-5">
              <div><h3 className="text-2xl font-semibold tracking-[-0.03em] text-ink">正式方案</h3><p className="mt-1.5 text-sm text-ink/45">查看说明与演示，下载方案包后交给本地 AI Agent。</p></div>
              <p className="shrink-0 text-sm text-ink/35">{visibleItems.length} 个</p>
            </div>
            {visibleItems.length > 0 ? <div className="mt-6 overflow-hidden rounded-[24px] border border-line bg-white shadow-card"><SolutionBoard key={activeCategory} items={visibleItems} /></div> : <EmptyState title="还没有正式方案" description="可以先从下面的待整理需求开始。" />}
          </section>

          <section id="backlog" className="scroll-mt-24 mt-14 border-t border-line pt-10">
            <div className="flex items-end justify-between gap-5">
              <div><p className="flex items-center gap-2 text-xs font-medium text-moss/60"><Inbox className="h-3.5 w-3.5" />需求收集箱</p><h3 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-ink">待整理需求</h3></div>
              <p className="shrink-0 text-sm text-ink/35">{visibleBacklog.length} 个</p>
            </div>
            {visibleBacklog.length > 0 ? <div className="mt-6 grid overflow-hidden rounded-[22px] border border-line bg-white md:grid-cols-2">
              {visibleBacklog.map((item) => (
                <article key={item.id} className="border-b border-line p-5 last:border-b-0 md:odd:border-r md:[&:nth-last-child(-n+2)]:border-b-0">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0"><h4 className="font-semibold text-ink">{item.title}</h4><p className="mt-1.5 line-clamp-2 text-sm leading-6 text-ink/48">{item.summary}</p></div>
                    <span className="shrink-0 pt-0.5 text-[10px] font-medium uppercase tracking-[0.12em] text-ink/30">{item.proposedType}</span>
                  </div>
                </article>
              ))}
            </div> : <EmptyState title="暂无待整理需求" description="新想法可以继续归入这个分类。" />}
            <p className="mt-5 text-xs text-ink/35">需求成熟后，再转为当前分类下的正式方案。</p>
            <Link href="/about" className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-moss transition hover:text-ink">了解收录方式 <ArrowRight className="h-3.5 w-3.5" /></Link>
          </section>
        </div>
      </div>
    </section>
  );
}

function EmptyState({ title, description }: { title: string; description: string }) {
  return <div className="mt-6 flex min-h-32 items-center justify-center rounded-[22px] border border-dashed border-line bg-white/55 px-5 text-center"><div><p className="text-sm font-medium text-ink/55">{title}</p><p className="mt-1 text-xs text-ink/32">{description}</p></div></div>;
}
