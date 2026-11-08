---
title: Birthdays
slug: birthday
summary: Announces members' birthdays in a channel at an hour you choose
icon: fa-birthday-cake
category: Community
dashboard: /dashboard/birthday
module: Birthday
tags: [birthday, birthdays, bday, celebrate, birthday role, announcement, timezone, age, birth year, profile]
related: [utility, administration]
---

## What it does

A member sets their birthday once with `setbirthday`, then runs `birthdayannouncements` in any server that has the feature turned on. Each day the bot checks who has a birthday and posts a message in the birthday channel. It can also give the member a birthday role for 24 hours. If a ping role is set, it is mentioned in front of the message.

Birthdays are stored on the member's bot profile, not per server, so one `setbirthday` covers every server they share with the bot.

Anyone can see who is celebrating with `birthdaytoday` and who is coming up with `birthdaylist`. Members who want to leave entirely can run `birthdayforget`.

## Who gets announced

A member is included in announcements and lists only when all of these are true:

| Requirement | How the member controls it |
| --- | --- |
| A birthday is set | `setbirthday <date>`, or staff with `birthdayadminset` or the dashboard |
| Announcements are opted in | `birthdayannouncements` toggles it, off by default |
| Profile is not private | `setprivacy public` on the profile |
| Display mode is not Disabled | `setbirthdayprivacy <mode>` |

The check runs against the members currently in the server, so someone who leaves is not announced. Setting a member's birthday as staff does not opt them in. They still need to run `birthdayannouncements`.

### Birthday display modes

`setbirthdayprivacy` takes one of these values.

| Mode | Effect |
| --- | --- |
| `Default` | Full date shown, age can be shown |
| `MonthOnly` | Month only, age hidden |
| `YearOnly` | Year only, age can be shown |
| `MonthAndDate` | Month and day, age hidden |
| `Disabled` | Birthday hidden and never announced |

## The Birthdays page

Everything is on one page with five cards. Changes save as you make them. The switch at the top of the page turns the **Announcements** feature on and off, and **Reset to default** in the header clears every setting and disables all features.

### Announcements

| Setting | Default | What it controls |
| --- | --- | --- |
| Birthday channel | none | Where announcements are posted |
| Birth year | Never shown | Whether members may share their birth year |
| Birthday announcement | default message | The announcement, built in the message editor |
| Message with age | empty | Shown instead of the announcement for members who shared their year. Hidden while Birth year is **Never shown** |

**Birth year** has three options:

| Option | Effect |
| --- | --- |
| Never shown | Ages are never shown and `%birthday.age%` is `Unknown` |
| Members choose | A member's display mode decides whether their age is shown |
| Required | Only members who share their birth year are announced |

A member shares their year when their display mode is `Default` or `YearOnly`. The **Message with age** is used for those members when it is not empty. Everyone else gets the normal announcement.

If you leave the announcement empty the bot posts `🎉 Happy Birthday %user.mention%! 🎂`. The text goes through the embed parser, so anything the embed builder produces works.

| Placeholder | Value |
| --- | --- |
| `%user.mention%` | Mentions the birthday member |
| `%user.name%` | Their username |
| `%user.displayname%` | Their display name |
| `%birthday.age%` | The age they are turning, or `Unknown` |
| `%server.name%` | The server name |
| `%server.time%` | Current server time with timezone |

### Roles

| Setting | What it controls |
| --- | --- |
| Birthday role | Turn on **Birthday role**, then pick the role given for 24 hours (Birthday role (24-hour temporary)) |
| Ping role | Turn on **Ping role**, then pick the role mentioned in front of each announcement (Ping role (notifies when announcing)) |

Both toggles are off by default, and a role does nothing until its toggle is on. The removal timer for the birthday role lives in memory, so if the bot restarts during the day the role stays until someone removes it. The bot needs Manage Roles and its top role must sit above the birthday role.

### Time

| Setting | Default | What it controls |
| --- | --- | --- |
| Announcement hour (0-23) | 0 | The hour of the day the announcement goes out |
| Server timezone | UTC | The server's timezone, the same setting as **Server timezone** on the Settings page and the `timezone` command |

The bot checks once an hour. The first check at or after the announcement hour posts the day's birthdays, and the server is marked done so nothing is posted twice. The hour and the date are measured in the server timezone, and in UTC when none is set. Every member is announced on the server's day, whatever timezone they stored with `birthdaytimezone`. The bot sends no reminders before a birthday.

