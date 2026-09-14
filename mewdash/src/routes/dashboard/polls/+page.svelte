<!-- routes/dashboard/polls/+page.svelte -->
<script lang="ts">
  import { onMount } from "svelte";
  import { fade, fly, slide } from "svelte/transition";
  import { colorStore } from "$lib/stores/colorStore";
  import { currentGuild } from "$lib/stores/currentGuild";
  import { userStore } from "$lib/stores/userStore";
  import {
    clientApi,
    pollApi,
    PollType,
    type CreatePollRequest,
    type PollAnalyticsResponse,
    type PollResponse,
    type PollTemplateResponse,
    type ScheduledPollResponse
  } from "$lib/api/index.ts";
  import { logger } from "$lib/logger";
  import DashboardPageLayout from "$lib/components/layout/DashboardPageLayout.svelte";
  import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";
  import StatCard from "$lib/components/monitoring/StatCard.svelte";
  import { requestConfirmation } from "$lib/stores/confirmationStore";

  let loading = $state(true);
  let saving = $state(false);
  let message = $state("");
  let messageType: "success" | "error" | "info" = $state("info");
  let activeTab = $state("active");

  let polls: PollResponse[] = $state([]);
  let scheduled: ScheduledPollResponse[] = $state([]);
  let templates: PollTemplateResponse[] = $state([]);
  let analytics: PollAnalyticsResponse | null = $state(null);
  let textChannels: Array<{ id: string; name: string }> = $state([]);
  let roles: Array<{ id: string; name: string; color?: number }> = $state([]);
  let includeInactive = $state(false);
  let expandedPoll = $state<number | null>(null);
  let pollDetails = $state<Record<number, PollResponse>>({});

  const tabs = [
    { id: "active", label: "Polls", icon: "fa-chart-simple" },
    { id: "create", label: "Create", icon: "fa-plus" },
    { id: "scheduled", label: "Scheduled", icon: "fa-calendar" },
    { id: "templates", label: "Templates", icon: "fa-copy" },
    { id: "analytics", label: "Analytics", icon: "fa-chart-simple" }
  ];

  const typeOptions = [
    { id: PollType.SingleChoice.toString(), name: "Single choice" },
    { id: PollType.MultiChoice.toString(), name: "Multiple choice" },
    { id: PollType.YesNo.toString(), name: "Yes / No" },
    { id: PollType.Anonymous.toString(), name: "Anonymous" },
    { id: PollType.RoleRestricted.toString(), name: "Role restricted" }
  ];

  const typeLabels: Record<number, string> = {
    [PollType.YesNo]: "Yes / No",
    [PollType.SingleChoice]: "Single choice",
    [PollType.MultiChoice]: "Multiple choice",
    [PollType.Anonymous]: "Anonymous",
    [PollType.RoleRestricted]: "Role restricted"
  };

  /** Draft used by the create tab, also seeded from templates */
  let draft = $state({
    question: "",
    options: ["", ""],
    type: PollType.SingleChoice.toString(),
    channelId: null as string | null,
    durationMinutes: null as number | null,
    allowedRoles: [] as string[],
    allowVoteChanges: true,
    showResults: true,
    showProgressBars: true,
    scheduleFor: "",
    saveAsTemplate: false,
    templateName: ""
  });
  let draftError = $state("");

  let isYesNo = $derived(draft.type === PollType.YesNo.toString());
  let isRoleRestricted = $derived(draft.type === PollType.RoleRestricted.toString());

  function showMessage(text: string, type: "success" | "error" | "info") {
    message = text;
    messageType = type;
    setTimeout(() => { message = ""; }, 5000);
  }

  function userId(): bigint | null {
    return $userStore?.id ? BigInt($userStore.id) : null;
  }

  async function loadAll() {
    if (!$currentGuild?.id) return;
    loading = true;
    try {
      const [pollData, scheduledData, templateData, channels, roleData] = await Promise.all([
        pollApi.getPolls($currentGuild.id, includeInactive).catch(() => []),
        pollApi.getScheduledPolls($currentGuild.id).catch(() => null),
        pollApi.getTemplates($currentGuild.id).catch(() => []),
        clientApi.getTextChannels($currentGuild.id).catch(() => []),
        clientApi.getRoles($currentGuild.id).catch(() => [])
      ]);
      polls = pollData || [];
      scheduled = scheduledData?.scheduledPolls ?? [];
      templates = templateData || [];
      textChannels = (channels as any[]).map(c => ({ id: c.id.toString(), name: c.name }));
      roles = (roleData as any[]).map(r => ({ id: r.id.toString(), name: r.name, color: r.color }));
    } catch (err) {
      logger.error("Failed to load polls:", err);
      showMessage("Failed to load polls", "error");
    } finally {
      loading = false;
    }
  }

  async function loadAnalytics() {
    if (!$currentGuild?.id) return;
    try {
      analytics = await pollApi.getAnalytics($currentGuild.id, "month");
    } catch (err) {
      logger.error("Failed to load poll analytics:", err);
    }
  }

  async function togglePollDetails(poll: PollResponse) {
    if (expandedPoll === poll.id) {
      expandedPoll = null;
      return;
    }
    expandedPoll = poll.id;
    if (!pollDetails[poll.id] && $currentGuild?.id) {
      try {
        pollDetails[poll.id] = await pollApi.getPoll($currentGuild.id, poll.id);
      } catch (err) {
        logger.error("Failed to load poll details:", err);
      }
    }
  }

  async function closePoll(poll: PollResponse) {
    const uid = userId();
    if (!$currentGuild?.id || !uid) return;
    if (!(await requestConfirmation({ message: `Close "${poll.question}"? Voting stops and final results are posted.`, confirmText: "Close poll", variant: "warning" }))) return;
    saving = true;
    try {
      await pollApi.closePoll($currentGuild.id, poll.id, { userId: uid, notifyVoters: false });
      await loadAll();
    } catch (err) {
      logger.error("Failed to close poll:", err);
      showMessage("Failed to close poll", "error");
    } finally {
      saving = false;
    }
  }

  async function deletePoll(poll: PollResponse) {
    const uid = userId();
    if (!$currentGuild?.id || !uid) return;
    if (!(await requestConfirmation({ message: `Delete "${poll.question}" and all of its votes?`, confirmText: "Delete" }))) return;
    saving = true;
    try {
      await pollApi.deletePoll($currentGuild.id, poll.id, uid);
      await loadAll();
    } catch (err) {
      logger.error("Failed to delete poll:", err);
      showMessage("Failed to delete poll", "error");
    } finally {
      saving = false;
    }
  }

  function buildRequest(uid: bigint): CreatePollRequest | null {
    draftError = "";
    if (!draft.question.trim()) {
      draftError = "Ask a question.";
      return null;
    }
    if (!draft.channelId) {
      draftError = "Pick the channel the poll is posted in.";
      return null;
    }
    const options = isYesNo
      ? [{ text: "Yes" }, { text: "No" }]
      : draft.options.map(o => o.trim()).filter(Boolean).map(text => ({ text }));
    if (!isYesNo && options.length < 2) {
      draftError = "Add at least two options.";
      return null;
    }
    if (options.length > 25) {
      draftError = "Discord polls support at most 25 options.";
      return null;
    }
    if (isRoleRestricted && draft.allowedRoles.length === 0) {
      draftError = "Choose which roles may vote.";
      return null;
    }
    const type = parseInt(draft.type) as PollType;
    return {
      question: draft.question.trim(),
      options,
      type,
      channelId: BigInt(draft.channelId),
      durationMinutes: draft.durationMinutes || null,
      allowMultipleVotes: type === PollType.MultiChoice,
      isAnonymous: type === PollType.Anonymous,
      allowedRoles: isRoleRestricted ? draft.allowedRoles.map(r => BigInt(r)) : null,
      allowVoteChanges: draft.allowVoteChanges,
      showResults: draft.showResults,
      showProgressBars: draft.showProgressBars,
      userId: uid
    };
  }

  async function submitDraft() {
    const uid = userId();
    if (!$currentGuild?.id || !uid) return;
    const request = buildRequest(uid);
    if (!request) return;
    saving = true;
    try {
      if (draft.scheduleFor) {
        const when = new Date(draft.scheduleFor);
        if (Number.isNaN(when.getTime()) || when.getTime() <= Date.now()) {
          draftError = "Scheduled time must be in the future.";
          return;
        }
        await pollApi.schedulePoll($currentGuild.id, { ...request, scheduledFor: when.toISOString() });
        showMessage("Poll scheduled", "success");
      } else {
        await pollApi.createPoll($currentGuild.id, request);
        showMessage("Poll posted", "success");
      }
      if (draft.saveAsTemplate && draft.templateName.trim()) {
        await pollApi.createTemplate($currentGuild.id, {
          name: draft.templateName.trim(),
          question: request.question,
          options: request.options,
          defaultType: request.type,
          allowMultipleVotes: request.allowMultipleVotes,
          isAnonymous: request.isAnonymous,
          allowVoteChanges: request.allowVoteChanges,
          showResults: request.showResults,
          userId: uid
        });
      }
      resetDraft();
      await loadAll();
      activeTab = draft.scheduleFor ? "scheduled" : "active";
    } catch (err: any) {
      logger.error("Failed to create poll:", err);
      draftError = err?.message || "Failed to create poll.";
    } finally {
      saving = false;
    }
  }

  function resetDraft() {
    draft = {
      question: "", options: ["", ""], type: PollType.SingleChoice.toString(), channelId: null, durationMinutes: null,
      allowedRoles: [], allowVoteChanges: true, showResults: true, showProgressBars: true, scheduleFor: "",
      saveAsTemplate: false, templateName: ""
    };
    draftError = "";
  }

  function useTemplate(template: PollTemplateResponse) {
    let options: string[] = [];
    let settings: any = {};
    try {
      const parsed = JSON.parse(template.options);
      options = Array.isArray(parsed) ? parsed.map((o: any) => (typeof o === "string" ? o : o?.text ?? o?.Text ?? "")).filter(Boolean) : [];
    } catch {
      options = [];
    }
    try {
      settings = template.settings ? JSON.parse(template.settings) : {};
    } catch {
      settings = {};
    }
    const type = settings.defaultType ?? settings.DefaultType ?? settings.type ?? settings.Type ?? PollType.SingleChoice;
    draft = {
      ...draft,
      question: template.question,
      options: options.length >= 2 ? options : ["", ""],
      type: String(type),
      allowVoteChanges: settings.allowVoteChanges ?? settings.AllowVoteChanges ?? true,
      showResults: settings.showResults ?? settings.ShowResults ?? true
    };
    activeTab = "create";
  }

  async function deleteTemplate(template: PollTemplateResponse) {
    const uid = userId();
    if (!$currentGuild?.id || !uid) return;
    if (!(await requestConfirmation({ message: `Delete template "${template.name}"?`, confirmText: "Delete" }))) return;
    try {
      await pollApi.deleteTemplate($currentGuild.id, template.id, uid);
      templates = templates.filter(t => t.id !== template.id);
    } catch (err) {
      logger.error("Failed to delete template:", err);
      showMessage("Failed to delete template", "error");
    }
  }

  async function cancelScheduled(item: ScheduledPollResponse) {
    const uid = userId();
    if (!$currentGuild?.id || !uid) return;
    if (!(await requestConfirmation({ message: `Cancel the scheduled poll "${item.question}"?`, confirmText: "Cancel poll", variant: "warning" }))) return;
    try {
      await pollApi.cancelScheduledPoll($currentGuild.id, item.id, uid);
      await loadAll();
    } catch (err) {
      logger.error("Failed to cancel scheduled poll:", err);
      showMessage("Failed to cancel scheduled poll", "error");
    }
  }

  function channelName(id: bigint | string): string {
    return textChannels.find(c => c.id === id.toString())?.name ?? id.toString();
  }

  function formatDate(value: string | null): string {
    return value ? new Date(value).toLocaleString() : "";
  }

  function timeLeft(expiresAt: string | null): string {
    if (!expiresAt) return "No end time";
    const ms = new Date(expiresAt).getTime() - Date.now();
    if (ms <= 0) return "Ended";
    const mins = Math.round(ms / 60000);
    if (mins < 60) return `${mins}m left`;
    const hours = Math.round(mins / 60);
    if (hours < 48) return `${hours}h left`;
    return `${Math.round(hours / 24)}d left`;
  }

  onMount(loadAll);

  $effect(() => {
    if ($currentGuild?.id) loadAll();
  });

  $effect(() => {
    if (activeTab === "analytics" && $currentGuild?.id) loadAnalytics();
  });

  let actionButtons = $derived([
    { label: "New poll", icon: "fa-plus", action: () => { activeTab = "create"; } },
    { label: "Refresh", icon: "fa-arrows-rotate", action: () => loadAll(), loading }
  ]);
