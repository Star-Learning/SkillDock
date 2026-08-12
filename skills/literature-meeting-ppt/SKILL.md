---
name: literature-meeting-ppt
description: 面向中文科研组会和中文导师论文汇报，将一篇或多篇学术论文整理成中文为主、英文术语保真的 PPT 内容与页面结构，并用固定主题、字号层级、16:9 网格、页眉页脚和页面模板保持整套幻灯片风格一致。用于制作、改写、审阅论文汇报、文献组会、paper presentation、literature meeting 或学术汇报幻灯片，尤其适用于需要保留论文原始标题/模型/数据集/会议名称、围绕 Motivation→Challenge→Solution 讲清楚方法、优先使用论文原图并加入中文解释和汇报者判断的任务；不用于论文 Related Work 写作、公众号文章或脱离论文证据的研究结论生成。
---

# 中文组会论文汇报 PPT

将论文内容整理成“学生读完论文后给导师讲明白”的汇报，而不是把论文摘要或 Method Section 搬到幻灯片中。默认面向具有相关科研背景、但没有提前阅读论文的中文老师。

## 视觉一致性优先

默认采用统一的“中文组会蓝灰学术主题”。详细颜色令牌、字号、网格、组件和页面槽位见 [references/visual-system.md](references/visual-system.md)，制作前必须读取并锁定 `DECK_STYLE`。

- 同一份 PPT 只能有一套主题令牌、字体层级、圆角/线条风格、页眉、页脚和页面网格；不得逐页重新选模板或随机配色。
- 默认画布使用 16:9、`1280 × 720`、`72 px` 安全边距；有用户模板时以用户模板为准，并先提取其主题令牌。
- 每页先选 `cover`、`landscape`、`challenge`、`paper-intro`、`method`、`evidence`、`comparison`、`gap-idea` 或 `takeaway` 之一，再使用对应版式槽位。
- 先实现并复用 `addHeader`、`addFooter`、`addPaperFigure`、`addMetric`、`addBullet`、`addPill` 等组件，再填充论文内容；内容变化不应导致视觉系统变化。
- 每次生成或改稿都要渲染整套 PPT、查看 montage，并运行无溢出/重叠检查。后续改稿默认只改内容和图，不改主题、字号和网格。

## 图表与视觉素材

论文原图使用前先裁掉论文页眉、页码和图注，只保留 Figure 本体；使用 `contain` 等比例放入统一图槽位。图注与版权/来源信息放在 PPT 页脚或演讲备注，不要让原论文页面文字破坏组会版式。

## 工作流

### 1. 建立汇报主线

- 先确认汇报对象、论文数量、主题、时间限制和已有素材；信息不足时使用合理默认值，不要凭空补实验结果或论文事实。
- 每篇论文围绕 `Motivation → Challenge → Solution` 组织，并在结尾给出中文的“我的理解 / Key Takeaway”。
- 多篇论文按问题脉络组织：研究背景与趋势 → 各论文的核心方案 → 跨论文对比 → Research Gap → Research Ideas / Next Steps。
- 明确区分“论文作者的结论”和“汇报者自己的分析”。汇报者判断可使用“我认为”“从这些工作可以看到”“这里仍然存在”等措辞，但不能伪装成论文原文结论。

### 2. 设计每篇论文的内容卡片

至少整理以下信息：

- **Paper**：论文英文原始标题，不翻译后替换原题目。
- **Authors**：作者姓名。
- **Institution**：机构英文官方名称；必要时补充常用中文名，不强制翻译所有海外机构。
- **Venue**：会议或期刊原名与年份，如 `CVPR 2026`、`IEEE TGRS`。
- **Links**：尽可能提供可点击的 `Paper`、`Project`、`Code` 链接；没有链接时明确缺失，不要猜 URL。
- **Motivation**：依据 Introduction 和 Related Work 解释作者为什么做，而不是逐句翻译 Abstract。
- **Challenge**：用 1–3 个清晰的挑战说明难点，例如 `Domain Gap`、`Prompt Dependency`、`Semantic Understanding`。
- **Solution**：只提炼解决关键挑战的模块和信息流，优先使用 `Challenge → Design → Result` 或 `Input → Core Module → Reasoning → Prediction`。
- **Key Takeaway**：用中文说清这篇工作的真正价值、解决了什么，以及没有解决什么。

### 3. 选择与处理图表

遵循“用论文中的图讲论文，而不是用文字重新写论文”的原则。按以下优先级挑选，不能因为论文图多就全部放入 PPT：

1. `Overall Architecture / Main Method Figure`
2. `Motivation / Concept Figure`
3. 直观的 `Qualitative Results`
4. 能支撑关键结论的 `Important Analysis / Ablation`

当页面要解释整体结构、Method Pipeline、模块关系、输入输出、视觉效果、定性结果、数据分布或 Benchmark 设置时，优先寻找论文原图。论文原图无法获得或不适合使用时，再用忠实的简化图，并明确这是简化示意。

