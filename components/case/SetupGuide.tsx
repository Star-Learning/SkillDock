import { Check, Lightbulb } from "lucide-react";
import type { SetupStep } from "@/data/case-details";

export function SetupGuide({ steps }: { steps: SetupStep[] }) {
  return (
    <ol className="relative space-y-3 before:absolute before:bottom-8 before:left-[23px] before:top-8 before:w-px before:bg-line">
      {steps.map((step, index) => (
        <li key={step.title} className="relative flex gap-4 rounded-2xl border border-line bg-white p-4 sm:p-5">
          <span className="z-10 flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-4 border-white bg-ink text-sm font-semibold text-white">{index + 1}</span>
          <div className="pt-0.5"><h3 className="font-semibold text-ink">{step.title}</h3><p className="mt-1 text-sm leading-6 text-ink/60">{step.description}</p>{step.tip && <p className="mt-2 inline-flex items-start gap-1.5 rounded-lg bg-[#f7f1dc] px-2.5 py-1.5 text-xs leading-5 text-[#765f24]"><Lightbulb className="mt-0.5 h-3.5 w-3.5 shrink-0" />{step.tip}</p>}</div>
          <Check className="ml-auto mt-1 hidden h-4 w-4 text-moss/30 sm:block" />
        </li>
      ))}
    </ol>
  );
}
