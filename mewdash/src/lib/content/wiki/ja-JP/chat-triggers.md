---
title: トリガー
slug: chat-triggers
summary: メッセージ、リアクション、スラッシュコマンド、ボットのイベントに対する自動応答です。条件、コスト、カウンター、ロール付与、豊富なプレースホルダーを設定できます。
icon: fa-comments
category: Actions
dashboard: /dashboard/chat-triggers
module: ChatTriggers
tags: [chat triggers, triggers, autoresponder, custom commands, auto reply, reaction roles, regex, counters, placeholders, event triggers, チャットトリガー, トリガー, 自動応答, カスタムコマンド, 自動返信, リアクションロール, 正規表現, カウンター, プレースホルダー, イベントトリガー]
related: [administration, xp, currency, tickets, giveaways]
---

## 概要

トリガーは、ボットが監視するテキストと、それを見つけたときに送信する応答のセットです。最も単純な例では、メンバーが `hello` と入力すると、ボットが `hi there` と返信します。トリガーは、メッセージ内の任意の位置や正規表現にマッチさせたり、埋め込みで応答したり、絵文字でリアクションしたり、返信をDMで送ったり、メンバーのメッセージを削除したり、ロールを付与または削除したり、別のチャンネルやWebhookにコピーを投稿したりできます。終了時に別のトリガーを実行することもできます。

トリガーはメッセージでなくても動作します。同じトリガーをスラッシュ、メッセージ、ユーザーのコンテキストコマンドとして登録したり、特定のリアクションが追加または削除されたときに発火させたり、レベルアップ、メンバーの参加、ブーストの開始、チケットの作成、ギブアウェイ当選などのボットイベントで発火させたりできます。

各トリガーには独自の条件を設定できます。ユーザー、チャンネル、またはサーバーごとのクールダウン、必要なXPレベル、通貨によるコストまたは報酬、有効な時間帯と曜日、有効期限、使用回数の上限、アカウントの最低作成日数またはサーバー参加からの最低日数、そして範囲内にある必要があるカウンターです。条件を満たさない場合、トリガーは何もせず沈黙するか、設定しておいたメッセージを表示します。ダッシュボードのテスターでは、サンプルメッセージをブロックしている条件を正確に確認できます。

応答では、ボットの他の機能の値を読み取ることができます。メンバーのレベル、残高、レピュテーション、メッセージ数、トリガーの後に続くテキスト、言及された人、返信先のメッセージ、正規表現のキャプチャグループ、そして応答で読み取りと増減ができるサーバー全体のカウンターです。

## 利用する理由

- よくある質問に自動で答えます。例えば `!rules` でルールの埋め込みを投稿します。
- ボットの組み込みコマンドセットにない、メンバーが無料で使える楽しいコマンドを用意できます。
- クールダウンと報酬を使い、ユーザーごとに1日1回通貨を付与する `daily` のようなトリガーを作れます。
- 単語を入力するとロールを付与し、メッセージを削除する認証用のトリガーを作れます。
- 特定の絵文字でリアクションしたメンバーにロールを付与するリアクションロールを作れます。
- メッセージではなくイベントで発火する、レベルアップ、ウェルカム、ブーストのお知らせを好きな形式で作れます。
- 誰でも単語を入力して増やせる「前回のインシデントからの日数」のようなカウンターを運用できます。

## トリガーの種類

トリガーには有効な種類のセットがあり、その種類によって何がトリガーを発火させるかが決まります。Messageはデフォルトで有効です。それ以外は `chattriggervalidtype` またはダッシュボードのトグルでトリガーごとに有効化します。

| 種類 | 発火するタイミング |
| --- | --- |
| Message | メッセージがトリガーのテキストにマッチしたとき |
| Interaction | トリガーに登録されたスラッシュ、メッセージ、またはユーザーコマンドが実行されたとき |
| Button | トリガーのIDと一致するボタンコンポーネントが押されたとき |
| Reactions | トリガーの絵文字がメッセージに追加されたとき |
| ReactionsRemoved | トリガーの絵文字がメッセージから削除されたとき |
| Event | 以下のボットイベントのいずれかが発生したとき |

