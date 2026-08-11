# AI 自动化案例库 — MVP 产品与开发规格 V1.1

> 面向个人开发者，可直接交给 Codex 开发。
>
> 核心定位：**永久免费公开真实 AI 自动化案例，提供经过实测、可直接复用的 Workflow 模板。**
>
> V1 不做登录、不做账号体系、不做在线运行、不接收用户 API Key、不承担用户大模型 Token 成本。

---

# 0. 一页结论

## 0.1 这个产品是什么

一个面向国内用户的 **AI 自动化案例库 / 可复用解决方案库**。

用户不是先找 n8n、Dify 或某个模型，而是先找：

> **“我想把什么事情自动化？”**

网站负责告诉用户：

1. 这个问题如何自动化；
2. 推荐使用哪条技术路线；
3. 为什么这样做；
4. 最终效果是什么；
5. 需要准备哪些工具；
6. 如何一步步配置；
7. 提供可直接导入的 Workflow / Prompt / 配置示例。

## 0.2 产品核心资产

产品有两个不同层级：

### Case：案例

- 永久公开；
- 永久可访问；
- 用于 SEO、传播、建立信任；
- 即使用户不下载模板，也能理解完整解决思路。

### Template：模板

- 用户真正“拿走复用”的资产；
- V1 全部免费；
- 后期可以同时存在 Free / Pro / Pack；
- 付费的是完成度、调试成本和可复用性，不是简单卖一个 JSON 文件。

关系：

```text
Case：每天自动追踪新论文
│
├── 解决方案说明（永久免费）
├── 最终效果（永久免费）
├── 流程图（永久免费）
├── 教程（永久免费）
│
├── Template A：基础版 n8n Workflow
│     └── V1 免费
│
└── Template B：高级版 Workflow
      └── 后期可 Premium
```

## 0.3 V1 最重要的产品原则

> **案例负责解决“怎么做”的问题，模板负责解决“懒得自己重新搭”的问题。**

---

# 1. 产品定位

## 1.1 暂定名称

正式名称先使用：

> **AI 自动化案例库**

副标题：

> **可直接复用的 AI 自动化解决方案**

项目初期不要花大量时间做品牌设计、商标或复杂命名。

## 1.2 一句话介绍

> 面向国内用户的可复用 AI 自动化解决方案库，通过真实案例展示如何使用 n8n、国产大模型 API 和飞书等工具完成重复工作，并提供经过实测、可直接导入的 Workflow 模板。

## 1.3 核心差异化

不做：

- AI 工具导航大全；
- n8n Workflow 数量型收录站；
- Dify 模板市场复制品；
- MCP / Skill 数量型导航；
- AI Agent 在线执行平台；
- 用户上传社区；
- 一开始就做会员 SaaS。

要做：

> **真实需求 → 推荐方案 → 最终效果 → 配置教程 → 可复用模板**

网站的核心对象是 `Case / Use Case`，不是 `Workflow`。

---

# 2. 用户真正得到什么

每一个案例必须让用户至少获得以下价值：

1. 一个已经整理好的自动化思路；
2. 推荐的实现技术栈；
3. 清晰的输入和输出；
4. 可视化流程；
5. 成本、难度、配置时间；
6. 中文配置教程；
7. Prompt；
8. 可复用 Workflow 文件（若提供）；
9. 模型替换说明；
10. 飞书配置说明；
11. 最近实测状态；
12. 常见问题。

用户理想体验：

```text
找到案例
  ↓
看懂最终效果
  ↓
确认适合自己
  ↓
下载 Workflow
  ↓
导入自己的 n8n
  ↓
填写自己的大模型 API
  ↓
填写自己的飞书配置
  ↓
开始运行
```

---

# 3. 核心运行模式：BYOK + 用户自有执行环境

## 3.1 平台不承担 Token 成本

V1 不提供平台统一的大模型 API。

所有需要 AI 的 Workflow 都由用户自行配置模型 API。

支持原则：

```text
LLM_BASE_URL
LLM_API_KEY
LLM_MODEL
```

推荐模型可以包含：

- 通义千问 / 阿里云百炼；
- DeepSeek；
- GLM；
- Kimi；
- 豆包；
- 其他兼容 HTTP / OpenAI-compatible 接口的服务。

网站不要把 Workflow 写死到某个具体模型版本。

## 3.2 飞书同样由用户自己配置

平台不统一托管用户飞书凭证。

常见场景：

### 简单推送

使用：

```text
FEISHU_WEBHOOK_URL
FEISHU_SIGNING_SECRET（可选）
```

### 高级能力

需要读取消息、写多维表格、飞书文档等场景时，可使用用户自己的：

