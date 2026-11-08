<script lang="ts">
  import { m } from "$lib/i18n";
  import type { AutomationFieldSpec, AutomationNode, AutomationNodeSpec } from "$lib/api/index.ts";
  import { colorStore } from "$lib/stores/colorStore";
  import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";
  import EmojiPicker from "$lib/components/forms/EmojiPicker.svelte";
  import SettingField from "$lib/components/forms/SettingField.svelte";
  import ToggleRow from "$lib/components/forms/ToggleRow.svelte";
  import MessageField from "$lib/components/plugin/MessageField.svelte";
  import NumberField from "$lib/components/plugin/NumberField.svelte";
  import type { DiscordUser } from "$lib/types/discord";
  import ButtonsField from "./ButtonsField.svelte";
  import {
    emojiLabel,
    hasMessagePair,
    idString,
    label,
    readMessage,
    writeMessage,
    type EditorContext
  } from "./automationsModel";

  interface Props {
    spec: AutomationNodeSpec;
    node: AutomationNode;
    ctx: EditorContext;
    user?: DiscordUser | null;
    onchange: () => void;
  }

  let { spec, node, ctx, user = null, onchange }: Props = $props();

  const uid = $props.id();

  const messagePair = $derived(hasMessagePair(spec));
  const fields = $derived(spec.fields.filter((x) => !(messagePair && x.name === "embed")));

  const placeholders = $derived([
    { category: m.multigreets.placeholderCategoryJoin(), name: "%user%", description: m.placeholders.user() },
    { category: m.multigreets.placeholderCategoryJoin(), name: "%user.mention%", description: m.placeholders.userMention() },
    { category: m.multigreets.placeholderCategoryJoin(), name: "%user.id%", description: m.placeholders.userId() },
    { category: m.multigreets.placeholderCategoryJoin(), name: "%user.avatar%", description: m.placeholders.userAvatar() },
    { category: m.features.categoryServer(), name: "%server%", description: m.placeholders.server() },
    { category: m.features.categoryServer(), name: "%server.members%", description: m.placeholders.serverMembers() },
    ...ctx.schema.placeholders.map((x) => ({
      category: m.automations.placeholderCategory(),
      name: x.name,
      description: x.description
    }))
  ]);

  const inputStyle = $derived(
    `background: ${$colorStore.primary}10; border-color: ${$colorStore.primary}30; color: ${$colorStore.text};`
  );

  function set(name: string, value: unknown) {
    if (value === undefined || value === null || value === "") delete node[name];
    else node[name] = value;
    onchange();
  }

  function list(name: string): string[] {
    const value = node[name];
    return Array.isArray(value) ? value.map(idString) : [];
  }

  function single(detail: { selected: string | string[] | null }): string | undefined {
    return typeof detail.selected === "string" ? detail.selected : undefined;
  }

  function many(detail: { selected: string | string[] | null }): string[] {
    return Array.isArray(detail.selected) ? detail.selected : [];
  }

  function options(field: AutomationFieldSpec) {
    return (field.options ?? []).map((x) => ({ id: x, name: label(`option${x}`, x) }));
  }

  function addEmoji(field: AutomationFieldSpec, detail: { selected: string | string[] | null }) {
    const emoji = Array.isArray(detail.selected) ? detail.selected[0] : detail.selected;
    if (!emoji) return;
    const current = list(field.name);
    if (!current.includes(emoji) && (field.max === null || current.length < field.max)) {
      set(field.name, [...current, emoji]);
    }
  }
</script>

