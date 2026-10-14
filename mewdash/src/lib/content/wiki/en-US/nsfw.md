---
title: NSFW
slug: nsfw
summary: Adult image commands that only work in channels marked NSFW, with a per-server tag blacklist and optional timed auto posting.
icon: fa-eye-slash
category: Entertainment
module: Nsfw
tags: [nsfw, hentai, booru, rule34, e621, danbooru, gelbooru, nhentai, reddit, tag blacklist, autohentai, nsfwtoggle]
related: [servermanagement, permissions, filter]
---

## What it does

The NSFW module fetches adult images from image boards and Reddit on request. Every command in it carries Discord's NSFW requirement: it only runs in a channel that has the NSFW flag set, and most of the image board commands also work in a DM with the bot. In any other channel the command is silently refused.

Staff control two things. `nsfwtoggle` (in the Administration module) flips the NSFW flag on the current channel, which is what unlocks these commands there. `nsfwtagbl` keeps a list of tags that are removed from every image board search in this server, so a server can allow the module while excluding content it does not want.

Members run a source command with optional tags and get one image with its rating, source and first few tags. The "bomb" variants post four at once. Moderators can also start a timer that posts a new image into a channel every so many seconds.

## Why you would use it

- An 18+ server wants image commands confined to its marked channels.
- Staff want certain tags blocked server-wide without turning the module off.
- A dedicated channel should get a fresh image on a timer without anyone typing.

## Channel requirement

Discord's NSFW flag is per channel. Run `nsfwtoggle` in a channel to turn it on or off; it needs Manage Channels for you and for the bot. The bot replies to confirm the new state. The same flag can be set in Discord's channel settings.

If a command is used in a non-NSFW channel nothing happens. Members sometimes read this as the bot being broken, so a note in your rules channel helps.

## Sources

| Command | Source | Notes |
| --- | --- | --- |
| `hentai [tags]` | Combined boards, explicit only | Five second cooldown |
| `yandere`, `konachan`, `sankaku`, `e621`, `rule34`, `danbooru`, `gelbooru`, `derpibooru`, `safebooru`, `realbooru` | The named board | Each takes optional tags |
| `hentaibomb [tags]` | Yandere, Danbooru, Konachan and Gelbooru | Four images at once |
| `pornbomb [tags]` | Realbooru | Four images at once |
| `redditnsfw <subreddit>` | A random top post from that subreddit | Ten second cooldown |
| `boobs`, `butts` | Fixed subreddits through `redditnsfw` | |
| `pussy`, `anal`, `porn`, `bondage`, `hentaigif` | Category endpoints | NSFW channel only, no DM |
| `nhentai <id>` | A specific gallery by number | Refuses galleries tagged lolicon or shotacon |
| `nhentaisearch <query> [page] [type] [blacklist]` | Gallery search | |

Tags are separated by spaces. On e621 and Derpibooru the tag `yuri` is translated to that board's equivalent automatically. Only one `hentaibomb` and one `pornbomb` can run at a time per server.

## Tag blacklist

`nsfwtagbl` with no argument lists the blacklisted tags. `nsfwtagbl <tag>` adds the tag, or removes it if it is already on the list. Results that carry a blacklisted tag are skipped for every image board command in the server. It needs Manage Messages.

## Auto posting

`autohentai <seconds> [tags]`, `autoboobs <seconds>` and `autobutts <seconds>` start a timer in the current channel. The interval must be at least 20 seconds for `autohentai` and `autobutts`; `autoboobs` does not enforce a minimum. Running the command with `0`, or with no interval, stops the timer for that channel. For `autohentai`, separate alternative tag sets with `|` and the bot picks one at random each time; leave the tags out for random images. These need Manage Messages and the channel must be NSFW. Timers do not survive a bot restart.

## Settings

There is no dashboard page for this module.

| Setting | Default | What it controls |
| --- | --- | --- |
| Channel NSFW flag | off | Whether any of these commands run in a channel |
| Tag blacklist | empty | Tags excluded from image board results in this server |
| Auto post timers | none | Per channel timers started with the `auto...` commands |

## Setup walkthrough

1. Pick the channel and run `nsfwtoggle` in it, or set the flag in Discord's channel settings.
2. Use Command Permissions to keep the module out of everywhere else, for example `srvrmdl nsfw disable` followed by `chnlmdl nsfw enable #adult`.
3. Add tags you do not want with `nsfwtagbl <tag>`, one per command.
4. Test with `hentai` or `rule34 <tag>` in the channel.
5. Optionally start `autohentai 300 <tags>` and stop it later with `autohentai 0`.

## Commands

Run these with your server's prefix (`.` unless you changed it).

| Command | Aliases | Needs | Purpose |
| --- | --- | --- | --- |
| `nsfwtoggle` | `nsfw`, `nsfwtgl` | Manage Channels | Toggle the current channel's NSFW flag |
| `nsfwtagbl [tag]` | `nsfwtbl` | Manage Messages | List, add or remove a blacklisted tag |
| `hentai [tags]` | | Nobody | One explicit image from the combined boards |
| `hentaibomb [tags]` | | Nobody | Four images from four boards |
| `pornbomb [tags]` | | Nobody | Four Realbooru images |
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
| `redditnsfw <subreddit>` | `nsfwsubreddit` | Nobody | Random post from a subreddit |
| `boobs` | | Nobody | Reddit shortcut |
| `butts` | `ass`, `butt` | Nobody | Reddit shortcut |
| `pussy` | | Nobody | Category image |
| `anal` | | Nobody | Category image |
| `porn` | | Nobody | Category image |
| `bondage` | | Nobody | Category image |
| `hentaigif` | | Nobody | Category gif |
| `nhentai <id>` | `nh` | Nobody | Browse a gallery by number |
| `nhentaisearch <query> [page] [type] [blacklist]` | `nhsearch`, `nhs` | Nobody | Search galleries |
| `autohentai [seconds] [tags]` | | Manage Messages | Timed posting; `0` stops |
| `autoboobs [seconds]` | | Manage Messages | Timed posting; `0` stops; no minimum interval |
| `autobutts [seconds]` | | Manage Messages | Timed posting; `0` stops |

## Tips and gotchas

- Age gating is Discord's channel flag plus the bot's tag blacklist. The bot does not check member age or roles; use Command Permissions for that.
- Bot owners can also disable the module globally, in which case it shows as blocked in the help menu.
- Image boards rate limit and occasionally return nothing for narrow tag combinations; the bot replies that no image was found.
- Timers are per channel and in memory. After a restart, start them again.
