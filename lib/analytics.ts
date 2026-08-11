export type AnalyticsEvent = "case_view" | "template_download" | "search";

export function track(event: AnalyticsEvent, properties: Record<string, string | number> = {}) {
  if (process.env.NODE_ENV === "development") {
    console.info("[analytics]", event, properties);
  }
}
