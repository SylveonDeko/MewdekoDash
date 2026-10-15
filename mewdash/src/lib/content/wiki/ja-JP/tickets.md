---
title: チケット
slug: tickets
summary: ボタンやセレクトメニューを備えたサポートチケットパネルから非公開チャンネルを開き、担当者の割り当て、優先度、タグ、ケース、トランスクリプト、スタッフ用ツールを利用できます。
icon: fa-ticket
category: Community
dashboard: /dashboard/tickets
module: Tickets
tags: [tickets, support, help desk, panel, ticket panel, transcripts, cases, claim, priority, blacklist, modmail, チケット, サポート, ヘルプデスク, パネル, チケットパネル, トランスクリプト, ケース, 割り当て, 優先度, ブラックリスト, モデメール]
related: [administration, chat-triggers, auditlog]
---

## What it does

チケットを使うと、チャンネルをヘルプデスクに変えられます。埋め込みと1つ以上のボタンまたはセレクトメニューを含むメッセージであるパネルを投稿します。メンバーがボタンをクリックするかオプションを選ぶと、ボットがそのメンバー用の非公開テキストチャンネルを作成し、そのメンバーとサポートロールだけが閲覧できるように権限を設定したうえで、**担当する** と **閉じる** のボタンを付けた開始メッセージを投稿します。

メンバー側では、クリックして必要に応じて短いフォームに入力すると、`ticket-username-1` のような名前のチャンネルが表示されます。そこで問題を説明します。クローズされると、チャンネル名は `closed-...` に変更されてロックされ、チケットの種類の設定に応じて、アーカイブカテゴリに移動されるか、一定時間後に削除されます。

スタッフ側では、チケットを割り当てて担当者を明確にし、優先度を設定し、タグを追加し、メモを残し、関連するチケットをケースにまとめて、クローズできます。クローズするたびに、トランスクリプトをチャンネルとダッシュボードに保存できます。ダッシュボードには、応答時間と解決時間、優先度別のチケット数、スタッフごとの表示も表示されます。

ボタンとセレクトメニューのオプションはそれぞれ独立したチケットの種類であり、それぞれ専用のカテゴリ、ロール、上限、フォーム、開始メッセージ、クローズ時の動作を持ちます。

## Why you would use it

- サポートサーバーで、公開のヘルプチャンネルの代わりに、1対1の非公開チャンネルを用意したい場合。
- 複数のチーム（請求、モデレーション、パートナーシップなど）があり、適切なチームに振り分けるセレクトメニューがほしい場合。
- 一般的なサポートとは別に、フォーム付きのモデレーター応募を受け付けたい場合。
- 監査証跡がほしい場合: トランスクリプト、スタッフメモ、関連する報告をまとめるケース。
- 特定のメンバーがチケットを開けないようにしたい場合。

## Panels, buttons and select menus

パネルは、1つのチャンネルにある1つのメッセージです。パネルIDはそのメッセージのIDです。パネルにはボタン、セレクトメニュー、またはその両方を含めることができます。

- **ボタン**: ボタン1つにつきチケットの種類が1つ。それぞれにラベル、任意の絵文字、スタイル（Primary、Secondary、Success、Danger）があります。
- **Select menus**: プレースホルダーとオプションのリストを持つメニューが1つ。各オプションは、ラベル、説明、絵文字を持つチケットの種類です。メニューには、少なくとも1つのオプションが必要です。

パネルのメッセージが削除された場合、`checkpanels` で欠けているパネルを確認できます。`recreatepanel` または `recreateallpanels` でパネルを再投稿し、保存されているメッセージIDを更新します。ボットはパネルメッセージの削除も監視しています。

`ticketduplicatepanel` は、パネルとすべてのコンポーネントを別のチャンネルにコピーします。`ticketmovepanel` は移動します。`ticketupdatepanel` は、埋め込みを新しい埋め込みJSONに置き換えます。

### Ticket type settings

これらの設定は、すべてのボタンとすべてのセレクトメニューのオプションにあります。ダッシュボードでは、ボタンやオプションを追加または編集するときに表示されます。

