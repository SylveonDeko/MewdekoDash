<!-- routes/dashboard/birthday/+page.svelte -->
<script lang="ts">
  import { m } from "$lib/i18n";


    import { onMount } from "svelte";
    import { fade, fly } from "svelte/transition";
    import { colorStore } from "$lib/stores/colorStore";
    import { currentGuild } from "$lib/stores/currentGuild";
    import {
        birthdayApi,
        type BirthdayConfig,
        type BirthdayConfigRequest,
        BirthdayFeatures,
        type BirthdayStats,
        type BirthdayUser,
        clientApi
    } from "$lib/api/index.ts";
    import { logger } from "$lib/logger";

    import StatCard from "$lib/components/monitoring/StatCard.svelte";
    import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";
    import DashboardPageLayout from "$lib/components/layout/DashboardPageLayout.svelte";
    import FullscreenEmbedBuilder from "$lib/components/specialized/FullscreenEmbedBuilder.svelte";
    import type { PageData } from "./$types";
    import { requestConfirmation } from "$lib/stores/confirmationStore";
    import { createAutoSave } from "$lib/utils/autoSave.svelte";

    const autoSave = createAutoSave({
      onError: (_err, key) => showMessage(
        key === "birthdayReminderDays"
          ? m.birthday.notifySaveFailed()
          : m.birthday.notifySaveFailedUndone(),
        "error"
      )
    });

    // The birthday message is authored in the embed builder and saved explicitly,
    // so it is the only thing on this page that can be left unsaved.

    interface Props {
      data: PageData;
    }

    let { data }: Props = $props();

    // Helper functions for birthday features
    function hasBirthdayFeature(enabledFeatures: number, feature: BirthdayFeatures): boolean {
        return (enabledFeatures & feature) === feature;
    }

    function getBirthdayFeatureNames(enabledFeatures: number): string[] {
        const names: string[] = [];
        if (hasBirthdayFeature(enabledFeatures, BirthdayFeatures.Announcements)) names.push(m.common.announcements());
        if (hasBirthdayFeature(enabledFeatures, BirthdayFeatures.BirthdayRole)) names.push(m.birthday.featureRole());
        if (hasBirthdayFeature(enabledFeatures, BirthdayFeatures.Reminders)) names.push(m.common.reminders());
        if (hasBirthdayFeature(enabledFeatures, BirthdayFeatures.PingRole)) names.push(m.common.pingRole());
        if (hasBirthdayFeature(enabledFeatures, BirthdayFeatures.TimezoneSupport)) names.push(m.birthday.featureTimezone());
        return names;
    }

    // Common timezones
    const TIMEZONES = $derived([
        { value: "UTC", label: m.birthday.tzUtc(), offset: "+00:00" },
        { value: "America/New_York", label: m.birthday.tzEastern(), offset: "-05:00" },
        { value: "America/Chicago", label: m.birthday.tzCentral(), offset: "-06:00" },
        { value: "America/Denver", label: m.birthday.tzMountain(), offset: "-07:00" },
        { value: "America/Los_Angeles", label: m.birthday.tzPacific(), offset: "-08:00" },
        { value: "Europe/London", label: m.birthday.tzLondon(), offset: "+00:00" },
        { value: "Europe/Paris", label: m.birthday.tzParis(), offset: "+01:00" },
        { value: "Europe/Berlin", label: m.birthday.tzBerlin(), offset: "+01:00" },
        { value: "Europe/Moscow", label: m.birthday.tzMoscow(), offset: "+03:00" },
        { value: "Asia/Tokyo", label: m.birthday.tzTokyo(), offset: "+09:00" },
        { value: "Asia/Shanghai", label: m.birthday.tzShanghai(), offset: "+08:00" },
        { value: "Asia/Dubai", label: m.birthday.tzDubai(), offset: "+04:00" },
        { value: "Australia/Sydney", label: m.birthday.tzSydney(), offset: "+10:00" }
    ]);

    // Component state
    let loading = $state(false);
    let saving = $state(false);
    let message = $state("");
    let messageType: "success" | "error" | "info" = $state("info");

    // Data state
    let birthdayConfig: BirthdayConfig | null = $state(null);
    let birthdayUsers: BirthdayUser[] = $state([]);
    let birthdayStats: BirthdayStats | null = $state(null);
    let guildChannels: Array<{ id: string; name: string; }> = $state([]);
    let guildRoles: Array<{ id: string; name: string; color: number }> = $state([]);

    type BirthdayConfigForm = Omit<BirthdayConfigRequest, "birthdayMessage"> & {
      birthdayMessage: string | Record<string, any> | null;
    };
    let configForm: BirthdayConfigForm = $state({
        birthdayChannelId: null,
        birthdayRoleId: null,
      birthdayMessage: {},
        birthdayPingRoleId: null,
        birthdayReminderDays: 1,
        defaultTimezone: "UTC"
    });

    // UI state
    let activeTab = $state("config");
    let upcomingDays = $state(7);
    let upcomingBirthdays: BirthdayUser[] = $state([]);
    let todaysBirthdays: BirthdayUser[] = $state([]);

    // Last values the server confirmed, so a failed save can put the field back.
    type AutoSavedSettings = Pick<BirthdayConfigRequest,
      "birthdayChannelId" | "birthdayRoleId" | "birthdayPingRoleId" | "birthdayReminderDays" | "defaultTimezone">;
    let savedSettings: AutoSavedSettings = {};
    let savedMessageJson = $state(serializeMessage({}));

    let messageDirty = $derived(serializeMessage(configForm.birthdayMessage) !== savedMessageJson);

    /**
     * Turns the builder's value into what the API stores. An empty string clears the
     * message on the server; null would leave the old one in place.
     */
    function serializeMessage(value: BirthdayConfigForm["birthdayMessage"]): string {
      if (typeof value === "string") return value;
      if (value && typeof value === "object" && Object.keys(value).length > 0) return JSON.stringify(value);
      return "";
    }

    /** Copies a freshly loaded config into the form and the saved snapshot. */
    function applyConfig(config: BirthdayConfig) {
      // Parse birthdayMessage if it's a JSON string
      let parsedMessage: string | Record<string, any> | null | undefined = config.birthdayMessage;
      try {
        if (typeof parsedMessage === "string" && parsedMessage.trim().startsWith("{")) {
          parsedMessage = JSON.parse(parsedMessage);
        } else if (typeof parsedMessage === "string" && parsedMessage) {
          parsedMessage = { content: parsedMessage };
        } else if (!parsedMessage) {
          parsedMessage = {};
        }
      } catch {
        parsedMessage = parsedMessage ? { content: parsedMessage } : {};
      }

      configForm = {
        birthdayChannelId: config.birthdayChannelId,
        birthdayRoleId: config.birthdayRoleId,
        birthdayMessage: parsedMessage ?? {},
        birthdayPingRoleId: config.birthdayPingRoleId,
        birthdayReminderDays: config.birthdayReminderDays,
        defaultTimezone: config.defaultTimezone
      };
      savedSettings = {
        birthdayChannelId: config.birthdayChannelId,
        birthdayRoleId: config.birthdayRoleId,
        birthdayPingRoleId: config.birthdayPingRoleId,
        birthdayReminderDays: config.birthdayReminderDays,
        defaultTimezone: config.defaultTimezone
      };
      savedMessageJson = serializeMessage(configForm.birthdayMessage);
    }

    // Load all birthday data
    async function loadAllBirthdayData() {
        if (!$currentGuild?.id) return;

        // Let anything still waiting land first, so the reload shows it.
        await autoSave.flush();
        if (!$currentGuild?.id) return;

        loading = true;
        try {
            const [
                config,
                users,
                stats,
                channels,
                roles,
                upcoming,
                today
            ] = await Promise.all([
                birthdayApi.getBirthdayConfig($currentGuild.id).catch(() => null),
                birthdayApi.getBirthdayUsers($currentGuild.id).catch(() => []),
                birthdayApi.getBirthdayStats($currentGuild.id).catch(() => null),
                clientApi.getTextChannels($currentGuild.id).catch(() => []),
                clientApi.getRoles($currentGuild.id).catch(() => []),
                birthdayApi.getBirthdayUpcoming($currentGuild.id, upcomingDays).catch(() => []),
                birthdayApi.getBirthdayToday($currentGuild.id).catch(() => [])
            ]);

            birthdayConfig = config;
            if (config) applyConfig(config);
            birthdayUsers = users;
            birthdayStats = stats;

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
            showMessage(m.birthday.notifyLoadFailed(), "error");
        } finally {
            loading = false;
        }
    }

    // Load dynamic data only
    async function loadBirthdayData() {
        if (!$currentGuild?.id) return;

        try {
            const [upcoming, today] = await Promise.all([
                birthdayApi.getBirthdayUpcoming($currentGuild.id, upcomingDays),
                birthdayApi.getBirthdayToday($currentGuild.id)
            ]);

            upcomingBirthdays = upcoming;
            todaysBirthdays = today;
        } catch (err) {
            logger.error("Failed to load birthday data:", err);
            showMessage(m.birthday.notifyLoadFailed(), "error");
        }
    }

    /**
     * Saves one channel or role picker. The API treats `0` as "clear" and a missing
     * field as "leave alone", so an emptied picker is sent as `0n`.
     */
    function saveSnowflake(key: "birthdayChannelId" | "birthdayRoleId" | "birthdayPingRoleId", selected: string | string[] | null) {
        if (!$currentGuild?.id) return;
        const guildId = $currentGuild.id;
        const value = selected && typeof selected === "string" ? BigInt(selected) : null;
        configForm[key] = value;
        const request: BirthdayConfigRequest = {};
        request[key] = value ?? 0n;
        autoSave.now(key, async () => {
            try {
                await birthdayApi.updateBirthdayConfig(guildId, request);
                if ($currentGuild?.id === guildId) savedSettings[key] = value;
            } catch (err) {
                if ($currentGuild?.id === guildId) configForm[key] = savedSettings[key] ?? null;
                throw err;
            }
        });
    }

    function saveTimezone(selected: string | string[] | null) {
        if (!$currentGuild?.id) return;
        const guildId = $currentGuild.id;
        const value = selected && typeof selected === "string" ? selected : "UTC";
        configForm.defaultTimezone = value;
        autoSave.now("defaultTimezone", async () => {
            try {
                await birthdayApi.updateBirthdayConfig(guildId, { defaultTimezone: value });
                if ($currentGuild?.id === guildId) savedSettings.defaultTimezone = value;
            } catch (err) {
                if ($currentGuild?.id === guildId) configForm.defaultTimezone = savedSettings.defaultTimezone ?? "UTC";
                throw err;
            }
        });
    }

    function saveReminderDays() {
        if (!$currentGuild?.id) return;
        const guildId = $currentGuild.id;
        const value = configForm.birthdayReminderDays;
        // Mid-edit values (empty, fractional, out of range) are not sent.
        if (typeof value !== "number" || !Number.isInteger(value) || value < 0 || value > 30) return;
        autoSave.schedule("birthdayReminderDays", async () => {
            await birthdayApi.updateBirthdayConfig(guildId, { birthdayReminderDays: value });
            if ($currentGuild?.id === guildId) savedSettings.birthdayReminderDays = value;
        });
    }

    /**
     * Saves the message when the embed builder closes. The builder's own Save is the explicit
     * step, and its Cancel restores the old value first, so a cancelled edit is never sent.
     */
    function saveMessage() {
        if (!$currentGuild?.id || !messageDirty) return;
        const guildId = $currentGuild.id;
        const message = serializeMessage(configForm.birthdayMessage);
        void autoSave.now("birthdayMessage", async () => {
            await birthdayApi.updateBirthdayConfig(guildId, { birthdayMessage: message });
            if ($currentGuild?.id === guildId) savedMessageJson = message;
        });
    }

    // Reset configuration
    async function resetConfig() {
        if (!$currentGuild?.id) return;
        if (!(await requestConfirmation({ message: m.birthday.resetConfirm(), confirmText: m.common.reset() }))) return;

        saving = true;
        try {
            // Settle queued saves first so none of them lands on top of the reset.
            await autoSave.flush();
            await birthdayApi.resetBirthdayConfig($currentGuild.id);
            // Reload to get the reset config
            await loadAllBirthdayData();
            showMessage(m.birthday.notifyReset(), "success");
        } catch (err) {
            logger.error("Failed to reset birthday config:", err);
            showMessage(m.common.failedToResetConfiguration(), "error");
        } finally {
            saving = false;
        }
    }

    // Toggle feature
    function toggleFeature(feature: BirthdayFeatures) {
        if (!$currentGuild?.id || !birthdayConfig) return;
        const guildId = $currentGuild.id;
        const config = birthdayConfig;
        const enable = !hasBirthdayFeature(config.enabledFeatures, feature);

        // Flip only this feature's bit, both now and on rollback, so toggling
        // several features quickly cannot undo one another.
        config.enabledFeatures = enable ? config.enabledFeatures | feature : config.enabledFeatures & ~feature;

        autoSave.now(`feature-${feature}`, async () => {
            try {
                if (enable) {
                    await birthdayApi.enableBirthdayFeature(guildId, feature);
                } else {
                    await birthdayApi.disableBirthdayFeature(guildId, feature);
                }
            } catch (err) {
                if (birthdayConfig === config) {
                    config.enabledFeatures = enable ? config.enabledFeatures & ~feature : config.enabledFeatures | feature;
                }
                throw err;
            }
        });
    }

    // Utility functions
    function showMessage(text: string, type: "success" | "error" | "info") {
        message = text;
        messageType = type;
        setTimeout(() => {
            message = "";
        }, 5000);
    }

    function formatDate(dateString: string | Date | null | undefined): string {
        if (!dateString) return m.common.notSet();
        return new Date(dateString).toLocaleDateString();
    }

    function getChannelName(channelId: bigint | null | undefined): string {
        if (!channelId) return m.common.notSet();
        const channel = guildChannels.find(c => c.id === channelId.toString());
        return channel ? `#${channel.name}` : m.common.unknownChannel();
    }

    function getRoleName(roleId: bigint | null | undefined): string {
        if (!roleId) return m.common.notSet();
        const role = guildRoles.find(r => r.id === roleId.toString());
        return role ? `@${role.name}` : m.common.unknownRole();
    }

    // Day options for DiscordSelector
    let dayOptions = $derived([
        { id: "7", name: m.birthday.period7() },
        { id: "14", name: m.birthday.period14() },
        { id: "30", name: m.birthday.period30() }
    ]);

    // Handle day selection change
    function handleDayChange(detail: { selected: string | string[] | null }) {
        if (detail.selected && typeof detail.selected === "string") {
            upcomingDays = parseInt(detail.selected);
            loadBirthdayData();
        }
    }

    onMount(() => {
        loadAllBirthdayData();
    });

    // Tabs configuration
    const tabs = $derived([
        { id: "config", label: m.common.configuration(), icon: "fa-gear" },
        { id: "users", label: m.common.users(), icon: "fa-users" },
        { id: "stats", label: m.common.statistics(), icon: "fa-chart-column" }
    ]);

    // Action buttons configuration
    let actionButtons = $derived([
        {
            label: m.common.refresh(),
            icon: "fa-arrows-rotate",
            action: loadAllBirthdayData,
            loading: loading
        }
    ]);

