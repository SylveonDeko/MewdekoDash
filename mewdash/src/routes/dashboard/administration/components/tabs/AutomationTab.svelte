<script lang="ts">
  import ServerRolesCard from "../automation/ServerRolesCard.svelte";
  import TimezoneCard from "../automation/TimezoneCard.svelte";
  import GameVoiceChannelCard from "../automation/GameVoiceChannelCard.svelte";
  import DeleteMessageOnCommandCard from "../automation/DeleteMessageOnCommandCard.svelte";
  import StatsManagementCard from "../automation/StatsManagementCard.svelte";
  import type { TabProps } from "../toolsModel";

  let { guildId, textChannels, voiceChannels, roles, autoSave, notify }: TabProps = $props();
</script>

<div class="w-full space-y-6">
  <ServerRolesCard {guildId} {roles} {autoSave} {notify} />
  <TimezoneCard {guildId} {autoSave} {notify} />
  <GameVoiceChannelCard {guildId} {voiceChannels} {autoSave} {notify} />
  <DeleteMessageOnCommandCard {guildId} {textChannels} {autoSave} {notify} />
  <StatsManagementCard {guildId} {autoSave} {notify} />
</div>
