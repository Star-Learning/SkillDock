import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import type { PaperRecord, ResearchPhase, ResearchProgress, ResearchRequest, ResearchResult, StoryScene } from "./types";

type VenueConfig = { ccf_a: string[]; cas_q1: string[]; recognized: string[] };

type OpenAlexWork = {
  id?: string;
  doi?: string | null;
  title?: string | null;
  display_name?: string | null;
  publication_year?: number | null;
  publication_date?: string | null;
  cited_by_count?: number | null;
  relevance_score?: number | null;
  authorships?: Array<{ author?: { display_name?: string | null } }>;
  primary_location?: { landing_page_url?: string | null; source?: { display_name?: string | null; type?: string | null } | null } | null;
  best_oa_location?: { landing_page_url?: string | null } | null;
  locations?: Array<{ landing_page_url?: string | null; source?: { display_name?: string | null } | null }>;
  abstract_inverted_index?: Record<string, number[]> | null;
};

type OpenAlexResponse = { meta?: { count?: number }; results?: OpenAlexWork[] };

const STOP_WORDS = new Set([
  "about", "after", "also", "among", "based", "been", "before", "between", "both", "can", "from", "have", "into", "more", "most", "paper", "propose", "proposed", "results", "show", "study", "than", "that", "the", "their", "these", "this", "through", "towards", "using", "with", "without", "method", "methods", "model", "models", "approach", "learning", "research", "review", "survey",
]);

type ProgressReporter = (progress: ResearchProgress) => void | Promise<void>;

async function reportProgress(reporter: ProgressReporter | undefined, progress: ResearchProgress) {
  await reporter?.(progress);
}

function parseVenueConfig(source: string): VenueConfig {
  const result: VenueConfig = { ccf_a: [], cas_q1: [], recognized: [] };
  let current: keyof VenueConfig | undefined;
  for (const rawLine of source.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (line === "ccf_a:" || line === "cas_q1:" || line === "recognized:") {
      current = line.slice(0, -1) as keyof VenueConfig;
    } else if (current && line.startsWith("- ")) {
      result[current].push(line.slice(2).trim());
    }
  }
  return result;
}

async function loadVenueConfig() {
  const localPath = resolve(process.cwd(), "config", "venues.yaml");
  const integratedPath = resolve(process.cwd(), "solutions", "research", "research2story", "config", "venues.yaml");
  try {
    return parseVenueConfig(await readFile(localPath, "utf8"));
  } catch {
    return parseVenueConfig(await readFile(integratedPath, "utf8"));
  }
}

async function fetchWithTimeout(url: string, timeoutMs = 12000, accept = "application/json") {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { cache: "no-store", signal: controller.signal, headers: { Accept: accept, "User-Agent": "Research2Story/1.0" } });
  } finally {
    clearTimeout(timeout);
  }
}

async function searchOpenAlex(query: string, request: ResearchRequest, sort = "cited_by_count:desc") {
  const filter = [`from_publication_date:${request.startYear}-01-01`, `to_publication_date:${request.endYear}-12-31`, "has_abstract:true"].join(",");
  const params = new URLSearchParams({ search: query, filter, sort, "per-page": "40" });
  const response = await fetchWithTimeout(`https://api.openalex.org/works?${params.toString()}`);
  if (!response.ok) throw new Error(`OpenAlex returned ${response.status}`);
  return await response.json() as OpenAlexResponse;
}

function decodeXml(value: string) {
  return value.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&amp;/g, "&").replace(/\s+/g, " ").trim();
}

