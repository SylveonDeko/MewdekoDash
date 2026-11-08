<script lang="ts">
  import { m } from "$lib/i18n";
  import { colorStore } from "$lib/stores/colorStore";
  import ToggleRow from "$lib/components/forms/ToggleRow.svelte";
  import EditorGroup from "./EditorGroup.svelte";
  import NumberField from "./NumberField.svelte";
  import type { SectionProps } from "../starboardModel";

  let { starboard, change }: SectionProps = $props();

  const count = $derived(
    [
      starboard.removeOnDelete,
      starboard.removeOnReactionsClear,
      starboard.removeOnBelowThreshold,
      starboard.repostThreshold > 0,
      starboard.repostCooldownMinutes > 0
    ].filter(Boolean).length
  );

  let open = $state(false);
</script>

<EditorGroup title={m.starboard.groupRemoval()} {count} bind:open>
  <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
    <ToggleRow colors={$colorStore} checked={starboard.removeOnDelete} title={m.starboard.removeOnDelete()} onchange={(v) => change({ removeOnDelete: v })} />
    <ToggleRow colors={$colorStore} checked={starboard.removeOnReactionsClear} title={m.starboard.removeOnClear()} onchange={(v) => change({ removeOnReactionsClear: v })} />
    <ToggleRow colors={$colorStore} checked={starboard.removeOnBelowThreshold} title={m.starboard.removeBelowThreshold()} onchange={(v) => change({ removeOnBelowThreshold: v })} />
  </div>

  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
    <NumberField
      id="sb-repost-threshold"
      label={m.starboard.repostThreshold()}
      hint={m.starboard.zeroToDisable()}
      value={starboard.repostThreshold}
      onchange={(v) => change({ repostThreshold: v }, true)}
    />
    <NumberField
      id="sb-repost-cooldown"
      label={m.starboard.repostCooldown()}
      hint={m.starboard.zeroForNone()}
      value={starboard.repostCooldownMinutes}
      onchange={(v) => change({ repostCooldownMinutes: v }, true)}
    />
  </div>
</EditorGroup>
