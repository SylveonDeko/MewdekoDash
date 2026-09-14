---
title: Currency
slug: currency
summary: A per-server economy with wallets and a bank, daily rewards, work and crime, a role and item shop, and more than twenty betting games, all tunable from the dashboard.
icon: fa-money-bill
category: Entertainment
dashboard: /dashboard/currency
module: Currency
tags: [currency, economy, money, coins, shop, balance, bank, daily, work, crime, rob, pay, gambling, blackjack, roulette, slots, leaderboard]
related: [xp, administration]
---

## What it does

Every member has a wallet and, if you leave the bank on, a bank balance. They earn currency by claiming a daily reward, running `work` and `crime` on cooldowns, winning games or being paid by other members. They spend it in your shop on roles, collectibles or text items, or wager it in games such as blackjack, roulette, slots, crash and keno.

Staff decide how the economy behaves: whether gambling is on, bet limits, a house edge, how much work and crime pay, whether robbery exists, transfer tax, bank interest and daily streak bonuses. Every one of these is a setting on the **Configuration** tab or an `economyset` key, so you can tune the economy without touching the games.

The bot records every credit and debit as a transaction, so members can see where their money went and the **Analytics** tab can show you the money supply, where it sits, and which games are paying out more than they take in.

## Why you would use it

- Give active members something to spend engagement on: a coloured role, a custom title, or a bit of fun in a games channel.
- Run a games channel that stays fair because bet limits, a daily loss limit and a house edge are enforced for you.
- Reward members with `modifybalance` or the **Adjust a balance** tool for helping out, and let them choose from the shop.
- Watch the **Game performance** table to see the real return of each game and tune `payoutmultiplier` from data rather than guesswork.

## Balances, bank and transfers

`cash` shows your wallet, and your bank and net worth if you have anything banked. `bank` shows the same for any member and also collects any interest you are owed. `deposit` and `withdraw` move money between the two; `all` works as an amount. Banked money cannot be robbed, and a **Bank capacity** caps how much can be stored (0 means unlimited).

Interest is paid when a member runs `bank`: if the interval since their last interest payment has passed, the bank balance earns **Interest (%)** once. It is not paid while nobody checks.

`pay` sends wallet currency to another member, minus **Transfer tax (%)**, with a **Minimum transfer** and an optional cooldown. Bots cannot be paid.

`transactions` lists the last 250 entries for you or another member, ten per page. `cashleaderboard` ranks members by wallet plus bank.

## Earning

| Command | Default | What happens |
| --- | --- | --- |
| `dailyreward` | Not set until staff run `setdaily` | Credits the daily amount once per cooldown. With streaks on, each consecutive claim adds **Bonus per day** times the days in the streak beyond the first, capped by **Maximum bonus**. Missing a full cooldown window resets the streak. |
| `work` | 50 to 250, every 30 minutes | A random payout in the configured range, always succeeds. |
| `crime` | 200 to 800, 45% success, every hour | On success pays the crime range. On failure charges a fine of 100 to 500, limited to what is in the wallet. |
| `rob @user` | Off | When enabled: 35% chance to take up to 20% of the target's wallet. Targets holding under 100 are protected. Failure costs 15% of your own wallet. One attempt per hour. |

## Games

Every wager goes through the same checks: gambling must be on, the bet must sit between **Minimum bet** and **Maximum bet**, the member must not have hit the **Daily loss limit** in the last 24 hours, and the game cooldown (if any) must have passed. The stake is taken up front. Winnings are `stake plus profit`, and the profit part is scaled by **Payout multiplier**, so a multiplier of 0.9 trims every win by ten percent while a push still refunds the full stake.

