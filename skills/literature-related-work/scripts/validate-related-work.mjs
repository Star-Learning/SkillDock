import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

function argument(name) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

function parseBibEntries(source) {
  const entries = [];
  const start = /@([A-Za-z]+)\s*\{\s*([^,\s]+)\s*,/g;
  let match;
  while ((match = start.exec(source))) {
    const type = match[1].toLowerCase();
    if (["comment", "preamble", "string"].includes(type)) continue;
    let depth = 1;
    let cursor = start.lastIndex;
    for (; cursor < source.length && depth > 0; cursor += 1) {
      if (source[cursor] === "{") depth += 1;
      if (source[cursor] === "}") depth -= 1;
    }
    if (depth !== 0) throw new Error(`BibTeX 条目 ${match[2]} 的花括号未闭合`);
    entries.push({ key: match[2], body: source.slice(match.index, cursor) });
    start.lastIndex = cursor;
  }
  return entries;
}

function citedKeys(markdown) {
  const keys = new Set();
  for (const match of markdown.matchAll(/\[@([^\];,\s]+)(?:[^\]]*)\]/g)) {
    for (const key of match[0].matchAll(/@([^\];,\s]+)/g)) keys.add(key[1]);
  }
  return keys;
}

function bilingualSections(markdown) {
  const match = markdown.match(/^## 中文版\s*\r?\n\s*\r?\n([\s\S]*?)\r?\n\s*\r?\n## English Version\s*\r?\n\s*\r?\n([\s\S]*?)\s*$/);
  return match ? [match[1].trim(), match[2].trim()] : undefined;
}

function paragraphCount(text) {
  return text
    .split(/\r?\n\s*\r?\n/)
    .map((block) => block.trim())
    .filter(Boolean).length;
}

function sameKeySet(first, second) {
  return first.size === second.size && [...first].every((key) => second.has(key));
}

function textWithoutCitations(text) {
  return text.replace(/\[[^\]]*\]/g, "");
}

function cjkCharacterCount(text) {
  return [...textWithoutCitations(text)].filter((character) => /\p{Script=Han}/u.test(character)).length;
}

