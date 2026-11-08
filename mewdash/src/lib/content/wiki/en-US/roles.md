---
title: Roles
slug: roles
summary: One dashboard page that gathers the bot's role features
icon: fa-tag
category: Actions
dashboard: /dashboard/roles
module: RoleMenus
tags: [roles, role menus, sticky roles, status roles, activity roles, role messages, join timeout, join role timeout, unverified members]
related: [role-menus, rolestates, statusroles, statroles, rolegreets, administration]
---

## What it does

The Roles page holds every role feature in one place. Pick a section from the tabs at the top. The selected tab is saved in the page address as `?tab=`, so a link opens the same section. Each section saves as you change it.

## Tabs

| Tab | `?tab=` | What it does |
| --- | --- | --- |
| Role menus | `menus` | Dropdowns and buttons members use to pick their own roles. See [Role Menus](/wiki/role-menus). |
| Sticky roles | `states` | Gives members their roles back when they rejoin. See [Role States](/wiki/rolestates). |
| Status roles | `status` | Gives a role to members who put set text in their status. See [Status Roles](/wiki/statusroles). |
| Activity roles | `stats` | Roles earned by activity over time and lost when it stops. See [Stat Roles](/wiki/statroles). |
| Role messages | `greets` | Posts a message when a member gains a role. See [Role Greets](/wiki/rolegreets). |
| Join timeout | `timeout` | Acts on members who do not get a required role within a set time. |

The page opens on **Role menus**. On a phone the tabs are shown as a grid.

## Join timeout

Join timeout deals with members who join and never finish verification, for example by accepting the rules. When a member joins without one of the required roles, a countdown starts. If they get a required role, or an exempt role, before it ends, the countdown stops. When it ends, the bot applies the action you chose.

Bots are never counted. A member who leaves loses their countdown.

### Join role timeout card

The **Join role timeout** card has the master switch in its header.

| Setting | Default | What it controls |
| --- | --- | --- |
| Time to get a role | 1 day | How long a member has. A number plus **Minutes**, **Hours** or **Days**. From 1 minute to 30 days. |
| Warn before | none | Optional. How long before the deadline the member is sent a warning. At least 1 minute and shorter than the time to get a role. |
| Include existing members | off | Members already in the server without a required role start counting down when you turn the feature on |

The card also shows how many members are counting down (**Nobody is counting down** when none are) and when the next ones are **Next due**.

### Required roles and exempt roles

The **Required roles** card has two role pickers. **Required roles** are the roles that stop the countdown, and any one of them is enough. **Exempt roles** are roles whose holders are skipped entirely. You must pick at least one required role to turn the feature on.

### Action card

| Setting | What it does |
| --- | --- |
| Action | **Kick**, **Ban**, **Give a role**, **Remove all roles** or **Time out** |
| Role to give | Shown with **Give a role**. The role to add. Required for that action. |
| Log channel | Optional. A text channel where warnings and actions are logged. |

**Time out** applies the longest timeout Discord allows, 28 days. **Remove all roles** removes every role the bot is able to remove. Kicks, bans and timeouts are recorded as moderation cases.

### Warning message card

The **Warning message** card holds two texts. **Warning message** is sent before the deadline when **Warn before** is set. **Action message** is sent when the action is applied. Both are sent to the member in a DM and leave the default wording when empty. Each is built in the message editor, so it can be plain text or an embed. Placeholders work in both, and `%timeleft%` is available in the warning.

### Setup

1. Open **Roles** and pick the **Join timeout** tab.
2. Under **Required roles**, pick the role members get once verified.
3. Pick **Exempt roles** if some members should never be acted on, such as staff.
4. Choose the **Action**.
5. Set **Time to get a role** and, if you want one, **Warn before**.
6. Optionally pick a **Log channel**.
7. Turn the switch on in the **Join role timeout** card. Turn on **Include existing members** if people already in the server should count down too.

> [!PERMISSION]
> The bot needs the permission for the action: Kick Members, Ban Members, Moderate Members or Manage Roles. Its highest role must be above the member, and above the role it gives. The server owner is never acted on.

> [!WARNING]
> Check **Required roles** twice before turning on **Kick** or **Ban** together with **Include existing members**. Everyone without a required role starts counting down.

## Tips and gotchas

- The bot checks every minute, so an action can happen up to a minute after the deadline.
- Turning the feature off clears every countdown.
- If the bot cannot act, for example because of role order, the failure is written to the **Log channel** and the countdown is dropped.
- The old pages for each feature redirect here and open the matching tab.
