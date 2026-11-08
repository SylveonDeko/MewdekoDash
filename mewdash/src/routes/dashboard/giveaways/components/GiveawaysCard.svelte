<script lang="ts">
  import { m } from "$lib/i18n";
  import { giveawaysApi, type Giveaway } from "$lib/api/index.ts";
  import type { GuildEmojiInfo } from "$lib/api/client/models";
  import { colorStore } from "$lib/stores/colorStore";
  import { logger } from "$lib/logger";
  import { requestConfirmation } from "$lib/stores/confirmationStore";
  import PluginCard from "$lib/components/plugin/PluginCard.svelte";
  import type { AutoSave } from "$lib/utils/autoSave.svelte";
  import type { DiscordUser } from "$lib/types/discord";
  import GiveawayDetails from "./GiveawayDetails.svelte";
  import GiveawayEditor from "./GiveawayEditor.svelte";
  import GiveawayRow from "./GiveawayRow.svelte";
  import {
    GiveawayStatus,
    PrizeType,
    formatExtraEntries,
    parseUtc,
    prizeProblem,
    toGiveaway,
    type ExtraEntry,
    type GiveawayForm
  } from "./giveawayModel";

  type Named = { id: string; name: string; color?: number };
  type View = "running" | "ended" | "drafts";

  interface Props {
    guildId: bigint;
    giveaways: Giveaway[];
    entryCounts: Record<string, number>;
    loading: boolean;
    channels: Named[];
    roles: Named[];
    emojis: GuildEmojiInfo[];
    defaultEmote: string | null;
    autoSave: AutoSave;
    user?: DiscordUser | null;
    onreload: () => Promise<void>;
    onerror: (message: string) => void;
    onsuccess: (message: string) => void;
  }

  let {
    guildId,
    giveaways = $bindable(),
    entryCounts,
    loading,
    channels,
    roles,
    emojis,
    defaultEmote,
    autoSave,
    user = null,
    onreload,
    onerror,
    onsuccess
  }: Props = $props();

  const PAGE = 25;

  let view: View = $state("running");
  let search = $state("");
  let shown = $state(PAGE);
  let creating = $state(false);
  let busy = $state(false);
  let openId: number | null = $state(null);

  const running = $derived(giveaways.filter(g => g.ended === GiveawayStatus.Active));
  const ended = $derived(giveaways.filter(g => g.ended === GiveawayStatus.Ended));
  const drafts = $derived(giveaways.filter(g => g.ended === GiveawayStatus.Draft));

  const views = $derived([
    { id: "running" as View, label: m.giveaways.viewRunning(), count: running.length },
    { id: "ended" as View, label: m.common.ended(), count: ended.length },
    { id: "drafts" as View, label: m.giveaways.viewDrafts(), count: drafts.length }
  ]);

  const visible = $derived.by(() => {
    const needle = search.trim().toLowerCase();
    const source = view === "running" ? running : view === "ended" ? ended : drafts;
    const list = source.filter(g => !needle || (g.item ?? "").toLowerCase().includes(needle));
    const time = (g: Giveaway) => parseUtc(g.when).getTime();
    if (view === "running") return [...list].sort((a, b) => time(a) - time(b));
    if (view === "ended") return [...list].sort((a, b) => time(b) - time(a));
    return [...list].sort((a, b) => a.id - b.id);
  });

  const details = $derived(giveaways.find(g => g.id === openId) ?? null);

  const emptyText = $derived(
    search.trim()
      ? m.giveaways.noMatches()
      : view === "running"
        ? m.giveaways.emptyRunning()
        : view === "ended"
          ? m.giveaways.emptyEnded()
          : m.giveaways.emptyDrafts()
  );

  const buttonStyle = $derived(
    `background: ${$colorStore.primary}20; color: ${$colorStore.text}; border: 1px solid ${$colorStore.primary}30;`
  );

  function channelName(giveaway: Giveaway): string {
    return channels.find(c => String(c.id) === String(giveaway.channelId))?.name ?? String(giveaway.channelId);
  }

  function entriesOf(giveaway: Giveaway): number | null {
    if (!giveaway.useButton && !giveaway.useCaptcha) return null;
    if (giveaway.ended === GiveawayStatus.Draft) return null;
    return entryCounts[String(giveaway.id)] ?? 0;
  }

  function message(err: unknown, fallback: string): string {
    return err instanceof Error && err.message ? err.message : fallback;
  }

  function setView(next: View) {
    view = next;
    shown = PAGE;
  }

  async function submit(form: GiveawayForm, draft: boolean) {
    if (busy) return;
    if (!user?.id) {
      onerror(m.giveaways.notSignedIn());
      return;
    }
    busy = true;
    try {
      const created = await giveawaysApi.createGiveaway(guildId, toGiveaway(form, guildId, BigInt(String(user.id)), draft));
      giveaways = [...giveaways.filter(g => g.id !== created.id), created];
      creating = false;
      setView(draft ? "drafts" : "running");
      onsuccess(draft ? m.giveaways.draftSaved() : m.giveaways.started());
    } catch (err) {
      logger.error("Failed to create giveaway:", err);
      onerror(message(err, m.giveaways.createFailed()));
    } finally {
      busy = false;
    }
  }

  async function end(giveaway: Giveaway) {
    const confirmed = await requestConfirmation({
      message: m.giveaways.endConfirm({ name: giveaway.item ?? "" }),
      confirmText: m.giveaways.endNow()
    });
    if (!confirmed) return;
    try {
      await giveawaysApi.endGiveaway(guildId, giveaway.id);
      onsuccess(m.giveaways.notifyEnded());
    } catch (err) {
      logger.error("Failed to end giveaway:", err);
      onerror(message(err, m.giveaways.endFailed()));
    }
    await onreload();
  }

  async function reroll(giveaway: Giveaway) {
    try {
      await giveawaysApi.rerollGiveaway(guildId, giveaway.id);
      onsuccess(m.giveaways.rerolled());
    } catch (err) {
      logger.error("Failed to reroll giveaway:", err);
      onerror(message(err, m.giveaways.rerollFailed()));
    }
  }

  async function startDraft(giveaway: Giveaway) {
    try {
      const started = await giveawaysApi.startDraft(guildId, giveaway.id);
      giveaways = [...giveaways.filter(g => g.id !== giveaway.id && g.id !== started.id), started];
      setView("running");
      onsuccess(m.giveaways.started());
    } catch (err) {
      logger.error("Failed to start draft:", err);
      onerror(message(err, m.giveaways.startFailed()));
    }
  }

  async function removeDraft(giveaway: Giveaway) {
    const confirmed = await requestConfirmation({
      message: m.giveaways.deleteConfirm({ name: giveaway.item ?? "" }),
      confirmText: m.common.delete()
    });
    if (!confirmed) return;
    try {
      await giveawaysApi.deleteDraft(guildId, giveaway.id);
      giveaways = giveaways.filter(g => g.id !== giveaway.id);
    } catch (err) {
      logger.error("Failed to delete draft:", err);
      onerror(message(err, m.giveaways.deleteFailed()));
    }
  }

  function changeOptions(id: number, extra: ExtraEntry[], prizeType: number, prizeAmount: number, typing: boolean) {
    const extraEntryRoles = formatExtraEntries(extra);
    giveaways = giveaways.map(g => (g.id === id ? { ...g, extraEntryRoles, prizeType, prizeAmount } : g));
    if (prizeProblem(prizeType, prizeAmount)) return;
    const send = async () => {
      try {
        await giveawaysApi.updateOptions(guildId, id, {
          extraEntryRoles,
          prizeType,
          prizeAmount: prizeType === PrizeType.None ? 0 : prizeAmount
        });
      } catch (err) {
        await onreload();
        throw err;
      }
    };
    if (typing) autoSave.schedule(`giveaway:${id}`, send);
    else void autoSave.now(`giveaway:${id}`, send);
  }

  function closeDetails() {
    if (openId !== null) void autoSave.flush(`giveaway:${openId}`);
    openId = null;
  }
