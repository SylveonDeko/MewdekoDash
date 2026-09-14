---
title: Help and Commands
slug: help
summary: How to find and understand the bot's commands from inside Discord: the category help menu, module overviews, per-command help pages, command search, and the dashboard setup wizard the bot links to when it joins.
icon: fa-life-ring
category: General
module: Help
tags: [help, commands, modules, search command, slash commands, prefix, setup wizard, invite, guide, source, donate, vote]
related: [permissions, administration, userprofile]
---

## What it does

The Help module is how members discover what the bot can do. `help` (or `cmds`) opens a menu that lists the command categories with a module and command count for each, plus a dropdown to open one. Picking a category shows its modules; picking a module shows its commands ten per page with short descriptions, or, for very large modules, an overview split into sections first.

`help <command>` shows a single command: its name and first alias, what it does, the Discord permissions it needs from you and from the bot, a cooldown if it has one, the matching slash command, each parameter, alternative forms, usage examples, and a link to the documentation. A **Run** button lets you run the command straight from the help page, opening a form for its arguments if it has any.

`searchcommand <term>` finds commands whose name or description contains the term. Mentioning the bot with no text replies with the current prefix and a pointer to `cmds`.

Every command has both a text version, used with the server prefix, and in most cases a slash version. The help menu and command pages are the same either way; `/help`, `/search` and `/invite` are the slash entry points.

## Why you would use it

- A new member types `.help` and needs somewhere sensible to land.
- Staff want to know exactly which permission a command needs before granting it.
- Someone remembers half a command name and wants to search for it.
- You just invited the bot and want a guided setup instead of reading every module's docs.

## The help menu

`help`, `commands` or `modules` with no arguments opens the top level. The embed's description explains the two ways in: pick a category from the dropdown, or use `h commandname` for one command. It also carries links to the documentation, support server, invite and donation pages.

| Category | Contains |
| --- | --- |
| Moderation & Admin | Administration, Moderation, Permissions, Server Management, Role States, Status Roles, Counting Moderation |
| Server Setup | MultiGreets, Role Greets, Starboard, Stat Channels, Suggestions, Tickets, Confessions, Channel Access, Custom Voice, Chat Triggers, Polls, Giveaways |
| Fun & Games | Games, Counting, NSFW, Searches, Minecraft, Switch |
| Economy & Levels | Currency, XP, Reputation, Vote, Patreon |
| Music | Music |
| Utility | Utility, Help, AFK, Todo, User Profile, Birthday, Highlights, Copr Monitoring |
| Bot Owner | Owner-only modules |
| Other | Anything not filed above |

A **Toggle descriptions** button switches between the compact list and a longer layout that lists every module under its category with a tick or cross showing whether it is enabled for you in the current channel. A globe and cross means the bot owners have disabled the module everywhere.

### Module pages

`commands <module>` jumps straight to a module. The name can be exact or a unique prefix, so `cmds mod` opens Moderation while `cmds s` complains that several modules match. Add a word after the module to filter: `cmds utility remind` lists only commands in Utility whose name or description mentions "remind".

Modules with more than 30 commands and at least three sections show an overview first: the module description, one field per section with its command count, a dropdown to open a section, an **All commands** button, a **Search** button that opens a form, and **Back**. Smaller modules go straight to the paged list. Pages hold ten commands grouped by section, with first, previous, jump, next, last, back and close buttons. The paginator stays active for an hour.

## Command pages

`help <command>` matches the exact name or any alias. The embed contains:

- The command with its prefix and first alias, and its description.
- **User Permissions**: what you need. When a Discord permission override from the Administration module replaces the built-in requirement, the original is shown struck through and the override is listed after it.
- **Bot Permissions**: what the bot needs.
- **Documentation**: a link to the command's page on the docs site.
- **Cooldown**: shown only when the command has one.
- **Slash Command**: a clickable mention of the slash version when one exists.
- **Parameters**, **Overloads** and **Usage** from the command documentation, listing each argument, whether it is optional and any default.
- A footer with the module, submodule and method name, useful when reporting bugs.

