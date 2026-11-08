<script lang="ts">
  import { m } from "$lib/i18n";
  import { colorStore } from "$lib/stores/colorStore";
  import { ticketApi } from "$lib/api/index.ts";
  import type { TicketTag } from "$lib/api/ticket/models";
  import { logger } from "$lib/logger";
  import { requestConfirmation } from "$lib/stores/confirmationStore";
  import SettingField from "$lib/components/forms/SettingField.svelte";
  import PluginCard from "$lib/components/plugin/PluginCard.svelte";
  import ListRow from "./ListRow.svelte";
  import Sheet from "$lib/components/ui/Sheet.svelte";
  import { colorHex, errorText, hexColor } from "../ticketModel";

  interface Props {
    guildId: bigint;
    tags: TicketTag[];
    loading: boolean;
    onreload: () => Promise<void>;
    onerror: (message: string) => void;
  }

  let { guildId, tags, loading, onreload, onerror }: Props = $props();

  let creating = $state(false);
  let saving = $state(false);
  let key = $state("");
  let name = $state("");
  let description = $state("");
  let color = $state("#3498db");

  const valid = $derived(/^[a-z0-9_-]{1,32}$/.test(key) && !!name.trim() && !tags.some(t => t.tagId === key));

  function reset() {
    key = "";
    name = "";
    description = "";
    color = "#3498db";
  }

  function suggestKey() {
    if (!key) key = name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 32);
  }

  async function create() {
    if (!valid || saving) return;
    saving = true;
    try {
      await ticketApi.createTicketTag(guildId, { id: key, name: name.trim(), description: description.trim(), color: hexColor(color) });
      creating = false;
      reset();
      await onreload();
    } catch (err) {
      logger.error("Failed to create ticket tag:", err);
      onerror(errorText(err, m.tickets.failedCreateTag()));
    } finally {
      saving = false;
    }
  }

  async function remove(tag: TicketTag) {
    const ok = await requestConfirmation({ message: m.tickets.deleteTagConfirm({ name: tag.name }), confirmText: m.common.delete() });
    if (!ok) return;
    try {
      await ticketApi.deleteTicketTag(guildId, tag.tagId);
      await onreload();
    } catch (err) {
      logger.error("Failed to delete ticket tag:", err);
      onerror(errorText(err, m.tickets.failedDeleteTag()));
    }
  }

  const buttonStyle = $derived(`background: ${$colorStore.primary}20; color: ${$colorStore.text}; border: 1px solid ${$colorStore.primary}30;`);
  const inputStyle = $derived(`background: ${$colorStore.primary}10; border-color: ${$colorStore.primary}30; color: ${$colorStore.text};`);
</script>

{#snippet newButton()}
  <button type="button" class="flex items-center justify-center gap-2 px-5 rounded-xl min-h-[50px] font-medium" style={buttonStyle} onclick={() => (creating = true)}>
    <i class="fa-solid fa-plus" aria-hidden="true"></i>
    {m.tickets.newTag()}
  </button>
{/snippet}

<PluginCard title={m.tickets.tags()} actions={newButton}>
  {#if loading}
    <div class="flex justify-center py-6">
      <div class="w-10 h-10 border-4 rounded-full animate-spin" style="border-color: {$colorStore.primary}20; border-top-color: {$colorStore.primary}"></div>
    </div>
  {:else if tags.length === 0}
    <p class="py-4 text-center" style="color: {$colorStore.muted}">{m.tickets.tagsEmpty()}</p>
  {:else}
    <div class="space-y-2">
      {#each tags as tag (tag.tagId)}
        <ListRow
          title={tag.name}
          subtitle={tag.description || tag.tagId}
          menu={[{ label: m.common.delete(), icon: "fa-trash", onclick: () => remove(tag) }]}
          menuLabel={m.tickets.rowMoreAria({ name: tag.name })}
        >
          {#snippet leading()}
            <span class="shrink-0 w-3 h-10 rounded-full" style="background: {colorHex(tag.color)};" aria-hidden="true"></span>
          {/snippet}
        </ListRow>
      {/each}
    </div>
  {/if}
</PluginCard>

{#if creating}
  <Sheet title={m.tickets.newTag()} onclose={() => (creating = false)}>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
      <SettingField label={m.common.name()} id="tag-name" required>
        <input id="tag-name" type="text" maxlength="40" bind:value={name} onblur={suggestKey} placeholder={m.tickets.tagNamePlaceholder()} class="w-full p-3 rounded-lg border focus:ring-2 min-h-[50px]" style={inputStyle}>
      </SettingField>
      <SettingField label={m.tickets.keyLabel()} hint={m.tickets.keyHint()} id="tag-key" required>
        <input id="tag-key" type="text" maxlength="32" bind:value={key} placeholder={m.tickets.tagKeyPlaceholder()} class="w-full p-3 rounded-lg border focus:ring-2 min-h-[50px] font-mono" style={inputStyle}>
      </SettingField>
    </div>
    <SettingField label={m.common.description()} id="tag-description">
      <input id="tag-description" type="text" maxlength="100" bind:value={description} placeholder={m.tickets.tagDescriptionPlaceholder()} class="w-full p-3 rounded-lg border focus:ring-2 min-h-[50px]" style={inputStyle}>
    </SettingField>
    <SettingField label={m.common.color()} id="tag-color">
      <input id="tag-color" type="color" bind:value={color} class="w-full rounded-lg border min-h-[50px] p-1" style={inputStyle}>
    </SettingField>
    {#snippet footer()}
      <button type="button" class="px-5 rounded-xl min-h-[44px] font-medium" style={buttonStyle} onclick={() => (creating = false)}>{m.common.cancel()}</button>
      <button
        type="button"
        class="flex items-center justify-center gap-2 px-5 rounded-xl min-h-[44px] font-medium"
        style="background: {$colorStore.primary}; color: {$colorStore.onPrimary};"
        disabled={saving || !valid}
        onclick={create}
      >
        <i class="fa-solid fa-plus" aria-hidden="true"></i>
        {m.common.create()}
      </button>
    {/snippet}
  </Sheet>
{/if}
