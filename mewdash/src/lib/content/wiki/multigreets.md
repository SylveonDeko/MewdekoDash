---
title: Greets
slug: multigreets
summary: Post welcome messages in up to thirty channels when someone joins, plus classic goodbye, boost and DM greetings.
icon: fa-bell
category: Actions
dashboard: /dashboard/multigreets
module: MultiGreets
tags: [greets, multigreets, welcome, join message, goodbye, bye, leave message, boost message, greet dm, webhook, placeholders]
related: [rolegreets, invites, administration]
---

## What it does

When a member joins, the bot posts a greeting in every channel you have set up as a greet. Each greet has its own message, its own delete timer, its own webhook identity and its own bot toggle. You can run all of them at once or pick one at random per join.

Messages go through the embed parser, so a greet can be plain text, a full embed with buttons, or a webhook post with a custom name and avatar. Placeholders fill in the member's name, the server name, the member count and, if invite tracking is on, who invited them.

The older single-message system still exists alongside this. It handles the goodbye message when someone leaves, the boost announcement when someone boosts, and a private welcome DM. Those live in the Administration module and are described further down.

## Why you would use it

- A public welcome in `#general` and a quiet log line in `#staff-joins` from the same join.
- Different greeting styles per channel, for example an embed in one and a webhook "character" in another.
- A pool of greetings where each new member gets one picked at random.
- A short welcome that deletes itself after a minute so the channel does not fill up.
- A goodbye or boost message without setting up anything else.

## Greet types

The **Greet Type** is server-wide and decides what happens on a join.

| Type | Dashboard label | What happens |
| --- | --- | --- |
| MultiGreet | All Greets | Every enabled greet fires, in the order they were added. Default. |
| RandomGreet | Random Greet | One greet is chosen at random from the list and fires. Disabled greets can be picked and then skipped. |
| Off | Disabled | No greets fire at all. |

## What one greet holds

Each greet is tied to one channel. A channel can hold up to five greets, and a server can hold thirty in total. Greets are numbered by their position in the list, and that number is what the commands use.

| Field | Default | Meaning |
| --- | --- | --- |
| Channel | the channel you added | Where this greet is posted |
| Message | empty | Text or embed template. An empty greet sends nothing. |
| Delete After | 0 (never) | Seconds until the greeting deletes itself |
| Greet Bots | off | Whether the greet fires when a bot account joins |
| Webhook | none | Post through a webhook with a custom name and avatar instead of as the bot |
| Enabled | on | Disabled greets are skipped without being removed |

If the channel is deleted, the greet is removed the next time it tries to fire. If a webhook is deleted or the bot loses permission to post, the greet is switched to disabled instead of erroring every join.

## Placeholders

Greets are built with the user, server and bot placeholder sets. Inviter placeholders only work while invite tracking is enabled on the Invites page.

| Placeholder | Value |
| --- | --- |
| `%user%`, `%user.mention%` | Mention of the new member |
| `%user.name%`, `%username%` | Username |
| `%user.fullname%`, `%userfull%` | Full tag |
| `%user.id%`, `%id%` | User ID |
| `%user.avatar%`, `%useravatar%` | Avatar URL |
| `%user.banner%` | Banner URL |
| `%user.created_date%`, `%user.created_time%` | When the account was created |
| `%user.joined_date%`, `%user.joined_time%` | When they joined this server |
| `%server%`, `%server.name%` | Server name |
| `%server.id%`, `%sid%` | Server ID |
| `%server.icon%`, `%server.banner%` | Icon and banner URLs |
| `%server.members%`, `%members%` | Member count |
| `%server.boostlevel%`, `%server.boostcount%` | Boost tier and number of boosts |
| `%server.time%`, `%server.timestamp.longdatetime%` | Current time, plain or as a Discord timestamp |
| `%bot.name%`, `%bot.id%`, `%bot.avatar%` | About the bot itself |
| `%inviter.username%`, `%inviter.mention%`, `%inviter.id%`, `%inviter.avatar%` | The person whose invite was used, or `Unknown` |
| `%inviter.count%`, `%inviter.regular%`, `%inviter.left%`, `%inviter.fake%`, `%inviter.bonus%` | The inviter's invite tally |
| `%invite.code%`, `%invite.url%`, `%invite.uses%`, `%invite.label%`, `%invite.type%` | The invite that was used, its label, and whether it was an invite, the vanity link or an app |
| `%user.joincount%`, `%user.leavecount%` | How many times this member has joined and left |
| `%server.members.ordinal%` | Member count as 1st, 2nd, 1,204th |
| `%user.joined.R%`, `%user.created.F%` (and t, T, d, D, f styles) | Join and account creation times as Discord timestamps |

> [!EXAMPLE]
> `Welcome %user.mention% to %server%! You are member #%server.members%.`

The full list of server, channel and bot placeholders is on the placeholders page. Channel placeholders are not filled in for greets.

## The classic greet, bye and boost commands

These predate multi greets and live in the Administration module. They are one message each, stored on the server config, and toggled from the channel you run the command in.

| Message | Fires when | Placeholders |
| --- | --- | --- |
| Bye | A member leaves | User, server and bot sets, plus channel placeholders. `%user%` mentions the member who left. |
| Boost | A member starts boosting, or boosts again | User, channel, server, bot and gif sets |
| Greet DM | A member joins, sent as a private message | User, channel, server, bot and gif sets |

