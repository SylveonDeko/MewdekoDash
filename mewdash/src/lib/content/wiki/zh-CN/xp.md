---
title: 经验值系统
slug: xp
summary: 奖励成员的聊天与语音活跃度，设有等级、等级卡片、身份组与货币奖励以及限时活动。
icon: fa-star
category: Community
dashboard: /dashboard/xp
module: Xp
tags: [xp, experience, levels, level up, rank, rank card, leaderboard, role rewards, voice xp, xp boost, competition, xp curve, 经验值, 经验, 等级, 升级, 排名, 等级卡片, 排行榜, 身份组奖励, 语音经验值, 经验值加成, 竞赛, 经验值曲线]
related: [currency, achievements, administration, utility]
---

## 功能介绍

成员通过发送消息和在语音频道中交流获得经验值。经验值会按你选择的曲线累积为等级。任何人都可以运行 `rank` 查看渲染好的等级卡片，其中包含等级、进度条、服务器排名和头像；也可以运行 `leaderboard` 查看排行榜。

当成员升级时，机器人可以在频道中发布公告，发到专门的升级通知频道，或通过私信发送。你可以使用占位符编写自定义升级消息，也可以直接使用默认嵌入。达到某个等级时，还可以自动发放身份组和服务器货币。

管理员可以控制经验值的获取速度：每条消息的经验值、冷却时间、每分钟语音经验值、全局倍率，以及按频道和按身份组设置的倍率。限时加成活动会在一段时间内让所有获取量翻倍，竞赛则会进行限时比拼，并为前几名提供奖励。你可以将用户、身份组和频道排除在外，使刷屏频道和被禁言的身份组无法获得经验值。

## 为什么要使用它

- 让活跃成员看到自己的进度，并有动力继续聊天。
- 在设定的等级解锁身份组，使长期成员无需管理员手动操作即可获得特权。
- 举办周末双倍经验值活动，或“率先达到 20 级”的比赛。
- 排除命令频道、挂机频道和机器人身份组，保证经验值获取公平。
- 将经验值与货币模块关联，使升级也能获得奖励。

## 经验值的获取方式

### 文字经验值

非机器人成员每发送一条消息，都会获得**每条消息经验值**（默认 3，上限 50），每个冷却周期只计算一次。**消息经验值冷却时间**默认为 60 秒；如果成员在该时间窗口内发送了十条消息，只会获得一次经验值。在被排除的频道中发送的消息，或来自被排除的用户和身份组的消息，都不会获得经验值。如果整个服务器被排除，则不会计入任何经验值。

获得的数值随后会乘以倍率。以下倍率可以叠加：

| 倍率 | 设置方式 | 说明 |
| --- | --- | --- |
| 全局倍率 | `setxpmultiplier` 或 **全局经验值倍率** | 作用于所有经验值获取 |
| 频道倍率 | `setchannelxp` | 作用于该频道内的经验值获取 |
| 身份组倍率 | `setrolexp` | 若成员拥有多个带倍率的身份组，只使用最高的一个 |
| 加成活动 | `xpboost` | 所有进行中的活动都会生效 |

结果向下取整为整数。

**首条消息奖励**是成员每个 UTC 日首条消息的单独一次性奖励。它保存在经验值设置中，但不会显示在仪表板上。

### 语音经验值

语音经验值按会话进行统计。只有当成员身处至少有两名参与者（不计机器人）的语音频道中，并且未被自己或服务器静音或拒听时，才会获得语音经验值。被静音、拒听或独自一人的时间不计入。

会话结束时，有效分钟数会乘以**每分钟语音经验值**（默认 2，上限 10）。时长不足 15 秒的会话不获得任何经验值。**语音经验值超时**（默认 60 分钟）是单次会话最多可计费的分钟数。只有基础数值至少为 5 时，倍率才会应用于语音经验值。将每分钟语音经验值或超时时间设为 0，即可关闭语音经验值。

### 经验值衰减

衰减为可选功能，默认关闭。开启后，机器人每十二小时会查找最后活动时间早于**衰减前的不活跃天数**的成员，并扣除其总经验值的**每日衰减百分比**。这三项设置存在于经验值设置记录中，但目前还没有对应的命令或仪表板控件。

## 等级与曲线

成员所处的等级取决于**经验值曲线类型**。所有曲线都以升到一级所需的 36 经验值为基础。

