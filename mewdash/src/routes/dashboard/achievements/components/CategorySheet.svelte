<script lang="ts">
  import { m } from "$lib/i18n";
  import { untrack } from "svelte";
  import { colorStore } from "$lib/stores/colorStore";
  import { currentGuild } from "$lib/stores/currentGuild";
  import {
    achievementsApi,
    type AchievementCatalog,
    type AchievementCategory,
    type AchievementLookups
  } from "$lib/api/index.ts";
  import { logger } from "$lib/logger";
  import Sheet from "$lib/components/ui/Sheet.svelte";
  import SettingField from "$lib/components/forms/SettingField.svelte";
  import IconPicker from "./IconPicker.svelte";

  interface Props {
    category: AchievementCategory | null;
    catalog: AchievementCatalog;
    lookups: AchievementLookups | null;
    onchanged: () => Promise<void>;
    onerror: (text: string) => void;
    onclose: () => void;
  }

  let { category, catalog, lookups, onchanged, onerror, onclose }: Props = $props();

  const initial = untrack(() => category);

  let name = $state(initial?.name ?? "");
  let description = $state(initial?.description ?? "");
  let icon = $state<string | null>(initial && initial.icon !== "fa:folder" ? initial.icon : null);
  let saving = $state(false);

  const field = $derived(
    `background: ${$colorStore.primary}10; border-color: ${$colorStore.primary}30; color: ${$colorStore.text};`
  );

  async function save() {
    const guildId = $currentGuild?.id;
    if (!guildId || saving || !name.trim()) return;
    saving = true;
    try {
      if (initial?.id !== undefined && initial?.id !== null) {
        await achievementsApi.updateCategory(guildId, initial.id, name.trim(), description.trim() || null, icon);
      } else {
        await achievementsApi.createCategory(guildId, name.trim(), description.trim() || null, icon);
      }
      await onchanged();
      onclose();
    } catch (err: any) {
      logger.error("Failed to save a category:", err);
      onerror(err?.message || (initial ? m.achievements.categoriesErrorSave() : m.achievements.categoriesErrorCreate()));
    } finally {
      saving = false;
    }
  }

  const title = $derived(initial ? initial.name : m.achievements.categoriesNewTitle());
</script>

{#snippet footer()}
  <button type="button" class="px-4 rounded-lg min-h-[44px]" style="background: {$colorStore.primary}10; color: {$colorStore.text}; border: 1px solid {$colorStore.primary}20;" onclick={onclose}>{m.common.cancel()}</button>
  <button type="button" class="px-5 rounded-lg min-h-[44px] font-medium disabled:opacity-50" style="background: {$colorStore.primary}; color: {$colorStore.onPrimary};" disabled={saving || !name.trim()} onclick={save}>
    {initial ? m.common.save() : m.achievements.categoriesMake()}
  </button>
{/snippet}

<Sheet {title} {onclose} {footer}>
        <SettingField label={m.common.name()} id="ach-category-name">
          <input id="ach-category-name" type="text" bind:value={name} maxlength={catalog.limits.nameLength} placeholder={m.common.events()} class="w-full p-3 rounded-lg border min-h-[50px]" style={field} />
        </SettingField>
        <SettingField label={m.common.description()} id="ach-category-description">
          <input id="ach-category-description" type="text" bind:value={description} maxlength={catalog.limits.descriptionLength} placeholder={m.achievements.categoriesDescriptionPlaceholder()} class="w-full p-3 rounded-lg border min-h-[50px]" style={field} />
        </SettingField>
        <IconPicker
          value={icon}
          defaultIcon="fa:folder"
          defaultLabel={m.achievements.categoriesFolderIcon()}
          uploads={catalog.uploads}
          emojis={lookups?.emojis ?? []}
          color={$colorStore.primary}
          label={m.achievements.categoriesNewIconLabel()}
          onchange={(next) => (icon = next)}
          onuploadschanged={onchanged}
          {onerror}
        />
</Sheet>
