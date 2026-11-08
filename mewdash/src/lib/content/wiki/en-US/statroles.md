---
title: Stat Roles
slug: statroles
summary: Roles that members earn by staying active and lose again when they go quiet
icon: fa-trophy
category: Community
dashboard: /dashboard/roles?tab=stats
module: StatRoles
tags: [stat roles, statroles, activity roles, active member role, inactive role, top chatter role, voice role, invite rewards, message rewards, streak]
related: [roles, serverstats, xp, invites, liveboards]
---

## What it does

XP level roles are one way: once earned, kept forever. A stat role is re-evaluated on a schedule. Members who meet the condition get the role and members who stop meeting it lose it, so an "active member" role means active now. Turn on **Permanent** if you want the old behaviour, or **Invert** to mark inactive members instead.

On the Roles page this feature is the **Activity roles** tab.

## Conditions

Every activity role measures one thing and applies one limit.

| Measure | What is counted |
| --- | --- |
| Messages | Messages in the window, optionally only in chosen channels |
| Voice minutes | Time in voice in the window, optionally only in chosen channels, honouring the voice states you excluded on Activity Stats |
| Invites | The member's net invite total |
| Days in server | Days since the member joined |
| Account age (days) | Days since the account was created |
| Minutes in a game | Time in one named game or app, or in any game, in the window. Needs game tracking on. |

| Qualify by | Who qualifies |
| --- | --- |
| Threshold | Between a **Minimum** and an optional **Maximum** |
| Top rank | Ranked between **From rank** and **To rank**, for example 1 to 10 |
| Top percent | Between **From percentile** and **To percentile** of ranked members, for example 1 to 5 |
| Daily streak | Reached a **Per day minimum** on at least **Required days** inside the window, for example 5 messages on 7 of the last 7 days |

Messages, voice minutes and minutes in a game use a **Window (days)** from 1 to 90, or 0 for all time. All time is not available for a daily streak, and a streak only works with those three measures. Ties share a rank.

## The Activity roles tab

The **Activity roles** card lists every rule. **New activity role** opens the editor. With no rules it reads **No activity roles yet**.

Each row shows the rule number and name, pills for **enabled** or **disabled**, **permanent**, **inverted** and **group**, then the role and its condition. Under it are the schedule, such as `every 180m · last run 2 hours ago`, and **announces in #channel** or **DMs members** when set.

Each row has a menu with these actions:

| Action | What it does |
| --- | --- |
| Preview | Shows how many qualify and who would gain and lose the role, without changing anything |
| Run now | Applies the rule immediately after you confirm. It shows how many were granted or removed and how many failed. |
| Enable or Disable | Switches the rule on or off |
| Edit | Opens the editor |
| Delete | Removes the rule. Members keep the roles they hold. |

Manual runs are limited to one every ten minutes per server.

## The editor

The editor has three cards. **Create activity role** saves a new rule, and **Save changes** saves an existing one.

### Condition

| Setting | Default | What it controls |
| --- | --- | --- |
| Role to manage | none | Required. Granted on qualifying, removed when no longer. |
| Name | role name | Shown in lists. Up to 64 characters. |
| Measure | Messages | What the condition looks at |
| Qualify by | Threshold | Threshold, top rank, top percent or daily streak |
| Game or app | any game | Shown for **Minutes in a game**. Empty counts time in any game. |
| Minimum | 100 | Threshold only. The least a member needs. |
| Maximum | none | Threshold only. Empty means no ceiling. |
| From rank, To rank | 1 and 10 | Top rank only |
| From percentile, To percentile | 1 and 10 | Top percent only. Up to 100. |
| Per day minimum | 100 | Daily streak only. What a member must reach on a day. |
| Required days | 5 | Daily streak only. How many days inside the window must meet it. |
| Window (days) | 30 | Messages, voice minutes and minutes in a game. 1 to 90, or 0 for all time. |
| Permanent | off | Never removed once earned |
| Invert | off | Members who do not qualify get the role |
| Include bots | off | Consider bot accounts too |

### Filters

| Setting | What it does |
| --- | --- |
| Only count in channels | Messages and voice only. Empty counts every channel. |
| Required roles | A member needs at least one to be considered |
| Excluded roles | A member holding any is never considered |
| Ignored members | Never granted or removed for these members |
| Group | Up to 32 characters. Rules sharing a group keep only the highest tier a member qualifies for, so tiers such as Bronze and Silver do not stack. |

### Schedule and notifications

| Setting | Default | What it controls |
| --- | --- | --- |
| Evaluate every (minutes) | 180 | How often the rule runs. At least 10. |
| Announce in | No announcements | Text channel that gets a message when the role is granted or removed |
| DM the member | off | Send the message by DM |
| Message | default | Plain text or an embed from the message editor. Placeholders: `%user%`, `%role%`, `%action%` (earned or lost), `%value%` and `%stat%`. Empty uses the default. |

## Setup walkthrough

1. Make sure the bot has Manage Roles and its highest role is above the role you will manage.
2. Open **Roles** and pick the **Activity roles** tab.
3. Press **New activity role**.
4. Pick the **Role to manage**, a **Measure** and what to **Qualify by**, then fill in the numbers.
5. Add filters, such as **Required roles** or **Excluded roles**, if you need them.
6. Set **Evaluate every** and, if you want an announcement, **Announce in**.
7. Press **Create activity role**.
8. Open the menu on the new row and press **Preview** to check who would gain and lose the role. Press **Run now** to apply it, or wait for the schedule.

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
| `statroleremove <id>` | `srremove` | Manage Roles | Delete the rule. Members keep what they hold. |

## Tips and gotchas

- The bot's highest role must be above the managed role, and it needs Manage Roles.
- Each Discord role can be managed by one activity role. Delete the old rule before pointing a new one at the same role.
- A rule with a minimum of 0 and no maximum would match everyone. Give it a maximum or use **Invert** on purpose.
- Members opted out of activity stats have nothing tracked, so they never qualify for those measures.
- Preview before enabling a rule on a big server. Role edits are spaced out to respect rate limits, so a rule touching thousands of members takes a few minutes to apply.
- A rule number in a command is the number shown before the name on the dashboard.
