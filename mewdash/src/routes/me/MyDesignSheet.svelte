<script lang="ts">
  import { m } from "$lib/i18n";
  import { onMount, untrack } from "svelte";
  import { achievementsApi, cardPresetsApi, designsApi } from "$lib/api/index.ts";
  import type { AchievementCard, AchievementCatalog } from "$lib/api/index.ts";
  import { DesignTarget } from "$lib/api/designs/models";
  import type { OwnDesign, OwnDesigns, RankDesignData } from "$lib/api/designs/models";
  import type { CardImage, CardTemplate } from "$lib/api/cards/models";
  import type { CardPresetCatalog } from "$lib/api/cardpresets/models";
  import { colorStore } from "$lib/stores/colorStore";
  import { logger } from "$lib/logger";
  import CardBackgroundGallery from "$lib/components/cards/CardBackgroundGallery.svelte";
  import CardDesigner from "$lib/components/cards/CardDesigner.svelte";
  import { cloneTemplate } from "$lib/components/cards/cardHelpers";
  import DesignPreview from "$lib/components/designs/DesignPreview.svelte";
  import Sheet from "$lib/components/ui/Sheet.svelte";
  import { achievementCardConfig } from "../dashboard/achievements/components/cardDesignerConfig";

  interface Props {
    guildId: string;
    userId: bigint;
    target: DesignTarget;
    own: OwnDesigns;
    onclose: () => void;
    onsaved: (next: OwnDesigns, message: string) => void;
    onerror: (text: string) => void;
  }

  let { guildId, userId, target, own, onclose, onsaved, onerror }: Props = $props();

  const rank = untrack(() => target === DesignTarget.Rank);
  const existing: OwnDesign | null = untrack(() => (rank ? own.rank : own.achievement));
  const emoji = untrack(() => parseEmote(own.currencyEmote));

  let background = $state<string>(rank ? ((existing?.data as RankDesignData | undefined)?.background ?? "") : "");
  let template = $state<CardTemplate | null>(!rank && existing ? (existing.data as CardTemplate) : null);
  let presets = $state<CardPresetCatalog | null>(null);
  let card = $state<AchievementCard | null>(null);
  let catalog = $state<AchievementCatalog | null>(null);
  let storedUpload = $state<string | null>(null);
  let newUpload = $state<string | null>(null);
  let uploadRemoved = $state(false);
  let view = $state<"form" | "designer">("form");
  let session = $state(0);
  let saving = $state(false);
  let fileInput = $state<HTMLInputElement | null>(null);

  const designerConfig = $derived(
    card && catalog ? achievementCardConfig(card, catalog, { guildId, presetsOnly: true }) : null
  );
  const upload = $derived(newUpload ?? (uploadRemoved ? null : storedUpload));
  const hasUpload = $derived(newUpload !== null || (existing?.hasUpload === true && !uploadRemoved));
  const presetUrl = $derived.by(() => {
    if (!background) return null;
    if (background.startsWith("preset:")) {
      return presets?.presets.find((p) => p.reference === background)?.imageUrl ?? existing?.backgroundUrl ?? null;
    }
    return null;
  });
  const previewBackground = $derived(upload ?? presetUrl);
  const statusText = $derived.by(() => {
    if (!existing) return null;
    if (existing.status === "pending") return m.designs.meWaiting();
    if (existing.status === "rejected") {
      return existing.reviewNote
        ? m.designs.meRejectedReason({ reason: existing.reviewNote })
        : m.forms.labelStatusRejected();
    }
    return existing.active ? m.common.approved() : m.designs.memberInactive();
  });

  function parseEmote(raw: string | null | undefined): { url: string } | { text: string } | null {
    if (!raw) return null;
    const match = raw.match(/^<(a?):[^:]+:(\d+)>$/);
    if (match) return { url: `https://cdn.discordapp.com/emojis/${match[2]}.${match[1] ? "gif" : "png"}?size=32` };
    return { text: raw };
  }

  onMount(async () => {
    const tasks: Promise<unknown>[] = [
      cardPresetsApi.get().then((loaded) => (presets = loaded)).catch(() => null)
    ];
    if (existing?.hasUpload) {
      tasks.push(
        designsApi
          .getOwnImage(guildId, userId, target)
          .then((image) => (storedUpload = image?.dataUrl ?? null))
          .catch((err) => logger.warn("Failed to load the member upload", err))
      );
    }
    if (!rank) {
      tasks.push(
        Promise.all([achievementsApi.card(BigInt(guildId)), achievementsApi.catalog(BigInt(guildId))])
          .then(([loadedCard, loadedCatalog]) => {
            card = loadedCard;
            catalog = loadedCatalog;
            if (!template) template = cloneTemplate(loadedCard.builtIn);
          })
          .catch((err) => {
            logger.error("Failed to load the card designer", err);
            onerror(m.designs.meLoadFailed());
          })
      );
    }
    await Promise.all(tasks);
  });

  async function pickFile(event: Event) {
    const input = event.currentTarget as HTMLInputElement;
    const file = input.files?.[0];
    input.value = "";
    if (!file) return;
    if (file.size > 4 * 1024 * 1024) {
      onerror(m.achievements.iconErrorSize());
      return;
    }
    try {
      newUpload = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(file);
      });
      uploadRemoved = false;
    } catch (err) {
      logger.error("Failed to read the upload", err);
      onerror(m.achievements.iconErrorUpload());
    }
  }

  function removeUpload() {
    newUpload = null;
    uploadRemoved = existing?.hasUpload === true;
  }

  async function saveTemplate(_name: string, next: CardTemplate) {
    template = next;
  }

  function openDesigner() {
    session++;
    view = "designer";
  }

  async function save() {
    saving = true;
    try {
      const next = await designsApi.saveOwn(guildId, userId, target, {
        data: rank ? { background } : template,
        upload: newUpload,
        removeUpload: uploadRemoved && newUpload === null
      });
      const saved = target === DesignTarget.Rank ? next.rank : next.achievement;
      onsaved(next, saved?.status === "pending" ? m.designs.meSavedPending() : m.designs.meSaved());
      onclose();
    } catch (err: any) {
      logger.error("Failed to save the member design", err);
      onerror(err?.message || m.designs.meSaveFailed());
    } finally {
      saving = false;
    }
  }
