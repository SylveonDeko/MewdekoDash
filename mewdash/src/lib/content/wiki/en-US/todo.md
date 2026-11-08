---
title: Todo Lists
slug: todo
summary: Shared and personal task lists inside Discord, with due dates and permissions
icon: fa-check
category: Community
dashboard: /dashboard/todo
module: Todo
tags: [todo, tasks, task list, checklist, project, due date, priority, tags, permissions]
related: [administration, tickets]
---

## What it does

Todo Lists gives your server task lists that live in the bot. A member creates a list and works through its items by adding them and marking them done. They can also hand out access so other people can view or work on the same list. Staff with Manage Server can create server-wide lists that every member can see.

Each item has a title, an optional description, a priority from 1 to 4, optional tags, an optional due date and an optional reminder time. Items keep a position so you can reorder them, and completed items are stamped with who completed them and when.

There are two kinds of list. A personal list belongs to one member and is invisible to everyone else unless the owner grants access. A server list belongs to the server; it is public by default so anyone can view it, but only people with explicit permission can add or change items.

Lists show up as embeds in Discord and on the dashboard, where you can also manage settings and access. The dashboard tracks progress and overdue counts for the list you have open.

## Why you would use it

- A moderation team tracks outstanding tasks in one server list instead of a pinned message that goes stale.
- Event organisers share a checklist and tick items off as they go.
- Members keep a private list of things to follow up on in the server.
- A project channel wants tags and priorities so "critical" items stand out from "low".

## Lists and permissions

Every list has an owner, the person who created it. The owner can do everything on that list. Other people get access through permissions, granted per user with `todogrant`.

| Permission | What it allows |
| --- | --- |
| `view` | See the list and its items |
| `add` | Add new items |
| `edit` | Edit, tag, reorder and set dates on other people's items |
| `complete` | Complete other people's items |
| `delete` | Delete other people's items |
| `manage` | Change list settings, delete the list, grant and revoke access |
| `all` | Every permission above |

Pass several as a comma-separated string, for example `todogrant 12 @user view,add,complete`. Granting again replaces that user's previous permissions. `todorevoke` removes them all.

Two rules apply regardless of permissions: the person who created an item can always manage their own item, and the list owner can always do anything.

Who can see a list:

| List type | Public | Who can view |
| --- | --- | --- |
| Personal | any | Owner, plus anyone granted `view` |
| Server | yes (default) | Everyone in the server |
| Server | no | Owner, plus anyone granted `view` |

`todotoggleprivacy` flips a list between public and private. Only the owner or someone with `manage` can do that.

## Items

| Field | Default | Notes |
| --- | --- | --- |
| Title | required | Shown in bold in the list |
| Description | none | Shown in italics under the title |
| Priority | 1 (Low) via commands, Medium on the dashboard | 1 Low, 2 Medium, 3 High, 4 Critical. Anything outside 1 to 4 is clamped |
| Due date | none | Shown as a relative Discord timestamp next to the title |
| Reminder time | none | Stored on the item and set with `todosetreminder` |
| Tags | none | Case-insensitive; adding an existing tag is a no-op |
| Position | end of list | Change with `todoreorder` |

`todoshow` lists pending items sorted by position, then priority, then creation time. Pass `true` as the second argument to also show up to five completed items with when they were completed. Dates for `todosetdue` and `todosetreminder` are parsed loosely, so `2026-10-01 18:00` and `October 1 2026` both work.

`todosearch` matches the query against the text and tags of pending items and shows up to ten results. `todofilter` narrows a list by a single tag (`todofilter 12 tag bug`) or by priority (`todofilter 12 priority 4`).

Each list can have a hex colour, set with `todosetcolor 12 #ff8800`, which is used for the embed border. The default is `#7289da`.

## Settings

There are no server-wide settings. Everything is per list or per item.

The Todo lists page has a **Create list** button in its header and two cards, **Lists** and **Items**. Changes save as you make them.

### Lists card

Pick a list from the dropdown. Personal lists are labelled with "Personal list". The URL keeps the open list as `?list=`, so a link opens straight on it. Under the dropdown you see the list's color dot, whether it is a **Server list** or **Personal list**, a **Private list** badge when a server list is hidden, an **Owner** badge when it is yours, and the description. When the list has items, a progress bar shows how many are done and how many are to do. A separate count shows overdue items. The **List settings** button opens the settings sheet.

### List settings sheet

| Setting | Default | What it controls |
| --- | --- | --- |
| Name | required, max 100 characters | Shown in the dropdown and in Discord |
| Description | none, max 500 characters | Shown under the list |
| Color | `#7289da` | The list's embed color in Discord |
| Visible to everyone | on | Server lists only. When off, only the owner and people with access can see it |

**Delete list** removes the list and all its items after confirmation. Only the owner and people with the manage permission can change these settings or delete the list.

