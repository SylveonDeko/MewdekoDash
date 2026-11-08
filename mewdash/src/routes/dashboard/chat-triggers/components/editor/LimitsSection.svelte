<script lang="ts">
  import { m } from "$lib/i18n";
  import { colorStore } from "$lib/stores/colorStore";
  import type { TriggerCounter } from "$lib/api/chattriggers/chattriggers";
  import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";
  import SettingField from "$lib/components/forms/SettingField.svelte";
  import ToggleRow from "$lib/components/forms/ToggleRow.svelte";
  import EditorGroup from "./EditorGroup.svelte";
  import NumberField from "./NumberField.svelte";
  import type { SectionProps } from "./editorTypes";
  import { parseActiveHours, serializeActiveHours } from "../triggerModel";

  interface Props extends SectionProps {
    counters: TriggerCounter[];
  }

  let { trigger, change, counters }: Props = $props();

  const scopeOptions = $derived([
    { id: "0", name: m.chatTriggers.scopeMember() },
    { id: "1", name: m.chatTriggers.scopeChannel() },
    { id: "2", name: m.chatTriggers.scopeServer() }
  ]);

  const days = $derived([
    m.chatTriggers.daySun(),
    m.chatTriggers.dayMon(),
    m.chatTriggers.dayTue(),
    m.chatTriggers.dayWed(),
    m.chatTriggers.dayThu(),
    m.chatTriggers.dayFri(),
    m.chatTriggers.daySat()
  ]);

  const counterOptions = $derived(
    [...new Set(counters.map(counter => counter.name))].map(name => ({ id: name, name }))
  );

  const hours = $derived(parseActiveHours(trigger.timeConditions));
  const hoursOn = $derived(!!trigger.timeConditions);

  const count = $derived(
    [
      trigger.cooldownSeconds > 0,
      trigger.maxUses != null,
      trigger.expiresAt != null,
      trigger.minAccountAgeMinutes > 0,
      trigger.minServerMembershipMinutes > 0,
      !!trigger.counterName,
      hoursOn
    ].filter(Boolean).length
  );

  let open = $state(false);

  const inputStyle = $derived(
    `background: ${$colorStore.primary}10; border-color: ${$colorStore.primary}30; color: ${$colorStore.text};`
  );

  function expiryValue(): string {
    if (!trigger.expiresAt) return "";
    const date = new Date(trigger.expiresAt);
    if (Number.isNaN(date.getTime())) return "";
    return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
  }

  function setExpiry(value: string) {
    change({ expiresAt: value ? new Date(value).toISOString() : null });
  }

  function setHours(next: Partial<typeof hours>) {
    change({ timeConditions: serializeActiveHours({ ...hours, ...next }, trigger.timeConditions) }, true);
  }

  function toggleDay(index: number) {
    const next = hours.days.includes(index) ? hours.days.filter(day => day !== index) : [...hours.days, index].sort((a, b) => a - b);
    setHours({ days: next });
  }
</script>

