<script lang="ts">
  import { m } from "$lib/i18n";
  import type { GuildEmojiInfo } from "$lib/api/client/models";
  import { colorStore } from "$lib/stores/colorStore";
  import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";
  import EmojiPicker from "$lib/components/forms/EmojiPicker.svelte";
  import SettingField from "$lib/components/forms/SettingField.svelte";
  import MessageField from "$lib/components/plugin/MessageField.svelte";
  import PluginCard from "$lib/components/plugin/PluginCard.svelte";
  import type { AutoSave } from "$lib/utils/autoSave.svelte";
  import type { DiscordUser } from "$lib/types/discord";
  import type { Cfg, Change, Named } from "./suggestionsModel";

  interface Props {
    cfg: Cfg;
    channels: Named[];
    emojis: GuildEmojiInfo[];
    autoSave: AutoSave;
    user?: DiscordUser | null;
    onchange: Change;
  }

  let { cfg, channels, emojis, autoSave, user = null, onchange }: Props = $props();

  const colors = $derived([
    { id: "1", name: m.common.blue() },
    { id: "2", name: m.common.colorGrey() },
    { id: "3", name: m.common.colorGreen() },
    { id: "4", name: m.common.red() }
  ]);

  function one(detail: { selected: string | string[] | null }): string | null {
    const value = Array.isArray(detail.selected) ? detail.selected[0] : detail.selected;
    return value || null;
  }
</script>

<PluginCard title={m.suggestions.buttonTitle()} alwaysOpen>
  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
    <SettingField label={m.common.channel()} id="suggest-button-channel">
      <DiscordSelector
        id="suggest-button-channel"
        type="channel"
        options={channels}
        selected={cfg.buttonChannel}
        placeholder={m.common.selectChannelPlaceholder()}
        onchange={(detail) => onchange("buttonChannel", one(detail))}
      />
    </SettingField>
    <SettingField label={m.suggestions.colorsSuggestButton()} id="suggest-button-color">
      <DiscordSelector
        id="suggest-button-color"
        type="custom"
        customIcon="fa-palette"
        options={colors}
        selected={String(cfg.buttonColor)}
        clearable={false}
        searchable={false}
        onchange={(detail) => onchange("buttonColor", Number(one(detail) ?? 1))}
      />
    </SettingField>
    <SettingField label={m.common.buttonLabel()} id="suggest-button-label">
      <input
        id="suggest-button-label"
        type="text"
        maxlength="80"
        value={cfg.buttonLabel}
        oninput={(e) => onchange("buttonLabel", e.currentTarget.value, "typing")}
        onblur={() => autoSave.flush("buttonLabel")}
        class="w-full p-3 rounded-lg border focus:ring-2 min-h-[50px]"
        style="background: {$colorStore.primary}10; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
      >
    </SettingField>
    <SettingField label={m.suggestions.buttonEmote()} id="suggest-button-emote">
      <EmojiPicker
        id="suggest-button-emote"
        guildEmojis={emojis}
        selected={cfg.buttonEmote}
        placeholder={m.suggestions.buttonEmotePlaceholder()}
        onchange={(detail) => onchange("buttonEmote", (Array.isArray(detail.selected) ? detail.selected[0] : detail.selected) || null)}
      />
    </SettingField>
  </div>

  <MessageField
    value={cfg.buttonMessage}
    previewTitle={m.suggestions.buttonMessage()}
    icon="fa-comments"
    {user}
    onchange={(message) => onchange("buttonMessage", message, "typing")}
  />
</PluginCard>
