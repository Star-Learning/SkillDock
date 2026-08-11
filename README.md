# SkillDock

一个简洁的公开 Agent Skill 库。维护者在本地通过 AI Agent 管理、测试和发布 Skill，使用者无需登录即可浏览、下载并安装到自己的 Agent 中。

![SkillDock 首页](docs/assets/homepage.png)

## 主要功能

- 按分类浏览和搜索 Skill
- 查看使用说明、版本和测试结果
- 下载版本化 Skill 压缩包
- 统计浏览、点击、使用和下载次数

## 本地运行

```bash
npm install
npm run build
npm start
```

打开 [http://localhost:3000](http://localhost:3000)。

## 腾讯云部署

项目已提供 `Dockerfile` 和 `compose.yaml`，可以直接使用公网 IP 部署：

```bash
SKILLDOCK_PUBLIC_URL=http://你的公网IP sudo -E docker compose up -d --build
```

详细步骤见 [腾讯云公网 IP 部署说明](docs/tencent-cloud-ip-deploy.md)。Skill 的新增、修改和发布仍由维护者在本地通过 AI Agent 完成。
