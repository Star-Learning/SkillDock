import { notFound } from "next/navigation";
import { skills } from "@/data/skills";
import { LegacySkillRedirect } from "./LegacySkillRedirect";

export const dynamic = "force-static";

export function generateStaticParams() {
  return skills.map((skill) => ({ slug: skill.id }));
}

export default async function LegacyCasePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!skills.some((skill) => skill.id === slug)) notFound();
  return <LegacySkillRedirect slug={slug} />;
}
