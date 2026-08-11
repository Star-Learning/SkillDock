---
name: paper-wechat-article-generator
description: Convert a research paper PDF into a Chinese WeChat official-account style Markdown article, with a sibling pics/ directory containing cropped individual paper figures/tables referenced by the Markdown. Use when the user provides a paper PDF and asks for a 公众号文章、论文解读、论文精读、paper reading、Markdown article, or md + pics output.

---

# Paper → 公众号 Markdown Article Skill

## 1. 目标

给定一篇论文 PDF，以及用户提供的论文元信息，生成一篇适合微信公众号发布的中文 Markdown 文章，并在同级目录下生成 `pics/` 文件夹保存文章图片。

最终交付物必须是：

```text
output_dir/
├── article.md
├── paper.pdf 或原始论文 PDF
└── pics/
    ├── fig_01_cover.png
    ├── fig_02_motivation.png
    ├── fig_03_method_overview.png
    └── ...
```

`article.md` 中的所有图片路径必须是相对路径，例如：

```markdown
![图1：方法整体框架](pics/fig_03_method_overview.png)
```

严禁出现：

```markdown
C:\Users\...\Typora\typora-user-images\xxx.png
/mnt/data/xxx.png
file:///xxx
```

## 2. 输入要求

用户通常会提供：

1. 论文 PDF：作为事实依据和图片来源。
2. 论文元信息：
   - 论文题目
   - 论文链接
   - 论文代码
   - 发表时间
3. 可选：示例 Markdown 或参考风格。

如果用户没有提供某项元信息，按以下规则处理：

- 论文题目：优先从 PDF 首页读取；仍无法确定则询问用户。
- 论文链接：优先使用用户提供的论文主页；若 PDF 明确给出 arXiv 编号，则使用规范链接 `https://arxiv.org/abs/{arxiv_id}`；若明确给出 DOI，则使用 `https://doi.org/{doi}`；均无法确认时写 `暂无`，不要根据标题猜测链接。
- 论文代码：优先使用用户提供代码仓库；没有公开代码则写 `暂无公开代码`，不要编造 GitHub 链接。
- 发表时间：优先使用用户提供时间；PDF 或 arXiv 信息明确时可补充；不确定则写 `暂无`。
- 论文 PDF：必须保留在 `article.md` 同级目录中。如果输入 PDF 不在输出目录，应复制到输出目录并使用稳定英文文件名（优先保留原文件名，必要时命名为 `paper.pdf`）。PDF 属于交付文件，但默认不要把它作为第五项加入文章顶部基本信息。

## 3. 固定文章结构

生成的 Markdown 必须保持下面的一级内容结构。标题可以用 `#`，正文大节统一用 `##`。

```markdown
# {公众号标题，可直接使用论文题目，也可写成更适合传播的中文标题}

- **论文题目：** {paper_title}
- **论文链接：** {paper_url_or_暂无}
- **论文代码：** {code_url_or_暂无公开代码}
- **发表时间：** {publish_time}

![封面图](pics/fig_01_cover.png)

## 摘要

...

## 背景

...

## 方法

...

## 实验

...

## 结论

...
```

不要额外新增与用户要求冲突的同级大标题。可以在 `## 方法` 内使用 `### 1、核心框架`、`### 2、关键模块拆解`；可以在 `## 结论` 末尾加入“未来方向”小节，但不要把它提升为新的 `##` 大标题，除非用户明确要求。

### 3.1 顶部基本信息严格格式

`article.md` 的一级标题后必须紧跟以下四行基本信息，字段名、顺序、项目符号和空格均保持一致：

```markdown
- **论文题目：** IR275K: A Benchmark for Infrared Multi-Frame Super-Resolution Toward Efficient Remote Sensing
- **论文链接：** https://arxiv.org/abs/2607.22380
- **论文代码：** https://github.com/InfraRecon7/IR275K
- **发表时间：** 2026 年 7 月 24 日（arXiv v1）
```

