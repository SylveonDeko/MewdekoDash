<script lang="ts">
  import { m } from "$lib/i18n";
  import { administrationApi } from "$lib/api/index.ts";
  import { colorStore } from "$lib/stores/colorStore";
  import { logger } from "$lib/logger";
  import { requestConfirmation } from "$lib/stores/confirmationStore";
  import PluginCard from "$lib/components/plugin/PluginCard.svelte";
  import type { DiscordUser } from "$lib/types/discord";
  import { errorText, type Named, type Notify } from "../toolsModel";
  import ReactionRoleSheet from "./ReactionRoleSheet.svelte";
  import RoleRow from "./RoleRow.svelte";

  interface Props {
    guildId: bigint;
    roles: Named[];
    textChannels: Named[];
    notify: Notify;
    user?: DiscordUser | null;
  }

  let { guildId, roles, textChannels, notify, user = null }: Props = $props();

  type Message = {
    index: number;
    messageId: bigint;
    channelId: bigint;
    exclusive: boolean;
    reactionRoles: Array<{ emoteName: string; roleId: bigint }>;
  };

  let items: Message[] = $state([]);
  let loading = $state(true);
  let creating = $state(false);

  const channelLabel = (id: bigint) => {
    const channel = textChannels.find(c => c.id === id.toString());
    return channel ? `#${channel.name}` : m.common.channelFallback({ id: id.toString() });
  };

  async function load() {
    try {
      const data = await administrationApi.getReactionRoles(guildId);
      items = data?.success && Array.isArray(data.reactionRoles) ? data.reactionRoles : [];
    } catch (err) {
      logger.error("Failed to load reaction roles:", err);
      notify(errorText(err, m.administrationRoles.loadFailed()), "error");
    } finally {
      loading = false;
    }
  }

  async function remove(item: Message) {
    const confirmed = await requestConfirmation({
      message: m.administrationRoles.reactionRemoveConfirm(),
      confirmText: m.common.remove()
    });
    if (!confirmed) return;
    try {
      await administrationApi.removeReactionRoles(guildId, item.index);
      notify(m.administrationRoles.removed());
    } catch (err) {
      logger.error("Failed to remove reaction roles:", err);
      notify(errorText(err, m.administrationRoles.removeFailed()), "error");
    }
    await load();
  }

  async function created() {
    creating = false;
    notify(m.administrationRoles.added());
    await load();
  }

  void load();
</script>

<PluginCard title={m.common.reactionRoles()} alwaysOpen>
  <div class="space-y-3">
    <div class="flex flex-col sm:flex-row gap-3">
      <button
        type="button"
        class="flex items-center justify-center gap-2 px-5 rounded-xl min-h-[50px] font-medium"
        style="background: {$colorStore.primary}; color: {$colorStore.onPrimary};"
        onclick={() => (creating = true)}
      >
        <i class="fa-solid fa-plus" aria-hidden="true"></i>
        {m.administrationRoles.reactionNew()}
      </button>
      <a
        href="/dashboard/roles?tab=menus"
        class="flex items-center justify-between gap-3 px-4 rounded-xl min-h-[50px]"
        style="background: {$colorStore.primary}08; color: {$colorStore.text};"
      >
        <span class="truncate">{m.features.roleMenusName()}</span>
        <i class="fa-solid fa-arrow-right shrink-0" style="color: {$colorStore.primary}" aria-hidden="true"></i>
      </a>
    </div>

    {#if loading}
      <div class="flex justify-center py-6">
        <div class="w-10 h-10 border-4 rounded-full animate-spin" style="border-color: {$colorStore.primary}20; border-top-color: {$colorStore.primary}"></div>
      </div>
    {:else if items.length === 0}
      <p class="py-4 text-center" style="color: {$colorStore.muted}">{m.administrationRoles.reactionEmpty()}</p>
    {:else}
      <div class="space-y-2">
        {#each items as item (`${item.messageId}-${item.index}`)}
          <RoleRow
            title={m.administrationRoles.reactionMessage({ id: item.messageId.toString() })}
            subtitle={m.administrationRoles.reactionSummary({ channel: channelLabel(item.channelId), count: item.reactionRoles.length })}
            removeLabel={m.administrationRoles.reactionRemoveAria({ id: item.messageId.toString() })}
            onremove={() => remove(item)}
          />
        {/each}
      </div>
    {/if}
  </div>
</PluginCard>

{#if creating}
  <ReactionRoleSheet
    {guildId}
    {roles}
    {textChannels}
    existing={items}
    {notify}
    {user}
    onclose={() => (creating = false)}
    ondone={created}
  />
{/if}
