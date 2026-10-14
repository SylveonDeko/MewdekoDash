<!-- routes/placeholders/+page.svelte -->
<script lang="ts">
  import { m } from "$lib/i18n";


  import { onDestroy, onMount } from "svelte";
  import { fade, fly } from "svelte/transition";
  import { colorStore } from "$lib/stores/colorStore";
  import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";
  import ComponentEmbed from "$lib/components/layout/ComponentEmbed.svelte";
  import { buttons, container, header, linkButton, SITE_ORIGIN, separator } from "$lib/componentEmbed";

  const previewEmbed = $derived(container(
    header(
      m.placeholders.pageEmbedBody(),
      `${SITE_ORIGIN}/img/Mewdeko.png`
    ),
    separator(),
    buttons(linkButton(m.placeholders.pageEmbedButton(), `${SITE_ORIGIN}/placeholders`))
  ));

  let mounted = $state(false);
    let searchQuery = $state("");
    let selectedCategory = $state("all");
    let copiedPlaceholder = $state("");
    let showCopyFeedback = $state(false);

  // Category options for DiscordSelector
  const categoryOptions = $derived([
    { id: "all", name: m.placeholders.categoryAll(), icon: "fa-globe" },
    { id: "user", name: m.placeholders.categoryUser(), icon: "fa-user" },
    { id: "server", name: m.placeholders.categoryServer(), icon: "fa-server" },
    { id: "channel", name: m.placeholders.categoryChannel(), icon: "fa-hashtag" },
    { id: "bot", name: m.placeholders.categoryBot(), icon: "fa-robot" },
    { id: "time", name: m.placeholders.categoryTime(), icon: "fa-clock" },
    { id: "stats", name: m.placeholders.categoryStats(), icon: "fa-chart-bar" },
    { id: "random", name: m.placeholders.categoryRandom(), icon: "fa-dice" },
    { id: "gifs", name: m.placeholders.categoryGifs(), icon: "fa-image" },
    { id: "afk", name: m.placeholders.categoryAfk(), icon: "fa-moon" },
    { id: "suggest", name: m.placeholders.categorySuggest(), icon: "fa-lightbulb" },
    { id: "stream", name: m.placeholders.categoryStream(), icon: "fa-video" },
    { id: "birthday", name: m.placeholders.categoryBirthday(), icon: "fa-cake-candles" },
    { id: "chat-trigger", name: m.placeholders.categoryChatTrigger(), icon: "fa-bolt" },
    { id: "giveaway", name: m.placeholders.categoryGiveaway(), icon: "fa-gift" },
    { id: "ban", name: m.placeholders.categoryBan(), icon: "fa-gavel" },
    { id: "inviter", name: m.placeholders.categoryInviter(), icon: "fa-envelope" },
    { id: "xp", name: m.placeholders.categoryXp(), icon: "fa-star" }
  ]);

  // Placeholder data structure
  const placeholderCategories = $derived([
    {
      id: "user",
      name: m.placeholders.categoryUser(),
      description: m.placeholders.categoryUserDescription(),
      placeholders: [
        { code: "%user%", description: m.placeholders.user(), example: "@Username" },
        { code: "%user.mention%", description: m.placeholders.userMention(), example: "@Username" },
        { code: "%user.id%", description: m.placeholders.userId(), example: "123456789012345678" },
        { code: "%user.name%", description: m.placeholders.userName(), example: "Username" },
        { code: "%user.fullname%", description: m.placeholders.userFullname(), example: "Username#1234" },
        { code: "%user.discrim%", description: m.placeholders.userDiscrim(), example: "1234" },
        { code: "%user.avatar%", description: m.placeholders.userAvatar(), example: "https://cdn.discordapp.com/avatars/..." },
        { code: "%user.banner%", description: m.placeholders.userBanner(), example: "https://cdn.discordapp.com/banners/..." },
        { code: "%user.created_time%", description: m.placeholders.userCreatedTime(), example: "14:30" },
        { code: "%user.created_date%", description: m.placeholders.userCreatedDate(), example: "15.06.2020" },
        { code: "%user.joined_time%", description: m.placeholders.userJoinedTime(), example: "09:45" },
        { code: "%user.joined_date%", description: m.placeholders.userJoinedDate(), example: "22.03.2023" }
      ]
    },
    {
      id: "server",
      name: m.placeholders.categoryServer(),
      description: m.placeholders.categoryServerDescription(),
      placeholders: [
        { code: "%server%", description: m.placeholders.server(), example: "My Cool Server" },
        { code: "%server.name%", description: m.placeholders.serverName(), example: "My Cool Server" },
        { code: "%server.id%", description: m.placeholders.serverId(), example: "987654321098765432" },
        { code: "%server.icon%", description: m.placeholders.mcFavicon(), example: "https://cdn.discordapp.com/icons/..." },
        {
          code: "%server.banner%",
          description: m.placeholders.serverBanner(),
          example: "https://cdn.discordapp.com/banners/..."
        },
        { code: "%server.members%", description: m.placeholders.serverMembers(), example: "1,234" },
        { code: "%server.members.online%", description: m.placeholders.serverMembersOnline(), example: "523" },
        { code: "%server.members.offline%", description: m.placeholders.serverMembersOffline(), example: "711" },
        { code: "%server.members.dnd%", description: m.placeholders.serverMembersDnd(), example: "45" },
        { code: "%server.members.idle%", description: m.placeholders.serverMembersIdle(), example: "89" },
        { code: "%server.boostlevel%", description: m.placeholders.serverBoostlevel(), example: "2" },
        { code: "%server.boostcount%", description: m.placeholders.serverBoostcount(), example: "14" },
        { code: "%server.time%", description: m.placeholders.serverTime(), example: "14:30 PST" },
        {
          code: "%server.timestamp.longdatetime%",
          description: m.placeholders.serverTimestampLongdatetime(),
          example: "<t:1234567890:F>"
        },
        {
          code: "%server.timestamp.longtime%",
          description: m.placeholders.serverTimestampLongtime(),
          example: "<t:1234567890:T>"
        },
        {
          code: "%server.timestamp.longdate%",
          description: m.placeholders.serverTimestampLongdate(),
          example: "<t:1234567890:D>"
        },
        {
          code: "%server.timestamp.shortdatetime%",
          description: m.placeholders.serverTimestampShortdatetime(),
          example: "<t:1234567890>"
        }
      ]
    },
    {
      id: "channel",
      name: m.placeholders.categoryChannel(),
      description: m.placeholders.categoryChannelDescription(),
      placeholders: [
        { code: "%channel%", description: m.placeholders.channel(), example: "#general" },
        { code: "%channel.mention%", description: m.placeholders.channel(), example: "#general" },
        { code: "%channel.name%", description: m.placeholders.channelName(), example: "general" },
        { code: "%channel.id%", description: m.placeholders.channelId(), example: "123456789012345678" },
        { code: "%channel.created%", description: m.placeholders.channelCreated(), example: "14:30 15.06.2020" },
        { code: "%channel.nsfw%", description: m.placeholders.channelNsfw(), example: "True" },
        { code: "%channel.topic%", description: m.placeholders.channelTopic(), example: "Welcome to the general chat!" }
      ]
    },
    {
      id: "bot",
      name: m.placeholders.categoryBot(),
      description: m.placeholders.categoryBotDescription(),
      placeholders: [
        { code: "%bot.status%", description: m.placeholders.botStatus(), example: "Online" },
        { code: "%bot.latency%", description: m.placeholders.botLatency(), example: "45" },
        { code: "%bot.name%", description: m.placeholders.botName(), example: "Mewdeko" },
        { code: "%bot.fullname%", description: m.placeholders.botFullname(), example: "Mewdeko#0000" },
        { code: "%bot.discrim%", description: m.placeholders.botDiscrim(), example: "0000" },
        { code: "%bot.id%", description: m.placeholders.botId(), example: "752236274261426994" },
        { code: "%bot.avatar%", description: m.placeholders.botAvatar(), example: "https://cdn.discordapp.com/avatars/..." },
        { code: "%bot.time%", description: m.placeholders.botTime(), example: "14:30 PST" }
      ]
    },
    {
      id: "time",
      name: m.placeholders.categoryTime(),
      description: m.placeholders.categoryTimeDescription(),
      placeholders: [
        { code: "%time.month%", description: m.placeholders.month(), example: "December" },
        { code: "%time.day%", description: m.placeholders.timeDay(), example: "Monday" },
        { code: "%time.year%", description: m.placeholders.timeYear(), example: "2025" }
      ]
    },
    {
      id: "stats",
      name: m.placeholders.categoryStats(),
      description: m.placeholders.categoryStatsDescription(),
      placeholders: [
        { code: "%shard.servercount%", description: m.placeholders.shardServercount(), example: "1,234" },
        { code: "%shard.usercount%", description: m.placeholders.shardUsercount(), example: "456,789" }
      ]
    },
    {
      id: "random",
      name: m.placeholders.categoryRandom(),
      description: m.placeholders.categoryRandomDescription(),
      placeholders: [
        { code: "%rng%", description: m.placeholders.rng(), example: "7" },
        { code: "%rng(1,100)%", description: m.placeholders.rngRange(), example: "42" },
        { code: "%choose(a|b|c)%", description: m.placeholders.choose(), example: "b" },
        { code: "%target%", description: m.placeholders.target(), example: "user input text" },
        { code: "%img:query%", description: m.placeholders.img(), example: "https://imgur.com/..." }
      ]
    },
    {
      id: "gifs",
      name: m.placeholders.categoryGifs(),
      description: m.placeholders.categoryGifsDescription(),
      placeholders: [
        { code: "%bakagif%", description: m.placeholders.gifBaka(), example: "https://nekos.best/api/v2/baka" },
        { code: "%bitegif%", description: m.placeholders.gifBite(), example: "https://nekos.best/api/v2/bite" },
        { code: "%blushgif%", description: m.placeholders.gifBlush(), example: "https://nekos.best/api/v2/blush" },
        { code: "%boredgif%", description: m.placeholders.gifBored(), example: "https://nekos.best/api/v2/bored" },
        { code: "%crygif%", description: m.placeholders.gifCry(), example: "https://nekos.best/api/v2/cry" },
        { code: "%cuddlegif%", description: m.placeholders.gifCuddle(), example: "https://nekos.best/api/v2/cuddle" },
        { code: "%dancegif%", description: m.placeholders.gifDance(), example: "https://nekos.best/api/v2/dance" },
        {
          code: "%facepalmgif%",
          description: m.placeholders.gifFacepalm(),
          example: "https://nekos.best/api/v2/facepalm"
        },
        { code: "%feedgif%", description: m.placeholders.gifFeed(), example: "https://nekos.best/api/v2/feed" },
        {
          code: "%handholdgif%",
          description: m.placeholders.gifHandhold(),
          example: "https://nekos.best/api/v2/handhold"
        },
        { code: "%happygif%", description: m.placeholders.gifHappy(), example: "https://nekos.best/api/v2/happy" },
        {
          code: "%highfivegif%",
          description: m.placeholders.gifHighfive(),
          example: "https://nekos.best/api/v2/highfive"
        },
        { code: "%huggif%", description: m.placeholders.gifHug(), example: "https://nekos.best/api/v2/hug" },
        { code: "%kickgif%", description: m.placeholders.gifKick(), example: "https://nekos.best/api/v2/kick" },
        { code: "%kissgif%", description: m.placeholders.gifKiss(), example: "https://nekos.best/api/v2/kiss" },
        { code: "%laughgif%", description: m.placeholders.gifLaugh(), example: "https://nekos.best/api/v2/laugh" },
        { code: "%patgif%", description: m.placeholders.gifPat(), example: "https://nekos.best/api/v2/pat" },
        { code: "%pokegif%", description: m.placeholders.gifPoke(), example: "https://nekos.best/api/v2/poke" },
        { code: "%poutgif%", description: m.placeholders.gifPout(), example: "https://nekos.best/api/v2/pout" },
        { code: "%punchgif%", description: m.placeholders.gifPunch(), example: "https://nekos.best/api/v2/punch" },
        { code: "%shootgif%", description: m.placeholders.gifShoot(), example: "https://nekos.best/api/v2/shoot" },
        { code: "%shruggif%", description: m.placeholders.gifShrug(), example: "https://nekos.best/api/v2/shrug" },
        { code: "%slapgif%", description: m.placeholders.gifSlap(), example: "https://nekos.best/api/v2/slap" },
        { code: "%sleepgif%", description: m.placeholders.gifSleep(), example: "https://nekos.best/api/v2/sleep" },
        { code: "%smilegif%", description: m.placeholders.gifSmile(), example: "https://nekos.best/api/v2/smile" },
        { code: "%smuggif%", description: m.placeholders.gifSmug(), example: "https://nekos.best/api/v2/smug" },
        { code: "%staregif%", description: m.placeholders.gifStare(), example: "https://nekos.best/api/v2/stare" },
        { code: "%thinkgif%", description: m.placeholders.gifThink(), example: "https://nekos.best/api/v2/think" },
        {
          code: "%thumbsupgif%",
          description: m.placeholders.gifThumbsup(),
          example: "https://nekos.best/api/v2/thumbsup"
        },
        { code: "%ticklegif%", description: m.placeholders.gifTickle(), example: "https://nekos.best/api/v2/tickle" },
        { code: "%wavegif%", description: m.placeholders.gifWave(), example: "https://nekos.best/api/v2/wave" },
        { code: "%winkgif%", description: m.placeholders.gifWink(), example: "https://nekos.best/api/v2/wink" }
      ]
    },
    {
      id: "afk",
      name: m.placeholders.categoryAfk(),
      description: m.placeholders.categoryAfkDescription(),
      placeholders: [
        { code: "%afk.message%", description: m.placeholders.afkMessage() },
        { code: "%afk.user%", description: m.placeholders.afkUser() },
        { code: "%afk.user.mention%", description: m.placeholders.afkUserMention() },
        { code: "%afk.user.avatar%", description: m.placeholders.afkUserAvatar() },
        { code: "%afk.user.id%", description: m.placeholders.afkUserId() },
        { code: "%afk.triggeruser%", description: m.placeholders.afkTriggeruser() },
        { code: "%afk.triggeruser.avatar%", description: m.placeholders.afkTriggeruserAvatar() },
        { code: "%afk.triggeruser.mention%", description: m.placeholders.afkTriggeruserMention() },
        { code: "%afk.triggeruser.id%", description: m.placeholders.afkTriggeruserId() },
        { code: "%afk.time%", description: m.placeholders.afkTime() }
      ]
    },
    {
      id: "suggest",
      name: m.placeholders.categorySuggest(),
      description: m.placeholders.categorySuggestDescription(),
      placeholders: [
        { code: "%suggest.user%", description: m.placeholders.suggestUser() },
        { code: "%suggest.user.id%", description: m.placeholders.suggestUserId() },
        { code: "%suggest.message%", description: m.placeholders.suggestMessage() },
        { code: "%suggest.number%", description: m.placeholders.suggestNumber() },
        { code: "%suggest.user.name%", description: m.placeholders.suggestUserName() },
        { code: "%suggest.user.avatar%", description: m.placeholders.suggestUserAvatar() },
        { code: "%suggest.mod.user%", description: m.placeholders.suggestModUser() },
        { code: "%suggest.mod.avatar%", description: m.placeholders.suggestModAvatar() },
        { code: "%suggest.mod.name%", description: m.placeholders.suggestModName() },
        { code: "%suggest.mod.message%", description: m.placeholders.suggestModMessage() },
        { code: "%suggest.mod.Id%", description: m.placeholders.suggestModId() },
        { code: "%suggest.emote1count%", description: m.placeholders.suggestEmote1count() },
        { code: "%suggest.emote2count%", description: m.placeholders.suggestEmote2count() },
        { code: "%suggest.emote3count%", description: m.placeholders.suggestEmote3count() },
        { code: "%suggest.emote4count%", description: m.placeholders.suggestEmote4count() },
        { code: "%suggest.emote5count%", description: m.placeholders.suggestEmote5count() }
      ]
    },
    {
      id: "stream",
      name: m.placeholders.categoryStream(),
      description: m.placeholders.categoryStreamDescription(),
      placeholders: [
        { code: "%stream.name%", description: m.placeholders.streamName() },
        { code: "%stream.username%", description: m.placeholders.streamUsername() },
        { code: "%stream.url%", description: m.placeholders.streamUrl() },
        { code: "%stream.title%", description: m.placeholders.streamTitle() },
        { code: "%stream.game%", description: m.placeholders.streamGame() },
        { code: "%stream.viewers%", description: m.placeholders.streamViewers() },
        { code: "%stream.platform%", description: m.placeholders.streamPlatform() },
        { code: "%stream.avatar%", description: m.placeholders.streamAvatar() },
        { code: "%stream.preview%", description: m.placeholders.streamPreview() },
        { code: "%stream.status%", description: m.placeholders.streamStatus() },
        { code: "%stream.channelid%", description: m.placeholders.streamChannelid() }
      ]
    },
    {
      id: "birthday",
      name: m.placeholders.categoryBirthday(),
      description: m.placeholders.categoryBirthdayDescription(),
      placeholders: [
        { code: "%birthday.age%", description: m.placeholders.birthdayAge() }
      ]
    },
    {
      id: "chat-trigger",
      name: m.placeholders.categoryChatTrigger(),
      description: m.placeholders.categoryChatTriggerDescription(),
      placeholders: [
        { code: "%target%", description: m.placeholders.target() }
      ]
    },
    {
      id: "giveaway",
      name: m.placeholders.categoryGiveaway(),
      description: m.placeholders.categoryGiveawayDescription(),
      placeholders: [
        { code: "%messagelink%", description: m.placeholders.messagelink() },
        { code: "%giveawayitem%", description: m.placeholders.giveawayitem() },
        { code: "%giveawaywinners%", description: m.placeholders.giveawaywinners() }
      ]
    },
    {
      id: "ban",
      name: m.placeholders.categoryBan(),
      description: m.placeholders.categoryBanDescription(),
      placeholders: [
        { code: "%ban.mod%", description: m.placeholders.banMod() },
        { code: "%ban.mod.fullname%", description: m.placeholders.banMod() },
        { code: "%ban.mod.name%", description: m.placeholders.banModName() },
        { code: "%ban.mod.discrim%", description: m.placeholders.banModDiscrim() },
        { code: "%ban.user%", description: m.placeholders.banUser() },
        { code: "%ban.user.fullname%", description: m.placeholders.banUser() },
        { code: "%ban.user.name%", description: m.placeholders.banUserName() },
        { code: "%ban.user.discrim%", description: m.placeholders.banUserDiscrim() },
        { code: "%reason%", description: m.placeholders.banReason() },
        { code: "%ban.reason%", description: m.placeholders.banReason() },
        { code: "%ban.duration%", description: m.placeholders.banDuration() }
      ]
    },
    {
      id: "inviter",
      name: m.placeholders.categoryInviter(),
      description: m.placeholders.categoryInviterDescription(),
      placeholders: [
        { code: "%inviter.username%", description: m.placeholders.inviterUsername() },
        { code: "%inviter.avatar%", description: m.placeholders.inviterAvatar() },
        { code: "%inviter.id%", description: m.placeholders.inviterId() },
        { code: "%inviter.mention%", description: m.placeholders.inviterMention() },
        { code: "%inviter.count%", description: m.placeholders.inviterCount() }
      ]
    },
    {
      id: "xp",
      name: m.placeholders.categoryXp(),
      description: m.placeholders.categoryXpDescription(),
      placeholders: [
        { code: "%xp.user%", description: m.placeholders.xpUser() },
        { code: "%xp.user.mention%", description: m.placeholders.xpUserMention() },
        { code: "%xp.user.name%", description: m.placeholders.user() },
        { code: "%xp.user.displayname%", description: m.placeholders.xpUserDisplayname() },
        { code: "%xp.user.nickname%", description: m.placeholders.xpUserNickname() },
        { code: "%xp.user.avatar%", description: m.placeholders.xpUserAvatar() },
        { code: "%xp.user.id%", description: m.placeholders.xpUserId() },
        { code: "%xp.user.created%", description: m.placeholders.xpUserCreated() },
        { code: "%xp.user.joined%", description: m.placeholders.xpUserJoined() },
        { code: "%xp.level.old%", description: m.placeholders.xpLevelOld() },
        { code: "%xp.level.new%", description: m.placeholders.xpLevelNew() },
        { code: "%xp.level.current%", description: m.placeholders.xpLevelCurrent() },
        { code: "%xp.level.next%", description: m.placeholders.xpLevelNext() },
        { code: "%xp.level.difference%", description: m.placeholders.xpLevelDifference() },
        { code: "%xp.total%", description: m.placeholders.xpTotal() },
        { code: "%xp.current%", description: m.placeholders.xpCurrent() },
        { code: "%xp.needed%", description: m.placeholders.xpNeeded() },
        { code: "%xp.remaining%", description: m.placeholders.xpRemaining() },
        { code: "%xp.gained%", description: m.placeholders.xpGained() },
        { code: "%xp.progress%", description: m.placeholders.xpProgress() },
        { code: "%xp.rank%", description: m.placeholders.xpRank() },
        { code: "%xp.rank.ordinal%", description: m.placeholders.xpRankOrdinal() },
        { code: "%xp.rank.suffix%", description: m.placeholders.xpRankSuffix() },
        { code: "%xp.guild%", description: m.placeholders.xpGuild() },
        { code: "%xp.guild.name%", description: m.placeholders.xpGuild() },
        { code: "%xp.guild.id%", description: m.placeholders.xpGuildId() },
        { code: "%xp.guild.membercount%", description: m.placeholders.xpGuildMembercount() },
        { code: "%xp.guild.icon%", description: m.placeholders.mcFavicon() },
        { code: "%xp.guild.banner%", description: m.placeholders.serverBanner() },
        { code: "%xp.channel%", description: m.placeholders.xpChannel() },
        { code: "%xp.channel.mention%", description: m.placeholders.xpChannel() },
        { code: "%xp.channel.name%", description: m.placeholders.xpChannelName() },
        { code: "%xp.channel.id%", description: m.placeholders.xpChannelId() },
        { code: "%xp.triggeruser%", description: m.placeholders.xpTriggeruser() },
        { code: "%xp.triggeruser.mention%", description: m.placeholders.xpTriggeruserMention() },
        { code: "%xp.triggeruser.name%", description: m.placeholders.xpTriggeruserName() },
        { code: "%xp.triggeruser.avatar%", description: m.placeholders.xpTriggeruserAvatar() },
        { code: "%xp.triggeruser.id%", description: m.placeholders.xpTriggeruserId() },
        { code: "%xp.time%", description: m.placeholders.xpTime() },
        { code: "%xp.time.full%", description: m.placeholders.xpTimeFull() },
        { code: "%xp.date%", description: m.placeholders.xpDate() },
        { code: "%xp.timestamp%", description: m.placeholders.xpTimestamp() },
        { code: "%xp.timestamp.relative%", description: m.placeholders.xpTimestampRelative() }
      ]
    }
  ]);

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

