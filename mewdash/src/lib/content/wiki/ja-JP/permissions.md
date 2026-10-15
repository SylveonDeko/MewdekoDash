---
title: コマンドの権限
slug: permissions
summary: サーバー全体、ロール、チャンネル、カテゴリ、個々のメンバーを対象に、コマンドとモジュールの許可・拒否ルールを順番に並べて、誰がどこでどのコマンドを実行できるかを決めます。
icon: fa-cog
category: Security
dashboard: /dashboard/administration
module: Permissions
tags: [permissions, command permissions, allow, deny, permission role, verbose, disable command, disable module, cooldown, dpo, permission override, blacklist, 権限, コマンドの権限, 許可, 拒否, 権限ロール, 詳細表示, コマンドの無効化, モジュールの無効化, クールダウン, 権限の上書き, ブラックリスト]
related: [administration, help, filter, moderation]
---

## 概要

初期設定では、すべてのコマンドは Discord の権限が許す全員が使えます。コマンドの権限は、その上にサーバー固有のルールの一覧を追加します。各ルールは、コマンド、モジュール、またはすべてのモジュールを、サーバー全体、ロール、チャンネル、カテゴリ、または1人のメンバーに対して許可するか拒否するかを決めます。誰かがコマンドを実行すると、Botはこの一覧を上から確認し、最初に一致したルールを適用して、コマンドを通すか止めるかを決めます。

ブロックされたコマンドは、**詳細表示** がオフの場合は何も表示されません。オンの場合は、ブロックしたルールの番号と内容をBotが返信します。スラッシュコマンドでは、常に本人にだけ見えるメッセージで理由が表示されます。

ルールは、管理者か、あなたが選んだ **権限ロール** を持つ人が管理できます。同じ一覧は、ダッシュボードの **管理** にある **自動化と設定** セクションの **コマンドの権限** カードにもあります。

関連する機能が2つあります。コマンドのクールダウンは、サーバー内でメンバーがコマンドを使える頻度を制限します。管理機能モジュールの Discord 権限の上書きは、コマンドが通常要求するDiscordの権限を置き換えます。たとえば、通常は管理者が必要なコマンドを、メッセージの管理の権限を持つ人も使えるようにできます。

## 使う理由

- 遊び系のコマンドやNSFWのコマンドを、真面目なチャンネルで使えないようにする。
- 音楽モジュールを、Botコマンド用のチャンネル以外では無効にする。
- ヘルパーのロールに、メッセージの管理や管理者の権限を与えずに `warn` を使わせる。
- 迷惑なメンバーがBotを使えないようにする。
- `roll` のように頻繁に使われるコマンドを、メンバーごとに10秒に1回までに制限する。

## ルールの書き方

各ルールには3つの要素があります。

| 要素 | 選択肢 |
| --- | --- |
| 対象 | 1つのコマンド、1つのモジュール、またはすべてのモジュール |
| 範囲 | サーバー全体、ロール、チャンネル、カテゴリ、または特定のユーザー |
| 動作 | 許可または拒否 |

以下の表のコマンド名は、最初の2つの要素を表しています。先頭の文字で範囲を、末尾で対象を指定します。先頭は `s`(サーバー)、`r`(ロール)、`c`(チャンネル)、`ca`(カテゴリ)、`u`(ユーザー)です。末尾は `cmd`(コマンド)か `mdl`(モジュール)です。`all...mdls` の形式は、すべてのモジュールを対象にします。

| コマンド | 作成されるルール |
| --- | --- |
| `srvrcmd <command> <enable|disable>` | サーバー全体でのコマンド |
| `srvrmdl <module> <enable|disable>` | サーバー全体でのモジュール |
| `allsrvrmdls <enable|disable>` | サーバー全体でのすべてのモジュール |
| `rolecmd <command> <enable|disable> <role>` | ロールごとのコマンド |
| `rolemdl <module> <enable|disable> <role>` | ロールごとのモジュール |
| `allrolemdls <enable|disable> <role>` | ロールごとのすべてのモジュール |
| `chnlcmd <command> <enable|disable> <#channel>` | チャンネルでのコマンド |
| `chnlmdl <module> <enable|disable> <#channel>` | チャンネルでのモジュール |
| `allchnlmdls <enable|disable> <#channel>` | チャンネルでのすべてのモジュール |
| `catcmd <command> <enable|disable> <category>` | カテゴリ内のすべてのチャンネルでのコマンド |
| `catmdl <module> <enable|disable> <category>` | カテゴリでのモジュール |
| `allcatmdls <enable|disable> <category>` | カテゴリでのすべてのモジュール |
| `usrcmd <command> <enable|disable> @user` | 1人のメンバーに対するコマンド |
| `usrmdl <module> <enable|disable> @user` | 1人のメンバーに対するモジュール |
| `allusrmdls <enable|disable> @user` | 1人のメンバーに対するすべてのモジュール |

