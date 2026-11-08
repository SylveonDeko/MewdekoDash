<script lang="ts">
  /**
   * The editor and preview for one bot message.
   */
  import { m } from "$lib/i18n";
  import { currentGuild } from "$lib/stores/currentGuild";
  import FullscreenEmbedBuilder from "$lib/components/specialized/FullscreenEmbedBuilder.svelte";
  import { serializeMessage, toBuilderValue } from "$lib/utils/embedMessage";
  import type { WelcomeCardTarget } from "$lib/api/index.ts";
  import type { AutoSave } from "$lib/utils/autoSave.svelte";
  import type { DiscordUser } from "$lib/types/discord";
  import MessageCardField from "./MessageCardField.svelte";

  interface Props {
    /** Adds the Card section, for member event messages only. */
    card?: {
      guildId: bigint;
      target: WelcomeCardTarget;
      /** The multi-greet or role greet ID, or 0 for the goodbye, DM welcome and boost messages. */
      ownerId: number;
      autoSave: AutoSave;
      onerror: (message: string) => void;
    };
    /** The stored message: plain text or embed JSON. */
    value: string | null | undefined;
    /** Called with the new stored string after each edit. */
    onchange: (message: string) => void;
    previewTitle: string;
    icon?: string;
    user?: DiscordUser | null;
    placeholder?: string;
    /** Placeholders offered in the editor. Defaults to the member and server ones. */
    placeholders?: Array<{ category: string; name: string; description: string }>;
  }

  let {
    card,
    value,
    onchange,
    previewTitle,
    icon = "fa-comment",
    user = null,
    placeholder = m.plugin.messagePlaceholder(),
    placeholders: customPlaceholders
  }: Props = $props();

  const defaultPlaceholders = $derived([
    { category: m.multigreets.placeholderCategoryJoin(), name: "%user%", description: m.placeholders.user() },
    { category: m.multigreets.placeholderCategoryJoin(), name: "%user.mention%", description: m.placeholders.userMention() },
    { category: m.multigreets.placeholderCategoryJoin(), name: "%user.id%", description: m.placeholders.userId() },
    { category: m.multigreets.placeholderCategoryJoin(), name: "%user.avatar%", description: m.placeholders.userAvatar() },
    { category: m.features.categoryServer(), name: "%server%", description: m.placeholders.server() },
    { category: m.features.categoryServer(), name: "%server.members%", description: m.placeholders.serverMembers() }
  ]);

  let previewCard: { image: string; placement: "EmbedImage" | "Attached" } | null = $state(null);
</script>

<FullscreenEmbedBuilder
  {previewCard}
  value={toBuilderValue(value)}
  {previewTitle}
  {icon}
  allowContent={true}
  allowMultipleEmbeds={true}
  maxEmbeds={10}
  allowComponents={true}
  additionalPlaceholders={customPlaceholders ?? defaultPlaceholders}
  guildId={$currentGuild?.id}
  {user}
  {placeholder}
  onchange={(next) => onchange(serializeMessage(next))}
/>

{#if card}
  <MessageCardField {...card} {user} bind:preview={previewCard} />
{/if}
