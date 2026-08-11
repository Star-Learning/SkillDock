import { CheckCircle2, CircleDashed, FlaskConical } from "lucide-react";
import type { AutomationCase } from "@/lib/cases/schema";
import { cn } from "@/lib/utils";

const config = {
  tested: { label: "已实测", icon: CheckCircle2, className: "border-emerald-200 bg-emerald-50 text-emerald-700" },
  partial: { label: "部分实测", icon: FlaskConical, className: "border-amber-200 bg-amber-50 text-amber-700" },
  reference: { label: "方案参考", icon: CircleDashed, className: "border-slate-200 bg-slate-50 text-slate-600" },
} as const;

export function TestedBadge({ status, compact = false }: { status: AutomationCase["status"]; compact?: boolean }) {
  const item = config[status];
  const Icon = item.icon;
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium", item.className)}>
      <Icon className="h-3.5 w-3.5" />
      {!compact && item.label}
    </span>
  );
}
