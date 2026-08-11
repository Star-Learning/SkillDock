import { ArrowRight, Bot, ShieldCheck } from "lucide-react";
import { SiteLiveSummary } from "@/components/analytics/SiteLiveSummary";
import { SkillLibrary } from "@/components/skills/SkillLibrary";
import { skillRegistry, skills } from "@/data/skills";

export default function HomePage() {
  return (
    <>
      <section className="relative overflow-hidden border-b border-line bg-[#fafaff]">
        <div className="pointer-events-none absolute left-[8%] top-[-18rem] h-[28rem] w-[28rem] rounded-full bg-[#dedcff]/55 blur-3xl" />
        <div className="relative mx-auto grid max-w-7xl gap-7 px-5 py-10 sm:px-8 sm:py-12 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-center lg:py-14">
          <div className="max-w-3xl">
            <p className="inline-flex items-center gap-2 rounded-full border border-moss/15 bg-white px-3 py-1.5 text-xs font-semibold text-moss">
              <ShieldCheck className="h-3.5 w-3.5" />公开下载 · 无需登录
            </p>
            <h1 className="mt-5 text-balance text-[38px] font-semibold leading-[1.08] tracking-[-0.055em] text-ink sm:text-[52px]">
              公开 Skill 库，<br />下载到本地使用
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-ink/56">
              免费浏览和下载经过检查的 Agent Skills，交给你自己的 AI Agent 安装和运行。
            </p>
            <a href="#skills" className="mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-full bg-moss px-5 text-sm font-semibold text-white transition hover:bg-[#4947c8]">
              浏览 Skills <ArrowRight className="h-4 w-4" />
            </a>
          </div>
          <div className="rounded-[24px] border border-line bg-white p-5 shadow-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-ink/35">公开 Skill 库</p>
                <h2 className="mt-1 text-lg font-semibold text-ink">{skillRegistry.summary.total} 个 Skill 可供下载</h2>
              </div>
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-mint text-moss"><Bot className="h-5 w-5" /></span>
            </div>
            <div className="mt-5 grid grid-cols-3 gap-2">
              <HeroStat value={skillRegistry.summary.total} label="公开收录" />
              <HeroStat value={skillRegistry.summary.passing} label="检查通过" />
              <HeroStat value={skills.filter((skill) => skill.status === "stable").length} label="稳定版本" />
            </div>
            <SiteLiveSummary />
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-5 sm:px-8"><SkillLibrary skills={skills} /></div>
    </>
  );
}

function HeroStat({ value, label }: { value: number; label: string }) {
  return <div className="rounded-xl bg-paper/70 px-2 py-3 text-center"><strong className="block text-xl font-semibold text-ink">{value}</strong><span className="mt-1 block text-[10px] text-ink/38">{label}</span></div>;
}
