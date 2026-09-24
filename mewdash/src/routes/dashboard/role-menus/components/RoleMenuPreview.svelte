<script lang="ts">
  import { colorStore } from "$lib/stores/colorStore";
  import PreviewCard from "$lib/components/specialized/PreviewCard.svelte";
  import type { DiscordUser } from "$lib/types/discord";
  import {
    buildDefaultEmbed,
    buildPreviewRows,
    DEFAULT_NAME,
    hasMessageContent,
    messageParts,
    type PreviewOption
  } from "../roleMenuDefaults";

  /** Inputs for the live preview of a role menu's message. */
  interface Props {
    /** The embed builder value, empty for the default message */
    message: unknown;
    /** The menu name */
    name: string;
    /** Dropdown or buttons */
    style: number;
    /** Dropdown hint text, blank for the default */
    placeholder: string;
    /** Pick any or pick one */
    mode: number;
    /** Options in display order */
    options: PreviewOption[];
    /** Whether the menu is paused */
    paused?: boolean;
    /** The signed in user, for placeholder previews */
    user?: DiscordUser | null;
    /** The guild ID, for placeholder previews */
    guildId?: bigint | string | null;
  }

  let { message, name, style, placeholder, mode, options, paused = false, user = null, guildId = null }: Props =
    $props();

  /** The text and embeds shown above the dropdown or buttons. */
  let parts = $derived.by(() => {
    if (hasMessageContent(message)) return messageParts(message);
    return { content: "", embeds: [buildDefaultEmbed(name || DEFAULT_NAME, options)] };
  });

  /** The mock dropdown or button rows. */
  let rows = $derived(buildPreviewRows(style, placeholder, mode, options));
</script>

<div class:opacity-60={paused}>
  <PreviewCard
    content={parts.content}
    embeds={parts.embeds}
    componentRows={rows}
    {user}
    {guildId}
    emptyMessage="Add an option to see the menu"
  />
</div>

{#if paused}
  <p class="text-xs mt-3" style="color: {$colorStore.muted}">
    Paused: the dropdown or buttons are greyed out in Discord.
  </p>
{/if}
