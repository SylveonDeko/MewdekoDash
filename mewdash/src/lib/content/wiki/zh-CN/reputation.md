---
title: 声望
slug: reputation
summary: 让成员用声望点数互相感谢，设有冷却和防滥用限制；达到阈值时发放身份组奖励，支持通过表情回应给予声望，并可为长期不活跃的成员设置衰减。
icon: fa-trophy
category: Community
dashboard: /dashboard/reputation
module: Reputation
tags: [reputation, rep, karma, thanks, role rewards, leaderboard, reaction rep, decay, cooldown, 声望, 感谢, 身份组奖励, 排行榜, 表情回应, 衰减, 冷却]
related: [xp, administration]
---

## 功能简介

成员运行 `rep @user` 即可给予一点声望，还可以附带原因。接收者的总数会增加，给予者的每日连续天数会被记录，历史记录会保存谁在何时因为什么给予了声望。任何人都可以用 `repcheck` 查看总数，用 `repleaderboard` 查看服务器排名，用 `rephistory` 查看最近十条记录。

工作人员可以配置声望的流转方式：每对给予者和接收者之间的冷却时间、每日和每周上限，以及给予声望前需要满足的最短账号年龄、服务器时长和消息数量。频道可以被禁用声望，也可以设置倍率。声望还可以通过表情回应获得：在消息上添加指定的表情后，该消息的作者会获得点数。

达到指定阈值时，机器人会发放身份组、在频道中公布该里程碑，并私信通知成员。可选的衰减功能会逐渐扣除长期既不给予也不接收声望的成员的点数，使排行榜反映当前的活跃情况。

## 适用场景

- 在支持频道中表扬乐于助人的成员，并授予显眼的身份组。
- 在展示频道中让点赞表情为作者加分。
- 用声望等级代替手动身份组，以限制某个命令或频道的使用。
- 在周末活动中让某个频道的声望翻倍。
- 通过衰减让长期不再提供帮助的人退出排行榜，保持支持排行榜的真实性。

## 给予声望

每次 `rep` 给予一点声望，并乘以频道倍率（如果设置了）。你不能给自己或机器人声望。每次尝试都会按以下顺序检查，首个未通过的检查会告知给予者：

| 检查 | 默认值 | 结果 |
| --- | --- | --- |
| 系统已启用 | 开启 | 关闭时拒绝所有声望 |
| 频道状态 | 已启用 | 设为 `disabled` 的频道会拒绝在该频道给予的声望 |
| 接收者已冻结 | 否 | 被冻结的成员无法接收声望 |
| 冷却时间 | 60 分钟 | 同一给予者再次给予同一接收者声望前需要等待的时间 |
| 每日上限 | 10 | 给予者每个 UTC 日可以发出的声望数量 |
| 每周上限 | 无 | 可选的每周上限，从周日开始计算 |
| 最短账号年龄 | 7 天 | 给予者的 Discord 账号年龄 |
| 最短服务器时长 | 24 小时 | 给予者加入服务器的时长 |
| 最少消息数 | 10 | 给予者发送的消息数，来自消息计数 |

匿名声望会将记录标记为匿名，但前提是配置中已开启匿名给予。负声望是独立的开关；移除表情回应时会收回其给予的点数。

### 连续记录和统计

连续几天给予声望会累积连续天数；间隔超过一天半则重置。`repstats` 会显示总数、排名、已给予、已接收、当前和最长连续天数，以及最近一次给予和接收的时间。

### 自定义类型

`reptypeadd helpful Helpful` 会创建一个命名类型。成员随后可以运行 `rep @user helpful thanks for the fix`。标准声望只增加总数；自定义类型还会单独记录其次数，命令的要求可以针对该类型设置。

## 表情回应

`repreaction <emoji> [amount] [type]` 会让某个表情回应为消息作者给予声望。进行回应的人不能是机器人，移除表情回应会收回点数。该命令默认给予一点标准声望，每个表情回应配置都有自己的冷却时间。

## 身份组奖励

`reprole @Role 100` 会在成员达到 100 点声望时授予该身份组。可选项包括：当声望低于阈值时移除身份组（默认开启）、在频道中公布该里程碑，以及发送私信。每次声望变动后都会检查奖励。奖励中可以保存额外 XP，但目前尚不会发放。

与身份组奖励无关，当成员跨过 50、100、250、500、1000、2500、5000 或 10000 点声望时，机器人会在 **通知频道** 中发布里程碑消息。成员一次获得十点或以上，或达到十的倍数时，也会收到私信。

## 衰减

