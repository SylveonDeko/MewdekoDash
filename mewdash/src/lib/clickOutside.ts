import type {Action} from 'svelte/action';

export const clickOutside: Action<HTMLElement, void> = (node) => {
    const handleClick = (event: MouseEvent) => {
        if (node && !node.contains(event.target as Node) && !event.defaultPrevented) {
            node.dispatchEvent(
                new CustomEvent('clickoutside')
            );
        }
    };

    document.addEventListener('click', handleClick, true);

    return {
        destroy() {
            document.removeEventListener('click', handleClick, true);
        }
    };
};

// Add this type declaration
declare global {
    namespace svelte.JSX {
        interface HTMLAttributes<T> {
            onclickoutside?: (event: CustomEvent) => void;
        }
    }
}
