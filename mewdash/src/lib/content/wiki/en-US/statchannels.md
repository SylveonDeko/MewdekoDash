---
title: Stat Channels
slug: statchannels
summary: Voice channels whose names update to show live numbers, like your member count
icon: fa-chart-simple
category: Community
dashboard: /dashboard/statchannels
module: StatChannels
tags: [stat channels, counter, member count, live stats, voice channel stats, countdown, member goal, boost count, twitch viewers]
related: [counting, twitch, suggestions, xp, afk, starboard]
---

## What it does

A stat channel is a locked voice channel that sits at the top of your channel list and shows a number in its name, for example "Members: 12,480". The bot rewrites the name on a schedule so the number stays current. Members cannot join the channel; it exists only to be read.

You choose a counter type and a template for the name. You also set a style for the number and how often it refreshes. The bot supports several dozen counters covering server facts, presence, Nitro boosts, emoji slots, member goals and countdowns, plus values pulled from other Mewdeko features such as tickets, suggestions, giveaways, XP, counting, the starboard, and linked Twitch or Minecraft servers.

Discord only allows a channel to be renamed twice every ten minutes. Stat Channels works around that with a choice of update mechanism, including one that deletes and recreates the channel so it can refresh every minute.

## Why you would use it

- Show member counts at the top of the server, with humans and bots counted separately.
- Track progress to a member goal with a percentage or a progress bar.
- Count down to an event or a launch.
- Show Twitch live status and viewer count for a streamer's server.
- Give staff a live view of open tickets or pending suggestions without opening a dashboard.
- Display Minecraft server status and player count next to the invite link.

## Counter types

The full catalogue below is what `statchanneltypes` and the **Counters** tab list. Every type accepts the common placeholders; some add their own. Default templates begin with a matching emoji followed by the text shown.

### Members

| Type | Shows | Default template | Extra placeholders |
| --- | --- | --- | --- |
| `TotalMembers` | Every member, bots included | `Members: %count%` | |
| `HumanMembers` | Members that are not bots | `Humans: %count%` | |
| `BotCount` | Bot accounts | `Bots: %count%` | |
| `OnlineMembers` | Members with any non-offline presence | `Online: %count%` | |
| `IdleMembers` | Members marked idle | `Idle: %count%` | |
| `DndMembers` | Members marked do not disturb | `DND: %count%` | |
| `StreamingMembers` | Members with a streaming activity | `Streaming: %count%` | |
| `InVoiceMembers` | Members connected to any voice channel | `In Voice: %count%` | |
| `RoleMembers` | Members holding a chosen role | `%role.name%: %count%` | `%role.name%`, `%role.id%`, `%role.color%` |
| `NewestMember` | The most recently joined member | `Newest: %member.name%` | `%member.name%`, `%member.id%` |
| `MembersJoinedToday` | Joined in the last 24 hours | `Joined Today: %count%` | |
| `MembersJoinedWeek` | Joined in the last 7 days | `This Week: %count%` | |
| `MemberGoal` | Progress toward a target member count | `%count% / %goal%` | `%goal%`, `%goal.raw%`, `%goal.percent%`, `%goal.remaining%`, `%goal.bar%` |
| `AfkCount` | Members currently AFK through Mewdeko | `AFK: %count%` | |

### Server

| Type | Shows | Default template | Extra placeholders |
| --- | --- | --- | --- |
| `Countdown` | Time left until a target date | `%days%d %hours%h left` | `%days%`, `%hours%`, `%minutes%`, `%total.hours%` |
| `ChannelCount` | Every channel | `Channels: %count%` | |
| `TextChannelCount` | Text channels | `Text: %count%` | |
| `VoiceChannelCount` | Voice channels | `Voice: %count%` | |
| `CategoryCount` | Categories | `Categories: %count%` | |
| `StageChannelCount` | Stage channels | `Stages: %count%` | |
| `ForumChannelCount` | Forum channels | `Forums: %count%` | |
| `ThreadCount` | Threads currently cached as active | `Threads: %count%` | |
| `RoleCount` | Roles | `Roles: %count%` | |
| `BoostCount` | Active Nitro boosts | `Boosts: %count%` | |
| `BoostLevel` | Boost tier, 0 to 3 | `Level %count%` | |
| `NextBoostGoal` | Boosts still needed for the next tier | `%count% to Tier %tier.next%` | `%tier.next%`, `%tier.current%` |
| `EmojiCount` | All custom emojis | `Emojis: %count%` | |
| `AnimatedEmojiCount` | Animated custom emojis | `Animated: %count%` | |
| `StaticEmojiCount` | Static custom emojis | `Static: %count%` | |
| `StickerCount` | Custom stickers | `Stickers: %count%` | |
| `EmojiSlotsUsed` | Emoji slots used against the tier cap | `Slots: %count%/%slots.max%` | `%slots.max%`, `%slots.free%` |
| `ServerAge` | Days since the server was created | `Age: %count% days` | `%years%`, `%created%` |
| `EventCount` | Scheduled events | `Events: %count%` | |
| `BotUptime` | How long Mewdeko has been running | `Uptime: %days%d %hours%h` | `%days%`, `%hours%`, `%minutes%` |
| `InviteCount` | Invites tracked by invite tracking | `Invites: %count%` | |

