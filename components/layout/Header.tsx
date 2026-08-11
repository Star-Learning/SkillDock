import { Blocks } from "lucide-react";
import Link from "next/link";

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-line/80 bg-white/88 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8">
        <Link href="/" className="flex items-center gap-2.5 font-semibold tracking-[-0.02em] text-ink">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-moss text-white">
            <Blocks className="h-4 w-4" />
          </span>
          <span>SkillDock</span>
        </Link>
        <Link
          href="/#skills"
          className="rounded-full border border-line bg-white px-4 py-2 text-sm font-medium text-ink/65 transition hover:border-moss/25 hover:text-ink"
        >
          公开 Skill 库
        </Link>
      </div>
    </header>
  );
}
