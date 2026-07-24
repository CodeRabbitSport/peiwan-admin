# 微信小程序多租户版本中心实施说明

> 更新日期：2026-07-22
>
> 已确认方案：不接入微信开放平台第三方平台；租户 1 维护统一构建产物，其他租户自行选择版本上传到各自的小程序，提审和发布仍由租户在微信公众平台手工完成。

## 1. 实际发布流程

1. 开发者在本地完成一次微信小程序生产构建。
2. 将最终产物目录压缩为 ZIP。ZIP 内必须且只能包含一个 `project.config.json`。
3. 使用租户 1 登录管理后台，在“系统设置 -> 小程序版本”填写版本号、更新日志并上传 ZIP。
4. 所有租户都能看到租户 1 发布的可用版本和更新提示。
5. 租户先配置自己的 AppID、AppSecret、代码上传密钥和 CI 机器人编号。
6. 租户选择目标版本并点击“上传到微信”，后端将统一产物上传为该 AppID 的开发版。
7. 上传成功后，租户前往微信公众平台手工提交审核、查看审核状态并发布。

```text
本地构建一次 -> 租户 1 上传 ZIP -> 所有租户看到新版本
                                  -> 租户选择版本
                                  -> 系统调用 miniprogram-ci
                                  -> 微信平台出现开发版
                                  -> 租户手工提审和发布
```

系统不会在点击按钮时重新构建，也不会要求每个租户维护一份源码或产物。

## 2. 统一产物如何识别租户

统一产物不能再依赖编译时固定的 `VITE_APP_HOST` 识别租户，否则一个 ZIP 只能对应一个租户。

微信小程序启动时现在执行以下逻辑：

1. 通过 `uni.getAccountInfoSync()` 读取当前运行小程序的真实 AppID。
2. 调用 `/app-api/gamer/site/get-by-mini-program-app-id`。
3. 后端在 `system_social_client` 中找到该 AppID 所属租户。
4. 将租户 ID 写入现有租户 Store，后续请求继续携带租户头。

`tenant.websites[0]` 仍作为租户网站标识显示在版本中心，但不再写死进统一产物。这样同一个 ZIP 可以上传给多个不同 AppID。

上传每个租户时，后端只修改临时解压目录中的 `project.config.json.appid`，原始 ZIP 不变。

## 3. 请求域名

生产构建的 API、文件上传和 WebSocket 地址统一来自环境变量，不再针对微信开发版、体验版、正式版写死不同地址。

当前版本中心展示的微信服务器域名如下：

| 微信配置类型 | 域名 |
| --- | --- |
| request 合法域名 | `https://api.zszs5.cn` |
| uploadFile 合法域名 | `https://api.zszs5.cn` |
| downloadFile 合法域名 | `https://api.zszs5.cn`、`https://kuaiyoudj.oss-cn-beijing.aliyuncs.com` |
| socket 合法域名 | `wss://api.zszs5.cn` |

域名配置只填写协议和主机，不包含 `/app-api/gamer/`、`/infra/ws` 等路径。每个 AppID 都需要在微信公众平台手工配置这些域名。

`tenant.websites[0]` 是业务租户标识，不是小程序实际请求的服务器，因此不需要作为 request 合法域名。

## 4. 租户需要配置的信息

### AppID 和 AppSecret

复用当前租户 `system_social_client` 中：

- `social_type = 34`，即微信小程序
- `user_type = 1`，即会员端
- `client_id` 保存 AppID
- `client_secret` 保存 AppSecret

同一个 AppID 不允许配置给多个租户。管理端只返回 AppSecret 是否已配置，不回显原文。
修改 AppID 时必须同时重新填写对应的 AppSecret 和代码上传密钥，不能沿用旧 AppID 的凭据。

### 代码上传密钥

代码上传密钥不是 AppSecret。租户需要在微信公众平台的“小程序代码上传”设置中单独生成。

- 密钥通过现有 `EncryptTypeHandler` 加密保存。
- 管理端只显示是否已配置和 SHA-256 指纹前 16 位。
- 执行上传时写入权限为 `0600` 的临时文件。
- 上传结束后删除临时目录、密钥文件和日志文件。

### 固定出口 IP

运行 `miniprogram-ci` 的服务器需要固定出口 IP。每个租户都要把版本中心显示的 CI 出口 IP 加入对应小程序的代码上传 IP 白名单。

## 5. 系统能够展示的版本状态

系统可以可靠展示：

- 租户 1 发布的全部可用统一产物
- 当前租户最近一次成功上传的开发版
- 排队中、上传中、上传成功、上传失败
- 版本号、更新日志、产物文件名、大小、上传时间和失败原因

系统不能通过普通小程序账号可靠获取：

- 微信当前审核状态
- 审核中的版本
- 当前线上正式版本
- 自动提交审核
- 自动发布

这些接口属于微信开放平台第三方平台能力。当前明确不接第三方平台，因此页面会直接引导租户前往微信公众平台查看和操作，不伪造“审核中”或“已发布”状态。

小程序端已接入现有更新管理器。租户在微信平台发布正式版后，用户下次启动小程序时会按微信机制检查并应用更新。

## 6. 后端数据和接口

新增数据表：

