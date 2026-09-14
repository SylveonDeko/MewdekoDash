---
title: Tickets
slug: tickets
summary: Support ticket panels with buttons and select menus that open private channels, plus claiming, priorities, tags, cases, transcripts and staff tools.
icon: fa-ticket
category: Community
dashboard: /dashboard/tickets
module: Tickets
tags: [tickets, support, help desk, panel, ticket panel, transcripts, cases, claim, priority, blacklist, modmail]
related: [administration, chat-triggers, auditlog]
---

## What it does

Tickets turns a channel into a help desk. You post a panel, which is a message with an embed and one or more buttons or a select menu. When a member clicks a button or picks an option, the bot creates a private text channel for them, sets the permissions so only they and your support roles can see it, and posts an opening message with **Claim** and **Close** buttons.

From the member's side: click, optionally fill in a short form, and a channel named like `ticket-username-1` appears. They describe their issue there. When it is closed the channel is renamed to `closed-...`, locked, and either moved to an archive category or deleted after a delay, depending on how you set that ticket type up.

From staff's side: claim a ticket so everyone knows who is handling it, set a priority, add tags, leave notes, link related tickets into a case, and close it. Every close can save a transcript to a channel and to the dashboard. The dashboard also shows response and resolution times, tickets by priority, and a per-staff view.

Each button and each select option is its own ticket type with its own category, roles, limits, form, opening message and close behaviour.

## Why you would use it

- A support server wants private one-on-one channels instead of a public help channel.
- You have several teams (billing, moderation, partnerships) and want a select menu that routes to the right one.
- You need moderator applications with a form, kept separate from general support.
- You want an audit trail: transcripts, staff notes and cases that group related reports.
- You want to stop specific members from opening tickets at all.

## Panels, buttons and select menus

A panel is one message in one channel. The panel ID is that message's ID. A panel can hold buttons, select menus, or both.

- **Buttons**: one ticket type per button. Each has a label, an optional emoji and a style (Primary, Secondary, Success or Danger).
- **Select menus**: one menu with a placeholder and a list of options. Each option is a ticket type with a label, description and emoji. A menu must keep at least one option.

If the panel message is deleted, `checkpanels` lists which panels are missing and `recreatepanel` or `recreateallpanels` posts them again and updates the stored message ID. The bot also watches for deletions of panel messages.

`ticketduplicatepanel` copies a panel and every component to another channel. `ticketmovepanel` moves it. `ticketupdatepanel` replaces the embed with new embed JSON.

### Ticket type settings

These exist on every button and every select option. On the dashboard they appear when you add or edit a button or option.

| Setting | Default | What it controls |
| --- | --- | --- |
| Channel Name Format | `ticket-{username}-{id}` | Name of the created channel; `{id}` is the member's ticket number, max 100 characters |
| Ticket Category | none | Category the channel is created in |
| Archive Category | none | Category the channel moves to when closed or archived |
| Support Roles | none | Roles that can see, talk in and claim the ticket |
| Viewer Roles | none | Roles that can read but not send |
| Max Active Tickets | 1 | How many open tickets of this type one member may have |
| Auto Close (hours) | none | Stored per type and shown in `buttoninfo` |
| Required Response Time (minutes) | none | Stored per type and shown in `buttoninfo` |
| Allowed Priorities | all | Which priorities staff may set on this type |
| Default Priority | none | Priority a new ticket starts with |
| Save Transcript | off | Generate a transcript when the ticket closes |
| Lock on Close | on | Deny sending for everyone except support roles |
| Rename on Close | on | Prefix the channel name with `closed-` |
| Remove Creator | on | Remove the opener's access when closed |
| Delete on Close | off | Delete the channel after the delay instead of keeping it |
| Delete Delay | 5 minutes | Wait before deletion when Delete on Close is on; the dashboard field takes seconds, `ticketclosebehavior` takes minutes |
| Auto Archive on Close | off | Archive the ticket as part of closing it |
| Lock on Archive | on | Make the channel read-only when archived |
| Rename on Archive | on | Prefix the channel name with `archived-` |
| Remove Creator (archive) | off | Remove the opener's access when archived |
| Modal | none | A form shown before the ticket is created |
| Open message | default embed | Custom opening message with placeholders |

