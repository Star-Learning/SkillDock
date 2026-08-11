import { Blocks } from "lucide-react";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-line bg-[#f0f0f5]">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-7 sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <Link href="/" className="flex items-center gap-2.5 font-semibold text-ink">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-moss text-white">
            <Blocks className="h-4 w-4" />
          </span>
          SkillDock
        </Link>
        <div className="flex items-center gap-5 text-sm text-ink/50">
          <Link href="/#skills" className="transition hover:text-ink">Skill 库</Link>
          <Link href="/privacy" className="transition hover:text-ink">隐私说明</Link>
        </div>
      </div>
    </footer>
  );
}
