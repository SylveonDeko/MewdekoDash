<script lang="ts">
  import { m } from "$lib/i18n";
  import { onMount } from "svelte";
  import { moderationApi } from "$lib/api/index.ts";
  import { colorStore } from "$lib/stores/colorStore";
  import { logger } from "$lib/logger";
  import ConfirmationModal from "$lib/components/ui/ConfirmationModal.svelte";
  import PluginCard from "$lib/components/plugin/PluginCard.svelte";

  interface Props {
    guildId: bigint;
    moderatorId: bigint | null;
    onerror: (message: string) => void;
  }

  let { guildId, moderatorId, onerror }: Props = $props();

  let warnings: any[] = $state([]);
  let search = $state("");
  let showForgiven = $state(true);
  let busy = $state(false);
  let showWarnForm = $state(false);
  let warnUserId = $state("");
  let warnReason = $state("");
  let warnError = $state("");
  let pendingDelete: any | null = $state(null);
  let pendingForgiveAllUser: string | null = $state(null);

  const activeCount = $derived(warnings.filter(w => !w.forgiven).length);
  const forgivenCount = $derived(warnings.length - activeCount);

  const filtered = $derived.by(() => {
    const term = search.trim().toLowerCase();
    return warnings.filter(w => {
      if (!showForgiven && w.forgiven) return false;
      if (!term) return true;
      return w.userId.toString().includes(term)
        || (w.reason || "").toLowerCase().includes(term)
        || (w.moderator || "").toLowerCase().includes(term);
    });
  });

  const groups = $derived.by(() => {
    const map = new Map<string, any[]>();
    for (const w of filtered) {
      const key = w.userId.toString();
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(w);
    }
    return Array.from(map.entries()).map(([userId, items]) => ({
      userId,
      items,
      active: items.filter(i => !i.forgiven).length
    }));
  });

  const inputStyle = $derived(
    `background: ${$colorStore.primary}08; border-color: ${$colorStore.primary}30; color: ${$colorStore.text};`
  );

  function formatDate(dateString: string | null): string {
    return dateString ? new Date(dateString).toLocaleString() : m.common.unknown();
  }

  async function load() {
    try {
      warnings = await moderationApi.getWarnings(guildId);
    } catch (err) {
      logger.error("Failed to load warnings:", err);
      onerror(m.moderation.errorLoadData());
    }
  }

  async function run(action: () => Promise<unknown>, failure: string) {
    busy = true;
    try {
      await action();
      await load();
    } catch (err) {
      logger.error(failure, err);
      onerror(failure);
    } finally {
      busy = false;
    }
  }

  const forgive = (warning: any) =>
    moderatorId && run(() => moderationApi.forgiveWarning(guildId, warning.id, moderatorId), m.moderation.errorForgiveWarning());

  const forgiveAll = (userId: string) =>
    moderatorId && run(() => moderationApi.forgiveAllWarnings(guildId, BigInt(userId), moderatorId), m.moderation.errorForgiveWarnings());

  const remove = (warning: any) =>
    run(() => moderationApi.deleteWarning(guildId, warning.id), m.moderation.errorDeleteWarning());

  async function submitWarn() {
    warnError = "";
    if (!moderatorId) return;
    if (!/^\d{15,22}$/.test(warnUserId.trim())) {
      warnError = m.common.invalidUserId();
      return;
    }
    if (!warnReason.trim()) {
      warnError = m.moderation.warnReasonRequired();
      return;
    }
    busy = true;
    try {
      await moderationApi.warnUser(guildId, BigInt(warnUserId.trim()), { moderatorId, reason: warnReason.trim() });
      warnUserId = "";
      warnReason = "";
      showWarnForm = false;
      await load();
    } catch (err) {
      logger.error("Failed to warn user:", err);
      warnError = m.moderation.warnFailed();
    } finally {
      busy = false;
    }
  }

  onMount(() => {
    void load();
  });
</script>

