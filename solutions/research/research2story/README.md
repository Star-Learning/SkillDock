# Research2Story

这是一个下载后交给本地 AI Agent 使用的完整解决方案包。它不会在云端解决方案中心执行，也不会把用户的任务数据上传到中心。

## 使用方式

1. 解压方案包。
2. 使用 Codex 打开 `research2story/` 文件夹。
3. 把下面的任务交给 Agent：

   ```text
   请阅读 SKILL.md，调研主题“AI Agent Memory”，覆盖 2022—2026 年，输出中文结果到 outputs/。
   ```

4. Agent 会按需安装本地依赖并运行：

   ```bash
   npm run research -- --topic "AI Agent Memory" --start 2022 --end 2026 --lang zh --output outputs
   ```

也可以运行 `npm run dev`，在本地浏览器使用表单界面。

## 本地输出

- `research.md`：研究阶段、技术路线、论文与来源。
- `storyboard.json`：时间轴场景。
- `pics/` 与 `figures.json`：逐篇论文的真实代表图及来源。
- `index.html`：内嵌图片、带时间轴和浏览器旁白的独立动画。

## 免费数据源

默认使用 OpenAlex、arXiv、Crossref 和 ar5iv，不需要 API Key。论文主图优先匹配 architecture、framework、pipeline、overview 等图注；无法提取真实图片的论文不会进入动画。

可选的 OpenAI-compatible LLM 只用于润色讲解，不配置也能完成完整流程：

```env
LLM_BASE_URL=
LLM_API_KEY=
LLM_MODEL=
```

Venue 优先级位于 `config/venues.yaml`。