| 曲线 | 命令名称 | 仪表板名称 | 达到等级 n 所需经验值 |
| --- | --- | --- | --- |
| 标准 | `Standard` | 默认 | 36 x n 的平方 |
| 线性 | `Linear` | 线性 | 36 x n |
| 加速 | `Accelerated` | 二次 | 36 x n 的 1.25 次方 |
| 减速 | `Decelerated` | 指数 | 36 x n 的 2.5 次方 |
| 自定义 | `Custom` | 不提供 | 与标准相同 |
| 旧版 | `Legacy` | 旧版 | 每级所需经验值为 36 加上前一级每级的 9 点，总量逐级累加 |

标准为默认曲线。使用 `setxpcurve` 更改曲线时，除非第二个参数传入 `false`，否则会重新计算所有人的等级。更改曲线不会改变任何人的经验值总量，只会改变该总量对应的等级。

## 升级通知

每位成员可以通过 `levelnotif` 选择接收升级通知的方式：`None`、`Channel` 或 `Dm`。成员还可以运行 `leveluppings false`，阻止机器人在升级消息中提及自己；此时其名称将以纯文本显示。

频道通知会发送到通过 `levelupchannel` 设置的**升级通知频道**；如果未设置，则发送到获得经验值的频道。机器人需要在该频道中拥有发送消息权限。

如果服务器没有自定义消息，默认会发送一个嵌入，标题为升级消息，缩略图为成员头像，并包含总经验值、服务器排名和新等级等字段。如果你使用 `addlevelupmessage` 添加了自定义消息，每次升级会随机选取一条已启用的消息。自定义消息可以是纯文本，也可以是来自嵌入构建器的嵌入 JSON。可以使用 `testlevelupmessage` 测试任何模板。

### 占位符

这些占位符可用于自定义升级消息，也可以与占位符页面中通用的用户和服务器占位符一起使用。由于通知不会跟踪触发升级的频道或成员，`%xp.channel.*%` 会解析为 "Unknown Channel"，`%xp.triggeruser.*%` 会解析为 "System"，而 `%xp.gained%` 始终为 0。

| 占位符 | 值 |
| --- | --- |
| `%xp.user%` | 用户名和标签；若关闭提及，则为纯用户名 |
| `%xp.user.mention%` | 成员的提及；若关闭提及，则为纯用户名 |
| `%xp.user.name%` | 用户名 |
| `%xp.user.displayname%` | 显示名称 |
| `%xp.user.nickname%` | 昵称，若无则使用用户名 |
| `%xp.user.avatar%` | 头像 URL |
| `%xp.user.id%` | 用户 ID |
| `%xp.user.created%` | 账号创建日期 |
| `%xp.user.joined%` | 加入服务器的日期 |
| `%xp.level.old%` | 升级前的等级 |
| `%xp.level.new%` | 新等级（`%xp.level.current%` 相同） |
| `%xp.level.next%` | 新等级加一 |
| `%xp.level.difference%` | 本次获得的等级数 |
| `%xp.total%` | 总经验值 |
| `%xp.current%` | 当前等级内获得的经验值 |
| `%xp.needed%` | 当前等级所需的总经验值 |
| `%xp.remaining%` | 距离下一等级仍需的经验值 |
| `%xp.progress%` | 当前等级的完成百分比 |
| `%xp.rank%` | 服务器排名数字 |
| `%xp.rank.ordinal%` | 以文字表示的排名，例如 "third" |
| `%xp.rank.suffix%` | 仅后缀：st、nd、rd 或 th |
| `%xp.guild%`、`%xp.guild.name%` | 服务器名称 |
| `%xp.guild.id%` | 服务器 ID |
| `%xp.guild.membercount%` | 大约的成员数 |
| `%xp.guild.icon%`、`%xp.guild.banner%` | 服务器图标和横幅 URL |
| `%xp.time%`、`%xp.time.full%`、`%xp.date%` | 当前 UTC 时间、带日期的时间和日期 |
| `%xp.timestamp%`、`%xp.timestamp.relative%` | 当前时间的 Discord 时间戳标签 |

> [!EXAMPLE]
> `addlevelupmessage %xp.user.mention% just hit level %xp.level.new% and is now %xp.rank.ordinal% on the leaderboard.`

在 Discord 中运行 `levelupplaceholders`，可查看相同的列表。

## 身份组奖励

