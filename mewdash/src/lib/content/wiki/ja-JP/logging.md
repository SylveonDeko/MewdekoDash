---
title: ログ
slug: logging
summary: 参加、退出、編集、削除、BAN、ロールやチャンネルの変更などの記録を、選んだログチャンネルに送信します。イベントごとのルーティングとチャンネルの除外に対応しています。
icon: fa-file
category: Security
dashboard: /dashboard/logging
module: Administration
tags: [logging, logs, audit, events, message deleted, message edited, join leave, mod log, ignored channels, ログ, 監査, イベント, メッセージ削除, メッセージ編集, 参加退出, モデレーションログ, 無視するチャンネル]
related: [moderation, administration, filter]
---

## 概要

ログ機能は、ボットがDiscordから受け取るイベントを監視し、各イベントの概要を選択したテキストチャンネルに投稿します。削除されたメッセージには、誰が書いたか、何と書かれていたかが表示されます。メンバーの参加では、アカウントの作成日が表示されます。ロールの変更では、追加または削除されたロールが表示されます。ボットが監査ログを読める場合は、誰が操作したかも表示されます。

イベントの種類ごとにチャンネルの設定があるため、メッセージの編集は1つのチャンネルに、モデレーション操作は別のチャンネルに送り、その他はオフにできます。ログチャンネルを割り当てるまで何も記録されず、チャンネルが空のイベントの種類は無言でスキップされます。

チャンネルは除外することもできます。無視されたチャンネルでは、メッセージ、スレッド、ボイスのログが一切記録されません。これにより、スタッフ用のルームやボットのスパムチャンネルを記録から除外できます。

## 利用する理由

- 削除されたメッセージと編集されたメッセージのコピーを保存し、モデレーターが後から削除内容を確認できるようにします。
- 誰が参加して退出したかを、アカウントの作成日とともに記録し、レイドや代替アカウントを見つけやすくします。
- BAN、BAN解除、ミュートを、責任のあるモデレーターとともに記録し、説明責任を果たせるようにします。
- 他の管理者や乗っ取られたアカウントによるロール、チャンネル、権限の変更を監視します。
- ボイスチャンネルが主な交流の場になっているサーバーで、ボイスの活動を追跡します。

## ログのイベントの種類

それぞれの種類は、異なるチャンネルに送るか、オフのままにできます。ここに示すのは `log` が受け付ける値で、ダッシュボードにも表示されます。

| 種類 | ダッシュボードの表示 | 記録されるタイミング |
| --- | --- | --- |
| `MessageUpdated` | Message Updated | メッセージの内容が編集されたとき（ボットの投稿と内容が変わっていないものはスキップされます） |
| `MessageDeleted` | Message Deleted | メッセージが削除されたとき |
| `MessagesBulkDeleted` | Messages Bulk Deleted | 複数のメッセージが一度に消去されたとき。キャッシュされていた数も表示されます |
| `ReactionEvents` | Reaction Events | リアクションが追加または削除されたとき。メッセージごとに5秒ごとにまとめられます |
| `ThreadCreated` | Thread Created | スレッドが作成されたとき |
| `ThreadDeleted` | Thread Deleted | スレッドが削除されたとき |
| `ThreadUpdated` | Thread Updated | スレッドの名前やアーカイブの状態などが変わったとき |
| `UsernameUpdated` | Username Updated | メンバーのグローバルユーザー名が変わったとき |
| `NicknameUpdated` | Nickname Updated | メンバーのサーバーニックネームが変わったとき |
| `UserUpdated` | User Updated | アバターやグローバル表示名などのプロフィールが変わったとき |
| `UserJoined` | User Joined | メンバーがサーバーに参加したとき |
| `UserLeft` | User Left | メンバーが退出またはキックされたとき |
| `UserRoleAdded` | User Role Added | 1つ以上のロールがメンバーに付与されたとき |
| `UserRoleRemoved` | User Role Removed | 1つ以上のロールがメンバーから削除されたとき |
| `UserBanned` | User Banned | メンバーがBANされたとき |
| `UserUnbanned` | User Unbanned | BANが解除されたとき |
| `UserMuted` | User Muted | メンバーがボイスまたはテキストでミュートされたとき |
| `VoicePresence` | Voice Presence | メンバーがボイスで参加、退出、移動、ミュート、スピーカーオフ、配信を行ったとき |
| `VoicePresenceTts` | Voice Presence TTS | メンバーがボイスで読み上げ機能を使った可能性があるとき。検出はベストエフォートです |
| `ServerUpdated` | Server Updated | サーバーの名前、アイコン、オーナーなどの設定が変わったとき |
| `EventCreated` | Event Created | 予定されたサーバーイベントが作成されたとき |
| `InviteCreated` | Invite Created | 招待が作成されたとき。最大有効期間と使用回数も表示されます |
| `InviteDeleted` | Invite Deleted | 招待が削除されたとき |
| `RoleCreated` | Role Created | ロールが作成されたとき |
| `RoleDeleted` | Role Deleted | ロールが削除されたとき |
| `RoleUpdated` | Role Updated | ロールの名前、色、権限が変わったとき |
| `ChannelCreated` | Channel Created | チャンネルが作成されたとき |
| `ChannelDestroyed` | Channel Destroyed | チャンネルが削除されたとき |
| `ChannelUpdated` | Channel Updated | チャンネルの名前、トピック、権限が変わったとき |
| `Other` | Other | 上記に含まれないその他のイベント |

