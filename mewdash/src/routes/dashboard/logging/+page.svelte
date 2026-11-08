<!-- routes/dashboard/logging/+page.svelte -->
<script lang="ts">
  import { m } from "$lib/i18n";
  import { goto } from "$app/navigation";
  import { fade } from "svelte/transition";
  import { clientApi, loggingApi, type LogType } from "$lib/api/index.ts";
  import { currentGuild } from "$lib/stores/currentGuild.ts";
  import { currentInstance } from "$lib/stores/instanceStore.ts";
  import { colorStore } from "$lib/stores/colorStore.ts";
  import { logger } from "$lib/logger.ts";
  import { requestConfirmation } from "$lib/stores/confirmationStore";
  import { createAutoSave } from "$lib/utils/autoSave.svelte";
  import Notification from "$lib/components/ui/Notification.svelte";
  import PluginPage from "$lib/components/plugin/PluginPage.svelte";
  import GroupCard from "./components/GroupCard.svelte";
  import IgnoreCard from "./components/IgnoreCard.svelte";
  import SetupCard from "./components/SetupCard.svelte";
  import { ALL_LOG_TYPES, errorText, LOG_GROUPS, type Named } from "./components/loggingModel";

  let channels: Named[] = $state([]);
  let routes: Record<string, string | null> = $state({});
  let ignored: string[] = $state([]);
  let ignoreBots = $state(true);
  let prefixes: string[] = $state([]);
  let loaded = $state(false);
  let showNotification = $state(false);
  let notificationMessage = $state("");
  let notificationType: "success" | "error" = $state("success");
  let loadedGuildId = "";

  const autoSave = createAutoSave({
    onError: (err) => notify(errorText(err, m.logging.pageErrorAutosave()), "error")
  });

  let guildId = $derived($currentGuild?.id ? BigInt($currentGuild.id) : null);
  const configured = $derived(ALL_LOG_TYPES.some(type => routes[type]));

  function notify(message: string, type: "success" | "error" = "success") {
    notificationMessage = message;
    notificationType = type;
    showNotification = true;
    setTimeout(() => {
      showNotification = false;
    }, 3000);
  }

  function idOf(value: unknown): string | null {
    return value === null || value === undefined || String(value) === "0" ? null : String(value);
  }

  async function loadConfig(id: bigint) {
    const config = await loggingApi.getLoggingConfig(id);
    const next: Record<string, string | null> = {};
    for (const type of ALL_LOG_TYPES) next[type] = idOf(config.logTypes?.[type]);
    routes = next;
    ignored = (config.ignoredChannels ?? []).map(String);
    ignoreBots = config.ignoreBots ?? true;
    prefixes = config.ignorePrefixes ?? [];
  }

  async function loadGuildData(id: bigint) {
    try {
      const [loadedChannels] = await Promise.all([clientApi.getTextChannels(id), loadConfig(id)]);
      channels = loadedChannels;
      loaded = true;
    } catch (err) {
      logger.error("Failed to load logging data:", err);
      notify(errorText(err, m.logging.pageErrorLoad()), "error");
    }
  }

  async function reload() {
    if (!guildId) return;
    const [loadedChannels] = await Promise.all([clientApi.getTextChannels(guildId), loadConfig(guildId)]);
    channels = loadedChannels;
  }

  function setRoutes(types: readonly LogType[], channelId: string | null) {
    const id = guildId;
    if (!id) return;
    const changed = types.filter(type => (routes[type] ?? null) !== channelId);
    if (changed.length === 0) return;
    const previous = Object.fromEntries(changed.map(type => [type, routes[type] ?? null]));
    routes = { ...routes, ...Object.fromEntries(changed.map(type => [type, channelId])) };
    const logTypeMappings = changed.map(type => ({ logType: type, channelId: channelId ? BigInt(channelId) : null }));
    void autoSave.now("routes", async () => {
      try {
        await loggingApi.bulkUpdateLogChannels(id, { logTypeMappings });
      } catch (err) {
        if (guildId === id) routes = { ...routes, ...previous };
        throw err;
      }
    });
  }

  function setIgnored(ids: string[]) {
    const id = guildId;
    if (!id) return;
    const previous = ignored;
    ignored = ids;
    void autoSave.now("ignored", async () => {
      try {
        await loggingApi.setIgnoredChannels(id, { channelIds: ids.map(x => BigInt(x)) });
      } catch (err) {
        if (guildId === id) ignored = previous;
        throw err;
      }
    });
  }

  function setIgnoreBots(value: boolean) {
    const id = guildId;
    if (!id) return;
    const previous = ignoreBots;
    ignoreBots = value;
    void autoSave.now("ignoreBots", async () => {
      try {
        await loggingApi.setIgnoreBots(id, value);
      } catch (err) {
        if (guildId === id) ignoreBots = previous;
        throw err;
      }
    });
  }

  function setPrefixes(next: string[]) {
    const id = guildId;
    if (!id) return;
    const previous = prefixes;
    prefixes = next;
    void autoSave.now("prefixes", async () => {
      try {
        await loggingApi.setIgnorePrefixes(id, next);
      } catch (err) {
        if (guildId === id) prefixes = previous;
        throw err;
      }
    });
  }

  async function disableAll() {
    const id = guildId;
    if (!id) return;
    const confirmed = await requestConfirmation({
      title: m.logging.pageConfirmDisableTitle(),
      message: m.logging.pageConfirmDisableMessage(),
      confirmText: m.common.disableAll()
    });
    if (!confirmed) return;
    try {
      await autoSave.flush();
      await loggingApi.disableAllLogging(id);
      await loadConfig(id);
    } catch (err) {
      logger.error("Failed to disable all logging:", err);
      notify(errorText(err, m.logging.pageErrorDisable()), "error");
    }
  }

  const actionButtons = $derived(
    configured ? [{ label: m.common.disableAll(), icon: "fa-power-off", action: disableAll }] : []
  );

  $effect(() => {
    if (!$currentGuild) {
      void goto("/dashboard");
      return;
    }
    if ($currentGuild.icon) {
      const serverIconUrl = `https://cdn.discordapp.com/icons/${$currentGuild.id}/${$currentGuild.icon}.${$currentGuild.icon.startsWith("a_") ? "gif" : "png"}`;
      colorStore.extractFromServerIcon(serverIconUrl);
    } else if ($currentInstance?.botAvatar) {
      colorStore.extractFromImage($currentInstance.botAvatar);
    }
    if (loadedGuildId !== $currentGuild.id.toString()) {
      loadedGuildId = $currentGuild.id.toString();
      loaded = false;
      void loadGuildData(BigInt($currentGuild.id));
    }
  });
