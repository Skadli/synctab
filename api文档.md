# SyncTab 后端 API 文档（v1）

> 依据当前 React Native / Expo 前端实现与《产品需求文档（PRD） - SyncTab》整理。所有接口均为示例，可根据实际域名与网关调整。

## 1. 通用规范

### 1.1 基本信息

- Base URL：`https://api.synctab.com/api/v1`（以下简称 `/api/v1`）
- 数据格式：`application/json; charset=utf-8`
- 时区：所有时间字段使用 ISO-8601 UTC 时间字符串，例如 `2025-11-25T10:23:45.123Z`

### 1.2 鉴权

- 采用 Bearer Token（JWT 或等价机制）
- 客户端在除登录、刷新 Token 外的请求中，通过 Header 传入：

`Authorization: Bearer <access_token>`

### 1.3 统一响应结构

所有 HTTP 200/4xx/5xx 的响应体统一格式：

```json
{
  "code": 0,
  "message": "OK",
  "requestId": "2b770b4e-...-...",
  "data": { }
}
```

- `code`：业务状态码，0 表示成功，其余为错误。
- `message`：简要说明，便于前端 toast 展示。
- `requestId`：后端生成的唯一请求 ID，便于日志追踪。
- `data`：成功时为业务数据；失败时可为空对象或携带错误上下文。

> 注：文档中所有 JSON 示例仅为结构示意，未必完全符合实际字段值。

### 1.4 常用 HTTP 状态码

- 200：请求成功，`code` 决定业务是否成功
- 400：请求参数错误
- 401：未登录或 Token 失效
- 403：无权限访问
- 404：资源不存在
- 429：频率限制
- 500：服务器内部错误

### 1.5 标准业务错误码示例

| code   | 场景                           |
|--------|--------------------------------|
| 0      | 成功                           |
| 40001  | 参数校验失败                   |
| 40002  | 不支持的操作                   |
| 40101  | 未登录或凭证无效               |
| 40301  | 无权访问该资源                 |
| 40401  | 资源不存在                     |
| 40901  | 资源状态冲突（如重复加入空间） |
| 42901  | 接口调用过于频繁               |
| 50001  | 服务器内部错误                 |

### 1.6 分页约定

列表类接口统一使用：

- 请求参数：`page`（从 1 开始）、`pageSize`（默认 20，最大 100）
- 响应数据：

```json
"data": {
  "items": [ ... ],
  "page": 1,
  "pageSize": 20,
  "total": 53
}
```

### 1.7 ID 与命名约定

- 用户 ID：`usr_` 前缀，例如 `usr_abcd1234`
- 空间 ID：`spc_` 前缀
- 设备 ID：`dev_` 前缀
- 历史记录 ID：`his_` 前缀
- 邀请 ID：`inv_` 前缀

字段统一使用 `camelCase`，与前端 TypeScript 保持一致。

---

## 2. 账号与认证（Login 页 / Settings 页）

### 2.1 匿名一键登录（登录页按钮 “进入我的家”）

- 对应页面/组件：`app/login.tsx` 中 `handleLogin`
- 作用：为当前设备创建或恢复一个用户账号，返回访问 Token 及默认空间信息

- Method：POST  
- Path：`/api/v1/auth/login`  
- Auth：无需鉴权

请求体：

```json
{
  "deviceId": "ios-uuid-or-android-id",
  "deviceName": "Jason's iPhone 16",
  "platform": "ios",
  "appVersion": "3.0.0",
  "pushToken": "ExpoPushToken[...]"
}
```

响应体（成功）：

```json
{
  "code": 0,
  "message": "OK",
  "requestId": "xxx",
  "data": {
    "accessToken": "jwt-access-token",
    "refreshToken": "jwt-refresh-token",
    "user": {
      "id": "usr_xxx",
      "name": "Jason",
      "userId": "882910",
      "avatarUrl": "https://...",
      "contributionCount": 12,
      "preferences": {
        "language": "zh",
        "theme": "auto",
        "hapticsEnabled": true,
        "notificationsEnabled": true
      }
    },
    "spaces": [
      {
        "id": "spc_default",
        "name": "我的家",
        "role": "owner",
        "memberCount": 3,
        "isDefault": true
      }
    ],
    "activeSpaceId": "spc_default"
  }
}
```

