---
title: Giveaways
slug: giveaways
summary: Run timed giveaways that members enter by reaction, button, or web captcha, with role and message count requirements, random winner picks, rerolls, and winner DMs.
icon: fa-gift
category: Entertainment
dashboard: /dashboard/giveaways
module: Giveaways
tags: [giveaway, gstart, prize, raffle, winner, reroll, contest, entry, captcha]
related: [embedbuilder, chat-triggers, xp]
---

## What it does

Staff start a giveaway with a prize, a channel, a number of winners, and a duration. The bot posts an embed in that channel showing the prize, the host, when it ends, and any requirements. Members enter by reacting with the server's giveaway emote, by pressing an **Enter** button, or by solving a captcha on the dashboard, depending on how the giveaway was started.

When the timer runs out the bot picks winners at random from everyone who entered and still meets the requirements. It edits the original message to show the winners, posts a congratulations message in the channel, and, if enabled, DMs each winner with a link to the giveaway. Staff can end a giveaway early or reroll it after it has ended.

Requirements are checked at the end, not at entry. Someone who reacted but later lost a required role is skipped when winners are chosen.

## Why you would use it

- Give away game keys, Nitro, or merch to active members without picking names by hand.
- Reward people who have actually been talking, by requiring a minimum message count.
- Restrict a prize to boosters or a supporter role by requiring those roles.
- Stop alt accounts and bots from stuffing entries by using captcha entry.

## Entry methods

Each giveaway uses exactly one of these. The interactive `gstart` wizard asks which, the slash command has `use_button` and `use_captcha` options, and the dashboard has an **Entry Method** choice.

| Method | How members enter | Notes |
| --- | --- | --- |
| Reaction | React with the server's giveaway emote | The default. The bot reads the reaction list when the giveaway ends, up to 1000 users. |
| Button | Press the **Enter** button under the embed | Entries are stored by the bot. Entering twice, after it has ended, or while not in the server is refused. |
| Captcha | Press **Enter (Web Captcha)**, sign in to the dashboard, and pass a Cloudflare Turnstile check | Same storage as button entry. The entry is credited to the signed-in Discord account. |

The giveaway emote is set per server with `gemote`. The bot validates it by reacting with it, so a custom emote from another server only works if the bot is also in that server. Reaction giveaways also need the bot's Add Reactions and Use External Emojis permissions, and `gstart` refuses to start without them.

## Requirements

| Requirement | Set by | Effect at draw time |
| --- | --- | --- |
| Required roles | Wizard, slash `required_roles`, dashboard **Required Roles** | The member must hold all of the listed roles |
| Message count | Wizard, slash `required_messages`, dashboard **Required Message Count** | The member's counted messages in this server must be at least this number. Uses the message count service, so it only knows about messages counted since that was enabled. |

Bots are always excluded, and so is anyone who has left the server. Requirements are listed in the giveaway embed as a **Required Roles** line and a "N Messages Required" line.

## The giveaway message

The embed's title is the prize. The description reads "React with (emote) to enter!", names the host, and shows the end time as a relative and absolute Discord timestamp. The footer shows the winner count, the server name, and the end date. Message content is the ping role mention if one is set.

Server-wide appearance settings:

| Setting | Command | Effect |
| --- | --- | --- |
| Embed colour | `gembedcolor` | Colour of the giveaway embed, as a colour name or `#hex` |
| Banner | `gbanner` | Image shown on every giveaway. The wizard and slash command can override it per giveaway with a URL or attachment. |
| Ping role | none, only wizard override | The wizard offers to ping a role; if a server ping role is stored it asks whether to override it |
| DM winners | `gdm` | Whether winners get a DM. On by default. |

### When it ends

If enough eligible entrants exist, the bot edits the embed to "Winner: @user" with the host, sets the footer to "Ended at (time)", changes the content to "**Giveaway Ended!**", and posts a separate congratulations message linking the giveaway and showing the reroll command. If nobody entered, or fewer eligible people entered than there are winners, the embed is replaced with "There were not enough participants!" and the giveaway is marked ended. If people entered but none met the requirements, it says so instead.

A single-winner giveaway also fires the `GiveawayWon` event for chat triggers, so a trigger can react to a win.

### Winner DM

With **DM winners** on, each winner gets a DM. The default is an embed saying they won, with a link to the giveaway message. If a custom end message is stored, it is sent instead and can use these placeholders on top of the general server, user, and channel ones.

