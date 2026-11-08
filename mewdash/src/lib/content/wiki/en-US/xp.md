---
title: XP System
slug: xp
summary: Members earn levels and rewards by chatting and talking in voice
icon: fa-star
category: Community
dashboard: /dashboard/xp
module: Xp
tags: [xp, experience, levels, level up, rank, rank card, leaderboard, role rewards, voice xp, xp boost, competition, xp curve, designs, equip]
related: [currency, achievements, designs, administration, utility]
---

## What it does

Members earn XP by sending messages and by talking in voice channels. XP adds up into levels along a curve you choose. Anyone can run `rank` to get a rendered rank card showing their level, progress bar, server rank and avatar, or `leaderboard` to see who is ahead.

When a member levels up, the bot can post an announcement in the channel or a dedicated level-up channel. It can also send it by DM. You can write your own level-up messages with placeholders, or let the default embed handle it. Reaching a level can also hand out roles and server currency automatically.

Staff control how fast XP comes in with XP per message, a cooldown, voice XP per minute, a global multiplier, and per-channel and per-role multipliers. Temporary boost events multiply everything for a while, and competitions run a timed race with rewards for the top places. Users, roles and channels can be excluded so bot-spam channels and muted roles do not earn anything.

## Why you would use it

- Give active members visible progress and a reason to keep chatting.
- Unlock roles at set levels so long-standing members get perks without staff doing it by hand.
- Run a weekend double XP event or a "first to level 20" race.
- Keep XP fair by excluding command channels and bot roles.
- Tie XP to the currency module so levelling up also pays out.

## How XP is earned

### Text XP

Each message from a non-bot member awards **XP per message** (default 3, capped at 50) once per cooldown window. The **Message XP cooldown** defaults to 60 seconds; a member who sends ten messages in that window gets XP once. Messages in excluded channels, or from excluded users and roles, earn nothing. If the server is excluded entirely, nothing is counted.

The amount is then multiplied. All of these stack together:

| Multiplier | Set with | Notes |
| --- | --- | --- |
| Global multiplier | `setxpmultiplier` or **Server multiplier** | Applies to every gain |
| Channel multiplier | `setchannelxp` or **Channel multipliers** | Applies to gains in that channel |
| Role multiplier | `setrolexp` or **Role multipliers** | If a member has several roles with multipliers, only the highest one is used |
| Boost events | `xpboost` or **Boosts** | Every active event is applied |

The result is rounded down to a whole number.

**First message bonus** is a separate one-off award on a member's first message each UTC day. It is stored in the XP settings but is not shown on the dashboard.

### Voice XP

Voice XP is tracked per session. A member only earns it while they are in a voice channel with at least two participating people (bots do not count), and they are not muted or deafened, by themselves or by the server. Time spent muted or deafened, or alone in the channel, is not counted.

When the session ends the eligible minutes are multiplied by **Voice XP per minute** (default 2, capped at 10). Sessions under 15 seconds earn nothing. The **Voice XP timeout** (default 60 minutes) is the maximum number of minutes a single session can be paid for. Multipliers are applied to voice XP only when the base amount is at least 5. Setting voice XP per minute or the timeout to 0 turns voice XP off.

### XP decay

Decay is optional and off by default. When it is on, every twelve hours the bot finds members whose last activity is older than **Inactivity days before decay** and removes **Daily decay percentage** of their total XP. These three settings exist in the XP settings record but have no command or dashboard control yet.

## Levels and curves

The level a member is on depends on the **XP curve type**. Every curve is built on a base of 36 XP for level one.

| Curve | Command name | Dashboard name | XP needed for level n |
| --- | --- | --- | --- |
| Standard | `Standard` | Default | 36 x n squared |
| Linear | `Linear` | Linear | 36 x n |
| Accelerated | `Accelerated` | Quadratic | 36 x n to the power 1.25 |
| Decelerated | `Decelerated` | Exponential | 36 x n to the power 2.5 |
| Custom | `Custom` | not offered | Same as Standard |
| Legacy | `Legacy` | Legacy | Each level costs 36 plus 9 per previous level, totals accumulate |
| Step curve 1 | listed by `setxpcurve` | Step curve 1 | Each level costs 5n squared + 50n + 100 XP |
| Step curve 2 | listed by `setxpcurve` | Step curve 2 | Each level costs 50n squared - 100n + 150 XP |
| Step curve 3 | listed by `setxpcurve` | Step curve 3 | Each level costs 20n squared - 40n + 55 XP |

