---
title: Free Games
slug: freegames
summary: Posts in a channel whenever a game store gives a game away for free
icon: fa-gamepad
category: Community
dashboard: /dashboard/alerts?tab=games
module: Games
tags: [free games, epic games store, steam, gog, giveaway, game deals, alerts, free to keep]
related: [alerts, games, twitch, streams, feeds]
---

## What it does

Free Games watches the Epic Games Store, Steam and GOG for games that are free to keep. When a new one appears, the bot posts an embed in every channel you set up. The embed has the game title and store in the heading and a link to the store page. It adds a cover image and a "free until" time when the store provides them.

You choose the channel and which of the three stores it follows. A role to ping is optional. A server can have several alert channels with different settings.

The feature lives in the **Free games** tab of the Alerts page.

## How it works

The bot checks all three stores 30 minutes after it starts, then every 30 minutes. A game is announced once, the first time the bot sees it free. It is not announced again if it stays free.

The first time the bot sees a store, it records what is already free there and announces nothing. Only games that become free after that are posted. Use **Free right now** or `freegamesnow` to see what is currently free.

If a store does not answer during a check, the bot skips that store and tries again at the next check.

> [!NOTE]
> The bot only posts in channels it can see and send messages in. Alerts that cannot be sent are skipped without an error in the channel.

## Alert settings

Open **Free games** on the Alerts page. The **Free game alerts** card lists every alert channel with its role and the stores it covers. Press **Add channel** to create one, or click a row to edit it.

| Setting | Default | What it controls |
| --- | --- | --- |
| Channel | none | Where alerts are posted. Required, and fixed once the alert exists |
| Ping role | Don't ping | Role mentioned with each alert |
| Stores: Epic | On | Announce Epic Games Store games |
| Stores: Steam | On | Announce Steam games |
| Stores: GOG | On | Announce GOG games |

At least one store must be on. The dialog shows "Pick at least one store" and **Save** stays disabled until you pick one. To move alerts to a different channel, remove the old one and add a new one.

To stop alerts in a channel, press the remove button on its row and confirm "Stop free game alerts in #channel?".

### Free right now

The **Free right now** card lists every game that is currently free across the stores, with its store and, when known, its end date ("Free until" followed by the date). A **View** link opens the store page. It shows "Nothing is free right now" when there are none. This list is not filtered by your alert settings.

## Pinging a role

Choose a role under **Ping role** to mention it with every alert in that channel. Leave it on **Don't ping** to post without a mention. If the role is not mentionable, the bot makes it mentionable only while it sends the alert, then puts it back.

> [!PERMISSION]
> The bot needs View Channel, Send Messages and Embed Links in the alert channel. To ping a role that is not mentionable it also needs Mention Everyone in that channel, or Manage Roles with its highest role above the ping role.

## Setup walkthrough

1. Open **Alerts** in the dashboard and choose the **Free games** tab.
2. Press **Add channel**.
3. Pick the **Channel** the alerts should go in.
4. Optionally pick a **Ping role**.
5. Switch off any stores you do not want. All three are on by default.
6. Press **Save**. "Alerts saved" confirms it.
7. Check **Free right now** to see what is free today. Earlier offers are not posted, only new ones.

## Commands

Run these with your server's prefix (`.` unless you changed it).

| Command | Aliases | Needs | Purpose |
| --- | --- | --- | --- |
| `freegamealert <#channel> [@role]` | `freegames` | Manage Server | Add or update an alert channel, with an optional role ping |
| `freegameremove <#channel>` | `freegamestop` | Manage Server | Stop alerts in a channel |
| `freegamestores <#channel> <stores>` | | Manage Server | Choose stores for a channel, any of `epic`, `steam` and `gog` |
| `freegamelist` | `freegamechannels` | Manage Server | List alert channels with their role and stores |
| `freegamesnow` | `freenow` | Nobody | Show the games that are free right now |

Running `freegamealert` on a channel that already has an alert changes its role and leaves its stores alone. `freegamestores` only works on a channel that already has an alert, and it does not change the role.

## Tips and gotchas

- A new alert starts with all three stores on, whether you create it from the dashboard or with `freegamealert`.
- You can set up one alert per channel. Adding a channel that already has one edits it.
- Epic offers include an end date. Steam and GOG offers do not, so their alerts have no "free until" line.