| Setting | Default | What it controls |
| --- | --- | --- |
| Channel Name Format | `ticket-{username}-{id}` | 作成されるチャンネルの名前。`{id}` はメンバーのチケット番号で、最大100文字 |
| Ticket Category | none | チャンネルを作成するカテゴリ |
| Archive Category | none | クローズまたはアーカイブされたときにチャンネルを移動するカテゴリ |
| Support Roles | none | チケットを閲覧、発言、割り当てできるロール |
| Viewer Roles | none | 閲覧のみ可能で、送信はできないロール |
| Max Active Tickets | 1 | 1人のメンバーが、この種類で同時に開けるチケットの数 |
| Auto Close (hours) | none | 種類ごとに保存され、`buttoninfo` に表示される |
| Required Response Time (minutes) | none | 種類ごとに保存され、`buttoninfo` に表示される |
| Allowed Priorities | all | この種類でスタッフが設定できる優先度 |
| Default Priority | none | 新しいチケットの初期優先度 |
| Save Transcript | off | チケットのクローズ時にトランスクリプトを生成する |
| Lock on Close | on | サポートロール以外の全員の送信を拒否する |
| Rename on Close | on | チャンネル名の先頭に `closed-` を付ける |
| Remove Creator | on | クローズ時に開始者のアクセス権を削除する |
| Delete on Close | off | 保持せず、遅延後にチャンネルを削除する |
| Delete Delay | 5 minutes | Delete on Close が有効なときの削除までの待機時間。ダッシュボードの欄は秒、`ticketclosebehavior` は分で指定する |
| Auto Archive on Close | off | クローズの一環としてチケットをアーカイブする |
| Lock on Archive | on | アーカイブ時にチャンネルを読み取り専用にする |
| Rename on Archive | on | チャンネル名の先頭に `archived-` を付ける |
| Remove Creator (archive) | off | アーカイブ時に開始者のアクセス権を削除する |
| Modal | none | チケット作成前に表示されるフォーム |
| Open message | default embed | プレースホルダー付きのカスタム開始メッセージ |

### Forms (modals)

チケットの種類では、チャンネルを作成する前に質問することができます。`setmodaltitle` でタイトルを設定し（既定値は "Create Ticket"）、`addmodalfield` で項目を追加します。項目は既定で短く、必須です。ラベルの後のオプションでこれを変更できます。複数行には `paragraph`、任意には `optional`、長さの制限には `min:X` や `max:X`（4000まで）を指定します。項目IDは、ラベルを小文字にし、スペースをアンダースコアに置き換えたものです。

回答はチケットとともに保存され、開始メッセージでは `%modal.<fieldId>%` として使用できます。

### The opening message

既定では、ボットは "Support Ticket" というタイトルの埋め込みを投稿します。この埋め込みは、メンバーを歓迎し、チケットIDと作成日時を表示し、問題を説明するよう求めます。Claim と Close のボタンが付きます。

チケットの種類ごとに、独自のテキストや埋め込みに置き換えることができます。ダッシュボードの埋め込みビルダー（**チケットを開いたときのメッセージを設定**）を使ってください。ここで使用できるプレースホルダーは次のとおりです。

| Placeholder | Value |
| --- | --- |
| `%ticket.id%` | チケット番号 |
| `%ticket.channel%` | チケットチャンネルへのメンション |
| `%ticket.user%` | 開始者のユーザー名 |
| `%ticket.user.mention%` | 開始者へのメンション |
| `%ticket.user.avatar%` | 開始者のアバターURL |
| `%ticket.user.id%` | 開始者のユーザーID |
| `%ticket.created%` | チケットが作成された日時 |
| `%modal.<fieldId>%` | フォーム項目への回答 |

一般的なプレースホルダーセットはこのメッセージには適用されません。適用されるのは上記のものだけです。

## What happens when a ticket opens

1. ブラックリストに登録されたメンバーには、一時的なメッセージで拒否されます。
2. そのメンバーがこの種類で開いているチケットは、**未対応チケットの上限**（既定値は1）に対して数えられます。
3. チャンネルはチケットカテゴリに作成されます。`@everyone` は拒否され、開始者は閲覧、送信、履歴の閲覧、ファイルの添付、リンクの埋め込みを許可されます。サポートロールには同じ権限に加えて Manage Messages が与えられ、閲覧者ロールには閲覧のみが許可されます。
4. Claim と Close のボタンを付けた開始メッセージが投稿されます。
5. ログチャンネルが設定されている場合、"new ticket" のエントリがそこに投稿されます。
6. **チケットが開かれた** イベントがチャットトリガーに公開されます。

## Claiming, notes, priorities and tags

