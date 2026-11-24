<script lang="ts">
  import { m } from "$lib/i18n";
  import { colorStore } from "$lib/stores/colorStore";
  import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";
  import ToggleRow from "$lib/components/forms/ToggleRow.svelte";
  import PlaceholderPicker from "$lib/components/forms/PlaceholderPicker.svelte";
  import PlaceholderButton from "$lib/components/forms/PlaceholderButton.svelte";
  import { embedColorOptions } from "$lib/embedbuilder/colors";
  import {
    DEFAULT_REPLY_COLOR,
    MAX_REPLY_LENGTH,
    MAX_REPLY_TITLE,
    stripComponents,
    type ButtonComponent,
    type ReplyKind,
    type SavedMessageOption
  } from "$lib/embedbuilder/buttons";

  interface Placeholder {
    category: string;
    name: string;
    description: string;
  }

  interface Props {
    button: ButtonComponent;
    idPrefix: string;
    savedMessages?: SavedMessageOption[];
    placeholders?: Placeholder[];
    onpatch: (patch: Partial<ButtonComponent>) => void;
  }

  let { button, idPrefix, savedMessages = [], placeholders = [], onpatch }: Props = $props();

  const replyId = $derived(`${idPrefix}-reply`);
  const hasSaved = $derived(savedMessages.length > 0 || (button.replyKind === "saved" && !!button.replyJson));
  const kind = $derived<ReplyKind>(button.replyKind === "saved" && !hasSaved ? "text" : (button.replyKind ?? "text"));
  const inputStyle = $derived(`background: ${$colorStore.primary}10; border-color: ${$colorStore.primary}30; color: ${$colorStore.text};`);
  const kinds = $derived([
    { id: "text", name: m.embedbuilder.replyKindText() },
    { id: "embed", name: m.embedbuilder.replyKindEmbed() },
    ...(hasSaved ? [{ id: "saved", name: m.embedbuilder.replyKindSaved() }] : [])
  ]);
  const colors = $derived(embedColorOptions());
  const replyColor = $derived(button.replyColor || DEFAULT_REPLY_COLOR);
  const savedOptions = $derived(savedMessages.map(item => ({ id: item.id, name: item.name })));

  let pickerOpen = $state(false);
  let pickerSearch = $state("");
  let pickerElement = $state<HTMLTextAreaElement | null>(null);

  function togglePicker() {
    pickerElement = document.getElementById(replyId) as HTMLTextAreaElement | null;
    pickerOpen = !pickerOpen;
    pickerSearch = "";
  }

  function chooseSaved(selected: string | string[] | null) {
    const id = typeof selected === "string" ? selected : null;
    const message = savedMessages.find(item => item.id === id);
    if (!message) {
      onpatch({ replyEmbedId: null, replyJson: "" });
      return;
    }
    onpatch({ replyEmbedId: message.id, replyJson: stripComponents(message.jsonCode) });
  }
</script>

