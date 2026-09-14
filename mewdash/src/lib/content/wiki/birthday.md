---
title: Birthdays
slug: birthday
summary: Members set a birthday on their profile and opt in, and the bot announces it in a channel, optionally with a temporary birthday role and a role ping.
icon: fa-birthday-cake
category: Community
dashboard: /dashboard/birthday
module: Birthday
tags: [birthday, birthdays, bday, celebrate, birthday role, announcement, timezone, age, profile]
related: [utility, administration]
---

## What it does

A member sets their birthday once with `setbirthday`, then runs `birthdayannouncements` in any server that has the feature turned on. Each day the bot checks who has a birthday, posts a message in the announcement channel, and can hand out a birthday role for 24 hours. If a ping role is set, it is mentioned in front of the message.

Birthdays are stored on the member's bot profile, not per server, so one `setbirthday` covers every server they share with the bot. Whether a birthday is announced in a given server depends on three things: the member has opted in, their profile is not private, and their birthday display mode is not disabled.

Anyone can see who is celebrating with `birthdaytoday` and who is coming up with `birthdaylist`. Age is shown next to the name unless the member has chosen a display mode that hides the year.

Staff configure the channel, roles and message from the **Birthdays** page on the dashboard or with the `birthday*` commands.

## Why you would use it

- Community servers that want a daily "happy birthday" post without anyone tracking dates by hand.
- Giving members a coloured birthday role for the day so they stand out in chat.
- Pinging a "birthday squad" role so people actually see the announcement.
- Letting members choose how much of their birthday is public, down to hiding it entirely.

## Who gets announced

A member is included in announcements and lists only when all of these are true:

| Requirement | How the member controls it |
| --- | --- |
| A birthday is set | `setbirthday <date>` |
| Announcements are opted in | `birthdayannouncements` toggles it; off by default |
| Profile is not private | `setprivacy public` on the profile |
| Display mode is not Disabled | `setbirthdayprivacy <mode>` |

The check runs against the members currently in the server, so someone who leaves is not announced.

### Birthday display modes

`setbirthdayprivacy` takes one of these values. It affects what is shown in lists, on the profile, and in `birthdaytoday`.

| Mode | Effect |
| --- | --- |
| `Default` | Full date shown, age is displayed in lists |
| `MonthOnly` | Month only, age hidden |
| `YearOnly` | Year only, age still displayed |
| `MonthAndDate` | Month and day, age hidden |
| `Disabled` | Birthday hidden and never announced |

## How the daily check works

The service runs once an hour and compares each member's birthday month and day with today's date in UTC. The first hour of a new UTC day that finds birthdays posts them, and the server is marked as done for that day so nothing is posted twice.

Announcements only happen when the **Announcements** feature is on and a channel is set. Setting a channel with `birthdaychannel` or on the dashboard turns the feature on for you.

Timezones are stored but not used by the daily check yet. `birthdaytimezone` and the **Server Timezone** setting are accepted and shown on the config embed, but announcements go out on the UTC day.

## The birthday role

When **Birthday Role** is enabled and a role is set, each announced member is given the role at announcement time and it is removed 24 hours later. The removal timer lives in memory, so if the bot restarts during the day the role stays until someone removes it.

The bot needs Manage Roles and its top role must sit above the birthday role.

## The announcement message

The default message is `Happy Birthday %user.mention%!` with party emoji around it. Replace it with `birthdaymessage` or the **Birthday Message** editor on the dashboard. The text goes through the embed parser, so anything the embed builder produces works, and the ping role mention is prepended if enabled.

### Placeholders

The message supports the standard user, server, channel and bot placeholders from the placeholders page, plus one birthday-specific value.

| Placeholder | Value |
| --- | --- |
| `%user.mention%` | Mentions the birthday member |
| `%user.name%` | Their username |
| `%user.avatar%` | Their avatar URL |
| `%server.name%` | The server name |
| `%birthday.age%` | The age they are turning, or `Unknown` |

> [!WARNING]
> Use `%user.mention%`, not `{user}`. The text command help mentions `{user}`, but only the `%...%` form is replaced in the posted announcement.

## Settings

Everything is on the **Birthdays** page under three tabs: **Configuration**, **Users** and **Statistics**.

**Configuration** has the basic settings, the message editor, and a **Birthday Features** panel with one toggle per feature.

