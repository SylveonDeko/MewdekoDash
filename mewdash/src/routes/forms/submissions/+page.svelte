<script lang="ts">
  /**
   * Everything the signed-in person has submitted, across every server, newest first.
   *
   * Without this page a submitter can only reach a response through the status link they were
   * handed once at submission time, which is a link people lose.
   */
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";
  import { fade, fly } from "svelte/transition";
  import {
    formsApi,
    instanceManagementApi,
    RESPONSE_STATUS_LABELS,
    type UserSubmission
  } from "$lib/api/index.ts";
  import { colorStore } from "$lib/stores/colorStore";
  import type { PageData } from "./$types";

  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();

  let submissions = $state<UserSubmission[]>([]);
  let loading = $state(true);
  let error = $state<string | null>(null);

  /** Which statuses the list is narrowed to, or null for everything. */
  let statusFilter = $state<string | null>(null);

  let filtered = $derived(
    statusFilter ? submissions.filter((s) => s.status === statusFilter) : submissions
  );

  /** How many submissions sit in each status, for the filter chips. */
  let counts = $derived.by(() => {
    const tally: Record<string, number> = {};
    for (const submission of submissions) {
      tally[submission.status] = (tally[submission.status] ?? 0) + 1;
    }
    return tally;
  });

  /**
   * Submissions can live on any instance, so every one is asked and the answers pooled. An
   * instance that fails to answer is skipped rather than emptying the whole page.
   */
  async function loadSubmissions() {
    try {
      loading = true;
      error = null;

      const instances = await instanceManagementApi.getBotInstances();
      const collected: UserSubmission[] = [];

      for (const instance of instances) {
        try {
          const response = await fetch(`/api/forms/submissions/${data.user.id}`, {
            headers: {
              "Content-Type": "application/json",
              "X-Instance-Port": instance.port.toString()
            }
          });

          if (!response.ok) continue;

          const rows = await response.json();
          if (Array.isArray(rows)) collected.push(...rows);
        } catch {
          // This instance is unreachable. The others still have something to say.
        }
      }

      submissions = collected.sort(
        (a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
      );
    } catch (err) {
      error = err instanceof Error ? err.message : "Failed to load your submissions";
    } finally {
      loading = false;
    }
  }

  function statusStyle(status: string) {
    return (
      RESPONSE_STATUS_LABELS[status as keyof typeof RESPONSE_STATUS_LABELS] ?? {
        label: status,
        color: $colorStore.muted,
        icon: "fa-circle"
      }
    );
  }

  onMount(() => {
    if (!data.user) {
      goto(`/api/discord/login?redirect_to=${encodeURIComponent("/forms/submissions")}`);
      return;
    }

    loadSubmissions();
  });
</script>

<svelte:head>
  <title>My submissions - Mewdeko</title>
  <meta content="Every form you have submitted and where each one stands" name="description" />
</svelte:head>

<main
  class="min-h-screen py-8 px-4"
  style="background: linear-gradient(135deg, {$colorStore.primary}08 0%, {$colorStore.secondary}05 100%);"
>
  <div class="container mx-auto max-w-3xl space-y-6">
    <div>
      <h1 class="text-3xl font-bold mb-1" style="color: {$colorStore.text};">My submissions</h1>
      <p style="color: {$colorStore.muted};">
        Every form you have sent, and where each one stands.
      </p>
    </div>

    {#if error}
      <div
        class="p-4 rounded-xl"
        style="background: #ef444410; border: 1px solid #ef444430; color: #ef4444;"
        in:fade
      >
        {error}
      </div>
    {/if}

    {#if loading}
      <div class="p-10 text-center" style="color: {$colorStore.muted};">
        <i class="fa-solid fa-spinner fa-spin text-2xl mb-3"></i>
        <div>Gathering your submissions</div>
      </div>
    {:else if submissions.length === 0}
      <div
        class="p-10 rounded-xl text-center"
        style="background: {$colorStore.primary}05; border: 1px solid {$colorStore.primary}20;"
      >
        <i class="fa-solid fa-inbox text-3xl mb-3" style="color: {$colorStore.muted};"></i>
        <div class="font-semibold mb-1" style="color: {$colorStore.text};">Nothing here yet</div>
        <div style="color: {$colorStore.muted};">
          Forms you submit will show up here so you can check on them.
        </div>
      </div>
    {:else}
      <div class="flex flex-wrap gap-2">
        <button
          type="button"
          onclick={() => (statusFilter = null)}
          class="px-3 py-1.5 rounded-full text-sm font-medium transition-all"
          style="background: {statusFilter === null ? $colorStore.primary + '25' : $colorStore.primary + '08'};
                 color: {statusFilter === null ? $colorStore.text : $colorStore.muted};
                 border: 1px solid {$colorStore.primary}25;"
        >
          All ({submissions.length})
        </button>

        {#each Object.entries(counts) as [status, count]}
          {@const style = statusStyle(status)}
          <button
            type="button"
            onclick={() => (statusFilter = status)}
            class="px-3 py-1.5 rounded-full text-sm font-medium transition-all"
            style="background: {statusFilter === status ? style.color + '25' : $colorStore.primary + '08'};
                   color: {statusFilter === status ? style.color : $colorStore.muted};
                   border: 1px solid {statusFilter === status ? style.color + '50' : $colorStore.primary + '25'};"
          >
            <i class="fa-solid {style.icon} mr-1"></i>
            {style.label} ({count})
          </button>
        {/each}
      </div>

      <div class="space-y-3">
        {#each filtered as submission, index (submission.responseId)}
          {@const style = statusStyle(submission.status)}
          <div
            class="p-5 rounded-xl"
            style="background: {$colorStore.primary}05; border: 1px solid {$colorStore.primary}25;"
            in:fly={{ y: 12, duration: 250, delay: index * 40 }}
          >
            <div class="flex items-start justify-between gap-4 flex-wrap">
              <div class="flex items-start gap-3 min-w-0">
                {#if submission.guildIconUrl}
                  <img src={submission.guildIconUrl} alt="" class="w-10 h-10 rounded-full flex-shrink-0" />
                {:else}
                  <span
                    class="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center"
                    style="background: {$colorStore.primary}15;"
                  >
                    <i class="fa-solid fa-server" style="color: {$colorStore.muted};"></i>
                  </span>
                {/if}
                <div class="min-w-0">
                  <div class="font-semibold text-lg truncate" style="color: {$colorStore.text};">
                    {submission.formName}
                  </div>
                  <div class="text-sm truncate" style="color: {$colorStore.muted};">
                    {submission.guildName ?? "Unknown server"}
                  </div>
                </div>
              </div>

              <span
                class="flex-shrink-0 px-3 py-1 rounded-full text-sm font-medium"
                style="background: {style.color}20; color: {style.color};"
              >
                <i class="fa-solid {style.icon} mr-1"></i>
                {style.label}
              </span>
            </div>

            <div class="mt-3 text-sm space-y-1" style="color: {$colorStore.muted};">
              <div>
                <i class="fa-solid fa-paper-plane mr-2"></i>
                Submitted {new Date(submission.submittedAt).toLocaleString()}
              </div>

              {#if submission.editedAt}
                <div>
                  <i class="fa-solid fa-pen mr-2"></i>
                  Edited {new Date(submission.editedAt).toLocaleString()}
                </div>
              {/if}

              {#if submission.reviewedAt}
                <div>
                  <i class="fa-solid fa-gavel mr-2"></i>
                  Reviewed {new Date(submission.reviewedAt).toLocaleString()}
                </div>
              {/if}
            </div>

            {#if submission.reviewNotes}
              <div
                class="mt-3 p-3 rounded-lg text-sm"
                style="background: {$colorStore.primary}08; color: {$colorStore.text};"
              >
                <div class="font-medium mb-1" style="color: {$colorStore.muted};">
                  Reviewer notes
                </div>
                <div class="whitespace-pre-wrap">{submission.reviewNotes}</div>
              </div>
            {/if}

            {#if submission.statusToken}
              <a
                href="/forms/status/{submission.statusToken}"
                class="inline-block mt-3 px-4 py-2 rounded-lg text-sm font-medium transition-all"
                style="background: {$colorStore.primary}15; color: {$colorStore.text}; border: 1px solid {$colorStore.primary}30;"
              >
                <i class="fa-solid fa-arrow-up-right-from-square mr-2"></i>
                View status
              </a>
            {/if}
          </div>
        {/each}
      </div>

      <p class="text-xs text-center" style="color: {$colorStore.muted};">
        Responses sent anonymously are stored without a submitter, so they do not appear here. The
        status link you were given at the time is the only way back to one.
      </p>
    {/if}
  </div>
</main>
