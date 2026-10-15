---
title: 欢迎语
slug: multigreets
summary: 成员加入时，在最多三十个频道中发送欢迎消息，并支持经典的离开、助推和私信欢迎语。
icon: fa-bell
category: Actions
dashboard: /dashboard/multigreets
module: MultiGreets
tags: [greets, multigreets, welcome, join message, goodbye, bye, leave message, boost message, greet dm, webhook, placeholders, 欢迎语, 欢迎, 加入消息, 离开消息, 告别, 助推消息, 欢迎私信, Webhook, 占位符]
related: [rolegreets, invites, administration]
---

## 功能介绍

成员加入时，机器人会在你设置的每个欢迎语频道中发送欢迎消息。每条欢迎语都有自己的消息、自动删除计时器、Webhook 身份和机器人开关。你可以让所有欢迎语同时发送，也可以每次加入时随机选择一条。

消息会经过嵌入解析器处理，因此欢迎语可以是纯文本、带按钮的完整嵌入，或使用自定义名称和头像的 Webhook 消息。占位符会填入成员名称、服务器名称、成员数量，如果开启了邀请追踪，还会显示邀请人是谁。

旧的单条消息系统仍然保留。它负责成员离开时的告别消息、成员开始助推时的助推公告，以及私下发送的欢迎私信。这些功能位于管理模块中，下文会进一步说明。

## 适用场景

- 在 `#general` 中发送公开欢迎，同时在 `#staff-joins` 中记录一条日志。
- 不同频道使用不同的欢迎风格，例如一个频道使用嵌入，另一个频道使用 Webhook 角色。
- 准备一组欢迎语，让每位新成员随机获得其中一条。
- 发送一条一分钟后自动删除的简短欢迎，避免频道被刷屏。
- 无需额外设置，即可发送告别或助推消息。

## 欢迎语类型

**欢迎语类型** 是服务器范围的设置，决定成员加入时的行为。

| 类型 | 仪表板标签 | 结果 |
| --- | --- | --- |
| MultiGreet | 全部欢迎语 | 所有已启用的欢迎语按添加顺序依次发送。默认值。 |
| RandomGreet | 随机欢迎语 | 从列表中随机选择一条欢迎语并发送。被禁用的欢迎语也可能被选中，此时会跳过。 |
| Off | 已禁用 | 不发送任何欢迎语。 |

## 单条欢迎语的组成

每条欢迎语对应一个频道。一个频道最多可以有五条欢迎语，整个服务器最多可以有三十条。欢迎语按其在列表中的位置编号，命令使用的就是这个编号。

| 字段 | 默认值 | 含义 |
| --- | --- | --- |
| 频道 | 你添加时选择的频道 | 此欢迎语的发送位置 |
| 消息 | 空 | 文本或嵌入模板。空的欢迎语不会发送任何内容。 |
| 删除时间 | 0（从不） | 欢迎消息自动删除前的秒数 |
| 欢迎机器人 | 关闭 | 机器人账号加入时是否触发此欢迎语 |
| Webhook | 无 | 通过 Webhook 发送，并使用自定义名称和头像，而不是以机器人身份发送 |
| 已启用 | 开启 | 被禁用的欢迎语会被跳过，但不会被删除 |

如果频道被删除，欢迎语会在下次尝试触发时被移除。如果 Webhook 被删除，或机器人失去发送消息的权限，该欢迎语会被自动禁用，避免每次有人加入都报错。

## 占位符

欢迎语使用用户、服务器和机器人的占位符。只有在邀请页面开启邀请追踪后，邀请人相关的占位符才会生效。

