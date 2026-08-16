<!-- routes/dashboard/channel-access/+page.svelte -->
<script lang="ts">
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

  const statusLabels: Record<number, string> = {
    [AccessApplicationStatus.Pending]: "Pending",
    [AccessApplicationStatus.Approved]: "Approved",
    [AccessApplicationStatus.Denied]: "Denied",
    [AccessApplicationStatus.Withdrawn]: "Withdrawn",
    [AccessApplicationStatus.Expired]: "Expired"
  };

  const expiryLabels: Record<number, string> = {
    [AccessExpiryBehavior.Deny]: "Deny the application",
    [AccessExpiryBehavior.Majority]: "Whichever side has more votes",
    [AccessExpiryBehavior.StayOpen]: "Leave it open for staff"
  };

  let pendingCount = $derived(gates.reduce((total, gate) => total + gate.pendingApplications, 0));

  const grantModeOptions = [
    { id: String(AccessGrantMode.Role), name: "Give them a role" },
    { id: String(AccessGrantMode.ChannelPermission), name: "Add them to the channel directly" }
  ];

  let expiryOptions = $derived(
    Object.entries(expiryLabels).map(([value, label]) => ({ id: value, name: label }))
  );

  let gateOptions = $derived(
    gates.map((gate) => ({ id: String(gate.id), name: `#${channelName(gate.channelId)}` }))
  );

  let gateFilterOptions = $derived([{ id: "all", name: "All gates" }, ...gateOptions]);

  let blacklistScopeOptions = $derived([{ id: "all", name: "Every gate" }, ...gateOptions]);

  let statusFilterOptions = $derived([
    { id: "all", name: "Any status" },
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
      showMessage("Failed to load channel access data", "error");
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
      showMessage("Failed to load applications", "error");
    }
  }

  async function createGate() {
    if (!$currentGuild?.id || !newGate.channelId) {
      showMessage("Pick a channel first", "error");
      return;
    }

    if (newGate.grantMode === AccessGrantMode.Role && !newGate.accessRoleId) {
      showMessage("Pick the role approved applicants should get", "error");
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
      showMessage(err instanceof Error ? err.message : "Failed to create the gate", "error");
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
      showMessage("Gate settings saved", "success");
    } catch (err) {
      logger.error("Failed to update gate:", err);
      showMessage("Failed to save the gate settings", "error");
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
      showMessage("Failed to delete the gate", "error");
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
      showMessage(err instanceof Error ? err.message : "Failed to add the question", "error");
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
      showMessage("Failed to remove the question", "error");
    } finally {
      saving = false;
    }
  }

  async function postPanel(gate: ChannelAccessGate) {
    if (!$currentGuild?.id) return;

    const target = panelTarget[gate.id];
    if (!target) {
      showMessage("Pick a channel to post the panel in", "error");
      return;
    }

    saving = true;
    try {
      await channelAccessApi.postPanel($currentGuild.id, gate.id, BigInt(target));
      showMessage("Apply panel posted", "success");
      await loadAll();
    } catch (err) {
      logger.error("Failed to post panel:", err);
      showMessage("Failed to post the panel", "error");
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
      showMessage(`Application #${application.id} was ${approve ? "approved" : "denied"}`, "success");
      await loadAll();
    } catch (err) {
      logger.error("Failed to resolve application:", err);
      showMessage("Failed to close the application", "error");
    } finally {
      saving = false;
    }
  }

  async function addBlacklist() {
    if (!$currentGuild?.id || !newBlacklist.userId) {
      showMessage("Pick a user first", "error");
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
      showMessage("Failed to block that user", "error");
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
      showMessage("Failed to lift the block", "error");
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
    if (id === null) return "None";
    return guildChannels.find((channel) => channel.id === id.toString())?.name ?? id.toString();
  }

  function roleName(id: bigint | null): string {
    if (id === null) return "None";
    return guildRoles.find((role) => role.id === id.toString())?.name ?? id.toString();
  }

  function grantSummary(gate: ChannelAccessGate): string {
    return gate.grantMode === AccessGrantMode.Role
      ? `Grants ${roleName(gate.accessRoleId)}`
      : "Adds people to the channel directly";
  }

  function gateName(configId: number | null): string {
    if (configId === null) return "Every gate";
    const gate = gates.find((existing) => existing.id === configId);
    return gate ? `#${channelName(gate.channelId)}` : "Deleted gate";
  }

  function formatDate(value: string | null): string {
    if (!value) return "Unknown";
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

  const tabs = [
    { id: "gates", label: "Gates", icon: "fa-lock" },
    { id: "applications", label: "Applications", icon: "fa-inbox" },
    { id: "blacklist", label: "Blocked", icon: "fa-ban" }
  ];

  let actionButtons = $derived([
    {
      label: "Refresh",
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
  guildName={$currentGuild?.name || "Dashboard"}
  icon="fa-lock"
  statusMessages={statusMessageContent}
  subtitle="Let members apply for locked channels and have the people inside vote them in"
  {tabs}
  title="Channel Access"
>
  {#if activeTab === 'gates'}
    <div class="w-full space-y-6" in:fade={{ duration: 200 }}>
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Gates" value={gates.length} icon="fa-lock" />
        <StatCard label="Open applications" value={pendingCount} icon="fa-inbox" />
        <StatCard label="Blocked users" value={blacklist.length} icon="fa-shield-slash" />
      </div>

      <!-- Create a gate -->
      <div class="rounded-2xl border p-6 shadow-2xl"
           style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15, {$colorStore.gradientEnd}10);
                  border-color: {$colorStore.primary}30;">
        <h2 class="text-xl font-bold mb-4" style="color: {$colorStore.text}">Open applications for a channel</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div>
            <span class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">Locked channel</span>
            <div class="min-h-[44px]">
              <DiscordSelector
                type="channel"
                options={guildChannels}
                selected={newGate.channelId?.toString() || null}
                placeholder="Select a channel"
                onchange={(detail) => {
                  newGate.channelId = detail.selected && typeof detail.selected === 'string' ? BigInt(detail.selected) : null;
                }}
              />
            </div>
          </div>
          <div>
            <span class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">How people get in</span>
            <div class="min-h-[44px]">
              <DiscordSelector
                type="custom"
                options={grantModeOptions}
                customIcon="fa-key"
                selected={String(newGate.grantMode)}
                searchable={false}
                placeholder="Pick how access is granted"
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
              <span class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">Role granted on approval</span>
              <div class="min-h-[44px]">
                <DiscordSelector
                  type="role"
                  options={guildRoles}
                  selected={newGate.accessRoleId?.toString() || null}
                  placeholder="Select a role"
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
            Create gate
          </button>
        </div>
      </div>

      <!-- Existing gates -->
      {#if gates.length === 0}
        <div class="rounded-2xl border p-8 text-center"
             style="border-color: {$colorStore.primary}30; color: {$colorStore.muted};">
          No gates yet. Pick a locked channel above to start taking applications.
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
                  {grantSummary(gate)} • ✅ {gate.requiredApprovals} / ❌ {gate.requiredDenials} •
                  {gate.voteDurationHours > 0 ? `${gate.voteDurationHours}h window` : "no time limit"} •
                  {gate.pendingApplications} open
                </p>
              </div>
              <div class="flex items-center gap-2">
                <div class="flex items-center gap-3 min-h-[44px]">
                  <span class="text-sm" style="color: {$colorStore.text}">
                    {gate.enabled ? "Accepting applications" : "Closed"}
                  </span>
                  {@render toggle(gate.enabled, (value) => updateGate(gate, { enabled: value }))}
                </div>
                <button
                  class="min-h-[44px] px-4 rounded-xl font-medium transition-all"
                  style="background: {$colorStore.primary}20; color: {$colorStore.text}; border: 1px solid {$colorStore.primary}40;"
                  onclick={() => (expandedGate = expandedGate === gate.id ? null : gate.id)}
                >
                  {expandedGate === gate.id ? "Hide settings" : "Settings"}
                </button>
                <button
                  class="min-h-[44px] px-4 rounded-xl font-medium transition-all"
                  style="background: #ef444420; color: #ef4444; border: 1px solid #ef444440;"
                  disabled={saving}
                  onclick={() => (gatePendingDeletion = gate)}
                >
                  Delete
                </button>
              </div>
            </div>

            {#if expandedGate === gate.id}
              <div class="mt-6 space-y-6" in:fade={{ duration: 150 }}>
                <!-- Channels and roles -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">How people get in</span>
                    <div class="min-h-[44px]">
                      <DiscordSelector
                        type="custom"
                        options={grantModeOptions}
                        customIcon="fa-key"
                        selected={String(gate.grantMode)}
                        searchable={false}
                        placeholder="Pick how access is granted"
                        onchange={(detail) => {
                          if (detail.selected === String(AccessGrantMode.ChannelPermission)) updateGate(gate, { accessRoleId: BigInt(0) });
                        }}
                      />
                    </div>
                  </div>
                  <div>
                    <span class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">Access role</span>
                    <div class="min-h-[44px]">
                      <DiscordSelector
                        type="role"
                        options={guildRoles}
                        selected={gate.accessRoleId?.toString() || null}
                        placeholder="No role, applicants are added directly"
                        onchange={(detail) => updateGate(gate, { accessRoleId: detail.selected ? BigInt(detail.selected as string) : BigInt(0) })}
                      />
                    </div>
                  </div>
                  <div>
                    <span class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">Review channel</span>
                    <DiscordSelector
                      type="channel"
                      options={guildChannels}
                      selected={gate.reviewChannelId?.toString() || null}
                      placeholder="The gated channel itself"
                      onchange={(detail) => updateGate(gate, { reviewChannelId: detail.selected ? BigInt(detail.selected as string) : BigInt(0) })}
                    />
                  </div>
                  <div>
                    <span class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">Log channel</span>
                    <DiscordSelector
                      type="channel"
                      options={guildChannels}
                      selected={gate.logChannelId?.toString() || null}
                      placeholder="No logging"
                      onchange={(detail) => updateGate(gate, { logChannelId: detail.selected ? BigInt(detail.selected as string) : BigInt(0) })}
                    />
                  </div>
                  <div>
                    <span class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">Voter role</span>
                    <DiscordSelector
                      type="role"
                      options={guildRoles}
                      selected={gate.voterRoleId?.toString() || null}
                      placeholder="Everyone with the access role"
                      onchange={(detail) => updateGate(gate, { voterRoleId: detail.selected ? BigInt(detail.selected as string) : BigInt(0) })}
                    />
                  </div>
                  <div>
                    <span class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">Ping role on new applications</span>
                    <DiscordSelector
                      type="role"
                      options={guildRoles}
                      selected={gate.pingRoleId?.toString() || null}
                      placeholder="No ping"
                      onchange={(detail) => updateGate(gate, { pingRoleId: detail.selected ? BigInt(detail.selected as string) : BigInt(0) })}
                    />
                  </div>
                </div>

                <!-- Numbers -->
                <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <label class="block">
                    <span class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">Approvals needed</span>
                    <input class="w-full min-h-[44px] px-3 rounded-xl"
                           style="background: {$colorStore.primary}10; color: {$colorStore.text}; border: 1px solid {$colorStore.primary}30;"
                           type="number" min="0" value={gate.requiredApprovals}
                           onchange={(e) => updateGate(gate, { requiredApprovals: Number(e.currentTarget.value) })} />
                  </label>
                  <label class="block">
                    <span class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">Denials needed</span>
                    <input class="w-full min-h-[44px] px-3 rounded-xl"
                           style="background: {$colorStore.primary}10; color: {$colorStore.text}; border: 1px solid {$colorStore.primary}30;"
                           type="number" min="0" value={gate.requiredDenials}
                           onchange={(e) => updateGate(gate, { requiredDenials: Number(e.currentTarget.value) })} />
                  </label>
                  <label class="block">
                    <span class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">Voting window (hours)</span>
                    <input class="w-full min-h-[44px] px-3 rounded-xl"
                           style="background: {$colorStore.primary}10; color: {$colorStore.text}; border: 1px solid {$colorStore.primary}30;"
                           type="number" min="0" value={gate.voteDurationHours}
                           onchange={(e) => updateGate(gate, { voteDurationHours: Number(e.currentTarget.value) })} />
                  </label>
                  <label class="block">
                    <span class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">Min account age (days)</span>
                    <input class="w-full min-h-[44px] px-3 rounded-xl"
                           style="background: {$colorStore.primary}10; color: {$colorStore.text}; border: 1px solid {$colorStore.primary}30;"
                           type="number" min="0" value={gate.minAccountAgeDays}
                           onchange={(e) => updateGate(gate, { minAccountAgeDays: Number(e.currentTarget.value) })} />
                  </label>
                  <label class="block">
                    <span class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">Min time in server (days)</span>
                    <input class="w-full min-h-[44px] px-3 rounded-xl"
                           style="background: {$colorStore.primary}10; color: {$colorStore.text}; border: 1px solid {$colorStore.primary}30;"
                           type="number" min="0" value={gate.minServerAgeDays}
                           onchange={(e) => updateGate(gate, { minServerAgeDays: Number(e.currentTarget.value) })} />
                  </label>
                  <label class="block">
                    <span class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">Reapply cooldown (hours)</span>
                    <input class="w-full min-h-[44px] px-3 rounded-xl"
                           style="background: {$colorStore.primary}10; color: {$colorStore.text}; border: 1px solid {$colorStore.primary}30;"
                           type="number" min="0" value={gate.reapplyCooldownHours}
                           onchange={(e) => updateGate(gate, { reapplyCooldownHours: Number(e.currentTarget.value) })} />
                  </label>
                </div>

                <!-- Behaviour -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">When the window closes</span>
                    <div class="min-h-[44px]">
                      <DiscordSelector
                        type="custom"
                        options={expiryOptions}
                        customIcon="fa-hourglass"
                        selected={String(gate.onExpiry)}
                        searchable={false}
                        placeholder="Pick an outcome"
                        onchange={(detail) => { if (typeof detail.selected === 'string') updateGate(gate, { onExpiry: Number(detail.selected) }); }}
                      />
                    </div>
                  </div>

                  <div class="flex flex-col gap-2 justify-end">
                    {#each [
                      { key: 'allowAbstain', label: 'Offer an abstain button', value: gate.allowAbstain },
                      { key: 'anonymousApplicant', label: 'Hide the applicant until the vote closes', value: gate.anonymousApplicant },
                      { key: 'anonymousVotes', label: 'Hide who voted which way', value: gate.anonymousVotes },
                      { key: 'dmOnDecision', label: 'DM the applicant on a decision', value: gate.dmOnDecision }
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
                  <h4 class="font-bold mb-3" style="color: {$colorStore.text}">Application questions</h4>
                  {#if gate.questions.length === 0}
                    <p class="text-sm mb-3" style="color: {$colorStore.muted}">
                      No questions, so applicants apply with a single click.
                    </p>
                  {:else}
                    <ul class="space-y-2 mb-3">
                      {#each gate.questions as question, index (question.id)}
                        <li class="flex items-center justify-between gap-3 p-2 rounded-lg"
                            style="background: {$colorStore.primary}10;">
                          <span style="color: {$colorStore.text}">
                            {index + 1}. {question.question}
                            {#if !question.required}<em style="color: {$colorStore.muted}"> (optional)</em>{/if}
                          </span>
                          <button class="min-h-[44px] px-3 rounded-lg"
                                  style="color: #ef4444;"
                                  disabled={saving}
                                  onclick={() => removeQuestion(gate, index + 1)}>Remove</button>
                        </li>
                      {/each}
                    </ul>
                  {/if}

                  {#if gate.questions.length < 5}
                    <div class="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
                      <input class="min-h-[44px] px-3 rounded-xl md:col-span-2"
                             style="background: {$colorStore.primary}10; color: {$colorStore.text}; border: 1px solid {$colorStore.primary}30;"
                             maxlength="45" placeholder="Question (45 characters max)"
                             bind:value={newQuestion.question} />
                      <input class="min-h-[44px] px-3 rounded-xl"
                             style="background: {$colorStore.primary}10; color: {$colorStore.text}; border: 1px solid {$colorStore.primary}30;"
                             placeholder="Placeholder (optional)"
                             bind:value={newQuestion.placeholder} />
                      <button class="min-h-[44px] px-4 rounded-xl font-medium"
                              style="background: {$colorStore.primary}20; color: {$colorStore.text}; border: 1px solid {$colorStore.primary}40;"
                              disabled={saving || !newQuestion.question.trim()}
                              onclick={() => addQuestion(gate)}>Add question</button>
                    </div>
                    <div class="flex flex-wrap gap-6 mt-3">
                      <div class="flex items-center gap-3 min-h-[44px]">
                        <span class="text-sm" style="color: {$colorStore.text}">Required</span>
                        {@render toggle(newQuestion.required, (value) => (newQuestion.required = value))}
                      </div>
                      <div class="flex items-center gap-3 min-h-[44px]">
                        <span class="text-sm" style="color: {$colorStore.text}">Multi-line answer</span>
                        {@render toggle(newQuestion.paragraph, (value) => (newQuestion.paragraph = value))}
                      </div>
                    </div>
                  {:else}
                    <p class="text-sm" style="color: {$colorStore.muted}">
                      Discord caps application forms at five questions.
                    </p>
                  {/if}
                </div>

                <!-- Panel -->
                <div class="rounded-xl border p-4" style="border-color: {$colorStore.primary}30;">
                  <h4 class="font-bold mb-3" style="color: {$colorStore.text}">Apply panel</h4>
                  <p class="text-sm mb-3" style="color: {$colorStore.muted}">
                    {gate.panelChannelId ? `Last posted in #${channelName(gate.panelChannelId)}.` : "Not posted yet."}
                  </p>
                  <div class="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
                    <div class="md:col-span-2">
                      <DiscordSelector
                        type="channel"
                        options={guildChannels}
                        selected={panelTarget[gate.id] ?? null}
                        placeholder="Where should the button go?"
                        onchange={(detail) => { panelTarget[gate.id] = typeof detail.selected === 'string' ? detail.selected : null; }}
                      />
                    </div>
                    <button class="min-h-[44px] px-4 rounded-xl font-medium"
                            style="background: {$colorStore.primary}20; color: {$colorStore.text}; border: 1px solid {$colorStore.primary}40;"
                            disabled={saving}
                            onclick={() => postPanel(gate)}>Post panel</button>
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
          <span class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">Gate</span>
          <div class="min-h-[44px]">
            <DiscordSelector
              type="custom"
              options={gateFilterOptions}
              customIcon="fa-lock"
              selected={applicationFilter.configId}
              searchable={false}
              placeholder="All gates"
              onchange={(detail) => {
                applicationFilter.configId = typeof detail.selected === 'string' ? detail.selected : 'all';
                loadApplications();
              }}
            />
          </div>
        </div>
        <div class="min-w-[200px]">
          <span class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">Status</span>
          <div class="min-h-[44px]">
            <DiscordSelector
              type="custom"
              options={statusFilterOptions}
              customIcon="fa-filter"
              selected={applicationFilter.status}
              searchable={false}
              placeholder="Any status"
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
          Nothing to show for that filter.
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
                    #{application.id} • {application.username ?? (application.userId ? application.userId.toString() : "Hidden")}
                  </h3>
                  <p class="text-sm" style="color: {$colorStore.muted}">
                    #{channelName(application.channelId)} • opened {formatDate(application.createdAt)}
                    {#if application.status === AccessApplicationStatus.Pending && application.expiresAt}
                      • closes {formatDate(application.expiresAt)}
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
                  {expandedApplication === application.id ? "Hide" : "Details"}
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
                    <p class="text-sm font-medium mb-2" style="color: {$colorStore.text}">Votes</p>
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
                           placeholder="Reason (optional)"
                           bind:value={resolveReason[application.id]} />
                    <button class="min-h-[44px] px-4 rounded-xl font-medium"
                            style="background: #10b98120; color: #10b981; border: 1px solid #10b98140;"
                            disabled={saving}
                            onclick={() => resolveApplication(application, true)}>Approve</button>
                    <button class="min-h-[44px] px-4 rounded-xl font-medium"
                            style="background: #ef444420; color: #ef4444; border: 1px solid #ef444440;"
                            disabled={saving}
                            onclick={() => resolveApplication(application, false)}>Deny</button>
                  </div>
                {:else if application.resolutionReason}
                  <p class="text-sm" style="color: {$colorStore.muted}">
                    Closed {formatDate(application.resolvedAt)}: {application.resolutionReason}
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
        <h2 class="text-xl font-bold mb-4" style="color: {$colorStore.text}">Block someone from applying</h2>
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div>
            <span class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">User</span>
            <DiscordSelector
              type="user"
              options={guildMembers}
              bind:selected={newBlacklist.userId}
              placeholder="Select a user"
            />
          </div>
          <div>
            <span class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">Scope</span>
            <div class="min-h-[44px]">
              <DiscordSelector
                type="custom"
                options={blacklistScopeOptions}
                customIcon="fa-lock"
                selected={newBlacklist.configId ?? 'all'}
                searchable={false}
                placeholder="Every gate"
                onchange={(detail) => { newBlacklist.configId = typeof detail.selected === 'string' ? detail.selected : 'all'; }}
              />
            </div>
          </div>
          <input class="min-h-[44px] px-3 rounded-xl"
                 style="background: {$colorStore.primary}10; color: {$colorStore.text}; border: 1px solid {$colorStore.primary}30;"
                 placeholder="Reason (optional)"
                 bind:value={newBlacklist.reason} />
          <button class="min-h-[44px] px-4 rounded-xl font-medium"
                  style="background: #ef444420; color: #ef4444; border: 1px solid #ef444440;"
                  disabled={saving}
                  onclick={addBlacklist}>Block</button>
        </div>
      </div>

      {#if blacklist.length === 0}
        <div class="rounded-2xl border p-8 text-center"
             style="border-color: {$colorStore.primary}30; color: {$colorStore.muted};">
          Nobody is blocked from applying.
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
                  {gateName(entry.configId)}{entry.reason ? ` • ${entry.reason}` : ""} • added {formatDate(entry.addedAt)}
                </p>
              </div>
              <button class="min-h-[44px] px-4 rounded-xl font-medium"
                      style="background: {$colorStore.primary}20; color: {$colorStore.text}; border: 1px solid {$colorStore.primary}40;"
                      disabled={saving}
                      onclick={() => removeBlacklist(entry)}>Unblock</button>
            </div>
          {/each}
        </div>
      {/if}
    </div>
  {/if}
</DashboardPageLayout>

<ConfirmationModal
  isOpen={gatePendingDeletion !== null}
  title="Delete this gate?"
  message={gatePendingDeletion
    ? `#${channelName(gatePendingDeletion.channelId)} stops taking applications, and its questions, applications and votes are deleted. Nobody loses access they already have.`
    : ""}
  confirmText="Delete gate"
  variant="danger"
  onconfirm={deleteGate}
  oncancel={() => (gatePendingDeletion = null)}
/>
