import type { AutomationCase } from "@/lib/cases/schema";
import { CaseCard } from "./CaseCard";

export function CaseGrid({ items, className = "" }: { items: AutomationCase[]; className?: string }) {
  return (
    <div className={`grid gap-4 md:grid-cols-2 xl:grid-cols-3 ${className}`}>
      {items.map((item) => <CaseCard key={item.id} item={item} />)}
    </div>
  );
}
