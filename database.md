# SyncTab 数据库表结构设计（v1）

> 根据 `api文档.md` 反推的后端关系型数据库设计，默认以 PostgreSQL 为参考（可平滑映射到 MySQL）。  
> 所有业务主键采用字符串 ID（如 `usr_xxx`），与接口保持一致。

---

## 1. 用户与认证相关

### 1.1 `users` 用户表

| 字段名                | 类型              | 约束                         | 说明 |
|-----------------------|-------------------|------------------------------|------|
| id                    | varchar(50)       | PK                           | 用户 ID，形如 `usr_xxx` |
| user_id               | varchar(50)       | UNIQUE NULL                  | 外部展示/导入的数字账号（如 `882910`），可选 |
| name                  | varchar(100)      | NOT NULL                     | 昵称 |
| avatar_url            | varchar(512)      | NULL                         | 头像 URL |
| contribution_count    | integer           | NOT NULL DEFAULT 0           | 贡献次数计数，接口中的 `contributionCount` |
| is_anonymous          | boolean           | NOT NULL DEFAULT false       | 是否为匿名创建的用户（用于 `anonymous-login` 场景） |
| active_space_id       | varchar(50)       | FK → spaces.id NULL          | 当前激活空间，对应 `activeSpaceId` |
| language              | varchar(20)       | NOT NULL DEFAULT 'zh'        | 偏好语言，`preferences.language` |
| theme                 | varchar(20)       | NOT NULL DEFAULT 'auto'      | 主题：`auto` / `light` / `dark`，`preferences.theme` |
| haptics_enabled       | boolean           | NOT NULL DEFAULT true        | 震动开关，`preferences.hapticsEnabled` |
| notifications_enabled | boolean           | NOT NULL DEFAULT true        | 通知开关，`preferences.notificationsEnabled` |
| created_at            | timestamptz       | NOT NULL DEFAULT now()       | 创建时间 |
| updated_at            | timestamptz       | NOT NULL DEFAULT now()       | 更新时间（触发器自动更新） |

索引建议：
- `idx_users_active_space`(`active_space_id`)

### 1.2 `user_devices` 客户端设备表（手机等控制端）

登录/上报推送 token 时使用的 `deviceId`（如 iOS UUID）与用户、应用版本等绑定。

| 字段名          | 类型        | 约束                         | 说明 |
|-----------------|-------------|------------------------------|------|
| id              | bigserial   | PK                           | 内部自增主键 |
| user_id         | varchar(50) | FK → users.id NOT NULL       | 关联用户 |
| platform_device_id | varchar(191) | NOT NULL                  | 端侧唯一标识，对应请求中的 `deviceId`（ios-uuid-or-android-id） |
| device_name     | varchar(191)| NULL                         | 设备名称，如 `Jason's iPhone 16` |
| platform        | varchar(20) | NOT NULL                     | `ios` / `android` / 其他 |
| app_version     | varchar(50) | NULL                         | 客户端应用版本 `appVersion` |
| last_login_at   | timestamptz | NULL                         | 最近登录时间 |
| created_at      | timestamptz | NOT NULL DEFAULT now()       | 创建时间 |
| updated_at      | timestamptz | NOT NULL DEFAULT now()       | 更新时间 |

唯一约束与索引：
- UNIQUE(`user_id`, `platform_device_id`)
- `idx_user_devices_user`(`user_id`)

### 1.3 `user_sessions` 会话 / 刷新 Token 表

用于 `POST /auth/login`、`POST /auth/refresh`、`POST /auth/logout`。