The step curves exist so XP brought in with the import page keeps its level. Standard is the default. Changing the curve with `setxpcurve` recomputes everyone's level unless you pass `false` as the second argument. Changing the curve does not change anyone's XP total, only which level that total maps to.

## Level-up notifications

Each member chooses how they are told about level-ups with `levelnotif`: `None`, `Channel` or `Dm`. Members can also run `leveluppings false` to stop the bot from mentioning them; their name is shown as plain text instead.

Channel notifications go to the **level-up channel** if one is set with `levelupchannel`, otherwise to the channel where the XP was earned. The bot needs Send Messages there.

Three filters decide which level-ups are announced at all. They apply to channel and DM notifications alike, and role and currency rewards are still given for skipped level-ups.

| Setting | Command | What it does |
| --- | --- | --- |
| Lowest level to announce | `levelupminlevel` | Skips level-ups below this level; 0 announces from the start |
| Announce every Nth level | `levelupinterval` | Announces only when a level-up crosses a multiple of N; 1 announces every level |
| Only announce reward levels | `leveluprewardsonly` | Announces only level-ups that reach a role reward level |

`leveluplog` shows recent level-ups. The dashboard's **Recent level-ups** group shows the same list.

If the server has no custom messages, the default is an embed titled with a level-up message, the member's avatar as thumbnail, and fields for total XP, server rank and new level. If you have added custom messages with `addlevelupmessage`, one enabled message is picked at random each time. A custom message may be plain text or embed JSON from the embed builder. Test any template with `testlevelupmessage`.

### Placeholders

These work inside custom level-up messages, alongside the general user and server placeholders from the placeholders page. Because notifications do not track the channel or the person who triggered them, `%xp.channel.*%` resolves to "Unknown Channel" and `%xp.triggeruser.*%` to "System". `%xp.gained%` is always 0.

| Placeholder | Value |
| --- | --- |
| `%xp.user%` | Username and tag, or plain username if pings are off |
| `%xp.user.mention%` | Mention of the member, or plain username if pings are off |
| `%xp.user.name%` | Username |
| `%xp.user.displayname%` | Display name |
| `%xp.user.nickname%` | Nickname, falling back to username |
| `%xp.user.avatar%` | Avatar URL |
| `%xp.user.id%` | User ID |
| `%xp.user.created%` | Account creation date |
| `%xp.user.joined%` | Server join date |
| `%xp.level.old%` | Level before the level-up |
| `%xp.level.new%` | New level (`%xp.level.current%` is the same) |
| `%xp.level.next%` | New level plus one |
| `%xp.level.difference%` | How many levels were gained |
| `%xp.total%` | Total XP |
| `%xp.current%` | XP earned inside the current level |
| `%xp.needed%` | XP the current level requires in total |
| `%xp.remaining%` | XP still needed for the next level |
| `%xp.progress%` | Progress through the level as a percentage |
| `%xp.rank%` | Server rank as a number |
| `%xp.rank.ordinal%` | Rank in words, such as "third" |
| `%xp.rank.suffix%` | Just the suffix: st, nd, rd or th |
| `%xp.guild%`, `%xp.guild.name%` | Server name |
| `%xp.guild.id%` | Server ID |
| `%xp.guild.membercount%` | Approximate member count |
| `%xp.guild.icon%`, `%xp.guild.banner%` | Server icon and banner URLs |
| `%xp.time%`, `%xp.time.full%`, `%xp.date%` | Current UTC time, time with date, and date |
| `%xp.timestamp%`, `%xp.timestamp.relative%` | Discord timestamp tags for now |

> [!EXAMPLE]
> `addlevelupmessage %xp.user.mention% just hit level %xp.level.new% and is now %xp.rank.ordinal% on the leaderboard.`

Run `levelupplaceholders` in Discord for the same list.

## Role rewards

`rolereward <level> <role>` gives a role when a member reaches that level. With **Exclusive role rewards** off (the default), members keep every reward role for levels at or below their own and lose any for levels above it. With it on (`setxpexclusive true`), only the reward for the highest level they qualify for is kept and all other reward roles are removed.

Rewards are applied when a level changes. On the dashboard, the **Rewards** card has **Keep only the highest role reward** and **Sync level roles**. The **Role rewards** list takes a level and a **Role** picker. Use `syncmyxproles`, `syncuserxproles` or `syncallxproles` to bring roles in line after adding rewards or importing XP. The all-users sync can run once an hour, and the bot needs Manage Roles with its role above every reward role.

## Currency rewards

`currencyreward <level> <amount>` or the **Currency rewards** list on the **Rewards** card (a level and an **Amount**) pays server currency from the currency module when a member reaches that level. Passing 0 removes the reward. If a member's level drops, for example after `setxp` or decay, the currency for the levels they lost is taken back.

