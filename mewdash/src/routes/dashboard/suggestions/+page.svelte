<!-- routes/dashboard/suggestions/+page.svelte -->
<script lang="ts">
  import { m } from "$lib/i18n";


  import { onMount } from "svelte";
  import { logger } from "$lib/logger";
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
  import { requestConfirmation } from "$lib/stores/confirmationStore";
  import { createAutoSave } from "$lib/utils/autoSave.svelte";

  const autoSave = createAutoSave({
    onError: () => showNotificationMessage(m.suggestions.notifySaveFailed(), "error")
  });

  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();

  let currentUser = $derived(data.user);

  // States
  let activeTab = $state("suggestions");
  let activeSubTab = $state("general");
  let loading = $state(true);
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

  const buttonColorOptions = $derived([
    { id: "1", name: m.common.blue(), label: m.common.blue() },
    { id: "2", name: m.common.colorGrey(), label: m.common.colorGrey() },
    { id: "3", name: m.common.colorGreen(), label: m.common.colorGreen() },
    { id: "4", name: m.common.red(), label: m.common.red() }
  ]);

  // Suggestion-specific placeholders
  const suggestionPlaceholders = $derived([
    {
      category: "Suggestions",
      name: "%suggest.user%",
      description: m.placeholders.suggestUser()
    },
    {
      category: "Suggestions",
      name: "%suggest.user.id%",
      description: m.placeholders.suggestUserId()
    },
    { category: "Suggestions", name: "%suggest.message%", description: m.placeholders.suggestMessage() },
    { category: "Suggestions", name: "%suggest.number%", description: m.placeholders.suggestNumber() },
    {
      category: "Suggestions",
      name: "%suggest.user.name%",
      description: m.placeholders.suggestUserName()
    },
    { category: "Suggestions", name: "%suggest.user.avatar%", description: m.placeholders.suggestUserAvatar() },
    {
      category: "Suggestions",
      name: "%suggest.mod.user%",
      description: m.placeholders.suggestModUser()
    },
    {
      category: "Suggestions",
      name: "%suggest.mod.avatar%",
      description: m.placeholders.suggestModAvatar()
    },
    {
      category: "Suggestions",
      name: "%suggest.mod.name%",
      description: m.placeholders.suggestModName()
    },
    { category: "Suggestions", name: "%suggest.mod.message%", description: m.placeholders.suggestModMessage() }
  ]);

  // Values the server last confirmed (set on load and after each successful save)
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
    archiveOnImplement: false
  });

  // Computed values
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
      [SuggestionState.Suggested]: m.common.pending(),
      [SuggestionState.Accepted]: m.common.accepted(),
      [SuggestionState.Denied]: m.common.denied(),
      [SuggestionState.Considered]: m.suggestions.actionConsidered(),
      [SuggestionState.Implemented]: m.common.implemented()
    }[state] || m.common.unknown();
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
        showNotificationMessage(m.suggestions.notifyStatusUpdated());
        cancelInlineConfirm(suggestion.id);
      } catch (err) {
        showNotificationMessage(m.common.failedToUpdateStatus(), "error");
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
        if (!$currentGuild?.id) throw new Error(m.common.noGuildSelected());

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
        error = err instanceof Error ? err.message : m.suggestions.errorFetch();
      } finally {
        loading = false;
      }
    }, "api", m.suggestions.loadingSuggestions());
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
          fetchedButtonEmote
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
          suggestionsApi.getSuggestButtonEmote($currentGuild.id)
        ]);

        minLength = fetchedMinLength;
        maxLength = fetchedMaxLength;
        logger.debug(fetchedMinLength, fetchedMaxLength, fetchedAcceptMessage, fetchedDenyMessage, fetchedArchiveOnConsider);

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
          archiveOnImplement
        };
      } catch (err) {
        logger.error("Error loading settings:", err);
        showNotificationMessage(m.common.notifyLoadSettingsFailed(), "error");
      }
    }, "api", m.common.loadingSettings());
  }

  async function fetchChannels() {
    try {
      if (!$currentGuild?.id) throw new Error("No guild selected");
      channels = await clientApi.getTextChannels($currentGuild.id);
    } catch (err) {
      showNotificationMessage(m.common.failedToFetchChannels(), "error");
    }
  }

  async function loadGuildEmojis() {
    try {
      if (!currentUser?.id) throw new Error("User not authenticated");
      guildEmojis = await clientApi.getEmojis(currentUser.id, true);
    } catch (err) {
      logger.error("Failed to fetch guild emojis:", err);
    }
  }

  type SavedValues = typeof originalValues;

  /**
   * Saves one setting through its own setter. The guild and value are captured now, so a save
   * still waiting after a server switch cannot write to the wrong server. `restore` puts the
   * field back to the last confirmed value if the save fails; typed fields pass none.
   */
  function persist<K extends keyof SavedValues>(
    key: K,
    value: SavedValues[K],
    send: (guildId: bigint) => Promise<unknown>,
    restore?: (previous: SavedValues[K]) => void,
    debounce = false
  ) {
    if (!$currentGuild?.id) return;
    const guildId = $currentGuild.id;
    const previous = originalValues[key];
    const run = async () => {
      try {
        await send(guildId);
        if ($currentGuild?.id === guildId) originalValues[key] = value;
      } catch (err) {
        if (restore && $currentGuild?.id === guildId) restore(previous);
        throw err;
      }
    };
    if (debounce) autoSave.schedule(key, run);
    else autoSave.now(key, run);
  }

  function isValidLength(value: unknown): value is number {
    return typeof value === "number" && Number.isInteger(value) && value >= 0 && value <= 2000;
  }

  function saveMinLength() {
    if (!isValidLength(minLength)) return;
    const value = minLength;
    persist("minLength", value, (guildId) => suggestionsApi.setMinLength(guildId, value), undefined, true);
  }

  function saveMaxLength() {
    if (!isValidLength(maxLength)) return;
    const value = maxLength;
    persist("maxLength", value, (guildId) => suggestionsApi.setMaxLength(guildId, value), undefined, true);
  }

  /** Leaving a length field with an invalid number puts the saved one back rather than sending it. */
  function flushLength(key: "minLength" | "maxLength") {
    if (key === "minLength" && !isValidLength(minLength)) minLength = originalValues.minLength;
    if (key === "maxLength" && !isValidLength(maxLength)) maxLength = originalValues.maxLength;
    void autoSave.flush(key);
  }

  type ChannelKey = "suggestChannel" | "acceptChannel" | "denyChannel" | "considerChannel" | "implementChannel";

  const channelSetters: Record<ChannelKey, (guildId: bigint, channelId: bigint) => Promise<unknown>> = {
    suggestChannel: suggestionsApi.setSuggestChannel,
    acceptChannel: suggestionsApi.setAcceptChannel,
    denyChannel: suggestionsApi.setDenyChannel,
    considerChannel: suggestionsApi.setConsiderChannel,
    implementChannel: suggestionsApi.setImplementChannel
  };

  function setChannel(key: ChannelKey, value: string) {
    const restore = (previous: string) => {
      switch (key) {
        case "suggestChannel": suggestChannel = previous; break;
        case "acceptChannel": acceptChannel = previous; break;
        case "denyChannel": denyChannel = previous; break;
        case "considerChannel": considerChannel = previous; break;
        case "implementChannel": implementChannel = previous; break;
      }
    };
    restore(value);
    persist(key, value, (guildId) => channelSetters[key](guildId, value ? BigInt(value) : 0n), restore);
  }

  function setThreadType(value: number) {
    threadType = value;
    persist("threadType", value, (guildId) => suggestionsApi.setSuggestThreadsType(guildId, value), (p) => threadType = p);
  }

  function setEmoteMode(value: number) {
    emoteMode = value;
    persist("emoteMode", value, (guildId) => suggestionsApi.setEmoteMode(guildId, value), (p) => emoteMode = p);
  }

  function setSuggestButtonColor(value: number) {
    suggestButtonColor = value;
    persist("suggestButtonColor", value, (guildId) => suggestionsApi.setSuggestButtonColor(guildId, value), (p) => suggestButtonColor = p);
  }

  type EmoteStyleKey = "emote1Style" | "emote2Style" | "emote3Style" | "emote4Style" | "emote5Style";

  function setEmoteStyle(buttonId: 1 | 2 | 3 | 4 | 5, value: number) {
    const key = `emote${buttonId}Style` as EmoteStyleKey;
    const restore = (previous: number) => {
      switch (buttonId) {
        case 1: emote1Style = previous; break;
        case 2: emote2Style = previous; break;
        case 3: emote3Style = previous; break;
        case 4: emote4Style = previous; break;
        case 5: emote5Style = previous; break;
      }
    };
    restore(value);
    persist(key, value, (guildId) => suggestionsApi.setEmoteButtonStyle(guildId, buttonId, value), restore);
  }

  type ArchiveKey = "archiveOnAccept" | "archiveOnDeny" | "archiveOnConsider" | "archiveOnImplement";

  /** Called after the bound checkbox has already flipped the value. */
  function saveArchive(key: ArchiveKey) {
    switch (key) {
      case "archiveOnAccept":
        persist(key, archiveOnAccept, (g) => suggestionsApi.setArchiveOnAccept(g, archiveOnAccept), (p) => archiveOnAccept = p);
        break;
      case "archiveOnDeny":
        persist(key, archiveOnDeny, (g) => suggestionsApi.setArchiveOnDeny(g, archiveOnDeny), (p) => archiveOnDeny = p);
        break;
      case "archiveOnConsider":
        persist(key, archiveOnConsider, (g) => suggestionsApi.setArchiveOnConsider(g, archiveOnConsider), (p) => archiveOnConsider = p);
        break;
      case "archiveOnImplement":
        persist(key, archiveOnImplement, (g) => suggestionsApi.setArchiveOnImplement(g, archiveOnImplement), (p) => archiveOnImplement = p);
        break;
    }
  }

  function saveSuggestEmotes() {
    const value = Array.isArray(suggestEmotes) ? [...suggestEmotes] : suggestEmotes;
    const emotesString = Array.isArray(value) ? value.join(",") : (value || null);
    persist("suggestEmotes", value, (guildId) => suggestionsApi.setSuggestEmotes(guildId, emotesString), (p) => suggestEmotes = p);
  }

  function saveSuggestButtonEmote() {
    const value = suggestButtonEmote;
    const emoteValue = Array.isArray(value) ? value[0] : value;
    persist("suggestButtonEmote", value, (guildId) => suggestionsApi.setSuggestButtonEmote(guildId, emoteValue || null), (p) => suggestButtonEmote = p);
  }

  function saveSuggestButtonLabel() {
    const value = suggestButtonLabel;
    persist("suggestButtonLabel", value, (guildId) => suggestionsApi.setSuggestButtonLabel(guildId, value || null), undefined, true);
  }

  type MessageKey = "suggestionMessage" | "acceptMessage" | "denyMessage" | "considerMessage" | "implementMessage" | "suggestButtonMessage";

  const messageSetters: Record<MessageKey, (guildId: bigint, message: string | null) => Promise<unknown>> = {
    suggestionMessage: suggestionsApi.setSuggestionMessage,
    acceptMessage: suggestionsApi.setAcceptMessage,
    denyMessage: suggestionsApi.setDenyMessage,
    considerMessage: suggestionsApi.setConsiderMessage,
    implementMessage: suggestionsApi.setImplementMessage,
    suggestButtonMessage: suggestionsApi.setSuggestButtonMessage
  };

  /**
   * Message templates are authored in the embed builder and committed with its own Save, so
   * they are saved when the builder closes, and only if the content differs from the server's.
   * Not rolled back on failure: that would throw away the user's authoring; Retry resends it.
   */
  function saveMessage(key: MessageKey, value: any) {
    const serialized = JSON.stringify(value ?? {});
    if (serialized === JSON.stringify(originalValues[key] ?? {})) return;
    const snapshot = JSON.parse(serialized);
    const message = !value || Object.keys(value).length === 0 ? null : JSON.stringify(value);
    persist(key, snapshot, (guildId) => messageSetters[key](guildId, message));
  }

  async function deleteSuggestion(id: number) {
    return await loadingStore.wrap("delete-suggestion", async () => {
      try {
        if (!$currentGuild?.id) throw new Error("No guild selected");
        await suggestionsApi.deleteSuggestion($currentGuild.id, BigInt(id));
        await fetchSuggestions();
        showNotificationMessage(m.suggestions.notifyDeleted());
      } catch (err) {
        showNotificationMessage(m.suggestions.notifyDeleteFailed(), "error");
      }
    }, "operation", m.suggestions.loadingDeleting());
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
  {autoSave}
  bind:activeSubTab
  bind:activeTab
  guildName={$currentGuild?.name || m.common.dashboard()}
  icon="fa-comment"
  ontabChange={(detail) => {
    if (detail.tabId === 'suggestions') {
      activeSubTab = '';
    } else if (detail.tabId === 'settings' && !activeSubTab) {
      activeSubTab = 'general';
    }
  }}
  subTabs={[
    { id: "general", label: m.common.basicSettings(), parentTab: "settings" },
    { id: "messages", label: m.common.messages(), parentTab: "settings" },
    { id: "channels", label: m.common.channels(), parentTab: "settings" },
    { id: "archive", label: m.common.archive(), parentTab: "settings" },
    { id: "emotes", label: m.suggestions.subtabEmotes(), parentTab: "settings" }
  ]}
  subtitle={m.suggestions.pageSubtitle()}
  tabs={[
    { id: "suggestions", label: m.features.suggestionsName(), icon: "fa-inbox" },
    { id: "settings", label: m.common.settings(), icon: "fa-gear" }
  ]}
  title={m.features.suggestionsName()}
>
  {#snippet statusMessages()}
    {#if showNotification}
      <div class="fixed top-4 right-4 z-50" transition:fade>
        <Notification message={notificationMessage} type={notificationType} />
      </div>
    {/if}
  {/snippet}


  <!-- Main Content -->
  {#if activeTab === 'suggestions'}
    <div class="space-y-6">
      {#if loading}
        <div class=" rounded-xl border p-12 transition-all"
             style="background: {$colorStore.primary}05; border-color: {$colorStore.primary}30;">
          <div class="flex flex-col items-center justify-center">
            <div class="w-12 h-12 border-4 rounded-full animate-spin mb-4"
                 style="border-color: {$colorStore.primary}20; border-top-color: {$colorStore.primary};"></div>
            <p class="text-sm" style="color: {$colorStore.muted}">{m.suggestions.loadingSuggestions()}</p>
          </div>
        </div>
      {:else if error}
        <div class=" rounded-xl border p-6 transition-all"
             style="background: #ef444410; border-color: #ef444430;">
          <div class="flex items-center gap-3">
            <i class="fa-utility-duo fa-regular fa-circle-exclamation"
               style="--fa-primary-color: #ef4444; --fa-secondary-color: #dc2626; font-size: 20px;"></i>
            <span style="color: #ef4444">{error}</span>
          </div>
        </div>
      {:else if sortedSuggestions.length === 0}
        <div class=" rounded-xl border p-12 transition-all text-center"
             style="background: {$colorStore.primary}05; border-color: {$colorStore.primary}30;">
          <i class="fa-utility-duo fa-regular fa-inbox"
             style="--fa-primary-color: {$colorStore.muted}; --fa-secondary-color: {$colorStore.muted}; font-size: 48px; display: block; margin: 0 auto 16px;"></i>
          <h3 class="text-xl font-bold mb-2" style="color: {$colorStore.text}">{m.suggestions.emptyTitle()}</h3>
          <p style="color: {$colorStore.muted}">{m.suggestions.emptyBody()}</p>
        </div>
      {:else}
        <!-- Sort Controls -->
        <div class="rounded-xl border p-3 md:p-4 mb-6 transition-all"
             style="background: {$colorStore.primary}05; border-color: {$colorStore.primary}30;">
          <div class="flex flex-col sm:flex-row flex-wrap gap-2 sm:gap-3 sm:items-center">
            <div class="flex items-center gap-2 w-full sm:w-auto">
              <span class="text-xs md:text-sm font-medium whitespace-nowrap"
                    style="color: {$colorStore.text}">{m.suggestions.sortLabel()}</span>
              <div class="flex-1 sm:flex-none">
                <DiscordSelector
                  type="custom"
                  options={[
                      { id: "dateAdded", name: m.suggestions.sortDate(), label: m.suggestions.sortDate() },
                      { id: "currentState", name: m.common.status(), label: m.common.status() }
                    ]}
                  selected={sortBy}
                  searchable={false}
                  placeholder={m.suggestions.sortPlaceholder()}
                  onchange={(e) => {
                    const selected = Array.isArray(e.selected) ? e.selected[0] : e.selected;
                    if (selected === "dateAdded" || selected === "currentState") {
                      sortBy = selected;
                    }
                  }}
                />
              </div>
            </div>
            <button aria-label={m.suggestions.sortToggleAria()}
                    class="px-3 py-1.5 md:px-4 md:py-2 rounded-lg border transition-all hover:scale-[1.02] flex items-center gap-1 md:gap-2 text-xs md:text-sm"
                    style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                    onclick={toggleSortDirection}
            >
              {#if sortDirection === 'asc'}
                <i class="fa-solid fa-arrow-up" style="font-size: 12px;"></i>
                <span class="hidden sm:inline">{m.common.ascending()}</span>
                <span class="sm:hidden">{m.suggestions.sortAscendingShort()}</span>
              {:else}
                <i class="fa-solid fa-arrow-down" style="font-size: 12px;"></i>
                <span class="hidden sm:inline">{m.common.descending()}</span>
                <span class="sm:hidden">{m.suggestions.sortDescendingShort()}</span>
              {/if}
            </button>
            <div class="ml-auto">
              <span class="text-xs md:text-sm" style="color: {$colorStore.muted}">
                {sortedSuggestions.length === 1 ? m.common.itemsOne({ count: sortedSuggestions.length }) : m.common.itemsOther({ count: sortedSuggestions.length })}
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
                      }) : m.common.unknown()}
                      <span
                        class="hidden sm:inline"> • {suggestion.dateAdded ? new Date(suggestion.dateAdded).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit'
                      }) : m.common.unknown()}</span>
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
                    <span>{m.common.idLabel({ id: String(suggestion.suggestionId) })}</span>
                  </div>
                  {#if suggestion.stateChangeUser}
                    <div class="flex items-center gap-1">
                      <i class="fa-solid fa-user" style="font-size: 12px;"></i>
                      <span>{m.suggestions.metaModifiedBy({ user: String(suggestion.stateChangeUser) })}</span>
                    </div>
                  {/if}
                  {#if suggestion.stateChangeCount}
                    <div class="flex items-center gap-1">
                      <i class="fa-solid fa-history" style="font-size: 12px;"></i>
                      <span>{m.suggestions.metaChanges({ count: String(suggestion.stateChangeCount) })}</span>
                    </div>
                  {/if}
                </div>

                <!-- Emote Counts -->
                {#if suggestion.emoteCounts}
                  <div class="flex flex-wrap gap-3 mb-4 p-3 rounded-lg" style="background: {$colorStore.primary}08;">
                    <span class="text-xs font-medium" style="color: {$colorStore.muted}">{m.suggestions.reactionsLabel()}</span>
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
                              style="color: {$colorStore.text}">{m.suggestions.emoteCountLabel({ number: 3, count: suggestion.emoteCounts.emote3 })}</span>
                      </div>
                    {/if}
                    {#if suggestion.emoteCounts.emote4 !== undefined && suggestion.emoteCounts.emote4 > 0}
                      <div class="flex items-center gap-1">
                        <span class="text-xs font-medium"
                              style="color: {$colorStore.text}">{m.suggestions.emoteCountLabel({ number: 4, count: suggestion.emoteCounts.emote4 })}</span>
                      </div>
                    {/if}
                    {#if suggestion.emoteCounts.emote5 !== undefined && suggestion.emoteCounts.emote5 > 0}
                      <div class="flex items-center gap-1">
                        <span class="text-xs font-medium"
                              style="color: {$colorStore.text}">{m.suggestions.emoteCountLabel({ number: 5, count: suggestion.emoteCounts.emote5 })}</span>
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
                          class="hidden sm:inline">{suggestion.currentState === SuggestionState.Accepted ? m.common.accepted() : m.suggestions.actionAccept()}</span>
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
                          class="hidden sm:inline">{suggestion.currentState === SuggestionState.Denied ? m.common.denied() : m.common.deny()}</span>
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
                          class="hidden sm:inline">{suggestion.currentState === SuggestionState.Considered ? m.suggestions.actionConsidered() : m.suggestions.actionConsider()}</span>
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
                          class="hidden sm:inline">{suggestion.currentState === SuggestionState.Implemented ? m.common.implemented() : m.suggestions.actionImplement()}</span>
                      </button>
                      <button
                        class="ml-auto px-3 py-2 md:px-4 rounded-lg text-xs md:text-sm font-medium flex items-center gap-1 md:gap-2 transition-all hover:scale-[1.02] hover:bg-red-500/20 focus:ring-2"
                        style="background: {$colorStore.muted}10; color: {$colorStore.muted}; border: 1px solid {$colorStore.muted}20; --tw-ring-color: {$colorStore.muted}50;"
                        onclick={async () => {
                            if (await requestConfirmation({ message: m.suggestions.confirmDelete(), confirmText: m.common.delete() })) {
                              deleteSuggestion(suggestion.id);
                            }
                          }}
                      >
                        <i class="fa-solid fa-trash" style="font-size: 14px;"></i>
                        <span class="hidden sm:inline">{m.common.delete()}</span>
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
                          {m.suggestions.confirmStatus({ status: getStatusString(showInlineConfirm[suggestion.id] || SuggestionState.Suggested) })}
                        </p>
                        <textarea
                          bind:value={inlineReasons[suggestion.id]}
                          class="w-full min-h-[60px] p-2 rounded-lg text-xs md:text-sm resize-none transition-all focus:ring-2"
                          style="background: {$colorStore.primary}10; border: 1px solid {$colorStore.primary}30; color: {$colorStore.text}; --tw-ring-color: {$colorStore.primary}50;"
                          placeholder={m.suggestions.confirmReasonPlaceholder()}
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
                          {m.common.cancel()}
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
                              <span class="text-xs">{m.suggestions.confirmUpdating()}</span>
                            </span>
                          {:else}
                            {m.common.confirm()}
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
            <h3 class="text-lg font-semibold" style="color: {$colorStore.text}">{m.suggestions.lengthTitle()}</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="space-y-2">
                <label for="min-length" class="block text-sm" style="color: {$colorStore.muted}">
                  {m.common.minimumLength()}
                </label>
                <input
                  id="min-length"
                  type="number"
                  min="0"
                  max="2000"
                  bind:value={minLength}
                  oninput={saveMinLength}
                  onblur={() => flushLength("minLength")}
                  class="w-full p-3 rounded-lg"
                  style="background: {$colorStore.primary}10;
                           border: 1px solid {$colorStore.primary}30;
                           color: {$colorStore.text};"
                >
              </div>
              <div class="space-y-2">
                <label for="max-length" class="block text-sm" style="color: {$colorStore.muted}">
                  {m.common.maximumLength()}
                </label>
                <input
                  id="max-length"
                  type="number"
                  min="0"
                  max="2000"
                  bind:value={maxLength}
                  oninput={saveMaxLength}
                  onblur={() => flushLength("maxLength")}
                  class="w-full p-3 rounded-lg"
                  style="background: {$colorStore.primary}10;
                           border: 1px solid {$colorStore.primary}30;
                           color: {$colorStore.text};"
                >
              </div>
            </div>
          </div>

          <div class="space-y-4">
            <h3 class="text-lg font-semibold" style="color: {$colorStore.text}">{m.suggestions.threadTitle()}</h3>
            <div class="space-y-2">
              <span id="thread-type-label" class="block text-sm" style="color: {$colorStore.muted}">{m.suggestions.threadType()}</span>
              <DiscordSelector
                type="custom"
                options={[
                    { id: "0", name: m.suggestions.threadNone(), label: m.suggestions.threadNone() },
                    { id: "1", name: m.suggestions.threadRegular(), label: m.suggestions.threadRegular() },
                    { id: "2", name: m.suggestions.threadPrivate(), label: m.suggestions.threadPrivate() }
                  ]}
                selected={threadType.toString()}
                searchable={false}
                placeholder={m.suggestions.threadTypePlaceholder()}
                onchange={(e) => {
                    const selected = Array.isArray(e.selected) ? e.selected[0] : e.selected;
                    setThreadType(parseInt(selected || "0"));
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
                {m.suggestions.messageSuggestionTitle()}
              </h3>
              <p class="text-xs mb-3" style="color: {$colorStore.muted}">
                {m.suggestions.messageSuggestionHint()}
              </p>
              <FullscreenEmbedBuilder
                bind:value={suggestionMessage}
                onclose={() => saveMessage("suggestionMessage", suggestionMessage)}
                previewTitle={m.suggestions.messageSuggestionTitle()}
                previewDescription={m.suggestions.messageSuggestionPreview()}
                allowComponents={false}
                allowContent={true}
                additionalPlaceholders={suggestionPlaceholders}
                placeholder={m.suggestions.messageSuggestionPlaceholder()}
                icon="fa-comment"
                guildId={$currentGuild?.id}
                user={data.user}
              />
            </div>

            <!-- Accept Message -->
            <div>
              <h3 class="text-base font-semibold mb-3" style="color: {$colorStore.text};">
                {m.suggestions.messageAcceptTitle()}
              </h3>
              <p class="text-xs mb-3" style="color: {$colorStore.muted}">
                {m.suggestions.messageAcceptHint()}
              </p>
              <FullscreenEmbedBuilder
                bind:value={acceptMessage}
                onclose={() => saveMessage("acceptMessage", acceptMessage)}
                previewTitle={m.suggestions.messageAcceptTitle()}
                previewDescription={m.suggestions.messageAcceptPreview()}
                allowComponents={false}
                allowContent={true}
                additionalPlaceholders={suggestionPlaceholders}
                placeholder={m.suggestions.messageAcceptPlaceholder()}
                icon="fa-check-circle"
                guildId={$currentGuild?.id}
                user={data.user}
              />
            </div>

            <!-- Deny Message -->
            <div>
              <h3 class="text-base font-semibold mb-3" style="color: {$colorStore.text};">
                {m.suggestions.messageDenyTitle()}
              </h3>
              <p class="text-xs mb-3" style="color: {$colorStore.muted}">
                {m.suggestions.messageDenyHint()}
              </p>
              <FullscreenEmbedBuilder
                bind:value={denyMessage}
                onclose={() => saveMessage("denyMessage", denyMessage)}
                previewTitle={m.suggestions.messageDenyTitle()}
                previewDescription={m.suggestions.messageDenyPreview()}
                allowComponents={false}
                allowContent={true}
                additionalPlaceholders={suggestionPlaceholders}
                placeholder={m.suggestions.messageDenyPlaceholder()}
                icon="fa-close"
                guildId={$currentGuild?.id}
                user={data.user}
              />
            </div>

            <!-- Consider Message -->
            <div>
              <h3 class="text-base font-semibold mb-3" style="color: {$colorStore.text};">
                {m.suggestions.messageConsiderTitle()}
              </h3>
              <p class="text-xs mb-3" style="color: {$colorStore.muted}">
                {m.suggestions.messageConsiderHint()}
              </p>
              <FullscreenEmbedBuilder
                bind:value={considerMessage}
                onclose={() => saveMessage("considerMessage", considerMessage)}
                previewTitle={m.suggestions.messageConsiderTitle()}
                previewDescription={m.suggestions.messageConsiderPreview()}
                allowComponents={false}
                allowContent={true}
                additionalPlaceholders={suggestionPlaceholders}
                placeholder={m.suggestions.messageConsiderPlaceholder()}
                icon="fa-lightbulb"
                guildId={$currentGuild?.id}
                user={data.user}
              />
            </div>

            <!-- Implement Message -->
            <div>
              <h3 class="text-base font-semibold mb-3" style="color: {$colorStore.text};">
                {m.suggestions.messageImplementTitle()}
              </h3>
              <p class="text-xs mb-3" style="color: {$colorStore.muted}">
                {m.suggestions.messageImplementHint()}
              </p>
              <FullscreenEmbedBuilder
                bind:value={implementMessage}
                onclose={() => saveMessage("implementMessage", implementMessage)}
                previewTitle={m.suggestions.messageImplementTitle()}
                previewDescription={m.suggestions.messageImplementPreview()}
                allowComponents={false}
                allowContent={true}
                additionalPlaceholders={suggestionPlaceholders}
                placeholder={m.suggestions.messageImplementPlaceholder()}
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
                    style="color: {$colorStore.muted}">{m.suggestions.channelSuggest()}</span>
              <DiscordSelector
                type="channel"
                options={channels}
                selected={suggestChannel}
                placeholder={m.suggestions.channelSuggestPlaceholder()}
                onchange={(e) => {
                    const selected = Array.isArray(e.selected) ? e.selected[0] : e.selected;
                    setChannel("suggestChannel", selected || "");
                  }}
              />
            </div>
            <div class="space-y-2">
              <span id="accept-channel-label" class="block text-sm"
                    style="color: {$colorStore.muted}">{m.suggestions.channelAccept()}</span>
              <DiscordSelector
                type="channel"
                options={channels}
                selected={acceptChannel}
                placeholder={m.suggestions.channelAcceptPlaceholder()}
                onchange={(e) => {
                    const selected = Array.isArray(e.selected) ? e.selected[0] : e.selected;
                    setChannel("acceptChannel", selected || "");
                  }}
              />
            </div>
            <div class="space-y-2">
              <span id="deny-channel-label" class="block text-sm" style="color: {$colorStore.muted}">{m.suggestions.channelDeny()}</span>
              <DiscordSelector
                type="channel"
                options={channels}
                selected={denyChannel}
                placeholder={m.suggestions.channelDenyPlaceholder()}
                onchange={(e) => {
                    const selected = Array.isArray(e.selected) ? e.selected[0] : e.selected;
                    setChannel("denyChannel", selected || "");
                  }}
              />
            </div>
            <div class="space-y-2">
              <span id="consider-channel-label" class="block text-sm" style="color: {$colorStore.muted}">{m.suggestions.channelConsider()}</span>
              <DiscordSelector
                type="channel"
                options={channels}
                selected={considerChannel}
                placeholder={m.suggestions.channelConsiderPlaceholder()}
                onchange={(e) => {
                    const selected = Array.isArray(e.selected) ? e.selected[0] : e.selected;
                    setChannel("considerChannel", selected || "");
                  }}
              />
            </div>
            <div class="space-y-2">
              <span id="implement-channel-label" class="block text-sm" style="color: {$colorStore.muted}">{m.suggestions.channelImplement()}</span>
              <DiscordSelector
                type="channel"
                options={channels}
                selected={implementChannel}
                placeholder={m.suggestions.channelImplementPlaceholder()}
                onchange={(e) => {
                    const selected = Array.isArray(e.selected) ? e.selected[0] : e.selected;
                    setChannel("implementChannel", selected || "");
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
            <span style="color: {$colorStore.text}">{m.suggestions.archiveOnAccept()}</span>
            <label class="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                class="sr-only peer"
                bind:checked={archiveOnAccept}
                onchange={() => saveArchive("archiveOnAccept")}
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
            <span style="color: {$colorStore.text}">{m.suggestions.archiveOnDeny()}</span>
            <label class="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                class="sr-only peer"
                bind:checked={archiveOnDeny}
                onchange={() => saveArchive("archiveOnDeny")}
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
            <span style="color: {$colorStore.text}">{m.suggestions.archiveOnConsider()}</span>
            <label class="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                class="sr-only peer"
                bind:checked={archiveOnConsider}
                onchange={() => saveArchive("archiveOnConsider")}
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
            <span style="color: {$colorStore.text}">{m.suggestions.archiveOnImplement()}</span>
            <label class="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                class="sr-only peer"
                bind:checked={archiveOnImplement}
                onchange={() => saveArchive("archiveOnImplement")}
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
            <h3 class="text-lg font-semibold" style="color: {$colorStore.text}">{m.suggestions.emoteModeTitle()}</h3>
            <div class="space-y-2">
              <span id="emote-mode-label" class="block text-sm" style="color: {$colorStore.muted}">{m.suggestions.emoteModeLabel()}</span>
              <DiscordSelector
                type="custom"
                options={[
                    { id: "0", name: m.features.wizardReactionEventsName(), label: m.features.wizardReactionEventsName() },
                    { id: "1", name: m.common.buttons(), label: m.common.buttons() }
                  ]}
                selected={emoteMode.toString()}
                searchable={false}
                placeholder={m.suggestions.emoteModePlaceholder()}
                onchange={(e) => {
                    const selected = Array.isArray(e.selected) ? e.selected[0] : e.selected;
                    setEmoteMode(parseInt(selected || "0"));
                  }}
              />
              <p class="text-xs" style="color: {$colorStore.muted}">
                {m.suggestions.emoteModeHint()}
              </p>
            </div>
          </div>

          <div class="space-y-2">
            <label for="f-+page-custom-emotes-1507" class="block text-sm" style="color: {$colorStore.muted}">{m.suggestions.emoteCustomLabel()}</label>
            <EmojiPicker id="f-+page-custom-emotes-1507"
              guildEmojis={guildEmojis}
              bind:selected={suggestEmotes}
              onchange={saveSuggestEmotes}
              multiple={true}
              maxSelection={5}
              placeholder={m.suggestions.emoteCustomPlaceholder()}
              showUnicodeEmojis={true}
            />
            <p class="text-xs" style="color: {$colorStore.muted}">
              {m.suggestions.emoteCustomHint()}
            </p>
          </div>

          <div class="space-y-4">
            <h3 class="text-lg font-semibold" style="color: {$colorStore.text}">{m.suggestions.buttonTitle()}</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="space-y-2">
                <label for="suggest-button-label" class="block text-sm" style="color: {$colorStore.muted}">{m.common.buttonLabel()}</label>
                <input
                  id="suggest-button-label"
                  type="text"
                  bind:value={suggestButtonLabel}
                  oninput={saveSuggestButtonLabel}
                  onblur={() => autoSave.flush("suggestButtonLabel")}
                  class="w-full p-3 rounded-lg"
                  style="background: {$colorStore.primary}10;
                           border: 1px solid {$colorStore.primary}30;
                           color: {$colorStore.text};"
                  placeholder={m.suggestions.buttonLabelPlaceholder()}
                >
              </div>
              <div class="space-y-2">
                <label for="f-+page-button-emote-1540" class="block text-sm" style="color: {$colorStore.muted}">{m.suggestions.buttonEmote()}</label>
                <EmojiPicker id="f-+page-button-emote-1540"
                  guildEmojis={guildEmojis}
                  bind:selected={suggestButtonEmote}
                  onchange={saveSuggestButtonEmote}
                  placeholder={m.suggestions.buttonEmotePlaceholder()}
                  showUnicodeEmojis={true}
                />
                <p class="text-xs" style="color: {$colorStore.muted}">
                  {m.suggestions.buttonEmoteHint()}
                </p>
              </div>
            </div>
            <div class="space-y-2">
              <label for="suggest-button-message" class="block text-sm" style="color: {$colorStore.muted}">{m.suggestions.buttonMessage()}</label>
              <FullscreenEmbedBuilder
                bind:value={suggestButtonMessage}
                onclose={() => saveMessage("suggestButtonMessage", suggestButtonMessage)}
                previewTitle={m.suggestions.buttonMessage()}
                previewDescription={m.suggestions.buttonMessagePreview()}
                icon="fa-comments"
                allowContent={true}
                allowComponents={false}
                additionalPlaceholders={suggestionPlaceholders}
                user={currentUser}
              />
            </div>
          </div>

          <div class="space-y-4">
            <h3 class="text-lg font-semibold" style="color: {$colorStore.text}">{m.suggestions.colorsTitle()}</h3>
            <div class="space-y-2">
              <span id="suggest-button-color-label" class="block text-sm" style="color: {$colorStore.muted}">{m.suggestions.colorsSuggestButton()}</span>
              <DiscordSelector
                type="custom"
                options={buttonColorOptions}
                selected={suggestButtonColor.toString()}
                searchable={false}
                placeholder={m.suggestions.colorsSuggestPlaceholder()}
                onchange={(e) => {
                    const selected = Array.isArray(e.selected) ? e.selected[0] : e.selected;
                    setSuggestButtonColor(parseInt(selected || "1"));
                  }}
              />
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div class="space-y-2">
                <span class="block text-sm" style="color: {$colorStore.muted}">{m.suggestions.colorsEmoteButton({ number: 1 })}</span>
                <DiscordSelector
                  type="custom"
                  options={buttonColorOptions}
                  selected={emote1Style.toString()}
                  searchable={false}
                  placeholder={m.suggestions.colorsPlaceholder()}
                  onchange={(e) => {
                      const selected = Array.isArray(e.selected) ? e.selected[0] : e.selected;
                      setEmoteStyle(1, parseInt(selected || "1"));
                    }}
                />
              </div>

              <div class="space-y-2">
                <span class="block text-sm" style="color: {$colorStore.muted}">{m.suggestions.colorsEmoteButton({ number: 2 })}</span>
                <DiscordSelector
                  type="custom"
                  options={buttonColorOptions}
                  selected={emote2Style.toString()}
                  searchable={false}
                  placeholder={m.suggestions.colorsPlaceholder()}
                  onchange={(e) => {
                      const selected = Array.isArray(e.selected) ? e.selected[0] : e.selected;
                      setEmoteStyle(2, parseInt(selected || "1"));
                    }}
                />
              </div>

              <div class="space-y-2">
                <span class="block text-sm" style="color: {$colorStore.muted}">{m.suggestions.colorsEmoteButton({ number: 3 })}</span>
                <DiscordSelector
                  type="custom"
                  options={buttonColorOptions}
                  selected={emote3Style.toString()}
                  searchable={false}
                  placeholder={m.suggestions.colorsPlaceholder()}
                  onchange={(e) => {
                      const selected = Array.isArray(e.selected) ? e.selected[0] : e.selected;
                      setEmoteStyle(3, parseInt(selected || "1"));
                    }}
                />
              </div>

              <div class="space-y-2">
                <span class="block text-sm" style="color: {$colorStore.muted}">{m.suggestions.colorsEmoteButton({ number: 4 })}</span>
                <DiscordSelector
                  type="custom"
                  options={buttonColorOptions}
                  selected={emote4Style.toString()}
                  searchable={false}
                  placeholder={m.suggestions.colorsPlaceholder()}
                  onchange={(e) => {
                      const selected = Array.isArray(e.selected) ? e.selected[0] : e.selected;
                      setEmoteStyle(4, parseInt(selected || "1"));
                    }}
                />
              </div>

              <div class="space-y-2">
                <span class="block text-sm" style="color: {$colorStore.muted}">{m.suggestions.colorsEmoteButton({ number: 5 })}</span>
                <DiscordSelector
                  type="custom"
                  options={buttonColorOptions}
                  selected={emote5Style.toString()}
                  searchable={false}
                  placeholder={m.suggestions.colorsPlaceholder()}
                  onchange={(e) => {
                      const selected = Array.isArray(e.selected) ? e.selected[0] : e.selected;
                      setEmoteStyle(5, parseInt(selected || "1"));
                    }}
                />
              </div>
            </div>
            <p class="text-xs" style="color: {$colorStore.muted}">
              {m.suggestions.colorsHint()}
            </p>
          </div>
        </div>
      {/if}

    </div>
  {/if}
</DashboardPageLayout>
