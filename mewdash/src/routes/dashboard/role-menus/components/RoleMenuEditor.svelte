<script lang="ts">
  import { m } from "$lib/i18n";
  import { untrack } from "svelte";
  import { fade } from "svelte/transition";
  import { colorStore } from "$lib/stores/colorStore";
  import { currentGuild } from "$lib/stores/currentGuild";
  import {
    roleMenusApi,
    RoleMenuButtonColor,
    RoleMenuMode,
    RoleMenuReplyMode,
    RoleMenuStyle,
    type RoleMenu,
    type RoleMenuLookups,
    type RoleMenuRequest
  } from "$lib/api/index.ts";
  import type { GuildEmojiInfo } from "$lib/api/client/models";
  import type { DiscordUser } from "$lib/types/discord";
  import { logger } from "$lib/logger";
  import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";
  import ToggleRow from "$lib/components/forms/ToggleRow.svelte";
  import FullscreenEmbedBuilder from "$lib/components/specialized/FullscreenEmbedBuilder.svelte";
  import RoleMenuOptionRow from "./RoleMenuOptionRow.svelte";
  import RoleMenuPreview from "./RoleMenuPreview.svelte";
  import {
    BUTTONS_PER_ROW,
    clampLimits,
    defaultPlaceholder,
    LABEL_LENGTH,
    MAX_OPTIONS,
    NAME_LENGTH,
    newOptionKey,
    parseMessageSource,
    PLACEHOLDER_LENGTH,
    serializeMessage,
    type PreviewOption,
    type RoleMenuOptionDraft
  } from "../roleMenuDefaults";

  /** Inputs for the menu editor. */
  interface Props {
    /** The menu being edited, or null for a new menu */
    menu: RoleMenu | null;
    /** Channels, roles, emojis, and limits from the bot */
    lookups: RoleMenuLookups | null;
    /** The signed in user, for previews */
    user?: DiscordUser | null;
    /** Whether the draft differs from what was loaded */
    dirty?: boolean;
    /** Called with the saved menu after a successful post or save */
    onsaved: (menu: RoleMenu, created: boolean) => void;
    /** Called when the user asks to leave the editor */
    oncancel: () => void;
    /** Called when the user asks to delete the menu being edited */
    ondelete: () => void;
    /** Called with a message when saving fails */
    onerror: (message: string) => void;
  }

  let {
    menu,
    lookups,
    user = null,
    dirty = $bindable(false),
    onsaved,
    oncancel,
    ondelete,
    onerror
  }: Props = $props();

  /** The editable state of a menu. Snowflakes stay strings until the request is built. */
  interface MenuDraft {
    name: string;
    channelId: string | null;
    message: string | Record<string, any>;
    style: number;
    placeholder: string;
    mode: number;
    minRoles: number;
    maxRoles: number;
    requiredRoleId: string | null;
    replyMode: number;
    options: RoleMenuOptionDraft[];
  }

  /** A blank option row. */
  function blankOption(): RoleMenuOptionDraft {
    return {
      key: newOptionKey(),
      id: null,
      roleId: null,
      label: "",
      emoji: null,
      description: "",
      buttonStyle: RoleMenuButtonColor.Grey,
      problem: null
    };
  }

  /**
   * Builds the starting draft for a menu, or for a new one.
   * @param source The menu being edited, or null
   * @param known The lookups, used to drop a channel that no longer exists
   */
  function createDraft(source: RoleMenu | null, known: RoleMenuLookups | null): MenuDraft {
    if (!source) {
      return {
        name: "",
        channelId: null,
        message: {},
        style: RoleMenuStyle.Dropdown,
        placeholder: "",
        mode: RoleMenuMode.PickAny,
        minRoles: 0,
        maxRoles: 0,
        requiredRoleId: null,
        replyMode: RoleMenuReplyMode.Private,
        options: [blankOption()]
      };
    }

    const channelId = source.channelId.toString();
    const channelExists = !known || known.channels.some((c) => c.id.toString() === channelId);

    return {
      name: source.name,
      channelId: channelExists ? channelId : null,
      message: parseMessageSource(source.message),
      style: source.style,
      placeholder: source.placeholder ?? "",
      mode: source.mode,
      minRoles: source.minRoles,
      maxRoles: source.maxRoles,
      requiredRoleId: source.requiredRoleId ? source.requiredRoleId.toString() : null,
      replyMode: source.replyMode,
      options: source.options.map((o) => ({
        key: newOptionKey(),
        id: o.id,
        roleId: o.roleId.toString(),
        label: o.label ?? "",
        emoji: o.emoji ?? null,
        description: o.description ?? "",
        buttonStyle: o.buttonStyle || RoleMenuButtonColor.Grey,
        problem: o.problem ?? null
      }))
    };
  }

  /**
   * A comparable text form of a draft, for unsaved change tracking.
   * @param value The draft
   */
  function snapshot(value: MenuDraft): string {
    return JSON.stringify({
      name: value.name,
      channelId: value.channelId,
      message: serializeMessage(value.message),
      style: value.style,
      placeholder: value.placeholder,
      mode: value.mode,
      minRoles: value.minRoles,
      maxRoles: value.maxRoles,
      requiredRoleId: value.requiredRoleId,
      replyMode: value.replyMode,
      options: value.options.map((o) => [o.id, o.roleId, o.label, o.emoji, o.description, o.buttonStyle])
    });
  }

  let draft = $state<MenuDraft>(untrack(() => createDraft(menu, lookups)));
  const initialSnapshot = untrack(() => snapshot(draft));
  let saving = $state(false);

  $effect(() => {
    dirty = snapshot(draft) !== initialSnapshot;
  });

  /** Channels the bot can post in, plus the selected one so the selector can show it. */
  let channelOptions = $derived(
    (lookups?.channels ?? [])
      .filter((c) => c.canPost || c.id.toString() === draft.channelId)
      .map((c) => ({ id: c.id.toString(), name: c.name }))
  );

  /** Whether the selected channel is one the bot can't post in. */
  let channelBlocked = $derived(
    !!draft.channelId && !!lookups &&
    !lookups.channels.some((c) => c.canPost && c.id.toString() === draft.channelId)
  );

  /** Every role, for the required role selector. */
  let allRoleOptions = $derived(
    (lookups?.roles ?? []).map((r) => ({ id: r.id.toString(), name: r.name, color: r.color }))
  );

  /** This server's emojis, shaped for the emoji picker. */
  let guildEmojis = $derived<GuildEmojiInfo[]>(
    lookups && lookups.emojis.length > 0
      ? [{
        guild: { id: $currentGuild?.id?.toString() ?? "", name: $currentGuild?.name ?? m.roleMenus.editorThisServer() },
        emojis: lookups.emojis.map((e) => ({
          id: e.id.toString(),
          name: e.name,
          animated: e.animated,
          isAvailable: true,
          roleIds: [],
          requireColons: true,
          url: e.url
        }))
      }]
      : []
  );

  /** Largest value the limit selectors offer. */
  let limitCeiling = $derived(Math.max(draft.options.length, 1));

  /** Choices for "Must keep at least". */
  let minChoices = $derived(
    Array.from({ length: limitCeiling + 1 }, (_, i) => ({ id: i.toString(), name: i === 0 ? m.common.none() : i.toString() }))
  );

  /** Choices for "Can hold at most". */
  let maxChoices = $derived(
    Array.from({ length: limitCeiling + 1 }, (_, i) => ({ id: i.toString(), name: i === 0 ? m.common.noLimit() : i.toString() }))
  );

  /** The first rule the draft breaks, or null when it can be saved. */
  let invalidReason = $derived.by(() => {
    if (!draft.channelId) return m.common.pickChannelPlaceholder();
    if (draft.options.length === 0) return m.roleMenus.editorInvalidNoOptions();
    if (draft.options.some((o) => !o.roleId)) return m.roleMenus.editorInvalidRole();
    const ids = draft.options.map((o) => o.roleId);
    if (new Set(ids).size !== ids.length) return m.roleMenus.editorInvalidDuplicate();
    if (draft.options.some((o) => o.label.trim().length > LABEL_LENGTH)) return m.roleMenus.editorInvalidNameLength({ max: LABEL_LENGTH });
    return null;
  });

  /** Options shaped for the preview, skipping rows with nothing to show yet. */
  let previewOptions = $derived<PreviewOption[]>(
    draft.options
      .map((o) => ({
        label: o.label,
        roleName: lookups?.roles.find((r) => r.id.toString() === o.roleId)?.name ?? null,
        emoji: o.emoji,
        description: o.description,
        buttonStyle: o.buttonStyle
      }))
      .filter((o) => o.label.trim() || o.roleName)
  );

  /**
   * Roles a row may pick: assignable roles no other row uses, plus the row's own role so it stays visible.
   * @param index The row's position
   */
  function roleOptionsFor(index: number) {
    const own = draft.options[index]?.roleId ?? null;
    const taken = new Set(draft.options.filter((_, i) => i !== index).map((o) => o.roleId).filter(Boolean));
    return (lookups?.roles ?? [])
      .filter((r) => {
        const id = r.id.toString();
        if (id === own) return true;
        return r.assignable && !taken.has(id);
      })
      .map((r) => ({ id: r.id.toString(), name: r.name, color: r.color }));
  }

  /** Re-applies the bot's limit rules after the mode or option count changes. */
  function clampDraft() {
    const clamped = clampLimits(draft.mode, draft.minRoles, draft.maxRoles, draft.options.length);
    draft.minRoles = clamped.min;
    draft.maxRoles = clamped.max;
  }

  /**
   * Switches between pick any and pick one.
   * @param mode The new mode
   */
  function setMode(mode: number) {
    if (draft.mode === mode) return;
    const wasPickOne = draft.mode === RoleMenuMode.PickOne;
    draft.mode = mode;
    if (mode === RoleMenuMode.PickAny && wasPickOne) draft.maxRoles = 0;
    clampDraft();
  }

  /** Adds a blank option at the end. */
  function addOption() {
    if (draft.options.length >= MAX_OPTIONS) return;
    draft.options = [...draft.options, blankOption()];
    clampDraft();
  }

  /**
   * Removes an option.
   * @param key The option's local key
   */
  function removeOption(key: string) {
    draft.options = draft.options.filter((o) => o.key !== key);
    clampDraft();
  }

  /**
   * Swaps an option with its neighbour.
   * @param index The option's position
   * @param offset -1 to move up, 1 to move down
   */
  function moveOption(index: number, offset: number) {
    const target = index + offset;
    if (target < 0 || target >= draft.options.length) return;
    const next = [...draft.options];
    [next[index], next[target]] = [next[target], next[index]];
    draft.options = next;
  }

  /**
   * Reads a number from a custom selector.
   * @param selected The selector value
   * @param fallback Value when nothing is selected
   */
  function selectedNumber(selected: string | string[] | null, fallback: number): number {
    return typeof selected === "string" && selected ? parseInt(selected) : fallback;
  }

  /** Builds the full request the bot expects. */
  function buildRequest(): RoleMenuRequest {
    const message = serializeMessage(draft.message);
    const placeholder = draft.placeholder.trim();
    return {
      name: draft.name.trim(),
      channelId: BigInt(draft.channelId ?? "0"),
      message,
      style: draft.style,
      placeholder: placeholder || null,
      mode: draft.mode,
      minRoles: draft.minRoles,
      maxRoles: draft.mode === RoleMenuMode.PickOne ? 1 : draft.maxRoles,
      requiredRoleId: draft.requiredRoleId ? BigInt(draft.requiredRoleId) : 0n,
      replyMode: draft.replyMode,
      enabled: menu?.enabled ?? true,
      options: draft.options.map((o) => ({
        id: o.id,
        roleId: BigInt(o.roleId ?? "0"),
        label: o.label.trim(),
        emoji: o.emoji?.trim() || null,
        description: o.description.trim() || null,
        buttonStyle: o.buttonStyle
      }))
    };
  }

  /** Posts a new menu or saves changes to this one. */
  async function save() {
    if (!$currentGuild?.id || invalidReason || saving) return;
    saving = true;
    try {
      const request = buildRequest();
      const saved = menu
        ? await roleMenusApi.update($currentGuild.id, menu.id, request)
        : await roleMenusApi.create($currentGuild.id, request);
      dirty = false;
      onsaved(saved, !menu);
    } catch (err: any) {
      logger.error("Failed to save role menu:", err);
      onerror(err?.message || m.roleMenus.pageSaveFailed());
    } finally {
      saving = false;
    }
  }
