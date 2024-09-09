<script lang="ts">
  import { onMount } from 'svelte';
  import { fade } from 'svelte/transition';

  let mounted = false;

  onMount(() => {
    mounted = true;
  });
</script>

<svelte:head>
  <title>Mewdeko - Placeholders for commands with embeds!</title>
  <meta content="Mewdeko - Placeholders for commands with embeds!" property="og:title">
  <meta content="Placeholders for commands with embeds!" name="description">
  <meta content="Placeholders for commands with embeds!" property="og:description">
  <meta content="Placeholders for commands with embeds!" name="twitter:description">
</svelte:head>

{#if mounted}
  <div class="container mx-auto px-4 py-8" in:fade>
    <h1 class="text-4xl font-bold mb-8">Placeholders</h1>

    <section class="mb-12">
      <p>Placeholders are used in Quotes, Custom Reactions, Greet/Bye messages, playing statuses, suggestions, and a few other places.</p>
      <p>They can be used to make the message more user friendly, generate random numbers or pictures, etc.</p>
      <p>Some features have their own specific placeholders which are noted in that feature's command help. Some placeholders are not available in certain features because they don't make sense there.</p>
    </section>

    <section class="mb-12">
      <h2 class="text-2xl font-semibold mb-4">Usual placeholders</h2>
      <div class="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4">
        <p class="font-bold">Note</p>
        <p>If you're using placeholders in embeds, don't use %user.mention% and %bot.mention% in titles, footers and field names. They will not show properly.</p>
      </div>
    </section>

    <section class="mb-12">
      <h2 class="text-2xl font-semibold mb-4">AFK Placeholders</h2>
      <ul class="list-disc pl-6">
        <li><code class="p-1 rounded">%afk.message%</code> - The users afk message</li>
        <li><code class="p-1 rounded">%afk.user%</code> - The users name and discriminator</li>
        <li><code class="p-1 rounded">%afk.user.mention%</code> - The mention of the afk user</li>
        <li><code class="p-1 rounded">%afk.user.avatar%</code> - The avatar url of the user</li>
        <li><code class="p-1 rounded">%afk.user.id%</code> - The id of the afk user</li>
        <li><code class="p-1 rounded">%afk.triggeruser%</code> - The trigger users username and discriminator</li>
        <li><code class="p-1 rounded">%afk.triggeruser.avatar%</code> - The trigger users avatar</li>
        <li><code class="p-1 rounded">%afk.triggeruser.mention%</code> - The mention of the trigger user</li>
        <li><code class="p-1 rounded">%afk.triggeruser.id%</code> - The id of the trigger user</li>
        <li><code class="p-1 rounded">%afk.time%</code> - How long the user has been afk</li>
      </ul>
    </section>

    <section class="mb-12">
      <h2 class="text-2xl font-semibold mb-4">Suggest Accept/Deny/Consider/Implement Placeholders</h2>
      <ul class="list-disc pl-6">
        <li><code class="p-1 rounded">%suggest.user%</code> - The full username of the user who's suggestion got updated</li>
        <li><code class="p-1 rounded">%suggest.user.id%</code> - The Id of the user who's suggestion got updated</li>
        <li><code class="p-1 rounded">%suggest.message%</code> - The original suggestion</li>
        <li><code class="p-1 rounded">%suggest.number%</code> - The suggestion number that was updated</li>
        <li><code class="p-1 rounded">%suggest.user.name%</code> - The name of the user who's suggestion got updated</li>
        <li><code class="p-1 rounded">%suggest.user.avatar%</code> - The avatar of the original suggester</li>
        <li><code class="p-1 rounded">%suggest.mod.user%</code> - The full username of the one who updated the suggestion</li>
        <li><code class="p-1 rounded">%suggest.mod.avatar%</code> - The pfp of the one who updated the suggestion</li>
        <li><code class="p-1 rounded">%suggest.mod.name%</code> - The name of the person who updated the suggestion</li>
        <li><code class="p-1 rounded">%suggest.mod.message%</code> - The reason the suggestion was updated</li>
        <li><code class="p-1 rounded">%suggest.mod.Id%</code> - The id of the suggestion updater</li>
      </ul>
      <img src="https://media.discordapp.net/attachments/866308739334406174/870301575371948082/imgonline-com-ua-twotoone-IHpgQIykBfw.png" alt="Suggest placeholders example" class="mt-4 rounded-lg">
    </section>

    <section class="mb-12">
      <h2 class="text-2xl font-semibold mb-4">Suggest Message Placeholders</h2>
      <ul class="list-disc pl-6">
        <li><code class="p-1 rounded">%suggest.user%</code> - The user who suggested</li>
        <li><code class="p-1 rounded">%suggest.message%</code> - The suggestion</li>
        <li><code class="p-1 rounded">%suggest.number%</code> - The suggestion number</li>
        <li><code class="p-1 rounded">%suggest.user.name%</code> - The name, excluding discrim, of the person who suggested</li>
        <li><code class="p-1 rounded">%suggest.user.avatar%</code> - The avatar of the user who suggested</li>
      </ul>
      <img src="https://cdn.discordapp.com/attachments/850512762886160384/870304843091300402/suggestmessage.png" alt="Suggest message placeholders example" class="mt-4 rounded-lg">
    </section>

    <section class="mb-12">
      <h2 class="text-2xl font-semibold mb-4">Bot placeholders</h2>
      <ul class="list-disc pl-6">
        <li><code class="p-1 rounded">%bot.status%</code> - Bot's status (Online, Idle, DoNotDisturb, Invisible)</li>
        <li><code class="p-1 rounded">%bot.latency%</code> - Bot latency</li>
        <li><code class="p-1 rounded">%bot.name%</code> - Bot username</li>
        <li><code class="p-1 rounded">%bot.mention%</code> - Bot mention (clickable)</li>
        <li><code class="p-1 rounded">%bot.fullname%</code> - Bot username#discriminator</li>
        <li><code class="p-1 rounded">%bot.time%</code> - Bot time (usually the time of the server it's hosted on)</li>
        <li><code class="p-1 rounded">%bot.discrim%</code> - Bot's discriminator</li>
        <li><code class="p-1 rounded">%bot.id%</code> - Bot's user ID</li>
        <li><code class="p-1 rounded">%bot.avatar%</code> - Bot's avatar url</li>
      </ul>
    </section>

    <section class="mb-12">
      <h2 class="text-2xl font-semibold mb-4">Server placeholders</h2>
      <ul class="list-disc pl-6">
        <li><code class="p-1 rounded">%server.id%</code> - Server ID</li>
        <li><code class="p-1 rounded">%server.name%</code> - Server name</li>
        <li><code class="p-1 rounded">%server.members%</code> - Member count</li>
        <li><code class="p-1 rounded">%server.time%</code> - Server time (requires <code class="p-1 rounded">.timezone</code> to be set)</li>
        <li><code class="p-1 rounded">%server.icon%</code> - The server's icon</li>
        <li><code class="p-1 rounded">%server.boostlevel%</code> - The boost level, 1, 2, 3, etc</li>
        <li><code class="p-1 rounded">%server.boostcount%</code> - How many boosts the server has</li>
        <li><code class="p-1 rounded">%server.members.online%</code> - Shows the count of online members</li>
        <li><code class="p-1 rounded">%server.members.offline%</code> - Shows the count of offline members</li>
        <li><code class="p-1 rounded">%server.members.dnd%</code> - Shows the count of DND members</li>
        <li><code class="p-1 rounded">%server.members.idle%</code> - Shows the count of idle members</li>
        <li><code class="p-1 rounded">%server.timestamp.longdatetime%</code> - Shows time like this: <code class="p-1 rounded">Tuesday, 20 April 2021 16:20</code></li>
        <li><code class="p-1 rounded">%server.timestamp.longtime%</code> - Shows time like this: <code class="p-1 rounded">16:20:30</code></li>
        <li><code class="p-1 rounded">%server.timestamp.longdate%</code> - Shows current date like this: 20 April 2021</li>
        <li><code class="p-1 rounded">%server.timestamp.shortdatetime%</code> - Shows a short current date and time like this: <code class="p-1 rounded">20 April 2021 16:20</code></li>
      </ul>
    </section>

    <section class="mb-12">
      <h2 class="text-2xl font-semibold mb-4">Feed Placeholders</h2>
      <ul class="list-disc pl-6">
        <li><code class="p-1 rounded">%url%</code> - Shows the URL of what was posted</li>
        <li><code class="p-1 rounded">%author%</code> - Shows the author of what was posted</li>
        <li><code class="p-1 rounded">%content%</code> - Shows the description of the post</li>
        <li><code class="p-1 rounded">%image_url%</code> - Shows the image of the post, if any</li>
        <li><code class="p-1 rounded">%categories%</code> - Shows a comma separated list of the post categories</li>
        <li><code class="p-1 rounded">%timestamp%</code> - Shows the timestamp in longdatetime format</li>
        <li><code class="p-1 rounded">%feedurl%</code> - Shows the feed url used</li>
      </ul>
    </section>

    <section class="mb-12">
      <h2 class="text-2xl font-semibold mb-4">Channel placeholders</h2>
      <ul class="list-disc pl-6">
        <li><code class="p-1 rounded">%channel.mention%</code> - Channel mention (clickable)</li>
        <li><code class="p-1 rounded">%channel.name%</code> - Channel name</li>
        <li><code class="p-1 rounded">%channel.id%</code> - Channel ID</li>
        <li><code class="p-1 rounded">%channel.created%</code> - Channel creation date</li>
        <li><code class="p-1 rounded">%channel.nsfw%</code> - Returns either <code class="p-1 rounded">True</code> or <code class="p-1 rounded">False</code>, depending on if the channel is designated as NSFW using discord</li>
        <li><code class="p-1 rounded">%channel.topic%</code> - Channel topic</li>
      </ul>
    </section>

    <section class="mb-12">
      <h2 class="text-2xl font-semibold mb-4">User placeholders</h2>
      <ul class="list-disc pl-6">
        <li><code class="p-1 rounded">%user.mention%</code> - User mention</li>
        <li><code class="p-1 rounded">%user.fullname%</code> - Username#discriminator</li>
        <li><code class="p-1 rounded">%user.name%</code> - Username</li>
        <li><code class="p-1 rounded">%user.discrim%</code> - Discriminator</li>
        <li><code class="p-1 rounded">%user.avatar%</code> - User's avatar url</li>
        <li><code class="p-1 rounded">%user.id%</code> - User ID</li>
        <li><code class="p-1 rounded">%user.created_time%</code> - Account creation time (local time)</li>
        <li><code class="p-1 rounded">%user.created_date%</code> - Account creation date</li>
        <li><code class="p-1 rounded">%user.joined_time%</code> - Account join time (local time)</li>
        <li><code class="p-1 rounded">%user.joined_date%</code> - Account join date</li>
        <li><code class="p-1 rounded">%user.banner%</code> - Gives the url of a user's banner</li>
      </ul>
    </section>

    <section class="mb-12">
      <h2 class="text-2xl font-semibold mb-4">Ban message placeholders</h2>
      <ul class="list-disc pl-6">
        <li><code class="p-1 rounded">%ban.mod%</code> - Full name of the moderator who performed the ban</li>
        <li><code class="p-1 rounded">%ban.mod.fullname%</code> - Full name of the moderator who performed the ban</li>
        <li><code class="p-1 rounded">%ban.mod.mention%</code> - Moderator's mention</li>
        <li><code class="p-1 rounded">%ban.mod.name%</code> - Name of the moderator - Admin</li>
        <li><code class="p-1 rounded">%ban.mod.discrim%</code> - Discriminator of the moderator - 1234</li>
        <li><code class="p-1 rounded">%ban.user%</code> - Full name of the banned user</li>
        <li><code class="p-1 rounded">%ban.user.fullname%</code> - Full name of the banned user</li>
        <li><code class="p-1 rounded">%ban.user.name%</code> - Name of the banned user</li>
        <li><code class="p-1 rounded">%ban.user.discrim%</code> - Discriminator of the banned user</li>
        <li><code class="p-1 rounded">%ban.reason%</code> - Reason for the ban, if provided</li>
        <li><code class="p-1 rounded">%ban.duration%</code> - Duration of the ban in the form Days.Hours:Minutes (6.05:04)</li>
      </ul>
    </section>

    <section class="mb-12">
      <h2 class="text-2xl font-semibold mb-4">Bot stats placeholders</h2>
      <ul class="list-disc pl-6">
        <li><code class="p-1 rounded">%servers%</code> - Server count bot has joined</li>
        <li><code class="p-1 rounded">%users%</code> - Combined user count on servers the bot has joined</li>
      </ul>
    </section>

    <section class="mb-12">
      <h2 class="text-2xl font-semibold mb-4">Shard stats placeholders</h2>
      <ul class="list-disc pl-6">
        <li><code class="p-1 rounded">%shard.servercount%</code> - Server count on current shard</li>
        <li><code class="p-1 rounded">%shard.usercount%</code> - Combined user count on current shard</li>
        <li><code class="p-1 rounded">%shard.id%</code> - Shard ID</li>
      </ul>
    </section>

    <section class="mb-12">
      <h2 class="text-2xl font-semibold mb-4">Music placeholders</h2>
      <div class="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4">
        <p class="font-bold">Note</p>
        <p>These placeholders will only work in rotating playing statuses.</p>
      </div>
      <ul class="list-disc pl-6">
        <li><code class="p-1 rounded">%music.queued%</code> - Amount of songs currently queued</li>
        <li><code class="p-1 rounded">%music.playing%</code> - Current song name</li>
      </ul>
    </section>

    <section class="mb-12">
      <h2 class="text-2xl font-semibold mb-4">Miscellaneous placeholders</h2>
      <ul class="list-disc pl-6">
        <li><code class="p-1 rounded">%rngX-Y%</code> - Returns a random number between X and Y</li>
        <li><code class="p-1 rounded">%target%</code> - Returns anything the user has written after the trigger (in a normal chat trigger), or the selected message's content / user's mention (context menu chat triggers)</li>
        <li><code class="p-1 rounded">%img:stuff%</code> - Returns an <code class="p-1 rounded">imgur.com</code> search for "stuff" (only works on custom reactions)</li>
      </ul>
    </section>
  </div>
{/if}

<style>
  :global(pre) {
    background-color: #1f2937; /* dark gray background */
    color: #e5e7eb; /* light gray text */
    padding: 1rem;
    border-radius: 0.5rem;
    overflow-x: auto;
    margin-bottom: 1rem;
  }

  :global(pre code) {
    font-family: Consolas, Monaco, 'Andale Mono', 'Ubuntu Mono', monospace;
    font-size: 0.875rem;
    line-height: 1.5;
  }

  :global(code:not(pre code)) {
    background-color: #374151; /* slightly lighter gray for inline code */
    color: #e5e7eb;
    padding: 0.2rem 0.4rem;
    border-radius: 0.25rem;
    font-family: Consolas, Monaco, 'Andale Mono', 'Ubuntu Mono', monospace;
    font-size: 0.875em;
  }
</style>