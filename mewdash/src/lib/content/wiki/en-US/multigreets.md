---
title: Welcome and goodbye
slug: multigreets
summary: Welcome new members in up to thirty channels, with image cards and an optional captcha
icon: fa-bell
category: Actions
dashboard: /dashboard/multigreets
module: MultiGreets
tags: [greets, multigreets, welcome, join message, goodbye, bye, leave message, boost message, greet dm, welcome card, join roles, auto assign, verification, captcha, webhook, placeholders]
related: [rolegreets, invites, administration]
---

## What it does

The Welcome and goodbye page is one page of cards that cover everything that happens when a member arrives, leaves or boosts.

| Card | What it does |
| --- | --- |
| Join messages | Greets posted in channels when someone joins. Each channel can have its own message, delete timer and webhook |
| Goodbye message | One message posted when someone leaves |
| DM welcome | A private message sent to the member on join |
| Boost message | One message posted when someone boosts the server |
| Join roles | Roles given automatically to new members and to new bots |
| Verification | A captcha button new members must pass before they get access |

Messages go through the embed parser, so a message can be plain text or a full embed with buttons. Placeholders fill in the member's name and the server name. They also cover the member count and, if invite tracking is on, who invited them.

## Why you would use it

- A public welcome in `#general` and a quiet log line in `#staff-joins` from the same join.
- Different greeting styles per channel, for example an embed in one and a webhook "character" in another.
- A pool of greetings where each new member gets one picked at random.
- A short welcome that deletes itself after a minute so the channel does not fill up.
- Keep raids and bots out with a captcha, while members who pass get their roles automatically.

## Join messages

The **Join messages** card has a switch in its header. Turning it off disables every join greet without deleting them, and turning it on restores the last mode.

**Mode** decides what happens on a join.

| Mode | What happens |
| --- | --- |
| Send every message | Every enabled greet fires, in the order they were added. Default |
| Send one at random | One greet is chosen at random from the list and fires. Disabled greets can be picked and then skipped |

To add a greet, pick a channel under **Add a channel** and press **Add**. A channel can hold up to five greets and a server up to thirty. Each greet then gets its own card named after the channel, with a switch to disable it and a trash button to delete it. Until you add one the card says "No join messages yet".

| Field | Default | Meaning |
| --- | --- | --- |
| Message | empty | Text or embed template, edited in the message editor with a preview. An empty greet sends nothing |
| Delete after | none | Time until the greeting deletes itself, written like `45s` or `1m30s` |
| Greet bots | off | Whether the greet fires when a bot account joins |
| Webhook | Not configured | Post through a webhook with a custom name and optional avatar URL instead of as the bot. Use the pen button to edit, enter a **Webhook name** and **Avatar URL (optional)**, then **Save** |
| Switch | on | Disabled greets are skipped without being removed |

If the channel is deleted, the greet is removed the next time it tries to fire. If a webhook is deleted or the bot loses permission to post, the greet is switched to disabled instead of erroring every join.

## Goodbye, DM welcome and boost messages

These three cards work the same way. Each has a header switch and a message editor.

| Card | Channel | Delete after (seconds) | Fires when |
| --- | --- | --- | --- |
| Goodbye message | Yes | 0 to 600 | A member leaves |
| Boost message | Yes | 0 to 600 | A member starts boosting, or boosts again |
| DM welcome | No, sent privately | None | A member joins |

Messages are not sent until the switch is on and a message is written. Goodbye and boost messages also need a channel. In the goodbye message `%user%` mentions the member who left.

Greet DMs need care: mass DMs from unverified bots can get the bot flagged. Any member can block these DMs for themselves with `greetdmoptout`, or with the **Welcome DMs** toggle on their own profile page in the dashboard.

The goodbye message can also be sent through a webhook with `leavehook`, which is command only.

## Cards on messages

Every join greet, the goodbye message, the DM welcome, the boost message and every role greet can carry an image card drawn for the member. The message editor has a **Card** section with a placement and a **Design card** button.

| Placement | What it does |
| --- | --- |
| None | The message has no card |
| Embed image | The card is the embed's image. A message with no embed gets the card attached instead |
| Attached | The card is sent as a file with the message |

Each message keeps its own card, so two join greets can look different. **Design card** opens the card designer, where you can start from a starter layout or one of the background presets, then add and arrange text and image layers. Text accepts placeholders, and a new text layer starts as `%user.name%`. The message preview shows the card where it will appear, drawn with your own account. A server can store up to 30 uploaded images, each up to 8 MB, shared by all its cards.

If a card can't be drawn, the message is sent without it. Cards sent through a webhook are uploaded with the message. A goodbye message sent for several members at once has no card.

