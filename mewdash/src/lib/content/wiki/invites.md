---
title: Invites
slug: invites
summary: Track which invite each member joined through, keep a per-member invite count and leaderboard, and watch joins and leaves over time.
icon: fa-users
category: Community
dashboard: /dashboard/invites
module: Utility
tags: [invites, invite tracking, inviter, who invited, referrals, recruitment, leaderboard, member flow, joins, leaves]
related: [multigreets, utility]
---

## What it does

When someone joins, the bot compares the server's invite links before and after the join to work out which one was used. It records who created that invite as the new member's inviter and adds one to that inviter's count. Members can then ask who invited someone, list everyone a person has brought in, and see a leaderboard.

Optionally the count goes back down when an invited member leaves, so inviting people who do not stay does not pad the numbers.

The same page also has a **Member Flow** tab with joins and leaves per day for the last month, which uses the server's join and leave logs rather than invite data.

## Why you would use it

- Run a recruitment contest and pay out from the leaderboard.
- Show the inviter's name in the welcome message with the `%inviter.username%` placeholder in Greets.
- Find out who brought in a troublesome member.
- Check whether a spike in joins came from one link.

## How tracking works

- The bot needs Manage Server to read the invite list. Without it nothing is recorded.
- On startup the bot loads every server's invites in the background, a few servers at a time, so tracking can take a little while to start after a restart.
- Invite create and delete events keep the cache current, and the whole list is reloaded after every join.
- If no known invite's use count went up, for example a vanity URL or a join through server discovery, no inviter is recorded.
- With remove-on-leave off, a member who leaves and rejoins keeps their original inviter record and adds a second one. `whoinvited` shows the oldest.

## Settings

The **Settings** tab on the Invites page has three controls.

| Setting | Default | What it controls |
| --- | --- | --- |
| Enable Invite Tracking | on | Whether joins are matched to invites at all |
| Remove Invite On Leave | see `invitesettings` | Take one off the inviter's count and delete the inviter record when the invited member leaves |
| Minimum Account Age | 0 | Days, hours and minutes; stored and shown alongside the other settings |

> [!NOTE]
> Minimum Account Age is saved and displayed, but the join handler does not currently check it when counting an invite.

The other tabs are read-only views:

| Tab | What it shows |
| --- | --- |
| Statistics | Total Invites, Average Per Member, Top Inviter (worked out from the top 100 inviters) and a summary of the current settings |
| Leaderboard | Members ordered by invite count, ten per page |
| Find Inviter | Pick a member to see who invited them |
| Invited Users | Pick a member to list everyone they invited |
| Member Flow | Joins (30d), Peak join day, Leaves (30d), Net change, daily bar graphs, and the **Join color** and **Leave color** used for the graphs |

## Setup walkthrough

1. Make sure the bot's role has **Manage Server**.
2. Open **Invites** in the dashboard and check that **Enable Invite Tracking** is on.
3. Decide whether counts should drop when people leave and set **Remove Invite On Leave** to match. Click **Save Settings**.
4. Have someone join through a member's invite link, then open **Find Inviter** and select them.
5. If you want the inviter in your welcome message, add `%inviter.username%` to a greet on the Greets page.

## Commands

Run these with your server's prefix (`.` unless you changed it).

| Command | Aliases | Needs | Purpose |
| --- | --- | --- | --- |
| `invites [@user]` | | Nobody | Show how many invites a member has |
| `whoinvited [@user]` | `invitedby` | Nobody | Show who invited a member |
| `invitedusers [@user]` | `userinvites` | Nobody | List everyone a member invited, twenty per page |
| `inviteleaderboard` | `inviteslb` | Nobody | The top ten inviters |
| `invitesettings` | `inviteconfig` | Manage Server | Show whether tracking and remove-on-leave are on, and the minimum age |
| `toggleinvitetracking` | | Manage Server | Turn tracking on or off |
| `toggleremoveinviteonleave` | `triol` | Manage Server | Turn remove-on-leave on or off |
| `setminaccountage <days>` | `inviteminage` | Manage Server | Set the minimum account age in whole days |

## Tips and gotchas

- Members who joined before tracking was enabled, or while the bot was offline, have no inviter on record.
- The leaderboard only counts invites recorded by the bot, not Discord's own invite use counts. The command shows the top ten; the dashboard pages through everyone.
- `whoinvited` and `invitedusers` only show members who are still in the server.
- Turning tracking off does not delete existing counts. Turning it back on resumes from where it was.
- The Greets placeholder `%inviter.count%` is only filled when tracking is enabled and the inviter was found.
