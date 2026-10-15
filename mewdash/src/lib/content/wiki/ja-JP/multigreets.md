---
title: あいさつ
slug: multigreets
summary: メンバーが参加したときに、最大30チャンネルにウェルカムメッセージを投稿します。従来の退出、ブースト、DMのあいさつにも対応しています。
icon: fa-bell
category: Actions
dashboard: /dashboard/multigreets
module: MultiGreets
tags: [greets, multigreets, welcome, join message, goodbye, bye, leave message, boost message, greet dm, webhook, placeholders, あいさつ, ウェルカムメッセージ, 参加メッセージ, 退出メッセージ, ブーストメッセージ, あいさつDM, Webhook, プレースホルダー]
related: [rolegreets, invites, administration]
---

## 概要

メンバーが参加すると、Botは、あいさつを設定したすべてのチャンネルにメッセージを投稿します。各あいさつには、独自のメッセージ、削除タイマー、Webhookの表示名、Botの有効・無効の設定があります。すべてを同時に実行することも、参加のたびにランダムに1つを選ぶこともできます。

メッセージは埋め込みパーサーを通るため、あいさつはプレーンテキスト、ボタン付きの完全な埋め込み、またはカスタムの名前とアイコンを持つWebhookの投稿にできます。プレースホルダーにより、メンバーの名前、サーバー名、メンバー数、招待の追跡がオンの場合は招待した人が入ります。

従来の単一メッセージの仕組みも残っています。メンバーが退出したときの退出メッセージ、ブーストしたときのブースト通知、非公開のウェルカムDMを扱います。これらは管理機能モジュールにあり、後で説明します。

## 使う理由

- 同じ参加に対して、`#general` では公開のウェルカムを、`#staff-joins` では控えめなログを残す。
- チャンネルごとに異なるあいさつのスタイルを使う。たとえば、あるチャンネルでは埋め込み、別のチャンネルではWebhookの「キャラクター」にする。
- あいさつを複数用意しておき、新しいメンバーごとにランダムに1つ選ばれるようにする。
- 短いウェルカムメッセージを、1分後に自動で削除させてチャンネルが埋まらないようにする。
- ほかの設定をせずに、退出メッセージやブーストメッセージだけを使う。

## あいさつの種類

**Greet Type** はサーバー全体の設定で、参加時の動作を決めます。

| 種類 | ダッシュボードの表示 | 動作 |
| --- | --- | --- |
| MultiGreet | All Greets | 有効なあいさつがすべて、追加された順に実行されます。初期値です。 |
| RandomGreet | Random Greet | 一覧からランダムに1つ選ばれ、実行されます。無効なあいさつが選ばれた場合は、スキップされます。 |
| Off | Disabled | あいさつは一切実行されません。 |

## 1つのあいさつの内容

各あいさつは1つのチャンネルに紐づきます。1つのチャンネルには最大5つのあいさつを設定でき、サーバー全体では合計30まで設定できます。あいさつは一覧の位置で番号が振られ、コマンドではその番号を使います。

| 項目 | 初期値 | 意味 |
| --- | --- | --- |
| Channel | 追加したチャンネル | このあいさつを投稿する場所 |
| Message | 空 | テキストまたは埋め込みのテンプレート。空のあいさつは何も送信しません。 |
| Delete After | 0(削除しない) | あいさつが自動で削除されるまでの秒数 |
| Greet Bots | オフ | Botアカウントが参加したときにもあいさつを実行するか |
| Webhook | なし | Botとしてではなく、カスタムの名前とアイコンでWebhook経由で投稿 |
| Enabled | オン | 無効にしたあいさつは、削除されずにスキップされます |

チャンネルが削除された場合、次に実行されようとしたときにそのあいさつは削除されます。Webhookが削除された場合、またはBotに投稿する権限がなくなった場合は、参加のたびにエラーになるのを避けるため、そのあいさつは無効に切り替わります。

## プレースホルダー

あいさつは、ユーザー、サーバー、Botのプレースホルダーのセットを使って作成します。招待者のプレースホルダーは、招待ページで招待の追跡が有効になっている場合にのみ機能します。

