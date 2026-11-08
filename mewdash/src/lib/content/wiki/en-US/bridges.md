---
title: Bridges
slug: bridges
summary: Relays messages between a channel here and a channel in a Fluxer community
icon: fa-link
category: Community
dashboard: /dashboard/bridges
module: Bridge
tags: [bridge, bridges, fluxer, relay, link, pair, cross platform, webhook, mirror]
related: [filter, automod, administration]
---

## What it does

A bridge links one channel in your server with one channel in a community on Fluxer. Messages posted on either side appear on the other, with the author's name and avatar. Edits, deletes, replies, attachments and reactions are relayed too, so both sides stay in step.

Messages are posted through a webhook, so Mewdeko needs the Manage Webhooks permission in the bridged channel. Managing bridges needs the Manage Server permission.

The Bridges page, described on the dashboard as relaying messages with Fluxer communities, has three cards: **Linked communities**, **Connect a channel** and **Bridged channels**.

## Connect a channel

Use this to bridge one channel at a time with a link code. A code lasts 15 minutes.

### Start the link here

1. Under **Connect a channel**, pick a channel under **Channel in this server**. Channels that are already bridged are not listed.
2. Click **Create a code**.
3. In the Fluxer channel, run `.bridge link CODE`. The page shows the exact command, which includes the code, and a countdown. **Copy code** copies it.
4. When the other side accepts, the page confirms with **Channel linked with** the channel and community.

If the code runs out, create a new one.

### Start the link on Fluxer

1. Create the code on Fluxer.
2. Pick a channel here, click **I have a code** and enter the code.
3. Click **Link channel**.

A code made on the same platform is refused. Enter it on the other one.

## Linked communities

Pair a whole community with yours once, then bridge channels without a code each time.

To pair:

1. Under **Linked communities**, click **Create a pair code**.
2. In the Fluxer community, run `.bridge pair CODE`.

Or click **I have a pair code**, enter it and click **Link communities**.

Each linked community shows when it was linked and lets you connect channels.

| Control | What it does |
| --- | --- |
| Channel here and Their channel | Pick one of each, then click **Connect channels** |
| Proposed by | A bridge the other side proposed. **Accept bridge** or **Decline** |
| Waiting for | A bridge you proposed that is waiting for the other side. You can cancel it |
| Sharing | Opens the sharing settings |
| Unlink community | Ends the pair |

Under **Sharing**:

| Setting | What it does |
| --- | --- |
| When they propose a bridge | **Approve each bridge** makes every proposal wait for you. **Connect automatically** accepts them. Starts on Approve each bridge |
| Channels they can see | The channels the other community can pick from. Channels not listed stay hidden |

When you unlink, choose **Keep the channel bridges** or **Remove the channel bridges**. After unlinking, neither side sees the other's channels. Bridges made through a pair show **via** the community name.

## Bridged channels

Every bridge is a row with the channel here, the channel and community on the other side, its state and the date it was made. A bridge is either Relaying or paused. **Pause** stops relaying and **Resume relaying** restarts it. **Remove** deletes the bridge after you confirm, and messages stop relaying.

**Relay bots** relays messages from bots and webhooks. It is off by default, so only members are relayed.

### Settings

Click **Settings** on a bridge to open its relay rules. Changes save as you make them.

| Setting | What it does |
| --- | --- |
| Direction | **Both ways**, **Only send from here** or **Only receive here** |
| Allowed roles | Only members with one of these roles are relayed. Empty means everyone |
| Blocked roles | Members with these roles are never relayed |
| Blocked users | Members who are never relayed. Add them by user ID |
| Minimum time in the community before relaying | Members who joined more recently are not relayed. Set in minutes, hours or days, up to 365 days |
| Block invite links | Does not relay messages with Discord or Fluxer invite links |
| Use the word filter | Does not relay messages containing a word from your [word filter](/wiki/filter) |
| Name format | How authors from the other side are named. Use `{name}`, `{platform}` and `{community}`. It must include `{name}` and be at most 80 characters. Starts as `{name}` |

The name format shows a live example under the field.

Messages that are not relayed are dropped quietly. Up to 10 attachments per message are copied across, at 8 MB each and 24 MB in total.

## Commands

Commands need the Manage Server permission. Run them in the bridged channel unless noted. The same actions exist as slash commands under `/bridge` and `/bridge pair`.

| Command | Purpose |
| --- | --- |
| `bridge create` | Create a code for this channel |
| `bridge link <code>` | Bridge this channel using a code from Fluxer |
| `bridge list` | List the bridged channels |
| `bridge settings` | Show this channel's options |
| `bridge pause`, `bridge resume`, `bridge remove` | Pause, resume or remove this channel's bridge |
| `bridge allowbots <on or off>` | Turn **Relay bots** on or off |
| `bridge direction <direction>` | Set the direction |
| `bridge allowrole <roles>`, `bridge blockrole <roles>` | Set allowed or blocked roles |
| `bridge block <user>`, `bridge unblock <user>` | Block or unblock a member |
| `bridge minage <time>` | Set the minimum time in the community |
| `bridge invites <on or off>`, `bridge filter <on or off>` | Toggle invite blocking and the word filter |
| `bridge nameformat <format>` | Set the name format |
| `bridge pair <code>` | Pair with a community, or make a pair code with no argument |
| `bridge pairs`, `bridge channels` | List paired communities and the channels they share |
| `bridge connect`, `bridge proposals`, `bridge accept`, `bridge decline` | Connect channels and answer proposals |
| `bridge share`, `bridge hide`, `bridge approval`, `bridge unpair` | Manage sharing, approval and the pair itself |
