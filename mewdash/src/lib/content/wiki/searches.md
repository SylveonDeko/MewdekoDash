---
title: Searches
slug: searches
summary: Look things up without leaving Discord, from weather, time and dictionary definitions to anime, movies, images, osu! profiles, jokes and reaction GIFs.
icon: fa-magnifying-glass
category: Entertainment
module: Searches
tags: [search, weather, time, define, urban dictionary, wikipedia, google, image search, anime, manga, movie, osu, pokemon, translate, xkcd, meme, reddit, hug, pat, ship]
related: [streams, feeds, twitch, games, utility]
---

## What it does

The Searches module is a set of lookup commands that fetch something from an outside service and post it in the channel. Members ask for the weather in a city, the time somewhere, a word's definition, an anime or movie, a Wikipedia summary, a random cat, or a reaction GIF for a hug or a slap. Most results come back as an embed, and searches with many results are paginated.

There is no dashboard page. Nearly every command is open to everyone, and only the translation auto-mode needs staff permission.

Stream notifications and RSS feeds live in the same bot module but have their own articles. See the stream notifications and feeds pages for `streamadd`, `feedadd` and friends.

## Why you would use it

- Settle "what time is it for you?" with `time` instead of maths.
- Check the forecast before an event with an interactive `weather` card.
- Look up an anime, manga or character while chatting about it.
- Let members send hugs, pats and high-fives as GIFs.
- Translate a message on the spot, or auto-translate a channel for an international community.

## Weather and time

`weather <place>` geocodes the place with Open-Meteo and shows current conditions: temperature, feels like, humidity, wind speed and gusts, pressure, cloud cover, visibility, and the day's high and low. Buttons and a dropdown switch to the hourly forecast, detailed hourly conditions, and a daily view with today and tomorrow's high, low and precipitation.

`time <place>` searches for the place and shows the current time and timezone. When several places match, it offers the candidates to choose from.

## Words and knowledge

| Command | Source | Result |
| --- | --- | --- |
| `define <word>` | Pearson dictionary | Definition, part of speech and an example sentence |
| `urbandict <term>` | Urban Dictionary | Definitions, paginated |
| `wiki <query>` | Wikipedia | Summary of the first matching page |
| `wikia <site> <query>` | A Fandom wiki | Summary from that wiki |
| `google <query>` | Google, falling back to DuckDuckGo | Web results |
| `bible <book> <chapter:verse>` | Bible API | The verse text |
| `resolvetonetags <text>` | built in | Explains tone tags such as `/j` or `/s` found in the text |
| `translate <langs> <text>` | translation API | Translated text; langs is `from>to`, for example `translate en>fr hello` |
| `translangs` | translation API | Languages you can use |

### Auto-translation

`autotranslate` toggles automatic translation for the current channel and needs Administrator. Pass `del` to delete the original message after translating it, or `nodel` (the default) to keep it. Each member then runs `autotranslang en>fr` to set their own language pair for that channel, or `autotranslang` with nothing to remove it.

## Media and fandom

| Command | What you get |
| --- | --- |
| `anime <query>` | Anime search results with details |
| `manga <query>` | Manga search results |
| `charinfo <name>` | A character's names, description and image |
| `findanime [image]` | Identifies an anime from a screenshot via trace.moe; attach an image or give a URL |
| `mal <username or @user>` | A MyAnimeList profile with watching, completed and other stats |
| `movie <title>` | IMDb details through OMDb |
| `youtube <query>` | YouTube search results |
| `steam <game>` | Link to the game's Steam store page |
| `pokemon <name>` | Pokemon details |
| `osu <user> [mode]`, `osu5 <user> [mode]` | osu! profile, or top five plays; modes are standard, taiko, catch and mania |
| `gatari <user> [mode]` | osu!Gatari profile |
| `xkcd [number or latest]` | An xkcd comic, random by default |

## Images

`image <query>` searches Google and DuckDuckGo with strict safe search, then runs the results through a safety check before showing them in a paginated embed. It can be used once every twenty seconds per member. `safebooru <tag>` pulls a tagged image from Safebooru. `revimg <url>` and `revav [@user]` give reverse image search links on Google, TinEye and Yandex for an image or an avatar. `color <hex...>` renders swatches for one or more hex colours.

Random pictures: `randomcat`, `randomdog`, `randomfood`, `randombird`, `randomneko`, `randomkitsune` and `randomwaifu`. `meme` posts a random meme from a set of subreddits, and `randomreddit <subreddit>` posts a random post from a subreddit after checking it is not marked NSFW. `memelist` shows memegen templates and `memegen <template> [text]` builds one. `rip @user` makes a gravestone image with their name and avatar. `shorten <url>` shortens a link.

## Jokes

`randjoke`, `yomama`, `chucknorris`, `wowjoke` and `magicitem` each fetch a joke or item description from their respective APIs. `catfact` posts a cat fact.

## Reaction commands

These post an anime GIF for the action. Ones aimed at someone take a mention: `hug`, `kiss`, `pat`, `cuddle`, `poke`, `tickle`, `slap`, `punch`, `shoot`, `bite`, `feed`, `baka`, `handhold` and `highfive`. Ones about yourself take optional text: `blush`, `bored`, `cry`, `dance`, `facepalm`, `happy`, `laugh`, `pout`, `shrug`, `sleep`, `smile`, `smug`, `stare`, `think`, `thumbsup`, `wave` and `wink`. All of them are also available as slash commands.