说明：

- 前端在登录成功后：
  - 将 `accessToken` / `refreshToken` / `user` / `activeSpaceId` 写入 `AsyncStorage`
  - 调用 `SettingsContext.login()` 更新本地 `isAuthenticated`
  - 跳转至 `/(tabs)/home`

### 2.2 刷新 Token

- Method：POST  
- Path：`/api/v1/auth/refresh`  
- Auth：无需 Bearer，但需要有效的 refreshToken

请求体：

```json
{
  "refreshToken": "jwt-refresh-token"
}
```

响应体：

```json
{
  "code": 0,
  "message": "OK",
  "requestId": "xxx",
  "data": {
    "accessToken": "new-access-token",
    "refreshToken": "new-refresh-token"
  }
}
```

### 2.3 登出（Settings 页 “退出登录”）

- 对应组件：`SettingsScreen.handleLogout`  
- Method：POST  
- Path：`/api/v1/auth/logout`  
- Auth：需要 Bearer Token

请求体：

```json
{}
```

响应体（成功）：

```json
{
  "code": 0,
  "message": "OK",
  "requestId": "xxx",
  "data": {}
}
```

说明：

- 服务端标记当前 accessToken / refreshToken 为失效
- 前端收到成功后：
  - 清理本地 `AsyncStorage` 中与账号相关的数据
  - 调用 `SettingsContext.logout()`，跳转 `/login`

### 2.4 获取当前用户信息（User / Settings 页）

- 用途：在进入用户页、设置页时获取最新的昵称、头像、贡献次数及偏好设置  
- Method：GET  
- Path：`/api/v1/users/me`  
- Auth：需要 Bearer Token

响应 `data` 字段结构同 2.1 中的 `user` + `preferences`。

### 2.5 更新个人资料（User 页 EditProfileModal）

- 对应组件：`EditProfileModal.onSave`  
- Method：PATCH  
- Path：`/api/v1/users/me`  
- Auth：需要 Bearer Token

请求体（部分字段可选）：

```json
{
  "name": "新昵称",
  "avatarUrl": "https://i.pravatar.cc/300?u=new"
}
```

响应体：

```json
{
  "code": 0,
  "message": "OK",
  "requestId": "xxx",
  "data": {
    "id": "usr_xxx",
    "name": "新昵称",
    "userId": "882910",
    "avatarUrl": "https://...",
    "contributionCount": 13,
    "preferences": { }
  }
}
```

### 2.6 更新偏好设置（Settings / LanguageToggle / AppearanceSwitcher）

- 对应组件：
  - `LanguageToggle`：更新 `language`
  - `AppearanceSwitcher`：更新 `theme`
  - `SettingsScreen` 中的 Switch：更新 `hapticsEnabled` / `notificationsEnabled`
- Method：PATCH  
- Path：`/api/v1/users/me/preferences`  
- Auth：需要 Bearer Token

请求体（任意字段可选，后端做部分更新）：

```json
{
  "language": "zh",
  "theme": "auto",
  "hapticsEnabled": true,
  "notificationsEnabled": true
}
```

响应体：返回最新 `preferences`。

说明：前端仍可使用 `AsyncStorage` 做本地缓存，优先以后端为准。

---

## 3. 空间 Space 与家庭成员（Home 页 SpaceSheet / User 页）

### 3.1 获取我的空间列表（Home 顶部空间选择 / SpaceSheet）

- 对应位置：Home 页头部展示当前空间名称，点击后弹出 `SpaceSheet`  
- Method：GET  
- Path：`/api/v1/spaces`  
- Auth：需要 Bearer Token

请求参数：

- `includeMembers`（可选 bool，默认 false）：是否一并返回成员数量和部分成员信息。

响应体示例：

