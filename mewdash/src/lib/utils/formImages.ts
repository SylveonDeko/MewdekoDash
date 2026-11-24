import { get } from "svelte/store";
import { currentInstance } from "$lib/stores/instanceStore";
import type { ImageLinks } from "$lib/utils/formMarkdown";

/**
 * Asks the dashboard for the address each outside picture of a form should load from, so a visitor's
 * browser never contacts the server the picture is hosted on. The dashboard reads the form itself,
 * so only pictures the form really shows come back.
 *
 * @param formId The form whose pictures are wanted.
 * @returns A map from each address to the one the page loads, which leaves out any it will not show.
 */
export async function loadImageLinks(formId: number): Promise<ImageLinks> {
  const instance = get(currentInstance);

  try {
    const response = await fetch("/api/forms/image-links", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(instance ? { "X-Instance-Port": instance.port.toString() } : {})
      },
      body: JSON.stringify({ formId })
    });

    if (!response.ok) return {};

    const data = (await response.json()) as { links?: ImageLinks };
    return data.links ?? {};
  } catch {
    return {};
  }
}
