<script lang="ts">
  import { colorStore } from "$lib/stores/colorStore";
  import SettingField from "$lib/components/forms/SettingField.svelte";

  interface Props {
    id: string;
    label: string;
    hint?: string;
    value: number | null | undefined;
    min?: number;
    max?: number;
    /** An empty box means no value (null) instead of zero. */
    nullable?: boolean;
    onchange: (value: number | null) => void;
  }

  let { id, label, hint, value, min = 0, max, nullable = false, onchange }: Props = $props();

  function read(event: Event) {
    const raw = (event.currentTarget as HTMLInputElement).value;
    if (raw.trim() === "") {
      onchange(nullable ? null : 0);
      return;
    }
    const parsed = Math.floor(Number(raw));
    if (Number.isNaN(parsed)) return;
    const bounded = Math.max(min, max === undefined ? parsed : Math.min(max, parsed));
    onchange(bounded);
  }
</script>

<SettingField {label} {hint} {id}>
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