### メッセージのマッチ

デフォルトでは、小文字に変換したメッセージ全体がトリガーと完全に一致する必要があります。以下の2つのオプションで条件を緩和できます。

- **メッセージ内のどこでもマッチ**（`ctca`）：トリガーが、メッセージ内のどこかに単語単位で現れる必要があります。
- **誰かを対象にすることを許可**（`ctat`）：メッセージは、トリガーの後にスペースと追加のテキストで始まってもよく、その追加テキストが `%target%` になります。

**正規表現**トリガー（`addchattriggerregex`）は、パターンに対してメッセージをマッチさせます。各パターンには100ミリ秒が与えられ、タイムアウトしたパターンはスキップされます。名前付きまたは番号付きのキャプチャグループは、応答内で `%regex.1%` または `%regex.name%` として使用できます。

**プレフィックス要件**では、マッチの前にメッセージがプレフィックスで始まる必要があるかどうかを決めます。

| オプション | 動作 |
| --- | --- |
| No prefix needed | プレフィックスなしでテキストにマッチします（デフォルト） |
| Global prefix | ボットのグローバルプレフィックスで始まる必要があります |
| Server prefix, or global | サーバーのプレフィックスで始まる必要があります。ない場合はグローバルのプレフィックスを使います |
| Server prefix if one is set | サーバーのプレフィックスで始まる必要があります。サーバーに設定がない場合は決してマッチしません |
| A custom prefix | `ctprefix` で設定したプレフィックスで始まる必要があります |

1つのメッセージに複数のトリガーがマッチした場合は、そのうちの1つがランダムに選ばれます。ボットやWebhookからのメッセージは、**ボットのみ**（`ctallowbots`）がオンのトリガーでない限り無視されます。そのようなトリガーはボットのメッセージにのみ応答します。ボットは自分自身のメッセージには決して応答しません。

### Interactionトリガー

`setctintertype` は、トリガーをSlash、Message、またはUserのアプリケーションコマンドとして登録します。`setctintername` と `setctinterdesc` は、名前と説明を設定します。名前はDiscordのコマンド命名規則に従う必要があります。`ctinterephemeral` は、応答をコマンドを実行した本人にのみ表示されるようにします。`ctintererrors` は、重複した名前や、サブコマンドが多すぎるといった登録に失敗した理由を表示します。

### リアクショントリガー

`addreactiontrigger <emoji> <response>` は、テキストが絵文字であるトリガーを作成します。種類として **リアクションが追加された** または **リアクションが削除された** を有効にしてください。応答は、リアクションされたメッセージのチャンネルに投稿されます。ロールの付与は、リアクションしたメンバーに対して行われます（**メンションされた人** の場合は、リアクションされたメッセージ内の言及された人が対象です）。ボットからのリアクションは無視されます。

### イベントトリガー

`ctevent <id> <event>` は、メッセージではなくイベントで発火するトリガーを作成し、そのトリガーの Event 種類を有効にします。イベントは以下のとおりです。

| イベント | 発火する対象 |
| --- | --- |
| XpLevelUp | メンバーがレベルアップしたとき |
| XpLevelDown | メンバーがレベルダウンしたとき |
| MemberJoin | メンバーが参加したとき |
| MemberLeave | メンバーが退出したとき |
| VoiceJoin | メンバーがボイスチャンネルに参加したとき |
| VoiceLeave | メンバーがボイスチャンネルから退出したとき |
| Boost | メンバーがブーストを開始したとき |
| BoostEnd | メンバーがブーストを停止したとき |
| TicketOpened | チケットが開かれたとき |
| TicketClosed | チケットが閉じられたとき |
| GiveawayWon | メンバーがギブアウェイに当選したとき |

