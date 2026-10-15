---
title: 管理
slug: moderation
summary: 警告、禁言、超时、踢出和封禁成员；警告累积时自动升级处罚，并控制封禁时删除多少天的消息。
icon: fa-flag
category: Security
dashboard: /dashboard/moderation
module: Moderation
tags: [moderation, warn, warnings, warn punish, punishment ladder, mute, mute role, timeout, ban, softban, kick, ban purge, ban prune, purge, prune, dehoist, warnlog, 管理, 警告, 警告处罚, 处罚梯度, 禁言, 禁言身份组, 超时, 封禁, 软封禁, 踢出, 封禁清除, 清除消息, 清理, 去除昵称提升, 警告日志]
related: [administration, filter, logging, auditlog]
---

## 功能简介

管理功能是工作人员用来处理单个成员的工具箱。警告是其中的核心：版主运行 `warn @user reason`，成员会收到一条包含原因和警告人的私信，警告会被保存；如果服务器设置了警告日志频道，则会在该频道发布一条嵌入消息，显示警告次数以及触发的处罚（如有）。

警告会逐步累积。你可以设置处罚梯度，使有效警告达到指定数量时自动触发某项操作：禁言、超时、踢出、封禁或身份组变更。工作人员无需记住规则，机器人会在达到次数时立即执行。警告之后可以被宽恕，也可以设置为在若干天后自动过期。

此外还有直接操作：禁言（配合受管理的禁言身份组）、超时、踢出、软封禁、封禁、临时封禁、批量踢出、消息清除，以及清理那些通过特殊字符把昵称顶到成员列表最前面的成员昵称。每次封禁操作都可以配置清除天数，即 Discord 在封禁时一并删除该成员多少天内的消息。

仪表板页面涵盖警告、处罚梯度、警告日志频道和封禁清除设置。禁言、踢出和封禁等直接操作仅能通过命令执行。

## 适用场景

- 希望采用统一的“三次警告”制度，无论哪位版主值班，处理结果都一致。
- 需要快速禁言成员，且不想手动修改频道权限。
- 有广告机器人入侵，希望封禁时删除其最近一天的消息；而对普通成员的临时封禁则不应清除其历史消息。
- 工作人员需要一份可搜索的记录，记下谁被警告、由谁警告以及原因，且不会因版主更替而丢失。
- “!!! xXx”之类的昵称总是出现在成员列表顶部，希望一次性清理。

## 警告

`warn <user> [reason]` 需要封禁成员权限。机器人会先尝试向成员私信一条嵌入消息，内容包含服务器名称、版主和原因。若私信发送失败，频道中的确认消息底部会注明此情况。随后警告会被保存，并记录版主名称及原因；若未填写原因，则记录为 `-`。

成员的身份组必须低于版主，也必须低于机器人。否则命令会拒绝执行。

`warnlog <user>` 显示分页列表，每页九条，包含日期、版主和原因。已宽恕的警告会显示删除线，并注明由谁清除。`warnlogall` 会列出所有有警告的成员，格式为 `active (total - forgiven)`。

`warnclear <user> [index]` 将警告标记为已宽恕。不填编号或填写 `0` 时，宽恕该成员的全部警告；填写编号时，仅宽恕对应的那一条，编号与 `warnlog` 中一致。已宽恕的警告会保留在日志中，但不再计入处罚。仪表板还可以直接删除某条警告，删除后将永久移除。

### 警告过期

`warnexpire <days> <clear|delete>` 设置警告的有效期。天数可以是 0 到 366；填写 0 则关闭过期。操作类型决定警告过期后的处理方式：

| 操作 | 结果 |
| --- | --- |
| Clear | 警告被标记为已宽恕，但仍保留在日志中 |
| Delete | 警告将从数据库中删除 |

过期检查每十二小时进行一次，设置时也会立即检查一次。

### 警告日志频道

使用 `setwarnchannel #channel` 设置，或在仪表板的 **处罚** 标签页中使用 **警告日志频道** 选择器设置。每条警告都会在该频道发布一条嵌入消息，内容包括成员的名称和 ID、当前警告编号、触发的处罚（若无则显示 "None"）、原因，以及指向发出警告消息的跳转链接。

## 警告处罚

处罚梯度是一组“当有效警告达到 N 次时执行操作 X”的规则。发出警告时，机器人会统计该成员的有效警告次数（包括本次新增的警告），并查找次数完全匹配的规则。只有精确匹配才会触发，因此如果成员设置了第 3 次的规则，但在没有第 4 次规则的情况下达到了 4 次，则不会有额外处罚。

