import { NextResponse } from "next/server";
import { runResearch } from "../../../research";
import type { ResearchLanguage } from "../../../types";

export const runtime = "nodejs";
export const maxDuration = 300;

export async function POST(request: Request) {
  try {
    const payload = await request.json() as Record<string, unknown>;
    const topic = typeof payload.topic === "string" ? payload.topic.trim() : "";
    const language: ResearchLanguage = payload.language === "en" ? "en" : "zh";
    const startYear = Number(payload.startYear);
    const endYear = Number(payload.endYear);
    const maxYear = new Date().getFullYear() + 1;

    if (topic.length < 2 || topic.length > 160) return NextResponse.json({ error: "研究主题需要 2—160 个字符。" }, { status: 400 });
    if (!Number.isInteger(startYear) || !Number.isInteger(endYear) || startYear < 1950 || endYear > maxYear || startYear > endYear) return NextResponse.json({ error: "时间范围无效。" }, { status: 400 });

    const researchRequest = { topic, language, startYear, endYear };
    if (!request.headers.get("accept")?.includes("application/x-ndjson")) return NextResponse.json(await runResearch(researchRequest));

    const encoder = new TextEncoder();
    const stream = new ReadableStream<Uint8Array>({
      start(controller) {
        const send = (value: unknown) => controller.enqueue(encoder.encode(`${JSON.stringify(value)}\n`));
        void runResearch(researchRequest, (progress) => send({ type: "progress", data: progress }))
          .then((result) => send({ type: "result", data: result }))
          .catch((error: unknown) => send({ type: "error", error: error instanceof Error ? error.message : "调研任务执行失败。" }))
          .finally(() => controller.close());
      },
    });
    return new Response(stream, { headers: { "Content-Type": "application/x-ndjson; charset=utf-8", "Cache-Control": "no-cache, no-transform" } });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "调研任务执行失败。" }, { status: 502 });
  }
}
