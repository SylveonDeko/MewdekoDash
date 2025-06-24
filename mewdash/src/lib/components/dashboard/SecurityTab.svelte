<!-- lib/components/dashboard/SecurityTab.svelte -->
<script lang="ts">
  import { fly } from "svelte/transition";
  import { onMount } from "svelte";
  import { colorStore } from "$lib/stores/colorStore";
  import { currentGuild } from "$lib/stores/currentGuild";
  import { api } from "$lib/api";
  import { logger } from "$lib/logger";
  import { Activity, AlertTriangle, Clock, Lock, MessageSquareWarning, Shield, Users, UserX } from "lucide-svelte";

  import StatCard from "$lib/components/StatCard.svelte";
  import FeatureCard from "$lib/components/FeatureCard.svelte";

  // Props from parent


  // Security data
  let moderationStats = {
    totalWarnings: 0,
    activeMutes: 0,
    recentActions: 0,
    totalBans: 0
  };

  let protectionStatus = {
    antiRaid: { enabled: false },
    antiSpam: { enabled: false },
    antiAlt: { enabled: false },
    antiMassMention: { enabled: false }
  };

  let recentModerationActions: any[] = [];
  let loading = true;

  async function fetchSecurityData() {
    if (!$currentGuild?.id) return;

    try {
      // Fetch all security data in parallel
      const [warningsData, protectionData, moderationData] = await Promise.all([
        api.getWarnings($currentGuild.id).catch(() => []),
        api.getProtectionStatus($currentGuild.id).catch(() => ({})),
        api.getRecentModerationActivity($currentGuild.id).catch(() => [])
      ]);

      // Process warnings data
      const warnings = warningsData || [];
      moderationStats.totalWarnings = warnings.length;
      moderationStats.recentActions = warnings.filter(w => {
        const warningDate = new Date(w.dateAdded);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return warningDate > weekAgo;
      }).length;

      // Process protection status
      protectionStatus = protectionData || {
        antiRaid: { enabled: false },
        antiSpam: { enabled: false },
        antiAlt: { enabled: false },
        antiMassMention: { enabled: false }
      };

      // Process recent moderation actions (last 5) - use actual API data structure
      recentModerationActions = (moderationData || [])
        .filter(action => action.dateAdded) // Filter out invalid entries
        .sort((a, b) => new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime())
        .slice(0, 5);

    } catch (err) {
      logger.error("Failed to fetch security data:", err);
      // Reset to safe defaults
      moderationStats = { totalWarnings: 0, activeMutes: 0, recentActions: 0, totalBans: 0 };
      protectionStatus = {
        antiRaid: { enabled: false },
        antiSpam: { enabled: false },
        antiAlt: { enabled: false },
        antiMassMention: { enabled: false }
      };
      recentModerationActions = [];
    } finally {
      loading = false;
    }
  }

  onMount(() => {
    fetchSecurityData();
  });

  $: if ($currentGuild) {
    fetchSecurityData();
  }

  // Helper functions
  function getActionIcon(action: string) {
    switch (action?.toLowerCase()) {
      case "warn":
      case "warning":
        return MessageSquareWarning;
      case "mute":
      case "timeout":
        return UserX;
      case "ban":
        return Shield;
      default:
        return AlertTriangle;
    }
  }

  function getActionColor(action: string) {
    switch (action?.toLowerCase()) {
      case "warn":
      case "warning":
        return $colorStore.accent;
      case "mute":
      case "timeout":
        return "#f59e0b";
      case "ban":
        return "#ef4444";
      default:
        return $colorStore.muted;
    }
  }

  function formatRelativeTime(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  }

  // Count active protections
  $: activeProtections = Object.values(protectionStatus).filter(p => p.enabled).length;
</script>

