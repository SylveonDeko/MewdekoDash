---
title: 建议
slug: suggestions
summary: 为成员提供频道或按钮来提交想法，让服务器对其投票，并由员工接受、拒绝、考虑或实施每条建议，同时附上原因。
icon: fa-lightbulb
category: Community
dashboard: /dashboard/suggestions
module: Suggestions
tags: [suggestions, ideas, feedback, voting, accept, deny, consider, implement, threads, suggest button, placeholders, 建议, 想法, 反馈, 投票, 接受, 拒绝, 考虑, 实施, 子区, 建议按钮, 占位符]
related: [administration, afk]
---

## 功能介绍

成员可以运行 `suggest` 并附上想法，也可以直接在建议频道中输入，或点击 **Suggest Here!** 按钮并填写表单。机器人会删除原始消息，在建议频道中发布一条带编号的建议嵌入，并以表情反应或按钮的形式附上投票表情。每条建议都有一个编号，员工之后可以通过编号引用它。

员工随后可以将建议切换为四种状态之一：接受、拒绝、考虑或实施，每次切换都可以附上可选的原因。机器人会将原始建议消息编辑为带颜色的状态嵌入，私信提交建议的成员告知结果，并可以为每种状态在单独的频道中重新发布状态嵌入，使被接受的想法集中在一处，被拒绝的想法集中在另一处。

此外，每条建议都可以附带 **Join/Create Discussion** 按钮，点击后会在该建议下打开一个公开或私密子区。员工更改状态时，子区可以自动归档。

## 为什么要使用它

- 反馈频道中的想法容易被回复淹没；每条建议都会成为独立消息，并显示投票数。
- 希望成员能看到哪些想法被接受、哪些被拒绝以及原因，而无需员工发布公告的社区。
- 希望每个想法单独讨论、而不是在主频道中争论的服务器，可以使用子区。
- 员工希望通过带原因输入框的仪表板进行分类处理，而不必记住建议编号。

## 如何提交建议

有三种提交方式，它们都会经过相同的长度检查，并最终进入建议频道。

| 方式 | 结果 |
| --- | --- |
| `suggest <text>` | 命令消息会被删除，并发布建议。可在任意频道使用。 |
| 在建议频道中输入 | 任何不是机器人发出且不以前缀开头的消息都会被转为建议，原消息会被删除。拥有服务器员工身份组的成员会被跳过，因此员工可以在该频道正常发言。 |
| 建议按钮 | 位于 **Suggest Button Channel** 中的一条带按钮的消息。点击后会打开一个表单，其长度限制与你的设置一致。 |

如果文本超过 **Maximum Length** 或短于 **Minimum Length**，则会被拒绝。使用命令时，错误会显示在频道中，并在五秒后删除；在建议频道中输入时，消息会被删除，并私信通知成员。建议中的提及会在发布的嵌入中被无效化，并告知成员建议已发送。

默认的建议嵌入以成员作为作者，标题为 "Suggestion #N"，正文为建议内容。你可以用自己的嵌入替换它（见下方的占位符）。

### 建议按钮

按钮消息发布在 **Suggest Button Channel** 中，机器人会让它保持在底部：当其他消息将其顶上去时，机器人会删除并重新发布该消息。默认标签为 **Suggest Here!**，没有表情，颜色为蓝紫色。按钮上方的消息可以是纯文本或嵌入代码，默认是一段简短的"提交建议"提示。

## 投票

默认情况下，每条建议都会附带一个👍和一个👎。你可以使用 `suggestmotes` 或 **自定义表情** 选择器最多设置五个自定义表情，机器人必须能够使用这些表情。

**表情显示模式** 决定投票的方式。

| 模式 | 行为 |
| --- | --- |
| 反应（默认） | 机器人将表情添加为反应。票数根据反应的添加和移除进行统计。 |
| 按钮 | 表情变为按钮，并显示实时票数。每名成员对每条建议只能投一票：再次点击同一按钮会询问是否取消，点击另一个按钮则会询问是否切换。 |

在按钮模式下，五个表情按钮各自有独立的颜色（**表情 1 按钮** 至 **表情 5 按钮**）。可选颜色为蓝色、灰色、绿色和红色。更改颜色也会刷新建议按钮消息。

`suggestinfo <number>` 会显示建议的文本、提交者、当前状态、最后更改者、状态被更改的次数，以及每个表情的票数，下方附有 Accept、Deny、Consider 和 Implement 按钮。

