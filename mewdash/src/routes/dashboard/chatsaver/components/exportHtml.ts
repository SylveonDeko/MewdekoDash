import { getLocale, m } from "$lib/i18n";
import { safeUrl } from "$lib/utils/sanitize";
import type { ChatLogMessage } from "$lib/api/index.ts";
import {
  escapeText,
  formatDay,
  formatSize,
  groupByAuthor,
  groupByDay,
  isImageUrl,
  parseDate,
  renderMarkdown,
  type MentionNames
} from "./chatModel";

const STYLE = `
:root{--accent:__ACCENT__;--bg:#36393f;--text:#fff;--muted:#b9bbbe;--border:#4f545c}
body{font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;background:var(--bg);color:var(--text);margin:0}
header{background:rgba(0,0,0,.3);padding:20px;text-align:center;border-bottom:1px solid var(--border)}
h1{margin:0;color:var(--accent);word-break:break-word}
.sub{color:var(--muted);margin-top:8px;font-size:14px}
main{padding:20px;max-width:1200px;margin:0 auto}
.day{text-align:center;margin:30px 0 15px;color:var(--muted);font-size:12px;border-top:1px solid var(--border);line-height:0}
.day span{background:var(--bg);padding:0 10px}
.message{display:flex;gap:16px;margin-bottom:16px}
.avatar{width:40px;height:40px;border-radius:50%;flex-shrink:0}
.body{flex:1;min-width:0}
.name{font-weight:bold;margin-right:8px}
.time{color:var(--muted);font-size:12px}
.content{word-wrap:break-word;overflow-wrap:anywhere}
.content a,.embed a{color:var(--accent)}
.again{margin-top:8px}
img.attachment{max-width:min(400px,100%);max-height:300px;border-radius:4px;margin-top:8px}
.file{background:rgba(0,0,0,.2);padding:8px 12px;border-radius:4px;display:inline-block;margin-top:4px}
.embed{border-left:4px solid var(--accent);background:rgba(0,0,0,.2);padding:8px 12px;border-radius:0 4px 4px 0;margin-top:6px;overflow:hidden}
.embed-title{font-weight:bold;margin-bottom:4px}
.embed-author{display:flex;align-items:center;gap:8px;margin-bottom:6px}
.embed-author img{width:24px;height:24px;border-radius:50%}
.thumb{float:right;margin-left:10px;max-width:80px;max-height:80px;border-radius:4px}
.mention{background:rgba(88,101,242,.3);color:#c9cdfb;border-radius:3px;padding:0 2px}
code{background:#2f3136;border-radius:3px;padding:0 4px;font-family:Consolas,'Courier New',monospace}
.code-block{background:#2f3136;border-radius:3px;padding:8px;overflow-x:auto}
footer{text-align:center;padding:20px;color:var(--muted);border-top:1px solid var(--border);font-size:12px}
`;

function attr(value: string | null | undefined): string {
  return escapeText(value ?? "");
}

function renderMessage(message: ChatLogMessage, names: MentionNames, first: boolean): string {
  let html = first ? "" : `<div class="time again">${escapeText(parseDate(message.timestamp).toLocaleTimeString())}</div>`;
  if (message.content) html += `<div class="content">${renderMarkdown(message.content, names)}</div>`;

  for (const attachment of message.attachments ?? []) {
    const link = safeUrl(attr(attachment.url));
    if (isImageUrl(attachment.url)) {
      html += `<a href="${link}" target="_blank" rel="noopener noreferrer"><img class="attachment" src="${safeUrl(attr(attachment.proxyUrl || attachment.url))}" alt="${attr(attachment.filename)}"></a>`;
    } else {
      html += `<div class="file"><a href="${link}" target="_blank" rel="noopener noreferrer">${attr(attachment.filename)} (${formatSize(attachment.fileSize)})</a></div>`;
    }
  }

  for (const embed of message.embeds ?? []) {
    html += `<div class="embed">`;
    if (embed.thumbnail) html += `<img class="thumb" src="${safeUrl(attr(embed.thumbnail))}" alt="${attr(m.common.thumbnail())}">`;
    if (embed.author) {
      html += `<div class="embed-author">${embed.author.iconUrl ? `<img src="${safeUrl(attr(embed.author.iconUrl))}" alt="${attr(m.common.authorIcon())}">` : ""}<span>${attr(embed.author.name)}</span></div>`;
    }
    if (embed.title) {
      const title = renderMarkdown(embed.title, names);
      html += `<div class="embed-title">${embed.url ? `<a href="${safeUrl(attr(embed.url))}" target="_blank" rel="noopener noreferrer">${title}</a>` : title}</div>`;
    }
    if (embed.description) html += `<div class="content">${renderMarkdown(embed.description, names)}</div>`;
    html += `</div>`;
  }
  return html;
}

/** Builds a standalone HTML transcript of the messages. */
export function buildTranscript(options: {
  messages: ChatLogMessage[];
  channelName: string;
  guildName: string;
  accent: string;
  names: MentionNames;
}): string {
  const { messages, channelName, guildName, accent, names } = options;
  const ordered = [...messages].sort((a, b) => parseDate(a.timestamp).getTime() - parseDate(b.timestamp).getTime());
  const first = ordered[0];
  const last = ordered[ordered.length - 1];
  const range = first && last
    ? m.chatsaver.saverExportRange({
        start: parseDate(first.timestamp).toLocaleString(),
        end: parseDate(last.timestamp).toLocaleString()
      })
    : "";

  let body = "";
  for (const { day, messages: dayMessages } of groupByDay(ordered)) {
    body += `<div class="day"><span>${escapeText(formatDay(new Date(day).toISOString()))}</span></div>`;
    for (const group of groupByAuthor(dayMessages)) {
      const head = group[0];
      body += `<div class="message"><img class="avatar" src="${safeUrl(attr(head.author.avatarUrl))}" alt=""><div class="body"><div><span class="name">${attr(head.author.username)}</span><span class="time">${escapeText(parseDate(head.timestamp).toLocaleTimeString())}</span></div>`;
      group.forEach((message, index) => {
        body += renderMessage(message, names, index === 0);
      });
      body += `</div></div>`;
    }
  }

  const title = m.chatsaver.saverExportTitle({ channel: channelName, guild: guildName });
  return `<!DOCTYPE html>
<html lang="${getLocale()}">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${escapeText(title)}</title>
<style>${STYLE.replace("__ACCENT__", /^#[0-9a-f]{3,8}$/i.test(accent) ? accent : "#5865f2")}</style>
</head>
<body>
<header><h1>#${escapeText(channelName)}</h1><div class="sub">${escapeText(guildName)}</div><div class="sub">${escapeText(range)}</div></header>
<main>${body}</main>
<footer>${escapeText(m.common.generatedOnDate({ date: new Date().toLocaleString() }))}</footer>
</body>
</html>`;
}

export function downloadTranscript(html: string, channelName: string) {
  const blob = new Blob([html], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${channelName}-${new Date().toISOString().slice(0, 10)}.html`;
  document.body.appendChild(link);
  link.click();
  setTimeout(() => {
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, 0);
}
