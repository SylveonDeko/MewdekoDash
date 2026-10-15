---
title: 搜索
slug: searches
summary: 无需离开 Discord 即可查询天气、时间和词典释义，以及动漫、电影、图片、osu! 个人资料、笑话和反应 GIF。
icon: fa-magnifying-glass
category: Entertainment
module: Searches
tags: [search, weather, time, define, urban dictionary, wikipedia, google, image search, anime, manga, movie, osu, pokemon, translate, xkcd, meme, reddit, hug, pat, ship, 搜索, 天气, 时间, 释义, 词典, 维基百科, 图片搜索, 动漫, 漫画, 电影, 翻译, 表情包, 拥抱, 拍拍, 配对]
related: [streams, feeds, twitch, games, utility]
---

## 功能介绍

搜索模块是一组查询命令，可从外部服务获取信息并发送到频道中。成员可以查询某个城市的天气、某地的时间、某个单词的释义、某部动漫或电影、维基百科摘要、随机猫图，或是拥抱、拍打等反应 GIF。大多数结果以嵌入消息的形式返回，结果较多的搜索会分页显示。

此模块没有仪表板页面。几乎所有命令都对所有人开放，只有自动翻译模式需要员工权限。

直播通知和 RSS 订阅同属机器人的这一模块，但有各自的文章。`streamadd`、`feedadd` 等命令的说明请参阅直播提醒和订阅页面。

## 为什么要使用它

- 用 `time` 直接回答“你那边现在几点？”，省去心算。
- 活动前用可交互的 `weather` 卡片查看天气预报。
- 聊到某部动漫、漫画或角色时，随手查询相关信息。
- 让成员用 GIF 发送拥抱、拍拍和击掌。
- 即时翻译一条消息，或为国际化社区开启频道自动翻译。

## 天气与时间

`weather <place>` 会通过 Open-Meteo 对地点进行地理编码，并显示当前天气：温度、体感温度、湿度、风速与阵风、气压、云量、能见度，以及当日最高和最低温度。按钮和下拉菜单可切换到逐小时预报、详细的逐小时天气，以及包含今天和明天最高温、最低温与降水量的每日视图。

`time <place>` 会搜索该地点，并显示当前时间和时区。如果匹配到多个地点，会列出候选项供你选择。

## 词汇与知识

| 命令 | 来源 | 结果 |
| --- | --- | --- |
| `define <word>` | Pearson 词典 | 释义、词性和例句 |
| `urbandict <term>` | Urban Dictionary | 释义，分页显示 |
| `wiki <query>` | 维基百科 | 第一个匹配页面的摘要 |
| `wikia <site> <query>` | 某个 Fandom 维基 | 该维基中的摘要 |
| `google <query>` | Google，失败时回退到 DuckDuckGo | 网页搜索结果 |
| `bible <book> <chapter:verse>` | Bible API | 对应经文 |
| `resolvetonetags <text>` | 内置 | 解释文本中的语气标签，例如 `/j` 或 `/s` |
| `translate <langs> <text>` | 翻译 API | 译文；langs 的格式为 `from>to`，例如 `translate en>fr hello` |
| `translangs` | 翻译 API | 可用的语言列表 |

### 自动翻译

`autotranslate` 用于切换当前频道的自动翻译，需要管理员权限。传入 `del` 可在翻译后删除原消息，传入 `nodel`（默认）则保留原消息。随后，每位成员可使用 `autotranslang en>fr` 为该频道设置自己的语言对，或仅输入 `autotranslang` 取消设置。

## 媒体与粉丝内容

| 命令 | 结果 |
| --- | --- |
| `anime <query>` | 动漫搜索结果及详细信息 |
| `manga <query>` | 漫画搜索结果 |
| `charinfo <name>` | 角色的名称、描述和图片 |
| `findanime [image]` | 通过 trace.moe 根据截图识别动漫；附加图片或提供链接即可 |
| `mal <username or @user>` | MyAnimeList 个人资料，包括在看、已看完等统计 |
| `movie <title>` | 通过 OMDb 获取的 IMDb 详细信息 |
| `youtube <query>` | YouTube 搜索结果 |
| `steam <game>` | 该游戏 Steam 商店页面的链接 |
| `pokemon <name>` | 宝可梦详细信息 |
| `osu <user> [mode]`、`osu5 <user> [mode]` | osu! 个人资料，或前五名的最佳成绩；模式可选 standard、taiko、catch 和 mania |
| `gatari <user> [mode]` | osu!Gatari 个人资料 |
| `xkcd [number or latest]` | xkcd 漫画，默认随机 |

