import type { MetadataRoute } from "next";
import { skills } from "@/data/skills";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const staticRoutes = ["", "/privacy"].map((path) => ({ url: `${base}${path}`, lastModified: new Date("2026-08-11"), changeFrequency: "monthly" as const, priority: path === "" ? 1 : 0.5 }));
  const skillRoutes = skills.map((skill) => ({ url: `${base}/skills/${skill.id}`, lastModified: new Date("2026-08-11"), changeFrequency: "monthly" as const, priority: 0.9 }));
  return [...staticRoutes, ...skillRoutes];
}
