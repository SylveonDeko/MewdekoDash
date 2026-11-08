<script lang="ts">
  import { m } from "$lib/i18n";
  import { colorStore } from "$lib/stores/colorStore";
  import { currentGuild } from "$lib/stores/currentGuild";
  import { requestConfirmation } from "$lib/stores/confirmationStore";
  import { roleMenusApi, type RoleMenuGroup } from "$lib/api/index.ts";
  import { logger } from "$lib/logger";
  import PluginCard from "$lib/components/plugin/PluginCard.svelte";
  import SettingField from "$lib/components/forms/SettingField.svelte";
  import { NAME_LENGTH } from "../../roleMenuDefaults";

  /** Inputs for the group list. */
  interface Props {
    /** The server's groups */
    groups: RoleMenuGroup[];
    /** Called with the new list after a change */
    onchange: (groups: RoleMenuGroup[]) => void;
    /** Called with a message when a change fails */
    onerror: (message: string) => void;
  }

  let { groups, onchange, onerror }: Props = $props();

  let busy = $state(false);
  let newName = $state("");
  let newMax = $state(1);
  let limits = $state<Record<number, number>>({});

  const inputStyle = $derived(
    `background: ${$colorStore.primary}10; border-color: ${$colorStore.primary}30; color: ${$colorStore.text};`
  );
  const ghostStyle = $derived(
    `background: ${$colorStore.primary}10; color: ${$colorStore.text}; border: 1px solid ${$colorStore.primary}20;`
  );

  /**
   * The limit shown for a group: the edited value, or the saved one.
   * @param group The group
   */
  function limitOf(group: RoleMenuGroup): number {
    return limits[group.id] ?? group.maxRoles;
  }

  /**
   * Runs a change, reporting a failure.
   * @param work The change
   */
  async function run(work: () => Promise<void>) {
    if (!$currentGuild?.id || busy) return;
    busy = true;
    try {
      await work();
    } catch (err: any) {
      logger.error("Failed to change a role menu group:", err);
      onerror(err?.message || m.roleMenus.groupsSaveFailed());
    } finally {
      busy = false;
    }
  }

  /** Creates a group, or changes the limit of the one with the same name. */
  function add() {
    const name = newName.trim();
    if (!name) return;
    run(async () => {
      const saved = await roleMenusApi.createGroup($currentGuild!.id!, { name, maxRoles: Math.max(newMax, 0) });
      onchange([...groups.filter((g) => g.id !== saved.id), saved].sort((a, b) => a.name.localeCompare(b.name)));
      newName = "";
      newMax = 1;
    });
  }

  /**
   * Saves a group's limit.
   * @param group The group
   */
  function save(group: RoleMenuGroup) {
    run(async () => {
      const saved = await roleMenusApi.updateGroup($currentGuild!.id!, group.id, Math.max(limitOf(group), 0));
      onchange(groups.map((g) => (g.id === saved.id ? saved : g)));
      delete limits[group.id];
    });
  }

  /**
   * Deletes a group after confirming.
   * @param group The group
   */
  async function remove(group: RoleMenuGroup) {
    const ok = await requestConfirmation({
      title: group.name,
      message: m.roleMenus.groupsDeleteMessage(),
      confirmText: m.common.delete(),
      variant: "danger"
    });
    if (!ok) return;
    run(async () => {
      await roleMenusApi.removeGroup($currentGuild!.id!, group.id);
      onchange(groups.filter((g) => g.id !== group.id));
    });
  }
</script>

<PluginCard title={m.roleMenus.groupsTitle()} alwaysOpen>
  {#if groups.length === 0}
    <p class="text-sm py-2" style="color: {$colorStore.muted}">{m.roleMenus.groupsEmpty()}</p>
  {:else}
    <div class="space-y-2">
      {#each groups as group (group.id)}
        <div class="rounded-xl border p-3 space-y-3"
             style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}20;">
          <div class="flex flex-wrap items-center gap-2">
            <span class="text-sm font-semibold truncate min-w-0" style="color: {$colorStore.text}">{group.name}</span>
            <span class="text-xs px-2 py-0.5 rounded-full font-medium"
                  style="background: {$colorStore.primary}15; color: {$colorStore.text};">
              {m.roleMenus.groupsMenuCount({ count: group.menuIds.length })}
            </span>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-[1fr_auto_auto] gap-2 items-end">
            <SettingField label={m.roleMenus.groupsLimit()} hint={m.roleMenus.groupsLimitHint()} id="rmg-{group.id}-max">
              <input
                id="rmg-{group.id}-max"
                type="number"
                min="0"
                inputmode="numeric"
                value={limitOf(group)}
                oninput={(e) => { limits[group.id] = Math.max(parseInt(e.currentTarget.value) || 0, 0); }}
                class="w-full p-3 rounded-lg border focus:ring-2 min-h-[50px]"
                style={inputStyle}
              >
            </SettingField>
            <button
              type="button"
              class="flex items-center justify-center gap-2 px-5 rounded-lg min-h-[50px] font-medium disabled:opacity-50"
              style="background: {$colorStore.primary}; color: {$colorStore.onPrimary};"
              onclick={() => save(group)}
              disabled={busy || limitOf(group) === group.maxRoles}
            >
              <i class="fa-solid fa-floppy-disk" aria-hidden="true"></i>
              {m.common.save()}
            </button>
            <button
              type="button"
              class="flex items-center justify-center gap-2 px-5 rounded-lg min-h-[50px] font-medium disabled:opacity-50"
              style="background: #ef444420; color: #ef4444; border: 1px solid #ef444430;"
              onclick={() => remove(group)}
              disabled={busy}
            >
              <i class="fa-solid fa-trash" aria-hidden="true"></i>
              {m.common.delete()}
            </button>
          </div>
        </div>
      {/each}
    </div>
  {/if}

  <div class="grid grid-cols-1 sm:grid-cols-[1fr_8rem_auto] gap-2 items-end">
    <SettingField label={m.roleMenus.groupsName()} id="rmg-new-name">
      <input
        id="rmg-new-name"
        type="text"
        bind:value={newName}
        maxlength={NAME_LENGTH}
        class="w-full p-3 rounded-lg border focus:ring-2 min-h-[50px]"
        style={inputStyle}
      >
    </SettingField>
    <SettingField label={m.roleMenus.groupsLimit()} id="rmg-new-max">
      <input
        id="rmg-new-max"
        type="number"
        min="0"
        inputmode="numeric"
        bind:value={newMax}
        class="w-full p-3 rounded-lg border focus:ring-2 min-h-[50px]"
        style={inputStyle}
      >
    </SettingField>
    <button
      type="button"
      class="flex items-center justify-center gap-2 px-5 rounded-lg min-h-[50px] font-medium disabled:opacity-50"
      style={ghostStyle}
      onclick={add}
      disabled={busy || !newName.trim()}
    >
      <i class="fa-solid fa-plus" aria-hidden="true"></i>
      {m.common.add()}
    </button>
  </div>
</PluginCard>
