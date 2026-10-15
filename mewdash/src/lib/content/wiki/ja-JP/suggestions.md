---
title: 提案
slug: suggestions
summary: メンバーがアイデアを投稿するチャンネルやボタンを用意し、サーバーで投票できるようにします。スタッフは各提案を、理由とともに承認、却下、検討、実装のいずれかに設定できます。
icon: fa-lightbulb
category: Community
dashboard: /dashboard/suggestions
module: Suggestions
tags: [suggestions, ideas, feedback, voting, accept, deny, consider, implement, threads, suggest button, placeholders, 提案, アイデア, フィードバック, 投票, 承認, 却下, 検討, 実装, スレッド, 提案ボタン, プレースホルダー]
related: [administration, afk]
---

## What it does

メンバーは `suggest` コマンドでアイデアを送るか、提案チャンネルに直接入力するか、**Suggest Here!** ボタンを押してフォームに入力します。ボットは元のメッセージを削除し、番号付きの提案の埋め込みを提案チャンネルに投稿して、投票用の絵文字をリアクションまたはボタンとして付けます。各提案には番号が付けられ、スタッフは後からその番号で参照します。

スタッフは、各提案を4つの状態（承認、却下、検討、実装）の間で移動できます。それぞれ任意の理由を付けられます。ボットは元の提案メッセージを、状態を示す色付きの埋め込みに編集し、提案したメンバーに結果をDMで送ります。さらに、状態ごとに別のチャンネルへステータスの埋め込みを再投稿できるため、承認された案と却下された案をそれぞれ別の場所にまとめられます。

任意で、各提案に **Join/Create Discussion** ボタンを付けることもできます。このボタンを押すと、提案の下に公開または非公開のスレッドが開きます。スタッフが状態を変更すると、スレッドを自動でアーカイブできます。

## Why you would use it

- 返信の中でアイデアが埋もれてしまうフィードバックチャンネルでも、提案ごとに独立したメッセージになり、投票数が表示されます。
- スタッフがお知らせを書かなくても、どの提案が承認または却下されたか、その理由をメンバーが確認できるコミュニティに向いています。
- メインチャンネルで議論が混ざるのを避け、アイデアごとにスレッドで話し合いたいサーバーに向いています。
- 提案番号を覚えておく代わりに、ダッシュボードの理由入力欄から振り分けたいスタッフに向いています。

## How a suggestion is submitted

投稿方法は3つあります。いずれも同じ長さのチェックを通り、最終的に提案チャンネルに投稿されます。

| Method | What happens |
| --- | --- |
| `suggest <text>` | コマンドのメッセージを削除し、提案を投稿します。どのチャンネルからでも使えます。 |
| 提案チャンネルへの入力 | プレフィックスで始まらない、ボット以外のメッセージはすべて提案に変換され、元のメッセージは削除されます。サーバーのスタッフロールを持つメンバーは対象外なので、スタッフはチャンネルで通常どおり会話できます。 |
| 提案ボタン | **Suggest Button Channel** にあるボタン付きのメッセージです。押すと、設定した長さの制限に合ったフォームが開きます。 |

テキストが **Maximum Length** を超える場合、または **Minimum Length** を下回る場合は、受け付けられません。コマンドで投稿した場合はエラーがチャンネルに表示され、5秒後に削除されます。提案チャンネルへの入力の場合はメッセージが削除され、メンバーにDMで通知されます。提案内のメンションは、投稿される埋め込みの中で無効化されます。メンバーには、提案が送信されたことが通知されます。

既定の提案の埋め込みは、メンバーを作成者として表示し、タイトルは "Suggestion #N"、本文には提案の内容を表示します。下記のプレースホルダーを使って、独自の埋め込みに置き換えることもできます。

### The suggest button

ボタンのメッセージは **Suggest Button Channel** に投稿され、ボットは常にチャンネルの最下部に置かれるようにします。ほかのメッセージでボタンが上に押し上げられると、ボットはボタンを削除して再投稿します。既定のラベルは **Suggest Here!** で、絵文字はなく、色は Blurple です。ボタンの上に表示されるメッセージは、プレーンテキストでも埋め込みのコードでもかまいません。既定では、短い「提案をどうぞ」という案内文です。

## Voting

既定では、各提案に👍と👎が付きます。`suggestmotes` または **カスタム絵文字** の選択画面で、最大5つのカスタム絵文字を設定できます。ボットがその絵文字を使える必要があります。

**絵文字の表示モード** で、投票の方式を決めます。

| Mode | Behaviour |
| --- | --- |
| Reactions（既定） | ボットが絵文字をリアクションとして追加します。リアクションの追加と削除によって数を集計します。 |
| Buttons | 絵文字がボタンになり、リアルタイムの数が表示されます。メンバーは提案ごとに1票を持つことができます。同じボタンをもう一度押すと取り消しの確認が表示され、別のボタンを押すと切り替えの確認が表示されます。 |

