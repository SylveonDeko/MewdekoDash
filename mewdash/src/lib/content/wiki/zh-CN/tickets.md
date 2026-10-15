---
title: 工单
slug: tickets
summary: 带按钮和选择菜单的支持工单面板，点击后打开私密频道，并提供认领、优先级、标签、案件、聊天记录和员工工具。
icon: fa-ticket
category: Community
dashboard: /dashboard/tickets
module: Tickets
tags: [tickets, support, help desk, panel, ticket panel, transcripts, cases, claim, priority, blacklist, modmail, 工单, 支持, 帮助台, 面板, 工单面板, 聊天记录, 案件, 认领, 优先级, 黑名单, 模邮]
related: [administration, chat-triggers, auditlog]
---

## 功能介绍

工单可以把一个频道变成帮助台。你发布一个面板，它是一条包含嵌入和一个或多个按钮或选择菜单的消息。成员点击按钮或选择某个选项后，机器人会为其创建一个私密文字频道，设置权限使只有该成员和你的支持身份组能看到它，并发送一条带有 **认领** 和 **关闭** 按钮的开场消息。

从成员的角度看：点击，可选地填写一个简短表单，然后会出现一个名称类似 `ticket-username-1` 的频道。成员在那里描述问题。工单关闭后，频道会被重命名为 `closed-...`、锁定，并根据你对该工单类型的设置，移入归档分类或在延迟后删除。

从员工的角度看：认领工单让大家知道由谁负责处理，设置优先级，添加标签，留下备注，将相关工单关联到案件中，然后关闭工单。每次关闭都可以将聊天记录保存到频道和仪表板中。仪表板还会显示响应时间和解决时间、各优先级的工单数量，以及按员工划分的视图。

每个按钮和每个选择菜单选项都是一个独立的工单类型，拥有各自的分类、身份组、数量限制、表单、开场消息和关闭行为。

## 为什么要使用它

- 支持服务器希望为成员提供私密的一对一频道，而不是公开的求助频道。
- 你有多个团队（账单、管理、合作），希望通过选择菜单将请求分配到正确的团队。
- 你需要一个带表单的管理员申请入口，并与普通支持分开。
- 你需要审计记录：聊天记录、员工备注，以及用于归类相关举报的案件。
- 你希望阻止特定成员开启任何工单。

## 面板、按钮和选择菜单

面板是某个频道中的一条消息。面板 ID 就是该消息的 ID。一个面板可以包含按钮、选择菜单，或两者兼有。

- **按钮**：每个按钮对应一个工单类型。每个按钮都有标签、可选的表情符号和样式（主要、次要、成功或危险）。
- **选择菜单**：一个菜单，包含占位文字和选项列表。每个选项都是一个工单类型，带有标签、描述和表情符号。菜单至少需要保留一个选项。

如果面板消息被删除，`checkpanels` 会列出缺失的面板，`recreatepanel` 或 `recreateallpanels` 会重新发布它们并更新存储的消息 ID。机器人也会监听面板消息的删除。

`ticketduplicatepanel` 会将面板及其所有组件复制到另一个频道。`ticketmovepanel` 则会将其移动。`ticketupdatepanel` 会用新的嵌入 JSON 替换嵌入内容。

### 工单类型设置

这些设置存在于每个按钮和每个选择菜单选项上。在仪表板中，添加或编辑按钮或选项时会显示这些设置。

| 设置 | 默认值 | 作用 |
| --- | --- | --- |
| 频道名称格式 | `ticket-{username}-{id}` | 所创建频道的名称；`{id}` 是成员的工单编号，最多 100 个字符 |
| 工单分类 | 无 | 频道所创建的分类 |
| 归档分类 | 无 | 工单关闭或归档后频道移入的分类 |
| 支持身份组 | 无 | 可以查看、发言和认领工单的身份组 |
| 可查看身份组 | 无 | 只能阅读、不能发送消息的身份组 |
| 最大活跃工单数 | 1 | 一名成员可同时拥有的该类型未关闭工单数量 |
| 自动关闭（小时） | 无 | 按类型保存，并显示在 `buttoninfo` 中 |
| 要求的响应时间（分钟） | 无 | 按类型保存，并显示在 `buttoninfo` 中 |
| 允许的优先级 | 全部 | 员工可为该类型设置的优先级 |
| 默认优先级 | 无 | 新工单开始时的优先级 |
| 保存记录 | 关 | 工单关闭时生成聊天记录 |
| 关闭时锁定 | 开 | 除支持身份组外，所有人都不能发送消息 |
| 关闭时重命名 | 开 | 在频道名称前添加 `closed-` 前缀 |
| 移除创建者 | 开 | 关闭时移除开启者的访问权限 |
| 关闭时删除 | 关 | 延迟后删除频道，而不是保留 |
| 删除延迟 | 5 分钟 | 开启“关闭时删除”后的删除等待时间；仪表板字段以秒为单位，`ticketclosebehavior` 以分钟为单位 |
| 关闭时自动归档 | 关 | 关闭工单时同时归档 |
| 归档时锁定 | 开 | 归档时将频道设为只读 |
| 归档时重命名 | 开 | 在频道名称前添加 `archived-` 前缀 |
| 移除创建者（归档） | 关 | 归档时移除开启者的访问权限 |
| 弹窗 | 无 | 工单创建前显示的表单 |
| 开场消息 | 默认嵌入 | 带占位符的自定义开场消息 |

