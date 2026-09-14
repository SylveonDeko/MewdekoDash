---
title: Minecraft
slug: minecraft
summary: Register your Minecraft servers, post live status embeds that update themselves, get online and offline alerts, run RCON commands, and bridge in-game chat, joins, deaths and advancements to Discord with the companion plugin.
icon: fa-server
category: Entertainment
dashboard: /dashboard/minecraft
module: Minecraft
tags: [minecraft, mc, server status, bridge, rcon, whitelist, chat bridge, java, bedrock, geyser, player lookup, skin]
related: [statchannels, logging, utility]
---

## What it does

Staff register one or more Minecraft servers by name and address. Any member can then run `mcstatus` to see whether the server is up, its MOTD, version, latency and who is online. A server can also be watched: the bot posts a status embed in a channel and edits it on a timer, or writes the player count into the channel topic, and announces when the server goes down or comes back.

If the server has RCON enabled, staff can send console commands and manage the whitelist from Discord or the dashboard console without joining the game.

The optional companion plugin turns the link into a two-way bridge. Player chat, joins, leaves, deaths and advancements are posted to Discord channels you choose, and messages typed in the bridge channel are broadcast to players in game.

## Why you would use it

- Show a live "who is online" embed so members know when it is worth logging in.
- Alert the community the moment the server crashes or comes back after maintenance.
- Whitelist new members from Discord without opening the server console.
- Keep Discord-only members in the loop with in-game chat, deaths and advancements.
- Look up a player's UUID or skin render while handling an application or report.

## Server types

| Type | Default port | How it is queried |
| --- | --- | --- |
| Java Edition | 25565 | Server list ping; the query protocol is also used when **Query Port** is set and `enable-query=true` |
| Bedrock Edition | 19132 | Bedrock ping |
| Geyser (Java + Bedrock) | 25565 | Java ping, flagged as Geyser |

Each server has a name that is stored lowercased, and the first server you add becomes the default used by `mcstatus` with no arguments. Private, reserved and loopback addresses are rejected unless the bot host has allowed them.

## Watching a server

Set a **Watch Channel** and the bot queries the server every **Watch Interval** minutes (default 5, minimum 1). What it does with the result depends on the **Watch Mode**.

| Mode | Behaviour |
| --- | --- |
| Embed (edit in place) | Posts one status embed and edits it every tick; reposts if the message is deleted |
| Channel Topic | Writes a short status line into the channel topic, at most once every five minutes |
| Both | Does both of the above |

Every tick also records a snapshot of online state, player count, latency and version. The dashboard **History** tab charts these over time.

When the online state flips, the bot posts an alert in the watch channel: a green "came online" or red "went offline" embed by default, or your own **Server Online Alert** and **Server Offline Alert** templates.

### Status placeholders

The **Custom Watch Embed** and both alert templates are run through the embed parser and support these placeholders.

| Placeholder | Value |
| --- | --- |
| `%mc.server.name%` | The registered name |
| `%mc.server.address%` | Host name or IP |
| `%mc.server.port%` | Port |
| `%mc.online%` | `Online` or `Offline` |
| `%mc.players.online%` | Current player count |
| `%mc.players.max%` | Player slots |
| `%mc.player.list%` | Names of online players |
| `%mc.motd%` | The MOTD with formatting codes stripped |
| `%mc.version%` | Reported version |
| `%mc.latency%` | Ping, for example `42ms` |
| `%mc.favicon%` | Server icon URL |
| `%mc.map%` | World name, query protocol only |
| `%mc.gamemode%` | Game mode, query protocol only |
| `%mc.software%` | Server software, query protocol only |
| `%mc.plugins%` | Plugin list, query protocol only |
| `%mc.query%` | `Yes` if the extended query answered |
| `%mc.geyser%` | `Yes` if Geyser was detected |

## RCON and the whitelist

Turn on **RCON Settings** for a server and enter the **RCON Port** and **RCON Password** from `server.properties`. `mcrcon` then sends any console command and returns the output. `mcwhitelist` wraps the whitelist commands with the actions `add`, `remove`, `list`, `on`, `off` and `reload`. The dashboard shows the whitelist as a list with add and remove buttons, and the **Console** tab gives a command prompt for servers with RCON enabled.

> [!WARNING]
> RCON gives full console access. Keep `mcrcon` limited to administrators and treat the password like any other server credential.

## The companion plugin bridge

The bridge needs the MewdekoMC plugin on the game server: a Paper plugin for Paper 1.21+ or a NeoForge mod for 21.1.x, both on Java 21. On the dashboard, open the server's **Companion Plugin** section and generate a key. Copy the **API URL** and **API key** into the plugin's `config.yml` (Paper) or `config/mewdeko-server.toml` (NeoForge), then restart or run `/mewdeko reconnect`. The key is only shown once; generate a new one to replace it.

Once connected, the plugin streams events over a WebSocket and the bot routes them to channels.

| Event | Goes to | Default look |
| --- | --- | --- |
| Player join | **Join/Leave** channel | Green embed with the player's name and avatar |
| Player leave | **Join/Leave** channel | Red embed with the player's name and avatar |
| Chat | **Chat Bridge** channel | `**player**: message` |
| Death | **Deaths** channel | Gray embed with the death message |
| Advancement | **Advancements** channel | Green embed with the advancement name |
| Server status | Nowhere; stored as a history snapshot with TPS and memory | |

