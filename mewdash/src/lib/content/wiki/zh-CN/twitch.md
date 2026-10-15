---
title: Twitch 机器人
slug: twitch
summary: 在你自己的 Twitch 聊天室中运行 Mewdeko，支持自定义命令、定时器、语录和计数器，并将订阅、突袭、频道积分兑换和开播事件转发到 Discord。
icon: fa-brands fa-twitch
category: Community
dashboard: /dashboard/twitch
module: Twitch
tags: [twitch, chat bot, streamer, commands, timers, quotes, counters, channel points, redemptions, subs, raids, account link, role sync, eventsub, Twitch机器人, 聊天机器人, 主播, 命令, 定时器, 语录, 计数器, 频道积分, 兑换, 订阅, 突袭, 账号链接, 身份组同步]
related: [streams, administration]
---

## 功能介绍

Twitch 机器人会将一个 Twitch 频道与你的 Discord 服务器相连，让 Mewdeko 在该频道的聊天中充当聊天机器人。观众在 Twitch 聊天中输入 `!ping`、`!quote`、`!counter deaths` 或你自定义的命令，机器人便会在那里作出回复。定时器会在你开播期间定期发送消息，语录和计数器按服务器保存，频道积分奖励可以触发聊天回复或 Discord 发帖。

频道中的事件也会同步到 Discord。频道开播时，机器人会向一个 Discord 频道发送开播通知；订阅、礼物订阅和突袭可以各自发送到指定频道，并使用你自定义的模板。直播结束后，还可以发送直播回顾，汇总直播时长、最高观看人数、聊天消息数、订阅和突袭情况。

观众可以将自己的 Twitch 账号与 Discord 账号关联。关联后，机器人便能识别在 Twitch 聊天中发言的是哪位 Discord 成员，而身份组同步功能可以自动为订阅者、VIP、管理员或主播发放对应的 Discord 身份组。

> [!NOTE]
> 这与直播提醒不同。直播提醒只会监控多个平台上的公开频道，并在它们开播时发出通知。Twitch 机器人则需要你授权自己的 Twitch 账号，并让机器人在你的聊天室中活动。如果同一个 Twitch 频道同时配置了两者，Twitch 机器人的开播消息会取代直播提醒的开播消息，避免重复发送。

## 适用场景

- 你在 Twitch 直播，希望用同一个机器人管理 Discord 和 Twitch 聊天，两边使用相同的自定义命令和社交媒体链接。
- 你希望订阅和突袭能在发生时同步到 Discord 中进行庆祝。
- 你希望自动为订阅者或 VIP 发放 Discord 身份组，而不必手动操作。
- 你希望“补水”或“伸展”之类的频道积分奖励能在聊天中自动发言，并记录到 Discord。
- 你的管理员需要一个 shoutout 命令、突袭目标选择器，以及能在多次直播之间保留的语录列表。

## 连接

Twitch 机器人需要两次 Twitch 授权，均在 **设置** 标签页的 **连接** 子标签页中完成。

| 授权 | 操作者 | 授予的权限 |
| --- | --- | --- |
| 机器人账号 | 仅机器人所有者 | 机器人在聊天中使用的 Twitch 账号。权限范围为 `user:read:chat`、`user:write:chat`、`user:bot`。所有服务器共用同一身份。 |
| 主播频道 | 你，即主播 | 访问你频道的事件。权限范围包括 `channel:bot`、订阅、Bits、兑换、投票、预测、直播管理、剪辑编辑和内容审核。 |

当机器人账号已存在、你的频道已授权且配置处于启用状态时，即视为已完成配置。**运行状况** 面板会显示传输方式（EventSub WebSocket 或旧版 IRC）、最近收到的事件、两个账号的令牌过期时间；在 **高级诊断** 下还会显示缺失的权限范围和已存储的 EventSub 订阅。

断开频道连接会删除你的授权，并禁用该功能。机器人账号只能由机器人所有者断开。

## Twitch 中的聊天命令

每个已连接的频道都会获得以下内置命令。默认前缀为 `!`，可以修改，最多 5 个字符。只有在没有匹配的内置命令时，才会查找自定义命令。

