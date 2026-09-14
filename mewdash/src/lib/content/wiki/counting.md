---
title: Counting
slug: counting
summary: Turn a channel into a counting game where members take turns posting the next number, with reactions, streaks, leaderboards, save points and optional punishments for breaking the count.
icon: fa-list-numeric
category: Community
dashboard: /dashboard/counting
module: Counting
tags: [counting, count, numbers, game, channel, leaderboard, streak, milestones, save point]
related: [administration, xp]
---

## What it does

Staff pick a channel and run `countingsetup`. From then on the bot watches every message in that channel. If a message is the next expected number, the bot reacts with a tick and records the count for that member. If it is the wrong number, the bot reacts with a cross and, by default, deletes the message two seconds later so the channel stays clean.

The bot keeps a current number, the highest number ever reached, the total number of counts and who counted last. By default the same member may not count twice in a row, so the game needs at least two people. Members can check their own stats, streaks and accuracy, and there is a per-channel leaderboard.

For staff there are save points that let you roll the count back after a bad run, a moderation layer that tracks wrong counts per member inside a time window and applies tiered punishments, counting bans and timeouts, and role rules for who may take part. Several channels can run counting at the same time, each with its own settings.

## Why you would use it

- A low-effort community game that runs itself and gives members a shared goal.
- Big servers can add a cooldown and the no-repeat rule so one person cannot farm the count.
- Staff can restore the count from a save point instead of arguing about who broke it.
- Repeat offenders who keep breaking the count on purpose can be muted or banned from counting automatically.

## How a count is checked

When a member posts in a counting channel the bot runs these checks in order:

1. Members who are banned from counting are ignored entirely.
2. Members with a banned role, or without one of the required roles, or with an ignored role, are skipped. Ignored-role messages are deleted if you asked for that.
3. If the message looks like a valid number, the bot tests that it can react to it. If the reaction fails, the bot treats it as the member blocking the bot, deletes the message and posts a short warning that disappears after five seconds.
4. A member still on **Cooldown** is rejected.
5. If **Allow repeated users** is off and the same member counted last, the message is rejected.
6. The text is parsed with the channel's pattern. Anything that is not a number is handled by the non-number rules below.
7. The number must equal the current number plus the **Increment**. A wrong number counts as an error for that member, and if **Reset count on error** is on the channel resets to the start number.
8. If **Max Number** is set and the number passes it, the count stops and staff are notified.

A correct count updates the channel, the member's stats and streak, starts their cooldown, checks milestones and logs the event.

Successful counts get the **Success Emote** reaction (a tick by default) and failures get the **Error Emote** (a cross by default). Both can be a standard emoji or a custom emote.

## Counting patterns

The pattern decides how members must write numbers. The bot parses these patterns:

| Pattern | Members type |
| --- | --- |
| Normal | Plain digits: `1`, `2`, `3`. With a **Number Base** other than 10 the digits are read in that base. |
| Roman | Roman numerals: `I`, `II`, `III`, `IV` |
| Binary | `1`, `10`, `11`, `100` |
| Hexadecimal | `1` to `9`, then `A`, `B`, `C` |
| Words | Written words such as `twenty-one` or `one hundred and five` |
| Ordinal | `1st`, `2nd`, `3rd`, `4th` |
| Fibonacci | The Fibonacci sequence: `1`, `1`, `2`, `3`, `5`, `8` |
| Primes | Prime numbers only: `2`, `3`, `5`, `7`, `11` |

Normal is the default. The pattern is set from the dashboard; there is no command for it.

> [!WARNING]
> The **Counting Pattern** dropdown on the dashboard currently lists Sequential, Skip Multiples, Fibonacci, Primes and Powers of Two, and its values do not line up with the bot's pattern list above. Only Sequential (Normal) is safe to pick from the dashboard for now.

## Milestones

The bot records a milestone the first time the count lands on a multiple of 100, 500, 1,000, 5,000 or 10,000. Milestones show in the **Statistics** tab and in `countingstatus`.

The dashboard's **Management** tab and `countingmilestones` let you store a custom list of milestone numbers per channel, the same tab and `countingmilestonemessage` store a milestone message, and `countingmilestonechannel` stores a milestone announcement channel. These values are stored, but the bot does not post a milestone announcement yet, so treat them as reserved for a future version.

## Stats and leaderboards

Every member has per-channel stats: contributions, current streak, highest streak, accuracy, errors, total numbers counted and last contribution. `countingstats` shows them with the member's rank.

`countingleaderboard` and the **Leaderboard** tab sort by one of four types:

| Type | Ranked by |
| --- | --- |
| `contributions` | Number of correct counts (default) |
| `streak` | Highest streak |
| `accuracy` | Correct counts as a percentage |
| `totalnumbers` | Total numbers counted |

The command shows the top 20, ten per page.

## Save points

`countingsave` stores the current number with an optional reason and gives you a save ID. `countingrestore <id>` puts the channel back to that number after a confirmation prompt. `countingreset` sets the count to any number directly, with a confirmation, and defaults to 0. All three are also on the **Management** tab.

