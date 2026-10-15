---
title: カウント
slug: counting
summary: チャンネルをカウントゲームにします。メンバーが順番に次の数字を投稿し、リアクション、連続記録、リーダーボード、セーブポイント、カウントを間違えた場合のペナルティを設定できます。
icon: fa-list-numeric
category: Community
dashboard: /dashboard/counting
module: Counting
tags: [counting, count, numbers, game, channel, leaderboard, streak, milestones, save point, カウント, 数字, ゲーム, チャンネル, リーダーボード, 連続記録, マイルストーン, セーブポイント]
related: [administration, xp]
---

## 概要

スタッフがチャンネルを選び、`countingsetup` を実行します。その後、ボットはそのチャンネルのすべてのメッセージを監視します。メッセージが次に期待される数字であれば、ボットはチェックマークでリアクションし、そのメンバーのカウントを記録します。間違った数字であれば、ボットはバツ印でリアクションし、デフォルトでは2秒後にそのメッセージを削除して、チャンネルをきれいに保ちます。

ボットは現在の数字、これまでに到達した最大の数字、カウントの合計数、そして最後にカウントした人を記録します。デフォルトでは、同じメンバーが2回続けてカウントすることはできないため、ゲームには少なくとも2人が必要です。メンバーは自分の統計、連続記録、正確さを確認でき、チャンネルごとのリーダーボードもあります。

スタッフ向けには、悪いカウントの後に数字を巻き戻せるセーブポイントがあります。また、時間枠の中でメンバーごとの間違ったカウントを追跡し、段階的なペナルティを適用するモデレーション機能もあります。カウントの禁止やタイムアウトを行うことも、誰が参加できるかを決めるロールのルールを設定することもできます。複数のチャンネルでカウントを同時に実行でき、それぞれに独自の設定があります。

## 利用する理由

- 手間をかけずに運営でき、メンバーに共通の目標を与えるコミュニティゲームです。
- 大きなサーバーでは、クールダウンと連続投稿禁止のルールを加えて、1人がカウントを稼ぐことを防げます。
- スタッフは、誰が間違えたかで争う代わりに、セーブポイントから数字を復元できます。
- 意図的にカウントを壊し続ける常習者を、自動でカウントからミュートまたは禁止できます。

## カウントの確認方法

カウントチャンネルでメンバーが投稿すると、ボットは次の順番でチェックを行います。

1. カウントを禁止されているメンバーは、完全に無視されます。
2. 禁止されたロールを持つメンバー、必要なロールのいずれも持たないメンバー、または無視されたロールを持つメンバーはスキップされます。無視されたロールのメッセージは、設定してあれば削除されます。
3. メッセージが有効な数字に見える場合、ボットはそれにリアクションできるかをテストします。リアクションに失敗した場合、ボットはそのメンバーがボットをブロックしているとみなし、メッセージを削除して、5秒後に消える短い警告を投稿します。
4. まだ **クールダウン** の途中にあるメンバーは拒否されます。
5. **連続投稿を許可** がオフで、同じメンバーが直前にカウントしている場合、メッセージは拒否されます。
6. テキストはチャンネルのパターンで解析されます。数字でないものは、以下の数字以外のルールで処理されます。
7. 数字は、現在の数字に **増分** を加えた値と一致する必要があります。間違った数字は、そのメンバーのエラーとして数えられ、**エラー時にカウントをリセット** がオンの場合、チャンネルは開始番号にリセットされます。
8. **最大数** が設定されていて、数字がそれを超えた場合、カウントは停止し、スタッフに通知されます。

正しいカウントでは、チャンネル、メンバーの統計と連続記録が更新され、そのメンバーのクールダウンが開始し、マイルストーンが確認され、イベントが記録されます。

正しいカウントには **成功時の絵文字** のリアクション（デフォルトはチェックマーク）が付き、失敗には **エラー時の絵文字**（デフォルトはバツ印）が付きます。どちらも標準の絵文字またはカスタム絵文字にできます。

## カウントのパターン

パターンは、メンバーが数字をどのように書かなければならないかを決めます。ボットは次のパターンを解析します。

| パターン | メンバーが入力する内容 |
| --- | --- |
| Normal | 通常の数字：`1`、`2`、`3`。**基数** が10以外の場合、数字はその基数で解釈されます。 |
| Roman | ローマ数字：`I`、`II`、`III`、`IV` |
| Binary | `1`、`10`、`11`、`100` |
| Hexadecimal | `1` から `9`、その後 `A`、`B`、`C` |
| Words | `twenty-one` や `one hundred and five` のような、文字で書いた数字 |
| Ordinal | `1st`、`2nd`、`3rd`、`4th` |
| Fibonacci | フィボナッチ数列：`1`、`1`、`2`、`3`、`5`、`8` |
| Primes | 素数のみ：`2`、`3`、`5`、`7`、`11` |

