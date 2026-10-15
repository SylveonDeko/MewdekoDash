---
title: 个人资料
slug: userprofile
summary: 为每位成员提供可在任何地方显示的个人资料卡片，包含简介、代词、星座、生日、颜色、图片和 Switch 好友代码，并可控制他人能看到的内容。
icon: fa-user
category: Community
module: UserProfile
tags: [profile, bio, pronouns, pronoundb, zodiac, birthday, privacy, profile colour, profile image, switch friend code, stats opt out, greet dm opt out, 个人资料, 简介, 代词, 星座, 生日, 隐私, 个人资料颜色, 个人资料图片, Switch 好友代码, 统计退出, 欢迎私信退出]
related: [birthday, switch, afk, help]
---

## 功能简介

每位成员都有一份个人资料，它会跟随其所在的每个机器人服务器。运行 `profile` 会以嵌入消息的形式发布该资料：成员头像作为缩略图，简介作为描述，随后是代词、星座、生日、与机器人共同所在的服务器数量，以及（如已设置）其 Nintendo Switch 好友代码等字段。自定义颜色和底部的大图则让卡片更加完整。

成员可以通过几个 `set...` 命令填写个人资料，也可以在仪表板的 **我的设置** 页面中填写。个人资料与服务器无关：设置一次简介，它便会在所有地方显示相同的内容。

成员可以控制隐私。个人资料可以设为私密，使其只能由所有者查看；生日可以只显示月份，也可以完全隐藏；成员还可以选择退出命令统计和欢迎私信。

代词的处理略有不同。如果成员没有在机器人中设置代词，机器人会在 PronounDB 上查询。成员可以用自己的文字覆盖该结果，任何人也都可以向机器人所有者举报滥用的覆盖内容。

## 适用场景

- 成员希望有一张快速的“关于我”卡片，而无需专门的自我介绍频道。
- 社区中共享 Switch 好友代码的成员，可以将它们集中保存在一处，而不必置顶消息。
- 代词可以自动从 PronounDB 显示，大多数人无需手动输入。
- 工作人员在回复前可以使用 `pronouns @user` 查看某人的代词。
- 不希望收到欢迎私信或统计数据被收集的成员，可以自行关闭这些功能。

## 个人资料嵌入消息

不带参数的 `profile` 会显示你自己的个人资料。`profile @user` 会显示他人的资料，除非对方设为私密，此时机器人会回复该资料为私密。

| 嵌入消息的部分 | 来源 |
| --- | --- |
| 标题 | "Profile for" 加上用户名 |
| 颜色 | `setprofilecolor`，否则为机器人默认颜色 |
| 缩略图 | 成员的 Discord 头像 |
| 描述 | 来自 `setbio` 的简介（仅在设置后显示） |
| 代词 | 你的覆盖设置，否则为 PronounDB，否则为 "Unspecified" |
| 星座 | `setzodiac`，否则为 "Unspecified" |
| 生日 | `setbirthday`，按生日隐私模式显示，否则为 "Unspecified" |
| 共同机器人服务器 | 你和机器人同时所在的服务器数量 |
| Switch 好友代码 | 仅在设置后显示 |
| 图片 | 来自 `setprofileimage` 的 URL |

## 个人资料字段

### 简介

`setbio <text>` 最多接受 2048 个字符。超出的文字会被拒绝。没有清除命令；如果想清空简介，可以设置一个简短内容，例如单个句号。

### 星座

`setzodiac <sign>` 接受十二个西方星座之一：Aries、Taurus、Gemini、Cancer、Leo、Virgo、Libra、Scorpio、Sagittarius、Capricorn、Aquarius、Pisces。大小写不限。其他内容都会被拒绝。

### 颜色与图片

`setprofilecolor <colour>` 接受机器人颜色解析器能识别的任何颜色格式，例如十六进制值。`setprofileimage <url>` 需要一个指向图片文件的直接链接；机器人会在保存前检查该 URL 是否像图片，并将其展示给你确认。

### 生日

`setbirthday <date>` 保存一个日期。生日模块的公告使用的也是同一个值，因此在这里设置也会同步到那里。生日在个人资料上的显示方式取决于 `setbirthdayprivacy <mode>`：

| 模式 | 个人资料显示内容 |
| --- | --- |
| `Default` | 完整日期 |
| `MonthOnly` | 仅显示月份名称 |
| `YearOnly` | 仅显示年份 |
| `MonthAndDate` | 显示月和日，不显示年份 |
| `Disabled` | "Private" |

### Switch 好友代码

`setswitchfc <code>` 必须符合 `SW-XXXX-XXXX-XXXX` 格式（每组四位数字；`SW` 不区分大小写）。不带代码运行则会将其从个人资料中移除。Nintendo Switch 模块与此字段无关；该代码仅用于展示。

### 隐私

`setprivacy public` 或 `setprivacy private`。私密资料仅对其所有者可见。默认为公开。

## 代词

`pronouns [@user]` 显示你或他人的代词。查询顺序如下：

1. 成员通过 `setpronouns` 设置的文字。
2. 如果成员已在 PronounDB 上关联其 Discord 账户，则使用其在 PronounDB 上设置的英文代词。标准组合会以常见形式显示，例如 `he/him`、`Any pronouns` 或 `Ask me my pronouns`。
3. "Unspecified"。

`setpronouns <text>` 用于保存覆盖设置。若不带文字运行，则会显示当前的覆盖设置以及两个按钮：**Overwrite** 会打开一个表单用于输入新代词，**清除** 则会移除覆盖设置，之后将重新使用 PronounDB。

