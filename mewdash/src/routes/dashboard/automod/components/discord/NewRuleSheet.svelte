<script lang="ts">
  import { m } from "$lib/i18n";
  import type { AutoModRuleKind } from "$lib/api/index.ts";
  import { colorStore } from "$lib/stores/colorStore";
  import type { Named } from "../automodModel";
  import Sheet from "$lib/components/ui/Sheet.svelte";
  import RuleFields from "./RuleFields.svelte";
  import { blankRule, creatable, timeoutAllowed, type Rule, type RulePatch } from "./discordModel";

  interface Props {
    channels: Named[];
    roles: Named[];
    canModerate: boolean;
    counts: Record<AutoModRuleKind, number>;
    problem: string | null;
    oncreate: (rule: Rule) => Promise<void>;
    onclose: () => void;
  }

  let { channels, roles, canModerate, counts, problem, oncreate, onclose }: Props = $props();

  let draft: Rule = $state(blankRule());
  let busy = $state(false);

  function patch(changes: RulePatch) {
    const next = { ...draft, ...changes };
    if (changes.kind && !timeoutAllowed(next.kind)) {
      next.actions = next.actions.filter((x) => x.kind !== "Timeout");
      if (next.actions.length === 0) next.actions = blankRule().actions;
    }
    draft = next;
  }

  async function submit() {
    if (!creatable(draft) || busy) return;
    busy = true;
    try {
      await oncreate($state.snapshot(draft));
    } finally {
      busy = false;
    }
  }
</script>

<Sheet title={m.automod.newRule()} {onclose}>
  <RuleFields rule={draft} creating onpatch={patch} {channels} {roles} {canModerate} {counts} />

  {#if problem}
    <p class="text-sm" role="alert" style="color: #ef4444;">{problem}</p>
  {/if}

  {#snippet footer()}
    <button
      type="button"
      class="px-5 rounded-xl min-h-[50px] font-medium disabled:opacity-50"
      style="background: {$colorStore.primary}; color: {$colorStore.onPrimary};"
      disabled={!creatable(draft) || busy}
      onclick={submit}
    >
      {m.common.create()}
    </button>
  {/snippet}
</Sheet>
