---
name: drawio-paper-figure
description: Rebuild scientific paper figures from reference images or existing diagrams as native, editable draw.io .drawio XML, then validate and export PNG, SVG, PDF, HTML, or JSON previews. Use when the user asks for论文配图、模型结构图、流程图、架构图、图片转可编辑图、Draw.io绘图、修改图表配色或布局; do not use for ordinary image editing, data plotting from raw numeric tables, or flat screenshot insertion.
---

# Draw.io Paper Figure

根据参考图片、截图或已有 `.drawio` 文件重建论文配图，并把 `.drawio` 作为唯一可编辑源文件。这个 Skill 是对公开 Visio 论文绘图工作流的 Draw.io 改造版：不使用 Visio COM、不生成 `.vsdx`，最终交付面向 Draw.io Desktop 或 app.diagrams.net。

## 核心规则

- 最终母版必须是未压缩、可读的 `.drawio` XML，包含可单独编辑的 `mxCell`、`mxGeometry`、文本、连线和分组。
- 参考图只能用于分析或临时描摹，不能把整张 PNG/JPG 作为最终页面底图；小型图标或明确要求保留的局部素材应单独说明来源。
- 先保证画布、面板、阅读顺序和数据流正确，再补充装饰细节。复杂图先建立面板清单和边界，再用面板局部坐标绘制内部元素。
- `.drawio` 是唯一源文件；PNG、SVG、PDF、HTML、JSON 都必须从保存后的同一份 `.drawio` 导出，不要为不同格式分别重画。
- 论文图默认使用 Times New Roman；技术架构图可使用 Arial/Helvetica。保持字体、线宽、箭头和颜色语义一致。

## 工作流

### 1. 检查输入并备份

确认参考图片、已有 `.drawio`、目标输出目录和需要的导出格式。已有文件在写入前复制备份；不要覆盖用户未明确指定的文件。先读取 `references/drawio-guidelines.md`，需要复杂多面板重建时按其中的清单执行。

### 2. 分析参考图

记录以下内容：

- 画布宽高比、留白和页面方向。
- 主要 panel、列、行、标题、图例和分隔线的边界。
- 阅读顺序、输入输出、正向箭头、反馈虚线和连接语义。
- 模块、节点、表格、热图、曲线、公式和重复 motif。
- 文字层级、字体、字号、填充色、边框色、圆角和线宽。
- 必须逐字保留的标题、模块名、编号和图注。

先写出简短的 panel inventory，再开始生成 XML。对于密集图，使用 `u/v ∈ [0,1]` 的 panel-local 坐标映射到全局画布；Draw.io 原点在左上角，不要沿用 Visio 的纵坐标翻转。

### 3. 生成原生 Draw.io XML

使用以下结构：

```xml
<mxfile host="app.diagrams.net" version=""><diagram id="page-1" name="Page-1"><mxGraphModel><root>
  <mxCell id="0" />
  <mxCell id="1" parent="0" />
  <mxCell id="panel-a" value="Panel A" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#F5F8FF;strokeColor=#4F6FB8;" vertex="1" parent="1">
    <mxGeometry x="40" y="40" width="360" height="220" as="geometry" />
  </mxCell>
  <mxCell id="edge-a-b" style="edgeStyle=orthogonalEdgeStyle;rounded=0;html=1;endArrow=block;" edge="1" parent="1" source="panel-a" target="panel-b">
    <mxGeometry relative="1" as="geometry" />
  </mxCell>
</root></mxGraphModel></diagram></mxfile>
```

保持 ID 稳定且有语义；panel、module、legend、edge 使用不同前缀。分组用 `parent` 表达层级，边用 `source` 和 `target` 连接真实对象。不要生成压缩 Base64 `<diagram>`，这样便于 Agent、Git 和人工检查。

### 4. 导出和验证

先用结构检查脚本：

```bash
node scripts/validate-drawio.mjs --input output/figure.drawio --min-vertices 1 --require-uncompressed --require-native-shapes
```

安装 Draw.io Desktop 后，可使用：

```powershell
powershell -ExecutionPolicy Bypass -File scripts/export-drawio.ps1 `
  -DrawioPath "output\figure.drawio" `
  -ExportFormats png,svg,pdf,html `
  -OutputDir "output\exports"
```

若本机没有 Draw.io Desktop，仍然可以交付并验证 `.drawio` XML；不要为了导出而上传含有论文或未公开数据的图到第三方服务。导出后检查每个文件存在且非空，并打开 PNG/SVG 预览检查文字溢出、箭头穿越、面板重叠和局部元素越界。

## 编辑与重建策略

- **完整重建**：先画画布、panel 和主数据流，再画模块、文本、节点和图例，最后统一字体、边框和分组。
- **样式迁移**：先按 ID、文本和父级定位目标 cell，只修改 `fillColor`、`strokeColor`、`fontColor`、`fontSize`、`fontFamily`、`strokeWidth` 和 `dashed` 等样式，不要做全局颜色替换。
- **已有图修改**：保留原始 ID 和层级；写入前备份，修改后重新校验 XML 和预览。
- **复杂 motif**：用可复用的矩形堆叠、节点连线、热图网格、迷你曲线和表格表示，不能把这些元素合并成一张截图。
- **数据图表**：如果用户提供真实数值，优先让 Agent 用数据绘图工具生成可复现的 SVG/PNG；本 Skill 只负责把结果作为明确的图形资源或简化的可编辑 motif 纳入论文图。

## 验收标准

- `.drawio` 可以在 Draw.io Desktop 或 app.diagrams.net 打开。
- 主要 panel、模块、标题、编号、箭头和图例与参考图的结构和阅读顺序一致。
- 文字、形状、连线和分组可单独编辑，没有整图参考图片冒充重建结果。
- 子模块没有明显越界、跨 panel 串区、相邻 panel 重叠或文字溢出。
- 请求的 PNG/SVG/PDF/HTML/JSON 均从保存后的同一份 `.drawio` 导出且非空。
- 交付时说明母版路径、备份路径、预览路径、导出格式和任何无法辨认或需要人工修正的内容。

## 不适用和安全边界

- 只需要裁剪、抠图、放大或普通图片美化时，不要触发本 Skill。
- 不把论文 PDF、截图或本地数据上传到未获用户授权的在线服务。
- 不删除原始文件，不结束用户的 Draw.io 进程；遇到锁定或导出失败时先报告原因。
