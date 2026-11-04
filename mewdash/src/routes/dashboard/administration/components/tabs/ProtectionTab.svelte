<script lang="ts">
  import AntiRaidCard from "../protection/AntiRaidCard.svelte";
  import AntiSpamCard from "../protection/AntiSpamCard.svelte";
  import AntiAltCard from "../protection/AntiAltCard.svelte";
  import JoinRoleTimeoutCard from "../protection/JoinRoleTimeoutCard.svelte";
  import AntiPatternCard from "../protection/AntiPatternCard.svelte";
  import AntiMassMentionCard from "../protection/AntiMassMentionCard.svelte";
  import AntiMassPostCard from "../protection/AntiMassPostCard.svelte";
  import AntiPostChannelCard from "../protection/AntiPostChannelCard.svelte";
  import AntiImageHashCard from "../protection/AntiImageHashCard.svelte";
  import AntiExternalAppCard from "../protection/AntiExternalAppCard.svelte";

  let {
    protectionStatus,
    expandedProtectionCard = $bindable(),
    tempProtectionConfig = $bindable(),
    showPatternManagement = $bindable(),
    antiPatternPatterns,
    newPattern = $bindable(),
    selectedHoneypotChannels = $bindable(),
    selectedIgnoredRoles = $bindable(),
    selectedIgnoredUsers = $bindable(),
    actionOptions,
    textChannels,
    availableRoles,
    saving,
    autoSave,
    notify,
    toggleProtection,
    toggleProtectionCard,
    saveHoneypotChannels,
    saveIgnoredRoles,
    addIgnoredUser,
    fetchAllData,
    formatAction,
    addAntiPatternPattern,
    removeAntiPatternPattern
  } = $props();
</script>

<div class="space-y-6">
  <AntiRaidCard
    {actionOptions}
    bind:expandedProtectionCard
    bind:tempProtectionConfig
    {formatAction}
    {protectionStatus}
    {toggleProtection}
    {toggleProtectionCard}
  />

  <AntiSpamCard
    {actionOptions}
    bind:expandedProtectionCard
    bind:tempProtectionConfig
    {fetchAllData}
    {formatAction}
    {protectionStatus}
    {saving}
    {textChannels}
    {toggleProtection}
    {toggleProtectionCard}
  />

  <JoinRoleTimeoutCard
    {autoSave}
    {availableRoles}
    {notify}
    {textChannels}
  />

  <AntiAltCard
    {actionOptions}
    bind:expandedProtectionCard
    bind:tempProtectionConfig
    {formatAction}
    {protectionStatus}
    {toggleProtection}
    {toggleProtectionCard}
  />

  <AntiPatternCard
    {actionOptions}
    {addAntiPatternPattern}
    {antiPatternPatterns}
    bind:expandedProtectionCard
    bind:newPattern
    bind:showPatternManagement
    bind:tempProtectionConfig
    {formatAction}
    {protectionStatus}
    {removeAntiPatternPattern}
    {saving}
    {toggleProtection}
    {toggleProtectionCard}
  />

  <AntiMassMentionCard
    {actionOptions}
    bind:expandedProtectionCard
    bind:tempProtectionConfig
    {formatAction}
    {protectionStatus}
    {toggleProtection}
    {toggleProtectionCard}
  />

  <AntiMassPostCard
    {actionOptions}
    bind:expandedProtectionCard
    bind:tempProtectionConfig
    {protectionStatus}
    {toggleProtection}
    {toggleProtectionCard}
  />

  <AntiPostChannelCard
    {actionOptions}
    {addIgnoredUser}
    {availableRoles}
    bind:expandedProtectionCard
    bind:selectedHoneypotChannels
    bind:selectedIgnoredRoles
    bind:selectedIgnoredUsers
    bind:tempProtectionConfig
    {fetchAllData}
    {protectionStatus}
    {saveHoneypotChannels}
    {saveIgnoredRoles}
    {saving}
    {textChannels}
    {toggleProtection}
    {toggleProtectionCard}
  />

  <AntiImageHashCard
    bind:expandedProtectionCard
    bind:tempProtectionConfig
    {fetchAllData}
    {protectionStatus}
    {toggleProtection}
    {toggleProtectionCard}
  />

  <AntiExternalAppCard
    bind:expandedProtectionCard
    bind:tempProtectionConfig
    {formatAction}
    {protectionStatus}
    {toggleProtection}
    {toggleProtectionCard}
  />
</div>