Normal がデフォルトです。パターンはダッシュボードから設定します。これ用のコマンドはありません。

> [!WARNING]
> ダッシュボードの **カウントのパターン** のドロップダウンには、現在 Sequential、Skip Multiples、Fibonacci、Primes、Powers of Two が表示されていますが、その値は上記のボットのパターン一覧と一致していません。現時点でダッシュボードから安全に選べるのは Sequential（Normal）だけです。

## マイルストーン

ボットは、数字が100、500、1,000、5,000、10,000の倍数に初めて到達したときにマイルストーンを記録します。マイルストーンは **統計** タブと `countingstatus` に表示されます。

ダッシュボードの **管理** タブと `countingmilestones` では、チャンネルごとにカスタムのマイルストーン番号の一覧を保存できます。同じタブと `countingmilestonemessage` ではマイルストーンのメッセージを、`countingmilestonechannel` ではマイルストーンのお知らせチャンネルを保存できます。これらの値は保存されますが、ボットはまだマイルストーンのお知らせを投稿しないため、将来のバージョンのための予約として扱ってください。

## 統計とリーダーボード

すべてのメンバーには、チャンネルごとの統計があります。貢献数、現在の連続記録、最大の連続記録、正確さ、エラー数、カウントした数字の合計、最後の貢献が含まれます。`countingstats` は、メンバーのランクとともにこれらを表示します。

`countingleaderboard` と **ランキング** タブでは、4つの種類のいずれかで並べ替えます。

| 種類 | 並べ替えの基準 |
| --- | --- |
| `contributions` | 正しいカウントの数（デフォルト） |
| `streak` | 最大の連続記録 |
| `accuracy` | 正しいカウントの割合 |
| `totalnumbers` | カウントした数字の合計 |

コマンドは上位20人を、1ページに10人ずつ表示します。

## セーブポイント

`countingsave` は、現在の数字をオプションの理由とともに保存し、セーブIDを返します。`countingrestore <id>` は、確認の後にチャンネルをその数字に戻します。`countingreset` は、確認の後に任意の数字を直接設定し、デフォルトは0です。この3つはすべて **管理** タブにもあります。

## モデレーション

カウントのモデレーションは、`countmodenable true` でチャンネルごとに、または `countmoddefaults true` でサーバー全体に有効にするまでオフです。チャンネルの設定はサーバーのデフォルトより優先されます。`countmodreset` は、チャンネルをデフォルトの設定に戻します。

有効にすると、間違った数字はすべてメンバーに対して記録され、**time window**（デフォルトは24時間、1から168）の間の間違ったカウントの合計に加算されます。メンバーの合計がちょうど特定の数字に達すると、段階的なペナルティが発動します。例えば `countmodpunish 3 Mute 30` は、3回目の間違ったカウントで30分間ミュートします。チャンネルを指定して設定した段階はそのチャンネルに適用され、指定せずに設定した段階はサーバーのデフォルトになります。チャンネルの段階が優先されます。`Softban`、`Kick`、`RemoveRoles` は期間を指定できず、期間の上限は49日です。`AddRole` にはロールが必要です。

モデレーションがオンのときだけ、次の2つの追加ルールが適用されます。

- **数字以外**：`countmodnonnumbers` で、チャンネル内のチャットメッセージを削除するか（デフォルトは「はい」）、違反としてカウントするか（デフォルトは「いいえ」）を決めます。
- **編集**：`countmodedits` で、チャンネル内のメッセージを編集したときに削除するか（デフォルトは「はい」）、違反としてカウントするか（デフォルトは「いいえ」）を決めます。

ロールのルール：**必要なロール** は、カウントするために少なくとも1つ必要なロールです。**禁止ロール** は、そのいずれかを持つメンバーをブロックします。`countmodignore` は、指定したロールを持つメンバーをスキップし、必要に応じてそのメッセージを削除します。

`countingban`、`countingtimeout`、`countingunban` は、1人のメンバーをチャンネルからブロックします。永続または期間を指定できます。**管理** タブには、ユーザーIDで同じ操作を行う機能があり、また **チャンネルのデータを消去** ボタンもあります。このボタンは、データを削除する `countingdisable` と purge に対応します。

## 設定

ダッシュボードには5つのタブがあります。**チャンネル**、**設定**、**統計**、**ランキング**、**管理** です。他のタブはすべて選択したチャンネルに対して動作するため、まず **チャンネル** でチャンネルを選んでください。