ボタンモードでは、5つの絵文字ボタンそれぞれに色を設定できます（**Emote 1 Button** から **Emote 5 Button**）。色は Blue、Grey、Green、Red から選べます。色を変更すると、提案ボタンのメッセージも更新されます。

`suggestinfo <number>` は、本文、提案者、現在の状態、最後に状態を変更したスタッフ、状態が変更された回数、絵文字ごとの票数を表示します。その下には、Accept、Deny、Consider、Implement のボタンが付きます。

## States

すべての提案は、Suggested（ダッシュボードでは Pending と表示）から始まります。Manage Messages の権限を持つスタッフは、`accept`、`deny`、`consider`、`implemented` のいずれかのコマンドで、`suggestinfo` のボタンから、またはダッシュボードから、提案を4つの状態のいずれかに移動できます。理由を付けて状態を変更すると、その理由が表示されます。理由がない場合、欄には "none" と表示されます。

| State | Embed colour | Extra options |
| --- | --- | --- |
| Accepted | Blue | Accept channel、accept message、archive on accept |
| Denied | Red | Deny channel、deny message、archive on deny |
| Considered | Gold | Consider channel、consider message、archive on consider |
| Implemented | Green | Implement channel、implement message、archive on implement |

状態が変わると、ボットは次の順序で処理します。

1. その状態のアーカイブ設定が有効な場合、ディスカッションスレッドをアーカイブします。
2. 提案チャンネルにある元のメッセージを、ステータスの埋め込みに編集し、すべてのリアクションを削除します。元のメッセージが見つからない場合は、新しいメッセージを投稿します。
3. 提案者に、提案内容、理由、変更したスタッフを示す埋め込みをDMで送ります。スタッフへの確認メッセージには、DMが送信できたか、またはメンバーがDMを無効にしているかが示されます。
4. 新しい状態と、変更したスタッフを記録します。
5. その状態のチャンネルが設定されている場合、そこにステータスの埋め込みを投稿し、その提案の前のステータスメッセージを削除します。そのため、検討中から承認に変わった提案の古いコピーが残ることはありません。

提案は、何度でも状態を移動できます。Pending に戻すコマンドはありません。

### The status message

既定のステータスの埋め込みは、提案者を作成者として表示し、"Suggestion #12 Accepted" のようなタイトルを付け、提案の本文を説明として表示し、**理由** の欄を含みます。`acceptmessage`、`denymessage`、`considermessage`、`implementmessage` で独自に設定するか、ダッシュボードの **メッセージ** タブにある4つのエディターを使います。既定に戻すには `-` を使います。カスタムテキストは埋め込みパーサーで処理されます。有効な埋め込みのコードでない場合は、埋め込みの説明文として使われます。

## Placeholders

提案メッセージ（送信時に投稿されるもの）では、以下のプレースホルダーを使えます。加えて、プレースホルダーのページにあるサーバー全体の一般的なプレースホルダーも使えます。

| Placeholder | Value |
| --- | --- |
| `%suggest.user%` | 提案者のユーザー名（完全版） |
| `%suggest.user.name%` | 提案者のユーザー名 |
| `%suggest.user.avatar%` | 提案者のアバターURL |
| `%suggest.message%` | 提案の本文。メンションは無効化されています |
| `%suggest.number%` | 提案の番号 |

承認、却下、検討、実装のメッセージでは、上記のすべてに加えて、サーバー全体の一般的なプレースホルダーと、次の追加分を使えます。

| Placeholder | Value |
| --- | --- |
| `%suggest.user.id%` | 提案者のユーザーID |
| `%suggest.mod.user%` | 状態を変更したスタッフのユーザー名（完全版） |
| `%suggest.mod.name%` | そのスタッフのユーザー名 |
| `%suggest.mod.avatar%` | そのスタッフのアバターURL |
| `%suggest.mod.Id%` | そのスタッフのユーザーID（大文字の I に注意） |
| `%suggest.mod.message%` | 入力された理由。理由がない場合は "none" |
| `%suggest.emote1count%` から `%suggest.emote5count%` | 変更時点での、各絵文字の投票数 |

> [!EXAMPLE]
> 単純な却下メッセージの例: `Suggestion #%suggest.number% by %suggest.user% was denied by %suggest.mod.name%: %suggest.mod.message%`

## Threads

**スレッドの種類** を設定すると、新しい提案のすべてに2行目のボタンが追加されます。

| Type | Button | Result |
| --- | --- | --- |
| No Threads（既定） | なし | ディスカッションボタンはありません |
| Regular Threads | Join/Create Public Discussion | 提案メッセージに "Suggestion #N Discussion" という名前の公開スレッドを作成します |
| Private Threads | Join/Create Private Discussion | 同じく、非公開スレッドとして作成します |

