---
title: Patreon
slug: patreon
summary: 连接 Patreon 赞助计划，为赞助者分配与其档位相符的 Discord 身份组，并每月发布附带实时赞助者和收入数据的感谢公告。
icon: fa-heart
category: Community
dashboard: /dashboard/patreon
module: Patreon
tags: [patreon, supporters, patrons, donations, premium, tier roles, role sync, announcement, oauth, 赞助者, 赞助, 捐赠, 高级, 档位身份组, 身份组同步, 公告, 授权]
related: [administration, utility]
---

## 功能简介

拥有 Patreon 赞助计划的服务器拥有者，可以通过登录创作者账号将其与机器人关联。之后，机器人会拉取该计划的档位和赞助者，保持数据同步，并根据每位赞助者的承诺金额分配 Discord 身份组。如果 Patreon 知道某位赞助者的 Discord 账号，关联会自动完成；否则工作人员可以手动将成员与 Patreon 用户关联。

每月的指定日期，机器人可以在某个频道发布公告，感谢赞助者。公告可以是纯文本或嵌入消息，并可包含实时数据，例如当前赞助者数量、每月收入以及本月新加入的人数。此外，还有一个认可命令，可以为过去一周内成为赞助者的人发布致谢。

仪表板涵盖完整流程：连接、查看赞助者和档位、映射档位与身份组，以及编辑公告设置。命令涵盖相同的内容，并可在聊天中查看统计数据和排行榜。

## 适用场景

- 赞助者应当获得有颜色的身份组，并能访问仅限赞助者的频道，而无需工作人员手动核对 Patreon。
- 当有人升级、降级或停止赞助时，档位身份组应自动变更。
- 你希望定期发布“感谢 40 位赞助者”之类的公告，并且数字始终准确，无需手动修改。
- 工作人员希望直接在 Discord 中快速查看谁是赞助者以及他们的等级。

## 连接赞助计划

连接使用 Patreon 的 OAuth 流程。仪表板中的 **连接你的 Patreon** 卡片，或仅限机器人拥有者使用的 `patreonsync` 命令，会生成一个“使用 Patreon 授权”的链接。使用拥有该赞助计划的账号登录，批准所请求的权限，Patreon 随后会将你带回仪表板的 Patreon 页面。机器人会用授权码换取令牌，保存找到的第一个赞助计划，并立即对档位和赞助者执行完整同步。

你使用的账号必须拥有一个赞助计划。如果没有，回调会失败并提示 "No Patreon campaigns found for this user"。

仪表板的 **概览** 选项卡会显示连接状态，包括 **赞助计划 ID**、**上次同步** 和 **令牌过期时间**，以及活跃 **赞助者**、每月 **收入** 和 **赞助计划创建者** 的汇总卡片。令牌过期时会自动刷新；同一选项卡中的 **快速操作** 包括 **同步所有数据**、**同步身份组**、**发送公告** 和 **重新登录**。重新登录会断开赞助计划的连接：它会清除令牌，但保留你的频道、消息和映射设置，方便你重新连接。页面标题处还有 **刷新数据** 和 **同步赞助者** 按钮。

> [!NOTE]
> Patreon 集成需要由机器人的托管方启用。如果机器人没有配置 Patreon 客户端 ID，连接按钮和 `patreonsync` 会提示该集成未配置。

## 赞助者与同步

一次同步会获取赞助计划中的每位成员，包括其承诺金额、状态，以及在赞助者已将 Discord 连接到 Patreon 的情况下其 Discord 用户 ID。被 Patreon 标记为活跃或拥有当前承诺金额的赞助者会被视为活跃赞助者。**赞助者** 选项卡会列出他们的 **名称**（如果 Patreon 提供，还会显示邮箱）、**赞助金额**、**加入时间** 和 **状态**；页面顶部的 **同步赞助者** 按钮可刷新列表。

`patreonsupporters` 会在聊天中显示最多 15 位活跃赞助者及其赞助金额和 Discord 提及；`patreontop [count]` 按赞助金额对前 1 到 20 位进行排名；`patreonstats` 汇总赞助者数量、已关联数量、总收入和平均收入以及档位数量；`patreonanalytics` 会额外提供已停止赞助者、累计收入、本月新增赞助者和档位分布。

如果 Patreon 一侧没有关联某位赞助者的 Discord 账号，可以使用 `patreonlink @member <patreonUserId>` 手动关联。Patreon 用户 ID 是该赞助者 Patreon 账号的数字 ID；仪表板的赞助者列表不显示该 ID。