### 表单（弹窗）

工单类型可以在创建频道前提出问题。使用 `setmodaltitle` 设置标题（默认为 "Create Ticket"），并使用 `addmodalfield` 添加字段。字段默认是简短且必填的；标签后的选项可以改变这一点：`paragraph` 表示多行，`optional` 表示可选，`min:X` 或 `max:X` 用于限制长度，上限为 4000。字段 ID 是标签转为小写、空格替换为下划线后的结果。

回答会与工单一起保存，并可在开场消息中以 `%modal.<fieldId>%` 的形式使用。

### 开场消息

默认情况下，机器人会发送一个标题为 "Support Ticket" 的嵌入，欢迎成员，显示工单 ID 和创建时间，并请对方描述问题。消息附带 Claim 和 Close 按钮。

你可以为每个工单类型替换为自己的文字或嵌入。使用仪表板中的嵌入构建器（**配置工单开场消息**）。此处可用的占位符如下：

| 占位符 | 值 |
| --- | --- |
| `%ticket.id%` | 工单编号 |
| `%ticket.channel%` | 工单频道的提及 |
| `%ticket.user%` | 开启者的用户名 |
| `%ticket.user.mention%` | 开启者的提及 |
| `%ticket.user.avatar%` | 开启者的头像链接 |
| `%ticket.user.id%` | 开启者的用户 ID |
| `%ticket.created%` | 工单创建时间 |
| `%modal.<fieldId>%` | 表单字段的回答 |

此消息不会应用通用占位符集，只会替换上述占位符。

## 工单开启时会发生什么

1. 被列入黑名单的成员会收到仅自己可见的拒绝消息。
2. 系统会统计该成员该类型的未关闭工单数，并与 **最大活跃工单数**（默认 1）进行比较。
3. 在工单分类中创建频道：拒绝 `@everyone`，允许开启者查看、发送、阅读历史、添加附件和嵌入链接；支持身份组获得相同权限并额外拥有管理消息权限；可查看身份组仅允许阅读。
4. 发送带有 Claim 和 Close 按钮的开场消息。
5. 如果设置了日志频道，会在其中发布一条“新工单”记录。
6. 向聊天触发器发布 **工单已开启** 事件。

## 认领、备注、优先级和标签

**认领**：支持身份组成员或管理员可通过按钮或 `ticketclaim` 认领工单。频道中会出现一条“由……认领”的嵌入。只有认领者或管理员可以取消认领。已关闭或已被认领的工单不能再次认领。

**备注**：`ticketnote` 会为当前工单添加员工备注。备注会与工单一同保存，并显示在仪表板中，同时在工单频道中以蓝色“已添加备注”嵌入发布，嵌入的页脚显示作者。

**优先级**是服务器范围内的定义，可通过 `ticketaddpriority` 创建，或在 **配置** 标签页中创建。每个优先级包含 ID、显示名称、表情符号、1 到 5 的等级、颜色、响应时间，以及 **通知员工** 开关。为工单设置优先级时，会以该颜色发布一条嵌入；若开关已开启，还会提醒支持身份组。工单类型可以限制允许使用的优先级。

**标签**是服务器范围内的标签，包含 ID、名称、描述和颜色。使用 `ticketaddtags` 和 `ticketremovetags` 并指定标签 ID，即可为工单添加或移除标签。仪表板会在每个工单上显示标签，并支持按标签搜索。

## 关闭、归档和聊天记录

关闭工单会将其标记为已关闭，并发布一条红色的“工单已关闭”嵌入。随后按以下顺序执行：