| 設定 | デフォルト | 制御する内容 |
| --- | --- | --- |
| Start Number | 1 | カウントを開始する数字です。セットアップ時に設定します |
| Increment | 1 | 各カウントで加算される量です。正の数である必要があります |
| Counting Pattern | Normal | 数字の書き方です。上記を参照してください |
| Number Base | 10 | Normal パターンで使われる基数です |
| Cooldown (seconds) | 0 | 同じメンバーが2回カウントするまでの待機時間です。0から300 |
| Max Number | 0（無制限） | この数字を超えるとカウントが停止します |
| Success Emote | チェックマーク | 正しいカウントに付くリアクションです |
| Error Emote | バツ印 | 間違ったカウントに付くリアクションです |
| Allow repeated users | オフ | 1人が2回続けてカウントできるようにします |
| Reset count on error | オフ | 間違った数字でチャンネルを開始番号にリセットします |
| Delete wrong messages | オン | 間違った数字を2秒後に削除します |
| Enable achievements | オン | `countingconfig` に表示される保存済みのフラグです |
| Enable competitions | オン | `countingconfig` に表示される保存済みのフラグです |
| Required Roles | なし | カウントするにはこのいずれかが必要です |
| Banned Roles | なし | これらを持つメンバーはカウントできません |

> [!NOTE]
> `countingfailurethreshold` コマンドは1から10の値（デフォルトは3）を保存し、`countmodthreshold` は間違ったカウントのしきい値を保存します。ただし、ペナルティは `countmodpunish` で設定した段階からのみ発動します。

## セットアップの手順

1. チャンネルを作成し、そこでボットに「チャンネルを見る」、「メッセージを送信」、「リアクションを追加」、「メッセージの管理」、「メッセージ履歴を読む」を許可します。
2. ダッシュボードで **カウント** を開き、**新しいカウントチャンネルを設定** でチャンネルを選び、**開始数** と **増分** を設定して保存します。
3. **設定** で、ゲームの速度を落としたい場合は **クールダウン** を設定し、絵文字を選びます。
4. 必要に応じて **必要なロール** または **禁止ロール** を追加します。
5. 自動ペナルティを使いたい場合は、チャンネルで `countmodenable true` を実行し、`countmodpunish` で段階を追加します。
6. あるアカウントから `1`、別のアカウントから `2` を投稿して、リアクションが機能することを確認します。

## コマンド

コマンドは、サーバーのプレフィックスで実行します（変更していなければ `.`）。

