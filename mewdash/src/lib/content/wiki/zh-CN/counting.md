---
title: 数数
slug: counting
summary: 将一个频道变成数数游戏，成员轮流发送下一个数字，并提供反应、连击、排行榜、存档点，以及打断计数时的可选惩罚。
icon: fa-list-numeric
category: Community
dashboard: /dashboard/counting
module: Counting
tags: [counting, count, numbers, game, channel, leaderboard, streak, milestones, save point, 数数, 计数, 数字, 游戏, 频道, 排行榜, 连击, 里程碑, 存档点]
related: [administration, xp]
---

## 功能介绍

管理人员选择一个频道并运行 `countingsetup`。此后，机器人会监视该频道中的每条消息。如果消息是预期的下一个数字，机器人会添加一个对勾反应，并为该成员记录一次计数。如果数字错误，机器人会添加一个叉号反应，默认在两秒后删除该消息，使频道保持整洁。

机器人会记录当前数字、历史最高数字、计数总数以及最后一次计数的人。默认情况下，同一成员不能连续计数两次，因此游戏至少需要两个人。成员可以查看自己的统计数据、连击和准确率，每个频道还有一个排行榜。

对于管理人员，系统提供存档点（可在糟糕的一轮之后将计数回滚）、审核层（在时间窗口内按成员记录错误计数，并应用分级惩罚）、数数封禁和禁言，以及谁可以参与的身份组规则。多个频道可以同时进行数数，每个频道各自拥有独立设置。

## 为什么要使用它

- 一个几乎无需维护、可自动运行的社区游戏，为成员提供共同目标。
- 大型服务器可以添加冷却时间和不可重复规则，防止有人刷数。
- 管理人员可以从存档点恢复计数，而不必争论是谁打断了计数。
- 反复故意打断计数的人可以被自动禁言或禁止参与数数。

## 计数如何检查

成员在数数频道发言时，机器人会按以下顺序执行检查：

1. 被禁止参与数数的成员会被完全忽略。
2. 拥有禁用身份组、缺少必需身份组或拥有被忽略身份组的成员会被跳过。如果你这样设置了，被忽略身份组的消息会被删除。
3. 如果消息看起来是有效数字，机器人会测试自己能否对其添加反应。如果添加反应失败，机器人会认为该成员屏蔽了机器人，删除该消息，并发送一条简短警告，五秒后自动消失。
4. 仍处于 **冷却时间**（冷却时间）中的成员会被拒绝。
5. 如果 **允许同一用户连续数数**（允许同一用户连续数数）关闭，且上一个计数的人就是该成员，则消息会被拒绝。
6. 文本会按频道的规律解析。非数字内容按下面的非数字规则处理。
7. 数字必须等于当前数字加上 **递增量**（递增量）。错误数字会计为该成员的一次错误；如果 **出错时重置计数**（出错时重置计数）已开启，频道将重置为起始数字。
8. 如果设置了 **最大数字**（最大数字），且数字超过该值，计数将停止，并通知管理人员。

正确的计数会更新频道、该成员的统计数据和连击，开始其冷却计时，检查里程碑，并记录该事件。

正确计数会获得 **成功表情**（成功表情）反应（默认为对勾），错误计数会获得 **错误表情**（错误表情）反应（默认为叉号）。两者都可以是标准 emoji 或自定义表情。

## 计数规律

规律决定成员必须如何书写数字。机器人支持以下规律：

| 规律 | 成员输入 |
| --- | --- |
| 普通 | 普通数字：`1`、`2`、`3`。当 **进制**（进制）不是 10 时，数字将按该进制读取。 |
| 罗马数字 | 罗马数字：`I`、`II`、`III`、`IV` |
| 二进制 | `1`、`10`、`11`、`100` |
| 十六进制 | `1` 到 `9`，然后是 `A`、`B`、`C` |
| 文字 | 书写的英文单词，如 `twenty-one` 或 `one hundred and five` |
| 序数 | `1st`、`2nd`、`3rd`、`4th` |
| 斐波那契 | 斐波那契数列：`1`、`1`、`2`、`3`、`5`、`8` |
| 质数 | 仅限质数：`2`、`3`、`5`、`7`、`11` |

普通是默认规律。规律在仪表板中设置，没有对应的命令。