**担当する**: サポートロールのメンバーまたは管理者が、ボタンまたは `ticketclaim` でチケットを割り当てます。チャンネルには "claimed by" の埋め込みが表示されます。割り当ての解除ができるのは、担当者または管理者だけです。クローズ済みのチケットや、すでに割り当てられているチケットは割り当てできません。

**Notes**: `ticketnote` で、現在のチケットにスタッフメモを追加します。メモはチケットとともに保存され、ダッシュボードに表示され、チケットチャンネルには青色の "note added" 埋め込みとして投稿されます。フッターには作成者が表示されます。

**優先度** は、サーバー全体で定義されるもので、`ticketaddpriority` または **設定** タブで作成します。各優先度には、ID、表示名、絵文字、1から5までのレベル、色、応答時間、**スタッフに通知** フラグがあります。チケットに優先度を設定すると、その色の埋め込みが投稿され、フラグが有効な場合はサポートロールにメンションします。チケットの種類ごとに、使用できる優先度を制限できます。

**タグ** は、サーバー全体で使うラベルで、ID、名前、説明、色を持ちます。`ticketaddtags` と `ticketremovetags` で、タグIDを使ってチケットに追加または削除します。ダッシュボードでは、各チケットにタグが表示され、タグで検索できます。

## Closing, archiving and transcripts

クローズすると、チケットは閉じた状態になり、赤色の "ticket closed" 埋め込みが投稿されます。その後、次の順序で処理されます。

1. その種類で **トランスクリプトを保存** が有効で、トランスクリプトチャンネルが設定されている場合、直近5000件のメッセージが保存され、**View Transcript** リンク付きの埋め込みがトランスクリプトチャンネルに投稿されます。このリンクはダッシュボードでトランスクリプトを開きます。
2. その種類で自動アーカイブが有効な場合、または `ticketclose true` でクローズした場合、チケットはアーカイブされます（下記を参照）。
3. それ以外の場合は、クローズ時の動作が実行されます。`closed-...` に名前を変更し、開始者を削除し、サポートロールを残したままチャンネルをロックします。その後、アーカイブカテゴリに移動するか、**クローズ時に削除** が有効な場合は、チャンネル内で警告を表示し、削除遅延の後に削除をスケジュールします。予定された削除は1分ごとに処理されます。

アーカイブすると、チャンネルは `archived-...` に名前が変更され、アーカイブカテゴリに移動され、全員に対して読み取り専用になり、チケットはアーカイブ済みとしてマークされます。`ticketarchive` は、開いているチケットに対してこの処理を直接実行します。チャンネルが存在しない場合は、チケットがアーカイブ済みとしてマークされるだけです。

クローズすると、**チケットが閉じられた** イベントがチャットトリガーに公開されます。

> [!NOTE]
> トランスクリプトが作成されるのは、その種類で **トランスクリプトを保存** が有効で、サーバーにトランスクリプトチャンネルがある場合だけです。トランスクリプトチャンネルがない場合でもクローズは成功しますが、何も保存されません。

## Cases

ケースは、関連するチケットをまとめるものです。たとえば、同じ人物に関する複数の報告などです。`ticketcreatecase <title> <description>` を使うか、**ケース** タブで作成します。その後、`ticketlinkcase <caseId>` で現在のチケットをリンクし、`ticketunlinkcase` でリンクを解除します。ケースには独自のメモがあり、クローズと再オープンができ、ダッシュボードまたは `/tickets cases` スラッシュコマンドで編集できます。

## Blacklist

`ticketblock @user [reason]` は、メンバーがチケットを開けないようにします。理由は、ログチャンネルが設定されている場合はそこに記録されます。`ticketunblock` で解除できます。ダッシュボードの **詳細設定** タブには、同じ **ブラックリストの管理** セクションがあり、ユーザーIDを入力します。

## Bulk tools

- `ticketcloseinactive <hours>` は、指定した時間の間まったく活動がない、開いているすべてのチケットをクローズします。各チケットには "auto closed" の埋め込みが投稿され、その種類にアーカイブカテゴリがある場合はアーカイブされます。**詳細設定** タブの **非アクティブなチケットをクローズ** でも同じことができます。
- `ticketmoveall <source category> <target category>` は、すべてのチケットチャンネルをカテゴリ間で移動します。

## Statistics