最初に押すと、スレッドが作成され、提案者と押したメンバーの両方が追加されます。その後に押すと、スレッドがすでに存在することが返信され、スレッドへのリンクが表示されます。提案ごとにスレッドは1つだけ管理されます。4つの **Archive on** 設定は、対応する状態が設定されたときにスレッドをアーカイブします。スレッドの種類を変更しても、以降に投稿された提案にだけ影響します。

## Settings

ダッシュボードのページには、**提案** と **設定** の2つのタブがあります。Settings タブは、**一般**、**メッセージ**、**チャンネル**、**アーカイブ**、**絵文字** に分かれています。

| Setting | Default | What it controls |
| --- | --- | --- |
| Minimum Length | not set | 受け付ける提案の最短文字数（2048以上は設定できません。ダッシュボードの欄は2000で止まります） |
| Maximum Length | not set | 受け付ける提案の最長文字数（0より大きい値が必要です。ダッシュボードの欄は2000で止まります） |
| Thread Type | No Threads | 提案にディスカッションボタンを付けるかどうか、また公開か非公開か |
| Suggestion message | default embed | 提案が送信されたときに投稿される埋め込み |
| Accept / Deny / Consider / Implement message | default embed | 各状態のステータスの埋め込み |
| Suggest Channel | none（機能オフ） | 提案を投稿する場所。入力されたメッセージが提案になる場所 |
| Accept / Deny / Consider / Implement Channel | none | 各ステータスの埋め込みをコピーする追加のチャンネル |
| Archive on Accept / Deny / Consider / Implement | off | その状態になったときに、ディスカッションスレッドをアーカイブします |
| Emote Display Mode | Reactions | 投票にリアクションを使うかボタンを使うか |
| Custom Emotes | thumbs up and down | 投票に使う絵文字（最大5つ） |
| Button Label | Suggest Here! | 提案ボタンのテキスト |
| Button Emote | none | 提案ボタンの絵文字 |
| Button Message | default prompt | 提案ボタンの上に投稿されるテキストまたは埋め込み |
| Suggest Button Color | Blurple | 提案ボタンの色 |
| Emote 1 to 5 Button | Blurple | ボタンモードでの各投票ボタンの色 |

> [!WARNING]
> **提案チャンネル** を設定するまで、何も動作しません。それまでは、`suggest` を実行するとチャンネルが設定されていないことが返信され、そのエラーは3秒後に削除されます。

**提案** タブには、すべての提案が、状態、投票数、日付とともに一覧表示されます。日付または状態で並べ替えできます。各カードには、**承認**、**拒否**、**検討**、**実装** のボタンがあり、任意で理由を入力できます。また、**削除** ボタンがあり、これを押すとデータベースの記録だけが削除されます。Discord のメッセージには影響しません。

## Setup walkthrough

1. ダッシュボードで **提案** を開き、**設定** タブに切り替えます。
2. **チャンネル** で **提案チャンネル** を選びます。必要に応じて、承認、却下、検討、実装された提案用に、別々のチャンネルを選ぶこともできます。
3. **一般** で **Minimum Length** と **Maximum Length** を設定します（例: 10 と 1000）。アイデアごとに議論したい場合は、**スレッドの種類** を選びます。
4. **絵文字** で **リアクション** または **ボタン** を選び、必要に応じて最大5つの **カスタム絵文字** を選びます。提案ボタンがほしい場合は、ここでラベル、絵文字、メッセージを設定し、Discord で `suggestbuttonchannel #channel` を実行して投稿します。
5. **アーカイブ** で、議論を終了させるべき状態のアーカイブ設定を有効にします。
6. 必要に応じて **メッセージ** で、上記のプレースホルダーを使ってステータスの埋め込みをカスタマイズします。
7. 保存したら、テストします。`suggest test idea` を実行し、投票し、`accept 1 looks good` を実行してステータスの埋め込みとDMを確認します。

## Commands

これらのコマンドは、サーバーのプレフィックスを付けて実行します（変更していなければ `.`）。