チャットトリガーもコマンドとして扱われます。コマンド名が必要な場所には、トリガーの番号またはテキストを指定してください。

> [!EXAMPLE]
> `srvrmdl nsfw disable` の後に `chnlmdl nsfw enable #adult` を実行すると、NSFWモジュールは1つのチャンネルを除いてすべてでブロックされます。

## ルールの順序

`listperms` は、1から番号を振った一覧を表示します。ルール1は常に「サーバー全体ですべてのモジュールを許可」で、編集も削除もできません。ほかのルールに一致しなかった場合の既定の動作になります。

新しいルールは一覧の末尾に追加されます。コマンドが実行されると、Botは番号の大きいルールから1に向かって確認し、対象と範囲の両方が一致した最初のルールで決まります。つまり、最後に追加された一致するルールが優先されます。上の例が機能するのは、チャンネルの許可がサーバーの拒否の後に追加されているからです。

`moveperm <from> <to>` はルールの位置を変えて、番号を振り直します。そのため、例外を広いルールの上または下に移動するために作り直す必要がありません。`removeperm <number>` は1つのルールを削除します。`resetperms` は一覧をルール1だけに戻し、管理者の権限が必要です。

ダッシュボードでも同じルールが一覧表示されます。各ルールには、上へ移動、下へ移動の矢印と、削除ボタンがあります。

## 詳細表示

`verbose` は、ブロックされたテキストコマンドに、ブロックしたルールを示すエラーメッセージを表示するかどうかを切り替えます。「権限 4 (`.chnlmdl nsfw disable #general`) がこれを妨げています」のような内容です。初期設定ではオフです。オフの場合、ブロックされたコマンドは何も表示せずに無視されます。これはほとんどのサーバーで適切で、メンバーが実行できないコマンドを試すのを防げます。スラッシュコマンドは、この設定に関わらず、理由を本人にだけ見える形で常に返信します。

## ルールを変更できる人

このモジュールのすべてのコマンドには、追加の制限があります。管理者は常に使えます。それ以外の人は、`permrole <role>` で設定された **権限ロール** が必要です。権限ロールが設定されていない場合、管理者以外の人には(詳細表示がオンのときだけ)管理者の権限が必要だと伝えられ、コマンドは止まります。`permrole` を引数なしで実行すると現在のロールを表示し、`permrole reset` で解除します。`@everyone` ロールは使えません。

`resetperms` と `permrole` 自体は、これに加えて常に管理者の権限が必要です。

## クールダウン

`cmdcooldown <command> [time]` は、このサーバーでコマンドごとに、メンバー単位のクールダウンを設定します。1秒から90000秒(25時間)まで指定できます。時間を省略するか `0s` を指定すると解除されます。`allcmdcooldowns` は現在のクールダウンを一覧表示します。これらは、コマンドにすでに組み込まれているクールダウンに加えて適用されます。

## Discord権限の上書き

管理機能モジュールでは、コマンドが必要とするDiscordの権限を置き換えられます。`dpo <command> <permissions...>` を使うと、組み込みの権限の代わりに、指定した権限をコマンドが要求するようになります。例: `dpo purge ManageMessages`。権限を指定せずに `dpo <command>` を実行すると上書きを削除し、`dpol` で一覧を表示し、`dpor` で確認後にすべてを消去します。3つとも管理者の権限が必要です。

上書きが置き換えるのは、Discordの組み込みの権限の要件だけです。上記のコマンドの権限ルールは引き続き適用されます。`help <command>` のコマンドページには、元の要件に取り消し線が引かれ、その横に上書きが表示されます。

