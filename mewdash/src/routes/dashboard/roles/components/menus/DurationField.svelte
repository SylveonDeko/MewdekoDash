<script lang="ts">
  import { m } from "$lib/i18n";
  import { untrack } from "svelte";
  import { colorStore } from "$lib/stores/colorStore";
  import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";
  import { joinDuration, MAX_TEMP_SECONDS, splitDuration } from "../../roleMenuDefaults";

  /** Inputs for an amount and unit that edit a number of seconds. */
  interface Props {
    /** Seconds, 0 for none */
    seconds: number;
    /** Id for the amount input */
    id: string;
    /** Text shown in the amount input when nothing is set */
    placeholder?: string;
  }

  let { seconds = $bindable(), id, placeholder = m.common.off() }: Props = $props();

  const initial = untrack(() => splitDuration(seconds));
  let amount = $state<number | null>(initial.amount || null);
  let unit = $state(initial.unit);

  const inputStyle = $derived(
    `background: ${$colorStore.primary}10; border-color: ${$colorStore.primary}30; color: ${$colorStore.text};`
  );

  let unitChoices = $derived([
    { id: "minutes", name: m.common.minutes() },
    { id: "hours", name: m.common.hours() },
    { id: "days", name: m.common.days() }
  ]);

  /** Writes the amount and unit back as seconds, capped at a year. */
  function commit() {
    seconds = Math.min(joinDuration(amount || 0, unit), MAX_TEMP_SECONDS);
  }
</script>

<div class="grid grid-cols-2 gap-2">
  <input
    {id}
    type="number"
    min="0"
    inputmode="numeric"
    bind:value={amount}
    oninput={commit}
    {placeholder}
    class="w-full p-3 rounded-lg border focus:ring-2 min-h-[50px]"
    style={inputStyle}
  >
  <DiscordSelector
    id="{id}-unit"
    type="custom"
    customIcon="fa-clock"
    options={unitChoices}
    selected={unit}
    searchable={false}
    clearable={false}
    ariaLabel={m.roleMenus.durationUnit()}
    onchange={(detail) => {
      unit = typeof detail.selected === "string" && detail.selected ? detail.selected : "hours";
      commit();
    }}
  />
</div>
