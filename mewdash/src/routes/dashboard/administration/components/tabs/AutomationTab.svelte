<script lang="ts">
  import { fly } from "svelte/transition";
  import ServerRolesCard from "../automation/ServerRolesCard.svelte";
  import TimezoneCard from "../automation/TimezoneCard.svelte";
  import CommandCooldownsCard from "../automation/CommandCooldownsCard.svelte";
  import PermissionOverridesCard from "../automation/PermissionOverridesCard.svelte";
  import PermissionsManagementCard from "../automation/PermissionsManagementCard.svelte";
  import GameVoiceChannelCard from "../automation/GameVoiceChannelCard.svelte";
  import DeleteMessageOnCommandCard from "../automation/DeleteMessageOnCommandCard.svelte";
  import StatsManagementCard from "../automation/StatsManagementCard.svelte";

  let {
    staffRole,
    memberRole,
    newStaffRole = $bindable(),
    newMemberRole = $bindable(),
    guildTimezone,
    newTimezone = $bindable(),
    availableTimezones,
    gameVoiceChannel,
    commandCooldowns,
    permissionOverrides,
    expandedRoleCard = $bindable(),
    newCommandCooldown = $bindable(),
    newPermissionOverride = $bindable(),
    newVoiceChannelRole = $bindable(),
    selectedPermissionOverrides,
    availableRoles,
    voiceChannels,
    guildChannels,
    availableCommands,
    availablePermissions,
    textChannels,
    saving,
    saveServerSettings,
    removeCommandCooldown,
    addCommandCooldown,
    showConfirm,
    removePermissionOverride,
    addPermissionOverride,
    resetPermissionOverrides,
    deleteSelectedPermissionOverrides,
    toggleGameVoiceChannel,
    fetchAllData
  } = $props();
</script>

<div class="w-full space-y-6" in:fly={{ y: 20, duration: 300 }}>
  <ServerRolesCard
    {availableRoles}
    bind:newMemberRole
    bind:newStaffRole
    {memberRole}
    {saveServerSettings}
    {saving}
    {staffRole}
  />

  <TimezoneCard
    {availableTimezones}
    bind:newTimezone
    {guildTimezone}
    {saveServerSettings}
    {saving}
  />

  <CommandCooldownsCard
    {addCommandCooldown}
    {availableCommands}
    bind:expandedRoleCard
    bind:newCommandCooldown
    {commandCooldowns}
    {removeCommandCooldown}
    {saving}
  />

  <PermissionOverridesCard
    {addPermissionOverride}
    {availableCommands}
    {availablePermissions}
    bind:expandedRoleCard
    bind:newPermissionOverride
    {deleteSelectedPermissionOverrides}
    {permissionOverrides}
    {removePermissionOverride}
    {resetPermissionOverrides}
    {saving}
    {selectedPermissionOverrides}
    {showConfirm}
  />

  <PermissionsManagementCard
    {availableRoles}
    {fetchAllData}
    {showConfirm}
  />

  <GameVoiceChannelCard
    bind:newVoiceChannelRole
    {gameVoiceChannel}
    {guildChannels}
    {toggleGameVoiceChannel}
    {voiceChannels}
  />

  <DeleteMessageOnCommandCard
    {fetchAllData}
    {textChannels}
  />

  <StatsManagementCard
    {fetchAllData}
    {showConfirm}
  />
</div>