| 命令 | 可用对象 | 作用 |
| --- | --- | --- |
| `!ping` | 所有人 | 回复 pong |
| `!uptime` | 所有人 | 机器人进程已运行的时长 |
| `!commands` | 所有人 | 列出内置命令和已启用的自定义命令 |
| `!discord` | 所有人 | 显示发送者所关联的 Discord 账号 |
| `!link` | 所有人 | 生成一个六位数的认领码，用于账号关联 |
| `!rank` | 所有人 | 显示发送者的当前等级 |
| `!stream` | 所有人 | 直播状态、标题、分类、观看人数和时长；未开播时显示“offline” |
| `!schedule` | 所有人 | 发送由工作人员设置的日程消息 |
| `!socials` | 所有人 | 发送由工作人员设置的社交媒体消息 |
| `!quote [id]` | 所有人 | 随机显示一条语录，或按编号显示指定语录 |
| `!quote add <text> [-- author]` | 管理员 | 保存语录，可在 `--` 之后附上作者 |
| `!quote remove <id>` | 管理员 | 删除语录（`delete` 同样有效） |
| `!counter <name>` | 所有人 | 显示计数器的数值 |
| `!counter <name> +` | 管理员 | 加一（`++` 或 `add` 同样有效）；`-`、`--` 或 `sub` 减一；`reset` 重置为 0；输入数字则直接设置该数值 |
| `!so <user>` | 管理员 | 为其他 Twitch 频道发送 shoutout |
| `!raidtarget` | 管理员 | 从突袭目标列表中随机推荐一个频道 |

### 等级

观众的等级取决于其 Twitch 徽章。等级从高到低依次为：主播、管理员、VIP、订阅者（创始人徽章计为订阅者），最后是所有人。命令、自定义命令和身份组同步都按此顺序进行比较，因此管理员可以使用设置为 VIP、订阅者或所有人的任何命令。

## 自定义命令

自定义命令可在仪表板的 **命令** 下的 **自定义命令** 中添加，也可使用 `/twitch commands add`。命令名称会自动转为小写，最多 32 个字符，可包含字母、数字、连字符和下划线。每条命令都有 **权限**（所有人、订阅者、VIP、管理员、主播）、**冷却时间（秒）**（0 至 86400）、**已启用** 开关和 **回复** 内容。冷却时间由整个频道共享，而非按用户计算。系统会记录使用次数，并显示在列表中。

仪表板还提供 **测试参数** 字段和预览功能，方便你在保存前查看渲染后的回复。

### 回复中的占位符

| 占位符 | 值 |
| --- | --- |
| `%user%` | 发言者的 Twitch 登录名 |
| `%display%` | 发言者的显示名称 |
| `%channel%` | 你的 Twitch 频道登录名 |
| `%args%` | 命令名称之后输入的全部内容 |
| `%target%` | 命令名称之后的第一个单词 |
| `%discord%` | 发言者已关联的 Discord 用户 ID，未关联则为空 |
| `%random:a\|b\|c%` | 随机选取一个选项 |
| `%count:name%` | 指定计数器的当前值 |
| `%stream%` | 与 `!stream` 相同的直播摘要 |

> [!EXAMPLE]
> 命令 `!hug` 的回复为 `%display% hugs %target%! That is hug number %count:hugs%.`

## 定时器

定时器会按计划在 Twitch 聊天中发送消息。可在 **命令** 下的 **定时器** 中管理，也可使用 `/twitch timers`。

| 设置 | 默认值 | 控制内容 |
| --- | --- | --- |
| 定时器名称 | | 命名规则与命令相同 |
| 间隔（分钟） | 10 | 发送之间的间隔，1 至 1440 分钟 |
| 最少聊天消息数 | 5 | 上次发送后需要至少收到的聊天消息数，之后才会再次发送；设为 0 则禁用此检查 |
| 仅在线时 | 开启 | 仅在频道直播时发送 |
| 随机轮换 | 关闭 | 随机选取一行内容，而非按顺序循环 |
| 已启用 | 开启 | 定时器是否运行 |
| 消息 | | 每行一条消息 |

