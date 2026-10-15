---
title: 统计频道
slug: statchannels
summary: 名称会自动更新、显示实时数字的语音频道，例如成员数、助推数、未关闭的工单数或 Twitch 观众数。
icon: fa-chart-simple
category: Community
dashboard: /dashboard/statchannels
module: StatChannels
tags: [stat channels, counter, member count, live stats, voice channel stats, countdown, member goal, boost count, twitch viewers, 统计频道, 计数器, 成员数, 实时统计, 语音频道统计, 倒计时, 成员目标, 助推数, Twitch 观众数]
related: [counting, twitch, suggestions, xp, afk, starboard]
---

## 功能简介

统计频道是一个锁定的语音频道，位于频道列表顶部，并在名称中显示一个数字，例如 "Members: 12,480"。机器人会按计划重写名称，使数字保持最新。成员无法加入该频道，它只用于查看。

你可以选择计数器类型、名称模板、数字的显示样式以及刷新频率。机器人支持几十种计数器，涵盖服务器信息、在线状态、Nitro 助推、表情符号槽位、成员目标和倒计时，还可以读取 Mewdeko 其他功能的数据，例如工单、建议、抽奖、XP、计数游戏、星标板，以及已关联的 Twitch 或 Minecraft 服务器。

Discord 限制每个频道每 10 分钟只能重命名两次。统计频道通过多种更新机制来绕过这一限制，其中包括删除并重新创建频道的方式，从而可以每分钟刷新一次。

## 适用场景

- 在服务器顶部显示成员数、真人数和机器人数。
- 以百分比或进度条的形式追踪成员目标的完成进度。
- 倒计时到活动、上线或周年纪念日。
- 为主播的服务器显示 Twitch 直播状态和观众数。
- 让工作人员无需打开仪表板即可实时查看未关闭的工单或待处理的建议。
- 在邀请链接旁显示 Minecraft 服务器的状态和在线玩家数。

## 计数器类型

以下完整列表即 `statchanneltypes` 命令和仪表板的 **可用计数器** 板块所列出的内容。每种类型都支持通用占位符，部分类型还有各自的专属占位符。默认模板以一个对应的表情符号开头，后接所示文本。

### 成员

| 类型 | 显示内容 | 默认模板 | 额外占位符 |
| --- | --- | --- | --- |
| `TotalMembers` | 所有成员，包括机器人 | `Members: %count%` | |
| `HumanMembers` | 非机器人的成员 | `Humans: %count%` | |
| `BotCount` | 机器人账号 | `Bots: %count%` | |
| `OnlineMembers` | 处于任何非离线状态的成员 | `Online: %count%` | |
| `IdleMembers` | 标记为闲置的成员 | `Idle: %count%` | |
| `DndMembers` | 标记为请勿打扰的成员 | `DND: %count%` | |
| `StreamingMembers` | 正在直播的成员 | `Streaming: %count%` | |
| `InVoiceMembers` | 已连接到任意语音频道的成员 | `In Voice: %count%` | |
| `RoleMembers` | 拥有指定身份组的成员 | `%role.name%: %count%` | `%role.name%`、`%role.id%`、`%role.color%` |
| `NewestMember` | 最近加入的成员 | `Newest: %member.name%` | `%member.name%`、`%member.id%` |
| `MembersJoinedToday` | 过去 24 小时内加入的成员 | `Joined Today: %count%` | |
| `MembersJoinedWeek` | 过去 7 天内加入的成员 | `This Week: %count%` | |
| `MemberGoal` | 距离目标成员数的进度 | `%count% / %goal%` | `%goal%`、`%goal.raw%`、`%goal.percent%`、`%goal.remaining%`、`%goal.bar%` |
| `AfkCount` | 当前通过 Mewdeko 设置为离开状态（AFK）的成员 | `AFK: %count%` | |

### 服务器

