---
title: 日志
slug: logging
summary: 将加入、离开、编辑、删除、封禁、身份组和频道变更等记录发送到你选择的日志频道，支持按事件类型分别路由，并可排除指定频道。
icon: fa-file
category: Security
dashboard: /dashboard/logging
module: Administration
tags: [logging, logs, audit, events, message deleted, message edited, join leave, mod log, ignored channels, 日志, 审计, 事件, 消息已删除, 消息已编辑, 加入离开, 管理日志, 忽略频道]
related: [moderation, administration, filter]
---

## 功能简介

日志功能会监听 Discord 发送给机器人的事件，并将每个事件的摘要发送到你指定的文本频道。被删除的消息会显示作者和内容；成员加入时会显示其账号年龄；身份组变动会显示被添加或移除的身份组。如果机器人可以读取审核日志，还会显示执行操作的工作人员。

每种事件类型都有自己的频道设置，因此你可以将消息编辑发送到一个频道，将管理操作发送到另一个频道，并关闭其余事件。在你指定频道之前，不会记录任何内容；频道为空的事件类型会被静默跳过。

频道也可以被排除。被忽略的频道不会产生任何消息、子区或语音日志，这样可以避免员工房间和机器人刷屏频道出现在记录中。

## 适用场景

- 保留被删除和编辑消息的副本，方便管理人员事后查看被移除的内容。
- 记录成员的加入和离开，包括账号创建日期，以便发现突袭和小号。
- 记录封禁、解封和禁言，并标明负责的管理人员，以便追责。
- 监控其他管理员或被盗用账号所做的身份组、频道和权限变更。
- 在语音频道是主要聚会场所的服务器中，追踪语音活动。

## 日志事件类型

每种类型都可以指向不同的频道，也可以不设置。以下是 `log` 命令接受的值，也是仪表板上显示的值。

| 类型 | 仪表板标签 | 记录时机 |
| --- | --- | --- |
| `MessageUpdated` | 消息已编辑 | 消息内容被编辑（机器人作者和内容未变化的消息会被跳过） |
| `MessageDeleted` | 消息已删除 | 消息被删除 |
| `MessagesBulkDeleted` | 批量删除消息 | 一次清除多条消息，并附带已缓存的数量 |
| `ReactionEvents` | 表情回应事件 | 表情回应被添加或移除，每条消息每五秒合并一次 |
| `ThreadCreated` | 子区已创建 | 子区被创建 |
| `ThreadDeleted` | 子区已删除 | 子区被删除 |
| `ThreadUpdated` | 子区已更新 | 子区的名称、归档状态等发生变化 |
| `UsernameUpdated` | 用户名已更新 | 成员的全局用户名发生变化 |
| `NicknameUpdated` | 昵称已更新 | 成员的服务器昵称发生变化 |
| `UserUpdated` | 用户已更新 | 成员的资料发生变化，例如头像或全局名称 |
| `UserJoined` | 用户已加入 | 成员加入服务器 |
| `UserLeft` | 用户已离开 | 成员离开或被踢出 |
| `UserRoleAdded` | 用户获得身份组 | 一个或多个身份组被授予成员 |
| `UserRoleRemoved` | 用户身份组被移除 | 一个或多个身份组被从成员身上移除 |
| `UserBanned` | 用户已被封禁 | 成员被封禁 |
| `UserUnbanned` | 用户已解封 | 封禁被解除 |
| `UserMuted` | 用户已被禁言 | 成员在语音或文字中被禁言 |
| `VoicePresence` | 语音状态 | 成员在语音中加入、离开、移动、静音、闭麦或开始直播 |
| `VoicePresenceTts` | 语音文字转语音 | 成员可能在语音中使用了文字转语音；检测为尽力而为 |
| `ServerUpdated` | 服务器已更新 | 服务器名称、图标或所有者等设置发生变化 |
| `EventCreated` | 活动已创建 | 创建了计划中的服务器活动 |
| `InviteCreated` | 邀请已创建 | 创建了邀请，并附带有效期和使用次数 |
| `InviteDeleted` | 邀请已删除 | 邀请被删除 |
| `RoleCreated` | 身份组已创建 | 身份组被创建 |
| `RoleDeleted` | 身份组已删除 | 身份组被删除 |
| `RoleUpdated` | 身份组已更新 | 身份组的名称、颜色或权限发生变化 |
| `ChannelCreated` | 频道已创建 | 频道被创建 |
| `ChannelDestroyed` | 频道已删除 | 频道被删除 |
| `ChannelUpdated` | 频道已更新 | 频道的名称、主题或权限发生变化 |
| `Other` | 其他 | 上述未涵盖的其他事件 |

仪表板还会显示 **头像已更新** 条目。它与其他条目一同保存，并会由“用户”和“全部”分类设置，但不能作为 `log` 命令的值使用。

## 分类

`logcategory` 可以一步将一组类型设置为同一个频道。不指定频道运行时，会清除该组中的所有类型。

