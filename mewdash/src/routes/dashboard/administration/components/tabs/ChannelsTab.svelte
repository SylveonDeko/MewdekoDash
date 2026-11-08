<script lang="ts">
  import AutoPurgeCard from "../channels/AutoPurgeCard.svelte";
  import BulkActionsCard from "../channels/BulkActionsCard.svelte";
  import LockdownCard from "../channels/LockdownCard.svelte";
  import LocksCard from "../channels/LocksCard.svelte";
  import SingleChannelCard from "../channels/SingleChannelCard.svelte";
  import VoiceTextCard from "../channels/VoiceTextCard.svelte";
  import type { TabProps } from "../toolsModel";

  let { guildId, channels, textChannels, voiceChannels, autoSave, notify, user }: TabProps = $props();

  let locksKey = $state(0);
</script>

<LockdownCard {guildId} {channels} {autoSave} {notify} />
<BulkActionsCard {guildId} userId={user?.id} {channels} {notify} onchanged={() => locksKey++} />
{#key locksKey}
  <LocksCard {guildId} {channels} {notify} />
{/key}
<SingleChannelCard {guildId} {channels} {textChannels} {notify} />
<AutoPurgeCard {guildId} {textChannels} {notify} />
<VoiceTextCard {guildId} {textChannels} {voiceChannels} {notify} />
