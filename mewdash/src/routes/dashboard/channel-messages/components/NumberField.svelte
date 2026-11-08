<script lang="ts">
  import { colorStore } from "$lib/stores/colorStore";
  import SettingField from "$lib/components/forms/SettingField.svelte";

  interface Props {
    id: string;
    label: string;
    value: number | null | undefined;
    min?: number;
    max?: number;
    onchange: (value: number) => void;
  }

  let { id, label, value, min = 0, max, onchange }: Props = $props();

  function read(event: Event) {
    const raw = (event.currentTarget as HTMLInputElement).value;
    if (raw.trim() === "") {
      onchange(min);
      return;
    }
    const parsed = Math.floor(Number(raw));
    if (Number.isNaN(parsed)) return;
    onchange(Math.max(min, max === undefined ? parsed : Math.min(max, parsed)));
  }
</script>

<SettingField {label} {id}>
  <input
    {id}
    type="number"
    {min}
    {max}
    value={value ?? ""}
    oninput={read}
    class="w-full p-3 rounded-lg border focus:ring-2 min-h-[50px]"
    style="background: {$colorStore.primary}10; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
  >
</SettingField>
