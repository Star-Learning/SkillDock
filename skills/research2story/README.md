# Research2Story

这是 SkillDock 中央仓库里的 Beta Skill。它由本地 Agent 调研并核验论文，为每篇入选论文提取真实代表图，生成研究报告和带旁白的 HTML 时间线。

## 调用

```text
请使用 $research2story，调研主题“AI Agent Memory”，覆盖 2022—2026 年，输出中文结果到 outputs/。
```

Agent 会按需安装本地依赖并运行：

```bash
npm run research -- --topic "AI Agent Memory" --start 2022 --end 2026 --lang zh --output outputs
```

## 输出

- `research.md`：研究阶段、技术路线、论文与来源。
- `storyboard.json`：时间轴场景。
- `pics/` 与 `figures.json`：逐篇论文的真实代表图及来源。
- `index.html`：内嵌图片、带时间轴和浏览器旁白的独立动画。

默认使用 OpenAlex、arXiv、Crossref 和 ar5iv，不需要 API Key。`SKILL.md` 是执行规范，`tests/prompts.json` 保存触发测试样例。
