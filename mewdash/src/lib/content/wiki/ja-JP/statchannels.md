---
title: 統計チャンネル
slug: statchannels
summary: メンバー数、ブースト数、未解決のチケット数、Twitchの視聴者数などのライブ数値を、チャンネル名で自動的に更新するボイスチャンネルです。
icon: fa-chart-simple
category: Community
dashboard: /dashboard/statchannels
module: StatChannels
tags: [stat channels, counter, member count, live stats, voice channel stats, countdown, member goal, boost count, twitch viewers, 統計チャンネル, カウンター, メンバー数, ライブ統計, ボイスチャンネル統計, カウントダウン, メンバー目標, ブースト数, Twitch視聴者数]
related: [counting, twitch, suggestions, xp, afk, starboard]
---

## 概要

統計チャンネルは、チャンネル一覧の上部に表示される、鍵のかかったボイスチャンネルです。チャンネル名に数値を表示します（例：「Members: 12,480」）。ボットはスケジュールに従って名前を書き換え、数値を最新の状態に保ちます。メンバーはこのチャンネルに接続できません。閲覧専用のラベルとして機能します。

カウンターの種類、名前のテンプレート、数値の表示形式、更新の頻度を選択します。ボットは数十種類のカウンターに対応しています。サーバー情報、オンライン状態、Nitroブースト、絵文字の枠、メンバー目標、カウントダウンのほか、チケット、提案、giveaway、XP、カウント、スターボード、連携したTwitchやMinecraftサーバーなど、他のMewdeko機能の値も表示できます。

Discordでは、チャンネル名を10分間に2回までしか変更できません。統計チャンネルは、更新方式を選択することでこの制限に対応します。その中には、チャンネルを削除して作り直す方式も含まれており、1分ごとに更新できます。

## 利用するメリット

- サーバーの上部に、メンバー数、人間の数、ボットの数を表示できます。
- パーセンテージまたはプログレスバーで、メンバー目標の達成状況を表示できます。
- イベント、ローンチ、記念日までのカウントダウンを表示できます。
- 配信者のサーバーに、Twitchのライブ状態と視聴者数を表示できます。
- コマンドを使わずに、スタッフが未解決のチケットや保留中の提案をライブで確認できます。
- 招待リンクの横に、Minecraftサーバーの状態とプレイヤー数を表示できます。

## カウンターの種類

以下は、`statchanneltypes` とダッシュボードの **利用可能なカウンター** セクションに表示される、カウンターの一覧です。すべての種類で共通のプレースホルダーを使用でき、一部は独自のプレースホルダーを追加します。デフォルトのテンプレートは、対応する絵文字の後に表示されるテキストで始まります。

### メンバー

| 種類 | 表示内容 | デフォルトのテンプレート | 追加のプレースホルダー |
| --- | --- | --- | --- |
| `TotalMembers` | ボットを含むすべてのメンバー | `Members: %count%` | |
| `HumanMembers` | ボット以外のメンバー | `Humans: %count%` | |
| `BotCount` | ボットアカウント | `Bots: %count%` | |
| `OnlineMembers` | オフライン以外の状態のメンバー | `Online: %count%` | |
| `IdleMembers` | 離席中とマークされたメンバー | `Idle: %count%` | |
| `DndMembers` | 取り込み中とマークされたメンバー | `DND: %count%` | |
| `StreamingMembers` | 配信アクティビティ中のメンバー | `Streaming: %count%` | |
| `InVoiceMembers` | いずれかのボイスチャンネルに接続しているメンバー | `In Voice: %count%` | |
| `RoleMembers` | 選択したロールを持つメンバー | `%role.name%: %count%` | `%role.name%`, `%role.id%`, `%role.color%` |
| `NewestMember` | 最も新しく参加したメンバー | `Newest: %member.name%` | `%member.name%`, `%member.id%` |
| `MembersJoinedToday` | 過去24時間に参加したメンバー | `Joined Today: %count%` | |
| `MembersJoinedWeek` | 過去7日間に参加したメンバー | `This Week: %count%` | |
| `MemberGoal` | 目標メンバー数に対する進捗 | `%count% / %goal%` | `%goal%`, `%goal.raw%`, `%goal.percent%`, `%goal.remaining%`, `%goal.bar%` |
| `AfkCount` | Mewdeko経由で現在AFKのメンバー | `AFK: %count%` | |

