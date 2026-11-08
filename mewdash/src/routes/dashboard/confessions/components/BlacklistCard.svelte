<script lang="ts">
  import { m } from "$lib/i18n";
  import { confessionsApi } from "$lib/api/index.ts";
  import { colorStore } from "$lib/stores/colorStore";
  import { logger } from "$lib/logger";
  import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";
  import PluginCard from "$lib/components/plugin/PluginCard.svelte";
  import { errorText, type Named } from "./confessionsModel";

  interface Props {
    guildId: bigint;
    roles: Named[];
    members: Named[];
    blocked: string[];
    onerror: (message: string) => void;
  }

  let { guildId, roles, members, blocked = $bindable(), onerror }: Props = $props();

  let pickedRole: string | null = $state(null);
  let pickedMember: string | null = $state(null);
  let busy = $state(false);

  const roleNames = $derived(new Map(roles.map((role) => [role.id, role.name])));
  const memberNames = $derived(new Map(members.map((member) => [member.id, member.name])));
  const blockedRoles = $derived(blocked.filter((id) => roleNames.has(id)));
  const blockedMembers = $derived(blocked.filter((id) => !roleNames.has(id)));

  const iconButton = $derived(
    `background: ${$colorStore.primary}10; color: ${$colorStore.text}; border: 1px solid ${$colorStore.primary}20;`
  );

  async function toggle(id: string) {
    if (busy) return;
    busy = true;
    try {
      const result = await confessionsApi.toggleConfessionBlacklist(guildId, BigInt(id));
      blocked = result.isBlacklisted ? [...blocked.filter((x) => x !== id), id] : blocked.filter((x) => x !== id);
    } catch (err) {
      logger.error("Failed to update the confession blacklist:", err);
      onerror(errorText(err, m.common.failedToUpdateBlacklist()));
    } finally {
      busy = false;
    }
  }

  async function blockRole() {
    if (!pickedRole) return;
    const id = pickedRole;
    pickedRole = null;
    await toggle(id);
  }

  async function blockMember() {
    if (!pickedMember) return;
    const id = pickedMember;
    pickedMember = null;
    await toggle(id);
  }
</script>

{#snippet row(id: string, name: string)}
  <div class="flex items-center gap-3 rounded-xl border p-2 pl-3 min-w-0" style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}20;">
    <span class="grow min-w-0 truncate text-sm" style="color: {$colorStore.text}">{name}</span>
    <button
      type="button"
      class="rounded-lg min-h-[44px] min-w-[44px] shrink-0 disabled:opacity-50"
      style={iconButton}
      disabled={busy}
      aria-label={m.confessions.unblockAria({ name })}
      onclick={() => toggle(id)}
    >
      <i class="fa-solid fa-xmark" aria-hidden="true"></i>
    </button>
  </div>
{/snippet}

<PluginCard title={m.confessions.pageBlacklistTitle()} alwaysOpen>
  <div class="space-y-2">
    <h4 class="text-sm font-medium" style="color: {$colorStore.text}">{m.common.roles()}</h4>
    {#each blockedRoles as id (id)}
      {@render row(id, roleNames.get(id) ?? id)}
    {:else}
      <p class="text-sm" style="color: {$colorStore.muted}">{m.confessions.noBlockedRoles()}</p>
    {/each}
    <div class="flex gap-3 items-stretch">
      <div class="grow min-w-0">
        <DiscordSelector
          type="role"
          options={roles.filter((role) => !blocked.includes(role.id))}
          selected={pickedRole}
          ariaLabel={m.common.role()}
          onchange={({ selected }) => (pickedRole = (selected as string) ?? null)}
        />
      </div>
      <button
        type="button"
        class="px-5 rounded-xl min-h-[50px] font-medium disabled:opacity-50"
        style="background: {$colorStore.primary}; color: {$colorStore.onPrimary};"
        disabled={!pickedRole || busy}
        onclick={blockRole}
      >
        {m.common.block()}
      </button>
    </div>
  </div>

  <div class="space-y-2">
    <h4 class="text-sm font-medium" style="color: {$colorStore.text}">{m.common.members()}</h4>
    {#each blockedMembers as id (id)}
      {@render row(id, memberNames.get(id) ?? id)}
    {:else}
      <p class="text-sm" style="color: {$colorStore.muted}">{m.confessions.noBlockedMembers()}</p>
    {/each}
    <div class="flex gap-3 items-stretch">
      <div class="grow min-w-0">
        <DiscordSelector
          type="user"
          options={members.filter((member) => !blocked.includes(member.id))}
          selected={pickedMember}
          ariaLabel={m.common.member()}
          onchange={({ selected }) => (pickedMember = (selected as string) ?? null)}
        />
      </div>
      <button
        type="button"
        class="px-5 rounded-xl min-h-[50px] font-medium disabled:opacity-50"
        style="background: {$colorStore.primary}; color: {$colorStore.onPrimary};"
        disabled={!pickedMember || busy}
        onclick={blockMember}
      >
        {m.common.block()}
      </button>
    </div>
  </div>
</PluginCard>