```json
{
  "code": 0,
  "message": "OK",
  "requestId": "xxx",
  "data": {
    "items": [
      {
        "id": "spc_home",
        "name": "我的家",
        "role": "owner",
        "memberCount": 3,
        "isDefault": true
      },
      {
        "id": "spc_office",
        "name": "办公室",
        "role": "member",
        "memberCount": 5,
        "isDefault": false
      }
    ]
  }
}
```

### 3.2 切换当前空间（Home Header / SpaceSheet 选择）

- 对应组件：`SpaceSheet.onSelectSpace` -> 更新 Home 中 `currentSpace`  
- Method：PATCH  
- Path：`/api/v1/users/me/active-space`  
- Auth：需要 Bearer Token

请求体：

```json
{
  "spaceId": "spc_office"
}
```

响应体：

```json
{
  "code": 0,
  "message": "OK",
  "requestId": "xxx",
  "data": {
    "activeSpaceId": "spc_office"
  }
}
```

说明：

- 后端仅校验用户是否为该空间成员，如果是，则更新其默认空间。
- 前端在切换空间后，应重新调用：
  - `GET /api/v1/spaces/{spaceId}/devices`
  - `GET /api/v1/spaces/{spaceId}/history`
  - `GET /api/v1/spaces/{spaceId}/members`
  - 并更新 WebSocket 订阅空间（见第 6 章）。

### 3.3 获取空间详情

- Method：GET  
- Path：`/api/v1/spaces/{spaceId}`  
- Auth：需要 Bearer Token

响应体：

```json
{
  "code": 0,
  "message": "OK",
  "requestId": "xxx",
  "data": {
    "id": "spc_home",
    "name": "我的家",
    "ownerId": "usr_xxx",
    "memberCount": 3,
    "createdAt": "2025-11-01T10:00:00Z"
  }
}
```

### 3.4 查询空间成员列表（User 页 MemberGrid）

- 对应组件：`MemberGrid`（当前使用 MOCK_MEMBERS）  
- Method：GET  
- Path：`/api/v1/spaces/{spaceId}/members`  
- Auth：需要 Bearer Token

响应体示例：

```json
{
  "code": 0,
  "message": "OK",
  "requestId": "xxx",
  "data": {
    "items": [
      {
        "id": "usr_owner",
        "name": "Jason",
        "avatarUrl": "https://...",
        "isOnline": true,
        "lastSeenAt": "2025-11-25T10:20:00Z",
        "role": "owner"
      },
      {
        "id": "usr_1",
        "name": "Alice",
        "avatarUrl": "https://...",
        "isOnline": false,
        "lastSeenAt": "2025-11-25T08:10:00Z",
        "role": "member"
      }
    ]
  }
}
```

说明：

- `isOnline` 由即时通讯层维护，详见第 6 章 `member.presence.changed` 事件。
- 前端进入 User 页时，先调该接口获取初始列表，再通过 WebSocket 实时更新在线状态。

### 3.5 创建空间邀请码（User 页 InviteModal）

- 对应组件：`InviteModal`（当前固定邀请码 `8848`）  
- Method：POST  
- Path：`/api/v1/spaces/{spaceId}/invites`  
- Auth：需要 Bearer Token，且需拥有该空间的邀请权限（owner / admin）

请求体（可选参数）：

```json
{
  "expiresInMinutes": 30,
  "maxUses": 10
}
```

响应体：

```json
{
  "code": 0,
  "message": "OK",
  "requestId": "xxx",
  "data": {
    "inviteId": "inv_abcdef",
    "inviteCode": "884810",
    "spaceId": "spc_home",
    "qrUrl": "https://api.synctab.com/qrcode/inv_abcdef.png",
    "expiresAt": "2025-11-25T11:00:00Z"
  }
}
```

说明：

- 前端展示 `inviteCode`（6 位短码）与 `qrUrl` 对应的二维码。
- 分享链接可约定为：`https://synctab.app/invite/{inviteCode}`。

### 3.6 通过邀请码加入空间（被邀请方入组）

