---
title: Leave Feedback
slug: leave-feedback
summary: When a server removes the bot, its owner gets a DM asking why. The answers are collected on an owner-only dashboard page.
icon: fa-comments
category: Analytics
dashboard: /dashboard/leave-feedback
tags: [leave feedback, kick feedback, why removed, churn, exit survey, owner only, bot owner]
related: [invites]
---

## What it does

Every time the bot is kicked from or leaves a server, it sends the server owner a short DM. The DM has a dropdown of common reasons, a **Write something** button that opens a text box, and a **No thanks** button. Answering is optional and the DM says so.

Each answer is stored with the server's name, its member count, its owner and how long the bot had been in it. If a report channel is set, a summary embed is posted there as well, and it is updated if the owner adds a comment later.

This is a bot-level feature. There is no per-server setting, and the dashboard page only appears for the bot owner.

> [!NOTE]
> Only the bot owner can see the Leave Feedback page. Other dashboard users do not get it in the sidebar and cannot open it.

## Why you would use it

- Learn whether servers leave because of missing features, setup confusion or reliability problems.
- Spot servers that only added the bot to test it, so their departures can be ignored.
- Reach out to owners who wrote a comment and left contact details.
- Track how often owners bother to answer at all.

## The prompt

The DM is titled "Sorry to see me go!" and explains that the bot was just removed from the named server. The dropdown offers these reasons, in this order:

| Reason key | Shown to the owner |
| --- | --- |
| `not_needed` | We didn't need it anymore |
| `confusing` | Too confusing to set up |
| `missing_features` | Missing features we wanted |
| `unreliable` | It was broken or unreliable |
| `other_bot` | We switched to another bot |
| `temporary` | Temporary, I'm adding it back |
| `testing` | Just testing something |

Picking a reason saves it straight away and offers the text box again. The text box is a single paragraph field, "What could we have done better?", limited to 1000 characters. **No thanks** marks the record dismissed and it is never reported.

Rules that keep this from being annoying:

- A server is asked at most once every thirty days, however many times it adds and removes the bot.
- If the owner's DMs are closed, nothing is stored.
- Nothing is sent when the feature is switched off.

## Statuses

Each record ends up in one of three states, which the dashboard filters on.

| Status | Meaning |
| --- | --- |
| Answered | The owner picked a reason or wrote a comment |
| Dismissed | The owner pressed **No thanks** |
| No response | The DM was sent and nothing came back yet |

## Settings

The page has two tabs, **Responses** and **Settings**.

| Setting | Default | What it controls |
| --- | --- | --- |
| Ask owners why the bot was removed | on | Whether the DM is sent at all |
| Report channel ID | empty | Channel that receives a summary embed per answer. Empty falls back to the bot's join/leave log channel. |

Below the channel field the page shows which channel and server the ID resolves to and whether the bot can reach it.

The **Responses** tab has six counters, **Prompts sent**, **Answered**, **With a comment**, **Dismissed**, **No response** and **Response rate**, a **Reasons given** breakdown, and a table with columns **Left**, **Server**, **Reason** and **Status**. You can filter by reason and status (the status filter also has a **Left a comment** option), search by server name or comment text, open a row to read the full comment, and delete a record. **Response rate** counts answered and dismissed prompts together.

## Setup walkthrough

1. Log in to the dashboard with the bot owner's account and open **Leave Feedback**.
2. On the **Settings** tab, check that **Ask owners why the bot was removed** is on. It is on by default.
3. Paste a channel ID into **Report channel ID** and click **Save channel**, or leave it empty to use the join/leave channel.
4. Remove the bot from a test server you own and answer the DM.
5. Check the **Responses** tab and the report channel for the entry.

## Commands

This feature is dashboard only. There are no bot commands; owners answer through the buttons and dropdown in the DM.

## Tips and gotchas

- The bot only DMs the person Discord lists as the server owner, not whoever kicked it.
- The thirty day cooldown is per server, so a server that re-adds the bot and removes it again inside that window is not asked twice.
- The summary embed goes to the configured channel, or to the join/leave log channel from the bot's credentials when none is set. If neither exists, answers are still stored and visible on the page.
- Deleting a record from the dashboard does not delete the embed already posted in the report channel.
