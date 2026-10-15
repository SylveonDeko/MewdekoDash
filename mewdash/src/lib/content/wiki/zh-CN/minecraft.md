---
title: Minecraft
slug: minecraft
summary: 注册你的 Minecraft 服务器，发布会自动更新的实时状态嵌入，接收上线和离线提醒，运行 RCON 命令，并通过配套插件将游戏内聊天、加入、死亡和进度同步到 Discord。
icon: fa-server
category: Entertainment
dashboard: /dashboard/minecraft
module: Minecraft
tags: [minecraft, mc, server status, bridge, rcon, whitelist, chat bridge, java, bedrock, geyser, player lookup, skin, 服务器状态, 桥接, 白名单, 聊天桥接, 玩家查询, 皮肤]
related: [statchannels, logging, utility]
---

## 功能介绍

员工可以按名称和地址注册一台或多台 Minecraft 服务器。任何成员随后都可以运行 `mcstatus`，查看服务器是否在线、其 MOTD、版本、延迟以及当前在线的玩家。服务器也可以被持续监控：机器人会在某个频道中发布状态嵌入并定时编辑，或将在线人数写入频道主题，并在服务器宕机或恢复时发出通知。

如果服务器启用了 RCON，员工无需进入游戏，即可从 Discord 或仪表板控制台发送控制台命令并管理白名单。

可选的配套插件可以将两者连接为双向桥接。玩家聊天、加入、离开、死亡和进度会被发布到你选择的 Discord 频道，而在桥接频道中发送的消息则会广播给游戏中的玩家。

## 为什么要使用它

- 显示实时的"谁在线"嵌入，让成员知道什么时候值得上线。
- 服务器崩溃或维护后恢复时，立即提醒社区。
- 无需打开服务器控制台，即可从 Discord 为新成员添加白名单。
- 让仅在 Discord 的成员也能通过游戏内聊天、死亡和进度消息了解服务器动态。
- 在处理申请或举报时，查询玩家的 UUID 或皮肤渲染图。

## 服务器类型

| 类型 | 默认端口 | 查询方式 |
| --- | --- | --- |
| Java 版 | 25565 | 服务器列表 Ping；当设置了 **Query Port** 且 `enable-query=true` 时，也会使用查询协议 |
| 基岩版 | 19132 | 基岩版 Ping |
| Geyser（Java + 基岩） | 25565 | Java Ping，并标记为 Geyser |

每台服务器的名称都会以小写形式存储，你添加的第一台服务器会成为不带参数的 `mcstatus` 所使用的默认服务器。除非机器人主机允许，否则私有地址、保留地址和回环地址都会被拒绝。

## 监控服务器

设置 **监控频道**（监控频道）后，机器人会每隔 **Watch Interval**（监控间隔）分钟查询一次服务器（默认 5 分钟，最少 1 分钟）。它如何处理结果取决于 **监控模式**（监控模式）。

| 模式 | 行为 |
| --- | --- |
| 嵌入（原地编辑） | 发布一条状态嵌入，并在每次查询时编辑它；如果消息被删除，则重新发布 |
| 频道主题 | 将一行简短状态写入频道主题，最多每五分钟一次 |
| 两者 | 同时执行以上两项 |

每次查询还会记录一份快照，包括在线状态、玩家人数、延迟和版本。仪表板的 **历史**（历史）标签页会将这些数据绘制成随时间变化的图表。

当在线状态发生变化时，机器人会在监控频道中发布提醒：默认是绿色的"已上线"或红色的"已离线"嵌入，你也可以使用自己的 **服务器上线提醒**（服务器上线提醒）和 **服务器离线提醒**（服务器离线提醒）模板。

### 状态占位符

**自定义监控嵌入**（自定义监控嵌入）和两个提醒模板都会经过嵌入解析器处理，并支持以下占位符。

| 占位符 | 值 |
| --- | --- |
| `%mc.server.name%` | 注册的名称 |
| `%mc.server.address%` | 主机名或 IP |
| `%mc.server.port%` | 端口 |
| `%mc.online%` | `Online` 或 `Offline` |
| `%mc.players.online%` | 当前玩家人数 |
| `%mc.players.max%` | 玩家槽位数 |
| `%mc.player.list%` | 在线玩家的名称 |
| `%mc.motd%` | 已去除格式代码的 MOTD |
| `%mc.version%` | 服务器报告的版本 |
| `%mc.latency%` | Ping 值，例如 `42ms` |
| `%mc.favicon%` | 服务器图标链接 |
| `%mc.map%` | 世界名称，仅查询协议可用 |
| `%mc.gamemode%` | 游戏模式，仅查询协议可用 |
| `%mc.software%` | 服务器软件，仅查询协议可用 |
| `%mc.plugins%` | 插件列表，仅查询协议可用 |
| `%mc.query%` | 如果扩展查询有响应，则为 `Yes` |
| `%mc.geyser%` | 如果检测到 Geyser，则为 `Yes` |

