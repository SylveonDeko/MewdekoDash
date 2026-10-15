---
title: 招待
slug: invites
summary: すべての参加を招待コード、バニティURL、またはアプリに紐付けます。メンバーごとに通常、退出、偽、ボーナスの招待数を集計し、コントロールに名前を付けて、時間経過による増加、定着率、参加経路を確認できます。
icon: fa-users
category: Community
dashboard: /dashboard/invites
module: Utility
tags: [invites, invite tracking, inviter, who invited, referrals, recruitment, leaderboard, fake invites, bonus invites, retention, vanity, labels, analytics, mass ban, 招待, 招待追跡, 招待者, 誰が招待した, 紹介, 採用, リーダーボード, 偽の招待, ボーナス招待, 定着率, バニティ, ラベル, 分析, 一括BAN]
related: [multigreets, statroles, liveboards, serverstats]
---

## What it does

誰かが参加すると、ボットは参加の前後にあるサーバーの招待リンクを比較して、どのリンクが使われたかを判定します。一致するものがない場合はバニティURLを確認します。そのうえで、メンバーがどのように参加したか（メンバーの招待、バニティリンク、OAuth で追加されたボット、または不明）を記録します。参加が **fake**（偽）として判定されない限り、招待者には **regular**（通常）の招待が加算されます。招待されたメンバーが退出すると、招待者の **退出**（退出）の数が増えます。スタッフは **bonus**（ボーナス）の招待を付与することもできます。メンバーの合計は、通常から退出と偽を引き、ボーナスを足した数です。

確認されたすべての参加は、メンバーが退出した後も保存されます。そのため、ページには定着率（招待されたメンバーのうち、まだサーバーにいる人数）、再参加、そして定着する人を連れてくるコードが表示されます。

## Why you would use it

- 採用コンテストを開催し、代替アカウントや参加と退出の繰り返しで不正できないリーダーボードに基づいて報酬を出す。
- コードごとにラベルを付けて、Twitterのキャンペーン、パートナーサーバー、YouTubeのリンクが、実際に定着するメンバーを連れてきているかを確認する。
- 歓迎メッセージに、招待者とコードを表示する。
- 1つのリンクから荒らしが来た場合に、ある招待者が連れてきたすべての人を見つけて BAN する。

## How joins are attributed

- 招待の一覧を読み取るには、ボットに **サーバーの管理** が必要です。これがない場合、何も記録されません。
- 参加はサーバーごとに1件ずつ処理されます。2回の確認の間に複数の人が同じコードを使った場合、余分な分は記憶され、次の参加に加算されるため、一度に多くの参加があっても取りこぼしません。
- バニティURLからの参加は、招待者なしの **Vanity** として記録されます。OAuth で追加されたボットは **ボット** として記録されます。
- 所有者が設定されたラベル付きのコードでは、招待を作成した人ではなく、その所有者に加算されます。`invitelink` で作成される個人用リンクはこの仕組みで動作します。

## Fake detection

次のいずれかに当てはまる場合、参加は偽として判定され、招待者には通常の招待ではなく偽の招待が加算されます。

| Reason | When |
| --- | --- |
| Self | メンバーが自分自身の招待を使った |
| New account | アカウントが **Minimum account age** より新しい（0 の場合は確認しない） |
| Rejoin | メンバーが以前参加したことがあり、**再参加をカウント** がオフ |
| No avatar | メンバーにアバターがなく、**アバターのないメンバーにフラグを付ける** がオン |

**ブラックリスト**に登録された招待者、またはブラックリストのロールを持つ招待者は、引き続き招待者として表示されますが、加算は一切されません。**非表示**リストのメンバーは追跡されますが、リーダーボードからは除外されます。

## Dashboard tabs

| Tab | What it shows |
| --- | --- |
| Overview | 直近の1日、1週間、1か月、または全期間の、参加、退出、ネットの増加、定着率、偽の参加、参加経路。参加と退出のグラフ、上位の招待者、上位のコード |
| Leaderboard | すべての招待者の、通常、退出、偽、ボーナス、定着率の数値。期間またはロールで絞り込み、CSV で書き出せます。行をクリックするかメンバーを選ぶと、内訳を表示し、通常、ボーナス、偽の招待を追加または削除したり、リセットしたりできます |
| Members | 確認されたすべての参加を、招待者、招待コード、またはラベルで絞り込んだ一覧。参加経路、フラグの有無、まだいるかどうかを表示します。CSV で書き出せます |
| Codes & Labels | サーバー内のすべての招待コードと、その作成者、チャンネル、使用回数。コードにラベルを付け、そのコードから参加した全員に付与されるロールを任意で設定できます。コードを削除することもできます |
| Settings | 追跡、退出時の削除、再参加のカウント、アバターなしのフラグ、最小アカウント年齢、個人用リンクの向き先のチャンネル、参加と退出のログチャンネル、ブラックリスト、非表示のメンバー、インポートとリセットのツール |

## Settings

| Setting | Default | What it controls |
| --- | --- | --- |
| Track invites | on | 参加を招待者に紐付けるかどうか |
| Remove credit when members leave | on | 招待されたメンバーが退出したとき、招待者の退出数に1を加え、合計を下げる |
| Count rejoins | on | オフにすると、以前参加したことのあるメンバーを偽の招待としてフラグ付けする |
| Flag members without an avatar | off | アバターのないアカウントからの参加を偽として扱う |
| Minimum account age | 0 days | これより新しいアカウントは偽としてフラグ付けされる |
| Personal link channel | system channel | `invitelink` で作成された招待の向き先 |
| Join and leave log channel | none | 参加と退出のたびに、誰が誰を招待したか、コード、アカウントの年齢、偽のフラグを示す埋め込みを投稿する |

