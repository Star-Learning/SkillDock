# Draw.io 论文配图准则

本准则用于复杂论文图、模型结构图、算法流程图和多面板科学图。Draw.io 的 `.drawio` 文件是 XML，推荐生成未压缩的 `mxGraphModel`，便于审阅、版本控制和 Agent 修改。

## Panel inventory

在生成 XML 前记录：

```text
Canvas: 方向、宽高比、页面留白
Global flow: 从左到右、从上到下、循环或反馈
Panel A/B/...: 标题、边界、作用、内部对象、输入输出
Shared elements: 图例、分隔线、公式和图注
Critical text: 必须逐字保留的文字
Approximation: 可用原生 motif 简化的密集细节
Exports: drawio + png/svg/pdf/html/json
```

## 坐标与层级

Draw.io 使用左上角为原点的页面坐标。为每个 panel 记录 `(x, y, width, height)`，内部元素用局部 `u/v ∈ [0,1]` 映射；不要像 Visio 那样翻转 y 轴。让 `parent` 表达分组层级，保持 panel、module、legend 和 edge 的 ID 稳定。

## 常用样式

```text
panel: rounded=1;whiteSpace=wrap;html=1;fillColor=#F6F8FF;strokeColor=#4F6FB8;strokeWidth=1.2;fontFamily=Times New Roman;
module: rounded=1;whiteSpace=wrap;html=1;fillColor=#FFFFFF;strokeColor=#555555;strokeWidth=1;fontFamily=Times New Roman;
edge: edgeStyle=orthogonalEdgeStyle;rounded=0;html=1;endArrow=block;strokeColor=#333333;strokeWidth=1;
feedback: edgeStyle=orthogonalEdgeStyle;rounded=0;html=1;dashed=1;endArrow=open;
```

使用颜色表达语义，不要为了“好看”给每个小模块随机换色。论文图优先白底、浅色 panel、清晰边框和统一箭头。

## 可编辑性检查

- 主要对象必须是 `mxCell` + `mxGeometry`，文字放在 cell 的 `value` 中。
- 箭头应使用 `edge="1"` 并连接 `source`、`target`，不要画成无法维护的截图。
- 复杂细节可用矩形堆叠、节点、网格、迷你曲线和表格近似，但每个对象应能单独选择。
- 不生成压缩 Base64 diagram；不要把整张参考图作为 `shape=image` 或 `data:image` 放入最终母版。

## 导出策略

保存后的 `.drawio` 是唯一真源。用 Draw.io Desktop CLI 从它导出 PNG、SVG、PDF、HTML 或 JSON；不要为每种格式单独重画。PNG/SVG 用于论文预览和排版，PDF 用于打印或审阅，HTML 用于网页查看，JSON 适合结构化分析。

官方参考：

- https://www.drawio.com/docs/reference/diagram-generation/
- https://www.drawio.com/docs/manual/export/export-diagram/
- https://github.com/pengjunchi0/codex-visio-paper-figure-skill
