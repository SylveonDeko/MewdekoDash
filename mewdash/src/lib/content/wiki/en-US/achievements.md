---
title: Achievements
slug: achievements
summary: Members unlock achievements for chatting, voice, reactions, invites, commands, levels and time in the server, earn points that climb a rank of their own, and wear badges on their profile. Separate from XP, with an optional link between the two.
icon: fa-trophy
category: Community
dashboard: /dashboard/achievements
module: Achievements
tags: [achievements, badges, points, ranks, grades, unlocks, milestones, achievement cards, xp per point, achievements bot]
related: [xp, currency, reputation, statroles]
---

## What it does

Achievements are goals members reach by using your server: send their first message, hit 250 messages, join voice, react with lots of different emoji, stay for months, boost. Each one has a grade, each grade is worth points, and points decide a member's achievement rank. Members show off what they earned with up to four badges on their profile card.

Turning achievements on counts history straight away. Members unlock everything their stored messages, voice time, reactions, invites, levels and time in the server already earned, quietly, without a single announcement.

## How it fits with XP

Achievements and XP are two separate systems that run side by side. Neither needs the other, and turning one off leaves the other alone.

| | XP | Achievements |
| --- | --- | --- |
| Earned by | Every message and every minute in voice | Reaching a goal, once |
| Climbs | Levels, on the XP curve | An achievement rank, Newcomer to Champion |
| Measured in | XP | Points from the grade of each unlock |
| Rewards | Level roles and currency | Per achievement roles, currency and XP |

They connect in exactly two places:

1. **Levels unlock achievements.** The Community category has achievements for reaching XP levels, so levelling up can unlock them.
2. **Achievements can give XP, if you want.** Nothing is given by default. Give a single achievement an XP reward, or set **XP per point** on the Settings tab so every unlock pays XP based on its points. A Gold unlock is worth 50 points, so at 2 XP per point it gives 100 XP.

The achievement rank is not your XP level. A member can be level 40 and a Bronze rank, or level 3 and Gold, because one measures how much they chat and the other how many different things they have done.

## Grades, points and ranks

| Grade | Points |
| --- | --- |
| Bronze | 10 |
| Silver | 25 |
| Gold | 50 |
| Emerald | 100 |
| Amethyst | 250 |
| Champion | 500 |

Points add up into a rank:

| Rank | Points needed |
| --- | --- |
| Newcomer | 0 |
| Bronze | 100 |
| Silver | 500 |
| Gold | 1500 |
| Emerald | 3500 |
| Amethyst | 7000 |
| Champion | 12000 |

Custom achievements can use any grade and override the points.

## Categories

Built in achievements are grouped into Messages, Voice, Reactions, Invites, Commands, Loyalty, Boosts and Community. Turn a whole category off, or add categories of your own with their own name, description and icon. Drag categories on the Categories tab to change their order everywhere members see them.

## Custom achievements

| Kind | Unlocks when |
| --- | --- |
| Goal | A count reaches a number, for example 1000 messages or 30 days in the server |
| Phrase | A member says a phrase |
| Reaction | A member reacts with an emoji |
| Manual | Staff hand it out |

Each one gets a name, description, grade, icon (an emoji, a server emoji, a Font Awesome icon or an uploaded image) and optional rewards: a role, currency and XP. Mark one secret to hide its name and goal until it is unlocked.

## Announcements

| Mode | Where unlocks are posted |
| --- | --- |
| Auto | The log channel if one is set, otherwise the channel it happened in |
| Here | The channel it happened in |
| Log channel | The log channel only |
| DM only | The member's DMs |
| Silent | Nowhere |

Several unlocks at once share one message. Announcements carry an image card in your server's colors. In channels they delete themselves after 5 seconds unless you pick a longer time or Never. DMs are never deleted. Members can turn unlock DMs, server messages and mentions off for themselves.

Two rules keep unlocks out of channels where they don't belong:

