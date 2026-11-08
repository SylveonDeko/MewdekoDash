---
title: Tickets
slug: tickets
summary: Support ticket panels that open private channels for your staff to handle
icon: fa-ticket
category: Community
dashboard: /dashboard/tickets
module: Tickets
tags: [tickets, support, help desk, panel, ticket panel, transcripts, cases, claim, priority, blacklist, modmail]
related: [administration, chat-triggers, auditlog]
---

## What it does

Tickets turns a channel into a help desk. You post a panel, which is a message with an embed and one or more buttons or a select menu. When a member clicks a button or picks an option, the bot creates a private text channel for them that only they and your support roles can see. It then posts an opening message with **Claim** and **Close** buttons.

From the member's side, a click and an optional short form make a channel named like `ticket-username-1` appear. They describe their issue there. When it is closed the channel is renamed to `closed-...` and locked. It is then either moved to an archive category or deleted after a delay, depending on how you set that ticket type up.

From staff's side: claim a ticket so everyone knows who is handling it, set a priority and add tags, leave notes, link related tickets into a case, and close it. Every close can save a transcript to a channel and to the dashboard. The dashboard also shows response and resolution times and tickets by priority. A per-staff view is there too.

Each button and each select option is its own ticket type with its own category, roles, limits, form, opening message and close behaviour.

## Why you would use it

- A support server wants private one-on-one channels instead of a public help channel.
- You have several teams (billing and moderation, for example) and want a select menu that routes to the right one.
- You need moderator applications with a form, kept separate from general support.
- You want an audit trail: transcripts, staff notes and cases that group related reports.
- You want to stop specific members from opening tickets at all.

## Panels, buttons and select menus

A panel is one message in one channel. The panel ID is that message's ID. A panel can hold buttons, select menus, or both.

- **Buttons**: one ticket type per button. Each has a label (max 80 characters), an optional emoji and a style (Primary, Secondary, Success or Danger).
- **Select menus**: one menu with a placeholder (max 150 characters) and a list of options. Each option is a ticket type with a label (max 100 characters), a description (max 100 characters) and an emoji. A menu must keep at least one option.

If the panel message is deleted, `checkpanels` lists which panels are missing and `recreatepanel` or `recreateallpanels` posts them again and updates the stored message ID. The bot also watches for deletions of panel messages.

`ticketduplicatepanel` copies a panel and every component to another channel. `ticketmovepanel` moves it. `ticketupdatepanel` replaces the embed with new embed JSON.

### Panels on the dashboard

The **Panels** card lists each panel with its channel and its button and menu counts. A badge shows "Message missing" or "Channel is gone" when the panel's message or channel no longer exists, and **Post missing panels again** reposts every panel whose message is missing. **New panel** asks for a channel and creates the panel. Each row has a menu with **Edit**, **Repost** and **Delete**. Deleting a panel with open tickets asks again before **Delete anyway**.

Editing a panel opens a sheet with:

- **Message**: the panel embed, built in the message editor with a preview.
- **Buttons**: the button list with a "Button label" field and **Add button**. Rows show badges for Threads, "Has form" and "Custom message".
- **Select menus**: each menu has its "Menu placeholder" field, a delete button, its options and a "New option label" field with **Add option**. A new menu takes a "Menu placeholder" and a "First option label", then **Add menu**.
- **Move, copy and delete**: **Move to channel** with **Move**, **Copy to channel** with **Duplicate**, **Repost** and **Delete panel**.

Opening a button or an option shows the ticket type settings below. They save as you change them.

### Ticket type settings

These exist on every button and every select option. Besides **Label**, **Emoji** and **Style** (buttons) or **Description** (options), they are grouped into collapsible sections that show how many values are set.

