---
title: ユーザープロフィール
slug: userprofile
summary: すべてのメンバーに、ボットがどこでも表示できるプロフィールカードを用意します。自己紹介、代名詞、星座、誕生日、色、画像、Switchのフレンドコードを設定でき、他の人に見える内容をプライバシー設定で管理できます。
icon: fa-user
category: Community
module: UserProfile
tags: [profile, bio, pronouns, pronoundb, zodiac, birthday, privacy, profile colour, profile image, switch friend code, stats opt out, greet dm opt out, プロフィール, 自己紹介, 代名詞, 星座, 誕生日, プライバシー, プロフィールの色, プロフィール画像, Switchフレンドコード, 統計のオプトアウト, 挨拶DMのオプトアウト]
related: [birthday, switch, afk, help]
---

## 概要

すべてのメンバーには、ボットが参加しているすべてのサーバーで共通のプロフィールがあります。`profile` を実行すると、埋め込みとしてプロフィールが投稿されます。メンバーのアバターがサムネイルになり、自己紹介が説明文になり、代名詞、星座、誕生日、共有しているサーバーの数、設定している場合はNintendo Switchのフレンドコードのフィールドが続きます。最後に、カスタムの色と下部の大きな画像が追加されます。

メンバーは、いくつかの `set...` コマンドで、またはダッシュボードの **マイ設定** ページからプロフィールを入力します。サーバーごとの設定はありません。自己紹介を一度設定すれば、どこでも同じように表示されます。

プライバシーはメンバーが管理します。プロフィールを非公開にすると、所有者だけがそれを開けるようになります。誕生日は月だけに絞ったり、完全に非表示にしたりできます。また、コマンドの統計と挨拶DMからオプトアウトすることもできます。

代名詞には少し特別な仕組みがあります。メンバーがボットで代名詞を設定していない場合、ボットはPronounDBで代名詞を検索します。メンバーは自分のテキストで代名詞を上書きでき、誰でも不適切な上書きをボットの所有者に報告できます。

## 利用する理由

- 専用の自己紹介チャンネルがなくても、手軽な「自己紹介カード」を用意できます。
- Switchのフレンドコードを共有しているコミュニティでは、ピン留めしたメッセージを探す代わりに、1か所にまとめられます。
- PronounDBから代名詞を自動で表示できるため、ほとんどの人が自分で入力する必要がありません。
- スタッフは返信する前に、`pronouns @user` で誰かの代名詞を確認できます。
- 挨拶のDMや統計の収集を望まないメンバーは、自分でオフにできます。

## プロフィールの埋め込み

`profile` を引数なしで実行すると、自分のプロフィールが表示されます。`profile @user` は、他の人のプロフィールを表示します。ただし、その人が非公開に設定している場合は、プロフィールが非公開であるとボットが返信します。

| 埋め込みの項目 | 値の出どころ |
| --- | --- |
| Title | "Profile for" とユーザー |
| Colour | `setprofilecolor`。未設定の場合はボットのデフォルトの色 |
| Thumbnail | メンバーのDiscordアバター |
| Description | `setbio` の自己紹介（設定されている場合のみ表示） |
| Pronouns | あなたの上書き。なければPronounDB。どちらもなければ "Unspecified" |
| Zodiac Sign | `setzodiac`。未設定の場合は "Unspecified" |
| Birthday | `setbirthday`。誕生日のプライバシーモードに従って表示されます。未設定の場合は "Unspecified" |
| Mutual Bot Servers | あなたとボットの両方が参加しているサーバーの数 |
| Switch Friend Code | 設定されている場合のみ表示 |
| Image | `setprofileimage` のURL |

## プロフィールの項目

### 自己紹介

`setbio <text>` は最大2048文字を受け付けます。それより長いテキストは拒否されます。自己紹介を消去するコマンドはありません。消したい場合は、ピリオド1つなど短い自己紹介を設定してください。

### 星座

`setzodiac <sign>` は、西洋占星術の12の星座のいずれか（Aries、Taurus、Gemini、Cancer、Leo、Virgo、Libra、Scorpio、Sagittarius、Capricorn、Aquarius、Pisces）を受け付けます。大文字と小文字は区別されません。それ以外は拒否されます。

### 色と画像