応答は `cteventchannel` で設定したチャンネルに送られます。設定がない場合は、イベントが発生したチャンネルに送られます。参加、退出、ボイス、ブーストのイベントには専用のチャンネルがないため、それらのトリガーには明示的なチャンネルが必要です。指定しないと何も起こりません。イベントトリガーはメッセージトリガーと同じ条件と経済のチェックを通り、イベントの対象となるメンバーがプレースホルダーとロール付与の対象ユーザーとして扱われます。

## 応答

主な応答は、トリガーの作成時に入力したテキストです。埋め込みパーサーを通るため、プレーンテキスト、埋め込み、複数の埋め込み、またはダッシュボードの埋め込みエディターで作成したコンポーネントを使えます。追加の応答は `ctaddresponse` で加えられ、**Response mode** でどの応答を送信するかを決めます。

| モード | 動作 |
| --- | --- |
| Single | 常に最初の応答を送ります（デフォルト） |
| Random | ランダムに1つ選びます。行を繰り返すと重み付けできます |
| RoundRobin | 使用ごとに順番に1つずつ送ります。サーバー内で共有されます |
| All | すべての応答を順番に送ります |

配信オプションはすべてデフォルトでオフです。

- **メッセージに返信**（`ctreply`）：応答をDiscordの返信として送信します。
- **応答をDMで送信**（`ctdm`）：メンバーに個別に送信します。
- **トリガーとなったメッセージを削除**（`ctad`）：入力されたメッセージを削除します。
- **代わりにメッセージにリアクション**（`rtt`）：返信ではなく、メンバーのメッセージにトリガーの絵文字を付けます。削除と組み合わせることはできません。
- **メッセージを一切送信しない**（`ctnr`）：ロールだけを付与するトリガーに便利です。
- **応答を後で削除**（`ctdeleteafter`）：ボットの返信を削除するまでの秒数です。0の場合は残ります。
- **リアクションする絵文字**（`ctreact`）：最大6個の絵文字を1秒に1つずつ追加します。絵文字を指定しないとリストがクリアされます。

### クロスポスト

`ctcpch` は、応答のコピーをサーバー内の別のチャンネルに投稿します。`ctcpwh` は、代わりにWebhookのURLを通して投稿します。このWebhookは別のサーバーにあってもかまいません。クロスポストは、**メッセージを送信しない** がオンのときでも行われます。

### ロール

**Roles to grant** と **削除するロール**（`ctrgranttoggle`、`ctrremovetoggle`）は、トリガーが発火したときに適用されます。同じロールに対してトグルを再度実行すると、リストから削除されます。**これらのロールを適用する対象**（`chattriggerrolegranttype`）は対象を選びます。

| 対象 | 影響を受ける人 |
| --- | --- |
| Sender | トリガーを発火させたメンバー（デフォルト） |
| Mentioned | メッセージ内で言及された最大5人のメンバー |
| Both | 送信者と、言及された最大4人のメンバー |

対象に言及が含まれる場合、マッチの前にメッセージから言及が取り除かれるため、`verify @someone` は `verify` のトリガーにマッチします。

### チェーン

`ctchain <id> <nextId>` は、最初のトリガーが終了した後に2つ目のトリガーを実行します。2つ目のトリガーは、その条件とコストを含め、独立して評価されます。チェーンは5ステップで停止し、すでに実行したトリガーには再度戻りません。

## 条件

これらはすべて、何かが課金、送信、またはカウントされる前にチェックされます。条件に失敗すると、トリガーは何もせず沈黙します。ただし、レベルと通貨のチェックは例外で、`ctreqmsg` で **利用できない場合のメッセージ** を設定していれば、そのメッセージが表示されます。

