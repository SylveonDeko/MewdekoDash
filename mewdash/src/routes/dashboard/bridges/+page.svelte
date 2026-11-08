<!-- routes/dashboard/bridges/+page.svelte -->
<script lang="ts">
  import { m } from "$lib/i18n";
  import { onDestroy } from "svelte";
  import { goto } from "$app/navigation";
  import { fade } from "svelte/transition";
  import { ApiError } from "$lib/api/core";
  import { bridgesApi, clientApi, type Bridge, type Pair } from "$lib/api/index.ts";
  import { currentGuild } from "$lib/stores/currentGuild.ts";
  import { currentInstance } from "$lib/stores/instanceStore.ts";
  import { colorStore } from "$lib/stores/colorStore";
  import { logger } from "$lib/logger.ts";
  import type { PageData } from "./$types";
  import PluginPage from "$lib/components/plugin/PluginPage.svelte";
  import PluginCard from "$lib/components/plugin/PluginCard.svelte";
  import SettingToggle from "$lib/components/forms/SettingToggle.svelte";
  import AsyncState from "$lib/components/stats/AsyncState.svelte";
  import Notification from "$lib/components/ui/Notification.svelte";
  import ConfirmationModal from "$lib/components/ui/ConfirmationModal.svelte";
  import BridgeSettingsPanel from "$lib/components/forms/BridgeSettingsPanel.svelte";
  import BridgePairs from "$lib/components/forms/BridgePairs.svelte";
  import { createAutoSave } from "$lib/utils/autoSave.svelte";
  import ConnectCard from "./components/ConnectCard.svelte";

  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();

  let bridges = $state<Bridge[]>([]);
  let pairs = $state<Pair[]>([]);
  let channels = $state<Array<{ id: string; name: string }>>([]);
  let roles = $state<Array<{ id: string; name: string; color?: number }>>([]);
  let loading = $state(false);
  let error = $state<string | null>(null);
  let notificationMessage = $state("");
  let notificationType = $state<"success" | "error">("success");
  let busy = $state<Record<string, boolean>>({});

  let removeTarget = $state<Bridge | null>(null);
  let removeOpen = $state(false);

  let notifyTimer: ReturnType<typeof setTimeout> | null = null;
  let loadedFor = $state("");

  let guildId = $derived($currentGuild?.id ? BigInt($currentGuild.id) : null);

  function notify(message: string, type: "success" | "error" = "error") {
    notificationMessage = message;
    notificationType = type;
    if (notifyTimer) clearTimeout(notifyTimer);
    notifyTimer = setTimeout(() => (notificationMessage = ""), 4000);
  }

  const autoSave = createAutoSave({
    onError: (err) => notify(errorText(err))
  });

  function errorText(err: unknown): string {
    const text = (err instanceof Error ? err.message : "") + (err instanceof ApiError ? JSON.stringify(err.body ?? "") : "");
    if (text.includes("InvalidCode")) return m.bridges.errorInvalidCode();
    if (text.includes("SamePlatform")) return m.bridges.errorSamePlatform();
    if (text.includes("AlreadyBridged")) return m.bridges.errorAlreadyBridged();
    if (text.includes("NeedWebhooks")) return m.bridges.errorWebhooks();
    if (text.includes("NoPermission")) return m.bridges.errorNoPermission();
    if (text.includes("invalid_name_format")) return m.bridges.errorNameFormat({ name: "{name}" });
    if (text.includes("invalid_min_age")) return m.bridges.errorMinAge();
    if (text.includes("not_found")) return m.bridges.errorNotFound();
    if (text.includes("already_paired")) return m.bridges.errorAlreadyPaired();
    if (text.includes("channel_not_shared")) return m.bridges.errorChannelNotShared();
    if (text.includes("code_invalid")) return m.bridges.errorInvalidCode();
    if (text.includes("code_wrong_platform")) return m.bridges.errorSamePlatform();
    if (text.includes("already_bridged")) return m.bridges.errorAlreadyBridged();
    if (text.includes("missing_permission")) return m.bridges.errorWebhooks();
    return m.bridges.errorUnknown();
  }

  async function load(id: bigint) {
    loading = true;
    error = null;
    try {
      const [list, text, roleList] = await Promise.all([
        bridgesApi.list(id),
        clientApi.getTextChannels(id),
        clientApi.getRoles(id).catch(() => [])
      ]);
      bridges = list;
      channels = text.map((c) => ({ id: c.id.toString(), name: c.name }));
      roles = roleList.map((r: any) => ({ id: r.id.toString(), name: r.name, color: r.color }));
    } catch (err) {
      error = err instanceof Error ? err.message : m.bridges.errorLoad();
      logger.error("Failed to load bridges", err);
    } finally {
      loading = false;
    }
  }

  async function refreshBridges() {
    if (!guildId) return;
    bridges = await bridgesApi.list(guildId);
  }

  function viaName(bridge: Bridge) {
    if (!bridge.pairId) return null;
    return pairs.find((p) => p.pairId === bridge.pairId)?.remoteGuildName ?? bridge.remoteGuildName;
  }

  function replace(next: Bridge) {
    bridges = bridges.map((b) => (b.bridgeId === next.bridgeId ? next : b));
  }

  async function change(bridge: Bridge, apply: Partial<Bridge>, request: () => Promise<Bridge>, failure: string) {
    if (busy[bridge.bridgeId]) return;
    const previous = bridge;
    busy[bridge.bridgeId] = true;
    replace({ ...bridge, ...apply });
    try {
      replace(await request());
    } catch (err) {
      replace(previous);
      notify(failure);
      logger.error("Failed to change a bridge", err);
    } finally {
      busy[bridge.bridgeId] = false;
    }
  }

  function togglePause(bridge: Bridge) {
    if (!guildId) return;
    const id = guildId;
    const paused = !bridge.paused;
    void change(bridge, { paused }, () => (paused ? bridgesApi.pause(id, bridge.bridgeId) : bridgesApi.resume(id, bridge.bridgeId)), m.bridges.errorPause());
  }

  function setAllowBots(bridge: Bridge, allow: boolean) {
    if (!guildId) return;
    const id = guildId;
    void change(bridge, { allowBots: allow }, () => bridgesApi.setAllowBots(id, bridge.bridgeId, allow), m.bridges.errorAllowBots());
  }

  function askRemove(bridge: Bridge) {
    removeTarget = bridge;
    removeOpen = true;
  }

  async function remove() {
    const target = removeTarget;
    if (!target || !guildId) return;
    try {
      await bridgesApi.remove(guildId, target.bridgeId);
      bridges = bridges.filter((b) => b.bridgeId !== target.bridgeId);
      notify(m.bridges.bridgeRemoved(), "success");
    } catch (err) {
      notify(m.bridges.errorRemove());
      logger.error("Failed to remove a bridge", err);
    } finally {
      removeTarget = null;
    }
  }

  onDestroy(() => {
    if (notifyTimer) clearTimeout(notifyTimer);
  });

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
    const key = `${$currentGuild.id}:${$currentInstance?.port ?? ""}`;
    if (loadedFor !== key) {
      loadedFor = key;
      void load(BigInt($currentGuild.id));
    }
  });

  const buttonStyle = $derived(`background: ${$colorStore.primary}20; color: ${$colorStore.text};`);
