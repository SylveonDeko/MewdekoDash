<script lang="ts">
  import { colorStore } from "$lib/stores/colorStore";
  import type { ProductUpdate } from "$lib/content/productUpdates";

  interface Props {
    update: ProductUpdate;
    ondismiss: () => void;
  }

  let { update, ondismiss }: Props = $props();
</script>

<aside
  class="mx-auto mb-5 flex max-w-7xl items-start gap-3 border px-4 py-3 sm:items-center sm:px-5"
  aria-label="Latest Mewdeko feature"
  style="background: {$colorStore.primary}0a; border-color: {$colorStore.primary}2d;"
>
  <i class="fa-solid fa-shield-halved mt-0.5 text-sm sm:mt-0" style="color: {$colorStore.primary}" aria-hidden="true"></i>
  <div class="min-w-0 flex-1">
    <span class="mr-2 text-xs font-bold uppercase tracking-[0.12em]" style="color: {$colorStore.primary}">New</span>
    <span class="text-sm" style="color: {$colorStore.text}">
      <strong>{update.title}</strong> lets you block known scam images and add your own banned hashes.
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
