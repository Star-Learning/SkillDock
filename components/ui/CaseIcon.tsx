import {
  BarChart3,
  BookOpen,
  FileText,
  Files,
  GitBranch,
  Github,
  Lightbulb,
  MessageSquare,
  Newspaper,
  PanelsTopLeft,
  Radar,
  Rss,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

const icons: Record<string, LucideIcon> = {
  newspaper: Newspaper,
  rss: Rss,
  github: Github,
  radar: Radar,
  "book-open": BookOpen,
  "file-text": FileText,
  "git-branch": GitBranch,
  "message-square": MessageSquare,
  files: Files,
  "chart-column": BarChart3,
  lightbulb: Lightbulb,
  "panels-top-left": PanelsTopLeft,
};

const accentClasses = {
  green: "bg-[#dfeade] text-[#315f4c]",
  orange: "bg-[#f7e2d3] text-[#a75c2c]",
  blue: "bg-[#dde9f4] text-[#366585]",
  purple: "bg-[#ebe2f2] text-[#705084]",
  yellow: "bg-[#f2e8c9] text-[#876d24]",
};

export function CaseIcon({ icon, accent, className }: { icon: string; accent: keyof typeof accentClasses; className?: string }) {
  const Icon = icons[icon] ?? Sparkles;
  return (
    <span className={cn("inline-flex h-12 w-12 items-center justify-center rounded-2xl", accentClasses[accent], className)}>
      <Icon className="h-5 w-5" strokeWidth={1.8} />
    </span>
  );
}