| 分类 | 设置的类型 |
| --- | --- |
| `All` | 上方的所有类型 |
| `Users` | NicknameUpdated、AvatarUpdated、UsernameUpdated、UserRoleAdded、UserRoleRemoved、VoicePresence、UserJoined、UserLeft、UserUpdated |
| `Threads` | ThreadCreated、ThreadDeleted、ThreadUpdated |
| `Roles` | RoleCreated、RoleDeleted、RoleUpdated |
| `Server` | ServerUpdated、EventCreated、InviteCreated、InviteDeleted |
| `Channel` | ChannelCreated、ChannelDestroyed、ChannelUpdated |
| `Messages` | MessageDeleted、MessageUpdated、MessagesBulkDeleted、ReactionEvents |
| `Moderation` | UserMuted、UserBanned、UserUnbanned、Other |
| `None` | 清除所有类型（仪表板的 **全部禁用** 使用此选项） |

## 忽略的频道

忽略列表中的任何频道，其内部发生的消息、子区、频道和语音事件都会被跳过。子区会继承其父频道的设置，因此忽略论坛或文字频道也会忽略其中的子区。忽略语音频道会阻止加入该频道和离开该频道时的语音状态日志。

忽略频道不会阻止成员、身份组或服务器事件的记录，因为这些事件与频道无关。

## 设置

日志页面包含两个标签页：**日志频道** 和 **已忽略的频道**。

| 设置 | 默认值 | 作用 |
| --- | --- | --- |
| 日志频道 | 无 | 每种事件类型一个频道选择器，按 热门、用户、消息、管理、服务器、频道、身份组、子区、语音 和 所有事件 分组 |
| 清除分类 | | 清空你正在查看的分组中的所有选择器；在点击 **保存配置** 后生效 |
| 清除全部 | | 显示在 **所有事件** 分组中；清空所有选择器，保存后生效 |
| 全部禁用 | | 设置了任意频道时，标题栏会显示此按钮；确认后立即取消所有事件类型的频道分配，但保留忽略列表 |
| 已忽略的频道 | 无 | 被排除在日志之外的频道，可在 **活跃频道** 和 **已忽略的频道** 列表之间移动 |

> [!TIP]
> **热门** 分组包含用户已加入、用户已离开、消息已删除、消息已编辑、用户已被封禁、用户已解封、频道已创建和频道已删除。对大多数服务器来说，这是一组很好的起始设置。

## 设置步骤

1. 创建一个或多个只有工作人员可以查看的私密日志频道。
2. 在仪表板中打开 **日志**，并停留在 **日志频道** 标签页。
3. 在 **热门** 分组中，为你需要的每个事件选择日志频道，然后保存。
4. 切换到 **管理** 或 **语音** 等其他分组，为其他需要的事件分配频道。
5. 打开 **已忽略的频道** 标签页，将员工房间和机器人命令频道移到忽略列表中。
6. 删除一条测试消息，确认日志出现在正确的频道中。

## 命令

请使用服务器的前缀运行这些命令（默认为 `.`，除非你已更改）。斜杠命令位于 `/log` 下。

| 命令 | 别名 | 所需权限 | 用途 |
| --- | --- | --- | --- |
| `log <type> [#channel]` | | 管理员 | 将一种事件类型发送到某个频道；不指定频道时使用当前频道 |
| `log #channel [types...]` | | 管理员 | 将多种类型发送到一个频道；如果没有指定类型，则打开包含所有类型的选择菜单 |
| `log "#channel:Type1,Type2" ...` | | 管理员 | 在一条消息中设置多组频道和类型 |
| `logcategory <category> [#channel]` | `logcat` | 管理员 | 将整个分类指向某个频道，或不指定频道以清除 |
| `logevents` | | 管理员 | 列出每种事件类型及其当前使用的频道 |
| `logignore [#channel]` | `lignore` | 管理员 | 切换某个频道是否在忽略列表中；默认为当前频道 |
| `logignorelist` | `lignorel` | 管理员 | 显示忽略列表 |
| `commandlogchannel [#channel]` | `commandlog`, `logcommands` | 管理员 | 将机器人命令的使用记录到某个频道，不指定频道则关闭 |

> [!EXAMPLE]
> `log "#mod-logs:UserBanned,UserUnbanned,UserMuted" "#message-logs:MessageDeleted,MessageUpdated"`

## 提示和注意事项

- 请为机器人授予“查看审核日志”权限。没有该权限时，日志仍会发布，但无法说明是哪位管理人员删除了消息、封禁了某人或更改了身份组。
- 机器人必须能够查看并在每个日志频道中发送消息。机器人无法看到的日志频道会被跳过，且不会报错。
- 被删除和被编辑消息的日志依赖机器人的消息缓存。机器人上次重启前发送的消息，或批量清除中的消息，可能显示为未缓存。
- 表情回应日志会进行分组：同一条消息上约五秒内的所有表情回应变化会合并为一条记录，以避免繁忙服务器中的刷屏。
- `log #channel` 打开的选择菜单每次最多列出 25 种类型，并会预先选中已发送到该频道的类型。
- `logcategory` 会覆盖分类中的所有类型，包括你此前分配到其他频道的类型。之后如需修改单个类型，请使用 `log`。
