<script lang="ts">
  import { m } from "$lib/i18n";
  import { featureRequestsApi } from "$lib/api/index.ts";
  import type { FeatureRequestEntry } from "$lib/api/featurerequests/models";
  import { colorStore } from "$lib/stores/colorStore";
  import { logger } from "$lib/logger";
  import PluginCard from "$lib/components/plugin/PluginCard.svelte";
  import RequestList from "./RequestList.svelte";
  import { errorText, type Notify } from "./requestModel";

  interface Props {
    owner: boolean;
    notify: Notify;
    onsuggest: () => void;
  }

  let { owner, notify, onsuggest }: Props = $props();

  let entries: FeatureRequestEntry[] = $state([]);
  let loading = $state(true);

  async function load() {
    try {
      entries = (await featureRequestsApi.getMine()) ?? [];
    } catch (err) {
      logger.error("Failed to fetch own feature requests:", err);
      notify(errorText(err, m.featureRequests.errorLoad()), "error");
    } finally {
      loading = false;
    }
  }

  void load();
</script>

<PluginCard title={m.featureRequests.tabMine()} alwaysOpen>
  {#if loading}
    <p class="text-sm" style="color: {$colorStore.muted}">{m.featureRequests.loadingRequests()}</p>
  {:else if entries.length === 0}
    <div class="space-y-3 py-4">
      <p class="text-sm" style="color: {$colorStore.muted}">{m.featureRequests.mineEmpty()}</p>
      <button
        type="button"
        class="px-5 rounded-lg min-h-[44px]"
        style="background: {$colorStore.primary}10; color: {$colorStore.text}; border: 1px solid {$colorStore.primary}20;"
        onclick={onsuggest}
      >
        {m.featureRequests.mineEmptyAction()}
      </button>
    </div>
  {:else}
    <RequestList bind:entries {owner} {notify} onchanged={load} />
  {/if}
</PluginCard>