要求：

- 只能包含 `论文题目`、`论文链接`、`论文代码`、`发表时间` 四项，不得增添作者、机构、PDF 原文、期刊、会议等第五项。
- 每项使用 `- ` 开头；字段名使用加粗格式；中文冒号放在加粗范围内；字段后保留一个空格。
- 论文链接和论文代码直接写完整 URL，不要写成 `[arXiv](...)`、`[GitHub](...)` 等 Markdown 锚文本。
- 四项即使缺失也必须保留。缺失时分别写 `暂无` 或 `暂无公开代码`，不要删除整行。
- 发表时间优先写首次公开日期；若为 arXiv，统一使用 `YYYY 年 M 月 D 日（arXiv vN）`。
- 不要在这四项之间插入空行、说明文字或其他元数据。

### 3.2 PDF 原文交付规则

论文 PDF 必须与 `article.md` 一起交付，但默认不在顶部基本信息中增加 `PDF 原文` 字段。

要求：

- 如果输入 PDF 已在输出目录中，保留原文件，不重复复制。
- 如果从外部路径读取 PDF，最终交付前把 PDF 放入 `article.md` 同级目录。
- 如果目录中只有一个 PDF，默认它就是本文原文。
- 如果目录中有多个 PDF，优先选择与论文标题、arXiv 编号或用户指定文件名匹配的 PDF；仍无法判断时再询问用户。
- 不要在 Markdown 中写本地绝对路径或 `file:///...`。
- 只有用户明确要求在文章中提供 PDF 下载入口时，才在四项基本信息之外单独增加相对路径链接。

### 3.3 默认篇幅控制

除非用户明确要求“长文”“深度精读”或“完整复现式解读”，默认生成**中短篇公众号文章**：

- 正文建议控制在 **2200–3200 个中文字符**，最多不要超过 **3500 个中文字符**。
- `## 方法` 是重点，但也要克制：通常拆 **2–3 个关键点** 即可，不要把论文每个小节都搬进来。
- `## 实验` 必须明显短于 `## 方法`，默认控制在 **350–600 个中文字符**。
- 图片默认 **3–5 张**，实验图默认 **1 张**，必要时最多 **2 张**。
- 不要为了覆盖论文完整性而增加篇幅；优先保留“读者理解主线所必需”的内容。

建议篇幅分配：

- `## 摘要`：1 个引用块 + 4–5 条 bullet。
- `## 背景`：3–5 个短段落或 3 条痛点。
- `## 方法`：全文相对最详细，但只讲 2–3 个核心机制。
- `## 实验`：只讲“任务/指标/主结果/局限”，默认不要拆小节。
- `## 结论`：1 个引用块 + 3 条贡献 + 1–2 条未来方向。

## 4. 写作风格

文章面向微信公众号读者，定位是“让懂 AI / 遥感 / 地学的人快速读懂论文”。风格要求：

- 中文为主，保留必要英文术语，例如 `Foundation Model`、`mIoU`、`Knowledge Graph`。
- 口语化但不低幼，适合公众号发布。
- 多用短段落，避免连续大段文字。
- 默认写成“短而清楚”的解读，不写成逐节论文笔记。
- 允许少量使用强调符号：`👉`、`📌`、`✅`、`> 引用块`，但不要堆砌。
- 关键结论、创新点、实验提升要加粗。
- 技术解释遵循：先讲“它想解决什么问题”，再讲“怎么做”，最后讲“为什么有效”。
- 复杂公式不要直接堆出来，应翻译成直观解释；公式很关键时可保留并加一句通俗解释。
- 不要写成论文摘要翻译，也不要写成审稿意见。
- 不夸大贡献：除非论文明确说明，不要使用“首次”“彻底解决”“碾压”等绝对化措辞。

推荐表达模板：

```markdown
一句话概括：

> **这篇论文的核心不是重新训练一个更大的模型，而是把某种先验知识变成一个可以约束模型输出的模块。**
```

