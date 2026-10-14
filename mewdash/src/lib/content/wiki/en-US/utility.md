---
title: Utilities
slug: utility
summary: A toolbox of everyday helpers, from command aliases, quotes and reminders to auto-publishing, stream roles, an AI assistant, message counting and repeaters.
icon: fa-wrench
category: Actions
dashboard: /dashboard/utility
module: Utility
tags: [alias, quotes, auto publish, stream role, ai, chatbot, nsfw filter, role monitor, reminder, snipe, repeater, sticky, message count, invites, embed, calculator, userinfo, serverinfo]
related: [repeaters, polls, invites, messagestats, embedbuilder, xp, administration, moderation]
---

## What it does

Utility is the catch-all module for small features that most servers end up wanting. Members get reminders, quotes, dice rolls, a calculator, unit conversion, and info commands for users, roles, channels and the server. Staff get command aliases, repeating messages, auto-publishing for announcement channels, a role that follows members while they stream, deleted-message sniping, message counting and invite tracking.

The dashboard's **Utilities** page collects the parts that benefit from a form: aliases, quotes, auto publish, stream role, the AI assistant, the NSFW tag filter and the role monitor. Everything else is command-only.

Because this module is broad, each sub-feature below is described on its own. The command table at the end lists every command in the module.

## Why you would use it

- Shorten `play youtube` to `yt` for the whole server with an alias.
- Keep a shared quote book that members can add to and pull random lines from.
- Have every post in your announcements channel published to followers automatically.
- Give members a "Live" role only while they are streaming a specific game.
- Post rules or a sticky notice every few minutes, or only when the channel is active.
- Let members set reminders for themselves or for a channel.
- Run an AI assistant in one channel using your own API key.

## Aliases

An alias is a trigger word that the bot rewrites into another command before running it. `alias yt play youtube` means `.yt lofi` runs as `.play youtube lofi`. The trigger must be the first word of the message; anything after it is appended to the mapped command. Longer triggers are matched first. Running `alias <trigger>` with no mapping removes it, and `aliasesclear` removes them all.

On the dashboard, the **Aliases** tab has **Alias trigger** and **Alias mapping** fields, a search box, and a list you can delete from.

## Quotes

Quotes are short texts filed under a keyword. `quoteadd <keyword> <text>` stores one, `quoteprint <keyword>` (or `..`) shows a random quote for that keyword, and `quoteshow <id>` shows a specific one. `quotesearch` matches on keyword and text, `quoteid` shows who added a quote, and `listquotes` pages through them ordered by keyword or date added. Anyone can add quotes. A quote can be deleted by the member who added it or by an administrator; deleting every quote under a keyword, exporting to JSON and importing from a JSON attachment need Administrator.

The **Quotes** tab lets you add, edit, search and delete quotes.

## Auto publish

Discord announcement channels need each message to be published by hand. `addautopublish #channel` makes the bot publish every new message in that channel. Two blacklists per channel skip messages: `addpublishblacklist @user #channel` ignores a user, and `addpublishblacklist #channel word` ignores any message containing that word, case-insensitive. `getautopublishes` shows every channel with its blacklists.

The **Auto Publish** tab adds channels and manages the **Skip messages from these users** and **Skip messages containing these words** lists.

## Stream role

`streamrole <fromRole> <addRole>` gives **addRole** to any member of **fromRole** while they are streaming, and takes it away when they stop. `streamrolekeyword <keyword>` limits it to streams whose title contains the keyword; run it with no keyword to clear. Whitelisted members get the role while streaming even if the keyword does not match, and blacklisted members never get it. `streamrole` with no arguments turns the feature off. If the bot loses permission to manage the role, or the role is deleted, the feature disables itself.

The **Stream Role** tab has **Eligible role**, **Role while streaming**, **Stream title keyword** and a **Whitelist** and **Blacklist** list by user ID.

## AI assistant

The assistant answers every message posted in one chosen channel, keeping the last five exchanges per member as context. Typing `deletesession` in that channel clears your own conversation.

| Setting | Command | What it does |
| --- | --- | --- |
| Channel | `aichannel [#channel] [enabled]` | The one channel the assistant listens in |
| Provider and model | `aimodel <OpenAi\|Groq\|Claude> [model]` | Which API and model to call |
| API key | `aikey` | Your own key for that provider; it is stored by the bot and not shown again |
| System prompt | `aiprompt <text>` | Instructions the model follows |
| Web search | `aiwebsearch <true\|false>` | Lets the model search the web (Claude only) |
| Webhook | `aiwebhook [name] [avatarUrl]` | Post replies through a webhook with a custom name and avatar |
| Custom embed | `aicustomembed [template]` | Wrap replies in an embed; `%airesponse%` marks where the answer goes |