| Command | Aliases | Needs | Purpose |
| --- | --- | --- | --- |
| `suggest <text>` | `suggestion` | Nobody | 提案を送信します |
| `suggestinfo <number>` | `suginfo` | Manage Messages | 提案の詳細、投票数、状態のボタンを表示します |
| `accept <number> [reason]` | `suggestaccept`, `acceptsuggest` | Manage Messages | 提案を承認済みにします |
| `deny <number> [reason]` | `suggestdeny`, `denysuggest` | Manage Messages | 提案を却下済みにします |
| `consider <number> [reason]` | `suggestconsider`, `considersuggest` | Manage Messages | 提案を検討中にします |
| `implemented <number> [reason]` | `suggestimplement`, `implementsuggest` | Manage Messages | 提案を実装済みにします |
| `setsuggestchannel [#channel]` | `suggestchannel`, `suggestchan` | Manage Channels | 提案チャンネルを設定します。チャンネルなしにすると提案機能を無効にします |
| `suggestclear` | `suggestreset`, `resetsuggestions`, `clearsuggestions` | Administrator | 確認後、すべての提案を削除し、番号をリセットします |
| `suggestmessage <text>` | `suggestmsg` | Administrator | 提案のカスタム埋め込み。`-` でリセットします |
| `acceptmessage <text>` | `acceptmsg` | Administrator | 承認のカスタム埋め込み。`-` でリセットします |
| `denymessage <text>` | `denymsg` | Administrator | 却下のカスタム埋め込み。`-` でリセットします |
| `considermessage <text>` | `considermsg` | Administrator | 検討のカスタム埋め込み。`-` でリセットします |
| `implementmessage <text>` | `implementmsg` | Administrator | 実装のカスタム埋め込み。`-` でリセットします |
| `acceptchannel [#channel]` | | Administrator | 承認された提案のチャンネル。なしにすると無効になります |
| `denychannel [#channel]` | | Administrator | 却下された提案のチャンネル。なしにすると無効になります |
| `considerchannel [#channel]` | | Administrator | 検討中の提案のチャンネル。なしにすると無効になります |
| `implementchannel [#channel]` | | Administrator | 実装された提案のチャンネル。なしにすると無効になります |
| `minsuggestionlength <number>` | `minsuggestlength` | Administrator | 最小文字数。2048未満である必要があります |
| `maxsuggestionlength <number>` | `maxsuggestlength` | Administrator | 最大文字数。0より大きい必要があります |
| `suggestmotes <emotes>` | `smotes`, `suggestemotes` | Administrator | 投票用の絵文字（最大5つ）。`disable` を指定すると 👍 と 👎 に戻ります |
| `suggestmotesmode <reactions/buttons>` | | Administrator | 投票にリアクションを使うかボタンを使うか |
| `suggestmotecolor <number> <colour>` | | Administrator | 投票ボタン1から5の色。`blurple`、`grey`、`green`、`red` のいずれか |
| `suggestthreadstype <none/public/private>` | `suggestthreads` | Administrator | 新しい提案のディスカッションスレッドの種類 |
| `archiveonaccept` | | Administrator | 承認時のスレッドアーカイブを切り替えます |
| `archiveondeny` | | Administrator | 却下時のスレッドアーカイブを切り替えます |
| `archiveonconsider` | | Administrator | 検討時のスレッドアーカイブを切り替えます |
| `archiveonimplement` | | Administrator | 実装時のスレッドアーカイブを切り替えます |
| `suggestbuttonchannel <#channel>` | | Administrator | チャンネルに提案ボタンを投稿します |
| `suggestbuttonmessage <text>` | | Administrator | 提案ボタンの上に表示するテキストまたは埋め込み。`-` でリセットします |
| `suggestbuttonlabel <text>` | | Administrator | ボタンのラベル（80文字まで）。`-` でリセットします |
| `suggestbuttonemote [emote]` | | Administrator | ボタンの絵文字。なしにするとリセットします |
| `suggestbuttoncolor <colour>` | | Administrator | 提案ボタンの色。`blurple`、`grey`、`green`、`red` のいずれか |

スラッシュコマンドは `/suggestions` と `/suggestions customize` にあります。

## Tips and gotchas

- ボットは、元の提案を削除するために提案チャンネルでメッセージの管理が必要です。リアクションモードではリアクションの追加が必要です。ディスカッションには公開または非公開のスレッドの作成が必要です。ステータスチャンネルには埋め込みリンクが必要です。ない場合、コピーは何も表示されずにスキップされます。
- チャンネルを開く前に、両方の長さの制限を設定してください。テキストメッセージの経路では制限外のメッセージがすべて削除されるため、最大値が未設定だとすべてのメッセージが消えてしまうことがあります。
- 管理者設定でスタッフロールを設定されたメンバーは、提案チャンネルで提案に変換されずに会話できます。それ以外のメンバーのメッセージは、変換されて削除されます。
- `suggest` コマンドは権限システムに従います。そのため、通常の権限コマンドでチャンネルやロールごとにブロックできます。テキストメッセージの経路も同じルールに従います。
- カスタム絵文字は、ボットが使えるものである必要があります。コマンドは、各絵文字でリアクションしてテストし、いずれかが失敗するとセットを拒否します。
- ダッシュボードの **削除** は、データベースの記録だけを削除します。Discord のメッセージやスレッドはそのまま残ります。
- `suggestclear` は元に戻せず、番号は1にリセットされます。
