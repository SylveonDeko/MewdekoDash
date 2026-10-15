---
title: 实用工具
slug: utility
summary: 日常辅助工具箱，涵盖命令别名、语录、提醒、自动发布、直播身份组、AI 助手、消息计数和定时重复消息。
icon: fa-wrench
category: Actions
dashboard: /dashboard/utility
module: Utility
tags: [alias, quotes, auto publish, stream role, ai, chatbot, nsfw filter, role monitor, reminder, snipe, repeater, sticky, message count, invites, embed, calculator, userinfo, serverinfo, 别名, 语录, 自动发布, 直播身份组, AI, 聊天机器人, NSFW 过滤, 身份组监控, 提醒, 消息狙击, 定时重复消息, 置顶, 消息计数, 邀请, 嵌入, 计算器, 用户信息, 服务器信息]
related: [repeaters, polls, invites, messagestats, embedbuilder, xp, administration, moderation]
---

## 功能简介

实用工具是一个兜底模块，收纳大多数服务器都会用到的小功能。成员可以使用提醒、语录、掷骰子、计算器、单位换算，以及查询用户、身份组、频道和服务器信息的命令。管理人员则可以使用命令别名、定时重复消息、公告频道自动发布、成员直播时自动获得的身份组、已删除消息查看、消息计数和邀请追踪。

仪表板中的**实用工具**页面集中了适合用表单设置的功能：别名、语录、自动发布、直播身份组、AI 助手、NSFW 标签过滤和身份组监控。其余功能只能通过命令使用。

由于本模块功能较多，下文会分别介绍每个子功能。末尾的命令表列出了本模块的全部命令。

## 适用场景

- 用别名把 `play youtube` 缩短为 `yt`，对全服务器生效。
- 维护一个共享的语录库，成员可以添加内容，也可以随机抽取。
- 让公告频道中的每条消息自动发布给关注者。
- 让成员只在直播特定游戏时获得“Live”身份组。
- 每隔几分钟发布一次规则或置顶提示，或仅在频道活跃时发布。
- 让成员为自己或某个频道设置提醒。
- 使用你自己的 API 密钥，在一个频道中运行 AI 助手。

## 别名

别名是一个触发词，机器人会在运行前将其改写为另一条命令。`alias yt play youtube` 的效果是：`.yt lofi` 会运行为 `.play youtube lofi`。触发词必须是消息的第一个词，其后的内容会附加到映射的命令之后。较长的触发词会优先匹配。运行 `alias <trigger>` 且不带映射即可删除别名，`aliasesclear` 会删除全部别名。

在仪表板上，**别名**标签页有**别名触发词**和**别名映射**输入框、一个搜索框，以及可删除别名的列表。

## 语录

语录是归档在关键词下的简短文本。`quoteadd <keyword> <text>` 添加语录，`quoteprint <keyword>`（或 `..`）随机显示该关键词下的一条语录，`quoteshow <id>` 显示指定语录。`quotesearch` 按关键词和内容搜索，`quoteid` 显示语录的添加者，`listquotes` 按关键词或添加时间分页列出语录。任何人都可以添加语录。语录可以由添加者本人或管理员删除；删除某关键词下的全部语录、导出为 JSON 以及从 JSON 附件导入，都需要管理员权限。

**语录**标签页可添加、编辑、搜索和删除语录。

## 自动发布

Discord 公告频道中的每条消息都需要手动发布。`addautopublish #channel` 会让机器人自动发布该频道中的每条新消息。每个频道有两种黑名单可跳过消息：`addpublishblacklist @user #channel` 忽略某位用户，`addpublishblacklist #channel word` 忽略包含该词的任何消息（不区分大小写）。`getautopublishes` 会列出所有频道及其黑名单。

**自动发布**标签页可添加频道，并管理**跳过这些用户的消息**和**跳过包含这些词语的消息**列表。

## 直播身份组

`streamrole <fromRole> <addRole>` 会在 **fromRole** 身份组的成员开始直播时授予其 **addRole**，停止直播后收回。`streamrolekeyword <keyword>` 将其限制为标题包含该关键词的直播；不带关键词运行则清除限制。白名单成员即使标题不匹配关键词，也会在直播时获得身份组，黑名单成员则永远不会获得。不带参数运行 `streamrole` 会关闭此功能。如果机器人失去管理该身份组的权限，或身份组被删除，此功能会自动关闭。

