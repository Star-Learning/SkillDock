import { cases, casesBySlug } from "@/data/cases";
import { categoryBySlug } from "@/data/categories";
import { templatesById } from "@/data/templates";
import { toolBySlug } from "@/data/tools";

export function getAllCases() {
  return cases;
}

export function getCaseBySlug(slug: string) {
  return casesBySlug[slug];
}

export function getFeaturedCases(limit = 6) {
  return cases
    .filter((item) => item.featured)
    .sort((a, b) => (a.featuredOrder ?? 99) - (b.featuredOrder ?? 99))
    .slice(0, limit);
}

export function getRecentCases(limit = 6) {
  return [...cases].sort((a, b) => b.lastTested.localeCompare(a.lastTested)).slice(0, limit);
}

export function getCasesByCategory(category: string) {
  return cases.filter((item) => item.category === category);
}

export function getCasesByTool(tool: string) {
  return cases.filter((item) => item.toolSlugs.includes(tool));
}

export function getRelatedCases(slug: string, limit = 3) {
  const current = getCaseBySlug(slug);
  if (!current) return [];

  return cases
    .filter((item) => item.slug !== slug)
    .map((item) => ({
      item,
      score:
        (item.category === current.category ? 4 : 0) +
        item.tags.filter((tag) => current.tags.includes(tag)).length * 2 +
        item.toolSlugs.filter((tool) => current.toolSlugs.includes(tool)).length,
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ item }) => item);
}

export function getCaseView(slug: string) {
  const item = getCaseBySlug(slug);
  if (!item) return undefined;
  return {
    ...item,
    categoryInfo: categoryBySlug[item.category],
    toolInfo: item.toolSlugs.map((tool) => toolBySlug[tool]).filter(Boolean),
    templateInfo: item.templateIds.map((id) => templatesById[id]).filter(Boolean),
  };
}
