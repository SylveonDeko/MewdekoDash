<script lang="ts">
  import { m } from "$lib/i18n";
  import { customVoiceApi } from "$lib/api/index.ts";
  import { logger } from "$lib/logger";
  import { colorStore } from "$lib/stores/colorStore";
  import { requestConfirmation } from "$lib/stores/confirmationStore";
  import type { AutoSave } from "$lib/utils/autoSave.svelte";
  import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";
  import Sheet from "$lib/components/ui/Sheet.svelte";
  import HubEditor from "./HubEditor.svelte";
  import { errorText, hubToRequest, NEW_HUB_DEFAULTS, type Hub, type Named } from "./model";

  interface Props {
    guildId: bigint;
    hubs: Hub[];
    voiceChannels: Named[];
    categories: Named[];
    roles: Named[];
    autoSave: AutoSave;
    onchange: (hubs: Hub[]) => void;
    notify: (message: string, type?: "success" | "error") => void;
  }

  let { guildId, hubs, voiceChannels, categories, roles, autoSave, onchange, notify }: Props = $props();

  let editingId: string | null = $state(null);
  let adding = $state(false);
  let newChannel: string | null = $state(null);
  let newCategory: string | null = $state(null);
  let busy = $state(false);

  const editing = $derived(hubs.find((h) => h.hubId === editingId) ?? null);
  const channelNames = $derived(new Map(voiceChannels.map((c) => [c.id, c.name])));
  const categoryNames = $derived(new Map(categories.map((c) => [c.id, c.name])));
  const freeChannels = $derived(voiceChannels.filter((c) => !hubs.some((h) => h.hubId === c.id)));

  const iconButton = $derived(
    `background: ${$colorStore.primary}10; color: ${$colorStore.text}; border: 1px solid ${$colorStore.primary}20;`
  );

  function hubTitle(hub: Hub): string {
    return hub.hubName || channelNames.get(hub.hubId) || m.common.channelFallback({ id: hub.hubId });
  }

  function closeAdd() {
    adding = false;
    newChannel = null;
    newCategory = null;
  }

  async function addHub() {
    if (!newChannel || busy) return;
    busy = true;
    const hub: Hub = {
      ...NEW_HUB_DEFAULTS,
      hubId: newChannel,
      categoryId: newCategory,
      hubName: channelNames.get(newChannel) ?? "",
      moderatorRoleIds: []
    };
    try {
      await customVoiceApi.updateCustomVoiceConfig(guildId, hubToRequest(hub), hub.hubId);
      onchange([...hubs, hub]);
      closeAdd();
      editingId = hub.hubId;
    } catch (err) {
      logger.error("Failed to add hub:", err);
      notify(errorText(err, m.customvoice.notifyAddFailed()), "error");
    } finally {
      busy = false;
    }
  }

  async function removeHub(hub: Hub) {
    const ok = await requestConfirmation({
      title: m.customvoice.removeTitle(),
      message: m.customvoice.removeMessage({ name: hubTitle(hub) }),
      confirmText: m.common.remove()
    });
    if (!ok) return;
    try {
      await autoSave.flush();
      await customVoiceApi.disableCustomVoice(guildId, hub.hubId);
      if (editingId === hub.hubId) editingId = null;
      onchange(hubs.filter((h) => h.hubId !== hub.hubId));
    } catch (err) {
      logger.error("Failed to remove hub:", err);
      notify(errorText(err, m.customvoice.notifyRemoveFailed()), "error");
    }
  }

  function closeEdit() {
    void autoSave.flush();
    editingId = null;
  }

  function updated(hub: Hub) {
    onchange(hubs.map((h) => (h.hubId === hub.hubId ? hub : h)));
  }
</script>

<div class="space-y-3 min-w-0">
  {#each hubs as hub (hub.hubId)}
    <div class="flex items-center gap-3 rounded-xl border p-3 min-w-0"
         style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}20;">
      <i class="fa-solid fa-microphone shrink-0" style="color: {$colorStore.primary}" aria-hidden="true"></i>
      <div class="grow min-w-0">
        <p class="font-medium truncate" style="color: {$colorStore.text}">{hubTitle(hub)}</p>
        <p class="text-sm truncate" style="color: {$colorStore.muted}">
          {channelNames.get(hub.hubId) ?? hub.hubId}{hub.categoryId ? ` · ${categoryNames.get(hub.categoryId) ?? hub.categoryId}` : ""}
        </p>
      </div>
      <button type="button" class="rounded-lg min-h-[44px] min-w-[44px] shrink-0" style={iconButton}
              aria-label="{m.common.edit()}: {hubTitle(hub)}" onclick={() => (editingId = hub.hubId)}>
        <i class="fa-solid fa-pen" aria-hidden="true"></i>
      </button>
      <button type="button" class="rounded-lg min-h-[44px] min-w-[44px] shrink-0" style={iconButton}
              aria-label="{m.common.remove()}: {hubTitle(hub)}" onclick={() => removeHub(hub)}>
        <i class="fa-solid fa-trash" aria-hidden="true"></i>
      </button>
    </div>
  {:else}
    <p class="text-sm py-6 text-center" style="color: {$colorStore.muted}">{m.customvoice.noHubs()}</p>
  {/each}

  <button type="button" class="w-full sm:w-auto px-5 rounded-xl min-h-[50px] font-medium flex items-center justify-center gap-2"
          style="background: {$colorStore.primary}; color: {$colorStore.onPrimary};" onclick={() => (adding = true)}>
    <i class="fa-solid fa-plus" aria-hidden="true"></i>{m.customvoice.addHub()}
  </button>
</div>

{#if adding}
  <Sheet title={m.customvoice.addHub()} onclose={closeAdd}>
    <div>
      <span id="cv-new-channel" class="block text-sm font-medium mb-1" style="color: {$colorStore.text}">{m.common.hubVoiceChannel()}</span>
      <DiscordSelector type="custom" customIcon="fa-microphone" options={freeChannels} selected={newChannel}
                       ariaLabelledby="cv-new-channel" placeholder={m.common.selectVoiceChannelPlaceholder()}
                       onchange={({ selected }) => (newChannel = typeof selected === "string" ? selected : null)} />
    </div>
    <div>
      <span id="cv-new-category" class="block text-sm font-medium mb-1" style="color: {$colorStore.text}">{m.customvoice.categoryLabel()}</span>
      <DiscordSelector type="custom" customIcon="fa-folder" options={categories} selected={newCategory}
                       ariaLabelledby="cv-new-category" placeholder={m.common.selectCategoryPlaceholder()}
                       onchange={({ selected }) => (newCategory = typeof selected === "string" ? selected : null)} />
    </div>
    {#snippet footer()}
      <button type="button" class="px-5 rounded-xl min-h-[50px]" style={iconButton} onclick={closeAdd}>{m.common.cancel()}</button>
      <button type="button" class="px-5 rounded-xl min-h-[50px] font-medium disabled:opacity-50"
              style="background: {$colorStore.primary}; color: {$colorStore.onPrimary};"
              disabled={!newChannel || busy} onclick={addHub}>{m.customvoice.addHub()}</button>
    {/snippet}
  </Sheet>
{/if}

{#if editing}
  <Sheet title={hubTitle(editing)} onclose={closeEdit}>
    {#key editing.hubId}
      <HubEditor {guildId} hub={editing} {categories} {roles} {autoSave} onsaved={updated} />
    {/key}
  </Sheet>
{/if}
