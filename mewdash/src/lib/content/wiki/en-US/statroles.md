---
title: Stat Roles
slug: statroles
summary: Roles that members earn by being active over a window and lose again when they stop, judged by thresholds, top ranks, top percentages or daily streaks on messages, voice, games, invites, time in the server or account age.
icon: fa-trophy
category: Community
dashboard: /dashboard/statroles
module: StatRoles
tags: [stat roles, statroles, activity roles, active member role, inactive role, top chatter role, voice role, invite rewards, message rewards, streak, statbot]
related: [serverstats, xp, invites, liveboards]
---

## What it does

XP level roles are one way: once earned, kept forever. A stat role is re-evaluated on a schedule. Members who meet the condition get the role, members who stop meeting it lose it, so an "active member" role means active *now*. Make one permanent if you want the old behaviour, or invert it to mark inactive members instead.

## Conditions

Every stat role measures one thing over a window and applies one limit.

| Measure | What is counted |
| --- | --- |
| Messages | Messages in the window, optionally only in chosen channels |
| Voice minutes | Time in voice in the window, honouring the voice states you excluded on Activity Stats |
| Minutes in a game | Time in one named game or app, or in any, in the window. Needs game tracking on |
| Invites | The member's net invite total |
| Days in server | Since the member joined |
| Account age | Since the account was created |

| Limit | Who qualifies |
| --- | --- |
| Threshold | Between a minimum and an optional maximum |
| Top rank | Ranked between two positions, for example the top 10 |
| Top percent | In the top X percent of ranked members, for example the top 5% |
| Daily streak | Reached a per day minimum on at least N days inside the window, for example 5 messages on 7 of the last 7 days |

The window is 1 to 90 days, or all time for anything except a streak. Ties share a rank.

## Filters and options

| Option | What it does |
| --- | --- |
| Only count in channels | Limit messages or voice to chosen channels |
| Required roles | A member needs at least one to be considered |
| Excluded roles | A member holding any is never considered |
| Ignored members | Never granted or removed for these members |
| Group | Stat roles sharing a group keep only the highest tier a member qualifies for, so Bronze, Silver and Gold do not stack |
| Permanent | Never removed once earned |
| Invert | Members who do *not* qualify get the role |
| Include bots | Consider bot accounts |
| Evaluate every | How often the rule runs, at least every 10 minutes, every 3 hours by default |
| Announce in / DM the member | Post a message when the role is granted or removed, using `%user%`, `%role%`, `%action%` (earned or lost), `%value%` and `%stat%` |

## Dashboard

The **Stat Roles** tab lists every rule with its condition, schedule and last run, and lets you enable, disable, edit, delete, **preview** or **run** each one. A preview shows who would gain and lose the role without changing anything. Run applies it immediately; manual runs are limited to one every ten minutes per server.

The **Create / Edit** tab is the form for everything above.

## Commands

Run these with your server's prefix (`.` unless you changed it). Every command also exists under `/statrole`.

| Command | Aliases | Needs | Purpose |
| --- | --- | --- | --- |
| `statroleadd <@role> <stat> <minimum> [days] [name]` | `sradd` | Manage Roles | A threshold rule |
| `statroletop <@role> <stat> <topEnd> [days] [name]` | `srtop` | Manage Roles | A top rank rule for places 1 to topEnd |
| `statrolepercent <@role> <stat> <percent> [days] [name]` | `srpercent` | Manage Roles | A top percent rule |
| `statrolestreak <@role> <stat> <perDay> <requiredDays> [days] [name]` | `srstreak` | Manage Roles | A daily streak rule |
| `statrolelist` | `statroles` | Nobody | Every rule |
| `statroleinfo <id>` | `srinfo` | Nobody | One rule in full |
| `statroleset <id> <setting> <value>` | `srset` | Manage Roles | Change name, min, max, lookback, topstart, topend, days, permanent, invert, bots, group, interval, notifychannel, notifydm, message or activity |
| `statrolefilter <id> <#channel, @role [true], or @user>` | `srfilter` | Manage Roles | Toggle a channel filter, a required role (or excluded role with `true`), or an ignored member |
| `statroletoggle <id>` | `srtoggle` | Manage Roles | Enable or disable |
| `statrolepreview <id>` | `srpreview` | Manage Roles | Who would gain and lose |
| `statrolerun <id>` | `srrun` | Manage Roles | Apply now |
| `statroleremove <id>` | `srremove` | Manage Roles | Delete the rule; members keep what they hold |

## Tips and gotchas

- The bot's highest role must be above the managed role, and it needs Manage Roles.
- Each Discord role can be managed by one stat role. Delete the old rule before pointing a new one at the same role.
- A rule with a minimum of 0 and no maximum would match everyone; give it a maximum or use invert on purpose.
- Members opted out of activity stats have no messages, voice or game time, so they never qualify for those measures.
- Preview before enabling a rule on a big server. Role edits are spaced out to respect rate limits, so a rule touching thousands of members takes a few minutes to apply.
