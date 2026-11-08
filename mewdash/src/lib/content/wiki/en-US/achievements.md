---
title: Achievements
slug: achievements
summary: Members unlock achievements for what they do in the server and wear them as badges on their profile
icon: fa-trophy
category: Community
dashboard: /dashboard/achievements
module: Achievements
tags: [achievements, badges, points, ranks, grades, unlocks, milestones, achievement cards, xp per point, achievements bot]
related: [xp, currency, designs, reputation, statroles]
---

## What it does

Achievements are goals members reach by using your server: send their first message, hit 250 messages, join voice, react with lots of different emoji, stay for months, boost. Each one has a grade worth points, and those points decide a member's achievement rank. Members show off what they earned with up to four badges on their profile card.

Turning achievements on counts history straight away. Members unlock everything their stored messages, voice time, reactions, invites, levels and time in the server already earned. This happens quietly, without a single announcement.

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

Built in achievements are grouped into Messages, Voice, Reactions, Invites, Commands, Loyalty, Boosts, Community and Prestige. Turn a whole category off, or add categories of your own, each with its own name, description and icon. Achievements you make without picking a category go in Server. Drag categories on the Categories tab to change their order everywhere members see them.

Deactivating a category stops new unlocks in it. Anything already earned stays. Prestige gives a bonus for unlocking every achievement in a category.

## Custom achievements

| Kind | Unlocks when |
| --- | --- |
| Goal | A count reaches a number, for example 1000 messages or 30 days in the server |
| Phrase | A member says a phrase |
| Reaction | A member reacts with an emoji |
| Manual | Staff hand it out |

Each one gets a name, description, grade, icon (a Font Awesome icon, a server emoji, a linked image or an uploaded image) and optional rewards: a role, currency and XP. Mark one secret to hide its name and goal until it is unlocked. Names go up to 80 characters, descriptions up to 200, phrases up to 100, and points up to 10000.

Built in achievements can be edited too: name, description, icon, points, rewards, and whether they are active. An edited one shows a **Customized** tag and can be put back with **Reset to default**. Deleting a custom achievement takes it, and its points, away from everyone who unlocked it.

## Announcements

The **Announcement mode** on the Announcements tab decides where unlocks are posted.

| Mode | Where unlocks are posted |
| --- | --- |
| Automatic | The log channel when one is set, otherwise the channel it happened in |
| Where it happened | The channel the member was active in, falling back to the log channel |
| Log channel only | The log channel only. Nothing is sent without one |
| DMs only | The member's DMs, for those who allow it |
| Silent | Nowhere. Achievements unlock quietly |

Several unlocks at once share one message. Unlock messages carry an image card in your server's colors. In channels they delete themselves after 5 seconds unless you pick another time or Never. DMs are never deleted. Members can turn unlock DMs, server messages and mentions off for themselves.

Two rules keep unlocks out of channels where they don't belong:

| Rule | What it does |
| --- | --- |
| Keep unlocks out of some channels | Channels you pick, such as an announcements channel. Members still earn achievements there, but the unlock is never posted there |
| Only post where the member can talk | On by default. An unlock is not posted in a channel the member can't send messages in, such as a read only channel they reacted in |

When either rule stops a post, the unlock goes to the log channel if you set one, and is skipped otherwise. The log channel itself is never skipped. To stop a channel counting at all, use the excluded channels on the Settings tab instead.

## Cards

The **Cards** tab is a designer for the unlock image. Drag and resize the title, icon, grade, progress, avatar and the rest, add shapes, text, images and icons, and use your server colors as tokens so a card follows a new icon. A card holds up to 64 elements. Pick a background from the presets or upload your own images (up to 30 card images per server, 4 MB each). Start from the built in design or one of the starter layouts, mark one design as the default, and give others to a category or a single achievement. An achievement's own design wins over its category's.

Members can also wear an achievement card design of their own, free, bought in the shop or unlocked by an achievement. Those live on the **Designs** tab of the Currency page, which the **Cards** tab links to. A member's equipped design wins over the server default, categories and single achievements. Members manage them with the XP commands `designs`, `equip <design>` and `unequipdesign achievement`. See [Designs](/wiki/designs).

## Member settings

Members choose who can see their profile card, unlocked list, badges and leaderboard spot, which badges to wear, and how they want to be notified. All of it is also in the **Me** tab of the iOS and Android apps.

## Dashboard

Earning is off until you turn it on with the toggle in the page header. While it is paused, the other tabs show a notice that nothing unlocks yet. The header also has **New achievement** and **Refresh**.

| Tab | What it is for |
| --- | --- |
| Overview | Totals, data sources, recent unlocks, most unlocked and rarest |
| Achievements | Browse, search, activate, edit and create achievements |
| Categories | Order, rename, toggle and create categories |
| Announcements | Where and how unlocks are posted, the message, and auto delete |
| Cards | The card designer and assignments |
| Members | Look up a member, give, take away or reset |
| Settings | Excluded roles and channels, XP per point, and maintenance |

### Overview

Four tiles show **Members earning**, **Unlocks** (with how many this week), **Achievements active** and **Made here** (server achievements). The **Data sources** card lists what achievements read from other features: message counting, voice tracking, invite tracking, command stats, XP and reputation. Each shows **Tracking** or **Not tracking**, with a hint for what to turn on. Message counting has a **Start tracking** button, and the others link to the right page. **Recent unlocks** lists the latest ones, with **Most unlocked** and **Rarest** beside it.

### Achievements tab

Categories are listed down the side, with **Everything** at the top, and show how many achievements in each are active. **Arrange categories** jumps to the Categories tab. Above the list you can search by name, description or key. You can also filter by **Show grade** and sort by category order, name, most unlocked, rarest or most points. The filter chips are All, Active, Inactive, Made here, Customized, Secret and Has rewards.