```text
FEISHU_APP_ID
FEISHU_APP_SECRET
```

## 3.3 网站不收集密钥

V1 页面中 **不要出现需要用户向本站提交 API Key 的表单**。

也不要：

- 将 API Key POST 到本站；
- 保存 API Key；
- 将飞书 Webhook 写入数据库；
- 将任何真实凭证写入 Workflow 示例；
- 在日志中记录密钥。

网站必须明确展示：

> 🔐 API Key 无需提交给本站。
>
> 🔐 Workflow 在用户自己的环境中运行。
>
> 🔐 大模型调用费用由用户自己的 API 账户承担。

这既是成本策略，也是隐私卖点。

---

# 4. V1 商业策略

## 4.1 V1：全部模板免费

V1 的目标不是立刻赚钱，而是验证：

- 哪些案例有搜索需求；
- 哪些模板下载量高；
- 用户更喜欢什么类型；
- 哪些需求值得进一步做高级模板。

因此 V1：

```text
案例          免费
教程          免费
Workflow      免费
Prompt        免费
配置示例      免费
```

## 4.2 后期不要把所有旧免费模板突然收费

长期建议使用：

```text
永久免费基础模板
+
Premium 高级模板
+
Workflow Pack
+
定制服务
```

示例：

### Free

AI 新闻日报：

```text
RSS → LLM → 飞书
```

### Pro

AI 情报监控系统：

```text
多来源
→ 去重
→ 相关性评分
→ 摘要
→ 飞书卡片
→ 多维表格归档
→ 日报
→ 周报
→ 异常重试
```

### Pack

例如：

> AI 信息获取自动化套装

包含：

- AI 新闻监控；
- GitHub 监控；
- 论文监控；
- RSS 日报；
- 网站变化监控；
- 周报汇总。

## 4.3 后期 Premium 模板应卖“完成度”

不要形成：

> 一个 JSON 卖 19.9 元

而应包含：

```text
Workflow JSON
中文教程
流程图
Prompt
.env.example
配置 Checklist
测试样例
常见错误
模型替换说明
飞书配置说明
版本说明
更新日志
```

---

# 5. MVP 范围

## 5.1 首发内容规模

不要首发 50 个。

建议：

> **12 个真正实测的案例上线。**

内容成熟后扩到 20 个，再扩到 50 个。

比“20 个占位页面”更重要的是“12 个真的能跑”。

## 5.2 V1 必须实现

- 首页；
- 案例库；
- 案例详情；
- 分类；
- 搜索；
- 基础筛选；
- Workflow 下载；
- Prompt 复制；
- Tested 状态；
- 最近更新时间；
- 相关案例；
- 关于 / 隐私说明；
- SEO；
- 移动端适配。

## 5.3 V1 明确不做

- 注册；
- 登录；
- 用户中心；
- 评论；
- 社区；
- 用户投稿；
- 在线执行 Workflow；
- 在线填写 API Key；
- AI 在线生成 Workflow；
- 支付；
- 订单；
- 会员；
- 后台 CMS；
- 数据库；
- Elasticsearch；
- 向量数据库；
- 推荐算法；
- 自动爬取竞品模板。

---

# 6. 首发 12 个案例

## 信息获取

1. AI 新闻每日简报；
2. RSS 信息自动摘要；
3. GitHub Trending 每日简报；
4. 网站内容变化监控。

## 科研

5. arXiv 新论文每日推荐；
6. 新论文中文结构化摘要；
7. GitHub Research Repo 更新监控。

## 办公

8. 飞书群消息每日摘要；
9. PDF 信息提取并写入飞书多维表格；
10. CSV / Excel 自动生成分析报告。

## 内容创作

11. 热点信息自动生成公众号选题；
12. 长文章自动生成多平台内容草稿。

首页精选 6 个。

---

# 7. 内容分类原则

一级分类必须按照“用户想做什么”划分，而不是按照工具划分。

推荐：

- 信息获取；
- 办公效率；
- 内容创作；
- 科研学习；
- 编程 / AI；
- 数据处理（内容多以后再独立）。

不要把以下内容做成首页一级分类：

- n8n；
- Dify；
- DeepSeek；
- Qwen；
- 飞书。

这些应作为工具标签和筛选项。

---

# 8. 页面信息架构

## 8.1 路由

V1：

```text
/
/cases
/case/[slug]
/category/[slug]
/tools
/tool/[slug]
/about
```

建议从此版本开始把原来的 `workflow` 路由统一改成 `case`。

原因：

> 网站售卖的是“解决方案认知”，Workflow 是解决方案中的资源，而不是产品主体。