`rolereward <level> <role>` 会在成员达到指定等级时发放身份组。默认情况下，**独占身份组奖励**处于关闭状态，成员会保留所有不高于其当前等级的奖励身份组，并失去高于其当前等级的奖励身份组。开启后（`setxpexclusive true`），成员只保留其已达到的最高等级对应的奖励，其他奖励身份组都会被移除。

奖励会在等级变化时发放。添加奖励或导入经验值后，可使用 `syncmyxproles`、`syncuserxproles` 或 `syncallxproles` 将身份组与当前等级同步。全体成员同步可每小时运行一次；机器人需要拥有管理身份组权限，且其身份组必须高于所有奖励身份组。

## 货币奖励

`currencyreward <level> <amount>` 会在成员达到指定等级时，从货币模块发放服务器货币。传入 0 即可移除该奖励。如果成员的等级下降（例如经过 `setxp` 或衰减），则会收回其失去等级所对应的货币奖励。

## 成就

[成就](/wiki/achievements)是独立的系统，拥有各自的积分和段位，因此成就段位并不等同于经验值等级。两者在两处产生联系：达到经验值等级可以解锁“社区”类别中的成就；成就也可以通过每个成就的经验值奖励，或成就设置页中的**每积分经验值**返还经验值。两者在你进行设置之前均处于关闭状态。

## 加成活动

`xpboost <time> <multiplier> <name>` 用于启动限时活动，例如 `xpboost 2h 2.0 Weekend XP Event`。所有进行中的加成都会在其他倍率之上，进一步提升消息和语音经验值。`xpboosts` 会列出正在进行的加成，`cancelboost <id>` 可提前结束某个加成。

## 竞赛

`xpcompetition <time> <type> [targetLevel] [name]` 用于启动限时比赛。竞赛进行期间，成员第一次获得经验值时会自动报名。

| 类型 | 获胜条件 |
| --- | --- |
| `MostGained` | 在竞赛期间获得经验值最多的人 |
| `ReachLevel` | 最先达到目标等级的人 |
| `HighestTotal` | 竞赛结束时总经验值最高的人 |

使用 `addcompetitionreward <id> <position> <type> <reward>` 添加奖励，其中类型可为 `Role`、`XP` 或 `Currency`。身份组奖励会直接发放，经验值奖励会作为额外经验值添加，货币则通过货币模块发放。`competitionleaderboard <id>` 可查看排名，`endcompetition <id>` 可提前结束竞赛并发放奖励。

## 排除设置

`xpexclude` 和 `xpinclude` 可接受一个用户、一个身份组或一个文字频道。被排除的用户以及拥有被排除身份组的成员无法获得经验值；被排除的频道对所有人都不产生经验值。语音频道同样适用此规则。`xpexcludelist users|roles|channels` 可查看排除列表。对应的斜杠命令为 `/xp admin exclude`、`/xp admin include`（需传入 `user`、`role` 或 `channel` 选项）和 `/xp exclude-list`。仪表板中的**服务器经验值排除**开关可一次性禁用整个服务器的经验值获取。

## 等级卡片

`rank [@user]` 会生成一张 PNG 卡片。`textrank [@user]` 以文字形式提供相同的信息，便于屏幕阅读器使用。机器人没有排名。

卡片基于服务器的模板生成，包括背景图片（可使用你在**自定义经验值卡片背景**中上传的图片，或内置背景），以及用户头像和名称、进度条、服务器等级、服务器排名、当前等级停留时长和获得的额外经验值等图层。每个图层都可以显示或隐藏、移动、调整大小和更改颜色，进度条可以设置为圆角、分段或环形，并可以向任意方向填充。

**模板**标签页会打开可视化编辑器。屏幕宽度小于 768 像素时，仪表板会切换为触控编辑器，其图层与宽屏版相同，属性面板以底部弹出层显示，并提供简单的位置和尺寸控制。在较宽的屏幕上，你可以使用完整编辑器，包括图层列表、网格、对齐吸附、标尺、撤销与重做以及缩放功能。

## 排行榜

`leaderboard [page]` 会显示服务器排名。如果服务器同时使用货币模块且流通中有货币，直接输入 `leaderboard` 会询问你要查看经验值还是货币；指定页码则始终显示经验值排名。仪表板的**排行榜**标签页显示相同的排名，并提供**调整经验值**操作，可以为成员增加、设置或重置经验值，还可选择是否同时清除额外经验值。

## 设置