```markdown
👉 核心问题：
**能不能在不增加大量标注成本的前提下，让模型具备更强的物理/语义/结构约束？**
```

## 5. 内容生成规则

### 5.1 摘要：优先分条写

`## 摘要` 必须尽量采用分条结构，而不是连续大段文字。它要让读者在 30 秒内知道这篇论文值不值得继续看。

建议结构：

```markdown
## 摘要

一句话概括：

> **{用一句话讲清楚论文最核心的思路。}**

这篇论文主要解决的是：

- **问题：**{论文要解决什么问题，不要照搬 abstract。}
- **方法：**{论文提出了什么方法/框架/模块。}
- **创新：**{最关键的新意是什么，例如外部知识、物理先验、轻量插件、无需重训练等。}
- **结果：**{实验带来了什么提升；没有可靠数字时只写趋势。}
- **意义：**{为什么这个方法对遥感 / 地学 / AI4Earth / 目标任务有价值。}
```

长度建议：1 个引用块 + 4–6 条 bullet。除非用户要求长文，否则摘要不要写成 5–6 个自然段。

写作注意：

- 每条 bullet 尽量控制在 1–2 行。
- 具体数值必须来自 PDF；看不清或无法确认时写“多数设置下有稳定提升”。
- 摘要不要堆公式、不要展开实验细节。

### 5.2 背景

`## 背景` 要讲清楚“为什么需要这篇论文”。

必须包含：

- 当前主流方法依赖什么。
- 这些方法的问题是什么。
- 为什么这个问题在遥感 / 地学 / AI4Earth 场景中特别重要。
- 最后用一句话提出核心问题。

推荐结构：

```markdown
我们平时做 {task}，通常依赖 {main_input_or_paradigm}。

但现实问题是：{real_world_issue}。

论文指出了几个核心痛点：

- ① ...
- ② ...
- ③ ...
- ④ ...

👉 核心问题：
**{one_sentence_research_question}**
```

### 5.3 方法

`## 方法` 是全文重点。

必须做到：

- 先放整体框架图，必须是论文中的单独 figure / table 裁剪图，不能整页 PDF 截图。
- 再拆成 2–3 个关键模块；只有在用户明确要求深度长文时，才扩展到 4–5 个模块。
- 每个模块按照“目的 → 做法 → 直观理解 → 作用”来写。
- 尽量使用 `Step 1 / Step 2 / Step 3`。

推荐结构：

```markdown
## 方法

### 1、核心框架

下面这张图是论文的整体框架图。注意，它不是简单地把更多模态塞进模型，而是把外部先验转化成一个可插拔的约束/修正模块。

![图：核心框架](pics/fig_03_method_overview.png)

这篇论文的方法可以拆成三步：

- Step 1：...
- Step 2：...
- Step 3：...

### 2、关键模块拆解

#### Step 1：{module_1_name}

![图：模块1](pics/fig_04_module_1.png)

这个模块的作用是：**...**

做法上，作者首先 ...

直观理解就是：

> **...**
```

### 5.4 实验：浓缩写，不逐图逐表复述

`## 实验` 要“解释核心证据”，不要把论文所有实验都搬进公众号。目标是让读者快速理解：方法有没有用、为什么可信、还有什么需要注意。

推荐控制在：

- 1 个短段落 + 1 组 bullet；
- 1 组核心 bullet，最多 4 条；
- 默认 1 张图，必要时 2 张，严禁超过 2 张；
- 总长度默认 350–600 个中文字符；
- 不逐表复述所有数字。
- 默认不要在 `## 实验` 内使用 `###` 小标题；只有实验设计特别复杂、用户要求长文时才拆成 2 个以内的小节。

必须包含：

- 数据集 / 任务 / baseline 的一句话说明。
- 核心指标，例如 `mIoU`、`F1`、`OA`、`RMSE` 等。
- 主结果：只写最关键的提升范围或趋势。
- 关键证据：优先选择一个主表 + 一个消融或可视化。
- 局限性：至少指出一个需要注意的问题。

