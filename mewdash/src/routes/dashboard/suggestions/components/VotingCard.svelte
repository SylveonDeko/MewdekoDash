<script lang="ts">
  import { m } from "$lib/i18n";
  import type { GuildEmojiInfo } from "$lib/api/client/models";
  import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";
  import EmojiPicker from "$lib/components/forms/EmojiPicker.svelte";
  import SettingField from "$lib/components/forms/SettingField.svelte";
  import PluginCard from "$lib/components/plugin/PluginCard.svelte";
  import type { Cfg, Change } from "./suggestionsModel";

  interface Props {
    cfg: Cfg;
    emojis: GuildEmojiInfo[];
    onchange: Change;
  }

  let { cfg, emojis, onchange }: Props = $props();

  const modes = $derived([
    { id: "0", name: m.features.wizardReactionEventsName() },
    { id: "1", name: m.common.buttons() }
  ]);

  const colors = $derived([
    { id: "1", name: m.common.blue() },
    { id: "2", name: m.common.colorGrey() },
    { id: "3", name: m.common.colorGreen() },
    { id: "4", name: m.common.red() }
  ]);

  const styleKeys = ["style1", "style2", "style3", "style4", "style5"] as const;

  function one(detail: { selected: string | string[] | null }): string | null {
    const value = Array.isArray(detail.selected) ? detail.selected[0] : detail.selected;
    return value || null;
  }
</script>

<PluginCard title={m.suggestions.votingTitle()} alwaysOpen>
  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
    <SettingField label={m.suggestions.emoteModeLabel()} id="suggest-mode">
      <DiscordSelector
        id="suggest-mode"
        type="custom"
        customIcon="fa-thumbs-up"
        options={modes}
        selected={String(cfg.emoteMode)}
        clearable={false}
        searchable={false}
        onchange={(detail) => onchange("emoteMode", Number(one(detail) ?? 0))}
      />
    </SettingField>
    <SettingField label={m.suggestions.emoteCustomLabel()} id="suggest-emotes">
      <EmojiPicker
        id="suggest-emotes"
        guildEmojis={emojis}
        selected={cfg.suggestEmotes}
        multiple
        maxSelection={5}
        placeholder={m.suggestions.emoteCustomPlaceholder()}
        onchange={(detail) =>
          onchange("suggestEmotes", Array.isArray(detail.selected) ? detail.selected : detail.selected ? [detail.selected] : [])}
      />
    </SettingField>
  </div>

  {#if cfg.emoteMode === 1}
    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      {#each styleKeys as key, index (key)}
        <SettingField label={m.suggestions.colorsEmoteButton({ number: index + 1 })} id="suggest-{key}">
          <DiscordSelector
            id="suggest-{key}"
            type="custom"
            customIcon="fa-palette"
            options={colors}
            selected={String(cfg[key])}
            clearable={false}
            searchable={false}
            onchange={(detail) => onchange(key, Number(one(detail) ?? 1))}
          />
        </SettingField>
      {/each}
    </div>
  {/if}
</PluginCard>
