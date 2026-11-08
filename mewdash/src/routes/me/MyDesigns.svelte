<script lang="ts">
  import { m } from "$lib/i18n";
  import { onMount } from "svelte";
  import { fly, slide } from "svelte/transition";
  import { colorStore } from "$lib/stores/colorStore";
  import { designsApi } from "$lib/api/index.ts";
  import { DesignTarget } from "$lib/api/designs/models";
  import type { DesignGuild, MemberDesign, MemberDesigns, MemberDesignSection, OwnDesign, OwnDesigns } from "$lib/api/designs/models";
  import type { CardTemplate } from "$lib/api/cards/models";
  import { logger } from "$lib/logger";
  import DesignPreview from "$lib/components/designs/DesignPreview.svelte";
  import MyDesignSheet from "./MyDesignSheet.svelte";

  interface Props {
    guildId: bigint | string;
    userId: bigint;
    onerror: (text: string) => void;
    onsuccess: (text: string) => void;
  }

  let { guildId, userId, onerror, onsuccess }: Props = $props();

  let guilds = $state<DesignGuild[]>([]);
  let loading = $state(true);
  let failed = $state(false);
  let open = $state<string | null>(null);
  let designs = $state<Record<string, MemberDesigns>>({});
  let loadingGuild = $state<string | null>(null);
  let busy = $state<string | null>(null);
  let owns = $state<Record<string, OwnDesigns>>({});
  let making = $state<{ id: string; target: DesignTarget } | null>(null);

  const sources: Record<string, () => string> = {
    free: () => m.designs.sourceFree(),
    purchase: () => m.designs.sourcePurchase(),
    level: () => m.designs.sourceLevel(),
    achievement: () => m.designs.sourceAchievement(),
    role: () => m.designs.sourceRole()
  };

  async function loadGuild(id: string) {
    if (designs[id]) return;
    loadingGuild = id;
    try {
      const [mine, own] = await Promise.all([
        designsApi.getMyDesigns(id, userId),
        designsApi.getOwn(id, userId).catch((err) => {
          logger.warn("Failed to load the own design rules", err);
          return null;
        })
      ]);
      designs = { ...designs, [id]: mine };
      if (own) owns = { ...owns, [id]: own };
    } catch (err: any) {
      logger.error("Failed to load member designs", err);
      onerror(err?.message || m.designs.meLoadFailed());
    } finally {
      loadingGuild = null;
    }
  }

  async function savedOwn(id: string, next: OwnDesigns, message: string) {
    owns = { ...owns, [id]: next };
    onsuccess(message);
    try {
      designs = { ...designs, [id]: await designsApi.getMyDesigns(id, userId) };
    } catch (err) {
      logger.error("Failed to refresh member designs", err);
    }
  }

  function ownFor(id: string, target: DesignTarget): OwnDesign | null {
    const own = owns[id];
    if (!own) return null;
    return target === DesignTarget.Rank ? own.rank : own.achievement;
  }

  function ownStatus(id: string, target: DesignTarget): string {
    const own = ownFor(id, target);
    if (!own) return m.designs.meOwnName();
    if (own.status === "pending") return m.designs.meWaiting();
    if (own.status === "rejected") return own.reviewNote ? m.designs.meRejectedReason({ reason: own.reviewNote }) : m.forms.labelStatusRejected();
    return own.active ? m.designs.meOwnName() : m.designs.memberInactive();
  }

  async function toggle(id: string) {
    open = open === id ? null : id;
    if (open) await loadGuild(id);
  }

  async function equip(id: string, design: MemberDesign) {
    busy = `${id}:${design.id}`;
    try {
      designs = { ...designs, [id]: await designsApi.equip(id, userId, design.id) };
    } catch (err: any) {
      logger.error("Failed to equip a design", err);
      onerror(err?.message || m.designs.meEquipFailed());
    } finally {
      busy = null;
    }
  }

  async function unequip(id: string, design: MemberDesign) {
    busy = `${id}:${design.id}`;
    try {
      designs = { ...designs, [id]: await designsApi.unequip(id, userId, design.target) };
    } catch (err: any) {
      logger.error("Failed to unequip a design", err);
      onerror(err?.message || m.designs.meUnequipFailed());
    } finally {
      busy = null;
    }
  }

  onMount(async () => {
    try {
      guilds = (await designsApi.getMyGuilds(guildId, userId)) ?? [];
      const anchor = guilds.find((g) => g.guildId.toString() === guildId.toString()) ?? guilds[0];
      if (anchor) {
        open = anchor.guildId.toString();
        await loadGuild(open);
      }
    } catch (err) {
      logger.error("Failed to load the designs list", err);
      failed = true;
    } finally {
      loading = false;
    }
  });
</script>