`setprofilecolor <colour>` は、ボットの色の解析機能が理解できる任意の形式（16進数など）の色を受け付けます。`setprofileimage <url>` には、画像ファイルへの直接のリンクが必要です。ボットは、保存する前にURLが画像のように見えるかを確認し、その画像を表示します。

### 誕生日

`setbirthday <date>` は日付を保存します。誕生日モジュールのお知らせも同じ値を使うため、ここで設定するとそちらにも反映されます。プロフィールにどう表示されるかは、`setbirthdayprivacy <mode>` によって決まります。

| モード | プロフィールに表示される内容 |
| --- | --- |
| `Default` | 日付全体 |
| `MonthOnly` | 月の名前だけ |
| `YearOnly` | 年だけ |
| `MonthAndDate` | 月と日。年は表示しない |
| `Disabled` | "Private" |

### Switchのフレンドコード

`setswitchfc <code>` は `SW-XXXX-XXXX-XXXX` の形式に一致する必要があります（各グループは4桁。`SW` は大文字と小文字を区別しません）。コードなしで実行すると、プロフィールからコードが削除されます。Nintendo Switchモジュールとは無関係で、このフィールドは表示用だけです。

### プライバシー

`setprivacy public` または `setprivacy private` です。非公開のプロフィールは、所有者だけが見られます。デフォルトは公開です。

## 代名詞

`pronouns [@user]` は、自分または他の人の代名詞を表示します。検索の順序は次のとおりです。

1. `setpronouns` で設定したテキスト。
2. メンバーがDiscordアカウントをPronounDBにリンクしている場合の、PronounDBに設定された英語の代名詞。標準的なセットは通常の形式で表示されます。例：`he/him`、`Any pronouns`、`Ask me my pronouns`。
3. "Unspecified"。

`setpronouns <text>` は上書きを保存します。テキストなしで実行すると、現在の上書きと、2つのボタンが表示されます。**Overwrite** は新しい代名詞を入力するフォームを開き、**クリア** は上書きを削除して、再びPronounDBを使うようにします。

表示されている代名詞がPronounDBではなく、メンバー自身の上書きの場合、返信には **Report** ボタンが付きます。報告は、ボットの所有者が運営するチャンネルに送られ、所有者は上書きを消去したり、そのユーザーの代名詞を無効にしたり、ブラックリストに追加したりできます。代名詞が無効にされたユーザーは、代名詞のコマンドを使おうとするたびに理由を確認できます。

> [!NOTE]
> ボット所有者のコマンド `pronounsforceclear` は、これらの報告に対処するための手段です。サーバーのスタッフは、他のメンバーの代名詞を消去できません。

## オプトアウト

- `greetdmoptout` は、このボットのDM挨拶を使っているサーバーから、あなたにDMを送れるかどうかを切り替えます。このボットが送る挨拶にのみ影響します。
- `userstatsoptout` は、あなたのアカウントのコマンド統計の収集を切り替えます。メッセージの内容が収集されることはありません。
- `deleteuserstatsdata` は、確認の後に、保存されているあなたのコマンド統計を削除します。1時間に1回実行できます。

## 設定

サーバー側の設定はありません。すべてはメンバーごとに設定されます。ダッシュボードの **マイ設定** ページ（`/me`）には、**編集** ボタンのある **プロフィール** セクションと、トグルのあるプライバシーのセクションがあります。

| 設定 | デフォルト | 制御する内容 |
| --- | --- | --- |
| Bio | 空 | プロフィールの説明 |
| Pronouns | 空（PronounDBを使用） | 代名詞の上書き |
| Zodiac | なし | プロフィールに表示される星座 |
| Birthday | なし | プロフィールに表示され、誕生日のお知らせにも使われる日付 |
| Timezone | UTC | 誕生日モジュールがお知らせに使うタイムゾーン |
| Switch Friend Code | 空 | プロフィールのフレンドコードの欄 |
| Profile Color | ボットのデフォルト | 埋め込みの色 |
| Profile image | なし | 埋め込みの下部の画像 |
| Profile privacy | Public | 他の人があなたのプロフィールを開けるかどうか |
| Birthday display mode | Default | 誕生日のどの部分が表示されるか |
| Block Welcome DMs | オフ | `greetdmoptout` と同じ |
| Block Message Tracking | オフ | `userstatsoptout` と同じ |
| Birthday Announcements | オフ | 誕生日モジュールがあなたの誕生日をお知らせするかどうか |

