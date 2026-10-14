---
title: Channel Access
slug: channel-access
summary: Gate a private channel behind an application form, and let the members already inside vote on who gets in.
icon: fa-lock
category: Security
dashboard: /dashboard/channel-access
module: ChannelAccess
tags: [channel access, gate, application, apply, vote, private channel, locked channel, inner circle, blacklist, review]
related: [administration, tickets, forms]
---

## What it does

Staff put a "gate" on a channel that most members cannot see. Members click an **Apply for access** button, or run `channelaccessapply`, and fill in a short form of up to five questions. The application is posted as an embed in a review channel with **Approve**, **Deny**, optional **Abstain** and **Breakdown** buttons.

The people who can already see the channel vote. Once enough approvals arrive the applicant is let in, either by being given a role or by getting a personal permission overwrite on the channel. Enough denials, or the voting window closing, turns them down. Staff can force either outcome at any time.

The applicant is told the result by DM if the gate allows it, and denied applicants have to wait out a cooldown before applying again. Everything is logged to an optional log channel.

## Why you would use it

- A members-only lounge or "inner circle" where existing members decide who joins.
- A verified adults channel where a small trusted group vouches for newcomers.
- Trade or marketplace channels that want a sanity check before someone can post.
- Any channel where you want a written application without staff reading every one themselves.

## Gates

A gate is one channel plus its rules. Each channel can have one gate. Creating a gate with a role makes it a **role gate**; creating one without a role makes it a **direct gate**.

| Grant mode | Dashboard label | How access is given | Who counts as "inside" |
| --- | --- | --- | --- |
| Role | Give them a role | The access role is added to the applicant | Anyone holding the access role |
| Channel permission | Add them to the channel directly | A View Channel allow overwrite is written for that member | Anyone who can currently see the channel |

Approved members are never removed automatically. Take the role away or delete the overwrite yourself.

## Applications

Before an application opens, the bot checks in this order: the gate is accepting applications, the member does not already have access, they are not blocked, their account and server join are old enough, they have no open application for this gate, and their reapply cooldown has passed. Failing any check returns an ephemeral message saying why.

If the gate has questions, a modal opens with one box per question. Questions are capped at 45 characters because of Discord's modal limits. Answer boxes are either single-line (200 characters) or multi-line (1000 characters) and can be marked required. A gate with no questions submits straight away.

The review message goes to the **Review channel**, or into the gated channel itself when none is set. It shows the applicant, when their account was created and when they joined, each question and answer, a live vote tally, and a footer with when voting closes. If **Hide the applicant until the vote closes** is on, the name is replaced with "Hidden until the vote closes" while pending.

### Statuses

| Status | Meaning |
| --- | --- |
| Pending | Open and being voted on |
| Approved | Passed, access was granted |
| Denied | Rejected by vote, expiry or staff |
| Withdrawn | The applicant pulled it back with `channelaccesswithdraw` |
| Expired | Not used by the current expiry rules; kept for history |

## Voting

Who may vote depends on the gate. If a **Voter role** is set, only members with that role can vote. Otherwise anyone who already has access to the channel, plus anyone with Manage Roles, can vote. Applicants can never vote on their own application.

Clicking a button records a vote. Clicking a different button changes it. Clicking the same button again removes it. The tally updates on the message after every change.

The application resolves as soon as approvals reach **Approvals needed** or denials reach **Denials needed**. Setting either threshold to 0 disables that side, so a gate with **Denials needed** at 0 can only be denied by staff or expiry.

**Breakdown** shows who voted which way, for voters only. With **Hide who voted which way** on, only members with Manage Roles can see it.

### When the window closes

A background check runs every minute for applications past their **Voting window**. What happens is set per gate:

| Option | Dashboard label | Result |
| --- | --- | --- |
| Deny | Deny the application | The application is denied. Default. |
| Majority | Whichever side has more votes | Approved if approvals outnumber denials, otherwise denied |
| StayOpen | Leave it open for staff | Nothing happens until staff resolve it |

Set **Voting window** to 0 for no time limit.

## Blocking applicants

Staff can block a user from one gate or from every gate in the server. Blocked users get "You are blocked from applying for this channel" when they try. Blocks have an optional reason that shows in the blacklist.

## Settings

The **Channel Access** page has three tabs: **Gates**, **Applications** and **Blocked**.

**Gates** lists every gate with an **Accepting applications** toggle, and expands to show its settings, **Application questions** and an **Apply panel** poster. Defaults below apply to new gates.