- `gamer_mini_program_version`：租户 1 的统一产物
- `gamer_mini_program_ci_config`：每租户代码上传密钥和机器人编号
- `gamer_mini_program_upload`：每租户上传记录

管理端接口：

| 方法 | 地址 | 用途 |
| --- | --- | --- |
| GET | `/admin-api/gamer/mini-program-release/overview` | 查询配置、可用版本和上传记录 |
| PUT | `/admin-api/gamer/mini-program-release/config` | 保存当前租户的小程序 CI 配置 |
| POST | `/admin-api/gamer/mini-program-release/version` | 租户 1 上传统一 ZIP |
| POST | `/admin-api/gamer/mini-program-release/upload` | 当前租户选择版本并创建上传任务 |

小程序公开接口：

| 方法 | 地址 | 用途 |
| --- | --- | --- |
| GET | `/app-api/gamer/site/get-by-mini-program-app-id` | 按真实 AppID 解析租户 |

版本响应不会返回服务器文件路径，配置响应不会返回 AppSecret 和代码上传密钥，上传响应不会返回完整 CI 日志。

## 7. 产物与任务保护

上传 ZIP 时执行：

- 压缩包最大 100 MB
- 解压后最大 500 MB
- 最多 20,000 个条目
- 拒绝绝对路径、盘符和 `..` 路径穿越
- 必须且只能存在一个有效的 `project.config.json`

上传任务使用单线程执行器全局串行处理，避免并发任务互相影响。每个租户同一时间只允许一条排队中或上传中的记录。

任务开始时会原子地从 `QUEUED` 改为 `UPLOADING`。已经被判定过期或失败的旧任务即使仍残留在线程队列中，也不会再次执行。

## 8. 部署步骤

1. 依次执行数据库脚本：

   `prodScript/miniProgramRelease/01.mini_program_release.sql`

   `prodScript/miniProgramRelease/02.mini_program_release_menu.sql`

   `prodScript/miniProgramRelease/03.repair_mini_program_upload_success.sql`

2. 管理后台构建完成后，将执行器复制到 Java 服务使用的 `vue-dist`，并在目标目录安装依赖：

   ```bash
   cp -R /absolute/path/peiwan-admin/support /absolute/path/p-java/vue-dist/
   cd /absolute/path/p-java/vue-dist/support/wechat-mini-program-ci
   npm install --omit=dev
   ```

3. 配置后端环境变量：

   ```text
   MINI_PROGRAM_CI_ARTIFACT_DIR=/absolute/path/mini-program-ci/artifacts
   MINI_PROGRAM_CI_RUNNER_SCRIPT=/absolute/path/p-java/vue-dist/support/wechat-mini-program-ci/upload.cjs
   MINI_PROGRAM_CI_NODE_COMMAND=node
   MINI_PROGRAM_CI_TIMEOUT_MINUTES=15
   MINI_PROGRAM_CI_EGRESS_IP=<固定公网出口 IP>
   ```

4. Java 默认从 `./vue-dist/support/wechat-mini-program-ci/upload.cjs` 读取执行器。这里的相对路径以 Java 进程工作目录为准；生产环境仍建议通过 `MINI_PROGRAM_CI_RUNNER_SCRIPT` 配置绝对路径。
5. `vue-dist/support` 可以被 Nginx 访问，但 Java 不通过 HTTP 执行脚本。脚本和依赖中不保存 AppSecret、代码上传私钥或产物文件，运行时私钥和临时产物仍保存在 Java 服务的独立临时目录。
6. 确认已有 `mybatis-plus.encryptor.password` 配置。代码上传密钥依赖该配置加密和解密。
7. 确认反向代理也允许至少 100 MB 的管理端上传请求。
8. 每个租户在微信公众平台配置代码上传 IP 白名单和服务器域名。
9. 先使用测试 AppID 完成一次“保存配置 -> 选择版本 -> 上传成功 -> 微信后台出现开发版”的闭环。
10. 租户自行在微信公众平台提审和发布。

## 9. 本地构建产物要求

以当前 `peiwan` 项目为例：

```bash
pnpm build:mp:prod
```

构建产物目录是 `dist/build/mp-weixin`。压缩该目录本身或压缩一个包含该目录的父目录都可以，后端会定位唯一的 `project.config.json`。

不要上传源码目录、`node_modules`、私钥文件或开发者工具的个人配置文件。

## 10. 官方资料

- [miniprogram-ci](https://developers.weixin.qq.com/miniprogram/dev/devtools/ci.html)
- [项目配置文件](https://developers.weixin.qq.com/miniprogram/dev/devtools/projectconfig.html)
- [小程序网络与服务器域名](https://developers.weixin.qq.com/miniprogram/dev/framework/ability/network.html)
- [小程序更新管理器](https://developers.weixin.qq.com/miniprogram/dev/api/base/update/wx.getUpdateManager.html)
- [提交审核接口的第三方平台适用范围](https://developers.weixin.qq.com/doc/oplatform/openApi/miniprogram-management/code-management/api_submitaudit.html)
- [版本查询接口的第三方平台适用范围](https://developers.weixin.qq.com/doc/oplatform/openApi/miniprogram-management/code-management/api_getversioninfo.html)

## 11. 本轮验证边界

按当前约定，本轮只完成源码修改和静态复核，不执行 lint、构建、测试、依赖安装或真实微信上传。待确认代码后再进行这些验证。
