"use client";

import { useEffect } from "react";
import { track } from "@/lib/analytics";

export function CaseViewTracker({ caseId }: { caseId: string }) {
  useEffect(() => {
    track("case_view", { caseId });
    try {
      const key = "solution-center:recent";
      const stored = JSON.parse(window.localStorage.getItem(key) ?? "[]");
      const current = Array.isArray(stored) ? stored.filter((item): item is string => typeof item === "string") : [];
      window.localStorage.setItem(key, JSON.stringify([caseId, ...current.filter((item) => item !== caseId)].slice(0, 20)));
    } catch {
      // 浏览记录不可用时不影响方案正文。
    }
  }, [caseId]);
  return null;
}