`ticketstats` は、合計、開いている件数と閉じた件数、平均応答時間（分）、平均解決時間（時間）、種類別と優先度別の内訳を表示します。`ticketuserstats [@user]` は、同じ情報を1人のメンバーについて表示し、そのメンバーの最近のチケットも表示します。**概要** タブには、応答時間、優先度別のチケット数、スタッフのパフォーマンスが表示されます。

## Settings

チケットのページには、6つのタブがあります。**概要**、**チケット**、**チケットパネル**、**設定**、**ケース**、**詳細設定** です。

| Setting | Default | What it controls |
| --- | --- | --- |
| Transcript Channel | none | リンク付きのトランスクリプト概要を投稿する場所（Configuration） |
| Log Channel | none | チケットの作成とブラックリストのエントリを記録する場所（Configuration） |
| Priorities | none | サーバー全体の優先度の定義（Configuration） |
| Tags | none | サーバー全体のタグの定義（Configuration） |
| Panel Embed | title "Support Tickets" | パネルのメッセージ。埋め込みエディターで作成（Ticket Panels） |
| Per-type settings | see table above | ボタンまたはセレクトメニューのオプションごとに設定（Ticket Panels） |
| Blacklist | empty | チケットを開けないメンバー（Advanced） |

**チケット** タブには、開いているチケットとクローズ済みのチケットが一覧表示され、チケット、ユーザー、チャンネル、タグで検索できます。このタブから、スタッフは、割り当て、割り当て解除、優先度の設定、タグの追加または削除、スタッフメモの追加、任意の理由付きでのクローズ、アーカイブ、トランスクリプトを開くことができます。

> [!PERMISSION]
> ボットがチケットチャンネルを作成し、閲覧できるメンバーを設定できるように、チャンネルの管理とロールの管理が必要です。ボットのロールは、チケットカテゴリとアーカイブカテゴリを閲覧できる必要があります。

## Setup walkthrough

1. 未対応のチケット用カテゴリを作成します。必要に応じて、対応済みのチケット用カテゴリも作成します。スタッフだけが閲覧できるトランスクリプトチャンネルとログチャンネルを作成します。
2. ダッシュボードで **チケット** を開き、**設定** に進んで、**トランスクリプトのチャンネル** と **Log Channel** を設定します。
3. 引き続き **設定** で、少なくとも1つの優先度（たとえば `urgent`、レベル5、Notify staff オン）を作成し、必要なタグを作成します。
4. **チケットパネル** に進み、**新しいパネルを作成** を選択します。チャンネルを選び、**パネルの埋め込み** をデザインします。
5. パネルを選択し、**新しいボタン** を追加します。ラベル、スタイル、**チケットのカテゴリー**、**アーカイブのカテゴリー**、**サポートロール** を設定し、**トランスクリプトを保存** を有効にします。クローズしたチャンネルをアーカイブカテゴリに残すか、**クローズ時に削除** と遅延時間を設定するかを決めます。
6. 必要に応じて、モーダルビルダーでフォーム項目を追加し、開始メッセージエディターで歓迎メッセージをカスタマイズします。
7. 1つのドロップダウンに複数のチケットの種類を入れる場合は、代わりに **新しいセレクトメニュー** を追加し、同じ設定でオプションを種類ごとに追加します。
8. 別のアカウントからテストチケットを開き、割り当て、優先度の設定、クローズを行い、トランスクリプトチャンネルを確認します。

Discord では、`/tickets setup wizard #channel` を使うと、テンプレート（Basic Support、Department Support、Gaming Server、Business、Mod Applications）を使って同じ手順を進められます。

## Commands

これらのコマンドは、サーバーのプレフィックスを付けて実行します（変更していなければ `.`）。パネルIDはメッセージIDです。ボタン、メニュー、オプションのIDは `panelinfo` または `ticketlistpanel` で確認できます。

