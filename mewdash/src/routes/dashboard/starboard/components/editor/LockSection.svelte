<script lang="ts">
  import { m } from "$lib/i18n";
  import { colorStore } from "$lib/stores/colorStore";
  import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";
  import SettingField from "$lib/components/forms/SettingField.svelte";
  import EditorGroup from "./EditorGroup.svelte";
  import { lockState, type SectionProps } from "../starboardModel";

  let { starboard, change }: SectionProps = $props();

  const HOUR = 3600 * 1000;
  const FOREVER = 100 * 365 * 24 * HOUR;

  const durations = $derived([
    { id: String(HOUR), name: m.starboard.lockHour() },
    { id: String(6 * HOUR), name: m.starboard.lockSixHours() },
    { id: String(24 * HOUR), name: m.starboard.lockDay() },
    { id: String(7 * 24 * HOUR), name: m.starboard.lockWeek() },
    { id: String(FOREVER), name: m.starboard.lockUntilUnlocked() }
  ]);

  const lock = $derived(lockState(starboard));

  let duration = $state(String(24 * HOUR));
  let open = $state(false);

  const buttonStyle = $derived(
    `background: ${$colorStore.primary}20; color: ${$colorStore.text}; border: 1px solid ${$colorStore.primary}30;`
  );
</script>

<EditorGroup title={m.starboard.groupLock()} count={lock ? 1 : 0} bind:open>
  {#if lock}
    <div class="flex flex-wrap items-center gap-3">
      <p class="grow text-sm" style="color: {$colorStore.text}">
        {lock.indefinite ? m.starboard.lockedIndefinitely() : m.starboard.lockedUntil({ time: lock.until.toLocaleString() })}
      </p>
      <button type="button" class="flex items-center justify-center gap-2 px-5 rounded-xl min-h-[50px] font-medium" style={buttonStyle} onclick={() => change({ lockedUntil: null })}>
        <i class="fa-solid fa-lock-open" aria-hidden="true"></i>
        {m.starboard.unlock()}
      </button>
    </div>
  {:else}
    <div class="flex flex-wrap items-end gap-3">
      <div class="grow min-w-[12rem]">
        <SettingField label={m.starboard.lockFor()} id="sb-lock-for">
          <DiscordSelector
            id="sb-lock-for"
            type="custom"
            options={durations}
            selected={duration}
            searchable={false}
            clearable={false}
            customIcon="fa-clock"
            onchange={(detail) => typeof detail.selected === "string" && (duration = detail.selected)}
          />
        </SettingField>
      </div>
      <button
        type="button"
        class="flex items-center justify-center gap-2 px-5 rounded-xl min-h-[50px] font-medium"
        style={buttonStyle}
        onclick={() => change({ lockedUntil: new Date(Date.now() + Number(duration)).toISOString() })}
      >
        <i class="fa-solid fa-lock" aria-hidden="true"></i>
        {m.starboard.lock()}
      </button>
    </div>
  {/if}
</EditorGroup>
