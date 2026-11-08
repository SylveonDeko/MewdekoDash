<script lang="ts">
  import { m } from "$lib/i18n";
  import { colorStore } from "$lib/stores/colorStore";
  import type { GuildEmojiInfo } from "$lib/api/client/models";
  import EmojiPicker from "$lib/components/forms/EmojiPicker.svelte";
  import SettingField from "$lib/components/forms/SettingField.svelte";
  import NumberField from "./NumberField.svelte";
  import { splitEmotes, type Named, type SectionProps } from "../starboardModel";

  interface Props extends SectionProps {
    channels: Named[];
    emojis: GuildEmojiInfo[];
    busy: boolean;
    addEmote: (emote: string) => Promise<boolean>;
    removeEmote: (emote: string) => Promise<void>;
  }

  let { starboard, change, channels, emojis, busy, addEmote, removeEmote }: Props = $props();

  const emotes = $derived(splitEmotes(starboard.emote));
  const channelName = $derived(
    channels.find(channel => channel.id === String(starboard.starboardChannelId))?.name ?? String(starboard.starboardChannelId)
  );

  let pickerKey = $state(0);

  /**
   * Shows a custom emote as its name.
   * @param emote The stored emote
   */
  function label(emote: string): string {
    const match = /^<a?:([^:]+):\d+>$/.exec(emote);
    return match ? `:${match[1]}:` : emote;
  }

  async function add(selected: string | string[] | null) {
    const emote = Array.isArray(selected) ? selected[0] : selected;
    if (!emote) return;
    await addEmote(emote);
    pickerKey++;
  }
</script>

<div class="space-y-4">
  <p class="flex items-center gap-2 text-sm" style="color: {$colorStore.muted}">
    <i class="fa-solid fa-hashtag" aria-hidden="true"></i>
    <span class="truncate" style="color: {$colorStore.text}">{channelName}</span>
  </p>

  <SettingField label={m.starboard.emotesLabel()} id="sb-emote-add">
    <div class="flex flex-wrap gap-2 mb-3">
      {#each emotes as emote (emote)}
        <span
          class="inline-flex items-center gap-1 pl-3 rounded-lg min-h-[44px] border"
          style="background: {$colorStore.primary}10; border-color: {$colorStore.primary}20; color: {$colorStore.text};"
        >
          {label(emote)}
          <button
            type="button"
            class="min-h-[44px] min-w-[44px] rounded-lg disabled:opacity-40"
            aria-label={m.starboard.removeEmoteAria({ emote: label(emote) })}
            disabled={busy || emotes.length < 2}
            onclick={() => removeEmote(emote)}
          >
            <i class="fa-solid fa-xmark" aria-hidden="true"></i>
          </button>
        </span>
      {/each}
    </div>
    {#key pickerKey}
      <EmojiPicker
        id="sb-emote-add"
        guildEmojis={emojis}
        selected={null}
        showUnicodeEmojis={true}
        disabled={busy}
        placeholder={m.starboard.addEmotePlaceholder()}
        onchange={(detail) => add(detail.selected)}
      />
    {/key}
  </SettingField>

  <NumberField
    id="sb-threshold"
    label={m.starboard.thresholdLabel()}
    value={starboard.threshold}
    min={1}
    onchange={(v) => change({ threshold: v }, true)}
  />
</div>
