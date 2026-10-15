---
title: NSFW
slug: nsfw
summary: NSFW とマークされたチャンネルでのみ動作する成人向け画像コマンドです。サーバーごとのタグのブラックリストと、任意の時間指定の自動投稿に対応しています。
icon: fa-eye-slash
category: Entertainment
module: Nsfw
tags: [nsfw, hentai, booru, rule34, e621, danbooru, gelbooru, nhentai, reddit, tag blacklist, autohentai, nsfwtoggle, NSFW, 成人向け, タグブラックリスト, 自動投稿, NSFWトグル]
related: [servermanagement, permissions, filter]
---

## What it does

NSFW モジュールは、要求に応じて画像掲示板と Reddit から成人向けの画像を取得します。このモジュールのすべてのコマンドには、Discord の NSFW の要件が適用されます。NSFW フラグが設定されたチャンネルでのみ動作し、画像掲示板のコマンドのほとんどは、ボットとのDMでも使えます。それ以外のチャンネルでは、コマンドは何も表示されずに拒否されます。

スタッフは2つのことを管理します。`nsfwtoggle`（Administration モジュール）は、現在のチャンネルの NSFW フラグを切り替えます。これにより、そのチャンネルでこれらのコマンドが使えるようになります。`nsfwtagbl` は、このサーバーのすべての画像掲示板の検索から除外されるタグのリストを管理します。そのため、サーバーはモジュールを許可しつつ、望まないコンテンツを除外できます。

メンバーは、任意のタグを付けてソースコマンドを実行すると、レーティング、ソース、最初の数個のタグとともに画像を1枚受け取ります。"bomb" のバリアントは、4枚を一度に投稿します。モデレーターは、タイマーを開始して、一定の秒数ごとにチャンネルへ新しい画像を投稿することもできます。

## Why you would use it

- 18歳以上のサーバーでは、画像コマンドを指定したチャンネルだけに限定したい場合。
- モジュールをオフにせずに、スタッフが特定のタグをサーバー全体でブロックしたい場合。
- 専用のチャンネルで、誰も入力しなくても、タイマーで新しい画像を表示したい場合。

## Channel requirement

Discord の NSFW フラグはチャンネルごとに設定されます。チャンネルで `nsfwtoggle` を実行すると、オンまたはオフになります。実行するには、あなたとボットの両方にチャンネルの管理が必要です。ボットは新しい状態を確認する返信をします。同じフラグは、Discord のチャンネル設定でも設定できます。

NSFW ではないチャンネルでコマンドを使っても、何も起こりません。メンバーはこれをボットの不具合と誤解することがあるため、ルールのチャンネルに注意書きを入れておくと役立ちます。

## Sources

| Command | Source | Notes |
| --- | --- | --- |
| `hentai [tags]` | 複数の掲示板の統合、explicit のみ | 5秒のクールダウン |
| `yandere`、`konachan`、`sankaku`、`e621`、`rule34`、`danbooru`、`gelbooru`、`derpibooru`、`safebooru`、`realbooru` | 指定された掲示板 | それぞれ任意のタグを指定できます |
| `hentaibomb [tags]` | Yandere、Danbooru、Konachan、Gelbooru | 一度に4枚 |
| `pornbomb [tags]` | Realbooru | 一度に4枚 |
| `redditnsfw <subreddit>` | そのサブレディットのランダムな上位の投稿 | 10秒のクールダウン |
| `boobs`、`butts` | `redditnsfw` で指定された固定のサブレディット | |
| `pussy`、`anal`、`porn`、`bondage`、`hentaigif` | カテゴリのエンドポイント | NSFW チャンネルのみ。DM では使えません |
| `nhentai <id>` | 番号で指定された特定のギャラリー | lolicon または shotacon とタグ付けされたギャラリーは拒否されます |
| `nhentaisearch <query> [page] [type] [blacklist]` | ギャラリーの検索 | |

タグはスペースで区切ります。e621 と Derpibooru では、タグ `yuri` は、その掲示板の同等のタグに自動的に変換されます。サーバーごとに、`hentaibomb` と `pornbomb` は同時に1つずつしか実行できません。

## Tag blacklist

引数なしの `nsfwtagbl` は、ブラックリストに登録されたタグを一覧表示します。`nsfwtagbl <tag>` は、タグを追加します。すでにリストにある場合は削除します。ブラックリストのタグを含む結果は、サーバー内のすべての画像掲示板コマンドでスキップされます。実行には Manage Messages が必要です。

## Auto posting