## 状态

每条建议最初都处于 Suggested 状态（在仪表板上显示为 Pending，即待处理）。拥有 Manage Messages（管理消息）权限的员工可以通过 `accept`、`deny`、`consider` 或 `implemented` 命令、`suggestinfo` 上的按钮，或仪表板将其切换到四种状态之一。每次附带原因的状态更改都会显示该原因；未附带原因时，该字段显示为 "none"。

| 状态 | 嵌入颜色 | 额外选项 |
| --- | --- | --- |
| 已接受 | 蓝色 | 接受频道、接受消息、接受时归档 |
| 已拒绝 | 红色 | 拒绝频道、拒绝消息、拒绝时归档 |
| 已考虑 | 金色 | 考虑频道、考虑消息、考虑时归档 |
| 已实施 | 绿色 | 实施频道、实施消息、实施时归档 |

状态更改时，机器人会按以下顺序执行操作：

1. 如果该状态的归档开关已开启，则归档讨论子区。
2. 将建议频道中的原始消息编辑为状态嵌入，并移除所有反应。如果原始消息已不存在，则重新发布一条新消息。
3. 私信提交者，发送包含建议、原因和更改者的嵌入。员工的确认消息会说明私信是否成功送达，或成员是否关闭了私信。
4. 记录新状态及更改者。
5. 如果为该状态设置了频道，则在该频道发布状态嵌入，并删除该建议之前的状态消息，因此从"考虑"改为"接受"的建议不会留下过时的副本。

建议可以任意次数地在各状态之间切换。没有命令可以将其恢复为 Pending 状态。

### 状态消息

默认的状态嵌入以提交者为作者，标题类似 "Suggestion #12 Accepted"，正文为建议内容，并包含一个 **原因** 字段。你可以使用 `acceptmessage`、`denymessage`、`considermessage` 或 `implementmessage` 设置自己的嵌入，也可以在仪表板的 **消息** 标签页中使用四个编辑器设置。使用 `-` 可恢复默认值。自定义文本会经过嵌入解析器处理；如果它不是有效的嵌入代码，则会被用作嵌入的正文。

## 占位符

提交建议时发布的建议消息支持以下占位符，另外还支持服务器通用占位符（见占位符页面）。

| 占位符 | 值 |
| --- | --- |
| `%suggest.user%` | 提交者的完整用户名 |
| `%suggest.user.name%` | 提交者的用户名 |
| `%suggest.user.avatar%` | 提交者的头像链接 |
| `%suggest.message%` | 建议文本，提及已被无效化 |
| `%suggest.number%` | 建议编号 |

接受、拒绝、考虑和实施消息支持以上全部占位符、服务器通用占位符，以及下面这些额外占位符。

| 占位符 | 值 |
| --- | --- |
| `%suggest.user.id%` | 提交者的用户 ID |
| `%suggest.mod.user%` | 更改状态的员工的完整用户名 |
| `%suggest.mod.name%` | 该员工的用户名 |
| `%suggest.mod.avatar%` | 该员工的头像链接 |
| `%suggest.mod.Id%` | 该员工的用户 ID（注意是大写的 I） |
| `%suggest.mod.message%` | 给出的原因，或 "none" |
| `%suggest.emote1count%` 至 `%suggest.emote5count%` | 更改时每个表情的票数 |

> [!EXAMPLE]
> 一条简单的拒绝消息：`Suggestion #%suggest.number% by %suggest.user% was denied by %suggest.mod.name%: %suggest.mod.message%`

## 子区

**子区类型**（子区类型）会为每条新建议添加第二行按钮。

| 类型 | 按钮 | 结果 |
| --- | --- | --- |
| No Threads（默认） | 无 | 没有讨论按钮 |
| Regular Threads | Join/Create Public Discussion | 在建议消息下创建名为 "Suggestion #N Discussion" 的公开子区 |
| Private Threads | Join/Create Private Discussion | 同上，但为私密子区 |

第一次点击会创建子区，并同时添加提交者和点击者。之后的点击会回复子区已存在，并附上链接。每条建议只跟踪一个子区，四个 **Archive on** 开关会在对应状态被设置时将其归档。更改子区类型只会影响之后发布的建议。

## 设置

仪表板页面有两个标签页：**建议**（建议）和 **设置**（设置）。**设置** 标签页分为 **通用**（常规）、**消息**（消息）、**频道**（频道）、**归档**（归档）和 **表情**（表情）。

