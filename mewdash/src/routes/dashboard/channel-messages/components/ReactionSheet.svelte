<script lang="ts">
  import { m } from "$lib/i18n";
  import { untrack } from "svelte";
  import { colorStore } from "$lib/stores/colorStore";
  import type { AutoReaction, AutoReactionMessageType } from "$lib/api/channelmessages/channelmessages";
  import type { GuildEmojiInfo } from "$lib/api/client/models";
  import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";
  import EmojiPicker from "$lib/components/forms/EmojiPicker.svelte";
  import SettingField from "$lib/components/forms/SettingField.svelte";
  import ToggleRow from "$lib/components/forms/ToggleRow.svelte";
  import SaveStatus from "$lib/components/ui/SaveStatus.svelte";
  import type { AutoSave } from "$lib/utils/autoSave.svelte";
  import Sheet from "$lib/components/ui/Sheet.svelte";
  import WordsField from "./WordsField.svelte";
  import { emojiLabel, idString, type Named } from "./model";

  interface Props {
    rule: AutoReaction | null;
    channelOptions: Array<{ id: string; name: string; label?: string }>;
    roles: Named[];
    members: Named[];
    emojis: GuildEmojiInfo[];
    limits: { maxEmojis: number; maxWords: number; maxWordLength: number };
    autoSave: AutoSave;
    creating: boolean;
    problem: string | null;
    onchange: (rule: AutoReaction, typing: boolean) => void;
    oncreate: (rule: AutoReaction) => void;
    onclose: () => void;
  }

  let { rule: source, channelOptions, roles, members, emojis, limits, autoSave, creating, problem, onchange, oncreate, onclose }: Props =
    $props();

  const rule = untrack(() => source);

  const isNew = rule === null;

  let draft: AutoReaction = $state(
    rule ?? {
      id: 0,
      channelId: "",
      emojis: [],
      messageTypes: "Any",
      ignoreBots: true,
      ignoreWebhooks: false,
      ignoreReplies: false,
      allowedRoleIds: [],
      ignoredRoleIds: [],
      ignoredUserIds: [],
      skipWords: [],
      requiredWords: [],
      priority: 0,
      deleteNonMatching: false,
      enabled: true
    }
  );
  let attempted = $state(false);
  let pickerKey = $state(0);

  const channelId = $derived(idString(draft.channelId));
  const channelName = $derived(channelOptions.find(channel => channel.id === channelId)?.name ?? channelId);
  const missing = $derived(!channelId ? m.common.noChannelSelected() : draft.emojis.length === 0 ? m.channelMessages.problemEmoji() : null);

  const typeOptions = $derived(
    (
      [
        ["Any", m.channelMessages.typeAny()],
        ["Text", m.channelMessages.typeText()],
        ["Images", m.channelMessages.typeImages()],
        ["Videos", m.channelMessages.typeVideos()],
        ["Media", m.channelMessages.typeMedia()],
        ["Links", m.channelMessages.typeLinks()]
      ] as const
    ).map(([id, name]) => ({ id, name }))
  );

  function set(patch: Partial<AutoReaction>, typing = false) {
    draft = { ...draft, ...patch };
    if (!isNew && draft.emojis.length > 0) onchange($state.snapshot(draft), typing);
  }

  function list(selected: string | string[] | null): string[] {
    return Array.isArray(selected) ? selected : [];
  }

  function addEmoji(selected: string | string[] | null) {
    const emoji = Array.isArray(selected) ? selected[0] : selected;
    if (emoji && !draft.emojis.includes(emoji) && draft.emojis.length < limits.maxEmojis) set({ emojis: [...draft.emojis, emoji] });
    pickerKey++;
  }

  function create() {
    attempted = true;
    if (missing || creating) return;
    oncreate($state.snapshot(draft));
  }
</script>