## Achievements

[Achievements](/wiki/achievements) are a separate system with their own points and ranks, so an achievement rank is not an XP level. The two meet in two places: reaching XP levels unlocks achievements in the Community category, and achievements can give XP back through a per achievement XP reward or **XP per point** on the achievements Settings tab. Both are off until you set them.

## Boost events

`xpboost <time> <multiplier> <name>` starts a timed event, for example `xpboost 2h 2.0 Weekend XP Event`. Every active boost multiplies message and voice XP on top of the other multipliers. `xpboosts` lists what is running and `cancelboost <id>` stops one early.

On the dashboard, the **Boosts** list in the **Multipliers** card shows each boost with its multiplier, end time and scope, and **New boost** opens a form with **Name**, **Multiplier** (above 1), **Lasts** with a **Unit** (Minutes, Hours or Days), **Only in channels** (default Everywhere) and **Only for roles** (default Everyone). **Start boost** creates it. A boost's menu has **Cancel boost**. Limiting a boost to channels or roles is only possible on the dashboard.

## Competitions

`xpcompetition <time> <type> [targetLevel] [name]` starts a timed race. Members are entered automatically the first time they gain XP while it runs.

| Type | Winner |
| --- | --- |
| `MostGained` | Whoever gained the most XP during the competition |
| `ReachLevel` | Whoever reaches the target level first |
| `HighestTotal` | Whoever has the highest total XP when it ends |

Add prizes with `addcompetitionreward <id> <position> <type> <reward>` where the type is `Role`, `XP` or `Currency`. Role rewards are granted and XP rewards are added as bonus XP. Currency is paid through the currency module. `competitionleaderboard <id>` shows standings, and `endcompetition <id>` ends early and distributes rewards.

The **Competitions** card does the same on the dashboard. **New competition** takes a **Name**, a **Type** (Most gained, First to level or Highest total), **Lasts** with a **Unit** (Hours or Days), a **Target level** for First to level, **Announce in** and **Rewards**. Each reward is a **Place** with a **Role**, **XP** and **Currency** amount, and **Add reward** adds another place. **Start competition** creates it. Each row shows its end time, member count and prizes, and its menu has **Standings** and **End now**, which asks for confirmation before it hands out rewards.

## Exclusions

`xpexclude` and `xpinclude` accept a user, a role or a text channel. Excluded users and anyone holding an excluded role never earn XP; excluded channels earn nothing for anyone. This applies to voice channels too. `xpexcludelist users|roles|channels` shows the lists. The slash versions are `/xp admin exclude`, `/xp admin include` (pass a `user`, `role` or `channel` option) and `/xp exclude-list`. The **Excluded from XP** card has **Channels**, **Roles** and **Members** lists, each with a picker and an **Exclude** button, and a button on every entry to include it again. The switch on the **XP gain** card turns XP gain off for the whole server at once.

## Rank cards

`rank [@user]` renders a PNG card. `textrank [@user]` gives the same information as text for screen readers. Bots have no rank.

The card is built from the server's template: a background image and layers for the user's avatar and name, the progress bar, server level, server rank, time on the current level, and awarded bonus XP. Each layer can be shown or hidden, moved, resized and recoloured, and the progress bar can be rounded, segmented or radial and fill in any direction. Custom text and line layers can be added too.

The **Rank card** card shows a live preview. **Edit card** opens the visual editor, with **Save card** and **Discard changes** when you are done. On screens narrower than 768 pixels the dashboard switches to a touch editor with the same layers, a bottom sheet for properties and simple position and size controls. On wider screens you get the full editor with a layer list, grid, snap, rulers, undo and redo, and zoom.

The **Backgrounds** group under the preview offers preset backgrounds with **Use** and an **Image URL** field for your own. **Remove background** clears it.

### Member designs

Besides the server template, members can wear a design of their own. A design is a background for the rank card that is free for everyone, sold in the shop, or unlocked by a level, an achievement or a role. The **Member designs** card links to the **Designs** tab of the Currency page, where you create them. Members see a card's owned designs with `designs`, wear one with `equip <design>` and drop it with `unequipdesign rank`. The slash versions are `/xp designs`, `/xp equip` and `/xp unequip`. The community default design applies to members who have not equipped one. See [Designs](/wiki/designs).

## Leaderboard

`leaderboard [page]` shows the server ranking. If the server also uses the currency module and currency is in circulation, a bare `leaderboard` asks whether you meant XP or currency; naming a page always means XP. The dashboard's **Leaderboard** card shows the same ranking, ten members per page. Each row has a menu with **Add XP** (**XP to add**), **Set XP** (**New total XP**) and **Reset XP**, and **Also reset bonus XP** clears bonus XP as well.