1. 如果该类型已开启 **保存记录**，并且已设置记录频道，则保存最近 5000 条消息，并在记录频道中发布带有 **查看记录** 链接的嵌入。该链接会在仪表板中打开聊天记录。
2. 如果该类型已开启自动归档，或你使用 `ticketclose true` 关闭，则归档工单（见下文）。
3. 否则执行关闭行为：重命名为 `closed-...`、移除开启者、锁定频道并保留支持身份组权限，然后要么移入归档分类，要么在开启 **关闭时删除** 后于频道中发出警告，并在删除延迟后安排删除。计划删除每分钟处理一次。

归档会将频道重命名为 `archived-...`，移入归档分类，对所有人设为只读，并将工单标记为已归档。`ticketarchive` 会直接对未关闭的工单执行此操作。如果频道已不存在，则仅将工单标记为已归档。

关闭工单还会向聊天触发器发布 **工单已关闭** 事件。

> [!NOTE]
> 只有当该类型已开启 **保存记录**，并且服务器设置了记录频道时，才会生成聊天记录。没有记录频道时，关闭仍会成功，但不会保存任何内容。

## 案件

案件可将属于同一事件的工单归为一组，例如针对同一人的多个举报。使用 `ticketcreatecase <title> <description>` 或在 **案件** 标签页中创建案件，然后使用 `ticketlinkcase <caseId>` 将当前工单关联到案件，使用 `ticketunlinkcase` 取消关联。案件有各自的备注，可以关闭和重新开启，也可以在仪表板或 `/tickets cases` 斜杠命令中编辑。

## 黑名单

`ticketblock @user [reason]` 会阻止成员开启工单。如果设置了日志频道，原因会被写入日志。`ticketunblock` 可解除拉黑。仪表板的 **高级** 标签页中有相同的 **黑名单管理** 区域，通过用户 ID 进行操作。

## 批量工具

- `ticketcloseinactive <hours>` 会关闭所有超过指定小时数无活动的未关闭工单，并在每个工单中发布“自动关闭”嵌入；如果该类型设置了归档分类，还会将其归档。仪表板 **高级** 标签页中的 **关闭不活跃工单** 也能执行相同操作。
- `ticketmoveall <source category> <target category>` 会在分类之间移动所有工单频道。

## 统计

`ticketstats` 会显示总数、未关闭和已关闭数量、平均响应时间（分钟）、平均解决时间（小时），以及按类型和优先级的细分。`ticketuserstats [@user]` 会显示单个成员的相同数据及其近期工单。**概览** 标签页显示响应时间、各优先级的工单数量以及员工表现。

## 设置

工单页面有六个标签页：**概览**、**工单**、**工单面板**、**配置**、**案件** 和 **高级**。

| 设置 | 默认值 | 作用 |
| --- | --- | --- |
| 记录频道 | 无 | 发布带链接的聊天记录摘要（配置） |
| 日志频道 | 无 | 记录工单创建和黑名单条目（配置） |
| 优先级 | 无 | 服务器范围内的优先级定义（配置） |
| 标签 | 无 | 服务器范围内的标签定义（配置） |
| 面板嵌入 | 标题为 "Support Tickets" | 面板消息，在嵌入编辑器中构建（工单面板） |
| 各类型设置 | 见上表 | 在每个按钮或选择菜单选项上设置（工单面板） |
| 黑名单 | 空 | 无法开启工单的成员（高级） |

**工单** 标签页会列出未关闭和已关闭的工单，可按工单、用户、频道或标签搜索。员工可在此认领、取消认领、设置优先级、添加或移除标签、添加员工备注、带原因关闭、归档以及打开聊天记录。

> [!PERMISSION]
> 机器人需要管理频道和管理身份组权限，才能创建工单频道并设置可见范围。其身份组必须能够查看工单分类和归档分类。

## 设置步骤

1. 创建一个用于未关闭工单的分类，并可选地创建一个用于已关闭工单的分类。创建一个记录频道和一个日志频道，且仅员工可见。
2. 在仪表板中打开 **工单**，进入 **配置**，设置 **记录频道** 和 **日志频道**。
3. 仍在 **配置** 中，至少创建一个优先级（例如 `urgent`，等级 5，开启通知员工），并按需创建标签。
4. 进入 **工单面板**，点击 **创建新面板**。选择频道并设计 **面板嵌入**。
5. 选中该面板并添加 **新建按钮**。设置标签、样式、**工单分类**、**归档分类**、**支持身份组**，并开启 **保存记录**。选择是将关闭的频道保留在归档分类中，还是开启 **关闭时删除** 并设置延迟。
6. 可选：打开弹窗构建器添加表单字段，并打开开场消息编辑器自定义欢迎语。
7. 如果希望在同一个下拉菜单中包含多种工单类型，请改为添加 **新建选择菜单**，并为每种类型添加一个选项，设置相同。
8. 用另一个账号打开一个测试工单，认领它，设置优先级，关闭它，然后检查记录频道。

