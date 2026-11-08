---
title: Polls
slug: polls
summary: Post polls with buttons in a channel and schedule them ahead of time
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

Polls can be closed by hand or close themselves after a number of votes or a set duration, and they can be scheduled to post at a later date. A results message can be posted when the poll ends. Templates save a question and its options so the same poll can be posted again with one command.

The dashboard page is a single scrolling page with four cards: **Polls**, **Scheduled polls**, **Templates** and **Analytics**.

## Why you would use it

- Pick a date or a game for the next community event.
- Run a quick yes/no check before a rule change.
- Ask a sensitive question anonymously so nobody can see who voted for what.
- Let only a staff role or a booster role vote on decisions that concern them, or keep a punished role out.
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
- Roles listed under **Roles blocked from voting** cannot vote on any poll type.
- With **Close after votes** set, the poll closes once that many votes are cast.
- The **Close** and **Delete** buttons work for the poll creator and anyone with Manage Messages. Delete asks you to type `DELETE` in a confirmation form, then removes the poll and its message.
- **Stats** shows total votes, unique voters and the per-option breakdown privately to whoever clicked.
- Expiry is checked every five minutes. When a poll expires its buttons are removed and the footer changes to show it expired.
- Scheduled polls are checked every minute. A scheduled poll must be in the future and no more than thirty days away. It can carry a duration in minutes, after which the posted poll expires.

## Results message

The **Results message** is posted when the poll ends. Placeholders you can use in it:

| Placeholder | Value |
| --- | --- |
| `%poll.question%` | Poll question |
| `%poll.id%` | Poll ID |
| `%poll.votes%` | Number of votes |
| `%poll.voters%` | Number of voters |
| `%poll.winner%` | Winning option |
| `%poll.winner.votes%` | Votes for the winner |
| `%poll.results%` | Every option with its votes |
| `%poll.link%` | Link to the poll |

## Templates

A template stores a name, a question and its options. `polltemplate <name>` posts it as a single choice poll. Templates are listed with `polltemplates`, created and deleted with `/poll create-template` and `/poll delete-template`, or from the dashboard. A template holds at most twenty-five options.

On the dashboard, the **Templates** card lists each template with its question. Click one, or choose **Use**, to open the new poll sheet pre-filled from it. Choose **Delete** to remove it. Templates are created by ticking **Also save as a template** when posting a poll.

## Settings

Press **New poll** on the **Polls** card to open the sheet.

| Setting | Default | What it controls |
| --- | --- | --- |
| Question | none | The poll title, up to 300 characters |
| Poll type | Single choice | One of the five types above |
| Channel | none | Where the poll is posted |
| Options | two blank | Two to twenty-five options, each up to 100 characters, with **Add option** and a remove button each. Hidden for Yes / No |
| Roles allowed to vote | none | Shown for Role restricted polls, at least one required |
| Roles blocked from voting | none | Roles that can never vote on this poll |
| Duration (minutes) | Open until closed | 1 to 43200 minutes. Applied when the poll is scheduled |
| Close after votes | none | Closes the poll once this many votes are in |
| Schedule for later | none | A date and time in the future. Leave empty to post now |
| Allow changing votes | on | Whether a member can switch or remove their vote |
| Show live results | on | Whether counts are shown while the poll runs |
| Show progress bars | on | Whether bars are drawn next to counts |
| Results message | none | Message posted when the poll ends |
| Also save as a template | off | Saves the question and options under **Template name** |

The submit button reads **Post poll**, or **Schedule poll** once a time is set.

The **Polls** card lists polls with their channel, type, vote count and time left. Turn on **Include closed polls** to see finished ones. Click a poll to open its details: results per option, **Unique voters**, **Participation**, **Peak hour** (in UTC) and **Created**. The buttons there are **Delete**, **CSV** to download the results, and **Close poll** for active polls.

The **Scheduled polls** card lists pending polls with the channel and posting time. The cross button cancels one after a confirmation.

The **Analytics** card shows **Polls this month**, **Votes cast**, **Avg votes per poll** and **Favourite type**, plus a **Polls created per day** chart.

## Setup walkthrough

1. Open **Polls** in the dashboard and press **New poll**.
2. Type the **Question**, pick a **Poll type** and the **Channel**.
3. Fill in the **Options**. Use the remove button to drop extras; at least two are required.
4. For a Role restricted poll, choose the **Roles allowed to vote**.
5. Optionally set **Roles blocked from voting**, **Close after votes** or a **Results message**.
6. Optionally tick **Also save as a template** and give it a name.
7. Press **Post poll**. If you set **Schedule for later**, press **Schedule poll** and the poll appears in **Scheduled polls**.
8. Watch results on the **Polls** card, then **Close poll** when you are done.

> [!TIP]
> For a quick channel vote you do not need the dashboard. `poll Should we add a movie night?` posts a Yes / No poll in seconds.

## Commands

Run these with your server's prefix (`.` unless you changed it).

| Command | Needs | Purpose |
| --- | --- | --- |
| `poll <question>` | Manage Messages | Post a Yes / No poll |
| `pollc <question;option1;option2;...>` | Manage Messages | Post a single choice poll with two to twenty-five options |
| `pollm <question;option1;option2;...>` | Manage Messages | Post a multiple choice poll |
| `polla <question;option1;option2;...>` | Manage Messages | Post an anonymous poll |
| `polltemplate <name>` | Manage Messages | Post a poll from a saved template |
| `polltemplates` | Nobody | List the server's templates |
| `pollmaxvotes <pollId> <votes>` | Manage Messages | Close an active poll after this many votes, `0` clears it |
| `pollblockrole <pollId> <role>` | Manage Messages | Block a role from voting, run again to unblock it |
| `pollresults <pollId> [message]` | Manage Messages | Set the results message, leave it out to clear it |

Slash commands under `/poll` add `create` (up to ten options with anonymous and multiple-choice switches), `close`, `stats`, `list`, `create-template` and `delete-template`. `close`, `create-template` and `delete-template` need Manage Messages.

## Tips and gotchas

- The bot needs Send Messages and Embed Links in the poll channel. The text commands also delete your command message, which needs Manage Messages for the bot.
- Options are split on semicolons, so an option cannot contain one.
- Button labels show the option text only when it is twelve characters or shorter; longer options show just their number, with the full text in the embed.
- Duration is applied by the scheduler. A poll posted immediately stays open until someone closes it, so schedule it for a minute ahead if you need an automatic expiry.
- A closed poll can still be viewed and exported from the dashboard with **Include closed polls** on; a deleted poll is gone.
- Role restricted polls check roles at vote time, so members who lose the role can no longer vote but their earlier vote stays.
- The pollmaxvotes, pollblockrole and pollresults commands only work on active polls in the same server.
