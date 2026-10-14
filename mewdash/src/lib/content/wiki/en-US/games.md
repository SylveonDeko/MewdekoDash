---
title: Games
slug: games
summary: Chat games members can start in any channel, from trivia, hangman and word chains to typing races, acrophobia and polls.
icon: fa-gamepad-modern
category: Entertainment
module: Games
tags: [games, trivia, hangman, kaladont, nunchi, typing race, acrophobia, tic tac toe, poll, vote, 8ball, choose]
related: [polls, currency, xp, searches, utility]
---

## What it does

Games are played in the channel where they are started. A member runs a command, the bot posts the game, and everyone in the channel plays by typing answers or pressing buttons. Only one game of each kind runs per channel (or per server for Nunchi and Kaladont) at a time, and most games can be stopped early with a matching stop command.

Trivia, hangman, Kaladont, Nunchi, the typing race, acrophobia and tic-tac-toe are multiplayer. Polls let staff put a question to the channel with buttons or a dropdown. `choose` and `8ball` are one-off toys.

There is no dashboard page for this module. Everything is done with commands, and most of them need no permission at all.

## Why you would use it

- Break up a quiet evening with a round of trivia or hangman.
- Run a typing race or Kaladont tournament as a community event.
- Ask the server a quick yes or no question, or a multi-option poll with a dropdown.
- Set up a permanent Kaladont channel so the word chain never stops.

## Trivia

`trivia` starts a quiz. The bot posts a question, shows a hint halfway through the question timer unless hints are off, and the first member to type the answer gets a point. When a member reaches the win requirement the game ends and they win. If enough questions in a row go unanswered, the game stops.

| Option | Default | What it does |
| --- | --- | --- |
| `-p`, `--pokemon` | off | "Who's that Pokemon?" mode |
| `--nohint` | off | Never show hints |
| `-w`, `--win-req` | 10 | Points needed to win; 0 for an endless game |
| `-q`, `--question-timer` | 30 | Seconds per question |
| `-t`, `--timeout` | 10 | Unanswered questions in a row before the game stops; 0 for never |

`tl` shows the current scores and `tq` stops the game. The bot's global config can set a minimum win requirement and a currency prize for the winner.

> [!EXAMPLE]
> `trivia -w 5 -q 20` runs a short game to five points with twenty seconds per question.

## Hangman

`hangman [type]` picks a word from a category and shows it as blanks. Members guess a single letter, or the whole word, by typing it in the channel. Six wrong guesses lose the game. The categories are `countries`, `movies`, `animals`, `things` and `random`; `random` is the default. `hangmanlist` shows the types available on your server and `hangmanstop` ends the game.

## Kaladont

Kaladont is a word chain. Each word must start with the last two letters of the previous word, and a word can only be used once per game. Players take turns, with a time limit per turn. The dictionary can be English or Serbian, and Serbian digraphs (such as lj and nj) are treated as single letters.

| Option | Default | What it does |
| --- | --- | --- |
| `-j`, `--join-time` | 15 | Seconds for players to join before the game starts |
| `-t`, `--turn-time` | 30 | Seconds per turn |
| `-m`, `--min-players` | 2 | Players needed to start |
| `-l`, `--language` | en | `en` or `sr` |
| `-e`, `--endless` | off | Rejects words that leave no valid word for the next player |

`kaladontstop` ends the current game. `kaladontsetup` turns the current channel into a persistent Kaladont channel that keeps the chain going, with the same language and endless flags, and `kaladontdisable` removes it. Both need Manage Channels.

## Nunchi

`nunchi` creates a game, and other members run `nunchi` to join while it is in the joining phase. Each round the bot announces a number and every player must type the next number. Players who type it correctly pass; when all but one have passed, the round ends and the remaining player is knocked out. If nobody answers in time the round is restarted with everyone who has already passed. The last player standing wins.

## Typing race

`typestart` counts down (five seconds by default, `-s` or `--start-time` sets 3 to 30) and then posts a sentence. The first member to type it back closely enough wins; a few typos are tolerated, roughly one per 25 characters. The result shows words per minute and error count. `typestop` ends a race, `typelist` shows the sentence pool, and bot owners can add or delete sentences with `typeadd` and `typedel`.

## Acrophobia

`acrophobia` posts three to five random letters. Members have the submission time (default 60 seconds, 15 to 300) to send a phrase whose words start with those letters in order, one submission each. Then everyone votes for their favourite by number during the vote time (default 60 seconds, 15 to 120). You cannot vote for your own entry. Set the timers with `-s` or `--submission-time` and `-v` or `--vote-time`.

## Tic-tac-toe

