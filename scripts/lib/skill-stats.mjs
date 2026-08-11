import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { projectRoot } from "./skill-registry.mjs";

const defaultStatsPath = process.env.SKILLDOCK_STATS_PATH
  ? resolve(projectRoot, process.env.SKILLDOCK_STATS_PATH)
  : resolve(projectRoot, "data", "local", "skill-stats.json");
const statsTimeZone = process.env.SKILLDOCK_STATS_TIMEZONE || "Asia/Shanghai";
const dayFormatter = new Intl.DateTimeFormat("en", {
  timeZone: statsTimeZone,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});
let writeQueue = Promise.resolve();

function emptyStats() {
  return {
    version: 3,
    updatedAt: null,
    site: { views: 0, clicks: 0, lastViewedAt: null, lastClickedAt: null, pages: {} },
    skills: {},
    days: {},
  };
}

function normalizeCounter(value) {
  return Number.isSafeInteger(value) && value >= 0 ? value : 0;
}

function normalizeStats(value) {
  const normalized = emptyStats();
  if (!value || typeof value !== "object" || Array.isArray(value)) return normalized;
  normalized.updatedAt = typeof value.updatedAt === "string" ? value.updatedAt : null;
  if (isRecord(value.site)) {
    normalized.site = {
      views: normalizeCounter(value.site.views),
      clicks: normalizeCounter(value.site.clicks),
      lastViewedAt: typeof value.site.lastViewedAt === "string" ? value.site.lastViewedAt : null,
      lastClickedAt: typeof value.site.lastClickedAt === "string" ? value.site.lastClickedAt : null,
      pages: {},
    };
    if (isRecord(value.site.pages)) {
      for (const [page, item] of Object.entries(value.site.pages)) {
        if (!isPagePath(page) || !isRecord(item)) continue;
        normalized.site.pages[page] = { views: normalizeCounter(item.views), clicks: normalizeCounter(item.clicks) };
      }
    }
  }
  if (value.skills && typeof value.skills === "object" && !Array.isArray(value.skills)) {
    for (const [skillId, item] of Object.entries(value.skills)) {
      if (!isSkillId(skillId) || !isRecord(item)) continue;
      normalized.skills[skillId] = {
        uses: normalizeCounter(item.uses),
        downloads: normalizeCounter(item.downloads),
        clicks: normalizeCounter(item.clicks),
        lastUsedAt: typeof item.lastUsedAt === "string" ? item.lastUsedAt : null,
        lastDownloadedAt: typeof item.lastDownloadedAt === "string" ? item.lastDownloadedAt : null,
        lastClickedAt: typeof item.lastClickedAt === "string" ? item.lastClickedAt : null,
      };
    }
  }
  if (value.days && typeof value.days === "object" && !Array.isArray(value.days)) {
    for (const [date, day] of Object.entries(value.days)) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !isRecord(day)) continue;
      const skills = {};
      if (isRecord(day.skills)) {
        for (const [skillId, item] of Object.entries(day.skills)) {
          if (!isSkillId(skillId) || !isRecord(item)) continue;
          skills[skillId] = { uses: normalizeCounter(item.uses), downloads: normalizeCounter(item.downloads), clicks: normalizeCounter(item.clicks) };
        }
      }
      const pages = {};
      if (isRecord(day.pages)) {
        for (const [page, item] of Object.entries(day.pages)) {
          if (!isPagePath(page) || !isRecord(item)) continue;
          pages[page] = { views: normalizeCounter(item.views), clicks: normalizeCounter(item.clicks) };
        }
      }
      normalized.days[date] = {
        site: { views: normalizeCounter(day.site?.views), clicks: normalizeCounter(day.site?.clicks) },
        skills,
        pages,
      };
    }
  }
  return normalized;
}

