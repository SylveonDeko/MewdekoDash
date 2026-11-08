<script lang="ts">
  import { m } from "$lib/i18n";
  import { formsApi, intToFormType, type Form } from "$lib/api/index.ts";
  import { colorStore } from "$lib/stores/colorStore";
  import { currentInstance } from "$lib/stores/instanceStore.ts";
  import { requestConfirmation } from "$lib/stores/confirmationStore";
  import { logger } from "$lib/logger";
  import PluginCard from "$lib/components/plugin/PluginCard.svelte";
  import { formTypeLabel } from "$lib/components/forms/formLabels";
  import OverflowMenu from "./OverflowMenu.svelte";
  import ShareSheet from "./ShareSheet.svelte";
  import { errorText, isExpired, type MenuItem, type Notify } from "./formsModel";

  interface Props {
    forms: Form[];
    loading: boolean;
    userId: bigint;
    onreload: () => Promise<void>;
    onnew: () => void;
    onedit: (formId: number) => void;
    onresponses: (formId: number) => void;
    notify: Notify;
  }

  let { forms = $bindable(), loading, userId, onreload, onnew, onedit, onresponses, notify }: Props = $props();

  let query = $state("");
  let shareLink = $state<string | null>(null);

  const shown = $derived.by(() => {
    const needle = query.trim().toLowerCase();
    const list = needle ? forms.filter((form) => form.name.toLowerCase().includes(needle)) : forms;
    return [...list].sort((a, b) => b.id - a.id);
  });

  function patch(id: number, changes: Partial<Form>) {
    forms = forms.map((form) => (form.id === id ? { ...form, ...changes } : form));
  }

  async function toggleActive(form: Form) {
    const next = !form.isActive;
    patch(form.id, { isActive: next });
    try {
      await formsApi.setFormActiveStatus(form.id, next);
      notify(next ? m.forms.pageNotifyActivated() : m.forms.pageNotifyDeactivated());
    } catch (err) {
      logger.error("Failed to change form status:", err);
      patch(form.id, { isActive: !next });
      notify(errorText(err, m.forms.pageErrorStatus()), "error");
    }
  }

  async function publish(form: Form) {
    try {
      await formsApi.publishForm(form.id);
      patch(form.id, { isDraft: false });
      notify(m.forms.pageNotifyPublished());
    } catch (err) {
      logger.error("Failed to publish form:", err);
      notify(errorText(err, m.forms.pageErrorPublish()), "error");
    }
  }

  async function duplicate(form: Form) {
    try {
      const copy = await formsApi.duplicateForm(form.id, userId);
      await onreload();
      notify(m.forms.pageNotifyDuplicated({ name: copy.name }));
    } catch (err) {
      logger.error("Failed to duplicate form:", err);
      notify(errorText(err, m.forms.pageErrorDuplicate()), "error");
    }
  }

  async function remove(form: Form) {
    const ok = await requestConfirmation({ message: m.forms.pageConfirmDelete({ name: form.name }), confirmText: m.common.delete() });
    if (!ok) return;
    try {
      await formsApi.deleteForm(form.id);
      forms = forms.filter((x) => x.id !== form.id);
      notify(m.forms.pageNotifyDeleted());
    } catch (err) {
      logger.error("Failed to delete form:", err);
      notify(errorText(err, m.forms.pageErrorDelete()), "error");
    }
  }

  async function codeFor(form: Form): Promise<string | null> {
    const instance = $currentInstance;
    if (!instance) {
      notify(m.forms.pageErrorNoInstance(), "error");
      return null;
    }
    try {
      const { shareCode } = await formsApi.generateShareLink(form.id, instance.port.toString());
      return shareCode;
    } catch (err) {
      logger.error("Failed to get the share link:", err);
      notify(errorText(err, m.forms.pageErrorShareLink()), "error");
      return null;
    }
  }

  async function share(form: Form) {
    const code = await codeFor(form);
    if (code) shareLink = `${window.location.origin}/forms/${code}`;
  }

  async function preview(form: Form) {
    const code = await codeFor(form);
    if (code) window.open(`/forms/${code}?preview=true`, "_blank");
  }

  function menu(form: Form): MenuItem[] {
    return [
      { label: m.common.edit(), icon: "fa-pen", onclick: () => onedit(form.id) },
      { label: m.common.responses(), icon: "fa-inbox", onclick: () => onresponses(form.id) },
      { label: m.common.preview(), icon: "fa-eye", onclick: () => preview(form) },
      { label: m.common.copyLink(), icon: "fa-link", onclick: () => share(form) },
      { label: m.forms.listPublish(), icon: "fa-paper-plane", onclick: () => publish(form), hidden: !form.isDraft },
      {
        label: form.isActive ? m.common.pause() : m.common.activate(),
        icon: form.isActive ? "fa-pause" : "fa-play",
        onclick: () => toggleActive(form)
      },
      { label: m.common.duplicate(), icon: "fa-copy", onclick: () => duplicate(form) },
      { label: m.common.delete(), icon: "fa-trash", onclick: () => remove(form) }
    ];
  }

  function badges(form: Form): string[] {
    const list: string[] = [];
    if (form.formType !== 0) list.push(formTypeLabel(intToFormType(form.formType)));
    if (form.isDraft) list.push(m.forms.listDraft());
    else if (isExpired(form)) list.push(m.common.expired());
    else if (!form.isActive) list.push(m.common.inactive());
    if (form.pendingCount) list.push(m.forms.listPendingCount({ count: form.pendingCount }));
    list.push(`${form.responseCount ?? 0} ${m.common.responses()}`);
    list.push(`${form.questionCount ?? 0} ${m.forms.listQuestions()}`);
    if (form.requireCaptcha) list.push(m.common.captcha());
    if (form.allowAnonymous) list.push(m.common.anonymous());
    return list;
  }

  const buttonStyle = $derived(`background: ${$colorStore.primary}20; color: ${$colorStore.text}; border: 1px solid ${$colorStore.primary}30;`);
  const iconButton = $derived(`background: ${$colorStore.primary}10; color: ${$colorStore.text}; border: 1px solid ${$colorStore.primary}20;`);
