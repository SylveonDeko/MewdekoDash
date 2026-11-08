<script lang="ts">
  import { m } from "$lib/i18n";
  import { inviteRolesApi, type InviteRolesConfig } from "$lib/api/index.ts";
  import { colorStore } from "$lib/stores/colorStore";
  import { logger } from "$lib/logger";
  import { requestConfirmation } from "$lib/stores/confirmationStore";
  import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";
  import SettingField from "$lib/components/forms/SettingField.svelte";
  import ToggleRow from "$lib/components/forms/ToggleRow.svelte";
  import PluginCard from "$lib/components/plugin/PluginCard.svelte";
  import type { AutoSave } from "$lib/utils/autoSave.svelte";
  import Sheet from "$lib/components/ui/Sheet.svelte";
  import NumberField from "./NumberField.svelte";
  import RowActions from "./RowActions.svelte";
  import { errorText, idString, type Role } from "./inviteModel";

  interface Props {
    guildId: bigint;
    config: InviteRolesConfig | null;
    roles: Role[];
    autoSave: AutoSave;
    onerror: (message: string) => void;
    onsuccess: (message: string) => void;
  }

  let { guildId, config = $bindable(), roles, autoSave, onerror, onsuccess }: Props = $props();

  let sheetOpen = $state(false);
  let editingRole: string | null = $state(null);
  let pickedRole: string | null = $state(null);
  let invites = $state(5);
  let saving = $state(false);
  let syncing = $state(false);

  const modes = $derived([
    { id: "0", name: m.invites.modeStack() },
    { id: "1", name: m.invites.modeHighest() }
  ]);

  const sorted = $derived([...(config?.roles ?? [])].sort((a, b) => a.requiredInvites - b.requiredInvites));
  const buttonStyle = $derived(
    `background: ${$colorStore.primary}20; color: ${$colorStore.text}; border: 1px solid ${$colorStore.primary}30;`
  );
  const roleOptions = $derived(roles.filter(role => role.id === editingRole || !config?.roles.some(x => idString(x.roleId) === role.id)));

  function roleLabel(id: string, name: string | null): string {
    return name ?? roles.find(role => role.id === id)?.name ?? id;
  }

  function change(request: { mode?: 0 | 1; removeOnDrop?: boolean }) {
    if (!config) return;
    const previous = config;
    config = { ...config, ...request };
    void autoSave.now("inviteRoles", async () => {
      try {
        config = await inviteRolesApi.updateSettings(guildId, request);
      } catch (err) {
        config = previous;
        throw err;
      }
    });
  }

  function openNew() {
    editingRole = null;
    pickedRole = null;
    invites = 5;
    sheetOpen = true;
  }

  function openEdit(roleId: string, required: number) {
    editingRole = roleId;
    pickedRole = roleId;
    invites = required;
    sheetOpen = true;
  }

  async function save() {
    if (!pickedRole || invites < 1 || saving) return;
    saving = true;
    try {
      if (editingRole && editingRole !== pickedRole) await inviteRolesApi.removeRole(guildId, BigInt(editingRole));
      config = await inviteRolesApi.setRole(guildId, BigInt(pickedRole), invites);
      sheetOpen = false;
    } catch (err) {
      logger.error("Failed to save milestone role:", err);
      onerror(errorText(err, m.invites.errorSaveRole()));
    } finally {
      saving = false;
    }
  }

  async function remove(roleId: string, name: string) {
    const confirmed = await requestConfirmation({
      message: m.invites.confirmRemoveRole({ role: name }),
      confirmText: m.common.remove()
    });
    if (!confirmed) return;
    try {
      config = await inviteRolesApi.removeRole(guildId, BigInt(roleId));
    } catch (err) {
      logger.error("Failed to remove milestone role:", err);
      onerror(errorText(err, m.invites.errorRemoveRole()));
    }
  }

  async function sync() {
    syncing = true;
    try {
      const result = await inviteRolesApi.sync(guildId);
      onsuccess(m.invites.notifyRolesSynced({ count: result.changed }));
    } catch (err) {
      logger.error("Failed to sync milestone roles:", err);
      onerror(errorText(err, m.invites.errorSyncRoles()));
    } finally {
      syncing = false;
    }
  }