> [!WARNING]
> 仪表板上的 **数数规律**（数数规律）下拉菜单目前列出了顺序、跳过倍数、斐波那契、质数和 2 的幂，但其值与上述机器人规律列表不一致。目前在仪表板中只能安全地选择顺序（普通）。

## 里程碑

当计数首次达到 100、500、1,000、5,000 或 10,000 的倍数时，机器人会记录一个里程碑。里程碑会显示在 **统计**（统计）标签页和 `countingstatus` 中。

仪表板的 **管理**（管理）标签页和 `countingmilestones` 可以为每个频道保存自定义里程碑数字列表；同一标签页和 `countingmilestonemessage` 可以保存里程碑消息，`countingmilestonechannel` 可以保存里程碑公告频道。这些值会被保存，但机器人目前还不会发布里程碑公告，因此请将它们视为保留功能，留待未来版本使用。

## 统计与排行榜

每位成员在每个频道都有独立的统计数据：贡献数、当前连击、最高连击、准确率、错误次数、计数总数和最后一次贡献。`countingstats` 会显示这些数据以及该成员的排名。

`countingleaderboard` 和 **排行榜**（排行榜）标签页可按以下四种类型之一排序：

| 类型 | 排序依据 |
| --- | --- |
| `contributions` | 正确计数的次数（默认） |
| `streak` | 最高连击 |
| `accuracy` | 正确计数的百分比 |
| `totalnumbers` | 计数总数 |

该命令显示前 20 名，每页 10 名。

## 存档点

`countingsave` 会保存当前数字（可附带原因），并返回一个存档 ID。`countingrestore <id>` 会在确认提示后将频道恢复到该数字。`countingreset` 可以直接将计数设置为任意数字（需要确认），默认为 0。这三项也都位于 **管理**（管理）标签页中。

## 审核

计数审核默认关闭，需要先启用：可以使用 `countmodenable true` 为单个频道启用，或使用 `countmoddefaults true` 为整个服务器启用。频道设置会覆盖服务器默认值；`countmodreset` 可以将频道恢复为默认设置。

启用后，每次错误数字都会记录在该成员名下，并计入其在 **time window**（时间窗口）内的错误计数（默认 24 小时，可设置 1 至 168 小时）。当成员的错误计数恰好达到某个数值时，分级惩罚就会触发：`countmodpunish 3 Mute 30` 会在第三次错误计数时禁言 30 分钟。为某个频道设置的分级只适用于该频道；未指定频道设置的分级为服务器默认值，频道分级优先生效。`Softban`、`Kick` 和 `RemoveRoles` 不能设置时长，时长上限为 49 天。`AddRole` 需要指定身份组。

只有在审核开启时，还适用以下两条额外规则：

- **非数字内容**：`countmodnonnumbers` 决定频道中的聊天消息是否会被删除（默认是），以及是否计为违规（默认否）。
- **编辑**：`countmodedits` 决定编辑频道中的消息是否会将其删除（默认是），以及是否计为违规（默认否）。

身份组规则：**所需身份组**（所需身份组）表示成员至少需要拥有其中一个才能计数；**禁用身份组**（禁用身份组）会阻止拥有其中任一身份组的成员计数；`countmodignore` 会跳过拥有指定身份组的成员，并可选择删除他们的消息。

`countingban`、`countingtimeout` 和 `countingunban` 可以永久或在一段时间内阻止单个成员在某个频道中计数。**管理**（管理）标签页提供按用户 ID 设置的相同控件，以及一个 **清除频道数据**（清除频道数据）按钮，其效果与带清除选项的 `countingdisable` 相同。

## 设置

仪表板有五个标签页：**频道**（频道）、**配置**（配置）、**统计**（统计）、**排行榜**（排行榜）和 **管理**（管理）。请先在 **频道**（频道）中选择一个频道；其他标签页的操作都针对该频道。

