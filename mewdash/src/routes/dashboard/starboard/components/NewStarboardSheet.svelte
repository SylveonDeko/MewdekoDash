<script lang="ts">
  import { m } from "$lib/i18n";
  import { colorStore } from "$lib/stores/colorStore";
  import type { GuildEmojiInfo } from "$lib/api/client/models";
  import Sheet from "$lib/components/ui/Sheet.svelte";
  import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";
  import EmojiPicker from "$lib/components/forms/EmojiPicker.svelte";
  import SettingField from "$lib/components/forms/SettingField.svelte";
  import NumberField from "./editor/NumberField.svelte";
  import type { Named } from "./starboardModel";

  interface Props {
    channels: Named[];
    emojis: GuildEmojiInfo[];
    creating: boolean;
    problem: string | null;
    oncreate: (request: { mode: "existing" | "new"; channelId: string; name: string; emote: string; threshold: number }) => void;
    onclose: () => void;
  }

  let { channels, emojis, creating, problem, oncreate, onclose }: Props = $props();

  let mode = $state<"existing" | "new">("existing");
  let channelId = $state("");
  let name = $state("starboard");
  let emote = $state("⭐");
  let threshold = $state(3);
  let attempted = $state(false);

  const modeOptions = $derived([
    { id: "existing", name: m.starboard.modeExisting() },
    { id: "new", name: m.starboard.modeNew() }
  ]);

  const missing = $derived(
    !emote ? m.starboard.problemEmote() : mode === "existing" && !channelId ? m.common.noChannelSelected() : mode === "new" && !name.trim() ? m.starboard.problemName() : null
  );

  function create() {
    attempted = true;
    if (missing || creating) return;
    oncreate({ mode, channelId, name: name.trim(), emote, threshold });
  }

</script>

{#snippet footer()}
  {#if (attempted && missing) || problem}
    <p class="grow basis-full sm:basis-0 text-sm text-red-400" role="alert">{problem ?? missing}</p>
  {/if}
  <button
    type="button"
    class="px-5 rounded-xl min-h-[44px] font-medium"
    style="background: {$colorStore.primary}10; color: {$colorStore.text}; border: 1px solid {$colorStore.primary}20;"
    onclick={onclose}
  >
    {m.common.cancel()}
  </button>
  <button
    type="button"
    class="flex items-center justify-center gap-2 px-5 rounded-xl min-h-[44px] font-medium disabled:opacity-60"
    style="background: {$colorStore.primary}; color: {$colorStore.onPrimary};"
    disabled={creating}
    onclick={create}
  >
    <i class="fa-solid fa-plus" aria-hidden="true"></i>
    {m.common.create()}
  </button>
{/snippet}

<Sheet title={m.starboard.newTitle()} {onclose} {footer}>
        <SettingField label={m.starboard.channelSource()} id="sb-new-mode">
          <DiscordSelector
            id="sb-new-mode"
            type="custom"
            options={modeOptions}
            selected={mode}
            searchable={false}
            clearable={false}
            customIcon="fa-star"
            onchange={(detail) => typeof detail.selected === "string" && (mode = detail.selected as "existing" | "new")}
          />
        </SettingField>

        {#if mode === "existing"}
          <SettingField label={m.starboard.channelLabel()} id="sb-new-channel">
            <DiscordSelector
              id="sb-new-channel"
              type="channel"
              options={channels}
              selected={channelId}
              placeholder={m.common.selectAChannelPlaceholder()}
              onchange={(detail) => (channelId = typeof detail.selected === "string" ? detail.selected : "")}
            />
          </SettingField>
        {:else}
          <SettingField label={m.starboard.channelName()} id="sb-new-name">
            <input
              id="sb-new-name"
              type="text"
              bind:value={name}
              maxlength="100"
              class="w-full p-3 rounded-lg border focus:ring-2 min-h-[50px]"
              style="background: {$colorStore.primary}10; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
            >
          </SettingField>
        {/if}

        <SettingField label={m.starboard.emoteLabel()} id="sb-new-emote">
          <EmojiPicker
            id="sb-new-emote"
            guildEmojis={emojis}
            selected={emote}
            showUnicodeEmojis={true}
            onchange={(detail) => (emote = typeof detail.selected === "string" ? detail.selected : "")}
          />
        </SettingField>

        <NumberField id="sb-new-threshold" label={m.starboard.thresholdLabel()} value={threshold} min={1} onchange={(v) => (threshold = v)} />
</Sheet>
