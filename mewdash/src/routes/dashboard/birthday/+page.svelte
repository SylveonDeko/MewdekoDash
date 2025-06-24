<!-- routes/dashboard/birthday/+page.svelte -->
<script lang="ts">
  import { onMount } from "svelte";
  import { fly } from "svelte/transition";
  import { colorStore } from "$lib/stores/colorStore";
  import { currentGuild } from "$lib/stores/currentGuild";
  import { api } from "$lib/api";
  import { logger } from "$lib/logger";
  import {
    AlertCircle,
    AtSign,
    BarChart3,
    Bell,
    Cake,
    Calendar,
    CheckCircle,
    Clock,
    Crown,
    Gift,
    Hash,
    MapPin,
    MessageSquare,
    RefreshCw,
    Save,
    Settings,
    Users,
    XCircle
  } from "lucide-svelte";

  import StatCard from "$lib/components/StatCard.svelte";
  import DiscordSelector from "$lib/components/DiscordSelector.svelte";
  import type { BirthdayConfig, BirthdayFeatures, BirthdayStats, BirthdayUser } from "$lib/types/birthday";
  import {
    BirthdayFeatures as BirthdayFeaturesEnum,
    getBirthdayFeatureNames,
    hasBirthdayFeature,
    SUPPORTED_TIMEZONES as TIMEZONES
  } from "$lib/types/birthday";


  // Component state
  let loading = false;
  let saving = false;
  let message = "";
  let messageType: "success" | "error" | "info" = "info";

  // Data state
  let birthdayConfig: BirthdayConfig | null = null;
  let birthdayUsers: BirthdayUser[] = [];
  let birthdayStats: BirthdayStats | null = null;
  let birthdayFeatures: BirthdayFeatures = BirthdayFeaturesEnum.None;
  let guildChannels: Array<{ id: string; name: string; }> = [];
  let guildRoles: Array<{ id: string; name: string; color: number }> = [];

  // Form data
  let configForm: BirthdayConfig = {
    guildId: $currentGuild?.id || BigInt(0),
    channelId: null,
    roleId: null,
    message: null,
    pingRoleId: null,
    reminderDays: 1,
    timezone: "UTC",
    features: BirthdayFeaturesEnum.None
  };

  // UI state
  let activeTab = "config";
  let upcomingDays = 7;
  let upcomingBirthdays: BirthdayUser[] = [];
  let todaysBirthdays: BirthdayUser[] = [];

  // Initialize data
  $: if (birthdayConfig) {
    configForm = { ...birthdayConfig };
  }

  $: {
    if (birthdayFeatures) {
      configForm.features = birthdayFeatures;
    }
  }

  // Load all birthday data
  async function loadAllBirthdayData() {
    if (!$currentGuild?.id) return;

    loading = true;
    try {
      const [
        config,
        users,
        stats,
        features,
        channels,
        roles,
        upcoming,
        today
      ] = await Promise.all([
        api.getBirthdayConfig($currentGuild.id).catch(() => null),
        api.getBirthdayUsers($currentGuild.id).catch(() => []),
        api.getBirthdayStats($currentGuild.id).catch(() => null),
        api.getBirthdayFeatures($currentGuild.id).catch(() => ({ features: BirthdayFeaturesEnum.None })),
        api.getGuildTextChannels($currentGuild.id).catch(() => []),
        api.getGuildRoles($currentGuild.id).catch(() => []),
        api.getBirthdayUpcoming($currentGuild.id, upcomingDays).catch(() => []),
        api.getBirthdayToday($currentGuild.id).catch(() => [])
      ]);

      birthdayConfig = config;
      birthdayUsers = users;
      birthdayStats = stats;
      // Ensure features is a regular number, not a BigInt object
      const rawFeatures = features?.features || BirthdayFeaturesEnum.None;
      if (typeof rawFeatures === "object" && rawFeatures !== null) {
        // Handle json-bigint objects - try different conversion methods
        if (typeof rawFeatures.toString === "function") {
          birthdayFeatures = Number(rawFeatures.toString());
        } else if (typeof rawFeatures.valueOf === "function") {
          birthdayFeatures = Number(rawFeatures.valueOf());
        } else {
          // Fallback: convert to JSON and back
          birthdayFeatures = Number(JSON.parse(JSON.stringify(rawFeatures)));
        }
      } else {
        birthdayFeatures = Number(rawFeatures);
      }

      // Process channels to only include text channels
      guildChannels = (channels || []).map((channel: any) => ({
        id: channel.id.toString(),
        name: channel.name
      }));

      // Process roles to filter out system roles
      guildRoles = (roles || [])
        .filter((role: any) =>
          role.id !== $currentGuild?.id?.toString() &&
          !role.managed &&
          !role.name.startsWith("@")
        )
        .map((role: any) => ({
          id: role.id.toString(),
          name: role.name,
          color: role.color || 0
        }))
        .sort((a, b) => a.name.localeCompare(b.name));

      upcomingBirthdays = upcoming;
      todaysBirthdays = today;
    } catch (err) {
      logger.error("Failed to load birthday data:", err);
      showMessage("Failed to load birthday data", "error");
    } finally {
      loading = false;
    }
  }

  // Load dynamic data only
  async function loadBirthdayData() {
    if (!$currentGuild?.id) return;

    try {
      const [upcoming, today] = await Promise.all([
        api.getBirthdayUpcoming($currentGuild.id, upcomingDays),
        api.getBirthdayToday($currentGuild.id)
      ]);

      upcomingBirthdays = upcoming;
      todaysBirthdays = today;
    } catch (err) {
      logger.error("Failed to load birthday data:", err);
      showMessage("Failed to load birthday data", "error");
    }
  }

  // Save configuration
  async function saveConfig() {
    if (!$currentGuild?.id) return;

    saving = true;
    try {
      const updateData = {
        channelId: configForm.channelId,
        roleId: configForm.roleId,
        message: configForm.message,
        pingRoleId: configForm.pingRoleId,
        reminderDays: configForm.reminderDays,
        timezone: configForm.timezone,
        features: configForm.features
      };

      await api.updateBirthdayConfig($currentGuild.id, updateData);
      showMessage("Birthday configuration saved successfully!", "success");
    } catch (err) {
      logger.error("Failed to save birthday config:", err);
      showMessage("Failed to save configuration", "error");
    } finally {
      saving = false;
    }
  }

  // Reset configuration
  async function resetConfig() {
    if (!$currentGuild?.id) return;
    if (!confirm("Are you sure you want to reset the birthday configuration to defaults?")) return;

    saving = true;
    try {
      const resetConfig = await api.resetBirthdayConfig($currentGuild.id);
      configForm = { ...resetConfig };
      showMessage("Birthday configuration reset to defaults", "success");
    } catch (err) {
      logger.error("Failed to reset birthday config:", err);
      showMessage("Failed to reset configuration", "error");
    } finally {
      saving = false;
    }
  }

  // Toggle feature
  async function toggleFeature(feature: BirthdayFeatures) {
    if (!$currentGuild?.id) return;

    try {
      const hasFeature = hasBirthdayFeature(configForm.features, feature);
      if (hasFeature) {
        await api.disableBirthdayFeature($currentGuild.id, feature);
        configForm.features &= ~feature;
      } else {
        await api.enableBirthdayFeature($currentGuild.id, feature);
        configForm.features |= feature;
      }

      // Update the config form to reflect the change
      configForm = { ...configForm };
    } catch (err) {
      logger.error("Failed to toggle birthday feature:", err);
      showMessage("Failed to update feature", "error");
    }
  }

  // Utility functions
  function showMessage(text: string, type: "success" | "error" | "info") {
    message = text;
    messageType = type;
    setTimeout(() => {
      message = "";
    }, 5000);
  }

  function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString();
  }

  function getChannelName(channelId: bigint | null | undefined): string {
    if (!channelId) return "Not set";
    const channel = guildChannels.find(c => c.id === channelId.toString());
    return channel ? `#${channel.name}` : "Unknown channel";
  }

  function getRoleName(roleId: bigint | null | undefined): string {
    if (!roleId) return "Not set";
    const role = guildRoles.find(r => r.id === roleId.toString());
    return role ? `@${role.name}` : "Unknown role";
  }

  onMount(() => {
    loadAllBirthdayData();
  });

  // Tabs configuration
  const tabs = [
    { id: "config", label: "Configuration", icon: Settings },
    { id: "users", label: "Users", icon: Users },
    { id: "stats", label: "Statistics", icon: BarChart3 }
  ];
