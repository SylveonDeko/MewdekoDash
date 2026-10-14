---
title: Role States
slug: rolestates
summary: Remember the roles a member had when they left the server and hand them back automatically when they rejoin.
icon: fa-tag
category: Actions
dashboard: /dashboard/rolestates
module: RoleStates
tags: [role states, role persistence, restore roles, rejoin, saved roles, role backup, transfer roles]
related: [administration, statusroles]
---

## What it does

When Role States is enabled, the bot watches for members leaving. The moment someone leaves, it records the list of roles they held at that time. If that person later rejoins, the bot adds every saved role back to them, so they do not have to ask staff to be re-verified or re-assigned.

From the member's point of view nothing changes on the way out. On the way back in, their roles are simply there again, usually before they finish reading the welcome channel.

Staff get a saved role list per member that they can inspect, edit or delete, an exclusion list for roles that should never be restored, and a bulk "save everyone now" action so the feature also covers members who were already in the server before you turned it on.

## Why you would use it

- Verified members who leave by accident, or to clear notifications, come back without losing access.
- Colour, ping and hobby roles picked from a reaction role menu survive a rejoin.
- Servers with a manual verification process avoid re-checking people who were already approved.
- You can hand pick roles that should never come back, such as a temporary muted role or a staff role.
- Moving a community to a new server: role states can be transferred and matched to roles with the same names.

## How a role state is saved

When a member leaves, the bot checks:

1. Role States is enabled for the server.
2. **Ignore Bots** is off, or the member is not a bot.
3. The member is not on the **Denied Users** list.

If all of that passes, it takes the member's current roles, drops the `@everyone` role and any managed roles (bot roles, booster role, integration roles), then removes anything on the **Denied Roles** list. If nothing is left, nothing is saved. Otherwise the list replaces whatever was stored for that member before.

Bans are handled separately. With **Clear on Ban** enabled, banning a member deletes their saved state, so an unban and rejoin does not restore anything.

## How a role state is restored

On join, the bot again checks that the feature is enabled, that bots are not being ignored (if the member is a bot), and that the user is not on the denied list. It then adds every saved role in one request. Roles that no longer exist or sit above the bot's highest role cause that request to fail, and the failure is only logged.

> [!PERMISSION]
> The bot needs Manage Roles, and its highest role must be above every role it is expected to give back.

### Skipping auto-assign roles

If you also use auto-assign roles from the Administration module, a returning member would normally receive both the saved roles and the auto-assign roles. Turning on **skip auto-assign** with `togglerolestatesskipautoassign` makes the bot skip auto-assign roles for anyone who has a saved role state, so returning members only get what they had before. This toggle is command only; it is not on the dashboard.

## Managing saved states by hand

Staff can build or adjust a member's state without waiting for them to leave:

- `setuserrolestate` replaces a member's saved list with the roles you name. Managed roles and `@everyone` are dropped.
- `addrolestorolestate` and `removerolesfromrolestate` change an existing saved list.
- `deleteuserrolestate` forgets a member entirely.
- `saveallrolestates` snapshots every current member at once, applying the same bot and deny filters as an automatic save.

The dashboard adds one thing commands do not have: **Copy Role State**, which takes one member's saved roles and applies them directly to another member who is currently in the server.

## Transferring to another server

`transferrolestates <serverId>` copies every saved state from the current server to another server the bot is in. Roles are matched by name, ignoring case, and managed roles are skipped. Members whose saved roles have no name match in the target are skipped. The target server has Role States enabled automatically if it was not already, inheriting the source's **Ignore Bots** and **Clear on Ban** values when it has no settings of its own.

## Settings

The **Settings** tab on the Role States page has two sub-tabs, **General** and **Denied**.

| Setting | Default | What it controls |
| --- | --- | --- |
| Role States | Off | Master switch for saving and restoring |
| Clear on Ban | Off | Delete a member's saved state when they are banned |
| Ignore Bots | Off | Do not save or restore roles for bot accounts |
| Save Current States | button | Snapshot every current member's roles now |
| Denied Roles | none | Roles that are never saved, and therefore never restored |
| Denied Users | none | Members whose roles are never saved or restored |

The **Management** tab holds **Manage User Roles** (add or remove selected roles from a member's saved state) and **Copy Role State**. The **Role States** tab lists every saved state with the member's name, ID and roles, and lets you view details or delete an entry.

## Setup walkthrough

1. Make sure the bot's role is above every role you want it to restore.
2. Open **Role States** in the dashboard and turn on **Role States** under **Settings**, **General**.
3. Turn on **Ignore Bots** unless you specifically want bot roles remembered.
4. Decide on **Clear on Ban**. Leave it off if you want unbanned members to get their roles back.
5. In **Denied**, add staff roles, punishment roles and anything temporary to **Denied Roles**.
6. Press **Save All** under **Save Current States** so existing members are covered from today.
7. Check the **Role States** tab to confirm the snapshot populated.

## Commands

Run these with your server's prefix (`.` unless you changed it). Every command in this module needs Administrator.

| Command | Aliases | Needs | Purpose |
| --- | --- | --- | --- |
| `togglerolestates` | `trs` | Administrator | Turn Role States on or off |
| `viewrolestatessettings` | `vrss` | Administrator | Show the current settings and deny lists |
| `viewuserrolestates` | `viewrolestates`, `vurs` | Administrator | Page through every saved state |
| `saveallrolestates` | `saveserverstates`, `backuprolestates` | Administrator | Snapshot every current member |
| `transferrolestates <serverId>` | `copyrolestates`, `moverolestates` | Administrator | Copy states to another server, matching roles by name |
| `togglerolestatesignorebots` | `trsib` | Administrator | Toggle ignoring bot accounts |
| `togglerolestatesclearonban` | `trscob` | Administrator | Toggle clearing a state on ban |
| `togglerolestatesskipautoassign` | `trssaa`, `rsskipautoassign` | Administrator | Toggle skipping auto-assign roles for members with a saved state |
| `rolestatesadddenyrole @role...` | `rsadr` | Administrator | Add roles to the denied list |
| `rolestatesremovedenyrole @role...` | `rsrra` | Administrator | Remove roles from the denied list |
| `rolestatesadddenyuser @user...` | `rsadu` | Administrator | Add members to the denied list |
| `rolestatesremovedenyuser @user...` | `rolestatesremoveadduser`, `rsrau` | Administrator | Remove members from the denied list |
| `setuserrolestate @user @role...` | `surs` | Administrator | Replace a member's saved roles |
| `addrolestorolestate @user @role...` | `arsrs` | Administrator | Add roles to a member's saved state |
| `removerolesfromrolestate @user @role...` | `rrfrs` | Administrator | Remove roles from a member's saved state |
| `deleteuserrolestate @user` | `dur` | Administrator | Forget a member's saved state |

Slash equivalents live under `/rolestates`.

## Tips and gotchas

- Nothing is saved for members who were already in the server when you enabled the feature until they leave, or until you run **Save All**. Run it once right after setup.
- Only leaves trigger a save. Kicks count as leaves. Bans also count as leaves, and the state is then removed again if **Clear on Ban** is on.
- Restoring uses a single add-roles call. One missing or too-high role makes the whole restore fail silently, so keep the deny list current when you delete or reorder roles.
- Managed roles (bot integration roles, the booster role) are never saved. Discord assigns those itself.
- `viewuserrolestates` shows three members per page.
- Both `setuserrolestate` and `deleteuserrolestate` accept a user who has already left, so you can fix a state before someone rejoins.
- Denied Users only affects automatic saves and restores. Manual commands and **Copy Role State** still work on those members.
