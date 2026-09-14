---
title: Analytics
slug: analytics
summary: A bot owner only dashboard page with stored history of commands, gateway events, latency, errors, server growth, feature adoption, AI and music use, website traffic, and webhook alert rules.
icon: fa-chart-simple
category: Analytics
dashboard: /dashboard/analytics
tags: [analytics, metrics, telemetry, commands, events, latency, errors, growth, alerts, shards, owner]
related: [performance, leave-feedback, administration]
---

## What it does

Analytics is the history page for whoever runs the bot. It is only visible to bot owners: the sidebar hides it for everyone else, and opening the URL directly sends non owners back to the dashboard home. There is nothing here for server staff to configure.

Where [Performance](/wiki/performance) shows the live process and forgets on restart, Analytics reads what the bot has written to its own database. Every running instance records commands, gateway events, shard latency, REST calls, database timings, process gauges, exceptions, feature use, AI and music activity, and dashboard page views. Numbers are aggregated in memory per minute, flushed every minute, folded into 5 minute and hourly buckets, and pruned on a fixed schedule, so you can look at last week, compare it with the week before, and filter by instance, shard or guild.

A weekly digest can be posted to a Discord webhook, and alert rules on any stored metric notify a webhook when a threshold is crossed.

## Why you would use it

- You want to know whether an error spike started before or after a deploy, not just what is failing right now.
- A guild reports the bot being slow and you want its command latency, activity and security events for a date range.
- You want to see which features servers actually configure and use, and how that changed over months.
- You need a Discord ping when shard latency, error rate or REST 429s go past a limit, without watching a page.
- You want a Monday summary of growth, commands, errors and top features in a channel.

## Tabs

| Tab | What it shows |
| --- | --- |
| Overview | Tiles for **Servers**, **Users**, **Commands / min**, **Gateway events**, **REST req / s**, **Unhandled errors** (drills into exception groups), **Worst shard latency** and **Music players**; shard latency with alert bands; currently firing alerts; commands and gateway events per second by kind and type; daily server snapshots; REST rate; process memory |
| Commands | Kind, module and outcome selects; **Invocations**, **Errors**, **Duration p95** and **p50**; invocations by module; errors by class; p50, p95, p99 duration; invocations by kind; a UTC hour by server size heatmap; **Top commands**, a paged **Invocation log**, **Top failing commands** where a row opens its recent error samples |
| Events | Gateway events per second by type; count in range and a per type table; events per shard; handler p95 by type; handler errors by module and by event type |
| Latency | **REST p95**, **REST 5xx**, **REST 429**, **Ratelimit hits**, **DB p95**, **DB errors**, **Shard reconnects**, **Unhandled errors**; REST latency and rate by route; rate limit hits by route; database p95 and errors by operation; CPU, RSS, threads and gen 2 GCs; a per shard table with state, latency, peak, guilds and reconnects; unhandled exception groups where a row opens its occurrences; errors by type |
| Servers | **Servers**, **Users**, **Joined**, **Left**, **Net**; 30 day server and user snapshots; joins and leaves per day; churn with bounce rate and joins and leaves by size; retention by join day; joins by size; **Bounced guilds** and **Went silent** tables where a row opens the guild card |
| Guilds | Event type select and a minimum events per hour; a guild id opens the **Guild card**, an activity by type and hour heatmap, and a paged, filterable **Security events** log; **Top guilds by events**; **Unusual activity** scored against the same hour over the previous 14 days |
| Features | **Feature adoption** with configured and enabled counts from the nightly census, active guilds, activity and error rate; features used per guild; server size against features used; for the selected feature, **Settings usage** from the latest census and a configured or enabled census series over 90, 180 or 365 days |
| AI | **Requests**, **Tokens in**, **Tokens out**, **Est. cost** at list prices for priced models; a per model table with failures, tokens, p95 and cost; requests, tokens and p95 by model; top guilds by AI chat use |
| Music | **Players**, **Tracks started**, **Errors**; players by node; tracks started by source; errors by kind; node state; tracks ended by reason |
| Website | **Page views**, **Visitors**, **Request p95**, **5xx**; views by route; request duration; a per route table with visitors, p95 and 5xx; 4xx and 5xx by route; a login to OAuth callback to dashboard funnel with drop off |
| Alerts | Firing groups; the rules table with enable, test, mute for 1 hour and delete; a paged event log of state transitions with the value against the threshold and whether a webhook was sent; **New rule** and **Send digest now** |
| Pipeline | A status pill; **Last flush**, **Last rollup**, **Last maintenance**, **Pending series**, **Pending rows**; the last flush error if any; row counts and newest row per table; registered instances with heartbeat and last guild count; flush duration and rows per flush |

