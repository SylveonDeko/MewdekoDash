<script module lang="ts">
  const cardImages = new Map<string, string>();
</script>

<script lang="ts">
  import { m } from "$lib/i18n";
  import { colorStore } from "$lib/stores/colorStore";
  import { achievementsApi } from "$lib/api/index.ts";
  import { DesignTarget } from "$lib/api/designs/models";
  import type { CardTemplate } from "$lib/api/cards/models";
  import { logger } from "$lib/logger";

  interface Props {
    guildId: bigint | string;
    target: DesignTarget;
    /** Background address for rank designs */
    backgroundUrl?: string | null;
    /** Card template for achievement designs */
    template?: CardTemplate | null;
    /** Changes whenever the design does */
    version?: string;
    name: string;
  }

  let { guildId, target, backgroundUrl = null, template = null, version = "", name }: Props = $props();

  let drawn = $state<string | null>(null);
  let failed = $state(false);
  let broken = $state(false);

  const rank = $derived(target === DesignTarget.Rank);
  const key = $derived(`${guildId}:${version}:${template ? hash(JSON.stringify(template)) : 0}`);

  function hash(text: string): string {
    let h = 5381;
    for (let i = 0; i < text.length; i++) h = ((h << 5) + h + text.charCodeAt(i)) | 0;
    return `${text.length}.${h}`;
  }

  $effect(() => {
    if (rank || !template) return;
    const cacheKey = key;
    const current = template;
    const cached = cardImages.get(cacheKey);
    drawn = cached ?? null;
    failed = false;
    if (cached) return;
    let live = true;
    achievementsApi
      .previewCard(BigInt(guildId), current, false)
      .then((preview) => {
        cardImages.set(cacheKey, preview.image);
        if (live) drawn = preview.image;
      })
      .catch((err) => {
        logger.warn("Failed to draw a design preview", err);
        if (live) failed = true;
      });
    return () => {
      live = false;
    };
  });

  $effect(() => {
    void backgroundUrl;
    broken = false;
  });
</script>

<div class="w-full rounded-lg overflow-hidden flex items-center justify-center"
     style="aspect-ratio: {rank ? '797 / 279' : '1280 / 500'}; background: {$colorStore.primary}10;">
  {#if rank}
    <img src={backgroundUrl && !broken ? backgroundUrl : "/img/default_xp_background.png"} alt={m.designs.previewAlt({ name })}
         class="w-full h-full object-cover" onerror={() => (broken = true)} />
  {:else if drawn}
    <img src={drawn} alt={m.designs.previewAlt({ name })} class="w-full h-full object-contain" />
  {:else if failed}
    <i class="fa-solid fa-id-card text-2xl" style="color: {$colorStore.muted}" aria-hidden="true"></i>
  {:else}
    <i class="fa-solid fa-spinner fa-spin" style="color: {$colorStore.muted}" aria-hidden="true"></i>
  {/if}
</div>