Any event channel left empty falls back to the **Watch Channel**. Messages sent by non-bot users in the Chat Bridge channel (or the watch channel if none is set) are forwarded to the game as `[Discord] user: message` by default. The plugin's own config can turn each event category off, and console streaming is off by default and not displayed by the bot.

### Bridge event templates

Each Discord-bound event can have its own template under **Bridge Event Templates**. They accept embed builder output, mentions are neutralised, and these placeholders are replaced.

| Template | Placeholders |
| --- | --- |
| Player Join (Discord) | `%mc.player%`, `%mc.uuid%`, `%mc.avatar%` |
| Player Leave (Discord) | `%mc.player%`, `%mc.uuid%`, `%mc.avatar%` |
| Chat Message (Discord) | `%mc.player%`, `%mc.message%`, `%mc.avatar%` |
| Death Message (Discord) | `%mc.player%`, `%mc.death.message%`, `%mc.avatar%` |
| Advancement (Discord) | `%mc.player%`, `%mc.advancement%`, `%mc.avatar%` |
| Chat from Discord (In-game format) | `%user%`, `%message%`, `%channel%`; use Minecraft section sign colour codes |

## Settings

The Minecraft page has a **Servers** tab, an **Add Server** tab, **History**, **Console**, and a tab named after the selected server for editing it.

| Setting | Default | What it controls |
| --- | --- | --- |
| Name | | Short identifier used in commands, for example `survival` |
| Address | | Host name or IP |
| Port | 25565 | Game port; 19132 for Bedrock |
| Type | Java Edition | Java, Bedrock or Geyser |
| Query Port (0 = game port) | 0 | Port for the extended query protocol |
| Watch Channel | none | Channel that receives the status embed and alerts |
| Watch Interval (minutes) | 5 | How often the server is polled |
| Watch Mode | Embed | Embed, Channel Topic or Both |
| Custom Watch Embed | default embed | Your own status embed using the placeholders above |
| Server Online Alert | default embed | Posted when the server comes back |
| Server Offline Alert | default embed | Posted when the server goes down |
| Event Channels | watch channel | Chat Bridge, Join/Leave, Deaths, Advancements |
| Bridge Event Templates | defaults | Per-event templates listed above |
| RCON Settings | off | Enabled toggle, RCON Port, RCON Password |
| Companion Plugin | no key | Generate or revoke the plugin API key and copy the API URL |

## Setup walkthrough

1. Open **Minecraft** in the dashboard and go to **Add Server**.
2. Enter a **Name**, the **Address** and **Port**, pick the **Type**, and choose a **Watch Channel** and **Watch Mode**. Save.
3. Check the **Servers** tab: the status card should show the server online within a few seconds.
4. Edit the server to enable **RCON Settings** if you want console and whitelist access, then try the **Console** tab.
5. For chat bridging, set the **Event Channels**, generate a key under **Companion Plugin**, install the plugin on the game server and paste the URL and key into its config.
6. Join the game and say something: it should appear in the Chat Bridge channel, and a reply there should appear in game.

## Commands

Run these with your server's prefix (`.` unless you changed it). Slash versions live under `/minecraft`.

| Command | Aliases | Needs | Purpose |
| --- | --- | --- | --- |
| `mcstatus [name or address]` | `mcs` | Nobody | Status of the default server, a registered server, or any `host:port` you type |
| `mcadd <name> <address[:port]>` | | Manage Server | Register a server; prefix the address with `bedrock:` for Bedrock |
| `mcremove <name>` | `mcrm` | Manage Server | Delete a registered server |
| `mclist` | `mcl` | Nobody | List registered servers with type, default marker and watch channel |
| `mcdefault <name>` | `mcdef` | Manage Server | Choose the server `mcstatus` uses by default |
| `mcwatch <name> [#channel]` | `mcw` | Manage Server | Start posting status to a channel, or stop with no channel |
| `mcwatchmode <name> <embed, channeltopic or both>` | `mcwm` | Manage Server | Pick how the watch shows status |
| `mcembed <name> [template]` | `mce` | Manage Server | Set a custom status embed, or `-` to reset |
| `mcplayer <username>` | `mcp` | Nobody | Show a player's UUID, avatar and skin |
| `mcskin <username>` | | Nobody | Show a player's skin render |
| `mcrcon <name> <command>` | | Administrator | Run a console command over RCON |
| `mcwhitelist <name> <action> [player]` | `mcwl` | Manage Server | `add`, `remove`, `list`, `on`, `off` or `reload` |

## Tips and gotchas

- `mcstatus` is rate limited to ten queries per minute per Discord server, shared by every member.
- Direct address lookups with `mcstatus play.example.com:25565` work without registering, but private and local addresses are blocked.
- The bot needs **Manage Channels** in the watch channel for Channel Topic mode, and Discord itself limits topic edits, so topic mode never updates more often than every five minutes.
- Extended details such as map, game mode and plugins only appear when `enable-query=true` is set in `server.properties` and the **Query Port** matches.
- If the watch embed is deleted, the next tick posts a fresh one rather than failing.
- Bridge messages neutralise `@everyone`, `@here` and user mentions, so players cannot ping Discord from in game.
