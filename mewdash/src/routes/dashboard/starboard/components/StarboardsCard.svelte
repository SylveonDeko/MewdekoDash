<script lang="ts">
  import { m } from "$lib/i18n";
  import { starboardApi, type Starboard } from "$lib/api/index.ts";
  import type { GuildEmojiInfo } from "$lib/api/client/models";
  import { colorStore } from "$lib/stores/colorStore";
  import { logger } from "$lib/logger";
  import { requestConfirmation } from "$lib/stores/confirmationStore";
  import PluginCard from "$lib/components/plugin/PluginCard.svelte";
  import type { AutoSave } from "$lib/utils/autoSave.svelte";
  import type { DiscordUser } from "$lib/types/discord";
  import StarboardEditor from "./StarboardEditor.svelte";
  import StarboardRow from "./StarboardRow.svelte";
  import NewStarboardSheet from "./NewStarboardSheet.svelte";
  import { saveKeyOf, savers, splitIds, type Named, type StarboardPatch } from "./starboardModel";

  interface Props {
    guildId: bigint;
    starboards: Starboard[];
    loading: boolean;
    channels: Named[];
    roles: Named[];
    emojis: GuildEmojiInfo[];
    placeholders: string[];
    autoSave: AutoSave;
    user?: DiscordUser | null;
    onreload: () => Promise<void>;
    onerror: (message: string) => void;
    onsuccess: (message: string) => void;
  }

  let {
    guildId,
    starboards = $bindable(),
    loading,
    channels,
    roles,
    emojis,
    placeholders,
    autoSave,
    user = null,
    onreload,
    onerror,
    onsuccess
  }: Props = $props();

  type IdKind = "channel" | "autoStar" | "allowedRole" | "deniedRole";

  const idLists = {
    channel: { field: "checkedChannels", toggle: starboardApi.toggleChannel },
    autoStar: { field: "autoStarChannels", toggle: starboardApi.toggleAutoStarChannel },
    allowedRole: { field: "allowedRoles", toggle: starboardApi.toggleAllowedRole },
    deniedRole: { field: "deniedRoles", toggle: starboardApi.toggleDeniedRole }
  } as const;

  let editingId: number | null = $state(null);
  let creatingNew = $state(false);
  let creating = $state(false);
  let createProblem: string | null = $state(null);
  let emoteBusy = $state(false);

  const sorted = $derived([...starboards].sort((a, b) => a.id - b.id));
  const editing = $derived(starboards.find(s => s.id === editingId) ?? null);

  const buttonStyle = $derived(
    `background: ${$colorStore.primary}20; color: ${$colorStore.text}; border: 1px solid ${$colorStore.primary}30;`
  );

  function nameOf(starboard: Starboard): string {
    const id = String(starboard.starboardChannelId);
    return channels.find(channel => channel.id === id)?.name ?? id;
  }

  function messageOf(err: unknown, fallback: string): string {
    return err instanceof Error && err.message ? err.message : fallback;
  }

  function close() {
    void autoSave.flush();
    editingId = null;
  }

  function replace(config: Starboard) {
    starboards = starboards.map(s => (s.id === config.id ? config : s));
  }

  function queueSave(id: number, key: string, typing: boolean) {
    const send = async () => {
      const current = starboards.find(s => s.id === id);
      if (!current) return;
      try {
        await savers[key](guildId, current);
      } catch (err) {
        if (key !== "postDesign") await onreload();
        throw err;
      }
    };
    if (typing) autoSave.schedule(`starboard:${id}:${key}`, send);
    else void autoSave.now(`starboard:${id}:${key}`, send);
  }

  function apply(id: number, patch: StarboardPatch, typing: boolean) {
    starboards = starboards.map(s => (s.id === id ? { ...s, ...patch } : s));
    const keys = new Set((Object.keys(patch) as Array<keyof StarboardPatch>).map(saveKeyOf));
    for (const key of keys) queueSave(id, key, typing);
  }

  function change(patch: StarboardPatch, typing = false) {
    if (editingId !== null) apply(editingId, patch, typing);
  }

  function setIds(kind: IdKind, ids: string[]) {
    if (editingId === null) return;
    const id = editingId;
    const spec = idLists[kind];
    const before = splitIds(starboards.find(s => s.id === id)?.[spec.field]);
    const next = [...new Set(ids)];
    starboards = starboards.map(s => (s.id === id ? { ...s, [spec.field]: next.join(" ") } : s));
    void autoSave.now(`starboard:${id}:${kind}`, async () => {
      try {
        let config: Starboard | null = null;
        for (const target of [...next.filter(x => !before.includes(x)), ...before.filter(x => !next.includes(x))]) {
          config = (await spec.toggle(guildId, id, BigInt(target))).config;
        }
        if (config) replace(config);
      } catch (err) {
        await onreload();
        throw err;
      }
    });
  }

  async function addEmote(emote: string): Promise<boolean> {
    if (editingId === null || emoteBusy) return false;
    emoteBusy = true;
    try {
      await starboardApi.addEmoteToStarboard(guildId, editingId, emote);
      await onreload();
      return true;
    } catch (err) {
      logger.error("Failed to add starboard emote:", err);
      onerror(messageOf(err, m.starboard.errorAddEmote()));
      return false;
    } finally {
      emoteBusy = false;
    }
  }

  async function removeEmote(emote: string) {
    if (editingId === null || emoteBusy) return;
    emoteBusy = true;
    try {
      await starboardApi.removeEmoteFromStarboard(guildId, editingId, emote);
      await onreload();
    } catch (err) {
      logger.error("Failed to remove starboard emote:", err);
      onerror(messageOf(err, m.starboard.errorRemoveEmote()));
    } finally {
      emoteBusy = false;
    }
  }

  async function create(request: { mode: "existing" | "new"; channelId: string; name: string; emote: string; threshold: number }) {
    creating = true;
    createProblem = null;
    try {
      const id =
        request.mode === "existing"
          ? await starboardApi.createStarboard(guildId, BigInt(request.channelId), request.emote, request.threshold)
          : (await starboardApi.setupStarboard(guildId, request.name, request.emote, request.threshold)).starboardId;
      await onreload();
      creatingNew = false;
      editingId = Number(id);
      onsuccess(m.starboard.notifyCreated());
    } catch (err) {
      logger.error("Failed to create starboard:", err);
      createProblem = messageOf(err, m.starboard.errorCreate());
    } finally {
      creating = false;
    }
  }

  async function remove(starboard: Starboard) {
    const confirmed = await requestConfirmation({
      message: m.starboard.deleteConfirm({ channel: nameOf(starboard) }),
      confirmText: m.common.delete()
    });
    if (!confirmed) return;
    try {
      await starboardApi.deleteStarboard(guildId, starboard.id);
      starboards = starboards.filter(s => s.id !== starboard.id);
      if (editingId === starboard.id) editingId = null;
      onsuccess(m.starboard.notifyDeleted());
    } catch (err) {
      logger.error("Failed to delete starboard:", err);
      onerror(messageOf(err, m.starboard.errorDelete()));
    }
  }
