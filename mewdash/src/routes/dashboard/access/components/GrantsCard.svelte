<script lang="ts">
  import { m } from "$lib/i18n";
  import { dashboardAccessApi } from "$lib/api/index.ts";
  import type { DashboardAccessGrant } from "$lib/api/dashboardaccess/models";
  import { colorStore } from "$lib/stores/colorStore";
  import { logger } from "$lib/logger";
  import { requestConfirmation } from "$lib/stores/confirmationStore";
  import PluginCard from "$lib/components/plugin/PluginCard.svelte";
  import GrantSheet from "./GrantSheet.svelte";
  import TargetRow from "./TargetRow.svelte";
  import { errorText, targetName, type Named } from "./accessModel";

  interface Props {
    guildId: bigint;
    grants: DashboardAccessGrant[];
    roles: Named[];
    members: Named[];
    onerror: (message: string) => void;
    onsuccess: (message: string) => void;
  }

  let { guildId, grants = $bindable(), roles, members, onerror, onsuccess }: Props = $props();

  let editing: DashboardAccessGrant | null = $state(null);
  let creating = $state(false);

  function sectionCount(grant: DashboardAccessGrant): string {
    const count = Object.keys(grant.sections).length;
    return count === 1 ? m.access.grantSectionsOne({ count }) : m.access.grantSectionsOther({ count });
  }

  async function remove(grant: DashboardAccessGrant) {
    const name = targetName(grant.targetType, grant.targetId, roles, members);
    if (
      !(await requestConfirmation({
        title: m.access.removeGrantTitle(),
        message: m.access.removeGrantMessage({ name }),
        confirmText: m.common.remove()
      }))
    )
      return;
    try {
      await dashboardAccessApi.removeGrant(guildId, grant.id);
      grants = grants.filter((x) => x.id !== grant.id);
      onsuccess(m.access.notifyGrantRemoved());
    } catch (err) {
      logger.error("Failed to remove dashboard access grant:", err);
      onerror(errorText(err, m.access.errorRemoveGrant()));
    }
  }
</script>

<PluginCard title={m.access.grantsHeading({ count: grants.length })} alwaysOpen>
  <div class="space-y-2">
    {#each grants as grant (grant.id)}
      {@const name = targetName(grant.targetType, grant.targetId, roles, members)}
      <TargetRow
        targetType={grant.targetType}
        {name}
        subtitle={sectionCount(grant)}
        editLabel="{m.access.editGrantAria()}: {name}"
        removeLabel="{m.access.removeGrantAria()}: {name}"
        onedit={() => (editing = grant)}
        onremove={() => remove(grant)}
      />
    {:else}
      <p class="text-sm" style="color: {$colorStore.muted}">{m.access.grantsEmpty()}</p>
    {/each}
  </div>

  <button
    type="button"
    class="w-full sm:w-auto px-5 rounded-xl min-h-[50px] font-medium"
    style="background: {$colorStore.primary}; color: {$colorStore.onPrimary};"
    onclick={() => (creating = true)}
  >
    <i class="fa-solid fa-plus mr-2" aria-hidden="true"></i>{m.access.grantHeadingNew()}
  </button>
</PluginCard>

{#if creating || editing}
  <GrantSheet
    {guildId}
    grant={editing}
    {roles}
    {members}
    {onerror}
    onclose={() => {
      creating = false;
      editing = null;
    }}
    onsaved={(next) => {
      grants = next;
      creating = false;
      editing = null;
      onsuccess(m.access.notifyGrantSaved());
    }}
  />
{/if}