**直播身份组**标签页包含**符合条件的身份组**、**直播时的身份组**、**直播标题关键词**，以及按用户 ID 列出的**白名单**和**黑名单**。

## AI 助手

助手会回复所选频道中的每条消息，并为每位成员保留最近五轮对话作为上下文。在该频道输入 `deletesession` 可清除你自己的对话。

| 设置 | 命令 | 作用 |
| --- | --- | --- |
| 频道 | `aichannel [#channel] [enabled]` | 助手监听的唯一频道 |
| 服务商和模型 | `aimodel <OpenAi\|Groq\|Claude> [model]` | 调用哪个 API 和模型 |
| API 密钥 | `aikey` | 该服务商的个人密钥；由机器人保存，之后不再完整显示 |
| 系统提示词 | `aiprompt <text>` | 模型需要遵循的指令 |
| 网页搜索 | `aiwebsearch <true\|false>` | 允许模型搜索网页（仅 Claude） |
| Webhook | `aiwebhook [name] [avatarUrl]` | 通过 Webhook 发送回复，可自定义名称和头像 |
| 自定义嵌入 | `aicustomembed [template]` | 将回复包装在嵌入中；`%airesponse%` 标记答案的位置 |

`aiconfig` 显示当前配置。**AI 助手**标签页包含**已启用助手**、**频道**、**服务商**、**模型**、**API 密钥**、**系统提示词**、**允许网页搜索**，以及**隐藏“正在搜索网页”提示**。

> [!WARNING]
> 助手使用你的 API 密钥，费用也由你承担。如果未设置密钥，频道中的消息会收到错误回复。

## NSFW 过滤

**NSFW 过滤**标签页列出 NSFW 模块图片搜索中被屏蔽的标签。在**要屏蔽的标签**中输入标签即可添加，点击已有标签即可移除。对应命令是 NSFW 模块中的 `nsfwtagbl [tag]`；不带标签运行则列出当前黑名单。

## 身份组监控

**身份组监控**标签页用于配置服务器管理模块中的身份组监控功能，当你标记为受保护的身份组或权限被分配时，它会做出反应。你可以选择**默认处罚**（仅撤销更改、警告、移除全部身份组、禁言、超时、踢出或封禁），添加需要保护的身份组和权限，并列出可豁免的**受信任的身份组**和**受信任成员**。相关命令（`addblacklistedrole`、`addblacklistedpermission`、`whitelistuser`、`whitelistrole`、`setdefaultpunishment`、`listblacklists`）仅服务器拥有者可用，位于服务器管理模块中。

## 提醒

`remind me <time> <message>` 会在稍后私信你；`remind here <time> <message>` 在当前频道发布提醒；`remind #channel <time> <message>` 则发送到其他频道，且需要「管理消息」权限。时间可写作 `2h30m`、`3 days`、`1w` 或 `in 45 minutes`，最长可设置 60 天后。`remindlist` 会显示你的提醒及序号，`reminddelete <index>` 可删除某条提醒。除非你有权在该频道提及所有人，否则消息中的提及会被屏蔽。

## 消息狙击

消息狙击默认关闭，管理员运行 `snipeset enable` 后才会开启。开启后，机器人会保留已删除和已编辑的消息 30 天。`snipe [#channel] [@user]` 显示最近一条被删除的消息，`editsnipe` 显示最近一条编辑记录；`snipelist` 和 `editsnipelist` 显示最近五条（或你指定的数量），可按频道或用户筛选。

## 定时重复消息

定时重复消息会按计划发布消息。`repeat <message>` 使用五分钟间隔；`repeat <interval> <message>` 可设置 5 秒到 25000 分钟之间的间隔；`repeat <time of day> <message>` 则每天运行一次。每条定时消息都有一个序号，可通过 `repeatlist` 查看。

