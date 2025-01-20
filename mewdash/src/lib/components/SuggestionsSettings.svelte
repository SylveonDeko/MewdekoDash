<!-- lib/dashboard/suggestions/SuggestionsSettings.svelte -->
<!-- lib/dashboard/suggestions/SuggestionsSettings.svelte -->
<script lang="ts">
  import { fade, slide } from "svelte/transition";
  import { api } from "$lib/api.ts";
  import { currentGuild } from "$lib/stores/currentGuild.ts";
  import { Archive, Hash, MessageSquare, Settings, Smile, Square } from "lucide-svelte";
  import { onMount } from "svelte";

  export let colors: any;
  export let showNotificationMessage: (message: string, type: "success" | "error") => void;

  // Settings state
  let settingsTab = "general";
  let changedSettings = new Set<string>();

  // Numeric values
  let minLength: number = 0;
  let maxLength: number = 2000;
  let threadType: number = 0;

  // Message templates - explicitly typed as string
  let acceptMessage: string = "";
  let denyMessage: string = "";
  let considerMessage: string = "";
  let implementMessage: string = "";

  // Channel IDs
  let acceptChannel: string = "";
  let denyChannel: string = "";
  let considerChannel: string = "";
  let implementChannel: string = "";
  let suggestChannel: string = "";

  // Boolean flags
  let archiveOnDeny: boolean = false;
  let archiveOnAccept: boolean = false;
  let archiveOnConsider: boolean = false;
  let archiveOnImplement: boolean = false;

  // Button settings
  let suggestEmotes: string = "";
  let suggestButtonMessage: string = "";
  let suggestButtonLabel: string = "";
  let suggestButtonEmote: string = "";
  let suggestButtonChannel: bigint | null = null;

  // Channel list
  let channels: Array<{ id: string; name: string }> = [];

  // Settings tabs
  const tabs = [
    { id: 'general', label: 'General', icon: Settings },
    { id: 'messages', label: 'Messages', icon: MessageSquare },
    { id: 'channels', label: 'Channels', icon: Hash },
    { id: 'buttons', label: 'Buttons', icon: Square },
    { id: 'archive', label: 'Archive', icon: Archive },
    { id: 'emotes', label: 'Emotes', icon: Smile }
  ];

  $: hasChanges = changedSettings.size > 0;

  function markAsChanged(setting: string) {
    changedSettings = changedSettings.add(setting);
  }

  async function loadSettings() {
    if (!$currentGuild?.id) return;
    try {
      const [
        fetchedMinLength,
        fetchedMaxLength,
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
        fetchedArchiveOnDeny,
        fetchedArchiveOnAccept,
        fetchedArchiveOnConsider,
        fetchedArchiveOnImplement,
        fetchedSuggestEmotes,
        fetchedButtonMessage,
        fetchedButtonLabel,
        fetchedButtonEmote,
        fetchedButtonChannel,
        fetchedChannels
      ] = await Promise.all([
        api.getMinLength($currentGuild.id),
        api.getMaxLength($currentGuild.id),
        api.getAcceptMessage($currentGuild.id),
        api.getDenyMessage($currentGuild.id),
        api.getConsiderMessage($currentGuild.id),
        api.getImplementMessage($currentGuild.id),
        api.getAcceptChannel($currentGuild.id),
        api.getDenyChannel($currentGuild.id),
        api.getConsiderChannel($currentGuild.id),
        api.getImplementChannel($currentGuild.id),
        api.getSuggestChannel($currentGuild.id),
        api.getSuggestThreadsType($currentGuild.id),
        api.getArchiveOnDeny($currentGuild.id),
        api.getArchiveOnAccept($currentGuild.id),
        api.getArchiveOnConsider($currentGuild.id),
        api.getArchiveOnImplement($currentGuild.id),
        api.getSuggestEmotes($currentGuild.id),
        api.getSuggestButtonMessage($currentGuild.id),
        api.getSuggestButtonLabel($currentGuild.id),
        api.getSuggestButtonEmote($currentGuild.id),
        api.getSuggestButtonChannel($currentGuild.id),
        api.getGuildTextChannels($currentGuild.id)
      ]);

      // Convert numeric values
      minLength = Number(fetchedMinLength) || 0;
      maxLength = Number(fetchedMaxLength) || 2000;
      threadType = Number(fetchedThreadType) || 0;

      // Convert message strings
      acceptMessage = fetchedAcceptMessage?.toString() || "";
      denyMessage = fetchedDenyMessage?.toString() || "";
      considerMessage = fetchedConsiderMessage?.toString() || "";
      implementMessage = fetchedImplementMessage?.toString() || "";

      // Convert channel IDs
      acceptChannel = fetchedAcceptChannel?.toString() || "";
      denyChannel = fetchedDenyChannel?.toString() || "";
      considerChannel = fetchedConsiderChannel?.toString() || "";
      implementChannel = fetchedImplementChannel?.toString() || "";
      suggestChannel = fetchedSuggestChannel?.toString() || "";

      // Convert boolean values
      archiveOnDeny = Boolean(fetchedArchiveOnDeny);
      archiveOnAccept = Boolean(fetchedArchiveOnAccept);
      archiveOnConsider = Boolean(fetchedArchiveOnConsider);
      archiveOnImplement = Boolean(fetchedArchiveOnImplement);

      // Convert button settings
      suggestEmotes = fetchedSuggestEmotes?.toString() || "";
      suggestButtonMessage = fetchedButtonMessage?.toString() || "";
      suggestButtonLabel = fetchedButtonLabel?.toString() || "";
      suggestButtonEmote = fetchedButtonEmote?.toString() || "";
      suggestButtonChannel = fetchedButtonChannel;

      // Ensure channels is an array
      channels = Array.isArray(fetchedChannels) ? fetchedChannels : [];
    } catch (err) {
      showNotificationMessage("Failed to load settings", "error");
    }
  }

  async function saveSettings() {
    if (!$currentGuild?.id || changedSettings.size === 0) return;

    try {
      const updatePromises = [];

      if (changedSettings.has("minLength")) {
        updatePromises.push(api.setMinLength($currentGuild.id, minLength));
      }
      if (changedSettings.has("maxLength")) {
        updatePromises.push(api.setMaxLength($currentGuild.id, maxLength));
      }
      if (changedSettings.has("acceptMessage")) {
        updatePromises.push(api.setAcceptMessage($currentGuild.id, acceptMessage || null));
      }
      if (changedSettings.has("denyMessage")) {
        updatePromises.push(api.setDenyMessage($currentGuild.id, denyMessage || null));
      }
      if (changedSettings.has("considerMessage")) {
        updatePromises.push(api.setConsiderMessage($currentGuild.id, considerMessage || null));
      }
      if (changedSettings.has("implementMessage")) {
        updatePromises.push(api.setImplementMessage($currentGuild.id, implementMessage || null));
      }
      if (changedSettings.has("acceptChannel")) {
        updatePromises.push(api.setAcceptChannel($currentGuild.id, acceptChannel ? BigInt(acceptChannel) : null));
      }
      if (changedSettings.has("denyChannel")) {
        updatePromises.push(api.setDenyChannel($currentGuild.id, denyChannel ? BigInt(denyChannel) : null));
      }
      if (changedSettings.has("considerChannel")) {
        updatePromises.push(api.setConsiderChannel($currentGuild.id, considerChannel ? BigInt(considerChannel) : null));
      }
      if (changedSettings.has("implementChannel")) {
        updatePromises.push(api.setImplementChannel($currentGuild.id, implementChannel ? BigInt(implementChannel) : null));
      }
      if (changedSettings.has("suggestChannel")) {
        updatePromises.push(api.setSuggestChannel($currentGuild.id, suggestChannel ? BigInt(suggestChannel) : null));
      }
      if (changedSettings.has("threadType")) {
        updatePromises.push(api.setSuggestThreadsType($currentGuild.id, threadType));
      }
      if (changedSettings.has("archiveOnDeny")) {
        updatePromises.push(api.setArchiveOnDeny($currentGuild.id, archiveOnDeny));
      }
      if (changedSettings.has("archiveOnAccept")) {
        updatePromises.push(api.setArchiveOnAccept($currentGuild.id, archiveOnAccept));
      }
      if (changedSettings.has("archiveOnConsider")) {
        updatePromises.push(api.setArchiveOnConsider($currentGuild.id, archiveOnConsider));
      }
      if (changedSettings.has("archiveOnImplement")) {
        updatePromises.push(api.setArchiveOnImplement($currentGuild.id, archiveOnImplement));
      }
      if (changedSettings.has("suggestEmotes")) {
        updatePromises.push(api.setSuggestEmotes($currentGuild.id, suggestEmotes || null));
      }
      if (changedSettings.has("suggestButtonMessage")) {
        updatePromises.push(api.setSuggestButtonMessage($currentGuild.id, suggestButtonMessage || null));
      }
      if (changedSettings.has("suggestButtonLabel")) {
        updatePromises.push(api.setSuggestButtonLabel($currentGuild.id, suggestButtonLabel || null));
      }
      if (changedSettings.has("suggestButtonEmote")) {
        updatePromises.push(api.setSuggestButtonEmote($currentGuild.id, suggestButtonEmote || null));
      }
      if (changedSettings.has("suggestButtonChannel")) {
        updatePromises.push(api.setSuggestButtonChannel($currentGuild.id, suggestButtonChannel));
      }

      await Promise.all(updatePromises);
      changedSettings.clear();
      showNotificationMessage("Settings saved successfully", "success");
    } catch (err) {
      showNotificationMessage("Failed to save settings", "error");
    }
  }

  function getBestTextColor(bgColor: string): string {
    // Convert the background color to RGB
    let color = bgColor.toLowerCase();

    // Handle rgba/rgb colors
    if (color.startsWith('rgba(') || color.startsWith('rgb(')) {
      const nums = color.replace(/rgba?\(|\)/g, '').split(',');
      const r = parseInt(nums[0], 10);
      const g = parseInt(nums[1], 10);
      const b = parseInt(nums[2], 10);

      // Calculate relative luminance
      const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

      return luminance > 0.5 ? '#000000' : '#FFFFFF';
    }

    // Handle hex colors
    if (color.startsWith('#')) {
      color = color.replace('#', '');
      if (color.length === 3) {
        color = color.split('').map(char => char + char).join('');
      }

      const r = parseInt(color.substr(0, 2), 16);
      const g = parseInt(color.substr(2, 2), 16);
      const b = parseInt(color.substr(4, 2), 16);

      const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

      return luminance > 0.5 ? '#000000' : '#FFFFFF';
    }

    // Default to white text if color format is unknown
    return '#FFFFFF';
  }

  onMount(() => {
    loadSettings();
  });
