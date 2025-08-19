<!-- lib/components/dashboard/SecurityTab.svelte -->
<script lang="ts">
  import { fly } from "svelte/transition";
  import { onMount } from "svelte";
  import { colorStore } from "$lib/stores/colorStore";
  import { currentGuild } from "$lib/stores/currentGuild";
  import { api } from "$lib/api";
  import { logger } from "$lib/logger";
  import { Activity, AlertTriangle, Clock, FileText, MessageSquareWarning, Shield, UserX } from "lucide-svelte";

  import type { LoggingConfigurationResponse } from "$lib/types/logging.ts";

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

  // Logging data
  let loggingConfig: LoggingConfigurationResponse | null = null;
  let loggingStats = {
    configuredChannels: 0,
    ignoredChannels: 0,
    ignoredUsers: 0,
    totalLogTypes: 0
  };

  async function fetchSecurityData() {
    if (!$currentGuild?.id) return;

    try {
      // Fetch all security data in parallel
      const [warningsData, protectionData, moderationData, loggingConfigData] = await Promise.all([
        api.getWarnings($currentGuild.id).catch(() => []),
        api.getProtectionStatus($currentGuild.id).catch(() => ({})),
        api.getRecentModerationActivity($currentGuild.id).catch(() => []),
        api.getLoggingConfig($currentGuild.id).catch(() => null)
      ]);

      // Process warnings data
      const warnings = warningsData || [];
      moderationStats.totalWarnings = warnings.length;
      moderationStats.recentActions = warnings.filter(w => {
        if (!w.dateAdded) return false;
        const warningDate = new Date(w.dateAdded);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return warningDate > weekAgo;
      }).length;

      // Process protection status
      protectionStatus = protectionData && Object.keys(protectionData).length > 0 ? protectionData : {
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

      // Process logging configuration data
      loggingConfig = loggingConfigData;
      if (loggingConfig) {
        const logChannels = loggingConfig.logChannels || {};
        loggingStats = {
          configuredChannels: Object.values(logChannels).filter(channelId => channelId && channelId !== BigInt(0)).length,
          ignoredChannels: (loggingConfig.ignoredChannels || []).length,
          ignoredUsers: (loggingConfig.ignoredUsers || []).length,
          totalLogTypes: Object.keys(logChannels).length
        };
      } else {
        loggingStats = { configuredChannels: 0, ignoredChannels: 0, ignoredUsers: 0, totalLogTypes: 0 };
      }

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
      loggingConfig = null;
      loggingStats = { configuredChannels: 0, ignoredChannels: 0, ignoredUsers: 0, totalLogTypes: 0 };
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

<div class="space-y-4" in:fly={{ y: 20, duration: 300 }}>
  <!-- 2-Column Layout: Recent Actions & Protection | Security Stats -->
  <div class="grid grid-cols-1 lg:grid-cols-12 gap-4">

    <!-- Column 1: Recent Actions & Protection (6 columns) -->
    <div class="lg:col-span-6 space-y-4">
      <!-- Recent Moderation Actions -->
      <div
        class="backdrop-blur-sm rounded-xl p-4 shadow-lg transition-all hover:shadow-xl hover:translate-y-[-1px]"
        style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15, {$colorStore.gradientEnd}10);">
        <div class="flex items-center gap-3 mb-4">
          <div class="p-2 rounded-lg"
               style="background: linear-gradient(135deg, {$colorStore.primary}20, {$colorStore.secondary}20);">
            <Activity class="w-5 h-5" style="color: {$colorStore.primary}" />
          </div>
          <h2 class="text-lg font-bold" style="color: {$colorStore.text}">Recent Actions</h2>
        </div>

        <div class="space-y-2">
        {#if loading}
          <!-- Loading state -->
          {#each Array(5).fill(0) as _}
            <div class="flex items-center gap-3 p-2 rounded-lg animate-pulse"
                 style="background: {$colorStore.primary}08;">
              <div class="w-6 h-6 rounded-full" style="background: {$colorStore.primary}20;"></div>
              <div class="flex-1 space-y-1">
                <div class="h-3 rounded" style="background: {$colorStore.primary}20; width: 70%;"></div>
                <div class="h-2 rounded" style="background: {$colorStore.primary}15; width: 50%;"></div>
              </div>
              <div class="w-10 h-3 rounded" style="background: {$colorStore.primary}20;"></div>
            </div>
          {/each}
        {:else if recentModerationActions.length === 0}
          <!-- Empty state -->
          <div class="text-center py-6">
            <Shield class="w-10 h-10 mx-auto mb-3" style="color: {$colorStore.primary}50" />
            <h3 class="text-base font-semibold mb-1" style="color: {$colorStore.text}">All Clear</h3>
            <p class="text-xs" style="color: {$colorStore.muted}">
              No recent moderation actions. Your server is running smoothly!
            </p>
          </div>
        {:else}
          {#each recentModerationActions as action}
            <div class="flex items-center gap-3 p-2 rounded-lg transition-all hover:scale-[1.01]"
                 style="background: {$colorStore.primary}08;">

              <!-- Action Icon -->
              <div class="w-6 h-6 rounded-full flex items-center justify-center"
                   style="background: {getActionColor(action.punishment || action.action)}20;">
                <svelte:component this={getActionIcon(action.punishment || action.action)}
                                  size={14}
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
        <a class="w-full mt-3 flex items-center justify-center gap-2 py-2 px-3 rounded-lg transition-all hover:scale-105 text-sm"
           href="/dashboard/moderation"
           style="background: {$colorStore.primary}20; color: {$colorStore.primary}; border: 1px solid {$colorStore.primary}30;">
          <Shield size={14} />
          Full Moderation Dashboard
        </a>
      </div>

      <!-- Protection Status List -->
      <div class="space-y-3">
        <!-- Anti-Raid -->
        <div class="backdrop-blur-sm rounded-lg p-3 shadow-md"
             style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15, {$colorStore.gradientEnd}10);">
          <div class="flex items-center gap-3">
            <div class="w-3 h-3 rounded-full"
                 style="background: {protectionStatus.antiRaid?.enabled ? '#10b981' : $colorStore.muted};"></div>
            <div class="flex-1">
              <div class="font-medium text-sm" style="color: {$colorStore.text}">Anti-Raid</div>
              <div class="text-xs" style="color: {$colorStore.muted}">
                {protectionStatus.antiRaid?.enabled ? 'Active' : 'Disabled'}
              </div>
            </div>
            <a href="/dashboard/administration" 
               class="px-2 py-1 rounded text-xs transition-all hover:scale-105"
               style="background: {$colorStore.primary}20; color: {$colorStore.primary};">
              Configure
            </a>
          </div>
        </div>

        <!-- Anti-Spam -->
        <div class="backdrop-blur-sm rounded-lg p-3 shadow-md"
             style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15, {$colorStore.gradientEnd}10);">
          <div class="flex items-center gap-3">
            <div class="w-3 h-3 rounded-full"
                 style="background: {protectionStatus.antiSpam?.enabled ? '#10b981' : $colorStore.muted};"></div>
            <div class="flex-1">
              <div class="font-medium text-sm" style="color: {$colorStore.text}">Anti-Spam</div>
              <div class="text-xs" style="color: {$colorStore.muted}">
                {protectionStatus.antiSpam?.enabled ? 'Active' : 'Disabled'}
              </div>
            </div>
            <a href="/dashboard/administration" 
               class="px-2 py-1 rounded text-xs transition-all hover:scale-105"
               style="background: {$colorStore.secondary}20; color: {$colorStore.secondary};">
              Configure
            </a>
          </div>
        </div>

        <!-- Anti-Alt -->
        <div class="backdrop-blur-sm rounded-lg p-3 shadow-md"
             style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15, {$colorStore.gradientEnd}10);">
          <div class="flex items-center gap-3">
            <div class="w-3 h-3 rounded-full"
                 style="background: {protectionStatus.antiAlt?.enabled ? '#10b981' : $colorStore.muted};"></div>
            <div class="flex-1">
              <div class="font-medium text-sm" style="color: {$colorStore.text}">Anti-Alt</div>
              <div class="text-xs" style="color: {$colorStore.muted}">
                {protectionStatus.antiAlt?.enabled ? 'Active' : 'Disabled'}
              </div>
            </div>
            <a href="/dashboard/administration" 
               class="px-2 py-1 rounded text-xs transition-all hover:scale-105"
               style="background: {$colorStore.accent}20; color: {$colorStore.accent};">
              Configure
            </a>
          </div>
        </div>

        <!-- Anti-Mass Mention -->
        <div class="backdrop-blur-sm rounded-lg p-3 shadow-md"
             style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15, {$colorStore.gradientEnd}10);">
          <div class="flex items-center gap-3">
            <div class="w-3 h-3 rounded-full"
                 style="background: {protectionStatus.antiMassMention?.enabled ? '#10b981' : $colorStore.muted};"></div>
            <div class="flex-1">
              <div class="font-medium text-sm" style="color: {$colorStore.text}">Anti-Mass Mention</div>
              <div class="text-xs" style="color: {$colorStore.muted}">
                {protectionStatus.antiMassMention?.enabled ? 'Active' : 'Disabled'}
              </div>
            </div>
            <a href="/dashboard/administration" 
               class="px-2 py-1 rounded text-xs transition-all hover:scale-105"
               style="background: {$colorStore.primary}20; color: {$colorStore.primary};">
              Configure
            </a>
          </div>
        </div>
      </div>
    </div>

    <!-- Column 2: Security Stats (6 columns) -->
    <div class="lg:col-span-6 space-y-4">
      <!-- Security Stats List -->
      <div class="space-y-3">
        <!-- Total Warnings -->
        <div class="backdrop-blur-sm rounded-lg p-3 shadow-md transition-all hover:scale-[1.01]"
             style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15, {$colorStore.gradientEnd}10);">
          <div class="flex items-center gap-3">
            <div class="p-2 rounded-lg"
                 style="background: {$colorStore.accent}20;">
              <MessageSquareWarning class="w-5 h-5" style="color: {$colorStore.accent}" />
            </div>
            <div class="flex-1">
              <div class="flex items-baseline gap-3">
                <span class="text-lg font-bold" style="color: {$colorStore.text}">{moderationStats.totalWarnings}</span>
                <span class="text-sm font-medium" style="color: {$colorStore.text}">Total Warnings</span>
              </div>
              <div class="text-xs" style="color: {$colorStore.muted}">All time moderation actions</div>
            </div>
            <a href="/dashboard/moderation" 
               class="px-2 py-1 rounded text-xs transition-all hover:scale-105"
               style="background: {$colorStore.accent}20; color: {$colorStore.accent};">
              Manage
            </a>
          </div>
        </div>

        <!-- Recent Actions -->
        <div class="backdrop-blur-sm rounded-lg p-3 shadow-md transition-all hover:scale-[1.01]"
             style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15, {$colorStore.gradientEnd}10);">
          <div class="flex items-center gap-3">
            <div class="p-2 rounded-lg"
                 style="background: {$colorStore.primary}20;">
              <Activity class="w-5 h-5" style="color: {$colorStore.primary}" />
            </div>
            <div class="flex-1">
              <div class="flex items-baseline gap-3">
                <span class="text-lg font-bold" style="color: {$colorStore.text}">{moderationStats.recentActions}</span>
                <span class="text-sm font-medium" style="color: {$colorStore.text}">This Week</span>
              </div>
              <div class="text-xs" style="color: {$colorStore.muted}">Recent moderation actions</div>
            </div>
          </div>
        </div>

        <!-- Log Channels -->
        <div class="backdrop-blur-sm rounded-lg p-3 shadow-md transition-all hover:scale-[1.01]"
             style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15, {$colorStore.gradientEnd}10);">
          <div class="flex items-center gap-3">
            <div class="p-2 rounded-lg"
                 style="background: {$colorStore.secondary}20;">
              <FileText class="w-5 h-5" style="color: {$colorStore.secondary}" />
            </div>
            <div class="flex-1">
              <div class="flex items-baseline gap-3">
                <span class="text-lg font-bold" style="color: {$colorStore.text}">{loggingStats.configuredChannels}</span>
                <span class="text-sm font-medium" style="color: {$colorStore.text}">Log Channels</span>
              </div>
              <div class="text-xs" style="color: {$colorStore.muted}">{loggingStats.totalLogTypes} event types</div>
            </div>
            <a href="/dashboard/logging" 
               class="px-2 py-1 rounded text-xs transition-all hover:scale-105"
               style="background: {$colorStore.secondary}20; color: {$colorStore.secondary};">
              Configure
            </a>
          </div>
        </div>

        <!-- Active Protections -->
        <div class="backdrop-blur-sm rounded-lg p-3 shadow-md transition-all hover:scale-[1.01]"
             style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15, {$colorStore.gradientEnd}10);">
          <div class="flex items-center gap-3">
            <div class="p-2 rounded-lg"
                 style="background: {$colorStore.primary}20;">
              <Shield class="w-5 h-5" style="color: {$colorStore.primary}" />
            </div>
            <div class="flex-1">
              <div class="flex items-baseline gap-3">
                <span class="text-lg font-bold" style="color: {$colorStore.text}">{activeProtections}</span>
                <span class="text-sm font-medium" style="color: {$colorStore.text}">Active Protections</span>
              </div>
              <div class="text-xs" style="color: {$colorStore.muted}">{activeProtections}/4 protections enabled</div>
            </div>
            <a href="/dashboard/administration" 
               class="px-2 py-1 rounded text-xs transition-all hover:scale-105"
               style="background: {$colorStore.primary}20; color: {$colorStore.primary};">
              Configure
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>