### サーバー

| 種類 | 表示内容 | デフォルトのテンプレート | 追加のプレースホルダー |
| --- | --- | --- | --- |
| `Countdown` | 目標日までの残り時間 | `%days%d %hours%h left` | `%days%`, `%hours%`, `%minutes%`, `%total.hours%` |
| `ChannelCount` | すべてのチャンネル | `Channels: %count%` | |
| `TextChannelCount` | テキストチャンネル | `Text: %count%` | |
| `VoiceChannelCount` | ボイスチャンネル | `Voice: %count%` | |
| `CategoryCount` | カテゴリ | `Categories: %count%` | |
| `StageChannelCount` | ステージチャンネル | `Stages: %count%` | |
| `ForumChannelCount` | フォーラムチャンネル | `Forums: %count%` | |
| `ThreadCount` | アクティブとしてキャッシュされているスレッド | `Threads: %count%` | |
| `RoleCount` | ロール | `Roles: %count%` | |
| `BoostCount` | 有効なNitroブースト | `Boosts: %count%` | |
| `BoostLevel` | ブーストのティア（0〜3） | `Level %count%` | |
| `NextBoostGoal` | 次のティアに必要なブースト数 | `%count% to Tier %tier.next%` | `%tier.next%`, `%tier.current%` |
| `EmojiCount` | すべてのカスタム絵文字 | `Emojis: %count%` | |
| `AnimatedEmojiCount` | アニメーションのカスタム絵文字 | `Animated: %count%` | |
| `StaticEmojiCount` | 静止画のカスタム絵文字 | `Static: %count%` | |
| `StickerCount` | カスタムスタンプ | `Stickers: %count%` | |
| `EmojiSlotsUsed` | ティアの上限に対して使用中の絵文字の枠 | `Slots: %count%/%slots.max%` | `%slots.max%`, `%slots.free%` |
| `ServerAge` | サーバーが作成されてからの日数 | `Age: %count% days` | `%years%`, `%created%` |
| `EventCount` | スケジュールされたイベント | `Events: %count%` | |
| `BotUptime` | Mewdekoが稼働している期間 | `Uptime: %days%d %hours%h` | `%days%`, `%hours%`, `%minutes%` |
| `InviteCount` | 招待トラッキングで追跡された招待 | `Invites: %count%` | |

### Twitch

これらは、Twitchモジュールで連携したTwitchチャンネルから値を読み取ります。

| 種類 | 表示内容 | デフォルトのテンプレート | 追加のプレースホルダー |
| --- | --- | --- | --- |
| `TwitchLiveStatus` | チャンネルがライブ中かどうか | `%twitch.name%: %status%` | `%status%`, `%twitch.name%` |
| `TwitchViewers` | 現在の視聴者数 | `Viewers: %count%` | `%twitch.name%` |
| `TwitchGame` | 配信中のカテゴリ | `%game%` | `%game%`, `%title%`, `%twitch.name%` |
| `TwitchUptime` | 配信がライブになってからの期間 | `Live %hours%h %minutes%m` | `%hours%`, `%minutes%` |
| `TwitchFollowers` | フォロワーの合計 | `Followers: %count%` | `%twitch.name%` |
| `TwitchSubs` | サブスクライバーの合計 | `Subs: %count%` | `%twitch.name%` |
| `TwitchCounter` | 名前付きのTwitchチャットカウンター | `%counter.name%: %count%` | `%counter.name%` |
| `TwitchLastRaider` | 直近のレイダー | `Last Raid: %raider%` | `%raider%`, `%raid.viewers%` |
| `TwitchRecentStreams` | 過去14日間に開始された配信 | `Streams: %count%` | |

### その他のMewdeko機能