调度器每 30 秒检查一次定时器。定时器内容支持 `%channel%`、`%url%`、`%stream%`、`%count:name%` 和 `%random:a|b|c%`。`/twitch timers test`（或仪表板上的测试按钮）可立即发送一条定时器消息。

## 语录与计数器

语录会保存其文本、可选的作者以及添加者。仪表板的 **语录** 子标签页允许工作人员添加、搜索和删除语录；观众则使用 `!quote`。计数器是简单的命名整数，管理员可在聊天中递增。工作人员可使用 `/twitch commands counter-set` 设置数值，并使用 `counter-list` 列出所有计数器。

## 事件同步到 Discord

**事件** 标签页中的 **提醒** 子标签页包含订阅、突袭和频道积分相关设置。开播通知则位于 **设置**、**机器人设置**、**事件路由** 下。

### 开播与下播

频道开播时，机器人会发送到 **开播通知 Discord 频道**。如果没有设置 **开播消息**，机器人会发送默认嵌入消息，包括与频道关联的主播名称、作为作者行的标题、状态、观看人数、分类和预览图。自定义消息会通过嵌入构建器处理，因此完整的嵌入和组件均可使用。频道下播时，同一频道会收到一条简短的红色“Offline”嵌入消息。

| 占位符 | 值 |
| --- | --- |
| `%streamer%` | 主播的显示名称 |
| `%title%` | 直播标题 |
| `%game%` | 分类名称 |
| `%url%` | `https://twitch.tv/<channel>` |
| `%viewers%` | 当前观看人数 |

### 订阅与突袭

这些是纯文本消息。默认订阅消息为 `%display% subscribed to %channel%!`；礼物订阅则为 `%display% received a gifted sub on %channel%!`。默认突袭消息为 `%raider% raided %channel% with %viewers% viewers!`。

| 事件 | 占位符 |
| --- | --- |
| 订阅 | `%user%`、`%display%`、`%channel%`、`%tier%` |
| 突袭 | `%raider%`、`%channel%`、`%viewers%` |

每个提醒都有一个 **发送测试** 按钮，**事件历史** 列表会显示最近的事件和测试发送记录。

### 频道积分操作

在 **频道积分操作** 下，将 **奖励标题**（不区分大小写匹配）映射到 **Twitch 回复**、带有 **Discord 消息** 的 **Discord 频道**，或两者同时设置。可用占位符：`%user%`、`%display%`、`%channel%`、`%reward%`、`%input%`（观众输入的内容）和 `%url%`。

### 直播回顾

`/twitch events recap-channel` 用于设置一个频道，直播结束时该频道会收到一条嵌入消息，内容包括直播时长、最高观看人数、聊天消息数、订阅和突袭数，以及最后一次使用的标题和分类。直播回顾无法在仪表板中设置。

## 账号关联与身份组同步

有两种方式可将 Discord 成员与 Twitch 登录名关联：

1. 自助关联：观众在 Twitch 聊天中输入 `!link`，获得一个六位数的验证码，并在十分钟内于 Discord 中执行 `/twitch claim <code>`。
2. 工作人员操作：使用 **账号链接** 标签页，或执行 `/twitch links add @user twitchlogin`。

每个服务器中，每位 Discord 成员只能关联一个 Twitch 登录名。关联后，`%discord%` 会为该观众填充对应的值，并应用身份组同步。

身份组同步会通过 `/twitch rolesync add` 将 Twitch 等级映射到 Discord 身份组。每当已关联的观众发送聊天消息时，如果其等级达到或高于映射等级，机器人便会添加该身份组；如果低于该等级，则会移除。身份组同步仅可通过斜杠命令设置。

## 直播工具

**事件** 标签页中的 **直播工具** 子标签页提供直播操作功能，使用你的频道授权执行。可以用机器人身份发送聊天消息、创建直播标记、创建剪辑、发起投票（每行一个选项，默认持续 60 秒），以及通过消息 ID 进行禁言（默认 600 秒）、封禁、解封或删除消息。`/twitch stream-info` 和 `/twitch clip` 可在 Discord 中完成标题、分类和剪辑操作。

