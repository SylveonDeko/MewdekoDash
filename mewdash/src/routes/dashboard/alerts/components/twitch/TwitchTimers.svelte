<script lang="ts">
  import { m } from "$lib/i18n";
  import { twitchApi, type TwitchTimerResponse, type TwitchVariableDocsResponse } from "$lib/api/index.ts";
  import { colorStore } from "$lib/stores/colorStore";
  import { logger } from "$lib/logger";
  import { requestConfirmation } from "$lib/stores/confirmationStore";
  import SettingField from "$lib/components/forms/SettingField.svelte";
  import ToggleRow from "$lib/components/forms/ToggleRow.svelte";
  import PluginCard from "$lib/components/plugin/PluginCard.svelte";
  import AlertRow from "../AlertRow.svelte";
  import Sheet from "$lib/components/ui/Sheet.svelte";
  import Button from "./Button.svelte";
  import Input from "./Input.svelte";
  import { formatDate, type Notify } from "./twitchModel";

  interface Props {
    guildId: bigint;
    notify: Notify;
    onhealth: () => void;
  }

  let { guildId, notify, onhealth }: Props = $props();

  const fallbackVariables = ["%channel%", "%url%", "%stream%", "%count:name%", "%random:a|b|c%"];

  const blank = () => ({
    name: "",
    messages: "",
    intervalMinutes: 10,
    minChatMessages: 5,
    onlineOnly: true,
    randomizeMessages: false,
    enabled: true
  });

  let timers: TwitchTimerResponse[] = $state([]);
  let variableDocs = $state<TwitchVariableDocsResponse | null>(null);
  let loading = $state(true);
  let form = $state<ReturnType<typeof blank> | null>(null);
  let busy = $state(false);
  let testing: string | null = $state(null);

  const variables = $derived(variableDocs?.groups.timers ?? fallbackVariables);

  async function load() {
    try {
      [timers, variableDocs] = await Promise.all([
        twitchApi.getTimers(guildId).catch(() => []),
        twitchApi.getVariables().catch(() => null)
      ]);
    } finally {
      loading = false;
    }
  }

  function summary(timer: TwitchTimerResponse): string {
    return m.twitch.timerSummary({
      interval: timer.intervalMinutes,
      chat: timer.minChatMessages,
      online: timer.onlineOnly ? m.twitch.timerOnlineOnly() : m.twitch.timerAlways(),
      order: timer.randomizeMessages ? m.twitch.timerRandom() : m.twitch.timerRotating(),
      last: formatDate(timer.lastSentAt)
    });
  }

  function edit(timer: TwitchTimerResponse) {
    form = {
      name: timer.name,
      messages: timer.messages,
      intervalMinutes: timer.intervalMinutes,
      minChatMessages: timer.minChatMessages,
      onlineOnly: timer.onlineOnly,
      randomizeMessages: timer.randomizeMessages,
      enabled: timer.enabled
    };
  }

  async function save() {
    if (!form || !form.name.trim() || !form.messages.trim()) return;
    busy = true;
    try {
      await twitchApi.saveTimer(guildId, {
        name: form.name.trim(),
        messages: form.messages,
        intervalMinutes: Number(form.intervalMinutes) || 10,
        minChatMessages: Number(form.minChatMessages) || 0,
        onlineOnly: form.onlineOnly,
        randomizeMessages: form.randomizeMessages,
        enabled: form.enabled
      });
      notify(m.twitch.notifyTimerSaved());
      form = null;
      await load();
    } catch (err) {
      logger.error("Failed to save Twitch timer:", err);
      notify(m.twitch.notifyTimerSaveFailed(), "error");
    } finally {
      busy = false;
    }
  }

  async function remove(name: string) {
    const confirmed = await requestConfirmation({ message: m.twitch.confirmRemoveTimer({ name }), confirmText: m.common.remove() });
    if (!confirmed) return;
    try {
      await twitchApi.removeTimer(guildId, name);
      notify(m.twitch.notifyTimerRemoved());
      await load();
    } catch (err) {
      logger.error("Failed to remove Twitch timer:", err);
      notify(m.twitch.notifyTimerRemoveFailed(), "error");
    }
  }

  async function test(name: string) {
    testing = name;
    try {
      const result = await twitchApi.testTimer(guildId, name);
      notify(m.twitch.notifyTimerSent({ message: result.message }));
      onhealth();
    } catch (err) {
      logger.error("Failed to test Twitch timer:", err);
      notify(m.twitch.notifyTimerTestFailed(), "error");
    } finally {
      testing = null;
    }
  }

  void load();