</script>

{#snippet newButton()}
  <button type="button" class="flex items-center justify-center gap-2 px-5 rounded-xl min-h-[50px] font-medium" style={buttonStyle} onclick={() => (creating = true)}>
    <i class="fa-solid fa-plus" aria-hidden="true"></i>
    {m.giveaways.newGiveaway()}
  </button>
{/snippet}

<PluginCard title={m.features.giveawaysName()} actions={newButton}>
  {#if loading}
    <div class="flex justify-center py-6">
      <div class="w-10 h-10 border-4 rounded-full animate-spin" style="border-color: {$colorStore.primary}20; border-top-color: {$colorStore.primary}"></div>
    </div>
  {:else}
    <div class="space-y-3">
      <div class="grid grid-cols-3 gap-2" role="group" aria-label={m.giveaways.viewAria()}>
        {#each views as option (option.id)}
          {@const selected = view === option.id}
          <button
            type="button"
            class="min-h-[50px] px-2 rounded-lg border text-sm font-medium flex items-center justify-center gap-2"
            style="background: {selected ? $colorStore.selectedSurface : `${$colorStore.primary}08`}; border-color: {selected ? $colorStore.selectedBorder : `${$colorStore.primary}20`}; color: {$colorStore.text};"
            aria-pressed={selected}
            onclick={() => setView(option.id)}
          >
            {option.label}
            <span class="text-xs" style="color: {$colorStore.muted}">{option.count}</span>
          </button>
        {/each}
      </div>

      {#if giveaways.length > 4}
        <input
          type="search"
          bind:value={search}
          placeholder={m.giveaways.searchPlaceholder()}
          aria-label={m.giveaways.searchPlaceholder()}
          class="w-full p-3 rounded-lg border focus:ring-2 min-h-[50px]"
          style="background: {$colorStore.primary}10; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
        >
      {/if}

      {#if visible.length === 0}
        <div class="flex flex-col items-center gap-3 py-8 text-center">
          <i class="fa-solid fa-gift" style="color: {$colorStore.muted}; font-size: 28px;" aria-hidden="true"></i>
          <p style="color: {$colorStore.muted}">{emptyText}</p>
        </div>
      {:else}
        <div class="space-y-2">
          {#each visible.slice(0, shown) as giveaway (giveaway.id)}
            <GiveawayRow
              {giveaway}
              channelName={channelName(giveaway)}
              entries={entriesOf(giveaway)}
              onopen={() => (openId = giveaway.id)}
              onend={() => end(giveaway)}
              onreroll={() => reroll(giveaway)}
              onstart={() => startDraft(giveaway)}
              ondelete={() => removeDraft(giveaway)}
            />
          {/each}
        </div>
        {#if visible.length > shown}
          <button type="button" class="w-full px-5 rounded-xl min-h-[50px] font-medium" style={buttonStyle} onclick={() => (shown += PAGE)}>
            {m.common.moreCount({ count: visible.length - shown })}
          </button>
        {/if}
      {/if}
    </div>
  {/if}
</PluginCard>

{#if creating}
  <GiveawayEditor
    {channels}
    {roles}
    {emojis}
    {defaultEmote}
    {busy}
    onstart={(form) => submit(form, false)}
    ondraft={(form) => submit(form, true)}
    onclose={() => (creating = false)}
  />
{/if}

{#if details}
  {#key details.id}
    <GiveawayDetails
      giveaway={details}
      {channels}
      {roles}
      entries={entriesOf(details)}
      {autoSave}
      onoptions={(extra, prizeType, prizeAmount, typing) => changeOptions(details.id, extra, prizeType, prizeAmount, typing)}
      onclose={closeDetails}
    />
  {/key}
{/if}
