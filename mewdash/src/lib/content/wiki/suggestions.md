---
title: Suggestions
slug: suggestions
summary: Give members a channel or button to submit ideas, let the server vote on them, and have staff accept, deny, consider or implement each one with a reason.
icon: fa-lightbulb
category: Community
dashboard: /dashboard/suggestions
module: Suggestions
tags: [suggestions, ideas, feedback, voting, accept, deny, consider, implement, threads, suggest button, placeholders]
related: [administration, afk]
---

## What it does

A member runs `suggest` with their idea, types it straight into the suggestion channel, or presses a **Suggest Here!** button and fills in a form. The bot deletes the original message, posts a numbered suggestion embed in the suggestion channel, and attaches vote emotes as reactions or buttons. Each suggestion gets a number that staff use to refer to it later.

Staff then move the suggestion through four states: accept, deny, consider or implement, each with an optional reason. The bot edits the original suggestion message into a coloured status embed, DMs the member who suggested it with the outcome, and can repost the status embed into a separate channel per state so accepted ideas live in one place and denied ones in another.

Optionally every suggestion carries a **Join/Create Discussion** button that opens a public or private thread under it. When staff change the state, the thread can be archived automatically.

## Why you would use it

- Feedback channels where ideas get lost among replies; each suggestion becomes its own message with a vote count.
- Communities that want members to see what was accepted and what was rejected, and why, without staff writing announcements.
- Servers that want discussion per idea instead of arguments in the main channel, using threads.
- Staff who want to triage from the dashboard with a reason box instead of remembering suggestion numbers.

## How a suggestion is submitted

There are three ways in, and all of them go through the same length checks and end up in the suggestion channel.

| Method | What happens |
| --- | --- |
| `suggest <text>` | The command message is deleted and the suggestion is posted. Works from any channel. |
| Typing in the suggestion channel | Any non-bot message that does not start with the prefix is turned into a suggestion and the original is deleted. Members holding the server's staff role are skipped, so staff can talk in the channel normally. |
| The suggest button | A message with a button in the **Suggest Button Channel**. Pressing it opens a form whose length limits match your settings. |

If the text is longer than **Maximum Length** or shorter than **Minimum Length** it is rejected. With the command the error shows in the channel and deletes after five seconds; in the suggestion channel the message is deleted and the member is DMed. Mentions inside the suggestion are neutralised in the posted embed, and the member is told the suggestion was sent.

The default suggestion embed uses the member as author, the title "Suggestion #N" and the text as description. You can replace it with your own embed (see placeholders below).

### The suggest button

The button message is posted in the **Suggest Button Channel** and the bot keeps it at the bottom: when other messages push it up the bot deletes and reposts it. The default label is **Suggest Here!** with no emote and a blurple colour. The message above the button can be plain text or embed code, and defaults to a short "make a suggestion" prompt.

## Voting

By default each suggestion gets a thumbs up and a thumbs down. You can set up to five custom emotes instead with `suggestmotes` or the **Custom Emotes** picker; the bot must be able to use them.

The **Emote Display Mode** decides how votes are cast.

| Mode | Behaviour |
| --- | --- |
| Reactions (default) | The bot adds the emotes as reactions. Counts are tracked from reaction adds and removes. |
| Buttons | The emotes become buttons that show a live count. A member can hold one vote per suggestion: pressing the same button again asks to remove it, pressing a different one asks to switch. |

In button mode each of the five emote buttons has its own colour (**Emote 1 Button** to **Emote 5 Button**). Colours are Blue, Grey, Green and Red. Changing a colour also refreshes the suggest button message.

`suggestinfo <number>` shows the text, who suggested it, the current state, who last changed it, how many times the state changed, and the count per emote, with Accept, Deny, Consider and Implement buttons under it.

## States

Every suggestion starts as Suggested (shown as Pending on the dashboard). Staff with Manage Messages can move it to one of four states with `accept`, `deny`, `consider` or `implemented`, from the buttons on `suggestinfo`, or from the dashboard. Each state change with a reason shows the reason; without one the field reads "none".

| State | Embed colour | Extra options |
| --- | --- | --- |
| Accepted | Blue | Accept channel, accept message, archive on accept |
| Denied | Red | Deny channel, deny message, archive on deny |
| Considered | Gold | Consider channel, consider message, archive on consider |
| Implemented | Green | Implement channel, implement message, archive on implement |

When a state changes the bot does the following, in this order:

1. Archives the discussion thread if the archive toggle for that state is on.
2. Edits the original message in the suggestion channel into the status embed and removes all reactions. If the original message is gone, a new one is posted.
3. DMs the suggester an embed with the suggestion, the reason and who changed it. The staff confirmation says whether the DM went through or the member had DMs off.
4. Records the new state and who changed it.
5. If a channel is set for that state, posts the status embed there and deletes the previous status message for that suggestion, so a suggestion moving from Considered to Accepted does not leave a stale copy behind.

