<script lang="ts">
  import { m } from "$lib/i18n";
  import { administrationApi } from "$lib/api/index.ts";
  import { colorStore } from "$lib/stores/colorStore";
  import { logger } from "$lib/logger";
  import { requestConfirmation } from "$lib/stores/confirmationStore";
  import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";
  import PluginCard from "$lib/components/plugin/PluginCard.svelte";
  import { errorText, type Named, type Notify } from "../toolsModel";
  import RoleRow from "./RoleRow.svelte";

  interface Props {
    guildId: bigint;
    roles: Named[];
    notify: Notify;
  }

  let { guildId, roles, notify }: Props = $props();

  let items: Array<{ roleId: bigint; roleName: string }> = $state([]);
  let loading = $state(true);
  let busy = $state(false);
  let roleId: string | null = $state(null);

  async function load() {
    try {
      items = (await administrationApi.getAutoBanRoles(guildId)) ?? [];
    } catch (err) {
      logger.error("Failed to load auto-ban roles:", err);
      notify(errorText(err, m.administrationRoles.loadFailed()), "error");
    } finally {
      loading = false;
    }
  }

  async function add() {
    if (busy || !roleId) return;
    busy = true;
    try {
      await administrationApi.addAutoBanRole(guildId, BigInt(roleId));
      roleId = null;
      notify(m.administrationRoles.added());
      await load();
    } catch (err) {
      logger.error("Failed to add auto-ban role:", err);
      notify(errorText(err, m.administrationRoles.addFailed()), "error");
    } finally {
      busy = false;
    }
  }

  async function remove(item: { roleId: bigint; roleName: string }) {
    const confirmed = await requestConfirmation({
      message: m.administrationRoles.autoBanRemoveConfirm({ role: item.roleName }),
      confirmText: m.common.remove()
    });
    if (!confirmed) return;
    try {
      await administrationApi.removeAutoBanRole(guildId, item.roleId);
      notify(m.administrationRoles.removed());
    } catch (err) {
      logger.error("Failed to remove auto-ban role:", err);
      notify(errorText(err, m.administrationRoles.removeFailed()), "error");
    }
    await load();
  }

  void load();
</script>

<PluginCard title={m.administrationRoles.autoBanTitle()} alwaysOpen>
  <div class="space-y-3">
    <div class="flex flex-col sm:flex-row gap-3">
      <div class="grow min-w-0">
        <DiscordSelector
          type="role"
          options={roles}
          selected={roleId}
          placeholder={m.common.selectARolePlaceholder()}
          onchange={(detail) => (roleId = typeof detail.selected === "string" ? detail.selected : null)}
        />
      </div>
      <button
        type="button"
        class="flex items-center justify-center gap-2 px-5 rounded-xl min-h-[50px] font-medium disabled:opacity-50"
        style="background: {$colorStore.primary}; color: {$colorStore.onPrimary};"
        disabled={busy || !roleId}
        onclick={add}
      >
        <i class="fa-solid fa-plus" aria-hidden="true"></i>
        {m.administrationRoles.addRole()}
      </button>
    </div>

    {#if loading}
      <div class="flex justify-center py-6">
        <div class="w-10 h-10 border-4 rounded-full animate-spin" style="border-color: {$colorStore.primary}20; border-top-color: {$colorStore.primary}"></div>
      </div>
    {:else if items.length === 0}
      <p class="py-4 text-center" style="color: {$colorStore.muted}">{m.administrationRoles.autoBanEmpty()}</p>
    {:else}
      <div class="space-y-2">
        {#each items as item (item.roleId)}
          <RoleRow
            title={item.roleName}
            removeLabel={m.administrationRoles.autoBanRemoveAria({ role: item.roleName })}
            onremove={() => remove(item)}
          />
        {/each}
      </div>
    {/if}
  </div>
</PluginCard>