**People with access** lists everyone who has been granted access. Pick a member under "Search members...", switch on what they may do and press **Save access**. The switches are **Add items**, **Edit items**, **Complete items**, **Delete items** and **Manage list**. Everyone granted access can view the list. Saving a member again replaces what they had. The pencil edits an entry and the bin removes it. A person with only view access shows as "Viewer" and a person with **Manage list** as "Manager".

### Items card

**Add item** opens a sheet with **Title** (required, max 200 characters), **Description**, **Priority** (Low, Medium, High or Critical, Medium by default), **Due date** and **Tags** (max 32 characters each). The button only shows if you can add items.

Above the list are a search box, an **Any priority** filter, an **Any tag** filter, a **Sort by** dropdown (List order, Priority, Due date, Newest, Title) and the **Show completed items** switch, which is off by default. Tick the circle on a row to mark it done or not done. With **List order** selected and no filter active, the arrows move an item up or down. Open an item to edit it. Edits save as you make them, and rows you may not edit open read-only.

> [!NOTE]
> **Create list** asks for a name, an optional description and a **Type** of Server list or Personal list. Server lists are the default. Color, visibility and access appear once the list exists. Personal lists only show up on the dashboard for their owner.

## Setup walkthrough

1. Open **Todo Lists** in the dashboard and click **Create list**.
2. Enter a name, an optional description and the type, then click **Create**.
3. Click **Add item** in the **Items** card. Fill in a title, an optional description, a priority, a due date and tags.
4. Open **List settings** and add people under **People with access** so they can work on the list.
5. In Discord, run `todolists` to get the list ID, then `todoshow <listId>` to check it renders.

## Commands

Run these with your server's prefix (`.` unless you changed it). List and item IDs come from `todolists` and `todoshow`.

| Command | Aliases | Needs | Purpose |
| --- | --- | --- | --- |
| `todocreatelist <name> [description]` | `tcl` | Nobody | Create a personal list |
| `todocreateserverlist <name> [description]` | `tcsl` | Manage Server | Create a server-wide list |
| `todolists [includeServer]` | | Nobody | List the lists you can see; pass `false` for personal lists only |
| `tododeletelist <listId>` | `tdl` | Nobody | Delete a list and all its items (owner or `manage`) |
| `todoshow <listId> [includeCompleted]` | `ts` | Nobody | Show a list's items |
| `todoadd <listId> <title> [description]` | `ta` | Nobody | Add an item at Low priority |
| `todoaddpriority <listId> <priority> <title> [description]` | `tap` | Nobody | Add an item with priority 1 to 4 |
| `todoedit <itemId> <title> [description]` | `te` | Nobody | Change an item's title and description |
| `todocomplete <itemId>` | `tc` | Nobody | Mark an item done |
| `tododelete <itemId>` | `td` | Nobody | Delete an item |
| `todoreorder <itemId> <position>` | `tr` | Nobody | Move an item to a 1-based position |
| `todosetdue <itemId> <date>` | `tsd` | Nobody | Set a due date |
| `todocleardue <itemId>` | `tcd` | Nobody | Remove the due date |
| `todosetreminder <itemId> <date>` | `tsr` | Nobody | Set a reminder time |
| `todoclearreminder <itemId>` | `tcr` | Nobody | Remove the reminder time |
| `todoaddtag <itemId> <tag>` | `tat` | Nobody | Add a tag |
| `todoremovetag <itemId> <tag>` | `trt` | Nobody | Remove a tag |
| `todosearch <listId> <query>` | `tsearch` | Nobody | Search pending items by title, description or tag |
| `todofilter <listId> <tag or priority> <value>` | `tf` | Nobody | Filter pending items by one tag or one priority |
| `todosetcolor <listId> <#hex>` | `tsc` | Nobody | Set the embed colour |
| `todotoggleprivacy <listId>` | `ttp` | Nobody | Switch a list between public and private |
| `todogrant <listId> @user <perms>` | `tg` | Nobody | Grant comma-separated permissions |
| `todorevoke <listId> @user` | `trv` | Nobody | Remove all of a user's permissions |
| `todopermissions <listId>` | `tp` | Nobody | Show who has which permissions |

"Nobody" means there is no Discord permission check; the list's own permissions decide whether the command succeeds. The same commands exist as slash commands under `/todo`.

## Tips and gotchas

- Reminder times are saved on the item, but nothing in the bot currently sends a reminder when that time arrives. Treat it as a note for now.
- `todoshow` marks a list as not found if you have no `view` access, even when the ID is right.
- A list name must be unique per owner and type, so two members can each have a "Shopping" personal list but one member cannot have two.
- `todoreorder` renumbers every item in the list, so positions stay contiguous.
- Public server lists are readable by everyone but nobody except the owner can add to them until you grant `add`.
- Reminder times are not editable on the dashboard, since nothing sends them yet.
- Deleting a list removes its permissions and items in one go and cannot be undone.
