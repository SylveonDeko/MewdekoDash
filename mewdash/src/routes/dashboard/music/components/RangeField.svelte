<script lang="ts">
  import { colorStore } from "$lib/stores/colorStore";
  import SettingField from "$lib/components/forms/SettingField.svelte";

  interface Props {
    id: string;
    label: string;
    value: number;
    min: number;
    max: number;
    step?: number;
    display: string;
    oninput: (value: number) => void;
    oncommit: () => void;
  }

  let { id, label, value, min, max, step = 1, display, oninput, oncommit }: Props = $props();
</script>

<SettingField {label} {id}>
  <div class="flex items-center gap-3 min-h-[50px]">
    <input
      {id}
      type="range"
      {min}
      {max}
      {step}
      {value}
      oninput={(e) => oninput(Number((e.currentTarget as HTMLInputElement).value))}
      onchange={oncommit}
      class="grow min-w-0 h-11 cursor-pointer"
      style="accent-color: {$colorStore.primary};"
    />
    <span class="shrink-0 w-16 text-right text-sm tabular-nums" style="color: {$colorStore.muted};">{display}</span>
  </div>
</SettingField>
