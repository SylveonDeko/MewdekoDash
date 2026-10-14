<!-- routes/dashboard/rolegreets/+page.svelte -->
<script lang="ts">
  import { m } from "$lib/i18n";


  import { onMount } from "svelte";
  import { clientApi, type RoleGreet, roleGreetApi } from "$lib/api/index.ts";
  import { currentGuild } from "$lib/stores/currentGuild.ts";
  import { fade } from "svelte/transition";
  import { goto } from "$app/navigation";
  import Notification from "$lib/components/ui/Notification.svelte";
  import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";
  import DashboardPageLayout from "$lib/components/layout/DashboardPageLayout.svelte";
  import { colorStore } from "$lib/stores/colorStore";
  import { logger } from "$lib/logger.ts";
  import FullscreenEmbedBuilder from "$lib/components/specialized/FullscreenEmbedBuilder.svelte";
  import PreviewCard from "$lib/components/specialized/PreviewCard.svelte";
  import { parseStoredMessage, serializeMessage, toBuilderValue } from "$lib/utils/embedMessage";
  import type { PageData } from "./$types";
  import { createAutoSave } from "$lib/utils/autoSave.svelte";

  const autoSave = createAutoSave({
    onError: () => showNotificationMessage(m.rolegreets.pageErrorAutosave(), "error")
  });

  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();

  // State management
    let showNotification = $state(false);
    let notificationMessage = $state("");
    let notificationType: "success" | "error" = $state("success");

  // Role Greets
  let roleGreets: RoleGreet[] = $state([]);

  // Guild roles and channels
  let guildRoles: Array<{
    id: string;
    name: string;
  }> = $state([]);

  let guildChannels: Array<{
    id: string;
    name: string;
  }> = $state([]);

  // Selected role for adding new greet
    let selectedRoleId = $state("");
    let selectedChannelId = $state("");

  // Edit states
    let editingGreetId: number | null = $state(null);
  let editGreetMessage: any = $state({});
    let editGreetDeleteTime = $state(0);
    let editGreetWebhook = $state<string | null>(null);
    let editGreetBots = $state(false);
    let pendingDeleteId: number | null = $state(null);

  let editingCardEl: HTMLElement | null = $state(null);

  /**
   * Keeps a reference to the card currently being edited so clicks can be told
   * apart from clicks anywhere else on the page.
   */
  function trackEditingCard(node: HTMLElement, isEditing: boolean) {
    if (isEditing) editingCardEl = node;

    return {
      update(nowEditing: boolean) {
        if (nowEditing) editingCardEl = node;
        else if (editingCardEl === node) editingCardEl = null;
      },
      destroy() {
        if (editingCardEl === node) editingCardEl = null;
      }
    };
  }

  $effect(() => {
    if (editingGreetId === null) return;

    const onDocumentClick = (event: MouseEvent) => {
      const target = event.target as Element | null;
      if (!target || !editingCardEl) return;
      if (editingCardEl.contains(target)) return;
      if (target.closest("[data-greet-edit]")) return;

      /** Overlays such as the embed builder portal outside the app root, so a click there is not a click off the greet. */
      const appRoot = editingCardEl.closest("body > *");
      if (appRoot && !appRoot.contains(target)) return;

      stopEditing();
    };

    document.addEventListener("click", onDocumentClick);
    return () => document.removeEventListener("click", onDocumentClick);
  });

  // Management
    let loading = $state(true);
    let error: string | null = $state(null);

  function showNotificationMessage(message: string, type: "success" | "error" = "success") {
    notificationMessage = message;
    notificationType = type;
    showNotification = true;
    setTimeout(() => {
      showNotification = false;
    }, 3000);
  }

  async function fetchRoleGreets() {
    try {
      loading = true;
      error = null;
      if (!$currentGuild?.id) {
        throw new Error(m.common.noGuildSelected());
      }

      roleGreets = await roleGreetApi.getAllRoleGreets($currentGuild.id);
    } catch (err) {
      logger.error("Failed to fetch role greets:", err);
      error = err instanceof Error ? err.message : m.rolegreets.pageErrorFetch();
    } finally {
      loading = false;
    }
  }

  async function fetchGuildRoles() {
    try {
      if (!$currentGuild?.id) {
        throw new Error(m.common.noGuildSelected());
      }

      guildRoles = await clientApi.getRoles($currentGuild.id);
    } catch (err) {
      logger.error("Failed to fetch guild roles:", err);
    }
  }

  async function fetchGuildChannels() {
    try {
      if (!$currentGuild?.id) {
        throw new Error(m.common.noGuildSelected());
      }

      guildChannels = await clientApi.getTextChannels($currentGuild.id);
    } catch (err) {
      logger.error("Failed to fetch guild channels:", err);
    }
  }

  async function addRoleGreet() {
    try {
      if (!$currentGuild?.id) throw new Error(m.common.noGuildSelected());
      if (!selectedRoleId) throw new Error(m.common.notifySelectRole());
      if (!selectedChannelId) throw new Error(m.common.notifySelectChannel());

      await roleGreetApi.addRoleGreet($currentGuild.id, BigInt(selectedRoleId), BigInt(selectedChannelId));

      showNotificationMessage(m.rolegreets.pageNotifyAdded(), "success");
      selectedRoleId = "";
      selectedChannelId = "";
      await fetchRoleGreets();
    } catch (err) {
      logger.error("Failed to add role greet:", err);
      showNotificationMessage(err instanceof Error ? err.message : m.rolegreets.pageErrorAdd(), "error");
    }
  }

  /** Applies a confirmed change to one greet in the list, if the list still belongs to the guild it was saved for. */
  function patchGreet(guildId: bigint, greetId: number, patch: Partial<RoleGreet>) {
    if ($currentGuild?.id !== guildId) return;
    roleGreets = roleGreets.map(g => g.id === greetId ? { ...g, ...patch } : g);
  }

  function greetKey(greetId: number, field: string) {
    return `greet:${greetId}:${field}`;
  }

  /**
   * The greeting message is authored in the embed builder, whose own Save button is the explicit commit, so the
   * message is stored when the builder saves rather than on every edit inside it.
   */
  function saveGreetMessage(greetId: number, value: any) {
    if (!$currentGuild?.id) return;
    const guildId = $currentGuild.id;
    const message = serializeMessage(value);
    const greet = roleGreets.find(g => g.id === greetId);
    if (greet && serializeMessage(toBuilderValue(greet.message)) === message) return;

    autoSave.now(greetKey(greetId, "message"), async () => {
      await roleGreetApi.updateRoleGreetMessage(guildId, greetId, message);
      patchGreet(guildId, greetId, { message });
    });
  }

  function saveGreetDeleteTime(greetId: number) {
    if (!$currentGuild?.id) return;
    const seconds = editGreetDeleteTime;
    if (typeof seconds !== "number" || !Number.isInteger(seconds) || seconds < 0) return;
    const guildId = $currentGuild.id;

    autoSave.schedule(greetKey(greetId, "deleteTime"), async () => {
      await roleGreetApi.updateRoleGreetDeleteTime(guildId, greetId, seconds);
      patchGreet(guildId, greetId, { deleteTime: seconds });
    });
  }

  const WEBHOOK_PATTERN = /^https:\/\/(?:[a-z]+\.)?discord(?:app)?\.com\/api\/(?:v\d+\/)?webhooks\/\d+\/[\w-]+\/?$/i;

  /** A half-typed webhook URL is not saved; the field shows a hint until it is complete or empty. */
  let webhookInvalid = $derived(!!editGreetWebhook?.trim() && !WEBHOOK_PATTERN.test(editGreetWebhook.trim()));

  function saveGreetWebhook(greetId: number) {
    if (!$currentGuild?.id) return;
    const webhookUrl = editGreetWebhook?.trim() || null;
    if (webhookUrl && !WEBHOOK_PATTERN.test(webhookUrl)) {
      autoSave.cancel(greetKey(greetId, "webhook"));
      return;
    }
    const guildId = $currentGuild.id;

    autoSave.schedule(greetKey(greetId, "webhook"), async () => {
      await roleGreetApi.updateRoleGreetWebhook(guildId, greetId, webhookUrl);
      patchGreet(guildId, greetId, { webhookUrl });
    });
  }

  function saveGreetBots(greetId: number) {
    if (!$currentGuild?.id) return;
    const guildId = $currentGuild.id;
    const enabled = editGreetBots;
    const previous = roleGreets.find(g => g.id === greetId)?.greetBots ?? !enabled;

    autoSave.now(greetKey(greetId, "greetBots"), async () => {
      try {
        await roleGreetApi.updateRoleGreetBots(guildId, greetId, enabled);
        patchGreet(guildId, greetId, { greetBots: enabled });
      } catch (err) {
        if ($currentGuild?.id === guildId && editingGreetId === greetId) editGreetBots = previous;
        throw err;
      }
    });
  }

  async function toggleRoleGreetDisabled(greetId: number, disabled: boolean) {
    try {
      if (!$currentGuild?.id) throw new Error(m.common.noGuildSelected());

      await roleGreetApi.disableRoleGreet($currentGuild.id, greetId, disabled);
      showNotificationMessage(disabled ? m.rolegreets.pageNotifyDisabled() : m.rolegreets.pageNotifyEnabled(), "success");
      await fetchRoleGreets();
    } catch (err) {
      logger.error("Failed to toggle role greet state:", err);
      showNotificationMessage(m.rolegreets.pageErrorToggle(), "error");
    }
  }

  /**
   * Deletes a role greet after the user has confirmed the pending delete.
   */
  async function deleteRoleGreet(greetId: number) {
    try {
      if (!$currentGuild?.id) throw new Error(m.common.noGuildSelected());

      for (const field of ["message", "deleteTime", "webhook", "greetBots"]) autoSave.cancel(greetKey(greetId, field));
      await roleGreetApi.deleteRoleGreet($currentGuild.id, greetId);
      showNotificationMessage(m.rolegreets.pageNotifyDeleted(), "success");
      pendingDeleteId = null;
      if (editingGreetId === greetId) editingGreetId = null;
      await fetchRoleGreets();
    } catch (err) {
      logger.error("Failed to delete role greet:", err);
      showNotificationMessage(m.rolegreets.pageErrorDelete(), "error");
    }
  }

  function startEditing(greet: RoleGreet) {
    stopEditing();
    editingGreetId = greet.id;
    editGreetMessage = toBuilderValue(greet.message);
    editGreetDeleteTime = greet.deleteTime;
    editGreetWebhook = greet.webhookUrl;
    editGreetBots = greet.greetBots;
  }

  /**
   * Closes the editor and sends any field still waiting on its debounce. Used by
   * the pencil toggle, the Done button and clicks outside the greet being edited.
   */
  function stopEditing() {
    if (editingGreetId === null) return;
    void autoSave.flush(greetKey(editingGreetId, "deleteTime"));
    void autoSave.flush(greetKey(editingGreetId, "webhook"));
    editingGreetId = null;
  }

  /** Handles the pencil button, which toggles the editor for the greet it belongs to. */
  function requestEdit(greet: RoleGreet) {
    if (editingGreetId === greet.id) {
      stopEditing();
      return;
    }

    startEditing(greet);
  }

    function getRoleName(roleId: bigint | string): string {
      const id = typeof roleId === "bigint" ? roleId.toString() : roleId;
      const role = guildRoles.find(r => r.id === id);
      return role ? role.name : m.common.roleIdLabel({ id });
  }

    function getChannelName(channelId: bigint | string): string {
      const id = typeof channelId === "bigint" ? channelId.toString() : channelId;
      const channel = guildChannels.find(c => c.id === id);
      return channel ? channel.name : m.common.channelIdLabel({ id });
  }

  function handleRoleChange(detail: any) {
    selectedRoleId = detail.selected;
  }

  function handleChannelChange(detail: any) {
    selectedChannelId = detail.selected;
  }

  onMount(() => {
    if (!$currentGuild) goto("/dashboard");
    Promise.all([
      fetchRoleGreets(),
      fetchGuildRoles(),
      fetchGuildChannels()
    ]);
  });

  $effect(() => {
        if ($currentGuild) {
            fetchRoleGreets();
            fetchGuildRoles();
            fetchGuildChannels();
        }
    });