| Setting | Default | What it controls |
| --- | --- | --- |
| Channel | none | Where announcements are posted |
| Birthday Role | none | Role given for 24 hours on a birthday |
| Ping Role | none | Role mentioned in front of each announcement |
| Server Timezone | UTC | Stored for the server, shown on the config embed |
| Reminder Days Before Birthday | 0 | 0 to 30; stored, no reminder is sent yet |
| Birthday Message | default embed | The announcement, with the placeholders above |

| Feature toggle | Default | What it controls |
| --- | --- | --- |
| Announcements | off | Posts the daily message in the channel |
| Birthday Role | off | Assigns the temporary role |
| Reminders | off | Placeholder toggle; nothing is sent yet |
| Ping Role | off | Mentions the ping role with announcements |
| Timezone Support | off | Placeholder toggle; the check still runs in UTC |

**Users** shows **Upcoming Birthdays** for the next 7, 14 or 30 days and an **All Users** list of every member with a birthday set, with today's birthdays highlighted at the top of the page. **Statistics** shows **Total Users**, **Birthdays Set**, **Public Birthdays** and **Today's Birthdays**.

> [!NOTE]
> Saving the dashboard form only writes values you have filled in. To clear a role or the channel, use `birthdayrole` or `birthdaypingrole` with no role, or reset everything with `/birthday config reset`.

## Setup walkthrough

1. Open **Birthdays** in the dashboard.
2. Under **Configuration**, pick the **Channel** for announcements and click **Save Configuration**.
3. Turn on **Announcements** in the **Birthday Features** panel.
4. Optionally pick a **Birthday Role** and enable **Birthday Role**, and a **Ping Role** with **Ping Role** enabled.
5. Optionally write your own **Birthday Message** using `%user.mention%` and `%birthday.age%`.
6. Tell members to run `setbirthday` and then `birthdayannouncements` to opt in.
7. Check the **Users** tab to confirm they appear under **Upcoming Birthdays**.

## Commands

Run these with your server's prefix (`.` unless you changed it). The slash versions live under `/birthday` and `/birthday config`.

| Command | Aliases | Needs | Purpose |
| --- | --- | --- | --- |
| `setbirthday <date>` | | Nobody | Set your birthday on your profile, for example `setbirthday 1998-04-12` |
| `setbirthdayprivacy <mode>` | | Nobody | Choose one of the display modes above |
| `birthdayannouncements` | `bdayann` | Nobody | Opt in or out of being announced |
| `birthdaytimezone <zone>` | `bdaytz` | Nobody | Store your timezone, for example `Europe/London` |
| `birthdaytoday` | `todaysbirthdays` | Nobody | List who is celebrating today |
| `birthdaylist [days]` | `bdaylist`, `upcomingbirthdays` | Nobody | Upcoming birthdays, 1 to 30 days, default 7 |
| `birthdaychannel [#channel]` | `bdaychannel`, `bdaychan` | Administrator | Set the announcement channel and enable announcements |
| `birthdayrole [@role]` | `bdayrole` | Administrator | Set the 24 hour birthday role, or clear it with no role |
| `birthdaypingrole [@role]` | `bdayping` | Administrator | Set the role to mention, or clear it with no role |
| `birthdaymessage [text]` | `bdaymsg` | Administrator | Set the announcement text, or show the current one |
| `birthdayconfig` | `bdaycfg` | Administrator | Show the current configuration |

`/birthday config reset` clears every setting and disables all features. It has no text command equivalent.

## Tips and gotchas

- Members are not announced until they run `birthdayannouncements`. Tell them, or nobody will show up.
- `setbirthday` accepts anything the bot can parse as a date. Use an unambiguous format such as `1998-04-12`.
- `birthdaytimezone` only accepts a short fixed list of sixteen zones such as `UTC`, `GMT`, `America/New_York`, `Europe/London`, `Asia/Tokyo`, `Asia/Kolkata`, `Australia/Sydney` and `Pacific/Auckland`. The dashboard **Server Timezone** dropdown has a similar list of thirteen.
- The daily check uses UTC. Members far from UTC may be announced a few hours early or late.
- The bot needs Manage Roles for the birthday role, and Send Messages plus Embed Links in the announcement channel.
- `birthdayconfig` shows a "Reminder Days" field and a Reminders feature. These are stored but do not send anything at present.
- There is no command to delete a stored birthday. Members hide it by running `setbirthdayprivacy Disabled` or by opting out with `birthdayannouncements`.
