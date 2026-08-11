# Skills 使用说明

本目录集中存放 SkillDock 当前维护的 Skill。每个 Skill 都可以从网站下载 ZIP，交给本地 Codex 或其他 Agent 安装后使用。

## 通用使用方式

1. 在 SkillDock 中下载对应 Skill 的 ZIP。
2. 将 ZIP 放到 Agent 可以访问的位置，并复制该 Skill 下方的“安装 Prompt”。
3. 安装完成后，复制“使用 Prompt”开始任务。

## 论文公众号文章生成器

读取论文 PDF、裁剪关键图表，生成适合公众号发布的中文 Markdown 文章。

- 输入：一篇论文 PDF 和输出目录。
- 输出：`article.md`、原始 `paper.pdf` 和 `pics/` 图片目录。
- 详细说明：[paper-wechat-article-generator/README.md](paper-wechat-article-generator/README.md)

安装 Prompt（与 SkillDock 页面一致）：

```text
检查刚下载的 paper-wechat-article-generator-v1.0.0.zip，阅读其中的 SKILL.md，测试通过后安装到当前项目并告诉我如何触发使用。
```

使用 Prompt：

```text
请使用 $paper-wechat-article-generator，把我提供的论文 PDF 写成中文公众号解读文章，并将 article.md、paper.pdf 和 pics/ 保存到指定输出目录。
```

## Research2Story

围绕指定主题调研并核验论文，为每篇论文提取真实代表图，生成研究报告和带旁白的 HTML 时间线。

- 输入：研究主题、年份范围、输出语言和输出目录。
- 输出：`research.md`、`storyboard.json`、`pics/`、`figures.json` 和 `index.html`。
- 详细说明：[research2story/README.md](research2story/README.md)

安装 Prompt（与 SkillDock 页面一致）：

```text
检查刚下载的 research2story-v1.0.0.zip，阅读其中的 SKILL.md，测试通过后安装到当前项目并告诉我如何触发使用。
```

使用 Prompt：

```text
请使用 $research2story，调研主题“AI Agent Memory”，覆盖 2022—2026 年，输出中文结果到 outputs/。
```

使用时可以直接替换示例中的论文、研究主题、年份范围、语言和输出目录，其余表达保持不变即可。

## 文献调研 Related Work

围绕指定主题调研并双重核验真实论文，优先 CCF-A 和中科院一区，生成可直接用于论文的 Related Work 与 Google Scholar BibTeX。

- 输入：研究主题，以及可选的时间范围、语言和论文数量。
- 输出：`related_work.md` 和 `refs.bib`。
- 详细说明：[literature-related-work/README.md](literature-related-work/README.md)

安装 Prompt（与 SkillDock 页面一致）：

```text
检查刚下载的 literature-related-work-v1.0.0.zip，阅读其中的 SKILL.md，测试通过后安装到当前项目并告诉我如何触发使用。
```

使用 Prompt：

```text
请使用 $literature-related-work 调研气象降尺度方面的近期高质量研究，优先 CCF-A 和中科院一区论文，在同一份 related_work.md 中写成适用于 CCF-A 会议投稿的精简中文与英文单段式 Related Work；中文不超过 400 个汉字、英文不超过 180 个词，两段引用必须完全一致；同时生成 refs.bib。所有论文和引用必须真实，BibTeX 必须从 Google Scholar 直接获取。
```

## Draw.io 论文配图

根据参考图片或已有图表重建可编辑的 Draw.io 论文配图，并从同一份 `.drawio` 母版导出预览文件。

- 输入：论文配图参考图、已有 `.drawio` 文件、目标输出目录和导出格式。
- 输出：可编辑的 `.drawio`，以及按需生成的 PNG、SVG、PDF、HTML 或 JSON。
- 详细说明：[drawio-paper-figure/SKILL.md](drawio-paper-figure/SKILL.md)

安装 Prompt（与 SkillDock 页面一致）：

```text
检查刚下载的 drawio-paper-figure-v1.0.0.zip，阅读其中的 SKILL.md，测试通过后安装到当前项目并告诉我如何触发使用。
```

使用 Prompt：

```text
请使用 $drawio-paper-figure，根据我提供的论文配图参考图重建可编辑的 Draw.io 文件，保留 panel、模块、文字和箭头，不要嵌入整张参考图，并导出 PNG 和 SVG 预览。
```
