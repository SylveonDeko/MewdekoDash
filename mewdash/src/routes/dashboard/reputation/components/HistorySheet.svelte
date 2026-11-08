<script lang="ts">
  import { m } from "$lib/i18n";
  import { onMount, untrack } from "svelte";
  import { requestConfirmation } from "$lib/stores/confirmationStore";
  import NumberField from "./NumberField.svelte";
  import { reputationApi } from "$lib/api/index.ts";
  import type { RepHistoryEntry, RepLeaderboardEntry } from "$lib/api/reputation/models";
  import { colorStore } from "$lib/stores/colorStore";
  import { logger } from "$lib/logger";
  import Sheet from "$lib/components/ui/Sheet.svelte";
  import { formatNumber, idString, utcDate, type Notify } from "./repModel";

  interface Props {
    guildId: bigint;
    entry: RepLeaderboardEntry;
    adminId: string | null;
    notify: Notify;
    onclose: () => void;
    onchanged: () => Promise<void>;
  }

  let { guildId, entry, adminId, notify, onclose, onchanged }: Props = $props();

  let total = $state(untrack(() => entry.reputation));
  let frozen = $state(false);
  let amount = $state(1);
  let busy = $state(false);

  const userId = untrack(() => BigInt(entry.userId));
  const solid = $derived(`background: ${$colorStore.primary}; color: ${$colorStore.onPrimary};`);

  async function loadMember() {
    try {
      const state = await reputationApi.getMemberRep(guildId, userId);
      total = state.totalRep;
      frozen = state.isFrozen;
    } catch (err) {
      logger.error("Failed to load member reputation:", err);
    }
  }

  async function change(action: () => Promise<{ totalRep: number } | void>) {
    busy = true;
    try {
      const result = await action();
      if (result) total = result.totalRep;
      else await loadMember();
      notify(m.reputation.memberUpdated());
      await onchanged();
    } catch (err) {
      logger.error("Failed to change member reputation:", err);
      notify(m.reputation.memberFailed(), "error");
    } finally {
      busy = false;
    }
  }

  async function reset() {
    const confirmed = await requestConfirmation({
      message: m.reputation.confirmReset({ username: entry.username }),
      confirmText: m.common.reset(),
      variant: "danger"
    });
    if (!confirmed) return;
    await change(async () => {
      await reputationApi.resetMemberRep(guildId, userId);
      total = 0;
    });
  }

  const pageSize = 20;
  let items = $state<RepHistoryEntry[]>([]);
  let page = $state(1);
  let loading = $state(true);

  const outline = $derived(
    `background: ${$colorStore.primary}10; color: ${$colorStore.text}; border: 1px solid ${$colorStore.primary}20;`
  );

  async function load(next: number) {
    if (next < 1) return;
    loading = true;
    try {
      items = (await reputationApi.getReputationHistory(guildId, BigInt(entry.userId), next, pageSize)) ?? [];
      page = next;
    } catch (err) {
      logger.error("Failed to load reputation history:", err);
      notify(m.reputation.errorLoadHistory(), "error");
    } finally {
      loading = false;
    }
  }

  onMount(() => {
    void load(1);
    void loadMember();
  });
</script>

<Sheet title={m.reputation.historyTitle()} {onclose} size="lg">
  <p class="text-sm" style="color: {$colorStore.muted}">{m.reputation.historySubtitle({ username: entry.username, reputation: formatNumber(total) })}{frozen ? ` · ${m.reputation.frozen()}` : ""}</p>

  {#if adminId}
    <div class="rounded-xl border p-3 space-y-3" style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}20;">
      <NumberField id="rep-member-amount" label={m.common.amount()} value={amount} min={0} onchange={(value) => (amount = value ?? 0)} />
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <button type="button" class="px-3 rounded-lg min-h-[44px] text-sm disabled:opacity-50" style={outline} disabled={busy || amount < 1} onclick={() => change(() => reputationApi.takeMemberRep(guildId, userId, amount, BigInt(adminId)))}>{m.reputation.take()}</button>
        <button type="button" class="px-3 rounded-lg min-h-[44px] text-sm disabled:opacity-50" style={outline} disabled={busy} onclick={() => change(() => reputationApi.setMemberRep(guildId, userId, amount, BigInt(adminId)))}>{m.reputation.setTotal()}</button>
        <button type="button" class="px-3 rounded-lg min-h-[44px] text-sm disabled:opacity-50" style={outline} disabled={busy} onclick={() => change(() => reputationApi.setMemberFrozen(guildId, userId, !frozen))}>{frozen ? m.reputation.unfreeze() : m.reputation.freeze()}</button>
        <button type="button" class="px-3 rounded-lg min-h-[44px] text-sm disabled:opacity-50" style="background: #ef444420; color: #ef4444; border: 1px solid #ef444430;" disabled={busy} onclick={reset}>{m.common.reset()}</button>
      </div>
    </div>
  {/if}

  {#if !loading && items.length === 0}
    <p class="text-sm" style="color: {$colorStore.muted}">{m.reputation.historyEmpty()}</p>
  {/if}

  {#each items as item (item.id)}
    <div class="flex items-start gap-3 p-3 rounded-lg min-w-0" style="background: {$colorStore.primary}08;">
      <span class="px-2 py-1 rounded-lg text-sm font-semibold shrink-0" style="background: {item.amount >= 0 ? '#10b98120' : '#ef444420'}; color: {$colorStore.text};">
        {item.amount >= 0 ? "+" : ""}{item.amount}
      </span>
      <div class="grow min-w-0 text-sm">
        <div style="color: {$colorStore.text}">
          <span class="font-medium">{item.repType}</span>
          <span style="color: {$colorStore.muted}">{item.isAnonymous ? m.reputation.historyFromAnonymous() : m.reputation.historyFromUser({ id: idString(item.giverId) })}</span>
        </div>
        {#if item.reason}
          <div class="text-xs mt-0.5 break-words" style="color: {$colorStore.muted}">{item.reason}</div>
        {/if}
        <div class="text-xs mt-1" style="color: {$colorStore.muted}">{utcDate(item.timestamp).toLocaleString()}</div>
      </div>
    </div>
  {/each}

  {#snippet footer()}
    <button type="button" class="px-4 rounded-lg min-h-[44px] text-sm disabled:opacity-40" style={outline} disabled={page <= 1 || loading} onclick={() => load(page - 1)}>{m.common.previous()}</button>
    <span class="px-3 text-sm" style="color: {$colorStore.muted}">{m.common.pageNumber({ page })}</span>
    <button type="button" class="px-4 rounded-lg min-h-[44px] text-sm disabled:opacity-40" style={outline} disabled={items.length < pageSize || loading} onclick={() => load(page + 1)}>{m.common.next()}</button>
  {/snippet}
</Sheet>
