<script lang="ts">
  import { m } from "$lib/i18n";
  import { slide } from "svelte/transition";
  import { colorStore } from "$lib/stores/colorStore";
  import { currentGuild } from "$lib/stores/currentGuild";
  import { unicodeEmojiStore } from "$lib/stores/unicodeEmojiStore";
  import type { AchievementGlyph } from "$lib/api/index.ts";
  import type { GuildEmojiInfo } from "$lib/api/client/models";
  import { logger } from "$lib/logger";
  import DuoIcon from "../DuoIcon.svelte";
  import { loadGlyphs } from "./GlyphField.svelte";

  /**
   * Buttons that open a picker of server emojis, emoji, icons, or placeholders, each inserting what is picked.
   */
  interface Props {
    placeholders: string[];
    guildEmojis: GuildEmojiInfo[];
    oninsert: (token: string) => void;
    onerror: (text: string) => void;
  }

  let { placeholders, guildEmojis, oninsert, onerror }: Props = $props();

  type Tab = "server" | "emoji" | "icon" | "placeholder";

  let open = $state<Tab | null>(null);
  let search = $state("");
  let loading = $state(false);
  let glyphs = $state<AchievementGlyph[]>([]);

  let serverEmojis = $derived(guildEmojis.flatMap((g) => g.emojis));
  let term = $derived(search.trim().toLowerCase());
  let shownServer = $derived(serverEmojis.filter((e) => !term || e.name.toLowerCase().includes(term)).slice(0, 120));
  let shownEmoji = $derived(
    $unicodeEmojiStore.filter((e) => !term || e.searchTerms.some((t) => t.toLowerCase().includes(term))).slice(0, 160)
  );
  let shownGlyphs = $derived(
    glyphs.filter((g) => !term || g.name.includes(term) || g.aliases.some((a) => a.includes(term))).slice(0, 120)
  );
  let tabs = $derived([
    ...(serverEmojis.length ? [{ id: "server" as Tab, label: m.achievements.iconTabEmojis(), icon: "fa-face-smile" }] : []),
    { id: "emoji" as Tab, label: m.common.emoji(), icon: "fa-face-laugh" },
    { id: "icon" as Tab, label: m.achievements.iconTabIcons(), icon: "fa-sparkles" },
    { id: "placeholder" as Tab, label: m.common.placeholders(), icon: "fa-code" }
  ]);

  /**
   * Opens a picker, or closes it when it is already open, loading what it lists the first time.
   * @param tab The picker
   */
  async function toggle(tab: Tab) {
    open = open === tab ? null : tab;
    search = "";
    if (open === "emoji" && !unicodeEmojiStore.isLoaded()) {
      loading = true;
      await unicodeEmojiStore.load();
      loading = false;
    }
    if (open === "icon" && glyphs.length === 0 && $currentGuild?.id) {
      loading = true;
      try {
        glyphs = await loadGlyphs($currentGuild.id);
      } catch (err: any) {
        logger.error("Failed to load icons:", err);
        onerror(err?.message || m.achievements.iconErrorLoad());
      } finally {
        loading = false;
      }
    }
  }

  function keep(event: MouseEvent) {
    event.preventDefault();
  }
</script>

<div class="space-y-1.5">
  <div class="flex flex-wrap gap-1" role="toolbar">
    {#each tabs as tab (tab.id)}
      <button type="button" class="flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-xs min-h-[32px]" aria-pressed={open === tab.id}
              style="background: {open === tab.id ? $colorStore.primary + '30' : $colorStore.primary + '10'}; color: {open === tab.id ? $colorStore.primary : $colorStore.text};"
              onmousedown={keep} onclick={() => toggle(tab.id)}>
        <DuoIcon icon={tab.icon} size={13} />{tab.label}
      </button>
    {/each}
  </div>

  {#if open}
    <div class="p-2 rounded-xl border space-y-2" style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}20;"
         transition:slide={{ duration: 120 }}>
      {#if open !== "placeholder"}
        <input type="search" bind:value={search}
               placeholder={open === "icon" ? m.achievements.cardGlyphSearch() : m.widgets.emojiSearchPlaceholder()}
               aria-label={open === "icon" ? m.achievements.cardGlyphSearch() : m.widgets.emojiSearchPlaceholder()}
               class="w-full px-2.5 py-1.5 rounded-lg border text-sm min-h-[36px]"
               style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};" />
      {/if}

      {#if loading}
        <p class="text-xs py-2 text-center" style="color: {$colorStore.muted}">{m.common.loading()}</p>
      {:else if open === "server"}
        <div class="grid grid-cols-7 gap-1 max-h-44 overflow-y-auto">
          {#each shownServer as emoji (emoji.id)}
            <button type="button" title={`:${emoji.name}:`} aria-label={`:${emoji.name}:`}
                    class="aspect-square rounded-md flex items-center justify-center hover:brightness-125"
                    style="background: {$colorStore.primary}08;" onmousedown={keep}
                    onclick={() => oninsert(`<${emoji.animated ? "a" : ""}:${emoji.name}:${emoji.id}>`)}>
              <img src={emoji.url} alt="" class="w-6 h-6 object-contain" loading="lazy" draggable="false" />
            </button>
          {:else}
            <p class="col-span-7 text-xs py-2 text-center" style="color: {$colorStore.muted}">{m.common.noResultsFound()}</p>
          {/each}
        </div>
      {:else if open === "emoji"}
        <div class="grid grid-cols-8 gap-1 max-h-44 overflow-y-auto">
          {#each shownEmoji as emoji (emoji.unicode)}
            <button type="button" title={`:${emoji.name}:`} aria-label={`:${emoji.name}:`}
                    class="aspect-square rounded-md flex items-center justify-center text-lg hover:brightness-125"
                    style="background: {$colorStore.primary}08;" onmousedown={keep}
                    onclick={() => oninsert(emoji.unicode)}>{emoji.unicode}</button>
          {:else}
            <p class="col-span-8 text-xs py-2 text-center" style="color: {$colorStore.muted}">{m.common.noResultsFound()}</p>
          {/each}
        </div>
      {:else if open === "icon"}
        <div class="grid grid-cols-7 gap-1 max-h-44 overflow-y-auto">
          {#each shownGlyphs as glyph (glyph.name)}
            <button type="button" title={glyph.name} aria-label={glyph.name}
                    class="aspect-square rounded-md flex items-center justify-center"
                    style="background: {$colorStore.primary}08;" onmousedown={keep}
                    onclick={() => oninsert(`{icon:${glyph.name}}`)}>
              <DuoIcon icon="fa-{glyph.name}" size={16} />
            </button>
          {:else}
            <p class="col-span-7 text-xs py-2 text-center" style="color: {$colorStore.muted}">{m.common.noResultsFound()}</p>
          {/each}
        </div>
      {:else}
        <div class="flex flex-wrap gap-1">
          {#each placeholders as token (token)}
            <button type="button" class="px-1.5 py-1 rounded-md text-[11px] font-mono"
                    style="background: {$colorStore.primary}10; color: {$colorStore.primary};"
                    onmousedown={keep} onclick={() => oninsert(token)}>{token}</button>
          {/each}
        </div>
      {/if}
    </div>
  {/if}
</div>
