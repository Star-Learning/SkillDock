import type { SiteActivityPoint, SkillActivityPoint } from "@/lib/skills/stats";

export type TrendMetric = {
  key: "uses" | "downloads" | "clicks" | "views";
  label: string;
  color: string;
};

const defaultMetrics: TrendMetric[] = [
  { key: "uses", label: "使用", color: "#5a57d9" },
  { key: "downloads", label: "下载", color: "#58b77a" },
];

export function ActivityTrend({ data, title = "近 14 天每日趋势", updatedAt, metrics = defaultMetrics }: { data?: Array<SkillActivityPoint | SiteActivityPoint>; title?: string; updatedAt?: string | null; metrics?: TrendMetric[] }) {
  const points = (data ?? []).slice(-14);
  const maximum = Math.max(1, ...points.flatMap((point) => metrics.map((metric) => metricValue(point, metric.key))));
  const totals = Object.fromEntries(metrics.map((metric) => [metric.key, points.reduce((total, point) => total + metricValue(point, metric.key), 0)]));
  const chartWidth = 720;
  const chartHeight = 168;
  const insetX = 12;
  const insetY = 12;
  const coordinates = (metric: TrendMetric) => points.map((point, index) => ({
    x: points.length <= 1 ? chartWidth / 2 : insetX + (index / (points.length - 1)) * (chartWidth - insetX * 2),
    y: chartHeight - insetY - (metricValue(point, metric.key) / maximum) * (chartHeight - insetY * 2),
    value: metricValue(point, metric.key),
    date: point.date,
  }));

  return <div className="rounded-[24px] border border-line bg-white p-5 sm:p-6">
    <div className="flex flex-wrap items-start justify-between gap-3"><div><h3 className="text-sm font-semibold text-ink">{title}</h3><p className="mt-1 text-xs text-ink/35">每天按北京时间归档，新数据约每 15 秒出现</p></div><div className="flex flex-wrap items-center gap-4 text-[11px] text-ink/42">{metrics.map((metric) => <Legend key={metric.key} color={metric.color} label={`${metric.label} ${totals[metric.key] ?? 0}`} />)}</div></div>
    <div className="mt-5 overflow-hidden rounded-2xl bg-paper/35 px-2 pt-3">
      {points.length > 0 ? <svg className="h-44 w-full overflow-visible" viewBox={`0 0 ${chartWidth} ${chartHeight}`} role="img" aria-label={`${title}：${metrics.map((metric) => `${metric.label} ${totals[metric.key] ?? 0}`).join("，")}`}>
        {[0.25, 0.5, 0.75].map((ratio) => <line key={ratio} x1="0" x2={chartWidth} y1={chartHeight * ratio} y2={chartHeight * ratio} stroke="#deddd6" strokeWidth="1" strokeDasharray="4 8" />)}
        {metrics.map((metric) => {
          const metricPoints = coordinates(metric);
          const valuesKey = metricPoints.map((point) => point.value).join("-");
          return <g key={`${metric.key}-${valuesKey}`}>
            <path d={smoothPath(metricPoints)} fill="none" stroke={metric.color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" pathLength="1" className="skilldock-chart-line" />
            {metricPoints.map((point) => <circle key={`${metric.key}-${point.date}`} cx={point.x} cy={point.y} r={point.value > 0 ? 3.5 : 2} fill="white" stroke={metric.color} strokeWidth="2" className="skilldock-chart-point"><title>{`${formatFullDate(point.date)}：${metric.label} ${point.value}`}</title></circle>)}
          </g>;
        })}
      </svg> : <div className="flex h-44 items-center justify-center text-xs text-ink/32">正在读取逐日统计…</div>}
    </div>
    <div className="mt-2 flex justify-between gap-1 px-1">{points.map((point, index) => <span key={point.date} className={`min-w-0 flex-1 text-center text-[9px] text-ink/28 ${index % 2 === 1 ? "hidden sm:block" : "block"}`}>{formatShortDate(point.date)}</span>)}</div>
    <div className="mt-3 flex items-center justify-between gap-4 border-t border-line pt-3 text-[11px] text-ink/30"><span>{metrics.some((metric) => (totals[metric.key] ?? 0) > 0) ? "曲线会随最新统计动态更新" : "暂无记录，新的事件会从当天开始绘制"}</span><span className="shrink-0">{updatedAt ? `更新于 ${formatTime(updatedAt)}` : "等待首次记录"}</span></div>
  </div>;
}

function metricValue(point: SkillActivityPoint | SiteActivityPoint, key: TrendMetric["key"]) {
  const value = key in point ? point[key as keyof typeof point] : 0;
  return typeof value === "number" ? value : 0;
}

function smoothPath(points: Array<{ x: number; y: number }>) {
  if (points.length === 0) return "";
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;
  let path = `M ${points[0].x} ${points[0].y}`;
  for (let index = 1; index < points.length; index += 1) {
    const previous = points[index - 1];
    const current = points[index];
    const middleX = (previous.x + current.x) / 2;
    path += ` C ${middleX} ${previous.y}, ${middleX} ${current.y}, ${current.x} ${current.y}`;
  }
  return path;
}

function Legend({ color, label }: { color: string; label: string }) {
  return <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />{label}</span>;
}

function formatShortDate(value: string) {
  const [, month, day] = value.split("-");
  return `${Number(month)}/${Number(day)}`;
}

function formatFullDate(value: string) {
  const [year, month, day] = value.split("-");
  return `${year}年${Number(month)}月${Number(day)}日`;
}

function formatTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "未知";
  return new Intl.DateTimeFormat("zh-CN", { month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit" }).format(date);
}

