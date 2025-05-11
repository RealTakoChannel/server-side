# 后台管理系统API文档

**Base URL**: `frp-aim.com:56647/api/admin`

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

## 错误码说明

| 状态码 |        说明         |
| :----: | :-----------------: |
|  400   | 无效请求/数据已存在 |
|  401   |   未授权/凭证错误   |
|  500   |   服务器内部错误    |

------

## 注意事项

1. 所有用户管理接口需要管理员权限
2. 分页接口默认每页10条记录
3. 密码字段当前为明文存储，建议增加加密处理
4. 搜索接口使用模糊匹配（LIKE %keyword%）
5. JWT令牌需在有效期内使用