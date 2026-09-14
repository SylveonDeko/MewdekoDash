---
title: Command Permissions
slug: permissions
summary: Decide who can run which commands and where, with an ordered list of allow and deny rules for commands and modules scoped to the whole server, a role, a channel, a category or a single member.
icon: fa-cog
category: Security
dashboard: /dashboard/administration
module: Permissions
tags: [permissions, command permissions, allow, deny, permission role, verbose, disable command, disable module, cooldown, dpo, permission override, blacklist]
related: [administration, help, filter, moderation]
---

## What it does

By default every command is available to everyone the Discord permissions allow. Command Permissions adds a server-specific rule list on top. Each rule says whether a command, a module, or all modules is allowed or denied for the whole server, a role, a channel, a category, or one member. When someone runs a command, the bot walks the list, applies the first rule that matches, and either lets the command through or stops it.

Blocked commands fail quietly unless **verbose** mode is on, in which case the bot replies with the number and text of the rule that blocked it. Slash commands always get an ephemeral explanation.

Rules can be managed by administrators, or by anyone holding the **permission role** you choose. The same list is on the dashboard under **Administration**, in the **Automation & Settings** section, as the **Command Permissions** card.

Two related tools live alongside it. Command cooldowns limit how often a command can be used per member in a server. Discord permission overrides, in the Administration module, replace the Discord permission a command normally demands, for example letting Manage Messages holders use a command that normally needs Administrator.

## Why you would use it

- Keep fun and NSFW commands out of serious channels.
- Turn the Music module off everywhere except a bot commands channel.
- Let a helper role use `warn` without giving them Manage Messages or Administrator.
- Stop one disruptive member from using the bot at all.
- Rate limit a noisy command like `roll` to once every ten seconds per member.

## How a rule is written

Every rule has three parts.

| Part | Options |
| --- | --- |
| What | One command, one module, or all modules |
| For | The whole server, a role, a channel, a category, or a specific user |
| Action | Allow or deny |

The command names in the table below encode the first two parts. The first letters pick the target (`s` server, `r` role, `c` channel, `ca` category, `u` user), the last pick the scope (`cmd` command, `mdl` module), and the `all...mdls` forms cover every module.

| Command | Rule created |
| --- | --- |
| `srvrcmd <command> <enable|disable>` | A command for the whole server |
| `srvrmdl <module> <enable|disable>` | A module for the whole server |
| `allsrvrmdls <enable|disable>` | Every module for the whole server |
| `rolecmd <command> <enable|disable> <role>` | A command for a role |
| `rolemdl <module> <enable|disable> <role>` | A module for a role |
| `allrolemdls <enable|disable> <role>` | Every module for a role |
| `chnlcmd <command> <enable|disable> <#channel>` | A command in a channel |
| `chnlmdl <module> <enable|disable> <#channel>` | A module in a channel |
| `allchnlmdls <enable|disable> <#channel>` | Every module in a channel |
| `catcmd <command> <enable|disable> <category>` | A command in every channel of a category |
| `catmdl <module> <enable|disable> <category>` | A module in a category |
| `allcatmdls <enable|disable> <category>` | Every module in a category |
| `usrcmd <command> <enable|disable> @user` | A command for one member |
| `usrmdl <module> <enable|disable> @user` | A module for one member |
| `allusrmdls <enable|disable> @user` | Every module for one member |

Chat triggers count as commands: give the trigger's number or text where a command name is expected.

> [!EXAMPLE]
> `srvrmdl nsfw disable` then `chnlmdl nsfw enable #adult` blocks the NSFW module everywhere except one channel.

## Rule order

`listperms` shows the list numbered from 1. Rule 1 is always "allow all modules for the whole server" and cannot be edited or removed; it is the fallback when nothing else matches.

New rules are appended to the end of the list. When a command runs, the bot checks the rules starting from the highest number and works towards rule 1, and the first rule whose target and scope both match decides. That means the most recently added matching rule wins, which is why the example above works: the channel allow was added after the server deny.

