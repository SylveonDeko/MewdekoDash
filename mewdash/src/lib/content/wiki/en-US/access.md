---
title: Dashboard Access
slug: access
summary: Lets chosen members or roles use parts of your server's dashboard without being Discord administrators
icon: fa-key
category: Security
dashboard: /dashboard/access
tags: [dashboard access, permissions, grant, staff, restrict, who can edit, view, manage, managers, delegation]
related: [auditlog, administration]
---

## What it does

Out of the box, only the server owner and members with the Administrator permission can open a server in the dashboard. Dashboard Access lets you widen that. You pick a member or a role and choose which dashboard sections they get, each as **View** or **Manage**. From then on that server appears in their dashboard server list and the sections you granted work for them; everything else is refused.

The check happens on the bot's API, not just in the web page. Every request that names a server carries the signed-in user's identity. If they are the owner or an Administrator the request goes through. Otherwise the bot looks up the section the request belongs to, treats reads as **View** and any change as **Manage**. It then compares that with the best level the user holds directly or through any of their roles.

The server owner also decides who may edit the access list itself. By default only the owner can. The owner can appoint specific access managers, or flip one switch to let anyone with Administrator or Manage Server do it.

## Why you would use it

- A community team runs giveaways and tickets from the dashboard without holding Administrator in Discord.
- A moderator role gets **Manage** on Moderation and Logging and **View** on everything else, so they can look but not change settings they do not own.
- A bot helper is trusted to edit XP and Currency but nothing security related.
- The owner delegates upkeep of the access list to a co-owner role without giving away owner-only controls.

## Access levels

| Level | Allows |
| --- | --- |
| None | Nothing for that section; the section is not granted |
| View | Read requests only, such as opening the page and loading its data |
| Manage | Everything View allows, plus any change |

When a member matches more than one grant, for example a personal grant and a role grant, the highest level for each section wins. A member with at least one section granted sees the server in their dashboard server switcher; a member with no grants at all does not.

Owners and Administrators bypass grants entirely and always have full access.

## Sections

Sections match the dashboard sidebar. Each feature in the picker maps to one or more of the bot's API areas, so granting Administration covers the Administration, channel tools, channel actions and lockdown endpoints, and Roles also covers Protection. The picker groups features by sidebar category, and features that are global bot infrastructure rather than per-server data, such as Performance, are not grantable. Owner-only pages are not listed either.

When a feature maps to several areas, its row shows the lowest level shared across them, and clicking a level sets all of its areas at once.

## Who can manage the access list

| Who | Can do |
| --- | --- |
| Server owner | Everything, including the delegation switch and the manager list |
| Appointed access managers | Edit grants |
| Administrator or Manage Server members | Edit grants, only while the delegation switch is on |
| Everyone else | Sees "You can't manage dashboard access here" |

Access managers can be a member or a role. Only the owner sees the **Delegation settings** and **Access managers** cards, and the API refuses those calls from anyone else. Anyone else who opens the page without permission sees "You can't manage dashboard access here".

> [!WARNING]
> Granting **Manage** on Dashboard Access is not possible, because the access controller is exempt from section checks. Use the manager list or the delegation switch to hand out control of the list instead.

## Settings

Everything is on the single Dashboard Access page.

| Setting | Default | What it controls |
| --- | --- | --- |
| Allow administrators and Manage Guild members to manage dashboard access | Off | Card **Delegation settings**. When on, Administrator and Manage Server members can edit grants. Owner only. |
| Access managers | none | Members or roles appointed to edit grants. Pick **User** or **Role** as the target type, choose the target and click **Add manager**. Owner only. |
| Access grants | none | One row per member or role, showing how many sections it covers. Each row has edit and remove buttons. Visible to the owner and managers. |

Click **Grant restricted access** under **Access grants** to open the sheet. It takes a target type (**User** or **Role**) and the target. Each feature then gets a level of **None**, **View** or **Manage**. The **All sections** row sets every feature at once, and features are grouped under their sidebar category. Saving a grant for a target that already has one replaces it. The edit button opens the same sheet titled **Edit access grant**, with the target locked.

## Setup walkthrough

1. Open **Dashboard Access** in the dashboard as the server owner.
2. Decide who maintains the list. Either turn on the switch under **Delegation settings**, or add a member or role under **Access managers**.
3. Under **Access grants**, click **Grant restricted access**, choose **Role** as the target type and pick your staff role.
4. Set **Manage** on the features they run day to day and **View** on the ones they should only inspect. Leave the rest at **None**.
5. Click **Grant access**. The grant appears under **Access grants**.
6. Ask a member with that role to sign in to the dashboard. The server should now appear in their list, with only the granted pages working.

## Commands

Dashboard Access is configured only from the dashboard; there are no bot commands for it.

## Tips and gotchas

- Grants are checked against the bot's cached member list, so a member must be in the server and visible to the bot for their grant to work.
- Role grants follow the member's current roles. Removing the role removes the access immediately.
- A grant needs at least one feature above **None**. The sheet refuses to save otherwise, so remove the grant with its remove button to take access away.
- Administrators keep full access no matter what grants say. To restrict someone, remove Administrator in Discord first, then grant what they need here.
- The dashboard proxy attaches a shared API key to every request, but that key alone never grants access to a server; the signed-in user's identity is always required.
- Endpoints that are not tied to a server, such as the global command list, are not subject to section checks and keep working for restricted users.