function xmlTag(source: string, tag: string) {
  const match = source.match(new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${tag}>`, "i"));
  return match ? decodeXml(match[1]) : "";
}

async function searchArxiv(request: ResearchRequest, topicTokens: string[]) {
  const searchQuery = (topicTokens.length ? topicTokens : extractTokens(request.topic)).map((token) => `all:${token}`).join(" AND ");
  const params = new URLSearchParams({ search_query: searchQuery, start: "0", max_results: "50", sortBy: "relevance", sortOrder: "descending" });
  const response = await fetchWithTimeout(`https://export.arxiv.org/api/query?${params.toString()}`, 18000, "application/atom+xml");
  if (!response.ok) throw new Error(`arXiv returned ${response.status}`);
  const xml = await response.text();
  const entries = xml.match(/<entry>[\s\S]*?<\/entry>/gi) ?? [];
  return entries.flatMap((entry): PaperRecord[] => {
    const title = xmlTag(entry, "title");
    const abstract = xmlTag(entry, "summary");
    const published = xmlTag(entry, "published");
    const year = Number(published.slice(0, 4));
    const officialUrl = xmlTag(entry, "id");
    const arxivId = officialUrl.match(/\/abs\/([^/?#]+)/i)?.[1];
    const authors = [...entry.matchAll(/<author>[\s\S]*?<name>([\s\S]*?)<\/name>[\s\S]*?<\/author>/gi)].map((match) => decodeXml(match[1])).filter(Boolean).slice(0, 12);
    if (!title || !abstract || !year || year < request.startYear || year > request.endYear || !officialUrl || !arxivId || !authors.length) return [];
    if (!topicMatch(title, abstract, topicTokens, request.topic).eligible) return [];
    const base = { id: `arxiv:${arxivId}`, title, authors, year, venue: "arXiv", venueTier: "arXiv" as const, publicationType: "arxiv-preprint" as const, arxivId, officialUrl, abstract, citations: 0 };
    return [{ ...base, relevanceScore: scorePaper(base, topicTokens, request.topic, request.endYear, 30), verifiedSources: ["arXiv abstract page"] }];
  });
}

function rebuildAbstract(index?: Record<string, number[]> | null) {
  if (!index) return "";
  const words: string[] = [];
  for (const [word, positions] of Object.entries(index)) for (const position of positions) words[position] = word;
  return words.filter(Boolean).join(" ");
}

function normalize(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9\u4e00-\u9fff]+/g, " ").trim();
}

function extractTokens(value: string) {
  return normalize(value).split(/\s+/).filter((token) => token.length > 2 && !STOP_WORDS.has(token));
}

function topKeywords(texts: string[], excluded: Set<string>, limit = 6) {
  const counts = new Map<string, number>();
  for (const text of texts) {
    const seen = new Set(extractTokens(text));
    for (const token of seen) if (!excluded.has(token)) counts.set(token, (counts.get(token) ?? 0) + 1);
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).slice(0, limit).map(([token]) => token);
}

function matchVenue(venue: string, config: VenueConfig) {
  const target = normalize(venue);
  const words = new Set(target.split(" "));
  const matches = (items: string[]) => items.some((item) => {
    const candidate = normalize(item);
    return target === candidate || (candidate.length <= 10 && !candidate.includes(" ") && words.has(candidate));
  });
  if (/arxiv/i.test(venue)) return "arXiv" as const;
  if (matches(config.ccf_a)) return "CCF-A" as const;
  if (matches(config.cas_q1)) return "CAS-Q1" as const;
  if (matches(config.recognized)) return "recognized" as const;
  return "other" as const;
}

function extractArxivId(...values: Array<string | undefined>) {
  for (const value of values) {
    const match = value?.match(/(?:arxiv\.org\/(?:abs|pdf)\/|arxiv[.:])([0-9]{4}\.[0-9]{4,5}(?:v\d+)?)/i);
    if (match) return match[1];
  }
  return undefined;
}

function topicMatch(title: string, abstract: string, topicTokens: string[], topic: string) {
  const titleText = normalize(title);
  const fullText = normalize(`${title} ${abstract}`);
  const titleMatches = topicTokens.filter((token) => titleText.includes(token)).length;
  const covered = topicTokens.filter((token) => fullText.includes(token)).length;
  const phraseMatch = fullText.includes(normalize(topic));
  return { eligible: phraseMatch || titleMatches >= 1, titleMatches, covered, phraseMatch };
}

function scorePaper(paper: Omit<PaperRecord, "relevanceScore" | "verifiedSources">, topicTokens: string[], topic: string, endYear: number, openAlexRelevance = 0) {
  const match = topicMatch(paper.title, paper.abstract, topicTokens, topic);
  const venueScore = { "CCF-A": 44, "CAS-Q1": 38, recognized: 28, arXiv: 22, other: 12 }[paper.venueTier];
  const citationScore = Math.min(24, Math.log10(Math.max(1, paper.citations) + 1) * 9);
  const recencyScore = Math.max(0, 12 - Math.max(0, endYear - paper.year) * 2);
  const searchScore = Math.min(50, Math.log10(Math.max(1, openAlexRelevance) + 1) * 15);
  return Math.round((match.titleMatches * 24 + match.covered * 9 + (match.phraseMatch ? 30 : 0) + venueScore + citationScore + recencyScore + searchScore) * 10) / 10;
}

function toPaper(work: OpenAlexWork, config: VenueConfig, topicTokens: string[], topic: string, endYear: number): PaperRecord | undefined {
  const title = (work.title || work.display_name || "").trim();
  const year = work.publication_year ?? Number(work.publication_date?.slice(0, 4));
  const authors = (work.authorships ?? []).map((item) => item.author?.display_name?.trim()).filter((item): item is string => Boolean(item)).slice(0, 12);
  const venue = work.primary_location?.source?.display_name?.trim() || "Unknown venue";
  const abstract = rebuildAbstract(work.abstract_inverted_index);
  const doi = work.doi?.replace(/^https?:\/\/(?:dx\.)?doi\.org\//i, "") || undefined;
  const locations = [work.primary_location?.landing_page_url, work.best_oa_location?.landing_page_url, ...(work.locations ?? []).map((location) => location.landing_page_url)].filter((value): value is string => Boolean(value));
  const landingPage = locations[0];
  const arxivId = extractArxivId(...locations, doi, work.id);
  const publicationType = !doi && (arxivId || /arxiv/i.test(venue)) ? "arxiv-preprint" : "published";
  const officialUrl = doi ? `https://doi.org/${doi}` : landingPage || work.id || "";
  if (!title || !year || !authors.length || !abstract || !officialUrl || (!doi && !arxivId)) return undefined;
  if (!topicMatch(title, abstract, topicTokens, topic).eligible) return undefined;

  const base = {
    id: work.id || doi || arxivId || normalize(title),
    title,
    authors,
    year,
    venue: publicationType === "arxiv-preprint" ? "arXiv" : venue,
    venueTier: matchVenue(publicationType === "arxiv-preprint" ? "arXiv" : venue, config),
    publicationType,
    doi,
    arxivId,
    officialUrl,
    abstract,
    citations: work.cited_by_count ?? 0,
  } satisfies Omit<PaperRecord, "relevanceScore" | "verifiedSources">;

  return { ...base, relevanceScore: scorePaper(base, topicTokens, topic, endYear, work.relevance_score ?? 0), verifiedSources: ["OpenAlex"] };
}

function deduplicate(papers: PaperRecord[]) {
  const unique = new Map<string, PaperRecord>();
  for (const paper of papers) {
    const key = paper.doi?.toLowerCase() || paper.arxivId?.toLowerCase() || normalize(paper.title);
    const current = unique.get(key);
    if (!current || paper.relevanceScore > current.relevanceScore) unique.set(key, paper);
  }
  return [...unique.values()];
}

function papersByYear(papers: PaperRecord[], perYear: number) {
  const groups = new Map<number, PaperRecord[]>();
  for (const paper of papers) groups.set(paper.year, [...(groups.get(paper.year) ?? []), paper]);
  return [...groups.entries()]
    .sort(([yearA], [yearB]) => yearA - yearB)
    .flatMap(([, group]) => group.sort((a, b) => b.relevanceScore - a.relevanceScore).slice(0, perYear));
}

function selectTimelinePapers(papers: PaperRecord[], limit = 18) {
  const anchors = papersByYear(papers, 2);
  const anchorIds = new Set(anchors.map((paper) => paper.id));
  const remaining = papers.filter((paper) => !anchorIds.has(paper.id)).sort((a, b) => b.relevanceScore - a.relevanceScore);
  return [...anchors, ...remaining].slice(0, limit);
}

async function addCrossrefVerification(papers: PaperRecord[]) {
  const targets = papers.filter((paper) => paper.doi).slice(0, 12);
  await Promise.all(targets.map(async (paper) => {
    try {
      const response = await fetchWithTimeout(`https://api.crossref.org/works/${encodeURIComponent(paper.doi!)}`, 6000);
      if (response.ok) paper.verifiedSources.push("Crossref / DOI");
    } catch {
      // OpenAlex metadata and the DOI link remain available when Crossref is temporarily unavailable.
    }
  }));
  for (const paper of papers) if (paper.arxivId) paper.verifiedSources.push("arXiv identifier");
}

function htmlText(value: string) {
  const withoutTags = value
    .replace(/<script\b[\s\S]*?<\/script>/gi, " ")
    .replace(/<style\b[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ");
  return decodeXml(withoutTags)
    .replace(/&#(\d+);/g, (_, code: string) => String.fromCodePoint(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code: string) => String.fromCodePoint(Number.parseInt(code, 16)))
    .replace(/&nbsp;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function imageAttribute(source: string, name: string) {
  const match = source.match(new RegExp(`\\b${name}\\s*=\\s*(?:"([^"]+)"|'([^']+)'|([^\\s>]+))`, "i"));
  return match?.[1] || match?.[2] || match?.[3];
}

function scoreFigure(caption: string, index: number) {
  const text = normalize(caption);
  const positive: Array<[RegExp, number]> = [
    [/architecture|architectural/, 100],
    [/framework/, 92],
    [/pipeline/, 88],
    [/overview/, 82],
    [/system design|system diagram/, 78],
    [/workflow/, 74],
    [/model structure|network structure/, 72],
    [/method|model|system/, 35],
  ];
  const negative: Array<[RegExp, number]> = [
    [/ablation/, -70],
    [/qualitative|case study|example output/, -48],
    [/accuracy|performance|result|comparison|curve/, -40],
    [/distribution|histogram|confusion matrix/, -35],
  ];
  return 24 - index * 2
    + positive.reduce((score, [pattern, weight]) => score + (pattern.test(text) ? weight : 0), 0)
    + negative.reduce((score, [pattern, weight]) => score + (pattern.test(text) ? weight : 0), 0);
}

function inferImageMime(url: string, contentType: string | null) {
  const declared = contentType?.split(";")[0].trim().toLowerCase();
  if (declared?.startsWith("image/")) return declared;
  const pathname = new URL(url).pathname.toLowerCase();
  if (pathname.endsWith(".svg")) return "image/svg+xml";
  if (pathname.endsWith(".webp")) return "image/webp";
  if (pathname.endsWith(".gif")) return "image/gif";
  if (pathname.endsWith(".jpg") || pathname.endsWith(".jpeg")) return "image/jpeg";
  if (pathname.endsWith(".png")) return "image/png";
  return undefined;
}

async function extractRepresentativeFigure(paper: PaperRecord) {
  if (!paper.arxivId) return undefined;
  const arxivId = paper.arxivId.replace(/v\d+$/i, "");
  const pageUrl = `https://ar5iv.labs.arxiv.org/html/${encodeURIComponent(arxivId)}`;
  try {
    const response = await fetchWithTimeout(pageUrl, 18000, "text/html,application/xhtml+xml");
    if (!response.ok) return undefined;
    const html = await response.text();
    const figures = html.match(/<figure\b[\s\S]*?<\/figure>/gi) ?? [];
    const candidates = figures.flatMap((figure, index) => {
      const imageTags = figure.match(/<img\b[^>]*>/gi) ?? [];
      if (!imageTags.length) return [];
      const captionMatch = figure.match(/<figcaption\b[^>]*>([\s\S]*?)<\/figcaption>/i);
      const caption = htmlText(captionMatch?.[1] || imageAttribute(imageTags[0]!, "alt") || `Figure ${index + 1}`);
      const sourceUrls = [...new Set(imageTags.flatMap((imageTag) => {
        const source = imageAttribute(imageTag, "src") || imageAttribute(imageTag, "data-src");
        if (!source || source.startsWith("data:")) return [];
        try {
          const sourceUrl = new URL(source, pageUrl).toString();
          return sourceUrl.startsWith("https://") ? [sourceUrl] : [];
        } catch {
          return [];
        }
      }))].slice(0, 8);
      return sourceUrls.length ? [{ sourceUrl: sourceUrls[0]!, sourceUrls, caption, score: scoreFigure(caption, index) }] : [];
    }).sort((a, b) => b.score - a.score);

    for (const candidate of candidates.slice(0, 5)) {
      const dataUrls: string[] = [];
      let totalBytes = 0;
      for (const sourceUrl of candidate.sourceUrls) {
        try {
          const imageResponse = await fetchWithTimeout(sourceUrl, 14000, "image/*");
          if (!imageResponse.ok) continue;
          const contentLength = Number(imageResponse.headers.get("content-length") || 0);
          if (contentLength > 1_500_000 || totalBytes + contentLength > 2_500_000) continue;
          const mime = inferImageMime(sourceUrl, imageResponse.headers.get("content-type"));
          if (!mime) continue;
          const bytes = await imageResponse.arrayBuffer();
          if (!bytes.byteLength || bytes.byteLength > 1_500_000 || totalBytes + bytes.byteLength > 2_500_000) continue;
          totalBytes += bytes.byteLength;
          dataUrls.push(`data:${mime};base64,${Buffer.from(bytes).toString("base64")}`);
        } catch {
          // Preserve the other panels when an individual subfigure is unavailable.
        }
      }
      if (dataUrls.length) {
        return {
          dataUrl: dataUrls[0],
          dataUrls,
          sourceUrl: candidate.sourceUrl,
          caption: candidate.caption,
        };
      }
    }
  } catch {
    // Papers without an extractable real figure are excluded from the animation.
  }
  return undefined;
}

async function attachRepresentativeFigures(papers: PaperRecord[], reporter?: ProgressReporter) {
  let cursor = 0;
  let completed = 0;
  let found = 0;
  const worker = async () => {
    while (cursor < papers.length) {
      const paper = papers[cursor++];
      const figure = await extractRepresentativeFigure(paper);
      if (figure) {
        paper.representativeFigure = figure;
        found += 1;
      }
      completed += 1;
      await reportProgress(reporter, {
        stage: "figures",
        percent: Math.round(60 + (completed / papers.length) * 25),
        message: `正在提取论文代表图 ${completed}/${papers.length}`,
        detail: `已找到 ${found} 张真实论文图，优先识别模型结构、框架与流程图。`,
      });
    }
  };
  await Promise.all(Array.from({ length: Math.min(4, papers.length) }, worker));
  return papers.filter((paper) => Boolean(paper.representativeFigure));
}

function buildPhases(papers: PaperRecord[], request: ResearchRequest) {
  const topicTokens = new Set(extractTokens(request.topic));
  const span = request.endYear - request.startYear + 1;
  const desired = span <= 2 ? 1 : Math.min(4, Math.max(2, Math.ceil(span / 2)));
  const width = Math.max(1, Math.ceil(span / desired));
  const groups: PaperRecord[][] = Array.from({ length: desired }, () => []);
  for (const paper of papers) groups[Math.min(desired - 1, Math.max(0, Math.floor((paper.year - request.startYear) / width)))].push(paper);

  return groups.flatMap((group, index): ResearchPhase[] => {
    if (!group.length) return [];
    const startYear = Math.min(...group.map((paper) => paper.year));
    const endYear = Math.max(...group.map((paper) => paper.year));
    const keywords = topKeywords(group.map((paper) => `${paper.title} ${paper.abstract}`), topicTokens, 4);
    const range = startYear === endYear ? `${startYear}` : `${startYear}–${endYear}`;
    const focus = keywords.slice(0, 2).join(" / ") || (request.language === "zh" ? "关键方法演进" : "Method evolution");
    const topPaper = [...group].sort((a, b) => b.relevanceScore - a.relevanceScore)[0];
    const summary = request.language === "zh"
      ? `这一阶段的高频主题集中在 ${keywords.slice(0, 3).join("、") || "核心问题"}。代表性工作包括 ${topPaper.title}，阶段判断只使用已核验论文的标题与摘要。`
      : `Recurring themes include ${keywords.slice(0, 3).join(", ") || "the core problem"}. A representative work is ${topPaper.title}; this phase is based only on verified titles and abstracts.`;
    return [{ id: `phase-${index + 1}`, title: `${range} · ${focus}`, startYear, endYear, summary, keywords, paperIds: group.sort((a, b) => b.relevanceScore - a.relevanceScore).map((paper) => paper.id) }];
  });
}

function firstSentence(text: string, max = 260) {
  const sentence = text.split(/(?<=[.!?。！？])\s+/)[0] || text;
  return sentence.length > max ? `${sentence.slice(0, max).trim()}…` : sentence;
}

function buildStoryboard(topic: string, language: ResearchRequest["language"], phases: ResearchPhase[], papers: PaperRecord[], routes: string[]) {
  const zh = language === "zh";
  const byId = new Map(papers.map((paper) => [paper.id, paper]));
  const scenes: StoryScene[] = [{
    id: "title",
    type: "title",
    eyebrow: "Research2Story",
    title: topic,
    text: zh ? `基于 ${papers.length} 篇已核验论文梳理研究发展脉络。` : `A research evolution story based on ${papers.length} verified papers.`,
    narration: zh ? `接下来，我们从研究问题出发，看看 ${topic} 是如何一步步发展到今天的。` : `Let us trace how ${topic} evolved into its current form.`,
  }, {
    id: "timeline",
    type: "timeline",
    eyebrow: zh ? "整体时间线" : "Timeline",
    title: zh ? "主要研究阶段" : "Major research phases",
    text: zh ? "阶段由论文时间分布和摘要高频主题共同确定。" : "Phases are derived from publication years and recurring abstract themes.",
    narration: zh ? `整个发展过程可以分成 ${phases.length} 个主要阶段。` : `The development can be organized into ${phases.length} major phases.`,
    items: phases.map((phase) => phase.title),
  }];

  for (const phase of phases) {
    scenes.push({ id: phase.id, type: "research_phase", eyebrow: `${phase.startYear}—${phase.endYear}`, title: phase.title, text: phase.summary, narration: phase.summary, items: phase.keywords });
    for (const paperId of phase.paperIds) {
      const paper = byId.get(paperId);
      if (!paper) continue;
      const typeLabel = paper.publicationType === "arxiv-preprint" ? "arXiv preprint" : `${paper.venue} ${paper.year}`;
      scenes.push({
        id: `paper-${paper.id.replace(/[^a-z0-9]+/gi, "-")}`,
        type: "paper_card",
        eyebrow: typeLabel,
        title: paper.title,
        text: firstSentence(paper.abstract),
        narration: zh ? `这篇工作的摘要显示：${firstSentence(paper.abstract, 180)}。它被放在这里，是因为它能代表这一阶段的重要变化。` : `Its abstract states: ${firstSentence(paper.abstract, 180)}. It represents an important change in this phase.`,
        year: paper.year,
        paperId: paper.id,
      });
    }
  }

  scenes.push({
    id: "frontier",
    type: "current_frontier",
    eyebrow: zh ? "当前前沿" : "Current frontier",
    title: zh ? "正在聚集的技术路线" : "Emerging technical routes",
    text: zh ? "这些路线来自入选论文标题与摘要中的高频主题，不代表完整领域分类。" : "These routes are recurring themes in the selected titles and abstracts, not an exhaustive taxonomy.",
    narration: zh ? `当前研究主要围绕 ${routes.join("、")} 等方向继续推进。` : `Current work is increasingly organized around ${routes.join(", ")}.`,
    items: routes,
  }, {
    id: "summary",
    type: "summary",
    eyebrow: zh ? "总结" : "Summary",
    title: zh ? "从论文列表到研究脉络" : "From a paper list to a research story",
    text: zh ? "报告保留每篇论文的正式链接和核验来源，便于继续阅读与人工复核。" : "The report retains official links and verification sources for continued reading and review.",
    narration: zh ? "这不是简单的论文罗列，而是一条可以继续核验、补充和更新的研究发展线索。" : "This is not merely a paper list, but an auditable research evolution map that can be extended over time.",
  });
  return scenes;
}

function markdownEscape(value: string) {
  return value.replace(/([\[\]*_`])/g, "\\$1");
}

function buildMarkdown(request: ResearchRequest, papers: PaperRecord[], phases: ResearchPhase[], routes: string[], generatedAt: string) {
  const zh = request.language === "zh";
  const byId = new Map(papers.map((paper) => [paper.id, paper]));
  const phaseSections = phases.map((phase, index) => {
    const paperSections = phase.paperIds.map((id) => byId.get(id)).filter((paper): paper is PaperRecord => Boolean(paper)).map((paper) => `### ${markdownEscape(paper.title)}\n\n${paper.representativeFigure ? `![${markdownEscape(paper.representativeFigure.caption)}](${paper.representativeFigure.sourceUrl})\n\n*${markdownEscape(paper.representativeFigure.caption)}*\n\n` : ""}- Authors: ${paper.authors.join(", ")}\n- Venue / Year: ${paper.publicationType === "arxiv-preprint" ? "arXiv preprint" : paper.venue} / ${paper.year}\n- DOI / arXiv ID: ${paper.doi || paper.arxivId || "N/A"}\n- Official URL: ${paper.officialUrl}\n- Verification: ${paper.verifiedSources.join(" + ")}\n- Core Idea: ${firstSentence(paper.abstract)}\n- Why It Matters: ${zh ? `该论文是“${phase.title}”阶段中相关性与质量评分较高的代表工作。` : `This is a representative high-scoring work in the “${phase.title}” phase.`}`).join("\n\n");
    return `## ${index + 4}. ${zh ? "阶段" : "Phase"} ${index + 1}：${phase.title}\n\n${phase.summary}\n\n${paperSections}`;
  }).join("\n\n");
  const recent = [...papers].sort((a, b) => b.year - a.year || b.relevanceScore - a.relevanceScore).slice(0, 6);
  const references = [...papers].sort((a, b) => a.year - b.year || a.title.localeCompare(b.title)).map((paper, index) => `${index + 1}. ${paper.authors.join(", ")}. ${paper.title}. ${paper.publicationType === "arxiv-preprint" ? "arXiv preprint" : paper.venue}, ${paper.year}. ${paper.officialUrl}`).join("\n");
  const sourceText = "OpenAlex; Crossref / DOI where available; arXiv identifiers where available";

  if (!zh) return `# ${request.topic}: Research Evolution\n\n> Generated: ${generatedAt}\n> Time range: ${request.startYear}–${request.endYear}\n> Sources: ${sourceText}\n> Included papers: ${papers.length}\n\n## 1. One-sentence overview\n\nThe selected literature evolves through ${phases.length} phases, with recurring themes around ${routes.join(", ")}.\n\n## 2. Background and core question\n\nThis report maps verified publications by technical themes and transitions. Claims below are limited to paper metadata and abstracts; full-text conclusions require manual review.\n\n## 3. Overall route\n\n${phases.map((phase, index) => `${index + 1}. ${phase.title}`).join("\n")}\n\n${phaseSections}\n\n## ${phases.length + 4}. Current technical routes\n\n${routes.map((route) => `- ${route}`).join("\n")}\n\n## ${phases.length + 5}. Consensus, disputes, and bottlenecks\n\nRecurring abstract themes indicate active convergence around the routes above. Differences in tasks, datasets, and evaluation protocols should be checked in the full text before stronger conclusions are drawn.\n\n## ${phases.length + 6}. Recent trends\n\n${recent.map((paper) => `- ${paper.year}: [${markdownEscape(paper.title)}](${paper.officialUrl})`).join("\n")}\n\n## References\n\n${references}\n`;

  return `# ${request.topic}：研究发展脉络\n\n> 调研时间：${generatedAt}\n> 时间范围：${request.startYear}–${request.endYear}\n> 检索来源：${sourceText}\n> 纳入论文数量：${papers.length}\n\n## 1. 一句话看懂这个领域\n\n入选文献大致经历 ${phases.length} 个阶段，高频技术主题集中在 ${routes.join("、")}。\n\n## 2. 研究背景与核心问题\n\n本报告按照技术主题与阶段转折组织已核验论文。正文判断仅基于论文元数据和摘要；涉及实验细节与更强结论时，仍需回到论文全文复核。\n\n## 3. 整体发展路线\n\n${phases.map((phase, index) => `${index + 1}. ${phase.title}`).join("\n")}\n\n${phaseSections}\n\n## ${phases.length + 4}. 当前主要技术路线\n\n${routes.map((route) => `- ${route}`).join("\n")}\n\n## ${phases.length + 5}. 当前共识、争议与瓶颈\n\n标题和摘要中的高频主题表明，研究正在围绕以上路线持续聚集。不同任务、数据集和评价协议之间是否可直接比较，需要结合全文进一步核验。\n\n## ${phases.length + 6}. 最新研究趋势\n\n${recent.map((paper) => `- ${paper.year}：[${markdownEscape(paper.title)}](${paper.officialUrl})`).join("\n")}\n\n## References\n\n${references}\n`;
}

async function enhanceStoryboard(request: ResearchRequest, papers: PaperRecord[], scenes: StoryScene[]) {
  const baseUrl = process.env.LLM_BASE_URL?.replace(/\/$/, "");
  const model = process.env.LLM_MODEL;
  if (!baseUrl || !model) return undefined;
  const endpoint = baseUrl.endsWith("/chat/completions") ? baseUrl : `${baseUrl}/chat/completions`;
  const payload = papers.slice(0, 16).map((paper) => ({ id: paper.id, title: paper.title, year: paper.year, venue: paper.venue, abstract: paper.abstract.slice(0, 700) }));
  const prompt = `You are improving a research storyboard about "${request.topic}". Use only the verified papers in the supplied JSON. Do not add papers, venues, years, claims, or identifiers. Return JSON only: {"scenes":[{"id":"existing scene id","title":"...","text":"...","narration":"..."}]}. Keep every narration concise and explain transitions rather than reading abstracts. Language: ${request.language === "zh" ? "Chinese" : "English"}. Existing scene IDs: ${scenes.map((scene) => scene.id).join(", ")}. Papers: ${JSON.stringify(payload)}`;
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 45000);
    const response = await fetch(endpoint, {
      method: "POST",
      signal: controller.signal,
      headers: { "Content-Type": "application/json", ...(process.env.LLM_API_KEY ? { Authorization: `Bearer ${process.env.LLM_API_KEY}` } : {}) },
      body: JSON.stringify({ model, messages: [{ role: "user", content: prompt }], temperature: 0.2 }),
    });
    clearTimeout(timeout);
    if (!response.ok) return undefined;
    const data = await response.json() as { choices?: Array<{ message?: { content?: string } }> };
    const content = data.choices?.[0]?.message?.content?.replace(/^```json\s*|\s*```$/g, "");
    if (!content) return undefined;
    const parsed = JSON.parse(content) as { scenes?: Array<Partial<StoryScene> & { id: string }> };
    const updates = new Map((parsed.scenes ?? []).map((scene) => [scene.id, scene]));
    return scenes.map((scene) => {
      const update = updates.get(scene.id);
      return update ? { ...scene, title: update.title || scene.title, text: update.text || scene.text, narration: update.narration || scene.narration } : scene;
    });
  } catch {
    return undefined;
  }
}

export async function runResearch(request: ResearchRequest, reporter?: ProgressReporter): Promise<ResearchResult> {
  await reportProgress(reporter, {
    stage: "queries",
    percent: 5,
    message: "正在扩展检索词",
    detail: `围绕“${request.topic}”构建主题、综述和最新研究查询。`,
  });
  const config = await loadVenueConfig();
  const topicTokens = extractTokens(request.topic);
  const queries = [request.topic, `${request.topic} survey`, `${request.topic} review`];
  const recentStart = Math.max(request.startYear, request.endYear - 1);
  const searchRequests = [
    ...queries.map((query) => searchOpenAlex(query, request)),
    searchOpenAlex(request.topic, { ...request, startYear: recentStart }, "publication_date:desc"),
  ];
  const [openAlexSettled, arxivSettled] = await Promise.all([Promise.allSettled(searchRequests), Promise.allSettled([searchArxiv(request, topicTokens)])]);
  const responses = openAlexSettled.flatMap((result) => result.status === "fulfilled" ? [result.value] : []);
  const arxivPapers = arxivSettled.flatMap((result) => result.status === "fulfilled" ? result.value : []);
  if (!responses.length && !arxivPapers.length) throw new Error("暂时无法连接 OpenAlex 和 arXiv，请检查网络后重试。");

  const rawWorks = responses.flatMap((response) => response.results ?? []);
  const candidates = deduplicate([...rawWorks.map((work) => toPaper(work, config, topicTokens, request.topic, request.endYear)).filter((paper): paper is PaperRecord => Boolean(paper)), ...arxivPapers]);
  await reportProgress(reporter, {
    stage: "search",
    percent: 34,
    message: "论文检索完成",
    detail: `从 OpenAlex 与 arXiv 汇总并去重得到 ${candidates.length} 条有效候选。`,
  });
  const ranked = candidates.sort((a, b) => b.relevanceScore - a.relevanceScore);
  const publishedPriority = ranked.filter((paper) => paper.venueTier === "CCF-A" || paper.venueTier === "CAS-Q1" || paper.venueTier === "recognized");
  const recentPreprints = ranked.filter((paper) => paper.venueTier === "arXiv");
  const expansionPapers = ranked.filter((paper) => paper.venueTier === "other" && paper.citations >= 5);
  const qualityOrdered = [...publishedPriority, ...expansionPapers, ...recentPreprints];
  const qualityCutoff = Math.max(0, ...qualityOrdered.map((paper) => paper.relevanceScore)) * 0.82;
  const publishedIds = new Set([...publishedPriority, ...expansionPapers.slice(0, 5)].map((paper) => paper.id));
  let selected = qualityOrdered.filter((paper) => publishedIds.has(paper.id) || paper.relevanceScore >= qualityCutoff);
  if (selected.length < 15) selected = qualityOrdered.slice(0, Math.min(15, qualityOrdered.length));
  if (!selected.length) throw new Error("没有找到同时具备摘要和可核验标识的论文，请调整主题或时间范围。");
  await reportProgress(reporter, {
    stage: "verify",
    percent: 48,
    message: "正在核验论文信息",
    detail: `已按相关性、Venue 与引用信息筛出 ${selected.length} 篇高质量论文。`,
  });
  const selectedIds = new Set(selected.map((paper) => paper.id));
  const timelineAnchors = papersByYear(ranked.filter((paper) => paper.arxivId), 3);
  const figurePool = deduplicate([
    ...selected,
    ...timelineAnchors.filter((paper) => !selectedIds.has(paper.id)),
  ]).slice(0, 30);
  await addCrossrefVerification(figurePool);
  await reportProgress(reporter, {
    stage: "figures",
    percent: 58,
    message: "开始定位论文主图",
    detail: "逐篇读取公开论文页面，优先寻找模型结构、框架、流程与系统总览图。",
  });
  const papersWithFigures = await attachRepresentativeFigures(figurePool, reporter);
  selected = selectTimelinePapers(papersWithFigures);
  if (!selected.length) throw new Error("找到了相关论文，但暂时无法从公开论文页面提取真实代表图。请更换主题或稍后重试。");
  selected.sort((a, b) => a.year - b.year || b.relevanceScore - a.relevanceScore);

  await reportProgress(reporter, {
    stage: "mapping",
    percent: 90,
    message: "正在梳理研究时间轴",
    detail: `${selected.length} 篇入选论文均已匹配真实代表图，正在识别阶段与技术路线。`,
  });
  const phases = buildPhases(selected, request);
  const routes = topKeywords(selected.map((paper) => `${paper.title} ${paper.abstract}`), new Set(extractTokens(request.topic)), 6);
  const generatedAt = new Date().toISOString();
  const baseStoryboard = buildStoryboard(request.topic, request.language, phases, selected, routes);
  await reportProgress(reporter, {
    stage: "story",
    percent: 96,
    message: "正在生成研究动画",
    detail: `把 ${selected.length} 篇论文、代表图与旁白编排成可独立播放的 HTML。`,
  });
  const enhanced = await enhanceStoryboard(request, selected, baseStoryboard);
  const storyboard = enhanced ?? baseStoryboard;
  const result: ResearchResult = {
    topic: request.topic,
    language: request.language,
    generatedAt,
    timeRange: { startYear: request.startYear, endYear: request.endYear },
    sources: ["OpenAlex", "Crossref / DOI", "arXiv", "ar5iv paper HTML"],
    mode: enhanced ? "llm-enhanced" : "free",
    candidateCount: candidates.length,
    papers: selected,
    phases,
    routes,
    researchMarkdown: buildMarkdown(request, selected, phases, routes, generatedAt),
    storyboard,
  };
  await reportProgress(reporter, {
    stage: "complete",
    percent: 100,
    message: "研究动画已完成",
    detail: `已生成 ${selected.length} 篇带真实主图的论文时间轴。`,
  });
  return result;
}
