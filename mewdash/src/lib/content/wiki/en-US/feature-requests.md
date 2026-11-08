---
title: Feature Requests
slug: feature-requests
summary: Suggest features and report bugs from the dashboard, and upvote other people's ideas
icon: fa-lightbulb
category: Community
dashboard: /dashboard/feature-requests
tags: [feature request, suggest, suggestion, idea, bug report, feedback, roadmap, upvote]
related: [leave-feedback]
---

## What it does

The Feature Requests page is where anyone logged in to the dashboard can tell the developers what they want. A request is a title and details filed under a category. Once sent it appears in a shared list where other people can upvote it. The developers can set a status on it, such as planned or declined, and leave a note.

Every new request is also posted in a channel the bot owner picks, so nothing sits unread.

The page has four tabs: **Browse**, **Suggest**, **Mine**, and, for bot owners only, **Settings**. The open tab is kept in the URL as `?tab=`.

## Suggest

1. Open **Feature Requests** and switch to **Suggest**.
2. Under **What kind of request is this?** pick **Feature idea**, **Bug report**, or **Something else**.
3. Write a **Title** (3 to 120 characters) and the **Details** (10 to 2000 characters). A counter shows how many characters are left.
4. If you are managing a community at the time, the toggle **Mention that I was managing {name}** attaches its name. Turn it off to leave it out.
5. Press **Send to the developers**.

You can send three requests an hour. Your Discord name is attached so the developers can follow up. After sending, **Mine** takes you to the request.

## Browse

The **Browse** card lists requests 25 to a page. Search by title or details, or by who submitted it. Two dropdowns filter by status and category, and the **Top** and **New** buttons sort by votes or by date. The status filter starts on **Open**. Choose **Any status** to see everything.

Press the thumbs up on a request to upvote it. Press it again to take the vote back.

## Mine

**Mine** lists everything you submitted with its current status. When a developer changes the status or leaves a note, it shows here as **Note from the developers:**. Your own requests also carry a **Yours** badge in Browse.

## For bot owners

Owners get extra controls:

- Counts at the top of **Browse** for Total, Open, Planned, Done, Declined, and Bugs.
- **Change status** on each request. Pick a status and add an optional **Note for the submitter**.
- **Delete** on each request. A confirmation warns that the request and its votes will be removed and this cannot be undone.
- The **Settings** tab, with the **Report channel** card.

### Report channel

Enter the **Channel ID new requests get posted to**. Leave it empty to use the join/leave channel. A line under the field tells you where requests will go, and warns if no channel is set (requests are stored but not posted) or if the bot cannot see the channel. The value saves automatically.

> [!NOTE]
> Statuses and notes are visible to everyone.
