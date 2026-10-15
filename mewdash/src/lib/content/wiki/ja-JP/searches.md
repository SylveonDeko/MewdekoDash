---
title: 検索
slug: searches
summary: Discordを離れずに、天気、時刻、辞書の定義から、アニメ、映画、画像、osu!のプロフィール、ジョーク、リアクションGIFまで調べられます。
icon: fa-magnifying-glass
category: Entertainment
module: Searches
tags: [search, weather, time, define, urban dictionary, wikipedia, google, image search, anime, manga, movie, osu, pokemon, translate, xkcd, meme, reddit, hug, pat, ship, 検索, 天気, 時刻, 定義, アーバン辞書, ウィキペディア, 画像検索, アニメ, マンガ, 映画, ポケモン, 翻訳, ミーム, ハグ, なでなで, シップ]
related: [streams, feeds, twitch, games, utility]
---

## 概要

検索モジュールは、外部のサービスから情報を取得してチャンネルに投稿する、一連の検索コマンドです。メンバーは、都市の天気、どこかの現在時刻、単語の定義、アニメや映画、Wikipediaの概要、ランダムな猫の写真、ハグやビンタのリアクションGIFなどを検索できます。ほとんどの結果は埋め込みとして返され、結果が多い検索はページ分割されます。

検索モジュールにはダッシュボードのページはありません。ほぼすべてのコマンドは全員が利用でき、翻訳の自動モードだけがスタッフの権限を必要とします。

ストリーム通知とRSSフィードも同じBotのモジュールに含まれていますが、それぞれ別の記事があります。`streamadd`、`feedadd` などについては、ストリーム通知とフィードのページを参照してください。

## 使う理由

- 「そっちは今何時？」という疑問を、計算せずに `time` ですぐ解決したい。
- イベントの前に、インタラクティブな `weather` カードで天気予報を確認したい。
- 話題にしているアニメ、マンガ、キャラクターをチャットの最中に調べたい。
- メンバー同士で、ハグ、なでなで、ハイタッチをGIFで送りたい。
- その場でメッセージを翻訳したり、国際的なコミュニティのためにチャンネルを自動翻訳したりしたい。

## 天気と時刻

`weather <place>` は、Open-Meteoで場所を座標に変換し、現在の状況を表示します。気温、体感温度、湿度、風速と突風、気圧、雲量、視程、その日の最高気温と最低気温です。ボタンとドロップダウンで、時間ごとの予報、時間ごとの詳しい状況、今日と明日の最高気温、最低気温、降水量を含む日ごとの表示に切り替えられます。

`time <place>` は場所を検索し、現在の時刻とタイムゾーンを表示します。複数の場所が一致した場合は、候補から選べるように提示されます。

## 言葉と知識

| コマンド | 情報源 | 結果 |
| --- | --- | --- |
| `define <word>` | Pearsonの辞書 | 定義、品詞、例文 |
| `urbandict <term>` | Urban Dictionary | 定義。ページ分割されます |
| `wiki <query>` | Wikipedia | 最初に一致したページの概要 |
| `wikia <site> <query>` | Fandomのウィキ | そのウィキからの概要 |
| `google <query>` | Google。取得できない場合はDuckDuckGo | ウェブの検索結果 |
| `bible <book> <chapter:verse>` | Bible API | 節の本文 |
| `resolvetonetags <text>` | 組み込み | テキスト内の `/j` や `/s` などのトーンタグを説明します |
| `translate <langs> <text>` | 翻訳API | 翻訳されたテキスト。langsは `from>to` の形式です。例：`translate en>fr hello` |
| `translangs` | 翻訳API | 利用できる言語 |

### 自動翻訳

`autotranslate` は、現在のチャンネルの自動翻訳のオン・オフを切り替えます。実行には管理者権限が必要です。`del` を指定すると、翻訳後に元のメッセージを削除します。`nodel`（デフォルト）を指定すると、元のメッセージを残します。その後、各メンバーは `autotranslang en>fr` を実行して、そのチャンネルで自分の言語の組み合わせを設定します。何も指定せずに `autotranslang` を実行すると、設定を解除できます。

## メディアとファンダム