| 条件 | コマンド | デフォルト | 動作 |
| --- | --- | --- | --- |
| クールダウン | `ctcooldown <id> <seconds> [scope]` | なし | 指定した秒数の間、繰り返しの発火をブロックします。スコープは `User`、`Channel`、または `Guild` です |
| 必要レベル | `ctreqlevel <id> <level>` | 0 | メンバーのXPレベルがこの値以上である必要があります |
| コスト | `ctcost <id> <amount>` | 0 | メンバーから通貨を引き落とします。支払えない場合は発火しません |
| 報酬 | `ctreward <id> <amount>` | 0 | 発火時にメンバーへ通貨を支払います |
| XP報酬 | `ctxpreward <id> <amount>` | 0 | 発火時に付与されるXPです |
| 有効時間 | `cttime <id> <HH:mm> <HH:mm> [days...]` | 常に有効 | サーバーのタイムゾーンで、指定した時間帯の中でのみ発火します。終了時刻が開始時刻より前の場合は夜間をまたぎます。曜日は名前か、0（日曜日）から6の数字で指定します |
| 有効期限 | `ctexpiry <id> [duration]` | 無期限 | 現在から指定した期間（例：`7d`）が経過すると発火しなくなります |
| 使用回数の上限 | `ctmaxuses <id> <uses>` | 無制限 | 指定した回数発火すると停止します。0で上限を解除します |
| アカウントの最低年齢 | `ctminage <id> [duration]` | なし | アカウントがこの期間以上前に作成されている必要があります |
| サーバー参加からの最低期間 | `ctminmember <id> [duration]` | なし | メンバーがこの期間以上前にサーバーに参加している必要があります |
| カウンターの範囲 | `ctrequirecounter <id> <name> [min] [max]` | なし | 指定したカウンターが範囲内である必要があります。名前に `clear` を指定すると削除されます |

クールダウンは、他のすべての条件を満たした後にのみ開始されます。そのため、ブロックされた試行はクールダウンを消費しません。コストは報酬より先に引き落とされるため、コストと報酬の両方を持つトリガーが、支払えない人に報酬を与えることはありません。サーバー全体のコマンドクールダウンを `cmdcd` で設定した場合は、トリガーの個別クールダウンに加えて、ユーザーごとにトリガーにも適用されます。

## カウンター

カウンターは、サーバーごとに保存される名前付きの数値です。応答で最初に使われたときに作成され、どの応答からでも読み取りと変更ができます。

| プレースホルダー | 効果 |
| --- | --- |
| `%counter:name%` | カウンターの値を表示します |
| `%counter:name+%` | 1を加算し、新しい値を表示します |
| `%counter:name-%` | 1を減算し、新しい値を表示します |
| `%usercounter:name%` | 発火したメンバー自身のその名前の値を表示します |
| `%usercounter:name+%` | メンバーの値に1を加算します |
| `%usercounter:name-%` | メンバーの値から1を減算します |

名前は最大64文字で、英字、数字、アンダースコア、ハイフンを使え、大文字と小文字を区別しません。`ctcounters` でカウンターを一覧表示し、`ctcounterset` で正確な値を設定し、`ctcounterdelete` で削除します。削除すると、その名前の下にあるすべてのユーザーごとの値も削除されます。ダッシュボードのサイドバーにも同じ機能の **カウンター** パネルがあります。

## プレースホルダー

応答では、一般的なプレースホルダーのセット（プレースホルダーのページにあるユーザー、サーバー、チャンネル、ボット、時間のプレースホルダー）、トリガー用のプレースホルダー、そして他のモジュールが提供するプレースホルダーを使えます。`ctplaceholders` は、提供されているプレースホルダーをリアルタイムで一覧表示します。