当显示的代词来自成员自己的覆盖设置（而非 PronounDB）时，回复中会带有 **Report** 按钮。举报会被发送到机器人所有者运营的频道，他们可以清除覆盖设置、为该用户禁用代词功能，或将其列入黑名单。代词已被禁用的用户，每当其尝试使用代词命令时都会看到原因。

> [!NOTE]
> 机器人所有者命令 `pronounsforceclear` 用于处理这些举报。服务器工作人员无法清除其他成员的代词。

## 退出选项

- `greetdmoptout` 用于切换是否接收使用机器人私信问候的服务器发来的私信。它只影响由本机器人发送的问候。
- `userstatsoptout` 用于切换是否为你的账户收集命令统计。这绝不会收集消息内容。
- `deleteuserstatsdata` 会在确认后删除已为你存储的命令统计数据。每小时可运行一次。

## 设置

服务器端没有配置项，所有内容都由成员自己保存。仪表板的 **我的设置** 页面（`/me`）包含一个带有 **编辑** 按钮的 **个人资料** 部分，以及带有开关的隐私部分。

| 设置 | 默认值 | 作用 |
| --- | --- | --- |
| 简介 | 空 | 个人资料上的描述 |
| 代词 | 空（使用 PronounDB） | 你的代词覆盖设置 |
| 星座 | 无 | 个人资料上显示的星座 |
| 生日 | 无 | 个人资料上显示的日期，并用于生日公告 |
| 时区 | UTC | 生日模块为你的公告所使用的时区 |
| Switch 好友代码 | 空 | 个人资料上的好友代码字段 |
| 个人资料颜色 | 机器人默认 | 嵌入消息颜色 |
| 个人资料图片 | 无 | 嵌入消息底部的图片 |
| 个人资料隐私 | 公开 | 他人能否打开你的资料 |
| 生日显示模式 | 默认 | 显示生日的哪些部分 |
| 屏蔽欢迎私信 | 关闭 | 等同于 `greetdmoptout` |
| 阻止消息追踪 | 关闭 | 等同于 `userstatsoptout` |
| 生日公告 | 关闭 | 生日模块是否公告你的生日 |

同一页面还有一个开关，用于禁用你账户的代词获取功能。

## 设置流程

1. 运行 `setbio Hi, I run the art channel.` 添加描述。
2. 运行 `setpronouns she/her`；如果你的 PronounDB 账户已关联 Discord，则可跳过此步。
3. 运行 `setbirthday 1998-04-12`，如果不想显示年份，再运行 `setbirthdayprivacy MonthAndDate`。
4. 运行 `setprofilecolor #ff66aa` 和 `setprofileimage https://example.com/banner.png` 来设置嵌入消息的样式。
5. 如果希望别人能在 Switch 上找到你，添加 `setswitchfc SW-1234-5678-9012`。
6. 运行 `profile` 查看结果。如果你不希望别人看到，运行 `setprivacy private`。

## 命令

以下命令需使用服务器前缀运行（默认为 `.`，除非你已更改）。大多数命令都有斜杠版本，名称例如 `/profile`、`/setbio`、`/setcolor`、`/setbirthday`、`/setbirthdayprivacy`、`/setswitchfriendcode`、`/setprofileimage`、`/setprivacy`、`/setzodiac`、`/pronouns`、`/setpronouns`、`/statsoptout` 和 `/deletestatsdata`。

| 命令 | 别名 | 所需权限 | 用途 |
| --- | --- | --- | --- |
| `profile [@user]` | `userprofile` | 无 | 显示你的或他人的个人资料 |
| `setbio <text>` | | 无 | 设置简介，最多 2048 个字符 |
| `setpronouns [text]` | `pronounsset` | 无 | 设置代词覆盖，或通过清除和覆盖按钮查看 |
| `pronouns [@user]` | `getpronouns` | 无 | 显示代词；覆盖设置附带举报按钮 |
| `setzodiac <sign>` | | 无 | 设置你的星座 |
| `setprofilecolor <colour>` | | 无 | 设置嵌入消息颜色 |
| `setprofileimage <url>` | | 无 | 设置个人资料上显示的图片 |
| `setbirthday <date>` | | 无 | 设置你的生日 |
| `setbirthdayprivacy <mode>` | | 无 | `Default`、`MonthOnly`、`YearOnly`、`MonthAndDate` 或 `Disabled` |
| `setprivacy <Public|Private>` | `profilepricvacy` | 无 | 将个人资料设为公开或私密 |
| `setswitchfc [code]` | `setfc`, `setswitchfriendcode`, `setfriendcode` | 无 | 设置或清除你的 Switch 好友代码 |
| `greetdmoptout` | `gdmoptout` | 无 | 切换是否接收本机器人的私信问候 |
| `userstatsoptout` | `ustatsoptout` | 无 | 切换命令统计收集 |
| `deleteuserstatsdata` | `deluserstatsdata` | 无 | 删除你已存储的命令统计（每小时一次） |
| `pronounsforceclear <@user or id> <true|false> <reason>` | `pnfc` | 机器人所有者 | 清除成员的代词，并可选择禁用 |

## 提示与注意事项

- 个人资料是全局的。在一个服务器中更改，会在所有地方同步更改。
- `setbirthday` 使用机器人的日期解析器读取日期，因此 `1998-04-12` 这类无歧义的格式最为安全。
- 如果个人资料图片的 URL 失效，嵌入消息仍会发送，但 Discord 不会显示图片。设置新的 URL 即可修复。
- PronounDB 查询需要成员已在 pronoundb.org 上关联其 Discord 账户。否则，在其运行 `setpronouns` 之前，个人资料会显示 "Unspecified"。
- 私密资料仍会响应 `profile @user`，但会返回资料为私密的错误，以便他人知道该资料确实存在。
- `deleteuserstatsdata` 只会删除命令统计。个人资料字段需要通过覆盖设置来清除。