## 8.2 顶部导航

```text
Logo
案例库
分类
工具
关于
搜索
```

不要增加“登录 / 注册”。

---

# 9. 首页设计

## 9.1 Hero

主标题：

> # 让重复工作，自动完成

副标题：

> 找到可以直接复用的 AI 自动化解决方案。看懂流程、复制配置、下载 Workflow，在你自己的环境中运行。

搜索框：

> 你想自动完成什么？

Placeholder：

> 例如：每天自动追踪新论文并发送到飞书

搜索 V1 使用本地搜索，不调用 AI。

## 9.2 Hero 下方信任点

展示三个简短 Badge：

```text
✓ 无需注册
✓ 模板可直接复用
✓ API Key 不提交给本站
```

## 9.3 热门需求

例如：

```text
AI 新闻日报
论文追踪
GitHub 监控
PDF 提取
飞书日报
RSS 摘要
公众号选题
Excel 报告
```

## 9.4 精选案例卡片

建议格式：

```text
[图标]
每天自动追踪新论文

自动发现与你研究方向相关的新论文，生成中文摘要并发送到飞书。

arXiv → AI → 飞书

[科研] [免费模板] [已实测]

难度 2/5 · 配置约 15 分钟

查看解决方案 →
```

## 9.5 为什么值得用

三列：

### 不只是一个模板
先告诉你它能解决什么问题。

### 已经替你想好路线
减少工具选择和调试成本。

### 拿走即可修改
Workflow、Prompt、变量全部可替换。

## 9.6 最近实测

展示最近更新的 4–6 个案例。

必须显示：

```text
最近实测：2026-08
```

---

# 10. 案例库 `/cases`

页面结构：

```text
# AI 自动化案例库

可直接复用的 AI 自动化解决方案。

[搜索]

[分类] [工具] [难度] [模板类型]

案例 Grid
```

## 10.1 筛选

### 分类

- 信息获取；
- 办公效率；
- 内容创作；
- 科研学习；
- 编程 / AI。

### 工具

首期只维护高频工具：

- n8n；
- 飞书；
- 飞书多维表格；
- RSS；
- GitHub；
- 通义千问；
- DeepSeek；
- HTTP API。

### 难度

- 1：直接导入即可；
- 2：简单 API / Webhook 配置；
- 3：需要部署或简单调试；
- 4：需要编程；
- 5：高级定制。

### 模板类型

V1 可以展示字段但全部为 Free：

```text
Free
Premium（未来）
```

不要在 V1 制造不可购买的 Premium 假按钮。

---

# 11. 案例详情页 `/case/[slug]`

这是整个产品最重要的页面。

## 11.1 顶部区域

示例：

```text
首页 / 科研学习 / arXiv 新论文推荐

# 每天自动追踪与你相关的新论文

每天自动检索 arXiv，用 AI 筛选相关论文，生成中文摘要并发送到飞书。

[免费模板] [已实测]

难度 2/5
配置约 15 分钟
运行成本：取决于用户自己的 API
最近实测：2026-08

[下载 Workflow] [查看配置教程]
```

## 11.2 用户最终会得到什么

这一节必须放在“技术介绍”之前。

示例：

```text
每天早上自动收到：

📚 今日推荐论文

Paper 1
相关度：92%
核心问题：……
主要贡献：……
为什么值得看：……
论文链接：……
GitHub：……
```

## 11.3 它解决什么问题

控制在 2–4 段。

不要写成技术文档开场。

## 11.4 工作流程

```text
每天 08:00
   ↓
arXiv Search
   ↓
关键词初筛
   ↓
LLM 相关性判断
   ↓
结构化中文摘要
   ↓
飞书消息
```

优先使用自定义 `FlowSteps` 组件，不强制 Mermaid。

原因：

- 更稳定；
- 更容易统一视觉；
- 避免 Mermaid SSR / Hydration 复杂度；
- Codex 更容易维护。

## 11.5 推荐技术栈

示例：

> **推荐：n8n + 国产模型 API + 飞书**

推荐理由：

- 低成本；
- 用户自己控制 API；
- 易替换模型；
- 可自托管；
- 飞书更适合国内协作。

## 11.6 替代路线

V1 不强制每个案例都完整实现 3 套 Workflow。

只需要告诉用户替代路线即可：

| 路线 | 适合谁 | 难度 | 特点 |
|---|---|---:|---|
| n8n + 国产模型 + 飞书 | 大多数用户 | 2 | 推荐 |
| Dify + 国产模型 + 飞书 | 更偏 AI 编排 | 2 | AI 节点更直观 |
| Python + API + 飞书 | 程序员 | 4 | 自定义能力强 |

