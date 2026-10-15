---
title: 每日一词
slug: wordoftheday
summary: 每天发布一个词汇，附带释义、发音和例句。单词可从词典中按主题和难度挑选，也可以使用服务器自行编写的列表。
icon: fa-book-open
category: Community
dashboard: /dashboard/wordoftheday
module: WordOfTheDay
tags: [word of the day, wotd, vocabulary, dictionary, definition, daily, datamuse, topic, schedule, 每日一词, 词汇, 词典, 释义, 每日, 主题, 日程]
related: [birthday, utility]
---

## 功能简介

机器人每天会在服务器所选的时区中、服务器指定的时间，在所选频道发布一个单词。帖子会显示单词、发音、词性、释义，若有例句也会一并显示。每次发布时还可以提及某个身份组。

单词来自 Datamuse 词典，并通过三项设置进行筛选：偏向的**主题**、**词性**，以及基于该词在英文书面语中出现频率的**难度**。机器人会避免重复最近九十天内发布过的任何单词。

服务器还可以使用 `wotdadd` 建立**自定义列表**。如果未提供释义，机器人会自动查询。**来源模式** 决定帖子来自词典、自定义列表，还是先使用自定义列表、列表用完后再使用词典。

## 按星期或月份安排

规则可以为特定的星期或月份覆盖主题、词性和难度。规则只会改变它所设置的字段，因此仅设置了主题的星期一规则，仍会沿用基础的词性和难度。两者同时适用时，星期规则优先于月份规则，月份规则优先于基础设置。

示例：

- `wotdday monday science` 将周一的单词设为科学主题。
- `wotddayfilter friday adjective rare` 将每周五设为罕见形容词。
- `wotdmonth october spooky halloween` 将整个十月设为万圣节主题。
- `wotdschedule` 显示所有规则，以及今天生效的筛选条件。

## 讨论串

开启后，机器人会在每条每日帖子下创建一个公开讨论串，并放入一条起始提示，邀请大家用这个单词造句。讨论串的名称来自模板（默认为 `Word of the day: %wotd.word%`），模板支持 `%wotd.word%`、`%wotd.date%`、`%wotd.pos%` 以及常用的服务器占位符。`wotdthread` 用于开启或关闭讨论串，`wotdthreadname` 用于设置、显示或清除名称模板，`wotdthreadarchive` 用于设置讨论串在自动归档前保持开启的时长（1 小时、1 天、3 天或 1 周）。

## 命令

| 命令 | 作用 |
| --- | --- |
| `wotd` | 显示今天的单词；如果尚未发布，则显示预览。 |
| `wotdchannel #channel` | 设置频道并开启发布。 |
| `wotdtime 9` | 设置发布的本地小时。 |
| `wotdtimezone Europe/London` | 设置时区。 |
| `wotdtopic space` | 设置基础主题。 |
| `wotdpos noun` | 限制词性。 |
| `wotddifficulty rare` | 设置难度。 |
| `wotdmode mixed` | 选择词典、自定义或混合模式。 |
| `wotdadd word [definition]` | 添加自定义单词。 |
| `wotdmessage` | 使用占位符或嵌入 JSON 设置自定义消息模板。 |
| `wotdthread` | 切换每条帖子下的讨论串。 |
| `wotdthreadname [template\|clear]` | 设置、显示或清除讨论串名称模板。 |
| `wotdthreadarchive 1h\|24h\|3d\|7d` | 设置讨论串在自动归档前保持开启的时长。 |
| `wotdpost` | 立即发布一个新单词。 |

## 消息占位符

在自定义模板中可以使用 `%wotd.word%`、`%wotd.definition%`、`%wotd.pos%`、`%wotd.example%`、`%wotd.phonetic%`、`%wotd.date%` 和 `%wotd.ping%`，同时也可以使用常用的服务器占位符。