| Command | Aliases | Needs | Purpose |
| --- | --- | --- | --- |
| `ticketpanel <#channel> [embedJson]` | `tpanel` | Administrator | パネルを作成します。プレビューまたは作成の確認を表示します |
| `ticketpaneldelete <panelId> [force]` | `tpaneldelete` | Administrator | パネルを削除します。`true` を指定すると、チケットが紐付いていても強制的に削除します |
| `ticketupdatepanel <panelId> <embedJson>` | `tupdatepanel` | Administrator | パネルの埋め込みを置き換えます |
| `ticketmovepanel <panelId> <#channel>` | `tmovepanel` | Administrator | パネルを別のチャンネルに移動します |
| `ticketduplicatepanel <panelId> <#channel>` | `tduplicatepanel` | Administrator | パネルとそのコンポーネントをコピーします |
| `panellist` | `plist` | Administrator | パネルを、コンポーネント数とともに一覧表示します |
| `panelinfo <panelId>` | `pinfo` | Administrator | パネルのボタンとメニューを、IDとともに表示します |
| `ticketlistpanels` | `tlistpanels` | Manage Channels | すべてのパネルの詳細なページ付き一覧を表示します |
| `ticketlistpanel <panelId>` | `tlistpanel` | Manage Channels | 1つのパネルのすべてのコンポーネントを、設定とともに表示します |
| `checkpanels` | `tcheckpanels` | Administrator | メッセージまたはチャンネルが見つからないパネルを報告します |
| `recreatepanel <panelId>` | `trecreate` | Administrator | 見つからないパネルを再投稿します |
| `recreateallpanels` | `trecreateall` | Administrator | 見つからないすべてのパネルを再投稿します |
| `setpaneltranscripts <panelId> <true or false>` | `sptranscripts` | Administrator | パネル上のすべてのボタンについて、トランスクリプトを切り替えます |
| `ticketaddbutton <panelId> <label> [style] [emoji]` | `taddbtn` | Administrator | ボタンを追加します |
| `buttoninfo <buttonId>` | `binfo` | Administrator | ボタンの設定を表示します |
| `deletebutton <buttonId>` | `delbtn` | Administrator | ボタンを削除します |
| `ticketcategory <buttonId> [category]` | `tcat` | Administrator | チケットカテゴリを設定またはクリアします |
| `ticketarchivecategory <buttonId> [category]` | `tarchivecat` | Administrator | アーカイブカテゴリを設定またはクリアします |
| `ticketautoarchive <buttonId> [true or false]` | `tautoarchive` | Administrator | クローズ時に自動でアーカイブします |
| `ticketclosebehavior <buttonId> [autoArchive] [deleteOnClose] [lockOnClose] [renameOnClose] [deleteDelayMinutes]` | `tclosebehavior` | Administrator | クローズ時の動作をまとめて設定します |
| `ticketautoclose <buttonId> [hours]` | `tautoclose` | Administrator | 自動クローズまでの時間を設定またはクリアします |
| `setautoclose <buttonId> <hours>` | `sautoclose` | Administrator | 上記と同じです |
| `ticketresponsetime <buttonId> [minutes]` | `tresponsetime` | Administrator | 必要な応答時間を設定またはクリアします |
| `setresponsetime <buttonId> <minutes>` | `sresponsetime` | Administrator | 上記と同じです |
| `setmodaltitle <buttonId> <title>` | `smodaltitle` | Administrator | チケットフォームのタイトルです |
| `addmodalfield <buttonId> <label> [options]` | `addmfield` | Administrator | フォーム項目を追加します。オプションの例: `paragraph,optional,max:500` |
| `removemodalfield <buttonId> <fieldId>` | `removemfield` | Administrator | フォーム項目を削除します |
| `listmodalfields <buttonId>` | `listmfields` | Administrator | フォーム項目を一覧表示します |
| `addselectmenu <panelId>` | `addsmenu` | Administrator | ガイド付きの入力でセレクトメニューを追加します |
| `addoption <menuId> <label> [description] [emoji]` | `addopt` | Administrator | メニューにオプションを追加します |
| `listoptions <menuId>` | `listopts` | Administrator | メニューのオプションを一覧表示します |
| `removeoption <menuId> <value>` | `removeopt` | Administrator | 値を指定してオプションを確認します（注意点を参照） |
| `deleteselectoption <optionId>` | `delselectoption` | Administrator | オプションを削除します。最後の1つは削除できません |
| `setplaceholder <menuId> <text>` | `splaceholder` | Administrator | メニューのプレースホルダーを変更します |
| `deleteselectmenu <menuId>` | `delselectmenu` | Administrator | メニューとそのオプションを削除します |
| `ticketclaim` | `tclaim` | Nobody | 現在のチケットを割り当てます（サポートロールまたは管理者） |
| `ticketunclaim` | `tunclaim` | Nobody | 自分の割り当てを解除します（担当者または管理者） |
| `ticketclose [archive]` | `tclose` | Nobody | 現在のチケットをクローズします。`true` を指定するとアーカイブもします |
| `ticketarchive` | `tarchive` | Manage Channels | 現在のチケットをアーカイブします |
| `ticketnote <text>` | `tnote` | Nobody | スタッフメモを追加します |
| `ticketpriority <priorityId>` | `tpriority` | Nobody | 現在のチケットの優先度を設定します |
| `ticketaddtags <tagId...>` | `taddtags` | Nobody | 現在のチケットにタグを追加します |
| `ticketremovetags <tagId...>` | `tremovetags` | Nobody | 現在のチケットからタグを削除します |
| `ticketaddpriority <id> <name> <emoji> <level> <pingStaff> <responseTime> <color>` | `taddpriority` | Administrator | 優先度を定義します。例: `taddpriority urgent Urgent :fire: 5 true 00:15:00 red` |
| `ticketremovepriority <id>` | `tremovepriority` | Administrator | 優先度の定義を削除します |
| `ticketaddtag <id> <name> <description> <color>` | `taddtag` | Administrator | タグを定義します |
| `ticketremovetag <id>` | `tremovetag` | Administrator | タグの定義を削除します |
| `ticketcreatecase <title> <description>` | `tcreatecase` | Manage Messages | ケースを作成します |
| `ticketlinkcase <caseId>` | `tlinkcase` | Manage Messages | 現在のチケットをケースにリンクします |
| `ticketunlinkcase` | `tunlinkcase` | Manage Messages | 現在のチケットのケースへのリンクを解除します |
| `ticketblock @user [reason]` | `tblock` | Administrator | メンバーをブラックリストに登録します |
| `ticketunblock @user` | `tunblock` | Administrator | ブラックリストから削除します |
| `tickettranscriptchannel [#channel]` | `ttranscriptch` | Administrator | トランスクリプトチャンネルを設定またはクリアします |
| `ticketlogchannel [#channel]` | `tlogch` | Administrator | ログチャンネルを設定またはクリアします |
| `ticketcloseinactive <hours>` | `tcloseinactive` | Administrator | 指定した時間以上活動がないチケットをクローズします |
| `ticketmoveall <category> <category>` | `tmoveall` | Administrator | すべてのチケットをカテゴリ間で移動します |
| `ticketstats` | `tstats` | Nobody | サーバーのチケット統計を表示します |
| `ticketuserstats [@user]` | `tuserstats` | Nobody | メンバーのチケット統計を表示します |

