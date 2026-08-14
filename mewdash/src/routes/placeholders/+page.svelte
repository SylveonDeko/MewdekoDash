<!-- routes/placeholders/+page.svelte -->
<script lang="ts">


  import { onDestroy, onMount } from "svelte";
  import { fade, fly } from "svelte/transition";
  import { colorStore } from "$lib/stores/colorStore";
  import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";

  let mounted = $state(false);
    let searchQuery = $state("");
    let selectedCategory = $state("all");
    let copiedPlaceholder = $state("");
    let showCopyFeedback = $state(false);

  // Category options for DiscordSelector
  const categoryOptions = [
    { id: "all", name: "All Categories", icon: "fa-globe" },
    { id: "user", name: "User", icon: "fa-user" },
    { id: "server", name: "Server", icon: "fa-server" },
    { id: "channel", name: "Channel", icon: "fa-hashtag" },
    { id: "bot", name: "Bot", icon: "fa-robot" },
    { id: "time", name: "Time/Date", icon: "fa-clock" },
    { id: "stats", name: "Stats/Shard", icon: "fa-chart-bar" },
    { id: "random", name: "Random", icon: "fa-dice" },
    { id: "gifs", name: "Reaction GIFs", icon: "fa-image" },
    { id: "afk", name: "AFK", icon: "fa-moon" },
    { id: "suggest", name: "Suggestions", icon: "fa-lightbulb" },
    { id: "stream", name: "Stream", icon: "fa-video" },
    { id: "birthday", name: "Birthday", icon: "fa-cake-candles" },
    { id: "chat-trigger", name: "Chat Triggers", icon: "fa-bolt" },
    { id: "giveaway", name: "Giveaway", icon: "fa-gift" },
    { id: "ban", name: "Moderation/Ban", icon: "fa-gavel" },
    { id: "inviter", name: "Inviter", icon: "fa-envelope" },
    { id: "xp", name: "XP System", icon: "fa-star" }
  ];

  // Placeholder data structure
  const placeholderCategories = [
    {
      id: "user",
      name: "User",
      description: "User-related placeholders",
      placeholders: [
        { code: "%user%", description: "User mention", example: "@Username" },
        { code: "%user.mention%", description: "Mention the user", example: "@Username" },
        { code: "%user.id%", description: "User ID", example: "123456789012345678" },
        { code: "%user.name%", description: "Username", example: "Username" },
        { code: "%user.fullname%", description: "Username#discriminator", example: "Username#1234" },
        { code: "%user.discrim%", description: "User discriminator", example: "1234" },
        { code: "%user.avatar%", description: "User's avatar URL", example: "https://cdn.discordapp.com/avatars/..." },
        { code: "%user.banner%", description: "User's banner URL", example: "https://cdn.discordapp.com/banners/..." },
        { code: "%user.created_time%", description: "Account creation time (HH:mm)", example: "14:30" },
        { code: "%user.created_date%", description: "Account creation date (dd.MM.yyyy)", example: "15.06.2020" },
        { code: "%user.joined_time%", description: "Server join time (HH:mm)", example: "09:45" },
        { code: "%user.joined_date%", description: "Server join date (dd.MM.yyyy)", example: "22.03.2023" }
      ]
    },
    {
      id: "server",
      name: "Server",
      description: "Server-related placeholders",
      placeholders: [
        { code: "%server%", description: "Server name", example: "My Cool Server" },
        { code: "%server.name%", description: "Server name", example: "My Cool Server" },
        { code: "%server.id%", description: "Server ID", example: "987654321098765432" },
        { code: "%server.icon%", description: "Server icon URL", example: "https://cdn.discordapp.com/icons/..." },
        {
          code: "%server.banner%",
          description: "Server banner URL",
          example: "https://cdn.discordapp.com/banners/..."
        },
        { code: "%server.members%", description: "Total member count", example: "1,234" },
        { code: "%server.members.online%", description: "Online members count", example: "523" },
        { code: "%server.members.offline%", description: "Offline members count", example: "711" },
        { code: "%server.members.dnd%", description: "Do Not Disturb members count", example: "45" },
        { code: "%server.members.idle%", description: "Idle members count", example: "89" },
        { code: "%server.boostlevel%", description: "Server boost level (0-3)", example: "2" },
        { code: "%server.boostcount%", description: "Server boost count", example: "14" },
        { code: "%server.time%", description: "Current server time with timezone", example: "14:30 PST" },
        {
          code: "%server.timestamp.longdatetime%",
          description: "Discord long date/time timestamp",
          example: "<t:1234567890:F>"
        },
        {
          code: "%server.timestamp.longtime%",
          description: "Discord long time timestamp",
          example: "<t:1234567890:T>"
        },
        {
          code: "%server.timestamp.longdate%",
          description: "Discord long date timestamp",
          example: "<t:1234567890:D>"
        },
        {
          code: "%server.timestamp.shortdatetime%",
          description: "Discord short date/time timestamp",
          example: "<t:1234567890>"
        }
      ]
    },
    {
      id: "channel",
      name: "Channel",
      description: "Channel-related placeholders",
      placeholders: [
        { code: "%channel%", description: "Channel mention", example: "#general" },
        { code: "%channel.mention%", description: "Channel mention", example: "#general" },
        { code: "%channel.name%", description: "Channel name", example: "general" },
        { code: "%channel.id%", description: "Channel ID", example: "123456789012345678" },
        { code: "%channel.created%", description: "Channel creation date/time", example: "14:30 15.06.2020" },
        { code: "%channel.nsfw%", description: "Whether channel is NSFW", example: "True" },
        { code: "%channel.topic%", description: "Channel topic", example: "Welcome to the general chat!" }
      ]
    },
    {
      id: "bot",
      name: "Bot",
      description: "Bot-related placeholders",
      placeholders: [
        { code: "%bot.status%", description: "Bot's current status", example: "Online" },
        { code: "%bot.latency%", description: "Bot's latency in ms", example: "45" },
        { code: "%bot.name%", description: "Bot's username", example: "Mewdeko" },
        { code: "%bot.fullname%", description: "Bot's username#discriminator", example: "Mewdeko#0000" },
        { code: "%bot.discrim%", description: "Bot's discriminator", example: "0000" },
        { code: "%bot.id%", description: "Bot's user ID", example: "752236274261426994" },
        { code: "%bot.avatar%", description: "Bot's avatar URL", example: "https://cdn.discordapp.com/avatars/..." },
        { code: "%bot.time%", description: "Current time with timezone", example: "14:30 PST" }
      ]
    },
    {
      id: "time",
      name: "Time/Date",
      description: "Time and date placeholders",
      placeholders: [
        { code: "%time.month%", description: "Current month name", example: "December" },
        { code: "%time.day%", description: "Current day name", example: "Monday" },
        { code: "%time.year%", description: "Current year", example: "2025" }
      ]
    },
    {
      id: "stats",
      name: "Stats/Shard",
      description: "Bot statistics and shard information",
      placeholders: [
        { code: "%shard.servercount%", description: "Number of servers on this shard", example: "1,234" },
        { code: "%shard.usercount%", description: "Number of users on this shard", example: "456,789" }
      ]
    },
    {
      id: "random",
      name: "Random",
      description: "Random generation placeholders",
      placeholders: [
        { code: "%rng%", description: "Random number (0-10)", example: "7" },
        { code: "%rng(1,100)%", description: "Random number between specified range", example: "42" },
        { code: "%choose(a|b|c)%", description: "Choose randomly from pipe-separated options", example: "b" },
        { code: "%target%", description: "Text after the trigger", example: "user input text" },
        { code: "%img:query%", description: "Imgur search for 'query'", example: "https://imgur.com/..." }
      ]
    },
    {
      id: "gifs",
      name: "Reaction GIFs",
      description: "Animated reaction GIFs from nekos.best API",
      placeholders: [
        { code: "%bakagif%", description: "Random baka reaction GIF", example: "https://nekos.best/api/v2/baka" },
        { code: "%bitegif%", description: "Random bite reaction GIF", example: "https://nekos.best/api/v2/bite" },
        { code: "%blushgif%", description: "Random blush reaction GIF", example: "https://nekos.best/api/v2/blush" },
        { code: "%boredgif%", description: "Random bored reaction GIF", example: "https://nekos.best/api/v2/bored" },
        { code: "%crygif%", description: "Random cry reaction GIF", example: "https://nekos.best/api/v2/cry" },
        { code: "%cuddlegif%", description: "Random cuddle reaction GIF", example: "https://nekos.best/api/v2/cuddle" },
        { code: "%dancegif%", description: "Random dance reaction GIF", example: "https://nekos.best/api/v2/dance" },
        {
          code: "%facepalmgif%",
          description: "Random facepalm reaction GIF",
          example: "https://nekos.best/api/v2/facepalm"
        },
        { code: "%feedgif%", description: "Random feed reaction GIF", example: "https://nekos.best/api/v2/feed" },
        {
          code: "%handholdgif%",
          description: "Random handhold reaction GIF",
          example: "https://nekos.best/api/v2/handhold"
        },
        { code: "%happygif%", description: "Random happy reaction GIF", example: "https://nekos.best/api/v2/happy" },
        {
          code: "%highfivegif%",
          description: "Random highfive reaction GIF",
          example: "https://nekos.best/api/v2/highfive"
        },
        { code: "%huggif%", description: "Random hug reaction GIF", example: "https://nekos.best/api/v2/hug" },
        { code: "%kickgif%", description: "Random kick reaction GIF", example: "https://nekos.best/api/v2/kick" },
        { code: "%kissgif%", description: "Random kiss reaction GIF", example: "https://nekos.best/api/v2/kiss" },
        { code: "%laughgif%", description: "Random laugh reaction GIF", example: "https://nekos.best/api/v2/laugh" },
        { code: "%patgif%", description: "Random pat reaction GIF", example: "https://nekos.best/api/v2/pat" },
        { code: "%pokegif%", description: "Random poke reaction GIF", example: "https://nekos.best/api/v2/poke" },
        { code: "%poutgif%", description: "Random pout reaction GIF", example: "https://nekos.best/api/v2/pout" },
        { code: "%punchgif%", description: "Random punch reaction GIF", example: "https://nekos.best/api/v2/punch" },
        { code: "%shootgif%", description: "Random shoot reaction GIF", example: "https://nekos.best/api/v2/shoot" },
        { code: "%shruggif%", description: "Random shrug reaction GIF", example: "https://nekos.best/api/v2/shrug" },
        { code: "%slapgif%", description: "Random slap reaction GIF", example: "https://nekos.best/api/v2/slap" },
        { code: "%sleepgif%", description: "Random sleep reaction GIF", example: "https://nekos.best/api/v2/sleep" },
        { code: "%smilegif%", description: "Random smile reaction GIF", example: "https://nekos.best/api/v2/smile" },
        { code: "%smuggif%", description: "Random smug reaction GIF", example: "https://nekos.best/api/v2/smug" },
        { code: "%staregif%", description: "Random stare reaction GIF", example: "https://nekos.best/api/v2/stare" },
        { code: "%thinkgif%", description: "Random think reaction GIF", example: "https://nekos.best/api/v2/think" },
        {
          code: "%thumbsupgif%",
          description: "Random thumbsup reaction GIF",
          example: "https://nekos.best/api/v2/thumbsup"
        },
        { code: "%ticklegif%", description: "Random tickle reaction GIF", example: "https://nekos.best/api/v2/tickle" },
        { code: "%wavegif%", description: "Random wave reaction GIF", example: "https://nekos.best/api/v2/wave" },
        { code: "%winkgif%", description: "Random wink reaction GIF", example: "https://nekos.best/api/v2/wink" }
      ]
    },
    {
      id: "afk",
      name: "AFK",
      description: "Placeholders for AFK functionality",
      placeholders: [
        { code: "%afk.message%", description: "The users afk message" },
        { code: "%afk.user%", description: "The users name and discriminator" },
        { code: "%afk.user.mention%", description: "The mention of the afk user" },
        { code: "%afk.user.avatar%", description: "The avatar url of the user" },
        { code: "%afk.user.id%", description: "The id of the afk user" },
        { code: "%afk.triggeruser%", description: "The trigger users username and discriminator" },
        { code: "%afk.triggeruser.avatar%", description: "The trigger users avatar" },
        { code: "%afk.triggeruser.mention%", description: "The mention of the trigger user" },
        { code: "%afk.triggeruser.id%", description: "The id of the trigger user" },
        { code: "%afk.time%", description: "How long the user has been afk" }
      ]
    },
    {
      id: "suggest",
      name: "Suggestions",
      description: "Placeholders for suggestion system",
      placeholders: [
        { code: "%suggest.user%", description: "The full username of the user who's suggestion got updated" },
        { code: "%suggest.user.id%", description: "The Id of the user who's suggestion got updated" },
        { code: "%suggest.message%", description: "The original suggestion" },
        { code: "%suggest.number%", description: "The suggestion number that was updated" },
        { code: "%suggest.user.name%", description: "The name of the user who's suggestion got updated" },
        { code: "%suggest.user.avatar%", description: "The avatar of the original suggester" },
        { code: "%suggest.mod.user%", description: "The full username of the one who updated the suggestion" },
        { code: "%suggest.mod.avatar%", description: "The pfp of the one who updated the suggestion" },
        { code: "%suggest.mod.name%", description: "The name of the person who updated the suggestion" },
        { code: "%suggest.mod.message%", description: "The reason the suggestion was updated" },
        { code: "%suggest.mod.Id%", description: "The ID of the person who updated the suggestion" },
        { code: "%suggest.emote1count%", description: "Count of reactions for emote 1" },
        { code: "%suggest.emote2count%", description: "Count of reactions for emote 2" },
        { code: "%suggest.emote3count%", description: "Count of reactions for emote 3" },
        { code: "%suggest.emote4count%", description: "Count of reactions for emote 4" },
        { code: "%suggest.emote5count%", description: "Count of reactions for emote 5" }
      ]
    },
    {
      id: "stream",
      name: "Stream",
      description: "Streaming and live content placeholders",
      placeholders: [
        { code: "%stream.name%", description: "The name of the stream" },
        { code: "%stream.username%", description: "The unique username of the streamer" },
        { code: "%stream.url%", description: "The URL to the live stream" },
        { code: "%stream.title%", description: "The title of the stream" },
        { code: "%stream.game%", description: "The game/category being streamed" },
        { code: "%stream.viewers%", description: "Current viewer count (formatted with commas)" },
        { code: "%stream.platform%", description: "The streaming platform (Twitch, YouTube, etc.)" },
        { code: "%stream.avatar%", description: "Avatar/profile picture URL of the streamer" },
        { code: "%stream.preview%", description: "Stream preview/thumbnail image URL" },
        { code: "%stream.status%", description: "Stream status (🟢 Online or 🔴 Offline)" },
        { code: "%stream.channelid%", description: "The channel ID of the stream" }
      ]
    },
    {
      id: "birthday",
      name: "Birthday",
      description: "Birthday-related placeholders",
      placeholders: [
        { code: "%birthday.age%", description: "The calculated age of the user based on their birthday" }
      ]
    },
    {
      id: "chat-trigger",
      name: "Chat Triggers",
      description: "Chat trigger functionality placeholders",
      placeholders: [
        { code: "%target%", description: "Returns anything the user has written after the trigger" }
      ]
    },
    {
      id: "giveaway",
      name: "Giveaway",
      description: "Giveaway-related placeholders",
      placeholders: [
        { code: "%messagelink%", description: "Direct link to the giveaway message" },
        { code: "%giveawayitem%", description: "The item being given away" },
        { code: "%giveawaywinners%", description: "Number of winners for the giveaway" }
      ]
    },
    {
      id: "ban",
      name: "Moderation/Ban",
      description: "Moderation and ban-related placeholders",
      placeholders: [
        { code: "%ban.mod%", description: "Full name of the moderator who issued the ban" },
        { code: "%ban.mod.fullname%", description: "Full name of the moderator who issued the ban" },
        { code: "%ban.mod.name%", description: "Username of the moderator who issued the ban" },
        { code: "%ban.mod.discrim%", description: "Discriminator of the moderator who issued the ban" },
        { code: "%ban.user%", description: "Full name of the banned user" },
        { code: "%ban.user.fullname%", description: "Full name of the banned user" },
        { code: "%ban.user.name%", description: "Username of the banned user" },
        { code: "%ban.user.discrim%", description: "Discriminator of the banned user" },
        { code: "%reason%", description: "Reason for the ban" },
        { code: "%ban.reason%", description: "Reason for the ban" },
        { code: "%ban.duration%", description: "Duration of the ban (d.hh:mm format or 'perma')" }
      ]
    },
    {
      id: "inviter",
      name: "Inviter",
      description: "Invite-related placeholders for welcome messages",
      placeholders: [
        { code: "%inviter.username%", description: "Username of the person who invited the user" },
        { code: "%inviter.avatar%", description: "Avatar URL of the person who invited the user" },
        { code: "%inviter.id%", description: "ID of the person who invited the user" },
        { code: "%inviter.mention%", description: "Mention of the person who invited the user" },
        { code: "%inviter.count%", description: "Total invite count of the inviter" }
      ]
    },
    {
      id: "xp",
      name: "XP System",
      description: "Experience and leveling system placeholders",
      placeholders: [
        { code: "%xp.user%", description: "Username of the user (respects ping settings)" },
        { code: "%xp.user.mention%", description: "Mention of the user (respects ping settings)" },
        { code: "%xp.user.name%", description: "Username of the user" },
        { code: "%xp.user.displayname%", description: "Display name of the user" },
        { code: "%xp.user.nickname%", description: "Nickname of the user in the server" },
        { code: "%xp.user.avatar%", description: "Avatar URL of the user" },
        { code: "%xp.user.id%", description: "User ID" },
        { code: "%xp.user.created%", description: "Date when the user account was created" },
        { code: "%xp.user.joined%", description: "Date when the user joined the server" },
        { code: "%xp.level.old%", description: "Previous level of the user" },
        { code: "%xp.level.new%", description: "New level of the user" },
        { code: "%xp.level.current%", description: "Current level of the user (alias for new level)" },
        { code: "%xp.level.next%", description: "Next level the user will reach" },
        { code: "%xp.level.difference%", description: "Difference between old and new level" },
        { code: "%xp.total%", description: "Total XP of the user" },
        { code: "%xp.current%", description: "Current level XP" },
        { code: "%xp.needed%", description: "XP needed for next level" },
        { code: "%xp.remaining%", description: "XP remaining to reach next level" },
        { code: "%xp.gained%", description: "XP gained in the current session" },
        { code: "%xp.progress%", description: "Progress percentage to next level" },
        { code: "%xp.rank%", description: "Current rank of the user in the server" },
        { code: "%xp.rank.ordinal%", description: "Rank in ordinal format (1st, 2nd, 3rd, etc.)" },
        { code: "%xp.rank.suffix%", description: "Ordinal suffix for the rank (st, nd, rd, th)" },
        { code: "%xp.guild%", description: "Name of the guild/server" },
        { code: "%xp.guild.name%", description: "Name of the guild/server" },
        { code: "%xp.guild.id%", description: "ID of the guild/server" },
        { code: "%xp.guild.membercount%", description: "Total member count of the server" },
        { code: "%xp.guild.icon%", description: "Server icon URL" },
        { code: "%xp.guild.banner%", description: "Server banner URL" },
        { code: "%xp.channel%", description: "Channel mention where XP was gained" },
        { code: "%xp.channel.mention%", description: "Channel mention where XP was gained" },
        { code: "%xp.channel.name%", description: "Name of the channel where XP was gained" },
        { code: "%xp.channel.id%", description: "ID of the channel where XP was gained" },
        { code: "%xp.triggeruser%", description: "User who triggered the XP notification" },
        { code: "%xp.triggeruser.mention%", description: "Mention of the user who triggered the notification" },
        { code: "%xp.triggeruser.name%", description: "Name of the user who triggered the notification" },
        { code: "%xp.triggeruser.avatar%", description: "Avatar of the user who triggered the notification" },
        { code: "%xp.triggeruser.id%", description: "ID of the user who triggered the notification" },
        { code: "%xp.time%", description: "Current time (HH:mm format)" },
        { code: "%xp.time.full%", description: "Full timestamp (dd/MM/yyyy HH:mm format)" },
        { code: "%xp.date%", description: "Current date (dd/MM/yyyy format)" },
        { code: "%xp.timestamp%", description: "Discord timestamp for current time" },
        { code: "%xp.timestamp.relative%", description: "Discord relative timestamp for current time" }
      ]
    }
  ];

    let filteredCategories = $derived(placeholderCategories.map(category => ({
    ...category,
    placeholders: category.placeholders.filter(placeholder =>
      searchQuery.trim() === "" ||
      placeholder.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      placeholder.description.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => {
    // If "all" is selected, show categories that have placeholders after search filtering
    if (selectedCategory === "all") {
      return category.placeholders.length > 0;
    }
    // If a specific category is selected, only show that category
    return category.id === selectedCategory;
    }));

    let totalResults = $derived(filteredCategories.reduce((sum, cat) => sum + cat.placeholders.length, 0));

  function copyToClipboard(placeholder: string) {
    navigator.clipboard.writeText(placeholder).then(() => {
      copiedPlaceholder = placeholder;
      showCopyFeedback = true;
      setTimeout(() => {
        showCopyFeedback = false;
        copiedPlaceholder = "";
      }, 2000);
    });
  }

  function handleGlobalKeydown(event: KeyboardEvent) {
    if ((event.ctrlKey || event.metaKey) && event.key === "k") {
      event.preventDefault();
      document.getElementById("search-placeholders")?.focus();
    }
  }

  onMount(() => {
    mounted = true;
    if (typeof window !== "undefined") {
      window.addEventListener("keydown", handleGlobalKeydown);
    }
  });

  onDestroy(() => {
    if (typeof window !== "undefined") {
      window.removeEventListener("keydown", handleGlobalKeydown);
    }
  });
</script>

<svelte:head>
  <title>Mewdeko - Placeholders for commands with embeds!</title>
  <meta
    content="Mewdeko - Placeholders for commands with embeds!"
    property="og:title"
  >
  <meta content="Placeholders for commands with embeds!" name="description" />
  <meta
    content="Placeholders for commands with embeds!"
    property="og:description"
  >
  <meta
    content="Placeholders for commands with embeds!"
    name="twitter:description"
  >
</svelte:head>

{#if mounted}
  <main
    class="min-h-screen"
    style="--color-primary: {$colorStore.primary};
           --color-secondary: {$colorStore.secondary};
           --color-accent: {$colorStore.accent};
           --color-text: {$colorStore.text};
           --color-muted: {$colorStore.muted};
           background: radial-gradient(circle at center,
             {$colorStore.gradientStart}15 0%,
             {$colorStore.gradientEnd}10 50%,
             {$colorStore.gradientEnd}05 100%
           );"
    in:fade
  >
    <!-- Header Section -->
    <div class="py-4 border-b shadow-lg"
         style="background: linear-gradient(135deg, {$colorStore.gradientStart}15 0%, {$colorStore.gradientEnd}10 100%); border-color: {$colorStore.primary}30;">
      <div class="container mx-auto px-3 sm:px-4 py-2 sm:py-3">
        <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 class="text-lg lg:text-xl font-bold mb-1" style="color: {$colorStore.text};">
              Placeholders Reference
            </h1>
            <p class="text-sm" style="color: {$colorStore.muted};">
              Dynamic content for embeds and messages
            </p>
          </div>

          <!-- Search and Filter -->
          <div class="shrink-0 lg:max-w-md lg:w-full space-y-4">
            <!-- Search Bar -->
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <i class="fa-solid fa-magnifying-glass" style="color: {$colorStore.muted}; font-size: 20px;"></i>
              </div>
              <input
                type="search"
                id="search-placeholders"
                placeholder="Search placeholders..."
                class="block w-full pl-12 pr-4 py-2 sm:py-3 rounded-xl transition-all duration-300 focus:ring-2 focus:outline-hidden "
                style="background: {$colorStore.primary}20; color: {$colorStore.text}; border: 1px solid {$colorStore.primary}30; --tw-ring-color: {$colorStore.accent};"
                bind:value={searchQuery}
                aria-label="Search placeholders"
              >
              {#if searchQuery}
                <button
                  class="absolute inset-y-0 right-0 pr-4 flex items-center transition-colors duration-200 hover:opacity-70"
                  style="color: {$colorStore.muted};"
                  onclick={() => searchQuery = ''}
                  aria-label="Clear search"
                >
                  <i class="fa-solid fa-xmark" style="font-size: 16px;"></i>
                </button>
              {/if}
            </div>

            <!-- Category Filter -->
            <DiscordSelector
              type="custom"
              options={categoryOptions}
              bind:selected={selectedCategory}
              placeholder="All Categories"
              searchable={false}
            />

            <!-- Search Results Info -->
            {#if searchQuery || selectedCategory !== 'all'}
              <div class="text-sm" style="color: {$colorStore.muted};" in:fade={{ duration: 200 }}>
                {totalResults} placeholder{totalResults !== 1 ? 's' : ''} found
              </div>
            {/if}
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="container mx-auto px-4 py-8">
      <!-- Introduction -->
      <div class="max-w-4xl mx-auto mb-12">
        <div class="rounded-2xl p-6 "
             style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15); border: 1px solid {$colorStore.primary}20;">
          <div class="grid md:grid-cols-3 gap-6">
            <div class="text-center">
              <div class="w-12 h-12 mx-auto mb-3 rounded-full flex items-center justify-center"
                   style="background: {$colorStore.primary}20;">
                <i class="fa-solid fa-comment text-2xl" style="color: {$colorStore.primary};"></i>
              </div>
              <h3 class="font-semibold mb-2" style="color: {$colorStore.text};">Messages & Greets</h3>
              <p class="text-sm" style="color: {$colorStore.muted};">Use in welcome messages, custom reactions, and chat
                triggers</p>
            </div>
            <div class="text-center">
              <div class="w-12 h-12 mx-auto mb-3 rounded-full flex items-center justify-center"
                   style="background: {$colorStore.primary}20;">
                <i class="fa-solid fa-code text-2xl" style="color: {$colorStore.primary};"></i>
              </div>
              <h3 class="font-semibold mb-2" style="color: {$colorStore.text};">Embeds</h3>
              <p class="text-sm" style="color: {$colorStore.muted};">Perfect for rich embeds and formatted content</p>
            </div>
            <div class="text-center">
              <div class="w-12 h-12 mx-auto mb-3 rounded-full flex items-center justify-center"
                   style="background: {$colorStore.primary}20;">
                <i class="fa-solid fa-dice text-2xl" style="color: {$colorStore.primary};"></i>
              </div>
              <h3 class="font-semibold mb-2" style="color: {$colorStore.text};">Dynamic Content</h3>
              <p class="text-sm" style="color: {$colorStore.muted};">Generate random content and user-specific
                information</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Important Note -->
      <div class="max-w-4xl mx-auto mb-8">
        <div class="rounded-xl p-4 "
             style="background: linear-gradient(135deg, {$colorStore.accent}20, {$colorStore.accent}30); border: 1px solid {$colorStore.accent}40;">
          <div class="flex items-start gap-3">
            <div class="shrink-0">
              <i class="fa-solid fa-triangle-exclamation text-2xl" style="color: {$colorStore.accent};"></i>
            </div>
            <div>
              <h3 class="font-bold mb-1" style="color: {$colorStore.text};">Important Note</h3>
              <p style="color: {$colorStore.text};">When using placeholders in embeds, avoid %user.mention% and
                %bot.mention% in titles, footers, and field names as they won't display properly.</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Placeholder Categories -->
      <div class="max-w-6xl mx-auto">
        {#if totalResults === 0}
          <div class="text-center py-16" in:fade={{ duration: 300 }}>
            <div class="mb-6">
              <i class="fa-utility-duo fa-regular fa-microchip text-6xl mx-auto mb-4 block"
                 style="--fa-primary-color: {$colorStore.muted}; --fa-secondary-color: {$colorStore.muted}; --fa-primary-opacity: 0.5; --fa-secondary-opacity: 0.3;"></i>
            </div>
            <h3 class="text-2xl font-bold mb-3" style="color: {$colorStore.text};">
              No placeholders found
            </h3>
            <p class="text-lg mb-4" style="color: {$colorStore.muted};">
              No results for "{searchQuery}"
            </p>
            <button
              class="px-4 py-2 rounded-xl transition-all hover:scale-[1.02]"
              style="background: {$colorStore.primary}20; border: 1px solid {$colorStore.primary}30; color: {$colorStore.text};"
              onclick={() => { searchQuery = ''; selectedCategory = 'all'; }}
            >
              Clear filters
            </button>
          </div>
        {:else}
          <div class="space-y-8">
            {#each filteredCategories as category, categoryIndex}
              {#if category.placeholders.length > 0}
                <div class="category-section" in:fly={{ y: 20, duration: 300, delay: categoryIndex * 100 }}>
                  <div class="mb-6">
                    <h2 class="text-2xl font-bold mb-2" style="color: {$colorStore.text};">
                      {category.name} Placeholders
                    </h2>
                    <p class="text-lg" style="color: {$colorStore.muted};">
                      {category.description}
                    </p>
                  </div>

                  <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {#each category.placeholders as placeholder, placeholderIndex}
                      <div
                        class="placeholder-card group rounded-xl p-4  transition-all duration-300 hover:shadow-lg hover:-translate-y-1 cursor-pointer"
                        style="background: linear-gradient(135deg, {$colorStore.gradientStart}08, {$colorStore.gradientMid}12); border: 1px solid {$colorStore.primary}20;"
                        in:fly={{ y: 10, duration: 200, delay: placeholderIndex * 50 }}
                        onclick={() => copyToClipboard(placeholder.code)}
                        tabindex="0"
                        role="button"
                        aria-label="Copy {placeholder.code} to clipboard"
                        onkeydown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            copyToClipboard(placeholder.code);
                          }
                        }}
                      >
                        <div class="flex items-start justify-between mb-3">
                          <code
                            class="text-sm font-mono px-3 py-2 rounded-lg flex-1 mr-3 transition-all duration-300 group-hover:scale-[1.02]"
                            style="background: {$colorStore.primary}15; color: {$colorStore.text}; border: 1px solid {$colorStore.primary}25;"
                          >
                            {placeholder.code}
                          </code>
                          <button
                                  class="shrink-0 p-2 rounded-lg transition-all duration-300 hover:scale-110 active:scale-95"
                            style="background: {$colorStore.primary}10; border: 1px solid {$colorStore.primary}20;"
                                  onclick={(e) => { e.stopPropagation(); copyToClipboard(placeholder.code); }}
                            aria-label="Copy to clipboard"
                          >
                            {#if copiedPlaceholder === placeholder.code && showCopyFeedback}
                              <i class="fa-solid fa-check text-green-500" style="font-size: 16px;"></i>
                            {:else}
                              <i class="fa-solid fa-copy" style="color: {$colorStore.text}; font-size: 16px;"></i>
                            {/if}
                          </button>
                        </div>
                        <p class="text-sm leading-relaxed" style="color: {$colorStore.muted};">
                          {placeholder.description}
                        </p>
                      </div>
                    {/each}
                  </div>
                </div>
              {/if}
            {/each}
          </div>
        {/if}
      </div>
    </div>
  </main>
{/if}

<style>
    /* Placeholder card hover effects */
    .placeholder-card {
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .placeholder-card:hover {
        transform: translateY(-4px);
        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
    }

    .placeholder-card:focus {
        outline: 2px solid var(--color-accent);
        outline-offset: 2px;
    }

    /* Copy feedback animation */
    @keyframes copy-success {
        0% {
            transform: scale(1);
        }
        50% {
            transform: scale(1.1);
        }
        100% {
            transform: scale(1);
        }
    }

    .placeholder-card:active {
        animation: copy-success 0.2s ease-in-out;
    }

    /* Category section animations */
    .category-section {
        scroll-margin-top: 120px;
    }

    /* Code styling */
    code {
        font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', 'Consolas', 'Courier New', monospace;
        font-variant-ligatures: none;
        word-break: break-all;
    }

    /* Responsive improvements */
    @media (max-width: 768px) {
        .placeholder-card {
            margin-bottom: 1rem;
        }

        .placeholder-card code {
            font-size: 0.75rem;
            word-break: break-all;
        }
    }

    /* Accessibility improvements */
    @media (prefers-reduced-motion: reduce) {
        .placeholder-card,
        .placeholder-card:hover {
            transition: none;
            transform: none;
        }
  }

    /* High contrast mode */
    @media (prefers-contrast: more) {
        .placeholder-card {
            border-width: 2px;
        }

        .placeholder-card code {
            border-width: 2px;
        }
  }
</style>