| プレースホルダー | 値 |
| --- | --- |
| `%user%`、`%user.mention%` | 新しいメンバーのメンション |
| `%user.name%`、`%username%` | ユーザー名 |
| `%user.fullname%`、`%userfull%` | 完全なタグ |
| `%user.id%`、`%id%` | ユーザーID |
| `%user.avatar%`、`%useravatar%` | アバターのURL |
| `%user.banner%` | バナーのURL |
| `%user.created_date%`、`%user.created_time%` | アカウントが作成された日時 |
| `%user.joined_date%`、`%user.joined_time%` | このサーバーに参加した日時 |
| `%server%`、`%server.name%` | サーバー名 |
| `%server.id%`、`%sid%` | サーバーID |
| `%server.icon%`、`%server.banner%` | アイコンとバナーのURL |
| `%server.members%`、`%members%` | メンバー数 |
| `%server.boostlevel%`、`%server.boostcount%` | ブーストのティアとブーストの数 |
| `%server.time%`、`%server.timestamp.longdatetime%` | 現在の時刻。そのままの表示、またはDiscordのタイムスタンプ |
| `%bot.name%`、`%bot.id%`、`%bot.avatar%` | Bot自身の情報 |
| `%inviter.username%`、`%inviter.mention%`、`%inviter.id%`、`%inviter.avatar%` | 使われた招待を作成した人。不明な場合は `Unknown` |
| `%inviter.count%`、`%inviter.regular%`、`%inviter.left%`、`%inviter.fake%`、`%inviter.bonus%` | 招待者の招待数の集計 |
| `%invite.code%`、`%invite.url%`、`%invite.uses%`、`%invite.label%`、`%invite.type%` | 使われた招待、そのラベル、および招待・バニティリンク・アプリのいずれかの種類 |
| `%user.joincount%`、`%user.leavecount%` | このメンバーが参加・退出した回数 |
| `%server.members.ordinal%` | 1st、2nd、1,204th のような形式のメンバー数 |
| `%user.joined.R%`、`%user.created.F%`(t、T、d、D、f の形式も利用可能) | 参加日時とアカウント作成日時のDiscordタイムスタンプ |

> [!EXAMPLE]
> `Welcome %user.mention% to %server%! You are member #%server.members%.`

サーバー、チャンネル、Botのプレースホルダーの一覧は、プレースホルダーのページにあります。チャンネルのプレースホルダーは、あいさつでは埋められません。

## 従来のあいさつ、退出、ブーストのコマンド

これらは、複数のあいさつより前からある機能で、管理機能モジュールにあります。それぞれ1つのメッセージで、サーバーの設定に保存され、コマンドを実行したチャンネルから切り替えます。

| メッセージ | 実行されるタイミング | プレースホルダー |
| --- | --- | --- |
| 退出 (Bye) | メンバーが退出したとき | ユーザー、サーバー、Botのセット、およびチャンネルのプレースホルダー。`%user%` は退出したメンバーをメンションします。 |
| ブースト (Boost) | メンバーがブーストを開始したとき、または再度ブーストしたとき | ユーザー、チャンネル、サーバー、Bot、GIFのセット |
| あいさつDM (Greet DM) | メンバーが参加したとき、非公開のメッセージとして送信 | ユーザー、チャンネル、サーバー、Bot、GIFのセット |

`bye` または `boost` を実行すると、そのメッセージのオンとオフが切り替わり、入力したチャンネルに設定されます。`byedel` と `boostdel` は、自動削除のタイマーを秒単位で設定します。`boostdel` の上限は600です。テキストを指定せずにメッセージのコマンドを実行すると、現在のメッセージを表示します。`leavehook` は退出メッセージを、カスタムの名前とアイコンを持つWebhookで送信します。`leavehook disable` で解除します。

あいさつDMは注意して使ってください。認証されたBotでない限り、Botはこれを有効にする前に確認を求めます。認証されていないBotによる大量のDMは、Botが報告される原因になるためです。どのメンバーも、`greetdmoptout` を使うか、ダッシュボードの自分のプロフィールページにある **Welcome DMs** のトグルで、自分へのこれらのDMを拒否できます。

従来のチャンネル用のあいさつコマンドはありません。チャンネルへのウェルカムには、複数のあいさつを使ってください。

## 設定

すべての設定は、ダッシュボードのあいさつページにあります。

| 設定 | 初期値 | 内容 |
| --- | --- | --- |
| Greet Type | All Greets | All Greets、Random Greet、または Disabled |
| Add New Greet | | チャンネルを選び、**挨拶を追加** をクリック |
| Greeting Message | 空 | 1つのあいさつの埋め込みビルダー。コンテンツ、最大10個の埋め込み、コンポーネントに対応 |
| Delete After | なし | `1m30s` や `45s` のような時間を入力 |
| Webhook | 未設定 | Webhookの名前と、任意でアバターのURL |
| Greet Bots | オフ | Botアカウントでもあいさつを実行 |
| Enabled | オン | あいさつを削除せずにオフにする |

退出、ブースト、あいさつDMのメッセージは、このページにはありません。上記のコマンドで設定してください。

## セットアップの手順

1. ダッシュボードで **あいさつ** を開き、**Greet Type** は **すべての挨拶** のままにします。
2. **新しい挨拶を追加** で、ウェルカムを表示するチャンネルを選び、**挨拶を追加** をクリックします。
3. 新しいカードで **挨拶メッセージ** を開き、上記のプレースホルダーを使ってメッセージを作成します。保存してください。
4. 任意で **削除までの時間** を設定し、**Webhook** の名前とアイコンを追加します。Botの参加も通知したい場合は **Botにも挨拶** をオンにします。
5. ほかのチャンネルでも同様に設定します。同じチャンネルに複数のあいさつを追加して、バリエーションを持たせたい場合は **ランダムな挨拶** に切り替えます。
6. 退出メッセージを設定するには、使いたいチャンネルで `byemsg Goodbye %user%, we will miss you` を実行し、次に `bye` を実行してオンにします。
7. ブーストメッセージを設定するには、`boostmsg Thanks for boosting, %user%!` を実行し、次に `boost` を実行します。
8. `byetest` と `boosttest` でテストします。複数のあいさつにはプレビューがあります。`multigreetmessage 1` を実行し、**プレビュー** を押してください。