### Twitch

These read from the Twitch channel linked through the Twitch module.

| Type | Shows | Default template | Extra placeholders |
| --- | --- | --- | --- |
| `TwitchLiveStatus` | Whether the channel is live | `%twitch.name%: %status%` | `%status%`, `%twitch.name%` |
| `TwitchViewers` | Current viewers | `Viewers: %count%` | `%twitch.name%` |
| `TwitchGame` | Category being streamed | `%game%` | `%game%`, `%title%`, `%twitch.name%` |
| `TwitchUptime` | How long the stream has been live | `Live %hours%h %minutes%m` | `%hours%`, `%minutes%` |
| `TwitchFollowers` | Follower total | `Followers: %count%` | `%twitch.name%` |
| `TwitchSubs` | Subscriber total | `Subs: %count%` | `%twitch.name%` |
| `TwitchCounter` | A named Twitch chat counter | `%counter.name%: %count%` | `%counter.name%` |
| `TwitchLastRaider` | The most recent raider | `Last Raid: %raider%` | `%raider%`, `%raid.viewers%` |
| `TwitchRecentStreams` | Streams started in the last 14 days | `Streams: %count%` | |

### Other Mewdeko features

| Type | Category | Shows | Default template | Extra placeholders |
| --- | --- | --- | --- | --- |
| `MinecraftPlayers` | Minecraft | Players online on a watched server | `Players: %count%/%players.max%` | `%players.max%`, `%server.version%` |
| `MinecraftStatus` | Minecraft | Whether a watched server is reachable | `%status%` | `%status%`, `%latency%` |
| `CountingCurrent` | Counting | Current number in a counting channel | `Count: %count%` | |
| `CountingRecord` | Counting | Highest number ever reached | `Record: %count%` | |
| `OpenTickets` | Tickets | Open, unarchived tickets | `Open Tickets: %count%` | |
| `TicketsToday` | Tickets | Tickets opened in the last 24 hours | `Today: %count%` | |
| `PendingSuggestions` | Suggestions | Suggestions awaiting a decision | `Pending: %count%` | |
| `ActiveGiveaways` | Giveaways | Giveaways currently running | `Giveaways: %count%` | |
| `StarboardPosts` | Starboard | Total starboard posts | `Starred: %count%` | |
| `TopXpUser` | XP | The member with the most XP | `Top: %member.name%` | `%member.name%`, `%member.id%`, `%member.xp%` |
| `TotalGuildXp` | XP | All XP earned in the server | `Total XP: %count%` | |
| `TotalCurrency` | Currency | Currency held by members | `In Circulation: %count%` | |
| `ActivePolls` | Polls | Polls accepting votes | `Polls: %count%` | |
| `Clock` | Server | The date and time in the server's timezone | `%time% %tz%` | `%time%`, `%date%`, `%datetime%`, `%weekday%`, `%tz%` |
| `MessagesToday`, `MessagesWeek` | Activity | Messages in the last 24 hours or 7 days | `Today: %count%` | |
| `VoiceHoursToday`, `VoiceHoursWeek` | Activity | Voice hours across all members in the last 24 hours or 7 days | `Today: %count%h` | |
| `TopChatter` | Activity | The most active chatter of the last 7 days | `Chatter: %member.name%` | `%member.name%`, `%member.id%`, `%member.messages%` |
| `TopVoiceMember` | Activity | The member with the most voice time in the last 7 days | `Voice: %member.name%` | `%member.name%`, `%member.id%`, `%member.hours%` |
| `TopGame` | Activity | The most played game of the last 7 days (needs game tracking) | `%game%` | `%game%`, `%hours%`, `%players%` |
| `PlayingNow` | Activity | Members currently in a tracked game (needs game tracking) | `Playing: %count%` | |
| `RoleMembersOnline` | Members | Members with a role who are not offline | `%role.name%: %count%` | `%role.name%`, `%role.id%`, `%role.total%` |
| `TopInviter` | Invite Tracking | The member with the most invites | `Inviter: %member.name%` | `%member.name%`, `%member.id%`, `%member.invites%` |
| `InvitesWeek` | Invite Tracking | Joins credited to inviters in the last 7 days | `This Week: %count%` | |
| `MembersLeftToday`, `MembersLeftWeek` | Members | Members who left in the last 24 hours or 7 days | `Left Today: %count%` | |
| `NetGrowthWeek` | Members | Joins minus leaves over the last 7 days | `Growth: %count%` | `%joins%`, `%leaves%` |
| `PeakOnline` | Members | Most members seen online at once, counted while this stat is shown | `Peak Online: %count%` | `%peak.date%`, `%online%` |