`aiconfig` shows the current configuration. The **AI Assistant** tab has **Assistant enabled**, **Channel**, **Provider**, **Model**, **API key**, **System prompt**, **Allow web search** and **Hide "searching the web" notices**.

> [!WARNING]
> The assistant runs on your API key and your bill. Without a key set, messages in the channel get an error reply.

## NSFW filter

The **NSFW Filter** tab lists blocked tags for the NSFW module's image searches. Type a tag in **Tag to block** to add it, or click one to remove it. The matching command is `nsfwtagbl [tag]` from the NSFW module; with no tag it lists the current blacklist.

## Role monitor

The **Role Monitor** tab configures the Server Management module's role monitor, which reacts when a role or permission you have marked as protected is handed out. Choose a **Default punishment** (only revert the change, warn, remove all roles, mute, timeout, kick or ban), add roles and permissions to protect, and list **Trusted roles** and **Trusted members** who are exempt. The commands (`addblacklistedrole`, `addblacklistedpermission`, `whitelistuser`, `whitelistrole`, `setdefaultpunishment`, `listblacklists`) are server-owner only and live in Server Management.

## Reminders

`remind me <time> <message>` DMs you later; `remind here <time> <message>` posts in the current channel; `remind #channel <time> <message>` targets another channel and needs Manage Messages. Time is written like `2h30m`, `3 days`, `1w` or `in 45 minutes`, and can be at most 60 days away. `remindlist` shows your reminders with index numbers and `reminddelete <index>` removes one. Mentions in the message are neutralised unless you can mention everyone in that channel.

## Snipe

Sniping is off until an administrator runs `snipeset enable`. Once on, the bot keeps deleted and edited messages for 30 days. `snipe [#channel] [@user]` shows the most recent deleted message, `editsnipe` the most recent edit, and `snipelist` and `editsnipelist` show the last five (or a number you give), filtered by channel or user.

## Repeaters

A repeater posts a message on a schedule. `repeat <message>` uses a five-minute interval; `repeat <interval> <message>` sets one between 5 seconds and 25000 minutes; `repeat <time of day> <message>` runs once a day. Each repeater has an index shown by `repeatlist`.

| Trigger mode | Behaviour |
| --- | --- |
| `timeinterval` | Post every interval (default) |
| `onactivity` | Post after the channel sees a set number of messages within a time window (`repeatactivity`) |
| `onnoactivity` | Post when the channel has been quiet for the window |
| `immediate` | Post right away, then follow the interval |
| `aftermessages` | Post after a set number of messages |

Other per-repeater switches: `repeatredun` skips posting if the repeater's message is already the last one in the channel; `repeatschedule <business\|evening\|weekend\|custom>` limits when it runs; `repeatconversation` toggles conversation detection; `repeatpriority` orders repeaters 0 to 100; `repeatthreadonly` and `repeatthreadautosticky` target threads; `repeatforumtags` restricts forum posts by tag; `repeatsuppressnotifications` sends silently; `repeattoggle` pauses.

## Message counting and invites

`togglemsgcount` turns message counting on. `usermessages`, `channelmessages`, `servermessages` and `topusers` report counts, `activitygraph` draws busiest hours or days, and `minmsglength` ignores messages shorter than a length. `resetmessagecounts` clears counts for a user, a channel or both after confirmation.

Invite tracking records who invited each member. `invites`, `whoinvited`, `invitedusers` and `inviteleaderboard` read the data. `toggleinvitetracking`, `toggleremoveinviteonleave` and `setminaccountage <days>` control it; accounts younger than the minimum age are not counted.

## Settings

The dashboard page is split into tabs: **Aliases**, **Quotes**, **Auto Publish**, **Stream Role**, **AI Assistant**, **NSFW Filter** and **Role Monitor**.

