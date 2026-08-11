import { access, mkdir, readFile, readdir, rename, rm, stat, writeFile } from "node:fs/promises";
import { dirname, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");
const solutionsRoot = resolve(projectRoot, "solutions");
const trashRoot = resolve(solutionsRoot, "_trash");
const generatedManifestPath = resolve(projectRoot, "data", "generated", "solutions.json");
const allowedCategories = ["media", "research"];
const allowedImplementationTypes = ["workflow", "skill", "agent", "hybrid"];

function assertSlug(value, label = "slug") {
  if (typeof value !== "string" || !/^[a-z0-9-]+$/.test(value)) throw new Error(`${label} 只能包含小写字母、数字和连字符`);
  return value;
}

function assertCategory(value) {
  if (!allowedCategories.includes(value)) throw new Error("大类必须是 media 或 research");
  return value;
}

function solutionDirectory(category, slug) {
  const target = resolve(solutionsRoot, assertCategory(category), assertSlug(slug));
  const relativePath = relative(solutionsRoot, target);
  if (relativePath.startsWith("..") || relativePath === "") throw new Error("非法方案目录");
  return target;
}

async function pathExists(path) {
  try {
    await access(path);
    return true;
  } catch (error) {
    if (error?.code === "ENOENT") return false;
    throw error;
  }
}

async function readJson(path) {
  return JSON.parse(await readFile(path, "utf8"));
}

async function writeJsonAtomic(path, value) {
  const temporaryPath = `${path}.${process.pid}.tmp`;
  await writeFile(temporaryPath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
  await rename(temporaryPath, path);
}

function validateManifest(manifest, category, slug) {
  if (!manifest || typeof manifest !== "object" || Array.isArray(manifest)) throw new Error("方案数据必须是 JSON 对象");
  if (manifest.id !== slug || manifest.slug !== slug) throw new Error("id 和 slug 必须与方案目录名一致");
  if (manifest.category !== category) throw new Error("category 必须与方案所在大类一致");
  if (!allowedImplementationTypes.includes(manifest.implementationType)) throw new Error("不支持的实现方式");
  if (typeof manifest.title !== "string" || manifest.title.trim().length < 4) throw new Error("标题至少需要 4 个字符");
  if (typeof manifest.summary !== "string" || manifest.summary.trim().length < 12) throw new Error("简介至少需要 12 个字符");
  if (!["draft", "ready"].includes(manifest.stage)) throw new Error("stage 必须是 draft 或 ready");

  if (manifest.stage === "draft") {
    if (!["high", "medium"].includes(manifest.priority)) throw new Error("草稿优先级必须是 high 或 medium");
    if (typeof manifest.source !== "string" || !manifest.source.trim()) throw new Error("草稿必须填写来源");
  } else {
    if (!manifest.delivery || manifest.delivery.mode !== "agent-local") throw new Error("正式方案必须配置本地 Agent 交付方式");
    if (!/^\d+\.\d+\.\d+$/.test(manifest.delivery.version || "")) throw new Error("方案版本必须使用 1.0.0 格式");
    if (!manifest.delivery.packageFileName?.endsWith(`-v${manifest.delivery.version}.zip`)) throw new Error("方案包文件名必须包含当前版本");
    if (!Array.isArray(manifest.delivery.agents) || manifest.delivery.agents.length === 0) throw new Error("正式方案至少需要一个适用 Agent");
    if (!Array.isArray(manifest.delivery.requires)) throw new Error("正式方案必须提供本地运行要求");
    for (const field of ["inputs", "usageSteps", "outputs", "flow"]) {
      if (!Array.isArray(manifest.guide?.[field]) || manifest.guide[field].length === 0) throw new Error(`正式方案 guide.${field} 不能为空`);
    }
    if (!manifest.guide?.prompt?.content) throw new Error("正式方案必须提供可复制的 Prompt");
    if (!Array.isArray(manifest.resources)) throw new Error("正式方案 resources 必须是数组");
  }
  return manifest;
}

async function releaseById() {
  try {
    const generated = await readJson(generatedManifestPath);
    return new Map(generated.filter((item) => item.stage === "ready").map((item) => [item.id, item.delivery]));
  } catch (error) {
    if (error?.code === "ENOENT" || error instanceof SyntaxError) return new Map();
    throw error;
  }
}

export async function listManagedSolutions() {
  const releases = await releaseById();
  const solutions = [];
  for (const category of allowedCategories) {
    const categoryRoot = resolve(solutionsRoot, category);
    const entries = await readdir(categoryRoot, { withFileTypes: true });
    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      const manifestPath = resolve(categoryRoot, entry.name, "solution.json");
      try {
        const manifest = await readJson(manifestPath);
        const release = releases.get(manifest.id);
        const packagePath = release?.packageFileName ? `/solutions/${manifest.slug}/${release.packageFileName}` : undefined;
        const packageFile = packagePath ? resolve(projectRoot, "public", packagePath.replace(/^\//, "")) : undefined;
        solutions.push({
          manifest,
          release,
          packagePath,
          packageExists: packageFile ? await pathExists(packageFile) : false,
        });
      } catch (error) {
        solutions.push({
          error: error instanceof Error ? error.message : String(error),
          manifest: { id: entry.name, slug: entry.name, category, stage: "invalid", title: entry.name },
        });
      }
    }
  }

  const trash = [];
  if (await pathExists(trashRoot)) {
    const entries = await readdir(trashRoot, { withFileTypes: true });
    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      try {
        const manifest = await readJson(resolve(trashRoot, entry.name, "solution.json"));
        trash.push({ name: entry.name, manifest });
      } catch {
        trash.push({ name: entry.name });
      }
    }
  }

  solutions.sort((a, b) => `${a.manifest.stage}:${a.manifest.title}`.localeCompare(`${b.manifest.stage}:${b.manifest.title}`, "zh-CN"));
  trash.sort((a, b) => b.name.localeCompare(a.name));
  return { categories: allowedCategories, solutions, trash };
}

export async function getManagedSolution(category, slug) {
  const directory = solutionDirectory(category, slug);
  const manifest = await readJson(resolve(directory, "solution.json"));
  const readmePath = resolve(directory, "README.md");
  return {
    manifest,
    readme: await pathExists(readmePath) ? await readFile(readmePath, "utf8") : "",
  };
}

export async function createManagedSolution(input) {
  const category = assertCategory(input?.category);
  const slug = assertSlug(input?.slug);
  const title = String(input?.title || "").trim();
  const summary = String(input?.summary || "").trim();
  const implementationType = input?.implementationType || "skill";
  if (title.length < 4) throw new Error("标题至少需要 4 个字符");
  if (summary.length < 12) throw new Error("简介至少需要 12 个字符");
  if (!allowedImplementationTypes.includes(implementationType)) throw new Error("不支持的实现方式");

  const target = solutionDirectory(category, slug);
  await mkdir(target, { recursive: false });
  try {
    const template = await readJson(resolve(solutionsRoot, "_template", "solution.json"));
    Object.assign(template, { id: slug, slug, category, title, summary, implementationType });
    validateManifest(template, category, slug);
    await writeJsonAtomic(resolve(target, "solution.json"), template);
    const readmeTemplate = await readFile(resolve(solutionsRoot, "_template", "README.md"), "utf8");
    await writeFile(resolve(target, "README.md"), readmeTemplate.replaceAll("{{TITLE}}", title).replaceAll("{{SLUG}}", slug), "utf8");
    return { manifest: template };
  } catch (error) {
    await rm(target, { recursive: true, force: true });
    throw error;
  }
}

export async function updateManagedSolution(category, slug, manifest) {
  const target = solutionDirectory(category, slug);
  await stat(target);
  validateManifest(manifest, category, slug);
  const cleanManifest = structuredClone(manifest);
  if (cleanManifest.delivery) {
    delete cleanManifest.delivery.packageBytes;
    delete cleanManifest.delivery.sha256;
  }
  await writeJsonAtomic(resolve(target, "solution.json"), cleanManifest);
  return { manifest: cleanManifest };
}

export async function trashManagedSolution(category, slug, confirmation) {
  if (confirmation !== slug) throw new Error("删除确认文字与 slug 不一致");
  const source = solutionDirectory(category, slug);
  await stat(source);
  await mkdir(trashRoot, { recursive: true });
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const trashName = `${timestamp}__${category}__${slug}`;
  const target = resolve(trashRoot, trashName);
  await rename(source, target);
  return { trashName };
}

export async function restoreManagedSolution(trashName) {
  if (typeof trashName !== "string" || !/^[a-zA-Z0-9_.-]+$/.test(trashName)) throw new Error("非法回收站名称");
  const source = resolve(trashRoot, trashName);
  const sourceRelative = relative(trashRoot, source);
  if (sourceRelative.startsWith("..") || sourceRelative === "") throw new Error("非法回收站目录");
  const manifest = await readJson(resolve(source, "solution.json"));
  const target = solutionDirectory(manifest.category, manifest.slug);
  if (await pathExists(target)) throw new Error("同名方案已经存在，无法恢复");
  await rename(source, target);
  return { manifest };
}

export { allowedCategories };
