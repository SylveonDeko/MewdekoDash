<script lang="ts">
  import { m } from "$lib/i18n";
  import { untrack } from "svelte";
  import { colorStore } from "$lib/stores/colorStore";
  import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";
  import SettingField from "$lib/components/forms/SettingField.svelte";
  import { UNIT_SECONDS, type DurationUnit } from "./model";

  interface Props {
    id: string;
    label: string;
    seconds: number;
    min?: number;
    max?: number;
    units?: DurationUnit[];
    onchange: (seconds: number) => void;
  }

  let { id, label, seconds, min = 1, max, units = ["s", "m", "h", "d"], onchange }: Props = $props();

  function startUnit(): DurationUnit {
    const fits = [...units].sort((a, b) => UNIT_SECONDS[b] - UNIT_SECONDS[a]);
    return fits.find(unit => seconds > 0 && seconds % UNIT_SECONDS[unit] === 0) ?? units[0];
  }

  let unit = $state<DurationUnit>(untrack(startUnit));

  const amount = $derived(Math.round(seconds / UNIT_SECONDS[unit]));

  const unitNames: Record<DurationUnit, () => string> = {
    s: () => m.channelMessages.unitSeconds(),
    m: () => m.channelMessages.unitMinutes(),
    h: () => m.channelMessages.unitHours(),
    d: () => m.channelMessages.unitDays()
  };

  const unitOptions = $derived(units.map(value => ({ id: value, name: unitNames[value]() })));

  function clamp(total: number): number {
    return Math.max(min, max === undefined ? total : Math.min(max, total));
  }

  function read(event: Event) {
    const parsed = Math.floor(Number((event.currentTarget as HTMLInputElement).value));
    if (Number.isNaN(parsed)) return;
    onchange(clamp(parsed * UNIT_SECONDS[unit]));
  }

  function pick(next: string) {
    unit = next as DurationUnit;
    onchange(clamp(Math.max(1, amount) * UNIT_SECONDS[unit]));
  }
</script>

<SettingField {label} {id}>
  <div class="flex gap-3 items-stretch">
    <input
      {id}
      type="number"
      min="1"
      value={amount}
      oninput={read}
      class="grow min-w-0 p-3 rounded-lg border focus:ring-2 min-h-[50px]"
      style="background: {$colorStore.primary}10; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
    >
    <div class="w-36 shrink-0">
      <DiscordSelector
        type="custom"
        options={unitOptions}
        selected={unit}
        searchable={false}
        clearable={false}
        customIcon="fa-clock"
        ariaLabel={label}
        onchange={(detail) => typeof detail.selected === "string" && pick(detail.selected)}
      />
    </div>
  </div>
</SettingField>
