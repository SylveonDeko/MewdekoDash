<!-- routes/dashboard/channel-access/+page.svelte -->
<script lang="ts">
  import { m } from "$lib/i18n";
  import { goto } from "$app/navigation";
  import { page } from "$app/state";
  import { fade } from "svelte/transition";
  import {
    channelAccessApi,
    clientApi,
    type ChannelAccessBlacklistEntry,
    type ChannelAccessGate
  } from "$lib/api/index.ts";
  import { currentGuild } from "$lib/stores/currentGuild.ts";
  import { currentInstance } from "$lib/stores/instanceStore.ts";
  import { colorStore } from "$lib/stores/colorStore.ts";
  import { logger } from "$lib/logger.ts";
  import { createAutoSave } from "$lib/utils/autoSave.svelte";
  import Notification from "$lib/components/ui/Notification.svelte";
  import PluginPage from "$lib/components/plugin/PluginPage.svelte";
  import GatesTab from "./components/GatesTab.svelte";
  import ApplicationsTab from "./components/ApplicationsTab.svelte";
  import BlockedTab from "./components/BlockedTab.svelte";
  import { TABS, errorText, type GatePatch, type Named, type SaveMode, type TabId } from "./components/channelAccessModel";

  let gates: ChannelAccessGate[] = $state([]);
  let blacklist: ChannelAccessBlacklistEntry[] = $state([]);
  let channels: Named[] = $state([]);
  let roles: Named[] = $state([]);
  let members: Named[] = $state([]);
  let loading = $state(false);
  let refreshKey = $state(0);
  let showNotification = $state(false);
  let notificationMessage = $state("");
  let notificationType: "success" | "error" = $state("success");
  let loadedGuildId = "";

  const autoSave = createAutoSave({
    onError: (err) => notify(errorText(err, m.channelAccess.errorSaveGate()), "error")
  });

  let guildId = $derived($currentGuild?.id ? BigInt($currentGuild.id) : null);

  const tab: TabId = $derived.by(() => {
    const requested = page.url.searchParams.get("tab");
    return TABS.find((id) => id === requested) ?? "gates";
  });

  const tabs = $derived<Array<{ id: TabId; label: string; icon: string }>>([
    { id: "gates", label: m.channelAccess.tabGates(), icon: "fa-lock" },
    { id: "applications", label: m.common.applications(), icon: "fa-inbox" },
    { id: "blocked", label: m.channelAccess.tabBlocked(), icon: "fa-ban" }
  ]);

  function notify(message: string, type: "success" | "error" = "success") {
    notificationMessage = message;
    notificationType = type;
    showNotification = true;
    setTimeout(() => {
      showNotification = false;
    }, 3000);
  }

  function select(id: TabId) {
    if (id === tab) return;
    void autoSave.flush();
    const url = new URL(page.url);
    url.search = "";
    url.searchParams.set("tab", id);
    void goto(url, { replaceState: true, noScroll: true, keepFocus: true });
  }

  async function loadGates(id: bigint) {
    const [loadedGates, loadedBlacklist] = await Promise.all([
      channelAccessApi.getGates(id),
      channelAccessApi.getBlacklist(id)
    ]);
    gates = loadedGates;
    blacklist = loadedBlacklist;
  }

  async function reload() {
    const id = guildId;
    if (!id) return;
    loading = true;
    try {
      await loadGates(id);
      refreshKey++;
    } catch (err) {
      logger.error("Failed to load channel access data:", err);
      notify(errorText(err, m.channelAccess.errorLoad()), "error");
    } finally {
      loading = false;
    }
  }

  async function loadGuildData(id: bigint) {
    loading = true;
    const everyone = id.toString();
    const results = await Promise.allSettled([
      loadGates(id),
      clientApi.getTextChannels(id).then((value) => (channels = value.map((x) => ({ id: String(x.id), name: x.name })))),
      clientApi.getRoles(id).then(
        (value) =>
          (roles = value
            .filter((x) => String(x.id) !== everyone && !x.name.startsWith("@"))
            .map((x) => ({ id: String(x.id), name: x.name }))
            .sort((a, b) => a.name.localeCompare(b.name)))
      ),
      clientApi.getMembers(id).then(
        (value) => (members = value.map((x) => ({ id: String(x.id), name: x.username ?? String(x.id) })))
      )
    ]);
    for (const result of results) {
      if (result.status === "rejected") {
        logger.error("Failed to load channel access data:", result.reason);
        notify(errorText(result.reason, m.channelAccess.errorLoad()), "error");
        break;
      }
    }
    loading = false;
  }

  const patchGate: GatePatch = (gateId, local, remote, mode: SaveMode = "typing") => {
    const id = guildId;
    const index = gates.findIndex((x) => x.id === gateId);
    if (!id || index < 0) return;
    const previous = gates[index];
    const keys = Object.keys(local) as (keyof ChannelAccessGate)[];
    gates[index] = { ...previous, ...local };
    const save = async () => {
      try {
        await channelAccessApi.updateGate(id, gateId, remote);
      } catch (err) {
        const current = gates.findIndex((x) => x.id === gateId);
        if (mode === "now" && current >= 0 && guildId === id) {
          const restored = { ...gates[current] } as Record<string, unknown>;
          for (const key of keys) restored[key] = previous[key];
          gates[current] = restored as unknown as ChannelAccessGate;
        }
        throw err;
      }
    };
    const key = `gate:${gateId}:${keys.join(",")}`;
    if (mode === "now") void autoSave.now(key, save);
    else autoSave.schedule(key, save);
  };

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
      gates = [];
      blacklist = [];
      void loadGuildData(BigInt($currentGuild.id));
    }
  });

  const actionButtons = $derived([{ label: m.common.refresh(), icon: "fa-arrows-rotate", action: () => void reload(), loading }]);
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
  icon="fa-lock"
  guildName={$currentGuild?.name || m.common.dashboard()}
  title={m.features.channelAccessName()}
  subtitle={m.channelAccess.pageSubtitle()}
