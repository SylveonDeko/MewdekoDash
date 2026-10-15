---
title: ユーティリティ
slug: utility
summary: コマンドのエイリアス、引用、リマインダーから、自動公開、配信ロール、AIアシスタント、メッセージ集計、リピーターまで、日常的に役立つ機能をまとめたツールボックスです。
icon: fa-wrench
category: Actions
dashboard: /dashboard/utility
module: Utility
tags: [alias, quotes, auto publish, stream role, ai, chatbot, nsfw filter, role monitor, reminder, snipe, repeater, sticky, message count, invites, embed, calculator, userinfo, serverinfo, エイリアス, 引用, 自動公開, 配信ロール, AI, チャットボット, NSFWフィルター, ロールモニター, リマインダー, スナイプ, リピーター, 固定, メッセージ数, 招待, 埋め込み, 計算機, ユーザー情報, サーバー情報]
related: [repeaters, polls, invites, messagestats, embedbuilder, xp, administration, moderation]
---

## 概要

ユーティリティは、多くのサーバーが欲しがる小さな機能をまとめたモジュールです。メンバーはリマインダー、引用、サイコロ、計算機、単位変換、ユーザー・ロール・チャンネル・サーバーの情報コマンドを利用できます。スタッフは、コマンドのエイリアス、繰り返しメッセージ、アナウンスチャンネルの自動公開、配信中にメンバーへ付与されるロール、削除されたメッセージのスナイプ、メッセージ集計、招待の追跡を利用できます。

ダッシュボードの **ユーティリティ** ページには、フォームで設定するほうが便利な機能がまとめられています。エイリアス、引用、自動公開、配信ロール、AIアシスタント、NSFWタグフィルター、ロールモニターがこのページにあります。それ以外の機能はコマンドのみで操作します。

このモジュールは対象範囲が広いため、以下ではサブ機能ごとに説明しています。末尾のコマンド表には、このモジュールのすべてのコマンドを掲載しています。

## 使いどころ

- エイリアスを使って、`play youtube` を `yt` と短くし、サーバー全体で使えるようにします。
- メンバーが追加でき、ランダムに引けるみんなの引用集を用意します。
- アナウンスチャンネルへの投稿をすべて、自動でフォロワーに公開します。
- 特定のゲームを配信しているあいだだけ、メンバーに「Live」ロールを付与します。
- ルールや固定のお知らせを数分ごとに投稿します。チャンネルが活発なときだけ投稿することもできます。
- メンバーが自分用、またはチャンネル用のリマインダーを設定できるようにします。
- 自分のAPIキーを使い、1つのチャンネルでAIアシスタントを動かします。

## エイリアス

エイリアスは、実行前にボットがほかのコマンドへ書き換えるトリガーワードです。`alias yt play youtube` と設定すると、`.yt lofi` は `.play youtube lofi` として実行されます。トリガーはメッセージの最初の単語である必要があり、そのあとの文字列は割り当て先のコマンドに追加されます。より長いトリガーが先に一致します。割り当て先を指定せずに `alias <trigger>` を実行すると削除され、`aliasesclear` ですべて削除されます。

ダッシュボードの **エイリアス** タブには、**エイリアスのトリガー** と **エイリアスの割り当て先** の入力欄、検索ボックス、削除できる一覧があります。

## 引用

引用は、キーワードごとに分類して保存される短いテキストです。`quoteadd <keyword> <text>` で保存し、`quoteprint <keyword>`（または `..`）でそのキーワードの引用をランダムに表示します。`quoteshow <id>` では特定の引用を表示できます。`quotesearch` はキーワードと本文で検索し、`quoteid` は引用を追加したユーザーを表示します。`listquotes` は、キーワード順または追加日順で引用をページ送りして表示します。誰でも引用を追加できます。引用は、追加したメンバーまたは管理者が削除できます。キーワードに属する引用をすべて削除すること、JSONへのエクスポート、JSON添付ファイルからのインポートには、管理者権限が必要です。

**引用** タブでは、引用の追加、編集、検索、削除ができます。