A suggestion can move between states as many times as you like. There is no command to put it back to Pending.

### The status message

The default status embed has the suggester as author, a title such as "Suggestion #12 Accepted", the suggestion text as description and a **Reason** field. Set your own with `acceptmessage`, `denymessage`, `considermessage` or `implementmessage`, or the four editors on the dashboard **Messages** tab. Use `-` to go back to the default. Custom text is run through the embed parser; if it is not valid embed code it is used as the embed description.

## Placeholders

The suggestion message (posted on submit) supports these, plus the general server placeholders from the placeholders page.

| Placeholder | Value |
| --- | --- |
| `%suggest.user%` | Full username of the suggester |
| `%suggest.user.name%` | The suggester's username |
| `%suggest.user.avatar%` | The suggester's avatar URL |
| `%suggest.message%` | The suggestion text, mentions neutralised |
| `%suggest.number%` | The suggestion number |

The accept, deny, consider and implement messages support all of the above, the general server placeholders, and these extras.

| Placeholder | Value |
| --- | --- |
| `%suggest.user.id%` | The suggester's user ID |
| `%suggest.mod.user%` | Full username of the staff member who changed the state |
| `%suggest.mod.name%` | Username of that staff member |
| `%suggest.mod.avatar%` | Their avatar URL |
| `%suggest.mod.Id%` | Their user ID (note the capital I) |
| `%suggest.mod.message%` | The reason given, or "none" |
| `%suggest.emote1count%` to `%suggest.emote5count%` | Vote count for each emote at the time of the change |

> [!EXAMPLE]
> A plain deny message: `Suggestion #%suggest.number% by %suggest.user% was denied by %suggest.mod.name%: %suggest.mod.message%`

## Threads

**Thread Type** adds a second button row to every new suggestion.

| Type | Button | Result |
| --- | --- | --- |
| No Threads (default) | none | No discussion button |
| Regular Threads | Join/Create Public Discussion | Creates a public thread named "Suggestion #N Discussion" on the suggestion message |
| Private Threads | Join/Create Private Discussion | Same, as a private thread |

The first press creates the thread and adds both the suggester and the presser. Later presses reply that a thread already exists and link it. One thread per suggestion is tracked, and the four **Archive on** toggles archive it when the matching state is set. Changing the thread type only affects suggestions posted afterwards.

## Settings

The dashboard page has two tabs, **Suggestions** and **Settings**. The Settings tab is split into **General**, **Messages**, **Channels**, **Archive** and **Emotes**.

| Setting | Default | What it controls |
| --- | --- | --- |
| Minimum Length | not set | Shortest suggestion accepted, in characters (cannot be 2048 or more; the dashboard field stops at 2000) |
| Maximum Length | not set | Longest suggestion accepted (must be above 0; the dashboard field stops at 2000) |
| Thread Type | No Threads | Whether suggestions get a public or private discussion button |
| Suggestion message | default embed | The embed posted when a suggestion is submitted |
| Accept / Deny / Consider / Implement message | default embed | The status embed for each state |
| Suggest Channel | none (feature off) | Where suggestions are posted and where typed messages become suggestions |
| Accept / Deny / Consider / Implement Channel | none | Extra channel each status embed is copied to |
| Archive on Accept / Deny / Consider / Implement | off | Archive the discussion thread on that state |
| Emote Display Mode | Reactions | Reactions or buttons for voting |
| Custom Emotes | thumbs up and down | Up to five emotes used for voting |
| Button Label | Suggest Here! | Text on the suggest button |
| Button Emote | none | Emote on the suggest button |
| Button Message | default prompt | Text or embed posted above the suggest button |
| Suggest Button Color | Blurple | Colour of the suggest button |
| Emote 1 to 5 Button | Blurple | Colour of each vote button in button mode |

> [!WARNING]
> Nothing works until **Suggest Channel** is set. Until then `suggest` replies that no channel is set and deletes the error after three seconds.

The **Suggestions** tab lists every suggestion with its status, vote counts and date, sortable by date or status. Each card has **Accept**, **Deny**, **Consider** and **Implement** buttons with an optional reason box, and a **Delete** button that removes the record from the database without touching the Discord message.

## Setup walkthrough

1. Open **Suggestions** in the dashboard and switch to the **Settings** tab.
2. On **Channels**, pick a **Suggest Channel**. Optionally pick separate channels for accepted, denied, considered and implemented suggestions.
3. On **General**, set **Minimum Length** and **Maximum Length**, for example 10 and 1000, and pick a **Thread Type** if you want per-idea discussion.
4. On **Emotes**, choose **Reactions** or **Buttons** and optionally pick up to five **Custom Emotes**. If you want a suggest button, set its label, emote and message here and run `suggestbuttonchannel #channel` in Discord to post it.
5. On **Archive**, turn on the archive toggles for the states that should close discussion.
6. On **Messages**, customise the status embeds if you want, using the placeholders above.
7. Save, then test: run `suggest test idea`, vote on it, and run `accept 1 looks good` to see the status embed and DM.

