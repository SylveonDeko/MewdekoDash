---
title: Votes
slug: votes
summary: Reward members who vote for your server on top.gg with a thank-you message, a vote count and temporary or permanent roles.
icon: fa-thumbs-up
category: Community
dashboard: /dashboard/votes
module: Votes
tags: [votes, top.gg, vote rewards, vote roles, webhook, vote password, leaderboard]
related: [administration, xp]
---

## What it does

This is not a poll feature. Votes tracks the votes your server receives on top.gg and rewards the people who cast them. When top.gg tells Mewdeko that someone voted, the bot records the vote, posts a thank-you in your vote channel with that member's running total, and hands out any roles you configured as vote rewards.

From a member's point of view: they vote for the server on top.gg, then a message appears in the vote channel mentioning them and showing how many times they have voted. If you set up vote roles, they get those roles at the same time, either permanently or for a set duration.

From staff's point of view: you set a vote channel, a webhook password, an optional custom message, and up to ten reward roles. After that the bot handles every vote on its own. `votes` and `votesleaderboard` let anyone check counts.

The link between top.gg and your server is the vote password. top.gg sends it in the Authorization header of its webhook call, and Mewdeko matches that header against the password stored for each server to work out which server the vote belongs to.

## Why you would use it

- You list your server on top.gg and want a visible thank-you every time someone votes.
- You want to give voters a "Voter" role, or a temporary perk role that expires after twelve hours.
- You want a monthly voter leaderboard to run a "top voter" reward.
- You want members to be able to check their own vote count without asking staff.

## How a vote is processed

1. top.gg posts to the bot's `/votes/` webhook endpoint with the voter's Discord ID and your password in the Authorization header.
2. The bot finds the server whose stored vote password matches. If none matches, the vote is discarded.
3. The vote is saved with the voter's ID and the time.
4. If a vote channel is set, the bot posts the thank-you message there. With no vote channel nothing is posted and no roles are given.
5. Every vote role is added to the member. Roles with a timer are removed again when the timer runs out, using the same timed role system as mutes.

> [!WARNING]
> The password is the only thing linking a vote to your server. Anyone who knows it can send fake votes. Never paste it in a public channel; the bot sets it through a private modal for that reason.

## The thank-you message

By default the bot sends a mention of the voter plus an embed titled "Thanks for voting for <server>", a line with their total vote count, and their avatar as the thumbnail.

You can replace this with your own text or embed using `votemessage` or the **Custom Vote Announcement** box on the dashboard. The text goes through the embed parser, so anything the embed builder produces works. Set it to `-` in the command, or clear the box on the dashboard, to go back to the default.

### Placeholders

The custom message supports the general placeholder set (user, server, channel, bot and time placeholders from the placeholders page) plus two vote-specific ones.

| Placeholder | Value |
| --- | --- |
| `%votestotalcount%` | How many times this member has voted in total |
| `%votesmonthcount%` | How many times they have voted in the current calendar month |
| `%user.mention%`, `%user.name%`, `%user.id%`, `%user.avatar%` | The voter |
| `%server.name%`, `%server.id%`, `%server.icon%`, `%server.members%` | Your server |

> [!EXAMPLE]
> `Thanks %user.mention% for voting! That is vote number %votestotalcount% (%votesmonthcount% this month).`

Running `votemessage` with no text previews the current message as it would look for you, using your own vote counts.

## Vote roles

A vote role is given to every voter. Each role has an optional duration in seconds; `0` means the role is permanent.

- Up to ten vote roles per server.
- The `@everyone` role cannot be added.
- A role cannot be added twice; use `voteroleedit` to change its duration.
- Timed roles are removed automatically when the duration passes.
- If the bot cannot assign a role (for example, the role is above the bot's highest role) it skips that role silently.

## Vote counts and leaderboard

`votes` shows a member's votes this month and in total, with their avatar. `votesleaderboard` ranks everyone in the server by total votes, twelve per page. Pass `true` to rank by this month's votes only. Both "month" figures compare the calendar month, not the last thirty days.

## Settings

The Votes page has three tabs: **Configuration**, **Vote Roles** and **Statistics**.

| Setting | Default | What it controls |
| --- | --- | --- |
| Vote Announcement Channel | none | Where thank-you messages are posted. Nothing happens without it |
| API Password (for webhooks) | none | The secret top.gg must send in its Authorization header |
| Custom Vote Announcement | default embed | Your own message, with the placeholders above. Empty means the default |
| Role to Grant | none | A role added to every voter (Vote Roles tab) |
| Duration (seconds, 0 for permanent) | 0 | How long a vote role lasts before it is removed |

The **Statistics** tab shows total votes, the number of vote roles, the top voter's count, and a top-ten leaderboard.

## Setup walkthrough

1. Open **Votes** in the dashboard and stay on **Configuration**.
2. Pick a **Vote Announcement Channel**. Without one, votes are recorded but nothing is posted and no roles are given.
3. Enter an **API Password**. Make it long and random; treat it like an API key.
4. Optionally write a **Custom Vote Announcement** using the placeholders above, then **Save Configuration**.
5. On the top.gg page for your server, open the webhooks section. Set the webhook URL to your bot's `/votes/` endpoint and the Authorization value to the same password.
6. On **Vote Roles**, choose a **Role to Grant** and a **Duration**, then **Add Vote Role**. Repeat for up to ten roles.
7. Make sure the bot's role sits above every vote role in the role list.
8. Use top.gg's test webhook button, or wait for a real vote, and check the vote channel.

## Commands

Run these with your server's prefix (`.` unless you changed it).

| Command | Aliases | Needs | Purpose |
| --- | --- | --- | --- |
| `votechannel <#channel>` | | Manage Server | Set the channel for thank-you messages |
| `votemessage [text]` | `votemsg` | Manage Server | Preview, set, or reset (`-`) the custom message |
| `votepassword` | `votepass` | Manage Server | Set the webhook password through a private modal |
| `voteroleadd <@role> [time]` | `vra` | Manage Server | Add a vote role, optionally timed, for example `voteroleadd @Voter 12h` |
| `voteroleedit <@role> <time>` | `vre` | Manage Server | Change how long a vote role lasts |
| `voteroleremove <@role>` | `vrr` | Manage Server | Remove one vote role |
| `voteroleslist` | `vrl` | Manage Server | List vote roles and their durations |
| `voterolesclear` | `vrc` | Manage Server | Remove every vote role, after confirmation |
| `votes [@user]` | | Nobody | Show a member's monthly and total votes |
| `votesleaderboard [true]` | `voteslb` | Nobody | Rank voters by total, or by this month with `true` |

The same commands exist as slash commands under `/votes`.

## Tips and gotchas

- Only top.gg server votes are supported. There is no integration for other bot lists, and this feature does not create polls.
- No vote channel means no message and no roles, even though the vote is still counted.
- The bot needs Manage Roles and its role must be above every vote role, or role rewards fail silently.
- Timed vote roles use the same timed role system as timed mutes and appear in the audit log with the reason "Vote Role".
- `voteroleedit` looks the role up by ID alone, so use it only for roles you actually added in this server.
- Changing the password does not invalidate old votes, but top.gg will stop matching until you update the header on their side too.
