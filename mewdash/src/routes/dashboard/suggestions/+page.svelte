<!-- routes/dashboard/suggestions/+page.svelte -->
<script lang="ts">


  import { onMount } from "svelte";
  import { clientApi, type GuildEmojiInfo, type Suggestion, suggestionsApi, SuggestionState } from "$lib/api/index.ts";
  import type { PageData } from "./$types";
  import { currentGuild } from "$lib/stores/currentGuild.ts";
  import { fade, fly, slide } from "svelte/transition";
  import { cubicOut } from "svelte/easing";
  import Notification from "$lib/components/ui/Notification.svelte";
  import DashboardPageLayout from "$lib/components/layout/DashboardPageLayout.svelte";
  import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";
  import EmojiPicker from "$lib/components/forms/EmojiPicker.svelte";
  import FullscreenEmbedBuilder from "$lib/components/specialized/FullscreenEmbedBuilder.svelte";
  import { browser } from "$app/environment";
  import { colorStore } from "$lib/stores/colorStore";
  import { goto } from "$app/navigation";
  import { currentInstance } from "$lib/stores/instanceStore.ts";
  import { loadingStore } from "$lib/stores/loadingStore";

  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();

  let currentUser = data.user;

  // States
  let activeTab = $state("suggestions");
  let activeSubTab = $state("general");
  let loading = $state(true);
  let saving = $state(false);
  let error: string | null = $state(null);
  let showNotification = $state(false);
  let notificationMessage = $state("");
  let notificationType: "success" | "error" = $state("success");
  let showInlineConfirm: { [key: number]: SuggestionState | null } = $state({});
  let inlineReasons: { [key: number]: string } = $state({});
  let confirmingStatus: { [key: number]: boolean } = $state({});

  let sortBy: "dateAdded" | "currentState" = $state("dateAdded");
  let sortDirection: "asc" | "desc" = $state("desc");

  // Data
  let suggestions: Suggestion[] = $state([]);
  let channels: Array<{ id: string; name: string }> = $state([]);
  let guildEmojis: GuildEmojiInfo[] = $state([]);


  // Settings - Current values
  let minLength = $state(0);
  let maxLength = $state(2000);
  let suggestionMessage: any = $state({});
  let acceptMessage: any = $state({});
  let denyMessage: any = $state({});
  let considerMessage: any = $state({});
  let implementMessage: any = $state({});
  let acceptChannel: string = $state("");
  let denyChannel: string = $state("");
  let considerChannel: string = $state("");
  let implementChannel: string = $state("");
  let suggestChannel: string = $state("");
  let threadType = $state(0);
  let emoteMode = $state(0); // 0 = reactions, 1 = buttons
  let suggestButtonColor = $state(1); // 1=Blue, 2=Grey, 3=Green, 4=Red
  let emote1Style = $state(1);
  let emote2Style = $state(1);
  let emote3Style = $state(1);
  let emote4Style = $state(1);
  let emote5Style = $state(1);
  let suggestButtonMessage: any = $state({});
  let suggestButtonLabel: string = $state("");
  let suggestButtonEmote: string | string[] | null = $state(null);
  let suggestEmotes: string[] | string | null = $state([]);
  let archiveOnDeny = $state(false);
  let archiveOnAccept = $state(false);
  let archiveOnConsider = $state(false);
  let archiveOnImplement = $state(false);
  let suggestButtonChannel: bigint | null = null;

  // Suggestion-specific placeholders
  const suggestionPlaceholders = [
    {
      category: "Suggestions",
      name: "%suggest.user%",
      description: "The full username of the user who's suggestion got updated"
    },
    {
      category: "Suggestions",
      name: "%suggest.user.id%",
      description: "The Id of the user who's suggestion got updated"
    },
    { category: "Suggestions", name: "%suggest.message%", description: "The original suggestion" },
    { category: "Suggestions", name: "%suggest.number%", description: "The suggestion number that was updated" },
    {
      category: "Suggestions",
      name: "%suggest.user.name%",
      description: "The name of the user who's suggestion got updated"
    },
    { category: "Suggestions", name: "%suggest.user.avatar%", description: "The avatar of the original suggester" },
    {
      category: "Suggestions",
      name: "%suggest.mod.user%",
      description: "The full username of the one who updated the suggestion"
    },
    {
      category: "Suggestions",
      name: "%suggest.mod.avatar%",
      description: "The pfp of the one who updated the suggestion"
    },
    {
      category: "Suggestions",
      name: "%suggest.mod.name%",
      description: "The name of the person who updated the suggestion"
    },
    { category: "Suggestions", name: "%suggest.mod.message%", description: "The reason the suggestion was updated" }
  ];

  // Original values (fetched from API)
  let originalValues = $state({
    minLength: 0,
    maxLength: 2000,
    suggestionMessage: {} as any,
    acceptMessage: {} as any,
    denyMessage: {} as any,
    considerMessage: {} as any,
    implementMessage: {} as any,
    acceptChannel: "",
    denyChannel: "",
    considerChannel: "",
    implementChannel: "",
    suggestChannel: "",
    threadType: 0,
    emoteMode: 0,
    suggestButtonColor: 1,
    emote1Style: 1,
    emote2Style: 1,
    emote3Style: 1,
    emote4Style: 1,
    emote5Style: 1,
    suggestButtonMessage: {} as any,
    suggestButtonLabel: "",
    suggestButtonEmote: null as string | string[] | null,
    suggestEmotes: [] as string[] | string | null,
    archiveOnDeny: false,
    archiveOnAccept: false,
    archiveOnConsider: false,
    archiveOnImplement: false,
    suggestButtonChannel: null as bigint | null
  });

  // Computed values
  let hasChanges = $derived.by(() => {
    // Helper to compare arrays
    const arraysEqual = (a: any, b: any) => {
      if (!Array.isArray(a) || !Array.isArray(b)) return a === b;
      if (a.length !== b.length) return false;
      return a.every((val, idx) => val === b[idx]);
    };

    // Helper to compare objects
    const objectsEqual = (a: any, b: any) => {
      if (typeof a !== "object" || typeof b !== "object") return a === b;
      return JSON.stringify(a) === JSON.stringify(b);
    };

    return minLength !== originalValues.minLength ||
      maxLength !== originalValues.maxLength ||
      !objectsEqual(suggestionMessage, originalValues.suggestionMessage) ||
      !objectsEqual(acceptMessage, originalValues.acceptMessage) ||
      !objectsEqual(denyMessage, originalValues.denyMessage) ||
      !objectsEqual(considerMessage, originalValues.considerMessage) ||
      !objectsEqual(implementMessage, originalValues.implementMessage) ||
      acceptChannel !== originalValues.acceptChannel ||
      denyChannel !== originalValues.denyChannel ||
      considerChannel !== originalValues.considerChannel ||
      implementChannel !== originalValues.implementChannel ||
      suggestChannel !== originalValues.suggestChannel ||
      threadType !== originalValues.threadType ||
      emoteMode !== originalValues.emoteMode ||
      suggestButtonColor !== originalValues.suggestButtonColor ||
      emote1Style !== originalValues.emote1Style ||
      emote2Style !== originalValues.emote2Style ||
      emote3Style !== originalValues.emote3Style ||
      emote4Style !== originalValues.emote4Style ||
      emote5Style !== originalValues.emote5Style ||
      suggestButtonMessage !== originalValues.suggestButtonMessage ||
      suggestButtonLabel !== originalValues.suggestButtonLabel ||
      suggestButtonEmote !== originalValues.suggestButtonEmote ||
      !arraysEqual(suggestEmotes, originalValues.suggestEmotes) ||
      archiveOnDeny !== originalValues.archiveOnDeny ||
      archiveOnAccept !== originalValues.archiveOnAccept ||
      archiveOnConsider !== originalValues.archiveOnConsider ||
      archiveOnImplement !== originalValues.archiveOnImplement ||
      suggestButtonChannel !== originalValues.suggestButtonChannel;
  });
  let sortedSuggestions = $derived.by(() => {
    // Use slice() instead of spread operator to avoid hydration issues
    const suggestionsCopy = Array.isArray(suggestions) ? suggestions.slice() : [];
    return suggestionsCopy.sort((a, b) => {
      if (sortBy === "dateAdded") {
        const dateA = a.dateAdded ? new Date(a.dateAdded).getTime() : 0;
        const dateB = b.dateAdded ? new Date(b.dateAdded).getTime() : 0;
        return sortDirection === "asc" ? dateA - dateB : dateB - dateA;
      } else {
        if (a.currentState < b.currentState) return sortDirection === "asc" ? -1 : 1;
        if (a.currentState > b.currentState) return sortDirection === "asc" ? 1 : -1;
        return 0;
      }
    });
  });


  // Helper Functions
  function showNotificationMessage(message: string, type: "success" | "error" = "success") {
    notificationMessage = message;
    notificationType = type;
    showNotification = true;
    setTimeout(() => showNotification = false, 3000);
  }

  function getStatusString(state: SuggestionState): string {
    return {
      [SuggestionState.Suggested]: "Pending",
      [SuggestionState.Accepted]: "Accepted",
      [SuggestionState.Denied]: "Denied",
      [SuggestionState.Considered]: "Considered",
      [SuggestionState.Implemented]: "Implemented"
    }[state] || "Unknown";
  }

  function getStateColor(state: SuggestionState): string {
    return {
      [SuggestionState.Suggested]: $colorStore.primary,
      [SuggestionState.Accepted]: "#22c55e",
      [SuggestionState.Denied]: "#ef4444",
      [SuggestionState.Considered]: $colorStore.secondary,
      [SuggestionState.Implemented]: $colorStore.accent
    }[state] || $colorStore.muted;
  }

  function toggleSortDirection() {
    sortDirection = sortDirection === "asc" ? "desc" : "asc";
  }

  // Inline Confirmation Functions
  function initiateStatusChange(suggestion: Suggestion, status: SuggestionState) {
    // Use inline confirmation for all devices
    showInlineConfirm[suggestion.id] = status;
    inlineReasons[suggestion.id] = "";
  }

  function cancelInlineConfirm(suggestionId: number) {
    delete showInlineConfirm[suggestionId];
    delete inlineReasons[suggestionId];
    delete confirmingStatus[suggestionId];
    showInlineConfirm = { ...showInlineConfirm };
    inlineReasons = { ...inlineReasons };
    confirmingStatus = { ...confirmingStatus };
  }

  async function confirmInlineStatusChange(suggestion: Suggestion) {
    const status = showInlineConfirm[suggestion.id];
    const reason = inlineReasons[suggestion.id] || "";

    if (status !== null && status !== undefined && $currentGuild?.id && currentUser?.id) {
      confirmingStatus[suggestion.id] = true;
      try {
        await suggestionsApi.updateSuggestionStatus($currentGuild.id, suggestion.suggestionId, {
          state: status,
          reason: reason || null,
          userId: currentUser.id
        });

        await fetchSuggestions();
        showNotificationMessage("Status updated successfully");
        cancelInlineConfirm(suggestion.id);
      } catch (err) {
        showNotificationMessage("Failed to update status", "error");
        confirmingStatus[suggestion.id] = false;
      }
    }
  }

  // API Functions
  async function fetchSuggestions() {
    return await loadingStore.wrap("fetch-suggestions", async () => {
      try {
        loading = true;
        error = null;
        if (!$currentGuild?.id) throw new Error("No guild selected");

        let fetched;
        try {
          fetched = await suggestionsApi.getSuggestions($currentGuild.id);
        } catch (err: any) {
          // Handle 404 as empty state, not an error
          if (err?.message?.includes("404") || err?.message?.includes("No suggestions")) {
            suggestions = [];
            loading = false;
            return;
          }
          throw err;
        }

        if (!fetched || fetched.length === 0) {
          suggestions = [];
          return;
        }

        // User data is now already included in the response from the backend
        suggestions = fetched;
      } catch (err) {
        error = err instanceof Error ? err.message : "Failed to fetch suggestions";
      } finally {
        loading = false;
      }
    }, "api", "Loading suggestions...");
  }

  async function loadSettings() {
    if (!$currentGuild?.id) return;
    return await loadingStore.wrap("load-settings", async () => {
      try {
        const [
          fetchedMinLength,
          fetchedMaxLength,
          fetchedSuggestionMessage,
          fetchedAcceptMessage,
          fetchedDenyMessage,
          fetchedConsiderMessage,
          fetchedImplementMessage,
          fetchedAcceptChannel,
          fetchedDenyChannel,
          fetchedConsiderChannel,
          fetchedImplementChannel,
          fetchedSuggestChannel,
          fetchedThreadType,
          fetchedEmoteMode,
          fetchedButtonColor,
          fetchedEmote1Style,
          fetchedEmote2Style,
          fetchedEmote3Style,
          fetchedEmote4Style,
          fetchedEmote5Style,
          fetchedArchiveOnDeny,
          fetchedArchiveOnAccept,
          fetchedArchiveOnConsider,
          fetchedArchiveOnImplement,
          fetchedSuggestEmotes,
          fetchedButtonMessage,
          fetchedButtonLabel,
          fetchedButtonEmote,
          fetchedButtonChannel
        ] = await Promise.all([
          suggestionsApi.getMinLength($currentGuild.id),
          suggestionsApi.getMaxLength($currentGuild.id),
          suggestionsApi.getSuggestionMessage($currentGuild.id),
          suggestionsApi.getAcceptMessage($currentGuild.id),
          suggestionsApi.getDenyMessage($currentGuild.id),
          suggestionsApi.getConsiderMessage($currentGuild.id),
          suggestionsApi.getImplementMessage($currentGuild.id),
          suggestionsApi.getAcceptChannel($currentGuild.id),
          suggestionsApi.getDenyChannel($currentGuild.id),
          suggestionsApi.getConsiderChannel($currentGuild.id),
          suggestionsApi.getImplementChannel($currentGuild.id),
          suggestionsApi.getSuggestChannel($currentGuild.id),
          suggestionsApi.getSuggestThreadsType($currentGuild.id),
          suggestionsApi.getEmoteMode($currentGuild.id),
          suggestionsApi.getSuggestButtonColor($currentGuild.id),
          suggestionsApi.getEmoteButtonStyle($currentGuild.id, 1),
          suggestionsApi.getEmoteButtonStyle($currentGuild.id, 2),
          suggestionsApi.getEmoteButtonStyle($currentGuild.id, 3),
          suggestionsApi.getEmoteButtonStyle($currentGuild.id, 4),
          suggestionsApi.getEmoteButtonStyle($currentGuild.id, 5),
          suggestionsApi.getArchiveOnDeny($currentGuild.id),
          suggestionsApi.getArchiveOnAccept($currentGuild.id),
          suggestionsApi.getArchiveOnConsider($currentGuild.id),
          suggestionsApi.getArchiveOnImplement($currentGuild.id),
          suggestionsApi.getSuggestEmotes($currentGuild.id),
          suggestionsApi.getSuggestButtonMessage($currentGuild.id),
          suggestionsApi.getSuggestButtonLabel($currentGuild.id),
          suggestionsApi.getSuggestButtonEmote($currentGuild.id),
          suggestionsApi.getSuggestButtonChannel($currentGuild.id)
        ]);

        minLength = fetchedMinLength;
        maxLength = fetchedMaxLength;
        console.log(fetchedMinLength, fetchedMaxLength, fetchedAcceptMessage, fetchedDenyMessage, fetchedArchiveOnConsider);

        // Helper to convert string to embed object
        const stringToEmbed = (str: any) => {
          const text = typeof str === "string" ? str : (str?.data || "");
          if (!text || text === "-") return {};

          // Try to parse as JSON first (for rich embeds)
          try {
            const parsed = JSON.parse(text);
            if (typeof parsed === "object") return parsed;
          } catch {
            // Not JSON, treat as simple text
          }

          return { content: text };
        };

        // Extract string values from API response objects and convert to embed format
        suggestionMessage = fetchedSuggestionMessage;
        acceptMessage = fetchedAcceptMessage;
        denyMessage = fetchedDenyMessage;
        considerMessage = fetchedConsiderMessage;
        implementMessage = fetchedImplementMessage;
        suggestButtonMessage = fetchedButtonMessage;

        acceptChannel = fetchedAcceptChannel?.toString() || "";
        denyChannel = fetchedDenyChannel?.toString() || "";
        considerChannel = fetchedConsiderChannel?.toString() || "";
        implementChannel = fetchedImplementChannel?.toString() || "";
        suggestChannel = fetchedSuggestChannel?.toString() || "";

        // Extract numeric values safely (API might return {data: number} or just number)
        const extractNumber = (val: any, defaultVal: number): number => {
          // Direct number
          if (typeof val === "number") return val;

          // Object with data property
          if (val && typeof val === "object" && typeof val.data === "number") return val.data;

          // Try to parse string representation
          if (typeof val === "string") {
            const parsed = parseInt(val);
            return isNaN(parsed) ? defaultVal : parsed;
          }

          // Default fallback
          return defaultVal;
        };

        threadType = extractNumber(fetchedThreadType, 0);
        emoteMode = extractNumber(fetchedEmoteMode, 0);
        suggestButtonColor = extractNumber(fetchedButtonColor, 1);
        emote1Style = extractNumber(fetchedEmote1Style, 1);
        emote2Style = extractNumber(fetchedEmote2Style, 1);
        emote3Style = extractNumber(fetchedEmote3Style, 1);
        emote4Style = extractNumber(fetchedEmote4Style, 1);
        emote5Style = extractNumber(fetchedEmote5Style, 1);
        archiveOnDeny = fetchedArchiveOnDeny;
        archiveOnAccept = fetchedArchiveOnAccept;
        archiveOnConsider = fetchedArchiveOnConsider;
        archiveOnImplement = fetchedArchiveOnImplement;

        // Handle suggestEmotes - convert comma-separated string to array for EmojiPicker
        const rawEmotes = (fetchedSuggestEmotes as any)?.data || fetchedSuggestEmotes || "";
        // Convert to array if not empty, disabled, or "-"
        if (rawEmotes && rawEmotes !== "disabled" && rawEmotes !== "-") {
          suggestEmotes = String(rawEmotes).split(",").map((e: string) => e.trim()).filter((e: string) => e);
        } else {
          suggestEmotes = [];
        }

        // Handle button message - parse JSON or convert string to embed format
        const buttonMessageAny = fetchedButtonMessage as any;
        if (typeof buttonMessageAny === "string") {
          try {
            suggestButtonMessage = JSON.parse(buttonMessageAny);
          } catch {
            // Legacy string format - convert to embed format
            suggestButtonMessage = { content: buttonMessageAny };
          }
        } else if (buttonMessageAny?.data && typeof buttonMessageAny.data === "string") {
          try {
            suggestButtonMessage = JSON.parse(buttonMessageAny.data);
          } catch {
            suggestButtonMessage = { content: buttonMessageAny.data };
          }
        } else if (typeof buttonMessageAny === "object" && buttonMessageAny !== null) {
          suggestButtonMessage = buttonMessageAny;
        } else {
          suggestButtonMessage = {};
        }

        // Handle button label - should be a simple string, but API might return component structure
        const buttonLabelAny = fetchedButtonLabel as any;
        if (typeof buttonLabelAny === "string") {
          suggestButtonLabel = buttonLabelAny;
        } else if (buttonLabelAny?.data && typeof buttonLabelAny.data === "string") {
          suggestButtonLabel = buttonLabelAny.data;
        } else if (buttonLabelAny?.actionRows?.[0]?.components?.[0]?.label) {
          suggestButtonLabel = String(buttonLabelAny.actionRows[0].components[0].label);
        } else {
          suggestButtonLabel = "";
        }

        // Handle button emote - extract from object if needed
        const rawButtonEmote = (fetchedButtonEmote as any)?.data || fetchedButtonEmote || "";
        // Set to null if empty, disabled, or "-"
        suggestButtonEmote = (rawButtonEmote && rawButtonEmote !== "disabled" && rawButtonEmote !== "-") ? String(rawButtonEmote) : null;

        suggestButtonChannel = fetchedButtonChannel;

        // Store original values for comparison (with deep copies for objects)
        originalValues = {
          minLength,
          maxLength,
          suggestionMessage: JSON.parse(JSON.stringify(suggestionMessage)),
          acceptMessage: JSON.parse(JSON.stringify(acceptMessage)),
          denyMessage: JSON.parse(JSON.stringify(denyMessage)),
          considerMessage: JSON.parse(JSON.stringify(considerMessage)),
          implementMessage: JSON.parse(JSON.stringify(implementMessage)),
          acceptChannel,
          denyChannel,
          considerChannel,
          implementChannel,
          suggestChannel,
          threadType,
          emoteMode,
          suggestButtonColor,
          emote1Style,
          emote2Style,
          emote3Style,
          emote4Style,
          emote5Style,
          suggestButtonMessage: JSON.parse(JSON.stringify(suggestButtonMessage)),
          suggestButtonLabel,
          suggestButtonEmote,
          suggestEmotes: Array.isArray(suggestEmotes) ? [...suggestEmotes] : suggestEmotes,
          archiveOnDeny,
          archiveOnAccept,
          archiveOnConsider,
          archiveOnImplement,
          suggestButtonChannel
        };
      } catch (err) {
        console.error("Error loading settings:", err);
        showNotificationMessage("Failed to load settings", "error");
      }
    }, "api", "Loading settings...");
  }

  async function fetchChannels() {
    try {
      if (!$currentGuild?.id) throw new Error("No guild selected");
      channels = await clientApi.getTextChannels($currentGuild.id);
    } catch (err) {
      showNotificationMessage("Failed to fetch channels", "error");
    }
  }

  async function loadGuildEmojis() {
    try {
      if (!currentUser?.id) throw new Error("User not authenticated");
      guildEmojis = await clientApi.getEmojis(currentUser.id, true);
    } catch (err) {
      console.error("Failed to fetch guild emojis:", err);
    }
  }

  async function saveSettings() {
    if (!$currentGuild?.id || !hasChanges) return;

    saving = true;
    return await loadingStore.wrap("save-settings", async () => {
      try {
        const updatePromises = [];

        // Helper to convert embed object to JSON string for sending
        const embedToString = (embed: any) => {
          if (!embed || Object.keys(embed).length === 0) return null;
          return JSON.stringify(embed);
        };

        // Only save settings that have actually changed
        if (minLength !== originalValues.minLength) {
          updatePromises.push(suggestionsApi.setMinLength($currentGuild.id, minLength));
        }
        if (maxLength !== originalValues.maxLength) {
          updatePromises.push(suggestionsApi.setMaxLength($currentGuild.id, maxLength));
        }
        if (JSON.stringify(suggestionMessage) !== JSON.stringify(originalValues.suggestionMessage)) {
          updatePromises.push(suggestionsApi.setSuggestionMessage($currentGuild.id, embedToString(suggestionMessage)));
        }
        if (JSON.stringify(acceptMessage) !== JSON.stringify(originalValues.acceptMessage)) {
          updatePromises.push(suggestionsApi.setAcceptMessage($currentGuild.id, embedToString(acceptMessage)));
        }
        if (JSON.stringify(denyMessage) !== JSON.stringify(originalValues.denyMessage)) {
          updatePromises.push(suggestionsApi.setDenyMessage($currentGuild.id, embedToString(denyMessage)));
        }
        if (JSON.stringify(considerMessage) !== JSON.stringify(originalValues.considerMessage)) {
          updatePromises.push(suggestionsApi.setConsiderMessage($currentGuild.id, embedToString(considerMessage)));
        }
        if (JSON.stringify(implementMessage) !== JSON.stringify(originalValues.implementMessage)) {
          updatePromises.push(suggestionsApi.setImplementMessage($currentGuild.id, embedToString(implementMessage)));
        }
        if (acceptChannel !== originalValues.acceptChannel) {
          updatePromises.push(suggestionsApi.setAcceptChannel($currentGuild.id, acceptChannel ? BigInt(acceptChannel) : 0n));
        }
        if (denyChannel !== originalValues.denyChannel) {
          updatePromises.push(suggestionsApi.setDenyChannel($currentGuild.id, denyChannel ? BigInt(denyChannel) : 0n));
        }
        if (considerChannel !== originalValues.considerChannel) {
          updatePromises.push(suggestionsApi.setConsiderChannel($currentGuild.id, considerChannel ? BigInt(considerChannel) : 0n));
        }
        if (implementChannel !== originalValues.implementChannel) {
          updatePromises.push(suggestionsApi.setImplementChannel($currentGuild.id, implementChannel ? BigInt(implementChannel) : 0n));
        }
        if (suggestChannel !== originalValues.suggestChannel) {
          updatePromises.push(suggestionsApi.setSuggestChannel($currentGuild.id, suggestChannel ? BigInt(suggestChannel) : 0n));
        }
        if (threadType !== originalValues.threadType) {
          updatePromises.push(suggestionsApi.setSuggestThreadsType($currentGuild.id, threadType));
        }
        if (emoteMode !== originalValues.emoteMode) {
          updatePromises.push(suggestionsApi.setEmoteMode($currentGuild.id, emoteMode));
        }
        if (suggestButtonColor !== originalValues.suggestButtonColor) {
          updatePromises.push(suggestionsApi.setSuggestButtonColor($currentGuild.id, suggestButtonColor));
        }
        if (emote1Style !== originalValues.emote1Style) {
          updatePromises.push(suggestionsApi.setEmoteButtonStyle($currentGuild.id, 1, emote1Style));
        }
        if (emote2Style !== originalValues.emote2Style) {
          updatePromises.push(suggestionsApi.setEmoteButtonStyle($currentGuild.id, 2, emote2Style));
        }
        if (emote3Style !== originalValues.emote3Style) {
          updatePromises.push(suggestionsApi.setEmoteButtonStyle($currentGuild.id, 3, emote3Style));
        }
        if (emote4Style !== originalValues.emote4Style) {
          updatePromises.push(suggestionsApi.setEmoteButtonStyle($currentGuild.id, 4, emote4Style));
        }
        if (emote5Style !== originalValues.emote5Style) {
          updatePromises.push(suggestionsApi.setEmoteButtonStyle($currentGuild.id, 5, emote5Style));
        }
        if (archiveOnDeny !== originalValues.archiveOnDeny) {
          updatePromises.push(suggestionsApi.setArchiveOnDeny($currentGuild.id, archiveOnDeny));
        }
        if (archiveOnAccept !== originalValues.archiveOnAccept) {
          updatePromises.push(suggestionsApi.setArchiveOnAccept($currentGuild.id, archiveOnAccept));
        }
        if (archiveOnConsider !== originalValues.archiveOnConsider) {
          updatePromises.push(suggestionsApi.setArchiveOnConsider($currentGuild.id, archiveOnConsider));
        }
        if (archiveOnImplement !== originalValues.archiveOnImplement) {
          updatePromises.push(suggestionsApi.setArchiveOnImplement($currentGuild.id, archiveOnImplement));
        }

        // Compare arrays properly
        const arraysEqual = (a: any, b: any) => {
          if (!Array.isArray(a) || !Array.isArray(b)) return a === b;
          if (a.length !== b.length) return false;
          return a.every((val, idx) => val === b[idx]);
        };

        if (!arraysEqual(suggestEmotes, originalValues.suggestEmotes)) {
          const emotesString = Array.isArray(suggestEmotes) ? suggestEmotes.join(",") : (suggestEmotes || null);
          updatePromises.push(suggestionsApi.setSuggestEmotes($currentGuild.id, emotesString));
        }
        if (JSON.stringify(suggestButtonMessage) !== JSON.stringify(originalValues.suggestButtonMessage)) {
          const messageToSend = Object.keys(suggestButtonMessage).length > 0 ? JSON.stringify(suggestButtonMessage) : null;
          updatePromises.push(suggestionsApi.setSuggestButtonMessage($currentGuild.id, messageToSend));
        }
        if (suggestButtonLabel !== originalValues.suggestButtonLabel) {
          updatePromises.push(suggestionsApi.setSuggestButtonLabel($currentGuild.id, suggestButtonLabel || null));
        }
        if (suggestButtonEmote !== originalValues.suggestButtonEmote) {
          const emoteValue = Array.isArray(suggestButtonEmote) ? suggestButtonEmote[0] : suggestButtonEmote;
          updatePromises.push(suggestionsApi.setSuggestButtonEmote($currentGuild.id, emoteValue || null));
        }
        if (suggestButtonChannel !== originalValues.suggestButtonChannel) {
          updatePromises.push(suggestionsApi.setSuggestButtonChannel($currentGuild.id, suggestButtonChannel || 0n));
        }

        await Promise.all(updatePromises);

        // Update original values after successful save (with deep copies for objects)
        originalValues = {
          minLength,
          maxLength,
          suggestionMessage: JSON.parse(JSON.stringify(suggestionMessage)),
          acceptMessage: JSON.parse(JSON.stringify(acceptMessage)),
          denyMessage: JSON.parse(JSON.stringify(denyMessage)),
          considerMessage: JSON.parse(JSON.stringify(considerMessage)),
          implementMessage: JSON.parse(JSON.stringify(implementMessage)),
          acceptChannel,
          denyChannel,
          considerChannel,
          implementChannel,
          suggestChannel,
          threadType,
          emoteMode,
          suggestButtonColor,
          emote1Style,
          emote2Style,
          emote3Style,
          emote4Style,
          emote5Style,
          suggestButtonMessage: JSON.parse(JSON.stringify(suggestButtonMessage)),
          suggestButtonLabel,
          suggestButtonEmote,
          suggestEmotes: Array.isArray(suggestEmotes) ? [...suggestEmotes] : suggestEmotes,
          archiveOnDeny,
          archiveOnAccept,
          archiveOnConsider,
          archiveOnImplement,
          suggestButtonChannel
        };

        showNotificationMessage("Settings saved successfully");
      } catch (err) {
        showNotificationMessage("Failed to save settings", "error");
      } finally {
        saving = false;
      }
    }, "operation", "Saving settings...");
  }


  async function deleteSuggestion(id: number) {
    return await loadingStore.wrap("delete-suggestion", async () => {
      try {
        if (!$currentGuild?.id) throw new Error("No guild selected");
        await suggestionsApi.deleteSuggestion($currentGuild.id, BigInt(id));
        await fetchSuggestions();
        showNotificationMessage("Suggestion deleted successfully");
      } catch (err) {
        showNotificationMessage("Failed to delete suggestion", "error");
      }
    }, "operation", "Deleting suggestion...");
  }

  onMount(async () => {
    if (!$currentGuild) await goto("/dashboard");
    if (browser) {
      await Promise.all([
        fetchSuggestions(),
        fetchChannels(),
        loadSettings(),
        loadGuildEmojis()
      ]);
    }
  });

  $effect(() => {
    if ($currentInstance) {
      Promise.all([
        fetchSuggestions(),
        fetchChannels(),
        loadSettings()
      ]);
    }
  });

  $effect(() => {
    if ($currentGuild) {
      Promise.all([
        fetchSuggestions(),
        fetchChannels(),
        loadSettings()
      ]);
    }
  });