</script>

{#snippet newButton()}
  <Button onclick={() => (form = blank())}>
    <i class="fa-solid fa-plus" aria-hidden="true"></i>
    {m.common.add()}
  </Button>
{/snippet}

<PluginCard title={m.twitch.subtabTimers()} actions={newButton} alwaysOpen>
  {#if loading}
    <div class="flex justify-center py-6">
      <div class="w-10 h-10 border-4 rounded-full animate-spin" style="border-color: {$colorStore.primary}20; border-top-color: {$colorStore.primary}"></div>
    </div>
  {:else if timers.length === 0}
    <p class="py-4 text-center" style="color: {$colorStore.muted}">{m.twitch.timerEmpty()}</p>
  {:else}
    <div class="space-y-2">
      {#each timers as timer (timer.id)}
        <AlertRow
          title={timer.name}
          subtitle={summary(timer)}
          removeLabel={m.common.remove()}
          badges={timer.enabled ? [] : [m.common.disabled()]}
          onopen={() => edit(timer)}
          onremove={() => remove(timer.name)}
        />
      {/each}
    </div>
  {/if}
</PluginCard>

{#if form}
  {@const draft = form}
  {@const existing = timers.find(timer => timer.name === draft.name)}
  <Sheet title={m.features.wizardRepeatersName()} size="lg" onclose={() => (form = null)}>
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div class="space-y-4 min-w-0">
        <SettingField label={m.twitch.timerName()} id="tw-timer-name">
          <Input id="tw-timer-name" bind:value={draft.name} placeholder={m.twitch.timerNamePlaceholder()} />
        </SettingField>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div class="min-w-0">
            <SettingField label={m.twitch.timerInterval()} id="tw-timer-interval">
              <Input id="tw-timer-interval" type="number" min={1} max={1440} bind:value={draft.intervalMinutes} />
            </SettingField>
          </div>
          <div class="min-w-0">
            <SettingField label={m.twitch.timerMinChat()} id="tw-timer-chat">
              <Input id="tw-timer-chat" type="number" min={0} max={10000} bind:value={draft.minChatMessages} />
            </SettingField>
          </div>
        </div>
      </div>
      <div class="space-y-4 min-w-0">
        <ToggleRow checked={draft.onlineOnly} title={m.twitch.timerOnlineOnlyLabel()} colors={$colorStore} onchange={(value) => (draft.onlineOnly = value)} />
        <ToggleRow checked={draft.randomizeMessages} title={m.twitch.timerRandomRotation()} colors={$colorStore} onchange={(value) => (draft.randomizeMessages = value)} />
        <ToggleRow checked={draft.enabled} title={m.common.enabled()} colors={$colorStore} onchange={(value) => (draft.enabled = value)} />
      </div>
      <div class="space-y-4 min-w-0 lg:col-span-2">
        <SettingField label={m.common.messages()} id="tw-timer-messages">
          <Input id="tw-timer-messages" rows={5} bind:value={draft.messages} placeholder={m.twitch.timerMessagesPlaceholder()} />
        </SettingField>
        <div class="flex flex-wrap gap-2">
          {#each variables as variable (variable)}
            <button
              type="button"
              class="rounded-full px-3 min-h-[44px] font-mono text-xs"
              style="background: {$colorStore.primary}12; color: {$colorStore.text};"
              onclick={() => (draft.messages = `${draft.messages}${variable}`)}
            >{variable}</button>
          {/each}
        </div>
      </div>
    </div>
    {#snippet footer()}
      {#if existing}
        <Button compact disabled={testing === existing.name} onclick={() => test(existing.name)}>
          {testing === existing.name ? m.common.sending() : m.common.test()}
        </Button>
      {/if}
      <Button compact variant="primary" disabled={busy || !draft.name.trim() || !draft.messages.trim()} onclick={save}>
        {busy ? m.common.saving() : m.twitch.timerSave()}
      </Button>
    {/snippet}
  </Sheet>
{/if}
