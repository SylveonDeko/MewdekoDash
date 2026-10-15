---
title: 身份组问候
slug: rolegreets
summary: 当成员获得特定身份组时，在频道中发送自定义消息，支持占位符、嵌入、Webhook 和自动删除。
icon: fa-user
category: Actions
dashboard: /dashboard/rolegreets
module: RoleGreets
tags: [role greet, role greets, welcome, role message, role announcement, verification welcome, webhook greet, 身份组问候, 身份组欢迎, 欢迎, 身份组消息, 身份组公告, 验证欢迎, Webhook 问候]
related: [multigreets, embedbuilder, administration]
---

## 功能介绍

身份组问候是成员获得某个身份组时，机器人发送的消息。员工选择一个身份组和一个频道，编写消息。此后，每当有人被添加该身份组，机器人都会在该频道中发送这条消息。默认消息为 `Welcome %user.mention%!`。

消息会经过嵌入解析器处理，因此可以是纯文本、完整嵌入，或在仪表板编辑器中构建的带按钮嵌入。占位符会填入成员的名称、头像、加入日期和服务器详情。每个问候都可以通过 Webhook 发送，并使用自己的名称和头像；也可以在设定的秒数后自动删除。

问候按身份组和频道区分。一个身份组最多可以有十条问候，每条可以位于不同频道或使用不同消息；问候也可以在不删除的情况下被禁用。

## 为什么要使用它

- 只有在通过验证并获得已验证身份组后，才在主聊天中欢迎成员。
- 当助推者身份组出现时，在感谢频道中宣布新助推者。
- 告诉刚选择游戏身份组的人该游戏的频道在哪里。
- 当管理员身份组被授予时，在员工频道中发布员工入职清单。
- 向加入活动或赛事身份组的成员发送该活动的规则。

## 问候的触发方式

机器人会监听成员更新，并比较更新前后的身份组。对于每个被添加的身份组，它会查找该身份组的问候并逐条发送。被移除的身份组不会触发任何内容。除非该问候开启了 **欢迎机器人**，否则机器人账号会被跳过；已禁用的问候会被忽略。

如果问候所在的频道已不存在，该问候会自行删除。如果 Webhook 问候因 Webhook 被删除或机器人失去权限而失败，该问候会被禁用而不是移除，方便你修复后重新启用。

设置了 Webhook 后，消息会以该 Webhook 的名称和头像发送。自动删除仍然有效：机器人会获取刚发送的消息，并在延迟后将其删除。

## 占位符

身份组问候支持用户、服务器和机器人占位符组。频道占位符不可用。

| 占位符 | 值 |
| --- | --- |
| `%user.mention%`, `%user%` | 获得身份组的成员的提及 |
| `%user.name%`, `%username%` | 其用户名 |
| `%user.fullname%` | 带标签的用户名 |
| `%user.avatar%` | 头像链接 |
| `%user.banner%` | 横幅链接 |
| `%user.id%` | 用户 ID |
| `%user.created_date%`, `%user.created_time%` | 账号创建日期和时间 |
| `%user.joined_date%`, `%user.joined_time%` | 加入服务器的日期和时间 |
| `%server.name%`, `%server%` | 服务器名称 |
| `%server.members%` | 缓存的成员数量 |
| `%server.icon%`, `%server.banner%` | 服务器图标和横幅链接 |
| `%server.boostlevel%`, `%server.boostcount%` | 助推等级和数量 |
| `%server.time%`, `%time.day%` | 服务器时间和星期几 |
| `%bot.name%`, `%bot.avatar%`, `%bot.id%` | 机器人的名称、头像和 ID |

如果服务器启用了邀请追踪，多条问候中的邀请人和邀请占位符（`%inviter.username%`、`%inviter.mention%`、`%inviter.count%`、`%invite.code%`、`%invite.label%` 以及其余占位符）也会根据成员的邀请人填入。如果无法确定邀请人，这些占位符会显示为 `Unknown`。

> [!EXAMPLE]
> `Welcome to the team, %user.mention%! You are member number %server.members%. Check the pins in this channel first.`

## 设置

“身份组问候”页面顶部有 **添加新的身份组问候** 表单，下方是每条问候的卡片。

