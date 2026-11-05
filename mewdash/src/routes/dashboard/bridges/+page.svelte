<!-- routes/dashboard/bridges/+page.svelte -->
<script lang="ts">
  import { m } from "$lib/i18n";
  import { onDestroy, onMount, untrack } from "svelte";
  import { goto } from "$app/navigation";
  import { ApiError } from "$lib/api/core";
  import { bridgesApi, clientApi, type Bridge, type BridgeCode, type Pair } from "$lib/api/index.ts";
  import { currentGuild } from "$lib/stores/currentGuild.ts";
  import { currentInstance } from "$lib/stores/instanceStore.ts";
  import { colorStore } from "$lib/stores/colorStore";
  import { logger } from "$lib/logger.ts";
  import type { PageData } from "./$types";
  import DashboardPageLayout from "$lib/components/layout/DashboardPageLayout.svelte";
  import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";
  import SettingToggle from "$lib/components/forms/SettingToggle.svelte";
  import Card from "$lib/components/analytics/Card.svelte";
  import AsyncState from "$lib/components/stats/AsyncState.svelte";
  import ConfirmationModal from "$lib/components/ui/ConfirmationModal.svelte";
  import BridgeSettingsPanel from "$lib/components/forms/BridgeSettingsPanel.svelte";
  import BridgePairs from "$lib/components/forms/BridgePairs.svelte";
  import { createAutoSave } from "$lib/utils/autoSave.svelte";

  const POLL_MS = 4000;
  const LINK_COMMAND = ".bridge link CODE";

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

  let channelId = $state<string | null>(null);
  let entering = $state(false);
  let code = $state<BridgeCode | null>(null);
  let codeChannelId = $state("");
  let now = $state(Date.now());
  let creating = $state(false);
  let linking = $state(false);
  let linkInput = $state("");
  let copied = $state(false);
  let busy = $state<Record<string, boolean>>({});

  let removeTarget = $state<Bridge | null>(null);
  let removeOpen = $state(false);

  let poll: ReturnType<typeof setInterval> | null = null;
  let tick: ReturnType<typeof setInterval> | null = null;
  let notifyTimer: ReturnType<typeof setTimeout> | null = null;
  let loadedFor = $state("");

  const bridgedIds = $derived(new Set(bridges.map((b) => b.channelId.toString())));
  const freeChannels = $derived(channels.filter((c) => !bridgedIds.has(c.id)));
  const remaining = $derived(code ? Math.max(0, Math.floor((new Date(code.expiresAt).getTime() - now) / 1000)) : 0);
  const expired = $derived(!!code && remaining === 0);
  const countdown = $derived(`${Math.floor(remaining / 60)}:${String(remaining % 60).padStart(2, "0")}`);

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

  function stopPolling() {
    if (poll) clearInterval(poll);
    if (tick) clearInterval(tick);
    poll = null;
    tick = null;
  }

  function startPolling() {
    stopPolling();
    now = Date.now();
    tick = setInterval(() => (now = Date.now()), 1000);
    poll = setInterval(refresh, POLL_MS);
  }

  function clearCode() {
    code = null;
    copied = false;
    stopPolling();
  }

  async function refresh() {
    if (!$currentGuild?.id) return;
    try {
      bridges = await bridgesApi.list($currentGuild.id);
    } catch (err) {
      logger.error("Failed to refresh bridges", err);
      return;
    }

    if (!code) return;
    if (expired) {
      stopPolling();
      return;
    }
    const linked = bridges.find((b) => b.channelId.toString() === codeChannelId);
    if (linked) {
      notify(m.bridges.linked({ channel: linked.remoteChannelName, community: linked.remoteGuildName }), "success");
      clearCode();
      channelId = null;
    }
  }

  async function load() {
    if (!$currentGuild?.id) return;
    loading = true;
    error = null;
    try {
      const [list, text, roleList] = await Promise.all([bridgesApi.list($currentGuild.id), clientApi.getTextChannels($currentGuild.id), clientApi.getRoles($currentGuild.id).catch(() => [])]);
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

  async function createCode() {
    if (!$currentGuild?.id || !channelId || !data.user?.id) return;
    creating = true;
    try {
      code = await bridgesApi.createCode($currentGuild.id, {
        channelId: BigInt(channelId),
        userId: BigInt(data.user.id)
      });
      codeChannelId = channelId;
      copied = false;
      startPolling();
    } catch (err) {
      notify(errorText(err));
      logger.error("Failed to create a bridge code", err);
    } finally {
      creating = false;
    }
  }

  async function linkWithCode() {
    if (!$currentGuild?.id || !channelId || !data.user?.id || !linkInput.trim()) return;
    linking = true;
    try {
      const bridge = await bridgesApi.link($currentGuild.id, {
        code: linkInput.trim(),
        channelId: BigInt(channelId),
        userId: BigInt(data.user.id)
      });
      notify(m.bridges.linked({ channel: bridge.remoteChannelName, community: bridge.remoteGuildName }), "success");
      linkInput = "";
      channelId = null;
      entering = false;
      bridges = await bridgesApi.list($currentGuild.id);
    } catch (err) {
      notify(errorText(err));
      logger.error("Failed to link a bridge", err);
    } finally {
      linking = false;
    }
  }

  async function copyCode() {
    if (!code) return;
    try {
      await navigator.clipboard.writeText(code.code);
      copied = true;
      setTimeout(() => (copied = false), 2000);
    } catch (err) {
      logger.error("Failed to copy the bridge code", err);
    }
  }

  async function refreshBridges() {
    if (!$currentGuild?.id) return;
    bridges = await bridgesApi.list($currentGuild.id);
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
    if (!$currentGuild?.id) return;
    const guildId = $currentGuild.id;
    const paused = !bridge.paused;
    void change(bridge, { paused }, () => (paused ? bridgesApi.pause(guildId, bridge.bridgeId) : bridgesApi.resume(guildId, bridge.bridgeId)), m.bridges.errorPause());
  }

  function setAllowBots(bridge: Bridge, allow: boolean) {
    if (!$currentGuild?.id) return;
    const guildId = $currentGuild.id;
    void change(bridge, { allowBots: allow }, () => bridgesApi.setAllowBots(guildId, bridge.bridgeId, allow), m.bridges.errorAllowBots());
  }

  function askRemove(bridge: Bridge) {
    removeTarget = bridge;
    removeOpen = true;
  }

  async function remove() {
    const target = removeTarget;
    if (!target || !$currentGuild?.id) return;
    try {
      await bridgesApi.remove($currentGuild.id, target.bridgeId);
      bridges = bridges.filter((b) => b.bridgeId !== target.bridgeId);
      notify(m.bridges.bridgeRemoved(), "success");
    } catch (err) {
      notify(m.bridges.errorRemove());
      logger.error("Failed to remove a bridge", err);
    } finally {
      removeTarget = null;
    }
  }

  async function loadAll() {
    if (!$currentGuild?.id) return;
    const key = `${$currentGuild.id}:${$currentInstance?.port ?? ""}`;
    if (loadedFor === key) return;
    loadedFor = key;
    clearCode();
    await load();
  }

  onMount(async () => {
    if (!$currentGuild) {
      await goto("/dashboard");
      return;
    }
    await loadAll();
  });

  onDestroy(() => {
    stopPolling();
    if (notifyTimer) clearTimeout(notifyTimer);
  });

  $effect(() => {
    if ($currentGuild && $currentInstance) untrack(() => loadAll());
  });

  const inputStyle = $derived(`background: ${$colorStore.primary}10; color: ${$colorStore.text};`);
  const buttonStyle = $derived(`background: ${$colorStore.primary}20; color: ${$colorStore.text};`);
  const primaryStyle = $derived(`background: ${$colorStore.primary}; color: ${$colorStore.onPrimary};`);
</script>

<DashboardPageLayout
  title={m.features.bridgesName()}
  subtitle={m.bridges.pageSubtitle()}
  icon="fa-link"
  guildName={$currentGuild?.name || "Dashboard"}
  bind:notificationMessage
  {notificationType}
  {autoSave}
>
  <AsyncState {loading} {error}>
    <div class="space-y-6">
      {#if $currentGuild}
        <BridgePairs
          guildId={$currentGuild.id}
          userId={data.user?.id}
          bind:pairs
          {autoSave}
          {notify}
          errorText={errorText}
          onrefresh={refreshBridges} />
      {/if}

      <Card title={m.bridges.connectTitle()}>
        <div class="space-y-4">
          <div>
            <span id="bridge-channel-label" class="block text-sm mb-2" style="color: {$colorStore.muted};">{m.bridges.pickChannelHint()}</span>
            <DiscordSelector type="channel" options={freeChannels} selected={channelId} placeholder={m.common.selectAChannelPlaceholder()} ariaLabelledby="bridge-channel-label" onchange={(d) => (channelId = typeof d.selected === "string" ? d.selected : null)} />
          </div>

          {#if code && !expired}
            <div class="rounded-lg p-4 space-y-3" style="background: {$colorStore.primary}10;">
              <p class="text-xs" style="color: {$colorStore.muted};">{m.bridges.codeLabel()}</p>
              <div class="flex flex-wrap items-center gap-3">
                <span class="text-3xl font-mono font-bold tracking-widest break-all" style="color: {$colorStore.text};">{code.code}</span>
                <button type="button" class="px-4 min-h-[44px] rounded-lg text-sm font-medium" style={buttonStyle} onclick={copyCode}>
                  {copied ? m.common.copied() : m.bridges.codeCopy()}
                </button>
              </div>
              <p class="text-sm" style="color: {$colorStore.muted};" aria-live="off">{m.bridges.codeExpiresIn({ time: countdown })}</p>
              <p class="text-sm" style="color: {$colorStore.muted};">{m.bridges.codeHint({ command: LINK_COMMAND })}</p>
            </div>
          {:else if entering}
            <div class="flex flex-wrap gap-2">
              <input type="text" bind:value={linkInput} placeholder={m.bridges.haveCodePlaceholder()} aria-label={m.bridges.codeLabel()} maxlength="32" autocomplete="off" class="rounded-lg p-2 min-h-[44px] font-mono uppercase flex-1 min-w-[10rem]" style={inputStyle} onkeydown={(e) => e.key === "Enter" && linkWithCode()} />
              <button type="button" class="px-4 min-h-[44px] rounded-lg text-sm font-medium disabled:opacity-50" style={primaryStyle} disabled={!channelId || !linkInput.trim() || linking} onclick={linkWithCode}>
                {m.bridges.link()}
              </button>
              <button type="button" class="px-4 min-h-[44px] rounded-lg text-sm font-medium" style={buttonStyle} onclick={() => (entering = false)}>{m.common.cancel()}</button>
            </div>
          {:else}
            {#if expired}
              <p class="text-sm" style="color: {$colorStore.muted};">{m.bridges.codeExpired()}</p>
            {/if}
            <div class="flex flex-wrap gap-2">
              <button type="button" class="px-4 min-h-[44px] rounded-lg text-sm font-medium disabled:opacity-50" style={primaryStyle} disabled={!channelId || creating} onclick={createCode}>
                {m.bridges.createCode()}
              </button>
              <button type="button" class="px-4 min-h-[44px] rounded-lg text-sm font-medium" style={buttonStyle} onclick={() => (entering = true)}>{m.bridges.haveCode()}</button>
            </div>
          {/if}
        </div>
      </Card>

      {#if bridges.length === 0}
        <p class="text-sm px-1" style="color: {$colorStore.muted};">{m.bridges.empty()}</p>
      {:else}
        <section class="space-y-3">
          <h2 class="text-base font-semibold px-1" style="color: {$colorStore.text};">{m.bridges.listTitle()}</h2>
          <div class="space-y-3">
            {#each bridges as bridge (bridge.bridgeId)}
              <div class="rounded-xl border p-4 space-y-3" style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}20;">
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
                  save={(settings) => bridgesApi.updateSettings($currentGuild!.id, bridge.bridgeId, settings)}
                  onupdate={replace}
                  notify={(message) => notify(message)} />
              </div>
            {/each}
          </div>
        </section>
      {/if}
    </div>
  </AsyncState>
</DashboardPageLayout>

<ConfirmationModal
  bind:isOpen={removeOpen}
  title={m.bridges.removeTitle()}
  message={m.bridges.removeMessage()}
  confirmText={m.common.remove()}
  variant="danger"
  onconfirm={remove}
  oncancel={() => { removeTarget = null; }}
/>
