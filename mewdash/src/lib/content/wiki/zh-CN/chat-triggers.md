---
title: 触发器
slug: chat-triggers
summary: 对消息、表情回应、斜杠命令和机器人事件的自动回应，支持条件、费用、计数器、身份组授予以及完整的占位符。
icon: fa-comments
category: Actions
dashboard: /dashboard/chat-triggers
module: ChatTriggers
tags: [chat triggers, triggers, autoresponder, custom commands, auto reply, reaction roles, regex, counters, placeholders, event triggers, 聊天触发器, 触发器, 自动回复, 自定义命令, 表情身份组, 正则表达式, 计数器, 占位符, 事件触发器]
related: [administration, xp, currency, tickets, giveaways]
---

## 功能简介

触发器是机器人监听的一段文本，以及看到该文本后发送的回复。最简单的形式是：成员输入 `hello`，机器人回复 `hi there`。在此基础上，触发器还可以匹配消息中的任意位置或通过正则表达式匹配，以嵌入消息回复，添加表情回应，以私信发送回复，删除成员的消息，授予或移除身份组，将副本发布到另一个频道或 Webhook，并在完成后运行第二个触发器。

触发器不一定非得是消息。同一个触发器可以注册为斜杠命令、消息命令或用户右键命令，在有人添加或移除特定表情回应时触发，也可以在机器人事件发生时触发，例如成员升级、加入服务器、开始助推、工单开启或抽奖中奖。

每个触发器都有各自的条件：按用户、频道或服务器计算的冷却时间，所需的 XP 等级，货币费用或奖励，生效的时段和日期，过期日期，使用次数上限，账号最短注册时间或在服务器中的最短停留时间，以及必须处于指定范围内的计数器。条件不满足时，触发器会保持静默，或显示你预先设置的提示。仪表板上的测试器会准确告诉你，是哪条规则阻止了某条示例消息触发。

回复可以读取机器人其他部分的数值：成员的等级、余额、声望或消息数，触发词之后的文本，被提及的人，被回复的消息，正则表达式的捕获组，以及回复可以读取和递增的服务器级计数器。

## 适用场景

- 自动回答常见问题，例如 `!rules` 发送规则嵌入消息。
- 成员可以免费使用的趣味命令，无需依赖机器人内置的命令集。
- 类似 `daily` 的触发器，利用冷却时间和奖励，每位用户每天发放一次货币。
- 一个 "verify" 词语，授予身份组并删除该消息。
- 表情身份组，成员使用指定表情回应时获得身份组。
- 自定义的升级、欢迎或助推公告，按你喜欢的格式呈现，由事件而非消息触发。
- 运行中的计数器，例如 "距离上次事故的天数"，任何人都可以用一个词来递增。

## 触发类型

一个触发器有一组已启用的类型，类型决定了什么能触发它。默认启用的是消息类型；其他类型可通过 `chattriggervalidtype` 或仪表板上的开关按触发器单独启用。

| 类型 | 触发时机 |
| --- | --- |
| Message | 消息与触发文本匹配 |
| Interaction | 有人运行了为其注册的斜杠、消息或用户命令 |
| Button | 与触发器 ID 匹配的按钮组件被按下 |
| Reactions | 有人向消息添加了触发器的表情 |
| ReactionsRemoved | 有人从消息中移除了触发器的表情 |
| Event | 以下某个机器人事件发生 |

### 消息匹配

默认情况下，整条消息（转为小写后）必须与触发文本完全一致。有两个选项可以放宽这一要求：

- **在消息任意位置匹配**（`ctca`）：触发文本必须作为完整单词出现在消息的某处。
- **允许指定目标**（`ctat`）：消息可以以触发文本开头，后跟一个空格和更多文字，这部分文字会成为 `%target%`。

**正则表达式**触发器（`addchattriggerregex`）会用模式匹配消息。每个模式限时 100 毫秒，超时的模式将被跳过。命名或编号的捕获组可在回复中以 `%regex.1%` 或 `%regex.name%` 的形式使用。