</script>

{#snippet statusMessages()}
  {#if notificationMessage}
    <div class="fixed top-4 right-4 z-[10001]" transition:fade>
      <Notification message={notificationMessage} type={notificationType} />
    </div>
  {/if}
{/snippet}

<PluginPage
  {statusMessages}
  {autoSave}
  icon="fa-link"
  guildName={$currentGuild?.name || m.common.dashboard()}
  title={m.features.bridgesName()}
  subtitle={m.bridges.pageSubtitle()}
>
  <AsyncState {loading} {error}>
    {#if guildId}
      {#key `${guildId}:${$currentInstance?.port ?? ""}`}
        <div class="space-y-4 min-w-0">
          <BridgePairs
            guildId={$currentGuild!.id}
            userId={data.user?.id}
            bind:pairs
            {autoSave}
            {notify}
            {errorText}
            onrefresh={refreshBridges} />

          <ConnectCard
            {guildId}
            userId={data.user?.id}
            {channels}
            {bridges}
            {notify}
            {errorText}
            onbridges={(list) => (bridges = list)} />

          <PluginCard title={m.bridges.listTitle()} alwaysOpen>
            {#if bridges.length === 0}
              <p class="text-sm" style="color: {$colorStore.muted};">{m.bridges.empty()}</p>
            {/if}
            {#each bridges as bridge (bridge.bridgeId)}
              <div class="rounded-xl border p-4 space-y-3 min-w-0" style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}20;">
                <div class="flex flex-wrap items-start justify-between gap-3">
                  <div class="min-w-0">
                    <p class="font-medium break-words" style="color: {$colorStore.text};">#{bridge.channelName}</p>
                    <p class="text-sm break-words" style="color: {$colorStore.muted};">
                      {m.bridges.bridgeWith({ channel: `#${bridge.remoteChannelName}`, community: bridge.remoteGuildName })}
                    </p>
                    <p class="text-xs mt-1" style="color: {$colorStore.muted};">
                      {bridge.paused ? m.common.paused() : m.bridges.stateRunning()} · {new Date(bridge.dateAdded).toLocaleDateString()}
                    </p>
                    {#if viaName(bridge)}
                      <p class="text-xs" style="color: {$colorStore.muted};">{m.bridges.pairVia({ community: viaName(bridge) ?? "" })}</p>
                    {/if}
                  </div>
                  <div class="flex flex-wrap gap-2">
                    <button type="button" class="px-4 min-h-[44px] rounded-lg text-sm font-medium" style={buttonStyle} disabled={busy[bridge.bridgeId]} onclick={() => togglePause(bridge)}>
                      {bridge.paused ? m.bridges.resume() : m.common.pause()}
                    </button>
                    <button type="button" class="px-4 min-h-[44px] rounded-lg text-sm font-medium" style="background: #ef444420; color: {$colorStore.text};" onclick={() => askRemove(bridge)}>
                      {m.common.remove()}
                    </button>
                  </div>
                </div>
                <SettingToggle id="bridge-bots-{bridge.bridgeId}" label={m.bridges.allowBotsLabel()} checked={bridge.allowBots} disabled={busy[bridge.bridgeId]} onchange={(v) => setAllowBots(bridge, v)} />
                <BridgeSettingsPanel
                  {bridge}
                  {roles}
                  {autoSave}
                  examplePlatform={m.bridges.examplePlatform()}
                  save={(settings) => bridgesApi.updateSettings(guildId, bridge.bridgeId, settings)}
                  onupdate={replace}
                  notify={(message) => notify(message)} />
              </div>
            {/each}
          </PluginCard>
        </div>
      {/key}
    {/if}
  </AsyncState>
</PluginPage>

<ConfirmationModal
  bind:isOpen={removeOpen}
  title={m.bridges.removeTitle()}
  message={m.bridges.removeMessage()}
  confirmText={m.common.remove()}
  variant="danger"
  onconfirm={remove}
  oncancel={() => { removeTarget = null; }}
/>