## 自動公開

Discordのアナウンスチャンネルでは、各メッセージを手動で公開する必要があります。`addautopublish #channel` を実行すると、そのチャンネルの新しいメッセージをボットが自動で公開します。チャンネルごとに2種類のブラックリストを設定し、メッセージをスキップできます。`addpublishblacklist @user #channel` はユーザーを無視し、`addpublishblacklist #channel word` は指定した単語を含むメッセージを（大文字と小文字を区別せずに）無視します。`getautopublishes` を実行すると、すべての自動公開チャンネルとそのブラックリストが表示されます。

**自動公開** タブでは、チャンネルを追加し、**これらのユーザーのメッセージをスキップ** と **これらの単語を含むメッセージをスキップ** の一覧を管理できます。

## 配信ロール

`streamrole <fromRole> <addRole>` を実行すると、**fromRole** のメンバーが配信中は **addRole** が付与され、配信を終了すると取り外されます。`streamrolekeyword <keyword>` を使うと、配信タイトルにキーワードを含む配信のみを対象にできます。キーワードなしで実行すると設定を解除します。ホワイトリストに登録されたメンバーは、キーワードが一致しなくても配信中にロールを付与されます。ブラックリストに登録されたメンバーには、ロールは一切付与されません。引数なしで `streamrole` を実行すると、この機能はオフになります。ボットがロールを管理する権限を失った場合、またはロールが削除された場合は、この機能が自動的に無効になります。

**配信ロール** タブでは、**対象ロール**、**配信中に付与するロール**、**配信タイトルのキーワード**を設定できます。また、ユーザーIDで指定する **ホワイトリスト** と **ブラックリスト** の一覧もあります。

## AIアシスタント

AIアシスタントは、選択した1つのチャンネルに投稿されたすべてのメッセージに応答します。メンバーごとに直近5回分のやり取りを文脈として保持します。そのチャンネルで `deletesession` と入力すると、自分の会話がリセットされます。

| 設定 | コマンド | 内容 |
| --- | --- | --- |
| チャンネル | `aichannel [#channel] [enabled]` | AIアシスタントが反応する唯一のチャンネル |
| プロバイダーとモデル | `aimodel <OpenAi\|Groq\|Claude> [model]` | 呼び出すAPIとモデル |
| APIキー | `aikey` | そのプロバイダー用の自分のキー。ボットに保存され、再表示されません |
| システムプロンプト | `aiprompt <text>` | モデルが従う指示 |
| Web検索 | `aiwebsearch <true\|false>` | モデルによるWeb検索を許可します（Claudeのみ） |
| Webhook | `aiwebhook [name] [avatarUrl]` | カスタムの名前とアバターを使い、Webhook経由で返信を投稿します |
| カスタム埋め込み | `aicustomembed [template]` | 返信を埋め込みで囲みます。`%airesponse%` が回答の挿入位置になります |

`aiconfig` を実行すると、現在の設定が表示されます。**AIアシスタント** タブでは、**アシスタントを有効化**、**チャンネル**、**プロバイダー**、**モデル**、**APIキー**、**システムプロンプト**、**Web検索を許可**、**「Web検索中」の通知を非表示** を設定できます。

> [!WARNING]
> AIアシスタントは、あなたのAPIキーを使用し、料金もあなたに請求されます。キーが設定されていない場合、そのチャンネルのメッセージにはエラーが返信されます。

## NSFWフィルター

**NSFWフィルター** タブには、NSFWモジュールの画像検索でブロックするタグが一覧表示されます。**ブロックするタグ** に入力してタグを追加するか、タグをクリックして削除します。対応するコマンドは、NSFWモジュールの `nsfwtagbl [tag]` です。タグを省略すると、現在のブラックリストが表示されます。

## ロールモニター

