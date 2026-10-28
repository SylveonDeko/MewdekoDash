<script lang="ts">
  import { m } from "$lib/i18n";
  import { colorStore } from "$lib/stores/colorStore";
  import type { GuildEmojiInfo } from "$lib/api/client/models";
  import CardRichText from "./CardRichText.svelte";
  import CardTextTools from "./CardTextTools.svelte";

  /**
   * Card text with emoji, icons, and placeholders shown as themselves, and buttons that drop them in where the
   * cursor is.
   */
  interface Props {
    label: string;
    value: string;
    placeholder?: string;
    hasDefault?: boolean;
    maxLength: number;
    placeholders: string[];
    guildEmojis: GuildEmojiInfo[];
    onchange: (value: string) => void;
    onerror: (text: string) => void;
  }

  let { label, value, placeholder = "", hasDefault = false, maxLength, placeholders, guildEmojis, onchange, onerror }: Props = $props();

  let editor = $state<CardRichText>();
</script>

<div class="space-y-1.5">
  <span class="text-xs block" style="color: {$colorStore.muted}">{label}</span>
  <CardRichText bind:this={editor} {value} {placeholders} {guildEmojis} {placeholder} {maxLength} ariaLabel={label} {onchange}
                class="w-full min-h-[60px] px-2.5 py-2 rounded-lg border text-sm leading-relaxed"
                style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};" />
  {#if hasDefault}
    <p class="text-[11px]" style="color: {$colorStore.muted}">{m.achievements.cardTextDefaultHint()}</p>
  {/if}
  <CardTextTools {placeholders} {guildEmojis} {onerror} oninsert={(token) => editor?.insert(token)} />
</div>
