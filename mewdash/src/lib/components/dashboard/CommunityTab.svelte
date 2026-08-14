<!-- lib/components/dashboard/CommunityTab.svelte -->
<script lang="ts">
    import {fly} from "svelte/transition";
    import {onMount} from "svelte";
    import {colorStore} from "$lib/stores/colorStore";
    import {currentGuild} from "$lib/stores/currentGuild";
    import {inviteStore} from "$lib/stores/inviteStore";
    import {
      xpApi,
      messageCountApi,
      clientApi,
      patreonApi,
      birthdayApi,
      ticketApi,
      countingApi,
      starboardApi,
      formsApi,
      type MessageStatsResponse,
      type Form,
      type BirthdayUser
    } from "$lib/api/index.ts";
    import {logger} from "$lib/logger";


    interface Props {
    // Props from parent
    guildFeatures: any;
    memberStats: any;
  }

    let { guildFeatures: _guildFeatures, memberStats }: Props = $props();

  // Real data from API
  let xpLeaderboard: any[] = $state([]);
  let starboardHighlights: any[] = $state([]);
  let loading = $state(true);
  let dailyMessages = $state(0);
  let messageCountEnabled = $state(false);
  let activeMembers = $state(0);

  // Enhanced message stats
  let messageStatsData: MessageStatsResponse | null = $state(null);
  let topActiveUsers: any[] = $state([]);

  // Patreon data
  let patreonConnected = $state(false);
  let patreonSupporters = $state(0);

  // Birthday data
    let todaysBirthdays: BirthdayUser[] = $state([]);
    let upcomingBirthdays: BirthdayUser[] = $state([]);

  // Tickets data
  let ticketStats = $state({
    totalTickets: 0,
    openTickets: 0,
    closedToday: 0,
    activeStaff: 0
  });

  // Counting data
  let countingChannels: any[] = $state([]);
  let topCountingChannel: any = $state(null);

    // Forms data
    let forms: Form[] = $state([]);
    let totalFormResponses = $state(0);

  async function fetchCommunityData() {
    if (!$currentGuild?.id) return;

    try {
      // Fetch all data in parallel for better performance
      const [leaderboardData, xpStats, messageStats, messageStatsDetailed, guildMembers, patreonStatus, patreonSupportersData, todaysBirthdaysData, upcomingBirthdaysData, ticketStatsData, countingChannelsData, formsData] = await Promise.all([
        xpApi.getXpLeaderboard($currentGuild.id, 1, 3),
        xpApi.getXpServerStats($currentGuild.id),
        messageCountApi.getDailyMessageStats($currentGuild.id).catch(() => ({ enabled: false, dailyMessages: 0 })), // Handle case where message count isn't enabled
        messageCountApi.getMessageStats($currentGuild.id).catch(() => null), // Enhanced message stats
        clientApi.getMembers($currentGuild.id).catch(() => []), // Guild members for user enrichment
        patreonApi.getPatreonOAuthStatus($currentGuild.id).catch(() => ({ isConfigured: false })),
        patreonApi.getPatreonSupporters($currentGuild.id).catch(() => []),
        birthdayApi.getBirthdayToday($currentGuild.id).catch(() => []),
        birthdayApi.getBirthdayUpcoming($currentGuild.id, 7).catch(() => []),
        ticketApi.getTicketStats($currentGuild.id).catch(() => ({
          totalTickets: 0,
          openTickets: 0,
          closedTickets: 0,
          activeStaff: 0
        })),
        countingApi.getCountingChannels($currentGuild.id).catch(() => []), // Counting channels
        formsApi.getGuildForms($currentGuild.id, true).catch(() => []) // Active forms only
      ]);

      // Process XP leaderboard data
      xpLeaderboard = leaderboardData.map(entry => ({
        userId: entry.userId.toString(),
        username: entry.username,
        level: entry.level,
        xp: entry.totalXp,
        avatar: entry.avatarUrl,
        rank: entry.rank
      }));

      // Process XP stats for active members calculation - use actual XP users as engagement indicator
      activeMembers = xpStats.totalUsers || 0;

      // Process message count stats
      messageCountEnabled = messageStats.enabled;
      dailyMessages = messageStats.dailyMessages || 0;

      // Process enhanced message stats
      messageStatsData = messageStatsDetailed;
      if (messageStatsData) {
        // Enhance topActiveUsers with user data from guild members
        topActiveUsers = (messageStatsData.topUsers || []).slice(0, 5).map((messageUser) => {
          const member = guildMembers?.find(m => m?.id?.toString() === messageUser.userId);
          return {
            ...messageUser,
            username: member?.username || 'Unknown User',
            discriminator: '0000', // Discord no longer uses discriminators for most users
            avatarUrl: member?.avatarUrl || `https://cdn.discordapp.com/embed/avatars/0.png`
          };
        });
      }

      // Process Patreon data
      patreonConnected = patreonStatus.isConfigured || false;
      patreonSupporters = patreonSupportersData?.length || 0;

      // Process Birthday data
      todaysBirthdays = todaysBirthdaysData || [];
      upcomingBirthdays = upcomingBirthdaysData?.slice(0, 5) || []; // Show top 5 upcoming

      // Process Tickets data
      ticketStats = {
        totalTickets: ticketStatsData?.totalTickets || 0,
        openTickets: ticketStatsData?.openTickets || 0,
        closedToday: ticketStatsData?.closedTickets || 0,
        activeStaff: (ticketStatsData as any)?.activeStaff || 0
      };

      // Process Counting data
      countingChannels = countingChannelsData || [];

      // Find the most active counting channel
      if (countingChannels.length > 0) {
        topCountingChannel = countingChannels
          .filter(channel => channel.isActive)
          .sort((a, b) => b.currentNumber - a.currentNumber)[0] || countingChannels[0];
      }

      // Process Forms data
      forms = formsData || [];
      totalFormResponses = forms.reduce((sum, form) => sum + (form.responseCount || 0), 0);

      // Fetch starboard highlights
      try {
        const starboardData = await starboardApi.getStarboardHighlights($currentGuild.id, 3);
        starboardHighlights = starboardData || [];
      } catch (err) {
        // Starboard may not be enabled or no highlights available
        starboardHighlights = [];
      }

    } catch (err) {
      logger.error("Failed to fetch community data:", err);
      // Reset to empty states on error
      xpLeaderboard = [];
      starboardHighlights = [];
      activeMembers = Math.floor((memberStats?.totalMembers || 0) * 0.7);
    } finally {
      loading = false;
    }
  }

  onMount(() => {
    fetchCommunityData();
  });

    $effect(() => {
    if ($currentGuild) {
      fetchCommunityData();
    }
  });
