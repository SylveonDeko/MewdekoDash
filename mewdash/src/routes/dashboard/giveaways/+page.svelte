<!-- routes/dashboard/giveaways/+page.svelte -->
<script lang="ts">
  import { m } from "$lib/i18n";


  import { onMount } from "svelte";
  import { clientApi, type Giveaway, giveawaysApi, type GuildEmojiInfo } from "$lib/api/index.ts";
  import { currentGuild } from "$lib/stores/currentGuild.ts";
  import { fade, slide } from "svelte/transition";
  import { goto } from "$app/navigation";
  import Notification from "$lib/components/ui/Notification.svelte";
  import DashboardPageLayout from "$lib/components/layout/DashboardPageLayout.svelte";
  import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";
  import EmojiPicker from "$lib/components/forms/EmojiPicker.svelte";
  import IntervalPicker from "$lib/components/forms/IntervalPicker.svelte";
  import { colorStore } from "$lib/stores/colorStore.ts";
  import { logger } from "$lib/logger.ts";
  import { loadingStore } from "$lib/stores/loadingStore";

  let { data } = $props();

  let giveaways: Giveaway[] = $state([]);
  let expandedGiveaway: number | null = $state(null);
  let loading = $state(true);
  let error: string | null = $state(null);
  let showNotification = $state(false);
  let notificationMessage = $state("");
  let notificationType: "success" | "error" = $state("success");
  let guildRoles: Array<{ id: string; name: string }> = $state([]);
  let guildChannels: Array<{ id: string; name: string }> = $state([]);
  let guildEmojis: GuildEmojiInfo[] = $state([]);
  let selectedRoles: string[] = $state([]);
  let entryMethod: "reaction" | "button" | "captcha" = $state("reaction");

  // Layout state
  let activeTab = $state("active");

  const tabs = $derived([
    { id: "active", label: m.common.activeGiveaways(), icon: "fa-gift" },
    { id: "create", label: m.giveaways.pageTabCreate(), icon: "fa-plus" },
    { id: "ended", label: m.giveaways.pageTabEnded(), icon: "fa-trophy" }
  ]);

  const entryMethods = $derived([
    { id: "reaction", label: m.giveaways.pageEntryReaction(), icon: "fa-gift" },
    { id: "button", label: m.common.button(), icon: "fa-bullseye" },
    { id: "captcha", label: m.common.captcha(), icon: "fa-robot" }
  ]);

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
      return m.giveaways.pageErrorItem();
    }
    if (!newGiveaway.winners || newGiveaway.winners < 1) {
      return m.giveaways.pageErrorWinnersMin();
    }
    if (!newGiveaway.channelId || newGiveaway.channelId <= BigInt(0)) {
      return m.giveaways.pageErrorChannel();
    }
    if (!newGiveaway.when || new Date(newGiveaway.when) <= new Date()) {
      return m.giveaways.pageErrorEndTime();
    }
    if (newGiveaway.messageCountReq !== undefined && newGiveaway.messageCountReq < BigInt(0)) {
      return m.giveaways.pageErrorMessageCount();
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
        if (!$currentGuild?.id) throw new Error(m.common.noGuildSelected());
        giveaways = await giveawaysApi.getGiveaways($currentGuild.id);
      } catch (err) {
        logger.error("Failed to fetch giveaways:", err);
        error = (err as Error).message || m.giveaways.pageErrorFetch();
      } finally {
        loading = false;
      }
    }, "api", m.giveaways.pageLoadingFetch());
  }

  async function loadGuildRoles() {
    try {
      if (!$currentGuild?.id) throw new Error(m.common.noGuildSelected());
      guildRoles = await clientApi.getRoles($currentGuild.id);
    } catch (err) {
      logger.error("Failed to fetch guild roles:", err);
    }
  }

  async function loadGuildChannels() {
    try {
      if (!$currentGuild?.id) throw new Error(m.common.noGuildSelected());
      const channels = await clientApi.getTextChannels($currentGuild.id);
      guildChannels = channels.map((channel: any) => ({
        id: channel.id.toString(),
        name: channel.name
      }));
    } catch (err) {
      logger.error("Failed to fetch guild channels:", err);
    }
  }

  async function loadGuildEmojis() {
    try {
      if (!data?.user?.id) throw new Error(m.giveaways.pageErrorNotAuthenticated());
      guildEmojis = await clientApi.getEmojis(data.user.id, true);
    } catch (err) {
      logger.error("Failed to fetch guild emojis:", err);
    }
  }

  async function createGiveaway() {
    try {
      const validationError = validateGiveaway();
      if (validationError) {
        showNotificationMessage(validationError, "error");
        return;
      }
      if (!$currentGuild?.id) throw new Error(m.common.noGuildSelected());
      if (!data?.user?.id) throw new Error(m.giveaways.pageErrorNotAuthenticated());

      // Set required fields
      newGiveaway.serverId = BigInt($currentGuild.id);
      newGiveaway.userId = BigInt(data.user.id);

      // Set default emote if none provided
      if (!newGiveaway.emote || newGiveaway.emote.trim() === "") {
        newGiveaway.emote = "🎉";
      }

      await giveawaysApi.createGiveaway($currentGuild.id, newGiveaway);
      showNotificationMessage(m.giveaways.pageNotifyCreated(), "success");
      await fetchGiveaways();
      resetNewGiveaway();
    } catch (error) {
      const errMsg = (error as Error).message || m.common.unknownError();
      showNotificationMessage(m.giveaways.pageErrorCreate({ error: errMsg }), "error");
    }
  }

  async function endGiveaway(giveawayId: number) {
    try {
      if (!$currentGuild?.id) throw new Error(m.common.noGuildSelected());
      await giveawaysApi.endGiveaway($currentGuild.id, giveawayId);
      showNotificationMessage(m.giveaways.pageNotifyEnded(), "success");
      await fetchGiveaways();
    } catch (error) {
      const errMsg = (error as Error).message || m.common.unknownError();
      showNotificationMessage(m.giveaways.pageErrorEnd({ error: errMsg }), "error");
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
      showNotificationMessage(m.giveaways.pageErrorWinnersMin(), "error");
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
      showNotificationMessage(m.giveaways.pageErrorMessageCount(), "error");
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
      loadGuildChannels();
      loadGuildEmojis();
    }
  });

  onMount(async () => {
    if (!$currentGuild) await goto("/dashboard");
    await Promise.all([fetchGiveaways(), loadGuildRoles(), loadGuildChannels(), loadGuildEmojis()]);
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
  guildName={$currentGuild?.name || m.common.dashboard()}
  icon="fa-gift"
  subtitle={m.giveaways.pageSubtitle()}
  tabs={tabs}
  title={m.features.giveawaysName()}
  statusMessages={statusMessageContent}
>

  {#if loading}
    <div class="flex justify-center items-center min-h-[400px]">
      <div class="relative">
        <div
          class="w-16 h-16 border-4 rounded-full animate-spin"
          style="border-color: {colors.primary}20; border-top-color: {colors.primary}"
        ></div>
        <span class="mt-4 block text-center" style="color: {colors.muted}">{m.giveaways.pageLoadingFetch()}</span>
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
          <div class="font-semibold text-lg">{m.common.errorOccurred()}</div>
          <div class="text-sm mt-1" style="color: {colors.accent}90">{error}</div>
        </div>
      </div>
    </div>
  {:else}
    {#if activeTab === 'create'}
      <!-- Create New Giveaway Section -->
      <section
        class="rounded-2xl border p-6 md:p-8 mb-8 shadow-2xl transition-all"
        style="background: linear-gradient(135deg, {colors.gradientStart}10, {colors.gradientMid}15, {colors.gradientEnd}10);
              border-color: {colors.primary}30;"
        transition:fade
      >
        <h2 class="text-xl font-semibold mb-6 flex items-center gap-2" style="color: {colors.text}">
          <i class="fa-solid fa-trophy" style="color: {colors.primary}; font-size: 24px;"></i>
          {m.giveaways.pageCreateTitle()}
        </h2>

        <form onsubmit={(e) => { e.preventDefault(); createGiveaway(); }} class="space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Giveaway Item -->
            <div class="space-y-2">
              <label for="giveaway-item" class="flex items-center gap-2 text-sm font-medium"
                     style="color: {colors.text}">
                <i class="fa-solid fa-gift" style="color: {colors.primary}; font-size: 16px;"></i>
                {m.giveaways.pageFieldItem()}
              </label>
              <input
                id="giveaway-item"
                bind:value={newGiveaway.item}
                placeholder={m.giveaways.pageFieldItemPlaceholder()}
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
                {m.giveaways.pageFieldWinners()}
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

            <!-- Channel Selection -->
            <div class="space-y-2 md:col-span-2">
              <span id="giveaway-channel-label" class="flex items-center gap-2 text-sm font-medium"
                     style="color: {colors.text}">
                <i class="fa-solid fa-hashtag" style="color: {colors.primary}; font-size: 16px;"></i>
                {m.common.channel()}
              </span>
              <div class="min-h-[44px]">
                <DiscordSelector
                  type="channel"
                  options={guildChannels}
                  selected={newGiveaway.channelId?.toString() || null}
                  placeholder={m.common.selectAChannelPlaceholder()}
                  onchange={(detail) => {
                    newGiveaway.channelId = detail.selected && typeof detail.selected === 'string' ? BigInt(detail.selected) : BigInt(0);
                  }}
                />
              </div>
            </div>

            <!-- Duration -->
            <div class="space-y-2 md:col-span-2">
              <label for="giveaway-duration" class="flex items-center gap-2 text-sm font-medium"
                     style="color: {colors.text}">
                <i class="fa-solid fa-clock" style="color: {colors.primary}; font-size: 16px;"></i>
                {m.giveaways.pageFieldDuration()}
              </label>
              <IntervalPicker onchange={handleDurationChange} />
            </div>

            <!-- Required Roles -->
            <div class="space-y-2 md:col-span-2">
              <label for="giveaway-roles" class="flex items-center gap-2 text-sm font-medium"
                     style="color: {colors.text}">
                <i class="fa-solid fa-users" style="color: {colors.primary}; font-size: 16px;"></i>
                {m.common.requiredRoles()}
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
                placeholder={m.giveaways.pageFieldRolesPlaceholder()}
              />
            </div>

            <!-- Message Count Requirement -->
            <div class="space-y-2">
              <label for="giveaway-message-count" class="flex items-center gap-2 text-sm font-medium"
                     style="color: {colors.text}">
                <i class="fa-solid fa-message" style="color: {colors.primary}; font-size: 16px;"></i>
                {m.giveaways.pageFieldMessageCount()}
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

            <!-- Reaction Emoji -->
            <div class="space-y-2">
              <label for="giveaway-emote" class="flex items-center gap-2 text-sm font-medium"
                     style="color: {colors.text}">
                <i class="fa-solid fa-face-smile" style="color: {colors.primary}; font-size: 16px;"></i>
                {m.giveaways.pageFieldEmoji()}
              </label>
              <EmojiPicker
                guildEmojis={guildEmojis}
                bind:selected={newGiveaway.emote}
                placeholder={m.common.selectEmojiPlaceholder()}
                onchange={(detail) => {
                  newGiveaway.emote = typeof detail.selected === "string" ? detail.selected : "";
                }}
              />
              <p class="text-xs" style="color: {colors.muted}">
                {m.giveaways.pageFieldEmojiHint()}
              </p>
            </div>
          </div>

          <!-- Entry Method -->
          <div class="space-y-4 pt-4 border-t" style="border-color: {colors.primary}20">
            <div id="entry-method-label" class="flex items-center gap-2 mb-4">
              <i class="fa-solid fa-bullseye" style="color: {colors.primary}; font-size: 16px;"></i>
              <span class="text-sm font-medium" style="color: {colors.text}">{m.giveaways.pageFieldEntryMethod()}</span>
            </div>
            <div class="flex flex-wrap gap-3" role="radiogroup" aria-labelledby="entry-method-label">
              {#each entryMethods as method}
                <button
                  type="button"
                  aria-label={m.giveaways.pageEntrySelectAria({ method: method.label })}
                  class="flex items-center gap-2 px-4 py-3 rounded-xl transition-all hover:scale-[1.02] font-medium"
                  style="background: {entryMethod === method.id ? `${colors.primary}20` : 'transparent'};
                        color: {entryMethod === method.id ? colors.primary : colors.muted};
                        border: 1px solid {entryMethod === method.id ? `${colors.primary}30` : `${colors.primary}15`};"
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
            aria-label={m.giveaways.pageTabCreate()}
            class="flex items-center justify-center gap-3 px-6 py-4 rounded-xl font-medium transition-all hover:scale-[1.02] min-h-[52px] w-full"
            style="background: {colors.primary}20; color: {colors.primary}; border: 1px solid {colors.primary}30;"
          >
            <i class="fa-solid fa-trophy" style="font-size: 20px;"></i>
            {m.giveaways.pageTabCreate()}
          </button>
        </form>
      </section>
    {/if}

    {#if activeTab === 'active'}
      <!-- Active Giveaways -->
      <section
        class="rounded-2xl border p-6 md:p-8 shadow-2xl transition-all"
        style="background: linear-gradient(135deg, {colors.gradientStart}10, {colors.gradientMid}15, {colors.gradientEnd}10);
              border-color: {colors.primary}30;"
      >
        <h2 class="text-xl font-semibold mb-6 flex items-center gap-2" style="color: {colors.text}">
          <i class="fa-solid fa-gift" style="color: {colors.primary}; font-size: 24px;"></i>
          {m.common.activeGiveaways()}
        </h2>

        {#if giveaways.length === 0}
          <div class="text-center py-12" style="color: {colors.muted}">
            <i class="fa-solid fa-gift opacity-50" style="font-size: 48px; display: block; margin: 0 auto 16px;"></i>
            <p class="text-lg">{m.giveaways.pageActiveEmpty()}</p>
            <p class="text-sm mt-2">{m.giveaways.pageActiveEmptyHint()}</p>
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
                        {m.giveaways.pageEndsAt({ date: new Date(giveaway.when).toLocaleString() })}
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
                          <span style="color: {colors.muted}">{m.giveaways.pageDetailWinners()}</span>
                          <span style="color: {colors.text}">{giveaway.winners}</span>
                        </p>
                        <p class="flex items-center gap-2 text-sm">
                          <i class="fa-solid fa-hashtag" style="color: {colors.secondary}; font-size: 16px;"></i>
                          <span style="color: {colors.muted}">{m.common.channelLabel()}</span>
                          <span style="color: {colors.text}">{giveaway.channelId.toString()}</span>
                        </p>
                        {#if giveaway.restrictTo}
                          <p class="flex items-center gap-2 text-sm">
                            <i class="fa-solid fa-users" style="color: {colors.secondary}; font-size: 16px;"></i>
                            <span style="color: {colors.muted}">{m.giveaways.pageDetailRoles()}</span>
                            <span style="color: {colors.text}">{giveaway.restrictTo}</span>
                          </p>
                        {/if}
                      </div>
                      <div class="space-y-2">
                        <p class="flex items-center gap-2 text-sm">
                          <i class="fa-solid fa-message" style="color: {colors.secondary}; font-size: 16px;"></i>
                          <span style="color: {colors.muted}">{m.giveaways.pageDetailMessageRequirement()}</span>
                          <span style="color: {colors.text}">{giveaway.messageCountReq.toString()}</span>
                        </p>
                        <p class="flex items-center gap-2 text-sm">
                          <i class="fa-solid fa-bullseye" style="color: {colors.secondary}; font-size: 16px;"></i>
                          <span style="color: {colors.muted}">{m.giveaways.pageDetailEntryMethod()}</span>
                          <span style="color: {colors.text}">
                           {giveaway.useButton ? m.common.button() : giveaway.useCaptcha ? m.common.captcha() : m.giveaways.pageEntryReaction()}
                         </span>
                        </p>
                      </div>
                    </div>

                    {#if !giveaway.ended}
                      <button
                        aria-label={m.giveaways.pageEndAria()}
                        class="mt-6 w-full px-4 py-3 rounded-xl font-medium transition-all hover:scale-[1.02]
                              flex items-center justify-center gap-2"
                        style="background: {colors.accent}20;
                              color: {colors.accent};
                              border: 1px solid {colors.accent}30;"
                        onclick={() => endGiveaway(giveaway.id)}
                      >
                        <i class="fa-solid fa-xmark" style="font-size: 16px;"></i>
                        {m.giveaways.pageEndAria()}
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
        class="rounded-2xl border p-6 md:p-8 shadow-2xl transition-all"
        style="background: linear-gradient(135deg, {colors.gradientStart}10, {colors.gradientMid}15, {colors.gradientEnd}10);
               border-color: {colors.primary}30;"
      >
        <h2 class="text-xl font-semibold mb-6 flex items-center gap-2" style="color: {colors.text}">
          <i class="fa-solid fa-trophy" style="color: {colors.primary}; font-size: 24px;"></i>
          {m.giveaways.pageTabEnded()}
        </h2>
        <div class="text-center py-12" style="color: {colors.muted}">
          <i class="fa-solid fa-trophy opacity-50" style="font-size: 48px; display: block; margin: 0 auto 16px;"></i>
          <p class="text-lg">{m.giveaways.pageEndedEmpty()}</p>
        </div>
      </section>
    {/if}
  {/if}
</DashboardPageLayout>

<style lang="postcss">
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