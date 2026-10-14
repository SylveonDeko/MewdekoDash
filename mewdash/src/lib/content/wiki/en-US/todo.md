---
title: Todo Lists
slug: todo
summary: Shared and personal task lists inside Discord, with priorities, due dates, tags, search and per-person permissions.
icon: fa-check
category: Community
dashboard: /dashboard/todo
module: Todo
tags: [todo, tasks, task list, checklist, project, due date, priority, tags, permissions]
related: [administration, tickets]
---

## What it does

Todo Lists gives your server task lists that live in the bot. A member creates a list, adds items to it, marks them done, and can hand out access so other people can view or work on the same list. Staff with Manage Server can create server-wide lists that every member can see.

Each item has a title, an optional description, a priority from 1 to 4, optional tags, an optional due date and an optional reminder time. Items keep a position so you can reorder them, and completed items are stamped with who completed them and when.

There are two kinds of list. A personal list belongs to one member and is invisible to everyone else unless the owner grants access. A server list belongs to the server; it is public by default so anyone can view it, but only people with explicit permission can add or change items.

Lists show up as embeds in Discord and as cards on the dashboard. The dashboard also tracks progress, overdue counts and completion rate for the list you have open.

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

Two rules apply regardless of permissions: the person who created an item can always edit, complete and delete their own item, and the list owner can always do anything.

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

`todosearch` matches the query against titles, descriptions and tags of pending items and shows up to ten results. `todofilter` narrows a list by a single tag (`todofilter 12 tag bug`) or by priority (`todofilter 12 priority 4`).

Each list can have a hex colour, set with `todosetcolor 12 #ff8800`, which is used for the embed border. The default is `#7289da`.

## Settings

There are no server-wide settings. Everything is per list or per item.

The Todo Lists page has one view. The left side lists every list you can see, with a **Search todo lists** box, a **Show completed items** toggle, and **Sort by** (Priority, Due Date, Created, Title) with an order selector. Selecting a list shows its items with **Add Item** and **Delete List** buttons, an item editor with **Priority** and **Due date**, and a **Manage permissions** button per list.

| Setting | Default | What it controls |
| --- | --- | --- |
| List name and description | required, none | Set when creating a list from the **Create List** button |
| Priority (item) | Medium | The item's priority; shown as a coloured chip |
| Due date (item) | none | Deadline used for the overdue counter |
| Show completed items | off | Whether done items appear in the list view |

> [!NOTE]
> Lists created from the dashboard are always server lists. Create personal lists with `todocreatelist` in Discord.

## Setup walkthrough

1. Open **Todo Lists** in the dashboard and click **Create List**.
2. Enter a name and optional description. The list is created as a public server list.
3. Click the list, then **Add Item**. Fill in **What needs to be done?**, an optional description and a priority.
4. Use **Manage permissions** on the list card to see who has access. Grant access from Discord with `todogrant <listId> @user add,complete` so those people can work on it.
5. In Discord, run `todolists` to get the list ID, then `todoshow <listId>` to check it renders.
6. Mark things done with `todocomplete <itemId>`; the item ID is shown in backticks in `todoshow`.

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
- Use `todogrant` in Discord for the full permission set; the dashboard's **Manage permissions** view is for checking who has access.
- Deleting a list removes its permissions and items in one go and cannot be undone.
