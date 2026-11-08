<script lang="ts">
  import { m } from "$lib/i18n";
  import { onMount } from "svelte";
  import { colorStore } from "$lib/stores/colorStore";
  import { logger } from "$lib/logger";
  import { requestConfirmation } from "$lib/stores/confirmationStore";
  import {
    formatInterval,
    getTriggerModeLabel,
    repeatersApi,
    StickyTriggerMode,
    type CreateRepeaterRequest,
    type RepeaterResponse,
    type UpdateRepeaterRequest
  } from "$lib/api/index.ts";
  import PluginCard from "$lib/components/plugin/PluginCard.svelte";
  import type { AutoSave } from "$lib/utils/autoSave.svelte";
  import type { DiscordUser } from "$lib/types/discord";
  import ListRow from "./ListRow.svelte";
  import RepeaterSheet from "./RepeaterSheet.svelte";
  import { durationLabel, errorText, idString, preview, spanSeconds, type Shared } from "./model";

  interface Props {
    shared: Shared;
    autoSave: AutoSave;
    user?: DiscordUser | null;
    onerror: (message: string) => void;
    onsuccess: (message: string) => void;
  }

  let { shared, autoSave, user = null, onerror, onsuccess }: Props = $props();

  let repeaters: RepeaterResponse[] = $state([]);
  let loading = $state(true);
  let editingId: number | null = $state(null);
  let creating = $state(false);
  let busy = $state(false);
  let problem: string | null = $state(null);

  const sorted = $derived([...repeaters].sort((a, b) => a.id - b.id));
  const editing = $derived(repeaters.find(r => r.id === editingId) ?? null);

  const channelOptions = $derived([
    ...shared.channels.map(channel => ({ id: channel.id, name: channel.name })),
    ...shared.forums.map(forum => ({ id: forum.id, name: forum.name, label: m.channelMessages.forumOption({ name: forum.name }) }))
  ]);

  const buttonStyle = $derived(
    `background: ${$colorStore.primary}20; color: ${$colorStore.text}; border: 1px solid ${$colorStore.primary}30;`
  );

  function channelName(id: bigint | string): string {
    const key = idString(id);
    const name = channelOptions.find(channel => channel.id === key)?.name;
    if (name) return `#${name}`;
    return shared.loading ? m.common.loading() : m.roleMenus.channelDeleted();
  }

  function badges(repeater: RepeaterResponse): string[] {
    const list = [getTriggerModeLabel(repeater.triggerMode)];
    if (repeater.triggerMode === StickyTriggerMode.TimeInterval) list.push(formatInterval(repeater.interval));
    else if (repeater.triggerMode !== StickyTriggerMode.Immediate) {
      list.push(
        m.channelMessages.repeaterBadgeActivity({
          count: repeater.activityThreshold,
          window: durationLabel(spanSeconds(repeater.activityTimeWindow, 300))
        })
      );
    }
    if (repeater.disabledReason) list.push(repeater.disabledReason);
    return list;
  }

  async function load() {
    try {
      const all = await repeatersApi.getRepeaters(shared.guildId);
      repeaters = all.filter(r => !(r.triggerMode === StickyTriggerMode.AfterMessages && !r.threadOnlyMode));
    } catch (err) {
      logger.error("Failed to load repeaters:", err);
      onerror(errorText(err, m.channelMessages.errorLoad()));
    } finally {
      loading = false;
    }
  }

  onMount(() => void load());

  function close() {
    void autoSave.flush();
    editingId = null;
    creating = false;
    problem = null;
  }

  function change(id: number, patch: UpdateRepeaterRequest, typing: boolean) {
    const keys = Object.keys(patch).join(",");
    const send = async () => {
      try {
        await repeatersApi.updateRepeater(shared.guildId, id, patch);
        if (!typing) await load();
      } catch (err) {
        await load();
        throw err;
      }
    };
    if (typing) autoSave.schedule(`repeater:${id}:${keys}`, send);
    else void autoSave.now(`repeater:${id}:${keys}`, send);
  }

  function toggle(repeater: RepeaterResponse, isEnabled: boolean) {
    repeaters = repeaters.map(r => (r.id === repeater.id ? { ...r, isEnabled } : r));
    change(repeater.id, { isEnabled }, false);
  }

  async function create(request: CreateRepeaterRequest) {
    busy = true;
    problem = null;
    try {
      const created = await repeatersApi.createRepeater(shared.guildId, request);
      await load();
      creating = false;
      editingId = created.id;
      onsuccess(m.channelMessages.notifyRepeaterCreated());
    } catch (err) {
      logger.error("Failed to create repeater:", err);
      problem = errorText(err, m.channelMessages.errorSave());
    } finally {
      busy = false;
    }
  }

  async function remove(repeater: RepeaterResponse) {
    const confirmed = await requestConfirmation({
      message: m.channelMessages.repeaterDeleteConfirm({ channel: channelName(repeater.channelId) }),
      confirmText: m.common.delete()
    });
    if (!confirmed) return;
    try {
      await repeatersApi.deleteRepeater(shared.guildId, repeater.id);
      repeaters = repeaters.filter(r => r.id !== repeater.id);
      if (editingId === repeater.id) editingId = null;
      onsuccess(m.channelMessages.notifyDeleted());
    } catch (err) {
      logger.error("Failed to delete repeater:", err);
      onerror(errorText(err, m.channelMessages.errorDelete()));
    }
  }

  async function trigger(id: number) {
    try {
      await repeatersApi.triggerRepeater(shared.guildId, id);
      onsuccess(m.channelMessages.notifySent());
    } catch (err) {
      logger.error("Failed to trigger repeater:", err);
      onerror(errorText(err, m.channelMessages.errorSend()));
    }
  }