| コマンド | 結果 |
| --- | --- |
| `anime <query>` | 詳細付きのアニメの検索結果 |
| `manga <query>` | マンガの検索結果 |
| `charinfo <name>` | キャラクターの名前、説明、画像 |
| `findanime [image]` | trace.moeを使って、スクリーンショットからアニメを特定します。画像を添付するかURLを指定します |
| `mal <username or @user>` | 視聴中、視聴済みなどの統計を含むMyAnimeListのプロフィール |
| `movie <title>` | OMDb経由のIMDbの詳細 |
| `youtube <query>` | YouTubeの検索結果 |
| `steam <game>` | ゲームのSteamストアページへのリンク |
| `pokemon <name>` | ポケモンの詳細 |
| `osu <user> [mode]`、`osu5 <user> [mode]` | osu!のプロフィール、または上位5件のプレイ。モードは standard、taiko、catch、mania です |
| `gatari <user> [mode]` | osu!Gatariのプロフィール |
| `xkcd [number or latest]` | xkcdの漫画。デフォルトはランダムです |

## 画像

`image <query>` は、厳格なセーフサーチを有効にしてGoogleとDuckDuckGoを検索し、結果を安全性チェックにかけてから、ページ分割された埋め込みで表示します。メンバーは20秒に1回まで実行できます。`safebooru <tag>` は、Safebooruからタグ付きの画像を取得します。`revimg <url>` と `revav [@user]` は、画像またはアバターについて、GoogleとTinEyeとYandexの逆画像検索のリンクを表示します。`color <hex...>` は、1つ以上の16進数のカラーコードの見本を表示します。

ランダムな画像：`randomcat`、`randomdog`、`randomfood`、`randombird`、`randomneko`、`randomkitsune`、`randomwaifu`。`meme` は、指定されたサブレディットのセットからランダムなミームを投稿します。`randomreddit <subreddit>` は、そのサブレディットがNSFWとマークされていないことを確認したうえで、ランダムな投稿を表示します。`memelist` はmemegenのテンプレートを表示し、`memegen <template> [text]` はミームを作成します。`rip @user` は、名前とアバターを入れた墓石の画像を作成します。`shorten <url>` はリンクを短縮します。

## ジョーク

`randjoke`、`yomama`、`chucknorris`、`wowjoke`、`magicitem` は、それぞれのAPIからジョークやアイテムの説明を取得します。`catfact` は猫の雑学を投稿します。

## リアクションコマンド

これらのコマンドは、そのアクションを表すアニメのGIFを投稿します。相手を対象とするものはメンションが必要です。`hug`、`kiss`、`pat`、`cuddle`、`poke`、`tickle`、`slap`、`punch`、`shoot`、`bite`、`feed`、`baka`、`handhold`、`highfive` です。自分自身を対象とするものは、任意のテキストを指定できます。`blush`、`bored`、`cry`、`dance`、`facepalm`、`happy`、`laugh`、`pout`、`shrug`、`sleep`、`smile`、`smug`、`stare`、`think`、`thumbsup`、`wave`、`wink` です。これらはすべてスラッシュコマンドとしても使えます。

`ship @user [@user2]` は、2人のメンバー（またはあなたと1人のメンバー）の相性を採点し、コメント付きのシップ画像を投稿します。

## 設定

このモジュールにはダッシュボードのページがなく、自動翻訳のオン・オフ以外のサーバーごとの設定もありません。いくつかのコマンドはBotのオーナーが設定したAPIキーに依存します。キーがない場合、コマンドは結果ではなくエラーで応答します。

## セットアップの手順

1. 有効にする必要はありません。`weather London` または `define serendipity` を実行して、Botがチャンネルで応答できることを確認します。
2. 翻訳されるチャンネルにしたい場合は、管理者がそのチャンネルで `autotranslate` を実行し、メンバーに `autotranslang en>es` などを設定してもらいます。
3. リアクションや画像のコマンドを特定のチャンネルに制限したい場合は、権限モジュールを使用します。

## コマンド

サーバーのプレフィックス（変更していない場合は `.`）を付けて実行します。