function isRecord(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function isSkillId(value) {
  return /^[a-z0-9-]+$/.test(value);
}

function isPagePath(value) {
  return typeof value === "string" && value.length > 0 && value.length <= 180 && /^\/[a-zA-Z0-9/_-]*$/.test(value);
}

function dateKey(value = new Date()) {
  const parts = Object.fromEntries(dayFormatter.formatToParts(value).filter((part) => part.type !== "literal").map((part) => [part.type, part.value]));
  return `${parts.year}-${parts.month}-${parts.day}`;
}

function recentDateKeys(count) {
  const keys = [];
  for (let offset = count - 1; offset >= 0; offset -= 1) keys.push(dateKey(new Date(Date.now() - offset * 86_400_000)));
  return keys;
}

export async function readSkillStats(statsPath = defaultStatsPath) {
  try {
    return normalizeStats(JSON.parse(await readFile(statsPath, "utf8")));
  } catch (error) {
    if (error?.code === "ENOENT" || error instanceof SyntaxError) return emptyStats();
    throw error;
  }
}

async function writeStats(value, statsPath) {
  await mkdir(dirname(statsPath), { recursive: true });
  const temporary = `${statsPath}.${process.pid}.tmp`;
  await writeFile(temporary, `${JSON.stringify(value, null, 2)}\n`, "utf8");
  await rename(temporary, statsPath);
}

export async function recordSkillEvent(skillId, event, statsPath = defaultStatsPath) {
  if (!isSkillId(skillId)) throw new Error(`非法 Skill id: ${skillId}`);
  if (!new Set(["use", "download"]).has(event)) throw new Error(`不支持的统计事件: ${event}`);
  const operation = writeQueue.then(async () => {
    const stats = await readSkillStats(statsPath);
    const now = new Date().toISOString();
    const current = stats.skills[skillId] ?? { uses: 0, downloads: 0, clicks: 0, lastUsedAt: null, lastDownloadedAt: null, lastClickedAt: null };
    if (event === "use") {
      current.uses += 1;
      current.lastUsedAt = now;
    } else {
      current.downloads += 1;
      current.lastDownloadedAt = now;
    }
    stats.skills[skillId] = current;
    const today = dateKey(new Date(now));
    const day = stats.days[today] ?? { site: { views: 0, clicks: 0 }, skills: {}, pages: {} };
    const daySkill = day.skills[skillId] ?? { uses: 0, downloads: 0, clicks: 0 };
    if (event === "use") daySkill.uses += 1;
    else daySkill.downloads += 1;
    day.skills[skillId] = daySkill;
    stats.days[today] = day;
    stats.updatedAt = now;
    await writeStats(stats, statsPath);
    return current;
  });
  writeQueue = operation.catch(() => {});
  return operation;
}

export async function recordSiteEvent(event, page, skillId, statsPath = defaultStatsPath) {
  if (!new Set(["page-view", "skill-click"]).has(event)) throw new Error(`不支持的站点统计事件: ${event}`);
  if (!isPagePath(page)) throw new Error(`非法页面路径: ${page}`);
  if (skillId !== null && skillId !== undefined && !isSkillId(skillId)) throw new Error(`非法 Skill id: ${skillId}`);
  if (event === "skill-click" && !skillId) throw new Error("Skill 点击事件缺少 Skill id");
  const operation = writeQueue.then(async () => {
    const stats = await readSkillStats(statsPath);
    const now = new Date().toISOString();
    const today = dateKey(new Date(now));
    const day = stats.days[today] ?? { site: { views: 0, clicks: 0 }, skills: {}, pages: {} };
    const pageTotal = stats.site.pages[page] ?? { views: 0, clicks: 0 };
    const pageDaily = day.pages[page] ?? { views: 0, clicks: 0 };
    if (event === "page-view") {
      stats.site.views += 1;
      stats.site.lastViewedAt = now;
      day.site.views += 1;
      pageTotal.views += 1;
      pageDaily.views += 1;
    } else {
      stats.site.clicks += 1;
      stats.site.lastClickedAt = now;
      day.site.clicks += 1;
      pageTotal.clicks += 1;
      pageDaily.clicks += 1;
      const current = stats.skills[skillId] ?? { uses: 0, downloads: 0, clicks: 0, lastUsedAt: null, lastDownloadedAt: null, lastClickedAt: null };
      current.clicks += 1;
      current.lastClickedAt = now;
      stats.skills[skillId] = current;
      const daySkill = day.skills[skillId] ?? { uses: 0, downloads: 0, clicks: 0 };
      daySkill.clicks += 1;
      day.skills[skillId] = daySkill;
    }
    stats.site.pages[page] = pageTotal;
    day.pages[page] = pageDaily;
    stats.days[today] = day;
    stats.updatedAt = now;
    await writeStats(stats, statsPath);
    return { accepted: true, updatedAt: now };
  });
  writeQueue = operation.catch(() => {});
  return operation;
}

export async function getSkillStatsSnapshot(skillIds, statsPath = defaultStatsPath) {
  const stats = await readSkillStats(statsPath);
  const skills = {};
  const dateKeys = recentDateKeys(30);
  let uses = 0;
  let downloads = 0;
  for (const skillId of skillIds) {
    const item = stats.skills[skillId] ?? { uses: 0, downloads: 0, clicks: 0, lastUsedAt: null, lastDownloadedAt: null, lastClickedAt: null };
    skills[skillId] = {
      ...item,
      daily: dateKeys.map((date) => ({
        date,
        uses: stats.days[date]?.skills[skillId]?.uses ?? 0,
        downloads: stats.days[date]?.skills[skillId]?.downloads ?? 0,
        clicks: stats.days[date]?.skills[skillId]?.clicks ?? 0,
      })),
    };
    uses += item.uses;
    downloads += item.downloads;
  }
  const daily = dateKeys.map((date) => {
    let dailyUses = 0;
    let dailyDownloads = 0;
    for (const skillId of skillIds) {
      dailyUses += stats.days[date]?.skills[skillId]?.uses ?? 0;
      dailyDownloads += stats.days[date]?.skills[skillId]?.downloads ?? 0;
    }
    return { date, uses: dailyUses, downloads: dailyDownloads, clicks: skillIds.reduce((total, skillId) => total + (stats.days[date]?.skills[skillId]?.clicks ?? 0), 0) };
  });
  const siteDaily = dateKeys.map((date) => ({
    date,
    views: stats.days[date]?.site?.views ?? 0,
    clicks: stats.days[date]?.site?.clicks ?? 0,
  }));
  const pages = Object.entries(stats.site.pages)
    .map(([page, value]) => ({ page, views: value.views, clicks: value.clicks }))
    .sort((left, right) => right.views - left.views || right.clicks - left.clicks)
    .slice(0, 20);
  return {
    updatedAt: stats.updatedAt,
    timeZone: statsTimeZone,
    site: { ...stats.site, daily: siteDaily, pages },
    totals: { uses, downloads },
    daily,
    skills,
  };
}

export { defaultStatsPath, statsTimeZone };
