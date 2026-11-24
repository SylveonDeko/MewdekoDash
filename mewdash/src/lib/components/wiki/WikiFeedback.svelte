<!-- lib/components/wiki/WikiFeedback.svelte -->
<script lang="ts">
  import { onMount } from "svelte";
  import { m } from "$lib/i18n";
  import { colorStore } from "$lib/stores/colorStore";
  import { wikiCall, wikiErrorMessage } from "$lib/wiki/client";
  import { feedbackReasons, wikiLimits } from "$lib/wiki/validation";
  import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";

  interface Props {
    pageId: string;
    locale: string;
    signedIn: boolean;
  }

  let { pageId, locale, signedIn }: Props = $props();

  let vote = $state<boolean | null>(null);
  let reason = $state("");
  let note = $state("");
  let busy = $state(false);
  let reported = $state(false);
  let error = $state<string | null>(null);

  const reasonOptions = $derived(
    feedbackReasons.map((id) => ({
      id,
      name:
        id === "unclear"
          ? m.wikiManage.reasonUnclear()
          : id === "outdated"
            ? m.wikiManage.reasonOutdated()
            : id === "missing"
              ? m.wikiManage.reasonMissing()
              : id === "incorrect"
                ? m.wikiManage.reasonIncorrect()
                : m.common.other(),
    }))
  );

  const field = $derived(
    `background: ${$colorStore.primary}10; border-color: ${$colorStore.primary}30; color: ${$colorStore.text};`
  );

  function choice(active: boolean): string {
    return active
      ? `background: ${$colorStore.selectedSurface}; color: ${$colorStore.text}; border: 1px solid ${$colorStore.selectedBorder};`
      : `background: ${$colorStore.primary}20; color: ${$colorStore.text}; border: 1px solid ${$colorStore.primary}30;`;
  }

  const voteKey = $derived(`wiki:vote:${pageId}|${locale}`);

  function remembered(): boolean | null {
    try {
      const value = localStorage.getItem(voteKey);
      return value === "yes" ? true : value === "no" ? false : null;
    } catch {
      return null;
    }
  }

  function remember(helpful: boolean) {
    try {
      localStorage.setItem(voteKey, helpful ? "yes" : "no");
    } catch {
      return;
    }
  }

  function browserKey(): string | null {
    try {
      let key = localStorage.getItem("wiki:voter");
      if (!key) {
        key = crypto.randomUUID().replaceAll("-", "") + crypto.randomUUID().replaceAll("-", "").slice(0, 16);
        localStorage.setItem("wiki:voter", key);
      }
      return key;
    } catch {
      return null;
    }
  }

  onMount(async () => {
    vote = remembered();
    if (!signedIn) return;
    const result = await wikiCall<{ vote: boolean | null }>("GET", `/api/wiki/vote?pageId=${pageId}&locale=${encodeURIComponent(locale)}`);
    if (result.ok && result.data && result.data.vote !== null) vote = result.data.vote;
  });

  async function cast(helpful: boolean) {
    if (busy) return;
    busy = true;
    error = null;
    const result = await wikiCall("POST", "/api/wiki/vote", { pageId, locale, helpful, browserKey: signedIn ? undefined : browserKey() });
    busy = false;
    if (!result.ok) {
      error = wikiErrorMessage(result.error);
      return;
    }
    vote = helpful;
    remember(helpful);
  }

  async function report() {
    busy = true;
    error = null;
    const result = await wikiCall("POST", "/api/wiki/feedback", { pageId, locale, helpful: false, reason, note });
    busy = false;
    if (!result.ok) {
      error = wikiErrorMessage(result.error);
      return;
    }
    reported = true;
  }
</script>

<section class="mt-10 space-y-3" aria-labelledby="wiki-feedback-title">
  <h2 id="wiki-feedback-title" class="text-lg font-bold" style="color: {$colorStore.text}">{m.wikiManage.feedbackQuestion()}</h2>
  <div class="flex flex-wrap gap-2">
    <button type="button" class="px-5 rounded-lg min-h-[50px] font-medium disabled:opacity-50" style={choice(vote === true)}
            aria-pressed={vote === true} disabled={busy} onclick={() => cast(true)}>
      <i class="fa-solid fa-thumbs-up mr-2" aria-hidden="true"></i>{m.common.yes()}
    </button>
    <button type="button" class="px-5 rounded-lg min-h-[50px] font-medium disabled:opacity-50" style={choice(vote === false)}
            aria-pressed={vote === false} disabled={busy} onclick={() => cast(false)}>
      <i class="fa-solid fa-thumbs-down mr-2" aria-hidden="true"></i>{m.common.no()}
    </button>
  </div>
  {#if vote !== null && (vote || !signedIn || reported)}
    <p class="text-sm" style="color: {$colorStore.muted}" role="status">{m.wikiManage.feedbackThanks()}</p>
  {/if}
  {#if vote === false && signedIn && !reported}
    <div class="space-y-3 max-w-xl">
      <div>
        <span id="wiki-feedback-reason" class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">{m.wikiManage.feedbackReason()}</span>
        <DiscordSelector
          type="custom"
          options={reasonOptions}
          selected={reason}
          searchable={false}
          ariaLabelledby="wiki-feedback-reason"
          onchange={(e) => { reason = typeof e.selected === "string" ? e.selected : ""; }}
        />
      </div>
      <div>
        <label for="wiki-feedback-note" class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">{m.wikiManage.feedbackNote()}</label>
        <textarea id="wiki-feedback-note" bind:value={note} maxlength={wikiLimits.feedbackNoteMax} rows="3"
                  class="w-full p-3 rounded-lg border" style={field}></textarea>
      </div>
      <button type="button" class="px-5 rounded-lg min-h-[50px] font-semibold disabled:opacity-50"
              style="background: {$colorStore.primary}; color: {$colorStore.onPrimary};"
              disabled={busy} onclick={report}>
        {m.wikiManage.feedbackSend()}
      </button>
    </div>
  {/if}
  {#if error}
    <p class="text-sm text-red-400" role="alert">{error}</p>
  {/if}
</section>
