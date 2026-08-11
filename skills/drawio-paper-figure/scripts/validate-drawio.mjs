import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

function argument(name) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

function attributes(tag) {
  const result = {};
  for (const match of tag.matchAll(/([A-Za-z_:][\w:.-]*)\s*=\s*["']([^"']*)["']/g)) result[match[1]] = match[2];
  return result;
}

const inputPath = argument("--input");
const minVertices = Number(argument("--min-vertices") ?? "0");
const requireUncompressed = process.argv.includes("--require-uncompressed");
const requireNativeShapes = process.argv.includes("--require-native-shapes");
if (!inputPath) {
  console.error("用法: node scripts/validate-drawio.mjs --input figure.drawio [--min-vertices 1] [--require-uncompressed]");
  process.exit(2);
}

const source = await readFile(resolve(inputPath), "utf8");
const issues = [];
if (!/<mxfile\b/i.test(source) || !/<diagram\b/i.test(source) || !/<mxGraphModel\b/i.test(source)) {
  issues.push("缺少 mxfile、diagram 或 mxGraphModel 结构");
}
if (/<script\b/i.test(source)) issues.push("禁止在 Draw.io 文件中包含 script 标签");
if (requireUncompressed && !/<mxGraphModel\b[\s\S]*<\/mxGraphModel>/i.test(source)) {
  issues.push("要求未压缩 XML，但 diagram 中没有可读的 mxGraphModel");
}

const cellTags = [...source.matchAll(/<mxCell\b[^>]*>/gi)].map((match) => match[0]);
const cells = cellTags.map(attributes);
const ids = cells.map((cell) => cell.id).filter(Boolean);
const duplicateIds = [...new Set(ids.filter((id, index) => ids.indexOf(id) !== index))];
if (!ids.includes("0") || !ids.includes("1")) issues.push("缺少默认根 cell id=0 或图层 cell id=1");
if (duplicateIds.length) issues.push(`存在重复 cell id: ${duplicateIds.join(", ")}`);

const vertices = cells.filter((cell) => cell.vertex === "1");
const edges = cells.filter((cell) => cell.edge === "1");
if (vertices.length < minVertices) issues.push(`可编辑顶点数量不足: ${vertices.length}，至少需要 ${minVertices}`);
if (vertices.some((cell) => !cell.parent)) issues.push("存在没有 parent 的 vertex cell");
if (edges.some((cell) => !cell.parent)) issues.push("存在没有 parent 的 edge cell");
if (requireNativeShapes && /(?:data:image|imageData=|shape=image)/i.test(source)) {
  issues.push("检测到图片型 cell；要求原生形状时不能用整图或内嵌图片冒充重建");
}
if (!/<mxGeometry\b[\s\S]*\bas=["']geometry["']/i.test(source)) issues.push("没有找到 mxGeometry 几何信息");

if (issues.length) {
  console.error("Draw.io 校验失败：");
  for (const issue of issues) console.error(`- ${issue}`);
  process.exit(1);
}

console.log(`Draw.io 结构通过：${vertices.length} 个 vertex，${edges.length} 个 edge，${ids.length} 个 cell。`);
console.log("仍需人工确认：参考图结构、文字、预览布局和导出结果是否符合论文要求。");
