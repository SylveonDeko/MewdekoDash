<script lang="ts">
  import { untrack } from "svelte";
  import { m } from "$lib/i18n";
  import { automationsApi, type AutomationRun } from "$lib/api/index.ts";
  import { colorStore } from "$lib/stores/colorStore";
  import { logger } from "$lib/logger";
  import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";
  import SettingField from "$lib/components/forms/SettingField.svelte";
  import { errorText, formatDate, label, type Named, type Notify } from "./automationsModel";

  interface Props {
    guildId: bigint;
    automationId: number;
    channels: Named[];
    members: Named[];
    userId?: string;
    notify: Notify;
  }

  let { guildId, automationId, channels, members, userId, notify }: Props = $props();

  const uid = $props.id();

  let runs: AutomationRun[] = $state([]);
  let loading = $state(true);
  let testing = $state(false);
  let memberId: string | null = $state(untrack(() => userId) ?? null);
  let channelId: string | null = $state(null);

  const buttonStyle = $derived(`background: ${$colorStore.primary}; color: ${$colorStore.onPrimary};`);

  async function load() {
    try {
      runs = await automationsApi.getRuns(guildId, automationId);
    } catch (err) {
      logger.error("Failed to load automation runs:", err);
      notify(errorText(err, m.automations.errorLoadRuns()), "error");
    } finally {
      loading = false;
    }
  }

  async function runTest() {
    if (testing || !memberId) return;
    testing = true;
    try {
      const result = await automationsApi.testAutomation(guildId, automationId, {
        userId: BigInt(memberId),
        ...(channelId ? { channelId: BigInt(channelId) } : {})
      });
      if (result.success) notify(m.automations.testPassed());
      else notify(result.reason ?? m.automations.testFailed(), "error");
      await load();
    } catch (err) {
      logger.error("Failed to test automation:", err);
      notify(errorText(err, m.automations.errorTest()), "error");
    } finally {
      testing = false;
    }
  }

  function failure(run: AutomationRun): string {
    const type = run.failedActionType ? label(`action${run.failedActionType}`, run.failedActionType) : "";
    return [type, run.reason].filter(Boolean).join(": ");
  }

  void load();
</script>

<div class="space-y-3 min-w-0">
  <SettingField label={m.automations.testAs()} id="{uid}-member">
    <DiscordSelector
      id="{uid}-member"
      type="user"
      options={members}
      selected={memberId}
      clearable={false}
      placeholder={m.automations.selectMember()}
      onchange={(detail) => (memberId = typeof detail.selected === "string" ? detail.selected : null)}
    />
  </SettingField>
  <SettingField label={m.automations.testIn()} id="{uid}-channel">
    <DiscordSelector
      id="{uid}-channel"
      type="channel"
      options={channels}
      selected={channelId}
      placeholder={m.automations.noChannel()}
      onchange={(detail) => (channelId = typeof detail.selected === "string" ? detail.selected : null)}
    />
  </SettingField>
  <button
    type="button"
    class="flex items-center justify-center gap-2 px-5 rounded-xl min-h-[50px] font-medium disabled:opacity-50 w-full sm:w-auto"
    style={buttonStyle}
    disabled={testing || !memberId}
    onclick={runTest}
  >
    <i class="fa-solid fa-play" aria-hidden="true"></i>
    {m.automations.runTest()}
  </button>
</div>

<div class="space-y-2 min-w-0">
  <div class="flex items-center gap-2">
    <h4 class="grow text-sm font-semibold" style="color: {$colorStore.text}">{m.automations.runsTitle()}</h4>
    <button
      type="button"
      class="shrink-0 rounded-lg min-h-[44px] min-w-[44px]"
      style="background: {$colorStore.primary}10; color: {$colorStore.text}; border: 1px solid {$colorStore.primary}20;"
      aria-label={m.automations.refreshRuns()}
      onclick={load}
    >
      <i class="fa-solid fa-rotate" aria-hidden="true"></i>
    </button>
  </div>
  {#if loading}
    <div class="flex justify-center py-4">
      <div class="w-8 h-8 border-4 rounded-full animate-spin" style="border-color: {$colorStore.primary}20; border-top-color: {$colorStore.primary}"></div>
    </div>
  {:else if runs.length === 0}
    <p class="text-sm py-3" style="color: {$colorStore.muted}">{m.automations.runsEmpty()}</p>
  {:else}
    {#each runs as run (run.id)}
      <div class="flex items-start gap-3 rounded-xl border p-3 min-w-0" style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}20;">
        <i
          class="fa-solid {run.success ? 'fa-circle-check' : 'fa-circle-xmark'} mt-0.5"
          style="color: {run.success ? '#22c55e' : '#ef4444'}"
          aria-hidden="true"
        ></i>
        <div class="grow min-w-0">
          <p class="text-sm" style="color: {$colorStore.text}">
            {run.success ? m.automations.runSucceeded() : m.automations.runFailed()}
            {#if run.isTest}
              <span class="text-xs px-2 py-0.5 rounded-full ml-1" style="background: {$colorStore.primary}15;">{m.automations.testBadge()}</span>
            {/if}
          </p>
          {#if !run.success && failure(run)}
            <p class="text-xs break-words" style="color: {$colorStore.muted}">{failure(run)}</p>
          {/if}
          <p class="text-xs" style="color: {$colorStore.muted}">{formatDate(run.ranAt)} · {m.automations.runDuration({ ms: run.durationMs })}</p>
        </div>
      </div>
    {/each}
  {/if}
</div>
