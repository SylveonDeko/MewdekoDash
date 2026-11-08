<script lang="ts">
  import { untrack } from "svelte";
  import { m } from "$lib/i18n";
  import { pollApi, PollType, type CreatePollRequest } from "$lib/api/index.ts";
  import { colorStore } from "$lib/stores/colorStore";
  import { logger } from "$lib/logger";
  import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";
  import SettingField from "$lib/components/forms/SettingField.svelte";
  import ToggleRow from "$lib/components/forms/ToggleRow.svelte";
  import MessageField from "$lib/components/plugin/MessageField.svelte";
  import type { DiscordUser } from "$lib/types/discord";
  import Sheet from "$lib/components/ui/Sheet.svelte";
  import NumberField from "./NumberField.svelte";
  import { errorText, type Named, type PollDraft, type Role } from "./pollModel";

  interface Props {
    guildId: bigint;
    user: DiscordUser;
    initial: PollDraft;
    channels: Named[];
    roles: Role[];
    onclose: () => void;
    oncreated: (scheduled: boolean) => void;
  }

  let { guildId, user, initial, channels, roles, onclose, oncreated }: Props = $props();

  let draft: PollDraft = $state(untrack(() => ({ ...initial, options: [...initial.options] })));
  let problem = $state("");
  let saving = $state(false);

  const isYesNo = $derived(draft.type === PollType.YesNo.toString());
  const isRoleRestricted = $derived(draft.type === PollType.RoleRestricted.toString());

  const typeOptions = $derived([
    { id: PollType.SingleChoice.toString(), name: m.polls.typeSingle() },
    { id: PollType.MultiChoice.toString(), name: m.common.multipleChoice() },
    { id: PollType.YesNo.toString(), name: m.polls.typeYesNo() },
    { id: PollType.Anonymous.toString(), name: m.common.anonymous() },
    { id: PollType.RoleRestricted.toString(), name: m.polls.typeRoleRestricted() }
  ]);

  const placeholders = $derived(
    [
      ["%poll.question%", m.polls.placeholderQuestion()],
      ["%poll.id%", m.polls.placeholderId()],
      ["%poll.votes%", m.polls.placeholderVotes()],
      ["%poll.voters%", m.polls.placeholderVoters()],
      ["%poll.winner%", m.polls.placeholderWinner()],
      ["%poll.winner.votes%", m.polls.placeholderWinnerVotes()],
      ["%poll.results%", m.polls.placeholderResults()],
      ["%poll.link%", m.polls.placeholderLink()]
    ].map(([name, description]) => ({ category: m.features.pollsName(), name, description }))
  );

  const buttonStyle = $derived(
    `background: ${$colorStore.primary}10; color: ${$colorStore.text}; border: 1px solid ${$colorStore.primary}20;`
  );
  const inputStyle = $derived(
    `background: ${$colorStore.primary}10; border-color: ${$colorStore.primary}30; color: ${$colorStore.text};`
  );

  function build(): CreatePollRequest | null {
    if (!draft.question.trim()) {
      problem = m.polls.errorQuestion();
      return null;
    }
    if (!draft.channelId) {
      problem = m.polls.errorChannel();
      return null;
    }
    const options = isYesNo
      ? [{ text: m.common.yes() }, { text: m.common.no() }]
      : draft.options
          .map(option => option.trim())
          .filter(Boolean)
          .map(text => ({ text }));
    if (!isYesNo && options.length < 2) {
      problem = m.polls.errorOptionsMin();
      return null;
    }
    if (options.length > 25) {
      problem = m.polls.errorOptionsMax();
      return null;
    }
    if (isRoleRestricted && draft.allowedRoles.length === 0) {
      problem = m.polls.errorRoles();
      return null;
    }
    const type = parseInt(draft.type) as PollType;
    return {
      question: draft.question.trim(),
      options,
      type,
      channelId: BigInt(draft.channelId),
      durationMinutes: draft.durationMinutes || null,
      maxVotes: draft.maxVotes || null,
      resultsMessage: draft.resultsMessage.trim() ? draft.resultsMessage : null,
      allowMultipleVotes: type === PollType.MultiChoice,
      isAnonymous: type === PollType.Anonymous,
      allowedRoles: isRoleRestricted ? draft.allowedRoles.map(role => BigInt(role)) : null,
      blockedRoles: draft.blockedRoles.length ? draft.blockedRoles.map(role => BigInt(role)) : null,
      allowVoteChanges: draft.allowVoteChanges,
      showResults: draft.showResults,
      showProgressBars: draft.showProgressBars,
      userId: BigInt(user.id)
    };
  }

  async function submit() {
    problem = "";
    const request = build();
    if (!request || saving) return;
    saving = true;
    try {
      if (draft.scheduleFor) {
        const when = new Date(draft.scheduleFor);
        if (Number.isNaN(when.getTime()) || when.getTime() <= Date.now()) {
          problem = m.polls.errorSchedulePast();
          return;
        }
        await pollApi.schedulePoll(guildId, { ...request, scheduledFor: when.toISOString() });
      } else {
        await pollApi.createPoll(guildId, request);
      }
      if (draft.saveAsTemplate && draft.templateName.trim()) {
        await pollApi.createTemplate(guildId, {
          name: draft.templateName.trim(),
          question: request.question,
          options: request.options,
          defaultType: request.type,
          allowMultipleVotes: request.allowMultipleVotes,
          isAnonymous: request.isAnonymous,
          allowVoteChanges: request.allowVoteChanges,
          showResults: request.showResults,
          userId: request.userId
        });
      }
      oncreated(Boolean(draft.scheduleFor));
    } catch (err) {
      logger.error("Failed to create poll:", err);
      problem = errorText(err, m.polls.errorCreateFailed());
    } finally {
      saving = false;
    }
  }
