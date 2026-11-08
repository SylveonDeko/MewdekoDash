<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import { m } from "$lib/i18n";
  import { musicApi } from "$lib/api/index.ts";
  import { colorStore } from "$lib/stores/colorStore";
  import { logger } from "$lib/logger";
  import { requestConfirmation } from "$lib/stores/confirmationStore";
  import Card from "$lib/components/analytics/Card.svelte";
  import { FILTER_KEYS, readPlayer, type PlayerView } from "./musicModel";

  interface Props {
    guildId: bigint;
    userId: bigint | null;
    notify: (message: string, type?: "success" | "error") => void;
  }

  let { guildId, userId, notify }: Props = $props();

  const UP_NEXT_LIMIT = 10;
  const POLL_MS = 5000;

  let player = $state<PlayerView | null>(null);
  let busy = $state(false);
  let timer: ReturnType<typeof setInterval> | undefined;

  const filterLabels = $derived<Record<(typeof FILTER_KEYS)[number], string>>({
    bassboost: m.music.filterBassboost(),
    nightcore: m.music.filterNightcore(),
    vaporwave: m.music.filterVaporwave(),
    karaoke: m.music.filterKaraoke(),
    tremolo: m.music.filterTremolo(),
    vibrato: m.music.filterVibrato(),
    rotation: m.music.filterRotation(),
    distortion: m.music.filterDistortion()
  });

  const repeatModes = $derived([
    { id: "off", value: 0, icon: "fa-xmark", label: m.common.off() },
    { id: "track", value: 1, icon: "fa-repeat-1", label: m.common.track() },
    { id: "queue", value: 2, icon: "fa-repeat", label: m.music.repeatLiveQueue() }
  ]);

  async function refresh() {
    if (userId === null) return;
    try {
      const read = readPlayer(await musicApi.getPlayerStatus(guildId, userId));
      player = read?.playingTrack ? read.view : null;
    } catch {
      player = null;
    }
  }

  async function run(action: () => Promise<unknown>, failure: string) {
    if (busy) return;
    busy = true;
    try {
      await action();
      await refresh();
    } catch (err) {
      logger.error(failure, err);
      notify(failure, "error");
    } finally {
      busy = false;
    }
  }

  async function clear() {
    if (!(await requestConfirmation({ message: m.music.queueClearConfirm(), confirmText: m.music.queueClear() }))) return;
    await run(() => musicApi.clearQueue(guildId), m.music.notifyQueueClearFailed());
  }

  onMount(() => {
    void refresh();
    timer = setInterval(refresh, POLL_MS);
  });

  onDestroy(() => {
    if (timer) clearInterval(timer);
  });

  function tint(active: boolean) {
    return `background: ${active ? $colorStore.selectedSurface : `${$colorStore.primary}08`}; border-color: ${active ? $colorStore.selectedBorder : `${$colorStore.primary}20`}; color: ${$colorStore.text};`;
  }

  const plain = $derived(`background: ${$colorStore.primary}10; border-color: ${$colorStore.primary}20; color: ${$colorStore.text};`);
</script>