| Section | Setting | Default | What it controls |
| --- | --- | --- | --- |
| Channels | Channel name format | `ticket-{username}-{id}` | Name of the created channel; `{id}` is the member's ticket number, max 90 characters |
| Channels | Ticket category | none | Category the channel is created in |
| Channels | Archive category | none | Category the channel moves to when closed or archived |
| Channels | Claimed category | none | Category the channel moves to when a staff member claims it |
| Channels | Thread channel | none | Open the ticket as a private thread in a text channel, or as a post in a forum, instead of a new channel. Anyone who can see the forum can see its posts |
| Access and limits | Support roles | none | Roles that can see, talk in and claim the ticket |
| Access and limits | Viewer roles | none | Roles that can read but not send |
| Access and limits | Max open tickets per member | 1 | How many open tickets of this type one member may have, 1 to 100 |
| Access and limits | Allowed priorities | any | Which priorities staff may set on this type. Only shown once priorities exist |
| Access and limits | Default priority | none | Priority a new ticket starts with |
| Timing | Auto close after (hours) | none | Stored per type, 0 to 8760, and shown in `buttoninfo` |
| Timing | Reply within (minutes) | none | Stored per type, 0 to 10080, and shown in `buttoninfo` |
| Closing | Save a transcript | off | Generate a transcript when the ticket closes |
| Closing | DM the transcript to the creator | off | Send that transcript to the member who opened the ticket |
| Closing | Archive automatically on close | off | Archive the ticket as part of closing it |
| Closing | Delete on close | off | Delete the channel after the delay instead of keeping it |
| Closing | Delete delay (minutes) | 5 | Wait before deletion when Delete on close is on, 0 to 10080 |
| Closing, When closed | Lock the channel | on | Deny sending for everyone except support roles |
| Closing, When closed | Rename the channel | on | Prefix the channel name with `closed-` |
| Closing, When closed | Remove the creator | on | Remove the opener's access when closed |
| Closing, When archived | Lock the channel | on | Make the channel read-only when archived |
| Closing, When archived | Rename the channel | on | Prefix the channel name with `archived-` |
| Closing, When archived | Remove the creator | off | Remove the opener's access when archived |
| Open message | Message | default embed | Custom opening message with placeholders |
| Ticket form | Form | none | A form shown before the ticket is created |

### Forms (modals)

A ticket type can ask questions before creating the channel. On the dashboard, the **Ticket form** section has a **Form title** (max 45 characters, default "Create Ticket") and up to five fields. **Add field** creates a field, and each field has:

- **Label** (max 45 characters) and a **Placeholder name**, the key used in `%modal.<key>%`. The key takes lowercase letters, numbers and underscores and must be unique.
- **Style**: Short or Paragraph.
- **Required**: on by default.
- **Min length** and **Max length**, from 0 and 1 up to 4000. Max length defaults to 1000.
- **Placeholder** (max 100 characters) and a **Default value**.

Removing every field removes the form. With commands, set a title with `setmodaltitle` and add fields with `addmodalfield`. A field is short and required by default; options after the label change that: `paragraph` for multi-line, `optional`, and `min:X` or `max:X` for length limits up to 4000. The field ID is the label lower-cased with spaces turned into underscores.

The answers are stored with the ticket and can be used in the open message as `%modal.<fieldId>%`.

### The opening message

By default the bot posts an embed titled "Support Ticket" that welcomes the member and asks them to describe the issue. It shows the ticket ID and creation time. Claim and Close buttons are attached.

You can replace it per ticket type with your own text or embed. Use the message editor in the **Open message** section of a button or option. Placeholders available here:

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

The editor also offers `%server%` and `%server.members%` next to these. The rest of the general placeholder set is not applied to this message.

## What happens when a ticket opens

1. Blacklisted members are refused with an ephemeral message.
2. The member's open tickets of this type are counted against **Max open tickets per member** (default 1).
3. The channel is created in the ticket category with `@everyone` denied, the opener allowed to view, send, read history, attach files and embed links, support roles given the same plus Manage Messages, and viewer roles allowed to read only.
4. The opening message is posted with Claim and Close buttons.
5. If a **Thread channel** is set for the type, a private thread or forum post is created there instead, and step 3 does not apply.
6. If a log channel is set, a "new ticket" entry is posted there.
7. If **Ping roles when a ticket opens** is on, the support roles and the roles to ping are mentioned in the ticket. If **DM the creator on claim and unclaim** is on, members of those roles also get a DM about the new ticket.
8. A **Ticket opened** event is published to chat triggers.

