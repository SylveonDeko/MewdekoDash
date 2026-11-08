<script lang="ts">
  import { m } from "$lib/i18n";
  import { untrack } from "svelte";
  import { colorStore } from "$lib/stores/colorStore";
  import {
    getTriggerModeLabel,
    StickyTriggerMode,
    type CreateRepeaterRequest,
    type RepeaterResponse,
    type UpdateRepeaterRequest
  } from "$lib/api/index.ts";
  import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";
  import SettingField from "$lib/components/forms/SettingField.svelte";
  import ToggleRow from "$lib/components/forms/ToggleRow.svelte";
  import MessageField from "$lib/components/plugin/MessageField.svelte";
  import SaveStatus from "$lib/components/ui/SaveStatus.svelte";
  import type { AutoSave } from "$lib/utils/autoSave.svelte";
  import type { DiscordUser } from "$lib/types/discord";
  import DurationField from "./DurationField.svelte";
  import NumberField from "./NumberField.svelte";
  import Sheet from "$lib/components/ui/Sheet.svelte";
  import { idString, secondsSpan, spanSeconds, type ForumChannel } from "./model";

  interface Props {
    repeater: RepeaterResponse | null;
    channelOptions: Array<{ id: string; name: string; label?: string }>;
    forums: ForumChannel[];
    autoSave: AutoSave;
    user?: DiscordUser | null;
    creating: boolean;
    problem: string | null;
    onchange: (patch: UpdateRepeaterRequest, typing: boolean) => void;
    oncreate: (request: CreateRepeaterRequest) => void;
    ontrigger: () => void;
    onclose: () => void;
  }

  let { repeater: source, channelOptions, forums, autoSave, user = null, creating, problem, onchange, oncreate, ontrigger, onclose }: Props =
    $props();

  const repeater = untrack(() => source);

  interface Form {
    channelId: string;
    message: string;
    triggerMode: StickyTriggerMode;
    interval: string;
    startTimeOfDay: string;
    activityThreshold: number;
    activityTimeWindow: string;
    conversationDetection: boolean;
    conversationThreshold: number;
    noRedundant: boolean;
    isEnabled: boolean;
    priority: number;
    maxAge: string;
    maxTriggers: number | null;
    timeSchedulePreset: string;
    threadAutoSticky: boolean;
    threadOnlyMode: boolean;
    suppressNotifications: boolean;
    requiredTags: string[];
    excludedTags: string[];
  }

  const isNew = repeater === null;

  function tagsOf(json: string | null | undefined, key: "requiredTags" | "excludedTags"): string[] {
    if (!json) return [];
    try {
      const parsed = JSON.parse(json);
      const list = parsed?.[key] ?? parsed?.[key[0].toUpperCase() + key.slice(1)];
      return Array.isArray(list) ? list.map(String) : [];
    } catch {
      return [];
    }
  }

  let form: Form = $state({
    channelId: repeater ? idString(repeater.channelId) : "",
    message: repeater?.message ?? "",
    triggerMode: repeater?.triggerMode ?? StickyTriggerMode.TimeInterval,
    interval: repeater?.interval || "01:00:00",
    startTimeOfDay: repeater?.startTimeOfDay ?? "",
    activityThreshold: repeater?.activityThreshold ?? 5,
    activityTimeWindow: repeater?.activityTimeWindow || "00:05:00",
    conversationDetection: repeater?.conversationDetection ?? false,
    conversationThreshold: repeater?.conversationThreshold ?? 3,
    noRedundant: repeater?.noRedundant ?? false,
    isEnabled: repeater?.isEnabled ?? true,
    priority: repeater?.priority ?? 50,
    maxAge: repeater?.maxAge ?? "",
    maxTriggers: repeater?.maxTriggers ?? null,
    timeSchedulePreset: repeater?.timeConditions ? "custom" : "none",
    threadAutoSticky: repeater?.threadAutoSticky ?? false,
    threadOnlyMode: repeater?.threadOnlyMode ?? false,
    suppressNotifications: repeater?.suppressNotifications ?? false,
    requiredTags: tagsOf(repeater?.forumTagConditions, "requiredTags"),
    excludedTags: tagsOf(repeater?.forumTagConditions, "excludedTags")
  });
  let attempted = $state(false);

  const forum = $derived(forums.find(item => item.id === form.channelId) ?? null);
  const timed = $derived(form.triggerMode === StickyTriggerMode.TimeInterval);
  const activity = $derived(
    form.triggerMode === StickyTriggerMode.OnActivity ||
      form.triggerMode === StickyTriggerMode.OnNoActivity ||
      form.triggerMode === StickyTriggerMode.AfterMessages
  );
  const channelName = $derived(channelOptions.find(channel => channel.id === form.channelId)?.name ?? form.channelId);
  const missing = $derived(!form.channelId ? m.common.noChannelSelected() : !form.message.trim() ? m.channelMessages.problemMessage() : null);

  const modeOptions = $derived(
    [StickyTriggerMode.TimeInterval, StickyTriggerMode.OnActivity, StickyTriggerMode.OnNoActivity, StickyTriggerMode.Immediate]
      .concat(form.triggerMode === StickyTriggerMode.AfterMessages ? [StickyTriggerMode.AfterMessages] : [])
      .map(mode => ({ id: String(mode), name: getTriggerModeLabel(mode) }))
  );

  const scheduleOptions = $derived(
    (
      [
        ["none", m.channelMessages.scheduleNone()],
        ["business", m.repeaters.timePresetBusiness()],
        ["evening", m.repeaters.timePresetEvening()],
        ["weekend", m.repeaters.timePresetWeekend()]
      ] as Array<[string, string]>
    )
      .concat(form.timeSchedulePreset === "custom" ? [["custom", m.repeaters.timePresetCustom()]] : [])
      .map(([id, name]) => ({ id, name }))
  );

  const tagOptions = $derived((forum?.tags ?? []).map(tag => ({ id: tag.id, name: tag.name })));

  function tagConditions(source: Pick<Form, "requiredTags" | "excludedTags">): string {
    if (!source.requiredTags.length && !source.excludedTags.length) return "";
    return JSON.stringify({
      ...(source.requiredTags.length ? { requiredTags: source.requiredTags } : {}),
      ...(source.excludedTags.length ? { excludedTags: source.excludedTags } : {})
    });
  }

  function toUpdate(patch: Partial<Form>): UpdateRepeaterRequest {
    const { channelId, maxAge, maxTriggers, timeSchedulePreset, requiredTags, excludedTags, ...rest } = patch;
    const update: UpdateRepeaterRequest = { ...rest };
    if (channelId !== undefined) update.channelId = BigInt(channelId);
    if (maxAge !== undefined) {
      if (maxAge) update.maxAge = maxAge;
      else update.clearMaxAge = true;
    }
    if (maxTriggers !== undefined) {
      if (maxTriggers) update.maxTriggers = maxTriggers;
      else update.clearMaxTriggers = true;
    }
    if (timeSchedulePreset !== undefined && timeSchedulePreset !== "custom") update.timeSchedulePreset = timeSchedulePreset;
    if (requiredTags !== undefined || excludedTags !== undefined) update.forumTagConditions = tagConditions(form);
    return update;
  }

  function set(patch: Partial<Form>, typing = false) {
    form = { ...form, ...patch };
    if (isNew) return;
    if (patch.channelId !== undefined && !form.channelId) return;
    onchange(toUpdate(patch), typing);
  }

  function list(selected: string | string[] | null): string[] {
    return Array.isArray(selected) ? selected : [];
  }

  function create() {
    attempted = true;
    if (missing || creating) return;
    const request: CreateRepeaterRequest = {
      channelId: BigInt(form.channelId),
      message: form.message,
      triggerMode: form.triggerMode,
      interval: form.interval,
      startTimeOfDay: form.startTimeOfDay || null,
      activityThreshold: form.activityThreshold,
      activityTimeWindow: form.activityTimeWindow,
      conversationDetection: form.conversationDetection,
      conversationThreshold: form.conversationThreshold,
      noRedundant: form.noRedundant,
      priority: form.priority,
      timeSchedulePreset: form.timeSchedulePreset === "none" ? null : form.timeSchedulePreset,
      maxAge: form.maxAge || null,
      maxTriggers: form.maxTriggers || null,
      threadAutoSticky: forum ? form.threadAutoSticky : false,
      threadOnlyMode: forum ? form.threadOnlyMode : false,
      suppressNotifications: form.suppressNotifications,
      forumTagConditions: forum ? tagConditions(form) || null : null
    };
    oncreate(request);
  }
