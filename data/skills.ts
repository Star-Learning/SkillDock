import generated from "@/data/generated/skills.json";
import type { SkillRegistry } from "@/lib/skills/schema";

export const skillRegistry = generated as SkillRegistry;
export const skills = skillRegistry.skills;

export function getSkill(slug: string) {
  return skills.find((skill) => skill.id === slug);
}
