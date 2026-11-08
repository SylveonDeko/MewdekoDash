<script lang="ts">
  import { m } from "$lib/i18n";
  import { onMount } from "svelte";
  import { patreonApi, type PatreonTier } from "$lib/api/index.ts";
  import { colorStore } from "$lib/stores/colorStore";
  import { logger } from "$lib/logger";
  import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";
  import PluginCard from "$lib/components/plugin/PluginCard.svelte";
  import { errorText, formatMoney, hasId, idString, type Named, type Notify } from "./patreonModel";

  interface Props {
    guildId: bigint;
    roles: Named[];
    notify: Notify;
  }

  let { guildId, roles, notify }: Props = $props();

  let tiers: PatreonTier[] = $state([]);
  let loading = $state(true);

  async function load() {
    try {
      tiers = await patreonApi.getPatreonTiers(guildId);
    } catch (err) {
      logger.error("Failed to load tiers:", err);
      notify(errorText(err, m.patreon.errorLoadTiers()), "error");
    } finally {
      loading = false;
    }
  }

  async function map(tier: PatreonTier, roleId: string | null) {
    const previous = tier.discordRoleId;
    tier.discordRoleId = BigInt(roleId ?? 0);
    try {
      await patreonApi.mapPatreonTierToRole(guildId, { tierId: tier.tierId, roleId: BigInt(roleId ?? 0) });
    } catch (err) {
      tier.discordRoleId = previous;
      logger.error("Failed to map a tier:", err);
      notify(errorText(err, m.patreon.notifyMapFailed()), "error");
    }
  }

  onMount(() => {
    void load();
  });
</script>

<PluginCard title={m.patreon.tiersTitle()} alwaysOpen>
  {#if loading}
    <div class="flex justify-center py-8">
      <div class="w-8 h-8 border-4 rounded-full animate-spin"
           style="border-color: {$colorStore.primary}20; border-top-color: {$colorStore.primary};"></div>
    </div>
  {:else if tiers.length === 0}
    <p class="text-sm" style="color: {$colorStore.muted}">{m.patreon.tiersEmpty()}</p>
  {:else}
    <div class="space-y-3">
      {#each tiers as tier (tier.tierId)}
        <div class="rounded-xl border p-3 space-y-3 min-w-0"
             style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}20;">
          <div class="flex items-baseline justify-between gap-3 min-w-0">
            <h4 class="font-medium truncate" style="color: {$colorStore.text}">{tier.tierTitle || m.patreon.tiersUnknown()}</h4>
            <span class="shrink-0 tabular-nums" style="color: {$colorStore.text}">{formatMoney(tier.amountCents / 100)}</span>
          </div>
          {#if tier.description}
            <p class="text-sm line-clamp-2" style="color: {$colorStore.muted}">{tier.description}</p>
          {/if}
          <DiscordSelector
            type="role"
            options={roles}
            selected={hasId(tier.discordRoleId) ? idString(tier.discordRoleId) : null}
            placeholder={m.patreon.tiersPlaceholder()}
            ariaLabel={m.patreon.tiersRoleAria({ name: tier.tierTitle })}
            onchange={({ selected }) => map(tier, typeof selected === "string" && selected ? selected : null)}
          />
        </div>
      {/each}
    </div>
  {/if}
</PluginCard>