## Settings

The Levels page has no tabs. It is one page of cards, in this order: **Overview**, **XP gain**, **Level-ups**, **Rewards**, **Multipliers**, **Competitions**, **Excluded from XP**, **Rank card**, **Leaderboard** and **Import and export**. Changes save as you make them.

The **Overview** card shows **Members**, **Total XP**, **Average level**, **Highest level** and **Recent activity**.

The **XP gain** card has a switch that turns XP gain on or off for the whole server.

| Setting | Default | What it controls |
| --- | --- | --- |
| XP per message | 3 | Base XP per message, 1 to 50 |
| Message cooldown (seconds) | 60 | Minimum gap between message XP awards per member |
| Server multiplier | 1 | Multiplies every gain, at least 0.1 |
| Level curve | Default | Which curve maps XP to levels. Changing it recalculates every member's level |
| Voice XP per minute | 2 | In the **Voice XP** group. Base XP per eligible voice minute, maximum 10; 0 disables voice XP |
| Voice timeout (minutes) | 60 | In the **Voice XP** group. Most minutes one voice session can be paid for |

The **Level-ups** card holds **Level-up channel** ("Where the member is chatting" when empty), **Only announce reward levels**, **Announce every Nth level**, **Lowest level to announce**, a **Level-up message** editor, the **Custom messages** group where you add, enable, disable and remove the messages the bot picks from, and **Recent level-ups**.

The **Multipliers** card holds **Channel multipliers**, **Role multipliers** (a **Multiplier** of at least 0.1 per channel or role) and **Boosts**.

The **Import and export** card has **Import from another bot**, which opens the import page, and **Export XP**. Its **Danger zone** group has **Also reset bonus XP** and **Reset all XP**, which sets every member back to zero and cannot be undone.

These fields exist in the XP settings record but are set by command only: `FirstMessageBonus` and the decay fields `EnableXpDecay`, `InactivityDaysBeforeDecay` and `DailyDecayPercentage`.

## Setup walkthrough

1. Open **Levels** in the dashboard and check the switch on **XP gain** is on.
2. In **XP gain**, leave the message and voice values at their defaults to start and pick a **Level curve**.
3. In **Excluded from XP**, exclude bot command channels and any muted or bot roles.
4. In **Rewards**, add a role reward for a few milestone levels. Make sure the bot's role sits above those roles.
5. In **Level-ups**, pick a **Level-up channel** and add one or two custom messages. Test a template in Discord with `testlevelupmessage`.
6. In **Rank card**, press **Edit card**, set a background and lay out the card, then **Save card**. Run `rank` to see the result.

## Commands

Run these with your server's prefix (`.` unless you changed it).

