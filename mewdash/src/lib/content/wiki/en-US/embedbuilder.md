---
title: Embeds
slug: embedbuilder
summary: Build messages with a picture, buttons that open links or show a private reply, and send them from Simple mode, or use Advanced for menus, templates and senders
icon: fa-link
category: Actions
dashboard: /dashboard/embedbuilder
module: Utility
tags: [embed, embed builder, simple, advanced, buttons, reply button, upload picture, json, say, template, webhook, persona]
related: [multigreets, chat-triggers, afk, feeds, giveaways, suggestions]
---

## What it does

The embed builder is a visual editor for Discord messages. A message can have plain text, a colored box with a title and text, a picture, and buttons. You fill in the parts while a live preview updates, then send the message to a channel or copy it as message code. The message code is the bot's universal message format, written in a text format called JSON. Paste it into `say` to post it, save it as a named template, or drop it into any feature that takes a custom message, such as greets, chat triggers, AFK replies, feed updates, or the giveaway winner DM.

The builder has two modes. **Simple** is one page with the parts most messages need. **Advanced** has everything else. The **Simple** and **Advanced** buttons at the top of the page switch between them, and your browser remembers the choice. The first time you open the builder it is in Simple mode and a short tour says what you can make and points out each part. **Show me how** plays the tour again, and **Read the guide** opens this page.

Members never use the builder. They only see the messages it produces.

## Simple mode

Simple mode has no tabs. The form is on the left and the **Live preview** is beside it on a wide screen, with the **Problems** list above the preview when something needs fixing.

```embed-example
message | Text above the box | Welcome %user.mention%!
color | Color |
title | Title | Read the rules
description | Text inside the box | Start in %channel.mention% and say hello.
image | Picture | https://example.com/banner.png
button | Buttons | Open the rules
```

### The controls

| Control | What it makes |
| --- | --- |
| **Text above the box (optional)** | Plain text shown on its own above the colored box. |
| **Title** | The bold line at the top of the box, up to 256 characters. |
| **Text inside the box** | The main text of the box, up to 4096 characters. It accepts Discord formatting such as `**bold**`. |
| **Color** | The bar down the left side of the box. Pick one of the twelve swatches or use the last square to choose any color. A new message starts with Blurple. |
| **Picture** | One large picture at the bottom of the box. Paste a link, or press **Upload picture**. |
| **Buttons** | Buttons under the message. A button opens a link or shows a reply. |

A placeholder is a word between percent signs, such as `%user.mention%`, that the bot replaces with the real value when the message is sent. Under the text fields and the picture field, **Insert a placeholder** opens a list of placeholders, and the list explains what they are. The picture field lists only placeholders that resolve to a picture.

A picture link that is not a full web address, such as one missing `https://`, is dropped rather than failing the whole message.

### Upload a picture

Every picture field has a link box and an **Upload picture** button. Paste a link if the picture is already on the web, or press **Upload picture** and choose a file from your device. When the upload finishes, the link of the stored picture appears in the box.

- The file must be a PNG, JPG, GIF or WebP picture. The bot checks the contents of the file, not only its name.
- The file can be up to 8 MB.
- The picture is stored on the bot's CDN in a folder for your server under a random file name, so the link cannot be guessed from the original name.
- Uploading needs Manage access to the Embeds section of the dashboard for the server.

The upload only works on bots that have a CDN folder they can write to. On a bot without one, the page says "This bot cannot store uploaded pictures, so paste a link to the picture instead." and the link box keeps working. Uploaded pictures are not deleted when you stop using them.

### Add a button

Under **Buttons**, press the add button that matches what you want.

- **Add a button that opens a link** makes a button that opens a web address.
- **Add a button that shows a message** makes a button that shows a reply when someone clicks it.

Each button has **Text on the button**, up to 80 characters. A button can be switched between **Open a link** and **Show a message** with **When clicked**. A message can have up to five buttons in Simple mode, and the add buttons disappear once there are five. A line under the buttons says that other kinds of buttons and menus are in Advanced mode.