The **Run** button runs the command as if you had typed it. If it takes arguments a form asks for them first. Administrators also see a **Permissions** button that opens the Command Permissions quick menu for that command, described in the Command Permissions article.

## Slash versus text commands

Text commands use the server prefix, `.` by default, and the exact names in the help menu. Slash commands are grouped, so a text command like `setprivacy` appears as `/setprivacy` while permission commands live under `/permissions servercommand`. The command page shows the slash mention so you can click it. Both forms go through the same permission rules.

## When the bot joins

When the bot is added to a server it finds who invited it from the audit log (it needs View Audit Log for this) and DMs them. The message has a **Set Up Mewdeko** button linking to the dashboard wizard for that server, a three-step reminder of `cmds`, `cmds mod` and `h purge`, and the support server link. If the inviter cannot be identified or has DMs closed, nothing is sent; there is no channel announcement.

## The setup wizard

The wizard lives at `/wizard?guild=<id>` on the dashboard. The link in the welcome DM opens the quick setup flavour; the dashboard itself can offer the first-time flavour, which adds a permissions check at the start.

| Step | What it does |
| --- | --- |
| Welcome | Explains what is about to happen |
| Permissions | First-time only: checks the bot has what it needs |
| Server Basics | Prefix, bot language, and server timezone |
| Select Features | Choose what to configure; features are marked as full setup or quick enable |
| One step per full-setup feature | Guided configuration for that feature |
| Quick Setup | Bulk-enable the remaining features with their defaults |
| Complete | Summary, including anything that failed to save |

Progress is stored per server, so leaving and coming back resumes. A server can be marked skipped so the wizard stops offering itself, and the **My Settings** page has a toggle for whether you prefer guided setup and a reset for a server's wizard state.

## Settings

There is nothing to configure for help itself. The prefix is set with the Administration module and shown in every help embed.

| Setting | Default | What it controls |
| --- | --- | --- |
| Prefix | `.` | The prefix shown in help text and used for the Run button |
| Verbose permissions | off | Whether a blocked command explains which permission rule blocked it (see Command Permissions) |

## Setup walkthrough

1. Run `help` and open a category from the dropdown to see how modules are grouped.
2. Run `cmds mod` to see the Moderation module, then `h purge` to see one command in full.
3. Try the **Run** button on a harmless command such as `h ping`.
4. Run `searchcommand role` to see how search narrows things down.
5. If you have just invited the bot, follow the **Set Up Mewdeko** link from the welcome DM, or open `/wizard?guild=<your server id>` on the dashboard.

## Commands

Run these with your server's prefix (`.` unless you changed it).

| Command | Aliases | Needs | Purpose |
| --- | --- | --- | --- |
| `help [command]` | `h` | Nobody | Help menu, or help for one command |
| `commands [module] [term]` | `cmds` | Nobody | Module list, one module's commands, or a filtered list |
| `modules` | `mdls` | Nobody | The same top-level menu as `help` |
| `searchcommand <term>` | | Nobody | Search command names and descriptions, up to 20 results |
| `guide` | `readme` | Nobody | Link to the getting started guide |
| `source` | `github`, `repo`, `gitlab`, `bitbucket` | Nobody | Link to the source code |
| `donate` | | Nobody | How to support the bot |
| `vote` | | Nobody | Link to vote for the bot |
| `exportcommandsjson` | `exportcommands`, `excj` | Nobody | Export every command as a JSON file (once a minute) |

Slash only: `/search <command>` with autocomplete, and `/invite`. `/help`, `/commands <module> [filter]`, `/donate`, `/guide`, `/source` and `/vote` mirror the text commands.

## Tips and gotchas

- If `help` shows a cross next to a module for you, a permission rule or the bot owners have disabled it in that channel. Ask staff to check `listperms`.
- Help pages reflect the real preconditions on the command, so a permission listed there is authoritative even if the docs site lags behind.
- The Run button uses your own permissions, not the bot's. It is a convenience, not a bypass.
- Module matching by prefix means short prefixes are often ambiguous; use at least three or four letters.
- The bot only DMs the inviter on join. If you invited it from a shared link and got nothing, open the wizard from the dashboard instead.