**前缀要求**决定消息在匹配前是否必须以某个前缀开头：

| 选项 | 行为 |
| --- | --- |
| No prefix needed | 直接匹配原始文本（默认） |
| Global prefix | 必须以机器人的全局前缀开头 |
| Server prefix, or global | 必须以服务器前缀开头，若无则回退到全局前缀 |
| Server prefix if one is set | 必须以服务器前缀开头；若服务器未设置前缀则永不匹配 |
| A custom prefix | 必须以 `ctprefix` 设置的前缀开头 |

如果多个触发器匹配同一条消息，将随机选择其中一个。来自机器人和 Webhook 的消息会被忽略，除非某个触发器开启了 **仅限机器人**（`ctallowbots`），此时它只会回应机器人消息。机器人从不回应自己的消息。

### 交互触发器

`setctintertype` 将触发器注册为斜杠、消息或用户应用命令。`setctintername` 和 `setctinterdesc` 设置其名称和描述；名称必须符合 Discord 的命令命名规则。`ctinterephemeral` 使回复仅对执行者可见。`ctintererrors` 列出注册失败的原因，例如名称重复或子命令过多。

### 表情回应触发器

`addreactiontrigger <emoji> <response>` 创建一个文本为该表情的触发器。将 **添加表情回应** 或 **移除表情回应** 设为其类型。回复会发送到被添加表情的消息所在的频道，身份组授予对象为添加表情的成员（若选择 **被提及的用户**，则为被回应消息中提及的成员）。来自机器人的表情回应会被忽略。

### 事件触发器

`ctevent <id> <event>` 使触发器改为由事件触发，并为其启用 Event 类型。可用事件如下：

| 事件 | 触发对象 |
| --- | --- |
| XpLevelUp | 成员获得一个等级 |
| XpLevelDown | 成员失去一个等级 |
| MemberJoin | 成员加入服务器 |
| MemberLeave | 成员离开服务器 |
| VoiceJoin | 成员加入语音频道 |
| VoiceLeave | 成员离开语音频道 |
| Boost | 成员开始助推 |
| BoostEnd | 成员停止助推 |
| TicketOpened | 工单被开启 |
| TicketClosed | 工单被关闭 |
| GiveawayWon | 成员赢得抽奖 |

回复会发送到 `cteventchannel` 设置的频道；若未设置，则发送到事件发生的频道。加入、离开、语音和助推事件本身没有对应频道，因此这类触发器必须指定频道，否则不会有任何反应。事件触发器与消息触发器经过相同的条件和经济检查，事件所涉及的成员将被视为占位符和身份组授予的对象。

## 回复

主要回复是创建触发器时填写的文本。它会经过嵌入解析器处理，因此可以是纯文本、一个或多个嵌入消息，或在仪表板的嵌入编辑器中构建的组件。额外回复可通过 `ctaddresponse` 添加，**回复模式**决定发送哪些回复：

| 模式 | 行为 |
| --- | --- |
| Single | 始终发送第一条回复（默认） |
| Random | 随机选择一条；重复某行可提高其权重 |
| RoundRobin | 按顺序，每次使用一条，在服务器内共享 |
| All | 按顺序发送所有回复 |

发送选项，均默认关闭：

- **回复该消息**（`ctreply`）：以 Discord 回复的形式发送。
- **以私信发送回复**（`ctdm`）：私下发送给成员。
- **删除触发的消息**（`ctad`）：删除成员输入的内容。
- **改为对消息添加表情回应**（`rtt`）：将触发器的表情放在成员的消息上，而不是回复上。不能与删除同时使用。
- **不发送任何消息**（`ctnr`）：适用于仅用于授予身份组的触发器。
- **在以下时间后删除回复**（`ctdeleteafter`）：机器人回复在多少秒后被删除；0 表示保留。
- **用于回应的表情**（`ctreact`）：最多六个表情，每秒添加一个。不指定表情则清空列表。

