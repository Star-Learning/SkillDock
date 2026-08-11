"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";

export function PromptBox({ purpose, content }: { purpose: string; content: string }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  return (
    <div className="overflow-hidden rounded-[22px] border border-ink/15 bg-[#17241f] text-white">
      <div className="flex items-center justify-between gap-4 border-b border-white/10 px-5 py-4">
        <div><p className="text-sm font-medium text-white">直接复制使用</p><p className="mt-1 text-xs text-white/48">{purpose}</p></div>
        <button onClick={copy} className="inline-flex shrink-0 items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-2 text-xs transition hover:bg-white/10">{copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}{copied ? "已复制" : "复制"}</button>
      </div>
      <pre className="max-h-[420px] overflow-auto whitespace-pre-wrap bg-black/10 p-5 text-[13px] leading-6 text-white/75">{content}</pre>
    </div>
  );
}