使用 `warnpunish <number> <punishment> [time]` 设置规则；若要设置身份组变更，则使用 `warnpunish <number> addrole <role> [time]`。仅输入 `warnpunish <number>` 会移除该规则。`warnpunishlist` 用于查看整个梯度。

| 处罚 | 是否支持时长 | 作用 |
| --- | --- | --- |
| Mute | 可选 | 添加禁言身份组；若指定时长，则为限时禁言 |
| ChatMute | 可选 | 仅添加禁言身份组，不进行语音禁言 |
| VoiceMute | 可选 | 仅进行服务器语音禁言 |
| Timeout | 必填，最长 28 天 | Discord 超时 |
| Kick | 否 | 踢出成员 |
| Softban | 否 | 先封禁后立即解封，以删除消息 |
| Ban | 可选 | 永久封禁；若指定时长，则为限时封禁 |
| AddRole | 可选 | 添加所选身份组；若设置时长，则到期后移除 |
| RemoveRoles | 否 | 移除成员的所有身份组 |

时长以分钟为单位存储，最长可达 49 天。Softban、Kick 和 RemoveRoles 不接受时长；Timeout 若未指定时长则无法保存。处罚执行时的原因为 "Warned too many times."（机器人发布的英文原文）。

在仪表板上，同样的梯度位于 **处罚** 标签页：选择 **第 # 次警告时**、**处罚**、可选的 **时长（分钟）**，若为身份组处罚则再选择 **要添加的身份组**，然后点击 **添加到梯度**。若某次数已有规则，再次保存将替换原规则。

> [!EXAMPLE]
> `warnpunish 2 mute 1h`、`warnpunish 3 timeout 1d`、`warnpunish 5 ban`。两次警告禁言一小时，三次警告超时一天，五次警告封禁。

## 迷你警告

还有一套独立的警告体系，称为迷你警告，用于由初级工作人员处理的轻微违规。`mwarn` 只需要禁言成员权限，而非封禁成员权限。它有自己的日志（`mwarnlog`、`mwarnlogall`）、清除命令、过期设置、处罚梯度（`mwarnpunish`）以及日志频道（`setmwarnchannel`）。迷你警告永远不会计入主梯度，反之亦然。仪表板不显示迷你警告。

## 禁言与禁言身份组

机器人会管理一个禁言身份组。默认名称为 `Mewdeko-mute`；使用 `muterole @role` 更改，或单独运行 `muterole` 查看当前设置。首次需要禁言时，如果该身份组不存在，机器人会自动创建它，然后遍历每个文字频道，添加一条拒绝发送消息、添加反应、添加附件、在子区中发送消息和创建公开子区权限的覆盖设置。子区会被跳过。在频道数量众多的服务器中，这可能需要一些时间。

| 命令 | 作用 |
| --- | --- |
| `mute` | 完全禁言：添加禁言身份组 |
| `chatmute` | 仅添加禁言身份组 |
| `voicemute` | 仅在语音中为该成员进行服务器禁音 |
| `stfu` | 仅在当前频道中，通过权限覆盖拒绝该成员发送消息 |

以上每个命令都有限时版本。完全禁言的时长为 1 分钟到 90 天；文字和语音禁言为 1 分钟到 49 天。带时长的 `stfu` 会在时间到达后取消覆盖设置。被禁言和解除禁言时，成员都会收到私信。

`removeonmute y` 会让完全禁言同时移除成员的其他身份组并将其保存，`unmute` 则会将这些身份组归还。`removeonmute n` 则关闭此功能。`unmuteall` 会在确认提示后，将禁言身份组从所有拥有该身份组的成员身上移除，可选填写原因。

## 超时

`timeout <time> <user> [reason]` 使用 Discord 原生超时功能，最长 28 天。你和机器人都需要禁言成员权限。`untimeout <user>` 可解除超时。原因会以 `moderator | reason` 的格式写入审计日志。

## 封禁、踢出与软封禁

`ban <user> [reason]` 会先私信成员，然后将其封禁。`ban <time> <user> [reason]` 是限时封禁，到期自动解封，最长 49 天。`ban <pruneTime> <time> <user>` 则可以同时明确设置清除窗口和封禁时长。对不在服务器中的人可以通过 ID 进行封禁。`unban <user or id>` 用于撤销封禁。

