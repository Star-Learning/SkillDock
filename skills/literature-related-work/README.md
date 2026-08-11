# 文献调研 Related Work

调研指定主题的近期高质量真实论文，优先 CCF-A 与中科院一区，生成可直接用于投稿的 Related Work 和对应 BibTeX。

## 调用

```text
请使用 $literature-related-work 调研气象降尺度方面的近期高质量研究，优先 CCF-A 和中科院一区论文，在同一份 related_work.md 中写成适用于 CCF-A 会议投稿的精简中文与英文单段式 Related Work；中文不超过 400 个汉字、英文不超过 180 个词，两段引用必须完全一致；同时生成 refs.bib。所有论文和引用必须真实，BibTeX 必须从 Google Scholar 直接获取。
```

## 交付

```text
output_dir/
├── related_work.md
└── refs.bib
```

`related_work.md` 使用 `[@citation_key]` 标注引文；默认覆盖 10–14 篇论文，且至少 70% 来自近五年。面向 CCF-A 会议投稿时，默认中文为 250–400 个汉字、英文为 120–180 个词；需要双语时，它会在同一文件内交付“中文版”和“English Version”，两个段落使用完全一致的引用键。`refs.bib` 只保存与正文引用一一对应、从 Google Scholar 原样复制的 BibTeX 条目。无法核验的论文不会被引用。