**ロールモニター** タブでは、サーバー管理モジュールのロールモニターを設定できます。これは、保護対象として指定したロールや権限が付与されたときに反応する機能です。**デフォルトの処罰**（変更を元に戻すのみ、警告、すべてのロールを削除、ミュート、タイムアウト、キック、BAN）を選択し、保護するロールと権限を追加します。また、除外対象となる **信頼されたロール** と **信頼されたメンバー** を一覧で設定できます。コマンド（`addblacklistedrole`、`addblacklistedpermission`、`whitelistuser`、`whitelistrole`、`setdefaultpunishment`、`listblacklists`）はサーバーのオーナーのみが使用でき、サーバー管理モジュールにあります。

## リマインダー

`remind me <time> <message>` を実行すると、後であなたにDMが届きます。`remind here <time> <message>` は現在のチャンネルに投稿します。`remind #channel <time> <message>` は別のチャンネルを指定するもので、メッセージの管理権限が必要です。時間は `2h30m`、`3 days`、`1w`、`in 45 minutes` のように書き、最大60日後まで設定できます。`remindlist` は、リマインダーを番号付きで表示し、`reminddelete <index>` で1件を削除します。メッセージ内のメンションは、そのチャンネルで全員へのメンションが許可されていなければ無効化されます。

## スナイプ

スナイプは、管理者が `snipeset enable` を実行するまで無効です。有効にすると、ボットは削除されたメッセージと編集前のメッセージを30日間保持します。`snipe [#channel] [@user]` は最新の削除メッセージを表示し、`editsnipe` は最新の編集履歴を表示します。`snipelist` と `editsnipelist` は直近5件（または指定した件数）を表示します。チャンネルまたはユーザーで絞り込むこともできます。

## リピーター

リピーターは、スケジュールに従ってメッセージを投稿します。`repeat <message>` は5分間隔になります。`repeat <interval> <message>` は5秒から25000分のあいだで間隔を設定します。`repeat <time of day> <message>` は1日1回実行されます。各リピーターには番号があり、`repeatlist` で確認できます。

| トリガーモード | 動作 |
| --- | --- |
| `timeinterval` | 指定した間隔ごとに投稿します（既定） |
| `onactivity` | 指定した時間枠内にチャンネルで一定数のメッセージが送られた後に投稿します（`repeatactivity`） |
| `onnoactivity` | 指定した時間枠のあいだチャンネルが静かだったときに投稿します |
| `immediate` | すぐに投稿し、その後は間隔に従います |
| `aftermessages` | 一定数のメッセージが送られた後に投稿します |

リピーターごとのその他の設定です。`repeatredun` は、リピーターのメッセージがすでにチャンネルの最後のメッセージになっている場合に投稿をスキップします。`repeatschedule <business\|evening\|weekend\|custom>` は実行時間帯を制限します。`repeatconversation` は会話の検出を切り替えます。`repeatpriority` は0から100までの優先度を設定します。`repeatthreadonly` と `repeatthreadautosticky` はスレッドを対象にします。`repeatforumtags` はフォーラム投稿をタグで制限します。`repeatsuppressnotifications` は通知を出さずに送信します。`repeattoggle` は一時停止します。

## メッセージ集計と招待

`togglemsgcount` でメッセージ集計をオンにします。`usermessages`、`channelmessages`、`servermessages`、`topusers` は集計結果を表示し、`activitygraph` は最も活発な時間帯または曜日をグラフで表示します。`minmsglength` は、指定した長さより短いメッセージを集計対象から除外します。`resetmessagecounts` は、確認後にユーザー、チャンネル、またはその両方の集計をリセットします。

招待の追跡では、各メンバーを誰が招待したかを記録します。`invites`、`whoinvited`、`invitedusers`、`inviteleaderboard` でデータを確認できます。`toggleinvitetracking`、`toggleremoveinviteonleave`、`setminaccountage <days>` で設定します。最低アカウント年齢より新しいアカウントは、集計対象になりません。

## 設定

ダッシュボードのページは、**エイリアス**、**引用**、**自動公開**、**配信ロール**、**AIアシスタント**、**NSFWフィルター**、**ロールモニター** のタブに分かれています。