`tictactoe` opens a game; the next member to run it joins as the second player. Turns are made in chat, and a player who takes longer than the turn timer (default 15 seconds, `-t` or `--turn-timer`, 5 to 60) forfeits. The game reports a winner or a draw.

## Polls

Polls need Manage Messages to create. Options are separated with semicolons.

| Command | Type | Behaviour |
| --- | --- | --- |
| `poll <question>` | Yes/No | Two buttons |
| `pollc question;option1;option2;...` | Single choice | One vote per member |
| `pollm question;option1;option2;...` | Multiple choice | Members can pick several options |
| `polla question;option1;option2;...` | Anonymous | Voter identities are hidden |

Polls with two to five options use buttons; longer ones use a dropdown with up to 25 entries. Members can change their vote. Templates save a question and its options for reuse: `polltemplates` lists them and `polltemplate <name>` posts one. Creating and deleting templates, closing a poll, listing active polls and viewing a poll's statistics are done with the `/poll` slash commands (`create-template`, `delete-template`, `close`, `list`, `stats`) or on the Polls dashboard page, which has its own article.

## Other

- `choose a; b; c` picks one option at random from a semicolon list.
- `8ball <question>` answers from a list of responses in the bot's games config.
- `linux <word> <word>` posts the "I'd just like to interject" copypasta with the two names swapped.
- `dragon` toggles your beta-tester flag, which some experimental commands check.
- `rategirl` exists only as a stub with a note about why it was removed. It does nothing useful.

## Settings

This module has no dashboard page and no per-server settings. Game behaviour is set with the command options above. The bot owner's `games.yml` config holds the 8ball responses and the trivia minimum win requirement and currency reward.

## Setup walkthrough

1. Pick a channel for games, or make one, so game messages do not drown out conversation.
2. If you want a permanent word chain, run `kaladontsetup -l en` in that channel.
3. Run `trivia` or `hangman` to check the bot can send messages and read replies there.
4. Give staff Manage Messages if you want them to run polls.

## Commands

Run these with your server's prefix (`.` unless you changed it).

| Command | Aliases | Needs | Purpose |
| --- | --- | --- | --- |
| `trivia [options]` | `t` | Nobody | Start trivia |
| `tl` | | Nobody | Trivia scores |
| `tq` | | Nobody | Stop trivia |
| `hangman [type]` | | Nobody | Start hangman |
| `hangmanlist` | | Nobody | List hangman types |
| `hangmanstop` | | Nobody | Stop hangman |
| `kaladont [options]` | `kal` | Nobody | Start Kaladont |
| `kaladontstop` | `kalstop` | Nobody | Stop Kaladont |
| `kaladontsetup [options]` | `kalsetup` | Manage Channels | Make this a persistent Kaladont channel |
| `kaladontdisable` | `kaldisable` | Manage Channels | Remove the persistent channel |
| `nunchi` | | Nobody | Create or join Nunchi |
| `typestart [options]` | | Nobody | Start a typing race |
| `typestop` | | Nobody | Stop the race |
| `typelist [page]` | | Nobody | List race sentences |
| `typeadd <text>` | | Bot owner | Add a sentence |
| `typedel <index>` | | Bot owner | Delete a sentence |
| `acrophobia [options]` | `acro` | Nobody | Start acrophobia |
| `tictactoe [options]` | `ttt` | Nobody | Start or join tic-tac-toe |
| `poll <question>` | `ppoll` | Manage Messages | Yes/no poll |
| `pollc <question;options>` | | Manage Messages | Single-choice poll |
| `pollm <question;options>` | | Manage Messages | Multiple-choice poll |
| `polla <question;options>` | | Manage Messages | Anonymous poll |
| `polltemplates` | `ptemplates` | Nobody | List poll templates |
| `polltemplate <name>` | `ptemplate` | Manage Messages | Post a poll from a template |
| `choose <a; b; c>` | | Nobody | Pick one at random |
| `8ball [question]` | `eightball` | Nobody | Magic 8-ball |
| `linux <word> <word>` | | Nobody | The interjection copypasta |
| `dragon` | | Nobody | Toggle your beta flag |
| `rategirl` | | Nobody | Stub, does nothing |

## Tips and gotchas

- Games read replies from the channel, so the bot needs Read Message History and Send Messages there, and it must not be blocked by a channel permission rule.
- Trivia, hangman and Kaladont answers are ordinary messages. If you also run message counting or XP, those messages count.
- Only one trivia, hangman, typing or Kaladont game can run per channel; the start command tells you if one is already going.
- Poll options longer than 100 characters are cut short in the dropdown.
- Nunchi eliminates the slowest player each round, so a large group can take a while to finish.