## helpの簡易メニュー

`help <command>` は、管理者に権限ボタンを表示します。このボタンを押すと、そのコマンドだけの簡易メニューが開きます。メニューには、そのコマンドに影響するルールが表示され、重複しているルール(対象と範囲が同じ2つのルール)について警告し、それらの解決を提案します。また、ヘルプページを離れずに、コマンドの許可ルールや拒否ルールを追加したり、権限をリセットしたりできます。

## Botオーナーの管理

3つのグループのコマンドはBotのオーナーに限定されており、すべてのサーバーに影響します。グローバル権限(`globalmodule`、`globalcommand`、`globalpermlist`、`resetglobalperms`)は、モジュールやコマンドをどこでも無効にします。ブラックリスト(`userblacklist`、`channelblacklist`、`serverblacklist`、`manualblacklistcheck`)は、ユーザー、チャンネル、またはサーバーに対してBotが一切応答しないようにします。グローバルに無効化されたモジュールは、ヘルプメニューで地球儀と×印で表示されます。

## 設定

ダッシュボードでは、**管理** を開き、**自動化と設定** セクションから **コマンドの権限** カードを開きます。

| 設定 | 初期値 | 内容 |
| --- | --- | --- |
| Verbose permissions | オフ | ルールによってコマンドがブロックされたときにユーザーへ通知 |
| Permission role | なし | このロールを持つメンバーは、コマンドでルールを編集できる |
| Rules | ルール1のみ | 順序付きの一覧。**アクション**、**対象**、**対象** を選択し、続けてモジュール、コマンド、ロール、チャンネル、カテゴリ、またはユーザーIDを指定して追加 |

カードには、カスタムルールの数と、詳細表示がオンかどうかも表示されます。同じセクションの **権限の上書き** カードでは、Discordの権限の上書きを管理します。Botのコマンドを選び、組み込みの権限の代わりに必要とする **必要なDiscordの権限** を指定します。

## セットアップの手順

1. 全体の形を決めます。通常は「すべて許可し、一部を拒否する」か、「すべて拒否し、Botのチャンネルだけで許可する」のどちらかです。
2. 2つ目の形にする場合は、`allsrvrmdls disable` を実行してから、`allchnlmdls enable #bot-commands` を実行します。
3. スタッフがモデレーションを使い続けられるようにします。`rolemdl moderation enable @Mods` と `rolemdl administration enable @Mods` を実行します。
4. `listperms` を実行し、Botが使う順番どおりに下から読みます。例外が、上書きしたいルールより下にある場合は `moveperm` を使います。
5. 信頼できるスタッフには `permrole @Mods` を与え、管理者の権限がなくてもルールを調整できるようにします。
6. テスト中は `verbose` をオンにして、どのルールが発動しているかを確認します。終わったら、もう一度オフにします。

## コマンド

これらのコマンドは、サーバーのプレフィックス(変更していなければ `.`)を付けて実行します。スラッシュコマンド版は `/permissions` の下にあり、たとえば `/permissions servercommand` のように使います。

