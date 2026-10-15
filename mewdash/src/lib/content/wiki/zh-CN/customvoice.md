---
title: 自定义语音
slug: customvoice
summary: 一个“加入即创建”的枢纽频道，为每位成员提供专属的临时语音频道，支持重命名、人数上限、比特率、锁定、允许和拒绝等控制，并在频道为空时自动清理。
icon: fa-microphone
category: Entertainment
dashboard: /dashboard/customvoice
module: CustomVoice
tags: [custom voice, temporary voice, join to create, voice hub, private voice, voice channels, lock, bitrate, user limit, 自定义语音, 临时语音, 加入即创建, 语音枢纽, 私密语音, 语音频道, 锁定, 比特率, 人数上限]
related: [administration, statchannels]
---

## 功能介绍

工作人员将一个语音频道设为枢纽。成员加入该频道时，机器人会为其创建一个新的语音频道，名称来自模板，放入已设置的分类中，并将该成员移入其中。该成员即为此频道的所有者：他们可以重命名频道、设置人数上限和比特率、锁定频道使其只允许指定成员加入、允许或拒绝特定的人、保持频道常驻，或将频道转让给他人。

最后一名真人离开后，频道会在短暂超时后被删除，除非所有者开启了 **保持频道常驻**。如果所有者离开，而频道中仍有其他人，则这些人可以认领该频道。

成员可以保存自己的频道偏好，因此他们创建的每个频道都会以自己偏好的名称、人数上限、比特率、锁定状态和保持常驻设置开始。工作人员可以决定成员能够使用哪些自定义功能，为人数上限和比特率设置上限，并指定一个可以管理任何自定义频道的管理员身份组。

## 为什么要使用它

- 不必再维护一排“游戏 1”到“游戏 8”的频道；成员需要时自行创建，用完后自动消失。
- 需要私密通话的成员可以锁定频道，只允许好友加入。
- 主播和活动主持人可以让频道保持常驻，即使他们暂时离开，频道也不会消失。
- 拥有管理员身份组的版主无需在整个服务器上拥有 管理频道 权限，即可重命名、锁定或转让任何频道。

## 枢纽

`setupvoicehub` 会在新建的“Custom Voice Channels”分类中创建一个名为 "Create Voice Channel" 的语音频道，允许所有人连接但不能说话，并将其注册为枢纽。`setvoicehub #channel [category]` 则使用你已有的频道。仪表板中的 **基础配置** 分区也可以通过频道和分类选择器完成同样的设置。

如果 **允许每位用户创建多个频道** 处于关闭状态（默认），那么当你已拥有一个频道时再次加入枢纽，旧频道会先被删除，然后再创建新频道。

## 频道命名

**默认名称格式** 是一个模板。机器人会将 `{0}` 替换为成员的用户名，将 `{1}` 替换为其 discriminator，将 `{2}` 替换为服务器名称。默认值为 `{0}'s Channel`。名称会被截断，以符合 Discord 的限制。

> [!NOTE]
> 仪表板的占位提示文字显示的是 `{username}'s Channel`，但机器人只会替换 `{0}`、`{1}` 和 `{2}`。请使用带编号的形式。

## 所有者控制

