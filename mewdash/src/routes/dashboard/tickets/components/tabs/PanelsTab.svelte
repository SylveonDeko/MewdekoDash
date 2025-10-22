<!-- components/tabs/PanelsTab.svelte -->
<script lang="ts">
  import { colorStore } from "$lib/stores/colorStore";
  import { currentGuild } from "$lib/stores/currentGuild";
  import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";
  import FullscreenEmbedBuilder from "$lib/components/specialized/FullscreenEmbedBuilder.svelte";
  import EmojiPicker from "$lib/components/forms/EmojiPicker.svelte";
  import TabNavigation from "$lib/components/specialized/TabNavigation.svelte";
  import ModalBuilder from "../editors/ModalBuilder.svelte";
  import { onMount } from "svelte";

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
  const tabs = [
    { id: "buttons", label: "Buttons", icon: "fa-square-up-right" },
    { id: "selectmenus", label: "Select Menus", icon: "fa-list" },
    { id: "settings", label: "Panel Settings", icon: "fa-gear" }
  ];

  // Button editing state
  let editingButtonId = $state<number | null>(null);
  let editingButtonData = $state<any>(null);
  let buttonEditSection = $state("basic");

  // Button creation section (same tabs as editing)
  let buttonCreatorSection = $state("basic");

  const buttonSections = [
    { id: "basic", label: "Basic", icon: "fa-pen" },
    { id: "permissions", label: "Permissions", icon: "fa-shield" },
    { id: "timing", label: "Timing", icon: "fa-clock" },
    { id: "close", label: "Close", icon: "fa-door-closed" },
    { id: "archive", label: "Archive", icon: "fa-box-archive" },
    { id: "modal", label: "Modal", icon: "fa-window-maximize" },
    { id: "message", label: "Message", icon: "fa-message" }
  ];

  let buttonStyleOptions = [
    { id: "1", name: "Primary", label: "Primary (Blue)" },
    { id: "2", name: "Secondary", label: "Secondary (Gray)" },
    { id: "3", name: "Success", label: "Success (Green)" },
    { id: "4", name: "Danger", label: "Danger (Red)" }
  ];

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

  const optionSections = [
    { id: "basic", label: "Basic", icon: "fa-pen" },
    { id: "permissions", label: "Permissions", icon: "fa-shield" },
    { id: "timing", label: "Timing", icon: "fa-clock" },
    { id: "close", label: "Close", icon: "fa-door-closed" },
    { id: "archive", label: "Archive", icon: "fa-box-archive" },
    { id: "modal", label: "Modal", icon: "fa-window-maximize" },
    { id: "message", label: "Message", icon: "fa-message" }
  ];

  onMount(() => {
    // Component mounted
  });

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
      const url = `https://cdn.discordapp.com/emojis/${id}.${animated ? "png" : "png"}?size=32&quality=lossless`;
      return { url, name, isCustom: true };
    }

    // Regular Unicode emoji
    return { emoji: emojiString, isCustom: false };
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
      openMessageJson: fullButton.openMessageJson || null,
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
      newOption = { label: "", description: "", emoji: null };
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
      openMessageJson: fullOption.openMessageJson || null,
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

  let canAddButton = $derived(componentCount().canAddButtons >= 1);
  let canAddSelectMenu = $derived(componentCount().canAddMenus >= 1);

  // Select menu option limits (max 25 per menu)
  function getOptionCount(menuId: number): number {
    const menu = panelSelectMenus.find(m => m.id === menuId);
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
              {panel.buttonCount || 0}B • {panel.selectMenuCount || 0}M
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
      <span class="ml-2">{showPanelCreator ? 'Cancel' : 'New Panel'}</span>
    </button>
  </div>
</div>

{#if showPanelCreator}
  <!-- Inline Panel Creator -->
  <div class="space-y-6">
    <h3 class="text-xl font-bold" style="color: {$colorStore.text}">Create New Panel</h3>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">
            Channel <span style="color: #ef4444;">*</span>
          </label>
          <DiscordSelector
            type="channel"
            options={textChannels}
            bind:selected={newPanel.channelId}
            placeholder="Select channel..."
            multiple={false}
          />
        </div>
        <div class="p-4 rounded-xl"
             style="background: {$colorStore.primary}05; border: 1px solid {$colorStore.primary}15;">
          <h4 class="font-semibold mb-4" style="color: {$colorStore.text}">Panel Embed</h4>
          <FullscreenEmbedBuilder
            bind:value={panelEmbed}
            previewTitle="Panel Embed"
            previewDescription="Embed shown in the ticket panel"
            icon="fa-window-maximize"
            allowContent={false}
            maxEmbeds={10}
            allowComponents={false}
            guildId={$currentGuild?.id}
            user={data.user}
            placeholder="Click to configure panel embed"
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
        Cancel
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
        Create Panel
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
        Troubleshoot
      </button>
      {#if panelStatuses.get(selectedPanel.messageId) === 1}
        <button
          class="px-3 py-2 rounded-lg text-sm font-medium transition-all hover:opacity-80"
          style="background: #f59e0b20; color: #f59e0b; border: 1px solid #f59e0b30;"
          onclick={() => recreatePanel(selectedPanel.messageId)}
        >
          <i class="fa-solid fa-arrows-rotate"></i>
          Recreate
        </button>
      {/if}
      <button
        class="px-3 py-2 rounded-lg text-sm font-medium transition-all hover:opacity-80"
        style="background: #ef444420; color: #ef4444; border: 1px solid #ef444430;"
        onclick={() => showConfirm(
          "Delete Panel",
          "Delete this panel?",
          () => deletePanel(selectedPanel.messageId, false),
          "danger"
        )}
      >
        <i class="fa-solid fa-trash"></i>
        Delete
      </button>
    </div>
  </div>

  <!-- Tab Navigation -->
  <TabNavigation
    bind:activeTab
    {tabs}
    ariaLabel="Panel configuration sections"
  />

  <!-- Tab Content -->
  <div class="mt-6">
    {#if activeTab === 'buttons'}
      <div class="space-y-4">
        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h4 class="font-semibold" style="color: {$colorStore.text}">
              Buttons ({panelButtons.length})
            </h4>
            <p class="text-xs mt-1" style="color: {$colorStore.muted}">
              Can add {componentCount().canAddButtons} more button{componentCount().canAddButtons !== 1 ? 's' : ''}
              or {componentCount().canAddMenus} more menu{componentCount().canAddMenus !== 1 ? 's' : ''}
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
            {showButtonCreator ? 'Cancel' : 'Add Button'}
          </button>
        </div>

        {#if !canAddButton && !showButtonCreator}
          <div class="p-3 rounded-lg" style="background: #f59e0b10; border: 1px solid #f59e0b30;">
            <i class="fa-solid fa-triangle-exclamation" style="color: #f59e0b;"></i>
            <span class="ml-2 text-sm" style="color: #f59e0b;">
              Component limit reached. Remove buttons or select menus to add more.
            </span>
          </div>
        {/if}

        <!-- Inline Button Creator -->
        {#if showButtonCreator}
          <div class="p-4 rounded-xl border-2"
               style="background: {$colorStore.secondary}10; border-color: {$colorStore.secondary}30;">
            <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-4">
              <h5 class="font-semibold" style="color: {$colorStore.text}">New Button</h5>
              <button
                class="px-3 py-2 rounded text-sm min-h-[44px]"
                style="background: {$colorStore.muted}20; color: {$colorStore.muted};"
                onclick={() => { showButtonCreator = false; buttonCreatorSection = "basic"; }}
              >
                <i class="fa-solid fa-xmark"></i>
                Cancel
              </button>
            </div>

            <!-- Button Creator Sections -->
            <TabNavigation
              bind:activeTab={buttonCreatorSection}
              tabs={buttonSections}
              ariaLabel="Button configuration sections"
            />

            <div class="mt-4">
              {#if buttonCreatorSection === 'basic'}
                <div class="space-y-4 max-w-xl">
                  <div>
                    <label class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">Label *</label>
                    <input
                      type="text"
                      bind:value={newButton.label}
                      maxlength="80"
                      class="w-full px-3 py-2 rounded-lg border"
                      placeholder="Support Ticket"
                      style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                    />
                    <p class="text-xs mt-1" style="color: {$colorStore.muted}">Max 80 characters</p>
                  </div>
                  <div>
                    <label class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">Emoji</label>
                    <EmojiPicker
                      {guildEmojis}
                      bind:selected={newButton.emoji}
                      multiple={false}
                      placeholder="Select emoji..."
                      searchable={true}
                      groupByGuild={true}
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">Style</label>
                    <DiscordSelector
                      type="custom"
                      options={buttonStyleOptions}
                      bind:selected={newButton.style}
                      placeholder="Select style..."
                      multiple={false}
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">Channel Name
                      Format</label>
                    <input
                      type="text"
                      bind:value={newButton.channelFormat}
                      maxlength="100"
                      class="w-full px-3 py-2 rounded-lg border font-mono text-sm"
                      placeholder="ticket-&#123;username&#125;-&#123;id&#125;"
                      style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                    />
                    <p class="text-xs mt-1" style="color: {$colorStore.muted}">
                      Available: &#123;username&#125;, &#123;id&#125; • Max 100 characters
                    </p>
                  </div>
                </div>

              {:else if buttonCreatorSection === 'permissions'}
                <div class="space-y-4 max-w-3xl">
                  <div>
                    <label class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">Ticket
                      Category</label>
                    <DiscordSelector
                      type="channel"
                      options={categories}
                      bind:selected={newButton.categoryId}
                      placeholder="Select category..."
                      multiple={false}
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">Archive
                      Category</label>
                    <DiscordSelector
                      type="channel"
                      options={categories}
                      bind:selected={newButton.archiveCategoryId}
                      placeholder="Select category..."
                      multiple={false}
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">Support
                      Roles</label>
                    <DiscordSelector
                      type="role"
                      options={availableRoles}
                      bind:selected={newButton.supportRoles}
                      placeholder="Select roles..."
                      multiple={true}
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">Viewer Roles</label>
                    <DiscordSelector
                      type="role"
                      options={availableRoles}
                      bind:selected={newButton.viewerRoles}
                      placeholder="Select roles..."
                      multiple={true}
                    />
                  </div>
                </div>

              {:else if buttonCreatorSection === 'timing'}
                <div class="space-y-4 max-w-3xl">
                  <div class="grid grid-cols-2 gap-4">
                    <div>
                      <label class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">Max Active
                        Tickets</label>
                      <input
                        type="number"
                        bind:value={newButton.maxActiveTickets}
                        min="1"
                        class="w-full px-3 py-2 rounded-lg border"
                        style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                      />
                    </div>
                    <div>
                      <label class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">Auto Close
                        (hours)</label>
                      <input
                        type="number"
                        bind:value={newButton.autoCloseTime}
                        min="1"
                        placeholder="None"
                        class="w-full px-3 py-2 rounded-lg border"
                        style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                      />
                    </div>
                    <div>
                      <label class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">Required Response
                        Time (minutes)</label>
                      <input
                        type="number"
                        bind:value={newButton.requiredResponseTime}
                        min="1"
                        placeholder="None"
                        class="w-full px-3 py-2 rounded-lg border"
                        style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                      />
                    </div>
                  </div>
                  <div>
                    <label class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">Allowed
                      Priorities</label>
                    <DiscordSelector
                      type="custom"
                      options={priorities.map(p => ({ id: p.id, name: p.name, label: p.name }))}
                      bind:selected={newButton.allowedPriorities}
                      placeholder="Select priorities..."
                      multiple={true}
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">Default
                      Priority</label>
                    <DiscordSelector
                      type="custom"
                      options={priorities.map(p => ({ id: p.id, name: p.name, label: p.name }))}
                      bind:selected={newButton.defaultPriority}
                      placeholder="Select default..."
                      multiple={false}
                    />
                  </div>
                </div>

              {:else if buttonCreatorSection === 'close'}
                <div class="space-y-3 max-w-xl">
                  {#each [
                    {
                      key: 'saveTranscript',
                      label: 'Save Transcript',
                      desc: 'Save chat history',
                      prop: 'saveTranscript'
                    },
                    { key: 'lockOnClose', label: 'Lock on Close', desc: 'Prevent messages', prop: 'lockOnClose' },
                    {
                      key: 'renameOnClose',
                      label: 'Rename on Close',
                      desc: 'Add closed- prefix',
                      prop: 'renameOnClose'
                    },
                    {
                      key: 'removeCreatorOnClose',
                      label: 'Remove Creator',
                      desc: 'Remove user permissions',
                      prop: 'removeCreatorOnClose'
                    },
                    {
                      key: 'deleteOnClose',
                      label: 'Delete on Close',
                      desc: 'Permanently delete',
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
                    <label class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">Delete Delay
                      (seconds)</label>
                    <input
                      type="number"
                      bind:value={newButton.deleteDelay}
                      min="0"
                      placeholder="0 (instant)"
                      class="w-full px-3 py-2 rounded-lg border"
                      style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                    />
                    <p class="text-xs mt-1" style="color: {$colorStore.muted}">Delay before deleting ticket on close</p>
                  </div>
                </div>

              {:else if buttonCreatorSection === 'archive'}
                <div class="space-y-3 max-w-xl">
                  {#each [
                    {
                      key: 'autoArchiveOnClose',
                      label: 'Auto Archive on Close',
                      desc: 'Automatically archive',
                      prop: 'autoArchiveOnClose'
                    },
                    { key: 'lockOnArchive', label: 'Lock on Archive', desc: 'Prevent messages', prop: 'lockOnArchive' },
                    {
                      key: 'renameOnArchive',
                      label: 'Rename on Archive',
                      desc: 'Add archived- prefix',
                      prop: 'renameOnArchive'
                    },
                    {
                      key: 'removeCreatorOnArchive',
                      label: 'Remove Creator',
                      desc: 'Remove user permissions',
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
                  previewTitle="Ticket Open Message"
                  previewDescription="Message sent when ticket is opened"
                  icon="fa-ticket"
                  allowContent={true}
                  allowMultipleEmbeds={true}
                  maxEmbeds={10}
                  allowComponents={false}
                  additionalPlaceholders={[
                    { category: "Ticket", name: "%ticket.id%", description: "Ticket ID" },
                    { category: "Ticket", name: "%ticket.user.mention%", description: "Mention ticket creator" }
                  ]}
                  guildId={$currentGuild?.id}
                  user={data.user}
                  placeholder="Configure ticket open message"
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
                Cancel
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
                Create Button
              </button>
            </div>
          </div>
        {/if}

        {#if panelButtons.length === 0 && !showButtonCreator}
          <div class="text-center py-12 rounded-xl"
               style="background: {$colorStore.primary}08; border: 1px dashed {$colorStore.primary}20;">
            <i class="fa-solid fa-square-up-right"
               style="color: {$colorStore.muted}; font-size: 48px; opacity: 0.3;"></i>
            <p class="mt-4" style="color: {$colorStore.muted}">No buttons yet</p>
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
                    <h5 class="font-semibold" style="color: {$colorStore.text}">Editing: {button.label}</h5>
                    <button
                      class="px-3 py-2 rounded text-sm min-h-[44px]"
                      style="background: {$colorStore.muted}20; color: {$colorStore.muted};"
                      onclick={cancelEditingButton}
                    >
                      <i class="fa-solid fa-xmark"></i>
                      Cancel
                    </button>
                  </div>

                  <!-- Button Edit Sections -->
                  <TabNavigation
                    bind:activeTab={buttonEditSection}
                    tabs={buttonSections}
                    ariaLabel="Button configuration sections"
                  />

                  <div class="mt-4">
                    {#if buttonEditSection === 'basic'}
                      <div class="space-y-4 max-w-xl">
                        <div>
                          <label class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">Label</label>
                          <input
                            type="text"
                            bind:value={editingButtonData.label}
                            maxlength="80"
                            class="w-full px-3 py-2 rounded-lg border"
                            style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                          />
                          <p class="text-xs mt-1" style="color: {$colorStore.muted}">Max 80 characters</p>
                        </div>
                        <div>
                          <label class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">Emoji</label>
                          <EmojiPicker
                            {guildEmojis}
                            bind:selected={editingButtonData.emoji}
                            multiple={false}
                            placeholder="Select emoji..."
                            searchable={true}
                            groupByGuild={true}
                          />
                        </div>
                        <div>
                          <label class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">Style</label>
                          <DiscordSelector
                            type="custom"
                            options={buttonStyleOptions}
                            bind:selected={editingButtonData.style}
                            placeholder="Select style..."
                            multiple={false}
                          />
                        </div>
                      </div>

                    {:else if buttonEditSection === 'permissions'}
                      <div class="space-y-4 max-w-3xl">
                        <div>
                          <label class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">Ticket
                            Category</label>
                          <DiscordSelector
                            type="channel"
                            options={categories}
                            bind:selected={editingButtonData.categoryId}
                            placeholder="Select category..."
                            multiple={false}
                          />
                        </div>
                        <div>
                          <label class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">Archive
                            Category</label>
                          <DiscordSelector
                            type="channel"
                            options={categories}
                            bind:selected={editingButtonData.archiveCategoryId}
                            placeholder="Select category..."
                            multiple={false}
                          />
                        </div>
                        <div>
                          <label class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">Support
                            Roles</label>
                          <DiscordSelector
                            type="role"
                            options={availableRoles}
                            bind:selected={editingButtonData.supportRoles}
                            placeholder="Select roles..."
                            multiple={true}
                          />
                        </div>
                        <div>
                          <label class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">Viewer
                            Roles</label>
                          <DiscordSelector
                            type="role"
                            options={availableRoles}
                            bind:selected={editingButtonData.viewerRoles}
                            placeholder="Select roles..."
                            multiple={true}
                          />
                        </div>
                      </div>

                    {:else if buttonEditSection === 'timing'}
                      <div class="space-y-4 max-w-3xl">
                        <div class="grid grid-cols-2 gap-4">
                          <div>
                            <label class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">Max Active
                              Tickets</label>
                            <input
                              type="number"
                              bind:value={editingButtonData.maxActiveTickets}
                              min="1"
                              class="w-full px-3 py-2 rounded-lg border"
                              style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                            />
                          </div>
                          <div>
                            <label class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">Auto Close
                              (hours)</label>
                            <input
                              type="number"
                              bind:value={editingButtonData.autoCloseTime}
                              min="1"
                              placeholder="None"
                              class="w-full px-3 py-2 rounded-lg border"
                              style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                            />
                          </div>
                        </div>
                      </div>

                    {:else if buttonEditSection === 'close'}
                      <div class="space-y-3 max-w-xl">
                        {#each [
                          { key: 'saveTranscript', label: 'Save Transcript', desc: 'Save chat history' },
                          { key: 'lockOnClose', label: 'Lock on Close', desc: 'Prevent messages' },
                          { key: 'renameOnClose', label: 'Rename on Close', desc: 'Add closed- prefix' },
                          { key: 'removeCreatorOnClose', label: 'Remove Creator', desc: 'Remove user permissions' },
                          { key: 'deleteOnClose', label: 'Delete on Close', desc: 'Permanently delete', danger: true }
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
                          { key: 'autoArchiveOnClose', label: 'Auto Archive on Close', desc: 'Automatically archive' },
                          { key: 'lockOnArchive', label: 'Lock on Archive', desc: 'Prevent messages' },
                          { key: 'renameOnArchive', label: 'Rename on Archive', desc: 'Add archived- prefix' },
                          { key: 'removeCreatorOnArchive', label: 'Remove Creator', desc: 'Remove user permissions' }
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
                        previewTitle="Ticket Open Message"
                        previewDescription="Message sent when ticket is opened"
                        icon="fa-ticket"
                        allowContent={true}
                        allowMultipleEmbeds={true}
                        maxEmbeds={10}
                        allowComponents={false}
                        additionalPlaceholders={[
                          { category: "Ticket", name: "%ticket.id%", description: "Ticket ID" },
                          { category: "Ticket", name: "%ticket.user.mention%", description: "Mention ticket creator" }
                        ]}
                        guildId={$currentGuild?.id}
                        user={data.user}
                        placeholder="Configure ticket open message"
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
                      Cancel
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
                      Save Changes
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
                        Style: {button.style} • Max: {button.maxActiveTickets}
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
                      <span class="ml-1">Edit</span>
                    </button>
                    <button
                      class="flex-1 sm:flex-none px-3 py-2 rounded-lg text-sm transition-all hover:opacity-80 min-h-[44px]"
                      style="background: #ef444420; color: #ef4444;"
                      onclick={() => showConfirm("Delete Button", `Delete "${button.label}"?`, () => deleteButton(button.id), "danger")}
                    >
                      <i class="fa-solid fa-trash"></i>
                      <span class="ml-1 sm:hidden">Delete</span>
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
              Select Menus ({panelSelectMenus.length})
            </h4>
            <p class="text-xs mt-1" style="color: {$colorStore.muted}">
              Can add {componentCount().canAddButtons} more button{componentCount().canAddButtons !== 1 ? 's' : ''}
              or {componentCount().canAddMenus} more menu{componentCount().canAddMenus !== 1 ? 's' : ''}
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
            {showSelectMenuCreator ? 'Cancel' : 'Add Menu'}
          </button>
        </div>

        {#if !canAddSelectMenu && !showSelectMenuCreator}
          <div class="p-3 rounded-lg" style="background: #f59e0b10; border: 1px solid #f59e0b30;">
            <i class="fa-solid fa-triangle-exclamation" style="color: #f59e0b;"></i>
            <span class="ml-2 text-sm" style="color: #f59e0b;">
              Component limit reached. Need 5 slots for a select menu. Remove components to add more.
            </span>
          </div>
        {/if}

        <!-- Inline Select Menu Creator -->
        {#if showSelectMenuCreator}
          <div class="p-4 rounded-xl border-2"
               style="background: {$colorStore.accent}10; border-color: {$colorStore.accent}30;">
            <h5 class="font-semibold mb-4" style="color: {$colorStore.text}">New Select Menu</h5>
            <div class="space-y-3 max-w-2xl">
              <div>
                <label class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">Placeholder *</label>
                <input
                  type="text"
                  bind:value={newSelectMenu.placeholder}
                  maxlength="150"
                  class="w-full px-3 py-2 rounded-lg border"
                  placeholder="Select a ticket type..."
                  style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                />
                <p class="text-xs mt-1" style="color: {$colorStore.muted}">Max 150 characters</p>
              </div>
              <div>
                <label class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">First Option Label
                  *</label>
                <input
                  type="text"
                  bind:value={newSelectMenu.firstOptionLabel}
                  maxlength="100"
                  class="w-full px-3 py-2 rounded-lg border"
                  placeholder="General Support"
                  style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                />
                <p class="text-xs mt-1" style="color: {$colorStore.muted}">Max 100 characters</p>
              </div>
              <div>
                <label class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">First Option
                  Description</label>
                <input
                  type="text"
                  bind:value={newSelectMenu.firstOptionDescription}
                  maxlength="100"
                  class="w-full px-3 py-2 rounded-lg border"
                  placeholder="Get help with general questions"
                  style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                />
                <p class="text-xs mt-1" style="color: {$colorStore.muted}">Max 100 characters</p>
              </div>
              <div>
                <label class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">First Option
                  Emoji</label>
                <EmojiPicker
                  {guildEmojis}
                  bind:selected={newSelectMenu.firstOptionEmoji}
                  multiple={false}
                  placeholder="Select emoji..."
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
                  Cancel
                </button>
                <button
                  class="px-3 py-2 rounded-lg text-sm"
                  style="background: {$colorStore.primary}20; color: {$colorStore.primary}; border: 1px solid {$colorStore.primary}30;"
                  disabled={!newSelectMenu.placeholder || !newSelectMenu.firstOptionLabel}
                  onclick={addSelectMenu}
                >
                  <i class="fa-solid fa-plus"></i>
                  Add
                </button>
              </div>
            </div>
          </div>
        {/if}

        {#if panelSelectMenus.length === 0 && !showSelectMenuCreator}
          <div class="text-center py-12 rounded-xl"
               style="background: {$colorStore.primary}08; border: 1px dashed {$colorStore.primary}20;">
            <i class="fa-solid fa-list" style="color: {$colorStore.muted}; font-size: 48px; opacity: 0.3;"></i>
            <p class="mt-4" style="color: {$colorStore.muted}">No select menus yet</p>
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
                        onclick={savePlaceholder}
                      >
                        <i class="fa-solid fa-check"></i>
                      </button>
                      <button
                        class="px-3 py-2 rounded-lg min-h-[44px]"
                        style="background: {$colorStore.muted}20; color: {$colorStore.muted};"
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
                        onclick={() => startEditingPlaceholder(menu.id, menu.placeholder)}
                      >
                        <i class="fa-solid fa-pen text-xs"></i>
                      </button>
                    </div>
                  {/if}
                  <p class="text-xs mt-1" style="color: {$colorStore.muted}">
                    {menu.options?.length || 0} options
                  </p>
                </div>
                <button
                  class="px-3 py-2 rounded-lg text-sm transition-all hover:opacity-80 min-h-[44px] w-full sm:w-auto"
                  style="background: #ef444420; color: #ef4444;"
                  onclick={() => showConfirm("Delete Menu", "Delete this menu?", () => deleteSelectMenu(menu.id), "danger")}
                >
                  <i class="fa-solid fa-trash"></i>
                  <span class="ml-1">Delete Menu</span>
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
                            <h5 class="font-semibold" style="color: {$colorStore.text}">Editing: {option.label}</h5>
                            <button
                              class="px-3 py-2 rounded text-sm min-h-[44px]"
                              style="background: {$colorStore.muted}20; color: {$colorStore.muted};"
                              onclick={cancelEditingOption}
                            >
                              <i class="fa-solid fa-xmark"></i>
                              Cancel
                            </button>
                          </div>

                          <!-- Option Edit Sections -->
                          <TabNavigation
                            bind:activeTab={optionEditSection}
                            tabs={optionSections}
                            ariaLabel="Option configuration sections"
                          />

                          <div class="mt-4">
                            {#if optionEditSection === 'basic'}
                              <div class="space-y-4 max-w-xl">
                                <div>
                                  <label class="block text-sm font-medium mb-2"
                                         style="color: {$colorStore.text}">Label</label>
                                  <input
                                    type="text"
                                    bind:value={editingOptionData.label}
                                    maxlength="100"
                                    class="w-full px-3 py-2 rounded-lg border"
                                    style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                                  />
                                  <p class="text-xs mt-1" style="color: {$colorStore.muted}">Max 100 characters</p>
                                </div>
                                <div>
                                  <label class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">Description
                                    *</label>
                                  <input
                                    type="text"
                                    bind:value={editingOptionData.description}
                                    maxlength="100"
                                    class="w-full px-3 py-2 rounded-lg border"
                                    placeholder="Describe this option"
                                    style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                                  />
                                  <p class="text-xs mt-1" style="color: {$colorStore.muted}">Max 100 characters</p>
                                </div>
                                <div>
                                  <label class="block text-sm font-medium mb-2"
                                         style="color: {$colorStore.text}">Emoji</label>
                                  <EmojiPicker
                                    {guildEmojis}
                                    bind:selected={editingOptionData.emoji}
                                    multiple={false}
                                    placeholder="Select emoji..."
                                    searchable={true}
                                    groupByGuild={true}
                                  />
                                </div>
                                <div>
                                  <label class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">Channel
                                    Name Format</label>
                                  <input
                                    type="text"
                                    bind:value={editingOptionData.channelNameFormat}
                                    maxlength="100"
                                    class="w-full px-3 py-2 rounded-lg border font-mono text-sm"
                                    placeholder="ticket-&#123;username&#125;-&#123;id&#125;"
                                    style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                                  />
                                  <p class="text-xs mt-1" style="color: {$colorStore.muted}">
                                    Available: &#123;username&#125;, &#123;id&#125; • Max 100 characters
                                  </p>
                                </div>
                              </div>

                            {:else if optionEditSection === 'permissions'}
                              <div class="space-y-4 max-w-3xl">
                                <div>
                                  <label class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">Ticket
                                    Category</label>
                                  <DiscordSelector
                                    type="channel"
                                    options={categories}
                                    bind:selected={editingOptionData.categoryId}
                                    placeholder="Select category..."
                                    multiple={false}
                                  />
                                </div>
                                <div>
                                  <label class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">Archive
                                    Category</label>
                                  <DiscordSelector
                                    type="channel"
                                    options={categories}
                                    bind:selected={editingOptionData.archiveCategoryId}
                                    placeholder="Select category..."
                                    multiple={false}
                                  />
                                </div>
                                <div>
                                  <label class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">Support
                                    Roles</label>
                                  <DiscordSelector
                                    type="role"
                                    options={availableRoles}
                                    bind:selected={editingOptionData.supportRoles}
                                    placeholder="Select roles..."
                                    multiple={true}
                                  />
                                </div>
                                <div>
                                  <label class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">Viewer
                                    Roles</label>
                                  <DiscordSelector
                                    type="role"
                                    options={availableRoles}
                                    bind:selected={editingOptionData.viewerRoles}
                                    placeholder="Select roles..."
                                    multiple={true}
                                  />
                                </div>
                              </div>

                            {:else if optionEditSection === 'timing'}
                              <div class="space-y-4 max-w-3xl">
                                <div class="grid grid-cols-2 gap-4">
                                  <div>
                                    <label class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">Max
                                      Active Tickets</label>
                                    <input
                                      type="number"
                                      bind:value={editingOptionData.maxActiveTickets}
                                      min="1"
                                      class="w-full px-3 py-2 rounded-lg border"
                                      style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                                    />
                                  </div>
                                  <div>
                                    <label class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">Auto
                                      Close (hours)</label>
                                    <input
                                      type="number"
                                      bind:value={editingOptionData.autoCloseTime}
                                      min="1"
                                      placeholder="None"
                                      class="w-full px-3 py-2 rounded-lg border"
                                      style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                                    />
                                  </div>
                                </div>
                              </div>

                            {:else if optionEditSection === 'close'}
                              <div class="space-y-3 max-w-xl">
                                {#each [
                                  { key: 'saveTranscript', label: 'Save Transcript', desc: 'Save chat history' },
                                  { key: 'lockOnClose', label: 'Lock on Close', desc: 'Prevent messages' },
                                  { key: 'renameOnClose', label: 'Rename on Close', desc: 'Add closed- prefix' },
                                  {
                                    key: 'removeCreatorOnClose',
                                    label: 'Remove Creator',
                                    desc: 'Remove user permissions'
                                  },
                                  {
                                    key: 'deleteOnClose',
                                    label: 'Delete on Close',
                                    desc: 'Permanently delete',
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
                                    label: 'Auto Archive on Close',
                                    desc: 'Automatically archive'
                                  },
                                  { key: 'lockOnArchive', label: 'Lock on Archive', desc: 'Prevent messages' },
                                  { key: 'renameOnArchive', label: 'Rename on Archive', desc: 'Add archived- prefix' },
                                  {
                                    key: 'removeCreatorOnArchive',
                                    label: 'Remove Creator',
                                    desc: 'Remove user permissions'
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
                                previewTitle="Ticket Open Message"
                                previewDescription="Message sent when ticket is opened"
                                icon="fa-ticket"
                                allowContent={true}
                                allowMultipleEmbeds={true}
                                maxEmbeds={10}
                                allowComponents={false}
                                additionalPlaceholders={[
                                  { category: "Ticket", name: "%ticket.id%", description: "Ticket ID" },
                                  { category: "Ticket", name: "%ticket.user.mention%", description: "Mention ticket creator" }
                                ]}
                                guildId={$currentGuild?.id}
                                user={data.user}
                                placeholder="Configure ticket open message"
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
                              Cancel
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
                              Save Changes
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
                              <span class="ml-1">Edit</span>
                            </button>
                            <button
                              class="flex-1 sm:flex-none px-3 py-2 rounded text-sm min-h-[44px]"
                              style="background: #ef444420; color: #ef4444;"
                              onclick={() => showConfirm("Delete Option", `Delete "${option.label}"?`, () => deleteSelectOption(option.id), "danger")}
                            >
                              <i class="fa-solid fa-trash"></i>
                              <span class="ml-1 sm:hidden">Delete</span>
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
                  <span class="ml-2">Maximum 25 options per menu</span>
                </div>
              {/if}

              <!-- Inline Option Creator -->
              {#if showOptionCreator && creatingOptionForMenu === menu.id}
                <div class="mt-3 p-4 rounded-xl border-2"
                     style="background: {$colorStore.secondary}10; border-color: {$colorStore.secondary}30;">
                  <div class="flex items-center justify-between mb-4">
                    <h5 class="font-semibold" style="color: {$colorStore.text}">New Option</h5>
                    <button
                      class="px-2 py-1 rounded text-sm"
                      style="background: {$colorStore.muted}20; color: {$colorStore.muted};"
                      onclick={cancelCreatingOption}
                    >
                      <i class="fa-solid fa-xmark"></i>
                    </button>
                  </div>

                  <TabNavigation
                    bind:activeTab={optionCreatorSection}
                    tabs={optionSections}
                    ariaLabel="New option configuration sections"
                  />

                  <div class="mt-4">
                    {#if optionCreatorSection === 'basic'}
                      <div class="space-y-4 max-w-xl">
                        <div>
                          <label class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">Label
                            *</label>
                          <input
                            type="text"
                            bind:value={newOption.label}
                            maxlength="100"
                            class="w-full px-3 py-2 rounded-lg border"
                            placeholder="General Support"
                            style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                          />
                          <p class="text-xs mt-1" style="color: {$colorStore.muted}">Max 100 characters</p>
                        </div>
                        <div>
                          <label class="block text-sm font-medium mb-2"
                                 style="color: {$colorStore.text}">Description *</label>
                          <input
                            type="text"
                            bind:value={newOption.description}
                            maxlength="100"
                            class="w-full px-3 py-2 rounded-lg border"
                            placeholder="Get help with general questions"
                            style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                          />
                          <p class="text-xs mt-1" style="color: {$colorStore.muted}">Max 100 characters</p>
                        </div>
                        <div>
                          <label class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">Emoji</label>
                          <EmojiPicker
                            {guildEmojis}
                            bind:selected={newOption.emoji}
                            multiple={false}
                            placeholder="Select emoji..."
                            searchable={true}
                            groupByGuild={true}
                          />
                        </div>
                        <div>
                          <label class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">Channel Name
                            Format</label>
                          <input
                            type="text"
                            bind:value={newOption.channelNameFormat}
                            maxlength="100"
                            class="w-full px-3 py-2 rounded-lg border font-mono text-sm"
                            placeholder="ticket-&#123;username&#125;-&#123;id&#125;"
                            style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                          />
                          <p class="text-xs mt-1" style="color: {$colorStore.muted}">
                            Available: &#123;username&#125;, &#123;id&#125; • Max 100 characters
                          </p>
                        </div>
                      </div>

                    {:else if optionCreatorSection === 'permissions'}
                      <div class="space-y-4 max-w-3xl">
                        <div>
                          <label class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">Ticket
                            Category</label>
                          <DiscordSelector
                            type="channel"
                            options={categories}
                            bind:selected={newOption.categoryId}
                            placeholder="Select category..."
                            multiple={false}
                          />
                        </div>
                        <div>
                          <label class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">Archive
                            Category</label>
                          <DiscordSelector
                            type="channel"
                            options={categories}
                            bind:selected={newOption.archiveCategoryId}
                            placeholder="Select category..."
                            multiple={false}
                          />
                        </div>
                        <div>
                          <label class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">Support
                            Roles</label>
                          <DiscordSelector
                            type="role"
                            options={availableRoles}
                            bind:selected={newOption.supportRoles}
                            placeholder="Select roles..."
                            multiple={true}
                          />
                        </div>
                        <div>
                          <label class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">Viewer
                            Roles</label>
                          <DiscordSelector
                            type="role"
                            options={availableRoles}
                            bind:selected={newOption.viewerRoles}
                            placeholder="Select roles..."
                            multiple={true}
                          />
                        </div>
                      </div>

                    {:else if optionCreatorSection === 'timing'}
                      <div class="space-y-4 max-w-3xl">
                        <div class="grid grid-cols-2 gap-4">
                          <div>
                            <label class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">Max Active
                              Tickets</label>
                            <input
                              type="number"
                              bind:value={newOption.maxActiveTickets}
                              min="1"
                              class="w-full px-3 py-2 rounded-lg border"
                              style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                            />
                          </div>
                          <div>
                            <label class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">Auto Close
                              (hours)</label>
                            <input
                              type="number"
                              bind:value={newOption.autoCloseTime}
                              min="1"
                              placeholder="None"
                              class="w-full px-3 py-2 rounded-lg border"
                              style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                            />
                          </div>
                        </div>
                      </div>

                    {:else if optionCreatorSection === 'close'}
                      <div class="space-y-3 max-w-xl">
                        {#each [
                          { key: 'saveTranscript', label: 'Save Transcript', desc: 'Save chat history' },
                          { key: 'lockOnClose', label: 'Lock on Close', desc: 'Prevent messages' },
                          { key: 'renameOnClose', label: 'Rename on Close', desc: 'Add closed- prefix' },
                          { key: 'removeCreatorOnClose', label: 'Remove Creator', desc: 'Remove user permissions' },
                          { key: 'deleteOnClose', label: 'Delete on Close', desc: 'Permanently delete', danger: true }
                        ] as opt}
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
                        {#each [
                          { key: 'autoArchiveOnClose', label: 'Auto Archive on Close', desc: 'Automatically archive' },
                          { key: 'lockOnArchive', label: 'Lock on Archive', desc: 'Prevent messages' },
                          { key: 'renameOnArchive', label: 'Rename on Archive', desc: 'Add archived- prefix' },
                          { key: 'removeCreatorOnArchive', label: 'Remove Creator', desc: 'Remove user permissions' }
                        ] as opt}
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
                        previewTitle="Ticket Open Message"
                        previewDescription="Message sent when ticket is opened"
                        icon="fa-ticket"
                        allowContent={true}
                        allowMultipleEmbeds={true}
                        maxEmbeds={10}
                        allowComponents={false}
                        additionalPlaceholders={[
                          { category: "Ticket", name: "%ticket.id%", description: "Ticket ID" },
                          { category: "Ticket", name: "%ticket.user.mention%", description: "Mention ticket creator" }
                        ]}
                        guildId={$currentGuild?.id}
                        user={data.user}
                        placeholder="Configure ticket open message"
                      />
                    {/if}
                  </div>

                  <div class="flex justify-end gap-3 mt-6 pt-4 border-t" style="border-color: {$colorStore.primary}20;">
                    <button
                      class="px-4 py-3 rounded-xl font-medium transition-all hover:opacity-80 min-h-[44px]"
                      style="background: {$colorStore.muted}20; color: {$colorStore.muted};"
                      onclick={cancelCreatingOption}
                    >
                      Cancel
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
                      Add Option
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
                  Add Option ({optionCount}/25)
                </button>
              {/if}
            </div>
          {/each}
        {/if}
      </div>

    {:else if activeTab === 'settings'}
      <div class="space-y-4">
        <div class="flex items-center justify-between">
          <h4 class="font-semibold" style="color: {$colorStore.text}">Panel Settings</h4>
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
            {editingPanelEmbed ? 'Cancel' : 'Edit Embed'}
          </button>
        </div>

        {#if editingPanelEmbed}
          <div class="p-4 rounded-xl"
               style="background: {$colorStore.primary}05; border: 1px solid {$colorStore.primary}15;">
            <FullscreenEmbedBuilder
              bind:value={tempPanelEmbed}
              previewTitle="Panel Embed"
              previewDescription="Embed shown in the ticket panel"
              icon="fa-window-maximize"
              allowContent={false}

              maxEmbeds={10}
              allowComponents={false}
              guildId={$currentGuild?.id}
              user={data.user}
              placeholder="Click to configure panel embed"
            />
          </div>
          <div class="flex justify-end gap-3">
            <button
              class="px-4 py-3 rounded-xl font-medium"
              style="background: {$colorStore.muted}20; color: {$colorStore.muted};"
              onclick={() => editingPanelEmbed = false}
            >
              Cancel
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
              Save Embed
            </button>
          </div>
        {:else}
          <div class="p-6 rounded-xl text-center"
               style="background: {$colorStore.primary}08; border: 1px dashed {$colorStore.primary}20;">
            <i class="fa-solid fa-pen-to-square" style="color: {$colorStore.muted}; font-size: 48px; opacity: 0.3;"></i>
            <p class="mt-4" style="color: {$colorStore.muted}">Click "Edit Embed" to customize this panel</p>
          </div>
        {/if}
      </div>
    {/if}
  </div>
{:else}
  <div class="text-center py-24 rounded-xl"
       style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15); border: 1px dashed {$colorStore.primary}20;">
    <i class="fa-solid fa-hand-pointer" style="color: {$colorStore.muted}; font-size: 64px; opacity: 0.2;"></i>
    <p class="mt-6 text-lg font-medium" style="color: {$colorStore.text}">Select a panel above</p>
    <p class="text-sm mt-2" style="color: {$colorStore.muted}">or create a new one to get started</p>
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
