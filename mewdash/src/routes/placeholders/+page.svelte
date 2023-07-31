<script>
  import MarkdownResolver from "$lib/MarkdownResolver.svelte";
</script>

<head>
  <meta content="Mewdeko - Placeholders for commands with embeds!" property="og:title">
  <meta content="Placeholders for commands with embeds!"
        name="description">
  <meta content="Placeholders for commands with embeds!"
        property="og:description">
  <meta content="Placeholders for commands with embeds!"
        name="twitter:description">
</head>

<div class="min-h-[calc(105vh-5.5rem)] w-screen bg-mewd-light-grey">
  <MarkdownResolver content={`# Placeholders

Placeholders are used in Quotes, Custom Reactions, Greet/Bye messages, playing statuses, suggestions, and a few other places.

They can be used to make the message more user friendly, generate random numbers or pictures, etc.

Some features have their own specific placeholders which are noted in that feature's command help. Some placeholders are not available in certain features because they don't make sense there.

## Usual placeholders

!!! Note
    If you're using placeholders in embeds, don't use %user.mention% and %bot.mention% in titles, footers and field names. They will not show properly.


## AFK Placeholders
- \`%afk.message%\` - The users afk message
- \`%afk.user%\` - The users name and discriminator
- \`%afk.user.mention%\` - The mention of the afk user
- \`%afk.user.avatar%\` - The avatar url of the user
- \`%afk.user.id%\` - The id of the afk user
- \`%afk.triggeruser%\` - The trigger users username and discriminator
- \`%afk.triggeruser.avatar%\`- The trigger users avatar
- \`%afk.triggeruser.mention%\` - The mention of the trigger user
- \`%afk.triggeruser.id%\` - The id of the trigger user
- \`%afk.time%\` - How long the user has been afk

### Suggest Accept/Deny/Consider/Implement Placeholders

- \`%suggest.user%\` - The full username of the user who's suggestion got updated
- \`%suggest.user.id%\` - The Id of the user who's suggestion got updated
- \`%suggest.message%\` - The original suggestion
- \`%suggest.number%\` - The suggestion number that was updated
- \`%suggest.user.name%\` - The name of the user who's suggestion got updated
- \`%suggest.user.avatar%\` - The avatar of the original suggester
- \`%suggest.mod.user%\` - The full username of the one who updated the suggestion
- \`%suggest.mod.avatar%\` - The pfp of the one who updated the ssuggestion
- \`%suggest.mod.name%\` - The name of the person who updated the suggestion
- \`%suggest.mod.message%\` - The reason the suggestion was updated
- \`%suggest.mod.Id%\` - The id of the suggestion updater
![img]( https://media.discordapp.net/attachments/866308739334406174/870301575371948082/imgonline-com-ua-twotoone-IHpgQIykBfw.png)

### Suggest Message Placeholders

- \`%suggest.user%\` - The user who suggested
- \`%suggest.message%\` - The suggestion
- \`%suggest.number%\` - The suggestion number
- \`%suggest.user.name%\` The name, excluding discrim, of the person who suggested
- \`%suggest.user.avatar%\` - The avatar of the user who suggested
![img](https://cdn.discordapp.com/attachments/850512762886160384/870304843091300402/suggestmessage.png)

### Bot placeholders

- \`%bot.status%\` - Bot's status (Online, Idle, DoNotDisturb, Invisible)
- \`%bot.latency%\` - Bot latency
- \`%bot.name%\` - Bot username
- \`%bot.mention%\` - Bot mention (clickable)
- \`%bot.fullname%\` - Bot username#discriminator
- \`%bot.time%\` - Bot time (usually the time of the server it's hosted on)
- \`%bot.discrim%\` - Bot's discriminator
- \`%bot.id%\` - Bot's user ID
- \`%bot.avatar%\` - Bot's avatar url

### Server placeholders

- \`%server.id%\` - Server ID
- \`%server.name%\` - Server name
- \`%server.members%\` - Member count
- \`%server.time%\` - Server time (requires \`.timezone\` to be set)
- \`%server.icon%\` - The servers icon
- \`%server.boostlevel%\` - The boost level, 1, 2, 3, etc
- \`%server.boostcount%\` - How many boosts the server has
- \`%server.members.online%\` - Shows the count of online members
- \`%server.members.offline%\` - Shows the count of offline members
- \`%server.members.dnd%\` - Shows the count of DND members
- \`%server.members.idle%\` - Shows the count of idle members
- \`%server.timestamp.longdatetime%\` - Shows time like this: \`Tuesday, 20 April 2021 16:20\`
- \`%server.timestamp.longtime%\` - Shows time like this: \`16:20:30\`
- \`%server.timestamp.longdate%\` - Shows current date like this: 20 April 2021
- \`%server.timestamp.shortdatetime%\` - Shows a short current date and time like this: \`20 April 2021 16:20\`

### Feed Placeholders
- \`%url%\` - Shows the URL of what was posted
- \`%author%\` - Shows the author of what was posted
- \`%content%\` - Shows the description of the post
- \`%image_url%\` - Shows the image of the post, if any
- \`%categories%\` - Shows a comma separated list of the post categories
- \`%timestamp%\` - Shows the timestamp in longdatetime format
- \`%feedurl%\` - Shows the feed url used

### Channel placeholders

- \`%channel.mention%\` - Channel mention (clickable)
- \`%channel.name%\` - Channel name
- \`%channel.id%\` - Channel ID
- \`%channel.created%\` - Channel creation date
- \`%channel.nsfw%\` - Returns either \`True\` or \`False\`, depending on if the channel is designated as NSFW using discord
- \`%channel.topic%\` - Channel topic

### User placeholders

- \`%user.mention%\` - User mention
- \`%user.fullname%\` - Username#discriminator
- \`%user.name%\` - Username
- \`%user.discrim%\` - Discriminator
- \`%user.avatar%\` - User's avatar url
- \`%user.id%\` - User ID
- \`%user.created_time%\` - Account creation time (local time)
- \`%user.created_date%\` - Account creation date
- \`%user.joined_time%\` - Account join time (local time)
- \`%user.joined_date%\` - Account join date
- \`%user.banner%\` - Gives the url of a user's banner

### Ban message placeholders

- \`%ban.mod%\` - Full name of the moderator who performed the ban
- \`%ban.mod.fullname%\` - Full name of the moderator who performed the ban
- \`%ban.mod.mention%\` - Moderator's mention
- \`%ban.mod.name%\` - Name of the moderator - Admin
- \`%ban.mod.discrim%\` - Discriminator of the moderator - 1234
- \`%ban.user%\` - Full name of the banned user
- \`%ban.user.fullname%\` - Full name of the banned user
- \`%ban.user.name%\` - Name of the banned user
- \`%ban.user.discrim%\` - Discriminator of the banned user
- \`%ban.reason%\` - Reason for the ban, if provided
- \`%ban.duration%\` - Duration of the ban in the form Days.Hours:Minutes (6.05:04)

### Bot stats placeholders

- \`%servers%\` - Server count bot has joined
- \`%users%\` - Combined user count on servers the bot has joined

### Shard stats placeholders

- \`%shard.servercount%\` - Server count on current shard
- \`%shard.usercount%\` - Combined user count on current shard
- \`%shard.id%\` - Shard ID

### Music placeholders

!!! Note
    These placeholders will only work in rotating playing statuses.

- \`%music.queued%\` - Amount of songs currently queued
- \`%music.playing%\` - Current song name

### Miscellaneous placeholders

- \`%rngX-Y%\` - Returns a random number between X and Y
- \`%target%\` - Returns anything the user has written after the trigger (in a normal chat trigger), or the selected message's content / user's mention (context menu chat triggers)
- \`%img:stuff%\` - Returns an \`imgur.com\` search for "stuff" (only works on custom reactions)

`}></MarkdownResolver>
</div>