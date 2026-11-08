---
title: Votes
slug: votes
summary: Thanks members who vote for your server on top.gg and rewards them with roles
icon: fa-thumbs-up
category: Community
dashboard: /dashboard/votes
module: Votes
tags: [votes, top.gg, vote rewards, vote roles, webhook, vote password, leaderboard]
related: [administration, xp]
---

## What it does

This is not a poll feature. Votes tracks the votes your server receives on top.gg and rewards the people who cast them. When top.gg tells Mewdeko that someone voted, the bot records the vote and posts a thank-you in your vote channel with that member's running total. It also hands out any roles you configured as vote rewards.

From a member's point of view: they vote for the server on top.gg, then a message appears in the vote channel mentioning them and showing how many times they have voted. If you set up vote roles, they get those roles at the same time, either permanently or for a set duration.

From staff's point of view: you set a vote channel and a webhook password. A custom message and reward roles are optional. After that the bot handles every vote on its own. `votes` and `votesleaderboard` let anyone check counts.

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

By default the bot sends a mention of the voter and an embed titled "Thanks for voting for <server>". The embed shows their total vote count and uses their avatar as the thumbnail.

You can replace this with your own text or embed using `votemessage` or the message editor on the dashboard. The text goes through the embed parser, so anything the embed builder produces works. Set it to `-` in the command, or use **Reset to default** on the dashboard, to go back to the default.

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

- The `@everyone` role cannot be added.
- A role cannot be added twice; use `voteroleedit` to change its duration.
- Timed roles are removed automatically when the duration passes.
- If the bot cannot assign a role (for example, the role is above the bot's highest role) it skips that role silently.

## Vote counts and leaderboard

`votes` shows a member's votes this month and in total, with their avatar. `votesleaderboard` ranks everyone in the server by total votes, twelve per page. Pass `true` to rank by this month's votes only. Both "month" figures compare the calendar month, not the last thirty days.

## Settings

The Vote management page has three tabs: **Configuration**, **Vote roles** and **Statistics**. Changes save as you make them.

### Configuration

The **Delivery** card holds the channel and password. The **Vote message** card holds the message.

| Setting | Default | What it controls |
| --- | --- | --- |
| Vote announcement channel | No channel selected | Where thank-you messages are posted. Nothing is posted and no roles are given without it |
| API password (for webhooks) | none | The secret top.gg must send in its Authorization header. **Show** and **Hide** reveal the field. **Generate** fills in a random 48 character value and saves it, and emptying the field removes the password |
| Custom vote announcement | default embed | Your own message or embed with a live preview and the placeholders above. **Reset to default** appears once a custom message is set |

### Vote roles

The **Add vote role** card has **Role to grant**, **Lasts** and **Unit** (Seconds, Minutes, Hours or Days). Leave **Lasts** empty or at 0 for a permanent role. The role list only offers roles that are not already vote roles, and never `@everyone`.

The **Vote roles** card lists every vote role with its own **Lasts** and **Unit** fields, which save as you edit them, and a delete button per role. **Clear all** removes every vote role after confirmation.

### Statistics

The **Statistics** tab shows **Total votes**, **This month** and **Voters**, then the **Vote leaderboard** (top ten by total votes) and **Recent votes**.

## Setup walkthrough

1. Open **Votes** in the dashboard and stay on **Configuration**.
2. Pick a **Vote announcement channel**. Without one, votes are recorded but nothing is posted and no roles are given.
3. Press **Generate** next to **API password (for webhooks)**, or type your own. Make it long and random and treat it like an API key.
4. Optionally write a **Custom vote announcement** using the placeholders above.
5. On the top.gg page for your server, open the webhooks section. Set the webhook URL to your bot's `/votes/` endpoint and the Authorization value to the same password.
6. On **Vote roles**, choose a **Role to grant**, set how long it **Lasts**, then press **Add vote role**. Repeat for every role you want.
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
- Changing the password does not invalidate old votes, but top.gg will stop matching until you update the header on their side too.