</script>

{#snippet statusMessages()}
  {#if showNotification}
    <div class="mb-6">
      <Notification message={notificationMessage} type={notificationType} />
    </div>
  {/if}
{/snippet}

<DashboardPageLayout
  {autoSave}
  guildName={$currentGuild?.name || m.common.dashboard()}
  icon="fa-envelope"
  statusMessages={statusMessages}
  subtitle={m.rolegreets.pageSubtitle()}
  title={m.features.rolegreetsName()}
>

      <!-- Add Role Greet Form -->
      <div class="mb-8 p-4 rounded-xl" style="background: {$colorStore.primary}10;">
        <h3 class="text-lg font-semibold mb-4" style="color: {$colorStore.text}">{m.rolegreets.pageAddTitle()}</h3>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <!-- Role Selection -->
          <div>
            <span class="block text-sm mb-2" id="role-to-greet-for-label" style="color: {$colorStore.muted}">
              {m.rolegreets.pageAddRoleLabel()}
            </span>
            <DiscordSelector
              onchange={handleRoleChange}
              options={guildRoles}
              placeholder={m.common.selectARolePlaceholder()}
              selected={selectedRoleId}
              type="role" />
          </div>

          <!-- Channel Selection -->
          <div>
            <span class="block text-sm mb-2" id="send-greet-to-channel-label" style="color: {$colorStore.muted}">
              {m.rolegreets.pageAddChannelLabel()}
            </span>
            <DiscordSelector
              onchange={handleChannelChange}
              options={guildChannels}
              placeholder={m.common.selectAChannelPlaceholder()}
              selected={selectedChannelId}
              type="channel" />
          </div>
        </div>

        <button
          class="flex items-center justify-center gap-3 px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl transition-all hover:scale-[1.02] min-h-[44px] sm:min-h-[52px] font-medium focus:outline-hidden focus:ring-2 focus:ring-offset-2"
          disabled={!selectedRoleId || !selectedChannelId}
          onclick={addRoleGreet}
          style="background: {$colorStore.primary}20; color: {$colorStore.primary}; border: 1px solid {$colorStore.primary}30; focus:ring-color: {$colorStore.primary}; opacity: {!selectedRoleId || !selectedChannelId ? '0.5' : '1'};"
        >
          <i class="fa-solid fa-plus" style="font-size: 18px;"></i>
          <span>{m.rolegreets.pageAddButton()}</span>
        </button>
      </div>

      <!-- Role Greets List -->
      {#if loading}
        <div class="flex justify-center items-center min-h-[200px]">
          <div
            class="w-12 h-12 border-4 rounded-full animate-spin"
            style="border-color: {$colorStore.primary}20;
                   border-top-color: {$colorStore.primary};"
            aria-label={m.common.loading()}
          >
          </div>
        </div>
      {:else if error}
        <div
          class="rounded-xl p-4 flex items-center gap-3"
          style="background: {$colorStore.accent}10;"
          role="alert"
        >
          <i class="fa-utility-duo fa-regular fa-bell"
             style="--fa-primary-color: {$colorStore.accent}; --fa-secondary-color: {$colorStore.primary}; font-size: 20px;"
             aria-hidden="true"></i>
          <p style="color: {$colorStore.accent}">{error}</p>
        </div>
      {:else if roleGreets.length === 0}
        <div
          class="text-center py-12"
          transition:fade
        >
          <i class="fa-utility-duo fa-regular fa-envelope"
             style="--fa-primary-color: {$colorStore.muted}; --fa-secondary-color: {$colorStore.muted}; font-size: 48px; display: block; margin: 0 auto 16px;"
             aria-hidden="true"></i>
          <p style="color: {$colorStore.muted}">{m.rolegreets.pageEmptyTitle()}</p>
          <p class="mt-2 text-sm" style="color: {$colorStore.muted}">{m.rolegreets.pageEmptyHint()}</p>
        </div>
      {:else}
        <div class="space-y-4">
          {#each roleGreets as greet}
            <div
              use:trackEditingCard={editingGreetId === greet.id}
              class="rounded-xl p-4 transition-all duration-200 border"
              class:opacity-50={greet.disabled}
              style="background: {$colorStore.primary}10;
                     border-color: {greet.disabled ? $colorStore.primary + '10' : $colorStore.primary + '30'};"
            >
              <!-- Header with role name and status -->
              <div class="flex justify-between mb-4">
                <div class="flex items-center gap-2">
                  <div class="px-2 py-1 rounded-md text-sm font-medium"
                       style="background: {$colorStore.primary}20; color: {$colorStore.text};">
                    {getRoleName(greet.roleId)}
                  </div>
                  <div class="px-2 py-1 rounded-md text-sm"
                       style="background: {$colorStore.secondary}20; color: {$colorStore.secondary};">
                    #{getChannelName(greet.channelId)}
                  </div>
                </div>
                <div class="flex items-center gap-2">
                  <button
                    class="p-2 rounded-lg transition-all duration-200"
                    style="background: {editingGreetId === greet.id ? $colorStore.primary + '40' : $colorStore.primary + '20'};
                           color: {$colorStore.text};"
                    onclick={() => requestEdit(greet)}
                    data-greet-edit
                    aria-label={editingGreetId === greet.id ? m.common.ariaCloseEditor() : m.common.edit()}
                    aria-pressed={editingGreetId === greet.id}
                    title={editingGreetId === greet.id ? m.common.ariaCloseEditor() : m.common.edit()}
                  >
                    <i class="fa-solid {editingGreetId === greet.id ? 'fa-xmark' : 'fa-pen'}" style="font-size: 16px;"></i>
                  </button>

                  <button
                    class="p-2 rounded-lg transition-all duration-200"
                    style="background: {greet.disabled ? $colorStore.primary + '20' : $colorStore.accent + '20'};
                           color: {greet.disabled ? $colorStore.primary : $colorStore.accent};"
                    onclick={() => toggleRoleGreetDisabled(greet.id, !greet.disabled)}
                    aria-label={greet.disabled ? m.common.enable() : m.common.disable()}
                    title={greet.disabled ? m.common.enable() : m.common.disable()}
                  >
                    <i class="fa-solid fa-power-off" style="font-size: 16px;"></i>
                  </button>

                  {#if pendingDeleteId === greet.id}
                    <button
                      class="px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 min-h-[44px]"
                      style="background: #ef444430; color: #ef4444;"
                      onclick={() => deleteRoleGreet(greet.id)}
                      title={m.common.confirmDelete()}
                    >
                      {m.common.confirm()}
                    </button>
                    <button
                      class="px-3 py-2 rounded-lg text-sm transition-all duration-200 min-h-[44px]"
                      style="background: {$colorStore.primary}20; color: {$colorStore.text};"
                      onclick={() => (pendingDeleteId = null)}
                      title={m.rolegreets.pageCancelDeleteTitle()}
                    >
                      {m.common.cancel()}
                    </button>
                  {:else}
                    <button
                      class="p-2 rounded-lg transition-all duration-200"
                      style="background: #ef444420; color: #ef4444;"
                      onclick={() => (pendingDeleteId = greet.id)}
                      aria-label={m.common.delete()}
                      title={m.common.delete()}
                    >
                      <i class="fa-solid fa-trash" style="font-size: 16px;"></i>
                    </button>
                  {/if}
                </div>
              </div>

              <!-- Greet Content -->
              {#if editingGreetId === greet.id}
                <!-- Edit Mode -->
                <div class="space-y-4">
                  <!-- Message -->
                  <div>
                    <label for="f-+page-greeting-message-403" class="block text-sm font-medium mb-3" style="color: {$colorStore.text}">
                      <i class="fa-solid fa-comment" style="font-size: 14px;"></i>
                      {m.common.greetingMessage()}
                    </label>

                    <FullscreenEmbedBuilder id="f-+page-greeting-message-403"
                      bind:value={editGreetMessage}
                      onchange={(value) => saveGreetMessage(greet.id, value)}
                      previewTitle={m.rolegreets.pageEditPreviewTitle()}
                      previewDescription={m.rolegreets.pageEditPreviewDescription()}
                      icon="fa-envelope"
                      allowContent={true}
                      allowMultipleEmbeds={true}
                      maxEmbeds={10}
                      allowComponents={true}
                      additionalPlaceholders={[
                        { category: "User", name: "%user.username%", description: m.placeholders.userUsername() },
                        { category: "User", name: "%user.mention%", description: m.placeholders.userMention() },
                        { category: "Server", name: "%server.name%", description: m.placeholders.serverName() },
                        { category: "Role", name: "%role.name%", description: m.placeholders.roleName() }
                      ]}
                      guildId={$currentGuild?.id}
                      user={data.user}
                      placeholder={m.rolegreets.pageEditMessagePlaceholder()}
                    />
                  </div>

                  <!-- Delete Time -->
                  <div>
                    <label for="greet-delete-time" class="block text-sm mb-2" style="color: {$colorStore.muted}">
                      {m.rolegreets.pageEditDeleteTimeLabel()}
                    </label>
                    <input
                      id="greet-delete-time"
                      type="number"
                      bind:value={editGreetDeleteTime}
                      oninput={() => saveGreetDeleteTime(greet.id)}
                      onblur={() => autoSave.flush(greetKey(greet.id, "deleteTime"))}
                      class="w-full p-3 rounded-lg bg-gray-900/50 border transition-all duration-200"
                      style="border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                      min="0"
                    >
                  </div>

                  <!-- Webhook URL -->
                  <div>
                    <label for="greet-webhook" class="block text-sm mb-2" style="color: {$colorStore.muted}">
                      {m.common.webhookUrlOptional()}
                    </label>
                    <input
                      id="greet-webhook"
                      type="text"
                      bind:value={editGreetWebhook}
                      oninput={() => saveGreetWebhook(greet.id)}
                      onblur={() => autoSave.flush(greetKey(greet.id, "webhook"))}
                      aria-invalid={webhookInvalid}
                      class="w-full p-3 rounded-lg bg-gray-900/50 border transition-all duration-200"
                      style="border-color: {webhookInvalid ? '#ef4444' : $colorStore.primary + '30'}; color: {$colorStore.text};"
                      placeholder="https://discord.com/api/webhooks/..."
                    >
                    {#if webhookInvalid}
                      <p class="text-xs mt-1" style="color: #ef4444;">
                        {m.rolegreets.pageEditWebhookInvalid()}
                      </p>
                    {/if}
                  </div>

                  <!-- Greet Bots -->
                  <div class="flex items-center justify-between p-3 rounded-lg"
                       style="background: {$colorStore.primary}15;">
                    <div>
                      <span class="font-medium" style="color: {$colorStore.text}">{m.common.greetBots()}</span>
                      <p class="text-sm" style="color: {$colorStore.muted}">{m.rolegreets.pageGreetBotsHint()}</p>
                    </div>
                    <label class="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        bind:checked={editGreetBots}
                        onchange={() => saveGreetBots(greet.id)}
                        class="sr-only peer"
                      >
                      <span
                        class="w-11 h-6 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all block"
                        style="background-color: {$colorStore.accent}30;
                               peer-checked:background-color: {$colorStore.accent};"
                      ></span>
                    </label>
                  </div>

                  <!-- Action Buttons -->
                  <div class="flex items-center justify-end gap-3 mt-4 flex-wrap">
                    <span class="text-xs" style="color: {$colorStore.muted}">{m.common.changesSaveAutomatically()}</span>
                    <button
                      class="flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-all hover:scale-[1.02] min-h-[44px] font-medium"
                      onclick={stopEditing}
                      style="background: {$colorStore.primary}20; color: {$colorStore.primary};"
                    >
                      <i class="fa-solid fa-check" style="font-size: 14px;"></i>
                      {m.common.done()}
                    </button>
                  </div>
                </div>
              {:else}
                <!-- View Mode -->
                <div class="space-y-3">
                  <div class="p-3 rounded-lg" style="background: {$colorStore.primary}15;">
                    <h4 class="text-sm font-medium mb-2" style="color: {$colorStore.muted}">{m.common.message()}</h4>
                    {#if greet.message}
                      {@const preview = parseStoredMessage(greet.message)}
                      <PreviewCard
                        content={preview.content}
                        embeds={preview.embeds}
                        componentRows={preview.componentRows}
                        user={data.user}
                        guildId={$currentGuild?.id}
                        showEmpty={false}
                      />
                    {:else}
                      <p style="color: {$colorStore.text}">{m.rolegreets.pageViewNoMessage()}</p>
                    {/if}
                  </div>

                  <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div class="p-3 rounded-lg flex items-center gap-2" style="background: {$colorStore.secondary}15;">
                      <i class="fa-solid fa-clock" style="color: {$colorStore.secondary}; font-size: 16px;"></i>
                      <div>
                        <div class="text-sm font-medium" style="color: {$colorStore.muted}">{m.common.deleteAfter()}</div>
                        <div style="color: {$colorStore.text}">
                          {greet.deleteTime > 0 ? m.common.secondsCount({ count: greet.deleteTime }) : m.common.never()}
                        </div>
                      </div>
                    </div>

                    <div class="p-3 rounded-lg flex items-center gap-2" style="background: {$colorStore.secondary}15;">
                      <i class="fa-solid fa-robot" style="color: {$colorStore.secondary}; font-size: 16px;"></i>
                      <div>
                        <div class="text-sm font-medium" style="color: {$colorStore.muted}">{m.common.greetBots()}</div>
                        <div style="color: {$colorStore.text}">{greet.greetBots ? m.common.yes() : m.common.no()}</div>
                      </div>
                    </div>
                  </div>

                  {#if greet.webhookUrl}
                    <div class="p-3 rounded-lg flex items-center gap-2" style="background: {$colorStore.accent}15;">
                      <i class="fa-solid fa-globe" style="color: {$colorStore.accent}; font-size: 16px;"></i>
                      <div>
                        <h4 class="text-sm font-medium" style="color: {$colorStore.muted}">{m.rolegreets.pageViewUsingWebhook()}</h4>
                        <p class="text-sm truncate" style="color: {$colorStore.text}">{greet.webhookUrl}</p>
                      </div>
                    </div>
                  {/if}
                </div>
              {/if}
            </div>
          {/each}
        </div>
      {/if}
</DashboardPageLayout>

<style lang="postcss">
    /* Improve touchable area on mobile */
    @media (max-width: 768px) {
        button, input[type="checkbox"] {
            min-height: 44px;
            min-width: 44px;
        }
    }
</style>