<script lang="ts">
  import { m } from "$lib/i18n";
  import { votesApi, type VoteRole } from "$lib/api/index.ts";
  import { colorStore } from "$lib/stores/colorStore";
  import { logger } from "$lib/logger";
  import { requestConfirmation } from "$lib/stores/confirmationStore";
  import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";
  import SettingField from "$lib/components/forms/SettingField.svelte";
  import PluginCard from "$lib/components/plugin/PluginCard.svelte";
  import type { AutoSave } from "$lib/utils/autoSave.svelte";
  import DurationField from "./DurationField.svelte";
  import { errorText, type Named, type Notify } from "./votesModel";

  interface Props {
    guildId: bigint;
    roles: Named[];
    autoSave: AutoSave;
    notify: Notify;
  }

  let { guildId, roles, autoSave, notify }: Props = $props();

  let voteRoles: VoteRole[] = $state([]);
  let loading = $state(true);
  let busy = $state(false);
  let newRoleId: string | null = $state(null);
  let newSeconds = $state(0);

  const pickable = $derived(
    roles.filter(
      role => String(role.id) !== String(guildId) && !voteRoles.some(entry => String(entry.roleId) === String(role.id))
    )
  );

  const buttonStyle = $derived(`background: ${$colorStore.primary}; color: ${$colorStore.onPrimary};`);

  async function load() {
    try {
      voteRoles = await votesApi.getVoteRoles(guildId);
    } catch (err) {
      logger.error("Failed to load vote roles:", err);
      notify(errorText(err, m.votes.pageErrorLoad()), "error");
    } finally {
      loading = false;
    }
  }

  async function add() {
    if (busy || !newRoleId) return;
    busy = true;
    try {
      await votesApi.addVoteRole(guildId, BigInt(newRoleId), newSeconds);
      newRoleId = null;
      newSeconds = 0;
      notify(m.votes.pageNotifyRoleAdded());
      await load();
    } catch (err) {
      logger.error("Failed to add vote role:", err);
      notify(errorText(err, m.votes.pageErrorRoleAdd()), "error");
    } finally {
      busy = false;
    }
  }

  async function remove(role: VoteRole) {
    const confirmed = await requestConfirmation({ message: m.votes.confirmRemove({ name: role.roleName }), confirmText: m.common.remove() });
    if (!confirmed) return;
    try {
      autoSave.cancel(`votes:role:${role.roleId}`);
      await votesApi.removeVoteRole(guildId, role.roleId);
      notify(m.votes.pageNotifyRoleRemoved());
    } catch (err) {
      logger.error("Failed to remove vote role:", err);
      notify(errorText(err, m.votes.pageErrorRoleRemove()), "error");
    }
    await load();
  }

  async function clear() {
    const confirmed = await requestConfirmation({ message: m.votes.pageConfirmClear(), confirmText: m.votes.pageConfirmClearConfirm() });
    if (!confirmed) return;
    try {
      await autoSave.flush();
      await votesApi.clearVoteRoles(guildId);
      notify(m.votes.pageNotifyCleared());
    } catch (err) {
      logger.error("Failed to clear vote roles:", err);
      notify(errorText(err, m.votes.pageErrorClear()), "error");
    }
    await load();
  }

  function setSeconds(role: VoteRole, seconds: number) {
    const key = String(role.roleId);
    const previous = role.seconds;
    voteRoles = voteRoles.map(entry => (String(entry.roleId) === key ? { ...entry, seconds } : entry));
    autoSave.schedule(`votes:role:${key}`, async () => {
      try {
        await votesApi.updateVoteRoleTimer(guildId, role.roleId, seconds);
      } catch (err) {
        voteRoles = voteRoles.map(entry => (String(entry.roleId) === key ? { ...entry, seconds: previous } : entry));
        throw err;
      }
    });
  }

  void load();
</script>

<PluginCard title={m.votes.pageRoleAddAria()} alwaysOpen>
  <SettingField label={m.votes.pageRoleToGrant()} id="vote-role-new">
    <DiscordSelector
      id="vote-role-new"
      type="role"
      options={pickable}
      selected={newRoleId}
      placeholder={m.common.selectRolePlaceholder()}
      onchange={({ selected }) => (newRoleId = typeof selected === "string" ? selected : null)}
    />
  </SettingField>
  <DurationField id="vote-role-new-duration" seconds={newSeconds} onchange={seconds => (newSeconds = seconds)} />
  <button
    type="button"
    class="flex items-center justify-center gap-2 px-5 rounded-xl min-h-[50px] font-medium disabled:opacity-50"
    style={buttonStyle}
    disabled={busy || !newRoleId}
    onclick={add}
  >
    <i class="fa-solid fa-plus" aria-hidden="true"></i>
    {m.votes.pageRoleAddAria()}
  </button>
</PluginCard>

<PluginCard title={m.votes.pageRolesTitle({ count: voteRoles.length })} alwaysOpen>
  {#if loading}
    <div class="flex justify-center py-6">
      <div class="w-10 h-10 border-4 rounded-full animate-spin" style="border-color: {$colorStore.primary}20; border-top-color: {$colorStore.primary}"></div>
    </div>
  {:else if voteRoles.length === 0}
    <div class="flex flex-col items-center gap-3 py-8 text-center">
      <i class="fa-solid fa-crown" style="color: {$colorStore.muted}; font-size: 28px;" aria-hidden="true"></i>
      <p style="color: {$colorStore.muted}">{m.votes.pageRolesEmptyTitle()}</p>
    </div>
  {:else}
    <div class="space-y-3">
      {#each voteRoles as role (String(role.roleId))}
        <div class="rounded-xl border p-3 space-y-3 min-w-0" style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}20;">
          <div class="flex items-center gap-2 min-w-0">
            <span class="grow min-w-0 truncate text-sm font-semibold" style="color: {$colorStore.text}">{role.roleName}</span>
            <button
              type="button"
              class="shrink-0 rounded-lg min-h-[44px] min-w-[44px]"
              style="background: {$colorStore.primary}10; color: {$colorStore.text}; border: 1px solid {$colorStore.primary}20;"
              aria-label={m.votes.removeAria({ name: role.roleName })}
              onclick={() => remove(role)}
            >
              <i class="fa-solid fa-trash" aria-hidden="true"></i>
            </button>
          </div>
          <DurationField id="vote-role-{role.roleId}" seconds={role.seconds} onchange={seconds => setSeconds(role, seconds)} />
        </div>
      {/each}
      <button
        type="button"
        class="px-4 rounded-lg min-h-[44px] text-sm font-medium"
        style="background: {$colorStore.primary}10; color: {$colorStore.text}; border: 1px solid {$colorStore.primary}20;"
        onclick={clear}
      >
        {m.common.clearAll()}
      </button>
    </div>
  {/if}
</PluginCard>
