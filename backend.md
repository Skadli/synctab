# SyncTab 后端框架设计（基于 Hono + WebSocket + PostgreSQL）

> 本文档用于指导 SyncTab 后端实现，目标是完全支撑 `api文档.md` 与 `database.md` 中的接口与表结构；后端框架基于 **Hono**（HTTP API + WebSocket），数据库选用 **PostgreSQL**。

---

## 1. 整体目标与架构

- 目标
  - 实现 `api文档.md` 中所有 HTTP API（`/api/v1/...`）与 WebSocket 协议（`/api/v1/realtime`）。
  - 使用 `database.md` 中的表结构作为关系型数据库设计，保证字段与业务含义对齐。
  - 支持在单机 / 单实例运行，也可以平滑扩展为多实例（通过 Redis Pub/Sub 或消息队列扩展实时广播）。


- 高层架构
  - 客户端（React Native / Expo App）
    - 通过 HTTPS 访问 REST API：`https://api.synctab.com/api/v1`.
    - 通过 WSS 建立 WebSocket：`wss://api.synctab.com/api/v1/realtime`.
  - API 网关 / 应用层：Node.js + Hono
    - 路由层：按模块拆分（auth / users / spaces / devices / history / invites / realtime）。
    - 中间件：日志、请求 ID、鉴权（JWT）、校验（Zod）、错误处理、CORS。
  - 数据访问层：PostgreSQL + ORM
    - 推荐使用 **Prisma**（或 TypeORM / Kysely 等），与 `database.md` 中的表字段一一映射。
  - 实时层：WebSocket 管理 + 可选 Redis Pub/Sub
    - 单实例：进程内 Channel 管理与事件派发。
    - 多实例：通过 Redis 发布订阅 `device.*` / `history.*` / `presence.*` 等事件，再转发到 WebSocket 连接。

---

## 2. 技术栈选择

- 运行时
  - Node.js 24+（LTS），包管理建议 pnpm。

- Web 框架
  - Hono（运行在 Node.js 环境）：
    - 优点：体积小、路由清晰、适合部署到 Serverless（如 Cloudflare Workers、Vercel Edge Functions）。
    - 使用 Hono 提供的中间件能力，统一处理鉴权、请求 ID、错误、CORS 等。

- WebSocket
  - 使用 Hono 的 WebSocket 支持（Node 适配器），在同一服务中暴露 `/api/v1/realtime`。
  - 连接管理、心跳、订阅等逻辑由自定义的 `realtime` 模块实现。

- 数据库
  - PostgreSQL 15+（与 `database.md` 设计一致）。
  - ORM：**Prisma**（推荐）
    - `schema.prisma` 中按 `database.md` 的表结构建模，数据库采用 snake_case 字段，Prisma 模型使用 camelCase。
    - 支持迁移、类型安全查询。

- 缓存 / PubSub（可选）
  - Redis（或兼容实现，如 Upstash Redis 免费套餐）：
    - 用于多实例时的 WebSocket 广播、presence 状态缓存、限流计数等。

- 日志 & 监控
  - 日志：pino 或 winston，统一格式化 JSON 日志，包含 `requestId`、用户 ID、空间 ID 等。
  - 健康检查：`GET /healthz`，返回服务状态用于监控 / 探活。

---

## 3. 目录结构约定

推荐的后端项目结构（以 TypeScript 为例）：

