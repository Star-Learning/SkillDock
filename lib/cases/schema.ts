import { z } from "zod";

export const caseStatusSchema = z.enum(["tested", "partial", "reference"]);

export const caseSchema = z.object({
  id: z.string().min(1),
  slug: z.string().regex(/^[a-z0-9-]+$/),
  title: z.string().min(4),
  shortTitle: z.string().min(2),
  summary: z.string().min(12),
  category: z.enum(["media", "research"]),
  featured: z.boolean(),
  featuredOrder: z.number().int().positive().optional(),
  status: caseStatusSchema,
  lastTested: z.string().date(),
  difficulty: z.number().int().min(1).max(5),
  setupMinutes: z.number().int().positive(),
  costText: z.string().min(2),
  recommendedStack: z.array(z.string()).min(1),
  apps: z.array(z.string()).min(1),
  toolSlugs: z.array(z.string()).min(1),
  tags: z.array(z.string()).min(1),
  aliases: z.array(z.string()),
  templateIds: z.array(z.string()),
  resourceType: z.enum(["workflow", "skill", "agent", "hybrid"]),
  deliveryMode: z.literal("agent-local"),
  packagePath: z.string().refine((value) => value.startsWith("/solutions/") || /^https:\/\//.test(value), "方案包必须使用站内路径或 HTTPS 地址"),
  packageVersion: z.string().regex(/^\d+\.\d+\.\d+$/),
  packageBytes: z.number().int().positive().optional(),
  packageSha256: z.string().regex(/^[a-f0-9]{64}$/).optional(),
  packageRequirements: z.array(z.string()),
  agentNames: z.array(z.string().min(1)).min(1),
  demoVideoUrl: z.string().optional(),
  agentMode: z.enum(["single", "multi"]).optional(),
  icon: z.string(),
  accent: z.enum(["green", "orange", "blue", "purple", "yellow"]),
});

export type AutomationCase = z.infer<typeof caseSchema>;

export const casesSchema = z.array(caseSchema).superRefine((items, ctx) => {
  const ids = new Set<string>();
  const slugs = new Set<string>();
  items.forEach((item, index) => {
    if (ids.has(item.id)) ctx.addIssue({ code: "custom", message: `重复 Case ID: ${item.id}`, path: [index, "id"] });
    if (slugs.has(item.slug)) ctx.addIssue({ code: "custom", message: `重复 slug: ${item.slug}`, path: [index, "slug"] });
    ids.add(item.id);
    slugs.add(item.slug);
  });
});