</script>

{#snippet actions()}
  {#if !isNew}
    <SaveStatus {autoSave} />
  {/if}
  <ToggleRow
    colors={$colorStore}
    checked={form.isEnabled}
    title={form.isEnabled ? m.common.enabled() : m.common.disabled()}
    onchange={(isEnabled) => set({ isEnabled })}
  />
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
  title={isNew ? m.channelMessages.repeaterNewTitle() : m.channelMessages.repeaterEditTitle({ channel: channelName })}
  size="xl"
  {actions}
  footer={isNew ? footer : undefined}
  {onclose}
>
  <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start [&>*]:min-w-0">
  <div class="space-y-4">
  <SettingField label={m.common.channel()} id="cm-rep-channel">
    <DiscordSelector
      id="cm-rep-channel"
      type="custom"
      customIcon="fa-comments"
      options={channelOptions.map(channel => ({ ...channel, label: channel.label ?? `#${channel.name}` }))}
      selected={form.channelId}
      placeholder={m.common.selectAChannelPlaceholder()}
      onchange={(detail) => set({ channelId: typeof detail.selected === "string" ? detail.selected : "" })}
    />
  </SettingField>

  <SettingField label={m.common.message()} id="cm-rep-message">
    <MessageField
      value={form.message}
      previewTitle={m.channelMessages.repeaterPreviewTitle()}
      icon="fa-clock"
      {user}
      onchange={(message) => set({ message }, true)}
    />
  </SettingField>
  </div>

  <div class="space-y-4">
  <SettingField label={m.channelMessages.repeaterTrigger()} id="cm-rep-mode">
    <DiscordSelector
      id="cm-rep-mode"
      type="custom"
      options={modeOptions}
      selected={String(form.triggerMode)}
      searchable={false}
      clearable={false}
      customIcon="fa-bolt"
      onchange={(detail) => typeof detail.selected === "string" && set({ triggerMode: Number(detail.selected) as StickyTriggerMode })}
    />
  </SettingField>

  {#if timed}
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <DurationField
        id="cm-rep-interval"
        label={m.channelMessages.repeaterEvery()}
        seconds={spanSeconds(form.interval, 3600)}
        min={5}
        max={1500000}
        onchange={(seconds) => set({ interval: secondsSpan(seconds) }, true)}
      />
      <SettingField label={m.channelMessages.repeaterStart()} id="cm-rep-start">
        <input
          id="cm-rep-start"
          type="time"
          value={form.startTimeOfDay.slice(0, 5)}
          oninput={(event) => set({ startTimeOfDay: event.currentTarget.value }, true)}
          class="w-full p-3 rounded-lg border focus:ring-2 min-h-[50px]"
          style="background: {$colorStore.primary}10; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
        >
      </SettingField>
    </div>
  {:else if activity}
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <NumberField
        id="cm-rep-threshold"
        label={m.channelMessages.repeaterThreshold()}
        value={form.activityThreshold}
        min={1}
        onchange={(activityThreshold) => set({ activityThreshold }, true)}
      />
      <DurationField
        id="cm-rep-window"
        label={m.channelMessages.repeaterWindow()}
        seconds={spanSeconds(form.activityTimeWindow, 300)}
        min={5}
        onchange={(seconds) => set({ activityTimeWindow: secondsSpan(seconds) }, true)}
      />
    </div>
  {/if}

  <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
    <ToggleRow colors={$colorStore} checked={form.noRedundant} title={m.channelMessages.repeaterNoRedundant()} onchange={(noRedundant) => set({ noRedundant })} />
    <ToggleRow
      colors={$colorStore}
      checked={form.suppressNotifications}
      title={m.channelMessages.repeaterSilent()}
      onchange={(suppressNotifications) => set({ suppressNotifications })}
    />
    <ToggleRow
      colors={$colorStore}
      checked={form.conversationDetection}
      title={m.channelMessages.repeaterConversation()}
      onchange={(conversationDetection) => set({ conversationDetection })}
    />
    <ToggleRow
      colors={$colorStore}
      checked={form.maxAge !== ""}
      title={m.channelMessages.repeaterExpires()}
      onchange={(on) => set({ maxAge: on ? "7.00:00:00" : "" })}
    />
    <ToggleRow
      colors={$colorStore}
      checked={form.maxTriggers !== null}
      title={m.channelMessages.repeaterLimitPosts()}
      onchange={(on) => set({ maxTriggers: on ? 10 : null })}
    />
  </div>

  {#if form.conversationDetection}
    <NumberField
      id="cm-rep-conversation"
      label={m.channelMessages.repeaterConversationThreshold()}
      value={form.conversationThreshold}
      min={1}
      onchange={(conversationThreshold) => set({ conversationThreshold }, true)}
    />
  {/if}

  {#if form.maxAge !== "" || form.maxTriggers !== null}
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      {#if form.maxAge !== ""}
        <DurationField
          id="cm-rep-max-age"
          label={m.channelMessages.repeaterMaxAge()}
          seconds={spanSeconds(form.maxAge, 604800)}
          units={["h", "d"]}
          onchange={(seconds) => set({ maxAge: secondsSpan(seconds) }, true)}
        />
      {/if}
      {#if form.maxTriggers !== null}
        <NumberField
          id="cm-rep-max-triggers"
          label={m.channelMessages.repeaterMaxPosts()}
          value={form.maxTriggers}
          min={1}
          onchange={(maxTriggers) => set({ maxTriggers }, true)}
        />
      {/if}
    </div>
  {/if}

  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
    <SettingField label={m.channelMessages.repeaterSchedule()} id="cm-rep-schedule">
      <DiscordSelector
        id="cm-rep-schedule"
        type="custom"
        options={scheduleOptions}
        selected={form.timeSchedulePreset}
        searchable={false}
        clearable={false}
        customIcon="fa-calendar"
        onchange={(detail) => typeof detail.selected === "string" && set({ timeSchedulePreset: detail.selected })}
      />
    </SettingField>
    <NumberField
      id="cm-rep-priority"
      label={m.channelMessages.repeaterPriority()}
      value={form.priority}
      min={0}
      onchange={(priority) => set({ priority }, true)}
    />
  </div>

  {#if forum}
    <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
      <ToggleRow
        colors={$colorStore}
        checked={form.threadAutoSticky}
        title={m.channelMessages.repeaterThreadSticky()}
        onchange={(threadAutoSticky) => set({ threadAutoSticky })}
      />
      <ToggleRow
        colors={$colorStore}
        checked={form.threadOnlyMode}
        title={m.channelMessages.repeaterThreadOnly()}
        onchange={(threadOnlyMode) => set({ threadOnlyMode })}
      />
    </div>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <SettingField label={m.channelMessages.repeaterRequiredTags()} id="cm-rep-required-tags">
        <DiscordSelector
          id="cm-rep-required-tags"
          type="custom"
          multiple={true}
          customIcon="fa-tag"
          options={tagOptions}
          selected={form.requiredTags}
          placeholder={m.channelMessages.repeaterAnyTag()}
          onchange={(detail) => set({ requiredTags: list(detail.selected) })}
        />
      </SettingField>
      <SettingField label={m.channelMessages.repeaterExcludedTags()} id="cm-rep-excluded-tags">
        <DiscordSelector
          id="cm-rep-excluded-tags"
          type="custom"
          multiple={true}
          customIcon="fa-tag"
          options={tagOptions}
          selected={form.excludedTags}
          placeholder={m.common.none()}
          onchange={(detail) => set({ excludedTags: list(detail.selected) })}
        />
      </SettingField>
    </div>
  {/if}
  </div>

  {#if !isNew}
    <div class="lg:col-span-2">
      <button
        type="button"
        class="flex items-center justify-center gap-2 px-5 rounded-xl min-h-[50px] font-medium w-full sm:w-auto"
        style="background: {$colorStore.primary}20; color: {$colorStore.text}; border: 1px solid {$colorStore.primary}30;"
        onclick={ontrigger}
      >
        <i class="fa-solid fa-play" aria-hidden="true"></i>
        {m.channelMessages.repeaterSendNow()}
      </button>
    </div>
  {/if}
  </div>
</Sheet>