ダッシュボードには **アバターの更新** の項目も表示されます。これは他の項目と一緒に保存され、Users と All のカテゴリーで設定されますが、`log` コマンドに渡せる値ではありません。

## カテゴリー

`logcategory` は、グループ全体の種類を1つの手順でまとめて1つのチャンネルに設定します。チャンネルを指定せずに実行すると、そのグループのすべての種類がクリアされます。

| カテゴリー | 設定される種類 |
| --- | --- |
| `All` | 上記のすべての種類 |
| `Users` | NicknameUpdated, AvatarUpdated, UsernameUpdated, UserRoleAdded, UserRoleRemoved, VoicePresence, UserJoined, UserLeft, UserUpdated |
| `Threads` | ThreadCreated, ThreadDeleted, ThreadUpdated |
| `Roles` | RoleCreated, RoleDeleted, RoleUpdated |
| `Server` | ServerUpdated, EventCreated, InviteCreated, InviteDeleted |
| `Channel` | ChannelCreated, ChannelDestroyed, ChannelUpdated |
| `Messages` | MessageDeleted, MessageUpdated, MessagesBulkDeleted, ReactionEvents |
| `Moderation` | UserMuted, UserBanned, UserUnbanned, Other |
| `None` | すべての種類をクリアします（ダッシュボードの **すべて無効化** が使用します） |

## 無視するチャンネル

無視リストにあるチャンネルでは、その中で起きるメッセージ、スレッド、チャンネル、ボイスのイベントがスキップされます。スレッドは親チャンネルの設定を引き継ぐため、フォーラムやテキストチャンネルを無視すると、そのスレッドも無視されます。ボイスチャンネルを無視すると、そのチャンネルへの入室と退室のボイスログが抑制されます。

チャンネルを無視しても、メンバー、ロール、サーバーのイベントは止まりません。それらはチャンネルに紐づかないためです。

## 設定

ログのページには、**ログチャンネル** と **Ignored Channels** の2つのタブがあります。

| 設定 | デフォルト | 制御する内容 |
| --- | --- | --- |
| Log Channels | なし | イベントの種類ごとのチャンネル選択です。Popular、Users、Messages、Moderation、Server、Channels、Roles、Threads、Voice、All Events のグループに分かれています |
| Clear Category | | 表示中のグループのすべての選択をクリアします。**設定を保存** で反映されます |
| Clear All | | **すべてのイベント** グループに表示されます。すべての選択をクリアし、保存時に反映されます |
| Disable All | | いずれかのチャンネルが設定されている間に表示されるヘッダーのボタンです。確認後、すべてのイベントの種類の割り当てを即座に解除します。無視するチャンネルは残ります |
| Ignored Channels | なし | ログから除外するチャンネルです。**Active Channels** と **Ignored Channels** のリストの間で移動します |

