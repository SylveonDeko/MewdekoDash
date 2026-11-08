<script lang="ts">
  import { colorStore } from "$lib/stores/colorStore";
  import SettingField from "$lib/components/forms/SettingField.svelte";

  interface Props {
    id: string;
    label: string;
    hint?: string;
    value: number;
    min: number;
    max: number;
    oninput: (value: number) => void;
    oncommit: () => void;
  }

  let { id, label, hint, value, min, max, oninput, oncommit }: Props = $props();

  function read(event: Event) {
    const raw = (event.currentTarget as HTMLInputElement).value;
    if (raw.trim() === "") return;
    const parsed = Math.floor(Number(raw));
    if (Number.isNaN(parsed) || parsed < min || parsed > max) return;
    oninput(parsed);
  }

  function leave(event: Event) {
    (event.currentTarget as HTMLInputElement).value = String(value);
    oncommit();
  }
</script>

<SettingField {label} {hint} {id}>
  <input
    {id}
    type="number"
    {min}
    {max}
    step="1"
    inputmode="numeric"
    {value}
    oninput={read}
    onblur={leave}
    class="w-full p-3 rounded-lg border focus:ring-2 min-h-[50px]"
    style="background: {$colorStore.primary}10; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
  />
</SettingField>
