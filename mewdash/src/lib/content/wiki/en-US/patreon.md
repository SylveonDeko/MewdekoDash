---
title: Patreon
slug: patreon
summary: Connect a Patreon campaign, give supporters Discord roles that match their tier, and post a monthly thank you with live supporter and revenue numbers.
icon: fa-heart
category: Community
dashboard: /dashboard/patreon
module: Patreon
tags: [patreon, supporters, patrons, donations, premium, tier roles, role sync, announcement, oauth]
related: [administration, utility]
---

## What it does

A server owner who runs a Patreon campaign links it to the bot by signing in with their creator account. From then on the bot pulls the campaign's tiers and supporters, keeps them in sync, and can hand out Discord roles based on how much each supporter pledges. When a supporter's Discord account is known to Patreon, the link is automatic; otherwise staff can link a member to a Patreon user by hand.

Once a month, on a day you choose, the bot can post an announcement in a channel thanking supporters. The message can be plain text or an embed and can include live figures such as the active supporter count, monthly revenue and how many people joined this month. There is also a recognition command that posts a shout out for anyone who became a supporter in the last week.

The dashboard handles the whole flow: connecting, viewing supporters and tiers, mapping tiers to roles, and editing the announcement settings. Commands cover the same ground plus stats and leaderboards in chat.

## Why you would use it

- Supporters should get a coloured role and access to patron only channels without staff checking Patreon by hand.
- Tiers change roles automatically when someone upgrades, downgrades or stops pledging.
- You want a recurring "thank you to our 40 supporters" post that stays accurate without editing numbers.
- Staff want a quick view of who supports and at what level from inside Discord.

## Connecting a campaign

Connecting uses Patreon's OAuth flow. The dashboard's **Connect Your Patreon** card, or the bot owner only `patreonsync` command, produces an "Authorize with Patreon" link. Sign in with the account that owns the campaign, approve the requested access, and Patreon sends you back to the dashboard's Patreon page. The bot exchanges the code for tokens, stores the first campaign it finds, and immediately runs a full sync of tiers and supporters.

The account you use must own a campaign. If it has none, the callback fails with "No Patreon campaigns found for this user".

The dashboard's **Overview** tab shows the connection status with the **Campaign ID**, **Last Sync** and **Token Expires**, plus summary cards for active **Supporters**, monthly **Revenue** and the **Campaign Creator**. Tokens are refreshed automatically when they expire; **Quick Actions** on the same tab are **Sync All Data**, **Sync Roles**, **Send Announcement** and **Re-login**. Re-login disconnects the campaign: it clears the tokens but keeps your channel, message and mapping settings so you can reconnect. The page header also has **Refresh Data** and **Sync Supporters** buttons.

> [!NOTE]
> Patreon integration has to be enabled by the bot's host. If the bot has no Patreon client ID configured, the connect button and `patreonsync` report that the integration is not configured.

## Supporters and syncing

A sync fetches every member of the campaign with their pledge amount, status and, where the supporter has connected Discord to Patreon, their Discord user ID. Active supporters are those Patreon reports as active or with a current pledge. The **Supporters** tab lists them with **Name** (and email where Patreon provides one), **Pledge**, **Joined** and **Status**, and the **Sync Supporters** button at the top of the page refreshes the list.

`patreonsupporters` shows up to 15 active supporters in chat with their pledge and Discord mention, `patreontop [count]` ranks the top 1 to 20 by pledge, `patreonstats` summarises supporter count, linked count, total and average revenue and tier count, and `patreonanalytics` adds former supporters, lifetime revenue, new supporters this month and tier distribution.

If a supporter's Discord account is not attached on Patreon's side, use `patreonlink @member <patreonUserId>` to link them manually. The Patreon user ID is the numeric ID of the supporter's Patreon account; the dashboard's supporter list does not display it.

## Tier to role mapping

Each Patreon tier can be mapped to one Discord role. On the **Tier Mapping** tab, pick a **Patreon Tier** and a **Discord Role** and save. The **Available Tiers** list shows every published tier with its price and whether it is mapped. In chat, `patreontiermap <tierId> @role` does the same; get tier IDs from `patreonroles`.

Role sync is off until you turn it on with `patreonrolesync` or the **Enable Role Sync** checkbox. When on, the bot works out which role a supporter should have: the highest priced mapped tier whose amount is at or below their pledge. Any other mapped Patreon roles they hold are removed, and the target role is added. A supporter who stops pledging loses all mapped roles.

Sync happens when a member is linked and when you run `patreonsyncall` or the dashboard's sync roles action. Only supporters with a known Discord ID can be synced.

> [!PERMISSION]
> The bot needs Manage Roles and its own role must sit above every mapped role. Roles above the bot are skipped.

## Monthly announcements

Set a channel with `patreonch #channel` or the **Announcement Channel** selector, and a day with `patreonday <1..28>` or **Announcement Day (1-28)**. The day is capped at 28 so February never skips a month. Announcements are off until you run `patreontoggle` or tick **Enable Announcements**.

The bot checks every hour. On the chosen day, if it has not announced yet this month, it posts and records the time. If the bot was offline on the day, it catches up at startup as long as the day has already passed this month. `patreonannounce` posts one immediately, which also counts as this month's post.

Without a custom message the bot posts a default thank you that includes the active supporter count and monthly revenue. Set your own with `patreonmsg <text or embed code>` or the dashboard's announcement message editor. The text runs through the embed parser. Use `-` to go back to the default.

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

The dashboard has four tabs: **Overview**, **Supporters**, **Tier Mapping** and **Configuration**.

| Setting | Default | What it controls |
| --- | --- | --- |
| Announcement Channel | none | Where the monthly post goes; none means announcements are disabled |
| Announcement Day (1-28) | none | Day of the month to post; announcements do not fire until one is set |
| Announcement message | built in thank you | Custom text or embed with the placeholders above |
| Enable Announcements | off | Whether the monthly post is sent |
| Enable Role Sync | off | Whether mapped roles are applied to supporters |
| Tier mappings | none | Which role each tier grants |

## Setup walkthrough

1. Open **Patreon** in the dashboard and click the connect button. Sign in with the campaign owner's account and approve access.
2. Wait for the first sync, then check the **Supporters** tab shows your patrons.
3. On **Tier Mapping**, map each tier to a role. Create the roles first and put the bot's role above them.
4. Tick **Enable Role Sync**, then run `patreonsyncall` to apply roles to everyone already linked.
5. On **Configuration**, choose the **Announcement Channel** and **Announcement Day**, write a message with the placeholders, and tick **Enable Announcements**.
6. Run `patreonannounce` once to see the result in the channel.

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
- Reconnecting with a different Patreon account switches the campaign but keeps old mappings, so review the **Tier Mapping** tab afterwards.
