<script lang="ts">
  import { glyphClass, GRADE_ICON, iconImageSrc } from "../achievementHelpers";
  import DuoIcon from "./DuoIcon.svelte";

  /**
   * An achievement or category icon: its Font Awesome glyph, or its image for server emojis, linked images,
   * and uploads. On a tile tinted with the color, or bare beside text.
   */
  interface Props {
    icon?: string | null;
    iconUrl?: string | null;
    color: string;
    size?: number;
    bare?: boolean;
  }

  let { icon = null, iconUrl = null, color, size = 44, bare = false }: Props = $props();

  let image = $derived(iconImageSrc(iconUrl));
  let glyph = $derived(glyphClass(icon) ?? GRADE_ICON);
</script>

{#if bare}
  {#if image}
    <img src={image} alt="" aria-hidden="true" class="inline-block object-contain shrink-0"
         style="width: {size}px; height: {size}px;" />
  {:else}
    <DuoIcon icon={glyph} {color} {size} />
  {/if}
{:else}
  <span class="rounded-xl flex items-center justify-center shrink-0 overflow-hidden"
        style="width: {size}px; height: {size}px; background: {color}20; border: 1px solid {color}50;"
        aria-hidden="true">
    {#if image}
      <img src={image} alt="" class="object-contain"
           style="width: {Math.round(size * 0.62)}px; height: {Math.round(size * 0.62)}px;" />
    {:else}
      <DuoIcon icon={glyph} {color} size={Math.round(size * 0.42)} />
    {/if}
  </span>
{/if}