## 图片

`image <query>` 会在 Google 和 DuckDuckGo 上以严格的安全搜索进行查询，并在通过安全检查后，以分页嵌入消息展示结果。每位成员每二十秒只能使用一次。`safebooru <tag>` 会从 Safebooru 获取带标签的图片。`revimg <url>` 和 `revav [@user]` 可为图片或头像提供 Google、TinEye 和 Yandex 的以图搜图链接。`color <hex...>` 会为一个或多个十六进制颜色生成色块。

随机图片：`randomcat`、`randomdog`、`randomfood`、`randombird`、`randomneko`、`randomkitsune` 和 `randomwaifu`。`meme` 会从一组 subreddit 中随机发送一张表情包；`randomreddit <subreddit>` 会在确认该 subreddit 未标记为 NSFW 后，随机发送其中的一个帖子。`memelist` 显示 memegen 模板，`memegen <template> [text]` 则根据模板生成表情包。`rip @user` 会以其名字和头像制作墓碑图片。`shorten <url>` 用于缩短链接。

## 笑话

`randjoke`、`yomama`、`chucknorris`、`wowjoke` 和 `magicitem` 分别从各自的 API 获取笑话或物品描述。`catfact` 则会发送一条猫咪小知识。

## 反应命令

这些命令会发送一张与该动作相关的动漫 GIF。针对他人的命令需要提及对方：`hug`、`kiss`、`pat`、`cuddle`、`poke`、`tickle`、`slap`、`punch`、`shoot`、`bite`、`feed`、`baka`、`handhold` 和 `highfive`。针对自己的命令可附带可选文字：`blush`、`bored`、`cry`、`dance`、`facepalm`、`happy`、`laugh`、`pout`、`shrug`、`sleep`、`smile`、`smug`、`stare`、`think`、`thumbsup`、`wave` 和 `wink`。以上所有命令也都可以作为斜杠命令使用。

`ship @user [@user2]` 会计算两名成员（或你与一名成员）之间的契合度，并附上一张配对图片和评语。

## 设置

此模块没有仪表板页面，除自动翻译开关外也没有其他服务器级设置。部分命令依赖机器人所有者配置的 API 密钥；如果缺少密钥，命令会返回错误而不是结果。

## 设置流程

1. 无需启用任何内容。运行 `weather London` 或 `define serendipity`，确认机器人可以在频道中回复即可。
2. 如果想要一个翻译频道，请由管理员在该频道中运行 `autotranslate`，然后让成员设置 `autotranslang en>es` 或类似的语言对。
3. 如果想限制反应命令或图片命令只能在特定频道中使用，请使用权限模块。

## 命令

请在命令前加上服务器前缀（默认为 `.`，除非你已更改）。