| 触发模式 | 行为 |
| --- | --- |
| `timeinterval` | 每隔一段间隔发布（默认） |
| `onactivity` | 频道在时间窗口内出现设定数量的消息后发布（`repeatactivity`） |
| `onnoactivity` | 频道在时间窗口内保持安静时发布 |
| `immediate` | 立即发布，然后按间隔继续 |
| `aftermessages` | 出现设定数量的消息后发布 |

其他每条定时消息的开关：`repeatredun` 在该消息已是频道最后一条消息时跳过发布；`repeatschedule <business\|evening\|weekend\|custom>` 限制运行时段；`repeatconversation` 切换对话检测；`repeatpriority` 设置 0 到 100 的优先级；`repeatthreadonly` 和 `repeatthreadautosticky` 针对子区；`repeatforumtags` 按标签限制论坛帖子；`repeatsuppressnotifications` 静默发送；`repeattoggle` 暂停或恢复。

## 消息计数与邀请

`togglemsgcount` 开启消息计数。`usermessages`、`channelmessages`、`servermessages` 和 `topusers` 显示计数，`activitygraph` 绘制最活跃的时段或日期，`minmsglength` 忽略短于指定长度的消息。`resetmessagecounts` 在确认后清除某位用户、某个频道或两者的计数。

邀请追踪会记录每位成员是由谁邀请的。`invites`、`whoinvited`、`invitedusers` 和 `inviteleaderboard` 用于读取数据。`toggleinvitetracking`、`toggleremoveinviteonleave` 和 `setminaccountage <days>` 用于控制此功能；账号年龄未达到最低要求的成员不会被计入。

## 设置

仪表板页面分为以下标签页：**别名**、**语录**、**自动发布**、**直播身份组**、**AI 助手**、**NSFW 过滤**和**身份组监控**。

| 设置 | 默认值 | 控制内容 |
| --- | --- | --- |
| 别名触发词与映射 | 无 | 要改写的词语及其对应的命令 |
| 语录关键词与内容 | 无 | 已保存的语录 |
| 自动发布频道 | 无 | 机器人发布消息的公告频道 |
| 跳过这些用户的消息 / 跳过包含这些词语的消息 | 无 | 按频道设置的发布黑名单 |
| 符合条件的身份组 | 无 | 可获得直播身份组的成员 |
| 直播时的身份组 | 无 | 添加和移除的身份组 |
| 直播标题关键词 | 任意直播 | 只有标题包含此内容的直播才会计入 |
| 已启用助手 | 关闭 | AI 频道是否回复 |
| 服务商、模型、API 密钥、系统提示词 | 无 | AI 配置 |
| 允许网页搜索 | 关闭 | Claude 网页搜索 |
| 隐藏“正在搜索网页”提示 | 开启 | 隐藏模型的网页搜索状态消息 |
| 屏蔽的标签 | 无 | 被过滤的 NSFW 搜索标签 |
| 默认处罚 | 使用默认值 | 身份组监控的处理方式 |

消息狙击、消息计数、邀请追踪、定时重复消息、提醒和链接预览没有仪表板设置项。

## 设置步骤

1. 在仪表板中打开**实用工具**。
2. 在**别名**中添加触发词，例如将 `yt` 映射为 `play youtube`。在 Discord 中测试。
3. 在**自动发布**中添加你的公告频道。将机器人或 Webhook 用户加入跳过列表。
4. 在**直播身份组**中选择符合条件的身份组和要添加的身份组，并可选填标题关键词。确认机器人的身份组位于其添加的身份组之上。
5. 在**AI 助手**中选择频道、服务商和模型，粘贴你的密钥，编写系统提示词并启用。
6. 如需消息狙击，请在 Discord 中运行 `snipeset enable`；如需消息统计，请运行 `togglemsgcount`。

## 命令

请使用服务器的前缀运行以下命令（默认为 `.`，除非你修改过）。

