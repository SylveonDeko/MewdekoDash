---
title: Triggers
slug: chat-triggers
summary: Automatic responses to messages, reactions, slash commands and bot events, with conditions, costs, counters, role grants and a full placeholder set.
icon: fa-comments
category: Actions
dashboard: /dashboard/chat-triggers
module: ChatTriggers
tags: [chat triggers, triggers, autoresponder, custom commands, auto reply, reaction roles, regex, counters, placeholders, event triggers]
related: [administration, xp, currency, tickets, giveaways]
---

## What it does

A trigger is a piece of text the bot watches for and a response it sends when it sees it. In the simplest form, a member types `hello` and the bot replies `hi there`. From there a trigger can match anywhere in a message or by regular expression, respond with an embed, react with emoji, send the reply as a DM, delete the member's message, grant or remove roles, post a copy to another channel or webhook, and run a second trigger when it finishes.

Triggers do not have to be messages. The same trigger can be registered as a slash, message or user context command, fire when someone adds or removes a specific reaction, or fire on a bot event such as a level up, a member joining, a boost starting, a ticket opening or a giveaway being won.

Each trigger carries its own conditions: a cooldown per user, channel or server, a required XP level, a currency cost or reward, active hours and days, an expiry date, a use limit, a minimum account age or time in the server, and a counter that has to be within a range. If a condition fails the trigger stays quiet, or shows a message you wrote. The dashboard tester tells you exactly which rule would block a sample message.

Responses can read values from the rest of the bot: the member's level, balance, reputation or message count, the text after the trigger, the people they mentioned, the message they replied to, capture groups from a regex, and server-wide counters that a response can read and bump.

## Why you would use it

- Auto-answer common questions: `!rules` posts the rules embed.
- Fun commands members can run for free without the bot's built-in command set.
- A `daily` style trigger that pays currency once per user per day using a cooldown and a reward.
- A "verify" word that grants a role and deletes the message.
- Reaction roles that hand out a role when someone reacts with a given emoji.
- Custom level-up, welcome or boost announcements, formatted the way you like, fired by the event instead of a message.
- Running counters like "days since last incident" that anyone can bump with a word.

## Trigger types

A trigger has a set of enabled types. A type controls what can fire it. Message is on by default; the others are enabled per trigger with `chattriggervalidtype` or the toggles on the dashboard.

| Type | Fires when |
| --- | --- |
| Message | A message matches the trigger text |
| Interaction | Someone runs the slash, message or user command registered for it |
| Button | A button component whose ID matches the trigger is pressed |
| Reactions | Someone adds the trigger emoji to a message |
| ReactionsRemoved | Someone removes the trigger emoji from a message |
| Event | One of the bot events below happens |

### Message matching

By default the whole message, lower-cased, must equal the trigger. Two options relax that:

- **Match anywhere in the message** (`ctca`): the trigger must appear as a whole word somewhere in the message.
- **Allow targeting someone** (`ctat`): the message may start with the trigger followed by a space and more text, which becomes `%target%`.

**Regular expression** triggers (`addchattriggerregex`) match the message against the pattern. Each pattern gets 100 milliseconds; one that times out is skipped. Named or numbered capture groups are available in the response as `%regex.1%` or `%regex.name%`.

A **prefix requirement** decides whether the message must start with a prefix before matching:

| Option | Behaviour |
| --- | --- |
| No prefix needed | Match the bare text (default) |
| Global prefix | Must start with the bot's global prefix |
| Server prefix, or global | Must start with the server prefix, falling back to the global one |
| Server prefix if one is set | Must start with the server prefix; never matches if the server has none |
| A custom prefix | Must start with the prefix set by `ctprefix` |

If several triggers match one message, one of them is picked at random. Messages from bots and webhooks are ignored unless a trigger has **Bots only** (`ctallowbots`) on, and such a trigger then responds only to bot messages. The bot never responds to its own messages.

### Interaction triggers