`autohentai <seconds> [tags]`、`autoboobs <seconds>`、`autobutts <seconds>` は、現在のチャンネルでタイマーを開始します。間隔は、`autohentai` と `autobutts` では20秒以上である必要があります。`autoboobs` では最小値は設定されていません。コマンドを `0` で実行するか、間隔を指定せずに実行すると、そのチャンネルのタイマーが停止します。`autohentai` では、代替のタグセットを `|` で区切ると、ボットが毎回ランダムに1つを選びます。ランダムな画像にする場合は、タグを省略します。これらには Manage Messages が必要で、チャンネルは NSFW である必要があります。タイマーは、ボットを再起動すると維持されません。

## Settings

このモジュール専用のダッシュボードのページはありません。

| Setting | Default | What it controls |
| --- | --- | --- |
| Channel NSFW flag | off | チャンネルでこれらのコマンドのいずれかを実行できるかどうか |
| Tag blacklist | empty | このサーバーの画像掲示板の結果から除外されるタグ |
| Auto post timers | none | `auto...` コマンドで開始された、チャンネルごとのタイマー |

## Setup walkthrough

1. チャンネルを選び、そこで `nsfwtoggle` を実行するか、Discord のチャンネル設定でフラグを設定します。
2. Command Permissions を使って、ほかの場所ではモジュールを使えないようにします。たとえば `srvrmdl nsfw disable` を実行したあと、`chnlmdl nsfw enable #adult` を実行します。
3. 望まないタグを `nsfwtagbl <tag>` で1つずつ追加します。
4. チャンネルで `hentai` または `rule34 <tag>` を実行してテストします。
5. 必要に応じて `autohentai 300 <tags>` を開始し、後で `autohentai 0` で停止します。

## Commands

これらのコマンドは、サーバーのプレフィックスを付けて実行します（変更していなければ `.`）。

| Command | Aliases | Needs | Purpose |
| --- | --- | --- | --- |
| `nsfwtoggle` | `nsfw`, `nsfwtgl` | Manage Channels | 現在のチャンネルの NSFW フラグを切り替えます |
| `nsfwtagbl [tag]` | `nsfwtbl` | Manage Messages | ブラックリストのタグを一覧表示、追加、または削除します |
| `hentai [tags]` | | Nobody | 統合された掲示板から explicit の画像を1枚表示します |
| `hentaibomb [tags]` | | Nobody | 4つの掲示板から4枚の画像を表示します |
| `pornbomb [tags]` | | Nobody | Realbooru から4枚の画像を表示します |
| `yandere [tags]` | | Nobody | Yande.re |
| `konachan [tags]` | | Nobody | Konachan |
| `sankaku [tags]` | | Nobody | Sankaku |
| `e621 [tags]` | | Nobody | e621 |
| `rule34 [tags]` | `r34` | Nobody | Rule34 |
| `danbooru [tags]` | | Nobody | Danbooru |
| `gelbooru [tags]` | | Nobody | Gelbooru |
| `derpibooru [tags]` | `derpi` | Nobody | Derpibooru |
| `safebooru [tags]` | | Nobody | Safebooru |
| `realbooru [tags]` | `rb` | Nobody | Realbooru |
| `redditnsfw <subreddit>` | `nsfwsubreddit` | Nobody | サブレディットからのランダムな投稿 |
| `boobs` | | Nobody | Reddit のショートカット |
| `butts` | `ass`, `butt` | Nobody | Reddit のショートカット |
| `pussy` | | Nobody | カテゴリの画像 |
| `anal` | | Nobody | カテゴリの画像 |
| `porn` | | Nobody | カテゴリの画像 |
| `bondage` | | Nobody | カテゴリの画像 |
| `hentaigif` | | Nobody | カテゴリの GIF |
| `nhentai <id>` | `nh` | Nobody | 番号でギャラリーを閲覧します |
| `nhentaisearch <query> [page] [type] [blacklist]` | `nhsearch`, `nhs` | Nobody | ギャラリーを検索します |
| `autohentai [seconds] [tags]` | | Manage Messages | 時間指定の投稿。`0` で停止します |
| `autoboobs [seconds]` | | Manage Messages | 時間指定の投稿。`0` で停止します。最小間隔はありません |
| `autobutts [seconds]` | | Manage Messages | 時間指定の投稿。`0` で停止します |

## Tips and gotchas

- 年齢による制限は、Discord のチャンネルフラグとボットのタグブラックリストで行われます。ボットはメンバーの年齢やロールを確認しません。そのためには Command Permissions を使ってください。
- ボットオーナーは、このモジュールをすべてのサーバーで無効にすることもできます。その場合、ヘルプメニューではブロックされた状態として表示されます。
- 画像掲示板にはレート制限があり、絞り込んだタグの組み合わせでは、ときどき何も返さないことがあります。その場合、ボットは画像が見つからなかったことを返信します。
- タイマーはチャンネルごとに、メモリ上で管理されます。再起動後は、もう一度開始してください。
