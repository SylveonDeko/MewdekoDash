---
title: Role Menus
slug: role-menus
summary: Posts a message with a dropdown or buttons that members use to pick their own roles.
icon: fa-list-ul
category: Actions
dashboard: /dashboard/role-menus
module: RoleMenus
tags: [role menus, self roles, dropdown, buttons, pronouns, colors]
related: [administration, embedbuilder, rolestates]
---

## What it does

A role menu is one message in a channel with a **dropdown** or a row of **buttons** under it. Each option on the menu gives a role. Members pick an option to get the role and pick it again to drop it, so a server can let people choose their pronouns, colors, pings, or regions without asking staff.

Each menu has a name (only staff see it, and it titles the default message), a channel, a message, and up to 25 options. An option has a role, the name shown on the menu, an optional emoji, and an optional description. Descriptions show under each dropdown option and in the default message. Buttons also have a color: blurple, grey, green, or red.

The message can be anything the embed builder makes: plain text, one or more embeds, or both. Leave it empty and the bot posts the menu's name with a line for each option instead.

## Pick any or pick one

- **Pick any** lets members turn each role on or off. Two limits control how many they can hold: **Must keep at least** stops them from dropping below a number once they have picked, and **Can hold at most** caps how many they can have from the menu (no limit by default).
- **Pick one** swaps roles: picking a new option removes the one they had. Turn on **Keep one once chosen** and members can switch but can't clear their pick.

## Limits

| Limit | Value |
| --- | --- |
| Menus per server | 50 |
| Options per menu | 25 |
| Buttons per row | 5 |
| Menu name | 100 characters |
| Name on the menu | 80 characters |
| Description | 100 characters |
| Dropdown hint text | 150 characters |
| Plain text message | 2000 characters |

Each role can only be on a menu once. The bot can only give out roles below its own highest role that no integration manages, and staff can only offer roles below their own highest role.

## Required role

A menu can require a role. Members without it get a private note saying they need that role, and nothing changes.

## Confirmation

With **Tell members what changed** on, members get a private note only they can see, listing the roles added and removed. With it off, the menu works quietly, though members still get a private note if something goes wrong, such as hitting a limit or a role the bot can't give out.

## Editing, pausing, and posting again

Saving an edit rebuilds the same message in place. A new message is only posted when the channel changes or the old message is gone.

**Pause** greys out the dropdown or buttons in Discord until the menu is resumed. **Post again** posts a fresh copy and deletes the old message, which helps when a menu has scrolled out of sight or was deleted by hand. If a menu's channel is deleted, edit it, pick a new channel, and save to post it again.

Deleting a menu deletes its message too. Members keep the roles they already picked.

## Moving older setups

Older emoji role setups had members add an emoji under a message to get a role. The **Move older setups** tab lists them. Moving one creates a role menu with the same roles and emojis, as a dropdown or buttons, in the same channel or another one. It can copy the old message's text and embeds, and it can retire the old setup, which stops it and clears its emojis. If the bot posted the original message, retiring deletes it. A setup where members could hold only one role becomes a pick one menu.

## Commands

| Command | What it does |
| --- | --- |
| `rolemenus` | Lists every menu with its channel, type, number of options, and status. |
| `rolemenuinfo 3` | Shows everything about one menu. |
| `rolemenucreate #roles dropdown @Role @Role` | Posts a new menu with one option per role. |
| `rolemenuadd 3 @Role [emoji] [name]` | Adds a role to a menu. |
| `rolemenuremove 3 @Role` | Removes a role from a menu. |
| `rolemenuname 3 Pronouns` | Renames a menu. |
| `rolemenumessage 3 [message\|clear]` | Shows, sets, or clears the message above a menu. |
| `rolemenustyle 3 dropdown\|buttons` | Switches between a dropdown and buttons. |
| `rolemenumode 3 multi\|exclusive` | Switches between pick any and pick one. |
| `rolemenulimits 3 0 2` | Sets how many roles members must keep and can hold. |
| `rolemenurequire 3 [@Role]` | Sets or clears the required role. |
| `rolemenureply 3 private\|silent` | Turns the private note on or off. |
| `rolemenupause 3` | Pauses a menu, or resumes it when paused. |
| `rolemenurepost 3 [#channel]` | Posts a fresh copy and deletes the old message. |
| `rolemenudelete 3` | Deletes a menu and its message. |
| `rolemenuimport messageId [dropdown\|buttons]` | Moves an older emoji role setup into a new menu. |
