<script lang="ts">
  import { m } from "$lib/i18n";
  import { onMount, untrack } from "svelte";
  import { achievementsApi, cardPresetsApi, designsApi } from "$lib/api/index.ts";
  import type { AchievementCard, AchievementCatalog, AchievementLookups } from "$lib/api/index.ts";
  import { DesignAvailability, DesignTarget, DesignUnlockType } from "$lib/api/designs/models";
  import type { Design, DesignRequest, RankDesignData } from "$lib/api/designs/models";
  import type { CardImage, CardTemplate } from "$lib/api/cards/models";
  import type { CardPresetCatalog } from "$lib/api/cardpresets/models";
  import { currentGuild } from "$lib/stores/currentGuild";
  import { colorStore } from "$lib/stores/colorStore";
  import { logger } from "$lib/logger";
  import CardBackgroundGallery from "$lib/components/cards/CardBackgroundGallery.svelte";
  import CardDesigner from "$lib/components/cards/CardDesigner.svelte";
  import { cloneTemplate } from "$lib/components/cards/cardHelpers";
  import DesignPreview from "$lib/components/designs/DesignPreview.svelte";
  import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";
  import SettingField from "$lib/components/forms/SettingField.svelte";
  import ToggleRow from "$lib/components/forms/ToggleRow.svelte";
  import Sheet from "$lib/components/ui/Sheet.svelte";
  import { guildEmojiGroups, iconImageSrc } from "../../achievements/achievementHelpers";
  import { achievementCardConfig } from "../../achievements/components/cardDesignerConfig";
  import NumberField from "./NumberField.svelte";
  import { idString, type Named, type Notify } from "./currencyModel";

  interface Props {
    guildId: bigint;
    design: Design | null;
    roles: Named[];
    notify: Notify;
    onclose: () => void;
    onsaved: () => Promise<void>;
  }

  let { guildId, design, roles, notify, onclose, onsaved }: Props = $props();

  const initial = untrack(() => design);
  const editingName = initial?.name ?? null;
  const lockedTarget = initial !== null;

  let name = $state(initial?.name ?? "");
  let target = $state<DesignTarget>(initial?.target ?? DesignTarget.Rank);
  let availability = $state<DesignAvailability>(initial?.availability ?? DesignAvailability.Free);
  let unlockType = $state<DesignUnlockType>(initial?.unlockType ?? DesignUnlockType.Level);
  let unlockLevel = $state<number>(initial?.unlockLevel ?? 5);
  let unlockAchievementKey = $state<string | null>(initial?.unlockAchievementKey ?? null);
  let unlockRoleId = $state<bigint | null>(initial?.unlockRoleId ?? null);
  let makeDefault = $state(initial?.isDefault ?? false);
  let background = $state<string>(
    initial && initial.target === DesignTarget.Rank ? ((initial.data as RankDesignData).background ?? "") : ""
  );
  let template = $state<CardTemplate | null>(
    initial && initial.target === DesignTarget.Achievement ? (initial.data as CardTemplate) : null
  );
  let view = $state<"form" | "designer">("form");
  let session = $state(0);
  let saving = $state(false);
  let card = $state<AchievementCard | null>(null);
  let catalog = $state<AchievementCatalog | null>(null);
  let lookups = $state<AchievementLookups | null>(null);
  let presets = $state<CardPresetCatalog | null>(null);
  let images = $state<CardImage[]>([]);

  const customRoles = $derived(roles.filter((r) => r.id !== $currentGuild?.id?.toString()));
  const designerConfig = $derived(card && catalog ? achievementCardConfig(card, catalog) : null);
  const guildEmojis = $derived(guildEmojiGroups(lookups, $currentGuild));
  const achievementOptions = $derived((catalog?.achievements ?? []).map((a) => ({ id: a.key, name: a.name })));
  const targetOptions = $derived([
    { id: DesignTarget.Rank.toString(), name: m.xp.cardRankTitle() },
    { id: DesignTarget.Achievement.toString(), name: m.designs.targetAchievement() }
  ]);
  const availabilityOptions = $derived([
    { id: DesignAvailability.Free.toString(), name: m.designs.availabilityFree() },
    { id: DesignAvailability.Shop.toString(), name: m.designs.availabilityShop() },
    { id: DesignAvailability.Unlock.toString(), name: m.designs.availabilityUnlock() }
  ]);
  const unlockTypeOptions = $derived([
    { id: DesignUnlockType.Level.toString(), name: m.designs.unlockTypeLevel() },
    { id: DesignUnlockType.Achievement.toString(), name: m.designs.unlockTypeAchievement() },
    { id: DesignUnlockType.Role.toString(), name: m.designs.unlockTypeRole() }
  ]);
  const field = $derived(
    `background: ${$colorStore.primary}10; border-color: ${$colorStore.primary}30; color: ${$colorStore.text};`
  );
  const backgroundPreview = $derived.by(() => {
    if (!background) return null;
    if (initial?.backgroundRef === background && initial.backgroundUrl) return initial.backgroundUrl;
    if (background.startsWith("preset:")) return presets?.presets.find((p) => p.reference === background)?.imageUrl ?? null;
    if (background.startsWith("upload:")) return iconImageSrc(images.find((i) => i.icon === background)?.url);
    return background;
  });

  onMount(async () => {
    try {
      const [loadedCard, loadedCatalog, loadedLookups, loadedPresets] = await Promise.all([
        achievementsApi.card(guildId),
        achievementsApi.catalog(guildId),
        achievementsApi.lookups(guildId).catch(() => null),
        cardPresetsApi.get().catch(() => null)
      ]);
      card = loadedCard;
      catalog = loadedCatalog;
      lookups = loadedLookups;
      presets = loadedPresets;
      images = loadedCard.images;
      if (target === DesignTarget.Achievement && !template) template = cloneTemplate(loadedCard.builtIn);
    } catch (err: any) {
      logger.error("Failed to load the design editor", err);
      notify(err?.message ?? m.designs.notifyLoadFailed(), "error");
    }
  });

  function pickTarget(next: DesignTarget) {
    target = next;
    if (next === DesignTarget.Achievement && !template && card) template = cloneTemplate(card.builtIn);
  }

  function openDesigner() {
    session++;
    view = "designer";
  }

  async function saveTemplate(_name: string, next: CardTemplate) {
    template = next;
  }

  function buildRequest(): DesignRequest {
    const unlocking = availability === DesignAvailability.Unlock;
    return {
      name: name.trim(),
      target,
      data: target === DesignTarget.Rank ? { background } : template,
      availability,
      unlockType: unlocking ? unlockType : null,
      unlockLevel: unlocking && unlockType === DesignUnlockType.Level ? unlockLevel : null,
      unlockAchievementKey: unlocking && unlockType === DesignUnlockType.Achievement ? unlockAchievementKey : null,
      unlockRoleId: unlocking && unlockType === DesignUnlockType.Role ? unlockRoleId : null
    };
  }

  async function save() {
    if (!name.trim()) {
      notify(m.achievements.cardDesignerErrorNameRequired(), "error");
      return;
    }
    if (availability === DesignAvailability.Unlock) {
      if (unlockType === DesignUnlockType.Achievement && !unlockAchievementKey) {
        notify(m.designs.notifyNeedsAchievement(), "error");
        return;
      }
      if (unlockType === DesignUnlockType.Role && !unlockRoleId) {
        notify(m.designs.notifyNeedsRole(), "error");
        return;
      }
    }
    saving = true;
    try {
      const request = buildRequest();
      const saved = initial
        ? await designsApi.update(guildId, initial.id, request)
        : await designsApi.create(guildId, request);
      if (makeDefault !== saved.isDefault) {
        try {
          if (makeDefault) await designsApi.setDefault(guildId, saved.id);
          else await designsApi.clearDefault(guildId, saved.id);
        } catch (err: any) {
          logger.error("Failed to change the default design", err);
          notify(err?.message ?? m.designs.notifyDefaultFailed(), "error");
        }
      }
      notify(m.designs.notifySaved({ name: request.name }));
      await onsaved();
      onclose();
    } catch (err: any) {
      logger.error("Failed to save a design", err);
      notify(err?.message ?? m.achievements.cardDesignerErrorSave(), "error");
    } finally {
      saving = false;
    }
  }
