---
title: Reputation
slug: reputation
summary: Let members thank each other with reputation points, with cooldowns and anti-abuse limits, role rewards at thresholds, reaction-based giving, and optional decay for inactive members.
icon: fa-trophy
category: Community
dashboard: /dashboard/reputation
module: Reputation
tags: [reputation, rep, karma, thanks, role rewards, leaderboard, reaction rep, decay, cooldown]
related: [xp, administration]
---

## What it does

A member runs `rep @user` to give one reputation point, optionally with a reason. The receiver's total goes up, the giver's daily streak is tracked, and the history keeps who gave what and why. Anyone can check totals with `repcheck`, see the server ranking with `repleaderboard`, and read the last ten entries with `rephistory`.

Staff configure how freely rep flows: a cooldown per giver and receiver pair, daily and weekly caps, and minimum account age, server time and message count before someone may give at all. Channels can be disabled for rep or given a multiplier. Reputation can also be earned from reactions: a configured emoji on a message gives its author points.

At chosen thresholds the bot hands out roles, announces the milestone in a channel, and DMs the member. Optional decay slowly removes points from members who have neither given nor received rep for a while, so the leaderboard reflects current activity.

## Why you would use it

- Recognise helpful members in support channels and give them a visible role.
- Let a thumbs-up reaction in the showcase channel award points to the artist.
- Gate a command or a channel behind a reputation level instead of a manual role.
- Run a weekend event where rep in one channel counts double.
- Keep a support leaderboard honest with decay for people who stop helping.

## Giving reputation

Each `rep` gives one point, multiplied by the channel multiplier if one is set. You cannot rep yourself or a bot. Every attempt passes these checks, in this order, and the first failure is reported to the giver:

| Check | Default | What happens |
| --- | --- | --- |
| System enabled | on | Everything is refused while off |
| Channel state | enabled | A channel set to `disabled` refuses rep given there |
| Receiver frozen | no | Frozen members cannot receive rep |
| Cooldown | 60 minutes | Time before the same giver can rep the same receiver again |
| Daily limit | 10 | Rep a giver may hand out per UTC day |
| Weekly limit | none | Optional cap per week, counted from Sunday |
| Min account age | 7 days | Giver's Discord account age |
| Min server time | 24 hours | How long the giver has been in the server |
| Min message count | 10 | Messages the giver has sent, from message counting |

Anonymous rep records the entry as anonymous, but only when anonymous giving is enabled in the config. Negative reputation is a separate switch; reaction removal already takes back the points it gave.

### Streaks and stats

Giving rep on consecutive days builds a streak; a gap of more than a day and a half resets it. `repstats` shows total, rank, given, received, current and longest streak, and the last given and received times.

### Custom types

`reptypeadd helpful Helpful` creates a named type. Members then run `rep @user helpful thanks for the fix`. Standard rep only adds to the total; a custom type also keeps its own per-type count, which command requirements can target.

## Reactions

`repreaction <emoji> [amount] [type]` makes a reaction give rep to the message author. The reactor must not be a bot, and removing the reaction takes the points back. The command defaults to one point of standard rep, and each reaction config carries its own cooldown.

## Role rewards

`reprole @Role 100` gives the role once a member reaches 100 rep. Options: remove the role again when rep drops below the threshold (on by default), announce the milestone in a channel, and send a DM. Rewards are checked after every rep change. Bonus XP can be stored on a reward but is not paid out yet.

Independently of role rewards, the bot posts a milestone message to the **notification channel** when a member crosses 50, 100, 250, 500, 1000, 2500, 5000 or 10000 rep. Members also get a DM when they receive ten or more points at once or land on a multiple of ten.

## Decay

When enabled, every hour the bot checks whether it is time to decay. `daily` runs at 02:00 UTC, `weekly` on Sunday at 02:00 UTC, `monthly` on the first of the month. Members who have neither given nor received rep for the inactive period lose the decay amount, either a fixed number of points or a percentage of their total, never below zero. Frozen members are skipped. Defaults: weekly, 1 point, 30 inactive days.

## Command requirements