| 字段名          | 类型        | 约束                         | 说明 |
|-----------------|-------------|------------------------------|------|
| id              | bigserial   | PK                           | 内部会话 ID |
| user_id         | varchar(50) | FK → users.id NOT NULL       | 会话所属用户 |
| user_device_id  | bigint      | FK → user_devices.id NULL    | 关联登录设备，可为空 |
| refresh_token   | varchar(512)| NOT NULL                     | 刷新 Token 明文或其哈希（推荐存哈希） |
| access_token_jti| varchar(128)| NULL                         | 当前 access JWT 的 jti/标识，用于黑名单 |
| expires_at      | timestamptz | NOT NULL                     | 刷新 Token 过期时间 |
| revoked_at      | timestamptz | NULL                         | 主动登出/撤销时间 |
| created_at      | timestamptz | NOT NULL DEFAULT now()       | 创建时间 |
| updated_at      | timestamptz | NOT NULL DEFAULT now()       | 更新时间 |

索引建议：
- `idx_user_sessions_user`(`user_id`)
- `idx_user_sessions_refresh_token`(`refresh_token`)

---

## 2. 空间与成员

### 2.1 `spaces` 空间表

| 字段名      | 类型        | 约束                         | 说明 |
|-------------|-------------|------------------------------|------|
| id          | varchar(50) | PK                           | 空间 ID，形如 `spc_home` |
| name        | varchar(100)| NOT NULL                     | 空间名称，如“我的家”“办公室” |
| owner_id    | varchar(50) | FK → users.id NOT NULL       | 空间创建者 / 拥有者 |
| member_count| integer     | NOT NULL DEFAULT 0           | 成员数量缓存，接口返回字段 |
| is_default  | boolean     | NOT NULL DEFAULT false       | 是否为某用户的默认空间（可搭配中间表维护） |
| created_at  | timestamptz | NOT NULL DEFAULT now()       | 创建时间 |
| updated_at  | timestamptz | NOT NULL DEFAULT now()       | 更新时间 |

索引建议：
- `idx_spaces_owner`(`owner_id`)

### 2.2 `space_members` 空间成员表

对应 `GET /spaces/{spaceId}/members`、入群邀请等。

| 字段名       | 类型        | 约束                                | 说明 |
|--------------|-------------|-------------------------------------|------|
| id           | bigserial   | PK                                  | 内部主键 |
| space_id     | varchar(50) | FK → spaces.id NOT NULL             | 空间 ID |
| user_id      | varchar(50) | FK → users.id NOT NULL              | 用户 ID |
| role         | varchar(20) | NOT NULL                            | `owner` / `admin` / `member` |
| is_online    | boolean     | NOT NULL DEFAULT false              | 当前在线状态，接口里的 `isOnline`（可选：仅缓存） |
| last_seen_at | timestamptz | NULL                                | 最近在线时间 `lastSeenAt` |
| created_at   | timestamptz | NOT NULL DEFAULT now()              | 加入时间 |
| updated_at   | timestamptz | NOT NULL DEFAULT now()              | 更新时间 |

唯一约束与索引：
- UNIQUE(`space_id`, `user_id`)
- `idx_space_members_space`(`space_id`)
- `idx_space_members_user`(`user_id`)

### 2.3 `space_invites` 空间邀请码表

对应：
- `POST /spaces/{spaceId}/invites`
- `POST /invites/{inviteCode}/accept`

| 字段名        | 类型        | 约束                         | 说明 |
|---------------|-------------|------------------------------|------|
| id            | varchar(50) | PK                           | 邀请 ID，形如 `inv_abcdef` |
| space_id      | varchar(50) | FK → spaces.id NOT NULL      | 邀请目标空间 |
| invite_code   | varchar(20) | UNIQUE NOT NULL              | 短邀请码，如 `884810` |
| qr_url        | varchar(512)| NULL                         | 二维码图片地址 |
| max_uses      | integer     | NULL                         | 最大使用次数，空表示不限 |
| used_count    | integer     | NOT NULL DEFAULT 0           | 已使用次数 |
| expires_at    | timestamptz | NULL                         | 过期时间 |
| created_by    | varchar(50) | FK → users.id NOT NULL       | 邀请创建者 |
| created_at    | timestamptz | NOT NULL DEFAULT now()       | 创建时间 |
| revoked_at    | timestamptz | NULL                         | 被手动撤销时间，撤销后不可再用 |

