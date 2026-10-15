---
title: Patreon
slug: patreon
summary: Patreonのキャンペーンを接続し、支援者にプランに合ったDiscordロールを付与して、支援者数と収益のリアルタイムの数値を含む月次のお礼を投稿します。
icon: fa-heart
category: Community
dashboard: /dashboard/patreon
module: Patreon
tags: [patreon, supporters, patrons, donations, premium, tier roles, role sync, announcement, oauth, Patreon, 支援者, パトロン, 寄付, プレミアム, ティアロール, ロール同期, お知らせ, OAuth]
related: [administration, utility]
---

## What it does

Patreonのキャンペーンを運営しているサーバーオーナーは、クリエイターアカウントでサインインして、そのキャンペーンをボットに接続します。それ以降、ボットはキャンペーンのティアと支援者を取得して同期を保ち、各支援者の支払い額に応じてDiscordロールを付与できます。Patreonが支援者のDiscordアカウントを把握している場合は、自動的に連携されます。そうでない場合は、スタッフがメンバーをPatreonユーザーに手動で連携できます。

選んだ日に、ボットは月に1回、支援者への感謝を込めたお知らせをチャンネルに投稿できます。メッセージはプレーンテキストでも埋め込みでもよく、有効な支援者数、月間収益、今月新たに参加した人数などのリアルタイムの数値を含められます。さらに、直近1週間に支援者になった人を紹介するコマンドもあり、その人たちへのシャウトアウトを投稿します。

ダッシュボードでは、接続、支援者とティアの確認、ティアとロールの対応付け、お知らせ設定の編集まで、一連の流れを処理できます。チャット内のコマンドでも、同じ作業に加えて統計とランキングを扱えます。

## Why you would use it

- 支援者は、スタッフがPatreonを手動で確認しなくても、色付きのロールと支援者専用チャンネルへのアクセスを得られるべきです。
- 誰かがプランをアップグレード、ダウングレード、または支払いを停止したときに、ティアに応じてロールが自動で変わります。
- 数値を手動で編集しなくても正確に保たれる、「40人の支援者に感謝します」という定期的な投稿をしたい場合。
- Discord の中から、誰がどのレベルで支援しているかをすばやく確認したいスタッフ向け。

## Connecting a campaign

接続にはPatreonのOAuthフローを使います。ダッシュボードの **Patreon を接続** カード、またはボットオーナーだけが実行できる `patreonsync` コマンドで、"Authorize with Patreon" のリンクが作られます。キャンペーンを所有するアカウントでサインインし、要求されたアクセスを承認すると、Patreonがダッシュボードの Patreon ページに戻します。ボットは認証コードをトークンと交換し、最初に見つかったキャンペーンを保存して、ティアと支援者の完全な同期をすぐに実行します。

使用するアカウントは、キャンペーンを所有している必要があります。キャンペーンがない場合、コールバックは "No Patreon campaigns found for this user" で失敗します。

ダッシュボードの **概要** タブには、接続状態が **キャンペーン ID**、**最終同期**、**トークンの有効期限** とともに表示されます。また、有効な **サポーター** の数、月間の **収益**、**キャンペーンのクリエイター** のサマリーカードも表示されます。トークンは期限切れになると自動で更新されます。同じタブの **クイックアクション** には、**すべてのデータを同期**、**ロールを同期**、**お知らせを送信**、**再ログイン** があります。Re-login はキャンペーンの接続を解除します。トークンは消去されますが、チャンネル、メッセージ、対応付けの設定は残るため、後で再接続できます。ページのヘッダーには、**データを更新** と **サポーターを同期** のボタンもあります。

> [!NOTE]
> Patreonの連携は、ボットのホスト側で有効にする必要があります。ボットにPatreonのクライアントIDが設定されていない場合、接続ボタンと `patreonsync` は、連携が設定されていないことを報告します。

## Supporters and syncing

同期では、キャンペーンのすべてのメンバーを、支払い額、状態、そして支援者がDiscordをPatreonに接続している場合はそのDiscordユーザーIDとともに取得します。有効な支援者とは、Patreonが有効と報告している人、または現在の支払いがある人です。**サポーター** タブには、**名前**（Patreonが提供している場合はメールアドレスも）、**支援額**、**参加日時**、**ステータス** とともに一覧が表示されます。ページ上部の **サポーターを同期** ボタンで一覧を更新できます。

`patreonsupporters` は、チャット内で有効な支援者を最大15人、支払い額とDiscordのメンションとともに表示します。`patreontop [count]` は、支払い額の上位1〜20人をランキングします。`patreonstats` は、支援者数、連携済みの人数、総収益と平均収益、ティア数を要約します。`patreonanalytics` は、これに加えて元支援者、生涯収益、今月の新規支援者、ティアごとの分布を表示します。

