<script lang="ts">
  import { m } from "$lib/i18n";
  import { customVoiceApi, type CustomVoiceChannelResponse } from "$lib/api/index.ts";
  import { logger } from "$lib/logger";
  import { colorStore } from "$lib/stores/colorStore";
  import { requestConfirmation } from "$lib/stores/confirmationStore";
  import PluginCard from "$lib/components/plugin/PluginCard.svelte";
  import { errorText, formatDate, idString, type Hub, type Named } from "./model";

  interface Props {
    guildId: bigint;
    channels: CustomVoiceChannelResponse[];
    voiceChannels: Named[];
    members: Named[];
    hubs: Hub[];
    onchange: (channels: CustomVoiceChannelResponse[]) => void;
    onreload: () => Promise<void>;
    notify: (message: string, type?: "success" | "error") => void;
  }

  let { guildId, channels, voiceChannels, members, hubs, onchange, onreload, notify }: Props = $props();

  let cleanupHours = $state(24);
  let busy = $state(false);

  const channelNames = $derived(new Map(voiceChannels.map((c) => [c.id, c.name])));
  const memberNames = $derived(new Map(members.map((c) => [c.id, c.name])));
  const hubNames = $derived(new Map(hubs.map((h) => [h.hubId, h.hubName || channelNames.get(h.hubId) || h.hubId])));

  const stats = $derived.by(() => {
    const hourAgo = Date.now() - 3600_000;
    return {
      total: channels.length,
      active: channels.filter((c) => new Date(/[zZ]|[+-]\d\d:?\d\d$/.test(c.lastActive) ? c.lastActive : `${c.lastActive}Z`).getTime() > hourAgo).length,
      locked: channels.filter((c) => c.isLocked).length,
      kept: channels.filter((c) => c.keepAlive).length
    };
  });

  const iconButton = $derived(
    `background: ${$colorStore.primary}10; color: ${$colorStore.text}; border: 1px solid ${$colorStore.primary}20;`
  );
  const selectedButton = $derived(
    `background: ${$colorStore.selectedSurface}; color: ${$colorStore.text}; border: 1px solid ${$colorStore.selectedBorder};`
  );

  function nameOf(channel: CustomVoiceChannelResponse): string {
    const id = idString(channel.channelId);
    return channelNames.get(id) ?? m.common.channelFallback({ id });
  }

  function replace(id: bigint, changes: Partial<CustomVoiceChannelResponse>) {
    onchange(channels.map((c) => (c.channelId === id ? { ...c, ...changes } : c)));
  }

  async function run(action: () => Promise<unknown>, done: () => void, failed: string) {
    try {
      await action();
      done();
    } catch (err) {
      logger.error("Custom voice channel action failed:", err);
      notify(errorText(err, failed), "error");
    }
  }

  const toggleLock = (c: CustomVoiceChannelResponse) =>
    run(
      () => customVoiceApi.updateCustomVoiceChannel(guildId, c.channelId, { isLocked: !c.isLocked }),
      () => replace(c.channelId, { isLocked: !c.isLocked }),
      m.customvoice.notifyUpdateFailed()
    );

  const toggleHidden = (c: CustomVoiceChannelResponse) =>
    run(
      () => customVoiceApi.setCustomVoiceChannelHidden(guildId, c.channelId, !c.isHidden),
      () => replace(c.channelId, { isHidden: !c.isHidden }),
      m.customvoice.notifyUpdateFailed()
    );

  const toggleKeep = (c: CustomVoiceChannelResponse) =>
    run(
      () => customVoiceApi.updateCustomVoiceChannel(guildId, c.channelId, { keepAlive: !c.keepAlive }),
      () => replace(c.channelId, { keepAlive: !c.keepAlive }),
      m.customvoice.notifyUpdateFailed()
    );

  async function remove(c: CustomVoiceChannelResponse) {
    const ok = await requestConfirmation({
      title: m.customvoice.channelDeleteTitle(),
      message: m.customvoice.channelDeleteMessage({ name: nameOf(c) }),
      confirmText: m.common.delete()
    });
    if (!ok) return;
    await run(
      () => customVoiceApi.deleteCustomVoiceChannel(guildId, c.channelId),
      () => {
        onchange(channels.filter((x) => x.channelId !== c.channelId));
        notify(m.customvoice.notifyDeleted());
      },
      m.customvoice.notifyDeleteFailed()
    );
  }

  async function cleanup() {
    const ok = await requestConfirmation({
      message: m.customvoice.cleanupConfirmMessage({ hours: cleanupHours }),
      confirmText: m.customvoice.cleanupConfirm(),
      variant: "warning"
    });
    if (!ok) return;
    busy = true;
    try {
      const result = await customVoiceApi.cleanupInactiveChannels(guildId, cleanupHours);
      notify((result.deletedChannels === 1 ? m.customvoice.notifyCleanupDoneOne : m.customvoice.notifyCleanupDoneOther)({ count: result.deletedChannels }));
      await onreload();
    } catch (err) {
      logger.error("Failed to clean up channels:", err);
      notify(errorText(err, m.customvoice.notifyCleanupFailed()), "error");
    } finally {
      busy = false;
    }
  }