- 使用场景：被邀请方在登录后，在某个“加入家庭”入口中输入邀请码或扫描二维码。  
- Method：POST  
- Path：`/api/v1/invites/{inviteCode}/accept`  
- Auth：需要 Bearer Token（当前登录用户即将加入家庭空间）

响应体：

```json
{
  "code": 0,
  "message": "OK",
  "requestId": "xxx",
  "data": {
    "space": {
      "id": "spc_home",
      "name": "我的家",
      "role": "member"
    }
  }
}
```

说明：

- 后端需要校验邀请码有效性（未过期、未超过 `maxUses`）。
- 成功后，该空间会出现在 `GET /spaces` 返回结果中。

---

## 4. 设备与控制台（Home 页）

### 4.1 查询空间设备列表（Home 页网格 / SortableGrid）

- 对应页面/组件：`HomeScreen` 中的 `switches`、`SortableGrid` 与 `SwitchCard`  
- Method：GET  
- Path：`/api/v1/spaces/{spaceId}/devices`  
- Auth：需要 Bearer Token

请求参数（可选）：

- `includeState`（bool，默认 true）：是否包含实时开关状态
- `includeOrder`（bool，默认 true）：是否包含排序权重

响应体示例：

```json
{
  "code": 0,
  "message": "OK",
  "requestId": "xxx",
  "data": {
    "items": [
      {
        "id": "dev_1",
        "spaceId": "spc_home",
        "name": "客厅顶灯",
        "icon": "bulb-outline",
        "color": "#FFCC00",
        "isOn": false,
        "order": 1,
        "createdAt": "2025-11-20T10:00:00Z",
        "updatedAt": "2025-11-25T10:23:00Z"
      },
      {
        "id": "dev_2",
        "spaceId": "spc_home",
        "name": "卧室空调",
        "icon": "snow-outline",
        "color": "#5AC8FA",
        "isOn": true,
        "order": 2,
        "createdAt": "2025-11-20T10:05:00Z",
        "updatedAt": "2025-11-25T09:00:00Z"
      }
    ]
  }
}
```

### 4.2 新建设备（Home 页 AddDeviceModal）

- 对应组件：`AddDeviceModal.onAdd`  
- Method：POST  
- Path：`/api/v1/spaces/{spaceId}/devices`  
- Auth：需要 Bearer Token

请求体：

```json
{
  "name": "客厅顶灯",
  "icon": "bulb-outline",
  "color": "#FFCC00"
}
```

响应体：

```json
{
  "code": 0,
  "message": "OK",
  "requestId": "xxx",
  "data": {
    "id": "dev_new",
    "spaceId": "spc_home",
    "name": "客厅顶灯",
    "icon": "bulb-outline",
    "color": "#FFCC00",
    "isOn": false,
    "order": 99,
    "createdAt": "2025-11-25T10:30:00Z"
  }
}
```

说明：

- 前端在成功后，将返回的设备追加到本地 `switches` 列表中。
- 后端可在创建时自动将 `order` 设置在当前列表最后。
- 成功创建后，后端应通过 WebSocket 向其他同空间在线设备广播 `device.created` 事件。

### 4.3 更新设备信息（名称 / 图标 / 颜色）

- Method：PATCH  
- Path：`/api/v1/devices/{deviceId}`  
- Auth：需要 Bearer Token

请求体（任意字段可选）：

```json
{
  "name": "玄关灯",
  "icon": "bulb-outline",
  "color": "#FF9500"
}
```

响应体：返回更新后的设备对象（字段同 4.1）。

### 4.4 更新设备排序（拖拽 SortableGrid）

- 对应组件：`SortableGrid.onDragEnd`  
- Method：PUT  
- Path：`/api/v1/spaces/{spaceId}/devices/order`  
- Auth：需要 Bearer Token

请求体：

```json
{
  "orders": [
    { "deviceId": "dev_1", "order": 1 },
    { "deviceId": "dev_2", "order": 2 },
    { "deviceId": "dev_3", "order": 3 }
  ]
}
```