スラッシュコマンドは `/tickets` にあります（パネルの作成、パネルの一覧表示、割り当て、クローズ、メモ、アーカイブ、優先度、パネルと設定のグループ、ケースのグループ）。また `/tickets setup` にもあります（wizard、quick-button、quick-menu、from-template、templates）。

## Tips and gotchas

- 「現在のチケット」を対象にするコマンドは、チケットチャンネル内でのみ動作します。スタッフ用チャンネルではなく、チケット内で実行してください。
- すべてのチケットの種類にはサポートロールが必要です。設定しないと、管理者以外は割り当てができず、チャンネルがロックされた後は開始者以外が発言できなくなります。
- 既定の上限は、メンバーごと・種類ごとに開いているチケット1件です。同じ種類で繰り返しチケットが普通に発生する場合は、**未対応チケットの上限** を引き上げてください。
- **自動クローズ（時間）** と **Required Response Time** は種類に保存され、`buttoninfo` に表示されますが、ボットが放置されたチケットをクローズするのは `ticketcloseinactive` または **非アクティブなチケットをクローズ** の一括操作だけです。自動的に整理したい場合は、これをスケジュールで実行してください。
- `removeoption` は現在、成功したことを報告するだけです。オプションを実際に削除するには、オプションIDを指定して `deleteselectoption` を使ってください。
- **クローズ時に削除** と **クローズ時にロック** は互いに影響します。削除が設定されたチケットは、先にロックされるのではなく、削除遅延の経過を待つだけです。
- パネルの埋め込みJSONは、埋め込みビルダーが出力する有効な形式である必要があります。コマンドを使いたい場合は、ダッシュボードのエディターを使い、JSONをコピーしてください。
- 開いているチケットがあるパネルは、`true` を渡さない限り削除できません。true を渡すと、チケットからパネルへのリンクが解除されます。
- トランスクリプトに保存されるのは最大5000件のメッセージです。"View Transcript" のリンクは、ダッシュボードでトランスクリプトを開きます。
