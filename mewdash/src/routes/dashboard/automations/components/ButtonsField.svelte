<script lang="ts">
  import { m } from "$lib/i18n";
  import type { AutomationButton } from "$lib/api/index.ts";
  import type { GuildEmojiInfo } from "$lib/api/client/models";
  import { colorStore } from "$lib/stores/colorStore";
  import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";
  import EmojiPicker from "$lib/components/forms/EmojiPicker.svelte";
  import SettingField from "$lib/components/forms/SettingField.svelte";
  import { BUTTON_STYLES, label } from "./automationsModel";

  interface Props {
    value: AutomationButton[];
    max: number;
    emojis: GuildEmojiInfo[];
    onchange: (value: AutomationButton[]) => void;
  }

  let { value, max, emojis, onchange }: Props = $props();

  const uid = $props.id();

  const inputStyle = $derived(
    `background: ${$colorStore.primary}10; border-color: ${$colorStore.primary}30; color: ${$colorStore.text};`
  );
  const quietStyle = $derived(
    `background: ${$colorStore.primary}10; color: ${$colorStore.text}; border: 1px solid ${$colorStore.primary}20;`
  );
  const styleOptions = $derived(BUTTON_STYLES.map((x) => ({ id: x, name: label(`option${x}`, x) })));

  function update(index: number, changes: Partial<AutomationButton>) {
    onchange(value.map((button, i) => (i === index ? { ...button, ...changes } : button)));
  }

  function add() {
    const taken = new Set(value.map((x) => x.customId));
    let n = value.length + 1;
    while (taken.has(`button-${n}`)) n++;
    onchange([...value, { customId: `button-${n}`, label: "", style: "Primary", emoji: null }]);
  }

  function remove(index: number) {
    onchange(value.filter((_, i) => i !== index));
  }
</script>

<div class="space-y-3 min-w-0">
  {#each value as button, index (index)}
    {@const id = `${uid}-${index}`}
    <div class="rounded-xl border p-3 space-y-3 min-w-0" style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}20;">
      <div class="flex items-center gap-2">
        <span class="grow text-sm font-medium truncate" style="color: {$colorStore.text}">
          {m.automations.buttonNumber({ number: index + 1 })}
        </span>
        <button
          type="button"
          class="shrink-0 rounded-lg min-h-[44px] min-w-[44px]"
          style={quietStyle}
          aria-label={m.automations.removeButtonAria({ number: index + 1 })}
          onclick={() => remove(index)}
        >
          <i class="fa-solid fa-trash" aria-hidden="true"></i>
        </button>
      </div>
      <SettingField label={m.automations.buttonLabel()} id="{id}-label" required>
        <input
          id="{id}-label"
          type="text"
          value={button.label}
          maxlength="80"
          class="w-full min-w-0 p-3 rounded-lg border focus:ring-2 min-h-[50px]"
          style={inputStyle}
          oninput={(e) => update(index, { label: e.currentTarget.value })}
        >
      </SettingField>
      <SettingField label={m.automations.buttonCustomId()} id="{id}-custom" required>
        <input
          id="{id}-custom"
          type="text"
          value={button.customId}
          maxlength="60"
          class="w-full min-w-0 p-3 rounded-lg border focus:ring-2 min-h-[50px]"
          style={inputStyle}
          oninput={(e) => update(index, { customId: e.currentTarget.value })}
        >
      </SettingField>
      <SettingField label={m.automations.buttonStyle()} id="{id}-style">
        <DiscordSelector
          id="{id}-style"
          type="custom"
          customIcon="fa-palette"
          options={styleOptions}
          selected={button.style}
          clearable={false}
          searchable={false}
          onchange={(detail) => update(index, { style: typeof detail.selected === "string" ? detail.selected : "Primary" })}
        />
      </SettingField>
      <SettingField label={m.automations.buttonEmoji()} id="{id}-emoji">
        <EmojiPicker
          id="{id}-emoji"
          guildEmojis={emojis}
          selected={button.emoji ?? null}
          showUnicodeEmojis={true}
          placeholder={m.automations.selectEmoji()}
          onchange={(detail) => update(index, { emoji: typeof detail.selected === "string" ? detail.selected : null })}
        />
      </SettingField>
    </div>
  {/each}
  {#if value.length < max}
    <button
      type="button"
      class="flex items-center justify-center gap-2 px-5 rounded-xl min-h-[50px] font-medium w-full sm:w-auto"
      style={quietStyle}
      onclick={add}
    >
      <i class="fa-solid fa-plus" aria-hidden="true"></i>
      {m.automations.addButton()}
    </button>
  {/if}
</div>
