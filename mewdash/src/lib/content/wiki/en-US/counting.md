---
title: Counting
slug: counting
summary: Turns a channel into a counting game where members take turns posting the next number
icon: fa-list-numeric
category: Community
dashboard: /dashboard/counting
module: Counting
tags: [counting, count, numbers, game, channel, leaderboard, streak, milestones, save point]
related: [administration, xp]
---

## What it does

Staff pick a channel and run `countingsetup`. From then on the bot watches every message in that channel. If a message is the next expected number, the bot reacts with a tick and records the count for that member. If it is the wrong number, the bot reacts with a cross and, by default, deletes the message two seconds later so the channel stays clean.

The bot keeps the current number and the highest number ever reached, along with the total number of counts and who counted last. By default the same member may not count twice in a row, so the game needs at least two people. Members can check their own stats, which include streaks and accuracy. There is also a per-channel leaderboard.

For staff there are save points that let you roll the count back after a bad run, and role rules for who may take part. A moderation layer tracks wrong counts per member inside a time window and applies tiered punishments, including counting bans and timeouts. Several channels can run counting at the same time, each with its own settings.

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
4. A member still on **Cooldown (seconds)** is rejected.
5. If **Allow repeated users** is off and the same member counted last, the message is rejected.
6. The text is parsed with the channel's pattern. Anything that is not a number is handled by the non-number rules below.
7. The number must equal the current number plus the **Increment**. A wrong number counts as an error for that member, and if **Reset count on error** is on the channel resets to the start number.
8. If **Max number** is set and the number passes it, the count stops and staff are notified.

A correct count updates the channel, the member's stats and streak, starts their cooldown, checks milestones and logs the event.

Successful counts get the **Success emote** reaction (a tick by default) and failures get the **Error emote** (a cross by default). Both can be a standard emoji or a custom emote.

## Counting patterns

The pattern decides how members must write numbers. The bot parses these patterns:

| Pattern | Members type |
| --- | --- |
| Normal | Plain digits: `1`, `2`, `3`. With a **Number base** other than 10 the digits are read in that base. |
| Roman | Roman numerals: `I`, `II`, `III`, `IV` |
| Binary | `1`, `10`, `11`, `100` |
| Hexadecimal | `1` to `9`, then `A`, `B`, `C` |
| Words | Written words such as `twenty-one` or `one hundred and five` |
| Fibonacci | The Fibonacci sequence: `1`, `1`, `2`, `3`, `5`, `8` |
| Primes | Prime numbers only: `2`, `3`, `5`, `7`, `11` |

Normal is the default. The pattern is set from the **Counting pattern** dropdown on the dashboard, which lists the same patterns (Normal is called Sequential there). There is no command for it.

## Milestones

The bot records a milestone the first time the count lands on one of the channel's milestone numbers. Until you set your own list the defaults are 100, 250, 500, 1,000, 2,500, 5,000 and 10,000. The **Statistics** tab shows **Milestones reached** and `countingstatus` shows them too.

The **Milestones** card on the **Settings** tab and `countingmilestones` store a custom list of milestone numbers per channel. Type a number and click **Add**, or click the X on one to remove it. With no custom list the card says it is using the default milestones. When the count reaches a milestone, the bot posts the channel's **Milestone message** if it has one.

The **Messages** card holds a **Correct count message**, a **Wrong count message** and a **Milestone message**. The first two are sent after each correct or wrong count. All three take placeholders `%number%`, `%expected%`, `%user%`, `%user.mention%`, `%server%` and `%channel%`, and can be an embed. `countingmilestonechannel` stores a milestone announcement channel that the bot does not use yet.

## Stats and leaderboards

Every member has per-channel stats: contributions, current streak, highest streak, accuracy, errors, total numbers counted and last contribution. `countingstats` shows them with the member's rank.

`countingleaderboard` and the **Leaderboard** card on the **Statistics** tab sort by one of four types:

| Type | Ranked by |
| --- | --- |
| `contributions` | Number of correct counts (default) |
| `streak` | Highest streak |
| `accuracy` | Correct counts as a percentage |
| `totalnumbers` | Total numbers counted |

The command shows the top 20, ten per page. On the page the sort dropdown reads **Contributions**, **Highest streak**, **Accuracy** or **Total numbers**, and a second dropdown picks how many entries to show: 10, 20, 50 or 100.

## Save points

`countingsave` stores the current number with an optional reason and gives you a save ID. `countingrestore <id>` puts the channel back to that number after a confirmation prompt. `countingreset` sets the count to any number directly, with a confirmation, and defaults to 0. All three are also on the **Management** tab, under **Save points** and **Reset channel**.

## Moderation

Counting moderation is off until you enable it, either per channel with `countmodenable true` or server-wide with `countmoddefaults true`. Channel settings override the server defaults; `countmodreset` puts a channel back on the defaults.