</script>

{#snippet newButton()}
  <button type="button" class="flex items-center justify-center gap-2 px-5 rounded-xl min-h-[50px] font-medium" style={buttonStyle} onclick={onnew}>
    <i class="fa-solid fa-plus" aria-hidden="true"></i>
    {m.forms.pageActionCreateForm()}
  </button>
{/snippet}

<PluginCard title={m.features.formsName()} alwaysOpen actions={newButton}>
  {#if loading && forms.length === 0}
    <div class="flex justify-center py-6">
      <div class="w-10 h-10 border-4 rounded-full animate-spin" style="border-color: {$colorStore.primary}20; border-top-color: {$colorStore.primary}"></div>
    </div>
  {:else if forms.length === 0}
    <div class="py-6 text-center space-y-1">
      <p class="font-medium" style="color: {$colorStore.text}">{m.forms.listEmptyTitle()}</p>
      <p class="text-sm" style="color: {$colorStore.muted}">{m.forms.listEmptyBody()}</p>
    </div>
  {:else}
    <input
      type="search"
      bind:value={query}
      placeholder={m.common.searchPlaceholder()}
      aria-label={m.common.search()}
      class="w-full p-3 rounded-lg border min-h-[50px]"
      style="background: {$colorStore.primary}10; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
    />
    <div class="space-y-2">
      {#each shown as form (form.id)}
        <div
          class="flex items-center gap-2 rounded-xl border p-2 sm:p-3"
          class:opacity-60={!form.isActive || form.isDraft}
          style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}20;"
        >
          <button type="button" class="grow min-w-0 text-left min-h-[44px]" onclick={() => onedit(form.id)}>
            <span class="block text-sm font-semibold truncate" style="color: {$colorStore.text}">{form.name}</span>
            {#if form.description}
              <span class="block text-sm truncate" style="color: {$colorStore.muted}">{form.description}</span>
            {/if}
            <span class="flex flex-wrap items-center gap-1.5 mt-1">
              {#each badges(form) as badge (badge)}
                <span class="text-xs px-2 py-0.5 rounded-full" style="background: {$colorStore.primary}15; color: {$colorStore.text};">{badge}</span>
              {/each}
            </span>
          </button>
          <button
            type="button"
            class="shrink-0 rounded-lg min-h-[44px] min-w-[44px]"
            style={iconButton}
            aria-label={m.forms.rowResponsesAria({ name: form.name })}
            onclick={() => onresponses(form.id)}
          >
            <i class="fa-solid fa-inbox" aria-hidden="true"></i>
          </button>
          <OverflowMenu items={menu(form)} ariaLabel={m.forms.rowMoreAria({ name: form.name })} />
        </div>
      {:else}
        <p class="py-4 text-center" style="color: {$colorStore.muted}">{m.forms.noMatches()}</p>
      {/each}
    </div>
  {/if}
</PluginCard>

{#if shareLink}
  <ShareSheet link={shareLink} onclose={() => (shareLink = null)} {notify} />
{/if}