| 命令 | 别名 | 需要权限 | 用途 |
| --- | --- | --- | --- |
| `weather <place>` | `we` | 无 | 可交互的天气卡片 |
| `time <place>` | | 无 | 当前时间和时区 |
| `define <word>` | `def` | 无 | 词典释义 |
| `urbandict <term>` | `ud` | 无 | Urban Dictionary |
| `wiki <query>` | `wikipedia` | 无 | 维基百科摘要 |
| `wikia <site> <query>` | `fandom` | 无 | Fandom 维基查询 |
| `google <query>` | `g` | 无 | 网页搜索 |
| `bible <book> <chapter:verse>` | | 无 | 圣经经文 |
| `resolvetonetags <text>` | `tonetag`、`resolvetonetag`、`tonetags` | 无 | 解释语气标签 |
| `translate <langs> <text>` | `trans` | 无 | 翻译文本，例如 `translate en>fr hello` |
| `translangs` | | 无 | 支持的语言 |
| `autotranslate [del\|nodel]` | `at`、`autotrans` | 管理员 | 切换频道自动翻译 |
| `autotranslang [from>to]` | `atl` | 无 | 你在自动翻译中使用的语言对 |
| `anime <query>` | `ani`、`aq` | 无 | 动漫搜索 |
| `manga <query>` | `mang`、`mq` | 无 | 漫画搜索 |
| `charinfo <name>` | `characterinfo` | 无 | 角色查询 |
| `findanime [image]` | `whatanime` | 无 | 根据截图识别动漫 |
| `mal <username or @user>` | | 无 | MyAnimeList 个人资料 |
| `movie <title>` | `omdb`、`imdb` | 无 | 电影详细信息 |
| `youtube <query>` | `yt` | 无 | YouTube 搜索 |
| `steam <game>` | | 无 | Steam 商店链接 |
| `pokemon <name>` | | 无 | 宝可梦详细信息 |
| `osu <user> [mode]` | | 无 | osu! 个人资料 |
| `osu5 <user> [mode]` | | 无 | osu! 前五名最佳成绩 |
| `gatari <user> [mode]` | | 无 | osu!Gatari 个人资料 |
| `xkcd [number\|latest]` | | 无 | xkcd 漫画 |
| `image <query>` | `img`、`rimg` | 无 | 安全图片搜索 |
| `safebooru [tag]` | | 无 | Safebooru 图片 |
| `revimg <url>` | | 无 | 以图搜图链接 |
| `revav [@user]` | | 无 | 对头像进行以图搜图 |
| `color <hex...>` | `clr` | 无 | 颜色色块 |
| `randomcat` | `meow` | 无 | 随机猫图 |
| `randomdog` | `woof` | 无 | 随机狗图 |
| `randomfood` | `yum` | 无 | 随机美食图片 |
| `randombird` | `birb`、`bird` | 无 | 随机鸟类图片 |
| `randomneko` | `neko` | 无 | 随机 neko 图片 |
| `randomkitsune` | `kitsune` | 无 | 随机狐娘图片 |
| `randomwaifu` | `waifu` | 无 | 随机老婆图片 |
| `meme` | `randommeme` | 无 | 随机 Reddit 表情包 |
| `randomreddit <subreddit>` | `subreddit` | 无 | 从某个 subreddit 随机获取一个帖子 |
| `memelist` | | 无 | Memegen 模板列表 |
| `memegen <template> [text]` | | 无 | 制作表情包 |
| `rip <@user>` | | 无 | 墓碑图片 |
| `shorten <url>` | | 无 | 缩短链接 |
| `randjoke` | | 无 | 随机笑话 |
| `yomama` | `ym` | 无 | “Yo mama” 笑话 |
| `chucknorris` | `cn` | 无 | Chuck Norris 笑话 |
| `wowjoke` | | 无 | 魔兽世界笑话 |
| `magicitem` | `mi` | 无 | 魔兽世界魔法物品 |
| `catfact` | | 无 | 猫咪小知识 |
| `ship <@user> [@user2]` | | 无 | 契合度配对图片 |
| `hug`、`kiss`、`pat`、`cuddle`、`poke`、`tickle`、`slap`、`punch`、`shoot`、`bite`、`feed`、`baka`、`handhold`、`highfive <@user>` | | 无 | 针对某人的反应 GIF |
| `blush`、`bored`、`cry`、`dance`、`facepalm`、`happy`、`laugh`、`pout`、`shrug`、`sleep`、`smile`、`smug`、`stare`、`think`、`thumbsup`、`wave`、`wink [text]` | | 无 | 针对自己的反应 GIF |

## 小贴士与注意事项

- 这些命令会调用外部服务，因此结果取决于这些服务是否正常运行，以及机器人所有者是否配置了正确的 API 密钥。
- `image` 限制为每位成员每二十秒只能搜索一次，并且即使在 NSFW 频道中，结果也会经过安全过滤。
- `randomreddit` 会拒绝标记为 NSFW 的 subreddit。成人内容请使用 NSFW 模块。
- 自动翻译按频道和成员分别生效：频道必须由管理员启用，且每位成员需要自行选择语言对。
- 直播通知（`streamadd`、`streamlist`、`streamtemplate`）和 RSS 订阅（`feedadd`、`feedlist`）虽然同属此模块，但会在各自的文档中单独说明。