<ComponentEmbed embed={previewEmbed} />

<svelte:head>
  <title>{m.placeholders.pageTitle()}</title>
  <meta
    content={m.placeholders.pageTitle()}
    property="og:title"
  >
  <meta content={m.placeholders.pageDescription()} name="description" />
  <meta
    content={m.placeholders.pageDescription()}
    property="og:description"
  >
  <meta
    content={m.placeholders.pageDescription()}
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
              {m.placeholders.pageHeading()}
            </h1>
            <p class="text-sm" style="color: {$colorStore.muted};">
              {m.placeholders.pageSubheading()}
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
                placeholder={m.placeholders.pickerSearchPlaceholder()}
                class="block w-full pl-12 pr-4 py-2 sm:py-3 rounded-xl transition-all duration-300 focus:ring-2 focus:outline-hidden "
                style="background: {$colorStore.primary}20; color: {$colorStore.text}; border: 1px solid {$colorStore.primary}30; --tw-ring-color: {$colorStore.accent};"
                bind:value={searchQuery}
                aria-label={m.placeholders.pickerSearchLabel()}
              >
              {#if searchQuery}
                <button
                  class="absolute inset-y-0 right-0 pr-4 flex items-center transition-colors duration-200 hover:opacity-70"
                  style="color: {$colorStore.muted};"
                  onclick={() => searchQuery = ''}
                  aria-label={m.common.ariaClearSearch()}
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
              placeholder={m.placeholders.categoryAll()}
              searchable={false}
            />

            <!-- Search Results Info -->
            {#if searchQuery || selectedCategory !== 'all'}
              <div class="text-sm" style="color: {$colorStore.muted};" in:fade={{ duration: 200 }}>
                {totalResults === 1 ? m.placeholders.pageResultsOne({ count: totalResults }) : m.placeholders.pageResultsOther({ count: totalResults })}
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
              <h3 class="font-semibold mb-2" style="color: {$colorStore.text};">{m.placeholders.pageFeatureMessagesTitle()}</h3>
              <p class="text-sm" style="color: {$colorStore.muted};">{m.placeholders.pageFeatureMessagesBody()}</p>
            </div>
            <div class="text-center">
              <div class="w-12 h-12 mx-auto mb-3 rounded-full flex items-center justify-center"
                   style="background: {$colorStore.primary}20;">
                <i class="fa-solid fa-code text-2xl" style="color: {$colorStore.primary};"></i>
              </div>
              <h3 class="font-semibold mb-2" style="color: {$colorStore.text};">{m.placeholders.pageFeatureEmbedsTitle()}</h3>
              <p class="text-sm" style="color: {$colorStore.muted};">{m.placeholders.pageFeatureEmbedsBody()}</p>
            </div>
            <div class="text-center">
              <div class="w-12 h-12 mx-auto mb-3 rounded-full flex items-center justify-center"
                   style="background: {$colorStore.primary}20;">
                <i class="fa-solid fa-dice text-2xl" style="color: {$colorStore.primary};"></i>
              </div>
              <h3 class="font-semibold mb-2" style="color: {$colorStore.text};">{m.placeholders.pageFeatureDynamicTitle()}</h3>
              <p class="text-sm" style="color: {$colorStore.muted};">{m.placeholders.pageFeatureDynamicBody()}</p>
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
              <h3 class="font-bold mb-1" style="color: {$colorStore.text};">{m.placeholders.pageNoteTitle()}</h3>
              <p style="color: {$colorStore.text};">{m.placeholders.pageNoteBody()}</p>
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
              {m.placeholders.pickerEmpty()}
            </h3>
            <p class="text-lg mb-4" style="color: {$colorStore.muted};">
              {m.placeholders.pageNoResults({ query: searchQuery })}
            </p>
            <button
              class="px-4 py-2 rounded-xl transition-all hover:scale-[1.02]"
              style="background: {$colorStore.primary}20; border: 1px solid {$colorStore.primary}30; color: {$colorStore.text};"
              onclick={() => { searchQuery = ''; selectedCategory = 'all'; }}
            >
              {m.placeholders.pageClearFilters()}
            </button>
          </div>
        {:else}
          <div class="space-y-8">
            {#each filteredCategories as category, categoryIndex}
              {#if category.placeholders.length > 0}
                <div class="category-section" in:fly={{ y: 20, duration: 300, delay: categoryIndex * 100 }}>
                  <div class="mb-6">
                    <h2 class="text-2xl font-bold mb-2" style="color: {$colorStore.text};">
                      {m.placeholders.pageSectionHeading({ category: category.name })}
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
                        aria-label={m.placeholders.pageCopyCode({ code: placeholder.code })}
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
                            aria-label={m.common.copyToClipboard()}
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