| 種類 | カテゴリ | 表示内容 | デフォルトのテンプレート | 追加のプレースホルダー |
| --- | --- | --- | --- | --- |
| `MinecraftPlayers` | Minecraft | 監視しているサーバーでオンラインのプレイヤー | `Players: %count%/%players.max%` | `%players.max%`, `%server.version%` |
| `MinecraftStatus` | Minecraft | 監視しているサーバーに接続できるかどうか | `%status%` | `%status%`, `%latency%` |
| `CountingCurrent` | Counting | カウントチャンネルの現在の数 | `Count: %count%` | |
| `CountingRecord` | Counting | これまでに到達した最高の数 | `Record: %count%` | |
| `OpenTickets` | Tickets | 開いている未アーカイブのチケット | `Open Tickets: %count%` | |
| `TicketsToday` | Tickets | 過去24時間に開かれたチケット | `Today: %count%` | |
| `PendingSuggestions` | Suggestions | 判断待ちの提案 | `Pending: %count%` | |
| `ActiveGiveaways` | Giveaways | 現在進行中のgiveaway | `Giveaways: %count%` | |
| `StarboardPosts` | Starboard | スターボードの投稿の合計 | `Starred: %count%` | |
| `TopXpUser` | XP | 最もXPを持つメンバー | `Top: %member.name%` | `%member.name%`, `%member.id%`, `%member.xp%` |
| `TotalGuildXp` | XP | サーバー内で獲得されたXPの合計 | `Total XP: %count%` | |
| `TotalCurrency` | Currency | メンバーが保有する通貨 | `In Circulation: %count%` | |
| `ActivePolls` | Polls | 投票を受け付けているアンケート | `Polls: %count%` | |
| `Clock` | Server | サーバーのタイムゾーンでの日付と時刻 | `%time% %tz%` | `%time%`, `%date%`, `%datetime%`, `%weekday%`, `%tz%` |
| `MessagesToday`, `MessagesWeek` | Activity | 過去24時間または7日間のメッセージ数 | `Today: %count%` | |
| `VoiceHoursToday`, `VoiceHoursWeek` | Activity | 過去24時間または7日間の、全メンバーのボイス時間 | `Today: %count%h` | |
| `TopChatter` | Activity | 過去7日間で最も活発にチャットしたメンバー | `Chatter: %member.name%` | `%member.name%`, `%member.id%`, `%member.messages%` |
| `TopVoiceMember` | Activity | 過去7日間で最もボイス時間が長いメンバー | `Voice: %member.name%` | `%member.name%`, `%member.id%`, `%member.hours%` |
| `TopGame` | Activity | 過去7日間で最もプレイされたゲーム（ゲーム追跡が必要） | `%game%` | `%game%`, `%hours%`, `%players%` |
| `PlayingNow` | Activity | 追跡対象のゲームを現在プレイ中のメンバー（ゲーム追跡が必要） | `Playing: %count%` | |
| `RoleMembersOnline` | Members | ロールを持ち、オフラインではないメンバー | `%role.name%: %count%` | `%role.name%`, `%role.id%`, `%role.total%` |
| `TopInviter` | Invite Tracking | 最も多くの招待を行ったメンバー | `Inviter: %member.name%` | `%member.name%`, `%member.id%`, `%member.invites%` |
| `InvitesWeek` | Invite Tracking | 過去7日間に招待者に計上された参加 | `This Week: %count%` | |
| `MembersLeftToday`, `MembersLeftWeek` | Members | 過去24時間または7日間に退出したメンバー | `Left Today: %count%` | |
| `NetGrowthWeek` | Members | 過去7日間の参加数から退出数を引いた数 | `Growth: %count%` | `%joins%`, `%leaves%` |

### すべての種類で使えるプレースホルダー

| プレースホルダー | 値 |
| --- | --- |
| `%count%` | 値。選択された表示形式で描画されます。 |
| `%count.raw%` | 数字のみの値 |
| `%server.name%` | サーバー名 |
| `%server.id%` | サーバーID |
| `%server.members%` | メンバーの合計数 |
| `%server.boostcount%` | ブースト数 |
| `%server.boostlevel%` | ブーストのティア |

チャンネル名は、Discordの100文字の上限に従います。

## 表示形式

**カウンタースタイル** は、`%count%` の描画方法を決定します。数値のカウンターにのみ適用されます。`NewestMember` のようなテキストのカウンターは、テキストをそのまま表示します。`TwitchLiveStatus` のような真偽値のカウンターは、「LIVE」または「Offline」のようなテキストを表示します。