`ship @user [@user2]` scores the compatibility of two members (or you and one member) and posts a ship image with a comment.

## Settings

This module has no dashboard page and no per-server settings beyond the auto-translation toggle. Several commands rely on API keys the bot owner configures; if a key is missing the command replies with an error instead of results.

## Setup walkthrough

1. Nothing needs enabling. Run `weather London` or `define serendipity` to confirm the bot can reply in the channel.
2. If you want a translated channel, run `autotranslate` there as an administrator, then have members set `autotranslang en>es` or similar.
3. Use the permissions module if you want to restrict the reaction or image commands to certain channels.

## Commands

Run these with your server's prefix (`.` unless you changed it).

| Command | Aliases | Needs | Purpose |
| --- | --- | --- | --- |
| `weather <place>` | `we` | Nobody | Interactive weather card |
| `time <place>` | | Nobody | Current time and timezone |
| `define <word>` | `def` | Nobody | Dictionary definition |
| `urbandict <term>` | `ud` | Nobody | Urban Dictionary |
| `wiki <query>` | `wikipedia` | Nobody | Wikipedia summary |
| `wikia <site> <query>` | `fandom` | Nobody | Fandom wiki lookup |
| `google <query>` | `g` | Nobody | Web search |
| `bible <book> <chapter:verse>` | | Nobody | Bible verse |
| `resolvetonetags <text>` | `tonetag`, `resolvetonetag`, `tonetags` | Nobody | Explain tone tags |
| `translate <langs> <text>` | `trans` | Nobody | Translate text, for example `translate en>fr hello` |
| `translangs` | | Nobody | Supported languages |
| `autotranslate [del\|nodel]` | `at`, `autotrans` | Administrator | Toggle channel auto-translation |
| `autotranslang [from>to]` | `atl` | Nobody | Your language pair for auto-translation |
| `anime <query>` | `ani`, `aq` | Nobody | Anime search |
| `manga <query>` | `mang`, `mq` | Nobody | Manga search |
| `charinfo <name>` | `characterinfo` | Nobody | Character lookup |
| `findanime [image]` | `whatanime` | Nobody | Identify anime from a screenshot |
| `mal <username or @user>` | | Nobody | MyAnimeList profile |
| `movie <title>` | `omdb`, `imdb` | Nobody | Movie details |
| `youtube <query>` | `yt` | Nobody | YouTube search |
| `steam <game>` | | Nobody | Steam store link |
| `pokemon <name>` | | Nobody | Pokemon details |
| `osu <user> [mode]` | | Nobody | osu! profile |
| `osu5 <user> [mode]` | | Nobody | Top five osu! plays |
| `gatari <user> [mode]` | | Nobody | osu!Gatari profile |
| `xkcd [number\|latest]` | | Nobody | xkcd comic |
| `image <query>` | `img`, `rimg` | Nobody | Safe image search |
| `safebooru [tag]` | | Nobody | Safebooru image |
| `revimg <url>` | | Nobody | Reverse image search links |
| `revav [@user]` | | Nobody | Reverse search an avatar |
| `color <hex...>` | `clr` | Nobody | Colour swatches |
| `randomcat` | `meow` | Nobody | Cat picture |
| `randomdog` | `woof` | Nobody | Dog picture |
| `randomfood` | `yum` | Nobody | Food picture |
| `randombird` | `birb`, `bird` | Nobody | Bird picture |
| `randomneko` | `neko` | Nobody | Neko picture |
| `randomkitsune` | `kitsune` | Nobody | Kitsune picture |
| `randomwaifu` | `waifu` | Nobody | Waifu picture |
| `meme` | `randommeme` | Nobody | Random Reddit meme |
| `randomreddit <subreddit>` | `subreddit` | Nobody | Random post from a subreddit |
| `memelist` | | Nobody | Memegen templates |
| `memegen <template> [text]` | | Nobody | Build a meme |
| `rip <@user>` | | Nobody | Gravestone image |
| `shorten <url>` | | Nobody | Shorten a link |
| `randjoke` | | Nobody | Random joke |
| `yomama` | `ym` | Nobody | Yo mama joke |
| `chucknorris` | `cn` | Nobody | Chuck Norris joke |
| `wowjoke` | | Nobody | World of Warcraft joke |
| `magicitem` | `mi` | Nobody | WoW magic item |
| `catfact` | | Nobody | Cat fact |
| `ship <@user> [@user2]` | | Nobody | Compatibility score image |
| `hug`, `kiss`, `pat`, `cuddle`, `poke`, `tickle`, `slap`, `punch`, `shoot`, `bite`, `feed`, `baka`, `handhold`, `highfive <@user>` | | Nobody | Reaction GIF aimed at someone |
| `blush`, `bored`, `cry`, `dance`, `facepalm`, `happy`, `laugh`, `pout`, `shrug`, `sleep`, `smile`, `smug`, `stare`, `think`, `thumbsup`, `wave`, `wink [text]` | | Nobody | Reaction GIF about yourself |

## Tips and gotchas

- These commands call outside services, so results depend on those services being up and on the bot owner having the right API keys.
- `image` is rate limited to one search every twenty seconds per member, and results are filtered for safety even in NSFW channels.
- `randomreddit` refuses subreddits flagged NSFW. Use the NSFW module for adult content.
- Auto-translation is per channel and per member: the channel must be enabled by an administrator, and each member picks their own pair.
- Stream notifications (`streamadd`, `streamlist`, `streamtemplate`) and RSS feeds (`feedadd`, `feedlist`) are documented separately even though they share this module.