</script>


<DashboardPageLayout
  actionButtons={hasChanges ? [
    {
      label: saving ? "Saving..." : "Save Settings",
      icon: "fa-floppy-disk",
      action: saveSettings,
      loading: saving,
      style: `background: linear-gradient(to right, ${$colorStore.primary}, ${$colorStore.secondary}); color: ${$colorStore.text}; box-shadow: 0 0 20px ${$colorStore.primary}20;`
    }
  ] : []}
  bind:activeSubTab
  bind:activeTab
  guildName={$currentGuild?.name || "Dashboard"}
  icon="fa-comment"
  ontabChange={(detail) => {
    if (detail.tabId === 'suggestions') {
      activeSubTab = '';
    } else if (detail.tabId === 'settings' && !activeSubTab) {
      activeSubTab = 'general';
    }
  }}
  subTabs={[
    { id: "general", label: "General", parentTab: "settings" },
    { id: "messages", label: "Messages", parentTab: "settings" },
    { id: "channels", label: "Channels", parentTab: "settings" },
    { id: "archive", label: "Archive", parentTab: "settings" },
    { id: "emotes", label: "Emotes", parentTab: "settings" }
  ]}
  subtitle="Manage and configure server suggestions"
  tabs={[
    { id: "suggestions", label: "Suggestions", icon: "fa-inbox" },
    { id: "settings", label: "Settings", icon: "fa-gear" }
  ]}
  title="Suggestions"