</script>

<Sheet title={m.polls.actionNew()} size="lg" {onclose}>
  <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 [&>*]:min-w-0">
  <div class="space-y-4">
  <SettingField label={m.common.question()} id="poll-question">
    <input id="poll-question" type="text" bind:value={draft.question} maxlength="300" placeholder={m.polls.createQuestionPlaceholder()} class="w-full p-3 rounded-lg border focus:ring-2 min-h-[50px]" style={inputStyle}>
  </SettingField>

  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
    <SettingField label={m.polls.createType()} id="poll-type">
      <DiscordSelector id="poll-type" type="custom" customIcon="fa-chart-simple" options={typeOptions} selected={draft.type} clearable={false} searchable={false} onchange={(detail) => { if (typeof detail.selected === "string") draft.type = detail.selected; }} />
    </SettingField>
    <SettingField label={m.common.channel()} id="poll-channel">
      <DiscordSelector id="poll-channel" type="channel" options={channels} selected={draft.channelId} placeholder={m.common.selectChannelPlaceholder()} onchange={(detail) => (draft.channelId = typeof detail.selected === "string" && detail.selected ? detail.selected : null)} />
    </SettingField>
  </div>

  {#if !isYesNo}
    <div class="space-y-2">
      <span class="block text-sm font-medium" style="color: {$colorStore.text}">{m.common.options()}</span>
      {#each draft.options as _, i (i)}
        <div class="flex gap-2">
          <input type="text" bind:value={draft.options[i]} maxlength="100" placeholder={m.common.optionNumber({ number: i + 1 })} aria-label={m.common.optionNumber({ number: i + 1 })} class="grow min-w-0 p-3 rounded-lg border focus:ring-2 min-h-[50px]" style={inputStyle}>
          <button type="button" class="px-3 rounded-lg min-h-[50px] min-w-[50px] disabled:opacity-40" style={buttonStyle} aria-label={m.common.removeOption()} disabled={draft.options.length <= 2} onclick={() => (draft.options = draft.options.filter((_, index) => index !== i))}>
            <i class="fa-solid fa-xmark" aria-hidden="true"></i>
          </button>
        </div>
      {/each}
      {#if draft.options.length < 25}
        <button type="button" class="flex items-center justify-center gap-2 px-5 rounded-xl min-h-[50px] font-medium" style={buttonStyle} onclick={() => (draft.options = [...draft.options, ""])}>
          <i class="fa-solid fa-plus" aria-hidden="true"></i>{m.common.addOption()}
        </button>
      {/if}
    </div>
  {/if}
  </div>

  <div class="space-y-4">
  {#if isRoleRestricted}
    <SettingField label={m.polls.createRoles()} id="poll-roles">
      <DiscordSelector id="poll-roles" type="role" multiple options={roles} selected={draft.allowedRoles} placeholder={m.common.selectRolesPlaceholder()} onchange={(detail) => (draft.allowedRoles = Array.isArray(detail.selected) ? detail.selected : [])} />
    </SettingField>
  {/if}

  <SettingField label={m.polls.createBlockedRoles()} id="poll-blocked-roles">
    <DiscordSelector id="poll-blocked-roles" type="role" multiple options={roles} selected={draft.blockedRoles} placeholder={m.common.selectRolesPlaceholder()} onchange={(detail) => (draft.blockedRoles = Array.isArray(detail.selected) ? detail.selected : [])} />
  </SettingField>

  <div class="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-4">
    <NumberField id="poll-duration" label={m.common.durationMinutes()} min={1} max={43200} nullable value={draft.durationMinutes} onchange={(value) => (draft.durationMinutes = value)} />
    <NumberField id="poll-max-votes" label={m.polls.createMaxVotes()} min={1} nullable value={draft.maxVotes} onchange={(value) => (draft.maxVotes = value)} />
    <SettingField label={m.polls.createSchedule()} id="poll-schedule">
      <input id="poll-schedule" type="datetime-local" bind:value={draft.scheduleFor} class="w-full p-3 rounded-lg border focus:ring-2 min-h-[50px]" style={inputStyle}>
    </SettingField>
  </div>

  <div class="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-3">
    <ToggleRow checked={draft.allowVoteChanges} title={m.polls.createAllowChanges()} colors={$colorStore} onchange={(value) => (draft.allowVoteChanges = value)} />
    <ToggleRow checked={draft.showResults} title={m.polls.createShowResults()} colors={$colorStore} onchange={(value) => (draft.showResults = value)} />
    <ToggleRow checked={draft.showProgressBars} title={m.polls.createShowBars()} colors={$colorStore} onchange={(value) => (draft.showProgressBars = value)} />
  </div>
  </div>

  <div class="space-y-4 lg:col-span-2">
  <div class="space-y-2">
    <span class="block text-sm font-medium" style="color: {$colorStore.text}">{m.polls.createResultsMessage()}</span>
    <MessageField value={draft.resultsMessage} previewTitle={m.polls.createResultsMessage()} icon="fa-chart-simple" {user} {placeholders} onchange={(message) => (draft.resultsMessage = message)} />
  </div>

  <ToggleRow checked={draft.saveAsTemplate} title={m.polls.createSaveTemplate()} colors={$colorStore} onchange={(value) => (draft.saveAsTemplate = value)} />
  {#if draft.saveAsTemplate}
    <input type="text" bind:value={draft.templateName} maxlength="100" placeholder={m.polls.createTemplateName()} aria-label={m.polls.createTemplateName()} class="w-full p-3 rounded-lg border focus:ring-2 min-h-[50px]" style={inputStyle}>
  {/if}

  {#if problem}
    <p class="text-sm rounded-lg p-3" role="alert" style="background: #ef444420; color: {$colorStore.text};">{problem}</p>
  {/if}
  </div>
  </div>

  {#snippet footer()}
    <button type="button" class="px-5 rounded-xl min-h-[50px] font-medium" style={buttonStyle} onclick={onclose}>{m.common.cancel()}</button>
    <button type="button" class="px-5 rounded-xl min-h-[50px] font-medium disabled:opacity-50" style="background: {$colorStore.primary}; color: {$colorStore.onPrimary};" disabled={saving} onclick={submit}>
      {draft.scheduleFor ? m.polls.createSubmitSchedule() : m.polls.createSubmitPost()}
    </button>
  {/snippet}
</Sheet>
