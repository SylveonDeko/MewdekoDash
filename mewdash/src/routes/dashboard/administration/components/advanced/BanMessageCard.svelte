<script lang="ts">
  import { fly } from "svelte/transition";
  import { colorStore } from "$lib/stores/colorStore";

  let {
    banMessage = $bindable(),
    saving,
    saveBanMessage
  } = $props();
</script>

<div class=" rounded-2xl border p-6 shadow-2xl transition-all"
     in:fly={{ y: 20, duration: 300, delay: 100 }}
     style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15);
            border-color: {$colorStore.primary}30;">

  <div class="flex items-center gap-4 mb-6">
    <div class="p-3 rounded-xl"
         style="background: linear-gradient(135deg, {$colorStore.primary}20, {$colorStore.secondary}20);">
      <i class="fa-utility-duo fa-regular fa-comment"
         style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary}; font-size: 24px;"></i>
    </div>
    <h2 class="text-xl font-bold" style="color: {$colorStore.text}">Ban Message</h2>
  </div>

  <div class="space-y-4">
    <div>
      <label class="block text-sm font-medium mb-2" for="ban-message-textarea" style="color: {$colorStore.text}">
        Custom Ban Message
      </label>
      <textarea
        bind:value={banMessage}
        class="w-full px-3 py-2 rounded-lg border transition-colors resize-none"
        id="ban-message-textarea"
        placeholder="Enter custom ban message..."
        rows="3"
        style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text}"
      ></textarea>
      <p class="text-xs mt-1" style="color: {$colorStore.muted}">
        This message will be sent to users when they are banned
      </p>
    </div>

    <div class="flex justify-end">
      <button
        class="px-4 py-3 rounded-xl font-medium transition-all hover:scale-[1.02] flex items-center gap-2 min-h-[44px]"
        disabled={saving}
        onclick={saveBanMessage}
        style="background: {$colorStore.secondary}20; color: {$colorStore.secondary}; border: 1px solid {$colorStore.secondary}30;"
      >
        <i class="fa-solid fa-floppy-disk" style="font-size: 16px;"></i>
        Save Message
      </button>
    </div>
  </div>
</div>