</script>

<Sheet
  title={m.designs.meSheetTitle({ card: rank ? m.xp.cardRankTitle() : m.designs.targetAchievement() })}
  {onclose}
  size="2xl"
>
  {#if view === "designer" && designerConfig && template}
    {#key session}
      <CardDesigner
        name=""
        {template}
        isNew={false}
        showName={false}
        config={designerConfig}
        onsave={saveTemplate}
        onclose={() => (view = "form")}
        onimages={(_images: CardImage[]) => {}}
        onerror={onerror}
      />
    {/key}
  {:else}
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 min-w-0">
      <div class="space-y-4 min-w-0">
        {#if rank}
          <DesignPreview {guildId} target={DesignTarget.Rank} backgroundUrl={previewBackground} name={m.designs.meOwnName()} />
        {:else if template}
          <DesignPreview {guildId} target={DesignTarget.Achievement} {template} version={`own:${session}`} name={m.designs.meOwnName()} />
        {:else}
          <p class="text-sm" style="color: {$colorStore.muted}">{m.common.loading()}</p>
        {/if}

        {#if statusText}
          <p class="text-sm break-words" style="color: {existing?.status === 'rejected' ? '#ef4444' : $colorStore.muted}">{statusText}</p>
        {/if}

        {#if !rank}
          <button type="button" class="px-5 rounded-xl min-h-[50px] font-medium w-full flex items-center justify-center gap-2 disabled:opacity-50"
                  style="background: {$colorStore.primary}; color: {$colorStore.onPrimary};" disabled={!designerConfig} onclick={openDesigner}>
            <i class="fa-solid fa-pen" aria-hidden="true"></i>{m.designs.editCard()}
          </button>
        {/if}
      </div>

      <div class="space-y-4 min-w-0">
        {#if rank}
          <CardBackgroundGallery
            value={background}
            active={background !== ""}
            images={[]}
            upload={async () => {
              throw new Error(m.designs.meSaveFailed());
            }}
            presets={() => cardPresetsApi.get()}
            presetsOnly
            onpick={(value) => (background = value)}
            onimages={() => {}}
            onerror={onerror}
          />
          {#if background}
            <button type="button" class="px-4 rounded-xl min-h-[44px] text-sm font-medium"
                    style="background: {$colorStore.primary}10; color: {$colorStore.text}; border: 1px solid {$colorStore.primary}20;"
                    onclick={() => (background = "")}>
              {m.xp.removeBackground()}
            </button>
          {/if}
        {/if}

        {#if own.uploads}
          <div class="rounded-xl border p-3 space-y-3" style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}20;">
            {#if upload && !rank}
              <img src={upload} alt="" class="w-full max-h-40 rounded-lg object-cover" />
            {/if}
            <div class="flex flex-wrap gap-2">
              <button type="button" class="px-4 rounded-lg min-h-[44px] text-sm font-medium flex items-center gap-2"
                      style="background: {$colorStore.primary}20; color: {$colorStore.text}; border: 1px solid {$colorStore.primary}30;"
                      onclick={() => fileInput?.click()}>
                <i class="fa-solid fa-upload" aria-hidden="true"></i>
                {hasUpload ? m.designs.meUploadReplace() : m.designs.meUpload()}
              </button>
              {#if hasUpload}
                <button type="button" class="px-4 rounded-lg min-h-[44px] text-sm"
                        style="background: #ef444420; color: #ef4444; border: 1px solid #ef444430;" onclick={removeUpload}>
                  {m.designs.meUploadRemove()}
                </button>
              {/if}
            </div>
            {#if own.review && hasUpload}
              <p class="text-xs" style="color: {$colorStore.muted}">{m.designs.meUploadPending()}</p>
            {/if}
            <input bind:this={fileInput} type="file" accept="image/png,image/jpeg,image/gif,image/webp" class="hidden" onchange={pickFile} />
          </div>
        {/if}
      </div>
    </div>
  {/if}

  {#snippet footer()}
    <span class="mr-auto flex items-center gap-1.5 text-sm" style="color: {$colorStore.muted}">
      {own.cost > 0 ? m.designs.meCost({ amount: own.cost.toLocaleString() }) : m.designs.meCostFree()}
      {#if own.cost > 0 && emoji}
        {#if "url" in emoji}
          <img src={emoji.url} alt="" class="w-5 h-5" />
        {:else}
          <span aria-hidden="true">{emoji.text}</span>
        {/if}
      {/if}
    </span>
    <button type="button" class="px-4 rounded-lg min-h-[44px]" style="background: {$colorStore.primary}10; color: {$colorStore.text}; border: 1px solid {$colorStore.primary}20;" onclick={onclose}>
      {m.common.cancel()}
    </button>
    <button type="button" class="px-5 rounded-lg min-h-[44px] font-medium disabled:opacity-50" style="background: {$colorStore.primary}; color: {$colorStore.onPrimary};" disabled={saving || (!rank && !template)} onclick={save}>
      {saving ? m.common.saving() : m.common.save()}
    </button>
  {/snippet}
</Sheet>
