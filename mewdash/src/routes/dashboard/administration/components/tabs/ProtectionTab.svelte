<script lang="ts">
  import AntiRaidCard from "../protection/AntiRaidCard.svelte";
  import AntiSpamCard from "../protection/AntiSpamCard.svelte";
  import AntiAltCard from "../protection/AntiAltCard.svelte";
  import AntiPatternCard from "../protection/AntiPatternCard.svelte";
  import AntiMassMentionCard from "../protection/AntiMassMentionCard.svelte";
  import AntiMassPostCard from "../protection/AntiMassPostCard.svelte";
  import AntiPostChannelCard from "../protection/AntiPostChannelCard.svelte";
  import AntiImageHashCard from "../protection/AntiImageHashCard.svelte";

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
    toggleProtection,
    toggleProtectionCard,
    cancelProtectionEdit,
    saveProtectionConfig,
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
    {cancelProtectionEdit}
    {formatAction}
    {protectionStatus}
    {saveProtectionConfig}
    {saving}
    {toggleProtection}
    {toggleProtectionCard}
  />

  <AntiSpamCard
    {actionOptions}
    bind:expandedProtectionCard
    bind:tempProtectionConfig
    {cancelProtectionEdit}
    {fetchAllData}
    {formatAction}
    {protectionStatus}
    {saveProtectionConfig}
    {saving}
    {textChannels}
    {toggleProtection}
    {toggleProtectionCard}
  />

  <AntiAltCard
    {actionOptions}
    bind:expandedProtectionCard
    bind:tempProtectionConfig
    {cancelProtectionEdit}
    {formatAction}
    {protectionStatus}
    {saveProtectionConfig}
    {saving}
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
    {cancelProtectionEdit}
    {formatAction}
    {protectionStatus}
    {removeAntiPatternPattern}
    {saveProtectionConfig}
    {saving}
    {toggleProtection}
    {toggleProtectionCard}
  />

  <AntiMassMentionCard
    {actionOptions}
    bind:expandedProtectionCard
    bind:tempProtectionConfig
    {cancelProtectionEdit}
    {formatAction}
    {protectionStatus}
    {saveProtectionConfig}
    {saving}
    {toggleProtection}
    {toggleProtectionCard}
  />

  <AntiMassPostCard
    {actionOptions}
    bind:expandedProtectionCard
    bind:tempProtectionConfig
    {cancelProtectionEdit}
    {protectionStatus}
    {saveProtectionConfig}
    {saving}
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
    {cancelProtectionEdit}
    {fetchAllData}
    {protectionStatus}
    {saveHoneypotChannels}
    {saveIgnoredRoles}
    {saveProtectionConfig}
    {saving}
    {textChannels}
    {toggleProtection}
    {toggleProtectionCard}
  />

  <AntiImageHashCard
    bind:expandedProtectionCard
    bind:tempProtectionConfig
    {cancelProtectionEdit}
    {fetchAllData}
    {protectionStatus}
    {saveProtectionConfig}
    {saving}
    {toggleProtection}
    {toggleProtectionCard}
  />
</div>
