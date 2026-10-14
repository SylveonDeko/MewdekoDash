<script lang="ts">
  import { m } from "$lib/i18n";
  import { onDestroy, untrack } from "svelte";
  import { fade } from "svelte/transition";
  import { flip } from "svelte/animate";
  import { dragHandle, dragHandleZone } from "svelte-dnd-action";
  import { colorStore } from "$lib/stores/colorStore";
  import { currentGuild } from "$lib/stores/currentGuild";
  import { requestConfirmation } from "$lib/stores/confirmationStore";
  import {
    achievementsApi,
    type AchievementCard,
    type AchievementCardCustomType,
    type AchievementCardElement,
    type AchievementCardPreview,
    type AchievementCardTemplate,
    type AchievementCatalog,
    type AchievementIconUpload
  } from "$lib/api/index.ts";
  import { logger } from "$lib/logger";
  import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";
  import ToggleRow from "$lib/components/forms/ToggleRow.svelte";
  import DuoIcon from "../DuoIcon.svelte";
  import ColorTokenField from "./ColorTokenField.svelte";
  import GlyphField from "./GlyphField.svelte";
  import CardImageField from "./CardImageField.svelte";
  import {
    cloneTemplate,
    CUSTOM_TYPES,
    ELEMENT_KINDS,
    elementName,
    isBuiltIn,
    newElement,
    PILL_TYPES,
    SHAPE_TYPES,
    TEXT_TYPES,
    uniqueId
  } from "./cardHelpers";

  /**
   * Edits one card design: a live preview drawn by the bot with draggable handles over it, the layer list, and the
   * properties of the selected element or of the card itself.
   */
  interface Props {
    /** The design's name */
    name: string;
    /** The design as saved */
    template: AchievementCardTemplate;
    /** Whether the design hasn't been saved yet, so saving creates it */
    isNew?: boolean;
    card: AchievementCard;
    catalog: AchievementCatalog;
    /** Saves the design; resolves when done */
    onsave: (name: string, template: AchievementCardTemplate) => Promise<void>;
    onclose: () => void;
    onimages: (images: AchievementIconUpload[]) => void;
    onerror: (text: string) => void;
  }

  let { name, template, isNew = false, card, catalog, onsave, onclose, onimages, onerror }: Props = $props();

  type Drag = {
    id: string;
    mode: "move" | "resize";
    startX: number;
    startY: number;
    origin: { x: number; y: number; w: number; h: number };
  };

  /** The design as opened. The designer is re-created for each design, so later prop changes are not followed. */
  const initial = untrack(() => ({ name, json: JSON.stringify(template) }));

  let draft = $state<AchievementCardTemplate>(JSON.parse(initial.json));
  let draftName = $state(initial.name);
  let savedJson = $state(initial.json);
  let savedName = $state(initial.name);
  let selectedId = $state<string | null>(null);
  let locked = $state(false);
  let sampleKey = $state<string | null>(null);
  let preview = $state<AchievementCardPreview | null>(null);
  let previewing = $state(false);
  let saving = $state(false);
  let snap = $state(true);
  let canvasWidth = $state(0);
  let drag = $state<Drag | null>(null);
  let undoStack = $state<string[]>([]);
  let redoStack = $state<string[]>([]);
  let showAdd = $state(false);

  let json = $derived(JSON.stringify(draft));
  let dirty = $derived(json !== savedJson || draftName.trim() !== savedName);
  let selected = $derived(draft.elements.find((e) => e.id === selectedId) ?? null);
  /** The layer list front first, as the drag and drop zone holds it, following the draft between drags. */
  let layerItems = $state<{ id: string; element: AchievementCardElement }[]>([]);

  $effect(() => {
    layerItems = [...draft.elements].reverse().map((element) => ({ id: element.id, element }));
  });
  let sample = $derived(
    catalog.achievements.find((a) => a.key === sampleKey) ??
    catalog.achievements.find((a) => a.metric > 0 && a.threshold > 0 && !a.hidden) ??
    catalog.achievements[0]
  );
  let gradeColor = $derived(
    locked ? card.palette.muted : catalog.grades.find((g) => g.value === sample?.grade)?.color ?? card.palette.primary
  );
  let outerWidth = $derived(preview ? preview.width + preview.margin * 2 : draft.width + 80);
  let outerHeight = $derived(preview ? preview.height + preview.margin * 2 : draft.height + 80);
  let pxPerUnit = $derived(canvasWidth > 0 ? canvasWidth / outerWidth : 1);
  let sampleOptions = $derived(catalog.achievements.map((a) => ({ id: a.key, name: a.name })));
  let followOptions = $derived([
    { id: "", name: m.achievements.cardDesignerNothing() },
    ...draft.elements
      .filter((e) => e.id !== selectedId && TEXT_TYPES.includes(e.type))
      .map((e) => ({ id: e.id, name: elementName(e) }))
  ]);
  let besideOptions = $derived([
    { id: "", name: m.achievements.cardDesignerNothing() },
    ...draft.elements
      .filter((e) => e.id !== selectedId && PILL_TYPES.includes(e.type))
      .map((e) => ({ id: e.id, name: elementName(e) }))
  ]);

  let previewTimer: ReturnType<typeof setTimeout> | null = null;
  let historyTimer: ReturnType<typeof setTimeout> | null = null;
  let previewSeq = 0;
  let committedJson = initial.json;

  $effect(() => {
    const body = json;
    const state = locked;
    const key = sample?.key ?? null;
    if (previewTimer) clearTimeout(previewTimer);
    previewTimer = setTimeout(() => loadPreview(body, state, key), drag ? 90 : 160);
  });

  $effect(() => {
    const body = json;
    if (body === committedJson) return;
    if (historyTimer) clearTimeout(historyTimer);
    historyTimer = setTimeout(() => {
      undoStack = [...undoStack.slice(-79), committedJson];
      redoStack = [];
      committedJson = body;
    }, 400);
  });

  onDestroy(() => {
    if (previewTimer) clearTimeout(previewTimer);
    if (historyTimer) clearTimeout(historyTimer);
  });

  /**
   * Asks the bot to draw the draft. Responses that arrive after a newer request are dropped.
   * @param body The draft as JSON
   * @param state Whether to draw the locked state
   * @param key The sample achievement
   */
  async function loadPreview(body: string, state: boolean, key: string | null) {
    if (!$currentGuild?.id) return;
    const seq = ++previewSeq;
    previewing = true;
    try {
      const result = await achievementsApi.previewCard($currentGuild.id, JSON.parse(body), state, key);
      if (seq === previewSeq) preview = result;
    } catch (err: any) {
      if (seq === previewSeq) {
        logger.error("Failed to draw the card:", err);
        onerror(err?.message || m.achievements.cardDesignerErrorDraw());
      }
    } finally {
      if (seq === previewSeq) previewing = false;
    }
  }

  /** Steps back one change. */
  function undo() {
    const previous = undoStack.at(-1);
    if (!previous) return;
    undoStack = undoStack.slice(0, -1);
    redoStack = [...redoStack, json];
    committedJson = previous;
    draft = JSON.parse(previous);
  }

  /** Steps forward one undone change. */
  function redo() {
    const next = redoStack.at(-1);
    if (!next) return;
    redoStack = redoStack.slice(0, -1);
    undoStack = [...undoStack, json];
    committedJson = next;
    draft = JSON.parse(next);
  }

  /**
   * Where an element sits over the image, in percent of the image: the bot's layout, shifted by any edit made since
   * that layout was drawn so handles follow drags at once.
   * @param element The element
   */
  function boxOf(element: AchievementCardElement) {
    const laid = preview?.layout.find((b) => b.id === element.id);
    const drawnAs = preview?.template?.elements.find((e) => e.id === element.id);
    const margin = preview?.margin ?? 40;
    let x = element.x, y = element.y, w = element.w, h = element.h, drawn = true;
    if (laid && drawnAs) {
      x = laid.x + (element.x - drawnAs.x);
      y = laid.y + (element.y - drawnAs.y);
      w = laid.w + (element.w - drawnAs.w);
      h = laid.h + (element.h - drawnAs.h);
      drawn = laid.drawn;
    }
    return {
      left: ((x + margin) / outerWidth) * 100,
      top: ((y + margin) / outerHeight) * 100,
      width: (Math.max(w, 1) / outerWidth) * 100,
      height: (Math.max(h, 1) / outerHeight) * 100,
      drawn
    };
  }

  /**
   * Starts moving or resizing an element.
   * @param event The pointer down
   * @param element The element
   * @param mode Move or resize
   */
  function startDrag(event: PointerEvent, element: AchievementCardElement, mode: "move" | "resize") {
    event.preventDefault();
    event.stopPropagation();
    selectedId = element.id;
    drag = {
      id: element.id,
      mode,
      startX: event.clientX,
      startY: event.clientY,
      origin: { x: element.x, y: element.y, w: element.w, h: element.h }
    };
    (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
  }

  /**
   * Moves or resizes the dragged element.
   * @param event The pointer move
   */
  function moveDrag(event: PointerEvent) {
    if (!drag) return;
    const element = draft.elements.find((e) => e.id === drag!.id);
    if (!element) return;
    const step = snap && !event.altKey ? 4 : 1;
    const round = (v: number) => Math.round(v / step) * step;
    const dx = (event.clientX - drag.startX) / pxPerUnit;
    const dy = (event.clientY - drag.startY) / pxPerUnit;
    if (drag.mode === "move") {
      element.x = round(drag.origin.x + dx);
      element.y = round(drag.origin.y + dy);
    } else {
      element.w = Math.max(4, round(drag.origin.w + dx));
      element.h = Math.max(4, round(drag.origin.h + dy));
    }
  }

  /** Ends a drag. */
  function endDrag() {
    drag = null;
  }

  /**
   * Handles editor shortcuts: arrows nudge, delete removes, and undo, redo, duplicate.
   * @param event The key press
   */
  function onKey(event: KeyboardEvent) {
    const target = event.target as HTMLElement;
    if (target.closest("input, textarea, [contenteditable]")) return;
    const mod = event.metaKey || event.ctrlKey;
    if (mod && event.key.toLowerCase() === "z") {
      event.preventDefault();
      if (event.shiftKey) redo();
      else undo();
      return;
    }
    if (!selected) return;
    const step = event.shiftKey ? 10 : 1;
    const moves: Record<string, [number, number]> = {
      ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step]
    };
    if (moves[event.key]) {
      event.preventDefault();
      selected.x += moves[event.key][0];
      selected.y += moves[event.key][1];
    } else if ((event.key === "Delete" || event.key === "Backspace") && !isBuiltIn(selected.type)) {
      event.preventDefault();
      removeElement(selected.id);
    } else if (mod && event.key.toLowerCase() === "d") {
      event.preventDefault();
      duplicate(selected);
    } else if (event.key === "Escape") {
      selectedId = null;
    }
  }

  /**
   * Adds a custom element on top and selects it.
   * @param type The element kind
   */
  function add(type: AchievementCardCustomType) {
    if (draft.elements.length >= card.limits.maxElements) {
      onerror(m.achievements.cardDesignerErrorMaxElements({ max: card.limits.maxElements }));
      return;
    }
    const element = newElement(draft, type);
    draft.elements.push(element);
    selectedId = element.id;
    showAdd = false;
  }

  /**
   * Copies a custom element just above itself, nudged so it is visible.
   * @param element The element
   */
  function duplicate(element: AchievementCardElement) {
    if (isBuiltIn(element.type)) return;
    const copy: AchievementCardElement = { ...JSON.parse(JSON.stringify(element)), id: uniqueId(draft, element.type) };
    copy.x += 16;
    copy.y += 16;
    const index = draft.elements.findIndex((e) => e.id === element.id);
    draft.elements.splice(index + 1, 0, copy);
    selectedId = copy.id;
  }

  /**
   * Removes a custom element and clears links to it.
   * @param id The element ID
   */
  function removeElement(id: string) {
    draft.elements = draft.elements.filter((e) => e.id !== id);
    for (const e of draft.elements) {
      if (e.followId === id) e.followId = "";
      if (e.besideId === id) e.besideId = "";
    }
    if (selectedId === id) selectedId = null;
  }

  /**
   * Moves an element one step toward the front or back.
   * @param id The element ID
   * @param toward 1 toward the front, -1 toward the back
   */
  function reorder(id: string, toward: 1 | -1) {
    const index = draft.elements.findIndex((e) => e.id === id);
    const target = index + toward;
    if (index < 0 || target < 0 || target >= draft.elements.length) return;
    const list = [...draft.elements];
    [list[index], list[target]] = [list[target], list[index]];
    draft.elements = list;
  }

  /**
   * Applies the order a layer drag left behind. The list is front first, the draft back to front.
   * @param event The drop
   */
  function dropLayer(event: CustomEvent<{ items: { id: string; element: AchievementCardElement }[] }>) {
    layerItems = event.detail.items;
    draft.elements = [...layerItems].reverse().map((item) => item.element);
  }

  /** Puts the selected built in element back the way the built in design has it. */
  function resetSelected() {
    if (!selected || !isBuiltIn(selected.type)) return;
    const original = card.builtIn.elements.find((e) => e.type === selected!.type);
    if (!original) return;
    const index = draft.elements.findIndex((e) => e.id === selected!.id);
    draft.elements[index] = JSON.parse(JSON.stringify(original));
  }

  /** Starts over from the built in design, after asking. */
  async function resetAll() {
    const ok = await requestConfirmation({
      title: m.achievements.cardDesignerStartOverTitle(),
      message: m.achievements.cardDesignerStartOverMessage(),
      confirmText: m.common.startOver(),
      variant: "danger"
    });
    if (!ok) return;
    draft = cloneTemplate(card.builtIn);
    selectedId = null;
  }

  /** Saves the draft. */
  async function save() {
    const trimmed = draftName.trim();
    if (!trimmed) {
      onerror(m.achievements.cardDesignerErrorNameRequired());
      return;
    }
    saving = true;
    try {
      await onsave(trimmed, cloneTemplate(draft));
      savedJson = json;
      savedName = trimmed;
    } catch (err: any) {
      onerror(err?.message || m.achievements.cardDesignerErrorSave());
    } finally {
      saving = false;
    }
  }

  /** Leaves the designer, asking first when there are unsaved changes. */
  async function close() {
    if (dirty) {
      const ok = await requestConfirmation({
        title: m.achievements.cardDesignerLeaveTitle(),
        message: m.achievements.cardDesignerLeaveMessage(),
        confirmText: m.common.leave(),
        variant: "danger"
      });
      if (!ok) return;
    }
    onclose();
  }

  /**
   * Inserts a placeholder at the end of the selected text element.
   * @param placeholder The placeholder
   */
  function insertPlaceholder(placeholder: string) {
    if (!selected) return;
    selected.text = `${selected.text}${selected.text && !selected.text.endsWith(" ") ? " " : ""}${placeholder}`
      .slice(0, card.limits.maxText);
  }

  /**
   * A number from an input, or the fallback when it isn't one.
   * @param event The input event
   * @param fallback The value to keep
   */
  function num(event: Event, fallback: number): number {
    const value = Number((event.currentTarget as HTMLInputElement).value);
    return Number.isFinite(value) ? value : fallback;
  }

  const inputStyle = $derived(`background: ${$colorStore.primary}08; border-color: ${$colorStore.primary}30; color: ${$colorStore.text};`);
