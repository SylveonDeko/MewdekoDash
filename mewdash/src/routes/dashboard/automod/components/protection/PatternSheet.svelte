<script lang="ts">
  import { m } from "$lib/i18n";
  import { colorStore } from "$lib/stores/colorStore";
  import ToggleRow from "$lib/components/forms/ToggleRow.svelte";
  import SettingField from "$lib/components/forms/SettingField.svelte";
  import Sheet from "$lib/components/ui/Sheet.svelte";

  interface Props {
    oncreate: (request: { name: string; pattern: string; checkUsername: boolean; checkDisplayName: boolean }) => Promise<void>;
    onclose: () => void;
  }

  let { oncreate, onclose }: Props = $props();

  let name = $state("");
  let pattern = $state("");
  let checkUsername = $state(true);
  let checkDisplayName = $state(false);
  let busy = $state(false);

  const valid = $derived(name.trim() !== "" && pattern.trim() !== "" && (checkUsername || checkDisplayName));
  const field = $derived(
    `background: ${$colorStore.primary}10; border-color: ${$colorStore.primary}30; color: ${$colorStore.text};`
  );

  async function submit() {
    if (!valid || busy) return;
    busy = true;
    try {
      await oncreate({ name: name.trim(), pattern: pattern.trim(), checkUsername, checkDisplayName });
    } finally {
      busy = false;
    }
  }
</script>

<Sheet title={m.automod.addPattern()} {onclose}>
  <SettingField label={m.common.name()} id="pattern-name">
    <input id="pattern-name" type="text" bind:value={name} class="w-full p-3 rounded-lg border min-h-[50px]" style={field} />
  </SettingField>
  <SettingField label={m.automod.patternRegex()} id="pattern-regex">
    <input
      id="pattern-regex"
      type="text"
      bind:value={pattern}
      placeholder="^[a-z]+[0-9]{'{4,}'}$"
      class="w-full p-3 rounded-lg border min-h-[50px] font-mono"
      style={field}
    />
  </SettingField>
  <div class="grid gap-2 sm:grid-cols-2">
    <ToggleRow checked={checkUsername} title={m.common.username()} colors={$colorStore} onchange={(value) => (checkUsername = value)} />
    <ToggleRow checked={checkDisplayName} title={m.common.displayName()} colors={$colorStore} onchange={(value) => (checkDisplayName = value)} />
  </div>

  {#snippet footer()}
    <button
      type="button"
      class="px-5 rounded-xl min-h-[50px] font-medium disabled:opacity-50"
      style="background: {$colorStore.primary}; color: {$colorStore.onPrimary};"
      disabled={!valid || busy}
      onclick={submit}
    >
      {m.common.create()}
    </button>
  {/snippet}
</Sheet>