`setctintertype` registers the trigger as a Slash, Message or User application command. `setctintername` and `setctinterdesc` set its name and description; names must follow Discord's command naming rules. `ctinterephemeral` makes the reply visible only to the person who ran it. `ctintererrors` lists why registration failed, such as duplicate names or too many subcommands.

### Reaction triggers

`addreactiontrigger <emoji> <response>` creates a trigger whose text is the emoji. Enable **Reaction added** or **Reaction removed** as its types. The response is posted in the channel of the reacted message, and role grants use the reacting member (or, for **People they mentioned**, the mentions in the reacted message). Reactions from bots are ignored.

### Event triggers

`ctevent <id> <event>` makes a trigger fire on an event instead of a message and turns on the Event type for it. Events:

| Event | Fires for |
| --- | --- |
| XpLevelUp | A member gains a level |
| XpLevelDown | A member loses a level |
| MemberJoin | A member joins |
| MemberLeave | A member leaves |
| VoiceJoin | A member joins a voice channel |
| VoiceLeave | A member leaves a voice channel |
| Boost | A member starts boosting |
| BoostEnd | A member stops boosting |
| TicketOpened | A ticket is opened |
| TicketClosed | A ticket is closed |
| GiveawayWon | A member wins a giveaway |

The response goes to the channel set with `cteventchannel`, or to the channel where the event happened if none is set. Joins, leaves, voice and boost events have no channel of their own, so those triggers need an explicit channel or they do nothing. Event triggers run through the same conditions and economy checks as message triggers, and the member the event concerns is treated as the user for placeholders and role grants.

## Responses

The primary response is the text given when the trigger is created. It goes through the embed parser, so it can be plain text, an embed, several embeds, or components built in the dashboard's embed editor. Extra responses can be added with `ctaddresponse`, and the **Response mode** decides which are sent:

| Mode | Behaviour |
| --- | --- |
| Single | Always the first response (default) |
| Random | One picked at random; repeat a line to weight it |
| RoundRobin | In order, one per use, shared across the server |
| All | Every response, in order |

Delivery options, all off by default:

- **Reply to the message** (`ctreply`): sends the response as a Discord reply.
- **Send the response as a DM** (`ctdm`): sends it to the member privately.
- **Delete the triggering message** (`ctad`): removes what they typed.
- **React to the message instead** (`rtt`): puts the trigger's emoji on their message rather than on the reply. Cannot be combined with delete.
- **Send no message at all** (`ctnr`): useful for role-only triggers.
- **Delete the response after** (`ctdeleteafter`): seconds before the bot's reply is deleted; 0 keeps it.
- **Emoji to react with** (`ctreact`): up to six emoji, added one per second. With no emoji the list is cleared.

### Crossposting

`ctcpch` posts a copy of every response to another channel in the server. `ctcpwh` posts it through a webhook URL instead, which can be in another server. Crossposting happens even when **Send no message at all** is on.

### Roles

**Roles to grant** and **Roles to remove** (`ctrgranttoggle`, `ctrremovetoggle`) are applied when the trigger fires. Running the toggle again for the same role removes it from the list. **Apply those roles to** (`chattriggerrolegranttype`) chooses the target:

| Target | Who is affected |
| --- | --- |
| Sender | The member who fired the trigger (default) |
| Mentioned | Up to five members mentioned in the message |
| Both | The sender plus up to four mentioned members |

When the target includes mentions, the mentions are stripped from the message before matching, so `verify @someone` still matches a trigger of `verify`.

### Chaining

`ctchain <id> <nextId>` runs a second trigger after the first one finishes. The second is evaluated on its own terms, including its conditions and costs. A chain stops after five steps and never revisits a trigger it has already run.

## Conditions

All of these are checked before anything is charged, sent or counted. A failed condition means the trigger silently does not fire, except for the level and currency checks, which show the **Message when they cannot use it** if you set one with `ctreqmsg`.