`moveperm <from> <to>` changes a rule's position and renumbers everything, so you can push an exception above or below a broader rule without recreating it. `removeperm <number>` deletes one rule. `resetperms` wipes the list back to rule 1 and needs Administrator.

The dashboard lists the same rules with move up and move down arrows and a delete button per rule.

## Verbose mode

`verbose` toggles whether a blocked text command gets an error message naming the blocking rule, such as "permission 4 (`.chnlmdl nsfw disable #general`) prevents this". It is off by default. With it off, blocked commands are ignored silently, which is right for most servers and avoids members poking at what they cannot run. Slash commands always reply with the reason, ephemerally, whatever this setting is.

## Who can change rules

Every command in this module goes through an extra gate. Administrators can always use them. Anyone else needs the **permission role** set with `permrole <role>`. Without one, non-administrators are told they need Admin permissions (only if verbose is on) and the command stops. `permrole` with no argument shows the current role; `permrole reset` clears it. The `@everyone` role cannot be used.

`resetperms` and `permrole` themselves always need Administrator on top of that.

## Cooldowns

`cmdcooldown <command> [time]` sets a per-member cooldown for a command in this server, from 1 second up to 90000 seconds (25 hours). Give no time, or `0s`, to clear it. `allcmdcooldowns` lists the current cooldowns. These are in addition to any built-in cooldown a command already has.

## Discord permission overrides

The Administration module can replace the Discord permission a command requires. `dpo <command> <permissions...>` makes the command require the listed permissions instead of its built-in one, for example `dpo purge ManageMessages`. Run `dpo <command>` with no permissions to remove the override, `dpol` to list them, and `dpor` to clear all after a confirmation. All three need Administrator.

An override replaces the built-in Discord requirement only. The command permission rules above still apply, and the command page from `help <command>` shows the original requirement struck through with the override next to it.

## The quick menu in help

`help <command>` shows administrators a permissions button. It opens a quick menu for that one command that shows the rules affecting it, warns about redundant rules (two rules with the same target and scope), offers to resolve them, and lets you add allow and deny rules for the command or reset its permissions without leaving the help page.

## Bot-owner controls

Three groups of commands are restricted to the bot owners and affect every server: global permissions (`globalmodule`, `globalcommand`, `globalpermlist`, `resetglobalperms`) disable a module or command everywhere, and the blacklist (`userblacklist`, `channelblacklist`, `serverblacklist`, `manualblacklistcheck`) stops the bot responding to a user, channel or server at all. A globally disabled module shows a globe and cross in the help menu.

## Settings

On the dashboard, open **Administration**, then the **Automation & Settings** section, then the **Command Permissions** card.

| Setting | Default | What it controls |
| --- | --- | --- |
| Verbose permissions | off | Tell users when a rule blocks a command |
| Permission role | none | Members with this role can edit rules via commands |
| Rules | rule 1 only | The ordered list; add with **Action**, **What** and **For**, then a module, command, role, channel, category or user ID |

The card also shows counts of custom rules and whether verbose mode is on. The **Permission Overrides** card in the same section manages Discord permission overrides: pick a bot command and the **Required Discord Permission** it should need instead of its built-in one.

## Setup walkthrough

1. Decide the shape: usually "everything allowed, a few things denied" or "everything denied, then allowed in bot channels".
2. For the second shape run `allsrvrmdls disable`, then `allchnlmdls enable #bot-commands`.
3. Keep moderation working for staff: `rolemdl moderation enable @Mods` and `rolemdl administration enable @Mods`.
4. Run `listperms` and read it from the bottom up, since that is the order the bot uses. Use `moveperm` if an exception sits below the rule it should override.
5. Give trusted staff `permrole @Mods` so they can adjust rules without Administrator.
6. Turn on `verbose` while testing so you can see which rule fires, then turn it off again.

## Commands

Run these with your server's prefix (`.` unless you changed it). Slash versions are under `/permissions`, for example `/permissions servercommand`.

