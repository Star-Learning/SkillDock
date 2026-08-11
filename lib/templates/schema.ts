import { z } from "zod";

export const templateSchema = z.object({
  id: z.string().min(1),
  caseId: z.string().min(1),
  name: z.string().min(1),
  platform: z.string().min(1),
  resourceType: z.enum(["workflow", "skill"]),
  version: z.string().regex(/^\d+\.\d+\.\d+$/),
  file: z.string().refine((value) => value.startsWith("/templates/") || value.startsWith("/skills/") || value.startsWith("/solutions/") || /^https:\/\//.test(value), "资源必须使用公开路径或 HTTPS 地址"),
  lastTested: z.string().date(),
  requires: z.array(z.string()),
  changeLog: z.array(z.string()).min(1),
});

export type WorkflowTemplate = z.infer<typeof templateSchema>;

export const templatesSchema = z.array(templateSchema);
