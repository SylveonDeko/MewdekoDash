<script lang="ts">
  import { onMount } from "svelte";
  import { m } from "$lib/i18n";
  import { PunishmentAction, utilityApi, type RoleMonitorConfig } from "$lib/api/index.ts";
  import { colorStore } from "$lib/stores/colorStore";
  import { logger } from "$lib/logger";
  import type { AutoSave } from "$lib/utils/autoSave.svelte";
  import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";
  import PluginCard from "$lib/components/plugin/PluginCard.svelte";
  import SettingField from "$lib/components/forms/SettingField.svelte";
  import ChipList from "./ChipList.svelte";
  import { errorText, nameOf, type Named, type TabProps } from "./utilityModel";

  interface Props extends TabProps {
    roles: Named[];
    members: Named[];
    autoSave: AutoSave;
  }

  let { guildId, roles, members, autoSave, onerror }: Props = $props();

  let config: RoleMonitorConfig | null = $state(null);
  let defaultPunishment = $state(PunishmentAction.None.toString());
  let rolePick: string | null = $state(null);
  let rolePunish: string | null = $state(null);
  let permPick: string | null = $state(null);
  let permPunish: string | null = $state(null);
  let trustedRole: string | null = $state(null);
  let trustedUser: string | null = $state(null);
  let busy = $state(false);

  const punishmentOptions = $derived([
    { id: PunishmentAction.None.toString(), name: m.utility.rmPunishRevert() },
    { id: PunishmentAction.Warn.toString(), name: m.common.warn() },
    { id: PunishmentAction.RemoveRoles.toString(), name: m.common.removeAllRoles() },
    { id: PunishmentAction.Mute.toString(), name: m.common.actionMute() },
    { id: PunishmentAction.Timeout.toString(), name: m.common.timeout() },
    { id: PunishmentAction.Kick.toString(), name: m.common.actionKick() },
    { id: PunishmentAction.Ban.toString(), name: m.common.actionBan() }
  ]);
  const overrideOptions = $derived([{ id: "default", name: m.utility.rmOverrideDefault() }, ...punishmentOptions]);

  const permissionOptions = $derived([
    { id: "8", name: m.common.permAdministrator() },
    { id: "4", name: m.common.permBanMembers() },
    { id: "2", name: m.common.permKickMembers() },
    { id: "1099511627776", name: m.common.permModerateMembers() },
    { id: "32", name: m.common.manageServer() },
    { id: "268435456", name: m.common.permManageRoles() },
    { id: "16", name: m.common.permManageChannels() },
    { id: "536870912", name: m.common.manageWebhooks() },
    { id: "8192", name: m.common.permManageMessages() },
    { id: "134217728", name: m.common.manageNicknames() },
    { id: "17179869184", name: m.utility.permManageThreads() },
    { id: "8589934592", name: m.utility.permManageEvents() },
    { id: "131072", name: m.common.mentionEveryone() }
  ]);

  function punishmentName(value: number | null): string {
    if (value === null || value === undefined) return m.utility.punishmentDefault();
    return punishmentOptions.find((o) => o.id === value.toString())?.name ?? PunishmentAction[value] ?? value.toString();
  }

  function override(value: string | null): number | null {
    return value && value !== "default" ? parseInt(value) : null;
  }

  async function load() {
    try {
      config = await utilityApi.getRoleMonitor(guildId);
      defaultPunishment = config.defaultPunishment.toString();
    } catch (err) {
      logger.error("Failed to load role monitor:", err);
      onerror(errorText(err, m.utility.rmLoadFailed()));
    }
  }

  async function run(action: () => Promise<unknown>, failure: string): Promise<boolean> {
    busy = true;
    try {
      await action();
      await load();
      return true;
    } catch (err) {
      logger.error(failure, err);
      onerror(errorText(err, failure));
      return false;
    } finally {
      busy = false;
    }
  }

  function saveDefault(value: string) {
    const previous = defaultPunishment;
    defaultPunishment = value;
    void autoSave.now("rm-default", async () => {
      try {
        await utilityApi.setRoleMonitorDefault(guildId, parseInt(value));
      } catch (err) {
        defaultPunishment = previous;
        throw err;
      }
    });
  }

  async function addRole() {
    if (!rolePick) return;
    const id = BigInt(rolePick);
    if (await run(() => utilityApi.addBlacklistedRole(guildId, id, override(rolePunish)), m.utility.rmBlacklistRoleFailed())) {
      rolePick = null;
      rolePunish = null;
    }
  }

  async function addPermission() {
    if (!permPick) return;
    const id = BigInt(permPick);
    if (await run(() => utilityApi.addBlacklistedPermission(guildId, id, override(permPunish)), m.utility.rmBlacklistPermissionFailed())) {
      permPick = null;
      permPunish = null;
    }
  }

  onMount(load);

  const rowStyle = $derived(`background: ${$colorStore.primary}08; border-color: ${$colorStore.primary}20;`);
  const iconButton = $derived(
    `background: ${$colorStore.primary}10; color: ${$colorStore.text}; border: 1px solid ${$colorStore.primary}20;`
  );
  const primaryButton = $derived(`background: ${$colorStore.primary}; color: ${$colorStore.onPrimary};`);
