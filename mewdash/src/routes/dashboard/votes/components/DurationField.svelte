<script lang="ts">
  import { m } from "$lib/i18n";
  import { colorStore } from "$lib/stores/colorStore";
  import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";
  import SettingField from "$lib/components/forms/SettingField.svelte";
  import { bestUnit, MAX_SECONDS } from "./votesModel";

  interface Props {
    id: string;
    seconds: number;
    onchange: (seconds: number) => void;
  }

  let { id, seconds, onchange }: Props = $props();

  let chosenUnit: string | null = $state(null);

  const unit = $derived(chosenUnit ?? bestUnit(seconds));
  const factor = $derived(Number(unit));
  const amount = $derived(seconds > 0 ? Math.round((seconds / factor) * 100) / 100 : "");

  const units = $derived([
    { id: "1", name: m.votes.unitSeconds() },
    { id: "60", name: m.common.minutes() },
    { id: "3600", name: m.common.hours() },
    { id: "86400", name: m.common.days() }
  ]);

  function read(event: Event) {
    chosenUnit = unit;
    const parsed = Math.floor(Number((event.currentTarget as HTMLInputElement).value));
    const amountValue = Number.isNaN(parsed) || parsed < 0 ? 0 : parsed;
    onchange(Math.min(MAX_SECONDS, amountValue * factor));
  }

  function pickUnit(next: string | null) {
    if (!next) return;
    chosenUnit = next;
    onchange(Math.min(MAX_SECONDS, Math.floor(Number(amount || 0)) * Number(next)));
  }
</script>

<div class="grid gap-3 sm:grid-cols-2">
  <SettingField label={m.votes.lasts()} {id}>
    <input
      {id}
      type="number"
      min="0"
      step="1"
      inputmode="numeric"
      value={amount}
      placeholder={m.common.permanent()}
      oninput={read}
      class="w-full p-3 rounded-lg border focus:ring-2 min-h-[50px]"
      style="background: {$colorStore.primary}10; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
    >
  </SettingField>
  <SettingField label={m.votes.unit()} id="{id}-unit">
    <DiscordSelector
      id="{id}-unit"
      type="custom"
      options={units}
      selected={unit}
      searchable={false}
      clearable={false}
      customIcon="fa-clock"
      onchange={({ selected }) => pickUnit(typeof selected === "string" ? selected : null)}
    />
  </SettingField>
</div>
