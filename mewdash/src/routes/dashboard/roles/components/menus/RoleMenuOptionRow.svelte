<script lang="ts">
  import { m } from "$lib/i18n";
  import { colorStore } from "$lib/stores/colorStore";
  import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";
  import EmojiPicker from "$lib/components/forms/EmojiPicker.svelte";
  import SettingField from "$lib/components/forms/SettingField.svelte";
  import type { GuildEmojiInfo } from "$lib/api/client/models";
  import { RoleMenuButtonColor, RoleMenuStyle, type RoleMenuLookupRole } from "$lib/api/rolemenus/models";
  import {
    buttonColorOptions,
    DESCRIPTION_LENGTH,
    LABEL_LENGTH,
    type RoleMenuOptionDraft
  } from "../../roleMenuDefaults";
  import DurationField from "./DurationField.svelte";

  /** Inputs for one editable option on a menu. */
  interface Props {
    /** The option being edited */
    option: RoleMenuOptionDraft;
    /** 0-based position in the list */
    index: number;
    /** Number of options on the menu */
    count: number;
    /** Dropdown or buttons */
    style: number;
    /** Roles this row may pick, already filtered to assignable roles not used elsewhere */
    roleOptions: Array<{ id: string; name: string; color: number }>;
    /** Every lookup role, used for names and problems */
    roles: RoleMenuLookupRole[];
    /** Emojis for the picker */
    guildEmojis: GuildEmojiInfo[];
    /** How many members hold the option's role now */
    holders?: number;
    /** Moves the option one place up */
    onmoveup: () => void;
    /** Moves the option one place down */
    onmovedown: () => void;
    /** Removes the option */
    onremove: () => void;
  }

  let {
    option = $bindable(),
    index,
    count,
    style,
    roleOptions,
    roles,
    guildEmojis,
    holders = 0,
    onmoveup,
    onmovedown,
    onremove
  }: Props = $props();

  /** The lookup entry for the picked role, if it still exists. */
  let role = $derived(option.roleId ? roles.find((r) => r.id.toString() === option.roleId) ?? null : null);

  /** Name used in labels and placeholders. */
  let displayName = $derived(option.label.trim() || role?.name || m.roleMenus.optionFallbackName({ number: index + 1 }));

  /** Why the bot can't give out this option's role, or null. */
  let problem = $derived.by(() => {
    if (option.problem) return option.problem;
    if (!option.roleId || roles.length === 0) return null;
    if (!role) return m.roleMenus.optionRoleDeleted();
    return role.assignable ? null : role.problem ?? null;
  });

  const inputStyle = $derived(
    `background: ${$colorStore.primary}10; border-color: ${$colorStore.primary}30; color: ${$colorStore.text};`
  );
  const ghostStyle = $derived(
    `background: ${$colorStore.primary}10; color: ${$colorStore.text}; border: 1px solid ${$colorStore.primary}20;`
  );

  /**
   * Applies a role pick, filling an empty label with the role name.
   * @param selected The selector value
   */
  function pickRole(selected: string | string[] | null) {
    const roleId = typeof selected === "string" && selected ? selected : null;
    if (roleId === option.roleId) return;
    option.roleId = roleId;
    option.problem = null;
    if (roleId && !option.label.trim()) {
      const picked = roles.find((r) => r.id.toString() === roleId);
      if (picked) option.label = picked.name;
    }
  }
</script>

