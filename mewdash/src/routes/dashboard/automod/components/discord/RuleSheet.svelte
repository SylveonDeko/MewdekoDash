<script lang="ts">
  import { m } from "$lib/i18n";
  import type { AutoModRuleKind } from "$lib/api/index.ts";
  import { colorStore } from "$lib/stores/colorStore";
  import ToggleRow from "$lib/components/forms/ToggleRow.svelte";
  import type { Named, SaveMode } from "../automodModel";
  import Sheet from "$lib/components/ui/Sheet.svelte";
  import FollowUpFields from "./FollowUpFields.svelte";
  import RuleFields from "./RuleFields.svelte";
  import type { FollowUp, Rule, RulePatch } from "./discordModel";

  interface Props {
    rule: Rule;
    channels: Named[];
    roles: Named[];
    canModerate: boolean;
    counts: Record<AutoModRuleKind, number>;
    onpatch: (changes: RulePatch, mode?: SaveMode) => void;
    onfollowup: (next: FollowUp, mode: SaveMode) => void;
    onclose: () => void;
  }

  let { rule, channels, roles, canModerate, counts, onpatch, onfollowup, onclose }: Props = $props();
</script>

<Sheet title={rule.name} {onclose} size="lg">
  <ToggleRow
    checked={rule.enabled}
    title={rule.enabled ? m.common.enabled() : m.common.disabled()}
    colors={$colorStore}
    onchange={(on) => onpatch({ enabled: on })}
  />
  <RuleFields {rule} {onpatch} {channels} {roles} {canModerate} {counts} />

  <h3 class="text-base font-semibold pt-2" style="color: {$colorStore.text}">{m.automod.followUp()}</h3>
  <FollowUpFields followUp={rule.followUp} {channels} onchange={onfollowup} />
</Sheet>
