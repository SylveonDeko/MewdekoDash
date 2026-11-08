<script lang="ts">
  import { m } from "$lib/i18n";
  import { channelAccessApi, type ChannelAccessBlacklistEntry, type ChannelAccessGate } from "$lib/api/index.ts";
  import { colorStore } from "$lib/stores/colorStore";
  import { logger } from "$lib/logger";
  import { userStore } from "$lib/stores/userStore";
  import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";
  import PluginCard from "$lib/components/plugin/PluginCard.svelte";
  import { channelName, errorText, formatDate, type Named } from "./channelAccessModel";

  interface Props {
    guildId: bigint;
    gates: ChannelAccessGate[];
    blacklist: ChannelAccessBlacklistEntry[];
    channels: Named[];
    members: Named[];
    onchanged: () => void;
    onerror: (message: string) => void;
  }

  let { guildId, gates, blacklist, channels, members, onchanged, onerror }: Props = $props();

  let userId: string | null = $state(null);
  let scope = $state("all");
  let reason = $state("");
  let busy = $state(false);

  const scopeOptions = $derived([
    { id: "all", name: m.channelAccess.filterEveryGate() },
    ...gates.map((gate) => ({ id: String(gate.id), name: `#${channelName(channels, gate.channelId)}` }))
  ]);

  function gateName(configId: number | null): string {
    if (configId === null) return m.channelAccess.filterEveryGate();
    const gate = gates.find((x) => x.id === configId);
    return gate ? `#${channelName(channels, gate.channelId)}` : m.channelAccess.deletedGate();
  }

  async function block() {
    if (!userId) {
      onerror(m.channelAccess.errorPickUser());
      return;
    }
    busy = true;
    try {
      await channelAccessApi.addBlacklist(guildId, {
        userId: BigInt(userId),
        configId: scope === "all" ? null : Number(scope),
        addedBy: BigInt($userStore?.id ?? 0),
        reason: reason.trim() || null
      });
      userId = null;
      reason = "";
      onchanged();
    } catch (err) {
      logger.error("Failed to blacklist user:", err);
      onerror(errorText(err, m.channelAccess.errorBlockUser()));
    } finally {
      busy = false;
    }
  }

  async function unblock(entry: ChannelAccessBlacklistEntry) {
    busy = true;
    try {
      await channelAccessApi.removeBlacklist(guildId, entry.userId, entry.configId);
      onchanged();
    } catch (err) {
      logger.error("Failed to remove blacklist entry:", err);
      onerror(errorText(err, m.channelAccess.errorUnblockUser()));
    } finally {
      busy = false;
    }
  }
</script>

<div class="space-y-4 min-w-0">
  <PluginCard title={m.channelAccess.blockTitle()} alwaysOpen>
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div class="min-w-0">
        <span id="block-user" class="block text-sm font-medium mb-1" style="color: {$colorStore.text}">{m.common.user()}</span>
        <DiscordSelector
          type="user"
          options={members}
          selected={userId}
          placeholder={m.common.selectUserPlaceholder()}
          ariaLabelledby="block-user"
          onchange={({ selected }) => (userId = typeof selected === "string" ? selected : null)}
        />
      </div>
      <div class="min-w-0">
        <span id="block-scope" class="block text-sm font-medium mb-1" style="color: {$colorStore.text}">{m.common.scope()}</span>
        <DiscordSelector
          type="custom"
          options={scopeOptions}
          customIcon="fa-lock"
          selected={scope}
          searchable={false}
          clearable={false}
          ariaLabelledby="block-scope"
          onchange={({ selected }) => (scope = typeof selected === "string" ? selected : "all")}
        />
      </div>
    </div>
    <input
      type="text"
      bind:value={reason}
      aria-label={m.common.reasonOptional()}
      placeholder={m.common.reasonOptional()}
      class="w-full p-3 rounded-lg border focus:ring-2 min-h-[50px]"
      style="background: {$colorStore.primary}10; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
    >
    <button
      type="button"
      class="w-full sm:w-auto px-5 rounded-xl min-h-[50px] font-medium disabled:opacity-50"
      style="background: {$colorStore.primary}; color: {$colorStore.onPrimary};"
      disabled={busy || !userId}
      onclick={block}
    >
      {m.common.block()}
    </button>
  </PluginCard>

  <PluginCard title={m.common.blockedUsers()} alwaysOpen>
    <div class="space-y-2">
      {#each blacklist as entry (entry.id)}
        {@const name = entry.username ?? entry.userId.toString()}
        <div
          class="flex items-center gap-2 rounded-xl border p-2 pl-3 min-w-0"
          style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}20;"
        >
          <div class="grow min-w-0">
            <span class="block text-sm font-medium truncate" style="color: {$colorStore.text}">{name}</span>
            <span class="block text-xs break-words" style="color: {$colorStore.muted}">
              {entry.reason
                ? m.channelAccess.blockMetaReason({ gate: gateName(entry.configId), reason: entry.reason, date: formatDate(entry.addedAt) })
                : m.channelAccess.blockMeta({ gate: gateName(entry.configId), date: formatDate(entry.addedAt) })}
            </span>
          </div>
          <button
            type="button"
            class="shrink-0 px-4 rounded-lg min-h-[44px] text-sm font-medium disabled:opacity-50"
            style="background: {$colorStore.primary}10; color: {$colorStore.text}; border: 1px solid {$colorStore.primary}20;"
            aria-label="{m.common.unblock()}: {name}"
            disabled={busy}
            onclick={() => unblock(entry)}
          >
            {m.common.unblock()}
          </button>
        </div>
      {:else}
        <p class="text-sm" style="color: {$colorStore.muted}">{m.channelAccess.blockEmpty()}</p>
      {/each}
    </div>
  </PluginCard>
</div>
