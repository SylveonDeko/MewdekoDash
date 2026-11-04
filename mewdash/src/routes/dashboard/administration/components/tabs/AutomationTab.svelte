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
    newStaffRole = $bindable(),
    newMemberRole = $bindable(),
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
    saveStaffRole,
    saveMemberRole,
    saveTimezone,
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
    {saveMemberRole}
    {saveStaffRole}
  />

  <TimezoneCard
    {availableTimezones}
    bind:newTimezone
    {saveTimezone}
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
    {textChannels}
    {guildChannels}
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
