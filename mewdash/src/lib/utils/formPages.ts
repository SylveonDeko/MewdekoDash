import {
  type FormPage,
  type FormQuestion,
  type PageableQuestion,
  paginateQuestions,
} from "$lib/api/forms/models";

/**
 * Operations on the pages a form is split into.
 *
 * A page is stored as the section break that heads it followed by its questions, which is the flat
 * list the API and the public form both use. Everything that has to reason about that shape lives
 * here so the create and edit builders cannot drift apart, which is what happened when only one of
 * them understood pages.
 *
 * Generic over the question type: the create builder holds partially filled questions with
 * temporary identifiers, the edit builder holds saved ones. Every function returns a new array
 * with display order renumbered, so callers assign the result rather than mutating in place.
 */

/** Renumbers questions so display order matches the order they sit in the list. */
export function resequence<T extends PageableQuestion>(questions: T[]): T[] {
  questions.forEach((q, i) => (q.displayOrder = i));
  return questions;
}

/** Where a page begins in the flat list, counting its heading. */
export function startOfPage<T extends PageableQuestion>(pages: FormPage<T>[], pageIndex: number): number {
  const page = pages[pageIndex];
  if (!page) return 0;

  if (page.headingIndex >= 0) return page.headingIndex;

  return page.questionIndices.length > 0 ? page.questionIndices[0] : 0;
}

/** Where a page ends in the flat list, which is where the next one begins. */
export function endOfPage<T extends PageableQuestion>(
  pages: FormPage<T>[],
  pageIndex: number,
  total: number,
): number {
  const next = pages[pageIndex + 1];

  if (next) return next.headingIndex >= 0 ? next.headingIndex : total;

  return total;
}

/** Names a page for its tab, falling back to its number when it has no heading. */
export function pageLabel<T extends PageableQuestion>(pages: FormPage<T>[], index: number): string {
  const heading = pages[index]?.heading?.questionText?.trim();
  return heading ? heading : `Page ${index + 1}`;
}

/**
 * A blank section break, which is what a page is made of.
 *
 * @param id The identifier to give it. The edit builder passes 0 for "not saved yet"; the create
 *   builder passes a negative number, since nothing there is saved and each still needs to be
 *   told apart.
 */
export function createPageBreak(formId: number, id: number = 0): FormQuestion {
  return {
    id,
    formId,
    questionText: "",
    questionType: "section_break",
    isRequired: false,
    displayOrder: 0,
    createdAt: new Date().toISOString(),
    options: [],
    conditionalType: 0,
    enableAnswerPiping: false,
  } as FormQuestion;
}

/**
 * Starts a new page after the given one. Everything added afterwards lands on the new page.
 *
 * @returns The new question list and the index of the page that was created.
 */
export function addPage<T extends PageableQuestion>(
  questions: T[],
  breakQuestion: T,
  afterPage: number,
): { questions: T[]; activePage: number } {
  const pages = paginateQuestions(questions);
  const insertAt = endOfPage(pages, afterPage, questions.length);

  return {
    questions: resequence([
      ...questions.slice(0, insertAt),
      breakQuestion,
      ...questions.slice(insertAt),
    ]),
    activePage: afterPage + 1,
  };
}

/** Gives the first page a heading, which it does not have until a break is put above it. */
export function addHeadingToFirstPage<T extends PageableQuestion>(questions: T[], breakQuestion: T): T[] {
  return resequence([breakQuestion, ...questions]);
}

/**
 * Swaps a page with its neighbour, moving its heading and every question on it together.
 *
 * @returns The new list and active page, or null when the move is not possible. A first page with
 *   no heading cannot move, because being at the top is what defines it.
 */
export function movePage<T extends PageableQuestion>(
  questions: T[],
  fromPage: number,
  direction: "back" | "forward",
): { questions: T[]; activePage: number } | null {
  const pages = paginateQuestions(questions);
  const target = direction === "back" ? fromPage - 1 : fromPage + 1;

  if (target < 0 || target >= pages.length) return null;

  const first = Math.min(fromPage, target);
  const second = Math.max(fromPage, target);

  if (first === 0 && pages[0].headingIndex < 0) return null;

  const total = questions.length;

  const before = questions.slice(0, startOfPage(pages, first));
  const firstBlock = questions.slice(startOfPage(pages, first), endOfPage(pages, first, total));
  const secondBlock = questions.slice(startOfPage(pages, second), endOfPage(pages, second, total));
  const after = questions.slice(endOfPage(pages, second, total));

  return {
    questions: resequence([...before, ...secondBlock, ...firstBlock, ...after]),
    activePage: target,
  };
}

/**
 * Removes a page break, merging that page's questions into the one before it. The questions are
 * kept, since deleting somebody's work as a side effect of tidying up the layout would be its own
 * kind of rude.
 *
 * @returns The new list and active page, or null when the page has no heading to remove.
 */
export function removePage<T extends PageableQuestion>(
  questions: T[],
  pageIndex: number,
): { questions: T[]; activePage: number } | null {
  const pages = paginateQuestions(questions);
  const page = pages[pageIndex];

  if (!page || page.headingIndex < 0) return null;

  return {
    questions: resequence(questions.filter((_, i) => i !== page.headingIndex)),
    activePage: Math.max(0, pageIndex - 1),
  };
}

/** Adds a question to the end of the given page rather than the end of the whole form. */
export function insertOnPage<T extends PageableQuestion>(
  questions: T[],
  question: T,
  pageIndex: number,
): { questions: T[]; index: number } {
  const pages = paginateQuestions(questions);
  const insertAt = endOfPage(pages, pageIndex, questions.length);

  return {
    questions: resequence([
      ...questions.slice(0, insertAt),
      question,
      ...questions.slice(insertAt),
    ]),
    index: insertAt,
  };
}

/**
 * Moves a question one place within its own page. A move stops at a page boundary rather than
 * carrying the question onto the next page, because reordering and re-paging are different
 * intentions and the arrows only claim to do the first.
 *
 * @returns The new list, or null when the move would cross a boundary or run off the end.
 */
export function moveQuestion<T extends PageableQuestion>(
  questions: T[],
  index: number,
  direction: "up" | "down",
): T[] | null {
  const target = direction === "up" ? index - 1 : index + 1;

  if (target < 0 || target >= questions.length) return null;
  if (questions[target].questionType === "section_break") return null;

  const next = [...questions];
  [next[index], next[target]] = [next[target], next[index]];

  return resequence(next);
}

/** Places a copy of a question directly below the original, where somebody duplicating it looks. */
export function duplicateQuestion<T extends PageableQuestion>(
  questions: T[],
  index: number,
  copy: T,
): T[] {
  return resequence([...questions.slice(0, index + 1), copy, ...questions.slice(index + 1)]);
}
