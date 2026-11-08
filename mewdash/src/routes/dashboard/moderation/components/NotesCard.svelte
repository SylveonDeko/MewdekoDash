<script lang="ts">
  import { m } from "$lib/i18n";
  import { onMount } from "svelte";
  import { moderationApi, type ModNote } from "$lib/api/index.ts";
  import { colorStore } from "$lib/stores/colorStore";
  import { logger } from "$lib/logger";
  import SettingField from "$lib/components/forms/SettingField.svelte";
  import PluginCard from "$lib/components/plugin/PluginCard.svelte";

  interface Props {
    guildId: bigint;
    moderatorId: bigint | null;
    onerror: (message: string) => void;
  }

  let { guildId, moderatorId, onerror }: Props = $props();

  let notes: ModNote[] = $state([]);
  let memberId = $state("");
  let draft = $state("");
  let busy = $state(false);

  const validMember = $derived(/^\d{15,22}$/.test(memberId.trim()));
  const inputStyle = $derived(
    `background: ${$colorStore.primary}08; border-color: ${$colorStore.primary}30; color: ${$colorStore.text};`
  );

  async function load() {
    try {
      notes = await moderationApi.getNotes(guildId, validMember ? memberId.trim() : null);
    } catch (err) {
      logger.error("Failed to load notes:", err);
      onerror(m.moderation.notesLoadFailed());
    }
  }

  async function add() {
    if (!moderatorId || !validMember || !draft.trim()) return;
    busy = true;
    try {
      await moderationApi.addNote(guildId, BigInt(memberId.trim()), moderatorId, draft.trim());
      draft = "";
      await load();
    } catch (err) {
      logger.error("Failed to add note:", err);
      onerror(m.moderation.notesAddFailed());
    } finally {
      busy = false;
    }
  }

  async function remove(note: ModNote) {
    try {
      await moderationApi.removeNote(guildId, note.id);
      await load();
    } catch (err) {
      logger.error("Failed to remove note:", err);
      onerror(m.moderation.notesRemoveFailed());
    }
  }

  onMount(() => {
    void load();
  });
</script>

<PluginCard title={m.moderation.notesTitle()}>
  <SettingField label={m.common.userId()} id="notes-member">
    <input id="notes-member" type="text" inputmode="numeric" bind:value={memberId} onchange={load}
           class="w-full p-3 rounded-lg border min-h-[50px]" style={inputStyle}>
  </SettingField>

  {#if validMember}
    <form class="flex flex-col sm:flex-row gap-3" onsubmit={(e) => { e.preventDefault(); void add(); }}>
      <input type="text" bind:value={draft} maxlength="1000" placeholder={m.moderation.notesPlaceholder()} aria-label={m.moderation.notesPlaceholder()}
             class="grow p-3 rounded-lg border min-h-[50px]" style={inputStyle}>
      <button
        type="submit"
        disabled={busy || !draft.trim()}
        class="px-6 rounded-xl font-medium flex items-center justify-center gap-2 min-h-[50px] disabled:opacity-50"
        style="background: {$colorStore.primary}20; color: {$colorStore.primary}; border: 1px solid {$colorStore.primary}30;"
      >
        <i class="fa-solid fa-plus" aria-hidden="true"></i>
        {m.common.add()}
      </button>
    </form>
  {/if}

  {#if notes.length === 0}
    <p class="text-sm" style="color: {$colorStore.muted}">{m.moderation.notesEmpty()}</p>
  {:else}
    <div class="space-y-2">
      {#each notes as note (note.id)}
        <div class="flex items-start gap-3 p-3 rounded-xl border" style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}20;">
          <div class="flex-1 min-w-0">
            <p class="text-sm break-words" style="color: {$colorStore.text}">{note.note}</p>
            <div class="text-xs mt-1" style="color: {$colorStore.muted}">
              {note.userName} · {m.moderation.warningsBy({ name: note.moderatorName })} · {new Date(note.dateAdded).toLocaleString()}
            </div>
          </div>
          <button
            class="p-2 rounded-lg min-h-[44px] min-w-[44px]"
            style="background: {$colorStore.primary}10; color: {$colorStore.muted};"
            aria-label={m.common.delete()}
            title={m.common.delete()}
            onclick={() => remove(note)}
          >
            <i class="fa-solid fa-trash" style="font-size: 14px;" aria-hidden="true"></i>
          </button>
        </div>
      {/each}
    </div>
  {/if}
</PluginCard>