| 設定 | 既定値 | 制御する内容 |
| --- | --- | --- |
| エイリアスのトリガーと割り当て先 | なし | 書き換える単語と、変換後のコマンド |
| 引用のキーワードとテキスト | なし | 保存された引用 |
| 自動公開チャンネル | なし | ボットが公開を行うアナウンスチャンネル |
| これらのユーザーのメッセージ / これらの単語を含むメッセージをスキップ | なし | チャンネルごとの公開ブラックリスト |
| 対象ロール | なし | 配信ロールを受け取れるメンバー |
| 配信中に付与するロール | なし | 付与および取り外されるロール |
| 配信タイトルのキーワード | 任意の配信 | このテキストを含む配信のみが対象になります |
| アシスタントを有効化 | オフ | AIチャンネルが応答するかどうか |
| プロバイダー、モデル、APIキー、システムプロンプト | なし | AIの設定 |
| Web検索を許可 | オフ | Claudeのウェブ検索 |
| 「Web検索中」の通知を非表示 | オン | モデルのWeb検索に関するステータスメッセージを表示しません |
| ブロックするタグ | なし | フィルターされるNSFW検索タグ |
| デフォルトの処罰 | デフォルトを使用 | ロールモニターの処置 |

スナイプ、メッセージ集計、招待の追跡、リピーター、リマインダー、リンクプレビューには、ダッシュボードの設定項目はありません。

## セットアップの手順

1. ダッシュボードで **ユーティリティ** を開きます。
2. **エイリアス** で、`play youtube` に割り当てた `yt` のようなトリガーを追加します。Discordで試してください。
3. **自動公開** で、アナウンスチャンネルを追加します。ボットやWebhookのユーザーがいる場合は、スキップリストに追加します。
4. **配信ロール** で、対象ロールと付与するロールを選び、必要に応じてタイトルのキーワードを設定します。ボットのロールが、付与するロールより上にあることを確認してください。
5. **AIアシスタント** で、チャンネル、プロバイダー、モデルを選び、キーを貼り付け、システムプロンプトを書いて有効にします。
6. 削除メッセージのスナイプを使う場合は、Discordで `snipeset enable` を実行します。メッセージ統計を使う場合は `togglemsgcount` を実行します。

## コマンド

サーバーのプレフィックスを付けて実行します（変更していなければ `.`）。

