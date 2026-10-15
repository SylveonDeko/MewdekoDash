---
title: サーバー管理
slug: servermanagement
summary: サーバーの構成をまとめて管理できます。チャンネルとロールの作成や削除、数百人のメンバーへのロール付与、サーバーのロックダウン、チャンネル上書きの同期、絵文字の盗用、危険なロール変更の監視などを行えます。
icon: fa-server
category: Actions
module: ServerManagement
tags: [server management, roles, mass role, channels, lockdown, slowmode, lock channel, nuke, emotes, steal emotes, webhook, permcontrol, role monitor, role jobs, server icon, server banner, サーバー管理, ロール, 一括ロール, チャンネル, ロックダウン, 低速モード, チャンネルのロック, ヌーク, 絵文字, 絵文字の盗用, Webhook, 権限制御, ロール監視, ロールジョブ, サーバーアイコン, サーバーバナー]
related: [administration, permissions, moderation]
---

## 概要

サーバー管理には、メンバーではなくサーバーの構造を変更するコマンドがまとめられています。スタッフは、1行のコマンドでカテゴリとそのチャンネルをまとめて作成したり、チャンネルの名前変更や削除、トピックの設定、NSFWの切り替え、低速モードの設定、チャンネルのロックができます。また、チャンネルを削除して作り直し、履歴を消去することもできます。

ロールの管理が中心です。単発のコマンドでは、ロールの作成、名前変更、色の変更、区切り表示の切り替え、削除、そして1人のメンバーへのロール付与（任意でタイマー設定）ができます。一括コマンドでは、全メンバー、すべての人間、すべてのボット、別のロールを持つ全員、または指定日時より前後に参加したメンバー全員にロールを追加または削除できます。これらはバックグラウンドジョブとして実行され、一覧表示や停止ができます。

このモジュールは、サーバー自体の外観（アイコン、バナー、スプラッシュ、名前）、絵文字の管理（他サーバーの絵文字の盗用を含む）、チャンネルごとの権限上書き、ボイスチャンネルへの移動、3種類のロックダウン、そして危険なロール変更を元に戻して処罰するロール監視も扱います。

この機能はダッシュボードでは設定しません。すべてコマンドから実行します。

## 利用するメリット

- 新しいサーバーを立ち上げる際、Discordの画面で何度もクリックしなくても、1つのカテゴリに10個のチャンネルを作成できます。
- ロールによるアクセス制限を有効にした後、既存の2,000人のメンバー全員に「Member」ロールを付与できます。
- レイド中にサーバー全体の投稿を禁止し、その後で元の権限を正確に復元できます。
- 友人のサーバーの絵文字を、1つのコマンドでコピーできます。
- モデレーターが、禁止リストに登録された権限をロールに追加して自分に管理者権限を与えることを防げます。

## チャンネル

### 作成と編集

`creatxtchanl <name>` と `creatvoichanl <name>` は、テキストチャンネルまたはボイスチャンネルを1つ作成します。`deltxtchanl <#channel>` と `delvoichanl <channel>` は、それぞれ1つ削除します。

`cc...` のコマンド群は、複数のチャンネルをまとめて作成します。

| コマンド | 作成される内容 |
| --- | --- |
| `ccatc <category name> <channel names...>` | 新しいカテゴリと、その中のテキストチャンネル |
| `ccavc <category name> <channel names...>` | 新しいカテゴリと、その中のボイスチャンネル |
| `cctc <existing category> <channel names...>` | 既存のカテゴリ内のテキストチャンネル |
| `ccvc <existing category> <channel names...>` | 既存のカテゴリ内のボイスチャンネル |

`renamechannel <channel> <name>` は任意のチャンネルの名前を変更し、`setchanlname <name>` は現在いるチャンネルの名前を変更します。`settopic [text]` は現在のチャンネルのトピックを設定または消去し、`nsfwtoggle` は現在のチャンネルのNSFWフラグを切り替えます。

### 低速モード、ロック、ヌーク

`slowmode` を単独で実行すると、現在のチャンネルの低速モードを1分とオフの間で切り替えます。`slowmode 30s` のように `slowmode <time>` を指定すると、特定の間隔を設定できます。どちらの形式でも、チャンネルの引数を指定できます。21600秒（6時間）以上の値は拒否されます。

