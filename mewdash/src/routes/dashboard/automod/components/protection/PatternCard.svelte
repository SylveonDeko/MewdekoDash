<script lang="ts">
  import { m } from "$lib/i18n";
  import { protectionApi, type AntiPatternPattern } from "$lib/api/index.ts";
  import { colorStore } from "$lib/stores/colorStore";
  import { logger } from "$lib/logger";
  import { requestConfirmation } from "$lib/stores/confirmationStore";
  import ToggleRow from "$lib/components/forms/ToggleRow.svelte";
  import PluginCard from "$lib/components/plugin/PluginCard.svelte";
  import NumberField from "../NumberField.svelte";
  import { errorText, type Named, type Notify } from "../automodModel";
  import ActionFields from "./ActionFields.svelte";
  import PatternSheet from "./PatternSheet.svelte";
  import TriggerCount from "./TriggerCount.svelte";
  import type { Patch, Status } from "./protectionModel";

  interface Props {
    guildId: bigint;
    status: Status;
    onpatch: Patch;
    ontoggle: (enabled: boolean) => void;
    roles: Named[];
    notify: Notify;
  }

  let { guildId, status, onpatch, ontoggle, roles, notify }: Props = $props();

  let patterns: AntiPatternPattern[] = $state([]);
  let creating = $state(false);
  let loaded = false;

  const checks = $derived([
    { key: "checkAccountAge", label: m.automod.patternAccountAge() },
    { key: "checkJoinTiming", label: m.automod.patternJoinTiming() },
    { key: "checkBatchCreation", label: m.automod.patternBatch() },
    { key: "checkOfflineStatus", label: m.automod.patternOffline() },
    { key: "checkNewAccounts", label: m.automod.patternNewAccounts() }
  ]);

  const iconButton = $derived(
    `background: ${$colorStore.primary}10; color: ${$colorStore.text}; border: 1px solid ${$colorStore.primary}20;`
  );

  async function load() {
    try {
      patterns = (await protectionApi.getAntiPatternPatterns(guildId)) ?? [];
    } catch (err) {
      logger.error("Failed to load patterns:", err);
      notify(errorText(err, m.automod.errorLoad()), "error");
    }
  }

  async function add(request: { name: string; pattern: string; checkUsername: boolean; checkDisplayName: boolean }) {
    try {
      await protectionApi.addAntiPatternPattern(
        guildId,
        request.pattern,
        request.name,
        request.checkUsername,
        request.checkDisplayName
      );
      creating = false;
      await load();
    } catch (err) {
      logger.error("Failed to add pattern:", err);
      notify(errorText(err, m.automod.errorSave()), "error");
    }
  }

  async function remove(pattern: AntiPatternPattern) {
    const confirmed = await requestConfirmation({
      message: m.automod.deletePatternConfirm({ name: pattern.name }),
      confirmText: m.common.delete()
    });
    if (!confirmed) return;
    try {
      await protectionApi.removeAntiPatternPattern(guildId, pattern.id);
      patterns = patterns.filter((x) => x.id !== pattern.id);
    } catch (err) {
      logger.error("Failed to remove pattern:", err);
      notify(errorText(err, m.automod.errorSave()), "error");
    }
  }

  $effect(() => {
    if (status.enabled && !loaded) {
      loaded = true;
      void load();
    }
  });
</script>

{#snippet addButton()}
  <button
    type="button"
    class="flex items-center justify-center gap-2 px-5 rounded-xl min-h-[50px] font-medium"
    style="background: {$colorStore.primary}20; color: {$colorStore.text}; border: 1px solid {$colorStore.primary}30;"
    onclick={() => (creating = true)}
  >
    <i class="fa-solid fa-plus" aria-hidden="true"></i>
    {m.automod.addPattern()}
  </button>
{/snippet}

<PluginCard title={m.automod.patternTitle()} enabled={status.enabled} onToggle={ontoggle}>
  <div class="grid gap-4 sm:grid-cols-2">
    <NumberField
      id="pattern-score"
      label={m.automod.patternScore()}
      min={1}
      max={100}
      value={status.minimumScore}
      onchange={(value) => onpatch({ minimumScore: value }, "typing")}
    />
    <ActionFields id="pattern" {status} {onpatch} {roles} durationKey="punishDuration" />
  </div>

  <div class="grid gap-2 sm:grid-cols-2">
    {#each checks as check (check.key)}
      <ToggleRow
        checked={status[check.key]}
        title={check.label}
        colors={$colorStore}
        onchange={(value) => onpatch({ [check.key]: value }, "now")}
      />
    {/each}
  </div>

  {#if status.checkAccountAge || status.checkJoinTiming || status.checkNewAccounts}
    <div class="grid gap-4 sm:grid-cols-2">
      {#if status.checkAccountAge}
        <NumberField
          id="pattern-age"
          label={m.automod.patternMaxAgeMonths()}
          min={1}
          max={120}
          value={status.maxAccountAgeMonths}
          onchange={(value) => onpatch({ maxAccountAgeMonths: value }, "typing")}
        />
      {/if}
      {#if status.checkJoinTiming}
        <NumberField
          id="pattern-join"
          label={m.automod.patternMaxJoinHours()}
          min={1}
          max={168}
          decimal
          value={status.maxJoinHours}
          onchange={(value) => onpatch({ maxJoinHours: value }, "typing")}
        />
      {/if}
      {#if status.checkNewAccounts}
        <NumberField
          id="pattern-new"
          label={m.automod.patternNewDays()}
          min={1}
          max={30}
          value={status.newAccountDays}
          onchange={(value) => onpatch({ newAccountDays: value }, "typing")}
        />
      {/if}
    </div>
  {/if}

  <div class="flex flex-wrap items-center justify-between gap-3">
    <h4 class="text-sm font-medium" style="color: {$colorStore.text}">{m.automod.patterns()}</h4>
    {@render addButton()}
  </div>

  <div class="space-y-2">
    {#each patterns as pattern (pattern.id)}
      <div
        class="flex items-center gap-3 rounded-xl border p-2 pl-3 min-w-0"
        style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}20;"
      >
        <div class="grow min-w-0">
          <p class="text-sm font-medium truncate" style="color: {$colorStore.text}">{pattern.name}</p>
          <p class="text-xs font-mono truncate" style="color: {$colorStore.muted}">{pattern.pattern}</p>
          <p class="flex flex-wrap gap-1.5 mt-1">
            {#if pattern.checkUsername}
              <span class="text-xs px-2 py-0.5 rounded-full" style="background: {$colorStore.primary}15; color: {$colorStore.text};">{m.common.username()}</span>
            {/if}
            {#if pattern.checkDisplayName}
              <span class="text-xs px-2 py-0.5 rounded-full" style="background: {$colorStore.primary}15; color: {$colorStore.text};">{m.common.displayName()}</span>
            {/if}
          </p>
        </div>
        <button
          type="button"
          class="rounded-lg min-h-[44px] min-w-[44px] shrink-0"
          style={iconButton}
          aria-label={m.automod.removeAria({ name: pattern.name })}
          onclick={() => remove(pattern)}
        >
          <i class="fa-solid fa-trash" aria-hidden="true"></i>
        </button>
      </div>
    {:else}
      <p class="text-sm" style="color: {$colorStore.muted}">{m.automod.noPatterns()}</p>
    {/each}
  </div>
  <TriggerCount count={Number(status.counter ?? 0)} />
</PluginCard>

{#if creating}
  <PatternSheet oncreate={add} onclose={() => (creating = false)} />
{/if}