| Placeholder | Value |
| --- | --- |
| `%messagelink%` | Link to the giveaway message |
| `%giveawayitem%` | The prize |
| `%giveawaywinners%` | The number of winners |

`gdmmessage` with no text offers to preview the stored message with sample values, and declining the preview clears it. Running it with text also clears the stored message rather than saving it.

## Settings

The **Giveaways** dashboard page has three tabs: **Active Giveaways**, **Create Giveaway**, and **Ended Giveaways**. The server-wide settings above (emote, colour, banner, DM toggle) are command only.

The **Create Giveaway** form:

| Setting | Default | What it controls |
| --- | --- | --- |
| Giveaway Item | empty | The prize, shown as the embed title |
| Number of Winners | 1 | How many winners to draw; must be at least 1 |
| Channel | none | Where the embed is posted |
| Duration | 24 hours | When the giveaway ends |
| Required Roles | none | Roles a member must hold to win |
| Required Message Count | 0 | Minimum counted messages |
| Reaction Emoji | the party popper | Emote for reaction entry; a custom emote or pasted emote code works |
| Entry Method | Reaction | Reaction, Button, or Captcha |

**Active Giveaways** lists each giveaway with its end time. Expanding one shows winners, channel, required roles, message requirement, and entry method, plus an **End Giveaway** button. Rerolls are command only.

## Setup walkthrough

1. Run `gemote` with the emote you want members to react with, for example `gemote :tada:`.
2. Optionally set `gembedcolor` and `gbanner` so giveaways match your server's look.
3. Open **Giveaways** in the dashboard, then **Create Giveaway**.
4. Fill in **Giveaway Item**, **Number of Winners**, **Channel**, and **Duration**.
5. Add **Required Roles** or a **Required Message Count** if the prize should go to established members.
6. Choose an **Entry Method** and press **Create Giveaway**.
7. When it ends, check the channel. If the wrong person won or they do not respond, run `greroll <message id>`.

## Commands

Run these with your server's prefix (`.` unless you changed it). The same commands exist as slash commands under `/giveaways`.

| Command | Aliases | Needs | Purpose |
| --- | --- | --- | --- |
| `gstart [#channel <time> <winners> <prize>]` | `giveawaystart` | Manage Messages | Start a giveaway. With no arguments it runs a wizard that also asks for host, message requirement, banner, ping role, entry method, and required roles. Time looks like `2d3h`. |
| `gend <message id>` | `giveawayend` | Manage Messages | End a giveaway now and draw winners |
| `greroll <message id>` | `giveawayreroll`, `reroll` | Manage Messages | Draw again from the entrants of an ended giveaway |
| `glist` | `giveaways`, `giveawaylist` | Manage Messages | List active giveaways with message IDs, prizes, winner counts, and links |
| `gstats` | `giveawaystats` | Nobody | Totals of active and ended giveaways, hosts, and per-channel counts |
| `gemote <emote>` | `giveawayemote` | Manage Messages | Set the reaction entry emote |
| `gembedcolor <colour>` | `giveawayembedcolor` | Manage Messages | Set the giveaway embed colour |
| `gwinembedcolor <colour>` | `giveawaywinembedcolor` | Manage Messages | Sets the same colour value as `gembedcolor` |
| `gbanner <url>` | `giveawaybanner` | Manage Messages | Set the default banner image |
| `gdm` | `giveawaydm` | Manage Messages | Toggle DMs to winners |
| `gdmmessage [text]` | `gdmmsg` | Manage Messages | Preview or clear the custom winner DM |

## Tips and gotchas

- The message ID for `gend` and `greroll` is the ID of the giveaway embed. Copy it with Developer Mode, or read it from `glist`.
- Reroll picks from the entrants again with the same requirements, so the previous winner can win again.
- After a restart the bot schedules giveaways ending within the next 24 hours straight away; ones ending later are picked up by an hourly check, so a giveaway with a long duration still ends on time.
- If the bot cannot read reactions on a reaction giveaway it falls back to the current server emote, but if the emote was changed to something nobody reacted with, the draw finds no entrants.
- The dashboard's **Active Giveaways** list also shows ended giveaways, and the **Ended Giveaways** tab is currently empty. Use the end time and the missing **End Giveaway** button to tell them apart.
- Captcha entry needs the dashboard to be reachable and the member to sign in with Discord; the entry is tied to that account, not to anything typed on the page.
- Winner DMs fail silently if the winner has DMs closed. The channel announcement still goes out.
