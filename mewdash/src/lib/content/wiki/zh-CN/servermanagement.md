---
title: 服务器管理
slug: servermanagement
summary: 用于调整服务器结构的批量工具：创建和删除频道与身份组，一次性为数百名成员分配身份组，锁定服务器，同步频道权限覆盖，偷取表情，并监控危险的身份组变更。
icon: fa-server
category: Actions
module: ServerManagement
tags: [server management, roles, mass role, channels, lockdown, slowmode, lock channel, nuke, emotes, steal emotes, webhook, permcontrol, role monitor, role jobs, server icon, server banner, 服务器管理, 身份组, 批量身份组, 频道, 锁定, 慢速模式, 锁定频道, 清空频道, 表情, 偷取表情, 权限控制, 身份组监控, 身份组任务, 服务器图标, 服务器横幅]
related: [administration, permissions, moderation]
---

## 功能介绍

服务器管理集合了用于修改服务器结构（而非服务器成员）的命令。管理人员可以用一行命令创建一个分类及其所有频道，也可以重命名或删除频道、设置话题、切换 NSFW、设置慢速模式、锁定频道，或删除后重建频道以清空历史消息。

身份组是这里的重点。单次命令可以创建、重命名、修改颜色、单独显示或删除身份组，也可以为单个成员分配身份组并设置可选的计时器。批量命令则可以为所有成员、所有真人、所有机器人、另一身份组中的所有成员，或在某个时间点之前或之后加入服务器的成员添加或移除身份组。这些命令会作为后台任务运行，你可以列出并停止它们。

本模块还涵盖服务器自身的外观（图标、横幅、邀请背景、名称）、表情管理（包括从其他服务器偷取表情）、按频道设置的权限覆盖、语音频道移动、三种锁定模式，以及一个会还原并惩罚危险身份组变更的身份组监控器。

这些内容都不在仪表板中配置，全部通过命令执行。

## 使用场景

- 新建服务器时，想在一个分类下快速创建十个频道，而不必在 Discord 界面中逐个点击。
- 开启身份组准入后，需要为两千名现有成员分配“Member”身份组。
- 遇到突袭时锁定服务器，使任何人都无法发言，之后再完整恢复原有权限。
- 一条命令从朋友的服务器复制表情。
- 防止管理人员通过给身份组添加黑名单权限来给自己授予管理员权限。

## 频道

### 创建与编辑

`creatxtchanl <name>` 和 `creatvoichanl <name>` 用于创建单个文字或语音频道。`deltxtchanl <#channel>` 和 `delvoichanl <channel>` 用于删除单个频道。

`cc...` 系列命令可以一次创建多个频道：

| 命令 | 创建内容 |
| --- | --- |
| `ccatc <category name> <channel names...>` | 一个新分类，以及其中的文字频道 |
| `ccavc <category name> <channel names...>` | 一个新分类，以及其中的语音频道 |
| `cctc <existing category> <channel names...>` | 在已有分类中创建文字频道 |
| `ccvc <existing category> <channel names...>` | 在已有分类中创建语音频道 |

`renamechannel <channel> <name>` 可重命名任意频道，`setchanlname <name>` 重命名你当前所在的频道，`settopic [text]` 设置或清除当前频道的话题，`nsfwtoggle` 切换当前频道的 NSFW 标记。

### 慢速模式、锁定与清空

`slowmode` 单独使用时，会在当前频道的一分钟和关闭之间切换。`slowmode <time>`（例如 `slowmode 30s`）则设置指定的间隔，两种形式都可以带频道参数。间隔达到 21600 秒（六小时）或以上会被拒绝。

`lock [#channel]` 会为该频道的 `@everyone` 身份组添加“发送消息”拒绝权限；`unlock [#channel]` 则将其移除。原有的覆盖权限位会保留。

`nuke [#channel]` 会请求确认，然后删除该频道，并创建一个同名、同位置、同话题、同权限覆盖、同 NSFW 标记、同分类、同慢速模式的新频道。置顶消息、Webhook 和消息历史将永久丢失。

### 权限覆盖

`permcontrol <channel> <allow|deny|inherit> <role or user> <permissions...>` 用于编辑某个目标在频道上的覆盖权限，且不会改动其他权限位。`permview [@user or role]` 列出你、某位成员或某个身份组当前拥有的权限。

`syncroletoall <role>` 会把该身份组在当前频道的覆盖权限复制到所有文字频道和分类。`syncroletoallchannels` 和 `syncroletoallcategories` 则分别只处理频道或只处理分类。该身份组必须已在你执行命令的频道中设置过覆盖权限。

### Webhook