`softban <user> [reason]` 会先封禁再立即解封，相当于一次同时删除近期消息的踢出。`kick <user> [reason]` 会踢出成员，`masskick @a @b @c` 可一次踢出多人，并报告成功人数。`masskill` 仅限机器人所有者使用，用于批量封禁粘贴的 ID 列表。

### 封禁私信

可以通过 `banmessage <text or embed code>` 自定义发送给被封禁成员的消息。文本会经过嵌入解析器处理，因此嵌入构建器中的所有功能均可使用。将其设置为 `-` 则不发送任何私信，使用 `banmsgreset` 可恢复默认设置。`banmsgtest [duration] [reason]` 会将当前模板私信发给你，方便预览。

| 占位符 | 值 |
| --- | --- |
| `%ban.mod%` | 版主的完整名称 |
| `%ban.mod.name%` | 版主的用户名 |
| `%ban.user%` | 被封禁成员的完整名称 |
| `%ban.user.name%` | 被封禁成员的用户名 |
| `%ban.reason%` 或 `%reason%` | 原因；若无则为 `-` |
| `%ban.duration%` | 时长，格式为 `d.hh:mm`，或 `perma` |

`%server.name%` 等服务器占位符同样适用于此处。

## 封禁清除

每次封禁都会附带一个清除设置：即 Discord 在封禁时一并删除该成员多少天内的消息，范围为 0 到 7 天。每类封禁都有自己的默认值，而不是使用一个全局数字；你可以为整个服务器、某个分类或某个频道分别覆盖这些值。

| 操作 | 键名 | 内置默认值 |
| --- | --- | --- |
| 封禁 | `ban` | 7 天 |
| 通过 ID 封禁 | `hackban` | 7 天 |
| 临时封禁 | `tempban` | 无 |
| 软封禁 | `softban` | 7 天 |
| 批量封禁 | `massban` | 7 天 |
| 按头像哈希封禁 | `banbyhash` | 无 |
| 按身份组封禁 | `baninrole` | 无 |
| 按年龄封禁 | `banunder` | 无 |
| 警告处罚 | `warnpunish` | 无 |
| 自动封禁身份组 | `autobanrole` | 无 |
| 身份组监控 | `rolemonitor` | 无 |
| 过滤器 | `filter` | 无 |
| 锁定 | `lockdown` | 无 |
| 仪表板 | `dashboard` | 无 |

封禁发生时，机器人会查找最具体的设置：先看执行命令的频道，然后是该频道所属的分类，最后是服务器默认值。在每一层中，针对具体操作的设置优先于针对“所有操作”的设置。若均不匹配，则应用内置默认值。

`banprune` 会显示从当前频道封禁时将清除的内容，以及所有已配置的设置。`banpruneset <action|all> <days> [#channel or category]` 用于设置某一项，`banpruneclear <action|all> [#channel or category]` 用于移除某一项，`banprunereset` 则会清空全部设置。

仪表板的 **封禁清除** 标签页会在 **服务器默认值** 下列出每项操作，并为每项提供天数输入框；底部有一行 **所有操作** 作为备用值，另有 **覆盖设置** 区域，可选择 **范围**（频道或分类）、目标、**操作** 以及 **清除（天）**。

## 清除消息

`purge [count] [flags]` 可删除当前频道中最多 1000 条消息。不填数量时，会删除机器人自己发出的最近 100 条消息。`purge @user [count]` 只删除该成员最近两周内的消息。各个参数可以组合使用：`-s` 跳过已置顶消息，`-nb` 跳过机器人消息，`-ob` 仅处理机器人消息，`-he` 仅处理含嵌入内容的消息，`-ne` 仅处理不含嵌入内容的消息，`-c text` 仅处理包含指定文字的消息，`-b date` 处理某日期之前的消息，`-a date` 处理某日期之后的消息。

`purgeuser <user> <count>` 会搜索每个文字频道中最近的 `count` 条消息（1 到 1000），并删除该用户在每个频道中的消息。

## 昵称

`dehoist <user>` 和 `sanitize <user>` 会将单个成员的昵称改写为去除开头的特殊字符或不常见字符。`dehoistall [nicksOnly]` 和 `sanitizeall` 会在确认后对所有成员执行相同操作，并以后台任务运行；`massnickprogress` 可查看进度，`massnickstop` 可取消任务。单个成员的命令需要机器人拥有管理昵称权限；“全部”版本则需要机器人拥有管理员权限。两者都要求机器人的身份组高于受影响的成员。

## 设置

