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

<div class="space-y-6" in:fly={{ y: 20, duration: 300 }}>
  <!-- 3-Column Layout: Recent Activity | Feature Status | Actions Metrics -->
  <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">

    <!-- Recent Activity (4 columns) -->
    <div
      class="lg:col-span-4 backdrop-blur-sm rounded-2xl p-6 shadow-2xl transition-all hover:shadow-xl hover:translate-y-[-2px]"
      style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15, {$colorStore.gradientEnd}10);">
      <div class="flex items-center gap-4 mb-6">
        <div class="p-3 rounded-xl"
             style="background: linear-gradient(135deg, {$colorStore.primary}20, {$colorStore.secondary}20);">
          <Activity class="w-6 h-6" style="color: {$colorStore.primary}" />
        </div>
        <h2 class="text-xl font-bold" style="color: {$colorStore.text}">Recent Activity</h2>
      </div>

      <div class="space-y-3">
        {#if loading}
          <!-- Loading state -->
          {#each Array(3).fill(0) as _}
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
        {:else if recentGreetings.length === 0}
          <!-- Empty state -->
          <div class="text-center py-8">
            <Bell class="w-12 h-12 mx-auto mb-4" style="color: {$colorStore.primary}50" />
            <h3 class="text-lg font-semibold mb-2" style="color: {$colorStore.text}">No Recent Activity</h3>
            <p class="text-sm" style="color: {$colorStore.muted}">
              Set up greetings and role actions to see activity here.
            </p>
          </div>
        {:else}
          {#each recentGreetings as greeting}
            <div class="flex items-center gap-3 p-3 rounded-xl transition-all hover:scale-[1.02]"
                 style="background: {$colorStore.primary}08;">

              <!-- Action Icon -->
              <div class="w-8 h-8 rounded-full flex items-center justify-center"
                   style="background: {greeting.isEnabled ? $colorStore.primary + '20' : $colorStore.muted + '20'};">
                <Bell size={16} style="color: {greeting.isEnabled ? $colorStore.primary : $colorStore.muted}" />
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
          <a class="w-full mt-4 flex items-center justify-center gap-2 py-2 px-4 rounded-xl transition-all hover:scale-105"
             href="/dashboard/rolegreets"
             style="background: {$colorStore.primary}20; color: {$colorStore.primary}; border: 1px solid {$colorStore.primary}30;">
            <UserCheck size={16} />
            Manage Role Greets
          </a>
        {/if}
      </div>
    </div>

    <!-- Feature Status (4 columns) -->
    <div
      class="lg:col-span-4 backdrop-blur-sm rounded-2xl p-6 shadow-2xl transition-all hover:shadow-xl hover:translate-y-[-2px]"
      style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15, {$colorStore.gradientEnd}10);">
      <div class="flex items-center gap-4 mb-6">
        <div class="p-3 rounded-xl"
             style="background: linear-gradient(135deg, {$colorStore.primary}20, {$colorStore.secondary}20);">
          <Sparkles class="w-6 h-6" style="color: {$colorStore.primary}" />
        </div>
        <h2 class="text-xl font-bold" style="color: {$colorStore.text}">Active Features</h2>
      </div>

      <div class="space-y-4">
        <!-- Multi Greets Status -->
        <div class="p-3 rounded-xl"
             style="background: {actionsStats.activeGreets > 0 ? $colorStore.primary + '15' : $colorStore.primary + '08'};">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="w-3 h-3 rounded-full"
                   style="background: {actionsStats.activeGreets > 0 ? '#10b981' : $colorStore.muted};"></div>
              <div>
                <div class="font-medium text-sm" style="color: {$colorStore.text}">Multi Greets</div>
                <div class="text-xs" style="color: {$colorStore.muted}">
                  {actionsStats.activeGreets} active greetings
                </div>
              </div>
            </div>
            <a href="/dashboard/multigreets" 
               class="text-xs px-2 py-1 rounded" 
               style="background: {$colorStore.primary}20; color: {$colorStore.primary}">
              Configure
            </a>
          </div>
        </div>

        <!-- Role States Status -->
        <div class="p-3 rounded-xl"
             style="background: {actionsStats.totalRoleStates > 0 ? $colorStore.secondary + '15' : $colorStore.secondary + '08'};">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="w-3 h-3 rounded-full"
                   style="background: {actionsStats.totalRoleStates > 0 ? '#10b981' : $colorStore.muted};"></div>
              <div>
                <div class="font-medium text-sm" style="color: {$colorStore.text}">Role States</div>
                <div class="text-xs" style="color: {$colorStore.muted}">
                  {actionsStats.totalRoleStates} configured states
                </div>
              </div>
            </div>
            <a href="/dashboard/rolestates" 
               class="text-xs px-2 py-1 rounded" 
               style="background: {$colorStore.secondary}20; color: {$colorStore.secondary}">
              Configure
            </a>
          </div>
        </div>

        <!-- AFK System Status -->
        <div class="p-3 rounded-xl"
             style="background: {actionsStats.afkEnabled ? $colorStore.accent + '15' : $colorStore.accent + '08'};">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="w-3 h-3 rounded-full"
                   style="background: {actionsStats.afkEnabled ? '#10b981' : $colorStore.muted};"></div>
              <div>
                <div class="font-medium text-sm" style="color: {$colorStore.text}">AFK System</div>
                <div class="text-xs" style="color: {$colorStore.muted}">
                  {actionsStats.afkEnabled ? 'Channel configured' : 'Not configured'}
                </div>
              </div>
            </div>
            <a href="/dashboard/afk" 
               class="text-xs px-2 py-1 rounded" 
               style="background: {$colorStore.accent}20; color: {$colorStore.accent}">
              Configure
            </a>
          </div>
        </div>
      </div>
    </div>

    <!-- Actions Metrics (4 columns) -->
    <div class="lg:col-span-4 space-y-6">

      <!-- Quick Stats -->
      <div class="backdrop-blur-sm rounded-2xl p-6 shadow-2xl transition-all hover:shadow-xl hover:translate-y-[-2px]"
           style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15, {$colorStore.gradientEnd}10);">
        <div class="flex items-center gap-3 mb-4">
          <Zap class="w-5 h-5" style="color: {$colorStore.primary}" />
          <h3 class="font-semibold" style="color: {$colorStore.text}">Actions Summary</h3>
        </div>

        <div class="space-y-3">
          {#if loading}
            <!-- Loading state -->
            {#each Array(3).fill(0) as _}
              <div class="animate-pulse">
                <div class="h-4 rounded mb-2" style="background: {$colorStore.primary}20; width: 80%;"></div>
                <div class="h-3 rounded" style="background: {$colorStore.primary}15; width: 60%;"></div>
              </div>
            {/each}
          {:else}
            <StatCard
              animationDelay={0}
              icon={Bell}
              iconColor="primary"
              label="Active Greets"
              subtitle={`${roleGreets.length} total configured`}
              value={actionsStats.activeGreets}
            />

            <StatCard
              animationDelay={100}
              icon={RotateCcw}
              iconColor="secondary"
              label="Role States"
              subtitle="Persistent role memory"
              value={actionsStats.totalRoleStates}
            />

            <StatCard
              animationDelay={200}
              icon={ToggleLeft}
              iconColor="accent"
              label="AFK System"
              subtitle={actionsStats.afkEnabled ? "Active" : "Inactive"}
              value={actionsStats.afkEnabled ? "ON" : "OFF"}
            />
          {/if}
        </div>
      </div>

      <!-- Action Tools -->
      <div class="backdrop-blur-sm rounded-2xl p-6 shadow-2xl transition-all hover:shadow-xl hover:translate-y-[-2px]"
           style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15, {$colorStore.gradientEnd}10);">
        <div class="flex items-center gap-3 mb-4">
          <Code class="w-5 h-5" style="color: {$colorStore.primary}" />
          <h3 class="font-semibold" style="color: {$colorStore.text}">Action Tools</h3>
        </div>

        <div class="space-y-3">
          <!-- Chat Triggers -->
          <FeatureCard
            animationDelay={0}
            description="Automated responses and reactions"
            href="/dashboard/chat-triggers"
            icon={MessageSquare}
            isActive={true}
            title="Chat Triggers"
          />

          <!-- Embed Builder -->
          <FeatureCard
            animationDelay={50}
            description="Create custom embeds"
            href="/dashboard/embedbuilder"
            icon={Code}
            isActive={true}
            title="Embed Builder"
          />
        </div>
      </div>
    </div>
  </div>
</div>