| 类型 | 显示内容 | 默认模板 | 额外占位符 |
| --- | --- | --- | --- |
| `Countdown` | 距离目标日期的剩余时间 | `%days%d %hours%h left` | `%days%`、`%hours%`、`%minutes%`、`%total.hours%` |
| `ChannelCount` | 所有频道 | `Channels: %count%` | |
| `TextChannelCount` | 文字频道 | `Text: %count%` | |
| `VoiceChannelCount` | 语音频道 | `Voice: %count%` | |
| `CategoryCount` | 频道分类 | `Categories: %count%` | |
| `StageChannelCount` | 舞台频道 | `Stages: %count%` | |
| `ForumChannelCount` | 论坛频道 | `Forums: %count%` | |
| `ThreadCount` | 当前被缓存为活跃状态的子区 | `Threads: %count%` | |
| `RoleCount` | 身份组 | `Roles: %count%` | |
| `BoostCount` | 当前有效的 Nitro 助推数 | `Boosts: %count%` | |
| `BoostLevel` | 助推等级，0 至 3 | `Level %count%` | |
| `NextBoostGoal` | 达到下一等级还需的助推数 | `%count% to Tier %tier.next%` | `%tier.next%`、`%tier.current%` |
| `EmojiCount` | 所有自定义表情符号 | `Emojis: %count%` | |
| `AnimatedEmojiCount` | 动态自定义表情符号 | `Animated: %count%` | |
| `StaticEmojiCount` | 静态自定义表情符号 | `Static: %count%` | |
| `StickerCount` | 自定义贴纸 | `Stickers: %count%` | |
| `EmojiSlotsUsed` | 已使用的表情符号槽位与等级上限的对比 | `Slots: %count%/%slots.max%` | `%slots.max%`、`%slots.free%` |
| `ServerAge` | 服务器创建至今的天数 | `Age: %count% days` | `%years%`、`%created%` |
| `EventCount` | 已安排的活动 | `Events: %count%` | |
| `BotUptime` | Mewdeko 已持续运行的时间 | `Uptime: %days%d %hours%h` | `%days%`、`%hours%`、`%minutes%` |
| `InviteCount` | 邀请追踪功能记录的邀请数 | `Invites: %count%` | |

### Twitch

以下类型读取通过 Twitch 模块关联的 Twitch 频道数据。

| 类型 | 显示内容 | 默认模板 | 额外占位符 |
| --- | --- | --- | --- |
| `TwitchLiveStatus` | 频道是否正在直播 | `%twitch.name%: %status%` | `%status%`、`%twitch.name%` |
| `TwitchViewers` | 当前观众数 | `Viewers: %count%` | `%twitch.name%` |
| `TwitchGame` | 正在直播的分类 | `%game%` | `%game%`、`%title%`、`%twitch.name%` |
| `TwitchUptime` | 直播已持续的时间 | `Live %hours%h %minutes%m` | `%hours%`、`%minutes%` |
| `TwitchFollowers` | 关注者总数 | `Followers: %count%` | `%twitch.name%` |
| `TwitchSubs` | 订阅者总数 | `Subs: %count%` | `%twitch.name%` |
| `TwitchCounter` | 一个指定名称的 Twitch 聊天计数器 | `%counter.name%: %count%` | `%counter.name%` |
| `TwitchLastRaider` | 最近一次突袭的发起者 | `Last Raid: %raider%` | `%raider%`、`%raid.viewers%` |
| `TwitchRecentStreams` | 过去 14 天内开始的直播场次 | `Streams: %count%` | |

### 其他 Mewdeko 功能

