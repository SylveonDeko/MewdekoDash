<!-- routes/dashboard/statroles/+page.svelte -->
<script lang="ts">
  import { m } from "$lib/i18n";
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

  const tabs = $derived([
    { id: "roles", label: m.features.statrolesName(), icon: "fa-trophy" },
    { id: "editor", label: m.statroles.tabEditor(), icon: "fa-pen" },
  ]);

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
    members = memberList.map((mem: any) => ({ id: mem.id.toString(), name: mem.username, avatarUrl: mem.avatarUrl }));
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
      listError = err instanceof Error ? err.message : m.statroles.loadFailed();
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
      fail(err, m.statroles.updateFailed());
    }
  }

  async function remove(role: StatRole) {
    if (!$currentGuild?.id) return;
    const ok = await requestConfirmation({
      title: m.statroles.deleteTitle(),
      message: m.statroles.deleteMessage({ name: role.name }),
      confirmText: m.common.delete(),
    });
    if (!ok) return;
    try {
      await statRolesApi.remove($currentGuild.id, role.id);
      statRoles = statRoles.filter((r) => r.id !== role.id);
      delete results[role.id];
    } catch (err) {
      fail(err, m.statroles.deleteFailed());
    }
  }

  async function preview(role: StatRole) {
    if (!$currentGuild?.id) return;
    busyId = role.id;
    try {
      results[role.id] = { result: await statRolesApi.preview($currentGuild.id, role.id), preview: true };
    } catch (err) {
      fail(err, m.statroles.previewFailed());
    } finally {
      busyId = null;
    }
  }

  async function run(role: StatRole) {
    if (!$currentGuild?.id) return;
    const ok = await requestConfirmation({
      title: m.statroles.runNow(),
      message: m.statroles.runMessage({ name: role.name }),
      confirmText: m.statroles.run(),
      variant: "warning",
    });
    if (!ok) return;
    busyId = role.id;
    try {
      results[role.id] = { result: await statRolesApi.run($currentGuild.id, role.id), preview: false };
      await loadRoles();
    } catch (err) {
      fail(err, m.statroles.runFailed());
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
      notify(m.statroles.errorPickRole(), "error");
      return;
    }
    if (draft.limitType === StatRoleLimit.DailyStreak && !streakAllowed) {
      notify(m.statroles.errorStreakUnsupported(), "error");
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
      fail(err, m.statroles.saveFailed());
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
  title={m.features.statrolesName()}
  subtitle={m.features.statrolesDescription()}
  icon="fa-trophy"
  guildName={$currentGuild?.name || m.common.dashboard()}
  {tabs}
  bind:activeTab
  bind:notificationMessage
  {notificationType}
  actionButtons={[{ label: m.statroles.newRole(), icon: "fa-plus", action: startNew }]}
>
  {#if activeTab === "roles"}
    <section>
      <SectionHeader icon="fa-trophy" title={m.features.statrolesName()} subtitle={m.statroles.listSubtitle()} />

      <AsyncState loading={listLoading} error={listError} empty={statRoles.length === 0} emptyMessage={m.statroles.listEmpty()} emptyIcon="fa-trophy">
        <div class="space-y-4">
          {#each statRoles as role (role.id)}
            <Card>
              <div class="flex flex-wrap items-start justify-between gap-3">
                <div class="min-w-0">
                  <div class="flex flex-wrap items-center gap-2 mb-1">
                    <h3 class="font-semibold truncate" style="color: {$colorStore.text}">#{role.id} {role.name}</h3>
                    <Pill tone={role.enabled ? "ok" : "muted"} text={role.enabled ? m.statroles.pillEnabled() : m.common.disabledLower()} />
                    {#if role.permanent}<Pill tone="warn" text={m.common.permanentLower()} />{/if}
                    {#if role.invert}<Pill tone="crit" text={m.statroles.pillInverted()} />{/if}
                    {#if role.groupName}<Pill tone="muted" text={m.statroles.pillGroup({ name: role.groupName })} />{/if}
                  </div>
                  <p class="text-sm" style="color: {$colorStore.text}"><span style="color: {$colorStore.secondary}">@{roleName(role.roleId)}</span> · {role.condition}</p>
                  <p class="text-xs mt-1" style="color: {$colorStore.muted}">
                    {m.statroles.scheduleSummary({ minutes: role.intervalMinutes, lastRun: formatAgo(role.lastRunAt) })}
                    {#if role.notifyChannelId} · {m.statroles.announcesIn({ channel: textChannels.find((c) => c.id === role.notifyChannelId?.toString())?.name ?? m.common.channel().toLowerCase() })}{/if}
                    {#if role.notifyDm} · {m.statroles.dmsMembers()}{/if}
                  </p>
                </div>
                <div class="flex flex-wrap gap-2">
                  <button type="button" class="min-h-[40px] px-3 rounded-lg text-sm font-medium" style="background: {$colorStore.primary}20; color: {$colorStore.primary};" onclick={() => preview(role)} disabled={busyId === role.id}>{m.common.preview()}</button>
                  <button type="button" class="min-h-[40px] px-3 rounded-lg text-sm font-medium" style="background: {$colorStore.secondary}20; color: {$colorStore.secondary};" onclick={() => run(role)} disabled={busyId === role.id}>{m.statroles.runNow()}</button>
                  <button type="button" class="min-h-[40px] px-3 rounded-lg text-sm font-medium" style="background: {$colorStore.primary}20; color: {$colorStore.text};" onclick={() => toggleEnabled(role)}>{role.enabled ? m.common.disable() : m.common.enable()}</button>
                  <button type="button" class="min-h-[40px] px-3 rounded-lg text-sm font-medium" style="background: {$colorStore.primary}20; color: {$colorStore.text};" onclick={() => edit(role)}>{m.common.edit()}</button>
                  <button type="button" class="min-h-[40px] px-3 rounded-lg text-sm font-medium" style="background: {$colorStore.accent}20; color: {$colorStore.accent};" onclick={() => remove(role)}>{m.common.delete()}</button>
                </div>
              </div>

              {#if results[role.id]}
                {@const r = results[role.id]}
                <div class="mt-4 pt-4 border-t" style="border-color: {$colorStore.primary}20;">
                  <div class="grid grid-cols-3 md:grid-cols-6 gap-2 mb-3">
                    <StatTile label={m.statroles.resultQualify()} value={formatNumber(r.result.qualifyingCount)} />
                    <StatTile label={r.preview ? m.statroles.resultWouldGain() : m.statroles.resultToGain()} value={formatNumber(r.result.toGrant.length)} tone="ok" />
                    <StatTile label={r.preview ? m.statroles.resultWouldLose() : m.statroles.resultToLose()} value={formatNumber(r.result.toRemove.length)} tone={r.result.toRemove.length > 0 ? "warn" : null} />
                    {#if !r.preview}
                      <StatTile label={m.statroles.resultGranted()} value={formatNumber(r.result.granted)} tone="ok" />
                      <StatTile label={m.statroles.resultRemoved()} value={formatNumber(r.result.removed)} />
                      <StatTile label={m.common.failed()} value={formatNumber(r.result.failed)} tone={r.result.failed > 0 ? "crit" : null} />
                    {/if}
                  </div>
                  <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div>
                      <h4 class="text-sm font-medium mb-2" style="color: {$colorStore.text}">{m.statroles.resultGaining()}</h4>
                      {#if r.result.toGrant.length === 0}
                        <p class="text-sm" style="color: {$colorStore.muted}">{m.statroles.resultNobody()}</p>
                      {:else}
                        <RankList rows={r.result.toGrant.slice(0, 15).map((mem, i) => ({ rank: mem.rank ?? i + 1, id: mem.userId.toString(), name: mem.username ?? mem.userId.toString(), avatarUrl: mem.avatarUrl ?? null, value: formatNumber(mem.value) }))} />
                      {/if}
                    </div>
                    <div>
                      <h4 class="text-sm font-medium mb-2" style="color: {$colorStore.text}">{m.statroles.resultLosing()}</h4>
                      {#if r.result.toRemove.length === 0}
                        <p class="text-sm" style="color: {$colorStore.muted}">{m.statroles.resultNobody()}</p>
                      {:else}
                        <RankList rows={r.result.toRemove.slice(0, 15).map((mem, i) => ({ rank: i + 1, id: mem.userId.toString(), name: mem.username ?? mem.userId.toString(), avatarUrl: mem.avatarUrl ?? null, value: formatNumber(mem.value) }))} />
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
      <SectionHeader icon="fa-pen" title={draft.id === null ? m.statroles.newRole() : m.statroles.editorEditTitle({ id: draft.id })} subtitle={m.statroles.editorSubtitle()} />

      <div class="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <Card title={m.common.condition()}>
          <div class="space-y-4">
            <SettingField label={m.statroles.fieldRole()} hint={m.statroles.fieldRoleHint()} id="sr-role" required>
              <DiscordSelector id="sr-role" type="role" options={roles} bind:selected={draft.roleId} placeholder={m.common.pickRolePlaceholder()} />
            </SettingField>
            <SettingField label={m.common.name()} hint={m.statroles.fieldNameHint()} id="sr-name">
              <input id="sr-name" type="text" maxlength="64" bind:value={draft.name} class="w-full rounded-lg p-2 min-h-[44px]" style={inputStyle} />
            </SettingField>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <SettingField label={m.statroles.fieldMeasure()} hint={m.statroles.fieldMeasureHint()} id="sr-stat">
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
              <SettingField label={m.statroles.fieldQualify()} hint={m.statroles.fieldQualifyHint()} id="sr-limit">
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
              <SettingField label={m.statroles.fieldActivity()} hint={m.statroles.fieldActivityHint()} id="sr-activity">
                <input id="sr-activity" type="text" maxlength="128" placeholder={m.statroles.phAnyGame()} bind:value={draft.activityName} class="w-full rounded-lg p-2 min-h-[44px]" style={inputStyle} />
              </SettingField>
            {/if}

            {#if draft.limitType === StatRoleLimit.Threshold}
              <div class="grid grid-cols-2 gap-4">
                <SettingField label={m.statroles.fieldMinimum()} hint={m.statroles.fieldMinimumHint()} id="sr-min">
                  <input id="sr-min" type="number" min="0" bind:value={draft.minimum} class="w-full rounded-lg p-2 min-h-[44px]" style={inputStyle} />
                </SettingField>
                <SettingField label={m.statroles.fieldMaximum()} hint={m.statroles.fieldMaximumHint()} id="sr-max">
                  <input id="sr-max" type="number" min="0" value={draft.maximum ?? ""} oninput={(e) => { const v = (e.currentTarget as HTMLInputElement).value; draft.maximum = v === "" ? null : Number(v); }} class="w-full rounded-lg p-2 min-h-[44px]" style={inputStyle} />
                </SettingField>
              </div>
            {:else if draft.limitType === StatRoleLimit.TopRank || draft.limitType === StatRoleLimit.TopPercent}
              <div class="grid grid-cols-2 gap-4">
                <SettingField label={draft.limitType === StatRoleLimit.TopRank ? m.statroles.fieldFromRank() : m.statroles.fieldFromPercentile()} hint={m.statroles.fieldFromHint()} id="sr-topstart">
                  <input id="sr-topstart" type="number" min="1" bind:value={draft.topStart} class="w-full rounded-lg p-2 min-h-[44px]" style={inputStyle} />
                </SettingField>
                <SettingField label={draft.limitType === StatRoleLimit.TopRank ? m.statroles.fieldToRank() : m.statroles.fieldToPercentile()} hint={m.statroles.fieldToHint()} id="sr-topend">
                  <input id="sr-topend" type="number" min="1" max={draft.limitType === StatRoleLimit.TopPercent ? 100 : undefined} bind:value={draft.topEnd} class="w-full rounded-lg p-2 min-h-[44px]" style={inputStyle} />
                </SettingField>
              </div>
            {:else}
              <div class="grid grid-cols-2 gap-4">
                <SettingField label={m.statroles.fieldPerday()} hint={m.statroles.fieldPerdayHint()} id="sr-perday">
                  <input id="sr-perday" type="number" min="1" bind:value={draft.minimum} class="w-full rounded-lg p-2 min-h-[44px]" style={inputStyle} />
                </SettingField>
                <SettingField label={m.statroles.fieldDays()} hint={m.statroles.fieldDaysHint()} id="sr-days">
                  <input id="sr-days" type="number" min="1" bind:value={draft.requiredDays} class="w-full rounded-lg p-2 min-h-[44px]" style={inputStyle} />
                </SettingField>
              </div>
              {#if !streakAllowed}
                <p class="text-sm" style="color: {$colorStore.accent}">{m.statroles.errorStreakUnsupported()}</p>
              {/if}
            {/if}

            {#if usesWindow}
              <SettingField label={m.statroles.fieldWindow()} hint={m.statroles.fieldWindowHint()} id="sr-lookback">
                <input id="sr-lookback" type="number" min={draft.limitType === StatRoleLimit.DailyStreak ? 1 : 0} max="90" bind:value={draft.lookbackDays} class="w-full rounded-lg p-2 min-h-[44px]" style={inputStyle} />
              </SettingField>
            {/if}

            <div class="grid grid-cols-1 md:grid-cols-3 gap-2">
              <SettingToggle id="sr-permanent" label={m.common.permanent()} hint={m.statroles.togglePermanentHint()} checked={draft.permanent} onchange={(v) => (draft.permanent = v)} />
              <SettingToggle id="sr-invert" label={m.statroles.toggleInvert()} hint={m.statroles.toggleInvertHint()} checked={draft.invert} onchange={(v) => (draft.invert = v)} />
              <SettingToggle id="sr-bots" label={m.statroles.toggleBots()} hint={m.statroles.toggleBotsHint()} checked={draft.applyToBots} onchange={(v) => (draft.applyToBots = v)} />
            </div>
          </div>
        </Card>

        <div class="space-y-6">
          <Card title={m.common.filters()} note={m.statroles.cardFiltersNote()}>
            <div class="space-y-4">
              {#if draft.statType === StatRoleStat.Messages || draft.statType === StatRoleStat.VoiceMinutes}
                <SettingField label={m.statroles.fieldChannels()} hint={m.statroles.fieldChannelsHint()} id="sr-channels">
                  <DiscordSelector id="sr-channels" type="channel" options={channels} multiple selected={draft.channelFilter} placeholder={m.common.anyChannel()} onchange={(e) => (draft.channelFilter = toList(e.selected))} />
                </SettingField>
              {/if}
              <SettingField label={m.common.requiredRoles()} hint={m.statroles.fieldWhitelistHint()} id="sr-whitelist">
                <DiscordSelector id="sr-whitelist" type="role" options={roles} multiple selected={draft.roleWhitelist} placeholder={m.statroles.phNoRequirement()} onchange={(e) => (draft.roleWhitelist = toList(e.selected))} />
              </SettingField>
              <SettingField label={m.common.excludedRoles()} hint={m.statroles.fieldBlacklistHint()} id="sr-blacklist">
                <DiscordSelector id="sr-blacklist" type="role" options={roles} multiple selected={draft.roleBlacklist} placeholder={m.common.none()} onchange={(e) => (draft.roleBlacklist = toList(e.selected))} />
              </SettingField>
              <SettingField label={m.common.ignoredMembers()} hint={m.statroles.fieldIgnoredHint()} id="sr-ignored">
                <DiscordSelector id="sr-ignored" type="custom" customIcon="fa-user" options={members} multiple selected={draft.ignoredUsers} placeholder={m.common.none()} onchange={(e) => (draft.ignoredUsers = toList(e.selected))} />
              </SettingField>
              <SettingField label={m.common.group()} hint={m.statroles.fieldGroupHint()} id="sr-group">
                <input id="sr-group" type="text" maxlength="32" placeholder={m.statroles.phGroup()} bind:value={draft.groupName} class="w-full rounded-lg p-2 min-h-[44px]" style={inputStyle} />
              </SettingField>
            </div>
          </Card>

          <Card title={m.statroles.cardSchedule()}>
            <div class="space-y-4">
              <SettingField label={m.statroles.fieldInterval()} hint={m.statroles.fieldIntervalHint()} id="sr-interval">
                <input id="sr-interval" type="number" min="10" bind:value={draft.intervalMinutes} class="w-full rounded-lg p-2 min-h-[44px]" style={inputStyle} />
              </SettingField>
              <SettingField label={m.statroles.fieldAnnounce()} hint={m.statroles.fieldAnnounceHint()} id="sr-notify-channel">
                <DiscordSelector id="sr-notify-channel" type="channel" options={textChannels} bind:selected={draft.notifyChannelId} placeholder={m.common.noAnnouncements()} />
              </SettingField>
              <SettingToggle id="sr-dm" label={m.statroles.toggleDm()} hint={m.statroles.toggleDmHint()} checked={draft.notifyDm} onchange={(v) => (draft.notifyDm = v)} />
              <SettingField label={m.common.message()} hint={m.statroles.fieldMessageHint()} id="sr-message">
                <textarea id="sr-message" rows="3" placeholder="%user% %action% %role%" bind:value={draft.notifyMessage} class="w-full rounded-lg p-2" style={inputStyle}></textarea>
              </SettingField>
            </div>
          </Card>

          <div class="flex gap-2">
            <button type="button" class="flex-1 min-h-[48px] rounded-xl font-medium" style="background: {$colorStore.primary}; color: #fff;" onclick={save} disabled={saving}>
              {saving ? m.common.saving() : draft.id === null ? m.statroles.createRole() : m.common.saveChanges()}
            </button>
            <button type="button" class="min-h-[48px] px-5 rounded-xl font-medium" style="background: {$colorStore.primary}20; color: {$colorStore.text};" onclick={() => { draft = emptyDraft(); activeTab = "roles"; }}>{m.common.cancel()}</button>
          </div>
        </div>
      </div>
    </section>
  {/if}
</DashboardPageLayout>