## 档位与身份组映射

每个 Patreon 档位都可以映射到一个 Discord 身份组。在 **档位映射** 选项卡中，选择 **Patreon 档位** 和 **Discord 身份组** 后保存即可。**可用档位** 列表会显示每个已发布档位的价格，以及是否已映射。在聊天中，`patreontiermap <tierId> @role` 可完成相同操作；档位 ID 可通过 `patreonroles` 获取。

身份组同步默认关闭，需要使用 `patreonrolesync` 或勾选 **启用身份组同步** 复选框来开启。开启后，机器人会判断每位赞助者应拥有哪个身份组：即其承诺金额覆盖的、价格最高的已映射档位。赞助者持有的其他已映射 Patreon 身份组会被移除，并添加目标身份组。停止赞助的人会失去所有已映射身份组。

成员关联时以及你运行 `patreonsyncall` 或仪表板中的同步身份组操作时，都会执行同步。只有拥有已知 Discord ID 的赞助者才能被同步。

> [!PERMISSION]
> 机器人需要 **管理身份组** 权限，并且其身份组必须高于所有已映射的身份组。位于机器人身份组之上的身份组会被跳过。

## 每月公告

使用 `patreonch #channel` 或 **公告频道** 选择器设置频道，使用 `patreonday <1..28>` 或 **公告日（1-28）** 设置日期。日期上限为 28，因此二月也不会被跳过。在运行 `patreontoggle` 或勾选 **启用公告** 之前，公告功能默认关闭。

机器人每小时检查一次。到达所选日期时，如果本月尚未发布过公告，它就会发布并记录时间。如果机器人在当天处于离线状态，只要该日期在本月已经过去，它会在启动时补发。`patreonannounce` 会立即发布一条公告，且同样计入本月的发布次数。

如果没有自定义消息，机器人会发布默认的感谢内容，其中包含活跃赞助者数量和每月收入。你可以使用 `patreonmsg <text or embed code>` 或仪表板中的公告消息编辑器来设置自己的内容。文本会经过嵌入解析器处理。使用 `-` 可恢复为默认内容。

### 占位符

这些占位符可与常规的服务器和频道占位符一起用于公告消息。

| 占位符 | 值 |
| --- | --- |
| `%month%` | 当前月份名称 |
| `%year%` | 当前年份 |
| `%patreon.link%` | `https://patreon.com` |
| `%supporter.count%` | 活跃赞助者数量 |
| `%supporter.total%` | 有记录以来的全部赞助者数量 |
| `%supporter.new%` | 本月新增赞助者 |
| `%supporter.former%` | 已停止赞助的人 |
| `%supporter.linked%` | 已关联 Discord 账号的赞助者 |
| `%revenue.monthly%` | 当前每月承诺金额 |
| `%revenue.average%` | 平均承诺金额 |
| `%revenue.lifetime%` | 累计收入 |
| `%growth.new%` | 本月新增赞助者 |
| `%top.supporter.name%` | 承诺金额最高的赞助者 |
| `%top.supporter.amount%` | 其承诺金额 |
| `%patron.name%` | 承诺金额最高的赞助者，与 `%top.supporter.name%` 相同 |
| `%patron.tier%` | 该赞助者所在的档位；如果 Patreon 未报告，则显示 "Unknown" |
| `%patron.amount%` | 其每月承诺金额，与 `%top.supporter.amount%` 相同 |
| `%tiers.count%` | 档位数量 |
| `%tier.popular%` | 赞助者最多的档位 |
| `%tier.popular.count%` | 该档位的赞助者人数 |
| `%supporters.summary%` | 关于赞助者数量的现成句子 |
| `%revenue.summary%` | 关于收入的现成句子 |
| `%growth.summary%` | 关于增长情况的现成句子 |

> [!EXAMPLE]
> `It's %month%! Thanks to %supporters.summary%%revenue.summary%!%growth.summary%` 会渲染为 "It's December! Thanks to our 25 incredible supporters who help us raise $150/month! We gained 3 new supporters this month!"

## 认可新赞助者

`patreonrecognize [#channel]` 会为过去七天内开始赞助的赞助者发布欢迎嵌入消息，每次运行最多 5 位，发送到指定频道，未指定时发送到当前频道。这是手动命令，而非定时任务，因此请在同步后运行。连续运行两次会重复发送相同的人。

## 设置