```text
.
├─ src
│  ├─ app.ts                 # Hono 应用入口，挂载所有路由与中间件
│  ├─ server.ts              # 启动 HTTP/WebSocket 服务器（Node adapter）
│  ├─ config/
│  │  ├─ env.ts              # 环境变量加载与类型校验
│  │  └─ logger.ts           # 日志封装
│  ├─ middleware/
│  │  ├─ request-id.ts       # 生成 requestId
│  │  ├─ error-handler.ts    # 统一错误处理 -> 标准响应结构
│  │  ├─ auth.ts             # 解析 Authorization Bearer Token，注入当前用户
│  │  └─ cors.ts             # CORS 设置
│  ├─ db/
│  │  ├─ client.ts           # Prisma/Postgres 客户端初始化
│  │  └─ repositories/       # 领域仓库封装（UsersRepo / SpacesRepo / DevicesRepo 等）
│  ├─ modules/
│  │  ├─ auth/
│  │  │  ├─ routes.ts        # /auth/login /auth/refresh /auth/logout /auth/anonymous-login
│  │  │  └─ service.ts       # 登录、刷新 Token、登出等业务逻辑
│  │  ├─ users/
│  │  │  ├─ routes.ts        # /users/me /users/me/preferences 等
│  │  │  └─ service.ts
│  │  ├─ spaces/
│  │  │  ├─ routes.ts        # /spaces /spaces/{id} /spaces/{id}/members /invites 等
│  │  │  └─ service.ts
│  │  ├─ devices/
│  │  │  ├─ routes.ts        # 设备 CRUD 与 state 变更
│  │  │  └─ service.ts
│  │  ├─ history/
│  │  │  ├─ routes.ts        # /spaces/{id}/history
│  │  │  └─ service.ts
│  │  ├─ push/
│  │  │  ├─ routes.ts        # /devices/push-token
│  │  │  └─ service.ts
│  │  └─ realtime/
│  │     ├─ ws-handler.ts    # /realtime WebSocket 连接与消息收发
│  │     ├─ events.ts        # 事件模型定义 device.* / history.* / presence.*
│  │     └─ broadcaster.ts   # 单实例 / 多实例广播实现（内存或 Redis）
│  └─ utils/
│     ├─ id.ts               # usr_* / spc_* / dev_* / his_* / inv_* ID 生成
│     └─ pagination.ts       # 统一分页处理
├─ prisma/
│  ├─ schema.prisma          # ORM 模型，与 database.md 对齐
│  └─ migrations/            # 数据库迁移
├─ .env                      # 环境变量（本地开发）
├─ package.json
└─ Dockerfile                # 部署镜像
```

---

## 4. 配置与环境变量

后端通过环境变量配置以下关键项（不同部署环境可用不同 `.env`）：

- `NODE_ENV`：`development` / `production`.
- `PORT`：HTTP 服务监听端口，默认 3000。
- `BASE_URL`：对外暴露的完整 API 域名，如 `https://api.synctab.com`。
- `DATABASE_URL`：PostgreSQL 连接串，遵循 `postgres://user:pass@host:port/dbname`。
- `JWT_ACCESS_SECRET`：Access Token 签名密钥。
- `JWT_REFRESH_SECRET`：Refresh Token 签名密钥（可与 access 区分）。
- `JWT_ACCESS_TTL`：Access Token 有效期，例如 `15m`。
- `JWT_REFRESH_TTL`：Refresh Token 有效期，例如 `30d`。
- `REDIS_URL`（可选）：用于多实例广播与缓存。

示例 `.env`（本地开发）：

```bash
NODE_ENV=development
PORT=3000
BASE_URL=http://localhost:3000
DATABASE_URL=postgres://synctab:synctab@localhost:5432/synctab
JWT_ACCESS_SECRET=dev-access-secret
JWT_REFRESH_SECRET=dev-refresh-secret
JWT_ACCESS_TTL=15m
JWT_REFRESH_TTL=30d
```

---

## 5. HTTP API 层设计（对应 api文档.md）

### 5.1 路由与前缀

- 全部业务路由挂载在 Hono 应用的 `/api/v1` 前缀下：
  - `POST /auth/login`
  - `POST /auth/anonymous-login`
  - `POST /auth/refresh`
  - `POST /auth/logout`
  - `GET /users/me`
  - `PATCH /users/me`
  - `PATCH /users/me/preferences`
  - `GET /spaces`
  - `PATCH /users/me/active-space`
  - `GET /spaces/{spaceId}`
  - `GET /spaces/{spaceId}/members`
  - `POST /spaces/{spaceId}/invites`
  - `POST /invites/{inviteCode}/accept`
  - `GET /spaces/{spaceId}/devices`
  - `POST /spaces/{spaceId}/devices`
  - `PUT /spaces/{spaceId}/devices/order`
  - `PATCH /devices/{deviceId}`
  - `PATCH /devices/{deviceId}/state`
  - `DELETE /devices/{deviceId}`
  - `GET /spaces/{spaceId}/history`
  - `POST /devices/push-token`

（详细字段与业务语义严格以 `api文档.md` 中的说明为准。）

### 5.2 统一响应结构与错误处理

- 所有业务接口返回结构：

```json
{
  "code": 0,
  "message": "OK",
  "requestId": "uuid",
  "data": {}
}
```

- 中间件职责：
  - 在请求进入时生成 `requestId`，写入 Hono Context 与响应头 `x-request-id`，用于日志关联。
  - 捕获业务异常并转换为上述统一结构，设置 HTTP 状态码（200 / 4xx / 5xx）与业务 `code`。
  - 统一处理输入校验错误（如 Zod 校验失败），返回 `code=40001` 与具体字段错误信息。

### 5.3 鉴权中间件

- 除以下接口外，其他所有接口默认需要 Bearer Token：
  - `POST /auth/login`
  - `POST /auth/anonymous-login`
  - `POST /auth/refresh`