开启后，机器人每小时检查一次是否需要执行衰减。`daily` 在 UTC 时间 02:00 运行，`weekly` 在周日 UTC 时间 02:00 运行，`monthly` 在每月 1 日运行。在不活跃期间既未给予也未接收声望的成员，会按衰减数量扣除点数；衰减数量可以是固定点数，也可以是总数的百分比，但不会低于零。被冻结的成员会被跳过。默认值为：每周，1 点，30 天不活跃。

## 命令要求

`repcommandreq <command> <minimum> [type] [#channels]` 会在成员声望达到指定数量之前阻止某个命令，可选择限定为某个自定义类型，也可以限定只在特定频道生效。`repcommandbypass` 可以豁免某些身份组，`repcommandinfo` 允许任何人查看某个命令的要求。

## 设置

声望页面包含四个标签页：**配置**、**身份组奖励**、**排行榜** 和 **统计**。

| 设置 | 默认值 | 作用 |
| --- | --- | --- |
| 启用声望系统 | 开启 | 总开关 |
| 冷却时间（分钟） | 60 | 按每对给予者和接收者计算 |
| 每日上限 | 10 | 每个给予者每天的声望数量 |
| 每周上限（可选） | 无 | 每个给予者每周的声望数量 |
| 最短账号年龄（天） | 7 | 给予者的要求 |
| 最短服务器时长（小时） | 24 | 给予者的要求 |
| 最少消息数 | 10 | 给予者的要求 |
| 通知频道（可选） | 无 | 里程碑消息的发送位置 |
| 允许负声望 | 关闭 | 允许负数金额 |
| 启用匿名声望 | 关闭 | 允许 `repanon` 隐藏给予者 |

衰减不在仪表板中设置；请使用下方的 `repdecay*` 命令。

**身份组奖励** 包含以下表单：**身份组**、**所需声望**、**公告频道（可选）**、**额外 XP（可选）**、**声望低于阈值时移除身份组** 和 **发送私信通知**。**排行榜** 显示排名，并可以打开成员的历史记录。**统计** 显示用户总数、已给予声望总数、交易次数和平均声望。

## 设置步骤

1. 在仪表板中打开 **声望**。在 **配置** 中开启 **已启用**。
2. 根据服务器规模设置 **冷却时间**、**每日上限** 以及三项最低要求。
3. 为里程碑选择一个 **通知频道**，然后保存。
4. 在 **身份组奖励** 中添加身份组并设置 **所需声望**；如果希望身份组需要持续保持，请勾选 **声望低于阈值时移除身份组**。
5. 在 Discord 中运行 `repreaction <emoji> 1` 以启用表情回应声望，并运行 `repchannel #bot-spam disabled` 将刷屏频道排除在外。
6. 使用第二个账号进行测试：`rep @you great help`，然后运行 `repcheck @you`。

> [!WARNING]
> `represet all` 会在确认后清除服务器中每位成员的声望、历史记录和徽章。此操作无法撤销。

## 命令

请使用服务器的前缀运行这些命令（默认为 `.`，除非你已更改）。