| コマンド | エイリアス | 必要な権限 | 目的 |
| --- | --- | --- | --- |
| `listperms` | `lp` | 管理者または権限ロール | 番号付きのルール一覧を表示 |
| `verbose [true|false]` | `v` | 管理者または権限ロール | ブロックされたコマンドのメッセージを切り替え |
| `permrole [role|reset]` | `pr` | 管理者 | 権限ロールを表示、設定、またはリセット |
| `removeperm <number>` | `rp` | 管理者または権限ロール | ルールを削除 |
| `moveperm <from> <to>` | `mp` | 管理者または権限ロール | ルールの順序を変更 |
| `resetperms` | | 管理者 | すべてのルールを削除 |
| `srvrcmd <command> <enable|disable>` | `sc` | 管理者または権限ロール | サーバー全体のコマンドのルール |
| `srvrmdl <module> <enable|disable>` | `sm` | 管理者または権限ロール | サーバー全体のモジュールのルール |
| `allsrvrmdls <enable|disable>` | `asm` | 管理者または権限ロール | サーバー全体のすべてのモジュール |
| `rolecmd <command> <enable|disable> <role>` | `rc` | 管理者または権限ロール | ロールごとのコマンドのルール |
| `rolemdl <module> <enable|disable> <role>` | `rm` | 管理者または権限ロール | ロールごとのモジュールのルール |
| `allrolemdls <enable|disable> <role>` | `arm` | 管理者または権限ロール | ロールごとのすべてのモジュール |
| `chnlcmd <command> <enable|disable> <#channel>` | `cc` | 管理者または権限ロール | チャンネルでのコマンドのルール |
| `chnlmdl <module> <enable|disable> <#channel>` | `cm` | 管理者または権限ロール | チャンネルでのモジュールのルール |
| `allchnlmdls <enable|disable> <#channel>` | `acm` | 管理者または権限ロール | チャンネルでのすべてのモジュール |
| `catcmd <command> <enable|disable> <category>` | `cac` | 管理者または権限ロール | カテゴリでのコマンドのルール |
| `catmdl <module> <enable|disable> <category>` | `cam` | 管理者または権限ロール | カテゴリでのモジュールのルール |
| `allcatmdls <enable|disable> <category>` | `acamds` | 管理者または権限ロール | カテゴリでのすべてのモジュール |
| `usrcmd <command> <enable|disable> @user` | `uc` | 管理者または権限ロール | メンバーごとのコマンドのルール |
| `usrmdl <module> <enable|disable> @user` | `um` | 管理者または権限ロール | メンバーごとのモジュールのルール |
| `allusrmdls <enable|disable> @user` | `aum` | 管理者または権限ロール | メンバーごとのすべてのモジュール |
| `cmdcooldown <command> [time]` | `cmdcd` | 管理者または権限ロール | クールダウンを設定または解除 |
| `allcmdcooldowns` | `acmdcds` | 管理者または権限ロール | クールダウンを一覧表示 |
| `discordpermoverride <command> [permissions...]` | `dpo` | 管理者 | Discordの権限の上書きを設定または削除 |
| `discordpermoverridelist` | `dpol`, `dpoli` | 管理者 | 上書きを一覧表示 |
| `discordpermoverridereset` | `dpor` | 管理者 | すべての上書きを消去 |
| `globalmodule <module>` | `gmod` | Botオーナー | モジュールをどこでも切り替え |
| `globalcommand <command>` | `gcmd` | Botオーナー | コマンドをどこでも切り替え |
| `globalpermlist` | `gpl`, `lgp`, `globalperms`, `listglobalperms` | Botオーナー | グローバルなブロックを一覧表示 |
| `resetglobalperms` | | Botオーナー | グローバルなブロックを消去 |
| `userblacklist <add|remove> <user> [reason]` | `ubl` | Botオーナー | ユーザーをブラックリストに登録 |
| `channelblacklist <add|remove> <id> [reason]` | `cbl` | Botオーナー | チャンネルをブラックリストに登録 |
| `serverblacklist <add|remove> <server> [reason]` | `sbl` | Botオーナー | サーバーをブラックリストに登録 |
| `manualblacklistcheck` | `manualblcheck`, `mbc` | Botオーナー | ブラックリストの適用を再実行 |

## ヒントと注意点

- `resetperms` はルールの確認の対象外です。そのため、すべてをロックしてしまったルールがあっても、管理者であれば常に復旧できます。
- ルールは、コマンドの正式名で一致します。そのため、`srvrcmd clear disable` と `srvrcmd purge disable` は同じルールです。`help <command>` に表示される最初の名前を使ってください。
- 「すべてのモジュール」のルールは、権限モジュールにも適用されます。ロールに対してすべてを拒否すると、そのロールだけを持つメンバーは `listperms` も実行できなくなります。
- カテゴリのルールは、コマンドを実行した時点でのチャンネルの親カテゴリを使います。スレッドは親チャンネルの設定を引き継ぎます。
- Discordの権限の上書きが変えるのは、Discordで必要とされる権限であり、ルールで誰が許可されるかではありません。両方を組み合わせて使ってください。上書きで要件を下げ、ルールでどこで使えるかを制限します。
- 権限のルールは、DMでは一切適用されません。
- ダッシュボードでは、対象の選択肢に **サーバー全体**、**ロール**、**チャンネル**、**カテゴリー**、**特定のユーザー** と表示されます。ユーザーの選択肢では、貼り付けたユーザーIDを入力します。