When it is on, each wrong number is logged against the member and added to their wrong-count tally for the **time window** (default 24 hours, 1 to 168). Tiered punishments fire when a member's tally hits an exact number: `countmodpunish 3 Mute 30` mutes for 30 minutes on the third wrong count. Tiers set with a channel apply to that channel; tiers set without one are server defaults, and channel tiers win. `Softban`, `Kick` and `RemoveRoles` cannot take a duration, and durations cap at 49 days. `AddRole` needs a role.

Two extra rules only apply when moderation is on:

- **Non-numbers**: `countmodnonnumbers` decides whether chat messages in the channel are deleted (default yes) and whether they count as a violation (default no).
- **Edits**: `countmodedits` decides whether editing a message in the channel deletes it (default yes) and whether it counts as a violation (default no).

Role rules: **Required roles** means a member needs at least one of them to count, and **Banned roles** blocks members who hold any of them. `countmodignore` skips members with the listed roles and optionally deletes their messages.

`countingban`, `countingtimeout` and `countingunban` block a single member from a channel, permanently or for a duration. The **Management** tab has the same controls. It also has violation stats and a **Purge channel data** card that matches `countingdisable` with purge. The moderation tiers, thresholds, window, non-number and edit rules are commands only. The dashboard has no controls for them.

## The Counting page

The page has four tabs: **Channels (N)** with the number of counting channels, **Settings**, **Statistics** and **Management**. Everything except **Channels** acts on one channel. Pick it with the channel dropdown above the tab, or open it from **Channels**. The tab and channel are kept in the URL. With no counting channel set up, those tabs say "No counting channels configured".

### Channels tab

**Setup new counting channel** has a channel picker, **Start number** (default 1, minimum 0) and **Increment** (default 1, minimum 1). Click **Setup channel** to start counting there. Channels that already count are not offered. After setup the **Settings** tab opens for the new channel.

Each counting channel then shows a card with its **Current** number, **Highest** number and **Last by**, a status of **Active**, **Inactive** or **Active - record high**, a **Settings** button and **Disable channel**. Disabling asks for confirmation and keeps the stored data. Use **Purge everything** on the **Management** tab to remove data.

### Settings tab

Settings save as you change them. The **Rules** card:

| Setting | Default | What it controls |
| --- | --- | --- |
| Counting pattern | Normal | How numbers are written, see above |
| Number base | 10 | Base used by the Normal pattern, 2 to 36 |
| Max number | 0 (unlimited) | Count stops when this is passed |
| Cooldown (seconds) | 0 | Wait between two counts by the same member, 0 to 300 |
| Allow repeated users | Off | Let one member count twice in a row |
| Reset count on error | Off | Wrong number resets the channel to the start |
| Delete wrong messages | On | Delete wrong numbers after two seconds |

The other cards:

| Card | Settings |
| --- | --- |
| Reactions | **Success emote** (tick by default) and **Error emote** (cross by default), each a standard or custom emoji |
| Role restrictions | **Required roles** and **Banned roles**, both empty by default |
| Features | **Enable achievements** and **Enable competitions**, both on by default, stored flags shown in `countingconfig` |
| Milestones | The custom milestone list, see above |
| Messages | **Correct count message**, **Wrong count message** and **Milestone message** |

### Statistics tab

Tiles for the channel: **Current number**, **Highest number**, **Total participants**, **Total errors**, **Milestones reached**, **Average accuracy**, **Last activity** and **Top contributor**. Below them is the **Leaderboard** card, see above.

### Management tab

| Card | What it does |
| --- | --- |
| Save points | Type an optional reason and click **Create save point**. Each save point shows its number, age, who saved it and why, with buttons to restore (after a confirmation) or delete it |
| Reset channel | **Reset to number** with an optional reason. Asks for confirmation. The default is 1 here, while `countingreset` defaults to 0 |
| Counting bans | Pick a member, optionally set **Minutes**, add a reason and click **Ban**. With no minutes the ban is permanent. Banned members are listed with **Unban** |
| Violations | A window dropdown (**Last 24 hours**, **Last 7 days**, **Last 30 days**) with tiles for **Total**, **Wrong counts**, **Timeouts** and **Bans**, the top violators, and a member picker with **Clear wrong count** |
| Purge channel data | **Purge everything** deletes every count, statistic, streak, ban and save point, and the channel stays configured. Asks for confirmation and cannot be undone |

> [!NOTE]
> The `countingfailurethreshold` command stores a value from 1 to 10 (default 3) and `countmodthreshold` stores a wrong-count threshold, but punishments only fire from the tiers you set with `countmodpunish`.

## Setup walkthrough

1. Create a channel and give the bot View Channel, Send Messages, Add Reactions, Manage Messages and Read Message History there.
2. Open **Counting** in the dashboard, pick the channel under **Setup new counting channel**, set **Start number** and **Increment**, and click **Setup channel**.
3. On **Settings**, set a **Cooldown (seconds)** if you want to slow the game down, and choose emotes under **Reactions**.
4. Optionally add **Required roles** or **Banned roles**.
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
