---
title: Patreon
slug: patreon
summary: Connect a Patreon campaign so supporters get Discord roles that match their tier
icon: fa-heart
category: Community
dashboard: /dashboard/patreon
module: Patreon
tags: [patreon, supporters, patrons, donations, premium, tier roles, role sync, announcement, oauth]
related: [administration, utility]
---

## What it does

A server owner who runs a Patreon campaign links it to the bot by signing in with their creator account. From then on the bot pulls the campaign's tiers and supporters and keeps them in sync. It can also hand out Discord roles based on how much each supporter pledges. When a supporter's Discord account is known to Patreon, the link is automatic; otherwise staff can link a member to a Patreon user by hand.

Once a month, on a day you choose, the bot can post an announcement in a channel thanking supporters. The message can be plain text or an embed and can include live figures such as the active supporter count and monthly revenue. It can also say how many people joined this month. There is also a recognition command that posts a shout out for anyone who became a supporter in the last week.

The dashboard handles the whole flow: connecting, viewing and linking supporters, mapping tiers to roles, and editing the announcement settings. Commands cover the same ground plus stats and leaderboards in chat.

## Why you would use it

- Supporters should get a coloured role and access to patron only channels without staff checking Patreon by hand.
- Tiers change roles automatically when someone changes tier or stops pledging.
- You want a recurring "thank you to our 40 supporters" post that stays accurate without editing numbers.
- Staff want a quick view of who supports and at what level from inside Discord.

## Connecting a campaign

Connecting uses Patreon's OAuth flow. Until a campaign is connected the page shows only the **Connect your Patreon** card with a **Connect to Patreon** button. That button, or the bot owner only `patreonsync` command, produces an "Authorize with Patreon" link. Sign in with the account that owns the campaign and approve the requested access. Patreon then sends you back to the dashboard's Patreon page. The bot exchanges the code for tokens and stores the first campaign it finds, then immediately runs a full sync of tiers and supporters.

The account you use must own a campaign. If it has none, the callback fails with "No Patreon campaigns found for this user".

Once connected, the page has four tabs: **Overview**, **Supporters**, **Tiers** and **Settings**. The **Overview** tab opens with a **Connected** card showing the campaign creator, their patron count, a **View Patreon profile** link, the **Campaign ID** and when the **Token expires**. A **Supporters** card shows **Active**, **Monthly**, **Average pledge**, **New this month**, **Former**, **Lifetime** and **Linked** (linked out of total), plus **Top supporters**. Tokens are refreshed automatically when they expire. The **Quick actions** card has **Sync supporters**, **Sync all data**, **Sync roles**, **Send announcement now** and **Refresh token**, and a red **Reconnect** button. Reconnect signs the bot out of Patreon after confirmation but keeps your channel, message and mapping settings so you can connect again. The page header also has a **Refresh data** button.

> [!NOTE]
> Patreon integration has to be enabled by the bot's host. If the bot has no Patreon client ID configured, the connect button and `patreonsync` report that the integration is not configured.

## Supporters and syncing

A sync fetches every member of the campaign with their pledge amount and status. Where the supporter has connected Discord to Patreon, their Discord user ID is included too. Active supporters are those Patreon reports as active or with a current pledge. The **Supporters** tab lists every supporter under a **Supporters (N)** heading with their name, tier, pledge, status (**Active**, **Declined** or **Former**) and pledge start date, and its **Sync** button refreshes the list. Linked supporters show the Discord member they are linked to. Email addresses are never shown on the dashboard.

`patreonsupporters` shows up to 15 active supporters in chat with their pledge and Discord mention, `patreontop [count]` ranks the top 1 to 20 by pledge, `patreonstats` summarises supporter count, linked count, total and average revenue and tier count, and `patreonanalytics` adds former supporters, lifetime revenue, new supporters this month and tier distribution.

If a supporter's Discord account is not attached on Patreon's side, use `patreonlink @member <patreonUserId>` to link them manually. On the dashboard, use the link button on a supporter's row, pick the member and press **Link**; the unlink button on a linked supporter undoes it. The Patreon user ID is the numeric ID of the supporter's Patreon account.

