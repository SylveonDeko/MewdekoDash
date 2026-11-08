<script lang="ts">
  import { m } from "$lib/i18n";
  import { onMount } from "svelte";
  import { clientApi, patreonApi, type PatreonSupporter, type PatreonTier } from "$lib/api/index.ts";
  import { colorStore } from "$lib/stores/colorStore";
  import { logger } from "$lib/logger";
  import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";
  import SettingField from "$lib/components/forms/SettingField.svelte";
  import PluginCard from "$lib/components/plugin/PluginCard.svelte";
  import Sheet from "$lib/components/ui/Sheet.svelte";
  import { errorText, formatDate, formatMoney, hasId, idString, type Notify } from "./patreonModel";

  interface Props {
    guildId: bigint;
    notify: Notify;
  }

  let { guildId, notify }: Props = $props();

  let supporters: PatreonSupporter[] = $state([]);
  let tiers: PatreonTier[] = $state([]);
  let members: Array<{ id: string; name: string }> = $state([]);
  let loading = $state(true);
  let syncing = $state(false);
  let target: PatreonSupporter | null = $state(null);
  let pickedMember: string | null = $state(null);
  let saving = $state(false);

  const tierTitles = $derived(new Map(tiers.map((tier) => [tier.tierId, tier.tierTitle])));
  const memberNames = $derived(new Map(members.map((member) => [member.id, member.name])));

  const iconButton = $derived(
    `background: ${$colorStore.primary}10; color: ${$colorStore.text}; border: 1px solid ${$colorStore.primary}20;`
  );

  async function load() {
    loading = true;
    const [loadedSupporters, loadedTiers] = await Promise.allSettled([
      patreonApi.getPatreonSupporters(guildId),
      patreonApi.getPatreonTiers(guildId)
    ]);
    if (loadedSupporters.status === "fulfilled") supporters = loadedSupporters.value;
    else {
      logger.error("Failed to load supporters:", loadedSupporters.reason);
      notify(errorText(loadedSupporters.reason, m.patreon.errorLoadSupporters()), "error");
    }
    if (loadedTiers.status === "fulfilled") tiers = loadedTiers.value;
    loading = false;
  }

  async function loadMembers() {
    try {
      members = (await clientApi.getMembers(guildId))
        .map((x) => ({ id: idString(x.id), name: x.username ?? idString(x.id) }))
        .sort((a, b) => a.name.localeCompare(b.name));
    } catch (err) {
      logger.error("Failed to load members:", err);
    }
  }

  async function sync() {
    syncing = true;
    try {
      await patreonApi.triggerPatreonOperation(guildId, { operation: "sync" });
      await load();
    } catch (err) {
      logger.error("Failed to sync supporters:", err);
      notify(errorText(err, m.patreon.notifySyncFailed()), "error");
    } finally {
      syncing = false;
    }
  }

  async function link(supporter: PatreonSupporter, discordUserId: bigint) {
    saving = true;
    try {
      await patreonApi.linkPatreonSupporter(guildId, { patreonUserId: supporter.patreonUserId, discordUserId });
      target = null;
      pickedMember = null;
      await load();
    } catch (err) {
      logger.error("Failed to link a supporter:", err);
      notify(errorText(err, m.patreon.notifyLinkFailed()), "error");
    } finally {
      saving = false;
    }
  }

  function statusText(status: string | null) {
    if (status === "active_patron") return m.patreon.statusActive();
    if (status === "declined_patron") return m.patreon.statusDeclined();
    if (status === "former_patron") return m.patreon.statusFormer();
    return m.common.unknown();
  }

  onMount(() => {
    void load();
    void loadMembers();
  });
</script>

{#snippet syncButton()}
  <button type="button" class="flex items-center justify-center gap-2 px-5 rounded-xl min-h-[50px] font-medium"
          style={iconButton} disabled={syncing} onclick={sync}>
    <i class="fa-solid fa-rotate {syncing ? 'fa-spin' : ''}" aria-hidden="true"></i>
    {m.patreon.actionSyncNow()}
  </button>
{/snippet}

<PluginCard title={m.patreon.supportersAll({ count: supporters.length })} alwaysOpen actions={syncButton}>
  {#if loading && supporters.length === 0}
    <div class="flex justify-center py-8">
      <div class="w-8 h-8 border-4 rounded-full animate-spin"
           style="border-color: {$colorStore.primary}20; border-top-color: {$colorStore.primary};"></div>
    </div>
  {:else if supporters.length === 0}
    <p class="text-sm" style="color: {$colorStore.muted}">{m.patreon.supportersEmpty()}</p>
  {:else}
    <div class="space-y-2">
      {#each supporters as supporter (supporter.id)}
        {@const linked = hasId(supporter.discordUserId)}
        <div class="flex items-center gap-3 rounded-xl border p-2 pl-3 min-w-0"
             style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}20;">
          <div class="grow min-w-0">
            <p class="font-medium truncate" style="color: {$colorStore.text}">{supporter.fullName}</p>
            <p class="text-sm truncate" style="color: {$colorStore.muted}">
              {[
                tierTitles.get(supporter.tierId ?? "") ?? "",
                formatMoney(supporter.amountCents / 100),
                statusText(supporter.patronStatus),
                formatDate(supporter.pledgeRelationshipStart)
              ].filter(Boolean).join(" · ")}
            </p>
            {#if linked}
              <p class="text-xs truncate" style="color: {$colorStore.muted}">
                <i class="fa-solid fa-link mr-1" aria-hidden="true"></i>{memberNames.get(idString(supporter.discordUserId)) ?? idString(supporter.discordUserId)}
              </p>
            {/if}
          </div>
          {#if linked}
            <button type="button" class="rounded-lg min-h-[44px] min-w-[44px] shrink-0" style={iconButton}
                    aria-label={m.patreon.unlinkAria({ name: supporter.fullName })} disabled={saving}
                    onclick={() => link(supporter, 0n)}>
              <i class="fa-solid fa-link-slash" aria-hidden="true"></i>
            </button>
          {:else}
            <button type="button" class="rounded-lg min-h-[44px] min-w-[44px] shrink-0" style={iconButton}
                    aria-label={m.patreon.linkAria({ name: supporter.fullName })}
                    onclick={() => { target = supporter; pickedMember = null; }}>
              <i class="fa-solid fa-link" aria-hidden="true"></i>
            </button>
          {/if}
        </div>
      {/each}
    </div>
  {/if}
</PluginCard>

{#if target}
  {@const supporter = target}
  <Sheet title={m.patreon.linkTitle({ name: supporter.fullName })} onclose={() => (target = null)}>
    <SettingField label={m.common.member()} id="patreon-link-member">
      <DiscordSelector id="patreon-link-member" type="user" options={members} selected={pickedMember}
                       onchange={({ selected }) => (pickedMember = (selected as string) ?? null)} />
    </SettingField>
    {#snippet footer()}
      <button type="button" class="px-5 rounded-xl min-h-[50px] font-medium disabled:opacity-50"
              style="background: {$colorStore.primary}; color: {$colorStore.onPrimary};"
              disabled={!pickedMember || saving} onclick={() => pickedMember && link(supporter, BigInt(pickedMember))}>
        {m.patreon.linkButton()}
      </button>
    {/snippet}
  </Sheet>
{/if}