### Forms (modals)

A ticket type can ask questions before creating the channel. Set a title with `setmodaltitle` (default "Create Ticket") and add fields with `addmodalfield`. A field is short and required by default; options after the label change that: `paragraph` for multi-line, `optional`, and `min:X` or `max:X` for length limits up to 4000. The field ID is the label lower-cased with spaces turned into underscores.

The answers are stored with the ticket and can be used in the open message as `%modal.<fieldId>%`.

### The opening message

By default the bot posts an embed titled "Support Ticket" welcoming the member, showing the ticket ID and creation time, and asking them to describe the issue. Claim and Close buttons are attached.

You can replace it per ticket type with your own text or embed. Use the embed builder on the dashboard (**Configure ticket open message**). Placeholders available here:

| Placeholder | Value |
| --- | --- |
| `%ticket.id%` | The ticket number |
| `%ticket.channel%` | Mention of the ticket channel |
| `%ticket.user%` | The opener's username |
| `%ticket.user.mention%` | A mention of the opener |
| `%ticket.user.avatar%` | The opener's avatar URL |
| `%ticket.user.id%` | The opener's user ID |
| `%ticket.created%` | When the ticket was created |
| `%modal.<fieldId>%` | The answer to a form field |

The general placeholder set is not applied to this message; only the ones above are.

## What happens when a ticket opens

1. Blacklisted members are refused with an ephemeral message.
2. The member's open tickets of this type are counted against **Max Active Tickets** (default 1).
3. The channel is created in the ticket category with `@everyone` denied, the opener allowed to view, send, read history, attach files and embed links, support roles given the same plus Manage Messages, and viewer roles allowed to read only.
4. The opening message is posted with Claim and Close buttons.
5. If a log channel is set, a "new ticket" entry is posted there.
6. A **Ticket opened** event is published to chat triggers.

## Claiming, notes, priorities and tags

**Claim**: a support role member or an administrator claims the ticket with the button or `ticketclaim`. The channel gets a "claimed by" embed. Only the claimer or an administrator can unclaim. A closed or already claimed ticket cannot be claimed.

**Notes**: `ticketnote` adds a staff note to the current ticket. The note is stored with the ticket, shown on the dashboard, and posted in the ticket channel as a blue "note added" embed with the author in the footer.

**Priorities** are server-wide definitions created with `ticketaddpriority` or on the **Configuration** tab. Each has an ID, a display name, an emoji, a level from 1 to 5, a colour, a response time, and a **Notify staff** flag. Setting a priority on a ticket posts an embed in that colour and, when the flag is on, pings the support roles. A ticket type can restrict which priorities are allowed.

**Tags** are server-wide labels with an ID, name, description and colour. Add or remove them on a ticket with `ticketaddtags` and `ticketremovetags` using the tag IDs. The dashboard shows them on each ticket and lets you search by tag.

## Closing, archiving and transcripts

Closing marks the ticket closed and posts a red "ticket closed" embed. Then, in order:

1. If **Save Transcript** is on for the type and a transcript channel is set, the last 5000 messages are saved and an embed with a **View Transcript** link is posted in the transcript channel. The link opens the transcript on the dashboard.
2. If auto-archive is on for the type, or you closed with `ticketclose true`, the ticket is archived (see below).
3. Otherwise the close behaviours run: rename to `closed-...`, remove the opener, lock the channel while keeping support roles, then either move to the archive category or, with **Delete on Close**, warn in the channel and schedule deletion after the delete delay. Scheduled deletions are processed once a minute.

