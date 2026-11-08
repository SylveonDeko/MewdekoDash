---
title: Word of the Day
slug: wordoftheday
summary: Posts a vocabulary word each day with its definition and an example
icon: fa-book-open
category: Community
dashboard: /dashboard/wordoftheday
module: WordOfTheDay
tags: [word of the day, wotd, vocabulary, dictionary, definition, daily, datamuse, topic, schedule]
related: [birthday, utility]
---

## What it does

Once a day, at an hour the server picks in its own timezone, the bot posts a word in a chosen channel. The post shows the word and how it is pronounced, along with its part of speech and a definition, and adds an example sentence when one exists. A role can be pinged with every post.

Words come from the Datamuse dictionary and are filtered by a **topic** the words should lean toward and a **part of speech**. A **difficulty** setting is based on how often the word appears in written English. The bot avoids repeating anything it has posted in the last ninety days.

Servers can also build a **custom list** with `wotdadd`. If a definition is left out, the bot looks one up. The **source mode** decides whether posts come from the dictionary, the custom list, or the custom list first and the dictionary once it runs out.

## Dashboard

The page has four tabs: **Settings**, **Schedule**, **Custom words** and **History**. The header switch turns posting on, and it needs a channel first. **Post now** posts a word immediately and **Refresh** reloads the page data. Changes save as you make them.

### Settings

| Card | Setting | What it controls |
| --- | --- | --- |
| Posting | Channel | Where the word is posted |
| Posting | Post at | The hour of the day, `00:00` to `23:00` |
| Posting | Timezone | The timezone the hour is read in |
| Posting | Ping role | A role mentioned with every post |
| Word source | Source | Dictionary (Datamuse), Custom list only, or Custom list first, then dictionary |
| Word source | Topic | Up to five topic words, for example science or cooking. Max 80 characters |
| Word source | Part of speech | Any, Noun, Verb, Adjective or Adverb |
| Word source | Difficulty | Any, Common, Moderate or Rare |
| Discussion thread | Thread name | Defaults to `Word of the day: %wotd.word%`. Max 100 characters |
| Discussion thread | Auto-archive after | 1 hour, 1 day, 3 days or 1 week |
| Message template | Message template | Your own message or embed with a preview. Empty uses the default embed |

Topic and the filters only apply to dictionary words. Schedule rules override them. The **Discussion thread** card has its own switch, labelled **Create a thread under each post**. **Reset everything** at the bottom removes the configuration, custom words, rules and posting history after confirmation.

If a custom template is empty when a word is posted, the default embed is used and the dashboard shows a **Posted with the default embed** notice.

### Schedule

The **Weekdays** and **Months** lists show one row per day and per month. Open a row to set its **Topic**, **Part of speech** and **Difficulty**, then **Save**. Fields left on **Inherit** use the base values from **Settings**. **Clear rule** removes the rule, and a row without one reads "inherits base settings".

### Custom words

The **Add a word** card takes a word (max 64 characters) and an optional definition (max 1000 characters). If the definition is empty, one is looked up when the word is posted. The **Custom words** card lists each word with how many times it has been posted and a remove button. Words only get used when **Source** is Custom list only, or Custom list first, then dictionary.

### History

**Recent words** shows the last posted words and the date of the last post.

## Scheduling by weekday or month

Rules can override the topic, part of speech, and difficulty for a specific weekday or month. A rule only changes the fields it sets, so a Monday rule with just a topic still uses the base part of speech and difficulty. When both apply, weekday rules win over month rules, and month rules win over the base settings.

Examples:

- `wotdday monday science` makes Monday's word science themed.
- `wotddayfilter friday adjective rare` makes Fridays rare adjectives.
- `wotdmonth october spooky halloween` themes all of October.
- `wotdschedule` shows every rule and which filters are in effect today.

## Discussion thread

When turned on, the bot creates a public thread under each daily post and drops a starter prompt inviting people to use the word in a sentence. The thread's name comes from a template (default `Word of the day: %wotd.word%`) that supports `%wotd.word%`, `%wotd.date%`, `%wotd.pos%`, and the usual server placeholders. `wotdthread` toggles it on or off. `wotdthreadname` sets or clears the name template, and shows it. `wotdthreadarchive` sets how long the thread stays open before auto-archiving (1 hour, 1 day, 3 days, or 1 week).

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
| `wotdthread` | Toggles the discussion thread under each post. |
| `wotdthreadname [template\|clear]` | Sets, shows, or clears the thread name template. |
| `wotdthreadarchive 1h\|24h\|3d\|7d` | Sets how long the thread stays open before auto-archiving. |
| `wotdpost` | Posts a new word right now. |

## Message placeholders

`%wotd.word%`, `%wotd.definition%`, `%wotd.pos%`, `%wotd.example%`, `%wotd.phonetic%`, `%wotd.date%`, and `%wotd.ping%` are available inside a custom template, alongside the usual server placeholders.