| 占位符 | 值 |
| --- | --- |
| `%user%`, `%user.mention%` | 新成员的提及 |
| `%user.name%`, `%username%` | 用户名 |
| `%user.fullname%`, `%userfull%` | 完整标签 |
| `%user.id%`, `%id%` | 用户 ID |
| `%user.avatar%`, `%useravatar%` | 头像 URL |
| `%user.banner%` | 横幅 URL |
| `%user.created_date%`, `%user.created_time%` | 账号创建时间 |
| `%user.joined_date%`, `%user.joined_time%` | 加入本服务器的时间 |
| `%server%`, `%server.name%` | 服务器名称 |
| `%server.id%`, `%sid%` | 服务器 ID |
| `%server.icon%`, `%server.banner%` | 服务器图标和横幅 URL |
| `%server.members%`, `%members%` | 成员数量 |
| `%server.boostlevel%`, `%server.boostcount%` | 助推等级和助推数量 |
| `%server.time%`, `%server.timestamp.longdatetime%` | 当前时间，可为普通文本或 Discord 时间戳 |
| `%bot.name%`, `%bot.id%`, `%bot.avatar%` | 机器人自身的信息 |
| `%inviter.username%`, `%inviter.mention%`, `%inviter.id%`, `%inviter.avatar%` | 所使用邀请链接的邀请人，若无法识别则显示 `Unknown` |
| `%inviter.count%`, `%inviter.regular%`, `%inviter.left%`, `%inviter.fake%`, `%inviter.bonus%` | 邀请人的邀请统计 |
| `%invite.code%`, `%invite.url%`, `%invite.uses%`, `%invite.label%`, `%invite.type%` | 所使用的邀请、其标签，以及它是普通邀请、自定义链接还是应用邀请 |
| `%user.joincount%`, `%user.leavecount%` | 该成员加入和离开的次数 |
| `%server.members.ordinal%` | 成员数量的序数形式，如 1st、2nd、1,204th |
| `%user.joined.R%`, `%user.created.F%`（以及 t、T、d、D、f 格式） | 加入时间和账号创建时间，以 Discord 时间戳显示 |

> [!EXAMPLE]
> `Welcome %user.mention% to %server%! You are member #%server.members%.`

服务器、频道和机器人的完整占位符列表位于占位符页面。欢迎语中不会填充频道相关的占位符。

## 经典欢迎、告别和助推命令

这些命令早于多条欢迎语功能，位于管理模块中。每个命令只对应一条消息，保存在服务器配置中，并在你运行命令的频道中切换开关。

| 消息 | 触发时机 | 占位符 |
| --- | --- | --- |
| Bye | 成员离开时 | 用户、服务器和机器人占位符，以及频道占位符。`%user%` 会提及离开的成员。 |
| Boost | 成员开始助推或再次助推时 | 用户、频道、服务器、机器人和 GIF 占位符 |
| Greet DM | 成员加入时，以私信形式发送 | 用户、频道、服务器、机器人和 GIF 占位符 |

运行 `bye` 或 `boost` 会切换对应消息的开关，并将频道设为你输入命令时所在的频道。`byedel` 和 `boostdel` 用于设置自动删除计时器（单位为秒），其中 `boostdel` 的上限为 600。消息命令不带文本时，会显示当前消息。`leavehook` 会将告别消息包装在 Webhook 中，使用自定义名称和头像发送；`leavehook disable` 则会将其移除。

欢迎私信需要谨慎使用。除非机器人已通过验证，否则机器人会在启用前要求你确认，因为未验证机器人大规模发送私信可能会导致其被标记。任何成员都可以使用 `greetdmoptout`，或在仪表板中个人资料页面的 **欢迎私信** 开关处，为自己屏蔽这些私信。

目前没有经典的频道欢迎命令。如需在频道中发送欢迎消息，请使用多条欢迎语。

## 设置

所有设置都位于仪表板的欢迎语页面中。

| 设置 | 默认值 | 作用 |
| --- | --- | --- |
| 欢迎语类型 | 全部欢迎语 | 全部欢迎语、随机欢迎语或已禁用 |
| 添加新欢迎语 | | 选择频道，然后点击 **添加欢迎语** |
| 欢迎消息 | 空 | 单条欢迎语的嵌入构建器，支持内容、最多十个嵌入和组件 |
| 删除时间 | 从不 | 输入如 `1m30s` 或 `45s` 的时长 |
| Webhook | 未配置 | Webhook 名称和可选的头像 URL |
| 欢迎机器人 | 关闭 | 同样对机器人账号发送欢迎语 |
| 已启用 | 开启 | 关闭某条欢迎语，但不删除它 |

告别、助推和欢迎私信消息不在此页面中设置，请使用上述命令进行设置。

## 设置步骤

1. 在仪表板中打开 **欢迎语**，并将 **欢迎语类型** 保持为 **全部欢迎语**。
2. 在 **添加新欢迎语** 下选择欢迎频道，然后点击 **添加欢迎语**。
3. 在新卡片上打开 **欢迎消息**，使用上方的占位符编写消息，然后保存。
4. 可选：设置 **删除时间**，为 **Webhook** 添加名称和头像，如果希望为机器人加入发送公告，请开启 **欢迎机器人**。
5. 对其他频道重复上述步骤。如果你在同一频道中添加了多条欢迎语，并希望有所变化，可以切换为 **随机欢迎语**。
6. 如需告别消息，请在目标频道中运行 `byemsg Goodbye %user%, we will miss you`，然后运行 `bye` 将其开启。
7. 如需助推消息，请运行 `boostmsg Thanks for boosting, %user%!`，然后运行 `boost`。
8. 使用 `byetest` 和 `boosttest` 进行测试。多条欢迎语提供预览功能：运行 `multigreetmessage 1` 并点击 **预览**。

