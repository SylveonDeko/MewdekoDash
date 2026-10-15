---
title: 活动统计
slug: serverstats
summary: 服务器、成员或频道在最长九十天内任意时间段的消息、语音时长、游戏和成员增长，附带图表、排行榜、导出以及隐私退出选项。
icon: fa-chart-simple
category: Analytics
dashboard: /dashboard/serverstats
module: ServerStats
tags: [activity, stats, statistics, statbot, voice time, games, presence, lookback, top chatters, charts, member growth, status, snapshots, privacy, opt out, 活动, 统计, 语音时长, 游戏, 在线状态, 回溯, 发言排行, 图表, 成员增长, 状态, 快照, 隐私, 退出]
related: [messagestats, statroles, liveboards, statchannels, invites]
---

## 功能简介

机器人本来就会统计消息。活动统计在此基础上新增了语音时长、游戏和应用、每小时的成员与状态快照，并让你可以查询任意时间段的数据：过去一天、一周、一个月、最长九十天，或全部时间。所有数据都可以在仪表板中查看，也可以通过命令、图表、CSV 导出，并用于身份组统计、实时看板、报告和统计频道。

## 追踪内容

| 数据 | 方式 |
| --- | --- |
| 消息 | 每条被计数的消息都带有时间戳，保存九十天，并保留每位成员和每个频道的累计总数 |
| 语音时长 | 每位成员在每个频道中的时段记录；成员切换频道、静音、拒听、开始直播或开启摄像头时都会分段，保存九十天，并保留累计总数 |
| 游戏和应用 | 每位成员每项活动（游戏中、直播中、收听、观看、比赛中）的时段记录，保存九十天，并保留累计总数。默认关闭 |
| 快照 | 每小时统计一次成员、人类用户、机器人、在线、闲置、请勿打扰、离线和语音中的人数，保存九十天 |
| 加入和离开 | 每次加入和离开都带有时间戳 |

最长九十天的时间段读取带时间戳的数据。**全部时间** 则读取累计总数，因此即使九十天的数据已过期，它仍可正常工作。

## 游戏和应用

游戏追踪默认关闭，需要手动开启，因为它是最消耗资源的追踪项。开启后，机器人会监控每位成员的在线状态，并记录每个游戏、直播、Spotify 会话或观看应用的持续时长。

- **验证活动**（默认开启）只统计 Discord 本身确认的活动：即带有已注册应用 ID 的活动、Spotify 和直播。修改过的客户端可以声称自己在玩任何游戏，因此开启此项后，普通的自定义活动名称会被忽略。
- **活动筛选器** 是一份游戏名称列表，可设为**黑名单**（列出的游戏会被忽略）或**白名单**（只统计列出的游戏）。
- 自定义状态永远不会被计入。

## 仪表板选项卡

| 选项卡 | 显示内容 |
| --- | --- |
| 概览 | 消息、语音时长、发言人数、加入、离开、净增长、当前成员数、发言最多的成员、语音时长最多的成员、最活跃的频道和最常玩的游戏，以及消息、语音小时数、成员、成员状态以及加入和离开的图表 |
| 排行榜 | 按消息、语音或游戏时长排名的成员和频道，以及带玩家数量的热门游戏，可导出为 CSV。点击成员、频道或游戏即可打开详情 |
| 成员与频道 | 某位成员的消息、语音时长、排名、累计总数、常用频道和游戏；某个频道的活动及活跃成员；以及任意游戏的**谁在玩** |
| 设置 | 所有追踪器、默认时间段、消息冷却、机器人、不计入统计的语音状态、忽略的频道、身份组和成员，以及活动筛选器 |

## 设置

