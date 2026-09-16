<!-- routes/dashboard/statroles/+page.svelte -->
<script lang="ts">
  import { onMount, untrack } from "svelte";
  import { goto } from "$app/navigation";
  import {
    clientApi,
    statRolesApi,
    StatRoleLimit,
    StatRoleStat,
    statRoleLimitLabels,
    statRoleStatLabels,
    type StatRole,
    type StatRoleRequest,
    type StatRoleRunResult,
  } from "$lib/api/index.ts";
  import { currentGuild } from "$lib/stores/currentGuild.ts";
  import { currentInstance } from "$lib/stores/instanceStore.ts";
  import { colorStore } from "$lib/stores/colorStore";
  import { logger } from "$lib/logger.ts";
  import { requestConfirmation } from "$lib/stores/confirmationStore";
  import DashboardPageLayout from "$lib/components/layout/DashboardPageLayout.svelte";
  import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";
  import SettingToggle from "$lib/components/forms/SettingToggle.svelte";
  import SettingField from "$lib/components/forms/SettingField.svelte";
  import Card from "$lib/components/analytics/Card.svelte";
  import Pill from "$lib/components/analytics/Pill.svelte";
  import StatTile from "$lib/components/analytics/StatTile.svelte";
  import SectionHeader from "$lib/components/stats/SectionHeader.svelte";
  import AsyncState from "$lib/components/stats/AsyncState.svelte";
  import RankList from "$lib/components/stats/RankList.svelte";
  import { formatAgo, formatNumber } from "$lib/components/stats/format";
  import type { PageData } from "./$types";

  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();

  const tabs = [
    { id: "roles", label: "Stat Roles", icon: "fa-trophy" },
    { id: "editor", label: "Create / Edit", icon: "fa-pen" },
  ];

  let activeTab = $state("roles");
  let notificationMessage = $state("");
  let notificationType = $state<"success" | "error">("success");

  function notify(message: string, type: "success" | "error" = "error") {
    notificationMessage = message;
    notificationType = type;
    setTimeout(() => (notificationMessage = ""), 4000);
  }

  function fail(err: unknown, fallback: string) {
    logger.error(fallback, err);
    notify(err instanceof Error ? err.message : fallback, "error");
  }

  /** Guild lists */
  let members = $state<Array<{ id: string; name: string; avatarUrl?: string }>>([]);
  let roles = $state<Array<{ id: string; name: string; color?: number }>>([]);
  let channels = $state<Array<{ id: string; name: string }>>([]);
  let textChannels = $state<Array<{ id: string; name: string }>>([]);

  async function loadGuildLists() {
    if (!$currentGuild?.id) return;
    const guildId = $currentGuild.id;
    const [memberList, roleList, channelList, textList] = await Promise.all([
      clientApi.getMembers(guildId).catch(() => []),
      clientApi.getRoles(guildId).catch(() => []),
      clientApi.getChannels(guildId).catch(() => []),
      clientApi.getTextChannels(guildId).catch(() => []),
    ]);
    members = memberList.map((m: any) => ({ id: m.id.toString(), name: m.username, avatarUrl: m.avatarUrl }));
    roles = roleList.map((r: any) => ({ id: r.id.toString(), name: r.name, color: r.color }));
    channels = channelList.map((c: any) => ({ id: c.id.toString(), name: c.name }));
    textChannels = textList.map((c) => ({ id: c.id.toString(), name: c.name }));
  }

  function roleName(id: bigint | string): string {
    const key = id.toString();
    return roles.find((r) => r.id === key)?.name ?? key;
  }

  /** List */
  let statRoles = $state<StatRole[]>([]);
  let listLoading = $state(false);
  let listError = $state<string | null>(null);
  let results = $state<Record<number, { result: StatRoleRunResult; preview: boolean }>>({});
  let busyId = $state<number | null>(null);

  async function loadRoles() {
    if (!$currentGuild?.id) return;
    listLoading = true;
    listError = null;
    try {
      statRoles = await statRolesApi.list($currentGuild.id);
    } catch (err) {
      listError = err instanceof Error ? err.message : "Failed to load stat roles";
      logger.error("Failed to load stat roles", err);
    } finally {
      listLoading = false;
    }
  }

  async function toggleEnabled(role: StatRole) {
    if (!$currentGuild?.id) return;
    try {
      const updated = await statRolesApi.update($currentGuild.id, role.id, { enabled: !role.enabled });
      statRoles = statRoles.map((r) => (r.id === role.id ? updated : r));
    } catch (err) {
      fail(err, "Failed to update the stat role");
    }
  }

  async function remove(role: StatRole) {
    if (!$currentGuild?.id) return;
    const ok = await requestConfirmation({
      title: "Delete stat role",
      message: `Delete "${role.name}"? Members keep whatever they currently hold.`,
      confirmText: "Delete",
    });
    if (!ok) return;
    try {
      await statRolesApi.remove($currentGuild.id, role.id);
      statRoles = statRoles.filter((r) => r.id !== role.id);
      delete results[role.id];
    } catch (err) {
      fail(err, "Failed to delete the stat role");
    }
  }

  async function preview(role: StatRole) {
    if (!$currentGuild?.id) return;
    busyId = role.id;
    try {
      results[role.id] = { result: await statRolesApi.preview($currentGuild.id, role.id), preview: true };
    } catch (err) {
      fail(err, "Failed to preview the stat role");
    } finally {
      busyId = null;
    }
  }

  async function run(role: StatRole) {
    if (!$currentGuild?.id) return;
    const ok = await requestConfirmation({
      title: "Run now",
      message: `Evaluate "${role.name}" and apply role changes right now?`,
      confirmText: "Run",
      variant: "warning",
    });
    if (!ok) return;
    busyId = role.id;
    try {
      results[role.id] = { result: await statRolesApi.run($currentGuild.id, role.id), preview: false };
      await loadRoles();
    } catch (err) {
      fail(err, "Failed to run the stat role");
    } finally {
      busyId = null;
    }
  }

  /** Editor */
  interface Draft {
    id: number | null;
    roleId: string | null;
    name: string;
    statType: number;
    limitType: number;
    minimum: number;
    maximum: number | null;
    lookbackDays: number;
    topStart: number;
    topEnd: number;
    requiredDays: number;
    permanent: boolean;
    invert: boolean;
    applyToBots: boolean;
    groupName: string;
    activityName: string;
    channelFilter: string[];
    roleWhitelist: string[];
    roleBlacklist: string[];
    ignoredUsers: string[];
    notifyChannelId: string | null;
    notifyDm: boolean;
    notifyMessage: string;
    intervalMinutes: number;
  }

  function emptyDraft(): Draft {
    return {
      id: null,
      roleId: null,
      name: "",
      statType: StatRoleStat.Messages,
      limitType: StatRoleLimit.Threshold,
      minimum: 100,
      maximum: null,
      lookbackDays: 30,
      topStart: 1,
      topEnd: 10,
      requiredDays: 5,
      permanent: false,
      invert: false,
      applyToBots: false,
      groupName: "",
      activityName: "",
      channelFilter: [],
      roleWhitelist: [],
      roleBlacklist: [],
      ignoredUsers: [],
      notifyChannelId: null,
      notifyDm: false,
      notifyMessage: "",
      intervalMinutes: 180,
    };
  }

  let draft = $state<Draft>(emptyDraft());
  let saving = $state(false);

  function edit(role: StatRole) {
    draft = {
      id: role.id,
      roleId: role.roleId.toString(),
      name: role.name,
      statType: role.statType,
      limitType: role.limitType,
      minimum: role.minimum,
      maximum: role.maximum ?? null,
      lookbackDays: role.lookbackDays,
      topStart: role.topStart,
      topEnd: role.topEnd,
      requiredDays: role.requiredDays,
      permanent: role.permanent,
      invert: role.invert,
      applyToBots: role.applyToBots,
      groupName: role.groupName ?? "",
      activityName: role.activityName ?? "",
      channelFilter: role.channelFilter.map((x) => x.toString()),
      roleWhitelist: role.roleWhitelist.map((x) => x.toString()),
      roleBlacklist: role.roleBlacklist.map((x) => x.toString()),
      ignoredUsers: role.ignoredUsers.map((x) => x.toString()),
      notifyChannelId: role.notifyChannelId ? role.notifyChannelId.toString() : null,
      notifyDm: role.notifyDm,
      notifyMessage: role.notifyMessage ?? "",
      intervalMinutes: role.intervalMinutes,
    };
    activeTab = "editor";
  }

  function startNew() {
    draft = emptyDraft();
    activeTab = "editor";
  }

  let usesWindow = $derived(
    draft.statType === StatRoleStat.Messages ||
      draft.statType === StatRoleStat.VoiceMinutes ||
      draft.statType === StatRoleStat.ActivityMinutes,
  );
  let streakAllowed = $derived(usesWindow);

  function toRequest(): StatRoleRequest {
    return {
      roleId: draft.roleId ? BigInt(draft.roleId) : undefined,
      name: draft.name.trim() || undefined,
      statType: draft.statType,
      limitType: draft.limitType,
      minimum: draft.minimum,
      maximum: draft.maximum ?? undefined,
      clearMaximum: draft.maximum === null,
      lookbackDays: draft.lookbackDays,
      topStart: draft.topStart,
      topEnd: draft.topEnd,
      requiredDays: draft.requiredDays,
      permanent: draft.permanent,
      invert: draft.invert,
      applyToBots: draft.applyToBots,
      groupName: draft.groupName.trim(),
      activityName: draft.activityName.trim(),
      channelFilter: draft.channelFilter.map((x) => BigInt(x)),
      roleWhitelist: draft.roleWhitelist.map((x) => BigInt(x)),
      roleBlacklist: draft.roleBlacklist.map((x) => BigInt(x)),
      ignoredUsers: draft.ignoredUsers.map((x) => BigInt(x)),
      notifyChannelId: draft.notifyChannelId ? BigInt(draft.notifyChannelId) : undefined,
      clearNotifyChannel: !draft.notifyChannelId,
      notifyDm: draft.notifyDm,
      notifyMessage: draft.notifyMessage.trim(),
      intervalMinutes: draft.intervalMinutes,
    };
  }

  async function save() {
    if (!$currentGuild?.id) return;
    if (!draft.roleId) {
      notify("Pick the role to manage.", "error");
      return;
    }
    if (draft.limitType === StatRoleLimit.DailyStreak && !streakAllowed) {
      notify("Daily streaks only work with messages, voice minutes or minutes in a game.", "error");
      return;
    }
    saving = true;
    try {
      const request = toRequest();
      if (draft.id === null) {
        await statRolesApi.create($currentGuild.id, request);
      } else {
        await statRolesApi.update($currentGuild.id, draft.id, request);
      }
      await loadRoles();
      draft = emptyDraft();
      activeTab = "roles";
    } catch (err) {
      fail(err, "Failed to save the stat role");
    } finally {
      saving = false;
    }
  }

  function toList(selected: string | string[] | null): string[] {
    if (Array.isArray(selected)) return selected;
    return selected ? [selected] : [];
  }

  /** Orchestration */
  let loadedFor = $state("");

  async function loadAll() {
    if (!$currentGuild?.id) return;
    const key = `${$currentGuild.id}:${$currentInstance?.port ?? ""}`;
    if (loadedFor === key) return;
    loadedFor = key;
    await Promise.all([loadGuildLists(), loadRoles()]);
  }

  onMount(async () => {
    if (!$currentGuild) {
      await goto("/dashboard");
      return;
    }
    await loadAll();
  });

  $effect(() => {
    if ($currentGuild && $currentInstance) untrack(() => loadAll());
  });

  const inputStyle = $derived(`background: ${$colorStore.primary}10; color: ${$colorStore.text};`);
