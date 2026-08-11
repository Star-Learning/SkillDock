import type { FlowStep } from "@/data/case-details";

export function FlowSteps({ steps }: { steps: FlowStep[] }) {
  return (
    <div className="overflow-hidden rounded-[22px] border border-line bg-white">
      <div className="grid sm:grid-cols-2 lg:grid-cols-5">
        {steps.map((step, index) => (
          <div key={step.title} className="border-b border-line p-4 last:border-b-0 sm:odd:border-r lg:border-b-0 lg:border-r lg:last:border-r-0">
            <span className="text-[11px] font-semibold text-moss/45">{String(index + 1).padStart(2, "0")}</span>
            <p className="mt-3 text-sm font-semibold leading-5 text-ink">{step.title}</p>
            <p className="mt-1.5 text-xs leading-5 text-ink/52">{step.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