`createwebhook <#channel> <name> [avatar url]` 用于创建 Webhook。如果未提供头像 URL，则会使用附带的图片作为头像。机器人会在频道中确认，并通过私信将 Webhook 的 URL 和令牌发送给你。

## 语音

- `moveto <voice channel>` 将你移动到指定语音频道。
- `moveuserto @user <voice channel>` 将其他成员移动到指定语音频道。
- `grab @user` 将某位成员拉到你所在的语音频道。

## 锁定

`lockdown [type] [action] [override]` 和 `liftlockdown [type]` 需要管理员权限。

| 类型 | 作用 |
| --- | --- |
| `Joins` | 锁定期间加入的任何人都会被踢出或封禁。默认操作为 `Ban`，唯一的另一选项为 `Kick`。 |
| `Readonly` | 机器人会保存每个频道当前的 `@everyone` 覆盖权限，然后在文字频道中拒绝“发送消息”、创建话题和回复话题的权限，并在语音频道中拒绝“连接”和“发言”的权限。论坛频道会保留“发送消息”权限，以便现有话题仍可阅读。 |
| `Full` | 同时应用以上两种锁定。 |

在应用只读锁定之前，机器人会检查它是否能编辑每个频道。如果有频道缺少权限，它会列出这些频道并停止操作，除非你将第三个参数设为 `true` 以继续执行。解除锁定时会恢复之前保存的覆盖权限。加入锁定在机器人重启后依然有效。

`unlockdown` 是一个独立的旧工具：它会为 `@everyone` 身份组本身重新开启“发送消息”权限，适用于通过编辑该身份组来进行锁定的服务器。

> [!WARNING]
> 不带参数的 `lockdown` 是只读锁定，而 `lockdown joins` 默认会封禁加入的成员。如需踢出，请传入 `kick`。

## 身份组

### 单个身份组命令

| 命令 | 作用 |
| --- | --- |
| `createrole [name]` | 创建一个不可提及的身份组 |
| `deleterole <role>` | 删除一个低于你最高身份组的身份组 |
| `renamerole <role> <name>` | 重命名身份组 |
| `rolecolor <role> [colour]` | 显示或设置身份组颜色 |
| `rolehoist <role>` | 切换该身份组是否在成员列表中单独显示 |
| `setrole <role> @user [time]` | 分配身份组，可选在 `time`（例如 `2h`）之后自动移除 |
| `removerole <role> @user` | 移除身份组 |
| `removeallroles @user` | 移除成员所有非托管身份组 |

`setrole` 和 `removerole` 的身份组参数与成员参数可以任意顺序给出。

### 同时处理多个身份组或成员

- `createroles <names...>` 确认列表后，为每个词创建一个身份组。
- `deleteroles <roles...>` 确认后删除多个身份组；受管理的身份组会被跳过。
- `setroles @user <roles...>` 为一位成员分配多个身份组；`setroles @user <time> <roles...>` 则使这些身份组带有时限。
- `removeroles @user <roles...>` 移除一位成员的多个身份组。
- `adduserstorole <role> @user @user...` 和 `removeusersfromrole <role> @user @user...` 可作用于多位成员。

### 批量身份组任务

这些命令会遍历整个成员列表，并作为后台任务运行。由于 Discord 的速率限制，机器人会在每位成员之间短暂暂停，并且每个服务器同时只允许五个任务。每个任务都会报告预计耗时。

| 命令 | 作用对象 |
| --- | --- |
| `addtoall <role>` | 所有未拥有该身份组的成员 |
| `addtoallusers <role>` | 仅限真人 |
| `addtoallbots <role>` | 仅限机器人 |
| `addtousersover <time> <role>` | 加入时间至少为 `time` 之前的成员，例如 `30d` |
| `addtousersunder <time> <role>` | 加入时间晚于 `time` 的成员 |
| `addroletorole <role> <role2>` | 为 `role2` 中的所有成员分配 `role` |
| `addthenremove <role> <role2>` | 为 `role2` 中的所有成员分配 `role`，然后移除 `role2` |
| `removefromall <role>` | 所有拥有该身份组的成员 |
| `removefromallusers <role>` | 仅限真人 |
| `removefromallbots <role>` | 仅限机器人 |
| `removefromrole <role> <role2>` | 从 `role2` 中的所有成员身上移除 `role` |

`rolejobs` 会列出正在运行的任务，包括类型、发起人、进度和身份组。`stopjob <number>` 会取消指定任务，并报告其完成的进度。

### 导出与导入

