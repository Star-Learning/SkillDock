import type { Metadata } from "next";
import { Database, FolderLock, ScanSearch, ShieldCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "隐私与安全边界",
  description: "了解 SkillDock 的公开下载、私有维护和最小化统计边界。",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return <div className="mx-auto max-w-5xl px-5 py-14 sm:px-8 sm:py-20"><div className="max-w-3xl"><p className="text-xs font-semibold uppercase tracking-[0.2em] text-moss">Privacy</p><h1 className="mt-4 text-balance text-4xl font-semibold tracking-[-0.055em] text-ink sm:text-5xl">公开的是发布包，<br />私有的是管理权</h1><p className="mt-5 text-base leading-8 text-ink/58">SkillDock 不设置访客账号，也不接收用户的任务内容。网站公开展示经过检查的 Skill 版本包，源码维护和发布权限只属于站点所有者。</p></div><div className="mt-12 grid gap-4 sm:grid-cols-2"><PrivacyCard icon={FolderLock} title="维护入口不公开" text="新增、修改、删除和发布只在维护者的本地仓库中完成，公开网页没有编辑接口。" /><PrivacyCard icon={ScanSearch} title="发布前安全扫描" text="同步器拒绝私钥、凭证、环境变量文件、日志、符号链接和异常大文件。" /><PrivacyCard icon={Database} title="最小化统计" text="只记录公开页面路径、Skill 标识、浏览、点击、使用或下载事件和时间；不记录用户输入、生成内容、本地文件、账号或持久化 IP。" /><PrivacyCard icon={ShieldCheck} title="用户在本地运行" text="下载后的检查、安装和执行发生在用户自己的 Agent 环境中，网站不会代替用户运行 Skill。" /></div><section className="mt-16 rounded-[28px] border border-line bg-white p-6 sm:p-8"><h2 className="text-xl font-semibold text-ink">第三方 Skill 使用建议</h2><ul className="mt-5 list-disc space-y-3 pl-5 text-sm leading-7 text-ink/58"><li>导入后先查看 SKILL.md、脚本、依赖和权限范围。</li><li>测试未通过或包含敏感文件的 Skill 不应安装。</li><li>对会执行命令、联网或读取个人文件的 Skill，先使用最小权限环境验证。</li><li>有新版本时先查看版本说明和校验值，再决定是否更新。</li></ul></section></div>;
}

function PrivacyCard({ icon: Icon, title, text }: { icon: typeof FolderLock; title: string; text: string }) {
  return <div className="rounded-[24px] border border-line bg-white p-6"><span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-mint text-moss"><Icon className="h-5 w-5" /></span><h2 className="mt-5 font-semibold text-ink">{title}</h2><p className="mt-2 text-sm leading-6 text-ink/52">{text}</p></div>;
}
