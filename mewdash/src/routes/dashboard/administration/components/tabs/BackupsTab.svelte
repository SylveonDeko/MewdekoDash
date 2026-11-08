<script lang="ts">
  import { m } from "$lib/i18n";
  import { colorStore } from "$lib/stores/colorStore";
  import { currentGuild } from "$lib/stores/currentGuild";
  import BackupsCard from "../backups/BackupsCard.svelte";
  import RestoreProgress from "../backups/RestoreProgress.svelte";
  import TemplatesCard from "../backups/TemplatesCard.svelte";
  import type { TabProps } from "../toolsModel";

  let { guildId, textChannels, notify, user }: TabProps = $props();

  let watching = $state(false);
  let progressKey = $state(0);

  const guildName = $derived($currentGuild?.name ?? "");

  function started() {
    watching = true;
    progressKey++;
  }
</script>

{#if user}
  {#key progressKey}
    <RestoreProgress userId={user.id} {guildId} bind:watching />
  {/key}
  <BackupsCard userId={user.id} {guildId} {guildName} {textChannels} {notify} onrestore={started} />
  <TemplatesCard userId={user.id} {guildId} {guildName} {notify} onrestore={started} />
{:else}
  <p class="text-sm" style="color: {$colorStore.muted}">{m.serverTools.signInRequired()}</p>
{/if}