`exportrolelist` 会发送一个 `rolelist.txt` 文件，其中每个可管理身份组的每条成员关系占一行，格式为 `roleId,userId,roleName`。`importrolelist` 会读取附加到命令上的此类文件并重新分配身份组；传入 `true` 时，若身份组 ID 已不存在，则会按名称创建身份组。`addroletolist <role>` 会读取附加的用户 ID 列表，并为这些用户分配该身份组。

## 服务器外观与表情

`seticon <url>`、`setbanner <url>`、`setsplash <url>` 和 `setservername <name>` 用于修改服务器本身，需要管理员权限。`setguildavatar`、`setguildbanner` 和 `setguildbio` 仅修改机器人在本服务器中的外观，需要管理服务器权限。

表情命令需要你和机器人都拥有管理表情符号权限：

- `addemote <name> [url]` 从 URL 或附加的图片上传表情。
- `removeemote <emote>` 和 `renameemote <emote> <name>` 作用于本服务器的表情。
- `stealemotes <emotes...>` 会将你消息中的每个自定义表情复制到本服务器。`sfr <role> <emotes...>` 与之类似，但会将这些表情限制为某一身份组可用。
- 右键点击消息，并从应用菜单中选择 **Steal Emotes** 或 **Steal Sticker**，即可无需输入命令完成相同操作。

## 身份组监控

身份组监控会查看审计日志。当成员被授予黑名单身份组，或某个身份组获得黑名单权限时，机器人会还原该变更，并惩罚执行者。只有服务器所有者可以进行配置。

- `addblacklistedrole <role> [punishment]` 和 `removeblacklistedrole <role>`。
- `addblacklistedpermission <permission> [punishment]` 和 `removeblacklistedpermission <permission>`，例如 `addblacklistedpermission Administrator Ban`。
- `setdefaultpunishment <punishment>` 用于设置黑名单条目未单独指定惩罚时的默认处理方式。默认值为 `None`。
- `addwhitelisteduser @user`、`addwhitelistedrole <role>` 及其对应的 `remove...` 命令，可使工作人员免受监控。由白名单成员执行或针对白名单成员的变更将被忽略。
- `listblacklists` 会显示以上所有内容。

惩罚值包括 `None`、`Warn`、`Mute`、`ChatMute`、`VoiceMute`、`Timeout`、`Kick`、`Softban`、`Ban`、`RemoveRoles`、`AddRole` 和 `Delete`。如果同时添加多个黑名单权限，则以最严厉的惩罚为准。

## 设置

本模块没有仪表板页面。唯一会被保存的设置属于身份组监控器和锁定状态。

| 设置 | 默认值 | 控制内容 |
| --- | --- | --- |
| 默认惩罚 | None | 黑名单身份组或权限未设置惩罚时应用的处理方式 |
| 黑名单身份组 | 无 | 被授予时会被移除的身份组，每个可附带可选惩罚 |
| 黑名单权限 | 无 | 被添加到身份组时会被还原的权限，每个可附带可选惩罚 |
| 白名单用户与身份组 | 无 | 免受监控 |
| 加入锁定操作 | Ban | 加入锁定期间加入的成员将受到的处理 |

## 设置示例

1. 检查机器人的身份组位于你要它管理的所有身份组之上，并确认它拥有管理身份组和管理频道权限。
2. 搭建布局：`ccatc Community general off-topic memes` 会创建一个分类及三个频道。
3. 一次性创建身份组：`createroles Member Regular Veteran`。
4. 分配基础身份组：`addtoallusers Member`，然后用 `rolejobs` 查看进度。
5. 以服务器所有者身份保护服务器：`addblacklistedpermission Administrator Ban` 和 `addwhitelistedrole Admin`。
6. 紧急情况下记得使用 `lockdown full kick`，并在事后找一个不忙的日子测试 `liftlockdown full`。

## 命令

请使用服务器的前缀执行以下命令（除非你修改过，默认为 `.`）。

