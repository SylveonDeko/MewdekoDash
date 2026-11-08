<script lang="ts">
  import { m } from "$lib/i18n";
  import { administrationApi } from "$lib/api/index.ts";
  import { colorStore } from "$lib/stores/colorStore";
  import { logger } from "$lib/logger";
  import { requestConfirmation } from "$lib/stores/confirmationStore";
  import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";
  import ToggleRow from "$lib/components/forms/ToggleRow.svelte";
  import PluginCard from "$lib/components/plugin/PluginCard.svelte";
  import type { AutoSave } from "$lib/utils/autoSave.svelte";
  import Sheet from "$lib/components/ui/Sheet.svelte";
  import { errorText, type Named, type Notify } from "../toolsModel";
  import RoleRow from "./RoleRow.svelte";

  interface Props {
    guildId: bigint;
    roles: Named[];
    autoSave: AutoSave;
    notify: Notify;
  }

  let { guildId, roles, autoSave, notify }: Props = $props();

  type Entry = {
    model: { roleId: bigint; group: number; levelRequirement: number };
    role: { name: string } | null;
  };

  let entries: Entry[] = $state([]);
  let groups: Record<number, string> = $state({});
  let exclusive = $state(false);
  let autoDelete = $state(false);
  let loading = $state(true);
  let busy = $state(false);

  let newRole: string | null = $state(null);
  let newGroup = $state("0");
  let newLevel = $state("0");

  let openRole: bigint | null = $state(null);
  let levelDraft = $state("0");
  let openGroup: number | null = $state(null);
  let groupDraft = $state("");

  const inputStyle = $derived(
    `background: ${$colorStore.primary}10; border-color: ${$colorStore.primary}30; color: ${$colorStore.text};`
  );

  const grouped = $derived.by(() => {
    const ids = new Set<number>([...Object.keys(groups).map(Number), ...entries.map(e => e.model.group)]);
    return [...ids]
      .sort((a, b) => a - b)
      .map(id => ({ id, name: groups[id] ?? "", items: entries.filter(e => e.model.group === id) }))
      .filter(g => g.items.length > 0 || g.name);
  });

  const roleLabel = (entry: Entry) => entry.role?.name || m.common.roleFallback({ id: entry.model.roleId.toString() });
  const levelText = (level: number) => (level > 0 ? m.common.levelMin({ level }) : m.administrationRoles.selfNoLevel());
  const toInt = (value: string, max: number) => Math.min(max, Math.max(0, Math.floor(Number(value) || 0)));

  function groupLabel(id: number, name: string) {
    if (id === 0) return m.common.ungrouped();
    return name ? m.administrationRoles.selfGroupNamed({ id, name }) : m.administrationRoles.selfGroup({ id });
  }

  async function load() {
    try {
      const data = (await administrationApi.getSelfAssignableRoles(guildId)) as any;
      entries = Array.isArray(data?.roles) ? data.roles : [];
      groups = data?.groups ?? {};
      exclusive = !!data?.exclusive;
    } catch (err) {
      logger.error("Failed to load self-assignable roles:", err);
      notify(errorText(err, m.administrationRoles.loadFailed()), "error");
    } finally {
      loading = false;
    }
  }

  async function toggleExclusive() {
    try {
      exclusive = await administrationApi.toggleSelfAssignableRoleExclusive(guildId);
    } catch (err) {
      logger.error("Failed to toggle exclusive:", err);
      notify(errorText(err, m.administrationRoles.saveFailed()), "error");
    }
  }

  async function toggleAutoDelete() {
    try {
      autoDelete = await administrationApi.toggleSelfAssignableRoleAutoDelete(guildId);
    } catch (err) {
      logger.error("Failed to toggle auto delete:", err);
      notify(errorText(err, m.administrationRoles.saveFailed()), "error");
    }
  }

  async function add() {
    if (busy || !newRole) return;
    busy = true;
    try {
      const roleId = BigInt(newRole);
      await administrationApi.addSelfAssignableRole(guildId, roleId, { group: toInt(newGroup, 100) });
      const level = toInt(newLevel, 1000);
      if (level > 0) await administrationApi.setSelfAssignableRoleLevel(guildId, roleId, level);
      newRole = null;
      newGroup = "0";
      newLevel = "0";
      notify(m.administrationRoles.added());
      await load();
    } catch (err) {
      logger.error("Failed to add self-assignable role:", err);
      notify(errorText(err, m.administrationRoles.addFailed()), "error");
    } finally {
      busy = false;
    }
  }

  async function remove(entry: Entry) {
    const confirmed = await requestConfirmation({
      message: m.administrationRoles.selfRemoveConfirm({ role: roleLabel(entry) }),
      confirmText: m.common.remove()
    });
    if (!confirmed) return;
    try {
      autoSave.cancel(`selfLevel:${entry.model.roleId}`);
      await administrationApi.removeSelfAssignableRole(guildId, entry.model.roleId);
      notify(m.administrationRoles.removed());
    } catch (err) {
      logger.error("Failed to remove self-assignable role:", err);
      notify(errorText(err, m.administrationRoles.removeFailed()), "error");
    }
    await load();
  }

  function openLevel(entry: Entry) {
    levelDraft = String(entry.model.levelRequirement || 0);
    openRole = entry.model.roleId;
  }

  function changeLevel(roleId: bigint) {
    const level = toInt(levelDraft, 1000);
    entries = entries.map(e => (e.model.roleId === roleId ? { ...e, model: { ...e.model, levelRequirement: level } } : e));
    autoSave.schedule(`selfLevel:${roleId}`, async () => {
      try {
        await administrationApi.setSelfAssignableRoleLevel(guildId, roleId, level);
      } catch (err) {
        notify(m.administrationRoles.saveFailed(), "error");
        throw err;
      }
    });
  }

  function closeLevel() {
    if (openRole !== null) void autoSave.flush(`selfLevel:${openRole}`);
    openRole = null;
  }

  function openGroupSheet(id: number, name: string) {
    groupDraft = name;
    openGroup = id;
  }

  function changeGroupName(id: number) {
    const name = groupDraft.trim();
    groups = { ...groups, [id]: name };
    autoSave.schedule(`selfGroup:${id}`, async () => {
      try {
        await administrationApi.setSelfAssignableRoleGroup(guildId, { group: id, name: name || null });
      } catch (err) {
        notify(m.administrationRoles.saveFailed(), "error");
        throw err;
      }
    });
  }

  function closeGroup() {
    if (openGroup !== null) void autoSave.flush(`selfGroup:${openGroup}`);
    openGroup = null;
  }

  const levelEntry = $derived(entries.find(e => e.model.roleId === openRole) ?? null);

  void load();
