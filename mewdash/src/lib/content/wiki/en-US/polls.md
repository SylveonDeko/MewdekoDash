---
title: Polls
slug: polls
summary: Post button-based polls in a channel, restrict who can vote, schedule them ahead of time, reuse templates, and review the results.
icon: fa-chart-simple
category: Community
dashboard: /dashboard/polls
module: Games
tags: [poll, vote, survey, question, yes no, multiple choice, anonymous, scheduled poll, poll template]
related: [votes, games]
---

## What it does

Staff post a question with two to twenty-five options. The bot sends an embed with a button per option, or a select menu when there are more than five, and members vote by clicking. The embed shows the live count and percentage for each option. Under the options sit three management buttons: **Stats**, **Close** and **Delete**.

Members can change their vote by clicking a different option, or remove it by clicking the same option again, unless vote changes were switched off for that poll. Every response the bot gives to a click is private to the voter, so the channel stays clean.

Polls can be closed by hand, can expire on their own after a set duration, and can be scheduled to post at a later date. Templates save a question and its options so the same poll can be posted again with one command. The dashboard adds analytics, CSV and JSON export, and side-by-side comparison of polls.

## Why you would use it

- Pick a date or a game for the next community event.
- Run a quick yes/no check before a rule change.
- Ask a sensitive question anonymously so nobody can see who voted for what.
- Let only a staff role or a booster role vote on decisions that concern them.
- Post the same weekly poll every Monday from a template, or schedule it in advance.

## Poll types

| Type | How it votes |
| --- | --- |
| Yes / No | Two fixed options, Yes and No. Created by `poll` and `/poll yesno`. |
| Single choice | One option per member. The default for `pollc`, templates and the dashboard. |
| Multiple choice | Members may pick several options. With six or more options the select menu allows multi-select. |
| Anonymous | Votes are stored without showing the voter in stats or exports. |
| Role restricted | Only members holding one of the allowed roles can vote. Others get a private "not allowed" reply. Dashboard only. |

Every poll also has these per-poll switches, all on by default: **Allow changing votes**, **Show live results** and **Show progress bars**.

## Voting, closing and expiry

- A vote on a closed or expired poll is rejected with a private message.
- If vote changes are off, a second click is rejected as "already voted".
- The **Close** and **Delete** buttons work for the poll creator and anyone with Manage Messages. Delete asks you to type `DELETE` in a confirmation form, then removes the poll and its message.
- **Stats** shows total votes, unique voters and the per-option breakdown privately to whoever clicked.
- Expiry is checked every five minutes. When a poll expires its buttons are removed and the footer changes to show it expired.
- Scheduled polls are checked every minute. A scheduled poll must be in the future and no more than thirty days away. It can carry a duration in minutes, after which the posted poll expires.

## Templates

A template stores a name, a question and its options. `polltemplate <name>` posts it as a single choice poll. Templates are listed with `polltemplates`, created and deleted with `/poll create-template` and `/poll delete-template`, or managed on the dashboard's **Templates** tab, which also supports exporting and importing them as a file. A template holds at most twenty-five options.

## Settings

The Polls page has five tabs: **Polls**, **Create**, **Scheduled**, **Templates** and **Analytics**.

| Setting | Default | What it controls |
| --- | --- | --- |
| Question | none | The poll title |
| Poll type | Single choice | One of the five types above |
| Channel | none | Where the poll is posted |
| Options | two blank | Two to twenty-five options, each up to 100 characters. Hidden for Yes / No |
| Roles allowed to vote | none | Shown for Role restricted polls |
| Duration (minutes) | open until closed | 1 to 20160 minutes. Applied when the poll is scheduled |
| Schedule for later | none | A date and time. Leave empty to post now |
| Allow changing votes | on | Whether a member can switch or remove their vote |
| Show live results | on | Whether counts are shown while the poll runs |
| Show progress bars | on | Whether bars are drawn next to counts |
| Also save as a template | off | Saves the question and options under **Template name** |

The **Polls** tab lists polls with an **Include inactive** checkbox. Expanding a poll shows unique voters, participation, peak hour and creation time, and offers **Close poll**. **Scheduled** lets you **Cancel** a pending poll. **Analytics** shows polls this month, votes cast, average votes per poll, favourite type and a polls-per-day chart.

## Setup walkthrough

1. Open **Polls** in the dashboard and go to the **Create** tab.
2. Type the **Question**, pick a **Poll type** and the **Channel**.
3. Fill in the **Options**. Use the remove button to drop extras; at least two are required.
4. For a Role restricted poll, choose the **Roles allowed to vote**.
5. Optionally tick **Also save as a template** and give it a name.
6. Click the submit button. The poll is posted immediately, or queued on the **Scheduled** tab if you set a time.
7. Watch results on the **Polls** tab, then **Close poll** when you are done.

> [!TIP]
> For a quick channel vote you do not need the dashboard. `poll Should we add a movie night?` posts a Yes / No poll in seconds.

## Commands

Run these with your server's prefix (`.` unless you changed it).

| Command | Aliases | Needs | Purpose |
| --- | --- | --- | --- |
| `poll <question>` | `ppoll` | Manage Messages | Post a Yes / No poll |
| `pollc <question;option1;option2;...>` | | Manage Messages | Post a single choice poll with two to twenty-five options |
| `pollm <question;option1;option2;...>` | | Manage Messages | Post a multiple choice poll |
| `polla <question;option1;option2;...>` | | Manage Messages | Post an anonymous poll |
| `polltemplate <name>` | `ptemplate` | Manage Messages | Post a poll from a saved template |
| `polltemplates` | `ptemplates` | Nobody | List the server's templates |

Slash commands under `/poll` add `create` (up to ten options with anonymous and multiple-choice switches), `close`, `stats`, `list`, `create-template` and `delete-template`. `close`, `create-template` and `delete-template` need Manage Messages.

## Tips and gotchas

- The bot needs Send Messages and Embed Links in the poll channel. The text commands also delete your command message, which needs Manage Messages for the bot.
- Options are split on semicolons, so an option cannot contain one.
- Button labels show the option text only when it is twelve characters or shorter; longer options show just their number, with the full text in the embed.
- Duration is applied by the scheduler. A poll posted immediately stays open until someone closes it, so schedule it for a minute ahead if you need an automatic expiry.
- A closed poll can still be viewed and exported from the dashboard with **Include inactive** ticked; a deleted poll is gone.
- Role restricted polls check roles at vote time, so members who lose the role can no longer vote but their earlier vote stays.
