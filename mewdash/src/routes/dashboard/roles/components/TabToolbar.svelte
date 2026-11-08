<script lang="ts">
  import { colorStore } from "$lib/stores/colorStore";
  import SaveStatus from "$lib/components/ui/SaveStatus.svelte";
  import type { AutoSave } from "$lib/utils/autoSave.svelte";

  interface ToolbarButton {
    label: string;
    icon: string;
    action: () => void;
    loading?: boolean;
    disabled?: boolean;
  }

  interface Props {
    buttons?: ToolbarButton[];
    autoSave?: AutoSave;
  }

  let { buttons = [], autoSave }: Props = $props();
</script>

{#if buttons.length > 0 || autoSave}
  <div class="flex flex-wrap items-center gap-2 sm:justify-end">
    {#if autoSave}
      <SaveStatus {autoSave} />
    {/if}
    {#each buttons as button (button.label)}
      <button
        type="button"
        class="flex items-center justify-center gap-2 px-4 rounded-xl min-h-[44px] shrink-0 whitespace-nowrap text-sm font-medium focus:outline-hidden focus:ring-2"
        style="background: {$colorStore.primary}20; color: {$colorStore.primary}; border: 1px solid {$colorStore.primary}30;"
        disabled={button.loading || button.disabled}
        aria-busy={button.loading}
        onclick={button.action}
      >
        <i class="fa-solid {button.icon} {button.loading ? 'fa-spin' : ''} shrink-0" aria-hidden="true"></i>
        <span>{button.label}</span>
      </button>
    {/each}
  </div>
{/if}