<div class="rounded-xl border p-3 space-y-3"
     style="background: {$colorStore.surface}; border-color: {problem ? '#ef444440' : `${$colorStore.primary}20`};">
  <div class="flex items-center gap-2">
    <span class="flex items-center justify-center w-8 h-8 rounded-lg text-sm font-bold shrink-0"
          style="background: {$colorStore.primary}15; color: {$colorStore.text};">
      {index + 1}
    </span>
    <span class="flex-1 min-w-0 truncate text-sm font-medium" style="color: {$colorStore.text}">
      {option.label.trim() || role?.name || m.common.newOption()}
    </span>
    <button
      type="button"
      class="flex items-center justify-center rounded-lg min-h-[44px] min-w-[44px] disabled:opacity-40"
      style={ghostStyle}
      onclick={onmoveup}
      disabled={index === 0}
      aria-label={m.common.ariaMoveNamedUp({ name: displayName })}
    >
      <i class="fa-solid fa-arrow-up" aria-hidden="true"></i>
    </button>
    <button
      type="button"
      class="flex items-center justify-center rounded-lg min-h-[44px] min-w-[44px] disabled:opacity-40"
      style={ghostStyle}
      onclick={onmovedown}
      disabled={index === count - 1}
      aria-label={m.common.ariaMoveNamedDown({ name: displayName })}
    >
      <i class="fa-solid fa-arrow-down" aria-hidden="true"></i>
    </button>
    <button
      type="button"
      class="flex items-center justify-center rounded-lg min-h-[44px] min-w-[44px]"
      style="background: #ef444420; color: #ef4444; border: 1px solid #ef444430;"
      onclick={onremove}
      aria-label={m.common.ariaRemoveNamed({ name: displayName })}
    >
      <i class="fa-solid fa-trash" aria-hidden="true"></i>
    </button>
  </div>

  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
    <div class="relative z-20">
      <SettingField label={m.common.role()} id="rm-{option.key}-role">
        <DiscordSelector
          id="rm-{option.key}-role"
          type="role"
          options={roleOptions}
          selected={option.roleId}
          placeholder={m.common.pickRolePlaceholder()}
          onchange={(detail) => pickRole(detail.selected)}
        />
      </SettingField>
    </div>

    <SettingField label={m.roleMenus.optionLabel()} id="rm-{option.key}-label">
      <input
        id="rm-{option.key}-label"
        type="text"
        bind:value={option.label}
        maxlength={LABEL_LENGTH}
        placeholder={role?.name ?? ""}
        class="w-full p-3 rounded-lg border focus:ring-2 min-h-[50px]"
        style={inputStyle}
      >
    </SettingField>

    <div class="relative z-10">
      <SettingField label={m.common.emoji()} id="rm-{option.key}-emoji">
        <EmojiPicker
          id="rm-{option.key}-emoji"
          {guildEmojis}
          selected={option.emoji}
          multiple={false}
          groupByGuild={false}
          showUnicodeEmojis={true}
          placeholder={m.roleMenus.optionNoEmoji()}
          onchange={(detail) => {
            option.emoji = typeof detail.selected === "string" && detail.selected ? detail.selected : null;
          }}
        />
      </SettingField>
    </div>

    <SettingField label={m.common.description()} id="rm-{option.key}-description">
      <input
        id="rm-{option.key}-description"
        type="text"
        bind:value={option.description}
        maxlength={DESCRIPTION_LENGTH}
        placeholder={m.common.optional()}
        class="w-full p-3 rounded-lg border focus:ring-2 min-h-[50px]"
        style={inputStyle}
      >
    </SettingField>

    {#if style === RoleMenuStyle.Buttons}
      <div class="relative z-[5]">
        <SettingField label={m.roleMenus.optionButtonColor()} id="rm-{option.key}-color">
          <DiscordSelector
            id="rm-{option.key}-color"
            type="custom"
            customIcon="fa-palette"
            options={buttonColorOptions()}
            selected={option.buttonStyle.toString()}
            placeholder={m.common.colorGrey()}
            searchable={false}
            clearable={false}
            onchange={(detail) => {
              option.buttonStyle = typeof detail.selected === "string" && detail.selected
                ? parseInt(detail.selected)
                : RoleMenuButtonColor.Grey;
            }}
          />
        </SettingField>
      </div>
    {/if}

    <div class="relative z-[4]">
      <SettingField label={m.roleMenus.optionTemp()} hint={m.roleMenus.optionTempHint()} id="rm-{option.key}-temp">
        <DurationField id="rm-{option.key}-temp" bind:seconds={option.tempRoleSeconds} />
      </SettingField>
    </div>

    <SettingField
      label={m.roleMenus.optionCap()}
      hint={option.id && role ? m.roleMenus.optionCapHolders({ count: holders }) : undefined}
      id="rm-{option.key}-cap"
    >
      <input
        id="rm-{option.key}-cap"
        type="number"
        min="0"
        inputmode="numeric"
        value={option.maxHolders || ""}
        oninput={(e) => { option.maxHolders = Math.max(parseInt(e.currentTarget.value) || 0, 0); }}
        placeholder={m.common.noLimit()}
        class="w-full p-3 rounded-lg border focus:ring-2 min-h-[50px]"
        style={inputStyle}
      >
    </SettingField>
  </div>

  {#if problem}
    <div class="flex items-center gap-2 p-3 rounded-lg text-sm" style="background: #ef444420; color: #ef4444;" role="alert">
      <i class="fa-solid fa-circle-exclamation shrink-0" aria-hidden="true"></i>
      <span>{problem}</span>
    </div>
  {/if}
</div>
