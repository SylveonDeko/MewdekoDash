<script lang="ts">
  import { m } from "$lib/i18n";
  import { channelActionsApi, type BulkResult } from "$lib/api/index.ts";
  import { colorStore } from "$lib/stores/colorStore";
  import { logger } from "$lib/logger";
  import { requestConfirmation } from "$lib/stores/confirmationStore";
  import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";
  import PluginCard from "$lib/components/plugin/PluginCard.svelte";
  import NumberField from "../NumberField.svelte";
  import { errorText, type Named, type Notify } from "../toolsModel";

  interface Props {
    guildId: bigint;
    userId: bigint | string | undefined;
    channels: Named[];
    notify: Notify;
    onchanged: () => void;
  }

  type Action = "slowmode" | "lock" | "hide" | "unlock" | "unhide" | "sync";

  let { guildId, userId, channels, notify, onchanged }: Props = $props();

  let selected: string[] = $state([]);
  let action = $state<Action>("slowmode");
  let seconds: number | null = $state(0);
  let minutes: number | null = $state(null);
  let busy = $state(false);

  const actions = $derived<Array<{ id: Action; label: string; icon: string }>>([
    { id: "slowmode", label: m.serverTools.actionSlowmode(), icon: "fa-solid fa-hourglass-half" },
    { id: "lock", label: m.serverTools.actionLock(), icon: "fa-solid fa-lock" },
    { id: "unlock", label: m.serverTools.actionUnlock(), icon: "fa-solid fa-lock-open" },
    { id: "hide", label: m.serverTools.actionHide(), icon: "fa-solid fa-eye-slash" },
    { id: "unhide", label: m.serverTools.actionUnhide(), icon: "fa-solid fa-eye" },
    { id: "sync", label: m.serverTools.actionSync(), icon: "fa-solid fa-rotate" }
  ]);

  const timed = $derived(action === "lock" || action === "hide");
  const solid = $derived(`background: ${$colorStore.primary}; color: ${$colorStore.onPrimary};`);

  function tile(on: boolean) {
    return `background: ${on ? $colorStore.selectedSurface : `${$colorStore.primary}08`}; border-color: ${on ? $colorStore.selectedBorder : `${$colorStore.primary}20`}; color: ${$colorStore.text};`;
  }

  function call(ids: bigint[]): Promise<BulkResult> {
    switch (action) {
      case "slowmode":
        return channelActionsApi.slowmode(guildId, { channelIds: ids, seconds: seconds ?? 0 });
      case "lock":
      case "hide":
        return channelActionsApi.lock(guildId, {
          userId: userId ?? 0n,
          channelIds: ids,
          kind: action === "lock" ? "Lock" : "Hide",
          minutes: minutes && minutes > 0 ? minutes : null
        });
      case "unlock":
      case "unhide":
        return channelActionsApi.unlock(guildId, { channelIds: ids, kind: action === "unlock" ? "Lock" : "Hide" });
      default:
        return channelActionsApi.sync(guildId, ids);
    }
  }

  async function run() {
    if (busy || selected.length === 0) return;
    if (action !== "slowmode") {
      const label = actions.find(item => item.id === action)?.label ?? "";
      const confirmed = await requestConfirmation({
        title: label,
        message:
          action === "sync"
            ? m.serverTools.bulkSyncConfirm({ count: selected.length })
            : m.serverTools.bulkConfirm({ action: label, count: selected.length }),
        confirmText: label,
        variant: "warning"
      });
      if (!confirmed) return;
    }
    busy = true;
    try {
      const result = await call(selected.map(id => BigInt(id)));
      notify(
        result.failed > 0
          ? m.serverTools.bulkPartial({ done: result.succeeded, failed: result.failed })
          : m.serverTools.bulkDone({ count: result.succeeded }),
        result.succeeded > 0 ? "success" : "error"
      );
      onchanged();
    } catch (err) {
      logger.error("Failed to run channel action:", err);
      notify(errorText(err, m.serverTools.bulkFailed()), "error");
    } finally {
      busy = false;
    }
  }
</script>

<PluginCard title={m.serverTools.bulkTitle()} alwaysOpen>
  <div class="space-y-4">
    <DiscordSelector
      type="channel"
      options={channels}
      {selected}
      multiple
      placeholder={m.common.channels()}
      ariaLabel={m.common.channels()}
      onchange={(detail) => (selected = Array.isArray(detail.selected) ? detail.selected : [])}
    />

    <div class="grid grid-cols-2 sm:grid-cols-3 gap-2" role="group" aria-label={m.serverTools.bulkActionAria()}>
      {#each actions as item (item.id)}
        <button type="button" class="min-h-[44px] px-2 rounded-lg border text-sm font-medium flex items-center justify-center gap-2" style={tile(action === item.id)} aria-pressed={action === item.id} onclick={() => (action = item.id)}>
          <i class={item.icon} aria-hidden="true"></i>{item.label}
        </button>
      {/each}
    </div>

    {#if action === "slowmode"}
      <NumberField id="bulk-slowmode" label={m.serverTools.bulkSeconds()} value={seconds} min={0} max={21600} onchange={(value) => (seconds = value)} />
    {:else if timed}
      <NumberField id="bulk-minutes" label={m.serverTools.bulkMinutes()} value={minutes} min={1} max={525600} nullable onchange={(value) => (minutes = value)} />
    {/if}

    <button type="button" class="w-full sm:w-auto flex items-center justify-center gap-2 px-5 rounded-xl min-h-[50px] font-medium disabled:opacity-50" style={solid} disabled={busy || selected.length === 0} onclick={run}>
      <i class="fa-solid {busy ? 'fa-spinner fa-spin' : 'fa-check'}" aria-hidden="true"></i>
      {m.serverTools.bulkApply({ count: selected.length })}
    </button>
  </div>
</PluginCard>
