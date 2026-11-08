<script lang="ts">
  import { m } from "$lib/i18n";
  import { dashboardAccessApi } from "$lib/api/index.ts";
  import { DashboardAccessTargetType, type DashboardAccessManager } from "$lib/api/dashboardaccess/models";
  import { colorStore } from "$lib/stores/colorStore";
  import { logger } from "$lib/logger";
  import { requestConfirmation } from "$lib/stores/confirmationStore";
  import PluginCard from "$lib/components/plugin/PluginCard.svelte";
  import TargetPicker from "./TargetPicker.svelte";
  import TargetRow from "./TargetRow.svelte";
  import { errorText, targetName, type Named } from "./accessModel";

  interface Props {
    guildId: bigint;
    managers: DashboardAccessManager[];
    roles: Named[];
    members: Named[];
    onerror: (message: string) => void;
    onsuccess: (message: string) => void;
  }

  let { guildId, managers = $bindable(), roles, members, onerror, onsuccess }: Props = $props();

  let targetType: DashboardAccessTargetType = $state(DashboardAccessTargetType.User);
  let targetId: string | null = $state(null);
  let adding = $state(false);

  async function add() {
    if (!targetId) return;
    adding = true;
    try {
      const manager = await dashboardAccessApi.addManager(guildId, { targetType, targetId: BigInt(targetId) });
      managers = [...managers.filter((x) => x.id !== manager.id), manager];
      targetId = null;
      onsuccess(m.access.notifyManagerAdded());
    } catch (err) {
      logger.error("Failed to add dashboard access manager:", err);
      onerror(errorText(err, m.access.errorAddManager()));
    } finally {
      adding = false;
    }
  }

  async function remove(manager: DashboardAccessManager) {
    const name = targetName(manager.targetType, manager.targetId, roles, members);
    if (
      !(await requestConfirmation({
        title: m.access.removeManagerAria(),
        message: m.access.removeManagerMessage({ name }),
        confirmText: m.common.remove()
      }))
    )
      return;
    try {
      await dashboardAccessApi.removeManager(guildId, manager.id);
      managers = managers.filter((x) => x.id !== manager.id);
      onsuccess(m.access.notifyManagerRemoved());
    } catch (err) {
      logger.error("Failed to remove dashboard access manager:", err);
      onerror(errorText(err, m.access.errorRemoveManager()));
    }
  }
</script>

<PluginCard title={m.access.managersHeading({ count: managers.length })} alwaysOpen>
  <div class="space-y-2">
    {#each managers as manager (manager.id)}
      {@const name = targetName(manager.targetType, manager.targetId, roles, members)}
      <TargetRow
        targetType={manager.targetType}
        {name}
        removeLabel="{m.access.removeManagerAria()}: {name}"
        onremove={() => remove(manager)}
      />
    {:else}
      <p class="text-sm" style="color: {$colorStore.muted}">{m.access.managersEmpty()}</p>
    {/each}
  </div>

  <div class="space-y-3">
    <TargetPicker bind:targetType bind:targetId {roles} {members} />
    <button
      type="button"
      class="w-full sm:w-auto px-5 rounded-xl min-h-[50px] font-medium disabled:opacity-50"
      style="background: {$colorStore.primary}; color: {$colorStore.onPrimary};"
      disabled={adding || !targetId}
      onclick={add}
    >
      {adding ? m.common.adding() : m.access.addManager()}
    </button>
  </div>
</PluginCard>
