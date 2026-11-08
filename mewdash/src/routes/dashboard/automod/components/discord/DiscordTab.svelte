<script lang="ts">
  import { onMount } from "svelte";
  import { m } from "$lib/i18n";
  import { autoModApi, type AutoModRuleKind, type AutoModStatus } from "$lib/api/index.ts";
  import { colorStore } from "$lib/stores/colorStore";
  import { logger } from "$lib/logger";
  import { requestConfirmation } from "$lib/stores/confirmationStore";
  import PluginCard from "$lib/components/plugin/PluginCard.svelte";
  import type { AutoSave } from "$lib/utils/autoSave.svelte";
  import { errorText, type Named, type Notify, type SaveMode } from "../automodModel";
  import NewRuleSheet from "./NewRuleSheet.svelte";
  import RuleRow from "./RuleRow.svelte";
  import RuleSheet from "./RuleSheet.svelte";
  import {
    actionsValid,
    DISCORD_LIMITS,
    followUpEmpty,
    followUpValid,
    KINDS,
    toCreateSpec,
    toFollowUpBody,
    toRule,
    toSpec,
    type FollowUp,
    type Rule,
    type RulePatch
  } from "./discordModel";

  interface Props {
    guildId: bigint;
    channels: Named[];
    roles: Named[];
    autoSave: AutoSave;
    notify: Notify;
  }

  let { guildId, channels, roles, autoSave, notify }: Props = $props();

  let rules: Rule[] = $state([]);
  let status: AutoModStatus = $state({ canManage: true, canModerate: true });
  let loading = $state(true);
  let loadProblem: string | null = $state(null);
  let editingId: string | null = $state(null);
  let creating = $state(false);
  let createProblem: string | null = $state(null);

  const editing = $derived(rules.find((x) => x.id === editingId) ?? null);

  const counts = $derived(
    Object.fromEntries(KINDS.map((kind) => [kind, rules.filter((x) => x.kind === kind).length])) as Record<AutoModRuleKind, number>
  );

  const kindLabels = $derived<Record<AutoModRuleKind, string>>({
    Keyword: m.automod.kindKeyword(),
    Spam: m.automod.kindSpam(),
    Preset: m.automod.kindPreset(),
    MentionSpam: m.automod.kindMention()
  });

  const limits = $derived(
    KINDS.map((kind) => `${kindLabels[kind]} ${counts[kind]} / ${DISCORD_LIMITS.rulesPerKind[kind]}`).join(" · ")
  );

  async function load() {
    try {
      const [loadedStatus, loadedRules] = await Promise.all([autoModApi.getStatus(guildId), autoModApi.getRules(guildId)]);
      status = loadedStatus;
      rules = loadedRules.map(toRule);
      loadProblem = null;
    } catch (err) {
      logger.error("Failed to load AutoMod rules:", err);
      loadProblem = errorText(err, m.automod.errorLoad());
    } finally {
      loading = false;
    }
  }

  function apply(id: string, changes: RulePatch, mode: SaveMode = "now") {
    rules = rules.map((x) => (x.id === id ? { ...x, ...changes } : x));
    const fields = Object.keys(changes) as Array<keyof RulePatch>;
    const send = async () => {
      const current = rules.find((x) => x.id === id);
      if (!current) return;
      if (fields.includes("name") && !current.name.trim()) return;
      if (fields.includes("actions") && !actionsValid(current)) return;
      try {
        await autoModApi.updateRule(guildId, BigInt(id), toSpec(current, fields));
      } catch (err) {
        await load();
        throw err;
      }
    };
    const key = `automod:${id}:${fields.join(",")}`;
    if (mode === "typing") autoSave.schedule(key, send);
    else void autoSave.now(key, send);
  }

  function applyFollowUp(id: string, next: FollowUp, mode: SaveMode) {
    rules = rules.map((x) => (x.id === id ? { ...x, followUp: next } : x));
    const send = async () => {
      const current = rules.find((x) => x.id === id)?.followUp;
      if (!current) return;
      try {
        if (followUpEmpty(current)) await autoModApi.deleteFollowUp(guildId, BigInt(id));
        else if (followUpValid(current)) await autoModApi.setFollowUp(guildId, BigInt(id), toFollowUpBody(current));
      } catch (err) {
        await load();
        throw err;
      }
    };
    const key = `automod:${id}:followup`;
    if (mode === "typing") autoSave.schedule(key, send);
    else void autoSave.now(key, send);
  }

  async function create(draft: Rule) {
    createProblem = null;
    try {
      const created = await autoModApi.createRule(guildId, toCreateSpec(draft));
      await load();
      creating = false;
      editingId = String(created.id);
      notify(m.automod.notifyCreated());
    } catch (err) {
      logger.error("Failed to create AutoMod rule:", err);
      createProblem = errorText(err, m.automod.errorCreate());
    }
  }

  async function remove(rule: Rule) {
    const confirmed = await requestConfirmation({
      message: m.automod.deleteConfirm({ name: rule.name }),
      confirmText: m.common.delete()
    });
    if (!confirmed) return;
    try {
      await autoModApi.deleteRule(guildId, BigInt(rule.id));
      rules = rules.filter((x) => x.id !== rule.id);
      if (editingId === rule.id) editingId = null;
      notify(m.automod.notifyDeleted());
    } catch (err) {
      logger.error("Failed to delete AutoMod rule:", err);
      notify(errorText(err, m.automod.errorDelete()), "error");
    }
  }

  function close() {
    void autoSave.flush();
    editingId = null;
  }

  onMount(() => {
    void load();
  });