Running `bye` or `boost` toggles that message on or off and sets the channel to the one you typed in. `byedel` and `boostdel` set a self-delete timer in seconds; `boostdel` is capped at 600. The message commands with no text show the current message. `leavehook` wraps the bye message in a webhook with a custom name and avatar, and `leavehook disable` removes it.

Greet DMs need care. The bot asks you to confirm before enabling them unless it is a verified bot, because mass DMs from unverified bots can get the bot flagged. Any member can block these DMs for themselves with `greetdmoptout`, or with the **Welcome DMs** toggle on their own profile page in the dashboard.

There is no classic channel greet command. Use a multi greet for channel welcomes.

## Settings

Everything is on the Greets page in the dashboard.

| Setting | Default | What it controls |
| --- | --- | --- |
| Greet Type | All Greets | All Greets, Random Greet or Disabled |
| Add New Greet | | Pick a channel, then click **Add Greet** |
| Greeting Message | empty | The embed builder for one greet. Supports content, up to ten embeds and components. |
| Delete After | Never | Enter a time like `1m30s` or `45s` |
| Webhook | Not configured | Webhook name and optional avatar URL |
| Greet Bots | off | Fire for bot accounts too |
| Enabled | on | Turn one greet off without deleting it |

The bye, boost and greet DM messages are not on this page. Set them with the commands above.

## Setup walkthrough

1. Open **Greets** in the dashboard and leave **Greet Type** on **All Greets**.
2. Under **Add New Greet**, choose the welcome channel and click **Add Greet**.
3. On the new card, open **Greeting Message** and build your message, using the placeholders above. Save it.
4. Optionally set **Delete After**, add a **Webhook** name and avatar, and turn on **Greet Bots** if you want bot joins announced.
5. Repeat for any other channels. Switch to **Random Greet** if you added several to the same channel and want variety.
6. For a goodbye message, run `byemsg Goodbye %user%, we will miss you` in the channel you want, then `bye` to turn it on.
7. For a boost message, run `boostmsg Thanks for boosting, %user%!` and then `boost`.
8. Test with `byetest` and `boosttest`. Multi greets have a preview: run `multigreetmessage 1` and press **Preview**.

## Commands

Run these with your server's prefix (`.` unless you changed it). Multi greet commands are also available as `/multigreets add`, `/multigreets remove` and so on.

| Command | Aliases | Needs | Purpose |
| --- | --- | --- | --- |
| `multigreetadd [#channel]` | `mgadd`, `mga` | Administrator | Add a greet for a channel, defaulting to the current one |
| `multigreetremove <number or #channel>` | `mgrem`, `mgrm`, `mgr` | Administrator | Remove one greet by number, or every greet in a channel after confirming |
| `multigreetmessage <number> [message]` | `mgmsg`, `mgm` | Administrator | Set the greet text or embed; with no message, offers a preview or the raw template |
| `multigreetdelete <number> <time or seconds>` | `mgdel`, `mgd` | Administrator | Self-delete timer, for example `1m` or `60`; `0` turns it off |
| `multigreetdisable <number> <true or false>` | `mgdisable`, `mgdis` | Administrator | `true` disables the greet, `false` enables it |
| `multigreetgreetbots <number> <true or false>` | `multigreetbots`, `mggb` | Administrator | Whether this greet fires for bots |
| `multigreetwebhook <number> [name] [avatar url]` | `mgwebhook`, `mghook`, `mgh` | Administrator | Create a webhook for the greet; no name removes it |
| `multigreettype <multigreet, randomgreet or off>` | `mgtype`, `mgt` | Administrator | Change the server-wide greet type |
| `multigreetlist` | `mglist`, `mgl` | Administrator | Page through every greet with its settings |
| `bye` | | Manage Server | Toggle the goodbye message in this channel |
| `byemsg [text]` | | Manage Server | Show or set the goodbye message |
| `byedel [seconds]` | | Manage Server | Goodbye self-delete timer, default 30 |
| `byetest [@user]` | | Manage Server | Send the goodbye message as a test |
| `leavehook [#channel] [name] [image url] [text]` | `byehook` | Manage Server | Send goodbyes through a webhook, or `leavehook disable` |
| `boost` | | Manage Server | Toggle the boost message in this channel |
| `boostmsg [text]` | `boostmessage` | Manage Server | Show or set the boost message |
| `boostdel [seconds]` | `boostdelete` | Manage Server | Boost self-delete timer, 0 to 600, default 30 |
| `boosttest [@user]` | `testboost` | Manage Server | Send the boost message as a test |
| `greetdm` | | Manage Server | Toggle the welcome DM |
| `greetdmmsg [text]` | | Manage Server | Show or set the welcome DM text |
| `greetdmtest [@user]` | | Manage Server | Send the welcome DM as a test |
| `greetdmoptout` | `gdmoptout` | Nobody | Stop receiving welcome DMs from this bot anywhere |

## Tips and gotchas

- `multigreetdelete` needs the bot to have Manage Messages, and `multigreetwebhook` and `leavehook` need Manage Webhooks.
- Greet numbers are positions in the list, so removing one shifts the numbers of everything after it. Run `multigreetlist` before editing.
- The `off` option of `multigreettype`, `/multigreets type` and the dashboard's **Disabled** button all set the same greet type, so any of them turns the system off without deleting your greets.
- Invite placeholders wait up to five seconds for the join to be attributed before the greet goes out, so the inviter is right even when several people join at once.
- The welcome DM only works if the member allows DMs from server members. Failed DMs are ignored.
- Role Greets are a separate feature that fires when a role is given rather than on join.
