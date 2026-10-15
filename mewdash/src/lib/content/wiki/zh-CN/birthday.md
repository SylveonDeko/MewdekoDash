---
title: 生日
slug: birthday
summary: 成员在个人资料中设置生日并选择加入，机器人会在频道中发布生日祝福，还可以选择发放临时生日身份组并提醒某个身份组。
icon: fa-birthday-cake
category: Community
dashboard: /dashboard/birthday
module: Birthday
tags: [birthday, birthdays, bday, celebrate, birthday role, announcement, timezone, age, profile, 生日, 祝福, 生日身份组, 公告, 时区, 年龄, 个人资料]
related: [utility, administration]
---

## 功能介绍

成员只需使用一次 `setbirthday` 设置生日，然后在已开启此功能的任何服务器中运行 `birthdayannouncements`。每天，机器人会检查哪些成员过生日，在公告频道中发布消息，并可以发放为期 24 小时的生日身份组。如果设置了提醒身份组，它会被提及并放在消息前面。

生日存储在成员的机器人个人资料中，而不是按服务器存储，因此一次 `setbirthday` 即可覆盖该成员与机器人所在的所有服务器。某个生日是否会在特定服务器中公告，取决于三个条件：成员已选择加入、其个人资料不是私密的，并且其生日显示模式不是禁用。

任何人都可以使用 `birthdaytoday` 查看今天谁在庆生，使用 `birthdaylist` 查看即将到来的生日。除非成员选择了隐藏年份的显示模式，否则年龄会显示在名字旁边。

员工可以在仪表板的 **生日**（生日）页面或使用 `birthday*` 命令配置频道、身份组和消息。

## 为什么要使用它

- 社区服务器希望每天发布一条"生日快乐"的消息，而无需有人手动记录日期。
- 为成员发放为期一天的彩色生日身份组，让他们在聊天中更加醒目。
- 提醒一个"生日小队"身份组，确保人们真的会看到公告。
- 让成员选择生日的公开程度，甚至可以完全隐藏。

## 谁会被公告

只有同时满足以下所有条件的成员，才会被包含在公告和列表中：

| 要求 | 成员如何控制 |
| --- | --- |
| 已设置生日 | `setbirthday <date>` |
| 已选择加入公告 | `birthdayannouncements` 用于切换，默认关闭 |
| 个人资料不是私密的 | 在个人资料中使用 `setprivacy public` |
| 显示模式不是 Disabled（禁用） | `setbirthdayprivacy <mode>` |

该检查针对服务器中当前的成员进行，因此已离开服务器的人不会被公告。

### 生日显示模式

`setbirthdayprivacy` 接受以下值之一。它会影响列表、个人资料和 `birthdaytoday` 中显示的内容。

| 模式 | 效果 |
| --- | --- |
| `Default` | 显示完整日期，列表中显示年龄 |
| `MonthOnly` | 仅显示月份，隐藏年龄 |
| `YearOnly` | 仅显示年份，仍显示年龄 |
| `MonthAndDate` | 显示月份和日期，隐藏年龄 |
| `Disabled` | 隐藏生日，且永不公告 |

## 每日检查的工作方式

该服务每小时运行一次，并将每位成员的生日月份和日期与 UTC 时区的今天进行比较。在新的 UTC 日中，第一次发现有生日的运行会发布这些生日消息，并将该服务器标记为当天已完成，因此不会重复发布。

只有在 **公告**（公告）功能开启且已设置频道时，才会发布公告。使用 `birthdaychannel` 或在仪表板中设置频道，会自动为你开启该功能。

时区会被存储，但每日检查目前不使用它。`birthdaytimezone` 和 **服务器时区**（服务器时区）设置会被接受，并显示在配置嵌入中，但公告仍按 UTC 日发出。

## 生日身份组

当 **生日身份组**（生日身份组）已启用且已设置身份组时，每位被公告的成员会在公告时获得该身份组，并在 24 小时后移除。移除计时器存储在内存中，因此如果机器人在当天重启，身份组会保留，直到有人将其移除。

机器人需要拥有 Manage Roles（管理身份组）权限，并且其最高身份组必须位于生日身份组之上。

## 公告消息

默认消息为 `Happy Birthday %user.mention%!`，周围带有庆祝表情。你可以使用 `birthdaymessage` 或仪表板上的 **生日消息**（生日消息）编辑器将其替换。文本会经过嵌入解析器处理，因此嵌入构建器生成的任何内容都可以使用；如果启用了提醒，提醒身份组的提及会被添加到最前面。

### 占位符

消息支持占位符页面中的通用用户、服务器、频道和机器人占位符，另外还有一个与生日相关的值。

| 占位符 | 值 |
| --- | --- |
| `%user.mention%` | 提及过生日的成员 |
| `%user.name%` | 其用户名 |
| `%user.avatar%` | 其头像链接 |
| `%server.name%` | 服务器名称 |
| `%birthday.age%` | 即将满的年龄，或 `Unknown` |

> [!WARNING]
> 请使用 `%user.mention%`，而不是 `{user}`。文本命令帮助中提到了 `{user}`，但在发布的公告中只会替换 `%...%` 形式的占位符。

## 设置

所有设置都位于仪表板的 **生日** 页面下，分为三个标签页：**配置**（配置）、**用户**（用户）和 **统计**（统计）。

**配置** 包含基本设置、消息编辑器，以及 **生日功能**（生日功能）面板，其中每个功能都有一个开关。