## Tier to role mapping

Each Patreon tier can be mapped to one Discord role. The **Tiers** tab has a **Tier roles** card listing every published tier with its price. Each tier has its own role picker; choose a role to map it and clear the picker (**No role**) to remove the mapping. If no tiers show, publish tiers on Patreon and sync. In chat, `patreontiermap <tierId> @role` does the same; get tier IDs from `patreonroles`.

Role sync is off until you turn it on with `patreonrolesync` or the switch on the **Role sync** card on the **Settings** tab. When on, the bot works out which role a supporter should have: the highest priced mapped tier whose amount is at or below their pledge. Any other mapped Patreon roles they hold are removed, and the target role is added. A supporter who stops pledging loses all mapped roles.

Sync happens when a member is linked. Running `patreonsyncall` or pressing **Sync roles** on the **Overview** tab also starts one. Only supporters with a known Discord ID can be synced.

> [!PERMISSION]
> The bot needs Manage Roles and its own role must sit above every mapped role. Roles above the bot are skipped.

## Monthly announcements

Set a channel with `patreonch #channel` or the **Channel** selector, and a day with `patreonday <1..28>` or **Day of the month (1-28)**. The day is capped at 28 so February never skips a month. Announcements are off until you run `patreontoggle` or switch on the **Monthly announcement** card. Setting a channel switches announcements on and clearing it switches them off.

The bot checks every hour. On the chosen day, if it has not announced yet this month, it posts and records the time. If the bot was offline on the day, it catches up at startup as long as the day has already passed this month. `patreonannounce` posts one immediately, which also counts as this month's post.

Without a custom message the bot posts a default thank you that includes the active supporter count and monthly revenue. Set your own with `patreonmsg <text or embed code>` or the message editor on the **Monthly announcement** card, which shows a preview and lists the placeholders. The text runs through the embed parser. Use `-` to go back to the default.

### Placeholders

These work in the announcement message alongside the usual server and channel placeholders.

| Placeholder | Value |
| --- | --- |
| `%month%` | Current month name |
| `%year%` | Current year |
| `%patreon.link%` | `https://patreon.com` |
| `%supporter.count%` | Active supporters |
| `%supporter.total%` | All supporters ever recorded |
| `%supporter.new%` | New supporters this month |
| `%supporter.former%` | Former supporters |
| `%supporter.linked%` | Supporters with a linked Discord account |
| `%revenue.monthly%` | Current monthly pledges |
| `%revenue.average%` | Average pledge |
| `%revenue.lifetime%` | Lifetime revenue |
| `%growth.new%` | New supporters this month |
| `%top.supporter.name%` | Highest pledging supporter |
| `%top.supporter.amount%` | Their pledge |
| `%patron.name%` | Highest pledging supporter, same as `%top.supporter.name%` |
| `%patron.tier%` | The tier that supporter is on, or "Unknown" if Patreon has not reported one |
| `%patron.amount%` | Their monthly pledge, same as `%top.supporter.amount%` |
| `%tiers.count%` | Number of tiers |
| `%tier.popular%` | Tier with the most supporters |
| `%tier.popular.count%` | How many are on it |
| `%supporters.summary%` | Ready made sentence about supporter count |
| `%revenue.summary%` | Ready made sentence about revenue |
| `%growth.summary%` | Ready made sentence about growth |

> [!EXAMPLE]
> `It's %month%! Thanks to %supporters.summary%%revenue.summary%!%growth.summary%` renders as "It's December! Thanks to our 25 incredible supporters who help us raise $150/month! We gained 3 new supporters this month!"

## Recognising new supporters

`patreonrecognize [#channel]` posts a welcome embed for supporters whose pledge started within the last seven days, up to five per run, in the given channel or the current one. It is a manual command, not a schedule, so run it after a sync. Running it twice posts the same people twice.

## Settings

The **Settings** tab has two cards, **Monthly announcement** and **Role sync**. Settings save as you change them.

