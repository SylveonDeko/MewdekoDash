<script lang="ts">
  import { colorStore } from "$lib/stores/colorStore";
  import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";
  import EmojiPicker from "$lib/components/forms/EmojiPicker.svelte";
  import type { GuildEmojiInfo } from "$lib/api/client/models";
  import { RoleMenuButtonColor, RoleMenuStyle, type RoleMenuLookupRole } from "$lib/api/rolemenus/models";
  import {
    BUTTON_COLOR_OPTIONS,
    DESCRIPTION_LENGTH,
    LABEL_LENGTH,
    type RoleMenuOptionDraft
  } from "../roleMenuDefaults";

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
    onmoveup,
    onmovedown,
    onremove
  }: Props = $props();

  /** The lookup entry for the picked role, if it still exists. */
  let role = $derived(option.roleId ? roles.find((r) => r.id.toString() === option.roleId) ?? null : null);

  /** Name used in labels and placeholders. */
  let displayName = $derived(option.label.trim() || role?.name || `option ${index + 1}`);

  /** Why the bot can't give out this option's role, or null. */
  let problem = $derived.by(() => {
    if (option.problem) return option.problem;
    if (!option.roleId || roles.length === 0) return null;
    if (!role) return "This role was deleted";
    return role.assignable ? null : role.problem ?? null;
  });

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

<div class="rounded-xl p-4 space-y-4"
     style="background: {$colorStore.primary}08; border: 1px solid {problem ? '#ef444440' : $colorStore.primary + '20'};">
  <div class="flex items-center gap-3">
    <span class="flex items-center justify-center w-8 h-8 rounded-lg text-sm font-bold shrink-0"
          style="background: {$colorStore.primary}20; color: {$colorStore.primary};">
      {index + 1}
    </span>
    <span class="flex-1 min-w-0 truncate font-medium" style="color: {$colorStore.text}">
      {option.label.trim() || role?.name || "New option"}
    </span>
    <button
      type="button"
      class="flex items-center justify-center rounded-lg min-h-[44px] min-w-[44px] transition-all hover:scale-[1.05] disabled:opacity-40 disabled:hover:scale-100"
      style="background: {$colorStore.primary}20; color: {$colorStore.primary}; border: 1px solid {$colorStore.primary}30;"
      onclick={onmoveup}
      disabled={index === 0}
      aria-label="Move {displayName} up"
    >
      <i class="fa-solid fa-arrow-up" aria-hidden="true"></i>
    </button>
    <button
      type="button"
      class="flex items-center justify-center rounded-lg min-h-[44px] min-w-[44px] transition-all hover:scale-[1.05] disabled:opacity-40 disabled:hover:scale-100"
      style="background: {$colorStore.primary}20; color: {$colorStore.primary}; border: 1px solid {$colorStore.primary}30;"
      onclick={onmovedown}
      disabled={index === count - 1}
      aria-label="Move {displayName} down"
    >
      <i class="fa-solid fa-arrow-down" aria-hidden="true"></i>
    </button>
    <button
      type="button"
      class="flex items-center justify-center rounded-lg min-h-[44px] min-w-[44px] transition-all hover:scale-[1.05]"
      style="background: #ef444420; color: #ef4444; border: 1px solid #ef444430;"
      onclick={onremove}
      aria-label="Remove {displayName}"
    >
      <i class="fa-solid fa-trash" aria-hidden="true"></i>
    </button>
  </div>

  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
    <div class="relative z-20">
      <span id="rm-{option.key}-role" class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">Role</span>
      <div class="min-h-[44px]">
        <DiscordSelector
          type="role"
          options={roleOptions}
          selected={option.roleId}
          placeholder="Pick a role"
          ariaLabelledby="rm-{option.key}-role"
          onchange={(detail) => pickRole(detail.selected)}
        />
      </div>
    </div>

    <div>
      <label for="rm-{option.key}-label" class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">
        Name on the menu
      </label>
      <input id="rm-{option.key}-label"
             type="text"
             bind:value={option.label}
             maxlength={LABEL_LENGTH}
             placeholder={role?.name ?? ""}
             class="w-full p-3 rounded-xl border transition-all min-h-[44px] text-base"
             style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
      >
    </div>

    <div class="relative z-10">
      <span id="rm-{option.key}-emoji" class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">Emoji</span>
      <EmojiPicker
        {guildEmojis}
        selected={option.emoji}
        multiple={false}
        groupByGuild={false}
        showUnicodeEmojis={true}
        placeholder="No emoji"
        ariaLabelledby="rm-{option.key}-emoji"
        onchange={(detail) => {
          option.emoji = typeof detail.selected === "string" && detail.selected ? detail.selected : null;
        }}
      />
    </div>

    <div>
      <label for="rm-{option.key}-description" class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">
        Description
      </label>
      <input id="rm-{option.key}-description"
             type="text"
             bind:value={option.description}
             maxlength={DESCRIPTION_LENGTH}
             placeholder="Optional"
             class="w-full p-3 rounded-xl border transition-all min-h-[44px] text-base"
             style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
      >
      <p class="text-xs mt-2" style="color: {$colorStore.muted}">
        {style === RoleMenuStyle.Buttons ? "Shown in the default message" : "Shown under the dropdown option"}
      </p>
    </div>

    {#if style === RoleMenuStyle.Buttons}
      <div class="relative z-[5]">
        <span id="rm-{option.key}-color" class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">Button color</span>
        <div class="min-h-[44px]">
          <DiscordSelector
            type="custom"
            options={BUTTON_COLOR_OPTIONS}
            selected={option.buttonStyle.toString()}
            placeholder="Grey"
            searchable={false}
            ariaLabelledby="rm-{option.key}-color"
            onchange={(detail) => {
              option.buttonStyle = typeof detail.selected === "string" && detail.selected
                ? parseInt(detail.selected)
                : RoleMenuButtonColor.Grey;
            }}
          />
        </div>
      </div>
    {/if}
  </div>

  {#if problem}
    <div class="flex items-center gap-2 p-3 rounded-lg text-sm"
         style="background: #ef444420; color: #ef4444;">
      <i class="fa-solid fa-circle-exclamation" aria-hidden="true"></i>
      <span>{problem}</span>
    </div>
  {/if}
</div>