索引建议：
- `idx_space_invites_space`(`space_id`)
- `idx_space_invites_code`(`invite_code`)

---

## 3. 设备与开关面板

### 3.1 `devices` 空间内开关设备表

对应：
- `GET /spaces/{spaceId}/devices`
- `POST /spaces/{spaceId}/devices`
- `PATCH /devices/{deviceId}`
- `PUT /spaces/{spaceId}/devices/order`
- `DELETE /devices/{deviceId}`
- `PATCH /devices/{deviceId}/state`（状态变更时也更新本表）

| 字段名      | 类型        | 约束                         | 说明 |
|-------------|-------------|------------------------------|------|
| id          | varchar(50) | PK                           | 设备 ID，形如 `dev_1` |
| space_id    | varchar(50) | FK → spaces.id NOT NULL      | 所属空间 |
| name        | varchar(100)| NOT NULL                     | 设备名称，如“客厅顶灯” |
| icon        | varchar(50) | NOT NULL                     | 图标名，例如 `bulb-outline` |
| color       | varchar(20) | NOT NULL                     | 颜色值，如 `#FFCC00` |
| order_index | integer     | NOT NULL DEFAULT 0           | 排序字段，接口中的 `order` |
| is_on       | boolean     | NOT NULL DEFAULT false       | 当前开关状态 |
| created_at  | timestamptz | NOT NULL DEFAULT now()       | 创建时间 |
| updated_at  | timestamptz | NOT NULL DEFAULT now()       | 最近被修改时间 |

索引建议：
- `idx_devices_space`(`space_id`)
- `idx_devices_space_order`(`space_id`, `order_index`)

### 3.2 `device_state_history` 设备操作历史表

对应 `GET /spaces/{spaceId}/history`，以及 WebSocket `history.created` 事件。

| 字段名              | 类型        | 约束                         | 说明 |
|---------------------|-------------|------------------------------|------|
| id                  | varchar(50) | PK                           | 历史 ID，形如 `his_123` |
| space_id            | varchar(50) | FK → spaces.id NOT NULL      | 空间 ID |
| device_id           | varchar(50) | FK → devices.id NULL         | 设备 ID，可为空以支持设备已删除的历史 |
| device_name         | varchar(100)| NOT NULL                     | 操作时的设备名称快照 |
| action              | varchar(32) | NOT NULL                     | 动作，`TURN_ON`/`TURN_OFF`/`CREATE_DEVICE`/`DELETE_DEVICE` 等 |
| operator_user_id    | varchar(50) | FK → users.id NULL           | 操作人用户 ID，可为空（如系统/自动化） |
| operator_name       | varchar(100)| NULL                         | 操作人昵称快照 |
| operator_avatar_url | varchar(512)| NULL                         | 操作人头像快照 |
| occurred_at         | timestamptz | NOT NULL                     | 发生时间，接口字段 `time` |
| created_at          | timestamptz | NOT NULL DEFAULT now()       | 记录创建时间（通常与 occurred_at 一致） |

分页、查询字段：
- 默认按 `occurred_at` 倒序 + `id` 进行分页（支持 `before` 参数）。

索引建议：
- `idx_hist_space_time`(`space_id`, `occurred_at` DESC)
- `idx_hist_device_time`(`device_id`, `occurred_at` DESC)

---

## 4. 成员在线状态（Presence）

虽然 Presence 也可以完全存放在缓存中（如 Redis），但为对齐接口中 `isOnline`、`lastSeenAt` 字段，这里给出持久层设计方案之一。

> 简化方案：直接复用 `space_members` 表中的 `is_online` / `last_seen_at` 字段即可，无需单独建表。  
> 若需要更详细的在线轨迹，可引入下列表：

### 4.1 `member_presence_logs` 在线变更日志（可选）