| 设置 | 默认值 | 作用 |
| --- | --- | --- |
| 默认时间段 | 14 天 | 未指定时间段时，命令和页面所使用的时间范围 |
| 消息冷却 | 0 | 同一成员两条被计数消息之间的最短间隔（秒），防止刷屏虚增统计 |
| 追踪语音时长 | 开启 | 是否记录语音时段 |
| 每小时快照 | 开启 | 是否每小时采样一次成员和状态数量 |
| 统计机器人 | 关闭 | 是否将机器人账号计入统计 |
| 追踪游戏和应用 | 关闭 | 是否记录在线活动 |
| 验证活动 | 开启 | 仅统计 Discord 认证的活动 |
| 不计入统计的语音状态 | 无 | 自我静音、自我拒听、服务器静音、服务器拒听、挂机频道、独自一人、直播中、开启摄像头中的任意一项 |
| 忽略的频道、身份组、成员 | 无 | 这些对象的任何内容都不会被计入 |

## 隐私

任何成员都可以运行 `statsprivacy`（或 `/serverstats privacy`）退出统计。其在机器人所在的每个服务器中已记录的消息、语音时长和游戏时长都会被删除，在其再次运行该命令重新加入之前，不会记录任何新数据。服务器管理员无法覆盖此设置。

## 命令

请使用你服务器的前缀运行这些命令（如果你没有修改，默认为 `.`）。每个命令也可以通过 `/serverstats` 使用。`days` 表示时间段；0 表示全部时间，省略则使用服务器默认值。

| 命令 | 别名 | 所需权限 | 用途 |
| --- | --- | --- | --- |
| `serveractivity [days]` | `sstats` | 无人 | 服务器概览 |
| `useractivity [@user] [days]` | `ustats`、`mystats` | 无人 | 成员的消息、语音时长、排名、累计总数、常用频道和游戏 |
| `channelactivity [#channel] [days]` | `cstats` | 无人 | 频道的活动及活跃成员 |
| `activitytop [Messages/Voice/Activity] [days] [@role]` | `topchatters`、`topvoice` | 无人 | 成员排名 |
| `activitytopchannels [Messages/Voice] [days]` | `topchannels` | 无人 | 频道排名 |
| `topgames [days]` | `games` | 无人 | 最常玩的游戏和应用 |
| `whoplays <game>` | | 无人 | 当前正在玩某游戏的人，以及玩得最多的人 |
| `activitychart [Messages/Voice/Members/Status/Joins/Leaves/Growth/InVoice/Activities] [days]` | `graph` | 无人 | 图表图片 |
| `activityexport [Messages/Voice/Activity] [days]` | | 管理服务器 | CSV 排行榜 |
| `statssettings` | | 管理服务器 | 显示设置 |
| `statslookback <days>`、`statscooldown <seconds>` | `lookback` | 管理服务器 | 默认时间段和消息冷却 |
| `statstrackvoice`、`statstracksnapshots`、`statscountbots`、`statstrackactivities`、`statsverifyactivities` | `trackvoice`、`trackgames` | 管理服务器 | 切换各个追踪器 |
| `statsignorevoicestate <state>` | | 管理服务器 | 切换某种语音状态是否计入统计 |
| `statsignore <#channel, @role or @user>`、`statsignored` | | 管理服务器 | 排除对象 |
| `statsactivityfiltermode <Whitelist/Blacklist>`、`statsactivityfilter <game>`、`statsactivityfilters` | `gamefilter` | 管理服务器 | 活动筛选器 |
| `statsprivacy` | `optoutstats` | 无人 | 退出或重新加入所有服务器的统计追踪 |

## 技巧与注意事项

- 成员和状态图表会在开启快照一小时后开始填充；在此之前没有历史数据。
- 语音时长只在机器人运行期间计算。重启会关闭并重新开启每个会话，数据不会丢失，但时段的分界点会发生变化。
- 排除某个频道不仅会停止新的计数，还会将其历史数据从所有查询中隐藏，因此旧的数字也会随之改变。
- 消息计数本身必须开启（即消息统计页面中的开关），消息数据才会在这里显示。
- 筛选器和 `whoplays` 中的游戏名称不区分大小写。
