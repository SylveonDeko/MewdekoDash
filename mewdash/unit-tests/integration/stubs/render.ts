export function renderWikiMarkdown(markdown: string): { html: string; headings: never[] } {
  return { html: markdown, headings: [] };
}
