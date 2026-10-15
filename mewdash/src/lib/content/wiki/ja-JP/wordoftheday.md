---
title: 今日の単語
slug: wordoftheday
summary: 1日に1つの語彙を、定義、発音、例文とともに投稿します。単語は、トピックと難易度に基づいて辞書から選ぶか、サーバーが自分で作成したリストから選ばれます。
icon: fa-book-open
category: Community
dashboard: /dashboard/wordoftheday
module: WordOfTheDay
tags: [word of the day, wotd, vocabulary, dictionary, definition, daily, datamuse, topic, schedule, 今日の単語, 語彙, 辞書, 定義, 毎日, トピック, スケジュール]
related: [birthday, utility]
---

## 概要

1日に1回、サーバーがタイムゾーンに従って選んだ時刻に、ボットは選択したチャンネルに単語を投稿します。投稿には、単語、発音、品詞、定義、そして例文（ある場合）が表示されます。どの投稿にもロールをメンションできます。

単語はDatamuseの辞書から取得され、3つの設定でフィルターされます。単語が寄るべき**トピック**、**品詞**、そして英語の文章で単語が出現する頻度に基づく**難易度**です。ボットは、過去90日間に投稿した単語を繰り返さないようにします。

サーバーは、`wotdadd` を使って**カスタムリスト**を作成することもできます。定義を省略した場合、ボットが定義を検索します。**ソースモード**では、投稿を辞書から選ぶか、カスタムリストから選ぶか、またはカスタムリストを優先してから、そのリストが尽きたら辞書から選ぶかを決めます。

## 曜日または月によるスケジュール

ルールを使うと、特定の曜日または月について、トピック、品詞、難易度を上書きできます。ルールは、設定した項目だけを変更します。たとえば、トピックだけを指定した月曜日のルールでは、基本の品詞と難易度がそのまま使われます。両方が適用される場合は、曜日のルールが月のルールより優先され、月のルールが基本設定より優先されます。

例：

- `wotdday monday science` は、月曜日の単語を科学のテーマにします。
- `wotddayfilter friday adjective rare` は、金曜日に、珍しい形容詞を選びます。
- `wotdmonth october spooky halloween` は、10月すべてをハロウィンのテーマにします。
- `wotdschedule` は、すべてのルールと、今日適用されているフィルターを表示します。

## ディスカッションスレッド

オンにすると、ボットは毎日の投稿の下に公開スレッドを作成し、単語を文章で使うように促すスターターのプロンプトを投稿します。スレッドの名前は、テンプレート（デフォルトは `Word of the day: %wotd.word%`）から生成されます。テンプレートでは、`%wotd.word%`、`%wotd.date%`、`%wotd.pos%`、および一般的なサーバーのプレースホルダーを使用できます。`wotdthread` はスレッドのオンとオフを切り替えます。`wotdthreadname` は、名前のテンプレートを設定、表示、またはクリアします。`wotdthreadarchive` は、自動でアーカイブされるまでスレッドを開いておく時間を設定します（1時間、1日、3日、または1週間）。

## コマンド

| コマンド | 機能 |
| --- | --- |
| `wotd` | 今日の単語を表示します。まだ投稿されていない場合はプレビューを表示します。 |
| `wotdchannel #channel` | チャンネルを設定し、投稿をオンにします。 |
| `wotdtime 9` | 投稿する現地時刻（時）を設定します。 |
| `wotdtimezone Europe/London` | タイムゾーンを設定します。 |
| `wotdtopic space` | 基本のトピックを設定します。 |
| `wotdpos noun` | 品詞を制限します。 |
| `wotddifficulty rare` | 難易度を設定します。 |
| `wotdmode mixed` | 辞書、カスタム、または混合を選択します。 |
| `wotdadd word [definition]` | カスタムの単語を追加します。 |
| `wotdmessage` | プレースホルダーまたは埋め込みのJSONを使って、カスタムのメッセージテンプレートを設定します。 |
| `wotdthread` | 各投稿の下にあるディスカッションスレッドを切り替えます。 |
| `wotdthreadname [template\|clear]` | スレッド名のテンプレートを設定、表示、またはクリアします。 |
| `wotdthreadarchive 1h\|24h\|3d\|7d` | 自動でアーカイブされるまでスレッドを開いておく時間を設定します。 |
| `wotdpost` | 今すぐ新しい単語を投稿します。 |

## メッセージのプレースホルダー

`%wotd.word%`、`%wotd.definition%`、`%wotd.pos%`、`%wotd.example%`、`%wotd.phonetic%`、`%wotd.date%`、`%wotd.ping%` は、カスタムテンプレート内で、一般的なサーバーのプレースホルダーと一緒に使用できます。
