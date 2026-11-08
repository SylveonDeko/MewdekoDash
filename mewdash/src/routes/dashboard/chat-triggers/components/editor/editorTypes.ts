import type { ChatTrigger } from "$lib/api/index.ts";
import type { TriggerPatch } from "../triggerModel.ts";

export interface Named {
  id: string;
  name: string;
}

export interface SectionProps {
  trigger: ChatTrigger;
  /** Applies a change to the trigger. */
  change: (patch: TriggerPatch, typing?: boolean) => void;
}