</script>

{#snippet sectionHeading(icon: string, title: string)}
  <div class="flex items-center gap-3 mb-6">
    <i class="fa-utility-duo fa-regular {icon}"
       style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary}; font-size: 20px;"></i>
    <h2 class="text-xl font-bold" style="color: {$colorStore.text}">{title}</h2>
  </div>
{/snippet}

{#snippet choiceCard(pressed: boolean, icon: string, title: string, text: string, onclick: () => void)}
  <button
    type="button"
    class="w-full flex items-start gap-3 p-4 rounded-xl border text-left transition-all hover:scale-[1.01] min-h-[44px]"
    style="background: {pressed ? $colorStore.primary + '20' : $colorStore.primary + '08'};
           border-color: {pressed ? $colorStore.primary : $colorStore.primary + '30'};"
    aria-pressed={pressed}
    {onclick}
  >
    <i class="fa-solid {icon} mt-1" style="color: {pressed ? $colorStore.primary : $colorStore.muted}; font-size: 18px;"
       aria-hidden="true"></i>
    <span class="min-w-0">
      <span class="block font-semibold" style="color: {pressed ? $colorStore.primary : $colorStore.text}">{title}</span>
      <span class="block text-sm" style="color: {$colorStore.muted}">{text}</span>
    </span>
  </button>
{/snippet}

<div class="w-full space-y-6" in:fade={{ duration: 200 }}>
  <div class="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
    <button
      type="button"
      class="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl transition-all hover:scale-[1.02] min-h-[44px] font-medium self-start"
      style="background: {$colorStore.primary}20; color: {$colorStore.primary}; border: 1px solid {$colorStore.primary}30;"
      onclick={oncancel}
    >
      <i class="fa-solid fa-arrow-left" aria-hidden="true"></i>
      {m.roleMenus.editorAllMenus()}
    </button>
    <h2 class="text-2xl font-bold truncate" style="color: {$colorStore.text}">
      {menu ? m.common.editName({ name: menu.name }) : m.roleMenus.actionNewMenu()}
    </h2>
  </div>

  <div class="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">
    <div class="lg:col-span-3 space-y-6">
      <div class="relative rounded-2xl border p-6 md:p-8 shadow-2xl"
           style="z-index: 70; background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15, {$colorStore.gradientEnd}10);
                  border-color: {$colorStore.primary}30;">
        {@render sectionHeading("fa-circle-info", m.common.basics())}
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          <div>
            <label for="rm-name" class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">{m.common.name()}</label>
            <input id="rm-name"
                   type="text"
                   bind:value={draft.name}
                   maxlength={NAME_LENGTH}
                   placeholder={m.common.pronouns()}
                   class="w-full p-3 rounded-xl border transition-all min-h-[44px] text-base"
                   style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
            >
            <p class="text-xs mt-2" style="color: {$colorStore.muted}">
              {m.roleMenus.editorNameHint()}
            </p>
          </div>

          <div>
            <span id="rm-channel" class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">{m.common.channel()}</span>
            <div class="min-h-[44px]">
              <DiscordSelector
                type="channel"
                options={channelOptions}
                selected={draft.channelId}
                placeholder={m.common.pickChannelPlaceholder()}
                ariaLabelledby="rm-channel"
                onchange={(detail) => {
                  draft.channelId = typeof detail.selected === "string" && detail.selected ? detail.selected : null;
                }}
              />
            </div>
          </div>
        </div>

        {#if channelBlocked}
          <div class="mt-4 p-4 rounded-xl flex items-center gap-3"
               style="background: {$colorStore.accent}20; border: 1px solid {$colorStore.accent}30;">
            <i class="fa-utility-duo fa-regular fa-circle-exclamation"
               style="--fa-primary-color: {$colorStore.accent}; --fa-secondary-color: {$colorStore.primary}; font-size: 20px;"></i>
            <span class="text-sm" style="color: {$colorStore.text}">
              {m.roleMenus.editorChannelBlocked()}
            </span>
          </div>
        {/if}
      </div>

      <div class="relative rounded-2xl border p-6 md:p-8 shadow-2xl"
           style="z-index: 60; background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15, {$colorStore.gradientEnd}10);
                  border-color: {$colorStore.primary}30;">
        {@render sectionHeading("fa-comment", m.common.message())}
        <FullscreenEmbedBuilder id="rolemenu-message"
                                bind:value={draft.message}
                                previewTitle={m.roleMenus.editorMessagePreviewTitle()}
                                previewDescription={m.roleMenus.editorMessagePreviewDescription()}
                                icon="fa-list-ul"
                                allowContent={true}
                                allowMultipleEmbeds={true}
                                maxEmbeds={10}
                                allowComponents={false}
                                guildId={$currentGuild?.id}
                                user={user}
                                placeholder={m.roleMenus.editorMessagePlaceholder()}
        />
        <p class="text-xs mt-3" style="color: {$colorStore.muted}">
          {m.roleMenus.editorMessageHint()}
        </p>
      </div>

      <div class="relative rounded-2xl border p-6 md:p-8 shadow-2xl"
           style="z-index: 50; background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15, {$colorStore.gradientEnd}10);
                  border-color: {$colorStore.primary}30;">
        {@render sectionHeading("fa-layer-group", m.roleMenus.importMenuType())}
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {@render choiceCard(draft.style === RoleMenuStyle.Dropdown, "fa-square-caret-down", m.common.dropdown(),
            m.roleMenus.editorTypeDropdownText(), () => { draft.style = RoleMenuStyle.Dropdown; })}
          {@render choiceCard(draft.style === RoleMenuStyle.Buttons, "fa-grip", m.common.buttons(),
            m.roleMenus.editorTypeButtonsText(), () => { draft.style = RoleMenuStyle.Buttons; })}
        </div>

        {#if draft.style === RoleMenuStyle.Dropdown}
          <div class="mt-6">
            <label for="rm-placeholder" class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">
              {m.roleMenus.editorHintTextLabel()}
            </label>
            <input id="rm-placeholder"
                   type="text"
                   bind:value={draft.placeholder}
                   maxlength={PLACEHOLDER_LENGTH}
                   placeholder={defaultPlaceholder(draft.mode)}
                   class="w-full p-3 rounded-xl border transition-all min-h-[44px] text-base"
                   style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
            >
            <p class="text-xs mt-2" style="color: {$colorStore.muted}">{m.roleMenus.editorHintTextHelp()}</p>
          </div>
        {/if}
      </div>

      <div class="relative rounded-2xl border p-6 md:p-8 shadow-2xl"
           style="z-index: 40; background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15, {$colorStore.gradientEnd}10);
                  border-color: {$colorStore.primary}30;">
        {@render sectionHeading("fa-hand", m.roleMenus.editorSectionPicking())}
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {@render choiceCard(draft.mode === RoleMenuMode.PickAny, "fa-list-check", m.roleMenus.menuModePickAny(),
            m.roleMenus.editorPickAnyText(), () => setMode(RoleMenuMode.PickAny))}
          {@render choiceCard(draft.mode === RoleMenuMode.PickOne, "fa-circle-dot", m.roleMenus.menuModePickOne(),
            m.roleMenus.editorPickOneText(), () => setMode(RoleMenuMode.PickOne))}
        </div>

        {#if draft.mode === RoleMenuMode.PickAny}
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mt-6">
            <div>
              <span id="rm-min" class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">{m.roleMenus.editorMinRoles()}</span>
              <div class="min-h-[44px]">
                <DiscordSelector
                  type="custom"
                  options={minChoices}
                  selected={draft.minRoles.toString()}
                  placeholder={m.common.none()}
                  searchable={false}
                  ariaLabelledby="rm-min"
                  onchange={(detail) => { draft.minRoles = selectedNumber(detail.selected, 0); clampDraft(); }}
                />
              </div>
            </div>
            <div>
              <span id="rm-max" class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">{m.roleMenus.editorMaxRoles()}</span>
              <div class="min-h-[44px]">
                <DiscordSelector
                  type="custom"
                  options={maxChoices}
                  selected={draft.maxRoles.toString()}
                  placeholder={m.common.noLimit()}
                  searchable={false}
                  ariaLabelledby="rm-max"
                  onchange={(detail) => { draft.maxRoles = selectedNumber(detail.selected, 0); clampDraft(); }}
                />
              </div>
            </div>
          </div>
        {:else}
          <div class="mt-6">
            <ToggleRow
              checked={draft.minRoles >= 1}
              title={m.roleMenus.editorKeepOneTitle()}
              subtitle={m.roleMenus.editorKeepOneSubtitle()}
              colors={$colorStore}
              onchange={(checked) => { draft.minRoles = checked ? 1 : 0; draft.maxRoles = 1; }}
            />
          </div>
        {/if}
      </div>

      <div class="relative rounded-2xl border p-6 md:p-8 shadow-2xl"
           style="z-index: 30; background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15, {$colorStore.gradientEnd}10);
                  border-color: {$colorStore.primary}30;">
        {@render sectionHeading("fa-lock", m.roleMenus.editorSectionAccess())}
        <span id="rm-required" class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">{m.common.requiredRole()}</span>
        <div class="min-h-[44px]">
          <DiscordSelector
            type="role"
            options={allRoleOptions}
            selected={draft.requiredRoleId}
            placeholder={m.roleMenus.editorAnyone()}
            ariaLabelledby="rm-required"
            onchange={(detail) => {
              draft.requiredRoleId = typeof detail.selected === "string" && detail.selected ? detail.selected : null;
            }}
          />
        </div>
        <p class="text-xs mt-2" style="color: {$colorStore.muted}">
          {m.roleMenus.editorRequiredRoleHint()}
        </p>
      </div>

      <div class="relative rounded-2xl border p-6 md:p-8 shadow-2xl"
           style="z-index: 20; background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15, {$colorStore.gradientEnd}10);
                  border-color: {$colorStore.primary}30;">
        {@render sectionHeading("fa-bell", m.roleMenus.editorSectionConfirmation())}
        <ToggleRow
          checked={draft.replyMode === RoleMenuReplyMode.Private}
          title={m.roleMenus.editorConfirmTitle()}
          subtitle={m.roleMenus.editorConfirmSubtitle()}
          colors={$colorStore}
          onchange={(checked) => { draft.replyMode = checked ? RoleMenuReplyMode.Private : RoleMenuReplyMode.Silent; }}
        />
        {#if draft.replyMode !== RoleMenuReplyMode.Private}
          <p class="text-xs mt-2" style="color: {$colorStore.muted}">
            {m.roleMenus.editorConfirmSilentHint()}
          </p>
        {/if}
      </div>

      <div class="relative rounded-2xl border p-6 md:p-8 shadow-2xl"
           style="z-index: 10; background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15, {$colorStore.gradientEnd}10);
                  border-color: {$colorStore.primary}30;">
        <div class="flex items-center justify-between gap-3 mb-6">
          <div class="flex items-center gap-3">
            <i class="fa-utility-duo fa-regular fa-list-ol"
               style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary}; font-size: 20px;"></i>
            <h2 class="text-xl font-bold" style="color: {$colorStore.text}">{m.common.options()}</h2>
          </div>
          <span class="text-sm px-2 py-1 rounded-lg"
                style="background: {$colorStore.primary}20; color: {$colorStore.primary};">
            {draft.options.length} / {MAX_OPTIONS}
          </span>
        </div>

        <div class="space-y-3">
          {#each draft.options as option, index (option.key)}
            {#if draft.style === RoleMenuStyle.Buttons && index % BUTTONS_PER_ROW === 0}
              <div class="flex items-center gap-3 pt-2">
                <span class="text-xs font-medium uppercase tracking-wide" style="color: {$colorStore.muted}">
                  {m.common.rowNumber({ number: index / BUTTONS_PER_ROW + 1 })}
                </span>
                <span class="flex-1 h-px" style="background: {$colorStore.muted}30;"></span>
              </div>
            {/if}
            <div class="relative" style="z-index: {draft.options.length - index};">
              <RoleMenuOptionRow
                bind:option={draft.options[index]}
                {index}
                count={draft.options.length}
                style={draft.style}
                roleOptions={roleOptionsFor(index)}
                roles={lookups?.roles ?? []}
                {guildEmojis}
                onmoveup={() => moveOption(index, -1)}
                onmovedown={() => moveOption(index, 1)}
                onremove={() => removeOption(option.key)}
              />
            </div>
          {/each}
        </div>

        <div class="mt-4" title={draft.options.length >= MAX_OPTIONS ? m.roleMenus.editorMaxOptionsTitle({ max: MAX_OPTIONS }) : undefined}>
          <button
            type="button"
            class="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl transition-all hover:scale-[1.01] min-h-[44px] font-medium disabled:opacity-50 disabled:hover:scale-100 disabled:pointer-events-none"
            style="background: {$colorStore.primary}20; color: {$colorStore.primary}; border: 1px solid {$colorStore.primary}30;"
            onclick={addOption}
            disabled={draft.options.length >= MAX_OPTIONS}
          >
            <i class="fa-solid fa-plus" aria-hidden="true"></i>
            {m.common.addOption()}
          </button>
        </div>
      </div>

      <div class="space-y-2">
        <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <button
            type="button"
            class="flex items-center justify-center gap-3 px-6 py-3 rounded-xl transition-all hover:scale-[1.02] min-h-[44px] sm:min-h-[52px] font-medium disabled:opacity-50 disabled:hover:scale-100"
            style="background: {$colorStore.primary}20; color: {$colorStore.primary}; border: 1px solid {$colorStore.primary}30;"
            onclick={save}
            disabled={!!invalidReason || saving}
            aria-busy={saving}
          >
            <i class="fa-solid {saving ? 'fa-spinner fa-spin' : menu ? 'fa-floppy-disk' : 'fa-paper-plane'}" aria-hidden="true"></i>
            {menu ? m.common.saveChanges() : m.roleMenus.editorPost()}
          </button>
          <button
            type="button"
            class="flex items-center justify-center gap-2 px-6 py-3 rounded-xl transition-all hover:scale-[1.02] min-h-[44px] sm:min-h-[52px] font-medium"
            style="background: {$colorStore.muted}20; color: {$colorStore.muted}; border: 1px solid {$colorStore.muted}30;"
            onclick={oncancel}
            disabled={saving}
          >
            {m.common.cancel()}
          </button>
          {#if menu}
            <button
              type="button"
              class="flex items-center justify-center gap-2 px-6 py-3 rounded-xl transition-all hover:scale-[1.02] min-h-[44px] sm:min-h-[52px] font-medium sm:ml-auto"
              style="background: #ef444420; color: #ef4444; border: 1px solid #ef444430;"
              onclick={ondelete}
              disabled={saving}
            >
              <i class="fa-solid fa-trash" aria-hidden="true"></i>
              {m.common.deleteMenu()}
            </button>
          {/if}
        </div>
        {#if invalidReason}
          <p class="text-sm" style="color: {$colorStore.muted}">{invalidReason}</p>
        {/if}
      </div>
    </div>

    <div class="lg:col-span-2 lg:sticky lg:top-4">
      <div class="rounded-2xl border p-6 shadow-2xl"
           style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15, {$colorStore.gradientEnd}10);
                  border-color: {$colorStore.primary}30;">
        {@render sectionHeading("fa-eye", m.common.preview())}
        <RoleMenuPreview
          message={draft.message}
          name={draft.name}
          style={draft.style}
          placeholder={draft.placeholder}
          mode={draft.mode}
          options={previewOptions}
          paused={menu ? !menu.enabled : false}
          {user}
          guildId={$currentGuild?.id ?? null}
        />
      </div>
    </div>
  </div>
</div>
