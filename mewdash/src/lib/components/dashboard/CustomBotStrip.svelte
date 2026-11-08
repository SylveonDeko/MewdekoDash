<script lang="ts">
  import { m } from "$lib/i18n";
  import { customBotsApi, type CustomBotGuildInfo } from "$lib/api/index.ts";
  import { colorStore } from "$lib/stores/colorStore";
  import { currentGuild } from "$lib/stores/currentGuild";
  import { logger } from "$lib/logger";
  import { customBotAvatarUrl } from "$lib/config/customBot";

  let info = $state<CustomBotGuildInfo | null>(null);
  let loadedFor = "";

  $effect(() => {
    const guildId = $currentGuild?.id ? String($currentGuild.id) : "";
    if (!guildId || guildId === loadedFor) return;
    loadedFor = guildId;
    info = null;
    customBotsApi
      .getGuild(guildId)
      .then((result) => {
        if (loadedFor === guildId) info = result;
      })
      .catch((err) => logger.debug("Custom bot lookup failed:", err));
  });

  const avatar = $derived(customBotAvatarUrl(info?.botAvatar));
</script>

{#if info?.instanceId && info.botName}
  <div class="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl pt-3">
    <div
      class="flex items-center gap-3 rounded-xl border px-3 py-2"
      style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}20;"
    >
      {#if avatar}
        <img src={avatar} alt="" class="w-7 h-7 rounded-full shrink-0 object-cover">
      {:else}
        <i class="fa-solid fa-robot w-7 text-center shrink-0" style="color: {$colorStore.text}" aria-hidden="true"></i>
      {/if}
      <span class="grow min-w-0 text-sm truncate" style="color: {$colorStore.text}">
        {m.customBot.guildStrip({ name: info.botName })}
      </span>
      <a
        href="/custom-bot"
        class="shrink-0 inline-flex items-center px-3 min-h-[44px] rounded-lg text-sm font-medium"
        style="color: {$colorStore.text}; background: {$colorStore.primary}10; border: 1px solid {$colorStore.primary}20;"
      >
        {m.customBot.guildStripLink()}
      </a>
    </div>
  </div>
{/if}
