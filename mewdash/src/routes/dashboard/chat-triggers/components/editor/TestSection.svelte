<script lang="ts">
  import { m } from "$lib/i18n";
  import { chatTriggersApi, type ChatTrigger } from "$lib/api/index.ts";
  import type { TriggerStats, TriggerTestResult } from "$lib/api/chattriggers/chattriggers";
  import { colorStore } from "$lib/stores/colorStore";
  import { logger } from "$lib/logger";
  import SettingField from "$lib/components/forms/SettingField.svelte";
  import EditorGroup from "./EditorGroup.svelte";

  interface Props {
    guildId: bigint;
    trigger: ChatTrigger;
    userId: string;
    onerror: (message: string) => void;
  }

  let { guildId, trigger, userId, onerror }: Props = $props();

  let open = $state(false);
  let sample = $state("");
  let result: TriggerTestResult | null = $state(null);
  let stats: TriggerStats | null = $state(null);
  let testing = $state(false);

  async function runTest() {
    testing = true;
    try {
      result = await chatTriggersApi.testTrigger(guildId, trigger.id, { sample, userId });
    } catch (err) {
      logger.error("Failed to test trigger:", err);
      onerror(err instanceof Error && err.message ? err.message : m.chatTriggers.testFailed());
    } finally {
      testing = false;
    }
  }

  async function loadStats() {
    try {
      stats = await chatTriggersApi.getTriggerStats(guildId, trigger.id);
    } catch (err) {
      logger.error("Failed to load trigger stats:", err);
      onerror(err instanceof Error && err.message ? err.message : m.chatTriggers.statsFailed());
    }
  }

  $effect(() => {
    if (open && !stats) void loadStats();
  });
</script>

<EditorGroup title={m.chatTriggers.groupTest()} bind:open>
  <SettingField label={m.chatTriggers.testSample()} id="ct-test-sample">
    <div class="flex flex-col sm:flex-row gap-3">
      <input
        id="ct-test-sample"
        type="text"
        bind:value={sample}
        onkeydown={(e) => e.key === "Enter" && runTest()}
        class="grow p-3 rounded-lg border focus:ring-2 min-h-[50px]"
        style="background: {$colorStore.primary}10; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
      >
      <button
        type="button"
        class="px-6 rounded-xl min-h-[50px] font-medium"
        style="background: {$colorStore.primary}20; color: {$colorStore.text}; border: 1px solid {$colorStore.primary}30;"
        disabled={testing}
        onclick={runTest}
      >
        {m.common.test()}
      </button>
    </div>
  </SettingField>

  {#if result}
    <p class="text-sm" style="color: {$colorStore.text}" role="status">
      {#if result.wouldFire}
        {m.chatTriggers.testWouldFire()}
      {:else if !result.matched}
        {m.chatTriggers.testNoMatch()}
      {:else}
        {m.chatTriggers.testBlocked({ blocker: result.blocker ?? "" })}
      {/if}
    </p>
  {/if}

  {#if stats}
    <div class="space-y-2">
      <p class="text-sm font-medium" style="color: {$colorStore.text}">
        {Number(stats.total) === 1 ? m.chatTriggers.statsTotalOne({ count: 1 }) : m.chatTriggers.statsTotalOther({ count: Number(stats.total) })}
      </p>
      {#if stats.recent.length > 0}
        <ul class="space-y-1 text-sm" style="color: {$colorStore.muted}">
          {#each stats.recent as fire, index (index)}
            <li>
              {m.chatTriggers.statsFire({ user: String(fire.userId), channel: String(fire.channelId) })}
              {#if fire.dateAdded}
                <time datetime={fire.dateAdded}>{new Date(fire.dateAdded + (fire.dateAdded.endsWith("Z") ? "" : "Z")).toLocaleString()}</time>
              {/if}
            </li>
          {/each}
        </ul>
      {/if}
    </div>
  {/if}
</EditorGroup>