### Placeholders available to every type

| Placeholder | Value |
| --- | --- |
| `%count%` | The value, rendered with the chosen display style |
| `%count.raw%` | The value as plain digits |
| `%server.name%` | Server name |
| `%server.id%` | Server ID |
| `%server.members%` | Total member count |
| `%server.boostcount%` | Boost count |
| `%server.boostlevel%` | Boost tier |

Channel names are capped at Discord's 100 character limit.

## Display styles

The **Counter style** decides how `%count%` is rendered. It only applies to numeric counters; text counters such as `NewestMember` print the text as is, and true or false counters such as `TwitchLiveStatus` print "LIVE" or "Offline" style text.

| Style | Example for 1234 | Notes |
| --- | --- | --- |
| `Plain` | `1234` | Raw digits |
| `Comma` | `1,234` | Thousands separators. The default. |
| `Compact` | `1.2K` | K, M, B, T suffixes, one decimal by default |
| `Padded` | `1234` | Zero padded to a fixed width, four digits by default, so 42 becomes `0042` |
| `Ordinal` | `1,234th` | Adds st, nd, rd or th |
| `Percent` | `61.7%` | Value as a percentage of the goal target, one decimal by default |
| `ProgressBar` | a ten cell bar | Filled and empty cells toward the goal target, ten cells by default |
| `EmojiDigits` | keycap digits | Each digit as a keycap emoji |
| `Roman` | `MCCXXXIV` | Roman numerals for 1 to 3999, otherwise falls back to comma style |

`Percent` and `ProgressBar` need a goal target to compare against. Without one they show `0%` or an empty bar.

Some styles have **Style options** in the editor:

| Option | Applies to | Range |
| --- | --- | --- |
| Decimal places | `Compact`, `Percent` | 0 to 3 |
| Width | `Padded` | 1 to 12 |
| Bar length | `ProgressBar` | 1 to 40 |
| Filled cell, Empty cell | `ProgressBar` | Up to 4 characters each |
| Text when on, Text when off | True or false counters such as `TwitchLiveStatus` | Up to 32 characters each |

## Update mechanisms

| Mechanism | Dashboard label | How it works |
| --- | --- | --- |
| `Rename` | Rename only | Edits the channel name. Discord allows two renames per ten minutes per channel, so the refresh interval is forced to at least 5 minutes. Channel ID never changes. |
| `Recreate` | Delete and recreate | Creates a new channel with the same name, category, position and permission overwrites, then deletes the old one. Can refresh every minute, but the channel ID changes every update and each update leaves two audit log entries. |
| `Auto` | Auto (recommended) | Renames while the two-per-ten-minutes budget allows. When the budget is spent and the interval is under 5 minutes, it recreates instead. When the interval is 5 minutes or more it just waits for the next rename slot. |

The default for new stat channels is **Auto** every **5 minutes**. Intervals are clamped between 1 minute (5 for Rename) and 1440 minutes. The bot checks every 30 seconds for channels whose interval has elapsed.

> [!WARNING]
> Recreate changes the channel ID. Anything else that references the channel, such as permission setups in other bots or pinned links, breaks on every refresh. Use it only where a fast refresh matters more than a stable ID.

## Settings

The page has three tabs, **Channels**, **Defaults** and **Counters**. A **Refresh** button sits in the header. Switch tabs with `?tab=channels`, `?tab=defaults` or `?tab=counters` on the page address.

### Channels tab

The **Channels** card lists every configured stat channel with its counter type, the value it shows now, its template, the update mechanism and interval, and the role or target it uses. Each row has **Edit** and **Remove**. **Remove** asks for confirmation and only stops tracking, the voice channel stays. With nothing configured the card says **No stat channels configured**. **Add** opens the editor.

The editor, titled **New stat channel** when adding, has these settings:

| Setting | Default | What it controls |
| --- | --- | --- |
| New channel / Existing channel | New channel | Create a new voice channel or use one you already have |
| Category (optional) | No category | Where a newly created channel is placed |
| Voice channel | none | The channel to use in Existing channel mode |
| Counter | none | The counter type, shown as category and name |
| Role | none | Shown for role counters |
| Target date | none | Shown for `Countdown` |
| Goal | 1000 | Shown for `MemberGoal`. Minimum 1. Used by the percent and progress bar styles |
| Twitch counter name | none | Shown for `TwitchCounter`, the name of an existing Twitch chat counter |
| Counting channel | none | Shown for the counting types |
| Minecraft server | none | Shown for the Minecraft types |
| Template | the counter's default | Channel name with placeholders. Click a placeholder to add it, or use the emoji picker. A live preview shows the result |
| Counter style | the counter's recommended style | Display style from the table above |
| Update mechanism | Auto (recommended) | Rename only, Delete and recreate, or Auto |
| Interval (minutes) | 5 | How often the name refreshes |

The interval has a minimum that depends on the mechanism (5 minutes for **Rename only**, 1 for the others) and a maximum of 1440. Counters that change constantly default to 1 minute unless the mechanism is **Rename only**. Press **Add** to finish.

Editing an existing channel saves automatically after a short pause, and the bot refreshes the channel afterwards. Changing the counter type resets the template and style to that counter's defaults.

A newly created channel denies Connect to `@everyone` so it acts as a label. A channel you add yourself keeps whatever permissions it already has.

### Defaults tab

**Defaults for new stat channels** applies to channels added later only:

| Setting | Default |
| --- | --- |
| Update mechanism | Auto (recommended) |
| Counter style | Comma |
| Interval (minutes) | 5 |

### Counters tab

The **Counters** card lists every counter with an example, grouped by category. Search with **Search counters**. Counters that change constantly carry a **Live** badge. **Use** opens the editor with that counter already selected.

## Setup walkthrough

1. Open **Stat Channels** in the dashboard and go to the **Defaults** tab. Leave **Update mechanism** on Auto and set an interval you are comfortable with.
2. Go to the **Counters** tab and press **Use** next to a counter, for example Total Members. You can also press **Add** on the **Channels** tab.
3. Choose **New channel** and pick a **Category** if you want the counters grouped.
4. Adjust the **Template** and watch the preview. Pick a **Counter style**.
5. Press **Add**.
6. Repeat for each counter. For a member goal, choose `MemberGoal`, set **Goal** and try the `ProgressBar` style.
7. Drag the new channels to the top of the channel list in Discord if they did not land there.
8. Wait one refresh interval and confirm the names update.

## Commands

Run these with your server's prefix (`.` unless you changed it). Types, styles and mechanisms are the names from the tables above, for example `TotalMembers`, `Compact`, `Recreate`.

| Command | Aliases | Needs | Purpose |
| --- | --- | --- | --- |
| `statchannelcreate <type> [template]` | `scnew` | Manage Channels | Create a new locked voice channel showing that counter |
| `statchanneladd #voice <type> [template]` | `sca` | Manage Channels | Turn an existing voice channel into a stat channel |
| `statchannelrole #voice @role [true] [template]` | `scr` | Manage Channels | Add a role member counter; `true` counts only members who are not offline |
| `statchannelcountdown #voice <date> [template]` | `scc` | Manage Channels | Add a countdown to a date |
| `statchannelgoal #voice <number> [template]` | `scg` | Manage Channels | Add a member goal counter |
| `statchanneltwitchcounter #voice <counter> [template]` | | Manage Channels | Mirror a named Twitch chat counter |
| `statchannelmechanism #voice <mechanism> [minutes]` | | Manage Channels | Set rename, recreate or auto, and optionally the interval |
| `statchannelstyle #voice <style>` | | Manage Channels | Set the display style |
| `statchanneldefaults [mechanism] [minutes] [style]` | | Manage Channels | Set the defaults for new stat channels |
| `statchanneltypes [category]` | | Nobody | Browse every counter with an example, optionally by category |
| `statchannellist` | `scl` | Nobody | List this server's stat channels with type, style, mode and template |
| `statchannelremove #voice` | `statchrm` | Manage Channels | Stop tracking a channel |

`statchannelcreate` also needs the bot to have Manage Channels. Slash equivalents live under `/statchannel`.

## Tips and gotchas

- The bot needs Manage Channels to rename or recreate a channel.
- A voice channel can only be one stat channel. Adding it twice fails with "already a stat channel".
- Counting, Minecraft and Twitch counters need those features set up first. Counting and Minecraft targets are chosen on the dashboard; there is no command for them.
- `statchannelremove` only stops tracking. Delete the voice channel yourself if you no longer want it.
- Live values such as Twitch viewers or open tickets still follow the channel's own interval. Lower the interval on those channels rather than on all of them.
- The `Percent` and `ProgressBar` styles use the channel's own goal target. Setting them on a counter without a goal always shows zero.