| コマンド | エイリアス | 必要な権限 | 用途 |
| --- | --- | --- | --- |
| `alias <trigger> [mapping]` | `cmdmap` | 管理者 | エイリアスを追加します。割り当て先を省略すると削除します |
| `aliaslist` | `cmdmaplist`, `aliases` | なし | エイリアスを一覧表示します |
| `aliasesclear` | `aliasclear` | 管理者 | すべてのエイリアスを削除します |
| `quoteadd <keyword> <text>` | `.` | なし | 引用を追加します |
| `quoteprint <keyword>` | `..` | なし | キーワードの引用をランダムに表示します |
| `quoteshow <id>` | | なし | IDを指定して引用を表示します |
| `quotesearch <keyword> <text>` | `qsearch` | なし | キーワードとテキストで引用を検索します |
| `quoteid <id>` | `qid` | なし | 引用を追加したユーザーを表示します |
| `listquotes [page] [order]` | `liqu` | なし | 引用をページ送りで表示します |
| `quotedelete <id>` | `qdel` | なし（自分の引用）または管理者 | 引用を削除します |
| `delallquotes <keyword>` | `daq`, `delallq` | 管理者 | キーワードに属するすべての引用を削除します |
| `quoteexport` | `qexport` | 管理者 | 引用をJSONでエクスポートします |
| `quoteimport` | `qimport` | 管理者 | 添付したJSONファイルから引用をインポートします |
| `addautopublish <#channel>` | `addautopub`, `aap` | 管理者 | ニュースチャンネルを自動公開に設定します |
| `removeautopublish <#channel>` | `removeautopub` | 管理者 | 自動公開を停止します |
| `addpublishblacklist <@user> <#channel>` または `<#channel> <word>` | `addpubbl` | 管理者 | ユーザーまたは単語をスキップ対象にします |
| `removepublishblacklist <@user> <#channel>` または `<#channel> <word>` | `removepubbl` | 管理者 | スキップ設定を削除します |
| `getautopublishes` | `getaps` | 管理者 | 自動公開チャンネルを一覧表示します |
| `streamrole [fromRole] [addRole]` | | ロールの管理 | 配信ロールを設定します。ロールを指定せずに実行すると無効にします |
| `streamrolekeyword [keyword]` | `srkw` | ロールの管理 | 配信タイトルにキーワードを必須にします |
| `streamroleblacklist <add\|remove> <@user>` | `srbl` | ロールの管理 | このメンバーには、ロールを決して付与しません |
| `streamrolewhitelist <add\|remove> <@user>` | `srwl` | ロールの管理 | 配信中は、このメンバーに必ずロールを付与します |
| `aichannel [#channel] [enabled]` | `aic` | サーバーの管理 | AIチャンネルを設定します |
| `aimodel <provider> [model]` | `aim` | サーバーの管理 | プロバイダーとモデルを設定します |
| `aikey` | `ak` | 管理者 | APIキーを設定します |
| `aiprompt <text>` | `aip` | サーバーの管理 | システムプロンプトを設定します |
| `aiwebsearch <true\|false>` | `aws` | サーバーの管理 | Claudeのウェブ検索を設定します |
| `aiwebhook [name] [avatar]` | `aiw` | 管理者 | Webhook経由で返信します。名前を省略すると無効にします |
| `aicustomembed [template]` | `aice` | 管理者 | 返信用の埋め込みテンプレートを設定します |
| `aiconfig` | `ac` | なし | AIの設定を表示します |
| `remind <me\|here> <time> <message>` | | なし | リマインダーを設定します |
| `remind <#channel> <time> <message>` | | メッセージの管理 | 別のチャンネルにリマインダーを設定します |
| `remindlist` | `remindl`, `remindlst` | なし | 自分のリマインダーを表示します |
| `reminddelete <index>` | `remindrm`, `reminddel` | なし | リマインダーを削除します |
| `snipeset <enable\|disable>` | `setsnipe` | 管理者 | スナイプを有効または無効にします |
| `snipe [#channel] [@user]` | | なし | 最後に削除されたメッセージを表示します |
| `editsnipe [#channel] [@user]` | | なし | 最後に編集されたメッセージを表示します |
| `snipelist [#channel] [@user] [amount]` | `slist` | なし | 最近削除されたメッセージを表示します |
| `editsnipelist [#channel] [@user] [amount]` | `esnipelist` | なし | 最近編集されたメッセージを表示します |
| `repeat [time] [interval] <message>` | | メッセージの管理 | リピーターを作成します |
| `repeatlist` | `replst`, `replist`, `repli` | メッセージの管理 | リピーターを一覧表示します |
| `repeatremove <index>` | `reprm` | メッセージの管理 | リピーターを削除します |
| `repeatinvoke <index>` | `repinv` | メッセージの管理 | 今すぐ投稿します |
| `repeatmessage <index> <message>` | `repmsg` | メッセージの管理 | テキストを変更します |
| `repeatchannel <index> [#channel]` | `repchan` | メッセージの管理 | 投稿先を変更します |
| `repeatredun <index>` | `repred` | メッセージの管理 | 重複チェックを切り替えます |
| `repeattriggermode <index> <mode>` | `reptriggermode`, `repmode` | メッセージの管理 | 上の表のトリガーモードを設定します |
| `repeatactivity <index> <messages> <window>` | `repactivity`, `repact` | メッセージの管理 | 活動のしきい値を設定します |
| `repeatpriority <index> <0-100>` | `reppriority`, `repprio` | メッセージの管理 | 優先度を設定します |
| `repeatschedule <index> <preset>` | `repschedule`, `repsched` | メッセージの管理 | 時間帯のスケジュールを設定します |
| `repeatconversation <index>` | `repconversation`, `repconv` | メッセージの管理 | 会話の検出を切り替えます |
| `repeattoggle <index>` | `reptoggle`, `reptog` | メッセージの管理 | 一時停止または再開します |
| `repeatthreadautosticky <index>` | `repthreadauto`, `repthreads` | メッセージの管理 | 新しいスレッドで固定します |
| `repeatthreadonly <index>` | `repthreadonly`, `reptonly` | メッセージの管理 | スレッド内にのみ投稿します |
| `repeatsuppressnotifications <index>` | `repsuppressnotif`, `repsilent`, `repsuppress` | メッセージの管理 | 通知を出さずに送信します |
| `repeatforumtags <index> <action> [tagType] [tags]` | `repforumtags`, `repftags` | メッセージの管理 | フォーラムのタグルールを設定します |
| `togglemsgcount` | `togglemessagecount` | 管理者 | メッセージ集計をオンまたはオフにします |
| `minmsglength [length]` | `mmlength`, `minmlength` | サーバーの管理 | 短いメッセージを無視します |
| `usermessages [@user]` | `usermsg`, `umsg` | なし | メンバーのメッセージ統計を表示します |
| `channelmessages [#channel]` | `channelmsg`, `cmsg` | なし | チャンネルのメッセージ統計を表示します |
| `servermessages` | `servermsg`, `smsg`, `guildmessages`, `guildmsg`, `gmsg` | なし | サーバー全体の統計を表示します |
| `topusers` | `topu` | なし | メッセージ数の上位10人を表示します |
| `activitygraph [days\|hours]` | `actgraph` | なし | 最も活発な時間帯のグラフを表示します |
| `resetmessagecounts [@user] [#channel]` | `rmc`, `resetmsgcounts`, `resetmessages`, `resetcounts` | メッセージの管理 | 集計をリセットします |
| `invites [@user]` | | なし | 招待数を表示します |
| `whoinvited [@user]` | `invitedby` | なし | メンバーを招待したユーザーを表示します |
| `invitedusers [@user]` | `userinvites` | なし | あるユーザーが招待したメンバーを表示します |
| `inviteleaderboard` | `inviteslb` | なし | 招待数の上位者を表示します |
| `invitesettings` | `inviteconfig` | サーバーの管理 | 招待の設定を表示します |
| `toggleinvitetracking` | | サーバーの管理 | 招待の追跡をオンまたはオフにします |
| `toggleremoveinviteonleave` | `triol` | サーバーの管理 | 招待された人が退出したら、招待数から除外します |
| `setminaccountage <days>` | `inviteminage` | サーバーの管理 | 新しいアカウントを無視します |
| `joinstats` | `jstats` | ベータフラグ（`dragon`） | 参加のグラフ |
| `leavestats` | `lstats` | ベータフラグ（`dragon`） | 退出のグラフ |
| `joinstatscolor [r g b]` | `jstatscolor` | ベータフラグ（`dragon`） | 参加グラフの色。値を省略すると金色 |
| `leavestatscolor [r g b]` | `lstatscolor` | ベータフラグ（`dragon`） | 退出グラフの色。値を省略すると金色 |
| `userinfo [@user]` | `uinfo` | なし | メンバーの詳細 |
| `serverinfo [name]` | `sinfo` | なし | サーバーの詳細 |
| `channelinfo [#channel]` | `cinfo` | なし | テキストチャンネルの詳細 |
| `vinfo [channel]` | `voiceinfo` | なし | ボイスチャンネルの詳細 |
| `rinfo <role>` | `roleinfo` | なし | ロールの詳細 |
| `fetch <id>` | | なし | IDでユーザーを検索します |
| `avatar [@user]` | `av` | なし | アバターを表示します。サーバーアバターのボタン付き |
| `banner [@user]` | `userbanner` | なし | ユーザーのバナー |
| `userid [@user]` | `uid` | なし | ユーザーID |
| `roleid <role>` | `rid` | なし | ロールID |
| `channelid` | `cid` | なし | チャンネルID |
| `serverid` | `sid` | なし | サーバーID |
| `roles [@user]` | | なし | サーバーのロール、またはメンバーのロール |
| `inrole <role>` | | なし | ロールを持つメンバー |
| `inroles <role> <role>` | | なし | 両方のロールを持つメンバー |
| `rolepermlist [and\|or] <permissions...>` | `roleperms` | なし | 権限を持つロール |
| `channeltopic [#channel]` | `ct` | なし | チャンネルのトピック |
| `whosplaying <game>` | `whpl` | なし | ゲームをプレイ中のメンバー |
| `emotelist [type]` | | なし | サーバーの絵文字 |
| `showemojis <emojis>` | `se` | なし | 絵文字を拡大表示します |
| `say [#channel] <text or embed JSON>` | | メッセージの管理 | ボットとして発言します |
| `getjson <messageId> [#channel]` | | メッセージの管理 | メッセージの埋め込みJSONを表示します |
| `embedsave <name> <json>` | `esave` | なし | 個人用の埋め込みテンプレートを保存します |
| `guildembedsave <name> <json>` | `gesave`, `gembedsave` | メッセージの管理 | サーバー用の埋め込みテンプレートを保存します |
| `embedlist` / `guildembedlist` | `elist` / `gelist`, `gembedlist` | なし | テンプレートを一覧表示します |
| `embeddelete <name>` / `guildembeddelete <name>` | `edel`, `edelete` / `gedel`, `gembeddelete` | なし / メッセージの管理 | テンプレートを削除します |
| `embedpreview <name>` | `epreview`, `eprev` | なし | テンプレートをプレビューします |
| `debugembed <text>` | `embeddebug` | 管理者 | 埋め込みの解析をテストします |
| `savechat <time> [#channel]` | | メッセージの管理 | チャットログを保存し、リンクを取得します |
| `calculate <expression>` | `calc` | なし | 数式を計算します |
| `calcops` | | なし | 使用できる数学演算を表示します |
| `plot <function> [start] [end]` | `graphfunction` | なし | 関数をグラフ化します |
| `sym <expression>` | `symbolicmath` | なし | 記号計算を行います |
| `convertunits <from> <to> <value>` | `unitconvert`, `units` | なし | 単位を変換します |
| `convertlist` | | なし | 対応している単位を表示します |
| `convert <format>` | | なし | 添付されたメディアファイルを変換します |
| `roll <dice>` | | なし | サイコロを振ります。DnD表記に対応しています |
| `owoify <text>` | `owo` | なし | テキストを「OwO」風に変換します |
| `vcheck [url]` | `viruscheck` | なし | リンクをVirusTotalでスキャンします |
| `traceroute <host>` | `tracert`, `trcrt` | なし | ホストへの経路を追跡します |
| `pingip <ip> [count]` | | なし | IPアドレスにpingを送ります。最大10回です |
| `previewlinks <yes\|no>` | `plinks` | 管理者 | リンクプレビューを切り替えます |
| `verboseerror [true\|false]` | `ve` | メッセージの管理 | コマンドエラーの詳細表示を切り替えます |
| `ping` | | なし | ボットの応答速度 |
| `stats` | | なし | ボットの統計 |
| `invite` | | なし | ボットの招待リンクとサポートリンク |
| `vote` | | なし | 投票リンク |

## ヒントと注意点

- エイリアスは文字列を書き換えるだけです。割り当て先のコマンドは、それぞれの権限チェックを受けます。
- 自動公開は、Discordのアナウンス（ニュース）チャンネルでのみ機能します。
- 配信ロールには、ボットのロールが付与するロールより上にある必要があります。ロールを管理できない場合は、配信のたびに失敗し続けるのではなく、この機能が自動的にオフになります。
- スナイプは既定でオフです。30日より古いスナイプは破棄されます。
- 60日を超えるリマインダーは受け付けられません。
- AIアシスタントは、設定された1つのチャンネルでのみ応答し、ボットのメッセージには反応しません。記憶としてメンバーごとの直近5件のメッセージを保持するため、長い会話では初期の文脈が失われます。
- メッセージ集計は、統計を取得する前にオンにしておく必要があります。過去のメッセージが後から集計されることはありません。
- `joinstats` と `leavestats` は、10秒に1回まで実行できます。
