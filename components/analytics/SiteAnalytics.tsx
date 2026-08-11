"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { publicApiUrl } from "@/lib/skills/public-api";

export function SiteAnalytics() {
  const pathname = usePathname();

  useEffect(() => {
    sendEvent({ type: "page-view", page: pathname });
  }, [pathname]);

  useEffect(() => {
    const trackClick = (event: MouseEvent) => {
      const target = event.target instanceof Element ? event.target.closest<HTMLElement>("[data-track-skill]") : null;
      const skillId = target?.dataset.trackSkill;
      if (skillId) sendEvent({ type: "skill-click", page: window.location.pathname, skillId });
    };
    document.addEventListener("click", trackClick);
    return () => document.removeEventListener("click", trackClick);
  }, []);

  return null;
}

function sendEvent(payload: { type: "page-view" | "skill-click"; page: string; skillId?: string }) {
  const eventId = typeof crypto.randomUUID === "function" ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  void fetch(publicApiUrl("/api/v1/events"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...payload, eventId }),
    credentials: "same-origin",
    keepalive: true,
  }).catch(() => {});
}

