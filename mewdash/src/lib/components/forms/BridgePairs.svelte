<script lang="ts">
  /**
   * The linked communities card on the bridges page. Owns the pair list, the pair code flow and
   * the polling that runs while a code or an outgoing proposal is waiting.
   */
  import { onDestroy, untrack } from "svelte";
  import { m } from "$lib/i18n";
  import { colorStore } from "$lib/stores/colorStore";
  import { logger } from "$lib/logger.ts";
  import { bridgesApi, type BridgeCode, type Pair, type PairApprovalMode, type PairProposal } from "$lib/api/index.ts";
  import type { AutoSave } from "$lib/utils/autoSave.svelte";
  import Card from "$lib/components/analytics/Card.svelte";
  import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";
  import ConfirmationModal from "$lib/components/ui/ConfirmationModal.svelte";

  const POLL_MS = 4000;

  interface Props {
    guildId: bigint;
    userId: bigint | string | undefined;
    pairs: Pair[];
    autoSave: AutoSave;
    notify: (message: string, type?: "success" | "error") => void;
    errorText: (err: unknown) => string;
    onrefresh: () => Promise<void> | void;
  }

  let { guildId, userId, pairs = $bindable([]), autoSave, notify, errorText, onrefresh }: Props = $props();

  let ready = $state(false);
  let busy = $state<Record<string, boolean>>({});
  let picks = $state<Record<string, { local: string | null; remote: string | null }>>({});
  let results = $state<Record<string, string>>({});
  let sharingOpen = $state<Record<string, boolean>>({});

  let code = $state<BridgeCode | null>(null);
  let codePairIds = $state<string[]>([]);
  let entering = $state(false);
  let codeInput = $state("");
  let now = $state(Date.now());

  let unlinking = $state<Pair | null>(null);
  let unlinkOpen = $state(false);
  let keepBridges = $state(true);

  const remaining = $derived(code ? Math.max(0, Math.ceil((new Date(code.expiresAt).getTime() - now) / 1000)) : 0);
  const countdown = $derived(`${Math.floor(remaining / 60)}:${String(remaining % 60).padStart(2, "0")}`);
  const needsPolling = $derived(!!code || pairs.some((p) => p.outgoingProposals.length > 0));

  const modes: Array<{ value: PairApprovalMode; label: () => string }> = [
    { value: "Approve", label: () => m.bridges.pairModeApprove() },
    { value: "Auto", label: () => m.bridges.pairModeAuto() }
  ];

  const inputStyle = $derived(`background: ${$colorStore.primary}10; color: ${$colorStore.text};`);
  const primaryStyle = $derived(`background: ${$colorStore.primary}; color: ${$colorStore.onPrimary};`);
  const idleStyle = $derived(`background: ${$colorStore.primary}14; color: ${$colorStore.text};`);
  const activeStyle = $derived(`background: ${$colorStore.selectedSurface}; border: 1px solid ${$colorStore.selectedBorder}; color: ${$colorStore.text};`);

  function uid() {
    return userId === undefined ? null : BigInt(userId);
  }

  function channelOptions(list: Array<{ id: bigint; name: string }>) {
    return list.map((c) => ({ id: String(c.id), name: c.name }));
  }

  function replacePair(next: Pair) {
    pairs = pairs.map((p) => (p.pairId === next.pairId ? next : p));
  }

  function clearCode() {
    code = null;
    codePairIds = [];
  }

  async function loadPairs() {
    pairs = await bridgesApi.getPairs(guildId);
  }

  async function refresh() {
    try {
      await Promise.all([loadPairs(), onrefresh()]);
    } catch (err) {
      logger.error("Failed to refresh pairs", err);
      return;
    }
    if (!code) return;
    if (pairs.some((p) => !codePairIds.includes(p.pairId))) {
      clearCode();
      notify(m.bridges.pairLinked(), "success");
    } else if (remaining === 0) {
      clearCode();
      notify(m.bridges.codeExpired(), "error");
    }
  }

  async function guarded(key: string, work: () => Promise<void>) {
    if (busy[key]) return;
    busy[key] = true;
    try {
      await work();
    } catch (err) {
      notify(errorText(err), "error");
      logger.error("Pair request failed", err);
    } finally {
      busy[key] = false;
    }
  }

  function createCode() {
    const user = uid();
    if (user === null) return;
    void guarded("code", async () => {
      clearCode();
      entering = false;
      const created = await bridgesApi.createPairCode(guildId, user);
      codePairIds = pairs.map((p) => p.pairId);
      now = Date.now();
      code = created;
    });
  }

  function linkCode() {
    const user = uid();
    const value = codeInput.trim();
    if (user === null || !value) return;
    void guarded("link", async () => {
      await bridgesApi.linkPair(guildId, value, user);
      codeInput = "";
      entering = false;
      notify(m.bridges.pairLinked(), "success");
      await loadPairs();
    });
  }

  async function copyCode() {
    if (!code) return;
    try {
      await navigator.clipboard.writeText(code.code);
      notify(m.common.copied(), "success");
    } catch (err) {
      logger.error("Failed to copy the pair code", err);
    }
  }

  function setPick(id: string, side: "local" | "remote", value: string | string[] | null) {
    const current = picks[id] ?? { local: null, remote: null };
    picks[id] = { ...current, [side]: typeof value === "string" ? value : null };
  }

  function connect(pair: Pair) {
    const pick = picks[pair.pairId];
    const user = uid();
    if (!pick?.local || !pick.remote || user === null) return;
    const { local, remote } = pick;
    void guarded(`connect-${pair.pairId}`, async () => {
      const result = await bridgesApi.connectPair(guildId, pair.pairId, BigInt(local), BigInt(remote), user);
      results[pair.pairId] = result.status === "connected" ? m.bridges.pairConnected() : m.bridges.pairProposed({ community: pair.remoteGuildName });
      picks[pair.pairId] = { local: null, remote: null };
      await Promise.all([loadPairs(), onrefresh()]);
    });
  }

  function answer(pair: Pair, proposal: PairProposal, accept: boolean) {
    const user = uid();
    if (user === null) return;
    void guarded(`proposal-${proposal.proposalId}`, async () => {
      if (accept) await bridgesApi.acceptProposal(guildId, pair.pairId, proposal.proposalId, user);
      else await bridgesApi.declineProposal(guildId, pair.pairId, proposal.proposalId, user);
      await Promise.all([loadPairs(), onrefresh()]);
    });
  }

  function cancelProposal(pair: Pair, proposal: PairProposal) {
    void guarded(`proposal-${proposal.proposalId}`, async () => {
      await bridgesApi.cancelProposal(guildId, pair.pairId, proposal.proposalId);
      await loadPairs();
    });
  }

  async function persist(id: string) {
    const pair = pairs.find((p) => p.pairId === id);
    if (!pair) return;
    try {
      await bridgesApi.updatePairSettings(guildId, id, {
        approvalMode: pair.approvalMode,
        hiddenChannelIds: pair.hiddenChannelIds.map((c) => BigInt(c))
      });
    } catch (err) {
      await loadPairs().catch(() => {});
      throw err;
    }
  }

  function saveSettings(id: string) {
    void autoSave.now(`pair-settings-${id}`, () => persist(id));
  }

  function setMode(pair: Pair, mode: PairApprovalMode) {
    if (pair.approvalMode === mode) return;
    replacePair({ ...pair, approvalMode: mode });
    saveSettings(pair.pairId);
  }

  function setShared(pair: Pair, selected: string | string[] | null) {
    const keep = new Set(Array.isArray(selected) ? selected : []);
    const known = new Set(pair.localChannels.map((c) => String(c.id)));
    const hidden = [
      ...pair.hiddenChannelIds.filter((h) => !known.has(String(h))),
      ...pair.localChannels.filter((c) => !keep.has(String(c.id))).map((c) => c.id)
    ];
    replacePair({
      ...pair,
      hiddenChannelIds: hidden,
      localChannels: pair.localChannels.map((c) => ({ ...c, shared: keep.has(String(c.id)) }))
    });
    saveSettings(pair.pairId);
  }

  function askUnlink(pair: Pair) {
    unlinking = pair;
    keepBridges = true;
    unlinkOpen = true;
  }

  function confirmUnlink() {
    const target = unlinking;
    unlinking = null;
    if (!target) return;
    void guarded(`unlink-${target.pairId}`, async () => {
      await bridgesApi.removePair(guildId, target.pairId, keepBridges);
      notify(m.bridges.pairUnlinked(), "success");
      await Promise.all([loadPairs(), onrefresh()]);
    });
  }

  let loadedFor = "";

  $effect(() => {
    const key = String(guildId);
    if (loadedFor === key) return;
    loadedFor = key;
    untrack(() => {
      clearCode();
      ready = false;
      loadPairs()
        .catch((err) => logger.error("Failed to load pairs", err))
        .finally(() => (ready = true));
    });
  });

  $effect(() => {
    if (!needsPolling) return;
    const timer = setInterval(refresh, POLL_MS);
    return () => clearInterval(timer);
  });

  $effect(() => {
    if (!code) return;
    const timer = setInterval(() => (now = Date.now()), 1000);
    return () => clearInterval(timer);
  });

  onDestroy(clearCode);
