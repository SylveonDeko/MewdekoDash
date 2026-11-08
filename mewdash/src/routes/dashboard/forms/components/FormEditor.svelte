<script lang="ts">
  import { onMount } from "svelte";
  import { m } from "$lib/i18n";
  import { formsApi, type Form, type FormQuestion } from "$lib/api/index.ts";
  import type { GuildEmojiInfo } from "$lib/api/client/models";
  import type { DiscordUser } from "$lib/types/discord";
  import { colorStore } from "$lib/stores/colorStore";
  import { requestConfirmation } from "$lib/stores/confirmationStore";
  import { logger } from "$lib/logger";
  import { sanitizeFormName, sanitizeInput, sanitizeQuestionText } from "$lib/utils/sanitize";
  import { validateForm } from "$lib/utils/formValidation";
  import { defaultFormSettings, settingsFromForm, settingsToForm, type FormSettings } from "$lib/utils/formSettings";
  import SubTabs from "$lib/components/ui/SubTabs.svelte";
  import Sheet from "$lib/components/ui/Sheet.svelte";
  import BasicsCards from "./settings/BasicsCards.svelte";
  import ScheduleCards from "./settings/ScheduleCards.svelte";
  import ReviewCards from "./settings/ReviewCards.svelte";
  import QuestionsEditor from "./question/QuestionsEditor.svelte";
  import VersionsPanel from "./VersionsPanel.svelte";
  import { errorText, type Named, type Notify } from "./formsModel";

  interface Props {
    formId: number | null;
    guildId: bigint;
    userId: bigint;
    user: DiscordUser | null;
    channels: Named[];
    roles: Named[];
    emojis: GuildEmojiInfo[];
    guildApproveEmote: string | null;
    guildRejectEmote: string | null;
    onclose: () => void;
    onsaved: () => Promise<void>;
    notify: Notify;
  }

  let { formId, guildId, userId, user, channels, roles, emojis, guildApproveEmote, guildRejectEmote, onclose, onsaved, notify }: Props = $props();

  const SECTIONS = ["settings", "questions", "history"] as const;
  type Section = (typeof SECTIONS)[number];

  let section: Section = $state("settings");
  let settings: FormSettings = $state(defaultFormSettings());
  let questions: FormQuestion[] = $state([]);
  let announcedAt: string | null = $state(null);
  let loading = $state(true);
  let saving = $state(false);
  let snapshot = $state("");

  const creating = $derived(formId === null);
  const dirty = $derived(!loading && JSON.stringify({ settings, questions }) !== snapshot);
  const visible = $derived(creating ? SECTIONS.filter((id) => id !== "history") : SECTIONS);

  const labels = $derived<Record<Section, { label: string; icon: string }>>({
    settings: { label: m.common.settings(), icon: "fa-gear" },
    questions: { label: m.forms.listQuestions(), icon: "fa-list-check" },
    history: { label: m.forms.versionTitle(), icon: "fa-clock-rotate-left" }
  });

  const title = $derived(creating ? m.forms.pageActionCreateForm() : settings.name || m.forms.pageActionEditForm());

  function capture() {
    snapshot = JSON.stringify({ settings, questions });
  }

  async function load() {
    if (formId === null) {
      capture();
      loading = false;
      return;
    }
    loading = true;
    try {
      const [form, loaded] = await Promise.all([formsApi.getForm(formId), formsApi.getFormQuestions(formId)]);
      settings = settingsFromForm(form as Form);
      announcedAt = form.announcedAt ?? null;
      questions = loaded;
      capture();
    } catch (err) {
      logger.error("Failed to load the form:", err);
      notify(errorText(err, m.forms.editLoadFailed()), "error");
      onclose();
    } finally {
      loading = false;
    }
  }

  function payload() {
    return questions
      .filter((q) => q.questionType === "section_break" || q.questionText?.trim())
      .map((question) => {
        const hasOptions = ["multiple_choice", "checkboxes", "dropdown"].includes(question.questionType);
        return {
          question: {
            id: question.id > 0 ? question.id : 0,
            questionText: sanitizeQuestionText(question.questionText ?? ""),
            questionType: question.questionType,
            isRequired: question.questionType === "section_break" ? false : question.isRequired || false,
            placeholder: question.placeholder ? sanitizeInput(question.placeholder) : undefined,
            imageUrl: question.imageUrl || undefined,
            minValue: question.minValue,
            maxValue: question.maxValue,
            minLength: question.minLength,
            maxLength: question.maxLength,
            enableAnswerPiping: question.enableAnswerPiping || false,
            conditionalType: question.conditionalType || 0,
            conditionalParentQuestionId: question.conditionalParentQuestionId,
            conditionalOperator: question.conditionalOperator,
            conditionalExpectedValue: question.conditionalExpectedValue ? sanitizeInput(question.conditionalExpectedValue) : undefined,
            conditionalRoleIds: question.conditionalRoleIds,
            conditionalRoleLogic: question.conditionalRoleLogic,
            conditionalDaysInServer: question.conditionalDaysInServer,
            conditionalAccountAgeDays: question.conditionalAccountAgeDays,
            conditionalRequiresBoost: question.conditionalRequiresBoost,
            conditionalRequiresNitro: question.conditionalRequiresNitro,
            conditionalPermissionFlags: question.conditionalPermissionFlags,
            requiredWhenParentQuestionId: question.requiredWhenParentQuestionId,
            requiredWhenOperator: question.requiredWhenOperator,
            requiredWhenValue: question.requiredWhenValue
          },
          options: hasOptions
            ? (question.options ?? [])
                .filter((o) => o.optionText?.trim())
                .map((o) => ({ optionText: sanitizeInput(o.optionText), optionValue: sanitizeInput(o.optionValue || o.optionText) }))
            : [],
          conditions: question.conditionalType === 5 ? (question.conditions ?? []) : []
        };
      });
  }

  async function save() {
    if (saving) return;
    const problems = validateForm(settings.name, questions.filter((q) => q.questionType !== "section_break"));
    if (problems.length > 0) {
      notify(problems[0].message, "error");
      return;
    }
    saving = true;
    try {
      await formsApi.saveForm(guildId, {
        form: {
          ...settingsToForm(settings),
          id: formId ?? 0,
          name: sanitizeFormName(settings.name),
          description: settings.description ? sanitizeInput(settings.description) : undefined
        },
        questions: payload(),
        userId
      });
      notify(creating ? m.forms.pageNotifyCreated() : m.forms.editSaved());
      capture();
      await onsaved();
      onclose();
    } catch (err) {
      logger.error("Failed to save the form:", err);
      notify(errorText(err, creating ? m.forms.createFailed() : m.forms.editFailed()), "error");
    } finally {
      saving = false;
    }
  }

  async function close() {
    if (dirty) {
      const ok = await requestConfirmation({ message: m.forms.discardConfirm(), confirmText: m.forms.discardButton() });
      if (!ok) return;
    }
    onclose();
  }

  async function restored() {
    await load();
    notify(m.forms.editRestored());
  }

  onMount(() => {
    void load();
  });
