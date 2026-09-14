<!-- lib/components/wiki/WikiDrawer.svelte -->
<script lang="ts">
  import { fade, fly } from "svelte/transition";
  import { browser } from "$app/environment";
  import { colorStore } from "$lib/stores/colorStore";
  import type { WikiArticle } from "$lib/wiki/types";
  import { wikiIconClass } from "$lib/wiki";
  import WikiArticleView from "./WikiArticle.svelte";
  import Portal from "$lib/components/ui/Portal.svelte";

  interface Props {
    article: WikiArticle;
    open: boolean;
    onclose: () => void;
  }

  let { article, open, onclose }: Props = $props();

  const historyMarker = "wiki-drawer";

  let isMobile = $state(false);
  let dragOffset = $state(0);
  let dragStartY = $state<number | null>(null);

  function handleKey(event: KeyboardEvent) {
    if (event.key === "Escape" && open) onclose();
  }

  function handlePopState() {
    if (open) onclose();
  }

  function close() {
    if (browser && history.state?.[historyMarker]) {
      history.back();
      return;
    }
    onclose();
  }

  let scrollArea: HTMLDivElement | undefined = $state();

  function onTouchStart(event: TouchEvent) {
    if (!isMobile) return;
    if (scrollArea && scrollArea.scrollTop > 0) return;
    dragStartY = event.touches[0].clientY;
  }

  function onTouchMove(event: TouchEvent) {
    if (dragStartY === null) return;
    const delta = event.touches[0].clientY - dragStartY;
    if (delta <= 0) {
      dragStartY = null;
      dragOffset = 0;
      return;
    }
    dragOffset = delta;
    if (event.cancelable) event.preventDefault();
  }

  function onTouchEnd() {
    if (dragStartY === null) return;
    const shouldClose = dragOffset > 120;
    dragStartY = null;
    dragOffset = 0;
    if (shouldClose) close();
  }

  $effect(() => {
    if (!browser) return;
    const query = window.matchMedia("(max-width: 767px)");
    const update = () => (isMobile = query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  });

  $effect(() => {
    if (!browser || !open) return;
    window.addEventListener("keydown", handleKey);
    window.addEventListener("popstate", handlePopState);
    document.body.style.overflow = "hidden";
    history.pushState({ ...history.state, [historyMarker]: true }, "");
    return () => {
      window.removeEventListener("keydown", handleKey);
      window.removeEventListener("popstate", handlePopState);
      document.body.style.overflow = "";
      if (history.state?.[historyMarker]) history.back();
    };
  });
</script>

{#if open}
  <Portal>
    <div class="fixed inset-0 z-[200] flex {isMobile ? 'items-end' : 'justify-end'}">
      <button
        class="absolute inset-0 bg-black/60 backdrop-blur-sm"
        aria-label="Close wiki panel"
        onclick={close}
        transition:fade={{ duration: 200 }}
      ></button>

      <div
        class="relative flex flex-col shadow-2xl w-full {isMobile ? 'h-[92dvh] rounded-t-2xl border-t' : 'h-full max-w-2xl border-l'}"
        style="background: linear-gradient(180deg, {$colorStore.background}, #0f172a);
               border-color: {$colorStore.primary}30;
               transform: translateY({dragOffset}px);
               transition: {dragStartY === null ? 'transform 150ms ease-out' : 'none'};"
        role="dialog"
        aria-modal="true"
        aria-labelledby="wiki-drawer-title"
        transition:fly={isMobile ? { y: 400, duration: 300 } : { x: 400, duration: 300 }}
        ontouchstart={onTouchStart}
        ontouchmove={onTouchMove}
        ontouchend={onTouchEnd}
        ontouchcancel={onTouchEnd}
      >
        <header
          class="flex items-start gap-4 p-5 border-b shrink-0 {isMobile ? 'pt-3' : ''}"
          style="border-color: {$colorStore.primary}20;
                 background: linear-gradient(135deg, {$colorStore.gradientStart}18, {$colorStore.gradientEnd}10);"
        >
          {#if isMobile}
            <div class="absolute left-1/2 top-2 -translate-x-1/2 h-1.5 w-12 rounded-full"
                 style="background: {$colorStore.primary}50;" aria-hidden="true"></div>
          {/if}
          <div class="p-3 rounded-xl shrink-0 {isMobile ? 'mt-3' : ''}"
               style="background: linear-gradient(135deg, {$colorStore.primary}25, {$colorStore.secondary}25);">
            <i class="{wikiIconClass(article.icon)} text-2xl"
               style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary};"></i>
          </div>
          <div class="min-w-0 flex-1 {isMobile ? 'mt-3' : ''}">
            <p class="text-xs uppercase tracking-widest font-semibold" style="color: {$colorStore.muted}">
              Guide
            </p>
            <h2 id="wiki-drawer-title" class="text-xl font-bold truncate" style="color: {$colorStore.text}">
              {article.title}
            </h2>
            <p class="text-sm mt-1 {isMobile ? 'line-clamp-2' : ''}" style="color: {$colorStore.muted}">{article.summary}</p>
          </div>
          <button
            class="p-2 rounded-lg transition-all hover:scale-105 shrink-0 min-h-[44px] min-w-[44px] {isMobile ? 'mt-3' : ''}"
            style="background: {$colorStore.primary}15; color: {$colorStore.primary};"
            aria-label="Close"
            onclick={close}
          >
            <i class="fa-solid fa-xmark"></i>
          </button>
        </header>

        <div class="flex-1 overflow-y-auto overscroll-contain p-5 sm:p-6" bind:this={scrollArea}>
          <WikiArticleView {article} compact />
        </div>

        <footer class="p-4 border-t shrink-0 flex items-center gap-3 {isMobile ? 'flex-col-reverse pb-[max(1rem,env(safe-area-inset-bottom))]' : 'justify-between'}"
                style="border-color: {$colorStore.primary}20;">
          {#if isMobile}
            <button
              class="w-full px-4 py-3 rounded-xl text-sm font-medium min-h-[44px]"
              style="background: {$colorStore.primary}20; color: {$colorStore.primary}; border: 1px solid {$colorStore.primary}30;"
              onclick={close}
            >
              Close
            </button>
          {:else}
            <span class="text-xs" style="color: {$colorStore.muted}">
              About {article.readingMinutes} min read
            </span>
          {/if}
          <a
            href="/wiki/{article.slug}"
            class="px-4 py-2 rounded-lg text-sm font-medium transition-all hover:scale-[1.02] {isMobile ? 'w-full text-center' : ''}"
            style="color: {$colorStore.primary}; {isMobile ? '' : `background: ${$colorStore.primary}20; border: 1px solid ${$colorStore.primary}30;`}"
            title="Read this guide on its own page in the Mewdeko wiki"
          >
            <i class="fa-solid fa-book-open mr-2"></i>Read the full guide in the wiki
          </a>
        </footer>
      </div>
    </div>
  </Portal>
{/if}
