# 论文公众号文章生成器

这是 SkillDock 中央仓库里的正式 Skill。它由本地 Agent 读取论文 PDF、裁剪关键图表，并生成中文公众号 Markdown 文章。

## 调用

```text
请使用 $paper-wechat-article-generator，把我提供的论文 PDF 写成中文公众号解读文章，并将 article.md、paper.pdf 和 pics/ 保存到指定输出目录。
```

## 输出

```text
output_dir/
├─ article.md
├─ paper.pdf
└─ pics/
```

`SKILL.md` 是完整执行规范，`tests/prompts.json` 保存正向与反向触发样例。源码修改后应先测试，再由 SkillDock 同步到 Codex 安装目录。
