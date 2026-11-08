<script lang="ts">
  import { m } from "$lib/i18n";
  import { clientApi, type RoleGreet, roleGreetApi } from "$lib/api/index.ts";
  import { currentGuild } from "$lib/stores/currentGuild.ts";
  import { fade } from "svelte/transition";
  import Notification from "$lib/components/ui/Notification.svelte";
  import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";
  import ToggleRow from "$lib/components/forms/ToggleRow.svelte";
  import MessageField from "$lib/components/plugin/MessageField.svelte";
  import PluginCard from "$lib/components/plugin/PluginCard.svelte";
  import TabToolbar from "./TabToolbar.svelte";
  import Sheet from "$lib/components/ui/Sheet.svelte";
  import { colorStore } from "$lib/stores/colorStore";
  import { logger } from "$lib/logger.ts";
  import { requestConfirmation } from "$lib/stores/confirmationStore";
  import { serializeMessage, toBuilderValue } from "$lib/utils/embedMessage";
  import type { DiscordUser } from "$lib/types/discord";
  import { createAutoSave } from "$lib/utils/autoSave.svelte";

  interface Props {
    user?: DiscordUser;
  }

  let { user }: Props = $props();

  type Named = { id: string; name: string };

  let showNotification = $state(false);
  let notificationMessage = $state("");
  let notificationType: "success" | "error" = $state("success");

  const autoSave = createAutoSave({
    onError: () => notify(m.rolegreets.pageErrorAutosave(), "error")
  });

  function notify(message: string, type: "success" | "error" = "success") {
    notificationMessage = message;
    notificationType = type;
    showNotification = true;
    setTimeout(() => {
      showNotification = false;
    }, 3000);
  }

  let roleGreets: RoleGreet[] = $state([]);
  let guildRoles: Named[] = $state([]);
  let guildChannels: Named[] = $state([]);
  let selectedRoleId = $state("");
  let selectedChannelId = $state("");
  let adding = $state(false);
  let loading = $state(true);
  let error: string | null = $state(null);

  let editingGreetId: number | null = $state(null);
  let editGreetDeleteTime = $state(0);
  let editGreetWebhook = $state<string | null>(null);

  const editingGreet = $derived(roleGreets.find(g => g.id === editingGreetId) ?? null);

  const WEBHOOK_PATTERN = /^https:\/\/(?:[a-z]+\.)?discord(?:app)?\.com\/api\/(?:v\d+\/)?webhooks\/\d+\/[\w-]+\/?$/i;

  const webhookInvalid = $derived(!!editGreetWebhook?.trim() && !WEBHOOK_PATTERN.test(editGreetWebhook.trim()));

  const placeholders = $derived([
    { category: m.multigreets.placeholderCategoryJoin(), name: "%user.username%", description: m.placeholders.userUsername() },
    { category: m.multigreets.placeholderCategoryJoin(), name: "%user.mention%", description: m.placeholders.userMention() },
    { category: m.features.categoryServer(), name: "%server.name%", description: m.placeholders.serverName() },
    { category: m.rolegreets.pageCategoryRole(), name: "%role.name%", description: m.placeholders.roleName() }
  ]);

  const fieldStyle = $derived(`background: ${$colorStore.primary}08; border-color: ${$colorStore.primary}30; color: ${$colorStore.text};`);
  const iconButton = $derived(
    `background: ${$colorStore.primary}10; color: ${$colorStore.text}; border: 1px solid ${$colorStore.primary}20;`
  );

  function message(err: unknown, fallback: string) {
    return err instanceof Error && err.message ? err.message : fallback;
  }

  async function fetchRoleGreets() {
    try {
      loading = true;
      error = null;
      if (!$currentGuild?.id) throw new Error(m.common.noGuildSelected());
      roleGreets = await roleGreetApi.getAllRoleGreets($currentGuild.id);
    } catch (err) {
      logger.error("Failed to fetch role greets:", err);
      error = message(err, m.rolegreets.pageErrorFetch());
    } finally {
      loading = false;
    }
  }

  async function fetchGuildRoles() {
    try {
      if (!$currentGuild?.id) throw new Error(m.common.noGuildSelected());
      guildRoles = await clientApi.getRoles($currentGuild.id);
    } catch (err) {
      logger.error("Failed to fetch guild roles:", err);
    }
  }

  async function fetchGuildChannels() {
    try {
      if (!$currentGuild?.id) throw new Error(m.common.noGuildSelected());
      guildChannels = await clientApi.getTextChannels($currentGuild.id);
    } catch (err) {
      logger.error("Failed to fetch guild channels:", err);
    }
  }

  async function addRoleGreet() {
    if (adding) return;
    adding = true;
    try {
      if (!$currentGuild?.id) throw new Error(m.common.noGuildSelected());
      if (!selectedRoleId) throw new Error(m.common.notifySelectRole());
      if (!selectedChannelId) throw new Error(m.common.notifySelectChannel());

      await roleGreetApi.addRoleGreet($currentGuild.id, BigInt(selectedRoleId), BigInt(selectedChannelId));
      notify(m.rolegreets.pageNotifyAdded());
      selectedRoleId = "";
      selectedChannelId = "";
      await fetchRoleGreets();
    } catch (err) {
      logger.error("Failed to add role greet:", err);
      notify(message(err, m.rolegreets.pageErrorAdd()), "error");
    } finally {
      adding = false;
    }
  }

  function patchGreet(guildId: bigint, greetId: number, patch: Partial<RoleGreet>) {
    if ($currentGuild?.id !== guildId) return;
    roleGreets = roleGreets.map(g => (g.id === greetId ? { ...g, ...patch } : g));
  }

  function greetKey(greetId: number, field: string) {
    return `greet:${greetId}:${field}`;
  }

  function saveGreetMessage(greetId: number, value: string) {
    if (!$currentGuild?.id) return;
    const guildId = $currentGuild.id;
    const next = serializeMessage(toBuilderValue(value));
    const greet = roleGreets.find(g => g.id === greetId);
    if (greet && serializeMessage(toBuilderValue(greet.message)) === next) return;

    autoSave.now(greetKey(greetId, "message"), async () => {
      await roleGreetApi.updateRoleGreetMessage(guildId, greetId, next);
      patchGreet(guildId, greetId, { message: next });
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

  function saveGreetBots(greetId: number, enabled: boolean) {
    if (!$currentGuild?.id) return;
    const guildId = $currentGuild.id;

    autoSave.now(greetKey(greetId, "greetBots"), async () => {
      await roleGreetApi.updateRoleGreetBots(guildId, greetId, enabled);
      patchGreet(guildId, greetId, { greetBots: enabled });
    });
  }

  async function toggleRoleGreetDisabled(greetId: number, disabled: boolean) {
    try {
      if (!$currentGuild?.id) throw new Error(m.common.noGuildSelected());
      await roleGreetApi.disableRoleGreet($currentGuild.id, greetId, disabled);
      notify(disabled ? m.rolegreets.pageNotifyDisabled() : m.rolegreets.pageNotifyEnabled());
      await fetchRoleGreets();
    } catch (err) {
      logger.error("Failed to toggle role greet state:", err);
      notify(m.rolegreets.pageErrorToggle(), "error");
      await fetchRoleGreets();
    }
  }

  async function deleteRoleGreet(greetId: number) {
    const confirmed = await requestConfirmation({
      message: m.common.confirmDelete(),
      confirmText: m.common.delete()
    });
    if (!confirmed) return;

    try {
      if (!$currentGuild?.id) throw new Error(m.common.noGuildSelected());
      for (const field of ["message", "deleteTime", "webhook", "greetBots"]) autoSave.cancel(greetKey(greetId, field));
      await roleGreetApi.deleteRoleGreet($currentGuild.id, greetId);
      notify(m.rolegreets.pageNotifyDeleted());
      if (editingGreetId === greetId) editingGreetId = null;
      await fetchRoleGreets();
    } catch (err) {
      logger.error("Failed to delete role greet:", err);
      notify(m.rolegreets.pageErrorDelete(), "error");
    }
  }

  function startEditing(greet: RoleGreet) {
    editingGreetId = greet.id;
    editGreetDeleteTime = greet.deleteTime;
    editGreetWebhook = greet.webhookUrl;
  }

  function stopEditing() {
    if (editingGreetId === null) return;
    void autoSave.flush(greetKey(editingGreetId, "deleteTime"));
    void autoSave.flush(greetKey(editingGreetId, "webhook"));
    editingGreetId = null;
  }

  function nameOf(list: Named[], raw: bigint | string, fallback: (id: string) => string): string {
    const id = typeof raw === "bigint" ? raw.toString() : raw;
    return list.find(x => x.id === id)?.name ?? fallback(id);
  }

  let loadedGuildId = "";

  $effect(() => {
    const id = $currentGuild?.id;
    if (!id || loadedGuildId === String(id)) return;
    loadedGuildId = String(id);
    editingGreetId = null;
    void Promise.all([fetchRoleGreets(), fetchGuildRoles(), fetchGuildChannels()]);
  });
</script>

{#if showNotification}
  <div class="fixed top-4 right-4 z-50" transition:fade>
    <Notification message={notificationMessage} type={notificationType} />
  </div>
{/if}

<div class="min-w-0 space-y-4">
  <TabToolbar {autoSave} />

  <PluginCard title={m.rolegreets.pageAddTitle()} alwaysOpen>
    <div class="grid gap-4 sm:grid-cols-2">
      <div>
        <label for="greet-role" class="block text-sm font-medium mb-1" style="color: {$colorStore.text}">
          {m.rolegreets.pageAddRoleLabel()}
        </label>
        <DiscordSelector
          id="greet-role"
          type="role"
          options={guildRoles}
          placeholder={m.common.selectARolePlaceholder()}
          selected={selectedRoleId}
          onchange={(detail) => (selectedRoleId = String(detail.selected ?? ""))}
        />
      </div>
      <div>
        <label for="greet-channel" class="block text-sm font-medium mb-1" style="color: {$colorStore.text}">
          {m.rolegreets.pageAddChannelLabel()}
        </label>
        <DiscordSelector
          id="greet-channel"
          type="channel"
          options={guildChannels}
          placeholder={m.common.selectAChannelPlaceholder()}
          selected={selectedChannelId}
          onchange={(detail) => (selectedChannelId = String(detail.selected ?? ""))}
        />
      </div>
    </div>
    <button
      type="button"
      class="mt-4 w-full sm:w-auto flex items-center justify-center gap-2 px-6 rounded-xl min-h-[50px] font-medium disabled:opacity-50"
      style="background: {$colorStore.primary}; color: {$colorStore.onPrimary};"
      disabled={!selectedRoleId || !selectedChannelId || adding}
      onclick={addRoleGreet}
    >
      <i class="fa-solid fa-plus" aria-hidden="true"></i>
      {m.rolegreets.pageAddButton()}
    </button>
  </PluginCard>

  <PluginCard title={m.rolegreets.pageListTitle()} alwaysOpen>
    {#if loading}
      <div class="flex justify-center items-center min-h-[120px]">
        <div
          class="w-10 h-10 border-4 rounded-full animate-spin"
          style="border-color: {$colorStore.primary}20; border-top-color: {$colorStore.primary};"
          aria-label={m.common.loading()}
        ></div>
      </div>
    {:else if error}
      <p class="text-sm" style="color: {$colorStore.accent}" role="alert">{error}</p>
    {:else if roleGreets.length === 0}
      <p class="text-sm py-6 text-center" style="color: {$colorStore.muted}">{m.rolegreets.pageEmptyTitle()}</p>
    {:else}
      <div class="space-y-2">
        {#each roleGreets as greet (greet.id)}
          <div
            class="flex flex-wrap items-center gap-2 sm:gap-3 rounded-xl border p-2 sm:p-3"
            style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}20;"
          >
            <button type="button" class="grow min-w-0 basis-48 text-left min-h-[44px] px-1" onclick={() => startEditing(greet)}>
              <span class="block text-sm font-semibold truncate" style="color: {$colorStore.text}">
                {nameOf(guildRoles, greet.roleId, id => m.common.roleIdLabel({ id }))}
              </span>
              <span class="block text-sm truncate" style="color: {$colorStore.muted}">
                #{nameOf(guildChannels, greet.channelId, id => m.common.channelIdLabel({ id }))}
              </span>
            </button>
            <ToggleRow
              checked={!greet.disabled}
              title={m.common.enabled()}
              colors={$colorStore}
              onchange={(enabled) => toggleRoleGreetDisabled(greet.id, !enabled)}
            />
            <button
              type="button"
              class="px-4 rounded-lg min-h-[44px] min-w-[44px]"
              style={iconButton}
              aria-label={m.common.edit()}
              title={m.common.edit()}
              onclick={() => startEditing(greet)}
            >
              <i class="fa-solid fa-pen" aria-hidden="true"></i>
            </button>
            <button
              type="button"
              class="px-4 rounded-lg min-h-[44px] min-w-[44px]"
              style="background: #ef444420; color: #ef4444;"
              aria-label={m.common.delete()}
              title={m.common.delete()}
              onclick={() => deleteRoleGreet(greet.id)}
            >
              <i class="fa-solid fa-trash" aria-hidden="true"></i>
            </button>
          </div>
        {/each}
      </div>
    {/if}
  </PluginCard>
</div>

{#if editingGreet}
  {@const greet = editingGreet}
  <Sheet
    title={m.rolegreets.pageEditTitle({ role: nameOf(guildRoles, greet.roleId, id => m.common.roleIdLabel({ id })) })}
    onclose={stopEditing}
    size="lg"
  >
    <div>
      <span class="block text-sm font-medium mb-1" style="color: {$colorStore.text}">{m.common.greetingMessage()}</span>
      <MessageField
        value={greet.message}
        onchange={(value) => saveGreetMessage(greet.id, value)}
        previewTitle={m.rolegreets.pageEditPreviewTitle()}
        icon="fa-envelope"
        {user}
        {placeholders}
        placeholder={m.rolegreets.pageEditMessagePlaceholder()}
        card={$currentGuild?.id
          ? { guildId: BigInt($currentGuild.id), target: "rolegreet", ownerId: greet.id, autoSave, onerror: (message) => notify(message, "error") }
          : undefined}
      />
    </div>

    <div class="grid gap-4 sm:grid-cols-2">
      <div>
        <label for="greet-delete-time" class="block text-sm font-medium mb-1" style="color: {$colorStore.text}">
          {m.rolegreets.pageEditDeleteTimeLabel()}
        </label>
        <input
          id="greet-delete-time"
          type="number"
          min="0"
          bind:value={editGreetDeleteTime}
          oninput={() => saveGreetDeleteTime(greet.id)}
          onblur={() => autoSave.flush(greetKey(greet.id, "deleteTime"))}
          class="w-full px-3 rounded-lg border min-h-[50px]"
          style={fieldStyle}
        />
      </div>
      <div>
        <label for="greet-webhook" class="block text-sm font-medium mb-1" style="color: {$colorStore.text}">
          {m.common.webhookUrlOptional()}
        </label>
        <input
          id="greet-webhook"
          type="text"
          bind:value={editGreetWebhook}
          oninput={() => saveGreetWebhook(greet.id)}
          onblur={() => autoSave.flush(greetKey(greet.id, "webhook"))}
          aria-invalid={webhookInvalid}
          class="w-full px-3 rounded-lg border min-h-[50px]"
          style="{fieldStyle} {webhookInvalid ? 'border-color: #ef4444;' : ''}"
          placeholder="https://discord.com/api/webhooks/..."
        />
        {#if webhookInvalid}
          <p class="text-xs mt-1" style="color: #ef4444;">{m.rolegreets.pageEditWebhookInvalid()}</p>
        {/if}
      </div>
    </div>

    <ToggleRow
      checked={greet.greetBots}
      title={m.common.greetBots()}
      colors={$colorStore}
      onchange={(enabled) => saveGreetBots(greet.id, enabled)}
    />
  </Sheet>
{/if}
