<script lang="ts">
  import { m } from "$lib/i18n";
  import { colorStore } from "$lib/stores/colorStore";
  import SettingField from "$lib/components/forms/SettingField.svelte";
  import EditorGroup from "./EditorGroup.svelte";
  import NumberField from "./NumberField.svelte";
  import type { SectionProps } from "./editorTypes";

  let { trigger, change }: SectionProps = $props();

  const count = $derived(
    [
      trigger.currencyCost > 0,
      trigger.currencyReward > 0,
      trigger.xpReward > 0,
      trigger.requiredXpLevel > 0
    ].filter(Boolean).length
  );

  let open = $state(false);
</script>

<EditorGroup title={m.chatTriggers.groupRewards()} {count} bind:open>
  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
    <NumberField id="ct-cost" label={m.chatTriggers.cost()} value={trigger.currencyCost} onchange={(v) => change({ currencyCost: v ?? 0 }, true)} />
    <NumberField id="ct-reward" label={m.chatTriggers.reward()} value={trigger.currencyReward} onchange={(v) => change({ currencyReward: v ?? 0 }, true)} />
    <NumberField id="ct-xp" label={m.chatTriggers.xpReward()} value={trigger.xpReward} onchange={(v) => change({ xpReward: v ?? 0 }, true)} />
    <NumberField id="ct-level" label={m.chatTriggers.requiredLevel()} value={trigger.requiredXpLevel} onchange={(v) => change({ requiredXpLevel: v ?? 0 }, true)} />
  </div>
  <SettingField label={m.chatTriggers.failMessage()} id="ct-fail-message">
    <input
      id="ct-fail-message"
      type="text"
      value={trigger.requirementFailMessage ?? ""}
      oninput={(e) => change({ requirementFailMessage: e.currentTarget.value.trim() ? e.currentTarget.value : null }, true)}
      placeholder={m.chatTriggers.failMessagePlaceholder()}
      class="w-full p-3 rounded-lg border focus:ring-2 min-h-[50px]"
      style="background: {$colorStore.primary}10; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
    >
  </SettingField>
</EditorGroup>
