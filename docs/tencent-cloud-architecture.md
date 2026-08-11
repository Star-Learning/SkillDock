# SkillDock 腾讯云第一阶段架构

## 目标

SkillDock 对访客公开浏览和下载，但只有站点维护者能新增、修改、测试、发布和下架 Skill。云端不运行 Codex，不提供编辑表单，也不直接修改中央仓库。

## 运行结构

```text
访客
  └─ HTTPS / Nginx
      ├─ /                  Next.js 静态站点 out/
      ├─ /api/v1/*          SkillDock Node 公共 API
      └─ /skills/*          本机版本包，或由 API 跳转 COS/CDN

维护者本地 Codex
  └─ skills/ 中央仓库
      └─ 测试 → 打包 → 构建 → 上传/发布
```

第一阶段推荐一台腾讯云轻量应用服务器运行 Nginx 和 Node 服务，ZIP 可先放服务器，随后迁移 COS。统计文件放在独立持久化目录，不能随着容器或版本发布被覆盖。

## 只买云服务器和域名是否够用

够第一阶段上线。单台轻量应用服务器可以同时运行 Nginx、静态站点、Node 公共 API、统计文件和版本化 ZIP，域名解析到服务器并配置 HTTPS 后即可对外服务。

但最低可用配置还应包含三件不一定需要额外购买的运维能力：

1. 自动续期的 HTTPS 证书；
2. `data/local/` 的每日异机备份；
3. 防火墙只开放 80/443，管理使用 SSH 密钥且不开放 `/api/local/*`。

访问量和 ZIP 数量较小时不必购买数据库、CDN 或负载均衡。开始面向更多用户后，最先建议增加 COS，用于保存 ZIP 和统计备份；CDN 与云数据库等到流量和可靠性要求确实增加时再接入。

## 权限边界

| 能力 | 访客 | 维护者本地 Agent | 云端服务 |
| --- | --- | --- | --- |
| 浏览与搜索 | 允许 | 允许 | 提供 |
| 下载版本包 | 允许 | 允许 | 记录后跳转 |
| 查看统计 | 允许 | 允许 | 只读提供 |
| 新增、修改、删除 | 禁止 | 允许 | 不提供接口 |
| 测试与打包 | 禁止 | 允许 | 发布流程可重复校验 |
| 发布 | 禁止 | 允许 | 只接收发布产物 |

公开 API 使用 `/api/v1/*`。仅本地维护接口使用 `/api/local/*`，并且只有服务绑定 `127.0.0.1`、`localhost` 或 `::1` 时才启用；云服务器使用 `SITE_HOST=0.0.0.0` 后，本地接口必须返回 404。

## 下载链路

页面不直接链接 ZIP：

```text
点击下载
  → GET /api/v1/skills/<id>/download
  → 下载次数 +1
  → 302 跳转到版本化 ZIP
  → 浏览器下载
```

服务器本地存储时跳转 `/skills/...zip`；接入 COS/CDN 后设置 `SKILLDOCK_DOWNLOAD_BASE_URL`，接口会跳转到对应下载域名。ZIP 文件名包含语义化版本，已经发布的版本不覆盖。

## 发布数据

- `skills/`：维护者中央源码，只在本地 Agent 工作区修改。
- `data/generated/skills.json`：发布快照，公开 API 只读取这份文件。
- `public/skills/`：版本化 ZIP 和 SHA-256，后续同步到 COS。
- `data/local/skill-stats.json`：第一阶段统计数据，部署时挂载持久化目录。

## 环境配置

```text
NEXT_PUBLIC_SITE_URL=https://你的域名
NEXT_PUBLIC_SKILLDOCK_API_BASE_URL=
SITE_HOST=0.0.0.0
SITE_PORT=3000
SKILLDOCK_STATS_PATH=/data/skilldock/skill-stats.json
SKILLDOCK_STATS_TIMEZONE=Asia/Shanghai
SKILLDOCK_DOWNLOAD_BASE_URL=https://你的下载域名
```

如果 Nginx 将同一域名的 `/api/v1/*` 转发给 Node，`NEXT_PUBLIC_SKILLDOCK_API_BASE_URL` 保持为空，可避免跨域配置。

## 发布流程

1. 维护者告诉本地 Codex 新增或修改 Skill。
2. Agent 更新中央源码、版本和测试样例。
3. 运行结构测试、安全扫描和代表性运行测试。
4. 生成发布快照、版本化 ZIP 与 SHA-256。
5. 完成站点构建，把 `out/` 和 ZIP 发布到服务器或 COS。
6. 验证公开页面、统计、下载跳转，以及 `/api/local/*` 在公网模式下不可访问。

## 后续升级

访问量增加后，可把静态站点和 ZIP 迁移 COS + CDN，把 JSON 统计迁移到腾讯云 MySQL。公开 API 路径和页面调用方式不需要改变，只替换底层存储。
