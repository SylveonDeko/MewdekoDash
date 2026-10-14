<!-- routes/dashboard/afk/+page.svelte -->
<script lang="ts">
  import { m } from "$lib/i18n";


  import { onMount } from "svelte";
  import { afkApi, clientApi, type UserWithAfk } from "$lib/api/index.ts";
  import type { PageData } from "./$types";
  import { currentGuild } from "$lib/stores/currentGuild.ts";
  import { fade, slide } from "svelte/transition";
  import { goto } from "$app/navigation";
  import Notification from "$lib/components/ui/Notification.svelte";
  import DashboardPageLayout from "$lib/components/layout/DashboardPageLayout.svelte";
  import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";
  import ConfirmationModal from "$lib/components/ui/ConfirmationModal.svelte";
  import { currentInstance } from "$lib/stores/instanceStore.ts";
  import { colorStore } from "$lib/stores/colorStore";
  import { logger } from "$lib/logger.ts";
  import { loadingStore } from "$lib/stores/loadingStore";
  import FullscreenEmbedBuilder from "$lib/components/specialized/FullscreenEmbedBuilder.svelte";
  import { createAutoSave } from "$lib/utils/autoSave.svelte";


  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();
  let showNotification = $state(false);
  let notificationMessage = $state("");
  let notificationType: "success" | "error" = $state("success");

  let afkUsers: UserWithAfk[] = $state([]);
  let expandedUser: string | null = $state(null);
  let loading = $state(true);
  let error: string | null = $state(null);

  // AFK Settings
  let afkDeletionTime = $state(0);
  let afkMaxLength = $state(0);
  let afkType = $state(1);
  let afkTimeout = $state("0s");
  let customAfkMessage: any = $state({});

  /** Last values the server confirmed, so a failed save can be rolled back. */
  let saved = {
    deletion: 0,
    maxLength: 0,
    type: 1,
    timeout: "0s",
    customMessage: "",
    disabledChannels: [] as string[]
  };

  const autoSave = createAutoSave({
    onError: () => showNotificationMessage(m.afk.notifySaveFailed(), "error")
  });

  // Channel management
  let availableChannels: Array<{ id: string; name: string }> = $state([]);
  let selectedDisabledChannels: string[] = $state([]);

  // User management
  let selectedUsers = $state(new Set<string>());
  let selectAllUsers = $state(false);

  // Modal state
  let showConfirmModal = $state(false);
  let modalConfig = $state({
    title: "",
    message: "",
    confirmText: m.common.confirm(),
    variant: "danger" as "danger" | "warning" | "info",
    action: null as (() => void) | null
  });

  // Layout state
  let activeTab = $state("settings");

  const tabs = $derived([
    { id: "settings", label: m.common.basicSettings(), icon: "fa-gear" },
    { id: "advanced", label: m.common.advancedSettings(), icon: "fa-clock" },
    { id: "users", label: m.afk.tabUsers(), icon: "fa-users" }
  ]);

  // AFK type options for DiscordSelector
  const afkTypeOptions = $derived([
    { id: "1", name: m.features.wizardAfk1() },
    { id: "2", name: m.features.wizardAfk2() },
    { id: "3", name: m.features.wizardAfk3() },
    { id: "4", name: m.features.wizardAfk4() }
  ]);

  // Helper functions for timeout conversion
  function secondsToTimeString(seconds: number): string {
    if (seconds === 0) return "0s";

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    let result = "";
    if (hours > 0) result += `${hours}h`;
    if (minutes > 0) result += `${minutes}m`;
    if (secs > 0) result += `${secs}s`;

    return result || "0s";
  }

  function timeStringToSeconds(timeStr: string): number {
    if (!timeStr || timeStr === "0s") return 0;

    const regex = /(\d+)([hms])/g;
    let totalSeconds = 0;
    let match;

    while ((match = regex.exec(timeStr)) !== null) {
      const value = parseInt(match[1]);
      const unit = match[2];

      switch (unit) {
        case "h":
          totalSeconds += value * 3600;
          break;
        case "m":
          totalSeconds += value * 60;
          break;
        case "s":
          totalSeconds += value;
          break;
      }
    }

    return totalSeconds;
  }

  function isValidDeletionTime(value: unknown): value is number {
    return typeof value === "number" && Number.isInteger(value) && value >= 0;
  }

  function isValidMaxLength(value: unknown): value is number {
    return typeof value === "number" && Number.isInteger(value) && value >= 1 && value <= 4096;
  }

  function isValidTimeout(value: string): boolean {
    const seconds = timeStringToSeconds(value);
    return seconds >= 1 && seconds <= 7200;
  }

  /** Serialises the embed builder's value the way the bot expects it. */
  function serializeCustomMessage(message: any): string {
    if (typeof message === "object" && message !== null && Object.keys(message).length > 0) return JSON.stringify(message);
    return typeof message === "string" ? message : "";
  }

  function parseCustomMessage(raw: string): any {
    try {
      return raw && raw.trim().startsWith("{") ? JSON.parse(raw) : (raw ? { content: raw } : {});
    } catch {
      return raw ? { content: raw } : {};
    }
  }

  function saveDeletionTime() {
    if (!$currentGuild?.id) return;
    const guildId = $currentGuild.id;
    const value = afkDeletionTime;
    if (!isValidDeletionTime(value)) {
      autoSave.cancel("deletion");
      return;
    }
    autoSave.schedule("deletion", async () => {
      try {
        await afkApi.afkDelSet(guildId, value);
        if ($currentGuild?.id === guildId) saved.deletion = value;
      } catch (err) {
        // Only undo if the field still shows the value that failed, so typing isn't interrupted
        if ($currentGuild?.id === guildId && afkDeletionTime === value) afkDeletionTime = saved.deletion;
        throw err;
      }
    });
  }

  function saveMaxLength() {
    if (!$currentGuild?.id) return;
    const guildId = $currentGuild.id;
    const value = afkMaxLength;
    if (!isValidMaxLength(value)) {
      autoSave.cancel("maxLength");
      return;
    }
    autoSave.schedule("maxLength", async () => {
      try {
        await afkApi.afkLengthSet(guildId, value);
        if ($currentGuild?.id === guildId) saved.maxLength = value;
      } catch (err) {
        if ($currentGuild?.id === guildId && afkMaxLength === value) afkMaxLength = saved.maxLength;
        throw err;
      }
    });
  }

  function saveType(value: number) {
    if (!$currentGuild?.id) return;
    const guildId = $currentGuild.id;
    const previous = saved.type;
    afkType = value;
    autoSave.now("type", async () => {
      try {
        await afkApi.afkTypeSet(guildId, value);
        if ($currentGuild?.id === guildId) saved.type = value;
      } catch (err) {
        if ($currentGuild?.id === guildId) afkType = previous;
        throw err;
      }
    });
  }

  function saveTimeout() {
    if (!$currentGuild?.id) return;
    const guildId = $currentGuild.id;
    const value = afkTimeout;
    if (!isValidTimeout(value)) {
      autoSave.cancel("timeout");
      return;
    }
    autoSave.schedule("timeout", async () => {
      try {
        await afkApi.afkTimeoutSet(guildId, value);
        if ($currentGuild?.id === guildId) saved.timeout = value;
      } catch (err) {
        if ($currentGuild?.id === guildId && afkTimeout === value) afkTimeout = saved.timeout;
        throw err;
      }
    });
  }

  function saveDisabledChannels() {
    if (!$currentGuild?.id) return;
    const guildId = $currentGuild.id;
    const value = [...selectedDisabledChannels];
    const previous = [...saved.disabledChannels];
    autoSave.now("disabledChannels", async () => {
      try {
        await afkApi.setDisabledAfkChannels(guildId, value.join(",") || "0");
        if ($currentGuild?.id === guildId) saved.disabledChannels = value;
      } catch (err) {
        if ($currentGuild?.id === guildId) selectedDisabledChannels = previous;
        throw err;
      }
    });
  }

  /** The embed builder has its own Save/Cancel, so this runs once it closes, and only if the message changed. */
  function saveCustomMessage() {
    if (!$currentGuild?.id) return;
    const guildId = $currentGuild.id;
    const value = serializeCustomMessage(customAfkMessage);
    const previous = saved.customMessage;
    if (value === previous) return;
    autoSave.now("customMessage", async () => {
      try {
        await afkApi.setCustomAfkMessage(guildId, value);
        if ($currentGuild?.id === guildId) saved.customMessage = value;
      } catch (err) {
        if ($currentGuild?.id === guildId) customAfkMessage = parseCustomMessage(previous);
        throw err;
      }
    });
  }

  function showBulkRemoveConfirm() {
    if (!$currentGuild?.id || selectedUsers.size === 0) return;

    modalConfig = {
      title: m.afk.bulkRemoveTitle(),
      message: m.afk.bulkRemoveMessage({ count: selectedUsers.size }),
      confirmText: m.afk.removeTitle(),
      variant: "danger",
      action: executeBulkRemove
    };
    showConfirmModal = true;
  }

  async function executeBulkRemove() {
    if (!$currentGuild?.id || selectedUsers.size === 0) return;

    try {
      const removePromises = Array.from(selectedUsers).map(userId =>
        afkApi.deleteAfkStatus($currentGuild.id, BigInt(userId))
      );

      await Promise.all(removePromises);
      showNotificationMessage(m.afk.notifyBulkRemoved({ count: selectedUsers.size }), "success");
      selectedUsers.clear();
      selectAllUsers = false;
      await fetchAfkUsers();
    } catch (error) {
      logger.error("Failed to bulk remove AFK:", error);
      showNotificationMessage(m.afk.notifyBulkRemoveFailed({ error: error instanceof Error ? error.message : m.common.unknownError() }), "error");
    }
  }

  function toggleUserSelection(userId: string) {
    if (selectedUsers.has(userId)) {
      selectedUsers.delete(userId);
    } else {
      selectedUsers.add(userId);
    }
    selectedUsers = selectedUsers;
    selectAllUsers = selectedUsers.size === afkUsers.length;
  }

  function toggleSelectAll() {
    if (selectAllUsers) {
      selectedUsers.clear();
    } else {
      afkUsers.forEach(user => selectedUsers.add(user.userId.toString()));
    }
    selectedUsers = selectedUsers;
    selectAllUsers = !selectAllUsers;
  }

  function handleTimeoutInput(event: Event) {
    const target = event.target as HTMLInputElement;
    afkTimeout = target.value;

    // Validate timeout range (1s to 2h = 7200s)
    target.setCustomValidity(isValidTimeout(afkTimeout) ? "" : m.afk.validationTimeoutRange());
    saveTimeout();
  }

  function handleTimeoutBlur(event: Event) {
    const target = event.target as HTMLInputElement;
    if (!isValidTimeout(afkTimeout)) {
      showNotificationMessage(m.afk.notifyTimeoutRange(), "error");
      afkTimeout = saved.timeout;
      target.value = saved.timeout;
      target.setCustomValidity("");
    }
    autoSave.flush("timeout");
  }

  function handleNumberBlur(event: Event, key: "deletion" | "maxLength") {
    const target = event.currentTarget as HTMLInputElement;
    switch (key) {
      case "deletion":
        if (!isValidDeletionTime(afkDeletionTime)) afkDeletionTime = saved.deletion;
        break;
      case "maxLength":
        if (!isValidMaxLength(afkMaxLength)) afkMaxLength = saved.maxLength;
        break;
    }
    target.setCustomValidity("");
    autoSave.flush(key);
  }

  function handleDisabledChannelsChange(detail: { selected: string | string[] | null }) {
    selectedDisabledChannels = Array.isArray(detail.selected) ? detail.selected : [];
    saveDisabledChannels();
  }

  onMount(async () => {
    if (!$currentGuild) await goto("/dashboard");
    await Promise.all([
      fetchAfkUsers(),
      fetchAfkSettings()
    ]);
  });

  function showNotificationMessage(message: string, type: "success" | "error" = "success") {
    notificationMessage = message;
    notificationType = type;
    showNotification = true;
    setTimeout(() => {
      showNotification = false;
    }, 3000);
  }

  async function fetchAfkSettings() {
    return await loadingStore.wrap("fetch-afk-settings", async () => {
      try {
        if (!$currentGuild?.id) throw new Error(m.common.noGuildSelected());

        const [deletion, maxLength, type, timeout, disabledChannels, customMsg, channels] = await Promise.all([
          afkApi.getAfkDel($currentGuild.id),
          afkApi.getAfkLength($currentGuild.id),
          afkApi.getAfkType($currentGuild.id),
          afkApi.getAfkTimeout($currentGuild.id),
          afkApi.getDisabledAfkChannels($currentGuild.id),
          afkApi.getCustomAfkMessage($currentGuild.id),
          clientApi.getTextChannels($currentGuild.id)
        ]);

        afkDeletionTime = deletion;
        afkMaxLength = maxLength;
        afkType = type;
        afkTimeout = secondsToTimeString(timeout);

        // Parse disabled channels - handle both direct string and nested object response
        const disabledChannelsString = (disabledChannels as any)?.data || disabledChannels || "";

        const disabledChannelIds = disabledChannelsString && disabledChannelsString !== "0"
          ? disabledChannelsString.split(",").filter(Boolean)
          : [];
        selectedDisabledChannels = disabledChannelIds;

        // Parse custom message - could be JSON string or plain text
        customAfkMessage = parseCustomMessage(customMsg || "");
        availableChannels = channels;

        saved = {
          deletion,
          maxLength,
          type,
          timeout: afkTimeout,
          customMessage: serializeCustomMessage(customAfkMessage),
          disabledChannels: [...disabledChannelIds]
        };

        // Ensure the disabled channels are set after available channels are loaded
        // This helps with pre-population timing
        setTimeout(() => {
          selectedDisabledChannels = [...disabledChannelIds];
        }, 0);
      } catch (err) {
        logger.error("Failed to fetch AFK settings:", err);
        error = err instanceof Error ? err.message : m.afk.fetchSettingsFailed();
      }
    }, "api", m.afk.loadingSettings());
  }

  async function fetchAfkUsers() {
    return await loadingStore.wrap("fetch-afk-users", async () => {
      try {
        loading = true;
        error = null;
        if (!$currentGuild?.id) {
          throw new Error(m.common.noGuildSelected());
        }
        const response = await afkApi.getAllAfkStatus($currentGuild.id);
        afkUsers = response.filter(user =>
          user.afkStatus !== null &&
          user.afkStatus !== undefined &&
          user.afkStatus.message !== "" &&
          user.afkStatus.message !== null &&
          user.afkStatus.message !== undefined
        );
      } catch (err) {
        logger.error("Failed to fetch AFK users:", err);
        error = err instanceof Error ? err.message : m.afk.fetchUsersFailed();
      } finally {
        loading = false;
      }
    }, "api", m.afk.loadingUsers());
  }

  function showClearAfkConfirm(userId: bigint) {
    if (!$currentGuild?.id) return;

    const user = afkUsers.find(u => u.userId === userId);
    const userName = user ? user.username : m.afk.fallbackUser();

    modalConfig = {
      title: m.afk.removeTitle(),
      message: m.afk.removeMessage({ name: userName }),
      confirmText: m.afk.removeConfirm(),
      variant: "warning",
      action: () => executeClearAfk(userId)
    };
    showConfirmModal = true;
  }

  async function executeClearAfk(userId: bigint) {
    try {
      if (!$currentGuild?.id) {
        throw new Error(m.common.noGuildSelected());
      }

      const user = afkUsers.find(u => u.userId === userId);
      const userName = user ? user.username : m.afk.fallbackUser();

      await afkApi.deleteAfkStatus($currentGuild.id, userId);
      showNotificationMessage(m.afk.notifyCleared({ name: userName }), "success");
      await fetchAfkUsers();
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : m.common.unknownError();
      logger.error("Failed to clear AFK status:", error);
      showNotificationMessage(m.afk.notifyClearFailed({ error: errorMsg }), "error");
    }
  }

  function toggleUserExpand(userId: bigint) {
    const userIdStr = userId.toString();
    expandedUser = expandedUser === userIdStr ? null : userIdStr;
  }


  $effect(() => {
    if ($currentInstance) {
      Promise.all([
        fetchAfkUsers(),
        fetchAfkSettings()
      ]);
    }
  });
  $effect(() => {
    if ($currentGuild) {
      fetchAfkUsers();
      fetchAfkSettings();
    }
  });
  $effect(() => {
    if ($currentInstance) {
      fetchAfkUsers();
      fetchAfkSettings();
    }
  });
  // Action buttons configuration
  let actionButtons = $derived([
    {
      label: m.common.refresh(),
      icon: "fa-arrows-rotate",
      action: async () => {
        loading = true;
        await autoSave.flush();
        await Promise.all([fetchAfkUsers(), fetchAfkSettings()]);
        loading = false;
      },
      loading: loading
    },
    ...(activeTab === "users" && selectedUsers.size > 0 ? [{
      label: m.afk.actionRemoveCount({ count: selectedUsers.size }),
      icon: "fa-user-minus",
      action: showBulkRemoveConfirm,
      loading: false,
      variant: "danger" as const
    }] : [])
  ]);