{#snippet actions()}
  {#if !isNew}
    <SaveStatus {autoSave} />
  {/if}
  <ToggleRow
    colors={$colorStore}
    checked={draft.enabled}
    title={draft.enabled ? m.common.enabled() : m.common.disabled()}
    onchange={(enabled) => set({ enabled })}
  />
{/snippet}

{#snippet footer()}
  {#if (attempted && missing) || problem}
    <p class="grow basis-full sm:basis-0 text-sm text-red-400" role="alert">{problem ?? missing}</p>
  {/if}
  <button
    type="button"
    class="px-5 rounded-xl min-h-[44px] font-medium"
    style="background: {$colorStore.primary}10; color: {$colorStore.text}; border: 1px solid {$colorStore.primary}20;"
    onclick={onclose}
  >
    {m.common.cancel()}
  </button>
  <button
    type="button"
    class="flex items-center justify-center gap-2 px-5 rounded-xl min-h-[44px] font-medium disabled:opacity-60"
    style="background: {$colorStore.primary}; color: {$colorStore.onPrimary};"
    disabled={creating}
    onclick={create}
  >
    <i class="fa-solid fa-plus" aria-hidden="true"></i>
    {m.common.create()}
  </button>
{/snippet}

<Sheet
  title={isNew ? m.channelMessages.reactionNewTitle() : m.channelMessages.reactionEditTitle({ channel: channelName })}
  size="lg"
  {actions}
  footer={isNew ? footer : undefined}
  {onclose}
>
  <SettingField label={m.common.channel()} id="cm-react-channel">
    <DiscordSelector
      id="cm-react-channel"
      type="custom"
      customIcon="fa-comments"
      options={channelOptions.map(channel => ({ ...channel, label: channel.label ?? `#${channel.name}` }))}
      selected={channelId}
      placeholder={m.common.selectAChannelPlaceholder()}
      onchange={(detail) => set({ channelId: typeof detail.selected === "string" ? detail.selected : "" })}
    />
  </SettingField>

  <SettingField label={m.channelMessages.reactionEmojis()} id="cm-react-emoji">
    {#if draft.emojis.length}
      <div class="flex flex-wrap gap-2 mb-3">
        {#each draft.emojis as emoji (emoji)}
          <span
            class="inline-flex items-center gap-1 pl-3 rounded-lg min-h-[44px] border"
            style="background: {$colorStore.primary}10; border-color: {$colorStore.primary}20; color: {$colorStore.text};"
          >
            {emojiLabel(emoji)}
            <button
              type="button"
              class="min-h-[44px] min-w-[44px] rounded-lg"
              aria-label={m.channelMessages.removeEmojiAria({ emoji: emojiLabel(emoji) })}
              onclick={() => set({ emojis: draft.emojis.filter(x => x !== emoji) })}
            >
              <i class="fa-solid fa-xmark" aria-hidden="true"></i>
            </button>
          </span>
        {/each}
      </div>
    {/if}
    {#key pickerKey}
      <EmojiPicker
        id="cm-react-emoji"
        guildEmojis={emojis}
        selected={null}
        showUnicodeEmojis={true}
        disabled={draft.emojis.length >= limits.maxEmojis}
        placeholder={m.channelMessages.addEmojiPlaceholder()}
        onchange={(detail) => addEmoji(detail.selected)}
      />
    {/key}
  </SettingField>

  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
    <SettingField label={m.channelMessages.reactionTypes()} id="cm-react-types">
      <DiscordSelector
        id="cm-react-types"
        type="custom"
        options={typeOptions}
        selected={draft.messageTypes}
        searchable={false}
        clearable={false}
        customIcon="fa-filter"
        onchange={(detail) => typeof detail.selected === "string" && set({ messageTypes: detail.selected as AutoReactionMessageType })}
      />
    </SettingField>
    <ToggleRow
      class="self-end"
      colors={$colorStore}
      checked={draft.deleteNonMatching}
      title={m.channelMessages.deleteNonMatching()}
      onchange={(deleteNonMatching) => set({ deleteNonMatching })}
    />
  </div>

  <div class="grid grid-cols-1 md:grid-cols-3 gap-2">
    <ToggleRow colors={$colorStore} checked={draft.ignoreBots} title={m.channelMessages.ignoreBots()} onchange={(ignoreBots) => set({ ignoreBots })} />
    <ToggleRow colors={$colorStore} checked={draft.ignoreWebhooks} title={m.channelMessages.ignoreWebhooks()} onchange={(ignoreWebhooks) => set({ ignoreWebhooks })} />
    <ToggleRow colors={$colorStore} checked={draft.ignoreReplies} title={m.channelMessages.ignoreReplies()} onchange={(ignoreReplies) => set({ ignoreReplies })} />
  </div>

  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
    <WordsField
      id="cm-react-required"
      label={m.channelMessages.requiredWords()}
      words={draft.requiredWords}
      maxWords={limits.maxWords}
      maxLength={limits.maxWordLength}
      onchange={(requiredWords) => set({ requiredWords })}
    />
    <WordsField
      id="cm-react-skip"
      label={m.channelMessages.skipWords()}
      words={draft.skipWords}
      maxWords={limits.maxWords}
      maxLength={limits.maxWordLength}
      onchange={(skipWords) => set({ skipWords })}
    />
  </div>

  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
    <SettingField label={m.channelMessages.allowedRoles()} id="cm-react-allowed">
      <DiscordSelector
        id="cm-react-allowed"
        type="role"
        multiple={true}
        options={roles}
        selected={draft.allowedRoleIds.map(idString)}
        placeholder={m.channelMessages.everyone()}
        onchange={(detail) => set({ allowedRoleIds: list(detail.selected) })}
      />
    </SettingField>
    <SettingField label={m.channelMessages.ignoredRoles()} id="cm-react-ignored-roles">
      <DiscordSelector
        id="cm-react-ignored-roles"
        type="role"
        multiple={true}
        options={roles}
        selected={draft.ignoredRoleIds.map(idString)}
        placeholder={m.common.selectRolesPlaceholder()}
        onchange={(detail) => set({ ignoredRoleIds: list(detail.selected) })}
      />
    </SettingField>
  </div>

  <SettingField label={m.channelMessages.ignoredMembers()} id="cm-react-ignored-users">
    <DiscordSelector
      id="cm-react-ignored-users"
      type="user"
      multiple={true}
      options={members}
      selected={draft.ignoredUserIds.map(idString)}
      placeholder={m.channelMessages.noMembers()}
      onchange={(detail) => set({ ignoredUserIds: list(detail.selected) })}
    />
  </SettingField>
</Sheet>