</script>

<svelte:head>
  <title>{m.logging.pageTitle()}</title>
</svelte:head>

{#snippet statusMessages()}
  {#if showNotification}
    <div class="fixed top-4 right-4 z-[10001]" transition:fade>
      <Notification message={notificationMessage} type={notificationType} />
    </div>
  {/if}
{/snippet}

<PluginPage
  {statusMessages}
  {autoSave}
  {actionButtons}
  icon="fa-file"
  guildName={$currentGuild?.name || m.common.dashboard()}
  title={m.logging.pageTitle()}
  subtitle={m.logging.pageSubtitle()}
>
  {#if guildId}
    {#key guildId}
      {#if !loaded}
        <div class="flex justify-center py-10">
          <div class="w-10 h-10 border-4 rounded-full animate-spin" style="border-color: {$colorStore.primary}20; border-top-color: {$colorStore.primary}"></div>
        </div>
      {:else}
        <div class="space-y-4 min-w-0">
          <SetupCard
            {guildId}
            {configured}
            onchanged={reload}
            onerror={(message) => notify(message, "error")}
            onsuccess={(message) => notify(message)}
          />
          {#each LOG_GROUPS as group (group.id)}
            <GroupCard id={group.id} types={group.types} {routes} {channels} onset={setRoutes} />
          {/each}
          <IgnoreCard
            {channels}
            {ignored}
            {ignoreBots}
            {prefixes}
            onignored={setIgnored}
            onbots={setIgnoreBots}
            onprefixes={setPrefixes}
          />
        </div>
      {/if}
    {/key}
  {/if}
</PluginPage>