</script>

<div class="space-y-4" in:fly={{ y: 20, duration: 300 }}>
  <!-- Row 1: Main Content -->
  <div class="grid grid-cols-1 lg:grid-cols-12 gap-4">
    
    <!-- Column 1: XP & Activity (6 columns) -->
    <div class="lg:col-span-6 space-y-4">
      <!-- XP Leaderboard -->
      <div
        class=" rounded-xl p-4 transition-all hover:shadow-lg hover:-translate-y-px border"
              style="background: {$colorStore.primary}05;
               border-color: {$colorStore.primary}15;">
        <div class="flex items-center gap-3 mb-4">
          <div class="p-2 rounded-lg"
               style="background: linear-gradient(135deg, {$colorStore.primary}20, {$colorStore.secondary}20);">
            <i class="fa-utility-duo fa-regular fa-star text-xl"
               style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary};"></i>
          </div>
          <h2 class="text-lg font-bold" style="color: {$colorStore.text}">XP Leaderboard</h2>
        </div>

      <div class="space-y-2">
        {#if loading}
          <!-- Loading state -->
          {#each Array(3).fill(0) as _, index (index)}
            <div class="flex items-center gap-3 p-2 rounded-lg animate-pulse"
                 style="background: {$colorStore.primary}08;">
              <div class="w-6 h-6 rounded-full" style="background: {$colorStore.primary}20;"></div>
              <div class="w-8 h-8 rounded-full" style="background: {$colorStore.primary}20;"></div>
              <div class="flex-1 space-y-1">
                  <div class="h-3 rounded-sm" style="background: {$colorStore.primary}20; width: 60%;"></div>
                  <div class="h-2 rounded-sm" style="background: {$colorStore.primary}15; width: 80%;"></div>
              </div>
                <div class="w-10 h-4 rounded-sm" style="background: {$colorStore.primary}20;"></div>
            </div>
          {/each}
        {:else if xpLeaderboard.length === 0}
          <!-- Empty state -->
          <div class="text-center py-6">
            <i class="fa-utility-duo fa-regular fa-star text-4xl mx-auto mb-3 block"
               style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.primary}; --fa-primary-opacity: 0.5; --fa-secondary-opacity: 0.3;"></i>
            <h3 class="text-base font-semibold mb-1" style="color: {$colorStore.text}">No XP Data</h3>
            <p class="text-xs" style="color: {$colorStore.muted}">
              No members have earned XP yet. Get active in the server!
            </p>
          </div>
        {:else}
          {#each xpLeaderboard as user, index (user.userId)}
            <div class="flex items-center gap-3 p-2 rounded-lg transition-all hover:scale-[1.01]"
                 style="background: {index < 3 ? $colorStore.primary + '15' : $colorStore.primary + '08'};">
              <!-- Rank Badge -->
              <div class="w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs"
                   style="background: {index < 3 ? $colorStore.accent : $colorStore.primary}40; 
                          color: {index < 3 ? $colorStore.accent : $colorStore.primary};">
                {user.rank || index + 1}
              </div>

              <!-- Avatar -->
              <img src={user.avatar || `https://cdn.discordapp.com/embed/avatars/${index % 5}.png`}
                   alt="" class="w-8 h-8 rounded-full" />

              <!-- User Info -->
              <div class="flex-1 min-w-0">
                <div class="font-medium truncate text-sm" style="color: {$colorStore.text}">
                  {user.username}
                </div>
                <div class="text-xs" style="color: {$colorStore.muted}">
                  Level {user.level} • {user.xp.toLocaleString()} XP
                </div>
              </div>

              <!-- Level Badge -->
                <div class="px-2 py-1 rounded-sm text-xs font-medium"
                   style="background: {$colorStore.secondary}20; color: {$colorStore.secondary}">
                Lvl {user.level}
              </div>
            </div>
          {/each}
        {/if}
      </div>

      <!-- View More Button -->
        <a
          class="w-full mt-3 flex items-center justify-center gap-2 py-2 px-3 rounded-lg transition-all hover:scale-[1.02] text-sm"
         href="/dashboard/xp"
         style="background: {$colorStore.primary}20; color: {$colorStore.primary}; border: 1px solid {$colorStore.primary}30;">
        <i class="fa-utility-duo fa-regular fa-arrow-right"
           style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary};"></i>
        View Full XP Dashboard
      </a>
    </div>

      <!-- Community Activity List -->
      <div class="space-y-3">

        <!-- Birthday Celebrations Card -->
        <div class=" rounded-lg p-3 transition-all hover:shadow-md border"
               style="background: {$colorStore.primary}05;
                    border-color: {$colorStore.primary}15;">
        <div class="flex items-center justify-between mb-2">
          <h3 class="text-sm font-semibold" style="color: {$colorStore.text}">Birthdays</h3>
          <a href="/dashboard/birthday" class="text-xs" style="color: {$colorStore.primary}">View all</a>
        </div>

        {#if todaysBirthdays.length > 0 || upcomingBirthdays.length > 0}
          <div class="p-2 rounded-lg" style="background: {$colorStore.primary}08;">
            {#if todaysBirthdays.length > 0}
              <!-- Today's Birthdays (Compact) -->
              <div class="flex items-center gap-2 mb-2">
                <i class="fa-utility-duo fa-regular fa-birthday-cake text-sm"
                   style="--fa-primary-color: {$colorStore.accent}; --fa-secondary-color: {$colorStore.primary};"></i>
                <span class="text-xs font-medium" style="color: {$colorStore.text}">Today</span>
              </div>
              <div class="flex flex-wrap gap-1 mb-2">
                {#each todaysBirthdays.slice(0, 3) as user (user.userId)}
                    <div class="flex items-center gap-1 px-2 py-1 rounded-sm"
                       style="background: {$colorStore.accent}15;">
                    <img src={user.avatarUrl || `https://cdn.discordapp.com/embed/avatars/0.png`}
                         alt="" class="w-4 h-4 rounded-full" />
                    <span class="text-xs font-medium" style="color: {$colorStore.text}">
                      {user.nickname || user.username}
                    </span>
                  </div>
                {/each}
                {#if todaysBirthdays.length > 3}
                  <span class="text-xs px-2 py-1" style="color: {$colorStore.muted}">
                    +{todaysBirthdays.length - 3}
                  </span>
                {/if}
              </div>
            {/if}
            
            {#if upcomingBirthdays.length > 0}
              <!-- Upcoming (Ultra Compact) -->
              <div class="text-xs" style="color: {$colorStore.muted}">
                <span class="font-medium">Coming up:</span>
                {#each upcomingBirthdays.slice(0, 2) as user, index (user.userId)}
                  <span>{user.nickname || user.username} ({user.daysUntil}
                    d){index < 1 && upcomingBirthdays.length > 1 ? ', ' : ''}</span>
                {/each}
                {#if upcomingBirthdays.length > 2}
                  <span> +{upcomingBirthdays.length - 2} more</span>
                {/if}
              </div>
            {/if}
          </div>
        {:else}
          <div class="p-2 rounded-lg text-center" style="background: {$colorStore.primary}08;">
            <p class="text-xs" style="color: {$colorStore.muted}">No birthdays this week</p>
          </div>
        {/if}
        </div>

        <!-- Message Activity Card -->
        <div class=" rounded-lg p-3 transition-all hover:shadow-md border"
               style="background: {$colorStore.primary}05;
                    border-color: {$colorStore.primary}15;">
        <div class="flex items-center justify-between mb-2">
          <h3 class="text-sm font-semibold" style="color: {$colorStore.text}">Message Activity</h3>
          {#if messageCountEnabled}
            <a href="/dashboard/messagestats" class="text-xs" style="color: {$colorStore.primary}">Details</a>
          {/if}
        </div>
        
        {#if !messageCountEnabled}
          <div class="p-2 rounded-lg text-center" style="background: {$colorStore.primary}08;">
            <p class="text-xs" style="color: {$colorStore.muted}">Message tracking disabled</p>
          </div>
        {:else}
          <!-- Compact Stats Card -->
          <div class="p-2 rounded-lg" style="background: {$colorStore.primary}08;">
            <div class="grid grid-cols-2 gap-2 mb-2">
              <div>
                <div class="text-base font-bold" style="color: {$colorStore.primary}">
                  {dailyMessages.toLocaleString()}
                </div>
                <div class="text-xs" style="color: {$colorStore.muted}">Today</div>
              </div>
              <div>
                <div class="text-base font-bold" style="color: {$colorStore.secondary}">
                  {messageStatsData?.totalMessages ? messageStatsData.totalMessages.toLocaleString() : '0'}
                </div>
                <div class="text-xs" style="color: {$colorStore.muted}">Total</div>
              </div>
            </div>

            {#if topActiveUsers.length > 0}
              <!-- Most Active (Ultra Compact) -->
              <div class="pt-2 border-t" style="border-color: {$colorStore.primary}15;">
                <div class="text-xs font-medium mb-1" style="color: {$colorStore.text}">Top Active</div>
                <div class="flex flex-wrap gap-1">
                  {#each topActiveUsers.slice(0, 3) as user (user.userId)}
                      <div class="flex items-center gap-1 px-2 py-1 rounded-sm"
                         style="background: {$colorStore.primary}10;">
                      <img src={user.avatarUrl || `https://cdn.discordapp.com/embed/avatars/0.png`}
                           alt="" class="w-4 h-4 rounded-full" />
                      <span class="text-xs" style="color: {$colorStore.text}">
                        {user.username?.length > 8 ? user.username.slice(0, 8) + '...' : user.username || 'Unknown User'}
                      </span>
                    </div>
                  {/each}
                </div>
              </div>
            {/if}
          </div>
        {/if}
        </div>

        <!-- Support Tickets Card -->
        <div class=" rounded-lg p-3 transition-all hover:shadow-md border"
               style="background: {$colorStore.primary}05;
                    border-color: {$colorStore.primary}15;">
        <div class="flex items-center justify-between mb-2">
          <h3 class="text-sm font-semibold" style="color: {$colorStore.text}">Support Tickets</h3>
          {#if ticketStats.totalTickets > 0}
            <a href="/dashboard/tickets" class="text-xs" style="color: {$colorStore.primary}">Manage</a>
          {/if}
        </div>
        
        {#if ticketStats.totalTickets === 0}
          <div class="p-2 rounded-lg text-center" style="background: {$colorStore.primary}08;">
            <p class="text-xs" style="color: {$colorStore.muted}">No tickets yet</p>
          </div>
        {:else}
          <div class="p-2 rounded-lg" style="background: {$colorStore.primary}08;">
            <div class="grid grid-cols-3 gap-3 text-center">
              <div>
                <div class="text-base font-bold" style="color: {$colorStore.primary}">
                  {ticketStats.openTickets}
                </div>
                <div class="text-xs" style="color: {$colorStore.muted}">Open</div>
              </div>
              <div>
                <div class="text-base font-bold" style="color: {$colorStore.secondary}">
                  {ticketStats.closedToday}
                </div>
                <div class="text-xs" style="color: {$colorStore.muted}">Closed today</div>
              </div>
              <div>
                <div class="text-base font-bold" style="color: {$colorStore.text}">
                  {ticketStats.activeStaff}
                </div>
                <div class="text-xs" style="color: {$colorStore.muted}">Active staff</div>
              </div>
            </div>
          </div>
        {/if}
        </div>

        <!-- Starboard Highlights Card -->
        <div class=" rounded-lg p-3 transition-all hover:shadow-md border"
               style="background: {$colorStore.primary}05;
                    border-color: {$colorStore.primary}15;">
        <div class="flex items-center justify-between mb-2">
          <h3 class="text-sm font-semibold" style="color: {$colorStore.text}">Starboard</h3>
          {#if starboardHighlights.length > 0}
            <a href="/dashboard/starboard" class="text-xs" style="color: {$colorStore.primary}">View all</a>
          {/if}
        </div>
        
        {#if starboardHighlights.length === 0}
          <div class="p-2 rounded-lg text-center" style="background: {$colorStore.primary}08;">
            <p class="text-xs" style="color: {$colorStore.muted}">No starred messages yet</p>
          </div>
        {:else}
          <div class="space-y-2">
            {#each starboardHighlights.slice(0, 2) as highlight (highlight.messageId)}
              <div class="p-2 rounded-lg" style="background: {$colorStore.primary}08;">
                <div class="flex items-center gap-2 mb-1">
                  <img src={highlight.authorAvatarUrl || `https://cdn.discordapp.com/embed/avatars/0.png`}
                       alt="" class="w-4 h-4 rounded-full" />
                  <span class="text-xs font-medium" style="color: {$colorStore.text}">
                    {highlight.authorName}
                  </span>
                  <div class="ml-auto flex items-center gap-1">
                    <span class="text-xs">{highlight.starEmote || '⭐'}</span>
                    <span class="text-xs font-medium" style="color: {$colorStore.accent}">{highlight.starCount}</span>
                  </div>
                </div>
                <p class="text-xs line-clamp-2" style="color: {$colorStore.muted}">
                  {highlight.content}
                </p>
              </div>
            {/each}
          </div>
        {/if}
        </div>

        <!-- Forms Card -->
        <div class=" rounded-lg p-3 transition-all hover:shadow-md border"
             style="background: {$colorStore.primary}05;
                  border-color: {$colorStore.primary}15;">
          <div class="flex items-center justify-between mb-2">
            <h3 class="text-sm font-semibold" style="color: {$colorStore.text}">Forms</h3>
            <a class="text-xs" href="/dashboard/forms" style="color: {$colorStore.primary}">Manage</a>
          </div>

          {#if forms.length === 0}
            <div class="p-2 rounded-lg text-center" style="background: {$colorStore.primary}08;">
              <p class="text-xs" style="color: {$colorStore.muted}">No forms created yet</p>
            </div>
          {:else}
            <div class="space-y-2">
              <div class="grid grid-cols-2 gap-2">
                <div class="p-2 rounded-lg text-center" style="background: {$colorStore.primary}08;">
                  <div class="text-lg font-bold" style="color: {$colorStore.primary}">
                    {forms.length}
                  </div>
                  <div class="text-xs" style="color: {$colorStore.muted}">Active Forms</div>
                </div>
                <div class="p-2 rounded-lg text-center" style="background: {$colorStore.secondary}08;">
                  <div class="text-lg font-bold" style="color: {$colorStore.secondary}">
                    {totalFormResponses}
                  </div>
                  <div class="text-xs" style="color: {$colorStore.muted}">Responses</div>
                </div>
              </div>

              {#if forms.length > 0}
                <div class="pt-2 border-t" style="border-color: {$colorStore.primary}15;">
                  <div class="text-xs" style="color: {$colorStore.muted}">
                    Most recent: <span style="color: {$colorStore.text}">{forms[0].name}</span>
                  </div>
                  {#if forms[0].responseCount && forms[0].responseCount > 0}
                    <div class="text-xs mt-1" style="color: {$colorStore.muted}">
                      {forms[0].responseCount} response{forms[0].responseCount !== 1 ? 's' : ''}
                    </div>
                  {/if}
                </div>
              {/if}
            </div>
          {/if}
        </div>

        <!-- Counting Activity Card -->
        <div class=" rounded-lg p-3 transition-all hover:shadow-md border"
               style="background: {$colorStore.primary}05;
                    border-color: {$colorStore.primary}15;">
        <div class="flex items-center justify-between mb-2">
          <h3 class="text-sm font-semibold" style="color: {$colorStore.text}">Counting Games</h3>
          {#if countingChannels.length > 0}
            <a href="/dashboard/counting" class="text-xs" style="color: {$colorStore.primary}">Manage</a>
          {/if}
        </div>

        {#if countingChannels.length === 0}
          <div class="p-2 rounded-lg text-center" style="background: {$colorStore.primary}08;">
            <p class="text-xs" style="color: {$colorStore.muted}">No counting channels setup</p>
          </div>
        {:else if !topCountingChannel}
          <div class="p-2 rounded-lg text-center" style="background: {$colorStore.primary}08;">
            <p class="text-xs" style="color: {$colorStore.muted}">No active counting channels</p>
          </div>
        {:else}
          <div class="p-2 rounded-lg" style="background: {$colorStore.primary}08;">
            <div class="flex items-center gap-2 mb-2">
              <i class="fa-utility-duo fa-regular fa-list-numeric text-sm"
                 style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary};"></i>
              <span class="text-sm font-medium" style="color: {$colorStore.text}">
                #{topCountingChannel.channelName}
              </span>
              {#if topCountingChannel.isActive}
                <span class="px-2 py-1 rounded-full text-xs" style="background: {$colorStore.secondary}15; color: {$colorStore.secondary};">
                  Active
                </span>
              {/if}
            </div>

            <div class="grid grid-cols-2 gap-2 mb-2">
              <div>
                <div class="text-base font-bold" style="color: {$colorStore.primary}">
                  {topCountingChannel.currentNumber?.toLocaleString() || 0}
                </div>
                <div class="text-xs" style="color: {$colorStore.muted}">Current</div>
              </div>
              <div>
                <div class="text-base font-bold" style="color: {$colorStore.secondary}">
                  {topCountingChannel.highestNumber?.toLocaleString() || 0}
                </div>
                <div class="text-xs" style="color: {$colorStore.muted}">Record</div>
              </div>
            </div>

            {#if topCountingChannel.lastUsername}
              <div class="pt-2 border-t text-xs" style="border-color: {$colorStore.primary}15; color: {$colorStore.muted}">
                Last count by <span style="color: {$colorStore.text}">{topCountingChannel.lastUsername}</span>
              </div>
            {/if}

            {#if countingChannels.length > 1}
              <div class="text-xs mt-1" style="color: {$colorStore.muted}">
                +{countingChannels.length - 1} other channel{countingChannels.length > 2 ? 's' : ''}
              </div>
            {/if}
          </div>
        {/if}
        </div>
      </div>
    </div>

    <!-- Column 2: Metrics & Features (6 columns) -->
    <div class="lg:col-span-6 space-y-4">
      <!-- Quick Stats List -->
      <div class="space-y-3">
        <!-- Active Members -->
        <div class=" rounded-lg p-3 transition-all hover:scale-[1.01] hover:shadow-md border"
               style="background: {$colorStore.primary}05;
                    border-color: {$colorStore.primary}15;"
             in:fly={{ y: 20, duration: 300, delay: 0 }}>
          <div class="flex items-center gap-3">
            <div class="p-2 rounded-lg"
                 style="background: {$colorStore.primary}20;">
              <i class="fa-utility-duo fa-regular fa-users text-xl"
                 style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary};"></i>
            </div>
            <div class="flex-1">
              <div class="flex items-baseline gap-3">
                <span class="text-lg font-bold" style="color: {$colorStore.text}">{activeMembers}</span>
                <span class="text-sm font-medium" style="color: {$colorStore.text}">Active Members</span>
              </div>
              <div class="text-xs" style="color: {$colorStore.muted}">
                {memberStats?.totalMembers > 0 ? `${Math.round((activeMembers / memberStats.totalMembers) * 100)}% rate` : "No data"}
              </div>
            </div>
            <a class="px-2 py-1 rounded-sm text-xs transition-all hover:scale-[1.02]"
                 href="/dashboard/xp"
               style="background: {$colorStore.primary}20; color: {$colorStore.primary};">
              Manage
            </a>
          </div>
        </div>



        <!-- Total Invites -->
        <div class=" rounded-lg p-3 transition-all hover:scale-[1.01] hover:shadow-md border"
               style="background: {$colorStore.primary}05;
                    border-color: {$colorStore.primary}15;"
             in:fly={{ y: 20, duration: 300, delay: 500 }}>
          <div class="flex items-center gap-3">
            <div class="p-2 rounded-lg"
                 style="background: {$colorStore.primary}20;">
              <i class="fa-utility-duo fa-regular fa-link text-xl"
                 style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary};"></i>
            </div>
            <div class="flex-1">
              <div class="flex items-baseline gap-3">
                <span class="text-lg font-bold" style="color: {$colorStore.text}">
                  {$inviteStore.stats?.totalInvites ? new Intl.NumberFormat().format($inviteStore.stats.totalInvites) : "N/A"}
                </span>
                <span class="text-sm font-medium" style="color: {$colorStore.text}">Total Invites</span>
              </div>
              <div class="text-xs" style="color: {$colorStore.muted}">All time</div>
            </div>
          </div>
        </div>

        <!-- Average Joins -->
        <div class=" rounded-lg p-3 transition-all hover:scale-[1.01] hover:shadow-md border"
               style="background: {$colorStore.primary}05;
                    border-color: {$colorStore.primary}15;"
             in:fly={{ y: 20, duration: 300, delay: 550 }}>
          <div class="flex items-center gap-3">
            <div class="p-2 rounded-lg"
                 style="background: {$colorStore.secondary}20;">
              <i class="fa-utility-duo fa-regular fa-user-plus text-xl"
                 style="--fa-primary-color: {$colorStore.secondary}; --fa-secondary-color: {$colorStore.accent};"></i>
            </div>
            <div class="flex-1">
              <div class="flex items-baseline gap-3">
                <span class="text-lg font-bold" style="color: {$colorStore.text}">
                  {$inviteStore.stats?.averageJoins || "N/A"}
                </span>
                <span class="text-sm font-medium" style="color: {$colorStore.text}">Average Joins</span>
              </div>
              <div class="text-xs" style="color: {$colorStore.muted}">Per day</div>
            </div>
          </div>
        </div>

      </div>

      <!-- Additional Features -->
      <div class="space-y-3">
        <!-- Reputation System -->
        <div class=" rounded-lg p-3 transition-all hover:scale-[1.01] hover:shadow-md border"
               style="background: {$colorStore.primary}05;
                    border-color: {$colorStore.primary}15;"
             in:fly={{ y: 20, duration: 300, delay: 600 }}>
          <div class="flex items-center gap-3">
            <div class="p-2 rounded-lg"
                 style="background: {$colorStore.accent}20;">
              <i class="fa-utility-duo fa-regular fa-star text-xl"
                 style="--fa-primary-color: {$colorStore.accent}; --fa-secondary-color: {$colorStore.primary};"></i>
            </div>
            <div class="flex-1">
              <div class="flex items-baseline gap-3">
                <span class="text-lg font-bold" style="color: {$colorStore.text}">Active</span>
                <span class="text-sm font-medium" style="color: {$colorStore.text}">Reputation</span>
              </div>
              <div class="text-xs" style="color: {$colorStore.muted}">User reputation system</div>
            </div>
            <a class="px-2 py-1 rounded-sm text-xs transition-all hover:scale-[1.02]"
                 href="/dashboard/reputation"
               style="background: {$colorStore.accent}20; color: {$colorStore.accent};">
              Manage
            </a>
          </div>
        </div>

        <!-- Confessions -->
        <div class=" rounded-lg p-3 transition-all hover:scale-[1.01] hover:shadow-md border"
               style="background: {$colorStore.primary}05;
                    border-color: {$colorStore.primary}15;"
             in:fly={{ y: 20, duration: 300, delay: 650 }}>
          <div class="flex items-center gap-3">
            <div class="p-2 rounded-lg"
                 style="background: {$colorStore.primary}20;">
              <i class="fa-utility-duo fa-regular fa-comment text-xl"
                 style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary};"></i>
            </div>
            <div class="flex-1">
              <div class="flex items-baseline gap-3">
                <span class="text-lg font-bold" style="color: {$colorStore.text}">Active</span>
                <span class="text-sm font-medium" style="color: {$colorStore.text}">Confessions</span>
              </div>
              <div class="text-xs" style="color: {$colorStore.muted}">Anonymous confessions</div>
            </div>
            <a class="px-2 py-1 rounded-sm text-xs transition-all hover:scale-[1.02]"
                 href="/dashboard/confessions"
               style="background: {$colorStore.primary}20; color: {$colorStore.primary};">
              Manage
            </a>
          </div>
        </div>

        <!-- Highlights -->
        <div class=" rounded-lg p-3 transition-all hover:scale-[1.01] hover:shadow-md border"
               style="background: {$colorStore.primary}05;
                    border-color: {$colorStore.primary}15;"
             in:fly={{ y: 20, duration: 300, delay: 700 }}>
          <div class="flex items-center gap-3">
            <div class="p-2 rounded-lg"
                 style="background: {$colorStore.secondary}20;">
              <i class="fa-utility-duo fa-regular fa-bolt text-xl"
                 style="--fa-primary-color: {$colorStore.secondary}; --fa-secondary-color: {$colorStore.accent};"></i>
            </div>
            <div class="flex-1">
              <div class="flex items-baseline gap-3">
                <span class="text-lg font-bold" style="color: {$colorStore.text}">Active</span>
                <span class="text-sm font-medium" style="color: {$colorStore.text}">Highlights</span>
              </div>
              <div class="text-xs" style="color: {$colorStore.muted}">Keyword notifications</div>
            </div>
            <a class="px-2 py-1 rounded-sm text-xs transition-all hover:scale-[1.02]"
                 href="/dashboard/highlights"
               style="background: {$colorStore.secondary}20; color: {$colorStore.secondary};">
              Manage
            </a>
          </div>
        </div>

        <!-- Stream Notifications -->
        <div class=" rounded-lg p-3 transition-all hover:scale-[1.01] hover:shadow-md border"
               style="background: {$colorStore.primary}05;
                    border-color: {$colorStore.primary}15;"
             in:fly={{ y: 20, duration: 300, delay: 750 }}>
          <div class="flex items-center gap-3">
            <div class="p-2 rounded-lg"
                 style="background: {$colorStore.accent}20;">
              <i class="fa-utility-duo fa-regular fa-video text-xl"
                 style="--fa-primary-color: {$colorStore.accent}; --fa-secondary-color: {$colorStore.primary};"></i>
            </div>
            <div class="flex-1">
              <div class="flex items-baseline gap-3">
                <span class="text-lg font-bold" style="color: {$colorStore.text}">Active</span>
                <span class="text-sm font-medium" style="color: {$colorStore.text}">Streams</span>
              </div>
              <div class="text-xs" style="color: {$colorStore.muted}">Twitch/YouTube alerts</div>
            </div>
            <a class="px-2 py-1 rounded-sm text-xs transition-all hover:scale-[1.02]"
                 href="/dashboard/streams"
               style="background: {$colorStore.accent}20; color: {$colorStore.accent};">
              Manage
            </a>
          </div>
        </div>
      </div>

      <!-- Community Support -->
      <div class="space-y-3">
        {#if patreonConnected}
          <!-- Patreon Supporters -->
          <div class=" rounded-lg p-3 transition-all hover:scale-[1.01] hover:shadow-md border"
                 style="background: {$colorStore.primary}05;
                      border-color: {$colorStore.primary}15;">
            <div class="flex items-center gap-3">
              <div class="p-2 rounded-lg"
                   style="background: {$colorStore.accent}20;">
                <i class="fa-utility-duo fa-regular fa-heart text-xl"
                   style="--fa-primary-color: {$colorStore.accent}; --fa-secondary-color: {$colorStore.primary};"></i>
              </div>
              <div class="flex-1">
                <div class="flex items-baseline gap-3">
                  <span class="text-lg font-bold" style="color: {$colorStore.text}">{patreonSupporters}</span>
                  <span class="text-sm font-medium" style="color: {$colorStore.text}">Patreon Supporters</span>
                </div>
                <div class="text-xs" style="color: {$colorStore.muted}">Active patrons</div>
              </div>
                <a href="/dashboard/patreon"
                   class="px-2 py-1 rounded-sm text-xs transition-all hover:scale-[1.02]"
                 style="background: {$colorStore.accent}20; color: {$colorStore.accent};">
                Manage
              </a>
            </div>
          </div>
        {:else}
          <!-- Connect Patreon -->
          <div class=" rounded-lg p-3 transition-all hover:scale-[1.01] hover:shadow-md border"
                 style="background: {$colorStore.primary}05;
                      border-color: {$colorStore.primary}15;">
            <div class="flex items-center gap-3">
              <div class="p-2 rounded-lg"
                   style="background: {$colorStore.accent}20;">
                <i class="fa-utility-duo fa-regular fa-heart text-xl"
                   style="--fa-primary-color: {$colorStore.accent}; --fa-secondary-color: {$colorStore.primary};"></i>
              </div>
              <div class="flex-1">
                <div class="flex items-baseline gap-3">
                  <span class="text-lg font-bold" style="color: {$colorStore.text}">N/A</span>
                  <span class="text-sm font-medium" style="color: {$colorStore.text}">Patreon Support</span>
                </div>
                <div class="text-xs" style="color: {$colorStore.muted}">Not connected</div>
              </div>
                <a href="/dashboard/patreon"
                   class="px-2 py-1 rounded-sm text-xs transition-all hover:scale-[1.02]"
                 style="background: {$colorStore.accent}20; color: {$colorStore.accent};">
                Setup
              </a>
            </div>
          </div>
        {/if}
      </div>

    </div>
  </div>
</div>