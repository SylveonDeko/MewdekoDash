---
title: Stream Alerts
slug: streams
summary: Follow streamers on Twitch, YouTube, Kick and Picarto and post an announcement in a channel of your choice when they go live or offline.
icon: fa-video
category: Community
dashboard: /dashboard/streams
module: Searches
tags: [streams, stream alerts, go live, live notifications, twitch, youtube, kick, picarto, trovo, streamadd, streamtemplate]
related: [twitch, utility, administration]
---

## What it does

Staff paste a stream URL and pick a Discord channel. The bot then polls that streamer's platform and, when the stream flips from offline to online, posts a go-live message in the chosen channel. By default that is an embed with the streamer's name linked to the stream, the stream title, the game or category, the viewer count, the streamer's avatar, and a preview image.

You can replace the default embed with your own message. There is a server-wide template that applies to every followed stream, and each stream can also have its own online message and its own offline message. All of them accept the `%stream.*%` placeholders listed below and can be plain text or a full embed built in the dashboard's embed editor.

Offline notices are off by default. Turn them on and the bot also posts when a followed stream ends, using the stream's offline message if one is set, otherwise the server template, otherwise the default embed showing "Offline".

> [!NOTE]
> Stream Alerts announces other people's streams into your Discord. The separate Twitch Bot feature connects the bot to your own Twitch chat for commands, timers and events. See the Twitch Bot article for that.

## Why you would use it

- A community server wants a "now live" channel that lights up whenever one of its creators starts streaming.
- A streamer's own Discord wants an automatic ping with the title and category so nobody has to post it by hand.
- An esports or event server follows several tournament channels across Twitch and Kick in one place.
- A server wants a clean "stream ended" notice so the go-live post does not look stale.

## Supported platforms

The bot picks the platform from the URL you give it. Only URLs that match one of these patterns can be followed.

| Platform | URL format | Notes |
| --- | --- | --- |
| Twitch | `twitch.tv/username` | Uses the Twitch Helix API. Title, game, viewers, avatar and preview are all filled. |
| YouTube | `youtube.com/@handle` or `youtube.com/channel/ID` | Read by scraping the channel's live page, so data can be less complete than Twitch. A channel ID URL is converted to the handle. |
| Kick | `kick.com/slug` | Uses the Kick public API. The avatar placeholder is filled with the channel banner picture. |
| Picarto | `picarto.tv/name` | Uses the Picarto API. |

Trovo and Facebook appear in the platform list on the dashboard and in the stored data, but there is no working URL matcher for Trovo and no provider for Facebook in the current code, so those URLs are rejected when you try to follow them.

## How checking works

The bot keeps one tracker per platform and asks each platform for the state of every followed channel in a loop, pausing three seconds between rounds. A stream is announced as online the first time it is seen live after being offline.

Going offline is handled more carefully because Twitch sometimes reports a brief offline blip during a live stream. A stream has to be seen offline in two consecutive checks before the offline notice is sent. If it comes back online in between, nothing is posted.

Every thirty minutes the bot looks for streams whose platform lookups have been failing for more than twelve hours, for example a deleted or renamed channel, and removes them from every server that followed them.

If a followed stream's notification channel has been deleted, the stream is dropped the next time someone runs `streamlist`.

## The message it sends

When a stream changes state the bot picks a message in this order:

1. The stream's own **Online Message** or **Offline Message**, whichever matches the new state.
2. The server-wide **Global Stream Message** template.
3. The built-in embed.

A per-stream message that is not valid embed JSON is posted as plain text above the built-in embed. A global template that is not embed JSON is posted as plain text on its own. Messages that are valid embed JSON, which is what the dashboard's embed builder produces, are sent exactly as designed, including buttons.

The built-in embed has the streamer's name as a linked title, the title of the stream as the author line, a **Status** field showing Online or Offline, a **Viewers** field, a **Streaming** field for the game or category, the avatar as a thumbnail and the preview as the large image. It is green while live and red when offline.

### Placeholders

Only this set is replaced in stream messages. The general server and user placeholders from the placeholders page are not available here.

