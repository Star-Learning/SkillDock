import { createHash } from "node:crypto";
import { access, mkdir, readFile, readdir, rename, rm, writeFile } from "node:fs/promises";
import { dirname, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");
const skillsRoot = resolve(projectRoot, "skills");
const repoInstallRoot = resolve(projectRoot, ".agents", "skills");
const ignoredDirectories = new Set([".git", ".next", ".turbo", "coverage", "dist", "node_modules", "out", "outputs"]);
const forbiddenNames = new Set([".npmrc", "credentials.json", "id_ed25519", "id_rsa", "service-account.json"]);
const secretPatterns = [
  /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/,
  /\bsk-[A-Za-z0-9_-]{20,}\b/,
  /\bAKID[A-Za-z0-9]{13,}\b/,
];

async function exists(path) {
  try {
    await access(path);
    return true;
  } catch (error) {
    if (error?.code === "ENOENT") return false;
    throw error;
  }
}

function assertSafeChild(root, target) {
  const child = relative(root, target);
  if (!child || child.startsWith("..")) throw new Error(`非法目录: ${target}`);
}

function parseFrontmatter(content) {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
  if (!match) return {};
  const value = (key) => {
    const line = match[1].match(new RegExp(`^${key}:\\s*(.+)$`, "m"))?.[1]?.trim() ?? "";
    return line.replace(/^(["'])(.*)\1$/, "$2");
  };
  return { name: value("name"), description: value("description") };
}

function inspectFile(relativePath, data) {
  const normalized = relativePath.replace(/\\/g, "/");
  const fileName = normalized.split("/").at(-1)?.toLowerCase() ?? "";
  const forbidden = forbiddenNames.has(fileName)
    || fileName === ".env"
    || (fileName.startsWith(".env.") && fileName !== ".env.example")
    || /\.(?:pem|key|p12|pfx)$/i.test(fileName)
    || fileName.endsWith(".log");
  if (forbidden) throw new Error(`${normalized}: 不允许进入 Skill 的敏感文件`);
  if (data.length > 25 * 1024 * 1024) throw new Error(`${normalized}: 单文件超过 25 MB`);
  if (!data.includes(0) && secretPatterns.some((pattern) => pattern.test(data.toString("utf8")))) {
    throw new Error(`${normalized}: 检测到疑似凭证`);
  }
}

export async function collectSkillFiles(directory, relativePath = "") {
  const entries = await readdir(resolve(directory, relativePath), { withFileTypes: true });
  const files = [];
  for (const entry of entries.sort((a, b) => a.name.localeCompare(b.name))) {
    if (ignoredDirectories.has(entry.name) || entry.name.endsWith(".zip") || entry.name.endsWith(".sha256")) continue;
    const child = relativePath ? `${relativePath}/${entry.name}` : entry.name;
    if (entry.isSymbolicLink()) throw new Error(`${child}: 中央 Skill 仓库不接受符号链接`);
    if (entry.isDirectory()) files.push(...await collectSkillFiles(directory, child));
    if (entry.isFile()) {
      const data = await readFile(resolve(directory, child));
      inspectFile(child, data);
      files.push({ name: child.replace(/\\/g, "/"), data });
    }
  }
  return files;
}

function checksum(files) {
  const hash = createHash("sha256");
  for (const file of files) {
    hash.update(file.name);
    hash.update("\0");
    hash.update(file.data);
    hash.update("\0");
  }
  return hash.digest("hex");
}

async function inspectSkill(directoryName) {
  const directory = resolve(skillsRoot, directoryName);
  assertSafeChild(skillsRoot, directory);
  const checks = [];
  let metadata = {};
  let frontmatter = {};
  let promptCases = { positive: [], negative: [] };
  let files = [];

  try {
    metadata = JSON.parse(await readFile(resolve(directory, "skill.json"), "utf8"));
    checks.push({ id: "metadata", label: "平台元数据", passed: true });
  } catch (error) {
    checks.push({ id: "metadata", label: "平台元数据", passed: false, message: error instanceof Error ? error.message : String(error) });
  }

  try {
    const skillMarkdown = await readFile(resolve(directory, "SKILL.md"), "utf8");
    frontmatter = parseFrontmatter(skillMarkdown);
    checks.push({ id: "skill-file", label: "SKILL.md", passed: true });
  } catch (error) {
    checks.push({ id: "skill-file", label: "SKILL.md", passed: false, message: error instanceof Error ? error.message : String(error) });
  }

  checks.push({ id: "name", label: "名称一致", passed: frontmatter.name === directoryName && metadata.id === directoryName });
  checks.push({ id: "description", label: "触发描述", passed: typeof frontmatter.description === "string" && frontmatter.description.length >= 40 });
  checks.push({ id: "version", label: "语义化版本", passed: /^\d+\.\d+\.\d+$/.test(metadata.version || "") });

  try {
    promptCases = JSON.parse(await readFile(resolve(directory, "tests", "prompts.json"), "utf8"));
    const valid = Array.isArray(promptCases.positive) && promptCases.positive.length > 0 && Array.isArray(promptCases.negative) && promptCases.negative.length > 0;
    checks.push({ id: "trigger-cases", label: "触发测试样例", passed: valid, count: (promptCases.positive?.length ?? 0) + (promptCases.negative?.length ?? 0) });
  } catch (error) {
    checks.push({ id: "trigger-cases", label: "触发测试样例", passed: false, message: error instanceof Error ? error.message : String(error) });
  }

  try {
    files = await collectSkillFiles(directory);
    checks.push({ id: "security", label: "文件安全扫描", passed: true });
  } catch (error) {
    checks.push({ id: "security", label: "文件安全扫描", passed: false, message: error instanceof Error ? error.message : String(error) });
  }

  const sourceChecksum = files.length ? checksum(files) : "";
  const installDirectory = resolve(repoInstallRoot, directoryName);
  assertSafeChild(repoInstallRoot, installDirectory);
  let installStatus = "not-installed";
  if (await exists(installDirectory)) {
    try {
      const installedFiles = await collectSkillFiles(installDirectory);
      installStatus = checksum(installedFiles) === sourceChecksum ? "current" : "outdated";
    } catch {
      installStatus = "outdated";
    }
  }

  const passedChecks = checks.filter((check) => check.passed).length;
  return {
    id: directoryName,
    ...metadata,
    name: frontmatter.name || directoryName,
    description: frontmatter.description || "",
    directory: `skills/${directoryName}`,
    installTarget: `.agents/skills/${directoryName}`,
    installStatus,
    sourceChecksum,
    fileCount: files.length,
    sourceBytes: files.reduce((sum, file) => sum + file.data.length, 0),
    tests: {
      status: passedChecks === checks.length ? "passed" : "failed",
      passed: passedChecks,
      total: checks.length,
      promptCases: (promptCases.positive?.length ?? 0) + (promptCases.negative?.length ?? 0),
      checks,
    },
  };
}

export async function scanSkillRegistry() {
  await mkdir(skillsRoot, { recursive: true });
  const entries = await readdir(skillsRoot, { withFileTypes: true });
  const skills = [];
  for (const entry of entries.sort((a, b) => a.name.localeCompare(b.name))) {
    if (!entry.isDirectory() || entry.name.startsWith("_")) continue;
    skills.push(await inspectSkill(entry.name));
  }
  return skills;
}

async function installOne(skill) {
  if (skill.tests.status !== "passed") throw new Error(`${skill.id}: 测试未通过，不能安装`);
  const source = resolve(skillsRoot, skill.id);
  const target = resolve(repoInstallRoot, skill.id);
  assertSafeChild(skillsRoot, source);
  assertSafeChild(repoInstallRoot, target);
  const temporary = resolve(repoInstallRoot, `.${skill.id}.install-${process.pid}`);
  assertSafeChild(repoInstallRoot, temporary);
  await mkdir(repoInstallRoot, { recursive: true });
  await rm(temporary, { recursive: true, force: true });
  await mkdir(temporary, { recursive: true });
  for (const file of await collectSkillFiles(source)) {
    const destination = resolve(temporary, file.name);
    assertSafeChild(temporary, destination);
    await mkdir(dirname(destination), { recursive: true });
    await writeFile(destination, file.data);
  }
  await rm(target, { recursive: true, force: true });
  await rename(temporary, target);
}

export async function installSkill(skillId) {
  const skill = (await scanSkillRegistry()).find((item) => item.id === skillId);
  if (!skill) throw new Error(`未找到 Skill: ${skillId}`);
  await installOne(skill);
  return (await scanSkillRegistry()).find((item) => item.id === skillId);
}

export async function syncInstalledSkills(skillId) {
  const skills = await scanSkillRegistry();
  const targets = skills.filter((skill) => (!skillId || skill.id === skillId) && skill.installStatus !== "not-installed");
  if (skillId && targets.length === 0) throw new Error(`${skillId}: 尚未安装，不能同步；请先安装`);
  for (const skill of targets) await installOne(skill);
  return targets.map((skill) => skill.id);
}

export { projectRoot, repoInstallRoot, skillsRoot };
