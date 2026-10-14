<!-- components/tabs/PanelsTab.svelte -->
<script lang="ts">
  import { m } from "$lib/i18n";
  import { colorStore } from "$lib/stores/colorStore";
  import { currentGuild } from "$lib/stores/currentGuild";
  import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";
  import FullscreenEmbedBuilder from "$lib/components/specialized/FullscreenEmbedBuilder.svelte";
  import EmojiPicker from "$lib/components/forms/EmojiPicker.svelte";
  import TabNavigation from "$lib/components/specialized/TabNavigation.svelte";
  import ModalBuilder from "../editors/ModalBuilder.svelte";

  interface Props {
    data: any;
    panels: any[];
    panelStatuses: Map<bigint, number>;
    checkingPanelStatus: boolean;
    selectedPanel: any;
    panelButtons: any[];
    panelSelectMenus: any[];
    showPanelCreator: boolean;
    newPanel: any;
    panelEmbed: any;
    showButtonCreator: boolean;
    newButton: any;
    showSelectMenuCreator: boolean;
    newSelectMenu: any;
    textChannels: any[];
    categories: any[];
    availableRoles: any[];
    priorities: any[];
    guildEmojis: any[];
    saving: boolean;
    createPanel: () => Promise<void>;
    deletePanel: (panelId: bigint, force: boolean) => Promise<void>;
    recreatePanel: (panelId: bigint) => Promise<void>;
    editingPanelEmbed: boolean;
    tempPanelEmbed: any;
    savePanelEmbed: (embedData: any) => Promise<void>;
    movePanel: (newChannelId: bigint) => Promise<void>;
    duplicatePanel: (newChannelId: bigint) => Promise<void>;
    loadPanelDetails: (panelId: bigint) => Promise<void>;
    addButton: () => Promise<void>;
    loadFullButton: (buttonId: number) => Promise<any>;
    saveButton: (button: any) => Promise<void>;
    deleteButton: (buttonId: number) => Promise<void>;
    reorderButtons: (buttonOrder: number[]) => Promise<void>;
    addSelectMenu: () => Promise<void>;
    deleteSelectMenu: (menuId: number) => Promise<void>;
    updateMenuPlaceholder: (menuId: number, placeholder: string) => Promise<void>;
    addSelectOption: (menuId: number, option: any) => Promise<void>;
    loadFullSelectOption: (optionId: number) => Promise<any>;
    saveSelectOption: (option: any) => Promise<void>;
    deleteSelectOption: (optionId: number) => Promise<void>;
    showConfirm: (title: string, message: string, action: () => void, variant?: "danger" | "warning" | "info") => void;
    fetchAllData: () => Promise<void>;
    checkPanelStatus: (panelId: bigint) => Promise<void>;
  }

  let {
    data,
    panels,
    panelStatuses,
    checkingPanelStatus,
    selectedPanel = $bindable(),
    panelButtons,
    panelSelectMenus,
    showPanelCreator = $bindable(),
    newPanel = $bindable(),
    panelEmbed = $bindable(),
    showButtonCreator = $bindable(),
    newButton = $bindable(),
    showSelectMenuCreator = $bindable(),
    newSelectMenu = $bindable(),
    textChannels,
    categories,
    availableRoles,
    priorities,
    guildEmojis,
    saving,
    createPanel,
    deletePanel,
    recreatePanel,
    editingPanelEmbed = $bindable(),
    tempPanelEmbed = $bindable(),
    savePanelEmbed,
    movePanel,
    duplicatePanel,
    loadPanelDetails,
    addButton,
    loadFullButton,
    saveButton,
    deleteButton,
    reorderButtons,
    addSelectMenu,
    deleteSelectMenu,
    updateMenuPlaceholder,
    addSelectOption,
    loadFullSelectOption,
    saveSelectOption,
    deleteSelectOption,
    showConfirm,
    fetchAllData,
    checkPanelStatus
  }: Props = $props();

  let activeTab = $state("buttons");
  const tabs = $derived([
    { id: "buttons", label: m.common.buttons(), icon: "fa-square-up-right" },
    { id: "selectmenus", label: m.tickets.panelsTabSelectMenus(), icon: "fa-list" },
    { id: "settings", label: m.tickets.panelsTabSettings(), icon: "fa-gear" }
  ]);

  // Button editing state
  let editingButtonId = $state<number | null>(null);
  let editingButtonData = $state<any>(null);
  let buttonEditSection = $state("basic");

  // Button creation section (same tabs as editing)
  let buttonCreatorSection = $state("basic");

  const buttonSections = $derived([
    { id: "basic", label: m.tickets.panelsSectionBasic(), icon: "fa-pen" },
    { id: "permissions", label: m.common.permissions(), icon: "fa-shield" },
    { id: "timing", label: m.tickets.panelsSectionTiming(), icon: "fa-clock" },
    { id: "close", label: m.common.close(), icon: "fa-door-closed" },
    { id: "archive", label: m.common.archive(), icon: "fa-box-archive" },
    { id: "modal", label: m.tickets.panelsSectionModal(), icon: "fa-window-maximize" },
    { id: "message", label: m.common.message(), icon: "fa-message" }
  ]);

  const buttonStyleOptions = $derived([
    { id: "1", name: m.common.primary(), label: m.tickets.panelsStylePrimaryLabel() },
    { id: "2", name: m.common.secondary(), label: m.tickets.panelsStyleSecondaryLabel() },
    { id: "3", name: m.common.success(), label: m.tickets.panelsStyleSuccessLabel() },
    { id: "4", name: m.common.danger(), label: m.tickets.panelsStyleDangerLabel() }
  ]);

  // Select menu editing
  let editingMenuId = $state<number | null>(null);
  let editingPlaceholder = $state("");
  let showOptionCreator = $state(false);
  let creatingOptionForMenu = $state<number | null>(null);
  let optionCreatorSection = $state("basic");
  let newOption = $state({
    label: "",
    description: "",
    emoji: null as string | null,
    categoryId: null as string | null,
    archiveCategoryId: null as string | null,
    supportRoles: [] as string[],
    viewerRoles: [] as string[],
    channelNameFormat: "ticket-{username}-{id}",
    maxActiveTickets: 1,
    autoCloseTime: null as number | null,
    requiredResponseTime: null as number | null,
    deleteDelay: null as number | null,
    saveTranscript: false,
    deleteOnClose: false,
    lockOnClose: true,
    renameOnClose: true,
    removeCreatorOnClose: true,
    lockOnArchive: true,
    renameOnArchive: true,
    removeCreatorOnArchive: false,
    autoArchiveOnClose: false,
    allowedPriorities: [] as string[],
    defaultPriority: null as string | null,
    modalJson: null as string | null,
    openMessageJson: null as string | null
  });

  // Select option editing state
  let editingOptionId = $state<number | null>(null);
  let editingOptionData = $state<any>(null);
  let optionEditSection = $state("basic");

  const optionSections = $derived([
    { id: "basic", label: m.tickets.panelsSectionBasic(), icon: "fa-pen" },
    { id: "permissions", label: m.common.permissions(), icon: "fa-shield" },
    { id: "timing", label: m.tickets.panelsSectionTiming(), icon: "fa-clock" },
    { id: "close", label: m.common.close(), icon: "fa-door-closed" },
    { id: "archive", label: m.common.archive(), icon: "fa-box-archive" },
    { id: "modal", label: m.tickets.panelsSectionModal(), icon: "fa-window-maximize" },
    { id: "message", label: m.common.message(), icon: "fa-message" }
  ]);

  type NewOptionBoolKey = {
    [K in keyof typeof newOption]: typeof newOption[K] extends boolean ? K : never
  }[keyof typeof newOption];

  const closeOptions = $derived<{ key: NewOptionBoolKey; label: string; desc: string; danger?: boolean }[]>([
    { key: 'saveTranscript', label: m.tickets.panelsOptSaveTranscript(), desc: m.tickets.panelsOptSaveTranscriptDesc() },
    { key: 'lockOnClose', label: m.tickets.panelsOptLockOnClose(), desc: m.tickets.panelsOptPreventMessages() },
    { key: 'renameOnClose', label: m.tickets.panelsOptRenameOnClose(), desc: m.tickets.panelsOptRenameOnCloseDesc() },
    { key: 'removeCreatorOnClose', label: m.tickets.panelsOptRemoveCreator(), desc: m.tickets.panelsOptRemoveCreatorDesc() },
    { key: 'deleteOnClose', label: m.tickets.panelsOptDeleteOnClose(), desc: m.tickets.panelsOptDeleteOnCloseDesc(), danger: true }
  ]);

  const archiveOptions = $derived<{ key: NewOptionBoolKey; label: string; desc: string }[]>([
    { key: 'autoArchiveOnClose', label: m.tickets.panelsOptAutoArchive(), desc: m.tickets.panelsOptAutoArchiveDesc() },
    { key: 'lockOnArchive', label: m.tickets.panelsOptLockOnArchive(), desc: m.tickets.panelsOptPreventMessages() },
    { key: 'renameOnArchive', label: m.tickets.panelsOptRenameOnArchive(), desc: m.tickets.panelsOptRenameOnArchiveDesc() },
    { key: 'removeCreatorOnArchive', label: m.tickets.panelsOptRemoveCreator(), desc: m.tickets.panelsOptRemoveCreatorDesc() }
  ]);

  // Status helper functions removed - status now only checked on-demand via Troubleshoot button

  // Parse Discord emoji format for display
  function parseEmojiForDisplay(emojiString: string | null): { url: string; name: string; isCustom: boolean } | {
    emoji: string;
    isCustom: false
  } | null {
    if (!emojiString) return null;

    // Check for Discord custom emoji format: <:name:id> or <a:name:id>
    const match = emojiString.match(/<(a?):([^:]+):(\d+)>/);
    if (match) {
      const [, animatedFlag, name, id] = match;
      const animated = animatedFlag === "a";
      const url = `https://cdn.discordapp.com/emojis/${id}.${animated ? "gif" : "png"}?size=32&quality=lossless`;
      return { url, name, isCustom: true };
    }

    // Regular Unicode emoji
    return { emoji: emojiString, isCustom: false };
  }

  function parseTicketOpenMessage(value: unknown): any {
    if (typeof value !== "string") return value ?? null;

    try {
      return JSON.parse(value);
    } catch {
      return null;
    }
  }

  async function startEditingButton(buttonId: number) {
    // Fetch FULL button details from backend
    const fullButton = await loadFullButton(buttonId);
    if (!fullButton) return;

    editingButtonData = {
      ...fullButton,
      categoryId: fullButton.categoryId?.toString() || null,
      archiveCategoryId: fullButton.archiveCategoryId?.toString() || null,
      supportRoles: fullButton.supportRoles?.map((r: any) => r.toString()) || [],
      viewerRoles: fullButton.viewerRoles?.map((r: any) => r.toString()) || [],
      style: fullButton.style?.toString() || "1",
      allowedPriorities: fullButton.allowedPriorities || [],
      defaultPriority: fullButton.defaultPriority || null,
      emoji: fullButton.emoji || null,
      modalJson: fullButton.modalJson || null,
      openMessageJson: parseTicketOpenMessage(fullButton.openMessageJson),
      channelNameFormat: fullButton.channelNameFormat || "ticket-{username}-{id}",
      maxActiveTickets: fullButton.maxActiveTickets || 1,
      autoCloseTime: fullButton.autoCloseTime || null,
      requiredResponseTime: fullButton.requiredResponseTime || null,
      deleteDelay: fullButton.deleteDelay || null,
      saveTranscript: fullButton.saveTranscript ?? false,
      deleteOnClose: fullButton.deleteOnClose ?? false,
      lockOnClose: fullButton.lockOnClose ?? false,
      renameOnClose: fullButton.renameOnClose ?? false,
      removeCreatorOnClose: fullButton.removeCreatorOnClose ?? false,
      lockOnArchive: fullButton.lockOnArchive ?? false,
      renameOnArchive: fullButton.renameOnArchive ?? false,
      removeCreatorOnArchive: fullButton.removeCreatorOnArchive ?? false,
      autoArchiveOnClose: fullButton.autoArchiveOnClose ?? false
    };

    editingButtonId = buttonId;
    buttonEditSection = "basic";
  }

  function cancelEditingButton() {
    editingButtonId = null;
    editingButtonData = null;
  }

  async function saveButtonEdit() {
    if (!editingButtonData) return;
    await saveButton(editingButtonData);
    cancelEditingButton();
  }

  // Select menu functions
  function startEditingPlaceholder(menuId: number, currentPlaceholder: string) {
    editingMenuId = menuId;
    editingPlaceholder = currentPlaceholder;
  }

  async function savePlaceholder() {
    if (editingMenuId !== null && editingPlaceholder.trim()) {
      await updateMenuPlaceholder(editingMenuId, editingPlaceholder);
      editingMenuId = null;
      editingPlaceholder = "";
    }
  }

  function cancelEditingPlaceholder() {
    editingMenuId = null;
    editingPlaceholder = "";
  }

  function startCreatingOption(menuId: number) {
    creatingOptionForMenu = menuId;
    showOptionCreator = true;
  }

  async function saveNewOption() {
    if (creatingOptionForMenu !== null && newOption.label.trim() && newOption.description.trim()) {
      await addSelectOption(creatingOptionForMenu, newOption);
      showOptionCreator = false;
      creatingOptionForMenu = null;
      newOption = {
        label: "",
        description: "",
        emoji: null,
        categoryId: null,
        archiveCategoryId: null,
        supportRoles: [],
        viewerRoles: [],
        channelNameFormat: "ticket-{username}-{id}",
        maxActiveTickets: 1,
        autoCloseTime: null,
        requiredResponseTime: null,
        deleteDelay: null,
        saveTranscript: false,
        deleteOnClose: false,
        lockOnClose: true,
        renameOnClose: true,
        removeCreatorOnClose: true,
        lockOnArchive: true,
        renameOnArchive: true,
        removeCreatorOnArchive: false,
        autoArchiveOnClose: false,
        allowedPriorities: [],
        defaultPriority: null,
        modalJson: null,
        openMessageJson: null
      };
    }
  }

  function cancelCreatingOption() {
    showOptionCreator = false;
    creatingOptionForMenu = null;
    optionCreatorSection = "basic";
    newOption = {
      label: "",
      description: "",
      emoji: null,
      categoryId: null,
      archiveCategoryId: null,
      supportRoles: [],
      viewerRoles: [],
      channelNameFormat: "ticket-{username}-{id}",
      maxActiveTickets: 1,
      autoCloseTime: null,
      requiredResponseTime: null,
      deleteDelay: null,
      saveTranscript: false,
      deleteOnClose: false,
      lockOnClose: true,
      renameOnClose: true,
      removeCreatorOnClose: true,
      lockOnArchive: true,
      renameOnArchive: true,
      removeCreatorOnArchive: false,
      autoArchiveOnClose: false,
      allowedPriorities: [],
      defaultPriority: null,
      modalJson: null,
      openMessageJson: null
    };
  }

  // Select option editing functions
  async function startEditingOption(optionId: number) {
    const fullOption = await loadFullSelectOption(optionId);
    if (!fullOption) return;

    editingOptionData = {
      ...fullOption,
      categoryId: fullOption.categoryId?.toString() || null,
      archiveCategoryId: fullOption.archiveCategoryId?.toString() || null,
      supportRoles: fullOption.supportRoles?.map((r: any) => r.toString()) || [],
      viewerRoles: fullOption.viewerRoles?.map((r: any) => r.toString()) || [],
      allowedPriorities: fullOption.allowedPriorities || [],
      defaultPriority: fullOption.defaultPriority || null,
      emoji: fullOption.emoji || null,
      modalJson: fullOption.modalJson || null,
      openMessageJson: parseTicketOpenMessage(fullOption.openMessageJson),
      channelNameFormat: fullOption.channelNameFormat || "ticket-{username}-{id}",
      maxActiveTickets: fullOption.maxActiveTickets || 1,
      autoCloseTime: fullOption.autoCloseTime || null,
      requiredResponseTime: fullOption.requiredResponseTime || null,
      deleteDelay: fullOption.deleteDelay || null,
      saveTranscript: fullOption.saveTranscript ?? false,
      deleteOnClose: fullOption.deleteOnClose ?? false,
      lockOnClose: fullOption.lockOnClose ?? false,
      renameOnClose: fullOption.renameOnClose ?? false,
      removeCreatorOnClose: fullOption.removeCreatorOnClose ?? false,
      lockOnArchive: fullOption.lockOnArchive ?? false,
      renameOnArchive: fullOption.renameOnArchive ?? false,
      removeCreatorOnArchive: fullOption.removeCreatorOnArchive ?? false,
      autoArchiveOnClose: fullOption.autoArchiveOnClose ?? false
    };

    editingOptionId = optionId;
    optionEditSection = "basic";
  }

  function cancelEditingOption() {
    editingOptionId = null;
    editingOptionData = null;
  }

  async function saveOptionEdit() {
    if (!editingOptionData) return;
    await saveSelectOption(editingOptionData);
    cancelEditingOption();
  }

  // Calculate Discord component limits
  // 1 button = 1 component, 1 select menu = 5 components, max 25 total
  let componentCount = $derived(() => {
    if (!selectedPanel) return { buttons: 0, menus: 0, total: 0, remaining: 25, canAddButtons: 25, canAddMenus: 5 };
    const buttons = panelButtons.length;
    const menus = panelSelectMenus.length;
    const total = buttons + (menus * 5);
    const remaining = 25 - total;
    const canAddButtons = remaining; // Each button = 1 slot
    const canAddMenus = Math.floor(remaining / 5); // Each menu = 5 slots
    return { buttons, menus, total, remaining, canAddButtons, canAddMenus };
  });

  const capacityText = $derived.by(() => {
    const { canAddButtons: buttons, canAddMenus: menus } = componentCount();
    if (buttons === 1) {
      return menus === 1
        ? m.tickets.panelsCapacityButtonOneMenuOne({ buttons, menus })
        : m.tickets.panelsCapacityButtonOneMenuOther({ buttons, menus });
    }
    return menus === 1
      ? m.tickets.panelsCapacityButtonOtherMenuOne({ buttons, menus })
      : m.tickets.panelsCapacityButtonOtherMenuOther({ buttons, menus });
  });

  let canAddButton = $derived(componentCount().canAddButtons >= 1);
  let canAddSelectMenu = $derived(componentCount().canAddMenus >= 1);

  // Select menu option limits (max 25 per menu)
  function getOptionCount(menuId: number): number {
    const menu = panelSelectMenus.find(menu => menu.id === menuId);
    return menu?.options?.length || 0;
  }

  function canAddOption(menuId: number): boolean {
    return getOptionCount(menuId) < 25;
  }