| Setting | Default | Where | What it controls |
| --- | --- | --- | --- |
| Monthly announcement switch | off | Monthly announcement | Whether the monthly post is sent |
| Channel | none | Monthly announcement | Where the monthly post goes; none means announcements are disabled |
| Day of the month (1-28) | 1 shown, none stored | Monthly announcement | Day of the month to post |
| Announcement message | built in thank you | Monthly announcement | Custom text or embed with the placeholders above |
| Send announcement now | button | Monthly announcement | Posts immediately; needs a channel |
| Role sync switch | off | Role sync | Linked supporters get the role mapped to their tier |
| Tier roles | none | Tiers tab | Which role each tier grants |

## Setup walkthrough

1. Open **Patreon** in the dashboard and press **Connect to Patreon**. Sign in with the campaign owner's account and approve access.
2. Wait for the first sync, then check the **Supporters** tab shows your patrons.
3. On **Tiers**, map each tier to a role in the **Tier roles** card. Create the roles first and put the bot's role above them.
4. On **Settings**, switch on the **Role sync** card, then run `patreonsyncall` or press **Sync roles** under **Quick actions** on **Overview** to apply roles to everyone already linked.
5. Still on **Settings**, in **Monthly announcement**, choose the **Channel** and **Day of the month (1-28)**, write a message with the placeholders, and switch the card on.
6. Press **Send announcement now** once to see the result in the channel.

## Commands

Run these with your server's prefix (`.` unless you changed it).

| Command | Aliases | Needs | Purpose |
| --- | --- | --- | --- |
| `patreonsync` | `ptsync` | Bot owner | Post the OAuth authorise link |
| `patreonch [#channel]` | `ptch` | Administrator | Show or set the announcement channel |
| `patreondisable` | `ptdisable` | Administrator | Clear the channel, disabling announcements |
| `patreonmsg [text]` | `ptmsg` | Administrator | Show or set the announcement message, `-` to reset |
| `patreonday [day]` | `ptday` | Administrator | Show or set the day of the month |
| `patreontoggle` | `pttoggle` | Administrator | Turn announcements on or off |
| `patreonconfig` | `ptconfig` | Administrator | Show status, channel, day, message and last post |
| `patreonannounce` | `ptannounce` | Administrator | Send the announcement now |
| `patreonhelp` | `pthelp` | Nobody | Placeholder list and command overview |
| `patreonsupporters` | `ptsupporters` | Administrator | List active supporters |
| `patreontop [count]` | `pttop` | Nobody | Top supporters by pledge |
| `patreonstats` | `ptstats` | Administrator | Supporter and revenue summary |
| `patreonanalytics` | `ptanalytics` | Administrator | Detailed analytics |
| `patreonlink <user> <patreonUserId>` | `ptlink` | Administrator | Link a member to a Patreon user |
| `patreonrolesync` | `ptrolesync` | Manage Roles | Toggle automatic role sync |
| `patreontiermap <tierId> <role>` | `pttiermap` | Manage Roles | Map a tier to a role |
| `patreonroles` | `ptroles` | Administrator | List tiers with their IDs and roles |
| `patreonsyncall` | `ptsyncall` | Manage Roles | Apply roles to every linked supporter |
| `patreonrecognize [#channel]` | `ptrecognize` | Administrator | Shout out supporters from the last seven days |

## Tips and gotchas

- Only supporters who connected Discord in their Patreon profile, or were linked with `patreonlink`, can receive roles.
- Role sync picks one role per supporter, the best tier their pledge covers. Stacking multiple tier roles is not supported.
- Announcements post at most once per calendar month. Running `patreonannounce` on the 3rd means the scheduled post on the 15th is skipped that month.
- The announcement day is in UTC.
- The monthly announcement is about the whole campaign, so `%patron.name%`, `%patron.tier%` and `%patron.amount%` describe the highest pledging active supporter rather than each patron in turn. Use `patreonrecognize` for per supporter shout outs.
- Reconnecting with a different Patreon account switches the campaign but keeps old mappings, so review the **Tiers** tab afterwards.
