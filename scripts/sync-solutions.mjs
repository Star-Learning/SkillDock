import { createHash } from "node:crypto";
import { mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createZipBuffer } from "./lib/zip.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const solutionsRoot = resolve(root, "solutions");
const allowedCategories = new Set(["media", "research"]);
const manifests = [];
const readySlugs = new Set();
const maxPackageFileBytes = 25 * 1024 * 1024;
const maxPackageBytes = 100 * 1024 * 1024;
const ignoredDirectoryNames = new Set([".cache", ".git", ".next", ".turbo", "coverage", "dist", "node_modules", "out", "outputs"]);
const forbiddenFileNames = new Set([".npmrc", "credentials.json", "id_ed25519", "id_rsa", "service-account.json"]);
const secretPatterns = [
  { label: "private key", pattern: /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/ },
  { label: "OpenAI-style API key", pattern: /\bsk-[A-Za-z0-9_-]{20,}\b/ },
  { label: "Tencent Cloud SecretId", pattern: /\bAKID[A-Za-z0-9]{13,}\b/ },
];

function assertSafePackageFile(relativePath, data) {
  const normalized = relativePath.replace(/\\/g, "/");
  const fileName = normalized.split("/").at(-1)?.toLowerCase() ?? "";
  const isSecretEnv = fileName === ".env" || (fileName.startsWith(".env.") && fileName !== ".env.example");
  const isPrivateCertificate = /\.(?:pem|key|p12|pfx)$/i.test(fileName);
  const isCredentialFile = forbiddenFileNames.has(fileName) || /^(?:credentials|service-account)[.-].*\.json$/i.test(fileName);
  const isLogFile = fileName.endsWith(".log");
  if (isSecretEnv || isPrivateCertificate || isCredentialFile || isLogFile) {
    throw new Error(`${normalized}: 疑似凭证文件，禁止进入公开方案包`);
  }
  if (data.length > maxPackageFileBytes) {
    throw new Error(`${normalized}: 单个文件超过 25 MB，请把大文件或视频放到 COS/CDN`);
  }
  if (!data.includes(0)) {
    const content = data.toString("utf8");
    const matched = secretPatterns.find(({ pattern }) => pattern.test(content));
    if (matched) throw new Error(`${normalized}: 检测到 ${matched.label}，禁止公开打包`);
  }
}

async function collectPackageFiles(directory, prefix, relativePath = "") {
  const entries = await readdir(resolve(directory, relativePath), { withFileTypes: true });
  const files = [];
  for (const entry of entries.sort((a, b) => a.name.localeCompare(b.name))) {
    if (ignoredDirectoryNames.has(entry.name) || entry.name.endsWith(".zip") || entry.name.endsWith(".sha256")) continue;
    const childRelative = relativePath ? `${relativePath}/${entry.name}` : entry.name;
    if (entry.isSymbolicLink()) throw new Error(`${childRelative}: 方案包不允许包含符号链接`);
    if (entry.isDirectory()) files.push(...await collectPackageFiles(directory, prefix, childRelative));
    if (entry.isFile()) {
      const data = await readFile(resolve(directory, childRelative));
      assertSafePackageFile(childRelative, data);
      files.push({ name: `${prefix}/${childRelative}`, data });
    }
  }
  return files;
}

