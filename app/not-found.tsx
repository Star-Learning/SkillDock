import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
  return <div className="mx-auto flex min-h-[65vh] max-w-2xl flex-col items-center justify-center px-5 text-center"><span className="text-8xl font-semibold tracking-[-0.06em] text-ink/[0.08]">404</span><h1 className="-mt-3 text-3xl font-semibold tracking-[-0.035em] text-ink">这个页面不存在</h1><p className="mt-3 text-sm text-ink/55">回到 SkillDock，浏览本地中央 Skill 库。</p><Link href="/" className="mt-6 inline-flex h-11 items-center gap-2 rounded-full bg-moss px-5 text-sm text-white"><ArrowLeft className="h-4 w-4" />返回首页</Link></div>;
}
