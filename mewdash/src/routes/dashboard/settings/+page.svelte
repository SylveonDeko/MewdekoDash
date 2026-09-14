<!-- routes/dashboard/settings/+page.svelte -->
<script lang="ts">
  import { onMount } from "svelte";
  import { guildApi, clientApi, administrationApi, type GuildConfig } from "$lib/api/index.ts";
  import { currentGuild } from "$lib/stores/currentGuild";
  import { fade } from "svelte/transition";
  import { goto } from "$app/navigation";
  import Notification from "$lib/components/ui/Notification.svelte";
  import { colorStore } from "$lib/stores/colorStore";
  import { logger } from "$lib/logger";
  import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";
  import DashboardPageLayout from "$lib/components/layout/DashboardPageLayout.svelte";

  let guildConfig: GuildConfig | null = null;
  let loading = $state(true);
  let error: string | null = $state(null);
  let showNotification = $state(false);
  let notificationMessage = $state("");
  let notificationType: "success" | "error" = $state("success");
  let channels: Array<{ id: string; name: string }> = $state([]);

  // Only track settings that are unique to this page
  let settings = $state({
    prefix: ".",
    commandLogChannel: "0",
    currencyEmoji: "💰",
    warnlogChannelId: "0",
    warnExpireHours: 0,
    locale: "",
    snipeset: false,
    previewLinks: false,
    muteRoleName: "",
    removeRolesOnMute: false
  });

  /** Languages the bot ships response strings for */
  const languageOptions = [
    { id: "", name: "Bot default" },
    { id: "en-US", name: "English" },
    { id: "ar", name: "العربية (Arabic)" },
    { id: "cs-CZ", name: "Čeština (Czech)" },
    { id: "da-DK", name: "Dansk (Danish)" },
    { id: "de-DE", name: "Deutsch (German)" },
    { id: "es-ES", name: "Español (Spanish)" },
    { id: "fr-FR", name: "Français (French)" },
    { id: "he-IL", name: "עברית (Hebrew)" },
    { id: "hi-IN", name: "हिन्दी (Hindi)" },
    { id: "hu-HU", name: "Magyar (Hungarian)" },
    { id: "id-ID", name: "Bahasa Indonesia" },
    { id: "it-IT", name: "Italiano (Italian)" },
    { id: "ja-JP", name: "日本語 (Japanese)" },
    { id: "ko-KR", name: "한국어 (Korean)" },
    { id: "nb-NO", name: "Norsk (Norwegian)" },
    { id: "nl-NL", name: "Nederlands (Dutch)" },
    { id: "pl-PL", name: "Polski (Polish)" },
    { id: "pt-BR", name: "Português (Brazil)" },
    { id: "ro-RO", name: "Română (Romanian)" },
    { id: "ru-RU", name: "Русский (Russian)" },
    { id: "sr-RS", name: "Srpski (Serbian)" },
    { id: "sv-SE", name: "Svenska (Swedish)" },
    { id: "tr-TR", name: "Türkçe (Turkish)" },
    { id: "uk-UA", name: "Українська (Ukrainian)" },
    { id: "zh-CN", name: "简体中文 (Chinese, Simplified)" },
    { id: "zh-TW", name: "繁體中文 (Chinese, Traditional)" },
    { id: "owo", name: "OwO" }
  ];

  /** Server timezone state, saved separately from the guild config */
  let timezones: Array<{ id: string; name: string; label: string; offset: string; value: string }> = $state([]);
  let guildTimezone = $state<string | null>(null);
  let timezoneSaving = $state(false);

  async function fetchTimezone() {
    try {
      if (!$currentGuild?.id) return;
      const [list, current] = await Promise.all([
        administrationApi.getTimezones($currentGuild.id).catch(() => []),
        administrationApi.getGuildTimezone($currentGuild.id).catch(() => null)
      ]);
      timezones = (list || []).map(tz => ({ id: tz.id, name: tz.displayName, label: tz.displayName, offset: tz.offset, value: tz.id }));
      guildTimezone = current || null;
    } catch (err) {
      logger.error("Failed to fetch timezone:", err);
    }
  }

  async function saveTimezone(timezoneId: string | null) {
    if (!$currentGuild?.id || !timezoneId) return;
    timezoneSaving = true;
    try {
      await administrationApi.setGuildTimezone($currentGuild.id, { timezoneId });
      guildTimezone = timezoneId;
    } catch (err) {
      logger.error("Failed to save timezone:", err);
      showNotificationMessage("Failed to save timezone", "error");
    } finally {
      timezoneSaving = false;
    }
  }

  function showNotificationMessage(message: string, type: "success" | "error" = "success") {
    notificationMessage = message;
    notificationType = type;
    showNotification = true;
    setTimeout(() => {
      showNotification = false;
    }, 3000);
  }

  async function fetchGuildSettings() {
    try {
      if (!$currentGuild?.id) return;
      const config = await guildApi.getGuildConfig($currentGuild.id);
      guildConfig = config;

      // Update local settings - only properties shown in this page
      settings = {
        prefix: config.prefix || ".",
        commandLogChannel: config.commandLogChannel?.toString() || "0",
        currencyEmoji: config.currencyEmoji || "💰",
        warnlogChannelId: config.warnlogChannelId?.toString() || "0",
        warnExpireHours: config.warnExpireHours,
        locale: config.locale || "",
        snipeset: Boolean(config.snipeset),
        previewLinks: config.previewLinks === 1,
        muteRoleName: config.muteRoleName || "",
        removeRolesOnMute: config.removeroles === 1
      };
    } catch (err) {
      logger.error("Failed to fetch guild settings:", err);
      error = err instanceof Error ? err.message : "Failed to fetch guild settings";
    }
  }

  async function fetchChannels() {
    try {
      if (!$currentGuild?.id) return;
      channels = await clientApi.getTextChannels($currentGuild.id);
    } catch (err) {
      logger.error("Failed to fetch channels:", err);
    }
  }

  async function updateSettings() {
    try {
      if (!$currentGuild?.id || !guildConfig) return;

      // Create updated config - only update the settings shown in this page
      const updatedConfig: GuildConfig = {
        ...guildConfig,
        prefix: settings.prefix,
        commandLogChannel: settings.commandLogChannel === "0" ? BigInt(0) : BigInt(settings.commandLogChannel),
        currencyEmoji: settings.currencyEmoji,
        warnlogChannelId: settings.warnlogChannelId === "0" ? BigInt(0) : BigInt(settings.warnlogChannelId),
        warnExpireHours: settings.warnExpireHours,
        locale: settings.locale || null,
        snipeset: settings.snipeset,
        previewLinks: settings.previewLinks ? 1 : 0,
        muteRoleName: settings.muteRoleName.trim() || null,
        removeroles: settings.removeRolesOnMute ? 1 : 0
      };

      await guildApi.updateGuildConfig($currentGuild.id, updatedConfig);
      showNotificationMessage("Settings updated successfully");
      await fetchGuildSettings();
    } catch (err) {
      logger.error("Failed to update settings:", err);
      showNotificationMessage("Failed to update settings", "error");
    }
  }

  function handleCommandLogChannelChange(detail: any) {
    settings.commandLogChannel = detail.selected || "0";
  }

  function handleWarnlogChannelChange(detail: any) {
    settings.warnlogChannelId = detail.selected || "0";
  }

  $effect(() => {
    if ($currentGuild) {
      fetchGuildSettings();
      fetchChannels();
      fetchTimezone();
    }
  });

  onMount(async () => {
    if (!$currentGuild) await goto("/dashboard");
    loading = true;
    try {
      await Promise.all([
        fetchGuildSettings(),
        fetchChannels()
      ]);
    } catch (err) {
      error = "Failed to fetch data";
      logger.error(error, err);
    } finally {
      loading = false;
    }
  });
