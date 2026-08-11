import { FlaskConical, PenTool, type LucideIcon } from "lucide-react";

export type CategorySlug = "media" | "research";

export type Category = {
  slug: CategorySlug;
  name: string;
  description: string;
  icon: LucideIcon;
  accent: string;
};

export const categories: Category[] = [
  {
    slug: "media",
    name: "自媒体 / 公众号",
    description: "内容选题、写作、排版与发布相关方案。",
    icon: PenTool,
    accent: "bg-[#ece4f5]",
  },
  {
    slug: "research",
    name: "学术科研",
    description: "论文阅读、研究设计、投稿与学术表达相关方案。",
    icon: FlaskConical,
    accent: "bg-[#e4eee0]",
  },
];

export const categoryBySlug = Object.fromEntries(
  categories.map((category) => [category.slug, category]),
);
