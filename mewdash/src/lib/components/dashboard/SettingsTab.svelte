<!-- lib/components/dashboard/SettingsTab.svelte -->
<script lang="ts">
  import { fly } from "svelte/transition";
  import { onMount } from "svelte";
  import { colorStore } from "$lib/stores/colorStore";
  import { currentGuild } from "$lib/stores/currentGuild";
  import {
    guildApi,
    administrationApi,
    roleStatesApi,
    roleGreetApi,
    loggingApi,
    ticketApi,
    type AutoAssignRoles,
    type SelfAssignableRole
  } from "$lib/api/index.ts";
  import { logger } from "$lib/logger";

  import FeatureCard from "$lib/components/ui/FeatureCard.svelte";

  // Props from parent


  // Settings data
    let guildConfig: any = $state({});
    let roleSettings = $state({
      autoAssignRoles: { normalRoles: [], botRoles: [] } as AutoAssignRoles,
      selfAssignableRoles: [] as SelfAssignableRole[],
    roleStates: 0,
    roleGreets: 0
    });

    let integrationSettings = $state({
    patreonEnabled: false,
    webhooksCount: 0,
    apiKeysCount: 0
    });

  let loggingConfig: any = null;
  let ticketStats = $state({
    totalPanels: 0,
    totalTickets: 0,
    openTickets: 0
  });
  let loading = $state(true);

  async function fetchSettingsData() {
    if (!$currentGuild?.id) return;

    try {
      // Fetch all settings data in parallel
      const [
        guildConfigData,
        autoAssignData,
        selfAssignData,
        roleStatesData,
        roleGreetsData,
        loggingConfigData,
        ticketPanelsData,
        ticketStatsData
      ] = await Promise.all([
        guildApi.getGuildConfig($currentGuild.id).catch(() => ({})),
        administrationApi.getAutoAssignRoles($currentGuild.id).catch(() => ({ normalRoles: [], botRoles: [] })),
        administrationApi.getSelfAssignableRoles($currentGuild.id).catch(() => []),
        roleStatesApi.getAllRoleStates($currentGuild.id).catch(() => []),
        roleGreetApi.getAllRoleGreets($currentGuild.id).catch(() => []),
        loggingApi.getLoggingConfig($currentGuild.id).catch(() => null),
        ticketApi.getTicketPanels(BigInt($currentGuild.id)).catch(() => []),
        ticketApi.getTicketStats(BigInt($currentGuild.id)).catch(() => null)
      ]);

      // Process guild config
      guildConfig = guildConfigData || {};

      // Process role settings
      roleSettings = {
        autoAssignRoles: autoAssignData || { normalRoles: [], botRoles: [] },
        selfAssignableRoles: selfAssignData || [],
        roleStates: (roleStatesData || []).length,
        roleGreets: (roleGreetsData || []).length
      };

      // Process integrations (placeholder - would need actual APIs)
      integrationSettings = {
        patreonEnabled: !!guildConfig.PatreonMessage,
        webhooksCount: 0, // Would need webhook API
        apiKeysCount: 0   // Would need API keys endpoint
      };

      // Process logging config
      loggingConfig = loggingConfigData;

      // Process ticket data
      ticketStats = {
        totalPanels: (ticketPanelsData || []).length,
        totalTickets: ticketStatsData?.totalTickets || 0,
        openTickets: ticketStatsData?.openTickets || 0
      };

    } catch (err) {
      logger.error("Failed to fetch settings data:", err);
      // Reset to safe defaults
      guildConfig = {};
      roleSettings = {
        autoAssignRoles: { normalRoles: [], botRoles: [] },
        selfAssignableRoles: [],
        roleStates: 0,
        roleGreets: 0
      };
      integrationSettings = { patreonEnabled: false, webhooksCount: 0, apiKeysCount: 0 };
      loggingConfig = null;
      ticketStats = { totalPanels: 0, totalTickets: 0, openTickets: 0 };
    } finally {
      loading = false;
    }
  }

  onMount(() => {
    fetchSettingsData();
  });

  $effect(() => {
        if ($currentGuild) {
            fetchSettingsData();
        }
    });

  // Helper functions
  function getFeatureStatus(feature: string): boolean {
    switch (feature) {
      case "multigreets":
        return (guildConfig.MultiGreetType || 0) > 0;
      case "starboard":
        return !!guildConfig.StarboardChannel;
      case "suggestions":
        return !!guildConfig.sugchan;
      case "afk":
        return !!guildConfig.AfkChannel;
      case "logging":
        return loggingConfig?.isEnabled || false;
      default:
        return false;
    }
  }

  // Calculate total configured items
    let totalAutoAssignRoles = $derived((roleSettings.autoAssignRoles.normalRoles?.length || 0) +
        (roleSettings.autoAssignRoles.botRoles?.length || 0));
    let totalRoleFeatures = $derived(roleSettings.roleStates + roleSettings.roleGreets);
    let totalSelfAssignRoles = $derived(roleSettings.selfAssignableRoles?.length || 0);
