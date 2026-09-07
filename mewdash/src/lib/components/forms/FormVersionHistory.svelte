<script lang="ts">
  /**
   * The saved history of a form: what each save changed, and the means to put the form back to any
   * of them. Changes are shown before against after side by side, grouped by the part of the form
   * they touch, so a large save can be read a section at a time.
   */
  import { onMount } from "svelte";
  import { fade, slide } from "svelte/transition";
  import { formsApi, type FormVersion, type FormVersionChange } from "$lib/api/index.ts";
  import { colorStore } from "$lib/stores/colorStore";
  import ConfirmationModal from "$lib/components/ui/ConfirmationModal.svelte";

  interface Props {
    /** The form whose history is being shown. */
    formId: number;
    /** Who is looking, recorded against any restore they perform. */
    userId: bigint;
    /** Called after a restore, so the surrounding editor can reload what it is showing. */
    onRestored?: () => void;
  }

  let { formId, userId, onRestored }: Props = $props();

  let versions = $state<FormVersion[]>([]);
  /** How many versions are retained. Stated so nobody expects the history to go back forever. */
  let versionsKept = $state(0);
  let loading = $state(true);
  let error = $state<string | null>(null);

  /** The version whose changes are expanded, or null when none is. */
  let openVersion = $state<number | null>(null);
  let changes = $state<Record<number, FormVersionChange[]>>({});
  let loadingDiff = $state<number | null>(null);

  let restoring = $state(false);
  let pendingRestore = $state<FormVersion | null>(null);

  /** The changes of the open version, grouped under the headings they belong to. */
  let groupedChanges = $derived.by(() => {
    if (openVersion === null) return [];

    const entries = changes[openVersion] ?? [];
    const groups = new Map<string, FormVersionChange[]>();

    for (const change of entries) {
      const existing = groups.get(change.section);
      if (existing) existing.push(change);
      else groups.set(change.section, [change]);
    }

    return [...groups.entries()].map(([section, items]) => ({ section, items }));
  });

  async function loadVersions() {
    try {
      loading = true;
      error = null;

      const history = await formsApi.getFormVersions(formId);
      versions = history.versions ?? [];
      versionsKept = history.versionsKept;
    } catch (err) {
      error = err instanceof Error ? err.message : "Failed to load version history";
    } finally {
      loading = false;
    }
  }

  /** Which change sections are expanded, keyed by heading. */
  let openSections = $state<Set<string>>(new Set());

  function expandAllSections(entries: FormVersionChange[]) {
    openSections = new Set(entries.map((c) => c.section));
  }

  function toggleSection(section: string) {
    const next = new Set(openSections);

    if (next.has(section)) next.delete(section);
    else next.add(section);

    openSections = next;
  }

  async function toggleVersion(version: FormVersion) {
    if (openVersion === version.versionNumber) {
      openVersion = null;
      return;
    }

    openVersion = version.versionNumber;

    // A version's changes are fetched once and kept, because they cannot change afterwards.
    if (changes[version.versionNumber]) {
      expandAllSections(changes[version.versionNumber]);
      return;
    }

    try {
      loadingDiff = version.versionNumber;
      const loaded = await formsApi.getVersionDiff(formId, version.versionNumber);
      changes[version.versionNumber] = loaded;

      // Opening a version to be met by collapsed headings would just be a second click, so the
      // sections start open and collapse is there for the large saves.
      expandAllSections(loaded);
    } catch (err) {
      error = err instanceof Error ? err.message : "Failed to compare versions";
      openVersion = null;
    } finally {
      loadingDiff = null;
    }
  }

  async function restore() {
    if (!pendingRestore) return;

    const target = pendingRestore;
    pendingRestore = null;

    try {
      restoring = true;
      await formsApi.restoreFormVersion(formId, target.versionNumber, userId);
      await loadVersions();
      onRestored?.();
    } catch (err) {
      error = err instanceof Error ? err.message : "Failed to restore this version";
    } finally {
      restoring = false;
    }
  }

  function kindColor(kind: FormVersionChange["kind"]): string {
    switch (kind) {
      case "Added":
        return "#10B981";
      case "Removed":
        return "#ef4444";
      default:
        return $colorStore.primary;
    }
  }

  function kindIcon(kind: FormVersionChange["kind"]): string {
    switch (kind) {
      case "Added":
        return "fa-plus";
      case "Removed":
        return "fa-minus";
      default:
        return "fa-pen";
    }
  }

  onMount(loadVersions);
</script>