| 设置 | 默认值 | 作用 |
| --- | --- | --- |
| Channel（频道） | 无 | 公告发布的位置 |
| Birthday Role（生日身份组） | 无 | 生日当天授予的身份组，为期 24 小时 |
| Ping Role（提醒身份组） | 无 | 在每条公告前提及的身份组 |
| Server Timezone（服务器时区） | UTC | 为服务器存储，显示在配置嵌入中 |
| Reminder Days Before Birthday（生日前提醒天数） | 0 | 0 至 30；已存储，但尚未发送提醒 |
| Birthday Message（生日消息） | 默认嵌入 | 公告内容，使用上述占位符 |

| 功能开关 | 默认值 | 作用 |
| --- | --- | --- |
| Announcements（公告） | 关 | 每天在频道中发布消息 |
| Birthday Role（生日身份组） | 关 | 分配临时身份组 |
| Reminders（提醒） | 关 | 占位开关；目前不会发送任何内容 |
| Ping Role（提醒身份组） | 关 | 在公告中提及提醒身份组 |
| Timezone Support（时区支持） | 关 | 占位开关；检查仍按 UTC 进行 |

**用户** 显示未来 7、14 或 30 天内的 **即将到来的生日**（即将到来的生日），以及一个 **All Users**（所有用户）列表，其中列出了所有已设置生日的成员，并将今天的生日高亮显示在页面顶部。**统计** 显示 **用户总数**（用户总数）、**已设置生日**（已设置生日）、**公开生日**（公开生日）和 **今日生日**（今日生日）。

> [!NOTE]
> 保存仪表板表单时，只会写入你填写过的值。要清除身份组或频道，请不带身份组使用 `birthdayrole` 或 `birthdaypingrole`，或使用 `/birthday config reset` 重置所有设置。

## 设置步骤

1. 在仪表板中打开 **生日**。
2. 在 **配置** 下选择公告的 **频道**，然后点击 **保存配置**（保存配置）。
3. 在 **生日功能** 面板中开启 **公告**。
4. 可选：选择 **生日身份组** 并启用 **生日身份组** 开关，以及选择 **Ping Role** 并启用 **Ping Role** 开关。
5. 可选：使用 `%user.mention%` 和 `%birthday.age%` 编写自己的 **生日消息**。
6. 告诉成员运行 `setbirthday`，然后运行 `birthdayannouncements` 以选择加入。
7. 检查 **用户** 标签页，确认他们出现在 **即将到来的生日** 下。

## 命令

使用服务器的前缀运行这些命令（如果你未更改，则为 `.`）。斜杠命令版本位于 `/birthday` 和 `/birthday config` 下。

| 命令 | 别名 | 所需权限 | 用途 |
| --- | --- | --- | --- |
| `setbirthday <date>` | | 无 | 在个人资料中设置你的生日，例如 `setbirthday 1998-04-12` |
| `setbirthdayprivacy <mode>` | | 无 | 选择上述显示模式之一 |
| `birthdayannouncements` | `bdayann` | 无 | 选择加入或退出公告 |
| `birthdaytimezone <zone>` | `bdaytz` | 无 | 存储你的时区，例如 `Europe/London` |
| `birthdaytoday` | `todaysbirthdays` | 无 | 列出今天庆生的成员 |
| `birthdaylist [days]` | `bdaylist`, `upcomingbirthdays` | 无 | 即将到来的生日，1 至 30 天，默认 7 天 |
| `birthdaychannel [#channel]` | `bdaychannel`, `bdaychan` | 管理员 | 设置公告频道并启用公告 |
| `birthdayrole [@role]` | `bdayrole` | 管理员 | 设置为期 24 小时的生日身份组，不带身份组则清除 |
| `birthdaypingrole [@role]` | `bdayping` | 管理员 | 设置要提及的身份组，不带身份组则清除 |
| `birthdaymessage [text]` | `bdaymsg` | 管理员 | 设置公告文本，或显示当前文本 |
| `birthdayconfig` | `bdaycfg` | 管理员 | 显示当前配置 |

`/birthday config reset` 会清除所有设置并关闭所有功能。它没有对应的文本命令。

## 技巧与注意事项

- 成员在运行 `birthdayannouncements` 之前不会被公告。请告知他们，否则不会有人出现。
- `setbirthday` 接受机器人能够解析为日期的任何内容。请使用不会产生歧义的格式，例如 `1998-04-12`。
- `birthdaytimezone` 只接受一份简短的固定列表，包含十六个时区，例如 `UTC`、`GMT`、`America/New_York`、`Europe/London`、`Asia/Tokyo`、`Asia/Kolkata`、`Australia/Sydney` 和 `Pacific/Auckland`。仪表板上的 **服务器时区** 下拉菜单也有一份类似的列表，包含十三个时区。
- 每日检查使用 UTC。与 UTC 相差较远的成员可能会提前或延后几个小时才收到公告。
- 机器人需要管理身份组权限才能分配生日身份组，并需要在公告频道中拥有发送消息和嵌入链接权限。
- `birthdayconfig` 会显示"提醒天数"字段和提醒功能。这些内容目前只会被存储，不会发送任何提醒。
- 目前没有删除已存储生日的命令。成员可以运行 `setbirthdayprivacy Disabled` 隐藏生日，或使用 `birthdayannouncements` 退出公告。
