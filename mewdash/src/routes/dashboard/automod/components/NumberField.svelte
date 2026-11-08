<script lang="ts">
  import { colorStore } from "$lib/stores/colorStore";
  import SettingField from "$lib/components/forms/SettingField.svelte";

  interface Props {
    id: string;
    label: string;
    hint?: string;
    value: number;
    min?: number;
    max?: number;
    decimal?: boolean;
    disabled?: boolean;
    onchange: (value: number) => void;
  }

  let { id, label, hint, value, min = 0, max, decimal = false, disabled = false, onchange }: Props = $props();

  let draft: string | null = $state(null);

  function valid(raw: string): number | null {
    if (raw.trim() === "") return null;
    const parsed = Number(raw);
    if (Number.isNaN(parsed) || (!decimal && !Number.isInteger(parsed))) return null;
    if (parsed < min || (max !== undefined && parsed > max)) return null;
    return parsed;
  }

  function read(event: Event) {
    draft = (event.currentTarget as HTMLInputElement).value;
    const parsed = valid(draft);
    if (parsed !== null) onchange(parsed);
  }

  const invalid = $derived(draft !== null && valid(draft) === null);
</script>

<SettingField {label} {hint} {id}>
  <input
    {id}
    type="number"
    {min}
    {max}
    {disabled}
    step={decimal ? "0.5" : "1"}
    inputmode={decimal ? "decimal" : "numeric"}
    value={draft ?? value}
    aria-invalid={invalid}
    oninput={read}
    onblur={() => (draft = null)}
    class="w-full p-3 rounded-lg border focus:ring-2 min-h-[50px] disabled:opacity-50"
    style="background: {$colorStore.primary}10; border-color: {invalid ? '#ef4444' : `${$colorStore.primary}30`}; color: {$colorStore.text};"
  >
</SettingField>
