---
title: 命令权限
slug: permissions
summary: 通过有序的允许和拒绝规则，决定谁可以在哪里运行哪些命令。规则可作用于整个服务器、某个身份组、某个频道、某个分类或单个成员，适用于命令和模块。
icon: fa-cog
category: Security
dashboard: /dashboard/administration
module: Permissions
tags: [permissions, command permissions, allow, deny, permission role, verbose, disable command, disable module, cooldown, dpo, permission override, blacklist, 权限, 命令权限, 允许, 拒绝, 权限身份组, 详细, 禁用命令, 禁用模块, 冷却, 权限覆盖, 黑名单]
related: [administration, help, filter, moderation]
---

## 功能介绍

默认情况下，只要 Discord 权限允许，每个命令都可以被所有人使用。命令权限在此基础上增加了一份服务器专属的规则列表。每条规则都会指定某个命令、某个模块或所有模块，对整个服务器、某个身份组、某个频道、某个分类或某一名成员是允许还是拒绝。有人运行命令时，机器人会按顺序检查列表，应用第一条匹配的规则，然后决定放行还是阻止该命令。

被阻止的命令默认会静默失败，除非开启了 **详细** 模式。开启后，机器人会回复被阻止的规则编号和内容。斜杠命令则始终会以仅自己可见的消息说明原因。

规则可由管理员管理，也可由你所选 **权限身份组** 的任何成员管理。同样的规则列表位于仪表板的 **管理** 下，在 **自动化与设置** 分区中，即 **命令权限** 卡片。

还有两个相关工具。命令冷却可限制服务器中每名成员使用某个命令的频率。**管理** 模块中的 Discord 权限覆盖可替换命令通常要求的 Discord 权限，例如让拥有 管理消息 权限的人使用通常需要 管理员 权限的命令。

## 为什么要使用它

- 让娱乐和 NSFW 命令远离严肃的频道。
- 除机器人命令频道外，在所有地方关闭音乐模块。
- 让帮助人员的身份组可以使用 `warn`，而无需授予他们 管理消息 或 管理员 权限。
- 完全禁止某个捣乱的成员使用机器人。
- 将 `roll` 这类频繁使用的命令限制为每名成员每十秒一次。

## 规则的写法

每条规则包含三个部分。

| 部分 | 选项 |
| --- | --- |
| 范围 | 一个命令、一个模块，或所有模块 |
| 用于 | 整个服务器、某个身份组、某个频道、某个分类，或特定用户 |
| 操作 | 允许或拒绝 |

下表中的命令名称已包含前两个部分的信息。前缀字母决定作用对象（`s` 服务器，`r` 身份组，`c` 频道，`ca` 分类，`u` 用户），后缀决定范围（`cmd` 命令，`mdl` 模块），`all...mdls` 形式则覆盖所有模块。

| 命令 | 创建的规则 |
| --- | --- |
| `srvrcmd <command> <enable|disable>` | 整个服务器的某个命令 |
| `srvrmdl <module> <enable|disable>` | 整个服务器的某个模块 |
| `allsrvrmdls <enable|disable>` | 整个服务器的所有模块 |
| `rolecmd <command> <enable|disable> <role>` | 某个身份组的某个命令 |
| `rolemdl <module> <enable|disable> <role>` | 某个身份组的某个模块 |
| `allrolemdls <enable|disable> <role>` | 某个身份组的所有模块 |
| `chnlcmd <command> <enable|disable> <#channel>` | 某个频道中的某个命令 |
| `chnlmdl <module> <enable|disable> <#channel>` | 某个频道中的某个模块 |
| `allchnlmdls <enable|disable> <#channel>` | 某个频道中的所有模块 |
| `catcmd <command> <enable|disable> <category>` | 某个分类下每个频道中的某个命令 |
| `catmdl <module> <enable|disable> <category>` | 某个分类中的某个模块 |
| `allcatmdls <enable|disable> <category>` | 某个分类中的所有模块 |
| `usrcmd <command> <enable|disable> @user` | 某名成员的某个命令 |
| `usrmdl <module> <enable|disable> @user` | 某名成员的某个模块 |
| `allusrmdls <enable|disable> @user` | 某名成员的所有模块 |

聊天触发器也算作命令：在需要填写命令名称的位置填入触发器的编号或文本即可。

> [!EXAMPLE]
> 先执行 `srvrmdl nsfw disable`，再执行 `chnlmdl nsfw enable #adult`，即可在除一个频道外的所有地方屏蔽 NSFW 模块。

## 规则顺序

`listperms` 会从 1 开始为列表编号。规则 1 始终是“允许整个服务器使用所有模块”，无法编辑或删除，它是没有其他规则匹配时的兜底规则。

新规则会添加到列表末尾。运行命令时，机器人会从编号最大的规则开始向规则 1 检查，第一条目标和范围都匹配的规则即为最终结果。也就是说，最近添加的匹配规则优先，这正是上面示例能够生效的原因：频道的允许规则是在服务器的拒绝规则之后添加的。

