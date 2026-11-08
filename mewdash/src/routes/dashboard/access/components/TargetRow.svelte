<script lang="ts">
  import { colorStore } from "$lib/stores/colorStore";
  import { DashboardAccessTargetType } from "$lib/api/dashboardaccess/models";

  interface Props {
    targetType: DashboardAccessTargetType;
    name: string;
    subtitle?: string;
    editLabel?: string;
    removeLabel: string;
    onedit?: () => void;
    onremove: () => void;
  }

  let { targetType, name, subtitle, editLabel, removeLabel, onedit, onremove }: Props = $props();

  const iconButton = $derived(
    `background: ${$colorStore.primary}10; color: ${$colorStore.text}; border: 1px solid ${$colorStore.primary}20;`
  );
</script>

<div
  class="flex items-center gap-2 rounded-xl border p-2 pl-3 min-w-0"
  style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}20;"
>
  <i
    class="fa-solid {targetType === DashboardAccessTargetType.Role ? 'fa-at' : 'fa-user'} w-4 text-center shrink-0"
    style="color: {$colorStore.muted}"
    aria-hidden="true"
  ></i>
  <div class="grow min-w-0">
    <span class="block text-sm font-medium truncate" style="color: {$colorStore.text}">{name}</span>
    {#if subtitle}
      <span class="block text-xs truncate" style="color: {$colorStore.muted}">{subtitle}</span>
    {/if}
  </div>
  {#if onedit}
    <button
      type="button"
      class="rounded-lg min-h-[44px] min-w-[44px] shrink-0"
      style={iconButton}
      aria-label={editLabel}
      onclick={onedit}
    >
      <i class="fa-solid fa-pen" aria-hidden="true"></i>
    </button>
  {/if}
  <button
    type="button"
    class="rounded-lg min-h-[44px] min-w-[44px] shrink-0"
    style={iconButton}
    aria-label={removeLabel}
    onclick={onremove}
  >
    <i class="fa-solid fa-trash" aria-hidden="true"></i>
  </button>
</div>