仪表板页面共有五个标签页：**概览**（警告数量）、**警告**、**处罚**、**近期活动** 和 **封禁清除**。

| 设置 | 默认值 | 作用 |
| --- | --- | --- |
| 警告日志频道 | 无 | 接收每条警告嵌入消息的频道 |
| 处罚梯度 | 空 | 每个警告次数触发的操作 |
| 警告过期 | 关闭 | 警告在若干天后被清除或删除；仅限命令 |
| 禁言身份组 | `Mewdeko-mute` | 禁言命令所应用的身份组；仅限命令 |
| 禁言时移除身份组 | 关闭 | 在完全禁言前后移除并恢复身份组；仅限命令 |
| 封禁私信模板 | 默认嵌入 | 被封禁成员收到的私信；仅限命令 |
| 封禁清除默认值 | 按操作 | 每类封禁时删除成员消息的天数 |
| 封禁清除覆盖设置 | 无 | 按频道或分类的清除设置 |

在 **警告** 标签页中，工作人员可以通过用户 ID 警告成员（必须填写原因），可按 ID、原因或版主搜索，可隐藏已宽恕的警告，可宽恕单条警告，可宽恕某成员的全部警告，也可永久删除单条警告。

> [!WARNING]
> 从仪表板删除警告将永久移除该警告，且不再计入。宽恕则会保留记录，同样不再计入。除非有必要抹去历史记录，否则请选择宽恕。

## 设置流程

1. 在仪表板中打开 **管理**，进入 **处罚** 标签页。
2. 选择只有工作人员可以查看的 **警告日志频道**。
3. 在梯度中添加规则。一个较温和的开始方式是：达到 2 次时禁言 60 分钟，达到 3 次时超时 1440 分钟，达到 5 次时封禁。
4. 如果你已有禁言身份组，运行 `muterole @Muted`；否则可以让机器人在首次使用时自动创建 `Mewdeko-mute`。
5. 使用 `warnexpire 90 clear` 决定过期策略，使旧警告在三个月后不再计入。
6. 在 **封禁清除** 中，如果不希望临时封禁删除历史消息，请将 **临时封禁** 设为 0；如果机器人刷屏频道需要更多清除，可添加频道覆盖设置。
7. 使用小号测试：`warn @alt test`，检查日志频道，然后运行 `warnclear @alt`。

## 命令

以下命令需使用服务器前缀运行（默认为 `.`，除非你已更改）。