</script>

{#snippet statusMessageContent()}
  {#if showNotification}
    <div class="fixed top-4 right-4 z-50" transition:fade>
      <Notification message={notificationMessage} type={notificationType} />
    </div>
  {/if}
{/snippet}

<DashboardPageLayout
  {actionButtons}
  {autoSave}
  bind:activeTab
  guildName={$currentGuild?.name || m.common.dashboard()}
  icon="fa-clock"
  subtitle={m.afk.pageSubtitle()}
  {tabs}
  title={m.afk.pageTitle()}
  statusMessages={statusMessageContent}
>

  {#if activeTab === 'settings'}
    <!-- Basic Settings Section -->
    <section
      class=" rounded-2xl border p-6 shadow-2xl transition-all"
      style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15);
             border-color: {$colorStore.primary}30;"
    >
      <div class="flex items-center gap-3 mb-6">
        <div
          class="p-3 rounded-xl"
          style="background: linear-gradient(135deg, {$colorStore.primary}20, {$colorStore.secondary}20);
                 color: {$colorStore.primary};"
        >
          <i class="fa-utility-duo fa-regular fa-gear"
             style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary}; font-size: 24px;"></i>
        </div>
        <h2 class="text-xl font-bold" style="color: {$colorStore.text}">{m.afk.basicTitle()}</h2>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Auto-deletion Time -->
        <div
          class="rounded-xl p-4"
          style="background: {$colorStore.primary}10;"
        >
          <div class="flex items-center gap-2 mb-3">
            <i class="fa-utility-duo fa-regular fa-clock"
               style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary}; font-size: 20px;"></i>
            <h3 class="font-semibold" style="color: {$colorStore.text}">{m.afk.deletionTitle()}</h3>
          </div>
          <label for="afk-deletion-time" class="sr-only">{m.afk.deletionTitle()}</label>
          <input
            id="afk-deletion-time"
            bind:value={afkDeletionTime}
            class="w-full p-3 rounded-lg border transition-all duration-200"
            oninput={(e) => {
              e.currentTarget.setCustomValidity(isValidDeletionTime(afkDeletionTime) ? "" : m.afk.validationDeletion());
              saveDeletionTime();
            }}
            onblur={(e) => handleNumberBlur(e, "deletion")}
            style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30;
                   color: {$colorStore.text};
                   focus-visible:outline: none;
                   focus-visible:ring: 2px;
                   focus-visible:ring-color: {$colorStore.primary}50;"
            type="number"
            min="0"
            aria-label={m.afk.deletionAria()}
          >
          <p class="mt-2 text-sm" style="color: {$colorStore.muted}">
            {m.afk.deletionHint()}
          </p>
        </div>

        <!-- Max Message Length -->
        <div
          class="rounded-xl p-4"
          style="background: {$colorStore.primary}10;"
        >
          <div class="flex items-center gap-2 mb-3">
            <i class="fa-utility-duo fa-regular fa-comment"
               style="--fa-primary-color: {$colorStore.secondary}; --fa-secondary-color: {$colorStore.primary}; font-size: 20px;"></i>
            <h3 class="font-semibold" style="color: {$colorStore.text}">{m.afk.maxLengthTitle()}</h3>
          </div>
          <label for="afk-max-length" class="sr-only">{m.afk.maxLengthTitle()}</label>
          <input
            id="afk-max-length"
            bind:value={afkMaxLength}
            class="w-full p-3 rounded-lg border transition-all duration-200"
            oninput={(e) => {
              e.currentTarget.setCustomValidity(isValidMaxLength(afkMaxLength) ? "" : m.afk.validationMaxLength());
              saveMaxLength();
            }}
            onblur={(e) => handleNumberBlur(e, "maxLength")}
            style="background: {$colorStore.primary}08; border-color: {$colorStore.secondary}30;
                   color: {$colorStore.text};
                   focus-visible:outline: none;
                   focus-visible:ring: 2px;
                   focus-visible:ring-color: {$colorStore.secondary}50;"
            type="number"
            min="1"
            max="4096"
            aria-label={m.afk.maxLengthAria()}
          >
          <p class="mt-2 text-sm" style="color: {$colorStore.muted}">
            {m.afk.maxLengthHint()}
          </p>
        </div>

        <!-- AFK Type -->
        <div
          class="col-span-full rounded-xl p-4"
          style="background: {$colorStore.primary}10;"
        >
          <div class="flex items-center gap-2 mb-3">
            <i class="fa-utility-duo fa-regular fa-gear"
               style="--fa-primary-color: {$colorStore.accent}; --fa-secondary-color: {$colorStore.primary}; font-size: 20px;"></i>
            <h3 class="font-semibold" style="color: {$colorStore.text}">{m.afk.typeTitle()}</h3>
          </div>
          <label for="afk-type" class="sr-only">{m.afk.typeLabel()}</label>
          <DiscordSelector
            type="custom"
            options={afkTypeOptions}
            customIcon="fa-gear"
            placeholder={m.afk.typePlaceholder()}
            selected={afkType.toString()}
            onchange={(detail) => {
              if (detail.selected && typeof detail.selected === 'string') {
                const value = parseInt(detail.selected);
                if (!isNaN(value) && value !== afkType) saveType(value);
              }
            }}
          />
          <p class="mt-2 text-sm" style="color: {$colorStore.muted}">
            {m.afk.typeHint()}
          </p>
        </div>
      </div>

    </section>
  {/if}

  {#if activeTab === 'advanced'}
    <!-- Advanced Settings Section -->
    <section
      class=" rounded-2xl border p-6 shadow-2xl transition-all"
      style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15);
             border-color: {$colorStore.primary}30;"
    >
      <div class="flex items-center gap-3 mb-6">
        <div
          class="p-3 rounded-xl"
          style="background: linear-gradient(135deg, {$colorStore.primary}20, {$colorStore.secondary}20);
                 color: {$colorStore.primary};"
        >
          <i class="fa-utility-duo fa-regular fa-clock"
             style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary}; font-size: 24px;"></i>
        </div>
        <h2 class="text-xl font-bold" style="color: {$colorStore.text}">{m.afk.advancedTitle()}</h2>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- AFK Timeout -->
        <div
          class="rounded-xl p-4"
          style="background: {$colorStore.primary}10;"
        >
          <div class="flex items-center gap-2 mb-3">
            <i class="fa-utility-duo fa-regular fa-clock"
               style="--fa-primary-color: {$colorStore.secondary}; --fa-secondary-color: {$colorStore.primary}; font-size: 20px;"></i>
            <h3 class="font-semibold" style="color: {$colorStore.text}">{m.afk.timeoutTitle()}</h3>
          </div>
          <label for="afk-timeout" class="sr-only">{m.afk.timeoutTitle()}</label>
          <input
            id="afk-timeout"
            value={afkTimeout}
            class="w-full p-3 rounded-lg border transition-all duration-200"
            oninput={handleTimeoutInput}
            onblur={handleTimeoutBlur}
            style="background: {$colorStore.primary}08; border-color: {$colorStore.secondary}30;
                   color: {$colorStore.text};
                   focus-visible:outline: none;
                   focus-visible:ring: 2px;
                   focus-visible:ring-color: {$colorStore.secondary}50;"
            type="text"
            placeholder={m.afk.timeoutPlaceholder()}
            aria-label={m.afk.timeoutAria()}
          >
          <p class="mt-2 text-sm" style="color: {$colorStore.muted}">
            {m.afk.timeoutHint()}
          </p>
        </div>

        <!-- Disabled Channels -->
        <div
          class="rounded-xl p-4"
          style="background: {$colorStore.primary}10;"
        >
          <div class="flex items-center gap-2 mb-3">
            <i class="fa-utility-duo fa-regular fa-square"
               style="--fa-primary-color: {$colorStore.accent}; --fa-secondary-color: {$colorStore.primary}; font-size: 20px;"></i>
            <h3 class="font-semibold" style="color: {$colorStore.text}">{m.afk.channelsTitle()}</h3>
          </div>
          <label for="disabled-channels" class="sr-only">{m.afk.channelsTitle()}</label>
          <DiscordSelector
            type="channel"
            options={availableChannels}
            placeholder={m.afk.channelsPlaceholder()}
            multiple={true}
            selected={selectedDisabledChannels}
            onchange={handleDisabledChannelsChange}
          />
          <p class="mt-2 text-sm" style="color: {$colorStore.muted}">
            {m.afk.channelsHint()}
          </p>
        </div>

        <!-- Custom Message -->
        <div
          class="col-span-full rounded-xl p-4"
          style="background: {$colorStore.primary}10;"
        >
          <div class="flex items-center gap-2 mb-3">
            <i class="fa-utility-duo fa-regular fa-comment"
               style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary}; font-size: 20px;"></i>
            <h3 class="font-semibold" style="color: {$colorStore.text}">{m.afk.customTitle()}</h3>
          </div>

          <FullscreenEmbedBuilder
            bind:value={customAfkMessage}
            previewTitle={m.afk.customPreviewTitle()}
            previewDescription={m.afk.customPreviewDescription()}
            icon="fa-comment"
            allowContent={true}
            allowMultipleEmbeds={true}
            maxEmbeds={10}
            allowComponents={true}
            guildId={$currentGuild?.id}
            user={data.user}
            placeholder={m.afk.customPlaceholder()}
            onclose={saveCustomMessage}
          />

          <p class="mt-3 text-sm" style="color: {$colorStore.muted}">
            {@html m.afk.customHint({
              link: `<a href="http://mewdeko.tech/placeholders" target="_blank" rel="noopener" style="color: ${$colorStore.primary}; text-decoration: underline;">${m.afk.customHintLink()}</a>`
            })}
          </p>
        </div>
      </div>

    </section>
  {/if}

  {#if activeTab === 'users'}
    <!-- User Management Section -->
    <section
      class=" rounded-2xl border p-6 shadow-2xl transition-all"
      style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15);
             border-color: {$colorStore.primary}30;"
    >
      <div class="flex items-center justify-between mb-6">
        <div class="flex items-center gap-3">
          <div
            class="p-3 rounded-xl"
            style="background: linear-gradient(135deg, {$colorStore.primary}20, {$colorStore.secondary}20);
                   color: {$colorStore.primary};"
          >
            <i class="fa-utility-duo fa-regular fa-users"
               style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary}; font-size: 24px;"></i>
          </div>
          <h2 class="text-xl font-bold" style="color: {$colorStore.text}">{m.afk.usersTitle()}</h2>
        </div>

        <!-- Bulk Actions -->
        {#if afkUsers.length > 0}
          <div class="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
            <label class="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                bind:checked={selectAllUsers}
                onchange={toggleSelectAll}
                class="w-4 h-4 rounded-sm border shrink-0"
                style="accent-color: {$colorStore.primary};"
              >
              <span style="color: {$colorStore.text}" class="text-sm font-medium">
                {m.common.selectAllCount({ count: afkUsers.length })}
              </span>
            </label>

            {#if selectedUsers.size > 0}
              <button
                class="px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 w-full sm:w-auto"
                style="background: {$colorStore.accent}15;
                       color: {$colorStore.accent};
                       hover:background: {$colorStore.accent}20;"
                onclick={showBulkRemoveConfirm}
              >
                <i class="fa-utility-duo fa-regular fa-user-minus"
                   style="--fa-primary-color: {$colorStore.accent}; --fa-secondary-color: {$colorStore.primary}; font-size: 16px;"></i>
                <span class="sm:hidden">{m.afk.usersRemoveSelected({ count: selectedUsers.size })}</span>
                <span class="hidden sm:inline">{m.afk.actionRemoveCount({ count: selectedUsers.size })}</span>
              </button>
            {/if}
          </div>
        {/if}
      </div>

      {#if loading}
        <div class="flex justify-center items-center min-h-[200px]">
          <div
            class="w-12 h-12 border-4 rounded-full animate-spin"
            style="border-color: {$colorStore.primary}20;
                   border-top-color: {$colorStore.primary};"
          >
          </div>
        </div>
      {:else if error}
        <div
          class="rounded-xl p-4 flex items-center gap-3"
          style="background: {$colorStore.accent}10;"
          role="alert"
        >
          <i class="fa-utility-duo fa-regular fa-circle-exclamation"
             style="--fa-primary-color: {$colorStore.accent}; --fa-secondary-color: {$colorStore.primary}; font-size: 20px;"></i>
          <p style="color: {$colorStore.accent}">{error}</p>
        </div>
      {:else if afkUsers.length === 0}
        <div
          class="text-center py-12"
          transition:fade
        >
          <i class="fa-utility-duo fa-regular fa-users"
             style="--fa-primary-color: {$colorStore.muted}; --fa-secondary-color: {$colorStore.muted}; font-size: 48px; opacity: 0.5;"></i>
          <p style="color: {$colorStore.muted}">{m.afk.usersEmpty()}</p>
        </div>
      {:else}
        <div class="space-y-3">
          {#each afkUsers as user (user.userId)}
            <div
              class="rounded-xl border p-4 transition-all duration-200"
              style="background: {$colorStore.primary}10;
                     border-color: {selectedUsers.has(user.userId.toString()) ? $colorStore.primary : $colorStore.primary + '20'};
                     border-width: {selectedUsers.has(user.userId.toString()) ? '2px' : '1px'};"
            >
              <div class="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                <!-- Mobile-first layout -->
                <div class="flex items-center gap-3 grow min-w-0">
                  <input
                    type="checkbox"
                    checked={selectedUsers.has(user.userId.toString())}
                    onchange={() => toggleUserSelection(user.userId.toString())}
                    class="w-4 h-4 rounded-sm border shrink-0"
                    style="accent-color: {$colorStore.primary};"
                  >

                  <button
                    class="flex items-center gap-3 grow text-left transition-colors duration-200 rounded-lg p-2 min-w-0"
                    style="hover:background: {$colorStore.primary}15;"
                    onclick={() => toggleUserExpand(user.userId)}
                    aria-expanded={expandedUser === user.userId.toString()}
                    aria-controls="user-details-{user.userId}"
                  >
                    <img
                      src={user.avatarUrl}
                      alt=""
                      class="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 shrink-0"
                      style="border-color: {$colorStore.primary}30;"
                    >

                    <span class="grow min-w-0 flex flex-col gap-1">
                      <span class="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                        <span class="font-medium truncate" style="color: {$colorStore.text}">{user.username}</span>
                        <span class="flex flex-wrap gap-1">
                          {#if user.nickname}
                            <span class="text-xs px-2 py-1 rounded-sm"
                                  style="background: {$colorStore.secondary}15; color: {$colorStore.secondary}">
                              {user.nickname}
                            </span>
                          {/if}
                          {#if user.afkStatus?.wasTimed}
                            <span class="text-xs px-2 py-1 rounded-sm"
                                  style="background: {$colorStore.accent}15; color: {$colorStore.accent}">
                              {m.afk.badgeTimed()}
                            </span>
                          {/if}
                        </span>
                      </span>

                      <span class="space-y-1 text-sm flex flex-col">
                        <span class="truncate">
                          <span style="color: {$colorStore.muted}">{m.afk.labelMessage()}</span>
                          <span style="color: {$colorStore.text}"
                                class="ml-1">{user.afkStatus?.message || m.afk.noMessage()}</span>
                        </span>

                        <span class="hidden sm:grid sm:grid-cols-1 md:grid-cols-2 gap-2">
                          <span>
                            <span style="color: {$colorStore.muted}">{m.afk.labelSince()}</span>
                            <span style="color: {$colorStore.text}" class="ml-1">
                              {user.afkStatus?.dateAdded ? new Date(user.afkStatus.dateAdded).toLocaleDateString() : m.common.unknown()}
                            </span>
                          </span>

                          {#if user.afkStatus?.wasTimed}
                            <span>
                              <span style="color: {$colorStore.muted}">{m.afk.labelExpires()}</span>
                              <span style="color: {$colorStore.text}" class="ml-1">
                                {user.afkStatus?.when ? new Date(user.afkStatus.when).toLocaleDateString() : m.common.unknown()}
                              </span>
                            </span>
                          {:else}
                            <span>
                              <span style="color: {$colorStore.muted}">{m.afk.labelType()}</span>
                              <span style="color: {$colorStore.primary}" class="ml-1 font-medium">{m.afk.badgePermanent()}</span>
                            </span>
                          {/if}
                        </span>

                        <!-- Mobile summary -->
                        <span class="sm:hidden text-xs" style="color: {$colorStore.muted}">
                          {m.afk.summarySince({ date: user.afkStatus?.dateAdded ? new Date(user.afkStatus.dateAdded).toLocaleDateString() : m.common.unknown() })}
                          {#if user.afkStatus?.wasTimed}
                            • {m.afk.summaryExpires({ date: user.afkStatus?.when ? new Date(user.afkStatus.when).toLocaleDateString() : m.common.unknown() })}
                          {:else}
                            • {m.common.permanent()}
                          {/if}
                        </span>
                      </span>
                    </span>
                  </button>
                </div>

                <!-- Remove button -->
                <button
                  class="px-3 py-2 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 w-full sm:w-auto shrink-0"
                  style="background: {$colorStore.accent}15;
                         color: {$colorStore.accent};
                         hover:background: {$colorStore.accent}20;"
                  onclick={() => showClearAfkConfirm(user.userId)}
                >
                  <i class="fa-utility-duo fa-regular fa-user-minus"
                     style="--fa-primary-color: {$colorStore.accent}; --fa-secondary-color: {$colorStore.primary}; font-size: 16px;"></i>
                  <span class="sm:hidden">{m.afk.removeConfirm()}</span>
                  <span class="hidden sm:inline">{m.common.remove()}</span>
                </button>
              </div>

              <!-- Expanded Details -->
              {#if expandedUser === user.userId.toString()}
                <div
                  transition:slide
                  class="mt-4 pt-4 border-t"
                  style="border-color: {$colorStore.primary}20;"
                  id="user-details-{user.userId}"
                >
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <span style="color: {$colorStore.muted}" class="text-sm font-medium">{m.afk.detailsFullMessage()}</span>
                      <p style="color: {$colorStore.text}" class="font-medium break-words mt-1">
                        {user.afkStatus?.message || m.afk.noMessage()}
                      </p>
                    </div>

                    <div>
                      <span style="color: {$colorStore.muted}" class="text-sm font-medium">{m.afk.detailsTitle()}</span>
                      <div class="mt-1 space-y-1">
                        <p style="color: {$colorStore.text}" class="text-sm">
                          <span
                            class="font-medium">{m.afk.labelSince()}</span> {user.afkStatus?.dateAdded ? new Date(user.afkStatus.dateAdded).toLocaleString() : m.common.unknown()}
                        </p>
                        {#if user.afkStatus?.wasTimed}
                          <p style="color: {$colorStore.text}" class="text-sm">
                            <span
                              class="font-medium">{m.afk.labelExpires()}</span> {user.afkStatus?.when ? new Date(user.afkStatus.when).toLocaleString() : m.common.unknown()}
                          </p>
                        {/if}
                      </div>
                    </div>
                  </div>
                </div>
              {/if}
            </div>
          {/each}
        </div>

        <!-- Summary Stats -->
        <div class="mt-6 grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
          <div
            class="rounded-xl p-4 text-center"
            style="background: {$colorStore.primary}10;"
          >
            <div class="text-2xl font-bold" style="color: {$colorStore.primary}">{afkUsers.length}</div>
            <div class="text-sm" style="color: {$colorStore.muted}">{m.afk.statsTotal()}</div>
          </div>

          <div
            class="rounded-xl p-4 text-center"
            style="background: {$colorStore.secondary}10;"
          >
            <div class="text-2xl font-bold" style="color: {$colorStore.secondary}">
              {afkUsers.filter(u => u.afkStatus?.wasTimed).length}
            </div>
            <div class="text-sm" style="color: {$colorStore.muted}">{m.afk.statsTimed()}</div>
          </div>

          <div
            class="rounded-xl p-4 text-center"
            style="background: {$colorStore.accent}10;"
          >
            <div class="text-2xl font-bold" style="color: {$colorStore.accent}">{selectedUsers.size}</div>
            <div class="text-sm" style="color: {$colorStore.muted}">{m.common.selected()}</div>
          </div>
        </div>
      {/if}
    </section>
  {/if}
</DashboardPageLayout>

<!-- Confirmation Modal -->
<ConfirmationModal
  bind:isOpen={showConfirmModal}
  confirmText={modalConfig.confirmText}
  message={modalConfig.message}
  oncancel={() => showConfirmModal = false}
  onconfirm={() => modalConfig.action?.()}
  title={modalConfig.title}
  variant={modalConfig.variant}
/>

<style lang="postcss">
    @reference '../../../app.css'; /* Prevent iOS styling */

    /* Prevent blue highlight on iOS */

    /* Custom styling for options */
</style>