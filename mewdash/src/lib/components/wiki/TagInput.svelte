<!-- lib/components/wiki/TagInput.svelte -->
<script lang="ts">
  import { m } from "$lib/i18n";
  import { colorStore } from "$lib/stores/colorStore";
  import { normalizeTags, wikiLimits } from "$lib/wiki/validation";

  interface Props {
    tags: string[];
    id?: string;
    disabled?: boolean;
  }

  let { tags = $bindable([]), id, disabled = false }: Props = $props();

  let draft = $state("");
  let problem = $state<string | null>(null);

  function add(raw: string) {
    const parts = raw.split(",");
    if (parts.every((part) => !part.trim())) {
      draft = "";
      return;
    }
    const result = normalizeTags([...tags, ...parts]);
    if (!result.ok) {
      problem =
        result.error === "tag_too_long"
          ? m.wikiManage.tagTooLong({ max: wikiLimits.tagMax })
          : m.wikiManage.tagsTooMany({ max: wikiLimits.tagsMax });
      return;
    }
    tags = result.value;
    draft = "";
    problem = null;
  }

  function remove(tag: string) {
    tags = tags.filter((t) => t !== tag);
    problem = null;
  }

  function onkeydown(event: KeyboardEvent) {
    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault();
      add(draft);
    } else if (event.key === "Backspace" && draft === "" && tags.length > 0) {
      remove(tags[tags.length - 1]);
    }
  }
</script>

<div class="space-y-2">
  <div
    class="flex flex-wrap items-center gap-2 p-2 rounded-lg border min-h-[50px]"
    style="background: {$colorStore.primary}10; border-color: {$colorStore.primary}30;"
  >
    {#each tags as tag (tag)}
      <span
        class="flex items-center gap-1 pl-3 rounded-lg text-sm max-w-full"
        style="background: {$colorStore.primary}20; color: {$colorStore.text};"
      >
        <span class="truncate">{tag}</span>
        <button
          type="button"
          class="w-11 h-11 -my-1 flex items-center justify-center shrink-0 disabled:opacity-50"
          aria-label={m.common.ariaRemoveNamed({ name: tag })}
          {disabled}
          onclick={() => remove(tag)}
        >
          <i class="fa-solid fa-xmark" aria-hidden="true"></i>
        </button>
      </span>
    {/each}
    <input
      {id}
      type="text"
      bind:value={draft}
      {onkeydown}
      onblur={() => add(draft)}
      {disabled}
      maxlength={wikiLimits.tagMax * 4}
      autocomplete="off"
      class="flex-1 min-w-[8rem] min-h-[44px] px-2 bg-transparent outline-none"
      style="color: {$colorStore.text};"
    />
  </div>
  {#if problem}
    <p class="text-sm text-red-400" role="alert">{problem}</p>
  {/if}
</div>