| コマンド | エイリアス | 必要な権限 | 用途 |
| --- | --- | --- | --- |
| `weather <place>` | `we` | なし | インタラクティブな天気カード |
| `time <place>` | | なし | 現在時刻とタイムゾーン |
| `define <word>` | `def` | なし | 辞書の定義 |
| `urbandict <term>` | `ud` | なし | Urban Dictionary |
| `wiki <query>` | `wikipedia` | なし | Wikipediaの概要 |
| `wikia <site> <query>` | `fandom` | なし | Fandomのウィキの検索 |
| `google <query>` | `g` | なし | ウェブ検索 |
| `bible <book> <chapter:verse>` | | なし | 聖書の節 |
| `resolvetonetags <text>` | `tonetag`, `resolvetonetag`, `tonetags` | なし | トーンタグを説明します |
| `translate <langs> <text>` | `trans` | なし | テキストを翻訳します。例：`translate en>fr hello` |
| `translangs` | | なし | 対応している言語 |
| `autotranslate [del\|nodel]` | `at`, `autotrans` | 管理者 | チャンネルの自動翻訳を切り替えます |
| `autotranslang [from>to]` | `atl` | なし | 自動翻訳で使う自分の言語の組み合わせ |
| `anime <query>` | `ani`, `aq` | なし | アニメの検索 |
| `manga <query>` | `mang`, `mq` | なし | マンガの検索 |
| `charinfo <name>` | `characterinfo` | なし | キャラクターの検索 |
| `findanime [image]` | `whatanime` | なし | スクリーンショットからアニメを特定します |
| `mal <username or @user>` | | なし | MyAnimeListのプロフィール |
| `movie <title>` | `omdb`, `imdb` | なし | 映画の詳細 |
| `youtube <query>` | `yt` | なし | YouTubeの検索 |
| `steam <game>` | | なし | Steamストアへのリンク |
| `pokemon <name>` | | なし | ポケモンの詳細 |
| `osu <user> [mode]` | | なし | osu!のプロフィール |
| `osu5 <user> [mode]` | | なし | osu!の上位5件のプレイ |
| `gatari <user> [mode]` | | なし | osu!Gatariのプロフィール |
| `xkcd [number\|latest]` | | なし | xkcdの漫画 |
| `image <query>` | `img`, `rimg` | なし | セーフな画像検索 |
| `safebooru [tag]` | | なし | Safebooruの画像 |
| `revimg <url>` | | なし | 逆画像検索のリンク |
| `revav [@user]` | | なし | アバターを逆検索します |
| `color <hex...>` | `clr` | なし | カラーの見本 |
| `randomcat` | `meow` | なし | 猫の写真 |
| `randomdog` | `woof` | なし | 犬の写真 |
| `randomfood` | `yum` | なし | 食べ物の写真 |
| `randombird` | `birb`, `bird` | なし | 鳥の写真 |
| `randomneko` | `neko` | なし | ネコの写真 |
| `randomkitsune` | `kitsune` | なし | キツネの写真 |
| `randomwaifu` | `waifu` | なし | ワイフの写真 |
| `meme` | `randommeme` | なし | Redditのランダムなミーム |
| `randomreddit <subreddit>` | `subreddit` | なし | サブレディットからランダムな投稿 |
| `memelist` | | なし | memegenのテンプレート |
| `memegen <template> [text]` | | なし | ミームを作成します |
| `rip <@user>` | | なし | 墓石の画像 |
| `shorten <url>` | | なし | リンクを短縮します |
| `randjoke` | | なし | ランダムなジョーク |
| `yomama` | `ym` | なし | ヨーママジョーク |
| `chucknorris` | `cn` | なし | チャック・ノリスのジョーク |
| `wowjoke` | | なし | World of Warcraftのジョーク |
| `magicitem` | `mi` | なし | WoWの魔法アイテム |
| `catfact` | | なし | 猫の雑学 |
| `ship <@user> [@user2]` | | なし | 相性スコアの画像 |
| `hug`、`kiss`、`pat`、`cuddle`、`poke`、`tickle`、`slap`、`punch`、`shoot`、`bite`、`feed`、`baka`、`handhold`、`highfive <@user>` | | なし | 相手を対象としたリアクションGIF |
| `blush`、`bored`、`cry`、`dance`、`facepalm`、`happy`、`laugh`、`pout`、`shrug`、`sleep`、`smile`、`smug`、`stare`、`think`、`thumbsup`、`wave`、`wink [text]` | | なし | 自分を対象としたリアクションGIF |

## ヒントと注意点

- これらのコマンドは外部サービスを呼び出すため、結果はそれらのサービスが稼働しているかどうか、そしてBotのオーナーが正しいAPIキーを設定しているかどうかに依存します。
- `image` は、メンバーごとに20秒に1回の検索に制限されています。結果は、NSFWチャンネルであっても安全性のためにフィルタリングされます。
- `randomreddit` は、NSFWとマークされたサブレディットを拒否します。成人向けのコンテンツにはNSFWモジュールを使用してください。
- 自動翻訳はチャンネルごと、かつメンバーごとに設定されます。チャンネルは管理者が有効にする必要があり、各メンバーが自分の言語の組み合わせを選びます。
- ストリーム通知（`streamadd`、`streamlist`、`streamtemplate`）とRSSフィード（`feedadd`、`feedlist`）は、同じモジュールを共有していますが、別に説明されています。