Archiving renames the channel to `archived-...`, moves it to the archive category, makes it read-only for everyone, and marks the ticket archived. `ticketarchive` does this directly on an open ticket. If the channel is gone the ticket is simply marked archived.

Closing publishes a **Ticket closed** event to chat triggers.

> [!NOTE]
> A transcript is only produced when both the type has **Save Transcript** enabled and the server has a transcript channel. Without a transcript channel the close still succeeds but nothing is saved.

## Cases

A case groups tickets that belong together, for example several reports about the same person. Create one with `ticketcreatecase <title> <description>` or on the **Cases** tab, then link the current ticket with `ticketlinkcase <caseId>` and unlink with `ticketunlinkcase`. Cases have their own notes, can be closed and reopened, and can be edited from the dashboard or the `/tickets cases` slash commands.

## Blacklist

`ticketblock @user [reason]` stops a member from opening tickets. The reason is written to the log channel if one is set. `ticketunblock` lifts it. The dashboard's **Advanced** tab has the same **Blacklist Management** section, taking a user ID.

## Bulk tools

- `ticketcloseinactive <hours>` closes every open ticket with no activity for that many hours, posting an "auto closed" embed in each and archiving it if the type has an archive category. The **Advanced** tab's **Close Inactive Tickets** does the same.
- `ticketmoveall <source category> <target category>` moves every ticket channel between categories.

## Statistics

`ticketstats` shows totals, open and closed counts, average response time in minutes, average resolution time in hours, and breakdowns by type and priority. `ticketuserstats [@user]` shows the same for one member plus their recent tickets. The **Overview** tab shows response times, tickets by priority and staff performance.

## Settings

The Tickets page has six tabs: **Overview**, **Tickets**, **Ticket Panels**, **Configuration**, **Cases** and **Advanced**.

| Setting | Default | What it controls |
| --- | --- | --- |
| Transcript Channel | none | Where transcript summaries with links are posted (Configuration) |
| Log Channel | none | Where ticket creation and blacklist entries are logged (Configuration) |
| Priorities | none | Server-wide priority definitions (Configuration) |
| Tags | none | Server-wide tag definitions (Configuration) |
| Panel Embed | title "Support Tickets" | The panel message, built in the embed editor (Ticket Panels) |
| Per-type settings | see table above | Set on each button or select option (Ticket Panels) |
| Blacklist | empty | Members who cannot open tickets (Advanced) |

The **Tickets** tab lists open and closed tickets with search by ticket, user, channel or tag. From there staff can claim, unclaim, set priority, add or remove tags, add a staff note, close with an optional reason, archive, and open the transcript.

> [!PERMISSION]
> The bot needs Manage Channels and Manage Roles so it can create ticket channels and set who can see them. Its role must be able to view the ticket and archive categories.

## Setup walkthrough

1. Create a category for open tickets and, optionally, one for closed ones. Create a transcript channel and a log channel that only staff can see.
2. Open **Tickets** in the dashboard, go to **Configuration**, and set **Transcript Channel** and **Log Channel**.
3. Still on **Configuration**, create at least one priority (for example `urgent`, level 5, Notify staff on) and any tags you want.
4. Go to **Ticket Panels** and **Create New Panel**. Choose the channel and design the **Panel Embed**.
5. Select the panel and add a **New Button**. Set the label, style, **Ticket Category**, **Archive Category**, **Support Roles**, and turn on **Save Transcript**. Decide between keeping closed channels in the archive category or **Delete on Close** with a delay.
6. Optionally open the modal builder to add form fields, and the open message editor to customise the welcome.
7. For several ticket types in one dropdown, add a **New Select Menu** instead and add an option per type with the same settings.
8. Open a test ticket from another account, claim it, set a priority, close it, and check the transcript channel.

In Discord, `/tickets setup wizard #channel` walks through the same steps with templates (Basic Support, Department Support, Gaming Server, Business, Mod Applications).

## Commands

Run these with your server's prefix (`.` unless you changed it). Panel IDs are message IDs; button, menu and option IDs come from `panelinfo` or `ticketlistpanel`.