**只有主推荐路线必须提供完整可下载模板。**

这可以显著降低个人开发者维护成本。

## 11.7 准备清单

例如：

```text
☑ n8n 环境
☑ 任意支持的国产模型 API Key
☑ 飞书群机器人 Webhook
```

同时明确：

> 本站不会要求上传这些密钥。

## 11.8 配置教程

固定结构：

### Step 1：导入 Workflow
### Step 2：配置模型 API
### Step 3：配置飞书
### Step 4：修改业务参数
### Step 5：测试
### Step 6：启用定时运行

## 11.9 可配置参数

展示：

```text
LLM_BASE_URL
LLM_API_KEY
LLM_MODEL
FEISHU_WEBHOOK_URL
SEARCH_KEYWORDS
RUN_INTERVAL
```

不要把这些写死在页面组件中。

## 11.10 Prompt

如果有 LLM：

- 折叠展示；
- 一键复制；
- 提供“用途说明”；
- Prompt 与 Workflow 可独立更新。

## 11.11 模板下载区

V1：

```text
免费模板

n8n Workflow JSON
版本：1.0.0
最近实测：2026-08-07

[免费下载]
```

后期数据结构预留：

```text
Free
Premium
Pack
```

但 V1 UI 只展示 Free。

## 11.12 常见问题

建议每个完整案例至少 3 个 FAQ：

- 可以换成 DeepSeek / Qwen 吗？
- 飞书机器人怎么配置？
- 为什么 Workflow 导入后报错？

## 11.13 相关案例

展示 3 个。

---

# 12. 内容数据模型

推荐把 **Case** 和 **Template** 分开建模，即使 V1 每个 Case 只有一个 Template。

这样后期增加 Premium 不需要重构。

## 12.1 Case metadata

推荐：

```yaml
id: "arxiv-paper-digest"
slug: "arxiv-paper-digest"
title: "每天自动追踪与你相关的新论文"
summary: "自动检索 arXiv，由 AI 筛选相关论文并发送中文摘要到飞书。"
category: "research"
featured: true
featuredOrder: 1
status: "tested"
lastTested: "2026-08-07"
difficulty: 2
setupMinutes: 15
costText: "按你自己的模型 API 用量计费"
recommendedStack:
  - n8n
  - 国产模型 API
  - 飞书
apps:
  - n8n
  - 飞书
  - arXiv
  - LLM API
tags:
  - 论文追踪
  - arXiv
  - 科研
aliases:
  - "自动找论文"
  - "论文日报"
  - "arxiv监控"
templateIds:
  - "arxiv-paper-digest-n8n-free"
```

## 12.2 Template metadata

建议独立 JSON/TS 数据：

```yaml
id: "arxiv-paper-digest-n8n-free"
caseId: "arxiv-paper-digest"
name: "n8n 基础版"
platform: "n8n"
tier: "free"
price: 0
version: "1.0.0"
file: "/templates/arxiv-paper-digest-n8n-free.json"
lastTested: "2026-08-07"
requires:
  - "LLM API Key"
  - "Feishu Webhook"
```

未来 Premium 可以直接新增：

```yaml
tier: "premium"
price: 19.9
```

而不影响 Case 页面结构。

## 12.3 推荐文件组织

内容正文：

```text
/content/cases/*.mdx
```

结构化 metadata：

```text
/data/cases.ts
/data/templates.ts
/data/categories.ts
/data/tools.ts
```

Workflow 文件：

```text
/public/templates/
```

Prompt 如果较长：

```text
/content/prompts/
```

### 重要原则

**不要把所有结构化数据都塞进复杂 MDX Frontmatter。**

个人项目更推荐：

```text
TypeScript metadata + MDX 正文
```

原因：

- 类型检查更好；
- Codex 修改更稳定；
- 后期 Premium / Payment 更容易扩展；
- 不需要额外 CMS。

---

# 13. 技术架构 — 重点

## 13.1 不做前后端分离

### 推荐：单仓库 Next.js 模块化单体（Modular Monolith）

```text
浏览器
   ↓
Next.js App
   ├── 页面 / UI
   ├── 搜索
   ├── 内容读取
   ├── 下载
   └── 未来 API / Payment
        ↓
本地 MDX / TS 数据
```

V1 不需要单独：

```text
React Frontend
+
FastAPI / Express Backend
+
Database
```

### 原因

对当前项目而言，前后端分离会额外增加：

- 两套项目；
- 两套部署；
- CORS；
- API 版本维护；
- 环境变量管理；
- 云服务器进程管理；
- 更多调试成本。

而 V1 根本没有复杂后端业务。

