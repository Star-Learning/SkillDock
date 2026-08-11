import { BookOpen, PenLine, Shapes, type LucideIcon } from "lucide-react";

export type SkillVisual = {
  icon: LucideIcon;
  card: string;
  iconSurface: string;
  categoryBadge: string;
  accentBar: string;
  button: string;
};

const visuals: Record<string, SkillVisual> = {
  学术研究: {
    icon: BookOpen,
    card: "border-[#dfe4fb] bg-[#fbfcff] hover:border-[#aeb9ed]",
    iconSurface: "bg-[#e9edff] text-[#5265c6]",
    categoryBadge: "bg-[#eef1ff] text-[#5265c6]",
    accentBar: "bg-[#7184df]",
    button: "bg-[#5265c6] hover:bg-[#4355b4]",
  },
  内容创作: {
    icon: PenLine,
    card: "border-[#f3e0d1] bg-[#fffaf6] hover:border-[#e8b98f]",
    iconSurface: "bg-[#ffeadb] text-[#b96737]",
    categoryBadge: "bg-[#fff0e4] text-[#a85b2f]",
    accentBar: "bg-[#dd8b54]",
    button: "bg-[#c8753e] hover:bg-[#ad5d2d]",
  },
};

const fallbackVisual: SkillVisual = {
  icon: Shapes,
  card: "border-[#e4e4e7] bg-white hover:border-[#b9b9c4]",
  iconSurface: "bg-[#f0f0f3] text-[#656571]",
  categoryBadge: "bg-[#f1f1f4] text-[#656571]",
  accentBar: "bg-[#8b8b98]",
  button: "bg-[#57555f] hover:bg-[#42414a]",
};

export function getSkillVisual(category: string) {
  return visuals[category] ?? fallbackVisual;
}