The text commands can set the basics: `welcomecard <greet, bye, dmgreet, boost or rolegreet> <option> [value]` with the options `show`, `enable`, `disable`, `placement`, `color`, `textcolor`, `background`, `overlay`, `title`, `subtitle`, `font`, `avatar` and `reset`. For greet and rolegreet a change applies to every message of that kind. `enable` attaches the card and `placement` takes `none`, `embed` or `attached`. `welcomecardpreview [target]` sends a preview, and `backgroundpresets [category]` lists the presets. `welcomecard` and `welcomecardpreview` need Manage Server. The slash command is `/welcomecard` with `show`, `toggle`, `placement`, `text`, `style`, `background`, `reset`, `presets` and `preview`.

## Join roles

**Join roles** has two multi-select role pickers: **Members** and **Bots**. Every new member gets the member roles and every new bot gets the bot roles. These are the same auto-assign roles managed with `autoassignrole` and `autoassignbotrole` in Administration.

> [!WARNING]
> Do not use the Verified role as a join role. That would give everyone the role without passing the captcha, and the bot refuses the setting.

## Verification

Verification makes new members pass a captcha before they get access. The card has a header switch and these settings.

| Setting | Default | What it controls |
| --- | --- | --- |
| Verification channel | none | Channel where the verification button is posted |
| Log channel | none | Optional channel for verification results |
| Unverified role | none | Role new members hold until they pass |
| Verified role | none | Role given when they pass |
| Attempts allowed | 3 | Wrong answers allowed, 1 to 10 |
| Time to verify (minutes) | 10 | How long a captcha stays valid, and how long a member who ran out of attempts is locked out, 1 to 60 |
| Kick after too many failed attempts | off | Kick instead of only locking out |

The buttons under the settings do the work.

| Button | What it does |
| --- | --- |
| Set up | Uses the chosen channel, or creates a `verify` channel if none is set, and posts the verification button |
| Post button again | Replaces the verification message in the channel |
| Preview channel changes | Lists the channels whose permissions would change so the Unverified role cannot see them, with an **Apply** button |
| Restore channels | Undoes the permission changes |
| Verify current members | Counts the members who would be verified without a captcha, then **Verify them** runs it in the background |

A member presses the button, receives a captcha image, and types the answer. Passing gives them the Verified role.

The Unverified role and Verified role cannot be the same, and the bot's highest role must sit above both.

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

The full list of placeholders is on the placeholders page.

## Setup walkthrough

1. Open **Welcome and goodbye** in the dashboard. In **Join messages**, leave **Mode** on **Send every message**.
2. Under **Add a channel**, choose the welcome channel and press **Add**.
3. On the new card, open the message editor, build your message with the placeholders above and save it.
4. Optionally set **Delete after**, add a **Webhook**, and turn on **Greet bots** if you want bot joins announced.
5. Repeat for any other channels. Switch **Mode** to **Send one at random** if you added several and want variety.
6. For a goodbye message, open **Goodbye message**, pick a channel, write the message and turn the card on. Do the same for **Boost message** and **DM welcome**.
7. In **Join roles**, pick the roles new members and new bots should get.
8. To add an image to a message, open its editor, set **Card** to **Embed image** or **Attached**, and press **Design card**.
9. For a captcha gate, fill in **Verification**, press **Set up**, use **Preview channel changes** and **Apply**, then turn the card on.

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
| `welcomecard <target> [option] [value]` | `wcard` | Manage Server | Set up the card on a kind of message |
| `welcomecardpreview [target]` | `wcardpreview`, `wcp` | Manage Server | Preview a message card |
| `verification [option] [value]` | `verify`, `vgate` | Administrator | Show or change the verification gate. Options: `setup`, `enable`, `disable`, `channel`, `unverifiedrole`, `verifiedrole`, `attempts`, `timeout`, `kickonfail`, `logchannel`, `panel`, `permissions`, `verifyexisting` |

## Tips and gotchas

- `multigreetdelete` needs the bot to have Manage Messages, and `multigreetwebhook` and `leavehook` need Manage Webhooks.
- Greet numbers used by commands are positions in the list, so removing one shifts the numbers of everything after it. Run `multigreetlist` before editing.
- The **Join messages** switch, `multigreettype off` and `/multigreets type` all set the same greet type, so any of them turns the system off without deleting your greets.
- Invite placeholders wait up to five seconds for the join to be attributed before the greet goes out, so the inviter is right even when several people join at once.
- The welcome DM only works if the member allows DMs from server members. Failed DMs are ignored.
- Role Greets are a separate feature that fires when a role is given rather than on join.
- Run **Preview channel changes** before **Apply** and make sure the bot can still see and manage every channel it needs.