## 13.2 使用 Next.js，但不要做“纯静态导出锁死”

推荐使用标准 Next.js App Router。

V1 页面尽量静态生成 / 构建时读取内容。

但**不要一开始强制设置 `output: 'export'`**。

原因：

V1 虽然是静态内容站，但后期可能增加：

- 支付回调；
- Premium 下载鉴权；
- 下载 Token；
- 订单；
- 简单 API；
- AI Workflow Finder。

保留标准 Next.js Node 运行模式，可以以后直接增加 Route Handler / Server Actions，而无需更换框架。

## 13.3 推荐运行形态

### 本地开发

```text
npm run dev
↓
http://localhost:3000
```

### 生产部署

```text
Internet
   ↓
Nginx
   ↓
Next.js Node Process
   ↓
Static Content / Future Server Features
```

生产运行：

```text
npm run build
npm run start
```

进程管理后期可选：

- systemd；
- PM2；
- Docker。

**V1 本地开发不要求 Docker。**

## 13.4 云服务器迁移原则

开发阶段：

```text
Windows / macOS / Linux
↓
Git Repository
↓
Next.js
```

上线阶段：

```text
GitHub
↓
云服务器 git clone / CI Deploy
↓
npm ci
↓
npm run build
↓
Next.js
↓
Nginx
↓
域名 + HTTPS
```

无需修改业务代码。

## 13.5 为什么不是 Astro / 纯静态 HTML

Astro 也适合内容站，但本项目后期明确存在：

- Premium；
- Payment；
- 下载鉴权；
- AI Finder；

因此统一使用 Next.js，可以减少后期迁移成本。

## 13.6 为什么暂时不要 Python 后端

V1 不存在需要 Python 的核心服务端能力。

如果未来真的出现：

- 大规模数据处理；
- 异步任务；
- Python 特有工具链；

再单独增加 Worker / Python Service。

不要为了“未来可能用”提前创建 FastAPI。

---

# 14. 代码层必须模块化

虽然不前后端分离，但代码不能全部混在一起。

推荐按职责分层：

```text
Presentation
    ↓
Domain / Application
    ↓
Content / Repository
    ↓
Future Server Integrations
```

## 14.1 推荐目录

```text
ai-automation-case-library/
│
├── app/
│   ├── page.tsx
│   ├── cases/
│   │   └── page.tsx
│   ├── case/
│   │   └── [slug]/
│   │       └── page.tsx
│   ├── category/
│   │   └── [slug]/
│   ├── tool/
│   │   └── [slug]/
│   ├── tools/
│   ├── about/
│   ├── sitemap.ts
│   └── robots.ts
│
├── components/
│   ├── case/
│   │   ├── CaseCard.tsx
│   │   ├── CaseGrid.tsx
│   │   ├── FlowSteps.tsx
│   │   ├── SetupGuide.tsx
│   │   ├── PromptBox.tsx
│   │   ├── TemplateDownload.tsx
│   │   ├── TestedBadge.tsx
│   │   └── RelatedCases.tsx
│   ├── search/
│   ├── layout/
│   └── ui/
│
├── content/
│   ├── cases/
│   └── prompts/
│
├── data/
│   ├── cases.ts
│   ├── templates.ts
│   ├── categories.ts
│   └── tools.ts
│
├── lib/
│   ├── cases/
│   │   ├── repository.ts
│   │   ├── search.ts
│   │   ├── related.ts
│   │   └── schema.ts
│   ├── templates/
│   │   ├── repository.ts
│   │   └── schema.ts
│   ├── seo/
│   └── utils/
│
├── public/
│   ├── images/
│   └── templates/
│
├── server/                 # V1 可为空，预留未来服务端能力
│   ├── payments/
│   ├── downloads/
│   └── db/
│
├── scripts/
│   └── validate-content.ts
│
├── PRODUCT_SPEC.md
├── README.md
└── package.json
```

### 重要

V1 不要因为有 `server/` 目录就实现后端。

它只是告诉未来开发者：

> 支付、数据库和下载鉴权应该放在哪里，而不是塞进 UI 组件。

---

# 15. 推荐技术栈

```text
Next.js App Router
TypeScript
Tailwind CSS
shadcn/ui
Lucide Icons
MDX / Markdown
Zod
Fuse.js
npm
```

## 15.1 Zod

用于校验 Case / Template 数据结构。

目的：

- 防止 Codex 新增内容时字段写错；
- build 阶段发现错误；
- 后期数据迁移更安全。

## 15.2 Fuse.js

V1 使用本地搜索：

```text
title > aliases > tags > summary > apps
```

不要接：

