<script lang="ts">
  import { m } from "$lib/i18n";
  import { untrack } from "svelte";
  import { colorStore } from "$lib/stores/colorStore";
  import { currentGuild } from "$lib/stores/currentGuild";
  import {
    roleMenusApi,
    RoleMenuButtonColor,
    RoleMenuMode,
    RoleMenuReplyMode,
    RoleMenuStyle,
    type RoleMenu,
    type RoleMenuGroup,
    type RoleMenuLookups,
    type RoleMenuRequest
  } from "$lib/api/index.ts";
  import type { GuildEmojiInfo } from "$lib/api/client/models";
  import type { DiscordUser } from "$lib/types/discord";
  import { logger } from "$lib/logger";
  import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";
  import SettingField from "$lib/components/forms/SettingField.svelte";
  import ToggleRow from "$lib/components/forms/ToggleRow.svelte";
  import PluginCard from "$lib/components/plugin/PluginCard.svelte";
  import FullscreenEmbedBuilder from "$lib/components/specialized/FullscreenEmbedBuilder.svelte";
  import Sheet from "$lib/components/ui/Sheet.svelte";
  import DurationField from "./DurationField.svelte";
  import RoleMenuOptionRow from "./RoleMenuOptionRow.svelte";
  import RoleMenuPreview from "./RoleMenuPreview.svelte";
  import {
    BUTTONS_PER_ROW,
    clampLimits,
    colorToHex,
    defaultPlaceholder,
    LABEL_LENGTH,
    localInputToUtc,
    MAX_OPTIONS,
    NAME_LENGTH,
    newOptionKey,
    parseMessageSource,
    PLACEHOLDER_LENGTH,
    serializeMessage,
    utcToLocalInput,
    type PreviewOption,
    type RoleMenuOptionDraft
  } from "../../roleMenuDefaults";

  /** Inputs for the menu editor. */
  interface Props {
    /** The menu being edited, or null for a new menu */
    menu: RoleMenu | null;
    /** Channels, roles, emojis, and limits from the bot */
    lookups: RoleMenuLookups | null;
    /** The signed in user, for previews */
    user?: DiscordUser | null;
    /** The server's menu groups */
    groups?: RoleMenuGroup[];
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
    groups = [],
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
    blockedRoleIds: string[];
    tempRoleSeconds: number;
    expiresAt: string;
    groupId: string | null;
    newGroupName: string;
    accentColor: string | null;
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
      tempRoleSeconds: 0,
      maxHolders: 0,
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
        blockedRoleIds: [],
        tempRoleSeconds: 0,
        expiresAt: "",
        groupId: null,
        newGroupName: "",
        accentColor: null,
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
      blockedRoleIds: (source.blockedRoleIds ?? []).map((id) => id.toString()),
      tempRoleSeconds: source.tempRoleSeconds ?? 0,
      expiresAt: utcToLocalInput(source.expiresAt),
      groupId: source.groupId ? source.groupId.toString() : null,
      newGroupName: "",
      accentColor: source.accentColor == null ? null : colorToHex(source.accentColor),
      replyMode: source.replyMode,
      options: source.options.map((o) => ({
        key: newOptionKey(),
        id: o.id,
        roleId: o.roleId.toString(),
        label: o.label ?? "",
        emoji: o.emoji ?? null,
        description: o.description ?? "",
        buttonStyle: o.buttonStyle || RoleMenuButtonColor.Grey,
        tempRoleSeconds: o.tempRoleSeconds ?? 0,
        maxHolders: o.maxHolders ?? 0,
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
      blockedRoleIds: value.blockedRoleIds,
      tempRoleSeconds: value.tempRoleSeconds,
      expiresAt: value.expiresAt,
      groupId: value.groupId,
      newGroupName: value.newGroupName,
      accentColor: value.accentColor,
      replyMode: value.replyMode,
      options: value.options.map((o) => [
        o.id, o.roleId, o.label, o.emoji, o.description, o.buttonStyle, o.tempRoleSeconds, o.maxHolders
      ])
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
    if (draft.expiresAt && new Date(draft.expiresAt).getTime() <= Date.now()) return m.roleMenus.editorInvalidExpiry();
    return null;
  });

  /** Groups as selector choices. */
  let groupChoices = $derived(groups.map((g) => ({ id: g.id.toString(), name: g.name })));

  /** The hint line under the mode buttons. */
  let modeHint = $derived.by(() => {
    switch (draft.mode) {
      case RoleMenuMode.PickOne: return m.roleMenus.editorPickOneText();
      case RoleMenuMode.AddOnly: return m.roleMenus.editorAddOnlyText();
      case RoleMenuMode.RemoveOnly: return m.roleMenus.editorRemoveOnlyText();
      case RoleMenuMode.Reverse: return m.roleMenus.editorReverseText();
      default: return m.roleMenus.editorPickAnyText();
    }
  });

  /** Holder counts by option ID, from the saved menu. */
  let holdersById = $derived(new Map((menu?.options ?? []).map((o) => [o.id, o.holders ?? 0])));

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

  const inputStyle = $derived(
    `background: ${$colorStore.primary}10; border-color: ${$colorStore.primary}30; color: ${$colorStore.text};`
  );
  const ghostStyle = $derived(
    `background: ${$colorStore.primary}10; color: ${$colorStore.text}; border: 1px solid ${$colorStore.primary}20;`
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
    if (mode !== RoleMenuMode.PickOne && wasPickOne) draft.maxRoles = 0;
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

  /**
   * Finds the group to link, creating it when a new name was typed.
   * @param guildId The server ID
   * @returns The group ID, or null for none
   */
  async function resolveGroupId(guildId: bigint): Promise<number | null> {
    const name = draft.newGroupName.trim();
    if (!name) return draft.groupId ? parseInt(draft.groupId) : null;
    const existing = groups.find((g) => g.name.toLowerCase() === name.toLowerCase());
    if (existing) return existing.id;
    return (await roleMenusApi.createGroup(guildId, { name, maxRoles: 1 })).id;
  }

  /**
   * Builds the full request the bot expects.
   * @param groupId The group to link, or null for none
   */
  function buildRequest(groupId: number | null): RoleMenuRequest {
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
      blockedRoleIds: draft.blockedRoleIds.map((id) => BigInt(id)),
      tempRoleSeconds: draft.tempRoleSeconds,
      expiresAt: localInputToUtc(draft.expiresAt),
      groupId,
      accentColor: draft.accentColor ? parseInt(draft.accentColor.slice(1), 16) : null,
      replyMode: draft.replyMode,
      enabled: menu?.enabled ?? true,
      options: draft.options.map((o) => ({
        id: o.id,
        roleId: BigInt(o.roleId ?? "0"),
        label: o.label.trim(),
        emoji: o.emoji?.trim() || null,
        description: o.description.trim() || null,
        buttonStyle: o.buttonStyle,
        tempRoleSeconds: o.tempRoleSeconds,
        maxHolders: o.maxHolders
      }))
    };
  }

  /** Posts a new menu or saves changes to this one. */
  async function save() {
    if (!$currentGuild?.id || invalidReason || saving) return;
    saving = true;
    try {
      const request = buildRequest(await resolveGroupId($currentGuild.id));
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

{#snippet choice(pressed: boolean, icon: string, title: string, onclick: () => void)}
  <button
    type="button"
    class="w-full flex items-center justify-center gap-2 px-3 rounded-lg border min-h-[50px] text-sm font-medium"
    style="background: {pressed ? $colorStore.selectedSurface : `${$colorStore.primary}08`};
           border-color: {pressed ? $colorStore.selectedBorder : `${$colorStore.primary}20`};
           color: {$colorStore.text};"
    aria-pressed={pressed}
    {onclick}
  >
    <i class="fa-solid {icon}" aria-hidden="true"></i>
    {title}
  </button>
{/snippet}

{#snippet footer()}
  {#if invalidReason}
    <p class="grow basis-full sm:basis-0 text-sm" style="color: {$colorStore.muted}" role="status">{invalidReason}</p>
  {/if}
  {#if menu}
    <button
      type="button"
      class="flex items-center justify-center gap-2 px-5 rounded-xl min-h-[44px] font-medium sm:mr-auto disabled:opacity-50"
      style="background: #ef444420; color: #ef4444; border: 1px solid #ef444430;"
      onclick={ondelete}
      disabled={saving}
    >
      <i class="fa-solid fa-trash" aria-hidden="true"></i>
      {m.common.deleteMenu()}
    </button>
  {/if}
  <button type="button" class="px-5 rounded-xl min-h-[44px] font-medium" style={ghostStyle} onclick={oncancel} disabled={saving}>
    {m.common.cancel()}
  </button>
  <button
    type="button"
    class="flex items-center justify-center gap-2 px-5 rounded-xl min-h-[44px] font-medium disabled:opacity-50"
    style="background: {$colorStore.primary}; color: {$colorStore.onPrimary};"
    onclick={save}
    disabled={!!invalidReason || saving}
    aria-busy={saving}
  >
    <i class="fa-solid {saving ? 'fa-spinner fa-spin' : menu ? 'fa-floppy-disk' : 'fa-paper-plane'}" aria-hidden="true"></i>
    {menu ? m.common.saveChanges() : m.roleMenus.editorPost()}
  </button>
{/snippet}

<Sheet title={menu ? m.common.editName({ name: menu.name }) : m.roleMenus.actionNewMenu()} onclose={oncancel} size="xl" {footer}>
  <div class="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,24rem)] gap-4">
  <div class="min-w-0 space-y-4">
  <PluginCard title={m.common.basics()} alwaysOpen>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <SettingField label={m.common.name()} id="rm-name">
        <input
          id="rm-name"
          type="text"
          bind:value={draft.name}
          maxlength={NAME_LENGTH}
          class="w-full p-3 rounded-lg border focus:ring-2 min-h-[50px]"
          style={inputStyle}
        >
      </SettingField>
      <SettingField label={m.common.channel()} id="rm-channel">
        <DiscordSelector
          id="rm-channel"
          type="channel"
          options={channelOptions}
          selected={draft.channelId}
          placeholder={m.common.pickChannelPlaceholder()}
          onchange={(detail) => {
            draft.channelId = typeof detail.selected === "string" && detail.selected ? detail.selected : null;
          }}
        />
      </SettingField>
    </div>
    {#if channelBlocked}
      <p class="p-3 rounded-lg text-sm" style="background: {$colorStore.accent}20; color: {$colorStore.text};" role="alert">
        {m.roleMenus.editorChannelBlocked()}
      </p>
    {/if}
  </PluginCard>

  <PluginCard title={m.common.message()} alwaysOpen>
    <FullscreenEmbedBuilder
      id="rolemenu-message"
      bind:value={draft.message}
      previewTitle={m.roleMenus.editorMessagePreviewTitle()}
      previewDescription={m.roleMenus.editorMessagePreviewDescription()}
      icon="fa-list-ul"
      allowContent={true}
      allowMultipleEmbeds={true}
      maxEmbeds={10}
      allowComponents={false}
      guildId={$currentGuild?.id}
      {user}
      placeholder={m.roleMenus.editorMessagePlaceholder()}
    />
  </PluginCard>

  <div class="grid grid-cols-1 xl:grid-cols-2 gap-4 items-start">
  <PluginCard title={m.roleMenus.importMenuType()} alwaysOpen>
    <div class="grid grid-cols-2 gap-2" role="group" aria-label={m.roleMenus.importMenuType()}>
      {@render choice(draft.style === RoleMenuStyle.Dropdown, "fa-square-caret-down", m.common.dropdown(),
        () => { draft.style = RoleMenuStyle.Dropdown; })}
      {@render choice(draft.style === RoleMenuStyle.Buttons, "fa-grip", m.common.buttons(),
        () => { draft.style = RoleMenuStyle.Buttons; })}
    </div>
    {#if draft.style === RoleMenuStyle.Dropdown}
      <SettingField label={m.roleMenus.editorHintTextLabel()} id="rm-placeholder">
        <input
          id="rm-placeholder"
          type="text"
          bind:value={draft.placeholder}
          maxlength={PLACEHOLDER_LENGTH}
          placeholder={defaultPlaceholder(draft.mode)}
          class="w-full p-3 rounded-lg border focus:ring-2 min-h-[50px]"
          style={inputStyle}
        >
      </SettingField>
    {/if}
  </PluginCard>

  <PluginCard title={m.roleMenus.editorSectionPicking()} alwaysOpen>
    <div class="grid grid-cols-2 sm:grid-cols-3 gap-2" role="group" aria-label={m.roleMenus.editorSectionPicking()}>
      {@render choice(draft.mode === RoleMenuMode.PickAny, "fa-list-check", m.roleMenus.menuModePickAny(),
        () => setMode(RoleMenuMode.PickAny))}
      {@render choice(draft.mode === RoleMenuMode.PickOne, "fa-circle-dot", m.roleMenus.menuModePickOne(),
        () => setMode(RoleMenuMode.PickOne))}
      {@render choice(draft.mode === RoleMenuMode.AddOnly, "fa-circle-plus", m.roleMenus.menuModeAddOnly(),
        () => setMode(RoleMenuMode.AddOnly))}
      {@render choice(draft.mode === RoleMenuMode.RemoveOnly, "fa-circle-minus", m.roleMenus.menuModeRemoveOnly(),
        () => setMode(RoleMenuMode.RemoveOnly))}
      {@render choice(draft.mode === RoleMenuMode.Reverse, "fa-rotate-left", m.roleMenus.menuModeReverse(),
        () => setMode(RoleMenuMode.Reverse))}
    </div>
    <p class="text-sm" style="color: {$colorStore.muted}">{modeHint}</p>
    {#if draft.mode === RoleMenuMode.PickAny}
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SettingField label={m.roleMenus.editorMinRoles()} id="rm-min">
          <DiscordSelector
            id="rm-min"
            type="custom"
            customIcon="fa-gauge"
            options={minChoices}
            selected={draft.minRoles.toString()}
            placeholder={m.common.none()}
            searchable={false}
            clearable={false}
            onchange={(detail) => { draft.minRoles = selectedNumber(detail.selected, 0); clampDraft(); }}
          />
        </SettingField>
        <SettingField label={m.roleMenus.editorMaxRoles()} id="rm-max">
          <DiscordSelector
            id="rm-max"
            type="custom"
            customIcon="fa-gauge"
            options={maxChoices}
            selected={draft.maxRoles.toString()}
            placeholder={m.common.noLimit()}
            searchable={false}
            clearable={false}
            onchange={(detail) => { draft.maxRoles = selectedNumber(detail.selected, 0); clampDraft(); }}
          />
        </SettingField>
      </div>
    {:else if draft.mode === RoleMenuMode.PickOne}
      <ToggleRow
        checked={draft.minRoles >= 1}
        title={m.roleMenus.editorKeepOneTitle()}
        subtitle={m.roleMenus.editorKeepOneSubtitle()}
        colors={$colorStore}
        onchange={(checked) => { draft.minRoles = checked ? 1 : 0; draft.maxRoles = 1; }}
      />
    {/if}
  </PluginCard>
  </div>

  <PluginCard title={m.roleMenus.editorSectionAccess()} alwaysOpen>
    <SettingField label={m.common.requiredRole()} id="rm-required">
      <DiscordSelector
        id="rm-required"
        type="role"
        options={allRoleOptions}
        selected={draft.requiredRoleId}
        placeholder={m.roleMenus.editorAnyone()}
        onchange={(detail) => {
          draft.requiredRoleId = typeof detail.selected === "string" && detail.selected ? detail.selected : null;
        }}
      />
    </SettingField>
    <SettingField label={m.roleMenus.editorBlockedRoles()} hint={m.roleMenus.editorBlockedHint()} id="rm-blocked">
      <DiscordSelector
        id="rm-blocked"
        type="role"
        multiple
        options={allRoleOptions}
        selected={draft.blockedRoleIds}
        placeholder={m.common.addARole()}
        onchange={(detail) => {
          draft.blockedRoleIds = Array.isArray(detail.selected) ? detail.selected : [];
        }}
      />
    </SettingField>
    <ToggleRow
      checked={draft.replyMode === RoleMenuReplyMode.Private}
      title={m.roleMenus.editorConfirmTitle()}
      subtitle={m.roleMenus.editorConfirmSubtitle()}
      colors={$colorStore}
      onchange={(checked) => { draft.replyMode = checked ? RoleMenuReplyMode.Private : RoleMenuReplyMode.Silent; }}
    />
  </PluginCard>

  <PluginCard title={m.roleMenus.editorSectionTiming()} alwaysOpen>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <SettingField label={m.roleMenus.editorTempRoles()} hint={m.roleMenus.editorTempHint()} id="rm-temp">
        <DurationField id="rm-temp" bind:seconds={draft.tempRoleSeconds} />
      </SettingField>
      <SettingField label={m.roleMenus.editorExpires()} hint={m.roleMenus.editorExpiresHint()} id="rm-expires">
        <div class="flex gap-2">
          <input
            id="rm-expires"
            type="datetime-local"
            bind:value={draft.expiresAt}
            class="w-full min-w-0 p-3 rounded-lg border focus:ring-2 min-h-[50px]"
            style={inputStyle}
          >
          {#if draft.expiresAt}
            <button
              type="button"
              class="flex items-center justify-center rounded-lg min-h-[50px] min-w-[50px] shrink-0"
              style={ghostStyle}
              onclick={() => { draft.expiresAt = ""; }}
              aria-label={m.common.clear()}
            >
              <i class="fa-solid fa-xmark" aria-hidden="true"></i>
            </button>
          {/if}
        </div>
      </SettingField>
      <div class="relative z-20">
        <SettingField label={m.roleMenus.editorGroup()} id="rm-group">
          <DiscordSelector
            id="rm-group"
            type="custom"
            customIcon="fa-layer-group"
            options={groupChoices}
            selected={draft.groupId}
            placeholder={m.roleMenus.editorGroupNone()}
            disabled={!!draft.newGroupName.trim()}
            onchange={(detail) => {
              draft.groupId = typeof detail.selected === "string" && detail.selected ? detail.selected : null;
            }}
          />
        </SettingField>
      </div>
      <SettingField label={m.roleMenus.editorGroupName()} id="rm-group-name">
        <input
          id="rm-group-name"
          type="text"
          bind:value={draft.newGroupName}
          maxlength={NAME_LENGTH}
          placeholder={m.roleMenus.editorGroupNamePlaceholder()}
          class="w-full p-3 rounded-lg border focus:ring-2 min-h-[50px]"
          style={inputStyle}
        >
      </SettingField>
      <SettingField label={m.roleMenus.editorAccent()} id="rm-accent">
        <div class="flex gap-2">
          <input
            id="rm-accent"
            type="color"
            value={draft.accentColor ?? "#5865f2"}
            oninput={(e) => { draft.accentColor = e.currentTarget.value; }}
            class="w-full min-w-0 p-1 rounded-lg border min-h-[50px] cursor-pointer"
            style={inputStyle}
          >
          {#if draft.accentColor}
            <button
              type="button"
              class="flex items-center justify-center rounded-lg min-h-[50px] min-w-[50px] shrink-0"
              style={ghostStyle}
              onclick={() => { draft.accentColor = null; }}
              aria-label={m.common.clear()}
            >
              <i class="fa-solid fa-xmark" aria-hidden="true"></i>
            </button>
          {/if}
        </div>
      </SettingField>
    </div>
  </PluginCard>

  <PluginCard title={m.common.options()} alwaysOpen>
    <div class="space-y-3">
      {#each draft.options as option, index (option.key)}
        {#if draft.style === RoleMenuStyle.Buttons && index % BUTTONS_PER_ROW === 0}
          <div class="flex items-center gap-3 pt-2">
            <span class="text-xs font-medium" style="color: {$colorStore.muted}">
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
            holders={option.id ? holdersById.get(option.id) ?? 0 : 0}
            onmoveup={() => moveOption(index, -1)}
            onmovedown={() => moveOption(index, 1)}
            onremove={() => removeOption(option.key)}
          />
        </div>
      {/each}
    </div>

    <button
      type="button"
      class="w-full flex items-center justify-center gap-2 px-5 rounded-xl min-h-[50px] font-medium disabled:opacity-50"
      style={ghostStyle}
      onclick={addOption}
      disabled={draft.options.length >= MAX_OPTIONS}
      title={draft.options.length >= MAX_OPTIONS ? m.roleMenus.editorMaxOptionsTitle({ max: MAX_OPTIONS }) : undefined}
    >
      <i class="fa-solid fa-plus" aria-hidden="true"></i>
      {m.common.addOption()}
      <span class="text-xs" style="color: {$colorStore.muted}">{draft.options.length} / {MAX_OPTIONS}</span>
    </button>
  </PluginCard>
  </div>

  <div class="min-w-0 lg:sticky lg:top-6 self-start">
  <PluginCard title={m.common.preview()} alwaysOpen>
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
  </PluginCard>
  </div>
  </div>
</Sheet>