| 类型 | 分类 | 显示内容 | 默认模板 | 额外占位符 |
| --- | --- | --- | --- | --- |
| `MinecraftPlayers` | Minecraft | 被监控服务器的在线玩家数 | `Players: %count%/%players.max%` | `%players.max%`、`%server.version%` |
| `MinecraftStatus` | Minecraft | 被监控服务器是否可以连接 | `%status%` | `%status%`、`%latency%` |
| `CountingCurrent` | 计数 | 计数频道中的当前数字 | `Count: %count%` | |
| `CountingRecord` | 计数 | 曾达到的最高数字 | `Record: %count%` | |
| `OpenTickets` | 工单 | 未关闭、未归档的工单 | `Open Tickets: %count%` | |
| `TicketsToday` | 工单 | 过去 24 小时内开启的工单 | `Today: %count%` | |
| `PendingSuggestions` | 建议 | 等待处理的建议 | `Pending: %count%` | |
| `ActiveGiveaways` | 抽奖 | 当前进行中的抽奖 | `Giveaways: %count%` | |
| `StarboardPosts` | 星标板 | 星标板帖子总数 | `Starred: %count%` | |
| `TopXpUser` | XP | XP 最高的成员 | `Top: %member.name%` | `%member.name%`、`%member.id%`、`%member.xp%` |
| `TotalGuildXp` | XP | 服务器内获得的全部 XP | `Total XP: %count%` | |
| `TotalCurrency` | 货币 | 成员持有的货币 | `In Circulation: %count%` | |
| `ActivePolls` | 投票 | 仍可投票的投票 | `Polls: %count%` | |
| `Clock` | 服务器 | 服务器所在时区的日期和时间 | `%time% %tz%` | `%time%`、`%date%`、`%datetime%`、`%weekday%`、`%tz%` |
| `MessagesToday`、`MessagesWeek` | 活动 | 过去 24 小时或 7 天内的消息数 | `Today: %count%` | |
| `VoiceHoursToday`、`VoiceHoursWeek` | 活动 | 过去 24 小时或 7 天内所有成员的语音时长 | `Today: %count%h` | |
| `TopChatter` | 活动 | 过去 7 天内最活跃的发言者 | `Chatter: %member.name%` | `%member.name%`、`%member.id%`、`%member.messages%` |
| `TopVoiceMember` | 活动 | 过去 7 天内语音时长最长的成员 | `Voice: %member.name%` | `%member.name%`、`%member.id%`、`%member.hours%` |
| `TopGame` | 活动 | 过去 7 天内玩得最多的游戏（需要开启游戏追踪） | `%game%` | `%game%`、`%hours%`、`%players%` |
| `PlayingNow` | 活动 | 当前正在玩被追踪游戏的成员（需要开启游戏追踪） | `Playing: %count%` | |
| `RoleMembersOnline` | 成员 | 拥有指定身份组且非离线的成员 | `%role.name%: %count%` | `%role.name%`、`%role.id%`、`%role.total%` |
| `TopInviter` | 邀请追踪 | 邀请人数最多的成员 | `Inviter: %member.name%` | `%member.name%`、`%member.id%`、`%member.invites%` |
| `InvitesWeek` | 邀请追踪 | 过去 7 天内记在邀请人名下的加入数 | `This Week: %count%` | |
| `MembersLeftToday`、`MembersLeftWeek` | 成员 | 过去 24 小时或 7 天内离开的成员 | `Left Today: %count%` | |
| `NetGrowthWeek` | 成员 | 过去 7 天内的加入数减去离开数 | `Growth: %count%` | `%joins%`、`%leaves%` |

### 所有类型通用的占位符

| 占位符 | 值 |
| --- | --- |
| `%count%` | 数值，按所选显示样式渲染 |
| `%count.raw%` | 纯数字形式的数值 |
| `%server.name%` | 服务器名称 |
| `%server.id%` | 服务器 ID |
| `%server.members%` | 成员总数 |
| `%server.boostcount%` | 助推数 |
| `%server.boostlevel%` | 助推等级 |

频道名称受 Discord 的 100 个字符上限限制。

## 显示样式

**计数器样式** 决定 `%count%` 如何渲染。它仅适用于数字类计数器；文本类计数器（例如 `NewestMember`）会原样显示文本，而真/假类计数器（例如 `TwitchLiveStatus`）会显示 "LIVE" 或 "Offline" 之类的文字。

