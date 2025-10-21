<script lang="ts">
  import { fly } from "svelte/transition";
  import BanMessageCard from "../advanced/BanMessageCard.svelte";
  import MassOperationsCard from "../advanced/MassOperationsCard.svelte";

  let {
    banMessage = $bindable(),
    textChannels,
    saving,
    saveBanMessage,
    showConfirm,
    fetchAllData,
    guildId = null,
    user = null
  } = $props();
</script>

<div class="space-y-6" in:fly={{ y: 20, duration: 300 }}>
  <BanMessageCard
    bind:banMessage
    {saveBanMessage}
    {saving}
    {guildId}
    {user}
  />

  <MassOperationsCard
    {fetchAllData}
    {showConfirm}
    {textChannels}
  />
</div>
