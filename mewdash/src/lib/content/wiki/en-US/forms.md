---
title: Forms
slug: forms
summary: Build applications and surveys, then review the answers members send in
icon: fa-clipboard
category: Community
dashboard: /dashboard/forms
module: Forms
tags: [forms, application, survey, questionnaire, ban appeal, join application, review, approve, reject, responses, csv]
related: [administration, moderation, rolestates]
---

## What it does

Staff build a form on the dashboard from a name and a set of questions, then set rules about who may answer and what happens afterwards. Publishing it produces a permanent share link. A member opens the link and signs in with Discord, then fills in the questions page by page, reviews their answers and submits. Their progress is saved as a draft while they type, so they can come back later.

Each submission is posted as an embed in the channel you choose, with **Approve** and **Reject** buttons if the form needs a decision. Reviewers press a button in Discord or use the **Responses** tab on the dashboard. The submitter gets a DM with the decision and any notes, and can follow it on a status page at any time.

There are three types of form. A regular form is for members, and a ban appeal form is for people currently banned, so approving it unbans them. A join application is for people outside the server, and approving it sends them a single-use invite with roles waiting for them when they join.

There are no commands for forms. Everything except the two review buttons happens on the dashboard.

## Why you would use it

- Staff or event applications with a proper review queue instead of a DM pile.
- A ban appeal process with waiting periods and attempt limits that unbans on approval.
- A gated community where applicants are vetted before receiving an invite.
- Feedback surveys with a response cap and CSV export.

## Form types

| Type | Who can submit | On approval |
| --- | --- | --- |
| Regular form | Members, or anyone if **Allow people outside the server** is on | Role changes only, if configured |
| Ban appeal | People currently banned from the server | The ban is removed |
| Join application | People who are not in the server | An invite is created and any **Roles waiting for them on join** are saved as a role state, so they are applied when the person joins |

The type is fixed once the form is created. Ban appeals and join applications always go through review; regular forms only do if **Answers need approving** is on.

## Questions

Questions are added in the **Questions** section of the form editor with **Add question**. Each question can be edited, duplicated, deleted and moved up or down. **Add page** splits the form at that point. Each page can have a **Page title** and a **Page introduction**, can be moved back or forward, and **Remove page** joins its questions to the page above. The types are:

| Type | Answer | Options |
| --- | --- | --- |
| Short text | One line | Minimum and maximum length, up to 5000 |
| Long text | Several lines | Same length limits |
| Multiple Choice | One of the listed options | Up to 25 options |
| Checkboxes | Several options | Up to 25 options; **Minimum value** and **Maximum value** limit how many may be ticked |
| Dropdown | One option from a list | Up to 25 options |
| Number | A number | Minimum and maximum value |
| Email | A valid email address | |
| URL | An `http` or `https` address | |
| Section break | Nothing; it splits the form into pages and carries a title and **Section description** | |
| Picture upload | A picture the person uploads | PNG, JPG, GIF or WebP up to 8 MB |

Question text is limited to 500 characters and placeholders to 200. Any answer can be up to 4000 characters. Each question can have a **Question image URL** (http or https only) and can be marked **Required question**. A question can also be required only when an earlier answer matches a condition.

### Picture uploads

A picture is checked by its contents rather than its name, and anything that is not a PNG, JPG, GIF or WebP is refused. The bot decodes it and saves a new WebP copy with the longest side cut to 2048 pixels, so an animated picture keeps only its first frame. Pictures over 40 million pixels are refused. The answer holds the address of that copy, and an answer pointing anywhere else is rejected on submit, so a typed address cannot stand in for an upload. Each person can upload 30 pictures an hour per form. The first picture of a response is shown at the bottom of the submission embed, and the Responses tab shows every picture. Pictures are deleted with the form. Uploads need the bot to have a CDN folder configured; without one the upload is refused with a message. Drafts and previews of unpublished forms can only upload pictures for people who have Manage Server or own the server.

### Pictures and emotes in text

Question text and section descriptions accept Markdown pictures written as `![description](address)`, and custom Discord emotes written as `<:name:id>` or `<a:name:id>`, which show as the emote picture. Emotes only ever load from Discord's own CDN, and a section title shows an emote as `:name:`.

