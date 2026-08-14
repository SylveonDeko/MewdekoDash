<script lang="ts">
  import { colorStore } from "$lib/stores/colorStore";
  import type { ProductUpdate } from "$lib/content/productUpdates";

  interface Props {
    update: ProductUpdate;
    ondismiss: () => void;
  }

  import { fly } from "svelte/transition";

  let { update, ondismiss }: Props = $props();
</script>

<aside
  class="mx-auto mb-5 flex max-w-7xl items-start gap-3 border-y border-r px-4 py-3.5 sm:items-center sm:px-5"
  style="background: linear-gradient(90deg, {$colorStore.primary}1c, {$colorStore.primary}0a);
         border-color: {$colorStore.primary}40;
         border-left: 3px solid {$colorStore.primary};
         box-shadow: 0 2px 12px {$colorStore.primary}15;"
  aria-label="Latest Mewdeko feature"
  in:fly={{ y: -8, duration: 350 }}
>
  <span
    class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
    style="background: {$colorStore.primary}22; color: {$colorStore.primary};"
  >
    <i class="fa-solid fa-shield-halved text-sm" aria-hidden="true"></i>
  </span>
  <div class="min-w-0 flex-1">
    <span
      class="mr-2 rounded-full px-1.5 py-0.5 text-[0.65rem] font-bold uppercase tracking-[0.12em]"
      style="background: {$colorStore.primary}; color: {$colorStore.text};"
    >
      New
    </span>
    <span class="text-sm" style="color: {$colorStore.text}">
      <strong>{update.title}</strong>: {update.summary}
    </span>
    <a class="ml-2 whitespace-nowrap text-sm font-semibold hover:opacity-70" href={update.href} style="color: {$colorStore.primary}">
      {update.action} →
    </a>
  </div>
  <button
    class="-mr-1 -mt-1 shrink-0 p-1 text-sm hover:opacity-70 focus:outline-hidden focus:ring-2"
    onclick={ondismiss}
    aria-label="Dismiss latest feature notice"
    style="color: {$colorStore.muted}; --tw-ring-color: {$colorStore.primary};"
  >
    <i class="fa-solid fa-xmark" aria-hidden="true"></i>
  </button>
</aside>
