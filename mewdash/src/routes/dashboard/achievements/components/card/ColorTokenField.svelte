<script lang="ts">
  import { slide } from "svelte/transition";
  import { colorStore } from "$lib/stores/colorStore";
  import { CARD_TOKENS, parseToken, resolveToken, tokenLabel } from "./cardHelpers";

  /**
   * Picks a card color token: a palette color or the grade color with an optional alpha, or a custom hex.
   */
  interface Props {
    label: string;
    value: string;
    /** The bot's palette for this server, as hex by token name */
    palette: Record<string, string>;
    /** The sample achievement's grade color */
    grade: string;
    /** Whether the color can be cleared */
    allowNone?: boolean;
    onchange: (value: string) => void;
  }

  let { label, value, palette, grade, allowNone = false, onchange }: Props = $props();

  let open = $state(false);
  let parsed = $derived(parseToken(value));
  let resolved = $derived(resolveToken(value, palette, grade));

  /**
   * Builds a token from a base and alpha.
   * @param base A token name or #rrggbb
   * @param alpha 0 to 255
   */
  function build(base: string, alpha: number): string {
    const hex = Math.round(Math.min(255, Math.max(0, alpha))).toString(16).padStart(2, "0");
    if (base.startsWith("#")) return alpha >= 255 ? base : `${base}${hex}`;
    return alpha >= 255 ? base : `${base}@${hex}`;
  }
</script>

<div class="space-y-1">
  <span class="text-xs block" style="color: {$colorStore.muted}">{label}</span>
  <button type="button" class="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg border min-h-[40px] text-left"
          style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
          aria-expanded={open} onclick={() => { open = !open; }}>
    <span class="w-5 h-5 rounded-md shrink-0 border"
          style="border-color: {$colorStore.text}30; background: {resolved ?? 'transparent'};
                 {resolved ? '' : `background-image: linear-gradient(45deg, transparent 45%, ${$colorStore.accent} 45%, ${$colorStore.accent} 55%, transparent 55%);`}"></span>
    <span class="text-sm flex-1 truncate">{tokenLabel(value)}</span>
    <i class="fa-solid fa-chevron-down text-xs" style="color: {$colorStore.muted}" aria-hidden="true"></i>
  </button>

  {#if open}
    <div class="p-3 rounded-xl border space-y-3" style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}20;"
         transition:slide={{ duration: 120 }}>
      <div class="flex flex-wrap gap-1.5" role="group" aria-label="{label} palette">
        {#each CARD_TOKENS as token (token)}
          {@const active = parsed.base === token}
          <button type="button" aria-pressed={active}
                  class="flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs min-h-[32px]"
                  style="background: {active ? $colorStore.primary + '30' : $colorStore.primary + '10'}; color: {$colorStore.text};"
                  onclick={() => onchange(build(token, parsed.alpha))}>
            <span class="w-3.5 h-3.5 rounded" style="background: {token === 'grade' ? grade : palette[token]};"></span>
            {token}
          </button>
        {/each}
        {#if allowNone}
          <button type="button" aria-pressed={value === ""}
                  class="px-2 py-1 rounded-lg text-xs min-h-[32px]"
                  style="background: {value === '' ? $colorStore.primary + '30' : $colorStore.primary + '10'}; color: {$colorStore.text};"
                  onclick={() => { onchange(""); open = false; }}>
            None
          </button>
        {/if}
      </div>

      {#if value !== ""}
        <label class="flex items-center gap-3 text-xs" style="color: {$colorStore.muted}">
          Custom
          <input type="color" class="h-8 w-14 rounded-lg border" style="border-color: {$colorStore.primary}30;"
                 value={parsed.base.startsWith("#") ? parsed.base : (resolved ?? "#ffffff").slice(0, 7)}
                 onchange={(e) => onchange(build(e.currentTarget.value, parsed.alpha))} />
        </label>
        <label class="block text-xs" style="color: {$colorStore.muted}">
          Opacity {Math.round(parsed.alpha / 2.55)}%
          <input type="range" min="0" max="255" value={parsed.alpha} class="w-full"
                 style="accent-color: {$colorStore.primary}"
                 oninput={(e) => onchange(build(parsed.base, Number(e.currentTarget.value)))} />
        </label>
      {/if}
    </div>
  {/if}
</div>