- Elasticsearch；
- Meilisearch；
- Vector DB；
- LLM 搜索。

## 15.3 UI

使用 shadcn/ui，但只安装实际使用组件。

不要一次安装完整组件库。

---

# 16. 搜索架构

构建时生成案例搜索索引：

```text
Case metadata
↓
Search Index
↓
Client-side Fuse.js
```

用户输入：

> 每天找新论文

匹配字段：

- title；
- aliases；
- tags；
- summary；
- tools。

V1 搜索框不是聊天框。

---

# 17. Workflow 模板设计规范

所有公开模板必须做到“拿来可改”。

## 17.1 禁止写死

禁止：

```text
真实 API Key
真实飞书 Webhook
个人邮箱
个人 ID
服务器地址
私有数据库地址
```

## 17.2 标准变量

优先统一为：

```text
LLM_BASE_URL
LLM_API_KEY
LLM_MODEL
FEISHU_WEBHOOK_URL
FEISHU_SIGNING_SECRET
SEARCH_KEYWORDS
RUN_INTERVAL
```

具体 n8n 场景中，如果 Credentials 更合适，则使用 Credentials。

## 17.3 每个 Template 必须有

```text
Template ID
Version
Platform
Tier
Last Tested
Required Config
Workflow File
Change Log（可简化）
```

## 17.4 模板版本

使用简单语义版本：

```text
1.0.0
1.1.0
2.0.0
```

V1 不需要实现自动更新系统，只在页面展示版本。

---

# 18. 下载机制

## V1

免费模板直接作为静态文件：

```text
/public/templates/*.json
```

点击：

```text
免费下载
```

无需 API、无需登录。

## 后期 Premium

不要继续把 Premium 文件放 `public/`。

未来应迁移为：

```text
Payment
↓
Server verifies order
↓
Temporary signed download URL / authenticated download endpoint
↓
Private object storage
```

因此 V1 代码里需要把下载按钮抽象成组件：

```text
TemplateDownload
```

UI 不要直接在很多页面中散落 `<a href="...json">`。

这样未来只改一个组件和数据层。

---

# 19. 后期支付架构预留

V1 不实现支付，但数据模型预留：

```ts
tier: 'free' | 'premium' | 'pack'
price?: number
```

未来可能增加：

```text
/server/payments/
/server/downloads/
/app/api/payment/
```

数据库届时再选：

- Supabase / PostgreSQL；或
- 轻量 SQLite（仅特定部署形态）。

**不要现在安装数据库依赖。**

---

# 20. 本地开发 → 云服务器部署

## 20.1 本地阶段

需要：

- Node.js LTS；
- npm；
- Git；
- Codex / VS Code。

运行：

```bash
npm install
npm run dev
```

## 20.2 上云阶段

推荐：

```text
Ubuntu 云服务器
Node.js LTS
Nginx
Git
HTTPS
```

部署流程：

```bash
git clone <repo>
cd <repo>
npm ci
npm run build
npm run start
```

Nginx 负责：

- 80 / 443；
- HTTPS；
- 反向代理到 Next.js；
- 静态缓存策略（可后续优化）。

## 20.3 Docker

V1：不需要。

后期如果服务器上同时运行：

- Next.js；
- n8n；
- 数据库；
- 其他服务；

再考虑 Docker Compose。

不要因为未来可能部署而让本地 MVP 依赖 Docker。

---

# 21. SEO

这是内容型资源站核心增长能力。

每个案例独立 URL：

```text
/case/arxiv-paper-digest
/case/ai-news-digest
/case/github-trending-digest
```

Title 示例：

> 每天自动追踪 arXiv 新论文：n8n + 国产模型 + 飞书 | AI 自动化案例库

Description：

> 使用 n8n、国产大模型 API 和飞书搭建论文自动追踪流程，每天自动筛选相关论文、生成中文摘要并推送到飞书。

必须实现：

- `generateMetadata`；
- sitemap；
- robots；
- canonical；
- Open Graph；
- 基础 JSON-LD（实现简单时）；
- 每个 Case 唯一 URL。

不要批量生成没有真实内容的 SEO 页面。

---

# 22. Analytics — V1 建议增加

由于 V1 的核心目标是验证需求，必须知道：

- 哪个 Case 浏览最多；
- 哪个 Template 下载最多；
- 用户搜索什么；
- 哪个分类最受欢迎。

但不要为 Analytics 建数据库。

实现建议：

- 预留 analytics adapter；
- 上线时再接一个轻量隐私友好的统计服务或现成 Web Analytics；
- 本地开发阶段可以为空实现。

代码不要绑定某一家统计平台。

接口示例：