## RCON 与白名单

为服务器开启 **RCON 设置**（RCON 设置），并填入 `server.properties` 中的 **RCON 端口**（RCON 端口）和 **RCON 密码**（RCON 密码）。随后 `mcrcon` 会发送任意控制台命令并返回输出。`mcwhitelist` 将白名单命令封装为 `add`、`remove`、`list`、`on`、`off` 和 `reload` 等操作。仪表板会以列表形式显示白名单，并提供添加和移除按钮；对于已启用 RCON 的服务器，**控制台**（控制台）标签页提供命令输入框。

> [!WARNING]
> RCON 拥有完整的控制台权限。请将 `mcrcon` 仅限于管理员使用，并像对待其他服务器凭据一样保护密码。

## 配套插件桥接

桥接需要在游戏服务器上安装 MewdekoMC 插件：适用于 Paper 1.21+ 的 Paper 插件，或适用于 21.1.x 的 NeoForge 模组，两者都需要 Java 21。在仪表板中，打开服务器的 **配套插件**（配套插件）部分并生成密钥。将 **API URL** 和 **API 密钥** 复制到插件的 `config.yml`（Paper）或 `config/mewdeko-server.toml`（NeoForge）中，然后重启或运行 `/mewdeko reconnect`。密钥只显示一次；如需替换，请生成新密钥。

连接后，插件会通过 WebSocket 推送事件，机器人再将其路由到相应频道。

| 事件 | 发送到 | 默认外观 |
| --- | --- | --- |
| 玩家加入 | **加入/离开**（加入/离开）频道 | 绿色嵌入，包含玩家名称和头像 |
| 玩家离开 | **加入/离开**（加入/离开）频道 | 红色嵌入，包含玩家名称和头像 |
| 聊天 | **聊天桥接**（聊天桥接）频道 | `**player**: message` |
| 死亡 | **死亡**（死亡）频道 | 灰色嵌入，包含死亡消息 |
| 进度 | **进度**（进度）频道 | 绿色嵌入，包含进度名称 |
| 服务器状态 | 不发送；作为包含 TPS 和内存的历史快照存储 | |

任何留空的事件频道都会回退到 **监控频道**（监控频道）。在聊天桥接频道（若未设置则为监控频道）中，非机器人用户发送的消息默认会以 `[Discord] user: message` 的格式转发到游戏中。插件自身的配置可以关闭每一类事件；控制台流默认关闭，并且机器人不会显示。

### 桥接事件模板

每个发送到 Discord 的事件都可以在 **桥接事件模板**（桥接事件模板）下设置自己的模板。模板支持嵌入构建器的输出，提及会被无效化，并替换以下占位符。

| 模板 | 占位符 |
| --- | --- |
| 玩家加入（Discord） | `%mc.player%`、`%mc.uuid%`、`%mc.avatar%` |
| 玩家离开（Discord） | `%mc.player%`、`%mc.uuid%`、`%mc.avatar%` |
| 聊天消息（Discord） | `%mc.player%`、`%mc.message%`、`%mc.avatar%` |
| 死亡消息（Discord） | `%mc.player%`、`%mc.death.message%`、`%mc.avatar%` |
| 进度（Discord） | `%mc.player%`、`%mc.advancement%`、`%mc.avatar%` |
| 来自 Discord 的聊天（游戏内格式） | `%user%`、`%message%`、`%channel%`；可使用 Minecraft 的节标记颜色代码 |

## 设置

Minecraft 页面包含 **服务器**（服务器）标签页、**添加服务器**（添加服务器）标签页、**历史**（历史）、**控制台**（控制台），以及一个以所选服务器命名的标签页，用于编辑该服务器。