</script>

{#if !status.canManage}
  <div class="rounded-xl border p-3 text-sm" role="alert" style="background: #ef444415; border-color: #ef444440; color: {$colorStore.text};">
    {m.automod.needManage()}
  </div>
{/if}

{#snippet newButton()}
  <button
    type="button"
    class="flex items-center justify-center gap-2 px-5 rounded-xl min-h-[50px] font-medium"
    style="background: {$colorStore.primary}20; color: {$colorStore.text}; border: 1px solid {$colorStore.primary}30;"
    onclick={() => {
      createProblem = null;
      creating = true;
    }}
  >
    <i class="fa-solid fa-plus" aria-hidden="true"></i>
    {m.automod.newRule()}
  </button>
{/snippet}

<PluginCard title={m.automod.tabDiscord()} alwaysOpen actions={newButton}>
  {#if loading}
    <div class="flex justify-center py-6">
      <div class="w-10 h-10 border-4 rounded-full animate-spin" style="border-color: {$colorStore.primary}20; border-top-color: {$colorStore.primary}"></div>
    </div>
  {:else if loadProblem}
    <p class="text-sm" role="alert" style="color: {$colorStore.text}">{loadProblem}</p>
  {:else if rules.length === 0}
    <div class="flex flex-col items-center gap-3 py-8 text-center">
      <i class="fa-solid fa-shield-halved" style="color: {$colorStore.muted}; font-size: 28px;" aria-hidden="true"></i>
      <p class="font-medium" style="color: {$colorStore.text}">{m.automod.emptyTitle()}</p>
    </div>
  {:else}
    <div class="space-y-2">
      {#each rules as rule (rule.id)}
        <RuleRow
          {rule}
          kindLabel={kindLabels[rule.kind]}
          onedit={() => (editingId = rule.id)}
          ontoggle={(enabled) => apply(rule.id, { enabled })}
          ondelete={() => remove(rule)}
        />
      {/each}
    </div>
  {/if}
  <p class="text-xs" style="color: {$colorStore.muted}">{limits}</p>
</PluginCard>

{#if editing}
  {@const id = editing.id}
  {#key id}
    <RuleSheet
      rule={editing}
      {channels}
      {roles}
      canModerate={status.canModerate}
      {counts}
      onpatch={(changes, mode) => apply(id, changes, mode)}
      onfollowup={(next, mode) => applyFollowUp(id, next, mode)}
      onclose={close}
    />
  {/key}
{/if}

{#if creating}
  <NewRuleSheet
    {channels}
    {roles}
    canModerate={status.canModerate}
    {counts}
    problem={createProblem}
    oncreate={create}
    onclose={() => (creating = false)}
  />
{/if}