| 设置 | 默认值 | 作用 |
| --- | --- | --- |
| Minimum Length（最小长度） | 未设置 | 接受的最短建议长度，以字符计（不能为 2048 或更大；仪表板输入框上限为 2000） |
| Maximum Length（最大长度） | 未设置 | 接受的最长建议长度（必须大于 0；仪表板输入框上限为 2000） |
| Thread Type（子区类型） | No Threads | 建议是否获得公开或私密的讨论按钮 |
| Suggestion message（建议消息） | 默认嵌入 | 提交建议时发布的嵌入 |
| Accept / Deny / Consider / Implement message（接受 / 拒绝 / 考虑 / 实施消息） | 默认嵌入 | 每种状态的状态嵌入 |
| Suggest Channel（建议频道） | 无（功能关闭） | 建议发布的位置，也是输入的消息转为建议的位置 |
| Accept / Deny / Consider / Implement Channel（接受 / 拒绝 / 考虑 / 实施频道） | 无 | 每种状态的嵌入会额外复制到的频道 |
| Archive on Accept / Deny / Consider / Implement（接受 / 拒绝 / 考虑 / 实施时归档） | 关 | 在该状态下归档讨论子区 |
| Emote Display Mode（表情显示模式） | 反应 | 使用反应或按钮进行投票 |
| Custom Emotes（自定义表情） | 👍 和 👎 | 最多五个用于投票的表情 |
| Button Label（按钮文字） | Suggest Here! | 建议按钮上的文字 |
| Button Emote（按钮表情） | 无 | 建议按钮上的表情 |
| Button Message（按钮消息） | 默认提示 | 显示在建议按钮上方的文本或嵌入 |
| Suggest Button Color（建议按钮颜色） | 蓝紫色 | 建议按钮的颜色 |
| Emote 1 to 5 Button（表情 1 至 5 按钮） | 蓝紫色 | 按钮模式下每个投票按钮的颜色 |

> [!WARNING]
> 在设置 **建议频道** 之前，任何功能都不会生效。在此之前，`suggest` 会回复未设置频道，并在三秒后删除该错误提示。

**建议** 标签页会列出每条建议及其状态、票数和日期，可按日期或状态排序。每张卡片上都有 **接受**、**拒绝**、**考虑** 和 **实施** 按钮，并附带一个可选的原因输入框，以及一个 **删除**（删除）按钮，用于从数据库中删除记录，但不会影响 Discord 中的消息。

## 设置步骤

1. 在仪表板中打开 **建议**，切换到 **设置** 标签页。
2. 在 **频道** 中选择 **建议频道**。可选地为已接受、已拒绝、已考虑和已实施的建议分别选择频道。
3. 在 **通用** 中设置 **Minimum Length** 和 **Maximum Length**，例如 10 和 1000，如果需要按想法进行讨论，请选择 **子区类型**。
4. 在 **表情** 中选择 **表情回应** 或 **按钮**，并可选地选择最多五个 **自定义表情**。如果需要建议按钮，请在此设置其标签、表情和消息，然后在 Discord 中运行 `suggestbuttonchannel #channel` 将其发布。
5. 在 **归档** 中，为需要结束讨论的状态开启归档开关。
6. 如有需要，在 **消息** 中使用上述占位符自定义状态嵌入。
7. 保存后进行测试：运行 `suggest test idea`，为其投票，然后运行 `accept 1 looks good`，查看状态嵌入和私信。

## 命令

使用服务器的前缀运行这些命令（如果你未更改，则为 `.`）。