</script>

{#snippet statusMessageContent()}
  {#if message}
    <div class="mb-6 p-4 rounded-xl flex items-center gap-3 transition-all"
         style="background: {messageType === 'success' ? '#10b98120' : messageType === 'error' ? '#ef444420' : $colorStore.primary + '20'};
                border: 1px solid {messageType === 'success' ? '#10b981' : messageType === 'error' ? '#ef4444' : $colorStore.primary}30;"
         in:fly={{ x: 20, duration: 300 }}>
      <i class="fa-utility-duo fa-regular {messageType === 'success' ? 'fa-circle-check' : 'fa-circle-exclamation'}"
         style="--fa-primary-color: {messageType === 'success' ? '#10b981' : messageType === 'error' ? '#ef4444' : $colorStore.primary}; --fa-secondary-color: {$colorStore.secondary}; font-size: 20px;"></i>
      <span style="color: {messageType === 'success' ? '#10b981' : messageType === 'error' ? '#ef4444' : $colorStore.primary}">{message}</span>
    </div>
  {/if}
{/snippet}

<DashboardPageLayout
  {actionButtons}
  bind:activeTab
  guildName={$currentGuild?.name || "Dashboard"}
  icon="fa-chart-simple"
  statusMessages={statusMessageContent}
  subtitle="Create, schedule, and review polls"
  {tabs}
  title="Polls"
>
  {#if activeTab === 'active'}
    <div class="w-full space-y-6" in:fade={{ duration: 200 }}>
      <div class=" rounded-2xl border p-6 md:p-8 shadow-2xl transition-all"
           style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15, {$colorStore.gradientEnd}10); border-color: {$colorStore.primary}30;">
        <div class="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div class="flex items-center gap-3">
            <i class="fa-utility-duo fa-regular fa-chart-simple" style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary}; font-size: 20px;"></i>
            <h2 class="text-xl font-bold" style="color: {$colorStore.text}">Polls ({polls.length})</h2>
          </div>
          <label class="flex items-center gap-2 px-3 rounded-lg cursor-pointer min-h-[44px] text-sm"
                 style="background: {$colorStore.primary}08; color: {$colorStore.text};">
            <input type="checkbox" bind:checked={includeInactive} onchange={loadAll} class="w-4 h-4 rounded" style="accent-color: {$colorStore.primary};">
            Include closed polls
          </label>
        </div>

        {#if loading && polls.length === 0}
          <div class="flex justify-center py-12">
            <div class="w-12 h-12 border-4 rounded-full animate-spin" style="border-color: {$colorStore.primary}20; border-top-color: {$colorStore.primary};" aria-label="Loading"></div>
          </div>
        {:else if polls.length === 0}
          <div class="text-center py-8">
            <i class="fa-utility-duo fa-regular fa-chart-simple" style="--fa-primary-color: {$colorStore.muted}; --fa-secondary-color: {$colorStore.muted}; font-size: 48px; opacity: 0.5; display: block; margin: 0 auto 16px;"></i>
            <h3 class="text-lg font-semibold mb-2" style="color: {$colorStore.text}">No polls yet</h3>
            <p class="text-sm" style="color: {$colorStore.muted}">Create one from the Create tab.</p>
          </div>
        {:else}
          <div class="space-y-3">
            {#each polls as poll (poll.id)}
              {@const detail = pollDetails[poll.id] ?? poll}
              {@const total = detail.options.reduce((sum, o) => sum + o.voteCount, 0)}
              <div class="rounded-xl border transition-all" style="background: {$colorStore.primary}05; border-color: {$colorStore.primary}20;">
                <button class="w-full text-left p-4 flex items-start gap-4" onclick={() => togglePollDetails(poll)}
                        aria-expanded={expandedPoll === poll.id}>
                  <div class="p-2 rounded-lg shrink-0" style="background: {poll.isActive ? '#10b98120' : $colorStore.muted + '20'};">
                    <i class="fa-solid {poll.isActive ? 'fa-circle-dot' : 'fa-circle-check'}" style="color: {poll.isActive ? '#10b981' : $colorStore.muted}; font-size: 16px;"></i>
                  </div>
                  <div class="flex-1 min-w-0">
                    <div class="font-semibold break-words" style="color: {$colorStore.text}">{poll.question}</div>
                    <div class="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs mt-1" style="color: {$colorStore.muted}">
                      <span>#{poll.channelName ?? channelName(poll.channelId)}</span>
                      <span>{typeLabels[poll.type] ?? "Poll"}</span>
                      <span>{total} vote{total === 1 ? "" : "s"}</span>
                      <span>{poll.isActive ? timeLeft(poll.expiresAt) : `Closed ${formatDate(poll.closedAt)}`}</span>
                      {#if poll.creatorName}<span>by {poll.creatorName}</span>{/if}
                    </div>
                  </div>
                  <i class="fa-solid fa-chevron-{expandedPoll === poll.id ? 'up' : 'down'} shrink-0 mt-1" style="color: {$colorStore.muted}; font-size: 12px;"></i>
                </button>

                {#if expandedPoll === poll.id}
                  <div class="px-4 pb-4 space-y-4" transition:slide>
                    <div class="space-y-2">
                      {#each detail.options as option (option.id)}
                        {@const pct = total > 0 ? Math.round((option.voteCount / total) * 100) : 0}
                        <div>
                          <div class="flex items-center justify-between text-sm mb-1">
                            <span style="color: {$colorStore.text}">{option.emote ? `${option.emote} ` : ""}{option.text}</span>
                            <span style="color: {$colorStore.muted}">{option.voteCount} · {pct}%</span>
                          </div>
                          <div class="h-2 rounded-full overflow-hidden" style="background: {$colorStore.primary}15;">
                            <div class="h-full rounded-full transition-all" style="width: {pct}%; background: {option.color || $colorStore.primary};"></div>
                          </div>
                        </div>
                      {/each}
                    </div>
                    {#if detail.stats}
                      <div class="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                        <div class="p-3 rounded-lg" style="background: {$colorStore.primary}08;">
                          <div class="text-xs" style="color: {$colorStore.muted}">Unique voters</div>
                          <div class="font-bold" style="color: {$colorStore.text}">{detail.stats.uniqueVoters}</div>
                        </div>
                        <div class="p-3 rounded-lg" style="background: {$colorStore.primary}08;">
                          <div class="text-xs" style="color: {$colorStore.muted}">Participation</div>
                          <div class="font-bold" style="color: {$colorStore.text}">{Math.round(detail.stats.participationRate * 100) / 100}%</div>
                        </div>
                        <div class="p-3 rounded-lg" style="background: {$colorStore.primary}08;">
                          <div class="text-xs" style="color: {$colorStore.muted}">Peak hour</div>
                          <div class="font-bold" style="color: {$colorStore.text}">{detail.stats.peakVotingHour}:00 UTC</div>
                        </div>
                        <div class="p-3 rounded-lg" style="background: {$colorStore.primary}08;">
                          <div class="text-xs" style="color: {$colorStore.muted}">Created</div>
                          <div class="font-bold" style="color: {$colorStore.text}">{new Date(poll.createdAt).toLocaleDateString()}</div>
                        </div>
                      </div>
                    {/if}
                    <div class="flex flex-wrap gap-2">
                      {#if poll.isActive}
                        <button class="px-4 py-2 rounded-lg text-sm font-medium transition-all hover:scale-[1.02] min-h-[40px] disabled:opacity-50"
                                style="background: {$colorStore.secondary}20; color: {$colorStore.secondary}; border: 1px solid {$colorStore.secondary}30;"
                                disabled={saving} onclick={() => closePoll(poll)}>
                          <i class="fa-solid fa-lock mr-1"></i>Close poll
                        </button>
                      {/if}
                      <button class="px-4 py-2 rounded-lg text-sm font-medium transition-all hover:scale-[1.02] min-h-[40px] disabled:opacity-50"
                              style="background: #ef444415; color: #ef4444; border: 1px solid #ef444430;"
                              disabled={saving} onclick={() => deletePoll(poll)}>
                        <i class="fa-solid fa-trash mr-1"></i>Delete
                      </button>
                    </div>
                  </div>
                {/if}
              </div>
            {/each}
          </div>
        {/if}
      </div>
    </div>

  {:else if activeTab === 'create'}
    <div class="w-full" in:fade={{ duration: 200 }}>
      <form class=" rounded-2xl border p-6 md:p-8 shadow-2xl transition-all space-y-6"
            style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15, {$colorStore.gradientEnd}10); border-color: {$colorStore.primary}30;"
            onsubmit={(e) => { e.preventDefault(); submitDraft(); }}>
        <div class="flex items-center gap-3">
          <i class="fa-utility-duo fa-regular fa-circle-plus" style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary}; font-size: 20px;"></i>
          <h2 class="text-xl font-bold" style="color: {$colorStore.text}">New poll</h2>
        </div>

        <div>
          <label for="poll-question" class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">Question</label>
          <input id="poll-question" type="text" bind:value={draft.question} maxlength="300" placeholder="What should we do next?"
                 class="w-full p-3 rounded-xl border min-h-[44px]"
                 style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};">
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <span id="poll-type-label" class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">Poll type</span>
            <DiscordSelector type="custom" options={typeOptions} selected={draft.type} searchable={false} ariaLabelledby="poll-type-label"
                             onchange={(e) => { if (typeof e.selected === "string") draft.type = e.selected; }} />
          </div>
          <div>
            <span id="poll-channel-label" class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">Channel</span>
            <DiscordSelector type="channel" options={textChannels} selected={draft.channelId} placeholder="Select channel" ariaLabelledby="poll-channel-label"
                             onchange={(e) => { draft.channelId = typeof e.selected === "string" ? e.selected : null; }} />
          </div>
        </div>

        {#if !isYesNo}
          <div>
            <span class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">Options</span>
            <div class="space-y-2">
              {#each draft.options as _, i}
                <div class="flex gap-2" transition:slide>
                  <input type="text" bind:value={draft.options[i]} maxlength="100" placeholder={`Option ${i + 1}`} aria-label={`Option ${i + 1}`}
                         class="flex-1 p-3 rounded-xl border min-h-[44px]"
                         style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};">
                  <button type="button" class="px-3 rounded-xl min-h-[44px] min-w-[44px] disabled:opacity-30" aria-label="Remove option"
                          style="background: {$colorStore.muted}15; color: {$colorStore.muted};"
                          disabled={draft.options.length <= 2}
                          onclick={() => { draft.options = draft.options.filter((_, idx) => idx !== i); }}>
                    <i class="fa-solid fa-xmark"></i>
                  </button>
                </div>
              {/each}
            </div>
            {#if draft.options.length < 25}
              <button type="button" class="mt-2 px-4 py-2 rounded-lg text-sm font-medium transition-all hover:scale-[1.02] min-h-[40px]"
                      style="background: {$colorStore.primary}15; color: {$colorStore.primary};"
                      onclick={() => { draft.options = [...draft.options, ""]; }}>
                <i class="fa-solid fa-plus mr-1"></i>Add option
              </button>
            {/if}
          </div>
        {/if}

        {#if isRoleRestricted}
          <div>
            <span id="poll-roles-label" class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">Roles allowed to vote</span>
            <DiscordSelector type="role" options={roles} selected={draft.allowedRoles} multiple={true} placeholder="Select roles" ariaLabelledby="poll-roles-label"
                             onchange={(e) => { draft.allowedRoles = Array.isArray(e.selected) ? e.selected : []; }} />
          </div>
        {/if}

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label for="poll-duration" class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">Duration (minutes)</label>
            <input id="poll-duration" type="number" min="1" max="20160" bind:value={draft.durationMinutes} placeholder="Open until closed"
                   class="w-full p-3 rounded-xl border min-h-[44px]"
                   style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};">
          </div>
          <div>
            <label for="poll-schedule" class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">Schedule for later</label>
            <input id="poll-schedule" type="datetime-local" bind:value={draft.scheduleFor}
                   class="w-full p-3 rounded-xl border min-h-[44px]"
                   style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};">
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {#each [
            { key: "allowVoteChanges", label: "Allow changing votes" },
            { key: "showResults", label: "Show live results" },
            { key: "showProgressBars", label: "Show progress bars" }
          ] as opt}
            <label class="flex items-center gap-3 p-3 rounded-lg cursor-pointer min-h-[44px]" style="background: {$colorStore.primary}08; color: {$colorStore.text};">
              <input type="checkbox" bind:checked={draft[opt.key as "allowVoteChanges" | "showResults" | "showProgressBars"]} class="w-4 h-4 rounded" style="accent-color: {$colorStore.primary};">
              <span class="text-sm">{opt.label}</span>
            </label>
          {/each}
        </div>

        <div class="p-4 rounded-xl border space-y-3" style="background: {$colorStore.secondary}05; border-color: {$colorStore.secondary}20;">
          <label class="flex items-center gap-3 cursor-pointer min-h-[32px]" style="color: {$colorStore.text};">
            <input type="checkbox" bind:checked={draft.saveAsTemplate} class="w-4 h-4 rounded" style="accent-color: {$colorStore.secondary};">
            <span class="text-sm font-medium">Also save as a template</span>
          </label>
          {#if draft.saveAsTemplate}
            <input type="text" bind:value={draft.templateName} maxlength="100" placeholder="Template name" aria-label="Template name"
                   class="w-full p-3 rounded-xl border min-h-[44px]" transition:slide
                   style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};">
          {/if}
        </div>

        {#if draftError}
          <div class="p-3 rounded-lg flex items-center gap-2 text-sm" role="alert"
               style="background: #ef444420; border: 1px solid #ef444430; color: #ef4444;">
            <i class="fa-solid fa-circle-exclamation"></i>
            <span>{draftError}</span>
          </div>
        {/if}

        <div class="flex flex-col sm:flex-row gap-3">
          <button type="button" onclick={resetDraft}
                  class="px-6 py-3 rounded-xl font-medium transition-all hover:scale-[1.02] min-h-[44px]"
                  style="background: {$colorStore.muted}20; color: {$colorStore.muted};">
            Reset
          </button>
          <button type="submit" disabled={saving}
                  class="flex-1 px-6 py-3 rounded-xl font-medium transition-all hover:scale-[1.02] min-h-[44px] flex items-center justify-center gap-2 disabled:opacity-50"
                  style="background: {$colorStore.primary}20; color: {$colorStore.primary}; border: 1px solid {$colorStore.primary}30;">
            {#if saving}<i class="fa-solid fa-spinner fa-spin"></i>{:else}<i class="fa-solid {draft.scheduleFor ? 'fa-calendar-check' : 'fa-paper-plane'}"></i>{/if}
            {draft.scheduleFor ? "Schedule poll" : "Post poll"}
          </button>
        </div>
      </form>
    </div>

  {:else if activeTab === 'scheduled'}
    <div class="w-full" in:fade={{ duration: 200 }}>
      <div class=" rounded-2xl border p-6 md:p-8 shadow-2xl transition-all"
           style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15, {$colorStore.gradientEnd}10); border-color: {$colorStore.primary}30;">
        <div class="flex items-center gap-3 mb-6">
          <i class="fa-utility-duo fa-regular fa-calendar" style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary}; font-size: 20px;"></i>
          <h2 class="text-xl font-bold" style="color: {$colorStore.text}">Scheduled polls</h2>
        </div>
        {#if scheduled.filter(s => !s.isExecuted && !s.isCancelled).length === 0}
          <div class="text-center py-8">
            <i class="fa-utility-duo fa-regular fa-calendar" style="--fa-primary-color: {$colorStore.muted}; --fa-secondary-color: {$colorStore.muted}; font-size: 48px; opacity: 0.5; display: block; margin: 0 auto 16px;"></i>
            <p class="text-sm" style="color: {$colorStore.muted}">Nothing scheduled. Set a time on the Create tab to queue a poll.</p>
          </div>
        {:else}
          <div class="space-y-3">
            {#each scheduled.filter(s => !s.isExecuted && !s.isCancelled) as item (item.id)}
              <div class="flex flex-col sm:flex-row sm:items-center gap-3 p-4 rounded-xl border" style="background: {$colorStore.primary}05; border-color: {$colorStore.primary}20;">
                <div class="flex-1 min-w-0">
                  <div class="font-semibold break-words" style="color: {$colorStore.text}">{item.question}</div>
                  <div class="text-xs mt-1" style="color: {$colorStore.muted}">
                    #{channelName(item.channelId)} · {typeLabels[item.type] ?? "Poll"} · posts {formatDate(item.scheduledFor)}
                  </div>
                </div>
                <button class="px-4 py-2 rounded-lg text-sm font-medium transition-all hover:scale-[1.02] min-h-[40px]"
                        style="background: #ef444415; color: #ef4444; border: 1px solid #ef444430;"
                        onclick={() => cancelScheduled(item)}>
                  Cancel
                </button>
              </div>
            {/each}
          </div>
        {/if}
      </div>
    </div>

  {:else if activeTab === 'templates'}
    <div class="w-full" in:fade={{ duration: 200 }}>
      <div class=" rounded-2xl border p-6 md:p-8 shadow-2xl transition-all"
           style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15, {$colorStore.gradientEnd}10); border-color: {$colorStore.primary}30;">
        <div class="flex items-center gap-3 mb-6">
          <i class="fa-utility-duo fa-regular fa-copy" style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary}; font-size: 20px;"></i>
          <h2 class="text-xl font-bold" style="color: {$colorStore.text}">Templates ({templates.length})</h2>
        </div>
        {#if templates.length === 0}
          <div class="text-center py-8">
            <i class="fa-utility-duo fa-regular fa-copy" style="--fa-primary-color: {$colorStore.muted}; --fa-secondary-color: {$colorStore.muted}; font-size: 48px; opacity: 0.5; display: block; margin: 0 auto 16px;"></i>
            <p class="text-sm" style="color: {$colorStore.muted}">Tick "save as a template" when creating a poll to reuse it later.</p>
          </div>
        {:else}
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            {#each templates as template (template.id)}
              <div class="p-4 rounded-xl border flex flex-col gap-3" style="background: {$colorStore.primary}05; border-color: {$colorStore.primary}20;">
                <div>
                  <div class="font-semibold" style="color: {$colorStore.text}">{template.name}</div>
                  <div class="text-sm break-words" style="color: {$colorStore.muted}">{template.question}</div>
                </div>
                <div class="flex gap-2 mt-auto">
                  <button class="flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all hover:scale-[1.02] min-h-[40px]"
                          style="background: {$colorStore.primary}20; color: {$colorStore.primary}; border: 1px solid {$colorStore.primary}30;"
                          onclick={() => useTemplate(template)}>
                    <i class="fa-solid fa-wand-magic-sparkles mr-1"></i>Use
                  </button>
                  <button class="px-4 py-2 rounded-lg text-sm font-medium transition-all hover:scale-[1.02] min-h-[40px]"
                          style="background: #ef444415; color: #ef4444; border: 1px solid #ef444430;"
                          aria-label={`Delete template ${template.name}`}
                          onclick={() => deleteTemplate(template)}>
                    <i class="fa-solid fa-trash"></i>
                  </button>
                </div>
              </div>
            {/each}
          </div>
        {/if}
      </div>
    </div>

  {:else if activeTab === 'analytics'}
    <div class="w-full space-y-6" in:fade={{ duration: 200 }}>
      {#if analytics}
        <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6">
          <StatCard icon="fa-chart-simple" label="Polls this month" value={analytics.totalPolls} subtitle={`${analytics.activePolls} active`} iconColor="primary" animationDelay={0} />
          <StatCard icon="fa-circle-check" label="Votes cast" value={analytics.totalVotes} subtitle="last 30 days" iconColor="secondary" animationDelay={100} />
          <StatCard icon="fa-chart-pie" label="Avg votes per poll" value={analytics.averageVotesPerPoll} subtitle="engagement" iconColor="accent" animationDelay={200} />
          <StatCard icon="fa-star" label="Favourite type" value={typeLabels[analytics.mostPopularPollType] ?? "n/a"} subtitle="most created" iconColor="primary" animationDelay={300} />
        </div>
        {#if Object.keys(analytics.pollsCreatedByDay).length > 0}
          {@const entries = Object.entries(analytics.pollsCreatedByDay).sort(([a], [b]) => a.localeCompare(b))}
          {@const max = Math.max(1, ...entries.map(([, v]) => v))}
          <div class=" rounded-2xl border p-6 md:p-8 shadow-2xl transition-all"
               style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15, {$colorStore.gradientEnd}10); border-color: {$colorStore.primary}30;">
            <h2 class="text-xl font-bold mb-4" style="color: {$colorStore.text}">Polls created per day</h2>
            <div class="flex items-end gap-1 h-40 overflow-x-auto" role="img" aria-label="Polls created per day">
              {#each entries as [day, count]}
                <div class="flex-1 min-w-[8px] rounded-t-sm" title={`${new Date(day).toLocaleDateString()}: ${count}`}
                     style="height: {Math.max(4, (count / max) * 100)}%; background: {$colorStore.primary};"></div>
              {/each}
            </div>
          </div>
        {/if}
      {:else}
        <div class="text-center py-12">
          <i class="fa-utility-duo fa-regular fa-chart-simple" style="--fa-primary-color: {$colorStore.muted}; --fa-secondary-color: {$colorStore.muted}; font-size: 48px; opacity: 0.5; display: block; margin: 0 auto 16px;"></i>
          <p style="color: {$colorStore.muted}">Analytics appear once polls have been created.</p>
        </div>
      {/if}
    </div>
  {/if}
</DashboardPageLayout>
