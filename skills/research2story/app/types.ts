export type ResearchLanguage = "zh" | "en";

export type ResearchRequest = {
  topic: string;
  language: ResearchLanguage;
  startYear: number;
  endYear: number;
};

export type PaperRecord = {
  id: string;
  title: string;
  authors: string[];
  year: number;
  venue: string;
  venueTier: "CCF-A" | "CAS-Q1" | "recognized" | "arXiv" | "other";
  publicationType: "published" | "arxiv-preprint";
  doi?: string;
  arxivId?: string;
  officialUrl: string;
  abstract: string;
  citations: number;
  relevanceScore: number;
  verifiedSources: string[];
  representativeFigure?: {
    dataUrl: string;
    dataUrls?: string[];
    sourceUrl: string;
    caption: string;
  };
};

export type ResearchProgress = {
  stage: "queries" | "search" | "verify" | "figures" | "mapping" | "story" | "complete";
  percent: number;
  message: string;
  detail?: string;
};

export type ResearchPhase = {
  id: string;
  title: string;
  startYear: number;
  endYear: number;
  summary: string;
  keywords: string[];
  paperIds: string[];
};

export type StorySceneType = "title" | "timeline" | "research_phase" | "paper_card" | "current_frontier" | "summary";

export type StoryScene = {
  id: string;
  type: StorySceneType;
  eyebrow: string;
  title: string;
  text: string;
  narration: string;
  year?: number;
  paperId?: string;
  items?: string[];
};

export type ResearchResult = {
  topic: string;
  language: ResearchLanguage;
  generatedAt: string;
  timeRange: { startYear: number; endYear: number };
  sources: string[];
  mode: "free" | "llm-enhanced";
  candidateCount: number;
  papers: PaperRecord[];
  phases: ResearchPhase[];
  routes: string[];
  researchMarkdown: string;
  storyboard: StoryScene[];
};