## Moderation

Counting moderation is off until you enable it, either per channel with `countmodenable true` or server-wide with `countmoddefaults true`. Channel settings override the server defaults; `countmodreset` puts a channel back on the defaults.

When it is on, each wrong number is logged against the member and added to their wrong-count tally for the **time window** (default 24 hours, 1 to 168). Tiered punishments fire when a member's tally hits an exact number: `countmodpunish 3 Mute 30` mutes for 30 minutes on the third wrong count. Tiers set with a channel apply to that channel; tiers set without one are server defaults, and channel tiers win. `Softban`, `Kick` and `RemoveRoles` cannot take a duration, and durations cap at 49 days. `AddRole` needs a role.

Two extra rules only apply when moderation is on:

- **Non-numbers**: `countmodnonnumbers` decides whether chat messages in the channel are deleted (default yes) and whether they count as a violation (default no).
- **Edits**: `countmodedits` decides whether editing a message in the channel deletes it (default yes) and whether it counts as a violation (default no).

Role rules: **Required Roles** means a member needs at least one of them to count, **Banned Roles** blocks members who hold any of them, and `countmodignore` skips members with the listed roles and optionally deletes their messages.

`countingban`, `countingtimeout` and `countingunban` block a single member from a channel, permanently or for a duration. The **Management** tab has the same controls by user ID, plus a **Purge Channel Data** button that matches `countingdisable` with purge.

## Settings

The dashboard has five tabs: **Channels**, **Configuration**, **Statistics**, **Leaderboard** and **Management**. Pick a channel in **Channels** first; the other tabs act on that channel.

| Setting | Default | What it controls |
| --- | --- | --- |
| Start Number | 1 | The number the count starts from, set at setup |
| Increment | 1 | How much each count adds; must be positive |
| Counting Pattern | Normal | How numbers are written, see above |
| Number Base | 10 | Base used by the Normal pattern |
| Cooldown (seconds) | 0 | Wait between two counts by the same member, 0 to 300 |
| Max Number | 0 (unlimited) | Count stops when this is passed |
| Success Emote | tick | Reaction on a correct count |
| Error Emote | cross | Reaction on a wrong count |
| Allow repeated users | Off | Let one member count twice in a row |
| Reset count on error | Off | Wrong number resets the channel to the start |
| Delete wrong messages | On | Delete wrong numbers after two seconds |
| Enable achievements | On | Stored flag shown in `countingconfig` |
| Enable competitions | On | Stored flag shown in `countingconfig` |
| Required Roles | none | Members need one of these to count |
| Banned Roles | none | Members with these cannot count |

> [!NOTE]
> The `countingfailurethreshold` command stores a value from 1 to 10 (default 3) and `countmodthreshold` stores a wrong-count threshold, but punishments only fire from the tiers you set with `countmodpunish`.

## Setup walkthrough

1. Create a channel and give the bot View Channel, Send Messages, Add Reactions, Manage Messages and Read Message History there.
2. Open **Counting** in the dashboard, pick the channel under **Setup New Counting Channel**, set **Start Number** and **Increment**, and save.
3. In **Configuration**, set a **Cooldown** if you want to slow the game down, and choose emotes.
4. Optionally add **Required Roles** or **Banned Roles**.
5. If you want automatic punishments, run `countmodenable true` in the channel and add tiers with `countmodpunish`.
6. Post `1` from one account and `2` from another to confirm the reactions work.

## Commands

Run these with your server's prefix (`.` unless you changed it).

