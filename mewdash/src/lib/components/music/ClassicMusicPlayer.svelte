<!-- lib/components/music/ClassicMusicPlayer.svelte -->
<script lang="ts">
  import type { MusicStatus } from "$lib/types/music";
  import type { QueueTrack } from "$lib/api/music/models/Music";

  /**
   * Classic skin for the music player: the Winamp 2.x main window and
   * playlist editor, drawn in CSS. Audio plays in Discord, so the analyser is
   * a simulation that runs while the player reports it is playing. All
   * controls call back into MusicPlayer, which owns the API calls.
   */
  interface Props {
    musicStatus: MusicStatus;
    /** Current position in seconds, kept ticking by the parent. */
    currentProgress: number;
    onPlayPause: () => void;
    onStop: () => void;
    onPrevious: () => void;
    onNext: () => void;
    onSeek: (seconds: number) => void;
    onVolume: (percent: number) => void;
    onPlayIndex: (index: number) => void;
    onRemove: (index: number) => void;
    onOpenSearch: () => void;
    onShuffle: () => void;
    onRepeat: () => void;
    onSwitchSkin: () => void;
  }

  let {
    musicStatus,
    currentProgress,
    onPlayPause,
    onStop,
    onPrevious,
    onNext,
    onSeek,
    onVolume,
    onPlayIndex,
    onRemove,
    onOpenSearch,
    onShuffle,
    onRepeat,
    onSwitchSkin
  }: Props = $props();

  let selected = $state(-1);
  let seekBar: HTMLDivElement | undefined = $state();

  const BAR_COUNT = 19;
  const bars = Array.from({ length: BAR_COUNT }, (_, i) => i);

  /** Parses "h:mm:ss" or "mm:ss" into seconds. */
  function toSeconds(value: string | undefined | null): number {
    if (!value) return 0;
    const parts = value.split(":").map((p) => parseFloat(p));
    if (parts.some((p) => Number.isNaN(p))) return 0;
    if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
    if (parts.length === 2) return parts[0] * 60 + parts[1];
    return parts[0] ?? 0;
  }

  /** Formats seconds as m:ss, the way the LCD shows it. */
  function clock(seconds: number): string {
    const total = Math.max(0, Math.floor(seconds));
    const m = Math.floor(total / 60);
    const s = total % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  }

  let track = $derived(musicStatus?.CurrentTrack?.Track ?? null);
  let playing = $derived(musicStatus?.State === 2);
  let stopped = $derived(!track);
  let duration = $derived(toSeconds(track?.Duration));
  let progressPercent = $derived(duration > 0 ? Math.min(100, (currentProgress / duration) * 100) : 0);
  let volumePercent = $derived(Math.round((musicStatus?.Volume ?? 1) * 100));
  let queue = $derived<QueueTrack[]>(musicStatus?.Queue ?? []);
  let repeatMode = $derived(musicStatus?.RepeatMode ?? 0);

  /** Title line in the classic "N. Artist - Title (m:ss)" form. */
  let marquee = $derived.by(() => {
    if (!track) return "Mewdeko - Winamp mode *** nothing playing ***";
    const index = (musicStatus?.CurrentTrack?.Index ?? 0) + 1;
    return `${index}. ${track.Author} - ${track.Title} (${clock(duration)})`;
  });

  /** Total queue duration for the playlist footer. */
  let queueTotal = $derived(clock(queue.reduce((sum, item) => sum + toSeconds(item.Track?.Duration), 0)));

  let sourceLabel = $derived((track?.SourceName ?? track?.Provider ?? "").slice(0, 7).toUpperCase() || "---");

  function handleSeekClick(event: MouseEvent) {
    if (!seekBar || duration <= 0) return;
    const rect = seekBar.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
    onSeek(Math.floor(duration * ratio));
  }

  function handleSeekKey(event: KeyboardEvent) {
    if (duration <= 0) return;
    if (event.key === "ArrowLeft") onSeek(Math.max(0, currentProgress - 5));
    if (event.key === "ArrowRight") onSeek(Math.min(duration, currentProgress + 5));
  }

  function handleVolumeInput(event: Event) {
    onVolume(parseInt((event.target as HTMLInputElement).value));
  }

  function removeSelected() {
    if (selected < 0 || selected >= queue.length) return;
    onRemove(selected);
    selected = -1;
  }

  function isCurrent(item: QueueTrack): boolean {
    const now = musicStatus?.CurrentTrack?.Track;
    return !!now && item.Track?.Title === now.Title && item.Track?.Author === now.Author;
  }
