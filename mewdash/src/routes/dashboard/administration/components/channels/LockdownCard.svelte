<script lang="ts">
  import { m } from "$lib/i18n";
  import { channelActionsApi, lockdownApi, type LockdownStatus, type LockdownType } from "$lib/api/index.ts";
  import { colorStore } from "$lib/stores/colorStore";
  import { logger } from "$lib/logger";
  import { requestConfirmation } from "$lib/stores/confirmationStore";
  import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";
  import PluginCard from "$lib/components/plugin/PluginCard.svelte";
  import SettingField from "$lib/components/forms/SettingField.svelte";
  import type { AutoSave } from "$lib/utils/autoSave.svelte";
  import { errorText, type Named, type Notify } from "../toolsModel";

  interface Props {
    guildId: bigint;
    channels: Named[];
    autoSave: AutoSave;
    notify: Notify;
  }

  let { guildId, channels, autoSave, notify }: Props = $props();

  let status: LockdownStatus = $state({ type: "None", action: null });
  let exempt: string[] = $state([]);
  let loading = $state(true);
  let busy = $state(false);
  let type = $state<LockdownType>("Readonly");
  let action = $state("Ban");

  const types = $derived<Array<{ id: LockdownType; label: string }>>([
    { id: "Readonly", label: m.common.messages() },
    { id: "Joins", label: m.serverTools.lockdownJoins() },
    { id: "Full", label: m.serverTools.lockdownBoth() }
  ]);
  const actions = $derived([
    { id: "Kick", label: m.common.actionKick() },
    { id: "Ban", label: m.common.actionBan() }
  ]);

  const active = $derived(status.type !== "None");
  const joins = $derived(type === "Joins" || type === "Full");
  const solid = $derived(`background: ${$colorStore.primary}; color: ${$colorStore.onPrimary};`);
  const danger = "background: #ef444420; color: #ef4444; border: 1px solid #ef444440;";

  function tile(selected: boolean) {
    return `background: ${selected ? $colorStore.selectedSurface : `${$colorStore.primary}08`}; border-color: ${selected ? $colorStore.selectedBorder : `${$colorStore.primary}20`}; color: ${$colorStore.text};`;
  }

  async function load() {
    try {
      const [current, exemptions] = await Promise.all([
        channelActionsApi.getLockdown(guildId),
        lockdownApi.getExemptions(guildId)
      ]);
      status = current;
      exempt = exemptions.channelIds.map(String);
    } catch (err) {
      logger.error("Failed to load lockdown:", err);
      notify(errorText(err, m.serverTools.lockdownLoadFailed()), "error");
    } finally {
      loading = false;
    }
  }

  async function start() {
    const past = action === "Kick" ? m.serverTools.lockdownKicked() : m.serverTools.lockdownBanned();
    const message =
      type === "Readonly"
        ? m.serverTools.lockdownConfirmMessages()
        : type === "Joins"
          ? m.serverTools.lockdownConfirmJoins({ action: past })
          : m.serverTools.lockdownConfirmBoth({ action: past });
    const confirmed = await requestConfirmation({
      title: m.serverTools.lockdownStart(),
      message,
      confirmText: m.serverTools.lockdownStart()
    });
    if (!confirmed) return;
    busy = true;
    try {
      status = await channelActionsApi.startLockdown(guildId, { type, action });
      notify(m.serverTools.lockdownStarted());
    } catch (err) {
      logger.error("Failed to start lockdown:", err);
      notify(errorText(err, m.serverTools.lockdownStartFailed()), "error");
    } finally {
      busy = false;
    }
  }

  async function lift() {
    busy = true;
    try {
      status = await channelActionsApi.liftLockdown(guildId);
      notify(m.serverTools.lockdownLifted());
    } catch (err) {
      logger.error("Failed to lift lockdown:", err);
      notify(errorText(err, m.serverTools.lockdownLiftFailed()), "error");
    } finally {
      busy = false;
    }
  }

  function changeExempt(selected: string[]) {
    const previous = exempt;
    exempt = selected;
    void autoSave.now("lockdown-exempt", async () => {
      try {
        await lockdownApi.setExemptions(guildId, selected.map(id => BigInt(id)));
      } catch (err) {
        exempt = previous;
        notify(errorText(err, m.serverTools.lockdownExemptFailed()), "error");
        throw err;
      }
    });
  }

  void load();
</script>

<PluginCard title={m.serverTools.lockdownTitle()} alwaysOpen>
  {#if loading}
    <div class="flex justify-center py-6">
      <div class="w-10 h-10 border-4 rounded-full animate-spin" style="border-color: {$colorStore.primary}20; border-top-color: {$colorStore.primary}"></div>
    </div>
  {:else}
    <div class="space-y-4">
      {#if active}
        <div class="flex items-center justify-between gap-3 flex-wrap rounded-lg p-3" style="background: #ef444415;">
          <span class="text-sm font-medium" style="color: {$colorStore.text}">
            {m.serverTools.lockdownActive({ type: types.find(item => item.id === status.type)?.label ?? status.type })}
          </span>
          <button type="button" class="px-4 rounded-lg min-h-[44px] font-medium disabled:opacity-50" style={solid} disabled={busy} onclick={lift}>
            {m.serverTools.lockdownLift()}
          </button>
        </div>
      {:else}
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-2" role="group" aria-label={m.serverTools.lockdownTypeAria()}>
          {#each types as item (item.id)}
            <button type="button" class="min-h-[50px] px-3 rounded-lg border text-sm font-medium" style={tile(type === item.id)} aria-pressed={type === item.id} onclick={() => (type = item.id)}>
              {item.label}
            </button>
          {/each}
        </div>
        {#if joins}
          <div class="grid grid-cols-2 gap-2" role="group" aria-label={m.serverTools.lockdownActionAria()}>
            {#each actions as item (item.id)}
              <button type="button" class="min-h-[50px] px-3 rounded-lg border text-sm font-medium" style={tile(action === item.id)} aria-pressed={action === item.id} onclick={() => (action = item.id)}>
                {item.label}
              </button>
            {/each}
          </div>
        {/if}
        <button type="button" class="w-full sm:w-auto px-5 rounded-xl min-h-[50px] font-medium disabled:opacity-50" style={danger} disabled={busy} onclick={start}>
          <i class="fa-solid fa-lock mr-2" aria-hidden="true"></i>{m.serverTools.lockdownStart()}
        </button>
      {/if}

      <SettingField label={m.serverTools.lockdownExempt()} id="lockdown-exempt">
        <DiscordSelector
          id="lockdown-exempt"
          type="channel"
          options={channels}
          selected={exempt}
          multiple
          placeholder={m.serverTools.lockdownExemptPlaceholder()}
          onchange={(detail) => changeExempt(Array.isArray(detail.selected) ? detail.selected : [])}
        />
      </SettingField>
    </div>
  {/if}
</PluginCard>