推荐结构：

```markdown
## 实验

实验部分可以浓缩成一句话：作者主要验证 `{method_name}` 是否真的带来稳定收益，以及这些收益是否可信。

- **对比对象：**{baseline 或 backbone 简述}
- **评价指标：**{mIoU / F1 / OA / RMSE 等}
- **核心结果：**{只写最重要的提升范围或总体趋势，不逐项列数字}
- **需要注意：**{一个局限或适用边界}

![图：主实验结果](pics/fig_08_quantitative_results.png)

从主结果可以看到，{method_name} 的收益主要体现在 {key_observation}。这里不需要逐个复述表格数字，读者只要抓住趋势即可：**{one_sentence_takeaway}**。

不过也要注意，{limitation}。这意味着它更适合作为 {appropriate_use_case}，而不是 {overclaim_to_avoid}。

如果可视化或消融对理解非常关键，可以再补一张图；否则不要继续贴图，也不要继续展开新的实验小节。

<!-- 可选，只有确有必要时保留 -->
![图：定性可视化](pics/fig_09_qualitative_results.png)

可视化结果更直观：原始模型容易在 {failure_case} 上出错，而加入 {key_module} 后，边界 / 小目标 / 物理一致性 / 语义一致性 得到了改善。

不过也要注意，{limitation}。这意味着它更适合作为一种“轻量增强/约束模块”，而不是替代所有主干模型的万能方案。
```

写作禁忌：

- 不要连续贴 4–6 张实验图。
- 不要把每个数据集、每个 backbone 的数字逐个写一遍。
- 不要把实验部分写得比方法部分还长。
- 不要把论文 `Results` 章节逐段改写；只提炼最能支撑结论的证据。
- 默认不要写 `### 1、...`、`### 2、...`、`### 3、...` 这种多小节实验结构。
- 不要同时写“主结果、消融、可视化、效率、案例研究、局限性”六块；只选最关键的 2–3 个证据点。
- 如果实验图很多，只保留“主结果表/图”和“最能说明问题的可视化/消融图”。

### 5.5 结论

`## 结论` 要简短有力。

必须包含：

- 一句话总结。
- 3–5 条核心贡献。
- 1–3 条可延伸方向。

推荐结构：

```markdown
## 结论

用一句话总结：

> **这篇论文的价值在于，它提供了一种把外部先验转化为模型约束的轻量化范式。**

核心贡献：

- ✅ ...
- ✅ ...
- ✅ ...

### 🔮 未来方向

这个思路后续可以继续扩展到：

- ...
- ...
- ...
```

## 6. 图片处理规则

### 6.1 图片来源优先级：只用单独 figure / table，不用整页 PDF

文章中的图片应尽量来自论文里的**单独 figure、table、框架图、可视化结果图**。不要直接把整页 PDF 渲染成图片后插入文章。

图片来源优先级如下：

1. **PDF 中可直接抽取的原始图片对象**，例如论文里的 figure、框架图、可视化图。
2. **从 PDF 页面中裁剪出的单独 figure / table 区域**，例如 Figure 1、Table 2、方法总览图、结果柱状图。
3. **根据论文内容重绘的流程图 / 示意图**。重绘时图片说明必须写清楚“根据论文内容整理/重绘”。

严禁：

- 将整页论文 PDF 作为正文图片插入。
- 将整页截图命名成 `method_overview` 或 `results`。
- 使用示例 Markdown 中的 Typora 本地图片路径。

仅在以下场景允许使用接近整页的图片：

- 用户明确要求“整页截图”；
- PDF 本身是海报 / PPT 风格，单页就是一个完整信息图；
- 作为文章封面图时，且需要裁掉页边距、页眉页脚、空白区域。

即使在这些例外场景，也要优先裁剪出图的主体区域，而不是保留完整 PDF 页面。