</script>

{#snippet addButton()}
  <button type="button" class="flex items-center justify-center gap-2 px-5 rounded-xl min-h-[50px] font-medium" style={buttonStyle} onclick={openNew}>
    <i class="fa-solid fa-plus" aria-hidden="true"></i>
    {m.invites.addRole()}
  </button>
{/snippet}

<PluginCard title={m.invites.rolesTitle()} actions={addButton} alwaysOpen>
  {#if config}
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <SettingField label={m.invites.modeLabel()} id="invites-role-mode">
        <DiscordSelector
          id="invites-role-mode"
          type="custom"
          options={modes}
          customIcon="fa-layer-group"
          clearable={false}
          searchable={false}
          selected={String(config.mode)}
          onchange={(detail) => change({ mode: detail.selected === "1" ? 1 : 0 })}
        />
      </SettingField>
      <div class="self-end">
        <ToggleRow checked={config.removeOnDrop} title={m.invites.removeOnDrop()} colors={$colorStore} onchange={(value) => change({ removeOnDrop: value })} />
      </div>
    </div>

    {#each sorted as role (idString(role.roleId))}
      {@const id = idString(role.roleId)}
      {@const name = roleLabel(id, role.roleName)}
      <div class="relative flex items-center gap-2 sm:gap-3 rounded-xl border p-2 pl-3 min-w-0" style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}20;">
        <div class="grow min-w-0">
          <p class="text-sm font-semibold truncate" style="color: {$colorStore.text}">@{name}</p>
          <p class="text-xs" style="color: {$colorStore.muted}">{m.invites.roleThreshold({ count: role.requiredInvites })}</p>
        </div>
        <RowActions
          {name}
          moreLabel={m.common.moreActions()}
          actions={[
            { label: m.common.edit(), icon: "fa-pen", run: () => openEdit(id, role.requiredInvites) },
            { label: m.common.delete(), icon: "fa-trash", run: () => remove(id, name) }
          ]}
        />
      </div>
    {/each}

    <button type="button" class="flex items-center justify-center gap-2 px-5 rounded-xl min-h-[50px] font-medium disabled:opacity-50" style={buttonStyle} disabled={syncing} onclick={sync}>
      <i class="fa-solid fa-rotate" aria-hidden="true"></i>
      {m.invites.syncRoles()}
    </button>
  {/if}
</PluginCard>

{#if sheetOpen}
  <Sheet title={editingRole ? m.invites.editRole() : m.invites.addRole()} onclose={() => (sheetOpen = false)}>
    <SettingField label={m.common.role()} id="invites-milestone-role">
      <DiscordSelector id="invites-milestone-role" type="role" options={roleOptions} bind:selected={pickedRole} placeholder={m.common.selectRolePlaceholder()} />
    </SettingField>
    <NumberField id="invites-milestone-count" label={m.invites.requiredInvites()} min={1} value={invites} onchange={(value) => (invites = value ?? 1)} />
    {#snippet footer()}
      <button type="button" class="px-5 rounded-xl min-h-[50px] font-medium" style={buttonStyle} onclick={() => (sheetOpen = false)}>{m.common.cancel()}</button>
      <button
        type="button"
        class="px-5 rounded-xl min-h-[50px] font-medium disabled:opacity-50"
        style="background: {$colorStore.primary}; color: {$colorStore.onPrimary};"
        disabled={!pickedRole || invites < 1 || saving}
        onclick={save}
      >
        {m.common.save()}
      </button>
    {/snippet}
  </Sheet>
{/if}
