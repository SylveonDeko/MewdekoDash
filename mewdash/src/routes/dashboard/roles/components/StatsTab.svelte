<script lang="ts">
  import { m } from "$lib/i18n";
  import { onMount, untrack } from "svelte";
  import { goto } from "$app/navigation";
  import {
    clientApi,
    statRolesApi,
    StatRoleLimit,
    type StatRole,
    type StatRoleRunResult
  } from "$lib/api/index.ts";
  import { currentGuild } from "$lib/stores/currentGuild.ts";
  import { currentInstance } from "$lib/stores/instanceStore.ts";
  import { colorStore } from "$lib/stores/colorStore";
  import { logger } from "$lib/logger.ts";
  import { requestConfirmation } from "$lib/stores/confirmationStore";
  import Notification from "$lib/components/ui/Notification.svelte";
  import PluginCard from "$lib/components/plugin/PluginCard.svelte";
  import Pill from "$lib/components/analytics/Pill.svelte";
  import StatTile from "$lib/components/analytics/StatTile.svelte";
  import AsyncState from "$lib/components/stats/AsyncState.svelte";
  import RankList from "$lib/components/stats/RankList.svelte";
  import { formatAgo, formatNumber } from "$lib/components/stats/format";
  import RowActions from "../../xp/components/RowActions.svelte";
  import RuleSheet from "./stats/RuleSheet.svelte";
  import { draftFrom, emptyDraft, toRequest, usesWindow, type Draft, type Option } from "./stats/statModel";

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

  let members = $state<Option[]>([]);
  let roles = $state<Option[]>([]);
  let channels = $state<Option[]>([]);
  let textChannels = $state<Option[]>([]);

  async function loadGuildLists() {
    if (!$currentGuild?.id) return;
    const guildId = $currentGuild.id;
    const [memberList, roleList, channelList, textList] = await Promise.all([
      clientApi.getMembers(guildId).catch(() => []),
      clientApi.getRoles(guildId).catch(() => []),
      clientApi.getChannels(guildId).catch(() => []),
      clientApi.getTextChannels(guildId).catch(() => [])
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
      confirmText: m.common.delete()
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
      variant: "warning"
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

  let draft = $state<Draft>(emptyDraft());
  let sheetOpen = $state(false);
  let saving = $state(false);

  function edit(role: StatRole) {
    draft = draftFrom(role);
    sheetOpen = true;
  }

  function startNew() {
    draft = emptyDraft();
    sheetOpen = true;
  }

  function closeSheet() {
    sheetOpen = false;
    draft = emptyDraft();
  }

  async function save() {
    if (!$currentGuild?.id) return;
    if (!draft.roleId) {
      notify(m.statroles.errorPickRole(), "error");
      return;
    }
    if (draft.limitType === StatRoleLimit.DailyStreak && !usesWindow(draft.statType)) {
      notify(m.statroles.errorStreakUnsupported(), "error");
      return;
    }
    saving = true;
    try {
      const request = toRequest(draft);
      if (draft.id === null) {
        await statRolesApi.create($currentGuild.id, request);
      } else {
        await statRolesApi.update($currentGuild.id, draft.id, request);
      }
      await loadRoles();
      closeSheet();
    } catch (err) {
      fail(err, m.statroles.saveFailed());
    } finally {
      saving = false;
    }
  }

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

  function actionsFor(role: StatRole) {
    return [
      { label: m.common.preview(), icon: "fa-eye", run: () => preview(role) },
      { label: m.statroles.runNow(), icon: "fa-play", run: () => run(role) },
      {
        label: role.enabled ? m.common.disable() : m.common.enable(),
        icon: role.enabled ? "fa-pause" : "fa-circle",
        run: () => toggleEnabled(role)
      },
      { label: m.common.edit(), icon: "fa-pen", run: () => edit(role) },
      { label: m.common.delete(), icon: "fa-trash", run: () => remove(role) }
    ];
  }
</script>

<div class="space-y-6 min-w-0">
  {#if notificationMessage}
    <div class="fixed top-4 right-4 z-50">
      <Notification message={notificationMessage} type={notificationType} onDismiss={() => (notificationMessage = "")} />
    </div>
  {/if}

  <PluginCard title={m.features.statrolesName()} alwaysOpen>
    {#snippet actions()}
      <button
        type="button"
        class="flex items-center justify-center gap-2 px-5 rounded-xl min-h-[50px] font-medium"
        style="background: {$colorStore.primary}20; color: {$colorStore.text}; border: 1px solid {$colorStore.primary}30;"
        onclick={startNew}
      >
        <i class="fa-solid fa-plus" aria-hidden="true"></i>{m.statroles.newRole()}
      </button>
    {/snippet}

    <AsyncState
      loading={listLoading}
      error={listError}
      empty={statRoles.length === 0}
      emptyMessage={m.statroles.listEmpty()}
      emptyIcon="fa-trophy"
    >
      <div class="space-y-3">
        {#each statRoles as role (role.id)}
          <div class="rounded-xl p-3 min-w-0" style="background: {$colorStore.primary}08;">
            <div class="relative flex items-start justify-between gap-3">
              <div class="min-w-0">
                <div class="flex flex-wrap items-center gap-2 mb-1">
                  <h3 class="font-semibold truncate" style="color: {$colorStore.text}">#{role.id} {role.name}</h3>
                  <Pill tone={role.enabled ? "ok" : "muted"} text={role.enabled ? m.statroles.pillEnabled() : m.common.disabledLower()} />
                  {#if role.permanent}<Pill tone="warn" text={m.common.permanentLower()} />{/if}
                  {#if role.invert}<Pill tone="crit" text={m.statroles.pillInverted()} />{/if}
                  {#if role.groupName}<Pill tone="muted" text={m.statroles.pillGroup({ name: role.groupName })} />{/if}
                </div>
                <p class="text-sm break-words" style="color: {$colorStore.text}">
                  <span style="color: {$colorStore.secondary}">@{roleName(role.roleId)}</span> · {role.condition}
                </p>
                <p class="text-xs mt-1" style="color: {$colorStore.muted}">
                  {m.statroles.scheduleSummary({ minutes: role.intervalMinutes, lastRun: formatAgo(role.lastRunAt) })}
                  {#if role.notifyChannelId}
                    · {m.statroles.announcesIn({ channel: textChannels.find((c) => c.id === role.notifyChannelId?.toString())?.name ?? m.common.channel().toLowerCase() })}
                  {/if}
                  {#if role.notifyDm} · {m.statroles.dmsMembers()}{/if}
                </p>
              </div>
              <div class:opacity-50={busyId === role.id} class:pointer-events-none={busyId === role.id}>
                <RowActions name={role.name} actions={actionsFor(role)} moreLabel={m.xp.moreActions()} />
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
                  <div class="min-w-0">
                    <h4 class="text-sm font-medium mb-2" style="color: {$colorStore.text}">{m.statroles.resultGaining()}</h4>
                    {#if r.result.toGrant.length === 0}
                      <p class="text-sm" style="color: {$colorStore.muted}">{m.statroles.resultNobody()}</p>
                    {:else}
                      <RankList rows={r.result.toGrant.slice(0, 15).map((mem, i) => ({ rank: mem.rank ?? i + 1, id: mem.userId.toString(), name: mem.username ?? mem.userId.toString(), avatarUrl: mem.avatarUrl ?? null, value: formatNumber(mem.value) }))} />
                    {/if}
                  </div>
                  <div class="min-w-0">
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
          </div>
        {/each}
      </div>
    </AsyncState>
  </PluginCard>
</div>

{#if sheetOpen}
  <RuleSheet bind:draft {roles} {members} {channels} {textChannels} {saving} onsave={save} onclose={closeSheet} />
{/if}
