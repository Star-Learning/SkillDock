import { access, mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const [category, slug, ...titleParts] = process.argv.slice(2);
const title = titleParts.join(" ") || "待命名解决方案";

if (!new Set(["media", "research"]).has(category)) throw new Error("大类必须是 media 或 research");
if (!/^[a-z0-9-]+$/.test(slug ?? "")) throw new Error("请提供小写英文 slug，例如 literature-review");

const target = resolve(root, "solutions", category, slug);
try {
  await access(target);
  throw new Error(`目录已经存在：${target}`);
} catch (error) {
  if (error?.code !== "ENOENT") throw error;
}

const template = JSON.parse(await readFile(resolve(root, "solutions", "_template", "solution.json"), "utf8"));
template.id = slug;
template.slug = slug;
template.category = category;
template.title = title;
template.summary = "请用一句话说明这个需求要解决什么问题，以及最终得到什么。";

await mkdir(target, { recursive: true });
await writeFile(resolve(target, "solution.json"), `${JSON.stringify(template, null, 2)}\n`, "utf8");
const readmeTemplate = await readFile(resolve(root, "solutions", "_template", "README.md"), "utf8");
await writeFile(resolve(target, "README.md"), readmeTemplate.replaceAll("{{TITLE}}", title).replaceAll("{{SLUG}}", slug), "utf8");

console.log(`Created draft solution: solutions/${category}/${slug}`);