`lock [#channel]` は、そのチャンネルで `@everyone` ロールに対して「メッセージを送信」の拒否を追加します。`unlock [#channel]` はそれを削除します。既存のチャンネル上書きの設定は保持されます。

`nuke [#channel]` は確認を求めた後、チャンネルを削除し、同じ名前、位置、トピック、権限上書き、NSFWフラグ、カテゴリ、低速モードを持つ新しいチャンネルを作成します。ピン留め、Webhook、メッセージ履歴は完全に失われます。

### 権限上書き

`permcontrol <channel> <allow|deny|inherit> <role or user> <permissions...>` は、チャンネル上の1つの対象に対する上書きを、他の設定に影響を与えずに編集します。`permview [@user or role]` は、あなた、メンバー、またはロールが現在どの権限を持っているかを一覧表示します。

`syncroletoall <role>` は、現在のチャンネルにあるそのロールの上書きを、すべてのテキストチャンネルとカテゴリにコピーします。`syncroletoallchannels` と `syncroletoallcategories` は、それぞれチャンネルのみ、またはカテゴリのみを対象にします。このコマンドを実行するチャンネルに、そのロールの上書きがすでに存在している必要があります。

### Webhook

`createwebhook <#channel> <name> [avatar url]` は Webhook を作成します。URLを指定しない場合、添付された画像がアバターとして使われます。ボットはチャンネルで完了を通知し、Webhook の URL とトークンをDMで送信します。

## ボイス

- `moveto <voice channel>` は、あなたを移動させます。
- `moveuserto @user <voice channel>` は、他のユーザーを移動させます。
- `grab @user` は、そのユーザーをあなたのいるボイスチャンネルに引き込みます。

## ロックダウン

`lockdown [type] [action] [override]` と `liftlockdown [type]` には、管理者権限が必要です。

| 種類 | 内容 |
| --- | --- |
| `Joins` | ロックダウンの有効中に参加したユーザーは、キックまたはBANされます。デフォルトの処理は `Ban` で、もう一つの選択肢は `Kick` のみです。 |
| `Readonly` | ボットは各チャンネルの現在の `@everyone` 上書きを保存した後、テキストチャンネルでは「メッセージを送信」、スレッドの作成、スレッドへの返信を拒否し、ボイスチャンネルでは「接続」と「発言」を拒否します。フォーラムチャンネルでは、既存のスレッドを読めるように「メッセージを送信」を維持します。 |
| `Full` | 上記の両方です。 |

読み取り専用のロックダウンを適用する前に、ボットはすべてのチャンネルを編集できるかを確認します。編集できないチャンネルがある場合は、それらを一覧表示して処理を停止します。3番目の引数に `true` を指定すると、そのまま続行します。ロックダウンを解除すると、保存された上書きが復元されます。参加者のロックダウンは、ボットの再起動後も維持されます。

`unlockdown` は別の、古いツールです。`@everyone` ロール自体の設定を編集してロックダウンしたサーバー向けに、そのロールの「メッセージを送信」を再び有効にします。

> [!WARNING]
> 引数なしの `lockdown` は読み取り専用のロックダウンになり、`lockdown joins` は、デフォルトで参加者をBANします。キックしたい場合は `kick` を指定してください。

## ロール

### 単一ロールのコマンド

| コマンド | 内容 |
| --- | --- |
| `createrole [name]` | ロールを作成します（メンション不可）。 |
| `deleterole <role>` | 自分の最上位ロールより下のロールを削除します。 |
| `renamerole <role> <name>` | ロールの名前を変更します。 |
| `rolecolor <role> [colour]` | ロールの色を表示、または設定します。 |
| `rolehoist <role>` | ロールをメンバーリストで個別に表示するかを切り替えます。 |
| `setrole <role> @user [time]` | ロールを付与します。`2h` などの `time` を指定すると、その後で自動的に削除されます。 |
| `removerole <role> @user` | ロールを取り除きます。 |
| `removeallroles @user` | メンバーから、管理されていないロールをすべて削除します。 |

`setrole` と `removerole` では、ロールとメンバーの引数の順序を入れ替えても構いません。

### 複数のロールまたはメンバーへの一括操作