### 跨频道发布

`ctcpch` 会将每条回复的副本发布到服务器中的另一个频道。`ctcpwh` 则通过 Webhook 链接发布，该 Webhook 可以位于其他服务器。即使开启了 **不发送任何消息**，跨频道发布仍会进行。

### 身份组

**要授予的身份组**和**要移除的身份组**（`ctrgranttoggle`、`ctrremovetoggle`）会在触发器触发时生效。对同一身份组再次运行切换命令，会将其从列表中移除。**将这些身份组应用于**（`chattriggerrolegranttype`）用于选择对象：

| 对象 | 受影响的成员 |
| --- | --- |
| Sender | 触发该触发器的成员（默认） |
| Mentioned | 消息中提及的至多五名成员 |
| Both | 发送者，加上至多四名被提及的成员 |

当对象包含被提及的成员时，匹配前会先从消息中去除提及内容，因此 `verify @someone` 仍能匹配触发文本 `verify`。

### 串联

`ctchain <id> <nextId>` 会在第一个触发器完成后运行第二个触发器。第二个触发器会独立评估，包括其自身的条件和费用。串联最多执行五步，且不会重复运行已经执行过的触发器。

## 条件

以下条件都会在任何费用扣除、消息发送或次数统计之前进行检查。条件不满足时，触发器会静默不触发；但等级和货币检查例外，如果你用 `ctreqmsg` 设置了**无法使用时的提示**，它会显示该提示。

| 条件 | 命令 | 默认值 | 行为 |
| --- | --- | --- | --- |
| 冷却 | `ctcooldown <id> <seconds> [scope]` | 无 | 在指定秒数内阻止重复触发。范围为 `User`、`Channel` 或 `Guild` |
| 所需等级 | `ctreqlevel <id> <level>` | 0 | 成员的 XP 等级必须不低于此值 |
| 费用 | `ctcost <id> <amount>` | 0 | 从成员处扣除的货币；成员无力支付则不触发 |
| 奖励 | `ctreward <id> <amount>` | 0 | 触发时支付给成员的货币 |
| XP 奖励 | `ctxpreward <id> <amount>` | 0 | 触发时授予的 XP |
| 生效时段 | `cttime <id> <HH:mm> <HH:mm> [days...]` | 全天 | 仅在该时段内触发，时区为服务器所在时区。结束时间早于开始时间时，将跨夜生效。日期可用名称或 0 至 6 表示，周日为 0 |
| 过期 | `ctexpiry <id> [duration]` | 永不 | 从当前起经过指定时长后停止触发，例如 `7d` |
| 使用次数上限 | `ctmaxuses <id> <uses>` | 无限制 | 触发达到指定次数后停止；0 表示取消限制 |
| 账号最短注册时间 | `ctminage <id> [duration]` | 无 | 账号必须至少已存在这么久 |
| 在服务器中的最短时间 | `ctminmember <id> [duration]` | 无 | 成员必须至少已在服务器中这么久 |
| 计数器范围 | `ctrequirecounter <id> <name> [min] [max]` | 无 | 指定计数器必须处于该范围内；以 `clear` 作为名称可将其移除 |

冷却只在所有其他条件都通过之后才开始计时，因此被阻止的尝试不会消耗冷却。费用在奖励支付之前扣除，因此一个既收费又付款的触发器，永远不会向付不起费用的人付款。使用 `cmdcd` 设置的服务器级命令冷却同样适用于触发器，按用户计算，叠加在触发器自身的冷却之上。

## 计数器

计数器是按服务器存储的命名数字。它们在某个回复首次使用时创建，并可在任何回复中读取或修改：

| 占位符 | 效果 |
| --- | --- |
| `%counter:name%` | 显示计数器 |
| `%counter:name+%` | 加一并显示新值 |
| `%counter:name-%` | 减一并显示新值 |
| `%usercounter:name%` | 显示触发成员自己的该名称数值 |
| `%usercounter:name+%` | 将成员的数值加一 |
| `%usercounter:name-%` | 将成员的数值减一 |

