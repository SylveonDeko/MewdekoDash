<!-- routes/dashboard/channel-access/+page.svelte -->
<script lang="ts">
  import { m } from "$lib/i18n";
  import { onMount } from "svelte";
  import { fade, fly } from "svelte/transition";
  import { colorStore } from "$lib/stores/colorStore";
  import { currentGuild } from "$lib/stores/currentGuild";
  import {
    AccessApplicationStatus,
    AccessExpiryBehavior,
    AccessGrantMode,
    type ChannelAccessApplication,
    type ChannelAccessBlacklistEntry,
    type ChannelAccessGate,
    channelAccessApi,
    clientApi
  } from "$lib/api/index.ts";
  import { logger } from "$lib/logger";
  import { userStore } from "$lib/stores/userStore";

  import StatCard from "$lib/components/monitoring/StatCard.svelte";
  import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";
  import DashboardPageLayout from "$lib/components/layout/DashboardPageLayout.svelte";
  import ConfirmationModal from "$lib/components/ui/ConfirmationModal.svelte";

  let loading = $state(false);
  let saving = $state(false);
  let message = $state("");
  let messageType: "success" | "error" | "info" = $state("info");

  let gates: ChannelAccessGate[] = $state([]);
  let applications: ChannelAccessApplication[] = $state([]);
  let blacklist: ChannelAccessBlacklistEntry[] = $state([]);
  let guildChannels: Array<{ id: string; name: string }> = $state([]);
  let guildRoles: Array<{ id: string; name: string; color: number }> = $state([]);
  let guildMembers: Array<{ id: string; name: string }> = $state([]);

  let activeTab = $state("gates");
  let expandedGate: number | null = $state(null);
  let expandedApplication: number | null = $state(null);

  let newGate = $state({
    channelId: null as bigint | null,
    accessRoleId: null as bigint | null,
    grantMode: AccessGrantMode.Role as AccessGrantMode
  });

  let newQuestion = $state({
    question: "",
    placeholder: "",
    required: true,
    paragraph: true
  });

  let panelTarget: Record<number, string | null> = $state({});
  let gatePendingDeletion: ChannelAccessGate | null = $state(null);
  let resolveReason: Record<number, string> = $state({});

  let newBlacklist = $state({
    userId: null as string | null,
    configId: null as string | null,
    reason: ""
  });

  let applicationFilter = $state({
    configId: "all",
    status: String(AccessApplicationStatus.Pending)
  });

  const statusLabels: Record<number, string> = $derived({
    [AccessApplicationStatus.Pending]: m.common.pending(),
    [AccessApplicationStatus.Approved]: m.common.approved(),
    [AccessApplicationStatus.Denied]: m.common.denied(),
    [AccessApplicationStatus.Withdrawn]: m.channelAccess.statusWithdrawn(),
    [AccessApplicationStatus.Expired]: m.common.expired()
  });

  const expiryLabels: Record<number, string> = $derived({
    [AccessExpiryBehavior.Deny]: m.channelAccess.expiryDeny(),
    [AccessExpiryBehavior.Majority]: m.channelAccess.expiryMajority(),
    [AccessExpiryBehavior.StayOpen]: m.channelAccess.expiryStayOpen()
  });

  let pendingCount = $derived(gates.reduce((total, gate) => total + gate.pendingApplications, 0));

  const grantModeOptions = $derived([
    { id: String(AccessGrantMode.Role), name: m.channelAccess.grantRole() },
    { id: String(AccessGrantMode.ChannelPermission), name: m.channelAccess.grantChannel() }
  ]);

  let expiryOptions = $derived(
    Object.entries(expiryLabels).map(([value, label]) => ({ id: value, name: label }))
  );

  let gateOptions = $derived(
    gates.map((gate) => ({ id: String(gate.id), name: `#${channelName(gate.channelId)}` }))
  );

  let gateFilterOptions = $derived([{ id: "all", name: m.channelAccess.filterAllGates() }, ...gateOptions]);

  let blacklistScopeOptions = $derived([{ id: "all", name: m.channelAccess.filterEveryGate() }, ...gateOptions]);

  let statusFilterOptions = $derived([
    { id: "all", name: m.common.anyStatus() },
    ...Object.entries(statusLabels).map(([value, label]) => ({ id: value, name: label }))
  ]);

  async function loadAll() {
    if (!$currentGuild?.id) return;

    loading = true;
    try {
      const [gateData, blacklistData, channelData, roleData, memberData] = await Promise.all([
        channelAccessApi.getGates($currentGuild.id).catch(() => []),
        channelAccessApi.getBlacklist($currentGuild.id).catch(() => []),
        clientApi.getTextChannels($currentGuild.id).catch(() => []),
        clientApi.getRoles($currentGuild.id).catch(() => []),
        clientApi.getMembers($currentGuild.id).catch(() => [])
      ]);

      gates = gateData;
      blacklist = blacklistData;

      guildChannels = (channelData || []).map((channel: any) => ({
        id: channel.id.toString(),
        name: channel.name
      }));

      guildRoles = (roleData || [])
        .filter((role: any) => role.id !== $currentGuild?.id?.toString() && !role.managed && !role.name.startsWith("@"))
        .map((role: any) => ({ id: role.id.toString(), name: role.name, color: role.color || 0 }))
        .sort((a: any, b: any) => a.name.localeCompare(b.name));

      guildMembers = (memberData || []).map((member: any) => ({
        id: member.id.toString(),
        name: member.username ?? member.id.toString()
      }));

      await loadApplications();
    } catch (err) {
      logger.error("Failed to load channel access data:", err);
      showMessage(m.channelAccess.errorLoad(), "error");
    } finally {
      loading = false;
    }
  }

  async function loadApplications() {
    if (!$currentGuild?.id) return;

    try {
      applications = await channelAccessApi.getApplications($currentGuild.id, {
        configId: applicationFilter.configId === "all" ? undefined : Number(applicationFilter.configId),
        status: applicationFilter.status === "all" ? undefined : (Number(applicationFilter.status) as AccessApplicationStatus)
      });
    } catch (err) {
      logger.error("Failed to load applications:", err);
      showMessage(m.channelAccess.errorLoadApplications(), "error");
    }
  }

  async function createGate() {
    if (!$currentGuild?.id || !newGate.channelId) {
      showMessage(m.common.pickChannelFirstPlaceholder(), "error");
      return;
    }

    if (newGate.grantMode === AccessGrantMode.Role && !newGate.accessRoleId) {
      showMessage(m.channelAccess.errorPickRole(), "error");
      return;
    }

    saving = true;
    try {
      await channelAccessApi.createGate($currentGuild.id, {
        channelId: newGate.channelId,
        accessRoleId: newGate.grantMode === AccessGrantMode.Role ? newGate.accessRoleId : null,
        userId: BigInt($userStore?.id ?? 0)
      });
      newGate = { channelId: null, accessRoleId: null, grantMode: AccessGrantMode.Role };
      await loadAll();
    } catch (err) {
      logger.error("Failed to create gate:", err);
      showMessage(err instanceof Error ? err.message : m.channelAccess.errorCreateGate(), "error");
    } finally {
      saving = false;
    }
  }

  async function updateGate(gate: ChannelAccessGate, changes: Record<string, unknown>) {
    if (!$currentGuild?.id) return;

    saving = true;
    try {
      const updated = await channelAccessApi.updateGate($currentGuild.id, gate.id, changes);
      gates = gates.map((existing) => (existing.id === updated.id ? updated : existing));
      showMessage(m.channelAccess.notifyGateSaved(), "success");
    } catch (err) {
      logger.error("Failed to update gate:", err);
      showMessage(m.channelAccess.errorSaveGate(), "error");
    } finally {
      saving = false;
    }
  }

  async function deleteGate() {
    const gate = gatePendingDeletion;
    if (!$currentGuild?.id || !gate) return;

    gatePendingDeletion = null;
    saving = true;
    try {
      await channelAccessApi.deleteGate($currentGuild.id, gate.id);
      await loadAll();
    } catch (err) {
      logger.error("Failed to delete gate:", err);
      showMessage(m.channelAccess.errorDeleteGate(), "error");
    } finally {
      saving = false;
    }
  }

  async function addQuestion(gate: ChannelAccessGate) {
    if (!$currentGuild?.id || !newQuestion.question.trim()) return;

    saving = true;
    try {
      const questions = await channelAccessApi.addQuestion($currentGuild.id, gate.id, {
        question: newQuestion.question.trim(),
        placeholder: newQuestion.placeholder.trim() || null,
        required: newQuestion.required,
        paragraph: newQuestion.paragraph
      });
      gates = gates.map((existing) => (existing.id === gate.id ? { ...existing, questions } : existing));
      newQuestion = { question: "", placeholder: "", required: true, paragraph: true };
    } catch (err) {
      logger.error("Failed to add question:", err);
      showMessage(err instanceof Error ? err.message : m.channelAccess.errorAddQuestion(), "error");
    } finally {
      saving = false;
    }
  }

  async function removeQuestion(gate: ChannelAccessGate, position: number) {
    if (!$currentGuild?.id) return;

    saving = true;
    try {
      const questions = await channelAccessApi.removeQuestion($currentGuild.id, gate.id, position);
      gates = gates.map((existing) => (existing.id === gate.id ? { ...existing, questions } : existing));
    } catch (err) {
      logger.error("Failed to remove question:", err);
      showMessage(m.channelAccess.errorRemoveQuestion(), "error");
    } finally {
      saving = false;
    }
  }

  async function postPanel(gate: ChannelAccessGate) {
    if (!$currentGuild?.id) return;

    const target = panelTarget[gate.id];
    if (!target) {
      showMessage(m.channelAccess.errorPickPanelChannel(), "error");
      return;
    }

    saving = true;
    try {
      await channelAccessApi.postPanel($currentGuild.id, gate.id, BigInt(target));
      showMessage(m.channelAccess.notifyPanelPosted(), "success");
      await loadAll();
    } catch (err) {
      logger.error("Failed to post panel:", err);
      showMessage(m.channelAccess.errorPostPanel(), "error");
    } finally {
      saving = false;
    }
  }

  async function resolveApplication(application: ChannelAccessApplication, approve: boolean) {
    if (!$currentGuild?.id) return;

    saving = true;
    try {
      await channelAccessApi.resolveApplication($currentGuild.id, application.id, {
        status: approve ? AccessApplicationStatus.Approved : AccessApplicationStatus.Denied,
        userId: BigInt($userStore?.id ?? 0),
        reason: resolveReason[application.id]?.trim() || null
      });
      delete resolveReason[application.id];
      showMessage(
        (approve ? m.channelAccess.notifyApplicationApproved : m.channelAccess.notifyApplicationDenied)({ id: application.id }),
        "success"
      );
      await loadAll();
    } catch (err) {
      logger.error("Failed to resolve application:", err);
      showMessage(m.channelAccess.errorCloseApplication(), "error");
    } finally {
      saving = false;
    }
  }

  async function addBlacklist() {
    if (!$currentGuild?.id || !newBlacklist.userId) {
      showMessage(m.channelAccess.errorPickUser(), "error");
      return;
    }

    saving = true;
    try {
      await channelAccessApi.addBlacklist($currentGuild.id, {
        userId: BigInt(newBlacklist.userId),
        configId: newBlacklist.configId && newBlacklist.configId !== "all" ? Number(newBlacklist.configId) : null,
        addedBy: BigInt($userStore?.id ?? 0),
        reason: newBlacklist.reason.trim() || null
      });
      newBlacklist = { userId: null, configId: null, reason: "" };
      await loadAll();
    } catch (err) {
      logger.error("Failed to blacklist user:", err);
      showMessage(m.channelAccess.errorBlockUser(), "error");
    } finally {
      saving = false;
    }
  }

  async function removeBlacklist(entry: ChannelAccessBlacklistEntry) {
    if (!$currentGuild?.id) return;

    saving = true;
    try {
      await channelAccessApi.removeBlacklist($currentGuild.id, entry.userId, entry.configId);
      await loadAll();
    } catch (err) {
      logger.error("Failed to remove blacklist entry:", err);
      showMessage(m.channelAccess.errorUnblockUser(), "error");
    } finally {
      saving = false;
    }
  }

  function showMessage(text: string, type: "success" | "error" | "info") {
    message = text;
    messageType = type;
    setTimeout(() => {
      message = "";
    }, 5000);
  }

  function channelName(id: bigint | null): string {
    if (id === null) return m.common.none();
    return guildChannels.find((channel) => channel.id === id.toString())?.name ?? id.toString();
  }

  function roleName(id: bigint | null): string {
    if (id === null) return m.common.none();
    return guildRoles.find((role) => role.id === id.toString())?.name ?? id.toString();
  }

  function grantSummary(gate: ChannelAccessGate): string {
    return gate.grantMode === AccessGrantMode.Role
      ? m.common.grantsRole({ role: roleName(gate.accessRoleId) })
      : m.channelAccess.grantSummaryChannel();
  }

  function gateName(configId: number | null): string {
    if (configId === null) return m.channelAccess.filterEveryGate();
    const gate = gates.find((existing) => existing.id === configId);
    return gate ? `#${channelName(gate.channelId)}` : m.channelAccess.deletedGate();
  }

  function formatDate(value: string | null): string {
    if (!value) return m.common.unknown();
    return new Date(value).toLocaleString();
  }

  function statusColor(status: AccessApplicationStatus): string {
    if (status === AccessApplicationStatus.Approved) return "#10b981";
    if (status === AccessApplicationStatus.Denied) return "#ef4444";
    if (status === AccessApplicationStatus.Pending) return $colorStore.primary;
    return "#6b7280";
  }

  onMount(() => {
    loadAll();
  });

  const tabs = $derived([
    { id: "gates", label: m.channelAccess.tabGates(), icon: "fa-lock" },
    { id: "applications", label: m.common.applications(), icon: "fa-inbox" },
    { id: "blacklist", label: m.channelAccess.tabBlocked(), icon: "fa-ban" }
  ]);

  let actionButtons = $derived([
    {
      label: m.common.refresh(),
      icon: "fa-arrows-rotate",
      action: loadAll,
      loading: loading
    }
  ]);