<div class="space-y-3">
  <div>
    <span id="{idPrefix}-kind-label" class="block text-sm font-medium mb-2" style="color: {$colorStore.text};">
      {m.embedbuilder.replyKindAria()}
    </span>
    <DiscordSelector
      type="custom"
      customIcon="fa-comment"
      options={kinds}
      selected={kind}
      searchable={false}
      clearable={false}
      ariaLabelledby="{idPrefix}-kind-label"
      onchange={(detail) => typeof detail.selected === "string" && onpatch({ replyKind: detail.selected as ReplyKind })}
    />
  </div>

  {#if kind === "embed"}
    <div>
      <label for="{idPrefix}-title" class="block text-sm font-medium mb-2" style="color: {$colorStore.text};">
        {m.common.title()}
      </label>
      <input
        id="{idPrefix}-title"
        type="text"
        class="w-full px-3 py-2 rounded-lg border min-h-[44px]"
        style={inputStyle}
        placeholder={m.embedbuilder.editorTitlePlaceholder()}
        maxlength={MAX_REPLY_TITLE}
        value={button.replyTitle ?? ""}
        oninput={(e) => onpatch({ replyTitle: e.currentTarget.value })}
      />
    </div>
  {/if}

  {#if kind === "saved"}
    <div>
      <span id="{idPrefix}-saved-label" class="block text-sm font-medium mb-2" style="color: {$colorStore.text};">
        {m.embedbuilder.replySavedLabel()}
      </span>
      <DiscordSelector
        type="custom"
        customIcon="fa-floppy-disk"
        options={savedOptions}
        selected={button.replyEmbedId ?? null}
        placeholder={m.embedbuilder.replySavedPlaceholder()}
        ariaLabelledby="{idPrefix}-saved-label"
        onchange={(detail) => chooseSaved(detail.selected)}
      />
      {#if !button.replyEmbedId && button.replyJson}
        <p class="text-sm mt-2" style="color: {$colorStore.muted};">{m.embedbuilder.replySavedKept()}</p>
      {/if}
    </div>
  {:else}
    <div>
      <label for={replyId} class="block text-sm font-medium mb-2" style="color: {$colorStore.text};">
        {kind === "embed" ? m.embedbuilder.descriptionLabel() : m.embedbuilder.replyLabel()}
        <span class="text-xs ml-2" style="color: {$colorStore.muted};">{(button.replyText ?? "").length}/{MAX_REPLY_LENGTH}</span>
      </label>
      <textarea
        id={replyId}
        rows="4"
        class="w-full px-3 py-2 rounded-lg border resize-y"
        style={inputStyle}
        maxlength={MAX_REPLY_LENGTH}
        placeholder={m.embedbuilder.replyPlaceholder()}
        value={button.replyText ?? ""}
        oninput={(e) => onpatch({ replyText: e.currentTarget.value })}
      ></textarea>
      <p class="text-sm mt-1" style="color: {$colorStore.muted};">{m.embedbuilder.replyHint()}</p>
      {#if placeholders.length > 0}
        <div class="mt-2">
          <PlaceholderButton expanded={pickerOpen} onclick={togglePicker} />
        </div>
        <PlaceholderPicker
          visible={pickerOpen}
          {placeholders}
          searchTerm={pickerSearch}
          inline={true}
          inputElement={pickerElement}
          onselect={() => (pickerOpen = false)}
          onclose={() => (pickerOpen = false)}
          onsearch={(detail) => (pickerSearch = detail.term)}
        />
      {/if}
    </div>
  {/if}

  {#if kind === "embed"}
    <div>
      <span class="block text-sm font-medium mb-2" style="color: {$colorStore.text};">{m.common.color()}</span>
      <div class="flex flex-wrap gap-2" role="group" aria-label={m.common.color()}>
        {#each colors as color (color.id)}
          {@const selected = replyColor.toLowerCase() === color.id.toLowerCase()}
          <button
            type="button"
            class="size-11 rounded-lg border"
            style="background: {color.id}; border-color: {$colorStore.primary}40; {selected ? `outline: 2px solid ${$colorStore.selectedBorder}; outline-offset: 2px;` : ''}"
            aria-pressed={selected}
            aria-label={color.name}
            title={color.name}
            onclick={() => onpatch({ replyColor: color.id })}
          ></button>
        {/each}
        <input
          type="color"
          class="size-11 rounded-lg border p-0 cursor-pointer"
          style="border-color: {$colorStore.primary}40;"
          aria-label={m.embedbuilder.simpleColorCustom()}
          title={m.embedbuilder.simpleColorCustom()}
          value={replyColor}
          oninput={(e) => onpatch({ replyColor: e.currentTarget.value })}
        />
      </div>
    </div>
  {/if}

  <ToggleRow
    colors={$colorStore}
    id="{idPrefix}-private"
    checked={button.replyPrivate !== false}
    title={m.embedbuilder.replyPrivate()}
    subtitle={m.embedbuilder.replyPrivateHint()}
    onchange={(checked) => onpatch({ replyPrivate: checked })}
  />
</div>