## Claiming, notes, priorities and tags

**Claim**: a support role member or an administrator claims the ticket with the button or `ticketclaim`. The channel gets a "claimed by" embed. Only the claimer or an administrator can unclaim. A closed or already claimed ticket cannot be claimed.

**Notes**: `ticketnote` adds a staff note to the current ticket. The note is stored with the ticket and shown on the dashboard. It is also posted in the ticket channel as a blue "note added" embed with the author in the footer.

**Priorities** are server-wide definitions created with `ticketaddpriority` or in the **Priorities** card. **New priority** takes a **Name** (max 40 characters), a **Short name** (letters, numbers, `-` and `_`, max 32), an **Emoji**, a **Color**, a **Level** from 1 to 5, **Reply within (minutes)** from 1 to 10080 (5 by default) and **Ping staff when set**. Setting a priority on a ticket posts an embed in that colour and, when the flag is on, pings the support roles. A ticket type can restrict which priorities are allowed. Rows show the level, "Pings staff" and the reply time, and can be deleted.

**Tags** are server-wide labels. The **Tags** card has **New tag** with a **Name** (max 40 characters), a **Short name** (max 32), a **Description** (max 100 characters) and a **Color**. Add or remove them on a ticket with `ticketaddtags` and `ticketremovetags` using the short names, or from the ticket's sheet on the dashboard. Tickets can be searched by tag.

## Closing, archiving and transcripts

Closing marks the ticket closed and posts a red "ticket closed" embed. Then, in order:

1. If **Save a transcript** is on for the type and a transcript channel is set, the last 5000 messages are saved and an embed with a **View Transcript** link is posted in the transcript channel. The link opens the transcript on the dashboard.
2. If auto-archive is on for the type, or you closed with `ticketclose true`, the ticket is archived (see below).
3. Otherwise the close behaviours run: rename to `closed-...`, remove the opener, lock the channel while keeping support roles, then either move to the archive category or, with **Delete on close**, warn in the channel and schedule deletion after the delete delay. Scheduled deletions are processed once a minute.

Archiving renames the channel to `archived-...`, moves it to the archive category, makes it read-only for everyone, and marks the ticket archived. `ticketarchive` does this directly on an open ticket. If the channel is gone the ticket is simply marked archived.

Closing publishes a **Ticket closed** event to chat triggers.

> [!NOTE]
> A transcript is only produced when both the type has **Save a transcript** enabled and the server has a transcript channel. Without a transcript channel the close still succeeds but nothing is saved.

## Cases

A case groups tickets that belong together, for example several reports about the same person. Create one with `ticketcreatecase <title> <description>` or with **New case** in the **Cases** card (title max 100 characters, description max 1000), then link the current ticket with `ticketlinkcase <caseId>` and unlink with `ticketunlinkcase`. Each case row shows its ID, ticket count, Open or Closed state and date.

Opening a case shows its title and description, which save as you type, and its **Linked tickets**. Pick tickets under **Link tickets** and press **Link selected**, or unlink one from its menu. Cases have their own **Notes**, can be closed and reopened, and can be edited from the `/tickets cases` slash commands. When closing a case, **Archive linked tickets** archives its tickets as well.

## Blacklist

`ticketblock @user [reason]` stops a member from opening tickets. The reason is written to the log channel if one is set. `ticketunblock` lifts it. The **Blocked members** card has a **User ID** field, an optional reason (max 200 characters) and **Block**. Each blocked member has an **Unblock** action in their row menu.

## Bulk tools

The **Batch actions** card holds four collapsible actions, each confirmed before it runs. The result reads "Updated N tickets", or how many were done and how many failed.

| Action | Fields | What it does |
| --- | --- | --- |
| Close inactive tickets | **Inactive for (hours)**, 1 to 8760, default 48 | Same as `ticketcloseinactive <hours>`. Closes every open ticket with no activity for that long, posting an "auto closed" embed in each and archiving it if the type has an archive category |
| Move tickets between categories | **From category**, **To category** | Same as `ticketmoveall`. Moves every ticket channel between categories |
| Add a role to open tickets | **Role**, **View only, no sending** | Adds the role to every open ticket, optionally read-only |
| Transfer claimed tickets | **From staff member ID**, **To staff member ID** | Moves every open ticket claimed by the first person to the second |

