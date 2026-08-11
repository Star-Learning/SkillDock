const apiBaseUrl = (process.env.NEXT_PUBLIC_SKILLDOCK_API_BASE_URL ?? "").replace(/\/$/, "");

export function publicApiUrl(pathname: string) {
  const normalized = pathname.startsWith("/") ? pathname : `/${pathname}`;
  return `${apiBaseUrl}${normalized}`;
}

export function skillDownloadUrl(skillId: string) {
  return publicApiUrl(`/api/v1/skills/${encodeURIComponent(skillId)}/download`);
}

