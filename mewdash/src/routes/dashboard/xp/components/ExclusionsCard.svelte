<script lang="ts">
  import { m } from "$lib/i18n";
  import { onMount } from "svelte";
  import { clientApi, xpApi } from "$lib/api/index.ts";
  import { colorStore } from "$lib/stores/colorStore";
  import { logger } from "$lib/logger";
  import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";
  import PluginCard from "$lib/components/plugin/PluginCard.svelte";
  import { errorText, idString, type Channel, type Role } from "./xpModel";

  interface Props {
    guildId: bigint;
    channels: Channel[];
    roles: Role[];
    onerror: (message: string) => void;
  }

  let { guildId, channels, roles, onerror }: Props = $props();

  let channelIds: string[] = $state([]);
  let roleIds: string[] = $state([]);
  let users: Array<{ id: string; name: string }> = $state([]);
  let members: Array<{ id: string; name: string }> = $state([]);
  let pickedChannel: string | null = $state(null);
  let pickedRole: string | null = $state(null);
  let pickedUser: string | null = $state(null);

  const iconButton = $derived(
    `background: ${$colorStore.primary}10; color: ${$colorStore.text}; border: 1px solid ${$colorStore.primary}20;`
  );

  const channelNames = $derived(new Map(channels.map((x) => [x.id, x.name])));
  const roleNames = $derived(new Map(roles.map((x) => [x.id, x.name])));

  async function load() {
    try {
      const [loadedChannels, loadedRoles, loadedUsers] = await Promise.all([
        xpApi.getXpExcludedChannels(guildId),
        xpApi.getXpExcludedRoles(guildId),
        xpApi.getXpExcludedUsers(guildId)
      ]);
      channelIds = loadedChannels.map(idString);
      roleIds = loadedRoles.map(idString);
      users = loadedUsers.map((x) => ({ id: idString(x.userId), name: x.username ?? idString(x.userId) }));
    } catch (err) {
      logger.error("Failed to load XP exclusions:", err);
      onerror(errorText(err, m.xp.errorLoadExclusions()));
    }
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

  async function excludeUser() {
    if (!pickedUser) return;
    const id = pickedUser;
    pickedUser = null;
    await run(() => xpApi.excludeXpUser(guildId, BigInt(id)));
  }

  async function run(action: () => Promise<unknown>) {
    try {
      await action();
      await load();
    } catch (err) {
      logger.error("Failed to change XP exclusions:", err);
      onerror(errorText(err, m.xp.errorSaveExclusion()));
    }
  }

  async function excludeChannel() {
    if (!pickedChannel) return;
    const id = pickedChannel;
    pickedChannel = null;
    await run(() => xpApi.excludeXpChannel(guildId, BigInt(id)));
  }

  async function excludeRole() {
    if (!pickedRole) return;
    const id = pickedRole;
    pickedRole = null;
    await run(() => xpApi.excludeXpRole(guildId, BigInt(id)));
  }

  onMount(() => {
    void load();
    void loadMembers();
  });
</script>

<PluginCard title={m.xp.cardExclusionsTitle()} alwaysOpen>
  <div class="space-y-2">
    <h4 class="text-sm font-medium" style="color: {$colorStore.text}">{m.xp.excludedChannels()}</h4>
    {#each channelIds as id (id)}
      <div class="flex items-center gap-3 rounded-xl border p-2 pl-3 min-w-0"
           style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}20;">
        <span class="grow min-w-0 truncate text-sm" style="color: {$colorStore.text}">#{channelNames.get(id) ?? id}</span>
        <button type="button" class="rounded-lg min-h-[44px] min-w-[44px] shrink-0" style={iconButton}
                aria-label={m.xp.includeAria({ name: channelNames.get(id) ?? id })}
                onclick={() => run(() => xpApi.includeXpChannel(guildId, BigInt(id)))}>
          <i class="fa-solid fa-xmark" aria-hidden="true"></i>
        </button>
      </div>
    {:else}
      <p class="text-sm" style="color: {$colorStore.muted}">{m.xp.noExcludedChannels()}</p>
    {/each}
    <div class="flex gap-3 items-stretch">
      <div class="grow min-w-0">
        <DiscordSelector type="channel" options={channels.filter((x) => !channelIds.includes(x.id))}
                         selected={pickedChannel} ariaLabel={m.common.channel()}
                         onchange={({ selected }) => (pickedChannel = (selected as string) ?? null)} />
      </div>
      <button type="button" class="px-5 rounded-xl min-h-[50px] font-medium disabled:opacity-50"
              style="background: {$colorStore.primary}; color: {$colorStore.onPrimary};"
              disabled={!pickedChannel} onclick={excludeChannel}>
        {m.xp.exclude()}
      </button>
    </div>
  </div>

  <div class="space-y-2">
    <h4 class="text-sm font-medium" style="color: {$colorStore.text}">{m.xp.excludedRoles()}</h4>
    {#each roleIds as id (id)}
      <div class="flex items-center gap-3 rounded-xl border p-2 pl-3 min-w-0"
           style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}20;">
        <span class="grow min-w-0 truncate text-sm" style="color: {$colorStore.text}">{roleNames.get(id) ?? id}</span>
        <button type="button" class="rounded-lg min-h-[44px] min-w-[44px] shrink-0" style={iconButton}
                aria-label={m.xp.includeAria({ name: roleNames.get(id) ?? id })}
                onclick={() => run(() => xpApi.includeXpRole(guildId, BigInt(id)))}>
          <i class="fa-solid fa-xmark" aria-hidden="true"></i>
        </button>
      </div>
    {:else}
      <p class="text-sm" style="color: {$colorStore.muted}">{m.xp.noExcludedRoles()}</p>
    {/each}
    <div class="flex gap-3 items-stretch">
      <div class="grow min-w-0">
        <DiscordSelector type="role" options={roles.filter((x) => !roleIds.includes(x.id))}
                         selected={pickedRole} ariaLabel={m.common.role()}
                         onchange={({ selected }) => (pickedRole = (selected as string) ?? null)} />
      </div>
      <button type="button" class="px-5 rounded-xl min-h-[50px] font-medium disabled:opacity-50"
              style="background: {$colorStore.primary}; color: {$colorStore.onPrimary};"
              disabled={!pickedRole} onclick={excludeRole}>
        {m.xp.exclude()}
      </button>
    </div>
  </div>

  <div class="space-y-2">
    <h4 class="text-sm font-medium" style="color: {$colorStore.text}">{m.xp.excludedMembers()}</h4>
    {#each users as user (user.id)}
      <div class="flex items-center gap-3 rounded-xl border p-2 pl-3 min-w-0"
           style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}20;">
        <span class="grow min-w-0 truncate text-sm" style="color: {$colorStore.text}">{user.name}</span>
        <button type="button" class="rounded-lg min-h-[44px] min-w-[44px] shrink-0" style={iconButton}
                aria-label={m.xp.includeAria({ name: user.name })}
                onclick={() => run(() => xpApi.includeXpUser(guildId, BigInt(user.id)))}>
          <i class="fa-solid fa-xmark" aria-hidden="true"></i>
        </button>
      </div>
    {:else}
      <p class="text-sm" style="color: {$colorStore.muted}">{m.xp.noExcludedMembers()}</p>
    {/each}
    <div class="flex gap-3 items-stretch">
      <div class="grow min-w-0">
        <DiscordSelector type="user" options={members.filter((x) => !users.some((u) => u.id === x.id))}
                         selected={pickedUser} ariaLabel={m.common.member()}
                         onchange={({ selected }) => (pickedUser = (selected as string) ?? null)} />
      </div>
      <button type="button" class="px-5 rounded-xl min-h-[50px] font-medium disabled:opacity-50"
              style="background: {$colorStore.primary}; color: {$colorStore.onPrimary};"
              disabled={!pickedUser} onclick={excludeUser}>
        {m.xp.exclude()}
      </button>
    </div>
  </div>
</PluginCard>