const categoryEntries = await readdir(solutionsRoot, { withFileTypes: true });
for (const categoryEntry of categoryEntries) {
  if (!categoryEntry.isDirectory() || !allowedCategories.has(categoryEntry.name)) continue;
  const categoryRoot = resolve(solutionsRoot, categoryEntry.name);
  const solutionEntries = await readdir(categoryRoot, { withFileTypes: true });

  for (const solutionEntry of solutionEntries) {
    if (!solutionEntry.isDirectory()) continue;
    const solutionRoot = resolve(categoryRoot, solutionEntry.name);
    const manifestPath = resolve(solutionRoot, "solution.json");
    const manifest = JSON.parse(await readFile(manifestPath, "utf8"));

    if (manifest.slug !== solutionEntry.name) throw new Error(`${manifestPath}: slug 必须与目录名一致`);
    if (manifest.category !== categoryEntry.name) throw new Error(`${manifestPath}: category 必须与上级目录一致`);
    if (!manifest.id || !manifest.stage) throw new Error(`${manifestPath}: 缺少 id 或 stage`);
    if (manifests.some((item) => item.id === manifest.id)) throw new Error(`${manifestPath}: id ${manifest.id} 重复`);

    if (manifest.stage === "ready") {
      readySlugs.add(manifest.slug);
      const publicSolutionsRoot = resolve(root, "public", "solutions");
      const publicSolutionRoot = resolve(publicSolutionsRoot, manifest.slug);
      const publicRelative = relative(publicSolutionsRoot, publicSolutionRoot);
      if (publicRelative.startsWith("..") || publicRelative === "") throw new Error(`${manifestPath}: 非法公开资源目录`);
      await rm(publicSolutionRoot, { recursive: true, force: true });

      for (const resource of manifest.resources ?? []) {
        const sourcePath = resolve(solutionRoot, resource.source);
        const sourceRelative = relative(solutionRoot, sourcePath);
        if (sourceRelative.startsWith("..") || sourceRelative === "") throw new Error(`${manifestPath}: resource.source 必须位于当前方案目录内`);

        const resourceData = await readFile(sourcePath);
        assertSafePackageFile(resource.source, resourceData);

        const publicTarget = resolve(root, "public", "solutions", manifest.slug, resource.fileName);
        await mkdir(dirname(publicTarget), { recursive: true });
        await writeFile(publicTarget, resourceData);

        if (resource.installAsSkill) {
          const skillTarget = resolve(root, ".agents", "skills", manifest.slug, resource.fileName);
          await mkdir(dirname(skillTarget), { recursive: true });
          await writeFile(skillTarget, resourceData);
        }
      }

      const packageFileName = manifest.delivery?.packageFileName;
      if (!packageFileName || !/^[^/\\]+\.zip$/i.test(packageFileName)) throw new Error(`${manifestPath}: ready 方案必须提供合法的 delivery.packageFileName`);
      if (!manifest.delivery?.version || !packageFileName.endsWith(`-v${manifest.delivery.version}.zip`)) {
        throw new Error(`${manifestPath}: 方案包文件名必须以 -v${manifest.delivery?.version ?? "<version>"}.zip 结尾`);
      }
      const packageTarget = resolve(publicSolutionRoot, packageFileName);
      await mkdir(dirname(packageTarget), { recursive: true });
      let packageFiles = await collectPackageFiles(solutionRoot, manifest.slug);
      if (!packageFiles.some((file) => file.name === `${manifest.slug}/SKILL.md`)) {
        const skillResource = (manifest.resources ?? []).find((resource) => resource.installAsSkill);
        if (skillResource) {
          const packagedSource = `${manifest.slug}/${skillResource.source.replace(/\\/g, "/")}`;
          const sourceFile = packageFiles.find((file) => file.name === packagedSource);
          if (sourceFile) {
            packageFiles = packageFiles.filter((file) => file.name !== packagedSource);
            packageFiles.push({ name: `${manifest.slug}/SKILL.md`, data: sourceFile.data });
          }
        }
      }
      const uncompressedBytes = packageFiles.reduce((sum, file) => sum + file.data.length, 0);
      if (uncompressedBytes > maxPackageBytes) throw new Error(`${manifestPath}: 方案包内容超过 100 MB，请把大文件移到 COS/CDN`);
      const packageBuffer = createZipBuffer(packageFiles);
      await writeFile(packageTarget, packageBuffer);
      manifest.delivery.packageBytes = packageBuffer.length;
      manifest.delivery.sha256 = createHash("sha256").update(packageBuffer).digest("hex");
      await writeFile(`${packageTarget}.sha256`, `${manifest.delivery.sha256}  ${packageFileName}\n`, "utf8");
    }

    manifests.push(manifest);
  }
}

const publicSolutionsRoot = resolve(root, "public", "solutions");
try {
  const publicEntries = await readdir(publicSolutionsRoot, { withFileTypes: true });
  for (const entry of publicEntries) {
    if (!entry.isDirectory() || readySlugs.has(entry.name)) continue;
    const stalePath = resolve(publicSolutionsRoot, entry.name);
    const staleRelative = relative(publicSolutionsRoot, stalePath);
    if (staleRelative.startsWith("..") || staleRelative === "") throw new Error(`非法过期资源目录: ${stalePath}`);
    await rm(stalePath, { recursive: true, force: true });
  }
} catch (error) {
  if (error?.code !== "ENOENT") throw error;
}

manifests.sort((a, b) => `${a.category}:${a.stage}:${a.slug}`.localeCompare(`${b.category}:${b.stage}:${b.slug}`));
const generatedPath = resolve(root, "data", "generated", "solutions.json");
await mkdir(dirname(generatedPath), { recursive: true });
await writeFile(generatedPath, `${JSON.stringify(manifests, null, 2)}\n`, "utf8");

console.log(`Synced ${manifests.length} solution folders.`);
