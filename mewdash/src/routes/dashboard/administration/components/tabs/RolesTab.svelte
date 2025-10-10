<script lang="ts">
  import { fly } from "svelte/transition";
  import AutoAssignRolesCard from "../roles/AutoAssignRolesCard.svelte";
  import AutoBanRolesCard from "../roles/AutoBanRolesCard.svelte";
  import AddSelfAssignableRoleCard from "../roles/AddSelfAssignableRoleCard.svelte";
  import SelfAssignableRolesCard from "../roles/SelfAssignableRolesCard.svelte";
  import VoiceChannelRolesCard from "../roles/VoiceChannelRolesCard.svelte";
  import AddReactionRoleCard from "../roles/AddReactionRoleCard.svelte";
  import ReactionRolesCard from "../roles/ReactionRolesCard.svelte";

  let {
    autoAssignRoles,
    selectedNormalRoles = $bindable(),
    selectedBotRoles = $bindable(),
    autoBanRoles,
    selfAssignableRoles,
    voiceChannelRoles,
    reactionRoles,
    expandedRoleCard = $bindable(),
    newAutoBanRole = $bindable(),
    newVoiceChannelRole = $bindable(),
    availableRoles,
    voiceChannels,
    saving,
    saveNormalRoles,
    saveBotRoles,
    showConfirm,
    removeAutoBanRole,
    addAutoBanRole,
    toggleSelfAssignableRolesExclusive,
    removeVoiceChannelRole,
    addVoiceChannelRole,
    fetchAllData
  } = $props();
</script>

<div class="w-full space-y-6" in:fly={{ y: 20, duration: 300 }}>
  <AutoAssignRolesCard
    {autoAssignRoles}
    {availableRoles}
    bind:selectedBotRoles
    bind:selectedNormalRoles
    {saveBotRoles}
    {saveNormalRoles}
    {saving}
  />

  <AutoBanRolesCard
    {addAutoBanRole}
    {autoBanRoles}
    {availableRoles}
    bind:expandedRoleCard
    bind:newAutoBanRole
    {removeAutoBanRole}
    {saving}
    {showConfirm}
  />

  <AddSelfAssignableRoleCard
    {availableRoles}
    {fetchAllData}
  />

  <SelfAssignableRolesCard
    {fetchAllData}
    {selfAssignableRoles}
    {toggleSelfAssignableRolesExclusive}
  />

  <VoiceChannelRolesCard
    {addVoiceChannelRole}
    {availableRoles}
    bind:expandedRoleCard
    bind:newVoiceChannelRole
    {removeVoiceChannelRole}
    {saving}
    {showConfirm}
    {voiceChannelRoles}
    {voiceChannels}
  />

  <AddReactionRoleCard
    {availableRoles}
    {fetchAllData}
  />

  <ReactionRolesCard
    {availableRoles}
    {reactionRoles}
    {showConfirm}
  />
</div>