## Commands

Run these with your server's prefix (`.` unless you changed it).

| Command | Aliases | Needs | Purpose |
| --- | --- | --- | --- |
| `suggest <text>` | `suggestion` | Nobody | Submit a suggestion |
| `suggestinfo <number>` | `suginfo` | Manage Messages | Show details, vote counts and state buttons for a suggestion |
| `accept <number> [reason]` | `suggestaccept`, `acceptsuggest` | Manage Messages | Mark a suggestion accepted |
| `deny <number> [reason]` | `suggestdeny`, `denysuggest` | Manage Messages | Mark a suggestion denied |
| `consider <number> [reason]` | `suggestconsider`, `considersuggest` | Manage Messages | Mark a suggestion as being considered |
| `implemented <number> [reason]` | `suggestimplement`, `implementsuggest` | Manage Messages | Mark a suggestion implemented |
| `setsuggestchannel [#channel]` | `suggestchannel`, `suggestchan` | Manage Channels | Set the suggestion channel, or disable suggestions with no channel |
| `suggestclear` | `suggestreset`, `resetsuggestions`, `clearsuggestions` | Administrator | Delete every suggestion and reset the counter, after confirmation |
| `suggestmessage <text>` | `suggestmsg` | Administrator | Custom suggestion embed, `-` to reset |
| `acceptmessage <text>` | `acceptmsg` | Administrator | Custom accept embed, `-` to reset |
| `denymessage <text>` | `denymsg` | Administrator | Custom deny embed, `-` to reset |
| `considermessage <text>` | `considermsg` | Administrator | Custom consider embed, `-` to reset |
| `implementmessage <text>` | `implementmsg` | Administrator | Custom implement embed, `-` to reset |
| `acceptchannel [#channel]` | | Administrator | Channel for accepted suggestions, none to disable |
| `denychannel [#channel]` | | Administrator | Channel for denied suggestions, none to disable |
| `considerchannel [#channel]` | | Administrator | Channel for considered suggestions, none to disable |
| `implementchannel [#channel]` | | Administrator | Channel for implemented suggestions, none to disable |
| `minsuggestionlength <number>` | `minsuggestlength` | Administrator | Minimum characters, must be under 2048 |
| `maxsuggestionlength <number>` | `maxsuggestlength` | Administrator | Maximum characters, must be above 0 |
| `suggestmotes <emotes>` | `smotes`, `suggestemotes` | Administrator | Up to five vote emotes, or `disable` for thumbs up and down |
| `suggestmotesmode <reactions/buttons>` | | Administrator | Reactions or buttons for voting |
| `suggestmotecolor <number> <colour>` | | Administrator | Colour of vote button 1 to 5: `blurple`, `grey`, `green` or `red` |
| `suggestthreadstype <none/public/private>` | `suggestthreads` | Administrator | Discussion thread type for new suggestions |
| `archiveonaccept` | | Administrator | Toggle thread archiving on accept |
| `archiveondeny` | | Administrator | Toggle thread archiving on deny |
| `archiveonconsider` | | Administrator | Toggle thread archiving on consider |
| `archiveonimplement` | | Administrator | Toggle thread archiving on implement |
| `suggestbuttonchannel <#channel>` | | Administrator | Post the suggest button in a channel |
| `suggestbuttonmessage <text>` | | Administrator | Text or embed above the suggest button, `-` to reset |
| `suggestbuttonlabel <text>` | | Administrator | Button label up to 80 characters, `-` to reset |
| `suggestbuttonemote [emote]` | | Administrator | Button emote, none to reset |
| `suggestbuttoncolor <colour>` | | Administrator | Suggest button colour: `blurple`, `grey`, `green` or `red` |

Slash equivalents live under `/suggestions` and `/suggestions customize`.

## Tips and gotchas

- The bot needs Manage Messages in the suggestion channel to delete originals, Add Reactions for reaction mode, and Create Public or Private Threads for discussions. Status channels need Embed Links or the copy is silently skipped.
- Set both length limits before opening the channel. The typed-message path deletes anything outside the limits, so an unset maximum can eat every message.
- Members with the staff role set in Administration can chat in the suggestion channel without their messages becoming suggestions. Everyone else's messages are converted and deleted.
- The `suggest` command respects the permissions system, so you can block it in channels or for roles with the usual permission commands and the typed-message path respects the same rule.
- Custom emotes must be ones the bot can use. The command tests each emote by reacting with it and refuses the set if one fails.
- Dashboard **Delete** only removes the database record. The Discord message and any thread stay where they are.
- `suggestclear` cannot be undone and resets numbering to 1.
