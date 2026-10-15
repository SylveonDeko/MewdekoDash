---
title: 音乐
slug: music
summary: 在语音频道中播放来自 YouTube、Spotify、SoundCloud 的音乐并进行搜索，支持队列、已保存的播放列表、音频过滤器、DJ 身份组、文字转语音和 Last.fm 收听记录。
icon: fa-music
category: Entertainment
dashboard: /dashboard/music
module: Music
tags: [music, play, queue, playlist, spotify, youtube, soundcloud, volume, skip, loop, repeat, dj role, filters, bass boost, nightcore, tts, text to speech, lastfm, scrobble, music links, 音乐, 播放, 队列, 播放列表, 音量, 跳过, 循环, 重复, DJ 身份组, 过滤器, 低音增强, 文字转语音, 收听记录, 音乐链接]
related: [utility, administration]
---

## 功能介绍

成员加入语音频道后，运行 `play` 并附上链接或搜索词。机器人会加入频道、将曲目加入队列并开始播放。YouTube、YouTube Music、SoundCloud 和 Spotify 的链接会被直接解析；Spotify 的曲目、专辑和播放列表会匹配到 YouTube。普通搜索会以选择菜单显示最多 25 条结果，方便成员选择想要的那一首。

频道中的所有人共享同一个队列。成员可以查看队列、跳转到某一项、移动或删除曲目、随机排列、循环单曲或整个队列，也可以将队列保存为有名称的播放列表，之后再次加载。跳过方式分为两种：拥有 DJ 身份组的成员可以立即跳过，其他人则需要投票。

员工可以设置音乐频道（用于发送正在播放和队列为空的通知）、DJ 身份组、默认音量和循环模式，也可以开启低音增强、Nightcore 等音频过滤器。仪表板会显示实时播放器，包括队列、循环按钮和过滤器开关，同一实时数据也会驱动移动端应用。

同一模块还包含两项附加功能。文字转语音（TTS）会在语音频道中朗读聊天消息，支持为每位用户设置不同语音，并提供屏蔽名单。Last.fm 则让成员同步机器人播放的曲目，并使用 `fm` 系列命令查询自己的收听情况。

## 适用场景

- 闲聊语音频道需要背景音乐，且任何人都可以添加曲目，而不必由一个人整晚担任 DJ。
- 员工希望只有可信成员能够立即跳过，其他人则通过投票决定。
- 社区会保存几个固定播放列表，并在每次活动开始时加载。
- 语音频道中有无法开口说话的成员，他们希望自己的消息能被朗读出来。
- 音乐爱好者希望有一个共享的地方，用来比较 Last.fm 数据和“谁最懂这位艺术家”排行榜。

## 播放与队列

几乎所有音乐命令都要求你身处语音频道中。如果机器人已经在其他频道播放，来自其他频道的命令会被拒绝。

`play <link or search>` 支持以下输入：

| 输入 | 结果 |
| --- | --- |
| YouTube 或 YouTube Music 链接 | 直接加载，包括播放列表 |
| SoundCloud 链接 | 直接加载 |
| Spotify 曲目链接 | 匹配到 YouTube 上的曲目 |
| Spotify 专辑或播放列表链接 | 每首曲目匹配到 YouTube，并在解析完成后逐首加入队列，同时显示进度消息 |
| 其他内容 | 在 YouTube 上搜索，以选择菜单显示最多 25 条结果 |

`play <number>` 会跳转到对应的队列位置。`search <query>` 会列出十条结果，但不会加入队列。`queue` 会分页显示队列，每页五项，并提供选择菜单用于设置每首曲目的选项。`nowplaying` 会显示当前曲目及其点播者和来源。

`songremove <number>` 删除一项，`movesong <from> <to>` 重新排序，`shuffle` 会随机排列当前曲目之后的所有曲目，`clearqueue` 会清空队列并停止播放。`seek mm:ss` 会跳转到当前曲目的指定时间。`volume 0..100` 设置音量，并将其保存为服务器默认值。

