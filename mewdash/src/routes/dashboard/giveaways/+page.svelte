<!-- routes/dashboard/giveaways/+page.svelte -->
<script lang="ts">


  import { onMount } from "svelte";
  import { giveawaysApi, clientApi, type Giveaway } from "$lib/api/index.ts";
  import { currentGuild } from "$lib/stores/currentGuild.ts";
  import { fade, slide } from "svelte/transition";
  import { goto } from "$app/navigation";
  import Notification from "$lib/components/ui/Notification.svelte";
  import DashboardPageLayout from "$lib/components/layout/DashboardPageLayout.svelte";
  import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";
  import IntervalPicker from "$lib/components/forms/IntervalPicker.svelte";
  import { colorStore } from "$lib/stores/colorStore.ts";
  import { logger } from "$lib/logger.ts";
  import { loadingStore } from "$lib/stores/loadingStore";

  let giveaways: Giveaway[] = $state([]);
  let expandedGiveaway: number | null = $state(null);
  let loading = $state(true);
  let error: string | null = $state(null);
  let showNotification = $state(false);
  let notificationMessage = $state("");
  let notificationType: "success" | "error" = $state("success");
  let guildRoles: Array<{ id: string; name: string }> = $state([]);
  let selectedRoles: string[] = $state([]);
  let entryMethod: "reaction" | "button" | "captcha" = $state("reaction");

  // Layout state
  let activeTab = $state("active");

  const tabs = [
    { id: "active", label: "Active Giveaways", icon: "fa-gift" },
    { id: "create", label: "Create Giveaway", icon: "fa-plus" },
    { id: "ended", label: "Ended Giveaways", icon: "fa-trophy" }
  ];

  let newGiveaway: Partial<Giveaway> = $state({
    item: "",
    winners: 1,
    channelId: BigInt(0),
    when: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    restrictTo: "",
    useButton: false,
    useCaptcha: false,
    messageCountReq: BigInt(0),
    serverId: BigInt(0),
    userId: BigInt(0),
    ended: 0,
    messageId: BigInt(0),
    emote: ""
  });

  let colors = $derived($colorStore);

  function validateGiveaway(): string | null {
    if (!newGiveaway.item || newGiveaway.item.trim() === "") {
      return "Please enter a valid giveaway item.";
    }
    if (!newGiveaway.winners || newGiveaway.winners < 1) {
      return "The number of winners must be at least 1.";
    }
    if (!newGiveaway.channelId || newGiveaway.channelId <= BigInt(0)) {
      return "Please enter a valid channel ID.";
    }
    if (!newGiveaway.when || new Date(newGiveaway.when) <= new Date()) {
      return "The end time must be in the future.";
    }
    if (newGiveaway.messageCountReq !== undefined && newGiveaway.messageCountReq < BigInt(0)) {
      return "The required message count cannot be negative.";
    }
    return null;
  }

  function handleEntryMethodChange(method: "reaction" | "button" | "captcha") {
    entryMethod = method;
    newGiveaway.useButton = method === "button";
    newGiveaway.useCaptcha = method === "captcha";
  }

  async function fetchGiveaways() {
    return await loadingStore.wrap("fetch-giveaways", async () => {
      try {
        loading = true;
        error = null;
        if (!$currentGuild?.id) throw new Error("No guild selected");
        giveaways = await giveawaysApi.getGiveaways($currentGuild.id);
      } catch (err) {
        logger.error("Failed to fetch giveaways:", err);
        error = (err as Error).message || "Failed to fetch giveaways";
      } finally {
        loading = false;
      }
    }, "api", "Loading giveaways...");
  }

  async function loadGuildRoles() {
    try {
      if (!$currentGuild?.id) throw new Error("No guild selected");
      guildRoles = await clientApi.getRoles($currentGuild.id);
    } catch (err) {
      logger.error("Failed to fetch guild roles:", err);
    }
  }

  async function createGiveaway() {
    try {
      const validationError = validateGiveaway();
      if (validationError) {
        showNotificationMessage(validationError, "error");
        return;
      }
      if (!$currentGuild?.id) throw new Error("No guild selected");
      newGiveaway.serverId = BigInt($currentGuild.id);
      await giveawaysApi.createGiveaway($currentGuild.id, newGiveaway);
      showNotificationMessage("Giveaway created successfully", "success");
      await fetchGiveaways();
      resetNewGiveaway();
    } catch (error) {
      const errMsg = (error as Error).message || "Unknown error";
      showNotificationMessage("Failed to create giveaway: " + errMsg, "error");
    }
  }

  async function endGiveaway(giveawayId: number) {
    try {
      if (!$currentGuild?.id) throw new Error("No guild selected");
      await giveawaysApi.endGiveaway($currentGuild.id, giveawayId);
      showNotificationMessage("Giveaway ended successfully", "success");
      await fetchGiveaways();
    } catch (error) {
      const errMsg = (error as Error).message || "Unknown error";
      showNotificationMessage("Failed to end giveaway: " + errMsg, "error");
    }
  }

  function toggleGiveawayExpand(id: number) {
    expandedGiveaway = expandedGiveaway === id ? null : id;
  }

  function resetNewGiveaway() {
    newGiveaway = {
      item: "",
      winners: 1,
      channelId: BigInt(0),
      when: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      restrictTo: "",
      useButton: false,
      useCaptcha: false,
      messageCountReq: BigInt(0),
      serverId: BigInt(0),
      userId: BigInt(0),
      ended: 0,
      messageId: BigInt(0),
      emote: ""
    };
    selectedRoles = [];
    entryMethod = "reaction";
  }

  function showNotificationMessage(message: string, type: "success" | "error" = "success") {
    notificationMessage = message;
    notificationType = type;
    showNotification = true;
    setTimeout(() => {
      showNotification = false;
    }, 3000);
  }

  function handleDurationChange(endTime: Date) {
    newGiveaway.when = endTime.toISOString();
  }

  function handleWinnersChange(event: Event) {
    const input = event.target as HTMLInputElement;
    const value = parseInt(input.value);
    if (value < 1) {
      input.value = "1";
      newGiveaway.winners = 1;
      showNotificationMessage("The number of winners must be at least 1.", "error");
    } else {
      newGiveaway.winners = value;
    }
  }

  function handleMessageCountChange(event: Event) {
    const input = event.target as HTMLInputElement;
    const value = BigInt(input.value);
    if (value < BigInt(0)) {
      input.value = "0";
      newGiveaway.messageCountReq = BigInt(0);
      showNotificationMessage("The required message count cannot be negative.", "error");
    } else {
      newGiveaway.messageCountReq = value;
    }
  }

  function handleKeyDown(event: KeyboardEvent, giveawayId: number) {
    if (event.key === "Enter" || event.key === " ") {
      toggleGiveawayExpand(giveawayId);
    }
  }

  // Reactive statements
  $effect(() => {
    if ($currentGuild) {
      fetchGiveaways();
      loadGuildRoles();
    }
  });

  onMount(async () => {
    if (!$currentGuild) await goto("/dashboard");
    await Promise.all([fetchGiveaways(), loadGuildRoles()]);
  });