| Condition | Command | Default | Behaviour |
| --- | --- | --- | --- |
| Cooldown | `ctcooldown <id> <seconds> [scope]` | none | Blocks repeat fires for that many seconds. Scope is `User`, `Channel` or `Guild` |
| Required level | `ctreqlevel <id> <level>` | 0 | The member's XP level must be at least this |
| Cost | `ctcost <id> <amount>` | 0 | Currency taken from the member; no fire if they cannot pay |
| Reward | `ctreward <id> <amount>` | 0 | Currency paid to the member when it fires |
| XP reward | `ctxpreward <id> <amount>` | 0 | XP granted when it fires |
| Active hours | `cttime <id> <HH:mm> <HH:mm> [days...]` | always | Only fires inside the window, in the server's timezone. An end before the start runs overnight. Days are names or 0 to 6 with Sunday as 0 |
| Expiry | `ctexpiry <id> [duration]` | never | Stops firing after the duration from now, for example `7d` |
| Use limit | `ctmaxuses <id> <uses>` | unlimited | Stops after that many fires; 0 removes the limit |
| Minimum account age | `ctminage <id> [duration]` | none | The account must be at least this old |
| Minimum time in server | `ctminmember <id> [duration]` | none | The member must have joined at least this long ago |
| Counter range | `ctrequirecounter <id> <name> [min] [max]` | none | The named counter must be within the range; `clear` as the name removes it |

The cooldown starts only after every other condition passes, so a blocked attempt does not consume it. The cost is taken before the reward is paid, so a trigger that both costs and pays never pays someone who could not afford it. Server-wide command cooldowns set with `cmdcd` also apply to triggers, per user, on top of the trigger's own cooldown.

## Counters

Counters are named numbers stored per server. They are created the first time a response uses them and can be read or changed from any response:

| Placeholder | Effect |
| --- | --- |
| `%counter:name%` | Shows the counter |
| `%counter:name+%` | Adds one and shows the new value |
| `%counter:name-%` | Subtracts one and shows the new value |
| `%usercounter:name%` | Shows the firing member's own value for that name |
| `%usercounter:name+%` | Adds one to the member's value |
| `%usercounter:name-%` | Subtracts one from the member's value |

Names are up to 64 letters, digits, underscores or hyphens and are case-insensitive. `ctcounters` lists them, `ctcounterset` sets one to an exact value, and `ctcounterdelete` removes it along with every per-user value under that name. The dashboard sidebar has a **Counters** panel for the same.

## Placeholders

A response can use the general placeholder set (user, server, channel, bot and time placeholders from the placeholders page), the trigger placeholders, and the placeholders other modules contribute. `ctplaceholders` lists the contributed ones live.

| Placeholder | Value |
| --- | --- |
| `%target%` | Everything typed after the trigger (needs **Allow targeting someone** or match anywhere) |
| `%targetuser%` | Mention of the first person mentioned in the message |
| `%targetuser.id%`, `%targetuser.name%`, `%targetuser.avatar%` | That person's ID, username and avatar |
| `%targetusers%`, `%targetusers.id%` | Everyone mentioned, as mentions or IDs |
| `%replied.content%` | Content of the message the member replied to |
| `%replied.author%`, `%replied.author.id%` | Author of that message |
| `%usecount%` | How many times this trigger has fired |
| `%regex.1%`, `%regex.name%` | Capture groups of a regex trigger |
| `%img:tag%` | A random Imgur image for that tag |
| `%rng%` | A random number from the general placeholder set |
| `%xp.level%`, `%xp.rank%`, `%xp.total%`, `%xp.current%`, `%xp.required%`, `%xp.remaining%`, `%xp.bonus%` | The member's XP stats |
| `%targetuser.xp.level%`, `%targetuser.xp.rank%`, `%targetuser.xp.total%` | The mentioned person's XP stats |
| `%currency.balance%`, `%currency.bank%`, `%currency.total%`, `%currency.emote%` | The member's currency |
| `%targetuser.currency.balance%`, `%targetuser.currency.bank%` | The mentioned person's currency |
| `%rep%`, `%rep.rank%`, `%targetuser.rep%`, `%targetuser.rep.rank%` | Reputation |
| `%messages%`, `%messages.channel%`, `%messages.server%`, `%targetuser.messages%` | Message counts |
| `%invites%`, `%targetuser.invites%`, `%inviter%` | Invite counts and who invited the member |
| `%targetuser.afk%` | The mentioned person's AFK message |
| `%counter:name%` and friends | Counters, as above |