- 鉴权流程：
  1. 从 Header: `Authorization: Bearer <access_token>` 解析 Access Token。
  2. 使用 `JWT_ACCESS_SECRET` 验证签名、过期时间与 `jti`。
  3. 解析出 `userId` 等 payload，在上下文中注入 `ctx.get('authUser')`。
  4. 如配置黑名单（使用 `user_sessions.access_token_jti`），校验当前 token 是否被显式吊销。

### 5.4 访问控制与空间权限

- 以 `spaces`、`space_members` 表为基础：
  - 请求路径带有 `spaceId` 时，统一在中间件检查当前用户是否为该空间成员。
  - 对于 Invite 接口，要求角色为 `owner` / `admin`。
  - 对设备相关操作，这些检查由统一的 `spaceGuard` 中间件完成（读取 `space_members.role`）。

---

## 6. 身份认证与会话（auth 模块）

### 6.1 登录与匿名登录

- `POST /auth/login`
  - 根据 `deviceId` / `platform` / `appVersion` 更新或创建 `user_devices` 记录。
  - 如未指定用户（当前版本为“第一次登录即创建匿名用户”），则在 `users` 表中创建记录，并设置默认空间。
  - 为每次登录创建 `user_sessions` 记录，写入：
    - `user_id`
    - `user_device_id`
    - `refresh_token`（推荐存储哈希）
    - `access_token_jti`（用于未来黑名单）
    - `expires_at`
  - 返回：
    - `accessToken`（短期有效）
    - `refreshToken`（长期有效）
    - `user` / `spaces` / `activeSpaceId`（从数据库查询并组装）

- `POST /auth/anonymous-login`
  - 与普通登录类似，只是 `users.is_anonymous=true`，并可跳过部分资料字段。

### 6.2 Token 刷新与登出

- `POST /auth/refresh`
  - 校验传入的 `refreshToken`：
    - 解析 JWT，获取内部 `sessionId` 或 `refreshToken` 标识。
    - 在 `user_sessions` 中查找记录，检查是否未过期且未 `revoked_at`。
  - 生成新的 `accessToken`（可选：同时旋转 `refreshToken`）。
  - 更新 `access_token_jti` / `expires_at`。

- `POST /auth/logout`
  - 将对应会话的 `revoked_at` 标记为当前时间。
  - 可选：记录当前 Access Token 的 `jti` 到黑名单集合中（缓存或数据库）。

---

## 7. 数据库访问层设计（对应 database.md）

### 7.1 表与模型映射

- 按 `database.md` 中的表设计实现 ORM 模型：
  - 核心表：
    - `users` / `user_devices` / `user_sessions`
    - `spaces` / `space_members` / `space_invites`
    - `devices` / `device_state_history`
    - `push_tokens`
  - 可选表（用于统计与调试）：
    - `member_presence_logs`
    - `realtime_connections` / `realtime_subscriptions`

- ID 生成：
  - `usr_*` / `spc_*` / `dev_*` / `his_*` / `inv_*` 统一由 `utils/id.ts` 生成。
  - 要求全局唯一，可使用前缀 + 时间 + 随机段的方案。

### 7.2 典型业务流程与表操作

- 创建/登录用户
  - 插入 / 更新 `users`，同时更新 `active_space_id`。
  - 插入 / 更新 `user_devices`。
  - 插入 `user_sessions`。

- 空间管理
  - 查询空间列表：根据 `space_members` 中的 `user_id` 关联 `spaces`。
  - 切换 `activeSpace`：更新 `users.active_space_id` 并校验成员关系。
  - 邀请与入群：使用 `space_invites` 记录邀请码、过期时间、剩余次数；入群成功后插入 `space_members`。

- 设备管理
  - 设备列表：根据 `devices.space_id` 查询；`includeOrder` 时按 `order_index` 排序。
  - 创建设备：插入 `devices`，设置 `order_index`，必要时插入一条 `device_state_history`（如 `CREATE_DEVICE`）。
  - 变更设备基本信息：更新 `devices` 对应字段（名称、icon、颜色等）。
  - 删除设备：软删除或硬删除，视业务需要；删除时写入 `device_state_history` 一条 `DELETE_DEVICE` 记录。

- 状态变更 & 历史记录
  - 状态变更接口 `PATCH /devices/{id}/state`：
    - 更新 `devices.is_on`（或类似字段）。
    - 插入 `device_state_history` 一条记录，包含 `action` / `operator_user_id` / `occurred_at` 等。
    - 触发 WebSocket 事件 `device.state.changed` 与 `history.created`（见下一节）。

