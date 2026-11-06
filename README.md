# 绥化 · 深空观测站

面向游戏策划 / 叙事策划招聘方的个人作品集。首版采用写实蓝调机房、五个可进入的 CRT 屏幕、复古装饰动画和内容管理后台。

## 开发与运行

需要 Node.js 24.5+（24.x）和 npm。每个云任务已隔离，直接使用已有 checkout，无需创建 Git worktree。

```bash
cd /workspace/-
npm ci
npm run admin:init
npm run dev
```

服务默认端口 3000。前台 `/`，后台 `/admin`。首次执行 `admin:init` 会生成管理员 `suihua`；如设置 `ADMIN_INITIAL_PASSWORD`，将使用该密码，否则生成随机密码并保存在 `.data/initial-admin.txt`，请私下读取，不要提交、截图或分享。登录后在“账号设置”修改密码；修改后初始凭据文件自动移除。再次运行初始化会保留已有账号；仅在有意重置密码时使用 `node server/admin.mjs --reset`，重置会注销所有会话。

生产运行：`npm run check && npm run build && npm start`。开发进程和端口不能当作公网部署。前台转场为基于真实加载完成状态的短暂过渡；背景采用生成的写实底图与分层交互，属于 2.5D 小幅视差，不是真实自由漫游 3D 场景。

## 如何维护内容

1. 登录后台，进入个人档案或相应作品分类。
2. 添加作品，填写标题、摘要、正文、个人贡献、年份与工具；上传封面和图片（可排序），或视频。
3. 先保存草稿；可预览尚未保存的文字与图片。勾选“公开发布”并保存后，访客可见；取消勾选并保存即可撤下。
4. 作品链接按 `/games/作品ID`、`/design/作品ID`、`/art/作品ID`、`/writing/作品ID` 独立分享。
5. 联系邮箱和微信在个人档案填写，留空不会虚构联系方式。中文是内容主版本。

《巴别塔之上》的初始介绍只使用已确认信息。当前封面是占位图形；聊天中展示的游戏截图没有可读取的上传文件路径，尚未导入媒体库，可从后台上传原图替换。其余栏目未填入虚构作品。

图片支持 PNG、JPG、WebP、GIF；视频支持 MP4、WebM，上传接口也可接收 PDF。单文件最大 100MB。上传文件存放在 `DATA_DIR/uploads`，数据库在 `DATA_DIR/observatory.sqlite`。源文件保留原色，屏幕氛围不对作品图片套蓝色滤镜。

## 双语与翻译

界面支持中文 / 英文。作品正文和个人介绍的英文草稿必须审核确认后才公开；中文变更会将英文标记为待更新。先保存中文，再审核并保存英文，避免同时编辑时误发过期翻译。未确认的英文显示中文原文。

自动生成英文需要在服务器安全配置 `TRANSLATION_API_KEY`，可选 `TRANSLATION_BASE_URL` 和 `TRANSLATION_MODEL`。支持 OpenAI-compatible Chat Completions JSON 响应。默认地址为 `https://api.openai.com/v1`，模型 `gpt-4.1-mini`。密钥只在服务端使用，不进入浏览器或 Git；云环境受限网络还需允许实际服务域名。未配置时接口明确返回服务未配置，仍可手动填写英文。自动翻译的真实远端调用尚未验证。

可选试玩地址支持浏览器游戏 iframe，并提供单独打开链接。目标页面需允许嵌入；当前没有可用游戏构建，因此尚未验证《巴别塔之上》在线试玩。

## 验证

```bash
npm run check
npm run build
npm test
npm run test:browser
```

API 测试使用临时数据库与端口 3197，覆盖鉴权、CSRF、草稿发布、英文审核失效、文件校验、数据持久化、删除和会话注销。浏览器测试使用独立 `.data/browser-tests` 数据与端口 3198，覆盖桌面与手机访问、独立作品链接、后台上传发布及撤下。默认浏览器为 `/usr/bin/chromium`；其他环境使用 `CHROMIUM_PATH` 指定 Chromium 可执行文件。不要将测试数据库用于生产。

## 部署与公开链接

需要支持长期运行 Node.js 和**持久磁盘**的服务器或托管服务；纯静态托管不能运行此后台。当前没有绑定托管账户、域名或公网发布工具，尚未生成公开链接。

仓库提供 Dockerfile（配置已准备，尚未在此环境构建 Docker 镜像）。生产流程：

1. 构建 Docker 镜像，挂载持久卷到 `/data`，映射服务端口 3000。
2. 在托管平台绑定 HTTPS 域名，设置 `PUBLIC_ORIGIN=https://实际域名`，不带末尾斜杠。生产登录 Cookie 默认仅通过 HTTPS 发送。不要在公开部署关闭该保护。
3. 在**已挂载持久卷的容器内**执行 `node server/admin.mjs`，私下读取 `/data/initial-admin.txt`。
4. 可选配置翻译服务。确认 `/api/health` 返回 `status: ok`。
5. 以未登录浏览器检查首页、五个栏目、单作品直达链接和媒体，再测试后台登录与发布；重启容器检查数据与上传文件仍在。

示例（需要自行具备 Docker 主机；未在当前环境执行）：

```bash
docker build -t suihua-observatory .
docker volume create suihua-data
docker run -d --name suihua --restart unless-stopped -p 3000:3000 \
  -v suihua-data:/data \
  -e PUBLIC_ORIGIN=https://your-domain.example \
  suihua-observatory
docker exec suihua node server/admin.mjs
```

公开部署使用单个应用实例连接该 SQLite 持久卷。备份时停止写入并同时备份整个数据目录（包括数据库及上传文件），或使用 SQLite 一致性备份工具；不要在写入时只复制主数据库文件而忽略 WAL。服务端设置 HTTP-only 会话 Cookie、CSRF 校验、登录限速、密码 scrypt 散列及上传类型校验。正式上线前应配置托管平台的 HTTPS、备份和磁盘容量监控。
