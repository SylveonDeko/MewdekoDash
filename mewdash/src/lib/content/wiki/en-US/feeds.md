---
title: Feeds
slug: feeds
summary: Subscribe a channel to an RSS or Atom feed and have the bot post every new item, either as a default embed or in a message you design yourself.
icon: fa-newspaper
category: Actions
dashboard: /dashboard/feeds
module: Searches
tags: [rss, atom, feed, news, blog, youtube, updates, subscriptions, feedadd]
related: [embedbuilder, utility]
---

## What it does

You give the bot a feed URL and a channel. From then on the bot checks the feed regularly and posts anything published since the last check. Members see a new message in the channel each time the site publishes something, with the item's title, a link, and, where the feed provides one, the description and an image.

Staff can subscribe up to ten feeds per server and can give each one its own message. The message is run through the embed parser, so a feed update can be plain text, an embed, or an embed with buttons, and it can use placeholders that pull the item's title, link, author, and so on.

Nothing is required from members. They just read the channel.

## Why you would use it

- Post your community's blog, patch notes, or changelog into an announcements channel automatically.
- Mirror a news site or subreddit feed into a discussion channel.
- Follow a YouTube channel or podcast through its RSS feed.
- Keep a status or release feed visible without anyone copying links by hand.

## How updates are posted

The bot loops over every subscribed feed URL, fetches it, and waits about ten seconds before starting the next pass. On the first fetch after startup it records the date of the newest item and posts nothing. After that, every item with a publish date newer than the last one it saw is posted, oldest first, and the recorded date moves forward. For Atom feeds the item's updated date is used when there is no publish date. Items with neither are ignored.

There is no limit on how many items go out in one pass, so a feed that dumps twenty back-dated entries at once will produce twenty messages.

Feeds that fail to load are skipped silently until the next pass. They are not removed and the bot does not report the failure.

### The default message

If a feed has no custom message, the bot sends an embed with:

| Part | Value |
| --- | --- |
| Title | The item's title, cut to 256 characters |
| Description | The item's description with HTML stripped, cut to 2048 characters |
| URL | The item's link, so the title is clickable |
| Image | An image enclosure from the feed, or an Atom `preview` or `thumbnail` element if present |
| Footer | The feed URL |

### Custom messages and placeholders

Set a custom message with `feedmessage` or the **Edit Message** button on the dashboard. The text goes through the embed parser, so anything from the [embed builder](/wiki/embedbuilder) works: plain text, embed JSON, or both. Role and user mentions in the plain text part will ping.

These placeholders are replaced in the custom message, on top of the general server, channel, and bot placeholders from the placeholders page.

| Placeholder | Value |
| --- | --- |
| `%title%` | The item's title |
| `%author%` | The item's author, or "Unknown" |
| `%content%` | The item's description with HTML removed |
| `%url%` | Link to the item |
| `%feedurl%` | The feed's own URL |
| `%image_url%` | The item's image if the feed supplies one, otherwise the feed's image |
| `%categories%` | The item's categories, comma separated |
| `%timestamp%` | The publish date as a Discord timestamp |

> [!EXAMPLE]
> `feedmessage 1 New post: **%title%** by %author%
> %url%`

Set the message to `-` to go back to the default embed.

## Settings

Feeds have no server-wide settings. Each subscription has a channel and URL, chosen when it is added, plus an optional message. The dashboard page is called **RSS Feeds** and has three tabs.

| Tab | What it shows |
| --- | --- |
| RSS Feeds | Every subscription with its channel, URL, and date added. **Edit Message** or **Add Custom Message** opens a text box; a preview of the message renders under it. **Delete** removes the feed after a confirmation. |
| Add Feed | A **Channel** picker and an **RSS Feed URL** box, with an **Add RSS Feed** button |
| Statistics | **Total Feeds**, **Unique Feeds**, **Channels**, and a **Feeds by Channel** breakdown |

The channel and URL of an existing feed cannot be changed. Remove the feed and add it again.

## Setup walkthrough

1. Open **Feeds** in the dashboard and switch to **Add Feed**.
2. Pick the **Channel** the updates should go to.
3. Paste the feed address into **RSS Feed URL** and press **Add RSS Feed**. It must be a full `http` or `https` address to an RSS or Atom document, not the site's home page.
4. Back on **RSS Feeds**, press **Add Custom Message** if you want your own wording, then **Save**.
5. Run `feedtest 1` in Discord to post the newest item and check the result. The number is the feed's position in `feedlist`.

## Commands

Run these with your server's prefix (`.` unless you changed it). All feed commands need Manage Messages.

| Command | Aliases | Needs | Purpose |
| --- | --- | --- | --- |
| `feedadd <url> [#channel]` | `rss` | Manage Messages | Subscribe a channel to a feed. Defaults to the current channel. The bot fetches the feed first and rejects it if it cannot be read. |
| `feedlist` | `feeds` | Manage Messages | List subscriptions, numbered, ten per page |
| `feedremove <number>` | `feedrm`, `feeddel` | Manage Messages | Remove a subscription by its number in the list |
| `feedmessage <number> <message>` | `rssmessage` | Manage Messages | Set the custom message for a subscription |
| `rsstest <number>` | `feedtest` | Manage Messages | Post the feed's newest item in the current channel |

## Tips and gotchas

- The limit is ten feeds per server, and the same URL cannot be added twice. `feedadd` reports one combined error for an unreadable link, a duplicate, and the limit, so check `feedlist` if you are not sure which it was.
- Adding a feed through the dashboard does not test the URL first. Use `feedtest` afterwards to make sure the bot can read it.
- Numbers in `feedremove`, `feedmessage`, and `feedtest` come from `feedlist`, which orders feeds by when they were added.
- The bot needs Send Messages and Embed Links in the target channel. Without Embed Links the default embed will not appear.
- Only items with a publish date (or, for Atom, an updated date) are posted. A feed whose entries have no dates will never produce updates.
- The bot posts nothing on its first pass after a restart. It starts from the newest item at that moment, so items published while the bot was offline are not caught up.
- Since a custom message uses the embed parser, keep the same rules as the embed builder: valid JSON, or plain text.
