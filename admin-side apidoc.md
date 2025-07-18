# 后台管理系统API文档

**Base URL**: `https://api.hf2e2bc54.nyat.app:56647/api/admin`

## 鉴权方式

在请求头中添加：

```http
Authorization: Bearer <JWT_TOKEN>
```

------

## 接口列表

### 1. 管理员账号注册

**请求方式**：POST
**路径**：`/register`
**鉴权要求**：需要有效管理员令牌

**请求参数**：

```json
{
  "username": "string, 必填",
  "email": "string, 必填",
  "password": "string, 必填"
}
```

**成功响应**：

```json
{
  "id": "新创建的管理员ID"
}
```

**错误响应**：

- 400：用户名/邮箱已存在
- 401：未授权
- 500：服务器错误

------

### 2. 管理员登录

**请求方式**：POST
**路径**：`/login`

**请求参数**：

```json
{
  "email": "string, 必填",
  "password": "string, 必填"
}
```

**成功响应**：

```json
{
  "message": "success login",
  "email": "登录邮箱",
  "token": "JWT令牌（有效期1天）"
}
```

**错误响应**：

- 401：邮箱或密码错误
- 500：服务器错误

------

### 3. 用户管理

#### 3.1 分页获取用户列表

**请求方式**：GET
**路径**：

- `/users` （第一页）
- `/users/:page` （指定页码）

**请求参数**：

| 参数 | 位置 | 类型 |      说明       |
| :--: | :--: | :--: | :-------------: |
| page | path | int  | 页码（从1开始） |

**成功响应**：

```json
{
  "users": [
    {
      "id": 1,
      "username": "test",
      "email": "test@example.com"
    }
  ],
  "total": 100, // 总用户数
  "totalPages": 10 // 总页数
}
```

------

#### 3.2 添加用户

**请求方式**：POST
**路径**：`/user`

**请求参数**：

```json
{
  "username": "string, 必填",
  "email": "string, 必填",
  "password": "string, 必填"
}
```

**成功响应**：

```json
{
  "id": "新用户ID"
}
```

------

#### 3.3 修改用户信息

**请求方式**：PUT
**路径**：`/user/:id`

**请求参数**：

```json
{
  "username": "string",
  "email": "string",
  "password": "string"
}
```

**成功响应**：

```json
{
  "result": 1 // 影响的行数
}
```

------

#### 3.4 删除用户

**请求方式**：DELETE
**路径**：`/user/:id`

**成功响应**：

```json
{
  "result": 1 // 影响的行数
}
```

------

#### 3.5 用户搜索

**请求方式**：POST
**路径**：

- `/user/search` （第一页）
- `/user/search/:page` （指定页码）

**请求参数**：

```json
{
  "keyword": "string, 必填"
}
```

**成功响应**：

```json
{
  "users": [], // 匹配的用户列表
  "total": 50, // 匹配总数
  "totalPages": 5 // 总页数
}
```
------
### 4. 帖子管理
#### 4.1 分页显示帖子
**请求方式**：GET路径：

- `/posts`（第一页）
- `/posts/:page`（指定页码）

**请求参数**:

| 参数 | 位置 | 类型 |      说明       |
| :--: | :--: | :--: | :-------------: |
| page | path | int  | 页码（从1开始） |

**成功响应**
```json
{
  "posts": [
    {
      "id": 12,
      "content": "hello",
      "user_id": 33,
      "created_at": "2025-05-05T16:47:43.000Z"
    }
  ]
}
```
#### 删除帖子
**端点**: DELETE /posts/:id
**成功响应**:
```json
{
  "result": "受影响的行数（1表示成功）"
}
```
-----
### 5. 评论管理
#### 5.1 获取指定帖子的评论
**请求方式**：GET路径： `/comments/:post_id`
   **响应**:
```json
[
   {
       "id": "评论ID",
       "post_id": "所属帖子ID",
       "user_id": "评论用户ID",
       "content": "评论内容",
       "created_at": "评论时间",
       "username": "评论者用户名"
   }
]
```

#### 5.2删除评论
**请求方式**：DELETE路径：/comments/:comment_id
**成功响应**:
```json
{
 "result": "受影响的行数（1表示成功）"
}
```
-----
### 6. 乐谱管理
#### 6.1 展示所有乐谱
## 错误码说明

| 状态码 |        说明        |
| :----: |:----------------:|
|  400   | 无效请求/数据已存在 |
|  401   |   未授权/凭证错误   |
|  403   |     Token过期     |
|  500   |   服务器内部错误    |