</script>

<div class="space-y-6" transition:fade>
  <!-- Settings Navigation -->
  <div class="relative -mx-4 px-4 md:mx-0 md:px-0">
    <div class="overflow-x-auto scrollbar-hide pb-2">
      <div class="flex space-x-2 min-w-max">
        {#each tabs as tab}
          <button
            class="px-3 py-2 md:px-4 md:py-2 rounded-lg flex items-center gap-2 text-sm md:text-base
          transition-colors duration-200 whitespace-nowrap"
            style="background: {settingsTab === tab.id ? colors.primary : `${colors.primary}20`};
                 color: {getBestTextColor(settingsTab === tab.id ? colors.primary : `${colors.primary}20`)};"
            on:click={() => settingsTab = tab.id}
            aria-selected={settingsTab === tab.id}
            role="tab"
          >
            <svelte:component this={tab.icon} class="w-4 h-4" />
            <span class="hidden sm:inline">{tab.label}</span>
            <span class="sm:hidden">{tab.label.charAt(0)}</span>
          </button>
        {/each}
      </div>
    </div>
  </div>

  <!-- Settings Content -->
  <div class="space-y-6">
    <!-- General Settings -->
    {#if settingsTab === 'general'}
      <div class="backdrop-blur-sm rounded-xl border p-4 md:p-6 shadow-xl"
           style="background: linear-gradient(135deg, {colors.gradientStart}10, {colors.gradientMid}15);
                border-color: {colors.primary}30;">
        <h3 class="text-base md:text-lg font-semibold mb-4" style="color: {colors.text}">Length Settings</h3>
        <div class="grid gap-4 md:grid-cols-2">
          <div class="space-y-2">
            <label for="min-length" class="block text-sm font-medium" style="color: {colors.muted}">
              Minimum Length
            </label>
            <input
              id="min-length"
              type="number"
              min="0"
              bind:value={minLength}
              on:input={() => markAsChanged('minLength')}
              class="w-full bg-gray-800 rounded-lg border px-3 py-2 transition-colors duration-200"
              style="border-color: {colors.primary}30;
                     color: {colors.text};"
            />
          </div>
          <div class="space-y-2">
            <label for="max-length" class="block text-sm font-medium" style="color: {colors.muted}">
              Maximum Length
            </label>
            <input
              id="max-length"
              type="number"
              min="0"
              bind:value={maxLength}
              on:input={() => markAsChanged('maxLength')}
              class="w-full bg-gray-800 rounded-lg border px-3 py-2 transition-colors duration-200"
              style="border-color: {colors.primary}30;
                     color: {colors.text};"
            />
          </div>
        </div>

        <div class="mt-6 space-y-2">
          <label for="thread-type" class="block text-sm font-medium" style="color: {colors.muted}">
            Thread Type
          </label>
          <select
            id="thread-type"
            bind:value={threadType}
            on:change={() => markAsChanged('threadType')}
            class="w-full bg-gray-800 rounded-lg border px-3 py-2 transition-colors duration-200"
            style="border-color: {colors.primary}30;
                   color: {colors.text};"
          >
            <option value={0}>No Threads</option>
            <option value={1}>Regular Threads</option>
            <option value={2}>Private Threads</option>
          </select>
        </div>
      </div>
    {/if}

    <!-- Messages Settings -->
    {#if settingsTab === 'messages'}
      <div class="space-y-4">
        <div
          class="backdrop-blur-sm rounded-xl border p-6 shadow-xl"
          style="background: linear-gradient(135deg, {colors.gradientStart}10, {colors.gradientMid}15);
                 border-color: {colors.primary}30;"
        >
          <label class="block text-sm font-medium mb-2" style="color: {colors.muted}">
            Accept Message
          </label>
          <textarea
            class="w-full bg-gray-800 rounded-lg border px-3 py-2 min-h-[120px] resize-y
                   transition-colors duration-200 focus:ring-2"
            style="border-color: {colors.primary}30;
                   color: {colors.text};
                   focus:ring-color: {colors.primary}50;"
            bind:value={acceptMessage}
            on:input={() => markAsChanged('acceptMessage')}
            placeholder="Enter message template..."
          ></textarea>
          <p class="mt-2 text-xs" style="color: {colors.muted}">
            Supports placeholders like %suggest.user%, %suggest.message%, etc.
          </p>
        </div>

        <div
          class="backdrop-blur-sm rounded-xl border p-6 shadow-xl"
          style="background: linear-gradient(135deg, {colors.gradientStart}10, {colors.gradientMid}15);
                 border-color: {colors.primary}30;"
        >
          <label class="block text-sm font-medium mb-2" style="color: {colors.muted}">
            Deny Message
          </label>
          <textarea
            class="w-full bg-gray-800 rounded-lg border px-3 py-2 min-h-[120px] resize-y
                   transition-colors duration-200 focus:ring-2"
            style="border-color: {colors.primary}30;
                   color: {colors.text};
                   focus:ring-color: {colors.primary}50;"
            bind:value={denyMessage}
            on:input={() => markAsChanged('denyMessage')}
            placeholder="Enter message template..."
          ></textarea>
          <p class="mt-2 text-xs" style="color: {colors.muted}">
            Supports placeholders like %suggest.user%, %suggest.message%, etc.
          </p>
        </div>

        <div
          class="backdrop-blur-sm rounded-xl border p-6 shadow-xl"
          style="background: linear-gradient(135deg, {colors.gradientStart}10, {colors.gradientMid}15);
                 border-color: {colors.primary}30;"
        >
          <label class="block text-sm font-medium mb-2" style="color: {colors.muted}">
            Consider Message
          </label>
          <textarea
            class="w-full bg-gray-800 rounded-lg border px-3 py-2 min-h-[120px] resize-y
                   transition-colors duration-200 focus:ring-2"
            style="border-color: {colors.primary}30;
                   color: {colors.text};
                   focus:ring-color: {colors.primary}50;"
            bind:value={considerMessage}
            on:input={() => markAsChanged('considerMessage')}
            placeholder="Enter message template..."
          ></textarea>
          <p class="mt-2 text-xs" style="color: {colors.muted}">
            Supports placeholders like %suggest.user%, %suggest.message%, etc.
          </p>
        </div>

        <div
          class="backdrop-blur-sm rounded-xl border p-6 shadow-xl"
          style="background: linear-gradient(135deg, {colors.gradientStart}10, {colors.gradientMid}15);
                 border-color: {colors.primary}30;"
        >
          <label class="block text-sm font-medium mb-2" style="color: {colors.muted}">
            Implement Message
          </label>
          <textarea
            class="w-full bg-gray-800 rounded-lg border px-3 py-2 min-h-[120px] resize-y
                   transition-colors duration-200 focus:ring-2"
            style="border-color: {colors.primary}30;
                   color: {colors.text};
                   focus:ring-color: {colors.primary}50;"
            bind:value={implementMessage}
            on:input={() => markAsChanged('implementMessage')}
            placeholder="Enter message template..."
          ></textarea>
          <p class="mt-2 text-xs" style="color: {colors.muted}">
            Supports placeholders like %suggest.user%, %suggest.message%, etc.
          </p>
        </div>
      </div>
    {/if}

    <!-- Channels Settings -->
    {#if settingsTab === 'channels'}
      <div class="space-y-4">
        {#each [
          { label: 'Suggest Channel', value: suggestChannel, key: 'suggestChannel' },
          { label: 'Accept Channel', value: acceptChannel, key: 'acceptChannel' },
          { label: 'Deny Channel', value: denyChannel, key: 'denyChannel' },
          { label: 'Consider Channel', value: considerChannel, key: 'considerChannel' },
          { label: 'Implement Channel', value: implementChannel, key: 'implementChannel' }
        ] as channel}
          <div
            class="backdrop-blur-sm rounded-xl border p-6 shadow-xl"
            style="background: linear-gradient(135deg, {colors.gradientStart}10, {colors.gradientMid}15);
                   border-color: {colors.primary}30;"
          >
            <label class="block text-sm font-medium mb-2" style="color: {colors.muted}">
              {channel.label}
            </label>
            <select
              class="w-full bg-gray-800 rounded-lg border px-3 py-2 transition-colors duration-200"
              style="border-color: {colors.primary}30;
                     color: {colors.text};"
              bind:value={channel.value}
              on:change={() => markAsChanged(channel.key)}
            >
              <option value="">Select Channel</option>
              {#each channels as ch}
                <option value={ch.id}>#{ch.name}</option>
              {/each}
            </select>
          </div>
        {/each}
      </div>
    {/if}

    <!-- Buttons Settings -->
    {#if settingsTab === 'buttons'}
      <div
        class="backdrop-blur-sm rounded-xl border p-6 shadow-xl"
        style="background: linear-gradient(135deg, {colors.gradientStart}10, {colors.gradientMid}15);
               border-color: {colors.primary}30;"
      >
        <h3 class="text-lg font-semibold mb-4" style="color: {colors.text}">Button Settings</h3>
        <div class="space-y-4">
          <div class="space-y-2">
            <label for="button-channel" class="block text-sm font-medium" style="color: {colors.muted}">
              Button Channel
            </label>
            <select
              id="button-channel"
              class="w-full bg-gray-800 rounded-lg border px-3 py-2 transition-colors duration-200"
              style="border-color: {colors.primary}30;
                     color: {colors.text};"
              bind:value={suggestButtonChannel}
              on:change={() => markAsChanged('suggestButtonChannel')}
            >
              <option value="">Select Channel</option>
              {#each channels as ch}
                <option value={ch.id}>#{ch.name}</option>
              {/each}
            </select>
          </div>

          <div class="space-y-2">
            <label for="button-message" class="block text-sm font-medium" style="color: {colors.muted}">
              Button Message
            </label>
            <input
              id="button-message"
              type="text"
              bind:value={suggestButtonMessage}
              class="w-full bg-gray-800 rounded-lg border px-3 py-2 transition-colors duration-200"
              style="border-color: {colors.primary}30;
                     color: {colors.text};"
              placeholder="Enter button message..."
              on:input={() => markAsChanged('suggestButtonMessage')}
            />
          </div>

          <div class="space-y-2">
            <label for="button-label" class="block text-sm font-medium" style="color: {colors.muted}">
              Button Label
            </label>
            <input
              id="button-label"
              type="text"
              bind:value={suggestButtonLabel}
              class="w-full bg-gray-800 rounded-lg border px-3 py-2 transition-colors duration-200"
              style="border-color: {colors.primary}30;
                     color: {colors.text};"
              placeholder="Enter button label..."
              on:input={() => markAsChanged('suggestButtonLabel')}
            />
          </div>

          <div class="space-y-2">
            <label for="button-emote" class="block text-sm font-medium" style="color: {colors.muted}">
              Button Emote
            </label>
            <input
              id="button-emote"
              type="text"
              bind:value={suggestButtonEmote}
              class="w-full bg-gray-800 rounded-lg border px-3 py-2 transition-colors duration-200"
              style="border-color: {colors.primary}30;
                     color: {colors.text};"
              placeholder="Enter button emote..."
              on:input={() => markAsChanged('suggestButtonEmote')}
            />
          </div>
        </div>
      </div>
    {/if}

    <!-- Archive Settings -->
    {#if settingsTab === 'archive'}
      <div
        class="backdrop-blur-sm rounded-xl border p-6 shadow-xl"
        style="background: linear-gradient(135deg, {colors.gradientStart}10, {colors.gradientMid}15);
               border-color: {colors.primary}30;"
      >
        <h3 class="text-lg font-semibold mb-4" style="color: {colors.text}">Archive Settings</h3>
        <div class="space-y-3">
          {#each [
            { label: 'Archive on Deny', value: archiveOnDeny, key: 'archiveOnDeny' },
            { label: 'Archive on Accept', value: archiveOnAccept, key: 'archiveOnAccept' },
            { label: 'Archive on Consider', value: archiveOnConsider, key: 'archiveOnConsider' },
            { label: 'Archive on Implement', value: archiveOnImplement, key: 'archiveOnImplement' }
          ] as archive}
            <label
              class="flex items-center justify-between p-2 hover:bg-gray-800 rounded-lg transition-colors"
            >
              <span class="text-sm font-medium" style="color: {colors.text}">{archive.label}</span>
              <div class="relative inline-flex items-center">
                <input
                  type="checkbox"
                  class="sr-only peer"
                  bind:checked={archive.value}
                  on:change={() => markAsChanged(archive.key)}
                />
                <div
                  class="w-11 h-6 rounded-full transition-colors duration-200 after:content-['']
                         after:absolute after:top-[2px] after:left-[2px] after:bg-white
                         after:rounded-full after:h-5 after:w-5 after:transition-all
                         peer-checked:after:translate-x-full"
                  style="background: {archive.value ? colors.primary : `${colors.primary}20`};"
                >
                </div>
              </div>
            </label>
          {/each}
        </div>
      </div>
    {/if}

    <!-- Emotes Settings -->
    {#if settingsTab === 'emotes'}
      <div
        class="backdrop-blur-sm rounded-xl border p-6 shadow-xl"
        style="background: linear-gradient(135deg, {colors.gradientStart}10, {colors.gradientMid}15);
               border-color: {colors.primary}30;"
      >
        <h3 class="text-lg font-semibold mb-4" style="color: {colors.text}">Emote Settings</h3>
        <div class="space-y-2">
          <label for="suggest-emotes" class="block text-sm font-medium" style="color: {colors.muted}">
            Custom Emotes
          </label>
          <input
            id="suggest-emotes"
            type="text"
            bind:value={suggestEmotes}
            class="w-full bg-gray-800 rounded-lg border px-3 py-2 transition-colors duration-200"
            style="border-color: {colors.primary}30;
                   color: {colors.text};"
            placeholder="Enter emotes separated by commas"
            on:input={() => markAsChanged('suggestEmotes')}
          />
          <p class="mt-2 text-sm" style="color: {colors.muted}">
            Enter custom emotes separated by commas. Use Discord emoji format.
          </p>
        </div>
      </div>
    {/if}
  </div>

  <!-- Save Button -->
  {#if hasChanges}
    <div
      class="fixed bottom-0 left-0 right-0 p-4 backdrop-blur-sm border-t z-50"
      style="background: {colors.gradientStart}90;
           border-color: {colors.primary}30;"
      transition:slide
    >
      <div class="max-w-7xl mx-auto flex justify-end">
        <button
          class="px-4 md:px-6 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2"
          style="background: {colors.primary};
               color: {getBestTextColor(colors.primary)};"
          on:click={saveSettings}
        >
          <Settings class="w-4 h-4" />
          <span class="hidden sm:inline">Save Changes</span>
          <span class="sm:hidden">Save</span>
        </button>
      </div>
    </div>
  {/if}
</div>

<style lang="postcss">
    /* Hide scrollbar for settings tabs */
    .scrollbar-hide {
        -ms-overflow-style: none;
        scrollbar-width: none;
    }

    .scrollbar-hide::-webkit-scrollbar {
        display: none;
    }

    /* Improve focus states */
    button:focus,
    input:focus,
    select:focus,
    textarea:focus {
        @apply outline-none ring-2 ring-opacity-50;
    }

    /* Ensure proper text contrast */
    select option {
        @apply bg-gray-800 text-white;
    }

    /* Add smooth transitions */
    button, input, select, textarea {
        @apply transition-all duration-200;
    }

    /* Improved touch targets on mobile */
    @media (max-width: 768px) {
        button, input, select {
            @apply min-h-[44px];
        }
    }

    /* Custom select styling */
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

    /* Custom scrollbar */
    :global(*::-webkit-scrollbar) {
        @apply w-2;
    }

    :global(*::-webkit-scrollbar-track) {
        background: var(--color-primary)10;
        @apply rounded-full;
    }

    :global(*::-webkit-scrollbar-thumb) {
        background: var(--color-primary)30;
        @apply rounded-full;
    }

    :global(*::-webkit-scrollbar-thumb:hover) {
        background: var(--color-primary)50;
    }

    /* Improve input number spinners */
    input[type="number"]::-webkit-inner-spin-button,
    input[type="number"]::-webkit-outer-spin-button {
        -webkit-appearance: none;
        margin: 0;
    }

    input[type="number"] {
        -moz-appearance: textfield;
    }

    /* Textarea styling */
    textarea {
        @apply resize-y min-h-[120px];
    }

    /* Custom checkbox styling */
    input[type="checkbox"]:checked + div {
        @apply bg-blue-600;
    }

    input[type="checkbox"]:checked + div::after {
        @apply translate-x-full;
    }

    input[type="checkbox"]:focus + div {
        @apply ring-2 ring-blue-500 ring-opacity-50;
    }

    /* Improve mobile touch targets */
    @media (max-width: 768px) {
        button, input, select, textarea {
            @apply min-h-[48px]; /* Larger touch targets on mobile */
        }

        input, select {
            @apply text-base; /* Prevent zoom on iOS */
        }

        .backdrop-blur-sm {
            @apply mx-[-1rem] px-4 rounded-none md:mx-0 md:px-6 md:rounded-xl;
        }
    }

    /* Adjust spacing for mobile */
    .space-y-6 > * {
        @apply my-4 md:my-6;
    }

    /* Improve form layout on mobile */
    .grid {
        @apply gap-3 md:gap-4;
    }
</style>