>
  <div class="grid grid-cols-2 sm:grid-cols-3 gap-2" role="group" aria-label={m.channelAccess.tabsAria()}>
    {#each tabs as item (item.id)}
      {@const selected = tab === item.id}
      <button
        type="button"
        class="min-h-[44px] px-2 rounded-lg border text-sm font-medium flex items-center justify-center gap-2"
        style="background: {selected ? $colorStore.selectedSurface : `${$colorStore.primary}08`}; border-color: {selected ? $colorStore.selectedBorder : `${$colorStore.primary}20`}; color: {$colorStore.text};"
        aria-pressed={selected}
        onclick={() => select(item.id)}
      >
        <i class="fa-solid {item.icon}" aria-hidden="true"></i>
        {item.label}
      </button>
    {/each}
  </div>

  {#if guildId}
    {#key `${guildId}:${tab}`}
      {#if tab === "gates"}
        <GatesTab
          {guildId}
          bind:gates
          blockedCount={blacklist.length}
          {channels}
          {roles}
          onpatch={patchGate}
          onflush={() => void autoSave.flush()}
          onreload={reload}
          onerror={(message) => notify(message, "error")}
          onsuccess={(message) => notify(message)}
        />
      {:else if tab === "applications"}
        <ApplicationsTab
          {guildId}
          {gates}
          {channels}
          {refreshKey}
          onchanged={reload}
          onerror={(message) => notify(message, "error")}
          onsuccess={(message) => notify(message)}
        />
      {:else}
        <BlockedTab
          {guildId}
          {gates}
          {blacklist}
          {channels}
          {members}
          onchanged={reload}
          onerror={(message) => notify(message, "error")}
        />
      {/if}
    {/key}
  {/if}
</PluginPage>
