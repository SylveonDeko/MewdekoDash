---
title: 邀请
slug: invites
summary: 将每次加入归因于邀请码、专属链接或应用，按成员统计常规、离开、虚假和奖励邀请数，为邀请码添加标签，并查看随时间变化的增长、留存和加入来源。
icon: fa-users
category: Community
dashboard: /dashboard/invites
module: Utility
tags: [invites, invite tracking, inviter, who invited, referrals, recruitment, leaderboard, fake invites, bonus invites, retention, vanity, labels, analytics, mass ban, 邀请, 邀请追踪, 邀请人, 推荐, 招募, 排行榜, 虚假邀请, 奖励邀请, 留存, 专属链接, 标签, 数据分析, 批量封禁]
related: [multigreets, statroles, liveboards, serverstats]
---

## 功能介绍

有人加入时，机器人会比较加入前后服务器的邀请链接，以确定使用的是哪一个；如果没有匹配的链接，则检查专属 URL，并记录该成员的加入方式：通过某位成员的邀请、通过专属链接、作为通过 OAuth 添加的机器人，或未知。邀请人会获得一次 **regular**（常规）邀请，除非该次加入被标记为 **fake**（虚假）。当被邀请的成员离开时，邀请人的 **已离开**（离开）计数会增加。管理人员可以发放 **bonus**（奖励）邀请。成员的总数为常规邀请减去离开和虚假邀请，再加上奖励邀请。

系统会保留每一次被记录的加入，包括成员离开之后的记录，因此页面可以显示留存情况（仍在服务器中的被邀请成员数）、重新加入的情况，以及哪些邀请码带来了会留下的成员。

## 为什么要使用它

- 举办招募竞赛，并根据排行榜发放奖励，且排行榜无法通过小号或反复加入退出来刷分。
- 为每个邀请码添加标签，以查看 Twitter 推广、合作服务器或 YouTube 链接是否真的带来了会留下的成员。
- 在欢迎消息中显示邀请人和邀请码。
- 当突袭者通过某个链接涌入时，找出某位邀请人带来的所有人并予以封禁。

## 加入如何归因

- 机器人需要 **管理服务器** 权限才能读取邀请列表。没有该权限，就不会记录任何内容。
- 每个服务器的加入会逐一处理。如果多人在两次检查之间使用同一邀请码，超出的部分会被记住，并计入后续加入者的名下，因此突发的加入不会丢失。
- 通过专属 URL 加入会记录为 **Vanity**（专属链接），且没有邀请人。通过 OAuth 添加的机器人会记录为 **机器人**（机器人）。
- 带标签且有所有者的邀请码会计入所有者名下，而不是创建该邀请的人。`invitelink` 生成的个人链接就是这样工作的。

## 虚假检测

当满足以下任一条件时，该次加入会被标记为虚假，邀请人将获得一次虚假邀请，而不是常规邀请：

| 原因 | 条件 |
| --- | --- |
| 自己 | 成员使用了自己的邀请 |
| 新账号 | 账号年龄小于 **Minimum account age**（最短账号年龄）（0 表示禁用此检查） |
| 重新加入 | 成员此前已加入过，且 **计入重新加入**（计入重新加入）已关闭 |
| 无头像 | 成员没有头像，且 **标记没有头像的成员**（标记没有头像的成员）已开启 |

位于 **黑名单** 中的邀请人，或拥有黑名单身份组的邀请人，仍会显示为邀请人，但永远不会获得积分。位于 **隐藏** 名单中的成员会被追踪，但不会出现在排行榜上。

## 仪表板标签页

| 标签页 | 显示内容 |
| --- | --- |
| 增长 | 最近一天、一周、一个月或全部时间的加入数、离开数、净增长、留存、虚假加入和加入来源；加入与离开的图表；热门邀请人和热门邀请码 |
| 排行榜 | 所有邀请人及其常规、离开、虚假、奖励和留存数据，可按时间范围或身份组筛选，并可导出为 CSV。点击某一行或选择某位成员即可查看其明细，添加或移除常规、奖励或虚假邀请，或将其重置 |
| 受邀成员 | 所有已记录的加入，可按邀请人、邀请码或标签筛选，显示加入方式、是否被标记以及是否仍在服务器中。可导出为 CSV |
| 邀请码与标签 | 服务器中的每个邀请码及其创建者、频道和使用次数。可为邀请码添加标签，并可选择一个身份组，通过该邀请码加入的所有人都会获得该身份组；也可以删除邀请码 |
| 设置 | 追踪、成员离开时移除积分、计入重新加入、标记无头像成员、最短账号年龄、个人链接指向的频道、加入与离开日志频道、黑名单、隐藏成员，以及导入和重置工具 |

## 设置

| 设置 | 默认值 | 作用 |
| --- | --- | --- |
| 追踪邀请 | 开 | 是否对加入进行归因 |
| 成员离开时移除积分 | 开 | 被邀请的成员离开时，邀请人的离开计数加一，总数随之降低 |
| 计入重新加入 | 开 | 关闭后，此前已加入过的成员会被标记为虚假邀请 |
| 标记没有头像的成员 | 关 | 没有头像的账号加入将计为虚假邀请 |
| 最短账号年龄 | 0 天 | 账号年龄小于此值的将被标记为虚假邀请 |
| 个人链接频道 | 系统频道 | `invitelink` 创建的邀请指向的位置 |
| 加入与离开日志频道 | 无 | 每次有人加入或离开时发布一条嵌入消息，说明谁邀请了谁、邀请码、账号年龄以及是否被标记为虚假 |

