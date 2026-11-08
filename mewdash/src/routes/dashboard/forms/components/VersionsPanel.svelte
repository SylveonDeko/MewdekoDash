<script lang="ts">
  import { onMount } from "svelte";
  import { m } from "$lib/i18n";
  import { formsApi, type FormVersion, type FormVersionChange } from "$lib/api/index.ts";
  import { colorStore } from "$lib/stores/colorStore";
  import { logger } from "$lib/logger";
  import { requestConfirmation } from "$lib/stores/confirmationStore";
  import PluginCard from "$lib/components/plugin/PluginCard.svelte";
  import { errorText, formatDate, type Notify } from "./formsModel";

  interface Props {
    formId: number;
    userId: bigint;
    onrestored: () => void;
    notify: Notify;
  }

  let { formId, userId, onrestored, notify }: Props = $props();

  let versions = $state<FormVersion[]>([]);
  let kept = $state(0);
  let loading = $state(true);
  let open = $state<number | null>(null);
  let changes = $state<Record<number, FormVersionChange[]>>({});
  let busy = $state(false);

  const latest = $derived(versions.reduce((max, version) => Math.max(max, version.versionNumber), 0));
  const grouped = $derived.by(() => {
    const entries = open === null ? [] : (changes[open] ?? []);
    const groups = new Map<string, FormVersionChange[]>();
    for (const change of entries) groups.set(change.section, [...(groups.get(change.section) ?? []), change]);
    return [...groups.entries()];
  });

  async function load() {
    try {
      const history = await formsApi.getFormVersions(formId);
      versions = [...(history.versions ?? [])].sort((a, b) => b.versionNumber - a.versionNumber);
      kept = history.versionsKept;
    } catch (err) {
      logger.error("Failed to load form versions:", err);
      notify(errorText(err, m.forms.versionLoadFailed()), "error");
    } finally {
      loading = false;
    }
  }

  async function toggle(version: FormVersion) {
    if (open === version.versionNumber) {
      open = null;
      return;
    }
    open = version.versionNumber;
    if (changes[version.versionNumber]) return;
    try {
      changes[version.versionNumber] = await formsApi.getVersionDiff(formId, version.versionNumber);
    } catch (err) {
      logger.error("Failed to compare form versions:", err);
      notify(errorText(err, m.forms.versionCompareFailed()), "error");
      open = null;
    }
  }

  async function restore(version: FormVersion) {
    const ok = await requestConfirmation({
      title: m.forms.versionRestoreTitle(),
      message: m.forms.versionRestoreMessage({ number: version.versionNumber }),
      confirmText: m.forms.versionRestoreButton()
    });
    if (!ok) return;
    busy = true;
    try {
      await formsApi.restoreFormVersion(formId, version.versionNumber, userId);
      await load();
      onrestored();
    } catch (err) {
      logger.error("Failed to restore the form version:", err);
      notify(errorText(err, m.forms.versionRestoreFailed()), "error");
    } finally {
      busy = false;
    }
  }

  function tint(kind: FormVersionChange["kind"]): string {
    if (kind === "Added") return "#10B981";
    if (kind === "Removed") return "#ef4444";
    return $colorStore.primary;
  }

  onMount(() => {
    void load();
  });
</script>

<PluginCard title={m.forms.versionTitle()} alwaysOpen>
  {#if loading}
    <div class="flex justify-center py-6">
      <div class="w-10 h-10 border-4 rounded-full animate-spin" style="border-color: {$colorStore.primary}20; border-top-color: {$colorStore.primary}"></div>
    </div>
  {:else if versions.length === 0}
    <p class="py-4 text-center" style="color: {$colorStore.muted}">{m.forms.versionEmpty()}</p>
  {:else}
    <p class="text-sm" style="color: {$colorStore.muted}">{m.forms.versionKeptNote({ count: kept })}</p>
    <div class="space-y-2">
      {#each versions as version (version.versionNumber)}
        {@const expanded = open === version.versionNumber}
        <div class="rounded-xl border p-2 sm:p-3 space-y-3" style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}20;">
          <div class="flex items-center gap-2">
            <button type="button" class="grow min-w-0 text-left min-h-[44px]" aria-expanded={expanded} onclick={() => toggle(version)}>
              <span class="block text-sm font-semibold" style="color: {$colorStore.text}">
                {m.forms.versionNumber({ number: version.versionNumber })}
                {#if version.versionNumber === latest}<span class="font-normal" style="color: {$colorStore.muted}">{m.forms.versionCurrent()}</span>{/if}
              </span>
              <span class="block text-sm truncate" style="color: {$colorStore.muted}">
                {formatDate(version.createdAt)} · {version.questionCount} {m.forms.listQuestions()}
              </span>
            </button>
            {#if version.versionNumber !== latest}
              <button
                type="button"
                class="shrink-0 px-4 rounded-lg min-h-[44px] text-sm font-medium disabled:opacity-50"
                style="background: {$colorStore.primary}10; color: {$colorStore.text}; border: 1px solid {$colorStore.primary}20;"
                disabled={busy}
                onclick={() => restore(version)}
              >
                {m.forms.versionRestoreButton()}
              </button>
            {/if}
          </div>

          {#if expanded}
            {#if !changes[version.versionNumber]}
              <p class="text-sm" style="color: {$colorStore.muted}">{m.forms.versionComparing()}</p>
            {:else if grouped.length === 0}
              <p class="text-sm" style="color: {$colorStore.muted}">{m.forms.versionNoChanges()}</p>
            {:else}
              {#each grouped as [section, items] (section)}
                <div class="space-y-1">
                  <h4 class="text-sm font-medium" style="color: {$colorStore.text}">{section}</h4>
                  {#each items as change, i (i)}
                    <div class="rounded-lg border p-2 text-sm min-w-0" style="border-color: {tint(change.kind)}40; background: {tint(change.kind)}10; color: {$colorStore.text};">
                      <div class="font-medium break-words">{change.label}</div>
                      {#if change.before}<div class="break-words line-through" style="color: {$colorStore.muted}">{change.before}</div>{/if}
                      {#if change.after}<div class="break-words">{change.after}</div>{/if}
                    </div>
                  {/each}
                </div>
              {/each}
            {/if}
          {/if}
        </div>
      {/each}
    </div>
  {/if}
</PluginCard>
