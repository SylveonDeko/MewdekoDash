---
title: Word of the Day
slug: wordoftheday
summary: Posts one vocabulary word a day with its definition, pronunciation, and an example, picked from a dictionary by topic and difficulty or from a list the server writes itself.
icon: fa-book-open
category: Community
dashboard: /dashboard/wordoftheday
module: WordOfTheDay
tags: [word of the day, wotd, vocabulary, dictionary, definition, daily, datamuse, topic, schedule]
related: [birthday, utility]
---

## What it does

Once a day, at an hour the server picks in its own timezone, the bot posts a word in a chosen channel. The post shows the word, how it is pronounced, its part of speech, a definition, and an example sentence when one exists. A role can be pinged with every post.

Words come from the Datamuse dictionary and are filtered by three settings: a **topic** the words should lean toward, a **part of speech**, and a **difficulty** based on how often the word appears in written English. The bot avoids repeating anything it has posted in the last ninety days.

Servers can also build a **custom list** with `wotdadd`. If a definition is left out, the bot looks one up. The **source mode** decides whether posts come from the dictionary, the custom list, or the custom list first and the dictionary once it runs out.

## Scheduling by weekday or month

Rules can override the topic, part of speech, and difficulty for a specific weekday or month. A rule only changes the fields it sets, so a Monday rule with just a topic still uses the base part of speech and difficulty. When both apply, weekday rules win over month rules, and month rules win over the base settings.

Examples:

- `wotdday monday science` makes Monday's word science themed.
- `wotddayfilter friday adjective rare` makes Fridays rare adjectives.
- `wotdmonth october spooky halloween` themes all of October.
- `wotdschedule` shows every rule and which filters are in effect today.

## Commands

| Command | What it does |
| --- | --- |
| `wotd` | Shows today's word, or a preview if nothing has posted yet. |
| `wotdchannel #channel` | Sets the channel and turns posting on. |
| `wotdtime 9` | Sets the local hour to post at. |
| `wotdtimezone Europe/London` | Sets the timezone. |
| `wotdtopic space` | Sets the base topic. |
| `wotdpos noun` | Restricts the part of speech. |
| `wotddifficulty rare` | Sets the difficulty. |
| `wotdmode mixed` | Chooses dictionary, custom, or mixed. |
| `wotdadd word [definition]` | Adds a custom word. |
| `wotdmessage` | Sets a custom message template with placeholders or embed JSON. |
| `wotdpost` | Posts a new word right now. |

## Message placeholders

`%wotd.word%`, `%wotd.definition%`, `%wotd.pos%`, `%wotd.example%`, `%wotd.phonetic%`, `%wotd.date%`, and `%wotd.ping%` are available inside a custom template, alongside the usual server placeholders.
