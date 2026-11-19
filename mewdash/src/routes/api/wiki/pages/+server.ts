import { json } from "@sveltejs/kit";
import { WikiError } from "$lib/server/wiki/errors";
import { actorOf, readBody, wikiEndpoint } from "$lib/server/wiki/http";
import { createPage } from "$lib/server/wiki/store";
import { validateArticle, validatePageFields, type PageFields } from "$lib/wiki/validation";
import type { RequestHandler } from "./$types";

export const POST: RequestHandler = wikiEndpoint("editor", true, async ({ request }, access) => {
  const body = await readBody(request);
  const fields = validatePageFields(body, false);
  if (!fields.ok) throw new WikiError(fields.error, 400, fields.field);
  const article = validateArticle(body);
  if (!article.ok) throw new WikiError(article.error, 400, article.field);

  const page = fields.value as PageFields;
  const id = await createPage(
    {
      slug: page.slug,
      icon: page.icon,
      category: page.category,
      dashboardHref: page.dashboardHref ?? null,
      module: page.module ?? null,
      related: page.related ?? [],
      published: false,
    },
    { title: article.value.title, summary: article.value.summary, markdown: article.value.markdown, tags: article.value.tags },
    actorOf(access),
  );
  return json({ id }, { status: 201 });
});