响应体：

```json
{
  "code": 0,
  "message": "OK",
  "requestId": "xxx",
  "data": {}
}
```

说明：

- `order` 为整数，数值越小越靠前。
- 前端每次拖拽结束后，将当前列表顺序映射为 `orders` 发送给后端。

### 4.5 删除设备（长按删除）

- 对应组件：`SwitchCard` 中的删除按钮 + `HomeScreen.handleDeleteDevice`  
- Method：DELETE  
- Path：`/api/v1/devices/{deviceId}`  
- Auth：需要 Bearer Token

响应体：

```json
{
  "code": 0,
  "message": "OK",
  "requestId": "xxx",
  "data": {}
}
```

说明：

- 删除成功后，前端从 `switches` 列表中移除该设备。
- 后端需要清理关联的历史记录或将其标记为已删除。
- 同空间其他设备通过 WebSocket 收到 `device.deleted` 事件。

### 4.6 更新设备开关状态（点击 SwitchCard）

- 对应组件：`SwitchCard.handlePress` -> `HomeScreen.toggleSwitch`  
- Method：PATCH  
- Path：`/api/v1/devices/{deviceId}/state`  
- Auth：需要 Bearer Token

请求体：

```json
{
  "isOn": true,
  "source": "mobile",
  "requestId": "d3a9f0d4-..."
}
```

响应体：

```json
{
  "code": 0,
  "message": "OK",
  "requestId": "server-generated-id",
  "data": {
    "deviceId": "dev_1",
    "spaceId": "spc_home",
    "isOn": true,
    "updatedBy": {
      "userId": "usr_xxx",
      "name": "张三"
    },
    "updatedAt": "2025-11-25T10:23:45.000Z",
    "historyId": "his_123"
  }
}
```

说明：

- 后端在将状态写入数据库/物联网网关成功后：
  - 写入一条历史记录（见 4.7）
  - 向同空间其他在线设备广播 WebSocket 事件 `device.state.changed`

### 4.7 查询空间操作历史（HistorySheet）

- 对应组件：`HistorySheet`（当前使用 `HISTORY_DATA`）  
- Method：GET  
- Path：`/api/v1/spaces/{spaceId}/history`  
- Auth：需要 Bearer Token

请求参数：

- `page`：页码，从 1 开始
- `pageSize`：每页条数，默认 20
- `before`（可选）：仅返回早于该时间的记录，用于下拉加载更多

响应体示例：

```json
{
  "code": 0,
  "message": "OK",
  "requestId": "xxx",
  "data": {
    "items": [
      {
        "id": "his_1",
        "spaceId": "spc_home",
        "deviceId": "dev_1",
        "deviceName": "客厅顶灯",
        "action": "TURN_ON",
        "time": "2025-11-25T10:23:00Z",
        "operator": {
          "userId": "usr_1",
          "name": "张三",
          "avatarUrl": "https://..."
        }
      },
      {
        "id": "his_2",
        "spaceId": "spc_home",
        "deviceId": "dev_2",
        "deviceName": "卧室空调",
        "action": "TURN_OFF",
        "time": "2025-11-25T09:45:00Z",
        "operator": {
          "userId": "usr_2",
          "name": "李四",
          "avatarUrl": "https://..."
        }
      }
    ],
    "page": 1,
    "pageSize": 20,
    "total": 53
  }
}
```

说明：

- `action` 可取值：`TURN_ON`、`TURN_OFF`、`CREATE_DEVICE`、`DELETE_DEVICE` 等。
- WebSocket 中也会对新产生的历史记录发送 `history.created` 事件。

---

## 5. 设置页接口汇总

> 相关接口在前文已定义，此处仅按页面位置归纳使用关系。

- 进入 Settings 页：
  - 调用 `GET /api/v1/users/me`，展示当前主题、语言、震动、通知状态
- 用户操作：
  - 切换主题 / 语言 / 开关时，调用 `PATCH /api/v1/users/me/preferences`
