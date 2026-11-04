<script lang="ts">
  import { m } from "$lib/i18n";
  import { fly } from "svelte/transition";
  import { colorStore } from "$lib/stores/colorStore";
  import FullscreenEmbedBuilder from "$lib/components/specialized/FullscreenEmbedBuilder.svelte";

  let {
    banMessage = $bindable(),
    saveBanMessage,
    guildId = null,
    user = null
  } = $props();
</script>

<div class=" rounded-2xl border p-6 transition-all"
     in:fly={{ y: 20, duration: 300, delay: 100 }}
     style="background: {$colorStore.primary}0c;
            border-color: {$colorStore.primary}30;">

  <div class="flex items-center gap-4 mb-6">
    <div class="p-3 rounded-xl"
         style="background: {$colorStore.primary}20;">
      <i class="fa-utility-duo fa-regular fa-comment"
         style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary}; font-size: 24px;"></i>
    </div>
    <h2 class="text-xl font-bold" style="color: {$colorStore.text}">{m.administration.advancedBanMessageTitle()}</h2>
  </div>

  <div class="space-y-4">
    <div>
      <label for="f-BanMessageCard-custom-ban-message-31" class="block text-sm font-medium mb-3" style="color: {$colorStore.text}">
        <i class="fa-solid fa-comment" style="font-size: 14px;"></i>
        {m.administration.advancedBanMessageLabel()}
      </label>

      <FullscreenEmbedBuilder id="f-BanMessageCard-custom-ban-message-31"
        bind:value={banMessage}
        onchange={saveBanMessage}
        allowComponents={true}
        allowContent={true}
        allowMultipleEmbeds={true}
        guildId={guildId}
        icon="fa-comment"
        maxEmbeds={10}
        placeholder={m.administration.advancedBanMessagePlaceholder()}
        previewDescription={m.administration.advancedBanMessagePreviewDescription()}
        previewTitle={m.administration.advancedBanMessageTitle()}
        user={user}
      />

      <p class="text-xs mt-3" style="color: {$colorStore.muted}">
        {m.administration.advancedBanMessageHint()}
      </p>
    </div>  </div>
</div>