仪表板共有六个标签页：**设置**、**统计**、**排行榜**、**奖励**、**模板**和**排除**。以下设置位于“设置”标签页中。

| 设置 | 默认值 | 作用 |
| --- | --- | --- |
| 服务器经验值排除 | 关 | 停止服务器内的所有经验值获取 |
| 每条消息经验值 | 3 | 每条消息的基础经验值，最大 50 |
| 消息经验值冷却时间 | 60 秒 | 每位成员两次消息经验值奖励之间的最短间隔 |
| 每分钟语音经验值 | 2 | 每个有效语音分钟的基础经验值，最大 10；设为 0 则禁用语音经验值 |
| 语音经验值超时 | 60 分钟 | 单次语音会话最多可计费的分钟数 |
| 全局经验值倍率 | 1 | 作用于所有经验值获取 |
| 经验值曲线类型 | 默认 | 决定经验值与等级的对应曲线 |
| 自定义经验值卡片背景 | 无 | 用于等级卡片背景的图片 URL |

**奖励**标签页用于管理身份组和货币奖励，**排除**标签页用于管理被排除的频道和身份组。**统计**标签页显示用户总数、总经验值、平均等级、最高等级以及近期经验值活动。

以下字段同样存在于 `GuildXpSetting` 记录中，但只能通过命令设置：`FirstMessageBonus`、`ExclusiveRoleRewards`（`setxpexclusive`）、`LevelUpChannel`（`levelupchannel`）、`LevelUpMessage`，以及衰减相关字段 `EnableXpDecay`、`InactivityDaysBeforeDecay` 和 `DailyDecayPercentage`。

## 设置步骤

1. 在仪表板中打开**经验值系统**，确认**服务器经验值排除**处于关闭状态。
2. 在**设置**中，先保留消息和语音经验值的默认值，选择曲线类型，然后点击**保存更改**。
3. 在**排除**中，排除机器人命令频道以及被禁言或机器人身份组。
4. 在**奖励**中，为几个里程碑等级添加身份组奖励。确保机器人的身份组位于这些奖励身份组之上。
5. 在 Discord 中运行 `levelupchannel #level-ups`，并添加一到两条 `addlevelupmessage` 模板。使用 `testlevelupmessage` 进行测试。
6. 打开**模板**，上传背景并排布卡片。运行 `rank` 查看效果。

## 命令

请在命令前加上服务器的前缀（默认为 `.`，除非你已更改）。