</script>

{#snippet newButton()}
  <button
    type="button"
    class="flex items-center justify-center gap-2 px-5 rounded-xl min-h-[50px] font-medium"
    style={buttonStyle}
    onclick={() => {
      createProblem = null;
      creatingNew = true;
    }}
  >
    <i class="fa-solid fa-plus" aria-hidden="true"></i>
    {m.starboard.newStarboard()}
  </button>
{/snippet}

<PluginCard title={m.starboard.cardListTitle()} actions={newButton}>
  {#if loading}
    <div class="flex justify-center py-6">
      <div class="w-10 h-10 border-4 rounded-full animate-spin" style="border-color: {$colorStore.primary}20; border-top-color: {$colorStore.primary}"></div>
    </div>
  {:else if sorted.length === 0}
    <div class="flex flex-col items-center gap-3 py-8 text-center">
      <i class="fa-solid fa-star" style="color: {$colorStore.muted}; font-size: 28px;" aria-hidden="true"></i>
      <p class="font-medium" style="color: {$colorStore.text}">{m.starboard.emptyTitle()}</p>
    </div>
  {:else}
    <div class="space-y-2">
      {#each sorted as starboard (starboard.id)}
        <StarboardRow
          {starboard}
          channelName={nameOf(starboard)}
          onedit={() => (editingId = starboard.id)}
          ontoggle={(enabled) => apply(starboard.id, { enabled }, false)}
          ondelete={() => remove(starboard)}
        />
      {/each}
    </div>
  {/if}
</PluginCard>

{#if editing}
  {#key editing.id}
    <StarboardEditor
      {guildId}
      starboard={editing}
      {channels}
      {roles}
      {emojis}
      {placeholders}
      busy={emoteBusy}
      {autoSave}
      {user}
      onchange={change}
      onaddemote={addEmote}
      onremoveemote={removeEmote}
      onsetids={setIds}
      onclose={close}
      {onerror}
      {onsuccess}
    />
  {/key}
{/if}

{#if creatingNew}
  <NewStarboardSheet {channels} {emojis} {creating} problem={createProblem} oncreate={create} onclose={() => (creatingNew = false)} />
{/if}
