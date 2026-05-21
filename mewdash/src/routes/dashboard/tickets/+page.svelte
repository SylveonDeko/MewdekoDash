<!-- routes/dashboard/tickets/+page.svelte -->
<script lang="ts">
  import { onMount } from "svelte";
  import { clientApi, ticketApi } from "$lib/api/index.ts";
  import { currentGuild } from "$lib/stores/currentGuild";
  import { colorStore } from "$lib/stores/colorStore";
  import { logger } from "$lib/logger";
  import DashboardPageLayout from "$lib/components/layout/DashboardPageLayout.svelte";
  import { loadingStore } from "$lib/stores/loadingStore";
  import ConfirmationModal from "$lib/components/ui/ConfirmationModal.svelte";

  // Import tab components
  import OverviewTab from "./components/tabs/OverviewTab.svelte";
  import PanelsTab from "./components/tabs/PanelsTab.svelte";
  import ConfigurationTab from "./components/tabs/ConfigurationTab.svelte";
  import CasesTab from "./components/tabs/CasesTab.svelte";
  import AdvancedTab from "./components/tabs/AdvancedTab.svelte";

  let { data } = $props();

  let loading = $state(true);
  let error: string | null = $state(null);
  let saving = $state(false);

  // Layout state
  let activeTab = $state("overview");

  const tabs = [
    { id: "overview", label: "Overview", icon: "fa-chart-line" },
    { id: "panels", label: "Ticket Panels", icon: "fa-table-cells" },
    { id: "configuration", label: "Configuration", icon: "fa-sliders" },
    { id: "cases", label: "Cases", icon: "fa-folder-open" },
    { id: "advanced", label: "Advanced", icon: "fa-screwdriver-wrench" }
  ];

  // Overview data
  let statistics: any = $state(null);
  let ticketActivity: any[] = $state([]);
  let staffResponseStats: any[] = $state([]);

  // Panel data
  let panels: any[] = $state([]);
  let panelStatuses = $state(new Map<bigint, number>()); // Map<panelId, status>
  let checkingPanelStatus = $state(false);
  let selectedPanel: any = $state(null);
  let panelButtons: any[] = $state([]);
  let panelSelectMenus: any[] = $state([]);

  // Configuration data
  let priorities: any[] = $state([]);
  let tags: any[] = $state([]);
  let transcriptChannelId: bigint | null = $state(null);
  let logChannelId: bigint | null = $state(null);

  // Case data
  let cases: any[] = $state([]);
  let selectedCase: any = $state(null);
  let allTickets: any[] = $state([]);

  // Advanced data
  let blacklistedUsers: any[] = $state([]);

  // Available data
  let availableRoles: any[] = $state([]);
  let textChannels: any[] = $state([]);
  let categories: any[] = $state([]);
  let guildEmojis: any[] = $state([]);

  // UI State
  let showConfirmModal = $state(false);
  let confirmModalData = $state<{
    title: string;
    message: string;
    action: (() => void) | null;
    variant: "danger" | "warning" | "info"
  }>({ title: "", message: "", action: null, variant: "danger" });

  // Panel creation state
  let showPanelCreator = $state(false);
  let newPanel = $state({
    channelId: null as string | null,
    embedJson: "",
    title: "Support Tickets",
    description: "Click a button below to create a ticket",
    color: null as number | null
  });

  // Button creation state
  let showButtonCreator = $state(false);
  let newButton = $state({
    label: "",
    emoji: null as string | null,
    style: "1", // Primary
    openMessageJson: null as string | null,
    modalJson: null as string | null,
    channelFormat: "ticket-{username}-{id}",
    categoryId: null as string | null,
    archiveCategoryId: null as string | null,
    supportRoles: [] as string[],
    viewerRoles: [] as string[],
    autoCloseTime: null as number | null,
    requiredResponseTime: null as number | null,
    maxActiveTickets: 1,
    allowedPriorities: [] as string[],
    defaultPriority: null as string | null,
    saveTranscript: false,
    deleteOnClose: false,
    lockOnClose: false,
    renameOnClose: false,
    removeCreatorOnClose: false,
    deleteDelay: null as number | null,
    lockOnArchive: false,
    renameOnArchive: false,
    removeCreatorOnArchive: false,
    autoArchiveOnClose: false
  });

  // Button editing state
  let editingButton = $state<any>(null);
  let showButtonEditor = $state(false);

  // Select menu creation state
  let showSelectMenuCreator = $state(false);
  let newSelectMenu = $state({
    placeholder: "Select a ticket type",
    firstOptionLabel: "",
    firstOptionDescription: null as string | null,
    firstOptionEmoji: null as string | null
  });

  // Priority creation state
  let showPriorityCreator = $state(false);
  let newPriority = $state({
    id: "",
    name: "",
    emoji: "",
    level: 1,
    pingStaff: false,
    responseTime: "PT5M", // 5 minutes default
    color: 0x3498db
  });

  // Tag creation state
  let showTagCreator = $state(false);
  let newTag = $state({
    id: "",
    name: "",
    description: "",
    color: 0x3498db
  });

  // Case creation state
  let showCaseCreator = $state(false);
  let newCase = $state<{ title: string; description: string; creatorId: bigint }>({
    title: "",
    description: "",
    creatorId: BigInt(0)
  });
  $effect(() => {
    if (data?.user?.id && newCase.creatorId === BigInt(0)) {
      newCase.creatorId = BigInt(data.user.id);
    }
  });

  async function fetchAllData() {
    if (!$currentGuild?.id || !data?.user?.id) return;

    return await loadingStore.wrap("fetch-ticket-data", async () => {
      try {
        loading = true;

        // Use the optimized overview endpoint for the main data
        // Only fetch auxiliary data (roles, channels, etc.) separately
        // Note: allTickets and panelStatuses are loaded lazily when their tabs are accessed
        const [
          overviewData,
          blacklistData,
          settingsData,
          rolesData,
          textChannelsData,
          categoriesData,
          emojisData
        ] = await Promise.all([
          ticketApi.getTicketOverview($currentGuild.id, 30).catch(() => null),
          ticketApi.getTicketBlacklist($currentGuild.id).catch(() => []),
          ticketApi.getTicketSettings($currentGuild.id).catch(() => null),
          clientApi.getRoles($currentGuild.id),
          clientApi.getTextChannels($currentGuild.id),
          clientApi.getCategories($currentGuild.id),
          clientApi.getEmojis(BigInt(data.user!.id), false).catch(() => [])
        ]);

        // Unpack the overview data
        if (overviewData) {
          statistics = overviewData.statistics || null;
          ticketActivity = overviewData.ticketActivity || [];
          staffResponseStats = overviewData.staffResponseStats || [];
          panels = overviewData.panels || [];
          priorities = overviewData.priorities || [];
          tags = overviewData.tags || [];
          cases = overviewData.cases || [];
        } else {
          statistics = null;
          ticketActivity = [];
          staffResponseStats = [];
          panels = [];
          priorities = [];
          tags = [];
          cases = [];
        }

        // Set the rest of the data
        // panelStatuses and allTickets are loaded lazily when needed (Panels/Cases tabs)
        blacklistedUsers = blacklistData || [];
        transcriptChannelId = settingsData?.transcriptChannelId || null;
        logChannelId = settingsData?.logChannelId || null;
        availableRoles = rolesData || [];
        textChannels = textChannelsData || [];
        categories = categoriesData || [];
        guildEmojis = emojisData || [];

      } catch (err) {
        logger.error("Failed to fetch ticket data:", err);
        error = "Failed to load ticket data";
      } finally {
        loading = false;
      }
    }, "api", "Loading ticket data...");
  }

  async function loadPanelDetails(panelId: bigint) {
    if (!$currentGuild?.id) return;

    try {
      const [buttons, menus] = await Promise.all([
        ticketApi.getPanelButtons($currentGuild.id, panelId),
        ticketApi.getPanelSelectMenus($currentGuild.id, panelId)
      ]);

      panelButtons = buttons || [];
      panelSelectMenus = menus || [];
    } catch (err) {
      logger.error("Failed to load panel details:", err);
    }
  }

  async function loadAllTickets() {
    if (!$currentGuild?.id || allTickets.length > 0) return;

    try {
      const tickets = await ticketApi.getGuildTickets($currentGuild.id, true, true, false);
      allTickets = tickets || [];
    } catch (err) {
      logger.error("Failed to load all tickets:", err);
    }
  }

  async function checkPanelStatus(panelId: bigint) {
    if (!$currentGuild?.id) return;

    try {
      checkingPanelStatus = true;
      const result = await ticketApi.getSinglePanelStatus($currentGuild.id, panelId);
      panelStatuses.set(result.panelId, result.status);
      // Trigger reactivity
      panelStatuses = new Map(panelStatuses);
    } catch (err) {
      logger.error("Failed to check panel status:", err);
    } finally {
      checkingPanelStatus = false;
    }
  }

  function showConfirm(title: string, message: string, action: () => void, variant: "danger" | "warning" | "info" = "danger") {
    confirmModalData = { title, message, action, variant };
    showConfirmModal = true;
  }

  // Panel embed for creator
  let panelEmbed = $state({
    title: "Support Tickets",
    description: "Click a button below to create a ticket",
    color: "#5865F2",
    url: "",
    author: { name: "", url: "", icon_url: "" },
    thumbnail: { url: "" },
    image: { url: "" },
    footer: { text: "", icon_url: "" },
    fields: []
  });

  function cleanEmbed(embed: any) {
    const cleaned: any = {};
    if (embed.title?.trim()) cleaned.title = embed.title;
    if (embed.description?.trim()) cleaned.description = embed.description;
    if (embed.color) cleaned.color = embed.color;
    if (embed.url?.trim()) cleaned.url = embed.url;

    if (embed.author?.name?.trim() || embed.author?.url?.trim() || embed.author?.icon_url?.trim()) {
      cleaned.author = {};
      if (embed.author.name?.trim()) cleaned.author.name = embed.author.name;
      if (embed.author.url?.trim()) cleaned.author.url = embed.author.url;
      if (embed.author.icon_url?.trim()) cleaned.author.icon_url = embed.author.icon_url;
    }

    if (embed.footer?.text?.trim() || embed.footer?.icon_url?.trim()) {
      cleaned.footer = {};
      if (embed.footer.text?.trim()) cleaned.footer.text = embed.footer.text;
      if (embed.footer.icon_url?.trim()) cleaned.footer.icon_url = embed.footer.icon_url;
    }

    if (embed.thumbnail?.url?.trim()) cleaned.thumbnail = { url: embed.thumbnail.url };
    if (embed.image?.url?.trim()) cleaned.image = { url: embed.image.url };
    if (embed.fields?.length > 0) cleaned.fields = embed.fields;

    return cleaned;
  }

  // Panel Management Functions
  async function createPanel() {
    if (!$currentGuild?.id || !newPanel.channelId) return;

    try {
      saving = true;

      // panelEmbed is already a message object from FullscreenEmbedBuilder
      const embedJson = Object.keys(panelEmbed).length > 0 ? JSON.stringify(panelEmbed) : "";

      await ticketApi.createTicketPanel($currentGuild.id, {
        channelId: BigInt(newPanel.channelId),
        embedJson: embedJson,
        title: null,
        description: null,
        color: null
      });

      showPanelCreator = false;
      newPanel = {
        channelId: null,
        embedJson: "",
        title: "Support Tickets",
        description: "Click a button below to create a ticket",
        color: null
      };
      panelEmbed = {
        title: "Support Tickets",
        description: "Click a button below to create a ticket",
        color: "#5865F2",
        url: "",
        author: { name: "", url: "", icon_url: "" },
        thumbnail: { url: "" },
        image: { url: "" },
        footer: { text: "", icon_url: "" },
        fields: []
      };
      await fetchAllData();
    } catch (err) {
      logger.error("Failed to create panel:", err);
    } finally {
      saving = false;
    }
  }

  async function deletePanel(panelId: bigint, force: boolean = false) {
    if (!$currentGuild?.id) return;

    try {
      await ticketApi.deleteTicketPanel($currentGuild.id, panelId, force);
      selectedPanel = null;
      panelButtons = [];
      panelSelectMenus = [];
      await fetchAllData();
    } catch (err) {
      logger.error("Failed to delete panel:", err);
    }
  }

  async function recreatePanel(panelId: bigint) {
    if (!$currentGuild?.id) return;

    try {
      await ticketApi.recreateTicketPanel($currentGuild.id, panelId);
      await fetchAllData();
    } catch (err) {
      logger.error("Failed to recreate panel:", err);
    }
  }

  // Panel editing state (now inline, not modal)
  let editingPanelEmbed = $state(false);
  let tempPanelEmbed: any = $state({});

  async function savePanelEmbed(embedData: any) {
    if (!$currentGuild?.id || !selectedPanel) return;

    try {
      saving = true;
      // embedData is already a message object from FullscreenEmbedBuilder
      const embedJson = Object.keys(embedData).length > 0 ? JSON.stringify(embedData) : "";
      await ticketApi.updateTicketPanelEmbed($currentGuild.id, selectedPanel.messageId, { embedJson });

      editingPanelEmbed = false;
      await fetchAllData();
      if (selectedPanel) {
        await loadPanelDetails(selectedPanel.messageId);
      }
    } catch (err) {
      logger.error("Failed to update panel embed:", err);
    } finally {
      saving = false;
    }
  }

  async function movePanel(newChannelId: bigint) {
    if (!$currentGuild?.id || !selectedPanel) return;

    try {
      await ticketApi.moveTicketPanel($currentGuild.id, selectedPanel.messageId, newChannelId);
      await fetchAllData();
    } catch (err) {
      logger.error("Failed to move panel:", err);
    }
  }

  async function duplicatePanel(newChannelId: bigint) {
    if (!$currentGuild?.id || !selectedPanel) return;

    try {
      await ticketApi.duplicateTicketPanel($currentGuild.id, selectedPanel.messageId);
      await fetchAllData();
    } catch (err) {
      logger.error("Failed to duplicate panel:", err);
    }
  }

  async function addButton() {
    if (!$currentGuild?.id || !selectedPanel || !newButton.label) return;

    try {
      saving = true;
      await ticketApi.addPanelButton($currentGuild.id, selectedPanel.messageId, {
        label: newButton.label,
        emoji: newButton.emoji || null,
        style: typeof newButton.style === "string" ? parseInt(newButton.style) : newButton.style,
        openMessageJson: newButton.openMessageJson || null,
        modalJson: newButton.modalJson || null,
        channelFormat: newButton.channelFormat || null,
        categoryId: newButton.categoryId ? BigInt(newButton.categoryId) : null,
        archiveCategoryId: newButton.archiveCategoryId ? BigInt(newButton.archiveCategoryId) : null,
        supportRoles: newButton.supportRoles?.length > 0 ? newButton.supportRoles.map(r => BigInt(r)) : null,
        viewerRoles: newButton.viewerRoles?.length > 0 ? newButton.viewerRoles.map(r => BigInt(r)) : null,
        autoCloseTime: newButton.autoCloseTime ? `PT${newButton.autoCloseTime}H` : null,
        requiredResponseTime: newButton.requiredResponseTime ? `PT${newButton.requiredResponseTime}M` : null,
        maxActiveTickets: newButton.maxActiveTickets,
        allowedPriorities: newButton.allowedPriorities?.length > 0 ? newButton.allowedPriorities : null,
        defaultPriority: newButton.defaultPriority || null
      });

      showButtonCreator = false;
      resetButtonForm();
      await loadPanelDetails(selectedPanel.messageId);
    } catch (err) {
      logger.error("Failed to add button:", err);
    } finally {
      saving = false;
    }
  }

  async function loadFullButton(buttonId: number) {
    if (!$currentGuild?.id) return null;

    try {
      const buttonDetails = await ticketApi.getButton($currentGuild.id, buttonId);
      console.log("Raw button details from API:", buttonDetails);
      return buttonDetails;
    } catch (err) {
      logger.error("Failed to load button details:", err);
      return null;
    }
  }

  async function saveButtonEdits(button: any) {
    if (!$currentGuild?.id || !button.id) return;

    // Optimistic update - update local state immediately
    const buttonIndex = panelButtons.findIndex(b => b.id === button.id);
    const previousButton = buttonIndex >= 0 ? { ...panelButtons[buttonIndex] } : null;

    if (buttonIndex >= 0) {
      panelButtons[buttonIndex] = { ...panelButtons[buttonIndex], ...button };
      panelButtons = [...panelButtons]; // Trigger reactivity
    }

    try {
      saving = true;

      // Helper to handle TimeSpan values - keep them in HH:mm:ss format if already a string, convert numbers to ISO 8601
      const formatTimeSpan = (value: any, unit: "H" | "M" | "S"): string | null => {
        if (!value) return null;

        // If it's already a TimeSpan string like "01:30:00", keep it as-is
        if (typeof value === "string" && value.includes(":")) {
          return value;
        }

        // Otherwise it's a number, convert to ISO 8601
        return `PT${value}${unit}`;
      };

      // Prepare update request - only send properties that exist in UpdateButtonRequest model
      const updateRequest: any = {
        label: button.label || null,
        emoji: button.emoji || null,
        style: typeof button.style === "string" ? parseInt(button.style) : button.style,
        categoryId: button.categoryId ? BigInt(button.categoryId) : null,
        archiveCategoryId: button.archiveCategoryId ? BigInt(button.archiveCategoryId) : null,
        supportRoles: button.supportRoles?.length > 0 ? button.supportRoles.map((r: string) => BigInt(r)) : null,
        viewerRoles: button.viewerRoles?.length > 0 ? button.viewerRoles.map((r: string) => BigInt(r)) : null,
        autoCloseTime: formatTimeSpan(button.autoCloseTime, "H"),
        requiredResponseTime: formatTimeSpan(button.requiredResponseTime, "M"),
        maxActiveTickets: button.maxActiveTickets,
        allowedPriorities: button.allowedPriorities?.length > 0 ? button.allowedPriorities : null,
        defaultPriority: button.defaultPriority || null,
        saveTranscript: button.saveTranscript,
        deleteOnClose: button.deleteOnClose,
        lockOnClose: button.lockOnClose,
        renameOnClose: button.renameOnClose,
        removeCreatorOnClose: button.removeCreatorOnClose,
        deleteDelay: formatTimeSpan(button.deleteDelay, "S"),
        lockOnArchive: button.lockOnArchive,
        renameOnArchive: button.renameOnArchive,
        removeCreatorOnArchive: button.removeCreatorOnArchive,
        autoArchiveOnClose: button.autoArchiveOnClose,
        modalJson: button.modalJson || null,
        openMessageJson: button.openMessageJson || null
      };

      console.log("Sending update request:", updateRequest);

      await ticketApi.updateButton($currentGuild.id, button.id, updateRequest);

      // Success - no need to reload, optimistic update is correct
    } catch (err) {
      logger.error("Failed to update button:", err);
      // Rollback on error
      if (previousButton && buttonIndex >= 0) {
        panelButtons[buttonIndex] = previousButton;
        panelButtons = [...panelButtons]; // Trigger reactivity
      }
    } finally {
      saving = false;
    }
  }

  async function deleteButton(buttonId: number) {
    if (!$currentGuild?.id) return;

    try {
      await ticketApi.deleteButton($currentGuild.id, buttonId);
      if (selectedPanel) {
        await loadPanelDetails(selectedPanel.messageId);
      }
    } catch (err) {
      logger.error("Failed to delete button:", err);
    }
  }

  async function reorderButtons(buttonOrder: number[]) {
    if (!$currentGuild?.id || !selectedPanel) return;

    try {
      await ticketApi.reorderPanelButtons($currentGuild.id, selectedPanel.messageId, {
        buttonOrder
      });
      await loadPanelDetails(selectedPanel.messageId);
    } catch (err) {
      logger.error("Failed to reorder buttons:", err);
    }
  }

  async function addSelectMenu() {
    if (!$currentGuild?.id || !selectedPanel || !newSelectMenu.placeholder || !newSelectMenu.firstOptionLabel) return;

    try {
      saving = true;
      await ticketApi.addPanelSelectMenu($currentGuild.id, selectedPanel.messageId, newSelectMenu);

      showSelectMenuCreator = false;
      newSelectMenu = {
        placeholder: "Select a ticket type",
        firstOptionLabel: "",
        firstOptionDescription: null,
        firstOptionEmoji: null
      };
      await loadPanelDetails(selectedPanel.messageId);
    } catch (err) {
      logger.error("Failed to add select menu:", err);
    } finally {
      saving = false;
    }
  }

  async function deleteSelectMenu(menuId: number) {
    if (!$currentGuild?.id) return;

    try {
      await ticketApi.deleteSelectMenu($currentGuild.id, menuId);
      if (selectedPanel) {
        await loadPanelDetails(selectedPanel.messageId);
      }
    } catch (err) {
      logger.error("Failed to delete select menu:", err);
    }
  }

  async function updateMenuPlaceholder(menuId: number, placeholder: string) {
    if (!$currentGuild?.id) return;

    try {
      await ticketApi.updateSelectMenuPlaceholder($currentGuild.id, menuId, { placeholder });
      if (selectedPanel) {
        await loadPanelDetails(selectedPanel.messageId);
      }
    } catch (err) {
      logger.error("Failed to update menu placeholder:", err);
    }
  }

  async function addSelectOption(menuId: number, option: any) {
    if (!$currentGuild?.id) return;

    try {
      await ticketApi.addSelectMenuOption($currentGuild.id, menuId, option);
      if (selectedPanel) {
        await loadPanelDetails(selectedPanel.messageId);
      }
    } catch (err) {
      logger.error("Failed to add select option:", err);
    }
  }

  async function loadFullSelectOption(optionId: number) {
    if (!$currentGuild?.id) return null;

    try {
      const optionDetails = await ticketApi.getSelectMenuOption($currentGuild.id, optionId);
      console.log("Raw select option details from API:", optionDetails);
      return optionDetails;
    } catch (err) {
      logger.error("Failed to load select option details:", err);
      return null;
    }
  }

  async function saveSelectOption(option: any) {
    if (!$currentGuild?.id || !option.id) return;

    // Optimistic update - find and update the option in panelSelectMenus
    let menuIndex = -1;
    let optionIndex = -1;
    let previousOption: any = null;

    for (let i = 0; i < panelSelectMenus.length; i++) {
      const menu = panelSelectMenus[i];
      if (menu.options) {
        const idx = menu.options.findIndex((o: any) => o.id === option.id);
        if (idx >= 0) {
          menuIndex = i;
          optionIndex = idx;
          previousOption = { ...menu.options[idx] };
          // Update the option
          menu.options[idx] = { ...menu.options[idx], ...option };
          break;
        }
      }
    }

    if (menuIndex >= 0) {
      panelSelectMenus = [...panelSelectMenus]; // Trigger reactivity
    }

    try {
      saving = true;

      // Helper to handle TimeSpan values - keep them in HH:mm:ss format if already a string, convert numbers to ISO 8601
      const formatTimeSpan = (value: any, unit: "H" | "M" | "S"): string | null => {
        if (!value) return null;

        // If it's already a TimeSpan string like "01:30:00", keep it as-is
        if (typeof value === "string" && value.includes(":")) {
          return value;
        }

        // Otherwise it's a number, convert to ISO 8601
        return `PT${value}${unit}`;
      };

      // Prepare update request
      const updateRequest: any = {
        label: option.label || null,
        description: option.description || null,
        emoji: option.emoji || null,
        categoryId: option.categoryId ? BigInt(option.categoryId) : null,
        archiveCategoryId: option.archiveCategoryId ? BigInt(option.archiveCategoryId) : null,
        supportRoles: option.supportRoles?.length > 0 ? option.supportRoles.map((r: string) => BigInt(r)) : null,
        viewerRoles: option.viewerRoles?.length > 0 ? option.viewerRoles.map((r: string) => BigInt(r)) : null,
        autoCloseTime: formatTimeSpan(option.autoCloseTime, "H"),
        requiredResponseTime: formatTimeSpan(option.requiredResponseTime, "M"),
        maxActiveTickets: option.maxActiveTickets,
        allowedPriorities: option.allowedPriorities?.length > 0 ? option.allowedPriorities : null,
        defaultPriority: option.defaultPriority || null,
        saveTranscript: option.saveTranscript,
        deleteOnClose: option.deleteOnClose,
        lockOnClose: option.lockOnClose,
        renameOnClose: option.renameOnClose,
        removeCreatorOnClose: option.removeCreatorOnClose,
        deleteDelay: formatTimeSpan(option.deleteDelay, "S"),
        lockOnArchive: option.lockOnArchive,
        renameOnArchive: option.renameOnArchive,
        removeCreatorOnArchive: option.removeCreatorOnArchive,
        autoArchiveOnClose: option.autoArchiveOnClose,
        modalJson: option.modalJson || null,
        openMessageJson: option.openMessageJson || null
      };

      console.log("Sending select option update request:", updateRequest);

      await ticketApi.updateSelectMenuOption($currentGuild.id, option.id, updateRequest);

      // Success - no need to reload, optimistic update is correct
    } catch (err) {
      logger.error("Failed to update select option:", err);
      // Rollback on error
      if (previousOption && menuIndex >= 0 && optionIndex >= 0) {
        panelSelectMenus[menuIndex].options[optionIndex] = previousOption;
        panelSelectMenus = [...panelSelectMenus]; // Trigger reactivity
      }
    } finally {
      saving = false;
    }
  }

  async function deleteSelectOption(optionId: number) {
    if (!$currentGuild?.id) return;

    try {
      await ticketApi.deleteSelectMenuOption($currentGuild.id, optionId);
      if (selectedPanel) {
        await loadPanelDetails(selectedPanel.messageId);
      }
    } catch (err) {
      logger.error("Failed to delete select option:", err);
    }
  }

  // Priority Management Functions
  async function createPriority() {
    if (!$currentGuild?.id || !newPriority.id || !newPriority.name) return;

    try {
      saving = true;
      await ticketApi.createTicketPriority($currentGuild.id, newPriority);

      showPriorityCreator = false;
      newPriority = {
        id: "",
        name: "",
        emoji: "",
        level: 1,
        pingStaff: false,
        responseTime: "PT5M",
        color: 0x3498db
      };
      await fetchAllData();
    } catch (err) {
      logger.error("Failed to create priority:", err);
    } finally {
      saving = false;
    }
  }

  async function deletePriority(priorityId: number) {
    if (!$currentGuild?.id) return;

    try {
      await ticketApi.deleteTicketPriority($currentGuild.id, priorityId);
      await fetchAllData();
    } catch (err) {
      logger.error("Failed to delete priority:", err);
    }
  }

  // Tag Management Functions
  async function createTag() {
    if (!$currentGuild?.id || !newTag.id || !newTag.name) return;

    try {
      saving = true;
      await ticketApi.createTicketTag($currentGuild.id, newTag);

      showTagCreator = false;
      newTag = {
        id: "",
        name: "",
        description: "",
        color: 0x3498db
      };
      await fetchAllData();
    } catch (err) {
      logger.error("Failed to create tag:", err);
    } finally {
      saving = false;
    }
  }

  async function deleteTag(tagId: number) {
    if (!$currentGuild?.id) return;

    try {
      await ticketApi.deleteTicketTag($currentGuild.id, tagId);
      await fetchAllData();
    } catch (err) {
      logger.error("Failed to delete tag:", err);
    }
  }

  // Case Management Functions
  async function createCase() {
    if (!$currentGuild?.id || !newCase.title || !data?.user?.id) return;

    try {
      saving = true;
      await ticketApi.createTicketCase($currentGuild.id, newCase);

      showCaseCreator = false;
      newCase = {
        title: "",
        description: "",
        creatorId: BigInt(data.user.id)
      };
      await fetchAllData();
    } catch (err) {
      logger.error("Failed to create case:", err);
    } finally {
      saving = false;
    }
  }

  async function closeCase(caseId: number, archiveTickets: boolean = false) {
    if (!$currentGuild?.id) return;

    try {
      await ticketApi.closeTicketCase($currentGuild.id, caseId);
      await fetchAllData();
    } catch (err) {
      logger.error("Failed to close case:", err);
    }
  }

  async function reopenCase(caseId: number) {
    if (!$currentGuild?.id) return;

    try {
      await ticketApi.reopenTicketCase($currentGuild.id, caseId);
      await fetchAllData();
    } catch (err) {
      logger.error("Failed to reopen case:", err);
    }
  }

  async function linkTicketsToCase(caseId: number, ticketIds: number[]) {
    if (!$currentGuild?.id) return;

    try {
      await ticketApi.linkTicketsToCase($currentGuild.id, caseId, ticketIds);
      await fetchAllData();
      if (selectedCase?.id === caseId) {
        selectedCase = await ticketApi.getTicketCase($currentGuild.id, caseId);
      }
    } catch (err) {
      logger.error("Failed to link tickets to case:", err);
    }
  }

  async function unlinkTickets(ticketIds: number[]) {
    if (!$currentGuild?.id) return;

    try {
      await ticketApi.unlinkTickets($currentGuild.id, ticketIds);
      await fetchAllData();
      if (selectedCase) {
        selectedCase = await ticketApi.getTicketCase($currentGuild.id, selectedCase.id);
      }
    } catch (err) {
      logger.error("Failed to unlink tickets:", err);
    }
  }

  // Advanced Functions
  async function blacklistUser(userId: bigint, reason: string = "") {
    if (!$currentGuild?.id) return;

    try {
      await ticketApi.blacklistUser($currentGuild.id, userId, { reason });
      await fetchAllData();
    } catch (err) {
      logger.error("Failed to blacklist user:", err);
    }
  }

  async function unblacklistUser(userId: bigint) {
    if (!$currentGuild?.id) return;

    try {
      await ticketApi.unblacklistUser($currentGuild.id, userId);
      await fetchAllData();
    } catch (err) {
      logger.error("Failed to unblacklist user:", err);
    }
  }

  async function closeInactiveTickets(hours: number) {
    if (!$currentGuild?.id) return;

    try {
      await ticketApi.closeInactiveTickets($currentGuild.id, hours);
      await fetchAllData();
    } catch (err) {
      logger.error("Failed to close inactive tickets:", err);
    }
  }

  async function setTranscriptChannel(channelId: bigint | null) {
    if (!$currentGuild?.id) return;

    try {
      await ticketApi.setTicketTranscriptChannel($currentGuild.id, { channelId: channelId || BigInt(0) });
      transcriptChannelId = channelId;
    } catch (err) {
      logger.error("Failed to set transcript channel:", err);
    }
  }

  async function setLogChannel(channelId: bigint | null) {
    if (!$currentGuild?.id) return;

    try {
      await ticketApi.setTicketLogChannel($currentGuild.id, { channelId: channelId || BigInt(0) });
      logChannelId = channelId;
    } catch (err) {
      logger.error("Failed to set log channel:", err);
    }
  }

  function resetButtonForm() {
    newButton = {
      label: "",
      emoji: null,
      style: "1",
      openMessageJson: null,
      modalJson: null,
      channelFormat: "ticket-{username}-{id}",
      categoryId: null,
      archiveCategoryId: null,
      supportRoles: [],
      viewerRoles: [],
      autoCloseTime: null,
      requiredResponseTime: null,
      maxActiveTickets: 1,
      allowedPriorities: [],
      defaultPriority: null,
      saveTranscript: false,
      deleteOnClose: false,
      lockOnClose: false,
      renameOnClose: false,
      removeCreatorOnClose: false,
      deleteDelay: null,
      lockOnArchive: false,
      renameOnArchive: false,
      removeCreatorOnArchive: false,
      autoArchiveOnClose: false
    };
  }

  onMount(() => {
    fetchAllData();
  });

  $effect(() => {
    if ($currentGuild) {
      fetchAllData();
    }
  });

  // Lazy-load tickets when Cases tab is accessed
  $effect(() => {
    if (activeTab === "cases" && $currentGuild?.id) {
      loadAllTickets();
    }
  });