名称最长 64 个字符，可包含字母、数字、下划线或连字符，且不区分大小写。`ctcounters` 列出所有计数器，`ctcounterset` 将计数器设为指定值，`ctcounterdelete` 会删除该计数器以及该名称下所有的每用户数值。仪表板侧边栏中的**计数器**面板提供相同的功能。

## 占位符

回复可以使用通用占位符（来自占位符页面的用户、服务器、频道、机器人和时间占位符）、触发器占位符，以及其他模块提供的占位符。`ctplaceholders` 会实时列出其他模块提供的占位符。

| 占位符 | 值 |
| --- | --- |
| `%target%` | 触发词之后输入的全部内容（需要开启**允许指定目标**或**在消息任意位置匹配**） |
| `%targetuser%` | 消息中第一位被提及成员的提及 |
| `%targetuser.id%`、`%targetuser.name%`、`%targetuser.avatar%` | 该成员的 ID、用户名和头像 |
| `%targetusers%`、`%targetusers.id%` | 所有被提及的成员，以提及或 ID 形式显示 |
| `%replied.content%` | 成员所回复的消息内容 |
| `%replied.author%`、`%replied.author.id%` | 该消息的作者 |
| `%usecount%` | 此触发器已被触发的次数 |
| `%regex.1%`、`%regex.name%` | 正则表达式触发器的捕获组 |
| `%img:tag%` | 该标签下随机的 Imgur 图片 |
| `%rng%` | 通用占位符集中的随机数 |
| `%xp.level%`、`%xp.rank%`、`%xp.total%`、`%xp.current%`、`%xp.required%`、`%xp.remaining%`、`%xp.bonus%` | 成员的 XP 数据 |
| `%targetuser.xp.level%`、`%targetuser.xp.rank%`、`%targetuser.xp.total%` | 被提及成员的 XP 数据 |
| `%currency.balance%`、`%currency.bank%`、`%currency.total%`、`%currency.emote%` | 成员的货币数据 |
| `%targetuser.currency.balance%`、`%targetuser.currency.bank%` | 被提及成员的货币数据 |
| `%rep%`、`%rep.rank%`、`%targetuser.rep%`、`%targetuser.rep.rank%` | 声望 |
| `%messages%`、`%messages.channel%`、`%messages.server%`、`%targetuser.messages%` | 消息数 |
| `%invites%`、`%targetuser.invites%`、`%inviter%` | 邀请数，以及邀请该成员的人 |
| `%targetuser.afk%` | 被提及成员的离开消息（AFK） |
| `%counter:name%` 及相关占位符 | 计数器，如上所述 |

`%target%` 中的提及会被屏蔽，除非该成员本身有权提及所有人。

> [!EXAMPLE]
> 触发器 `daily`，回复 `%user.mention% claimed today's bonus. Balance: %currency.balance%`，并设置 `ctreward 12 100`、`ctcooldown 12 86400 User` 和 `ctreqmsg 12 Come back tomorrow.`

## 测试器

`cttest <id> <sample message>`，或触发器卡片上的**测试此触发器**输入框，会以你的身份检查某条消息是否会触发该触发器，且不会发送、扣费或计数。它会报告文本是否匹配，并且如果触发器不会触发，还会说明是哪条规则阻止了它：已禁用、仅限机器人、不匹配、权限条目、权限覆盖、过期、冷却、计数器、使用次数上限、生效时段、账号注册时间、在服务器中的时间、等级、余额，或服务器命令冷却。

## 分类与组织

`ctcategory <id> <name>` 将触发器放入某个分类。`ctcategorytoggle <name> <true or false>` 可一次性启用或禁用该分类中的所有触发器，仪表板侧边栏也可按分类筛选。`cttoggle` 可暂停单个触发器而不删除它。`ctstats` 显示某个触发器的触发次数以及最近触发它的成员。