{#snippet section(id: string, title: string, target: DesignTarget, data: MemberDesignSection)}
  {@const own = owns[id]}
  {@const showOwn = own !== undefined && own.enabled && own.reason !== "disabled"}
  {#if data.designs.length > 0 || showOwn}
    <div class="space-y-2">
      <div class="flex flex-wrap items-center justify-between gap-2">
        <h5 class="text-sm font-semibold" style="color: {$colorStore.text}">{title}</h5>
        {#if showOwn && own.eligible}
          <button type="button" class="px-4 rounded-lg min-h-[44px] text-sm font-medium flex items-center gap-2"
                  style="background: {$colorStore.primary}20; color: {$colorStore.text}; border: 1px solid {$colorStore.primary}30;"
                  onclick={() => (making = { id, target })}>
            <i class="fa-solid fa-pen" aria-hidden="true"></i>
            {ownFor(id, target) ? m.designs.meEdit() : m.designs.meMake()}
          </button>
        {:else if showOwn}
          <p class="text-sm" style="color: {$colorStore.muted}">
            {own.reason === "role"
              ? m.designs.meNeedsRole({ roles: own.roleNames.join(", ") })
              : m.designs.meNeedsLevel({ level: own.minLevel })}
          </p>
        {/if}
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
        {#each data.designs as design (design.id)}
          {@const mine = design.id === data.equippedId}
          <div class="rounded-xl border p-3 space-y-3 min-w-0"
               style="background: {mine ? $colorStore.selectedSurface : `${$colorStore.primary}08`}; border-color: {mine ? $colorStore.selectedBorder : `${$colorStore.primary}20`};">
            <DesignPreview
              guildId={id}
              {target}
              backgroundUrl={design.backgroundUrl}
              template={target === DesignTarget.Achievement ? (design.data as CardTemplate) : null}
              version={design.id.toString()}
              name={design.name}
            />
            <div class="flex items-start justify-between gap-2">
              <div class="min-w-0">
                <div class="font-medium text-sm truncate" style="color: {$colorStore.text}">{design.source === "own" ? m.designs.meOwnName() : design.name}</div>
                <div class="text-xs break-words" style="color: {$colorStore.muted}">
                  {design.source === "own" ? ownStatus(id, target) : (sources[design.source]?.() ?? design.source)}{design.isDefault ? ` · ${m.designs.fieldDefault()}` : ""}
                </div>
              </div>
              {#if mine}
                <span class="text-xs px-2 py-1 rounded-lg shrink-0" style="background: {$colorStore.primary}20; color: {$colorStore.text};">{m.designs.meEquipped()}</span>
              {/if}
            </div>
            <button type="button" class="w-full px-4 rounded-lg min-h-[44px] text-sm font-medium disabled:opacity-50"
                    style={mine
                      ? `background: ${$colorStore.primary}10; color: ${$colorStore.text}; border: 1px solid ${$colorStore.primary}20;`
                      : `background: ${$colorStore.primary}; color: ${$colorStore.onPrimary};`}
                    disabled={busy !== null}
                    onclick={() => (mine ? unequip(id, design) : equip(id, design))}>
              {#if busy === `${id}:${design.id}`}
                <i class="fa-solid fa-spinner fa-spin" aria-hidden="true"></i>
              {:else}
                {mine ? m.designs.meUnequip() : m.designs.meEquip()}
              {/if}
            </button>
          </div>
        {/each}
      </div>
    </div>
  {/if}
{/snippet}

<div class="rounded-2xl p-6 border"
     style="background: {$colorStore.primary}0c; border-color: {$colorStore.primary}30;"
     in:fly={{ y: 20, duration: 300 }}>
  <h3 class="text-lg font-bold mb-4 flex items-center gap-2" style="color: {$colorStore.text}">
    <i class="fa-utility-duo fa-regular fa-palette text-xl"
       style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary};"></i>
    {m.designs.title()}
  </h3>

  {#if loading}
    <div class="py-8 text-center" style="color: {$colorStore.muted}"><i class="fa-solid fa-spinner fa-spin" aria-hidden="true"></i></div>
  {:else if failed}
    <p class="text-sm" style="color: {$colorStore.muted}">{m.designs.meLoadFailed()}</p>
  {:else if guilds.length === 0}
    <p class="text-sm" style="color: {$colorStore.muted}">{m.designs.meEmpty()}</p>
  {:else}
    <div class="space-y-3">
      {#each guilds as guild (guild.guildId.toString())}
        {@const id = guild.guildId.toString()}
        {@const expanded = open === id}
        <div class="rounded-xl" style="background: {$colorStore.primary}08;">
          <button type="button" class="w-full flex items-center gap-3 p-3 min-h-[56px] text-left" aria-expanded={expanded} onclick={() => toggle(id)}>
            {#if guild.iconUrl}
              <img src={guild.iconUrl} alt="" class="w-8 h-8 rounded-full shrink-0" />
            {:else}
              <span class="w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-xs font-semibold" style="background: {$colorStore.primary}20; color: {$colorStore.text};">{guild.name.slice(0, 1)}</span>
            {/if}
            <span class="flex-1 min-w-0">
              <span class="block text-sm font-medium truncate" style="color: {$colorStore.text}">{guild.name}</span>
              <span class="block text-xs" style="color: {$colorStore.muted}">
                {guild.available === 1 ? m.designs.meAvailableOne({ count: guild.available }) : m.designs.meAvailableOther({ count: guild.available })}
              </span>
            </span>
            <i class="fa-solid {expanded ? 'fa-chevron-up' : 'fa-chevron-down'} text-xs" style="color: {$colorStore.muted}" aria-hidden="true"></i>
          </button>
          {#if expanded}
            <div class="p-3 pt-0 space-y-4" transition:slide={{ duration: 150 }}>
              {#if loadingGuild === id && !designs[id]}
                <div class="py-4 text-center" style="color: {$colorStore.muted}"><i class="fa-solid fa-spinner fa-spin" aria-hidden="true"></i></div>
              {:else if designs[id]}
                {@render section(id, m.xp.cardRankTitle(), DesignTarget.Rank, designs[id].rank)}
                {@render section(id, m.designs.targetAchievement(), DesignTarget.Achievement, designs[id].achievement)}
              {/if}
            </div>
          {/if}
        </div>
      {/each}
    </div>
  {/if}
</div>

{#if making && owns[making.id]}
  {@const id = making.id}
  <MyDesignSheet
    guildId={id}
    {userId}
    target={making.target}
    own={owns[id]}
    {onerror}
    onclose={() => (making = null)}
    onsaved={(next, message) => savedOwn(id, next, message)}
  />
{/if}