- 退出登录：
  - 调用 `POST /api/v1/auth/logout`

---

## 6. 即时通讯 / 实时同步设计

为实现“家庭成员在线状态”、“开关毫秒级同步”、“历史记录实时刷新”，后端提供基于 WebSocket 的实时通道。

### 6.1 连接与鉴权

- Endpoint：`wss://api.synctab.com/api/v1/realtime`
- 协议：WebSocket
- 鉴权方式：客户端在连接 URL 查询参数或首条消息中携带 `accessToken`。

示例（推荐首条消息鉴权）：

1. 客户端发起 WebSocket 连接：

`wss://api.synctab.com/api/v1/realtime`

2. 连接建立后首条消息：

```json
{
  "type": "auth",
  "token": "jwt-access-token"
}
```

3. 服务端鉴权成功后返回：

```json
{
  "type": "auth.ok",
  "userId": "usr_xxx"
}
```

鉴权失败时：

```json
{
  "type": "auth.error",
  "code": 40101,
  "message": "Unauthorized"
}
```

### 6.2 消息统一格式

WebSocket 发送与接收的消息体采用统一结构：

```json
{
  "id": "7d4f1e90-...",
  "type": "event",          
  "event": "device.state.changed",
  "spaceId": "spc_home",
  "timestamp": "2025-11-25T10:23:45.000Z",
  "data": { }
}
```

说明：

- `id`：消息 ID，服务端生成。
- `type`：
  - `event`：服务端主动推送（如设备状态变化、成员上线）
  - `command`：客户端发送指令（如订阅、取消订阅）
  - `system`：心跳、重连提示等
  - `error`：错误消息
- 客户端发送指令时也使用此结构，`type` 为 `command`。

### 6.3 客户端指令

#### 6.3.1 订阅空间

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

服务端响应：

```json
{
  "id": "cmd-1",
  "type": "event",
  "event": "subscribe.ok",
  "spaceId": "spc_home",
  "timestamp": "2025-11-25T10:20:00.000Z",
  "data": { }
}
```

#### 6.3.2 取消订阅空间

```json
{
  "id": "cmd-2",
  "type": "command",
  "event": "unsubscribe.space",
  "spaceId": "spc_home",
  "data": { }
}
```

#### 6.3.3 心跳

客户端定期发送：

```json
{
  "id": "ping-123",
  "type": "system",
  "event": "ping",
  "timestamp": "2025-11-25T10:21:00.000Z",
  "data": { }
}
```

服务端返回：

```json
{
  "id": "ping-123",
  "type": "system",
  "event": "pong",
  "timestamp": "2025-11-25T10:21:00.100Z",
  "data": { }
}
```

> 说明：设备在线状态（presence）可通过连接 / 断开与定期心跳来维护。

### 6.4 服务端事件类型

#### 6.4.1 设备状态变更（Home 控制台）

事件名：`device.state.changed`

```json
{
  "id": "evt-1",
  "type": "event",
  "event": "device.state.changed",
  "spaceId": "spc_home",
  "timestamp": "2025-11-25T10:23:45.000Z",
  "data": {
    "deviceId": "dev_1",
    "name": "客厅顶灯",
    "icon": "bulb-outline",
    "color": "#FFCC00",
    "isOn": true,
    "updatedBy": {
      "userId": "usr_xxx",
      "name": "张三"
    },
    "historyId": "his_123"
  }
}
```

说明：

- 触发时机：
  - 当前用户通过 `PATCH /devices/{id}/state` 切换开关
  - 其他终端 / 自动化规则改变了设备状态
- 前端处理：
  - 若当前页面为 Home 且空间相同，则更新对应 `SwitchCard` 的 `isOn` 状态；
  - 如果当前打开历史记录面板，可同时将该记录插入列表顶部。

#### 6.4.2 设备新增 / 删除

事件名：`device.created` / `device.deleted`

载荷结构参考 4.1 中的设备对象。

用途：

- 有人新增 / 删除开关后，同空间其他在线成员的 Home 页立即同步列表。