### 6.2 图片选择原则

一般生成 3–5 张图，至少包括：

- 封面图 / teaser 图：优先使用论文图形摘要、方法总览图、首页视觉元素裁剪图；不要直接放整页首页。
- 方法总览图：必须是单独裁剪的 framework figure。
- 背景或问题动机图：可选；只有对理解问题非常关键时才加入。
- 关键模块图 0–1 张：只保留真正需要解释的模块图。
- 实验结果图默认 1 张，必要时 2 张：优先主结果表/图；只有定性可视化特别有解释力时再加入。

如果论文图片很多，不要全部抽取。只选对公众号叙事最有用的图。

### 6.3 图片裁剪质量要求

每张图片必须满足：

- 只包含目标 figure / table 主体和必要标题/图例。
- 不包含整页页眉、页脚、页码、大段正文、参考文献区域。
- 四周保留 5–20 px 安全边距，不要贴边裁断。
- 分辨率清晰，宽度建议不低于 1200 px。
- 图内文字可读；如果原图过小，应提高渲染倍率后再裁剪。

### 6.4 图片命名

统一使用英文小写 + 序号，避免中文文件名导致部署或公众号编辑器路径异常。

```text
pics/fig_01_cover.png
pics/fig_02_motivation.png
pics/fig_03_method_overview.png
pics/fig_04_module_pckg.png
pics/fig_05_module_synthetic_data.png
pics/fig_06_priorseg.png
pics/fig_07_loss.png
pics/fig_08_quantitative_results.png
pics/fig_09_qualitative_results.png
```

### 6.5 图片插入规则

每张图插入前后都要有解释，不能连续堆图。

推荐：

```markdown
下面这张图是论文的整体框架，可以看到方法并不是重新训练一个大模型，而是在已有模型后面加入一个轻量修正模块。

![图3：方法整体框架](pics/fig_03_method_overview.png)

这张图的关键在于：...
```

## 7. 推荐的图片抽取与裁剪脚本

当需要从 PDF 生成 `pics/` 时，优先使用 PyMuPDF。工作流分两步：

1. 尝试抽取 PDF 内嵌图片对象。
2. 对无法直接抽取的 figure/table，从高分辨率页面渲染图中裁剪局部区域。

### 7.1 抽取 PDF 内嵌图片对象

```python
from pathlib import Path
import fitz  # PyMuPDF

pdf_path = Path("paper.pdf")
out_dir = Path("pics")
out_dir.mkdir(exist_ok=True)

doc = fitz.open(pdf_path)
img_id = 1
for page_index in range(len(doc)):
    page = doc[page_index]
    for img in page.get_images(full=True):
        xref = img[0]
        base = doc.extract_image(xref)
        image_bytes = base["image"]
        ext = base.get("ext", "png")
        out_path = out_dir / f"raw_page{page_index+1:02d}_img{img_id:02d}.{ext}"
        out_path.write_bytes(image_bytes)
        img_id += 1
```

抽取后必须人工/程序筛选：删除 logo、小图标、纹理、无意义背景，只保留论文 figure / table 主体图。

### 7.2 从页面中裁剪单独 figure / table

如果内嵌图片无法直接抽取，使用页面局部裁剪。注意：`clip` 必须框住单独 figure/table，不能框住整页。

```python
from pathlib import Path
import fitz  # PyMuPDF

pdf_path = Path("paper.pdf")
out_dir = Path("pics")
out_dir.mkdir(exist_ok=True)

doc = fitz.open(pdf_path)

# 0-based page index; 坐标单位为 PDF point，需要根据页面实际尺寸调整
crops = [
    # (page_index, filename, (x0, y0, x1, y1))
    (2, "fig_03_method_overview.png", (45, 90, 550, 430)),
    (4, "fig_04_module_detail.png", (55, 120, 540, 500)),
    (7, "fig_08_quantitative_results.png", (40, 95, 560, 420)),
]

for page_index, filename, box in crops:
    if page_index >= len(doc):
        continue
    page = doc[page_index]
    clip = fitz.Rect(*box)
    pix = page.get_pixmap(matrix=fitz.Matrix(3, 3), clip=clip, alpha=False)
    pix.save(out_dir / filename)
```

