<script lang="ts">
  import { m } from "$lib/i18n";
  import { onMount } from "svelte";
  import { designsApi } from "$lib/api/index.ts";
  import { DesignAvailability, DesignTarget, DesignUnlockType } from "$lib/api/designs/models";
  import type { Design } from "$lib/api/designs/models";
  import type { CardTemplate } from "$lib/api/cards/models";
  import { colorStore } from "$lib/stores/colorStore";
  import { requestConfirmation } from "$lib/stores/confirmationStore";
  import { logger } from "$lib/logger";
  import PluginCard from "$lib/components/plugin/PluginCard.svelte";
  import DesignPreview from "$lib/components/designs/DesignPreview.svelte";
  import type { AutoSave } from "$lib/utils/autoSave.svelte";
  import DesignSheet from "./DesignSheet.svelte";
  import MemberDesignModeration from "./MemberDesignModeration.svelte";
  import MemberDesignSettings from "./MemberDesignSettings.svelte";
  import type { Named, Notify } from "./currencyModel";

  interface Props {
    guildId: bigint;
    roles: Named[];
    autoSave: AutoSave;
    notify: Notify;
  }

  let { guildId, roles, autoSave, notify }: Props = $props();

  let memberVersion = $state(0);
  let designs = $state<Design[]>([]);
  let loaded = $state(false);
  let editing = $state<{ design: Design | null } | null>(null);

  const iconButton = $derived(
    `background: ${$colorStore.primary}10; color: ${$colorStore.text}; border: 1px solid ${$colorStore.primary}20;`
  );

  async function load() {
    try {
      designs = (await designsApi.list(guildId)) ?? [];
    } catch (err) {
      logger.error("Failed to load the designs", err);
      notify(m.designs.notifyLoadFailed(), "error");
    } finally {
      loaded = true;
    }
  }

  function availabilityLabel(design: Design): string {
    if (design.availability === DesignAvailability.Shop) return m.designs.availabilityShop();
    if (design.availability === DesignAvailability.Free) return m.designs.availabilityFree();
    if (design.unlockType === DesignUnlockType.Level) return m.common.levelNumber({ level: design.unlockLevel ?? 0 });
    if (design.unlockType === DesignUnlockType.Achievement) {
      return m.designs.unlockAchievementSummary({ name: design.unlockAchievementName ?? design.unlockAchievementKey ?? "" });
    }
    return m.designs.unlockRoleSummary({ name: design.unlockRoleName ?? m.common.notAvailable() });
  }

  async function remove(design: Design) {
    const confirmed = await requestConfirmation({
      message: m.designs.confirmDelete({ name: design.name }),
      confirmText: m.common.delete(),
      variant: "danger"
    });
    if (!confirmed) return;
    try {
      await designsApi.remove(guildId, design.id);
      designs = designs.filter((x) => x.id !== design.id);
      notify(m.designs.notifyDeleted({ name: design.name }));
    } catch (err: any) {
      logger.error("Failed to delete a design", err);
      notify(err?.message ?? m.achievements.cardsTabErrorDelete(), "error");
    }
  }

  onMount(() => {
    void load();
  });
</script>

<div class="space-y-4 min-w-0">
  <PluginCard title={m.designs.title()} alwaysOpen>
    {#snippet actions()}
      <button
        type="button"
        class="flex items-center justify-center gap-2 px-5 rounded-xl min-h-[50px] font-medium"
        style="background: {$colorStore.primary}20; color: {$colorStore.text}; border: 1px solid {$colorStore.primary}30;"
        onclick={() => (editing = { design: null })}
      >
        <i class="fa-solid fa-plus" aria-hidden="true"></i>{m.achievements.cardsTabNewDesign()}
      </button>
    {/snippet}

    {#if loaded && designs.length === 0}
      <p class="text-sm" style="color: {$colorStore.muted}">{m.designs.empty()}</p>
    {/if}

    <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
      {#each designs as design (design.id)}
        <div class="rounded-xl border p-3 space-y-3 min-w-0" style="background: {$colorStore.primary}08; border-color: {design.isDefault ? $colorStore.selectedBorder : `${$colorStore.primary}20`};">
          <DesignPreview
            {guildId}
            target={design.target}
            backgroundUrl={design.backgroundUrl}
            template={design.target === DesignTarget.Achievement ? (design.data as CardTemplate) : null}
            version={`${design.id}:${design.dateUpdated}`}
            name={design.name}
          />
          <div class="flex items-start justify-between gap-3">
            <h4 class="font-semibold truncate min-w-0" style="color: {$colorStore.text}">{design.name}</h4>
            <div class="flex flex-wrap justify-end gap-1.5 shrink-0">
              {#if design.isDefault}
                <span class="text-xs px-2 py-1 rounded-lg" style="background: {$colorStore.selectedSurface}; color: {$colorStore.text};">{m.common.default()}</span>
              {/if}
              <span class="text-xs px-2 py-1 rounded-lg" style="background: {$colorStore.primary}15; color: {$colorStore.muted};">
                {design.target === DesignTarget.Rank ? m.xp.cardRankTitle() : m.designs.targetAchievement()}
              </span>
            </div>
          </div>
          <div class="text-xs space-y-1" style="color: {$colorStore.muted}">
            <div>{availabilityLabel(design)}</div>
            {#if design.shopItemName}<div>{m.designs.soldAs({ name: design.shopItemName })}</div>{/if}
            <div>{design.ownedCount === 1 ? m.designs.ownersOne({ count: design.ownedCount }) : m.designs.ownersOther({ count: design.ownedCount })}</div>
          </div>
          <div class="flex flex-wrap gap-2">
            <button type="button" class="px-4 rounded-lg min-h-[44px] text-sm" style={iconButton} onclick={() => (editing = { design })}>{m.common.edit()}</button>
            <button type="button" class="px-4 rounded-lg min-h-[44px] text-sm" style="background: #ef444420; color: #ef4444; border: 1px solid #ef444430;" onclick={() => remove(design)}>{m.common.delete()}</button>
          </div>
        </div>
      {/each}
    </div>
  </PluginCard>

  <MemberDesignSettings {guildId} {roles} {autoSave} {notify} version={memberVersion} />
  <MemberDesignModeration {guildId} {notify} onchanged={() => memberVersion++} />
</div>

{#if editing}
  <DesignSheet {guildId} design={editing.design} {roles} {notify} onclose={() => (editing = null)} onsaved={load} />
{/if}