<div class="space-y-6" in:fly={{ y: 20, duration: 300 }}>
  <!-- 3-Column Layout: Recent Actions | Protection Status | Security Metrics -->
  <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">

    <!-- Recent Moderation Actions (35% - 4 columns) -->
    <div
      class="lg:col-span-4 backdrop-blur-sm rounded-2xl p-6 shadow-2xl transition-all hover:shadow-xl hover:translate-y-[-2px]"
      style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15, {$colorStore.gradientEnd}10);">
      <div class="flex items-center gap-4 mb-6">
        <div class="p-3 rounded-xl"
             style="background: linear-gradient(135deg, {$colorStore.primary}20, {$colorStore.secondary}20);">
          <Activity class="w-6 h-6" style="color: {$colorStore.primary}" />
        </div>
        <h2 class="text-xl font-bold" style="color: {$colorStore.text}">Recent Actions</h2>
      </div>

      <div class="space-y-3">
        {#if loading}
          <!-- Loading state -->
          {#each Array(5).fill(0) as _}
            <div class="flex items-center gap-3 p-3 rounded-xl animate-pulse"
                 style="background: {$colorStore.primary}08;">
              <div class="w-8 h-8 rounded-full" style="background: {$colorStore.primary}20;"></div>
              <div class="flex-1 space-y-1">
                <div class="h-3 rounded" style="background: {$colorStore.primary}20; width: 70%;"></div>
                <div class="h-2 rounded" style="background: {$colorStore.primary}15; width: 50%;"></div>
              </div>
              <div class="w-12 h-4 rounded" style="background: {$colorStore.primary}20;"></div>
            </div>
          {/each}
        {:else if recentModerationActions.length === 0}
          <!-- Empty state -->
          <div class="text-center py-8">
            <Shield class="w-12 h-12 mx-auto mb-4" style="color: {$colorStore.primary}50" />
            <h3 class="text-lg font-semibold mb-2" style="color: {$colorStore.text}">All Clear</h3>
            <p class="text-sm" style="color: {$colorStore.muted}">
              No recent moderation actions. Your server is running smoothly!
            </p>
          </div>
        {:else}
          {#each recentModerationActions as action}
            <div class="flex items-center gap-3 p-3 rounded-xl transition-all hover:scale-[1.02]"
                 style="background: {$colorStore.primary}08;">

              <!-- Action Icon -->
              <div class="w-8 h-8 rounded-full flex items-center justify-center"
                   style="background: {getActionColor(action.punishment || action.action)}20;">
                <svelte:component this={getActionIcon(action.punishment || action.action)}
                                  size={16}
                                  style="color: {getActionColor(action.punishment || action.action)}" />
              </div>

              <!-- Action Details -->
              <div class="flex-1 min-w-0">
                <div class="font-medium text-sm truncate" style="color: {$colorStore.text}">
                  Warning • {action.moderator || 'Unknown Moderator'}
                </div>
                <div class="text-xs truncate" style="color: {$colorStore.muted}">
                  {action.reason || 'No reason provided'}
                </div>
              </div>

              <!-- Timestamp -->
              <div class="text-xs flex items-center gap-1" style="color: {$colorStore.muted}">
                <Clock size={10} />
                {formatRelativeTime(action.dateAdded)}
              </div>
            </div>
          {/each}
        {/if}
      </div>

      <!-- View More Button -->
      <a class="w-full mt-4 flex items-center justify-center gap-2 py-2 px-4 rounded-xl transition-all hover:scale-105"
         href="/dashboard/moderation"
         style="background: {$colorStore.primary}20; color: {$colorStore.primary}; border: 1px solid {$colorStore.primary}30;">
        <Shield size={16} />
        Full Moderation Dashboard
      </a>
    </div>

    <!-- Protection Status (30% - 4 columns) -->
    <div
      class="lg:col-span-4 backdrop-blur-sm rounded-2xl p-6 shadow-2xl transition-all hover:shadow-xl hover:translate-y-[-2px]"
      style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15, {$colorStore.gradientEnd}10);">
      <div class="flex items-center gap-4 mb-6">
        <div class="p-3 rounded-xl"
             style="background: linear-gradient(135deg, {$colorStore.primary}20, {$colorStore.secondary}20);">
          <Shield class="w-6 h-6" style="color: {$colorStore.primary}" />
        </div>
        <div>
          <h2 class="text-xl font-bold" style="color: {$colorStore.text}">Server Protection</h2>
          <p class="text-sm" style="color: {$colorStore.muted}">
            {activeProtections}/4 protections active
          </p>
        </div>
      </div>

      <div class="space-y-4">
        <!-- Anti-Raid -->
        <div class="flex items-center justify-between p-3 rounded-xl"
             style="background: {protectionStatus.antiRaid?.enabled ? $colorStore.primary + '15' : $colorStore.primary + '08'};">
          <div class="flex items-center gap-3">
            <div class="w-3 h-3 rounded-full"
                 style="background: {protectionStatus.antiRaid?.enabled ? '#10b981' : $colorStore.muted};"></div>
            <div>
              <div class="font-medium text-sm" style="color: {$colorStore.text}">Anti-Raid</div>
              <div class="text-xs" style="color: {$colorStore.muted}">
                {protectionStatus.antiRaid?.enabled ? 'Active' : 'Disabled'}
              </div>
            </div>
          </div>
        </div>

        <!-- Anti-Spam -->
        <div class="flex items-center justify-between p-3 rounded-xl"
             style="background: {protectionStatus.antiSpam?.enabled ? $colorStore.primary + '15' : $colorStore.primary + '08'};">
          <div class="flex items-center gap-3">
            <div class="w-3 h-3 rounded-full"
                 style="background: {protectionStatus.antiSpam?.enabled ? '#10b981' : $colorStore.muted};"></div>
            <div>
              <div class="font-medium text-sm" style="color: {$colorStore.text}">Anti-Spam</div>
              <div class="text-xs" style="color: {$colorStore.muted}">
                {protectionStatus.antiSpam?.enabled ? 'Active' : 'Disabled'}
              </div>
            </div>
          </div>
        </div>

        <!-- Anti-Alt -->
        <div class="flex items-center justify-between p-3 rounded-xl"
             style="background: {protectionStatus.antiAlt?.enabled ? $colorStore.primary + '15' : $colorStore.primary + '08'};">
          <div class="flex items-center gap-3">
            <div class="w-3 h-3 rounded-full"
                 style="background: {protectionStatus.antiAlt?.enabled ? '#10b981' : $colorStore.muted};"></div>
            <div>
              <div class="font-medium text-sm" style="color: {$colorStore.text}">Anti-Alt</div>
              <div class="text-xs" style="color: {$colorStore.muted}">
                {protectionStatus.antiAlt?.enabled ? 'Active' : 'Disabled'}
              </div>
            </div>
          </div>
        </div>

        <!-- Anti-Mass Mention -->
        <div class="flex items-center justify-between p-3 rounded-xl"
             style="background: {protectionStatus.antiMassMention?.enabled ? $colorStore.primary + '15' : $colorStore.primary + '08'};">
          <div class="flex items-center gap-3">
            <div class="w-3 h-3 rounded-full"
                 style="background: {protectionStatus.antiMassMention?.enabled ? '#10b981' : $colorStore.muted};"></div>
            <div>
              <div class="font-medium text-sm" style="color: {$colorStore.text}">Anti-Mass Mention</div>
              <div class="text-xs" style="color: {$colorStore.muted}">
                {protectionStatus.antiMassMention?.enabled ? 'Active' : 'Disabled'}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Protection Dashboard Link -->
      <a class="w-full mt-4 flex items-center justify-center gap-2 py-2 px-4 rounded-xl transition-all hover:scale-105"
         href="/dashboard/administration"
         style="background: {$colorStore.secondary}20; color: {$colorStore.secondary}; border: 1px solid {$colorStore.secondary}30;">
        <Lock size={16} />
        Protection Settings
      </a>
    </div>

    <!-- Security Metrics (35% - 4 columns) -->
    <div class="lg:col-span-4 space-y-6">

      <!-- Moderation Stats -->
      <div class="backdrop-blur-sm rounded-2xl p-6 shadow-2xl transition-all hover:shadow-xl hover:translate-y-[-2px]"
           style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15, {$colorStore.gradientEnd}10);">
        <div class="flex items-center gap-3 mb-4">
          <MessageSquareWarning class="w-5 h-5" style="color: {$colorStore.primary}" />
          <h3 class="font-semibold" style="color: {$colorStore.text}">Moderation Stats</h3>
        </div>

        <div class="space-y-3">
          <StatCard
            animationDelay={0}
            icon={MessageSquareWarning}
            iconColor="accent"
            label="Total Warnings"
            value={moderationStats.totalWarnings}
          />

          <StatCard
            animationDelay={100}
            icon={Activity}
            iconColor="primary"
            label="This Week"
            subtitle="Recent actions"
            value={moderationStats.recentActions}
          />
        </div>
      </div>

      <!-- Security Features -->
      <div class="backdrop-blur-sm rounded-2xl p-6 shadow-2xl transition-all hover:shadow-xl hover:translate-y-[-2px]"
           style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15, {$colorStore.gradientEnd}10);">
        <div class="flex items-center gap-3 mb-4">
          <Lock class="w-5 h-5" style="color: {$colorStore.primary}" />
          <h3 class="font-semibold" style="color: {$colorStore.text}">Security Tools</h3>
        </div>

        <div class="space-y-3">
          <!-- Moderation -->
          <FeatureCard
            animationDelay={0}
            compact={true}
            description="User warnings and punishments"
            href="/dashboard/moderation"
            icon={Shield}
            isActive={moderationStats.totalWarnings > 0}
            title="Moderation"
          />

          <!-- Permissions -->
          <FeatureCard
            animationDelay={50}
            compact={true}
            description="Command access control"
            href="/dashboard/permissions"
            icon={Lock}
            isActive={true}
            title="Permissions"
          />

          <!-- Administration -->
          <FeatureCard
            animationDelay={100}
            compact={true}
            description="Server protection and roles"
            href="/dashboard/administration"
            icon={Users}
            isActive={activeProtections > 0}
            title="Administration"
          />
        </div>
      </div>
    </div>
  </div>
</div>