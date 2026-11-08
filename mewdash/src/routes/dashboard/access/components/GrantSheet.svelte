<script lang="ts">
  import { untrack } from "svelte";
  import { m } from "$lib/i18n";
  import { dashboardAccessApi } from "$lib/api/index.ts";
  import {
    DashboardAccessLevel,
    DashboardAccessTargetType,
    type DashboardAccessGrant
  } from "$lib/api/dashboardaccess/models";
  import { dashboardAccessSectionGroups } from "$lib/config/dashboardAccessSections";
  import { categoryLabel, categoryOrder } from "$lib/config/navigationItems";
  import { colorStore } from "$lib/stores/colorStore";
  import { logger } from "$lib/logger";
  import Sheet from "$lib/components/ui/Sheet.svelte";
  import TargetPicker from "./TargetPicker.svelte";
  import { errorText, type Named } from "./accessModel";

  interface Props {
    guildId: bigint;
    grant: DashboardAccessGrant | null;
    roles: Named[];
    members: Named[];
    onclose: () => void;
    onsaved: (grants: DashboardAccessGrant[]) => void;
    onerror: (message: string) => void;
  }

  let { guildId, grant, roles, members, onclose, onsaved, onerror }: Props = $props();

  const levels = [DashboardAccessLevel.None, DashboardAccessLevel.View, DashboardAccessLevel.Manage];

  let targetType: DashboardAccessTargetType = $state(untrack(() => grant?.targetType ?? DashboardAccessTargetType.User));
  let targetId: string | null = $state(untrack(() => (grant ? grant.targetId.toString() : null)));
  let levelBySection: Record<string, DashboardAccessLevel> = $state(untrack(() => ({ ...(grant?.sections ?? {}) })));
  let saving = $state(false);

  const levelLabels: Record<DashboardAccessLevel, string> = $derived({
    [DashboardAccessLevel.None]: m.common.none(),
    [DashboardAccessLevel.View]: m.common.view(),
    [DashboardAccessLevel.Manage]: m.common.manage()
  });

  const groupedSections = categoryOrder
    .map((category) => ({
      category,
      groups: dashboardAccessSectionGroups.filter((g) => g.category === category)
    }))
    .filter((c) => c.groups.length > 0);

  const allSections = dashboardAccessSectionGroups.flatMap((g) => g.sections);

  function lowest(sections: string[]): DashboardAccessLevel {
    return sections.reduce<DashboardAccessLevel>(
      (min, section) => Math.min(min, levelBySection[section] ?? DashboardAccessLevel.None) as DashboardAccessLevel,
      DashboardAccessLevel.Manage
    );
  }

  function uniform(sections: string[]): DashboardAccessLevel | null {
    const first = levelBySection[sections[0]] ?? DashboardAccessLevel.None;
    return sections.every((s) => (levelBySection[s] ?? DashboardAccessLevel.None) === first) ? first : null;
  }

  function setLevel(sections: string[], level: DashboardAccessLevel) {
    const next = { ...levelBySection };
    for (const section of sections) next[section] = level;
    levelBySection = next;
  }

  async function save() {
    if (!targetId) {
      onerror(m.access.notifySelectTarget());
      return;
    }
    const sections = Object.entries(levelBySection)
      .filter(([, level]) => level !== DashboardAccessLevel.None)
      .map(([section, level]) => ({ section, level }));
    if (sections.length === 0) {
      onerror(m.access.notifySelectSection());
      return;
    }
    saving = true;
    try {
      await dashboardAccessApi.upsertGrant(guildId, { targetType, targetId: BigInt(targetId), sections });
      onsaved(await dashboardAccessApi.getGrants(guildId));
    } catch (err) {
      logger.error("Failed to save dashboard access grant:", err);
      onerror(errorText(err, m.access.errorSaveGrant()));
    } finally {
      saving = false;
    }
  }
</script>

{#snippet levelButtons(sections: string[], label: string)}
  {@const current = sections.length === allSections.length ? uniform(sections) : lowest(sections)}
  <div class="grid grid-cols-3 gap-2 w-full sm:w-auto sm:min-w-[15rem]" role="group" aria-label={label}>
    {#each levels as level (level)}
      {@const selected = current === level}
      <button
        type="button"
        class="min-h-[44px] px-3 rounded-lg border text-sm font-medium"
        style="background: {selected ? $colorStore.selectedSurface : `${$colorStore.primary}08`}; border-color: {selected ? $colorStore.selectedBorder : `${$colorStore.primary}20`}; color: {$colorStore.text};"
        aria-pressed={selected}
        onclick={() => setLevel(sections, level)}
      >
        {levelLabels[level]}
      </button>
    {/each}
  </div>
{/snippet}

<Sheet title={grant ? m.access.grantHeadingEdit() : m.access.grantHeadingNew()} {onclose}>
  <TargetPicker bind:targetType bind:targetId {roles} {members} disabled={grant !== null} />

  <div
    class="flex flex-col sm:flex-row sm:items-center gap-2 rounded-xl border p-3"
    style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}20;"
  >
    <span class="grow text-sm font-medium" style="color: {$colorStore.text}">{m.access.allSections()}</span>
    {@render levelButtons(allSections, m.access.allSections())}
  </div>

  {#each groupedSections as { category, groups } (category)}
    <div class="space-y-2">
      <h4 class="text-sm font-medium" style="color: {$colorStore.muted}">{categoryLabel(category)}</h4>
      {#each groups as group (group.sections.join())}
        <div
          class="flex flex-col sm:flex-row sm:items-center gap-2 rounded-xl border p-3"
          style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}20;"
        >
          <span class="grow min-w-0 text-sm flex items-center gap-2" style="color: {$colorStore.text}">
            <i class="{group.icon.replace('fa-utility-duo ', '')} w-4 text-center shrink-0" style="color: {$colorStore.muted}" aria-hidden="true"></i>
            <span class="truncate">{group.label()}</span>
          </span>
          {@render levelButtons(group.sections, group.label())}
        </div>
      {/each}
    </div>
  {/each}

  {#snippet footer()}
    <button
      type="button"
      class="px-5 rounded-xl min-h-[44px] font-medium"
      style="background: {$colorStore.primary}10; color: {$colorStore.text}; border: 1px solid {$colorStore.primary}20;"
      onclick={onclose}
    >
      {m.common.cancel()}
    </button>
    <button
      type="button"
      class="px-5 rounded-xl min-h-[44px] font-medium disabled:opacity-50"
      style="background: {$colorStore.primary}; color: {$colorStore.onPrimary};"
      disabled={saving || !targetId}
      onclick={save}
    >
      {saving ? m.common.saving() : grant ? m.common.saveChanges() : m.access.grantButton()}
    </button>
  {/snippet}
</Sheet>