## コマンド

これらのコマンドは、サーバーのプレフィックス(変更していなければ `.`)を付けて実行します。複数のあいさつのコマンドは、`/multigreets add`、`/multigreets remove` などのスラッシュコマンドとしても使えます。

| コマンド | エイリアス | 必要な権限 | 目的 |
| --- | --- | --- | --- |
| `multigreetadd [#channel]` | `mgadd`, `mga` | 管理者 | チャンネルのあいさつを追加。省略すると現在のチャンネル |
| `multigreetremove <number or #channel>` | `mgrem`, `mgrm`, `mgr` | 管理者 | 番号で1つのあいさつを削除、または確認後にチャンネルのすべてのあいさつを削除 |
| `multigreetmessage <number> [message]` | `mgmsg`, `mgm` | 管理者 | あいさつのテキストまたは埋め込みを設定。メッセージを省略すると、プレビューまたは生のテンプレートを表示 |
| `multigreetdelete <number> <time or seconds>` | `mgdel`, `mgd` | 管理者 | 自動削除のタイマー。例: `1m` または `60`。`0` でオフ |
| `multigreetdisable <number> <true or false>` | `mgdisable`, `mgdis` | 管理者 | `true` であいさつを無効化、`false` で有効化 |
| `multigreetgreetbots <number> <true or false>` | `multigreetbots`, `mggb` | 管理者 | このあいさつをBotに対しても実行するか |
| `multigreetwebhook <number> [name] [avatar url]` | `mgwebhook`, `mghook`, `mgh` | 管理者 | あいさつ用のWebhookを作成。名前を省略すると削除 |
| `multigreettype <multigreet, randomgreet or off>` | `mgtype`, `mgt` | 管理者 | サーバー全体のあいさつの種類を変更 |
| `multigreetlist` | `mglist`, `mgl` | 管理者 | すべてのあいさつを設定とともにページ送りで表示 |
| `bye` | | サーバー管理 | このチャンネルで退出メッセージを切り替え |
| `byemsg [text]` | | サーバー管理 | 退出メッセージを表示または設定 |
| `byedel [seconds]` | | サーバー管理 | 退出メッセージの自動削除タイマー。初期値は30 |
| `byetest [@user]` | | サーバー管理 | 退出メッセージをテストとして送信 |
| `leavehook [#channel] [name] [image url] [text]` | `byehook` | サーバー管理 | Webhook経由で退出メッセージを送信。`leavehook disable` で解除 |
| `boost` | | サーバー管理 | このチャンネルでブーストメッセージを切り替え |
| `boostmsg [text]` | `boostmessage` | サーバー管理 | ブーストメッセージを表示または設定 |
| `boostdel [seconds]` | `boostdelete` | サーバー管理 | ブーストメッセージの自動削除タイマー。0から600、初期値は30 |
| `boosttest [@user]` | `testboost` | サーバー管理 | ブーストメッセージをテストとして送信 |
| `greetdm` | | サーバー管理 | ウェルカムDMを切り替え |
| `greetdmmsg [text]` | | サーバー管理 | ウェルカムDMのテキストを表示または設定 |
| `greetdmtest [@user]` | | サーバー管理 | ウェルカムDMをテストとして送信 |
| `greetdmoptout` | `gdmoptout` | なし | このBotからのウェルカムDMを、どこからも受け取らないように設定 |

## ヒントと注意点

- `multigreetdelete` にはBotのメッセージの管理の権限が必要で、`multigreetwebhook` と `leavehook` にはWebhookの管理の権限が必要です。
- あいさつの番号は一覧の位置なので、1つを削除すると、それ以降のすべての番号がずれます。編集する前に `multigreetlist` を実行してください。
- `multigreettype` の `off` オプション、`/multigreets type`、ダッシュボードの **無効** ボタンはすべて同じあいさつの種類を設定します。そのため、どれを使っても、あいさつを削除せずにシステム全体をオフにできます。
- 招待のプレースホルダーは、あいさつを送信する前に、参加が招待に紐づけられるまで最大5秒待つため、同時に複数の人が参加しても招待者が正しく表示されます。
- ウェルカムDMは、メンバーがサーバーのメンバーからのDMを許可している場合にのみ機能します。失敗したDMは無視されます。
- ロールのあいさつは別の機能で、参加時ではなく、ロールが付与されたときに実行されます。
