---
title: Invites
slug: invites
summary: Attribute every join to an invite code, the vanity link or an app, count regular, left, fake and bonus invites per member, label codes, and see growth, retention and join sources over time.
icon: fa-users
category: Community
dashboard: /dashboard/invites
module: Utility
tags: [invites, invite tracking, inviter, who invited, referrals, recruitment, leaderboard, fake invites, bonus invites, retention, vanity, labels, analytics, mass ban]
related: [multigreets, statroles, liveboards, serverstats]
---

## What it does

When someone joins, the bot compares the server's invite links before and after the join to work out which one was used, checks the vanity URL if none matched, and records how the member arrived: through a member's invite, the vanity link, as a bot added through OAuth, or unknown. The inviter gets a **regular** invite unless the join is flagged as **fake**. When the invited member leaves, the inviter's **left** count goes up. Staff can hand out **bonus** invites. A member's total is regular minus left minus fake, plus bonus.

Every witnessed join is kept, including after the member leaves, so the page can show retention (how many invited members are still here), rejoins, and which codes bring people who stay.

## Why you would use it

- Run a recruitment contest and pay out from a leaderboard that cannot be gamed with alt accounts or join-and-leave loops.
- See whether a Twitter campaign, a partner server or a YouTube link actually brings members who stick around, by labelling each code.
- Show the inviter and the code in the welcome message.
- Find and ban everyone one inviter brought in when a raid arrives through a single link.

## How joins are attributed

- The bot needs **Manage Server** to read the invite list. Without it nothing is recorded.
- Joins are processed one at a time per server, and when several people use the same code between two checks the surplus is remembered and credited to the next joins, so bursts are not lost.
- A join through the vanity URL is recorded as **Vanity** with no inviter. A bot added through OAuth is recorded as **Bot**.
- A labelled code with an owner credits the owner instead of whoever created the invite. That is how the personal links from `invitelink` work.

## Fake detection

A join is flagged as fake, and the inviter gets a fake invite instead of a regular one, when any of these apply:

| Reason | When |
| --- | --- |
| Self | The member used their own invite |
| New account | The account is younger than **Minimum account age** (0 disables the check) |
| Rejoin | The member has joined before and **Count rejoins** is off |
| No avatar | The member has no avatar and **Flag members without an avatar** is on |

Inviters on the **blacklist**, or holding a blacklisted role, still show up as the inviter but never earn credit. Members on the **hidden** list are tracked but left off leaderboards.

## Dashboard tabs

| Tab | What it shows |
| --- | --- |
| Overview | Joins, leaves, net growth, retention, fake joins and join sources for the last day, week, month or all time, a joins and leaves chart, top inviters and top codes |
| Leaderboard | Every inviter with their regular, left, fake, bonus and retention numbers, filtered by window or role, exportable as CSV. Click a row or pick a member to see their breakdown, add or remove regular, bonus or fake invites, or reset them |
| Members | Every witnessed join filtered by inviter, invite code or label, with how they arrived, whether they were flagged and whether they are still here. Exportable as CSV |
| Codes & Labels | Every invite code in the server with its creator, channel and uses. Give a code a label and optionally a role that everyone who joins through it receives, or delete the code |
| Settings | Tracking, remove on leave, count rejoins, flag no avatar, minimum account age, the channel personal links point at, the join and leave log channel, blacklists, hidden members, and the import and reset tools |

## Settings

| Setting | Default | What it controls |
| --- | --- | --- |
| Track invites | on | Whether joins are attributed at all |
| Remove credit when members leave | on | Adds one to the inviter's left count, lowering their total, when an invited member leaves |
| Count rejoins | on | Off flags a member who has joined before as a fake invite |
| Flag members without an avatar | off | Joins from accounts with no avatar count as fake |
| Minimum account age | 0 days | Accounts younger than this are flagged as fake |
| Personal link channel | system channel | Where invites created by `invitelink` point |
| Join and leave log channel | none | Posts an embed on every join and leave saying who invited whom, with the code, account age and any fake flag |

**Import uses from Discord** raises each inviter's regular total to the sum of uses across their codes and never lowers it, so it is safe to run again after a restart or a fresh install. **Reset inviters who left** clears the tally of everyone no longer in the server. **Reset everything** clears every tally and the join history.

## Greet placeholders

