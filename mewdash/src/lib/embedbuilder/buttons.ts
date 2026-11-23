import type { ChatTrigger } from "$lib/api/chattriggers/models/ChatTrigger";

export type ButtonAction = "link" | "message" | "trigger";
export type ReplyKind = "text" | "embed" | "saved";

export const BUILDER_CATEGORY = "Embed builder buttons";
export const BUTTON_CLICK_FLAG = 4;
export const MAX_REPLY_LENGTH = 2000;
export const MAX_REPLY_TITLE = 256;
export const DEFAULT_REPLY_COLOR = "#5865F2";
export const MAX_BUTTON_LABEL = 80;

export interface SavedMessageOption {
  id: string;
  name: string;
  jsonCode: string;
}

export interface ButtonComponent {
  componentKey: string;
  id: string | null;
  rowIndex: number;
  displayName: string;
  style: number;
  url: string;
  emoji: string;
  isSelect: boolean;
  maxOptions: number;
  minOptions: number;
  options: Array<{ id: string | null; name: string; emoji: string; description: string }>;
  action?: ButtonAction;
  replyKind?: ReplyKind;
  replyText?: string;
  replyTitle?: string;
  replyColor?: string;
  replyJson?: string;
  replyEmbedId?: string | null;
  replyPrivate?: boolean;
  replyTriggerId?: string | null;
}

export function newKey(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
}

export function newButton(action: ButtonAction, rowIndex = 0): ButtonComponent {
  return {
    componentKey: newKey("component"),
    id: null,
    rowIndex,
    displayName: "",
    style: action === "link" ? 5 : 1,
    url: "",
    emoji: "",
    isSelect: false,
    maxOptions: 1,
    minOptions: 1,
    options: [],
    action,
    replyKind: "text",
    replyText: "",
    replyTitle: "",
    replyColor: DEFAULT_REPLY_COLOR,
    replyJson: "",
    replyEmbedId: null,
    replyPrivate: true,
    replyTriggerId: null
  };
}

export function actionPatch(component: ButtonComponent, action: ButtonAction): Partial<ButtonComponent> {
  const style = component.style === 5 ? 1 : component.style;
  if (action === "link") return { action, style: 5, id: null };
  if (action === "message") return { action, style, id: component.replyTriggerId ?? null };
  return { action, style, id: null };
}

export function isBuilderTrigger(trigger: ChatTrigger): boolean {
  return trigger.category === BUILDER_CATEGORY && (trigger.validTriggerTypes & BUTTON_CLICK_FLAG) !== 0;
}

export function hasButtonClick(trigger: ChatTrigger): boolean {
  return (trigger.validTriggerTypes & BUTTON_CLICK_FLAG) !== 0;
}

export function actionOf(component: ButtonComponent): ButtonAction {
  if (component.action) return component.action;
  return component.style === 5 ? "link" : "trigger";
}

export function looksLikeMessageJson(text: string): boolean {
  const trimmed = text.trim();
  if (!trimmed.startsWith("{")) return false;
  try {
    const parsed = JSON.parse(trimmed);
    return !!parsed && typeof parsed === "object" && ("embeds" in parsed || "embed" in parsed || "content" in parsed);
  } catch {
    return false;
  }
}

export function stripComponents(jsonCode: string): string {
  try {
    const parsed = JSON.parse(jsonCode);
    if (parsed && typeof parsed === "object" && "components" in parsed) {
      delete parsed.components;
      return JSON.stringify(parsed);
    }
  } catch {
    return jsonCode;
  }
  return jsonCode;
}

export function replyBody(component: ButtonComponent): string {
  if (component.replyKind === "saved") return (component.replyJson ?? "").trim();

  const text = (component.replyText ?? "").trim();
  if (component.replyKind !== "embed") return text;

  const title = (component.replyTitle ?? "").trim();
  if (!title && !text) return "";

  return JSON.stringify({
    embeds: [
      {
        ...(title ? { title } : {}),
        ...(text ? { description: text } : {}),
        color: component.replyColor || DEFAULT_REPLY_COLOR
      }
    ]
  });
}

/**
 * Reads a reply back into the embed fields when it is a single embed holding nothing but a title, a text
 * and a color, which is what a "Design an embed" reply is saved as.
 */
function designedEmbed(response: string): Partial<ButtonComponent> | null {
  try {
    const parsed = JSON.parse(response);
    if (!parsed || typeof parsed !== "object" || Object.keys(parsed).some(key => key !== "embeds")) return null;
    if (!Array.isArray(parsed.embeds) || parsed.embeds.length !== 1) return null;

    const embed = parsed.embeds[0];
    if (!embed || typeof embed !== "object") return null;
    if (Object.keys(embed).some(key => !["title", "description", "color"].includes(key))) return null;
    if (Object.values(embed).some(value => typeof value !== "string")) return null;
    if ((embed.description ?? "").length > MAX_REPLY_LENGTH) return null;

    return {
      replyKind: "embed",
      replyTitle: embed.title ?? "",
      replyText: embed.description ?? "",
      replyColor: embed.color ?? DEFAULT_REPLY_COLOR,
      replyJson: ""
    };
  } catch {
    return null;
  }
}

export function triggerTextFor(label: string): string {
  const name = label.trim() || "Button";
  return `Embed builder button: ${name}`.slice(0, 100);
}

function replyFields(trigger: ChatTrigger): Partial<ButtonComponent> {
  const response = typeof trigger.response === "string" ? trigger.response : JSON.stringify(trigger.response ?? "");
  const saved = looksLikeMessageJson(response);
  return {
    replyKind: saved ? "saved" : "text",
    replyText: saved ? "" : response,
    replyJson: saved ? response : "",
    replyTitle: "",
    replyColor: DEFAULT_REPLY_COLOR,
    ...(saved ? designedEmbed(response) : null),
    replyEmbedId: null,
    replyPrivate: trigger.ephemeralResponse
  };
}

/**
 * Classifies buttons that have no action yet and turns a button bound to a builder-made trigger back
 * into a "Show a message" button carrying the trigger's reply.
 */
export function hydrateButtons<T extends { components: ButtonComponent[] }>(rows: T[], triggers: ChatTrigger[]): T[] {
  const byId = new Map(triggers.map(trigger => [String(trigger.id), trigger]));

  return rows.map(row => ({
    ...row,
    components: row.components.map(component => {
      if (component.isSelect) return component;

      const classified: ButtonComponent = component.action
        ? component
        : { ...newButton(component.style === 5 ? "link" : "trigger"), ...component, action: component.style === 5 ? "link" : "trigger" };

      if (classified.action !== "trigger" || !classified.id) return classified;

      const trigger = byId.get(String(classified.id));
      if (!trigger || !isBuilderTrigger(trigger)) return classified;

      return { ...classified, action: "message", replyTriggerId: String(trigger.id), ...replyFields(trigger) };
    })
  }));
}

/** Whether a message holds only buttons that Simple can show: link buttons and message buttons. */
export function isSimpleButton(component: { isSelect: boolean; style: number; action?: ButtonAction }): boolean {
  return !component.isSelect && (component.style === 5 || component.action === "message");
}