function englishWordCount(text) {
  return textWithoutCitations(text).match(/[A-Za-z]+(?:[-'][A-Za-z]+)*/g)?.length ?? 0;
}

const mdPath = argument("--md");
const bibPath = argument("--bib");
const minCitations = Number(argument("--min-citations") ?? "0");
const minRecentYear = Number(argument("--min-recent-year") ?? "0");
const minRecentShare = Number(argument("--min-recent-share") ?? "0");
const maxCjkChars = Number(argument("--max-cjk-chars") ?? "0");
const maxEnglishWords = Number(argument("--max-english-words") ?? "0");
const singleParagraph = process.argv.includes("--single-paragraph");
const bilingual = process.argv.includes("--bilingual");
if (!mdPath || !bibPath) {
  console.error("用法: node scripts/validate-related-work.mjs --md related_work.md --bib refs.bib");
  process.exit(2);
}

const markdown = await readFile(resolve(mdPath), "utf8");
const bib = await readFile(resolve(bibPath), "utf8");
const entries = parseBibEntries(bib);
const cited = citedKeys(markdown);
const keys = entries.map((entry) => entry.key);
const duplicates = keys.filter((key, index) => keys.indexOf(key) !== index);
const missing = [...cited].filter((key) => !keys.includes(key));
const unused = keys.filter((key) => !cited.has(key));
const incomplete = entries.filter((entry) => !/\btitle\s*=/.test(entry.body) || !/\bauthor\s*=/.test(entry.body) || !/\byear\s*=/.test(entry.body));
const citedEntries = entries.filter((entry) => cited.has(entry.key));
const recentEntries = citedEntries.filter((entry) => Number(entry.body.match(/\byear\s*=\s*[{\"]?(\d{4})/i)?.[1] ?? "0") >= minRecentYear);
const bilingualContent = bilingual ? bilingualSections(markdown) : undefined;
const chineseText = bilingualContent?.[0] ?? markdown;
const englishText = bilingualContent?.[1] ?? markdown;
const chineseCharacterCount = cjkCharacterCount(chineseText);
const englishWords = englishWordCount(englishText);
const bodyBlocks = markdown
  .split(/\r?\n\s*\r?\n/)
  .map((block) => block.trim())
  .filter((block) => block && !block.startsWith("#"));

const issues = [];
if (cited.size === 0) issues.push("related_work.md 没有找到 [@citation_key] 引文");
if (entries.length === 0) issues.push("refs.bib 没有找到 BibTeX 条目");
if (duplicates.length) issues.push(`重复 citation key: ${[...new Set(duplicates)].join(", ")}`);
if (missing.length) issues.push(`正文引用但 BibTeX 缺失: ${missing.join(", ")}`);
if (unused.length) issues.push(`BibTeX 未被正文引用: ${unused.join(", ")}`);
if (incomplete.length) issues.push(`缺少 title、author 或 year 的 BibTeX 条目: ${incomplete.map((entry) => entry.key).join(", ")}`);
if (/\b(?:TODO|TBD|待补|待确认|示例引用)\b/i.test(markdown)) issues.push("related_work.md 包含未完成占位文本");
if (minCitations && cited.size < minCitations) issues.push(`正文引用数量不足: ${cited.size}，至少需要 ${minCitations} 条`);
if (minRecentYear && minRecentShare && citedEntries.length && recentEntries.length / citedEntries.length < minRecentShare) {
  issues.push(`近期论文比例不足: ${recentEntries.length}/${citedEntries.length} 篇发表时间不早于 ${minRecentYear}，至少需要 ${(minRecentShare * 100).toFixed(0)}%`);
}
if (maxCjkChars && chineseCharacterCount > maxCjkChars) {
  issues.push(`中文正文过长: ${chineseCharacterCount} 个汉字，最多允许 ${maxCjkChars} 个（不计引用键）`);
}
if (maxEnglishWords && englishWords > maxEnglishWords) {
  issues.push(`英文正文过长: ${englishWords} 个词，最多允许 ${maxEnglishWords} 个（不计引用键）`);
}
if (bilingual && singleParagraph) issues.push("双语交付请使用 --bilingual，不要同时使用 --single-paragraph");
if (singleParagraph && !bilingual && bodyBlocks.length !== 1) issues.push(`要求单段式输出，但检测到 ${bodyBlocks.length} 个正文段落`);
if (bilingual) {
  if (!bilingualContent) {
    issues.push("双语输出必须采用“## 中文版”和“## English Version”两个标题，并在每个标题下各保留一段正文");
  } else {
    const [chinese, english] = bilingualContent;
    if (paragraphCount(chinese) !== 1 || paragraphCount(english) !== 1) {
      issues.push("双语输出要求中文和英文版本各自恰好一段正文");
    }
    const chineseCitations = citedKeys(chinese);
    const englishCitations = citedKeys(english);
    if (!sameKeySet(chineseCitations, englishCitations)) {
      issues.push("中文和英文版本的 citation key 集合不一致");
    }
  }
}

if (issues.length) {
  console.error("校验失败：");
  for (const issue of issues) console.error(`- ${issue}`);
  process.exit(1);
}

console.log(`结构校验通过：${entries.length} 条 BibTeX，${cited.size} 个正文引用。`);
if (minRecentYear) console.log(`近期性校验：${recentEntries.length}/${citedEntries.length} 篇不早于 ${minRecentYear}。`);
if (maxCjkChars) console.log(`中文长度：${chineseCharacterCount} 个汉字（上限 ${maxCjkChars}，不计引用键）。`);
if (maxEnglishWords) console.log(`英文长度：${englishWords} 个词（上限 ${maxEnglishWords}，不计引用键）。`);
if (bilingual) console.log("双语校验：中英文标题、单段结构与引用键集合一致。");
console.log("仍需人工确认：每条 BibTeX 均从 Google Scholar 原样复制，且每篇论文已完成原始记录与 Scholar 双重核验。");