- `createroles <names...>` は、確認後に単語ごとに1つのロールを作成します。
- `deleteroles <roles...>` は、確認後に複数のロールを削除します。管理対象のロールはスキップされます。
- `setroles @user <roles...>` は、1人のメンバーに複数のロールを付与します。`setroles @user <time> <roles...>` を使うと、期間付きで付与されます。
- `removeroles @user <roles...>` は、1人のメンバーから複数のロールを削除します。
- `adduserstorole <role> @user @user...` と `removeusersfromrole <role> @user @user...` は、複数のメンバーに対して操作します。

### 一括ロールジョブ

これらは全メンバーリストを対象にし、バックグラウンドジョブとして実行されます。Discordのレート制限のため、ボットはメンバーごとに短時間待機し、サーバーごとに同時実行できるジョブは5つまでです。各ジョブは、完了までの予想時間を報告します。

| コマンド | 対象 |
| --- | --- |
| `addtoall <role>` | そのロールを持っていないすべてのメンバー |
| `addtoallusers <role>` | 人間のみ |
| `addtoallbots <role>` | ボットのみ |
| `addtousersover <time> <role>` | `time` 以上前に参加したメンバー（例：`30d`） |
| `addtousersunder <time> <role>` | `time` より最近に参加したメンバー |
| `addroletorole <role> <role2>` | `role2` を持つ全員に `role` を付与 |
| `addthenremove <role> <role2>` | `role2` を持つ全員に `role` を付与した後、`role2` を削除 |
| `removefromall <role>` | そのロールを持つ全員 |
| `removefromallusers <role>` | 人間のみ |
| `removefromallbots <role>` | ボットのみ |
| `removefromrole <role> <role2>` | `role2` を持つ全員から `role` を削除 |

`rolejobs` は、実行中のジョブを種類、開始者、進捗、ロールとともに一覧表示します。`stopjob <number>` は1つのジョブをキャンセルし、どこまで進んだかを報告します。

### エクスポートとインポート

`exportrolelist` は、ボットが管理できるすべてのロールについて、メンバーシップごとに1行 `roleId,userId,roleName` を記述した `rolelist.txt` ファイルを送信します。`importrolelist` は、コマンドに添付されたそのようなファイルを読み取り、ロールを再適用します。IDが存在しない場合にロールを名前で作成するには、`true` を指定します。`addroletolist <role>` は、添付されたユーザーIDのリストを読み取り、そのロールを付与します。

## サーバーの外観と絵文字

`seticon <url>`、`setbanner <url>`、`setsplash <url>`、`setservername <name>` は、サーバー自体を変更するもので、管理者権限が必要です。`setguildavatar`、`setguildbanner`、`setguildbio` は、このサーバーでのボット自身の表示のみを変更し、サーバー管理の権限が必要です。

絵文字のコマンドには、あなたとボットの両方に「絵文字の管理」権限が必要です。

- `addemote <name> [url]` は、URLまたは添付された画像から絵文字をアップロードします。
- `removeemote <emote>` と `renameemote <emote> <name>` は、このサーバーの絵文字に対して操作します。
- `stealemotes <emotes...>` は、メッセージ内のすべてのカスタム絵文字を、このサーバーにコピーします。`sfr <role> <emotes...>` も同様ですが、絵文字の使用をロールごとに制限します。
- メッセージを右クリックし、アプリメニューから **Steal Emotes** または **Steal Sticker** を選ぶと、入力せずに同じ操作ができます。

## ロール監視

ロール監視は監査ログを確認します。禁止リストに登録されたロールがメンバーに付与された場合、またはロールに禁止リストの権限が追加された場合、ボットは変更を元に戻し、変更を行った人物を処罰します。設定できるのはサーバーオーナーのみです。

- `addblacklistedrole <role> [punishment]` と `removeblacklistedrole <role>`。
- `addblacklistedpermission <permission> [punishment]` と `removeblacklistedpermission <permission>`。例：`addblacklistedpermission Administrator Ban`。
- `setdefaultpunishment <punishment>` は、禁止リストの項目に独自の処罰がない場合の処罰を設定します。デフォルトは `None` です。
- `addwhitelisteduser @user`、`addwhitelistedrole <role>` と、それぞれの `remove...` は、スタッフを監視の対象外にします。許可リストのユーザーによる変更、または許可リストのユーザーへの変更は無視されます。
- `listblacklists` は、上記のすべての一覧を表示します。

