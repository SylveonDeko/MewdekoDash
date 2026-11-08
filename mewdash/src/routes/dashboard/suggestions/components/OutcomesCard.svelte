<script lang="ts">
  import { m } from "$lib/i18n";
  import { colorStore } from "$lib/stores/colorStore";
  import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";
  import SettingField from "$lib/components/forms/SettingField.svelte";
  import ToggleRow from "$lib/components/forms/ToggleRow.svelte";
  import MessageField from "$lib/components/plugin/MessageField.svelte";
  import PluginCard from "$lib/components/plugin/PluginCard.svelte";
  import type { DiscordUser } from "$lib/types/discord";
  import type { Cfg, Change, Named } from "./suggestionsModel";

  interface Props {
    cfg: Cfg;
    channels: Named[];
    placeholders: Array<{ category: string; name: string; description: string }>;
    user?: DiscordUser | null;
    onchange: Change;
  }

  let { cfg, channels, placeholders, user = null, onchange }: Props = $props();

  const outcomes = $derived([
    { id: "accept", title: m.common.accepted(), icon: "fa-check", channel: "acceptChannel", archive: "archiveOnAccept", message: "acceptMessage" },
    { id: "deny", title: m.common.denied(), icon: "fa-xmark", channel: "denyChannel", archive: "archiveOnDeny", message: "denyMessage" },
    { id: "consider", title: m.suggestions.actionConsidered(), icon: "fa-comment", channel: "considerChannel", archive: "archiveOnConsider", message: "considerMessage" },
    { id: "implement", title: m.common.implemented(), icon: "fa-flag-checkered", channel: "implementChannel", archive: "archiveOnImplement", message: "implementMessage" }
  ] as const);

  function one(detail: { selected: string | string[] | null }): string | null {
    const value = Array.isArray(detail.selected) ? detail.selected[0] : detail.selected;
    return value || null;
  }
</script>

<PluginCard title={m.suggestions.outcomesTitle()} alwaysOpen>
  {#each outcomes as outcome (outcome.id)}
    <div class="rounded-xl border p-4 space-y-4 min-w-0" style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}20;">
      <h4 class="flex items-center gap-2 text-sm font-semibold" style="color: {$colorStore.text}">
        <i class="fa-solid {outcome.icon}" aria-hidden="true"></i>
        {outcome.title}
      </h4>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SettingField label={m.common.channel()} id="suggest-{outcome.id}-channel">
          <DiscordSelector
            id="suggest-{outcome.id}-channel"
            type="channel"
            options={channels}
            selected={cfg[outcome.channel]}
            placeholder={m.common.selectChannelPlaceholder()}
            onchange={(detail) => onchange(outcome.channel, one(detail))}
          />
        </SettingField>
        <div class="self-end">
          <ToggleRow checked={cfg[outcome.archive]} title={m.suggestions.archiveThread()} colors={$colorStore} onchange={(value) => onchange(outcome.archive, value)} />
        </div>
      </div>
      <MessageField
        value={cfg[outcome.message]}
        previewTitle={outcome.title}
        icon={outcome.icon}
        {user}
        {placeholders}
        onchange={(message) => onchange(outcome.message, message, "typing")}
      />
    </div>
  {/each}
</PluginCard>