<EditorGroup title={m.chatTriggers.groupLimits()} {count} bind:open>
  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
    <NumberField
      id="ct-cooldown"
      label={m.chatTriggers.cooldown()}
      value={trigger.cooldownSeconds}
      onchange={(v) => change({ cooldownSeconds: v ?? 0 }, true)}
    />
    <SettingField label={m.chatTriggers.cooldownScope()} id="ct-cooldown-scope">
      <DiscordSelector
        id="ct-cooldown-scope"
        type="custom"
        options={scopeOptions}
        selected={String(trigger.cooldownScope)}
        searchable={false}
        clearable={false}
        customIcon="fa-clock"
        onchange={(detail) => typeof detail.selected === "string" && change({ cooldownScope: Number(detail.selected) })}
      />
    </SettingField>
    <NumberField
      id="ct-max-uses"
      label={m.chatTriggers.maxUses()}
      value={trigger.maxUses}
      nullable
      onchange={(v) => change({ maxUses: v }, true)}
    />
    <SettingField label={m.chatTriggers.expiry()} id="ct-expiry">
      <div class="flex gap-3">
        <input
          id="ct-expiry"
          type="datetime-local"
          value={expiryValue()}
          onchange={(e) => setExpiry(e.currentTarget.value)}
          class="grow p-3 rounded-lg border focus:ring-2 min-h-[50px]"
          style={inputStyle}
        >
        {#if trigger.expiresAt}
          <button
            type="button"
            class="px-4 rounded-lg min-h-[50px]"
            style="background: {$colorStore.primary}10; color: {$colorStore.text}; border: 1px solid {$colorStore.primary}20;"
            aria-label={m.chatTriggers.expiryClear()}
            onclick={() => change({ expiresAt: null })}
          >
            <i class="fa-solid fa-xmark" aria-hidden="true"></i>
          </button>
        {/if}
      </div>
    </SettingField>
    <NumberField
      id="ct-min-account-age"
      label={m.chatTriggers.minAccountAge()}
      value={trigger.minAccountAgeMinutes}
      onchange={(v) => change({ minAccountAgeMinutes: v ?? 0 }, true)}
    />
    <NumberField
      id="ct-min-member-age"
      label={m.chatTriggers.minMemberAge()}
      value={trigger.minServerMembershipMinutes}
      onchange={(v) => change({ minServerMembershipMinutes: v ?? 0 }, true)}
    />
  </div>

  <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
    <SettingField label={m.chatTriggers.counterName()} id="ct-counter">
      <DiscordSelector
        id="ct-counter"
        type="custom"
        options={counterOptions}
        selected={trigger.counterName}
        placeholder={m.chatTriggers.counterPlaceholder()}
        customIcon="fa-sliders"
        onchange={(detail) => change({ counterName: typeof detail.selected === "string" ? detail.selected : null })}
      />
    </SettingField>
    {#if trigger.counterName}
      <NumberField
        id="ct-counter-min"
        label={m.chatTriggers.counterMin()}
        value={trigger.counterMin}
        min={-1000000000}
        nullable
        onchange={(v) => change({ counterMin: v }, true)}
      />
      <NumberField
        id="ct-counter-max"
        label={m.chatTriggers.counterMax()}
        value={trigger.counterMax}
        min={-1000000000}
        nullable
        onchange={(v) => change({ counterMax: v }, true)}
      />
    {/if}
  </div>

  <ToggleRow
    colors={$colorStore}
    checked={hoursOn}
    title={m.chatTriggers.activeHours()}
    onchange={(on) => (on ? setHours({}) : change({ timeConditions: null }))}
  />
  {#if hoursOn}
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <SettingField label={m.chatTriggers.hoursFrom()} id="ct-hours-start">
        <input
          id="ct-hours-start"
          type="time"
          value={hours.start}
          oninput={(e) => setHours({ start: e.currentTarget.value })}
          class="w-full p-3 rounded-lg border focus:ring-2 min-h-[50px]"
          style={inputStyle}
        >
      </SettingField>
      <SettingField label={m.chatTriggers.hoursUntil()} id="ct-hours-end">
        <input
          id="ct-hours-end"
          type="time"
          value={hours.end}
          oninput={(e) => setHours({ end: e.currentTarget.value })}
          class="w-full p-3 rounded-lg border focus:ring-2 min-h-[50px]"
          style={inputStyle}
        >
      </SettingField>
    </div>
    <fieldset>
      <legend class="text-sm font-medium mb-2" style="color: {$colorStore.text}">{m.chatTriggers.hoursDays()}</legend>
      <div class="flex flex-wrap gap-2">
        {#each days as day, index (index)}
          {@const selected = hours.days.includes(index)}
          <button
            type="button"
            class="px-4 min-h-[44px] rounded-lg text-sm font-medium border"
            style="background: {selected ? $colorStore.selectedSurface : `${$colorStore.primary}08`}; border-color: {selected ? $colorStore.selectedBorder : `${$colorStore.primary}20`}; color: {$colorStore.text};"
            aria-pressed={selected}
            onclick={() => toggleDay(index)}
          >
            {day}
          </button>
        {/each}
      </div>
    </fieldset>
  {/if}
</EditorGroup>
