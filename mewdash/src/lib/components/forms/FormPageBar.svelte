<script lang="ts">
  /**
   * The page controls above a form's question list: the tab strip, and the heading and intro of
   * whichever page is being edited.
   *
   * Shared by the create and edit builders so a form is built the same way whichever screen you
   * are on.
   */
  import { type FormPage, type PageableQuestion } from "$lib/api/forms/models";
  import * as pageOps from "$lib/utils/formPages";
  import { colorStore } from "$lib/stores/colorStore";

  interface Props {
    /** The form's questions, replaced whenever a page operation changes them. */
    questions: PageableQuestion[];
    /** The pages those questions split into. */
    pages: FormPage<any>[];
    /** Which page is being edited. */
    activePage: number;
    /**
     * Makes the blank section break a new page is built from. Supplied by the builder, because the
     * create and edit screens number unsaved questions differently.
     */
    createBreak: () => PageableQuestion;
    onQuestionsChange: (questions: any[]) => void;
    onActivePageChange: (page: number) => void;
    /** Told when a move is refused, so the surrounding builder can explain why. */
    onNotify?: (message: string, type: "success" | "error") => void;
  }

  let {
    questions,
    pages,
    activePage,
    createBreak,
    onQuestionsChange,
    onActivePageChange,
    onNotify
  }: Props = $props();

  let currentPage = $derived(pages[activePage]);
  let heading = $derived(currentPage?.heading ?? null);
  let isPaged = $derived(pages.length > 1);

  function move(direction: "back" | "forward") {
    const result = pageOps.movePage(questions, activePage, direction);

    if (!result) {
      onNotify?.("Give the first page a heading before moving pages around", "error");
      return;
    }

    onQuestionsChange(result.questions);
    onActivePageChange(result.activePage);
  }

  function remove() {
    const result = pageOps.removePage(questions, activePage);
    if (!result) return;

    onQuestionsChange(result.questions);
    onActivePageChange(result.activePage);
  }

  function addHeading() {
    onQuestionsChange(pageOps.addHeadingToFirstPage(questions, createBreak()));
  }

  /** Writes a field of the section break heading this page. */
  function updateHeading(field: "questionText" | "placeholder", value: string) {
    if (!currentPage || currentPage.headingIndex < 0) return;

    const next = [...questions];
    next[currentPage.headingIndex] = { ...next[currentPage.headingIndex], [field]: value };

    onQuestionsChange(next);
  }
</script>

{#if isPaged}
  <div class="flex items-center gap-2 mb-4 overflow-x-auto pb-1">
    {#each pages as _, index}
      <button
        type="button"
        onclick={() => onActivePageChange(index)}
        class="flex-shrink-0 px-3 py-2 rounded-lg text-sm font-medium transition-all max-w-[14rem] truncate"
        style="background: {activePage === index ? $colorStore.primary + '25' : $colorStore.primary + '08'};
               color: {activePage === index ? $colorStore.text : $colorStore.muted};
               border: 1px solid {activePage === index ? $colorStore.primary + '40' : $colorStore.primary + '20'};"
        title={pageOps.pageLabel(pages, index)}
      >
        {index + 1}. {pageOps.pageLabel(pages, index)}
      </button>
    {/each}
  </div>
{/if}

{#if heading}
  <div
    class="mb-4 p-3 rounded-lg space-y-2"
    style="background: {$colorStore.primary}08; border: 1px solid {$colorStore.primary}20;"
  >
    <div class="flex flex-wrap items-center justify-between gap-2">
      <span class="text-xs font-medium" style="color: {$colorStore.muted};">
        <i class="fa-solid fa-heading mr-1"></i>
        Page {activePage + 1} heading
      </span>

      <div class="flex flex-wrap items-center gap-1">
        <button
          type="button"
          onclick={() => move("back")}
          disabled={activePage === 0}
          class="text-xs px-2 py-1.5 rounded transition-colors disabled:opacity-30"
          style="background: {$colorStore.primary}10; color: {$colorStore.text};"
        >
          <i class="fa-solid fa-arrow-left mr-1"></i>Move back
        </button>
        <button
          type="button"
          onclick={() => move("forward")}
          disabled={activePage >= pages.length - 1}
          class="text-xs px-2 py-1.5 rounded transition-colors disabled:opacity-30"
          style="background: {$colorStore.primary}10; color: {$colorStore.text};"
        >
          Move forward<i class="fa-solid fa-arrow-right ml-1"></i>
        </button>
        <button
          type="button"
          onclick={remove}
          class="text-xs px-2 py-1.5 rounded transition-colors"
          style="background: #ef444420; color: #ef4444;"
          title="Removes the page break. Its questions join the page above."
        >
          <i class="fa-solid fa-trash mr-1"></i>Remove page
        </button>
      </div>
    </div>

    <input
      type="text"
      value={heading.questionText || ""}
      oninput={(e) => updateHeading("questionText", e.currentTarget.value)}
      maxlength="500"
      placeholder="Page title, shown above its questions"
      class="w-full p-2 rounded-lg text-sm"
      style="background: {$colorStore.primary}10; border: 1px solid {$colorStore.primary}25; color: {$colorStore.text};"
      aria-label="Page title"
    />

    <textarea
      value={heading.placeholder || ""}
      oninput={(e) => updateHeading("placeholder", e.currentTarget.value)}
      rows="2"
      maxlength="500"
      placeholder="Optional introduction for this page"
      class="w-full p-2 rounded-lg text-sm resize-none"
      style="background: {$colorStore.primary}10; border: 1px solid {$colorStore.primary}25; color: {$colorStore.text};"
      aria-label="Page introduction"
    ></textarea>
  </div>
{:else}
  <div class="mb-4 flex flex-wrap gap-2">
    <button
      type="button"
      onclick={addHeading}
      class="text-xs px-3 py-2 rounded-lg transition-colors"
      style="background: {$colorStore.primary}10; color: {$colorStore.muted};"
    >
      <i class="fa-solid fa-heading mr-1"></i>
      Add a heading to this page
    </button>
  </div>
{/if}