| 命令 | 别名 | 所需权限 | 用途 |
| --- | --- | --- | --- |
| `rep <@user> [type] [reason]` | `+rep`, `giverep`, `gr`, `repgive` | 无 | 给予一点声望 |
| `repanon <@user> [type] [reason]` | `anongiverep` | 无 | 匿名给予声望 |
| `anonrep <@user> [type] [reason]` | | 无 | 与 `repanon` 相同 |
| `repcheck [@user]` | `myrep`, `checkrep` | 无 | 显示总数和排名 |
| `repleaderboard [page]` | `replb`, `reptop`, `toprep` | 无 | 排名，每页 25 人 |
| `rephistory [@user]` | `rephist` | 无 | 最近十条声望记录 |
| `repstats [@user]` | `repstat` | 无 | 详细统计和连续记录 |
| `repcommandinfo <command>` | `repcmdinfo`, `rci` | 无 | 显示某个命令的声望要求 |
| `repstatus` | `repsettings` | 管理员 | 显示配置 |
| `repconfig` | `repcfg` | 管理员 | 交互式配置菜单 |
| `repenable [true/false]` | `repe` | 管理员 | 开启或关闭系统 |
| `repcooldown <minutes>` | `repcd` | 管理员 | 1 到 1440 |
| `repdailylimit <n>` | `repdl` | 管理员 | 1 到 100 |
| `repweeklylimit [n]` | `repwl` | 管理员 | 1 到 500，或使用 none 清除 |
| `repminage <days>` | `repma` | 管理员 | 0 到 365 |
| `repminmembership <hours>` | `repmm` | 管理员 | 0 到 720 |
| `repminmessages <n>` | `repminmsg` | 管理员 | 0 到 1000 |
| `repnegative <true/false>` | `repneg` | 管理员 | 允许负声望 |
| `repanonymous <true/false>` | `repanonym` | 管理员 | 允许匿名声望 |
| `repnotificationchannel [#channel]` | `repnotify` | 管理员 | 设置或清除里程碑频道 |
| `repchannel <#channel> [enabled/disabled/readonly] [multiplier]` | `repch` | 管理员 | 每个频道的状态和倍率 |
| `repdecay <true/false>` | `repd` | 管理员 | 启用衰减 |
| `repdecaytype <daily/weekly/monthly/fixed/percentage>` | `repdt` | 管理员 | 衰减周期或数量类型 |
| `repdecayamount <n>` | `repda` | 管理员 | 1 到 100 点或百分比 |
| `repdecayinactive <days>` | `repdi` | 管理员 | 1 到 365 天，之后开始衰减 |
| `reptake <@user> [amount]` | `-rep`, `takerep` | 管理员 | 扣除点数 |
| `repset <@user> <amount>` | `setrep` | 管理员 | 设置总数 |
| `represet <@user or all>` | `resetrep` | 管理员 | 重置一位成员或所有人 |
| `repfreeze <@user>` | `freezerep` | 管理员 | 阻止成员接收声望 |
| `repunfreeze <@user>` | `unfreeze`, `unfreezerep` | 管理员 | 撤销冻结 |
| `repreaction <emoji> [amount] [type]` | `repemoji`, `rre` | 管理员 | 添加或更新表情回应奖励 |
| `repreactionremove <emoji>` | `repemojiremove`, `rrer` | 管理员 | 移除表情回应奖励 |
| `repreactionlist` | `repemojilist`, `rrel` | 管理员 | 列出表情回应奖励 |
| `reprole [@role] [rep] [removeOnDrop] [#channel] [dm] [xp]` | | 管理身份组 | 添加、更新或列出身份组奖励 |
| `reproleremove <@role>` | `reprr` | 管理身份组 | 移除身份组奖励 |
| `reprolechannel <@role> [#channel]` | `reprc` | 管理员 | 设置或清除奖励的公告频道 |
| `repcommandreq <command> <min> [type] [#channels]` | `repcmdreq`, `rcr` | 管理员 | 为命令设置声望要求 |
| `repcommandbypass <command> <@roles>` | `repcmdbypass`, `rcb` | 管理员 | 可跳过要求的身份组 |
| `repcommandreqremove <command>` | `repcmdreqremove`, `rcrr` | 管理员 | 移除要求 |
| `repcommandreqlist` | `repcmdreqlist`, `rcrl` | 管理员 | 列出要求 |
| `reptypeadd <name> <display name>` | `repaddtype`, `rta` | 管理员 | 添加自定义类型 |
| `reptyperemove <name>` | `repremovetype`, `rtr` | 管理员 | 移除自定义类型 |
| `reptypelist` | `replisttypes`, `rtl` | 管理员 | 列出自定义类型 |
| `repeventcreate <name> <multiplier> <hours>` | `repec` | 管理员 | 记录一个倍率活动 |
| `repeventend <name>` | `repee` | 管理员 | 提前结束活动 |
| `repexport` | `repex` | 管理员 | 将配置导出为 JSON |
| `repimport` | `repim` | 管理员 | 导入附加在消息中的配置文件 |
| `repmilestonelost <@user> <@role> <threshold>` | | 管理员 | 测试失去里程碑时的消息 |

`/rep` 斜杠命令包括 `give`、`check`、`leaderboard`、`history` 和 `stats`，以及管理员命令组 `/rep config`、`/rep decay`、`/rep manage`、`/rep reaction`、`/rep role`、`/rep type`、`/rep event` 和 `/rep require`，它们与上面的设置命令一一对应。`/rep role list` 和 `/rep role info` 仅可通过斜杠命令使用。

## 提示和注意事项

- 身份组奖励要求机器人的身份组位于每个奖励身份组之上，并具备“管理身份组”权限；`reprole` 会拒绝位于机器人之上的身份组。
- 最少消息数依赖消息计数功能。如果计数功能关闭，成员的计数将为零，可能无法给予声望。
- 只有 `disabled` 频道状态会阻止给予声望。命令接受 `readonly`，但目前不会阻止该频道中的声望。
- 使用 `repeventcreate` 创建的活动会保存其倍率和结束时间，但活动期间给予的声望目前不会应用该倍率。
- 表情回应声望对标准表情使用表情名称，对自定义表情使用其 ID，因此来自其他服务器的自定义表情在被移除后将无法匹配。
- 衰减检查每小时运行一次，因此 `daily` 衰减只会在 UTC 时间 02:00 所在的那一小时发生一次。
- 冷却时间按每对成员计算。一位成员可以连续给予多个不同的人声望，直到达到每日上限。
