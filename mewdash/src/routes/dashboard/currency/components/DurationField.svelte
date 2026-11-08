<script lang="ts">
  import { m } from "$lib/i18n";
  import NumberField from "./NumberField.svelte";

  interface Props {
    id: string;
    seconds: number;
    onchange: (seconds: number) => void;
  }

  let { id, seconds, onchange }: Props = $props();

  const hours = $derived(Math.floor(seconds / 3600));
  const minutes = $derived(Math.floor((seconds % 3600) / 60));
</script>

<div class="grid grid-cols-2 gap-3">
  <NumberField
    id="{id}-hours"
    label={m.common.hours()}
    value={hours}
    max={720}
    onchange={(value) => onchange((value ?? 0) * 3600 + minutes * 60)}
  />
  <NumberField
    id="{id}-minutes"
    label={m.common.minutes()}
    value={minutes}
    max={59}
    onchange={(value) => onchange(hours * 3600 + (value ?? 0) * 60)}
  />
</div>