| 样式 | 数字 1234 的示例 | 说明 |
| --- | --- | --- |
| `Plain` | `1234` | 原始数字 |
| `Comma` | `1,234` | 千位分隔符。默认样式。 |
| `Compact` | `1.2K` | 使用 K、M、B、T 后缀，默认保留一位小数 |
| `Padded` | `1234` | 补零至固定宽度，默认为四位，因此 42 会显示为 `0042` |
| `Ordinal` | `1,234th` | 添加 st、nd、rd 或 th 后缀 |
| `Percent` | `61.7%` | 数值占目标值的百分比，默认保留一位小数 |
| `ProgressBar` | 十格进度条 | 按目标值显示已填充和未填充的格子，默认为十格 |
| `EmojiDigits` | 键帽数字 | 每个数字显示为一个键帽表情符号 |
| `Roman` | `MCCXXXIV` | 1 至 3999 使用罗马数字，超出范围则退回为逗号样式 |

`Percent` 和 `ProgressBar` 需要一个目标值进行比较。没有目标值时，它们会显示 `0%` 或空的进度条。

## 更新机制

| 机制 | 仪表板标签 | 工作方式 |
| --- | --- | --- |
| `Rename` | 仅重命名 | 编辑频道名称。Discord 限制每个频道每 10 分钟最多重命名两次，因此刷新间隔至少强制为 5 分钟。频道 ID 不会改变。 |
| `Recreate` | 删除并重新创建 | 以相同的名称、分类、位置和权限覆盖创建新频道，然后删除旧频道。可以每分钟刷新一次，但每次更新频道 ID 都会改变，且每次更新会留下两条审计日志。 |
| `Auto` | 自动（推荐） | 在每 10 分钟两次的重命名配额允许时进行重命名。配额用完且间隔不足 5 分钟时，改为重新创建。间隔为 5 分钟或以上时，只等待下一个可重命名的时机。 |

新建统计频道的默认设置为 **自动**，每 **5 分钟** 刷新一次。刷新间隔被限制在 1 分钟（使用仅重命名时为 5 分钟）到 1440 分钟之间。机器人每 30 秒检查一次，找出刷新间隔已到期的频道。

> [!WARNING]
> 重新创建会改变频道 ID。其他引用该频道的内容，例如其他机器人中的权限设置或固定的链接，都会在每次刷新时失效。仅在快速刷新比保持 ID 稳定更重要的地方使用。

## 设置

该页面有三个标签页：**统计频道**、**添加**和**默认设置**，标题栏还有一个 **刷新** 按钮。**统计频道** 标签页列出所有已配置的频道，每个频道都有 **编辑** 和 **移除** 按钮。

**添加统计频道** 提供 **创建新频道** 或 **使用现有频道** 选项，并可通过 **语音频道** 选择器选择频道，然后配置以下内容：

| 设置 | 默认值 | 作用 |
| --- | --- | --- |
| 分类（可选） | 无 | 新建频道的放置位置 |
| 计数器 | 无 | 来自上方目录的计数器类型 |
| 模板 | 该类型的默认模板 | 带占位符的频道名称；点击占位符标签即可插入，预览会随输入实时更新 |
| 计数器样式 | Comma | 上表中的显示样式 |
| 更新机制 | Auto | 仅重命名、重新创建或自动 |
| 刷新间隔（分钟） | 5 | 名称的刷新频率 |
| 身份组 | 无 | 用于 `RoleMembers` |
| 目标日期 | 无 | 用于 `Countdown` |
| 目标值 | 无 | 用于 `MemberGoal`，以及百分比和进度条样式 |
| Twitch 计数器名称 | 无 | 用于 `TwitchCounter` |
| 计数频道 | 无 | 用于各计数类类型 |
| Minecraft 服务器 | 无 | 用于各 Minecraft 类型 |

