---
title: Dashboard Access
slug: access
summary: Let specific members or roles open your server's dashboard and view or manage only the sections you pick, without making them Discord administrators.
icon: fa-key
category: Security
dashboard: /dashboard/access
tags: [dashboard access, permissions, grant, staff, restrict, who can edit, view, manage, managers, delegation]
related: [auditlog, administration]
---

## What it does

Out of the box, only the server owner and members with the Administrator permission can open a server in the dashboard. Dashboard Access lets you widen that. You pick a member or a role, choose which dashboard sections they get, and whether each one is **View** or **Manage**. From then on that server appears in their dashboard server list and the sections you granted work for them; everything else is refused.

The check happens on the bot's API, not just in the web page. Every request that names a server carries the signed-in user's identity. If they are the owner or an Administrator the request goes through. Otherwise the bot looks up the section the request belongs to, treats reads as **View** and any change as **Manage**, and compares that with the best level the user holds directly or through any of their roles.

The server owner also decides who may edit the access list itself. By default only the owner can. The owner can appoint specific access managers, or flip one switch to let anyone with Administrator or Manage Server do it.

## Why you would use it

- A community team runs giveaways, suggestions and tickets from the dashboard without holding Administrator in Discord.
- A moderator role gets **Manage** on Moderation and Logging and **View** on everything else, so they can look but not change settings they do not own.
- A bot helper is trusted to edit XP and Currency but nothing security related.
- The owner delegates upkeep of the access list to a co-owner role without giving away owner-only controls.

## Access levels

| Level | Allows |
| --- | --- |
| None | Nothing for that section; the section is not granted |
| View | Read requests only, such as opening the page and loading its data |
| Manage | Everything View allows plus creating, editing and deleting |

When a member matches more than one grant, for example a personal grant and a role grant, the highest level for each section wins. A member with at least one section granted sees the server in their dashboard server switcher; a member with no grants at all does not.

Owners and Administrators bypass grants entirely and always have full access.

## Sections

Sections match the dashboard sidebar. Each feature in the picker maps to one or more of the bot's API areas, so granting "Administration" covers both the Administration and Protection endpoints, and "Moderation" also covers Protection. The picker groups sections by sidebar category, and features that are global bot infrastructure rather than per-server data, such as Performance, are not grantable.

When a grant covers a feature that maps to several areas, the picker shows the lowest level shared across them; setting the group sets all of its areas at once.

## Who can manage the access list

| Who | Can do |
| --- | --- |
| Server owner | Everything: the delegation switch, the manager list, and all grants |
| Appointed access managers | Add, edit and remove grants |
| Administrator or Manage Server members | Add, edit and remove grants, only while the delegation switch is on |
| Everyone else | Sees "You can't manage dashboard access here" |

Access managers can be a member or a role. Only the owner can see or change the manager list and the delegation switch; the API refuses those calls from anyone else.

> [!WARNING]
> Granting **Manage** on Dashboard Access is not possible, because the access controller is exempt from section checks. Use the manager list or the delegation switch to hand out control of the list instead.

## Settings

Everything is on the single Dashboard Access page.

| Setting | Default | What it controls |
| --- | --- | --- |
| Allow Administrators and Manage Guild members to manage dashboard access | Off | Under **Delegation Settings**. When on, Administrator and Manage Server members can edit grants. Owner only. |
| Access Managers | none | Members or roles appointed to edit grants. Owner only. |
| Access Grants | none | One entry per member or role, listing a level per section. Managers and the owner. |

The **Grant Restricted Access** form takes a target type (user or role), the target, and a level per feature group. Saving a second grant for the same target replaces the first. Editing an existing grant opens the same form as **Edit Access Grant**.

## Setup walkthrough

1. Open **Dashboard Access** in the dashboard as the server owner.
2. Decide who maintains the list. Either turn on the delegation switch under **Delegation Settings**, or add a member or role under **Access Managers**.
3. Under **Grant Restricted Access**, choose **Role** and pick your staff role.
4. Set **Manage** on the features they run day to day and **View** on the ones they should only inspect. Leave the rest at **None**.
5. Click **Grant Access**. The grant appears under **Access Grants**.
6. Ask a member with that role to sign in to the dashboard. The server should now appear in their list, with only the granted pages working.

## Commands

Dashboard Access is configured only from the dashboard; there are no bot commands for it.

## Tips and gotchas

- Grants are checked against the bot's cached member list, so a member must be in the server and visible to the bot for their grant to work.
- Role grants follow the member's current roles. Removing the role removes the access immediately.
- A grant with every section set to **None** counts as no grant and is dropped, and the member loses the server in their switcher.
- Administrators keep full access no matter what grants say. To restrict someone, remove Administrator in Discord first, then grant what they need here.
- The dashboard proxy attaches a shared API key to every request, but that key alone never grants access to a server; the signed-in user's identity is always required.
- Endpoints that are not tied to a server, such as the global command list, are not subject to section checks and keep working for restricted users.