</script>

{#snippet statusMessageContent()}
    <!-- Status Message -->
    {#if message}
        <div class="mb-6 p-4 rounded-xl flex items-center gap-3 transition-all"
             style="background: {messageType === 'success' ? '#10b98120' : messageType === 'error' ? '#ef444420' : $colorStore.primary + '20'};
                border: 1px solid {messageType === 'success' ? '#10b981' : messageType === 'error' ? '#ef4444' : $colorStore.primary}30;"
             in:fly={{ x: 20, duration: 300 }}>
            {#if messageType === 'success'}
                <i class="fa-utility-duo fa-regular fa-circle-check"
                   style="--fa-primary-color: #10b981; --fa-secondary-color: #059669; font-size: 20px;"></i>
            {:else if messageType === 'error'}
                <i class="fa-utility-duo fa-regular fa-circle-exclamation"
                   style="--fa-primary-color: #ef4444; --fa-secondary-color: #dc2626; font-size: 20px;"></i>
            {:else}
                <i class="fa-utility-duo fa-regular fa-circle-exclamation"
                   style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary}; font-size: 20px;"></i>
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
            <i class="fa-utility-duo fa-regular fa-gift"
               style="--fa-primary-color: {$colorStore.accent}; --fa-secondary-color: {$colorStore.primary}; font-size: 20px;"></i>
            <span style="color: {$colorStore.text}">
        🎉 {todaysBirthdays.length === 1 ? m.birthday.alertTodayOne({ count: todaysBirthdays.length }) : m.birthday.alertTodayOther({ count: todaysBirthdays.length })}
      </span>
        </div>
    {/if}
{/snippet}

<DashboardPageLayout
  {actionButtons}
  {autoSave}
  bind:activeTab
  guildName={$currentGuild?.name || m.common.dashboard()}
  icon="fa-cake-candles"
  statusMessages={statusMessageContent}
  subtitle={m.features.birthdayDescription()}
  {tabs}
  title={m.birthday.pageTitle()}
>


    <!-- Tab Content -->
    {#if activeTab === 'config'}
        <div class="w-full" in:fade={{ duration: 200 }}>
            <!-- Configuration Form -->
            <div class="space-y-6 md:space-y-8">
                <!-- Basic Settings -->
                <div class="relative z-20  rounded-2xl border p-6 md:p-8 shadow-2xl transition-all"
                     style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15, {$colorStore.gradientEnd}10);
                            border-color: {$colorStore.primary}30;">
                    <div class="flex items-center gap-3 mb-6">
                        <i class="fa-utility-duo fa-regular fa-gear" style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary}; font-size: 20px;"></i>
                        <h2 class="text-xl font-bold" style="color: {$colorStore.text}">{m.common.basicSettings()}</h2>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                        <!-- Channel Selection -->
                        <div>
                            <span id="birthday-channel-label" class="block text-sm font-medium mb-2"
                                  style="color: {$colorStore.text}">
                                <i class="fa-solid fa-hashtag" style="font-size: 14px;"></i>
                                {m.birthday.configChannel()}
                            </span>
                            <div class="min-h-[44px]">
                                <DiscordSelector
                                        type="channel"
                                        options={guildChannels}
                                        selected={configForm.birthdayChannelId?.toString() || null}
                                        placeholder={m.common.noChannelSelected()}
                                        onchange={(detail) => saveSnowflake("birthdayChannelId", detail.selected)}
                                />
                            </div>
                        </div>

                        <!-- Birthday Role -->
                        <div>
                            <span id="birthday-role-24-hour-temporary-label" class="block text-sm font-medium mb-2"
                                  style="color: {$colorStore.text}">
                                <i class="fa-solid fa-crown" style="font-size: 14px;"></i>
                                {m.birthday.configRole()}
                            </span>
                            <div class="min-h-[44px]">
                                <DiscordSelector
                                        type="role"
                                        options={guildRoles}
                                        selected={configForm.birthdayRoleId?.toString() || null}
                                        placeholder={m.common.noRoleSelected()}
                                        onchange={(detail) => saveSnowflake("birthdayRoleId", detail.selected)}
                                />
                            </div>
                        </div>

                        <!-- Ping Role -->
                        <div>
                            <span id="ping-role-notifies-when-announcing-label" class="block text-sm font-medium mb-2"
                                  style="color: {$colorStore.text}">
                                <i class="fa-solid fa-bell" style="font-size: 14px;"></i>
                                {m.birthday.configPingRole()}
                            </span>
                            <div class="min-h-[44px]">
                                <DiscordSelector
                                        type="role"
                                        options={guildRoles}
                                        selected={configForm.birthdayPingRoleId?.toString() || null}
                                        placeholder={m.common.noPingRole()}
                                        onchange={(detail) => saveSnowflake("birthdayPingRoleId", detail.selected)}
                                />
                            </div>
                        </div>

                        <!-- Timezone -->
                        <div>
                            <span id="server-timezone-label" class="block text-sm font-medium mb-2"
                                  style="color: {$colorStore.text}">
                                <i class="fa-solid fa-location-dot" style="font-size: 14px;"></i>
                                {m.common.serverTimezone()}
                            </span>
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
                                        selected={configForm.defaultTimezone}
                                        placeholder={m.common.selectTimezonePlaceholder()}
                                        onchange={(detail) => saveTimezone(detail.selected)}
                                />
                            </div>
                        </div>

                        <!-- Reminder Days -->
                        <div>
                          <label for="input-1955" class="block text-sm font-medium mb-2"
                                 style="color: {$colorStore.text}">
                                <i class="fa-solid fa-clock" style="font-size: 14px;"></i>
                                {m.birthday.configReminderDays()}
                            </label>
                          <input id="input-1955"
                                    type="number"
                                    min="0"
                                    max="30"
                                    bind:value={configForm.birthdayReminderDays}
                                    oninput={saveReminderDays}
                                    onblur={() => autoSave.flush("birthdayReminderDays")}
                                    class="w-full p-3 rounded-xl border transition-all min-h-[44px] text-base"
                                    style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                          >
                        </div>
                    </div>
                </div>

                <!-- Custom Message -->
                <div class="relative z-10  rounded-2xl p-6 md:p-8 shadow-2xl transition-all border"
                     style="background: linear-gradient(135deg, {$colorStore.gradientStart}15, {$colorStore.gradientMid}20, {$colorStore.gradientEnd}15);
                    border-color: {$colorStore.primary}30;">
                    <div class="flex items-center gap-3 mb-6">
                        <i class="fa-utility-duo fa-regular fa-comment" style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary}; font-size: 20px;"></i>
                        <h2 class="text-xl font-bold" style="color: {$colorStore.text}">{m.features.wizardBirthdayStepMessageTitle()}</h2>
                    </div>

                    <div>
                      <label for="f-+page-custom-birthday-announcement-507" class="block text-sm font-medium mb-3"
                             style="color: {$colorStore.text}">
                        <i class="fa-solid fa-gift" style="font-size: 14px;"></i>
                        {m.birthday.messageCustom()}
                      </label>

                      <FullscreenEmbedBuilder id="f-+page-custom-birthday-announcement-507"
                        bind:value={configForm.birthdayMessage}
                        previewTitle={m.features.wizardBirthdayStepMessageTitle()}
                        previewDescription={m.birthday.messagePreviewDescription()}
                        icon="fa-gift"
                        allowContent={true}
                        allowMultipleEmbeds={true}
                        maxEmbeds={10}
                        allowComponents={true}
                        additionalPlaceholders={[
                          { category: "Birthday", name: "%user.mention%", description: m.placeholders.userMention() },
                          { category: "Birthday", name: "%user.name%", description: m.placeholders.userName() },
                          { category: "Birthday", name: "%user.displayname%", description: m.placeholders.userDisplayname() },
                          { category: "Birthday", name: "%birthday.age%", description: m.placeholders.birthdayAge() },
                          { category: "Server", name: "%server.name%", description: m.placeholders.serverName() },
                          { category: "Server", name: "%server.time%", description: m.placeholders.serverTime() }
                        ]}
                        guildId={$currentGuild?.id}
                        user={data.user}
                        placeholder={m.birthday.messagePlaceholder()}
                        onclose={saveMessage}
                      />

                      <p class="text-xs mt-3" style="color: {$colorStore.muted}">
                        {m.birthday.messageHint()}
                      </p>

                    </div>
                </div>

                <!-- Action Buttons -->
                <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 pt-4">
                    <button
                      class="flex items-center justify-center gap-3 px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl transition-all hover:scale-[1.02] min-h-[44px] sm:min-h-[52px] font-medium focus:outline-hidden focus:ring-2 focus:ring-offset-2"
                      style="background: {$colorStore.muted}20; color: {$colorStore.muted}; border: 1px solid {$colorStore.muted}30; focus:ring-color: {$colorStore.muted};"
                            onclick={resetConfig}
                            disabled={saving}
                    >
                        <i class="fa-solid fa-arrows-rotate" style="font-size: 20px;"></i>
                        {m.common.resetToDefault()}
                    </button>
                </div>
            </div>

            <!-- Feature Toggles & Preview -->
            <div class="space-y-6">
                <!-- Feature Controls -->
                <div class=" rounded-2xl border p-6 shadow-2xl transition-all"
                     style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15, {$colorStore.gradientEnd}10);
                            border-color: {$colorStore.primary}30;">
                    <div class="flex items-center gap-3 mb-6">
                        <i class="fa-utility-duo fa-regular fa-gift" style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary}; font-size: 20px;"></i>
                        <h2 class="text-xl font-bold" style="color: {$colorStore.text}">{m.birthday.featuresTitle()}</h2>
                    </div>

                    <div class="space-y-4">
                        <!-- Feature Toggles -->
                        <div class="space-y-3">
                            <div class="flex items-center justify-between p-3 rounded-xl"
                                 style="background: {$colorStore.primary}08;">
                                <div class="flex items-center gap-3">
                                    <i class="fa-utility-duo fa-regular fa-comment" style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary}; font-size: 20px;"></i>
                                    <div>
                                        <div class="font-medium" style="color: {$colorStore.text}">{m.common.announcements()}</div>
                                        <div class="text-sm" style="color: {$colorStore.muted}">{m.birthday.featureAnnouncementsHint()}</div>
                                    </div>
                                </div>
                                <label class="relative inline-flex items-center cursor-pointer">
                                    <input
                                            type="checkbox"
                                            class="sr-only peer"
                                            checked={birthdayConfig ? hasBirthdayFeature(birthdayConfig.enabledFeatures, BirthdayFeatures.Announcements) : false}
                                            onchange={() => toggleFeature(BirthdayFeatures.Announcements)}
                                    >
                                    <span
                                      class="w-11 h-6 bg-gray-600 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all block"
                                      style="peer-checked:bg-color: {$colorStore.primary}"></span>
                                </label>
                            </div>

                            <div class="flex items-center justify-between p-3 rounded-xl"
                                 style="background: {$colorStore.primary}08;">
                                <div class="flex items-center gap-3">
                                    <i class="fa-utility-duo fa-regular fa-crown" style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary}; font-size: 20px;"></i>
                                    <div>
                                        <div class="font-medium" style="color: {$colorStore.text}">{m.birthday.featureRole()}</div>
                                        <div class="text-sm" style="color: {$colorStore.muted}">{m.birthday.featureRoleHint()}</div>
                                    </div>
                                </div>
                                <label class="relative inline-flex items-center cursor-pointer">
                                    <input
                                            type="checkbox"
                                            class="sr-only peer"
                                            checked={birthdayConfig ? hasBirthdayFeature(birthdayConfig.enabledFeatures, BirthdayFeatures.BirthdayRole) : false}
                                            onchange={() => toggleFeature(BirthdayFeatures.BirthdayRole)}
                                            disabled={!configForm.birthdayRoleId}
                                    >
                                    <span
                                      class="w-11 h-6 bg-gray-600 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-disabled:opacity-50 block"
                                      style="peer-checked:bg-color: {$colorStore.primary}"></span>
                                </label>
                            </div>

                            <div class="flex items-center justify-between p-3 rounded-xl"
                                 style="background: {$colorStore.primary}08;">
                                <div class="flex items-center gap-3">
                                    <i class="fa-utility-duo fa-regular fa-bell" style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary}; font-size: 20px;"></i>
                                    <div>
                                        <div class="font-medium" style="color: {$colorStore.text}">{m.common.reminders()}</div>
                                        <div class="text-sm" style="color: {$colorStore.muted}">{m.birthday.featureRemindersHint()}</div>
                                    </div>
                                </div>
                                <label class="relative inline-flex items-center cursor-pointer">
                                    <input
                                            type="checkbox"
                                            class="sr-only peer"
                                            checked={birthdayConfig ? hasBirthdayFeature(birthdayConfig.enabledFeatures, BirthdayFeatures.Reminders) : false}
                                            onchange={() => toggleFeature(BirthdayFeatures.Reminders)}
                                    >
                                    <span
                                      class="w-11 h-6 bg-gray-600 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all block"
                                      style="peer-checked:bg-color: {$colorStore.primary}"></span>
                                </label>
                            </div>

                            <div class="flex items-center justify-between p-3 rounded-xl"
                                 style="background: {$colorStore.primary}08;">
                                <div class="flex items-center gap-3">
                                    <i class="fa-utility-duo fa-regular fa-bell-ring" style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary}; font-size: 20px;"></i>
                                    <div>
                                        <div class="font-medium" style="color: {$colorStore.text}">{m.common.pingRole()}</div>
                                        <div class="text-sm" style="color: {$colorStore.muted}">{m.birthday.featurePingRoleHint()}</div>
                                    </div>
                                </div>
                                <label class="relative inline-flex items-center cursor-pointer">
                                    <input
                                            type="checkbox"
                                            class="sr-only peer"
                                            checked={birthdayConfig ? hasBirthdayFeature(birthdayConfig.enabledFeatures, BirthdayFeatures.PingRole) : false}
                                            onchange={() => toggleFeature(BirthdayFeatures.PingRole)}
                                            disabled={!configForm.birthdayPingRoleId}
                                    >
                                    <span
                                      class="w-11 h-6 bg-gray-600 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-disabled:opacity-50 block"
                                      style="peer-checked:bg-color: {$colorStore.primary}"></span>
                                </label>
                            </div>

                            <div class="flex items-center justify-between p-3 rounded-xl"
                                 style="background: {$colorStore.primary}08;">
                                <div class="flex items-center gap-3">
                                    <i class="fa-utility-duo fa-regular fa-location-dot" style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary}; font-size: 20px;"></i>
                                    <div>
                                        <div class="font-medium" style="color: {$colorStore.text}">{m.birthday.featureTimezone()}</div>
                                        <div class="text-sm" style="color: {$colorStore.muted}">{m.birthday.featureTimezoneHint()}</div>
                                    </div>
                                </div>
                                <label class="relative inline-flex items-center cursor-pointer">
                                    <input
                                            type="checkbox"
                                            class="sr-only peer"
                                            checked={birthdayConfig ? hasBirthdayFeature(birthdayConfig.enabledFeatures, BirthdayFeatures.TimezoneSupport) : false}
                                            onchange={() => toggleFeature(BirthdayFeatures.TimezoneSupport)}
                                    >
                                    <span
                                      class="w-11 h-6 bg-gray-600 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all block"
                                      style="peer-checked:bg-color: {$colorStore.primary}"></span>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Configuration Preview -->
                <div class=" rounded-2xl border p-6 shadow-2xl transition-all"
                     style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15, {$colorStore.gradientEnd}10);
                            border-color: {$colorStore.primary}30;">
                    <div class="flex items-center gap-3 mb-6">
                        <i class="fa-utility-duo fa-regular fa-circle-exclamation" style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary}; font-size: 20px;"></i>
                        <h2 class="text-xl font-bold" style="color: {$colorStore.text}">{m.common.currentConfiguration()}</h2>
                    </div>

                    <div class="space-y-3">
                        <div class="flex justify-between items-center">
                            <span style="color: {$colorStore.muted}">{m.common.channelLabel()}</span>
                            <span style="color: {$colorStore.text}">{getChannelName(configForm.birthdayChannelId)}</span>
                        </div>
                        <div class="flex justify-between items-center">
                            <span style="color: {$colorStore.muted}">{m.birthday.summaryRole()}</span>
                            <span style="color: {$colorStore.text}">{getRoleName(configForm.birthdayRoleId)}</span>
                        </div>
                        <div class="flex justify-between items-center">
                            <span style="color: {$colorStore.muted}">{m.common.pingRoleLabel()}</span>
                            <span style="color: {$colorStore.text}">{getRoleName(configForm.birthdayPingRoleId)}</span>
                        </div>
                        <div class="flex justify-between items-center">
                            <span style="color: {$colorStore.muted}">{m.common.timezoneLabel()}</span>
                            <span style="color: {$colorStore.text}">{configForm.defaultTimezone}</span>
                        </div>
                        <div class="flex justify-between items-center">
                            <span style="color: {$colorStore.muted}">{m.birthday.summaryFeatures()}</span>
                            <span style="color: {$colorStore.text}">
                {birthdayConfig ? getBirthdayFeatureNames(birthdayConfig.enabledFeatures).join(", ") || m.common.none() : m.common.none()}
              </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

    {:else if activeTab === 'users'}
        <div class="w-full space-y-6 md:space-y-8" in:fade={{ duration: 200 }}>
            <div class="grid grid-cols-1 xl:grid-cols-2 gap-6 md:gap-8">
                <!-- Upcoming Birthdays -->
                <div class=" rounded-2xl border p-6 md:p-8 shadow-2xl transition-all relative z-20"
                     style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15, {$colorStore.gradientEnd}10);
                            border-color: {$colorStore.primary}30;">
                    <div class="flex items-center justify-between mb-6">
                        <div class="flex items-center gap-3">
                            <i class="fa-utility-duo fa-regular fa-calendar" style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary}; font-size: 20px;"></i>
                            <h2 class="text-xl font-bold" style="color: {$colorStore.text}">{m.birthday.usersUpcomingTitle()}</h2>
                        </div>
                        <div class="min-w-[140px]">
                            <DiscordSelector
                                    type="custom"
                                    options={dayOptions}
                                    selected={upcomingDays.toString()}
                                    placeholder={m.birthday.usersPeriodPlaceholder()}
                                    onchange={handleDayChange}
                                    searchable={false}
                            />
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
                                        <div class="h-4 rounded-sm"
                                             style="background: {$colorStore.primary}20; width: 70%;"></div>
                                        <div class="h-3 rounded-sm"
                                             style="background: {$colorStore.primary}15; width: 50%;"></div>
                                    </div>
                                    <div class="w-16 h-6 rounded-sm" style="background: {$colorStore.primary}20;"></div>
                                </div>
                            {/each}
                        {:else if upcomingBirthdays.length === 0}
                            <!-- Empty state -->
                            <div class="text-center py-8">
                                <i class="fa-utility-duo fa-regular fa-calendar" style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.primary}; font-size: 48px; opacity: 0.5;"></i>
                                <h3 class="text-lg font-semibold mb-2" style="color: {$colorStore.text}">{m.birthday.usersUpcomingEmptyTitle()}</h3>
                                <p class="text-sm" style="color: {$colorStore.muted}">
                                    {m.birthday.usersUpcomingEmpty({ days: upcomingDays })}
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
                                            {user.nickname || user.username}
                                        </div>
                                        <div class="text-sm" style="color: {$colorStore.muted}">
                                            {user.birthdayAnnouncementsEnabled ? formatDate(user.birthday) : m.birthday.usersPrivate()} • {user.birthdayTimezone || 'UTC'}
                                        </div>
                                    </div>
                                    <div class="text-right">
                                        <div class="text-sm font-medium" style="color: {$colorStore.primary}">
                                            {user.daysUntil === 0 ? m.birthday.usersToday() :
                                                user.daysUntil === 1 ? m.birthday.usersTomorrow() :
                                                    m.common.daysCount({ count: user.daysUntil ?? 0 })}
                                        </div>
                                        <div class="text-xs" style="color: {$colorStore.muted}">
                                            {user.birthdayAnnouncementsEnabled ? m.birthday.usersPublic() : m.birthday.usersPrivate()}
                                        </div>
                                    </div>
                                </div>
                            {/each}
                        {/if}
                    </div>
                </div>

                <!-- All Users with Birthdays -->
                <div class=" rounded-2xl border p-6 md:p-8 shadow-2xl transition-all relative z-10"
                     style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15, {$colorStore.gradientEnd}10);
                            border-color: {$colorStore.primary}30;">
                    <div class="flex items-center gap-3 mb-6">
                        <i class="fa-utility-duo fa-regular fa-users" style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary}; font-size: 20px;"></i>
                        <h2 class="text-xl font-bold" style="color: {$colorStore.text}">{m.birthday.usersAllTitle({ count: birthdayUsers.length })}</h2>
                    </div>

                    <div class="space-y-3 max-h-96 overflow-y-auto">
                        {#if birthdayUsers.length === 0}
                            <div class="text-center py-8">
                                <i class="fa-utility-duo fa-regular fa-users" style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.primary}; font-size: 48px; opacity: 0.5;"></i>
                                <h3 class="text-lg font-semibold mb-2" style="color: {$colorStore.text}">{m.birthday.usersNoneTitle()}</h3>
                                <p class="text-sm" style="color: {$colorStore.muted}">
                                    {m.birthday.usersNoneHint()}
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
                                            {user.nickname || user.username}
                                        </div>
                                        <div class="text-sm" style="color: {$colorStore.muted}">
                                            {user.birthdayAnnouncementsEnabled ? formatDate(user.birthday) : m.birthday.usersPrivate()} • {user.birthdayTimezone || 'UTC'}
                                        </div>
                                    </div>
                                    <div class="text-xs px-2 py-1 rounded-lg"
                                         style="background: {user.birthdayAnnouncementsEnabled ? $colorStore.primary + '20' : $colorStore.muted + '20'};
                            color: {user.birthdayAnnouncementsEnabled ? $colorStore.primary : $colorStore.muted};">
                                        {user.birthdayAnnouncementsEnabled ? m.birthday.usersPublic() : m.birthday.usersPrivate()}
                                    </div>
                                </div>
                            {/each}
                        {/if}
                    </div>
                </div>
            </div>
        </div>

    {:else if activeTab === 'stats'}
        <div class="w-full" in:fade={{ duration: 200 }}>
            <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6">
                {#if birthdayStats}
                    <StatCard
                            icon="fa-users"
                            label={m.common.totalUsers()}
                            value={birthdayStats.totalUsers}
                            subtitle={m.birthday.statsMembersSubtitle()}
                            iconColor="primary"
                            animationDelay={0}
                    />

                    <StatCard
                            icon="fa-cake-candles"
                            label={m.birthday.statsSet()}
                            value={birthdayStats.usersWithBirthdays}
                            subtitle={m.birthday.statsSetSubtitle({ percent: Number(birthdayStats.birthdaySetPercentage || 0).toFixed(1) })}
                            iconColor="secondary"
                            animationDelay={100}
                    />

                    <StatCard
                            icon="fa-gift"
                            label={m.birthday.statsPublic()}
                            value={birthdayStats.usersWithAnnouncementsEnabled || 0}
                            subtitle={m.birthday.statsPublicSubtitle()}
                            iconColor="accent"
                            animationDelay={200}
                    />

                    <StatCard
                            icon="fa-calendar"
                            label={m.birthday.statsToday()}
                            value={birthdayStats.todaysBirthdayCount}
                            subtitle={m.birthday.statsTodaySubtitle()}
                            iconColor="primary"
                            animationDelay={300}
                    />
                {:else}
                    <div class="col-span-full text-center py-12">
                        <i class="fa-utility-duo fa-regular fa-chart-simple" style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.primary}; font-size: 64px; opacity: 0.5;"></i>
                        <h3 class="text-xl font-semibold mb-2" style="color: {$colorStore.text}">{m.common.noStatisticsAvailable()}</h3>
                        <p style="color: {$colorStore.muted}">
                            {m.birthday.statsEmpty()}
                        </p>
                    </div>
                {/if}
            </div>
        </div>
    {/if}
</DashboardPageLayout>

<style>
    .peer:checked ~ span {
        background-color: var(--primary-color);
    }
</style>