| Game | How it pays |
| --- | --- |
| `coinflip <bet> heads/tails` | Even money on a correct call |
| `highlow higher/lower [bet]` | A number from 1 to 10 is shown; call the next one. Even money, a matching number refunds the stake. Default bet 100 |
| `spinwheel [bet]` | Weighted wheel with segments from minus 10 percent to plus 30 percent of the bet. Default bet 10 |
| `blackjack <bet>`, then `hit` and `stand` | Dealer draws to 17. Even money on a win, push on a tie |
| `slot [bet]` | Two matching symbols pay 2x. Three matching pay 3x, grapes 5x, sevens 7x, diamonds 10x. Default bet 10 |
| `roulette <bet> <type>` | A number from 0 to 36 pays 35 to 1. `red`, `black`, `even` or `odd` pay even money; zero loses colour and parity bets |
| `rps <choice> [bet]` | Rock, paper, scissors, lizard, Spock against the bot. Even money, ties refund. Bet is optional |
| `war <bet>` | High card wins even money. A tie takes a second stake and plays one more card for double |
| `craps <bet> [pass/dontpass/field/any]` | Pass and don't pass follow the point rules at even money. Field pays even, or 2x on 2 or 12. Any seven pays 4x |
| `scratchcard [bronze/silver/gold/diamond]` | Fixed cost cards of 10, 50, 200 or 1000 with 30, 25, 20 and 15 percent win chances and prize ranges up to 50, 200, 1000 and 5000 |
| `russianroulette <bet> [bullets]` | One to five bullets in six chambers. Surviving pays 1.2x, 1.5x, 2x, 3x or 5x profit by bullet count |
| `baccarat <bet> [player/banker/tie]` | Player or banker pay 1.95x, tie pays 8x |
| `minesweeper <bet> [small/medium/large]` | 70, 60 or 50 percent survival for 1.5x, 2.5x or 4x |
| `lottery [tickets]` | Tickets cost 50 each, up to 10. More tickets raise the win chance (max 40%) and the prize multiplier |
| `crash <bet> [target]` | Pick a cash-out target from 1.1x to 10x. You win the target if the crash point is at or above it |
| `keno <bet> <numbers>` | Pick 1 to 10 numbers from 1 to 80; 20 are drawn. Payouts run from 3x for one of one up to 800x for five of five |
| `plinko <bet> [rows]` | 5 to 10 rows. Landing in the centre pays 0.5x, edges pay up to 10x |
| `wheelfortune <bet> [classic/risky/balanced]` | Wheels of multipliers; risky ranges from 0.1x to 20x |
| `duckrace <bet>` | Five ducks, yours is random. First pays 4x, second 2x, third 1.2x |
| `bingo <bet> [small/large]` | 40% chance at 2x, or 25% chance at 3.5x |
| `diceduel @user <bet>` | The opponent gets accept and decline buttons; both must be able to cover the bet |
| `memory <bet> [easy/medium/hard]` | Repeat a sequence of 4, 6 or 8 for 1.5x, 2x or 3x |
| `horserace <bet>` | Up to ten members join within ten seconds; AI racers fill empty spots. The pool pays 50, 30 and 20 percent to the top three |
| `triviachain <bet> [category]` | Answer OpenTDB questions in a row; each correct answer raises the multiplier by 0.5x. Categories: general, science, history, sports, entertainment |

> [!NOTE]
> `horserace` accepts any positive bet: it takes the stake directly and does not apply the shared bet limits or the payout multiplier.

## Daily challenges

Each member gets one random challenge per day: play five games, win three, spend 500, earn 300, or play a named game three times. The reward is the base amount plus up to 50 extra. `dailychallenge` shows it, `claimchallenge` pays it, and `challengeleaderboard` ranks the top ten by challenges completed in the last 30 days.

> [!WARNING]
> Games do not currently report progress to the challenge tracker, so challenges show 0 progress and cannot be claimed yet.

## The shop

Items live on the **Shop** tab or come from `shopadditem` and `shopaddrole`. Each item has a **Name**, **Price**, **Description**, **Type**, **Stock** (blank or -1 for unlimited), **Limit per user**, an optional **Required role** the buyer must hold, and a **Sort order**.

| Type | On purchase |
| --- | --- |
| Role | The bot adds the role to the buyer. Defaults to one per member. |
| Collectible | Goes into the buyer's inventory; consumable, so `use` removes one. |
| Text | The **Delivered text** is sent to the buyer by DM, and again on `use`. |

`buy <name>` checks the item is enabled, the buyer has the required role, stock remains, they can afford it and they are under the per-user limit. Any failure after payment refunds automatically. `inventory` lists what a member owns. `shoptoggle` hides an item without deleting anyone's copies; `shopremove` deletes it and every copy.

## Placeholders

These currency placeholders are available in chat trigger responses and other places that use trigger placeholders.

