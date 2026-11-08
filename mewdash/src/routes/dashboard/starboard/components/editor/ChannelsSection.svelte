<script lang="ts">
  import { m } from "$lib/i18n";
  import { colorStore } from "$lib/stores/colorStore";
  import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";
  import SettingField from "$lib/components/forms/SettingField.svelte";
  import ToggleRow from "$lib/components/forms/ToggleRow.svelte";
  import EditorGroup from "./EditorGroup.svelte";
  import NumberField from "./NumberField.svelte";
  import { splitIds, type Named, type SectionProps } from "../starboardModel";

  interface Props extends SectionProps {
    channels: Named[];
    setIds: (kind: "channel" | "autoStar", ids: string[]) => void;
  }

  let { starboard, change, channels, setIds }: Props = $props();

  const modeOptions = $derived([
    { id: "whitelist", name: m.starboard.modeWhitelist() },
    { id: "blacklist", name: m.starboard.modeBlacklist() }
  ]);

  const count = $derived(
    [
      !starboard.allowNsfw,
      starboard.useBlacklist,
      !!starboard.checkedChannels,
      !!starboard.autoStarChannels,
      starboard.minMessageAgeMinutes > 0,
      starboard.maxMessageAgeMinutes > 0
    ].filter(Boolean).length
  );

  let open = $state(false);

  function list(selected: string | string[] | null): string[] {
    return Array.isArray(selected) ? selected : [];
  }
</script>

<EditorGroup title={m.starboard.groupMessages()} {count} bind:open>
  <ToggleRow colors={$colorStore} checked={starboard.allowNsfw} title={m.starboard.allowNsfw()} onchange={(v) => change({ allowNsfw: v })} />

  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
    <SettingField label={m.starboard.channelMode()} id="sb-channel-mode">
      <DiscordSelector
        id="sb-channel-mode"
        type="custom"
        options={modeOptions}
        selected={starboard.useBlacklist ? "blacklist" : "whitelist"}
        searchable={false}
        clearable={false}
        customIcon="fa-filter"
        onchange={(detail) => typeof detail.selected === "string" && change({ useBlacklist: detail.selected === "blacklist" })}
      />
    </SettingField>
    <SettingField label={starboard.useBlacklist ? m.starboard.channelsIgnored() : m.starboard.channelsChecked()} id="sb-channels">
      <DiscordSelector
        id="sb-channels"
        type="channel"
        multiple={true}
        options={channels}
        selected={splitIds(starboard.checkedChannels)}
        placeholder={starboard.useBlacklist ? m.starboard.channelsIgnoredPlaceholder() : m.starboard.channelsCheckedPlaceholder()}
        onchange={(detail) => setIds("channel", list(detail.selected))}
      />
    </SettingField>
  </div>

  <SettingField label={m.starboard.autoStarChannels()} id="sb-autostar">
    <DiscordSelector
      id="sb-autostar"
      type="channel"
      multiple={true}
      options={channels}
      selected={splitIds(starboard.autoStarChannels)}
      placeholder={m.starboard.autoStarPlaceholder()}
      onchange={(detail) => setIds("autoStar", list(detail.selected))}
    />
  </SettingField>

  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
    <NumberField
      id="sb-min-age"
      label={m.starboard.minAge()}
      hint={m.starboard.zeroForNone()}
      value={starboard.minMessageAgeMinutes}
      onchange={(v) => change({ minMessageAgeMinutes: v }, true)}
    />
    <NumberField
      id="sb-max-age"
      label={m.starboard.maxAge()}
      hint={m.starboard.zeroForNone()}
      value={starboard.maxMessageAgeMinutes}
      onchange={(v) => change({ maxMessageAgeMinutes: v }, true)}
    />
  </div>
</EditorGroup>