</script>

<DashboardPageLayout
  guildName={$currentGuild?.name || "Dashboard"}
  subtitle="Manage support tickets, panels, and cases"
  icon="fa-ticket"
  tabs={tabs}
  title="Ticket System"
  bind:activeTab
>

  {#if loading}
    <div class="flex items-center justify-center py-12">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2" style="border-color: {$colorStore.primary}"></div>
      <span class="ml-3" style="color: {$colorStore.text}">Loading ticket system data...</span>
    </div>
  {:else if error}
    <div class="p-6 rounded-xl mb-6 transition-all" role="alert"
         style="background: {$colorStore.accent}10; border: 1px solid {$colorStore.accent}40;">
      <div class="flex items-center gap-3">
        <i class="fa-utility-duo fa-regular fa-triangle-exclamation"
           style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary}; font-size: 24px;"></i>
        <div style="color: {$colorStore.accent}">
          <div class="font-semibold text-lg">Error Occurred</div>
          <div class="text-sm mt-1" style="color: {$colorStore.accent}90">{error}</div>
        </div>
      </div>
    </div>
  {:else}

    {#if activeTab === 'overview'}
      <OverviewTab
        {statistics}
        {ticketActivity}
        {staffResponseStats}
        {panels}
        {priorities}
        {tags}
        {cases}
        bind:activeTab
      />
    {/if}

    {#if activeTab === 'panels'}
      <PanelsTab
        {data}
        {panels}
        {panelStatuses}
        {checkingPanelStatus}
        bind:selectedPanel
        {panelButtons}
        {panelSelectMenus}
        bind:showPanelCreator
        bind:newPanel
        bind:panelEmbed
        bind:showButtonCreator
        bind:newButton
        bind:showSelectMenuCreator
        bind:newSelectMenu
        bind:editingPanelEmbed
        bind:tempPanelEmbed
        {textChannels}
        {categories}
        {availableRoles}
        {priorities}
        {guildEmojis}
        {saving}
        {createPanel}
        {deletePanel}
        {recreatePanel}
        {savePanelEmbed}
        {movePanel}
        {duplicatePanel}
        {loadPanelDetails}
        {addButton}
        {loadFullButton}
        saveButton={saveButtonEdits}
        {deleteButton}
        {reorderButtons}
        {addSelectMenu}
        {deleteSelectMenu}
        {updateMenuPlaceholder}
        {addSelectOption}
        {loadFullSelectOption}
        {saveSelectOption}
        {deleteSelectOption}
        {showConfirm}
        {fetchAllData}
        {checkPanelStatus}
      />
    {/if}

    {#if activeTab === 'configuration'}
      <ConfigurationTab
        {priorities}
        {tags}
        {transcriptChannelId}
        {logChannelId}
        bind:showPriorityCreator
        bind:newPriority
        bind:showTagCreator
        bind:newTag
        {textChannels}
        {guildEmojis}
        {saving}
        {createPriority}
        {deletePriority}
        {createTag}
        {deleteTag}
        {setTranscriptChannel}
        {setLogChannel}
        {showConfirm}
        {fetchAllData}
      />
    {/if}

    {#if activeTab === 'cases'}
      <CasesTab
        {cases}
        bind:selectedCase
        bind:showCaseCreator
        bind:newCase
        {allTickets}
        {saving}
        {createCase}
        {closeCase}
        {reopenCase}
        {linkTicketsToCase}
        {unlinkTickets}
        {showConfirm}
        {fetchAllData}
      />
    {/if}

    {#if activeTab === 'advanced'}
      <AdvancedTab
        {blacklistedUsers}
        {panels}
        {categories}
        {availableRoles}
        {saving}
        {blacklistUser}
        {unblacklistUser}
        {closeInactiveTickets}
        {showConfirm}
        {fetchAllData}
      />
    {/if}
  {/if}
</DashboardPageLayout>

<ConfirmationModal
  bind:isOpen={showConfirmModal}
  message={confirmModalData.message}
  oncancel={() => showConfirmModal = false}
  onconfirm={() => confirmModalData.action?.()}
  title={confirmModalData.title}
  variant={confirmModalData.variant}
/>

<style lang="postcss">
    @reference '../../../app.css';
</style>