| 命令 | 别名 | 所需权限 | 用途 |
| --- | --- | --- | --- |
| `permview [@user or role]` | `pview` | 无 | 列出已允许的权限 |
| `setsplash <url>` | `setserversplash`, `setsplashimage` | 管理员 | 设置邀请背景 |
| `seticon <url>` | `setservericon`, `seticonimage` | 管理员 | 设置服务器图标 |
| `setbanner <url>` | `setserverbanner` | 管理员 | 设置服务器横幅 |
| `setservername <name>` | | 管理员 | 重命名服务器 |
| `setguildavatar [url]` | `sgav`, `setgav` | 管理服务器 | 设置机器人在本服务器中的头像 |
| `setguildbanner [url]` | `sgbanner`, `setgbanner` | 管理服务器 | 设置机器人在本服务器中的横幅 |
| `setguildbio <text>` | `sgbio`, `setgbio` | 管理服务器 | 设置机器人在本服务器中的简介 |
| `addemote <name> [url]` | `emoteadd`, `ae`, `ea` | 管理表情符号 | 上传表情 |
| `removeemote <emote>` | `deleteemote`, `emoteremove`, `emotedelete` | 管理表情符号 | 删除表情 |
| `renameemote <emote> <name>` | `emoterename` | 管理表情符号 | 重命名表情 |
| `stealemotes <emotes...>` | `steal` | 管理表情符号 | 将表情复制到本服务器 |
| `sfr <role> <emotes...>` | | 管理表情符号 | 复制表情，并限制为某一身份组可用 |
| `creatxtchanl <name>` | `ctch` | 管理频道 | 创建文字频道 |
| `creatvoichanl <name>` | `cvch` | 管理频道 | 创建语音频道 |
| `deltxtchanl <#channel>` | `dtch` | 管理频道 | 删除文字频道 |
| `delvoichanl <channel>` | `dvch` | 管理频道 | 删除语音频道 |
| `ccatc <category> <names...>` | | 管理频道 | 创建新分类及其文字频道 |
| `ccavc <category> <names...>` | | 管理频道 | 创建新分类及其语音频道 |
| `cctc <category> <names...>` | | 管理频道 | 在已有分类中创建文字频道 |
| `ccvc <category> <names...>` | | 管理频道 | 在已有分类中创建语音频道 |
| `renamechannel <channel> <name>` | `channelrename` | 管理频道 | 重命名频道 |
| `setchanlname <name>` | `schn` | 管理频道 | 重命名当前频道 |
| `settopic [text]` | `st` | 管理频道 | 设置或清除当前话题 |
| `nsfwtoggle` | `nsfw`, `nsfwtgl` | 管理频道 | 切换 NSFW 标记 |
| `slowmode [time] [#channel]` | | 管理频道 | 切换或设置慢速模式 |
| `lock [#channel]` | `channellock`, `lockchannel` | 管理消息 | 拒绝所有人的发送消息权限 |
| `unlock [#channel]` | `channelunlock`, `unlockchannel` | 管理消息 | 撤销 `lock` |
| `nuke [#channel]` | `channelnuke`, `nukechannel` | 管理频道 | 删除并重建频道 |
| `permcontrol <channel> <allow|deny|inherit> <role or user> <perms...>` | `permc` | 管理频道 | 编辑频道的权限覆盖 |
| `syncroletoall <role>` | `synctoall` | 管理频道 | 将权限覆盖复制到所有频道和分类 |
| `syncroletoallchannels <role>` | `srtch`, `srtach` | 管理频道 | 将权限覆盖复制到文字频道 |
| `syncroletoallcategories <role>` | `srtc`, `srtac` | 管理频道 | 将权限覆盖复制到分类 |
| `createwebhook <#channel> <name> [avatar]` | `cwh` | 管理员 | 创建 Webhook |
| `moveto <voice channel>` | | 无 | 将你自己移动到指定语音频道 |
| `moveuserto @user <voice channel>` | `moveuto` | 管理频道 | 移动某位成员 |
| `grab @user` | `getoverhere` | 无 | 将某位成员拉到你所在的语音频道 |
| `lockdown [joins|readonly|full] [kick|ban] [true]` | `lockdownserver` | 管理员 | 开始锁定 |
| `liftlockdown [type]` | `unlockserver` | 管理员 | 结束锁定 |
| `unlockdown` | `endlockdown` | 管理频道 | 为 `@everyone` 重新开启发送消息权限 |
| `createrole [name]` | `cr` | 管理身份组 | 创建身份组 |
| `deleterole <role>` | `dr` | 管理身份组 | 删除身份组 |
| `renamerole <role> <name>` | `renr` | 管理身份组 | 重命名身份组 |
| `rolecolor <role> [colour]` | `roleclr` | 设置时需管理身份组 | 显示或设置身份组颜色 |
| `rolehoist <role>` | `rh` | 管理身份组 | 切换单独显示 |
| `setrole <role> @user [time]` | `sr`, `giverole` | 管理身份组 | 分配身份组，可选带时限 |
| `removerole <role> @user` | `rr` | 管理身份组 | 移除身份组 |
| `removeallroles @user` | `rar` | 管理身份组 | 移除所有身份组 |
| `createroles <names...>` | `croles`, `crs` | 管理身份组 | 创建多个身份组 |
| `deleteroles <roles...>` | `drs` | 管理身份组 | 删除多个身份组 |
| `setroles @user [time] <roles...>` | `srs` | 管理身份组 | 分配多个身份组 |
| `removeroles @user <roles...>` | `rrs` | 管理身份组 | 移除多个身份组 |
| `adduserstorole <role> @users...` | `autr` | 管理身份组 | 为多位成员分配一个身份组 |
| `removeusersfromrole <role> @users...` | `rufr` | 管理身份组 | 从多位成员身上移除一个身份组 |
| `addtoall <role>` | `ata` | 管理身份组 | 为每位成员分配身份组 |
| `addtoallusers <role>` | `atau` | 管理身份组 | 为每位真人分配身份组 |
| `addtoallbots <role>` | `atab` | 管理身份组 | 为每个机器人分配身份组 |
| `addtousersover <time> <role>` | `atuo` | 管理身份组 | 为加入时间至少达到该时长的成员分配身份组 |
| `addtousersunder <time> <role>` | `atuu` | 管理身份组 | 为加入时间晚于该时长的成员分配身份组 |
| `addroletorole <role> <role2>` | `artr` | 管理身份组 | 为另一身份组中的所有成员分配身份组 |
| `addthenremove <role> <role2>` | `atr` | 管理身份组 | 将一个身份组替换为另一个 |
| `removefromall <role>` | `rfa` | 管理身份组 | 从每位成员身上移除 |
| `removefromallusers <role>` | `rfau` | 管理身份组 | 从每位真人身上移除 |
| `removefromallbots <role>` | `rfab` | 管理身份组 | 从每个机器人身上移除 |
| `removefromrole <role> <role2>` | `rfr` | 管理身份组 | 从另一身份组中的所有成员身上移除 |
| `rolejobs` | `rj` | 管理身份组 | 列出正在运行的批量身份组任务 |
| `stopjob <number>` | `sj` | 管理身份组 | 取消任务 |
| `exportrolelist` | `exportroles`, `erl` | 管理身份组 | 下载身份组成员关系 |
| `importrolelist [true]` | `importroles`, `irl` | 管理身份组 | 重新应用已导出的列表 |
| `addroletolist <role>` | `artl` | 管理身份组 | 为附加的用户 ID 列表分配身份组 |
| `setdefaultpunishment <action>` | `sdp`, `defaultpunishment`, `setdefpunishment` | 服务器所有者 | 身份组监控的默认惩罚 |
| `addblacklistedrole <role> [action]` | `abr`, `blacklistrole`, `addbrole` | 服务器所有者 | 监控某个身份组 |
| `removeblacklistedrole <role>` | `rbr`, `unblacklistrole`, `removebrole` | 服务器所有者 | 停止监控某个身份组 |
| `addblacklistedpermission <permission> [action]` | `abp`, `blacklistpermission`, `addbpermission` | 服务器所有者 | 监控某项权限 |
| `removeblacklistedpermission <permission>` | `rbp`, `unblacklistpermission`, `removebpermission` | 服务器所有者 | 停止监控某项权限 |
| `addwhitelisteduser @user` | `awu`, `whitelistuser`, `addwuser` | 服务器所有者 | 豁免某位成员 |
| `removewhitelisteduser @user` | `rwu`, `unwhitelistuser`, `removewuser` | 服务器所有者 | 移除豁免 |
| `addwhitelistedrole <role>` | `awr`, `whitelistrole`, `addwrole` | 服务器所有者 | 豁免某个身份组 |
| `removewhitelistedrole <role>` | `rwr`, `unwhitelistrole`, `removewrole` | 服务器所有者 | 移除豁免 |
| `listblacklists` | `lbl`, `blacklists`, `listbws` | 服务器所有者 | 显示监控列表 |

## 小贴士与注意事项

- 身份组命令会检查两次层级：你的最高身份组和机器人的最高身份组都必须高于目标身份组。服务器所有者在自己一侧会跳过该检查。
- 批量任务大约每位成员需要一秒钟。为五千名成员添加身份组需要一个多小时，并且机器人会拒绝同时运行的第六个任务。
- `syncroletoall` 及其变体要求该身份组已在你执行命令的频道中设置了覆盖权限；被复制的正是这项覆盖权限。
- `nuke` 无法撤销，确认提示是唯一的保护措施。
- 只读锁定会在每个频道上编辑覆盖权限，在大型服务器上会产生大量 API 调用。请使用 `liftlockdown` 解除锁定，而不要手动操作，这样保存的覆盖权限才能被正确恢复。
- 身份组监控依赖审计日志，因此机器人需要“查看审核日志”权限，并且还需要你所选惩罚所对应的权限。
- 偷取表情需要有空闲的表情位；失败的项目会列在 "Errored Emotes" 下。