- Presence 状态
  - 简化方案：直接在 `space_members` 表中维护 `is_online` / `last_seen_at` 字段。
  - 可选：将每次 online/offline 变更写入 `member_presence_logs` 以便分析。

---

## 8. WebSocket 实时系统设计（realtime 模块）

### 8.1 连接与鉴权

- Endpoint：`wss://api.synctab.com/api/v1/realtime`。
- 连接流程（与 `api文档.md` 一致）：
  1. 客户端发起 WebSocket 连接。
  2. 连接建立后，客户端发送 `auth` 消息：

     ```json
     {
       "type": "auth",
       "token": "jwt-access-token"
     }
     ```

  3. 后端验证 Access Token，有效则记录连接信息（用户、设备、当前 activeSpace），并返回：

     ```json
     {
       "type": "auth.ok",
       "userId": "usr_xxx"
     }
     ```

  4. 鉴权失败时返回 `auth.error` 并关闭连接。

- 可选：将连接信息持久化到 `realtime_connections`，便于排查、统计在线用户数。

### 8.2 消息格式与类型

- 所有 WebSocket 消息遵循统一结构：

```json
{
  "id": "evt-uuid-or-cmd-id",
  "type": "event | command | system | error",
  "event": "device.state.changed",
  "spaceId": "spc_home",
  "timestamp": "2025-11-25T10:23:45.000Z",
  "data": {}
}
```

- 类型说明：
  - `command`：客户端发送的命令（订阅、取消订阅、ping 等）。
  - `event`：后端推送的业务事件（`device.*` / `history.created` / `member.presence.changed`）。
  - `system`：心跳、系统通知。
  - `error`：错误信息（未授权、参数错误等）。

### 8.3 订阅模型

- 客户端命令 `subscribe.space`：

```json
{
  "id": "cmd-1",
  "type": "command",
  "event": "subscribe.space",
  "spaceId": "spc_home",
  "data": {
    "topics": ["device", "history", "presence"]
  }
}
```

- 服务端逻辑：
  - 校验当前用户是否为 `spaceId` 的成员。
  - 将该连接与空间、主题映射起来：
    - 单实例：使用进程内 Map，例如 `Map<spaceId, Set<connection>>`，并按 topic 细分。
    - 多实例：同时在 Redis 中记录订阅信息，或仅通过频道名约定广播。
  - 返回 `subscribe.ok`：

```json
{
  "id": "cmd-1",
  "type": "event",
  "event": "subscribe.ok",
  "spaceId": "spc_home",
  "timestamp": "2025-11-25T10:20:00.000Z",
  "data": {}
}
```

- 取消订阅命令 `unsubscribe.space`：

```json
{
  "id": "cmd-2",
  "type": "command",
  "event": "unsubscribe.space",
  "spaceId": "spc_home",
  "data": {}
}
```

- 可将订阅信息写入 `realtime_subscriptions`，便于后续运维分析。

### 8.4 事件来源与广播流程

- HTTP API 与内部定时任务在完成数据库写入后，向实时系统发送事件：
  - 例如 `PATCH /devices/{id}/state` 成功后：
    - 在事务提交后构造事件 payload：
      - `device.state.changed`
      - `history.created`
    - 通过 `realtime/broadcaster` 模块广播。

- `broadcaster` 模块实现两种模式：
  1. 单实例模式（默认开发 / 小规模部署）：
     - 直接在内存中遍历订阅该空间 & 主题的连接，并发送事件。
  2. 多实例模式（生产 / 横向扩展）：
     - 使用 Redis Pub/Sub：
       - 发布：`PUBLISH realtime:space:{spaceId} {jsonEvent}`。
       - 各实例订阅自己的频道，并将事件转发给本实例上的连接。

### 8.5 事件类型对照（与 api文档.md 一致）

- 设备相关
  - `device.state.changed`：设备开关变化。
  - `device.created` / `device.deleted`：设备增删。
- 成员在线状态
  - `member.presence.changed`：空间成员 online/offline 变化。
- 历史记录
  - `history.created`：新增操作历史记录。

业务字段结构完全遵循 `api文档.md` 对应示例。

### 8.6 心跳与断线处理

- 支持 ping/pong：
  - 客户端发送：

    ```json
    {
      "id": "ping-123",
      "type": "system",
      "event": "ping",
      "timestamp": "..."
    }
    ```

  - 服务端返回 `pong`，并更新该连接的 `last_ping_at`（可写入 `realtime_connections`）。

- 断线清理：
  - WebSocket 关闭时，从内存订阅表中移除连接。
  - 如使用 `realtime_connections` / `realtime_subscriptions`，相应更新 `disconnected_at` 与删除订阅记录。



