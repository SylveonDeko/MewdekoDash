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
    /** Allows fractions, such as a multiplier of 1.5. */
    decimal?: boolean;
    /** An empty box means no value (null) instead of the minimum. */
    nullable?: boolean;
    onchange: (value: number | null) => void;
  }

  let { id, label, hint, value, min = 0, max, decimal = false, nullable = false, onchange }: Props = $props();

  function read(event: Event) {
    const raw = (event.target as HTMLInputElement).value;
    if (raw.trim() === "") {
      onchange(nullable ? null : min);
      return;
    }
    const parsed = decimal ? Number(raw) : Math.floor(Number(raw));
    if (Number.isNaN(parsed)) return;
    onchange(Math.max(min, max === undefined ? parsed : Math.min(max, parsed)));
  }
</script>

<SettingField {label} {hint} {id}>
  <input
    {id}
    type="number"
    {min}
    {max}
    step={decimal ? "0.1" : "1"}
    inputmode={decimal ? "decimal" : "numeric"}
    value={value ?? ""}
    oninput={read}
    class="w-full p-3 rounded-lg border focus:ring-2 min-h-[50px]"
    style="background: {$colorStore.primary}10; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
  >
</SettingField>
