// routes/forms/[formId]/+page.server.ts
import type { PageServerLoad } from "./$types";
import { botApiGet, defaultInstanceURL, findInstanceWithGuild } from "$lib/server/instances";

interface FormPreview {
  name: string;
  description: string | null;
  allowAnonymous: boolean;
  guildName: string | null;
  guildIcon: string | null;
  questionCount: number | null;
}

/**
 * Loads only what the Discord link preview shows, without a session. Drafts and inactive forms
 * get no preview, and any failure leaves `preview` null so the page loads the form itself.
 */
export const load: PageServerLoad = async ({ params }) => {
  if (!/^\d{1,10}$/.test(params.formId)) return { preview: null };

  let base: string | null = null;
  try {
    base = await defaultInstanceURL();
  } catch {
    return { preview: null };
  }
  if (!base) return { preview: null };

  const form = await botApiGet<{
    name: string;
    description?: string | null;
    guildId: string;
    isActive: boolean;
    isDraft: boolean;
    allowAnonymous: boolean;
  }>(base, `forms/${params.formId}`);
  if (!form || !form.isActive || form.isDraft) return { preview: null };

  const [found, questions] = await Promise.all([
    findInstanceWithGuild(String(form.guildId)),
    botApiGet<unknown[]>(base, `forms/${params.formId}/questions`),
  ]);

  const preview: FormPreview = {
    name: String(form.name ?? ""),
    description: form.description?.trim().slice(0, 600) || null,
    allowAnonymous: !!form.allowAnonymous,
    guildName: found?.guild.guildName ?? null,
    guildIcon: found?.guild.iconUrl ?? null,
    questionCount: Array.isArray(questions) ? questions.length : null,
  };
  return { preview };
};
