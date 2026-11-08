<script lang="ts">
  import { m } from "$lib/i18n";
  import { colorStore } from "$lib/stores/colorStore";
  import { ticketApi } from "$lib/api/index.ts";
  import type { TicketPriority } from "$lib/api/ticket/models";
  import type { GuildEmojiInfo } from "$lib/api/client/models";
  import { logger } from "$lib/logger";
  import { requestConfirmation } from "$lib/stores/confirmationStore";
  import EmojiPicker from "$lib/components/forms/EmojiPicker.svelte";
  import SettingField from "$lib/components/forms/SettingField.svelte";
  import ToggleRow from "$lib/components/forms/ToggleRow.svelte";
  import PluginCard from "$lib/components/plugin/PluginCard.svelte";
  import ListRow from "./ListRow.svelte";
  import Sheet from "$lib/components/ui/Sheet.svelte";
  import NumberField from "./editor/NumberField.svelte";
  import { MINUTE, errorText, hexColor, colorHex, secondsSpan, spanSeconds } from "../ticketModel";

  interface Props {
    guildId: bigint;
    priorities: TicketPriority[];
    loading: boolean;
    emojis: GuildEmojiInfo[];
    onreload: () => Promise<void>;
    onerror: (message: string) => void;
  }

  let { guildId, priorities, loading, emojis, onreload, onerror }: Props = $props();

  let creating = $state(false);
  let saving = $state(false);
  let key = $state("");
  let name = $state("");
  let emoji = $state<string | null>(null);
  let level = $state(1);
  let pingStaff = $state(false);
  let minutes = $state(5);
  let color = $state("#3498db");

  const ordered = $derived([...priorities].sort((a, b) => a.level - b.level));
  const valid = $derived(/^[a-z0-9_-]{1,32}$/.test(key) && !!name.trim() && level >= 1 && level <= 5 && !priorities.some(p => p.priorityId === key));

  function reset() {
    key = "";
    name = "";
    emoji = null;
    level = 1;
    pingStaff = false;
    minutes = 5;
    color = "#3498db";
  }

  function suggestKey() {
    if (!key) key = name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 32);
  }

  async function create() {
    if (!valid || saving) return;
    saving = true;
    try {
      await ticketApi.createTicketPriority(guildId, {
        id: key,
        name: name.trim(),
        emoji: emoji ?? "",
        level,
        pingStaff,
        responseTime: secondsSpan(minutes * MINUTE),
        color: hexColor(color)
      });
      creating = false;
      reset();
      await onreload();
    } catch (err) {
      logger.error("Failed to create ticket priority:", err);
      onerror(errorText(err, m.tickets.failedCreatePriority()));
    } finally {
      saving = false;
    }
  }

  async function remove(priority: TicketPriority) {
    const ok = await requestConfirmation({ message: m.tickets.deletePriorityConfirm({ name: priority.name }), confirmText: m.common.delete() });
    if (!ok) return;
    try {
      await ticketApi.deleteTicketPriority(guildId, priority.priorityId);
      await onreload();
    } catch (err) {
      logger.error("Failed to delete ticket priority:", err);
      onerror(errorText(err, m.tickets.failedDeletePriority()));
    }
  }

  function badges(priority: TicketPriority): string[] {
    const list = [m.common.levelNumber({ level: priority.level })];
    if (priority.pingStaff) list.push(m.tickets.pingsStaff());
    const seconds = spanSeconds(priority.responseTime);
    if (seconds > 0) list.push(m.tickets.respondWithin({ minutes: Math.round(seconds / MINUTE) }));
    return list;
  }

  const buttonStyle = $derived(`background: ${$colorStore.primary}20; color: ${$colorStore.text}; border: 1px solid ${$colorStore.primary}30;`);
  const inputStyle = $derived(`background: ${$colorStore.primary}10; border-color: ${$colorStore.primary}30; color: ${$colorStore.text};`);
</script>

{#snippet newButton()}
  <button type="button" class="flex items-center justify-center gap-2 px-5 rounded-xl min-h-[50px] font-medium" style={buttonStyle} onclick={() => (creating = true)}>
    <i class="fa-solid fa-plus" aria-hidden="true"></i>
    {m.tickets.newPriority()}
  </button>
{/snippet}

<PluginCard title={m.tickets.cardPrioritiesTitle()} actions={newButton}>
  {#if loading}
    <div class="flex justify-center py-6">
      <div class="w-10 h-10 border-4 rounded-full animate-spin" style="border-color: {$colorStore.primary}20; border-top-color: {$colorStore.primary}"></div>
    </div>
  {:else if priorities.length === 0}
    <p class="py-4 text-center" style="color: {$colorStore.muted}">{m.tickets.prioritiesEmpty()}</p>
  {:else}
    <div class="space-y-2">
      {#each ordered as priority (priority.priorityId)}
        <ListRow
          title={`${priority.emoji ?? ""} ${priority.name}`.trim()}
          subtitle={priority.priorityId}
          mono
          badges={badges(priority)}
          menu={[{ label: m.common.delete(), icon: "fa-trash", onclick: () => remove(priority) }]}
          menuLabel={m.tickets.rowMoreAria({ name: priority.name })}
        >
          {#snippet leading()}
            <span class="shrink-0 w-3 h-10 rounded-full" style="background: {colorHex(priority.color)};" aria-hidden="true"></span>
          {/snippet}
        </ListRow>
      {/each}
    </div>
  {/if}
</PluginCard>

{#if creating}
  <Sheet title={m.tickets.newPriority()} onclose={() => (creating = false)}>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
      <SettingField label={m.common.name()} id="priority-name" required>
        <input id="priority-name" type="text" maxlength="40" bind:value={name} onblur={suggestKey} placeholder={m.tickets.priorityNamePlaceholder()} class="w-full p-3 rounded-lg border focus:ring-2 min-h-[50px]" style={inputStyle}>
      </SettingField>
      <SettingField label={m.tickets.keyLabel()} hint={m.tickets.keyHint()} id="priority-key" required>
        <input id="priority-key" type="text" maxlength="32" bind:value={key} placeholder={m.tickets.priorityKeyPlaceholder()} class="w-full p-3 rounded-lg border focus:ring-2 min-h-[50px] font-mono" style={inputStyle}>
      </SettingField>
      <SettingField label={m.common.emoji()} id="priority-emoji">
        <EmojiPicker id="priority-emoji" guildEmojis={emojis} selected={emoji} multiple={false} placeholder={m.common.selectEmojiPlaceholder()} onchange={(d) => (emoji = typeof d.selected === "string" ? d.selected : null)} />
      </SettingField>
      <SettingField label={m.common.color()} id="priority-color">
        <input id="priority-color" type="color" bind:value={color} class="w-full rounded-lg border min-h-[50px] p-1" style={inputStyle}>
      </SettingField>
      <NumberField id="priority-level" label={m.common.level()} hint={m.tickets.levelHint()} value={level} min={1} max={5} onchange={(v) => (level = v ?? 1)} />
      <NumberField id="priority-minutes" label={m.tickets.responseMinutes()} value={minutes} min={1} max={10080} onchange={(v) => (minutes = v ?? 5)} />
    </div>
    <ToggleRow colors={$colorStore} checked={pingStaff} title={m.tickets.pingStaff()} onchange={(on) => (pingStaff = on)} />
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