</script>

{#if ready}
  <Card title={m.bridges.pairsTitle()}>
    <div class="space-y-4">
      {#if pairs.length === 0}
        <p class="text-sm" style="color: {$colorStore.muted}">{m.bridges.pairsIntro()}</p>
      {/if}

      {#each pairs as pair (pair.pairId)}
        {@const id = pair.pairId}
        {@const sharedIds = pair.localChannels.filter((c) => c.shared).map((c) => String(c.id))}
        <div class="rounded-xl border p-4 space-y-4" style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}20;">
          <div class="min-w-0">
            <h3 class="font-medium break-words" style="color: {$colorStore.text}">{pair.remoteGuildName}</h3>
            <p class="text-xs" style="color: {$colorStore.muted}">{m.bridges.pairSince({ date: new Date(pair.dateAdded).toLocaleDateString() })}</p>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <span class="block text-sm mb-2" id="pair-local-{id}" style="color: {$colorStore.muted}">{m.bridges.pairLocalLabel()}</span>
              <DiscordSelector
                type="channel"
                options={channelOptions(pair.localChannels)}
                selected={picks[id]?.local ?? null}
                ariaLabelledby="pair-local-{id}"
                placeholder={m.common.selectAChannelPlaceholder()}
                onchange={(detail) => setPick(id, "local", detail.selected)} />
            </div>
            <div>
              <span class="block text-sm mb-2" id="pair-remote-{id}" style="color: {$colorStore.muted}">{m.bridges.pairRemoteLabel()}</span>
              <DiscordSelector
                type="channel"
                options={channelOptions(pair.remoteChannels)}
                selected={picks[id]?.remote ?? null}
                ariaLabelledby="pair-remote-{id}"
                placeholder={m.common.selectAChannelPlaceholder()}
                onchange={(detail) => setPick(id, "remote", detail.selected)} />
            </div>
          </div>
          <div class="flex flex-wrap items-center gap-3">
            <button type="button" class="px-4 min-h-[44px] rounded-lg text-sm font-medium disabled:opacity-50" style={primaryStyle} disabled={busy[`connect-${id}`] || !picks[id]?.local || !picks[id]?.remote} onclick={() => connect(pair)}>{m.bridges.pairConnect()}</button>
            {#if results[id]}
              <p class="text-sm" style="color: {$colorStore.muted}" aria-live="polite">{results[id]}</p>
            {/if}
          </div>

          {#if pair.incomingProposals.length > 0}
            <div class="space-y-2">
              <span class="block text-sm" style="color: {$colorStore.muted}">{m.bridges.pairIncomingLabel({ community: pair.remoteGuildName })}</span>
              {#each pair.incomingProposals as proposal (proposal.proposalId)}
                <div class="flex flex-wrap items-center justify-between gap-2 rounded-lg p-3" style="background: {$colorStore.primary}10;">
                  <p class="text-sm break-words min-w-0" style="color: {$colorStore.text}">{m.bridges.pairProposalItem({ local: proposal.localChannelName, remote: proposal.remoteChannelName })}</p>
                  <div class="flex gap-2">
                    <button type="button" class="px-4 min-h-[44px] rounded-lg text-sm font-medium disabled:opacity-50" style={primaryStyle} disabled={busy[`proposal-${proposal.proposalId}`]} onclick={() => answer(pair, proposal, true)}>{m.bridges.pairAccept()}</button>
                    <button type="button" class="px-4 min-h-[44px] rounded-lg text-sm font-medium disabled:opacity-50" style={idleStyle} disabled={busy[`proposal-${proposal.proposalId}`]} onclick={() => answer(pair, proposal, false)}>{m.bridges.pairDecline()}</button>
                  </div>
                </div>
              {/each}
            </div>
          {/if}

          {#if pair.outgoingProposals.length > 0}
            <div class="space-y-2">
              <span class="block text-sm" style="color: {$colorStore.muted}">{m.bridges.pairOutgoingLabel({ community: pair.remoteGuildName })}</span>
              {#each pair.outgoingProposals as proposal (proposal.proposalId)}
                <div class="flex flex-wrap items-center justify-between gap-2 rounded-lg p-3" style="background: {$colorStore.primary}10;">
                  <p class="text-sm break-words min-w-0" style="color: {$colorStore.text}">{m.bridges.pairProposalItem({ local: proposal.localChannelName, remote: proposal.remoteChannelName })}</p>
                  <button type="button" class="px-4 min-h-[44px] rounded-lg text-sm font-medium disabled:opacity-50" style={idleStyle} disabled={busy[`proposal-${proposal.proposalId}`]} onclick={() => cancelProposal(pair, proposal)}>{m.common.cancel()}</button>
                </div>
              {/each}
            </div>
          {/if}

          <div>
            <button
              type="button"
              class="flex items-center gap-2 min-h-[44px] text-sm font-medium"
              style="color: {$colorStore.text};"
              aria-expanded={sharingOpen[id] ?? false}
              aria-controls="pair-sharing-{id}"
              onclick={() => (sharingOpen[id] = !sharingOpen[id])}
            >
              {m.bridges.pairSharing()}
              <i class="fa-solid fa-chevron-down text-xs transition-transform {sharingOpen[id] ? 'rotate-180' : ''}" style="color: {$colorStore.muted};" aria-hidden="true"></i>
            </button>
            {#if sharingOpen[id]}
              <div id="pair-sharing-{id}" class="space-y-4 mt-2">
                <div>
                  <span class="block text-sm mb-2" id="pair-mode-{id}" style="color: {$colorStore.muted}">{m.bridges.pairApprovalLabel()}</span>
                  <div class="flex flex-wrap gap-2" role="group" aria-labelledby="pair-mode-{id}">
                    {#each modes as option (option.value)}
                      <button
                        type="button"
                        class="px-4 min-h-[44px] rounded-lg text-sm font-medium"
                        style={pair.approvalMode === option.value ? activeStyle : idleStyle}
                        aria-pressed={pair.approvalMode === option.value}
                        onclick={() => setMode(pair, option.value)}>{option.label()}</button>
                    {/each}
                  </div>
                </div>
                <div>
                  <span class="block text-sm mb-2" id="pair-shared-{id}" style="color: {$colorStore.muted}">{m.bridges.pairSharedLabel()}</span>
                  <DiscordSelector
                    type="channel"
                    multiple
                    options={channelOptions(pair.localChannels)}
                    selected={sharedIds}
                    ariaLabelledby="pair-shared-{id}"
                    placeholder={m.common.selectAChannelPlaceholder()}
                    onchange={(detail) => setShared(pair, detail.selected)} />
                </div>
              </div>
            {/if}
          </div>

          <div>
            <button type="button" class="px-4 min-h-[44px] rounded-lg text-sm font-medium disabled:opacity-50" style={idleStyle} disabled={busy[`unlink-${id}`]} onclick={() => askUnlink(pair)}>{m.bridges.pairUnlink()}</button>
          </div>
        </div>
      {/each}

      {#if code}
        <div class="rounded-lg p-4 space-y-3" style="background: {$colorStore.primary}10;">
          <span class="block text-sm" style="color: {$colorStore.muted}">{m.bridges.codeLabel()}</span>
          <div class="flex flex-wrap items-center gap-3">
            <span class="text-3xl font-bold font-mono tracking-widest select-all break-all" style="color: {$colorStore.text}">{code.code}</span>
            <button type="button" class="px-3 min-h-[44px] rounded-lg text-sm font-medium" style={idleStyle} onclick={copyCode}>{m.bridges.codeCopy()}</button>
          </div>
          <p class="text-sm" style="color: {$colorStore.muted}">{m.bridges.codeExpiresIn({ time: countdown })}</p>
          <p class="text-sm" style="color: {$colorStore.text}">{m.bridges.pairCodeInstructions({ command: `.bridge pair ${code.code}` })}</p>
        </div>
      {:else if entering}
        <div class="flex flex-col sm:flex-row gap-2">
          <input type="text" bind:value={codeInput} placeholder={m.bridges.pairCodePlaceholder()} aria-label={m.bridges.codeLabel()} autocomplete="off" class="w-full rounded-lg p-2 min-h-[44px] font-mono uppercase" style={inputStyle} onkeydown={(e) => e.key === "Enter" && linkCode()} />
          <button type="button" class="px-4 min-h-[44px] rounded-lg text-sm font-medium whitespace-nowrap disabled:opacity-50" style={primaryStyle} disabled={busy.link || !codeInput.trim()} onclick={linkCode}>{m.bridges.pairLink()}</button>
          <button type="button" class="px-4 min-h-[44px] rounded-lg text-sm font-medium whitespace-nowrap" style={idleStyle} onclick={() => (entering = false)}>{m.common.cancel()}</button>
        </div>
      {:else}
        <div class="flex flex-wrap gap-2">
          <button type="button" class="px-4 min-h-[44px] rounded-lg text-sm font-medium disabled:opacity-50" style={primaryStyle} disabled={busy.code} onclick={createCode}>{m.bridges.pairCreateCode()}</button>
          <button type="button" class="px-4 min-h-[44px] rounded-lg text-sm font-medium" style={idleStyle} onclick={() => (entering = true)}>{m.bridges.pairHaveCode()}</button>
        </div>
      {/if}
    </div>
  </Card>
{/if}

<ConfirmationModal
  bind:isOpen={unlinkOpen}
  title={m.bridges.pairUnlinkTitle({ community: unlinking?.remoteGuildName ?? "" })}
  message={m.bridges.pairUnlinkMessage()}
  confirmText={m.bridges.pairUnlink()}
  variant="danger"
  oncancel={() => (unlinking = null)}
  onconfirm={confirmUnlink}
>
  <div class="flex flex-col gap-2 mt-4" role="group" aria-label={m.bridges.pairUnlinkTitle({ community: unlinking?.remoteGuildName ?? "" })}>
    <button type="button" class="px-4 min-h-[44px] rounded-lg text-sm font-medium text-left" style={keepBridges ? activeStyle : idleStyle} aria-pressed={keepBridges} onclick={() => (keepBridges = true)}>{m.bridges.pairKeepBridges()}</button>
    <button type="button" class="px-4 min-h-[44px] rounded-lg text-sm font-medium text-left" style={!keepBridges ? activeStyle : idleStyle} aria-pressed={!keepBridges} onclick={() => (keepBridges = false)}>{m.bridges.pairRemoveBridges()}</button>
  </div>
</ConfirmationModal>
