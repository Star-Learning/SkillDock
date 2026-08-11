"use client";

import { Download, FileJson2, FileText, ShieldCheck } from "lucide-react";
import type { WorkflowTemplate } from "@/lib/templates/schema";
import { formatChineseDate } from "@/lib/utils";
import { track } from "@/lib/analytics";

export function TemplateDownload({ template }: { template: WorkflowTemplate }) {
  const isSkill = template.resourceType === "skill";
  const ResourceIcon = isSkill ? FileText : FileJson2;
  const resourceLabel = isSkill ? "Skill" : "Workflow";
  return (
    <div className="overflow-hidden rounded-[26px] border border-moss/20 bg-white shadow-card">
      <div className="border-b border-line bg-[#eef4ec] px-5 py-3 text-xs font-medium text-moss">完全免费 · 无需登录 · 可直接下载</div>
      <div className="p-5 sm:p-6">
        <div className="flex items-start gap-4">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-ink text-white"><ResourceIcon className="h-5 w-5" /></span>
          <div><h3 className="font-semibold text-ink">{template.name}</h3><p className="mt-1 text-sm text-ink/50">{template.platform} {isSkill ? "SKILL.md" : "Workflow JSON"} · v{template.version}</p></div>
        </div>
        <dl className="mt-5 grid grid-cols-2 gap-3 rounded-2xl bg-paper p-4 text-xs">
          <div><dt className="text-ink/42">最近校验</dt><dd className="mt-1 font-medium text-ink/72">{formatChineseDate(template.lastTested)}</dd></div>
          <div><dt className="text-ink/42">所需配置</dt><dd className="mt-1 font-medium text-ink/72">{template.requires.length} 项</dd></div>
        </dl>
        <a href={template.file} download onClick={() => track("template_download", { templateId: template.id })} className="mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-ink text-sm font-medium text-white transition hover:bg-moss"><Download className="h-4 w-4" />免费下载 {resourceLabel}</a>
        <p className="mt-3 flex items-center justify-center gap-1.5 text-[11px] text-ink/42"><ShieldCheck className="h-3.5 w-3.5" />{isSkill ? "纯 Markdown 指令文件，可先阅读再安装" : "文件不含任何 API Key 或真实凭证"}</p>
      </div>
    </div>
  );
}
