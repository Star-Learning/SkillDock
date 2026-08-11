import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { runResearch } from "../app/research";
import { buildStandaloneHtml } from "../app/standalone";

function argument(name: string, fallback?: string) {
  const index = process.argv.indexOf(`--${name}`);
  return index >= 0 ? process.argv[index + 1] : fallback;
}

function safeName(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 48) || "paper";
}

function extension(dataUrl: string) {
  const mime = dataUrl.match(/^data:image\/([^;,]+)/)?.[1]?.toLowerCase();
  return mime === "jpeg" ? "jpg" : mime === "svg+xml" ? "svg" : mime || "png";
}

async function main() {
  const currentYear = new Date().getFullYear();
  const topic = argument("topic")?.trim();
  const startYear = Number(argument("start", String(currentYear - 4)));
  const endYear = Number(argument("end", String(currentYear)));
  const language = argument("lang", "zh") === "en" ? "en" : "zh";
  const outputDirectory = resolve(process.cwd(), argument("output", "outputs")!);
  if (!topic) throw new Error("缺少 --topic。示例：npm run research -- --topic \"AI Agent Memory\"");
  if (!Number.isInteger(startYear) || !Number.isInteger(endYear) || startYear > endYear) throw new Error("年份范围无效。");

  const result = await runResearch({ topic, language, startYear, endYear }, (progress) => {
    console.log(`[${progress.percent}%] ${progress.message}${progress.detail ? ` · ${progress.detail}` : ""}`);
  });
  const picsDirectory = resolve(outputDirectory, "pics");
  await mkdir(picsDirectory, { recursive: true });
  const figureRecords: Array<{ paperId: string; title: string; caption: string; sourceUrl: string; files: string[] }> = [];

  for (const [paperIndex, paper] of result.papers.entries()) {
    const figure = paper.representativeFigure!;
    const panels = figure.dataUrls?.length ? figure.dataUrls : [figure.dataUrl];
    const files: string[] = [];
    for (const [panelIndex, dataUrl] of panels.entries()) {
      const fileName = `${String(paperIndex + 1).padStart(2, "0")}-${safeName(paper.title)}${panels.length > 1 ? `-${panelIndex + 1}` : ""}.${extension(dataUrl)}`;
      await writeFile(resolve(picsDirectory, fileName), Buffer.from(dataUrl.split(",")[1], "base64"));
      files.push(`pics/${fileName}`);
    }
    figureRecords.push({ paperId: paper.id, title: paper.title, caption: figure.caption, sourceUrl: figure.sourceUrl, files });
  }

  await Promise.all([
    writeFile(resolve(outputDirectory, "research.md"), result.researchMarkdown, "utf8"),
    writeFile(resolve(outputDirectory, "storyboard.json"), `${JSON.stringify(result.storyboard, null, 2)}\n`, "utf8"),
    writeFile(resolve(outputDirectory, "figures.json"), `${JSON.stringify(figureRecords, null, 2)}\n`, "utf8"),
    writeFile(resolve(outputDirectory, "index.html"), buildStandaloneHtml(result), "utf8"),
  ]);
  console.log(`完成：${result.papers.length} 篇带图论文，结果保存在 ${outputDirectory}`);
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