`repcommandreq <command> <minimum> [type] [#channels]` blocks a command until the member has that much rep, optionally of one custom type and optionally only in certain channels. `repcommandbypass` exempts roles, and `repcommandinfo` lets anyone see what a command needs.

## Settings

The Reputation page has four tabs: **Configuration**, **Role Rewards**, **Leaderboard** and **Statistics**.

| Setting | Default | What it controls |
| --- | --- | --- |
| Enable Reputation System | on | Master switch |
| Cooldown (minutes) | 60 | Per giver and receiver pair |
| Daily Limit | 10 | Rep per giver per day |
| Weekly Limit (optional) | none | Rep per giver per week |
| Min Account Age (days) | 7 | Giver requirement |
| Min Server Time (hours) | 24 | Giver requirement |
| Min Message Count | 10 | Giver requirement |
| Notification Channel (optional) | none | Where milestone messages go |
| Allow Negative Reputation | off | Enables negative amounts |
| Enable Anonymous Reputation | off | Lets `repanon` hide the giver |

Decay is not on the dashboard; use the `repdecay*` commands below.

**Role Rewards** has a form with **Role**, **Reputation Required**, **Announce Channel (optional)**, **Bonus XP (optional)**, **Remove role if rep drops below threshold** and **Send DM notification**. **Leaderboard** shows the ranking and opens a member's history. **Statistics** shows total users, total rep given, transactions and average rep.

## Setup walkthrough

1. Open **Reputation** in the dashboard. On **Configuration**, turn **Enabled** on.
2. Set **Cooldown**, **Daily Limit** and the three minimum requirements to suit your server's size.
3. Pick a **Notification channel** for milestones and save.
4. On **Role Rewards**, add a role with its **Reputation Required** and tick **Remove role if rep drops below threshold** if you want it to be earned continuously.
5. In Discord, run `repreaction <emoji> 1` to enable reaction rep, and `repchannel #bot-spam disabled` to keep spam channels out.
6. Test with a second account: `rep @you great help`, then `repcheck @you`.

> [!WARNING]
> `represet all` wipes every member's rep, history and badges for the server after a confirmation. There is no undo.

## Commands

Run these with your server's prefix (`.` unless you changed it).