| Placeholder | Value |
| --- | --- |
| `%currency.balance%` | The user's wallet |
| `%currency.bank%` | The user's bank balance |
| `%currency.total%` | Wallet plus bank |
| `%targetuser.currency.balance%` | The target user's wallet |
| `%targetuser.currency.bank%` | The target user's bank balance |
| `%currency.emote%` | The server's currency emote |

## Settings

The dashboard has four tabs: **Analytics**, **Configuration**, **Shop** and **Leaderboard**. The **Leaderboard** tab also holds **Adjust a balance**, which credits or debits a member with a reason recorded on the ledger.

| Setting | Default | What it controls |
| --- | --- | --- |
| Enable gambling | On | Turns every wagering game on or off |
| Minimum bet | 1 | Smallest stake |
| Maximum bet | 0 (unlimited) | Largest stake |
| Payout multiplier | 1.0 | Scales winnings only, 0.1 to 5.0 |
| Daily loss limit | 0 (off) | Cuts a member off after losing this much in 24 hours |
| Game cooldown (seconds) | 0 | Seconds between wagers per member |
| Enable work | On | The `work` command |
| Work minimum / maximum | 50 / 250 | Work payout range |
| Work cooldown | 1800 seconds | `workcooldown`, command only |
| Enable crime | On | The `crime` command |
| Crime minimum / maximum | 200 / 800 | Crime payout range |
| Crime success chance (%) | 45 | Chance a crime pays |
| Crime fine minimum / maximum | 100 / 500 | Fine on failure |
| Crime cooldown | 3600 seconds | `crimecooldown`, command only |
| Enable bank | On | `bank`, `deposit`, `withdraw` |
| Bank capacity | 0 (unlimited) | Most a member can bank |
| Interest (%) | 0 | Paid per interval on the banked balance |
| Interest interval (hours) | 24 | How often interest can be collected |
| Enable transfers | On | The `pay` command |
| Transfer tax (%) | 0 | Taken from each payment |
| Minimum transfer | 1 | Smallest payment |
| Pay cooldown | 0 | `paycooldown`, command only |
| Enable robbery | Off | The `rob` command |
| Success chance (%) | 35 | Chance a robbery works |
| Maximum steal (%) | 20 | Share of the target's wallet a success can take |
| Failure fine (%) | 15 | Share of the robber's wallet lost on failure |
| Protected below | 100 | Targets with less cannot be robbed |
| Rob cooldown | 3600 seconds | `robcooldown`, command only |
| Enable streaks | On | Consecutive daily claims earn a bonus |
| Bonus per day | 0 | Added per consecutive day beyond the first |
| Maximum bonus | 0 (uncapped) | Cap on the streak bonus |

The daily reward amount and its cooldown are set with `setdaily`, not on the dashboard. `economyconfig` prints every key with its current value, and `economyreset` restores all defaults.

## Setup walkthrough

1. Run `setdaily 500 24h` so members have something to claim.
2. Open **Currency** in the dashboard and go to **Configuration**. Set **Maximum bet** and a **Daily loss limit** before opening a games channel.
3. Turn on **Enable robbery** only if your members are fine with losing wallet money; leave the bank on so they can protect it.
4. On **Shop**, add a couple of role items and a collectible. Set a **Required role** on anything that should be members-only.
5. Give a few members a starting balance with **Adjust a balance** or `modifybalance`.
6. After a week, check **Analytics** and lower **Payout multiplier** if the games are paying out more than they take.

## Commands

Run these with your server's prefix (`.` unless you changed it).