同じページには、自分のアカウントで代名詞の取得を無効にするトグルもあります。

## セットアップの手順

1. `setbio Hi, I run the art channel.` を実行して、説明を追加します。
2. `setpronouns she/her` を実行します。PronounDBのアカウントがすでにDiscordにリンクされている場合は、この手順を省略できます。
3. `setbirthday 1998-04-12` を実行し、年を表示したくない場合は `setbirthdayprivacy MonthAndDate` を実行します。
4. `setprofilecolor #ff66aa` と `setprofileimage https://example.com/banner.png` を実行して、埋め込みのスタイルを整えます。
5. Switchで見つけてもらいたい場合は、`setswitchfc SW-1234-5678-9012` を追加します。
6. `profile` を実行して結果を確認します。他の人に見られたくない場合は、`setprivacy private` を実行します。

## コマンド

コマンドは、サーバーのプレフィックスで実行します（変更していなければ `.`）。ほとんどのコマンドには、`/profile`、`/setbio`、`/setcolor`、`/setbirthday`、`/setbirthdayprivacy`、`/setswitchfriendcode`、`/setprofileimage`、`/setprivacy`、`/setzodiac`、`/pronouns`、`/setpronouns`、`/statsoptout`、`/deletestatsdata` などの名前でスラッシュ版があります。

| コマンド | エイリアス | 必要な権限 | 目的 |
| --- | --- | --- | --- |
| `profile [@user]` | `userprofile` | Nobody | 自分または他の人のプロフィールを表示します |
| `setbio <text>` | | Nobody | 自己紹介を設定します。最大2048文字です |
| `setpronouns [text]` | `pronounsset` | Nobody | 代名詞の上書きを設定します。または消去と上書きのボタンとともに表示します |
| `pronouns [@user]` | `getpronouns` | Nobody | 代名詞を表示します。上書きの場合は報告ボタンが付きます |
| `setzodiac <sign>` | | Nobody | 星座を設定します |
| `setprofilecolor <colour>` | | Nobody | 埋め込みの色を設定します |
| `setprofileimage <url>` | | Nobody | プロフィールに表示される画像を設定します |
| `setbirthday <date>` | | Nobody | 誕生日を設定します |
| `setbirthdayprivacy <mode>` | | Nobody | `Default`、`MonthOnly`、`YearOnly`、`MonthAndDate`、または `Disabled` |
| `setprivacy <Public|Private>` | `profilepricvacy` | Nobody | プロフィールを公開または非公開にします |
| `setswitchfc [code]` | `setfc`, `setswitchfriendcode`, `setfriendcode` | Nobody | Switchのフレンドコードを設定または削除します |
| `greetdmoptout` | `gdmoptout` | Nobody | このボットからのDM挨拶の受け取りを切り替えます |
| `userstatsoptout` | `ustatsoptout` | Nobody | コマンド統計の収集を切り替えます |
| `deleteuserstatsdata` | `deluserstatsdata` | Nobody | 保存されているコマンド統計を削除します（1時間に1回） |
| `pronounsforceclear <@user or id> <true|false> <reason>` | `pnfc` | Bot owner | メンバーの代名詞を消去し、必要に応じて無効にします |

## ヒントと注意点

- プロフィールはグローバルです。あるサーバーで変更すると、どこでも変更されます。
- `setbirthday` はボットの日付解析機能で日付を読み取るため、`1998-04-12` のような曖昧さのない形式が最も安全です。
- プロフィール画像のURLが機能しなくなった場合、埋め込みは送信されますが、Discordには画像が表示されません。新しいURLを設定すると直ります。
- PronounDBの検索には、メンバーがpronoundb.orgでDiscordアカウントをリンクしている必要があります。リンクされていない場合、`setpronouns` が実行されるまでプロフィールには "Unspecified" と表示されます。
- 非公開のプロフィールでも `profile @user` には応答しますが、プロフィールが非公開であるというエラーが返されます。そのため、プロフィールが存在することは分かります。
- `deleteuserstatsdata` が削除するのはコマンド統計だけです。プロフィールの項目は、上書きして消去します。
