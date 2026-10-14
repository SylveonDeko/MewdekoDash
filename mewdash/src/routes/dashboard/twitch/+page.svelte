<script lang="ts">
  import type { PageData } from "./$types";
  import { m } from "$lib/i18n";
  import { browser } from "$app/environment";
  import { goto, invalidateAll } from "$app/navigation";
  import DashboardPageLayout from "$lib/components/layout/DashboardPageLayout.svelte";
  import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";
  import FullscreenEmbedBuilder from "$lib/components/specialized/FullscreenEmbedBuilder.svelte";
  import {
    clientApi,
    ownershipApi,
    twitchApi,
    type TwitchAccountLinkResponse,
    type TwitchChatCommandResponse,
    type TwitchConfigUpdateRequest,
    type TwitchCustomCommandResponse,
    type TwitchHealthResponse,
    type TwitchOAuthStatusResponse,
    type TwitchQuoteResponse,
    type TwitchRedemptionActionResponse,
    type TwitchTimerResponse,
    type TwitchVariableDocsResponse,
  } from "$lib/api/index.ts";
  import { currentGuild } from "$lib/stores/currentGuild";
  import { colorStore } from "$lib/stores/colorStore";
  import { logger } from "$lib/logger";
  import { onMount } from "svelte";
  import { fade, fly } from "svelte/transition";
  import { requestConfirmation } from "$lib/stores/confirmationStore";
  import { createAutoSave } from "$lib/utils/autoSave.svelte";

  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();

  /** Typed fields are not rolled back on failure, since that would fight the user mid-edit. */
  const TEXT_FIELDS = new Set(["commandPrefix", "language", "subNotificationMessage", "raidNotificationMessage", "goLiveMessage"]);

  const autoSave = createAutoSave({
    onError: (_err, key) => showMessage(
      TEXT_FIELDS.has(key)
        ? m.twitch.notifySaveFailed()
        : m.twitch.notifySaveFailedUndone(),
      "error"
    ),
  });

  const slashCommands = $derived([
    { name: "/twitch set", usage: "<channel> [prefix]", description: m.twitch.slashSetDescription(), permission: m.common.manageServer() },
    { name: "/twitch remove", usage: "", description: m.twitch.slashRemoveDescription(), permission: m.common.manageServer() },
    { name: "/twitch config", usage: "", description: m.twitch.slashConfigDescription(), permission: m.common.everyone() },
    { name: "/twitch golive-channel", usage: "<channel> [message]", description: m.twitch.slashGoliveChannelDescription(), permission: m.common.manageServer() },
    { name: "/twitch golive-clear", usage: "", description: m.twitch.slashGoliveClearDescription(), permission: m.common.manageServer() },
    { name: "/twitch link", usage: "<user> <twitchUsername>", description: m.twitch.slashLinkDescription(), permission: m.common.manageServer() },
    { name: "/twitch unlink", usage: "<user>", description: m.twitch.slashUnlinkDescription(), permission: m.common.manageServer() },
    { name: "/twitch links", usage: "", description: m.twitch.slashLinksDescription(), permission: m.common.everyone() },
    { name: "/twitch language", usage: "<languageTag>", description: m.twitch.slashLanguageDescription(), permission: m.common.manageServer() },
    { name: "/twitch prefix", usage: "<prefix>", description: m.twitch.slashPrefixDescription(), permission: m.common.manageServer() },
  ]);

  const goLivePlaceholders = $derived([
    { category: m.placeholders.categoryStream(), name: "%streamer%", description: m.twitch.golivePlaceholderStreamer() },
    { category: m.placeholders.categoryStream(), name: "%title%", description: m.common.currentStreamTitle() },
    { category: m.placeholders.categoryStream(), name: "%game%", description: m.common.streamGameHint() },
    { category: m.placeholders.categoryStream(), name: "%url%", description: m.common.streamUrlHint() },
    { category: m.placeholders.categoryStream(), name: "%viewers%", description: m.twitch.golivePlaceholderViewers() },
  ]);

  const permissionOptions = $derived([
    { id: "Everyone", name: m.common.everyone() },
    { id: "Subscriber", name: m.twitch.permSubscriber() },
    { id: "Vip", name: m.twitch.permVip() },
    { id: "Mod", name: m.twitch.permMod() },
    { id: "Broadcaster", name: m.twitch.permBroadcaster() },
  ]);

  const commandVariables = [
    "%user%",
    "%display%",
    "%channel%",
    "%args%",
    "%target%",
    "%discord%",
    "%random:yes|no%",
    "%count:name%",
    "%stream%",
  ];

  const eventVariables = {
    sub: ["%user%", "%display%", "%channel%", "%tier%"],
    raid: ["%raider%", "%channel%", "%viewers%"],
    redemption: ["%user%", "%display%", "%channel%", "%reward%", "%input%", "%url%"],
  };

  let loading = $state(true);
  let saving = $state(false);
  let connectingBot = $state(false);
  let connectingChannel = $state(false);
  let message = $state("");
  let messageType: "success" | "error" = $state("success");
  let activeTab = $state("setup");
  let activeSubTab = $state("connect");

  let status: TwitchOAuthStatusResponse | null = $state(null);
  let textChannels: Array<{ id: string; name: string }> = $state([]);
  let guildMembers: Array<{ id: string; username: string }> = $state([]);
  let links: TwitchAccountLinkResponse[] = $state([]);
  let linking = $state(false);
  let selectedLinkUserId: string | null = $state(null);
  let linkTwitchUsername = $state("");
  let chatCommands: TwitchChatCommandResponse[] = $state([]);
  let customCommands: TwitchCustomCommandResponse[] = $state([]);
  let redemptions: TwitchRedemptionActionResponse[] = $state([]);
  let health: TwitchHealthResponse | null = $state(null);
  let variableDocs: TwitchVariableDocsResponse | null = $state(null);
  let quotes: TwitchQuoteResponse[] = $state([]);
  let timers: TwitchTimerResponse[] = $state([]);
  let isBotOwner = $state(false);
  let commandSaving = $state(false);
  let commandTesting = $state(false);
  let commandPreview = $state("");
  let timerSaving = $state(false);
  let timerTesting: string | null = $state(null);
  let redemptionSaving = $state(false);
  let quoteSaving = $state(false);
  let operatorRunning: string | null = $state(null);
  let testRunning: "golive" | "sub" | "raid" | null = $state(null);

  let configForm = $state({
    commandPrefix: "!",
    language: "",
    useEventSub: true,
    enabled: true,
    goLiveChannelId: null as string | null,
    subNotificationChannelId: null as string | null,
    subNotificationMessage: "",
    raidNotificationChannelId: null as string | null,
    raidNotificationMessage: "",
  });

  type ConfigField = keyof typeof configForm;

  // Last values the server confirmed, so a failed save can put the field back.
  let savedConfig: typeof configForm = {
    commandPrefix: "!",
    language: "",
    useEventSub: true,
    enabled: true,
    goLiveChannelId: null,
    subNotificationChannelId: null,
    subNotificationMessage: "",
    raidNotificationChannelId: null,
    raidNotificationMessage: "",
  };

  // Embed builder value for the go-live message (bound to FullscreenEmbedBuilder)
  let goLiveMessageValue: any = $state({});
  let savedGoLiveMessage = serializeGoLiveMessage({});
  let commandForm = $state({
    name: "",
    response: "",
    permission: "Everyone",
    cooldownSeconds: 0,
    enabled: true,
    testArgs: "",
  });
  let redemptionForm = $state({
    rewardTitle: "",
    twitchResponse: "",
    discordChannelId: null as string | null,
    discordMessage: "",
  });
  let timerForm = $state({
    name: "",
    messages: "",
    intervalMinutes: 10,
    minChatMessages: 5,
    onlineOnly: true,
    randomizeMessages: false,
    enabled: true,
  });
  let quoteForm = $state({
    text: "",
    author: "",
    search: "",
  });
  let operatorForm = $state({
    chatMessage: "",
    markerDescription: "",
    pollTitle: "",
    pollChoices: `${m.common.yes()}\n${m.common.no()}`,
    pollDurationSeconds: 60,
    moderationUsername: "",
    moderationDurationSeconds: 600,
    moderationReason: "",
    deleteMessageId: "",
  });

  const tabs = $derived([
    { id: "setup", label: m.common.setup(), icon: "fa-plug" },
    { id: "commands", label: m.common.commands(), icon: "fa-terminal" },
    { id: "events", label: m.common.events(), icon: "fa-bolt" },
    { id: "links", label: m.twitch.tabLinks(), icon: "fa-link" },
]);

  const subTabs = $derived([
    { id: "connect", label: m.twitch.subtabConnect(), icon: "fa-key", parentTab: "setup" },
    { id: "botsettings", label: m.common.botSettings(), icon: "fa-comments", parentTab: "setup" },

    { id: "custom", label: m.common.customCommands(), icon: "fa-code", parentTab: "commands" },
    { id: "timers", label: m.twitch.subtabTimers(), icon: "fa-rotate", parentTab: "commands" },
    { id: "quotes", label: m.common.quotes(), icon: "fa-comment", parentTab: "commands" },

    { id: "alerts", label: m.common.alerts(), icon: "fa-bell", parentTab: "events" },
    { id: "live", label: m.twitch.subtabLive(), icon: "fa-sliders", parentTab: "events" },
]);

  let actionButtons = $derived([
    { label: m.common.refresh(), icon: "fa-arrows-rotate", action: loadData, loading },
  ]);

  onMount(async () => {
    if (!browser) return;

    if (data.user?.id) {
      isBotOwner = await ownershipApi.isOwner(BigInt(data.user.id)).catch(() => false);
    }

    const params = new URL(window.location.href).searchParams;
    const code = params.get("code");
    const state = params.get("state");
    const error = params.get("error");

    if ((code && state) || error) {
      await handleOAuthCallback(code, state, error ?? undefined);
      const cleanUrl = new URL(window.location.href);
      cleanUrl.searchParams.delete("code");
      cleanUrl.searchParams.delete("state");
      cleanUrl.searchParams.delete("scope");
      cleanUrl.searchParams.delete("error");
      cleanUrl.searchParams.delete("error_description");
      await goto(cleanUrl.toString(), { replaceState: true });
      await invalidateAll();
    }

    await loadData();
  });

  async function loadData() {
    if (!$currentGuild?.id) return;

    // Let anything still waiting land first, so the reload shows it.
    await autoSave.flush();
    if (!$currentGuild?.id) return;

    loading = true;
    try {
      const [
        statusData,
        channelsData,
        membersData,
        linksData,
        commandsData,
        customCommandsData,
        redemptionsData,
        healthData,
        variablesData,
        quotesData,
        timersData,
        configData,
      ] = await Promise.all([
        twitchApi.getOAuthStatus($currentGuild.id),
        clientApi.getTextChannels($currentGuild.id).catch(() => []),
        clientApi.getMembers($currentGuild.id).catch(() => []),
        twitchApi.getLinks($currentGuild.id).catch(() => []),
        twitchApi.getChatCommands().catch(() => []),
        twitchApi.getCustomCommands($currentGuild.id).catch(() => []),
        twitchApi.getRedemptionActions($currentGuild.id).catch(() => []),
        twitchApi.getHealth($currentGuild.id).catch(() => null),
        twitchApi.getVariables().catch(() => null),
        twitchApi.getQuotes($currentGuild.id).catch(() => []),
        twitchApi.getTimers($currentGuild.id).catch(() => []),
        twitchApi.getConfig($currentGuild.id).catch(() => null),
      ]);

      status = statusData;
      textChannels = (channelsData || []).map((channel: any) => ({
        id: channel.id.toString(),
        name: channel.name,
      }));
      guildMembers = (membersData || []).map((member: any) => ({
        id: member.id.toString(),
        username: member.username,
      }));
      links = linksData || [];
      chatCommands = commandsData || [];
      customCommands = customCommandsData || [];
      redemptions = redemptionsData || [];
      health = healthData;
      variableDocs = variablesData;
      quotes = quotesData || [];
      timers = timersData || [];

      configForm = {
        commandPrefix: statusData.commandPrefix || "!",
        language: statusData.language || "",
        useEventSub: statusData.useEventSub ?? true,
        enabled: configData?.enabled ?? true,
        goLiveChannelId: statusData.goLiveChannelId?.toString() ?? null,
        subNotificationChannelId: statusData.subNotificationChannelId?.toString() ?? null,
        subNotificationMessage: statusData.subNotificationMessage || "",
        raidNotificationChannelId: statusData.raidNotificationChannelId?.toString() ?? null,
        raidNotificationMessage: statusData.raidNotificationMessage || "",
      };
      savedConfig = { ...configForm };
      goLiveMessageValue = parseGoLiveMessage(statusData.goLiveMessage);
      savedGoLiveMessage = serializeGoLiveMessage(goLiveMessageValue);
    } catch (err) {
      logger.error("Failed to load Twitch data:", err);
      showMessage(m.twitch.notifyLoadFailed(), "error");
    } finally {
      loading = false;
    }
  }

  async function connect(mode: "bot" | "channel") {
    if (!$currentGuild?.id) return;
    if (mode === "bot") connectingBot = true;
    else connectingChannel = true;

    try {
      const response = await twitchApi.getOAuthUrl($currentGuild.id, mode);
      window.location.href = response.authorizationUrl;
    } catch (err) {
      logger.error(`Failed to start Twitch ${mode} OAuth:`, err);
      showMessage(mode === "bot" ? m.twitch.notifyConnectBotFailed() : m.twitch.notifyConnectChannelFailed(), "error");
    } finally {
      connectingBot = false;
      connectingChannel = false;
    }
  }

  async function handleOAuthCallback(code: string | null, state: string | null, error?: string) {
    if (error) {
      showMessage(decodeURIComponent(error), "error");
      return;
    }

    if (!code || !state) return;

    try {
      const result = await twitchApi.handleOAuthCallback(code, state);
      showMessage(result.message || m.twitch.notifyOauthComplete(), "success");
    } catch (err) {
      logger.error("Failed to complete Twitch OAuth:", err);
      showMessage(m.twitch.notifyOauthFailed(), "error");
    }
  }

  function parseGoLiveMessage(raw: string | null | undefined): any {
    if (!raw) return {};
    try {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object") return parsed;
    } catch {
      // Not JSON - treat as a legacy plain-text template.
    }
    return { content: raw };
  }

  /** An empty string clears the message on the server; null would leave the old one in place. */
  function serializeGoLiveMessage(value: any): string {
    if (typeof value === "string") return value;
    if (value && typeof value === "object" && Object.keys(value).length > 0) return JSON.stringify(value);
    return "";
  }

  /**
   * Builds a partial update for one field. The API leaves missing fields alone, treats a
   * zero channel id as "clear", and clears a text field when sent an empty string.
   */
  function configRequest(field: ConfigField): TwitchConfigUpdateRequest {
    switch (field) {
      case "commandPrefix":
        return { commandPrefix: configForm.commandPrefix.trim() };
      case "language":
        return { language: configForm.language.trim() };
      case "enabled":
        return { enabled: configForm.enabled };
      case "useEventSub":
        return { useEventSub: configForm.useEventSub };
      case "goLiveChannelId":
        return { goLiveChannelId: configForm.goLiveChannelId ? BigInt(configForm.goLiveChannelId) : 0n };
      case "subNotificationChannelId":
        return { subNotificationChannelId: configForm.subNotificationChannelId ? BigInt(configForm.subNotificationChannelId) : 0n };
      case "raidNotificationChannelId":
        return { raidNotificationChannelId: configForm.raidNotificationChannelId ? BigInt(configForm.raidNotificationChannelId) : 0n };
      case "subNotificationMessage":
        return { subNotificationMessage: configForm.subNotificationMessage };
      case "raidNotificationMessage":
        return { raidNotificationMessage: configForm.raidNotificationMessage };
    }
  }

  /**
   * Saves one config field: toggles and channel pickers straight away (rolled back on
   * failure), typed fields once the user pauses.
   */
  function saveConfigField(field: ConfigField) {
    if (!$currentGuild?.id) return;
    const guildId = $currentGuild.id;
    const value = configForm[field];
    const request = configRequest(field);
    const typed = TEXT_FIELDS.has(field);
    const save = async () => {
      try {
        await twitchApi.updateConfig(guildId, request);
        if ($currentGuild?.id !== guildId) return;
        Object.assign(savedConfig, { [field]: value });
        if (field === "useEventSub" && status) status = { ...status, useEventSub: value as boolean };
      } catch (err) {
        if (!typed && $currentGuild?.id === guildId) Object.assign(configForm, { [field]: savedConfig[field] });
        throw err;
      }
    };
    if (typed) autoSave.schedule(field, save);
    else autoSave.now(field, save);
  }

  function setConfigField<K extends ConfigField>(field: K, value: (typeof configForm)[K]) {
    configForm[field] = value;
    saveConfigField(field);
  }

  /** The prefix can't be empty, so an empty field is not sent and is restored on blur. */
  function savePrefix() {
    if (!configForm.commandPrefix.trim()) {
      autoSave.cancel("commandPrefix");
      return;
    }
    saveConfigField("commandPrefix");
  }

  function flushPrefix() {
    if (!configForm.commandPrefix.trim()) {
      configForm.commandPrefix = savedConfig.commandPrefix;
      return;
    }
    void autoSave.flush("commandPrefix");
  }

  /**
   * Saves the go-live message when the embed builder closes. The builder's Cancel restores
   * the old value before closing, so a cancelled edit is never sent.
   */
  function saveGoLiveMessage() {
    if (!$currentGuild?.id) return;
    const goLiveMessage = serializeGoLiveMessage(goLiveMessageValue);
    if (goLiveMessage === savedGoLiveMessage) return;
    const guildId = $currentGuild.id;
    void autoSave.now("goLiveMessage", async () => {
      await twitchApi.updateConfig(guildId, { goLiveMessage });
      if ($currentGuild?.id === guildId) savedGoLiveMessage = goLiveMessage;
    });
  }

  function editCommand(command: TwitchCustomCommandResponse) {
    commandForm = {
      name: command.name,
      response: command.response,
      permission: command.permission,
      cooldownSeconds: command.cooldownSeconds,
      enabled: command.enabled,
      testArgs: commandForm.testArgs,
    };
    commandPreview = "";
  }

  function resetCommandForm() {
    commandForm = {
      name: "",
      response: "",
      permission: "Everyone",
      cooldownSeconds: 0,
      enabled: true,
      testArgs: "",
    };
    commandPreview = "";
  }

  async function saveCommand() {
    if (!$currentGuild?.id || !commandForm.name.trim() || !commandForm.response.trim()) return;
    commandSaving = true;
    try {
      await twitchApi.saveCustomCommand($currentGuild.id, {
        name: commandForm.name.trim(),
        response: commandForm.response,
        permission: commandForm.permission,
        cooldownSeconds: Number(commandForm.cooldownSeconds) || 0,
        enabled: commandForm.enabled,
      });
      showMessage(m.twitch.notifyCommandSaved(), "success");
      resetCommandForm();
      await loadData();
    } catch (err) {
      logger.error("Failed to save Twitch command:", err);
      showMessage(m.twitch.notifyCommandSaveFailed(), "error");
    } finally {
      commandSaving = false;
    }
  }

  async function removeCommand(name: string) {
    if (!$currentGuild?.id || !(await requestConfirmation({ message: m.twitch.confirmRemoveCommand({ command: `${configForm.commandPrefix}${name}` }), confirmText: m.common.remove() }))) return;
    commandSaving = true;
    try {
      await twitchApi.removeCustomCommand($currentGuild.id, name);
      showMessage(m.twitch.notifyCommandRemoved(), "success");
      if (commandForm.name === name) resetCommandForm();
      await loadData();
    } catch (err) {
      logger.error("Failed to remove Twitch command:", err);
      showMessage(m.twitch.notifyCommandRemoveFailed(), "error");
    } finally {
      commandSaving = false;
    }
  }

  async function previewCommand() {
    if (!$currentGuild?.id || !commandForm.name.trim()) return;
    commandTesting = true;
    try {
      const result = await twitchApi.previewCustomCommand($currentGuild.id, {
        name: commandForm.name.trim(),
        args: commandForm.testArgs || null,
      });
      commandPreview = result.response;
      showMessage(m.twitch.notifyCommandRendered(), "success");
      await refreshHealth();
    } catch (err) {
      logger.error("Failed to preview Twitch command:", err);
      showMessage(m.twitch.notifyCommandPreviewFailed(), "error");
    } finally {
      commandTesting = false;
    }
  }

  function editTimer(timer: TwitchTimerResponse) {
    timerForm = {
      name: timer.name,
      messages: timer.messages,
      intervalMinutes: timer.intervalMinutes,
      minChatMessages: timer.minChatMessages,
      onlineOnly: timer.onlineOnly,
      randomizeMessages: timer.randomizeMessages,
      enabled: timer.enabled,
    };
  }

  function resetTimerForm() {
    timerForm = {
      name: "",
      messages: "",
      intervalMinutes: 10,
      minChatMessages: 5,
      onlineOnly: true,
      randomizeMessages: false,
      enabled: true,
    };
  }

  async function saveTimer() {
    if (!$currentGuild?.id || !timerForm.name.trim() || !timerForm.messages.trim()) return;
    timerSaving = true;
    try {
      await twitchApi.saveTimer($currentGuild.id, {
        name: timerForm.name.trim(),
        messages: timerForm.messages,
        intervalMinutes: Number(timerForm.intervalMinutes) || 10,
        minChatMessages: Number(timerForm.minChatMessages) || 0,
        onlineOnly: timerForm.onlineOnly,
        randomizeMessages: timerForm.randomizeMessages,
        enabled: timerForm.enabled,
      });
      showMessage(m.twitch.notifyTimerSaved(), "success");
      resetTimerForm();
      await loadData();
    } catch (err) {
      logger.error("Failed to save Twitch timer:", err);
      showMessage(m.twitch.notifyTimerSaveFailed(), "error");
    } finally {
      timerSaving = false;
    }
  }

  async function removeTimer(name: string) {
    if (!$currentGuild?.id || !(await requestConfirmation({ message: m.twitch.confirmRemoveTimer({ name }), confirmText: m.common.remove() }))) return;
    timerSaving = true;
    try {
      await twitchApi.removeTimer($currentGuild.id, name);
      showMessage(m.twitch.notifyTimerRemoved(), "success");
      if (timerForm.name === name) resetTimerForm();
      await loadData();
    } catch (err) {
      logger.error("Failed to remove Twitch timer:", err);
      showMessage(m.twitch.notifyTimerRemoveFailed(), "error");
    } finally {
      timerSaving = false;
    }
  }

  async function setTimerState(name: string, enabled: boolean) {
    if (!$currentGuild?.id) return;
    try {
      await twitchApi.setTimerState($currentGuild.id, name, { enabled });
      showMessage(enabled ? m.twitch.notifyTimerEnabled() : m.twitch.notifyTimerDisabled(), "success");
      await loadData();
    } catch (err) {
      logger.error("Failed to update Twitch timer:", err);
      showMessage(m.twitch.notifyTimerUpdateFailed(), "error");
    }
  }

  async function testTimer(name: string) {
    if (!$currentGuild?.id) return;
    timerTesting = name;
    try {
      const result = await twitchApi.testTimer($currentGuild.id, name);
      showMessage(m.twitch.notifyTimerSent({ message: result.message }), "success");
      await refreshHealth();
    } catch (err) {
      logger.error("Failed to test Twitch timer:", err);
      showMessage(m.twitch.notifyTimerTestFailed(), "error");
    } finally {
      timerTesting = null;
    }
  }

  function editRedemption(action: TwitchRedemptionActionResponse) {
    redemptionForm = {
      rewardTitle: action.rewardTitle,
      twitchResponse: action.twitchResponse || "",
      discordChannelId: action.discordChannelId?.toString() ?? null,
      discordMessage: action.discordMessage || "",
    };
  }

  function resetRedemptionForm() {
    redemptionForm = {
      rewardTitle: "",
      twitchResponse: "",
      discordChannelId: null,
      discordMessage: "",
    };
  }

  async function saveRedemption() {
    if (!$currentGuild?.id || !redemptionForm.rewardTitle.trim()) return;
    redemptionSaving = true;
    try {
      await twitchApi.saveRedemptionAction($currentGuild.id, {
        rewardTitle: redemptionForm.rewardTitle.trim(),
        twitchResponse: redemptionForm.twitchResponse || null,
        discordChannelId: redemptionForm.discordChannelId ? BigInt(redemptionForm.discordChannelId) : BigInt(0),
        discordMessage: redemptionForm.discordMessage || null,
      });
      showMessage(m.twitch.notifyRedemptionSaved(), "success");
      resetRedemptionForm();
      await loadData();
    } catch (err) {
      logger.error("Failed to save Twitch redemption action:", err);
      showMessage(m.twitch.notifyRedemptionSaveFailed(), "error");
    } finally {
      redemptionSaving = false;
    }
  }

  async function removeRedemption(rewardTitle: string) {
    if (!$currentGuild?.id || !(await requestConfirmation({ message: m.twitch.confirmRemoveRedemption({ title: rewardTitle }), confirmText: m.common.remove() }))) return;
    redemptionSaving = true;
    try {
      await twitchApi.removeRedemptionAction($currentGuild.id, rewardTitle);
      showMessage(m.twitch.notifyRedemptionRemoved(), "success");
      if (redemptionForm.rewardTitle === rewardTitle) resetRedemptionForm();
      await loadData();
    } catch (err) {
      logger.error("Failed to remove Twitch redemption action:", err);
      showMessage(m.twitch.notifyRedemptionRemoveFailed(), "error");
    } finally {
      redemptionSaving = false;
    }
  }

  async function sendTestEvent(eventType: "golive" | "sub" | "raid") {
    if (!$currentGuild?.id) return;
    testRunning = eventType;
    try {
      const result = await twitchApi.sendTestEvent($currentGuild.id, eventType);
      showMessage(result.message, "success");
      await refreshHealth();
    } catch (err) {
      logger.error(`Failed to send test ${eventType} event:`, err);
      showMessage(m.twitch.notifyTestEventFailed({ event: eventType }), "error");
      await refreshHealth();
    } finally {
      testRunning = null;
    }
  }

  async function refreshHealth() {
    if (!$currentGuild?.id) return;
    health = await twitchApi.getHealth($currentGuild.id).catch(() => health);
  }

  async function refreshQuotes() {
    if (!$currentGuild?.id) return;
    quotes = await twitchApi.getQuotes($currentGuild.id, quoteForm.search).catch(() => quotes);
  }

  async function addQuote() {
    if (!$currentGuild?.id || !quoteForm.text.trim()) return;
    quoteSaving = true;
    try {
      await twitchApi.addQuote($currentGuild.id, {
        text: quoteForm.text.trim(),
        author: quoteForm.author.trim() || null,
        addedBy: data.user?.username || null,
      });
      quoteForm.text = "";
      quoteForm.author = "";
      showMessage(m.twitch.notifyQuoteSaved(), "success");
      await refreshQuotes();
      await refreshHealth();
    } catch (err) {
      logger.error("Failed to save Twitch quote:", err);
      showMessage(m.twitch.notifyQuoteSaveFailed(), "error");
    } finally {
      quoteSaving = false;
    }
  }

  async function removeQuote(quoteId: number) {
    if (!$currentGuild?.id || !(await requestConfirmation({ message: m.twitch.confirmRemoveQuote({ id: quoteId }), confirmText: m.common.remove() }))) return;
    quoteSaving = true;
    try {
      await twitchApi.removeQuote($currentGuild.id, quoteId);
      showMessage(m.twitch.notifyQuoteRemoved(), "success");
      await refreshQuotes();
      await refreshHealth();
    } catch (err) {
      logger.error("Failed to remove Twitch quote:", err);
      showMessage(m.twitch.notifyQuoteRemoveFailed(), "error");
    } finally {
      quoteSaving = false;
    }
  }

  async function runOperatorAction(action: "chat" | "marker" | "clip" | "poll" | "timeout" | "ban" | "unban" | "delete") {
    if (!$currentGuild?.id) return;
    operatorRunning = action;
    try {
      let result;
      if (action === "chat") {
        result = await twitchApi.sendChatMessage($currentGuild.id, { message: operatorForm.chatMessage });
      } else if (action === "marker") {
        result = await twitchApi.createMarker($currentGuild.id, { description: operatorForm.markerDescription || null });
      } else if (action === "clip") {
        result = await twitchApi.createClip($currentGuild.id);
      } else if (action === "poll") {
        result = await twitchApi.createPoll($currentGuild.id, {
          title: operatorForm.pollTitle,
          choices: operatorForm.pollChoices.split("\n").map((x) => x.trim()).filter(Boolean),
          durationSeconds: Number(operatorForm.pollDurationSeconds) || 60,
        });
      } else if (action === "unban") {
        result = await twitchApi.unmoderateUser($currentGuild.id, { username: operatorForm.moderationUsername });
      } else if (action === "delete") {
        result = await twitchApi.deleteChatMessage($currentGuild.id, { messageId: operatorForm.deleteMessageId });
      } else {
        result = await twitchApi.moderateUser($currentGuild.id, {
          username: operatorForm.moderationUsername,
          durationSeconds: action === "timeout" ? Number(operatorForm.moderationDurationSeconds) || 600 : null,
          reason: operatorForm.moderationReason || null,
        });
      }

      showMessage(result.url ? `${result.message} ${result.url}` : result.message, result.success ? "success" : "error");
      await refreshHealth();
    } catch (err) {
      logger.error(`Failed to run Twitch operator action ${action}:`, err);
      showMessage(m.twitch.notifyActionFailed(), "error");
      await refreshHealth();
    } finally {
      operatorRunning = null;
    }
  }

  async function disconnect(mode: "bot" | "channel") {
    if (!$currentGuild?.id) return;
    if (!(await requestConfirmation({ message: mode === "bot" ? m.twitch.confirmDisconnectBot() : m.twitch.confirmDisconnectChannel(), confirmText: m.twitch.confirmDisconnectButton() }))) return;

    saving = true;
    try {
      const result = await twitchApi.disconnect($currentGuild.id, mode);
      showMessage(result.message, "success");
      await loadData();
    } catch (err) {
      logger.error(`Failed to disconnect Twitch ${mode}:`, err);
      showMessage(mode === "bot" ? m.twitch.notifyDisconnectBotFailed() : m.twitch.notifyDisconnectChannelFailed(), "error");
    } finally {
      saving = false;
    }
  }

  async function addLink() {
    if (!$currentGuild?.id || !selectedLinkUserId || !linkTwitchUsername.trim()) return;
    linking = true;
    try {
      await twitchApi.createLink($currentGuild.id, {
        discordUserId: BigInt(selectedLinkUserId),
        twitchUsername: linkTwitchUsername.trim(),
      });
      selectedLinkUserId = null;
      linkTwitchUsername = "";
      showMessage(m.twitch.notifyLinkSaved(), "success");
      await loadData();
    } catch (err) {
      logger.error("Failed to save Twitch account link:", err);
      showMessage(m.twitch.notifyLinkSaveFailed(), "error");
    } finally {
      linking = false;
    }
  }

  async function removeLink(discordUserId: bigint) {
    if (!$currentGuild?.id) return;
    linking = true;
    try {
      await twitchApi.removeLink($currentGuild.id, discordUserId);
      showMessage(m.twitch.notifyLinkRemoved(), "success");
      await loadData();
    } catch (err) {
      logger.error("Failed to remove Twitch account link:", err);
      showMessage(m.twitch.notifyLinkRemoveFailed(), "error");
    } finally {
      linking = false;
    }
  }

  function memberName(discordUserId: bigint) {
    const member = guildMembers.find((candidate) => candidate.id === discordUserId.toString());
    return member?.username ?? `<@${discordUserId}>`;
  }

  function showMessage(value: string, type: "success" | "error" = "success") {
    message = value;
    messageType = type;
    setTimeout(() => {
      if (message === value) message = "";
    }, 5000);
  }

  function escapeHtml(value: string): string {
    return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  function formatDate(value: string | null | undefined) {
    if (!value) return m.twitch.dateNever();
    return new Date(value).toLocaleString();
  }

  function connectionLabel() {
    if (!status) return m.twitch.statusChecking();
    if (status.isConfigured) return m.common.ready();
    if (status.hasBotAccount || status.hasChannelAuthorization) return m.twitch.statusNeedsSetup();
    return m.common.notConnected();
  }
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

<DashboardPageLayout
  title="Twitch"
  subtitle={m.twitch.pageSubtitle()}
  icon="fa-brands fa-twitch"
  {tabs}
  bind:activeTab
  {subTabs}
  bind:activeSubTab
  {actionButtons}
  {autoSave}
  notificationMessage={message}
  notificationType={messageType}
  category="Community"
>
  {#if loading}
    <div class="min-h-[220px] grid place-items-center gap-3 font-bold rounded-2xl border p-6"
         style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15); border-color: {$colorStore.primary}30; color: {$colorStore.text}">
      <i class="fa-solid fa-spinner fa-spin text-2xl" style="color: {$colorStore.primary}"></i>
      <span>{m.twitch.loading()}</span>
    </div>
  {:else}
    <div class="flex flex-col gap-4" in:fade={{ duration: 160 }}>
      <section class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <article class="rounded-2xl p-4 shadow-xl transition-all hover:shadow-2xl hover:translate-y-[-2px] min-w-0" style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15);">
          <div class="flex items-center justify-between gap-3">
            <div class="min-w-0">
              <p class="text-sm font-medium" style="color: {$colorStore.muted}">{m.twitch.overviewConnection()}</p>
              <p class="text-xl font-bold mt-1 break-words" style="color: {$colorStore.text}">{connectionLabel()}</p>
            </div>
            <div class="p-3 rounded-xl shrink-0" style="background: {$colorStore.primary}20;">
              <i class="fa-utility-duo fa-regular fa-signal" style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary}; font-size: 24px;"></i>
            </div>
          </div>
          <p class="mt-3 leading-relaxed text-sm" style="color: {$colorStore.muted}">
            {#if status?.isConfigured}
              {m.twitch.overviewReady({ name: status.channelDisplayName || status.channelUsername || "" })}
            {:else}
              {m.twitch.overviewConnectBoth()}
            {/if}
          </p>
        </article>

        <article class="rounded-2xl p-4 shadow-xl transition-all hover:shadow-2xl hover:translate-y-[-2px] min-w-0" style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15);">
          <div class="flex items-center justify-between gap-3">
            <div class="min-w-0">
              <p class="text-sm font-medium" style="color: {$colorStore.muted}">{m.twitch.overviewBotAccount()}</p>
              <p class="text-xl font-bold mt-1 break-words" style="color: {$colorStore.text}">{status?.botDisplayName || status?.botUsername || m.twitch.statusMissing()}</p>
            </div>
            <div class="p-3 rounded-xl shrink-0" style="background: {$colorStore.secondary}20;">
              <i class="fa-utility-duo fa-regular fa-microchip" style="--fa-primary-color: {$colorStore.secondary}; --fa-secondary-color: {$colorStore.primary}; font-size: 24px;"></i>
            </div>
          </div>
          <p class="mt-3 leading-relaxed text-sm" style="color: {$colorStore.muted}">{status?.hasBotAccount ? m.twitch.overviewBotOk() : m.twitch.overviewBotMissing()}</p>
        </article>

        <article class="rounded-2xl p-4 shadow-xl transition-all hover:shadow-2xl hover:translate-y-[-2px] min-w-0" style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15);">
          <div class="flex items-center justify-between gap-3">
            <div class="min-w-0">
              <p class="text-sm font-medium" style="color: {$colorStore.muted}">{m.common.channel()}</p>
              <p class="text-xl font-bold mt-1 break-words" style="color: {$colorStore.text}">{status?.channelDisplayName || status?.channelUsername || m.twitch.statusMissing()}</p>
            </div>
            <div class="p-3 rounded-xl shrink-0" style="background: {$colorStore.accent}20;">
              <i class="fa-utility-duo fa-regular fa-video" style="--fa-primary-color: {$colorStore.accent}; --fa-secondary-color: {$colorStore.primary}; font-size: 24px;"></i>
            </div>
          </div>
          <p class="mt-3 leading-relaxed text-sm" style="color: {$colorStore.muted}">{status?.hasChannelAuthorization ? m.twitch.overviewChannelOk() : m.twitch.overviewChannelMissing()}</p>
        </article>
      </section>

      {#if activeTab === "setup" && activeSubTab === "connect"}
        <div class="grid grid-cols-1 lg:grid-cols-[minmax(0,1.4fr)_minmax(280px,0.8fr)] gap-4" in:fly={{ y: 10, duration: 160 }}>
          <section class="rounded-xl border p-4" style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15); border-color: {$colorStore.primary}30">
            <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
              <div>
                <h2 class="text-lg font-bold m-0 flex items-center gap-2" style="color: {$colorStore.text}">
                  <i class="fa-utility-duo fa-regular fa-key" style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary}; font-size: 18px;"></i>
                  {m.twitch.setupOauthTitle()}
                </h2>
                <p class="mt-1.5 leading-relaxed" style="color: {$colorStore.muted}">{m.twitch.setupOauthHint()}</p>
              </div>
            </div>

            <div class="grid gap-3">
              {#if isBotOwner}
                <div class="grid gap-3.5 p-3.5 border rounded-xl sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center" style="border-color: {$colorStore.primary}30; background: {$colorStore.primary}08">
                  <div>
                    <strong class="block" style="color: {$colorStore.text}">{m.twitch.overviewBotAccount()}</strong>
                    <span style="color: {$colorStore.muted}">{m.twitch.setupBotScopesHint()}</span>
                  </div>
                  <button
                    class="min-h-[44px] rounded-lg px-3.5 py-2.5 font-extrabold cursor-pointer transition-transform hover:scale-[1.02] disabled:opacity-55 disabled:cursor-not-allowed"
                    disabled={connectingBot}
                    onclick={() => connect("bot")}
                    style="background: {$colorStore.primary}20; color: {$colorStore.primary}; border: 1px solid {$colorStore.primary}30;"
                  >
                    {connectingBot ? m.twitch.setupOpening() : status?.hasBotAccount ? m.twitch.setupReconnectBot() : m.twitch.setupConnectBot()}
                  </button>
                </div>
              {/if}

              <div class="grid gap-3.5 p-3.5 border rounded-xl sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center" style="border-color: {$colorStore.primary}30; background: {$colorStore.primary}08">
                <div>
                  <strong class="block" style="color: {$colorStore.text}">{m.twitch.setupBroadcasterChannel()}</strong>
                  <span style="color: {$colorStore.muted}">{m.twitch.setupChannelScopesHint()}</span>
                </div>
                <button
                  class="min-h-[44px] rounded-lg px-3.5 py-2.5 font-extrabold cursor-pointer transition-transform hover:scale-[1.02] disabled:opacity-55 disabled:cursor-not-allowed"
                  disabled={connectingChannel}
                  onclick={() => connect("channel")}
                  style="background: {$colorStore.primary}20; color: {$colorStore.primary}; border: 1px solid {$colorStore.primary}30;"
                >
                  {connectingChannel ? m.twitch.setupOpening() : status?.hasChannelAuthorization ? m.twitch.setupReconnectChannel() : m.twitch.setupConnectChannel()}
                </button>
              </div>
            </div>
          </section>

          <section class="rounded-xl border p-4" style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15); border-color: {$colorStore.primary}30">
            <h2 class="text-lg font-bold m-0 flex items-center gap-2" style="color: {$colorStore.text}">
              <i class="fa-utility-duo fa-regular fa-chart-simple" style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary}; font-size: 18px;"></i>
              {m.twitch.healthTitle()}
            </h2>
            <dl class="grid gap-2.5 mt-3">
              <div class="flex justify-between gap-4"><dt class="font-bold" style="color: {$colorStore.text}">{m.twitch.healthTransport()}</dt><dd class="m-0 text-right break-words" style="color: {$colorStore.muted}">{status?.useEventSub ? m.twitch.healthTransportEventsub() : m.twitch.healthTransportIrc()}</dd></div>
              <div class="flex justify-between gap-4"><dt class="font-bold" style="color: {$colorStore.text}">{m.twitch.healthLastEvent()}</dt><dd class="m-0 text-right break-words" style="color: {$colorStore.muted}">{formatDate(status?.lastEventAt)}</dd></div>
              <div class="flex justify-between gap-4"><dt class="font-bold" style="color: {$colorStore.text}">{m.common.botToken()}</dt><dd class="m-0 text-right break-words" style="color: {$colorStore.muted}">{formatDate(status?.botTokenExpiry)}</dd></div>
              <div class="flex justify-between gap-4"><dt class="font-bold" style="color: {$colorStore.text}">{m.twitch.healthChannelToken()}</dt><dd class="m-0 text-right break-words" style="color: {$colorStore.muted}">{formatDate(status?.channelTokenExpiry)}</dd></div>
            </dl>
            {#if health}
              <details class="mt-4">
                <summary class="cursor-pointer font-bold text-sm" style="color: {$colorStore.muted}">{m.twitch.healthAdvanced()}</summary>
                <div class="mt-3 grid gap-1.5">
                  <h3 class="text-base font-bold m-0 flex items-center gap-2" style="color: {$colorStore.text}">
                    <i class="fa-utility-duo fa-regular fa-circle-exclamation" style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary}; font-size: 16px;"></i>
                    {m.twitch.healthMissingScopes()}
                  </h3>
                  <p class="leading-relaxed" style="color: {$colorStore.muted}">
                    {m.twitch.healthBotScopes({ scopes: health.botMissingScopes.length ? health.botMissingScopes.join(", ") : m.common.noneLower() })}
                  </p>
                  <p class="leading-relaxed" style="color: {$colorStore.muted}">
                    {m.twitch.healthChannelScopes({ scopes: health.channelMissingScopes.length ? health.channelMissingScopes.join(", ") : m.common.noneLower() })}
                  </p>
                </div>
                <div class="mt-4 grid gap-1.5">
                  <h3 class="text-base font-bold m-0 flex items-center gap-2" style="color: {$colorStore.text}">
                    <i class="fa-utility-duo fa-regular fa-bolt" style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary}; font-size: 16px;"></i>
                    {m.twitch.healthEventsub()}
                  </h3>
                  {#if health.subscriptions.length === 0}
                    <p class="leading-relaxed" style="color: {$colorStore.muted}">{m.twitch.healthNoSubscriptions()}</p>
                  {:else}
                    <ul class="grid gap-1.5 m-0 pl-4">
                      {#each health.subscriptions as subscription (subscription.twitchSubscriptionId)}
                        <li style="color: {$colorStore.muted}">
                          <strong style="color: {$colorStore.text}">{subscription.type}</strong>
                          {subscription.status} · {formatDate(subscription.lastUpdatedAt)}
                        </li>
                      {/each}
                    </ul>
                  {/if}
                </div>
              </details>
            {/if}
          </section>
        </div>
      {:else if activeTab === "setup" && activeSubTab === "botsettings"}
        <section class="rounded-xl border p-4" style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15); border-color: {$colorStore.primary}30" in:fly={{ y: 10, duration: 160 }}>
          <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
            <div>
              <h2 class="text-lg font-bold m-0 flex items-center gap-2" style="color: {$colorStore.text}">
                <i class="fa-utility-duo fa-regular fa-comments" style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary}; font-size: 18px;"></i>
                {m.twitch.botTitle()}
              </h2>
              <p class="mt-1.5 leading-relaxed" style="color: {$colorStore.muted}">{m.twitch.botHint()}</p>
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label class="grid gap-2 font-bold">
              <span style="color: {$colorStore.text}">{m.common.commandPrefix()}</span>
              <input bind:value={configForm.commandPrefix} oninput={savePrefix} onblur={flushPrefix} maxlength="8" class="w-full border rounded-lg p-3" style="background: {$colorStore.primary}08; color: {$colorStore.text}; border-color: {$colorStore.muted}" />
            </label>

            <label class="grid gap-2 font-bold">
              <span style="color: {$colorStore.text}">{m.twitch.botLanguage()}</span>
              <input bind:value={configForm.language} oninput={() => saveConfigField("language")} onblur={() => autoSave.flush("language")} placeholder={m.common.useServerDefault()} class="w-full border rounded-lg p-3" style="background: {$colorStore.primary}08; color: {$colorStore.text}; border-color: {$colorStore.muted}" />
            </label>

            <div class="flex items-center justify-between gap-2.5 py-2.5">
              <span style="color: {$colorStore.text}">{m.twitch.botEnable()}</span>
              {@render toggle(configForm.enabled, (v) => setConfigField("enabled", v))}
            </div>

            <div class="flex items-center justify-between gap-2.5 py-2.5">
              <span style="color: {$colorStore.text}">{m.twitch.botUseEventsub()}</span>
              {@render toggle(configForm.useEventSub, (v) => setConfigField("useEventSub", v))}
            </div>
          </div>

          <div class="flex flex-col sm:flex-row gap-2.5 mt-5">
            <button
              class="min-h-[44px] rounded-lg px-3.5 py-2.5 font-extrabold cursor-pointer transition-transform hover:scale-[1.02] disabled:opacity-55 disabled:cursor-not-allowed border-0"
              disabled={!status?.hasChannelAuthorization || saving}
              onclick={() => disconnect("channel")}
              style="background: {$colorStore.accent}15; color: {$colorStore.accent};"
            >{m.twitch.botDisconnectChannel()}</button>
            {#if isBotOwner}
              <button
                class="min-h-[44px] rounded-lg px-3.5 py-2.5 font-extrabold cursor-pointer transition-transform hover:scale-[1.02] disabled:opacity-55 disabled:cursor-not-allowed border-0"
                disabled={!status?.hasBotAccount || saving}
                onclick={() => disconnect("bot")}
                style="background: {$colorStore.accent}15; color: {$colorStore.accent};"
              >{m.twitch.botDisconnectBot()}</button>
            {/if}
          </div>
        </section>
      {:else if activeTab === "commands" && activeSubTab === "custom"}
        <section class="rounded-xl border p-4" style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15); border-color: {$colorStore.primary}30" in:fly={{ y: 10, duration: 160 }}>
          <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
            <div>
              <h2 class="text-lg font-bold m-0 flex items-center gap-2" style="color: {$colorStore.text}">
                <i class="fa-utility-duo fa-regular fa-code" style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary}; font-size: 18px;"></i>
                {m.twitch.commandEditorTitle()}
              </h2>
              <p class="mt-1.5 leading-relaxed" style="color: {$colorStore.muted}">{m.twitch.commandEditorHint()}</p>
            </div>
            <div class="flex flex-wrap gap-2 items-center">
              <button class="min-h-[44px] rounded-lg px-3.5 py-2.5 font-extrabold cursor-pointer transition-transform hover:scale-[1.02] border-0" onclick={resetCommandForm} style="background: {$colorStore.primary}10; color: {$colorStore.text};">{m.common.clear()}</button>
              <button
                class="min-h-[44px] rounded-lg px-3.5 py-2.5 font-extrabold cursor-pointer transition-transform hover:scale-[1.02] disabled:opacity-55 disabled:cursor-not-allowed"
                disabled={commandSaving || !commandForm.name.trim() || !commandForm.response.trim()}
                onclick={saveCommand}
                style="background: {$colorStore.primary}20; color: {$colorStore.primary}; border: 1px solid {$colorStore.primary}30;"
              >{commandSaving ? m.common.saving() : m.twitch.commandSave()}</button>
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label class="grid gap-2 font-bold">
              <span style="color: {$colorStore.text}">{m.common.command()}</span>
              <input bind:value={commandForm.name} placeholder={m.common.helloPlaceholder()} class="w-full border rounded-lg p-3" style="background: {$colorStore.primary}08; color: {$colorStore.text}; border-color: {$colorStore.muted}" />
            </label>
            <div class="grid gap-2 font-bold">
              <span style="color: {$colorStore.text}">{m.common.permission()}</span>
              <DiscordSelector
                type="custom"
                customIcon="fa-lock"
                searchable={false}
                options={permissionOptions}
                selected={commandForm.permission}
                onchange={(detail) => commandForm.permission = (detail.selected as string) ?? "Everyone"}
              />
            </div>
            <label class="grid gap-2 font-bold">
              <span style="color: {$colorStore.text}">{m.twitch.commandCooldown()}</span>
              <input type="number" min="0" max="86400" bind:value={commandForm.cooldownSeconds} class="w-full border rounded-lg p-3" style="background: {$colorStore.primary}08; color: {$colorStore.text}; border-color: {$colorStore.muted}" />
            </label>
            <div class="flex items-center justify-between gap-2.5 py-2.5">
              <span style="color: {$colorStore.text}">{m.common.enabled()}</span>
              {@render toggle(commandForm.enabled, (v) => commandForm.enabled = v)}
            </div>
            <label class="grid gap-2 font-bold sm:col-span-2">
              <span style="color: {$colorStore.text}">{m.twitch.commandResponse()}</span>
              <textarea bind:value={commandForm.response} rows="4" placeholder={m.twitch.commandResponsePlaceholder()} class="w-full border rounded-lg p-3 resize-y min-h-[86px]" style="background: {$colorStore.primary}08; color: {$colorStore.text}; border-color: {$colorStore.muted}"></textarea>
            </label>
          </div>

          <div class="flex flex-wrap gap-2 my-3.5">
            {#each variableDocs?.groups.custom_commands ?? commandVariables as variable}
              <button type="button" class="border-0 rounded-full px-2.5 py-1.5 font-mono text-xs font-extrabold cursor-pointer" onclick={() => commandForm.response = `${commandForm.response}${variable}`} style="background: {$colorStore.primary}12; color: {$colorStore.primary};">{variable}</button>
            {/each}
          </div>

          <div class="grid gap-3 mt-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
            <label class="grid gap-2 font-bold">
              <span style="color: {$colorStore.text}">{m.twitch.commandTestArgs()}</span>
              <input bind:value={commandForm.testArgs} placeholder={m.twitch.commandTestArgsPlaceholder()} class="w-full border rounded-lg p-3" style="background: {$colorStore.primary}08; color: {$colorStore.text}; border-color: {$colorStore.muted}" />
            </label>
            <button
              class="min-h-[44px] rounded-lg px-3.5 py-2.5 font-extrabold cursor-pointer transition-transform hover:scale-[1.02] disabled:opacity-55 disabled:cursor-not-allowed"
              disabled={commandTesting || !commandForm.name.trim()}
              onclick={previewCommand}
              style="background: {$colorStore.primary}20; color: {$colorStore.primary}; border: 1px solid {$colorStore.primary}30;"
            >{commandTesting ? m.twitch.commandTesting() : m.twitch.commandTest()}</button>
          </div>
          {#if commandPreview}
            <div class="mt-3 p-3.5 border rounded-lg break-words" style="border-color: {$colorStore.primary}30; background: {$colorStore.primary}08; color: {$colorStore.text}">
              {commandPreview}
            </div>
          {/if}

          {#if customCommands.length > 0}
            <ul class="grid gap-2.5 list-none m-0 p-0 mt-4">
              {#each customCommands as command (command.id)}
                <li class="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 justify-between p-3.5 border rounded-xl" style="border-color: {$colorStore.primary}30; background: {$colorStore.primary}08">
                  <div>
                    <div class="font-extrabold font-mono" style="color: {$colorStore.primary}">{configForm.commandPrefix}{command.name}</div>
                    <p class="leading-relaxed" style="color: {$colorStore.muted}">{command.useCount === 1 ? m.twitch.commandStatsOne({ permission: command.permission, cooldown: command.cooldownSeconds, count: command.useCount }) : m.twitch.commandStatsOther({ permission: command.permission, cooldown: command.cooldownSeconds, count: command.useCount })}</p>
                  </div>
                  <div class="flex flex-wrap gap-2 items-center">
                    <button class="min-h-[44px] rounded-lg px-3.5 py-2.5 font-extrabold cursor-pointer transition-transform hover:scale-[1.02] border-0" onclick={() => editCommand(command)} style="background: {$colorStore.primary}12; color: {$colorStore.text};">{m.common.edit()}</button>
                    <button class="min-h-[44px] rounded-lg px-3.5 py-2.5 font-extrabold cursor-pointer transition-transform hover:scale-[1.02] border-0" onclick={() => removeCommand(command.name)} style="background: {$colorStore.accent}15; color: {$colorStore.accent};">{m.common.remove()}</button>
                  </div>
                </li>
              {/each}
            </ul>
          {:else}
            <p class="leading-relaxed" style="color: {$colorStore.muted}">{m.twitch.commandEmpty()}</p>
          {/if}
        </section>

        <details class="rounded-xl border p-4 mt-4" style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15); border-color: {$colorStore.primary}30">
          <summary class="cursor-pointer text-lg font-bold flex items-center gap-2" style="color: {$colorStore.text}">
            <i class="fa-utility-duo fa-regular fa-book" style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary}; font-size: 18px;"></i>
            {m.common.commandReference()}
          </summary>

          <div class="mt-4">
            <h3 class="text-base font-bold m-0" style="color: {$colorStore.text}">{m.twitch.commandSlashTitle()}</h3>
            <p class="mt-1 mb-2.5 leading-relaxed" style="color: {$colorStore.muted}">{@html m.twitch.commandSlashHint()}</p>
            <ul class="grid gap-2.5 list-none m-0 p-0">
              {#each slashCommands as command (command.name)}
                <li class="p-3.5 border rounded-xl" style="border-color: {$colorStore.primary}30; background: {$colorStore.primary}08">
                  <div class="font-extrabold font-mono" style="color: {$colorStore.primary}">
                    {command.name} <span style="color: {$colorStore.muted}">{command.usage}</span>
                  </div>
                  <p class="leading-relaxed" style="color: {$colorStore.muted}">{command.description}</p>
                  <span class="inline-block text-xs font-extrabold uppercase tracking-wide px-2.5 py-1 rounded-full whitespace-nowrap" style="color: {$colorStore.text}; background: {$colorStore.primary}15;">{command.permission}</span>
                </li>
              {/each}
            </ul>
          </div>

          <div class="mt-5">
            <h3 class="text-base font-bold m-0" style="color: {$colorStore.text}">{m.twitch.commandChatTitle()}</h3>
            <p class="mt-1 mb-2.5 leading-relaxed" style="color: {$colorStore.muted}">{@html m.twitch.commandChatHint({ prefix: escapeHtml(configForm.commandPrefix) })}</p>
            {#if chatCommands.length === 0}
              <p class="leading-relaxed" style="color: {$colorStore.muted}">{m.twitch.commandChatEmpty()}</p>
            {:else}
              <ul class="grid gap-2.5 list-none m-0 p-0">
                {#each chatCommands as command (command.name)}
                  <li class="flex items-center justify-between gap-3 p-3.5 border rounded-xl" style="border-color: {$colorStore.primary}30; background: {$colorStore.primary}08">
                    <div class="font-extrabold font-mono" style="color: {$colorStore.primary}">{configForm.commandPrefix}{command.name}</div>
                    <span class="inline-block text-xs font-extrabold uppercase tracking-wide px-2.5 py-1 rounded-full whitespace-nowrap" style="color: {$colorStore.text}; background: {$colorStore.primary}15;">{command.permission}</span>
                  </li>
                {/each}
              </ul>
            {/if}
          </div>
        </details>
      {:else if activeTab === "commands" && activeSubTab === "timers"}
        <section class="rounded-xl border p-4" style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15); border-color: {$colorStore.primary}30" in:fly={{ y: 10, duration: 160 }}>
          <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
            <div>
              <h2 class="text-lg font-bold m-0 flex items-center gap-2" style="color: {$colorStore.text}">
                <i class="fa-utility-duo fa-regular fa-arrows-rotate" style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary}; font-size: 18px;"></i>
                {m.features.wizardRepeatersName()}
              </h2>
              <p class="mt-1.5 leading-relaxed" style="color: {$colorStore.muted}">{m.twitch.timerHint()}</p>
            </div>
            <div class="flex flex-wrap gap-2 items-center">
              <button class="min-h-[44px] rounded-lg px-3.5 py-2.5 font-extrabold cursor-pointer transition-transform hover:scale-[1.02] border-0" onclick={resetTimerForm} style="background: {$colorStore.primary}10; color: {$colorStore.text};">{m.common.clear()}</button>
              <button
                class="min-h-[44px] rounded-lg px-3.5 py-2.5 font-extrabold cursor-pointer transition-transform hover:scale-[1.02] disabled:opacity-55 disabled:cursor-not-allowed"
                disabled={timerSaving || !timerForm.name.trim() || !timerForm.messages.trim()}
                onclick={saveTimer}
                style="background: {$colorStore.primary}20; color: {$colorStore.primary}; border: 1px solid {$colorStore.primary}30;"
              >{timerSaving ? m.common.saving() : m.twitch.timerSave()}</button>
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label class="grid gap-2 font-bold">
              <span style="color: {$colorStore.text}">{m.twitch.timerName()}</span>
              <input bind:value={timerForm.name} placeholder={m.twitch.timerNamePlaceholder()} class="w-full border rounded-lg p-3" style="background: {$colorStore.primary}08; color: {$colorStore.text}; border-color: {$colorStore.muted}" />
            </label>
            <label class="grid gap-2 font-bold">
              <span style="color: {$colorStore.text}">{m.twitch.timerInterval()}</span>
              <input type="number" min="1" max="1440" bind:value={timerForm.intervalMinutes} class="w-full border rounded-lg p-3" style="background: {$colorStore.primary}08; color: {$colorStore.text}; border-color: {$colorStore.muted}" />
            </label>
            <label class="grid gap-2 font-bold">
              <span style="color: {$colorStore.text}">{m.twitch.timerMinChat()}</span>
              <input type="number" min="0" max="10000" bind:value={timerForm.minChatMessages} class="w-full border rounded-lg p-3" style="background: {$colorStore.primary}08; color: {$colorStore.text}; border-color: {$colorStore.muted}" />
            </label>
            <div class="flex items-center justify-between gap-2.5 py-2.5">
              <span style="color: {$colorStore.text}">{m.twitch.timerOnlineOnlyLabel()}</span>
              {@render toggle(timerForm.onlineOnly, (v) => timerForm.onlineOnly = v)}
            </div>
            <div class="flex items-center justify-between gap-2.5 py-2.5">
              <span style="color: {$colorStore.text}">{m.twitch.timerRandomRotation()}</span>
              {@render toggle(timerForm.randomizeMessages, (v) => timerForm.randomizeMessages = v)}
            </div>
            <div class="flex items-center justify-between gap-2.5 py-2.5">
              <span style="color: {$colorStore.text}">{m.common.enabled()}</span>
              {@render toggle(timerForm.enabled, (v) => timerForm.enabled = v)}
            </div>
            <label class="grid gap-2 font-bold sm:col-span-2">
              <span style="color: {$colorStore.text}">{m.common.messages()}</span>
              <textarea bind:value={timerForm.messages} rows="5" placeholder={m.twitch.timerMessagesPlaceholder()} class="w-full border rounded-lg p-3 resize-y min-h-[86px]" style="background: {$colorStore.primary}08; color: {$colorStore.text}; border-color: {$colorStore.muted}"></textarea>
            </label>
          </div>

          <div class="flex flex-wrap gap-2 my-3.5">
            {#each variableDocs?.groups.timers ?? ["%channel%", "%url%", "%stream%", "%count:name%", "%random:a|b|c%"] as variable}
              <button type="button" class="border-0 rounded-full px-2.5 py-1.5 font-mono text-xs font-extrabold cursor-pointer" onclick={() => timerForm.messages = `${timerForm.messages}${variable}`} style="background: {$colorStore.primary}12; color: {$colorStore.primary};">{variable}</button>
            {/each}
          </div>

          {#if timers.length > 0}
            <ul class="grid gap-2.5 list-none m-0 p-0 mt-4">
              {#each timers as timer (timer.id)}
                <li class="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 justify-between p-3.5 border rounded-xl" style="border-color: {$colorStore.primary}30; background: {$colorStore.primary}08">
                  <div>
                    <div class="font-extrabold font-mono" style="color: {$colorStore.primary}">{timer.name}</div>
                    <p class="leading-relaxed" style="color: {$colorStore.muted}">
                      {m.twitch.timerSummary({ interval: timer.intervalMinutes, chat: timer.minChatMessages, online: timer.onlineOnly ? m.twitch.timerOnlineOnly() : m.twitch.timerAlways(), order: timer.randomizeMessages ? m.twitch.timerRandom() : m.twitch.timerRotating(), last: formatDate(timer.lastSentAt) })}
                    </p>
                  </div>
                  <div class="flex flex-wrap gap-2 items-center">
                    <button class="min-h-[44px] rounded-lg px-3.5 py-2.5 font-extrabold cursor-pointer transition-transform hover:scale-[1.02] border-0" onclick={() => editTimer(timer)} style="background: {$colorStore.primary}12; color: {$colorStore.text};">{m.common.edit()}</button>
                    <button class="min-h-[44px] rounded-lg px-3.5 py-2.5 font-extrabold cursor-pointer transition-transform hover:scale-[1.02] border-0" onclick={() => setTimerState(timer.name, !timer.enabled)} style="background: {$colorStore.primary}12; color: {$colorStore.text};">{timer.enabled ? m.common.disable() : m.common.enable()}</button>
                    <button class="min-h-[44px] rounded-lg px-3.5 py-2.5 font-extrabold cursor-pointer transition-transform hover:scale-[1.02] border-0 disabled:opacity-55 disabled:cursor-not-allowed" disabled={timerTesting === timer.name} onclick={() => testTimer(timer.name)} style="background: {$colorStore.primary}12; color: {$colorStore.text};">{timerTesting === timer.name ? m.common.sending() : m.common.test()}</button>
                    <button class="min-h-[44px] rounded-lg px-3.5 py-2.5 font-extrabold cursor-pointer transition-transform hover:scale-[1.02] border-0" onclick={() => removeTimer(timer.name)} style="background: {$colorStore.accent}15; color: {$colorStore.accent};">{m.common.remove()}</button>
                  </div>
                </li>
              {/each}
            </ul>
          {:else}
            <p class="leading-relaxed" style="color: {$colorStore.muted}">{m.twitch.timerEmpty()}</p>
          {/if}
        </section>
      {:else if activeTab === "commands" && activeSubTab === "quotes"}
        <section class="rounded-xl border p-4" style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15); border-color: {$colorStore.primary}30" in:fly={{ y: 10, duration: 160 }}>
          <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
            <div>
              <h2 class="text-lg font-bold m-0 flex items-center gap-2" style="color: {$colorStore.text}">
                <i class="fa-utility-duo fa-regular fa-comment" style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary}; font-size: 18px;"></i>
                {m.common.quotes()}
              </h2>
              <p class="mt-1.5 leading-relaxed" style="color: {$colorStore.muted}">{m.twitch.quotePoolHint({ command: `${configForm.commandPrefix}quote` })}</p>
            </div>
            <button
              class="min-h-[44px] rounded-lg px-3.5 py-2.5 font-extrabold cursor-pointer transition-transform hover:scale-[1.02] disabled:opacity-55 disabled:cursor-not-allowed"
              disabled={quoteSaving || !quoteForm.text.trim()}
              onclick={addQuote}
              style="background: {$colorStore.primary}20; color: {$colorStore.primary}; border: 1px solid {$colorStore.primary}30;"
            >{quoteSaving ? m.common.saving() : m.twitch.quoteAdd()}</button>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label class="grid gap-2 font-bold sm:col-span-2">
              <span style="color: {$colorStore.text}">{m.common.quoteText()}</span>
              <textarea bind:value={quoteForm.text} rows="3" placeholder={m.twitch.quoteTextPlaceholder()} class="w-full border rounded-lg p-3 resize-y min-h-[86px]" style="background: {$colorStore.primary}08; color: {$colorStore.text}; border-color: {$colorStore.muted}"></textarea>
            </label>
            <label class="grid gap-2 font-bold">
              <span style="color: {$colorStore.text}">{m.common.author()}</span>
              <input bind:value={quoteForm.author} placeholder={m.twitch.quoteAuthorPlaceholder()} class="w-full border rounded-lg p-3" style="background: {$colorStore.primary}08; color: {$colorStore.text}; border-color: {$colorStore.muted}" />
            </label>
            <div class="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
              <label class="grid gap-2 font-bold">
                <span style="color: {$colorStore.text}">{m.common.search()}</span>
                <input bind:value={quoteForm.search} placeholder={m.twitch.quoteSearchPlaceholder()} class="w-full border rounded-lg p-3" style="background: {$colorStore.primary}08; color: {$colorStore.text}; border-color: {$colorStore.muted}" />
              </label>
              <button class="min-h-[44px] rounded-lg px-3.5 py-2.5 font-extrabold cursor-pointer transition-transform hover:scale-[1.02] border-0" onclick={refreshQuotes} style="background: {$colorStore.primary}12; color: {$colorStore.text};">{m.common.search()}</button>
            </div>
          </div>

          {#if quotes.length > 0}
            <ul class="grid gap-2.5 list-none m-0 p-0 mt-4">
              {#each quotes as quote (quote.id)}
                <li class="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 justify-between p-3.5 border rounded-xl" style="border-color: {$colorStore.primary}30; background: {$colorStore.primary}08">
                  <div>
                    <div class="font-extrabold font-mono" style="color: {$colorStore.primary}">#{quote.id}</div>
                    <p class="leading-relaxed" style="color: {$colorStore.text}">{quote.author ? m.twitch.quoteBodyAuthor({ text: quote.text, author: quote.author }) : m.twitch.quoteBody({ text: quote.text })}</p>
                    <p class="leading-relaxed" style="color: {$colorStore.muted}">{quote.addedBy ? m.twitch.quoteAddedBy({ date: formatDate(quote.dateAdded), user: quote.addedBy }) : m.twitch.quoteAdded({ date: formatDate(quote.dateAdded) })}</p>
                  </div>
                  <div class="flex flex-wrap gap-2 items-center">
                    <button class="min-h-[44px] rounded-lg px-3.5 py-2.5 font-extrabold cursor-pointer transition-transform hover:scale-[1.02] border-0 disabled:opacity-55 disabled:cursor-not-allowed" disabled={quoteSaving} onclick={() => removeQuote(quote.id)} style="background: {$colorStore.accent}15; color: {$colorStore.accent};">{m.common.remove()}</button>
                  </div>
                </li>
              {/each}
            </ul>
          {:else}
            <p class="leading-relaxed" style="color: {$colorStore.muted}">{m.twitch.quoteEmpty()}</p>
          {/if}
        </section>
      {:else if activeTab === "events" && activeSubTab === "alerts"}
        <section class="rounded-xl border p-4" style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15); border-color: {$colorStore.primary}30" in:fly={{ y: 10, duration: 160 }}>
          <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
            <div>
              <h2 class="text-lg font-bold m-0 flex items-center gap-2" style="color: {$colorStore.text}">
                <i class="fa-utility-duo fa-regular fa-video" style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary}; font-size: 18px;"></i>
                {m.twitch.eventsRoutingTitle()}
              </h2>
              <p class="mt-1.5 leading-relaxed" style="color: {$colorStore.muted}">{m.twitch.eventsRoutingHint()}</p>
            </div>
          </div>

          {#if status?.hasChannelAuthorization}
            <p class="text-sm leading-normal" style="color: {$colorStore.muted}">
              {m.twitch.eventsOauthNotice({ name: status.channelUsername ?? "" })}
            </p>
          {/if}

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
            <div class="grid gap-2 font-bold">
              <span style="color: {$colorStore.text}">{m.twitch.eventsGoliveChannel()}</span>
              <DiscordSelector
                type="channel"
                options={textChannels}
                selected={configForm.goLiveChannelId}
                placeholder={m.common.noChannelSelected()}
                onchange={(detail) => setConfigField("goLiveChannelId", detail.selected as string | null)}
              />
            </div>

            <div class="sm:col-span-2">
              <span style="color: {$colorStore.text}">{m.twitch.eventsGoliveMessage()}</span>
              <FullscreenEmbedBuilder
                id="twitch-golive-message"
                bind:value={goLiveMessageValue}
                onclose={saveGoLiveMessage}
                previewTitle={m.twitch.eventsGoliveMessage()}
                previewDescription={m.twitch.eventsGolivePreviewDescription()}
                icon="fa-signal"
                allowContent={true}
                allowMultipleEmbeds={true}
                maxEmbeds={10}
                allowComponents={true}
                additionalPlaceholders={goLivePlaceholders}
                guildId={$currentGuild?.id}
                user={data.user}
              />
              <span class="block text-sm font-medium leading-normal" style="color: {$colorStore.muted}">
                {m.twitch.eventsGoliveFooter()} %streamer%, %title%, %game%, %url%, %viewers%.
              </span>
            </div>
          </div>

          <div class="mt-4">
            <button
              class="min-h-[44px] rounded-lg px-3.5 py-2.5 font-extrabold cursor-pointer transition-transform hover:scale-[1.02] disabled:opacity-55 disabled:cursor-not-allowed"
              disabled={testRunning === "golive"}
              onclick={() => sendTestEvent("golive")}
              style="background: {$colorStore.primary}20; color: {$colorStore.primary}; border: 1px solid {$colorStore.primary}30;"
            >{testRunning === "golive" ? m.common.sending() : m.twitch.eventsTestGolive()}</button>
          </div>
        </section>

        <section class="rounded-xl border p-4 mt-4" style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15); border-color: {$colorStore.primary}30" in:fly={{ y: 10, duration: 160 }}>
          <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
            <div>
              <h2 class="text-lg font-bold m-0 flex items-center gap-2" style="color: {$colorStore.text}">
                <i class="fa-utility-duo fa-regular fa-bell" style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary}; font-size: 18px;"></i>
                {m.twitch.eventsTemplatesTitle()}
              </h2>
              <p class="mt-1.5 leading-relaxed" style="color: {$colorStore.muted}">{m.twitch.eventsTemplatesHint()}</p>
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="grid gap-2 font-bold">
              <span style="color: {$colorStore.text}">{m.twitch.eventsSubChannel()}</span>
              <DiscordSelector
                type="channel"
                options={textChannels}
                selected={configForm.subNotificationChannelId}
                placeholder={m.common.noChannelSelected()}
                onchange={(detail) => setConfigField("subNotificationChannelId", detail.selected as string | null)}
              />
            </div>
            <label class="grid gap-2 font-bold">
              <span style="color: {$colorStore.text}">{m.twitch.eventsSubMessage()}</span>
              <textarea bind:value={configForm.subNotificationMessage} oninput={() => saveConfigField("subNotificationMessage")} onblur={() => autoSave.flush("subNotificationMessage")} rows="3" placeholder={m.twitch.eventsSubPlaceholder()} class="w-full border rounded-lg p-3 resize-y min-h-[86px]" style="background: {$colorStore.primary}08; color: {$colorStore.text}; border-color: {$colorStore.muted}"></textarea>
            </label>
            <div class="grid gap-2 font-bold">
              <span style="color: {$colorStore.text}">{m.twitch.eventsRaidChannel()}</span>
              <DiscordSelector
                type="channel"
                options={textChannels}
                selected={configForm.raidNotificationChannelId}
                placeholder={m.common.noChannelSelected()}
                onchange={(detail) => setConfigField("raidNotificationChannelId", detail.selected as string | null)}
              />
            </div>
            <label class="grid gap-2 font-bold">
              <span style="color: {$colorStore.text}">{m.twitch.eventsRaidMessage()}</span>
              <textarea bind:value={configForm.raidNotificationMessage} oninput={() => saveConfigField("raidNotificationMessage")} onblur={() => autoSave.flush("raidNotificationMessage")} rows="3" placeholder={m.twitch.eventsRaidPlaceholder()} class="w-full border rounded-lg p-3 resize-y min-h-[86px]" style="background: {$colorStore.primary}08; color: {$colorStore.text}; border-color: {$colorStore.muted}"></textarea>
            </label>
          </div>

          <div class="grid gap-1.5 my-3 text-sm">
            <span style="color: {$colorStore.muted}">{m.twitch.eventsVarsSub({ variables: eventVariables.sub.join(", ") })}</span>
            <span style="color: {$colorStore.muted}">{m.twitch.eventsVarsRaid({ variables: eventVariables.raid.join(", ") })}</span>
          </div>

          <div class="flex flex-wrap gap-2 items-center mt-4">
            <button
              class="min-h-[44px] rounded-lg px-3.5 py-2.5 font-extrabold cursor-pointer transition-transform hover:scale-[1.02] disabled:opacity-55 disabled:cursor-not-allowed"
              disabled={testRunning === "sub"}
              onclick={() => sendTestEvent("sub")}
              style="background: {$colorStore.primary}20; color: {$colorStore.primary}; border: 1px solid {$colorStore.primary}30;"
            >{testRunning === "sub" ? m.common.sending() : m.twitch.eventsTestSub()}</button>
            <button
              class="min-h-[44px] rounded-lg px-3.5 py-2.5 font-extrabold cursor-pointer transition-transform hover:scale-[1.02] disabled:opacity-55 disabled:cursor-not-allowed"
              disabled={testRunning === "raid"}
              onclick={() => sendTestEvent("raid")}
              style="background: {$colorStore.primary}20; color: {$colorStore.primary}; border: 1px solid {$colorStore.primary}30;"
            >{testRunning === "raid" ? m.common.sending() : m.twitch.eventsTestRaid()}</button>
          </div>
        </section>

        <section class="rounded-xl border p-4 mt-4" style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15); border-color: {$colorStore.primary}30" in:fly={{ y: 10, duration: 160 }}>
          <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
            <div>
              <h2 class="text-lg font-bold m-0 flex items-center gap-2" style="color: {$colorStore.text}">
                <i class="fa-utility-duo fa-regular fa-gift" style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary}; font-size: 18px;"></i>
                {m.twitch.redemptionTitle()}
              </h2>
              <p class="mt-1.5 leading-relaxed" style="color: {$colorStore.muted}">{m.twitch.redemptionHint()}</p>
            </div>
            <div class="flex flex-wrap gap-2 items-center">
              <button class="min-h-[44px] rounded-lg px-3.5 py-2.5 font-extrabold cursor-pointer transition-transform hover:scale-[1.02] border-0" onclick={resetRedemptionForm} style="background: {$colorStore.primary}10; color: {$colorStore.text};">{m.common.clear()}</button>
              <button
                class="min-h-[44px] rounded-lg px-3.5 py-2.5 font-extrabold cursor-pointer transition-transform hover:scale-[1.02] disabled:opacity-55 disabled:cursor-not-allowed"
                disabled={redemptionSaving || !redemptionForm.rewardTitle.trim()}
                onclick={saveRedemption}
                style="background: {$colorStore.primary}20; color: {$colorStore.primary}; border: 1px solid {$colorStore.primary}30;"
              >{redemptionSaving ? m.common.saving() : m.twitch.redemptionSave()}</button>
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label class="grid gap-2 font-bold">
              <span style="color: {$colorStore.text}">{m.twitch.redemptionRewardTitle()}</span>
              <input bind:value={redemptionForm.rewardTitle} placeholder={m.twitch.redemptionRewardPlaceholder()} class="w-full border rounded-lg p-3" style="background: {$colorStore.primary}08; color: {$colorStore.text}; border-color: {$colorStore.muted}" />
            </label>
            <div class="grid gap-2 font-bold">
              <span style="color: {$colorStore.text}">{m.twitch.redemptionDiscordChannel()}</span>
              <DiscordSelector
                type="channel"
                options={textChannels}
                selected={redemptionForm.discordChannelId}
                placeholder={m.twitch.redemptionNoDiscordPost()}
                onchange={(detail) => redemptionForm.discordChannelId = detail.selected as string | null}
              />
            </div>
            <label class="grid gap-2 font-bold">
              <span style="color: {$colorStore.text}">{m.twitch.redemptionTwitchReply()}</span>
              <textarea bind:value={redemptionForm.twitchResponse} rows="3" placeholder={m.twitch.redemptionTwitchReplyPlaceholder()} class="w-full border rounded-lg p-3 resize-y min-h-[86px]" style="background: {$colorStore.primary}08; color: {$colorStore.text}; border-color: {$colorStore.muted}"></textarea>
            </label>
            <label class="grid gap-2 font-bold">
              <span style="color: {$colorStore.text}">{m.twitch.redemptionDiscordMessage()}</span>
              <textarea bind:value={redemptionForm.discordMessage} rows="3" placeholder={m.twitch.redemptionDiscordPlaceholder()} class="w-full border rounded-lg p-3 resize-y min-h-[86px]" style="background: {$colorStore.primary}08; color: {$colorStore.text}; border-color: {$colorStore.muted}"></textarea>
            </label>
          </div>

          <div class="grid gap-1.5 my-3 text-sm">
            <span style="color: {$colorStore.muted}">{m.twitch.eventsVarsRedemption({ variables: eventVariables.redemption.join(", ") })}</span>
          </div>

          {#if redemptions.length > 0}
            <ul class="grid gap-2.5 list-none m-0 p-0 mt-4">
              {#each redemptions as action (action.id)}
                <li class="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 justify-between p-3.5 border rounded-xl" style="border-color: {$colorStore.primary}30; background: {$colorStore.primary}08">
                  <div>
                    <div class="font-extrabold font-mono" style="color: {$colorStore.primary}">{action.rewardTitle}</div>
                    <p class="leading-relaxed" style="color: {$colorStore.muted}">{m.twitch.redemptionSummary({ channel: action.discordChannelId ? `#${textChannels.find((c) => c.id === action.discordChannelId?.toString())?.name || action.discordChannelId}` : m.common.noneLower(), reply: action.twitchResponse ? m.twitch.redemptionYes() : m.twitch.redemptionNo() })}</p>
                  </div>
                  <div class="flex flex-wrap gap-2 items-center">
                    <button class="min-h-[44px] rounded-lg px-3.5 py-2.5 font-extrabold cursor-pointer transition-transform hover:scale-[1.02] border-0" onclick={() => editRedemption(action)} style="background: {$colorStore.primary}12; color: {$colorStore.text};">{m.common.edit()}</button>
                    <button class="min-h-[44px] rounded-lg px-3.5 py-2.5 font-extrabold cursor-pointer transition-transform hover:scale-[1.02] border-0" onclick={() => removeRedemption(action.rewardTitle)} style="background: {$colorStore.accent}15; color: {$colorStore.accent};">{m.common.remove()}</button>
                  </div>
                </li>
              {/each}
            </ul>
          {:else}
            <p class="leading-relaxed" style="color: {$colorStore.muted}">{m.twitch.redemptionEmpty()}</p>
          {/if}
        </section>
      {:else if activeTab === "events" && activeSubTab === "live"}
        <section class="rounded-xl border p-4" style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15); border-color: {$colorStore.primary}30" in:fly={{ y: 10, duration: 160 }}>
          <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
            <div>
              <h2 class="text-lg font-bold m-0 flex items-center gap-2" style="color: {$colorStore.text}">
                <i class="fa-utility-duo fa-regular fa-sliders" style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary}; font-size: 18px;"></i>
                {m.twitch.liveTitle()}
              </h2>
              <p class="mt-1.5 leading-relaxed" style="color: {$colorStore.muted}">{m.twitch.liveHint()}</p>
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div class="grid gap-2.5 p-3.5 border rounded-xl" style="border-color: {$colorStore.primary}30; background: {$colorStore.primary}08">
              <h3 class="text-base font-bold m-0 flex items-center gap-2" style="color: {$colorStore.text}">
                <i class="fa-utility-duo fa-regular fa-comments" style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary}; font-size: 16px;"></i>
                Chat
              </h3>
              <textarea bind:value={operatorForm.chatMessage} rows="3" placeholder={m.twitch.liveChatPlaceholder()} class="w-full border rounded-lg p-3 resize-y min-h-[86px]" style="background: {$colorStore.primary}08; color: {$colorStore.text}; border-color: {$colorStore.muted}"></textarea>
              <button class="min-h-[44px] rounded-lg px-3.5 py-2.5 font-extrabold cursor-pointer transition-transform hover:scale-[1.02] disabled:opacity-55 disabled:cursor-not-allowed" disabled={operatorRunning === "chat" || !operatorForm.chatMessage.trim()} onclick={() => runOperatorAction("chat")} style="background: {$colorStore.primary}20; color: {$colorStore.primary}; border: 1px solid {$colorStore.primary}30;">{operatorRunning === "chat" ? m.common.sending() : m.twitch.liveSendChat()}</button>
            </div>

            <div class="grid gap-2.5 p-3.5 border rounded-xl" style="border-color: {$colorStore.primary}30; background: {$colorStore.primary}08">
              <h3 class="text-base font-bold m-0 flex items-center gap-2" style="color: {$colorStore.text}">
                <i class="fa-utility-duo fa-regular fa-video" style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary}; font-size: 16px;"></i>
                {m.twitch.liveMarkerClip()}
              </h3>
              <input bind:value={operatorForm.markerDescription} placeholder={m.twitch.liveMarkerPlaceholder()} class="w-full border rounded-lg p-3" style="background: {$colorStore.primary}08; color: {$colorStore.text}; border-color: {$colorStore.muted}" />
              <div class="flex flex-wrap gap-2 items-center">
                <button class="min-h-[44px] rounded-lg px-3.5 py-2.5 font-extrabold cursor-pointer transition-transform hover:scale-[1.02] disabled:opacity-55 disabled:cursor-not-allowed" disabled={operatorRunning === "marker"} onclick={() => runOperatorAction("marker")} style="background: {$colorStore.primary}20; color: {$colorStore.primary}; border: 1px solid {$colorStore.primary}30;">{operatorRunning === "marker" ? m.twitch.liveMarking() : m.twitch.liveCreateMarker()}</button>
                <button class="min-h-[44px] rounded-lg px-3.5 py-2.5 font-extrabold cursor-pointer transition-transform hover:scale-[1.02] disabled:opacity-55 disabled:cursor-not-allowed" disabled={operatorRunning === "clip"} onclick={() => runOperatorAction("clip")} style="background: {$colorStore.primary}20; color: {$colorStore.primary}; border: 1px solid {$colorStore.primary}30;">{operatorRunning === "clip" ? m.twitch.liveClipping() : m.twitch.liveCreateClip()}</button>
              </div>
            </div>

            <div class="grid gap-2.5 p-3.5 border rounded-xl" style="border-color: {$colorStore.primary}30; background: {$colorStore.primary}08">
              <h3 class="text-base font-bold m-0 flex items-center gap-2" style="color: {$colorStore.text}">
                <i class="fa-utility-duo fa-regular fa-chart-simple" style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary}; font-size: 16px;"></i>
                {m.common.poll()}
              </h3>
              <input bind:value={operatorForm.pollTitle} placeholder={m.twitch.livePollTitlePlaceholder()} class="w-full border rounded-lg p-3" style="background: {$colorStore.primary}08; color: {$colorStore.text}; border-color: {$colorStore.muted}" />
              <textarea bind:value={operatorForm.pollChoices} rows="4" placeholder={m.twitch.livePollChoicesPlaceholder()} class="w-full border rounded-lg p-3 resize-y min-h-[86px]" style="background: {$colorStore.primary}08; color: {$colorStore.text}; border-color: {$colorStore.muted}"></textarea>
              <input type="number" min="15" max="1800" bind:value={operatorForm.pollDurationSeconds} class="w-full border rounded-lg p-3" style="background: {$colorStore.primary}08; color: {$colorStore.text}; border-color: {$colorStore.muted}" />
              <button class="min-h-[44px] rounded-lg px-3.5 py-2.5 font-extrabold cursor-pointer transition-transform hover:scale-[1.02] disabled:opacity-55 disabled:cursor-not-allowed" disabled={operatorRunning === "poll" || !operatorForm.pollTitle.trim()} onclick={() => runOperatorAction("poll")} style="background: {$colorStore.primary}20; color: {$colorStore.primary}; border: 1px solid {$colorStore.primary}30;">{operatorRunning === "poll" ? m.common.creating() : m.twitch.liveCreatePoll()}</button>
            </div>

            <div class="grid gap-2.5 p-3.5 border rounded-xl" style="border-color: {$colorStore.primary}30; background: {$colorStore.primary}08">
              <h3 class="text-base font-bold m-0 flex items-center gap-2" style="color: {$colorStore.text}">
                <i class="fa-utility-duo fa-regular fa-shield" style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary}; font-size: 16px;"></i>
                {m.features.categoryModeration()}
              </h3>
              <input bind:value={operatorForm.moderationUsername} placeholder={m.twitch.linksTwitchUsername()} class="w-full border rounded-lg p-3" style="background: {$colorStore.primary}08; color: {$colorStore.text}; border-color: {$colorStore.muted}" />
              <input type="number" min="1" max="1209600" bind:value={operatorForm.moderationDurationSeconds} class="w-full border rounded-lg p-3" style="background: {$colorStore.primary}08; color: {$colorStore.text}; border-color: {$colorStore.muted}" />
              <input bind:value={operatorForm.moderationReason} placeholder={m.common.reason()} class="w-full border rounded-lg p-3" style="background: {$colorStore.primary}08; color: {$colorStore.text}; border-color: {$colorStore.muted}" />
              <div class="flex flex-wrap gap-2 items-center">
                <button class="min-h-[44px] rounded-lg px-3.5 py-2.5 font-extrabold cursor-pointer transition-transform hover:scale-[1.02] border-0 disabled:opacity-55 disabled:cursor-not-allowed" disabled={operatorRunning === "timeout" || !operatorForm.moderationUsername.trim()} onclick={() => runOperatorAction("timeout")} style="background: {$colorStore.primary}12; color: {$colorStore.text};">{m.common.timeout()}</button>
                <button class="min-h-[44px] rounded-lg px-3.5 py-2.5 font-extrabold cursor-pointer transition-transform hover:scale-[1.02] border-0 disabled:opacity-55 disabled:cursor-not-allowed" disabled={operatorRunning === "ban" || !operatorForm.moderationUsername.trim()} onclick={() => runOperatorAction("ban")} style="background: {$colorStore.accent}15; color: {$colorStore.accent};">{m.common.actionBan()}</button>
                <button class="min-h-[44px] rounded-lg px-3.5 py-2.5 font-extrabold cursor-pointer transition-transform hover:scale-[1.02] border-0 disabled:opacity-55 disabled:cursor-not-allowed" disabled={operatorRunning === "unban" || !operatorForm.moderationUsername.trim()} onclick={() => runOperatorAction("unban")} style="background: {$colorStore.primary}12; color: {$colorStore.text};">{m.common.unban()}</button>
              </div>
              <input bind:value={operatorForm.deleteMessageId} placeholder={m.twitch.liveMessageIdPlaceholder()} class="w-full border rounded-lg p-3" style="background: {$colorStore.primary}08; color: {$colorStore.text}; border-color: {$colorStore.muted}" />
              <button class="min-h-[44px] rounded-lg px-3.5 py-2.5 font-extrabold cursor-pointer transition-transform hover:scale-[1.02] border-0 disabled:opacity-55 disabled:cursor-not-allowed" disabled={operatorRunning === "delete" || !operatorForm.deleteMessageId.trim()} onclick={() => runOperatorAction("delete")} style="background: {$colorStore.accent}15; color: {$colorStore.accent};">{m.twitch.liveDeleteMessage()}</button>
            </div>
          </div>
        </section>
      {:else if activeTab === "links"}
        <section class="rounded-xl border p-4" style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15); border-color: {$colorStore.primary}30" in:fly={{ y: 10, duration: 160 }}>
          <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
            <div>
              <h2 class="text-lg font-bold m-0 flex items-center gap-2" style="color: {$colorStore.text}">
                <i class="fa-utility-duo fa-regular fa-link" style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary}; font-size: 18px;"></i>
                {m.twitch.tabLinks()}
              </h2>
              <p class="mt-1.5 leading-relaxed" style="color: {$colorStore.muted}">{m.twitch.linksHint()}</p>
            </div>
          </div>

          <div class="grid gap-3 mb-5 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] sm:items-end">
            <div class="grid gap-2 font-bold">
              <span style="color: {$colorStore.text}">{m.twitch.linksDiscordUser()}</span>
              <DiscordSelector
                type="user"
                options={guildMembers.map((member) => ({ id: member.id, name: member.username }))}
                selected={selectedLinkUserId}
                placeholder={m.twitch.linksSelectUser()}
                onchange={(detail) => selectedLinkUserId = detail.selected as string | null}
              />
            </div>
            <label class="grid gap-2 font-bold">
              <span style="color: {$colorStore.text}">{m.twitch.linksTwitchUsername()}</span>
              <input bind:value={linkTwitchUsername} placeholder={m.twitch.linksTwitchPlaceholder()} class="w-full border rounded-lg p-3" style="background: {$colorStore.primary}08; color: {$colorStore.text}; border-color: {$colorStore.muted}" />
            </label>
            <button
              class="min-h-[44px] rounded-lg px-3.5 py-2.5 font-extrabold cursor-pointer transition-transform hover:scale-[1.02] disabled:opacity-55 disabled:cursor-not-allowed"
              disabled={linking || !selectedLinkUserId || !linkTwitchUsername.trim()}
              onclick={addLink}
              style="background: {$colorStore.primary}20; color: {$colorStore.primary}; border: 1px solid {$colorStore.primary}30;"
            >{linking ? m.common.saving() : m.twitch.linksAdd()}</button>
          </div>

          {#if links.length === 0}
            <p class="leading-relaxed" style="color: {$colorStore.muted}">{m.twitch.linksEmpty()}</p>
          {:else}
            <ul class="grid gap-2.5 list-none m-0 p-0">
              {#each links as link (link.discordUserId)}
                <li class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3 p-2.5 px-3.5 border rounded-xl" style="border-color: {$colorStore.primary}30; background: {$colorStore.primary}08">
                  <span style="color: {$colorStore.text}">{memberName(link.discordUserId)}</span>
                  <span style="color: {$colorStore.muted}">@{link.twitchUsername}</span>
                  <button
                    class="min-h-[44px] rounded-lg px-3.5 py-2.5 font-extrabold cursor-pointer transition-transform hover:scale-[1.02] border-0 disabled:opacity-55 disabled:cursor-not-allowed"
                    disabled={linking}
                    onclick={() => removeLink(link.discordUserId)}
                    style="background: {$colorStore.accent}15; color: {$colorStore.accent};"
                  >{m.common.remove()}</button>
                </li>
              {/each}
            </ul>
          {/if}
        </section>
      {/if}
    </div>
  {/if}
</DashboardPageLayout>