For **Open a link**, paste the address in **Link the button opens**. It must start with `https://` or `discord://`. In Discord, any other address turns the button into a disabled red button that shows an error.

For **Show a message**, choose under **What the reply says** how the reply is made:

- **Write a reply** shows plain text, written in **Reply**, up to 2000 characters.
- **Design an embed** shows the reply as an embed with a **Title**, a text of up to 2000 characters and a **Color**. It needs a title or a text.
- **Use a saved message** shows one of your saved messages. That choice only appears once you have saved messages.
A saved message used as a reply is copied when you pick it, so later changes to the saved message do not change the reply, and any buttons inside it are left out. **Only the person who clicked sees it** is on by default, so the reply shows to the person who clicked and nobody else in the channel. Turn it off to show the reply to everyone in the channel.

A button without text, a link button without an address or with an address that does not start with `https://` or `discord://`, and a message button without a reply are listed under **Problems** and block sending.

### How a message button works

A message button runs a chat trigger that the builder makes for you, so you do not need to visit the chat triggers page. The builder makes it when you save the message, send it, copy the message code, or open the **Message code** tab.

- The trigger is named `Embed builder button: ` followed by the button text, it is in the category **Embed builder buttons**, and only **Button click** is turned on for it. The reply and the **Only the person who clicked sees it** choice are stored on the trigger.
- Editing the button and saving again updates that same trigger, so the reply never needs to be changed in two places.
- When you open a saved message later, a button that is bound to one of these triggers shows as **Show a message** with its reply filled in again.
- Removing a button from the message does not delete its trigger, because messages you already sent still use it. Delete the trigger on the chat triggers page when no message needs it.
- On the chat triggers page these triggers are in the category **Embed builder buttons**, so the **Category** filter finds them or hides them. They are ordinary triggers, and the page shows them like any other.
- The builder needs access to chat triggers for the server. If it cannot save the trigger, the page says so and does not save or send the message.

### Send the message

1. Under **Send to {server}**, pick a channel. The list only has channels where both you and the bot can post.
2. Press **Send message**. A confirmation names the channel and the server and reminds you that everyone in the channel will see it and that the send is recorded in the audit log.
3. When it is sent, **Jump to message** opens it in Discord.

**Send message** stays off until a channel is picked, the message has text above the box, a title or text inside the box, and **Problems** is empty. Picture-only and button-only messages cannot be sent from the page. Simple mode always sends as the bot. Sending needs Manage access to the Embeds section of the dashboard for the server.

If the bot or you cannot send embeds in the channel, the page says so. If you do not have Mention Everyone in that channel, everyone, here and role mentions are removed from the message and the page tells you. Placeholders are replaced using you as the user and the channel you picked.

### Undo, redo and copy

**Undo**, **Redo** and **Copy message code** sit in the page header in both modes. The builder keeps the last 50 changes. **Copy message code** stays off until there is text above the box, a title, text inside the box or a field. **Cancel edits** only appears in Advanced mode.

### What Simple does not show

Simple never deletes anything. If a message uses a part that Simple has no control for, a line above the form says so and **Switch to Advanced** opens it. The parts are a second embed, fields, an author, a footer, a small picture in the corner, a title link, buttons that run a trigger, select menus and more than one row of buttons. While a message has buttons that run a trigger, select menus or more than one row, the **Buttons** list is hidden as well. Link buttons and message buttons are shown in Simple.

Pages that open the builder as a popup, such as greets and triggers, start in Advanced for that visit when the message they open uses any of those parts. Your saved choice does not change. The popup does not have message buttons, because it only returns the message to the page that opened it.

## Advanced mode

Advanced mode is the full builder. It has six tabs, and the open tab is kept in the page address as `?tab=`. **Undo**, **Redo**, **Cancel edits** and **Copy message code** sit in the page header.

