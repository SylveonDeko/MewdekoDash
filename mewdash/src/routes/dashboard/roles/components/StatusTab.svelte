<script lang="ts">
  import { m } from "$lib/i18n";
  import { fade } from "svelte/transition";
  import { colorStore } from "$lib/stores/colorStore";
  import { currentGuild } from "$lib/stores/currentGuild";
  import { clientApi, type StatusRole, statusRolesApi } from "$lib/api/index.ts";
  import { logger } from "$lib/logger";
  import { requestConfirmation } from "$lib/stores/confirmationStore";
  import { createAutoSave } from "$lib/utils/autoSave.svelte";
  import type { DiscordUser } from "$lib/types/discord";
  import PluginCard from "$lib/components/plugin/PluginCard.svelte";
  import MessageField from "$lib/components/plugin/MessageField.svelte";
  import ToggleRow from "$lib/components/forms/ToggleRow.svelte";
  import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";
  import Notification from "$lib/components/ui/Notification.svelte";
  import SaveStatus from "$lib/components/ui/SaveStatus.svelte";
  import Sheet from "$lib/components/ui/Sheet.svelte";

  interface Props {
    user?: DiscordUser;
  }

  let { user }: Props = $props();

  type Named = { id: string; name: string; color?: number };

  let loading = $state(true);
  let adding = $state(false);
  let statusRoles: StatusRole[] = $state([]);
  let channels: Named[] = $state([]);
  let roles: Named[] = $state([]);
  let editingId: number | null = $state(null);
  let creating = $state(false);
  let newStatus = $state("");
  let showNotification = $state(false);
  let notificationMessage = $state("");
  let notificationType: "success" | "error" = $state("success");

  const autoSave = createAutoSave({
    onError: (err) => notify(err instanceof Error && err.message ? err.message : m.statusroles.pageErrorAutosave(), "error")
  });

  const editing = $derived(statusRoles.find(r => r.id === editingId) ?? null);
  const withRoles = $derived(statusRoles.filter(r => r.toAdd || r.toRemove).length);
  const withChannel = $derived(statusRoles.filter(r => r.statusChannelId && r.statusChannelId !== BigInt(0)).length);

  const buttonStyle = $derived(
    `background: ${$colorStore.primary}20; color: ${$colorStore.text}; border: 1px solid ${$colorStore.primary}30;`
  );
  const inputStyle = $derived(
    `background: ${$colorStore.primary}10; border-color: ${$colorStore.primary}30; color: ${$colorStore.text};`
  );

  function notify(message: string, type: "success" | "error" = "success") {
    notificationMessage = message;
    notificationType = type;
    showNotification = true;
    setTimeout(() => {
      showNotification = false;
    }, 3000);
  }

  async function load() {
    if (!$currentGuild?.id) return;
    const guildId = $currentGuild.id;
    loading = true;
    try {
      const [entries, channelData, roleData] = await Promise.all([
        statusRolesApi.getStatusRoles(guildId).catch(() => []),
        clientApi.getTextChannels(guildId).catch(() => []),
        clientApi.getRoles(guildId).catch(() => [])
      ]);
      if ($currentGuild?.id !== guildId) return;
      statusRoles = entries;
      channels = (channelData || []).map((c: any) => ({ id: c.id.toString(), name: c.name }));
      roles = (roleData || [])
        .filter((r: any) => r.id !== guildId.toString() && !r.managed && !r.name.startsWith("@"))
        .map((r: any) => ({ id: r.id.toString(), name: r.name, color: r.color || 0 }))
        .sort((a: Named, b: Named) => a.name.localeCompare(b.name));
    } catch (err) {
      logger.error("Failed to load status role data:", err);
      notify(m.statusroles.pageErrorLoad(), "error");
    } finally {
      loading = false;
    }
  }

  async function add() {
    if (!$currentGuild?.id || !newStatus.trim() || adding) return;
    adding = true;
    const known = new Set(statusRoles.map(r => r.id));
    try {
      await statusRolesApi.addStatusRole($currentGuild.id, newStatus.trim());
      notify(m.statusroles.pageNotifyAdded());
      newStatus = "";
      creating = false;
      await load();
      const created = statusRoles.find(r => !known.has(r.id));
      if (created) editingId = created.id;
    } catch (err) {
      logger.error("Failed to add status role:", err);
      notify(m.statusroles.pageErrorAdd(), "error");
    } finally {
      adding = false;
    }
  }

  async function remove(role: StatusRole) {
    if (!$currentGuild?.id) return;
    if (!(await requestConfirmation({ message: m.statusroles.pageConfirmRemove(), confirmText: m.common.remove() }))) return;
    try {
      await statusRolesApi.removeStatusRole($currentGuild.id, role.id);
      if (editingId === role.id) editingId = null;
      notify(m.statusroles.pageNotifyRemoved());
      await load();
    } catch (err) {
      logger.error("Failed to remove status role:", err);
      notify(m.statusroles.pageErrorRemove(), "error");
    }
  }

  function patch(guildId: bigint, id: number, change: Partial<StatusRole>) {
    if ($currentGuild?.id !== guildId) return;
    statusRoles = statusRoles.map(r => (r.id === id ? { ...r, ...change } : r));
  }

  function setRoles(role: StatusRole, field: "toAdd" | "toRemove", selected: string[]) {
    if (!$currentGuild?.id) return;
    const guildId = $currentGuild.id;
    const previous = role[field];
    const value = selected.join(" ");
    patch(guildId, role.id, { [field]: value });
    void autoSave.now(`${role.id}:${field}`, async () => {
      try {
        if (field === "toAdd") await statusRolesApi.setAddRoles(guildId, role.id, value);
        else await statusRolesApi.setRemoveRoles(guildId, role.id, value);
      } catch (err) {
        patch(guildId, role.id, { [field]: previous });
        throw err;
      }
    });
  }

  function setChannel(role: StatusRole, channelId: string | null) {
    if (!$currentGuild?.id) return;
    const guildId = $currentGuild.id;
    const previous = role.statusChannelId;
    const value = channelId ? BigInt(channelId) : BigInt(0);
    patch(guildId, role.id, { statusChannelId: channelId ? value : null });
    void autoSave.now(`${role.id}:channel`, async () => {
      try {
        await statusRolesApi.setStatusChannel(guildId, role.id, value);
      } catch (err) {
        patch(guildId, role.id, { statusChannelId: previous });
        throw err;
      }
    });
  }

  function setMessage(role: StatusRole, value: string) {
    if (!$currentGuild?.id) return;
    const guildId = $currentGuild.id;
    autoSave.schedule(`${role.id}:embed`, async () => {
      await statusRolesApi.setStatusEmbed(guildId, role.id, value);
      patch(guildId, role.id, { statusEmbed: value });
    });
  }

  function toggle(role: StatusRole, field: "removeAdded" | "readdRemoved") {
    if (!$currentGuild?.id) return;
    const guildId = $currentGuild.id;
    const previous = role[field];
    patch(guildId, role.id, { [field]: !previous });
    void autoSave.now(`${role.id}:${field}`, async () => {
      try {
        if (field === "removeAdded") {
          const result = await statusRolesApi.toggleRemoveAdded(guildId, role.id);
          patch(guildId, role.id, { removeAdded: result.removeAdded });
        } else {
          const result = await statusRolesApi.toggleReaddRemoved(guildId, role.id);
          patch(guildId, role.id, { readdRemoved: result.readdRemoved });
        }
      } catch (err) {
        patch(guildId, role.id, { [field]: previous });
        throw err;
      }
    });
  }

  function closeEditor() {
    if (editingId !== null) void autoSave.flush(`${editingId}:embed`);
    editingId = null;
  }

  function ids(value: string): string[] {
    return value.split(/\s+/).filter(Boolean);
  }

  function roleNames(value: string): string {
    const list = ids(value);
    if (!list.length) return m.common.none();
    return list.map(id => roles.find(r => r.id === id)?.name ?? m.common.unknownRole()).join(", ");
  }

  const placeholders = $derived([
    { category: m.features.categoryServer(), name: "%user%", description: m.placeholders.user() },
    { category: m.features.categoryServer(), name: "%user.mention%", description: m.placeholders.userMention() },
    { category: m.features.categoryServer(), name: "%status%", description: m.placeholders.status() },
    { category: m.features.categoryServer(), name: "%server%", description: m.placeholders.server() }
  ]);

  $effect(() => {
    if ($currentGuild?.id) void load();
  });
