---
title: Forms
slug: forms
summary: Build applications, surveys, ban appeals, and join applications on the dashboard, collect answers through a shareable link, and approve or reject them from Discord or the response queue.
icon: fa-clipboard
category: Community
dashboard: /dashboard/forms
module: Forms
tags: [forms, application, survey, questionnaire, ban appeal, join application, review, approve, reject, responses, csv]
related: [administration, moderation, rolestates]
---

## What it does

Staff build a form on the dashboard: a name, a set of questions, and rules about who may answer and what happens afterwards. Publishing it produces a permanent share link. A member opens the link, signs in with Discord, fills in the questions page by page, reviews their answers, and submits. Their progress is saved as a draft while they type, so they can come back later.

Each submission is posted as an embed in the channel you choose, with **Approve** and **Reject** buttons if the form needs a decision. Reviewers press a button in Discord or use the **Responses** tab on the dashboard. The submitter gets a DM with the decision and any notes, and can follow it on a status page at any time.

Forms come in three types. A regular form is for members. A ban appeal form is for people currently banned, and approving it unbans them. A join application is for people outside the server, and approving it sends them a single-use invite with roles waiting for them when they join.

There are no commands for forms. Everything except the two review buttons happens on the dashboard.

## Why you would use it

- Staff, partner, or event applications with a proper review queue instead of a DM pile.
- A ban appeal process with waiting periods, attempt limits, and automatic unban on approval.
- A gated community where applicants are vetted before receiving an invite.
- Feedback surveys with a response cap and CSV export.

## Form types

| Type | Who can submit | On approval |
| --- | --- | --- |
| Regular Form | Members, or anyone if **Allow people outside the server** is on | Role changes only, if configured |
| Ban Appeal | People currently banned from the server | The ban is removed |
| Join Application | People who are not in the server | An invite is created and any **Roles waiting for them on join** are saved as a role state, so they are applied when the person joins |

The type is fixed once the form is created. Ban appeals and join applications always go through review; regular forms only do if **Answers need approving** is on.

## Questions

Questions are added in the builder under **Questions**. The types are:

| Type | Answer | Options |
| --- | --- | --- |
| Short Text | One line | Minimum and maximum length, up to 5000 |
| Long Text | Several lines | Same length limits |
| Multiple Choice | One of the listed options | Up to 25 options |
| Checkboxes | Several options | Up to 25 options; **Minimum value** and **Maximum value** limit how many may be ticked |
| Dropdown | One option from a list | Up to 25 options |
| Number | A number | Minimum and maximum value |
| Email | A valid email address | |
| URL | An `http` or `https` address | |
| Section Break | Nothing; it starts a new page and can carry a title and introduction | |

Question text is limited to 500 characters, placeholders to 200, and any answer to 4000 characters. Each question can have an image URL and can be marked required. A question can also be required only when an earlier answer matches a condition.

### Answer piping

Turn on answer piping for a question and write `{{Q12}}` in its text or placeholder, where 12 is the ID of an earlier question. The earlier answer is inserted, cut to 100 characters. If it was not answered, the question text appears in brackets instead. A question can only pipe from questions above it.

### Conditions

Each question can be shown only when a condition holds. Hidden questions are skipped on the page, and any answers sent for them are discarded on the server.

| Condition type | Shown when |
| --- | --- |
| Answer-Based | An earlier answer matches: **Equals**, **Does not equal**, **Contains**, **Greater than**, or **Less than** |
| Role-Based | The member holds **Any Of**, **All Of**, or **None Of** the chosen roles |
| Server Tenure | The member has been in the server for at least N days, or their account is at least N days old |
| Boost/Nitro | The member is boosting. The Nitro check is a best guess from avatar and boost data. |
| Permission-Based | The member has all of the chosen permissions |
| Multiple Conditions | Several rows combined. Rows in the same group must all be true (AND); any group being true shows the question (OR). |

Text comparisons ignore case. Greater than and less than compare numbers.

## Who can submit

The form turns people away, with a reason, in this order: it is still a draft, it is not accepting responses, it has not reached **Opens at**, it has passed **Closes at**, the account is younger than **Minimum Discord account age**, the **Total responses accepted** cap is full, the person already answered and multiple answers are off, they lack the **Role required to submit**, and finally the type rule above.

**Let rejected people try again** means a rejected response no longer counts as "already answered". If **Require a captcha** is on, a Cloudflare Turnstile check appears at the review step.

