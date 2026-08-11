import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

function argument(name) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

function escapeXml(value) {
  return String(value).replace(/[<>&"']/g, (character) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;", "'": "&apos;" })[character]);
}

const outputPath = argument("--output");
const title = argument("--title") ?? "Paper Figure";
if (!outputPath) {
  console.error("用法: node scripts/new-drawio-scaffold.mjs --output figure.drawio [--title \"Paper Figure\"]");
  process.exit(2);
}

const safeTitle = escapeXml(title);
const xml = `<?xml version="1.0" encoding="UTF-8"?>
<mxfile host="app.diagrams.net" version="">
  <diagram id="page-1" name="Page-1">
    <mxGraphModel dx="1200" dy="800" grid="1" gridSize="10" page="1" pageScale="1" math="0" shadow="0">
      <root>
        <mxCell id="0" />
        <mxCell id="1" parent="0" />
        <mxCell id="title" value="${safeTitle}" style="text;html=1;align=center;verticalAlign=middle;fontFamily=Times New Roman;fontSize=20;fontStyle=1;fontColor=#222222;" vertex="1" parent="1">
          <mxGeometry x="80" y="40" width="640" height="50" as="geometry" />
        </mxCell>
        <mxCell id="input" value="Input" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#F6F8FF;strokeColor=#4F6FB8;fontFamily=Times New Roman;fontSize=14;" vertex="1" parent="1">
          <mxGeometry x="80" y="150" width="180" height="70" as="geometry" />
        </mxCell>
        <mxCell id="process" value="Process" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#FFFFFF;strokeColor=#555555;fontFamily=Times New Roman;fontSize=14;" vertex="1" parent="1">
          <mxGeometry x="350" y="150" width="220" height="70" as="geometry" />
        </mxCell>
        <mxCell id="output" value="Output" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#F4FBF5;strokeColor=#4E8B61;fontFamily=Times New Roman;fontSize=14;" vertex="1" parent="1">
          <mxGeometry x="660" y="150" width="180" height="70" as="geometry" />
        </mxCell>
        <mxCell id="edge-input-process" style="edgeStyle=orthogonalEdgeStyle;rounded=0;html=1;endArrow=block;strokeColor=#333333;" edge="1" parent="1" source="input" target="process">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="edge-process-output" style="edgeStyle=orthogonalEdgeStyle;rounded=0;html=1;endArrow=block;strokeColor=#333333;" edge="1" parent="1" source="process" target="output">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
      </root>
    </mxGraphModel>
  </diagram>
</mxfile>
`;

const destination = resolve(outputPath);
await mkdir(dirname(destination), { recursive: true });
await writeFile(destination, xml, "utf8");
console.log(`已生成 Draw.io 脚手架: ${destination}`);