</script>

{#snippet newButton()}
  <button
    type="button"
    class="flex items-center justify-center gap-2 px-5 rounded-xl min-h-[50px] font-medium"
    style={buttonStyle}
    onclick={() => {
      problem = null;
      creating = true;
    }}
  >
    <i class="fa-solid fa-plus" aria-hidden="true"></i>
    {m.channelMessages.newRepeater()}
  </button>
{/snippet}

<PluginCard title={m.channelMessages.repeatersTitle()} alwaysOpen actions={newButton}>
  {#if loading}
    <div class="flex justify-center py-6">
      <div class="w-10 h-10 border-4 rounded-full animate-spin" style="border-color: {$colorStore.primary}20; border-top-color: {$colorStore.primary}"></div>
    </div>
  {:else if sorted.length === 0}
    <div class="flex flex-col items-center gap-3 py-8 text-center">
      <i class="fa-solid fa-clock" style="color: {$colorStore.muted}; font-size: 28px;" aria-hidden="true"></i>
      <p class="font-medium" style="color: {$colorStore.text}">{m.channelMessages.repeatersEmpty()}</p>
    </div>
  {:else}
    <div class="space-y-2">
      {#each sorted as repeater (repeater.id)}
        <ListRow
          title={channelName(repeater.channelId)}
          subtitle={preview(repeater.message)}
          badges={badges(repeater)}
          enabled={repeater.isEnabled}
          name={channelName(repeater.channelId)}
          onedit={() => (editingId = repeater.id)}
          ondelete={() => remove(repeater)}
          ontoggle={(enabled) => toggle(repeater, enabled)}
        />
      {/each}
    </div>
  {/if}
</PluginCard>

{#if editing}
  {#key editingId}
    <RepeaterSheet
      repeater={editing}
      {channelOptions}
      forums={shared.forums}
      {autoSave}
      {user}
      creating={false}
      problem={null}
      onchange={(patch, typing) => change(editing.id, patch, typing)}
      oncreate={() => {}}
      ontrigger={() => trigger(editing.id)}
      onclose={close}
    />
  {/key}
{/if}

{#if creating}
  <RepeaterSheet
    repeater={null}
    {channelOptions}
    forums={shared.forums}
    {autoSave}
    {user}
    creating={busy}
    {problem}
    onchange={() => {}}
    oncreate={create}
    ontrigger={() => {}}
    onclose={close}
  />
{/if}