<div class="space-y-4 min-w-0">
  {#each fields as field (field.name)}
    {@const id = `${uid}-${field.name}`}
    {@const text = label(`field${field.name[0].toUpperCase()}${field.name.slice(1)}`, field.name)}
    {#if messagePair && field.name === "text"}
      <div class="min-w-0">
        <p class="text-sm font-medium mb-1" style="color: {$colorStore.text}">{label("fieldMessage", text)}</p>
        <MessageField
          value={readMessage(node)}
          previewTitle={label("fieldMessage", text)}
          icon="fa-comment"
          {user}
          {placeholders}
          onchange={(message) => {
            writeMessage(node, message);
            onchange();
          }}
        />
      </div>
    {:else if field.kind === "Boolean"}
      <ToggleRow checked={node[field.name] === true} title={text} colors={$colorStore} onchange={(value) => set(field.name, value)} />
    {:else if field.kind === "Integer"}
      <NumberField
        {id}
        label={text}
        value={typeof node[field.name] === "number" ? (node[field.name] as number) : null}
        min={field.min ?? 0}
        max={field.max ?? undefined}
        onchange={(value) => set(field.name, value)}
      />
    {:else if field.kind === "Text"}
      <SettingField label={text} {id} required={field.required}>
        <input
          {id}
          type="text"
          value={String(node[field.name] ?? "")}
          maxlength={field.max ?? undefined}
          class="w-full min-w-0 p-3 rounded-lg border focus:ring-2 min-h-[50px]"
          style={inputStyle}
          oninput={(e) => set(field.name, e.currentTarget.value)}
        >
      </SettingField>
    {:else if field.kind === "LongText" || field.kind === "EmbedJson"}
      <SettingField label={text} {id} required={field.required}>
        <textarea
          {id}
          rows="4"
          value={String(node[field.name] ?? "")}
          maxlength={field.max ?? undefined}
          class="w-full min-w-0 p-3 rounded-lg border focus:ring-2 min-h-[96px]"
          style={inputStyle}
          oninput={(e) => set(field.name, e.currentTarget.value)}
        ></textarea>
      </SettingField>
    {:else if field.kind === "Channel"}
      <SettingField label={text} {id} required={field.required}>
        <DiscordSelector
          {id}
          type="channel"
          options={ctx.channels}
          selected={idString(node[field.name]) || null}
          placeholder={field.required ? m.common.selectAChannelPlaceholder() : m.automations.eventChannel()}
          clearable={!field.required}
          onchange={(detail) => set(field.name, single(detail))}
        />
      </SettingField>
    {:else if field.kind === "Role"}
      <SettingField label={text} {id} required={field.required}>
        <DiscordSelector
          {id}
          type="role"
          options={ctx.roles}
          selected={idString(node[field.name]) || null}
          placeholder={m.common.selectARolePlaceholder()}
          clearable={!field.required}
          onchange={(detail) => set(field.name, single(detail))}
        />
      </SettingField>
    {:else if field.kind === "User"}
      <SettingField label={text} {id} required={field.required}>
        <DiscordSelector
          {id}
          type="user"
          options={ctx.members}
          selected={idString(node[field.name]) || null}
          placeholder={m.automations.selectMember()}
          clearable={!field.required}
          onchange={(detail) => set(field.name, single(detail))}
        />
      </SettingField>
    {:else if field.kind === "ChannelList"}
      <SettingField label={text} {id} required={field.required}>
        <DiscordSelector
          {id}
          type="channel"
          multiple
          options={ctx.allChannels}
          selected={list(field.name)}
          placeholder={m.automations.selectChannels()}
          onchange={(detail) => set(field.name, many(detail))}
        />
      </SettingField>
    {:else if field.kind === "RoleList"}
      <SettingField label={text} {id} required={field.required}>
        <DiscordSelector
          {id}
          type="role"
          multiple
          options={ctx.roles}
          selected={list(field.name)}
          placeholder={m.common.selectRolesPlaceholder()}
          onchange={(detail) => set(field.name, many(detail))}
        />
      </SettingField>
    {:else if field.kind === "UserList"}
      <SettingField label={text} {id} required={field.required}>
        <DiscordSelector
          {id}
          type="user"
          multiple
          options={ctx.members}
          selected={list(field.name)}
          placeholder={m.automations.selectMembers()}
          onchange={(detail) => set(field.name, many(detail))}
        />
      </SettingField>
    {:else if field.kind === "Choice"}
      <SettingField label={text} {id} required={field.required}>
        <DiscordSelector
          {id}
          type="custom"
          customIcon="fa-list-ul"
          options={options(field)}
          selected={String(node[field.name] ?? field.default ?? "")}
          clearable={false}
          searchable={false}
          onchange={(detail) => set(field.name, single(detail))}
        />
      </SettingField>
    {:else if field.kind === "ChoiceList"}
      <SettingField label={text} {id} required={field.required}>
        <DiscordSelector
          {id}
          type="custom"
          customIcon="fa-list-ul"
          multiple
          searchable={false}
          options={options(field)}
          selected={list(field.name)}
          placeholder={m.common.selectPlaceholder()}
          onchange={(detail) => set(field.name, many(detail))}
        />
      </SettingField>
    {:else if field.kind === "Emoji"}
      <SettingField label={text} {id} required={field.required}>
        <EmojiPicker
          {id}
          guildEmojis={ctx.emojis}
          selected={idString(node[field.name]) || null}
          showUnicodeEmojis={true}
          placeholder={m.automations.selectEmoji()}
          onchange={(detail) => set(field.name, typeof detail.selected === "string" ? detail.selected : undefined)}
        />
      </SettingField>
    {:else if field.kind === "EmojiList"}
      <SettingField label={text} {id} required={field.required}>
        <div class="space-y-2">
          {#if list(field.name).length}
            <div class="flex flex-wrap gap-2">
              {#each list(field.name) as emoji (emoji)}
                {@const name = emojiLabel(emoji, ctx.emojis)}
                <span
                  class="inline-flex items-center gap-1 pl-3 rounded-lg border text-sm"
                  style="background: {$colorStore.primary}10; border-color: {$colorStore.primary}20; color: {$colorStore.text};"
                >
                  {name}
                  <button
                    type="button"
                    class="min-h-[44px] min-w-[44px] rounded-lg"
                    aria-label={m.automations.removeEmojiAria({ emoji: name })}
                    onclick={() => set(field.name, list(field.name).filter((x) => x !== emoji))}
                  >
                    <i class="fa-solid fa-xmark" aria-hidden="true"></i>
                  </button>
                </span>
              {/each}
            </div>
          {/if}
          {#key list(field.name).length}
            <EmojiPicker
              {id}
              guildEmojis={ctx.emojis}
              selected={null}
              showUnicodeEmojis={true}
              placeholder={m.automations.addEmoji()}
              onchange={(detail) => addEmoji(field, detail)}
            />
          {/key}
        </div>
      </SettingField>
    {:else if field.kind === "Buttons"}
      <div class="min-w-0">
        <p class="text-sm font-medium mb-1" style="color: {$colorStore.text}">{text}</p>
        <ButtonsField
          value={Array.isArray(node[field.name]) ? (node[field.name] as never) : []}
          max={field.max ?? 5}
          emojis={ctx.emojis}
          onchange={(value) => set(field.name, value.length ? value : undefined)}
        />
      </div>
    {/if}
  {/each}
</div>
