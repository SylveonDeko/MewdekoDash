<script lang="ts">
  import { untrack } from "svelte";
  import { m } from "$lib/i18n";
  import { featureRequestsApi } from "$lib/api/index.ts";
  import type { FeatureRequestEntry, FeatureRequestStatus } from "$lib/api/featurerequests/models";
  import { colorStore } from "$lib/stores/colorStore";
  import { logger } from "$lib/logger";
  import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";
  import Sheet from "$lib/components/ui/Sheet.svelte";
  import { errorText, NOTE_MAX, statusOptions, type Notify } from "./requestModel";

  interface Props {
    entry: FeatureRequestEntry;
    notify: Notify;
    onclose: () => void;
    onsaved: (updated: FeatureRequestEntry) => void;
  }

  let { entry, notify, onclose, onsaved }: Props = $props();

  const target = untrack(() => entry);
  let status: FeatureRequestStatus = $state(target.status);
  let note = $state(target.ownerNote ?? "");
  let busy = $state(false);

  async function save() {
    if (busy) return;
    busy = true;
    try {
      const updated = await featureRequestsApi.setStatus(target.id, { status, note: note.trim() || null });
      onsaved(updated);
      onclose();
    } catch (err) {
      logger.error("Failed to update feature request status:", err);
      notify(errorText(err, m.featureRequests.errorUpdateStatus()), "error");
    } finally {
      busy = false;
    }
  }
</script>

<Sheet title={target.title} {onclose}>
  <div>
    <span id="fr-status-label" class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">{m.common.status()}</span>
    <DiscordSelector
      type="custom"
      options={statusOptions()}
      selected={status}
      searchable={false}
      clearable={false}
      customIcon="fa-flag"
      ariaLabelledby="fr-status-label"
      onchange={(detail) => {
        if (typeof detail.selected === "string") status = detail.selected as FeatureRequestStatus;
      }}
    />
  </div>

  <div>
    <label for="fr-status-note" class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">{m.featureRequests.statusNoteLabel()}</label>
    <textarea
      id="fr-status-note"
      bind:value={note}
      rows="5"
      maxlength={NOTE_MAX}
      class="w-full p-3 rounded-lg border focus:ring-2 resize-y"
      style="background: {$colorStore.primary}10; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
    ></textarea>
  </div>

  {#snippet footer()}
    <button
      type="button"
      class="px-5 rounded-lg min-h-[44px]"
      style="background: {$colorStore.primary}10; color: {$colorStore.text}; border: 1px solid {$colorStore.primary}20;"
      onclick={onclose}
    >
      {m.common.cancel()}
    </button>
    <button
      type="button"
      class="px-5 rounded-lg min-h-[44px] font-medium disabled:opacity-50"
      style="background: {$colorStore.primary}; color: {$colorStore.onPrimary};"
      disabled={busy}
      onclick={save}
    >
      {busy ? m.common.saving() : m.common.save()}
    </button>
  {/snippet}
</Sheet>