## 命令

请使用服务器的前缀运行以下命令（默认为 `.`，除非你已更改）。多条欢迎语命令也可以通过 `/multigreets add`、`/multigreets remove` 等斜杠命令使用。

| 命令 | 别名 | 所需权限 | 用途 |
| --- | --- | --- | --- |
| `multigreetadd [#channel]` | `mgadd`, `mga` | 管理员 | 为频道添加欢迎语，默认为当前频道 |
| `multigreetremove <number or #channel>` | `mgrem`, `mgrm`, `mgr` | 管理员 | 按编号删除一条欢迎语，或在确认后删除某频道中的所有欢迎语 |
| `multigreetmessage <number> [message]` | `mgmsg`, `mgm` | 管理员 | 设置欢迎语文本或嵌入；不带消息时，提供预览或显示原始模板 |
| `multigreetdelete <number> <time or seconds>` | `mgdel`, `mgd` | 管理员 | 自动删除计时器，例如 `1m` 或 `60`；`0` 表示关闭 |
| `multigreetdisable <number> <true or false>` | `mgdisable`, `mgdis` | 管理员 | `true` 表示禁用该欢迎语，`false` 表示启用 |
| `multigreetgreetbots <number> <true or false>` | `multigreetbots`, `mggb` | 管理员 | 该欢迎语是否对机器人账号生效 |
| `multigreetwebhook <number> [name] [avatar url]` | `mgwebhook`, `mghook`, `mgh` | 管理员 | 为欢迎语创建 Webhook；不带名称则移除 |
| `multigreettype <multigreet, randomgreet or off>` | `mgtype`, `mgt` | 管理员 | 更改服务器范围的欢迎语类型 |
| `multigreetlist` | `mglist`, `mgl` | 管理员 | 分页查看所有欢迎语及其设置 |
| `bye` | | 管理服务器 | 切换此频道中的告别消息 |
| `byemsg [text]` | | 管理服务器 | 显示或设置告别消息 |
| `byedel [seconds]` | | 管理服务器 | 告别消息的自动删除计时器，默认 30 |
| `byetest [@user]` | | 管理服务器 | 发送告别消息作为测试 |
| `leavehook [#channel] [name] [image url] [text]` | `byehook` | 管理服务器 | 通过 Webhook 发送告别消息，或使用 `leavehook disable` 关闭 |
| `boost` | | 管理服务器 | 切换此频道中的助推消息 |
| `boostmsg [text]` | `boostmessage` | 管理服务器 | 显示或设置助推消息 |
| `boostdel [seconds]` | `boostdelete` | 管理服务器 | 助推消息的自动删除计时器，0 到 600，默认 30 |
| `boosttest [@user]` | `testboost` | 管理服务器 | 发送助推消息作为测试 |
| `greetdm` | | 管理服务器 | 切换欢迎私信 |
| `greetdmmsg [text]` | | 管理服务器 | 显示或设置欢迎私信文本 |
| `greetdmtest [@user]` | | 管理服务器 | 发送欢迎私信作为测试 |
| `greetdmoptout` | `gdmoptout` | 无 | 停止在任何地方接收此机器人发送的欢迎私信 |

## 小贴士与注意事项

- `multigreetdelete` 需要机器人拥有 管理消息 权限，`multigreetwebhook` 和 `leavehook` 需要 管理 Webhook 权限。
- 欢迎语编号是其在列表中的位置，因此删除一条后，其后所有欢迎语的编号都会前移。编辑前请先运行 `multigreetlist`。
- `multigreettype` 的 `off` 选项、`/multigreets type` 以及仪表板中的 **已禁用** 按钮都会设置相同的欢迎语类型，因此使用其中任何一种都会关闭该系统，但不会删除你的欢迎语。
- 邀请相关占位符会等待最多五秒，以确认加入来源后再发送欢迎消息，因此即使多人同时加入，邀请人也能正确显示。
- 欢迎私信只有在成员允许接收服务器成员私信时才会生效。私信发送失败会被忽略。
- 身份组欢迎语是独立的功能，它会在身份组被授予时触发，而不是在成员加入时触发。