## 设置

在 **设置** 下的 **机器人设置** 中：

| 设置 | 默认值 | 控制内容 |
| --- | --- | --- |
| 命令前缀 | `!` | Twitch 聊天命令的前缀，最多 5 个字符 |
| 语言覆盖 | 服务器默认 | 用于机器人聊天回复的 BCP-47 语言标签，例如 `de-DE` |
| 为此服务器启用 Twitch 聊天机器人 | 开启 | 总开关；关闭后保留配置 |
| 使用 EventSub 处理聊天事件 | 开启 | 通过 EventSub 接收聊天和事件；关闭后聊天命令将不会运行 |
| 开播通知 Discord 频道 | 无 | 开播和下播消息的发送位置 |
| 开播消息 | 默认嵌入 | 包含开播占位符的自定义模板 |

在 **事件** 下的 **提醒** 中，可设置：**订阅 Discord 频道**、**订阅消息**、**突袭 Discord 频道**、**突袭消息**，以及频道积分操作列表。

## 设置指南

1. 在仪表板中打开 **Twitch 机器人**。机器人所有者必须先连接 **机器人账号**；**连接** 子标签页会显示是否已存在机器人账号。
2. 点击 **连接频道**，并使用你自己的 Twitch 账号授权。
3. 在 **机器人设置** 中设置前缀，开启 **为此服务器启用 Twitch 聊天机器人**，选择 **开播通知 Discord 频道**，然后保存。
4. 在 **命令** 中添加几条自定义命令以及一个社交媒体定时器。使用 **测试参数** 和预览功能检查占位符。
5. 在 **事件** 的 **提醒** 中，选择订阅和突袭频道，并分别点击 **发送测试**。
6. 在你的 Twitch 聊天中输入 `!ping`，确认机器人正在监听；然后输入 `!link` 并执行 `/twitch claim`，完成自己的账号关联。
7. 可选：执行 `/twitch rolesync add Subscriber @Subs`，让已关联的订阅者获得对应身份组。

## 命令

此模块仅支持斜杠命令。在 Discord 中输入 `/twitch` 即可查看。回复仅你自己可见。

