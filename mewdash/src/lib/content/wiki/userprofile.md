---
title: User Profile
slug: userprofile
summary: Give every member a profile card the bot can show anywhere, with a bio, pronouns, zodiac sign, birthday, colour, image and Switch friend code, plus privacy controls over what other people see.
icon: fa-user
category: Community
module: UserProfile
tags: [profile, bio, pronouns, pronoundb, zodiac, birthday, privacy, profile colour, profile image, switch friend code, stats opt out, greet dm opt out]
related: [birthday, switch, afk, help]
---

## What it does

Every member has a profile that follows them across every server the bot is in. Running `profile` posts it as an embed: the member's avatar as a thumbnail, their bio as the description, then fields for pronouns, zodiac sign, birthday, how many servers they share with the bot, and their Nintendo Switch friend code if they set one. A custom colour and a large image at the bottom finish it off.

Members fill the profile in with a handful of `set...` commands, or from the **My Settings** page on the dashboard. Nothing is server specific: set your bio once and it shows the same everywhere.

Privacy is under the member's control. A profile can be made private so only its owner can open it, the birthday can be trimmed to just the month or hidden entirely, and members can opt out of command statistics and of welcome DMs.

Pronouns are a little special. If a member has not set any with the bot, the bot looks them up on PronounDB. Members can override that with their own text, and anyone can report an abusive override to the bot owners.

## Why you would use it

- Members want a quick "about me" card without a dedicated introductions channel.
- A community that shares Switch friend codes can keep them in one place instead of pinning messages.
- Pronouns can be shown from PronounDB automatically, so most people never have to type them.
- Staff can check someone's pronouns with `pronouns @user` before replying.
- Members who do not want welcome DMs or statistics collection can turn those off themselves.

## The profile embed

`profile` with no argument shows your own profile. `profile @user` shows someone else's, unless they have set it to private, in which case the bot replies that the profile is private.

| Part of the embed | Where it comes from |
| --- | --- |
| Title | "Profile for" the user |
| Colour | `setprofilecolor`, otherwise the bot's default colour |
| Thumbnail | The member's Discord avatar |
| Description | The bio from `setbio` (only shown if set) |
| Pronouns | Your override, otherwise PronounDB, otherwise "Unspecified" |
| Zodiac Sign | `setzodiac`, otherwise "Unspecified" |
| Birthday | `setbirthday`, shown according to the birthday privacy mode, otherwise "Unspecified" |
| Mutual Bot Servers | How many servers you and the bot are both in |
| Switch Friend Code | Only shown if set |
| Image | The URL from `setprofileimage` |

## Profile fields

### Bio

`setbio <text>` accepts up to 2048 characters. Longer text is rejected. There is no clear command; set a short bio such as a single dot if you want it gone.

### Zodiac sign

`setzodiac <sign>` accepts one of the twelve western signs: Aries, Taurus, Gemini, Cancer, Leo, Virgo, Libra, Scorpio, Sagittarius, Capricorn, Aquarius, Pisces. Case does not matter. Anything else is rejected.

### Colour and image

`setprofilecolor <colour>` takes a colour in any form the bot's colour parser understands, such as a hex value. `setprofileimage <url>` needs a direct link to an image file; the bot checks the URL looks like an image before saving it and shows it back to you.

### Birthday

`setbirthday <date>` stores a date. The Birthday module's announcements use the same value, so setting it here also sets it there. How it appears on the profile depends on `setbirthdayprivacy <mode>`:

| Mode | What the profile shows |
| --- | --- |
| `Default` | The full date |
| `MonthOnly` | Only the month name |
| `YearOnly` | Only the year |
| `MonthAndDate` | Month and day, no year |
| `Disabled` | "Private" |

### Switch friend code

`setswitchfc <code>` must match `SW-XXXX-XXXX-XXXX` (four digits in each group; the `SW` is case insensitive). Run it with no code to remove it from your profile. The Nintendo Switch module is unrelated to this field; the code is purely for display.

### Privacy

`setprivacy public` or `setprivacy private`. Private profiles are only visible to their owner. The default is public.

## Pronouns

`pronouns [@user]` shows pronouns for you or someone else. Lookup order:

1. Text the member set with `setpronouns`.
2. The member's English pronoun set on PronounDB, if they linked their Discord account there. Standard sets are shown in the usual form, for example `he/him`, `Any pronouns`, or `Ask me my pronouns`.
3. "Unspecified".

`setpronouns <text>` stores an override. Run it with no text to see your current override with two buttons: **Overwrite** opens a form to type new pronouns, and **Clear** removes the override so PronounDB is used again.

When the pronouns shown come from a member's own override (not PronounDB), the reply carries a **Report** button. Reports go to a channel the bot owners run, where they can clear the override, disable pronouns for that user, or blacklist them. A user whose pronouns have been disabled sees the reason whenever they try to use the pronoun commands.