<PluginCard title={m.moderation.warningsTitle()} note={m.moderation.warningsSummary({ active: activeCount, forgiven: forgivenCount })}>
  {#snippet actions()}
    <button
      class="flex items-center justify-center gap-2 px-5 rounded-xl min-h-[50px] font-medium"
      style="background: {$colorStore.primary}20; color: {$colorStore.primary}; border: 1px solid {$colorStore.primary}30;"
      onclick={() => { showWarnForm = !showWarnForm; warnError = ""; }}
    >
      <i class="fa-solid {showWarnForm ? 'fa-xmark' : 'fa-plus'}" aria-hidden="true"></i>
      {showWarnForm ? m.common.cancel() : m.moderation.warningsWarnUser()}
    </button>
  {/snippet}

  {#if showWarnForm}
    <form
      class="grid grid-cols-1 md:grid-cols-[220px_1fr_auto] gap-3"
      onsubmit={(e) => { e.preventDefault(); void submitWarn(); }}
    >
      <input type="text" inputmode="numeric" bind:value={warnUserId} placeholder={m.common.userId()} aria-label={m.moderation.warningsUserIdLabel()}
             class="p-3 rounded-lg border min-h-[50px]" style={inputStyle}>
      <input type="text" bind:value={warnReason} placeholder={m.moderation.warningsReasonPlaceholder()} aria-label={m.moderation.warningsReasonLabel()} maxlength="500"
             class="p-3 rounded-lg border min-h-[50px]" style={inputStyle}>
      <button
        type="submit"
        disabled={busy}
        class="px-6 rounded-xl font-medium flex items-center justify-center gap-2 min-h-[50px] disabled:opacity-50"
        style="background: {$colorStore.primary}20; color: {$colorStore.primary}; border: 1px solid {$colorStore.primary}30;"
      >
        {m.common.warn()}
      </button>
      {#if warnError}
        <p class="text-sm md:col-span-3" role="alert" style="color: {$colorStore.accent}">{warnError}</p>
      {/if}
    </form>
  {/if}

  {#if warnings.length > 0}
    <div class="flex flex-col sm:flex-row gap-3">
      <input type="text" bind:value={search} placeholder={m.moderation.warningsSearchPlaceholder()} aria-label={m.moderation.warningsSearchLabel()}
             class="flex-1 p-3 rounded-lg border min-h-[50px]" style={inputStyle}>
      <label class="flex items-center gap-2 px-3 rounded-lg cursor-pointer min-h-[50px] text-sm"
             style="background: {$colorStore.primary}08; color: {$colorStore.text};">
        <input type="checkbox" bind:checked={showForgiven} class="w-4 h-4 rounded" style="accent-color: {$colorStore.primary};">
        {m.moderation.warningsShowForgiven()}
      </label>
    </div>
  {/if}

  {#if warnings.length === 0}
    <p class="text-sm" style="color: {$colorStore.muted}">{m.moderation.warningsEmpty()}</p>
  {:else if filtered.length === 0}
    <p class="text-sm" style="color: {$colorStore.muted}">{m.moderation.warningsNoMatch()}</p>
  {:else}
    <div class="space-y-4 max-h-[40rem] overflow-y-auto pr-1">
      {#each groups as group (group.userId)}
        <div class="rounded-xl border p-4" style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}20;">
          <div class="flex flex-wrap items-center justify-between gap-2 mb-3">
            <div class="flex items-center gap-2">
              <span class="font-medium" style="color: {$colorStore.text}">{m.common.userFallback({ id: group.userId })}</span>
              <span class="text-xs" style="color: {$colorStore.muted}">{m.common.activeCount({ count: group.active })}</span>
            </div>
            {#if group.active > 0}
              <button
                class="px-3 rounded-lg text-xs font-medium min-h-[44px] disabled:opacity-50"
                style="background: {$colorStore.primary}10; color: {$colorStore.text}; border: 1px solid {$colorStore.primary}20;"
                disabled={busy}
                onclick={() => (pendingForgiveAllUser = group.userId)}
              >
                {m.moderation.warningsForgiveAll()}
              </button>
            {/if}
          </div>
          <div class="space-y-2">
            {#each group.items as warning (warning.id)}
              <div class="flex items-start gap-3 p-3 rounded-lg" style="background: {$colorStore.primary}08; opacity: {warning.forgiven ? 0.7 : 1};">
                <div class="flex-1 min-w-0">
                  <p class="text-sm break-words" style="color: {$colorStore.text}">
                    {warning.reason || m.common.noReasonProvided()}
                    {#if warning.forgiven}
                      <span class="ml-2 text-xs" style="color: {$colorStore.muted}">
                        {warning.forgivenBy ? m.moderation.warningsForgivenBy({ name: warning.forgivenBy }) : m.moderation.warningsForgiven()}
                      </span>
                    {/if}
                  </p>
                  <div class="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs mt-1" style="color: {$colorStore.muted}">
                    <span>{m.moderation.warningsBy({ name: warning.moderator || m.common.unknown() })}</span>
                    <span>{formatDate(warning.dateAdded)}</span>
                  </div>
                </div>
                <div class="flex items-center gap-1 shrink-0">
                  {#if !warning.forgiven}
                    <button
                      class="p-2 rounded-lg min-h-[44px] min-w-[44px] disabled:opacity-50"
                      style="background: {$colorStore.primary}10; color: {$colorStore.text};"
                      disabled={busy}
                      aria-label={m.moderation.warningsForgiveLabel()}
                      title={m.moderation.warningsForgive()}
                      onclick={() => forgive(warning)}
                    >
                      <i class="fa-solid fa-check" style="font-size: 14px;" aria-hidden="true"></i>
                    </button>
                  {/if}
                  <button
                    class="p-2 rounded-lg min-h-[44px] min-w-[44px] disabled:opacity-50"
                    style="background: {$colorStore.primary}10; color: {$colorStore.muted};"
                    disabled={busy}
                    aria-label={m.moderation.warningsDeleteLabel()}
                    title={m.moderation.warningsDeleteTitle()}
                    onclick={() => (pendingDelete = warning)}
                  >
                    <i class="fa-solid fa-trash" style="font-size: 14px;" aria-hidden="true"></i>
                  </button>
                </div>
              </div>
            {/each}
          </div>
        </div>
      {/each}
    </div>
  {/if}
</PluginCard>

<ConfirmationModal
  isOpen={pendingDelete !== null}
  title={m.moderation.deleteWarningTitle()}
  message={m.moderation.deleteWarningMessage()}
  confirmText={m.common.delete()}
  onconfirm={async () => {
    const target = pendingDelete;
    pendingDelete = null;
    if (target) await remove(target);
  }}
  oncancel={() => (pendingDelete = null)}
/>

<ConfirmationModal
  isOpen={pendingForgiveAllUser !== null}
  title={m.moderation.forgiveAllTitle()}
  message={pendingForgiveAllUser ? m.moderation.forgiveAllMessage({ id: pendingForgiveAllUser }) : ""}
  confirmText={m.moderation.warningsForgiveAll()}
  variant="warning"
  onconfirm={async () => {
    const target = pendingForgiveAllUser;
    pendingForgiveAllUser = null;
    if (target) await forgiveAll(target);
  }}
  oncancel={() => (pendingForgiveAllUser = null)}
/>
