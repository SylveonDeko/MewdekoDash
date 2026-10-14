---
title: Process Logs
slug: process-logs
summary: A bot owner only dashboard page that lists the processes pm2 runs on the bot's host and lets you read, follow, filter and download their console logs.
icon: fa-rectangle-code
category: Analytics
dashboard: /owner/process-logs
tags: [pm2, logs, console, stdout, stderr, tail, process, crash, stack trace, owner]
related: [performance, analytics, leave-feedback]
---

## What it does

Process Logs shows what the bot writes to its console, straight from the log files pm2 keeps for it, without opening a shell on the server. It is only visible to bot owners: the sidebar hides it for everyone else, opening the URL directly sends non owners back to the dashboard home, and the bot itself refuses the requests unless the signed in account is an owner.

The page asks the bot instance you have selected for its pm2 process table. Every process pm2 manages on that host is listed, not just the bot, with its status, pid, uptime, restart count, CPU and memory, and the size of its two log files. Pick one and the page loads the last few hundred lines of its stdout log, then keeps appending new lines every couple of seconds while **Following** is on.

Lines keep the colours Serilog prints with, and each line is tagged with its level so you can hide the noise. Continuation lines such as stack traces stay attached to the line above them, so hiding info does not leave orphaned traces behind.

## Why you would use it

- The bot restarted or crashed and you want the last thing it said before it went down, which is on the stderr side.
- A member reports a command failing and you want to watch the log live while they try again.
- You want to search a few thousand recent lines for a guild id or a message without SSHing in.
- You need the full log file for a bug report and want it as a download.

## Controls

| Control | What it does |
| --- | --- |
| Process cards | One per pm2 process on the host. The card marked **this bot** is the instance answering the request. Click one to read its logs. |
| **stdout** / **stderr** | Switches between the process's out log, where normal logging goes, and its error log, where crashes and runtime diagnostics land. |
| **100** to **2k** | How many lines to load when the log is opened or reloaded. The follow mode keeps up to 5,000 in the page before it starts dropping the oldest. |
| Filter box | Hides every line whose text does not contain what you typed. Case does not matter. |
| **Following** / **Follow** | Turns live updates on and off. While on, the page polls for new lines every two seconds and scrolls with them unless you have scrolled up. |
| **Wrap** | Wraps long lines instead of scrolling sideways. |
| **Copy** | Copies the visible lines, colours stripped, to the clipboard. |
| **Reload** | Reads the tail again from the file. |
| **Download** | Saves the whole log file as it is on disk, colour codes included. The size next to it is the file's current size. |
| Level chips | **VRB**, **DBG**, **INF**, **WRN**, **ERR** and **FTL**, each with a count of tagged lines loaded. Click one to hide or show that level. |

When you scroll up during a follow, new lines are held back and a button at the bottom right tells you how many are waiting. Click it to jump back down and resume scrolling with the log.

> [!NOTE]
> A single read is capped at 1 MB. If the lines you asked for do not fit, the page tells you older lines were skipped; download the file to see everything.

## How the bot finds the logs

The bot runs `pm2 jlist` on its own host and reads the log file paths pm2 reports for each process. It only does that when a pm2 daemon is already running for the same user, so it never starts one by accident. If pm2 is installed but cannot be queried, the page falls back to the files in pm2's log directory and says so. If there is no pm2 at all, the page explains that instead of showing an empty list.

On a dashboard connected to several bot instances, the process list belongs to whichever instance is selected, since each instance can only see its own host.

## Setup walkthrough

1. Run the bot under pm2 on its server, for example `pm2 start dotnet --name mewdeko -- Mewdeko.dll`.
2. Sign in to the dashboard with a bot owner account and open **Process Logs** from the sidebar.
3. Pick the process marked **this bot**, or any other process on the host.
4. Leave **Following** on to watch the log live, or switch it off and use the filter and level chips to dig through what is loaded.
5. Switch to **stderr** after a crash to read what the runtime printed on the way down.

## Tips and gotchas

- Logs are read from files, so a process that was started outside pm2 has none here. The bot's own console output only appears if the bot itself runs under pm2.
- pm2 rotates or truncates files when you run `pm2 flush` or use `pm2-logrotate`. The page notices the file shrinking and reloads the tail on its own.
- The filter and level chips only apply to lines already loaded. Load more lines, or download the file, when searching further back.
- Nothing on this page changes the bot. There is no way to restart processes or clear logs from here; the owner `restartinstance` command and `pm2 flush` on the server cover that.