| 形式 | 1234の場合の例 | 備考 |
| --- | --- | --- |
| `Plain` | `1234` | 数字をそのまま表示 |
| `Comma` | `1,234` | 桁区切りのカンマ。デフォルト。 |
| `Compact` | `1.2K` | K、M、B、Tの接尾辞。デフォルトで小数点以下1桁。 |
| `Padded` | `1234` | 固定桁数（デフォルトは4桁）にゼロ埋め。42は `0042` になります。 |
| `Ordinal` | `1,234th` | st、nd、rd、thを追加します。 |
| `Percent` | `61.7%` | 目標値に対する割合。デフォルトで小数点以下1桁。 |
| `ProgressBar` | 10マスのバー | 目標値に向けて塗りつぶされたマスと空のマス。デフォルトは10マス。 |
| `EmojiDigits` | キーキャップの数字 | 各桁をキーキャップの絵文字で表示 |
| `Roman` | `MCCXXXIV` | 1〜3999のローマ数字。それ以外の場合はカンマ形式にフォールバックします。 |

`Percent` と `ProgressBar` は、比較対象となる目標値が必要です。目標値がない場合、それぞれ `0%` または空のバーを表示します。

## 更新方式

| 方式 | ダッシュボードのラベル | 仕組み |
| --- | --- | --- |
| `Rename` | Rename only | チャンネル名を編集します。Discordでは、チャンネルごとに10分間で2回までの名前変更が許可されているため、更新間隔は最低5分に強制されます。チャンネルIDは変わりません。 |
| `Recreate` | Delete and recreate | 同じ名前、カテゴリ、位置、権限上書きを持つ新しいチャンネルを作成し、その後で古いチャンネルを削除します。1分ごとに更新できますが、更新のたびにチャンネルIDが変わり、監査ログに2件のエントリが残ります。 |
| `Auto` | Auto (recommended) | 10分間に2回の予算が残っている間は名前を変更します。予算を使い切り、間隔が5分未満の場合は、代わりに作り直します。間隔が5分以上の場合は、次の名前変更の機会を待ちます。 |

新しい統計チャンネルのデフォルトは、**5分**ごとの **Auto** です。間隔は1分（Renameの場合は5分）から1440分の間に制限されます。ボットは30秒ごとに、間隔が経過したチャンネルを確認します。

> [!WARNING]
> Recreate はチャンネルIDを変更します。そのチャンネルを参照している他のもの（他のボットの権限設定やピン留めされたリンクなど）は、更新のたびに壊れます。高速な更新が、安定したIDより重要な場合にのみ使用してください。

## 設定

このページには3つのタブ、**統計チャンネル**、**追加**、**既定値** と、ヘッダーの **更新** ボタンがあります。**統計チャンネル** には設定済みのすべてのチャンネルが一覧表示され、それぞれに **編集** と **削除** のボタンがあります。

**ステータスチャンネルを追加** では、**新しいチャンネルを作成** または **既存のチャンネルを使用** を選択できます。後者では **ボイスチャンネル** のピッカーを使用します。その後、以下の設定を行います。

| 設定 | デフォルト | 内容 |
| --- | --- | --- |
| Category（任意） | なし | 新しく作成するチャンネルの配置先 |
| Counter | なし | 一覧から選択するカウンターの種類 |
| Template | その種類のデフォルト | プレースホルダーを使ったチャンネル名。プレースホルダーのチップをクリックして挿入でき、入力中にプレビューが更新されます。 |
| Counter Style | Comma | 上の表から選ぶ表示形式 |
| Update Mechanism | Auto | Rename、Recreate、または Auto |
| Refresh Interval (minutes) | 5 | 名前を更新する頻度 |
| Role | なし | `RoleMembers` で表示されます。 |
| Target Date | なし | `Countdown` で表示されます。 |
| Goal Target | なし | `MemberGoal` で表示され、割合とプログレスバーの形式で使われます。 |
| Twitch Counter Name | なし | `TwitchCounter` で表示されます。 |
| Counting Channel | なし | カウント系の種類で表示されます。 |
| Minecraft Server | なし | Minecraft系の種類で表示されます。 |

**新しいステータスチャンネルの既定値** では、後から追加するチャンネルのための **既定の更新方式**、**既定のカウンタースタイル**、**既定の間隔（分）** を設定します。**既定値** タブには、**カウンタースタイル** と **利用可能なカウンター** の参照セクションもあります。