```embed-example
message | Text above the box | Welcome %user.mention%!
author | Author | Server news
title | Title | Read the rules
color | Color |
description | Text inside the box | Start in %channel.mention% and say hello.
field | Fields | Rules: #rules
thumbnail | Small picture in the corner | Server icon
image | Large picture at the bottom | https://example.com/banner.png
footer | Footer | Member %server.members%
button | Open a link | Open the rules
trigger | Show a message | Only you see the rules
trigger | Run a trigger | Get the role
select | Select menu | Choose a color role
```

| Tab | What you do there |
| --- | --- |
| Templates | **Choose a template** from a gallery filtered by All templates, Welcome, Announcements, Rules, Information, Interactive and Fun, or press **Start from scratch**. A template replaces the first embed. |
| Editor | **Text above the box (optional)** plus **Embeds (n/10)** with **Add embed**. Each embed can be duplicated or removed and has four sections. |
| Buttons and menus | Up to five rows and 25 buttons and menus. **Add row**, then add buttons and select menus to a row. Drag the handle to reorder rows. Rows can be duplicated or removed. |
| Message code | **Your message as code** shows the message in JSON. **Refresh from builder** regenerates it and **Apply to builder** loads pasted code, either a full message or a single embed object. |
| Saved | **Save current embed** with a name and **Share with everyone on this server**, then **Shared on this server** and **My embeds** lists with **Load**, **Overwrite** and **Delete**. **Overwrite** replaces the saved embed with what is in the builder now. |
| Send | Choose a channel, review your permissions there, optionally post under a different name and avatar, then press **Send message**. |

### Embed sections

| Section | Contains |
| --- | --- |
| Content | Title, title link and text inside the box |
| Appearance | **Embed color** from a preset list or a custom color, plus the author (name, link, **Small icon**) and the footer (text, **Small icon**) |
| Fields | Name, value and **Show next to other fields (up to 3 in a row)** for each field, up to 25 fields |
| Media | **Small picture in the corner** and **Large picture at the bottom**, with tips on formats (PNG, JPG, GIF, WebP) and the 8 MB upload size |

The small picture in the corner, the large picture at the bottom, and the icons of the author and the footer all use the same picture field as Simple mode: a link box, **Upload picture** and **Insert a placeholder**

Problems that Discord would reject, such as a title over 256 characters, text inside the box over 4096, a field without both name and value, an author with an icon but no name, a footer with an icon but no text, or a button without text, show in **Problems** and block sending. Each problem says what is wrong and what to do. An embed with nothing in it shows as a warning.

Placeholders that resolve to a picture or GIF, such as `%user.avatar%`, `%server.icon%`, `%bot.avatar%`, banners and the `%...gif%` ones, only show as a link in a text field. When one lands in a text field, a chip offers **Move to thumbnail** or **Move to image**.

### Buttons and menus

Each button has **Display name** and **When clicked**, with three choices.

- **Open a link** opens a web address. This is the link button from Simple mode.
- **Show a message** shows a reply, written as plain text, designed as an embed or taken from a saved message, with the **Only the person who clicked sees it** switch. It works the same as in Simple mode, and it adds a **Button style** of Primary, Secondary, Success or Danger.
- **Run a trigger** runs a chat trigger from this server. A trigger is a saved action that you set up on the chat triggers page, and it adds a **Button style** too.

If the server has no triggers yet, **Run a trigger** says so and links to the chat triggers page. Triggers that the builder made for message buttons are left out of the list, because **Show a message** is the way to edit them.

A trigger only runs from a button when **Button click** is turned on for it. When you pick a trigger that does not have it on, the page says so under the picker. When you save, send, copy the message code or open the **Message code** tab, the builder turns **Button click** on for that trigger and shows a line at the top of the page that names it. The same happens for the triggers of select menu options. In Discord, a button that runs a trigger without **Button click** only answers the person who clicked with a message that the trigger is unavailable.

