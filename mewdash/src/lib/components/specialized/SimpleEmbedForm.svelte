<script lang="ts">
  import { m } from "$lib/i18n";
  import { colorStore } from "$lib/stores/colorStore";
  import PlaceholderPicker from "$lib/components/forms/PlaceholderPicker.svelte";
  import PlaceholderButton from "$lib/components/forms/PlaceholderButton.svelte";
  import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";
  import PictureField from "$lib/components/specialized/PictureField.svelte";
  import ReplyEditor from "$lib/components/specialized/ReplyEditor.svelte";
  import { isImagePlaceholder } from "$lib/utils/imagePlaceholders";
  import { embedColorOptions } from "$lib/embedbuilder/colors";
  import { usesAdvancedFeatures } from "$lib/embedbuilder/mode.svelte";
  import {
    MAX_BUTTON_LABEL,
    actionOf,
    actionPatch,
    isSimpleButton,
    newButton,
    newKey,
    type ButtonAction,
    type SavedMessageOption
  } from "$lib/embedbuilder/buttons";

  interface Placeholder {
    category: string;
    name: string;
    description: string;
  }

  interface Props {
    content: string;
    embeds: any[];
    componentRows: any[];
    placeholders?: Placeholder[];
    savedMessages?: SavedMessageOption[];
    allowContent?: boolean;
    allowButtons?: boolean;
    allowReplyButtons?: boolean;
    onswitch: () => void;
    onchange?: () => void;
  }

  let {
    content = $bindable(),
    embeds = $bindable(),
    componentRows = $bindable(),
    placeholders = [],
    savedMessages = [],
    allowContent = true,
    allowButtons = true,
    allowReplyButtons = false,
    onswitch,
    onchange
  }: Props = $props();

  const MAX_BUTTONS = 5;

  const embed = $derived(embeds[0] ?? blankEmbed());
  const buttons = $derived<any[]>(componentRows[0]?.components ?? []);
  const hiddenParts = $derived(usesAdvancedFeatures(embeds, componentRows));
  const buttonsFit = $derived(
    componentRows.length <= 1 && componentRows.every(row => row.components.every((c: any) => isSimpleButton(c)))
  );
  const colors = $derived(embedColorOptions());
  const imagePlaceholders = $derived.by(() => {
    const images = placeholders.filter(p => isImagePlaceholder(p.name));
    return images.length > 0 ? images : placeholders;
  });
  const actionOptions = $derived([
    { id: "link", name: m.embedbuilder.componentsOnClickLink() },
    { id: "message", name: m.embedbuilder.componentsOnClickMessage() }
  ]);

  let pickerFor = $state("");
  let pickerSearch = $state("");
  let pickerElement = $state<HTMLInputElement | HTMLTextAreaElement | null>(null);

  const inputStyle = $derived(`background: ${$colorStore.primary}10; border-color: ${$colorStore.primary}30; color: ${$colorStore.text};`);
  const buttonStyle = $derived(`background: ${$colorStore.primary}20; color: ${$colorStore.primary}; border: 1px solid ${$colorStore.primary}30;`);

  function blankEmbed() {
    return {
      title: "",
      description: "",
      color: "#5865F2",
      url: "",
      author: { name: "", url: "", icon_url: "" },
      thumbnail: { url: "" },
      image: { url: "" },
      footer: { text: "", icon_url: "" },
      fields: []
    };
  }

  function patchEmbed(patch: Record<string, unknown>) {
    const current = embeds.length > 0 ? embeds : [blankEmbed()];
    embeds = current.map((item, index) => (index === 0 ? { ...item, ...patch } : item));
    onchange?.();
  }

  function setContent(value: string) {
    content = value;
    onchange?.();
  }

  function togglePicker(id: string) {
    pickerElement = document.getElementById(id) as HTMLInputElement | HTMLTextAreaElement | null;
    pickerFor = pickerFor === id ? "" : id;
    pickerSearch = "";
  }

  function addButton(action: ButtonAction) {
    if (buttons.length >= MAX_BUTTONS) return;
    const component = newButton(action);
    if (componentRows.length === 0) {
      const rowKey = newKey("row");
      componentRows = [{ componentKey: rowKey, rowKey, components: [component] }];
    } else {
      componentRows = [{ ...componentRows[0], components: [...componentRows[0].components, component] }];
    }
    onchange?.();
  }

  function patchButton(componentKey: string, patch: Record<string, unknown>) {
    componentRows = [{
      ...componentRows[0],
      components: componentRows[0].components.map((c: any) => (c.componentKey === componentKey ? { ...c, ...patch } : c))
    }];
    onchange?.();
  }

  function chooseAction(button: any, selected: string | string[] | null) {
    if (selected !== "link" && selected !== "message") return;
    patchButton(button.componentKey, actionPatch(button, selected));
  }

  function removeButton(componentKey: string) {
    const remaining = componentRows[0].components.filter((c: any) => c.componentKey !== componentKey);
    componentRows = remaining.length === 0 ? [] : [{ ...componentRows[0], components: remaining }];
    onchange?.();
  }