| Command | Aliases | Needs | Purpose |
| --- | --- | --- | --- |
| `ticketpanel <#channel> [embedJson]` | `tpanel` | Administrator | Create a panel, with a preview or create prompt |
| `ticketpaneldelete <panelId> [force]` | `tpaneldelete` | Administrator | Delete a panel; `true` forces it even with tickets attached |
| `ticketupdatepanel <panelId> <embedJson>` | `tupdatepanel` | Administrator | Replace the panel embed |
| `ticketmovepanel <panelId> <#channel>` | `tmovepanel` | Administrator | Move a panel to another channel |
| `ticketduplicatepanel <panelId> <#channel>` | `tduplicatepanel` | Administrator | Copy a panel and its components |
| `panellist` | `plist` | Administrator | List panels with component counts |
| `panelinfo <panelId>` | `pinfo` | Administrator | Show a panel's buttons and menus with IDs |
| `ticketlistpanels` | `tlistpanels` | Manage Channels | Detailed paginated list of every panel |
| `ticketlistpanel <panelId>` | `tlistpanel` | Manage Channels | Every component of one panel with settings |
| `checkpanels` | `tcheckpanels` | Administrator | Report panels whose message or channel is missing |
| `recreatepanel <panelId>` | `trecreate` | Administrator | Repost a missing panel |
| `recreateallpanels` | `trecreateall` | Administrator | Repost every missing panel |
| `setpaneltranscripts <panelId> <true or false>` | `sptranscripts` | Administrator | Toggle transcripts for every button on a panel |
| `ticketaddbutton <panelId> <label> [style] [emoji]` | `taddbtn` | Administrator | Add a button |
| `buttoninfo <buttonId>` | `binfo` | Administrator | Show a button's settings |
| `deletebutton <buttonId>` | `delbtn` | Administrator | Remove a button |
| `ticketcategory <buttonId> [category]` | `tcat` | Administrator | Set or clear the ticket category |
| `ticketarchivecategory <buttonId> [category]` | `tarchivecat` | Administrator | Set or clear the archive category |
| `ticketautoarchive <buttonId> [true or false]` | `tautoarchive` | Administrator | Archive automatically on close |
| `ticketclosebehavior <buttonId> [autoArchive] [deleteOnClose] [lockOnClose] [renameOnClose] [deleteDelayMinutes]` | `tclosebehavior` | Administrator | Set several close behaviours at once |
| `ticketautoclose <buttonId> [hours]` | `tautoclose` | Administrator | Set or clear the auto close hours |
| `setautoclose <buttonId> <hours>` | `sautoclose` | Administrator | Same as above |
| `ticketresponsetime <buttonId> [minutes]` | `tresponsetime` | Administrator | Set or clear the required response time |
| `setresponsetime <buttonId> <minutes>` | `sresponsetime` | Administrator | Same as above |
| `setmodaltitle <buttonId> <title>` | `smodaltitle` | Administrator | Title of the ticket form |
| `addmodalfield <buttonId> <label> [options]` | `addmfield` | Administrator | Add a form field, options like `paragraph,optional,max:500` |
| `removemodalfield <buttonId> <fieldId>` | `removemfield` | Administrator | Remove a form field |
| `listmodalfields <buttonId>` | `listmfields` | Administrator | List form fields |
| `addselectmenu <panelId>` | `addsmenu` | Administrator | Add a select menu through a guided prompt |
| `addoption <menuId> <label> [description] [emoji]` | `addopt` | Administrator | Add an option to a menu |
| `listoptions <menuId>` | `listopts` | Administrator | List a menu's options |
| `removeoption <menuId> <value>` | `removeopt` | Administrator | Confirm an option by value (see gotchas) |
| `deleteselectoption <optionId>` | `delselectoption` | Administrator | Remove an option; the last one cannot be removed |
| `setplaceholder <menuId> <text>` | `splaceholder` | Administrator | Change the menu placeholder |
| `deleteselectmenu <menuId>` | `delselectmenu` | Administrator | Remove a menu and its options |
| `ticketclaim` | `tclaim` | Nobody | Claim the current ticket (support role or administrator) |
| `ticketunclaim` | `tunclaim` | Nobody | Release your claim (claimer or administrator) |
| `ticketclose [archive]` | `tclose` | Nobody | Close the current ticket; `true` also archives |
| `ticketarchive` | `tarchive` | Manage Channels | Archive the current ticket |
| `ticketnote <text>` | `tnote` | Nobody | Add a staff note |
| `ticketpriority <priorityId>` | `tpriority` | Nobody | Set the current ticket's priority |
| `ticketaddtags <tagId...>` | `taddtags` | Nobody | Add tags to the current ticket |
| `ticketremovetags <tagId...>` | `tremovetags` | Nobody | Remove tags from the current ticket |
| `ticketaddpriority <id> <name> <emoji> <level> <pingStaff> <responseTime> <color>` | `taddpriority` | Administrator | Define a priority, for example `taddpriority urgent Urgent :fire: 5 true 00:15:00 red` |
| `ticketremovepriority <id>` | `tremovepriority` | Administrator | Delete a priority definition |
| `ticketaddtag <id> <name> <description> <color>` | `taddtag` | Administrator | Define a tag |
| `ticketremovetag <id>` | `tremovetag` | Administrator | Delete a tag definition |
| `ticketcreatecase <title> <description>` | `tcreatecase` | Manage Messages | Create a case |
| `ticketlinkcase <caseId>` | `tlinkcase` | Manage Messages | Link the current ticket to a case |
| `ticketunlinkcase` | `tunlinkcase` | Manage Messages | Unlink the current ticket |
| `ticketblock @user [reason]` | `tblock` | Administrator | Blacklist a member |
| `ticketunblock @user` | `tunblock` | Administrator | Remove from the blacklist |
| `tickettranscriptchannel [#channel]` | `ttranscriptch` | Administrator | Set or clear the transcript channel |
| `ticketlogchannel [#channel]` | `tlogch` | Administrator | Set or clear the log channel |
| `ticketcloseinactive <hours>` | `tcloseinactive` | Administrator | Close tickets idle for that long |
| `ticketmoveall <category> <category>` | `tmoveall` | Administrator | Move all tickets between categories |
| `ticketstats` | `tstats` | Nobody | Server ticket statistics |
| `ticketuserstats [@user]` | `tuserstats` | Nobody | A member's ticket statistics |

