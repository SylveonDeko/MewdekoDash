<!-- routes/dashboard/utility/+page.svelte -->
<script lang="ts">
  import { m } from "$lib/i18n";
  import { onMount, untrack } from "svelte";
  import { fade, fly, slide } from "svelte/transition";
  import { colorStore } from "$lib/stores/colorStore";
  import { currentGuild } from "$lib/stores/currentGuild";
  import { userStore } from "$lib/stores/userStore";
  import {
    AiProvider,
    clientApi,
    PunishmentAction,
    utilityApi,
    type AiConfigResponse,
    type AiModel,
    type AutoPublishChannel,
    type CommandAlias,
    type GuildQuote,
    type RoleMonitorConfig,
    type StreamRoleSettings
  } from "$lib/api/index.ts";
  import { logger } from "$lib/logger";
  import DashboardPageLayout from "$lib/components/layout/DashboardPageLayout.svelte";
  import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";
  import { requestConfirmation } from "$lib/stores/confirmationStore";

  let activeTab = $state("aliases");
  let message = $state("");
  let messageType: "success" | "error" | "info" = $state("info");
  let busy = $state(false);

  let textChannels: Array<{ id: string; name: string }> = $state([]);
  let newsChannels: Array<{ id: string; name: string }> = $state([]);
  let roles: Array<{ id: string; name: string; color?: number }> = $state([]);

  const tabs = $derived([
    { id: "aliases", label: m.utility.tabAliases(), icon: "fa-terminal" },
    { id: "quotes", label: m.common.quotes(), icon: "fa-quote-left" },
    { id: "autopublish", label: m.utility.tabAutopublish(), icon: "fa-bullhorn" },
    { id: "streamrole", label: m.utility.tabStreamrole(), icon: "fa-video" },
    { id: "ai", label: m.utility.tabAi(), icon: "fa-robot" },
    { id: "nsfw", label: m.utility.tabNsfw(), icon: "fa-eye-slash" },
    { id: "rolemonitor", label: m.utility.rmCardTitle(), icon: "fa-user-shield" }
  ]);

  function showMessage(text: string, type: "success" | "error" | "info") {
    message = text;
    messageType = type;
    setTimeout(() => { message = ""; }, 5000);
  }

  function userId(): bigint | null {
    return $userStore?.id ? BigInt($userStore.id) : null;
  }

  /** Runs an API call with shared busy and error handling */
  async function run(action: () => Promise<unknown>, failure: string): Promise<boolean> {
    busy = true;
    try {
      await action();
      return true;
    } catch (err: any) {
      logger.error(failure, err);
      showMessage(err?.message ? m.utility.errorWithDetail({ failure, detail: err.message }) : failure, "error");
      return false;
    } finally {
      busy = false;
    }
  }

  async function loadGuildData() {
    if (!$currentGuild?.id) return;
    try {
      const [channels, news, roleData] = await Promise.all([
        clientApi.getTextChannels($currentGuild.id).catch(() => []),
        clientApi.getChannelsByType($currentGuild.id, 5).catch(() => []),
        clientApi.getRoles($currentGuild.id).catch(() => [])
      ]);
      textChannels = (channels as any[]).map(c => ({ id: c.id.toString(), name: c.name }));
      newsChannels = (news as any[]).map(c => ({ id: c.id.toString(), name: c.name }));
      roles = (roleData as any[]).map(r => ({ id: r.id.toString(), name: r.name, color: r.color }));
    } catch (err) {
      logger.error("Failed to load guild data:", err);
    }
  }

  function roleName(id: bigint | string | null | undefined): string {
    if (!id) return m.common.noneLower();
    return roles.find(r => r.id === id.toString())?.name ?? id.toString();
  }

  // ============================================
  // Aliases
  // ============================================
  let aliases: CommandAlias[] = $state([]);
  let aliasTrigger = $state("");
  let aliasMapping = $state("");
  let aliasSearch = $state("");
  let filteredAliases = $derived(aliases.filter(a => !aliasSearch.trim() || a.trigger.includes(aliasSearch.trim().toLowerCase()) || a.mapping.toLowerCase().includes(aliasSearch.trim().toLowerCase())));

  async function loadAliases() {
    if (!$currentGuild?.id) return;
    try {
      aliases = await utilityApi.getAliases($currentGuild.id);
    } catch (err) {
      logger.error("Failed to load aliases:", err);
    }
  }

  async function addAlias() {
    if (!$currentGuild?.id || !aliasTrigger.trim() || !aliasMapping.trim()) return;
    if (await run(() => utilityApi.addAlias($currentGuild!.id, aliasTrigger.trim(), aliasMapping.trim()), m.utility.aliasesAddFailed())) {
      aliasTrigger = "";
      aliasMapping = "";
      await loadAliases();
    }
  }

  async function removeAlias(trigger: string) {
    if (!$currentGuild?.id) return;
    if (await run(() => utilityApi.removeAlias($currentGuild!.id, trigger), m.utility.aliasesRemoveFailed())) await loadAliases();
  }

  async function clearAliases() {
    if (!$currentGuild?.id) return;
    if (!(await requestConfirmation({ message: m.utility.aliasesClearConfirm({ count: aliases.length }), confirmText: m.common.clearAll() }))) return;
    if (await run(() => utilityApi.clearAliases($currentGuild!.id), m.utility.aliasesClearFailed())) await loadAliases();
  }

  // ============================================
  // Quotes
  // ============================================
  let quotes: GuildQuote[] = $state([]);
  let quoteTotal = $state(0);
  let quotePage = $state(1);
  const quotePageSize = 25;
  let quoteSearch = $state("");
  let quoteKeyword = $state("");
  let quoteText = $state("");
  let editingQuote: GuildQuote | null = $state(null);
  let editQuoteKeyword = $state("");
  let editQuoteText = $state("");

  async function loadQuotes(page = 1) {
    if (!$currentGuild?.id) return;
    try {
      const result = await utilityApi.getQuotes($currentGuild.id, quoteSearch, page, quotePageSize);
      quotes = result.quotes;
      quoteTotal = result.total;
      quotePage = result.page;
    } catch (err) {
      logger.error("Failed to load quotes:", err);
    }
  }

  async function addQuote() {
    const uid = userId();
    if (!$currentGuild?.id || !uid || !quoteKeyword.trim() || !quoteText.trim()) return;
    if (await run(() => utilityApi.addQuote($currentGuild!.id, quoteKeyword.trim(), quoteText.trim(), uid), m.utility.quotesAddFailed())) {
      quoteKeyword = "";
      quoteText = "";
      await loadQuotes(1);
    }
  }

  async function saveQuoteEdit() {
    if (!$currentGuild?.id || !editingQuote) return;
    const id = editingQuote.id;
    if (await run(() => utilityApi.updateQuote($currentGuild!.id, id, { keyword: editQuoteKeyword.trim() || null, text: editQuoteText.trim() || null }), m.utility.quotesUpdateFailed())) {
      editingQuote = null;
      await loadQuotes(quotePage);
    }
  }

  async function deleteQuote(quote: GuildQuote) {
    if (!$currentGuild?.id) return;
    if (!(await requestConfirmation({ message: m.utility.quotesDeleteConfirm({ id: quote.id, keyword: quote.keyword }), confirmText: m.common.delete() }))) return;
    if (await run(() => utilityApi.deleteQuote($currentGuild!.id, quote.id), m.utility.quotesDeleteFailed())) await loadQuotes(quotePage);
  }

  // ============================================
  // Auto publish
  // ============================================
  let autoPublish: AutoPublishChannel[] = $state([]);
  let publishChannelPick = $state<string | null>(null);
  let publishUserDraft = $state<Record<string, string>>({});
  let publishWordDraft = $state<Record<string, string>>({});

  async function loadAutoPublish() {
    if (!$currentGuild?.id) return;
    try {
      autoPublish = await utilityApi.getAutoPublish($currentGuild.id);
    } catch (err) {
      logger.error("Failed to load auto publish:", err);
    }
  }

  async function addAutoPublish(channelId: string | null) {
    if (!$currentGuild?.id || !channelId) return;
    if (await run(() => utilityApi.addAutoPublish($currentGuild!.id, BigInt(channelId)), m.utility.autopublishEnableFailed())) {
      publishChannelPick = null;
      await loadAutoPublish();
    }
  }

  async function removeAutoPublish(channelId: bigint) {
    if (!$currentGuild?.id) return;
    if (await run(() => utilityApi.removeAutoPublish($currentGuild!.id, channelId), m.utility.autopublishDisableFailed())) await loadAutoPublish();
  }

  async function addPublishUser(channelId: bigint) {
    const draft = (publishUserDraft[channelId.toString()] ?? "").trim();
    if (!$currentGuild?.id || !/^\d{15,22}$/.test(draft)) {
      showMessage(m.common.invalidUserId(), "error");
      return;
    }
    if (await run(() => utilityApi.blacklistPublishUser($currentGuild!.id, channelId, BigInt(draft)), m.utility.autopublishBlacklistUserFailed())) {
      publishUserDraft[channelId.toString()] = "";
      await loadAutoPublish();
    }
  }

  async function removePublishUser(channelId: bigint, uid: bigint) {
    if (!$currentGuild?.id) return;
    if (await run(() => utilityApi.unblacklistPublishUser($currentGuild!.id, channelId, uid), m.utility.autopublishRemoveUserFailed())) await loadAutoPublish();
  }

  async function addPublishWord(channelId: bigint) {
    const draft = (publishWordDraft[channelId.toString()] ?? "").trim();
    if (!$currentGuild?.id || !draft) return;
    if (await run(() => utilityApi.blacklistPublishWord($currentGuild!.id, channelId, draft), m.utility.autopublishBlacklistWordFailed())) {
      publishWordDraft[channelId.toString()] = "";
      await loadAutoPublish();
    }
  }

  async function removePublishWord(channelId: bigint, word: string) {
    if (!$currentGuild?.id) return;
    if (await run(() => utilityApi.unblacklistPublishWord($currentGuild!.id, channelId, word), m.utility.autopublishRemoveWordFailed())) await loadAutoPublish();
  }

  // ============================================
  // Stream role
  // ============================================
  let streamRole: StreamRoleSettings | null = $state(null);
  let streamFromRole = $state<string | null>(null);
  let streamAddRole = $state<string | null>(null);
  let streamKeyword = $state("");
  let streamListUser = $state("");
  let streamListType = $state<"whitelist" | "blacklist">("whitelist");

  async function loadStreamRole() {
    if (!$currentGuild?.id) return;
    try {
      streamRole = await utilityApi.getStreamRole($currentGuild.id);
      streamFromRole = streamRole.fromRoleId && streamRole.fromRoleId.toString() !== "0" ? streamRole.fromRoleId.toString() : null;
      streamAddRole = streamRole.addRoleId && streamRole.addRoleId.toString() !== "0" ? streamRole.addRoleId.toString() : null;
      streamKeyword = streamRole.keyword ?? "";
    } catch (err) {
      logger.error("Failed to load stream role:", err);
    }
  }

  async function saveStreamRole() {
    if (!$currentGuild?.id || !streamFromRole || !streamAddRole) {
      showMessage(m.utility.streamrolePickBoth(), "error");
      return;
    }
    if (await run(() => utilityApi.setStreamRole($currentGuild!.id, BigInt(streamFromRole!), BigInt(streamAddRole!)), m.utility.streamroleEnableFailed())) await loadStreamRole();
  }

  async function stopStreamRole() {
    if (!$currentGuild?.id) return;
    if (!(await requestConfirmation({ message: m.utility.streamroleDisableConfirm(), confirmText: m.common.disable(), variant: "warning" }))) return;
    if (await run(() => utilityApi.stopStreamRole($currentGuild!.id), m.utility.streamroleDisableFailed())) await loadStreamRole();
  }

  async function saveStreamKeyword() {
    if (!$currentGuild?.id) return;
    if (await run(() => utilityApi.setStreamRoleKeyword($currentGuild!.id, streamKeyword.trim() || null), m.utility.streamroleKeywordFailed())) await loadStreamRole();
  }

  async function addStreamListUser() {
    if (!$currentGuild?.id || !/^\d{15,22}$/.test(streamListUser.trim())) {
      showMessage(m.common.invalidUserId(), "error");
      return;
    }
    if (await run(() => utilityApi.addStreamRoleListUser($currentGuild!.id, streamListType, BigInt(streamListUser.trim())), m.utility.streamroleListFailed())) {
      streamListUser = "";
      await loadStreamRole();
    }
  }

  async function removeStreamListUser(list: "whitelist" | "blacklist", uid: bigint) {
    if (!$currentGuild?.id) return;
    if (await run(() => utilityApi.removeStreamRoleListUser($currentGuild!.id, list, uid), m.utility.streamroleListFailed())) await loadStreamRole();
  }

  // ============================================
  // AI assistant
  // ============================================
  let ai: AiConfigResponse | null = $state(null);
  let aiForm = $state({ enabled: false, channelId: null as string | null, provider: AiProvider.OpenAi.toString(), model: "", systemPrompt: "", webSearchEnabled: false, hideWebSearchMessages: true, apiKey: "", webhookUrl: "" });
  let aiModels: AiModel[] = $state([]);
  let aiModelsLoading = $state(false);

  const providerOptions = [
    { id: AiProvider.OpenAi.toString(), name: "OpenAI" },
    { id: AiProvider.Claude.toString(), name: "Claude (Anthropic)" },
    { id: AiProvider.Groq.toString(), name: "Groq" }
  ];

  async function loadAi() {
    if (!$currentGuild?.id) return;
    try {
      ai = await utilityApi.getAiConfig($currentGuild.id);
      aiForm = {
        enabled: ai.enabled,
        channelId: ai.channelId && ai.channelId.toString() !== "0" ? ai.channelId.toString() : null,
        provider: ai.provider.toString(),
        model: ai.model ?? "",
        systemPrompt: ai.systemPrompt ?? "",
        webSearchEnabled: ai.webSearchEnabled,
        hideWebSearchMessages: ai.hideWebSearchMessages,
        apiKey: "",
        webhookUrl: ""
      };
    } catch (err) {
      logger.error("Failed to load AI config:", err);
    }
  }

  async function saveAi() {
    if (!$currentGuild?.id) return;
    if (aiForm.enabled && !aiForm.channelId) {
      showMessage(m.utility.aiChannelRequired(), "error");
      return;
    }
    const ok = await run(() => utilityApi.updateAiConfig($currentGuild!.id, {
      enabled: aiForm.enabled,
      channelId: aiForm.channelId ? BigInt(aiForm.channelId) : 0n,
      provider: parseInt(aiForm.provider),
      model: aiForm.model,
      systemPrompt: aiForm.systemPrompt,
      webSearchEnabled: aiForm.webSearchEnabled,
      hideWebSearchMessages: aiForm.hideWebSearchMessages,
      apiKey: aiForm.apiKey.trim() || null,
      webhookUrl: aiForm.webhookUrl.trim() ? aiForm.webhookUrl.trim() : null
    }), m.utility.aiSaveFailed());
    if (ok) {
      showMessage(m.utility.aiSaved(), "success");
      await loadAi();
    }
  }

  async function clearAiKey() {
    if (!$currentGuild?.id) return;
    if (!(await requestConfirmation({ message: m.utility.aiRemoveKeyConfirm(), confirmText: m.utility.aiRemoveKeyConfirmButton() }))) return;
    if (await run(() => utilityApi.updateAiConfig($currentGuild!.id, { clearApiKey: true, enabled: false }), m.utility.aiRemoveKeyFailed())) await loadAi();
  }

  async function loadAiModels() {
    if (!$currentGuild?.id) return;
    aiModelsLoading = true;
    try {
      aiModels = await utilityApi.getAiModels($currentGuild.id, parseInt(aiForm.provider));
    } catch (err: any) {
      logger.error("Failed to load AI models:", err);
      showMessage(err?.message || m.utility.aiModelsFailed(), "error");
      aiModels = [];
    } finally {
      aiModelsLoading = false;
    }
  }

  // ============================================
  // NSFW blacklist
  // ============================================
  let nsfwTags: string[] = $state([]);
  let nsfwDraft = $state("");

  async function loadNsfw() {
    if (!$currentGuild?.id) return;
    try {
      nsfwTags = (await utilityApi.getNsfwBlacklist($currentGuild.id)).slice().sort();
    } catch (err) {
      logger.error("Failed to load NSFW blacklist:", err);
    }
  }

  async function toggleNsfwTag(tag: string) {
    const clean = tag.trim().toLowerCase();
    if (!$currentGuild?.id || !clean) return;
    if (await run(() => utilityApi.toggleNsfwTag($currentGuild!.id, clean), m.common.failedToUpdateBlacklist())) {
      nsfwDraft = "";
      await loadNsfw();
    }
  }

  // ============================================
  // Role monitor
  // ============================================
  let roleMonitor: RoleMonitorConfig | null = $state(null);
  let rmDefault = $state(PunishmentAction.None.toString());
  let rmRolePick = $state<string | null>(null);
  let rmRolePunish = $state<string | null>(null);
  let rmPermPick = $state<string | null>(null);
  let rmPermPunish = $state<string | null>(null);
  let rmWhitelistRole = $state<string | null>(null);
  let rmWhitelistUser = $state("");

  const rmPunishmentOptions = $derived([
    { id: PunishmentAction.None.toString(), name: m.utility.rmPunishRevert() },
    { id: PunishmentAction.Warn.toString(), name: m.common.warn() },
    { id: PunishmentAction.RemoveRoles.toString(), name: m.common.removeAllRoles() },
    { id: PunishmentAction.Mute.toString(), name: m.common.actionMute() },
    { id: PunishmentAction.Timeout.toString(), name: m.common.timeout() },
    { id: PunishmentAction.Kick.toString(), name: m.common.actionKick() },
    { id: PunishmentAction.Ban.toString(), name: m.common.actionBan() }
  ]);
  const rmOverrideOptions = $derived([{ id: "default", name: m.utility.rmOverrideDefault() }, ...rmPunishmentOptions]);

  /** Dangerous Discord permissions worth monitoring, as GuildPermission bit values */
  const guildPermissionOptions = $derived([
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
    return rmPunishmentOptions.find(o => o.id === value.toString())?.name ?? PunishmentAction[value] ?? value.toString();
  }

  async function loadRoleMonitor() {
    if (!$currentGuild?.id) return;
    try {
      roleMonitor = await utilityApi.getRoleMonitor($currentGuild.id);
      rmDefault = roleMonitor.defaultPunishment.toString();
    } catch (err) {
      logger.error("Failed to load role monitor:", err);
    }
  }

  async function saveRmDefault(value: string | null) {
    if (!$currentGuild?.id || !value) return;
    rmDefault = value;
    if (await run(() => utilityApi.setRoleMonitorDefault($currentGuild!.id, parseInt(value)), m.utility.rmDefaultFailed())) await loadRoleMonitor();
  }

  async function addRmRole() {
    if (!$currentGuild?.id || !rmRolePick) return;
    const punish = rmRolePunish && rmRolePunish !== "default" ? parseInt(rmRolePunish) : null;
    if (await run(() => utilityApi.addBlacklistedRole($currentGuild!.id, BigInt(rmRolePick!), punish), m.utility.rmBlacklistRoleFailed())) {
      rmRolePick = null;
      rmRolePunish = null;
      await loadRoleMonitor();
    }
  }

  async function addRmPermission() {
    if (!$currentGuild?.id || !rmPermPick) return;
    const punish = rmPermPunish && rmPermPunish !== "default" ? parseInt(rmPermPunish) : null;
    if (await run(() => utilityApi.addBlacklistedPermission($currentGuild!.id, BigInt(rmPermPick!), punish), m.utility.rmBlacklistPermissionFailed())) {
      rmPermPick = null;
      rmPermPunish = null;
      await loadRoleMonitor();
    }
  }

  async function addRmWhitelistUser() {
    if (!$currentGuild?.id || !/^\d{15,22}$/.test(rmWhitelistUser.trim())) {
      showMessage(m.common.invalidUserId(), "error");
      return;
    }
    if (await run(() => utilityApi.whitelistUser($currentGuild!.id, BigInt(rmWhitelistUser.trim())), m.utility.rmWhitelistUserFailed())) {
      rmWhitelistUser = "";
      await loadRoleMonitor();
    }
  }

  async function rmAction(action: () => Promise<unknown>, failure: string) {
    if (await run(action, failure)) await loadRoleMonitor();
  }

  // ============================================
  // Tab loading
  // ============================================
  let loadedTabs = $state(new Set<string>());

  async function loadTab(tab: string, force = false) {
    if (!$currentGuild?.id) return;
    if (loadedTabs.has(tab) && !force) return;
    switch (tab) {
      case "aliases": await loadAliases(); break;
      case "quotes": await loadQuotes(1); break;
      case "autopublish": await loadAutoPublish(); break;
      case "streamrole": await loadStreamRole(); break;
      case "ai": await loadAi(); break;
      case "nsfw": await loadNsfw(); break;
      case "rolemonitor": await loadRoleMonitor(); break;
    }
    loadedTabs = new Set([...loadedTabs, tab]);
  }

  onMount(loadGuildData);

  $effect(() => {
    const guildId = $currentGuild?.id;
    if (!guildId) return;
    untrack(() => {
      loadedTabs = new Set();
      loadGuildData();
      loadTab(activeTab, true);
    });
  });

  $effect(() => {
    const tab = activeTab;
    if (!$currentGuild?.id) return;
    untrack(() => loadTab(tab));
  });

  let actionButtons = $derived([
    { label: m.common.refresh(), icon: "fa-arrows-rotate", action: () => loadTab(activeTab, true), loading: busy }
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

{#snippet card(title: string, icon: string, subtitle: string, body: import("svelte").Snippet)}
  <div class=" rounded-2xl border p-6 md:p-8 shadow-2xl transition-all"
       style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15, {$colorStore.gradientEnd}10); border-color: {$colorStore.primary}30;">
    <div class="flex items-center gap-3 mb-1">
      <i class="fa-utility-duo fa-regular {icon}" style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary}; font-size: 20px;"></i>
      <h2 class="text-xl font-bold" style="color: {$colorStore.text}">{title}</h2>
    </div>
    <p class="text-sm mb-6" style="color: {$colorStore.muted}">{subtitle}</p>
    {@render body()}
  </div>
{/snippet}

{#snippet chip(label: string, onRemove: () => void, ariaLabel: string)}
  <span class="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium"
        style="background: {$colorStore.primary}15; color: {$colorStore.text};" transition:fade>
    {label}
    <button class="rounded-sm hover:opacity-80 min-h-[24px] min-w-[24px] disabled:opacity-30" aria-label={ariaLabel} disabled={busy} onclick={onRemove}>
      <i class="fa-solid fa-xmark" style="color: {$colorStore.muted}; font-size: 12px;"></i>
    </button>
  </span>
{/snippet}

<DashboardPageLayout
  {actionButtons}
  bind:activeTab
  guildName={$currentGuild?.name || m.common.dashboard()}
  icon="fa-wrench"
  statusMessages={statusMessageContent}
  subtitle={m.utility.pageSubtitle()}
  {tabs}
  title={m.features.utilityName()}
>
  {#if activeTab === 'aliases'}
    <div class="w-full" in:fade={{ duration: 200 }}>
      {#snippet aliasesBody()}
        <form class="grid grid-cols-1 md:grid-cols-[1fr_2fr_auto] gap-3 mb-6" onsubmit={(e) => { e.preventDefault(); addAlias(); }}>
          <input type="text" bind:value={aliasTrigger} placeholder={m.utility.aliasesTriggerPlaceholder()} aria-label={m.utility.aliasesTriggerAria()} maxlength="50"
                 class="p-3 rounded-xl border min-h-[44px]" style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};">
          <input type="text" bind:value={aliasMapping} placeholder={m.utility.aliasesMappingPlaceholder()} aria-label={m.utility.aliasesMappingAria()} maxlength="500"
                 class="p-3 rounded-xl border min-h-[44px]" style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};">
          <button type="submit" disabled={busy || !aliasTrigger.trim() || !aliasMapping.trim()}
                  class="px-6 py-3 rounded-xl font-medium transition-all hover:scale-[1.02] flex items-center justify-center gap-2 min-h-[44px] disabled:opacity-50"
                  style="background: {$colorStore.primary}20; color: {$colorStore.primary}; border: 1px solid {$colorStore.primary}30;">
            <i class="fa-solid fa-plus"></i>{m.common.add()}
          </button>
        </form>
        {#if aliases.length > 8}
          <input type="text" bind:value={aliasSearch} placeholder={m.utility.aliasesSearch()} aria-label={m.utility.aliasesSearch()}
                 class="w-full p-3 rounded-xl border min-h-[44px] mb-4" style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};">
        {/if}
        {#if aliases.length === 0}
          <p class="text-sm text-center py-8" style="color: {$colorStore.muted}">{m.utility.aliasesEmpty()}</p>
        {:else}
          <div class="space-y-2">
            {#each filteredAliases as alias (alias.id)}
              <div class="flex items-center gap-3 p-3 rounded-lg" style="background: {$colorStore.primary}05;" transition:slide>
                <code class="px-2 py-1 rounded-sm text-sm font-mono shrink-0" style="background: {$colorStore.primary}15; color: {$colorStore.primary};">{alias.trigger}</code>
                <i class="fa-solid fa-arrow-right shrink-0" style="color: {$colorStore.muted}; font-size: 12px;"></i>
                <span class="flex-1 min-w-0 text-sm font-mono truncate" style="color: {$colorStore.text}">{alias.mapping}</span>
                <button class="p-2 rounded-lg min-h-[36px] min-w-[36px] disabled:opacity-50" style="background: #ef444415; color: #ef4444;" aria-label={m.utility.aliasesRemoveAria({ trigger: alias.trigger })} disabled={busy} onclick={() => removeAlias(alias.trigger)}>
                  <i class="fa-solid fa-trash" style="font-size: 12px;"></i>
                </button>
              </div>
            {/each}
          </div>
          <button class="mt-4 px-4 py-2 rounded-xl text-sm font-medium transition-all hover:scale-[1.02] min-h-[44px] disabled:opacity-50"
                  style="background: #ef444415; color: #ef4444; border: 1px solid #ef444430;" disabled={busy} onclick={clearAliases}>
            <i class="fa-solid fa-trash mr-1"></i>{m.utility.aliasesClearAll()}
          </button>
        {/if}
      {/snippet}
      {@render card(m.utility.aliasesCardTitle(), "fa-code", m.utility.aliasesCardSubtitle(), aliasesBody)}
    </div>

  {:else if activeTab === 'quotes'}
    <div class="w-full" in:fade={{ duration: 200 }}>
      {#snippet quotesBody()}
        <form class="grid grid-cols-1 md:grid-cols-[1fr_3fr_auto] gap-3 mb-6" onsubmit={(e) => { e.preventDefault(); addQuote(); }}>
          <input type="text" bind:value={quoteKeyword} placeholder={m.utility.quotesEditKeywordAria()} aria-label={m.utility.quotesKeywordAria()} maxlength="50"
                 class="p-3 rounded-xl border min-h-[44px]" style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};">
          <input type="text" bind:value={quoteText} placeholder={m.common.quoteText()} aria-label={m.common.quoteText()} maxlength="2000"
                 class="p-3 rounded-xl border min-h-[44px]" style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};">
          <button type="submit" disabled={busy || !quoteKeyword.trim() || !quoteText.trim()}
                  class="px-6 py-3 rounded-xl font-medium transition-all hover:scale-[1.02] flex items-center justify-center gap-2 min-h-[44px] disabled:opacity-50"
                  style="background: {$colorStore.primary}20; color: {$colorStore.primary}; border: 1px solid {$colorStore.primary}30;">
            <i class="fa-solid fa-plus"></i>{m.common.add()}
          </button>
        </form>
        <form class="flex gap-2 mb-4" onsubmit={(e) => { e.preventDefault(); loadQuotes(1); }}>
          <input type="text" bind:value={quoteSearch} placeholder={m.utility.quotesSearchPlaceholder()} aria-label={m.utility.quotesSearchAria()}
                 class="flex-1 p-3 rounded-xl border min-h-[44px]" style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};">
          <button type="submit" class="px-4 py-3 rounded-xl min-h-[44px]" style="background: {$colorStore.primary}20; color: {$colorStore.primary};" aria-label={m.common.search()}>
            <i class="fa-solid fa-magnifying-glass"></i>
          </button>
        </form>
        {#if quotes.length === 0}
          <p class="text-sm text-center py-8" style="color: {$colorStore.muted}">{quoteSearch ? m.utility.quotesEmptySearch() : m.utility.quotesEmpty()}</p>
        {:else}
          <div class="space-y-2">
            {#each quotes as quote (quote.id)}
              <div class="p-3 rounded-lg" style="background: {$colorStore.primary}05;" transition:slide>
                {#if editingQuote?.id === quote.id}
                  <form class="grid grid-cols-1 md:grid-cols-[1fr_3fr_auto_auto] gap-2" onsubmit={(e) => { e.preventDefault(); saveQuoteEdit(); }}>
                    <input type="text" bind:value={editQuoteKeyword} aria-label={m.utility.quotesEditKeywordAria()} class="p-2 rounded-lg border min-h-[40px]" style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};">
                    <input type="text" bind:value={editQuoteText} aria-label={m.common.text()} class="p-2 rounded-lg border min-h-[40px]" style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};">
                    <button type="submit" disabled={busy} class="px-3 py-2 rounded-lg text-sm min-h-[40px] disabled:opacity-50" style="background: {$colorStore.primary}20; color: {$colorStore.primary};">{m.common.save()}</button>
                    <button type="button" class="px-3 py-2 rounded-lg text-sm min-h-[40px]" style="background: {$colorStore.muted}20; color: {$colorStore.muted};" onclick={() => editingQuote = null}>{m.common.cancel()}</button>
                  </form>
                {:else}
                  <div class="flex items-start gap-3">
                    <div class="flex-1 min-w-0">
                      <div class="flex flex-wrap items-center gap-2 mb-1">
                        <code class="px-2 py-0.5 rounded-sm text-xs font-mono" style="background: {$colorStore.primary}15; color: {$colorStore.primary};">{quote.keyword}</code>
                        <span class="text-xs" style="color: {$colorStore.muted}">{quote.useCount === 1 ? m.utility.quotesMetaOne({ id: quote.id, author: quote.authorName, count: quote.useCount }) : m.utility.quotesMetaOther({ id: quote.id, author: quote.authorName, count: quote.useCount })}</span>
                      </div>
                      <p class="text-sm break-words whitespace-pre-wrap" style="color: {$colorStore.text}">{quote.text}</p>
                    </div>
                    <div class="flex gap-1 shrink-0">
                      <button class="p-2 rounded-lg min-h-[36px] min-w-[36px]" style="background: {$colorStore.primary}15; color: {$colorStore.primary};" aria-label={m.utility.quotesEditAria()}
                              onclick={() => { editingQuote = quote; editQuoteKeyword = quote.keyword; editQuoteText = quote.text; }}>
                        <i class="fa-solid fa-pen" style="font-size: 12px;"></i>
                      </button>
                      <button class="p-2 rounded-lg min-h-[36px] min-w-[36px] disabled:opacity-50" style="background: #ef444415; color: #ef4444;" aria-label={m.utility.quotesDeleteAria()} disabled={busy} onclick={() => deleteQuote(quote)}>
                        <i class="fa-solid fa-trash" style="font-size: 12px;"></i>
                      </button>
                    </div>
                  </div>
                {/if}
              </div>
            {/each}
          </div>
          {#if quoteTotal > quotePageSize}
            <div class="flex justify-center gap-2 mt-4">
              <button class="px-4 py-2 rounded-lg text-sm min-h-[40px] disabled:opacity-40" style="background: {$colorStore.primary}20; color: {$colorStore.text};" disabled={quotePage <= 1} onclick={() => loadQuotes(quotePage - 1)}>{m.common.previous()}</button>
              <span class="px-3 py-2 text-sm" style="color: {$colorStore.muted}">{m.common.pageOfTotal({ page: quotePage, total: Math.ceil(quoteTotal / quotePageSize) })}</span>
              <button class="px-4 py-2 rounded-lg text-sm min-h-[40px] disabled:opacity-40" style="background: {$colorStore.primary}20; color: {$colorStore.text};" disabled={quotePage * quotePageSize >= quoteTotal} onclick={() => loadQuotes(quotePage + 1)}>{m.common.next()}</button>
            </div>
          {/if}
        {/if}
      {/snippet}
      {@render card(m.utility.quotesCardTitle({ count: quoteTotal }), "fa-comment", m.utility.quotesCardSubtitle(), quotesBody)}
    </div>

  {:else if activeTab === 'autopublish'}
    <div class="w-full" in:fade={{ duration: 200 }}>
      {#snippet autoPublishBody()}
        <div class="mb-6">
          <span id="publish-channel-label" class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">{m.utility.autopublishAddChannel()}</span>
          <DiscordSelector type="channel" options={newsChannels.filter(c => !autoPublish.some(a => a.channelId.toString() === c.id))} selected={publishChannelPick}
                           placeholder={newsChannels.length ? m.utility.autopublishChannelPlaceholder() : m.utility.autopublishChannelNone()}
                           ariaLabelledby="publish-channel-label" disabled={busy || newsChannels.length === 0}
                           onchange={(e) => addAutoPublish(typeof e.selected === "string" ? e.selected : null)} />
        </div>
        {#if autoPublish.length === 0}
          <p class="text-sm text-center py-8" style="color: {$colorStore.muted}">{m.utility.autopublishEmpty()}</p>
        {:else}
          <div class="space-y-4">
            {#each autoPublish as entry (entry.channelId.toString())}
              <div class="p-4 rounded-xl border" style="background: {$colorStore.primary}05; border-color: {$colorStore.primary}20;" transition:slide>
                <div class="flex items-center justify-between gap-3 mb-3">
                  <div class="font-medium" style="color: {$colorStore.text}"><i class="fa-solid fa-bullhorn mr-2" style="color: {$colorStore.primary};"></i>#{entry.channelName ?? entry.channelId}</div>
                  <button class="px-3 py-2 rounded-lg text-sm min-h-[40px] disabled:opacity-50" style="background: #ef444415; color: #ef4444; border: 1px solid #ef444430;" disabled={busy} onclick={() => removeAutoPublish(entry.channelId)}>{m.common.disable()}</button>
                </div>
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div>
                    <div class="text-xs font-medium mb-2" style="color: {$colorStore.muted}">{m.utility.autopublishSkipUsers()}</div>
                    <form class="flex gap-2 mb-2" onsubmit={(e) => { e.preventDefault(); addPublishUser(entry.channelId); }}>
                      <input type="text" inputmode="numeric" bind:value={publishUserDraft[entry.channelId.toString()]} placeholder={m.common.userId()} aria-label={m.utility.autopublishUserAria()}
                             class="flex-1 p-2 rounded-lg border min-h-[40px] text-sm" style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};">
                      <button type="submit" disabled={busy} class="px-3 py-2 rounded-lg text-sm min-h-[40px] disabled:opacity-50" style="background: {$colorStore.primary}20; color: {$colorStore.primary};">{m.common.add()}</button>
                    </form>
                    <div class="flex flex-wrap gap-2">
                      {#each entry.blacklistedUsers as uid (uid.toString())}
                        {@render chip(uid.toString(), () => removePublishUser(entry.channelId, uid), m.utility.autopublishUnskipUserAria({ user: uid.toString() }))}
                      {/each}
                    </div>
                  </div>
                  <div>
                    <div class="text-xs font-medium mb-2" style="color: {$colorStore.muted}">{m.utility.autopublishSkipWords()}</div>
                    <form class="flex gap-2 mb-2" onsubmit={(e) => { e.preventDefault(); addPublishWord(entry.channelId); }}>
                      <input type="text" bind:value={publishWordDraft[entry.channelId.toString()]} placeholder={m.common.word()} aria-label={m.utility.autopublishWordAria()}
                             class="flex-1 p-2 rounded-lg border min-h-[40px] text-sm" style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};">
                      <button type="submit" disabled={busy} class="px-3 py-2 rounded-lg text-sm min-h-[40px] disabled:opacity-50" style="background: {$colorStore.primary}20; color: {$colorStore.primary};">{m.common.add()}</button>
                    </form>
                    <div class="flex flex-wrap gap-2">
                      {#each entry.blacklistedWords as word (word)}
                        {@render chip(word, () => removePublishWord(entry.channelId, word), m.utility.autopublishUnskipWordAria({ word }))}
                      {/each}
                    </div>
                  </div>
                </div>
              </div>
            {/each}
          </div>
        {/if}
      {/snippet}
      {@render card(m.utility.tabAutopublish(), "fa-newspaper", m.utility.autopublishCardSubtitle(), autoPublishBody)}
    </div>

  {:else if activeTab === 'streamrole'}
    <div class="w-full space-y-6" in:fade={{ duration: 200 }}>
      {#snippet streamRoleBody()}
        {#if streamRole}
          <div class="flex items-center gap-2 mb-4">
            <span class="px-3 py-1 rounded-full text-xs font-medium" style="background: {streamRole.enabled ? '#10b98120' : $colorStore.muted + '20'}; color: {streamRole.enabled ? '#10b981' : $colorStore.muted};">
              {streamRole.enabled ? m.common.enabled() : m.common.disabled()}
            </span>
            {#if streamRole.enabled}
              <span class="text-sm" style="color: {$colorStore.muted}">{m.utility.streamroleSummary({ from: roleName(streamRole.fromRoleId), to: roleName(streamRole.addRoleId) })}</span>
            {/if}
          </div>
        {/if}
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <span id="stream-from-label" class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">{m.utility.streamroleEligible()}</span>
            <DiscordSelector type="role" options={roles} selected={streamFromRole} placeholder={m.utility.streamroleEligiblePlaceholder()} ariaLabelledby="stream-from-label"
                             onchange={(e) => { streamFromRole = typeof e.selected === "string" ? e.selected : null; }} />
          </div>
          <div>
            <span id="stream-add-label" class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">{m.utility.streamroleAdded()}</span>
            <DiscordSelector type="role" options={roles} selected={streamAddRole} placeholder={m.common.roleToAdd()} ariaLabelledby="stream-add-label"
                             onchange={(e) => { streamAddRole = typeof e.selected === "string" ? e.selected : null; }} />
          </div>
        </div>
        <div class="flex flex-wrap gap-3 mb-6">
          <button class="px-6 py-3 rounded-xl font-medium transition-all hover:scale-[1.02] min-h-[44px] disabled:opacity-50" style="background: {$colorStore.primary}20; color: {$colorStore.primary}; border: 1px solid {$colorStore.primary}30;" disabled={busy || !streamFromRole || !streamAddRole} onclick={saveStreamRole}>
            <i class="fa-solid fa-check mr-1"></i>{streamRole?.enabled ? m.utility.streamroleUpdateRoles() : m.common.enabled()}
          </button>
          {#if streamRole?.enabled}
            <button class="px-6 py-3 rounded-xl font-medium transition-all hover:scale-[1.02] min-h-[44px] disabled:opacity-50" style="background: #ef444415; color: #ef4444; border: 1px solid #ef444430;" disabled={busy} onclick={stopStreamRole}>
              <i class="fa-solid fa-power-off mr-1"></i>{m.common.disable()}
            </button>
          {/if}
        </div>
        <div>
          <label for="stream-keyword" class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">{m.utility.streamroleKeyword()}</label>
          <p class="text-xs mb-2" style="color: {$colorStore.muted}">{m.utility.streamroleKeywordHint()}</p>
          <form class="flex gap-2" onsubmit={(e) => { e.preventDefault(); saveStreamKeyword(); }}>
            <input id="stream-keyword" type="text" bind:value={streamKeyword} maxlength="100" placeholder={m.utility.streamroleKeywordPlaceholder()}
                   class="flex-1 p-3 rounded-xl border min-h-[44px]" style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};">
            <button type="submit" disabled={busy} class="px-4 py-3 rounded-xl min-h-[44px] disabled:opacity-50" style="background: {$colorStore.secondary}20; color: {$colorStore.secondary};">{m.common.save()}</button>
          </form>
        </div>
      {/snippet}
      {@render card(m.utility.tabStreamrole(), "fa-video", m.utility.streamroleCardSubtitle(), streamRoleBody)}

      {#snippet streamListBody()}
        <form class="flex flex-col sm:flex-row gap-2 mb-4" onsubmit={(e) => { e.preventDefault(); addStreamListUser(); }}>
          <div class="sm:w-44">
            <DiscordSelector type="custom" options={[{ id: "whitelist", name: m.common.whitelist() }, { id: "blacklist", name: m.common.blacklist() }]} selected={streamListType} searchable={false} ariaLabel={m.utility.streamroleListTypeAria()}
                             onchange={(e) => { if (e.selected === "whitelist" || e.selected === "blacklist") streamListType = e.selected; }} />
          </div>
          <input type="text" inputmode="numeric" bind:value={streamListUser} placeholder={m.common.userId()} aria-label={m.common.userId()}
                 class="flex-1 p-3 rounded-xl border min-h-[44px]" style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};">
          <button type="submit" disabled={busy || !streamListUser.trim()} class="px-6 py-3 rounded-xl font-medium min-h-[44px] disabled:opacity-50" style="background: {$colorStore.primary}20; color: {$colorStore.primary}; border: 1px solid {$colorStore.primary}30;">{m.common.add()}</button>
        </form>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          {#each [{ key: "whitelist", title: m.common.whitelist(), hint: m.utility.streamroleWhitelistHint() }, { key: "blacklist", title: m.common.blacklist(), hint: m.utility.streamroleBlacklistHint() }] as list}
            <div class="p-4 rounded-xl" style="background: {$colorStore.primary}05;">
              <div class="font-medium" style="color: {$colorStore.text}">{list.title}</div>
              <div class="text-xs mb-3" style="color: {$colorStore.muted}">{list.hint}</div>
              <div class="flex flex-wrap gap-2">
                {#each (list.key === "whitelist" ? streamRole?.whitelist : streamRole?.blacklist) ?? [] as entry (entry.userId.toString())}
                  {@render chip(entry.username ?? entry.userId.toString(), () => removeStreamListUser(list.key as "whitelist" | "blacklist", entry.userId), m.utility.streamroleRemoveAria({ user: entry.username ?? entry.userId.toString() }))}
                {:else}
                  <span class="text-sm" style="color: {$colorStore.muted}">{m.common.empty()}</span>
                {/each}
              </div>
            </div>
          {/each}
        </div>
      {/snippet}
      {@render card(m.utility.streamroleExceptionsTitle(), "fa-user-check", m.utility.streamroleExceptionsSubtitle(), streamListBody)}
    </div>

  {:else if activeTab === 'ai'}
    <div class="w-full" in:fade={{ duration: 200 }}>
      {#snippet aiBody()}
        <form class="space-y-5" onsubmit={(e) => { e.preventDefault(); saveAi(); }}>
          <div class="flex items-center justify-between gap-4 p-4 rounded-xl border" style="background: {$colorStore.primary}05; border-color: {$colorStore.primary}20;">
            <div>
              <div class="font-medium" style="color: {$colorStore.text}">{m.utility.aiEnabled()}</div>
              <div class="text-sm" style="color: {$colorStore.muted}">{ai?.tokensUsed ? m.utility.aiEnabledHintTokens({ count: ai.tokensUsed.toLocaleString() }) : m.utility.aiEnabledHint()}</div>
            </div>
            <button type="button" class="p-2 rounded-lg min-h-[44px] min-w-[44px]" role="switch" aria-checked={aiForm.enabled} aria-label={m.utility.aiEnabled()}
                    style="color: {aiForm.enabled ? $colorStore.secondary : $colorStore.muted}" onclick={() => aiForm.enabled = !aiForm.enabled}>
              <i class="fa-solid {aiForm.enabled ? 'fa-toggle-on' : 'fa-toggle-off'}" style="font-size: 26px;"></i>
            </button>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <span id="ai-channel-label" class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">{m.common.channel()}</span>
              <DiscordSelector type="channel" options={textChannels} selected={aiForm.channelId} placeholder={m.utility.aiChannelPlaceholder()} ariaLabelledby="ai-channel-label"
                               onchange={(e) => { aiForm.channelId = typeof e.selected === "string" ? e.selected : null; }} />
            </div>
            <div>
              <span id="ai-provider-label" class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">{m.common.provider()}</span>
              <DiscordSelector type="custom" options={providerOptions} selected={aiForm.provider} searchable={false} ariaLabelledby="ai-provider-label"
                               onchange={(e) => { if (typeof e.selected === "string") { aiForm.provider = e.selected; aiModels = []; } }} />
            </div>
          </div>

          <div>
            <label for="ai-key" class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">{m.utility.aiApiKey()}</label>
            <div class="flex flex-col sm:flex-row gap-2">
              <input id="ai-key" type="password" bind:value={aiForm.apiKey} autocomplete="off"
                     placeholder={ai?.hasApiKey ? m.utility.aiApiKeyStored({ hint: ai.apiKeyHint ?? m.utility.aiApiKeyHidden() }) : m.utility.aiApiKeyPlaceholder()}
                     class="flex-1 p-3 rounded-xl border min-h-[44px]" style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};">
              {#if ai?.hasApiKey}
                <button type="button" class="px-4 py-3 rounded-xl text-sm min-h-[44px] disabled:opacity-50" style="background: #ef444415; color: #ef4444; border: 1px solid #ef444430;" disabled={busy} onclick={clearAiKey}>{m.utility.aiRemoveKeyConfirmButton()}</button>
              {/if}
            </div>
            <p class="text-xs mt-1" style="color: {$colorStore.muted}">{m.utility.aiApiKeyHint()}</p>
          </div>

          <div>
            <label for="ai-model" class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">{m.common.model()}</label>
            <div class="flex flex-col sm:flex-row gap-2">
              {#if aiModels.length > 0}
                <div class="flex-1">
                  <DiscordSelector type="custom" options={aiModels.map(md => ({ id: md.id, name: md.name, label: `${md.name} (${md.id})` }))} selected={aiForm.model || null} placeholder={m.utility.aiModelPlaceholder()} ariaLabel={m.common.model()}
                                   onchange={(e) => { if (typeof e.selected === "string") aiForm.model = e.selected; }} />
                </div>
              {:else}
                <input id="ai-model" type="text" bind:value={aiForm.model} placeholder={m.utility.aiModelIdPlaceholder()}
                       class="flex-1 p-3 rounded-xl border min-h-[44px]" style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};">
              {/if}
              <button type="button" class="px-4 py-3 rounded-xl text-sm min-h-[44px] disabled:opacity-50" style="background: {$colorStore.secondary}20; color: {$colorStore.secondary};" disabled={aiModelsLoading || !ai?.hasApiKey} onclick={loadAiModels}>
                {#if aiModelsLoading}<i class="fa-solid fa-spinner fa-spin mr-1"></i>{/if}{m.utility.aiFetchModels()}
              </button>
            </div>
          </div>

          <div>
            <label for="ai-prompt" class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">{m.utility.aiSystemPrompt()}</label>
            <textarea id="ai-prompt" rows="4" bind:value={aiForm.systemPrompt} placeholder={m.utility.aiSystemPromptPlaceholder()}
                      class="w-full p-3 rounded-xl border resize-y" style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};"></textarea>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label class="flex items-center gap-3 p-3 rounded-lg cursor-pointer min-h-[44px]" style="background: {$colorStore.primary}08; color: {$colorStore.text};">
              <input type="checkbox" bind:checked={aiForm.webSearchEnabled} class="w-4 h-4 rounded" style="accent-color: {$colorStore.primary};">
              <span class="text-sm">{m.utility.aiWebSearch()}</span>
            </label>
            <label class="flex items-center gap-3 p-3 rounded-lg cursor-pointer min-h-[44px]" style="background: {$colorStore.primary}08; color: {$colorStore.text};">
              <input type="checkbox" bind:checked={aiForm.hideWebSearchMessages} class="w-4 h-4 rounded" style="accent-color: {$colorStore.primary};">
              <span class="text-sm">{m.utility.aiHideWebSearch()}</span>
            </label>
          </div>

          <div>
            <label for="ai-webhook" class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">{ai?.hasWebhook ? m.utility.aiWebhookSet() : m.common.webhookUrlOptional()}</label>
            <input id="ai-webhook" type="url" bind:value={aiForm.webhookUrl} placeholder={ai?.hasWebhook ? m.utility.aiWebhookPlaceholderSet() : m.utility.aiWebhookPlaceholder()}
                   class="w-full p-3 rounded-xl border min-h-[44px]" style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};">
          </div>

          <button type="submit" disabled={busy} class="px-6 py-3 rounded-xl font-medium transition-all hover:scale-[1.02] min-h-[44px] flex items-center gap-2 disabled:opacity-50"
                  style="background: {$colorStore.primary}20; color: {$colorStore.primary}; border: 1px solid {$colorStore.primary}30;">
            {#if busy}<i class="fa-solid fa-spinner fa-spin"></i>{:else}<i class="fa-solid fa-floppy-disk"></i>{/if}
            {m.utility.aiSave()}
          </button>
        </form>
      {/snippet}
      {@render card(m.utility.tabAi(), "fa-microchip", m.utility.aiCardSubtitle(), aiBody)}
    </div>

  {:else if activeTab === 'nsfw'}
    <div class="w-full" in:fade={{ duration: 200 }}>
      {#snippet nsfwBody()}
        <form class="flex flex-col sm:flex-row gap-3 mb-6" onsubmit={(e) => { e.preventDefault(); toggleNsfwTag(nsfwDraft); }}>
          <input type="text" bind:value={nsfwDraft} placeholder={m.utility.nsfwTagPlaceholder()} aria-label={m.utility.nsfwTagAria()} maxlength="100"
                 class="flex-1 p-3 rounded-xl border min-h-[44px]" style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};">
          <button type="submit" disabled={busy || !nsfwDraft.trim()} class="px-6 py-3 rounded-xl font-medium min-h-[44px] flex items-center justify-center gap-2 disabled:opacity-50"
                  style="background: {$colorStore.primary}20; color: {$colorStore.primary}; border: 1px solid {$colorStore.primary}30;">
            <i class="fa-solid fa-plus"></i>{m.utility.nsfwBlock()}
          </button>
        </form>
        {#if nsfwTags.length === 0}
          <p class="text-sm text-center py-8" style="color: {$colorStore.muted}">{m.utility.nsfwEmpty()}</p>
        {:else}
          <div class="flex flex-wrap gap-2">
            {#each nsfwTags as tag (tag)}
              {@render chip(tag, () => toggleNsfwTag(tag), m.utility.nsfwUnblockAria({ tag }))}
            {/each}
          </div>
        {/if}
      {/snippet}
      {@render card(m.utility.nsfwCardTitle({ count: nsfwTags.length }), "fa-eye-slash", m.utility.nsfwCardSubtitle(), nsfwBody)}
    </div>

  {:else if activeTab === 'rolemonitor'}
    <div class="w-full space-y-6" in:fade={{ duration: 200 }}>
      {#snippet rmDefaultBody()}
        <div class="max-w-md">
          <span id="rm-default-label" class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">{m.utility.rmDefaultPunishment()}</span>
          <DiscordSelector type="custom" options={rmPunishmentOptions} selected={rmDefault} searchable={false} ariaLabelledby="rm-default-label" disabled={busy}
                           onchange={(e) => saveRmDefault(typeof e.selected === "string" ? e.selected : null)} />
          <p class="text-xs mt-2" style="color: {$colorStore.muted}">{m.utility.rmDefaultHint()}</p>
        </div>
      {/snippet}
      {@render card(m.utility.rmCardTitle(), "fa-shield", m.utility.rmCardSubtitle(), rmDefaultBody)}

      {#snippet rmRolesBody()}
        <form class="grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] gap-3 mb-4" onsubmit={(e) => { e.preventDefault(); addRmRole(); }}>
          <DiscordSelector type="role" options={roles.filter(r => !roleMonitor?.blacklistedRoles.some(b => b.roleId.toString() === r.id))} selected={rmRolePick} placeholder={m.utility.rmRolePlaceholder()} ariaLabel={m.utility.rmRoleAria()}
                           onchange={(e) => { rmRolePick = typeof e.selected === "string" ? e.selected : null; }} />
          <DiscordSelector type="custom" options={rmOverrideOptions} selected={rmRolePunish ?? "default"} searchable={false} ariaLabel={m.common.punishment()}
                           onchange={(e) => { rmRolePunish = typeof e.selected === "string" ? e.selected : null; }} />
          <button type="submit" disabled={busy || !rmRolePick} class="px-6 py-3 rounded-xl font-medium min-h-[44px] disabled:opacity-50" style="background: {$colorStore.primary}20; color: {$colorStore.primary}; border: 1px solid {$colorStore.primary}30;">{m.common.add()}</button>
        </form>
        <div class="space-y-2">
          {#each roleMonitor?.blacklistedRoles ?? [] as entry (entry.roleId.toString())}
            <div class="flex items-center gap-3 p-3 rounded-lg" style="background: {$colorStore.primary}05;" transition:slide>
              <span class="flex-1 font-medium" style="color: {$colorStore.text}">@{roleName(entry.roleId)}</span>
              <span class="text-xs px-2 py-1 rounded-full" style="background: {$colorStore.accent}20; color: {$colorStore.accent};">{punishmentName(entry.punishment)}</span>
              <button class="p-2 rounded-lg min-h-[36px] min-w-[36px] disabled:opacity-50" style="background: #ef444415; color: #ef4444;" aria-label={m.common.remove()} disabled={busy}
                      onclick={() => rmAction(() => utilityApi.removeBlacklistedRole($currentGuild!.id, entry.roleId), m.utility.rmRemoveRoleFailed())}>
                <i class="fa-solid fa-trash" style="font-size: 12px;"></i>
              </button>
            </div>
          {:else}
            <p class="text-sm" style="color: {$colorStore.muted}">{m.utility.rmRolesEmpty()}</p>
          {/each}
        </div>
      {/snippet}
      {@render card(m.common.blacklistedRoles(), "fa-user", m.utility.rmRolesSubtitle(), rmRolesBody)}

      {#snippet rmPermsBody()}
        <form class="grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] gap-3 mb-4" onsubmit={(e) => { e.preventDefault(); addRmPermission(); }}>
          <DiscordSelector type="custom" options={guildPermissionOptions.filter(p => !roleMonitor?.blacklistedPermissions.some(b => b.permission.toString() === p.id))} selected={rmPermPick} placeholder={m.utility.rmPermPlaceholder()} ariaLabel={m.utility.rmPermAria()}
                           onchange={(e) => { rmPermPick = typeof e.selected === "string" ? e.selected : null; }} />
          <DiscordSelector type="custom" options={rmOverrideOptions} selected={rmPermPunish ?? "default"} searchable={false} ariaLabel={m.common.punishment()}
                           onchange={(e) => { rmPermPunish = typeof e.selected === "string" ? e.selected : null; }} />
          <button type="submit" disabled={busy || !rmPermPick} class="px-6 py-3 rounded-xl font-medium min-h-[44px] disabled:opacity-50" style="background: {$colorStore.primary}20; color: {$colorStore.primary}; border: 1px solid {$colorStore.primary}30;">{m.common.add()}</button>
        </form>
        <div class="space-y-2">
          {#each roleMonitor?.blacklistedPermissions ?? [] as entry (entry.permission.toString())}
            <div class="flex items-center gap-3 p-3 rounded-lg" style="background: {$colorStore.primary}05;" transition:slide>
              <span class="flex-1 font-medium" style="color: {$colorStore.text}">{entry.permissionName}</span>
              <span class="text-xs px-2 py-1 rounded-full" style="background: {$colorStore.accent}20; color: {$colorStore.accent};">{punishmentName(entry.punishment)}</span>
              <button class="p-2 rounded-lg min-h-[36px] min-w-[36px] disabled:opacity-50" style="background: #ef444415; color: #ef4444;" aria-label={m.common.remove()} disabled={busy}
                      onclick={() => rmAction(() => utilityApi.removeBlacklistedPermission($currentGuild!.id, entry.permission), m.utility.rmRemovePermissionFailed())}>
                <i class="fa-solid fa-trash" style="font-size: 12px;"></i>
              </button>
            </div>
          {:else}
            <p class="text-sm" style="color: {$colorStore.muted}">{m.utility.rmPermsEmpty()}</p>
          {/each}
        </div>
      {/snippet}
      {@render card(m.utility.rmPermsTitle(), "fa-key", m.utility.rmPermsSubtitle(), rmPermsBody)}

      {#snippet rmWhitelistBody()}
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <span id="rm-wl-role-label" class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">{m.utility.rmTrustedRoles()}</span>
            <DiscordSelector type="role" options={roles.filter(r => !roleMonitor?.whitelistedRoles.some(w => w.toString() === r.id))} selected={rmWhitelistRole} placeholder={m.utility.rmTrustedRolePlaceholder()} ariaLabelledby="rm-wl-role-label" disabled={busy}
                             onchange={(e) => { if (typeof e.selected === "string") { const id = e.selected; rmWhitelistRole = null; rmAction(() => utilityApi.whitelistRole($currentGuild!.id, BigInt(id)), m.utility.rmWhitelistRoleFailed()); } }} />
            <div class="flex flex-wrap gap-2 mt-3">
              {#each roleMonitor?.whitelistedRoles ?? [] as rid (rid.toString())}
                {@render chip(`@${roleName(rid)}`, () => rmAction(() => utilityApi.unwhitelistRole($currentGuild!.id, rid), m.utility.rmRemoveRoleFailed()), m.utility.rmTrustedRoleRemoveAria({ role: roleName(rid) }))}
              {/each}
            </div>
          </div>
          <div>
            <label for="rm-wl-user" class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">{m.utility.rmTrustedMembers()}</label>
            <form class="flex gap-2" onsubmit={(e) => { e.preventDefault(); addRmWhitelistUser(); }}>
              <input id="rm-wl-user" type="text" inputmode="numeric" bind:value={rmWhitelistUser} placeholder={m.common.userId()}
                     class="flex-1 p-3 rounded-xl border min-h-[44px]" style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};">
              <button type="submit" disabled={busy || !rmWhitelistUser.trim()} class="px-4 py-3 rounded-xl min-h-[44px] disabled:opacity-50" style="background: {$colorStore.primary}20; color: {$colorStore.primary};">{m.common.add()}</button>
            </form>
            <div class="flex flex-wrap gap-2 mt-3">
              {#each roleMonitor?.whitelistedUsers ?? [] as uid (uid.toString())}
                {@render chip(uid.toString(), () => rmAction(() => utilityApi.unwhitelistUser($currentGuild!.id, uid), m.utility.rmRemoveMemberFailed()), m.utility.rmTrustedMemberRemoveAria({ user: uid.toString() }))}
              {/each}
            </div>
          </div>
        </div>
      {/snippet}
      {@render card(m.utility.rmTrustedTitle(), "fa-user-check", m.utility.rmTrustedSubtitle(), rmWhitelistBody)}
    </div>
  {/if}
</DashboardPageLayout>