仪表板中有四个选项卡：**概览**、**赞助者**、**档位映射** 和 **配置**。

| 设置 | 默认值 | 作用 |
| --- | --- | --- |
| 公告频道 | 无 | 每月公告的发布位置；为空则禁用公告 |
| 公告日（1-28） | 无 | 每月发布公告的日期；未设置时公告不会触发 |
| 公告消息 | 内置感谢内容 | 可使用上述占位符的自定义文本或嵌入消息 |
| 启用公告 | 关闭 | 是否发送每月公告 |
| 启用身份组同步 | 关闭 | 是否将已映射的身份组应用于赞助者 |
| 档位映射 | 无 | 每个档位授予哪个身份组 |

## 设置流程

1. 在仪表板中打开 **Patreon**，点击连接按钮。使用赞助计划所有者的账号登录，并批准授权。
2. 等待首次同步完成，然后在 **赞助者** 选项卡中确认你的赞助者已显示。
3. 在 **档位映射** 中为每个档位映射身份组。请先创建身份组，并将机器人的身份组放在它们上方。
4. 勾选 **启用身份组同步**，然后运行 `patreonsyncall`，为所有已关联的成员应用身份组。
5. 在 **配置** 中选择 **公告频道** 和 **公告日**，使用占位符编写消息，并勾选 **启用公告**。
6. 运行一次 `patreonannounce`，在频道中查看效果。

## 命令

请使用你服务器的前缀运行这些命令（如果你没有修改，默认为 `.`）。

| 命令 | 别名 | 所需权限 | 用途 |
| --- | --- | --- | --- |
| `patreonsync` | `ptsync` | 机器人拥有者 | 发送 OAuth 授权链接 |
| `patreonch [#channel]` | `ptch` | 管理员 | 查看或设置公告频道 |
| `patreondisable` | `ptdisable` | 管理员 | 清除频道，禁用公告 |
| `patreonmsg [text]` | `ptmsg` | 管理员 | 查看或设置公告消息，输入 `-` 可重置 |
| `patreonday [day]` | `ptday` | 管理员 | 查看或设置每月的日期 |
| `patreontoggle` | `pttoggle` | 管理员 | 开启或关闭公告 |
| `patreonconfig` | `ptconfig` | 管理员 | 显示状态、频道、日期、消息和上次发布情况 |
| `patreonannounce` | `ptannounce` | 管理员 | 立即发送公告 |
| `patreonhelp` | `pthelp` | 无需权限 | 占位符列表和命令概览 |
| `patreonsupporters` | `ptsupporters` | 管理员 | 列出活跃赞助者 |
| `patreontop [count]` | `pttop` | 无需权限 | 按承诺金额列出热门赞助者 |
| `patreonstats` | `ptstats` | 管理员 | 赞助者和收入摘要 |
| `patreonanalytics` | `ptanalytics` | 管理员 | 详细分析 |
| `patreonlink <user> <patreonUserId>` | `ptlink` | 管理员 | 将成员与 Patreon 用户关联 |
| `patreonrolesync` | `ptrolesync` | 管理身份组 | 切换自动身份组同步 |
| `patreontiermap <tierId> <role>` | `pttiermap` | 管理身份组 | 将档位映射到身份组 |
| `patreonroles` | `ptroles` | 管理员 | 列出档位及其 ID 和身份组 |
| `patreonsyncall` | `ptsyncall` | 管理身份组 | 为每位已关联的赞助者应用身份组 |
| `patreonrecognize [#channel]` | `ptrecognize` | 管理员 | 感谢过去七天内的赞助者 |

## 技巧与注意事项

- 只有在 Patreon 个人资料中连接了 Discord，或通过 `patreonlink` 关联的赞助者，才能获得身份组。
- 身份组同步每位赞助者只分配一个身份组，即其承诺金额所覆盖的最高档位。不支持叠加多个档位身份组。
- 公告每个自然月最多发布一次。如果你在 3 日运行了 `patreonannounce`，那么当月 15 日的定时公告将被跳过。
- 公告日期以 UTC 计算。
- 每月公告针对的是整个赞助计划，因此 `%patron.name%`、`%patron.tier%` 和 `%patron.amount%` 描述的是承诺金额最高的活跃赞助者，而不是逐一对应每位赞助者。如需逐一致谢赞助者，请使用 `patreonrecognize`。
- 使用不同的 Patreon 账号重新连接会切换赞助计划，但会保留旧的映射，因此请之后检查 **档位映射** 选项卡。
