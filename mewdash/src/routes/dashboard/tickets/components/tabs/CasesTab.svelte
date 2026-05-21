<!-- components/tabs/CasesTab.svelte -->
<script lang="ts">
  import { colorStore } from "$lib/stores/colorStore";
  import { ticketApi } from "$lib/api/index.ts";
  import { currentGuild } from "$lib/stores/currentGuild";

  interface Props {
    cases: any[];
    selectedCase: any;
    showCaseCreator: boolean;
    newCase: any;
    allTickets: any[];
    saving: boolean;
    createCase: () => Promise<void>;
    closeCase: (caseId: number, archiveTickets: boolean) => Promise<void>;
    reopenCase: (caseId: number) => Promise<void>;
    linkTicketsToCase: (caseId: number, ticketIds: number[]) => Promise<void>;
    unlinkTickets: (ticketIds: number[]) => Promise<void>;
    showConfirm: (title: string, message: string, action: () => void, variant?: "danger" | "warning" | "info") => void;
    fetchAllData: () => Promise<void>;
  }

  let {
    cases,
    selectedCase = $bindable(),
    showCaseCreator = $bindable(),
    newCase = $bindable(),
    allTickets,
    saving,
    createCase,
    closeCase,
    reopenCase,
    linkTicketsToCase,
    unlinkTickets,
    showConfirm,
    fetchAllData
  }: Props = $props();

  // Ticket linking state (inline, not modal)
  let showTicketLinking: boolean = $state(false);
  let selectedTicketsForLinking: number[] = $state([]);

  // Multi-select for creating case with tickets
  let selectedTicketsForNewCase: number[] = $state([]);

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString();
  }

  function formatDateTime(dateStr: string) {
    return new Date(dateStr).toLocaleString();
  }

  // Get unlinked tickets (not in any case)
  let unlinkedTickets = $derived(allTickets.filter(t => !t.caseId));

  // Get tickets not in the current case
  let availableTicketsForCase = $derived(() => {
    if (!selectedCase) return unlinkedTickets;
    // selectedCase.linkedTickets might be a number (count) or array, handle both
    const linkedIds = Array.isArray(selectedCase.linkedTickets)
      ? selectedCase.linkedTickets.map((t: any) => t.id)
      : [];
    return allTickets.filter(t => !linkedIds.includes(t.id) && !t.caseId);
  });

  function toggleTicketSelection(ticketId: number, isForNewCase: boolean = false) {
    if (isForNewCase) {
      if (selectedTicketsForNewCase.includes(ticketId)) {
        selectedTicketsForNewCase = selectedTicketsForNewCase.filter(id => id !== ticketId);
      } else {
        selectedTicketsForNewCase = [...selectedTicketsForNewCase, ticketId];
      }
    } else {
      if (selectedTicketsForLinking.includes(ticketId)) {
        selectedTicketsForLinking = selectedTicketsForLinking.filter(id => id !== ticketId);
      } else {
        selectedTicketsForLinking = [...selectedTicketsForLinking, ticketId];
      }
    }
  }

  async function handleCreateCase() {
    await createCase();

    // Link tickets if any were selected
    if (selectedTicketsForNewCase.length > 0 && cases.length > 0) {
      const newlyCreatedCase = cases[0]; // Most recent case
      await linkTicketsToCase(newlyCreatedCase.id, selectedTicketsForNewCase);
    }

    selectedTicketsForNewCase = [];
  }

  async function handleLinkTickets() {
    if (selectedCase && selectedTicketsForLinking.length > 0) {
      await linkTicketsToCase(selectedCase.id, selectedTicketsForLinking);
      selectedTicketsForLinking = [];
      showTicketLinking = false;
      await loadCaseDetails(selectedCase.id);
    }
  }

  async function handleUnlinkTicket(ticketId: number) {
    await unlinkTickets([ticketId]);
    if (selectedCase) {
      await loadCaseDetails(selectedCase.id);
    }
  }

  async function loadCaseDetails(caseId: number) {
    if (!$currentGuild?.id) return;
    try {
      selectedCase = await ticketApi.getTicketCase($currentGuild.id, caseId);
    } catch (err) {
      console.error("Failed to load case details:", err);
    }
  }
</script>

