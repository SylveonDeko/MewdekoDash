import { chatTriggersApi } from "$lib/api/index.ts";
import type { ChatTrigger } from "$lib/api/chattriggers/models/ChatTrigger";
import {
  BUILDER_CATEGORY,
  BUTTON_CLICK_FLAG,
  actionOf,
  hasButtonClick,
  replyBody,
  triggerTextFor,
  type ButtonComponent
} from "$lib/embedbuilder/buttons";
import { newTrigger, toWire } from "../../chat-triggers/components/triggerModel";

export interface ButtonSyncResult {
  /** The trigger id of every "Show a message" button, keyed by the button's key. */
  replyIds: Map<string, string>;
  /** The names of triggers that had Button click turned on so a button could run them. */
  enabled: string[];
  /** The guild's triggers as they are after the sync. */
  triggers: ChatTrigger[];
}

function referencedTriggerIds(buttons: ButtonComponent[]): string[] {
  const ids: string[] = [];
  for (const button of buttons) {
    if (button.isSelect) {
      for (const option of button.options) if (option.id) ids.push(String(option.id));
    } else if (actionOf(button) === "trigger" && button.id) {
      ids.push(String(button.id));
    }
  }
  return ids;
}

/**
 * Makes the guild's triggers match the buttons: creates or updates the trigger behind every "Show a message"
 * button and turns on Button click for every trigger a button or menu option runs.
 */
export async function syncButtonTriggers(
  guildId: bigint,
  creatorId: bigint,
  buttons: ButtonComponent[]
): Promise<ButtonSyncResult> {
  const triggers = [...((await chatTriggersApi.getChatTriggers(guildId)) ?? [])];
  const replyIds = new Map<string, string>();
  const enabled: string[] = [];
  const claimed = new Set<string>();

  const replace = (updated: ChatTrigger) => {
    const index = triggers.findIndex(trigger => trigger.id === updated.id);
    if (index === -1) triggers.push(updated);
    else triggers[index] = updated;
  };

  for (const button of buttons) {
    if (button.isSelect || actionOf(button) !== "message") continue;

    const body = replyBody(button);
    if (!body) continue;

    const text = triggerTextFor(button.displayName);
    const ephemeralResponse = button.replyPrivate !== false;
    const known = button.replyTriggerId ? String(button.replyTriggerId) : null;
    const existing = known && !claimed.has(known) ? triggers.find(trigger => String(trigger.id) === known) : undefined;

    if (existing) {
      claimed.add(String(existing.id));
      replyIds.set(button.componentKey, String(existing.id));

      const current = typeof existing.response === "string" ? existing.response : JSON.stringify(existing.response ?? "");
      const changed =
        current !== body ||
        existing.ephemeralResponse !== ephemeralResponse ||
        existing.trigger !== text ||
        !hasButtonClick(existing);
      if (!changed) continue;

      const updated: ChatTrigger = {
        ...existing,
        response: body,
        trigger: text,
        ephemeralResponse,
        validTriggerTypes: existing.validTriggerTypes | BUTTON_CLICK_FLAG
      };
      await chatTriggersApi.updateChatTrigger(guildId, toWire(updated));
      replace(updated);
      continue;
    }

    const draft: ChatTrigger = {
      ...newTrigger(guildId),
      trigger: text,
      response: body,
      validTriggerTypes: BUTTON_CLICK_FLAG,
      ephemeralResponse,
      category: BUILDER_CATEGORY,
      creatorId
    };
    const added = await chatTriggersApi.addChatTrigger(guildId, toWire(draft));
    claimed.add(String(added.id));
    replyIds.set(button.componentKey, String(added.id));
    replace(added);
  }

  for (const id of new Set(referencedTriggerIds(buttons))) {
    const trigger = triggers.find(item => String(item.id) === id);
    if (!trigger || hasButtonClick(trigger)) continue;

    const updated: ChatTrigger = { ...trigger, validTriggerTypes: trigger.validTriggerTypes | BUTTON_CLICK_FLAG };
    await chatTriggersApi.updateChatTrigger(guildId, toWire(updated));
    replace(updated);
    enabled.push(trigger.trigger?.trim() || `#${trigger.id}`);
  }

  return { replyIds, enabled, triggers };
}
