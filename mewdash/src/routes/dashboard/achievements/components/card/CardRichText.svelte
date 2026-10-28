<script lang="ts">
  import { onMount } from "svelte";
  import { get } from "svelte/store";
  import { colorStore } from "$lib/stores/colorStore";
  import { unicodeEmojiStore } from "$lib/stores/unicodeEmojiStore";
  import type { GuildEmojiInfo } from "$lib/api/client/models";
  import Portal from "$lib/components/ui/Portal.svelte";

  /**
   * Edits card text with emoji, icons, and placeholders shown as themselves instead of as their codes.
   */
  interface Props {
    value: string;
    placeholders: string[];
    guildEmojis?: GuildEmojiInfo[];
    placeholder?: string;
    multiline?: boolean;
    maxLength?: number;
    autofocus?: boolean;
    editable?: boolean;
    class?: string;
    style?: string;
    ariaLabel?: string;
    onchange: (value: string) => void;
    oncommit?: () => void;
    oncancel?: () => void;
    onbackspacestart?: () => void;
  }

  let {
    value, placeholders, guildEmojis = [], placeholder = "", multiline = true, maxLength = 300, autofocus = false, editable = true,
    class: extra = "", style = "", ariaLabel, onchange, oncommit, oncancel, onbackspacestart
  }: Props = $props();

  type Suggestion = { token: string; name: string; url?: string; unicode?: string };

  let query: { node: Text; start: number; end: number } | null = null;
  let suggestions = $state<Suggestion[]>([]);
  let active = $state(0);
  let popup = $state<{ x: number; y: number } | null>(null);

  const TOKEN = /(<a?:[A-Za-z0-9_~]{2,32}:\d{17,20}>|\{icon:[A-Za-z0-9-]{1,40}\}|%[a-z.]+%|\n)/;

  let editor = $state<HTMLDivElement>();
  let range: Range | null = null;
  let emitted: string | null = null;

  $effect(() => {
    const next = value;
    if (editor && next !== emitted) render(next);
  });

  onMount(() => {
    const track = () => {
      const selection = document.getSelection();
      if (editor && selection?.rangeCount && editor.contains(selection.anchorNode)) range = selection.getRangeAt(0).cloneRange();
      if (popup) findQuery();
    };
    document.addEventListener("selectionchange", track);
    if (autofocus) focusEnd();
    return () => document.removeEventListener("selectionchange", track);
  });

  function tokenNode(token: string): Node {
    const emoji = token.match(/^<(a?):([A-Za-z0-9_~]+):(\d+)>$/);
    if (emoji) {
      const img = document.createElement("img");
      img.src = `https://cdn.discordapp.com/emojis/${emoji[3]}.${emoji[1] ? "gif" : "png"}?size=48`;
      img.alt = `:${emoji[2]}:`;
      img.dataset.token = token;
      img.draggable = false;
      img.className = "inline-block h-[1.15em] w-auto align-[-0.2em] mx-[0.05em]";
      return img;
    }
    const chip = document.createElement("span");
    chip.contentEditable = "false";
    chip.dataset.token = token;
    const icon = token.match(/^\{icon:([A-Za-z0-9-]+)\}$/);
    if (icon) {
      chip.className = "inline-block mx-[0.1em]";
      const glyph = document.createElement("i");
      glyph.className = `fa-utility-duo fa-regular fa-${icon[1]}`;
      glyph.style.setProperty("--fa-primary-color", "currentColor");
      glyph.style.setProperty("--fa-secondary-color", "currentColor");
      chip.append(glyph);
      return chip;
    }
    chip.className = "inline-block px-1.5 mx-[0.1em] rounded-md text-[0.8em] font-mono align-[0.05em] bg-current/15";
    chip.textContent = token;
    return chip;
  }

  function isToken(part: string): boolean {
    return /^(<a?:|\{icon:)/.test(part) || placeholders.includes(part);
  }

  function render(text: string) {
    if (!editor) return;
    const nodes: Node[] = [];
    for (const part of text.split(TOKEN)) {
      if (!part) continue;
      if (part === "\n") nodes.push(document.createElement("br"));
      else if (isToken(part)) nodes.push(tokenNode(part));
      else nodes.push(document.createTextNode(part));
    }
    // eslint-disable-next-line svelte/no-dom-manipulating
    editor.replaceChildren(...nodes);
    emitted = text;
  }

  function serialize(node: Node): string {
    let out = "";
    node.childNodes.forEach((child) => {
      if (child.nodeType === Node.TEXT_NODE) {
        out += (child.textContent ?? "").replace(/​/g, "");
      } else if (child instanceof HTMLElement) {
        if (child.dataset.token) out += child.dataset.token;
        else if (child.tagName === "BR") out += "\n";
        else {
          if ((child.tagName === "DIV" || child.tagName === "P") && out && !out.endsWith("\n")) out += "\n";
          out += serialize(child);
        }
      }
    });
    return out;
  }

  function emit() {
    if (!editor) return;
    let text = serialize(editor).replace(/\n+$/, "");
    if (!multiline) text = text.replace(/\n/g, " ");
    if (text.length > maxLength) {
      render(emitted ?? "");
      focusEnd();
      return;
    }
    emitted = text;
    onchange(text);
  }

  function focusEnd() {
    if (!editor) return;
    editor.focus();
    const end = document.createRange();
    end.selectNodeContents(editor);
    end.collapse(false);
    const selection = document.getSelection();
    selection?.removeAllRanges();
    selection?.addRange(end);
    range = end.cloneRange();
  }

  /**
   * Puts an emoji, icon, placeholder, or plain text in where the cursor was, or at the end.
   * @param token What to insert
   */
  export function insert(token: string) {
    place(token, null);
  }

  function place(token: string, over: Range | null) {
    if (!editor) return;
    const replaced = over?.toString().length ?? 0;
    if ((emitted ?? "").length - replaced + token.length > maxLength) return;
    editor.focus();
    const selection = document.getSelection();
    const at = over ?? (range && editor.contains(range.startContainer) ? range : null);
    if (!at) focusEnd();
    const target = (at ?? range)!;
    selection?.removeAllRanges();
    selection?.addRange(target);
    target.deleteContents();
    const node = isToken(token) ? tokenNode(token) : document.createTextNode(token);
    target.insertNode(node);
    const after = document.createRange();
    after.setStartAfter(node);
    after.collapse(true);
    selection?.removeAllRanges();
    selection?.addRange(after);
    range = after.cloneRange();
    emit();
  }

  function close() {
    query = null;
    popup = null;
    suggestions = [];
  }

  function search(term: string): Suggestion[] {
    const lower = term.toLowerCase();
    const rank = (name: string) => (name.toLowerCase().startsWith(lower) ? 0 : 1);
    const server = guildEmojis.flatMap((g) => g.emojis)
      .filter((e) => e.name.toLowerCase().includes(lower))
      .sort((a, b) => rank(a.name) - rank(b.name))
      .slice(0, 5)
      .map((e) => ({ token: `<${e.animated ? "a" : ""}:${e.name}:${e.id}>`, name: e.name, url: e.url }));
    const unicode = get(unicodeEmojiStore)
      .filter((e) => e.searchTerms.some((t) => t.toLowerCase().includes(lower)))
      .sort((a, b) => rank(a.searchTerms.find((t) => t.toLowerCase().includes(lower)) ?? "") -
        rank(b.searchTerms.find((t) => t.toLowerCase().includes(lower)) ?? ""))
      .slice(0, 8 - server.length)
      .map((e) => ({ token: e.unicode, name: e.searchTerms.find((t) => t.toLowerCase().includes(lower)) ?? e.name, unicode: e.unicode }));
    return [...server, ...unicode];
  }

  function exact(name: string): Suggestion | null {
    const emoji = guildEmojis.flatMap((g) => g.emojis).find((e) => e.name === name);
    if (emoji) return { token: `<${emoji.animated ? "a" : ""}:${emoji.name}:${emoji.id}>`, name: emoji.name };
    const unicode = get(unicodeEmojiStore).find((e) => e.searchTerms.includes(name));
    return unicode ? { token: unicode.unicode, name, unicode: unicode.unicode } : null;
  }

  function findQuery() {
    const selection = document.getSelection();
    const node = selection?.anchorNode;
    if (!selection?.isCollapsed || !(node instanceof Text) || !editor?.contains(node)) return close();
    const before = node.data.slice(0, selection.anchorOffset);

    const closed = before.match(/(?:^|\s):([A-Za-z0-9_~+-]{2,32}):$/);
    if (closed) {
      const hit = exact(closed[1]);
      if (hit) {
        const over = document.createRange();
        over.setStart(node, selection.anchorOffset - closed[1].length - 2);
        over.setEnd(node, selection.anchorOffset);
        close();
        place(hit.token, over);
        return;
      }
    }

    const open = before.match(/(?:^|\s):([A-Za-z0-9_~+-]{2,32})$/);
    if (!open) return close();
    if (!unicodeEmojiStore.isLoaded()) unicodeEmojiStore.load().then(() => { if (query) findQuery(); });
    const found = search(open[1]);
    if (!found.length) return close();
    query = { node, start: selection.anchorOffset - open[1].length - 1, end: selection.anchorOffset };
    if (suggestions.map((s) => s.token).join() !== found.map((s) => s.token).join()) active = 0;
    suggestions = found;
    const caret = selection.getRangeAt(0).getBoundingClientRect();
    popup = { x: Math.min(caret.left, window.innerWidth - 272), y: caret.bottom + 6 };
  }

  function pick(suggestion: Suggestion) {
    if (!query) return;
    const over = document.createRange();
    over.setStart(query.node, query.start);
    over.setEnd(query.node, query.end);
    close();
    place(suggestion.token, over);
  }

  function atStart(): boolean {
    const selection = document.getSelection();
    if (!editor || !selection?.rangeCount || !selection.isCollapsed) return false;
    const before = document.createRange();
    before.setStart(editor, 0);
    before.setEnd(selection.anchorNode!, selection.anchorOffset);
    const contents = before.cloneContents();
    return (contents.textContent ?? "") === "" && !contents.querySelector("img, [data-token], br");
  }

  function onkeydown(event: KeyboardEvent) {
    if (popup && suggestions.length) {
      if (event.key === "ArrowDown" || event.key === "ArrowUp") {
        event.preventDefault();
        active = (active + (event.key === "ArrowDown" ? 1 : suggestions.length - 1)) % suggestions.length;
        return;
      }
      if (event.key === "Enter" || event.key === "Tab") {
        event.preventDefault();
        pick(suggestions[active]);
        return;
      }
      if (event.key === "Escape") {
        event.preventDefault();
        event.stopPropagation();
        close();
        return;
      }
    }
    if (event.key === "Backspace" && onbackspacestart && atStart()) {
      event.preventDefault();
      onbackspacestart();
      return;
    }
    if (event.key === "Escape" && oncancel) {
      event.preventDefault();
      oncancel();
    } else if (event.key === "Enter" && (!multiline || event.ctrlKey || event.metaKey) && oncommit) {
      event.preventDefault();
      oncommit();
    } else if (event.key === "Enter") {
      event.preventDefault();
      if (multiline) document.execCommand("insertLineBreak");
    }
  }

  function onpaste(event: ClipboardEvent) {
    event.preventDefault();
    const text = event.clipboardData?.getData("text/plain") ?? "";
    if (!text) return;
    if (TOKEN.test(text)) {
      for (const part of text.split(TOKEN)) {
        if (part === "\n" && multiline) document.execCommand("insertLineBreak");
        else if (part) insert(part === "\n" ? " " : part);
      }
    } else {
      document.execCommand("insertText", false, multiline ? text : text.replace(/\n/g, " "));
    }
  }
</script>

<div bind:this={editor} contenteditable={editable ? "true" : "false"} role="textbox" tabindex={editable ? 0 : -1} aria-multiline={multiline} aria-label={ariaLabel}
     data-placeholder={placeholder} class="rich select-text whitespace-pre-wrap break-words outline-none {extra}" {style}
     oninput={() => { emit(); findQuery(); }} {onkeydown} {onpaste} onblur={close} onpointerdown={(e) => e.stopPropagation()}></div>

{#if popup && suggestions.length}
  <Portal>
    <div class="fixed z-[10000] w-64 py-1 rounded-lg border shadow-2xl backdrop-blur-md overflow-hidden" role="listbox"
         style="left: {popup.x}px; top: {popup.y}px;
                background: linear-gradient(135deg, rgba(0,0,0,0.9), rgba(0,0,0,0.8)), linear-gradient(135deg, {$colorStore.gradientStart}25, {$colorStore.gradientMid}30, {$colorStore.gradientEnd}25);
                border-color: {$colorStore.primary}50; box-shadow: 0 8px 32px rgba(0,0,0,0.4), inset 0 0 0 1px {$colorStore.primary}20;">
      {#each suggestions as suggestion, i (suggestion.token)}
        <button type="button" role="option" aria-selected={i === active}
                class="w-full flex items-center gap-2 px-2.5 py-1.5 text-sm text-left"
                style="background: {i === active ? $colorStore.primary + '30' : 'transparent'}; color: {$colorStore.text};"
                onmousedown={(e) => e.preventDefault()} onmouseenter={() => { active = i; }} onclick={() => pick(suggestion)}>
          {#if suggestion.url}
            <img src={suggestion.url} alt="" class="w-5 h-5 object-contain shrink-0" />
          {:else}
            <span class="w-5 text-center text-base shrink-0">{suggestion.unicode}</span>
          {/if}
          <span class="truncate">:{suggestion.name}:</span>
        </button>
      {/each}
    </div>
  </Portal>
{/if}

<style>
  .rich:empty::before {
    content: attr(data-placeholder);
    opacity: 0.45;
    pointer-events: none;
  }
</style>
