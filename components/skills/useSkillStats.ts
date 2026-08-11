"use client";

import { useCallback, useEffect, useState } from "react";
import { publicApiUrl } from "@/lib/skills/public-api";
import type { SkillStatsSnapshot } from "@/lib/skills/stats";

export function useSkillStats() {
  const [stats, setStats] = useState<SkillStatsSnapshot | null>(null);
  const [available, setAvailable] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const response = await fetch(publicApiUrl("/api/v1/stats"), { cache: "no-store" });
      if (!response.ok) throw new Error("统计服务不可用");
      setStats(await response.json() as SkillStatsSnapshot);
      setAvailable(true);
    } catch {
      setAvailable(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
    const timer = window.setInterval(() => {
      if (document.visibilityState === "visible") void refresh();
    }, 15_000);
    const refreshVisible = () => {
      if (document.visibilityState === "visible") void refresh();
    };
    window.addEventListener("focus", refreshVisible);
    document.addEventListener("visibilitychange", refreshVisible);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener("focus", refreshVisible);
      document.removeEventListener("visibilitychange", refreshVisible);
    };
  }, [refresh]);

  return { stats, available, refresh };
}
