import { z } from "zod";
import { caseStatusSchema } from "@/lib/cases/schema";

export const categorySlugSchema = z.enum(["media", "research"]);
export const implementationTypeSchema = z.enum(["workflow", "skill", "agent", "hybrid"]);

const repositorySchema = z.object({
  type: z.enum(["embedded", "git", "local"]),
  location: z.string().min(1),
  note: z.string().optional(),
});

const inputItemSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  required: z.boolean(),
});

const usageStepSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  tip: z.string().optional(),
});

const outputItemSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
});

const flowStepSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
});

export const caseGuideSchema = z.object({
  inputs: z.array(inputItemSchema).min(1),
  usageSteps: z.array(usageStepSchema).min(1),
  outputs: z.array(outputItemSchema).min(1),
  flow: z.array(flowStepSchema).min(1),
  prompt: z.object({ purpose: z.string().min(1), content: z.string().min(1) }),
});

const commonManifestSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  slug: z.string().regex(/^[a-z0-9-]+$/),
  category: categorySlugSchema,
  implementationType: implementationTypeSchema,
  agentMode: z.enum(["single", "multi"]).optional(),
  title: z.string().min(4),
  summary: z.string().min(12),
  repository: repositorySchema.optional(),
});

export const draftSolutionManifestSchema = commonManifestSchema.extend({
  stage: z.literal("draft"),
  priority: z.enum(["high", "medium"]),
  source: z.string().min(1),
});

const resourceManifestSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  platform: z.string().min(1),
  resourceType: z.enum(["workflow", "skill"]),
  version: z.string().regex(/^\d+\.\d+\.\d+$/),
  source: z.string().min(1),
  fileName: z.string().regex(/^[^/\\]+$/),
  installAsSkill: z.boolean().default(false),
  lastTested: z.string().date(),
  requires: z.array(z.string()),
  changeLog: z.array(z.string()).min(1),
});

const deliverySchema = z.object({
  mode: z.literal("agent-local"),
  version: z.string().regex(/^\d+\.\d+\.\d+$/),
  packageFileName: z.string().regex(/^[^/\\]+\.zip$/i),
  agents: z.array(z.string().min(1)).min(1),
  requires: z.array(z.string().min(1)).default([]),
  packageBytes: z.number().int().positive().optional(),
  sha256: z.string().regex(/^[a-f0-9]{64}$/).optional(),
  videoUrl: z.string().refine((value) => value.startsWith("/") || /^https?:\/\//.test(value), "视频地址必须是站内路径或 HTTP(S) URL").optional(),
});

export const readySolutionManifestSchema = commonManifestSchema.extend({
  stage: z.literal("ready"),
  delivery: deliverySchema,
  shortTitle: z.string().min(2),
  featured: z.boolean().default(false),
  featuredOrder: z.number().int().positive().optional(),
  verificationStatus: caseStatusSchema,
  lastTested: z.string().date(),
  difficulty: z.number().int().min(1).max(5),
  setupMinutes: z.number().int().positive(),
  recommendedStack: z.array(z.string()).min(1),
  apps: z.array(z.string()).min(1),
  toolSlugs: z.array(z.string()).min(1),
  tags: z.array(z.string()).min(1),
  aliases: z.array(z.string()),
  icon: z.string().min(1),
  accent: z.enum(["green", "orange", "blue", "purple", "yellow"]),
  guide: caseGuideSchema,
  resources: z.array(resourceManifestSchema).default([]),
});

export const solutionManifestSchema = z.discriminatedUnion("stage", [draftSolutionManifestSchema, readySolutionManifestSchema]);
export const solutionManifestsSchema = z.array(solutionManifestSchema).superRefine((items, ctx) => {
  const ids = new Set<string>();
  items.forEach((item, index) => {
    if (ids.has(item.id)) ctx.addIssue({ code: "custom", message: `重复方案 ID: ${item.id}`, path: [index, "id"] });
    ids.add(item.id);
  });
});

export type CategorySlug = z.infer<typeof categorySlugSchema>;
export type SolutionManifest = z.infer<typeof solutionManifestSchema>;
export type ReadySolutionManifest = z.infer<typeof readySolutionManifestSchema>;
export type DraftSolutionManifest = z.infer<typeof draftSolutionManifestSchema>;
export type CaseGuide = z.infer<typeof caseGuideSchema>;
export type FlowStep = CaseGuide["flow"][number];
export type UsageStep = CaseGuide["usageSteps"][number];
export type InputItem = CaseGuide["inputs"][number];
export type OutputItem = CaseGuide["outputs"][number];
