<script lang="ts">
  import { m } from "$lib/i18n";
  import { colorStore } from "$lib/stores/colorStore";
  import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";
  import SettingField from "$lib/components/forms/SettingField.svelte";
  import ToggleRow from "$lib/components/forms/ToggleRow.svelte";
  import MessageField from "$lib/components/plugin/MessageField.svelte";
  import PluginCard from "$lib/components/plugin/PluginCard.svelte";
  import type { DiscordUser } from "$lib/types/discord";
  import NumberField from "./NumberField.svelte";
  import { MAX_LENGTH, type Cfg, type Change, type Named } from "./suggestionsModel";

  interface Props {
    cfg: Cfg;
    channels: Named[];
    placeholders: Array<{ category: string; name: string; description: string }>;
    user?: DiscordUser | null;
    onchange: Change;
  }

  let { cfg, channels, placeholders, user = null, onchange }: Props = $props();

  const threadTypes = $derived([
    { id: "0", name: m.suggestions.threadNone() },
    { id: "1", name: m.suggestions.threadRegular() },
    { id: "2", name: m.suggestions.threadPrivate() }
  ]);

  function one(detail: { selected: string | string[] | null }): string | null {
    const value = Array.isArray(detail.selected) ? detail.selected[0] : detail.selected;
    return value || null;
  }
</script>

<PluginCard title={m.common.basicSettings()} alwaysOpen>
  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
    <SettingField label={m.suggestions.channelSuggest()} id="suggest-channel">
      <DiscordSelector
        id="suggest-channel"
        type="channel"
        options={channels}
        selected={cfg.suggestChannel}
        placeholder={m.common.selectChannelPlaceholder()}
        onchange={(detail) => onchange("suggestChannel", one(detail))}
      />
    </SettingField>
    <SettingField label={m.suggestions.threadType()} id="suggest-threads">
      <DiscordSelector
        id="suggest-threads"
        type="custom"
        customIcon="fa-comments"
        options={threadTypes}
        selected={String(cfg.threadType)}
        clearable={false}
        searchable={false}
        onchange={(detail) => onchange("threadType", Number(one(detail) ?? 0))}
      />
    </SettingField>
    <NumberField id="suggest-min" label={m.common.minimumLength()} min={0} max={MAX_LENGTH} value={cfg.minLength} onchange={(value) => onchange("minLength", value ?? 0, "typing")} />
    <NumberField id="suggest-max" label={m.common.maximumLength()} min={0} max={MAX_LENGTH} value={cfg.maxLength} onchange={(value) => onchange("maxLength", value ?? 0, "typing")} />
    <NumberField id="suggest-vote-color" label={m.suggestions.voteColor()} hint={m.suggestions.voteColorOff()} min={0} max={1000} value={cfg.voteColor} onchange={(value) => onchange("voteColor", value ?? 0, "typing")} />
    <div class="self-end">
      <ToggleRow checked={cfg.anonymous} title={m.common.anonymous()} colors={$colorStore} onchange={(value) => onchange("anonymous", value)} />
    </div>
  </div>

  <div class="space-y-2">
    <span class="block text-sm font-medium" style="color: {$colorStore.text}">{m.suggestions.messageSuggestionTitle()}</span>
    <MessageField
      value={cfg.suggestionMessage}
      previewTitle={m.suggestions.messageSuggestionTitle()}
      icon="fa-comment"
      {user}
      {placeholders}
      onchange={(message) => onchange("suggestionMessage", message, "typing")}
    />
  </div>
</PluginCard>