`ctsexport` 会将所有触发器下载为 YAML 文件，`ctsimport` 可从附件或 URL 导入。`ctsclear` 在确认后删除所有触发器。

## 设置

所有设置都针对单个触发器。触发器页面提供**简单模式**，其中包含**快速设置**表单（触发文本和回复），以及**高级模式**，其中包含**高级触发器创建**，你可以在此选择**匹配类型**（普通文本模式或正则表达式模式）、触发类型，并可在保存前测试正则表达式。

展开每个触发器卡片可以看到**触发文本**、**回复消息**编辑器、测试器，以及按主题分组的设置折叠面板：

| 分组 | 设置 |
| --- | --- |
| 匹配条件 | 前缀要求、自定义前缀、在消息任意位置匹配、允许指定目标、仅限机器人所有者 |
| 回应方式 | 回复该消息、以私信发送回复、删除触发的消息、改为对消息添加表情回应、不发送任何消息、用于回应的表情、在以下时间后删除回复、额外回复、存在多条回复时 |
| 身份组 | 要授予的身份组、要移除的身份组、将这些身份组应用于 |
| 限制 | 冷却（秒）、冷却作用于、达到此次数后停止、在以下时间后停止触发、账号最短注册时间（分钟）、最短加入服务器时间（分钟）、仅在特定时段生效（从、至及在以下日期） |
| 费用与奖励 | 向用户收取、向用户发放、授予经验值、所需等级、无法使用时的提示 |
| 计数器要求 | 计数器名称、至少、最多 |
| 事件触发 | 触发时机、回应于 |
| 组织 | 分类、随后触发、回应机器人而非用户 |

侧边栏列出分类、**计数器**以及实时的**占位符**列表，并提供用于搜索触发器和回复的搜索框。

## 设置步骤

1. 在仪表板中打开**触发器**。在**简单模式**下，输入触发词，并在编辑器中构建回复，然后创建它。
2. 展开新卡片。在**匹配条件**下，如果该词应当能在句子中间触发，请开启**在消息任意位置匹配**。
3. 在**回应方式**下，选择是回复、私信，还是删除成员的消息。
4. 在**限制**下，设置冷却时间，防止被刷屏。
5. 在**测试此触发器**中输入示例消息，然后点击**测试**。根据提示修复阻止触发的问题。
6. 若要设置升级公告，创建一个任意文本的触发器，将**触发时机**设为"成员升级"，将**回应于**留空以便在成员发言的地方发布，并在回复中使用 `%user.mention%` 和 `%xp.level%`。
7. 为相关触发器设置**分类**，以便可以一起暂停。

## 命令

以下命令需使用服务器前缀运行（默认为 `.`，除非你已更改）。触发器 ID 可通过 `listchattriggers` 查看。