支援者のDiscordアカウントがPatreon側で紐付けられていない場合は、`patreonlink @member <patreonUserId>` で手動で連携します。Patreon ユーザーIDは、支援者のPatreonアカウントの数値IDです。ダッシュボードの支援者一覧にはこのIDは表示されません。

## Tier to role mapping

各Patreonティアは、1つのDiscordロールに対応付けできます。**ティアの対応付け** タブで **Patreon のティア** と **Discord のロール** を選んで保存します。**利用可能なティア** の一覧には、公開されているすべてのティアと、その価格、対応付けの有無が表示されます。チャットでは `patreontiermap <tierId> @role` で同じ設定ができます。ティアIDは `patreonroles` で確認できます。

ロールの同期は、`patreonrolesync` または **ロールの同期を有効にする** のチェックボックスで有効にするまでオフのままです。有効にすると、ボットは支援者が持つべきロールを判定します。支払い額が、そのユーザーの支払い額以下であるティアのうち、価格が最も高い対応付け済みのティアです。支援者が持っているほかの対応付け済みのPatreonロールは削除され、対象のロールが追加されます。支払いを停止した支援者は、対応付け済みのロールをすべて失います。

同期は、メンバーが連携されたとき、`patreonsyncall` を実行したとき、またはダッシュボードのロール同期の操作を行ったときに実行されます。Discord IDがわかっている支援者だけが同期の対象になります。

> [!PERMISSION]
> ボットにはロールの管理が必要です。また、ボット自身のロールは、対応付けされたすべてのロールより上にある必要があります。ボットより上にあるロールはスキップされます。

## Monthly announcements

`patreonch #channel` または **お知らせチャンネル** の選択で、チャンネルを設定します。`patreonday <1..28>` または **お知らせの日（1〜28）** で、日を設定します。日は28までに制限されているため、2月が飛ばされることはありません。お知らせは、`patreontoggle` を実行するか **お知らせを有効にする** にチェックを入れるまでオフのままです。

ボットは1時間ごとに確認します。選んだ日に、今月まだお知らせしていなければ投稿し、その時刻を記録します。その日にボットがオフラインだった場合は、その月のその日がすでに過ぎていれば、起動時に追いつきます。`patreonannounce` は直ちに1件投稿します。これも今月の投稿としてカウントされます。

カスタムメッセージがない場合、ボットは有効な支援者数と月間収益を含む既定のお礼を投稿します。独自のメッセージは、`patreonmsg <text or embed code>` またはダッシュボードのお知らせメッセージエディターで設定します。テキストは埋め込みパーサーで処理されます。既定に戻すには `-` を使います。

### Placeholders

これらは、通常のサーバーとチャンネルのプレースホルダーと一緒に、お知らせメッセージで使えます。

| Placeholder | Value |
| --- | --- |
| `%month%` | 現在の月名 |
| `%year%` | 現在の年 |
| `%patreon.link%` | `https://patreon.com` |
| `%supporter.count%` | 有効な支援者数 |
| `%supporter.total%` | これまでに記録されたすべての支援者数 |
| `%supporter.new%` | 今月の新規支援者数 |
| `%supporter.former%` | 元支援者数 |
| `%supporter.linked%` | Discordアカウントが連携されている支援者数 |
| `%revenue.monthly%` | 現在の月間の支払い額 |
| `%revenue.average%` | 平均の支払い額 |
| `%revenue.lifetime%` | 生涯収益 |
| `%growth.new%` | 今月の新規支援者数 |
| `%top.supporter.name%` | 最も多く支払っている支援者 |
| `%top.supporter.amount%` | その人の支払い額 |
| `%patron.name%` | 最も多く支払っている支援者。`%top.supporter.name%` と同じ |
| `%patron.tier%` | その支援者のティア。Patreonが報告していない場合は "Unknown" |
| `%patron.amount%` | その人の月額支払い額。`%top.supporter.amount%` と同じ |
| `%tiers.count%` | ティアの数 |
| `%tier.popular%` | 支援者が最も多いティア |
| `%tier.popular.count%` | そのティアに属している人数 |
| `%supporters.summary%` | 支援者数についての、完成済みの文 |
| `%revenue.summary%` | 収益についての、完成済みの文 |
| `%growth.summary%` | 成長についての、完成済みの文 |

> [!EXAMPLE]
> `It's %month%! Thanks to %supporters.summary%%revenue.summary%!%growth.summary%` は、"It's December! Thanks to our 25 incredible supporters who help us raise $150/month! We gained 3 new supporters this month!" と表示されます。

## Recognising new supporters

`patreonrecognize [#channel]` は、直近7日以内に支払いを開始した支援者のために、歓迎の埋め込みを投稿します。1回の実行で最大5人までです。指定したチャンネル、または現在のチャンネルに投稿されます。これはスケジュールではなく手動のコマンドなので、同期の後に実行してください。2回実行すると、同じ人が2回投稿されます。

