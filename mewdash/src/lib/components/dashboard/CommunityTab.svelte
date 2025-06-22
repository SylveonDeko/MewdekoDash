<!-- lib/components/dashboard/CommunityTab.svelte -->
<script lang="ts">
  import { fly } from "svelte/transition";
  import { onMount } from "svelte";
  import { colorStore } from "$lib/stores/colorStore";
  import { currentGuild } from "$lib/stores/currentGuild";
  import { api } from "$lib/api";
  import { logger } from "$lib/logger";
  import { Award, Heart, Lightbulb, MessageSquare, Star, Target, TrendingUp, Users } from "lucide-svelte";

  import InviteStats from "$lib/components/InviteStats.svelte";
  import FeatureCard from "$lib/components/FeatureCard.svelte";
  import StatCard from "$lib/components/StatCard.svelte";
  import type { SuggestionsModel } from "$lib/types/models.ts";

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

  // Patreon data
  let patreonConnected = false;
  let patreonSupporters = 0;
  let patreonGoals: any[] = [];
  let patreonAnalytics: any = null;

  async function fetchCommunityData() {
    if (!$currentGuild?.id) return;

    try {
      // Fetch all data in parallel for better performance
      const [leaderboardData, xpStats, suggestionsData, messageStats, patreonStatus, patreonSupportersData, patreonGoalsData, patreonAnalyticsData] = await Promise.all([
        api.getXpLeaderboard($currentGuild.id, 1, 5),
        api.getXpServerStats($currentGuild.id),
        api.getSuggestions($currentGuild.id).catch(() => []), // Handle case where suggestions aren't enabled
        api.getDailyMessageStats($currentGuild.id).catch(() => ({ enabled: false, dailyMessages: 0 })), // Handle case where message count isn't enabled
        api.getPatreonOAuthStatus($currentGuild.id).catch(() => ({ isConfigured: false })),
        api.getPatreonSupporters($currentGuild.id).catch(() => []),
        api.getPatreonGoals($currentGuild.id).catch(() => []),
        api.getPatreonAnalytics($currentGuild.id).catch(() => null)
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

      // Process Patreon data
      patreonConnected = patreonStatus.isConfigured || false;
      patreonSupporters = patreonSupportersData?.length || 0;
      patreonGoals = patreonGoalsData || [];
      patreonAnalytics = patreonAnalyticsData;

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
    xp: "Experience points and leveling system for engagement"
  };
</script>

<div class="space-y-6" in:fly={{ y: 20, duration: 300 }}>
  <!-- 3-Column Layout: Leaderboards | Activity Feed | Metrics -->
  <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">

    <!-- XP Leaderboards (40% - 5 columns) -->
    <div
      class="lg:col-span-5 backdrop-blur-sm rounded-2xl p-6 shadow-2xl transition-all hover:shadow-xl hover:translate-y-[-2px]"
      style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15, {$colorStore.gradientEnd}10);">
      <div class="flex items-center gap-4 mb-6">
        <div class="p-3 rounded-xl"
             style="background: linear-gradient(135deg, {$colorStore.primary}20, {$colorStore.secondary}20);">
          <Star class="w-6 h-6" style="color: {$colorStore.primary}" />
        </div>
        <h2 class="text-xl font-bold" style="color: {$colorStore.text}">XP Leaderboard</h2>
      </div>

      <div class="space-y-3">
        {#if loading}
          <!-- Loading state -->
          {#each Array(5).fill(0) as _, index}
            <div class="flex items-center gap-4 p-3 rounded-xl animate-pulse"
                 style="background: {$colorStore.primary}08;">
              <div class="w-8 h-8 rounded-full" style="background: {$colorStore.primary}20;"></div>
              <div class="w-10 h-10 rounded-full" style="background: {$colorStore.primary}20;"></div>
              <div class="flex-1 space-y-2">
                <div class="h-4 rounded" style="background: {$colorStore.primary}20; width: 60%;"></div>
                <div class="h-3 rounded" style="background: {$colorStore.primary}15; width: 80%;"></div>
              </div>
              <div class="w-12 h-6 rounded" style="background: {$colorStore.primary}20;"></div>
            </div>
          {/each}
        {:else if xpLeaderboard.length === 0}
          <!-- Empty state -->
          <div class="text-center py-8">
            <Star class="w-12 h-12 mx-auto mb-4" style="color: {$colorStore.primary}50" />
            <h3 class="text-lg font-semibold mb-2" style="color: {$colorStore.text}">No XP Data</h3>
            <p class="text-sm" style="color: {$colorStore.muted}">
              No members have earned XP yet. Get active in the server!
            </p>
          </div>
        {:else}
          {#each xpLeaderboard as user, index}
            <div class="flex items-center gap-4 p-3 rounded-xl transition-all hover:scale-[1.02]"
                 style="background: {index < 3 ? $colorStore.primary + '15' : $colorStore.primary + '08'};">
              <!-- Rank Badge -->
              <div class="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm"
                   style="background: {index < 3 ? $colorStore.accent : $colorStore.primary}40; 
                          color: {index < 3 ? $colorStore.accent : $colorStore.primary};">
                {user.rank || index + 1}
              </div>

              <!-- Avatar -->
              <img src={user.avatar || `https://cdn.discordapp.com/embed/avatars/${index % 5}.png`}
                   alt="" class="w-10 h-10 rounded-full" />

              <!-- User Info -->
              <div class="flex-1 min-w-0">
                <div class="font-semibold truncate" style="color: {$colorStore.text}">
                  {user.username}
                </div>
                <div class="text-sm" style="color: {$colorStore.muted}">
                  Level {user.level} • {user.xp.toLocaleString()} XP
                </div>
              </div>

              <!-- Level Badge -->
              <div class="px-2 py-1 rounded-lg text-xs font-medium"
                   style="background: {$colorStore.secondary}20; color: {$colorStore.secondary}">
                Lvl {user.level}
              </div>
            </div>
          {/each}
        {/if}
      </div>

      <!-- View More Button -->
      <a class="w-full mt-4 flex items-center justify-center gap-2 py-2 px-4 rounded-xl transition-all hover:scale-105"
         href="/dashboard/xp"
         style="background: {$colorStore.primary}20; color: {$colorStore.primary}; border: 1px solid {$colorStore.primary}30;">
        <TrendingUp size={16} />
        View Full XP Dashboard
      </a>
    </div>

    <!-- Activity Feed (35% - 4 columns) -->
    <div
      class="lg:col-span-4 backdrop-blur-sm rounded-2xl p-6 shadow-2xl transition-all hover:shadow-xl hover:translate-y-[-2px]"
      style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15, {$colorStore.gradientEnd}10);">
      <div class="flex items-center gap-4 mb-6">
        <div class="p-3 rounded-xl"
             style="background: linear-gradient(135deg, {$colorStore.primary}20, {$colorStore.secondary}20);">
          <MessageSquare class="w-6 h-6" style="color: {$colorStore.primary}" />
        </div>
        <h2 class="text-xl font-bold" style="color: {$colorStore.text}">Community Activity</h2>
      </div>

      <!-- Recent Suggestions -->
      <div class="mb-6">
        <h3 class="text-lg font-semibold mb-3" style="color: {$colorStore.text}">Recent Suggestions</h3>
        <div class="space-y-3">
          {#if loading}
            <!-- Loading state -->
            {#each Array(3).fill(0) as _}
              <div class="p-3 rounded-xl animate-pulse" style="background: {$colorStore.primary}08;">
                <div class="space-y-2">
                  <div class="h-4 rounded" style="background: {$colorStore.primary}20; width: 85%;"></div>
                  <div class="h-3 rounded" style="background: {$colorStore.primary}15; width: 60%;"></div>
                  <div class="flex items-center gap-2 mt-2">
                    <div class="w-4 h-4 rounded" style="background: {$colorStore.primary}20;"></div>
                    <div class="h-3 rounded" style="background: {$colorStore.primary}15; width: 40%;"></div>
                  </div>
                </div>
              </div>
            {/each}
          {:else if recentSuggestions.length === 0}
            <!-- Empty state -->
            <div class="text-center py-6">
              <Lightbulb class="w-8 h-8 mx-auto mb-3" style="color: {$colorStore.primary}50" />
              <p class="text-sm" style="color: {$colorStore.muted}">
                No suggestions yet. Enable suggestions to see activity here.
              </p>
            </div>
          {:else}
            {#each recentSuggestions.slice(0, 3) as suggestion}
              <div class="p-3 rounded-xl transition-all hover:scale-[1.02]"
                   style="background: {$colorStore.primary}08;">
                <div class="flex items-start justify-between mb-2">
                  <p class="text-sm flex-1" style="color: {$colorStore.text}">
                    {suggestion.suggestion1 }
                  </p>
                  <span class="ml-2 px-2 py-1 rounded text-xs"
                        style="background: {suggestion.currentState === 1 ? '#10b98120' : $colorStore.muted + '20'};
                               color: {suggestion.currentState === 1 ? '#10b981' : $colorStore.muted};">
                    {suggestion.currentState === 1 ? 'Approved' : suggestion.currentState === 2 ? 'Denied' : 'Pending'}
                  </span>
                </div>
                <div class="flex items-center gap-2">
                  <Lightbulb size={14} style="color: {$colorStore.accent}" />
                  <span class="text-xs" style="color: {$colorStore.muted}">
                    ID: {suggestion.suggestionId}
                  </span>
                </div>
              </div>
            {/each}
          {/if}
        </div>
      </div>

      <!-- Starboard Highlights -->
      <div>
        <h3 class="text-lg font-semibold mb-3" style="color: {$colorStore.text}">Starboard Highlights</h3>
        <div class="space-y-3">
          {#if loading}
            <!-- Loading state -->
            {#each Array(3).fill(0) as _}
              <div class="p-3 rounded-xl animate-pulse" style="background: {$colorStore.primary}08;">
                <div class="space-y-2">
                  <div class="h-4 rounded" style="background: {$colorStore.primary}20; width: 90%;"></div>
                  <div class="h-3 rounded" style="background: {$colorStore.primary}15; width: 70%;"></div>
                  <div class="flex items-center justify-between mt-2">
                    <div class="h-3 rounded" style="background: {$colorStore.primary}15; width: 30%;"></div>
                    <div class="flex items-center gap-1">
                      <div class="w-3 h-3 rounded" style="background: {$colorStore.primary}20;"></div>
                      <div class="h-3 rounded" style="background: {$colorStore.primary}15; width: 20px;"></div>
                    </div>
                  </div>
                </div>
              </div>
            {/each}
          {:else if starboardHighlights.length === 0}
            <!-- Empty state -->
            <div class="text-center py-6">
              <Star class="w-8 h-8 mx-auto mb-3" style="color: {$colorStore.primary}50" />
              <p class="text-sm" style="color: {$colorStore.muted}">
                No starboard highlights yet. Enable starboard to see popular messages here.
              </p>
            </div>
          {:else}
            {#each starboardHighlights as highlight}
              <div class="p-3 rounded-xl transition-all hover:scale-[1.02]"
                   style="background: {$colorStore.primary}08;">

                <!-- Author info -->
                <div class="flex items-center gap-2 mb-2">
                  <img src={highlight.authorAvatarUrl || `https://cdn.discordapp.com/embed/avatars/0.png`}
                       alt="" class="w-6 h-6 rounded-full" />
                  <span class="text-sm font-medium" style="color: {$colorStore.text}">
                    {highlight.authorName}
                  </span>
                </div>

                <!-- Message content -->
                <p class="text-sm mb-2" style="color: {$colorStore.text}">
                  {highlight.content.length > 100 ? highlight.content.substring(0, 100) + '...' : highlight.content}
                </p>

                <!-- Image if present -->
                {#if highlight.imageUrl}
                  <div class="mb-2">
                    <img src={highlight.imageUrl} alt="Starboard image"
                         class="rounded-lg max-h-20 object-cover" />
                  </div>
                {/if}

                <!-- Star count and timestamp -->
                <div class="flex items-center justify-between text-xs" style="color: {$colorStore.muted}">
                  <span>{new Date(highlight.createdAt).toLocaleDateString()}</span>
                  <div class="flex items-center gap-1">
                    <span class="text-sm">{highlight.starEmote || '⭐'}</span>
                    <span class="font-medium">{highlight.starCount}</span>
                  </div>
                </div>
              </div>
            {/each}
          {/if}
        </div>
      </div>
    </div>

    <!-- Engagement Metrics (25% - 3 columns) -->
    <div class="lg:col-span-3 space-y-6">
      <!-- Member Engagement -->
      <div class="backdrop-blur-sm rounded-2xl p-6 shadow-2xl transition-all hover:shadow-xl hover:translate-y-[-2px]"
           style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15, {$colorStore.gradientEnd}10);">
        <div class="flex items-center gap-3 mb-4">
          <Users class="w-5 h-5" style="color: {$colorStore.primary}" />
          <h3 class="font-semibold" style="color: {$colorStore.text}">Engagement</h3>
        </div>

        <div class="space-y-3">
          <StatCard
            animationDelay={0}
            icon={Users}
            iconColor="primary"
            label="Active Members"
            subtitle={memberStats?.totalMembers > 0 ? `${Math.round((activeMembers / memberStats.totalMembers) * 100)}% engagement rate` : "No data"}
            value={activeMembers}
          />

          <StatCard
            animationDelay={100}
            icon={MessageSquare}
            iconColor="secondary"
            label="Daily Messages"
            subtitle={messageCountEnabled ? "Last 24 hours" : "Message tracking disabled"}
            value={messageCountEnabled ? dailyMessages.toLocaleString() : "N/A"}
          />
        </div>
      </div>

      <!-- Feature Status -->
      <div class="backdrop-blur-sm rounded-2xl p-6 shadow-2xl transition-all hover:shadow-xl hover:translate-y-[-2px]"
           style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15, {$colorStore.gradientEnd}10);">
        <div class="flex items-center gap-3 mb-4">
          <Award class="w-5 h-5" style="color: {$colorStore.primary}" />
          <h3 class="font-semibold" style="color: {$colorStore.text}">Features</h3>
        </div>

        <div class="space-y-3">
          <!-- XP System -->
          <FeatureCard
            animationDelay={0}
            compact={true}
            description={featureDescriptions.xp}
            href="/dashboard/xp"
            icon={Star}
            isActive={true}
            title="XP System"
          />

          <!-- Suggestions -->
          <FeatureCard
            animationDelay={50}
            compact={true}
            description={featureDescriptions.suggestions}
            href="/dashboard/suggestions"
            icon={Lightbulb}
            isActive={guildFeatures.suggestions}
            title="Suggestions"
          />

          <!-- Starboard -->
          <FeatureCard
            animationDelay={100}
            compact={true}
            description={featureDescriptions.starboard}
            href="/dashboard/starboard"
            icon={Star}
            isActive={guildFeatures.starboard}
            title="Starboard"
          />
        </div>
      </div>

      <!-- Community Support -->
      <div class="backdrop-blur-sm rounded-2xl p-6 shadow-2xl transition-all hover:shadow-xl hover:translate-y-[-2px]"
           style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15, {$colorStore.gradientEnd}10);">
        <div class="flex items-center gap-3 mb-4">
          <Heart class="w-5 h-5" style="color: {$colorStore.accent}" />
          <h3 class="font-semibold" style="color: {$colorStore.text}">Support</h3>
        </div>

        <div class="space-y-3">
          {#if patreonConnected}
            <StatCard
              icon={Heart}
              label="Supporters"
              value={patreonSupporters}
              subtitle={patreonSupporters === 1 ? "patron" : "patrons"}
              iconColor="accent"
              animationDelay={0}
            />

            {#if patreonGoals.length > 0}
              {#each patreonGoals.slice(0, 2) as goal}
                <div class="p-3 rounded-xl" style="background: {$colorStore.primary}08;">
                  <div class="flex items-center justify-between mb-2">
                    <div class="flex items-center gap-2">
                      <Target size={16} style="color: {$colorStore.accent}" />
                      <span class="text-sm font-medium" style="color: {$colorStore.text}">
                        {goal.title}
                      </span>
                    </div>
                    <span class="text-xs px-2 py-1 rounded-full"
                          style="background: {$colorStore.accent}20; color: {$colorStore.accent}">
                      {Math.round((goal.currentAmount / goal.amountCents) * 100)}%
                    </span>
                  </div>
                  <div class="w-full bg-gray-700 rounded-full h-2">
                    <div class="h-2 rounded-full transition-all duration-1000"
                         style="background: {$colorStore.accent}; width: {Math.min((goal.currentAmount / goal.amountCents) * 100, 100)}%">
                    </div>
                  </div>
                  <div class="text-xs mt-1" style="color: {$colorStore.muted}">
                    ${(goal.currentAmount / 100).toFixed(2)} / ${(goal.amountCents / 100).toFixed(2)}
                  </div>
                </div>
              {/each}
            {/if}

            <FeatureCard
              icon={Heart}
              title="Patreon"
              isActive={true}
              description="Support the community and unlock exclusive features"
              href="/dashboard/patreon"
              animationDelay={150}
              compact={true}
            />
          {:else}
            <div class="text-center py-6">
              <Heart class="w-8 h-8 mx-auto mb-3" style="color: {$colorStore.accent}50" />
              <p class="text-sm mb-3" style="color: {$colorStore.muted}">
                Patreon not connected. Enable supporter features and track community goals.
              </p>
              <FeatureCard
                icon={Heart}
                title="Connect Patreon"
                isActive={false}
                description="Set up Patreon integration for community support"
                href="/dashboard/patreon"
                animationDelay={0}
                compact={true}
              />
            </div>
          {/if}
        </div>
      </div>
    </div>
  </div>

  <!-- Invite Stats - Full Width -->
  <div class="w-full">
    <InviteStats animationDelay={300} />
  </div>
</div>