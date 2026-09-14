---
title: Stat Channels
slug: statchannels
summary: Voice channels whose names update themselves to show live numbers such as member count, boosts, open tickets or a Twitch viewer count.
icon: fa-chart-simple
category: Community
dashboard: /dashboard/statchannels
module: StatChannels
tags: [stat channels, counter, member count, live stats, voice channel stats, countdown, member goal, boost count, twitch viewers]
related: [counting, twitch, suggestions, xp, afk, starboard]
---

## What it does

A stat channel is a locked voice channel that sits at the top of your channel list and shows a number in its name, for example "Members: 12,480". The bot rewrites the name on a schedule so the number stays current. Members cannot join the channel; it exists only to be read.

You choose a counter type, a template for the name, a style for the number and how often it refreshes. The bot supports several dozen counters covering server facts, presence, Nitro boosts, emoji slots, member goals and countdowns, plus values pulled from other Mewdeko features such as tickets, suggestions, giveaways, XP, counting, the starboard, and linked Twitch or Minecraft servers.

Discord only allows a channel to be renamed twice every ten minutes. Stat Channels works around that with a choice of update mechanism, including one that deletes and recreates the channel so it can refresh every minute.

## Why you would use it

- Show member, human and bot counts at the top of the server.
- Track progress to a member goal with a percentage or a progress bar.
- Count down to an event, a launch or an anniversary.
- Show Twitch live status and viewer count for a streamer's server.
- Give staff a live view of open tickets or pending suggestions without opening a dashboard.
- Display Minecraft server status and player count next to the invite link.

## Counter types

The full catalogue below is what `statchanneltypes` and the dashboard's **Available Counters** section list. Every type accepts the common placeholders; some add their own. Default templates begin with a matching emoji followed by the text shown.

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

The **Counter Style** decides how `%count%` is rendered. It only applies to numeric counters; text counters such as `NewestMember` print the text as is, and true or false counters such as `TwitchLiveStatus` print "LIVE" or "Offline" style text.

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

The page has three tabs, **Stat Channels**, **Add** and **Defaults**, plus a **Refresh** button in the header. **Stat Channels** lists every configured channel with **Edit** and **Remove** buttons.

**Add Stat Channel** offers **Create New Channel** or **Use Existing Channel** with a **Voice Channel** picker, then:

| Setting | Default | What it controls |
| --- | --- | --- |
| Category (optional) | none | Where a newly created channel is placed |
| Counter | none | The counter type from the catalogue |
| Template | the type's default | Channel name with placeholders; click a placeholder chip to insert it, and the preview updates as you type |
| Counter Style | Comma | Display style from the table above |
| Update Mechanism | Auto | Rename, recreate or auto |
| Refresh Interval (minutes) | 5 | How often the name refreshes |
| Role | none | Shown for `RoleMembers` |
| Target Date | none | Shown for `Countdown` |
| Goal Target | none | Shown for `MemberGoal`, and used by the percent and progress bar styles |
| Twitch Counter Name | none | Shown for `TwitchCounter` |
| Counting Channel | none | Shown for the counting types |
| Minecraft Server | none | Shown for the Minecraft types |

**Defaults For New Stat Channels** sets **Default Mechanism**, **Default Counter Style** and **Default Interval (minutes)** for channels added later. The **Defaults** tab also has reference sections for **Counter Styles** and **Available Counters**.

A newly created channel denies Connect to `@everyone` so it acts as a label. A channel you add yourself keeps whatever permissions it already has.

## Setup walkthrough

1. Open **Stat Channels** in the dashboard and go to the **Defaults** tab. Leave **Default Mechanism** on Auto and set an interval you are comfortable with.
2. Go to **Add**, choose **Create New Channel**, and pick a **Category** if you want the counters grouped.
3. Choose a **Counter**, for example Total Members. Adjust the **Template** and watch the preview.
4. Pick a **Counter Style** and save.
5. Repeat for each counter. For a member goal, choose `MemberGoal`, set **Goal Target** and try the `ProgressBar` style.
6. Drag the new channels to the top of the channel list in Discord if they did not land there.
7. Wait one refresh interval and confirm the names update.

## Commands

Run these with your server's prefix (`.` unless you changed it). Types, styles and mechanisms are the names from the tables above, for example `TotalMembers`, `Compact`, `Recreate`.

| Command | Aliases | Needs | Purpose |
| --- | --- | --- | --- |
| `statchannelcreate <type> [template]` | `scnew` | Manage Channels | Create a new locked voice channel showing that counter |
| `statchanneladd #voice <type> [template]` | `sca` | Manage Channels | Turn an existing voice channel into a stat channel |
| `statchannelrole #voice @role [template]` | `scr` | Manage Channels | Add a role member counter |
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