`loop <type>` 用于设置循环模式：`none`（也可用 `off`）、`track`（也可用 `song`）或 `queue`（也可用 `all`）。当队列在关闭循环的情况下播放完毕时，机器人会在音乐频道中发送队列为空的通知。

### 跳过与 DJ 身份组

`skip` 会立即结束当前曲目，无论由谁执行。`voteskip` 会统计投票：拥有 DJ 身份组或管理员权限的成员会立即跳过，其他成员则各投一票，当票数达到语音频道中非机器人成员的 70% 时，曲目会被跳过。

使用 `setdjrole @role` 设置 DJ 身份组，或在仪表板中使用 **DJ 身份组** 选择器。不带身份组运行 `setdjrole` 即可将其移除。

### 自动播放

`autoplay <0..5>` 会在队列播完时，让机器人根据 Spotify 推荐添加指定数量的相关曲目。设为 0 即可关闭。该功能依赖于机器人已配置 Spotify 凭据；如果缺少凭据，自动播放将不会生效。

## 播放列表

`saveplaylist <name>` 会以你为作者，将当前队列按名称保存在服务器中。`loadplaylist <name> [true]` 会将播放列表追加到队列末尾；如果传入 `true`，则会替换整个队列。如果当前没有播放，加载后会自动开始播放。加载时曲目会在 YouTube 上重新解析，因此已不存在的条目会被静默跳过。`playlists` 会列出所有播放列表及其曲目数和作者，`deleteplaylist <name>` 则会删除指定播放列表。

## 音频过滤器

过滤器会应用于正在运行的播放器，并在机器人断开连接后重置。

| 命令 | 效果 |
| --- | --- |
| `bass <0..1>` | 增强低频；设为 0 即可关闭 |
| `nightcore [on/off]` | 语速更快，音调更高 |
| `vaporwave [on/off]` | 语速更慢，音调更低 |
| `karaoke [on/off]` | 抑制居中的人声 |
| `tremolo [on/off]` | 音量颤动 |
| `vibrato [on/off]` | 音调颤动 |
| `eightd [on/off]` | 让声音围绕听者旋转 |
| `distortion [on/off]` | 失真 |
| `stereowiden [on/off]` | 拓宽立体声场 |

`activefilters` 会列出已开启的过滤器，`resetfilters` 会将它们全部清除。仪表板的 **正在播放** 卡片提供切换按钮，可用于低音增强、Nightcore、Vaporwave、卡拉 OK、颤音、揉音、8D 环绕和失真。

## 音乐链接转换

在已启用该功能的频道中，发布 Apple Music、Spotify、YouTube Music、YouTube、Amazon Music、Deezer、Tidal、Pandora 或 SoundCloud 链接后，机器人会回复一个嵌入消息，包含曲目名称、艺术家和封面，并附上其他平台上同一曲目的链接。使用 `musiclinkchannel [#channel]`（需要管理服务器权限）可切换某个频道的功能，使用 `musiclinkchannels` 可列出所有已启用的频道。在仪表板中，该功能位于 **音乐设置** 标签页下的 **音乐链接转换** 部分。

## 文字转语音

TTS 会在机器人所在的语音频道中朗读消息。员工需要为每个语音频道单独启用该功能。该语音频道中成员发送的消息，无论是在语音频道的文字聊天中发送，还是在已关联的文字频道中发送，都会进入队列并被朗读。朗读每条消息时，音乐音量会降至 15%，朗读结束后恢复。默认队列可容纳 10 条消息。

成员可以使用 `ttsvoice <name>` 选择自己的语音，并用 `ttsvoices [search]` 浏览可用语音。员工可以设置默认语音、语速（仪表板中为 0.5 到 3.0，命令中为 0.5 到 2.0）、音量、所需身份组，以及加入和离开时的播报及其格式，还可以屏蔽个别用户。仪表板的 **TTS 设置** 标签页提供相同的控制项，分为 **TTS 通用设置**、**TTS 行为**、**语音频道 TTS** 和 **已屏蔽的 TTS 用户** 四个部分。

