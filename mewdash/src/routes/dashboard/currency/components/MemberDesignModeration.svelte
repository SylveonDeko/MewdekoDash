<script lang="ts">
  import { m } from "$lib/i18n";
  import { untrack } from "svelte";
  import { designsApi } from "$lib/api/index.ts";
  import { DesignTarget } from "$lib/api/designs/models";
  import type { MemberDesignAdmin, MemberDesignStatus } from "$lib/api/designs/models";
  import type { CardTemplate } from "$lib/api/cards/models";
  import { colorStore } from "$lib/stores/colorStore";
  import { logger } from "$lib/logger";
  import PluginCard from "$lib/components/plugin/PluginCard.svelte";
  import DesignPreview from "$lib/components/designs/DesignPreview.svelte";
  import MemberDesignReasonSheet from "./MemberDesignReasonSheet.svelte";
  import type { Notify } from "./currencyModel";

  interface Props {
    guildId: bigint;
    notify: Notify;
    onchanged: () => void;
  }

  let { guildId, notify, onchanged }: Props = $props();

  type Filter = "all" | MemberDesignStatus;

  let filter = $state<Filter>("all");
  let items = $state<MemberDesignAdmin[]>([]);
  let pending = $state(0);
  let loaded = $state(false);
  let busy = $state<number | null>(null);
  let images = $state<Record<string, string>>({});
  let asking = $state<{ item: MemberDesignAdmin; kind: "reject" | "remove" } | null>(null);

  const filters = $derived<{ id: Filter; label: string }[]>([
    { id: "all", label: m.common.all() },
    { id: "pending", label: m.common.pending() },
    { id: "approved", label: m.common.approved() },
    { id: "rejected", label: m.forms.labelStatusRejected() }
  ]);
  const statusLabels = $derived<Record<MemberDesignStatus, string>>({
    approved: m.common.approved(),
    pending: m.common.pending(),
    rejected: m.forms.labelStatusRejected()
  });
  const statusTints = $derived<Record<MemberDesignStatus, string>>({
    approved: `${$colorStore.primary}20`,
    pending: "#f59e0b20",
    rejected: "#ef444420"
  });

  function imageKey(item: MemberDesignAdmin): string {
    return `${item.id}:${item.dateUpdated}`;
  }

  async function load() {
    try {
      const list = await designsApi.listMemberDesigns(guildId, filter === "all" ? undefined : filter);
      items = list.items ?? [];
      pending = list.pending;
      void fetchImages(list.items ?? []);
    } catch (err) {
      logger.error("Failed to load the member designs", err);
      notify(m.designs.notifyMemberLoadFailed(), "error");
    } finally {
      loaded = true;
    }
  }

  async function fetchImages(list: MemberDesignAdmin[]) {
    for (const item of list) {
      if (!item.hasUpload) continue;
      const key = imageKey(item);
      if (untrack(() => images[key])) continue;
      try {
        const image = await designsApi.getMemberDesignImage(guildId, item.id);
        if (image?.dataUrl) images = { ...images, [key]: image.dataUrl };
      } catch (err) {
        logger.warn("Failed to load a member design upload", err);
      }
    }
  }

  function rankBackground(item: MemberDesignAdmin): string | null {
    return images[imageKey(item)] ?? item.backgroundUrl;
  }

  async function finish(done: () => Promise<void>, doneMessage: string, item: MemberDesignAdmin) {
    busy = item.id;
    try {
      await done();
      await load();
      onchanged();
      asking = null;
    } catch (err: any) {
      logger.error("Failed to moderate a member design", err);
      notify(err?.message ?? m.designs.notifyMemberFailed(), "error");
      return;
    } finally {
      busy = null;
    }
    notify(doneMessage);
  }

  async function approve(item: MemberDesignAdmin) {
    await finish(() => designsApi.approveMemberDesign(guildId, item.id), m.designs.notifyMemberApproved(), item);
  }

  async function confirmAsk(reason: string) {
    if (!asking) return;
    const { item, kind } = asking;
    let notified = true;
    busy = item.id;
    try {
      const result =
        kind === "reject"
          ? await designsApi.rejectMemberDesign(guildId, item.id, reason || undefined)
          : await designsApi.removeMemberDesign(guildId, item.id, reason || undefined);
      notified = result?.notified ?? true;
      asking = null;
      await load();
      onchanged();
    } catch (err: any) {
      logger.error("Failed to moderate a member design", err);
      notify(err?.message ?? m.designs.notifyMemberFailed(), "error");
      return;
    } finally {
      busy = null;
    }
    notify(
      notified
        ? kind === "reject"
          ? m.designs.notifyMemberRejected()
          : m.designs.notifyMemberRemoved()
        : m.designs.notifyMemberDmsClosed(),
      notified ? "success" : "warning"
    );
  }

  $effect(() => {
    void filter;
    void load();
  });