| Command | Aliases | Needs | Purpose |
| --- | --- | --- | --- |
| `cash` | `$`, `$$`, `$$$`, `currency`, `cur` | Nobody | Your wallet, bank and net worth |
| `bank [@user]` | | Nobody | Balances for a member, and collects your interest |
| `deposit <amount/all>` | | Nobody | Wallet to bank |
| `withdraw <amount/all>` | | Nobody | Bank to wallet |
| `pay @user <amount>` | | Nobody | Send currency, minus tax |
| `transactions [@user]` | `txs` | Nobody | Last 250 ledger entries |
| `cashleaderboard` | `cashlb`, `richest` | Nobody | Richest members by net worth |
| `dailyreward` | `daily` | Nobody | Claim the daily reward |
| `work` | | Nobody | Earn a work payout |
| `crime` | | Nobody | Risky payout or a fine |
| `rob @user` | | Nobody | Try to steal from a wallet |
| `dailychallenge` | `dc` | Nobody | Show today's challenge |
| `claimchallenge` | `claimch` | Nobody | Claim a completed challenge |
| `challengeleaderboard` | `chlb` | Nobody | Top challenge completers |
| `shop` | | Nobody | Browse the shop, eight items per page |
| `buy <item>` | | Nobody | Buy an item |
| `inventory [@user]` | | Nobody | Items a member owns |
| `use <item>` | | Nobody | Use up one consumable |
| `coinflip <bet> <heads/tails>` | `flip` | Nobody | See games |
| `highlow <higher/lower> [bet]` | | Nobody | See games |
| `spinwheel [bet]` | `wheel` | Nobody | See games |
| `blackjack <bet>` | `bj` | Nobody | Start or join blackjack |
| `hit` | | Nobody | Draw a card |
| `stand` | | Nobody | End your turn |
| `slot [bet]` | `slots` | Nobody | See games |
| `roulette <bet> <type>` | | Nobody | See games |
| `rps <choice> [bet]` | | Nobody | See games |
| `war <bet>` | | Nobody | See games |
| `craps <bet> [type]` | | Nobody | See games |
| `scratchcard [type]` | `scratch` | Nobody | See games |
| `russianroulette <bet> [bullets]` | `rroulette` | Nobody | See games |
| `baccarat <bet> [type]` | | Nobody | See games |
| `minesweeper <bet> [size]` | `mines` | Nobody | See games |
| `lottery [tickets]` | | Nobody | See games |
| `crash <bet> [target]` | | Nobody | See games |
| `keno <bet> <numbers>` | | Nobody | See games |
| `plinko <bet> [rows]` | | Nobody | See games |
| `wheelfortune <bet> [wheel]` | `wof` | Nobody | See games |
| `duckrace <bet>` | `duck` | Nobody | See games |
| `bingo <bet> [card]` | | Nobody | See games |
| `diceduel @user <bet>` | `dd` | Nobody | Challenge a member |
| `memory <bet> [difficulty]` | | Nobody | See games |
| `horserace <bet>` | `hr` | Nobody | Join or start a race |
| `triviachain <bet> [category]` | `tchain` | Nobody | See games |
| `setdaily <amount> <time>` | | Administrator | Daily reward amount and cooldown, for example `setdaily 500 24h` |
| `modifybalance @user <amount> [reason]` | `modbal` | Bot owner on global currency; otherwise as set by a command permission override | Add or remove currency; negative amounts debit |
| `economyconfig` | | Administrator | Show every economy setting |
| `economyset <setting> <value>` | | Administrator | Change one setting by key |
| `economyreset` | | Administrator | Restore all defaults |
| `economystats` | | Nobody | Size and concentration of the money supply |
| `economyflow [days]` | | Nobody | Where currency entered and left circulation, default 7 days |
| `gamestats [days]` | | Nobody | Return to player per game, default 7 days |
| `shopadditem <price> <name>` | | Administrator | Add a consumable collectible with unlimited stock |
| `shopaddrole <price> @role <name>` | | Administrator, bot needs Manage Roles | Add a role item, one per member |
| `shopremove <name>` | | Administrator | Delete an item and every copy |
| `shopprice <price> <name>` | | Administrator | Change a price |
| `shopstock <stock> <name>` | | Administrator | Set remaining stock |
| `shopdesc <name> \| <description>` | | Administrator | Set the description |
| `shoptoggle <name>` | | Administrator | Show or hide an item |

## Tips and gotchas

- Set **Maximum bet** before anything else. With it at 0 one lucky member can drain the economy in an afternoon.
- The daily loss limit counts net losses over the previous 24 hours, so a member who wins early can keep playing longer.
- Role items need the bot's highest role above the role being sold and Manage Roles, or the purchase fails after payment with a role grant error.
- Text items and `use` deliver by DM; members with DMs closed see an error but still own the item.
- Blackjack keeps one game per member in memory; `hit` and `stand` only work after `blackjack`.
- Horse races wait ten seconds for other members, then fill the field with AI racers and run.
- Trivia chain games time out after ten minutes of inactivity, and a member can only have one running at a time.
- When the bot is hosted with global currency, balances are shared across every server and `modifybalance` is owner-only.
