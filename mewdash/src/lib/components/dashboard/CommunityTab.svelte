<!-- lib/components/dashboard/CommunityTab.svelte -->
<script lang="ts">
  import { fly } from "svelte/transition";
  import { onMount } from "svelte";
  import { colorStore } from "$lib/stores/colorStore";
  import { currentGuild } from "$lib/stores/currentGuild";
  import { inviteStore } from "$lib/stores/inviteStore";
  import { api } from "$lib/api";
  import { logger } from "$lib/logger";
  import {
    Award,
    Cake,
    Calendar,
    Clock,
    Hash,
    Heart,
    Lightbulb,
    Link,
    MessageSquare,
    Settings,
    Star,
    Target,
    Ticket,
    TrendingUp,
    Users
  } from "lucide-svelte";

  import InviteStats from "$lib/components/monitoring/InviteStats.svelte";
  import FeatureCard from "$lib/components/ui/FeatureCard.svelte";
  import StatCard from "$lib/components/monitoring/StatCard.svelte";
  import type { SuggestionsModel } from "$lib/types/models.ts";
  import type { MessageStatsResponse, DailyMessageStats } from "$lib/types/messagestats.ts";

  // Props from parent
  export let guildFeatures: any;
  export let memberStats: any;

  // Real data from API
  let xpLeaderboard: any[] = [];
  let recentSuggestions: SuggestionsModel[] = [];
  let starboardHighlights: any[] = [];
  let loading = true;
  let dailyMessages = 0;
  let messageCountEnabled = false;
  let activeMembers = 0;

  // Enhanced message stats
  let messageStatsData: MessageStatsResponse | null = null;
  let topActiveUsers: any[] = [];
  let topChannels: any[] = [];

  // Patreon data
  let patreonConnected = false;
  let patreonSupporters = 0;
  let patreonAnalytics: any = null;

  // Birthday data
  let birthdayStats: any = null;
  let todaysBirthdays: any[] = [];
  let upcomingBirthdays: any[] = [];

  // Tickets data
  let ticketStats = {
    totalTickets: 0,
    openTickets: 0,
    closedToday: 0,
    activeStaff: 0
  };
  let recentTickets: any[] = [];
  let ticketPanels: any[] = [];

  // Counting data
  let countingChannels: any[] = [];
  let countingStats: any = null;
  let topCountingChannel: any = null;

  async function fetchCommunityData() {
    if (!$currentGuild?.id) return;

    try {
      // Fetch all data in parallel for better performance
      const [leaderboardData, xpStats, suggestionsData, messageStats, messageStatsDetailed, guildMembers, patreonStatus, patreonSupportersData, patreonAnalyticsData, birthdayStatsData, todaysBirthdaysData, upcomingBirthdaysData, ticketStatsData, ticketPanelsData, countingChannelsData, countingStatsData] = await Promise.all([
        api.getXpLeaderboard($currentGuild.id, 1, 3),
        api.getXpServerStats($currentGuild.id),
        api.getSuggestions($currentGuild.id).catch(() => []), // Handle case where suggestions aren't enabled
        api.getDailyMessageStats($currentGuild.id).catch(() => ({ enabled: false, dailyMessages: 0 })), // Handle case where message count isn't enabled
        api.getMessageStats($currentGuild.id).catch(() => null), // Enhanced message stats
        api.getGuildMembers($currentGuild.id).catch(() => []), // Guild members for user enrichment
        api.getPatreonOAuthStatus($currentGuild.id).catch(() => ({ isConfigured: false })),
        api.getPatreonSupporters($currentGuild.id).catch(() => []),
        api.getPatreonAnalytics($currentGuild.id).catch(() => null),
        api.getBirthdayStats($currentGuild.id).catch(() => null),
        api.getBirthdayToday($currentGuild.id).catch(() => []),
        api.getBirthdayUpcoming($currentGuild.id, 7).catch(() => []),
        api.getTicketStats($currentGuild.id).catch(() => ({ totalTickets: 0, openTickets: 0, closedTickets: 0, activeStaff: 0 })),
        api.getTicketPanels($currentGuild.id).catch(() => []),
        api.getCountingChannels($currentGuild.id).catch(() => []), // Counting channels
        api.getCountingChannelStats($currentGuild.id, null).catch(() => null) // Aggregate counting stats
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

      // Process suggestions data (recent 3, sorted by ID desc for most recent)
      recentSuggestions = (suggestionsData || [])
        .sort((a, b) => b.suggestionId - a.suggestionId)
        .slice(0, 3);

      // Process message count stats
      messageCountEnabled = messageStats.enabled;
      dailyMessages = messageStats.dailyMessages || 0;

      // Process enhanced message stats
      messageStatsData = messageStatsDetailed;
      if (messageStatsData) {
        // Enhance topActiveUsers with user data from guild members
        topActiveUsers = (messageStatsData.topUsers || []).slice(0, 5).map((messageUser, index) => {
          const member = guildMembers?.find(m => m?.id?.toString() === messageUser.userId);
          return {
            ...messageUser,
            username: member?.username || 'Unknown User',
            discriminator: '0000', // Discord no longer uses discriminators for most users
            avatarUrl: member?.avatarUrl || `https://cdn.discordapp.com/embed/avatars/0.png`
          };
        });
        topChannels = (messageStatsData.topChannels || []).slice(0, 3);
        
        // Update daily messages with more detailed data if available
        if (messageStatsData.dailyStats?.enabled) {
          dailyMessages = messageStatsData.dailyStats.dailyMessages || dailyMessages;
          messageCountEnabled = messageStatsData.dailyStats.enabled;
        }
      }

      // Process Patreon data
      patreonConnected = patreonStatus.isConfigured || false;
      patreonSupporters = patreonSupportersData?.length || 0;
      patreonAnalytics = patreonAnalyticsData;

      // Process Birthday data
      birthdayStats = birthdayStatsData;
      todaysBirthdays = todaysBirthdaysData || [];
      upcomingBirthdays = upcomingBirthdaysData?.slice(0, 5) || []; // Show top 5 upcoming

      // Process Tickets data
      ticketStats = {
        totalTickets: ticketStatsData?.totalTickets || 0,
        openTickets: ticketStatsData?.openTickets || 0,
        closedToday: ticketStatsData?.closedTickets || 0,
        activeStaff: ticketStatsData?.activeStaff || 0
      };
      ticketPanels = (ticketPanelsData || []).slice(0, 3); // Show recent 3 panels

      // Process Counting data
      countingChannels = countingChannelsData || [];
      countingStats = countingStatsData;
      
      // Find the most active counting channel
      if (countingChannels.length > 0) {
        topCountingChannel = countingChannels
          .filter(channel => channel.isActive)
          .sort((a, b) => b.currentNumber - a.currentNumber)[0] || countingChannels[0];
      }

      // Fetch starboard highlights
      try {
        const starboardData = await api.getStarboardHighlights($currentGuild.id, 3);
        starboardHighlights = starboardData || [];
      } catch (err) {
        // Starboard may not be enabled or no highlights available
        starboardHighlights = [];
      }

    } catch (err) {
      logger.error("Failed to fetch community data:", err);
      // Reset to empty states on error
      xpLeaderboard = [];
      recentSuggestions = [];
      starboardHighlights = [];
      activeMembers = Math.floor((memberStats?.totalMembers || 0) * 0.7);
    } finally {
      loading = false;
    }
  }

  onMount(() => {
    fetchCommunityData();
  });

  $: if ($currentGuild) {
    fetchCommunityData();
  }

  // Feature descriptions
  const featureDescriptions = {
    inviteTracking: "Track who invited users to your server",
    suggestions: "Let users submit and vote on suggestions",
    starboard: "Highlight popular messages in a dedicated channel",
    xp: "Experience points and leveling system for engagement",
    birthday: "Celebrate member birthdays with announcements and roles",
    tickets: "Support ticket system for community help and assistance",
    messageStats: "Track message activity and user engagement"
  };
</script>

<div class="space-y-4" in:fly={{ y: 20, duration: 300 }}>
  <!-- Row 1: Main Content -->
  <div class="grid grid-cols-1 lg:grid-cols-12 gap-4">
    
    <!-- Column 1: XP & Activity (6 columns) -->
    <div class="lg:col-span-6 space-y-4">
      <!-- XP Leaderboard -->
      <div
        class="backdrop-blur-sm rounded-xl p-4 shadow-lg transition-all hover:shadow-xl hover:translate-y-[-1px]"
        style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15, {$colorStore.gradientEnd}10);">
        <div class="flex items-center gap-3 mb-4">
          <div class="p-2 rounded-lg"
               style="background: linear-gradient(135deg, {$colorStore.primary}20, {$colorStore.secondary}20);">
            <Star class="w-5 h-5" style="color: {$colorStore.primary}" />
          </div>
          <h2 class="text-lg font-bold" style="color: {$colorStore.text}">XP Leaderboard</h2>
        </div>

      <div class="space-y-2">
        {#if loading}
          <!-- Loading state -->
          {#each Array(3).fill(0) as _, index}
            <div class="flex items-center gap-3 p-2 rounded-lg animate-pulse"
                 style="background: {$colorStore.primary}08;">
              <div class="w-6 h-6 rounded-full" style="background: {$colorStore.primary}20;"></div>
              <div class="w-8 h-8 rounded-full" style="background: {$colorStore.primary}20;"></div>
              <div class="flex-1 space-y-1">
                <div class="h-3 rounded" style="background: {$colorStore.primary}20; width: 60%;"></div>
                <div class="h-2 rounded" style="background: {$colorStore.primary}15; width: 80%;"></div>
              </div>
              <div class="w-10 h-4 rounded" style="background: {$colorStore.primary}20;"></div>
            </div>
          {/each}
        {:else if xpLeaderboard.length === 0}
          <!-- Empty state -->
          <div class="text-center py-6">
            <Star class="w-10 h-10 mx-auto mb-3" style="color: {$colorStore.primary}50" />
            <h3 class="text-base font-semibold mb-1" style="color: {$colorStore.text}">No XP Data</h3>
            <p class="text-xs" style="color: {$colorStore.muted}">
              No members have earned XP yet. Get active in the server!
            </p>
          </div>
        {:else}
          {#each xpLeaderboard as user, index}
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
              <div class="px-2 py-1 rounded text-xs font-medium"
                   style="background: {$colorStore.secondary}20; color: {$colorStore.secondary}">
                Lvl {user.level}
              </div>
            </div>
          {/each}
        {/if}
      </div>

      <!-- View More Button -->
      <a class="w-full mt-3 flex items-center justify-center gap-2 py-2 px-3 rounded-lg transition-all hover:scale-105 text-sm"
         href="/dashboard/xp"
         style="background: {$colorStore.primary}20; color: {$colorStore.primary}; border: 1px solid {$colorStore.primary}30;">
        <TrendingUp size={14} />
        View Full XP Dashboard
      </a>
    </div>

      <!-- Community Activity List -->
      <div class="space-y-3">

        <!-- Birthday Celebrations Card -->
        <div class="backdrop-blur-sm rounded-lg p-3 shadow-md"
             style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15, {$colorStore.gradientEnd}10);">
        <div class="flex items-center justify-between mb-2">
          <h3 class="text-sm font-semibold" style="color: {$colorStore.text}">Birthdays</h3>
          <a href="/dashboard/birthday" class="text-xs" style="color: {$colorStore.primary}">View all</a>
        </div>

        {#if todaysBirthdays.length > 0 || upcomingBirthdays.length > 0}
          <div class="p-2 rounded-lg" style="background: {$colorStore.primary}08;">
            {#if todaysBirthdays.length > 0}
              <!-- Today's Birthdays (Compact) -->
              <div class="flex items-center gap-2 mb-2">
                <Cake size={14} style="color: {$colorStore.accent}" />
                <span class="text-xs font-medium" style="color: {$colorStore.text}">Today</span>
              </div>
              <div class="flex flex-wrap gap-1 mb-2">
                {#each todaysBirthdays.slice(0, 3) as user}
                  <div class="flex items-center gap-1 px-2 py-1 rounded" 
                       style="background: {$colorStore.accent}15;">
                    <img src={user.avatarUrl || `https://cdn.discordapp.com/embed/avatars/0.png`}
                         alt="" class="w-4 h-4 rounded-full" />
                    <span class="text-xs font-medium" style="color: {$colorStore.text}">
                      {user.displayName || user.username}
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
                {#each upcomingBirthdays.slice(0, 2) as user, index}
                  <span>{user.displayName || user.username} ({user.daysUntilBirthday}d){index < 1 && upcomingBirthdays.length > 1 ? ', ' : ''}</span>
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
        <div class="backdrop-blur-sm rounded-lg p-3 shadow-md"
             style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15, {$colorStore.gradientEnd}10);">
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
                  {messageStatsData?.dailyStats?.averagePerHour || 0}/hr
                </div>
                <div class="text-xs" style="color: {$colorStore.muted}">Average</div>
              </div>
            </div>
            
            {#if topActiveUsers.length > 0}
              <!-- Most Active (Ultra Compact) -->
              <div class="pt-2 border-t" style="border-color: {$colorStore.primary}15;">
                <div class="text-xs font-medium mb-1" style="color: {$colorStore.text}">Top Active</div>
                <div class="flex flex-wrap gap-1">
                  {#each topActiveUsers.slice(0, 3) as user}
                    <div class="flex items-center gap-1 px-2 py-1 rounded" 
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
            
            {#if messageStatsData?.dailyStats?.peakHour}
              <div class="text-xs mt-2" style="color: {$colorStore.muted}">
                Peak: {messageStatsData.dailyStats.peakHour}:00 ({messageStatsData.dailyStats.peakHourCount} msgs)
              </div>
            {/if}
          </div>
        {/if}
        </div>

        <!-- Support Tickets Card -->
        <div class="backdrop-blur-sm rounded-lg p-3 shadow-md"
             style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15, {$colorStore.gradientEnd}10);">
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
        <div class="backdrop-blur-sm rounded-lg p-3 shadow-md"
             style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15, {$colorStore.gradientEnd}10);">
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
            {#each starboardHighlights.slice(0, 2) as highlight}
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

        <!-- Counting Activity Card -->
        <div class="backdrop-blur-sm rounded-lg p-3 shadow-md"
             style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15, {$colorStore.gradientEnd}10);">
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
              <Hash size={14} style="color: {$colorStore.primary}" />
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
        <div class="backdrop-blur-sm rounded-lg p-3 shadow-md transition-all hover:scale-[1.01]"
             style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15, {$colorStore.gradientEnd}10);"
             in:fly={{ y: 20, duration: 300, delay: 0 }}>
          <div class="flex items-center gap-3">
            <div class="p-2 rounded-lg"
                 style="background: {$colorStore.primary}20;">
              <Users class="w-5 h-5" style="color: {$colorStore.primary}" />
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
            <a href="/dashboard/xp" 
               class="px-2 py-1 rounded text-xs transition-all hover:scale-105"
               style="background: {$colorStore.primary}20; color: {$colorStore.primary};">
              Manage
            </a>
          </div>
        </div>



        <!-- Total Invites -->
        <div class="backdrop-blur-sm rounded-lg p-3 shadow-md transition-all hover:scale-[1.01]"
             style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15, {$colorStore.gradientEnd}10);"
             in:fly={{ y: 20, duration: 300, delay: 500 }}>
          <div class="flex items-center gap-3">
            <div class="p-2 rounded-lg"
                 style="background: {$colorStore.primary}20;">
              <Link class="w-5 h-5" style="color: {$colorStore.primary}" />
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
        <div class="backdrop-blur-sm rounded-lg p-3 shadow-md transition-all hover:scale-[1.01]"
             style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15, {$colorStore.gradientEnd}10);"
             in:fly={{ y: 20, duration: 300, delay: 550 }}>
          <div class="flex items-center gap-3">
            <div class="p-2 rounded-lg"
                 style="background: {$colorStore.secondary}20;">
              <Users class="w-5 h-5" style="color: {$colorStore.secondary}" />
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


      <!-- Community Support -->
      <div class="space-y-3">
        {#if patreonConnected}
          <!-- Patreon Supporters -->
          <div class="backdrop-blur-sm rounded-lg p-3 shadow-md transition-all hover:scale-[1.01]"
               style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15, {$colorStore.gradientEnd}10);">
            <div class="flex items-center gap-3">
              <div class="p-2 rounded-lg"
                   style="background: {$colorStore.accent}20;">
                <Heart class="w-5 h-5" style="color: {$colorStore.accent}" />
              </div>
              <div class="flex-1">
                <div class="flex items-baseline gap-3">
                  <span class="text-lg font-bold" style="color: {$colorStore.text}">{patreonSupporters}</span>
                  <span class="text-sm font-medium" style="color: {$colorStore.text}">Patreon Supporters</span>
                </div>
                <div class="text-xs" style="color: {$colorStore.muted}">Active patrons</div>
              </div>
              <a href="/dashboard/patreon" 
                 class="px-2 py-1 rounded text-xs transition-all hover:scale-105"
                 style="background: {$colorStore.accent}20; color: {$colorStore.accent};">
                Manage
              </a>
            </div>
          </div>
        {:else}
          <!-- Connect Patreon -->
          <div class="backdrop-blur-sm rounded-lg p-3 shadow-md transition-all hover:scale-[1.01]"
               style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15, {$colorStore.gradientEnd}10);">
            <div class="flex items-center gap-3">
              <div class="p-2 rounded-lg"
                   style="background: {$colorStore.accent}20;">
                <Heart class="w-5 h-5" style="color: {$colorStore.accent}" />
              </div>
              <div class="flex-1">
                <div class="flex items-baseline gap-3">
                  <span class="text-lg font-bold" style="color: {$colorStore.text}">N/A</span>
                  <span class="text-sm font-medium" style="color: {$colorStore.text}">Patreon Support</span>
                </div>
                <div class="text-xs" style="color: {$colorStore.muted}">Not connected</div>
              </div>
              <a href="/dashboard/patreon" 
                 class="px-2 py-1 rounded text-xs transition-all hover:scale-105"
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