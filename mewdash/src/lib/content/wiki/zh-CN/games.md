---
title: 游戏
slug: games
summary: 成员可在任意频道发起的聊天游戏，包括问答、猜单词、词语接龙、打字比赛、首字母游戏和投票。
icon: fa-gamepad-modern
category: Entertainment
module: Games
tags: [games, trivia, hangman, kaladont, nunchi, typing race, acrophobia, tic tac toe, poll, vote, 8ball, choose, 游戏, 问答, 猜单词, 接龙, 数字游戏, 打字比赛, 首字母游戏, 井字棋, 投票, 8 号球, 随机选择]
related: [polls, currency, xp, searches, utility]
---

## 功能简介

游戏在发起游戏的频道中进行。成员运行命令后，机器人会在频道中发布游戏，所有人通过输入答案或点击按钮参与。每个频道同一时间只能进行一种游戏（数字游戏和 Kaladont 则是每个服务器一局），大多数游戏可以通过对应的停止命令提前结束。

问答、猜单词、Kaladont、Nunchi、打字比赛、首字母游戏和井字棋都是多人游戏。投票允许管理人员在频道中使用按钮或下拉菜单提出问题。`choose` 和 `8ball` 则是一次性的小功能。

本模块没有仪表板页面，所有操作都通过命令完成，而且大多数命令无需任何权限。

## 适用场景

- 用一轮问答或猜单词让安静的晚上热闹起来。
- 举办打字比赛或 Kaladont 锦标赛，作为社区活动。
- 向服务器快速提出是非题，或用下拉菜单发起多选项投票。
- 设置一个永久的 Kaladont 频道，让词语接龙永不中断。

## 问答

`trivia` 开始一轮问答。机器人会发布问题，在问题计时器过半时显示提示（除非关闭了提示）。第一位输入正确答案的成员获得一分。当某位成员达到胜利要求时，游戏结束，该成员获胜。如果连续多道题无人作答，游戏将停止。

| 选项 | 默认值 | 作用 |
| --- | --- | --- |
| `-p`, `--pokemon` | 关闭 | “Who's that Pokemon?”模式 |
| `--nohint` | 关闭 | 从不显示提示 |
| `-w`, `--win-req` | 10 | 获胜所需分数；0 表示无限游戏 |
| `-q`, `--question-timer` | 30 | 每道题的秒数 |
| `-t`, `--timeout` | 10 | 连续无人作答的题数，达到后游戏停止；0 表示永不停止 |

`tl` 显示当前得分，`tq` 停止游戏。机器人的全局配置可以设置最低获胜要求，以及给予获胜者的货币奖励。

> [!EXAMPLE]
> `trivia -w 5 -q 20` 运行一局简短游戏：先得五分者获胜，每题 20 秒。

## 猜单词

`hangman [type]` 从某个类别中选择一个词语，并以空格形式显示。成员通过在频道中输入一个字母或整个单词进行猜测。错误六次则游戏失败。类别包括 `countries`、`movies`、`animals`、`things` 和 `random`；默认为 `random`。`hangmanlist` 显示你的服务器可用的类别，`hangmanstop` 结束游戏。

## Kaladont

Kaladont 是词语接龙。每个词语的开头必须是上一个词语的最后两个字母，且每局中每个词只能使用一次。玩家轮流作答，每轮有时间限制。词库可选英语或塞尔维亚语，塞尔维亚语的双字母组合（如 lj 和 nj）视为单个字母。

| 选项 | 默认值 | 作用 |
| --- | --- | --- |
| `-j`, `--join-time` | 15 | 游戏开始前玩家加入的秒数 |
| `-t`, `--turn-time` | 30 | 每轮的秒数 |
| `-m`, `--min-players` | 2 | 开始游戏所需的玩家数 |
| `-l`, `--language` | en | `en` 或 `sr` |
| `-e`, `--endless` | 关闭 | 拒绝会导致下一位玩家无词可接的词语 |

`kaladontstop` 结束当前游戏。`kaladontsetup` 会将当前频道设为持久的 Kaladont 频道，使接龙持续进行，并沿用相同的语言和 endless 设置；`kaladontdisable` 则移除该设置。两者均需要「管理频道」权限。

## Nunchi

`nunchi` 创建一局游戏，其他成员在加入阶段运行 `nunchi` 即可加入。每轮机器人会公布一个数字，每位玩家都必须输入下一个数字。输入正确的玩家即为通过；当只剩一位玩家未通过时，该轮结束，剩下的玩家被淘汰。如果没有人在时限内作答，则会以已通过的所有玩家重新开始该轮。最后留存的玩家获胜。

## 打字比赛

`typestart` 会倒计时（默认五秒，`-s` 或 `--start-time` 可设置为 3 到 30 秒），然后发布一句话。第一位足够接近地输入该句的成员获胜；允许少量错别字，大约每 25 个字符容忍一处。结果会显示每分钟字数和错误数。`typestop` 结束比赛，`typelist` 显示句子库，机器人所有者可以使用 `typeadd` 和 `typedel` 添加或删除句子。

## 首字母游戏

`acrophobia` 会发布三到五个随机字母。成员在提交时间内（默认 60 秒，范围 15 到 300 秒）提交一个短语，短语中每个单词需按顺序以这些字母开头，每人只能提交一次。随后在投票时间内（默认 60 秒，范围 15 到 120 秒），所有人通过编号为自己喜欢的作品投票。不能为自己的作品投票。使用 `-s` 或 `--submission-time` 以及 `-v` 或 `--vote-time` 设置计时器。

