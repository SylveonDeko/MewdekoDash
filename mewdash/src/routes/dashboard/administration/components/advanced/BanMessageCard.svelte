<script lang="ts">
  import { fly } from "svelte/transition";
  import { colorStore } from "$lib/stores/colorStore";
  import FullscreenEmbedBuilder from "$lib/components/specialized/FullscreenEmbedBuilder.svelte";

  let {
    banMessage = $bindable(),
    saving,
    saveBanMessage,
    guildId = null,
    user = null
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
      <label for="f-BanMessageCard-custom-ban-message-31" class="block text-sm font-medium mb-3" style="color: {$colorStore.text}">
        <i class="fa-solid fa-comment" style="font-size: 14px;"></i>
        Custom Ban Message
      </label>

      <FullscreenEmbedBuilder id="f-BanMessageCard-custom-ban-message-31"
        bind:value={banMessage}
        allowComponents={true}
        allowContent={true}
        allowMultipleEmbeds={true}
        guildId={guildId}
        icon="fa-comment"
        maxEmbeds={10}
        placeholder="Click to configure ban message with rich embeds"
        previewDescription="Message sent to users when they are banned"
        previewTitle="Ban Message"
        user={user}
      />

      <p class="text-xs mt-3" style="color: {$colorStore.muted}">
        This message will be sent to users when they are banned. Supports rich embeds and Discord formatting.
      </p>
    </div>

    <div class="flex justify-end">
      <button
        class="flex items-center justify-center gap-3 px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl transition-all hover:scale-[1.02] min-h-[44px] sm:min-h-[52px] font-medium focus:outline-hidden focus:ring-2 focus:ring-offset-2"
        disabled={saving}
        onclick={saveBanMessage}
        style="background: {$colorStore.primary}20; color: {$colorStore.primary}; border: 1px solid {$colorStore.primary}30; focus:ring-color: {$colorStore.primary};"
      >
        <i class="fa-solid fa-floppy-disk" style="font-size: 16px;"></i>
        Save Message
      </button>
    </div>
  </div>
</div>
