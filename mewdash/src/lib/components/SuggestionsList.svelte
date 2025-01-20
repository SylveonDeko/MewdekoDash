<script lang="ts">
  import { fade, slide } from "svelte/transition";
  import { type SuggestionsModel, SuggestionState } from "$lib/types/models.ts";
  import { Edit2, MessageCircle, MessageSquare, ThumbsUp, Trash2 } from "lucide-svelte";
  import { api } from "$lib/api.ts";
  import { currentGuild } from "$lib/stores/currentGuild.ts";

  export let suggestions: SuggestionsModel[] = [];
  export let colors: any;
  export let showNotificationMessage: (message: string, type: "success" | "error") => void;
  export let onStatusChange: (suggestion: SuggestionsModel, status: SuggestionState) => void;

  let sortBy: "dateAdded" | "currentState" = "dateAdded";
  let sortDirection: "asc" | "desc" = "desc";
  let expandedSuggestion: number | null = null;

  $: sortedSuggestions = [...suggestions].sort((a, b) => {
    if (sortBy === "dateAdded") {
      const dateA = new Date(a.dateAdded).getTime();
      const dateB = new Date(b.dateAdded).getTime();
      return sortDirection === "asc" ? dateA - dateB : dateB - dateA;
    } else {
      if (a.currentState < b.currentState) return sortDirection === "asc" ? -1 : 1;
      if (a.currentState > b.currentState) return sortDirection === "asc" ? 1 : -1;
      return 0;
    }
  });

  function getStatusString(state: SuggestionState): string {
    return {
      [SuggestionState.Pending]: "Pending",
      [SuggestionState.Accepted]: "Accepted",
      [SuggestionState.Denied]: "Denied",
      [SuggestionState.Considered]: "Considered",
      [SuggestionState.Implemented]: "Implemented"
    }[state] || "Unknown";
  }

  function getStateColor(state: SuggestionState): string {
    const colorMap = {
      [SuggestionState.Pending]: colors.secondary,
      [SuggestionState.Accepted]: "#10B981",
      [SuggestionState.Denied]: colors.accent,
      [SuggestionState.Considered]: colors.primary,
      [SuggestionState.Implemented]: "#8B5CF6"
    };
    return colorMap[state] || colors.muted;
  }

  function toggleSort() {
    sortDirection = sortDirection === "asc" ? "desc" : "asc";
  }

  async function deleteSuggestion(id: number) {
    try {
      if (!$currentGuild?.id) throw new Error("No guild selected");
      await api.deleteSuggestion($currentGuild.id, id);
      suggestions = suggestions.filter(s => s.id !== id);
      showNotificationMessage("Suggestion deleted successfully", "success");
    } catch (error) {
      showNotificationMessage(
        "Failed to delete suggestion: " + (error.message || "Unknown error"),
        "error"
      );
    }
  }

  function getEmoteCounts(suggestion: SuggestionsModel): { emoji: string; count: number }[] {
    return [
      { emoji: "👍", count: suggestion.emoteCount1 },
      { emoji: "👎", count: suggestion.emoteCount2 }
    ];
  }

  function formatDate(date: string): string {
    return new Date(date).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
</script>

<div class="space-y-6">
  <!-- Sort Controls -->
  <div
    class="backdrop-blur-sm rounded-xl border p-4 flex flex-wrap gap-4"
    style="background: linear-gradient(135deg, {colors.gradientStart}10, {colors.gradientMid}15);
           border-color: {colors.primary}30;"
  >
    <select
      bind:value={sortBy}
      class="bg-gray-800 rounded-lg px-4 py-2 border transition-colors duration-200"
      style="border-color: {colors.primary}30;
             color: {colors.text};"
    >
      <option value="dateAdded">Date Added</option>
      <option value="currentState">Status</option>
    </select>

    <button
      class="px-4 py-2 rounded-lg flex items-center gap-2 transition-colors duration-200"
      style="background: {colors.primary}20;
             color: {colors.text};"
      on:click={toggleSort}
    >
      <span>{sortDirection === "asc" ? "↑" : "↓"}</span>
      <span>{sortDirection === "asc" ? "Ascending" : "Descending"}</span>
    </button>
  </div>

  <!-- Suggestions List -->
  {#if suggestions.length === 0}
    <div
      class="text-center py-12 backdrop-blur-sm rounded-xl border"
      style="background: linear-gradient(135deg, {colors.gradientStart}10, {colors.gradientMid}15);
             border-color: {colors.primary}30;"
      transition:fade
    >
      <MessageCircle
        class="w-16 h-16 mx-auto mb-4"
        style="color: {colors.muted}"
      />
      <p class="text-xl" style="color: {colors.text}">No suggestions found</p>
      <p class="mt-2" style="color: {colors.muted}">
        Suggestions will appear here once users start making them
      </p>
    </div>
  {:else}
    {#each sortedSuggestions as suggestion (suggestion.id)}
      <div
        class="backdrop-blur-sm rounded-xl border transition-all duration-200"
        style="background: linear-gradient(135deg, {colors.gradientStart}10, {colors.gradientMid}15);
               border-color: {colors.primary}30;"
        transition:slide
      >
        <div class="p-4">
          <!-- Suggestion Header -->
          <div class="flex items-start justify-between gap-4 mb-4">
            <div class="flex items-center gap-3">
              <img
                src={suggestion.user?.avatarUrl || "/default-avatar.png"}
                alt=""
                class="w-10 h-10 rounded-full"
                style="border: 2px solid {colors.primary}30;"
              />
              <div>
                <div class="flex items-center gap-2">
                  <span class="font-medium" style="color: {colors.text}">
                    {suggestion.user?.username || "Unknown User"}
                  </span>
                  <span
                    class="px-2 py-1 text-xs rounded-full"
                    style="background: {getStateColor(suggestion.currentState)}20;
                           color: {getStateColor(suggestion.currentState)};"
                  >
                    {getStatusString(suggestion.currentState)}
                  </span>
                </div>
                <span class="text-sm" style="color: {colors.muted}">
                  {formatDate(suggestion.dateAdded)}
                </span>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="flex gap-2">
              <button
                class="p-2 rounded-lg transition-colors duration-200"
                style="background: {colors.accent}20;
                       color: {colors.accent};"
                on:click={() => deleteSuggestion(suggestion.id)}
              >
                <Trash2 class="w-5 h-5" />
              </button>

              {#if suggestion.currentState !== SuggestionState.Accepted}
                <button
                  class="p-2 rounded-lg transition-colors duration-200"
                  style="background: #10B98120;
                         color: #10B981;"
                  on:click={() => onStatusChange(suggestion, SuggestionState.Accepted)}
                >
                  <ThumbsUp class="w-5 h-5" />
                </button>
              {/if}

              {#if suggestion.currentState !== SuggestionState.Denied}
                <button
                  class="p-2 rounded-lg transition-colors duration-200"
                  style="background: {colors.accent}20;
                         color: {colors.accent};"
                  on:click={() => onStatusChange(suggestion, SuggestionState.Denied)}
                >
                  <ThumbsUp class="w-5 h-5 transform rotate-180" />
                </button>
              {/if}

              {#if suggestion.currentState !== SuggestionState.Considered}
                <button
                  class="p-2 rounded-lg transition-colors duration-200"
                  style="background: {colors.primary}20;
                         color: {colors.primary};"
                  on:click={() => onStatusChange(suggestion, SuggestionState.Considered)}
                >
                  <MessageSquare class="w-5 h-5" />
                </button>
              {/if}

              {#if suggestion.currentState !== SuggestionState.Implemented}
                <button
                  class="p-2 rounded-lg transition-colors duration-200"
                  style="background: #8B5CF620;
                         color: #8B5CF6;"
                  on:click={() => onStatusChange(suggestion, SuggestionState.Implemented)}
                >
                  <Edit2 class="w-5 h-5" />
                </button>
              {/if}
            </div>
          </div>

          <!-- Suggestion Content -->
          <div
            class="p-4 rounded-lg"
            style="background: {colors.primary}10;"
          >
            <p style="color: {colors.text}">
              {suggestion.suggestion}
            </p>
          </div>

          <!-- Suggestion Stats -->
          <div class="mt-4 flex gap-4">
            {#each getEmoteCounts(suggestion) as {emoji, count}}
              <div
                class="px-3 py-1 rounded-lg flex items-center gap-2"
                style="background: {colors.primary}10;"
              >
                <span>{emoji}</span>
                <span style="color: {colors.muted}">{count}</span>
              </div>
            {/each}
          </div>
        </div>
      </div>
    {/each}
  {/if}
</div>

<style lang="postcss">
    select {
        -webkit-appearance: none;
        -moz-appearance: none;
        appearance: none;
        background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e");
        background-position: right 0.5rem center;
        background-repeat: no-repeat;
        background-size: 1.5em 1.5em;
        padding-right: 2.5rem;
    }

    button {
        @apply focus:outline-none focus:ring-2 focus:ring-opacity-50;
    }

    button:focus {
        @apply ring-offset-gray-900;
    }
</style>