## 井字棋

`tictactoe` 开启一局游戏；下一位运行该命令的成员将作为第二位玩家加入。回合在聊天中进行，若某位玩家超过回合计时器（默认 15 秒，`-t` 或 `--turn-timer` 可设置为 5 到 60 秒）则判负。游戏会宣布获胜者或平局。

## 投票

创建投票需要「管理消息」权限。选项之间用分号分隔。

| 命令 | 类型 | 行为 |
| --- | --- | --- |
| `poll <question>` | 是 / 否 | 两个按钮 |
| `pollc question;option1;option2;...` | 单选 | 每位成员一票 |
| `pollm question;option1;option2;...` | 多选 | 成员可以选择多个选项 |
| `polla question;option1;option2;...` | 匿名 | 隐藏投票人身份 |

选项为两到五个时使用按钮；超过五个时使用下拉菜单，最多可有 25 项。成员可以更改投票。模板可以保存问题及其选项以便复用：`polltemplates` 列出模板，`polltemplate <name>` 发布模板。创建和删除模板、关闭投票、列出进行中的投票以及查看投票统计，均通过 `/poll` 斜杠命令（`create-template`、`delete-template`、`close`、`list`、`stats`）完成，或在投票仪表板页面中完成，该页面有独立的文章。

## 其他

- `choose a; b; c` 从分号分隔的列表中随机选择一个选项。
- `8ball <question>` 从机器人游戏配置中的回复列表中作答。
- `linux <word> <word>` 发布“I'd just like to interject”梗文，并替换其中的两个名字。
- `dragon` 切换你的测试版测试员标记，一些实验性命令会检查该标记。
- `rategirl` 仅作为存根存在，并附有其被移除原因的说明，实际上不起任何作用。

## 设置

本模块没有仪表板页面，也没有按服务器的设置。游戏行为通过上述命令选项设置。机器人所有者的 `games.yml` 配置包含 8 号球的回复，以及问答的最低获胜要求和货币奖励。

## 设置步骤

1. 为游戏选择一个频道，或新建一个，以免游戏消息淹没正常聊天。
2. 如果需要永久的词语接龙，请在该频道运行 `kaladontsetup -l en`。
3. 运行 `trivia` 或 `hangman`，确认机器人可以在该频道发送消息并读取回复。
4. 如果希望工作人员发起投票，请为其授予「管理消息」权限。

## 命令

请使用服务器的前缀运行以下命令（默认为 `.`，除非你修改过）。

| 命令 | 别名 | 所需权限 | 用途 |
| --- | --- | --- | --- |
| `trivia [options]` | `t` | 无 | 开始问答 |
| `tl` | | 无 | 问答得分 |
| `tq` | | 无 | 停止问答 |
| `hangman [type]` | | 无 | 开始猜单词 |
| `hangmanlist` | | 无 | 列出猜单词类别 |
| `hangmanstop` | | 无 | 停止猜单词 |
| `kaladont [options]` | `kal` | 无 | 开始 Kaladont |
| `kaladontstop` | `kalstop` | 无 | 停止 Kaladont |
| `kaladontsetup [options]` | `kalsetup` | 管理频道 | 将此频道设为持久的 Kaladont 频道 |
| `kaladontdisable` | `kaldisable` | 管理频道 | 移除持久频道 |
| `nunchi` | | 无 | 创建或加入 Nunchi |
| `typestart [options]` | | 无 | 开始打字比赛 |
| `typestop` | | 无 | 停止比赛 |
| `typelist [page]` | | 无 | 列出比赛句子 |
| `typeadd <text>` | | 机器人所有者 | 添加句子 |
| `typedel <index>` | | 机器人所有者 | 删除句子 |
| `acrophobia [options]` | `acro` | 无 | 开始首字母游戏 |
| `tictactoe [options]` | `ttt` | 无 | 开始或加入井字棋 |
| `poll <question>` | `ppoll` | 管理消息 | 是 / 否投票 |
| `pollc <question;options>` | | 管理消息 | 单选投票 |
| `pollm <question;options>` | | 管理消息 | 多选投票 |
| `polla <question;options>` | | 管理消息 | 匿名投票 |
| `polltemplates` | `ptemplates` | 无 | 列出投票模板 |
| `polltemplate <name>` | `ptemplate` | 管理消息 | 从模板发布投票 |
| `choose <a; b; c>` | | 无 | 随机选择一个 |
| `8ball [question]` | `eightball` | 无 | 神奇 8 号球 |
| `linux <word> <word>` | | 无 | 插话梗文 |
| `dragon` | | 无 | 切换你的测试版标记 |
| `rategirl` | | 无 | 存根，不起任何作用 |

## 注意事项

- 游戏会读取频道中的回复，因此机器人需要在该频道拥有「阅读消息历史」和「发送消息」权限，并且不能被频道权限规则阻止。
- 问答、猜单词和 Kaladont 的答案是普通消息。如果你同时开启了消息计数或经验值，这些消息也会被计入。
- 每个频道同一时间只能进行一局问答、猜单词、打字比赛或 Kaladont；如果已有游戏在进行，开始命令会提示你。
- 投票选项超过 100 个字符时，会在下拉菜单中被截断。
- Nunchi 每轮淘汰最慢的玩家，因此人数较多时可能需要较长时间才能结束。