| 命令 | 别名 | 所需权限 | 用途 |
| --- | --- | --- | --- |
| `warn <user> [reason]` | | 封禁成员 | 警告成员并应用任何梯度处罚 |
| `warnlog <user or id>` | | 封禁成员 | 显示成员的警告 |
| `warnlogall` | | 封禁成员 | 显示所有成员的警告数量 |
| `warnclear <user> [index]` | `warnc` | 封禁成员 | 宽恕全部警告，或按编号宽恕单条 |
| `warnexpire <days> <clear|delete>` | `warne` | 管理员 | 在若干天后自动清除或删除警告 |
| `warnpunish <number> <punishment> [time]` | `warnp` | 封禁成员 | 设置梯度规则；若只填写数字则移除该规则 |
| `warnpunishlist` | `warnpl` | 无 | 显示处罚梯度 |
| `setwarnchannel <#channel>` | `warnchannel` | 管理员 | 设置警告日志频道 |
| `mwarn <user> [reason]` | `miniwarn` | 禁言成员 | 发出迷你警告 |
| `mwarnlog [page] [user or id]` | | 禁言成员；查看自己的记录则无需权限 | 显示迷你警告 |
| `mwarnlogall` | `mwarnlogs` | 禁言成员 | 显示所有成员的迷你警告数量 |
| `mwarnclear <user or id> [index]` | `mwarnc` | 管理员 | 宽恕迷你警告 |
| `mwarnexpire <days> [clear|delete]` | `mwarne` | 管理员 | 迷你警告过期设置 |
| `mwarnpunish <number> <punishment> [time]` | `mwarnp` | 管理员 | 设置或移除迷你警告梯度规则 |
| `mwarnpunishlist` | `mwarnplist`, `mwarnpl` | 无 | 显示迷你警告梯度 |
| `setmwarnchannel <#channel>` | `mwarnchannel` | 管理员 | 设置迷你警告日志频道 |
| `timeout <time> <user> [reason]` | | 禁言成员 | 对成员进行超时，最长 28 天 |
| `untimeout <user>` | | 禁言成员 | 移除超时 |
| `mute <user> [time] [reason]` | | 管理身份组或禁言成员 | 完全禁言，可选限时 |
| `unmute <user> [reason]` | | 管理身份组或禁言成员 | 移除完全禁言 |
| `chatmute [time] <user> [reason]` | | 管理身份组 | 仅添加禁言身份组 |
| `chatunmute <user> [reason]` | | 管理身份组 | 移除文字禁言 |
| `voicemute [time] <user> [reason]` | | 禁言成员 | 仅语音禁言 |
| `voiceunmute <user> [reason]` | | 禁言成员 | 移除语音禁言 |
| `stfu [time] <user>` | `cmute`, `channelmute` | 禁言成员 | 仅在当前频道中拒绝该成员发送消息 |
| `unstfu <user>` | `unchannelmute` | 禁言成员 | 撤销 `stfu` |
| `muterole [role]` | `setmuterole` | 管理身份组 | 显示或设置禁言身份组 |
| `removeonmute <y|n>` | | 管理员 | 完全禁言前后移除并恢复身份组 |
| `unmuteall [reason]` | `umall` | 管理员 | 为所有拥有禁言身份组的成员解除禁言 |
| `kick <user or id> [reason]` | `k` | 踢出成员 | 踢出成员 |
| `masskick <users...>` | `mkick` | 踢出成员 | 一次踢出多名成员 |
| `ban [time] <user or id> [reason]` | `b` | 封禁成员 | 封禁，或限时封禁（最长 49 天） |
| `unban <user or id>` | | 封禁成员 | 解除封禁 |
| `softban <user or id> [reason]` | `sb` | 踢出成员和管理消息 | 先封禁后解封，以删除消息 |
| `banmessage [text]` | `banmsg`, `bantemplate`, `bantemp` | 封禁成员 | 显示或设置封禁私信；填写 `-` 可禁用 |
| `banmsgreset` | | 封禁成员 | 恢复默认封禁私信 |
| `banmsgtest [time] [reason]` | | 封禁成员 | 向你私信封禁模板 |
| `masskill <ids and reasons>` | | 机器人所有者 | 批量封禁粘贴的列表 |
| `banprune` | `banpurge` | 封禁成员 | 显示实际生效及已配置的清除设置 |
| `banpruneset <action|all> <days> [channel]` | `banpurgeset` | 管理员 | 设置清除规则 |
| `banpruneclear <action|all> [channel]` | `banpurgeclear` | 管理员 | 移除清除规则 |
| `banprunereset` | `banpurgereset` | 管理员 | 移除所有清除规则 |
| `purge [count or user] [count] [flags]` | `clear`, `prune` | 管理消息 | 批量删除当前频道的消息 |
| `purgeuser <user> <count>` | `pruneuser` | 管理消息 | 删除用户在所有频道中的消息 |
| `dehoist <user>` | | 管理昵称 | 修复一个提升到列表顶部的昵称 |
| `dehoistall [nicksOnly]` | `dehoista` | 管理昵称 | 修复所有提升到列表顶部的昵称 |
| `sanitize <user>` | | 管理昵称 | 规范化一个昵称 |
| `sanitizeall` | `sanitizea` | 管理昵称 | 规范化所有昵称 |
| `massnickprogress` | `mnickprogress`, `mnp` | 管理员 | 查看正在运行的昵称清理任务进度 |
| `massnickstop` | `mnstop`, `mns` | 管理员 | 停止正在运行的昵称清理任务 |

## 提示与注意事项

- 机器人的身份组必须高于它要禁言、踢出或封禁的任何成员，并高于禁言身份组本身。大多数“无法执行处罚”的错误都与身份组层级有关。
- 机器人需要封禁成员、踢出成员、禁言成员、管理身份组和管理消息等权限，才能执行对应命令；每个命令在运行前都会检查机器人自身的权限。
- 梯度只在次数完全匹配时触发。请为你需要的每个步骤都设置规则，而不要假设“3 次或以上”。
- 只有通过机器人发出的警告才会计入。Discord 自带的超时和封禁不会增加警告。
- 禁言身份组是按频道拒绝权限的。身份组创建后新建的频道，要等到下次有人被禁言时才会获得该覆盖设置，并非立即生效。
- Discord 的批量删除只能追溯 14 天。更早的消息会被清除命令跳过。
- 即使你进行了配置，Discord 也将封禁时的消息清除上限限制在 7 天。
- 从仪表板发出的警告需要有效的原因，并以你的仪表板账户作为版主名称。
