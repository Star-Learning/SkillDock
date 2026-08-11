"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function LegacySkillRedirect({ slug }: { slug: string }) {
  const router = useRouter();
  useEffect(() => { router.replace(`/skills/${slug}/`); }, [router, slug]);
  return <div className="mx-auto flex min-h-[60vh] max-w-xl items-center px-5 text-center"><div><h1 className="text-3xl font-semibold tracking-[-0.04em] text-ink">内容已迁移到 SkillDock</h1><p className="mt-3 text-sm leading-7 text-ink/52">正在打开新的 Skill 详情页。</p><Link href={`/skills/${slug}/`} className="mt-6 inline-flex h-11 items-center gap-2 rounded-full bg-moss px-5 text-sm font-semibold text-white">立即查看<ArrowRight className="h-4 w-4" /></Link></div></div>;
}
