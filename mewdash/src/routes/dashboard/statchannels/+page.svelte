<!-- routes/dashboard/statchannels/+page.svelte -->
<script lang="ts">
  import { m } from "$lib/i18n";
  import { goto } from "$app/navigation";
  import { page } from "$app/state";
  import { fade } from "svelte/transition";
  import { colorStore } from "$lib/stores/colorStore";
  import { currentGuild } from "$lib/stores/currentGuild";
  import { currentInstance } from "$lib/stores/instanceStore";
  import {
    clientApi,
    countingApi,
    minecraftApi,
    statChannelsApi,
    type StatChannel,
    type StatChannelMetadata,
    type StatChannelSettings
  } from "$lib/api/index.ts";
  import { logger } from "$lib/logger";
  import { createAutoSave } from "$lib/utils/autoSave.svelte";
  import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";
  import PluginPage from "$lib/components/plugin/PluginPage.svelte";
  import PluginCard from "$lib/components/plugin/PluginCard.svelte";
  import ConfirmationModal from "$lib/components/ui/ConfirmationModal.svelte";
  import Notification from "$lib/components/ui/Notification.svelte";
  import ChannelSheet from "./components/ChannelSheet.svelte";
  import { MAX_INTERVAL, TABS, isValidInterval, type Named, type TabId } from "./components/statModel";

  const autoSave = createAutoSave({
    onError: () => notify(m.statchannels.notifySaveFailed(), "error")
  });

  let loading = $state(false);
  let showNotification = $state(false);
  let notificationMessage = $state("");
  let notificationType: "success" | "error" = $state("success");

  let statChannels: StatChannel[] = $state([]);
  let metadata = $state<StatChannelMetadata | null>(null);
  let settings: StatChannelSettings = $state({ defaultMechanism: 2, defaultIntervalMinutes: 5, defaultDisplayStyle: 1 });
  let savedSettings: StatChannelSettings = { defaultMechanism: 2, defaultIntervalMinutes: 5, defaultDisplayStyle: 1 };

  let voiceChannels: Named[] = $state([]);
  let roles: Named[] = $state([]);
  let categories: Named[] = $state([]);
  let countingChannels: Named[] = $state([]);
  let minecraftServers: Named[] = $state([]);

  let sheetOpen = $state(false);
  let sheetChannel: StatChannel | null = $state(null);
  let sheetType: number | null = $state(null);
  let sheetKey = $state(0);

  let removeTarget: StatChannel | null = $state(null);
  let removeModalOpen = $state(false);
  let counterSearch = $state("");
  let loadedGuildId = "";

  const tabs = $derived([
    { id: "channels", label: m.statchannels.tabChannels(), icon: "fa-chart-simple" },
    { id: "defaults", label: m.statchannels.tabDefaults(), icon: "fa-sliders" },
    { id: "counters", label: m.statchannels.tabCounters(), icon: "fa-list" }
  ]);

  const activeTab: TabId = $derived.by(() => {
    const requested = page.url.searchParams.get("tab");
    return TABS.find((id) => id === requested) ?? "channels";
  });

  const mechanismLabels = $derived<Record<number, string>>({
    0: m.statchannels.mechanismRenameLabel(),
    1: m.statchannels.mechanismRecreateLabel(),
    2: m.statchannels.mechanismAutoLabel()
  });
  const mechanismOptions = $derived(
    (metadata?.mechanisms ?? []).map((mech) => ({ id: String(mech.mechanism), name: mechanismLabels[mech.mechanism] ?? mech.name }))
  );
  const styleOptions = $derived(
    (metadata?.displayStyles ?? []).map((s) => ({ id: String(s.style), name: `${s.name}: ${s.example}` }))
  );

  const filteredCounters = $derived.by(() => {
    const term = counterSearch.trim().toLowerCase();
    const all = metadata?.statTypes ?? [];
    return term
      ? all.filter((t) => `${t.name} ${t.category} ${t.description}`.toLowerCase().includes(term))
      : all;
  });
  const counterCategories = $derived([...new Set(filteredCounters.map((t) => t.category))]);

  const actionButtons = $derived([{ label: m.common.refresh(), icon: "fa-arrows-rotate", action: loadData, loading }]);

  function notify(message: string, type: "success" | "error" = "success") {
    notificationMessage = message;
    notificationType = type;
    showNotification = true;
    setTimeout(() => {
      showNotification = false;
    }, 3000);
  }

  function selectTab(id: TabId) {
    if (id === activeTab) return;
    void autoSave.flush();
    const url = new URL(page.url);
    url.search = "";
    url.searchParams.set("tab", id);
    void goto(url, { replaceState: true, noScroll: true, keepFocus: true });
  }

  const toNamed = (list: any[] | null | undefined, idKey = "id", nameKey = "name"): Named[] =>
    (list ?? []).map((c: any) => ({ id: String(c[idKey]), name: c[nameKey] || String(c[idKey]) }));

  async function loadData() {
    if (!$currentGuild?.id) return;
    const guildId = BigInt($currentGuild.id);
    loading = true;
    try {
      const [channelsData, metaData, settingsData, voiceData, rolesData, catData, countingData, mcData] =
        await Promise.all([
          statChannelsApi.getStatChannels(guildId).catch(() => []),
          statChannelsApi.getMetadata(guildId).catch(() => null),
          statChannelsApi.getSettings(guildId).catch(() => null),
          clientApi.getVoiceChannels(guildId).catch(() => []),
          clientApi.getRoles(guildId).catch(() => []),
          clientApi.getChannelsByType(guildId, 2).catch(() => []),
          countingApi.getCountingChannels(guildId).catch(() => []),
          minecraftApi.getServers(guildId).catch(() => [])
        ]);

      statChannels = channelsData ?? [];
      metadata = metaData;
      if (settingsData) {
        settings = settingsData;
        savedSettings = { ...settingsData };
      }
      voiceChannels = toNamed(voiceData);
      categories = toNamed(catData);
      countingChannels = toNamed(countingData, "channelId", "channelName");
      minecraftServers = toNamed(mcData);
      roles = toNamed(
        (rolesData ?? []).filter((r: any) => !r.managed && !r.name.startsWith("@"))
      ).sort((a, b) => a.name.localeCompare(b.name));
    } catch (err) {
      logger.error("Failed to load stat channel data:", err);
      notify(m.common.failedToLoadData(), "error");
    } finally {
      loading = false;
    }
  }

  let refreshTimer: ReturnType<typeof setTimeout> | undefined;

  /** The bot refreshes a channel in the background after each edit, possibly recreating it under a new ID. */
  function refreshChannelsSoon(delay = 4000) {
    if (!$currentGuild?.id) return;
    const guildId = BigInt($currentGuild.id);
    clearTimeout(refreshTimer);
    refreshTimer = setTimeout(async () => {
      try {
        const channels = await statChannelsApi.getStatChannels(guildId);
        if ($currentGuild?.id && BigInt($currentGuild.id) === guildId) statChannels = channels ?? [];
      } catch (err) {
        logger.error("Failed to refresh stat channels:", err);
      }
    }, delay);
  }

  function openSheet(channel: StatChannel | null, type: number | null = null) {
    sheetChannel = channel;
    sheetType = type;
    sheetKey++;
    sheetOpen = true;
  }

  function closeSheet() {
    sheetOpen = false;
    refreshChannelsSoon(1500);
  }

  function confirmRemove(sc: StatChannel) {
    removeTarget = sc;
    removeModalOpen = true;
  }

  async function removeStatChannel() {
    if (!$currentGuild?.id || !removeTarget) return;
    try {
      await statChannelsApi.removeStatChannel(BigInt($currentGuild.id), removeTarget.channelId);
      notify(m.statchannels.notifyRemoved());
      await loadData();
    } catch {
      notify(m.statchannels.notifyRemoveFailed(), "error");
    } finally {
      removeTarget = null;
    }
  }

  function setDefaultSelect(field: "defaultMechanism" | "defaultDisplayStyle", value: number) {
    if (!$currentGuild?.id) return;
    const guildId = BigInt($currentGuild.id);
    const previous = savedSettings[field];
    settings[field] = value;

    autoSave.now(field, async () => {
      try {
        await statChannelsApi.updateSettings(guildId, { [field]: value });
        savedSettings[field] = value;
      } catch (err) {
        settings[field] = previous;
        throw err;
      }
    });
  }

  function saveDefaultInterval(event: Event) {
    const raw = (event.currentTarget as HTMLInputElement).value;
    const value = raw.trim() === "" ? NaN : Math.floor(Number(raw));
    settings.defaultIntervalMinutes = value;
    if (!isValidInterval(value, 1) || !$currentGuild?.id) return;
    const guildId = BigInt($currentGuild.id);
    const previous = savedSettings.defaultIntervalMinutes;

    autoSave.schedule("defaultIntervalMinutes", async () => {
      try {
        await statChannelsApi.updateSettings(guildId, { defaultIntervalMinutes: value });
        savedSettings.defaultIntervalMinutes = value;
      } catch (err) {
        settings.defaultIntervalMinutes = previous;
        throw err;
      }
    });
  }

  $effect(() => {
    if (!$currentGuild) {
      void goto("/dashboard");
      return;
    }
    if ($currentGuild.icon) {
      const iconUrl = `https://cdn.discordapp.com/icons/${$currentGuild.id}/${$currentGuild.icon}.${$currentGuild.icon.startsWith("a_") ? "gif" : "png"}`;
      colorStore.extractFromServerIcon(iconUrl);
    } else if ($currentInstance?.botAvatar) {
      colorStore.extractFromImage($currentInstance.botAvatar);
    }
    if (loadedGuildId !== $currentGuild.id.toString()) {
      loadedGuildId = $currentGuild.id.toString();
      void loadData();
    }
  });

  $effect(() => () => clearTimeout(refreshTimer));