<!-- Horizontal Case Selector -->
<div class="mb-6">
  <div class="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide">
    {#each cases as ticketCase}
      {@const isClosed = !!ticketCase.closedAt}
      <button
        class="flex-shrink-0 px-4 py-3 rounded-xl transition-all hover:opacity-80 min-w-[200px]"
        style="background: {selectedCase?.id === ticketCase.id && !showCaseCreator ? $colorStore.primary + '20' : $colorStore.primary + '08'};
               border: 2px solid {selectedCase?.id === ticketCase.id && !showCaseCreator ? $colorStore.primary + '40' : $colorStore.primary + '15'};"
        onclick={async () => {
          showCaseCreator = false;
          await loadCaseDetails(ticketCase.id);
        }}
      >
        <div class="text-left">
          <p class="font-medium text-sm truncate" style="color: {$colorStore.text}">
            {ticketCase.title}
          </p>
          <p class="text-xs mt-1" style="color: {$colorStore.muted}">
            #{ticketCase.id} • {ticketCase.linkedTickets || 0} tickets
          </p>
          <span class="inline-block mt-2 text-xs px-2 py-1 rounded"
                style="background: {isClosed ? '#6b7280' : '#10b981'}20; color: {isClosed ? '#6b7280' : '#10b981'};">
            {isClosed ? 'Closed' : 'Open'}
          </span>
        </div>
      </button>
    {/each}

    <button
      class="flex-shrink-0 px-4 py-3 rounded-xl transition-all hover:opacity-80 min-w-[120px]"
      onclick={() => {
        showCaseCreator = !showCaseCreator;
        if (showCaseCreator) {
          selectedCase = null;
          selectedTicketsForNewCase = [];
        }
      }}
      style="background: {showCaseCreator ? $colorStore.secondary + '20' : $colorStore.primary + '08'};
             border: 2px {showCaseCreator ? 'solid' : 'dashed'};
             border-color: {showCaseCreator ? $colorStore.secondary + '40' : $colorStore.primary + '30'};
             color: {showCaseCreator ? $colorStore.secondary : $colorStore.primary};"
    >
      <i class="fa-solid {showCaseCreator ? 'fa-xmark' : 'fa-plus'}"></i>
      <span class="ml-2">{showCaseCreator ? 'Cancel' : 'New Case'}</span>
    </button>
  </div>
</div>

{#if showCaseCreator}
  <!-- Inline Case Creator -->
  <div class="space-y-6">
    <h3 class="text-xl font-bold" style="color: {$colorStore.text}">Create New Case</h3>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Case Details -->
      <div class="space-y-4">
        <div>
          <label for="f-CasesTab-label-179" class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">
            Title <span style="color: #ef4444;">*</span>
          </label>
          <input id="f-CasesTab-label-179"
            type="text"
            bind:value={newCase.title}
            class="w-full px-3 py-2 rounded-lg border"
            placeholder="Spam Bot Investigation"
            style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
          />
        </div>

        <div>
          <label for="f-CasesTab-description-192" class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">
            Description
          </label>
          <textarea id="f-CasesTab-description-192"
            bind:value={newCase.description}
            class="w-full px-3 py-2 rounded-lg border resize-none"
            placeholder="Describe the case..."
            rows="4"
            style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
          ></textarea>
        </div>
      </div>

      <!-- Ticket Linking -->
      <div>
        <span class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">
          Link Tickets (Optional)
        </span>
        <div class="p-4 rounded-lg border max-h-[300px] overflow-y-auto" role="group" aria-label="Link Tickets"
             style="background: {$colorStore.primary}05; border-color: {$colorStore.primary}20;">
          {#if unlinkedTickets.length === 0}
            <p class="text-sm text-center py-8" style="color: {$colorStore.muted}">
              No unlinked tickets available
            </p>
          {:else}
            <div class="space-y-2">
              {#each unlinkedTickets as ticket}
                <label
                  class="flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all hover:opacity-80"
                  style="background: {selectedTicketsForNewCase.includes(ticket.id) ? $colorStore.primary + '15' : $colorStore.primary + '08'};
                         border: 1px solid {selectedTicketsForNewCase.includes(ticket.id) ? $colorStore.primary + '40' : 'transparent'};"
                >
                  <input
                    type="checkbox"
                    checked={selectedTicketsForNewCase.includes(ticket.id)}
                    onchange={() => toggleTicketSelection(ticket.id, true)}
                    class="rounded"
                    style="accent-color: {$colorStore.primary};"
                  />
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-medium truncate" style="color: {$colorStore.text}">
                      #{ticket.id} - {ticket.channelName}
                    </p>
                    <p class="text-xs truncate" style="color: {$colorStore.muted}">
                      {ticket.creatorName} • {formatDate(ticket.createdAt)}
                    </p>
                  </div>
                </label>
              {/each}
            </div>
          {/if}
        </div>
        {#if selectedTicketsForNewCase.length > 0}
          <p class="text-xs mt-2" style="color: {$colorStore.primary}">
            {selectedTicketsForNewCase.length} ticket{selectedTicketsForNewCase.length !== 1 ? 's' : ''} selected
          </p>
        {/if}
      </div>
    </div>

    <div class="flex justify-end gap-3 pt-4 border-t" style="border-color: {$colorStore.primary}20;">
      <button
        class="px-4 py-3 rounded-xl font-medium min-h-[44px]"
        style="background: {$colorStore.muted}20; color: {$colorStore.muted};"
        onclick={() => {
          showCaseCreator = false;
          selectedTicketsForNewCase = [];
        }}
      >
        Cancel
      </button>
      <button
        class="px-4 py-3 rounded-xl font-medium min-h-[44px] flex items-center gap-2"
        style="background: {$colorStore.primary}20; color: {$colorStore.primary}; border: 1px solid {$colorStore.primary}30;"
        disabled={saving || !newCase.title}
        onclick={handleCreateCase}
      >
        {#if saving}
          <i class="fa-solid fa-spinner fa-spin"></i>
        {:else}
          <i class="fa-solid fa-plus"></i>
        {/if}
        Create Case
      </button>
    </div>
  </div>
{:else if selectedCase}
  <!-- Case Details View -->
  {@const isClosed = !!selectedCase.closedAt}
  <div class="space-y-6">
    <!-- Case Header -->
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div>
        <h3 class="text-xl font-bold" style="color: {$colorStore.text}">
          {selectedCase.title}
        </h3>
        <p class="text-sm mt-1" style="color: {$colorStore.muted}">
          Case #{selectedCase.id} • Created by {selectedCase.createdByName} on {formatDateTime(selectedCase.createdAt)}
        </p>
      </div>
      <div class="flex items-center gap-2 w-full sm:w-auto">
        {#if isClosed}
          <button
            class="flex-1 sm:flex-none px-3 py-2 rounded-lg transition-all hover:scale-[1.02] text-sm font-medium min-h-[44px]"
            style="background: #10b98120; color: #10b981; border: 1px solid #10b98130;"
            onclick={() => reopenCase(selectedCase.id)}
          >
            <i class="fa-solid fa-folder-open"></i>
            <span class="ml-1">Reopen</span>
          </button>
        {:else}
          <button
            class="flex-1 sm:flex-none px-3 py-2 rounded-lg transition-all hover:scale-[1.02] text-sm font-medium min-h-[44px]"
            style="background: #f59e0b20; color: #f59e0b; border: 1px solid #f59e0b30;"
            onclick={() => showConfirm(
              "Close Case",
              "Close this case? Linked tickets will remain open.",
              () => closeCase(selectedCase.id, false),
              "warning"
            )}
          >
            <i class="fa-solid fa-folder-closed"></i>
            <span class="ml-1">Close</span>
          </button>
        {/if}
      </div>
    </div>

    <!-- Case Description -->
    {#if selectedCase.description}
      <div class="p-4 rounded-xl"
           style="background: {$colorStore.primary}10; border: 1px solid {$colorStore.primary}20;">
        <h4 class="font-semibold mb-2 text-sm" style="color: {$colorStore.text}">Description</h4>
        <p class="text-sm whitespace-pre-wrap" style="color: {$colorStore.muted}">{selectedCase.description}</p>
      </div>
    {/if}

    <!-- Linked Tickets Section -->
    <div class="space-y-4">
      <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h4 class="font-semibold flex items-center gap-2" style="color: {$colorStore.text}">
            <i class="fa-solid fa-link" style="color: {$colorStore.secondary};"></i>
            Linked Tickets
            ({Array.isArray(selectedCase.linkedTickets) ? selectedCase.linkedTickets.length : (selectedCase.linkedTickets || 0)}
            )
          </h4>
          <p class="text-xs mt-1" style="color: {$colorStore.muted}">
            Tickets associated with this case
          </p>
        </div>
        <button
          class="px-3 py-2 rounded-lg text-sm font-medium transition-all hover:opacity-80 min-h-[44px]"
          style="background: {showTicketLinking ? $colorStore.muted + '20' : $colorStore.primary + '20'};
                 color: {showTicketLinking ? $colorStore.muted : $colorStore.primary};
                 border: 1px solid {showTicketLinking ? $colorStore.muted + '30' : $colorStore.primary + '30'};"
          disabled={!showTicketLinking && availableTicketsForCase().length === 0}
          onclick={() => {
            showTicketLinking = !showTicketLinking;
            if (!showTicketLinking) {
              selectedTicketsForLinking = [];
            }
          }}
        >
          <i class="fa-solid {showTicketLinking ? 'fa-xmark' : 'fa-plus'}"></i>
          <span class="ml-1">{showTicketLinking ? 'Cancel' : 'Link Tickets'}</span>
        </button>
      </div>

      <!-- Inline Ticket Linking UI -->
      {#if showTicketLinking}
        <div class="p-4 rounded-xl border-2"
             style="background: {$colorStore.secondary}10; border-color: {$colorStore.secondary}30;">
          <h5 class="font-semibold mb-4" style="color: {$colorStore.text}">Select Tickets to Link</h5>
          <div class="p-4 rounded-lg border max-h-[400px] overflow-y-auto"
               style="background: {$colorStore.primary}05; border-color: {$colorStore.primary}20;">
            {#if availableTicketsForCase().length === 0}
              <p class="text-sm text-center py-8" style="color: {$colorStore.muted}">
                No available tickets to link
              </p>
            {:else}
              <div class="space-y-2">
                {#each availableTicketsForCase() as ticket}
                  {@const ticketIsClosed = !!ticket.closedAt}
                  {@const ticketIsArchived = ticket.isArchived}
                  <label
                    class="flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-all hover:opacity-80"
                    style="background: {selectedTicketsForLinking.includes(ticket.id) ? $colorStore.primary + '15' : $colorStore.primary + '08'};
                           border: 1px solid {selectedTicketsForLinking.includes(ticket.id) ? $colorStore.primary + '40' : 'transparent'};"
                  >
                    <input
                      type="checkbox"
                      checked={selectedTicketsForLinking.includes(ticket.id)}
                      onchange={() => toggleTicketSelection(ticket.id, false)}
                      class="rounded mt-1"
                      style="accent-color: {$colorStore.primary};"
                    />
                    <div class="flex-1 min-w-0">
                      <p class="text-sm font-medium truncate" style="color: {$colorStore.text}">
                        #{ticket.id} - {ticket.channelName}
                      </p>
                      <p class="text-xs truncate" style="color: {$colorStore.muted}">
                        {ticket.creatorName}
                        {#if ticket.buttonLabel || ticket.optionLabel}
                          • {ticket.buttonLabel || ticket.optionLabel}
                        {/if}
                        • {formatDate(ticket.createdAt)}
                      </p>
                      <div class="flex flex-wrap gap-1 mt-1">
                        {#if ticketIsArchived}
                          <span class="text-xs px-2 py-0.5 rounded" style="background: #6b728020; color: #6b7280;">
                            Archived
                          </span>
                        {/if}
                        {#if ticketIsClosed}
                          <span class="text-xs px-2 py-0.5 rounded" style="background: #ef444420; color: #ef4444;">
                            Closed
                          </span>
                        {/if}
                      </div>
                    </div>
                  </label>
                {/each}
              </div>
            {/if}
          </div>
          {#if selectedTicketsForLinking.length > 0}
            <p class="text-xs mt-2" style="color: {$colorStore.primary}">
              {selectedTicketsForLinking.length} ticket{selectedTicketsForLinking.length !== 1 ? 's' : ''} selected
            </p>
          {/if}

          <div class="flex justify-end gap-3 mt-4">
            <button
              class="px-4 py-3 rounded-xl font-medium min-h-[44px]"
              style="background: {$colorStore.muted}20; color: {$colorStore.muted};"
              onclick={() => {
                showTicketLinking = false;
                selectedTicketsForLinking = [];
              }}
            >
              Cancel
            </button>
            <button
              class="px-4 py-3 rounded-xl font-medium min-h-[44px] flex items-center gap-2"
              style="background: {$colorStore.primary}20; color: {$colorStore.primary}; border: 1px solid {$colorStore.primary}30;"
              disabled={selectedTicketsForLinking.length === 0}
              onclick={handleLinkTickets}
            >
              <i class="fa-solid fa-link"></i>
              Link {selectedTicketsForLinking.length || ''} Ticket{selectedTicketsForLinking.length !== 1 ? 's' : ''}
            </button>
          </div>
        </div>
      {/if}

      {#if Array.isArray(selectedCase.linkedTickets) && selectedCase.linkedTickets.length > 0}
        <div class="space-y-2">
          {#each selectedCase.linkedTickets as ticket}
            {@const isArchived = ticket.isArchived}
            {@const isClosed = !!ticket.closedAt}
            <div class="p-4 rounded-xl transition-all"
                 style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15);
                        border: 1px solid {$colorStore.primary}20;">
              <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div class="flex-1 min-w-0">
                  <p class="font-medium text-sm truncate" style="color: {$colorStore.text}">
                    #{ticket.id} - {ticket.channelName}
                  </p>
                  <p class="text-xs mt-1 truncate" style="color: {$colorStore.muted}">
                    Created by {ticket.creatorName} • {formatDate(ticket.createdAt)}
                  </p>
                  <div class="flex flex-wrap gap-2 mt-2">
                    {#if isArchived}
                      <span class="text-xs px-2 py-1 rounded" style="background: #6b728020; color: #6b7280;">
                        <i class="fa-solid fa-box-archive"></i> Archived
                      </span>
                    {/if}
                    {#if isClosed}
                      <span class="text-xs px-2 py-1 rounded" style="background: #ef444420; color: #ef4444;">
                        <i class="fa-solid fa-lock"></i> Closed
                      </span>
                    {/if}
                  </div>
                </div>
                <button
                  class="px-3 py-2 rounded-lg text-sm transition-all hover:opacity-80 min-h-[44px]"
                  style="background: #ef444420; color: #ef4444; border: 1px solid #ef444430;"
                  onclick={() => showConfirm(
                    "Unlink Ticket",
                    `Unlink ticket #${ticket.id} from this case?`,
                    () => handleUnlinkTicket(ticket.id),
                    "warning"
                  )}
                >
                  <i class="fa-solid fa-link-slash"></i>
                  <span class="ml-1 hidden sm:inline">Unlink</span>
                </button>
              </div>
            </div>
          {/each}
        </div>
      {:else if !showTicketLinking}
        <div class="text-center py-12 rounded-xl"
             style="background: {$colorStore.primary}08; border: 1px dashed {$colorStore.primary}20;">
          <i class="fa-solid fa-link-slash" style="color: {$colorStore.muted}; font-size: 48px; opacity: 0.3;"></i>
          <p class="mt-4" style="color: {$colorStore.muted}">No tickets linked to this case yet</p>
          {#if availableTicketsForCase().length > 0}
            <button
              class="mt-4 px-4 py-2 rounded-lg text-sm font-medium min-h-[44px]"
              style="background: {$colorStore.primary}20; color: {$colorStore.primary};"
              onclick={() => showTicketLinking = true}
            >
              <i class="fa-solid fa-plus"></i>
              Link Tickets
            </button>
          {/if}
        </div>
      {/if}
    </div>

    <!-- Case Notes Section -->
    {#if Array.isArray(selectedCase.notes) && selectedCase.notes.length > 0}
      <div class="space-y-4">
        <h4 class="font-semibold flex items-center gap-2" style="color: {$colorStore.text}">
          <i class="fa-solid fa-note-sticky" style="color: {$colorStore.accent};"></i>
          Case Notes ({selectedCase.notes.length})
        </h4>
        <div class="space-y-2">
          {#each selectedCase.notes as note}
            <div class="p-3 rounded-lg"
                 style="background: {$colorStore.primary}08; border: 1px solid {$colorStore.primary}15;">
              <p class="text-sm whitespace-pre-wrap" style="color: {$colorStore.text}">{note.content}</p>
              <p class="text-xs mt-2" style="color: {$colorStore.muted}">
                {formatDateTime(note.createdAt)}
              </p>
            </div>
          {/each}
        </div>
      </div>
    {/if}
  </div>
{:else}
  <div class="text-center py-24 rounded-xl"
       style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15); border: 1px dashed {$colorStore.primary}20;">
    <i class="fa-solid fa-hand-pointer" style="color: {$colorStore.muted}; font-size: 64px; opacity: 0.2;"></i>
    <p class="mt-6 text-lg font-medium" style="color: {$colorStore.text}">Select a case above</p>
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