Mentions inside `%target%` are neutralised unless the member could ping everyone themselves.

> [!EXAMPLE]
> Trigger `daily`, response `%user.mention% claimed today's bonus. Balance: %currency.balance%`, with `ctreward 12 100`, `ctcooldown 12 86400 User` and `ctreqmsg 12 Come back tomorrow.`

## The tester

`cttest <id> <sample message>` or the **Test this trigger** box on a trigger card checks whether that message would fire the trigger as you, without sending, charging or counting anything. It reports whether the text matched and, if the trigger would not fire, which rule stops it: disabled, bots only, no match, a permission entry, a permission override, expiry, cooldown, counter, use limit, active hours, account age, membership, level, balance, or the server command cooldown.

## Categories and organisation

`ctcategory <id> <name>` puts a trigger in a category. `ctcategorytoggle <name> <true or false>` enables or disables every trigger in it at once, and the dashboard sidebar filters by category. `cttoggle` pauses a single trigger without deleting it. `ctstats` shows how often a trigger has fired and who fired it recently.

`ctsexport` downloads every trigger as a YAML file and `ctsimport` loads one from an attachment or URL. `ctsclear` deletes every trigger after confirmation.

## Settings

Everything is per trigger. The Chat Triggers page has a **Simple Mode** with a **Quick Setup** form (trigger text plus response) and an **Advanced Mode** with **Advanced Trigger Creation**, where you pick the **Pattern Type** (Normal Text Pattern or Regular Expression Pattern), the trigger types, and can test a regex before saving.

Each trigger card expands to show **Trigger Text**, the **Response Message** editor, the tester, and an accordion of settings grouped by topic:

| Group | Settings |
| --- | --- |
| When it matches | Prefix requirement, Custom prefix, Match anywhere in the message, Allow targeting someone, Bot owner only |
| How it responds | Reply to the message, Send the response as a DM, Delete the triggering message, React to the message instead, Send no message at all, Emoji to react with, Delete the response after, Extra responses, When there are several responses |
| Roles | Roles to grant, Roles to remove, Apply those roles to |
| Limits | Cooldown (seconds), Cooldown applies to, Stop after this many uses, Stop firing after, Minimum account age (minutes), Minimum time in server (minutes), Only active at certain hours with From, Until and On these days |
| Costs and rewards | Costs the user, Pays the user, Grants XP, Requires level, Message when they cannot use it |
| Counter requirement | Counter name, At least, At most |
| Fire on an event | Fire when, Respond in |
| Organisation | Category, Then run trigger, Respond to bots instead of people |

The sidebar lists categories, **Counters** and the live **Placeholders** list, and has a search box for triggers and responses.

## Setup walkthrough

1. Open **Triggers** in the dashboard. In **Simple Mode**, type the trigger word and build the response in the editor, then create it.
2. Expand the new card. Under **When it matches**, turn on **Match anywhere in the message** if the word should work mid-sentence.
3. Under **How it responds**, choose whether to reply, DM, or delete the member's message.
4. Under **Limits**, set a cooldown so it cannot be spammed.
5. Type a sample message into **Test this trigger** and press **Test**. Fix whatever it says is blocking.
6. For a level-up announcement, create a trigger with any text, set **Fire when** to "Member levels up", leave **Respond in** empty to post where the member was talking, and use `%user.mention%` and `%xp.level%` in the response.
7. Give related triggers a **Category** so you can pause them together.

## Commands

Run these with your server's prefix (`.` unless you changed it). Trigger IDs are shown by `listchattriggers`.

