<script lang="ts">
  import BanMessageCard from "../advanced/BanMessageCard.svelte";
  import ServerRecoveryCard from "../advanced/ServerRecoveryCard.svelte";
  import PruneMembersCard from "../advanced/PruneMembersCard.svelte";
  import MassBanCard from "../advanced/MassBanCard.svelte";
  import MassRenameCard from "../advanced/MassRenameCard.svelte";
  import type { TabProps } from "../toolsModel";

  let { guildId, autoSave, notify, user }: TabProps = $props();
</script>

<div class="w-full space-y-6">
  <BanMessageCard {guildId} {autoSave} {notify} {user} />
  <ServerRecoveryCard {guildId} {notify} />
  <PruneMembersCard {guildId} {notify} />
  <MassBanCard {guildId} {notify} />
  <MassRenameCard {guildId} {notify} />
</div>