对复杂原图可以添加箭头、方框、编号、半透明高亮或简短中文标签，目的是提示老师看哪里，不是重新发明方法。不得删除关键模块、修改实验数值或图例、改变箭头关系、重绘出有歧义的结构，或伪造论文不存在的架构图。简化时优先采用“原始 Figure + 高亮解释”。

每张重要论文图旁必须有 1–3 条中文解释，至少回答：

- 这张图应该怎么看，最重要的区域是什么？
- 它说明或解决了前面的哪个 Challenge？
- 老师应重点注意什么？

不要只放 `Figure 2. Overall Architecture.`。解释应具体到模块职责和信息流，例如：`VLM：负责语义理解`、`Agent：负责决策与 Prompt 生成`、`SAM：负责像素级分割`，并补一句核心变化。所有论文 Figure 标注来源：未修改可写 `Source: Original paper`，有改动写 `Figure adapted from ...`，并尽量包含作者和 Venue。

### 4. 控制图文比例

不要为了填满页面而堆文字或强行找图：

- Method 页面：约 60–70% Figure，30–40% 中文解释。
- Motivation / Challenge 页面：约 40% Visual，60% 中文解释。
- Research Ideas 页面：使用简单的 `Gap → Idea` 逻辑图和少量文字；没有必要为了有图而找图。

结构用图，逻辑用文字，结论用一句话讲清楚。

## 语言规范

默认“中文为主，英文为辅”：中文负责讲清楚，英文负责保持学术原貌。禁止整套 PPT 全英文、把所有术语强行翻译成中文、用大段中英文重复表达同一内容。

以下内容原则上保留论文英文原文：

- 论文标题。
- 模型与方法名称，如 `SAM`、`CLIP`、`Mask2Former`、`iTransformer`、`PatchTST`、`TimeMixer`。
- Dataset / Benchmark，如 `ImageNet`、`LoveDA`、`Potsdam`、`LEVIR-CD`、`OpenEarthMap`。
- Conference / Journal，如 `CVPR 2026`、`NeurIPS 2025`、`IEEE TGRS`。
- 已广泛使用且中文翻译会妨碍理解的术语，如 `Foundation Model`、`Agent`、`Zero-shot`、`Open-vocabulary`、`Prompt`、`Token`、`Embedding`、`Transformer`、`Vision-Language Model`、`World Model`。

重要概念第一次出现时可写成“中文解释（English Term）”，后续直接使用英文，不要反复中英并列。页面标题默认用能直接告诉老师本页结论的中文句子，例如：

- `为什么现有 SAM 方法难以直接应用于遥感场景？`
- `核心思路：利用 VLM 自动生成 SAM 所需的 Prompt`
- `Paper 2：AgenticSeg 通过 Agent Loop 实现自动分割`

不要只写 `Motivation`、`Proposed Method` 或 `Paper 2 — Method` 这类无法表达本页意图的标题。背景、Motivation、Challenge、Solution 的自然语言解释、跨论文对比、研究趋势、Research Gap、Research Ideas、Next Steps 和 Key Takeaway 默认使用简洁中文。

## 汇报内容的深度与边界

- 解释面向“有相关科研背景、但未提前读论文”的中文老师：不讲基础常识，但要解释这篇论文与已有方法真正不同的地方。
- 不要把 PPT 做成“论文自动摘要”。允许加入有证据支撑的汇报者判断，但要标明视角；信息不足时保留不确定性并要求补充原论文或素材。
- 不要把一页论文图变成无解释页面，也不要把整篇 Method Section 搬上去。优先突出支撑核心贡献的模块、信息流和关键实验。
- 不要编造作者、机构、Venue、链接、数据、实验数值、消融结论或模型结构。无法验证时写“待核实”或省略，并向用户说明缺口。

## 推荐页面结构

根据时间和论文数量裁剪，不必每篇都制作同样多的页：

1. 汇报主题、论文范围和研究问题。
2. 背景 / Research Landscape：为什么要关注这个问题。
3. 论文选择依据与整体趋势。
4. 每篇论文：Paper 信息与链接 → Motivation → Challenge → Solution / 原图 → 关键实验或对比 → `我的理解 / Key Takeaway`。
5. 多篇论文的横向对比：问题、核心机制、依赖数据或 Prompt、优势、局限。
6. Research Gap、Research Ideas 和 Next Steps。

## 交付前检查

- 标题、模型、方法、Dataset、Benchmark、Venue 是否与原论文一致。
- 是否用中文回答了“为什么做、难在哪里、怎么解决、有什么启发、下一步怎么做”。
- 每篇论文是否都有 Motivation、Challenge、Solution 和中文 Key Takeaway。
- 关键结构页是否优先使用了合适的原图；每张图是否有 1–3 条中文解释与来源。
- 是否避免整套全英文、强行翻译专有名词和大段中英重复。
- 是否清楚区分论文结论与汇报者分析。
- 是否有未经证实的链接、数字、图例、模块或实验结论。
- 图文比例是否服务于理解，而不是为了填满页面。