| Command | Aliases | Needs | Purpose |
| --- | --- | --- | --- |
| `countingsetup [#channel] [start] [increment]` | `csetup`, `countsetup` | Manage Channels | Start counting in a channel |
| `countingstatus [#channel]` | `cstatus`, `countstatus` | Nobody | Current number, record, totals and active rules |
| `countingconfig [#channel]` | `cconfig`, `countconfig` | Manage Channels | Show the channel's configuration |
| `countingreset [#channel] [number] [reason]` | `creset`, `countreset` | Manage Messages | Reset the count, default 0, with confirmation |
| `countingstats [@user] [#channel]` | `countstats` | Nobody | A member's counting stats and rank |
| `countingleaderboard [type] [#channel]` | `cleaderboard`, `countleaderboard`, `clb` | Nobody | Top 20 by contributions, streak, accuracy or totalnumbers |
| `countingsave [#channel] [reason]` | `csave`, `countsave` | Manage Messages | Create a save point |
| `countingrestore <saveId> [#channel]` | `crestore`, `countrestore` | Manage Messages | Roll back to a save point |
| `countingdisable [#channel] [purge] [reason]` | `cdisable`, `countdisable` | Manage Channels | Stop counting; `true` also purges all data |
| `countinglist` | `clist`, `countlist` | Manage Channels | List active counting channels |
| `countingban <@user> [#channel] [duration] [reason]` | `cban`, `countban` | Manage Messages | Ban a member from counting, permanently unless a duration is given |
| `countingunban <@user> [#channel] [reason]` | `cunban`, `countunban` | Manage Messages | Lift a counting ban |
| `countingtimeout <@user> <duration> [#channel] [reason]` | `ctimeout`, `counttimeout` | Manage Messages | Temporary counting ban |
| `countingcooldown [#channel] [seconds]` | `ccooldown`, `countcooldown` | Manage Channels | Show or set the cooldown, 0 to 300 |
| `countingmilestones [#channel] [50,100,...]` | `cmilestones`, `countmilestones` | Manage Channels | Show, set, or `-` to reset custom milestone numbers |
| `countingsuccessmessage [#channel] [text]` | `csuccessmessage`, `countsuccessmessage` | Manage Channels | Store a success template, `-` resets |
| `countingfailuremessage [#channel] [text]` | `cfailuremessage`, `countfailuremessage` | Manage Channels | Store a failure template, `-` resets |
| `countingmilestonemessage [#channel] [text]` | `cmilestonemessage`, `countmilestonemessage` | Manage Channels | Store a milestone template, `-` resets |
| `countingmilestonechannel [#counting] [#target]` | `cmilestonechannel`, `countmilestonechannel` | Manage Channels | Store a milestone channel, none to clear |
| `countingfailurechannel [#counting] [#target]` | `cfailurechannel`, `countfailurechannel` | Manage Channels | Store a failure log channel, none to clear |
| `countingfailurethreshold [#channel] [1-10]` | `cfailurethreshold`, `countfailurethreshold` | Manage Channels | Show or set the failure threshold |
| `countmodshow [#channel]` | `cmshow`, `countmoderationshow` | Manage Channels | Show moderation config and server defaults |
| `countmoddefaults <on/off> [threshold] [hours] [punishment] [minutes] [@role]` | `cmdefaults`, `countmoderationdefaults` | Administrator | Server-wide moderation defaults |
| `countmodenable <on/off> [#channel]` | `cmenable`, `countmoderationenable` | Manage Channels | Turn moderation on or off for a channel |
| `countmodthreshold <1-100> [#channel]` | `cmthreshold`, `countmoderationthreshold` | Manage Channels | Set the channel's wrong-count threshold |
| `countmodwindow <1-168> [#channel]` | `cmwindow`, `countmoderationwindow` | Manage Channels | Hours a wrong count stays on record |
| `countmodpunishment <action> [minutes] [@role] [#channel]` | `cmpunishment`, `countmoderationpunishment` | Manage Channels | Set the channel's default punishment |
| `countmodpunish <count> <action> [minutes] [@role] [#channel]` | `cmpunish`, `countmoderationpunish` | Manage Channels | Punishment at an exact wrong count; no channel means server default |
| `countmodunpunish <count> [#channel]` | `cmunpunish`, `countmoderationunpunish` | Manage Channels | Remove a tier |
| `countmodpunishlist [#channel]` | `cmpunishlist`, `countmoderationpunishlist` | Manage Channels | List tiers |
| `countmodignore <delete> [#channel] [@roles...]` | `cmignore`, `countmoderationignore` | Manage Channels | Roles the bot ignores, optionally deleting their messages |
| `countmodrequired [#channel] [@roles...]` | `cmrequired`, `countmoderationrequired` | Manage Channels | Roles needed to count |
| `countmodbanned [#channel] [@roles...]` | `cmbanned`, `countmoderationbanned` | Manage Channels | Roles that cannot count |
| `countmodnonnumbers <punish> [delete] [#channel]` | `cmnonnumbers`, `countmoderationnonnumbers` | Manage Channels | Rules for chat in the channel |
| `countmodedits <punish> [delete] [#channel]` | `cmedits`, `countmoderationedits` | Manage Channels | Rules for edited messages |
| `countmodreset [#channel]` | `cmreset`, `countmoderationreset` | Manage Channels | Channel goes back to server defaults |
| `countmodclear <@user> [#channel]` | `cmclear`, `countmoderationclear` | Manage Messages | Clear a member's wrong counts |
| `countmodclearall [#channel]` | `cmclearall`, `countmoderationclearall` | Manage Messages | Clear everyone's wrong counts |

## Tips and gotchas

- The bot needs Add Reactions in the channel. Without it nothing gets a tick or cross, and valid counts are skipped by the bot-block test.
- Deleting wrong numbers and non-number chat needs Manage Messages.
- Members who have the bot blocked cannot count: their number is deleted and a warning is posted.
- With the default no-repeat rule, a member posting twice in a row is rejected before the number is even read, and that rejection does not count as an error.
- **Reset count on error** resets to the start number, so with a start of 1 the next expected number is 1 again.
- Moderation punishments use the same actions as the warning system (Mute, Ban, Kick, AddRole and so on), so the bot needs the matching Discord permissions and a mute role.
- `countingdisable` with purge removes stats, bans and save points for that channel and cannot be undone. Disabling without purge keeps the data.