</script>

{#if showNotification}
  <div class="fixed top-4 right-4 z-50" transition:fade>
    <Notification message={notificationMessage} type={notificationType} />
  </div>
{/if}

<div class="space-y-6 min-w-0">
  <div class="flex justify-end">
    <SaveStatus {autoSave} />
  </div>

  {#snippet addButton()}
    <button type="button" class="flex items-center justify-center gap-2 px-5 rounded-xl min-h-[50px] font-medium" style={buttonStyle} onclick={() => (creating = true)}>
      <i class="fa-solid fa-plus" aria-hidden="true"></i>
      {m.statusroles.pageAddAria()}
    </button>
  {/snippet}

  <PluginCard title={m.features.statusrolesName()} alwaysOpen actions={addButton}>
    {#if loading}
      <div class="flex justify-center py-6">
        <div class="w-10 h-10 border-4 rounded-full animate-spin" style="border-color: {$colorStore.primary}20; border-top-color: {$colorStore.primary}"></div>
      </div>
    {:else if statusRoles.length === 0}
      <div class="flex flex-col items-center gap-3 py-8 text-center">
        <i class="fa-solid fa-user-check" style="color: {$colorStore.muted}; font-size: 28px;" aria-hidden="true"></i>
        <p style="color: {$colorStore.muted}">{m.statusroles.pageListEmptyTitle()}</p>
      </div>
    {:else}
      <div class="space-y-2">
        {#each statusRoles as role (role.id)}
          <div class="flex items-center gap-2 rounded-xl border p-2 sm:p-3 min-w-0" style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}20;">
            <button type="button" class="grow min-w-0 text-left min-h-[44px] px-1" onclick={() => (editingId = role.id)}>
              <span class="block text-sm font-semibold truncate" style="color: {$colorStore.text}">{role.status}</span>
              <span class="block text-sm truncate" style="color: {$colorStore.muted}">
                {m.statusroles.pageItemRoles({ adds: roleNames(role.toAdd), removes: roleNames(role.toRemove) })}
              </span>
            </button>
            <button type="button" class="shrink-0 rounded-lg min-h-[44px] min-w-[44px]" style={buttonStyle} aria-label={m.common.edit()} onclick={() => (editingId = role.id)}>
              <i class="fa-solid fa-pen" aria-hidden="true"></i>
            </button>
            <button type="button" class="shrink-0 rounded-lg min-h-[44px] min-w-[44px]" style={buttonStyle} aria-label={m.common.delete()} onclick={() => remove(role)}>
              <i class="fa-solid fa-trash" aria-hidden="true"></i>
            </button>
          </div>
        {/each}
      </div>
    {/if}
  </PluginCard>

  <PluginCard title={m.common.statistics()} alwaysOpen>
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
      {#each [
        { label: m.statusroles.pageStatTotal(), value: statusRoles.length, sub: m.common.configuredLower() },
        { label: m.statusroles.pageStatActive(), value: withRoles, sub: m.statusroles.pageStatActiveSub() },
        { label: m.statusroles.pageStatNotify(), value: withChannel, sub: m.statusroles.pageStatNotifySub() }
      ] as stat (stat.label)}
        <div class="rounded-xl border p-4" style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}20;">
          <div class="text-sm" style="color: {$colorStore.muted}">{stat.label}</div>
          <div class="text-2xl font-bold" style="color: {$colorStore.text}">{stat.value}</div>
          <div class="text-xs" style="color: {$colorStore.muted}">{stat.sub}</div>
        </div>
      {/each}
    </div>
  </PluginCard>
</div>

{#if creating}
  <Sheet title={m.statusroles.pageAddAria()} onclose={() => (creating = false)}>
    <div>
      <label for="status-new-text" class="block text-sm font-medium mb-1" style="color: {$colorStore.text}">{m.statusroles.statusText()}</label>
      <input
        id="status-new-text"
        type="text"
        bind:value={newStatus}
        placeholder={m.statusroles.statusTextPlaceholder()}
        onkeydown={(e) => e.key === "Enter" && add()}
        class="w-full p-3 rounded-lg border focus:ring-2 min-h-[50px] text-base"
        style={inputStyle}
      >
    </div>
    {#snippet footer()}
      <button type="button" class="px-5 rounded-xl min-h-[50px] font-medium disabled:opacity-50" style={buttonStyle} onclick={() => (creating = false)}>
        {m.common.cancel()}
      </button>
      <button
        type="button"
        class="flex items-center justify-center gap-2 px-5 rounded-xl min-h-[50px] font-medium disabled:opacity-50"
        style="background: {$colorStore.primary}; color: {$colorStore.onPrimary};"
        disabled={adding || !newStatus.trim()}
        aria-busy={adding}
        onclick={add}
      >
        <i class="fa-solid fa-plus {adding ? 'fa-spin' : ''}" aria-hidden="true"></i>
        {adding ? m.common.adding() : m.common.add()}
      </button>
    {/snippet}
  </Sheet>
{/if}

{#if editing}
  {#key editing.id}
    <Sheet title={editing.status} onclose={closeEditor} size="lg">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div class="min-w-0">
        <span id="status-add-label" class="block text-sm font-medium mb-1" style="color: {$colorStore.text}">{m.statusroles.rolesToAdd()}</span>
        <DiscordSelector
          type="role"
          multiple
          options={roles}
          selected={ids(editing.toAdd)}
          placeholder={m.common.selectRolesPlaceholder()}
          ariaLabelledby="status-add-label"
          onchange={({ selected }) => editing && setRoles(editing, "toAdd", Array.isArray(selected) ? selected : [])}
        />
      </div>

      <div class="min-w-0">
        <span id="status-remove-label" class="block text-sm font-medium mb-1" style="color: {$colorStore.text}">{m.statusroles.rolesToRemove()}</span>
        <DiscordSelector
          type="role"
          multiple
          options={roles}
          selected={ids(editing.toRemove)}
          placeholder={m.common.selectRolesPlaceholder()}
          ariaLabelledby="status-remove-label"
          onchange={({ selected }) => editing && setRoles(editing, "toRemove", Array.isArray(selected) ? selected : [])}
        />
      </div>

      <div class="space-y-2 min-w-0">
        <ToggleRow
          checked={editing.removeAdded}
          title={m.statusroles.toggleRemoveAdded()}
          colors={$colorStore}
          onchange={() => editing && toggle(editing, "removeAdded")}
        />
        <ToggleRow
          checked={editing.readdRemoved}
          title={m.statusroles.toggleReaddRemoved()}
          colors={$colorStore}
          onchange={() => editing && toggle(editing, "readdRemoved")}
        />
      </div>

      <div class="min-w-0">
        <span id="status-channel-label" class="block text-sm font-medium mb-1" style="color: {$colorStore.text}">{m.common.notificationChannel()}</span>
        <DiscordSelector
          type="channel"
          options={channels}
          selected={editing.statusChannelId && editing.statusChannelId !== BigInt(0) ? editing.statusChannelId.toString() : null}
          placeholder={m.common.noChannel()}
          ariaLabelledby="status-channel-label"
          onchange={({ selected }) => editing && setChannel(editing, typeof selected === "string" && selected ? selected : null)}
        />
      </div>

      <div class="min-w-0 lg:col-span-2">
        <span class="block text-sm font-medium mb-1" style="color: {$colorStore.text}">{m.statusroles.pageEditMessage()}</span>
        <MessageField
          value={editing.statusEmbed}
          previewTitle={m.statusroles.pageEditPreviewTitle()}
          icon="fa-user-check"
          {user}
          {placeholders}
          placeholder={m.statusroles.pageEditMessagePlaceholder()}
          onchange={(message) => editing && setMessage(editing, message)}
        />
      </div>
      </div>

      {#snippet footer()}
        <button type="button" class="px-5 rounded-xl min-h-[50px] font-medium" style="background: {$colorStore.primary}; color: {$colorStore.onPrimary};" onclick={closeEditor}>
          {m.common.done()}
        </button>
      {/snippet}
    </Sheet>
  {/key}
{/if}