| Placeholder | Value |
| --- | --- |
| `%stream.name%` | Display name of the streamer, or `Unknown` |
| `%stream.username%` | Login name or handle of the streamer |
| `%stream.url%` | Direct link to the stream, always with `https://` |
| `%stream.title%` | Current stream title, or `No title` |
| `%stream.game%` | Game or category, or `No category` |
| `%stream.viewers%` | Viewer count with thousands separators, or `-` when offline |
| `%stream.platform%` | Platform name such as `Twitch` or `Youtube` |
| `%stream.avatar%` | Streamer avatar URL |
| `%stream.preview%` | Stream preview or thumbnail URL |
| `%stream.status%` | `Online` or `Offline`, each prefixed with a coloured circle |
| `%stream.channelid%` | Platform-specific channel ID, where the platform provides one |

> [!EXAMPLE]
> A simple global template: `%stream.name% is live on %stream.platform% playing %stream.game%: %stream.title% %stream.url%`

## Settings

The Stream Notifications page has four tabs: **Streams**, **Follow Stream**, **Settings** and **Statistics**.

| Setting | Default | What it controls |
| --- | --- | --- |
| Notification Channel | none | The channel a new stream's alerts go to, chosen on **Follow Stream** |
| Stream URL | none | The link to follow, on **Follow Stream** |
| Online Message | none | Per-stream message when it goes live, edited from the stream's card on **Streams** |
| Offline Message | none | Per-stream message when it ends, edited from the same card |
| Global Stream Message | none | Server-wide template used when a stream has no message of its own, on **Settings** |
| Offline Notifications | off | Whether the bot posts when followed streams go offline, on **Settings** |

**Streams** lists every followed stream with its platform, channel and the date it was added, with a delete button on each card and a **Clear All** button. **Statistics** shows total streams, unique streamers, channels with notifications, platforms in use and a breakdown by platform.

A server can follow at most ten streams. Adding an eleventh fails.

## Setup walkthrough

1. Open **Stream Alerts** in the dashboard and go to the **Follow Stream** tab.
2. Pick the **Notification Channel**, paste the **Stream URL**, and click **Follow Stream**.
3. On **Settings**, build a **Global Stream Message** in the embed editor using the placeholders above, then click **Save Message**. Skip this to keep the built-in embed.
4. Turn on **Offline Notifications** if you want "stream ended" posts as well.
5. Back on **Streams**, open a stream's card to give it its own **Online Message** or **Offline Message** if it needs something different from the global template.
6. Test with `streamcheck <url>` to confirm the bot can read the stream, then wait for the next go-live.

## Commands

Run these with your server's prefix (`.` unless you changed it).

| Command | Aliases | Needs | Purpose |
| --- | --- | --- | --- |
| `streamadd <url>` | `sta`, `stadd` | Manage Messages | Follow a stream and send its alerts to the current channel |
| `streamremove <index>` | `strm` | Manage Messages | Unfollow the stream at that position in `streamlist` |
| `streamsclear` | `stclear` | Administrator | Unfollow every stream in the server |
| `streamlist` | `stl`, `streamslist` | Nobody | Paged list of followed streams with their numbers, platforms and channels |
| `streamoffline` | `sto`, `stoff` | Manage Messages | Toggle offline notifications |
| `streammessage <index> <message>` | `stm`, `stmsg` | Manage Messages | Set a stream's online message; an empty message resets it |
| `streamofflinemessage <index> <message>` | `stofmsg`, `stoffline` | Manage Messages | Set a stream's offline message; an empty message resets it |
| `streamtemplate [template]` | `stt`, `sttemplate` | Manage Messages | Show the global template and placeholders, set a new one, or `reset` to clear it |
| `streamcheck <url>` | `stc` | Nobody | Report whether a stream is live right now and its viewer count |

## Tips and gotchas

- `streamadd` uses the channel you run it in. Use the dashboard if you want to pick a different channel.
- Stream numbers come from `streamlist` and start at 1. They shift when a stream is removed, so check the list before removing by number.
- The bot needs Send Messages and Embed Links in the notification channel. Alerts to a channel it cannot see are skipped with a log entry.
- If your server has the Twitch Bot connected with a go-live channel set for the same Twitch channel, that integration takes over and Stream Alerts stays silent for it, so you do not get two posts.
- YouTube data is scraped rather than read from an API. Titles, categories and viewer counts may be missing or read as `Live Stream`.
- Streams whose lookups keep failing for twelve hours are removed automatically. If a streamer renames their channel, follow the new URL.
