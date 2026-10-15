---
title: 帮助与命令
slug: help
summary: 如何在 Discord 中查找并了解机器人的命令：分类帮助菜单、模块概览、单个命令的帮助页面、命令搜索，以及机器人加入服务器时链接到的仪表板设置向导。
icon: fa-life-ring
category: General
module: Help
tags: [help, commands, modules, search command, slash commands, prefix, setup wizard, invite, guide, source, donate, vote, 帮助, 命令, 模块, 搜索命令, 斜杠命令, 前缀, 设置向导, 邀请, 指南, 源代码, 捐赠, 投票]
related: [permissions, administration, userprofile]
---

## 功能简介

帮助模块让成员发现机器人能做什么。`help`（或 `cmds`）会打开一个菜单，列出各个命令分类，并为每个分类显示模块数量和命令数量，同时提供一个下拉菜单用于打开某个分类。选择分类后会显示其中的模块；选择模块则显示该模块的命令，每页十条，附带简短描述；如果模块非常庞大，则会先显示按章节划分的概览。

`help <command>` 会显示单个命令的信息：名称和第一个别名、功能说明、你和机器人各自需要的 Discord 权限、冷却时间（如有）、对应的斜杠命令、每个参数、其他用法形式、使用示例，以及文档链接。**运行** 按钮允许你直接从帮助页面运行该命令；若命令需要参数，则会先打开一个表单供你填写。

`searchcommand <term>` 会查找名称或描述中包含该关键词的命令。仅提及机器人而不附带文字时，机器人会回复当前前缀，并提示你使用 `cmds`。

每个命令都有文本版本（使用服务器前缀调用），大多数情况下还有斜杠版本。帮助菜单和命令页面在两种方式下完全相同；`/help`、`/search` 和 `/invite` 是斜杠形式的入口。

## 适用场景

- 新成员输入 `.help`，需要一个能快速了解情况的入口。
- 工作人员想在授予权限前，确切知道某个命令需要哪项权限。
- 有人只记得命令名的一半，想要搜索。
- 你刚邀请了机器人，想要引导式设置，而不是逐一阅读每个模块的文档。

## 帮助菜单

不带参数的 `help`、`commands` 或 `modules` 会打开顶层菜单。嵌入消息的描述说明了两种使用方式：从下拉菜单中选择分类，或使用 `h commandname` 查看单个命令。它还包含文档、支持服务器、邀请和捐赠页面的链接。

| 分类 | 包含 |
| --- | --- |
| Moderation & Admin | Administration、Moderation、Permissions、Server Management、Role States、Status Roles、Counting Moderation |
| Server Setup | MultiGreets、Role Greets、Starboard、Stat Channels、Suggestions、Tickets、Confessions、Channel Access、Custom Voice、Chat Triggers、Polls、Giveaways |
| Fun & Games | Games、Counting、NSFW、Searches、Minecraft、Switch |
| Economy & Levels | Currency、XP、Reputation、Vote、Patreon |
| Music | Music |
| Utility | Utility、Help、AFK、Todo、User Profile、Birthday、Highlights、Copr Monitoring |
| Bot Owner | 仅限机器人所有者的模块 |
| Other | 未归入以上分类的其他内容 |

**Toggle descriptions** 按钮可在紧凑列表和较长的布局之间切换。后者会在分类下列出每个模块，并以对勾或叉号显示该模块在当前频道中是否对你启用。地球图标加叉号表示机器人所有者已在所有位置禁用该模块。

### 模块页面

`commands <module>` 会直接跳转到某个模块。模块名可以是完整名称，也可以是唯一的前缀，因此 `cmds mod` 会打开 Moderation，而 `cmds s` 则会提示有多个模块匹配。在模块名之后添加一个词即可筛选：`cmds utility remind` 只列出 Utility 中名称或描述包含 "remind" 的命令。

包含超过 30 个命令且至少有三个章节的模块，会先显示概览：模块描述、每个章节一个字段（显示命令数量）、用于打开章节的下拉菜单、**All commands** 按钮、打开表单的 **搜索** 按钮，以及 **返回**。较小的模块则直接显示分页列表。页面每页十条命令，按章节分组，并提供首页、上一页、跳转、下一页、末页、返回和关闭按钮。分页器会保持有效一小时。

## 命令页面

`help <command>` 会匹配精确的名称或任何别名。嵌入消息包含：

- 带前缀和第一个别名的命令名称，以及其描述。
- **User Permissions**：你需要的权限。当管理模块中的 Discord 权限覆盖取代了内置要求时，原始要求会显示为删除线，覆盖内容则列在其后。
- **Bot Permissions**：机器人需要的权限。
- **Documentation**：指向文档网站上该命令页面的链接。
- **冷却时间**：仅在命令有冷却时显示。
- **Slash Command**：斜杠版本的可点击提及（如存在）。
- **Parameters**、**Overloads** 和 **用量**：来自命令文档，列出每个参数、是否可选以及默认值。
- 页脚显示模块、子模块和方法名，报告 bug 时很有用。