| プレースホルダー | 値 |
| --- | --- |
| `%target%` | トリガーの後に入力されたすべてのテキストです（**特定のユーザーを対象にできるようにする** または「どこでもマッチ」が必要です） |
| `%targetuser%` | メッセージ内で最初に言及された人へのメンションです |
| `%targetuser.id%`、`%targetuser.name%`、`%targetuser.avatar%` | その人のID、ユーザー名、アバターです |
| `%targetusers%`、`%targetusers.id%` | 言及されたすべての人を、メンションまたはIDで表します |
| `%replied.content%` | メンバーが返信したメッセージの内容です |
| `%replied.author%`、`%replied.author.id%` | そのメッセージの作成者です |
| `%usecount%` | このトリガーが発火した回数です |
| `%regex.1%`、`%regex.name%` | 正規表現トリガーのキャプチャグループです |
| `%img:tag%` | そのタグのランダムなImgur画像です |
| `%rng%` | 一般的なプレースホルダーのセットからのランダムな数値です |
| `%xp.level%`、`%xp.rank%`、`%xp.total%`、`%xp.current%`、`%xp.required%`、`%xp.remaining%`、`%xp.bonus%` | メンバーのXP統計です |
| `%targetuser.xp.level%`、`%targetuser.xp.rank%`、`%targetuser.xp.total%` | 言及された人のXP統計です |
| `%currency.balance%`、`%currency.bank%`、`%currency.total%`、`%currency.emote%` | メンバーの通貨です |
| `%targetuser.currency.balance%`、`%targetuser.currency.bank%` | 言及された人の通貨です |
| `%rep%`、`%rep.rank%`、`%targetuser.rep%`、`%targetuser.rep.rank%` | レピュテーションです |
| `%messages%`、`%messages.channel%`、`%messages.server%`、`%targetuser.messages%` | メッセージ数です |
| `%invites%`、`%targetuser.invites%`、`%inviter%` | 招待数と、メンバーを招待した人です |
| `%targetuser.afk%` | 言及された人の離席メッセージです |
| `%counter:name%` など | 上記のとおりのカウンターです |

`%target%` 内のメンションは、メンバー自身が全員にメンションできる権限を持っていない限り無効化されます。

> [!EXAMPLE]
> トリガー `daily`、応答 `%user.mention% claimed today's bonus. Balance: %currency.balance%`、そして `ctreward 12 100`、`ctcooldown 12 86400 User`、`ctreqmsg 12 Come back tomorrow.` を設定します。

## テスター

`cttest <id> <sample message>` または、トリガーのカード上にある **このトリガーをテスト** ボックスで、そのメッセージが自分としてトリガーを発火させるかどうかを確認できます。このテストでは、送信、課金、カウントは行われません。テキストがマッチしたかどうかを報告し、トリガーが発火しない場合は、どの条件がそれを止めているかを示します。無効、ボットのみ、マッチなし、権限の設定、権限のオーバーライド、有効期限、クールダウン、カウンター、使用回数の上限、有効時間、アカウントの年齢、サーバー参加、レベル、残高、またはサーバーのコマンドクールダウンのいずれかです。

## カテゴリーと整理

`ctcategory <id> <name>` は、トリガーをカテゴリーに分類します。`ctcategorytoggle <name> <true or false>` は、そのカテゴリーにあるすべてのトリガーを一度に有効化または無効化します。ダッシュボードのサイドバーはカテゴリーで絞り込めます。`cttoggle` は、トリガーを削除せずに1つだけ一時停止します。`ctstats` は、トリガーの発火回数と、最近発火させたユーザーを表示します。

`ctsexport` は、すべてのトリガーをYAMLファイルとしてダウンロードします。`ctsimport` は、添付ファイルまたはURLからトリガーを読み込みます。`ctsclear` は、確認後にすべてのトリガーを削除します。

## 設定

すべての設定はトリガーごとに行います。トリガーのページには **シンプルモード** があり、**クイックセットアップ** フォーム（トリガーのテキストと応答）を使えます。また **詳細モード** には **高度なトリガーの作成** があり、**パターンの種類**（Normal Text Pattern または Regular Expression Pattern）、トリガーの種類を選べます。保存前に正規表現をテストすることもできます。

各トリガーのカードを展開すると、**トリガーのテキスト**、**レスポンスメッセージ** エディター、テスター、そして項目をトピック別にまとめた設定のアコーディオンが表示されます。