>
  <!-- @migration-task: migrate this slot by hand, `status-messages` is an invalid identifier -->
  <svelte:fragment slot="status-messages">
    {#if showNotification}
      <div class="fixed top-4 right-4 z-50" transition:fade>
        <Notification message={notificationMessage} type={notificationType} />
      </div>
    {/if}
  </svelte:fragment>


  <!-- Main Content -->
  {#if activeTab === 'suggestions'}
    <div class="space-y-6">
      {#if loading}
        <div class=" rounded-xl border p-12 transition-all"
             style="background: {$colorStore.primary}05; border-color: {$colorStore.primary}30;">
          <div class="flex flex-col items-center justify-center">
            <div class="w-12 h-12 border-4 rounded-full animate-spin mb-4"
                 style="border-color: {$colorStore.primary}20; border-top-color: {$colorStore.primary};"></div>
            <p class="text-sm" style="color: {$colorStore.muted}">Loading suggestions...</p>
          </div>
        </div>
      {:else if error}
        <div class=" rounded-xl border p-6 transition-all"
             style="background: #ef444410; border-color: #ef444430;">
          <div class="flex items-center gap-3">
            <i class="fa-utility-duo fa-regular fa-triangle-exclamation"
               style="--fa-primary-color: #ef4444; --fa-secondary-color: #dc2626; font-size: 20px;"></i>
            <span style="color: #ef4444">{error}</span>
          </div>
        </div>
      {:else if sortedSuggestions.length === 0}
        <div class=" rounded-xl border p-12 transition-all text-center"
             style="background: {$colorStore.primary}05; border-color: {$colorStore.primary}30;">
          <i class="fa-utility-duo fa-regular fa-inbox"
             style="--fa-primary-color: {$colorStore.muted}; --fa-secondary-color: {$colorStore.muted}; font-size: 48px; display: block; margin: 0 auto 16px;"></i>
          <h3 class="text-xl font-bold mb-2" style="color: {$colorStore.text}">No suggestions yet</h3>
          <p style="color: {$colorStore.muted}">Suggestions from your community will appear here</p>
        </div>
      {:else}
        <!-- Sort Controls -->
        <div class="rounded-xl border p-3 md:p-4 mb-6 transition-all"
             style="background: {$colorStore.primary}05; border-color: {$colorStore.primary}30;">
          <div class="flex flex-col sm:flex-row flex-wrap gap-2 sm:gap-3 sm:items-center">
            <div class="flex items-center gap-2 w-full sm:w-auto">
              <span class="text-xs md:text-sm font-medium whitespace-nowrap"
                    style="color: {$colorStore.text}">Sort:</span>
              <div class="flex-1 sm:flex-none">
                <DiscordSelector
                  type="custom"
                  options={[
                      { id: "dateAdded", name: "Date", label: "Date" },
                      { id: "currentState", name: "Status", label: "Status" }
                    ]}
                  selected={sortBy}
                  searchable={false}
                  placeholder="Sort..."
                  onchange={(e) => {
                    const selected = Array.isArray(e.selected) ? e.selected[0] : e.selected;
                    if (selected === "dateAdded" || selected === "currentState") {
                      sortBy = selected;
                    }
                  }}
                />
              </div>
            </div>
            <button aria-label="Toggle sort direction"
                    class="px-3 py-1.5 md:px-4 md:py-2 rounded-lg border transition-all hover:scale-[1.02] flex items-center gap-1 md:gap-2 text-xs md:text-sm"
                    style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                    onclick={toggleSortDirection}
            >
              {#if sortDirection === 'asc'}
                <i class="fa-solid fa-arrow-up" style="font-size: 12px;"></i>
                <span class="hidden sm:inline">Ascending</span>
                <span class="sm:hidden">Asc</span>
              {:else}
                <i class="fa-solid fa-arrow-down" style="font-size: 12px;"></i>
                <span class="hidden sm:inline">Descending</span>
                <span class="sm:hidden">Desc</span>
              {/if}
            </button>
            <div class="ml-auto">
              <span class="text-xs md:text-sm" style="color: {$colorStore.muted}">
                {sortedSuggestions.length} {sortedSuggestions.length !== 1 ? 'items' : 'item'}
              </span>
            </div>
          </div>
        </div>

        <!-- Suggestions List -->
        <div class="space-y-4">
          {#each sortedSuggestions as suggestion, index (suggestion.id)}
            <div
              class=" rounded-xl border overflow-hidden transition-all hover:shadow-lg hover:-translate-y-px"
              style="background: {$colorStore.primary}05; border-color: {$colorStore.primary}30;"
              in:slide={{ duration: 300, delay: index * 50 }}
            >
              <!-- Suggestion Header -->
              <div class="p-3 md:p-4 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3"
                   style="background: {$colorStore.primary}08; border-bottom: 1px solid {$colorStore.primary}20;">
                <div class="flex items-center gap-2 sm:gap-3 min-w-0">
                  <img
                    src={suggestion.user?.avatarUrl}
                    alt=""
                    class="w-8 h-8 sm:w-10 sm:h-10 rounded-full ring-2 ring-opacity-20"
                    style="ring-color: {$colorStore.primary};"
                  >
                  <div class="min-w-0 flex-1">
                    <p class="font-semibold truncate text-sm sm:text-base" style="color: {$colorStore.text}">
                      {suggestion.user?.username}
                    </p>
                    <p class="text-xs" style="color: {$colorStore.muted}">
                      {suggestion.dateAdded ? new Date(suggestion.dateAdded).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric'
                      }) : "Unknown"}
                      <span
                        class="hidden sm:inline"> • {suggestion.dateAdded ? new Date(suggestion.dateAdded).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit'
                      }) : "Unknown"}</span>
                    </p>
                  </div>
                </div>
                <div class="flex items-center gap-2">
                    <span class="px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs font-medium whitespace-nowrap"
                          style="background: {getStateColor(suggestion.currentState)}20; color: {getStateColor(suggestion.currentState)};">
                      {getStatusString(suggestion.currentState)}
                    </span>
                </div>
              </div>

              <!-- Suggestion Content -->
              <div class="p-5">
                <div class="mb-4 p-4 rounded-lg"
                     style="background: {$colorStore.primary}05; border-left: 3px solid {$colorStore.primary}30;">
                  <p class="break-words leading-relaxed" style="color: {$colorStore.text}">
                    {suggestion.suggestion1}
                  </p>
                </div>

                <!-- Suggestion Metadata -->
                <div class="flex flex-wrap gap-4 mb-4 text-xs" style="color: {$colorStore.muted}">
                  <div class="flex items-center gap-1">
                    <i class="fa-solid fa-hashtag" style="font-size: 12px;"></i>
                    <span>ID: {suggestion.suggestionId}</span>
                  </div>
                  {#if suggestion.stateChangeUser}
                    <div class="flex items-center gap-1">
                      <i class="fa-solid fa-user" style="font-size: 12px;"></i>
                      <span>Modified by: {suggestion.stateChangeUser}</span>
                    </div>
                  {/if}
                  {#if suggestion.stateChangeCount}
                    <div class="flex items-center gap-1">
                      <i class="fa-solid fa-history" style="font-size: 12px;"></i>
                      <span>Changes: {suggestion.stateChangeCount}</span>
                    </div>
                  {/if}
                </div>

                <!-- Emote Counts -->
                {#if suggestion.emoteCounts}
                  <div class="flex flex-wrap gap-3 mb-4 p-3 rounded-lg" style="background: {$colorStore.primary}08;">
                    <span class="text-xs font-medium" style="color: {$colorStore.muted}">Reactions:</span>
                    {#if suggestion.emoteCounts.emote1 !== undefined}
                      <div class="flex items-center gap-1">
                        <span class="text-sm">👍</span>
                        <span class="text-xs font-medium"
                              style="color: {$colorStore.text}">{suggestion.emoteCounts.emote1}</span>
                      </div>
                    {/if}
                    {#if suggestion.emoteCounts.emote2 !== undefined}
                      <div class="flex items-center gap-1">
                        <span class="text-sm">👎</span>
                        <span class="text-xs font-medium"
                              style="color: {$colorStore.text}">{suggestion.emoteCounts.emote2}</span>
                      </div>
                    {/if}
                    {#if suggestion.emoteCounts.emote3 !== undefined && suggestion.emoteCounts.emote3 > 0}
                      <div class="flex items-center gap-1">
                        <span class="text-xs font-medium"
                              style="color: {$colorStore.text}">Emote 3: {suggestion.emoteCounts.emote3}</span>
                      </div>
                    {/if}
                    {#if suggestion.emoteCounts.emote4 !== undefined && suggestion.emoteCounts.emote4 > 0}
                      <div class="flex items-center gap-1">
                        <span class="text-xs font-medium"
                              style="color: {$colorStore.text}">Emote 4: {suggestion.emoteCounts.emote4}</span>
                      </div>
                    {/if}
                    {#if suggestion.emoteCounts.emote5 !== undefined && suggestion.emoteCounts.emote5 > 0}
                      <div class="flex items-center gap-1">
                        <span class="text-xs font-medium"
                              style="color: {$colorStore.text}">Emote 5: {suggestion.emoteCounts.emote5}</span>
                      </div>
                    {/if}
                  </div>
                {/if}

                <!-- Action Buttons -->
                <div class="flex flex-wrap gap-2 pt-3" style="border-top: 1px solid {$colorStore.primary}15;">
                  {#if !showInlineConfirm[suggestion.id]}
                    <!-- Regular action buttons -->
                    <div class="flex flex-wrap gap-2 w-full"
                         transition:fade={{ duration: 200, easing: cubicOut }}>
                      <button
                        class="px-3 py-2 md:px-4 rounded-lg text-xs md:text-sm font-medium flex items-center gap-1 md:gap-2 transition-all hover:scale-[1.02] focus:ring-2 focus:ring-green-500/50 disabled:opacity-60"
                        style="{suggestion.currentState === SuggestionState.Accepted
                          ? 'background: #22c55e; color: white; border: 1px solid #22c55e;'
                          : 'background: #22c55e20; color: #22c55e; border: 1px solid #22c55e30;'}"
                        onclick={() => initiateStatusChange(suggestion, SuggestionState.Accepted)}
                        disabled={suggestion.currentState === SuggestionState.Accepted}
                      >
                        <i class="fa-solid fa-check" style="font-size: 14px;"></i>
                        <span
                          class="hidden sm:inline">{suggestion.currentState === SuggestionState.Accepted ? 'Accepted' : 'Accept'}</span>
                      </button>
                      <button
                        class="px-3 py-2 md:px-4 rounded-lg text-xs md:text-sm font-medium flex items-center gap-1 md:gap-2 transition-all hover:scale-[1.02] focus:ring-2 focus:ring-red-500/50 disabled:opacity-60"
                        style="{suggestion.currentState === SuggestionState.Denied
                          ? 'background: #ef4444; color: white; border: 1px solid #ef4444;'
                          : 'background: #ef444420; color: #ef4444; border: 1px solid #ef444430;'}"
                        onclick={() => initiateStatusChange(suggestion, SuggestionState.Denied)}
                        disabled={suggestion.currentState === SuggestionState.Denied}
                      >
                        <i class="fa-solid fa-xmark" style="font-size: 14px;"></i>
                        <span
                          class="hidden sm:inline">{suggestion.currentState === SuggestionState.Denied ? 'Denied' : 'Deny'}</span>
                      </button>
                      <button
                        class="px-3 py-2 md:px-4 rounded-lg text-xs md:text-sm font-medium flex items-center gap-1 md:gap-2 transition-all hover:scale-[1.02] focus:ring-2 disabled:opacity-60"
                        style="{suggestion.currentState === SuggestionState.Considered
                          ? `background: ${$colorStore.secondary}; color: white; border: 1px solid ${$colorStore.secondary};`
                          : `background: ${$colorStore.secondary}20; color: ${$colorStore.secondary}; border: 1px solid ${$colorStore.secondary}30;`} --tw-ring-color: {$colorStore.secondary}50;"
                        onclick={() => initiateStatusChange(suggestion, SuggestionState.Considered)}
                        disabled={suggestion.currentState === SuggestionState.Considered}
                      >
                        <i class="fa-solid fa-comment" style="font-size: 14px;"></i>
                        <span
                          class="hidden sm:inline">{suggestion.currentState === SuggestionState.Considered ? 'Considered' : 'Consider'}</span>
                      </button>
                      <button
                        class="px-3 py-2 md:px-4 rounded-lg text-xs md:text-sm font-medium flex items-center gap-1 md:gap-2 transition-all hover:scale-[1.02] focus:ring-2 disabled:opacity-60"
                        style="{suggestion.currentState === SuggestionState.Implemented
                          ? `background: ${$colorStore.accent}; color: white; border: 1px solid ${$colorStore.accent};`
                          : `background: ${$colorStore.accent}20; color: ${$colorStore.accent}; border: 1px solid ${$colorStore.accent}30;`} --tw-ring-color: {$colorStore.accent}50;"
                        onclick={() => initiateStatusChange(suggestion, SuggestionState.Implemented)}
                        disabled={suggestion.currentState === SuggestionState.Implemented}
                      >
                        <i class="fa-solid fa-code" style="font-size: 14px;"></i>
                        <span
                          class="hidden sm:inline">{suggestion.currentState === SuggestionState.Implemented ? 'Implemented' : 'Implement'}</span>
                      </button>
                      <button
                        class="ml-auto px-3 py-2 md:px-4 rounded-lg text-xs md:text-sm font-medium flex items-center gap-1 md:gap-2 transition-all hover:scale-[1.02] hover:bg-red-500/20 focus:ring-2"
                        style="background: {$colorStore.muted}10; color: {$colorStore.muted}; border: 1px solid {$colorStore.muted}20; --tw-ring-color: {$colorStore.muted}50;"
                        onclick={() => {
                            if (confirm('Are you sure you want to delete this suggestion?')) {
                              deleteSuggestion(suggestion.id);
                            }
                          }}
                      >
                        <i class="fa-solid fa-trash" style="font-size: 14px;"></i>
                        <span class="hidden sm:inline">Delete</span>
                      </button>
                    </div>
                  {:else}
                    <!-- Inline confirmation UI -->
                    <div class="w-full space-y-3"
                         transition:slide={{ duration: 300, easing: cubicOut }}
                         style="transform-origin: top;">
                      <div class="p-3 rounded-lg"
                           style="background: {$colorStore.primary}08; border: 1px solid {$colorStore.primary}20;"
                           transition:fade={{ duration: 200, delay: 100 }}>
                        <p class="text-xs md:text-sm font-medium mb-2" style="color: {$colorStore.text}">
                          Confirm {getStatusString(showInlineConfirm[suggestion.id] || SuggestionState.Suggested)}
                        </p>
                        <textarea
                          bind:value={inlineReasons[suggestion.id]}
                          class="w-full min-h-[60px] p-2 rounded-lg text-xs md:text-sm resize-none transition-all focus:ring-2"
                          style="background: {$colorStore.primary}10; border: 1px solid {$colorStore.primary}30; color: {$colorStore.text}; --tw-ring-color: {$colorStore.primary}50;"
                          placeholder="Reason (optional)..."
                        ></textarea>
                      </div>
                      <div class="flex gap-2 justify-end"
                           transition:fly={{ duration: 250, y: 10, delay: 150, easing: cubicOut }}>
                        <button
                          class="px-3 py-2 rounded-lg text-xs md:text-sm font-medium transition-all hover:scale-[1.02] focus:ring-2 disabled:opacity-50"
                          style="background: {$colorStore.secondary}20; color: {$colorStore.secondary}; border: 1px solid {$colorStore.secondary}30; --tw-ring-color: {$colorStore.secondary}50;"
                          onclick={() => cancelInlineConfirm(suggestion.id)}
                          disabled={confirmingStatus[suggestion.id]}
                        >
                          Cancel
                        </button>
                        <button
                          class="px-4 py-2 rounded-lg text-xs md:text-sm font-medium transition-all hover:scale-[1.02] focus:ring-2 disabled:opacity-50 min-w-[80px]"
                          style="background: {$colorStore.primary}20; color: {$colorStore.primary}; border: 1px solid {$colorStore.primary}30; --tw-ring-color: {$colorStore.primary}50;"
                          onclick={() => confirmInlineStatusChange(suggestion)}
                          disabled={confirmingStatus[suggestion.id]}
                        >
                          {#if confirmingStatus[suggestion.id]}
                            <span class="flex items-center justify-center gap-2">
                              <svg class="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none"
                                   viewBox="0 0 24 24">
                                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor"
                                        stroke-width="4"></circle>
                                <path class="opacity-75" fill="currentColor"
                                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              <span class="text-xs">Updating...</span>
                            </span>
                          {:else}
                            Confirm
                          {/if}
                        </button>
                      </div>
                    </div>
                  {/if}
                </div>
              </div>
            </div>
          {/each}
        </div>
      {/if}
    </div>
  {:else}
    <!-- Settings Content -->
    <div class="space-y-6">
      <!-- Settings Panels -->
      {#if activeSubTab === 'general'}
        <div class=" rounded-xl border p-6 space-y-6 transition-all"
             style="background: {$colorStore.primary}05; border-color: {$colorStore.primary}30;">
          <div class="space-y-4">
            <h3 class="text-lg font-semibold" style="color: {$colorStore.text}">Length Settings</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="space-y-2">
                <label for="min-length" class="block text-sm" style="color: {$colorStore.muted}">
                  Minimum Length
                </label>
                <input
                  id="min-length"
                  type="number"
                  min="0"
                  max="2000"
                  bind:value={minLength}
                  class="w-full p-3 rounded-lg"
                  style="background: {$colorStore.primary}10;
                           border: 1px solid {$colorStore.primary}30;
                           color: {$colorStore.text};"
                >
              </div>
              <div class="space-y-2">
                <label for="max-length" class="block text-sm" style="color: {$colorStore.muted}">
                  Maximum Length
                </label>
                <input
                  id="max-length"
                  type="number"
                  min="0"
                  max="2000"
                  bind:value={maxLength}
                  class="w-full p-3 rounded-lg"
                  style="background: {$colorStore.primary}10;
                           border: 1px solid {$colorStore.primary}30;
                           color: {$colorStore.text};"
                >
              </div>
            </div>
          </div>

          <div class="space-y-4">
            <h3 class="text-lg font-semibold" style="color: {$colorStore.text}">Thread Settings</h3>
            <div class="space-y-2">
              <span id="thread-type-label" class="block text-sm" style="color: {$colorStore.muted}">Thread Type</span>
              <DiscordSelector
                type="custom"
                options={[
                    { id: "0", name: "No Threads", label: "No Threads" },
                    { id: "1", name: "Regular Threads", label: "Regular Threads" },
                    { id: "2", name: "Private Threads", label: "Private Threads" }
                  ]}
                selected={threadType.toString()}
                searchable={false}
                placeholder="Select thread type..."
                onchange={(e) => {
                    const selected = Array.isArray(e.selected) ? e.selected[0] : e.selected;
                    threadType = parseInt(selected || "0");
                    
                  }}
              />
            </div>
          </div>
        </div>
      {/if}

      {#if activeSubTab === 'messages'}
        <div class=" rounded-xl border p-6 space-y-6 transition-all"
             style="background: {$colorStore.primary}05; border-color: {$colorStore.primary}30;">
          <div class="space-y-6">
            <!-- Suggestion Message -->
            <div>
              <h3 class="text-base font-semibold mb-3" style="color: {$colorStore.text};">
                Suggestion Message
              </h3>
              <p class="text-xs mb-3" style="color: {$colorStore.muted}">
                Format for displaying new suggestions. Supports Discord embeds and placeholders.
              </p>
              <FullscreenEmbedBuilder
                bind:value={suggestionMessage}
                previewTitle="Suggestion Message"
                previewDescription="Message sent when a new suggestion is created"
                allowComponents={false}
                allowContent={true}
                additionalPlaceholders={suggestionPlaceholders}
                placeholder="Click to configure the suggestion message"
                icon="fa-comment"
                guildId={$currentGuild?.id}
                user={data.user}
              />
            </div>

            <!-- Accept Message -->
            <div>
              <h3 class="text-base font-semibold mb-3" style="color: {$colorStore.text};">
                Accept Message
              </h3>
              <p class="text-xs mb-3" style="color: {$colorStore.muted}">
                Message sent when a suggestion is accepted. Supports Discord embeds and placeholders.
              </p>
              <FullscreenEmbedBuilder
                bind:value={acceptMessage}
                previewTitle="Accept Message"
                previewDescription="Message sent when a suggestion is accepted"
                allowComponents={false}
                allowContent={true}
                additionalPlaceholders={suggestionPlaceholders}
                placeholder="Click to configure the accept message"
                icon="fa-check-circle"
                guildId={$currentGuild?.id}
                user={data.user}
              />
            </div>

            <!-- Deny Message -->
            <div>
              <h3 class="text-base font-semibold mb-3" style="color: {$colorStore.text};">
                Deny Message
              </h3>
              <p class="text-xs mb-3" style="color: {$colorStore.muted}">
                Message sent when a suggestion is denied. Supports Discord embeds and placeholders.
              </p>
              <FullscreenEmbedBuilder
                bind:value={denyMessage}
                previewTitle="Deny Message"
                previewDescription="Message sent when a suggestion is denied"
                allowComponents={false}
                allowContent={true}
                additionalPlaceholders={suggestionPlaceholders}
                placeholder="Click to configure the deny message"
                icon="fa-times-circle"
                guildId={$currentGuild?.id}
                user={data.user}
              />
            </div>

            <!-- Consider Message -->
            <div>
              <h3 class="text-base font-semibold mb-3" style="color: {$colorStore.text};">
                Consider Message
              </h3>
              <p class="text-xs mb-3" style="color: {$colorStore.muted}">
                Message sent when a suggestion is being considered. Supports Discord embeds and placeholders.
              </p>
              <FullscreenEmbedBuilder
                bind:value={considerMessage}
                previewTitle="Consider Message"
                previewDescription="Message sent when a suggestion is being considered"
                allowComponents={false}
                allowContent={true}
                additionalPlaceholders={suggestionPlaceholders}
                placeholder="Click to configure the consider message"
                icon="fa-lightbulb"
                guildId={$currentGuild?.id}
                user={data.user}
              />
            </div>

            <!-- Implement Message -->
            <div>
              <h3 class="text-base font-semibold mb-3" style="color: {$colorStore.text};">
                Implement Message
              </h3>
              <p class="text-xs mb-3" style="color: {$colorStore.muted}">
                Message sent when a suggestion is implemented. Supports Discord embeds and placeholders.
              </p>
              <FullscreenEmbedBuilder
                bind:value={implementMessage}
                previewTitle="Implement Message"
                previewDescription="Message sent when a suggestion is implemented"
                allowComponents={false}
                allowContent={true}
                additionalPlaceholders={suggestionPlaceholders}
                placeholder="Click to configure the implement message"
                icon="fa-code"
                guildId={$currentGuild?.id}
                user={data.user}
              />
            </div>
          </div>
        </div>
      {/if}

      {#if activeSubTab === 'channels'}
        <div class=" rounded-xl border p-6 space-y-6 transition-all"
             style="background: {$colorStore.primary}05; border-color: {$colorStore.primary}30;">
          <div class="space-y-4">
            <div class="space-y-2">
              <span id="suggest-channel-label" class="block text-sm"
                    style="color: {$colorStore.muted}">Suggest Channel</span>
              <DiscordSelector
                type="channel"
                options={channels}
                selected={suggestChannel}
                placeholder="Select suggest channel..."
                onchange={(e) => {
                    const selected = Array.isArray(e.selected) ? e.selected[0] : e.selected;
                    suggestChannel = selected || "";
                    
                  }}
              />
            </div>
            <div class="space-y-2">
              <span id="accept-channel-label" class="block text-sm"
                    style="color: {$colorStore.muted}">Accept Channel</span>
              <DiscordSelector
                type="channel"
                options={channels}
                selected={acceptChannel}
                placeholder="Select accept channel..."
                onchange={(e) => {
                    const selected = Array.isArray(e.selected) ? e.selected[0] : e.selected;
                    acceptChannel = selected || "";
                    
                  }}
              />
            </div>
            <div class="space-y-2">
              <span id="deny-channel-label" class="block text-sm" style="color: {$colorStore.muted}">Deny Channel</span>
              <DiscordSelector
                type="channel"
                options={channels}
                selected={denyChannel}
                placeholder="Select deny channel..."
                onchange={(e) => {
                    const selected = Array.isArray(e.selected) ? e.selected[0] : e.selected;
                    denyChannel = selected || "";
                    
                  }}
              />
            </div>
            <div class="space-y-2">
              <span id="consider-channel-label" class="block text-sm" style="color: {$colorStore.muted}">Consider Channel</span>
              <DiscordSelector
                type="channel"
                options={channels}
                selected={considerChannel}
                placeholder="Select consider channel..."
                onchange={(e) => {
                    const selected = Array.isArray(e.selected) ? e.selected[0] : e.selected;
                    considerChannel = selected || "";
                    
                  }}
              />
            </div>
            <div class="space-y-2">
              <span id="implement-channel-label" class="block text-sm" style="color: {$colorStore.muted}">Implement Channel</span>
              <DiscordSelector
                type="channel"
                options={channels}
                selected={implementChannel}
                placeholder="Select implement channel..."
                onchange={(e) => {
                    const selected = Array.isArray(e.selected) ? e.selected[0] : e.selected;
                    implementChannel = selected || "";
                    
                  }}
              />
            </div>
          </div>
        </div>
      {/if}

      {#if activeSubTab === 'archive'}
        <div class=" rounded-xl border p-6 space-y-6 transition-all"
             style="background: {$colorStore.primary}05; border-color: {$colorStore.primary}30;">
          <div class="flex items-center justify-between p-3 rounded-lg transition-all hover:scale-[1.01]"
               style="background: {$colorStore.primary}08;">
            <span style="color: {$colorStore.text}">Archive on Accept</span>
            <label class="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                class="sr-only peer"
                bind:checked={archiveOnAccept}

              >
              <div
                class="w-11 h-6 bg-gray-600 peer-focus:outline-hidden rounded-full peer
                         peer-checked:after:translate-x-full peer-checked:after:border-white
                         after:content-[''] after:absolute after:top-[2px] after:left-[2px]
                         after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"
                style:background-color={archiveOnAccept ? $colorStore.primary : '#4b5563'}>
              </div>
            </label>
          </div>

          <div class="flex items-center justify-between p-3 rounded-lg transition-all hover:scale-[1.01]"
               style="background: {$colorStore.primary}08;">
            <span style="color: {$colorStore.text}">Archive on Deny</span>
            <label class="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                class="sr-only peer"
                bind:checked={archiveOnDeny}

              >
              <div
                class="w-11 h-6 bg-gray-600 peer-focus:outline-hidden rounded-full peer
                         peer-checked:after:translate-x-full peer-checked:after:border-white
                         after:content-[''] after:absolute after:top-[2px] after:left-[2px]
                         after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"
                style:background-color={archiveOnDeny ? $colorStore.primary : '#4b5563'}>
              </div>
            </label>
          </div>

          <div class="flex items-center justify-between p-3 rounded-lg transition-all hover:scale-[1.01]"
               style="background: {$colorStore.primary}08;">
            <span style="color: {$colorStore.text}">Archive on Consider</span>
            <label class="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                class="sr-only peer"
                bind:checked={archiveOnConsider}

              >
              <div
                class="w-11 h-6 bg-gray-600 peer-focus:outline-hidden rounded-full peer
                         peer-checked:after:translate-x-full peer-checked:after:border-white
                         after:content-[''] after:absolute after:top-[2px] after:left-[2px]
                         after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"
                style:background-color={archiveOnConsider ? $colorStore.primary : '#4b5563'}>
              </div>
            </label>
          </div>

          <div class="flex items-center justify-between p-3 rounded-lg transition-all hover:scale-[1.01]"
               style="background: {$colorStore.primary}08;">
            <span style="color: {$colorStore.text}">Archive on Implement</span>
            <label class="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                class="sr-only peer"
                bind:checked={archiveOnImplement}

              >
              <div
                class="w-11 h-6 bg-gray-600 peer-focus:outline-hidden rounded-full peer
                         peer-checked:after:translate-x-full peer-checked:after:border-white
                         after:content-[''] after:absolute after:top-[2px] after:left-[2px]
                         after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"
                style:background-color={archiveOnImplement ? $colorStore.primary : '#4b5563'}>
              </div>
            </label>
          </div>
        </div>
      {/if}

      {#if activeSubTab === 'emotes'}
        <div class=" rounded-xl border p-6 space-y-6 transition-all"
             style="background: {$colorStore.primary}05; border-color: {$colorStore.primary}30;">
          <div class="space-y-4">
            <h3 class="text-lg font-semibold" style="color: {$colorStore.text}">Emote Display Mode</h3>
            <div class="space-y-2">
              <span id="emote-mode-label" class="block text-sm" style="color: {$colorStore.muted}">Mode</span>
              <DiscordSelector
                type="custom"
                options={[
                    { id: "0", name: "Reactions", label: "Reactions" },
                    { id: "1", name: "Buttons", label: "Buttons" }
                  ]}
                selected={emoteMode.toString()}
                searchable={false}
                placeholder="Select emote mode..."
                onchange={(e) => {
                    const selected = Array.isArray(e.selected) ? e.selected[0] : e.selected;
                    emoteMode = parseInt(selected || "0");
                  }}
              />
              <p class="text-xs" style="color: {$colorStore.muted}">
                Choose how users interact with suggestions: traditional reactions or interactive buttons
              </p>
            </div>
          </div>

          <div class="space-y-2">
            <label class="block text-sm" style="color: {$colorStore.muted}">Custom Emotes</label>
            <EmojiPicker
              guildEmojis={guildEmojis}
              bind:selected={suggestEmotes}
              multiple={true}
              maxSelection={5}
              placeholder="Select up to 5 emotes..."
              showUnicodeEmojis={true}
            />
            <p class="text-xs" style="color: {$colorStore.muted}">
              Select up to 5 emotes. Supports Unicode and Discord custom emotes. Leave empty for default 👍/👎
            </p>
          </div>

          <div class="space-y-4">
            <h3 class="text-lg font-semibold" style="color: {$colorStore.text}">Suggestion Button</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="space-y-2">
                <label for="suggest-button-label" class="block text-sm" style="color: {$colorStore.muted}">Button
                  Label</label>
                <input
                  id="suggest-button-label"
                  type="text"
                  bind:value={suggestButtonLabel}

                  class="w-full p-3 rounded-lg"
                  style="background: {$colorStore.primary}10;
                           border: 1px solid {$colorStore.primary}30;
                           color: {$colorStore.text};"
                  placeholder="Enter button label"
                >
              </div>
              <div class="space-y-2">
                <label class="block text-sm" style="color: {$colorStore.muted}">Button Emote</label>
                <EmojiPicker
                  guildEmojis={guildEmojis}
                  bind:selected={suggestButtonEmote}
                  placeholder="Select button emote..."
                  showUnicodeEmojis={true}
                />
                <p class="text-xs" style="color: {$colorStore.muted}">
                  Single emote for the suggest button. Supports Unicode or Discord custom emotes. Leave empty for no
                  emote.
                </p>
              </div>
            </div>
            <div class="space-y-2">
              <label for="suggest-button-message" class="block text-sm" style="color: {$colorStore.muted}">Button
                Message</label>
              <FullscreenEmbedBuilder
                bind:value={suggestButtonMessage}
                previewTitle="Button Message"
                previewDescription="Configure the message sent when users click the suggestion button"
                icon="fa-comment-dots"
                allowContent={true}
                allowComponents={false}
                additionalPlaceholders={suggestionPlaceholders}
                user={currentUser}
              />
            </div>
          </div>

          <div class="space-y-4">
            <h3 class="text-lg font-semibold" style="color: {$colorStore.text}">Button Colors</h3>
            <div class="space-y-2">
              <span id="suggest-button-color-label" class="block text-sm" style="color: {$colorStore.muted}">Suggest Button Color</span>
              <DiscordSelector
                type="custom"
                options={[
                    { id: "1", name: "Blue", label: "Blue" },
                    { id: "2", name: "Grey", label: "Grey" },
                    { id: "3", name: "Green", label: "Green" },
                    { id: "4", name: "Red", label: "Red" }
                  ]}
                selected={suggestButtonColor.toString()}
                searchable={false}
                placeholder="Select button color..."
                onchange={(e) => {
                    const selected = Array.isArray(e.selected) ? e.selected[0] : e.selected;
                    suggestButtonColor = parseInt(selected || "1");
                  }}
              />
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div class="space-y-2">
                <span class="block text-sm" style="color: {$colorStore.muted}">Emote 1 Button</span>
                <DiscordSelector
                  type="custom"
                  options={[
                      { id: "1", name: "Blue", label: "Blue" },
                      { id: "2", name: "Grey", label: "Grey" },
                      { id: "3", name: "Green", label: "Green" },
                      { id: "4", name: "Red", label: "Red" }
                    ]}
                  selected={emote1Style.toString()}
                  searchable={false}
                  placeholder="Color..."
                  onchange={(e) => {
                      const selected = Array.isArray(e.selected) ? e.selected[0] : e.selected;
                      emote1Style = parseInt(selected || "1");
                    }}
                />
              </div>

              <div class="space-y-2">
                <span class="block text-sm" style="color: {$colorStore.muted}">Emote 2 Button</span>
                <DiscordSelector
                  type="custom"
                  options={[
                      { id: "1", name: "Blue", label: "Blue" },
                      { id: "2", name: "Grey", label: "Grey" },
                      { id: "3", name: "Green", label: "Green" },
                      { id: "4", name: "Red", label: "Red" }
                    ]}
                  selected={emote2Style.toString()}
                  searchable={false}
                  placeholder="Color..."
                  onchange={(e) => {
                      const selected = Array.isArray(e.selected) ? e.selected[0] : e.selected;
                      emote2Style = parseInt(selected || "1");
                    }}
                />
              </div>

              <div class="space-y-2">
                <span class="block text-sm" style="color: {$colorStore.muted}">Emote 3 Button</span>
                <DiscordSelector
                  type="custom"
                  options={[
                      { id: "1", name: "Blue", label: "Blue" },
                      { id: "2", name: "Grey", label: "Grey" },
                      { id: "3", name: "Green", label: "Green" },
                      { id: "4", name: "Red", label: "Red" }
                    ]}
                  selected={emote3Style.toString()}
                  searchable={false}
                  placeholder="Color..."
                  onchange={(e) => {
                      const selected = Array.isArray(e.selected) ? e.selected[0] : e.selected;
                      emote3Style = parseInt(selected || "1");
                    }}
                />
              </div>

              <div class="space-y-2">
                <span class="block text-sm" style="color: {$colorStore.muted}">Emote 4 Button</span>
                <DiscordSelector
                  type="custom"
                  options={[
                      { id: "1", name: "Blue", label: "Blue" },
                      { id: "2", name: "Grey", label: "Grey" },
                      { id: "3", name: "Green", label: "Green" },
                      { id: "4", name: "Red", label: "Red" }
                    ]}
                  selected={emote4Style.toString()}
                  searchable={false}
                  placeholder="Color..."
                  onchange={(e) => {
                      const selected = Array.isArray(e.selected) ? e.selected[0] : e.selected;
                      emote4Style = parseInt(selected || "1");
                    }}
                />
              </div>

              <div class="space-y-2">
                <span class="block text-sm" style="color: {$colorStore.muted}">Emote 5 Button</span>
                <DiscordSelector
                  type="custom"
                  options={[
                      { id: "1", name: "Blue", label: "Blue" },
                      { id: "2", name: "Grey", label: "Grey" },
                      { id: "3", name: "Green", label: "Green" },
                      { id: "4", name: "Red", label: "Red" }
                    ]}
                  selected={emote5Style.toString()}
                  searchable={false}
                  placeholder="Color..."
                  onchange={(e) => {
                      const selected = Array.isArray(e.selected) ? e.selected[0] : e.selected;
                      emote5Style = parseInt(selected || "1");
                    }}
                />
              </div>
            </div>
            <p class="text-xs" style="color: {$colorStore.muted}">
              Customize button colors for each emote when using button mode (applies to all 5 emote buttons)
            </p>
          </div>
        </div>
      {/if}

    </div>
  {/if}
</DashboardPageLayout>

