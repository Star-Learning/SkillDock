# 腾讯云公网 IP 单机部署

当前版本按“一台腾讯云轻量应用服务器、一个 Docker 容器、直接用公网 IP 访问”设计。网站只展示、统计和提供 Skill 下载，不在云端运行 Agent，也没有在线管理入口。

## 推荐配置

- 腾讯云轻量应用服务器，Docker CE 镜像；
- 入门配置即可，建议从 2 核 2 GB、40 GB 系统盘起；
- 防火墙只开放 TCP 80；TCP 22 仅允许你自己的固定公网 IP；
- 暂不购买域名，不配置 HTTPS，直接访问 `http://公网IP/`。

## 首次部署

把本仓库放到服务器后，在项目目录执行：

```bash
SKILLDOCK_PUBLIC_URL=http://你的公网IP sudo -E docker compose up -d --build
```

部署完成后检查：

```bash
curl http://127.0.0.1/api/v1/health
sudo docker compose ps
```

浏览器打开 `http://你的公网IP/` 即可。容器把宿主机 80 端口映射到应用 3000 端口，因此不需要在公网额外开放 3000 端口。

## 更新

Agent 完成本地 Skill 或站点修改并把新版本同步到服务器后，在项目目录重新执行：

```bash
SKILLDOCK_PUBLIC_URL=http://你的公网IP sudo -E docker compose up -d --build
```

Compose 会重建并替换应用容器。统计数据保存在 Docker 命名卷 `skilldock-data` 中，不随容器替换而丢失。

## 备份统计数据

```bash
sudo docker compose exec skilldock sh -c 'cat /data/skill-stats.json' > skill-stats-backup.json
```

定期把备份文件下载到本地即可。不要执行 `docker compose down -v`，其中 `-v` 会删除统计数据卷。

## 当前边界

- 公网部署时 `/api/local/*` 自动关闭，外部访客无法新增、修改或删除 Skill；
- Skill 的新增、修改、测试和打包仍由你在本地通过 Agent 完成，再更新服务器；
- 没有域名时只能使用 HTTP，适合当前自用和试运行。网站不收集密码或敏感任务内容；将来需要更稳定地公开给他人时，再补域名、备案和 HTTPS。