> [!TIP]
> **人気** グループには、User Joined、User Left、Message Deleted、Message Updated、User Banned、User Unbanned、Channel Created、Channel Destroyed が含まれます。ほとんどのサーバーにとって、良い出発点になります。

## セットアップの手順

1. スタッフだけが読めるプライベートなログチャンネルを1つ以上作成します。
2. ダッシュボードで **ログ** を開き、**ログチャンネル** タブのままにします。
3. **人気** グループで、記録したいイベントごとにログチャンネルを選び、保存します。
4. **モデレーション** や **ボイス** など他のグループに切り替えて、必要なものにチャンネルを割り当てます。
5. **Ignored Channels** タブを開き、スタッフ用のルームやボットのコマンドチャンネルを無視リストに移動します。
6. テストメッセージを削除し、正しいチャンネルにログが表示されることを確認します。

## コマンド

コマンドは、サーバーのプレフィックスで実行します（変更していなければ `.`）。スラッシュ版は `/log` の下にあります。

| コマンド | エイリアス | 必要な権限 | 目的 |
| --- | --- | --- | --- |
| `log <type> [#channel]` | | Administrator | 1つのイベントの種類を1つのチャンネルに送ります。チャンネルを指定しない場合は現在のチャンネルを使います |
| `log #channel [types...]` | | Administrator | 複数の種類を1つのチャンネルに送ります。種類を指定しない場合は、すべての種類の選択メニューを開きます |
| `log "#channel:Type1,Type2" ...` | | Administrator | 1つのメッセージで、複数のチャンネルと種類の組み合わせを設定します |
| `logcategory <category> [#channel]` | `logcat` | Administrator | カテゴリー全体を1つのチャンネルに設定します。チャンネルを指定しないとクリアされます |
| `logevents` | | Administrator | すべてのイベントの種類と、現在使用しているチャンネルを一覧表示します |
| `logignore [#channel]` | `lignore` | Administrator | チャンネルを無視リストに出し入れします。デフォルトは現在のチャンネルです |
| `logignorelist` | `lignorel` | Administrator | 無視リストを表示します |
| `commandlogchannel [#channel]` | `commandlog`, `logcommands` | Administrator | ボットのコマンドの使用をチャンネルに記録します。チャンネルを指定しないとオフになります |

> [!EXAMPLE]
> `log "#mod-logs:UserBanned,UserUnbanned,UserMuted" "#message-logs:MessageDeleted,MessageUpdated"`

## ヒントと注意点

- ボットには **監査ログを表示** を与えてください。これがないと、ログは投稿されますが、誰がメッセージを削除したか、誰をBANしたか、誰がロールを変更したかは表示されません。
- ボットは、各ログチャンネルでメッセージを見て送信できる必要があります。ボットから見えないログチャンネルは、エラーなしでスキップされます。
- 削除されたメッセージと編集されたメッセージのログは、ボットのメッセージキャッシュに依存します。ボットが最後に再起動する前に送られたメッセージや、一括削除されたメッセージは、キャッシュされていないと表示されることがあります。
- リアクションのログはまとめられます。メッセージへのすべてのリアクションの変更が約5秒以内に行われた場合、1つの項目として届きます。忙しいサーバーでの大量の投稿を防ぐためです。
- `log #channel` で開く選択メニューには、1つのメニューにつき最大25の種類が表示されます。そのチャンネルにすでに送られている種類は、あらかじめ選択されています。
- `logcategory` は、カテゴリー内のすべての種類を上書きします。別のチャンネルに振り分けていたものも含まれます。その後で個別の種類を設定する場合は `log` を使ってください。
