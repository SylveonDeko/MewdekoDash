<script lang="ts">
  import { onMount } from "svelte";
  import { m } from "$lib/i18n";
  import { inviteTrackingApi, type InvitedPage } from "$lib/api/index.ts";
  import { colorStore } from "$lib/stores/colorStore";
  import { logger } from "$lib/logger";
  import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";
  import SettingField from "$lib/components/forms/SettingField.svelte";
  import ToggleRow from "$lib/components/forms/ToggleRow.svelte";
  import PluginCard from "$lib/components/plugin/PluginCard.svelte";
  import { formatAgo, formatNumber, saveBlob } from "$lib/components/stats/format";
  import { errorText, type Member } from "./inviteModel";

  interface Props {
    guildId: bigint;
    members: Member[];
    onerror: (message: string) => void;
  }

  let { guildId, members, onerror }: Props = $props();

  const PAGE_SIZE = 10;

  let inviter: string | null = $state(null);
  let code = $state("");
  let label = $state("");
  let includeLeft = $state(true);
  let page = $state(1);
  let result: InvitedPage | null = $state(null);
  let loaded = $state(false);

  const pages = $derived.by(() => {
    const current = result as InvitedPage | null;
    return current ? Math.max(1, Math.ceil(current.total / PAGE_SIZE)) : 1;
  });
  const iconButton = $derived(
    `background: ${$colorStore.primary}10; color: ${$colorStore.text}; border: 1px solid ${$colorStore.primary}20;`
  );
  const inputStyle = $derived(
    `background: ${$colorStore.primary}10; border-color: ${$colorStore.primary}30; color: ${$colorStore.text};`
  );

  function nameOf(id: bigint | string): string {
    const key = id.toString();
    return members.find(member => member.id === key)?.name ?? key;
  }

  function filters() {
    return {
      inviterId: inviter ? BigInt(inviter) : undefined,
      code: code.trim() || undefined,
      label: label.trim() || undefined
    };
  }

  async function load() {
    try {
      result = await inviteTrackingApi.getInvited(guildId, { ...filters(), includeLeft }, page, PAGE_SIZE);
    } catch (err) {
      logger.error("Failed to load invited members:", err);
      onerror(errorText(err, m.invites.errorLoadMembers()));
    } finally {
      loaded = true;
    }
  }

  function restart() {
    page = 1;
    void load();
  }

  function go(next: number) {
    if (next < 1 || next > pages) return;
    page = next;
    void load();
  }

  async function exportCsv() {
    try {
      saveBlob(await inviteTrackingApi.exportInvited(guildId, filters()), "invited-members.csv");
    } catch (err) {
      logger.error("Failed to export invited members:", err);
      onerror(errorText(err, m.invites.errorExportMembers()));
    }
  }

  onMount(() => {
    void load();
  });
</script>

{#snippet exportButton()}
  <button type="button" class="flex items-center justify-center gap-2 px-5 rounded-xl min-h-[50px] font-medium" style={iconButton} onclick={exportCsv}>
    <i class="fa-solid fa-download" aria-hidden="true"></i>
    CSV
  </button>
{/snippet}

<PluginCard title={m.invites.membersTitle()} actions={exportButton} alwaysOpen>
  <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
    <SettingField label={m.placeholders.categoryInviter()} id="invites-filter-inviter">
      <DiscordSelector id="invites-filter-inviter" type="custom" options={members} customIcon="fa-user" placeholder={m.common.pickMemberPlaceholder()} bind:selected={inviter} onchange={restart} />
    </SettingField>
    <SettingField label={m.invites.membersColCode()} id="invites-filter-code">
      <input id="invites-filter-code" type="text" bind:value={code} onchange={restart} class="w-full p-3 rounded-lg border focus:ring-2 min-h-[50px]" style={inputStyle}>
    </SettingField>
    <SettingField label={m.common.label()} id="invites-filter-label">
      <input id="invites-filter-label" type="text" bind:value={label} onchange={restart} class="w-full p-3 rounded-lg border focus:ring-2 min-h-[50px]" style={inputStyle}>
    </SettingField>
  </div>
  <ToggleRow checked={includeLeft} title={m.invites.membersIncludeLeft()} colors={$colorStore} onchange={(value) => { includeLeft = value; restart(); }} />

  {#if result && result.items.length > 0}
    {#each result.items as item (item.userId.toString() + (item.joinedAt ?? ""))}
      <div class="flex items-center gap-3 rounded-xl border p-3 min-w-0" style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}20;">
        {#if item.avatarUrl}
          <img src={item.avatarUrl} alt="" class="w-9 h-9 rounded-full shrink-0" loading="lazy" />
        {/if}
        <div class="grow min-w-0">
          <p class="text-sm font-semibold truncate" style="color: {$colorStore.text}">{item.username ?? item.userId.toString()}</p>
          <p class="text-xs truncate" style="color: {$colorStore.muted}">
            {[
              item.inviterId && item.inviterId !== 0n ? nameOf(item.inviterId) : item.joinType,
              item.inviteCode,
              formatAgo(item.joinedAt)
            ].filter(Boolean).join(" · ")}
          </p>
        </div>
        <span
          class="shrink-0 text-xs px-2 py-0.5 rounded-full"
          style="background: {$colorStore.primary}15; color: {$colorStore.text};"
        >
          {item.isFake ? m.invites.membersPillFake({ reason: item.fakeReason }) : item.leftAt ? m.invites.membersPillLeft() : m.common.present()}
        </span>
      </div>
    {/each}
  {:else if loaded}
    <p class="text-sm" style="color: {$colorStore.muted}">{m.invites.membersEmpty()}</p>
  {/if}

  <div class="flex items-center justify-between gap-3">
    <button type="button" class="px-4 rounded-xl min-h-[44px] disabled:opacity-50" style={iconButton} disabled={page <= 1} aria-label={m.common.previous()} onclick={() => go(page - 1)}>
      <i class="fa-solid fa-chevron-left" aria-hidden="true"></i>
    </button>
    <span class="text-sm tabular-nums text-center" style="color: {$colorStore.muted}">
      {m.invites.membersPager({ page, pages, total: formatNumber(result?.total ?? 0) })}
    </span>
    <button type="button" class="px-4 rounded-xl min-h-[44px] disabled:opacity-50" style={iconButton} disabled={page >= pages} aria-label={m.common.next()} onclick={() => go(page + 1)}>
      <i class="fa-solid fa-chevron-right" aria-hidden="true"></i>
    </button>
  </div>
</PluginCard>