A select menu has **Text shown on the menu**, **Min options** and **Max options** from 1 to 25, and up to 25 options. Each option needs a trigger and a description in the editor, and its name and description can be up to 100 characters. The bot also rejects a select menu with no options, with a maximum above the number of options, or with a maximum below its minimum.

A row holds up to five buttons, or one select menu on its own. An emoji is optional on buttons and options. New buttons start as **Show a message** buttons.

### Sending and senders

The **Send** tab is titled **Send to {server}**. It shows **Your permissions in #channel** for sending messages, sending embeds, mentioning everyone and roles, and managing webhooks. Channels where nobody can post are listed under **Unavailable channels** with the reason.

To post under a different name and avatar, tick **Post under a different name and avatar**. This uses a webhook, which lets the bot post under any name and avatar you choose, so it needs Manage Webhooks for you and the bot. Under **Send as**, pick a saved sender or **Custom**. **Custom** takes a **Display name (optional)** and **Avatar link (optional)** for that send only.

A sender is a saved name and avatar, personal or shared with the server. The manage button opens **Saved senders**, where **New sender** takes a name of up to 80 characters, an avatar by **Choose an image** or **Link**, and **Share with everyone in {server}**. Uploaded avatars are PNG, JPG or GIF up to 8MB and use one webhook per channel the sender posts in. Discord allows 15 webhooks in a channel, so an uploaded avatar fails in a channel that is full. A linked avatar does not use a webhook of its own. Every send is recorded in the dashboard audit log.

The popup version of the builder has the same two modes. In Advanced it has the **Embed**, **Buttons and menus**, **Message code** and **Saved** tabs, and **Save** applies the message to the page that opened it. Simple mode in the popup has no send controls.

## The message code

The message code is written in JSON, a plain text format made of named values inside curly braces. The parser looks for the first `{` in the text and reads up to its matching `}`. Property names are case insensitive. If the text has no JSON object or it does not parse, commands such as `say` post the whole text as a plain message.

| Key | Type | Meaning |
| --- | --- | --- |
| `content` | string | Plain text shown above the embeds |
| `embed` | object | A single embed. If present, `embeds` is ignored. |
| `embeds` | array | Embed objects. The builder allows ten. |
| `components` | array | Buttons and select menus |

An embed object accepts `title`, `description`, `url`, `color`, `author` (`name`, `url`, `icon_url`), `footer` (`text`, `icon_url`), `thumbnail` (`url`), `image` (`url`), and `fields` (array of `name`, `value`, `inline`). `color` can be a number or a string such as `#5865F2`. Field names are cut to 256 characters and values to 1024, and a field without both a name and a value is left out. Any URL that is not a full absolute address is dropped rather than failing the whole message. An embed that would show nothing, for example one with only a color or a link, is left out. A `timestamp` key is accepted but not shown.

A component has `row` (which row it sits in), `displayName`, and either `url` for a link button or `id` for a button bound to a chat trigger. A **Show a message** button is exported as a button bound to the trigger the builder made for it, so the reply itself is not part of the code. `style` is 1 to 4 for the four Discord button styles, and `emoji` is optional. Set `isSelect` to true for a select menu, then give `options` (each with `id`, `name`, `description`, `emoji`) and `minOptions` and `maxOptions`. A button that breaks a rule is shown as a disabled red button whose label is the error, for example when it has both a `url` and an `id`, or a `url` that does not start with `https://` or `discord://`. A select menu that breaks a rule is shown as a disabled menu with the error as its placeholder.

> [!EXAMPLE]
> `{"content": "Welcome %user.mention%!", "embeds": [{"title": "Read the rules", "description": "See %channel.mention%", "color": "#57F287"}], "components": [{"row": 0, "displayName": "Open the rules", "style": 5, "url": "https://example.com/rules"}]}`

### Placeholders

