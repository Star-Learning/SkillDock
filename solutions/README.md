# 解决方案目录

`solutions/` 是方案中心唯一需要手工维护的内容目录。一项需求对应一个文件夹；云端只读取说明并分发方案包，实际任务由用户下载后交给本地 AI Agent 执行。

## 目录规则

```text
solutions/
├─ media/                         自媒体 / 公众号
│  └─ <solution-slug>/
│     ├─ solution.json            页面数据与使用说明
│     ├─ SKILL.md                 Agent 执行规范
│     ├─ README.md                可选的人类说明
│     └─ resources/               可选的 Skill、Workflow 或其他资源
├─ research/                      学术科研
│  └─ <solution-slug>/
└─ _template/                     新建方案模板
```

文件夹名称必须使用小写英文、数字和连字符，并与 `solution.json` 的 `slug` 一致。

## 新建需求

```bash
npm run solution:new -- research literature-review "文献调研与综述"
```

大类只能是：

- `media`：自媒体 / 公众号
- `research`：学术科研

命令会创建一个 `stage: draft` 的目录。运行 `npm run solutions:sync` 后，它会出现在对应分类的“待整理需求”中。

## 转为正式方案

将 `solution.json` 补充为 `solutions/_template/ready.solution.json` 的结构，并把 `stage` 改为 `ready`。正式方案至少要说明：

- 输入什么
- 怎么使用
- 输出什么
- 功能流程
- 可直接复制的 Prompt
- 本地 Agent 交付配置 `delivery`

同步器会把整个正式方案目录打包成 `delivery.packageFileName` 指定的 ZIP。若还有可以单独下载的 Skill 或 Workflow，将文件放进 `resources/` 并登记。

`delivery` 还必须声明语义化版本和本地运行要求。方案包文件名应以 `-v<version>.zip` 结尾，例如：

```json
{
  "delivery": {
    "mode": "agent-local",
    "version": "1.0.0",
    "packageFileName": "example-solution-v1.0.0.zip",
    "agents": ["Codex"],
    "requires": ["Node.js 20+"]
  }
}
```

不要在方案目录中放置 `.env`、真实密钥、私钥、凭证、日志或用户输出。同步器会在公开打包前检查这些内容，并为通过检查的 ZIP 生成同名 `.sha256` 校验文件。

## 独立代码仓库

代码可以继续保存在独立仓库，案例目录只登记地址：

```json
{
  "repository": {
    "type": "git",
    "location": "https://example.com/your/repository",
    "note": "可选说明"
  }
}
```

本地独立仓库可使用 `type: local` 和绝对路径；不建议把另一个完整仓库复制进本案例库。

## 同步与检查

```bash
npm run solutions:sync
npm run typecheck
npm run lint
npm run build
```

启动开发或生产构建前会自动同步，无需手工修改 `data/` 中的兼容入口。