## Last.fm

成员可以在仪表板的 `/me` 页面关联 Last.fm 账号（`lastfmlink` 会发送关联按钮）。关联后，机器人播放时间至少为 30 秒的曲目会同步到其账号。`lastfmtoggle` 可暂停同步，`lastfmstatus` 可查看当前状态。关联账号的用户均可使用 `fm` 系列命令，包括按时间段查询最近曲目、热门艺术家、专辑和曲目，查询艺术家和专辑信息，服务器内的“谁最懂”排行榜，王冠统计，口味对比，以及拼贴图表。

## 设置

仪表板页面有两个标签页：**音乐设置** 和 **TTS 设置**。机器人播放时，音乐标签页还会显示 **正在播放** 卡片，其中包含队列长度、随机排列和清空按钮、循环模式按钮以及过滤器开关。

| 设置 | 默认值 | 作用 |
| --- | --- | --- |
| 默认音量 | 100 | 初始音量，0 到 100；`volume` 命令也会保存到这里 |
| 音乐频道 | 所有频道 | 正在播放和队列通知的发送位置 |
| DJ 身份组 | 无 DJ 身份组 | 可立即跳过并绕过投票跳过的身份组 |
| 循环模式 | 无 | 无、单曲或队列 |
| 自动断开 | 从不 | 从不、语音频道为空时、队列为空时或满足任一条件 |
| 自动播放相似曲目 | 已禁用 | 队列播完后添加相关曲目；命令最多可指定 5 首 |
| 启用投票跳过 | 关闭 | 在播放器底部显示投票跳过阈值 |
| 投票跳过阈值 | 百分比，1 到 100 | 仅作显示用；`voteskip` 命令本身始终需要 70% |
| 音乐链接频道 | 无 | 发送跨平台嵌入消息的频道 |
| TTS 音量 | 100 | 朗读语音的响度 |
| TTS 语速 | 1.0 | 0.5 到 3.0 |
| 最大队列长度 | 10 | 待朗读的 TTS 消息数，1 到 50 |
| 默认语音 | 服务商默认 | 成员未选择语音时使用的语音 |
| 所需身份组 | 无需身份组 | 只有拥有该身份组的成员才能使用 TTS；管理员始终可以使用 |
| 回复上下文 | 关闭 | 朗读回复消息前先读出“回复 用户” |
| 附件朗读 | 关闭 | 播报发送的图片、视频和文件 |
| 连续消息合并 | 关闭 | 同一成员连续发送多条消息时，跳过重复朗读名字 |
| 语音频道 TTS | 无 | 按语音频道设置：是否启用、关联的文字频道、加入和离开播报及其格式 |
| 已屏蔽的 TTS 用户 | 无 | 其消息永远不会被朗读的成员 |

> [!NOTE]
> 在仪表板中设置的循环模式会从下一个播放器开始生效。`loop` 命令则会立即更改正在运行的播放器。

## 设置步骤

1. 确保机器人在你想让它使用的语音频道中拥有 连接 和 说话 权限。
2. 在仪表板中打开 **音乐**，设置 **音乐频道**，避免正在播放的嵌入消息出现在普通聊天中。
3. 为可以自由跳过的成员选择 **DJ 身份组**。
4. 将 **默认音量** 设为约 50；100 的音量会比较响。
5. 加入语音频道，运行 `play never gonna give you up`，选择一个结果，然后运行 `queue` 和 `nowplaying`。
6. 将曲目加入队列，构建一个固定播放列表，然后运行 `saveplaylist chill`。
7. 如果需要 TTS，切换到 **TTS 设置**，在 **语音频道 TTS** 下添加语音频道，并让成员通过 `ttsvoice` 选择语音。

## 命令

请使用服务器的前缀运行以下命令（默认为 `.`，除非你已更改）。