A placeholder is a word between percent signs that the bot replaces when the message goes out. **Insert a placeholder** inserts placeholders from the placeholders page (user, server, channel, bot, time, and so on). The bot replaces them whether the message is sent from the dashboard, posted with `say`, previewed with `embedpreview`, or sent by a feature such as greets or triggers. A message sent from the dashboard fills them in using you as the user and the channel you picked. Each feature adds its own set, such as `%afk.message%` or `%giveawayitem%`, on top of the general ones. A reply written for a message button can use placeholders in the same way.

## Templates

A template is a name plus the message code. Two scopes exist.

| Scope | Who sees it | Created by |
| --- | --- | --- |
| Personal | Only you, in any server and in DMs | `embedsave`, or **Save** on the dashboard with sharing off |
| Guild shared | Anyone with access in that server | `guildembedsave` (Manage Messages), or **Save** with **Share with everyone on this server** on |

A name can only be used once within a scope. `embedpreview <name>` looks up your personal template first, then the server's shared one, replaces placeholders, and posts it in the current channel.

Some commands accept a template reference in place of raw message code. The whole message must be `{template:name}` or `{t:name}`. `multigreetmessage` supports this. The template's code is copied, so later edits to the template do not update the greet.

## Settings

The builder has no server settings. Everything is per message or per template.

## Setup walkthrough

1. Open **Embeds** in the dashboard. It opens in Simple mode.
2. Fill in the text above the box, title, text inside the box, color and picture. Watch **Problems** for anything Discord would reject.
3. Press **Add a button that shows a message** if you want a button that shows a private reply, or **Add a button that opens a link** for a web address.
4. Pick a channel under **Send to {server}** and press **Send message**.
5. To keep the message, switch to Advanced, open **Saved**, give it a name, turn on **Share with everyone on this server** if staff should use it, and press **Save**. To use it in another feature, press **Copy message code** and paste it there.
6. In Discord, `embedpreview <name>` posts a saved template with placeholders filled in.

## Commands

Run these with your server's prefix (`.` unless you changed it).

| Command | Aliases | Needs | Purpose |
| --- | --- | --- | --- |
| `say [#channel] <text or JSON>` | | Manage Messages | Post text or embed JSON as the bot, with placeholders replaced. A `.txt` attachment can supply the message. |
| `edit #channel <message id> <text or JSON>` | | Manage Messages in that channel | Replace the content of a message the bot sent |
| `embedsave <name> <JSON>` | `esave` | Nobody | Save a personal template |
| `embedlist` | `elist` | Nobody | List your personal templates |
| `embeddelete <name>` | `edel`, `edelete` | Nobody | Delete one of your personal templates |
| `guildembedsave <name> <JSON>` | `gesave`, `gembedsave` | Manage Messages | Save a template shared with this server |
| `guildembedlist` | `gelist`, `gembedlist` | Nobody | List the server's shared templates |
| `guildembeddelete <name>` | `gedel`, `gembeddelete` | Manage Messages | Delete a shared template |
| `embedpreview <name>` | `epreview`, `eprev` | Nobody | Post a saved template in the current channel |

## Tips and gotchas

- `say` mirrors your own mention rights: without Mention Everyone the bot will not ping everyone or roles for you.
- An embed with only a title and nothing else is still sent, but the page will not let you send or copy until there is text above the box, a title, text inside the box or a field.
- A link button address has to start with `https://` or `discord://`. An address that holds a placeholder is not checked by the page, because the placeholder is filled in later.
- Buttons that run a trigger and message buttons only work in the server whose trigger they use. Loading a shared template in another server leaves those buttons broken.
- Message buttons are saved as triggers when you save, send or copy, so a message you only preview has no triggers yet.
- If you load a saved message as the starting point of a new one and change a message button's reply, the old message changes too, because both use the same trigger.
- Malformed picture links in the image, thumbnail, author and footer are silently dropped. If a picture is missing, check that the link starts with `https://`.
- Discord limits a message to ten embeds, 25 fields per embed, five component rows, and five buttons per row. The builder enforces the same numbers.
- Deleting a sender does not remove the webhooks it created in channels. Clean those up in the channel's integrations settings if needed.