新しく作成されたチャンネルは、ラベルとして機能するように `@everyone` の接続を拒否します。自分で追加したチャンネルは、既存の権限をそのまま維持します。

## セットアップの流れ

1. ダッシュボードで **統計チャンネル** を開き、**既定値** タブに移動します。**既定の更新方式** を Auto のままにし、許容できる間隔を設定します。
2. **追加** に移動し、**新しいチャンネルを作成** を選択します。カウンターをまとめたい場合は **カテゴリー** を選びます。
3. **カウンター** を選びます（例：Total Members）。**テンプレート** を調整し、プレビューを確認します。
4. **カウンタースタイル** を選んで保存します。
5. 各カウンターについて繰り返します。メンバー目標の場合は、`MemberGoal` を選び、**目標値** を設定して、`ProgressBar` 形式を試してください。
6. 新しいチャンネルが上部に表示されない場合は、Discordのチャンネル一覧の一番上にドラッグします。
7. 1回の更新間隔を待ち、名前が更新されることを確認します。

## コマンド

これらのコマンドは、サーバーのプレフィックス（変更していない場合は `.`）で実行します。種類、形式、更新方式の名前は、上の表にあるものを使います（例：`TotalMembers`、`Compact`、`Recreate`）。

| コマンド | エイリアス | 必要な権限 | 目的 |
| --- | --- | --- | --- |
| `statchannelcreate <type> [template]` | `scnew` | チャンネルの管理 | そのカウンターを表示する、鍵付きの新しいボイスチャンネルを作成 |
| `statchanneladd #voice <type> [template]` | `sca` | チャンネルの管理 | 既存のボイスチャンネルを統計チャンネルに変換 |
| `statchannelrole #voice @role [true] [template]` | `scr` | チャンネルの管理 | ロールのメンバー数カウンターを追加。`true` の場合はオフラインではないメンバーのみを数えます。 |
| `statchannelcountdown #voice <date> [template]` | `scc` | チャンネルの管理 | 日付へのカウントダウンを追加 |
| `statchannelgoal #voice <number> [template]` | `scg` | チャンネルの管理 | メンバー目標のカウンターを追加 |
| `statchanneltwitchcounter #voice <counter> [template]` | | チャンネルの管理 | 名前付きのTwitchチャットカウンターを反映 |
| `statchannelmechanism #voice <mechanism> [minutes]` | | チャンネルの管理 | rename、recreate、auto を設定し、必要に応じて間隔も設定 |
| `statchannelstyle #voice <style>` | | チャンネルの管理 | 表示形式を設定 |
| `statchanneldefaults [mechanism] [minutes] [style]` | | チャンネルの管理 | 新しい統計チャンネルのデフォルトを設定 |
| `statchanneltypes [category]` | | なし | 例とともにすべてのカウンターを閲覧（カテゴリで絞り込み可能） |
| `statchannellist` | `scl` | なし | このサーバーの統計チャンネルを、種類、形式、モード、テンプレートとともに一覧表示 |
| `statchannelremove #voice` | `statchrm` | チャンネルの管理 | チャンネルの追跡を停止 |

`statchannelcreate` では、ボットにもチャンネルの管理権限が必要です。スラッシュコマンドの相当するものは `/statchannel` にあります。

## ヒントと注意点

- ボットは、チャンネルの名前を変更または作り直すためにチャンネルの管理権限が必要です。
- ボイスチャンネルは1つの統計チャンネルにしかできません。2回追加すると「already a stat channel」というエラーで失敗します。
- カウント、Minecraft、Twitchのカウンターには、先にそれぞれの機能を設定しておく必要があります。カウントとMinecraftの対象はダッシュボードで選択します。これらに対応するコマンドはありません。
- `statchannelremove` は追跡を停止するだけです。不要になったボイスチャンネルは、自分で削除してください。
- Twitchの視聴者数や未解決のチケット数などのライブ値も、そのチャンネルの間隔に従います。すべてのチャンネルではなく、それらのチャンネルの間隔を短くしてください。
- `Percent` と `ProgressBar` の形式は、チャンネル自身の目標値を使います。目標値のないカウンターにこれらの形式を設定すると、常にゼロが表示されます。