</script>

<Sheet {title} size="xl" onclose={close}>
  {#if loading}
    <div class="flex justify-center py-10">
      <div class="w-10 h-10 border-4 rounded-full animate-spin" style="border-color: {$colorStore.primary}20; border-top-color: {$colorStore.primary}"></div>
    </div>
  {:else}
    <SubTabs
      tabs={visible.map((id) => ({ id, label: labels[id].label, icon: labels[id].icon }))}
      active={section}
      ariaLabel={m.forms.sectionsAria()}
      onselect={(id) => (section = id as Section)}
    />

    {#if section === "settings"}
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start [&>*]:min-w-0">
        <BasicsCards bind:settings {channels} {roles} {creating} />
        <ScheduleCards bind:settings {channels} {roles} {announcedAt} {user} />
        <ReviewCards bind:settings {roles} {emojis} {guildApproveEmote} {guildRejectEmote} />
      </div>
    {:else if section === "questions"}
      <QuestionsEditor bind:questions formId={formId ?? 0} {roles} {notify} />
    {:else if formId !== null}
      <VersionsPanel {formId} {userId} onrestored={restored} {notify} />
    {/if}
  {/if}

  {#snippet footer()}
    <button
      type="button"
      class="px-5 rounded-xl min-h-[50px] font-medium"
      style="background: {$colorStore.primary}10; color: {$colorStore.text}; border: 1px solid {$colorStore.primary}20;"
      onclick={close}
    >
      {m.common.cancel()}
    </button>
    <button
      type="button"
      class="px-5 rounded-xl min-h-[50px] font-medium disabled:opacity-50"
      style="background: {$colorStore.primary}; color: {$colorStore.onPrimary};"
      disabled={saving || loading}
      onclick={save}
    >
      {creating ? m.common.create() : m.common.saveChanges()}
    </button>
  {/snippet}
</Sheet>