| Setting | Default | What it controls |
| --- | --- | --- |
| Alias trigger and mapping | none | Word to rewrite and the command it becomes |
| Quote keyword and text | none | A stored quote |
| Auto publish channels | none | Announcement channels the bot publishes in |
| Skip messages from these users / containing these words | none | Per-channel publish blacklists |
| Eligible role | none | Members who can receive the stream role |
| Role while streaming | none | The role added and removed |
| Stream title keyword | any stream | Only streams whose title contains this text count |
| Assistant enabled | off | Whether the AI channel responds |
| Provider, Model, API key, System prompt | none | AI configuration |
| Allow web search | off | Claude web search |
| Hide "searching the web" notices | on | Suppress the model's web search status messages |
| Blocked tags | none | NSFW search tags that are filtered |
| Default punishment | use default | Role monitor action |

Sniping, message counting, invite tracking, repeaters, reminders and link previews have no dashboard controls.

## Setup walkthrough

1. Open **Utilities** in the dashboard.
2. On **Aliases**, add a trigger such as `yt` mapped to `play youtube`. Test it in Discord.
3. On **Auto Publish**, add your announcements channel. Add any bot or webhook users to the skip list.
4. On **Stream Role**, pick the eligible role and the role to add, and optionally a title keyword. Check the bot's role is above the role it adds.
5. On **AI Assistant**, choose a channel, provider and model, paste your key, write a system prompt and enable it.
6. In Discord, run `snipeset enable` if you want deleted-message sniping and `togglemsgcount` for message statistics.

## Commands

Run these with your server's prefix (`.` unless you changed it).

