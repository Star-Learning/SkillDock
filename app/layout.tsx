import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { SiteAnalytics } from "@/components/analytics/SiteAnalytics";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: "SkillDock｜公开下载的 Agent Skill 库", template: "%s｜SkillDock" },
  description: "免费浏览和下载经过检查的 Agent Skills，由维护者私有管理和统一发布。",
  alternates: { canonical: "/" },
  openGraph: {
    title: "SkillDock｜公开下载的 Agent Skill 库",
    description: "公开下载，私有维护。",
    url: siteUrl,
    siteName: "SkillDock",
    locale: "zh_CN",
    type: "website",
  },
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return <html lang="zh-CN"><body className="min-h-screen antialiased"><SiteAnalytics /><Header /><main>{children}</main><Footer /></body></html>;
}