| 命令 | 别名 | 所需权限 | 用途 |
| --- | --- | --- | --- |
| `alias <trigger> [mapping]` | `cmdmap` | 管理员 | 添加别名；不带映射则删除 |
| `aliaslist` | `cmdmaplist`, `aliases` | 无 | 列出别名 |
| `aliasesclear` | `aliasclear` | 管理员 | 删除全部别名 |
| `quoteadd <keyword> <text>` | `.` | 无 | 添加语录 |
| `quoteprint <keyword>` | `..` | 无 | 随机显示某关键词的语录 |
| `quoteshow <id>` | | 无 | 按 ID 显示语录 |
| `quotesearch <keyword> <text>` | `qsearch` | 无 | 按关键词和内容查找语录 |
| `quoteid <id>` | `qid` | 无 | 显示语录的添加者 |
| `listquotes [page] [order]` | `liqu` | 无 | 分页浏览语录 |
| `quotedelete <id>` | `qdel` | 无（仅限自己的语录）或管理员 | 删除语录 |
| `delallquotes <keyword>` | `daq`, `delallq` | 管理员 | 删除某关键词下的全部语录 |
| `quoteexport` | `qexport` | 管理员 | 将语录导出为 JSON |
| `quoteimport` | `qimport` | 管理员 | 从附加的 JSON 文件导入语录 |
| `addautopublish <#channel>` | `addautopub`, `aap` | 管理员 | 自动发布新闻频道 |
| `removeautopublish <#channel>` | `removeautopub` | 管理员 | 停止自动发布 |
| `addpublishblacklist <@user> <#channel>` or `<#channel> <word>` | `addpubbl` | 管理员 | 跳过某位用户或某个词语 |
| `removepublishblacklist <@user> <#channel>` or `<#channel> <word>` | `removepubbl` | 管理员 | 移除跳过规则 |
| `getautopublishes` | `getaps` | 管理员 | 列出自动发布频道 |
| `streamrole [fromRole] [addRole]` | | 管理身份组 | 设置直播身份组；不带身份组则关闭 |
| `streamrolekeyword [keyword]` | `srkw` | 管理身份组 | 要求直播标题包含关键词 |
| `streamroleblacklist <add\|remove> <@user>` | `srbl` | 管理身份组 | 永远不授予该成员此身份组 |
| `streamrolewhitelist <add\|remove> <@user>` | `srwl` | 管理身份组 | 该成员直播时始终授予此身份组 |
| `aichannel [#channel] [enabled]` | `aic` | 管理服务器 | 设置 AI 频道 |
| `aimodel <provider> [model]` | `aim` | 管理服务器 | 设置服务商和模型 |
| `aikey` | `ak` | 管理员 | 设置 API 密钥 |
| `aiprompt <text>` | `aip` | 管理服务器 | 设置系统提示词 |
| `aiwebsearch <true\|false>` | `aws` | 管理服务器 | Claude 网页搜索 |
| `aiwebhook [name] [avatar]` | `aiw` | 管理员 | 通过 Webhook 回复；不带名称则关闭 |
| `aicustomembed [template]` | `aice` | 管理员 | 设置回复所用的嵌入模板 |
| `aiconfig` | `ac` | 无 | 显示 AI 设置 |
| `remind <me\|here> <time> <message>` | | 无 | 设置提醒 |
| `remind <#channel> <time> <message>` | | 管理消息 | 在其他频道设置提醒 |
| `remindlist` | `remindl`, `remindlst` | 无 | 查看你的提醒 |
| `reminddelete <index>` | `remindrm`, `reminddel` | 无 | 删除提醒 |
| `snipeset <enable\|disable>` | `setsnipe` | 管理员 | 开启或关闭消息狙击 |
| `snipe [#channel] [@user]` | | 无 | 最近一条被删除的消息 |
| `editsnipe [#channel] [@user]` | | 无 | 最近一条被编辑的消息 |
| `snipelist [#channel] [@user] [amount]` | `slist` | 无 | 最近被删除的消息 |
| `editsnipelist [#channel] [@user] [amount]` | `esnipelist` | 无 | 最近被编辑的消息 |
| `repeat [time] [interval] <message>` | | 管理消息 | 创建定时消息 |
| `repeatlist` | `replst`, `replist`, `repli` | 管理消息 | 列出定时消息 |
| `repeatremove <index>` | `reprm` | 管理消息 | 删除定时消息 |
| `repeatinvoke <index>` | `repinv` | 管理消息 | 立即发布 |
| `repeatmessage <index> <message>` | `repmsg` | 管理消息 | 修改内容 |
| `repeatchannel <index> [#channel]` | `repchan` | 管理消息 | 移动到其他频道 |
| `repeatredun <index>` | `repred` | 管理消息 | 切换重复检查 |
| `repeattriggermode <index> <mode>` | `reptriggermode`, `repmode` | 管理消息 | 设置上表中的触发模式 |
| `repeatactivity <index> <messages> <window>` | `repactivity`, `repact` | 管理消息 | 设置活跃度阈值 |
| `repeatpriority <index> <0-100>` | `reppriority`, `repprio` | 管理消息 | 设置优先级 |
| `repeatschedule <index> <preset>` | `repschedule`, `repsched` | 管理消息 | 设置每日时段计划 |
| `repeatconversation <index>` | `repconversation`, `repconv` | 管理消息 | 切换对话检测 |
| `repeattoggle <index>` | `reptoggle`, `reptog` | 管理消息 | 暂停或恢复 |
| `repeatthreadautosticky <index>` | `repthreadauto`, `repthreads` | 管理消息 | 在新子区中置顶 |
| `repeatthreadonly <index>` | `repthreadonly`, `reptonly` | 管理消息 | 仅在子区中发布 |
| `repeatsuppressnotifications <index>` | `repsuppressnotif`, `repsilent`, `repsuppress` | 管理消息 | 静默发送 |
| `repeatforumtags <index> <action> [tagType] [tags]` | `repforumtags`, `repftags` | 管理消息 | 论坛标签规则 |
| `togglemsgcount` | `togglemessagecount` | 管理员 | 开启或关闭消息计数 |
| `minmsglength [length]` | `mmlength`, `minmlength` | 管理服务器 | 忽略短消息 |
| `usermessages [@user]` | `usermsg`, `umsg` | 无 | 成员的消息统计 |
| `channelmessages [#channel]` | `channelmsg`, `cmsg` | 无 | 频道的消息统计 |
| `servermessages` | `servermsg`, `smsg`, `guildmessages`, `guildmsg`, `gmsg` | 无 | 全服务器统计 |
| `topusers` | `topu` | 无 | 消息数前十名 |
| `activitygraph [days\|hours]` | `actgraph` | 无 | 最活跃时段图表 |
| `resetmessagecounts [@user] [#channel]` | `rmc`, `resetmsgcounts`, `resetmessages`, `resetcounts` | 管理消息 | 重置计数 |
| `invites [@user]` | | 无 | 邀请数量 |
| `whoinvited [@user]` | `invitedby` | 无 | 查看邀请某成员的人 |
| `invitedusers [@user]` | `userinvites` | 无 | 某人邀请的成员 |
| `inviteleaderboard` | `inviteslb` | 无 | 邀请排行榜 |
| `invitesettings` | `inviteconfig` | 管理服务器 | 显示邀请设置 |
| `toggleinvitetracking` | | 管理服务器 | 开启或关闭追踪 |
| `toggleremoveinviteonleave` | `triol` | 管理服务器 | 被邀请者离开时取消计数 |
| `setminaccountage <days>` | `inviteminage` | 管理服务器 | 忽略新账号 |
| `joinstats` | `jstats` | 测试版标记（`dragon`） | 加入图表 |
| `leavestats` | `lstats` | 测试版标记（`dragon`） | 离开图表 |
| `joinstatscolor [r g b]` | `jstatscolor` | 测试版标记（`dragon`） | 加入图表颜色；不带数值则为金色 |
| `leavestatscolor [r g b]` | `lstatscolor` | 测试版标记（`dragon`） | 离开图表颜色；不带数值则为金色 |
| `userinfo [@user]` | `uinfo` | 无 | 成员详情 |
| `serverinfo [name]` | `sinfo` | 无 | 服务器详情 |
| `channelinfo [#channel]` | `cinfo` | 无 | 文字频道详情 |
| `vinfo [channel]` | `voiceinfo` | 无 | 语音频道详情 |
| `rinfo <role>` | `roleinfo` | 无 | 身份组详情 |
| `fetch <id>` | | 无 | 通过 ID 查询任意用户 |
| `avatar [@user]` | `av` | 无 | 头像，附带服务器头像按钮 |
| `banner [@user]` | `userbanner` | 无 | 用户横幅 |
| `userid [@user]` | `uid` | 无 | 用户 ID |
| `roleid <role>` | `rid` | 无 | 身份组 ID |
| `channelid` | `cid` | 无 | 频道 ID |
| `serverid` | `sid` | 无 | 服务器 ID |
| `roles [@user]` | | 无 | 服务器身份组，或某成员的身份组 |
| `inrole <role>` | | 无 | 拥有某身份组的成员 |
| `inroles <role> <role>` | | 无 | 同时拥有两个身份组的成员 |
| `rolepermlist [and\|or] <permissions...>` | `roleperms` | 无 | 拥有这些权限的身份组 |
| `channeltopic [#channel]` | `ct` | 无 | 频道主题 |
| `whosplaying <game>` | `whpl` | 无 | 正在玩某游戏的成员 |
| `emotelist [type]` | | 无 | 服务器表情 |
| `showemojis <emojis>` | `se` | 无 | 放大表情 |
| `say [#channel] <text or embed JSON>` | | 管理消息 | 以机器人身份发言 |
| `getjson <messageId> [#channel]` | | 管理消息 | 获取消息的嵌入 JSON |
| `embedsave <name> <json>` | `esave` | 无 | 保存个人嵌入模板 |
| `guildembedsave <name> <json>` | `gesave`, `gembedsave` | 管理消息 | 保存服务器嵌入模板 |
| `embedlist` / `guildembedlist` | `elist` / `gelist`, `gembedlist` | 无 | 列出模板 |
| `embeddelete <name>` / `guildembeddelete <name>` | `edel`, `edelete` / `gedel`, `gembeddelete` | 无 / 管理消息 | 删除模板 |
| `embedpreview <name>` | `epreview`, `eprev` | 无 | 预览模板 |
| `debugembed <text>` | `embeddebug` | 管理员 | 测试嵌入解析 |
| `savechat <time> [#channel]` | | 管理消息 | 保存聊天记录并获取链接 |
| `calculate <expression>` | `calc` | 无 | 计算数学表达式 |
| `calcops` | | 无 | 可用的数学运算 |
| `plot <function> [start] [end]` | `graphfunction` | 无 | 绘制函数图像 |
| `sym <expression>` | `symbolicmath` | 无 | 符号数学 |
| `convertunits <from> <to> <value>` | `unitconvert`, `units` | 无 | 单位换算 |
| `convertlist` | | 无 | 支持的单位 |
| `convert <format>` | | 无 | 转换附加的媒体文件 |
| `roll <dice>` | | 无 | 掷骰子，支持 DnD 记法 |
| `owoify <text>` | `owo` | 无 | 将文字转换为 OwO 风格 |
| `vcheck [url]` | `viruscheck` | 无 | 使用 VirusTotal 扫描链接 |
| `traceroute <host>` | `tracert`, `trcrt` | 无 | 追踪到主机的路由 |
| `pingip <ip> [count]` | | 无 | Ping 某个地址，最多 10 次 |
| `previewlinks <yes\|no>` | `plinks` | 管理员 | 切换链接预览 |
| `verboseerror [true\|false]` | `ve` | 管理消息 | 切换详细的命令错误信息 |
| `ping` | | 无 | 机器人延迟 |
| `stats` | | 无 | 机器人统计 |
| `invite` | | 无 | 机器人邀请与支持链接 |
| `vote` | | 无 | 投票链接 |

## 注意事项

- 别名只改写文本；被映射的命令仍会执行其自身的权限检查。
- 自动发布仅适用于 Discord 公告（新闻）频道。
- 直播身份组需要机器人的身份组位于其添加的身份组之上。如果无法管理该身份组，此功能会自动关闭，而不是在每次直播时静默失败。
- 消息狙击默认关闭，超过 30 天的记录会被丢弃。
- 超过 60 天的提醒会被拒绝。
- AI 助手只在一个已设置的频道中回复，并忽略机器人消息。它的记忆是每位成员最近五条消息，因此长对话会丢失早期上下文。
- 必须先开启消息计数，才会产生统计数据；不会追溯计数。
- `joinstats` 和 `leavestats` 每十秒只能运行一次。