</script>

<div class="wa" class:wa-playing={playing}>
  <!-- Main window -->
  <section class="wa-window wa-main" aria-label="Classic music player">
    <header class="wa-titlebar">
      <span class="wa-titlebar-lines"></span>
      <span class="wa-titlebar-text">MEWDEKO AMP</span>
      <span class="wa-titlebar-lines"></span>
      <button type="button" class="wa-titlebar-btn" title="Switch to the modern player" aria-label="Switch to the modern player" onclick={onSwitchSkin}>
        <span aria-hidden="true">▣</span>
      </button>
    </header>

    <div class="wa-body">
      <div class="wa-left">
        <div class="wa-lamps" aria-hidden="true">
          <span class="wa-lamp" class:on={playing}>▶</span>
          <span class="wa-lamp" class:on={!playing && !stopped}>❚❚</span>
          <span class="wa-lamp" class:on={stopped}>■</span>
        </div>
        <div class="wa-time" aria-live="off">{stopped ? "--:--" : clock(currentProgress)}</div>
        <div class="wa-analyser" aria-hidden="true">
          {#each bars as bar}
            <span class="wa-bar" style="--i: {bar};"></span>
          {/each}
        </div>
      </div>

      <div class="wa-right">
        <div class="wa-marquee" title={marquee}>
          <span class="wa-marquee-text" class:wa-scroll={marquee.length > 34}>{marquee}{marquee.length > 34 ? "   ***   " + marquee : ""}</span>
        </div>
        <div class="wa-meta">
          <span class="wa-meta-field"><span class="wa-meta-num">{volumePercent}</span> vol</span>
          <span class="wa-meta-field"><span class="wa-meta-num">{sourceLabel}</span></span>
          <span class="wa-lamp-pair" aria-hidden="true">
            <span class="wa-lamp" class:on={!!track}>mono</span>
            <span class="wa-lamp" class:on={playing}>stereo</span>
          </span>
        </div>
        <div class="wa-sliders">
          <label class="wa-slider">
            <span class="sr-only">Volume</span>
            <input type="range" min="0" max="100" value={volumePercent} oninput={handleVolumeInput} aria-label="Volume" />
          </label>
          <div class="wa-toggles">
            <button type="button" class="wa-toggle" onclick={onShuffle} title="Shuffle the queue">SHUFFLE</button>
            <button type="button" class="wa-toggle" class:on={repeatMode > 0} onclick={onRepeat} title="Cycle repeat mode">
              REPEAT{repeatMode === 1 ? " 1" : ""}
            </button>
          </div>
        </div>
      </div>
    </div>

    <div
      bind:this={seekBar}
      class="wa-seek"
      role="slider"
      tabindex="0"
      aria-label="Seek"
      aria-valuemin="0"
      aria-valuemax={Math.round(duration)}
      aria-valuenow={Math.round(currentProgress)}
      onclick={handleSeekClick}
      onkeydown={handleSeekKey}
    >
      <span class="wa-seek-thumb" style="left: calc({progressPercent}% - 14px);"></span>
    </div>

    <div class="wa-transport">
      <div class="wa-buttons">
        <button type="button" class="wa-btn" onclick={onPrevious} title="Previous" aria-label="Previous">⏮</button>
        <button type="button" class="wa-btn" onclick={onPlayPause} title={playing ? "Pause" : "Play"} aria-label={playing ? "Pause" : "Play"}>{playing ? "❚❚" : "▶"}</button>
        <button type="button" class="wa-btn" onclick={onStop} title="Stop" aria-label="Stop">■</button>
        <button type="button" class="wa-btn" onclick={onNext} title="Next" aria-label="Next">⏭</button>
        <button type="button" class="wa-btn wa-btn-eject" onclick={onOpenSearch} title="Add a track" aria-label="Add a track">⏏</button>
      </div>
      <div class="wa-transport-lamps" aria-hidden="true">
        <span class="wa-lamp on">EQ</span>
        <span class="wa-lamp on">PL</span>
      </div>
    </div>
  </section>

  <!-- Playlist editor -->
  <section class="wa-window wa-playlist" aria-label="Playlist">
    <header class="wa-titlebar">
      <span class="wa-titlebar-lines"></span>
      <span class="wa-titlebar-text">PLAYLIST EDITOR</span>
      <span class="wa-titlebar-lines"></span>
    </header>

    <div class="wa-list" role="listbox" aria-label="Queue" tabindex="0">
      {#if queue.length === 0}
        <div class="wa-list-empty">no tracks queued. press eject to add one.</div>
      {:else}
        {#each queue as item, i (item.Index ?? i)}
          <div
            class="wa-row"
            class:current={isCurrent(item)}
            class:selected={selected === i}
            role="option"
            aria-selected={selected === i}
            tabindex="-1"
            onclick={() => (selected = i)}
            ondblclick={() => onPlayIndex(i)}
            onkeydown={(e) => { if (e.key === "Enter") onPlayIndex(i); }}
          >
            <span class="wa-row-title">{i + 1}. {item.Track?.Author} - {item.Track?.Title}</span>
            <span class="wa-row-time">{clock(toSeconds(item.Track?.Duration))}</span>
          </div>
        {/each}
      {/if}
    </div>

    <footer class="wa-list-footer">
      <div class="wa-list-actions">
        <button type="button" class="wa-toggle" onclick={onOpenSearch}>ADD</button>
        <button type="button" class="wa-toggle" onclick={removeSelected} disabled={selected < 0}>REM</button>
        <button type="button" class="wa-toggle" onclick={() => selected >= 0 && onPlayIndex(selected)} disabled={selected < 0}>PLAY</button>
      </div>
      <div class="wa-list-total">{queue.length} tracks / {queueTotal}</div>
    </footer>
  </section>
</div>

<style>
  /*
    Classic Winamp 2.x chrome. Every colour is a token so the guild palette
    can tint it: the LCD takes the primary hue, the bevels stay neutral.
  */
  .wa {
    --wa-lcd: color-mix(in oklch, var(--color-primary, #37ff37) 45%, #5cff5c);
    --wa-lcd-dim: color-mix(in srgb, var(--wa-lcd) 35%, #000000);
    --wa-lcd-bg: #000000;
    --wa-face: #2b2b36;
    --wa-face-hi: #4a4a5c;
    --wa-face-lo: #15151c;
    --wa-title: color-mix(in oklch, var(--color-primary, #4c6fd1) 35%, #26264a);
    --wa-title-text: #d7dcff;
    --wa-selected: color-mix(in srgb, var(--color-primary, #0000ff) 60%, #000040);
    --wa-font: "Lucida Console", "Monaco", "DejaVu Sans Mono", "Courier New", monospace;
    display: flex;
    flex-direction: column;
    gap: 2px;
    width: 100%;
    max-width: 560px;
    margin: 0 auto;
    font-family: var(--wa-font);
    font-size: 11px;
    line-height: 1;
    color: var(--wa-lcd);
    user-select: none;
    text-shadow: none;
  }

  .wa-window {
    background: var(--wa-face);
    border: 1px solid var(--wa-face-lo);
    box-shadow: inset 1px 1px 0 var(--wa-face-hi), inset -1px -1px 0 var(--wa-face-lo), 0 8px 24px rgba(0, 0, 0, 0.6);
    padding: 3px;
  }

  .wa-titlebar {
    display: flex;
    align-items: center;
    gap: 6px;
    height: 16px;
    padding: 0 4px;
    background: linear-gradient(180deg, var(--wa-title), color-mix(in srgb, var(--wa-title) 60%, #000));
    color: var(--wa-title-text);
    font-size: 9px;
    letter-spacing: 1px;
    font-weight: 700;
  }

  .wa-titlebar-lines {
    flex: 1;
    height: 6px;
    background: repeating-linear-gradient(180deg, rgba(255, 255, 255, 0.35) 0 1px, transparent 1px 3px);
  }

  .wa-titlebar-btn {
    width: 14px;
    height: 12px;
    display: grid;
    place-items: center;
    background: var(--wa-face);
    color: var(--wa-title-text);
    border: 1px solid var(--wa-face-lo);
    box-shadow: inset 1px 1px 0 var(--wa-face-hi);
    font-size: 9px;
    cursor: pointer;
  }

  .wa-body {
    display: grid;
    grid-template-columns: 150px 1fr;
    gap: 8px;
    padding: 8px 6px 4px;
  }

  @media (max-width: 480px) {
    .wa-body {
      grid-template-columns: 1fr;
    }
  }

  .wa-left {
    display: grid;
    grid-template-columns: 24px 1fr;
    grid-template-rows: auto auto;
    column-gap: 6px;
    row-gap: 4px;
    align-items: center;
  }

  .wa-lamps {
    display: flex;
    flex-direction: column;
    gap: 3px;
    grid-row: 1;
  }

  .wa-lamp {
    color: var(--wa-lcd-dim);
    font-size: 8px;
    letter-spacing: 0.5px;
  }

  .wa-lamp.on {
    color: var(--wa-lcd);
    text-shadow: 0 0 6px var(--wa-lcd);
  }

  .wa-time {
    grid-row: 1;
    height: 30px;
    padding: 2px 8px;
    background: var(--wa-lcd-bg);
    border: 1px solid var(--wa-face-lo);
    box-shadow: inset 1px 1px 0 #000, inset 0 0 12px rgba(0, 0, 0, 0.8);
    font-size: 24px;
    font-weight: 700;
    letter-spacing: 2px;
    text-align: right;
    text-shadow: 0 0 8px var(--wa-lcd);
    font-variant-numeric: tabular-nums;
  }

  .wa-analyser {
    grid-column: 1 / -1;
    display: flex;
    align-items: flex-end;
    gap: 2px;
    height: 30px;
    padding: 2px;
    background: var(--wa-lcd-bg);
    border: 1px solid var(--wa-face-lo);
  }

  .wa-bar {
    flex: 1;
    height: 6%;
    background: linear-gradient(180deg, #ff4040, #ffd040 40%, var(--wa-lcd) 100%);
    transition: height 320ms ease-out;
    transform-origin: bottom;
  }

  .wa-playing .wa-bar {
    animation: wa-bounce 720ms ease-in-out infinite alternate;
    animation-delay: calc(var(--i) * -83ms);
    animation-duration: calc(560ms + (var(--i) * 37ms));
  }

  @keyframes wa-bounce {
    0% { height: 12%; }
    30% { height: 62%; }
    55% { height: 38%; }
    80% { height: 90%; }
    100% { height: 22%; }
  }

  @media (prefers-reduced-motion: reduce) {
    .wa-playing .wa-bar {
      animation: none;
      height: 40%;
    }
    .wa-scroll {
      animation: none !important;
    }
  }

  .wa-right {
    display: flex;
    flex-direction: column;
    gap: 6px;
    min-width: 0;
  }

  .wa-marquee {
    height: 16px;
    padding: 3px 4px;
    background: var(--wa-lcd-bg);
    border: 1px solid var(--wa-face-lo);
    overflow: hidden;
    white-space: nowrap;
    font-size: 10px;
    letter-spacing: 0.5px;
    text-shadow: 0 0 4px var(--wa-lcd);
  }

  .wa-marquee-text {
    display: inline-block;
  }

  .wa-scroll {
    animation: wa-marquee 18s linear infinite;
  }

  @keyframes wa-marquee {
    from { transform: translateX(0); }
    to { transform: translateX(-50%); }
  }

  .wa-meta {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 8px;
    color: var(--wa-lcd-dim);
  }

  .wa-meta-num {
    display: inline-block;
    min-width: 28px;
    padding: 2px 3px;
    background: var(--wa-lcd-bg);
    border: 1px solid var(--wa-face-lo);
    color: var(--wa-lcd);
    text-align: right;
    font-size: 9px;
  }

  .wa-lamp-pair {
    display: flex;
    gap: 6px;
    margin-left: auto;
  }

  .wa-sliders {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .wa-slider {
    flex: 1;
    display: block;
    height: 12px;
    background: linear-gradient(90deg, var(--wa-lcd) 0%, #ffd040 60%, #ff4040 100%);
    border: 1px solid var(--wa-face-lo);
    box-shadow: inset 1px 1px 0 #000;
  }

  .wa-slider input {
    width: 100%;
    height: 100%;
    margin: 0;
    background: transparent;
    appearance: none;
    -webkit-appearance: none;
    cursor: pointer;
  }

  .wa-slider input::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 14px;
    height: 10px;
    background: var(--wa-face);
    border: 1px solid var(--wa-face-lo);
    box-shadow: inset 1px 1px 0 var(--wa-face-hi);
  }

  .wa-slider input::-moz-range-thumb {
    width: 14px;
    height: 10px;
    border-radius: 0;
    background: var(--wa-face);
    border: 1px solid var(--wa-face-lo);
    box-shadow: inset 1px 1px 0 var(--wa-face-hi);
  }

  .wa-toggles {
    display: flex;
    gap: 3px;
  }

  .wa-toggle {
    padding: 3px 6px;
    background: var(--wa-face);
    border: 1px solid var(--wa-face-lo);
    box-shadow: inset 1px 1px 0 var(--wa-face-hi), inset -1px -1px 0 var(--wa-face-lo);
    color: #c9c9d6;
    font-family: var(--wa-font);
    font-size: 8px;
    letter-spacing: 0.5px;
    cursor: pointer;
  }

  .wa-toggle:active,
  .wa-toggle.on {
    box-shadow: inset -1px -1px 0 var(--wa-face-hi), inset 1px 1px 0 var(--wa-face-lo);
    color: var(--wa-lcd);
    text-shadow: 0 0 4px var(--wa-lcd);
  }

  .wa-toggle:disabled {
    opacity: 0.4;
    cursor: default;
  }

  .wa-seek {
    position: relative;
    height: 12px;
    margin: 4px 6px;
    background: var(--wa-face-lo);
    border: 1px solid #000;
    box-shadow: inset 1px 1px 0 #000, inset -1px -1px 0 var(--wa-face-hi);
    cursor: pointer;
  }

  .wa-seek:focus-visible {
    outline: 1px dotted var(--wa-lcd);
  }

  .wa-seek-thumb {
    position: absolute;
    top: -2px;
    width: 28px;
    height: 12px;
    background: linear-gradient(180deg, var(--wa-face-hi), var(--wa-face));
    border: 1px solid var(--wa-face-lo);
    box-shadow: inset 1px 1px 0 #fff3;
    transition: left 200ms linear;
  }

  .wa-transport {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 2px 6px 4px;
  }

  .wa-buttons {
    display: flex;
    gap: 1px;
  }

  .wa-btn {
    width: 28px;
    height: 20px;
    display: grid;
    place-items: center;
    background: linear-gradient(180deg, var(--wa-face-hi), var(--wa-face));
    border: 1px solid var(--wa-face-lo);
    box-shadow: inset 1px 1px 0 #fff2, inset -1px -1px 0 #0006;
    color: #e6e6f0;
    font-size: 10px;
    cursor: pointer;
  }

  .wa-btn:active {
    box-shadow: inset -1px -1px 0 #fff2, inset 1px 1px 0 #0006;
    transform: translateY(1px);
  }

  .wa-btn-eject {
    margin-left: 6px;
  }

  .wa-transport-lamps {
    display: flex;
    gap: 6px;
  }

  .wa-playlist .wa-titlebar {
    margin-bottom: 3px;
  }

  .wa-list {
    height: 160px;
    overflow-y: auto;
    background: var(--wa-lcd-bg);
    border: 1px solid var(--wa-face-lo);
    box-shadow: inset 1px 1px 0 #000;
    padding: 2px;
    scrollbar-width: thin;
    scrollbar-color: var(--wa-face-hi) var(--wa-face-lo);
  }

  .wa-list:focus-visible {
    outline: 1px dotted var(--wa-lcd);
  }

  .wa-list-empty {
    padding: 8px 4px;
    color: var(--wa-lcd-dim);
    font-size: 10px;
  }

  .wa-row {
    display: flex;
    justify-content: space-between;
    gap: 8px;
    padding: 2px 4px;
    font-size: 10px;
    color: var(--wa-lcd);
    cursor: default;
    white-space: nowrap;
  }

  .wa-row-title {
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .wa-row-time {
    flex-shrink: 0;
    font-variant-numeric: tabular-nums;
  }

  .wa-row.current {
    color: #ffffff;
    text-shadow: 0 0 4px var(--wa-lcd);
  }

  .wa-row.selected {
    background: var(--wa-selected);
  }

  .wa-list-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 4px 2px 1px;
    font-size: 9px;
    color: var(--wa-lcd);
  }

  .wa-list-actions {
    display: flex;
    gap: 3px;
  }

  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip: rect(0 0 0 0);
  }
</style>
