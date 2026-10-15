---
title: 实时看板
slug: liveboards
summary: 在频道中置顶排行榜、图表或概览，让机器人持续编辑更新，并按计划发布每日、每周或每月的摘要。
icon: fa-thumbtack
category: Community
dashboard: /dashboard/liveboards
module: ServerStats
tags: [live boards, pinned leaderboard, pin leaderboard, auto updating, server report, weekly report, monthly report, digest, growth report, 实时看板, 置顶排行榜, 自动更新, 服务器报告, 周报, 月报, 摘要, 增长报告]
related: [serverstats, invites, statchannels, statroles]
---

## 功能简介

实时看板是机器人发布一次并置顶的消息，之后会按设定的间隔编辑，使其始终显示最新数据。服务器报告则是每天、每周或每月发布一次的一次性嵌入消息，包含增长图表，总结自上次报告以来的情况。

## 看板

| 看板 | 显示内容 |
| --- | --- |
| 邀请排行榜 | 邀请最多的成员，包括常规、离开和虚假计数 |
| 消息排行榜 | 发言最多的成员 |
| 语音排行榜 | 语音时长最长的成员 |
| 热门游戏 | 玩得最多的游戏和应用及其玩家数（需开启游戏追踪） |
| 加入图表、离开图表、增长图表 | 每日加入和离开人数 |
| 成员图表 | 根据每小时快照得出的成员数 |
| 消息图表 | 每日消息数 |
| 服务器概览 | 与 `serveractivity` 相同的摘要 |
| 邀请分析 | 加入、离开、留存、虚假加入和来源 |

每个看板都有**时间范围**（最近一天、一周、一个月或全部时间；图表在全部时间下最多使用 90 天的数据）、不低于 5 分钟的刷新间隔、排行榜的行数，以及置顶开关。每个服务器最多可以有 10 个看板。删除看板会同时删除其消息。如果有人手动删除了消息，机器人会在下一次刷新时发布一条新消息。

## 服务器报告

设置频道和发布频率后，机器人会在首次到达计划时间时发布报告，之后每天 UTC 00:00、每周一，或每月 1 日发布。报告包含：

- 该时段的加入、离开、净增长和留存
- 消息、语音时长和活跃成员
- 成员数及其变化
- 邀请最多的成员、发言最多的成员、语音活跃成员和最繁忙的频道
- 热门邀请码及其标签；开启游戏追踪时还包括热门游戏
- 加入与离开图表

**立即发送报告**会马上发布一条报告，但不会更改计划。如果机器人失去在该频道发布消息的权限，报告会自动关闭。

## 命令

请使用服务器的前缀运行以下命令（默认为 `.`，除非你修改过）。看板也可以通过 `/liveboard` 使用，报告则通过 `/serverreport` 使用。

| 命令 | 别名 | 所需权限 | 用途 |
| --- | --- | --- | --- |
| `liveboardadd <#channel> <board> [range] [rows] [minutes]` | `pinboard`, `pinleaderboard` | 管理服务器 | 发布并置顶一个看板 |
| `liveboardlist` | `liveboards` | 管理服务器 | 列出所有看板 |
| `liveboardremove <id>` | `unpinboard` | 管理服务器 | 删除看板及其消息 |
| `liveboardrefresh` | | 管理服务器 | 立即刷新所有看板 |
| `serverreportchannel [#channel]` | `reportchannel` | 管理服务器 | 设置报告频道并启用报告，或关闭报告 |
| `serverreportfrequency <Daily/Weekly/Monthly>` | `reportfrequency` | 管理服务器 | 设置报告发布频率 |
| `serverreportnow [frequency]` | `reportnow` | 管理服务器 | 在当前频道发布一条报告 |

## 注意事项

- 置顶需要该频道的「管理消息」权限。没有该权限时，看板仍会发布，只是不会置顶。
- 看板会编辑同一条消息，因此在繁忙的频道中，看板会被其他消息顶上去；建议将其放在专门的统计频道中，或依靠置顶功能。
- 排行榜遵循邀请和活跃度的排除规则，因此被隐藏或忽略的成员不会出现在置顶看板中。
- 统计频道是另一种展示实时数据的方式：将计数器显示在频道名称中，而不是通过消息显示。
