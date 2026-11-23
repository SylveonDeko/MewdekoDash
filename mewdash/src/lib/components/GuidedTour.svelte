<script module lang="ts">
  export interface TourStep {
    target: string;
    text: string;
  }
</script>

<script lang="ts">
  import { onDestroy, tick, untrack } from "svelte";
  import { m } from "$lib/i18n";
  import { colorStore } from "$lib/stores/colorStore";
  import Portal from "$lib/components/ui/Portal.svelte";

  interface Props {
    steps: TourStep[];
    open: boolean;
    label: string;
    onclose?: () => void;
  }

  let { steps, open = $bindable(), label, onclose }: Props = $props();

  const POPOVER_WIDTH = 320;
  const EDGE = 12;
  const OUTLINE_GAP = 4;
  const BAR_CLEARANCE = "220px";

  let active = $state<TourStep[]>([]);
  let index = $state(0);
  let rect = $state<{ top: number; left: number; width: number; height: number } | null>(null);
  let popoverStyle = $state("");
  let popoverEl = $state<HTMLDivElement | null>(null);
  let running = $state(false);
  let frame = 0;
  let previousFocus: HTMLElement | null = null;
  let marginTarget: HTMLElement | null = null;
  let marginBefore = "";

  const step = $derived(active[index]);
  const isFirst = $derived(index === 0);
  const isLast = $derived(index === active.length - 1);

  function findTarget(name: string): HTMLElement | null {
    const matches = document.querySelectorAll<HTMLElement>(`[data-tour="${name}"]`);
    for (const element of matches) {
      const box = element.getBoundingClientRect();
      if (box.width > 0 && box.height > 0) return element;
    }
    return null;
  }

  function restoreMargin() {
    if (marginTarget) marginTarget.style.scrollMarginBottom = marginBefore;
    marginTarget = null;
  }

  function place() {
    frame = 0;
    if (!running || !step) return;
    const element = findTarget(step.target);
    if (!element) return;

    const box = element.getBoundingClientRect();
    rect = { top: box.top, left: box.left, width: box.width, height: box.height };

    if (window.innerWidth < 640) {
      popoverStyle = `left:8px;right:8px;bottom:8px;`;
      return;
    }

    const width = Math.min(POPOVER_WIDTH, window.innerWidth - EDGE * 2);
    const height = popoverEl?.offsetHeight ?? 140;
    let top = box.bottom + EDGE;
    if (top + height > window.innerHeight - EDGE) top = box.top - height - EDGE;
    if (top < EDGE) top = Math.max(EDGE, Math.min(window.innerHeight - height - EDGE, box.top + EDGE));
    const left = Math.max(EDGE, Math.min(box.left, window.innerWidth - width - EDGE));
    popoverStyle = `top:${top}px;left:${left}px;width:${width}px;`;
  }

  function schedule() {
    if (frame) return;
    frame = requestAnimationFrame(place);
  }

  async function show(next: number, direction: 1 | -1) {
    if (next < 0 || next >= active.length) {
      if (next >= active.length) finish();
      return;
    }

    index = next;
    restoreMargin();

    const element = findTarget(active[next].target);
    if (!element) {
      void show(next + direction, direction);
      return;
    }

    if (window.innerWidth < 640) {
      marginTarget = element;
      marginBefore = element.style.scrollMarginBottom;
      element.style.scrollMarginBottom = BAR_CLEARANCE;
    }
    element.scrollIntoView({ block: "center", inline: "nearest" });

    await tick();
    place();
    await tick();
    place();
    popoverEl?.focus({ preventScroll: true });
  }

  function onKeydown(event: KeyboardEvent) {
    if (event.key !== "Escape") return;
    event.preventDefault();
    event.stopPropagation();
    finish();
  }

  async function begin() {
    const resolved = steps.filter(item => findTarget(item.target));
    if (resolved.length === 0) {
      open = false;
      return;
    }

    active = resolved;
    running = true;
    previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    document.addEventListener("keydown", onKeydown, true);
    window.addEventListener("resize", schedule);
    window.addEventListener("scroll", schedule, true);
    await show(0, 1);
  }

  function teardown() {
    running = false;
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
    restoreMargin();
    document.removeEventListener("keydown", onKeydown, true);
    window.removeEventListener("resize", schedule);
    window.removeEventListener("scroll", schedule, true);
    rect = null;
  }

  function finish() {
    if (!running) return;
    teardown();
    open = false;
    if (previousFocus?.isConnected) previousFocus.focus({ preventScroll: true });
    previousFocus = null;
    onclose?.();
  }

  $effect(() => {
    if (open && !running) untrack(() => void begin());
    else if (!open && running) untrack(() => teardown());
  });

  onDestroy(() => {
    if (typeof document !== "undefined" && running) teardown();
  });
</script>

{#if open && running && step}
  <Portal>
    {#if rect}
      <div
        class="fixed pointer-events-none rounded-xl z-[10060]"
        style="top: {rect.top - OUTLINE_GAP}px; left: {rect.left - OUTLINE_GAP}px; width: {rect.width + OUTLINE_GAP * 2}px; height: {rect.height + OUTLINE_GAP * 2}px; border: 2px solid {$colorStore.primary};"
        aria-hidden="true"
      ></div>
    {/if}

    <div
      bind:this={popoverEl}
      class="fixed z-[10061] rounded-xl border p-4 space-y-3 outline-none"
      style="{popoverStyle} background: {$colorStore.surface}; border-color: {$colorStore.primary}40; color: {$colorStore.text};"
      role="dialog"
      aria-label={label}
      aria-describedby="guided-tour-text"
      tabindex="-1"
    >
      <p class="text-xs" style="color: {$colorStore.muted};">
        {m.common.stepCurrentOfTotal({ current: index + 1, total: active.length })}
      </p>
      <p id="guided-tour-text" class="text-sm">{step.text}</p>
      <div class="flex items-center justify-between gap-2">
        <div>
          {#if !isLast}
            <button
              type="button"
              class="min-h-[44px] px-3 rounded-lg text-sm font-medium"
              style="color: {$colorStore.text};"
              onclick={finish}
            >
              {m.wizard.setupCardSkipLabel()}
            </button>
          {/if}
        </div>
        <div class="flex items-center gap-2">
          {#if !isFirst}
            <button
              type="button"
              class="min-h-[44px] px-4 rounded-lg border text-sm font-medium"
              style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}20; color: {$colorStore.text};"
              onclick={() => show(index - 1, -1)}
            >
              {m.common.back()}
            </button>
          {/if}
          <button
            type="button"
            class="min-h-[44px] px-4 rounded-lg text-sm font-medium"
            style="background: {$colorStore.primary}; color: {$colorStore.onPrimary};"
            onclick={() => show(index + 1, 1)}
          >
            {isLast ? m.common.done() : m.common.next()}
          </button>
        </div>
      </div>
    </div>
  </Portal>
{/if}