| 命令 | 别名 | 所需权限 | 用途 |
| --- | --- | --- | --- |
| `addchattrigger <trigger> <response>` | `act`、`acr` | 管理员 | 创建触发器；多个单词的触发文本需加引号 |
| `addchattriggerregex <pattern> <response>` | `actr` | 管理员 | 创建正则表达式触发器 |
| `addreactiontrigger <emoji> <response>` | `addrt` | 管理员 | 创建表情回应触发器 |
| `editchattrigger <id> <response>` | `ect` | 管理员 | 替换主要回复 |
| `deletechattrigger <id>` | `dct` | 管理员 | 删除触发器 |
| `listchattriggers` | `lct` | 管理员 | 列出触发器及其 ID |
| `listchattriggersgroup` | `lctg` | 管理员 | 按触发文本分组列出触发器 |
| `showchattrigger <id>` | `sct` | 管理员 | 显示单个触发器的设置 |
| `cttoggle <id>` | `chattriggertoggle` | 管理员 | 暂停或恢复触发器 |
| `ctca <id>` | | 管理员 | 切换在消息任意位置匹配 |
| `ctat <id>` | | 管理员 | 切换允许指定目标 |
| `ctdm <id>` | | 管理员 | 切换私信回复 |
| `ctad <id>` | | 管理员 | 切换删除触发的消息 |
| `rtt <id>` | `reactottrigger` | 管理员 | 切换改为对消息添加表情回应，而非回复 |
| `ctnr <id>` | `chattriggernoresponse` | 管理员 | 切换不发送任何消息 |
| `ctreply <id>` | `chattriggerreply` | 管理员 | 切换回复该消息 |
| `ctdeleteafter <id> <seconds>` | `chattriggerdeleteafter` | 管理员 | 在延迟后删除回复 |
| `ctreact <id> [emoji...]` | `ctr` | 管理员 | 设置最多六个表情回应，或将其清空 |
| `ctaddresponse <id> <response>` | `chattriggeraddresponse` | 管理员 | 添加额外回复 |
| `ctclearresponses <id>` | `chattriggerclearresponses` | 管理员 | 移除额外回复 |
| `ctresponsemode <id> <mode>` | `chattriggerresponsemode` | 管理员 | `Single`、`Random`、`RoundRobin` 或 `All` |
| `ctprefixtype <id> <type>` | `chattriggersprefixtype` | 管理员 | `None`、`Global`、`GuildOrGlobal`、`GuildOrNone` 或 `Custom` |
| `ctprefix <id> <prefix>` | `chattriggersprefix` | 管理员 | 设置自定义前缀 |
| `chattriggervalidtype <id> <type> <true or false>` | `ctvalidtype`、`ctvt` | 管理员 | 启用或禁用某个触发器类型 |
| `ctallowbots <id>` | `chattriggerallowbots` | 管理员 | 切换仅回应机器人消息 |
| `ctrgranttoggle <id> @role` | `ctgt`、`ctgranttoggle` | 管理员 | 切换要授予的身份组 |
| `ctrremovetoggle <id> @role` | `ctrt`、`ctremovetoggle` | 管理员 | 切换要移除的身份组 |
| `chattriggerrolegranttype <id> <type>` | `ctrolegranttype`、`ctrgt` | 管理员 | `Sender`、`Mentioned` 或 `Both` |
| `chattriggerscrosspostchannel <id> <#channel>` | `ctcpch`、`ctcpchannel`、`ctcrosspostchannel`、`ctcrosspostch` | 管理员 | 跨频道发布到某个频道 |
| `chattriggerscrosspostwebhook <id> <url>` | `ctcpwh`、`ctcpwebhook`、`ctcrosspostwebhook`、`ctcrosspostwh` | 管理员 | 通过 Webhook 跨频道发布 |
| `setctintertype <id> <type>` | `ctitype`、`ctintertype` | 管理员 | `None`、`Slash`、`Message` 或 `User` |
| `setctintername <id> <name>` | `ctiname`、`ctrealname` | 管理员 | 应用命令名称 |
| `setctinterdesc <id> <description>` | `ctidesc`、`ctinterdesc` | 管理员 | 应用命令描述 |
| `ctinterephemeral <id> <true or false>` | `ctieph` | 管理员 | 交互回复是否仅本人可见 |
| `ctintererrors` | `ctierrors`、`ctie` | 管理员 | 显示命令注册错误 |
| `ctevent <id> <event>` | `chattriggerevent` | 管理员 | 设为由事件触发；`None` 则停止 |
| `cteventchannel <id> [#channel]` | `chattriggereventchannel` | 管理员 | 事件回复所在的频道 |
| `ctcooldown <id> <seconds> [scope]` | `chattriggercooldown` | 管理员 | 触发器自身的冷却 |
| `ctreqlevel <id> <level>` | `chattriggerrequiredlevel` | 管理员 | 所需 XP 等级 |
| `ctcost <id> <amount>` | `chattriggercost` | 管理员 | 货币费用 |
| `ctreward <id> <amount>` | `chattriggerreward` | 管理员 | 货币奖励 |
| `ctxpreward <id> <amount>` | `chattriggerxpreward` | 管理员 | XP 奖励 |
| `ctreqmsg <id> [message]` | `chattriggerrequirementmessage` | 管理员 | 条件不满足时显示的消息 |
| `cttime <id> <start> <end> [days...]` | `chattriggertime` | 管理员 | 生效时段，或使用 `cttime <id> clear` 清除 |
| `ctexpiry <id> [duration]` | `chattriggerexpiry` | 管理员 | 过期时间，或不填以清除 |
| `ctmaxuses <id> <uses>` | `chattriggermaxuses` | 管理员 | 使用次数上限，0 表示不限 |
| `ctminage <id> [duration]` | `chattriggerminimumage` | 管理员 | 账号最短注册时间 |
| `ctminmember <id> [duration]` | `chattriggerminimummembership` | 管理员 | 在服务器中的最短时间 |
| `ctrequirecounter <id> <name> [min] [max]` | `chattriggerrequirecounter` | 管理员 | 计数器范围要求 |
| `ctcounters` | `chattriggercounters` | 无 | 列出计数器 |
| `ctcounterset <name> <value>` | `chattriggercounterset` | 管理员 | 设置计数器 |
| `ctcounterdelete <name>` | `chattriggercounterdelete` | 管理员 | 删除计数器 |
| `ctplaceholders` | `chattriggerplaceholders` | 无 | 列出其他模块提供的占位符 |
| `ctcategory <id> [name]` | `chattriggercategory` | 管理员 | 设置或清除分类 |
| `ctcategorytoggle <name> <true or false>` | `chattriggercategorytoggle` | 管理员 | 启用或禁用某个分类 |
| `ctchain <id> <nextId>` | `chattriggerchain` | 管理员 | 串联到另一个触发器，0 表示清除 |
| `cttest <id> <sample>` | `chattriggertest` | 管理员 | 试运行一条示例消息 |
| `ctstats <id>` | `chattriggerstats` | 管理员 | 触发次数及最近的触发者 |
| `ctsexport` | | 管理员 | 将触发器导出为 YAML |
| `ctsimport [url]` | | 管理员 | 从 URL 或附件导入 |
| `ctsmigrate` | `ctsconvert` | 管理员 | 转换旧版嵌入格式，并会先备份 |
| `ctsclear` | | 管理员 | 删除所有触发器 |
| `ctsreload` | | 机器人所有者 | 从数据库重新加载触发器 |

