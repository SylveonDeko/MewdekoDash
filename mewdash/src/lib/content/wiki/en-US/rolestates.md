---
title: Role States
slug: rolestates
summary: Gives members their old roles back when they rejoin the server
icon: fa-tag
category: Actions
dashboard: /dashboard/roles?tab=states
module: RoleStates
tags: [role states, role persistence, restore roles, rejoin, saved roles, role backup, transfer roles]
related: [roles, administration, statusroles]
---

## What it does

When Role States is on, the bot watches for members leaving. The moment someone leaves, it records the list of roles they held at that time. If that person later rejoins, the bot adds every saved role back to them, so they do not have to ask staff to be re-verified or re-assigned.

From the member's point of view nothing changes on the way out. On the way back in, their roles are simply there again, usually before they finish reading the welcome channel.

Staff get a saved role list per member that they can inspect and change, plus an exclusion list for roles that should never be restored. A bulk "save everyone now" action covers members who were already in the server before you turned the feature on.

## Why you would use it

- Verified members who leave by accident, or to clear notifications, come back without losing access.
- Colour, ping and hobby roles picked from a reaction role menu survive a rejoin.
- Servers with a manual verification process avoid re-checking people who were already approved.
- You can hand pick roles that should never come back, such as a temporary muted role or a staff role.
- Moving a community to a new server: role states can be transferred and matched to roles with the same names.

## How a role state is saved

When a member leaves, the bot checks:

1. **Sticky roles** is on for the server.
2. **Ignore bots** is off, or the member is not a bot.
3. The member is not on the **Denied users** list.

If all of that passes, it takes the member's current roles, drops the `@everyone` role and any managed roles such as bot or booster roles, then removes anything on the **Denied roles** list. If nothing is left, nothing is saved. Otherwise the list replaces whatever was stored for that member before.

Bans are handled separately. With **Clear on ban** on, banning a member deletes their saved state, so an unban and rejoin does not restore anything.

## How a role state is restored

On join, the bot again checks that the feature is enabled and that the user is not on the denied list. If the member is a bot, it also checks that bots are not being ignored. It then adds every saved role in one request. Roles that no longer exist or sit above the bot's highest role cause that request to fail, and the failure is only logged.

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

The dashboard adds one thing commands do not have: **Copy role state**, which takes one member's saved roles and applies them directly to another member who is currently in the server.

## Transferring to another server

`transferrolestates <serverId>` copies every saved state from the current server to another server the bot is in. Roles are matched by name, ignoring case, and managed roles are skipped. Members whose saved roles have no name match in the target are skipped. The target server has Role States enabled automatically if it was not already, inheriting the source's **Ignore bots** and **Clear on ban** values when it has no settings of its own.

## The Sticky roles tab

On the Roles page this feature is the **Sticky roles** tab. It has three sub-tabs, **Settings**, **Management** and **Sticky roles**. The toolbar above them has **Save all states** and **Refresh**. Settings save as you change them.

### Settings

The **Sticky roles** card has three switches. All start off, and the other two are locked until the first one is on.

| Setting | What it controls |
| --- | --- |
| Sticky roles | Master switch for saving and restoring. Reads **Saving roles when members leave** when on. |
| Clear on ban | Delete a member's saved state when they are banned. **Deleted after a ban** when on, **Kept after a ban** when off. |
| Ignore bots | Do not save or restore roles for bot accounts. **Bot roles are not saved** when on. |

Two cards below it hold the lists. Pick a role or member to add it, and remove it with its remove button.

| Card | What it holds |
| --- | --- |
| Denied roles | Roles that are never saved or restored. Empty reads **No roles are being excluded**. |
| Denied users | Members whose roles are never saved or restored. Empty reads **No users are being excluded**. |

**Save all states** in the toolbar snapshots every current member's roles now and reports how many members were saved. It is locked while the master switch is off.

### Management

| Card | What it does |
| --- | --- |
| Manage user roles | Pick a user and one or more roles, then **Add selected roles** or **Remove selected roles** to change that member's saved state |
| Copy role state | Pick a **Source user (copy from)** who has a saved state and a **Target user (copy to)** who is in the server, then **Apply role state** to give the target those roles |

### Sticky roles

The **Saved role states (N)** card lists every saved state, 20 to a page, with the member's name and how many roles they have. Press a row to see **All saved roles**, or the bin to delete the state. With nothing saved it reads **No role states saved**.

## Setup walkthrough

1. Make sure the bot's role is above every role you want it to restore.
2. Open **Roles**, pick the **Sticky roles** tab and turn on **Sticky roles** under **Settings**.
3. Turn on **Ignore bots** unless you specifically want bot roles remembered.
4. Decide on **Clear on ban**. Leave it off if you want unbanned members to get their roles back.
5. Add staff roles and anything temporary, such as punishment roles, to **Denied roles**.
6. Press **Save all states** so existing members are covered from today.
7. Open the **Sticky roles** sub-tab to confirm the snapshot populated.

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

- Nothing is saved for members who were already in the server when you enabled the feature until they leave, or until you press **Save all states**. Do it once right after setup.
- Only leaves trigger a save. Kicks count as leaves. Bans also count as leaves, and the state is then removed again if **Clear on ban** is on.
- Restoring uses a single add-roles call. One missing or too-high role makes the whole restore fail silently, so keep the deny list current when you delete or reorder roles.
- Managed roles (bot integration roles, the booster role) are never saved. Discord assigns those itself.
- `viewuserrolestates` shows three members per page.
- Both `setuserrolestate` and `deleteuserrolestate` accept a user who has already left, so you can fix a state before someone rejoins.
- **Denied users** only affects automatic saves and restores. Manual commands and **Copy role state** still work on those members.