</script>

<div class="space-y-4 min-w-0">
  <PluginCard title={m.utility.rmCardTitle()} alwaysOpen>
    <div class="max-w-md">
      <SettingField label={m.utility.rmDefaultPunishment()} hint={m.utility.rmDefaultHint()} id="rm-default">
        <DiscordSelector
          type="custom"
          customIcon="fa-shield"
          options={punishmentOptions}
          selected={defaultPunishment}
          searchable={false}
          clearable={false}
          id="rm-default"
          ariaLabel={m.utility.rmDefaultPunishment()}
          onchange={({ selected }) => {
            if (typeof selected === "string") saveDefault(selected);
          }}
        />
      </SettingField>
    </div>
  </PluginCard>

  <PluginCard title={m.common.blacklistedRoles()} alwaysOpen>
    <div class="grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] gap-3">
      <DiscordSelector
        type="role"
        options={roles.filter((r) => !config?.blacklistedRoles.some((b) => b.roleId.toString() === r.id))}
        selected={rolePick}
        placeholder={m.utility.rmRolePlaceholder()}
        ariaLabel={m.utility.rmRoleAria()}
        onchange={({ selected }) => (rolePick = typeof selected === "string" ? selected : null)}
      />
      <DiscordSelector
        type="custom"
        customIcon="fa-shield"
        options={overrideOptions}
        selected={rolePunish ?? "default"}
        searchable={false}
        clearable={false}
        ariaLabel={m.common.punishment()}
        onchange={({ selected }) => (rolePunish = typeof selected === "string" ? selected : null)}
      />
      <button type="button" class="px-5 rounded-xl min-h-[50px] font-medium disabled:opacity-50" style={primaryButton} disabled={busy || !rolePick} onclick={addRole}>
        {m.common.add()}
      </button>
    </div>
    <div class="space-y-2">
      {#each config?.blacklistedRoles ?? [] as entry (entry.roleId.toString())}
        <div class="flex items-center gap-2 rounded-xl border p-2 pl-3 min-w-0" style={rowStyle}>
          <span class="grow min-w-0 truncate text-sm font-medium" style="color: {$colorStore.text}">@{nameOf(roles, entry.roleId)}</span>
          <span class="text-xs px-2 py-0.5 rounded-full shrink-0" style="background: {$colorStore.primary}15; color: {$colorStore.text};">{punishmentName(entry.punishment)}</span>
          <button
            type="button"
            class="rounded-lg min-h-[44px] min-w-[44px] shrink-0 disabled:opacity-50"
            style={iconButton}
            aria-label="{m.common.remove()}: {nameOf(roles, entry.roleId)}"
            disabled={busy}
            onclick={() => run(() => utilityApi.removeBlacklistedRole(guildId, entry.roleId), m.utility.rmRemoveRoleFailed())}
          >
            <i class="fa-solid fa-trash" aria-hidden="true"></i>
          </button>
        </div>
      {:else}
        <p class="text-sm" style="color: {$colorStore.muted}">{m.utility.rmRolesEmpty()}</p>
      {/each}
    </div>
  </PluginCard>

  <PluginCard title={m.utility.rmPermsTitle()} alwaysOpen>
    <div class="grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] gap-3">
      <DiscordSelector
        type="custom"
        customIcon="fa-lock"
        options={permissionOptions.filter((p) => !config?.blacklistedPermissions.some((b) => b.permission.toString() === p.id))}
        selected={permPick}
        placeholder={m.utility.rmPermPlaceholder()}
        ariaLabel={m.utility.rmPermAria()}
        onchange={({ selected }) => (permPick = typeof selected === "string" ? selected : null)}
      />
      <DiscordSelector
        type="custom"
        customIcon="fa-shield"
        options={overrideOptions}
        selected={permPunish ?? "default"}
        searchable={false}
        clearable={false}
        ariaLabel={m.common.punishment()}
        onchange={({ selected }) => (permPunish = typeof selected === "string" ? selected : null)}
      />
      <button type="button" class="px-5 rounded-xl min-h-[50px] font-medium disabled:opacity-50" style={primaryButton} disabled={busy || !permPick} onclick={addPermission}>
        {m.common.add()}
      </button>
    </div>
    <div class="space-y-2">
      {#each config?.blacklistedPermissions ?? [] as entry (entry.permission.toString())}
        <div class="flex items-center gap-2 rounded-xl border p-2 pl-3 min-w-0" style={rowStyle}>
          <span class="grow min-w-0 truncate text-sm font-medium" style="color: {$colorStore.text}">{entry.permissionName}</span>
          <span class="text-xs px-2 py-0.5 rounded-full shrink-0" style="background: {$colorStore.primary}15; color: {$colorStore.text};">{punishmentName(entry.punishment)}</span>
          <button
            type="button"
            class="rounded-lg min-h-[44px] min-w-[44px] shrink-0 disabled:opacity-50"
            style={iconButton}
            aria-label="{m.common.remove()}: {entry.permissionName}"
            disabled={busy}
            onclick={() => run(() => utilityApi.removeBlacklistedPermission(guildId, entry.permission), m.utility.rmRemovePermissionFailed())}
          >
            <i class="fa-solid fa-trash" aria-hidden="true"></i>
          </button>
        </div>
      {:else}
        <p class="text-sm" style="color: {$colorStore.muted}">{m.utility.rmPermsEmpty()}</p>
      {/each}
    </div>
  </PluginCard>

  <PluginCard title={m.utility.rmTrustedTitle()} alwaysOpen>
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="space-y-3 min-w-0">
        <span id="rm-trusted-roles" class="block text-sm font-medium" style="color: {$colorStore.text}">{m.utility.rmTrustedRoles()}</span>
        <DiscordSelector
          type="role"
          options={roles.filter((r) => !config?.whitelistedRoles.some((w) => w.toString() === r.id))}
          selected={trustedRole}
          placeholder={m.utility.rmTrustedRolePlaceholder()}
          ariaLabelledby="rm-trusted-roles"
          disabled={busy}
          onchange={({ selected }) => {
            if (typeof selected !== "string") return;
            trustedRole = null;
            void run(() => utilityApi.whitelistRole(guildId, BigInt(selected)), m.utility.rmWhitelistRoleFailed());
          }}
        />
        <ChipList
          disabled={busy}
          items={(config?.whitelistedRoles ?? []).map((id) => ({
            key: id.toString(),
            label: `@${nameOf(roles, id)}`,
            removeLabel: m.utility.rmTrustedRoleRemoveAria({ role: nameOf(roles, id) })
          }))}
          onremove={(id) => run(() => utilityApi.unwhitelistRole(guildId, BigInt(id)), m.utility.rmRemoveRoleFailed())}
        />
      </div>

      <div class="space-y-3 min-w-0">
        <span id="rm-trusted-members" class="block text-sm font-medium" style="color: {$colorStore.text}">{m.utility.rmTrustedMembers()}</span>
        <DiscordSelector
          type="user"
          options={members.filter((x) => !config?.whitelistedUsers.some((w) => w.toString() === x.id))}
          selected={trustedUser}
          ariaLabelledby="rm-trusted-members"
          disabled={busy}
          onchange={({ selected }) => {
            if (typeof selected !== "string") return;
            trustedUser = null;
            void run(() => utilityApi.whitelistUser(guildId, BigInt(selected)), m.utility.rmWhitelistUserFailed());
          }}
        />
        <ChipList
          disabled={busy}
          items={(config?.whitelistedUsers ?? []).map((id) => ({
            key: id.toString(),
            label: nameOf(members, id),
            removeLabel: m.utility.rmTrustedMemberRemoveAria({ user: nameOf(members, id) })
          }))}
          onremove={(id) => run(() => utilityApi.unwhitelistUser(guildId, BigInt(id)), m.utility.rmRemoveMemberFailed())}
        />
      </div>
    </div>
  </PluginCard>
</div>