処罰の値は、`None`、`Warn`、`Mute`、`ChatMute`、`VoiceMute`、`Timeout`、`Kick`、`Softban`、`Ban`、`RemoveRoles`、`AddRole`、`Delete` です。複数の禁止権限を一度に追加した場合、最も重い処罰が適用されます。

## 設定

ダッシュボードのページはありません。保存される設定は、ロール監視とロックダウンの状態のみです。

| 設定 | デフォルト | 内容 |
| --- | --- | --- |
| デフォルトの処罰 | None | 禁止リストのロールまたは権限に処罰が設定されていない場合に適用されます。 |
| 禁止ロール | なし | 付与された時点で削除されるロール。それぞれに任意の処罰を設定できます。 |
| 禁止権限 | なし | ロールに追加された時点で取り消される権限。それぞれに任意の処罰を設定できます。 |
| 許可リストのユーザーとロール | なし | 監視の対象外になります。 |
| 参加者ロックダウンの処理 | Ban | 参加者ロックダウン中に参加したメンバーへの処理です。 |

## セットアップの流れ

1. ボットのロールが、管理対象にしたいすべてのロールより上にあり、「ロールの管理」と「チャンネルの管理」権限を持っていることを確認します。
2. レイアウトを作成します。`ccatc Community general off-topic memes` で、カテゴリと3つのチャンネルが作成されます。
3. まとめてロールを作成します。`createroles Member Regular Veteran`。
4. 基本ロールを配布します。`addtoallusers Member` を実行し、`rolejobs` で進捗を確認します。
5. サーバーオーナーとして、サーバーを保護します。`addblacklistedpermission Administrator Ban` と `addwhitelistedrole Admin`。
6. 緊急時のために `lockdown full kick` を覚えておき、後日、静かな日に `liftlockdown full` をテストしておきます。

## コマンド

これらのコマンドは、サーバーのプレフィックス（変更していない場合は `.`）で実行します。