| Rule | What it does |
| --- | --- |
| Quiet channels | Channels you pick, such as an announcements channel. Members still earn achievements there, but the unlock is never posted there |
| Only post where the member can talk | On by default. An unlock is not posted in a channel the member can't send messages in, such as a read only channel they reacted in |

When either rule stops a post, the unlock goes to the log channel if you set one, and is skipped otherwise. The log channel itself is never skipped. To stop a channel counting at all, use the excluded channels on the Settings tab instead.

## Cards

The **Cards** tab is a designer for the unlock image. Drag and resize the title, icon, grade, progress, avatar and the rest, add shapes, text, images and icons, and use your server colors as tokens so a card follows a new icon. Save up to twenty designs, pick one as the default, and assign others to a category or a single achievement. The most specific one wins.

## Member settings

Members choose who can see their profile card, unlocked list, badges and leaderboard spot, which badges to wear, and how they want to be notified. All of it is also in the **Me** tab of the iOS and Android apps.

## Dashboard

| Tab | What it is for |
| --- | --- |
| Overview | Start or pause earning, unlock totals and recent unlocks |
| Achievements | Browse, search, enable, edit and create achievements |
| Categories | Order, rename, toggle and create categories |
| Announcements | Where and how unlocks are posted, the message, and auto delete |
| Cards | The card designer and assignments |
| Members | Look up a member, grant, revoke or reset |
| Settings | Excluded roles and channels, XP per point and secret achievements |

## Commands

Run these with your server's prefix (`.` unless you changed it). The same commands exist under `/achievements`.

| Command | Aliases | Needs | Purpose |
| --- | --- | --- | --- |
| `achievements [@user]` | `achoverview`, `achs` | Nobody | Rank, points and recent unlocks |
| `achcard [@user]` | `achprofile` | Nobody | The profile card |
| `achlist [@user]` | `achall` | Nobody | Every achievement and progress |
| `achcategory <category> [@user]` | `achcat` | Nobody | One category |
| `achview [@user] <achievement>` | `achimage` | Nobody | One achievement as an unlock card |
| `achsearch <query>` | | Nobody | Find an achievement |
| `achleaderboard [sort]` | `achlb` | Nobody | The server leaderboard |
| `badges [@user]` | `badgeinv` | Nobody | Owned badges |
| `badgeequip <slot> <badge>` | `equipbadge` | Nobody | Wear a badge in slot 1 to 4 |
| `achprivacy <area> <everyone or onlyme>` | | Nobody | Profile, achievements, badges or leaderboard visibility |
| `achnotify <dm, message or mention> <true or false>` | | Nobody | Your unlock notifications |
| `achtoggle` | | Manage Server | Start or pause earning |
| `achannounce <mode>` | | Manage Server | Where unlocks are posted |
| `achlogchannel [#channel]` | `achlog` | Manage Server | The log channel |
| `achxpperpoint <amount>` | | Manage Server | XP per achievement point, 0 to turn off |
| `achcreate <metric> <goal> <grade> <name>` | | Manage Server | A goal achievement |
| `achcreatephrase <phrase> <grade> <name>` | | Manage Server | A phrase achievement |
| `achcreatereaction <emoji> <grade> <name>` | | Manage Server | A reaction achievement |
| `achcreatemanual <grade> <name>` | | Manage Server | A manual achievement |
| `achrewardrole`, `achrewardcurrency`, `achrewardxp` | | Manage Server | Add a reward to an achievement |
| `achgrant <@user> <achievement>` | | Manage Server | Hand out an achievement |
| `achrevoke <@user> <achievement>` | | Manage Server | Take one back |
| `achreset <@user>` | | Manage Server | Clear a member's achievements |

## Tips and gotchas

- Rewards are given for history too. If you set XP per point or add rewards before turning achievements on, the first sweep pays them out for everything members already earned. Set them afterwards if you only want to reward new unlocks.
- XP from achievements can level a member up, and a new level can unlock a level achievement, which can give more XP. It always stops, because each achievement unlocks once.
- Members with an excluded role, or activity in an excluded channel, earn nothing from it.