| 设置 | 默认值 | 作用 |
| --- | --- | --- |
| 起始数字 | 1 | 计数开始的数字，在设置时指定 |
| 递增量 | 1 | 每次计数增加的数值，必须为正数 |
| 数数规律 | 普通 | 数字的书写方式，见上文 |
| 进制 | 10 | 普通规律使用的进制 |
| 冷却时间（秒） | 0 | 同一成员两次计数之间的等待时间，0 至 300 |
| 最大数字 | 0（无限制） | 超过此数字后计数停止 |
| 成功表情 | 对勾 | 正确计数时的反应 |
| 错误表情 | 叉号 | 错误计数时的反应 |
| 允许同一用户连续数数 | 关 | 允许同一成员连续计数两次 |
| 出错时重置计数 | 关 | 错误数字会将频道重置为起始数字 |
| 删除错误消息 | 开 | 两秒后删除错误数字 |
| 启用成就 | 开 | 已保存的标记，显示在 `countingconfig` 中 |
| 启用竞赛 | 开 | 已保存的标记，显示在 `countingconfig` 中 |
| 所需身份组 | 无 | 成员需拥有其中之一才能计数 |
| 禁用身份组 | 无 | 拥有这些身份组的成员无法计数 |

> [!NOTE]
> `countingfailurethreshold` 命令保存一个 1 至 10 的值（默认 3），`countmodthreshold` 保存错误计数阈值，但惩罚只会从你用 `countmodpunish` 设置的分级中触发。

## 设置步骤

1. 创建一个频道，并在其中授予机器人 查看频道、发送消息、添加反应、管理消息 和 阅读消息历史 权限。
2. 在仪表板中打开 **数数**（数数），在 **设置新的数数频道**（设置新的数数频道）下选择该频道，设置 **起始数字**（起始数字）和 **递增量**（递增量），然后保存。
3. 在 **配置**（配置）中，如果想放慢游戏节奏，可以设置 **冷却时间**（冷却时间），并选择表情。
4. 可选：添加 **所需身份组**（所需身份组）或 **禁用身份组**（禁用身份组）。
5. 如果需要自动惩罚，请在频道中运行 `countmodenable true`，并使用 `countmodpunish` 添加分级。
6. 用一个账号发送 `1`，再用另一个账号发送 `2`，以确认反应正常工作。

## 命令

请使用服务器的前缀运行这些命令（除非你更改过，否则为 `.`）。