在 Discord 中，`/tickets setup wizard #channel` 会按照模板（Basic Support、Department Support、Gaming Server、Business、Mod Applications）引导完成相同步骤。

## 命令

使用服务器的前缀运行这些命令（如果你未更改，则为 `.`）。面板 ID 即消息 ID；按钮、菜单和选项 ID 可通过 `panelinfo` 或 `ticketlistpanel` 查看。

| 命令 | 别名 | 所需权限 | 用途 |
| --- | --- | --- | --- |
| `ticketpanel <#channel> [embedJson]` | `tpanel` | 管理员 | 创建面板，可预览或通过提示创建 |
| `ticketpaneldelete <panelId> [force]` | `tpaneldelete` | 管理员 | 删除面板；`true` 可在仍有工单关联时强制删除 |
| `ticketupdatepanel <panelId> <embedJson>` | `tupdatepanel` | 管理员 | 替换面板嵌入 |
| `ticketmovepanel <panelId> <#channel>` | `tmovepanel` | 管理员 | 将面板移动到另一个频道 |
| `ticketduplicatepanel <panelId> <#channel>` | `tduplicatepanel` | 管理员 | 复制面板及其组件 |
| `panellist` | `plist` | 管理员 | 列出面板及组件数量 |
| `panelinfo <panelId>` | `pinfo` | 管理员 | 显示面板的按钮和菜单及其 ID |
| `ticketlistpanels` | `tlistpanels` | 管理频道 | 分页列出所有面板的详细信息 |
| `ticketlistpanel <panelId>` | `tlistpanel` | 管理频道 | 列出某个面板的所有组件及其设置 |
| `checkpanels` | `tcheckpanels` | 管理员 | 报告面板消息或频道缺失的情况 |
| `recreatepanel <panelId>` | `trecreate` | 管理员 | 重新发布缺失的面板 |
| `recreateallpanels` | `trecreateall` | 管理员 | 重新发布所有缺失的面板 |
| `setpaneltranscripts <panelId> <true or false>` | `sptranscripts` | 管理员 | 切换面板上所有按钮的聊天记录功能 |
| `ticketaddbutton <panelId> <label> [style] [emoji]` | `taddbtn` | 管理员 | 添加按钮 |
| `buttoninfo <buttonId>` | `binfo` | 管理员 | 显示按钮的设置 |
| `deletebutton <buttonId>` | `delbtn` | 管理员 | 删除按钮 |
| `ticketcategory <buttonId> [category]` | `tcat` | 管理员 | 设置或清除工单分类 |
| `ticketarchivecategory <buttonId> [category]` | `tarchivecat` | 管理员 | 设置或清除归档分类 |
| `ticketautoarchive <buttonId> [true or false]` | `tautoarchive` | 管理员 | 关闭时自动归档 |
| `ticketclosebehavior <buttonId> [autoArchive] [deleteOnClose] [lockOnClose] [renameOnClose] [deleteDelayMinutes]` | `tclosebehavior` | 管理员 | 一次性设置多个关闭行为 |
| `ticketautoclose <buttonId> [hours]` | `tautoclose` | 管理员 | 设置或清除自动关闭的小时数 |
| `setautoclose <buttonId> <hours>` | `sautoclose` | 管理员 | 与上一条相同 |
| `ticketresponsetime <buttonId> [minutes]` | `tresponsetime` | 管理员 | 设置或清除要求的响应时间 |
| `setresponsetime <buttonId> <minutes>` | `sresponsetime` | 管理员 | 与上一条相同 |
| `setmodaltitle <buttonId> <title>` | `smodaltitle` | 管理员 | 工单表单的标题 |
| `addmodalfield <buttonId> <label> [options]` | `addmfield` | 管理员 | 添加表单字段，选项如 `paragraph,optional,max:500` |
| `removemodalfield <buttonId> <fieldId>` | `removemfield` | 管理员 | 删除表单字段 |
| `listmodalfields <buttonId>` | `listmfields` | 管理员 | 列出表单字段 |
| `addselectmenu <panelId>` | `addsmenu` | 管理员 | 通过引导式提示添加选择菜单 |
| `addoption <menuId> <label> [description] [emoji]` | `addopt` | 管理员 | 为菜单添加选项 |
| `listoptions <menuId>` | `listopts` | 管理员 | 列出菜单的选项 |
| `removeoption <menuId> <value>` | `removeopt` | 管理员 | 按值确认选项（见注意事项） |
| `deleteselectoption <optionId>` | `delselectoption` | 管理员 | 删除选项；最后一个选项无法删除 |
| `setplaceholder <menuId> <text>` | `splaceholder` | 管理员 | 更改菜单的占位文字 |
| `deleteselectmenu <menuId>` | `delselectmenu` | 管理员 | 删除菜单及其选项 |
| `ticketclaim` | `tclaim` | 无 | 认领当前工单（支持身份组或管理员） |
| `ticketunclaim` | `tunclaim` | 无 | 释放你的认领（认领者或管理员） |
| `ticketclose [archive]` | `tclose` | 无 | 关闭当前工单；`true` 同时归档 |
| `ticketarchive` | `tarchive` | 管理频道 | 归档当前工单 |
| `ticketnote <text>` | `tnote` | 无 | 添加员工备注 |
| `ticketpriority <priorityId>` | `tpriority` | 无 | 设置当前工单的优先级 |
| `ticketaddtags <tagId...>` | `taddtags` | 无 | 为当前工单添加标签 |
| `ticketremovetags <tagId...>` | `tremovetags` | 无 | 从当前工单移除标签 |
| `ticketaddpriority <id> <name> <emoji> <level> <pingStaff> <responseTime> <color>` | `taddpriority` | 管理员 | 定义优先级，例如 `taddpriority urgent Urgent :fire: 5 true 00:15:00 red` |
| `ticketremovepriority <id>` | `tremovepriority` | 管理员 | 删除优先级定义 |
| `ticketaddtag <id> <name> <description> <color>` | `taddtag` | 管理员 | 定义标签 |
| `ticketremovetag <id>` | `tremovetag` | 管理员 | 删除标签定义 |
| `ticketcreatecase <title> <description>` | `tcreatecase` | 管理消息 | 创建案件 |
| `ticketlinkcase <caseId>` | `tlinkcase` | 管理消息 | 将当前工单关联到案件 |
| `ticketunlinkcase` | `tunlinkcase` | 管理消息 | 取消当前工单的案件关联 |
| `ticketblock @user [reason]` | `tblock` | 管理员 | 将成员加入黑名单 |
| `ticketunblock @user` | `tunblock` | 管理员 | 移出黑名单 |
| `tickettranscriptchannel [#channel]` | `ttranscriptch` | 管理员 | 设置或清除记录频道 |
| `ticketlogchannel [#channel]` | `tlogch` | 管理员 | 设置或清除日志频道 |
| `ticketcloseinactive <hours>` | `tcloseinactive` | 管理员 | 关闭超过该时长无活动的工单 |
| `ticketmoveall <category> <category>` | `tmoveall` | 管理员 | 在分类之间移动所有工单 |
| `ticketstats` | `tstats` | 无 | 服务器工单统计 |
| `ticketuserstats [@user]` | `tuserstats` | 无 | 成员的工单统计 |

