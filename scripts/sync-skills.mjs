import { createHash } from "node:crypto";
import { mkdir, readdir, rm, writeFile } from "node:fs/promises";
import { dirname, relative, resolve } from "node:path";
import { collectSkillFiles, projectRoot, scanSkillRegistry, skillsRoot } from "./lib/skill-registry.mjs";
import { createZipBuffer } from "./lib/zip.mjs";

const publicRoot = resolve(projectRoot, "public", "skills");
const skills = await scanSkillRegistry();
const activeIds = new Set(skills.map((skill) => skill.id));

await mkdir(publicRoot, { recursive: true });
for (const skill of skills) {
  if (skill.tests.status !== "passed") throw new Error(`${skill.id}: Skill 校验未通过`);
  const source = resolve(skillsRoot, skill.id);
  const packageDirectory = resolve(publicRoot, skill.id);
  const packageFileName = `${skill.id}-v${skill.version}.zip`;
  await rm(packageDirectory, { recursive: true, force: true });
  await mkdir(packageDirectory, { recursive: true });
  const sourceFiles = await collectSkillFiles(source);
  const packageBuffer = createZipBuffer(sourceFiles.map((file) => ({ name: `${skill.id}/${file.name}`, data: file.data })));
  const sha256 = createHash("sha256").update(packageBuffer).digest("hex");
  await writeFile(resolve(packageDirectory, packageFileName), packageBuffer);
  await writeFile(resolve(packageDirectory, `${packageFileName}.sha256`), `${sha256}  ${packageFileName}\n`, "utf8");
  skill.package = {
    fileName: packageFileName,
    path: `/skills/${skill.id}/${packageFileName}`,
    bytes: packageBuffer.length,
    sha256,
  };
}

for (const entry of await readdir(publicRoot, { withFileTypes: true })) {
  if (!entry.isDirectory() || activeIds.has(entry.name)) continue;
  const target = resolve(publicRoot, entry.name);
  const child = relative(publicRoot, target);
  if (!child || child.startsWith("..")) throw new Error(`非法 Skill 公开目录: ${target}`);
  await rm(target, { recursive: true, force: true });
}

const generated = {
  generatedAt: new Date().toISOString(),
  summary: {
    total: skills.length,
    installed: skills.filter((skill) => skill.installStatus === "current").length,
    needsSync: skills.filter((skill) => skill.installStatus === "outdated").length,
    passing: skills.filter((skill) => skill.tests.status === "passed").length,
  },
  targets: [
    {
      id: "codex-repo",
      name: "Codex · 当前项目",
      path: ".agents/skills",
      scope: "repository",
      installed: skills.filter((skill) => skill.installStatus !== "not-installed").length,
    },
  ],
  skills,
};

const generatedPath = resolve(projectRoot, "data", "generated", "skills.json");
await mkdir(dirname(generatedPath), { recursive: true });
await writeFile(generatedPath, `${JSON.stringify(generated, null, 2)}\n`, "utf8");
console.log(`Synced ${skills.length} skills. ${generated.summary.installed} installed, ${generated.summary.needsSync} need sync.`);
