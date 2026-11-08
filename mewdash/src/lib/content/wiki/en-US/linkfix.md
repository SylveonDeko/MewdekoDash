---
title: Link Fixing
slug: linkfix
summary: Replies to links whose embeds are broken with a copy that previews properly
icon: fa-link
category: Community
dashboard: /dashboard/linkfix
module: Utility
tags: [linkfix, link fix, embed fix, twitter, x, instagram, tiktok, reddit, pinterest, bluesky, pixiv, fxtwitter]
related: [utility, filter]
---

## What it does

Some sites show poor or empty previews when their links are posted in Discord. When link fixing is on, the bot replies to a message that contains a supported link with the same link rewritten to a service that embeds it properly. If the bot has Manage Messages in the channel, it also hides the embed on the original message. If the original message is deleted, the bot deletes its reply too.

The Link fixing page, described on the dashboard as fixing social media link embeds, has one card, **Sites**.

## Turn it on

1. Open **Link fixing** in the dashboard.
2. Switch on the toggle in the page header. It starts off.
3. Under **Sites**, check that the sites you want are on.

The site switches stay disabled while the main toggle is off. Changes save as you make them.

## Sites

Each site has a switch and a **Fixing host**. The host is the domain links are rewritten to. The default shows as the placeholder and in the field.

| Site | Default host |
| --- | --- |
| Twitter/X | `fxtwitter.com` |
| Instagram | `vxinstagram.com` |
| TikTok | `tnktok.com` |
| Reddit | `vxreddit.com` |
| Pinterest | `pinterestez.com` |
| Bluesky | `fxbsky.app` |
| Pixiv | `phixiv.net` |

To use a different service, type its host name in **Fixing host**, such as `fixupx.com`. It has to be a plain host name with no `https://` or path, up to 253 characters. An invalid host is not saved and shows an error naming the site. **Use default** puts the default back.

## What gets fixed

Only links to posts are rewritten, such as a tweet, a reel or a Reddit thread, not profile pages. The bot skips:

- Links inside code.
- Links wrapped in angle brackets.
- Links to sites you turned off.
- Messages from bots and webhooks.

Links inside spoilers stay inside spoilers. One message gets at most 5 fixed links, and repeats are dropped. The bot needs the Send Messages and View Channel permissions. Replies never ping anyone.

## Commands

All except `linkfixes` need the Manage Server permission.

| Command | Aliases | Purpose |
| --- | --- | --- |
| `linkfix` | `fixlinks`, `embedfix` | Turn link fixing on or off for the server |
| `linkfix <site>` | | Turn one site on or off, such as `twitter` or `instagram` |
| `linkfixhost <site> <host>` | `fixlinkhost` | Set a site's fixing host, or `default` to go back to the default |
| `linkfixes` | `linkfixlist` | Show whether link fixing is on, with each site's host and state |