`voicecontrols` 会为你所在的频道发布一个控制面板，显示当前的名称、人数上限、比特率、锁定和保持常驻状态，以及频道内的成员。面板上的按钮包括 **重命名**、**人数上限**、**比特率**、**锁定**/**解锁**、保持常驻、**转让**，以及用于管理频道内成员的成员选择器。服务器已关闭的自定义功能，对应按钮会被禁用。

上述操作同样可以通过命令完成，每个命令都会检查你是否在自定义频道中、是否为该频道的所有者或拥有管理员身份组，以及服务器是否允许该自定义功能：

| 操作 | 命令 | 作用 |
| --- | --- | --- |
| 重命名 | `voicerename <name>` | 重命名频道，需开启 **允许自定义名称** |
| 人数上限 | `voicelimit <n>` | 设置人数上限，受服务器最大人数上限限制 |
| 比特率 | `voicebitrate <kbps>` | 设置比特率，受服务器最大比特率限制 |
| 锁定 | `voicelock [true/false]`、`voiceunlock` | 锁定后，除允许的成员、所有者和管理员身份组外，其他人无法加入 |
| 允许 | `voiceallow @user` | 即使频道已锁定，也允许该成员加入 |
| 拒绝 | `voicedeny @user` | 取消该成员的连接权限，若其在频道内则将其断开 |
| 保持常驻 | `voicekeepalive [true/false]` | 使该频道不会被空频道清理 |
| 转让 | `voicetransfer @user` | 将所有者转给其他成员，并将管理权限覆盖转移给对方 |
| 认领 | `voiceclaim` | 当所有者不在频道中时，频道内的任何成员都可以获取所有权 |

开启 **自动管理频道权限** 后，所有者在其频道中会获得 连接、发言、管理频道、移动成员、禁言成员 和 拒绝成员收听 权限；被允许和被拒绝的成员会获得相应的权限覆盖；管理员身份组则获得管理权限。

## 清理

开启 **频道为空时删除**（默认开启）后，若频道中已没有真人，该频道会在空频道超时时间后被安排删除。在计时器结束前重新加入，即可取消删除。标记为保持常驻的频道永远不会被自动删除。后台每五分钟还会执行一次扫描，删除空置时间超过超时时间的频道。仪表板中的 **清理不活跃频道** 按钮则会删除超过你指定小时数未活动的频道。

## 成员偏好

`voicepreferences` 会显示你保存的名称格式、人数上限、比特率、锁定和保持常驻偏好。每个 `voiceprefs...` 命令用于设置其中一项，不带参数运行即可清除该项，`voiceprefsreset` 则会全部清除。只有在开启 **记住用户偏好** 时，偏好才会生效；人数上限和比特率仍受服务器最大值限制。工作人员可以在 **用户偏好** 标签页中通过用户 ID 查看和编辑任何成员的偏好。

## 设置

仪表板包含三个标签页：**配置**、**活跃频道** 和 **用户偏好**。**配置** 又分为 **基础配置**、**频道默认设置** 和 **频道管理**。`voiceconfig` 不带参数时会显示所有值；`voiceconfig <setting> <value>` 则用于修改某一项。

| 设置 | 默认值 | 作用 |
| --- | --- | --- |
| 枢纽语音频道 | 无 | 加入即创建的频道 |
| 分类 | 无 | 新频道的创建位置 |
| 默认名称格式 | `{0}'s Channel` | 新频道名称的模板（`nameformat`） |
| 默认用户人数上限 | 0（无限制） | 初始人数上限（`userlimit`） |
| 默认比特率 | 64 kbps | 初始比特率（`bitrate`） |
| 频道为空时删除 | 开 | 删除无人的频道（`deleteempty`） |
| 空频道超时 | 1 | 空频道被删除前的延迟（`emptytimeout`）；仪表板中以秒为单位，可设置 5 到 300 |
| 允许每位用户创建多个频道 | 关 | 允许一名成员拥有多个频道（`multiplechannels`） |
| 记住用户偏好 | 开 | 应用已保存的成员偏好（`persistpreferences`） |
| 自动管理频道权限 | 开 | 设置所有者、允许、拒绝和管理员的权限覆盖（`autopermission`） |
| 允许自定义名称 | 开 | `namechange` |
| 允许自定义人数上限 | 开 | `limitchange` |
| 允许自定义比特率 | 开 | `bitratechange` |
| 允许锁定频道 | 开 | `locking` |
| 允许用户管理 | 开 | 允许和拒绝命令（`usermanagement`） |
| 最大人数上限 | 99 | 成员可设置人数上限的上限（`maxuserlimit`） |
| 最大比特率 | 96 kbps | 成员可设置比特率的上限，同时也受服务器助力等级限制（`maxbitrate`） |
| 管理员身份组 | 无 | 可管理任何自定义频道的身份组（`adminrole`） |

**最大人数上限**、**最大比特率** 和 **管理员身份组** 在仪表板中没有对应控件，需使用 `voiceconfig` 设置。

**活跃频道** 标签页会列出所有正在运行的自定义频道，包括其所有者、锁定和保持常驻状态，并可以锁定、解锁或删除某个频道。该标签页还会显示已创建、最近一小时内活跃、已锁定和保持常驻的频道总数。页面上还有 **清理不活跃频道** 按钮，以及 **禁用自定义语音** 按钮，后者会为该服务器关闭此模块。

## 设置步骤

1. 在你打算使用的分类中，授予机器人 管理频道、移动成员 和 管理身份组 权限（后者用于写入权限覆盖）。
2. 执行 `setupvoicehub`，或在仪表板中打开 **自定义语音**，并在 **基础配置** 中选择已有的枢纽频道和分类。
3. 在 **频道默认设置** 中设置 **默认名称格式**、**默认用户人数上限** 和 **默认比特率**。
4. 在 **频道管理** 中，关闭你不希望成员拥有的自定义功能。
5. 使用 `voiceconfig adminrole @Moderators` 设置 **管理员身份组**，以便工作人员可以管理非自己拥有的频道。
6. 自己加入枢纽，执行 `voicecontrols`，然后尝试重命名和锁定该频道。

## 命令

使用服务器的前缀运行这些命令（如果你未更改，则为 `.`）。

| 命令 | 别名 | 所需权限 | 用途 |
| --- | --- | --- | --- |
| `setupvoicehub` | `svh`, `createvoicehub`, `voicesetup` | 管理频道 | 创建枢纽频道和分类 |
| `setvoicehub <#channel> [category]` | `sethub`, `voicehub` | 管理频道 | 将已有频道设为枢纽 |
| `voiceconfig [setting] [value]` | `vcconfig`, `voicesettings`, `vcsettings`, `customvoiceconfig` | 管理频道 | 显示或修改服务器设置 |
| `voicecontrols` | `vcontrols` | 所有者或管理员身份组 | 你所在频道的交互式控制面板 |
| `voicechannels` | `vchannels`, `listvoice`, `customvoices`, `voicelist` | 无 | 列出活跃的自定义频道 |
| `voicerename <name>` | `vrename`, `renamevoice`, `vcname`, `vcrename` | 所有者或管理员身份组 | 重命名你的频道 |
| `voicelimit <number>` | `vclimit`, `limitvoice`, `vlimit`, `setlimit` | 所有者或管理员身份组 | 设置人数上限 |
| `voicebitrate <kbps>` | `vcbitrate`, `vbitrate`, `setbitrate` | 所有者或管理员身份组 | 设置比特率 |
| `voicelock [true/false]` | `vclock`, `lockvoice`, `vlock`, `lockvc` | 所有者或管理员身份组 | 锁定或解锁 |
| `voiceunlock` | `vcunlock`, `unlockvoice`, `vunlock`, `unlockvc` | 所有者或管理员身份组 | 解锁 |
| `voiceallow @user` | `vcallow`, `allowuser`, `vallow`, `adduser` | 所有者或管理员身份组 | 允许成员加入已锁定的频道 |
| `voicedeny @user` | `vcdeny`, `denyuser`, `vdeny`, `removeuser` | 所有者或管理员身份组 | 禁止成员加入并将其断开 |
| `voiceclaim` | `vcclaim`, `claimvoice`, `vclaim`, `takeover` | 无 | 接管所有者已离开的频道 |
| `voicetransfer @user` | `vctransfer`, `transfervoice`, `vtransfer`, `givevc` | 所有者或管理员身份组 | 将频道转让给他人 |
| `voicekeepalive [true/false]` | `vckeepalive`, `keepvoice`, `vkeep`, `persist` | 所有者或管理员身份组 | 使频道免于清理 |
| `voicepreferences` | `vcprefs`, `voiceprefs`, `vprefs`, `myvoice` | 无 | 显示你保存的偏好 |
| `voiceprefsname [format]` | `vcprefsname`, `vpname`, `prefname`, `namepref` | 无 | 偏好的名称格式，留空即清除 |
| `voiceprefslimit [number]` | `vcprefslimit`, `vplimit`, `preflimit`, `limitpref` | 无 | 偏好的人数上限 |
| `voiceprefsbitrate [kbps]` | `vcprefsbitrate`, `vpbitrate`, `prefbitrate`, `bitratepref` | 无 | 偏好的比特率 |
| `voiceprefslock [true/false]` | `vprefslock` | 无 | 创建的频道默认锁定 |
| `voiceprefskeepalive [true/false]` | `vcprefskeepalive`, `vpkeepalive`, `prefkeepalive`, `keeppref` | 无 | 创建的频道默认保持常驻 |
| `voiceprefsreset` | `vcprefsreset`, `vprefsreset`, `resetprefs`, `clearprefs` | 无 | 清除所有偏好 |

## 提示与注意事项

- 机器人需要在分类中拥有 管理频道 权限，需要 移动成员 权限以便将创建者移入新频道，并需要 管理身份组 权限以写入权限覆盖。
- 比特率上限会被限制在服务器助力等级允许的范围内，因此在未助力的服务器上设置为 384 会被自动降低。
- 锁定会拒绝 @everyone 身份组的连接权限。拥有 管理员 权限，或拥有明确连接允许的身份组的成员，仍然可以加入。
- 最后一名成员离开时启动的空频道计时器，会把超时值当作秒处理，而配置显示和五分钟扫描则将其当作分钟处理。默认值为 1 时，频道变空后几乎会立即消失。
- 保持常驻的频道永远不会被自动清理。若要找到被遗忘的频道，请使用 **活跃频道** 标签页或 `voicechannels`。
- 只有在原所有者未连接到该频道时，才能认领频道。