<div class="space-y-4">
  <div>
    <div class="flex items-center gap-2">
      <i class="fa-solid fa-clock-rotate-left" style="color: {$colorStore.primary};"></i>
      <h3 class="text-lg font-bold" style="color: {$colorStore.text};">Version history</h3>
    </div>
    {#if versionsKept > 0}
      <p class="text-sm mt-1" style="color: {$colorStore.muted};">
        The last {versionsKept} saves are kept. Older ones are dropped.
      </p>
    {/if}
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
    <div class="p-6 text-center" style="color: {$colorStore.muted};">
      <i class="fa-solid fa-spinner fa-spin mr-2"></i>
      Loading history
    </div>
  {:else if versions.length === 0}
    <div
      class="p-6 rounded-xl text-center"
      style="background: {$colorStore.primary}05; border: 1px solid {$colorStore.primary}20; color: {$colorStore.muted};"
    >
      Nothing saved yet. A version is kept every time this form is saved.
    </div>
  {:else}
    <div class="space-y-2">
      {#each versions as version, index (version.id)}
        <div
          class="rounded-xl overflow-hidden"
          style="background: {$colorStore.primary}05; border: 1px solid {$colorStore.primary}25;"
        >
          <button
            type="button"
            onclick={() => toggleVersion(version)}
            class="w-full p-4 flex items-center justify-between gap-4 text-left transition-colors hover:opacity-90"
          >
            <div class="flex items-center gap-3 min-w-0">
              <span
                class="flex-shrink-0 px-2.5 py-1 rounded-lg text-sm font-bold"
                style="background: {$colorStore.primary}20; color: {$colorStore.primary};"
              >
                v{version.versionNumber}
              </span>
              <div class="min-w-0">
                <div class="font-medium truncate" style="color: {$colorStore.text};">
                  {new Date(version.createdAt).toLocaleString()}
                  {#if index === 0}
                    <span class="text-sm font-normal" style="color: {$colorStore.muted};">
                      (current)
                    </span>
                  {/if}
                </div>
                <div class="text-sm" style="color: {$colorStore.muted};">
                  {version.questionCount} question{version.questionCount === 1 ? "" : "s"}
                </div>
              </div>
            </div>

            <i
              class="fa-solid flex-shrink-0 {openVersion === version.versionNumber ? 'fa-chevron-up' : 'fa-chevron-down'}"
              style="color: {$colorStore.muted};"
            ></i>
          </button>

          {#if openVersion === version.versionNumber}
            <div class="px-4 pb-4" transition:slide={{ duration: 200 }}>
              {#if loadingDiff === version.versionNumber}
                <div class="py-4 text-center" style="color: {$colorStore.muted};">
                  <i class="fa-solid fa-spinner fa-spin mr-2"></i>
                  Comparing
                </div>
              {:else if groupedChanges.length === 0}
                <div class="py-4 text-sm" style="color: {$colorStore.muted};">
                  This save changed nothing.
                </div>
              {:else}
                <div class="space-y-4">
                  {#each groupedChanges as group (group.section)}
                    <div
                      class="rounded-lg"
                      style="background: {$colorStore.primary}05; border: 1px solid {$colorStore.primary}15;"
                    >
                      <!-- A save that touched everything reads as a handful of headings rather
                           than one very long list. -->
                      <button
                        type="button"
                        onclick={() => toggleSection(group.section)}
                        class="w-full flex items-center justify-between gap-3 px-3 py-2 text-left"
                      >
                        <span class="text-sm font-semibold break-words min-w-0" style="color: {$colorStore.text};">
                          {group.section}
                        </span>
                        <span class="flex items-center gap-2 flex-shrink-0">
                          <span
                            class="px-1.5 py-0.5 text-xs rounded-full"
                            style="background: {$colorStore.primary}15; color: {$colorStore.muted};"
                          >
                            {group.items.length}
                          </span>
                          <i
                            class="fa-solid text-xs {openSections.has(group.section) ? 'fa-chevron-up' : 'fa-chevron-down'}"
                            style="color: {$colorStore.muted};"
                          ></i>
                        </span>
                      </button>

                      <div class="space-y-2 px-3 pb-3" class:hidden={!openSections.has(group.section)}>
                        {#each group.items as change}
                          <div class="flex items-start gap-2 text-sm">
                            <i
                              class="fa-solid {kindIcon(change.kind)} mt-1 flex-shrink-0"
                              style="color: {kindColor(change.kind)}; font-size: 10px;"
                            ></i>

                            <div class="flex-1 min-w-0">
                              <div class="font-medium mb-1" style="color: {$colorStore.text};">
                                {change.label}
                              </div>

                              <!-- Stacked rather than side by side, so a long value is not wrapped
                                   into a mess by two narrow columns. -->
                              <div class="space-y-1 font-mono text-xs">
                                {#if change.before}
                                  <div
                                    class="flex items-start gap-2 px-2 py-1 rounded"
                                    style="background: #ef444415; color: #fca5a5;"
                                  >
                                    <span aria-hidden="true" class="flex-shrink-0 select-none">&minus;</span>
                                    <span class="break-all whitespace-pre-wrap">{change.before}</span>
                                  </div>
                                {/if}
                                {#if change.after}
                                  <div
                                    class="flex items-start gap-2 px-2 py-1 rounded"
                                    style="background: #10B98115; color: #86efac;"
                                  >
                                    <span aria-hidden="true" class="flex-shrink-0 select-none">+</span>
                                    <span class="break-all whitespace-pre-wrap">{change.after}</span>
                                  </div>
                                {/if}
                              </div>
                            </div>
                          </div>
                        {/each}
                      </div>
                    </div>
                  {/each}
                </div>
              {/if}

              {#if index !== 0}
                <button
                  type="button"
                  onclick={() => (pendingRestore = version)}
                  disabled={restoring}
                  class="mt-4 px-4 py-2 rounded-lg text-sm font-medium transition-all disabled:opacity-50"
                  style="background: {$colorStore.primary}15; color: {$colorStore.text}; border: 1px solid {$colorStore.primary}30;"
                >
                  <i class="fa-solid fa-rotate-left mr-2"></i>
                  Restore this version
                </button>
              {/if}
            </div>
          {/if}
        </div>
      {/each}
    </div>
  {/if}
</div>

<ConfirmationModal
  isOpen={pendingRestore !== null}
  title="Restore this version?"
  message={pendingRestore
    ? `This puts the form back to version ${pendingRestore.versionNumber}, replacing its current questions and settings. The current state is kept in the history, so this can be undone.`
    : ""}
  confirmText="Restore"
  variant="warning"
  onconfirm={restore}
  oncancel={() => (pendingRestore = null)}
/>