</script>

<svelte:window onkeydown={onKey} onpointermove={moveDrag} onpointerup={endDrag} />

{#snippet field(label: string, value: number, apply: (v: number) => void, step = 1, min = -5000, max = 5000)}
  <label class="block text-xs" style="color: {$colorStore.muted}">
    {label}
    <input type="number" {step} {min} {max} {value}
           class="mt-1 w-full px-2.5 py-2 rounded-lg border text-sm min-h-[40px]" style={inputStyle}
           onchange={(e) => apply(num(e, value))} />
  </label>
{/snippet}

{#snippet segmented(label: string, options: { id: string; label: string }[], value: string, apply: (v: string) => void)}
  <div class="space-y-1">
    <span class="text-xs block" style="color: {$colorStore.muted}">{label}</span>
    <div class="flex rounded-lg p-1 gap-1" style="background: {$colorStore.primary}10;" role="group" aria-label={label}>
      {#each options as option (option.id)}
        <button type="button" aria-pressed={value === option.id}
                class="flex-1 px-2 py-1.5 rounded-md text-xs font-medium min-h-[32px]"
                style="background: {value === option.id ? $colorStore.primary + '30' : 'transparent'}; color: {value === option.id ? $colorStore.primary : $colorStore.text};"
                onclick={() => apply(option.id)}>{option.label}</button>
      {/each}
    </div>
  </div>
{/snippet}

{#snippet section(title: string)}
  <h4 class="text-xs font-semibold uppercase tracking-wide pt-2" style="color: {$colorStore.muted}">{title}</h4>
{/snippet}

<div class="space-y-4" in:fade={{ duration: 150 }}>
  <div class="rounded-2xl border p-3 md:p-4 flex flex-col lg:flex-row lg:items-center gap-3"
       style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15, {$colorStore.gradientEnd}10);
              border-color: {$colorStore.primary}30;">
    <div class="flex items-center gap-2 flex-1 min-w-0">
      <button type="button" class="w-[44px] h-[44px] rounded-xl flex items-center justify-center shrink-0"
              style="background: {$colorStore.primary}10; color: {$colorStore.text};" aria-label={m.achievements.cardDesignerAriaBack()}
              onclick={close}>
        <i class="fa-solid fa-arrow-left" aria-hidden="true"></i>
      </button>
      <input type="text" bind:value={draftName} maxlength={card.limits.nameLength} aria-label={m.achievements.cardDesignerAriaDesignName()}
             class="flex-1 min-w-0 px-3 h-[44px] rounded-xl border text-base font-semibold" style={inputStyle} />
    </div>
    <div class="flex flex-wrap items-center gap-2">
      <div class="flex h-[44px] rounded-xl p-1 gap-1" style="background: {$colorStore.primary}10;" role="group" aria-label={m.common.state()}>
        {#each [{ id: false, label: m.common.unlocked() }, { id: true, label: m.common.locked() }] as option (option.id)}
          <button type="button" aria-pressed={locked === option.id}
                  class="px-3 h-full rounded-lg text-xs font-medium"
                  style="background: {locked === option.id ? $colorStore.primary + '30' : 'transparent'}; color: {locked === option.id ? $colorStore.primary : $colorStore.text};"
                  onclick={() => { locked = option.id; }}>{option.label}</button>
        {/each}
      </div>
      <div class="w-80">
        <DiscordSelector type="custom" options={sampleOptions} selected={sample?.key ?? null} ariaLabel={m.achievements.cardDesignerAriaSample()}
                         placeholder={m.achievements.cardDesignerAriaSample()} customIcon="fa-crown"
                         onchange={(d) => { if (typeof d.selected === "string") sampleKey = d.selected; }} />
      </div>
      <button type="button" class="w-[44px] h-[44px] rounded-xl disabled:opacity-40" aria-label={m.common.undo()}
              style="background: {$colorStore.primary}10; color: {$colorStore.text};" disabled={undoStack.length === 0} onclick={undo}>
        <i class="fa-solid fa-rotate-left" aria-hidden="true"></i>
      </button>
      <button type="button" class="w-[44px] h-[44px] rounded-xl disabled:opacity-40" aria-label={m.common.redo()}
              style="background: {$colorStore.primary}10; color: {$colorStore.text};" disabled={redoStack.length === 0} onclick={redo}>
        <i class="fa-solid fa-rotate-right" aria-hidden="true"></i>
      </button>
      <button type="button" class="px-4 h-[44px] rounded-xl text-sm font-semibold disabled:opacity-50"
              style="background: {$colorStore.primary}20; color: {$colorStore.primary}; border: 1px solid {$colorStore.primary}30;" disabled={!(dirty || isNew) || saving} onclick={save}>
        <i class="fa-solid {saving ? 'fa-spinner fa-spin' : 'fa-floppy-disk'} mr-1" aria-hidden="true"></i>
        {dirty || isNew ? m.common.save() : m.common.saved()}
      </button>
    </div>
  </div>

  <div class="grid grid-cols-1 xl:grid-cols-[260px_1fr_320px] gap-4 items-start">
    <aside class="rounded-2xl border p-3 space-y-2 order-2 xl:order-1"
           style="background: {$colorStore.primary}05; border-color: {$colorStore.primary}20;">
      <div class="flex items-center justify-between">
        <h3 class="text-sm font-semibold" style="color: {$colorStore.text}">{m.xp.editorLayers()}</h3>
        <button type="button" class="px-2.5 py-1.5 rounded-lg text-xs font-medium min-h-[32px]"
                style="background: {$colorStore.primary}20; color: {$colorStore.primary};" aria-expanded={showAdd}
                onclick={() => { showAdd = !showAdd; }}>
          <i class="fa-solid fa-plus mr-1" aria-hidden="true"></i>{m.common.add()}
        </button>
      </div>
      {#if showAdd}
        <div class="grid grid-cols-2 gap-1.5" transition:fade={{ duration: 100 }}>
          {#each CUSTOM_TYPES as type (type)}
            <button type="button" class="flex items-center gap-2 px-2 py-2 rounded-lg text-xs min-h-[36px]"
                    style="background: {$colorStore.primary}10; color: {$colorStore.text};" onclick={() => add(type)}>
              <DuoIcon icon={ELEMENT_KINDS[type].icon} size={14} />{ELEMENT_KINDS[type].label()}
            </button>
          {/each}
        </div>
      {/if}
      <button type="button" class="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-sm text-left min-h-[40px]"
              style="background: {selectedId === null ? $colorStore.primary + '20' : 'transparent'}; color: {$colorStore.text};"
              onclick={() => { selectedId = null; }}>
        <DuoIcon icon="fa-id-card" size={14} />{m.achievements.cardDesignerCardAndBackground()}
      </button>
      <ul class="space-y-1 max-h-[520px] overflow-y-auto pr-1" aria-label={m.xp.editorLayers()}
          use:dragHandleZone={{ items: layerItems, flipDurationMs: 150, dropTargetStyle: {} }}
          onconsider={(e) => { layerItems = e.detail.items; }}
          onfinalize={dropLayer}>
        {#each layerItems as item (item.id)}
          {@const element = item.element}
          {@const active = selectedId === element.id}
          <li class="flex items-center gap-1 rounded-lg"
              style="background: {active ? $colorStore.primary + '20' : 'transparent'};"
              animate:flip={{ duration: 150 }}>
            <span use:dragHandle aria-label={m.achievements.categoriesDragLabel({ name: elementName(element) })}
                  class="w-5 h-[38px] flex items-center justify-center shrink-0 cursor-grab touch-none text-xs"
                  style="color: {$colorStore.muted};">
              <i class="fa-solid fa-grip-vertical" aria-hidden="true"></i>
            </span>
            <button type="button" class="flex-1 min-w-0 flex items-center gap-2 px-2 py-2 text-sm text-left min-h-[38px]"
                    style="color: {element.visible ? $colorStore.text : $colorStore.muted};"
                    onclick={() => { selectedId = element.id; }}>
              <DuoIcon icon={ELEMENT_KINDS[element.type]?.icon ?? "fa-square"} size={14} />
              <span class="truncate">{elementName(element)}</span>
            </button>
            <button type="button" class="w-7 h-7 rounded-md text-xs" aria-label={element.visible ? m.achievements.cardDesignerAriaHideLayer({ name: elementName(element) }) : m.achievements.cardDesignerAriaShowLayer({ name: elementName(element) })}
                    style="color: {$colorStore.muted};" onclick={() => { element.visible = !element.visible; }}>
              <i class="fa-solid {element.visible ? 'fa-eye' : 'fa-eye-slash'}" aria-hidden="true"></i>
            </button>
            <button type="button" class="w-7 h-7 rounded-md text-xs" aria-label={m.achievements.cardDesignerAriaBringForward({ name: elementName(element) })}
                    style="color: {$colorStore.muted};" onclick={() => reorder(element.id, 1)}>
              <i class="fa-solid fa-chevron-up" aria-hidden="true"></i>
            </button>
            <button type="button" class="w-7 h-7 rounded-md text-xs" aria-label={m.achievements.cardDesignerAriaSendBack({ name: elementName(element) })}
                    style="color: {$colorStore.muted};" onclick={() => reorder(element.id, -1)}>
              <i class="fa-solid fa-chevron-down" aria-hidden="true"></i>
            </button>
          </li>
        {/each}
      </ul>
    </aside>

    <section class="order-1 xl:order-2 space-y-2 min-w-0">
      <div class="rounded-2xl border p-3 md:p-4" style="background: {$colorStore.primary}05; border-color: {$colorStore.primary}20;">
        <div class="relative w-full select-none touch-none" bind:clientWidth={canvasWidth}
             style="aspect-ratio: {outerWidth} / {outerHeight};"
             role="presentation" onpointerdown={() => { selectedId = null; }}>
          {#if preview}
            <img src={preview.image} alt={m.achievements.cardDesignerAriaPreview()} class="absolute inset-0 w-full h-full pointer-events-none" draggable="false" />
          {/if}
          {#each draft.elements as element (element.id)}
            {#if element.visible}
              {@const box = boxOf(element)}
              {@const active = selectedId === element.id}
              <div class="absolute rounded-sm"
                   role="button" tabindex="-1" aria-label={m.achievements.librarySelectLabel({ name: elementName(element) })}
                   style="left: {box.left}%; top: {box.top}%; width: {box.width}%; height: {box.height}%;
                          transform: rotate({element.rotation}deg);
                          outline: {active ? `2px solid ${$colorStore.primary}` : box.drawn ? `1px dashed ${$colorStore.text}25` : 'none'};
                          cursor: move; z-index: {active ? 20 : 10};"
                   onpointerdown={(e) => startDrag(e, element, "move")}>
                {#if active}
                  <span class="absolute -right-2 -bottom-2 w-4 h-4 rounded-sm"
                        style="background: {$colorStore.primary}; cursor: nwse-resize;" role="presentation"
                        onpointerdown={(e) => startDrag(e, element, "resize")}></span>
                {/if}
              </div>
            {/if}
          {/each}
          {#if previewing}
            <span class="absolute top-2 right-2 text-xs px-2 py-1 rounded-md" style="background: #000a; color: #fff;">
              <i class="fa-solid fa-spinner fa-spin" aria-hidden="true"></i>
              <span class="sr-only">{m.achievements.cardDesignerDrawing()}</span>
            </span>
          {/if}
        </div>
      </div>
      <div class="flex flex-wrap items-center gap-3 text-xs" style="color: {$colorStore.muted}">
        <label class="flex items-center gap-2">
          <input type="checkbox" bind:checked={snap} style="accent-color: {$colorStore.primary}" />
          {m.achievements.cardDesignerSnap()}
        </label>
        <span>{m.achievements.cardDesignerShortcutsHint()}</span>
      </div>
    </section>

    <aside class="rounded-2xl border p-3 space-y-3 order-3"
           style="background: {$colorStore.primary}05; border-color: {$colorStore.primary}20;">
      {#if selected}
        {@const kind = ELEMENT_KINDS[selected.type]}
        <div class="flex items-center gap-2">
          <DuoIcon icon={kind?.icon ?? "fa-square"} size={18} />
          <div class="flex-1 min-w-0">
            <h3 class="text-sm font-semibold truncate" style="color: {$colorStore.text}">{elementName(selected)}</h3>
            <p class="text-xs" style="color: {$colorStore.muted}">{kind?.hint()}</p>
          </div>
        </div>
        <div class="flex flex-wrap gap-2">
          {#if isBuiltIn(selected.type)}
            <button type="button" class="px-2.5 py-1.5 rounded-lg text-xs min-h-[32px]"
                    style="background: {$colorStore.primary}10; color: {$colorStore.text};" onclick={resetSelected}>{m.common.reset()}</button>
          {:else}
            <button type="button" class="px-2.5 py-1.5 rounded-lg text-xs min-h-[32px]"
                    style="background: {$colorStore.primary}10; color: {$colorStore.text};" onclick={() => duplicate(selected!)}>{m.common.duplicate()}</button>
            <button type="button" class="px-2.5 py-1.5 rounded-lg text-xs min-h-[32px]"
                    style="background: #ef444420; color: #ef4444;" onclick={() => removeElement(selected!.id)}>{m.common.delete()}</button>
          {/if}
        </div>

        <label class="block text-xs" style="color: {$colorStore.muted}">
          {m.achievements.cardDesignerLayerName()}
          <input type="text" value={selected.name} maxlength="40" placeholder={kind?.label()}
                 class="mt-1 w-full px-2.5 py-2 rounded-lg border text-sm min-h-[40px]" style={inputStyle}
                 oninput={(e) => { selected!.name = e.currentTarget.value; }} />
        </label>
        {@render segmented(m.achievements.cardDesignerShowOn(), [{ id: "always", label: m.achievements.cardDesignerShowAll() }, { id: "unlocked", label: m.common.unlocked() }, { id: "locked", label: m.common.locked() }],
          selected.show, (v) => { selected!.show = v as AchievementCardElement["show"]; })}

        {@render section(m.xp.editorPosition())}
        <div class="grid grid-cols-2 gap-2">
          {@render field(m.achievements.cardDesignerX(), selected.x, (v) => { selected!.x = v; })}
          {@render field(m.achievements.cardDesignerY(), selected.y, (v) => { selected!.y = v; })}
          {@render field(m.xp.editorWidth(), selected.w, (v) => { selected!.w = Math.max(1, v); }, 1, 1)}
          {@render field(m.xp.editorHeight(), selected.h, (v) => { selected!.h = Math.max(1, v); }, 1, 1)}
          {@render field(m.xp.editorRotation(), selected.rotation, (v) => { selected!.rotation = v; }, 1, -360, 360)}
          <label class="block text-xs" style="color: {$colorStore.muted}">
            {m.xp.editorOpacityPercent({ percent: Math.round(selected.opacity * 100) })}
            <input type="range" min="0" max="1" step="0.05" value={selected.opacity} class="w-full mt-3"
                   style="accent-color: {$colorStore.primary}" oninput={(e) => { selected!.opacity = Number(e.currentTarget.value); }} />
          </label>
        </div>
        <div class="space-y-1">
          <span class="text-xs block" style="color: {$colorStore.muted}">{m.achievements.cardDesignerMovesDownWhenWraps()}</span>
          <DiscordSelector type="custom" options={followOptions} selected={selected.followId} searchable={false}
                           ariaLabel={m.achievements.cardDesignerMovesDownWhenWraps()}
                           onchange={(d) => { selected!.followId = typeof d.selected === "string" ? d.selected : ""; }} />
        </div>

        {#if selected.type === "text"}
          {@render section(m.common.text())}
          <textarea rows="3" maxlength={card.limits.maxText} aria-label={m.common.text()} value={selected.text}
                    class="w-full px-2.5 py-2 rounded-lg border text-sm" style={inputStyle}
                    oninput={(e) => { selected!.text = e.currentTarget.value; }}></textarea>
          <div class="flex flex-wrap gap-1">
            {#each card.placeholders as placeholder (placeholder)}
              <button type="button" class="px-1.5 py-1 rounded-md text-[11px] font-mono"
                      style="background: {$colorStore.primary}10; color: {$colorStore.primary};"
                      onclick={() => insertPlaceholder(placeholder)}>{placeholder}</button>
            {/each}
          </div>
        {/if}

        {#if selected.type === "glyph"}
          {@render section(m.achievements.editorIconLabel())}
          <GlyphField label={m.achievements.editorIconLabel()} value={selected.glyph} {onerror} onchange={(v) => { selected!.glyph = v; }} />
          <ColorTokenField label={m.common.color()} value={selected.color} palette={card.palette} grade={gradeColor}
                           onchange={(v) => { selected!.color = v; }} />
          <ColorTokenField label={m.achievements.cardDesignerBackLayer()} value={selected.color3} palette={card.palette} grade={gradeColor} allowNone
                           onchange={(v) => { selected!.color3 = v; }} />
        {/if}

        {#if selected.type === "image"}
          {@render section(m.common.image())}
          <CardImageField label={m.common.image()} value={selected.url} images={card.images} {onimages} {onerror}
                          onchange={(v) => { selected!.url = v; }} />
          {@render segmented(m.achievements.cardDesignerFit(), [{ id: "cover", label: m.common.fill() }, { id: "contain", label: m.achievements.cardDesignerFitInside() }], selected.fit,
            (v) => { selected!.fit = v as "cover" | "contain"; })}
        {/if}

        {#if TEXT_TYPES.includes(selected.type) || PILL_TYPES.includes(selected.type)}
          {@render section(m.common.type())}
          <div class="grid grid-cols-2 gap-2">
            {@render field(m.xp.editorSize(), selected.fontSize, (v) => { selected!.fontSize = v; }, 1, 8, 200)}
            {@render field(m.achievements.cardDesignerLetterSpacing(), selected.spacing, (v) => { selected!.spacing = v; }, 0.1, -5, 40)}
            {#if ["title", "description", "text"].includes(selected.type)}
              {@render field(m.achievements.cardDesignerLineHeight(), selected.lineHeight, (v) => { selected!.lineHeight = v; }, 0.05, 0.8, 3)}
              {@render field(m.achievements.cardDesignerMaxLines(), selected.maxLines, (v) => { selected!.maxLines = Math.round(v); }, 1, 1, 6)}
            {/if}
          </div>
          {@render segmented(m.achievements.cardDesignerAlign(), [{ id: "left", label: m.common.left() }, { id: "center", label: m.xp.editorTextAlignCenter() }, { id: "right", label: m.xp.editorDirectionRight() }],
            selected.align, (v) => { selected!.align = v as "left" | "center" | "right"; })}
          <ToggleRow title={m.achievements.cardDesignerBold()} colors={$colorStore} checked={selected.bold} onchange={(v) => { selected!.bold = v; }} />
          <ToggleRow title={m.achievements.cardDesignerCapitals()} colors={$colorStore} checked={selected.uppercase} onchange={(v) => { selected!.uppercase = v; }} />
          <ColorTokenField label={selected.type === "member" ? m.achievements.cardDesignerNameColor() : m.achievements.cardDesignerTextColor()} value={selected.color}
                           palette={card.palette} grade={gradeColor} onchange={(v) => { selected!.color = v; }} />
          {#if selected.type === "member"}
            <ColorTokenField label={m.achievements.cardDesignerServerColor()} value={selected.color2} palette={card.palette} grade={gradeColor}
                             onchange={(v) => { selected!.color2 = v; }} />
          {/if}
          {#if ["label", "text", ...PILL_TYPES].includes(selected.type)}
            <GlyphField label={m.achievements.cardDesignerIconBesideText()} value={selected.glyph} {onerror}
                        emptyLabel={["label", "grade", "category"].includes(selected.type) ? m.achievements.cardDesignerAutomatic() : m.achievements.cardDesignerNoIcon()}
                        allowNone={["label", "grade", "category"].includes(selected.type)}
                        onchange={(v) => { selected!.glyph = v; }} />
            <ColorTokenField label={m.achievements.cardDesignerIconColor()} value={selected.color2} palette={card.palette} grade={gradeColor}
                             onchange={(v) => { selected!.color2 = v; }} />
            <ColorTokenField label={m.achievements.cardDesignerIconBackLayer()} value={selected.color3} palette={card.palette} grade={gradeColor} allowNone
                             onchange={(v) => { selected!.color3 = v; }} />
          {/if}
        {/if}

        {#if PILL_TYPES.includes(selected.type)}
          {@render section(m.achievements.cardDesignerBadge())}
          <ToggleRow title={m.achievements.cardDesignerShrinkToText()} subtitle={m.achievements.cardDesignerShrinkToTextHint()} colors={$colorStore}
                     checked={selected.autoWidth} onchange={(v) => { selected!.autoWidth = v; }} />
          <div class="space-y-1">
            <span class="text-xs block" style="color: {$colorStore.muted}">{m.achievements.cardDesignerSitsBeside()}</span>
            <DiscordSelector type="custom" options={besideOptions} selected={selected.besideId} searchable={false}
                             ariaLabel={m.achievements.cardDesignerSitsBeside()}
                             onchange={(d) => { selected!.besideId = typeof d.selected === "string" ? d.selected : ""; }} />
          </div>
          {#if selected.besideId}
            {@render field(m.achievements.cardDesignerGap(), selected.gap, (v) => { selected!.gap = v; }, 1, -200, 200)}
          {/if}
        {/if}

        {#if selected.type === "icon"}
          {@render section(m.achievements.editorIconLabel())}
          <ColorTokenField label={m.achievements.cardDesignerIconColor()} value={selected.color} palette={card.palette} grade={gradeColor}
                           onchange={(v) => { selected!.color = v; }} />
          <ColorTokenField label={m.achievements.cardDesignerIconBackLayer()} value={selected.color3} palette={card.palette} grade={gradeColor} allowNone
                           onchange={(v) => { selected!.color3 = v; }} />
        {/if}

        {#if selected.type === "progress"}
          {@render section(m.achievements.cardDesignerBar())}
          <ColorTokenField label={m.achievements.cardDesignerBar()} value={selected.color} palette={card.palette} grade={gradeColor}
                           onchange={(v) => { selected!.color = v; }} />
          <ColorTokenField label={m.achievements.cardDesignerBarFadesTo()} value={selected.fill2} palette={card.palette} grade={gradeColor} allowNone
                           onchange={(v) => { selected!.fill2 = v; }} />
          <ColorTokenField label={m.common.track()} value={selected.fill} palette={card.palette} grade={gradeColor} allowNone
                           onchange={(v) => { selected!.fill = v; }} />
          <ColorTokenField label={m.achievements.cardDesignerCountText()} value={selected.color2} palette={card.palette} grade={gradeColor} allowNone
                           onchange={(v) => { selected!.color2 = v; }} />
          {@render field(m.achievements.cardDesignerCountTextSize(), selected.fontSize, (v) => { selected!.fontSize = v; }, 1, 8, 200)}
        {/if}

        {#if SHAPE_TYPES.includes(selected.type) && selected.type !== "progress" || selected.type === "image"}
          {@render section(m.achievements.cardDesignerShape())}
          {#if selected.type !== "image"}
            <ColorTokenField label={selected.type === "avatar" ? m.achievements.cardDesignerFillWithoutAvatar() : m.common.fill()} value={selected.fill}
                             palette={card.palette} grade={gradeColor} allowNone onchange={(v) => { selected!.fill = v; }} />
            {#if selected.fill && ["rectangle", "ellipse", "icon", ...PILL_TYPES].includes(selected.type)}
              <ColorTokenField label={m.achievements.cardDesignerFillFadesTo()} value={selected.fill2} palette={card.palette} grade={gradeColor} allowNone
                               onchange={(v) => { selected!.fill2 = v; }} />
              {#if selected.fill2}
                {@render field(m.achievements.cardDesignerFadeAngle(), selected.fillAngle, (v) => { selected!.fillAngle = v; }, 1, -360, 360)}
              {/if}
            {/if}
          {/if}
          <ColorTokenField label={m.achievements.cardDesignerOutline()} value={selected.stroke} palette={card.palette} grade={gradeColor} allowNone
                           onchange={(v) => { selected!.stroke = v; }} />
          <div class="grid grid-cols-2 gap-2">
            {#if selected.stroke}
              {@render field(m.achievements.cardDesignerOutlineWidth(), selected.strokeWidth, (v) => { selected!.strokeWidth = v; }, 0.5, 0, 40)}
            {/if}
            {#if selected.type !== "ellipse"}
              {@render field(m.achievements.cardDesignerCornerRadius(), selected.radius, (v) => { selected!.radius = v; }, 1, 0, 1000)}
            {/if}
          </div>
          {#if selected.type === "rectangle" || selected.type === "ellipse"}
            <ColorTokenField label={m.xp.editorShadow()} value={selected.shadowColor} palette={card.palette} grade={gradeColor} allowNone
                             onchange={(v) => { selected!.shadowColor = v; if (v && !selected!.shadowBlur) selected!.shadowBlur = 16; }} />
            {#if selected.shadowColor}
              <div class="grid grid-cols-3 gap-2">
                {@render field(m.achievements.cardDesignerBlur(), selected.shadowBlur, (v) => { selected!.shadowBlur = v; }, 1, 0, 60)}
                {@render field(m.achievements.cardDesignerX(), selected.shadowX, (v) => { selected!.shadowX = v; }, 1, -100, 100)}
                {@render field(m.achievements.cardDesignerY(), selected.shadowY, (v) => { selected!.shadowY = v; }, 1, -100, 100)}
              </div>
            {/if}
          {/if}
        {/if}
      {:else}
        <div class="flex items-center gap-2">
          <DuoIcon icon="fa-id-card" size={18} />
          <h3 class="text-sm font-semibold" style="color: {$colorStore.text}">{m.achievements.cardDesignerCardAndBackground()}</h3>
        </div>
        {@render section(m.xp.editorSize())}
        <div class="grid grid-cols-2 gap-2">
          {@render field(m.xp.editorWidth(), draft.width, (v) => { draft.width = Math.min(card.limits.maxWidth, Math.max(card.limits.minWidth, Math.round(v))); }, 10, card.limits.minWidth, card.limits.maxWidth)}
          {@render field(m.xp.editorHeight(), draft.height, (v) => { draft.height = Math.min(card.limits.maxHeight, Math.max(card.limits.minHeight, Math.round(v))); }, 10, card.limits.minHeight, card.limits.maxHeight)}
          {@render field(m.achievements.cardDesignerCornerRadius(), draft.radius, (v) => { draft.radius = Math.max(0, v); }, 1, 0, 450)}
          {@render field(m.xp.editorBorderWidth(), draft.borderWidth, (v) => { draft.borderWidth = Math.max(0, v); }, 0.5, 0, 20)}
        </div>
        <ColorTokenField label={m.xp.editorBorder()} value={draft.borderColor} palette={card.palette} grade={gradeColor} allowNone
                         onchange={(v) => { draft.borderColor = v; }} />
        <ToggleRow title={m.achievements.cardDesignerShadowUnderCard()} colors={$colorStore} checked={draft.shadow}
                   onchange={(v) => { draft.shadow = v; }} />

        {@render section(m.xp.editorBackground())}
        {@render segmented(m.common.fill(), [{ id: "palette", label: m.achievements.cardDesignerKindPalette() }, { id: "solid", label: m.achievements.cardDesignerKindSolid() }, { id: "gradient", label: m.achievements.cardDesignerKindGradient() }, { id: "image", label: m.common.image() }],
          draft.background.kind, (v) => { draft.background.kind = v as AchievementCardTemplate["background"]["kind"]; })}
        {#if draft.background.kind === "palette"}
          <p class="text-xs" style="color: {$colorStore.muted}">{m.achievements.cardDesignerPaletteHint()}</p>
        {:else}
          {#if draft.background.kind === "solid" || draft.background.kind === "gradient"}
            <ColorTokenField label={draft.background.kind === "solid" ? m.common.color() : m.common.from()} value={draft.background.color}
                             palette={card.palette} grade={gradeColor} onchange={(v) => { draft.background.color = v; }} />
          {/if}
          {#if draft.background.kind === "gradient"}
            <ColorTokenField label={m.achievements.cardDesignerTo()} value={draft.background.color2} palette={card.palette} grade={gradeColor}
                             onchange={(v) => { draft.background.color2 = v; }} />
            {@render field(m.xp.editorAngle(), draft.background.angle, (v) => { draft.background.angle = v; }, 1, -360, 360)}
          {/if}
          {#if draft.background.kind === "image"}
            <CardImageField label={m.common.image()} value={draft.background.url} images={card.images} {onimages} {onerror}
                            onchange={(v) => { draft.background.url = v; }} />
            {@render segmented(m.achievements.cardDesignerFit(), [{ id: "cover", label: m.common.fill() }, { id: "contain", label: m.achievements.cardDesignerFitInside() }], draft.background.fit,
              (v) => { draft.background.fit = v as "cover" | "contain"; })}
            <label class="block text-xs" style="color: {$colorStore.muted}">
              {m.achievements.cardDesignerDarken({ percent: Math.round(draft.background.dim * 100) })}
              <input type="range" min="0" max="1" step="0.05" value={draft.background.dim} class="w-full"
                     style="accent-color: {$colorStore.primary}" oninput={(e) => { draft.background.dim = Number(e.currentTarget.value); }} />
            </label>
          {/if}
          <ToggleRow title={m.achievements.cardDesignerPaletteWash()} subtitle={m.achievements.cardDesignerPaletteWashHint()} colors={$colorStore}
                     checked={draft.background.wash} onchange={(v) => { draft.background.wash = v; }} />
        {/if}

        <div class="pt-2">
          <button type="button" class="w-full px-3 py-2 rounded-lg text-sm min-h-[40px]"
                  style="background: {$colorStore.primary}10; color: {$colorStore.text};" onclick={resetAll}>
            {m.achievements.cardDesignerStartOver()}
          </button>
        </div>
      {/if}
    </aside>
  </div>
</div>