```ts
track('case_view', { caseId })
track('template_download', { templateId })
track('search', { query })
```

V1 本地环境不需要真实上传事件。

---

# 23. UI / 视觉

风格：

> 清爽、可信、偏现代工具站，但普通用户也能看懂。

参考感觉：

- Linear 的克制；
- Vercel 的留白；
- 少数派的内容可读性；
- Gumloop 的案例卡片感。

不要：

- AI 机器人插画堆砌；
- 满屏渐变；
- 赛博朋克；
- 传统网址导航密密麻麻；
- 过度动画。

首页核心强调：

```text
问题
解决结果
可直接复用
已实测
```

而不是强调：

```text
10000+ Workflow
1000+ Tools
```

---

# 24. 内容可信度

每个 Case / Template 状态：

```text
✅ 已实测
🟡 部分实测
⚪ 方案参考
```

数据：

```ts
status: 'tested' | 'partial' | 'reference'
lastTested: '2026-08-07'
```

只有真正跑通的模板才能显示：

> 已实测

这是产品核心资产之一。

---

# 25. 内容版权

不能直接把其他模板市场的 Workflow 批量复制到本站。

规则：

- 自己制作的 Workflow：可直接托管；
- 明确允许再分发的开源 Workflow：遵守 License；
- 来源不明或不允许分发：只链接原站；
- 案例说明应重新组织、重新验证；
- 标注来源 / 灵感 / License。

---

# 26. Codex 开发顺序

## Phase 1：工程骨架

- Next.js；
- TypeScript；
- Tailwind；
- shadcn/ui；
- Layout；
- Header；
- Footer。

## Phase 2：数据模型

- Case schema；
- Template schema；
- Zod validation；
- 12 个 Case metadata；
- MDX 内容读取；
- build-time validation。

## Phase 3：首页

- Hero；
- 搜索；
- 热门需求；
- Featured Cases；
- 分类；
- 信任点；
- 最近实测。

## Phase 4：案例库

- Case Grid；
- 搜索；
- 分类筛选；
- 工具筛选；
- 难度筛选。

## Phase 5：详情页

- 最终效果；
- 工作流程；
- 推荐技术栈；
- 替代路线；
- 配置清单；
- Step Guide；
- Prompt；
- Template Download；
- FAQ；
- Related Cases。

## Phase 6：完整 Demo

完整实现：

> **arXiv 新论文每日推荐**

或：

> **AI 新闻每日简报**

至少一个案例需要拥有：

- 真正可下载 Workflow；
- 真实教程；
- Prompt；
- 配置变量；
- 测试状态。

## Phase 7：SEO / QA

- metadata；
- sitemap；
- robots；
- 404；
- responsive；
- accessibility 基础；
- lint；
- typecheck；
- build。

---

# 27. MVP 验收标准

## 产品

- [ ] 进入首页 10 秒能知道网站是干什么的；
- [ ] 首页不强调 Workflow 数量；
- [ ] 案例强调用户结果而不是技术节点；
- [ ] API Key 不需要提交给本站；
- [ ] 无登录即可浏览和下载；
- [ ] 至少 12 个案例；
- [ ] 至少 1 个案例真正完整可运行；
- [ ] 所有“已实测”内容真实跑通。

## 功能

- [ ] 首页可用；
- [ ] 案例库可用；
- [ ] 搜索可用；
- [ ] 分类筛选可用；
- [ ] 案例独立 URL；
- [ ] 免费模板可下载；
- [ ] Prompt 可复制；
- [ ] 相关案例可跳转；
- [ ] 移动端正常。

## 工程

- [ ] 单个 Next.js repository；
- [ ] 不前后端分离；
- [ ] 无数据库；
- [ ] 无登录依赖；
- [ ] 无支付依赖；
- [ ] 无 LLM API 依赖；
- [ ] Case / Template 分层建模；
- [ ] `npm run build` 通过；
- [ ] TypeScript 无错误；
- [ ] 内容数据构建时校验；
- [ ] 后期可直接增加服务端 API，而不用迁移框架。

---

# 28. 后续路线

## V1

> 免费 Case + 免费 Template

目标：验证流量和下载需求。

## V1.5

- 20–50 个案例；
- 更丰富的模板；
- Analytics；
- GitHub Issues 收集需求；
- Free / Premium metadata 完善，但可以仍不收费。

## V2

### 商业化

- Premium Workflow；
- Workflow Pack；
- 付费下载；
- 定制服务。

此时才增加：

- 支付；
- 订单；
- 私有文件存储；
- 下载鉴权；
- 轻量数据库。

不一定需要账号体系。

## V2.5