Any greet can use these once tracking is on. Unknown values fall back to `Unknown` or `0`.

| Placeholder | Value |
| --- | --- |
| `%inviter.mention%`, `%inviter.username%`, `%inviter.id%`, `%inviter.avatar%` | The credited inviter |
| `%inviter.count%`, `%inviter.regular%`, `%inviter.left%`, `%inviter.fake%`, `%inviter.bonus%` | The inviter's tally |
| `%invite.code%`, `%invite.url%`, `%invite.uses%`, `%invite.label%`, `%invite.type%`, `%invite.fake%` | The invite that was used |
| `%user.joincount%`, `%user.leavecount%` | How many times this member has joined and left |
| `%server.members.ordinal%` | The member count as 1st, 2nd, 1,204th |
| `%user.joined.R%`, `%user.created.F%` and the other Discord timestamp styles t, T, d, D, f, F, R | Join and account creation times as live timestamps |

## Commands

Run these with your server's prefix (`.` unless you changed it). Every command also exists under `/invites`.

| Command | Aliases | Needs | Purpose |
| --- | --- | --- | --- |
| `invites [@user]` | | Nobody | A member's total with the regular, left, fake and bonus breakdown and rank |
| `whoinvited [@user]` | `invitedby` | Nobody | Who invited a member, the code, and whether the join was flagged |
| `invitedusers [@user]` | `userinvites` | Nobody | Everyone a member invited, with join dates and flags |
| `invitedbycode <code>` | | Nobody | Everyone who joined through a code |
| `invitedbylabel <label>` | | Nobody | Everyone who joined through a labelled code |
| `inviteleaderboard [AllTime/Daily/Weekly/Monthly] [@role]` | `inviteslb` | Nobody | The leaderboard for a window, optionally one role |
| `invitestats [range]` | `growthstats` | Nobody | Joins, leaves, net, retention, fake joins, sources, top inviters and codes |
| `invitecodes [@user]` | `mycodes` | Nobody | A member's invite codes and their uses |
| `invitelink` | `findlink`, `mylink` | Nobody | Your personal permanent link, created if you have none |
| `addinvites`, `removeinvites`, `addbonusinvites`, `removebonusinvites`, `addfakeinvites`, `removefakeinvites <@user> <amount>` | | Manage Server | Adjust a member's tally |
| `resetinvites <@user>` or `resetinvites Server` or `resetinvites LeftMembers` | | Manage Server, Administrator for server-wide | Reset tallies |
| `syncinvites [@user]` | | Manage Server | Import uses from Discord |
| `deleteinvite <code>` | `delinvite` | Manage Server | Delete a code |
| `purgeinvites [maxUses] [#channel]` | | Manage Server | Delete every unlabelled code used at most that many times |
| `inviteblacklist <@user or @role>` | `invbl` | Manage Server | Toggle whether someone can earn credit |
| `invitehide <@user>` | `invhide` | Manage Server | Toggle whether someone appears on leaderboards |
| `inviteexclusions` | | Manage Server | List blacklists and hidden members |
| `invitelabelset <code> <label>`, `invitelabelrole <code> [@role]`, `invitelabelremove <code>`, `invitelabels` | | Manage Server | Manage labels |
| `inviteexport [range]`, `invitedexport [@user]` | | Manage Server | CSV exports |
| `invitemassban <@user> [reason]`, `invitemassbancode <code> [reason]` | | Ban Members | Ban everyone still here who was invited by a member or through a code, after confirmation |
| `invitesettings`, `toggleinvitetracking`, `toggleremoveinviteonleave`, `togglecountrejoins`, `togglefakenoavatar`, `setminaccountage <days>`, `invitelinkchannel [#channel]`, `invitelogchannel [#channel]` | | Manage Server | Settings |

## Tips and gotchas

- Members who joined before tracking was enabled, or while the bot was offline, have no join record. Run **Import uses from Discord** once to seed regular totals from Discord's own counts.
- Fake joins never lower a total when the member leaves; only regular ones become left invites.
- A member who leaves and comes back gets a new join record. With **Count rejoins** on the inviter earns a regular invite again, which cancels out the left invite from before.
- Retention on the leaderboard only counts joins the bot witnessed, so it starts at 100% and settles as history builds.
- Stat roles can reward invite counts, and live boards can pin the invite leaderboard in a channel.
