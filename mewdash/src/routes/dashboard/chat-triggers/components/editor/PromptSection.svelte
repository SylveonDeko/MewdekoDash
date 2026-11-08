<script lang="ts">
  import { m } from "$lib/i18n";
  import { colorStore } from "$lib/stores/colorStore";
  import SettingField from "$lib/components/forms/SettingField.svelte";
  import EditorGroup from "./EditorGroup.svelte";
  import NumberField from "./NumberField.svelte";
  import type { SectionProps } from "./editorTypes";

  let { trigger, change }: SectionProps = $props();

  let open = $state(false);
</script>

<EditorGroup title={m.chatTriggers.groupPrompt()} count={trigger.promptQuestion ? 1 : 0} bind:open>
  <SettingField label={m.chatTriggers.promptQuestion()} id="ct-prompt">
    <input
      id="ct-prompt"
      type="text"
      value={trigger.promptQuestion ?? ""}
      oninput={(e) => change({ promptQuestion: e.currentTarget.value.trim() ? e.currentTarget.value : null }, true)}
      class="w-full p-3 rounded-lg border focus:ring-2 min-h-[50px]"
      style="background: {$colorStore.primary}10; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
    >
  </SettingField>
  {#if trigger.promptQuestion}
    <NumberField
      id="ct-prompt-timeout"
      label={m.chatTriggers.promptTimeout()}
      value={trigger.promptTimeoutSeconds}
      min={5}
      max={120}
      onchange={(v) => change({ promptTimeoutSeconds: v ?? 30 }, true)}
    />
  {/if}
</EditorGroup>
