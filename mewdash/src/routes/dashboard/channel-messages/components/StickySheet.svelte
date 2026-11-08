<script lang="ts">
  import { m } from "$lib/i18n";
  import { untrack } from "svelte";
  import { colorStore } from "$lib/stores/colorStore";
  import type { Sticky } from "$lib/api/channelmessages/channelmessages";
  import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";
  import SettingField from "$lib/components/forms/SettingField.svelte";
  import MessageField from "$lib/components/plugin/MessageField.svelte";
  import SaveStatus from "$lib/components/ui/SaveStatus.svelte";
  import type { AutoSave } from "$lib/utils/autoSave.svelte";
  import type { DiscordUser } from "$lib/types/discord";
  import DurationField from "./DurationField.svelte";
  import NumberField from "./NumberField.svelte";
  import Sheet from "$lib/components/ui/Sheet.svelte";
  import { idString, preview, type Named } from "./model";

  interface Props {
    sticky: Sticky | null;
    channels: Named[];
    taken: string[];
    autoSave: AutoSave;
    user?: DiscordUser | null;
    creating: boolean;
    problem: string | null;
    onchange: (sticky: Sticky, typing: boolean) => void;
    oncreate: (sticky: Sticky) => void;
    onclose: () => void;
  }

  let { sticky: source, channels, taken, autoSave, user = null, creating, problem, onchange, oncreate, onclose }: Props = $props();

  const sticky = untrack(() => source);

  const isNew = sticky === null;

  let draft: Sticky = $state(sticky ?? { channelId: "", content: "", messages: 5, seconds: 15 });
  let attempted = $state(false);

  const channelId = $derived(idString(draft.channelId));
  const channelName = $derived(channels.find(channel => channel.id === channelId)?.name ?? channelId);
  const options = $derived(channels.filter(channel => !taken.includes(channel.id)));
  const missing = $derived(!channelId ? m.common.noChannelSelected() : !draft.content.trim() ? m.channelMessages.problemMessage() : null);

  function set(patch: Partial<Sticky>, typing = false) {
    draft = { ...draft, ...patch };
    if (!isNew && draft.content.trim()) onchange($state.snapshot(draft), typing);
  }

  function create() {
    attempted = true;
    if (missing || creating) return;
    oncreate($state.snapshot(draft));
  }
</script>

{#snippet actions()}
  {#if !isNew}
    <SaveStatus {autoSave} />
  {/if}
{/snippet}

{#snippet footer()}
  {#if (attempted && missing) || problem}
    <p class="grow basis-full sm:basis-0 text-sm text-red-400" role="alert">{problem ?? missing}</p>
  {/if}
  <button
    type="button"
    class="px-5 rounded-xl min-h-[44px] font-medium"
    style="background: {$colorStore.primary}10; color: {$colorStore.text}; border: 1px solid {$colorStore.primary}20;"
    onclick={onclose}
  >
    {m.common.cancel()}
  </button>
  <button
    type="button"
    class="flex items-center justify-center gap-2 px-5 rounded-xl min-h-[44px] font-medium disabled:opacity-60"
    style="background: {$colorStore.primary}; color: {$colorStore.onPrimary};"
    disabled={creating}
    onclick={create}
  >
    <i class="fa-solid fa-plus" aria-hidden="true"></i>
    {m.common.create()}
  </button>
{/snippet}

<Sheet
  title={isNew ? m.channelMessages.stickyNewTitle() : m.channelMessages.stickyEditTitle({ channel: channelName })}
  size="lg"
  {actions}
  footer={isNew ? footer : undefined}
  {onclose}
>
  <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start [&>*]:min-w-0">
  <div class="space-y-4">
  {#if isNew}
    <SettingField label={m.common.channel()} id="cm-sticky-channel">
      <DiscordSelector
        id="cm-sticky-channel"
        type="channel"
        options={options}
        selected={channelId}
        placeholder={m.common.selectAChannelPlaceholder()}
        onchange={(detail) => set({ channelId: typeof detail.selected === "string" ? detail.selected : "" })}
      />
    </SettingField>
  {:else}
    <p class="flex items-center gap-2 text-sm" style="color: {$colorStore.muted}">
      <i class="fa-solid fa-hashtag" aria-hidden="true"></i>
      <span class="truncate" style="color: {$colorStore.text}">{channelName}</span>
    </p>
  {/if}

  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-4">
    <NumberField
      id="cm-sticky-messages"
      label={m.channelMessages.stickyMessages()}
      value={draft.messages}
      min={1}
      max={1000}
      onchange={(messages) => set({ messages }, true)}
    />
    <DurationField
      id="cm-sticky-seconds"
      label={m.channelMessages.stickyWait()}
      seconds={draft.seconds}
      min={5}
      max={21600}
      units={["s", "m", "h"]}
      onchange={(seconds) => set({ seconds }, true)}
    />
  </div>
  </div>

  <SettingField label={m.common.message()} id="cm-sticky-message">
    <MessageField
      value={draft.content}
      previewTitle={m.channelMessages.stickyPreviewTitle()}
      icon="fa-thumbtack"
      {user}
      placeholder={preview(draft.content)}
      onchange={(content) => set({ content })}
    />
  </SettingField>
  </div>
</Sheet>
