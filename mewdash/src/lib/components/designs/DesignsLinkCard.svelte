<script lang="ts">
  import { m } from "$lib/i18n";
  import { colorStore } from "$lib/stores/colorStore";
</script>

<div class="rounded-2xl border p-4 flex flex-col sm:flex-row sm:items-center gap-3"
     style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}20;">
  <div class="flex-1 min-w-0">
    <h3 class="font-semibold" style="color: {$colorStore.text}">{m.designs.linkTitle()}</h3>
    <p class="text-sm mt-1" style="color: {$colorStore.muted}">{m.designs.linkText()}</p>
  </div>
  <a href="/dashboard/currency?tab=designs"
     class="px-5 rounded-xl min-h-[50px] font-medium flex items-center justify-center gap-2 shrink-0"
     style="background: {$colorStore.primary}20; color: {$colorStore.text}; border: 1px solid {$colorStore.primary}30;">
    <i class="fa-solid fa-palette" aria-hidden="true"></i>{m.designs.linkButton()}
  </a>
</div>