{#if player}
  <Card title={m.common.nowPlaying()}>
    <div class="mt-3 space-y-4">
      <div class="flex items-center gap-3 min-w-0">
        {#if player.artwork}
          <img src={player.artwork} alt={m.music.albumArtAlt()} class="w-16 h-16 rounded-lg object-cover shrink-0" />
        {/if}
        <div class="min-w-0">
          <p class="font-medium truncate" style="color: {$colorStore.text}">{player.title}</p>
          <p class="text-sm truncate" style="color: {$colorStore.muted}">{player.author}</p>
          {#if player.channelName}
            <p class="text-xs truncate" style="color: {$colorStore.muted}">{m.music.playerConnectedTo({ channel: player.channelName })}</p>
          {/if}
        </div>
      </div>

      <div class="grid grid-cols-2 sm:grid-cols-5 gap-2">
        <button type="button" class="min-h-[44px] rounded-lg border text-sm disabled:opacity-50 flex items-center justify-center gap-2" style={plain} disabled={busy} onclick={() => run(() => musicApi.previousTrack(guildId), m.music.srPreviousFailed())}>
          <i class="fa-solid fa-backward-step" aria-hidden="true"></i>{m.common.previous()}
        </button>
        <button type="button" class="min-h-[44px] rounded-lg border text-sm disabled:opacity-50 flex items-center justify-center gap-2" style={plain} disabled={busy} onclick={() => run(() => musicApi.pauseResume(guildId), m.music.srToggleFailed())}>
          <i class="fa-solid {player.playing ? 'fa-pause' : 'fa-play'}" aria-hidden="true"></i>{player.playing ? m.common.pause() : m.music.playerPlay()}
        </button>
        <button type="button" class="min-h-[44px] rounded-lg border text-sm disabled:opacity-50 flex items-center justify-center gap-2" style={plain} disabled={busy} onclick={() => run(() => musicApi.skipTrack(guildId), m.music.srSkipFailed())}>
          <i class="fa-solid fa-forward-step" aria-hidden="true"></i>{m.music.npSkip()}
        </button>
        <button type="button" class="min-h-[44px] rounded-lg border text-sm disabled:opacity-50 flex items-center justify-center gap-2" style={plain} disabled={busy || player.queue.length < 2} onclick={() => run(() => musicApi.shuffleQueue(guildId), m.music.notifyQueueShuffleFailed())}>
          <i class="fa-solid fa-shuffle" aria-hidden="true"></i>{m.music.queueShuffle()}
        </button>
        <button type="button" class="min-h-[44px] rounded-lg border text-sm disabled:opacity-50 flex items-center justify-center gap-2 col-span-2 sm:col-span-1" style={plain} disabled={busy || player.queue.length === 0} onclick={clear}>
          <i class="fa-solid fa-trash" aria-hidden="true"></i>{m.music.queueClear()}
        </button>
      </div>

      <div class="grid grid-cols-3 gap-2" role="group" aria-label={m.common.repeat()}>
        {#each repeatModes as mode (mode.id)}
          {@const active = player.repeat === mode.value}
          <button
            type="button"
            class="min-h-[44px] rounded-lg border text-sm disabled:opacity-50 flex items-center justify-center gap-2"
            style={tint(active)}
            disabled={busy}
            aria-pressed={active}
            onclick={() => run(() => musicApi.setRepeatMode(guildId, mode.id), m.music.notifyRepeatFailed())}
          >
            <i class="fa-solid {mode.icon}" aria-hidden="true"></i>{mode.label}
          </button>
        {/each}
      </div>

      <div>
        <p class="text-sm font-medium mb-2" style="color: {$colorStore.text}">{m.music.filtersTitle()}</p>
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {#each FILTER_KEYS as key (key)}
            {@const active = player.filters[key] === true}
            <button
              type="button"
              class="min-h-[44px] rounded-lg border text-sm disabled:opacity-50"
              style={tint(active)}
              disabled={busy}
              aria-pressed={active}
              onclick={() => run(() => musicApi.toggleFilter(guildId, key, !active), m.music.notifyFilterFailed())}
            >
              {filterLabels[key]}
            </button>
          {/each}
        </div>
      </div>

      {#if player.queue.length}
        <div>
          <p class="text-sm font-medium mb-2" style="color: {$colorStore.text}">{m.music.npUpNext()}</p>
          <div class="space-y-2">
            {#each player.queue.slice(0, UP_NEXT_LIMIT) as entry (entry.index)}
              <div class="flex items-center gap-2 rounded-xl border p-2 min-w-0" style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}20;">
                <div class="grow min-w-0 px-1">
                  <p class="text-sm font-medium truncate" style="color: {$colorStore.text}">{entry.title}</p>
                  <p class="text-sm truncate" style="color: {$colorStore.muted}">{entry.author}</p>
                </div>
                <button
                  type="button"
                  class="shrink-0 rounded-lg border min-h-[44px] min-w-[44px] disabled:opacity-50"
                  style={plain}
                  disabled={busy}
                  aria-label={m.music.npPlayNow({ title: entry.title })}
                  onclick={() => run(() => musicApi.playTrackAt(guildId, entry.index), m.music.srPlayTrackFailed())}
                >
                  <i class="fa-solid fa-play" aria-hidden="true"></i>
                </button>
                <button
                  type="button"
                  class="shrink-0 rounded-lg border min-h-[44px] min-w-[44px] disabled:opacity-50"
                  style={plain}
                  disabled={busy}
                  aria-label={m.music.npRemove({ title: entry.title })}
                  onclick={() => run(() => musicApi.removeTrack(guildId, entry.index), m.music.srRemoveFailed())}
                >
                  <i class="fa-solid fa-trash" aria-hidden="true"></i>
                </button>
              </div>
            {/each}
          </div>
          {#if player.queue.length > UP_NEXT_LIMIT}
            <p class="text-sm mt-2" style="color: {$colorStore.muted}">{m.music.npMore({ count: player.queue.length - UP_NEXT_LIMIT })}</p>
          {/if}
        </div>
      {/if}
    </div>
  </Card>
{/if}