</script>

{#snippet picker(id: string, options: Placeholder[])}
  <div class="mt-2">
    <PlaceholderButton expanded={pickerFor === id} onclick={() => togglePicker(id)} />
  </div>
  <PlaceholderPicker
    visible={pickerFor === id}
    placeholders={options}
    searchTerm={pickerSearch}
    inline={true}
    inputElement={pickerElement}
    onselect={() => (pickerFor = "")}
    onclose={() => (pickerFor = "")}
    onsearch={(detail) => (pickerSearch = detail.term)}
  />
{/snippet}

<div class="space-y-6">
  {#if hiddenParts}
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <p class="text-sm" style="color: {$colorStore.text};">{m.embedbuilder.modeNotice()}</p>
      <button
        type="button"
        class="min-h-[44px] px-4 rounded-lg text-sm font-medium shrink-0"
        style={buttonStyle}
        onclick={onswitch}
      >
        {m.embedbuilder.modeNoticeSwitch()}
      </button>
    </div>
  {/if}

  {#if allowContent}
    <div data-tour="simple-message">
      <label for="simple-content" class="block text-sm font-medium mb-1" style="color: {$colorStore.text};">
        {m.embedbuilder.pageContentLabel()}
      </label>
      <p class="text-sm mb-2" style="color: {$colorStore.muted};">{m.embedbuilder.pageContentHint()}</p>
      <textarea
        id="simple-content"
        rows="3"
        class="w-full px-3 py-2 rounded-lg border resize-y"
        style={inputStyle}
        placeholder={m.embedbuilder.pageContentPlaceholder()}
        value={content}
        oninput={(e) => setContent(e.currentTarget.value)}
      ></textarea>
      {@render picker("simple-content", placeholders)}
    </div>
  {/if}

  <div data-tour="simple-title">
    <label for="simple-title" class="block text-sm font-medium mb-2" style="color: {$colorStore.text};">
      {m.common.title()}
    </label>
    <input
      id="simple-title"
      type="text"
      class="w-full px-3 py-2 rounded-lg border min-h-[44px]"
      style={inputStyle}
      placeholder={m.embedbuilder.editorTitlePlaceholder()}
      maxlength="256"
      value={embed.title}
      oninput={(e) => patchEmbed({ title: e.currentTarget.value })}
    />
    {@render picker("simple-title", placeholders)}
  </div>

  <div data-tour="simple-description">
    <label for="simple-description" class="block text-sm font-medium mb-1" style="color: {$colorStore.text};">
      {m.embedbuilder.descriptionLabel()}
    </label>
    <p class="text-sm mb-2" style="color: {$colorStore.muted};">{m.embedbuilder.descriptionHint()}</p>
    <textarea
      id="simple-description"
      rows="5"
      class="w-full px-3 py-2 rounded-lg border resize-y"
      style={inputStyle}
      placeholder={m.embedbuilder.editorDescriptionPlaceholder()}
      maxlength="4096"
      value={embed.description}
      oninput={(e) => patchEmbed({ description: e.currentTarget.value })}
    ></textarea>
    {@render picker("simple-description", placeholders)}
  </div>

  <div data-tour="simple-color">
    <span class="block text-sm font-medium mb-2" style="color: {$colorStore.text};">{m.common.color()}</span>
    <div class="flex flex-wrap gap-2" role="group" aria-label={m.common.color()}>
      {#each colors as color (color.id)}
        {@const selected = embed.color?.toLowerCase() === color.id.toLowerCase()}
        <button
          type="button"
          class="size-11 rounded-lg border"
          style="background: {color.id}; border-color: {$colorStore.primary}40; {selected ? `outline: 2px solid ${$colorStore.selectedBorder}; outline-offset: 2px;` : ''}"
          aria-pressed={selected}
          aria-label={color.name}
          title={color.name}
          onclick={() => patchEmbed({ color: color.id })}
        ></button>
      {/each}
      <input
        type="color"
        class="size-11 rounded-lg border p-0 cursor-pointer"
        style="border-color: {$colorStore.primary}40;"
        aria-label={m.embedbuilder.simpleColorCustom()}
        title={m.embedbuilder.simpleColorCustom()}
        value={embed.color}
        oninput={(e) => patchEmbed({ color: e.currentTarget.value })}
      />
    </div>
  </div>

  <div data-tour="simple-image">
    <label for="simple-image" class="block text-sm font-medium mb-1" style="color: {$colorStore.text};">
      {m.embedbuilder.pictureLabel()}
    </label>
    <p class="text-sm mb-2" style="color: {$colorStore.muted};">{m.embedbuilder.pictureHint()}</p>
    <PictureField
      id="simple-image"
      value={embed.image?.url ?? ""}
      placeholder={m.embedbuilder.editorImagePlaceholder()}
      placeholders={imagePlaceholders}
      onchange={(value) => patchEmbed({ image: { ...embed.image, url: value } })}
    />
  </div>

  {#if allowButtons && buttonsFit}
    <div class="space-y-3" data-tour="simple-buttons">
      <div>
        <span class="block text-sm font-medium mb-1" style="color: {$colorStore.text};">{m.common.buttons()}</span>
        <p class="text-sm" style="color: {$colorStore.muted};">{m.embedbuilder.simpleButtonsHint()}</p>
      </div>

      {#each buttons as button, index (button.componentKey)}
        {@const action = actionOf(button)}
        <div class="rounded-lg border p-3 space-y-3" style="background: {$colorStore.primary}05; border-color: {$colorStore.primary}20;">
          <div class="flex items-center justify-between gap-2">
            <span class="text-sm font-medium" style="color: {$colorStore.text};">{m.automations.buttonNumber({ number: index + 1 })}</span>
            <button
              type="button"
              class="min-h-[44px] min-w-[44px] rounded-lg flex items-center justify-center"
              style="background: #ED424520; color: #ED4245; border: 1px solid #ED424530;"
              aria-label={m.automations.removeButtonAria({ number: index + 1 })}
              title={m.common.remove()}
              onclick={() => removeButton(button.componentKey)}
            >
              <i class="fa-solid fa-trash" aria-hidden="true"></i>
            </button>
          </div>

          <div>
            <label for="simple-button-{button.componentKey}" class="block text-sm font-medium mb-2" style="color: {$colorStore.text};">
              {m.embedbuilder.simpleButtonText()}
            </label>
            <input
              id="simple-button-{button.componentKey}"
              type="text"
              class="w-full px-3 py-2 rounded-lg border min-h-[44px]"
              style={inputStyle}
              placeholder={m.embedbuilder.componentsButtonTextPlaceholder()}
              maxlength={MAX_BUTTON_LABEL}
              value={button.displayName}
              oninput={(e) => patchButton(button.componentKey, { displayName: e.currentTarget.value })}
            />
          </div>

          {#if allowReplyButtons}
            <div>
              <span id="simple-action-{button.componentKey}" class="block text-sm font-medium mb-2" style="color: {$colorStore.text};">
                {m.embedbuilder.componentsOnClick()}
              </span>
              <DiscordSelector
                type="custom"
                customIcon="fa-arrow-pointer"
                options={actionOptions}
                selected={action}
                searchable={false}
                clearable={false}
                ariaLabelledby="simple-action-{button.componentKey}"
                onchange={(detail) => chooseAction(button, detail.selected)}
              />
            </div>
          {/if}

          {#if action === "message"}
            <ReplyEditor
              {button}
              idPrefix="simple-{button.componentKey}"
              {savedMessages}
              {placeholders}
              onpatch={(patch) => patchButton(button.componentKey, patch)}
            />
          {:else}
            <div>
              <label for="simple-link-{button.componentKey}" class="block text-sm font-medium mb-2" style="color: {$colorStore.text};">
                {m.embedbuilder.simpleButtonLink()}
              </label>
              <input
                id="simple-link-{button.componentKey}"
                type="url"
                class="w-full px-3 py-2 rounded-lg border min-h-[44px]"
                style={inputStyle}
                placeholder={m.embedbuilder.editorUrlPlaceholder()}
                value={button.url}
                oninput={(e) => patchButton(button.componentKey, { url: e.currentTarget.value })}
              />
            </div>
          {/if}
        </div>
      {/each}

      {#if buttons.length < MAX_BUTTONS}
        <div class="flex flex-col sm:flex-row gap-2">
          <button
            type="button"
            class="min-h-[44px] px-4 rounded-lg text-sm font-medium flex items-center justify-center gap-2"
            style={buttonStyle}
            onclick={() => addButton("link")}
          >
            <i class="fa-solid fa-plus" aria-hidden="true"></i>
            {m.embedbuilder.simpleAddLinkButton()}
          </button>
          {#if allowReplyButtons}
            <button
              type="button"
              class="min-h-[44px] px-4 rounded-lg text-sm font-medium flex items-center justify-center gap-2"
              style={buttonStyle}
              onclick={() => addButton("message")}
            >
              <i class="fa-solid fa-plus" aria-hidden="true"></i>
              {m.embedbuilder.simpleAddMessageButton()}
            </button>
          {/if}
        </div>
      {/if}

      <p class="text-sm" style="color: {$colorStore.muted};">{m.embedbuilder.simpleMoreButtons()}</p>
    </div>
  {/if}
</div>
