<script lang="ts">
  import { m } from "$lib/i18n";
  import { colorStore } from "$lib/stores/colorStore";
  import { ticketApi } from "$lib/api/index.ts";
  import type { BlacklistedUserResponse } from "$lib/api/ticket/models";
  import { logger } from "$lib/logger";
  import { requestConfirmation } from "$lib/stores/confirmationStore";
  import PluginCard from "$lib/components/plugin/PluginCard.svelte";
  import ListRow from "./ListRow.svelte";
  import { errorText } from "../ticketModel";

  interface Props {
    guildId: bigint;
    users: BlacklistedUserResponse[];
    loading: boolean;
    onreload: () => Promise<void>;
    onerror: (message: string) => void;
  }

  let { guildId, users, loading, onreload, onerror }: Props = $props();

  let userId = $state("");
  let reason = $state("");
  let busy = $state(false);

  const valid = $derived(/^\d{15,22}$/.test(userId.trim()));

  async function add() {
    if (!valid || busy) return;
    busy = true;
    try {
      await ticketApi.blacklistUser(guildId, BigInt(userId.trim()), { reason: reason.trim() || null });
      userId = "";
      reason = "";
      await onreload();
    } catch (err) {
      logger.error("Failed to block ticket user:", err);
      onerror(errorText(err, m.tickets.failedBlock()));
    } finally {
      busy = false;
    }
  }

  async function remove(user: BlacklistedUserResponse) {
    const ok = await requestConfirmation({ message: m.tickets.unblockConfirm({ name: user.username }), confirmText: m.common.unblock(), variant: "info" });
    if (!ok) return;
    try {
      await ticketApi.unblacklistUser(guildId, user.userId);
      await onreload();
    } catch (err) {
      logger.error("Failed to unblock ticket user:", err);
      onerror(errorText(err, m.tickets.failedUnblock()));
    }
  }

  const buttonStyle = $derived(`background: ${$colorStore.primary}20; color: ${$colorStore.text}; border: 1px solid ${$colorStore.primary}30;`);
  const inputStyle = $derived(`background: ${$colorStore.primary}10; border-color: ${$colorStore.primary}30; color: ${$colorStore.text};`);
</script>

<PluginCard title={m.tickets.cardBlockedTitle()}>
  <div class="grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto] gap-3">
    <input
      type="text"
      inputmode="numeric"
      bind:value={userId}
      placeholder={m.common.userId()}
      aria-label={m.common.userId()}
      class="w-full p-3 rounded-lg border focus:ring-2 min-h-[50px] font-mono"
      style={inputStyle}
    >
    <input
      type="text"
      maxlength="200"
      bind:value={reason}
      onkeydown={(e) => e.key === "Enter" && add()}
      placeholder={m.common.reasonOptional()}
      aria-label={m.common.reasonOptional()}
      class="w-full p-3 rounded-lg border focus:ring-2 min-h-[50px]"
      style={inputStyle}
    >
    <button type="button" class="flex items-center justify-center gap-2 px-5 rounded-xl min-h-[50px] font-medium" style={buttonStyle} disabled={busy || !valid} onclick={add}>
      <i class="fa-solid fa-plus" aria-hidden="true"></i>
      {m.common.block()}
    </button>
  </div>

  {#if loading}
    <div class="flex justify-center py-4">
      <div class="w-10 h-10 border-4 rounded-full animate-spin" style="border-color: {$colorStore.primary}20; border-top-color: {$colorStore.primary}"></div>
    </div>
  {:else if users.length === 0}
    <p class="py-2 text-center" style="color: {$colorStore.muted}">{m.tickets.blockedEmpty()}</p>
  {:else}
    <div class="space-y-2">
      {#each users as user (user.userId)}
        <ListRow
          title={user.username}
          subtitle={String(user.userId)}
          badges={user.restrictedTypes ?? []}
          menu={[{ label: m.common.unblock(), icon: "fa-check", onclick: () => remove(user) }]}
          menuLabel={m.tickets.rowMoreAria({ name: user.username })}
        />
      {/each}
    </div>
  {/if}
</PluginCard>