#### 6.4.3 成员在线状态变更（User 页 MemberGrid）

事件名：`member.presence.changed`

```json
{
  "id": "evt-2",
  "type": "event",
  "event": "member.presence.changed",
  "spaceId": "spc_home",
  "timestamp": "2025-11-25T10:22:00.000Z",
  "data": {
    "userId": "usr_1",
    "name": "Alice",
    "avatarUrl": "https://...",
    "isOnline": true,
    "lastSeenAt": "2025-11-25T10:22:00.000Z"
  }
}
```

前端处理：

- User 页订阅当前空间的 presence 事件；
- 收到事件后更新 `MemberGrid` 中对应成员的 `isOnline` 字段。

#### 6.4.4 历史记录新增

事件名：`history.created`

```json
{
  "id": "evt-3",
  "type": "event",
  "event": "history.created",
  "spaceId": "spc_home",
  "timestamp": "2025-11-25T10:23:45.000Z",
  "data": {
    "id": "his_123",
    "deviceId": "dev_1",
    "deviceName": "客厅顶灯",
    "action": "TURN_ON",
    "time": "2025-11-25T10:23:45.000Z",
    "operator": {
      "userId": "usr_xxx",
      "name": "张三"
    }
  }
}
```

用途：

- 如果 HistorySheet 当前展开，可将新记录插入列表顶部，实现实时刷新。

### 6.5 各页面订阅策略

- 登录成功后：
  - 建议在应用层建立一个全局 WebSocket 连接（例如在 `RootLayout` 中），并订阅当前 `activeSpaceId`。
- Home 页：
  - 订阅 `device.*` 与 `history.*` 事件，用于同步开关状态与操作历史。
- User 页：
  - 订阅 `presence.*` 事件，用于更新家庭成员在线状态。
- Settings 页：
  - 一般仅需 HTTP 接口，不需要订阅实时事件。
- 切换空间：
  - 先发送 `unsubscribe.space` 旧空间，再 `subscribe.space` 新空间。

---

## 7. 推送通知（扩展）

为了支持“张三喂了猫”这类远程提醒，后端可提供以下接口：

### 7.1 上报推送 Token

- Method：POST  
- Path：`/api/v1/devices/push-token`  
- Auth：需要 Bearer Token

请求体：

```json
{
  "deviceId": "ios-uuid-or-android-id",
  "pushToken": "ExpoPushToken[...]",
  "platform": "ios"
}
```

响应体：

```json
{
  "code": 0,
  "message": "OK",
  "requestId": "xxx",
  "data": { }
}
```

说明：

- 后端保存每个用户–设备的推送 Token 列表。
- 发生设备控制事件时，可向空间内其他成员推送“谁在什么时间操作了哪个开关”的通知。

---

## 附录：按页面划分的接口一览

- 登录页（`app/login.tsx`）
  - `POST /api/v1/auth/anonymous-login`
- Home 控制台（`app/(tabs)/home.tsx`）
  - `GET /api/v1/spaces`
  - `PATCH /api/v1/users/me/active-space`
  - `GET /api/v1/spaces/{spaceId}/devices`
  - `POST /api/v1/spaces/{spaceId}/devices`
  - `PUT /api/v1/spaces/{spaceId}/devices/order`
  - `PATCH /api/v1/devices/{deviceId}/state`
  - `DELETE /api/v1/devices/{deviceId}`
  - `GET /api/v1/spaces/{spaceId}/history`
  - WebSocket：`device.*`, `history.*`
- 用户与空间页（`app/(tabs)/user.tsx`）
  - `GET /api/v1/users/me`
  - `PATCH /api/v1/users/me`
  - `GET /api/v1/spaces/{spaceId}/members`
  - `POST /api/v1/spaces/{spaceId}/invites`
  - WebSocket：`member.presence.changed`
- 设置页（`app/(tabs)/settings.tsx`）
  - `GET /api/v1/users/me`
  - `PATCH /api/v1/users/me/preferences`
  - `POST /api/v1/auth/logout`
