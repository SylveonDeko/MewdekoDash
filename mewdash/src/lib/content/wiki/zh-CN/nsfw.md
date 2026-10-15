---
title: NSFW
slug: nsfw
summary: 成人图片命令，仅在标记为 NSFW 的频道中可用，支持按服务器设置的标签黑名单以及可选的定时自动发送。
icon: fa-eye-slash
category: Entertainment
module: Nsfw
tags: [nsfw, hentai, booru, rule34, e621, danbooru, gelbooru, nhentai, reddit, tag blacklist, autohentai, nsfwtoggle, 成人内容, 标签黑名单, 自动发送, 图片站]
related: [servermanagement, permissions, filter]
---

## 功能简介

NSFW 模块会在收到请求时，从图片站和 Reddit 获取成人图片。模块中的每条命令都带有 Discord 的 NSFW 要求：只有设置了 NSFW 标记的频道才能运行，而大多数图片站命令也可以在与机器人的私信中使用。在其他任何频道中，命令都会被静默拒绝。

工作人员可以控制两件事。`nsfwtoggle`（位于管理模块中）用于切换当前频道的 NSFW 标记，这是解锁这些命令的条件。`nsfwtagbl` 维护一份标签列表，这些标签会从本服务器的每次图片站搜索中被移除，因此服务器可以允许使用该模块，同时排除其不希望出现的内容。

成员运行来源命令时可以附带可选标签，并会获得一张图片，附带其分级、来源和前几个标签。"bomb"变体会一次发送四张。版主还可以启动计时器，每隔一定秒数向某个频道发送一张新图片。

## 适用场景

- 成人服务器希望将图片命令限制在已标记的频道中。
- 工作人员希望在不关闭模块的前提下，在全服范围内屏蔽某些标签。
- 专用频道希望定时获得新图片，而无需有人手动输入。

## 频道要求

Discord 的 NSFW 标记是针对每个频道的。在某个频道中运行 `nsfwtoggle` 即可开启或关闭该标记；你和机器人都需要管理频道权限。机器人会回复确认新的状态。同样的标记也可以在 Discord 的频道设置中设置。

如果在非 NSFW 频道中使用命令，什么都不会发生。成员有时会误以为机器人出了故障，因此在规则频道中加一条说明会有所帮助。

## 来源

| 命令 | 来源 | 备注 |
| --- | --- | --- |
| `hentai [tags]` | 合并的图片站，仅限露骨内容 | 五秒冷却 |
| `yandere`、`konachan`、`sankaku`、`e621`、`rule34`、`danbooru`、`gelbooru`、`derpibooru`、`safebooru`、`realbooru` | 指定的图片站 | 每个都可附带可选标签 |
| `hentaibomb [tags]` | Yandere、Danbooru、Konachan 和 Gelbooru | 一次四张图片 |
| `pornbomb [tags]` | Realbooru | 一次四张图片 |
| `redditnsfw <subreddit>` | 该子版块中随机的热门帖子 | 十秒冷却 |
| `boobs`、`butts` | 通过 `redditnsfw` 使用固定子版块 | |
| `pussy`、`anal`、`porn`、`bondage`、`hentaigif` | 分类端点 | 仅限 NSFW 频道，不支持私信 |
| `nhentai <id>` | 按编号指定的图库 | 拒绝标记为 lolicon 或 shotacon 的图库 |
| `nhentaisearch <query> [page] [type] [blacklist]` | 图库搜索 | |

标签之间以空格分隔。在 e621 和 Derpibooru 上，标签 `yuri` 会自动转换为该站点的对应标签。每个服务器同一时间只能运行一个 `hentaibomb` 和一个 `pornbomb`。

## 标签黑名单

不带参数的 `nsfwtagbl` 会列出黑名单中的标签。`nsfwtagbl <tag>` 会添加该标签，如果已在列表中则将其移除。包含黑名单标签的结果会在本服务器中所有图片站命令中被跳过。该命令需要管理消息权限。

## 自动发送

