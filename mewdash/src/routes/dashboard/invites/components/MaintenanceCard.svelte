<script lang="ts">
  import { m } from "$lib/i18n";
  import { InviteResetScope, inviteTrackingApi } from "$lib/api/index.ts";
  import { colorStore } from "$lib/stores/colorStore";
  import { logger } from "$lib/logger";
  import { requestConfirmation } from "$lib/stores/confirmationStore";
  import PluginCard from "$lib/components/plugin/PluginCard.svelte";
  import { errorText } from "./inviteModel";

  interface Props {
    guildId: bigint;
    onchanged: () => void;
    onerror: (message: string) => void;
    onsuccess: (message: string) => void;
  }

  let { guildId, onchanged, onerror, onsuccess }: Props = $props();

  let busy = $state(false);

  const buttonStyle = $derived(
    `background: ${$colorStore.primary}20; color: ${$colorStore.text}; border: 1px solid ${$colorStore.primary}30;`
  );

  async function sync() {
    busy = true;
    try {
      const raised = await inviteTrackingApi.sync(guildId);
      onsuccess(m.invites.notifySynced({ count: raised }));
      onchanged();
    } catch (err) {
      logger.error("Failed to sync invites:", err);
      onerror(errorText(err, m.invites.errorSync()));
    } finally {
      busy = false;
    }
  }

  async function reset(scope: 0 | 1) {
    const server = scope === InviteResetScope.Server;
    const confirmed = await requestConfirmation({
      title: server ? m.invites.confirmResetServerTitle() : m.invites.confirmResetLeftTitle(),
      message: server ? m.invites.confirmResetServerMessage() : m.invites.confirmResetLeftMessage(),
      confirmText: m.common.reset()
    });
    if (!confirmed) return;
    busy = true;
    try {
      const count = await inviteTrackingApi.reset(guildId, scope);
      onsuccess(m.invites.notifyResetDone({ count }));
      onchanged();
    } catch (err) {
      logger.error("Failed to reset invites:", err);
      onerror(errorText(err, m.invites.errorReset()));
    } finally {
      busy = false;
    }
  }
</script>

<PluginCard title={m.common.maintenance()} alwaysOpen>
  <div class="grid grid-cols-1 sm:grid-cols-3 gap-2">
    <button type="button" class="px-5 rounded-xl min-h-[50px] font-medium disabled:opacity-50" style={buttonStyle} disabled={busy} onclick={sync}>{m.invites.settingsSync()}</button>
    <button type="button" class="px-5 rounded-xl min-h-[50px] font-medium disabled:opacity-50" style={buttonStyle} disabled={busy} onclick={() => reset(InviteResetScope.LeftMembers)}>{m.invites.settingsResetLeft()}</button>
    <button type="button" class="px-5 rounded-xl min-h-[50px] font-medium disabled:opacity-50" style="background: {$colorStore.accent}; color: {$colorStore.onAccent};" disabled={busy} onclick={() => reset(InviteResetScope.Server)}>{m.common.resetEverything()}</button>
  </div>
</PluginCard>