</script>

<div class="space-y-4" in:fly={{ y: 20, duration: 300 }}>
  <!-- 2-Column Layout: Settings Panels | Configuration Stats -->
  <div class="grid grid-cols-1 lg:grid-cols-12 gap-4">

    <!-- Column 1: Settings Panels (6 columns) -->
    <div class="lg:col-span-6 space-y-4">

      <!-- General Server Settings -->
      <div class=" rounded-xl p-4 transition-all hover:shadow-lg hover:-translate-y-px border"
             style="background: {$colorStore.primary}05;
                  border-color: {$colorStore.primary}15;">
        <div class="flex items-center gap-3 mb-4">
          <div class="p-2 rounded-lg"
               style="background: linear-gradient(135deg, {$colorStore.primary}20, {$colorStore.secondary}20);">
            <i class="fa-utility-duo fa-regular fa-gear text-xl"
               style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary};"></i>
          </div>
          <h2 class="text-lg font-bold" style="color: {$colorStore.text}">General Settings</h2>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          <!-- Multi Greets -->
          <FeatureCard
            animationDelay={0}
            description="Multiple greeting channels and messages"
            href="/dashboard/multigreets"
            icon="fa-bell"
            isActive={getFeatureStatus('multigreets')}
            title="Multi Greets"
          />

          <!-- Starboard -->
          <FeatureCard
            animationDelay={50}
            description="Highlight popular messages"
            href="/dashboard/starboard"
            icon="fa-palette"
            isActive={getFeatureStatus('starboard')}
            title="Starboard"
          />

          <!-- Suggestions -->
          <FeatureCard
            animationDelay={100}
            description="User suggestion voting system"
            href="/dashboard/suggestions"
            icon="fa-comment"
            isActive={getFeatureStatus('suggestions')}
            title="Suggestions"
          />

          <!-- Logging System -->
          <FeatureCard
            animationDelay={150}
            description="Event logging and audit trails"
            href="/dashboard/logging"
            icon="fa-file"
            isActive={getFeatureStatus('logging')}
            title="Logging"
          />

          <!-- AFK System -->
          <FeatureCard
            animationDelay={200}
            description="Away from keyboard status"
            href="/dashboard/afk"
            icon="fa-globe"
            isActive={getFeatureStatus('afk')}
            title="AFK System"
          />
        </div>
      </div>

      <!-- Role Management -->
      <div class=" rounded-xl p-4 transition-all hover:shadow-lg hover:-translate-y-px border"
             style="background: {$colorStore.primary}05;
                  border-color: {$colorStore.primary}15;">
        <div class="flex items-center gap-3 mb-4">
          <div class="p-2 rounded-lg"
               style="background: linear-gradient(135deg, {$colorStore.primary}20, {$colorStore.secondary}20);">
            <i class="fa-utility-duo fa-regular fa-users text-xl"
               style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary};"></i>
          </div>
          <h2 class="text-lg font-bold" style="color: {$colorStore.text}">Role Management</h2>
        </div>

        <div class="grid grid-cols-1 gap-3">
          <!-- Auto-Assign Roles -->
          <div class="p-4 rounded-xl border transition-all hover:scale-[1.02]"
               style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}20;">
            <div class="flex items-center gap-3 mb-3">
              <i class="fa-utility-duo fa-regular fa-shield text-xl"
                 style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary};"></i>
              <h3 class="font-semibold" style="color: {$colorStore.text}">Auto-Assign</h3>
            </div>
            <div class="text-2xl font-bold mb-1" style="color: {$colorStore.primary}">
              {totalAutoAssignRoles}
            </div>
            <div class="text-sm" style="color: {$colorStore.muted}">
              Roles auto-assigned to new members
            </div>
            <a class="text-xs mt-2 inline-block"
               href="/dashboard/administration" style="color: {$colorStore.primary}">
              Configure →
            </a>
          </div>

          <!-- Self-Assignable Roles -->
          <div class="p-4 rounded-xl border transition-all hover:scale-[1.02]"
               style="background: {$colorStore.secondary}08; border-color: {$colorStore.secondary}20;">
            <div class="flex items-center gap-3 mb-3">
              <i class="fa-utility-duo fa-regular fa-users text-xl"
                 style="--fa-primary-color: {$colorStore.secondary}; --fa-secondary-color: {$colorStore.accent};"></i>
              <h3 class="font-semibold" style="color: {$colorStore.text}">Self-Assign</h3>
            </div>
            <div class="text-2xl font-bold mb-1" style="color: {$colorStore.secondary}">
              {totalSelfAssignRoles}
            </div>
            <div class="text-sm" style="color: {$colorStore.muted}">
              Roles users can self-assign
            </div>
            <a class="text-xs mt-2 inline-block"
               href="/dashboard/administration" style="color: {$colorStore.secondary}">
              Configure →
            </a>
          </div>

          <!-- Role Features -->
          <div class="p-4 rounded-xl border transition-all hover:scale-[1.02]"
               style="background: {$colorStore.accent}08; border-color: {$colorStore.accent}20;">
            <div class="flex items-center gap-3 mb-3">
              <i class="fa-utility-duo fa-regular fa-star text-xl"
                 style="--fa-primary-color: {$colorStore.accent}; --fa-secondary-color: {$colorStore.primary};"></i>
              <h3 class="font-semibold" style="color: {$colorStore.text}">Role Features</h3>
            </div>
            <div class="text-2xl font-bold mb-1" style="color: {$colorStore.accent}">
              {totalRoleFeatures}
            </div>
            <div class="text-sm" style="color: {$colorStore.muted}">
              Role states + role greets configured
            </div>
            <div class="flex gap-2 mt-2">
              <a class="text-xs"
                 href="/dashboard/rolestates" style="color: {$colorStore.accent}">
                States →
              </a>
              <a class="text-xs"
                 href="/dashboard/rolegreets" style="color: {$colorStore.accent}">
                Greets →
              </a>
            </div>
          </div>
        </div>
      </div>

      <!-- Integration Settings -->
      <div class=" rounded-2xl p-6 transition-all hover:shadow-lg hover:translate-y-[-2px] border"
             style="background: {$colorStore.primary}05;
                  border-color: {$colorStore.primary}15;">
        <div class="flex items-center gap-4 mb-6">
          <div class="p-3 rounded-xl"
               style="background: linear-gradient(135deg, {$colorStore.primary}20, {$colorStore.secondary}20);">
            <i class="fa-utility-duo fa-regular fa-database text-2xl"
               style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary};"></i>
          </div>
          <h2 class="text-xl font-bold" style="color: {$colorStore.text}">Integrations</h2>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- Patreon Integration -->
          <FeatureCard
            animationDelay={0}
            description="Supporter tier management"
            href="/dashboard/patreon"
            icon="fa-database"
            isActive={integrationSettings.patreonEnabled}
            title="Patreon"
          />

          <!-- Bot Settings -->
          <FeatureCard
            animationDelay={50}
            description="Core bot settings"
            href="/dashboard/settings"
            icon="fa-gear"
            isActive={true}
            title="Bot Configuration"
          />
        </div>
      </div>
    </div>

    <!-- Column 2: Configuration Stats (6 columns) -->
    <div class="lg:col-span-6 space-y-4">

      <!-- Configuration Summary -->
      <div class="space-y-3">
        <!-- Auto-Assign Roles -->
        <div class=" rounded-lg p-3 transition-all hover:scale-[1.01] hover:shadow-md border"
               style="background: {$colorStore.primary}05;
                    border-color: {$colorStore.primary}15;">
          <div class="flex items-center gap-3">
            <div class="p-2 rounded-lg"
                 style="background: {$colorStore.primary}20;">
              <i class="fa-utility-duo fa-regular fa-shield text-xl"
                 style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary};"></i>
            </div>
            <div class="flex-1">
              <div class="flex items-baseline gap-3">
                <span class="text-lg font-bold" style="color: {$colorStore.text}">{totalAutoAssignRoles}</span>
                <span class="text-sm font-medium" style="color: {$colorStore.text}">Auto-Assign Roles</span>
              </div>
              <div class="text-xs" style="color: {$colorStore.muted}">Roles given to new members</div>
            </div>
            <a class="px-2 py-1 rounded-sm text-xs transition-all hover:scale-[1.02]"
                 href="/dashboard/administration"
               style="background: {$colorStore.primary}20; color: {$colorStore.primary};">
              Configure
            </a>
          </div>
        </div>

        <!-- Self-Assign Roles -->
        <div class=" rounded-lg p-3 transition-all hover:scale-[1.01] hover:shadow-md border"
               style="background: {$colorStore.primary}05;
                    border-color: {$colorStore.primary}15;">
          <div class="flex items-center gap-3">
            <div class="p-2 rounded-lg"
                 style="background: {$colorStore.secondary}20;">
              <i class="fa-utility-duo fa-regular fa-users text-xl"
                 style="--fa-primary-color: {$colorStore.secondary}; --fa-secondary-color: {$colorStore.accent};"></i>
            </div>
            <div class="flex-1">
              <div class="flex items-baseline gap-3">
                <span class="text-lg font-bold" style="color: {$colorStore.text}">{totalSelfAssignRoles}</span>
                <span class="text-sm font-medium" style="color: {$colorStore.text}">Self-Assign Roles</span>
              </div>
              <div class="text-xs" style="color: {$colorStore.muted}">Roles users can assign themselves</div>
            </div>
            <a class="px-2 py-1 rounded-sm text-xs transition-all hover:scale-[1.02]"
                 href="/dashboard/administration"
               style="background: {$colorStore.secondary}20; color: {$colorStore.secondary};">
              Configure
            </a>
          </div>
        </div>

        <!-- Role Features -->
        <div class=" rounded-lg p-3 transition-all hover:scale-[1.01] hover:shadow-md border"
               style="background: {$colorStore.primary}05;
                    border-color: {$colorStore.primary}15;">
          <div class="flex items-center gap-3">
            <div class="p-2 rounded-lg"
                 style="background: {$colorStore.accent}20;">
              <i class="fa-utility-duo fa-regular fa-star text-xl"
                 style="--fa-primary-color: {$colorStore.accent}; --fa-secondary-color: {$colorStore.primary};"></i>
            </div>
            <div class="flex-1">
              <div class="flex items-baseline gap-3">
                <span class="text-lg font-bold" style="color: {$colorStore.text}">{totalRoleFeatures}</span>
                <span class="text-sm font-medium" style="color: {$colorStore.text}">Role Features</span>
              </div>
              <div class="text-xs" style="color: {$colorStore.muted}">{roleSettings.roleStates} states, {roleSettings.roleGreets} greets</div>
            </div>
          </div>
        </div>

        <!-- Integrations -->
        <div class=" rounded-lg p-3 transition-all hover:scale-[1.01] hover:shadow-md border"
               style="background: {$colorStore.primary}05;
                    border-color: {$colorStore.primary}15;">
          <div class="flex items-center gap-3">
            <div class="p-2 rounded-lg"
                 style="background: {$colorStore.primary}20;">
              <i class="fa-utility-duo fa-regular fa-database text-xl"
                 style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary};"></i>
            </div>
            <div class="flex-1">
              <div class="flex items-baseline gap-3">
                <span class="text-lg font-bold" style="color: {$colorStore.text}">{integrationSettings.patreonEnabled ? 1 : 0}</span>
                <span class="text-sm font-medium" style="color: {$colorStore.text}">Integrations</span>
              </div>
              <div class="text-xs" style="color: {$colorStore.muted}">{integrationSettings.patreonEnabled ? "Patreon active" : "None active"}</div>
            </div>
            <a class="px-2 py-1 rounded-sm text-xs transition-all hover:scale-[1.02]"
                 href="/dashboard/patreon"
               style="background: {$colorStore.primary}20; color: {$colorStore.primary};">
              Manage
            </a>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class=" rounded-2xl p-6 transition-all hover:shadow-lg hover:translate-y-[-2px] border"
             style="background: {$colorStore.primary}05;
                  border-color: {$colorStore.primary}15;">
        <div class="flex items-center gap-3 mb-4">
          <i class="fa-utility-duo fa-regular fa-gear text-xl"
             style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary};"></i>
          <h3 class="font-semibold" style="color: {$colorStore.text}">Quick Actions</h3>
        </div>

        <div class="space-y-3">
          <a class="block w-full text-center py-2 px-4 rounded-xl transition-all hover:scale-[1.02]"
             href="/dashboard/settings"
             style="background: {$colorStore.primary}20; color: {$colorStore.primary}; border: 1px solid {$colorStore.primary}30;">
            General Settings
          </a>

          <a class="block w-full text-center py-2 px-4 rounded-xl transition-all hover:scale-[1.02]"
             href="/dashboard/administration"
             style="background: {$colorStore.secondary}20; color: {$colorStore.secondary}; border: 1px solid {$colorStore.secondary}30;">
            Role Management
          </a>

          <a class="block w-full text-center py-2 px-4 rounded-xl transition-all hover:scale-[1.02]"
             href="/dashboard/administration"
             style="background: {$colorStore.accent}20; color: {$colorStore.accent}; border: 1px solid {$colorStore.accent}30;">
            Permissions
          </a>
        </div>
      </div>

      <!-- Server Info -->
      {#if guildConfig && Object.keys(guildConfig).length > 0}
        <div class=" rounded-2xl p-6 border"
               style="background: {$colorStore.primary}05;
                    border-color: {$colorStore.primary}15;">
          <h3 class="font-semibold mb-4" style="color: {$colorStore.text}">Server Info</h3>

          <div class="space-y-2 text-sm">
            {#if guildConfig.prefix}
              <div class="flex justify-between">
                <span style="color: {$colorStore.muted}">Prefix:</span>
                <span style="color: {$colorStore.text}" class="font-mono">{guildConfig.prefix}</span>
              </div>
            {/if}

            {#if guildConfig.locale}
              <div class="flex justify-between">
                <span style="color: {$colorStore.muted}">Language:</span>
                <span style="color: {$colorStore.text}">{guildConfig.locale}</span>
              </div>
            {/if}

            {#if guildConfig.timeZone}
              <div class="flex justify-between">
                <span style="color: {$colorStore.muted}">Timezone:</span>
                <span style="color: {$colorStore.text}">{guildConfig.timeZone}</span>
              </div>
            {/if}
          </div>
        </div>
      {/if}
    </div>
  </div>
</div>