Slash commands live under `/tickets` (create panel, list panels, claim, close, note, archive, priority, panel and settings groups, cases group) and `/tickets setup` (wizard, quick-button, quick-menu, from-template, templates).

## Tips and gotchas

- Commands that act on "the current ticket" only work inside a ticket channel. Run them in the ticket, not in a staff channel.
- Every ticket type needs support roles, or nobody but administrators can claim and nobody except the opener can talk once the channel is locked.
- The default limit is one open ticket per member per type. Raise **Max Active Tickets** for types where repeat tickets are normal.
- **Auto Close (hours)** and **Required Response Time** are saved on the type and shown in `buttoninfo`, but the only thing in the bot that closes idle tickets is `ticketcloseinactive` or the **Close Inactive Tickets** batch action. Run that on a schedule yourself if you want automatic cleanup.
- `removeoption` currently only reports success; use `deleteselectoption` with the option ID to actually remove an option.
- **Delete on Close** and **Lock on Close** interact: a ticket set to delete is not locked first, it just waits out the delete delay.
- Panel embed JSON must be valid embed builder output. Use the dashboard editor and copy the JSON if you prefer commands.
- Deleting a panel with open tickets is refused unless you pass `true`, which clears the tickets' link to the panel.
- Transcripts capture at most 5000 messages, and the "View Transcript" link opens the transcript on the dashboard.