Pipeline status is `healthy` when the last flush is at most 60 seconds old, the last rollup at most 10 minutes old and there is no flush error; `flush stale` and `rollup stale` otherwise, `error` when a flush failed, and `disabled` when analytics is switched off in the bot config. An instance whose last guild count is older than 3 minutes is marked in yellow and older than 10 minutes in red.

> [!NOTE]
> Everything is UTC. Snapshots, census rows and daily totals are written once a night, so the Servers and Features tabs are empty until the bot has been running past 00:05 UTC at least once.

### Filter bar

The bar above the tabs applies to every tab and is kept in the URL, so switching tabs, reloading or sharing the link keeps the same view.

| Control | What it does |
| --- | --- |
| Range | `15m`, `1h`, `6h`, `24h`, `7d`, `30d`, or a custom UTC start and end of up to 31 days |
| compare | Overlays the same width one period earlier on charts and tiles that support it |
| Bot | One instance, taken from the instances the pipeline knows about, or all |
| Shard | One shard id or all |
| guild id | Limits the raw tables and guild views to one guild; press Enter to apply |
| Refresh | Everything reloads every 30 seconds while the tab is visible; the button forces it |
| Copy link | Copies the current URL with all filters |

Tiles open a drilldown with breakdowns of their metric. Charts can fold the smaller series into **Other**, toggle a running total, be zoomed with the range sliders, and solo one series with a right click on its legend entry.

## Settings

The page itself has no settings. Alert rules and three bot config keys are all there is to configure.

### Alert rules

Each rule watches one metric. The editor fields are:

| Field | Meaning |
| --- | --- |
| Name, Description, Severity, enabled | Label and `info`, `warning` or `critical`, which sets the webhook colour and title |
| Metric, Filters, Group by | Any stored metric, optional label filters, and an optional label to evaluate each value separately, for example per `shard` |
| Agg, Window | `sum`, `avg`, `min`, `max`, `last`, `rate`, `count`, `p50`, `p95` or `p99` over 1 minute to 1 day |
| Comparator, Threshold, High | `gt`, `gte`, `lt`, `lte`, `outside` (below Threshold or above High), `pct_change` (percent against the same window one baseline earlier), `deviates` (z score against the mean of the last N days), `nodata` (nothing reported in the window) |
| Baseline, Direction | For `pct_change` and `deviates`: yesterday or last week, and `up`, `down` or `both` |
| For | How long the breach must hold before the rule fires; `immediately` skips the pending state |
| Cooldown | Minimum gap between firing notifications |
| Repeat | Re-notify while still firing, or once |
| Min samples | Skip evaluation when the window holds fewer samples than this |
| Webhook URL, Mention role id, Thread id | A Discord webhook, an optional role pinged on firing, an optional thread to post into |
| Quiet from, Quiet to | A UTC window, which may wrap midnight, in which nothing is sent |
| notify on resolve | Also post when the group returns to normal |

The preview chart on the right draws the draft threshold as a dashed band for the absolute comparators.

Rules are evaluated every minute. Each group moves `ok` to `pending` (only when For is set) to `firing`, and back to `ok`; the event log records the `firing` to `ok` transition as `resolved`. Mute from the table silences a rule for 1 hour; the API allows up to 30 days. Muted rules and quiet windows still change state, they just do not post. **Send test** posts a test message to the rule's webhook.