`autohentai <seconds> [tags]`、`autoboobs <seconds>` 和 `autobutts <seconds>` 会在当前频道启动计时器。`autohentai` 和 `autobutts` 的间隔必须至少为 20 秒；`autoboobs` 则不强制最小间隔。使用 `0` 或不指定间隔运行该命令，会停止该频道的计时器。对于 `autohentai`，可以用 `|` 分隔多组备选标签，机器人每次会随机选择一组；若省略标签，则发送随机图片。这些命令需要管理消息权限，且频道必须是 NSFW 频道。机器人重启后计时器不会保留。

## 设置

该模块没有仪表板页面。

| 设置 | 默认值 | 控制内容 |
| --- | --- | --- |
| 频道 NSFW 标记 | 关闭 | 这些命令是否可在某个频道中运行 |
| 标签黑名单 | 空 | 本服务器图片站结果中排除的标签 |
| 自动发送计时器 | 无 | 通过 `auto...` 命令在各频道启动的计时器 |

## 设置步骤

1. 选定频道，并在其中运行 `nsfwtoggle`，或在 Discord 的频道设置中设置该标记。
2. 使用命令权限，将该模块排除在其他所有位置之外，例如先执行 `srvrmdl nsfw disable`，再执行 `chnlmdl nsfw enable #adult`。
3. 使用 `nsfwtagbl <tag>` 添加不希望出现的标签，每次添加一个。
4. 在该频道中使用 `hentai` 或 `rule34 <tag>` 进行测试。
5. 可选地启动 `autohentai 300 <tags>`，之后可使用 `autohentai 0` 将其停止。

## 命令

以下命令需使用服务器前缀运行（默认为 `.`，除非你已更改）。

| 命令 | 别名 | 所需权限 | 用途 |
| --- | --- | --- | --- |
| `nsfwtoggle` | `nsfw`、`nsfwtgl` | 管理频道 | 切换当前频道的 NSFW 标记 |
| `nsfwtagbl [tag]` | `nsfwtbl` | 管理消息 | 列出、添加或移除黑名单标签 |
| `hentai [tags]` | | 无 | 从合并图片站获取一张露骨图片 |
| `hentaibomb [tags]` | | 无 | 从四个图片站获取四张图片 |
| `pornbomb [tags]` | | 无 | 四张 Realbooru 图片 |
| `yandere [tags]` | | 无 | Yande.re |
| `konachan [tags]` | | 无 | Konachan |
| `sankaku [tags]` | | 无 | Sankaku |
| `e621 [tags]` | | 无 | e621 |
| `rule34 [tags]` | `r34` | 无 | Rule34 |
| `danbooru [tags]` | | 无 | Danbooru |
| `gelbooru [tags]` | | 无 | Gelbooru |
| `derpibooru [tags]` | `derpi` | 无 | Derpibooru |
| `safebooru [tags]` | | 无 | Safebooru |
| `realbooru [tags]` | `rb` | 无 | Realbooru |
| `redditnsfw <subreddit>` | `nsfwsubreddit` | 无 | 从某个子版块随机获取一篇帖子 |
| `boobs` | | 无 | Reddit 快捷命令 |
| `butts` | `ass`、`butt` | 无 | Reddit 快捷命令 |
| `pussy` | | 无 | 分类图片 |
| `anal` | | 无 | 分类图片 |
| `porn` | | 无 | 分类图片 |
| `bondage` | | 无 | 分类图片 |
| `hentaigif` | | 无 | 分类动图 |
| `nhentai <id>` | `nh` | 无 | 按编号浏览图库 |
| `nhentaisearch <query> [page] [type] [blacklist]` | `nhsearch`、`nhs` | 无 | 搜索图库 |
| `autohentai [seconds] [tags]` | | 管理消息 | 定时发送；`0` 为停止 |
| `autoboobs [seconds]` | | 管理消息 | 定时发送；`0` 为停止；无最小间隔 |
| `autobutts [seconds]` | | 管理消息 | 定时发送；`0` 为停止 |

## 提示与注意事项

- 年龄限制依靠 Discord 的频道标记加上机器人的标签黑名单实现。机器人不会检查成员年龄或身份组；如需此类限制，请使用命令权限。
- 机器人所有者也可以全局禁用该模块，此时帮助菜单中会显示为已屏蔽。
- 图片站存在速率限制，对于较窄的标签组合有时会没有结果；此时机器人会回复未找到图片。
- 计时器按频道单独设置，且保存在内存中。重启后需要重新启动。