> [!NOTE]
> The bot owner command `pronounsforceclear` is how those reports are acted on. Server staff cannot clear another member's pronouns.

## Opt outs

- `greetdmoptout` toggles whether servers using the bot's DM greetings can DM you. It only affects greetings sent by this bot.
- `userstatsoptout` toggles command statistics collection for your account. This never collects message contents.
- `deleteuserstatsdata` deletes the command statistics already stored for you after a confirmation. It can be run once an hour.

## Settings

There is no server-side configuration. Everything lives on the member. The dashboard's **My Settings** page (`/me`) has a **Profile** section with an **Edit** button and a privacy section with toggles.

| Setting | Default | What it controls |
| --- | --- | --- |
| Bio | empty | The description on your profile |
| Pronouns | empty (PronounDB is used) | Your pronoun override |
| Zodiac | none | Zodiac sign shown on the profile |
| Birthday | none | The date shown on the profile and used for birthday announcements |
| Timezone | UTC | Timezone the Birthday module uses for your announcement |
| Switch Friend Code | empty | Friend code field on the profile |
| Profile Color | bot default | Embed colour |
| Profile image | none | Image at the bottom of the embed |
| Profile privacy | Public | Whether others can open your profile |
| Birthday display mode | Default | Which parts of the birthday are shown |
| Block Welcome DMs | off | Same as `greetdmoptout` |
| Block Message Tracking | off | Same as `userstatsoptout` |
| Birthday Announcements | off | Whether the Birthday module announces your birthday |

The same page also has a toggle that disables pronoun fetching for your account.

## Setup walkthrough

1. Run `setbio Hi, I run the art channel.` to add a description.
2. Run `setpronouns she/her`, or skip this if your PronounDB account is already linked to Discord.
3. Run `setbirthday 1998-04-12` and then `setbirthdayprivacy MonthAndDate` if you do not want the year shown.
4. Run `setprofilecolor #ff66aa` and `setprofileimage https://example.com/banner.png` to style the embed.
5. Add `setswitchfc SW-1234-5678-9012` if you want people to find you on Switch.
6. Run `profile` to check the result. If you would rather nobody else sees it, run `setprivacy private`.

## Commands

Run these with your server's prefix (`.` unless you changed it). Slash versions exist for most of them under names such as `/profile`, `/setbio`, `/setcolor`, `/setbirthday`, `/setbirthdayprivacy`, `/setswitchfriendcode`, `/setprofileimage`, `/setprivacy`, `/setzodiac`, `/pronouns`, `/setpronouns`, `/statsoptout` and `/deletestatsdata`.

| Command | Aliases | Needs | Purpose |
| --- | --- | --- | --- |
| `profile [@user]` | `userprofile` | Nobody | Show your profile or someone else's |
| `setbio <text>` | | Nobody | Set your bio, up to 2048 characters |
| `setpronouns [text]` | `pronounsset` | Nobody | Set a pronoun override, or view it with clear and overwrite buttons |
| `pronouns [@user]` | `getpronouns` | Nobody | Show pronouns, with a report button on overrides |
| `setzodiac <sign>` | | Nobody | Set your zodiac sign |
| `setprofilecolor <colour>` | | Nobody | Set the embed colour |
| `setprofileimage <url>` | | Nobody | Set the image shown on the profile |
| `setbirthday <date>` | | Nobody | Set your birthday |
| `setbirthdayprivacy <mode>` | | Nobody | `Default`, `MonthOnly`, `YearOnly`, `MonthAndDate` or `Disabled` |
| `setprivacy <Public|Private>` | `profilepricvacy` | Nobody | Make the profile public or private |
| `setswitchfc [code]` | `setfc`, `setswitchfriendcode`, `setfriendcode` | Nobody | Set or clear your Switch friend code |
| `greetdmoptout` | `gdmoptout` | Nobody | Toggle receiving DM greetings from this bot |
| `userstatsoptout` | `ustatsoptout` | Nobody | Toggle command statistics collection |
| `deleteuserstatsdata` | `deluserstatsdata` | Nobody | Delete your stored command statistics (once per hour) |
| `pronounsforceclear <@user or id> <true|false> <reason>` | `pnfc` | Bot owner | Clear a member's pronouns and optionally disable them |

## Tips and gotchas

- The profile is global. Changing it in one server changes it everywhere.
- `setbirthday` reads the date with the bot's date parser, so an unambiguous format like `1998-04-12` is safest.
- If the profile image URL stops working, the embed still sends but Discord shows no image. Set a new URL to fix it.
- PronounDB lookups need the member to have linked their Discord account on pronoundb.org. Without that, the profile says "Unspecified" until they run `setpronouns`.
- Private profiles still respond to `profile @user`, but with an error saying the profile is private, so people can tell one exists.
- `deleteuserstatsdata` only removes command statistics. Profile fields are cleared by overwriting them.