| 命令 | 别名 | 所需权限 | 用途 |
| --- | --- | --- | --- |
| `join` | `j`, `mv` | 无 | 加入你所在的语音频道 |
| `leave` | `disconnect`, `d` | 无 | 离开频道并清空队列 |
| `play <link or search>` | `p`, `start` | 无 | 加入队列并播放 |
| `play <number>` | `p`, `start` | 无 | 跳转到指定队列位置 |
| `search <query>` | `find` | 无 | 列出十条结果，但不播放 |
| `pause` | | 无 | 暂停或继续播放 |
| `nowplaying` | `np` | 无 | 显示当前曲目 |
| `queue` | `q`, `yq`, `enqueue` | 无 | 显示队列 |
| `skip` | `next`, `n` | 无 | 跳过当前曲目 |
| `voteskip` | `vskip` | 无 | 投票跳过；拥有 DJ 身份组时立即生效 |
| `songremove <number>` | `trackremove`, `srm` | 无 | 删除队列中的一项 |
| `movesong <from> <to>` | `ms`, `move` | 无 | 重新排列队列 |
| `shuffle` | `playlistshuffle`, `sh`, `plsh` | 无 | 随机排列即将播放的曲目 |
| `clearqueue` | `cq` | 无 | 清空队列并停止播放 |
| `volume <0..100>` | `vol` | 无 | 设置并保存音量 |
| `seek <mm:ss>` | | 无 | 跳转到当前曲目的指定时间 |
| `loop <none|track|queue>` | `queuerepeat`, `qrp`, `rpl` | 无 | 设置循环模式 |
| `autoplay <0..5>` | `ap` | 无 | 队列播完时添加相关曲目 |
| `setdjrole [role]` | `djrole` | 管理服务器 | 设置或清除 DJ 身份组 |
| `setmusicchannel [#channel]` | `smch` | 无 | 设置播放通知的发送位置 |
| `musicsettings` | `msettings` | 无 | 显示自动播放、音量、循环模式和频道 |
| `musiclinkchannel [#channel]` | | 管理服务器 | 切换频道中的链接转换功能 |
| `musiclinkchannels` | | 无 | 列出已启用链接转换的频道 |
| `saveplaylist <name>` | `saveplist` | 无 | 保存队列 |
| `loadplaylist <name> [clear]` | `loadplist` | 无 | 加载播放列表；传入 `true` 可替换队列 |
| `playlists` | `playlistshow`, `plshow` | 无 | 列出已保存的播放列表 |
| `deleteplaylist <name>` | `delplist` | 无 | 删除播放列表 |
| `bass [0..1]` | | 无 | 低音增强 |
| `nightcore [on/off]` | `nc` | 无 | Nightcore 过滤器 |
| `vaporwave [on/off]` | `vw` | 无 | Vaporwave 过滤器 |
| `karaoke [on/off]` | | 无 | 卡拉 OK 过滤器 |
| `tremolo [on/off]` | | 无 | 颤音过滤器 |
| `vibrato [on/off]` | | 无 | 揉音过滤器 |
| `eightd [on/off]` | `8d` | 无 | 8D 环绕过滤器 |
| `distortion [on/off]` | | 无 | 失真过滤器 |
| `stereowiden [on/off]` | `swiden` | 无 | 拓宽立体声 |
| `resetfilters` | `resetfx` | 无 | 清除所有过滤器 |
| `activefilters` | `activefx` | 无 | 列出已启用的过滤器 |
| `lastfmlink` | `lflink` | 无 | 获取 Last.fm 关联按钮 |
| `lastfmunlink` | `lfunlink` | 无 | 取消关联你的 Last.fm 账号 |
| `lastfmtoggle` | `lftoggle` | 无 | 暂停或继续同步 |
| `lastfmstatus` | `lfstatus` | 无 | 显示你的 Last.fm 关联状态 |
| `fm [user]` | | 无 | 正在播放或最近一次同步的曲目 |
| `fmrecent [user]` | `fmr` | 无 | 最近同步的曲目 |
| `fmtopartists [period] [user]` | `fmta` | 无 | 热门艺术家 |
| `fmtopalbums [period] [user]` | `fmtal` | 无 | 热门专辑 |
| `fmtoptracks [period] [user]` | `fmtt` | 无 | 热门曲目 |
| `fmartist [artist]` | `fma` | 无 | 艺术家信息及你的播放次数 |
| `fmalbum [query]` | `fmal` | 无 | 专辑信息 |
| `fmwhoknows [artist]` | `whoknows`, `wk` | 无 | 某位艺术家的服务器排行榜 |
| `fmwhoknowsalbum <query>` | `whoknowsalbum`, `wka` | 无 | 某张专辑的服务器排行榜 |
| `fmwhoknowstrack <query>` | `whoknowstrack`, `wkt` | 无 | 某首曲目的服务器排行榜 |
| `fmcrowns [artist]` | `crowns` | 无 | 艺术家王冠统计 |
| `fmtaste <user>` | `taste` | 无 | 与他人比较口味 |
| `fmchart [size] [period] [user]` | `chart` | 无 | 专辑封面拼贴图 |
| `ttsenable` | `tts`, `ttson` | 管理服务器 | 在你所在的语音频道中启用 TTS |
| `ttsremove` | `ttsoff` | 管理服务器 | 在你所在的语音频道中禁用 TTS |
| `ttslink [#channel]` | `ttschannel` | 管理服务器 | 将文字频道关联到语音频道 |
| `ttsannounce` | `ttsjoinleave` | 管理服务器 | 切换加入和离开播报 |
| `ttsjoinformat [text]` | `ttsjoin` | 管理服务器 | 加入播报的文本 |
| `ttsleaveformat [text]` | `ttsleave` | 管理服务器 | 离开播报的文本 |
| `ttsvolume <0..100>` | `ttsvol` | 管理服务器 | TTS 响度 |
| `ttsspeed <0.5..2>` | | 管理服务器 | TTS 语速 |
| `ttsdefaultvoice [voice]` | `ttsdefvoice` | 管理服务器 | 服务器默认语音 |
| `ttsvoice [voice]` | | 无 | 设置你自己的语音 |
| `ttsvoices [search]` | `ttsvoicelist`, `ttsvoicesearch` | 无 | 浏览语音 |
| `ttsblock <user>` | `ttsban` | 管理服务器 | 切换成员的 TTS 屏蔽状态 |
| `ttsblocklist` | `ttsbanlist`, `ttsblocked` | 管理服务器 | 列出被屏蔽的成员 |
| `ttsrole [role]` | | 管理服务器 | 设置使用 TTS 所需的身份组 |
| `ttsreplycontext` | `ttsreply` | 管理服务器 | 切换回复上下文 |
| `ttsattachmentnarration` | `ttsattach` | 管理服务器 | 切换附件朗读 |
| `ttsconsecutivegrouping` | `ttsgroup` | 管理服务器 | 切换连续消息的名字跳过功能 |
| `ttsmaxqueue <1..50>` | `ttsqueue` | 管理服务器 | 待朗读 TTS 消息数上限 |
| `ttssettings` | `ttsinfo` | 管理服务器 | 显示 TTS 设置 |

## 小贴士与注意事项

- 机器人需要在语音频道中拥有 连接 和 说话 权限，并需要在音乐频道中拥有 发送消息 权限，才能发送通知。
- 大多数命令会先检查你是否身处语音频道，并且是否与机器人在同一频道中。
- 通过 `volume` 设置的音量会保存为服务器默认值，因此深夜设置的 10 会成为第二天的初始音量。
- Spotify 播放列表会逐首通过 YouTube 搜索进行转换，因此较长的播放列表需要一些时间，且部分匹配结果可能不准确。
- 保存的播放列表存储的是链接，而不是音频。如果某个视频已从 YouTube 删除，加载时会跳过该条目。
- 投票跳过只统计频道中的真人。如果频道中只有你一人，你自己的一票即已足够。
- TTS 只会朗读身处语音频道中的成员发送的消息，因此只在文字频道中观看的人无法触发朗读。