</script>

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
  icon="fa-chart-simple"
  guildName={$currentGuild?.name || m.common.dashboard()}
  title={m.features.statchannelsName()}
  subtitle={m.statchannels.pageSubtitle()}
>
  <div class="grid grid-cols-2 sm:grid-cols-3 gap-2 [&>:last-child:nth-child(odd)]:col-span-2 sm:[&>:last-child:nth-child(odd)]:col-span-1" role="group" aria-label={m.statchannels.tabsAria()}>
    {#each tabs as tab (tab.id)}
      {@const selected = activeTab === tab.id}
      <button
        type="button"
        class="min-h-[44px] px-2 rounded-lg border text-sm font-medium flex items-center justify-center gap-2"
        style="background: {selected ? $colorStore.selectedSurface : `${$colorStore.primary}08`}; border-color: {selected ? $colorStore.selectedBorder : `${$colorStore.primary}20`}; color: {$colorStore.text};"
        aria-pressed={selected}
        onclick={() => selectTab(tab.id as TabId)}
      >
        <i class="fa-solid {tab.icon}" aria-hidden="true"></i>
        {tab.label}
      </button>
    {/each}
  </div>

  {#if activeTab === "channels"}
    <PluginCard title={m.statchannels.tabChannels()} alwaysOpen>
      {#snippet actions()}
        <button
          type="button"
          class="flex items-center justify-center gap-2 px-5 rounded-xl min-h-[50px] font-medium disabled:opacity-50"
          style="background: {$colorStore.primary}20; color: {$colorStore.text}; border: 1px solid {$colorStore.primary}30;"
          disabled={!metadata}
          onclick={() => openSheet(null)}
        >
          <i class="fa-solid fa-plus" aria-hidden="true"></i>
          {m.common.add()}
        </button>
      {/snippet}

      {#if statChannels.length === 0}
        <div class="flex flex-col items-center gap-1 py-8 text-center">
          <i class="fa-solid fa-chart-simple mb-2" style="color: {$colorStore.muted}; font-size: 28px;" aria-hidden="true"></i>
          <p class="font-medium" style="color: {$colorStore.text}">{m.statchannels.listEmptyTitle()}</p>
          <p class="text-sm" style="color: {$colorStore.muted}">{m.statchannels.listEmptyText()}</p>
        </div>
      {:else}
        <ul class="space-y-2">
          {#each statChannels as sc (sc.id)}
            <li
              class="rounded-lg border p-3 flex flex-col sm:flex-row sm:items-center gap-3"
              style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}20;"
            >
              <div class="min-w-0 grow">
                <div class="flex items-center gap-2 flex-wrap">
                  <h3 class="font-semibold truncate" style="color: {$colorStore.text}">{sc.channelName}</h3>
                  <span class="px-2 py-0.5 rounded-full text-xs" style="background: {$colorStore.primary}10; color: {$colorStore.muted}">{sc.typeName}</span>
                  {#if sc.currentValue}
                    <span class="px-2 py-0.5 rounded-full text-xs" style="background: {$colorStore.selectedSurface}; color: {$colorStore.text}">{sc.currentValue}</span>
                  {/if}
                </div>
                <p class="text-sm break-words" style="color: {$colorStore.muted}">
                  {m.statchannels.listTemplate()} <code>{sc.template}</code>
                </p>
                <p class="text-xs mt-1" style="color: {$colorStore.muted}">
                  {m.statchannels.listRefreshEvery({ mechanism: mechanismLabels[sc.updateMechanism] ?? sc.mechanismName, minutes: sc.updateIntervalMinutes })}
                  {#if sc.roleName}· {sc.roleName}{/if}
                  {#if sc.targetName}· {sc.targetName}{/if}
                </p>
              </div>
              <div class="grid grid-cols-2 sm:flex gap-2 shrink-0">
                <button
                  type="button"
                  class="px-4 rounded-lg min-h-[44px] text-sm flex items-center justify-center gap-2"
                  style="background: {$colorStore.primary}10; color: {$colorStore.text}; border: 1px solid {$colorStore.primary}20;"
                  disabled={!metadata}
                  onclick={() => openSheet(sc)}
                >
                  <i class="fa-solid fa-pen" aria-hidden="true"></i>
                  {m.common.edit()}
                </button>
                <button
                  type="button"
                  class="px-4 rounded-lg min-h-[44px] text-sm flex items-center justify-center gap-2"
                  style="background: {$colorStore.primary}10; color: {$colorStore.text}; border: 1px solid {$colorStore.primary}20;"
                  onclick={() => confirmRemove(sc)}
                >
                  <i class="fa-solid fa-trash" aria-hidden="true"></i>
                  {m.common.remove()}
                </button>
              </div>
            </li>
          {/each}
        </ul>
      {/if}
    </PluginCard>
  {:else if activeTab === "defaults"}
    <PluginCard title={m.statchannels.defaultsTitle()} alwaysOpen>
      <p class="text-sm" style="color: {$colorStore.muted}">{m.statchannels.defaultsText()}</p>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label for="s-mechanism" class="block text-sm font-medium mb-1" style="color: {$colorStore.text}">{m.statchannels.defaultsMechanism()}</label>
          <DiscordSelector
            id="s-mechanism"
            type="custom"
            customIcon="fa-gauge"
            options={mechanismOptions}
            selected={String(settings.defaultMechanism)}
            clearable={false}
            placeholder={m.statchannels.editMechanismPlaceholder()}
            onchange={(d) => d.selected && setDefaultSelect("defaultMechanism", parseInt(String(d.selected)))}
          />
        </div>
        <div>
          <label for="s-style" class="block text-sm font-medium mb-1" style="color: {$colorStore.text}">{m.statchannels.defaultsStyle()}</label>
          <DiscordSelector
            id="s-style"
            type="custom"
            customIcon="fa-palette"
            options={styleOptions}
            selected={String(settings.defaultDisplayStyle)}
            clearable={false}
            placeholder={m.statchannels.editStylePlaceholder()}
            onchange={(d) => d.selected && setDefaultSelect("defaultDisplayStyle", parseInt(String(d.selected)))}
          />
        </div>
        <div>
          <label for="s-interval" class="block text-sm font-medium mb-1" style="color: {$colorStore.text}">{m.statchannels.defaultsInterval()}</label>
          <input
            id="s-interval"
            type="number"
            min="1"
            max={MAX_INTERVAL}
            inputmode="numeric"
            value={Number.isNaN(settings.defaultIntervalMinutes) ? "" : settings.defaultIntervalMinutes}
            oninput={saveDefaultInterval}
            onblur={() => autoSave.flush("defaultIntervalMinutes")}
            class="w-full p-3 rounded-lg border focus:ring-2 min-h-[50px]"
            style="background: {$colorStore.primary}10; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
          >
        </div>
      </div>
    </PluginCard>
  {:else}
    <PluginCard title={m.statchannels.countersTitle()} alwaysOpen>
      <input
        type="search"
        bind:value={counterSearch}
        placeholder={m.statchannels.countersSearch()}
        aria-label={m.statchannels.countersSearch()}
        class="w-full p-3 rounded-lg border focus:ring-2 min-h-[50px]"
        style="background: {$colorStore.primary}10; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
      >

      {#each counterCategories as category (category)}
        <div>
          <h3 class="text-sm font-semibold mb-2" style="color: {$colorStore.text}">{category}</h3>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {#each filteredCounters.filter((t) => t.category === category) as definition (definition.type)}
              <div
                class="rounded-lg border p-3 flex items-start gap-3"
                style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}20;"
              >
                <div class="min-w-0 grow">
                  <div class="flex items-center gap-2 flex-wrap">
                    <span class="text-sm font-medium" style="color: {$colorStore.text}">{definition.name}</span>
                    {#if definition.realtime}
                      <span class="px-1.5 py-0.5 rounded text-xs" style="background: {$colorStore.selectedSurface}; color: {$colorStore.text}">{m.common.live()}</span>
                    {/if}
                  </div>
                  <p class="text-xs mt-0.5" style="color: {$colorStore.muted}">{definition.description}</p>
                  <p class="text-xs font-mono mt-1 break-words" style="color: {$colorStore.text}">{definition.example}</p>
                </div>
                <button
                  type="button"
                  class="px-3 rounded-lg min-h-[44px] text-sm shrink-0"
                  style="background: {$colorStore.primary}10; color: {$colorStore.text}; border: 1px solid {$colorStore.primary}20;"
                  onclick={() => openSheet(null, definition.type)}
                >
                  {m.statchannels.countersUse()}
                </button>
              </div>
            {/each}
          </div>
        </div>
      {:else}
        <p class="text-sm text-center py-4" style="color: {$colorStore.muted}">{m.statchannels.countersEmpty()}</p>
      {/each}
    </PluginCard>
  {/if}
</PluginPage>

{#if sheetOpen && metadata && $currentGuild?.id}
  {#key sheetKey}
    <ChannelSheet
      guildId={BigInt($currentGuild.id)}
      {metadata}
      defaults={settings}
      channel={sheetChannel}
      presetType={sheetType}
      resolveChannelId={(id) => statChannels.find((c) => c.id === id)?.channelId ?? null}
      {voiceChannels}
      {categories}
      {roles}
      {countingChannels}
      {minecraftServers}
      {autoSave}
      {notify}
      onsaved={() => refreshChannelsSoon()}
      onclose={closeSheet}
    />
  {/key}
{/if}

<ConfirmationModal
  bind:isOpen={removeModalOpen}
  confirmText={m.common.remove()}
  message={removeTarget ? m.statchannels.removeMessage({ name: removeTarget.channelName }) : ""}
  title={m.statchannels.removeTitle()}
  variant="danger"
  onconfirm={removeStatChannel}
  oncancel={() => {
    removeTarget = null;
  }}
/>