</script>

<Sheet title={editingName ? m.currency.shopEditing({ name: editingName }) : m.achievements.cardsTabNewDesign()} {onclose} size="2xl">
  {#if view === "designer" && designerConfig && template}
    {#key session}
      <CardDesigner
        {name}
        {template}
        isNew={false}
        showName={false}
        config={designerConfig}
        {guildEmojis}
        onsave={saveTemplate}
        onclose={() => (view = "form")}
        onimages={(next) => (images = next)}
        onerror={(text) => notify(text, "error")}
      />
    {/key}
  {:else}
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 min-w-0">
      <div class="space-y-4 min-w-0">
        <SettingField label={m.common.name()} id="design-name">
          <input id="design-name" type="text" maxlength="40" bind:value={name} class="w-full p-3 rounded-lg border min-h-[50px]" style={field} />
        </SettingField>

        <SettingField label={m.designs.fieldCard()} id="design-target">
          <DiscordSelector
            id="design-target"
            type="custom"
            options={targetOptions}
            selected={target.toString()}
            searchable={false}
            clearable={false}
            disabled={lockedTarget}
            customIcon="fa-id-card"
            ariaLabel={m.designs.fieldCard()}
            onchange={({ selected }) => pickTarget(Number(selected) as DesignTarget)}
          />
        </SettingField>

        <SettingField label={m.designs.fieldAvailability()} id="design-availability">
          <DiscordSelector
            id="design-availability"
            type="custom"
            options={availabilityOptions}
            selected={availability.toString()}
            searchable={false}
            clearable={false}
            customIcon="fa-tag"
            ariaLabel={m.designs.fieldAvailability()}
            onchange={({ selected }) => (availability = Number(selected) as DesignAvailability)}
          />
        </SettingField>

        {#if availability === DesignAvailability.Unlock}
          <div class="rounded-xl border p-3 space-y-3" style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}20;">
            <SettingField label={m.designs.unlockWhen()} id="design-unlock-type">
              <DiscordSelector
                id="design-unlock-type"
                type="custom"
                options={unlockTypeOptions}
                selected={unlockType.toString()}
                searchable={false}
                clearable={false}
                customIcon="fa-lock-open"
                ariaLabel={m.designs.unlockWhen()}
                onchange={({ selected }) => (unlockType = Number(selected) as DesignUnlockType)}
              />
            </SettingField>
            {#if unlockType === DesignUnlockType.Level}
              <NumberField id="design-unlock-level" label={m.common.level()} value={unlockLevel} min={1} max={1000} onchange={(value) => (unlockLevel = value ?? 1)} />
            {:else if unlockType === DesignUnlockType.Achievement}
              <SettingField label={m.achievements.cardsTabRuleAchievement()} id="design-unlock-achievement">
                <DiscordSelector
                  id="design-unlock-achievement"
                  type="custom"
                  options={achievementOptions}
                  selected={unlockAchievementKey}
                  clearable={false}
                  customIcon="fa-trophy"
                  placeholder={m.designs.pickAchievement()}
                  ariaLabel={m.achievements.cardsTabRuleAchievement()}
                  onchange={({ selected }) => (unlockAchievementKey = typeof selected === "string" ? selected : null)}
                />
              </SettingField>
            {:else}
              <SettingField label={m.common.role()} id="design-unlock-role">
                <DiscordSelector
                  id="design-unlock-role"
                  type="role"
                  options={customRoles}
                  selected={idString(unlockRoleId) || null}
                  placeholder={m.common.pickRolePlaceholder()}
                  ariaLabel={m.common.role()}
                  onchange={({ selected }) => (unlockRoleId = selected ? BigInt(selected as string) : null)}
                />
              </SettingField>
            {/if}
          </div>
        {/if}

        <ToggleRow checked={makeDefault} title={m.designs.fieldDefault()} subtitle={m.designs.fieldDefaultHint()} colors={$colorStore} onchange={(v) => (makeDefault = v)} />
      </div>

      <div class="space-y-4 min-w-0">
        {#if target === DesignTarget.Rank}
          <DesignPreview {guildId} target={DesignTarget.Rank} backgroundUrl={backgroundPreview} name={name || m.achievements.cardsTabNewDesign()} />
          {#if card}
            <CardBackgroundGallery
              value={background}
              active={background !== ""}
              {images}
              upload={(data) => achievementsApi.uploadCardImage(guildId, data)}
              imageSrc={iconImageSrc}
              presets={() => cardPresetsApi.get()}
              onpick={(value) => (background = value)}
              onimages={(next) => (images = next)}
              onerror={(text) => notify(text, "error")}
            />
            {#if background}
              <button type="button" class="px-4 rounded-xl min-h-[44px] text-sm font-medium"
                      style="background: {$colorStore.primary}10; color: {$colorStore.text}; border: 1px solid {$colorStore.primary}20;"
                      onclick={() => (background = "")}>
                {m.xp.removeBackground()}
              </button>
            {/if}
          {:else}
            <p class="text-sm" style="color: {$colorStore.muted}">{m.common.loading()}</p>
          {/if}
        {:else if template}
          <DesignPreview {guildId} target={DesignTarget.Achievement} {template} version={`${initial?.id ?? "new"}:${session}`} name={name || m.achievements.cardsTabNewDesign()} />
          <button type="button" class="px-5 rounded-xl min-h-[50px] font-medium w-full flex items-center justify-center gap-2 disabled:opacity-50"
                  style="background: {$colorStore.primary}; color: {$colorStore.onPrimary};" disabled={!designerConfig} onclick={openDesigner}>
            <i class="fa-solid fa-pen" aria-hidden="true"></i>{m.designs.editCard()}
          </button>
        {:else}
          <p class="text-sm" style="color: {$colorStore.muted}">{m.common.loading()}</p>
        {/if}
      </div>
    </div>
  {/if}

  {#snippet footer()}
    <button type="button" class="px-4 rounded-lg min-h-[44px]" style="background: {$colorStore.primary}10; color: {$colorStore.text}; border: 1px solid {$colorStore.primary}20;" onclick={onclose}>
      {m.common.cancel()}
    </button>
    <button type="button" class="px-5 rounded-lg min-h-[44px] font-medium disabled:opacity-50" style="background: {$colorStore.primary}; color: {$colorStore.onPrimary};" disabled={saving} onclick={save}>
      {saving ? m.common.saving() : editingName ? m.common.saveChanges() : m.common.create()}
    </button>
  {/snippet}
</Sheet>