**从 Discord 导入使用记录**（从 Discord 导入使用记录）会将每位邀请人的常规总数提高到其所有邀请码使用次数之和，且永远不会降低，因此在重启或全新安装后再次运行是安全的。**重置已离开成员的邀请人**（重置已离开成员的邀请人）会清空所有已不在服务器中的成员的计数。**全部重置**（全部重置）会清空所有计数和加入记录。

## 问候占位符

只要开启追踪，任何问候都可以使用以下占位符。无法识别的值会回退为 `Unknown` 或 `0`。

| 占位符 | 值 |
| --- | --- |
| `%inviter.mention%`、`%inviter.username%`、`%inviter.id%`、`%inviter.avatar%` | 被计入的邀请人 |
| `%inviter.count%`、`%inviter.regular%`、`%inviter.left%`、`%inviter.fake%`、`%inviter.bonus%` | 邀请人的计数 |
| `%invite.code%`、`%invite.url%`、`%invite.uses%`、`%invite.label%`、`%invite.type%`、`%invite.fake%` | 所使用的邀请 |
| `%user.joincount%`、`%user.leavecount%` | 该成员加入和离开的次数 |
| `%server.members.ordinal%` | 成员数，显示为 1st、2nd、1,204th |
| `%user.joined.R%`、`%user.created.F%` 以及其他 Discord 时间戳格式 t、T、d、D、f、F、R | 加入时间和账号创建时间，显示为实时时间戳 |

## 命令

请使用服务器的前缀运行这些命令（除非你更改过，否则为 `.`）。每个命令也可以在 `/invites` 下使用。

| 命令 | 别名 | 所需权限 | 作用 |
| --- | --- | --- | --- |
| `invites [@user]` | | 无 | 成员的总数，包括常规、离开、虚假和奖励的明细及排名 |
| `whoinvited [@user]` | `invitedby` | 无 | 谁邀请了该成员、使用的邀请码，以及该次加入是否被标记 |
| `invitedusers [@user]` | `userinvites` | 无 | 该成员邀请的所有人，包括加入日期和标记 |
| `invitedbycode <code>` | | 无 | 通过某个邀请码加入的所有人 |
| `invitedbylabel <label>` | | 无 | 通过某个带标签邀请码加入的所有人 |
| `inviteleaderboard [AllTime/Daily/Weekly/Monthly] [@role]` | `inviteslb` | 无 | 某个时间范围的排行榜，可选择某个身份组 |
| `invitestats [range]` | `growthstats` | 无 | 加入数、离开数、净增长、留存、虚假加入、来源、热门邀请人和邀请码 |
| `invitecodes [@user]` | `mycodes` | 无 | 成员的邀请码及其使用次数 |
| `invitelink` | `findlink`, `mylink` | 无 | 你的个人永久链接；如果没有则会创建 |
| `addinvites`, `removeinvites`, `addbonusinvites`, `removebonusinvites`, `addfakeinvites`, `removefakeinvites <@user> <amount>` | | 管理服务器 | 调整成员的计数 |
| `resetinvites <@user>` 或 `resetinvites Server` 或 `resetinvites LeftMembers` | | 管理服务器；全服重置需要管理员 | 重置计数 |
| `syncinvites [@user]` | | 管理服务器 | 从 Discord 导入使用记录 |
| `deleteinvite <code>` | `delinvite` | 管理服务器 | 删除邀请码 |
| `purgeinvites [maxUses] [#channel]` | | 管理服务器 | 删除所有未添加标签且使用次数不超过该值的邀请码 |
| `inviteblacklist <@user or @role>` | `invbl` | 管理服务器 | 切换某人是否可以获得积分 |
| `invitehide <@user>` | `invhide` | 管理服务器 | 切换某人是否出现在排行榜上 |
| `inviteexclusions` | | 管理服务器 | 列出黑名单和隐藏成员 |
| `invitelabelset <code> <label>`, `invitelabelrole <code> [@role]`, `invitelabelremove <code>`, `invitelabels` | | 管理服务器 | 管理标签 |
| `inviteexport [range]`, `invitedexport [@user]` | | 管理服务器 | 导出 CSV |
| `invitemassban <@user> [reason]`, `invitemassbancode <code> [reason]` | | 封禁成员 | 确认后，封禁所有仍在服务器中、由某位成员或通过某个邀请码邀请的人 |
| `invitesettings`, `toggleinvitetracking`, `toggleremoveinviteonleave`, `togglecountrejoins`, `togglefakenoavatar`, `setminaccountage <days>`, `invitelinkchannel [#channel]`, `invitelogchannel [#channel]` | | 管理服务器 | 设置 |

## 技巧与注意事项

- 在追踪开启之前加入服务器的成员，或在机器人离线期间加入的成员，没有加入记录。请运行一次 **从 Discord 导入使用记录**（从 Discord 导入使用记录），以便根据 Discord 自身的统计数据填充常规总数。
- 虚假加入在成员离开时永远不会降低总数；只有常规邀请会变成离开邀请。
- 成员离开后再次回来，会获得一条新的加入记录。开启 **计入重新加入**（计入重新加入）后，邀请人会再次获得一次常规邀请，从而抵消此前的离开邀请。
- 排行榜上的留存只统计机器人见证过的加入，因此一开始为 100%，随着历史数据的积累会逐渐趋于稳定。
- 统计身份组可以根据邀请数量发放奖励，实时排行榜可以将邀请排行榜固定在某个频道中。
