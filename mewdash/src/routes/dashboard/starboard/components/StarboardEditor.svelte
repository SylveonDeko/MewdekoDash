<script lang="ts">
  import { m } from "$lib/i18n";
  import { colorStore } from "$lib/stores/colorStore";
  import type { Starboard } from "$lib/api/index.ts";
  import type { GuildEmojiInfo } from "$lib/api/client/models";
  import Sheet from "$lib/components/ui/Sheet.svelte";
  import SaveStatus from "$lib/components/ui/SaveStatus.svelte";
  import ToggleRow from "$lib/components/forms/ToggleRow.svelte";
  import type { AutoSave } from "$lib/utils/autoSave.svelte";
  import type { DiscordUser } from "$lib/types/discord";
  import BasicsSection from "./editor/BasicsSection.svelte";
  import StarsSection from "./editor/StarsSection.svelte";
  import ChannelsSection from "./editor/ChannelsSection.svelte";
  import RemovalSection from "./editor/RemovalSection.svelte";
  import LockSection from "./editor/LockSection.svelte";
  import DesignSection from "./editor/DesignSection.svelte";
  import type { Named, StarboardPatch } from "./starboardModel";

  interface Props {
    guildId: bigint;
    starboard: Starboard;
    channels: Named[];
    roles: Named[];
    emojis: GuildEmojiInfo[];
    placeholders: string[];
    busy: boolean;
    autoSave: AutoSave;
    user?: DiscordUser | null;
    onchange: (patch: StarboardPatch, typing?: boolean) => void;
    onaddemote: (emote: string) => Promise<boolean>;
    onremoveemote: (emote: string) => Promise<void>;
    onsetids: (kind: "channel" | "autoStar" | "allowedRole" | "deniedRole", ids: string[]) => void;
    onclose: () => void;
    onerror: (message: string) => void;
    onsuccess: (message: string) => void;
  }

  let {
    guildId,
    starboard,
    channels,
    roles,
    emojis,
    placeholders,
    busy,
    autoSave,
    user = null,
    onchange,
    onaddemote,
    onremoveemote,
    onsetids,
    onclose,
    onerror,
    onsuccess
  }: Props = $props();

  const channelName = $derived(
    channels.find(channel => channel.id === String(starboard.starboardChannelId))?.name ?? String(starboard.starboardChannelId)
  );
</script>

{#snippet actions()}
  <SaveStatus {autoSave} />
  <ToggleRow
    colors={$colorStore}
    checked={starboard.enabled}
    title={starboard.enabled ? m.common.enabled() : m.common.disabled()}
    onchange={(on) => onchange({ enabled: on })}
  />
{/snippet}

<Sheet title="#{channelName}" {onclose} size="xl" {actions}>
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
        <BasicsSection
          {starboard}
          change={onchange}
          {channels}
          {emojis}
          {busy}
          addEmote={onaddemote}
          removeEmote={onremoveemote}
        />
        <StarsSection
          {starboard}
          change={onchange}
          {roles}
          setIds={(kind, ids) => onsetids(kind, ids)}
        />
        <ChannelsSection
          {starboard}
          change={onchange}
          {channels}
          setIds={(kind, ids) => onsetids(kind, ids)}
        />
        <RemovalSection {starboard} change={onchange} />
        <LockSection {starboard} change={onchange} />
        <div class="min-w-0 lg:col-span-2">
          <DesignSection
            {guildId}
            {starboard}
            change={onchange}
            {channels}
            {placeholders}
            {user}
            {onerror}
            {onsuccess}
          />
        </div>
      </div>
</Sheet>
