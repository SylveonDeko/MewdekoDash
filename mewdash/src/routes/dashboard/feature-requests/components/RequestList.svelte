<script lang="ts">
  import { m } from "$lib/i18n";
  import { featureRequestsApi } from "$lib/api/index.ts";
  import type { FeatureRequestEntry } from "$lib/api/featurerequests/models";
  import { logger } from "$lib/logger";
  import { requestConfirmation } from "$lib/stores/confirmationStore";
  import RequestCard from "./RequestCard.svelte";
  import StatusSheet from "./StatusSheet.svelte";
  import { errorText, type Notify } from "./requestModel";

  interface Props {
    entries: FeatureRequestEntry[];
    owner: boolean;
    notify: Notify;
    /** Called after the list changed on the bot. */
    onchanged: () => void;
  }

  let { entries = $bindable(), owner, notify, onchanged }: Props = $props();

  let statusTarget: FeatureRequestEntry | null = $state(null);

  function replace(next: FeatureRequestEntry) {
    entries = entries.map(entry => (entry.id === next.id ? next : entry));
  }

  async function vote(entry: FeatureRequestEntry) {
    const voted = !entry.voted;
    replace({ ...entry, voted, votes: entry.votes + (voted ? 1 : -1) });
    try {
      const result = await featureRequestsApi.toggleVote(entry.id);
      replace({ ...entry, votes: result.votes, voted: result.voted });
    } catch (err) {
      logger.error("Failed to toggle vote:", err);
      replace(entry);
      notify(errorText(err, m.featureRequests.errorVote()), "error");
    }
  }

  async function remove(entry: FeatureRequestEntry) {
    const confirmed = await requestConfirmation({
      title: m.featureRequests.deleteTitle(),
      message: m.featureRequests.deleteMessage({ title: entry.title }),
      confirmText: m.common.delete(),
      cancelText: m.featureRequests.deleteKeep()
    });
    if (!confirmed) return;
    try {
      await featureRequestsApi.deleteRequest(entry.id);
      entries = entries.filter(existing => existing.id !== entry.id);
      onchanged();
    } catch (err) {
      logger.error("Failed to delete feature request:", err);
      notify(errorText(err, m.featureRequests.errorDelete()), "error");
    }
  }
</script>

<div class="space-y-2">
  {#each entries as entry (entry.id)}
    <RequestCard
      {entry}
      {owner}
      onvote={() => vote(entry)}
      onstatus={() => (statusTarget = entry)}
      ondelete={() => remove(entry)}
    />
  {/each}
</div>

{#if statusTarget}
  {#key statusTarget.id}
    <StatusSheet
      entry={statusTarget}
      {notify}
      onclose={() => (statusTarget = null)}
      onsaved={(updated) => {
        replace({ ...updated, voted: statusTarget?.voted ?? updated.voted });
        onchanged();
      }}
    />
  {/key}
{/if}