| 命令 | 别名 | 所需权限 | 用途 |
| --- | --- | --- | --- |
| `suggest <text>` | `suggestion` | 无 | 提交建议 |
| `suggestinfo <number>` | `suginfo` | 管理消息 | 显示建议的详细信息、票数和状态按钮 |
| `accept <number> [reason]` | `suggestaccept`, `acceptsuggest` | 管理消息 | 将建议标记为已接受 |
| `deny <number> [reason]` | `suggestdeny`, `denysuggest` | 管理消息 | 将建议标记为已拒绝 |
| `consider <number> [reason]` | `suggestconsider`, `considersuggest` | 管理消息 | 将建议标记为正在考虑 |
| `implemented <number> [reason]` | `suggestimplement`, `implementsuggest` | 管理消息 | 将建议标记为已实施 |
| `setsuggestchannel [#channel]` | `suggestchannel`, `suggestchan` | 管理频道 | 设置建议频道，或在不设频道时关闭建议功能 |
| `suggestclear` | `suggestreset`, `resetsuggestions`, `clearsuggestions` | 管理员 | 在确认后删除所有建议并重置计数器 |
| `suggestmessage <text>` | `suggestmsg` | 管理员 | 自定义建议嵌入，`-` 为重置 |
| `acceptmessage <text>` | `acceptmsg` | 管理员 | 自定义接受嵌入，`-` 为重置 |
| `denymessage <text>` | `denymsg` | 管理员 | 自定义拒绝嵌入，`-` 为重置 |
| `considermessage <text>` | `considermsg` | 管理员 | 自定义考虑嵌入，`-` 为重置 |
| `implementmessage <text>` | `implementmsg` | 管理员 | 自定义实施嵌入，`-` 为重置 |
| `acceptchannel [#channel]` | | 管理员 | 已接受建议的频道，设为无即可关闭 |
| `denychannel [#channel]` | | 管理员 | 已拒绝建议的频道，设为无即可关闭 |
| `considerchannel [#channel]` | | 管理员 | 已考虑建议的频道，设为无即可关闭 |
| `implementchannel [#channel]` | | 管理员 | 已实施建议的频道，设为无即可关闭 |
| `minsuggestionlength <number>` | `minsuggestlength` | 管理员 | 最少字符数，必须小于 2048 |
| `maxsuggestionlength <number>` | `maxsuggestlength` | 管理员 | 最多字符数，必须大于 0 |
| `suggestmotes <emotes>` | `smotes`, `suggestemotes` | 管理员 | 最多五个投票表情，或使用 `disable` 恢复为👍和👎 |
| `suggestmotesmode <reactions/buttons>` | | 管理员 | 使用反应或按钮进行投票 |
| `suggestmotecolor <number> <colour>` | | 管理员 | 设置投票按钮 1 至 5 的颜色：`blurple`、`grey`、`green` 或 `red` |
| `suggestthreadstype <none/public/private>` | `suggestthreads` | 管理员 | 新建议的讨论子区类型 |
| `archiveonaccept` | | 管理员 | 切换接受时的子区归档 |
| `archiveondeny` | | 管理员 | 切换拒绝时的子区归档 |
| `archiveonconsider` | | 管理员 | 切换考虑时的子区归档 |
| `archiveonimplement` | | 管理员 | 切换实施时的子区归档 |
| `suggestbuttonchannel <#channel>` | | 管理员 | 在频道中发布建议按钮 |
| `suggestbuttonmessage <text>` | | 管理员 | 建议按钮上方的文本或嵌入，`-` 为重置 |
| `suggestbuttonlabel <text>` | | 管理员 | 按钮文字，最多 80 个字符，`-` 为重置 |
| `suggestbuttonemote [emote]` | | 管理员 | 按钮表情，设为无即可重置 |
| `suggestbuttoncolor <colour>` | | 管理员 | 建议按钮颜色：`blurple`、`grey`、`green` 或 `red` |

斜杠命令版本位于 `/suggestions` 和 `/suggestions customize` 下。

## 技巧与注意事项

- 机器人需要在建议频道中拥有 Manage Messages（管理消息）权限以删除原始消息，反应模式需要 Add Reactions（添加反应）权限，讨论子区需要 Create Public or Private Threads（创建公开或私密子区）权限。状态频道需要 Embed Links（嵌入链接）权限，否则复制会被无声跳过。
- 在打开频道之前，请同时设置两个长度限制。输入消息的路径会删除超出限制的内容，因此未设置最大值可能会吞掉所有消息。
- 在 Administration（管理）中设置了员工身份组的成员可以在建议频道中聊天，而不会将其消息转为建议。其他人的消息都会被转换并删除。
- `suggest` 命令遵循权限系统，因此你可以使用常规的权限命令在特定频道或对特定身份组禁用它；输入消息的路径也遵循相同的规则。
- 自定义表情必须是机器人可以使用的表情。命令会用每个表情进行反应测试，如果有一个失败则拒绝设置该组表情。
- 仪表板上的 **删除** 只会删除数据库记录，Discord 中的消息和任何子区都会保留。
- `suggestclear` 无法撤销，并会将编号重置为 1。