</script>

<!-- Horizontal Panel Selector -->
<div class="mb-6">
  <div class="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide">
    {#each panels as panel}
      {@const isSelected = selectedPanel?.messageId === panel.messageId && !showPanelCreator}
      <button
        class="flex-shrink-0 px-4 py-3 rounded-xl transition-all hover:opacity-80 min-w-[200px] relative"
        style="background: {isSelected ? $colorStore.primary + '25' : $colorStore.primary + '08'};
               border: 2px solid {isSelected ? $colorStore.primary : $colorStore.primary + '15'};
               border-left: 4px solid {isSelected ? $colorStore.primary : 'transparent'};"
        onclick={() => {
          selectedPanel = panel;
          loadPanelDetails(panel.messageId);
          editingButtonId = null;
          showPanelCreator = false;
        }}
      >
        <div class="flex items-center gap-3">
          <div class="text-left flex-1 min-w-0">
            <p class="font-medium text-sm truncate" style="color: {$colorStore.text}">
              {#if isSelected}
                <i class="fa-solid fa-circle-check mr-1.5" style="color: {$colorStore.primary}"></i>
              {/if}
              #{panel.channelName}
            </p>
            <p class="text-xs" style="color: {$colorStore.muted}">
              {m.tickets.panelsCounts({ buttons: panel.buttonCount || 0, menus: panel.selectMenuCount || 0 })}
            </p>
          </div>
        </div>
      </button>
    {/each}

    <button
      class="flex-shrink-0 px-4 py-3 rounded-xl transition-all hover:opacity-80 min-w-[120px]"
      onclick={() => {
        showPanelCreator = !showPanelCreator;
        if (showPanelCreator) {
          selectedPanel = null;
        }
      }}
      style="background: {showPanelCreator ? $colorStore.secondary + '20' : $colorStore.primary + '08'};
             border: 2px {showPanelCreator ? 'solid' : 'dashed'};
             border-color: {showPanelCreator ? $colorStore.secondary + '40' : $colorStore.primary + '30'};
             color: {showPanelCreator ? $colorStore.secondary : $colorStore.primary};"
    >
      <i class="fa-solid {showPanelCreator ? 'fa-xmark' : 'fa-plus'}"></i>
      <span class="ml-2">{showPanelCreator ? m.common.cancel() : m.tickets.panelsNewPanel()}</span>
    </button>
  </div>
</div>

{#if showPanelCreator}
  <!-- Inline Panel Creator -->
  <div class="space-y-6">
    <h3 class="text-xl font-bold" style="color: {$colorStore.text}">{m.tickets.panelsCreateNewTitle()}</h3>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="space-y-4">
        <div>
          <span class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">
            {m.common.channel()} <span style="color: #ef4444;">*</span>
          </span>
          <DiscordSelector
            type="channel"
            options={textChannels}
            bind:selected={newPanel.channelId}
            placeholder={m.common.selectChannelPlaceholder()}
            multiple={false}
          />
        </div>
        <div class="p-4 rounded-xl"
             style="background: {$colorStore.primary}05; border: 1px solid {$colorStore.primary}15;">
          <h4 class="font-semibold mb-4" style="color: {$colorStore.text}">{m.tickets.panelsEmbedTitle()}</h4>
          <FullscreenEmbedBuilder
            bind:value={panelEmbed}
            previewTitle={m.tickets.panelsEmbedTitle()}
            previewDescription={m.tickets.panelsEmbedPreviewDescription()}
            icon="fa-rectangle"
            allowContent={false}
            maxEmbeds={10}
            allowComponents={false}
            guildId={$currentGuild?.id}
            user={data.user}
            placeholder={m.tickets.panelsEmbedPlaceholder()}
          />
        </div>
      </div>
    </div>

    <div class="flex justify-end gap-3">
      <button
        class="px-4 py-3 rounded-xl font-medium"
        style="background: {$colorStore.muted}20; color: {$colorStore.muted};"
        onclick={() => showPanelCreator = false}
      >
        {m.common.cancel()}
      </button>
      <button
        class="px-4 py-3 rounded-xl font-medium flex items-center gap-2"
        style="background: {$colorStore.primary}20; color: {$colorStore.primary}; border: 1px solid {$colorStore.primary}30;"
        disabled={saving || !newPanel.channelId}
        onclick={createPanel}
      >
        {#if saving}
          <i class="fa-solid fa-spinner fa-spin"></i>
        {:else}
          <i class="fa-solid fa-plus"></i>
        {/if}
        {m.tickets.panelsCreatePanel()}
      </button>
    </div>
  </div>
{:else if selectedPanel}
  <!-- Panel Actions -->
  <div class="flex items-center justify-between mb-6">
    <h3 class="text-xl font-bold" style="color: {$colorStore.text}">
      #{selectedPanel.channelName}
    </h3>
    <div class="flex gap-2">
      <button
        class="px-3 py-2 rounded-lg text-sm font-medium transition-all"
        style="background: {$colorStore.primary}20; color: {$colorStore.primary}; border: 1px solid {$colorStore.primary}30; opacity: {checkingPanelStatus ? 0.5 : 1};"
        onclick={() => checkPanelStatus(selectedPanel.messageId)}
        disabled={checkingPanelStatus}
      >
        {#if checkingPanelStatus}
          <i class="fa-solid fa-spinner fa-spin"></i>
        {:else}
          <i class="fa-solid fa-stethoscope"></i>
        {/if}
        {m.tickets.panelsTroubleshoot()}
      </button>
      {#if panelStatuses.get(selectedPanel.messageId) === 1}
        <button
          class="px-3 py-2 rounded-lg text-sm font-medium transition-all hover:opacity-80"
          style="background: #f59e0b20; color: #f59e0b; border: 1px solid #f59e0b30;"
          onclick={() => recreatePanel(selectedPanel.messageId)}
        >
          <i class="fa-solid fa-arrows-rotate"></i>
          {m.tickets.panelsRecreate()}
        </button>
      {/if}
      <button
        class="px-3 py-2 rounded-lg text-sm font-medium transition-all hover:opacity-80"
        style="background: #ef444420; color: #ef4444; border: 1px solid #ef444430;"
        onclick={() => showConfirm(
          m.tickets.panelsDeletePanelTitle(),
          m.tickets.panelsDeletePanelConfirm(),
          () => deletePanel(selectedPanel.messageId, false),
          "danger"
        )}
      >
        <i class="fa-solid fa-trash"></i>
        {m.common.delete()}
      </button>
    </div>
  </div>

  <!-- Tab Navigation -->
  <TabNavigation
    bind:activeTab
    {tabs}
    ariaLabel={m.tickets.panelsSectionsAria()}
  />

  <!-- Tab Content -->
  <div class="mt-6">
    {#if activeTab === 'buttons'}
      <div class="space-y-4">
        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h4 class="font-semibold" style="color: {$colorStore.text}">
              {m.tickets.panelsButtonsTitle({ count: panelButtons.length })}
            </h4>
            <p class="text-xs mt-1" style="color: {$colorStore.muted}">
              {capacityText}
            </p>
          </div>
          <button
            class="px-3 py-2 rounded-lg text-sm font-medium transition-all hover:opacity-80 min-h-[44px]"
            style="background: {canAddButton ? $colorStore.primary + '20' : $colorStore.muted + '20'};
                   color: {canAddButton ? $colorStore.primary : $colorStore.muted};
                   border: 1px solid {canAddButton ? $colorStore.primary + '30' : $colorStore.muted + '30'};"
            disabled={!canAddButton}
            onclick={() => showButtonCreator = !showButtonCreator}
          >
            <i class="fa-solid {showButtonCreator ? 'fa-xmark' : 'fa-plus'}"></i>
            {showButtonCreator ? m.common.cancel() : m.common.addButton()}
          </button>
        </div>

        {#if !canAddButton && !showButtonCreator}
          <div class="p-3 rounded-lg" style="background: #f59e0b10; border: 1px solid #f59e0b30;">
            <i class="fa-solid fa-triangle-exclamation" style="color: #f59e0b;"></i>
            <span class="ml-2 text-sm" style="color: #f59e0b;">
              {m.tickets.panelsLimitReached()}
            </span>
          </div>
        {/if}

        <!-- Inline Button Creator -->
        {#if showButtonCreator}
          <div class="p-4 rounded-xl border-2"
               style="background: {$colorStore.secondary}10; border-color: {$colorStore.secondary}30;">
            <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-4">
              <h5 class="font-semibold" style="color: {$colorStore.text}">{m.common.newButton()}</h5>
              <button
                class="px-3 py-2 rounded text-sm min-h-[44px]"
                style="background: {$colorStore.muted}20; color: {$colorStore.muted};"
                onclick={() => { showButtonCreator = false; buttonCreatorSection = "basic"; }}
              >
                <i class="fa-solid fa-xmark"></i>
                {m.common.cancel()}
              </button>
            </div>

            <!-- Button Creator Sections -->
            <TabNavigation
              bind:activeTab={buttonCreatorSection}
              tabs={buttonSections}
              ariaLabel={m.tickets.panelsButtonSectionsAria()}
            />

            <div class="mt-4">
              {#if buttonCreatorSection === 'basic'}
                <div class="space-y-4 max-w-xl">
                  <div>
                    <label for="f-PanelsTab-label-675" class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">{m.common.label()} *</label>
                    <input id="f-PanelsTab-label-675"
                      type="text"
                      bind:value={newButton.label}
                      maxlength="80"
                      class="w-full px-3 py-2 rounded-lg border"
                      placeholder={m.tickets.panelsButtonLabelPlaceholder()}
                      style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                    />
                    <p class="text-xs mt-1" style="color: {$colorStore.muted}">{m.tickets.panelsMaxCharacters({ count: 80 })}</p>
                  </div>
                  <div>
                    <label for="f-PanelsTab-emoji-687" class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">{m.common.emoji()}</label>
                    <EmojiPicker id="f-PanelsTab-emoji-687"
                      {guildEmojis}
                      bind:selected={newButton.emoji}
                      multiple={false}
                      placeholder={m.common.selectEmojiPlaceholder()}
                      searchable={true}
                      groupByGuild={true}
                    />
                  </div>
                  <div>
                    <label for="f-PanelsTab-style-698" class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">{m.common.style()}</label>
                    <DiscordSelector id="f-PanelsTab-style-698"
                      type="custom"
                      options={buttonStyleOptions}
                      bind:selected={newButton.style}
                      placeholder={m.tickets.modalBuilderStylePlaceholder()}
                      multiple={false}
                    />
                  </div>
                  <div>
                    <label for="f-PanelsTab-channel-name-format-708" class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">{m.common.channelNameFormat()}</label>
                    <input id="f-PanelsTab-channel-name-format-708"
                      type="text"
                      bind:value={newButton.channelFormat}
                      maxlength="100"
                      class="w-full px-3 py-2 rounded-lg border font-mono text-sm"
                      placeholder="ticket-&#123;username&#125;-&#123;id&#125;"
                      style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                    />
                    <p class="text-xs mt-1" style="color: {$colorStore.muted}">
                      {m.tickets.panelsChannelFormatHint({ username: "{username}", id: "{id}", count: 100 })}
                    </p>
                  </div>
                </div>

              {:else if buttonCreatorSection === 'permissions'}
                <div class="space-y-4 max-w-3xl">
                  <div>
                    <label for="f-PanelsTab-ticket-category-727" class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">{m.common.ticketCategory()}</label>
                    <DiscordSelector id="f-PanelsTab-ticket-category-727"
                      type="channel"
                      options={categories}
                      bind:selected={newButton.categoryId}
                      placeholder={m.common.selectCategoryPlaceholder()}
                      multiple={false}
                    />
                  </div>
                  <div>
                    <label for="f-PanelsTab-archive-category-738" class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">{m.tickets.panelsArchiveCategory()}</label>
                    <DiscordSelector id="f-PanelsTab-archive-category-738"
                      type="channel"
                      options={categories}
                      bind:selected={newButton.archiveCategoryId}
                      placeholder={m.common.selectCategoryPlaceholder()}
                      multiple={false}
                    />
                  </div>
                  <div>
                    <label for="f-PanelsTab-support-roles-749" class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">{m.common.supportRoles()}</label>
                    <DiscordSelector id="f-PanelsTab-support-roles-749"
                      type="role"
                      options={availableRoles}
                      bind:selected={newButton.supportRoles}
                      placeholder={m.common.selectRolesPlaceholder()}
                      multiple={true}
                    />
                  </div>
                  <div>
                    <label for="f-PanelsTab-viewer-roles-760" class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">{m.tickets.panelsViewerRoles()}</label>
                    <DiscordSelector id="f-PanelsTab-viewer-roles-760"
                      type="role"
                      options={availableRoles}
                      bind:selected={newButton.viewerRoles}
                      placeholder={m.common.selectRolesPlaceholder()}
                      multiple={true}
                    />
                  </div>
                </div>

              {:else if buttonCreatorSection === 'timing'}
                <div class="space-y-4 max-w-3xl">
                  <div class="grid grid-cols-2 gap-4">
                    <div>
                      <label for="f-PanelsTab-max-active-tickets-775" class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">{m.tickets.panelsMaxActiveTickets()}</label>
                      <input id="f-PanelsTab-max-active-tickets-775"
                        type="number"
                        bind:value={newButton.maxActiveTickets}
                        min="1"
                        class="w-full px-3 py-2 rounded-lg border"
                        style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                      />
                    </div>
                    <div>
                      <label for="f-PanelsTab-auto-close-hours-786" class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">{m.tickets.panelsAutoCloseHours()}</label>
                      <input id="f-PanelsTab-auto-close-hours-786"
                        type="number"
                        bind:value={newButton.autoCloseTime}
                        min="1"
                        placeholder={m.common.none()}
                        class="w-full px-3 py-2 rounded-lg border"
                        style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                      />
                    </div>
                    <div>
                      <label for="f-PanelsTab-required-response-time-minutes-798" class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">{m.tickets.panelsRequiredResponseMinutes()}</label>
                      <input id="f-PanelsTab-required-response-time-minutes-798"
                        type="number"
                        bind:value={newButton.requiredResponseTime}
                        min="1"
                        placeholder={m.common.none()}
                        class="w-full px-3 py-2 rounded-lg border"
                        style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                      />
                    </div>
                  </div>
                  <div>
                    <label for="f-PanelsTab-allowed-priorities-811" class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">{m.tickets.panelsAllowedPriorities()}</label>
                    <DiscordSelector id="f-PanelsTab-allowed-priorities-811"
                      type="custom"
                      options={priorities.map(p => ({ id: p.id, name: p.name, label: p.name }))}
                      bind:selected={newButton.allowedPriorities}
                      placeholder={m.tickets.panelsSelectPrioritiesPlaceholder()}
                      multiple={true}
                    />
                  </div>
                  <div>
                    <label for="f-PanelsTab-default-priority-822" class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">{m.tickets.panelsDefaultPriority()}</label>
                    <DiscordSelector id="f-PanelsTab-default-priority-822"
                      type="custom"
                      options={priorities.map(p => ({ id: p.id, name: p.name, label: p.name }))}
                      bind:selected={newButton.defaultPriority}
                      placeholder={m.tickets.panelsSelectDefaultPlaceholder()}
                      multiple={false}
                    />
                  </div>
                </div>

              {:else if buttonCreatorSection === 'close'}
                <div class="space-y-3 max-w-xl">
                  {#each [
                    {
                      key: 'saveTranscript',
                      label: m.tickets.panelsOptSaveTranscript(),
                      desc: m.tickets.panelsOptSaveTranscriptDesc(),
                      prop: 'saveTranscript'
                    },
                    { key: 'lockOnClose', label: m.tickets.panelsOptLockOnClose(), desc: m.tickets.panelsOptPreventMessages(), prop: 'lockOnClose' },
                    {
                      key: 'renameOnClose',
                      label: m.tickets.panelsOptRenameOnClose(),
                      desc: m.tickets.panelsOptRenameOnCloseDesc(),
                      prop: 'renameOnClose'
                    },
                    {
                      key: 'removeCreatorOnClose',
                      label: m.tickets.panelsOptRemoveCreator(),
                      desc: m.tickets.panelsOptRemoveCreatorDesc(),
                      prop: 'removeCreatorOnClose'
                    },
                    {
                      key: 'deleteOnClose',
                      label: m.tickets.panelsOptDeleteOnClose(),
                      desc: m.tickets.panelsOptDeleteOnCloseDesc(),
                      danger: true,
                      prop: 'deleteOnClose'
                    }
                  ] as option}
                    <label class="flex items-center gap-3 p-3 rounded-lg cursor-pointer"
                           style="background: {option.danger ? '#ef444410' : $colorStore.primary + '08'};">
                      <input
                        type="checkbox"
                        bind:checked={newButton[option.prop]}
                        class="rounded"
                      />
                      <div>
                        <span class="font-medium block text-sm" style="color: {$colorStore.text}">{option.label}</span>
                        <span class="text-xs"
                              style="color: {option.danger ? '#ef4444' : $colorStore.muted}">{option.desc}</span>
                      </div>
                    </label>
                  {/each}
                  <div>
                    <label for="f-PanelsTab-delete-delay-seconds-879" class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">{m.tickets.panelsDeleteDelaySeconds()}</label>
                    <input id="f-PanelsTab-delete-delay-seconds-879"
                      type="number"
                      bind:value={newButton.deleteDelay}
                      min="0"
                      placeholder={m.tickets.panelsDeleteDelayPlaceholder()}
                      class="w-full px-3 py-2 rounded-lg border"
                      style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                    />
                    <p class="text-xs mt-1" style="color: {$colorStore.muted}">{m.tickets.panelsDeleteDelayHint()}</p>
                  </div>
                </div>

              {:else if buttonCreatorSection === 'archive'}
                <div class="space-y-3 max-w-xl">
                  {#each [
                    {
                      key: 'autoArchiveOnClose',
                      label: m.tickets.panelsOptAutoArchive(),
                      desc: m.tickets.panelsOptAutoArchiveDesc(),
                      prop: 'autoArchiveOnClose'
                    },
                    { key: 'lockOnArchive', label: m.tickets.panelsOptLockOnArchive(), desc: m.tickets.panelsOptPreventMessages(), prop: 'lockOnArchive' },
                    {
                      key: 'renameOnArchive',
                      label: m.tickets.panelsOptRenameOnArchive(),
                      desc: m.tickets.panelsOptRenameOnArchiveDesc(),
                      prop: 'renameOnArchive'
                    },
                    {
                      key: 'removeCreatorOnArchive',
                      label: m.tickets.panelsOptRemoveCreator(),
                      desc: m.tickets.panelsOptRemoveCreatorDesc(),
                      prop: 'removeCreatorOnArchive'
                    }
                  ] as option}
                    <label class="flex items-center gap-3 p-3 rounded-lg cursor-pointer"
                           style="background: {$colorStore.primary}08;">
                      <input
                        type="checkbox"
                        bind:checked={newButton[option.prop]}
                        class="rounded"
                      />
                      <div>
                        <span class="font-medium block text-sm" style="color: {$colorStore.text}">{option.label}</span>
                        <span class="text-xs" style="color: {$colorStore.muted}">{option.desc}</span>
                      </div>
                    </label>
                  {/each}
                </div>

              {:else if buttonCreatorSection === 'modal'}
                <ModalBuilder bind:modalJson={newButton.modalJson} />

              {:else if buttonCreatorSection === 'message'}
                <FullscreenEmbedBuilder
                  bind:value={newButton.openMessageJson}
                  previewTitle={m.tickets.panelsOpenMessageTitle()}
                  previewDescription={m.tickets.panelsOpenMessagePreviewDescription()}
                  icon="fa-ticket"
                  allowContent={true}
                  allowMultipleEmbeds={true}
                  maxEmbeds={10}
                  allowComponents={false}
                  additionalPlaceholders={[
                    { category: m.tickets.panelsPlaceholderCategory(), name: "%ticket.id%", description: m.tickets.panelsPlaceholderTicketId() },
                    { category: m.tickets.panelsPlaceholderCategory(), name: "%ticket.user.mention%", description: m.tickets.panelsPlaceholderTicketCreator() }
                  ]}
                  guildId={$currentGuild?.id}
                  user={data.user}
                  placeholder={m.tickets.panelsOpenMessagePlaceholder()}
                />
              {/if}
            </div>

            <!-- Create Button -->
            <div class="flex justify-end gap-3 mt-6 pt-4 border-t" style="border-color: {$colorStore.primary}20;">
              <button
                class="px-4 py-3 rounded-xl font-medium transition-all hover:opacity-80 min-h-[44px]"
                style="background: {$colorStore.muted}20; color: {$colorStore.muted};"
                onclick={() => { showButtonCreator = false; buttonCreatorSection = "basic"; }}
              >
                {m.common.cancel()}
              </button>
              <button
                class="px-4 py-3 rounded-xl font-medium transition-all hover:opacity-80 min-h-[44px] flex items-center gap-2"
                style="background: {$colorStore.primary}20; color: {$colorStore.primary}; border: 1px solid {$colorStore.primary}30;"
                disabled={!newButton.label || saving}
                onclick={addButton}
              >
                {#if saving}
                  <i class="fa-solid fa-spinner fa-spin"></i>
                {:else}
                  <i class="fa-solid fa-plus"></i>
                {/if}
                {m.tickets.panelsCreateButton()}
              </button>
            </div>
          </div>
        {/if}

        {#if panelButtons.length === 0 && !showButtonCreator}
          <div class="text-center py-12 rounded-xl"
               style="background: {$colorStore.primary}08; border: 1px dashed {$colorStore.primary}20;">
            <i class="fa-solid fa-square-up-right"
               style="color: {$colorStore.muted}; font-size: 48px; opacity: 0.3;"></i>
            <p class="mt-4" style="color: {$colorStore.muted}">{m.tickets.panelsButtonsEmpty()}</p>
          </div>
        {/if}

        {#if panelButtons.length > 0}
          {#each panelButtons as button}
            <div class="p-4 rounded-xl transition-all"
                 style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15); border: 1px solid {$colorStore.primary}20;">
              {#if editingButtonId === button.id}
                <!-- Inline Button Editor -->
                <div class="space-y-4">
                  <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                    <h5 class="font-semibold" style="color: {$colorStore.text}">{m.tickets.panelsEditing({ label: button.label })}</h5>
                    <button
                      class="px-3 py-2 rounded text-sm min-h-[44px]"
                      style="background: {$colorStore.muted}20; color: {$colorStore.muted};"
                      onclick={cancelEditingButton}
                    >
                      <i class="fa-solid fa-xmark"></i>
                      {m.common.cancel()}
                    </button>
                  </div>

                  <!-- Button Edit Sections -->
                  <TabNavigation
                    bind:activeTab={buttonEditSection}
                    tabs={buttonSections}
                    ariaLabel={m.tickets.panelsButtonSectionsAria()}
                  />

                  <div class="mt-4">
                    {#if buttonEditSection === 'basic'}
                      <div class="space-y-4 max-w-xl">
                        <div>
                          <label for="f-PanelsTab-label-1020" class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">{m.common.label()}</label>
                          <input id="f-PanelsTab-label-1020"
                            type="text"
                            bind:value={editingButtonData.label}
                            maxlength="80"
                            class="w-full px-3 py-2 rounded-lg border"
                            style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                          />
                          <p class="text-xs mt-1" style="color: {$colorStore.muted}">{m.tickets.panelsMaxCharacters({ count: 80 })}</p>
                        </div>
                        <div>
                          <label for="f-PanelsTab-emoji-1031" class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">{m.common.emoji()}</label>
                          <EmojiPicker id="f-PanelsTab-emoji-1031"
                            {guildEmojis}
                            bind:selected={editingButtonData.emoji}
                            multiple={false}
                            placeholder={m.common.selectEmojiPlaceholder()}
                            searchable={true}
                            groupByGuild={true}
                          />
                        </div>
                        <div>
                          <label for="f-PanelsTab-style-1042" class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">{m.common.style()}</label>
                          <DiscordSelector id="f-PanelsTab-style-1042"
                            type="custom"
                            options={buttonStyleOptions}
                            bind:selected={editingButtonData.style}
                            placeholder={m.tickets.modalBuilderStylePlaceholder()}
                            multiple={false}
                          />
                        </div>
                      </div>

                    {:else if buttonEditSection === 'permissions'}
                      <div class="space-y-4 max-w-3xl">
                        <div>
                          <label for="f-PanelsTab-ticket-category-1056" class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">{m.common.ticketCategory()}</label>
                          <DiscordSelector id="f-PanelsTab-ticket-category-1056"
                            type="channel"
                            options={categories}
                            bind:selected={editingButtonData.categoryId}
                            placeholder={m.common.selectCategoryPlaceholder()}
                            multiple={false}
                          />
                        </div>
                        <div>
                          <label for="f-PanelsTab-archive-category-1067" class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">{m.tickets.panelsArchiveCategory()}</label>
                          <DiscordSelector id="f-PanelsTab-archive-category-1067"
                            type="channel"
                            options={categories}
                            bind:selected={editingButtonData.archiveCategoryId}
                            placeholder={m.common.selectCategoryPlaceholder()}
                            multiple={false}
                          />
                        </div>
                        <div>
                          <label for="f-PanelsTab-support-roles-1078" class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">{m.common.supportRoles()}</label>
                          <DiscordSelector id="f-PanelsTab-support-roles-1078"
                            type="role"
                            options={availableRoles}
                            bind:selected={editingButtonData.supportRoles}
                            placeholder={m.common.selectRolesPlaceholder()}
                            multiple={true}
                          />
                        </div>
                        <div>
                          <label for="f-PanelsTab-viewer-roles-1089" class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">{m.tickets.panelsViewerRoles()}</label>
                          <DiscordSelector id="f-PanelsTab-viewer-roles-1089"
                            type="role"
                            options={availableRoles}
                            bind:selected={editingButtonData.viewerRoles}
                            placeholder={m.common.selectRolesPlaceholder()}
                            multiple={true}
                          />
                        </div>
                      </div>

                    {:else if buttonEditSection === 'timing'}
                      <div class="space-y-4 max-w-3xl">
                        <div class="grid grid-cols-2 gap-4">
                          <div>
                            <label for="f-PanelsTab-max-active-tickets-1105" class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">{m.tickets.panelsMaxActiveTickets()}</label>
                            <input id="f-PanelsTab-max-active-tickets-1105"
                              type="number"
                              bind:value={editingButtonData.maxActiveTickets}
                              min="1"
                              class="w-full px-3 py-2 rounded-lg border"
                              style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                            />
                          </div>
                          <div>
                            <label for="f-PanelsTab-auto-close-hours-1116" class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">{m.tickets.panelsAutoCloseHours()}</label>
                            <input id="f-PanelsTab-auto-close-hours-1116"
                              type="number"
                              bind:value={editingButtonData.autoCloseTime}
                              min="1"
                              placeholder={m.common.none()}
                              class="w-full px-3 py-2 rounded-lg border"
                              style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                            />
                          </div>
                        </div>
                      </div>

                    {:else if buttonEditSection === 'close'}
                      <div class="space-y-3 max-w-xl">
                        {#each [
                          { key: 'saveTranscript', label: m.tickets.panelsOptSaveTranscript(), desc: m.tickets.panelsOptSaveTranscriptDesc() },
                          { key: 'lockOnClose', label: m.tickets.panelsOptLockOnClose(), desc: m.tickets.panelsOptPreventMessages() },
                          { key: 'renameOnClose', label: m.tickets.panelsOptRenameOnClose(), desc: m.tickets.panelsOptRenameOnCloseDesc() },
                          { key: 'removeCreatorOnClose', label: m.tickets.panelsOptRemoveCreator(), desc: m.tickets.panelsOptRemoveCreatorDesc() },
                          { key: 'deleteOnClose', label: m.tickets.panelsOptDeleteOnClose(), desc: m.tickets.panelsOptDeleteOnCloseDesc(), danger: true }
                        ] as option}
                          <label class="flex items-center gap-3 p-3 rounded-lg cursor-pointer"
                                 style="background: {option.danger ? '#ef444410' : $colorStore.primary + '08'};">
                            <input
                              type="checkbox"
                              bind:checked={editingButtonData[option.key]}
                              class="rounded"
                            />
                            <div>
                              <span class="font-medium block text-sm"
                                    style="color: {$colorStore.text}">{option.label}</span>
                              <span class="text-xs"
                                    style="color: {option.danger ? '#ef4444' : $colorStore.muted}">{option.desc}</span>
                            </div>
                          </label>
                        {/each}
                      </div>

                    {:else if buttonEditSection === 'archive'}
                      <div class="space-y-3 max-w-xl">
                        {#each [
                          { key: 'autoArchiveOnClose', label: m.tickets.panelsOptAutoArchive(), desc: m.tickets.panelsOptAutoArchiveDesc() },
                          { key: 'lockOnArchive', label: m.tickets.panelsOptLockOnArchive(), desc: m.tickets.panelsOptPreventMessages() },
                          { key: 'renameOnArchive', label: m.tickets.panelsOptRenameOnArchive(), desc: m.tickets.panelsOptRenameOnArchiveDesc() },
                          { key: 'removeCreatorOnArchive', label: m.tickets.panelsOptRemoveCreator(), desc: m.tickets.panelsOptRemoveCreatorDesc() }
                        ] as option}
                          <label class="flex items-center gap-3 p-3 rounded-lg cursor-pointer"
                                 style="background: {$colorStore.primary}08;">
                            <input
                              type="checkbox"
                              bind:checked={editingButtonData[option.key]}
                              class="rounded"
                            />
                            <div>
                              <span class="font-medium block text-sm"
                                    style="color: {$colorStore.text}">{option.label}</span>
                              <span class="text-xs" style="color: {$colorStore.muted}">{option.desc}</span>
                            </div>
                          </label>
                        {/each}
                      </div>

                    {:else if buttonEditSection === 'modal'}
                      <ModalBuilder bind:modalJson={editingButtonData.modalJson} />

                    {:else if buttonEditSection === 'message'}
                      <FullscreenEmbedBuilder
                        bind:value={editingButtonData.openMessageJson}
                        previewTitle={m.tickets.panelsOpenMessageTitle()}
                        previewDescription={m.tickets.panelsOpenMessagePreviewDescription()}
                        icon="fa-ticket"
                        allowContent={true}
                        allowMultipleEmbeds={true}
                        maxEmbeds={10}
                        allowComponents={false}
                        additionalPlaceholders={[
                          { category: m.tickets.panelsPlaceholderCategory(), name: "%ticket.id%", description: m.tickets.panelsPlaceholderTicketId() },
                          { category: m.tickets.panelsPlaceholderCategory(), name: "%ticket.user.mention%", description: m.tickets.panelsPlaceholderTicketCreator() }
                        ]}
                        guildId={$currentGuild?.id}
                        user={data.user}
                        placeholder={m.tickets.panelsOpenMessagePlaceholder()}
                      />
                    {/if}
                  </div>

                  <!-- Save Button -->
                  <div class="flex justify-end gap-3 mt-6 pt-4 border-t" style="border-color: {$colorStore.primary}20;">
                    <button
                      class="px-4 py-3 rounded-xl font-medium transition-all hover:opacity-80 min-h-[44px]"
                      style="background: {$colorStore.muted}20; color: {$colorStore.muted};"
                      onclick={cancelEditingButton}
                    >
                      {m.common.cancel()}
                    </button>
                    <button
                      class="px-4 py-3 rounded-xl font-medium transition-all hover:opacity-80 min-h-[44px] flex items-center gap-2"
                      style="background: {$colorStore.primary}20; color: {$colorStore.primary}; border: 1px solid {$colorStore.primary}30;"
                      disabled={saving}
                      onclick={saveButtonEdit}
                    >
                      {#if saving}
                        <i class="fa-solid fa-spinner fa-spin"></i>
                      {:else}
                        <i class="fa-solid fa-floppy-disk"></i>
                      {/if}
                      {m.common.saveChanges()}
                    </button>
                  </div>
                </div>
              {:else}
                <!-- Button Preview -->
                <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div class="flex items-center gap-3 min-w-0 flex-1">
                    {#if button.emoji}
                      {@const parsedEmoji = parseEmojiForDisplay(button.emoji)}
                      {#if parsedEmoji}
                        {#if parsedEmoji.isCustom && 'url' in parsedEmoji}
                          <img src={parsedEmoji.url} alt={parsedEmoji.name}
                               class="w-6 h-6 flex-shrink-0 object-contain" />
                        {:else if !parsedEmoji.isCustom && 'emoji' in parsedEmoji}
                          <span class="text-lg flex-shrink-0">{parsedEmoji.emoji}</span>
                        {/if}
                      {/if}
                    {/if}
                    <div class="min-w-0 flex-1">
                      <p class="font-medium truncate" style="color: {$colorStore.text}">{button.label}</p>
                      <p class="text-xs truncate" style="color: {$colorStore.muted}">
                        {m.tickets.panelsButtonSummary({ style: button.style, max: button.maxActiveTickets })}
                      </p>
                    </div>
                  </div>
                  <div class="flex gap-2 w-full sm:w-auto flex-shrink-0">
                    <button
                      class="flex-1 sm:flex-none px-3 py-2 rounded-lg text-sm transition-all hover:opacity-80 min-h-[44px]"
                      style="background: {$colorStore.secondary}20; color: {$colorStore.secondary};"
                      onclick={() => startEditingButton(button.id)}
                    >
                      <i class="fa-solid fa-pen"></i>
                      <span class="ml-1">{m.common.edit()}</span>
                    </button>
                    <button
                      class="flex-1 sm:flex-none px-3 py-2 rounded-lg text-sm transition-all hover:opacity-80 min-h-[44px]"
                      style="background: #ef444420; color: #ef4444;"
                      onclick={() => showConfirm(m.tickets.panelsDeleteButtonTitle(), m.tickets.panelsDeleteButtonConfirm({ name: button.label }), () => deleteButton(button.id), "danger")}
                    >
                      <i class="fa-solid fa-trash"></i>
                      <span class="ml-1 sm:hidden">{m.common.delete()}</span>
                    </button>
                  </div>
                </div>
              {/if}
            </div>
          {/each}
        {/if}
      </div>

    {:else if activeTab === 'selectmenus'}
      <div class="space-y-4">
        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h4 class="font-semibold" style="color: {$colorStore.text}">
              {m.tickets.panelsSelectMenusTitle({ count: panelSelectMenus.length })}
            </h4>
            <p class="text-xs mt-1" style="color: {$colorStore.muted}">
              {capacityText}
            </p>
          </div>
          <button
            class="px-3 py-2 rounded-lg text-sm font-medium transition-all hover:opacity-80 min-h-[44px]"
            style="background: {canAddSelectMenu ? $colorStore.primary + '20' : $colorStore.muted + '20'};
                   color: {canAddSelectMenu ? $colorStore.primary : $colorStore.muted};
                   border: 1px solid {canAddSelectMenu ? $colorStore.primary + '30' : $colorStore.muted + '30'};"
            disabled={!canAddSelectMenu}
            onclick={() => showSelectMenuCreator = !showSelectMenuCreator}
          >
            <i class="fa-solid {showSelectMenuCreator ? 'fa-xmark' : 'fa-plus'}"></i>
            {showSelectMenuCreator ? m.common.cancel() : m.tickets.panelsAddMenu()}
          </button>
        </div>

        {#if !canAddSelectMenu && !showSelectMenuCreator}
          <div class="p-3 rounded-lg" style="background: #f59e0b10; border: 1px solid #f59e0b30;">
            <i class="fa-solid fa-triangle-exclamation" style="color: #f59e0b;"></i>
            <span class="ml-2 text-sm" style="color: #f59e0b;">
              {m.tickets.panelsLimitReachedMenu()}
            </span>
          </div>
        {/if}

        <!-- Inline Select Menu Creator -->
        {#if showSelectMenuCreator}
          <div class="p-4 rounded-xl border-2"
               style="background: {$colorStore.accent}10; border-color: {$colorStore.accent}30;">
            <h5 class="font-semibold mb-4" style="color: {$colorStore.text}">{m.tickets.panelsNewSelectMenu()}</h5>
            <div class="space-y-3 max-w-2xl">
              <div>
                <label for="f-PanelsTab-placeholder-1316" class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">{m.common.placeholder()} *</label>
                <input id="f-PanelsTab-placeholder-1316"
                  type="text"
                  bind:value={newSelectMenu.placeholder}
                  maxlength="150"
                  class="w-full px-3 py-2 rounded-lg border"
                  placeholder={m.tickets.panelsMenuPlaceholderExample()}
                  style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                />
                <p class="text-xs mt-1" style="color: {$colorStore.muted}">{m.tickets.panelsMaxCharacters({ count: 150 })}</p>
              </div>
              <div>
                <label for="f-PanelsTab-first-option-label-1328" class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">{m.tickets.panelsFirstOptionLabel()} *</label>
                <input id="f-PanelsTab-first-option-label-1328"
                  type="text"
                  bind:value={newSelectMenu.firstOptionLabel}
                  maxlength="100"
                  class="w-full px-3 py-2 rounded-lg border"
                  placeholder={m.tickets.panelsOptionLabelExample()}
                  style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                />
                <p class="text-xs mt-1" style="color: {$colorStore.muted}">{m.tickets.panelsMaxCharacters({ count: 100 })}</p>
              </div>
              <div>
                <label for="f-PanelsTab-first-option-description-1341" class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">{m.tickets.panelsFirstOptionDescription()}</label>
                <input id="f-PanelsTab-first-option-description-1341"
                  type="text"
                  bind:value={newSelectMenu.firstOptionDescription}
                  maxlength="100"
                  class="w-full px-3 py-2 rounded-lg border"
                  placeholder={m.tickets.panelsOptionDescriptionExample()}
                  style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                />
                <p class="text-xs mt-1" style="color: {$colorStore.muted}">{m.tickets.panelsMaxCharacters({ count: 100 })}</p>
              </div>
              <div>
                <label for="f-PanelsTab-first-option-emoji-1354" class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">{m.tickets.panelsFirstOptionEmoji()}</label>
                <EmojiPicker id="f-PanelsTab-first-option-emoji-1354"
                  {guildEmojis}
                  bind:selected={newSelectMenu.firstOptionEmoji}
                  multiple={false}
                  placeholder={m.common.selectEmojiPlaceholder()}
                  searchable={true}
                  groupByGuild={true}
                />
              </div>
              <div class="flex justify-end gap-2">
                <button
                  class="px-3 py-2 rounded-lg text-sm"
                  style="background: {$colorStore.muted}20; color: {$colorStore.muted};"
                  onclick={() => showSelectMenuCreator = false}
                >
                  {m.common.cancel()}
                </button>
                <button
                  class="px-3 py-2 rounded-lg text-sm"
                  style="background: {$colorStore.primary}20; color: {$colorStore.primary}; border: 1px solid {$colorStore.primary}30;"
                  disabled={!newSelectMenu.placeholder || !newSelectMenu.firstOptionLabel}
                  onclick={addSelectMenu}
                >
                  <i class="fa-solid fa-plus"></i>
                  {m.common.add()}
                </button>
              </div>
            </div>
          </div>
        {/if}

        {#if panelSelectMenus.length === 0 && !showSelectMenuCreator}
          <div class="text-center py-12 rounded-xl"
               style="background: {$colorStore.primary}08; border: 1px dashed {$colorStore.primary}20;">
            <i class="fa-solid fa-list" style="color: {$colorStore.muted}; font-size: 48px; opacity: 0.3;"></i>
            <p class="mt-4" style="color: {$colorStore.muted}">{m.tickets.panelsMenusEmpty()}</p>
          </div>
        {/if}

        {#if panelSelectMenus.length > 0}
          {#each panelSelectMenus as menu}
            {@const optionCount = getOptionCount(menu.id)}
            {@const atLimit = optionCount >= 25}
            <div class="p-4 rounded-xl"
                 style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15); border: 1px solid {$colorStore.accent}20;">
              <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
                <div class="flex-1 w-full min-w-0">
                  {#if editingMenuId === menu.id}
                    <div class="flex gap-2">
                      <input
                        type="text"
                        bind:value={editingPlaceholder}
                        maxlength="150"
                        class="flex-1 px-3 py-2 rounded-lg border min-h-[44px]"
                        style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                      />
                      <button
                        class="px-3 py-2 rounded-lg min-h-[44px]"
                        style="background: {$colorStore.primary}20; color: {$colorStore.primary};"
                        aria-label={m.tickets.panelsSavePlaceholderAria()}
                        onclick={savePlaceholder}
                      >
                        <i class="fa-solid fa-check"></i>
                      </button>
                      <button
                        class="px-3 py-2 rounded-lg min-h-[44px]"
                        style="background: {$colorStore.muted}20; color: {$colorStore.muted};"
                        aria-label={m.tickets.panelsCancelPlaceholderAria()}
                        onclick={cancelEditingPlaceholder}
                      >
                        <i class="fa-solid fa-xmark"></i>
                      </button>
                    </div>
                  {:else}
                    <div class="flex items-center gap-2 min-w-0">
                      <p class="font-medium truncate flex-1" style="color: {$colorStore.text}">{menu.placeholder}</p>
                      <button
                        class="p-2 rounded hover:opacity-80 min-h-[44px] min-w-[44px]"
                        style="color: {$colorStore.muted};"
                        aria-label={m.tickets.panelsEditPlaceholderAria()}
                        onclick={() => startEditingPlaceholder(menu.id, menu.placeholder)}
                      >
                        <i class="fa-solid fa-pen text-xs"></i>
                      </button>
                    </div>
                  {/if}
                  <p class="text-xs mt-1" style="color: {$colorStore.muted}">
                    {(menu.options?.length || 0) === 1 ? m.tickets.panelsOptionsCountOne({ count: 1 }) : m.common.optionsCount({ count: menu.options?.length || 0 })}
                  </p>
                </div>
                <button
                  class="px-3 py-2 rounded-lg text-sm transition-all hover:opacity-80 min-h-[44px] w-full sm:w-auto"
                  style="background: #ef444420; color: #ef4444;"
                  onclick={() => showConfirm(m.common.deleteMenu(), m.common.deleteThisMenu(), () => deleteSelectMenu(menu.id), "danger")}
                >
                  <i class="fa-solid fa-trash"></i>
                  <span class="ml-1">{m.common.deleteMenu()}</span>
                </button>
              </div>

              <!-- Options -->
              {#if menu.options && menu.options.length > 0}
                <div class="space-y-2">
                  {#each menu.options as option}
                    <div class="p-3 rounded-lg" style="background: {$colorStore.primary}08;">
                      {#if editingOptionId === option.id}
                        <!-- Inline Option Editor -->
                        <div class="space-y-4">
                          <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                            <h5 class="font-semibold" style="color: {$colorStore.text}">{m.tickets.panelsEditing({ label: option.label })}</h5>
                            <button
                              class="px-3 py-2 rounded text-sm min-h-[44px]"
                              style="background: {$colorStore.muted}20; color: {$colorStore.muted};"
                              onclick={cancelEditingOption}
                            >
                              <i class="fa-solid fa-xmark"></i>
                              {m.common.cancel()}
                            </button>
                          </div>

                          <!-- Option Edit Sections -->
                          <TabNavigation
                            bind:activeTab={optionEditSection}
                            tabs={optionSections}
                            ariaLabel={m.tickets.panelsOptionSectionsAria()}
                          />

                          <div class="mt-4">
                            {#if optionEditSection === 'basic'}
                              <div class="space-y-4 max-w-xl">
                                <div>
                                  <label for="f-PanelsTab-label-1487" class="block text-sm font-medium mb-2"
                                         style="color: {$colorStore.text}">{m.common.label()}</label>
                                  <input id="f-PanelsTab-label-1487"
                                    type="text"
                                    bind:value={editingOptionData.label}
                                    maxlength="100"
                                    class="w-full px-3 py-2 rounded-lg border"
                                    style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                                  />
                                  <p class="text-xs mt-1" style="color: {$colorStore.muted}">{m.tickets.panelsMaxCharacters({ count: 100 })}</p>
                                </div>
                                <div>
                                  <label for="f-PanelsTab-description-1499" class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">{m.common.description()} *</label>
                                  <input id="f-PanelsTab-description-1499"
                                    type="text"
                                    bind:value={editingOptionData.description}
                                    maxlength="100"
                                    class="w-full px-3 py-2 rounded-lg border"
                                    placeholder={m.tickets.panelsOptionDescriptionPlaceholder()}
                                    style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                                  />
                                  <p class="text-xs mt-1" style="color: {$colorStore.muted}">{m.tickets.panelsMaxCharacters({ count: 100 })}</p>
                                </div>
                                <div>
                                  <label for="f-PanelsTab-emoji-1512" class="block text-sm font-medium mb-2"
                                         style="color: {$colorStore.text}">{m.common.emoji()}</label>
                                  <EmojiPicker id="f-PanelsTab-emoji-1512"
                                    {guildEmojis}
                                    bind:selected={editingOptionData.emoji}
                                    multiple={false}
                                    placeholder={m.common.selectEmojiPlaceholder()}
                                    searchable={true}
                                    groupByGuild={true}
                                  />
                                </div>
                                <div>
                                  <label for="f-PanelsTab-channel-name-format-1524" class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">{m.common.channelNameFormat()}</label>
                                  <input id="f-PanelsTab-channel-name-format-1524"
                                    type="text"
                                    bind:value={editingOptionData.channelNameFormat}
                                    maxlength="100"
                                    class="w-full px-3 py-2 rounded-lg border font-mono text-sm"
                                    placeholder="ticket-&#123;username&#125;-&#123;id&#125;"
                                    style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                                  />
                                  <p class="text-xs mt-1" style="color: {$colorStore.muted}">
                                    {m.tickets.panelsChannelFormatHint({ username: "{username}", id: "{id}", count: 100 })}
                                  </p>
                                </div>
                              </div>

                            {:else if optionEditSection === 'permissions'}
                              <div class="space-y-4 max-w-3xl">
                                <div>
                                  <label for="f-PanelsTab-ticket-category-1543" class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">{m.common.ticketCategory()}</label>
                                  <DiscordSelector id="f-PanelsTab-ticket-category-1543"
                                    type="channel"
                                    options={categories}
                                    bind:selected={editingOptionData.categoryId}
                                    placeholder={m.common.selectCategoryPlaceholder()}
                                    multiple={false}
                                  />
                                </div>
                                <div>
                                  <label for="f-PanelsTab-archive-category-1554" class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">{m.tickets.panelsArchiveCategory()}</label>
                                  <DiscordSelector id="f-PanelsTab-archive-category-1554"
                                    type="channel"
                                    options={categories}
                                    bind:selected={editingOptionData.archiveCategoryId}
                                    placeholder={m.common.selectCategoryPlaceholder()}
                                    multiple={false}
                                  />
                                </div>
                                <div>
                                  <label for="f-PanelsTab-support-roles-1565" class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">{m.common.supportRoles()}</label>
                                  <DiscordSelector id="f-PanelsTab-support-roles-1565"
                                    type="role"
                                    options={availableRoles}
                                    bind:selected={editingOptionData.supportRoles}
                                    placeholder={m.common.selectRolesPlaceholder()}
                                    multiple={true}
                                  />
                                </div>
                                <div>
                                  <label for="f-PanelsTab-viewer-roles-1576" class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">{m.tickets.panelsViewerRoles()}</label>
                                  <DiscordSelector id="f-PanelsTab-viewer-roles-1576"
                                    type="role"
                                    options={availableRoles}
                                    bind:selected={editingOptionData.viewerRoles}
                                    placeholder={m.common.selectRolesPlaceholder()}
                                    multiple={true}
                                  />
                                </div>
                              </div>

                            {:else if optionEditSection === 'timing'}
                              <div class="space-y-4 max-w-3xl">
                                <div class="grid grid-cols-2 gap-4">
                                  <div>
                                    <label for="f-PanelsTab-max-active-tickets-1592" class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">{m.tickets.panelsMaxActiveTickets()}</label>
                                    <input id="f-PanelsTab-max-active-tickets-1592"
                                      type="number"
                                      bind:value={editingOptionData.maxActiveTickets}
                                      min="1"
                                      class="w-full px-3 py-2 rounded-lg border"
                                      style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                                    />
                                  </div>
                                  <div>
                                    <label for="f-PanelsTab-auto-close-hours-1603" class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">{m.tickets.panelsAutoCloseHours()}</label>
                                    <input id="f-PanelsTab-auto-close-hours-1603"
                                      type="number"
                                      bind:value={editingOptionData.autoCloseTime}
                                      min="1"
                                      placeholder={m.common.none()}
                                      class="w-full px-3 py-2 rounded-lg border"
                                      style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                                    />
                                  </div>
                                </div>
                              </div>

                            {:else if optionEditSection === 'close'}
                              <div class="space-y-3 max-w-xl">
                                {#each [
                                  { key: 'saveTranscript', label: m.tickets.panelsOptSaveTranscript(), desc: m.tickets.panelsOptSaveTranscriptDesc() },
                                  { key: 'lockOnClose', label: m.tickets.panelsOptLockOnClose(), desc: m.tickets.panelsOptPreventMessages() },
                                  { key: 'renameOnClose', label: m.tickets.panelsOptRenameOnClose(), desc: m.tickets.panelsOptRenameOnCloseDesc() },
                                  {
                                    key: 'removeCreatorOnClose',
                                    label: m.tickets.panelsOptRemoveCreator(),
                                    desc: m.tickets.panelsOptRemoveCreatorDesc()
                                  },
                                  {
                                    key: 'deleteOnClose',
                                    label: m.tickets.panelsOptDeleteOnClose(),
                                    desc: m.tickets.panelsOptDeleteOnCloseDesc(),
                                    danger: true
                                  }
                                ] as opt}
                                  <label class="flex items-center gap-3 p-3 rounded-lg cursor-pointer"
                                         style="background: {opt.danger ? '#ef444410' : $colorStore.primary + '08'};">
                                    <input
                                      type="checkbox"
                                      bind:checked={editingOptionData[opt.key]}
                                      class="rounded"
                                    />
                                    <div>
                                      <span class="font-medium block text-sm"
                                            style="color: {$colorStore.text}">{opt.label}</span>
                                      <span class="text-xs"
                                            style="color: {opt.danger ? '#ef4444' : $colorStore.muted}">{opt.desc}</span>
                                    </div>
                                  </label>
                                {/each}
                              </div>

                            {:else if optionEditSection === 'archive'}
                              <div class="space-y-3 max-w-xl">
                                {#each [
                                  {
                                    key: 'autoArchiveOnClose',
                                    label: m.tickets.panelsOptAutoArchive(),
                                    desc: m.tickets.panelsOptAutoArchiveDesc()
                                  },
                                  { key: 'lockOnArchive', label: m.tickets.panelsOptLockOnArchive(), desc: m.tickets.panelsOptPreventMessages() },
                                  { key: 'renameOnArchive', label: m.tickets.panelsOptRenameOnArchive(), desc: m.tickets.panelsOptRenameOnArchiveDesc() },
                                  {
                                    key: 'removeCreatorOnArchive',
                                    label: m.tickets.panelsOptRemoveCreator(),
                                    desc: m.tickets.panelsOptRemoveCreatorDesc()
                                  }
                                ] as opt}
                                  <label class="flex items-center gap-3 p-3 rounded-lg cursor-pointer"
                                         style="background: {$colorStore.primary}08;">
                                    <input
                                      type="checkbox"
                                      bind:checked={editingOptionData[opt.key]}
                                      class="rounded"
                                    />
                                    <div>
                                      <span class="font-medium block text-sm"
                                            style="color: {$colorStore.text}">{opt.label}</span>
                                      <span class="text-xs" style="color: {$colorStore.muted}">{opt.desc}</span>
                                    </div>
                                  </label>
                                {/each}
                              </div>

                            {:else if optionEditSection === 'modal'}
                              <ModalBuilder bind:modalJson={editingOptionData.modalJson} />

                            {:else if optionEditSection === 'message'}
                              <FullscreenEmbedBuilder
                                bind:value={editingOptionData.openMessageJson}
                                previewTitle={m.tickets.panelsOpenMessageTitle()}
                                previewDescription={m.tickets.panelsOpenMessagePreviewDescription()}
                                icon="fa-ticket"
                                allowContent={true}
                                allowMultipleEmbeds={true}
                                maxEmbeds={10}
                                allowComponents={false}
                                additionalPlaceholders={[
                                  { category: m.tickets.panelsPlaceholderCategory(), name: "%ticket.id%", description: m.tickets.panelsPlaceholderTicketId() },
                                  { category: m.tickets.panelsPlaceholderCategory(), name: "%ticket.user.mention%", description: m.tickets.panelsPlaceholderTicketCreator() }
                                ]}
                                guildId={$currentGuild?.id}
                                user={data.user}
                                placeholder={m.tickets.panelsOpenMessagePlaceholder()}
                              />
                            {/if}
                          </div>

                          <!-- Save Button -->
                          <div class="flex justify-end gap-3 mt-6 pt-4 border-t"
                               style="border-color: {$colorStore.primary}20;">
                            <button
                              class="px-4 py-3 rounded-xl font-medium transition-all hover:opacity-80 min-h-[44px]"
                              style="background: {$colorStore.muted}20; color: {$colorStore.muted};"
                              onclick={cancelEditingOption}
                            >
                              {m.common.cancel()}
                            </button>
                            <button
                              class="px-4 py-3 rounded-xl font-medium transition-all hover:opacity-80 min-h-[44px] flex items-center gap-2"
                              style="background: {!editingOptionData?.label?.trim() || !editingOptionData?.description?.trim() || saving ? $colorStore.muted + '30' : $colorStore.primary + '20'};
                                     color: {!editingOptionData?.label?.trim() || !editingOptionData?.description?.trim() || saving ? $colorStore.muted : $colorStore.primary};
                                     border: {!editingOptionData?.label?.trim() || !editingOptionData?.description?.trim() || saving ? '2px dashed ' + $colorStore.muted + '60' : '1px solid ' + $colorStore.primary + '30'};"
                              disabled={!editingOptionData?.label?.trim() || !editingOptionData?.description?.trim() || saving}
                              onclick={saveOptionEdit}
                            >
                              {#if saving}
                                <i class="fa-solid fa-spinner fa-spin"></i>
                              {:else}
                                <i class="fa-solid fa-floppy-disk"></i>
                              {/if}
                              {m.common.saveChanges()}
                            </button>
                          </div>
                        </div>
                      {:else}
                        <!-- Option Preview -->
                        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                          <div class="flex items-center gap-2 min-w-0 flex-1">
                            {#if option.emoji}
                              {@const parsedEmoji = parseEmojiForDisplay(option.emoji)}
                              {#if parsedEmoji}
                                {#if parsedEmoji.isCustom && 'url' in parsedEmoji}
                                  <img src={parsedEmoji.url} alt={parsedEmoji.name}
                                       class="w-5 h-5 flex-shrink-0 object-contain" />
                                {:else if !parsedEmoji.isCustom && 'emoji' in parsedEmoji}
                                  <span class="flex-shrink-0">{parsedEmoji.emoji}</span>
                                {/if}
                              {/if}
                            {/if}
                            <div class="min-w-0 flex-1">
                              <p class="text-sm truncate" style="color: {$colorStore.text}">{option.label}</p>
                              {#if option.description}
                                <p class="text-xs truncate" style="color: {$colorStore.muted}">{option.description}</p>
                              {/if}
                            </div>
                          </div>
                          <div class="flex gap-2 w-full sm:w-auto flex-shrink-0">
                            <button
                              class="flex-1 sm:flex-none px-3 py-2 rounded-lg text-sm transition-all hover:opacity-80 min-h-[44px]"
                              style="background: {$colorStore.secondary}20; color: {$colorStore.secondary};"
                              onclick={() => startEditingOption(option.id)}
                            >
                              <i class="fa-solid fa-pen"></i>
                              <span class="ml-1">{m.common.edit()}</span>
                            </button>
                            <button
                              class="flex-1 sm:flex-none px-3 py-2 rounded text-sm min-h-[44px]"
                              style="background: #ef444420; color: #ef4444;"
                              onclick={() => showConfirm(m.common.deleteOption(), m.tickets.panelsDeleteButtonConfirm({ name: option.label }), () => deleteSelectOption(option.id), "danger")}
                            >
                              <i class="fa-solid fa-trash"></i>
                              <span class="ml-1 sm:hidden">{m.common.delete()}</span>
                            </button>
                          </div>
                        </div>
                      {/if}
                    </div>
                  {/each}
                </div>
              {/if}

              {#if atLimit}
                <div class="mt-3 p-3 rounded-lg text-sm text-center"
                     style="background: #f59e0b10; border: 1px solid #f59e0b30; color: #f59e0b;">
                  <i class="fa-solid fa-triangle-exclamation"></i>
                  <span class="ml-2">{m.tickets.panelsMaxOptions({ max: 25 })}</span>
                </div>
              {/if}

              <!-- Inline Option Creator -->
              {#if showOptionCreator && creatingOptionForMenu === menu.id}
                <div class="mt-3 p-4 rounded-xl border-2"
                     style="background: {$colorStore.secondary}10; border-color: {$colorStore.secondary}30;">
                  <div class="flex items-center justify-between mb-4">
                    <h5 class="font-semibold" style="color: {$colorStore.text}">{m.common.newOption()}</h5>
                    <button
                      class="px-2 py-1 rounded text-sm"
                      style="background: {$colorStore.muted}20; color: {$colorStore.muted};"
                      aria-label={m.tickets.panelsCancelOptionAria()}
                      onclick={cancelCreatingOption}
                    >
                      <i class="fa-solid fa-xmark"></i>
                    </button>
                  </div>

                  <TabNavigation
                    bind:activeTab={optionCreatorSection}
                    tabs={optionSections}
                    ariaLabel={m.tickets.panelsNewOptionSectionsAria()}
                  />

                  <div class="mt-4">
                    {#if optionCreatorSection === 'basic'}
                      <div class="space-y-4 max-w-xl">
                        <div>
                          <label for="f-PanelsTab-label-1816" class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">{m.common.label()} *</label>
                          <input id="f-PanelsTab-label-1816"
                            type="text"
                            bind:value={newOption.label}
                            maxlength="100"
                            class="w-full px-3 py-2 rounded-lg border"
                            placeholder={m.tickets.panelsOptionLabelExample()}
                            style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                          />
                          <p class="text-xs mt-1" style="color: {$colorStore.muted}">{m.tickets.panelsMaxCharacters({ count: 100 })}</p>
                        </div>
                        <div>
                          <label for="f-PanelsTab-description-1829" class="block text-sm font-medium mb-2"
                                 style="color: {$colorStore.text}">{m.common.description()} *</label>
                          <input id="f-PanelsTab-description-1829"
                            type="text"
                            bind:value={newOption.description}
                            maxlength="100"
                            class="w-full px-3 py-2 rounded-lg border"
                            placeholder={m.tickets.panelsOptionDescriptionExample()}
                            style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                          />
                          <p class="text-xs mt-1" style="color: {$colorStore.muted}">{m.tickets.panelsMaxCharacters({ count: 100 })}</p>
                        </div>
                        <div>
                          <label for="f-PanelsTab-emoji-1842" class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">{m.common.emoji()}</label>
                          <EmojiPicker id="f-PanelsTab-emoji-1842"
                            {guildEmojis}
                            bind:selected={newOption.emoji}
                            multiple={false}
                            placeholder={m.common.selectEmojiPlaceholder()}
                            searchable={true}
                            groupByGuild={true}
                          />
                        </div>
                        <div>
                          <label for="f-PanelsTab-channel-name-format-1853" class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">{m.common.channelNameFormat()}</label>
                          <input id="f-PanelsTab-channel-name-format-1853"
                            type="text"
                            bind:value={newOption.channelNameFormat}
                            maxlength="100"
                            class="w-full px-3 py-2 rounded-lg border font-mono text-sm"
                            placeholder="ticket-&#123;username&#125;-&#123;id&#125;"
                            style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                          />
                          <p class="text-xs mt-1" style="color: {$colorStore.muted}">
                            {m.tickets.panelsChannelFormatHint({ username: "{username}", id: "{id}", count: 100 })}
                          </p>
                        </div>
                      </div>

                    {:else if optionCreatorSection === 'permissions'}
                      <div class="space-y-4 max-w-3xl">
                        <div>
                          <label for="f-PanelsTab-ticket-category-1872" class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">{m.common.ticketCategory()}</label>
                          <DiscordSelector id="f-PanelsTab-ticket-category-1872"
                            type="channel"
                            options={categories}
                            bind:selected={newOption.categoryId}
                            placeholder={m.common.selectCategoryPlaceholder()}
                            multiple={false}
                          />
                        </div>
                        <div>
                          <label for="f-PanelsTab-archive-category-1883" class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">{m.tickets.panelsArchiveCategory()}</label>
                          <DiscordSelector id="f-PanelsTab-archive-category-1883"
                            type="channel"
                            options={categories}
                            bind:selected={newOption.archiveCategoryId}
                            placeholder={m.common.selectCategoryPlaceholder()}
                            multiple={false}
                          />
                        </div>
                        <div>
                          <label for="f-PanelsTab-support-roles-1894" class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">{m.common.supportRoles()}</label>
                          <DiscordSelector id="f-PanelsTab-support-roles-1894"
                            type="role"
                            options={availableRoles}
                            bind:selected={newOption.supportRoles}
                            placeholder={m.common.selectRolesPlaceholder()}
                            multiple={true}
                          />
                        </div>
                        <div>
                          <label for="f-PanelsTab-viewer-roles-1905" class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">{m.tickets.panelsViewerRoles()}</label>
                          <DiscordSelector id="f-PanelsTab-viewer-roles-1905"
                            type="role"
                            options={availableRoles}
                            bind:selected={newOption.viewerRoles}
                            placeholder={m.common.selectRolesPlaceholder()}
                            multiple={true}
                          />
                        </div>
                      </div>

                    {:else if optionCreatorSection === 'timing'}
                      <div class="space-y-4 max-w-3xl">
                        <div class="grid grid-cols-2 gap-4">
                          <div>
                            <label for="f-PanelsTab-max-active-tickets-1921" class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">{m.tickets.panelsMaxActiveTickets()}</label>
                            <input id="f-PanelsTab-max-active-tickets-1921"
                              type="number"
                              bind:value={newOption.maxActiveTickets}
                              min="1"
                              class="w-full px-3 py-2 rounded-lg border"
                              style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                            />
                          </div>
                          <div>
                            <label for="f-PanelsTab-auto-close-hours-1932" class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">{m.tickets.panelsAutoCloseHours()}</label>
                            <input id="f-PanelsTab-auto-close-hours-1932"
                              type="number"
                              bind:value={newOption.autoCloseTime}
                              min="1"
                              placeholder={m.common.none()}
                              class="w-full px-3 py-2 rounded-lg border"
                              style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                            />
                          </div>
                        </div>
                      </div>

                    {:else if optionCreatorSection === 'close'}
                      <div class="space-y-3 max-w-xl">
                        {#each closeOptions as opt}
                          <label class="flex items-center gap-3 p-3 rounded-lg cursor-pointer"
                                 style="background: {opt.danger ? '#ef444410' : $colorStore.primary + '08'};">
                            <input
                              type="checkbox"
                              bind:checked={newOption[opt.key]}
                              class="rounded"
                            />
                            <div>
                              <span class="font-medium block text-sm"
                                    style="color: {$colorStore.text}">{opt.label}</span>
                              <span class="text-xs"
                                    style="color: {opt.danger ? '#ef4444' : $colorStore.muted}">{opt.desc}</span>
                            </div>
                          </label>
                        {/each}
                      </div>

                    {:else if optionCreatorSection === 'archive'}
                      <div class="space-y-3 max-w-xl">
                        {#each archiveOptions as opt}
                          <label class="flex items-center gap-3 p-3 rounded-lg cursor-pointer"
                                 style="background: {$colorStore.primary}08;">
                            <input
                              type="checkbox"
                              bind:checked={newOption[opt.key]}
                              class="rounded"
                            />
                            <div>
                              <span class="font-medium block text-sm"
                                    style="color: {$colorStore.text}">{opt.label}</span>
                              <span class="text-xs" style="color: {$colorStore.muted}">{opt.desc}</span>
                            </div>
                          </label>
                        {/each}
                      </div>

                    {:else if optionCreatorSection === 'modal'}
                      <ModalBuilder bind:modalJson={newOption.modalJson} />

                    {:else if optionCreatorSection === 'message'}
                      <FullscreenEmbedBuilder
                        bind:value={newOption.openMessageJson}
                        previewTitle={m.tickets.panelsOpenMessageTitle()}
                        previewDescription={m.tickets.panelsOpenMessagePreviewDescription()}
                        icon="fa-ticket"
                        allowContent={true}
                        allowMultipleEmbeds={true}
                        maxEmbeds={10}
                        allowComponents={false}
                        additionalPlaceholders={[
                          { category: m.tickets.panelsPlaceholderCategory(), name: "%ticket.id%", description: m.tickets.panelsPlaceholderTicketId() },
                          { category: m.tickets.panelsPlaceholderCategory(), name: "%ticket.user.mention%", description: m.tickets.panelsPlaceholderTicketCreator() }
                        ]}
                        guildId={$currentGuild?.id}
                        user={data.user}
                        placeholder={m.tickets.panelsOpenMessagePlaceholder()}
                      />
                    {/if}
                  </div>

                  <div class="flex justify-end gap-3 mt-6 pt-4 border-t" style="border-color: {$colorStore.primary}20;">
                    <button
                      class="px-4 py-3 rounded-xl font-medium transition-all hover:opacity-80 min-h-[44px]"
                      style="background: {$colorStore.muted}20; color: {$colorStore.muted};"
                      onclick={cancelCreatingOption}
                    >
                      {m.common.cancel()}
                    </button>
                    <button
                      class="px-4 py-3 rounded-xl font-medium transition-all hover:opacity-80 min-h-[44px] flex items-center gap-2"
                      style="background: {!newOption.label.trim() || !newOption.description.trim() || saving ? $colorStore.muted + '30' : $colorStore.primary + '20'};
                             color: {!newOption.label.trim() || !newOption.description.trim() || saving ? $colorStore.muted : $colorStore.primary};
                             border: {!newOption.label.trim() || !newOption.description.trim() || saving ? '2px dashed ' + $colorStore.muted + '60' : '1px solid ' + $colorStore.primary + '30'};"
                      disabled={!newOption.label.trim() || !newOption.description.trim() || saving}
                      onclick={saveNewOption}
                    >
                      {#if saving}
                        <i class="fa-solid fa-spinner fa-spin"></i>
                      {:else}
                        <i class="fa-solid fa-plus"></i>
                      {/if}
                      {m.common.addOption()}
                    </button>
                  </div>
                </div>
              {:else}
                <button
                  class="w-full mt-3 px-3 py-2 rounded-lg text-sm font-medium min-h-[44px]"
                  style="background: {canAddOption(menu.id) ? $colorStore.primary + '15' : $colorStore.muted + '15'};
                         color: {canAddOption(menu.id) ? $colorStore.primary : $colorStore.muted};
                         border: 1px dashed {canAddOption(menu.id) ? $colorStore.primary + '30' : $colorStore.muted + '30'};"
                  disabled={!canAddOption(menu.id)}
                  onclick={() => startCreatingOption(menu.id)}
                >
                  <i class="fa-solid fa-plus"></i>
                  {m.tickets.panelsAddOptionCount({ count: optionCount, max: 25 })}
                </button>
              {/if}
            </div>
          {/each}
        {/if}
      </div>

    {:else if activeTab === 'settings'}
      <div class="space-y-4">
        <div class="flex items-center justify-between">
          <h4 class="font-semibold" style="color: {$colorStore.text}">{m.tickets.panelsTabSettings()}</h4>
          <button
            class="px-3 py-2 rounded-lg text-sm font-medium transition-all hover:opacity-80"
            style="background: {editingPanelEmbed ? $colorStore.muted + '20' : $colorStore.secondary + '20'};
                   color: {editingPanelEmbed ? $colorStore.muted : $colorStore.secondary};
                   border: 1px solid {editingPanelEmbed ? $colorStore.muted + '30' : $colorStore.secondary + '30'};"
            onclick={() => {
              if (editingPanelEmbed) {
                editingPanelEmbed = false;
              } else {
                // Load current embed
                try {
                  const parsed = JSON.parse(selectedPanel.embedJson);
                  if (parsed.embeds && parsed.embeds.length > 0) {
                    tempPanelEmbed = parsed.embeds[0];
                  }
                } catch {
                  // Use defaults
                }
                editingPanelEmbed = true;
              }
            }}
          >
            <i class="fa-solid {editingPanelEmbed ? 'fa-xmark' : 'fa-pen'}"></i>
            {editingPanelEmbed ? m.common.cancel() : m.tickets.panelsEditEmbed()}
          </button>
        </div>

        {#if editingPanelEmbed}
          <div class="p-4 rounded-xl"
               style="background: {$colorStore.primary}05; border: 1px solid {$colorStore.primary}15;">
            <FullscreenEmbedBuilder
              bind:value={tempPanelEmbed}
              previewTitle={m.tickets.panelsEmbedTitle()}
              previewDescription={m.tickets.panelsEmbedPreviewDescription()}
              icon="fa-rectangle"
              allowContent={false}

              maxEmbeds={10}
              allowComponents={false}
              guildId={$currentGuild?.id}
              user={data.user}
              placeholder={m.tickets.panelsEmbedPlaceholder()}
            />
          </div>
          <div class="flex justify-end gap-3">
            <button
              class="px-4 py-3 rounded-xl font-medium"
              style="background: {$colorStore.muted}20; color: {$colorStore.muted};"
              onclick={() => editingPanelEmbed = false}
            >
              {m.common.cancel()}
            </button>
            <button
              class="px-4 py-3 rounded-xl font-medium flex items-center gap-2"
              style="background: {$colorStore.primary}20; color: {$colorStore.primary}; border: 1px solid {$colorStore.primary}30;"
              disabled={saving}
              onclick={() => savePanelEmbed(tempPanelEmbed)}
            >
              {#if saving}
                <i class="fa-solid fa-spinner fa-spin"></i>
              {:else}
                <i class="fa-solid fa-floppy-disk"></i>
              {/if}
              {m.common.saveEmbed()}
            </button>
          </div>
        {:else}
          <div class="p-6 rounded-xl text-center"
               style="background: {$colorStore.primary}08; border: 1px dashed {$colorStore.primary}20;">
            <i class="fa-solid fa-pen-to-square" style="color: {$colorStore.muted}; font-size: 48px; opacity: 0.3;"></i>
            <p class="mt-4" style="color: {$colorStore.muted}">{m.tickets.panelsSettingsHint()}</p>
          </div>
        {/if}
      </div>
    {/if}
  </div>
{:else}
  <div class="text-center py-24 rounded-xl"
       style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15); border: 1px dashed {$colorStore.primary}20;">
    <i class="fa-solid fa-hand-pointer" style="color: {$colorStore.muted}; font-size: 64px; opacity: 0.2;"></i>
    <p class="mt-6 text-lg font-medium" style="color: {$colorStore.text}">{m.tickets.panelsSelectPanel()}</p>
    <p class="text-sm mt-2" style="color: {$colorStore.muted}">{m.tickets.casesSelectPromptHint()}</p>
  </div>
{/if}


<style>
    .scrollbar-hide {
        -ms-overflow-style: none;
        scrollbar-width: none;
    }

    .scrollbar-hide::-webkit-scrollbar {
        display: none;
    }
</style>