| 设置 | 默认值 | 作用 |
| --- | --- | --- |
| Name（名称） | | 用于命令中的简短标识符，例如 `survival` |
| Address（地址） | | 主机名或 IP |
| Port（端口） | 25565 | 游戏端口；基岩版为 19132 |
| Type（类型） | Java Edition | Java、基岩版或 Geyser |
| Query Port (0 = game port)（查询端口，0 表示游戏端口） | 0 | 扩展查询协议使用的端口 |
| Watch Channel（监控频道） | 无 | 接收状态嵌入和提醒的频道 |
| Watch Interval (minutes)（监控间隔，分钟） | 5 | 查询服务器的频率 |
| Watch Mode（监控模式） | 嵌入 | 嵌入、频道主题或两者 |
| Custom Watch Embed（自定义监控嵌入） | 默认嵌入 | 使用上述占位符的自定义状态嵌入 |
| Server Online Alert（服务器上线提醒） | 默认嵌入 | 服务器恢复时发布 |
| Server Offline Alert（服务器离线提醒） | 默认嵌入 | 服务器宕机时发布 |
| Event Channels（事件频道） | 监控频道 | 聊天桥接、加入/离开、死亡、进度 |
| Bridge Event Templates（桥接事件模板） | 默认 | 上方列出的每个事件的模板 |
| RCON Settings（RCON 设置） | 关 | 启用开关、RCON 端口、RCON 密码 |
| Companion Plugin（配套插件） | 无密钥 | 生成或撤销插件 API 密钥，并复制 API URL |

## 设置步骤

1. 在仪表板中打开 **Minecraft**，进入 **添加服务器**（添加服务器）。
2. 输入 **名称**（名称）、**地址**（地址）和 **端口**（端口），选择 **类型**（类型），并选择 **监控频道**（监控频道）和 **监控模式**（监控模式）。保存。
3. 查看 **服务器** 标签页：几秒钟内状态卡片应显示服务器在线。
4. 如果需要控制台和白名单访问，请编辑服务器以启用 **RCON 设置**，然后尝试使用 **控制台** 标签页。
5. 如需聊天桥接，请设置 **Event Channels**，在 **配套插件** 下生成密钥，在游戏服务器上安装插件，并将 URL 和密钥粘贴到其配置中。
6. 进入游戏并发送一条消息：它应该出现在聊天桥接频道中，而在那里的回复也应该出现在游戏中。

## 命令

使用服务器的前缀运行这些命令（如果你未更改，则为 `.`）。斜杠命令版本位于 `/minecraft` 下。

| 命令 | 别名 | 所需权限 | 用途 |
| --- | --- | --- | --- |
| `mcstatus [name or address]` | `mcs` | 无 | 显示默认服务器、已注册服务器或你输入的任意 `host:port` 的状态 |
| `mcadd <name> <address[:port]>` | | 管理服务器 | 注册服务器；如为基岩版，请在地址前加上 `bedrock:` |
| `mcremove <name>` | `mcrm` | 管理服务器 | 删除已注册的服务器 |
| `mclist` | `mcl` | 无 | 列出已注册的服务器，包括类型、默认标记和监控频道 |
| `mcdefault <name>` | `mcdef` | 管理服务器 | 选择 `mcstatus` 默认使用的服务器 |
| `mcwatch <name> [#channel]` | `mcw` | 管理服务器 | 开始将状态发布到频道，或不指定频道以停止 |
| `mcwatchmode <name> <embed, channeltopic or both>` | `mcwm` | 管理服务器 | 选择监控的显示方式 |
| `mcembed <name> [template]` | `mce` | 管理服务器 | 设置自定义状态嵌入，或使用 `-` 重置 |
| `mcplayer <username>` | `mcp` | 无 | 显示玩家的 UUID、头像和皮肤 |
| `mcskin <username>` | | 无 | 显示玩家的皮肤渲染图 |
| `mcrcon <name> <command>` | | 管理员 | 通过 RCON 运行控制台命令 |
| `mcwhitelist <name> <action> [player]` | `mcwl` | 管理服务器 | `add`、`remove`、`list`、`on`、`off` 或 `reload` |

## 技巧与注意事项

- `mcstatus` 每个 Discord 服务器每分钟限制十次查询，所有成员共享该限制。
- 直接使用 `mcstatus play.example.com:25565` 按地址查询无需注册即可使用，但私有地址和本地地址会被阻止。
- 监控频道中的 Channel Topic（频道主题）模式需要机器人拥有 **管理频道**（管理频道）权限，而 Discord 本身也会限制主题编辑，因此主题模式的更新间隔绝不会短于五分钟。
- 只有在 `server.properties` 中设置了 `enable-query=true` 且 **Query Port** 与之匹配时，地图、游戏模式和插件等扩展详情才会显示。
- 如果监控嵌入被删除，下一次查询会发布一条新的嵌入，而不会报错。
- 桥接消息会无效化 `@everyone`、`@here` 和用户提及，因此游戏中的玩家无法在 Discord 中发起提及。