**Discord から使用履歴を取り込む** は、各招待者の通常の合計を、そのコードすべての使用回数の合計まで引き上げます。この値を下げることはないため、再起動や新規インストールの後に再実行しても安全です。**退出した招待者をリセット** は、サーバーにもういない全員の集計を消去します。**すべてリセット** は、すべての集計と参加履歴を消去します。

## Greet placeholders

追跡が有効になると、どの挨拶でも以下を使えます。不明な値は `Unknown` または `0` になります。

| Placeholder | Value |
| --- | --- |
| `%inviter.mention%`、`%inviter.username%`、`%inviter.id%`、`%inviter.avatar%` | 加算された招待者 |
| `%inviter.count%`、`%inviter.regular%`、`%inviter.left%`、`%inviter.fake%`、`%inviter.bonus%` | 招待者の集計 |
| `%invite.code%`、`%invite.url%`、`%invite.uses%`、`%invite.label%`、`%invite.type%`、`%invite.fake%` | 使われた招待 |
| `%user.joincount%`、`%user.leavecount%` | このメンバーが参加と退出をした回数 |
| `%server.members.ordinal%` | メンバー数を 1st、2nd、1,204th の形式で表示 |
| `%user.joined.R%`、`%user.created.F%` など、Discord のタイムスタンプ形式 t、T、d、D、f、F、R | 参加日時とアカウント作成日時を、リアルタイムのタイムスタンプとして表示 |

## Commands

これらのコマンドは、サーバーのプレフィックスを付けて実行します（変更していなければ `.`）。すべてのコマンドは `/invites` の下にもあります。

| Command | Aliases | Needs | Purpose |
| --- | --- | --- | --- |
| `invites [@user]` | | Nobody | メンバーの合計と、通常、退出、偽、ボーナスの内訳、順位 |
| `whoinvited [@user]` | `invitedby` | Nobody | メンバーを招待した人、コード、参加がフラグ付けされたかどうか |
| `invitedusers [@user]` | `userinvites` | Nobody | メンバーが招待した全員。参加日とフラグを含む |
| `invitedbycode <code>` | | Nobody | そのコードから参加した全員 |
| `invitedbylabel <label>` | | Nobody | ラベル付きのコードから参加した全員 |
| `inviteleaderboard [AllTime/Daily/Weekly/Monthly] [@role]` | `inviteslb` | Nobody | 期間ごとのリーダーボード。任意でロールを1つ指定 |
| `invitestats [range]` | `growthstats` | Nobody | 参加、退出、ネット、定着率、偽の参加、参加経路、上位の招待者とコード |
| `invitecodes [@user]` | `mycodes` | Nobody | メンバーの招待コードと、その使用回数 |
| `invitelink` | `findlink`, `mylink` | Nobody | あなた専用の永続リンク。ない場合は作成されます |
| `addinvites`, `removeinvites`, `addbonusinvites`, `removebonusinvites`, `addfakeinvites`, `removefakeinvites <@user> <amount>` | | Manage Server | メンバーの集計を調整します |
| `resetinvites <@user>` または `resetinvites Server` または `resetinvites LeftMembers` | | Manage Server。サーバー全体の場合は Administrator | 集計をリセットします |
| `syncinvites [@user]` | | Manage Server | Discord から使用回数をインポートします |
| `deleteinvite <code>` | `delinvite` | Manage Server | コードを削除します |
| `purgeinvites [maxUses] [#channel]` | | Manage Server | 指定した回数以下しか使われていない、ラベルのないコードをすべて削除します |
| `inviteblacklist <@user or @role>` | `invbl` | Manage Server | 誰かが加算を受けられるかどうかを切り替えます |
| `invitehide <@user>` | `invhide` | Manage Server | 誰かをリーダーボードに表示するかどうかを切り替えます |
| `inviteexclusions` | | Manage Server | ブラックリストと非表示のメンバーを一覧表示します |
| `invitelabelset <code> <label>`, `invitelabelrole <code> [@role]`, `invitelabelremove <code>`, `invitelabels` | | Manage Server | ラベルを管理します |
| `inviteexport [range]`, `invitedexport [@user]` | | Manage Server | CSV でエクスポートします |
| `invitemassban <@user> [reason]`, `invitemassbancode <code> [reason]` | | Ban Members | メンバーまたはコード経由で招待され、まだいる全員を、確認後に BAN します |
| `invitesettings`, `toggleinvitetracking`, `toggleremoveinviteonleave`, `togglecountrejoins`, `togglefakenoavatar`, `setminaccountage <days>`, `invitelinkchannel [#channel]`, `invitelogchannel [#channel]` | | Manage Server | 設定 |

## Tips and gotchas

- 追跡が有効になる前、またはボットがオフラインの間に参加したメンバーには、参加の記録がありません。Discord 自身の数値から通常の合計を初期化するには、**Discord から使用履歴を取り込む** を1回実行してください。
- 偽の参加は、メンバーが退出しても合計を下げません。退出によって減るのは、通常の参加だけです。
- 退出して戻ってきたメンバーには、新しい参加記録が作られます。**再参加をカウント** がオンの場合、招待者は再び通常の招待を得ます。これにより、以前の退出分の招待が相殺されます。
- リーダーボードの定着率は、ボットが確認した参加だけを数えます。そのため100%から始まり、履歴が増えるにつれて落ち着いていきます。
- ステータスロールは招待数に応じて付与でき、ライブボードはチャンネルに招待のリーダーボードを固定できます。
