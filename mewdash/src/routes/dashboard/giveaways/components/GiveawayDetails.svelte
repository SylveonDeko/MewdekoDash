<script lang="ts">
  import { m } from "$lib/i18n";
  import { colorStore } from "$lib/stores/colorStore";
  import type { Giveaway } from "$lib/api/index.ts";
  import SaveStatus from "$lib/components/ui/SaveStatus.svelte";
  import type { AutoSave } from "$lib/utils/autoSave.svelte";
  import ExtraEntriesField from "./ExtraEntriesField.svelte";
  import PrizeFields from "./PrizeFields.svelte";
  import Sheet from "$lib/components/ui/Sheet.svelte";
  import {
    GiveawayStatus,
    entryMethodOf,
    formatDuration,
    parseExtraEntries,
    parseUtc,
    splitRoles,
    type ExtraEntry
  } from "./giveawayModel";

  type Named = { id: string; name: string; color?: number };

  interface Props {
    giveaway: Giveaway;
    channels: Named[];
    roles: Named[];
    entries: number | null;
    autoSave: AutoSave;
    onoptions: (extra: ExtraEntry[], prizeType: number, prizeAmount: number, typing: boolean) => void;
    onclose: () => void;
  }

  let { giveaway, channels, roles, entries, autoSave, onoptions, onclose }: Props = $props();

  const editable = $derived(giveaway.ended !== GiveawayStatus.Ended);
  const extra = $derived(parseExtraEntries(giveaway.extraEntryRoles));
  const method = $derived(entryMethodOf(giveaway));
  const channelName = $derived(channels.find(c => String(c.id) === String(giveaway.channelId))?.name ?? String(giveaway.channelId));
  const requiredRoles = $derived(splitRoles(giveaway.restrictTo).map(id => roles.find(r => r.id === id)?.name ?? id));

  const methodLabel = $derived(
    method === "captcha" ? m.common.captcha() : method === "button" ? m.common.button() : m.giveaways.methodReaction()
  );

  const timeLabel = $derived(
    giveaway.ended === GiveawayStatus.Draft
      ? formatDuration(giveaway.draftDurationSeconds)
      : parseUtc(giveaway.when).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })
  );

  const facts = $derived(
    [
      { label: giveaway.ended === GiveawayStatus.Draft ? m.giveaways.factRuns() : giveaway.ended === GiveawayStatus.Ended ? m.common.ended() : m.giveaways.factEnds(), value: timeLabel },
      { label: m.common.channel(), value: `#${channelName}` },
      { label: m.giveaways.fieldWinners(), value: String(giveaway.winners) },
      { label: m.giveaways.fieldEntry(), value: methodLabel },
      entries !== null ? { label: m.giveaways.factEntries(), value: String(entries) } : null,
      requiredRoles.length ? { label: m.common.requiredRoles(), value: requiredRoles.join(", ") } : null,
      Number(giveaway.messageCountReq) > 0 ? { label: m.giveaways.fieldMessageCount(), value: String(giveaway.messageCountReq) } : null
    ].filter((fact): fact is { label: string; value: string } => fact !== null)
  );
</script>

{#snippet actions()}
  {#if editable}
    <SaveStatus {autoSave} />
  {/if}
{/snippet}

<Sheet title={giveaway.item || m.giveaways.untitled()} {onclose} {actions}>
  <dl class="grid grid-cols-1 sm:grid-cols-2 gap-2">
    {#each facts as fact (fact.label)}
      <div class="rounded-lg p-3 min-w-0" style="background: {$colorStore.primary}08;">
        <dt class="text-xs" style="color: {$colorStore.muted}">{fact.label}</dt>
        <dd class="text-sm break-words" style="color: {$colorStore.text}">{fact.value}</dd>
      </div>
    {/each}
  </dl>

  {#if editable}
    <ExtraEntriesField
      entries={extra}
      {roles}
      idPrefix="gd"
      onchange={(next, typing) => onoptions(next, giveaway.prizeType, Number(giveaway.prizeAmount), typing ?? false)}
    />
    <PrizeFields
      type={giveaway.prizeType}
      amount={Number(giveaway.prizeAmount)}
      idPrefix="gd"
      onchange={(type, amount, typing) => onoptions(extra, type, amount, typing ?? false)}
    />
  {:else}
    {#if extra.length}
      <div class="space-y-2">
        <p class="text-sm font-medium" style="color: {$colorStore.text}">{m.giveaways.extraEntriesLabel()}</p>
        {#each extra as entry (entry.roleId)}
          <p class="text-sm rounded-lg p-3" style="background: {$colorStore.primary}08; color: {$colorStore.text}">
            {roles.find(r => r.id === entry.roleId)?.name ?? entry.roleId} +{entry.extra}
          </p>
        {/each}
      </div>
    {/if}
  {/if}
</Sheet>