**运行** 按钮会像你亲自输入一样运行该命令。如果命令需要参数，会先弹出表单让你填写。管理员还会看到 **权限** 按钮，点击后会打开该命令的命令权限快捷菜单，详见命令权限文章。

## 斜杠命令与文本命令

文本命令使用服务器前缀（默认为 `.`）以及帮助菜单中的准确名称。斜杠命令则是分组的，因此像 `setprivacy` 这样的文本命令会显示为 `/setprivacy`，而权限相关命令则位于 `/permissions servercommand` 之下。命令页面会显示斜杠提及，方便你直接点击。两种形式都遵循相同的权限规则。

## 机器人加入服务器时

当机器人被添加到服务器时，它会从审核日志中找到邀请者（需要查看审核日志权限），并私信对方。该消息包含一个**设置 Mewdeko** 按钮，链接到该服务器的仪表板向导；另有三步提示 `cmds`、`cmds mod` 和 `h purge`，以及支持服务器链接。如果无法确定邀请者，或对方关闭了私信，则不会发送任何消息；机器人不会在频道中发布公告。

## 设置向导

向导位于仪表板的 `/wizard?guild=<id>` 路径。欢迎私信中的链接会打开快速设置版本；仪表板本身则可提供首次设置版本，该版本会在开始时增加权限检查。

| 步骤 | 作用 |
| --- | --- |
| Welcome | 说明即将进行的操作 |
| Permissions | 仅首次设置：检查机器人是否拥有所需权限 |
| Server Basics | 命令前缀、机器人语言和服务器时区 |
| Select Features | 选择要配置的功能；功能会标记为完整设置或快速启用 |
| 每个完整设置功能一个步骤 | 针对该功能的引导式配置 |
| Quick Setup | 以默认值批量启用其余功能 |
| Complete | 摘要，包括任何保存失败的项目 |

进度按服务器保存，因此离开后再返回可以继续。可以将某个服务器标记为已跳过，使向导不再自动出现。**我的设置**页面提供引导式设置偏好开关，以及重置服务器向导状态的选项。

## 设置

帮助模块本身无需配置。命令前缀通过管理模块设置，并显示在每个帮助嵌入消息中。

| 设置 | 默认值 | 控制内容 |
| --- | --- | --- |
| 命令前缀 | `.` | 帮助文本中显示的前缀，以及 Run 按钮使用的前缀 |
| 详细权限 | 关闭 | 被阻止的命令是否会说明是哪条权限规则阻止了它（参见命令权限） |

## 设置步骤

1. 运行 `help`，并从下拉菜单中打开一个分类，了解模块是如何分组的。
2. 运行 `cmds mod` 查看 Moderation 模块，然后运行 `h purge` 查看单个命令的完整信息。
3. 在无害的命令（例如 `h ping`）上试用 **运行** 按钮。
4. 运行 `searchcommand role`，了解搜索如何缩小范围。
5. 如果你刚邀请了机器人，请点击欢迎私信中的**设置 Mewdeko**链接，或在仪表板中打开 `/wizard?guild=<your server id>`。

## 命令

以下命令需使用服务器前缀运行（默认为 `.`，除非你已更改）。

| 命令 | 别名 | 所需权限 | 用途 |
| --- | --- | --- | --- |
| `help [command]` | `h` | 无 | 帮助菜单，或单个命令的帮助 |
| `commands [module] [term]` | `cmds` | 无 | 模块列表、单个模块的命令，或筛选后的列表 |
| `modules` | `mdls` | 无 | 与 `help` 相同的顶层菜单 |
| `searchcommand <term>` | | 无 | 搜索命令名称和描述，最多显示 20 条结果 |
| `guide` | `readme` | 无 | 入门指南链接 |
| `source` | `github`、`repo`、`gitlab`、`bitbucket` | 无 | 源代码链接 |
| `donate` | | 无 | 如何支持机器人 |
| `vote` | | 无 | 为机器人投票的链接 |
| `exportcommandsjson` | `exportcommands`、`excj` | 无 | 将所有命令导出为 JSON 文件（每分钟一次） |

仅限斜杠：`/search <command>`（带自动补全）和 `/invite`。`/help`、`/commands <module> [filter]`、`/donate`、`/guide`、`/source` 和 `/vote` 与文本命令功能相同。

## 提示与注意事项

- 如果 `help` 在某个模块旁边对你显示叉号，说明权限规则或机器人所有者已在该频道中禁用它。请让工作人员使用 `listperms` 检查。
- 帮助页面反映命令的实际前置条件，因此页面中列出的权限是权威的，即使文档网站有所滞后。
- Run 按钮使用的是你自己的权限，而非机器人的权限。它只是一项便利功能，并不能绕过权限限制。
- 按前缀匹配模块意味着较短的前缀往往会产生歧义，建议至少使用三到四个字母。
- 机器人只会在加入时私信邀请者。如果你是通过共享链接邀请的却没有收到消息，请改为从仪表板打开向导。