| Command | Aliases | Needs | Purpose |
| --- | --- | --- | --- |
| `alias <trigger> [mapping]` | `cmdmap` | Administrator | Add an alias, or remove it with no mapping |
| `aliaslist` | `cmdmaplist`, `aliases` | Nobody | List aliases |
| `aliasesclear` | `aliasclear` | Administrator | Remove every alias |
| `quoteadd <keyword> <text>` | `.` | Nobody | Add a quote |
| `quoteprint <keyword>` | `..` | Nobody | Random quote for a keyword |
| `quoteshow <id>` | | Nobody | Show a quote by ID |
| `quotesearch <keyword> <text>` | `qsearch` | Nobody | Find a quote by keyword and text |
| `quoteid <id>` | `qid` | Nobody | Who added a quote |
| `listquotes [page] [order]` | `liqu` | Nobody | Page through quotes |
| `quotedelete <id>` | `qdel` | Nobody (own quotes) or Administrator | Delete a quote |
| `delallquotes <keyword>` | `daq`, `delallq` | Administrator | Delete all quotes under a keyword |
| `quoteexport` | `qexport` | Administrator | Export quotes as JSON |
| `quoteimport` | `qimport` | Administrator | Import quotes from an attached JSON file |
| `addautopublish <#channel>` | `addautopub`, `aap` | Administrator | Auto-publish a news channel |
| `removeautopublish <#channel>` | `removeautopub` | Administrator | Stop auto-publishing |
| `addpublishblacklist <@user> <#channel>` or `<#channel> <word>` | `addpubbl` | Administrator | Skip a user or word |
| `removepublishblacklist <@user> <#channel>` or `<#channel> <word>` | `removepubbl` | Administrator | Remove a skip |
| `getautopublishes` | `getaps` | Administrator | List auto-publish channels |
| `streamrole [fromRole] [addRole]` | | Manage Roles | Set the stream role, or disable it with no roles |
| `streamrolekeyword [keyword]` | `srkw` | Manage Roles | Require a keyword in the stream title |
| `streamroleblacklist <add\|remove> <@user>` | `srbl` | Manage Roles | Never give the role to this member |
| `streamrolewhitelist <add\|remove> <@user>` | `srwl` | Manage Roles | Always give the role to this member while streaming |
| `aichannel [#channel] [enabled]` | `aic` | Manage Server | Set the AI channel |
| `aimodel <provider> [model]` | `aim` | Manage Server | Provider and model |
| `aikey` | `ak` | Administrator | Set the API key |
| `aiprompt <text>` | `aip` | Manage Server | System prompt |
| `aiwebsearch <true\|false>` | `aws` | Manage Server | Claude web search |
| `aiwebhook [name] [avatar]` | `aiw` | Administrator | Reply through a webhook, or disable with no name |
| `aicustomembed [template]` | `aice` | Administrator | Embed template for replies |
| `aiconfig` | `ac` | Nobody | Show AI settings |
| `remind <me\|here> <time> <message>` | | Nobody | Set a reminder |
| `remind <#channel> <time> <message>` | | Manage Messages | Reminder in another channel |
| `remindlist` | `remindl`, `remindlst` | Nobody | Your reminders |
| `reminddelete <index>` | `remindrm`, `reminddel` | Nobody | Delete a reminder |
| `snipeset <enable\|disable>` | `setsnipe` | Administrator | Turn sniping on or off |
| `snipe [#channel] [@user]` | | Nobody | Last deleted message |
| `editsnipe [#channel] [@user]` | | Nobody | Last edited message |
| `snipelist [#channel] [@user] [amount]` | `slist` | Nobody | Recent deleted messages |
| `editsnipelist [#channel] [@user] [amount]` | `esnipelist` | Nobody | Recent edited messages |
| `repeat [time] [interval] <message>` | | Manage Messages | Create a repeater |
| `repeatlist` | `replst`, `replist`, `repli` | Manage Messages | List repeaters |
| `repeatremove <index>` | `reprm` | Manage Messages | Delete a repeater |
| `repeatinvoke <index>` | `repinv` | Manage Messages | Post it now |
| `repeatmessage <index> <message>` | `repmsg` | Manage Messages | Change the text |
| `repeatchannel <index> [#channel]` | `repchan` | Manage Messages | Move it |
| `repeatredun <index>` | `repred` | Manage Messages | Toggle the redundancy check |
| `repeattriggermode <index> <mode>` | `reptriggermode`, `repmode` | Manage Messages | Trigger mode from the table above |
| `repeatactivity <index> <messages> <window>` | `repactivity`, `repact` | Manage Messages | Activity threshold |
| `repeatpriority <index> <0-100>` | `reppriority`, `repprio` | Manage Messages | Priority |
| `repeatschedule <index> <preset>` | `repschedule`, `repsched` | Manage Messages | Time-of-day schedule |
| `repeatconversation <index>` | `repconversation`, `repconv` | Manage Messages | Toggle conversation detection |
| `repeattoggle <index>` | `reptoggle`, `reptog` | Manage Messages | Pause or resume |
| `repeatthreadautosticky <index>` | `repthreadauto`, `repthreads` | Manage Messages | Sticky in new threads |
| `repeatthreadonly <index>` | `repthreadonly`, `reptonly` | Manage Messages | Only post in threads |
| `repeatsuppressnotifications <index>` | `repsuppressnotif`, `repsilent`, `repsuppress` | Manage Messages | Send silently |
| `repeatforumtags <index> <action> [tagType] [tags]` | `repforumtags`, `repftags` | Manage Messages | Forum tag rules |
| `togglemsgcount` | `togglemessagecount` | Administrator | Turn message counting on or off |
| `minmsglength [length]` | `mmlength`, `minmlength` | Manage Server | Ignore short messages |
| `usermessages [@user]` | `usermsg`, `umsg` | Nobody | A member's message stats |
| `channelmessages [#channel]` | `channelmsg`, `cmsg` | Nobody | A channel's message stats |
| `servermessages` | `servermsg`, `smsg`, `guildmessages`, `guildmsg`, `gmsg` | Nobody | Server-wide stats |
| `topusers` | `topu` | Nobody | Top ten by message count |
| `activitygraph [days\|hours]` | `actgraph` | Nobody | Busiest times graph |
| `resetmessagecounts [@user] [#channel]` | `rmc`, `resetmsgcounts`, `resetmessages`, `resetcounts` | Manage Messages | Reset counts |
| `invites [@user]` | | Nobody | Invite count |
| `whoinvited [@user]` | `invitedby` | Nobody | Who invited a member |
| `invitedusers [@user]` | `userinvites` | Nobody | Members someone invited |
| `inviteleaderboard` | `inviteslb` | Nobody | Top inviters |
| `invitesettings` | `inviteconfig` | Manage Server | Show invite settings |
| `toggleinvitetracking` | | Manage Server | Turn tracking on or off |
| `toggleremoveinviteonleave` | `triol` | Manage Server | Uncount invites when the invitee leaves |
| `setminaccountage <days>` | `inviteminage` | Manage Server | Ignore young accounts |
| `joinstats` | `jstats` | Beta flag (`dragon`) | Join graph |
| `leavestats` | `lstats` | Beta flag (`dragon`) | Leave graph |
| `joinstatscolor [r g b]` | `jstatscolor` | Beta flag (`dragon`) | Join graph colour, gold with no values |
| `leavestatscolor [r g b]` | `lstatscolor` | Beta flag (`dragon`) | Leave graph colour, gold with no values |
| `userinfo [@user]` | `uinfo` | Nobody | Member details |
| `serverinfo [name]` | `sinfo` | Nobody | Server details |
| `channelinfo [#channel]` | `cinfo` | Nobody | Text channel details |
| `vinfo [channel]` | `voiceinfo` | Nobody | Voice channel details |
| `rinfo <role>` | `roleinfo` | Nobody | Role details |
| `fetch <id>` | | Nobody | Look up any user by ID |
| `avatar [@user]` | `av` | Nobody | Avatar, with a button for the server avatar |
| `banner [@user]` | `userbanner` | Nobody | User banner |
| `userid [@user]` | `uid` | Nobody | User ID |
| `roleid <role>` | `rid` | Nobody | Role ID |
| `channelid` | `cid` | Nobody | Channel ID |
| `serverid` | `sid` | Nobody | Server ID |
| `roles [@user]` | | Nobody | Server roles, or a member's roles |
| `inrole <role>` | | Nobody | Members with a role |
| `inroles <role> <role>` | | Nobody | Members with both roles |
| `rolepermlist [and\|or] <permissions...>` | `roleperms` | Nobody | Roles holding permissions |
| `channeltopic [#channel]` | `ct` | Nobody | Channel topic |
| `whosplaying <game>` | `whpl` | Nobody | Members playing a game |
| `emotelist [type]` | | Nobody | Server emotes |
| `showemojis <emojis>` | `se` | Nobody | Enlarge emojis |
| `say [#channel] <text or embed JSON>` | | Manage Messages | Speak as the bot |
| `getjson <messageId> [#channel]` | | Manage Messages | Embed JSON of a message |
| `embedsave <name> <json>` | `esave` | Nobody | Save a personal embed template |
| `guildembedsave <name> <json>` | `gesave`, `gembedsave` | Manage Messages | Save a server embed template |
| `embedlist` / `guildembedlist` | `elist` / `gelist`, `gembedlist` | Nobody | List templates |
| `embeddelete <name>` / `guildembeddelete <name>` | `edel`, `edelete` / `gedel`, `gembeddelete` | Nobody / Manage Messages | Delete a template |
| `embedpreview <name>` | `epreview`, `eprev` | Nobody | Preview a template |
| `debugembed <text>` | `embeddebug` | Administrator | Test embed parsing |
| `savechat <time> [#channel]` | | Manage Messages | Save a chat log and get a link |
| `calculate <expression>` | `calc` | Nobody | Evaluate maths |
| `calcops` | | Nobody | Available maths operations |
| `plot <function> [start] [end]` | `graphfunction` | Nobody | Graph a function |
| `sym <expression>` | `symbolicmath` | Nobody | Symbolic maths |
| `convertunits <from> <to> <value>` | `unitconvert`, `units` | Nobody | Unit conversion |
| `convertlist` | | Nobody | Supported units |
| `convert <format>` | | Nobody | Convert an attached media file |
| `roll <dice>` | | Nobody | Roll dice, DnD notation supported |
| `owoify <text>` | `owo` | Nobody | OwOify text |
| `vcheck [url]` | `viruscheck` | Nobody | VirusTotal scan of a link |
| `traceroute <host>` | `tracert`, `trcrt` | Nobody | Trace the route to a host |
| `pingip <ip> [count]` | | Nobody | Ping an address, up to 10 times |
| `previewlinks <yes\|no>` | `plinks` | Administrator | Toggle link previews |
| `verboseerror [true\|false]` | `ve` | Manage Messages | Toggle detailed command errors |
| `ping` | | Nobody | Bot latency |
| `stats` | | Nobody | Bot statistics |
| `invite` | | Nobody | Bot invite and support links |
| `vote` | | Nobody | Vote link |

## Tips and gotchas

- An alias only rewrites the text; the mapped command still runs with its own permission checks.
- Auto publish only works in Discord announcement (news) channels.
- Stream role needs the bot's role above the role it adds. If it cannot manage the role, the feature switches itself off rather than failing silently on every stream.
- Sniping is off by default, and snipes older than 30 days are dropped.
- Reminders longer than 60 days are rejected.
- The AI assistant only responds in the one configured channel and ignores bots. Its memory is the last five messages per member, so long conversations lose early context.
- Message counting has to be switched on before any statistics exist; nothing is counted retroactively.
- `joinstats` and `leavestats` can be run once every ten seconds.