</script>

{#snippet statusMessageContent()}
  {#if showNotification}
    <div class="fixed top-4 right-4 z-50" transition:fade>
      <Notification message={notificationMessage} type={notificationType} />
    </div>
  {/if}
{/snippet}

<DashboardPageLayout
  bind:activeTab
  guildName={$currentGuild?.name || "Dashboard"}
  icon="fa-gift"
  subtitle="Manage server giveaways and prizes"
  tabs={tabs}
  title="Giveaways"
  statusMessages={statusMessageContent}
>

  {#if loading}
    <div class="flex justify-center items-center min-h-[400px]">
      <div class="relative">
        <div
          class="w-16 h-16 border-4 rounded-full animate-spin"
          style="border-color: {colors.primary}20; border-top-color: {colors.primary}"
        ></div>
        <span class="mt-4 block text-center" style="color: {colors.muted}">Loading giveaways...</span>
      </div>
    </div>
  {:else if error}
    <div
      class="p-6 rounded-xl mb-6"
      style="background: {colors.accent}10; border: 1px solid {colors.accent}40;"
      role="alert"
    >
      <div class="flex items-center gap-3">
        <i class="fa-solid fa-triangle-exclamation" style="color: {colors.accent}; font-size: 24px;"></i>
        <div style="color: {colors.accent}">
          <div class="font-semibold text-lg">Error Occurred</div>
          <div class="text-sm mt-1" style="color: {colors.accent}90">{error}</div>
        </div>
      </div>
    </div>
  {:else}
    {#if activeTab === 'create'}
      <!-- Create New Giveaway Section -->
      <section
        class=" rounded-xl border p-6 mb-8 transition-all"
        style="background: linear-gradient(135deg, {colors.gradientStart}10, {colors.gradientMid}15);
              border-color: {colors.primary}30;"
        transition:fade
      >
        <h2 class="text-xl font-semibold mb-6 flex items-center gap-2" style="color: {colors.text}">
          <i class="fa-solid fa-trophy" style="color: {colors.primary}; font-size: 24px;"></i>
          Create New Giveaway
        </h2>

        <form onsubmit={(e) => { e.preventDefault(); createGiveaway(); }} class="space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Giveaway Item -->
            <div class="space-y-2">
              <label for="giveaway-item" class="flex items-center gap-2 text-sm font-medium"
                     style="color: {colors.text}">
                <i class="fa-solid fa-gift" style="color: {colors.primary}; font-size: 16px;"></i>
                Giveaway Item
              </label>
              <input
                id="giveaway-item"
                bind:value={newGiveaway.item}
                placeholder="Enter the item to be given away"
                class="w-full p-3 rounded-lg border focus:ring-2"
                style="background: {colors.primary}08;
                      border-color: {colors.primary}30;
                      color: {colors.text}"
                required
              >
            </div>

            <!-- Winners Count -->
            <div class="space-y-2">
              <label for="giveaway-winners" class="flex items-center gap-2 text-sm font-medium"
                     style="color: {colors.text}">
                <i class="fa-solid fa-star" style="color: {colors.primary}; font-size: 16px;"></i>
                Number of Winners
              </label>
              <input
                id="giveaway-winners"
                type="number"
                bind:value={newGiveaway.winners}
                min="1"
                onchange={handleWinnersChange}
                class="w-full p-3 rounded-lg border focus:ring-2"
                style="background: {colors.primary}08;
                      border-color: {colors.primary}30;
                      color: {colors.text}"
                required
              >
            </div>

            <!-- Channel ID -->
            <div class="space-y-2 md:col-span-2">
              <label for="giveaway-channel" class="flex items-center gap-2 text-sm font-medium"
                     style="color: {colors.text}">
                <i class="fa-solid fa-hashtag" style="color: {colors.primary}; font-size: 16px;"></i>
                Channel
              </label>
              <input
                id="giveaway-channel"
                bind:value={newGiveaway.channelId}
                placeholder="Enter channel ID"
                class="w-full p-3 rounded-lg border focus:ring-2"
                style="background: {colors.primary}08;
                      border-color: {colors.primary}30;
                      color: {colors.text}"
                required
                inputmode="numeric"
                pattern="[0-9]*"
              >
            </div>

            <!-- Duration -->
            <div class="space-y-2 md:col-span-2">
              <label for="giveaway-duration" class="flex items-center gap-2 text-sm font-medium"
                     style="color: {colors.text}">
                <i class="fa-solid fa-clock" style="color: {colors.primary}; font-size: 16px;"></i>
                Duration
              </label>
              <IntervalPicker onchange={handleDurationChange} />
            </div>

            <!-- Required Roles -->
            <div class="space-y-2 md:col-span-2">
              <label for="giveaway-roles" class="flex items-center gap-2 text-sm font-medium"
                     style="color: {colors.text}">
                <i class="fa-solid fa-users" style="color: {colors.primary}; font-size: 16px;"></i>
                Required Roles
              </label>
              <DiscordSelector
                type="role"
                options={guildRoles}
                bind:selected={selectedRoles}
                multiple={true}
                onchange={(detail) => {
                  selectedRoles = Array.isArray(detail.selected) ? detail.selected : [];
                  newGiveaway.restrictTo = selectedRoles.join(" ");
                }}
                placeholder="Select required roles"
              />
            </div>

            <!-- Message Count Requirement -->
            <div class="space-y-2 md:col-span-2">
              <label for="giveaway-message-count" class="flex items-center gap-2 text-sm font-medium"
                     style="color: {colors.text}">
                <i class="fa-solid fa-message" style="color: {colors.primary}; font-size: 16px;"></i>
                Required Message Count
              </label>
              <input
                id="giveaway-message-count"
                type="number"
                bind:value={newGiveaway.messageCountReq}
                min="0"
                onchange={handleMessageCountChange}
                class="w-full p-3 rounded-lg border focus:ring-2"
                style="background: {colors.primary}08;
                      border-color: {colors.primary}30;
                      color: {colors.text}"
                inputmode="numeric"
                pattern="[0-9]*"
              >
            </div>
          </div>

          <!-- Entry Method -->
          <div class="space-y-4 pt-4 border-t" style="border-color: {colors.primary}20">
            <div id="entry-method-label" class="flex items-center gap-2 mb-4">
              <i class="fa-solid fa-bullseye" style="color: {colors.primary}; font-size: 16px;"></i>
              <span class="text-sm font-medium" style="color: {colors.text}">Entry Method</span>
            </div>
            <div class="flex flex-wrap gap-3" role="radiogroup" aria-labelledby="entry-method-label">
              {#each [
                { id: 'reaction', label: 'Reaction', icon: 'fa-gift' },
                { id: 'button', label: 'Button', icon: 'fa-bullseye' },
                { id: 'captcha', label: 'Captcha', icon: 'fa-robot' }
              ] as method}
                <button
                  type="button"
                  class="flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200"
                  style="background: {entryMethod === method.id ? colors.primary : `${colors.primary}20`};
                        color: {entryMethod === method.id ? colors.text : colors.muted}"
                  onclick={() => handleEntryMethodChange(method.id === 'reaction' ? 'reaction' : method.id === 'button' ? 'button' : 'captcha')}
                >
                  <i class="fa-solid {method.icon}" style="font-size: 16px;"></i>
                  {method.label}
                </button>
              {/each}
            </div>
          </div>

          <button
            type="submit"
            class="w-full py-3 px-4 rounded-lg font-medium transition-all duration-200
                  flex items-center justify-center gap-2"
            style="background: {colors.primary};
                  color: {colors.text}"
          >
            <i class="fa-solid fa-trophy" style="font-size: 20px;"></i>
            Create Giveaway
          </button>
        </form>
      </section>
    {/if}

    {#if activeTab === 'active'}
      <!-- Active Giveaways -->
      <section
        class=" rounded-xl border p-6"
        style="background: linear-gradient(135deg, {colors.gradientStart}10, {colors.gradientMid}15);
              border-color: {colors.primary}30;"
      >
        <h2 class="text-xl font-semibold mb-6 flex items-center gap-2" style="color: {colors.text}">
          <i class="fa-solid fa-gift" style="color: {colors.primary}; font-size: 24px;"></i>
          Active Giveaways
        </h2>

        {#if giveaways.length === 0}
          <div class="text-center py-12" style="color: {colors.muted}">
            <i class="fa-solid fa-gift opacity-50" style="font-size: 48px; display: block; margin: 0 auto 16px;"></i>
            <p class="text-lg">No active giveaways</p>
            <p class="text-sm mt-2">Create your first giveaway using the form above</p>
          </div>
        {:else}
          <div class="space-y-4">
            {#each giveaways as giveaway (giveaway.id)}
              <div
                class="rounded-lg border transition-all duration-200"
                style="background: {colors.primary}10;
                      border-color: {colors.primary}30;"
              >
                <div
                  class="p-4 flex justify-between items-center cursor-pointer"
                  onclick={() => toggleGiveawayExpand(giveaway.id)}
                  onkeydown={(e) => handleKeyDown(e, giveaway.id)}
                  role="button"
                  tabindex="0"
                >
                  <div class="flex items-center gap-4">
                    <i class="fa-solid fa-gift" style="color: {colors.primary}; font-size: 20px;"></i>
                    <div>
                      <h3 class="font-medium" style="color: {colors.text}">{giveaway.item}</h3>
                      <p class="text-sm" style="color: {colors.muted}">
                        Ends {new Date(giveaway.when).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <i class="fa-solid fa-chevron-down"
                     class:fa-rotate-180={expandedGiveaway === giveaway.id}
                     style="color: {colors.muted}; font-size: 20px;"
                  ></i>
                </div>

                {#if expandedGiveaway === giveaway.id}
                  <div class="px-4 pb-4 pt-2 border-t"
                       style="border-color: {colors.primary}20"
                       transition:slide>
                    <div class="grid gap-4 md:grid-cols-2">
                      <div class="space-y-2">
                        <p class="flex items-center gap-2 text-sm">
                          <i class="fa-solid fa-star" style="color: {colors.secondary}; font-size: 16px;"></i>
                          <span style="color: {colors.muted}">Winners:</span>
                          <span style="color: {colors.text}">{giveaway.winners}</span>
                        </p>
                        <p class="flex items-center gap-2 text-sm">
                          <i class="fa-solid fa-hashtag" style="color: {colors.secondary}; font-size: 16px;"></i>
                          <span style="color: {colors.muted}">Channel:</span>
                          <span style="color: {colors.text}">{giveaway.channelId.toString()}</span>
                        </p>
                        {#if giveaway.restrictTo}
                          <p class="flex items-center gap-2 text-sm">
                            <i class="fa-solid fa-users" style="color: {colors.secondary}; font-size: 16px;"></i>
                            <span style="color: {colors.muted}">Required Roles:</span>
                            <span style="color: {colors.text}">{giveaway.restrictTo}</span>
                          </p>
                        {/if}
                      </div>
                      <div class="space-y-2">
                        <p class="flex items-center gap-2 text-sm">
                          <i class="fa-solid fa-message" style="color: {colors.secondary}; font-size: 16px;"></i>
                          <span style="color: {colors.muted}">Message Requirement:</span>
                          <span style="color: {colors.text}">{giveaway.messageCountReq.toString()}</span>
                        </p>
                        <p class="flex items-center gap-2 text-sm">
                          <i class="fa-solid fa-bullseye" style="color: {colors.secondary}; font-size: 16px;"></i>
                          <span style="color: {colors.muted}">Entry Method:</span>
                          <span style="color: {colors.text}">
                           {giveaway.useButton ? "Button" : giveaway.useCaptcha ? "Captcha" : "Reaction"}
                         </span>
                        </p>
                      </div>
                    </div>

                    {#if !giveaway.ended}
                      <button
                        class="mt-6 w-full py-2 px-4 rounded-lg font-medium transition-all duration-200
                              flex items-center justify-center gap-2"
                        style="background: {colors.accent}20;
                              color: {colors.accent}"
                        onclick={() => endGiveaway(giveaway.id)}
                      >
                        <i class="fa-solid fa-xmark" style="font-size: 16px;"></i>
                        End Giveaway
                      </button>
                    {/if}
                  </div>
                {/if}
              </div>
            {/each}
          </div>
        {/if}
      </section>
    {/if}

    {#if activeTab === 'ended'}
      <!-- Ended Giveaways would go here -->
      <section
        class=" rounded-xl border p-6"
        style="background: linear-gradient(135deg, {colors.gradientStart}10, {colors.gradientMid}15);
               border-color: {colors.primary}30;"
      >
        <h2 class="text-xl font-semibold mb-6 flex items-center gap-2" style="color: {colors.text}">
          <i class="fa-solid fa-trophy" style="color: {colors.primary}; font-size: 24px;"></i>
          Ended Giveaways
        </h2>
        <div class="text-center py-12" style="color: {colors.muted}">
          <i class="fa-solid fa-trophy opacity-50" style="font-size: 48px; display: block; margin: 0 auto 16px;"></i>
          <p class="text-lg">No ended giveaways to display</p>
        </div>
      </section>
    {/if}
  {/if}
</DashboardPageLayout>

<style>
    @reference '../../../app.css';

    /* Hide number input spinners */
    input[type="number"]::-webkit-inner-spin-button,
    input[type="number"]::-webkit-outer-spin-button {
        -webkit-appearance: none;
        margin: 0;
    }

    input[type="number"] {
        appearance: textfield;
    }

    /* Add smooth transitions */
    [style*="background"],
    [style*="color"] {
        @apply transition-colors duration-300;
    }

    /* Custom scrollbar styling */
</style>