Ban appeals add their own limits under **Appeal limits**: a wait after the ban (measured from the ban's audit log entry), a maximum number of appeals, a cooldown between appeals, and **One rejection is final**. An appeal that is still pending blocks a new one.

## Filling in a form

The public page requires a Discord login. Answers are saved as a draft about a second and a half after the last keystroke and when moving to the next page. Coming back within 30 days restores the draft with a "We brought back what you had already written" banner and a **Start over** button.

A progress bar shows answered questions. The last page ends with **Review & Continue**, which lists every answer with an **Edit** link, then **Confirm & Submit**. Afterwards the page shows your **Message after submitting** (or a default per type) and a **Check Your Status** link. The status page also links to **My submissions** at `/forms/submissions`, which lists every non-anonymous response the signed-in user has made across servers.

Submitters can edit their answers from the status page while the response is still pending, as long as the form is not anonymous and has not closed. Earlier answers are kept as revisions. There is no way for a submitter to withdraw a response.

## What happens on submit

1. Roles in **Roles given on submitting** and the **Role while awaiting review** are granted.
2. If **Where answers are posted** is set, an embed is posted there showing the user (or "Anonymous (login required)"), the time, and up to 20 answers, pinging **Ping when a response arrives**. Approve and Reject buttons are attached when the form is reviewed.
3. If **Send to a webhook** is set, the same embed is posted to that webhook, without the buttons. When the response is later approved or rejected, a second message with the outcome, reviewer and reason goes to the webhook too. The URL must be a Discord webhook; anything else is ignored with a warning in the bot's log, and a webhook that fails never blocks the submission.
4. The response appears in the **Responses** tab with status Pending Review.

Anonymous forms store no user ID, so they cannot change roles and their responses cannot be edited.

## The review process

Responses move from Pending Review to Approved or Rejected. **Who may approve or reject** names a role; anyone with Manage Server or Administrator can always decide. If no reviewer role is set, holders of the approval roles can also decide.

In Discord, **Approve** decides immediately. **Reject** opens a modal asking for a reason, which is required because it is sent to the submitter. Either way the embed is recoloured, gains an **Approved** or **Rejected** field with the reviewer and time, the reason if any, and loses its buttons. On the dashboard, the same decision is made from the queue with a **Notes for the submitter** box.

On a decision the bot:

- Adds and removes the roles under **Add on approval**, **Remove on approval**, **Add on rejection**, and **Remove on rejection**, and always removes the awaiting-review role. A role listed on both sides is removed.
- Unbans the user for an approved ban appeal, or creates the invite for an approved join application.
- DMs the submitter "Your response was approved" or "Your response was not accepted" with the notes, your **Message after submitting** on approval, and the invite. If the DM fails, the embed and queue say so.

The review button emotes come from the form, then the **Server defaults** on the **Settings** tab, then a plain tick and cross.

## Versions

Every save of a form keeps a version, up to the last 20. **Version history** shows each one with a diff of settings and questions and a **Restore** button. Restoring recreates the questions with new IDs and rewrites conditions and piping to match.

## Settings

The **Forms** page has **Forms**, **Create**, and **Settings** tabs, plus **Edit** and **Responses** when a form is selected. The Create and Edit tabs share one settings panel.

| Setting | Default | What it controls |
| --- | --- | --- |
| Name | empty, required | Title of the form, up to 255 characters |
| Description | empty | Shown under the title and in Discord link previews |
| Where answers are posted | none | Channel for the submission embed; empty keeps answers on the dashboard only |
| Message after submitting | none | Text on the confirmation page and in the approval DM |
| Draft | on for new forms | Drafts cannot be submitted to |
| Accepting responses | on | Turn off to close without deleting |
| Role required to submit | Anyone in the server | Gate by role |
| Minimum Discord account age | No limit | Days |
| Allow people outside the server | off | Regular forms only |
| Submit anonymously | off | Records no submitter |
| Opens at, Closes at | none | Window; a launch announcement needs an opening time |
| Total responses accepted | No limit | Cap across everyone |
| Allow more than one answer per person | off | |
| Let rejected people try again | off | |
| Require a captcha | off | Turnstile at the review step |
| Announce the opening in, Ping with the announcement, Announcement text | none | Launch embed with a closing countdown, sent within about a minute of **Opens at** or on publish |
| Ping when a response arrives | none | Role mentioned with each submission |
| Roles given on submitting | none | Granted straight away |
| Role while awaiting review | none | Removed on decision |
| Send to a webhook | none | Discord webhook URL that also receives each submission embed and each approve or reject decision |
| Answers need approving | off | Adds review to a regular form |
| Who may approve or reject | Manage Server only | Reviewer role |
| Approve button emote, Reject button emote | server default | |
| Add/Remove on approval, Add/Remove on rejection | none | Role changes on decision |
| One rejection is final, Wait after the ban, Appeals allowed, Wait between appeals | off, No wait, Unlimited, No wait | Ban appeals only |
| Times the invite can be used, Invite expires after (seconds), Roles waiting for them on join | 1, 86400, none | Join applications only |

Settings that do not apply to the form's type are dropped on save.

## Setup walkthrough

1. Open **Forms** in the dashboard and press **Create**.
2. Choose the **Form type**. This cannot be changed later.
3. Fill in **Name** and **Description**, and pick **Where answers are posted**.
4. Under **Questions**, add questions, mark the required ones, and use **Add page** to split long forms.
5. Set who can submit and, if you want a review step, turn on **Answers need approving** and choose **Who may approve or reject**.
6. Press **Save Form**. Use **Preview** on the form card to walk through it as an administrator.
7. Press **Publish** on the card, then **Copy Link** and post the link wherever applicants will find it.
8. Watch the **Responses** tab, or the submit channel, and decide each response.

## Commands

Forms have no text or slash commands. The only Discord interaction is the **Approve** and **Reject** buttons on each submission embed.

## Tips and gotchas

- The bot needs Manage Roles, and its role must sit above every role a form gives or removes. Roles above the bot, managed roles, and everyone are skipped silently.
- Ban appeals need View Audit Log for the "wait after the ban" check. Unbanning needs Ban Members, and join application invites need Create Invite in a channel visible to everyone.
- The submission embed shows at most 20 answers; the full response is on the dashboard.
- **Export CSV** on the Responses tab includes one column per question, with multi-select answers separated by semicolons.
- The response filter and page are part of the URL, so you can bookmark "pending only" and share it with reviewers.
- Drafts are never validated, so a restored draft may still fail validation at submit time.
- Expired forms are closed by a check that runs every minute; eligibility is also checked at submit time, so nothing slips through in between.
