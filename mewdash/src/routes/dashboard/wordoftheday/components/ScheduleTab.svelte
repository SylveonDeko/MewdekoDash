<script lang="ts">
  import { onMount } from "svelte";
  import { m } from "$lib/i18n";
  import { ScheduleRuleType, wordOfTheDayApi, type WordOfTheDaySchedule } from "$lib/api/index.ts";
  import { colorStore } from "$lib/stores/colorStore";
  import { logger } from "$lib/logger";
  import PluginCard from "$lib/components/plugin/PluginCard.svelte";
  import RuleSheet from "./RuleSheet.svelte";
  import {
    dayNames,
    difficultyOptions,
    errorText,
    monthNames,
    optionName,
    posOptions,
    type Notify
  } from "./wotdModel";

  interface Props {
    guildId: bigint;
    notify: Notify;
  }

  let { guildId, notify }: Props = $props();

  let rules: WordOfTheDaySchedule[] = $state([]);
  let editing: { type: ScheduleRuleType; key: number; name: string } | null = $state(null);
  let busy = $state(false);

  const groups = $derived([
    {
      title: m.wordoftheday.scheduleWeekdays(),
      type: ScheduleRuleType.DayOfWeek,
      items: dayNames().map((name, i) => ({ name, key: i }))
    },
    {
      title: m.wordoftheday.scheduleMonths(),
      type: ScheduleRuleType.Month,
      items: monthNames().map((name, i) => ({ name, key: i + 1 }))
    }
  ]);

  const editingRule = $derived(
    editing ? rules.find((r) => r.ruleType === editing!.type && r.ruleKey === editing!.key) ?? null : null
  );

  function find(type: ScheduleRuleType, key: number) {
    return rules.find((r) => r.ruleType === type && r.ruleKey === key);
  }

  function describe(rule: WordOfTheDaySchedule | undefined): string {
    if (!rule) return m.wordoftheday.ruleInherits();
    const parts: string[] = [];
    if (rule.topic?.trim()) parts.push(m.wordoftheday.ruleTopic({ topic: rule.topic.trim() }));
    if (rule.partOfSpeech) parts.push(optionName(posOptions(), rule.partOfSpeech).toLowerCase());
    if (rule.difficulty) parts.push(optionName(difficultyOptions(), rule.difficulty).toLowerCase());
    return parts.length ? parts.join(", ") : m.wordoftheday.ruleInherits();
  }

  async function save(rule: { topic: string; partOfSpeech: number; difficulty: number }) {
    if (!editing || busy) return;
    const { type, key, name } = editing;
    busy = true;
    try {
      const stored = await wordOfTheDayApi.upsertSchedule(guildId, {
        ruleType: type,
        ruleKey: key,
        ...rule
      });
      rules = [...rules.filter((r) => !(r.ruleType === stored.ruleType && r.ruleKey === stored.ruleKey)), stored];
      editing = null;
      notify(m.wordoftheday.notifyRuleSaved());
    } catch (err) {
      logger.error("Failed to save schedule rule:", err);
      notify(errorText(err, m.wordoftheday.notifyRuleSaveFailed({ name })), "error");
    } finally {
      busy = false;
    }
  }

  async function clear(type: ScheduleRuleType, key: number, name: string) {
    if (busy) return;
    busy = true;
    try {
      await wordOfTheDayApi.deleteSchedule(guildId, type, key);
      rules = rules.filter((r) => !(r.ruleType === type && r.ruleKey === key));
      editing = null;
      notify(m.wordoftheday.notifyRuleCleared());
    } catch (err) {
      logger.error("Failed to clear schedule rule:", err);
      notify(errorText(err, m.wordoftheday.notifyRuleClearFailed({ name })), "error");
    } finally {
      busy = false;
    }
  }

  onMount(async () => {
    try {
      rules = await wordOfTheDayApi.getSchedule(guildId);
    } catch (err) {
      logger.error("Failed to load schedule rules:", err);
      notify(errorText(err, m.wordoftheday.notifyLoadFailed()), "error");
    }
  });
</script>

{#each groups as group (group.type)}
  <PluginCard title={group.title} alwaysOpen>
    <div class="space-y-2">
      {#each group.items as item (item.key)}
        {@const rule = find(group.type, item.key)}
        <div class="flex items-center gap-2 rounded-xl border p-2 min-w-0" style="background: {$colorStore.primary}{rule ? '12' : '08'}; border-color: {$colorStore.primary}20;">
          <button
            type="button"
            class="grow min-w-0 text-left min-h-[44px] px-1"
            onclick={() => (editing = { type: group.type, key: item.key, name: item.name })}
          >
            <span class="block text-sm font-semibold truncate" style="color: {$colorStore.text}">{item.name}</span>
            <span class="block text-sm truncate" style="color: {$colorStore.muted}">{describe(rule)}</span>
          </button>
          {#if rule}
            <button
              type="button"
              class="shrink-0 rounded-lg min-h-[44px] min-w-[44px]"
              style="background: {$colorStore.primary}10; color: {$colorStore.text}; border: 1px solid {$colorStore.primary}20;"
              aria-label={m.wordoftheday.ruleClearAria({ name: item.name })}
              disabled={busy}
              onclick={() => clear(group.type, item.key, item.name)}
            >
              <i class="fa-solid fa-trash" aria-hidden="true"></i>
            </button>
          {/if}
        </div>
      {/each}
    </div>
  </PluginCard>
{/each}

{#if editing}
  {#key `${editing.type}:${editing.key}`}
    <RuleSheet
      name={editing.name}
      topic={editingRule?.topic ?? ""}
      partOfSpeech={editingRule?.partOfSpeech ?? 0}
      difficulty={editingRule?.difficulty ?? 0}
      exists={!!editingRule}
      {busy}
      onsave={save}
      onclear={() => clear(editing!.type, editing!.key, editing!.name)}
      onclose={() => (editing = null)}
    />
  {/key}
{/if}