| グループ | 設定 |
| --- | --- |
| マッチ条件 | Prefix requirement、Custom prefix、Match anywhere in the message、Allow targeting someone、Bot owner only |
| 応答方法 | Reply to the message、Send the response as a DM、Delete the triggering message、React to the message instead、Send no message at all、Emoji to react with、Delete the response after、Extra responses、When there are several responses |
| ロール | Roles to grant、Roles to remove、Apply those roles to |
| 制限 | Cooldown (seconds)、Cooldown applies to、Stop after this many uses、Stop firing after、Minimum account age (minutes)、Minimum time in server (minutes)、Only active at certain hours（From、Until、On these days） |
| コストと報酬 | Costs the user、Pays the user、Grants XP、Requires level、Message when they cannot use it |
| カウンターの条件 | Counter name、At least、At most |
| イベントで発火 | Fire when、Respond in |
| 整理 | Category、Then run trigger、Respond to bots instead of people |

サイドバーには、カテゴリー、**カウンター**、リアルタイムの **プレースホルダー** 一覧があり、トリガーと応答を検索できる検索ボックスもあります。

## セットアップの手順

1. ダッシュボードで **トリガー** を開きます。**シンプルモード** で、トリガーの単語を入力し、エディターで応答を作成してから作成します。
2. 新しいカードを展開します。**一致の条件** の下で、単語が文中でも機能するようにする場合は **メッセージ内のどこにあっても一致させる** をオンにします。
3. **反応の仕方** の下で、返信するか、DMを送るか、メンバーのメッセージを削除するかを選びます。
4. **制限** の下で、連続して発火しないようにクールダウンを設定します。
5. **このトリガーをテスト** にサンプルメッセージを入力し、**テスト** を押します。妨げになっている条件を修正します。
6. レベルアップのお知らせを作る場合は、任意のテキストでトリガーを作成し、**発動するタイミング** を「Member levels up」に設定し、**反応するチャンネル** は空のままにします。そうすると、メンバーが発言していたチャンネルに投稿されます。応答では `%user.mention%` と `%xp.level%` を使います。
7. 関連するトリガーには **カテゴリー** を設定すると、まとめて一時停止できます。

## コマンド

コマンドは、サーバーのプレフィックスで実行します（変更していなければ `.`）。トリガーのIDは `listchattriggers` で確認できます。