</script>

<PluginCard title={m.administrationRoles.selfTitle()} alwaysOpen>
  <div class="space-y-3">
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
      <ToggleRow
        checked={exclusive}
        title={m.administrationRoles.selfExclusive()}
        subtitle={m.administrationRoles.selfExclusiveHint()}
        colors={$colorStore}
        onchange={toggleExclusive}
      />
      <ToggleRow
        checked={autoDelete}
        title={m.administrationRoles.selfAutoDelete()}
        subtitle={m.administrationRoles.selfAutoDeleteHint()}
        colors={$colorStore}
        onchange={toggleAutoDelete}
      />
    </div>

    <DiscordSelector
      type="role"
      options={roles}
      selected={newRole}
      placeholder={m.common.selectARolePlaceholder()}
      onchange={(detail) => (newRole = typeof detail.selected === "string" ? detail.selected : null)}
    />
    <div class="flex flex-col sm:flex-row gap-3">
      <label class="grow min-w-0 block">
        <span class="block text-sm mb-1" style="color: {$colorStore.muted}">{m.common.group()}</span>
        <input
          type="number"
          inputmode="numeric"
          min="0"
          max="100"
          bind:value={newGroup}
          class="w-full p-3 rounded-lg border focus:ring-2 min-h-[50px]"
          style={inputStyle}
        >
      </label>
      <label class="grow min-w-0 block">
        <span class="block text-sm mb-1" style="color: {$colorStore.muted}">{m.administrationRoles.selfLevel()}</span>
        <input
          type="number"
          inputmode="numeric"
          min="0"
          max="1000"
          bind:value={newLevel}
          class="w-full p-3 rounded-lg border focus:ring-2 min-h-[50px]"
          style={inputStyle}
        >
      </label>
      <button
        type="button"
        class="flex items-center justify-center gap-2 px-5 rounded-xl min-h-[50px] sm:self-end font-medium disabled:opacity-50"
        style="background: {$colorStore.primary}; color: {$colorStore.onPrimary};"
        disabled={busy || !newRole}
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
    {:else if grouped.length === 0}
      <p class="py-4 text-center" style="color: {$colorStore.muted}">{m.administrationRoles.selfEmpty()}</p>
    {:else}
      <div class="space-y-4">
        {#each grouped as group (group.id)}
          <div class="space-y-2">
            <div class="flex items-center justify-between gap-2 min-w-0">
              <h3 class="text-sm font-semibold truncate" style="color: {$colorStore.text}">{groupLabel(group.id, group.name)}</h3>
              {#if group.id !== 0}
                <button
                  type="button"
                  class="shrink-0 rounded-lg min-h-[44px] min-w-[44px]"
                  style="background: {$colorStore.primary}10; color: {$colorStore.text}; border: 1px solid {$colorStore.primary}20;"
                  aria-label={m.administrationRoles.selfRenameGroup()}
                  onclick={() => openGroupSheet(group.id, group.name)}
                >
                  <i class="fa-solid fa-pen" aria-hidden="true"></i>
                </button>
              {/if}
            </div>
            {#each group.items as entry (entry.model.roleId)}
              <RoleRow
                title={roleLabel(entry)}
                subtitle={levelText(entry.model.levelRequirement)}
                removeLabel={m.administrationRoles.selfRemoveAria({ role: roleLabel(entry) })}
                onopen={() => openLevel(entry)}
                onremove={() => remove(entry)}
              />
            {/each}
          </div>
        {/each}
      </div>
    {/if}
  </div>
</PluginCard>

{#if levelEntry}
  <Sheet title={roleLabel(levelEntry)} onclose={closeLevel}>
    <label class="block">
      <span class="block text-sm mb-1" style="color: {$colorStore.muted}">{m.administrationRoles.selfLevel()}</span>
      <input
        type="number"
        inputmode="numeric"
        min="0"
        max="1000"
        bind:value={levelDraft}
        class="w-full p-3 rounded-lg border focus:ring-2 min-h-[50px]"
        style={inputStyle}
        oninput={() => changeLevel(levelEntry.model.roleId)}
        onblur={() => autoSave.flush(`selfLevel:${levelEntry.model.roleId}`)}
      >
    </label>
  </Sheet>
{/if}

{#if openGroup !== null}
  {@const id = openGroup}
  <Sheet title={groupLabel(id, groups[id] ?? "")} onclose={closeGroup}>
    <label class="block">
      <span class="block text-sm mb-1" style="color: {$colorStore.muted}">{m.administrationRoles.selfGroupName()}</span>
      <input
        type="text"
        maxlength="100"
        bind:value={groupDraft}
        class="w-full p-3 rounded-lg border focus:ring-2 min-h-[50px]"
        style={inputStyle}
        oninput={() => changeGroupName(id)}
        onblur={() => autoSave.flush(`selfGroup:${id}`)}
      >
    </label>
  </Sheet>
{/if}