| Command | Aliases | Needs | Purpose |
| --- | --- | --- | --- |
| `listperms` | `lp` | Administrator or permission role | Show the numbered rule list |
| `verbose [true|false]` | `v` | Administrator or permission role | Toggle blocked-command messages |
| `permrole [role|reset]` | `pr` | Administrator | Show, set or reset the permission role |
| `removeperm <number>` | `rp` | Administrator or permission role | Delete a rule |
| `moveperm <from> <to>` | `mp` | Administrator or permission role | Reorder rules |
| `resetperms` | | Administrator | Delete every rule |
| `srvrcmd <command> <enable|disable>` | `sc` | Administrator or permission role | Command rule, whole server |
| `srvrmdl <module> <enable|disable>` | `sm` | Administrator or permission role | Module rule, whole server |
| `allsrvrmdls <enable|disable>` | `asm` | Administrator or permission role | All modules, whole server |
| `rolecmd <command> <enable|disable> <role>` | `rc` | Administrator or permission role | Command rule for a role |
| `rolemdl <module> <enable|disable> <role>` | `rm` | Administrator or permission role | Module rule for a role |
| `allrolemdls <enable|disable> <role>` | `arm` | Administrator or permission role | All modules for a role |
| `chnlcmd <command> <enable|disable> <#channel>` | `cc` | Administrator or permission role | Command rule in a channel |
| `chnlmdl <module> <enable|disable> <#channel>` | `cm` | Administrator or permission role | Module rule in a channel |
| `allchnlmdls <enable|disable> <#channel>` | `acm` | Administrator or permission role | All modules in a channel |
| `catcmd <command> <enable|disable> <category>` | `cac` | Administrator or permission role | Command rule in a category |
| `catmdl <module> <enable|disable> <category>` | `cam` | Administrator or permission role | Module rule in a category |
| `allcatmdls <enable|disable> <category>` | `acamds` | Administrator or permission role | All modules in a category |
| `usrcmd <command> <enable|disable> @user` | `uc` | Administrator or permission role | Command rule for a member |
| `usrmdl <module> <enable|disable> @user` | `um` | Administrator or permission role | Module rule for a member |
| `allusrmdls <enable|disable> @user` | `aum` | Administrator or permission role | All modules for a member |
| `cmdcooldown <command> [time]` | `cmdcd` | Administrator or permission role | Set or clear a cooldown |
| `allcmdcooldowns` | `acmdcds` | Administrator or permission role | List cooldowns |
| `discordpermoverride <command> [permissions...]` | `dpo` | Administrator | Set or remove a Discord permission override |
| `discordpermoverridelist` | `dpol`, `dpoli` | Administrator | List overrides |
| `discordpermoverridereset` | `dpor` | Administrator | Clear all overrides |
| `globalmodule <module>` | `gmod` | Bot owner | Toggle a module everywhere |
| `globalcommand <command>` | `gcmd` | Bot owner | Toggle a command everywhere |
| `globalpermlist` | `gpl`, `lgp`, `globalperms`, `listglobalperms` | Bot owner | List global blocks |
| `resetglobalperms` | | Bot owner | Clear global blocks |
| `userblacklist <add|remove> <user> [reason]` | `ubl` | Bot owner | Blacklist a user |
| `channelblacklist <add|remove> <id> [reason]` | `cbl` | Bot owner | Blacklist a channel |
| `serverblacklist <add|remove> <server> [reason]` | `sbl` | Bot owner | Blacklist a server |
| `manualblacklistcheck` | `manualblcheck`, `mbc` | Bot owner | Re-run blacklist enforcement |

## Tips and gotchas

- `resetperms` is exempt from the rule check so you can always recover from a rule that locked everything, as long as you are an administrator.
- Rules match on the command's canonical name, so `srvrcmd clear disable` and `srvrcmd purge disable` are the same rule. Use the first name from `help <command>`.
- A rule for "all modules" also covers the Permissions module. If you deny everything for a role, members with only that role cannot run `listperms` either.
- Category rules use the channel's parent category at the time the command runs; threads inherit from their parent channel.
- Discord permission overrides change what Discord permission is required, not who the rules allow. Use both together: an override to lower the bar, then a rule to restrict where.
- Permission rules never apply in DMs.
- The dashboard labels the target choices Whole server, A role, A channel, A category and A specific user; the user option takes a pasted user ID.