| コマンド | エイリアス | 必要な権限 | 目的 |
| --- | --- | --- | --- |
| `addchattrigger <trigger> <response>` | `act`, `acr` | Administrator | トリガーを作成します。複数語のトリガーは引用符で囲みます |
| `addchattriggerregex <pattern> <response>` | `actr` | Administrator | 正規表現トリガーを作成します |
| `addreactiontrigger <emoji> <response>` | `addrt` | Administrator | リアクショントリガーを作成します |
| `editchattrigger <id> <response>` | `ect` | Administrator | 主な応答を置き換えます |
| `deletechattrigger <id>` | `dct` | Administrator | トリガーを削除します |
| `listchattriggers` | `lct` | Administrator | IDとともにトリガーを一覧表示します |
| `listchattriggersgroup` | `lctg` | Administrator | テキストごとにグループ化してトリガーを一覧表示します |
| `showchattrigger <id>` | `sct` | Administrator | 1つのトリガーの設定を表示します |
| `cttoggle <id>` | `chattriggertoggle` | Administrator | トリガーを一時停止または再開します |
| `ctca <id>` | | Administrator | メッセージ内のどこでもマッチのオンとオフを切り替えます |
| `ctat <id>` | | Administrator | 対象指定の許可のオンとオフを切り替えます |
| `ctdm <id>` | | Administrator | DM応答のオンとオフを切り替えます |
| `ctad <id>` | | Administrator | トリガーとなったメッセージの削除のオンとオフを切り替えます |
| `rtt <id>` | `reactottrigger` | Administrator | 返信ではなくメッセージにリアクションする設定のオンとオフを切り替えます |
| `ctnr <id>` | `chattriggernoresponse` | Administrator | メッセージを送信しない設定のオンとオフを切り替えます |
| `ctreply <id>` | `chattriggerreply` | Administrator | メッセージへの返信のオンとオフを切り替えます |
| `ctdeleteafter <id> <seconds>` | `chattriggerdeleteafter` | Administrator | 指定した遅延の後に応答を削除します |
| `ctreact <id> [emoji...]` | `ctr` | Administrator | 最大6個のリアクションを設定するか、クリアします |
| `ctaddresponse <id> <response>` | `chattriggeraddresponse` | Administrator | 追加の応答を加えます |
| `ctclearresponses <id>` | `chattriggerclearresponses` | Administrator | 追加の応答を削除します |
| `ctresponsemode <id> <mode>` | `chattriggerresponsemode` | Administrator | `Single`、`Random`、`RoundRobin`、または `All` |
| `ctprefixtype <id> <type>` | `chattriggersprefixtype` | Administrator | `None`、`Global`、`GuildOrGlobal`、`GuildOrNone`、または `Custom` |
| `ctprefix <id> <prefix>` | `chattriggersprefix` | Administrator | カスタムプレフィックスを設定します |
| `chattriggervalidtype <id> <type> <true or false>` | `ctvalidtype`, `ctvt` | Administrator | トリガーの種類を有効化または無効化します |
| `ctallowbots <id>` | `chattriggerallowbots` | Administrator | ボットのメッセージにのみ応答するかどうかを切り替えます |
| `ctrgranttoggle <id> @role` | `ctgt`, `ctgranttoggle` | Administrator | 付与するロールを切り替えます |
| `ctrremovetoggle <id> @role` | `ctrt`, `ctremovetoggle` | Administrator | 削除するロールを切り替えます |
| `chattriggerrolegranttype <id> <type>` | `ctrolegranttype`, `ctrgt` | Administrator | `Sender`、`Mentioned`、または `Both` |
| `chattriggerscrosspostchannel <id> <#channel>` | `ctcpch`, `ctcpchannel`, `ctcrosspostchannel`, `ctcrosspostch` | Administrator | チャンネルへクロスポストします |
| `chattriggerscrosspostwebhook <id> <url>` | `ctcpwh`, `ctcpwebhook`, `ctcrosspostwebhook`, `ctcrosspostwh` | Administrator | Webhookを通してクロスポストします |
| `setctintertype <id> <type>` | `ctitype`, `ctintertype` | Administrator | `None`、`Slash`、`Message`、または `User` |
| `setctintername <id> <name>` | `ctiname`, `ctrealname` | Administrator | アプリケーションコマンドの名前です |
| `setctinterdesc <id> <description>` | `ctidesc`, `ctinterdesc` | Administrator | アプリケーションコマンドの説明です |
| `ctinterephemeral <id> <true or false>` | `ctieph` | Administrator | インタラクションの返信を本人だけに表示するかを設定します |
| `ctintererrors` | `ctierrors`, `ctie` | Administrator | コマンドの登録エラーを表示します |
| `ctevent <id> <event>` | `chattriggerevent` | Administrator | イベントで発火させます。停止するには `None` を指定します |
| `cteventchannel <id> [#channel]` | `chattriggereventchannel` | Administrator | イベントの応答先チャンネルです |
| `ctcooldown <id> <seconds> [scope]` | `chattriggercooldown` | Administrator | トリガーごとのクールダウンです |
| `ctreqlevel <id> <level>` | `chattriggerrequiredlevel` | Administrator | 必要なXPレベルです |
| `ctcost <id> <amount>` | `chattriggercost` | Administrator | 通貨のコストです |
| `ctreward <id> <amount>` | `chattriggerreward` | Administrator | 通貨の報酬です |
| `ctxpreward <id> <amount>` | `chattriggerxpreward` | Administrator | XP報酬です |
| `ctreqmsg <id> [message]` | `chattriggerrequirementmessage` | Administrator | 要件を満たさないときのメッセージです |
| `cttime <id> <start> <end> [days...]` | `chattriggertime` | Administrator | 有効時間です。`cttime <id> clear` で解除します |
| `ctexpiry <id> [duration]` | `chattriggerexpiry` | Administrator | 有効期限です。なしにするには何も指定しません |
| `ctmaxuses <id> <uses>` | `chattriggermaxuses` | Administrator | 使用回数の上限です。0で無制限です |
| `ctminage <id> [duration]` | `chattriggerminimumage` | Administrator | アカウントの最低年齢です |
| `ctminmember <id> [duration]` | `chattriggerminimummembership` | Administrator | サーバー参加からの最低期間です |
| `ctrequirecounter <id> <name> [min] [max]` | `chattriggerrequirecounter` | Administrator | カウンターの範囲の要件です |
| `ctcounters` | `chattriggercounters` | Nobody | カウンターを一覧表示します |
| `ctcounterset <name> <value>` | `chattriggercounterset` | Administrator | カウンターを設定します |
| `ctcounterdelete <name>` | `chattriggercounterdelete` | Administrator | カウンターを削除します |
| `ctplaceholders` | `chattriggerplaceholders` | Nobody | 提供されているプレースホルダーを一覧表示します |
| `ctcategory <id> [name]` | `chattriggercategory` | Administrator | カテゴリーを設定またはクリアします |
| `ctcategorytoggle <name> <true or false>` | `chattriggercategorytoggle` | Administrator | カテゴリーを有効化または無効化します |
| `ctchain <id> <nextId>` | `chattriggerchain` | Administrator | 別のトリガーにチェーンします。0でクリアします |
| `cttest <id> <sample>` | `chattriggertest` | Administrator | サンプルメッセージをドライランします |
| `ctstats <id>` | `chattriggerstats` | Administrator | 発火回数と最近のユーザーを表示します |
| `ctsexport` | | Administrator | トリガーをYAMLとしてエクスポートします |
| `ctsimport [url]` | | Administrator | URLまたは添付ファイルからインポートします |
| `ctsmigrate` | `ctsconvert` | Administrator | 古い埋め込み形式を変換します。バックアップを作成します |
| `ctsclear` | | Administrator | すべてのトリガーを削除します |
| `ctsreload` | | Bot owner | データベースからトリガーを再読み込みします |