## 提示与注意事项

- 触发器与转为小写后的消息进行匹配，因此触发文本实际上不区分大小写。
- 若关闭了**在消息任意位置匹配**，则整条消息必须与触发文本完全一致。除非开启该选项或允许指定目标，否则 `hello there` 不会触发文本为 `hello` 的触发器。
- 授予身份组需要管理身份组权限，且机器人的身份组必须高于相关身份组。将身份组加入列表的命令还会检查你是否有权管理该身份组。
- 仅限机器人的触发器永远不会回应真人，而面向真人的触发器也永远不会回应机器人；同一个触发器无法同时做到这两点。
- 冷却保存在内存中，机器人重启后会重置。使用次数上限和过期时间会被保存，重启后依然有效。
- 轮询顺序在整个服务器内共享，而非按成员单独计算。
- 权限系统中针对 `ActualChatTriggers` 模块的条目，以及针对触发文本的任何 `permoverride`，会在触发器自身的条件之前进行检查。
- 交互触发器会注册真正的应用命令，因此 Discord 对命令数量和名称的限制同样适用。若某个命令没有出现，请检查 `ctintererrors`。
- 回复上的表情回应每秒添加一个，因此六个表情需要六秒才会全部出现。
- 加入、离开、语音和助推事件的触发器，在你设置**回应于**之前会静默不生效。