</script>

<div class="space-y-4 min-w-0">
  <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
    {#each [
      { label: m.customvoice.statTotal(), value: stats.total, icon: "fa-microphone" },
      { label: m.customvoice.statActive(), value: stats.active, icon: "fa-bolt" },
      { label: m.common.locked(), value: stats.locked, icon: "fa-lock" },
      { label: m.customvoice.statKeptAlive(), value: stats.kept, icon: "fa-thumbtack" }
    ] as stat (stat.label)}
      <div class="rounded-xl border p-4 min-w-0" style="border-color: {$colorStore.primary}20; background: {$colorStore.primary}08;">
        <div class="flex items-center gap-2 mb-1 min-w-0">
          <i class="fa-solid {stat.icon}" style="color: {$colorStore.primary}" aria-hidden="true"></i>
          <span class="text-xs truncate" style="color: {$colorStore.muted}">{stat.label}</span>
        </div>
        <div class="text-2xl font-bold" style="color: {$colorStore.text}">{stat.value}</div>
      </div>
    {/each}
  </div>

  <PluginCard title={m.customvoice.tabChannels()} alwaysOpen>
    {#each channels as channel (idString(channel.channelId))}
      <div class="rounded-xl border p-3 space-y-3 min-w-0" style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}20;">
        <div class="min-w-0">
          <p class="font-medium truncate" style="color: {$colorStore.text}">{nameOf(channel)}</p>
          <p class="text-sm" style="color: {$colorStore.muted}">
            {m.customvoice.ownerName({ name: memberNames.get(idString(channel.ownerId)) ?? idString(channel.ownerId) })}
            {#if channel.hubVoiceChannelId} · {hubNames.get(idString(channel.hubVoiceChannelId)) ?? ""}{/if}
            · {formatDate(channel.createdAt)}
          </p>
        </div>
        <div class="grid grid-cols-4 gap-2">
          <button type="button" class="rounded-lg min-h-[44px]" style={channel.isLocked ? selectedButton : iconButton}
                  aria-pressed={channel.isLocked} aria-label={channel.isLocked ? m.customvoice.channelUnlock() : m.customvoice.channelLock()}
                  title={channel.isLocked ? m.customvoice.channelUnlock() : m.customvoice.channelLock()}
                  onclick={() => toggleLock(channel)}>
            <i class="fa-solid {channel.isLocked ? 'fa-lock' : 'fa-unlock'}" aria-hidden="true"></i>
          </button>
          <button type="button" class="rounded-lg min-h-[44px]" style={channel.isHidden ? selectedButton : iconButton}
                  aria-pressed={!!channel.isHidden} aria-label={channel.isHidden ? m.customvoice.channelReveal() : m.customvoice.channelHide()}
                  title={channel.isHidden ? m.customvoice.channelReveal() : m.customvoice.channelHide()}
                  onclick={() => toggleHidden(channel)}>
            <i class="fa-solid {channel.isHidden ? 'fa-eye-slash' : 'fa-eye'}" aria-hidden="true"></i>
          </button>
          <button type="button" class="rounded-lg min-h-[44px]" style={channel.keepAlive ? selectedButton : iconButton}
                  aria-pressed={channel.keepAlive} aria-label={m.customvoice.channelKeepAlive()} title={m.customvoice.channelKeepAlive()}
                  onclick={() => toggleKeep(channel)}>
            <i class="fa-solid fa-thumbtack" aria-hidden="true"></i>
          </button>
          <button type="button" class="rounded-lg min-h-[44px]" style={iconButton}
                  aria-label={m.customvoice.channelDelete()} title={m.customvoice.channelDelete()}
                  onclick={() => remove(channel)}>
            <i class="fa-solid fa-trash" aria-hidden="true"></i>
          </button>
        </div>
      </div>
    {:else}
      <p class="text-sm py-6 text-center" style="color: {$colorStore.muted}">{m.customvoice.emptyTitle()}</p>
    {/each}
  </PluginCard>

  <PluginCard title={m.customvoice.cleanupTitle()} alwaysOpen>
    <div class="flex gap-3 items-stretch">
      <input type="number" min="1" max="720" bind:value={cleanupHours} aria-label={m.customvoice.cleanupInactiveFor()}
             class="w-28 shrink-0 p-3 rounded-lg border min-h-[50px]"
             style="background: {$colorStore.primary}10; border-color: {$colorStore.primary}30; color: {$colorStore.text};">
      <button type="button" disabled={busy || !cleanupHours || cleanupHours < 1}
              class="grow px-4 rounded-xl min-h-[50px] font-medium flex items-center justify-center gap-2 disabled:opacity-50"
              style="background: {$colorStore.primary}; color: {$colorStore.onPrimary};" onclick={cleanup}>
        <i class="fa-solid fa-broom" aria-hidden="true"></i>{m.customvoice.cleanupButton()}
      </button>
    </div>
  </PluginCard>
</div>
