import { createReadStream } from "node:fs";
import { readFile, stat } from "node:fs/promises";
import { createServer } from "node:http";
import { randomBytes } from "node:crypto";
import { spawn } from "node:child_process";
import { dirname, extname, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { scanSkillRegistry } from "./lib/skill-registry.mjs";
import { getSkillStatsSnapshot, recordSiteEvent, recordSkillEvent } from "./lib/skill-stats.mjs";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const outputRoot = resolve(projectRoot, "out");
const publicRegistryPath = resolve(projectRoot, "data", "generated", "skills.json");
const siteHost = process.env.SITE_HOST || "127.0.0.1";
const sitePort = Number.parseInt(process.env.SITE_PORT || "3000", 10);
const downloadBaseUrl = (process.env.SKILLDOCK_DOWNLOAD_BASE_URL || "").replace(/\/$/, "");
const localAdminEnabled = ["127.0.0.1", "::1", "localhost"].includes(siteHost.toLowerCase());
const localAdminToken = randomBytes(24).toString("hex");
let publishPromise;
const recentPublicEvents = new Map();
const publicEventRates = new Map();

if (!Number.isInteger(sitePort) || sitePort < 1 || sitePort > 65535) {
  throw new Error("SITE_PORT must be an integer between 1 and 65535.");
}

const mimeTypes = new Map([
  [".css", "text/css; charset=utf-8"],
  [".html", "text/html; charset=utf-8"],
  [".ico", "image/x-icon"],
  [".jpeg", "image/jpeg"],
  [".jpg", "image/jpeg"],
  [".js", "text/javascript; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".map", "application/json; charset=utf-8"],
  [".md", "text/markdown; charset=utf-8"],
  [".mp4", "video/mp4"],
  [".png", "image/png"],
  [".sha256", "text/plain; charset=utf-8"],
  [".svg", "image/svg+xml"],
  [".txt", "text/plain; charset=utf-8"],
  [".webm", "video/webm"],
  [".webp", "image/webp"],
  [".xml", "application/xml; charset=utf-8"],
  [".zip", "application/zip"],
]);

const securityHeaders = {
  "Content-Security-Policy": "default-src 'self'; base-uri 'self'; connect-src 'self'; font-src 'self' data:; form-action 'self'; frame-ancestors 'none'; img-src 'self' data: https:; media-src 'self' https:; object-src 'none'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'",
  "Permissions-Policy": "camera=(), geolocation=(), microphone=()",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
};

function jsonResponse(response, statusCode, value) {
  const body = JSON.stringify(value);
  response.writeHead(statusCode, {
    ...securityHeaders,
    "Cache-Control": "no-store",
    "Content-Length": String(Buffer.byteLength(body)),
    "Content-Type": "application/json; charset=utf-8",
  });
  response.end(body);
}

function readJsonBody(request, maximumBytes = 4096) {
  return new Promise((resolvePromise, rejectPromise) => {
    let body = "";
    request.setEncoding("utf8");
    request.on("data", (chunk) => {
      body += chunk;
      if (Buffer.byteLength(body) > maximumBytes) {
        const error = new Error("请求内容过大");
        error.statusCode = 413;
        rejectPromise(error);
        request.destroy();
      }
    });
    request.on("end", () => {
      try {
        resolvePromise(JSON.parse(body || "{}"));
      } catch {
        const error = new Error("无效的 JSON 请求");
        error.statusCode = 400;
        rejectPromise(error);
      }
    });
    request.on("error", rejectPromise);
  });
}

function assertPublicEventRequest(request, eventId) {
  const host = request.headers.host;
  const origin = request.headers.origin;
  if (origin && origin !== `http://${host}` && origin !== `https://${host}`) {
    const error = new Error("拒绝跨站统计请求");
    error.statusCode = 403;
    throw error;
  }
  if (!String(request.headers["content-type"] || "").toLowerCase().startsWith("application/json")) {
    const error = new Error("统计接口只接受 JSON");
    error.statusCode = 415;
    throw error;
  }
  if (typeof eventId !== "string" || !/^[a-zA-Z0-9-]{16,80}$/.test(eventId)) {
    const error = new Error("无效的事件编号");
    error.statusCode = 400;
    throw error;
  }
  const now = Date.now();
  if (recentPublicEvents.has(eventId)) return false;
  recentPublicEvents.set(eventId, now);
  if (recentPublicEvents.size > 5000) {
    for (const [key, recordedAt] of recentPublicEvents) {
      if (now - recordedAt > 600_000 || recentPublicEvents.size > 4500) recentPublicEvents.delete(key);
      if (recentPublicEvents.size <= 4500) break;
    }
  }
  const forwarded = String(request.headers["x-forwarded-for"] || "").split(",")[0].trim();
  const clientKey = forwarded || request.socket.remoteAddress || "unknown";
  const current = publicEventRates.get(clientKey);
  const bucket = !current || now - current.startedAt >= 60_000 ? { startedAt: now, count: 0 } : current;
  bucket.count += 1;
  publicEventRates.set(clientKey, bucket);
  if (bucket.count > 300) {
    const error = new Error("统计请求过于频繁");
    error.statusCode = 429;
    throw error;
  }
  return true;
}

function normalizePublicPage(value, publicSkills) {
  if (typeof value !== "string") return undefined;
  const page = value === "/" ? "/" : `${value.replace(/\/+$/, "")}/`;
  const allowed = new Set(["/", "/privacy/", "/skills/", "/cases/"]);
  for (const skill of publicSkills) {
    allowed.add(`/skills/${skill.id}/`);
    allowed.add(`/case/${skill.id}/`);
  }
  return allowed.has(page) ? page : undefined;
}

async function readPublishedRegistry() {
  const registry = JSON.parse(await readFile(publicRegistryPath, "utf8"));
  if (!registry || !Array.isArray(registry.skills)) throw new Error("发布索引不可用，请先重新构建 SkillDock");
  return registry;
}

function toPublicSkill(skill) {
  const publicSkill = { ...skill };
  delete publicSkill.directory;
  delete publicSkill.installTarget;
  delete publicSkill.installStatus;
  delete publicSkill.sourceChecksum;
  delete publicSkill.sourceBytes;
  return publicSkill;
}

async function handlePublicApi(request, response, pathname) {
  const parts = pathname.split("/").filter(Boolean);
  try {
    if (request.method === "GET" && pathname === "/api/v1/health") {
      jsonResponse(response, 200, { ok: true });
      return;
    }
    const registry = await readPublishedRegistry();
    const publicSkills = registry.skills.map(toPublicSkill);
    if (request.method === "GET" && pathname === "/api/v1/skills") {
      jsonResponse(response, 200, {
        publishedAt: registry.generatedAt,
        summary: {
          total: publicSkills.length,
          passing: publicSkills.filter((skill) => skill.tests?.status === "passed").length,
          stable: publicSkills.filter((skill) => skill.status === "stable").length,
        },
        skills: publicSkills,
      });
      return;
    }
    if (request.method === "GET" && pathname === "/api/v1/stats") {
      jsonResponse(response, 200, await getSkillStatsSnapshot(publicSkills.map((skill) => skill.id)));
      return;
    }
    if (request.method === "POST" && pathname === "/api/v1/events") {
      const payload = await readJsonBody(request);
      if (!assertPublicEventRequest(request, payload.eventId)) {
        jsonResponse(response, 200, { accepted: false, duplicate: true });
        return;
      }
      const page = normalizePublicPage(payload.page, publicSkills);
      const skillId = typeof payload.skillId === "string" ? payload.skillId : null;
      if (!page || !new Set(["page-view", "skill-click"]).has(payload.type)) {
        const error = new Error("不支持的统计事件");
        error.statusCode = 400;
        throw error;
      }
      if (skillId && !publicSkills.some((skill) => skill.id === skillId)) {
        const error = new Error(`未找到 Skill: ${skillId}`);
        error.statusCode = 404;
        throw error;
      }
      jsonResponse(response, 202, await recordSiteEvent(payload.type, page, skillId));
      return;
    }
    if (["GET", "HEAD"].includes(request.method || "") && parts.length === 5 && parts[0] === "api" && parts[1] === "v1" && parts[2] === "skills" && parts[4] === "download") {
      const skill = publicSkills.find((item) => item.id === parts[3]);
      if (!skill?.package?.path) {
        jsonResponse(response, 404, { error: `未找到可下载的 Skill: ${parts[3]}` });
        return;
      }
      if (request.method === "GET") await recordSkillEvent(skill.id, "download");
      response.writeHead(302, {
        ...securityHeaders,
        "Cache-Control": "no-store",
        "Content-Length": "0",
        Location: `${downloadBaseUrl}${skill.package.path}`,
      });
      response.end();
      return;
    }
    jsonResponse(response, 404, { error: "Not Found" });
  } catch (error) {
    console.error(error);
    jsonResponse(response, error?.statusCode || 500, { error: error instanceof Error ? error.message : String(error) });
  }
}

function assertLocalMutation(request) {
  if (!localAdminEnabled) {
    const error = new Error("本地管理接口只允许绑定到回环地址");
    error.statusCode = 404;
    throw error;
  }
  const host = request.headers.host;
  const origin = request.headers.origin;
  if (origin && origin !== `http://${host}` && origin !== `https://${host}`) {
    const error = new Error("拒绝跨站管理请求");
    error.statusCode = 403;
    throw error;
  }
  if (request.headers["x-local-admin-token"] !== localAdminToken) {
    const error = new Error("本地管理会话已失效，请刷新页面");
    error.statusCode = 403;
    throw error;
  }
}

function runNode(args) {
  return new Promise((resolvePromise, rejectPromise) => {
    const child = spawn(process.execPath, args, {
      cwd: projectRoot,
      env: process.env,
      windowsHide: true,
    });
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (chunk) => { stdout = `${stdout}${chunk}`.slice(-12000); });
    child.stderr.on("data", (chunk) => { stderr = `${stderr}${chunk}`.slice(-12000); });
    child.on("error", rejectPromise);
    child.on("close", (code) => {
      if (code === 0) resolvePromise({ stdout, stderr });
      else rejectPromise(new Error((stderr || stdout || `进程退出码 ${code}`).trim()));
    });
  });
}

async function publishLocalSite() {
  if (publishPromise) {
    const error = new Error("本地发布正在进行，请稍候");
    error.statusCode = 409;
    throw error;
  }
  publishPromise = (async () => {
    const syncResult = await runNode([resolve(projectRoot, "scripts", "sync-skills.mjs")]);
    const buildResult = await runNode([resolve(projectRoot, "node_modules", "next", "dist", "bin", "next"), "build"]);
    return {
      sync: syncResult.stdout.trim(),
      build: buildResult.stdout.trim().split(/\r?\n/).slice(-20).join("\n"),
    };
  })();
  try {
    return await publishPromise;
  } finally {
    publishPromise = undefined;
  }
}

async function handleLocalApi(request, response, pathname) {
  if (!localAdminEnabled) {
    jsonResponse(response, 404, { error: "Not Found" });
    return;
  }

  const parts = pathname.split("/").filter(Boolean);
  try {
    if (request.method === "GET" && pathname === "/api/local/session") {
      jsonResponse(response, 200, { enabled: true, token: localAdminToken });
      return;
    }
    if (request.method === "GET" && pathname === "/api/local/skills") {
      jsonResponse(response, 200, { skills: await scanSkillRegistry() });
      return;
    }
    if (request.method === "GET" && pathname === "/api/local/stats") {
      const skills = await scanSkillRegistry();
      jsonResponse(response, 200, await getSkillStatsSnapshot(skills.map((skill) => skill.id)));
      return;
    }
    if (request.method === "POST" && parts.length === 5 && parts[0] === "api" && parts[1] === "local" && parts[2] === "skills" && parts[4] === "use") {
      assertLocalMutation(request);
      const skills = await scanSkillRegistry();
      if (!skills.some((skill) => skill.id === parts[3])) {
        const error = new Error(`未找到 Skill: ${parts[3]}`);
        error.statusCode = 404;
        throw error;
      }
      jsonResponse(response, 200, await recordSkillEvent(parts[3], "use"));
      return;
    }
    if (request.method === "POST" && pathname === "/api/local/publish") {
      assertLocalMutation(request);
      jsonResponse(response, 200, await publishLocalSite());
      return;
    }
    jsonResponse(response, 404, { error: "Not Found" });
  } catch (error) {
    console.error(error);
    jsonResponse(response, error?.statusCode || 400, { error: error instanceof Error ? error.message : String(error) });
  }
}

function isInsideOutput(candidate) {
  return candidate === outputRoot || candidate.startsWith(`${outputRoot}${sep}`);
}

async function findStaticFile(pathname) {
  const relativePath = pathname.replace(/^\/+/, "");
  const requestedPath = resolve(outputRoot, relativePath);
  if (!isInsideOutput(requestedPath)) return undefined;

  const candidates = extname(requestedPath)
    ? [requestedPath]
    : pathname.endsWith("/")
      ? [resolve(requestedPath, "index.html")]
      : [`${requestedPath}.html`, resolve(requestedPath, "index.html")];

  for (const candidate of candidates) {
    if (!isInsideOutput(candidate)) continue;
    try {
      const info = await stat(candidate);
      if (info.isFile()) return { path: candidate, size: info.size };
    } catch (error) {
      if (error?.code !== "ENOENT") throw error;
    }
  }
  return undefined;
}

function cacheControl(filePath) {
  if (filePath.includes(`${sep}_next${sep}static${sep}`) || /-v\d+\.\d+\.\d+\.zip$/i.test(filePath)) {
    return "public, max-age=31536000, immutable";
  }
  if (extname(filePath) === ".html") return "no-cache";
  return "public, max-age=3600";
}

const server = createServer(async (request, response) => {
  try {
    let pathname;
    try {
      pathname = decodeURIComponent(new URL(request.url || "/", "http://local.solution-center").pathname);
    } catch {
      response.writeHead(400, securityHeaders);
      response.end("Bad Request");
      return;
    }

    if (pathname.startsWith("/api/v1/")) {
      await handlePublicApi(request, response, pathname);
      return;
    }

    if (pathname.startsWith("/api/local/")) {
      await handleLocalApi(request, response, pathname);
      return;
    }

    if (!request.url || !["GET", "HEAD"].includes(request.method || "")) {
      response.writeHead(405, { ...securityHeaders, Allow: "GET, HEAD" });
      response.end("Method Not Allowed");
      return;
    }

    let file = await findStaticFile(pathname);
    let statusCode = 200;
    if (!file) {
      file = await findStaticFile("/404.html");
      statusCode = 404;
    }
    if (!file) {
      response.writeHead(404, securityHeaders);
      response.end("Not Found");
      return;
    }

    const extension = extname(file.path).toLowerCase();
    let contentStart = 0;
    let contentEnd = file.size - 1;
    let responseStatus = statusCode;
    const rangeHeader = statusCode === 200 ? request.headers.range : undefined;
    if (rangeHeader) {
      const match = /^bytes=(\d*)-(\d*)$/.exec(rangeHeader);
      if (!match || (!match[1] && !match[2])) {
        response.writeHead(416, { ...securityHeaders, "Content-Range": `bytes */${file.size}` });
        response.end();
        return;
      }
      if (!match[1]) {
        const suffixLength = Number.parseInt(match[2], 10);
        contentStart = Math.max(file.size - suffixLength, 0);
      } else {
        contentStart = Number.parseInt(match[1], 10);
      }
      if (match[2] && match[1]) contentEnd = Math.min(Number.parseInt(match[2], 10), file.size - 1);
      if (contentStart > contentEnd || contentStart >= file.size) {
        response.writeHead(416, { ...securityHeaders, "Content-Range": `bytes */${file.size}` });
        response.end();
        return;
      }
      responseStatus = 206;
    }

    const headers = {
      ...securityHeaders,
      "Accept-Ranges": "bytes",
      "Cache-Control": cacheControl(file.path),
      "Content-Length": String(contentEnd - contentStart + 1),
      "Content-Type": mimeTypes.get(extension) || "application/octet-stream",
    };
    if (responseStatus === 206) headers["Content-Range"] = `bytes ${contentStart}-${contentEnd}/${file.size}`;
    if ([".sha256", ".zip"].includes(extension)) headers["Content-Disposition"] = `attachment; filename="${file.path.split(sep).at(-1)}"`;

    response.writeHead(responseStatus, headers);
    if (request.method === "HEAD") {
      response.end();
      return;
    }
    createReadStream(file.path, { start: contentStart, end: contentEnd }).pipe(response);
  } catch (error) {
    console.error(error);
    response.writeHead(500, securityHeaders);
    response.end("Internal Server Error");
  }
});

server.on("error", (error) => {
  if (error.code === "EADDRINUSE") console.error(`Port ${sitePort} is already in use. Set SITE_PORT to another port.`);
  else console.error(error);
  process.exitCode = 1;
});

server.listen(sitePort, siteHost, () => {
  console.log(`SkillDock: http://${siteHost}:${sitePort}`);
  console.log(`Public Skill library: http://${siteHost}:${sitePort}/`);
  if (localAdminEnabled) console.log("Owner-only local APIs are enabled on the loopback interface.");
});