### AI Case Finder

用户输入：

> 我希望每天检查最新遥感论文，有重要论文就发到飞书。

AI 只负责：

- 理解需求；
- 从已有 Case 中召回；
- 推荐最匹配方案；
- 必要时组合已有案例。

不要一开始做任意 Workflow 自动生成器。

---

# 29. 未来架构扩展示意

当前：

```text
Browser
  ↓
Next.js
  ↓
MDX / TS / Public Templates
```

未来付费：

```text
Browser
   ↓
Next.js
   ├── Static Cases
   ├── Search
   ├── Payment API
   └── Secure Download API
           ↓
       Database
           ↓
   Private Object Storage
```

再未来 AI Finder：

```text
Browser
   ↓
Next.js
   ↓
AI Finder API
   ↓
Case Search / Retrieval
```

只有当某个服务真的复杂到需要独立扩容时，才拆成独立后端。

**不要提前微服务化。**

---

# 30. 给 Codex 的架构硬性要求

Codex 必须遵守：

1. 使用单个 Next.js repository；
2. 不前后端分离；
3. 使用 App Router；
4. 页面优先静态生成；
5. 不设置会限制未来服务端能力的纯静态导出架构；
6. V1 不建立数据库；
7. V1 不创建真实 API 服务；
8. Case 和 Template 必须独立建模；
9. 下载必须走 `TemplateDownload` 抽象组件；
10. UI 不直接依赖模板文件路径实现复杂逻辑；
11. 数据必须经过 schema 校验；
12. 所有敏感配置只展示变量名，不保存真实值；
13. 内容与 UI 分离；
14. 业务逻辑不要写进页面 JSX；
15. 后期 Payment / Downloads / DB 通过 server 模块扩展；
16. 不引入 Docker 作为本地运行前置；
17. 不添加文档未要求的 SaaS 功能；
18. UI 精致，但依赖越少越好；
19. 最终必须通过 lint / typecheck / build；
20. README 必须写清本地运行和云服务器部署方法。

---

# 31. 可直接复制给 Codex 的启动指令

```text
请完整阅读根目录 PRODUCT_SPEC.md，然后基于该文档从零实现 AI 自动化案例库 MVP。

这是一个个人开发者维护的内容型产品，不是 SaaS 平台。请严格控制工程复杂度。

架构要求：
1. 使用单仓库 Next.js + TypeScript + Tailwind CSS + App Router；
2. 不做前后端分离；
3. V1 不使用数据库、登录、支付、LLM API 或在线 Workflow 执行；
4. 页面尽量静态生成，但不要把项目锁死成只能纯静态导出的架构；
5. Case 与 Template 必须独立建模，为未来 Premium Template 预留；
6. 内容使用 TypeScript metadata + MDX 正文；
7. 使用 Zod 校验 Case / Template 数据；
8. 使用 Fuse.js 做本地搜索；
9. Workflow 免费文件放 public/templates；
10. 所有下载入口必须通过统一 TemplateDownload 组件；
11. API Key、飞书 Webhook 等只展示占位变量，绝不存储真实凭证；
12. 优先使用简单稳定的 FlowSteps 组件展示流程，不强制 Mermaid；
13. 首页、案例库、案例详情页必须优先突出“解决什么问题”和“最终得到什么”；
14. 首批建立 12 个 Case，其中至少 1 个拥有真正完整的可下载 Workflow、Prompt 和中文教程；
15. 完成后执行 lint、typecheck 和 build，修复全部错误；
16. README 中同时写清本地运行方式和以后部署到 Ubuntu + Nginx + Node.js 云服务器的方式。

请先完成工程骨架和数据模型，再实现页面。不要自行扩展账号、支付、后台、CMS、AI Agent 等功能。
```

---

# 32. 最终产品基本盘

任何后续功能都不能破坏下面四点：

### 1. 无登录也能使用

用户可以直接看 Case、看教程、下载免费模板。

### 2. Case 永久公开

收费的是高级可复用资产，不是把解决方案知识锁起来。

### 3. 用户自己承担 AI / 飞书配置

平台不成为用户 Workflow 的运行中间层。

### 4. 少而精、真实实测

宁可 12 个真正能跑的案例，也不要 1000 个未经验证的 Workflow。

最终用户应形成这样的认知：

> **“我不需要先学完 n8n，也不需要在几千个模板里搜索。我只要找到自己想自动化的事情，就能直接拿到一套已经想明白、搭好并测试过的解决方案。”**

---

**文档版本：V1.1**  
**日期：2026-08-07**  
**架构：Next.js 模块化单体 / 内容优先 / BYOK / 无登录 MVP**