</script>

{#snippet statusMessages()}
  {#if showNotification}
    <div class="fixed top-4 right-4 z-50" transition:fade>
      <Notification message={notificationMessage} type={notificationType} />
    </div>
  {/if}
{/snippet}

<DashboardPageLayout
  actionButtons={[
    {
      label: "Save Changes",
      icon: "fa-floppy-disk",
      action: updateSettings,
      loading: false
    }
  ]}
  statusMessages={statusMessages}
  icon="fa-gear"
  guildName={$currentGuild?.name || "Dashboard"}
  subtitle="Configure bot-wide settings for your server"
  title="Bot Settings"
>

  {#if loading}
    <div class="flex justify-center items-center min-h-[200px]">
      <div
        class="w-12 h-12 border-4 rounded-full animate-spin"
        style="border-color: {$colorStore.primary}20;
               border-top-color: {$colorStore.primary};">
      </div>
    </div>
  {:else if error}
    <div
      class="rounded-xl p-4 flex items-center gap-3"
      style="background: {$colorStore.accent}10;"
      role="alert"
    >
      <i class="fa-utility-duo fa-regular fa-circle-exclamation"
         style="--fa-primary-color: {$colorStore.accent}; --fa-secondary-color: {$colorStore.secondary}; font-size: 20px;"></i>
      <p style="color: {$colorStore.accent}">{error}</p>
    </div>
  {:else}
    <div class="space-y-6">
      <!-- Bot Configuration -->
      <div class="rounded-2xl border p-6 shadow-2xl"
           style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15);
                  border-color: {$colorStore.primary}30;">
        <div class="flex items-center gap-3 mb-6">
          <div class="p-3 rounded-xl"
               style="background: linear-gradient(135deg, {$colorStore.primary}20, {$colorStore.secondary}20);">
            <i class="fa-utility-duo fa-regular fa-gear"
               style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary}; font-size: 24px;"></i>
          </div>
          <h2 class="text-xl font-bold" style="color: {$colorStore.text}">Bot Configuration</h2>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Prefix -->
          <div class="rounded-xl p-4" style="background: {$colorStore.primary}10;">
            <div class="flex items-center gap-2 mb-3">
              <i class="fa-solid fa-terminal" style="color: {$colorStore.primary}; font-size: 20px;"></i>
              <h3 class="font-semibold" style="color: {$colorStore.text}">Command Prefix</h3>
            </div>
            <p class="text-sm mb-3" style="color: {$colorStore.muted}">
              The prefix used to invoke bot commands
            </p>
            <input
              type="text"
              bind:value={settings.prefix}
              class="w-full p-3 rounded-lg border transition-all"
              style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
              placeholder="."
            >
          </div>

          <!-- Command Log Channel -->
          <div class="rounded-xl p-4" style="background: {$colorStore.primary}10;">
            <div class="flex items-center gap-2 mb-3">
              <i class="fa-solid fa-list" style="color: {$colorStore.secondary}; font-size: 20px;"></i>
              <h3 class="font-semibold" style="color: {$colorStore.text}">Command Log Channel</h3>
            </div>
            <p class="text-sm mb-3" style="color: {$colorStore.muted}">
              Channel where command usage is logged
            </p>
            <DiscordSelector
              type="channel"
              options={channels}
              bind:selected={settings.commandLogChannel}
              placeholder="No command logging"
              onchange={handleCommandLogChannelChange}
            />
          </div>

          <!-- Currency Emoji -->
          <div class="rounded-xl p-4" style="background: {$colorStore.primary}10;">
            <div class="flex items-center gap-2 mb-3">
              <i class="fa-solid fa-coins" style="color: {$colorStore.primary}; font-size: 20px;"></i>
              <h3 class="font-semibold" style="color: {$colorStore.text}">Currency Emoji</h3>
            </div>
            <p class="text-sm mb-3" style="color: {$colorStore.muted}">
              The emoji displayed for your server currency
            </p>
            <input
              type="text"
              bind:value={settings.currencyEmoji}
              class="w-full p-3 rounded-lg border transition-all"
              style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
              placeholder="💰"
            >
          </div>

          <!-- Warnlog Channel -->
          <div class="rounded-xl p-4" style="background: {$colorStore.primary}10;">
            <div class="flex items-center gap-2 mb-3">
              <i class="fa-solid fa-triangle-exclamation" style="color: {$colorStore.accent}; font-size: 20px;"></i>
              <h3 class="font-semibold" style="color: {$colorStore.text}">Warning Log Channel</h3>
            </div>
            <p class="text-sm mb-3" style="color: {$colorStore.muted}">
              Channel where warnings are logged
            </p>
            <DiscordSelector
              type="channel"
              options={channels}
              bind:selected={settings.warnlogChannelId}
              placeholder="No warning logging"
              onchange={handleWarnlogChannelChange}
            />
          </div>

          <!-- Warn Expire Hours -->
          <div class="rounded-xl p-4" style="background: {$colorStore.primary}10;">
            <div class="flex items-center gap-2 mb-3">
              <i class="fa-solid fa-clock" style="color: {$colorStore.secondary}; font-size: 20px;"></i>
              <h3 class="font-semibold" style="color: {$colorStore.text}">Warning Expiry</h3>
            </div>
            <p class="text-sm mb-3" style="color: {$colorStore.muted}">
              Hours until warnings automatically expire (0 = never)
            </p>
            <input
              type="number"
              bind:value={settings.warnExpireHours}
              min="0"
              class="w-full p-3 rounded-lg border transition-all"
              style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
              placeholder="0"
            >
          </div>

          <!-- Language -->
          <div class="rounded-xl p-4" style="background: {$colorStore.primary}10;">
            <div class="flex items-center gap-2 mb-3">
              <i class="fa-solid fa-language" style="color: {$colorStore.primary}; font-size: 20px;"></i>
              <h3 id="language-label" class="font-semibold" style="color: {$colorStore.text}">Language</h3>
            </div>
            <p class="text-sm mb-3" style="color: {$colorStore.muted}">
              Language the bot replies in for this server
            </p>
            <DiscordSelector
              type="custom"
              options={languageOptions}
              selected={settings.locale}
              placeholder="Bot default"
              ariaLabelledby="language-label"
              onchange={(e) => { settings.locale = typeof e.selected === "string" ? e.selected : ""; }}
            />
          </div>

          <!-- Timezone -->
          <div class="rounded-xl p-4" style="background: {$colorStore.primary}10;">
            <div class="flex items-center gap-2 mb-3">
              <i class="fa-solid fa-earth-americas" style="color: {$colorStore.secondary}; font-size: 20px;"></i>
              <h3 id="timezone-label" class="font-semibold" style="color: {$colorStore.text}">Server Timezone</h3>
            </div>
            <p class="text-sm mb-3" style="color: {$colorStore.muted}">
              Used for scheduled messages, reminders and time displays. Saves immediately.
            </p>
            <DiscordSelector
              type="timezone"
              options={timezones}
              selected={guildTimezone}
              placeholder={timezones.length ? "Select timezone" : "Loading timezones..."}
              ariaLabelledby="timezone-label"
              disabled={timezoneSaving || timezones.length === 0}
              onchange={(e) => saveTimezone(typeof e.selected === "string" ? e.selected : null)}
            />
          </div>

          <!-- Mute role -->
          <div class="rounded-xl p-4" style="background: {$colorStore.primary}10;">
            <div class="flex items-center gap-2 mb-3">
              <i class="fa-solid fa-volume-xmark" style="color: {$colorStore.accent}; font-size: 20px;"></i>
              <h3 class="font-semibold" style="color: {$colorStore.text}">Mute Role</h3>
            </div>
            <p class="text-sm mb-3" style="color: {$colorStore.muted}">
              Name of the role applied by mute commands and punishments. Created automatically if missing.
            </p>
            <input
              type="text"
              bind:value={settings.muteRoleName}
              maxlength="100"
              class="w-full p-3 rounded-lg border transition-all"
              style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
              placeholder="Muted"
            >
            <label class="flex items-center gap-3 mt-3 cursor-pointer min-h-[32px]" style="color: {$colorStore.text};">
              <input type="checkbox" bind:checked={settings.removeRolesOnMute} class="w-4 h-4 rounded" style="accent-color: {$colorStore.primary};">
              <span class="text-sm">Remove all other roles while muted</span>
            </label>
          </div>

          <!-- Chat utilities -->
          <div class="rounded-xl p-4" style="background: {$colorStore.primary}10;">
            <div class="flex items-center gap-2 mb-3">
              <i class="fa-solid fa-comments" style="color: {$colorStore.primary}; font-size: 20px;"></i>
              <h3 class="font-semibold" style="color: {$colorStore.text}">Chat Utilities</h3>
            </div>
            <div class="space-y-3">
              <label class="flex items-start gap-3 cursor-pointer" style="color: {$colorStore.text};">
                <input type="checkbox" bind:checked={settings.snipeset} class="w-4 h-4 rounded mt-0.5" style="accent-color: {$colorStore.primary};">
                <span>
                  <span class="text-sm font-medium block">Message sniping</span>
                  <span class="text-xs" style="color: {$colorStore.muted}">Let members recover recently deleted or edited messages with the snipe commands</span>
                </span>
              </label>
              <label class="flex items-start gap-3 cursor-pointer" style="color: {$colorStore.text};">
                <input type="checkbox" bind:checked={settings.previewLinks} class="w-4 h-4 rounded mt-0.5" style="accent-color: {$colorStore.primary};">
                <span>
                  <span class="text-sm font-medium block">Message link previews</span>
                  <span class="text-xs" style="color: {$colorStore.muted}">Show the contents of Discord message links when they are posted</span>
                </span>
              </label>
            </div>
          </div>
        </div>
      </div>

      <!-- Info Note -->
      <div class="rounded-xl p-4 border"
           style="background: {$colorStore.secondary}08; border-color: {$colorStore.secondary}30;">
        <div class="flex items-start gap-3">
          <i class="fa-solid fa-circle-info" style="color: {$colorStore.secondary}; font-size: 20px;"></i>
          <div>
            <h3 class="font-semibold mb-1" style="color: {$colorStore.text}">More Settings Available</h3>
            <p class="text-sm" style="color: {$colorStore.muted}">
              Additional settings like roles, permissions, and module-specific configurations can be found in their
              respective dashboard pages:
              <strong>Administration</strong>, <strong>Message Stats</strong>, <strong>Starboard</strong>, and more.
            </p>
          </div>
        </div>
      </div>
    </div>
  {/if}
</DashboardPageLayout>

<style lang="postcss">
    /* Remove number input spinners */
    input[type="number"]::-webkit-inner-spin-button,
    input[type="number"]::-webkit-outer-spin-button {
        -webkit-appearance: none;
        margin: 0;
    }

    input[type="number"] {
        appearance: textfield;
    }
</style>