</script>

<svelte:head>
  <title>Birthday Management - {$currentGuild?.name || "Dashboard"}</title>
</svelte:head>

<div class="container mx-auto px-4 py-6" in:fly={{ y: 20, duration: 300 }}>
  <!-- Page Header -->
  <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 sm:mb-8">
    <div class="flex items-center gap-4">
      <div class="p-3 rounded-xl"
           style="background: linear-gradient(135deg, {$colorStore.primary}20, {$colorStore.secondary}20);">
        <Cake class="w-6 h-6 sm:w-8 sm:h-8" style="color: {$colorStore.primary}" />
      </div>
      <div>
        <h1 class="text-2xl sm:text-3xl font-bold" style="color: {$colorStore.text}">Birthday Management</h1>
        <p class="text-base sm:text-lg" style="color: {$colorStore.muted}">
          Configure birthday announcements and celebrations
        </p>
      </div>
    </div>

    <div class="flex items-center gap-3 w-full sm:w-auto">
      <button
        class="flex items-center justify-center gap-2 px-4 py-2 rounded-xl transition-all hover:scale-105 min-h-[44px] w-full sm:w-auto"
        disabled={loading}
        on:click={loadAllBirthdayData}
        style="background: {$colorStore.primary}20; color: {$colorStore.primary}; border: 1px solid {$colorStore.primary}30;"
      >
        <RefreshCw class="w-4 h-4 {loading ? 'animate-spin' : ''}" />
        <span class="sm:inline">Refresh</span>
      </button>
    </div>
  </div>

  <!-- Status Message -->
  {#if message}
    <div class="mb-6 p-4 rounded-xl flex items-center gap-3 transition-all"
         style="background: {messageType === 'success' ? '#10b98120' : messageType === 'error' ? '#ef444420' : $colorStore.primary + '20'};
                border: 1px solid {messageType === 'success' ? '#10b981' : messageType === 'error' ? '#ef4444' : $colorStore.primary}30;"
         in:fly={{ x: 20, duration: 300 }}>
      {#if messageType === 'success'}
        <CheckCircle class="w-5 h-5" style="color: #10b981" />
      {:else if messageType === 'error'}
        <XCircle class="w-5 h-5" style="color: #ef4444" />
      {:else}
        <AlertCircle class="w-5 h-5" style="color: {$colorStore.primary}" />
      {/if}
      <span
        style="color: {messageType === 'success' ? '#10b981' : messageType === 'error' ? '#ef4444' : $colorStore.primary}">{message}</span>
    </div>
  {/if}

  <!-- Today's Birthdays Alert -->
  {#if todaysBirthdays.length > 0}
    <div class="mb-6 p-4 rounded-xl flex items-center gap-3"
         style="background: linear-gradient(135deg, {$colorStore.accent}20, {$colorStore.primary}20); border: 1px solid {$colorStore.accent}30;"
         in:fly={{ x: -20, duration: 300 }}>
      <Gift class="w-5 h-5" style="color: {$colorStore.accent}" />
      <span style="color: {$colorStore.text}">
        🎉 {todaysBirthdays.length} birthday{todaysBirthdays.length !== 1 ? 's' : ''} today!
      </span>
    </div>
  {/if}

  <!-- Main Content -->
  <!-- Tab Navigation -->
  <div class="mb-6 sm:mb-8">
    <!-- Mobile Tab Dropdown -->
    <div class="block sm:hidden mb-4">
      <select
        bind:value={activeTab}
        class="w-full p-3 rounded-xl border transition-all min-h-[44px] text-base"
        style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
      >
        {#each tabs as tab}
          <option value={tab.id}>{tab.label}</option>
        {/each}
      </select>
    </div>

    <!-- Desktop Tab Navigation -->
    <div class="hidden sm:block">
      <div class="flex items-center space-x-1 p-1 rounded-xl"
           style="background: {$colorStore.primary}10;">
        {#each tabs as tab}
          <button
            class="flex items-center gap-2 px-4 py-2 rounded-lg transition-all font-medium min-h-[44px]"
            class:active={activeTab === tab.id}
            style="color: {activeTab === tab.id ? $colorStore.primary : $colorStore.muted};
                   background: {activeTab === tab.id ? $colorStore.primary + '20' : 'transparent'};"
            on:click={() => activeTab = tab.id}
          >
            <svelte:component this={tab.icon} size={18} />
            <span class="hidden md:inline">{tab.label}</span>
          </button>
        {/each}
      </div>
    </div>
  </div>

  <!-- Tab Content -->
  {#if activeTab === 'config'}
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8" in:fly={{ x: 20, duration: 300 }}>
      <!-- Configuration Form -->
      <div class="space-y-4 sm:space-y-6">
        <!-- Basic Settings -->
        <div class="relative z-10 rounded-2xl p-6 shadow-2xl"
             style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15, {$colorStore.gradientEnd}10);">
          <div class="flex items-center gap-3 mb-6">
            <Settings class="w-5 h-5" style="color: {$colorStore.primary}" />
            <h2 class="text-xl font-bold" style="color: {$colorStore.text}">Basic Settings</h2>
          </div>

          <div class="space-y-4">
            <!-- Channel Selection -->
            <div>
              <label class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">
                <Hash class="w-4 h-4 inline mr-1" />
                Birthday Channel
              </label>
              <div class="min-h-[44px]">
                <DiscordSelector
                  type="channel"
                  options={guildChannels}
                  selected={configForm.channelId?.toString() || null}
                  placeholder="No channel selected"
                  on:change={(e) => {
                    configForm.channelId = e.detail.selected ? BigInt(e.detail.selected) : null;
                    configForm = { ...configForm };
                  }}
                />
              </div>
            </div>

            <!-- Birthday Role -->
            <div>
              <label class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">
                <Crown class="w-4 h-4 inline mr-1" />
                Birthday Role (24-hour temporary)
              </label>
              <div class="min-h-[44px]">
                <DiscordSelector
                  type="role"
                  options={guildRoles}
                  selected={configForm.roleId?.toString() || null}
                  placeholder="No role selected"
                  on:change={(e) => {
                    configForm.roleId = e.detail.selected ? BigInt(e.detail.selected) : null;
                    configForm = { ...configForm };
                  }}
                />
              </div>
            </div>

            <!-- Ping Role -->
            <div>
              <label class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">
                <Bell class="w-4 h-4 inline mr-1" />
                Ping Role (notifies when announcing)
              </label>
              <div class="min-h-[44px]">
                <DiscordSelector
                  type="role"
                  options={guildRoles}
                  selected={configForm.pingRoleId?.toString() || null}
                  placeholder="No ping role"
                  on:change={(e) => {
                    configForm.pingRoleId = e.detail.selected ? BigInt(e.detail.selected) : null;
                    configForm = { ...configForm };
                  }}
                />
              </div>
            </div>

            <!-- Timezone -->
            <div>
              <label class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">
                <MapPin class="w-4 h-4 inline mr-1" />
                Server Timezone
              </label>
              <div class="min-h-[44px]">
                <DiscordSelector
                  type="timezone"
                  options={TIMEZONES.map(tz => ({
                    id: tz.value,
                    name: tz.label,
                    label: tz.label,
                    offset: tz.offset,
                    value: tz.value
                  }))}
                  selected={configForm.timezone}
                  placeholder="Select timezone"
                  on:change={(e) => {
                    configForm.timezone = e.detail.selected || "UTC";
                    configForm = { ...configForm };
                  }}
                />
              </div>
            </div>

            <!-- Reminder Days -->
            <div>
              <label class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">
                <Clock class="w-4 h-4 inline mr-1" />
                Reminder Days Before Birthday
              </label>
              <input
                type="number"
                min="0"
                max="30"
                bind:value={configForm.reminderDays}
                class="w-full p-3 rounded-xl border transition-all min-h-[44px] text-base"
                style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
              />
            </div>
          </div>
        </div>

        <!-- Custom Message -->
        <div class="backdrop-blur-sm rounded-2xl p-6 shadow-2xl z-0"
             style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15, {$colorStore.gradientEnd}10);">
          <div class="flex items-center gap-3 mb-6">
            <MessageSquare class="w-5 h-5" style="color: {$colorStore.primary}" />
            <h2 class="text-xl font-bold" style="color: {$colorStore.text}">Birthday Message</h2>
          </div>

          <div>
            <label class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">
              Custom Birthday Announcement
            </label>
            <textarea
              bind:value={configForm.message}
              placeholder="🎉 Happy Birthday %user.mention%! 🎂 Hope you have a wonderful day!"
              rows="3"
              class="w-full p-3 rounded-xl border transition-all resize-none min-h-[100px] text-base"
              style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
            ></textarea>
            <p class="text-xs mt-2" style="color: {$colorStore.muted}">
              Available placeholders: %user.mention%, %user.name%, %user.displayname%, %birthday.age%, %server.name%,
              %server.time%. Leave empty for default message.
            </p>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex items-center gap-4">
          <button
            class="flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all hover:scale-105"
            style="background: {$colorStore.primary}; color: white;"
            on:click={saveConfig}
            disabled={saving}
          >
            <Save class="w-4 h-4" />
            {saving ? "Saving..." : "Save Configuration"}
          </button>

          <button
            class="flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all hover:scale-105"
            style="background: {$colorStore.muted}20; color: {$colorStore.muted};"
            on:click={resetConfig}
            disabled={saving}
          >
            <RefreshCw class="w-4 h-4" />
            Reset to Default
          </button>
        </div>
      </div>

      <!-- Feature Toggles & Preview -->
      <div class="space-y-6">
        <!-- Feature Controls -->
        <div class="backdrop-blur-sm rounded-2xl p-6 shadow-2xl"
             style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15, {$colorStore.gradientEnd}10);">
          <div class="flex items-center gap-3 mb-6">
            <Gift class="w-5 h-5" style="color: {$colorStore.primary}" />
            <h2 class="text-xl font-bold" style="color: {$colorStore.text}">Birthday Features</h2>
          </div>

          <div class="space-y-4">
            <!-- Feature Toggles -->
            <div class="space-y-3">
              <div class="flex items-center justify-between p-3 rounded-xl"
                   style="background: {$colorStore.primary}08;">
                <div class="flex items-center gap-3">
                  <MessageSquare class="w-5 h-5" style="color: {$colorStore.primary}" />
                  <div>
                    <div class="font-medium" style="color: {$colorStore.text}">Announcements</div>
                    <div class="text-sm" style="color: {$colorStore.muted}">Send birthday messages in channel</div>
                  </div>
                </div>
                <label class="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    class="sr-only peer"
                    checked={hasBirthdayFeature(configForm.features, BirthdayFeaturesEnum.Announcements)}
                    on:change={() => toggleFeature(BirthdayFeaturesEnum.Announcements)}
                  />
                  <div
                    class="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"
                    style="peer-checked:bg-color: {$colorStore.primary}"></div>
                </label>
              </div>

              <div class="flex items-center justify-between p-3 rounded-xl"
                   style="background: {$colorStore.primary}08;">
                <div class="flex items-center gap-3">
                  <Crown class="w-5 h-5" style="color: {$colorStore.primary}" />
                  <div>
                    <div class="font-medium" style="color: {$colorStore.text}">Birthday Role</div>
                    <div class="text-sm" style="color: {$colorStore.muted}">Assign temporary role for 24 hours</div>
                  </div>
                </div>
                <label class="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    class="sr-only peer"
                    checked={hasBirthdayFeature(configForm.features, BirthdayFeaturesEnum.BirthdayRole)}
                    on:change={() => toggleFeature(BirthdayFeaturesEnum.BirthdayRole)}
                    disabled={!configForm.roleId}
                  />
                  <div
                    class="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-disabled:opacity-50"
                    style="peer-checked:bg-color: {$colorStore.primary}"></div>
                </label>
              </div>

              <div class="flex items-center justify-between p-3 rounded-xl"
                   style="background: {$colorStore.primary}08;">
                <div class="flex items-center gap-3">
                  <Bell class="w-5 h-5" style="color: {$colorStore.primary}" />
                  <div>
                    <div class="font-medium" style="color: {$colorStore.text}">Reminders</div>
                    <div class="text-sm" style="color: {$colorStore.muted}">Send birthday reminders to users</div>
                  </div>
                </div>
                <label class="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    class="sr-only peer"
                    checked={hasBirthdayFeature(configForm.features, BirthdayFeaturesEnum.Reminders)}
                    on:change={() => toggleFeature(BirthdayFeaturesEnum.Reminders)}
                  />
                  <div
                    class="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"
                    style="peer-checked:bg-color: {$colorStore.primary}"></div>
                </label>
              </div>

              <div class="flex items-center justify-between p-3 rounded-xl"
                   style="background: {$colorStore.primary}08;">
                <div class="flex items-center gap-3">
                  <AtSign class="w-5 h-5" style="color: {$colorStore.primary}" />
                  <div>
                    <div class="font-medium" style="color: {$colorStore.text}">Ping Role</div>
                    <div class="text-sm" style="color: {$colorStore.muted}">Ping specified role with announcements</div>
                  </div>
                </div>
                <label class="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    class="sr-only peer"
                    checked={hasBirthdayFeature(configForm.features, BirthdayFeaturesEnum.PingRole)}
                    on:change={() => toggleFeature(BirthdayFeaturesEnum.PingRole)}
                    disabled={!configForm.pingRoleId}
                  />
                  <div
                    class="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-disabled:opacity-50"
                    style="peer-checked:bg-color: {$colorStore.primary}"></div>
                </label>
              </div>

              <div class="flex items-center justify-between p-3 rounded-xl"
                   style="background: {$colorStore.primary}08;">
                <div class="flex items-center gap-3">
                  <MapPin class="w-5 h-5" style="color: {$colorStore.primary}" />
                  <div>
                    <div class="font-medium" style="color: {$colorStore.text}">Timezone Support</div>
                    <div class="text-sm" style="color: {$colorStore.muted}">Respect user-specific timezones</div>
                  </div>
                </div>
                <label class="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    class="sr-only peer"
                    checked={hasBirthdayFeature(configForm.features, BirthdayFeaturesEnum.TimezoneSupport)}
                    on:change={() => toggleFeature(BirthdayFeaturesEnum.TimezoneSupport)}
                  />
                  <div
                    class="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"
                    style="peer-checked:bg-color: {$colorStore.primary}"></div>
                </label>
              </div>
            </div>
          </div>
        </div>

        <!-- Configuration Preview -->
        <div class="backdrop-blur-sm rounded-2xl p-6 shadow-2xl"
             style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15, {$colorStore.gradientEnd}10);">
          <div class="flex items-center gap-3 mb-6">
            <AlertCircle class="w-5 h-5" style="color: {$colorStore.primary}" />
            <h2 class="text-xl font-bold" style="color: {$colorStore.text}">Current Configuration</h2>
          </div>

          <div class="space-y-3">
            <div class="flex justify-between items-center">
              <span style="color: {$colorStore.muted}">Channel:</span>
              <span style="color: {$colorStore.text}">{getChannelName(configForm.channelId)}</span>
            </div>
            <div class="flex justify-between items-center">
              <span style="color: {$colorStore.muted}">Birthday Role:</span>
              <span style="color: {$colorStore.text}">{getRoleName(configForm.roleId)}</span>
            </div>
            <div class="flex justify-between items-center">
              <span style="color: {$colorStore.muted}">Ping Role:</span>
              <span style="color: {$colorStore.text}">{getRoleName(configForm.pingRoleId)}</span>
            </div>
            <div class="flex justify-between items-center">
              <span style="color: {$colorStore.muted}">Timezone:</span>
              <span style="color: {$colorStore.text}">{configForm.timezone}</span>
            </div>
            <div class="flex justify-between items-center">
              <span style="color: {$colorStore.muted}">Active Features:</span>
              <span style="color: {$colorStore.text}">
                {getBirthdayFeatureNames(configForm.features).join(", ") || "None"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

  {:else if activeTab === 'users'}
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8" in:fly={{ x: 20, duration: 300 }}>
      <!-- Upcoming Birthdays -->
      <div class="backdrop-blur-sm rounded-2xl p-6 shadow-2xl"
           style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15, {$colorStore.gradientEnd}10);">
        <div class="flex items-center justify-between mb-6">
          <div class="flex items-center gap-3">
            <Calendar class="w-5 h-5" style="color: {$colorStore.primary}" />
            <h2 class="text-xl font-bold" style="color: {$colorStore.text}">Upcoming Birthdays</h2>
          </div>
          <div class="flex items-center gap-2">
            <select
              bind:value={upcomingDays}
              on:change={loadBirthdayData}
              class="px-3 py-1 rounded-lg border text-sm"
              style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
            >
              <option value={7}>Next 7 days</option>
              <option value={14}>Next 14 days</option>
              <option value={30}>Next 30 days</option>
            </select>
          </div>
        </div>

        <div class="space-y-3 max-h-96 overflow-y-auto">
          {#if loading}
            <!-- Loading state -->
            {#each Array(5).fill(0) as _}
              <div class="flex items-center gap-4 p-3 rounded-xl animate-pulse"
                   style="background: {$colorStore.primary}08;">
                <div class="w-12 h-12 rounded-full" style="background: {$colorStore.primary}20;"></div>
                <div class="flex-1 space-y-2">
                  <div class="h-4 rounded" style="background: {$colorStore.primary}20; width: 70%;"></div>
                  <div class="h-3 rounded" style="background: {$colorStore.primary}15; width: 50%;"></div>
                </div>
                <div class="w-16 h-6 rounded" style="background: {$colorStore.primary}20;"></div>
              </div>
            {/each}
          {:else if upcomingBirthdays.length === 0}
            <!-- Empty state -->
            <div class="text-center py-8">
              <Calendar class="w-12 h-12 mx-auto mb-4" style="color: {$colorStore.primary}50" />
              <h3 class="text-lg font-semibold mb-2" style="color: {$colorStore.text}">No Upcoming Birthdays</h3>
              <p class="text-sm" style="color: {$colorStore.muted}">
                No birthdays in the next {upcomingDays} days.
              </p>
            </div>
          {:else}
            {#each upcomingBirthdays as user}
              <div class="flex items-center gap-4 p-3 rounded-xl transition-all hover:scale-[1.02]"
                   style="background: {$colorStore.primary}08;">
                <img src={user.avatarUrl || `https://cdn.discordapp.com/embed/avatars/0.png`}
                     alt="" class="w-12 h-12 rounded-full" />
                <div class="flex-1">
                  <div class="font-semibold" style="color: {$colorStore.text}">
                    {user.displayName || user.username}
                  </div>
                  <div class="text-sm" style="color: {$colorStore.muted}">
                    {formatDate(user.birthday)} • {user.timezone}
                  </div>
                </div>
                <div class="text-right">
                  <div class="text-sm font-medium" style="color: {$colorStore.primary}">
                    {user.daysUntilBirthday === 0 ? 'Today!' :
                      user.daysUntilBirthday === 1 ? 'Tomorrow' :
                        `${user.daysUntilBirthday} days`}
                  </div>
                  <div class="text-xs" style="color: {$colorStore.muted}">
                    {user.announcementsEnabled ? 'Public' : 'Private'}
                  </div>
                </div>
              </div>
            {/each}
          {/if}
        </div>
      </div>

      <!-- All Users with Birthdays -->
      <div class="backdrop-blur-sm rounded-2xl p-6 shadow-2xl"
           style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15, {$colorStore.gradientEnd}10);">
        <div class="flex items-center gap-3 mb-6">
          <Users class="w-5 h-5" style="color: {$colorStore.primary}" />
          <h2 class="text-xl font-bold" style="color: {$colorStore.text}">All Users ({birthdayUsers.length})</h2>
        </div>

        <div class="space-y-3 max-h-96 overflow-y-auto">
          {#if birthdayUsers.length === 0}
            <div class="text-center py-8">
              <Users class="w-12 h-12 mx-auto mb-4" style="color: {$colorStore.primary}50" />
              <h3 class="text-lg font-semibold mb-2" style="color: {$colorStore.text}">No Birthdays Set</h3>
              <p class="text-sm" style="color: {$colorStore.muted}">
                No users have configured their birthdays yet.
              </p>
            </div>
          {:else}
            {#each birthdayUsers as user}
              <div class="flex items-center gap-4 p-3 rounded-xl transition-all hover:scale-[1.02]"
                   style="background: {$colorStore.primary}08;">
                <img src={user.avatarUrl || `https://cdn.discordapp.com/embed/avatars/0.png`}
                     alt="" class="w-10 h-10 rounded-full" />
                <div class="flex-1">
                  <div class="font-medium" style="color: {$colorStore.text}">
                    {user.displayName || user.username}
                  </div>
                  <div class="text-sm" style="color: {$colorStore.muted}">
                    {formatDate(user.birthday)} • {user.timezone}
                  </div>
                </div>
                <div class="text-xs px-2 py-1 rounded-lg"
                     style="background: {user.announcementsEnabled ? $colorStore.primary + '20' : $colorStore.muted + '20'};
                            color: {user.announcementsEnabled ? $colorStore.primary : $colorStore.muted};">
                  {user.announcementsEnabled ? 'Public' : 'Private'}
                </div>
              </div>
            {/each}
          {/if}
        </div>
      </div>
    </div>

  {:else if activeTab === 'stats'}
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" in:fly={{ x: 20, duration: 300 }}>
      {#if birthdayStats}
        <StatCard
          icon={Users}
          label="Total Users"
          value={birthdayStats.totalUsers}
          subtitle="server members"
          iconColor="primary"
          animationDelay={0}
        />

        <StatCard
          icon={Cake}
          label="Birthdays Set"
          value={birthdayStats.usersWithBirthdays}
          subtitle={`${(birthdayStats.percentageWithBirthdays || 0).toFixed(1)}% of members`}
          iconColor="secondary"
          animationDelay={100}
        />

        <StatCard
          icon={Gift}
          label="Public Birthdays"
          value={!birthdayStats.usersWithAnnouncements ? 0 : birthdayStats.usersWithAnnouncements}
          subtitle="announcements enabled"
          iconColor="accent"
          animationDelay={200}
        />

        <StatCard
          icon={Calendar}
          label="Today's Birthdays"
          value={birthdayStats.todaysBirthdayCount}
          subtitle="celebrating today"
          iconColor="primary"
          animationDelay={300}
        />
      {:else}
        <div class="col-span-full text-center py-12">
          <BarChart3 class="w-16 h-16 mx-auto mb-4" style="color: {$colorStore.primary}50" />
          <h3 class="text-xl font-semibold mb-2" style="color: {$colorStore.text}">No Statistics Available</h3>
          <p style="color: {$colorStore.muted}">
            Birthday statistics will appear here once the system is configured.
          </p>
        </div>
      {/if}
    </div>
  {/if}
</div>

<style>
    .peer:checked ~ div {
        background-color: var(--primary-color);
    }
</style>