</script>

<PluginCard title={m.designs.linkTitle()} alwaysOpen>
  <div class="flex flex-wrap gap-2" role="group" aria-label={m.designs.memberFilterAria()}>
    {#each filters as option (option.id)}
      {@const selected = filter === option.id}
      <button
        type="button"
        class="min-h-[44px] px-4 rounded-lg border text-sm font-medium flex items-center gap-2"
        style="background: {selected ? $colorStore.selectedSurface : `${$colorStore.primary}08`}; border-color: {selected ? $colorStore.selectedBorder : `${$colorStore.primary}20`}; color: {$colorStore.text};"
        aria-pressed={selected}
        onclick={() => (filter = option.id)}
      >
        {option.label}
        {#if option.id === "pending" && pending > 0}
          <span class="text-xs px-1.5 rounded-md tabular-nums" style="background: {$colorStore.primary}20;">{pending}</span>
        {/if}
      </button>
    {/each}
  </div>

  {#if loaded && items.length === 0}
    <p class="text-sm" style="color: {$colorStore.muted}">{m.designs.memberListEmpty()}</p>
  {/if}

  <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
    {#each items as item (item.id)}
      {@const upload = images[imageKey(item)]}
      <div class="rounded-xl border p-3 space-y-3 min-w-0" style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}20;">
        <DesignPreview
          {guildId}
          target={item.target}
          backgroundUrl={rankBackground(item)}
          template={item.target === DesignTarget.Achievement ? (item.data as CardTemplate) : null}
          version={`${item.id}:${item.dateUpdated}`}
          name={item.userName ?? m.common.userFallback({ id: item.userId.toString() })}
        />
        {#if item.target === DesignTarget.Achievement && upload}
          <img src={upload} alt="" class="w-full max-h-32 rounded-lg object-cover" />
        {/if}
        <div class="flex items-center justify-between gap-3">
          <div class="flex items-center gap-2 min-w-0">
            {#if item.avatarUrl}
              <img src={item.avatarUrl} alt="" class="w-8 h-8 rounded-full shrink-0" />
            {:else}
              <span class="w-8 h-8 rounded-full shrink-0" style="background: {$colorStore.primary}20;"></span>
            {/if}
            <span class="font-medium text-sm truncate" style="color: {$colorStore.text}">
              {item.userName ?? m.common.userFallback({ id: item.userId.toString() })}
            </span>
          </div>
          <div class="flex flex-wrap justify-end gap-1.5 shrink-0">
            <span class="text-xs px-2 py-1 rounded-lg" style="background: {$colorStore.primary}15; color: {$colorStore.muted};">
              {item.target === DesignTarget.Rank ? m.xp.cardRankTitle() : m.designs.targetAchievement()}
            </span>
            <span class="text-xs px-2 py-1 rounded-lg" style="background: {statusTints[item.status]}; color: {$colorStore.text};">
              {statusLabels[item.status]}
            </span>
          </div>
        </div>
        {#if !item.active && item.status === "approved"}
          <p class="text-xs" style="color: {$colorStore.muted}">{m.designs.memberInactive()}</p>
        {/if}
        {#if item.status === "rejected" && item.reviewNote}
          <p class="text-xs break-words" style="color: {$colorStore.muted}">{item.reviewNote}</p>
        {/if}
        <div class="flex flex-wrap gap-2">
          {#if item.status === "pending"}
            <button type="button" class="px-4 rounded-lg min-h-[44px] text-sm font-medium disabled:opacity-50"
                    style="background: {$colorStore.primary}; color: {$colorStore.onPrimary};" disabled={busy !== null} onclick={() => approve(item)}>
              {m.common.approve()}
            </button>
            <button type="button" class="px-4 rounded-lg min-h-[44px] text-sm disabled:opacity-50"
                    style="background: {$colorStore.primary}10; color: {$colorStore.text}; border: 1px solid {$colorStore.primary}20;" disabled={busy !== null}
                    onclick={() => (asking = { item, kind: "reject" })}>
              {m.forms.queueReject()}
            </button>
          {/if}
          <button type="button" class="px-4 rounded-lg min-h-[44px] text-sm disabled:opacity-50"
                  style="background: #ef444420; color: #ef4444; border: 1px solid #ef444430;" disabled={busy !== null}
                  onclick={() => (asking = { item, kind: "remove" })}>
            {m.common.remove()}
          </button>
        </div>
      </div>
    {/each}
  </div>
</PluginCard>

{#if asking}
  <MemberDesignReasonSheet
    title={asking.kind === "reject" ? m.designs.memberRejectTitle() : m.designs.memberRemoveTitle()}
    confirmText={asking.kind === "reject" ? m.forms.queueReject() : m.common.remove()}
    busy={busy !== null}
    onclose={() => (asking = null)}
    onconfirm={confirmAsk}
  />
{/if}