| Setting | Default | What it controls |
| --- | --- | --- |
| Locked channel | required | The channel being gated |
| How people get in | Give them a role | Role gate or direct gate |
| Role granted on approval | none | The access role, for role gates |
| Approvals needed | 3 | Approvals that resolve as approved; 0 disables |
| Denials needed | 3 | Denials that resolve as denied; 0 disables |
| Voting window (hours) | 72 | Time before the expiry rule runs; 0 for no limit |
| When the window closes | Deny the application | One of the three expiry options |
| Review channel | the gated channel itself | Where applications are posted for voting |
| Log channel | no logging | Where new applications and outcomes are logged |
| Voter role | everyone with the access role | Restrict voting to one role |
| Ping role on new applications | no ping | Role mentioned when an application arrives |
| Min account age (days) | 0 | Reject accounts younger than this |
| Min time in server (days) | 0 | Reject members who joined more recently than this |
| Reapply cooldown (hours) | 168 | Wait after a denial or expiry before applying again |
| Offer an abstain button | on | Adds an Abstain button to the review message |
| Hide the applicant until the vote closes | off | Anonymous applicant while pending |
| Hide who voted which way | off | Breakdown only for Manage Roles |
| DM the applicant on a decision | on | Sends the result by DM |

**Applications** lists applications filtered by gate and status, with the tally and **Approve** and **Deny** buttons for pending ones. **Blocked** lists blocked users by scope and lets you **Block** someone from one gate or **Every gate**, with an optional reason.

## Setup walkthrough

1. Make the channel private in Discord and, for a role gate, create the role that can see it.
2. Open **Channel Access** in the dashboard and use **Open applications for a channel**. Pick the **Locked channel**, choose **How people get in**, and select the role if needed.
3. Expand the gate. Set a **Review channel** so applications do not land in the locked channel, and a **Log channel** if you want a record.
4. Adjust **Approvals needed**, **Denials needed** and the **Voting window** to match how many voters you expect.
5. Under **Application questions**, add up to five questions. Tick **Required** and **Multi-line answer** as needed.
6. Under **Apply panel**, choose where the button should go and click **Post panel**.
7. Apply from a test account, vote from a member who has access, and check the applicant gets in.

## Commands

Run these with your server's prefix (`.` unless you changed it). The slash versions live under `/channelaccess`.

| Command | Aliases | Needs | Purpose |
| --- | --- | --- | --- |
| `channelaccesssetup <#channel> [@role]` | `casetup` | Manage Roles | Create a gate; omit the role for a direct gate |
| `channelaccessremove <#channel>` | `caremove` | Manage Roles | Delete a gate with its questions and history |
| `channelaccesslist` | `calist` | Nobody | List gates with thresholds, window and status |
| `channelaccessconfig <#channel> [setting] [value]` | `caconfig` | Manage Roles | Change one setting; run without a setting to see the list |
| `channelaccesspanel <#channel> [#target]` | `capanel` | Manage Roles | Post the apply button, in the current channel by default |
| `channelaccessquestionadd <#channel> <question>` | `caqadd` | Manage Roles | Add a required multi-line question |
| `channelaccessquestionremove <#channel> <position>` | `caqremove` | Manage Roles | Remove a question by its listed number |
| `channelaccessquestionlist <#channel>` | `caqlist` | Manage Roles | Show the questions in order |
| `channelaccessapply <#channel>` | `caapply` | Nobody | Post the apply button for yourself |
| `channelaccesswithdraw <id>` | `cawithdraw` | Nobody | Pull back your own open application |
| `channelaccesshistory [@user]` | `cahistory` | Nobody | Your application history; other users need Manage Roles |
| `channelaccesspending [#channel]` | `capending` | Nobody | List open applications, optionally for one gate |
| `channelaccessapprove <id> [reason]` | `caapprove` | Manage Roles | Approve regardless of votes |
| `channelaccessdeny <id> [reason]` | `cadeny` | Manage Roles | Deny regardless of votes |
| `channelaccessblacklistadd <@user> [#channel]` | `cabladd` | Manage Roles | Block from one gate, or everywhere with no channel |
| `channelaccessblacklistremove <@user> [#channel]` | `cablremove` | Manage Roles | Lift a block; give the same channel it was set on |
| `channelaccessblacklist` | `cablacklist` | Manage Roles | List blocked users |

The settings accepted by `channelaccessconfig` are `enabled`, `approvals`, `denials`, `votehours`, `onexpiry` (`deny`, `majority`, `stayopen`), `reviewchannel`, `logchannel`, `voterrole`, `pingrole`, `anonymousapplicant`, `anonymousvotes`, `allowabstain`, `minaccountage`, `minserverage`, `reapplycooldown` and `dmondecision`.

> [!EXAMPLE]
> `caconfig #inner-circle approvals 5` then `caconfig #inner-circle onexpiry majority`.

## Tips and gotchas

- The bot needs Manage Roles for role gates and Manage Channels (with permission to edit that channel's overwrites) for direct gates. Its top role must be above the access role.
- If no **Review channel** is set, applications are posted inside the locked channel. That works for "members vote on newcomers", but set a separate channel if staff should vote instead.
- Questions added by command are always required and multi-line. Use the dashboard to make a question optional or single-line, or to give it placeholder text.
- Deleting a gate removes its questions, applications and votes permanently.
- Members who leave the server before the vote ends are not granted access even if approved.
- Vote and expiry outcomes are only DMed for approvals and denials. Withdrawn applications get no DM.
- A blocked user must be unblocked with the same scope the block was made with. A server-wide block is not lifted by an unblock naming a channel.
