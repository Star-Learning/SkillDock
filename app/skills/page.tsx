import { ArrowRight } from "lucide-react";
import Link from "next/link";

export default function SkillsIndexPage() {
  return <div className="mx-auto flex min-h-[60vh] max-w-xl items-center px-5 text-center"><div><h1 className="text-3xl font-semibold tracking-[-0.04em] text-ink">Skill 库已经放在首页</h1><p className="mt-3 text-sm leading-7 text-ink/52">可以搜索、筛选并进入每个 Skill 的详情页。</p><Link href="/#skills" className="mt-6 inline-flex h-11 items-center gap-2 rounded-full bg-moss px-5 text-sm font-semibold text-white">打开 Skill 库<ArrowRight className="h-4 w-4" /></Link></div></div>;
}