| 命令 | 别名 | 所需权限 | 作用 |
| --- | --- | --- | --- |
| `countingsetup [#channel] [start] [increment]` | `csetup`, `countsetup` | 管理频道 | 在频道中开始数数 |
| `countingstatus [#channel]` | `cstatus`, `countstatus` | 无 | 当前数字、记录、总计和生效的规则 |
| `countingconfig [#channel]` | `cconfig`, `countconfig` | 管理频道 | 显示频道的配置 |
| `countingreset [#channel] [number] [reason]` | `creset`, `countreset` | 管理消息 | 重置计数，默认为 0，需确认 |
| `countingstats [@user] [#channel]` | `countstats` | 无 | 成员的计数统计和排名 |
| `countingleaderboard [type] [#channel]` | `cleaderboard`, `countleaderboard`, `clb` | 无 | 按贡献数、连击、准确率或计数总数排列的前 20 名 |
| `countingsave [#channel] [reason]` | `csave`, `countsave` | 管理消息 | 创建存档点 |
| `countingrestore <saveId> [#channel]` | `crestore`, `countrestore` | 管理消息 | 回滚到存档点 |
| `countingdisable [#channel] [purge] [reason]` | `cdisable`, `countdisable` | 管理频道 | 停止数数；`true` 会同时清除所有数据 |
| `countinglist` | `clist`, `countlist` | 管理频道 | 列出正在进行数数的频道 |
| `countingban <@user> [#channel] [duration] [reason]` | `cban`, `countban` | 管理消息 | 禁止成员参与数数，除非指定时长，否则为永久 |
| `countingunban <@user> [#channel] [reason]` | `cunban`, `countunban` | 管理消息 | 解除数数封禁 |
| `countingtimeout <@user> <duration> [#channel] [reason]` | `ctimeout`, `counttimeout` | 管理消息 | 临时数数封禁 |
| `countingcooldown [#channel] [seconds]` | `ccooldown`, `countcooldown` | 管理频道 | 显示或设置冷却时间，0 至 300 |
| `countingmilestones [#channel] [50,100,...]` | `cmilestones`, `countmilestones` | 管理频道 | 显示或设置自定义里程碑数字；`-` 可重置 |
| `countingsuccessmessage [#channel] [text]` | `csuccessmessage`, `countsuccessmessage` | 管理频道 | 保存成功模板，`-` 可重置 |
| `countingfailuremessage [#channel] [text]` | `cfailuremessage`, `countfailuremessage` | 管理频道 | 保存失败模板，`-` 可重置 |
| `countingmilestonemessage [#channel] [text]` | `cmilestonemessage`, `countmilestonemessage` | 管理频道 | 保存里程碑模板，`-` 可重置 |
| `countingmilestonechannel [#counting] [#target]` | `cmilestonechannel`, `countmilestonechannel` | 管理频道 | 保存里程碑频道，使用 none 可清除 |
| `countingfailurechannel [#counting] [#target]` | `cfailurechannel`, `countfailurechannel` | 管理频道 | 保存失败日志频道，使用 none 可清除 |
| `countingfailurethreshold [#channel] [1-10]` | `cfailurethreshold`, `countfailurethreshold` | 管理频道 | 显示或设置失败阈值 |
| `countmodshow [#channel]` | `cmshow`, `countmoderationshow` | 管理频道 | 显示审核配置和服务器默认值 |
| `countmoddefaults <on/off> [threshold] [hours] [punishment] [minutes] [@role]` | `cmdefaults`, `countmoderationdefaults` | 管理员 | 服务器范围的审核默认值 |
| `countmodenable <on/off> [#channel]` | `cmenable`, `countmoderationenable` | 管理频道 | 为频道开启或关闭审核 |
| `countmodthreshold <1-100> [#channel]` | `cmthreshold`, `countmoderationthreshold` | 管理频道 | 设置频道的错误计数阈值 |
| `countmodwindow <1-168> [#channel]` | `cmwindow`, `countmoderationwindow` | 管理频道 | 错误计数保留记录的小时数 |
| `countmodpunishment <action> [minutes] [@role] [#channel]` | `cmpunishment`, `countmoderationpunishment` | 管理频道 | 设置频道的默认惩罚 |
| `countmodpunish <count> <action> [minutes] [@role] [#channel]` | `cmpunish`, `countmoderationpunish` | 管理频道 | 在精确的错误计数上设置惩罚；不指定频道则为服务器默认值 |
| `countmodunpunish <count> [#channel]` | `cmunpunish`, `countmoderationunpunish` | 管理频道 | 移除一个分级 |
| `countmodpunishlist [#channel]` | `cmpunishlist`, `countmoderationpunishlist` | 管理频道 | 列出分级 |
| `countmodignore <delete> [#channel] [@roles...]` | `cmignore`, `countmoderationignore` | 管理频道 | 机器人忽略的身份组，可选择删除其消息 |
| `countmodrequired [#channel] [@roles...]` | `cmrequired`, `countmoderationrequired` | 管理频道 | 计数所需的身份组 |
| `countmodbanned [#channel] [@roles...]` | `cmbanned`, `countmoderationbanned` | 管理频道 | 不能计数的身份组 |
| `countmodnonnumbers <punish> [delete] [#channel]` | `cmnonnumbers`, `countmoderationnonnumbers` | 管理频道 | 频道中聊天消息的规则 |
| `countmodedits <punish> [delete] [#channel]` | `cmedits`, `countmoderationedits` | 管理频道 | 编辑消息的规则 |
| `countmodreset [#channel]` | `cmreset`, `countmoderationreset` | 管理频道 | 频道恢复为服务器默认值 |
| `countmodclear <@user> [#channel]` | `cmclear`, `countmoderationclear` | 管理消息 | 清除成员的错误计数 |
| `countmodclearall [#channel]` | `cmclearall`, `countmoderationclearall` | 管理消息 | 清除所有人的错误计数 |

## 技巧与注意事项

- 机器人需要频道中的添加反应权限。没有该权限，任何计数都不会获得对勾或叉号，有效计数也会因屏蔽检测而被跳过。
- 删除错误数字和非数字聊天需要管理消息权限。
- 屏蔽了机器人的成员无法计数：其数字会被删除，并会发出警告。
- 在默认的不可重复规则下，成员连续发送两条消息会在读取数字之前被拒绝，且该拒绝不计为错误。
- **出错时重置计数**（出错时重置计数）会重置为起始数字，因此如果起始数字为 1，下一个预期数字将再次是 1。
- 审核惩罚使用与警告系统相同的操作（Mute、Ban、Kick、AddRole 等），因此机器人需要相应的 Discord 权限和禁言身份组。
- 带清除选项的 `countingdisable` 会删除该频道的统计数据、封禁和存档点，且无法撤销。不带清除选项禁用则会保留数据。