| コマンド | エイリアス | 必要な権限 | 目的 |
| --- | --- | --- | --- |
| `permview [@user or role]` | `pview` | なし | 許可されている権限を一覧表示 |
| `setsplash <url>` | `setserversplash`, `setsplashimage` | 管理者 | 招待のスプラッシュを設定 |
| `seticon <url>` | `setservericon`, `seticonimage` | 管理者 | サーバーアイコンを設定 |
| `setbanner <url>` | `setserverbanner` | 管理者 | サーバーバナーを設定 |
| `setservername <name>` | | 管理者 | サーバー名を変更 |
| `setguildavatar [url]` | `sgav`, `setgav` | サーバー管理 | このサーバーでのボットのアバター |
| `setguildbanner [url]` | `sgbanner`, `setgbanner` | サーバー管理 | このサーバーでのボットのバナー |
| `setguildbio <text>` | `sgbio`, `setgbio` | サーバー管理 | このサーバーでのボットの自己紹介 |
| `addemote <name> [url]` | `emoteadd`, `ae`, `ea` | 絵文字の管理 | 絵文字をアップロード |
| `removeemote <emote>` | `deleteemote`, `emoteremove`, `emotedelete` | 絵文字の管理 | 絵文字を削除 |
| `renameemote <emote> <name>` | `emoterename` | 絵文字の管理 | 絵文字の名前を変更 |
| `stealemotes <emotes...>` | `steal` | 絵文字の管理 | このサーバーに絵文字をコピー |
| `sfr <role> <emotes...>` | | 絵文字の管理 | 絵文字をコピーし、ロールに制限 |
| `creatxtchanl <name>` | `ctch` | チャンネルの管理 | テキストチャンネルを作成 |
| `creatvoichanl <name>` | `cvch` | チャンネルの管理 | ボイスチャンネルを作成 |
| `deltxtchanl <#channel>` | `dtch` | チャンネルの管理 | テキストチャンネルを削除 |
| `delvoichanl <channel>` | `dvch` | チャンネルの管理 | ボイスチャンネルを削除 |
| `ccatc <category> <names...>` | | チャンネルの管理 | テキストチャンネルを含む新しいカテゴリ |
| `ccavc <category> <names...>` | | チャンネルの管理 | ボイスチャンネルを含む新しいカテゴリ |
| `cctc <category> <names...>` | | チャンネルの管理 | 既存のカテゴリ内のテキストチャンネル |
| `ccvc <category> <names...>` | | チャンネルの管理 | 既存のカテゴリ内のボイスチャンネル |
| `renamechannel <channel> <name>` | `channelrename` | チャンネルの管理 | チャンネルの名前を変更 |
| `setchanlname <name>` | `schn` | チャンネルの管理 | 現在のチャンネルの名前を変更 |
| `settopic [text]` | `st` | チャンネルの管理 | 現在のトピックを設定または消去 |
| `nsfwtoggle` | `nsfw`, `nsfwtgl` | チャンネルの管理 | NSFWフラグを切り替え |
| `slowmode [time] [#channel]` | | チャンネルの管理 | 低速モードを切り替えまたは設定 |
| `lock [#channel]` | `channellock`, `lockchannel` | メッセージの管理 | 全員のメッセージ送信を拒否 |
| `unlock [#channel]` | `channelunlock`, `unlockchannel` | メッセージの管理 | `lock` を取り消す |
| `nuke [#channel]` | `channelnuke`, `nukechannel` | チャンネルの管理 | チャンネルを削除して作り直す |
| `permcontrol <channel> <allow|deny|inherit> <role or user> <perms...>` | `permc` | チャンネルの管理 | チャンネルの上書きを編集 |
| `syncroletoall <role>` | `synctoall` | チャンネルの管理 | 上書きをすべてのチャンネルとカテゴリにコピー |
| `syncroletoallchannels <role>` | `srtch`, `srtach` | チャンネルの管理 | 上書きをテキストチャンネルにコピー |
| `syncroletoallcategories <role>` | `srtc`, `srtac` | チャンネルの管理 | 上書きをカテゴリにコピー |
| `createwebhook <#channel> <name> [avatar]` | `cwh` | 管理者 | Webhook を作成 |
| `moveto <voice channel>` | | なし | 自分を移動 |
| `moveuserto @user <voice channel>` | `moveuto` | チャンネルの管理 | 他のユーザーを移動 |
| `grab @user` | `getoverhere` | なし | ユーザーを自分のボイスチャンネルに引き込む |
| `lockdown [joins|readonly|full] [kick|ban] [true]` | `lockdownserver` | 管理者 | ロックダウンを開始 |
| `liftlockdown [type]` | `unlockserver` | 管理者 | ロックダウンを終了 |
| `unlockdown` | `endlockdown` | チャンネルの管理 | `@everyone` の「メッセージを送信」を再び有効化 |
| `createrole [name]` | `cr` | ロールの管理 | ロールを作成 |
| `deleterole <role>` | `dr` | ロールの管理 | ロールを削除 |
| `renamerole <role> <name>` | `renr` | ロールの管理 | ロールの名前を変更 |
| `rolecolor <role> [colour]` | `roleclr` | 設定するにはロールの管理 | ロールの色を表示または設定 |
| `rolehoist <role>` | `rh` | ロールの管理 | 区切り表示を切り替え |
| `setrole <role> @user [time]` | `sr`, `giverole` | ロールの管理 | ロールを付与（期間指定可） |
| `removerole <role> @user` | `rr` | ロールの管理 | ロールを削除 |
| `removeallroles @user` | `rar` | ロールの管理 | すべてのロールを削除 |
| `createroles <names...>` | `croles`, `crs` | ロールの管理 | 複数のロールを作成 |
| `deleteroles <roles...>` | `drs` | ロールの管理 | 複数のロールを削除 |
| `setroles @user [time] <roles...>` | `srs` | ロールの管理 | 複数のロールを付与 |
| `removeroles @user <roles...>` | `rrs` | ロールの管理 | 複数のロールを削除 |
| `adduserstorole <role> @users...` | `autr` | ロールの管理 | 複数のメンバーに1つのロールを付与 |
| `removeusersfromrole <role> @users...` | `rufr` | ロールの管理 | 複数のメンバーから1つのロールを削除 |
| `addtoall <role>` | `ata` | ロールの管理 | 全メンバーにロールを付与 |
| `addtoallusers <role>` | `atau` | ロールの管理 | 全人間にロールを付与 |
| `addtoallbots <role>` | `atab` | ロールの管理 | 全ボットにロールを付与 |
| `addtousersover <time> <role>` | `atuo` | ロールの管理 | 指定期間以上前に参加したメンバーにロールを付与 |
| `addtousersunder <time> <role>` | `atuu` | ロールの管理 | 指定期間より最近に参加したメンバーにロールを付与 |
| `addroletorole <role> <role2>` | `artr` | ロールの管理 | 別のロールを持つ全員にロールを付与 |
| `addthenremove <role> <role2>` | `atr` | ロールの管理 | あるロールを別のロールに置き換え |
| `removefromall <role>` | `rfa` | ロールの管理 | 全メンバーから削除 |
| `removefromallusers <role>` | `rfau` | ロールの管理 | 全人間から削除 |
| `removefromallbots <role>` | `rfab` | ロールの管理 | 全ボットから削除 |
| `removefromrole <role> <role2>` | `rfr` | ロールの管理 | 別のロールを持つ全員から削除 |
| `rolejobs` | `rj` | ロールの管理 | 実行中の一括ロールジョブを一覧表示 |
| `stopjob <number>` | `sj` | ロールの管理 | ジョブをキャンセル |
| `exportrolelist` | `exportroles`, `erl` | ロールの管理 | ロールのメンバーシップをダウンロード |
| `importrolelist [true]` | `importroles`, `irl` | ロールの管理 | エクスポートしたリストを再適用 |
| `addroletolist <role>` | `artl` | ロールの管理 | 添付されたユーザーIDのリストにロールを付与 |
| `setdefaultpunishment <action>` | `sdp`, `defaultpunishment`, `setdefpunishment` | サーバーオーナー | ロール監視のデフォルトの処罰 |
| `addblacklistedrole <role> [action]` | `abr`, `blacklistrole`, `addbrole` | サーバーオーナー | ロールを監視 |
| `removeblacklistedrole <role>` | `rbr`, `unblacklistrole`, `removebrole` | サーバーオーナー | ロールの監視を停止 |
| `addblacklistedpermission <permission> [action]` | `abp`, `blacklistpermission`, `addbpermission` | サーバーオーナー | 権限を監視 |
| `removeblacklistedpermission <permission>` | `rbp`, `unblacklistpermission`, `removebpermission` | サーバーオーナー | 権限の監視を停止 |
| `addwhitelisteduser @user` | `awu`, `whitelistuser`, `addwuser` | サーバーオーナー | メンバーを監視の対象外に |
| `removewhitelisteduser @user` | `rwu`, `unwhitelistuser`, `removewuser` | サーバーオーナー | 対象外の設定を解除 |
| `addwhitelistedrole <role>` | `awr`, `whitelistrole`, `addwrole` | サーバーオーナー | ロールを監視の対象外に |
| `removewhitelistedrole <role>` | `rwr`, `unwhitelistrole`, `removewrole` | サーバーオーナー | 対象外の設定を解除 |
| `listblacklists` | `lbl`, `blacklists`, `listbws` | サーバーオーナー | 監視の一覧を表示 |

## ヒントと注意点

- ロールのコマンドでは、階層が2回確認されます。自分の最上位ロールとボットの最上位ロールの両方が、対象のロールより上にある必要があります。サーバーオーナーは、自分側の確認をスキップします。
- 一括ジョブは、メンバー1人あたりおよそ1秒かかります。5,000人のメンバーにロールを付与するには1時間以上かかり、ボットは同時に6つ目のジョブを拒否します。
- `syncroletoall` とその派生コマンドでは、実行するチャンネルにそのロールの上書きが既に存在している必要があります。コピーされるのはその上書きです。
- `nuke` は元に戻せません。確認プロンプトが唯一の安全装置です。
- 読み取り専用のロックダウンは、すべてのチャンネルの上書きを編集するため、大規模なサーバーでは多くのAPI呼び出しが発生します。手作業ではなく `liftlockdown` で解除し、保存された上書きが復元されるようにしてください。
- ロール監視は監査ログに依存するため、ボットには「監査ログを表示」権限が必要です。また、選択した処罰に必要な権限も必要です。
- 絵文字の盗用には、空いている絵文字の枠が必要です。失敗した絵文字は "Errored Emotes" に一覧表示されます。
