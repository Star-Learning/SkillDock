import type { Metadata } from "next";
import { ArrowLeft, Check, CheckCircle2, Download, FileCode2, FolderSync, PackageCheck, ShieldCheck, Sparkles, TestTube2 } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SkillActivitySummary } from "@/components/skills/SkillActivitySummary";
import { getSkillVisual } from "@/components/skills/skill-visual";
import { getSkill, skills } from "@/data/skills";
import { skillDownloadUrl } from "@/lib/skills/public-api";

export const dynamic = "force-static";

export function generateStaticParams() {
  return skills.map((skill) => ({ slug: skill.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const skill = getSkill((await params).slug);
  if (!skill) return {};
  return {
    title: skill.displayName,
    description: skill.summary,
    alternates: { canonical: `/skills/${skill.id}` },
  };
}

export default async function SkillDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const skill = getSkill((await params).slug);
  if (!skill) notFound();
  const agentCommand = `检查刚下载的 ${skill.package.fileName}，阅读其中的 SKILL.md，测试通过后安装到当前项目并告诉我如何触发使用。`;
  const visual = getSkillVisual(skill.category);
  const CategoryIcon = visual.icon;

  return <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8 sm:py-14">
    <Link href="/#skills" className="inline-flex items-center gap-1.5 text-sm text-ink/45 transition hover:text-moss"><ArrowLeft className="h-4 w-4" />返回 Skill 库</Link>

    <header className={`relative mt-7 overflow-hidden rounded-[30px] border shadow-card ${visual.card}`}>
      <span className={`absolute inset-x-0 top-0 h-1 ${visual.accentBar}`} />
      <div className="grid gap-8 p-6 sm:p-8 lg:grid-cols-[1fr_auto] lg:items-start">
        <div><div className="flex items-start gap-4"><span className={`mt-0.5 flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${visual.iconSurface}`}><CategoryIcon className="h-6 w-6" strokeWidth={1.8} /></span><div><div className="flex flex-wrap items-center gap-2"><span className={`rounded-full px-2.5 py-1 text-xs font-medium ${visual.categoryBadge}`}>{skill.category}</span><span className="rounded-full bg-paper px-2.5 py-1 text-xs text-ink/45">{skill.status === "stable" ? "稳定版" : "Beta"}</span><span className="rounded-full bg-paper px-2.5 py-1 text-xs text-ink/45">v{skill.version}</span></div><h1 className="mt-4 text-4xl font-semibold tracking-[-0.055em] text-ink sm:text-5xl">{skill.displayName}</h1><p className="mt-2 font-mono text-sm text-ink/35">{skill.name}</p></div></div><p className="mt-6 max-w-3xl text-base leading-8 text-ink/58">{skill.summary}</p></div>
        <div className="flex flex-wrap gap-2"><a href={skillDownloadUrl(skill.id)} data-track-skill={skill.id} className={`inline-flex h-11 items-center gap-2 rounded-full px-5 text-sm font-semibold text-white transition ${visual.button}`}><Download className="h-4 w-4" />免费下载 ZIP</a></div>
      </div>
      <div className="grid border-t border-line sm:grid-cols-2 lg:grid-cols-4"><HeaderStat icon={PackageCheck} label="发布状态" value="可下载" /><HeaderStat icon={TestTube2} label="测试结果" value={`${skill.tests.passed}/${skill.tests.total} 通过`} /><HeaderStat icon={FileCode2} label="文件数量" value={`${skill.fileCount} 个`} /><HeaderStat icon={FolderSync} label="适用环境" value={skill.compatibility.join("、")} /></div>
      <SkillActivitySummary skillId={skill.id} variant="header" />
    </header>

    <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
      <main className="space-y-6">
        <section className="rounded-[26px] border border-line bg-white p-6 sm:p-7"><div className="flex items-center gap-2"><Sparkles className="h-4 w-4 text-moss" /><h2 className="font-semibold text-ink">交给你的 Agent</h2></div><p className="mt-2 text-sm leading-6 text-ink/48">下载后不需要在线运行，直接把压缩包交给你自己的 Codex 或其他 Agent：</p><div className="mt-4 rounded-2xl bg-[#17171c] p-4 font-mono text-sm leading-7 text-white/75"><span className="text-[#aaa8ff]">“</span>{agentCommand}<span className="text-[#aaa8ff]">”</span></div></section>

        <section className="rounded-[26px] border border-line bg-white p-6 sm:p-7"><div className="flex items-center justify-between gap-4"><div><p className="text-xs font-medium text-moss">QUALITY GATE</p><h2 className="mt-2 text-xl font-semibold tracking-[-0.03em] text-ink">测试与安全检查</h2></div><span className="inline-flex items-center gap-1.5 rounded-full bg-[#e9f8ef] px-3 py-1.5 text-xs font-semibold text-[#19713d]"><CheckCircle2 className="h-3.5 w-3.5" />全部通过</span></div><div className="mt-5 grid gap-2 sm:grid-cols-2">{skill.tests.checks.map((check) => <div key={check.id} className="flex items-center gap-3 rounded-2xl border border-line bg-paper/45 px-4 py-3"><span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#e9f8ef] text-[#19713d]"><Check className="h-3.5 w-3.5" /></span><div><p className="text-sm font-medium text-ink">{check.label}</p>{check.count ? <p className="mt-0.5 text-[11px] text-ink/35">{check.count} 个样例</p> : null}</div></div>)}</div></section>

        <section className="rounded-[26px] border border-line bg-white p-6 sm:p-7"><p className="text-xs font-medium text-moss">TRIGGER DESCRIPTION</p><h2 className="mt-2 text-xl font-semibold tracking-[-0.03em] text-ink">Agent 何时会使用它</h2><p className="mt-4 text-sm leading-7 text-ink/52">{skill.description}</p><div className="mt-5 flex flex-wrap gap-2">{skill.tags.map((tag) => <span key={tag} className="rounded-xl bg-paper px-3 py-1.5 text-xs text-ink/48">{tag}</span>)}</div></section>
      </main>

      <aside className="space-y-5">
        <section className="rounded-[24px] border border-line bg-white p-5"><h2 className="text-sm font-semibold text-ink">下载信息</h2><dl className="mt-4 space-y-4 text-xs"><Meta label="版本" value={`v${skill.version}`} /><Meta label="来源" value={skill.source} /><Meta label="包大小" value={formatBytes(skill.package.bytes)} /><Meta label="SHA-256" value={skill.package.sha256} mono breakAll /></dl></section>
        <section className="rounded-[24px] border border-line bg-white p-5"><div className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-moss" /><h2 className="text-sm font-semibold text-ink">运行要求</h2></div><ul className="mt-4 space-y-2">{skill.requirements.map((item) => <li key={item} className="flex gap-2 text-xs leading-5 text-ink/48"><Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#2d8a52]" />{item}</li>)}</ul></section>
      </aside>
    </div>
  </div>;
}

function HeaderStat({ icon: Icon, label, value }: { icon: typeof PackageCheck; label: string; value: string }) {
  return <div className="border-t border-line px-6 py-4 first:border-t-0 sm:border-l sm:first:border-l-0 sm:[&:nth-child(2)]:border-t-0 lg:border-t-0"><p className="flex items-center gap-1.5 text-[11px] text-ink/35"><Icon className="h-3.5 w-3.5 text-moss" />{label}</p><p className="mt-1.5 text-sm font-semibold text-ink">{value}</p></div>;
}

function Meta({ label, value, mono = false, breakAll = false }: { label: string; value: string; mono?: boolean; breakAll?: boolean }) {
  return <div><dt className="text-ink/32">{label}</dt><dd className={`mt-1.5 text-ink/58 ${mono ? "font-mono text-[11px]" : ""} ${breakAll ? "break-all" : "break-words"}`}>{value}</dd></div>;
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  return `${(bytes / 1024).toFixed(1)} KB`;
}