斜杠命令位于 `/tickets` 下（创建面板、列出面板、认领、关闭、备注、归档、优先级、面板和设置分组、案件分组），`/tickets setup` 下则有（向导、快速按钮、快速菜单、从模板创建、模板）。

## 提示与注意事项

- 针对“当前工单”的命令只能在工单频道中使用。请在工单中运行，而不是在员工频道中运行。
- 每个工单类型都需要设置支持身份组，否则除管理员外无人能认领，且频道锁定后除开启者外无人能发言。
- 默认每名成员每种类型只能有一个未关闭工单。对于经常需要重复开单的类型，请提高 **最大活跃工单数**。
- **自动关闭（小时）** 和 **要求的响应时间** 会保存在该类型上，并显示在 `buttoninfo` 中，但机器人中唯一会关闭闲置工单的功能是 `ticketcloseinactive` 或 **关闭不活跃工单** 批量操作。如果需要自动清理，请自行定时运行。
- `removeoption` 目前只会报告成功；请使用 `deleteselectoption` 并指定选项 ID 来真正删除选项。
- **关闭时删除** 与 **关闭时锁定** 会相互影响：设置为删除的工单不会先被锁定，而是等待删除延迟结束。
- 面板嵌入 JSON 必须是有效的嵌入构建器输出。如果你更喜欢使用命令，请使用仪表板编辑器并复制 JSON。
- 删除仍有未关闭工单的面板会被拒绝，除非你传入 `true`，此时会清除工单与面板的关联。
- 聊天记录最多保存 5000 条消息，“View Transcript”链接会在仪表板中打开聊天记录。
