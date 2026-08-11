---
name: literature-related-work
description: Research a user-supplied academic topic and turn verified real papers into a cited Related Work section plus a Google Scholar-sourced BibTeX file. Use when the user asks for 文献调研、研究现状、相关工作、related work、论文综述、真实引用、refs.bib, especially when they require CCF-A or 中科院一区 papers and no fabricated references.
---

# Literature Research → Related Work

## 目标

围绕用户给出的研究主题检索并核验真实论文，交付可直接写入论文的 `related_work.md` 和对应的 `refs.bib`。

最终目录只能包含：

```text
output_dir/
├── related_work.md
└── refs.bib
```

默认使用中文；用户指定英文时改用英文。用户要求中英双语时，在同一份 `related_work.md` 中同时交付中文与英文版本。不要把检索记录、候选清单或浏览器导出物放入最终交付目录。

## 输入

接收研究主题，并尽量识别这些可选约束：时间范围、语言、篇幅、应用场景、目标论文数量、近期比例、段落式或分节式写法，以及出版物偏好。默认“优先 CCF-A 和中科院一区”表示优先级，不代表可以把未核实的分区或会议等级写成事实。

信息不足但不影响检索时，使用合理范围并在正文中避免过度概括；只有研究对象或时间边界会明显改变结论时才提问。

## 工作流

### 1. 拆解主题并建立候选池

- 将主题拆成任务、方法、数据/应用场景和近义词。例如“气象降尺度”同时检索 statistical downscaling、dynamical downscaling、deep-learning downscaling、climate downscaling 等术语。
- 对“研究现状”默认建立 **12–18 篇**的可用文献池；对于可直接投稿的单段式 Related Work，默认引用 **10–14 篇**已核验论文。除非主题本身很新，至少 70% 的引用应来自任务当日向前五年内，最多保留 1–2 篇奠基性经典文献。
- 覆盖不同技术分支，而不是重复选择同一路线的论文。对于气象降尺度，至少检查动力／统计基线、深度超分辨率、物理或守恒约束、极端事件、生成式或概率建模、跨区域／跨气候迁移等分支。
- 优先检索近年的高质量同行评审论文，同时保留少量奠定方法分支的经典论文。
- 优先级依次为：已核验的 CCF-A 论文、已核验的中科院一区期刊论文、其他可核验的高质量同行评审论文。为保证研究脉络完整，可以使用第三类论文，但不要把它们标成前两类。
- 通过论文出版社/会议官方页面、DOI 落地页、arXiv 官方页面、Crossref、OpenAlex、DBLP 或机构页面确认候选元数据；搜索结果摘要不能作为唯一证据。

### 2. 逐篇核验真实性

每一篇准备引用的论文都必须同时满足：

1. 找到可公开访问的原始记录（出版社、会议、DOI 或 arXiv）。
2. 在 Google Scholar 找到与原始记录一致的论文条目。
3. 核对题名、作者、年份和发表载体；有 DOI 时再核对 DOI。
4. 只有在查到对应年份、学科口径和官方/可信分区来源时，才标注“中科院一区”；只有在查到适用版本的 CCF 推荐列表时，才标注“CCF-A”。

题名相近、预印本与正式版对应关系不明、作者或年份冲突、只有二手转述的候选一律不引用。不要猜测 DOI、页码、会议等级、分区或引用次数。

### 3. 获取 BibTeX

对每一篇已核验论文：

1. 在 Google Scholar 打开该论文的“引用”菜单并选择 `BibTeX`。
2. 将出现的 BibTeX 条目原样复制到 `refs.bib`。不要用模型补写、Crossref/DBLP 自动条目或手工拼接替代。
3. 保留 Google Scholar 给出的 citation key；不要重命名 key 或编辑题名、作者、年份、期刊/会议等字段。
4. 若 Scholar 无法访问、出现 CAPTCHA、没有匹配条目或条目与原始记录冲突，停止使用该论文。无法获得真实 Scholar BibTeX 时，不得虚构条目或改用未经用户同意的来源。