| 字段名       | 类型        | 约束                         | 说明 |
|--------------|-------------|------------------------------|------|
| id           | bigserial   | PK                           | 主键 |
| space_id     | varchar(50) | FK → spaces.id NOT NULL      | 空间 ID |
| user_id      | varchar(50) | FK → users.id NOT NULL       | 用户 ID |
| is_online    | boolean     | NOT NULL                     | 变更后的在线状态 |
| changed_at   | timestamptz | NOT NULL                     | 变更时间 |

索引建议：
- `idx_presence_space_user`(`space_id`, `user_id`, `changed_at` DESC)

---

## 5. 推送 Token

对应：
- `POST /devices/push-token`
- 登录时请求体中的 `pushToken`

### 5.1 `push_tokens` 推送 Token 表

| 字段名          | 类型        | 约束                         | 说明 |
|-----------------|-------------|------------------------------|------|
| id              | bigserial   | PK                           | 主键 |
| user_id         | varchar(50) | FK → users.id NOT NULL       | 关联用户 |
| user_device_id  | bigint      | FK → user_devices.id NULL    | 关联客户端设备 |
| platform        | varchar(20) | NOT NULL                     | 平台 `ios` / `android` / `web` 等 |
| push_token      | varchar(512)| NOT NULL                     | 推送 Token，如 `ExpoPushToken[...]` |
| is_active       | boolean     | NOT NULL DEFAULT true        | 是否仍有效（登出或失效后置为 false） |
| created_at      | timestamptz | NOT NULL DEFAULT now()       | 创建时间 |
| last_used_at    | timestamptz | NULL                         | 最近用于下发通知的时间 |

唯一约束与索引：
- UNIQUE(`platform`, `push_token`)
- `idx_push_tokens_user`(`user_id`)

---

## 6. WebSocket / 实时订阅相关（后端内部）

HTTP 接口主要依赖上述表，WebSocket 实时消息多为这些数据的派生。以下表为可选设计，便于统计与调试。

### 6.1 `realtime_connections` 实时连接表（可选）

| 字段名       | 类型        | 约束                         | 说明 |
|--------------|-------------|------------------------------|------|
| id           | bigserial   | PK                           | 连接内部 ID |
| user_id      | varchar(50) | FK → users.id NOT NULL       | 连接所属用户 |
| user_device_id | bigint    | FK → user_devices.id NULL    | 连接来自的设备 |
| connected_at | timestamptz | NOT NULL                     | 建立连接时间 |
| disconnected_at | timestamptz | NULL                      | 断开时间 |
| last_ping_at | timestamptz | NULL                         | 最近 ping/pong 时间 |

### 6.2 `realtime_subscriptions` 订阅空间表（可选）

对应 `subscribe.space` / `unsubscribe.space`。

| 字段名        | 类型        | 约束                         | 说明 |
|---------------|-------------|------------------------------|------|
| id            | bigserial   | PK                           | 主键 |
| connection_id | bigint      | FK → realtime_connections.id NOT NULL | WebSocket 连接 |
| space_id      | varchar(50) | FK → spaces.id NOT NULL      | 订阅的空间 |
| topics        | varchar(100)| NOT NULL                     | 订阅主题组合，如 `device,history,presence` |
| subscribed_at | timestamptz | NOT NULL                     | 订阅时间 |

---

## 7. 其它说明

- 所有 `*_at` 字段均使用 UTC `timestamptz`，与文档中 ISO-8601 UTC 时间保持一致。  
- 业务 ID（`usr_*` / `spc_*` / `dev_*` / `his_*` / `inv_*`）建议由后端统一生成，确保全局唯一。  
- 如果使用 ORM（如 Prisma / TypeORM），可以在模型层保持 camelCase 字段名，对应数据库中的蛇形命名（snake_case），在本设计中以数据库字段名为准。  
- 若后续增加自动化场景（如定时开关、规则引擎），建议基于当前表再扩展规则配置表，与 `devices`、`spaces`、`users` 进行关联。

