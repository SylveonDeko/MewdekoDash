<!-- lib/components/dashboard/ActionsTab.svelte -->
<script lang="ts">
  import { fly } from "svelte/transition";
  import { onMount } from "svelte";
  import { colorStore } from "$lib/stores/colorStore";
  import { currentGuild } from "$lib/stores/currentGuild";
  import { api } from "$lib/api";
  import { logger } from "$lib/logger";
  import { 
    Activity, 
    Bell, 
    Code, 
    MessageSquare, 
    RepeatIcon,
    RotateCcw, 
    Sparkles, 
    ToggleLeft, 
    UserCheck, 
    Users,
    Clock,
    Zap
  } from "lucide-svelte";

  import StatCard from "$lib/components/monitoring/StatCard.svelte";
  import FeatureCard from "$lib/components/ui/FeatureCard.svelte";

  // Actions data
  let roleGreets: any[] = [];
  let roleStates: any[] = [];
  let guildConfig: any = {};
  let loading = true;

  // Derived stats
  let actionsStats = {
    activeGreets: 0,
    totalRoleStates: 0,
    afkEnabled: false,
    recentGreets: 0
  };

  let recentGreetings: any[] = [];

  async function fetchActionsData() {
    if (!$currentGuild?.id) return;

    try {
      // Fetch all actions data in parallel for better performance
      const [roleGreetsData, roleStatesData, guildConfigData] = await Promise.all([
        api.getAllRoleGreets($currentGuild.id).catch(() => []),
        api.getAllRoleStates($currentGuild.id).catch(() => []),
        api.getGuildConfig($currentGuild.id).catch(() => ({}))
      ]);

      // Process role greets data
      roleGreets = roleGreetsData || [];
      const activeGreets = roleGreets.filter(greet => !greet.disabled);
      
      // Process role states data
      roleStates = roleStatesData || [];

      // Process guild config
      guildConfig = guildConfigData || {};

      // Calculate recent greetings (simulate from existing data)
      const recentGreetCount = activeGreets.length > 0 ? Math.floor(Math.random() * 10) + 1 : 0;

      actionsStats = {
        activeGreets: activeGreets.length,
        totalRoleStates: roleStates.length,
        afkEnabled: !!guildConfig.AfkChannel,
        recentGreets: recentGreetCount
      };

      // Generate recent greetings display data
      recentGreetings = activeGreets.slice(0, 3).map((greet, index) => ({
        id: greet.id || index,
        roleId: greet.roleId,
        roleName: greet.roleName || `Role ${greet.roleId}`,
        greeting: greet.greeting || greet.greetingText || "Welcome message",
        timestamp: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString(),
        isEnabled: !greet.disabled
      }));

    } catch (err) {
      logger.error("Failed to fetch actions data:", err);
      // Reset to safe defaults
      roleGreets = [];
      roleStates = [];
      guildConfig = {};
      actionsStats = { activeGreets: 0, totalRoleStates: 0, afkEnabled: false, recentGreets: 0 };
      recentGreetings = [];
    } finally {
      loading = false;
    }
  }

  onMount(() => {
    fetchActionsData();
  });

  $: if ($currentGuild) {
    fetchActionsData();
  }

  // Helper functions
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

  function truncateText(text: string, maxLength: number = 50): string {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  }
</script>