| 命令 | 别名 | 所需权限 | 用途 |
| --- | --- | --- | --- |
| `/twitch set <channel> [prefix]` | | 管理服务器 | 设置 Twitch 频道和前缀，并启用该功能 |
| `/twitch remove` | | 管理服务器 | 禁用该功能并离开频道 |
| `/twitch enable` | | 管理服务器 | 重新启用该功能 |
| `/twitch disable` | | 管理服务器 | 关闭该功能，但保留设置 |
| `/twitch config` | | 无 | 显示频道、前缀、启用状态、开播通知频道和语言 |
| `/twitch claim <code>` | | 无 | 使用 `!link` 生成的验证码完成关联 |
| `/twitch stream-info [title] [category]` | | 管理服务器 | 更新直播标题或分类 |
| `/twitch clip` | | 管理服务器 | 为当前直播创建剪辑 |
| `/twitch status` | | 管理服务器 | 健康摘要：账号、令牌、EventSub 状态 |
| `/twitch language <tag>` | | 管理服务器 | 聊天回复使用的语言；留空则重置 |
| `/twitch prefix <prefix>` | | 管理服务器 | 修改聊天命令前缀 |
| `/twitch commands add <name> <response> [permission] [cooldown]` | | 管理服务器 | 添加或更新自定义命令 |
| `/twitch commands remove <name>` | | 管理服务器 | 删除自定义命令 |
| `/twitch commands list` | | 无 | 列出自定义命令及其权限、冷却时间和使用次数 |
| `/twitch commands counter-set <name> <value>` | | 管理服务器 | 设置计数器 |
| `/twitch commands counter-list` | | 无 | 列出计数器 |
| `/twitch commands schedule-set <message>` | | 管理服务器 | 设置 `!schedule` 的回复 |
| `/twitch commands schedule-clear` | | 管理服务器 | 清除该回复 |
| `/twitch commands socials-set <message>` | | 管理服务器 | 设置 `!socials` 的回复 |
| `/twitch commands socials-clear` | | 管理服务器 | 清除该回复 |
| `/twitch timers add <name> <messages> [interval] [minchat] [onlineonly] [randomize]` | | 管理服务器 | 添加或更新定时器 |
| `/twitch timers remove <name>` | | 管理服务器 | 删除定时器 |
| `/twitch timers list` | | 无 | 列出定时器 |
| `/twitch timers enable <name>` | | 管理服务器 | 启用定时器 |
| `/twitch timers disable <name>` | | 管理服务器 | 禁用定时器 |
| `/twitch timers test <name>` | | 管理服务器 | 立即发送定时器消息 |
| `/twitch events golive-channel <channel> [message]` | | 管理服务器 | 设置开播通知频道和模板 |
| `/twitch events golive-clear` | | 管理服务器 | 清除开播通知频道 |
| `/twitch events sub-channel <channel> [message]` | | 管理服务器 | 设置订阅频道和模板 |
| `/twitch events sub-clear` | | 管理服务器 | 禁用订阅消息 |
| `/twitch events raid-channel <channel> [message]` | | 管理服务器 | 设置突袭频道和模板 |
| `/twitch events raid-clear` | | 管理服务器 | 禁用突袭消息 |
| `/twitch events recap-channel <channel>` | | 管理服务器 | 设置直播回顾频道 |
| `/twitch events recap-clear` | | 管理服务器 | 禁用直播回顾 |
| `/twitch links add <@user> <twitchlogin>` | | 管理服务器 | 将成员关联到 Twitch 登录名 |
| `/twitch links remove <@user>` | | 管理服务器 | 删除成员的关联 |
| `/twitch links list` | | 无 | 列出所有关联 |
| `/twitch rolesync add <rank> <@role>` | | 管理服务器 | 为等级达到或高于指定值的已关联观众发放身份组 |
| `/twitch rolesync remove <rank> <@role>` | | 管理服务器 | 删除映射 |
| `/twitch rolesync list` | | 无 | 列出映射 |
| `/twitch redemptions add <reward> [twitchreply] [channel] [discordmessage]` | | 管理服务器 | 添加或更新频道积分操作 |
| `/twitch redemptions remove <reward>` | | 管理服务器 | 删除一项操作 |
| `/twitch redemptions list` | | 无 | 列出操作 |
| `/twitch raidtargets add <twitchlogin> [note]` | | 管理服务器 | 将频道加入 `!raidtarget` 目标池 |
| `/twitch raidtargets remove <twitchlogin>` | | 管理服务器 | 从目标池中移除频道 |
| `/twitch raidtargets list` | | 无 | 列出突袭目标 |

## 小贴士与注意事项

- 机器人账号由机器人上的所有服务器共用。如果没有人连接机器人账号，无论你如何配置，聊天回复都无法发送。
- 只有在 **使用 EventSub 处理聊天事件** 开启时，聊天命令才会运行。如果运行状况面板显示 Legacy IRC，请将其重新开启。
- 直播状态每分钟轮询一次，因此开播消息可能比实际开播时间晚最多一分钟。
- 自定义命令的冷却时间按频道计算，而非按观众。30 秒的冷却时间意味着所有人合计每 30 秒才能使用一次。
- 身份组同步会在已关联的观众发言时运行，而不是按计划运行。从不在聊天中发言的订阅者永远不会获得身份组；已过期的订阅者则会保留身份组，直到其再次发言。
- 要更改身份组，机器人的身份组必须位于被同步身份组之上，并且拥有 **管理身份组** 权限。
- 传递给 `rolesync` 的未知等级会回退为订阅者；传递给 `commands add` 的未知权限会回退为所有人。
- 关联验证码十分钟后过期，生成新验证码会使旧验证码失效。
- 直播工具中的禁言和封禁使用你频道的内容审核权限，因此在 Twitch 中会显示为由已授权账号执行的操作。
- 语言覆盖仅影响 Twitch 聊天回复，Discord 回复仍使用服务器语言。
