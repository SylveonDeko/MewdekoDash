import { findImageUrls } from "./formMarkdown";

/** The parts of a question that can name a picture. */
export interface FormImageSource {
  imageUrl?: string | null;
  questionText?: string | null;
  placeholder?: string | null;
}

/**
 * Lists every picture address a form shows: each question's own picture and the Markdown pictures
 * in its text and description.
 *
 * @param questions The form's questions as the bot returned them.
 * @returns The distinct addresses, in the order they appear.
 */
export function collectFormImageUrls(questions: readonly FormImageSource[]): string[] {
  const found = new Set<string>();

  for (const question of questions) {
    for (const url of [question.imageUrl ?? "", ...findImageUrls(question.questionText), ...findImageUrls(question.placeholder)]) {
      if (url) found.add(url);
    }
  }

  return [...found];
}