A picture from Discord's CDN loads directly. Every other http or https picture, including the **Question image URL**, loads through the dashboard's picture proxy, so a visitor's browser never contacts the server hosting it. The proxy only fetches addresses the dashboard signed, only on the default port, never an address on a private or local network, and follows at most 3 redirects. It gives up after 10 seconds and refuses files over 8 MB or that are not PNG, JPEG, GIF, WebP or AVIF. It answers 120 requests a minute per visitor, 16 at a time. It needs `BOT_JWT_SECRET` (at least 32 characters) or `FORMS_IMAGE_PROXY_KEY` in the dashboard environment; with neither, outside pictures are left out.

### Answer piping

Turn on answer piping for a question and write `{{Q12}}` in its text or placeholder, where 12 is the ID of an earlier question. The earlier answer is inserted, cut to 100 characters. If it was not answered, the question text appears in brackets instead. A question can only pipe from questions above it.

### Conditions

Each question can be shown only when a condition holds. Hidden questions are skipped on the page, and any answers sent for them are discarded on the server.

| Condition type | Shown when |
| --- | --- |
| Answer-Based | An earlier answer matches: **Equals**, **Does not equal**, **Contains**, **Greater than**, **Less than**, **Is answered** or **Is not answered** |
| Role-Based | The member holds **Any Of**, **All Of**, or **None Of** the chosen roles |
| Server tenure | The member has been in the server for at least N days, or their account is at least N days old |
| Boost/Nitro | The member is boosting. The Nitro check is a best guess from avatar and boost data. |
| Permission-Based | The member has all of the chosen permissions |
| Multiple Conditions | Several rows combined. Rows in the same group must all be true (AND); any group being true shows the question (OR). Answer rows can only point at questions that are already saved. |

Text comparisons ignore case. Greater than and less than compare numbers. **Is answered** and **Is not answered** need no value to compare against. They only hold when the earlier question was shown, so a question that a condition hid is neither answered nor not answered. The same operators work for a question that is required only when an earlier answer matches.

## Who can submit

The form turns people away, with a reason, in this order: it is still a draft, it is not accepting responses, it has not reached **Opens at**, it has passed **Closes at**, the account is younger than **Minimum Discord account age**, the **Total responses accepted** cap is full, the person already answered and multiple answers are off, they lack the **Role required to submit**, and finally the type rule above.

**Let rejected people try again** means a rejected response no longer counts as "already answered". If **Require a captcha** is on, a Cloudflare Turnstile check appears at the review step.