| Command | Aliases | Needs | Purpose |
| --- | --- | --- | --- |
| `rank [@user]` | | Nobody | Show a rank card |
| `textrank [@user]` | | Nobody | Rank information as text |
| `designs` | | Nobody | Card designs you can wear |
| `equip <design>` | | Nobody | Wear a card design you own or that is free |
| `unequipdesign <rank\|achievement>` | | Nobody | Stop wearing your design for that card |
| `leaderboard [page]` | `lb` | Nobody | Server XP ranking |
| `levelnotif <None\|Channel\|Dm>` | `lvlnotif` | Nobody | Choose how you are told about level-ups |
| `leveluppings <true\|false>` | `lvluppings` | Nobody | Whether level-up messages may mention you |
| `xpsettings` | `xpconfig` | Manage Server | Show the current XP settings |
| `setmessagexp <amount>` | `setmsgxp` | Manage Server | XP per message |
| `setxpcooldown <seconds>` | `xpcd` | Manage Server | Message XP cooldown |
| `setvoicexp <amount>` | | Manage Server | Voice XP per minute |
| `setvoicetimeout <minutes>` | | Manage Server | Voice session cap |
| `setxpmultiplier <number>` | `xpmult` | Manage Server | Global multiplier |
| `setxpcurve <type> [recompute]` | | Manage Server | Change the level curve |
| `setxpexclusive <true\|false>` | `xpexclusive`, `exclusivexp`, `setxpexcl`, `xpexcl` | Manage Server | Keep only the highest reward role |
| `setchannelxp <#channel> <number>` | | Manage Server | Channel multiplier |
| `setrolexp <role> <number>` | | Manage Server | Role multiplier |
| `addxp <@user> <amount>` | | Manage Server | Add XP to a member |
| `setxp <@user> <amount>` | | Manage Server | Set a member's XP |
| `resetxp <@user> [resetBonus]` | | Manage Server | Reset a member's XP to zero |
| `resetxp` | | Administrator | Reset XP for the whole server |
| `xpboost <time> <multiplier> <name>` | | Manage Server | Start a boost event |
| `xpboosts` | | Nobody | List active boosts |
| `cancelboost <id>` | | Manage Server | End a boost early |
| `xpexclude <@user\|role\|#channel>` | | Manage Server | Exclude from XP |
| `xpinclude <@user\|role\|#channel>` | | Manage Server | Remove an exclusion |
| `xpexcludelist [users\|roles\|channels]` | | Nobody | Show exclusions |
| `rolereward <level> <role>` | `rr` | Manage Roles | Add a role reward |
| `removerolereward <level>` | `removerr` | Manage Roles | Remove a role reward |
| `rolerewards` | | Nobody | List role rewards |
| `currencyreward <level> <amount>` | `cr` | Manage Server | Add a currency reward |
| `removecurrencyreward <level>` | `removecr` | Manage Server | Remove a currency reward |
| `currencyrewards` | | Nobody | List currency rewards |
| `xpcompetition <time> <type> [targetLevel] [name]` | | Manage Server | Start a competition |
| `addcompetitionreward <id> <position> <Role\|XP\|Currency> <reward>` | | Manage Server | Add a placement prize |
| `xpcompetitions` | | Nobody | List active competitions |
| `competitionleaderboard <id>` | `complb` | Nobody | Competition standings |
| `endcompetition <id>` | | Manage Server | End a competition and pay out |
| `syncallxproles` | | Administrator | Re-apply reward roles to everyone (once per hour) |
| `syncmyxproles` | | Nobody | Re-apply your own reward roles (once per five minutes) |
| `syncuserxproles <@user>` | | Manage Roles | Re-apply one member's reward roles |
| `levelupchannel [#channel]` | `lvlupchan` | Manage Server | Where channel notifications go; no channel means the current one |
| `levelupinterval <number>` | `lvlupint` | Manage Server | Announce every Nth level |
| `levelupminlevel <level>` | `lvlupmin` | Manage Server | Lowest level to announce |
| `leveluprewardsonly <true\|false>` | `lvluprewards` | Manage Server | Only announce reward levels |
| `leveluplog` | `lvluplog` | Manage Server | Show the last 25 level-ups |
| `addlevelupmessage <text or embed JSON>` | `addlvlupmsg` | Manage Server | Add a custom level-up message |
| `levelupmessages` | `lvlupmsgs` | Manage Server | List custom messages with IDs |
| `removelevelupmessage <id>` | `remlvlupmsg` | Manage Server | Delete a custom message |
| `togglelevelupmessage <id> <true\|false>` | `togglelvlupmsg` | Manage Server | Enable or disable one message |
| `testlevelupmessage [template]` | `testlvlupmsg` | Manage Server | Preview a template, or a random saved one |
| `levelupplaceholders` | `lvlupplaceholders` | Manage Server | List the placeholders above |

Slash equivalents live under `/xp`, with the staff commands grouped as `/xp admin` (add, set, reset, exclude, include, role syncs), `/xp config` (rates, multipliers, curve, exclusive), `/xp rewards`, `/xp boost`, `/xp competition` and `/xp levelup`. Members also get `/xp designs`, `/xp equip` and `/xp unequip`. `/xp admin reset` with no user resets XP for the whole server; it needs Administrator and `confirm: true`.

## Tips and gotchas

- Role rewards and role syncs need the bot to have Manage Roles, and its highest role must be above every reward role. `syncallxproles` and `syncuserxproles` refuse to run without it.
- Voice XP needs at least two unmuted, undeafened humans in the channel. A member sitting alone or muted earns nothing, however long they stay.
- XP gains are batched and written in the background, so `rank` can lag a few seconds behind the last message.
- Lowering someone's XP with `setxp` or `resetxp` can drop their level, which removes reward roles and claws back currency rewards for the lost levels.
- The `Custom` curve behaves exactly like Standard and is not offered on the dashboard. Pick Legacy only if you are migrating from an older setup and want existing levels to line up.
- Custom level-up messages replace the default embed entirely. If every custom message is disabled, the default embed comes back.
- Boosts and competitions can be managed from the **Multipliers** and **Competitions** cards or by command. Only the dashboard can limit a boost to channels or roles.
- The **Level-up message** editor stores a server message template. The bot announces with one of the enabled **Custom messages** at random, or the default embed when there are none.