</script>

<DashboardPageLayout
  title="Stat Roles"
  subtitle="Roles that are earned by activity and taken away again when it stops"
  icon="fa-trophy"
  guildName={$currentGuild?.name || "Dashboard"}
  {tabs}
  bind:activeTab
  bind:notificationMessage
  {notificationType}
  actionButtons={[{ label: "New stat role", icon: "fa-plus", action: startNew }]}
>
  {#if activeTab === "roles"}
    <section>
      <SectionHeader icon="fa-trophy" title="Stat Roles" subtitle="Each role is re-evaluated on its own schedule" />

      <AsyncState loading={listLoading} error={listError} empty={statRoles.length === 0} emptyMessage="No stat roles yet. Create one to reward active members automatically." emptyIcon="fa-trophy">
        <div class="space-y-4">
          {#each statRoles as role (role.id)}
            <Card>
              <div class="flex flex-wrap items-start justify-between gap-3">
                <div class="min-w-0">
                  <div class="flex flex-wrap items-center gap-2 mb-1">
                    <h3 class="font-semibold truncate" style="color: {$colorStore.text}">#{role.id} {role.name}</h3>
                    <Pill tone={role.enabled ? "ok" : "muted"} text={role.enabled ? "enabled" : "disabled"} />
                    {#if role.permanent}<Pill tone="warn" text="permanent" />{/if}
                    {#if role.invert}<Pill tone="crit" text="inverted" />{/if}
                    {#if role.groupName}<Pill tone="muted" text={`group: ${role.groupName}`} />{/if}
                  </div>
                  <p class="text-sm" style="color: {$colorStore.text}"><span style="color: {$colorStore.secondary}">@{roleName(role.roleId)}</span> · {role.condition}</p>
                  <p class="text-xs mt-1" style="color: {$colorStore.muted}">
                    every {role.intervalMinutes}m · last run {formatAgo(role.lastRunAt)}
                    {#if role.notifyChannelId} · announces in #{textChannels.find((c) => c.id === role.notifyChannelId?.toString())?.name ?? "channel"}{/if}
                    {#if role.notifyDm} · DMs members{/if}
                  </p>
                </div>
                <div class="flex flex-wrap gap-2">
                  <button type="button" class="min-h-[40px] px-3 rounded-lg text-sm font-medium" style="background: {$colorStore.primary}20; color: {$colorStore.primary};" onclick={() => preview(role)} disabled={busyId === role.id}>Preview</button>
                  <button type="button" class="min-h-[40px] px-3 rounded-lg text-sm font-medium" style="background: {$colorStore.secondary}20; color: {$colorStore.secondary};" onclick={() => run(role)} disabled={busyId === role.id}>Run now</button>
                  <button type="button" class="min-h-[40px] px-3 rounded-lg text-sm font-medium" style="background: {$colorStore.primary}20; color: {$colorStore.text};" onclick={() => toggleEnabled(role)}>{role.enabled ? "Disable" : "Enable"}</button>
                  <button type="button" class="min-h-[40px] px-3 rounded-lg text-sm font-medium" style="background: {$colorStore.primary}20; color: {$colorStore.text};" onclick={() => edit(role)}>Edit</button>
                  <button type="button" class="min-h-[40px] px-3 rounded-lg text-sm font-medium" style="background: {$colorStore.accent}20; color: {$colorStore.accent};" onclick={() => remove(role)}>Delete</button>
                </div>
              </div>

              {#if results[role.id]}
                {@const r = results[role.id]}
                <div class="mt-4 pt-4 border-t" style="border-color: {$colorStore.primary}20;">
                  <div class="grid grid-cols-3 md:grid-cols-6 gap-2 mb-3">
                    <StatTile label="Qualify" value={formatNumber(r.result.qualifyingCount)} />
                    <StatTile label={r.preview ? "Would gain" : "To gain"} value={formatNumber(r.result.toGrant.length)} tone="ok" />
                    <StatTile label={r.preview ? "Would lose" : "To lose"} value={formatNumber(r.result.toRemove.length)} tone={r.result.toRemove.length > 0 ? "warn" : null} />
                    {#if !r.preview}
                      <StatTile label="Granted" value={formatNumber(r.result.granted)} tone="ok" />
                      <StatTile label="Removed" value={formatNumber(r.result.removed)} />
                      <StatTile label="Failed" value={formatNumber(r.result.failed)} tone={r.result.failed > 0 ? "crit" : null} />
                    {/if}
                  </div>
                  <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div>
                      <h4 class="text-sm font-medium mb-2" style="color: {$colorStore.text}">Gaining the role</h4>
                      {#if r.result.toGrant.length === 0}
                        <p class="text-sm" style="color: {$colorStore.muted}">Nobody.</p>
                      {:else}
                        <RankList rows={r.result.toGrant.slice(0, 15).map((m, i) => ({ rank: m.rank ?? i + 1, id: m.userId.toString(), name: m.username ?? m.userId.toString(), avatarUrl: m.avatarUrl ?? null, value: formatNumber(m.value) }))} />
                      {/if}
                    </div>
                    <div>
                      <h4 class="text-sm font-medium mb-2" style="color: {$colorStore.text}">Losing the role</h4>
                      {#if r.result.toRemove.length === 0}
                        <p class="text-sm" style="color: {$colorStore.muted}">Nobody.</p>
                      {:else}
                        <RankList rows={r.result.toRemove.slice(0, 15).map((m, i) => ({ rank: i + 1, id: m.userId.toString(), name: m.username ?? m.userId.toString(), avatarUrl: m.avatarUrl ?? null, value: formatNumber(m.value) }))} />
                      {/if}
                    </div>
                  </div>
                </div>
              {/if}
            </Card>
          {/each}
        </div>
      </AsyncState>
    </section>
  {/if}

  {#if activeTab === "editor"}
    <section>
      <SectionHeader icon="fa-pen" title={draft.id === null ? "New Stat Role" : `Edit Stat Role #${draft.id}`} subtitle="Pick what to measure, how members qualify, and what happens when they do" />

      <div class="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <Card title="Condition">
          <div class="space-y-4">
            <SettingField label="Role to manage" hint="Granted to members who qualify and removed from those who no longer do" id="sr-role" required>
              <DiscordSelector id="sr-role" type="role" options={roles} bind:selected={draft.roleId} placeholder="Pick a role" />
            </SettingField>
            <SettingField label="Name" hint="Shown in lists; defaults to the role name" id="sr-name">
              <input id="sr-name" type="text" maxlength="64" bind:value={draft.name} class="w-full rounded-lg p-2 min-h-[44px]" style={inputStyle} />
            </SettingField>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <SettingField label="Measure" hint="What the condition looks at" id="sr-stat">
                <DiscordSelector
                  id="sr-stat"
                  type="custom"
                  customIcon="fa-chart-simple"
                  searchable={false}
                  options={Object.entries(statRoleStatLabels).map(([value, label]) => ({ id: value, name: label }))}
                  selected={String(draft.statType)}
                  onchange={(e) => { if (typeof e.selected === "string") draft.statType = Number(e.selected); }}
                />
              </SettingField>
              <SettingField label="Qualify by" hint="Threshold, top rank, top percent or a daily streak" id="sr-limit">
                <DiscordSelector
                  id="sr-limit"
                  type="custom"
                  customIcon="fa-filter"
                  searchable={false}
                  options={Object.entries(statRoleLimitLabels).map(([value, label]) => ({ id: value, name: label }))}
                  selected={String(draft.limitType)}
                  onchange={(e) => { if (typeof e.selected === "string") draft.limitType = Number(e.selected); }}
                />
              </SettingField>
            </div>

            {#if draft.statType === StatRoleStat.ActivityMinutes}
              <SettingField label="Game or app" hint="Leave empty to count time in any game" id="sr-activity">
                <input id="sr-activity" type="text" maxlength="128" placeholder="Any game" bind:value={draft.activityName} class="w-full rounded-lg p-2 min-h-[44px]" style={inputStyle} />
              </SettingField>
            {/if}

            {#if draft.limitType === StatRoleLimit.Threshold}
              <div class="grid grid-cols-2 gap-4">
                <SettingField label="Minimum" hint="The least a member needs" id="sr-min">
                  <input id="sr-min" type="number" min="0" bind:value={draft.minimum} class="w-full rounded-lg p-2 min-h-[44px]" style={inputStyle} />
                </SettingField>
                <SettingField label="Maximum" hint="Empty for no ceiling" id="sr-max">
                  <input id="sr-max" type="number" min="0" value={draft.maximum ?? ""} oninput={(e) => { const v = (e.currentTarget as HTMLInputElement).value; draft.maximum = v === "" ? null : Number(v); }} class="w-full rounded-lg p-2 min-h-[44px]" style={inputStyle} />
                </SettingField>
              </div>
            {:else if draft.limitType === StatRoleLimit.TopRank || draft.limitType === StatRoleLimit.TopPercent}
              <div class="grid grid-cols-2 gap-4">
                <SettingField label={draft.limitType === StatRoleLimit.TopRank ? "From rank" : "From percentile"} hint="Best position that qualifies, usually 1" id="sr-topstart">
                  <input id="sr-topstart" type="number" min="1" bind:value={draft.topStart} class="w-full rounded-lg p-2 min-h-[44px]" style={inputStyle} />
                </SettingField>
                <SettingField label={draft.limitType === StatRoleLimit.TopRank ? "To rank" : "To percentile"} hint="Worst position that still qualifies" id="sr-topend">
                  <input id="sr-topend" type="number" min="1" max={draft.limitType === StatRoleLimit.TopPercent ? 100 : undefined} bind:value={draft.topEnd} class="w-full rounded-lg p-2 min-h-[44px]" style={inputStyle} />
                </SettingField>
              </div>
            {:else}
              <div class="grid grid-cols-2 gap-4">
                <SettingField label="Per day minimum" hint="What a member must reach on a day for it to count" id="sr-perday">
                  <input id="sr-perday" type="number" min="1" bind:value={draft.minimum} class="w-full rounded-lg p-2 min-h-[44px]" style={inputStyle} />
                </SettingField>
                <SettingField label="Required days" hint="How many days inside the window must meet it" id="sr-days">
                  <input id="sr-days" type="number" min="1" bind:value={draft.requiredDays} class="w-full rounded-lg p-2 min-h-[44px]" style={inputStyle} />
                </SettingField>
              </div>
              {#if !streakAllowed}
                <p class="text-sm" style="color: {$colorStore.accent}">Daily streaks only work with messages, voice minutes or minutes in a game.</p>
              {/if}
            {/if}

            {#if usesWindow}
              <SettingField label="Window (days)" hint="How far back to measure, 1 to 90. 0 means all time (not available for streaks)." id="sr-lookback">
                <input id="sr-lookback" type="number" min={draft.limitType === StatRoleLimit.DailyStreak ? 1 : 0} max="90" bind:value={draft.lookbackDays} class="w-full rounded-lg p-2 min-h-[44px]" style={inputStyle} />
              </SettingField>
            {/if}

            <div class="grid grid-cols-1 md:grid-cols-3 gap-2">
              <SettingToggle id="sr-permanent" label="Permanent" hint="Never removed once earned" checked={draft.permanent} onchange={(v) => (draft.permanent = v)} />
              <SettingToggle id="sr-invert" label="Invert" hint="Members who do NOT qualify get it (inactivity roles)" checked={draft.invert} onchange={(v) => (draft.invert = v)} />
              <SettingToggle id="sr-bots" label="Include bots" hint="Consider bot accounts too" checked={draft.applyToBots} onchange={(v) => (draft.applyToBots = v)} />
            </div>
          </div>
        </Card>

        <div class="space-y-6">
          <Card title="Filters" note="Who is considered and where activity is counted">
            <div class="space-y-4">
              {#if draft.statType === StatRoleStat.Messages || draft.statType === StatRoleStat.VoiceMinutes}
                <SettingField label="Only count in channels" hint="Empty counts every channel" id="sr-channels">
                  <DiscordSelector id="sr-channels" type="channel" options={channels} multiple selected={draft.channelFilter} placeholder="Any channel" onchange={(e) => (draft.channelFilter = toList(e.selected))} />
                </SettingField>
              {/if}
              <SettingField label="Required roles" hint="Members need at least one of these" id="sr-whitelist">
                <DiscordSelector id="sr-whitelist" type="role" options={roles} multiple selected={draft.roleWhitelist} placeholder="No requirement" onchange={(e) => (draft.roleWhitelist = toList(e.selected))} />
              </SettingField>
              <SettingField label="Excluded roles" hint="Members holding any of these are never considered" id="sr-blacklist">
                <DiscordSelector id="sr-blacklist" type="role" options={roles} multiple selected={draft.roleBlacklist} placeholder="None" onchange={(e) => (draft.roleBlacklist = toList(e.selected))} />
              </SettingField>
              <SettingField label="Ignored members" hint="The role is never granted to or removed from these members" id="sr-ignored">
                <DiscordSelector id="sr-ignored" type="custom" customIcon="fa-user" options={members} multiple selected={draft.ignoredUsers} placeholder="None" onchange={(e) => (draft.ignoredUsers = toList(e.selected))} />
              </SettingField>
              <SettingField label="Group" hint="Stat roles sharing a group keep only the highest tier a member qualifies for" id="sr-group">
                <input id="sr-group" type="text" maxlength="32" placeholder="e.g. activity-tiers" bind:value={draft.groupName} class="w-full rounded-lg p-2 min-h-[44px]" style={inputStyle} />
              </SettingField>
            </div>
          </Card>

          <Card title="Schedule and notifications">
            <div class="space-y-4">
              <SettingField label="Evaluate every (minutes)" hint="At least 10. Default is every 3 hours." id="sr-interval">
                <input id="sr-interval" type="number" min="10" bind:value={draft.intervalMinutes} class="w-full rounded-lg p-2 min-h-[44px]" style={inputStyle} />
              </SettingField>
              <SettingField label="Announce in" hint="A message is posted here whenever the role is granted or removed" id="sr-notify-channel">
                <DiscordSelector id="sr-notify-channel" type="channel" options={textChannels} bind:selected={draft.notifyChannelId} placeholder="No announcements" />
              </SettingField>
              <SettingToggle id="sr-dm" label="DM the member" hint="Send the same message directly to the member" checked={draft.notifyDm} onchange={(v) => (draft.notifyDm = v)} />
              <SettingField label="Message" hint="Placeholders: %user%, %role%, %action% (earned or lost), %value%, %stat%. Empty uses the default." id="sr-message">
                <textarea id="sr-message" rows="3" placeholder="%user% %action% %role%" bind:value={draft.notifyMessage} class="w-full rounded-lg p-2" style={inputStyle}></textarea>
              </SettingField>
            </div>
          </Card>

          <div class="flex gap-2">
            <button type="button" class="flex-1 min-h-[48px] rounded-xl font-medium" style="background: {$colorStore.primary}; color: #fff;" onclick={save} disabled={saving}>
              {saving ? "Saving…" : draft.id === null ? "Create stat role" : "Save changes"}
            </button>
            <button type="button" class="min-h-[48px] px-5 rounded-xl font-medium" style="background: {$colorStore.primary}20; color: {$colorStore.text};" onclick={() => { draft = emptyDraft(); activeTab = "roles"; }}>Cancel</button>
          </div>
        </div>
      </div>
    </section>
  {/if}
</DashboardPageLayout>
