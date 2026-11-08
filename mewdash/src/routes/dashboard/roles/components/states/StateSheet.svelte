<script lang="ts">
  import { m } from "$lib/i18n";
  import { colorStore } from "$lib/stores/colorStore";
  import Sheet from "$lib/components/ui/Sheet.svelte";

  interface Props {
    name: string;
    roleIds: string[];
    roleName: (id: string) => string;
    onclose: () => void;
    ondelete: () => void;
  }

  let { name, roleIds, roleName, onclose, ondelete }: Props = $props();
</script>

<Sheet title={name} {onclose}>
  <div class="space-y-3">
    <h4 class="text-sm font-medium" style="color: {$colorStore.text}">{m.common.rolesCount({ count: roleIds.length })}</h4>
    <div class="flex flex-wrap gap-2">
      {#each roleIds as id (id)}
        <span class="text-sm px-3 py-1.5 rounded-lg max-w-full truncate"
              style="background: {$colorStore.primary}15; color: {$colorStore.text};">{roleName(id)}</span>
      {/each}
    </div>
  </div>

  {#snippet footer()}
    <button type="button" class="px-4 rounded-xl min-h-[44px] font-medium flex items-center gap-2"
            style="background: {$colorStore.accent}20; color: {$colorStore.text}; border: 1px solid {$colorStore.accent}40;"
            onclick={ondelete}>
      <i class="fa-solid fa-trash" aria-hidden="true"></i>{m.rolestates.statesDelete()}
    </button>
  {/snippet}
</Sheet>
