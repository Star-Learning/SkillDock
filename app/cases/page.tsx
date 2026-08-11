import { ArrowRight } from "lucide-react";
import Link from "next/link";

export default function LegacyCasesPage() {
  return <div className="mx-auto flex min-h-[60vh] max-w-xl items-center px-5 text-center"><div><h1 className="text-3xl font-semibold tracking-[-0.04em] text-ink">案例库已升级为 Skill 库</h1><p className="mt-3 text-sm leading-7 text-ink/52">现在以 Skill 为唯一管理单元，统一展示使用说明、质量检查、发布版本和下载状态。</p><Link href="/#skills" className="mt-6 inline-flex h-11 items-center gap-2 rounded-full bg-moss px-5 text-sm font-semibold text-white">打开 Skill 库<ArrowRight className="h-4 w-4" /></Link></div></div>;
}
