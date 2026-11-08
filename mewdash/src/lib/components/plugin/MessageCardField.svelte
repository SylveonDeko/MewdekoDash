<script lang="ts">
  /**
   * The card of a member event message, with a button to design it.
   */
  import { m } from "$lib/i18n";
  import { untrack } from "svelte";
  import {
    clientApi,
    welcomeCardsApi,
    type CardImage,
    type CardPlacement,
    type CardTemplate,
    type WelcomeCard,
    type WelcomeCardStarter,
    type WelcomeCardTarget
  } from "$lib/api/index.ts";
  import type { GuildEmojiInfo } from "$lib/api/client/models";
  import { logger } from "$lib/logger";
  import { colorStore } from "$lib/stores/colorStore";
  import CardDesigner from "$lib/components/cards/CardDesigner.svelte";
  import { welcomeCardConfig } from "$lib/components/cards/welcomeCardConfig";
  import Sheet from "$lib/components/ui/Sheet.svelte";
  import type { AutoSave } from "$lib/utils/autoSave.svelte";
  import type { DiscordUser } from "$lib/types/discord";

  interface Props {
    guildId: bigint;
    target: WelcomeCardTarget;
    /** The multi-greet or role greet ID, or 0 for the goodbye, DM welcome and boost messages. */
    ownerId: number;
    autoSave: AutoSave;
    onerror: (message: string) => void;
    user?: DiscordUser | null;
    /** The drawn card for the message preview, or null when the message has none. */
    preview?: { image: string; placement: "EmbedImage" | "Attached" } | null;
  }

  let { guildId, target, ownerId, autoSave, onerror, user = null, preview = $bindable(null) }: Props = $props();

  let card: WelcomeCard | null = $state(null);
  let image = $state("");
  let starters: WelcomeCardStarter[] = $state([]);
  let guildEmojis: GuildEmojiInfo[] = $state([]);
  let designing = $state(false);

  const placementOptions = $derived([
    { id: "None", name: m.plugin.cardPlacementNone() },
    { id: "EmbedImage", name: m.plugin.cardPlacementEmbed() },
    { id: "Attached", name: m.plugin.cardPlacementAttached() }
  ]);
  const config = $derived(card ? welcomeCardConfig(guildId, target, ownerId, card, starters, user?.id ?? null) : null);

  $effect(() => {
    preview = card && card.placement !== "None" && image ? { image, placement: card.placement } : null;
  });

  async function refreshImage() {
    try {
      image = (await welcomeCardsApi.preview(guildId, target, ownerId, null, null, user?.id ?? null)).image;
    } catch (err) {
      logger.warn("Failed to draw the card preview:", err);
      image = "";
    }
  }

  async function load() {
    try {
      card = await welcomeCardsApi.get(guildId, target, ownerId);
      void refreshImage();
      starters = await welcomeCardsApi.starters(guildId, target);
    } catch (err) {
      logger.error("Failed to load the message card:", err);
      onerror(err instanceof Error ? err.message : m.plugin.cardPreviewFailed());
    }
  }

  async function openDesigner() {
    designing = true;
    if (guildEmojis.length || !user?.id) return;
    try {
      guildEmojis = await clientApi.getEmojis(BigInt(user.id), false);
    } catch (err) {
      logger.warn("Failed to load emojis for the card designer:", err);
    }
  }

  function setPlacement(placement: CardPlacement) {
    if (!card || card.placement === placement) return Promise.resolve();
    const previous = card;
    card = { ...card, placement };
    return autoSave.now(`card:${target}:${ownerId}:placement`, async () => {
      try {
        await welcomeCardsApi.save(guildId, target, ownerId, { placement });
      } catch (err) {
        card = previous;
        throw err;
      }
    });
  }

  async function saveDesign(_: string, template: CardTemplate) {
    const saved = await welcomeCardsApi.save(guildId, target, ownerId, { template });
    if (card) card = { ...card, images: saved.images, template: saved.template };
    void refreshImage();
  }

  function setImages(images: CardImage[]) {
    if (card) card = { ...card, images };
  }

  $effect(() => {
    guildId;
    target;
    ownerId;
    untrack(() => void load());
  });
</script>

{#if card}
  {@const off = card.placement === "None"}
  <div class="flex flex-col sm:flex-row sm:items-end gap-3">
    <div class="flex-1 min-w-0 space-y-2">
      <p class="text-sm font-semibold" style="color: {$colorStore.text};">{m.plugin.cardPlacement()}</p>
      <div class="grid grid-cols-3 gap-2" role="group" aria-label={m.plugin.cardPlacement()}>
        {#each placementOptions as option (option.id)}
          {@const selected = card.placement === option.id}
          <button
            type="button"
            class="min-h-[44px] px-2 rounded-lg border text-sm font-medium"
            style="background: {selected ? $colorStore.selectedSurface : `${$colorStore.primary}08`}; border-color: {selected ? $colorStore.selectedBorder : `${$colorStore.primary}20`}; color: {$colorStore.text};"
            aria-pressed={selected}
            onclick={() => setPlacement(option.id as CardPlacement)}
          >
            {option.name}
          </button>
        {/each}
      </div>
      {#if !off}
        <button
          type="button"
          class="w-full sm:w-auto flex items-center justify-center gap-2 px-4 rounded-lg min-h-[44px] text-sm font-medium"
          style="background: {$colorStore.primary}20; color: {$colorStore.primary}; border: 1px solid {$colorStore.primary}30;"
          onclick={openDesigner}
        >
          <i class="fa-solid fa-palette" aria-hidden="true"></i>
          {m.plugin.cardDesign()}
        </button>
      {/if}
    </div>
  </div>
{/if}

{#if designing && card && config}
  <Sheet title={m.plugin.cardSheetTitle()} size="2xl" onclose={() => (designing = false)}>
    <CardDesigner
      template={card.template}
      showName={false}
      {config}
      {guildEmojis}
      onsave={saveDesign}
      onimages={setImages}
      {onerror}
    />
  </Sheet>
{/if}
