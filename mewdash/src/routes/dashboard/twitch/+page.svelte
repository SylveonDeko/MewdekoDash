<script lang="ts">
  import type { PageData } from "./$types";
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

  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();

  const slashCommands = [
    { name: "/twitch set", usage: "<channel> [prefix]", description: "Set the Twitch channel this server's bot should join and enable chat commands.", permission: "Manage Server" },
    { name: "/twitch remove", usage: "", description: "Remove the Twitch channel configuration and leave the channel.", permission: "Manage Server" },
    { name: "/twitch config", usage: "", description: "Show the current Twitch configuration for this server.", permission: "Everyone" },
    { name: "/twitch golive-channel", usage: "<channel> [message]", description: "Set the Discord channel and optional message template for go-live notifications.", permission: "Manage Server" },
    { name: "/twitch golive-clear", usage: "", description: "Clear the go-live notification channel.", permission: "Manage Server" },
    { name: "/twitch link", usage: "<user> <twitchUsername>", description: "Link a Discord user to their Twitch account.", permission: "Manage Server" },
    { name: "/twitch unlink", usage: "<user>", description: "Remove a Discord user's Twitch account link.", permission: "Manage Server" },
    { name: "/twitch links", usage: "", description: "List all Twitch account links for this server.", permission: "Everyone" },
    { name: "/twitch language", usage: "<languageTag>", description: "Override the language used for Twitch chat responses.", permission: "Manage Server" },
    { name: "/twitch prefix", usage: "<prefix>", description: "Change the Twitch chat command prefix.", permission: "Manage Server" },
  ];

  const goLivePlaceholders = [
    { category: "Stream", name: "%streamer%", description: "Broadcaster's display name" },
    { category: "Stream", name: "%title%", description: "Current stream title" },
    { category: "Stream", name: "%game%", description: "Game/category being streamed" },
    { category: "Stream", name: "%url%", description: "Direct URL to the stream" },
    { category: "Stream", name: "%viewers%", description: "Current viewer count" },
  ];

  const permissionOptions = [
    { id: "Everyone", name: "Everyone" },
    { id: "Subscriber", name: "Subscriber" },
    { id: "Vip", name: "Vip" },
    { id: "Mod", name: "Mod" },
    { id: "Broadcaster", name: "Broadcaster" },
  ];

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

  // Embed builder value for the go-live message (bound to FullscreenEmbedBuilder)
  let goLiveMessageValue: any = $state({});
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
    pollChoices: "Yes\nNo",
    pollDurationSeconds: 60,
    moderationUsername: "",
    moderationDurationSeconds: 600,
    moderationReason: "",
    deleteMessageId: "",
  });

  const tabs = [
    { id: "setup", label: "Setup", icon: "fa-plug" },
    { id: "commands", label: "Commands", icon: "fa-terminal" },
    { id: "events", label: "Events", icon: "fa-bolt" },
    { id: "links", label: "Account Links", icon: "fa-link" },
  ];

  const subTabs = [
    { id: "connect", label: "Connect", icon: "fa-key", parentTab: "setup" },
    { id: "botsettings", label: "Bot Settings", icon: "fa-comments", parentTab: "setup" },

    { id: "custom", label: "Custom Commands", icon: "fa-code", parentTab: "commands" },
    { id: "timers", label: "Timers", icon: "fa-rotate", parentTab: "commands" },
    { id: "quotes", label: "Quotes", icon: "fa-comment", parentTab: "commands" },

    { id: "alerts", label: "Alerts", icon: "fa-bell", parentTab: "events" },
    { id: "live", label: "Live Tools", icon: "fa-sliders", parentTab: "events" },
  ];

  let actionButtons = $derived([
    { label: "Refresh", icon: "fa-arrows-rotate", action: loadData, loading },
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
        enabled: statusData.hasChannelAuthorization,
        goLiveChannelId: statusData.goLiveChannelId?.toString() ?? null,
        subNotificationChannelId: statusData.subNotificationChannelId?.toString() ?? null,
        subNotificationMessage: statusData.subNotificationMessage || "",
        raidNotificationChannelId: statusData.raidNotificationChannelId?.toString() ?? null,
        raidNotificationMessage: statusData.raidNotificationMessage || "",
      };
      goLiveMessageValue = parseGoLiveMessage(statusData.goLiveMessage);
    } catch (err) {
      logger.error("Failed to load Twitch data:", err);
      showMessage("Failed to load Twitch settings", "error");
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
      showMessage(`Failed to start Twitch ${mode} authorization`, "error");
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
      showMessage(result.message || "Twitch authorization complete", "success");
    } catch (err) {
      logger.error("Failed to complete Twitch OAuth:", err);
      showMessage("Failed to complete Twitch authorization", "error");
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

  async function saveSettings() {
    if (!$currentGuild?.id) return;
    saving = true;
    try {
      const goLiveMessageToSend = Object.keys(goLiveMessageValue).length > 0
        ? JSON.stringify(goLiveMessageValue)
        : null;

      await twitchApi.updateConfig($currentGuild.id, {
        commandPrefix: configForm.commandPrefix,
        language: configForm.language || null,
        enabled: configForm.enabled,
        useEventSub: configForm.useEventSub,
        goLiveChannelId: configForm.goLiveChannelId ? BigInt(configForm.goLiveChannelId) : BigInt(0),
        goLiveMessage: goLiveMessageToSend,
        subNotificationChannelId: configForm.subNotificationChannelId ? BigInt(configForm.subNotificationChannelId) : BigInt(0),
        subNotificationMessage: configForm.subNotificationMessage || null,
        raidNotificationChannelId: configForm.raidNotificationChannelId ? BigInt(configForm.raidNotificationChannelId) : BigInt(0),
        raidNotificationMessage: configForm.raidNotificationMessage || null,
      });
      showMessage("Twitch settings saved", "success");
      await loadData();
    } catch (err) {
      logger.error("Failed to save Twitch settings:", err);
      showMessage("Failed to save Twitch settings", "error");
    } finally {
      saving = false;
    }
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
      showMessage("Twitch command saved", "success");
      resetCommandForm();
      await loadData();
    } catch (err) {
      logger.error("Failed to save Twitch command:", err);
      showMessage("Failed to save Twitch command", "error");
    } finally {
      commandSaving = false;
    }
  }

  async function removeCommand(name: string) {
    if (!$currentGuild?.id || !confirm(`Remove ${configForm.commandPrefix}${name}?`)) return;
    commandSaving = true;
    try {
      await twitchApi.removeCustomCommand($currentGuild.id, name);
      showMessage("Twitch command removed", "success");
      if (commandForm.name === name) resetCommandForm();
      await loadData();
    } catch (err) {
      logger.error("Failed to remove Twitch command:", err);
      showMessage("Failed to remove Twitch command", "error");
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
      showMessage("Command response rendered", "success");
      await refreshHealth();
    } catch (err) {
      logger.error("Failed to preview Twitch command:", err);
      showMessage("Failed to preview Twitch command", "error");
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
      showMessage("Twitch timer saved", "success");
      resetTimerForm();
      await loadData();
    } catch (err) {
      logger.error("Failed to save Twitch timer:", err);
      showMessage("Failed to save Twitch timer", "error");
    } finally {
      timerSaving = false;
    }
  }

  async function removeTimer(name: string) {
    if (!$currentGuild?.id || !confirm(`Remove timer ${name}?`)) return;
    timerSaving = true;
    try {
      await twitchApi.removeTimer($currentGuild.id, name);
      showMessage("Twitch timer removed", "success");
      if (timerForm.name === name) resetTimerForm();
      await loadData();
    } catch (err) {
      logger.error("Failed to remove Twitch timer:", err);
      showMessage("Failed to remove Twitch timer", "error");
    } finally {
      timerSaving = false;
    }
  }

  async function setTimerState(name: string, enabled: boolean) {
    if (!$currentGuild?.id) return;
    try {
      await twitchApi.setTimerState($currentGuild.id, name, { enabled });
      showMessage(`${enabled ? "Enabled" : "Disabled"} Twitch timer`, "success");
      await loadData();
    } catch (err) {
      logger.error("Failed to update Twitch timer:", err);
      showMessage("Failed to update Twitch timer", "error");
    }
  }

  async function testTimer(name: string) {
    if (!$currentGuild?.id) return;
    timerTesting = name;
    try {
      const result = await twitchApi.testTimer($currentGuild.id, name);
      showMessage(`Sent timer: ${result.message}`, "success");
      await refreshHealth();
    } catch (err) {
      logger.error("Failed to test Twitch timer:", err);
      showMessage("Failed to test Twitch timer", "error");
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
      showMessage("Redemption action saved", "success");
      resetRedemptionForm();
      await loadData();
    } catch (err) {
      logger.error("Failed to save Twitch redemption action:", err);
      showMessage("Failed to save redemption action", "error");
    } finally {
      redemptionSaving = false;
    }
  }

  async function removeRedemption(rewardTitle: string) {
    if (!$currentGuild?.id || !confirm(`Remove action for ${rewardTitle}?`)) return;
    redemptionSaving = true;
    try {
      await twitchApi.removeRedemptionAction($currentGuild.id, rewardTitle);
      showMessage("Redemption action removed", "success");
      if (redemptionForm.rewardTitle === rewardTitle) resetRedemptionForm();
      await loadData();
    } catch (err) {
      logger.error("Failed to remove Twitch redemption action:", err);
      showMessage("Failed to remove redemption action", "error");
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
      showMessage(`Failed to send test ${eventType} event`, "error");
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
      showMessage("Twitch quote saved", "success");
      await refreshQuotes();
      await refreshHealth();
    } catch (err) {
      logger.error("Failed to save Twitch quote:", err);
      showMessage("Failed to save Twitch quote", "error");
    } finally {
      quoteSaving = false;
    }
  }

  async function removeQuote(quoteId: number) {
    if (!$currentGuild?.id || !confirm(`Remove quote #${quoteId}?`)) return;
    quoteSaving = true;
    try {
      await twitchApi.removeQuote($currentGuild.id, quoteId);
      showMessage("Twitch quote removed", "success");
      await refreshQuotes();
      await refreshHealth();
    } catch (err) {
      logger.error("Failed to remove Twitch quote:", err);
      showMessage("Failed to remove Twitch quote", "error");
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
      showMessage("Failed to run Twitch action", "error");
      await refreshHealth();
    } finally {
      operatorRunning = null;
    }
  }

  async function disconnect(mode: "bot" | "channel") {
    if (!$currentGuild?.id) return;
    const label = mode === "bot" ? "bot account" : "channel authorization";
    if (!confirm(`Disconnect the Twitch ${label}?`)) return;

    saving = true;
    try {
      const result = await twitchApi.disconnect($currentGuild.id, mode);
      showMessage(result.message, "success");
      await loadData();
    } catch (err) {
      logger.error(`Failed to disconnect Twitch ${mode}:`, err);
      showMessage(`Failed to disconnect Twitch ${label}`, "error");
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
      showMessage("Twitch account link saved", "success");
      await loadData();
    } catch (err) {
      logger.error("Failed to save Twitch account link:", err);
      showMessage("Failed to save Twitch account link", "error");
    } finally {
      linking = false;
    }
  }

  async function removeLink(discordUserId: bigint) {
    if (!$currentGuild?.id) return;
    linking = true;
    try {
      await twitchApi.removeLink($currentGuild.id, discordUserId);
      showMessage("Twitch account link removed", "success");
      await loadData();
    } catch (err) {
      logger.error("Failed to remove Twitch account link:", err);
      showMessage("Failed to remove Twitch account link", "error");
    } finally {
      linking = false;
    }
  }

  function memberName(discordUserId: bigint) {
    const member = guildMembers.find((m) => m.id === discordUserId.toString());
    return member?.username ?? `<@${discordUserId}>`;
  }

  function showMessage(value: string, type: "success" | "error" = "success") {
    message = value;
    messageType = type;
    setTimeout(() => {
      if (message === value) message = "";
    }, 5000);
  }

  function formatDate(value: string | null | undefined) {
    if (!value) return "Not seen yet";
    return new Date(value).toLocaleString();
  }

  function connectionLabel() {
    if (!status) return "Checking";
    if (status.isConfigured) return "Ready";
    if (status.hasBotAccount || status.hasChannelAuthorization) return "Needs setup";
    return "Not connected";
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
  subtitle="Connect Mewdeko to Twitch chat, events, and future channel tools."
  icon="fa-brands fa-twitch"
  {tabs}
  bind:activeTab
  {subTabs}
  bind:activeSubTab
  {actionButtons}
  notificationMessage={message}
  notificationType={messageType}
  category="Community"
>
  {#if loading}
    <div class="min-h-[220px] grid place-items-center gap-3 font-bold rounded-2xl border p-6"
         style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15); border-color: {$colorStore.primary}30; color: {$colorStore.text}">
      <i class="fa-solid fa-spinner fa-spin text-2xl" style="color: {$colorStore.primary}"></i>
      <span>Loading Twitch settings</span>
    </div>
  {:else}
    <div class="flex flex-col gap-4" in:fade={{ duration: 160 }}>
      <section class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <article class="rounded-2xl p-4 shadow-xl transition-all hover:shadow-2xl hover:translate-y-[-2px] min-w-0" style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15);">
          <div class="flex items-center justify-between gap-3">
            <div class="min-w-0">
              <p class="text-sm font-medium" style="color: {$colorStore.muted}">Connection</p>
              <p class="text-xl font-bold mt-1 break-words" style="color: {$colorStore.text}">{connectionLabel()}</p>
            </div>
            <div class="p-3 rounded-xl shrink-0" style="background: {$colorStore.primary}20;">
              <i class="fa-utility-duo fa-regular fa-signal" style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary}; font-size: 24px;"></i>
            </div>
          </div>
          <p class="mt-3 leading-relaxed text-sm" style="color: {$colorStore.muted}">
            {#if status?.isConfigured}
              EventSub chat is ready for @{status.channelDisplayName || status.channelUsername}.
            {:else}
              Connect both the bot account and the broadcaster channel to enable modern Twitch chat.
            {/if}
          </p>
        </article>

        <article class="rounded-2xl p-4 shadow-xl transition-all hover:shadow-2xl hover:translate-y-[-2px] min-w-0" style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15);">
          <div class="flex items-center justify-between gap-3">
            <div class="min-w-0">
              <p class="text-sm font-medium" style="color: {$colorStore.muted}">Bot account</p>
              <p class="text-xl font-bold mt-1 break-words" style="color: {$colorStore.text}">{status?.botDisplayName || status?.botUsername || "Missing"}</p>
            </div>
            <div class="p-3 rounded-xl shrink-0" style="background: {$colorStore.secondary}20;">
              <i class="fa-utility-duo fa-regular fa-robot" style="--fa-primary-color: {$colorStore.secondary}; --fa-secondary-color: {$colorStore.primary}; font-size: 24px;"></i>
            </div>
          </div>
          <p class="mt-3 leading-relaxed text-sm" style="color: {$colorStore.muted}">{status?.hasBotAccount ? "Sends chat and owns chat subscriptions." : "Authorize the Twitch account Mewdeko should speak as."}</p>
        </article>

        <article class="rounded-2xl p-4 shadow-xl transition-all hover:shadow-2xl hover:translate-y-[-2px] min-w-0" style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15);">
          <div class="flex items-center justify-between gap-3">
            <div class="min-w-0">
              <p class="text-sm font-medium" style="color: {$colorStore.muted}">Channel</p>
              <p class="text-xl font-bold mt-1 break-words" style="color: {$colorStore.text}">{status?.channelDisplayName || status?.channelUsername || "Missing"}</p>
            </div>
            <div class="p-3 rounded-xl shrink-0" style="background: {$colorStore.accent}20;">
              <i class="fa-utility-duo fa-regular fa-video" style="--fa-primary-color: {$colorStore.accent}; --fa-secondary-color: {$colorStore.primary}; font-size: 24px;"></i>
            </div>
          </div>
          <p class="mt-3 leading-relaxed text-sm" style="color: {$colorStore.muted}">{status?.hasChannelAuthorization ? "Broadcaster permission is stored." : "Authorize the Twitch channel owner."}</p>
        </article>
      </section>

      {#if activeTab === "setup" && activeSubTab === "connect"}
        <div class="grid grid-cols-1 lg:grid-cols-[minmax(0,1.4fr)_minmax(280px,0.8fr)] gap-4" in:fly={{ y: 10, duration: 160 }}>
          <section class="rounded-xl border p-4" style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15); border-color: {$colorStore.primary}30">
            <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
              <div>
                <h2 class="text-lg font-bold m-0 flex items-center gap-2" style="color: {$colorStore.text}">
                  <i class="fa-utility-duo fa-regular fa-key" style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary}; font-size: 18px;"></i>
                  OAuth setup
                </h2>
                <p class="mt-1.5 leading-relaxed" style="color: {$colorStore.muted}">Use Twitch authorization instead of hand-pasted chat tokens.</p>
              </div>
            </div>

            <div class="grid gap-3">
              {#if isBotOwner}
                <div class="grid gap-3.5 p-3.5 border rounded-xl sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center" style="border-color: {$colorStore.primary}30; background: {$colorStore.primary}08">
                  <div>
                    <strong class="block" style="color: {$colorStore.text}">Bot account</strong>
                    <span style="color: {$colorStore.muted}">Grants user:read:chat, user:write:chat, and user:bot. This is a single shared identity used across every server, so only bot owners can (re)authorize it.</span>
                  </div>
                  <button
                    class="min-h-[44px] rounded-lg px-3.5 py-2.5 font-extrabold cursor-pointer transition-transform hover:scale-[1.02] disabled:opacity-55 disabled:cursor-not-allowed"
                    disabled={connectingBot}
                    onclick={() => connect("bot")}
                    style="background: {$colorStore.primary}20; color: {$colorStore.primary}; border: 1px solid {$colorStore.primary}30;"
                  >
                    {connectingBot ? "Opening..." : status?.hasBotAccount ? "Reconnect bot" : "Connect bot"}
                  </button>
                </div>
              {/if}

              <div class="grid gap-3.5 p-3.5 border rounded-xl sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center" style="border-color: {$colorStore.primary}30; background: {$colorStore.primary}08">
                <div>
                  <strong class="block" style="color: {$colorStore.text}">Broadcaster channel</strong>
                  <span style="color: {$colorStore.muted}">Grants channel:bot and event scopes for this server. Authorize this with your own Twitch account.</span>
                </div>
                <button
                  class="min-h-[44px] rounded-lg px-3.5 py-2.5 font-extrabold cursor-pointer transition-transform hover:scale-[1.02] disabled:opacity-55 disabled:cursor-not-allowed"
                  disabled={connectingChannel}
                  onclick={() => connect("channel")}
                  style="background: {$colorStore.primary}20; color: {$colorStore.primary}; border: 1px solid {$colorStore.primary}30;"
                >
                  {connectingChannel ? "Opening..." : status?.hasChannelAuthorization ? "Reconnect channel" : "Connect channel"}
                </button>
              </div>
            </div>
          </section>

          <section class="rounded-xl border p-4" style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15); border-color: {$colorStore.primary}30">
            <h2 class="text-lg font-bold m-0 flex items-center gap-2" style="color: {$colorStore.text}">
              <i class="fa-utility-duo fa-regular fa-chart-line" style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary}; font-size: 18px;"></i>
              Health
            </h2>
            <dl class="grid gap-2.5 mt-3">
              <div class="flex justify-between gap-4"><dt class="font-bold" style="color: {$colorStore.text}">Transport</dt><dd class="m-0 text-right break-words" style="color: {$colorStore.muted}">{status?.useEventSub ? "EventSub WebSocket" : "Legacy IRC"}</dd></div>
              <div class="flex justify-between gap-4"><dt class="font-bold" style="color: {$colorStore.text}">Last event</dt><dd class="m-0 text-right break-words" style="color: {$colorStore.muted}">{formatDate(status?.lastEventAt)}</dd></div>
              <div class="flex justify-between gap-4"><dt class="font-bold" style="color: {$colorStore.text}">Bot token</dt><dd class="m-0 text-right break-words" style="color: {$colorStore.muted}">{formatDate(status?.botTokenExpiry)}</dd></div>
              <div class="flex justify-between gap-4"><dt class="font-bold" style="color: {$colorStore.text}">Channel token</dt><dd class="m-0 text-right break-words" style="color: {$colorStore.muted}">{formatDate(status?.channelTokenExpiry)}</dd></div>
            </dl>
            {#if health}
              <details class="mt-4">
                <summary class="cursor-pointer font-bold text-sm" style="color: {$colorStore.muted}">Advanced diagnostics</summary>
                <div class="mt-3 grid gap-1.5">
                  <h3 class="text-base font-bold m-0 flex items-center gap-2" style="color: {$colorStore.text}">
                    <i class="fa-utility-duo fa-regular fa-triangle-exclamation" style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary}; font-size: 16px;"></i>
                    Missing scopes
                  </h3>
                  <p class="leading-relaxed" style="color: {$colorStore.muted}">
                    Bot: {health.botMissingScopes.length ? health.botMissingScopes.join(", ") : "none"}
                  </p>
                  <p class="leading-relaxed" style="color: {$colorStore.muted}">
                    Channel: {health.channelMissingScopes.length ? health.channelMissingScopes.join(", ") : "none"}
                  </p>
                </div>
                <div class="mt-4 grid gap-1.5">
                  <h3 class="text-base font-bold m-0 flex items-center gap-2" style="color: {$colorStore.text}">
                    <i class="fa-utility-duo fa-regular fa-bolt" style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary}; font-size: 16px;"></i>
                    EventSub
                  </h3>
                  {#if health.subscriptions.length === 0}
                    <p class="leading-relaxed" style="color: {$colorStore.muted}">No stored subscriptions yet.</p>
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
                Chat bot
              </h2>
              <p class="mt-1.5 leading-relaxed" style="color: {$colorStore.muted}">Configure how Twitch chat commands behave in this channel.</p>
            </div>
            <button
              class="min-h-[44px] rounded-lg px-3.5 py-2.5 font-extrabold cursor-pointer transition-transform hover:scale-[1.02] disabled:opacity-55 disabled:cursor-not-allowed"
              disabled={saving}
              onclick={saveSettings}
              style="background: {$colorStore.primary}20; color: {$colorStore.primary}; border: 1px solid {$colorStore.primary}30;"
            >{saving ? "Saving..." : "Save changes"}</button>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label class="grid gap-2 font-bold">
              <span style="color: {$colorStore.text}">Command prefix</span>
              <input bind:value={configForm.commandPrefix} maxlength="8" class="w-full border rounded-lg p-3" style="background: {$colorStore.primary}08; color: {$colorStore.text}; border-color: {$colorStore.muted}" />
            </label>

            <label class="grid gap-2 font-bold">
              <span style="color: {$colorStore.text}">Language override</span>
              <input bind:value={configForm.language} placeholder="Use server default" class="w-full border rounded-lg p-3" style="background: {$colorStore.primary}08; color: {$colorStore.text}; border-color: {$colorStore.muted}" />
            </label>

            <div class="flex items-center justify-between gap-2.5 py-2.5">
              <span style="color: {$colorStore.text}">Enable Twitch chat bot for this server</span>
              {@render toggle(configForm.enabled, (v) => configForm.enabled = v)}
            </div>

            <div class="flex items-center justify-between gap-2.5 py-2.5">
              <span style="color: {$colorStore.text}">Use EventSub for chat events</span>
              {@render toggle(configForm.useEventSub, (v) => configForm.useEventSub = v)}
            </div>
          </div>

          <div class="flex flex-col sm:flex-row gap-2.5 mt-5">
            <button
              class="min-h-[44px] rounded-lg px-3.5 py-2.5 font-extrabold cursor-pointer transition-transform hover:scale-[1.02] disabled:opacity-55 disabled:cursor-not-allowed border-0"
              disabled={!status?.hasChannelAuthorization || saving}
              onclick={() => disconnect("channel")}
              style="background: {$colorStore.accent}15; color: {$colorStore.accent};"
            >Disconnect channel</button>
            {#if isBotOwner}
              <button
                class="min-h-[44px] rounded-lg px-3.5 py-2.5 font-extrabold cursor-pointer transition-transform hover:scale-[1.02] disabled:opacity-55 disabled:cursor-not-allowed border-0"
                disabled={!status?.hasBotAccount || saving}
                onclick={() => disconnect("bot")}
                style="background: {$colorStore.accent}15; color: {$colorStore.accent};"
              >Disconnect bot account</button>
            {/if}
          </div>
        </section>
      {:else if activeTab === "commands" && activeSubTab === "custom"}
        <section class="rounded-xl border p-4" style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15); border-color: {$colorStore.primary}30" in:fly={{ y: 10, duration: 160 }}>
          <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
            <div>
              <h2 class="text-lg font-bold m-0 flex items-center gap-2" style="color: {$colorStore.text}">
                <i class="fa-utility-duo fa-regular fa-code" style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary}; font-size: 18px;"></i>
                Custom command editor
              </h2>
              <p class="mt-1.5 leading-relaxed" style="color: {$colorStore.muted}">Create Twitch chat commands with permissions, cooldowns, and template variables.</p>
            </div>
            <div class="flex flex-wrap gap-2 items-center">
              <button class="min-h-[44px] rounded-lg px-3.5 py-2.5 font-extrabold cursor-pointer transition-transform hover:scale-[1.02] border-0" onclick={resetCommandForm} style="background: {$colorStore.primary}10; color: {$colorStore.text};">Clear</button>
              <button
                class="min-h-[44px] rounded-lg px-3.5 py-2.5 font-extrabold cursor-pointer transition-transform hover:scale-[1.02] disabled:opacity-55 disabled:cursor-not-allowed"
                disabled={commandSaving || !commandForm.name.trim() || !commandForm.response.trim()}
                onclick={saveCommand}
                style="background: {$colorStore.primary}20; color: {$colorStore.primary}; border: 1px solid {$colorStore.primary}30;"
              >{commandSaving ? "Saving..." : "Save command"}</button>
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label class="grid gap-2 font-bold">
              <span style="color: {$colorStore.text}">Command</span>
              <input bind:value={commandForm.name} placeholder="hello" class="w-full border rounded-lg p-3" style="background: {$colorStore.primary}08; color: {$colorStore.text}; border-color: {$colorStore.muted}" />
            </label>
            <div class="grid gap-2 font-bold">
              <span style="color: {$colorStore.text}">Permission</span>
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
              <span style="color: {$colorStore.text}">Cooldown seconds</span>
              <input type="number" min="0" max="86400" bind:value={commandForm.cooldownSeconds} class="w-full border rounded-lg p-3" style="background: {$colorStore.primary}08; color: {$colorStore.text}; border-color: {$colorStore.muted}" />
            </label>
            <div class="flex items-center justify-between gap-2.5 py-2.5">
              <span style="color: {$colorStore.text}">Enabled</span>
              {@render toggle(commandForm.enabled, (v) => commandForm.enabled = v)}
            </div>
            <label class="grid gap-2 font-bold sm:col-span-2">
              <span style="color: {$colorStore.text}">Response</span>
              <textarea bind:value={commandForm.response} rows="4" placeholder={"Hey %display%, welcome in."} class="w-full border rounded-lg p-3 resize-y min-h-[86px]" style="background: {$colorStore.primary}08; color: {$colorStore.text}; border-color: {$colorStore.muted}"></textarea>
            </label>
          </div>

          <div class="flex flex-wrap gap-2 my-3.5">
            {#each variableDocs?.groups.custom_commands ?? commandVariables as variable}
              <button type="button" class="border-0 rounded-full px-2.5 py-1.5 font-mono text-xs font-extrabold cursor-pointer" onclick={() => commandForm.response = `${commandForm.response}${variable}`} style="background: {$colorStore.primary}12; color: {$colorStore.primary};">{variable}</button>
            {/each}
          </div>

          <div class="grid gap-3 mt-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
            <label class="grid gap-2 font-bold">
              <span style="color: {$colorStore.text}">Test args</span>
              <input bind:value={commandForm.testArgs} placeholder="@target extra text" class="w-full border rounded-lg p-3" style="background: {$colorStore.primary}08; color: {$colorStore.text}; border-color: {$colorStore.muted}" />
            </label>
            <button
              class="min-h-[44px] rounded-lg px-3.5 py-2.5 font-extrabold cursor-pointer transition-transform hover:scale-[1.02] disabled:opacity-55 disabled:cursor-not-allowed"
              disabled={commandTesting || !commandForm.name.trim()}
              onclick={previewCommand}
              style="background: {$colorStore.primary}20; color: {$colorStore.primary}; border: 1px solid {$colorStore.primary}30;"
            >{commandTesting ? "Testing..." : "Test response"}</button>
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
                    <p class="leading-relaxed" style="color: {$colorStore.muted}">{command.permission} · {command.cooldownSeconds}s · used {command.useCount} times</p>
                  </div>
                  <div class="flex flex-wrap gap-2 items-center">
                    <button class="min-h-[44px] rounded-lg px-3.5 py-2.5 font-extrabold cursor-pointer transition-transform hover:scale-[1.02] border-0" onclick={() => editCommand(command)} style="background: {$colorStore.primary}12; color: {$colorStore.text};">Edit</button>
                    <button class="min-h-[44px] rounded-lg px-3.5 py-2.5 font-extrabold cursor-pointer transition-transform hover:scale-[1.02] border-0" onclick={() => removeCommand(command.name)} style="background: {$colorStore.accent}15; color: {$colorStore.accent};">Remove</button>
                  </div>
                </li>
              {/each}
            </ul>
          {:else}
            <p class="leading-relaxed" style="color: {$colorStore.muted}">No custom commands yet.</p>
          {/if}
        </section>

        <details class="rounded-xl border p-4 mt-4" style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15); border-color: {$colorStore.primary}30">
          <summary class="cursor-pointer text-lg font-bold flex items-center gap-2" style="color: {$colorStore.text}">
            <i class="fa-utility-duo fa-regular fa-book" style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary}; font-size: 18px;"></i>
            Command reference
          </summary>

          <div class="mt-4">
            <h3 class="text-base font-bold m-0" style="color: {$colorStore.text}">Discord slash commands</h3>
            <p class="mt-1 mb-2.5 leading-relaxed" style="color: {$colorStore.muted}">Manage the Twitch integration from Discord with the <code class="font-mono text-[0.85em]">/twitch</code> command group.</p>
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
            <h3 class="text-base font-bold m-0" style="color: {$colorStore.text}">Twitch chat commands</h3>
            <p class="mt-1 mb-2.5 leading-relaxed" style="color: {$colorStore.muted}">Type these in the connected Twitch channel's chat, prefixed with <code class="font-mono text-[0.85em]">{configForm.commandPrefix}</code>.</p>
            {#if chatCommands.length === 0}
              <p class="leading-relaxed" style="color: {$colorStore.muted}">No chat commands are registered.</p>
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
                <i class="fa-utility-duo fa-regular fa-rotate" style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary}; font-size: 18px;"></i>
                Repeating messages
              </h2>
              <p class="mt-1.5 leading-relaxed" style="color: {$colorStore.muted}">Rotate chat reminders with online-only and chat-activity guards.</p>
            </div>
            <div class="flex flex-wrap gap-2 items-center">
              <button class="min-h-[44px] rounded-lg px-3.5 py-2.5 font-extrabold cursor-pointer transition-transform hover:scale-[1.02] border-0" onclick={resetTimerForm} style="background: {$colorStore.primary}10; color: {$colorStore.text};">Clear</button>
              <button
                class="min-h-[44px] rounded-lg px-3.5 py-2.5 font-extrabold cursor-pointer transition-transform hover:scale-[1.02] disabled:opacity-55 disabled:cursor-not-allowed"
                disabled={timerSaving || !timerForm.name.trim() || !timerForm.messages.trim()}
                onclick={saveTimer}
                style="background: {$colorStore.primary}20; color: {$colorStore.primary}; border: 1px solid {$colorStore.primary}30;"
              >{timerSaving ? "Saving..." : "Save timer"}</button>
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label class="grid gap-2 font-bold">
              <span style="color: {$colorStore.text}">Timer name</span>
              <input bind:value={timerForm.name} placeholder="socials" class="w-full border rounded-lg p-3" style="background: {$colorStore.primary}08; color: {$colorStore.text}; border-color: {$colorStore.muted}" />
            </label>
            <label class="grid gap-2 font-bold">
              <span style="color: {$colorStore.text}">Interval minutes</span>
              <input type="number" min="1" max="1440" bind:value={timerForm.intervalMinutes} class="w-full border rounded-lg p-3" style="background: {$colorStore.primary}08; color: {$colorStore.text}; border-color: {$colorStore.muted}" />
            </label>
            <label class="grid gap-2 font-bold">
              <span style="color: {$colorStore.text}">Minimum chat messages</span>
              <input type="number" min="0" max="10000" bind:value={timerForm.minChatMessages} class="w-full border rounded-lg p-3" style="background: {$colorStore.primary}08; color: {$colorStore.text}; border-color: {$colorStore.muted}" />
            </label>
            <div class="flex items-center justify-between gap-2.5 py-2.5">
              <span style="color: {$colorStore.text}">Online only</span>
              {@render toggle(timerForm.onlineOnly, (v) => timerForm.onlineOnly = v)}
            </div>
            <div class="flex items-center justify-between gap-2.5 py-2.5">
              <span style="color: {$colorStore.text}">Random rotation</span>
              {@render toggle(timerForm.randomizeMessages, (v) => timerForm.randomizeMessages = v)}
            </div>
            <div class="flex items-center justify-between gap-2.5 py-2.5">
              <span style="color: {$colorStore.text}">Enabled</span>
              {@render toggle(timerForm.enabled, (v) => timerForm.enabled = v)}
            </div>
            <label class="grid gap-2 font-bold sm:col-span-2">
              <span style="color: {$colorStore.text}">Messages</span>
              <textarea bind:value={timerForm.messages} rows="5" placeholder={"One message per line. Try: Follow the socials: %url%"} class="w-full border rounded-lg p-3 resize-y min-h-[86px]" style="background: {$colorStore.primary}08; color: {$colorStore.text}; border-color: {$colorStore.muted}"></textarea>
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
                      every {timer.intervalMinutes}m · min chat {timer.minChatMessages} · {timer.onlineOnly ? "online only" : "always"} · {timer.randomizeMessages ? "random" : "rotating"} · last sent {formatDate(timer.lastSentAt)}
                    </p>
                  </div>
                  <div class="flex flex-wrap gap-2 items-center">
                    <button class="min-h-[44px] rounded-lg px-3.5 py-2.5 font-extrabold cursor-pointer transition-transform hover:scale-[1.02] border-0" onclick={() => editTimer(timer)} style="background: {$colorStore.primary}12; color: {$colorStore.text};">Edit</button>
                    <button class="min-h-[44px] rounded-lg px-3.5 py-2.5 font-extrabold cursor-pointer transition-transform hover:scale-[1.02] border-0" onclick={() => setTimerState(timer.name, !timer.enabled)} style="background: {$colorStore.primary}12; color: {$colorStore.text};">{timer.enabled ? "Disable" : "Enable"}</button>
                    <button class="min-h-[44px] rounded-lg px-3.5 py-2.5 font-extrabold cursor-pointer transition-transform hover:scale-[1.02] border-0 disabled:opacity-55 disabled:cursor-not-allowed" disabled={timerTesting === timer.name} onclick={() => testTimer(timer.name)} style="background: {$colorStore.primary}12; color: {$colorStore.text};">{timerTesting === timer.name ? "Sending..." : "Test"}</button>
                    <button class="min-h-[44px] rounded-lg px-3.5 py-2.5 font-extrabold cursor-pointer transition-transform hover:scale-[1.02] border-0" onclick={() => removeTimer(timer.name)} style="background: {$colorStore.accent}15; color: {$colorStore.accent};">Remove</button>
                  </div>
                </li>
              {/each}
            </ul>
          {:else}
            <p class="leading-relaxed" style="color: {$colorStore.muted}">No repeating messages yet.</p>
          {/if}
        </section>
      {:else if activeTab === "commands" && activeSubTab === "quotes"}
        <section class="rounded-xl border p-4" style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15); border-color: {$colorStore.primary}30" in:fly={{ y: 10, duration: 160 }}>
          <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
            <div>
              <h2 class="text-lg font-bold m-0 flex items-center gap-2" style="color: {$colorStore.text}">
                <i class="fa-utility-duo fa-regular fa-comment" style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary}; font-size: 18px;"></i>
                Quotes
              </h2>
              <p class="mt-1.5 leading-relaxed" style="color: {$colorStore.muted}">Manage the quote pool used by {configForm.commandPrefix}quote.</p>
            </div>
            <button
              class="min-h-[44px] rounded-lg px-3.5 py-2.5 font-extrabold cursor-pointer transition-transform hover:scale-[1.02] disabled:opacity-55 disabled:cursor-not-allowed"
              disabled={quoteSaving || !quoteForm.text.trim()}
              onclick={addQuote}
              style="background: {$colorStore.primary}20; color: {$colorStore.primary}; border: 1px solid {$colorStore.primary}30;"
            >{quoteSaving ? "Saving..." : "Add quote"}</button>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label class="grid gap-2 font-bold sm:col-span-2">
              <span style="color: {$colorStore.text}">Quote text</span>
              <textarea bind:value={quoteForm.text} rows="3" placeholder="The stream moment worth saving." class="w-full border rounded-lg p-3 resize-y min-h-[86px]" style="background: {$colorStore.primary}08; color: {$colorStore.text}; border-color: {$colorStore.muted}"></textarea>
            </label>
            <label class="grid gap-2 font-bold">
              <span style="color: {$colorStore.text}">Author</span>
              <input bind:value={quoteForm.author} placeholder="optional username" class="w-full border rounded-lg p-3" style="background: {$colorStore.primary}08; color: {$colorStore.text}; border-color: {$colorStore.muted}" />
            </label>
            <div class="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
              <label class="grid gap-2 font-bold">
                <span style="color: {$colorStore.text}">Search</span>
                <input bind:value={quoteForm.search} placeholder="filter quotes" class="w-full border rounded-lg p-3" style="background: {$colorStore.primary}08; color: {$colorStore.text}; border-color: {$colorStore.muted}" />
              </label>
              <button class="min-h-[44px] rounded-lg px-3.5 py-2.5 font-extrabold cursor-pointer transition-transform hover:scale-[1.02] border-0" onclick={refreshQuotes} style="background: {$colorStore.primary}12; color: {$colorStore.text};">Search</button>
            </div>
          </div>

          {#if quotes.length > 0}
            <ul class="grid gap-2.5 list-none m-0 p-0 mt-4">
              {#each quotes as quote (quote.id)}
                <li class="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 justify-between p-3.5 border rounded-xl" style="border-color: {$colorStore.primary}30; background: {$colorStore.primary}08">
                  <div>
                    <div class="font-extrabold font-mono" style="color: {$colorStore.primary}">#{quote.id}</div>
                    <p class="leading-relaxed" style="color: {$colorStore.text}">"{quote.text}"{quote.author ? ` - ${quote.author}` : ""}</p>
                    <p class="leading-relaxed" style="color: {$colorStore.muted}">Added {formatDate(quote.dateAdded)}{quote.addedBy ? ` by ${quote.addedBy}` : ""}</p>
                  </div>
                  <div class="flex flex-wrap gap-2 items-center">
                    <button class="min-h-[44px] rounded-lg px-3.5 py-2.5 font-extrabold cursor-pointer transition-transform hover:scale-[1.02] border-0 disabled:opacity-55 disabled:cursor-not-allowed" disabled={quoteSaving} onclick={() => removeQuote(quote.id)} style="background: {$colorStore.accent}15; color: {$colorStore.accent};">Remove</button>
                  </div>
                </li>
              {/each}
            </ul>
          {:else}
            <p class="leading-relaxed" style="color: {$colorStore.muted}">No quotes saved yet.</p>
          {/if}
        </section>
      {:else if activeTab === "events" && activeSubTab === "alerts"}
        <section class="rounded-xl border p-4" style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15); border-color: {$colorStore.primary}30" in:fly={{ y: 10, duration: 160 }}>
          <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
            <div>
              <h2 class="text-lg font-bold m-0 flex items-center gap-2" style="color: {$colorStore.text}">
                <i class="fa-utility-duo fa-regular fa-video" style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary}; font-size: 18px;"></i>
                Event routing
              </h2>
              <p class="mt-1.5 leading-relaxed" style="color: {$colorStore.muted}">Post a message when the connected channel goes live (and goes offline again).</p>
            </div>
            <button
              class="min-h-[44px] rounded-lg px-3.5 py-2.5 font-extrabold cursor-pointer transition-transform hover:scale-[1.02] disabled:opacity-55 disabled:cursor-not-allowed"
              disabled={saving}
              onclick={saveSettings}
              style="background: {$colorStore.primary}20; color: {$colorStore.primary}; border: 1px solid {$colorStore.primary}30;"
            >{saving ? "Saving..." : "Save changes"}</button>
          </div>

          {#if status?.hasChannelAuthorization}
            <p class="text-sm leading-normal" style="color: {$colorStore.muted}">
              This channel is connected via OAuth, so go-live notifications set up here replace anything configured for @{status.channelUsername} under Stream Alerts.
            </p>
          {/if}

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
            <div class="grid gap-2 font-bold">
              <span style="color: {$colorStore.text}">Go-live Discord channel</span>
              <DiscordSelector
                type="channel"
                options={textChannels}
                selected={configForm.goLiveChannelId}
                placeholder="No channel selected"
                onchange={(detail) => configForm.goLiveChannelId = detail.selected as string | null}
              />
            </div>

            <div class="sm:col-span-2">
              <span style="color: {$colorStore.text}">Go-live message</span>
              <FullscreenEmbedBuilder
                id="twitch-golive-message"
                bind:value={goLiveMessageValue}
                previewTitle="Go-Live Message"
                previewDescription="Sent to the go-live channel when the connected streamer goes live"
                icon="fa-tower-broadcast"
                allowContent={true}
                allowMultipleEmbeds={true}
                maxEmbeds={10}
                allowComponents={true}
                additionalPlaceholders={goLivePlaceholders}
                guildId={$currentGuild?.id}
                user={data.user}
              />
              <span class="block text-sm font-medium leading-normal" style="color: {$colorStore.muted}">
                Leave empty for a default embed. Placeholders: %streamer%, %title%, %game%, %url%, %viewers%.
              </span>
            </div>
          </div>

          <div class="mt-4">
            <button
              class="min-h-[44px] rounded-lg px-3.5 py-2.5 font-extrabold cursor-pointer transition-transform hover:scale-[1.02] disabled:opacity-55 disabled:cursor-not-allowed"
              disabled={testRunning === "golive"}
              onclick={() => sendTestEvent("golive")}
              style="background: {$colorStore.primary}20; color: {$colorStore.primary}; border: 1px solid {$colorStore.primary}30;"
            >{testRunning === "golive" ? "Sending..." : "Send test go-live"}</button>
          </div>
        </section>

        <section class="rounded-xl border p-4 mt-4" style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15); border-color: {$colorStore.primary}30" in:fly={{ y: 10, duration: 160 }}>
          <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
            <div>
              <h2 class="text-lg font-bold m-0 flex items-center gap-2" style="color: {$colorStore.text}">
                <i class="fa-utility-duo fa-regular fa-bell" style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary}; font-size: 18px;"></i>
                Sub and raid templates
              </h2>
              <p class="mt-1.5 leading-relaxed" style="color: {$colorStore.muted}">Configure subscription and raid messages without touching slash commands.</p>
            </div>
            <button
              class="min-h-[44px] rounded-lg px-3.5 py-2.5 font-extrabold cursor-pointer transition-transform hover:scale-[1.02] disabled:opacity-55 disabled:cursor-not-allowed"
              disabled={saving}
              onclick={saveSettings}
              style="background: {$colorStore.primary}20; color: {$colorStore.primary}; border: 1px solid {$colorStore.primary}30;"
            >{saving ? "Saving..." : "Save templates"}</button>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="grid gap-2 font-bold">
              <span style="color: {$colorStore.text}">Sub Discord channel</span>
              <DiscordSelector
                type="channel"
                options={textChannels}
                selected={configForm.subNotificationChannelId}
                placeholder="No channel selected"
                onchange={(detail) => configForm.subNotificationChannelId = detail.selected as string | null}
              />
            </div>
            <label class="grid gap-2 font-bold">
              <span style="color: {$colorStore.text}">Sub message</span>
              <textarea bind:value={configForm.subNotificationMessage} rows="3" placeholder={"%display% subscribed to %channel%!"} class="w-full border rounded-lg p-3 resize-y min-h-[86px]" style="background: {$colorStore.primary}08; color: {$colorStore.text}; border-color: {$colorStore.muted}"></textarea>
            </label>
            <div class="grid gap-2 font-bold">
              <span style="color: {$colorStore.text}">Raid Discord channel</span>
              <DiscordSelector
                type="channel"
                options={textChannels}
                selected={configForm.raidNotificationChannelId}
                placeholder="No channel selected"
                onchange={(detail) => configForm.raidNotificationChannelId = detail.selected as string | null}
              />
            </div>
            <label class="grid gap-2 font-bold">
              <span style="color: {$colorStore.text}">Raid message</span>
              <textarea bind:value={configForm.raidNotificationMessage} rows="3" placeholder={"%raider% raided %channel% with %viewers% viewers!"} class="w-full border rounded-lg p-3 resize-y min-h-[86px]" style="background: {$colorStore.primary}08; color: {$colorStore.text}; border-color: {$colorStore.muted}"></textarea>
            </label>
          </div>

          <div class="grid gap-1.5 my-3 text-sm">
            <span style="color: {$colorStore.muted}">Sub: {eventVariables.sub.join(", ")}</span>
            <span style="color: {$colorStore.muted}">Raid: {eventVariables.raid.join(", ")}</span>
          </div>

          <div class="flex flex-wrap gap-2 items-center mt-4">
            <button
              class="min-h-[44px] rounded-lg px-3.5 py-2.5 font-extrabold cursor-pointer transition-transform hover:scale-[1.02] disabled:opacity-55 disabled:cursor-not-allowed"
              disabled={testRunning === "sub"}
              onclick={() => sendTestEvent("sub")}
              style="background: {$colorStore.primary}20; color: {$colorStore.primary}; border: 1px solid {$colorStore.primary}30;"
            >{testRunning === "sub" ? "Sending..." : "Send test sub"}</button>
            <button
              class="min-h-[44px] rounded-lg px-3.5 py-2.5 font-extrabold cursor-pointer transition-transform hover:scale-[1.02] disabled:opacity-55 disabled:cursor-not-allowed"
              disabled={testRunning === "raid"}
              onclick={() => sendTestEvent("raid")}
              style="background: {$colorStore.primary}20; color: {$colorStore.primary}; border: 1px solid {$colorStore.primary}30;"
            >{testRunning === "raid" ? "Sending..." : "Send test raid"}</button>
          </div>
        </section>

        <section class="rounded-xl border p-4 mt-4" style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15); border-color: {$colorStore.primary}30" in:fly={{ y: 10, duration: 160 }}>
          <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
            <div>
              <h2 class="text-lg font-bold m-0 flex items-center gap-2" style="color: {$colorStore.text}">
                <i class="fa-utility-duo fa-regular fa-gift" style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary}; font-size: 18px;"></i>
                Channel point actions
              </h2>
              <p class="mt-1.5 leading-relaxed" style="color: {$colorStore.muted}">Map reward titles to Twitch replies or Discord posts.</p>
            </div>
            <div class="flex flex-wrap gap-2 items-center">
              <button class="min-h-[44px] rounded-lg px-3.5 py-2.5 font-extrabold cursor-pointer transition-transform hover:scale-[1.02] border-0" onclick={resetRedemptionForm} style="background: {$colorStore.primary}10; color: {$colorStore.text};">Clear</button>
              <button
                class="min-h-[44px] rounded-lg px-3.5 py-2.5 font-extrabold cursor-pointer transition-transform hover:scale-[1.02] disabled:opacity-55 disabled:cursor-not-allowed"
                disabled={redemptionSaving || !redemptionForm.rewardTitle.trim()}
                onclick={saveRedemption}
                style="background: {$colorStore.primary}20; color: {$colorStore.primary}; border: 1px solid {$colorStore.primary}30;"
              >{redemptionSaving ? "Saving..." : "Save action"}</button>
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label class="grid gap-2 font-bold">
              <span style="color: {$colorStore.text}">Reward title</span>
              <input bind:value={redemptionForm.rewardTitle} placeholder="Hydrate" class="w-full border rounded-lg p-3" style="background: {$colorStore.primary}08; color: {$colorStore.text}; border-color: {$colorStore.muted}" />
            </label>
            <div class="grid gap-2 font-bold">
              <span style="color: {$colorStore.text}">Discord channel</span>
              <DiscordSelector
                type="channel"
                options={textChannels}
                selected={redemptionForm.discordChannelId}
                placeholder="No Discord post"
                onchange={(detail) => redemptionForm.discordChannelId = detail.selected as string | null}
              />
            </div>
            <label class="grid gap-2 font-bold">
              <span style="color: {$colorStore.text}">Twitch reply</span>
              <textarea bind:value={redemptionForm.twitchResponse} rows="3" placeholder={"Thanks %display%, hydrate time."} class="w-full border rounded-lg p-3 resize-y min-h-[86px]" style="background: {$colorStore.primary}08; color: {$colorStore.text}; border-color: {$colorStore.muted}"></textarea>
            </label>
            <label class="grid gap-2 font-bold">
              <span style="color: {$colorStore.text}">Discord message</span>
              <textarea bind:value={redemptionForm.discordMessage} rows="3" placeholder={"%display% redeemed %reward%: %input%"} class="w-full border rounded-lg p-3 resize-y min-h-[86px]" style="background: {$colorStore.primary}08; color: {$colorStore.text}; border-color: {$colorStore.muted}"></textarea>
            </label>
          </div>

          <div class="grid gap-1.5 my-3 text-sm">
            <span style="color: {$colorStore.muted}">Redemptions: {eventVariables.redemption.join(", ")}</span>
          </div>

          {#if redemptions.length > 0}
            <ul class="grid gap-2.5 list-none m-0 p-0 mt-4">
              {#each redemptions as action (action.id)}
                <li class="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 justify-between p-3.5 border rounded-xl" style="border-color: {$colorStore.primary}30; background: {$colorStore.primary}08">
                  <div>
                    <div class="font-extrabold font-mono" style="color: {$colorStore.primary}">{action.rewardTitle}</div>
                    <p class="leading-relaxed" style="color: {$colorStore.muted}">Discord: {action.discordChannelId ? `#${textChannels.find((c) => c.id === action.discordChannelId?.toString())?.name || action.discordChannelId}` : "none"} · Twitch reply: {action.twitchResponse ? "yes" : "no"}</p>
                  </div>
                  <div class="flex flex-wrap gap-2 items-center">
                    <button class="min-h-[44px] rounded-lg px-3.5 py-2.5 font-extrabold cursor-pointer transition-transform hover:scale-[1.02] border-0" onclick={() => editRedemption(action)} style="background: {$colorStore.primary}12; color: {$colorStore.text};">Edit</button>
                    <button class="min-h-[44px] rounded-lg px-3.5 py-2.5 font-extrabold cursor-pointer transition-transform hover:scale-[1.02] border-0" onclick={() => removeRedemption(action.rewardTitle)} style="background: {$colorStore.accent}15; color: {$colorStore.accent};">Remove</button>
                  </div>
                </li>
              {/each}
            </ul>
          {:else}
            <p class="leading-relaxed" style="color: {$colorStore.muted}">No channel point actions yet.</p>
          {/if}
        </section>
      {:else if activeTab === "events" && activeSubTab === "live"}
        <section class="rounded-xl border p-4" style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15); border-color: {$colorStore.primary}30" in:fly={{ y: 10, duration: 160 }}>
          <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
            <div>
              <h2 class="text-lg font-bold m-0 flex items-center gap-2" style="color: {$colorStore.text}">
                <i class="fa-utility-duo fa-regular fa-sliders" style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary}; font-size: 18px;"></i>
                Stream operator tools
              </h2>
              <p class="mt-1.5 leading-relaxed" style="color: {$colorStore.muted}">Run live chat, marker, clip, poll, and moderation actions from the dashboard.</p>
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div class="grid gap-2.5 p-3.5 border rounded-xl" style="border-color: {$colorStore.primary}30; background: {$colorStore.primary}08">
              <h3 class="text-base font-bold m-0 flex items-center gap-2" style="color: {$colorStore.text}">
                <i class="fa-utility-duo fa-regular fa-comments" style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary}; font-size: 16px;"></i>
                Chat
              </h3>
              <textarea bind:value={operatorForm.chatMessage} rows="3" placeholder="Message to send in Twitch chat" class="w-full border rounded-lg p-3 resize-y min-h-[86px]" style="background: {$colorStore.primary}08; color: {$colorStore.text}; border-color: {$colorStore.muted}"></textarea>
              <button class="min-h-[44px] rounded-lg px-3.5 py-2.5 font-extrabold cursor-pointer transition-transform hover:scale-[1.02] disabled:opacity-55 disabled:cursor-not-allowed" disabled={operatorRunning === "chat" || !operatorForm.chatMessage.trim()} onclick={() => runOperatorAction("chat")} style="background: {$colorStore.primary}20; color: {$colorStore.primary}; border: 1px solid {$colorStore.primary}30;">{operatorRunning === "chat" ? "Sending..." : "Send chat"}</button>
            </div>

            <div class="grid gap-2.5 p-3.5 border rounded-xl" style="border-color: {$colorStore.primary}30; background: {$colorStore.primary}08">
              <h3 class="text-base font-bold m-0 flex items-center gap-2" style="color: {$colorStore.text}">
                <i class="fa-utility-duo fa-regular fa-video" style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary}; font-size: 16px;"></i>
                Marker and clip
              </h3>
              <input bind:value={operatorForm.markerDescription} placeholder="Marker description" class="w-full border rounded-lg p-3" style="background: {$colorStore.primary}08; color: {$colorStore.text}; border-color: {$colorStore.muted}" />
              <div class="flex flex-wrap gap-2 items-center">
                <button class="min-h-[44px] rounded-lg px-3.5 py-2.5 font-extrabold cursor-pointer transition-transform hover:scale-[1.02] disabled:opacity-55 disabled:cursor-not-allowed" disabled={operatorRunning === "marker"} onclick={() => runOperatorAction("marker")} style="background: {$colorStore.primary}20; color: {$colorStore.primary}; border: 1px solid {$colorStore.primary}30;">{operatorRunning === "marker" ? "Marking..." : "Create marker"}</button>
                <button class="min-h-[44px] rounded-lg px-3.5 py-2.5 font-extrabold cursor-pointer transition-transform hover:scale-[1.02] disabled:opacity-55 disabled:cursor-not-allowed" disabled={operatorRunning === "clip"} onclick={() => runOperatorAction("clip")} style="background: {$colorStore.primary}20; color: {$colorStore.primary}; border: 1px solid {$colorStore.primary}30;">{operatorRunning === "clip" ? "Clipping..." : "Create clip"}</button>
              </div>
            </div>

            <div class="grid gap-2.5 p-3.5 border rounded-xl" style="border-color: {$colorStore.primary}30; background: {$colorStore.primary}08">
              <h3 class="text-base font-bold m-0 flex items-center gap-2" style="color: {$colorStore.text}">
                <i class="fa-utility-duo fa-regular fa-chart-bar" style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary}; font-size: 16px;"></i>
                Poll
              </h3>
              <input bind:value={operatorForm.pollTitle} placeholder="Poll title" class="w-full border rounded-lg p-3" style="background: {$colorStore.primary}08; color: {$colorStore.text}; border-color: {$colorStore.muted}" />
              <textarea bind:value={operatorForm.pollChoices} rows="4" placeholder="One choice per line" class="w-full border rounded-lg p-3 resize-y min-h-[86px]" style="background: {$colorStore.primary}08; color: {$colorStore.text}; border-color: {$colorStore.muted}"></textarea>
              <input type="number" min="15" max="1800" bind:value={operatorForm.pollDurationSeconds} class="w-full border rounded-lg p-3" style="background: {$colorStore.primary}08; color: {$colorStore.text}; border-color: {$colorStore.muted}" />
              <button class="min-h-[44px] rounded-lg px-3.5 py-2.5 font-extrabold cursor-pointer transition-transform hover:scale-[1.02] disabled:opacity-55 disabled:cursor-not-allowed" disabled={operatorRunning === "poll" || !operatorForm.pollTitle.trim()} onclick={() => runOperatorAction("poll")} style="background: {$colorStore.primary}20; color: {$colorStore.primary}; border: 1px solid {$colorStore.primary}30;">{operatorRunning === "poll" ? "Creating..." : "Create poll"}</button>
            </div>

            <div class="grid gap-2.5 p-3.5 border rounded-xl" style="border-color: {$colorStore.primary}30; background: {$colorStore.primary}08">
              <h3 class="text-base font-bold m-0 flex items-center gap-2" style="color: {$colorStore.text}">
                <i class="fa-utility-duo fa-regular fa-shield" style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary}; font-size: 16px;"></i>
                Moderation
              </h3>
              <input bind:value={operatorForm.moderationUsername} placeholder="Twitch username" class="w-full border rounded-lg p-3" style="background: {$colorStore.primary}08; color: {$colorStore.text}; border-color: {$colorStore.muted}" />
              <input type="number" min="1" max="1209600" bind:value={operatorForm.moderationDurationSeconds} class="w-full border rounded-lg p-3" style="background: {$colorStore.primary}08; color: {$colorStore.text}; border-color: {$colorStore.muted}" />
              <input bind:value={operatorForm.moderationReason} placeholder="Reason" class="w-full border rounded-lg p-3" style="background: {$colorStore.primary}08; color: {$colorStore.text}; border-color: {$colorStore.muted}" />
              <div class="flex flex-wrap gap-2 items-center">
                <button class="min-h-[44px] rounded-lg px-3.5 py-2.5 font-extrabold cursor-pointer transition-transform hover:scale-[1.02] border-0 disabled:opacity-55 disabled:cursor-not-allowed" disabled={operatorRunning === "timeout" || !operatorForm.moderationUsername.trim()} onclick={() => runOperatorAction("timeout")} style="background: {$colorStore.primary}12; color: {$colorStore.text};">Timeout</button>
                <button class="min-h-[44px] rounded-lg px-3.5 py-2.5 font-extrabold cursor-pointer transition-transform hover:scale-[1.02] border-0 disabled:opacity-55 disabled:cursor-not-allowed" disabled={operatorRunning === "ban" || !operatorForm.moderationUsername.trim()} onclick={() => runOperatorAction("ban")} style="background: {$colorStore.accent}15; color: {$colorStore.accent};">Ban</button>
                <button class="min-h-[44px] rounded-lg px-3.5 py-2.5 font-extrabold cursor-pointer transition-transform hover:scale-[1.02] border-0 disabled:opacity-55 disabled:cursor-not-allowed" disabled={operatorRunning === "unban" || !operatorForm.moderationUsername.trim()} onclick={() => runOperatorAction("unban")} style="background: {$colorStore.primary}12; color: {$colorStore.text};">Unban</button>
              </div>
              <input bind:value={operatorForm.deleteMessageId} placeholder="Message ID to delete" class="w-full border rounded-lg p-3" style="background: {$colorStore.primary}08; color: {$colorStore.text}; border-color: {$colorStore.muted}" />
              <button class="min-h-[44px] rounded-lg px-3.5 py-2.5 font-extrabold cursor-pointer transition-transform hover:scale-[1.02] border-0 disabled:opacity-55 disabled:cursor-not-allowed" disabled={operatorRunning === "delete" || !operatorForm.deleteMessageId.trim()} onclick={() => runOperatorAction("delete")} style="background: {$colorStore.accent}15; color: {$colorStore.accent};">Delete message</button>
            </div>
          </div>
        </section>
      {:else if activeTab === "links"}
        <section class="rounded-xl border p-4" style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15); border-color: {$colorStore.primary}30" in:fly={{ y: 10, duration: 160 }}>
          <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
            <div>
              <h2 class="text-lg font-bold m-0 flex items-center gap-2" style="color: {$colorStore.text}">
                <i class="fa-utility-duo fa-regular fa-link" style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary}; font-size: 18px;"></i>
                Account links
              </h2>
              <p class="mt-1.5 leading-relaxed" style="color: {$colorStore.muted}">Link Discord members to their Twitch username so chat commands can recognise them.</p>
            </div>
          </div>

          <div class="grid gap-3 mb-5 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] sm:items-end">
            <div class="grid gap-2 font-bold">
              <span style="color: {$colorStore.text}">Discord user</span>
              <DiscordSelector
                type="user"
                options={guildMembers.map((m) => ({ id: m.id, name: m.username }))}
                selected={selectedLinkUserId}
                placeholder="Select a user"
                onchange={(detail) => selectedLinkUserId = detail.selected as string | null}
              />
            </div>
            <label class="grid gap-2 font-bold">
              <span style="color: {$colorStore.text}">Twitch username</span>
              <input bind:value={linkTwitchUsername} placeholder="twitchlogin" class="w-full border rounded-lg p-3" style="background: {$colorStore.primary}08; color: {$colorStore.text}; border-color: {$colorStore.muted}" />
            </label>
            <button
              class="min-h-[44px] rounded-lg px-3.5 py-2.5 font-extrabold cursor-pointer transition-transform hover:scale-[1.02] disabled:opacity-55 disabled:cursor-not-allowed"
              disabled={linking || !selectedLinkUserId || !linkTwitchUsername.trim()}
              onclick={addLink}
              style="background: {$colorStore.primary}20; color: {$colorStore.primary}; border: 1px solid {$colorStore.primary}30;"
            >{linking ? "Saving..." : "Add link"}</button>
          </div>

          {#if links.length === 0}
            <p class="leading-relaxed" style="color: {$colorStore.muted}">No linked accounts yet.</p>
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
                  >Remove</button>
                </li>
              {/each}
            </ul>
          {/if}
        </section>
      {/if}
    </div>
  {/if}
</DashboardPageLayout>
