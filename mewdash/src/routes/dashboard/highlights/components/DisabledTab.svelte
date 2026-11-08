<script lang="ts">
  import { m } from "$lib/i18n";
  import { colorStore } from "$lib/stores/colorStore";
  import PluginCard from "$lib/components/plugin/PluginCard.svelte";
  import { knownName, type DisabledUser } from "./highlightsModel";

  interface Props {
    users: DisabledUser[];
    loading: boolean;
  }

  let { users, loading }: Props = $props();
</script>

<PluginCard title={m.highlights.pageDisabledTitle({ count: users.length })} alwaysOpen>
  {#if loading}
    <div class="flex justify-center py-6">
      <div class="w-10 h-10 border-4 rounded-full animate-spin" style="border-color: {$colorStore.primary}20; border-top-color: {$colorStore.primary}"></div>
    </div>
  {:else if users.length === 0}
    <div class="flex flex-col items-center gap-3 py-8 text-center">
      <i class="fa-solid fa-eye" style="color: {$colorStore.muted}; font-size: 28px;" aria-hidden="true"></i>
      <p style="color: {$colorStore.muted}">{m.highlights.pageDisabledEmptyTitle()}</p>
    </div>
  {:else}
    <div class="space-y-2">
      {#each users as user (String(user.userId))}
        <div class="rounded-xl border p-3 min-w-0" style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}20;">
          <span class="block text-sm font-semibold truncate" style="color: {$colorStore.text}">
            {knownName(user.username) ?? m.common.userFallback({ id: String(user.userId) })}
          </span>
          <span class="block text-sm" style="color: {$colorStore.muted}">
            {m.highlights.pageDisabledIgnoring({ channels: user.ignoredChannelsCount, users: user.ignoredUsersCount })}
          </span>
        </div>
      {/each}
    </div>
  {/if}
</PluginCard>