| 设置 | 默认值 | 作用 |
| --- | --- | --- |
| 身份组 | 无 | 触发该问候的身份组 |
| 频道 | 无 | 消息发送的位置 |
| 消息 | `Welcome %user.mention%!` | 打开嵌入编辑器 |
| 删除时间（秒，0 为永不删除） | 0 | 自动删除的延迟 |
| Webhook URL（可选） | 无 | 通过 Webhook 而非机器人发送 |
| Greet Bots | 关 | 同时欢迎获得该身份组的机器人账号 |
| 已启用 | 开 | 在卡片上切换；禁用的问候不会执行任何操作 |

## 设置步骤

1. 在仪表板中打开 **身份组问候**。
2. 在 **添加新的身份组问候** 中选择 **身份组** 和 **频道**，然后点击 **添加身份组欢迎**。
3. 在新卡片上，点击消息框打开编辑器，使用上面的占位符编写问候语。
4. 如果希望频道保持整洁，请设置 **删除时间**；如果希望使用自定义名称和头像，请粘贴 **Webhook 链接**。
5. 保存卡片，然后将该身份组授予测试账号，并检查频道。
6. 使用卡片上的开关暂停问候，或使用删除按钮移除问候。

> [!TIP]
> 在 Discord 中，`rolegreetmessage 1` 不带文字时会显示当前消息，并提供 **预览** 按钮，使用你自己的信息进行渲染预览。

## 命令

使用服务器的前缀运行这些命令（如果你未更改，则为 `.`）。问候按其在 `rolegreetlist` 中的位置编号。

| 命令 | 别名 | 所需权限 | 用途 |
| --- | --- | --- | --- |
| `rolegreetadd <@role> [#channel]` | `rgadd`, `rga` | 管理员 | 为某个身份组添加问候；如未指定频道，则使用当前频道 |
| `rolegreetlist` | `rglist`, `rgl` | 管理员 | 分页查看所有问候及其设置 |
| `rolegreetmessage <id> [message]` | `rgmsg`, `rgm` | 管理员 | 设置消息；不带文字时显示并预览当前消息 |
| `rolegreetremove <id or @role>` | `rgrem`, `rgrm`, `rgr` | 管理员 | 按编号删除一条问候，或在确认后删除某身份组的所有问候 |
| `rolegreetdelete <id> <time or seconds>` | `rgdel`, `rgd` | 管理员 | 自动删除延迟，例如 `30s` 或 `30`；`0` 表示禁用 |
| `rolegreetdisable <id> <true/false>` | `rgdisable`, `rgdis` | 管理员 | 禁用或重新启用问候 |
| `rolegreetgreetbots <id> <true/false>` | `rolegreetbots`, `rggb` | 管理员 | 是否由机器人账号触发问候 |
| `rolegreetwebhook <id> [name] [avatar url]` | `rgwebhook`, `rghook`, `rgh` | 管理员 | 在问候频道中以该名称和头像创建 Webhook；不带名称则清除 |

斜杠命令位于 `/rolegreets` 下，执行相同操作：`add`、`remove`、`removerole`、`message`、`delete`、`disable`、`greetbots`、`webhook` 和 `list`。

## 提示与注意事项

- 机器人需要在问候频道中拥有发送消息和嵌入链接权限；需要管理消息权限才能使用自动删除；需要管理 Webhook 权限才能通过 `rolegreetwebhook` 创建 Webhook。
- 限制是每个身份组十条问候，而不是每个服务器。添加第十一条会被拒绝。
- 任何身份组的添加都会触发问候，包括来自反应身份组、等级奖励和其他机器人的添加，因此经常被添加和移除的身份组会刷屏。
- 如果嵌入解析器没有产生任何内容（例如消息只包含空白字符），则不会发送任何消息。
- `rolegreetremove` 使用身份组时会在确认提示（是/否）后删除该身份组的所有问候；使用编号时则立即只删除该条问候。
- 删除问候后编号会变化。编辑前请再次运行 `rolegreetlist`，以免按错编号操作。
- 身份组问候与 MultiGreets 页面中的加入问候是分开的。成员加入服务器时使用 MultiGreets，获得身份组之后则使用身份组问候。