`moveperm <from> <to>` 可以更改规则的位置并重新编号，因此无需重新创建，就能将例外规则移到更宽泛的规则之上或之下。`removeperm <number>` 用于删除一条规则。`resetperms` 会清空列表，只保留规则 1，并需要 管理员 权限。

仪表板会列出同样的规则，每条规则都带有上移、下移箭头和删除按钮。

## 详细模式

`verbose` 用于切换是否在文字命令被阻止时发送错误消息，并指出具体的阻止规则，例如“权限 4（`.chnlmdl nsfw disable #general`）阻止了此操作”。该选项默认关闭。关闭时，被阻止的命令会被静默忽略，这对大多数服务器来说是合适的，也能避免成员反复尝试他们无权使用的命令。无论此设置如何，斜杠命令始终会以仅自己可见的消息回复原因。

## 谁可以修改规则

本模块中的每个命令都需要额外的权限检查。管理员始终可以使用这些命令。其他人则需要拥有通过 `permrole <role>` 设置的 **权限身份组**。如果没有设置，非管理员会收到需要管理员权限的提示（仅在开启详细模式时），命令随即停止。`permrole` 不带参数时会显示当前身份组；`permrole reset` 会清除设置。不能使用 `@everyone` 身份组。

`resetperms` 和 `permrole` 本身始终还需要 管理员 权限。

## 冷却时间

`cmdcooldown <command> [time]` 用于为本服务器中的某个命令设置每名成员的冷却时间，范围从 1 秒到 90000 秒（25 小时）。不填写时间或填写 `0s` 即可清除冷却。`allcmdcooldowns` 会列出当前的所有冷却。这些冷却会与命令本身已有的内置冷却叠加生效。

## Discord 权限覆盖

**管理** 模块可以替换命令所需的 Discord 权限。`dpo <command> <permissions...>` 会让该命令改为要求列出的权限，而不是内置权限，例如 `dpo purge ManageMessages`。运行 `dpo <command>` 且不附带权限可移除覆盖，`dpol` 用于列出所有覆盖，`dpor` 则会在确认后清除全部覆盖。这三个命令都需要 管理员 权限。

权限覆盖只替换 Discord 的内置权限要求，上述命令权限规则仍然生效。通过 `help <command>` 查看的命令页面会将原有要求划线显示，并在旁边标出覆盖内容。

## help 中的快捷菜单

`help <command>` 会向管理员显示一个权限按钮。点击后会打开该命令的快捷菜单，显示影响该命令的规则，提示冗余规则（即目标和范围相同的两条规则），提供解决方案，并可以直接添加该命令的允许和拒绝规则，或重置其权限，无需离开帮助页面。

## 机器人所有者控制

有三组命令仅限机器人所有者使用，并会影响所有服务器。全局权限（`globalmodule`、`globalcommand`、`globalpermlist`、`resetglobalperms`）可在所有地方禁用某个模块或命令。黑名单（`userblacklist`、`channelblacklist`、`serverblacklist`、`manualblacklistcheck`）则会让机器人完全不再响应某位用户、某个频道或某个服务器。被全局禁用的模块会在帮助菜单中显示地球图标和叉号。

## 设置

在仪表板中，依次打开 **管理**、**自动化与设置** 分区，然后找到 **命令权限** 卡片。

| 设置 | 默认值 | 作用 |
| --- | --- | --- |
| 详细权限提示 | 关 | 当规则阻止命令时告知用户 |
| 权限身份组 | 无 | 拥有此身份组的成员可通过命令编辑规则 |
| 规则 | 仅规则 1 | 有序的规则列表；通过 **操作**、**范围** 和 **用于** 添加，然后选择模块、命令、身份组、频道、分类或用户 ID |

该卡片还会显示自定义规则的数量，以及详细模式是否开启。同一分区中的 **权限覆盖** 卡片用于管理 Discord 权限覆盖：选择一个机器人命令，并设置它需要的 **所需的 Discord 权限**，以替代其内置权限。

## 设置步骤

1. 先确定基本结构：通常是“默认全部允许，少数禁止”，或者“默认全部禁止，然后在机器人频道中允许”。
2. 如果采用第二种结构，执行 `allsrvrmdls disable`，然后执行 `allchnlmdls enable #bot-commands`。
3. 确保工作人员仍能使用管理功能：执行 `rolemdl moderation enable @Mods` 和 `rolemdl administration enable @Mods`。
4. 执行 `listperms`，并从下往上阅读，因为这就是机器人使用规则的顺序。如果某个例外规则位于它应覆盖的规则之下，请使用 `moveperm` 调整。
5. 为可信的工作人员设置 `permrole @Mods`，让他们无需管理员权限也能调整规则。
6. 测试时开启 `verbose`，以便查看触发的是哪条规则，测试完成后再关闭。

## 命令

使用服务器的前缀运行这些命令（如果你未更改，则为 `.`）。斜杠命令位于 `/permissions` 下，例如 `/permissions servercommand`。

