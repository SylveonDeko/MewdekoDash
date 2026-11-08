<script lang="ts">
  import { m } from "$lib/i18n";
  import { colorStore } from "$lib/stores/colorStore";
  import SettingField from "$lib/components/forms/SettingField.svelte";
  import EditorGroup from "./EditorGroup.svelte";
  import type { SectionProps } from "./editorTypes";

  interface Props extends SectionProps {
    categories: string[];
  }

  let { trigger, change, categories }: Props = $props();

  let open = $state(false);
</script>

<EditorGroup title={m.chatTriggers.groupCategory()} count={trigger.category ? 1 : 0} bind:open>
  <SettingField label={m.common.category()} id="ct-category">
    <input
      id="ct-category"
      type="text"
      list="ct-category-list"
      value={trigger.category ?? ""}
      oninput={(e) => change({ category: e.currentTarget.value.trim() || null }, true)}
      class="w-full p-3 rounded-lg border focus:ring-2 min-h-[50px]"
      style="background: {$colorStore.primary}10; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
    >
    <datalist id="ct-category-list">
      {#each categories as category (category)}
        <option value={category}></option>
      {/each}
    </datalist>
  </SettingField>
</EditorGroup>
