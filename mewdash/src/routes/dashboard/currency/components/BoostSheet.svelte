<script lang="ts">
  import { m } from "$lib/i18n";
  import { untrack } from "svelte";
  import { currencyApi } from "$lib/api/index.ts";
  import type { EconomyBoost } from "$lib/api/currency/models";
  import { colorStore } from "$lib/stores/colorStore";
  import { logger } from "$lib/logger";
  import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";
  import SettingField from "$lib/components/forms/SettingField.svelte";
  import ToggleRow from "$lib/components/forms/ToggleRow.svelte";
  import Sheet from "$lib/components/ui/Sheet.svelte";
  import NumberField from "./NumberField.svelte";
  import { BOOST_EARNING, BOOST_GAMES, utcDate, type Notify } from "./currencyModel";

  interface Props {
    guildId: bigint;
    boost: EconomyBoost | null;
    notify: Notify;
    onclose: () => void;
    onsaved: () => Promise<void>;
  }

  let { guildId, boost, notify, onclose, onsaved }: Props = $props();

  function toLocalInput(date: Date): string {
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
  }

  const initial = untrack(() => boost);

  let name = $state(initial?.name ?? "");
  let percent = $state(initial?.percentChange ?? 25);
  let commands = $state<string[]>(initial?.commands ? initial.commands.split(",").map((x) => x.trim()).filter(Boolean) : []);
  let schedule = $state(initial?.scheduleType ?? 0);
  let startsAt = $state(toLocalInput(initial ? utcDate(initial.startsAt) : new Date()));
  let duration = $state(initial?.durationMinutes ?? 60);
  let enabled = $state(initial?.enabled ?? true);
  let saving = $state(false);
  const editingName = initial?.name ?? null;

  const scheduleOptions = $derived([
    { id: "0", name: m.currency.boostScheduleOnce() },
    { id: "1", name: m.common.daily() },
    { id: "2", name: m.currency.boostScheduleWeekly() },
    { id: "3", name: m.currency.boostScheduleMonthly() }
  ]);
  const commandOptions = $derived([
    { id: "games", name: m.currency.boostAllGames() },
    ...BOOST_EARNING.map((id) => ({ id, name: id })),
    ...BOOST_GAMES.map((id) => ({ id, name: id }))
  ]);
  const field = $derived(
    `background: ${$colorStore.primary}10; border-color: ${$colorStore.primary}30; color: ${$colorStore.text};`
  );

  async function save() {
    if (!name.trim()) {
      notify(m.currency.notifyItemNeedsName(), "error");
      return;
    }
    if (!percent || percent < -100 || percent > 1000) {
      notify(m.currency.boostPercentInvalid(), "error");
      return;
    }
    const start = new Date(startsAt);
    if (Number.isNaN(start.getTime())) {
      notify(m.currency.boostStartInvalid(), "error");
      return;
    }
    const request = {
      name: name.trim(),
      percentChange: percent,
      commands: commands.join(","),
      scheduleType: schedule,
      startsAt: start.toISOString(),
      durationMinutes: duration,
      enabled
    };
    saving = true;
    try {
      if (editingName) await currencyApi.updateBoost(guildId, editingName, request);
      else await currencyApi.createBoost(guildId, request);
      notify(m.currency.boostSaved({ name: request.name }));
      await onsaved();
      onclose();
    } catch (err: any) {
      logger.error("Failed to save a boost", err);
      notify(err?.message ?? m.currency.boostSaveFailed(), "error");
    } finally {
      saving = false;
    }
  }
</script>

<Sheet title={editingName ? m.currency.shopEditing({ name: editingName }) : m.currency.boostNew()} {onclose}>
  <SettingField label={m.common.name()} id="boost-name">
    <input id="boost-name" type="text" bind:value={name} class="w-full p-3 rounded-lg border min-h-[50px]" style={field} />
  </SettingField>

  <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
    <NumberField id="boost-percent" label={m.currency.boostPercent()} value={percent} min={-100} max={1000} onchange={(value) => (percent = value ?? 0)} />
    <NumberField id="boost-duration" label={m.currency.boostDuration()} value={duration} min={1} max={525600} onchange={(value) => (duration = value ?? 1)} />
  </div>

  <SettingField label={m.common.commands()} id="boost-commands">
    <DiscordSelector
      id="boost-commands"
      type="custom"
      multiple={true}
      options={commandOptions}
      selected={commands}
      customIcon="fa-command"
      placeholder={m.currency.boostEverything()}
      ariaLabel={m.common.commands()}
      onchange={({ selected }) => (commands = Array.isArray(selected) ? selected : [])}
    />
  </SettingField>

  <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
    <SettingField label={m.currency.boostSchedule()} id="boost-schedule">
      <DiscordSelector
        id="boost-schedule"
        type="custom"
        options={scheduleOptions}
        selected={String(schedule)}
        searchable={false}
        clearable={false}
        customIcon="fa-clock"
        ariaLabel={m.currency.boostSchedule()}
        onchange={({ selected }) => (schedule = Number(selected))}
      />
    </SettingField>
    <SettingField label={m.currency.boostStarts()} id="boost-start">
      <input id="boost-start" type="datetime-local" bind:value={startsAt} class="w-full p-3 rounded-lg border min-h-[50px]" style={field} />
    </SettingField>
  </div>

  <ToggleRow checked={enabled} title={m.common.enabled()} colors={$colorStore} onchange={(v) => (enabled = v)} />

  {#snippet footer()}
    <button type="button" class="px-4 rounded-lg min-h-[44px]" style="background: {$colorStore.primary}10; color: {$colorStore.text}; border: 1px solid {$colorStore.primary}20;" onclick={onclose}>
      {m.common.cancel()}
    </button>
    <button type="button" class="px-5 rounded-lg min-h-[44px] font-medium disabled:opacity-50" style="background: {$colorStore.primary}; color: {$colorStore.onPrimary};" disabled={saving} onclick={save}>
      {saving ? m.common.saving() : m.common.save()}
    </button>
  {/snippet}
</Sheet>
