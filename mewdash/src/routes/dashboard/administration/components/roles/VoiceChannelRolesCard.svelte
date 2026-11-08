<script lang="ts">
  import { m } from "$lib/i18n";
  import { administrationApi } from "$lib/api/index.ts";
  import { colorStore } from "$lib/stores/colorStore";
  import { logger } from "$lib/logger";
  import { requestConfirmation } from "$lib/stores/confirmationStore";
  import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";
  import PluginCard from "$lib/components/plugin/PluginCard.svelte";
  import { errorText, type Named, type Notify } from "../toolsModel";
  import RoleRow from "./RoleRow.svelte";

  interface Props {
    guildId: bigint;
    roles: Named[];
    voiceChannels: Named[];
    notify: Notify;
  }

  let { guildId, roles, voiceChannels, notify }: Props = $props();

  type Mapping = { channelId: bigint; channelName: string; roleId: bigint; roleName: string };

  let items: Mapping[] = $state([]);
  let loading = $state(true);
  let busy = $state(false);
  let channelId: string | null = $state(null);
  let roleId: string | null = $state(null);

  async function load() {
    try {
      items = (await administrationApi.getVoiceChannelRoles(guildId)) ?? [];
    } catch (err) {
      logger.error("Failed to load voice channel roles:", err);
      notify(errorText(err, m.administrationRoles.loadFailed()), "error");
    } finally {
      loading = false;
    }
  }

  async function add() {
    if (busy || !channelId || !roleId) return;
    busy = true;
    try {
      await administrationApi.addVoiceChannelRole(guildId, {
        channelId: BigInt(channelId),
        roleId: BigInt(roleId)
      });
      channelId = null;
      roleId = null;
      notify(m.administrationRoles.added());
      await load();
    } catch (err) {
      logger.error("Failed to add voice channel role:", err);
      notify(errorText(err, m.administrationRoles.addFailed()), "error");
    } finally {
      busy = false;
    }
  }

  async function remove(item: Mapping) {
    const confirmed = await requestConfirmation({
      message: m.administrationRoles.voiceRemoveConfirm({ channel: item.channelName }),
      confirmText: m.common.remove()
    });
    if (!confirmed) return;
    try {
      await administrationApi.removeVoiceChannelRole(guildId, item.channelId);
      notify(m.administrationRoles.removed());
    } catch (err) {
      logger.error("Failed to remove voice channel role:", err);
      notify(errorText(err, m.administrationRoles.removeFailed()), "error");
    }
    await load();
  }

  void load();
</script>

<PluginCard title={m.administrationRoles.voiceTitle()} alwaysOpen>
  <div class="space-y-3">
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <DiscordSelector
        type="channel"
        options={voiceChannels}
        selected={channelId}
        placeholder={m.common.selectVoiceChannelPlaceholder()}
        onchange={(detail) => (channelId = typeof detail.selected === "string" ? detail.selected : null)}
      />
      <DiscordSelector
        type="role"
        options={roles}
        selected={roleId}
        placeholder={m.common.selectARolePlaceholder()}
        onchange={(detail) => (roleId = typeof detail.selected === "string" ? detail.selected : null)}
      />
    </div>
    <button
      type="button"
      class="flex items-center justify-center gap-2 px-5 rounded-xl min-h-[50px] w-full sm:w-auto font-medium disabled:opacity-50"
      style="background: {$colorStore.primary}; color: {$colorStore.onPrimary};"
      disabled={busy || !channelId || !roleId}
      onclick={add}
    >
      <i class="fa-solid fa-plus" aria-hidden="true"></i>
      {m.common.add()}
    </button>

    {#if loading}
      <div class="flex justify-center py-6">
        <div class="w-10 h-10 border-4 rounded-full animate-spin" style="border-color: {$colorStore.primary}20; border-top-color: {$colorStore.primary}"></div>
      </div>
    {:else if items.length === 0}
      <p class="py-4 text-center" style="color: {$colorStore.muted}">{m.administrationRoles.voiceEmpty()}</p>
    {:else}
      <div class="space-y-2">
        {#each items as item (`${item.channelId}-${item.roleId}`)}
          <RoleRow
            title={item.channelName}
            subtitle={item.roleName}
            removeLabel={m.administrationRoles.voiceRemoveAria({ channel: item.channelName })}
            onremove={() => remove(item)}
          />
        {/each}
      </div>
    {/if}
  </div>
</PluginCard>
