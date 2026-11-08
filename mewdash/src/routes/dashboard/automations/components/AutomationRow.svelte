<script lang="ts">
  import { m } from "$lib/i18n";
  import { colorStore } from "$lib/stores/colorStore";

  interface Props {
    name: string;
    subtitle: string;
    enabled: boolean;
    onopen: () => void;
    ontoggle: (enabled: boolean) => void;
    onremove: () => void;
  }

  let { name, subtitle, enabled, onopen, ontoggle, onremove }: Props = $props();

  const quietStyle = $derived(
    `background: ${$colorStore.primary}10; color: ${$colorStore.text}; border: 1px solid ${$colorStore.primary}20;`
  );
</script>

<div class="flex items-center gap-2 rounded-xl border p-2 min-w-0" style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}20;">
  <button type="button" class="grow min-w-0 text-left min-h-[44px] px-2" onclick={onopen}>
    <span class="block text-sm font-semibold truncate" style="color: {$colorStore.text}">{name}</span>
    <span class="block text-sm truncate" style="color: {$colorStore.muted}">{subtitle}</span>
  </button>
  <button
    type="button"
    class="shrink-0 rounded-lg min-h-[44px] min-w-[44px]"
    style={enabled
      ? `background: ${$colorStore.selectedSurface}; color: ${$colorStore.text}; border: 1px solid ${$colorStore.selectedBorder};`
      : quietStyle}
    aria-pressed={enabled}
    aria-label={m.automations.toggleAria({ name })}
    onclick={() => ontoggle(!enabled)}
  >
    <i class="fa-solid fa-power-off" aria-hidden="true"></i>
  </button>
  <button
    type="button"
    class="shrink-0 rounded-lg min-h-[44px] min-w-[44px]"
    style={quietStyle}
    aria-label={m.automations.removeAria({ name })}
    onclick={onremove}
  >
    <i class="fa-solid fa-trash" aria-hidden="true"></i>
  </button>
</div>
