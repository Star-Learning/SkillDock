import generatedManifests from "@/data/generated/solutions.json";
import { casesSchema } from "@/lib/cases/schema";
import { solutionManifestsSchema, type CaseGuide } from "@/lib/solutions/schema";
import { templatesSchema } from "@/lib/templates/schema";

export type BacklogItem = {
  id: string;
  title: string;
  summary: string;
  proposedType: "workflow" | "skill" | "agent" | "hybrid";
  priority: "high" | "medium";
  source: string;
  category: "media" | "research";
};

export const solutionManifests = solutionManifestsSchema.parse(generatedManifests);
export const readyManifests = solutionManifests.filter((item) => item.stage === "ready");
export const draftManifests = solutionManifests.filter((item) => item.stage === "draft");

const downloadBaseUrl = (process.env.NEXT_PUBLIC_DOWNLOAD_BASE_URL ?? "").replace(/\/$/, "");
const publicResourceUrl = (path: string) => `${downloadBaseUrl}${path}`;

export const cases = casesSchema.parse(readyManifests.map((item) => ({
  id: item.id,
  slug: item.slug,
  title: item.title,
  shortTitle: item.shortTitle,
  summary: item.summary,
  category: item.category,
  featured: item.featured,
  featuredOrder: item.featuredOrder,
  status: item.verificationStatus,
  lastTested: item.lastTested,
  difficulty: item.difficulty,
  setupMinutes: item.setupMinutes,
  costText: "本站资源完全免费",
  recommendedStack: item.recommendedStack,
  apps: item.apps,
  toolSlugs: item.toolSlugs,
  tags: item.tags,
  aliases: item.aliases,
  templateIds: item.resources.map((resource) => resource.id),
  resourceType: item.implementationType,
  deliveryMode: item.delivery.mode,
  packagePath: publicResourceUrl(`/solutions/${item.slug}/${item.delivery.packageFileName}`),
  packageVersion: item.delivery.version,
  packageBytes: item.delivery.packageBytes,
  packageSha256: item.delivery.sha256,
  packageRequirements: item.delivery.requires,
  agentNames: item.delivery.agents,
  demoVideoUrl: item.delivery.videoUrl,
  agentMode: item.agentMode,
  icon: item.icon,
  accent: item.accent,
})));

export const casesBySlug = Object.fromEntries(cases.map((item) => [item.slug, item]));

export const backlog: BacklogItem[] = draftManifests.map((item) => ({
  id: item.id,
  title: item.title,
  summary: item.summary,
  proposedType: item.implementationType,
  priority: item.priority,
  source: item.source,
  category: item.category,
}));

export const caseDetails: Record<string, CaseGuide> = Object.fromEntries(readyManifests.map((item) => [item.slug, item.guide]));

export const templates = templatesSchema.parse(readyManifests.flatMap((item) => item.resources.map((resource) => ({
  id: resource.id,
  caseId: item.id,
  name: resource.name,
  platform: resource.platform,
  resourceType: resource.resourceType,
  version: resource.version,
  file: publicResourceUrl(`/solutions/${item.slug}/${resource.fileName}`),
  lastTested: resource.lastTested,
  requires: resource.requires,
  changeLog: resource.changeLog,
}))));

export const templatesById = Object.fromEntries(templates.map((item) => [item.id, item]));