| Command | Aliases | Needs | Purpose |
| --- | --- | --- | --- |
| `addchattrigger <trigger> <response>` | `act`, `acr` | Administrator | Create a trigger; quote multi-word triggers |
| `addchattriggerregex <pattern> <response>` | `actr` | Administrator | Create a regex trigger |
| `addreactiontrigger <emoji> <response>` | `addrt` | Administrator | Create a reaction trigger |
| `editchattrigger <id> <response>` | `ect` | Administrator | Replace the primary response |
| `deletechattrigger <id>` | `dct` | Administrator | Delete a trigger |
| `listchattriggers` | `lct` | Administrator | List triggers with IDs |
| `listchattriggersgroup` | `lctg` | Administrator | List triggers grouped by text |
| `showchattrigger <id>` | `sct` | Administrator | Show one trigger's settings |
| `cttoggle <id>` | `chattriggertoggle` | Administrator | Pause or resume a trigger |
| `ctca <id>` | | Administrator | Toggle match anywhere |
| `ctat <id>` | | Administrator | Toggle allow targeting |
| `ctdm <id>` | | Administrator | Toggle DM response |
| `ctad <id>` | | Administrator | Toggle deleting the triggering message |
| `rtt <id>` | `reactottrigger` | Administrator | Toggle reacting to the message instead of the reply |
| `ctnr <id>` | `chattriggernoresponse` | Administrator | Toggle sending no message |
| `ctreply <id>` | `chattriggerreply` | Administrator | Toggle replying to the message |
| `ctdeleteafter <id> <seconds>` | `chattriggerdeleteafter` | Administrator | Delete the response after a delay |
| `ctreact <id> [emoji...]` | `ctr` | Administrator | Set up to six reactions, or clear them |
| `ctaddresponse <id> <response>` | `chattriggeraddresponse` | Administrator | Add an extra response |
| `ctclearresponses <id>` | `chattriggerclearresponses` | Administrator | Remove extra responses |
| `ctresponsemode <id> <mode>` | `chattriggerresponsemode` | Administrator | `Single`, `Random`, `RoundRobin` or `All` |
| `ctprefixtype <id> <type>` | `chattriggersprefixtype` | Administrator | `None`, `Global`, `GuildOrGlobal`, `GuildOrNone` or `Custom` |
| `ctprefix <id> <prefix>` | `chattriggersprefix` | Administrator | Set the custom prefix |
| `chattriggervalidtype <id> <type> <true or false>` | `ctvalidtype`, `ctvt` | Administrator | Enable or disable a trigger type |
| `ctallowbots <id>` | `chattriggerallowbots` | Administrator | Toggle responding to bot messages only |
| `ctrgranttoggle <id> @role` | `ctgt`, `ctgranttoggle` | Administrator | Toggle a role to grant |
| `ctrremovetoggle <id> @role` | `ctrt`, `ctremovetoggle` | Administrator | Toggle a role to remove |
| `chattriggerrolegranttype <id> <type>` | `ctrolegranttype`, `ctrgt` | Administrator | `Sender`, `Mentioned` or `Both` |
| `chattriggerscrosspostchannel <id> <#channel>` | `ctcpch`, `ctcpchannel`, `ctcrosspostchannel`, `ctcrosspostch` | Administrator | Crosspost to a channel |
| `chattriggerscrosspostwebhook <id> <url>` | `ctcpwh`, `ctcpwebhook`, `ctcrosspostwebhook`, `ctcrosspostwh` | Administrator | Crosspost through a webhook |
| `setctintertype <id> <type>` | `ctitype`, `ctintertype` | Administrator | `None`, `Slash`, `Message` or `User` |
| `setctintername <id> <name>` | `ctiname`, `ctrealname` | Administrator | Application command name |
| `setctinterdesc <id> <description>` | `ctidesc`, `ctinterdesc` | Administrator | Application command description |
| `ctinterephemeral <id> <true or false>` | `ctieph` | Administrator | Ephemeral interaction reply |
| `ctintererrors` | `ctierrors`, `ctie` | Administrator | Show command registration errors |
| `ctevent <id> <event>` | `chattriggerevent` | Administrator | Fire on an event, or `None` to stop |
| `cteventchannel <id> [#channel]` | `chattriggereventchannel` | Administrator | Channel for event responses |
| `ctcooldown <id> <seconds> [scope]` | `chattriggercooldown` | Administrator | Per-trigger cooldown |
| `ctreqlevel <id> <level>` | `chattriggerrequiredlevel` | Administrator | Required XP level |
| `ctcost <id> <amount>` | `chattriggercost` | Administrator | Currency cost |
| `ctreward <id> <amount>` | `chattriggerreward` | Administrator | Currency reward |
| `ctxpreward <id> <amount>` | `chattriggerxpreward` | Administrator | XP reward |
| `ctreqmsg <id> [message]` | `chattriggerrequirementmessage` | Administrator | Message when a requirement fails |
| `cttime <id> <start> <end> [days...]` | `chattriggertime` | Administrator | Active hours, or `cttime <id> clear` |
| `ctexpiry <id> [duration]` | `chattriggerexpiry` | Administrator | Expiry, or none to clear |
| `ctmaxuses <id> <uses>` | `chattriggermaxuses` | Administrator | Use limit, 0 for none |
| `ctminage <id> [duration]` | `chattriggerminimumage` | Administrator | Minimum account age |
| `ctminmember <id> [duration]` | `chattriggerminimummembership` | Administrator | Minimum time in server |
| `ctrequirecounter <id> <name> [min] [max]` | `chattriggerrequirecounter` | Administrator | Counter range requirement |
| `ctcounters` | `chattriggercounters` | Nobody | List counters |
| `ctcounterset <name> <value>` | `chattriggercounterset` | Administrator | Set a counter |
| `ctcounterdelete <name>` | `chattriggercounterdelete` | Administrator | Delete a counter |
| `ctplaceholders` | `chattriggerplaceholders` | Nobody | List contributed placeholders |
| `ctcategory <id> [name]` | `chattriggercategory` | Administrator | Set or clear a category |
| `ctcategorytoggle <name> <true or false>` | `chattriggercategorytoggle` | Administrator | Enable or disable a category |
| `ctchain <id> <nextId>` | `chattriggerchain` | Administrator | Chain to another trigger, 0 to clear |
| `cttest <id> <sample>` | `chattriggertest` | Administrator | Dry-run a sample message |
| `ctstats <id>` | `chattriggerstats` | Administrator | Fire count and recent users |
| `ctsexport` | | Administrator | Export triggers as YAML |
| `ctsimport [url]` | | Administrator | Import from a URL or attachment |
| `ctsmigrate` | `ctsconvert` | Administrator | Convert old embed format, with a backup |
| `ctsclear` | | Administrator | Delete every trigger |
| `ctsreload` | | Bot owner | Reload triggers from the database |

## Tips and gotchas

- Triggers are matched against the lower-cased message, so trigger text is effectively case-insensitive.
- A trigger with **Match anywhere** off must be the entire message. `hello there` will not fire a trigger of `hello` unless you turn it on or enable targeting.
- Role grants need Manage Roles and the bot's role above the roles involved. The command that adds a role to the list also checks that you can manage it.
- Bots only triggers never respond to humans, and human triggers never respond to bots; a single trigger cannot do both.
- Cooldowns live in memory and reset when the bot restarts. Use limits and expiry are stored and survive restarts.
- Round robin order is shared by everyone in the server, not tracked per member.
- The permission system's entries for the module `ActualChatTriggers` and any `permoverride` for the trigger text are checked before the trigger's own conditions.
- Interaction triggers register real application commands, so Discord's limits on command counts and names apply. Check `ctintererrors` when one does not show up.
- Reactions on the response are paced one per second, so six emoji take six seconds to appear.
- Event triggers for joins, leaves, voice and boosts silently do nothing until you set **Respond in**.
