---
title: Nintendo Switch
slug: switch
summary: Look up Nintendo Switch error codes, convert them between decimal and hex, search the switchbrew.org wiki, and get a readable breakdown of a Ryujinx log file.
icon: fa-gamepad-modern
category: Entertainment
module: Switch
tags: [switch, nintendo, error code, ryujinx, emulator, log, switchbrew, homebrew, hex]
related: [userprofile, help]
---

## What it does

The Switch module is a support toolkit for servers around Nintendo Switch homebrew and emulation. When someone posts an error like `2168-0002`, a helper runs `err 2168-0002` and the bot replies with the module the error belongs to, what is known about it, and a link to Nintendo's support page when one exists.

Two small converters turn the `NNNN-NNNN` form into the raw hex value used in code and back. `switchbrew` searches the switchbrew.org wiki so people can find SVC, result code or hardware pages without leaving Discord.

The biggest feature is the Ryujinx log analyser. A user attaches their `Ryujinx.log`, someone runs `analyselog` on it or as a reply to it, and the bot produces an embed with the game, emulator version, hardware, every relevant setting, the last error, installed mods and cheats, and a list of notes pointing at common misconfigurations.

Nothing needs configuring and nothing is stored. All commands are open to everyone.

## Why you would use it

- A support channel gets the same "what does 2811-5001 mean" question daily.
- Ryujinx troubleshooting starts with reading the log, and most people do not know what to look for.
- Developers want the hex form of an error to search source code.
- Anyone can pull up a switchbrew.org page from Discord.

## Error code lookups

`err <code>` accepts either form:

- `NNNN-NNNN`, where the first group starts with 2 (for example `2168-0002`). The module number is the first group minus 2000 and the description is the second group.
- A hex value with the `0x` prefix, for example `0x2A2`. The low nine bits are the module and the rest is the description.

The reply shows the code in both forms, the module name and number, the description number, and an explanation. The explanation is found in this order: a known description for the exact code, a Nintendo support page for the exact code, a description for the range the code falls into within its module, and otherwise "unknown". Known codes are shown with the normal colour, unknown ones with the error colour.

A few codes do not follow the pattern, such as `2-AAB6A-3400`. Those are matched exactly against a short list and reported with the game they belong to.

`err2hex <NNNN-NNNN>` prints the hex value. `hex2err <hex>` prints the dashed form; the `0x` prefix is optional.

## Switchbrew search

`switchbrew <query>` queries the wiki's search API and returns the top five matches with a link and a snippet of up to 200 characters each. `svc` is an alias, so `svc SetThreadPriority` reads naturally.

## Ryujinx log analysis

`analyselog` looks for a `.log` or `.txt` attachment on your message. If there is none, and your message is a reply, it uses the attachment on the message you replied to and credits that author in the footer. The embed is titled with the game name and contains:

| Field | Contents |
| --- | --- |
| General Info | Ryujinx version, firmware, CPU, GPU, RAM, operating system |
| System Settings | Audio backend, docked or handheld, PPTC, shader cache, VSync, hypervisor (macOS only) |
| Graphics Settings | Graphics backend, resolution scale, anisotropic filtering, aspect ratio, texture recompression |
| Errors | The last error block from the log, or "no errors" |
| Mods | Each mod with ExeFS or RomFS, truncated with a count if there are many |
| Cheats | Each cheat, truncated the same way |
| Notes | Detected problems and advice |

Notes cover things such as a shader cache collision or corruption, a bad dump hash, outdated keys, missing firmware, file permission errors, a missing save, missing services, Vulkan running out of memory, the default user profile, no controller configured, an Intel or AMD GPU that should use Vulkan, Rosetta on Apple silicon, the dummy audio backend, PPTC or shader cache disabled, expanded RAM, the software memory manager, ignore missing services, VSync off, filesystem integrity checks off, backend threading off, and custom builds. Each note has a severity marker from informational to critical.

If the file cannot be downloaded or is not a Ryujinx log, the bot says the log is invalid.

## Settings

This module has no settings and no dashboard page.

## Setup walkthrough

1. Make sure the bot can read message history and attach files in your support channel.
2. Ask users to attach their `Ryujinx.log` directly to a message.
3. A helper replies to that message with `analyselog`.
4. For error codes, run `err <code>` and share the support link if one is shown.
5. Optionally add a chat trigger or pinned message reminding people of these two commands.

## Commands

Run these with your server's prefix (`.` unless you changed it).

| Command | Aliases | Needs | Purpose |
| --- | --- | --- | --- |
| `err <code>` | `nxerr`, `serr` | Nobody | Explain a Switch error code in dashed or hex form |
| `err2hex <NNNN-NNNN>` | `e2h` | Nobody | Convert a dashed code to hex |
| `hex2err <hex>` | `h2e` | Nobody | Convert hex to the dashed form |
| `switchbrew <query>` | `sb`, `svc` | Nobody | Search switchbrew.org |
| `analyselog` | `analyzelog`, `analyselogs`, `analyzelogs`, `analyze`, `analyse` | Nobody | Analyse an attached Ryujinx log |

## Tips and gotchas

- The dashed form must be exactly four digits, a dash, four digits, starting with 2. Codes with letters go through the special-case list only.
- Logs must be attached as `.log` or `.txt`; a pasted log in a code block is not read.
- The analyser reads the whole file, so ask users for the log from the session where the problem happened rather than a fresh launch.
- switchbrew.org search is a live request; if the site is slow, the command will be too.
- Members can store their Switch friend code on their profile with `setswitchfc`, which is part of the User Profile module.