## Statistics

`ticketstats` shows totals, open and closed counts, average response time in minutes, average resolution time in hours, and breakdowns by type and priority. `ticketuserstats [@user]` shows the same for one member plus their recent tickets. The **Overview** card at the top of the page shows **Total**, **Open**, **Closed**, **Avg response** and **Avg resolution** for the last 30 days, a **Last 14 days** activity chart, **By priority** counts and **Staff response time**.

## Settings

The Tickets page is a single page of cards, in this order: **Overview**, **Panels**, **Tickets**, **Cases**, **Priorities**, **Tags**, **Settings**, **Blocked members** and **Batch actions**.

The **Settings** card holds the server-wide options:

| Setting | Default | What it controls |
| --- | --- | --- |
| Transcript channel | none | Where transcript summaries with links are posted |
| Log channel | none | Where ticket creation and blacklist entries are logged |
| DM every transcript to the ticket creator | off | Sends the creator a copy of every transcript |
| DM the creator on claim and unclaim | off | Notifies the creator when staff claim or release the ticket. Also DMs support role members when a ticket opens |
| Ping roles when a ticket opens | off | Mentions the support roles and the roles below in each new ticket |
| Roles to ping | none | Extra roles mentioned when a ticket opens. Shown once pings are on |

Everything else is set per panel, button or option, as described above. The **Tickets** card lists tickets with search ("Ticket, member, channel or tag"), a status filter (Open, Closed, Archived, All) and a priority filter, 40 at a time with **Show more**. Opening a ticket shows who opened it, when, who claimed it, last activity and its form answers. From the ticket's sheet staff can claim or unclaim, set the **Priority**, link or unlink a **Case**, add **Tags**, add, edit and delete **Notes** (max 1000 characters), close with or without archiving, and open the transcript.

> [!PERMISSION]
> The bot needs Manage Channels and Manage Roles so it can create ticket channels and set who can see them. Its role must be able to view the ticket and archive categories.

## Setup walkthrough

1. Create a category for open tickets and, optionally, one for closed ones. Create a transcript channel and a log channel that only staff can see.
2. Open **Tickets** in the dashboard and set **Transcript channel** and **Log channel** in the **Settings** card.
3. In the **Priorities** card press **New priority** and create at least one (for example `urgent`, level 5, **Ping staff when set** on). Add any tags in the **Tags** card.
4. In the **Panels** card press **New panel** and choose the channel. The panel opens for editing. Design the **Message**.
5. Under **Buttons**, type a label and press **Add button**, then open it. Set the style, **Ticket category**, **Archive category** and **Support roles**, and turn on **Save a transcript**. Decide between keeping closed channels in the archive category or **Delete on close** with a delay.
6. Optionally set a **Ticket form** and an **Open message** on the same button.
7. For several ticket types in one dropdown, add a "Menu placeholder" and a "First option label" under **Select menus** and press **Add menu**, then add an option per type and give each the same settings.
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
- The default limit is one open ticket per member per type. Raise **Max open tickets per member** for types where repeat tickets are normal.
- **Auto close after (hours)** and **Reply within (minutes)** are saved on the type and shown in `buttoninfo`, but the only thing in the bot that closes idle tickets is `ticketcloseinactive` or the **Close inactive tickets** batch action. Run that on a schedule yourself if you want automatic cleanup.
- `removeoption` currently only reports success; use `deleteselectoption` with the option ID to actually remove an option.
- **Delete on close** and **Lock the channel** under **When closed** interact: a ticket set to delete is not locked first, it just waits out the delete delay.
- Panel embed JSON must be valid embed builder output. Use the dashboard editor and copy the JSON if you prefer commands.
- Deleting a panel with open tickets is refused unless you pass `true`, which clears the tickets' link to the panel.
- Transcripts capture at most 5000 messages, and the "View Transcript" link opens the transcript on the dashboard.