如果 Google Scholar 需要用户完成登录或 CAPTCHA，明确说明阻塞原因并请用户处理；不要尝试绕过。

### 4. 写作 `related_work.md`

- 用 `[@citation_key]` 在文中标注引用；key 必须与 `refs.bib` 完全一致。
- 按研究脉络或方法分支组织，而不是逐篇翻译摘要。常见逻辑为：问题定义与早期范式 → 主要技术路线 → 近期进展与局限 → 本研究的定位。
- 当用户要求“用于 CCF-A 投稿的一段话”或未指定篇幅时，输出一个无标题、无列表、无检索说明的紧凑学术段落。以主题句建立问题，再按方法簇压缩组织近期工作，最后用一句指出技术缺口；不要逐条罗列“某某提出了”。默认控制在 **250–400 个中文汉字**，或 **120–180 个英文词**（均不计引用键）。仅在用户明确要求更长综述时放宽篇幅。
- 当用户要求“中文和英文两个版本”时，`related_work.md` 必须且只能按如下结构组织：

  ```markdown
  ## 中文版

  {一段可直接投稿的中文 Related Work}

  ## English Version

  {One publication-ready English Related Work paragraph}
  ```

  两段均应独立通顺、符合各自语言的学术表达，而不是逐字直译；两段必须使用完全相同的 `[@citation_key]` 集合，不能只在其中一段增加文献或事实主张。双语交付时，每个语言版本各自保持单段式，标题仅用于区分语言，不属于正文。默认中文控制在 250–400 个汉字、英文控制在 120–180 个词；通过合并同类方法的引用压缩篇幅，不牺牲关键方法分支和学术术语。
- 当用户没有指定篇幅但要求“研究现状”，优先保证覆盖面和近期性，再压缩为流畅文本；不要因为一段式写作而把文献数降到 5 篇以下。
- 每个可验证的具体判断紧跟至少一个引用。只依据已核验论文的原文、摘要或官方元数据写作；不要把检索摘要、模型记忆或推断当成论文结论。
- 把“优先 CCF-A 和中科院一区”落实为选文优先级，不要在正文中编造等级标签。确有完整核验记录时，可使用审慎表述。
- 不夸大结论。证据不足时使用“已有研究探索了”“在部分场景中报告了”等限定语。
- 使正文可直接复制进论文：不要包含检索过程、候选论文列表、未完成事项、模型自述或虚构的参考文献表。

## 交付前核验

先运行：

```bash
node scripts/validate-related-work.mjs --md output_dir/related_work.md --bib output_dir/refs.bib --min-citations 10 --min-recent-year {当前年份-5} --min-recent-share 0.7 --max-cjk-chars 400 --single-paragraph
```

若交付中英双语版本，改用：

```bash
node scripts/validate-related-work.mjs --md output_dir/related_work.md --bib output_dir/refs.bib --min-citations 10 --min-recent-year {当前年份-5} --min-recent-share 0.7 --max-cjk-chars 400 --max-english-words 180 --bilingual
```

然后人工确认：

- 每个 `[@key]` 在 `refs.bib` 中恰有一个 Google Scholar 原样条目。
- `refs.bib` 中没有未被正文使用的条目。
- 每篇论文都完成“原始记录 + Google Scholar”双重核验。
- 已覆盖目标主题的主要技术分支，且没有因一段式写作而遗漏近期高质量工作。
- CCF-A 和中科院一区标签均有对应的可核验依据；不能核验的就不标。
- 没有虚构的论文、作者、年份、DOI、出版社、等级、分区、实验结论或引用。
- 最终交付目录只保留 `related_work.md` 与 `refs.bib`。

校验脚本只检查引用键和 BibTeX 的结构一致性，不能证明论文真实存在；真实性核验仍是不可省略的人工步骤。

## 完成回复

完成后仅说明交付路径和已完成的真实性核验。若因无法获取 Google Scholar BibTeX 或无法核实论文身份而阻塞，明确说明缺口，不交付伪造或半成品引用。