| 命令 | 别名 | 所需权限 | 用途 |
| --- | --- | --- | --- |
| `listperms` | `lp` | 管理员或权限身份组 | 显示带编号的规则列表 |
| `verbose [true|false]` | `v` | 管理员或权限身份组 | 切换被阻止命令的提示消息 |
| `permrole [role|reset]` | `pr` | 管理员 | 显示、设置或重置权限身份组 |
| `removeperm <number>` | `rp` | 管理员或权限身份组 | 删除一条规则 |
| `moveperm <from> <to>` | `mp` | 管理员或权限身份组 | 重新排序规则 |
| `resetperms` | | 管理员 | 删除所有规则 |
| `srvrcmd <command> <enable|disable>` | `sc` | 管理员或权限身份组 | 整个服务器的命令规则 |
| `srvrmdl <module> <enable|disable>` | `sm` | 管理员或权限身份组 | 整个服务器的模块规则 |
| `allsrvrmdls <enable|disable>` | `asm` | 管理员或权限身份组 | 整个服务器的所有模块 |
| `rolecmd <command> <enable|disable> <role>` | `rc` | 管理员或权限身份组 | 某个身份组的命令规则 |
| `rolemdl <module> <enable|disable> <role>` | `rm` | 管理员或权限身份组 | 某个身份组的模块规则 |
| `allrolemdls <enable|disable> <role>` | `arm` | 管理员或权限身份组 | 某个身份组的所有模块 |
| `chnlcmd <command> <enable|disable> <#channel>` | `cc` | 管理员或权限身份组 | 某个频道中的命令规则 |
| `chnlmdl <module> <enable|disable> <#channel>` | `cm` | 管理员或权限身份组 | 某个频道中的模块规则 |
| `allchnlmdls <enable|disable> <#channel>` | `acm` | 管理员或权限身份组 | 某个频道中的所有模块 |
| `catcmd <command> <enable|disable> <category>` | `cac` | 管理员或权限身份组 | 某个分类中的命令规则 |
| `catmdl <module> <enable|disable> <category>` | `cam` | 管理员或权限身份组 | 某个分类中的模块规则 |
| `allcatmdls <enable|disable> <category>` | `acamds` | 管理员或权限身份组 | 某个分类中的所有模块 |
| `usrcmd <command> <enable|disable> @user` | `uc` | 管理员或权限身份组 | 某名成员的命令规则 |
| `usrmdl <module> <enable|disable> @user` | `um` | 管理员或权限身份组 | 某名成员的模块规则 |
| `allusrmdls <enable|disable> @user` | `aum` | 管理员或权限身份组 | 某名成员的所有模块 |
| `cmdcooldown <command> [time]` | `cmdcd` | 管理员或权限身份组 | 设置或清除冷却 |
| `allcmdcooldowns` | `acmdcds` | 管理员或权限身份组 | 列出冷却 |
| `discordpermoverride <command> [permissions...]` | `dpo` | 管理员 | 设置或移除 Discord 权限覆盖 |
| `discordpermoverridelist` | `dpol`, `dpoli` | 管理员 | 列出覆盖 |
| `discordpermoverridereset` | `dpor` | 管理员 | 清除所有覆盖 |
| `globalmodule <module>` | `gmod` | 机器人所有者 | 在所有地方切换模块 |
| `globalcommand <command>` | `gcmd` | 机器人所有者 | 在所有地方切换命令 |
| `globalpermlist` | `gpl`, `lgp`, `globalperms`, `listglobalperms` | 机器人所有者 | 列出全局屏蔽 |
| `resetglobalperms` | | 机器人所有者 | 清除全局屏蔽 |
| `userblacklist <add|remove> <user> [reason]` | `ubl` | 机器人所有者 | 将用户加入黑名单 |
| `channelblacklist <add|remove> <id> [reason]` | `cbl` | 机器人所有者 | 将频道加入黑名单 |
| `serverblacklist <add|remove> <server> [reason]` | `sbl` | 机器人所有者 | 将服务器加入黑名单 |
| `manualblacklistcheck` | `manualblcheck`, `mbc` | 机器人所有者 | 重新执行黑名单检查 |

## 提示与注意事项

- `resetperms` 不受规则检查限制，因此只要你是管理员，即使某条规则锁死了所有命令，你也始终可以恢复。
- 规则按命令的规范名称匹配，因此 `srvrcmd clear disable` 与 `srvrcmd purge disable` 是同一条规则。请使用 `help <command>` 中显示的第一个名称。
- “所有模块”的规则也会覆盖权限模块。如果你为某个身份组拒绝了所有内容，那么只拥有该身份组的成员也无法运行 `listperms`。
- 分类规则使用命令运行时频道所属的父分类；子区会继承其父频道的设置。
- Discord 权限覆盖改变的是所需的 Discord 权限，而不是允许哪些人使用。可以两者结合使用：先用覆盖降低门槛，再用规则限制使用的位置。
- 权限规则在私信中不生效。
- 仪表板中目标选项的标签为 整个服务器、某个身份组、某个频道、某个分类 和 特定用户；选择“特定用户”时需要粘贴用户 ID。