Tick several rows, or select all, to **Activate** or **Deactivate** them in bulk. Each row shows its tags, how many members unlocked it, its rewards, arrows to move it, and an activate switch. Click a row to open the editor.

The editor has these fields:

| Field | What it does |
| --- | --- |
| Name, Description | Leave the description blank to describe the goal automatically. A blank name on a built in achievement keeps its own |
| Category | Where it appears |
| Icon | A Font Awesome icon, a server emoji, a linked https image or an uploaded image (PNG, JPEG, GIF or WebP, under 4 MB, up to 100 uploads per server) |
| How it unlocks | **Reach a number** (pick **What to count** and a **Goal**), **Say a phrase** (matched anywhere in a message, ignoring case), react with an emoji (first time they react with it), or **Staff hand it out** |
| Only in channel | Limit a phrase or reaction achievement to one channel |
| Grade and points | Points are blank to use the grade's points, otherwise 0 to 10000 |
| Rewards | A role, currency and XP. The bot must be able to give the role, so its top role has to sit above it |
| Secret until unlocked | Hides the name and goal until someone unlocks it |
| Active | Deactivating keeps it for everyone who already unlocked it |

The editor previews the unlock image. Global achievements are earned across every server and cannot be changed here.

### Categories tab

**Order and visibility** lists every category. Drag a row or use the arrows to reorder it. The switch activates or deactivates a category, and edit and delete work on categories you made. **New category** takes a name, a description and an icon. Deleting a category moves its achievements to Server and nobody loses anything. **Prestige for finishing categories** is a switch for the bonus.

### Announcements tab

| Card | Settings |
| --- | --- |
| Where unlocks are announced | **Announcement mode**, **Log channel**, **Keep unlocks out of some channels**, **Only post where the member can talk** |
| Delivery | **DM members by default** (off by default), **Mention members** (on), **Attach the achievement card** (on), **Delete unlock messages** (Never, or after 5 seconds to 1 day, default 5 seconds) |
| Unlock message | A custom message for unlocks, using the embed editor and the achievement placeholders. Leave it empty for the default embed. With several unlocks at once, placeholders use the best one and `%achievement.list%` lists them all. `%achievement.image%` places the card |

The log channel field warns when the mode needs one and none is set, or when the bot cannot post or embed links there.

### Cards tab

**Card designs** shows the built in design in your server's colors and the designs you made. Each design has **Make default**, duplicate, edit and delete, and shows how many categories and achievements use it. Deleting one sends those back to the server default. **New design** opens the designer, which has starter layouts, backgrounds, layers you can hide and reorder, alignment tools and shortcuts (arrows nudge, Shift moves 10, Delete removes, Ctrl or Cmd with D duplicates). **Different designs for some unlocks** assigns a design to a whole category or one achievement. The **Show on** setting limits an element to unlocked or locked cards.

### Members tab

Search for a member and sort by points, most unlocked or latest unlock. Pick one to see their points, rank and progress in every category. **Give** hands them an achievement and the take away button on a row removes one. **Reset member** clears everything they have here. Tracked activity stays after a reset, so what they still qualify for comes back quietly.

### Settings tab

| Card | Setting | What it does |
| --- | --- | --- |
| Who and where doesn't count | Roles, Channels | Members with these roles earn nothing, and activity in these channels does not count. Bots never earn |
| Extras | XP per point | 0 to 1000. Every unlock also pays XP, and 0 turns it off |
| Extras | Show them before they unlock | Lets members see the names and goals of secret achievements early |
| Maintenance | Check everyone again | Runs the check for every member again, useful after turning on a data source. Unlocks arrive quietly within minutes |
| Maintenance | Reset every achievement | Clears all unlocks and points in the server. Settings and your own achievements stay. This cannot be undone |

## Commands

Run these with your server's prefix (`.` unless you changed it). The same commands exist under `/achievements`.

| Command | Aliases | Needs | Purpose |
| --- | --- | --- | --- |
| `achievements [@user]` | `achoverview`, `achs` | Nobody | Rank, points and recent unlocks |
| `achcard [@user]` | `achprofile` | Nobody | The profile card |
| `achlist [@user]` | `achall` | Nobody | Every achievement and progress |
| `achcategory <category> [@user]` | `achcat` | Nobody | One category |
| `achview [@user] <achievement>` | `achimage` | Nobody | One achievement as an unlock card || `achsearch <query>` | | Nobody | Find an achievement |
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
| `achresetall` | | Manage Server | Clear every member's achievements |
| `achresetone <achievement>` | | Manage Server | Clear one achievement for everyone |
| `achdelete <achievement>` | | Manage Server | Delete a custom achievement |
| `achenable <achievement>`, `achdisable <achievement>` | | Manage Server | Activate or deactivate one achievement |
| `achcategorytoggle <category>` | `achcattoggle` | Manage Server | Activate or deactivate a category |
| `achexcluderole <role>`, `achexcludechannel <channel>` | | Manage Server | Exclude a role or channel from earning |
| `achdmdefault <true or false>` | | Manage Server | DM members by default |
| `achlatest [@user]`, `achhighest [@user]` | `achbest` | Nobody | Latest unlocks, or the highest grades earned |
| `badgeremove <slot>` | `unequipbadge` | Nobody | Empty a badge slot |

## Tips and gotchas

- Rewards are given for history too. If you set XP per point or add rewards before turning achievements on, the first sweep pays them out for everything members already earned. Set them afterwards if you only want to reward new unlocks.
- XP from achievements can level a member up, and a new level can unlock a level achievement, which can give more XP. It always stops, because each achievement unlocks once.
- Members with an excluded role, or activity in an excluded channel, earn nothing from it.
