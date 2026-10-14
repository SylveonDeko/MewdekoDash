---
title: Performance
slug: performance
summary: A bot owner only dashboard page showing CPU, memory, uptime, the slowest methods, and how many Discord events each module is processing and failing.
icon: fa-clock
category: Analytics
dashboard: /owner/performance
tags: [performance, metrics, cpu, memory, latency, monitoring, uptime, events, modules, owner]
related: [analytics, leave-feedback, administration]
---

## What it does

Performance is a monitoring page for whoever runs the bot. It is only visible to bot owners: the sidebar hides it for everyone else, and opening the URL directly sends non owners back to the dashboard home. There is nothing here for server staff to configure.

The page reads live numbers from the running bot process. One tab shows system resources, one lists the methods that take the most CPU time, and two break down Discord event handling by event type and by bot module, each with counts, average execution time and error rate. Everything refreshes on its own while the page is open.

The event and module numbers come from the bot's internal event handler, which records every gateway event it dispatches. Method timings come from the performance monitor that wraps tracked methods. Both are in memory only, so they reset when the bot restarts, and event metrics reset on their own every hour. For stored history of the same numbers, use [Analytics](/wiki/analytics).

## Why you would use it

- The bot feels sluggish and you want to see whether CPU, memory or one slow method is the cause.
- A module is throwing errors and you want the error rate per module without reading logs.
- You want to confirm memory is stable after a deploy by watching it over a few minutes.
- You need the uptime and thread count for a support question.

## Tabs

| Tab | Section | What it shows | Refresh |
| --- | --- | --- | --- |
| Overview | System Resources | **CPU Usage**, **Memory Usage** (used and total), **Uptime**, **Thread Count**, and **Top CPU Intensive Methods** with their average time | Every 5 seconds |
| Methods | Method Performance | Every tracked method with **Calls**, **Avg Time**, **Total Time** and **Last Executed**; sortable by any column, with a button that clears the collected data | Every 30 seconds |
| Events | Event Metrics | **Total Events**, **Total Errors**, **Event Types** and **Avg Error Rate**, then each Discord event type with processed count, errors, execution time and error rate | Every 10 seconds |
| Modules | Module Metrics | **Active Modules**, **Total Events**, **Total Errors** and **Avg Error Rate**, then each module with events processed, errors, execution time and error rate | Every 10 seconds |

CPU usage is sampled over half a second each time the Overview refreshes and is the bot process only, not the whole machine. Memory is the process working set. Total memory is read from the host on Windows and Linux and shows as 0 elsewhere.

> [!NOTE]
> The Methods tab is empty until tracked methods have run. Use the bot for a while, then come back.

## Settings

There are no settings. The only action is the clear button on the Methods tab, which wipes the method timings. Event and module metrics cannot be cleared by hand; they reset hourly.

## Setup walkthrough

1. Sign in to the dashboard with a bot owner account.
2. Open **Performance** from the sidebar. It only appears for owners.
3. Leave **Overview** open for a minute to watch CPU and memory settle.
4. Switch to **Modules** and sort by errors to find anything misbehaving, then **Events** to see which event types are the busiest.
5. Use **Methods** to spot slow methods, and clear it after a fix to measure again.

## Commands

The Performance page is dashboard only; there is no matching bot module. A few owner commands cover related ground in chat. Run these with your server's prefix (`.` unless you changed it).

| Command | Aliases | Needs | Purpose |
| --- | --- | --- | --- |
| `stats` | | Nobody | Bot version, commands run per five seconds, memory, cache counts, shard and uptime |
| `commandstats` | `cstats` | Bot owner | Most used command, module, server and user |
| `shardstats` | | Bot owner | Status of every shard |

## Tips and gotchas

- The page checks ownership through the bot, so an account that is an owner on one bot instance but not another will be redirected on the second.
- Numbers are per process. On a sharded bot spread across several processes, you see the process the dashboard is connected to.
- Nothing on this page is stored. If you need history, note the figures down or take screenshots.
- A high error rate on one event type usually points at a module listening to that event; check the Modules tab next.