**新统计频道的默认设置** 用于设置之后添加的频道的 **默认更新机制**、**默认计数器样式** 和 **默认刷新间隔（分钟）**。**默认设置** 标签页还包含 **计数器样式** 和 **可用计数器** 两个参考板块。

新建的频道会对 `@everyone` 拒绝 **连接** 权限，使其仅作为标签使用。你自行添加的频道则保留其现有权限。

## 设置步骤

1. 在仪表板中打开 **统计频道**，进入 **默认设置** 标签页。将 **默认更新机制** 保持为自动，并设置你满意的刷新间隔。
2. 进入 **添加**，选择 **创建新频道**，如果希望将计数器归类，可选择一个 **分类**。
3. 选择一个 **计数器**，例如成员总数。调整 **模板** 并观察预览效果。
4. 选择 **计数器样式** 并保存。
5. 为每个计数器重复以上步骤。如需设置成员目标，选择 `MemberGoal`，设置 **目标值**，并尝试使用 `ProgressBar` 样式。
6. 如果新频道没有出现在 Discord 频道列表的顶部，请将其拖到顶部。
7. 等待一个刷新间隔，确认名称已更新。

## 命令

使用服务器的前缀运行以下命令（除非你更改过，否则为 `.`）。类型、样式和机制均使用上表中的名称，例如 `TotalMembers`、`Compact`、`Recreate`。

| 命令 | 别名 | 所需权限 | 用途 |
| --- | --- | --- | --- |
| `statchannelcreate <type> [template]` | `scnew` | 管理频道 | 创建一个显示该计数器的新锁定语音频道 |
| `statchanneladd #voice <type> [template]` | `sca` | 管理频道 | 将现有语音频道转换为统计频道 |
| `statchannelrole #voice @role [true] [template]` | `scr` | 管理频道 | 添加身份组成员计数器；`true` 表示仅统计非离线的成员 |
| `statchannelcountdown #voice <date> [template]` | `scc` | 管理频道 | 添加距离某个日期的倒计时 |
| `statchannelgoal #voice <number> [template]` | `scg` | 管理频道 | 添加成员目标计数器 |
| `statchanneltwitchcounter #voice <counter> [template]` | | 管理频道 | 同步一个指定名称的 Twitch 聊天计数器 |
| `statchannelmechanism #voice <mechanism> [minutes]` | | 管理频道 | 设置仅重命名、重新创建或自动，并可选设置刷新间隔 |
| `statchannelstyle #voice <style>` | | 管理频道 | 设置显示样式 |
| `statchanneldefaults [mechanism] [minutes] [style]` | | 管理频道 | 设置新统计频道的默认值 |
| `statchanneltypes [category]` | | 无 | 浏览所有计数器及示例，可按分类筛选 |
| `statchannellist` | `scl` | 无 | 列出本服务器的统计频道，包括类型、样式、模式和模板 |
| `statchannelremove #voice` | `statchrm` | 管理频道 | 停止追踪该频道 |

`statchannelcreate` 还要求机器人拥有 **管理频道** 权限。斜杠命令版本位于 `/statchannel` 下。

## 提示与注意事项

- 机器人需要 **管理频道** 权限才能重命名或重新创建频道。
- 一个语音频道只能成为一个统计频道。重复添加会失败，并提示 "already a stat channel"。
- 计数、Minecraft 和 Twitch 计数器需要先设置好对应功能。计数和 Minecraft 的目标在仪表板中选择，没有对应的命令。
- `statchannelremove` 只会停止追踪。如果你不再需要该语音频道，请自行将其删除。
- Twitch 观众数或未关闭工单等实时数值仍遵循该频道自身的刷新间隔。对于这些频道，请单独调低间隔，而不是调整所有频道。
- `Percent` 和 `ProgressBar` 样式使用频道自身的目标值。如果计数器未设置目标值，则始终显示为零。
