// src/lib/stores/animationStore.ts
import { writable } from "svelte/store";

export const triggerAnimation = writable(false);

export function triggerMenuAnimation() {
  triggerAnimation.set(true);
}
