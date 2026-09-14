---
title: Audit Log
slug: auditlog
summary: A record of who used the dashboard for your server, what they looked at, and what they changed, kept for ninety days.
icon: fa-clipboard-check
category: Security
dashboard: /dashboard/auditlog
tags: [audit, history, accountability, dashboard access, who changed, log, changes, before and after]
related: [logging, administration, channel-access]
---

## What it does

Every request the dashboard sends to the bot for your server is recorded against the Discord account that was logged in. The Audit Log page turns that into a timeline: who opened the XP settings, who edited the welcome message, who deleted a chat trigger, and what the values were before and after.

It is separate from Discord's own audit log and from the Logging feature. Discord's log covers actions taken inside Discord. Mewdeko's Logging feature posts server events such as joins, edits and role changes into channels you choose. The dashboard Audit Log covers only the dashboard.

Nothing needs enabling. Entries are written from the moment someone logs into the dashboard and opens your server, and they age out after ninety days.

## Why you would use it

- Several people have dashboard access and you want to know who switched off Anti-Raid last week.
- A setting changed and nobody owns up to it.
- You want a trail before you hand dashboard access to a wider staff team.
- You need to confirm that a change you asked someone to make was actually made, and what it replaced.

## What is recorded

Each entry carries:

- **When**: the time of the request, stored in UTC and shown in your own timezone on the page.
- **User**: the Discord username and ID taken from the dashboard login, not from anything the user typed.
- **Action**: one of the actions in the table below.
- **Section**: the dashboard area, shown with a friendly name such as "AFK System", "Triggers" or "Protection".
- **Endpoint**: the exact request, for example `PUT Afk/123/settings`, shown in small print under the section.
- **Changes**: for anything other than a view, the values that were sent or changed. Expand the entry with **Details** to see them.

The bot also stores the browser's user agent string with each entry.

### Actions

The action is decided by the kind of request the dashboard made.

| Action | Recorded when |
| --- | --- |
| Viewed | The dashboard read data (a GET request). Every page load produces these. |
| Created | Something was added (a POST request). |
| Updated | Something existing was changed (a PUT or PATCH request). |
| Deleted | Something was removed (a DELETE request). |
| Accessed | Reserved for dashboard session starts. The filter offers it, but the current version never writes entries with this action. |

### Change sets

Views store no change data. For everything else the bot stores one of two documents:

- **Before and after diff**: when the dashboard section snapshots the setting before changing it, the entry lists only the fields that changed, each with its old and new value. Most settings pages work this way.
- **Request body**: when no snapshot was taken, the entry stores what the dashboard sent, without an old value.

Any field whose name contains `token`, `secret`, `password`, `apikey`, `api_key`, `authorization` or `clientsecret` is replaced with `[redacted]` before it is stored, so credentials never end up in the log.

On the page, booleans are shown as On and Off, lists as "3 items", empty strings as "empty" and missing values as "none". Field names are turned into readable labels.

> [!NOTE]
> "Viewed" entries are the bulk of the log because every dashboard page reads settings when it opens. Filter by Created, Updated or Deleted when you are looking for a change.

### What is not recorded

- Anything done with commands in Discord. Those actions show in Discord's audit log where the bot acted, and in Logging if you have it configured.
- Requests that were not tied to a logged in dashboard user.
- Opening the Audit Log page itself, Leave Feedback, and a handful of infrastructure and polling endpoints such as bot status, performance, system info and instance management.
- A few endpoints that are explicitly excluded: the persona avatar image served to the embed builder, the setup wizard's "should show" check, and the dashboard page view beacon.

## Reading the page

Open **Audit Log** under Security in the dashboard. The list shows the newest entries first, fifty per page, with **Previous** and **Next** buttons and a count of total entries.

Two filters sit above the list:

| Filter | What it does |
| --- | --- |
| **Action** | Show only Viewed, Created, Updated, Deleted or Accessed entries. |
| **Section** | Show only one dashboard area. The choices are built from the sections present in the entries currently loaded. |

**Refresh** reloads the list. Changing a filter jumps back to page one.

On a desktop each entry is a row with a **Details** button when it has change data. On a phone the entries are shown as cards with a **Show details** button.

> [!EXAMPLE]
> Filter **Action** to Updated and **Section** to Protection to see every time someone changed a protection system, then expand a row to see which fields moved and from what to what.

## Retention

Entries are kept for **ninety days**. A cleanup job runs once a day, starting five minutes after the bot comes online, and deletes anything older. There is no export, so if you need a record beyond that window, save it before it ages out.

## Who can see it

The page is only available to people who can log into the dashboard and are members of your server. The server owner and anyone with the Administrator permission can always open it. Anyone else needs at least **View** access to the **Audit Log** section under Dashboard Access, which is granted per user or per role.

> [!PERMISSION]
> Because the user is taken from the dashboard login token, nobody can make an entry appear under someone else's name.

## Tips and gotchas

- The section filter only lists sections that appear on the page you are looking at. If a section is missing from the dropdown, it may still exist on later pages; clear the action filter and page through, or narrow by action first.
- Timestamps are shown in the timezone of the browser viewing the page, not the server's timezone from the Administration settings.
- A "Created" entry means a POST request was made, which the dashboard also uses for some toggles and updates. Read the endpoint line and the details to see what really happened.
- Entries whose details show values without an old value came from a section that does not snapshot its previous state. You will see what was sent, but not what it replaced.
- The log is per server. Switching servers in the dashboard switches the log with it.
