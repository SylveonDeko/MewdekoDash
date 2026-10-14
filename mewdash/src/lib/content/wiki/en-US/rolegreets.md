---
title: Role Greets
slug: rolegreets
summary: Send a custom message to a channel whenever a member gains a specific role, with placeholders, embeds, webhooks and auto-delete.
icon: fa-user
category: Actions
dashboard: /dashboard/rolegreets
module: RoleGreets
tags: [role greet, role greets, welcome, role message, role announcement, verification welcome, webhook greet]
related: [multigreets, embedbuilder, administration]
---

## What it does

A role greet is a message the bot posts when a member receives a role. Staff pick a role and a channel, write the message, and from then on every time that role is added to someone the bot posts the message there. The default message is `Welcome %user.mention%!`.

The message goes through the embed parser, so it can be plain text, a full embed, or an embed with buttons built in the dashboard editor. Placeholders fill in the member's name, avatar, join date and server details. Each greet can post through a webhook with its own name and avatar, and can delete itself after a set number of seconds.

Greets are per role and per channel. One role can have up to ten greets, each in a different channel or with a different message, and a greet can be disabled without deleting it.

## Why you would use it

- Welcome members to the main chat only after they pass verification and get the Verified role.
- Announce new boosters in a thank-you channel when the booster role appears.
- Tell someone who just picked a game role where its channels are.
- Post a staff onboarding checklist in the staff channel when a moderator role is given.
- Greet members added to a giveaway or event role with the rules for that event.

## How a greet fires

The bot watches for member updates and compares the roles before and after. For every role that was added, it looks up the greets for that role and posts each one. Roles that were removed never trigger anything. Bots are skipped unless **Greet Bots** is on for that greet, and a disabled greet is ignored.

If the channel no longer exists the greet deletes itself. If a webhook greet fails because the webhook was deleted or the bot lost permission, the greet is disabled rather than removed, so you can fix it and re-enable it.

With a webhook set, the message is sent under the webhook's name and avatar. Auto-delete still works: the bot fetches the message it just sent and removes it after the delay.

## Placeholders

Role greets support the user, server and bot placeholder groups. Channel placeholders are not available.

| Placeholder | Value |
| --- | --- |
| `%user.mention%`, `%user%` | Mention of the member who gained the role |
| `%user.name%`, `%username%` | Their username |
| `%user.fullname%` | Username with tag |
| `%user.avatar%` | Avatar URL |
| `%user.banner%` | Banner URL |
| `%user.id%` | User ID |
| `%user.created_date%`, `%user.created_time%` | Account creation date and time |
| `%user.joined_date%`, `%user.joined_time%` | Server join date and time |
| `%server.name%`, `%server%` | Server name |
| `%server.members%` | Cached member count |
| `%server.icon%`, `%server.banner%` | Server icon and banner URLs |
| `%server.boostlevel%`, `%server.boostcount%` | Boost tier and count |
| `%server.time%`, `%time.day%` | Server time and weekday |
| `%bot.name%`, `%bot.avatar%`, `%bot.id%` | The bot's name, avatar and ID |

When invite tracking is enabled on the server, the inviter and invite placeholders from Multi Greets (`%inviter.username%`, `%inviter.mention%`, `%inviter.count%`, `%invite.code%`, `%invite.label%` and the rest) are also filled in from the member's inviter. If no inviter is known these read `Unknown`.

> [!EXAMPLE]
> `Welcome to the team, %user.mention%! You are member number %server.members%. Check the pins in this channel first.`

## Settings

The Role Greets page has an **Add New Role Greet** form at the top and a card for each greet below it.

| Setting | Default | What it controls |
| --- | --- | --- |
| Role | none | The role that triggers the greet |
| Channel | none | Where the message is posted |
| Message | `Welcome %user.mention%!` | Opens the embed editor |
| Delete Time (seconds, 0 for never) | 0 | Auto-delete delay |
| Webhook URL (optional) | none | Post through a webhook instead of the bot |
| Greet Bots | off | Also greet bot accounts that gain the role |
| Enabled | on | Toggle on the card; disabled greets do nothing |

## Setup walkthrough

1. Open **Role Greets** in the dashboard.
2. In **Add New Role Greet**, pick the **Role** and the **Channel**, then click **Add Role Greet**.
3. On the new card, click the message box to open the editor and write your greeting with the placeholders above.
4. Set **Delete Time** if the channel should stay tidy, and paste a **Webhook URL** if you want a custom name and avatar.
5. Save the card, then give the role to a test account and check the channel.
6. Use the toggle on the card to pause a greet, or the delete button to remove it.

> [!TIP]
> In Discord, `rolegreetmessage 1` with no text shows the current message and offers a **Preview** button that renders it with your own details.

## Commands

Run these with your server's prefix (`.` unless you changed it). Greets are numbered by their position in `rolegreetlist`.

| Command | Aliases | Needs | Purpose |
| --- | --- | --- | --- |
| `rolegreetadd <@role> [#channel]` | `rgadd`, `rga` | Administrator | Add a greet for a role, in the current channel if none is given |
| `rolegreetlist` | `rglist`, `rgl` | Administrator | Page through every greet with its settings |
| `rolegreetmessage <id> [message]` | `rgmsg`, `rgm` | Administrator | Set the message, or show and preview it with no text |
| `rolegreetremove <id or @role>` | `rgrem`, `rgrm`, `rgr` | Administrator | Delete one greet by number, or all greets for a role after confirming |
| `rolegreetdelete <id> <time or seconds>` | `rgdel`, `rgd` | Administrator | Auto-delete delay, for example `30s` or `30`; `0` disables |
| `rolegreetdisable <id> <true/false>` | `rgdisable`, `rgdis` | Administrator | Disable or re-enable a greet |
| `rolegreetgreetbots <id> <true/false>` | `rolegreetbots`, `rggb` | Administrator | Whether bots trigger the greet |
| `rolegreetwebhook <id> [name] [avatar url]` | `rgwebhook`, `rghook`, `rgh` | Administrator | Create a webhook in the greet channel with that name and avatar, or clear it with no name |

Slash commands live under `/rolegreets` with the same actions: `add`, `remove`, `removerole`, `message`, `delete`, `disable`, `greetbots`, `webhook` and `list`.

## Tips and gotchas

- The bot needs Send Messages and Embed Links in the greet channel, Manage Messages there for auto-delete, and Manage Webhooks to create a webhook with `rolegreetwebhook`.
- The limit is ten greets per role, not per server. The add command refuses an eleventh.
- Greets fire on any role add, including ones from reaction roles, level rewards and other bots, so a role that is added and removed often will spam the channel.
- If the embed parser produces nothing, for example a message that is only whitespace, nothing is sent.
- `rolegreetremove` with a role removes every greet for that role after a yes/no prompt; with a number it removes just that one immediately.
- Numbers shift when a greet is removed. Run `rolegreetlist` again before editing by number.
- Role greets are separate from the join greets on the MultiGreets page. Use MultiGreets for people joining the server and role greets for roles gained afterwards.