| Command | Aliases | Needs | Purpose |
| --- | --- | --- | --- |
| `rep <@user> [type] [reason]` | `+rep`, `giverep`, `gr`, `repgive` | Nobody | Give one point |
| `repanon <@user> [type] [reason]` | `anongiverep` | Nobody | Give anonymously |
| `anonrep <@user> [type] [reason]` | | Nobody | Same as `repanon` |
| `repcheck [@user]` | `myrep`, `checkrep` | Nobody | Show total and rank |
| `repleaderboard [page]` | `replb`, `reptop`, `toprep` | Nobody | Ranking, 25 per page |
| `rephistory [@user]` | `rephist` | Nobody | Last ten rep entries |
| `repstats [@user]` | `repstat` | Nobody | Detailed stats and streaks |
| `repcommandinfo <command>` | `repcmdinfo`, `rci` | Nobody | Show a command's rep requirement |
| `repstatus` | `repsettings` | Administrator | Show the configuration |
| `repconfig` | `repcfg` | Administrator | Interactive configuration menu |
| `repenable [true/false]` | `repe` | Administrator | Turn the system on or off |
| `repcooldown <minutes>` | `repcd` | Administrator | 1 to 1440 |
| `repdailylimit <n>` | `repdl` | Administrator | 1 to 100 |
| `repweeklylimit [n]` | `repwl` | Administrator | 1 to 500, or none to clear |
| `repminage <days>` | `repma` | Administrator | 0 to 365 |
| `repminmembership <hours>` | `repmm` | Administrator | 0 to 720 |
| `repminmessages <n>` | `repminmsg` | Administrator | 0 to 1000 |
| `repnegative <true/false>` | `repneg` | Administrator | Allow negative rep |
| `repanonymous <true/false>` | `repanonym` | Administrator | Allow anonymous rep |
| `repnotificationchannel [#channel]` | `repnotify` | Administrator | Set or clear the milestone channel |
| `repchannel <#channel> [enabled/disabled/readonly] [multiplier]` | `repch` | Administrator | Per-channel state and multiplier |
| `repdecay <true/false>` | `repd` | Administrator | Enable decay |
| `repdecaytype <daily/weekly/monthly/fixed/percentage>` | `repdt` | Administrator | Decay schedule or amount type |
| `repdecayamount <n>` | `repda` | Administrator | 1 to 100 points or percent |
| `repdecayinactive <days>` | `repdi` | Administrator | 1 to 365 days before decay |
| `reptake <@user> [amount]` | `-rep`, `takerep` | Administrator | Remove points |
| `repset <@user> <amount>` | `setrep` | Administrator | Set a total |
| `represet <@user or all>` | `resetrep` | Administrator | Reset one member or everyone |
| `repfreeze <@user>` | `freezerep` | Administrator | Stop a member receiving rep |
| `repunfreeze <@user>` | `unfreeze`, `unfreezerep` | Administrator | Undo a freeze |
| `repreaction <emoji> [amount] [type]` | `repemoji`, `rre` | Administrator | Add or update a reaction reward |
| `repreactionremove <emoji>` | `repemojiremove`, `rrer` | Administrator | Remove a reaction reward |
| `repreactionlist` | `repemojilist`, `rrel` | Administrator | List reaction rewards |
| `reprole [@role] [rep] [removeOnDrop] [#channel] [dm] [xp]` | | Manage Roles | Add, update or list role rewards |
| `reproleremove <@role>` | `reprr` | Manage Roles | Remove a role reward |
| `reprolechannel <@role> [#channel]` | `reprc` | Administrator | Set or clear a reward's announcement channel |
| `repcommandreq <command> <min> [type] [#channels]` | `repcmdreq`, `rcr` | Administrator | Require rep for a command |
| `repcommandbypass <command> <@roles>` | `repcmdbypass`, `rcb` | Administrator | Roles that skip the requirement |
| `repcommandreqremove <command>` | `repcmdreqremove`, `rcrr` | Administrator | Remove a requirement |
| `repcommandreqlist` | `repcmdreqlist`, `rcrl` | Administrator | List requirements |
| `reptypeadd <name> <display name>` | `repaddtype`, `rta` | Administrator | Add a custom type |
| `reptyperemove <name>` | `repremovetype`, `rtr` | Administrator | Remove a custom type |
| `reptypelist` | `replisttypes`, `rtl` | Administrator | List custom types |
| `repeventcreate <name> <multiplier> <hours>` | `repec` | Administrator | Record a multiplier event |
| `repeventend <name>` | `repee` | Administrator | End an event early |
| `repexport` | `repex` | Administrator | Export the configuration as JSON |
| `repimport` | `repim` | Administrator | Import a configuration file attached to the message |
| `repmilestonelost <@user> <@role> <threshold>` | | Administrator | Test message for a lost milestone |

`/rep` slash commands cover `give`, `check`, `leaderboard`, `history` and `stats`, plus the admin groups `/rep config`, `/rep decay`, `/rep manage`, `/rep reaction`, `/rep role`, `/rep type`, `/rep event` and `/rep require`, which mirror the settings commands above. `/rep role list` and `/rep role info` are slash-only.

## Tips and gotchas

- Role rewards need the bot's role above every reward role and the Manage Roles permission, and `reprole` refuses roles above the bot.
- The minimum message count uses the message counting feature. If counting is off, members can be blocked from giving rep with a count of zero.
- Only the `disabled` channel state blocks giving. `readonly` is accepted by the command but does not currently stop rep in that channel.
- Events created with `repeventcreate` are stored with their multiplier and end time, but the multiplier is not currently applied to rep given during the event.
- Reaction rep uses the emoji's name for standard emoji and its ID for custom ones, so a custom emoji from another server will not match once it is removed.
- Decay checks run on the hour, so a `daily` decay happens once during the 02:00 UTC hour.
- The cooldown is per pair. One member can rep several different people back to back, up to the daily limit.
