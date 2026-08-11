export type SkillActivityPoint = {
  date: string;
  uses: number;
  downloads: number;
  clicks: number;
};

export type SkillActivity = {
  uses: number;
  downloads: number;
  clicks: number;
  lastUsedAt: string | null;
  lastDownloadedAt: string | null;
  lastClickedAt: string | null;
  daily: SkillActivityPoint[];
};

export type SiteActivityPoint = {
  date: string;
  views: number;
  clicks: number;
};

export type SkillStatsSnapshot = {
  updatedAt: string | null;
  timeZone: string;
  site: {
    views: number;
    clicks: number;
    lastViewedAt: string | null;
    lastClickedAt: string | null;
    daily: SiteActivityPoint[];
    pages: Array<{ page: string; views: number; clicks: number }>;
  };
  totals: {
    uses: number;
    downloads: number;
  };
  daily: SkillActivityPoint[];
  skills: Record<string, SkillActivity>;
};
