// lib/clickOutside.ts
import type { Action } from "svelte/action";

interface ClickOutsideAttributes {
  onclickoutside?: (event: CustomEvent) => void;
}

export const clickOutside: Action<HTMLElement, void, ClickOutsideAttributes> = (
  node,
) => {
  const handleClick = (event: MouseEvent) => {
    if (
      node &&
      !node.contains(event.target as Node) &&
      !event.defaultPrevented
    ) {
      node.dispatchEvent(new CustomEvent("clickoutside"));
    }
  };

  document.addEventListener("click", handleClick, true);

  return {
    destroy() {
      document.removeEventListener("click", handleClick, true);
    },
  };
};

declare global {
  namespace svelteHTML {
    interface HTMLAttributes<T> {
      onclickoutside?: (event: CustomEvent) => void;
    }
  }
}
