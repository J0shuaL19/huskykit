# HuskyKit 分工交接与提交待办

## 原仓库审查

审查起点：main，`11ff2d6`。当时所有 6 个提交的 Git author 是 Joshua；以下按 proposal 的模块分工归类，不推断账号真实身份。

| 已有内容（Campus / 团队基础） | 提交 |
| --- | --- |
| 前后端骨架、MIT、依赖与目录结构 | b82f41c |
| Campus 列表筛选与详情 GET API | bdc50d9 |
| Campus 1,000 条模拟数据脚本 | 02b8228 |
| Atlas 连接验证说明 | b2947e6 |
| Campus design draft 与 3 张 SVG mockups | 9579c81 |
| Campus React 列表/筛选/详情，首页和导航 | 11ff2d6 |

当时缺失：Academic 全部功能、共享认证、Campus 写入 CRUD、部署与最终提交材料。Atlas 已验证是原 README 的记录，不代表本次验证过队友的远程数据库。

## 本次 Chunzhang Liu 部分

- `academicPosts` 独立集合、1,000 条可重复运行的 seed、完整 CRUD API。
- Academic 搜索/筛选/分页、详情、新建/编辑表单、删除确认。
- Passport local 注册、登录、退出、当前用户接口；bcryptjs 密码哈希；MongoDB session 持久化。
- 后端校验登录与作者；客户端不接受自填作者身份。
- 共享导航的登录状态和 Academic 入口，保留原首页布局并启用 Academic 卡片。
- [Academic 设计文档](academic-design.md)、4 张 mockups、验证脚本和[开发说明](development.md)。
- [本地验证结果与真实截图](verification.md)：构建、lint、格式、真实 MongoDB 测试与浏览器流程已通过；不代表已公开部署。

Campus 的业务功能留给 Ziyong Liu；原 Campus 后端文件只做 Prettier 格式整理，没有补写 CRUD。

## Ziyong Liu 接下来需要完成

1. 在 `backend/src/routes/campus.js` 添加 POST、PUT、DELETE，字段沿用原有 schema。
2. 从 `../auth/passport` 引入 `requireAuth`。创建时使用 `req.user._id.toString()` 存储 `authorId`，使用 `req.user.displayName` 存储 `author`，不能接受请求里的作者值。
3. 编辑/删除先查询帖子，再检查 `post.authorId === req.user._id.toString()`；更新/删除数据库条件也包含 authorId。分别返回未登录 401、非作者 403、不存在 404。
4. 新建 `CampusFormPage.jsx` / `CampusPostForm.jsx` 和同名 CSS；添加 `/campus/new`、`/campus/:id/edit` 路由。
5. 前端通过 `useAuth`（`src/auth/AuthContext.js`）取得 `{ user, loading, error }`。`user.id` 是字符串，未登录为 null；不要读 `user._id`。
6. 写请求使用 `src/api/request.js` 的 `request('/campus-posts', { method: 'POST', body: values })`。它会统一带 JSON、session cookie 和 `X-HuskyKit: 1`；手写请求必须保持这个约定。
7. 给 Campus 列表添加发布入口，详情只向作者显示 Edit/Delete。删除前确认；失败保留表单并显示错误。新组件写 PropTypes，并用同名 CSS。
8. 验证两个账号的权限、输入校验、创建/更新/删除、匿名可读；同步修改首页说明和 Campus 设计文档中的状态。

可参考 Academic 的实现方式，但 Campus 仍使用独立集合、路由、页面和组件。原 synthetic Campus 帖子没有 authorId，不应允许任意用户认领；演示时用本人注册账号新建帖子。

## 对照 rubric 的团队待办

| 项目 | 当前状态 / 剩余动作 |
| --- | --- |
| Design document（80 分） | 已有两模块设计与 mockups；两人共同审阅并整理为最终设计文档 |
| 两人各自完整 CRUD | Chunzhang 的 Academic 已实现；Ziyong 需补 Campus 写入与表单 |
| 1k synthetic records | 两个 seed 各 1,000；正式部署数据库仍需执行并核对记录数 |
| Passport authentication | 已接入，Campus 可以复用 |
| Hooks、PropTypes、CSS、ESLint、Prettier | 保持现有规范，队友新增组件也需通过检查 |
| 额外第三方限制 | 新增运行依赖仅 proposal 申请的四个认证包；未添加 axios/Mongoose/CORS/UI 框架 |
| Public deployment | 只有同源部署支持与步骤，尚未公开部署；需要部署地址与实际 smoke test |
| Final README | 最后统一生成：作者、真实课程链接、目标、真实截图、构建/运行方法、部署链接和完整 AI disclosure。当前 README 未改 |
| 视频和 slides | 两人参与、公开可访问、带讲解；各演示自己的筛选与完整 CRUD |
| Freeze deadline | 以课程实际时间为准，确认并在课前 24 小时冻结代码；不要仅凭相对的 Due Wednesday 推断日期 |
| Google Form / thumbnail | 团队提交正确链接，并用未登录浏览器检查缩略图和权限 |
| Peer review | 每人按课程要求完成，不能由代码自动代替 |

“Requesting approval” 是 proposal 中的申请清单，不等同于已看到老师批准记录；最终提交前需核对原课程回复。这里没有引入申请清单外的业务依赖。
