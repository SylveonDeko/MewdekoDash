import { browser } from "$app/environment";
import { getLocale, setLocale } from "$lib/i18n";
import type { LayoutLoad } from "./$types";

/**
 * The server rendered this request in `data.locale`. Install the same locale (and its catalog)
 * on the client before the first client render, so hydration produces identical text.
 */
export const load: LayoutLoad = async ({ data }) => {
  if (browser && data.locale !== getLocale()) {
    await setLocale(data.locale);
  }
  return data;
};