</script>

{#snippet toggle(checked: boolean, onCheck: (value: boolean) => void)}
  <label class="relative inline-flex items-center w-11 h-6 shrink-0 cursor-pointer">
    <input
      type="checkbox"
      class="sr-only peer"
      {checked}
      onchange={(e) => onCheck((e.currentTarget as HTMLInputElement).checked)}
    />
    <span
      class="absolute inset-0 rounded-full transition-colors after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:w-5 after:h-5 after:rounded-full after:bg-white after:transition-transform {checked ? 'after:translate-x-5' : ''}"
      style="background: {checked ? $colorStore.primary : '#4b5563'}"
    ></span>
  </label>
{/snippet}

{#snippet statusMessageContent()}
  {#if message}
    <div class="mb-6 p-4 rounded-xl flex items-center gap-3 transition-all"
         style="background: {messageType === 'success' ? '#10b98120' : messageType === 'error' ? '#ef444420' : $colorStore.primary + '20'};
                border: 1px solid {messageType === 'success' ? '#10b981' : messageType === 'error' ? '#ef4444' : $colorStore.primary}30;"
         in:fly={{ x: 20, duration: 300 }}>
      <span style="color: {messageType === 'success' ? '#10b981' : messageType === 'error' ? '#ef4444' : $colorStore.primary}">{message}</span>
    </div>
  {/if}
{/snippet}

<DashboardPageLayout
  {actionButtons}
  bind:activeTab
  guildName={$currentGuild?.name || m.common.dashboard()}
  icon="fa-lock"
  statusMessages={statusMessageContent}
  subtitle={m.channelAccess.pageSubtitle()}
  {tabs}
  title={m.features.channelAccessName()}
>
  {#if activeTab === 'gates'}
    <div class="w-full space-y-6" in:fade={{ duration: 200 }}>
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label={m.channelAccess.tabGates()} value={gates.length} icon="fa-lock" />
        <StatCard label={m.channelAccess.statOpenApplications()} value={pendingCount} icon="fa-inbox" />
        <StatCard label={m.channelAccess.statBlockedUsers()} value={blacklist.length} icon="fa-shield-slash" />
      </div>

      <!-- Create a gate -->
      <div class="rounded-2xl border p-6 shadow-2xl"
           style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15, {$colorStore.gradientEnd}10);
                  border-color: {$colorStore.primary}30;">
        <h2 class="text-xl font-bold mb-4" style="color: {$colorStore.text}">{m.channelAccess.createTitle()}</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div>
            <span class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">{m.channelAccess.createLockedChannel()}</span>
            <div class="min-h-[44px]">
              <DiscordSelector
                type="channel"
                options={guildChannels}
                selected={newGate.channelId?.toString() || null}
                placeholder={m.common.selectAChannelPlaceholder()}
                onchange={(detail) => {
                  newGate.channelId = detail.selected && typeof detail.selected === 'string' ? BigInt(detail.selected) : null;
                }}
              />
            </div>
          </div>
          <div>
            <span class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">{m.channelAccess.createHowIn()}</span>
            <div class="min-h-[44px]">
              <DiscordSelector
                type="custom"
                options={grantModeOptions}
                customIcon="fa-key"
                selected={String(newGate.grantMode)}
                searchable={false}
                placeholder={m.channelAccess.createPickGrant()}
                onchange={(detail) => {
                  if (typeof detail.selected !== 'string') return;
                  newGate.grantMode = Number(detail.selected) as AccessGrantMode;
                  if (newGate.grantMode === AccessGrantMode.ChannelPermission) newGate.accessRoleId = null;
                }}
              />
            </div>
          </div>
          {#if newGate.grantMode === AccessGrantMode.Role}
            <div>
              <span class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">{m.channelAccess.createRoleOnApproval()}</span>
              <div class="min-h-[44px]">
                <DiscordSelector
                  type="role"
                  options={guildRoles}
                  selected={newGate.accessRoleId?.toString() || null}
                  placeholder={m.common.selectARolePlaceholder()}
                  onchange={(detail) => {
                    newGate.accessRoleId = detail.selected && typeof detail.selected === 'string' ? BigInt(detail.selected) : null;
                  }}
                />
              </div>
            </div>
          {/if}
          <button
            class="min-h-[44px] px-4 rounded-xl font-medium transition-all disabled:opacity-50"
            style="background: {$colorStore.primary}20; color: {$colorStore.text}; border: 1px solid {$colorStore.primary}40;"
            disabled={saving}
            onclick={createGate}
          >
            {m.channelAccess.createButton()}
          </button>
        </div>
      </div>

      <!-- Existing gates -->
      {#if gates.length === 0}
        <div class="rounded-2xl border p-8 text-center"
             style="border-color: {$colorStore.primary}30; color: {$colorStore.muted};">
          {m.channelAccess.gatesEmpty()}
        </div>
      {:else}
        {#each gates as gate (gate.id)}
          <div class="rounded-2xl border p-6 shadow-2xl"
               style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15, {$colorStore.gradientEnd}10);
                      border-color: {$colorStore.primary}30;">
            <div class="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 class="text-lg font-bold" style="color: {$colorStore.text}">#{channelName(gate.channelId)}</h3>
                <p class="text-sm" style="color: {$colorStore.muted}">
                  {m.channelAccess.gateSummary({
                    grant: grantSummary(gate),
                    approvals: gate.requiredApprovals,
                    denials: gate.requiredDenials,
                    window: gate.voteDurationHours > 0 ? m.channelAccess.gateWindowHours({ hours: gate.voteDurationHours }) : m.channelAccess.gateNoTimeLimit(),
                    open: gate.pendingApplications
                  })}
                </p>
              </div>
              <div class="flex items-center gap-2">
                <div class="flex items-center gap-3 min-h-[44px]">
                  <span class="text-sm" style="color: {$colorStore.text}">
                    {gate.enabled ? m.channelAccess.gateAccepting() : m.common.closed()}
                  </span>
                  {@render toggle(gate.enabled, (value) => updateGate(gate, { enabled: value }))}
                </div>
                <button
                  class="min-h-[44px] px-4 rounded-xl font-medium transition-all"
                  style="background: {$colorStore.primary}20; color: {$colorStore.text}; border: 1px solid {$colorStore.primary}40;"
                  onclick={() => (expandedGate = expandedGate === gate.id ? null : gate.id)}
                >
                  {expandedGate === gate.id ? m.channelAccess.gateHideSettings() : m.common.settings()}
                </button>
                <button
                  class="min-h-[44px] px-4 rounded-xl font-medium transition-all"
                  style="background: #ef444420; color: #ef4444; border: 1px solid #ef444440;"
                  disabled={saving}
                  onclick={() => (gatePendingDeletion = gate)}
                >
                  {m.common.delete()}
                </button>
              </div>
            </div>

            {#if expandedGate === gate.id}
              <div class="mt-6 space-y-6" in:fade={{ duration: 150 }}>
                <!-- Channels and roles -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">{m.channelAccess.createHowIn()}</span>
                    <div class="min-h-[44px]">
                      <DiscordSelector
                        type="custom"
                        options={grantModeOptions}
                        customIcon="fa-key"
                        selected={String(gate.grantMode)}
                        searchable={false}
                        placeholder={m.channelAccess.createPickGrant()}
                        onchange={(detail) => {
                          if (detail.selected === String(AccessGrantMode.ChannelPermission)) updateGate(gate, { accessRoleId: BigInt(0) });
                        }}
                      />
                    </div>
                  </div>
                  <div>
                    <span class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">{m.channelAccess.gateAccessRole()}</span>
                    <div class="min-h-[44px]">
                      <DiscordSelector
                        type="role"
                        options={guildRoles}
                        selected={gate.accessRoleId?.toString() || null}
                        placeholder={m.channelAccess.gateAccessRolePlaceholder()}
                        onchange={(detail) => updateGate(gate, { accessRoleId: detail.selected ? BigInt(detail.selected as string) : BigInt(0) })}
                      />
                    </div>
                  </div>
                  <div>
                    <span class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">{m.channelAccess.gateReviewChannel()}</span>
                    <DiscordSelector
                      type="channel"
                      options={guildChannels}
                      selected={gate.reviewChannelId?.toString() || null}
                      placeholder={m.channelAccess.gateReviewChannelPlaceholder()}
                      onchange={(detail) => updateGate(gate, { reviewChannelId: detail.selected ? BigInt(detail.selected as string) : BigInt(0) })}
                    />
                  </div>
                  <div>
                    <span class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">{m.common.logChannel()}</span>
                    <DiscordSelector
                      type="channel"
                      options={guildChannels}
                      selected={gate.logChannelId?.toString() || null}
                      placeholder={m.channelAccess.gateLogChannelPlaceholder()}
                      onchange={(detail) => updateGate(gate, { logChannelId: detail.selected ? BigInt(detail.selected as string) : BigInt(0) })}
                    />
                  </div>
                  <div>
                    <span class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">{m.channelAccess.gateVoterRole()}</span>
                    <DiscordSelector
                      type="role"
                      options={guildRoles}
                      selected={gate.voterRoleId?.toString() || null}
                      placeholder={m.channelAccess.gateVoterRolePlaceholder()}
                      onchange={(detail) => updateGate(gate, { voterRoleId: detail.selected ? BigInt(detail.selected as string) : BigInt(0) })}
                    />
                  </div>
                  <div>
                    <span class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">{m.channelAccess.gatePingRole()}</span>
                    <DiscordSelector
                      type="role"
                      options={guildRoles}
                      selected={gate.pingRoleId?.toString() || null}
                      placeholder={m.channelAccess.gatePingPlaceholder()}
                      onchange={(detail) => updateGate(gate, { pingRoleId: detail.selected ? BigInt(detail.selected as string) : BigInt(0) })}
                    />
                  </div>
                </div>

                <!-- Numbers -->
                <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <label class="block">
                    <span class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">{m.channelAccess.gateApprovalsNeeded()}</span>
                    <input class="w-full min-h-[44px] px-3 rounded-xl"
                           style="background: {$colorStore.primary}10; color: {$colorStore.text}; border: 1px solid {$colorStore.primary}30;"
                           type="number" min="0" value={gate.requiredApprovals}
                           onchange={(e) => updateGate(gate, { requiredApprovals: Number(e.currentTarget.value) })} />
                  </label>
                  <label class="block">
                    <span class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">{m.channelAccess.gateDenialsNeeded()}</span>
                    <input class="w-full min-h-[44px] px-3 rounded-xl"
                           style="background: {$colorStore.primary}10; color: {$colorStore.text}; border: 1px solid {$colorStore.primary}30;"
                           type="number" min="0" value={gate.requiredDenials}
                           onchange={(e) => updateGate(gate, { requiredDenials: Number(e.currentTarget.value) })} />
                  </label>
                  <label class="block">
                    <span class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">{m.channelAccess.gateVotingWindow()}</span>
                    <input class="w-full min-h-[44px] px-3 rounded-xl"
                           style="background: {$colorStore.primary}10; color: {$colorStore.text}; border: 1px solid {$colorStore.primary}30;"
                           type="number" min="0" value={gate.voteDurationHours}
                           onchange={(e) => updateGate(gate, { voteDurationHours: Number(e.currentTarget.value) })} />
                  </label>
                  <label class="block">
                    <span class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">{m.common.minAccountAgeDays()}</span>
                    <input class="w-full min-h-[44px] px-3 rounded-xl"
                           style="background: {$colorStore.primary}10; color: {$colorStore.text}; border: 1px solid {$colorStore.primary}30;"
                           type="number" min="0" value={gate.minAccountAgeDays}
                           onchange={(e) => updateGate(gate, { minAccountAgeDays: Number(e.currentTarget.value) })} />
                  </label>
                  <label class="block">
                    <span class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">{m.channelAccess.gateMinServerAge()}</span>
                    <input class="w-full min-h-[44px] px-3 rounded-xl"
                           style="background: {$colorStore.primary}10; color: {$colorStore.text}; border: 1px solid {$colorStore.primary}30;"
                           type="number" min="0" value={gate.minServerAgeDays}
                           onchange={(e) => updateGate(gate, { minServerAgeDays: Number(e.currentTarget.value) })} />
                  </label>
                  <label class="block">
                    <span class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">{m.channelAccess.gateReapplyCooldown()}</span>
                    <input class="w-full min-h-[44px] px-3 rounded-xl"
                           style="background: {$colorStore.primary}10; color: {$colorStore.text}; border: 1px solid {$colorStore.primary}30;"
                           type="number" min="0" value={gate.reapplyCooldownHours}
                           onchange={(e) => updateGate(gate, { reapplyCooldownHours: Number(e.currentTarget.value) })} />
                  </label>
                </div>

                <!-- Behaviour -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">{m.channelAccess.gateWhenCloses()}</span>
                    <div class="min-h-[44px]">
                      <DiscordSelector
                        type="custom"
                        options={expiryOptions}
                        customIcon="fa-hourglass"
                        selected={String(gate.onExpiry)}
                        searchable={false}
                        placeholder={m.channelAccess.gatePickOutcome()}
                        onchange={(detail) => { if (typeof detail.selected === 'string') updateGate(gate, { onExpiry: Number(detail.selected) }); }}
                      />
                    </div>
                  </div>

                  <div class="flex flex-col gap-2 justify-end">
                    {#each [
                      { key: 'allowAbstain', label: m.channelAccess.gateAbstain(), value: gate.allowAbstain },
                      { key: 'anonymousApplicant', label: m.channelAccess.gateAnonymousApplicant(), value: gate.anonymousApplicant },
                      { key: 'anonymousVotes', label: m.channelAccess.gateAnonymousVotes(), value: gate.anonymousVotes },
                      { key: 'dmOnDecision', label: m.channelAccess.gateDmDecision(), value: gate.dmOnDecision }
                    ] as setting (setting.key)}
                      <div class="flex items-center justify-between gap-3 min-h-[44px] p-3 rounded-xl"
                           style="background: {$colorStore.primary}08;">
                        <span class="text-sm" style="color: {$colorStore.text}">{setting.label}</span>
                        {@render toggle(setting.value, (value) => updateGate(gate, { [setting.key]: value }))}
                      </div>
                    {/each}
                  </div>
                </div>

                <!-- Questions -->
                <div class="rounded-xl border p-4" style="border-color: {$colorStore.primary}30;">
                  <h4 class="font-bold mb-3" style="color: {$colorStore.text}">{m.channelAccess.questionsTitle()}</h4>
                  {#if gate.questions.length === 0}
                    <p class="text-sm mb-3" style="color: {$colorStore.muted}">
                      {m.channelAccess.questionsEmpty()}
                    </p>
                  {:else}
                    <ul class="space-y-2 mb-3">
                      {#each gate.questions as question, index (question.id)}
                        <li class="flex items-center justify-between gap-3 p-2 rounded-lg"
                            style="background: {$colorStore.primary}10;">
                          <span style="color: {$colorStore.text}">
                            {index + 1}. {question.question}
                            {#if !question.required}<em style="color: {$colorStore.muted}"> {m.common.optionalSuffix()}</em>{/if}
                          </span>
                          <button class="min-h-[44px] px-3 rounded-lg"
                                  style="color: #ef4444;"
                                  disabled={saving}
                                  onclick={() => removeQuestion(gate, index + 1)}>{m.common.remove()}</button>
                        </li>
                      {/each}
                    </ul>
                  {/if}

                  {#if gate.questions.length < 5}
                    <div class="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
                      <input class="min-h-[44px] px-3 rounded-xl md:col-span-2"
                             style="background: {$colorStore.primary}10; color: {$colorStore.text}; border: 1px solid {$colorStore.primary}30;"
                             maxlength="45" placeholder={m.channelAccess.questionPlaceholder()}
                             bind:value={newQuestion.question} />
                      <input class="min-h-[44px] px-3 rounded-xl"
                             style="background: {$colorStore.primary}10; color: {$colorStore.text}; border: 1px solid {$colorStore.primary}30;"
                             placeholder={m.channelAccess.questionHintPlaceholder()}
                             bind:value={newQuestion.placeholder} />
                      <button class="min-h-[44px] px-4 rounded-xl font-medium"
                              style="background: {$colorStore.primary}20; color: {$colorStore.text}; border: 1px solid {$colorStore.primary}40;"
                              disabled={saving || !newQuestion.question.trim()}
                              onclick={() => addQuestion(gate)}>{m.common.addQuestion()}</button>
                    </div>
                    <div class="flex flex-wrap gap-6 mt-3">
                      <div class="flex items-center gap-3 min-h-[44px]">
                        <span class="text-sm" style="color: {$colorStore.text}">{m.common.required()}</span>
                        {@render toggle(newQuestion.required, (value) => (newQuestion.required = value))}
                      </div>
                      <div class="flex items-center gap-3 min-h-[44px]">
                        <span class="text-sm" style="color: {$colorStore.text}">{m.channelAccess.questionMultiline()}</span>
                        {@render toggle(newQuestion.paragraph, (value) => (newQuestion.paragraph = value))}
                      </div>
                    </div>
                  {:else}
                    <p class="text-sm" style="color: {$colorStore.muted}">
                      {m.channelAccess.questionsMax()}
                    </p>
                  {/if}
                </div>

                <!-- Panel -->
                <div class="rounded-xl border p-4" style="border-color: {$colorStore.primary}30;">
                  <h4 class="font-bold mb-3" style="color: {$colorStore.text}">{m.channelAccess.panelTitle()}</h4>
                  <p class="text-sm mb-3" style="color: {$colorStore.muted}">
                    {gate.panelChannelId ? m.channelAccess.panelPosted({ channel: channelName(gate.panelChannelId) }) : m.channelAccess.panelNotPosted()}
                  </p>
                  <div class="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
                    <div class="md:col-span-2">
                      <DiscordSelector
                        type="channel"
                        options={guildChannels}
                        selected={panelTarget[gate.id] ?? null}
                        placeholder={m.channelAccess.panelWhere()}
                        onchange={(detail) => { panelTarget[gate.id] = typeof detail.selected === 'string' ? detail.selected : null; }}
                      />
                    </div>
                    <button class="min-h-[44px] px-4 rounded-xl font-medium"
                            style="background: {$colorStore.primary}20; color: {$colorStore.text}; border: 1px solid {$colorStore.primary}40;"
                            disabled={saving}
                            onclick={() => postPanel(gate)}>{m.channelAccess.panelPost()}</button>
                  </div>
                </div>
              </div>
            {/if}
          </div>
        {/each}
      {/if}
    </div>
  {/if}

  {#if activeTab === 'applications'}
    <div class="w-full space-y-6" in:fade={{ duration: 200 }}>
      <div class="rounded-2xl border p-4 flex flex-wrap gap-4 items-end"
           style="border-color: {$colorStore.primary}30;">
        <div class="min-w-[200px]">
          <span class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">{m.channelAccess.appsGate()}</span>
          <div class="min-h-[44px]">
            <DiscordSelector
              type="custom"
              options={gateFilterOptions}
              customIcon="fa-lock"
              selected={applicationFilter.configId}
              searchable={false}
              placeholder={m.channelAccess.filterAllGates()}
              onchange={(detail) => {
                applicationFilter.configId = typeof detail.selected === 'string' ? detail.selected : 'all';
                loadApplications();
              }}
            />
          </div>
        </div>
        <div class="min-w-[200px]">
          <span class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">{m.common.status()}</span>
          <div class="min-h-[44px]">
            <DiscordSelector
              type="custom"
              options={statusFilterOptions}
              customIcon="fa-filter"
              selected={applicationFilter.status}
              searchable={false}
              placeholder={m.common.anyStatus()}
              onchange={(detail) => {
                applicationFilter.status = typeof detail.selected === 'string' ? detail.selected : 'all';
                loadApplications();
              }}
            />
          </div>
        </div>
      </div>

      {#if applications.length === 0}
        <div class="rounded-2xl border p-8 text-center"
             style="border-color: {$colorStore.primary}30; color: {$colorStore.muted};">
          {m.channelAccess.appsEmpty()}
        </div>
      {:else}
        {#each applications as application (application.id)}
          <div class="rounded-2xl border p-6"
               style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15, {$colorStore.gradientEnd}10);
                      border-color: {statusColor(application.status)}40;">
            <div class="flex flex-wrap items-center justify-between gap-3">
              <div class="flex items-center gap-3">
                {#if application.avatarUrl}
                  <img alt="" class="w-10 h-10 rounded-full" src={application.avatarUrl} />
                {/if}
                <div>
                  <h3 class="font-bold" style="color: {$colorStore.text}">
                    {m.channelAccess.appsTitle({ id: application.id, user: application.username ?? (application.userId ? application.userId.toString() : m.channelAccess.appsHidden()) })}
                  </h3>
                  <p class="text-sm" style="color: {$colorStore.muted}">
                    {#if application.status === AccessApplicationStatus.Pending && application.expiresAt}
                      {m.channelAccess.appsMetaCloses({ channel: channelName(application.channelId), date: formatDate(application.createdAt), closes: formatDate(application.expiresAt) })}
                    {:else}
                      {m.channelAccess.appsMetaOpened({ channel: channelName(application.channelId), date: formatDate(application.createdAt) })}
                    {/if}
                  </p>
                </div>
              </div>
              <div class="flex items-center gap-3">
                <span class="px-3 py-1 rounded-lg text-sm font-medium"
                      style="background: {statusColor(application.status)}20; color: {statusColor(application.status)};">
                  {statusLabels[application.status]}
                </span>
                <span class="text-sm" style="color: {$colorStore.muted}">
                  ✅ {application.approvals} ❌ {application.denials} 🤷 {application.abstains}
                </span>
                <button class="min-h-[44px] px-4 rounded-xl font-medium"
                        style="background: {$colorStore.primary}20; color: {$colorStore.text}; border: 1px solid {$colorStore.primary}40;"
                        onclick={() => (expandedApplication = expandedApplication === application.id ? null : application.id)}>
                  {expandedApplication === application.id ? m.common.hide() : m.common.details()}
                </button>
              </div>
            </div>

            {#if expandedApplication === application.id}
              <div class="mt-4 space-y-4" in:fade={{ duration: 150 }}>
                {#each application.answers as answer (answer.question)}
                  <div class="p-3 rounded-xl" style="background: {$colorStore.primary}10;">
                    <p class="text-sm font-medium mb-1" style="color: {$colorStore.text}">{answer.question}</p>
                    <p class="text-sm whitespace-pre-wrap" style="color: {$colorStore.muted}">{answer.answer}</p>
                  </div>
                {/each}

                {#if application.votes.length > 0}
                  <div class="p-3 rounded-xl" style="background: {$colorStore.primary}10;">
                    <p class="text-sm font-medium mb-2" style="color: {$colorStore.text}">{m.features.votesName()}</p>
                    <ul class="space-y-1">
                      {#each application.votes as vote (vote.userId)}
                        <li class="text-sm" style="color: {$colorStore.muted}">
                          {vote.vote === 1 ? "✅" : vote.vote === -1 ? "❌" : "🤷"}
                          {vote.username ?? vote.userId.toString()}
                        </li>
                      {/each}
                    </ul>
                  </div>
                {/if}

                {#if application.status === AccessApplicationStatus.Pending}
                  <div class="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
                    <input class="min-h-[44px] px-3 rounded-xl md:col-span-1"
                           style="background: {$colorStore.primary}10; color: {$colorStore.text}; border: 1px solid {$colorStore.primary}30;"
                           placeholder={m.common.reasonOptional()}
                           bind:value={resolveReason[application.id]} />
                    <button class="min-h-[44px] px-4 rounded-xl font-medium"
                            style="background: #10b98120; color: #10b981; border: 1px solid #10b98140;"
                            disabled={saving}
                            onclick={() => resolveApplication(application, true)}>{m.common.approve()}</button>
                    <button class="min-h-[44px] px-4 rounded-xl font-medium"
                            style="background: #ef444420; color: #ef4444; border: 1px solid #ef444440;"
                            disabled={saving}
                            onclick={() => resolveApplication(application, false)}>{m.common.deny()}</button>
                  </div>
                {:else if application.resolutionReason}
                  <p class="text-sm" style="color: {$colorStore.muted}">
                    {m.channelAccess.appsClosed({ date: formatDate(application.resolvedAt), reason: application.resolutionReason })}
                  </p>
                {/if}
              </div>
            {/if}
          </div>
        {/each}
      {/if}
    </div>
  {/if}

  {#if activeTab === 'blacklist'}
    <div class="w-full space-y-6" in:fade={{ duration: 200 }}>
      <div class="rounded-2xl border p-6"
           style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15, {$colorStore.gradientEnd}10);
                  border-color: {$colorStore.primary}30;">
        <h2 class="text-xl font-bold mb-4" style="color: {$colorStore.text}">{m.channelAccess.blockTitle()}</h2>
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div>
            <span class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">{m.common.user()}</span>
            <DiscordSelector
              type="user"
              options={guildMembers}
              bind:selected={newBlacklist.userId}
              placeholder={m.common.selectUserPlaceholder()}
            />
          </div>
          <div>
            <span class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">{m.common.scope()}</span>
            <div class="min-h-[44px]">
              <DiscordSelector
                type="custom"
                options={blacklistScopeOptions}
                customIcon="fa-lock"
                selected={newBlacklist.configId ?? 'all'}
                searchable={false}
                placeholder={m.channelAccess.filterEveryGate()}
                onchange={(detail) => { newBlacklist.configId = typeof detail.selected === 'string' ? detail.selected : 'all'; }}
              />
            </div>
          </div>
          <input class="min-h-[44px] px-3 rounded-xl"
                 style="background: {$colorStore.primary}10; color: {$colorStore.text}; border: 1px solid {$colorStore.primary}30;"
                 placeholder={m.common.reasonOptional()}
                 bind:value={newBlacklist.reason} />
          <button class="min-h-[44px] px-4 rounded-xl font-medium"
                  style="background: #ef444420; color: #ef4444; border: 1px solid #ef444440;"
                  disabled={saving}
                  onclick={addBlacklist}>{m.common.block()}</button>
        </div>
      </div>

      {#if blacklist.length === 0}
        <div class="rounded-2xl border p-8 text-center"
             style="border-color: {$colorStore.primary}30; color: {$colorStore.muted};">
          {m.channelAccess.blockEmpty()}
        </div>
      {:else}
        <div class="rounded-2xl border divide-y" style="border-color: {$colorStore.primary}30;">
          {#each blacklist as entry (entry.id)}
            <div class="flex flex-wrap items-center justify-between gap-3 p-4">
              <div>
                <p class="font-medium" style="color: {$colorStore.text}">
                  {entry.username ?? entry.userId.toString()}
                </p>
                <p class="text-sm" style="color: {$colorStore.muted}">
                  {entry.reason
                    ? m.channelAccess.blockMetaReason({ gate: gateName(entry.configId), reason: entry.reason, date: formatDate(entry.addedAt) })
                    : m.channelAccess.blockMeta({ gate: gateName(entry.configId), date: formatDate(entry.addedAt) })}
                </p>
              </div>
              <button class="min-h-[44px] px-4 rounded-xl font-medium"
                      style="background: {$colorStore.primary}20; color: {$colorStore.text}; border: 1px solid {$colorStore.primary}40;"
                      disabled={saving}
                      onclick={() => removeBlacklist(entry)}>{m.common.unblock()}</button>
            </div>
          {/each}
        </div>
      {/if}
    </div>
  {/if}
</DashboardPageLayout>

<ConfirmationModal
  isOpen={gatePendingDeletion !== null}
  title={m.channelAccess.deleteTitle()}
  message={gatePendingDeletion
    ? m.channelAccess.deleteMessage({ channel: channelName(gatePendingDeletion.channelId) })
    : ""}
  confirmText={m.channelAccess.deleteConfirm()}
  variant="danger"
  onconfirm={deleteGate}
  oncancel={() => (gatePendingDeletion = null)}
/>