### Users

The card shows how many birthdays are today, then lists upcoming birthdays and every member with one set.

- **Upcoming birthdays** has a period dropdown: Next 7 days, Next 14 days or Next 30 days.
- **All users** lists members alphabetically, ten at a time, with **Show more** for the rest. A member who has not opted in shows as `Private`.
- **Add birthday** opens a sheet. Pick a **Member** and a **Date**, then **Save**.
- The row menu has **Remove**, which asks for confirmation and clears that member's birthday.

### Statistics

Four tiles: **Total users**, **Birthdays set** (with the percentage of members), **Public birthdays** (members with announcements on) and **Today's birthdays**.

## Setup walkthrough

1. Open **Birthdays** in the dashboard.
2. Under **Announcements**, pick the **Birthday channel**.
3. Turn on the switch at the top of the page.
4. Under **Time**, set the **Announcement hour (0-23)**.
5. Optionally turn on **Birthday role** and **Ping role** under **Roles** and pick a role for each.
6. Optionally write your own announcement and decide on **Birth year**.
7. Tell members to run `setbirthday` and then `birthdayannouncements` to opt in.
8. Check **Upcoming birthdays** under **Users** to confirm they appear.

## Commands

Run these with your server's prefix (`.` unless you changed it). The slash versions live under `/birthday` and `/birthday config`.

| Command | Aliases | Needs | Purpose |
| --- | --- | --- | --- |
| `setbirthday <date>` | | Nobody | Set your birthday, for example `setbirthday 1998-04-12` |
| `setbirthdayprivacy <mode>` | | Nobody | Choose one of the display modes above |
| `birthdayannouncements` | `bdayann` | Nobody | Opt in or out of being announced |
| `birthdaytimezone <zone>` | `bdaytz` | Nobody | Store your own timezone, for example `Europe/London` |
| `birthdaytoday` | `todaysbirthdays` | Nobody | List who is celebrating today |
| `birthdaylist [days]` | `bdaylist`, `upcomingbirthdays` | Nobody | Upcoming birthdays, default 7 days |
| `birthdayforget` | `bdayforget` | Nobody | Delete your birthday and every birthday setting stored for you |
| `birthdaychannel [#channel]` | `bdaychannel`, `bdaychan` | Administrator | Set the birthday channel and enable announcements |
| `birthdayrole [@role]` | `bdayrole` | Administrator | Set the 24 hour birthday role |
| `birthdaypingrole [@role]` | `bdayping` | Administrator | Set the role to mention |
| `birthdaymessage [text]` | `bdaymsg` | Administrator | Set the announcement text, or show the current one |
| `birthdayagemessage [text]` | `bdayagemsg` | Administrator | Set the message for members who shared their year, or clear it with no text |
| `birthdayyearrule <rule>` | `bdayyear` | Administrator | `NotAllowed`, `Optional` or `Required` |
| `birthdayhour <0-23>` | `bdayhour` | Administrator | Set the announcement hour |
| `birthdayadminset <@user> <date>` | `bdayset` | Administrator | Set a member's birthday |
| `birthdayadminremove <@user>` | `bdayremove` | Administrator | Remove a member's birthday |
| `birthdayconfig` | `bdaycfg` | Administrator | Show the current configuration |

`/birthday config reset` clears every setting and disables all features. It has no text command equivalent.

## Tips and gotchas

- Members are not announced until they run `birthdayannouncements`. Tell them, or nobody will show up.
- `setbirthday` accepts anything the bot can parse as a date. Use an unambiguous format such as `1998-04-12`.
- `birthdaytimezone` only accepts a fixed list of sixteen zones: `UTC`, `GMT`, `America/New_York`, `America/Chicago`, `America/Denver`, `America/Los_Angeles`, `Europe/London`, `Europe/Paris`, `Europe/Berlin`, `Europe/Rome`, `Europe/Moscow`, `Asia/Tokyo`, `Asia/Shanghai`, `Asia/Kolkata`, `Australia/Sydney` and `Pacific/Auckland`.
- Roles cleared on the page are cleared by picking none. A role or channel left empty does nothing.
- The bot needs Manage Roles for the birthday role, and Send Messages plus Embed Links in the birthday channel.
