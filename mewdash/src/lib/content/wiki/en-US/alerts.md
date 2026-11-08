---
title: Alerts
slug: alerts
summary: One page for the posts that come from outside Discord, like stream alerts and RSS feeds
icon: fa-bell
category: Community
dashboard: /dashboard/alerts
module: Games
tags: [alerts, free games, epic, steam, gog, twitch, streams, feeds, rss, notifications]
related: [twitch, streams, feeds]
---

## What it does

The Alerts page has four tabs for things the bot posts in your channels. Pick one with the buttons at the top. The page remembers the tab in the address as `?tab=`.

| Tab | What it posts |
| --- | --- |
| Twitch | Commands and timers for your own Twitch chat, with Discord posts for going live and for sub and raid events. See [Twitch Bot](/wiki/twitch). |
| Streams | A message when a followed streamer goes live or offline. See [Stream Alerts](/wiki/streams). |
| Feeds | New items from RSS and Atom feeds. See [Feeds](/wiki/feeds). |
| Free games | A message when a game becomes free on the Epic Games Store, Steam or GOG. |

The other three tabs each have their own article. The rest of this article covers the Free games tab.

## Free games

The tab has two cards.

### Free game alerts

Each row is a channel, with the role it pings and the stores it follows. Click a row to edit it, or the remove button to stop alerts in that channel after confirming.

1. Click **Add channel**.
2. Choose the channel. It cannot be changed later, so to move alerts add the new channel and remove the old one.
3. Optionally choose a role under **Ping role**. Leave it on **Don't ping** for no ping.
4. Under **Stores**, switch on **Epic**, **Steam** and **GOG**. All three start on. Pick at least one or you cannot save.
5. Click **Save**.

A channel gets one post per game. The first check after setup records what is already free and posts nothing, so you only hear about new offers. The bot checks every 30 minutes.

There is no limit on how many channels get alerts. Each channel has its own stores and role.

### Free right now

Lists the games that are free at the moment. Each row shows the title and the store with a **Free until** date, and a **View** button opens the store page.

## Commands

All except `freegamesnow` need the Manage Server permission.

| Command | Purpose |
| --- | --- |
| `freegamealert <channel> [role]` | Send free game alerts to a channel, with an optional role ping |
| `freegamestores <channel> <stores>` | Change the stores for a channel. Use any of `epic`, `steam` and `gog` |
| `freegameremove <channel>` | Stop alerts in a channel |
| `freegamelist` | List the alert channels |
| `freegamesnow` | Show the games that are free right now |
