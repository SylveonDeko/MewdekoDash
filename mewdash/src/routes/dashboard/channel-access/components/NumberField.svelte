<script lang="ts">
  import { colorStore } from "$lib/stores/colorStore";
  import SettingField from "$lib/components/forms/SettingField.svelte";

  interface Props {
    id: string;
    label: string;
    value: number;
    min?: number;
    onchange: (value: number) => void;
    onblur?: () => void;
  }

  let { id, label, value, min = 0, onchange, onblur }: Props = $props();

  function read(event: Event) {
    const raw = (event.currentTarget as HTMLInputElement).value;
    const parsed = raw.trim() === "" ? min : Math.floor(Number(raw));
    if (Number.isNaN(parsed)) return;
    onchange(Math.max(min, parsed));
  }
</script>

<SettingField {label} {id}>
  <input
    {id}
    type="number"
    {min}
    step="1"
    inputmode="numeric"
    {value}
    oninput={read}
    {onblur}
    class="w-full p-3 rounded-lg border focus:ring-2 min-h-[50px]"
    style="background: {$colorStore.primary}10; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
  >
</SettingField>