### 7.3 自动去除白边

裁剪后可进一步去除白边，但不要裁掉坐标轴、图例、标题。

```python
from PIL import Image, ImageChops
from pathlib import Path

for path in Path("pics").glob("*.png"):
    img = Image.open(path).convert("RGB")
    bg = Image.new("RGB", img.size, img.getpixel((0, 0)))
    diff = ImageChops.difference(img, bg)
    bbox = diff.getbbox()
    if bbox:
        # 留一点边距，避免裁掉图例/文字
        pad = 12
        x0, y0, x1, y1 = bbox
        x0 = max(0, x0 - pad)
        y0 = max(0, y0 - pad)
        x1 = min(img.width, x1 + pad)
        y1 = min(img.height, y1 + pad)
        img.crop((x0, y0, x1, y1)).save(path)
```

## 8. 事实一致性要求

生成文章必须以 PDF 为准。

不得编造：

- 数据集名称。
- 指标数值。
- 提升幅度。
- 代码仓库。
- 发表会议 / 期刊。
- 作者单位。
- 消融实验结论。

如果 PDF 中没有明确给出，就写成不确定表达：

```markdown
论文中主要展示了 ...
```

而不是：

```markdown
作者证明了 ...
```

所有具体数字必须来自论文，例如：

```markdown
实验结果显示，该方法在多个设置下带来了约 **1%–6%** 的 mIoU 提升。
```

如果只在图中看到数字但无法可靠确认，写：

```markdown
从图中可以看到，该方法在多数 backbone 上都有提升趋势。
```

## 9. 输出前检查清单

交付前逐项检查：

- [ ] 是否生成 `article.md`。
- [ ] 是否生成同级 `pics/` 目录。
- [ ] 是否在 `article.md` 同级目录保留或复制了论文 PDF 原文。
- [ ] `article.md` 顶部是否严格按顺序包含且只包含 `论文题目`、`论文链接`、`论文代码`、`发表时间` 四项基本信息。
- [ ] 论文链接和论文代码是否直接显示完整 URL，而不是 Markdown 锚文本。
- [ ] 顶部基本信息是否没有作者、机构、PDF 原文、期刊或会议等额外字段。
- [ ] `article.md` 中所有图片是否都使用 `pics/xxx.png` 相对路径。
- [ ] `pics/` 中是否真实存在所有被引用图片。
- [ ] 图片是否都是单独 figure / table / 重绘示意图，而不是整页 PDF 截图。
- [ ] 图片是否去除了明显页眉、页脚、页码、大段正文和空白边距。
- [ ] 是否包含论文题目、论文链接、论文代码、发表时间。
- [ ] 是否包含固定大节：`摘要`、`背景`、`方法`、`实验`、`结论`。
- [ ] 摘要是否采用分条结构，而不是连续长段落。
- [ ] 全文是否控制在默认中短篇幅内，没有写成逐节论文笔记。
- [ ] 实验部分是否足够浓缩，明显短于方法部分，没有逐图逐表堆砌。
- [ ] 实验图是否默认 1 张、必要时不超过 2 张。
- [ ] 是否删除所有 Windows 本地路径和绝对路径。
- [ ] 是否没有编造论文链接、代码链接、实验数值。
- [ ] 是否对每张图进行了上下文解释。
- [ ] 是否符合公众号风格：短段落、重点加粗、解释清楚。

## 10. 最终回复格式

当完成任务后，只需简洁回复用户：

```markdown
已完成，包含：

- article.md
- pics/ 图片目录

下载：{artifact_link}
```

如果打包为 zip，zip 内部结构必须保持：

```text
article.md
paper.pdf 或原始论文 PDF
pics/
```