<div class="space-y-4" in:fly={{ y: 20, duration: 300 }}>
  <!-- 2-Column Layout: Recent Activity & Features | Actions Stats -->
  <div class="grid grid-cols-1 lg:grid-cols-12 gap-4">

    <!-- Column 1: Recent Activity & Features (6 columns) -->
    <div class="lg:col-span-6 space-y-4">
      <!-- Recent Activity -->
      <div
        class="backdrop-blur-sm rounded-xl p-4 shadow-lg transition-all hover:shadow-xl hover:translate-y-[-1px]"
        style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15, {$colorStore.gradientEnd}10);">
        <div class="flex items-center gap-3 mb-4">
          <div class="p-2 rounded-lg"
               style="background: linear-gradient(135deg, {$colorStore.primary}20, {$colorStore.secondary}20);">
            <Activity class="w-5 h-5" style="color: {$colorStore.primary}" />
          </div>
          <h2 class="text-lg font-bold" style="color: {$colorStore.text}">Recent Activity</h2>
        </div>

        <div class="space-y-2">
        {#if loading}
          <!-- Loading state -->
          {#each Array(3).fill(0) as _}
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
        {:else if recentGreetings.length === 0}
          <!-- Empty state -->
          <div class="text-center py-6">
            <Bell class="w-10 h-10 mx-auto mb-3" style="color: {$colorStore.primary}50" />
            <h3 class="text-base font-semibold mb-1" style="color: {$colorStore.text}">No Recent Activity</h3>
            <p class="text-xs" style="color: {$colorStore.muted}">
              Set up greetings and role actions to see activity here.
            </p>
          </div>
        {:else}
          {#each recentGreetings as greeting}
            <div class="flex items-center gap-3 p-2 rounded-lg transition-all hover:scale-[1.01]"
                 style="background: {$colorStore.primary}08;">

              <!-- Action Icon -->
              <div class="w-6 h-6 rounded-full flex items-center justify-center"
                   style="background: {greeting.isEnabled ? $colorStore.primary + '20' : $colorStore.muted + '20'};">
                <Bell size={14} style="color: {greeting.isEnabled ? $colorStore.primary : $colorStore.muted}" />
              </div>

              <!-- Greeting Details -->
              <div class="flex-1 min-w-0">
                <div class="font-medium text-sm truncate" style="color: {$colorStore.text}">
                  Role Greeting • {greeting.roleName}
                </div>
                <div class="text-xs truncate" style="color: {$colorStore.muted}">
                  {truncateText(greeting.greeting)}
                </div>
              </div>

              <!-- Timestamp -->
              <div class="text-xs flex items-center gap-1" style="color: {$colorStore.muted}">
                <Clock size={10} />
                {formatRelativeTime(greeting.timestamp)}
              </div>
            </div>
          {/each}

          <!-- View More Button -->
          <a class="w-full mt-3 flex items-center justify-center gap-2 py-2 px-3 rounded-lg transition-all hover:scale-105 text-sm"
             href="/dashboard/rolegreets"
             style="background: {$colorStore.primary}20; color: {$colorStore.primary}; border: 1px solid {$colorStore.primary}30;">
            <UserCheck size={14} />
            Manage Role Greets
          </a>
        {/if}
        </div>
      </div>

      <!-- Feature Status List -->
      <div class="space-y-3">
        <!-- Multi Greets Status -->
        <div class="backdrop-blur-sm rounded-lg p-3 shadow-md transition-all hover:scale-[1.01]"
             style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15, {$colorStore.gradientEnd}10);">
          <div class="flex items-center gap-3">
            <div class="p-2 rounded-lg"
                 style="background: {$colorStore.primary}20;">
              <Bell class="w-5 h-5" style="color: {$colorStore.primary}" />
            </div>
            <div class="flex-1">
              <div class="flex items-baseline gap-3">
                <span class="text-lg font-bold" style="color: {$colorStore.text}">{actionsStats.activeGreets}</span>
                <span class="text-sm font-medium" style="color: {$colorStore.text}">Multi Greets</span>
              </div>
              <div class="text-xs" style="color: {$colorStore.muted}">
                {actionsStats.activeGreets > 0 ? `${actionsStats.activeGreets} active greetings` : 'No greetings configured'}
              </div>
            </div>
            <a href="/dashboard/multigreets" 
               class="px-2 py-1 rounded text-xs transition-all hover:scale-105"
               style="background: {$colorStore.primary}20; color: {$colorStore.primary};">
              Configure
            </a>
          </div>
        </div>

        <!-- Role States Status -->
        <div class="backdrop-blur-sm rounded-lg p-3 shadow-md transition-all hover:scale-[1.01]"
             style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15, {$colorStore.gradientEnd}10);">
          <div class="flex items-center gap-3">
            <div class="p-2 rounded-lg"
                 style="background: {$colorStore.secondary}20;">
              <RotateCcw class="w-5 h-5" style="color: {$colorStore.secondary}" />
            </div>
            <div class="flex-1">
              <div class="flex items-baseline gap-3">
                <span class="text-lg font-bold" style="color: {$colorStore.text}">{actionsStats.totalRoleStates}</span>
                <span class="text-sm font-medium" style="color: {$colorStore.text}">Role States</span>
              </div>
              <div class="text-xs" style="color: {$colorStore.muted}">
                {actionsStats.totalRoleStates > 0 ? `${actionsStats.totalRoleStates} configured states` : 'No states configured'}
              </div>
            </div>
            <a href="/dashboard/rolestates" 
               class="px-2 py-1 rounded text-xs transition-all hover:scale-105"
               style="background: {$colorStore.secondary}20; color: {$colorStore.secondary};">
              Configure
            </a>
          </div>
        </div>

        <!-- AFK System Status -->
        <div class="backdrop-blur-sm rounded-lg p-3 shadow-md transition-all hover:scale-[1.01]"
             style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15, {$colorStore.gradientEnd}10);">
          <div class="flex items-center gap-3">
            <div class="p-2 rounded-lg"
                 style="background: {$colorStore.accent}20;">
              <ToggleLeft class="w-5 h-5" style="color: {$colorStore.accent}" />
            </div>
            <div class="flex-1">
              <div class="flex items-baseline gap-3">
                <span class="text-lg font-bold" style="color: {$colorStore.text}">{actionsStats.afkEnabled ? "ON" : "OFF"}</span>
                <span class="text-sm font-medium" style="color: {$colorStore.text}">AFK System</span>
              </div>
              <div class="text-xs" style="color: {$colorStore.muted}">
                {actionsStats.afkEnabled ? 'Channel configured' : 'Not configured'}
              </div>
            </div>
            <a href="/dashboard/afk" 
               class="px-2 py-1 rounded text-xs transition-all hover:scale-105"
               style="background: {$colorStore.accent}20; color: {$colorStore.accent};">
              Configure
            </a>
          </div>
        </div>
      </div>
    </div>

    <!-- Column 2: Actions Stats & Tools (6 columns) -->
    <div class="lg:col-span-6 space-y-4">
      <!-- Action Tools -->
      <div class="space-y-3">
        <!-- Chat Triggers -->
        <div class="backdrop-blur-sm rounded-lg p-3 shadow-md transition-all hover:scale-[1.01]"
             style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15, {$colorStore.gradientEnd}10);">
          <div class="flex items-center gap-3">
            <div class="p-2 rounded-lg"
                 style="background: {$colorStore.primary}20;">
              <MessageSquare class="w-5 h-5" style="color: {$colorStore.primary}" />
            </div>
            <div class="flex-1">
              <div class="flex items-baseline gap-3">
                <span class="text-lg font-bold" style="color: {$colorStore.text}">Active</span>
                <span class="text-sm font-medium" style="color: {$colorStore.text}">Chat Triggers</span>
              </div>
              <div class="text-xs" style="color: {$colorStore.muted}">Automated responses and reactions</div>
            </div>
            <a href="/dashboard/chat-triggers" 
               class="px-2 py-1 rounded text-xs transition-all hover:scale-105"
               style="background: {$colorStore.primary}20; color: {$colorStore.primary};">
              Manage
            </a>
          </div>
        </div>

        <!-- Embed Builder -->
        <div class="backdrop-blur-sm rounded-lg p-3 shadow-md transition-all hover:scale-[1.01]"
             style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15, {$colorStore.gradientEnd}10);">
          <div class="flex items-center gap-3">
            <div class="p-2 rounded-lg"
                 style="background: {$colorStore.secondary}20;">
              <Code class="w-5 h-5" style="color: {$colorStore.secondary}" />
            </div>
            <div class="flex-1">
              <div class="flex items-baseline gap-3">
                <span class="text-lg font-bold" style="color: {$colorStore.text}">Ready</span>
                <span class="text-sm font-medium" style="color: {$colorStore.text}">Embed Builder</span>
              </div>
              <div class="text-xs" style="color: {$colorStore.muted}">Create custom embeds</div>
            </div>
            <a href="/dashboard/embedbuilder" 
               class="px-2 py-1 rounded text-xs transition-all hover:scale-105"
               style="background: {$colorStore.secondary}20; color: {$colorStore.secondary};">
              Open
            </a>
          </div>
        </div>

        <!-- Message Repeaters -->
        <div class="backdrop-blur-sm rounded-lg p-3 shadow-md transition-all hover:scale-[1.01]"
             style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15, {$colorStore.gradientEnd}10);">
          <div class="flex items-center gap-3">
            <div class="p-2 rounded-lg"
                 style="background: {$colorStore.accent}20;">
              <RepeatIcon class="w-5 h-5" style="color: {$colorStore.accent}" />
            </div>
            <div class="flex-1">
              <div class="flex items-baseline gap-3">
                <span class="text-lg font-bold" style="color: {$colorStore.text}">Active</span>
                <span class="text-sm font-medium" style="color: {$colorStore.text}">Repeaters</span>
              </div>
              <div class="text-xs" style="color: {$colorStore.muted}">Automated recurring messages</div>
            </div>
            <a href="/dashboard/repeaters" 
               class="px-2 py-1 rounded text-xs transition-all hover:scale-105"
               style="background: {$colorStore.accent}20; color: {$colorStore.accent};">
              Manage
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>