### Bot config keys

Set these in `bot.yml` or with the owner `config` command. All default to on, 30 and empty.

| Key | Meaning |
| --- | --- |
| `analyticsEnabled` | `false` makes the collector a no-op; the Pipeline tab shows `disabled` |
| `analyticsRetentionDays` | Days raw command rows, page views and the guild event log are kept |
| `analyticsDigestWebhook` | Discord webhook the weekly digest is posted to; empty disables the digest |

### What is kept and for how long

| Data | Kept |
| --- | --- |
| 1 minute buckets | 48 hours |
| 5 minute buckets | 14 days |
| 1 hour buckets | 400 days |
| Command invocations, page views, guild security events | `analyticsRetentionDays` |
| Error samples, per guild hourly feature and event activity | 90 days |
| Alert events | 180 days |
| Daily snapshots, census, daily totals | Not pruned |

Raw rows are flushed every 15 seconds, minute buckets every minute; 1 minute buckets fold into 5 minute ones every 5 minutes and 5 minute ones into hourly, and pruning runs every 6 hours.

### What is never stored

- Message content. Command rows hold the command name, module, kind, outcome, timings and, on failure, the exception class and up to 200 characters of its message.
- User ids. Nothing in analytics is keyed by who ran a command.
- Client IPs. Page views keep a visitor hash of IP and user agent with a salt that rotates daily, so a visitor cannot be followed across days. Requests to `/api/`, `/cdn/`, static assets and the Analytics page itself are not recorded.

Servers and users that opted out of stats are respected: their command still counts in the aggregate, but the raw row is written without the guild id and guild size.

## Setup walkthrough

1. Sign in to the dashboard with a bot owner account and open **Analytics** from the sidebar. It only appears for owners.
2. Open **Pipeline** first. The pill should read `healthy` and every instance should have a recent heartbeat; a stale flush means the bot is not writing.
3. Pick a range and, if you run more than one instance, a bot in the filter bar. Tick **compare** to see the previous period.
4. Go to **Alerts**, press **New rule**, pick a metric such as `shard.latency` with `max` over 5 minutes, `gt` your limit, group by `shard`, paste a webhook and press **Send test** on the saved row.
5. Set `analyticsDigestWebhook` in the bot config, then press **Send digest now** to see what Monday's post will look like.
6. Come back after a night for **Servers**, **Features** and the census series.

## Commands

The Analytics page is dashboard only; there is no matching bot module. The owner `config` command changes the three keys above, and a few owner commands cover related ground in chat. Run these with your server's prefix (`.` unless you changed it).

| Command | Aliases | Needs | Purpose |
| --- | --- | --- | --- |
| `config bot analyticsEnabled false` | `conf` | Bot owner | Stop recording analytics; `true` starts again |
| `config bot analyticsRetentionDays 14` | `conf` | Bot owner | Change how long raw rows are kept |
| `config bot analyticsDigestWebhook <url>` | `conf` | Bot owner | Where the Monday digest goes |
| `stats` | | Nobody | Bot version, commands run per five seconds, memory, cache counts, shard and uptime |
| `commandstats` | `cstats` | Bot owner | Most used command, module, server and user |
| `shardstats` | | Bot owner | Status of every shard |

## Tips and gotchas

- The page checks ownership through the bot, so an account that is an owner on one bot instance but not another will be redirected on the second.
- The digest goes out on Mondays at or after 09:00 UTC and covers the previous seven days against the seven before: guilds, commands, errors, events, new and lost guilds, page views, AI tokens, music tracks, plus the top five commands, errors and features.
- Series over a long range come from hourly buckets, so percentiles smooth out; narrow the range to see minute detail, which only exists for the last 48 hours.
- If the collector's in-memory buffer fills before a flush, extra raw command rows are dropped for that interval while the aggregates keep counting; a growing **Pending rows** figure on Pipeline is the sign.
- Alert rules need a Discord webhook URL; anything else is rejected on save.
- Estimated AI cost only covers models with a known list price, so the total is a floor.