| 命令 | 别名 | 所需权限 | 用途 |
| --- | --- | --- | --- |
| `rank [@user]` | | 无需权限 | 显示等级卡片 |
| `textrank [@user]` | | 无需权限 | 以文字形式显示排名信息 |
| `leaderboard [page]` | `lb` | 无需权限 | 服务器经验值排行 |
| `levelnotif <None\|Channel\|Dm>` | `lvlnotif` | 无需权限 | 选择接收升级通知的方式 |
| `leveluppings <true\|false>` | `lvluppings` | 无需权限 | 升级消息是否可以提及你 |
| `xpsettings` | `xpconfig` | 管理服务器 | 显示当前经验值设置 |
| `setmessagexp <amount>` | `setmsgxp` | 管理服务器 | 每条消息经验值 |
| `setxpcooldown <seconds>` | `xpcd` | 管理服务器 | 消息经验值冷却时间 |
| `setvoicexp <amount>` | | 管理服务器 | 每分钟语音经验值 |
| `setvoicetimeout <minutes>` | | 管理服务器 | 语音会话上限 |
| `setxpmultiplier <number>` | `xpmult` | 管理服务器 | 全局倍率 |
| `setxpcurve <type> [recompute]` | | 管理服务器 | 更改等级曲线 |
| `setxpexclusive <true\|false>` | `xpexclusive`, `exclusivexp`, `setxpexcl`, `xpexcl` | 管理服务器 | 仅保留最高的奖励身份组 |
| `setchannelxp <#channel> <number>` | | 管理服务器 | 频道倍率 |
| `setrolexp <role> <number>` | | 管理服务器 | 身份组倍率 |
| `addxp <@user> <amount>` | | 管理服务器 | 为成员添加经验值 |
| `setxp <@user> <amount>` | | 管理服务器 | 设置成员的经验值 |
| `resetxp <@user> [resetBonus]` | | 管理服务器 | 将成员的经验值重置为零 |
| `resetxp` | | 管理员 | 重置整个服务器的经验值 |
| `xpboost <time> <multiplier> <name>` | | 管理服务器 | 启动加成活动 |
| `xpboosts` | | 无需权限 | 列出进行中的加成 |
| `cancelboost <id>` | | 管理服务器 | 提前结束加成 |
| `xpexclude <@user\|role\|#channel>` | | 管理服务器 | 排除在经验值获取之外 |
| `xpinclude <@user\|role\|#channel>` | | 管理服务器 | 取消排除 |
| `xpexcludelist [users\|roles\|channels]` | | 无需权限 | 显示排除列表 |
| `rolereward <level> <role>` | `rr` | 管理身份组 | 添加身份组奖励 |
| `removerolereward <level>` | `removerr` | 管理身份组 | 移除身份组奖励 |
| `rolerewards` | | 无需权限 | 列出身份组奖励 |
| `currencyreward <level> <amount>` | `cr` | 管理服务器 | 添加货币奖励 |
| `removecurrencyreward <level>` | `removecr` | 管理服务器 | 移除货币奖励 |
| `currencyrewards` | | 无需权限 | 列出货币奖励 |
| `xpcompetition <time> <type> [targetLevel] [name]` | | 管理服务器 | 启动竞赛 |
| `addcompetitionreward <id> <position> <Role\|XP\|Currency> <reward>` | | 管理服务器 | 添加名次奖励 |
| `xpcompetitions` | | 无需权限 | 列出进行中的竞赛 |
| `competitionleaderboard <id>` | `complb` | 无需权限 | 竞赛排名 |
| `endcompetition <id>` | | 管理服务器 | 结束竞赛并发放奖励 |
| `syncallxproles` | | 管理员 | 为所有成员重新应用奖励身份组（每小时一次） |
| `syncmyxproles` | | 无需权限 | 重新应用你自己的奖励身份组（每五分钟一次） |
| `syncuserxproles <@user>` | | 管理身份组 | 为一名成员重新应用奖励身份组 |
| `levelupchannel [#channel]` | `lvlupchan` | 管理服务器 | 频道通知的发送位置；不指定频道则使用当前频道 |
| `addlevelupmessage <text or embed JSON>` | `addlvlupmsg` | 管理服务器 | 添加自定义升级消息 |
| `levelupmessages` | `lvlupmsgs` | 管理服务器 | 列出自定义消息及其 ID |
| `removelevelupmessage <id>` | `remlvlupmsg` | 管理服务器 | 删除自定义消息 |
| `togglelevelupmessage <id> <true\|false>` | `togglelvlupmsg` | 管理服务器 | 启用或禁用某条消息 |
| `testlevelupmessage [template]` | `testlvlupmsg` | 管理服务器 | 预览模板，或随机预览一条已保存的模板 |
| `levelupplaceholders` | `lvlupplaceholders` | 管理服务器 | 列出上述占位符 |

斜杠命令位于 `/xp` 下，管理员命令分组为：`/xp admin`（添加、设置、重置、排除、纳入、身份组同步）、`/xp config`（经验值速率、倍率、曲线、独占）、`/xp rewards`、`/xp boost`、`/xp competition` 和 `/xp levelup`。`/xp admin reset` 不指定用户时会重置整个服务器的经验值，需要管理员权限以及 `confirm: true`。

## 注意事项与提示

- 身份组奖励和身份组同步需要机器人拥有管理身份组权限，且其最高身份组必须高于所有奖励身份组。若没有该权限，`syncallxproles` 和 `syncuserxproles` 将拒绝运行。
- 语音经验值需要频道中至少有两名未被静音、未被拒听的真人。独自一人或被静音的成员无论停留多久都不会获得经验值。
- 经验值获取会被批量处理并在后台写入，因此 `rank` 显示的数据可能比最后一条消息晚几秒更新。
- 使用 `setxp` 或 `resetxp` 降低某人的经验值可能使其等级下降，这会移除对应的身份组奖励，并收回已失去等级所对应的货币奖励。
- `Custom` 曲线的行为与标准曲线完全相同，且不在仪表板中提供。只有在从旧版设置迁移、并希望现有等级保持一致时，才建议选择旧版曲线。
- 自定义升级消息会完全取代默认嵌入。如果所有自定义消息都已禁用，则默认嵌入会重新生效。
- 加成活动和竞赛只能通过命令管理，仪表板中不显示。
