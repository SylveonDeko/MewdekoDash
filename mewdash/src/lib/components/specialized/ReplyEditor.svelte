<script lang="ts">
  import { m } from "$lib/i18n";
  import { colorStore } from "$lib/stores/colorStore";
  import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";
  import ToggleRow from "$lib/components/forms/ToggleRow.svelte";
  import PlaceholderPicker from "$lib/components/forms/PlaceholderPicker.svelte";
  import PlaceholderButton from "$lib/components/forms/PlaceholderButton.svelte";
  import { MAX_REPLY_LENGTH, stripComponents, type ButtonComponent, type SavedMessageOption } from "$lib/embedbuilder/buttons";

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
  const kind = $derived(button.replyKind ?? "text");
  const inputStyle = $derived(`background: ${$colorStore.primary}10; border-color: ${$colorStore.primary}30; color: ${$colorStore.text};`);
  const kinds = $derived([
    { id: "text" as const, name: m.embedbuilder.replyKindText() },
    { id: "saved" as const, name: m.embedbuilder.replyKindSaved() }
  ]);
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
  {#if savedMessages.length > 0}
    <div class="grid grid-cols-2 gap-2" role="group" aria-label={m.embedbuilder.replyKindAria()}>
      {#each kinds as option (option.id)}
        {@const active = kind === option.id}
        <button
          type="button"
          class="min-h-[44px] px-2 rounded-lg border text-sm font-medium"
          style="background: {active ? $colorStore.selectedSurface : `${$colorStore.primary}08`}; border-color: {active ? $colorStore.selectedBorder : `${$colorStore.primary}20`}; color: {$colorStore.text};"
          aria-pressed={active}
          onclick={() => onpatch({ replyKind: option.id })}
        >
          {option.name}
        </button>
      {/each}
    </div>
  {/if}

  {#if kind === "saved" && savedMessages.length > 0}
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
        {m.embedbuilder.replyLabel()}
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

  <ToggleRow
    colors={$colorStore}
    id="{idPrefix}-private"
    checked={button.replyPrivate !== false}
    title={m.embedbuilder.replyPrivate()}
    subtitle={m.embedbuilder.replyPrivateHint()}
    onchange={(checked) => onpatch({ replyPrivate: checked })}
  />
</div>