## Settings

ダッシュボードには4つのタブがあります。**概要**、**サポーター**、**ティアの対応付け**、**設定** です。

| Setting | Default | What it controls |
| --- | --- | --- |
| Announcement Channel | none | 月次の投稿先。none の場合、お知らせは無効です |
| Announcement Day (1-28) | none | 投稿する日。設定するまでお知らせは送信されません |
| Announcement message | built in thank you | 上記のプレースホルダーを使ったカスタムのテキストまたは埋め込み |
| Enable Announcements | off | 月次の投稿を送信するかどうか |
| Enable Role Sync | off | 対応付けられたロールを支援者に適用するかどうか |
| Tier mappings | none | 各ティアが付与するロール |

## Setup walkthrough

1. ダッシュボードで **Patreon** を開き、接続ボタンをクリックします。キャンペーンオーナーのアカウントでサインインし、アクセスを承認します。
2. 最初の同期が終わるまで待ち、**サポーター** タブに支援者が表示されているか確認します。
3. **ティアの対応付け** で、各ティアをロールに対応付けます。先にロールを作成し、ボットのロールをそれらより上に配置してください。
4. **ロールの同期を有効にする** にチェックを入れ、`patreonsyncall` を実行して、すでに連携されている全員にロールを適用します。
5. **設定** で **お知らせチャンネル** と **Announcement Day** を選び、プレースホルダーを使ったメッセージを書き、**お知らせを有効にする** にチェックを入れます。
6. `patreonannounce` を1回実行し、チャンネルで結果を確認します。

## Commands

これらのコマンドは、サーバーのプレフィックスを付けて実行します（変更していなければ `.`）。

| Command | Aliases | Needs | Purpose |
| --- | --- | --- | --- |
| `patreonsync` | `ptsync` | Bot owner | OAuth の認証リンクを投稿します |
| `patreonch [#channel]` | `ptch` | Administrator | お知らせチャンネルを表示または設定します |
| `patreondisable` | `ptdisable` | Administrator | チャンネルをクリアし、お知らせを無効にします |
| `patreonmsg [text]` | `ptmsg` | Administrator | お知らせメッセージを表示または設定します。`-` でリセットします |
| `patreonday [day]` | `ptday` | Administrator | 月の日付を表示または設定します |
| `patreontoggle` | `pttoggle` | Administrator | お知らせを有効または無効にします |
| `patreonconfig` | `ptconfig` | Administrator | 状態、チャンネル、日、メッセージ、最後の投稿を表示します |
| `patreonannounce` | `ptannounce` | Administrator | お知らせを今すぐ送信します |
| `patreonhelp` | `pthelp` | Nobody | プレースホルダーの一覧とコマンドの概要を表示します |
| `patreonsupporters` | `ptsupporters` | Administrator | 有効な支援者を一覧表示します |
| `patreontop [count]` | `pttop` | Nobody | 支払い額順の上位の支援者を表示します |
| `patreonstats` | `ptstats` | Administrator | 支援者と収益の要約を表示します |
| `patreonanalytics` | `ptanalytics` | Administrator | 詳細な分析を表示します |
| `patreonlink <user> <patreonUserId>` | `ptlink` | Administrator | メンバーをPatreonユーザーに連携します |
| `patreonrolesync` | `ptrolesync` | Manage Roles | ロールの自動同期を切り替えます |
| `patreontiermap <tierId> <role>` | `pttiermap` | Manage Roles | ティアをロールに対応付けます |
| `patreonroles` | `ptroles` | Administrator | ティアをIDとロールとともに一覧表示します |
| `patreonsyncall` | `ptsyncall` | Manage Roles | 連携されているすべての支援者にロールを適用します |
| `patreonrecognize [#channel]` | `ptrecognize` | Administrator | 直近7日間の支援者にシャウトアウトします |

## Tips and gotchas

- ロールを受け取れるのは、Patreonのプロフィールで Discord を接続している支援者、または `patreonlink` で連携された支援者だけです。
- ロールの同期では、支援者ごとに1つのロールを選びます。その人の支払い額がカバーする、最も良いティアです。複数のティアロールを重ねることはサポートされていません。
- お知らせは暦月ごとに最大1回投稿されます。3日に `patreonannounce` を実行すると、その月の15日に予定されている投稿はスキップされます。
- お知らせの日付はUTCで扱われます。
- 月次のお知らせはキャンペーン全体についてのものなので、`%patron.name%`、`%patron.tier%`、`%patron.amount%` は、支援者を順番に表すのではなく、有効な支援者の中で最も多く支払っている人を表します。支援者ごとのシャウトアウトには `patreonrecognize` を使ってください。
- 別のPatreonアカウントで再接続すると、キャンペーンは切り替わりますが、古い対応付けは残ります。その後で **ティアの対応付け** タブを確認してください。