| コマンド | エイリアス | 必要な権限 | 目的 |
| --- | --- | --- | --- |
| `countingsetup [#channel] [start] [increment]` | `csetup`, `countsetup` | Manage Channels | チャンネルでカウントを開始します |
| `countingstatus [#channel]` | `cstatus`, `countstatus` | Nobody | 現在の数字、記録、合計、有効なルールを表示します |
| `countingconfig [#channel]` | `cconfig`, `countconfig` | Manage Channels | チャンネルの設定を表示します |
| `countingreset [#channel] [number] [reason]` | `creset`, `countreset` | Manage Messages | 数字をリセットします。デフォルトは0で、確認があります |
| `countingstats [@user] [#channel]` | `countstats` | Nobody | メンバーのカウント統計とランクを表示します |
| `countingleaderboard [type] [#channel]` | `cleaderboard`, `countleaderboard`, `clb` | Nobody | 貢献、連続記録、正確さ、totalnumbers で上位20人を表示します |
| `countingsave [#channel] [reason]` | `csave`, `countsave` | Manage Messages | セーブポイントを作成します |
| `countingrestore <saveId> [#channel]` | `crestore`, `countrestore` | Manage Messages | セーブポイントまで巻き戻します |
| `countingdisable [#channel] [purge] [reason]` | `cdisable`, `countdisable` | Manage Channels | カウントを停止します。`true` を指定するとすべてのデータも削除します |
| `countinglist` | `clist`, `countlist` | Manage Channels | 有効なカウントチャンネルを一覧表示します |
| `countingban <@user> [#channel] [duration] [reason]` | `cban`, `countban` | Manage Messages | メンバーをカウントから禁止します。期間を指定しない限り永続です |
| `countingunban <@user> [#channel] [reason]` | `cunban`, `countunban` | Manage Messages | カウントの禁止を解除します |
| `countingtimeout <@user> <duration> [#channel] [reason]` | `ctimeout`, `counttimeout` | Manage Messages | 一時的なカウントの禁止です |
| `countingcooldown [#channel] [seconds]` | `ccooldown`, `countcooldown` | Manage Channels | クールダウンを表示または設定します。0から300 |
| `countingmilestones [#channel] [50,100,...]` | `cmilestones`, `countmilestones` | Manage Channels | カスタムのマイルストーン番号を表示、設定、または `-` でリセットします |
| `countingsuccessmessage [#channel] [text]` | `csuccessmessage`, `countsuccessmessage` | Manage Channels | 成功時のテンプレートを保存します。`-` でリセットします |
| `countingfailuremessage [#channel] [text]` | `cfailuremessage`, `countfailuremessage` | Manage Channels | 失敗時のテンプレートを保存します。`-` でリセットします |
| `countingmilestonemessage [#channel] [text]` | `cmilestonemessage`, `countmilestonemessage` | Manage Channels | マイルストーンのテンプレートを保存します。`-` でリセットします |
| `countingmilestonechannel [#counting] [#target]` | `cmilestonechannel`, `countmilestonechannel` | Manage Channels | マイルストーンのチャンネルを保存します。解除するには none を指定します |
| `countingfailurechannel [#counting] [#target]` | `cfailurechannel`, `countfailurechannel` | Manage Channels | 失敗のログチャンネルを保存します。解除するには none を指定します |
| `countingfailurethreshold [#channel] [1-10]` | `cfailurethreshold`, `countfailurethreshold` | Manage Channels | 失敗のしきい値を表示または設定します |
| `countmodshow [#channel]` | `cmshow`, `countmoderationshow` | Manage Channels | モデレーションの設定とサーバーのデフォルトを表示します |
| `countmoddefaults <on/off> [threshold] [hours] [punishment] [minutes] [@role]` | `cmdefaults`, `countmoderationdefaults` | Administrator | サーバー全体のモデレーションのデフォルトです |
| `countmodenable <on/off> [#channel]` | `cmenable`, `countmoderationenable` | Manage Channels | チャンネルのモデレーションをオンまたはオフにします |
| `countmodthreshold <1-100> [#channel]` | `cmthreshold`, `countmoderationthreshold` | Manage Channels | チャンネルの間違ったカウントのしきい値を設定します |
| `countmodwindow <1-168> [#channel]` | `cmwindow`, `countmoderationwindow` | Manage Channels | 間違ったカウントが記録に残る時間（時間）です |
| `countmodpunishment <action> [minutes] [@role] [#channel]` | `cmpunishment`, `countmoderationpunishment` | Manage Channels | チャンネルのデフォルトのペナルティを設定します |
| `countmodpunish <count> <action> [minutes] [@role] [#channel]` | `cmpunish`, `countmoderationpunish` | Manage Channels | 間違ったカウントがちょうどこの回数のときのペナルティです。チャンネルを指定しない場合はサーバーのデフォルトになります |
| `countmodunpunish <count> [#channel]` | `cmunpunish`, `countmoderationunpunish` | Manage Channels | 段階を削除します |
| `countmodpunishlist [#channel]` | `cmpunishlist`, `countmoderationpunishlist` | Manage Channels | 段階を一覧表示します |
| `countmodignore <delete> [#channel] [@roles...]` | `cmignore`, `countmoderationignore` | Manage Channels | ボットが無視するロールです。そのメッセージを削除するかどうかも指定できます |
| `countmodrequired [#channel] [@roles...]` | `cmrequired`, `countmoderationrequired` | Manage Channels | カウントに必要なロールです |
| `countmodbanned [#channel] [@roles...]` | `cmbanned`, `countmoderationbanned` | Manage Channels | カウントできないロールです |
| `countmodnonnumbers <punish> [delete] [#channel]` | `cmnonnumbers`, `countmoderationnonnumbers` | Manage Channels | チャンネル内のチャットに関するルールです |
| `countmodedits <punish> [delete] [#channel]` | `cmedits`, `countmoderationedits` | Manage Channels | 編集されたメッセージに関するルールです |
| `countmodreset [#channel]` | `cmreset`, `countmoderationreset` | Manage Channels | チャンネルをサーバーのデフォルトに戻します |
| `countmodclear <@user> [#channel]` | `cmclear`, `countmoderationclear` | Manage Messages | メンバーの間違ったカウントを消去します |
| `countmodclearall [#channel]` | `cmclearall`, `countmoderationclearall` | Manage Messages | 全員の間違ったカウントを消去します |

## ヒントと注意点

- ボットには、チャンネルでのリアクションの追加が必要です。これがないと、チェックマークもバツ印も付かず、ボットをブロックしているかどうかのテストによって正しいカウントもスキップされます。
- 間違った数字や数字以外のチャットを削除するには、Manage Messages が必要です。
- ボットをブロックしているメンバーはカウントできません。その数字は削除され、警告が投稿されます。
- デフォルトの連続投稿禁止ルールでは、メンバーが2回続けて投稿すると、数字が読まれる前に拒否されます。この拒否はエラーとして数えられません。
- **エラー時にカウントをリセット** は開始番号にリセットするため、開始番号が1の場合、次に期待される数字は再び1になります。
- モデレーションのペナルティは、警告システムと同じ操作（Mute、Ban、Kick、AddRole など）を使うため、ボットには対応するDiscordの権限と、ミュート用のロールが必要です。
- `countingdisable` に purge を指定すると、そのチャンネルの統計、禁止、セーブポイントが削除され、元に戻せません。purge なしで無効にするとデータは保持されます。