## ヒントと注意点

- トリガーは小文字に変換されたメッセージと照合されるため、トリガーのテキストは実質的に大文字と小文字を区別しません。
- **Match anywhere** がオフのトリガーは、メッセージ全体と一致する必要があります。オンにするか対象指定を有効にしない限り、`hello there` は `hello` のトリガーを発火させません。
- ロールの付与には Manage Roles が必要で、ボットのロールは関係するロールより上にある必要があります。ロールをリストに追加するコマンドは、そのロールを管理できるかどうかも確認します。
- ボットのみのトリガーは人間に応答せず、人間のトリガーはボットに応答しません。1つのトリガーで両方を行うことはできません。
- クールダウンはメモリ上にあり、ボットを再起動するとリセットされます。使用回数の上限と有効期限は保存されるため、再起動後も維持されます。
- ラウンドロビンの順序は、メンバーごとではなくサーバー内の全員で共有されます。
- モジュール `ActualChatTriggers` に対する権限システムのエントリーと、トリガーのテキストに対する `permoverride` は、トリガー自身の条件より前に確認されます。
- インタラクショントリガーは実際のアプリケーションコマンドを登録するため、Discordのコマンド数と名前の制限が適用されます。表示されない場合は `ctintererrors` を確認してください。
- 応答のリアクションは1秒に1つずつ付けられるため、6個の絵文字が表示されるまでに6秒かかります。
- 参加、退出、ボイス、ブーストのイベントトリガーは、**反応するチャンネル** を設定するまで何もしません。
