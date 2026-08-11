"use client";

import { Download, FileText, FlaskConical, LoaderCircle, Pause, Play, Search, Sparkles, Volume2 } from "lucide-react";
import Image from "next/image";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { buildStandaloneHtml } from "./standalone";
import type { PaperRecord, ResearchLanguage, ResearchProgress, ResearchResult, StoryScene } from "./types";

const initialProgress: ResearchProgress = {
  stage: "queries",
  percent: 2,
  message: "正在准备调研",
  detail: "连接免费学术数据源并建立检索任务。",
};

type StreamMessage =
  | { type: "progress"; data: ResearchProgress }
  | { type: "result"; data: ResearchResult }
  | { type: "error"; error: string };

export function Research2StoryApp() {
  const currentYear = new Date().getFullYear();
  const [topic, setTopic] = useState("");
  const [rangeMode, setRangeMode] = useState<"5y" | "custom">("5y");
  const [startYear, setStartYear] = useState(currentYear - 4);
  const [endYear, setEndYear] = useState(currentYear);
  const [language, setLanguage] = useState<ResearchLanguage>("zh");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState<ResearchProgress>(initialProgress);
  const [progressLog, setProgressLog] = useState<ResearchProgress[]>([]);
  const [error, setError] = useState("");
  const [result, setResult] = useState<ResearchResult>();
  const [sceneIndex, setSceneIndex] = useState(0);
  const [playing, setPlaying] = useState(false);

  const currentScene = result?.storyboard[sceneIndex];
  const currentPaper = useMemo(
    () => currentScene?.paperId ? result?.papers.find((paper) => paper.id === currentScene.paperId) : undefined,
    [currentScene, result],
  );

  useEffect(() => {
    if (!playing || !result || !currentScene) return;
    let fallbackTimer: ReturnType<typeof setTimeout> | undefined;
    const advance = () => {
      if (sceneIndex < result.storyboard.length - 1) setSceneIndex((current) => current + 1);
      else setPlaying(false);
    };
    if (!("speechSynthesis" in window)) {
      fallbackTimer = setTimeout(advance, 6500);
      return () => clearTimeout(fallbackTimer);
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(currentScene.narration);
    utterance.lang = result.language === "zh" ? "zh-CN" : "en-US";
    utterance.rate = 0.94;
    utterance.onend = advance;
    utterance.onerror = () => { fallbackTimer = setTimeout(advance, 2600); };
    window.speechSynthesis.speak(utterance);
    return () => {
      if (fallbackTimer) clearTimeout(fallbackTimer);
      window.speechSynthesis.cancel();
    };
  }, [currentScene, playing, result, sceneIndex]);

  function recordProgress(next: ResearchProgress) {
    setProgress(next);
    setProgressLog((current) => {
      const updated = current.at(-1)?.stage === next.stage ? [...current.slice(0, -1), next] : [...current, next];
      return updated.slice(-6);
    });
  }

  async function readStream(response: Response) {
    if (!response.body) throw new Error("浏览器没有收到调研进度，请重试。");
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let completedResult: ResearchResult | undefined;
    const handleLine = (line: string) => {
      if (!line.trim()) return;
      const message = JSON.parse(line) as StreamMessage;
      if (message.type === "progress") recordProgress(message.data);
      if (message.type === "result") completedResult = message.data;
      if (message.type === "error") throw new Error(message.error);
    };
    while (true) {
      const { done, value } = await reader.read();
      buffer += decoder.decode(value, { stream: !done });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";
      lines.forEach(handleLine);
      if (done) break;
    }
    handleLine(buffer);
    if (!completedResult) throw new Error("调研任务没有返回完整结果，请稍后重试。");
    return completedResult;
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const cleanedTopic = topic.trim();
    if (cleanedTopic.length < 2) return setError("请输入一个具体的研究主题。");
    const actualStart = rangeMode === "5y" ? currentYear - 4 : startYear;
    const actualEnd = rangeMode === "5y" ? currentYear : endYear;
    if (actualStart > actualEnd) return setError("开始年份不能晚于结束年份。");

    setLoading(true);
    setError("");
    setResult(undefined);
    setProgress(initialProgress);
    setProgressLog([initialProgress]);
    setSceneIndex(0);
    setPlaying(false);
    try {
      const response = await fetch("/api/research2story/run", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/x-ndjson" },
        body: JSON.stringify({ topic: cleanedTopic, language, startYear: actualStart, endYear: actualEnd }),
      });
      const contentType = response.headers.get("content-type") || "";
      if (!response.ok || !contentType.includes("application/x-ndjson")) {
        const payload = await response.json() as { error?: string };
        throw new Error(payload.error || "调研任务没有完成，请稍后重试。");
      }
      const completed = await readStream(response);
      setResult(completed);
      setSceneIndex(0);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "调研任务没有完成，请稍后重试。");
    } finally {
      setLoading(false);
    }
  }

  function togglePlayback() {
    if (!result) return;
    if (playing) return setPlaying(false);
    if (sceneIndex === result.storyboard.length - 1) setSceneIndex(0);
    setPlaying(true);
  }

  function download(content: string, fileName: string, type: string) {
    const url = URL.createObjectURL(new Blob([content], { type }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = fileName;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <main className="min-h-screen bg-[#f6f4ed]">
      <section className="border-b border-line/75">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-14 sm:px-8 sm:py-20 lg:grid-cols-[.9fr_1.1fr] lg:items-center">
          <div>
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-moss/60"><FlaskConical className="h-3.5 w-3.5" /> Research2Story</p>
            <h1 className="mt-4 text-balance text-4xl font-semibold leading-[1.1] tracking-[-0.05em] text-ink sm:text-5xl">把论文、主图与旁白，编成一条研究时间线</h1>
            <p className="mt-5 max-w-xl text-base leading-8 text-ink/55">检索并核验论文后，逐篇提取真实代表图，生成随时间轴自动播放的 HTML 研究动画。</p>
            <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-xs text-ink/40"><span>OpenAlex + arXiv 免费检索</span><span>真实论文主图</span><span>浏览器本地旁白</span></div>
          </div>

          <form onSubmit={submit} className="rounded-[28px] border border-line bg-white p-5 shadow-soft sm:p-7">
            <label className="block text-sm font-semibold text-ink">研究主题</label>
            <div className="mt-2 flex h-12 items-center gap-2 rounded-2xl border border-line bg-paper/55 px-4 focus-within:border-moss/35 focus-within:bg-white"><Search className="h-4 w-4 text-ink/30" /><input value={topic} onChange={(event) => setTopic(event.target.value)} placeholder="例如：AI Agent Memory" className="min-w-0 flex-1 bg-transparent text-sm text-ink outline-none placeholder:text-ink/28" /></div>

            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <div><p className="text-sm font-semibold text-ink">时间范围</p><div className="mt-2 flex gap-1 rounded-xl bg-paper p-1 text-xs"><button type="button" onClick={() => setRangeMode("5y")} className={`h-8 flex-1 rounded-lg transition ${rangeMode === "5y" ? "bg-white font-medium text-ink shadow-sm" : "text-ink/42"}`}>近 5 年</button><button type="button" onClick={() => setRangeMode("custom")} className={`h-8 flex-1 rounded-lg transition ${rangeMode === "custom" ? "bg-white font-medium text-ink shadow-sm" : "text-ink/42"}`}>自定义</button></div></div>
              <div><p className="text-sm font-semibold text-ink">输出语言</p><div className="mt-2 flex gap-1 rounded-xl bg-paper p-1 text-xs"><button type="button" onClick={() => setLanguage("zh")} className={`h-8 flex-1 rounded-lg transition ${language === "zh" ? "bg-white font-medium text-ink shadow-sm" : "text-ink/42"}`}>中文</button><button type="button" onClick={() => setLanguage("en")} className={`h-8 flex-1 rounded-lg transition ${language === "en" ? "bg-white font-medium text-ink shadow-sm" : "text-ink/42"}`}>English</button></div></div>
            </div>

            {rangeMode === "custom" && <div className="mt-4 grid grid-cols-2 gap-3"><label className="text-xs text-ink/42">开始年份<input type="number" min="1950" max={currentYear + 1} value={startYear} onChange={(event) => setStartYear(Number(event.target.value))} className="mt-1.5 h-10 w-full rounded-xl border border-line bg-white px-3 text-sm text-ink outline-none" /></label><label className="text-xs text-ink/42">结束年份<input type="number" min="1950" max={currentYear + 1} value={endYear} onChange={(event) => setEndYear(Number(event.target.value))} className="mt-1.5 h-10 w-full rounded-xl border border-line bg-white px-3 text-sm text-ink outline-none" /></label></div>}
            {error && <p className="mt-4 rounded-xl bg-[#f8e8df] px-3 py-2.5 text-sm text-[#915238]">{error}</p>}
            <button disabled={loading} className="mt-5 inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-ink text-sm font-semibold text-white transition hover:bg-moss disabled:cursor-wait disabled:opacity-70">{loading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}{loading ? `${progress.percent}% · ${progress.message}` : "开始研究"}</button>
          </form>
        </div>
      </section>

      {loading && <ProgressPanel progress={progress} log={progressLog} />}

      {result && !loading && currentScene && <section className="mx-auto max-w-7xl px-5 py-14 sm:px-8 sm:py-20">
        <div className="flex flex-col justify-between gap-5 border-b border-line pb-7 sm:flex-row sm:items-end">
          <div><p className="text-xs font-medium text-moss">调研完成 · {result.papers.length} 篇论文均含真实主图</p><h2 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-ink">{result.topic}</h2></div>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs">
            <button onClick={() => download(result.researchMarkdown, "research.md", "text/markdown;charset=utf-8")} className="inline-flex items-center gap-1.5 text-ink/45 transition hover:text-moss"><FileText className="h-3.5 w-3.5" />下载研究报告</button>
            <button onClick={() => download(buildStandaloneHtml(result), "index.html", "text/html;charset=utf-8")} className="inline-flex items-center gap-1.5 font-semibold text-moss transition hover:text-ink"><Download className="h-3.5 w-3.5" />导出动画 HTML</button>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-xs text-ink/40"><span>{result.candidateCount} 条候选记录</span><span>{result.papers.length} 篇带图论文</span><span>{result.phases.length} 个研究阶段</span><span>全程免费数据源与本地语音</span></div>
        <StoryPlayer scene={currentScene} paper={currentPaper} index={sceneIndex} scenes={result.storyboard} playing={playing} onPlay={togglePlayback} />
      </section>}
    </main>
  );
}

function ProgressPanel({ progress, log }: { progress: ResearchProgress; log: ResearchProgress[] }) {
  return <section className="mx-auto max-w-4xl px-5 py-14 sm:px-8"><div className="overflow-hidden rounded-[28px] border border-line bg-white p-6 shadow-card sm:p-8"><div className="flex items-end justify-between gap-5"><div><p className="text-xs font-semibold uppercase tracking-[0.14em] text-moss/60">Live research progress</p><h2 className="mt-2 text-xl font-semibold tracking-[-0.03em] text-ink">{progress.message}</h2></div><p className="text-4xl font-semibold tracking-[-0.06em] text-ink">{progress.percent}<span className="ml-1 text-base text-ink/35">%</span></p></div><p className="mt-2 text-sm leading-6 text-ink/48">{progress.detail}</p><div className="relative mt-6 h-3 overflow-hidden rounded-full bg-[#e7e5de]"><div className="h-full rounded-full bg-moss transition-[width] duration-700 ease-out" style={{ width: `${progress.percent}%` }} /><div className="research-progress-sheen absolute inset-y-0 w-24 bg-gradient-to-r from-transparent via-white/55 to-transparent" /></div><div className="mt-6 grid gap-2 sm:grid-cols-2">{log.slice(-4).map((item) => <div key={item.stage} className={`flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-xs ${item.stage === progress.stage ? "bg-mint text-moss" : "bg-paper/70 text-ink/42"}`}><span className={`h-2 w-2 rounded-full ${item.stage === progress.stage ? "animate-pulse bg-moss" : "bg-moss/30"}`} />{item.message}</div>)}</div></div></section>;
}

function StoryPlayer({ scene, paper, index, scenes, playing, onPlay }: { scene: StoryScene; paper?: PaperRecord; index: number; scenes: StoryScene[]; playing: boolean; onPlay: () => void }) {
  const figure = paper?.representativeFigure;
  const figureImages = figure ? (figure.dataUrls?.length ? figure.dataUrls : [figure.dataUrl]) : [];
  const progress = scenes.length === 1 ? 100 : (index / (scenes.length - 1)) * 100;
  return <div className="mt-8"><div className="flex items-center justify-between text-xs text-ink/38"><span>Research timeline</span><span>{index + 1} / {scenes.length}</span></div><div key={scene.id} className={`research-scene-enter relative mt-3 grid min-h-[570px] overflow-hidden rounded-[32px] border border-line bg-white p-7 shadow-soft sm:p-11 ${figure ? "gap-8 lg:grid-cols-[.86fr_1.14fr] lg:items-center" : "place-items-center"}`}><div className="pointer-events-none absolute -right-28 -top-28 h-72 w-72 rounded-full bg-mint blur-3xl" />{figure && <figure className="relative order-first lg:order-last"><div className={`relative grid h-[320px] auto-rows-fr items-stretch gap-2 overflow-hidden rounded-[24px] border border-line/80 bg-[#f8f8f4] p-4 sm:h-[440px] ${figureImages.length > 1 ? "grid-cols-2" : "grid-cols-1"}`}>{figureImages.map((dataUrl, imageIndex) => <div key={`${figure.sourceUrl}-${imageIndex}`} className="relative min-h-0 overflow-hidden rounded-lg bg-white"><Image src={dataUrl} alt={`${figure.caption}${figureImages.length > 1 ? ` · ${imageIndex + 1}` : ""}`} width={1200} height={800} sizes="(max-width: 1024px) 50vw, 28vw" className="h-full w-full object-contain" unoptimized priority={imageIndex === 0} /></div>)}</div><figcaption className="mt-3 text-xs leading-5 text-ink/38">{figure.caption}</figcaption></figure>}<div className={`relative ${figure ? "" : "mx-auto max-w-3xl text-center"}`}><p className="text-xs font-semibold uppercase tracking-[0.15em] text-moss/60">{scene.eyebrow}</p>{scene.year && <p className="mt-4 text-6xl font-semibold tracking-[-0.07em] text-[#d8e3d8] sm:text-7xl">{scene.year}</p>}<h3 className={`mt-4 text-balance font-semibold leading-tight tracking-[-0.045em] text-ink ${figure ? "text-3xl sm:text-4xl" : "text-3xl sm:text-5xl"}`}>{scene.title}</h3><p className="mt-5 text-sm leading-7 text-ink/55 sm:text-base sm:leading-8">{scene.text}</p>{scene.items?.length ? <div className={`mt-6 flex flex-wrap gap-2 ${figure ? "" : "justify-center"}`}>{scene.items.map((item) => <span key={item} className="rounded-full bg-mint px-3 py-1.5 text-xs text-moss">{item}</span>)}</div> : null}<p className={`mt-7 flex items-start gap-2 border-l-2 border-moss/45 pl-4 text-left text-sm leading-7 text-ink/45 ${figure ? "" : "mx-auto max-w-2xl"}`}><Volume2 className="mt-1 h-4 w-4 shrink-0 text-moss" />{scene.narration}</p></div></div><div className="relative mx-3 mt-6 h-6"><div className="absolute inset-x-0 top-[9px] h-[3px] rounded-full bg-[#deddd6]" /><div className="absolute left-0 top-[9px] h-[3px] rounded-full bg-moss transition-[width] duration-700 ease-out" style={{ width: `${progress}%` }} /><div className="absolute inset-0 flex justify-between">{scenes.map((item, markerIndex) => <span key={item.id} title={item.year ? `${item.year} · ${item.title}` : item.title} className={`mt-[6px] h-[9px] w-[9px] rounded-full border-2 border-[#f6f4ed] transition duration-500 ${markerIndex < index ? "bg-moss" : markerIndex === index ? "scale-[1.65] bg-moss ring-4 ring-moss/10" : "bg-[#bfc1bb]"}`} />)}</div></div><div className="mt-2 flex justify-center"><button onClick={onPlay} className="inline-flex h-11 min-w-28 items-center justify-center gap-2 rounded-full bg-ink px-5 text-sm font-semibold text-white shadow-md transition hover:-translate-y-0.5 hover:bg-moss">{playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}{playing ? "暂停" : index === scenes.length - 1 ? "重新播放" : "播放"}</button></div></div>;
}
