export type Tool = {
  slug: string;
  name: string;
  description: string;
  initials: string;
  color: string;
};

export const tools: Tool[] = [
  {
    slug: "codex",
    name: "Codex",
    description: "加载写作 Skill、读取论文 PDF、裁剪图表并在本地生成完整交付文件",
    initials: "CX",
    color: "#15251f",
  },
];

export const toolBySlug = Object.fromEntries(tools.map((tool) => [tool.slug, tool]));