Ban appeals add their own limits under **Appeal limits**: a wait after the ban (measured from the ban's audit log entry), a maximum number of appeals, a cooldown between appeals, and **One rejection is final**. An appeal that is still pending blocks a new one.

## Filling in a form

The public page requires a Discord login. Answers are saved as a draft about a second and a half after the last keystroke and when moving to the next page. Coming back within 30 days restores the draft with a "We brought back what you had already written" banner and a **Start over** button.

A progress bar shows answered questions. The last page ends with **Review & Continue**, which lists every answer with an **Edit** link, then **Confirm & Submit**. Afterwards the page shows your **Message after submitting** (or a default per type) and a **Check Your Status** link. The status page also links to **My submissions** at `/forms/submissions`, which lists every non-anonymous response the signed-in user has made across servers.

Submitters can edit their answers from the status page while the response is still pending or under review, as long as the form is not anonymous, has not closed and **Let people edit their answers** is on. Earlier answers are kept as revisions. Existing forms keep editing on, and the switch is hidden on anonymous forms because they can never be edited. There is no way for a submitter to withdraw a response.

### Placeholders

**Message after submitting** and **Announcement text** can use these placeholders, written with percent signs like the rest of the bot. Anything that is not a known placeholder is left as written.

| Placeholder | Becomes |
| --- | --- |
| `%form.name%` | The form's name |
| `%form.link%` | The address of the form, empty until the form has a share link |
| `%form.role%` | The role needed to submit |
| `%form.submissions%` | **Total responses accepted**, or Unlimited when more than one answer per person is allowed, otherwise 1 |
| `%form.opensat%`, `%form.expiresat%` | The opening and closing times, empty when not set |
| `%server.name%`, `%server.id%` | The server's name and ID |
| `%user.mention%`, `%user.id%`, `%user.name%`, `%user.globalname%` | The submitter, empty in the announcement because it has no submitter |

The confirmation page shows the message as plain text, so a mention appears as `@name`, the role as `@Role name` and times as `2026-11-23 18:00 UTC`, and nothing in it is ever treated as markup. In the announcement and the approval DM a mention is a real mention and times are Discord timestamps. The announcement also accepts the general server placeholders such as `%server.members%`.

### Started and sent

Bot owners can open **Form funnel** under the owner tools to compare how many people started each form with how many sent it over 7, 30 or 90 days. A person counts as started the first time they type an answer or a draft is saved, and as finished when they have a response to that form. Anonymous forms record no starts. The page shows started, started and sent, the share that finished, and the number of responses.

## What happens on submit

1. Roles in **Roles given on submitting** and the **Role while awaiting review** are granted.
2. If **Where answers are posted** is set, an embed is posted there showing the user (or "Anonymous (login required)") and the time. It lists up to 20 answers and pings **Ping when a response arrives**. Approve and Reject buttons are attached when the form is reviewed.
3. If **Send to a webhook** is set, the same embed is posted to that webhook, without the buttons. When the response is later approved or rejected, a second message goes to the webhook with the outcome and the reviewer's reason. The URL must be a Discord webhook; anything else is ignored with a warning in the bot's log, and a webhook that fails never blocks the submission.
4. The response appears in the **Responses** tab with status Pending review.

Anonymous forms store no user ID, so they cannot change roles and their responses cannot be edited.

## The review process

Responses move from Pending review to Approved or Rejected. **Who may approve or reject** names one or more roles, and holding any one of them is enough. Anyone with Manage Server or Administrator can always decide. If no reviewer role is set, holders of the approval roles can also decide. Roles that do not exist in the server are dropped when the form is saved.

In Discord, **Approve** decides immediately. **Reject** opens a modal asking for a reason, which is required because it is sent to the submitter. Either way the embed is recoloured and loses its buttons. It also gains an **Approved** or **Rejected** field showing the reviewer and the time, and the reason is added if there is one. On the dashboard, the same decision is made from the queue with a **Notes for the submitter** box.

On a decision the bot:

- Adds and removes the roles under **Add on approval**, **Remove on approval**, **Add on rejection**, and **Remove on rejection**, and always removes the awaiting-review role. A role listed on both sides is removed.
- Unbans the user for an approved ban appeal, or creates the invite for an approved join application.
- DMs the submitter "Your response was approved" or "Your response was not accepted" with the notes. On approval the DM also carries your **Message after submitting** and the invite. If the DM fails, the embed and queue say so.

The review button emotes come from the form, then the server-wide pair on the **Review buttons** tab, then a plain tick and cross.

## Versions

Every save of a form keeps a version, up to the last 20. **Version history** shows each one with a diff of settings and questions and a **Restore this version** button. Restoring recreates the questions with new IDs and rewrites conditions and piping to match.

## Settings

The **Forms** page has three tabs: **Forms**, **Responses** and **Review buttons**. The open tab, form and response filters are kept in the URL.

### Forms tab

The **Forms** card lists every form with badges for its type, Draft, Expired or Inactive state, pending count, response and question counts, Captcha and Anonymous. Use the search box to filter. **Create form** opens the editor. Each row has an inbox button that opens its responses and a menu with:

| Action | What it does |
| --- | --- |
| Edit | Opens the editor |
| Responses | Opens the **Responses** tab for this form |
| Preview | Opens the public page in preview mode. Submissions are disabled. |
| Copy link | Shows the permanent **Share link** |
| Publish | Takes a draft live. Only shown for drafts |
| Pause or Activate | Closes or reopens the form without deleting it |
| Duplicate | Copies every setting and question into a new draft that is switched off |
| Delete | Removes the form and all its responses after a confirmation |

The editor has **Settings**, **Questions** and **Version history** sections. Creating and editing share the same settings, and **Version history** appears only for saved forms. Press **Create** or **Save changes** to save.

### Responses tab

Pick a form under **Choose a form**, then filter by status: Pending review, Under review, Approved or Rejected, each with a count. Each response shows its submitter, ID, submission time, an **Edited** badge if the submitter changed it, and its answers. Earlier versions of edited answers can be shown or hidden. A reviewer can fill in **Notes for the submitter**, then **Approve** or **Reject**. A reason is required when rejecting. Approving a join application shows the created invite code. **Delete response** removes a response permanently with its answers and review history. **Export CSV** downloads the responses. The same queue is also available at `/dashboard/forms/<id>/review`.

### Review buttons tab

Sets the server-wide **Approve button emote** and **Reject button emote**. Leave them empty for the plain tick or cross, or use **Use the built-in pair**. A form can override them. Changes save as you pick them.

### Form settings

The settings are grouped into cards: **Basics**, **Who can submit**, **When it is open**, **Announce the opening in**, **When someone submits**, **Reviewing answers**, and for the matching types **Appeal limits** and **The invite sent on approval**.

| Setting | Default | What it controls |
| --- | --- | --- |
| Name | empty, required | Title of the form, up to 255 characters |
| Description | empty | Shown under the title and in Discord link previews |
| Where answers are posted | none | Channel for the submission embed; empty keeps answers on the dashboard only |
| Message after submitting | none | Text on the confirmation page and in the approval DM, up to 1000 characters, with placeholders |
| Let people edit their answers | on | Whether a submitter can change a response until it is decided. Hidden on anonymous forms |
| Draft | on for new forms | Drafts cannot be submitted to |
| Accepting responses | on | Turn off to close without deleting |
| Role required to submit | Anyone in the server | Gate by role |
| Minimum Discord account age | No limit | Days |
| Allow people outside the server | off | Regular forms only |
| Submit anonymously | off | Records no submitter |
| Opens at, Closes at | none | Window the form accepts answers in |
| Total responses accepted | No limit | Cap across everyone |
| Allow more than one answer per person | off | |
| Let rejected people try again | off | |
| Require a captcha | off | Turnstile at the review step |
| Announce the opening in, Ping with the announcement, Announcement text | none | Launch message, sent within about a minute of **Opens at** or on publish. Plain text is wrapped in an embed with a closing countdown; a message built with the embed editor is sent as written. The form placeholders above and `%server%` and `%server.members%` work in it |
| Ping when a response arrives | none | Role mentioned with each submission |
| Roles given on submitting | none | Granted straight away |
| Role while awaiting review | none | Removed on decision |
| Send to a webhook | none | Discord webhook URL that also receives each submission embed and each approve or reject decision |
| Answers need approving | off | Adds review to a regular form |
| Who may approve or reject | Manage Server only | One or more reviewer roles |
| Approve button emote, Reject button emote | server default | |
| Add/Remove on approval, Add/Remove on rejection | none | Role changes on decision |
| One rejection is final, Wait after the ban, Appeals allowed, Wait between appeals | off, No wait, Unlimited, No wait | Ban appeals only |
| Times the invite can be used, Invite expires after (seconds), Roles waiting for them on join | 1, 86400, none | Join applications only |

Settings that do not apply to the form's type are dropped on save.

## Setup walkthrough

1. Open **Forms** in the dashboard and press **Create form**.
2. Choose the **Form type**. This cannot be changed later.
3. In **Basics**, fill in **Name** and **Description**, and pick **Where answers are posted**.
4. Under **Questions**, add questions, mark the required ones, and use **Add page** to split long forms. Open a question to set its options, limits and conditions.
5. Under **Who can submit**, set who may answer. If you want a review step, turn on **Answers need approving** under **Reviewing answers** and choose **Who may approve or reject**.
6. Press **Create**. Use **Preview** in the form's menu to walk through it as an administrator.
7. Choose **Publish** in the menu, then **Copy link** and post the link wherever applicants will find it.
8. Watch the **Responses** tab, or the submit channel, and decide each response.

## Commands

Forms have no text or slash commands. The only Discord interaction is the **Approve** and **Reject** buttons on each submission embed.

## Tips and gotchas

- The bot needs Manage Roles, and its role must sit above every role a form gives or removes. Roles above the bot and managed roles are skipped silently, as is the everyone role.
- Ban appeals need View Audit Log for the "wait after the ban" check and Ban Members to unban. Join application invites need Create Invite in a channel visible to everyone.
- The submission embed shows at most 20 answers; the full response is on the dashboard.
- **Export CSV** on the Responses tab includes one column per question, with multi-select answers separated by semicolons.
- The response filter and page are part of the URL, so you can bookmark "pending only" and share it with reviewers.
- Drafts are never validated, so a restored draft may still fail validation at submit time.
- Expired forms are closed by a check that runs every minute; eligibility is also checked at submit time, so nothing slips through in between.
