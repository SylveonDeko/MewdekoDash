<!-- routes/wiki/manage/settings/+page.svelte -->
<script lang="ts">
  import { untrack } from "svelte";
  import { m } from "$lib/i18n";
  import { invalidateAll } from "$app/navigation";
  import { colorStore } from "$lib/stores/colorStore";
  import { requestConfirmation } from "$lib/stores/confirmationStore";
  import { formatWhen, wikiCall, wikiErrorMessage } from "$lib/wiki/client";
  import { isUserId, wikiLimits } from "$lib/wiki/validation";
  import ToggleRow from "$lib/components/forms/ToggleRow.svelte";

  let { data } = $props();

  let suggestionsOpen = $state(untrack(() => data.settings.suggestionsOpen));
  let settingsError = $state<string | null>(null);

  let userId = $state("");
  let name = $state("");
  let busy = $state(false);
  let error = $state<string | null>(null);

  const field = $derived(
    `background: ${$colorStore.primary}10; border-color: ${$colorStore.primary}30; color: ${$colorStore.text};`
  );

  async function setSuggestionsOpen(value: boolean) {
    const previous = suggestionsOpen;
    suggestionsOpen = value;
    settingsError = null;
    const result = await wikiCall("PATCH", "/api/wiki/settings", { suggestionsOpen: value });
    if (!result.ok) {
      suggestionsOpen = previous;
      settingsError = wikiErrorMessage(result.error);
      return;
    }
    await invalidateAll();
  }

  async function block(event: SubmitEvent) {
    event.preventDefault();
    const id = userId.trim();
    if (!isUserId(id) || busy) return;
    busy = true;
    error = null;
    const result = await wikiCall("POST", "/api/wiki/blocks", { userId: id, name });
    busy = false;
    if (!result.ok) {
      error = wikiErrorMessage(result.error);
      return;
    }
    userId = "";
    name = "";
    await invalidateAll();
  }

  async function unblock(user: { userId: string; displayName: string }) {
    const ok = await requestConfirmation({
      title: m.wikiManage.blockRemoveTitle({ name: user.displayName }),
      message: m.wikiManage.blockRemoveMessage(),
      confirmText: m.common.unblock(),
      variant: "danger",
    });
    if (!ok) return;
    const result = await wikiCall("DELETE", `/api/wiki/blocks/${user.userId}`);
    if (!result.ok) {
      error = wikiErrorMessage(result.error);
      return;
    }
    await invalidateAll();
  }
</script>

<div class="space-y-6">
  <section class="rounded-2xl border p-4 sm:p-6 space-y-3" style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}20;">
    <ToggleRow checked={suggestionsOpen} title={m.wikiManage.settingsSuggestionsOpen()} colors={$colorStore} onchange={setSuggestionsOpen} />
    {#if settingsError}
      <p class="text-sm text-red-400" role="alert">{settingsError}</p>
    {/if}
  </section>

  <form class="rounded-2xl border p-4 sm:p-6 space-y-3" style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}20;" onsubmit={block}>
    <h2 class="text-base font-semibold" style="color: {$colorStore.text}">{m.wikiManage.blockAddTitle()}</h2>
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <div>
        <label for="wiki-block-id" class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">{m.common.userId()}</label>
        <input id="wiki-block-id" type="text" inputmode="numeric" bind:value={userId} autocomplete="off"
               class="w-full p-3 rounded-lg border min-h-[50px]" style={field}>
      </div>
      <div>
        <label for="wiki-block-name" class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">{m.common.displayName()}</label>
        <input id="wiki-block-name" type="text" bind:value={name} maxlength={wikiLimits.nameMax} autocomplete="off"
               class="w-full p-3 rounded-lg border min-h-[50px]" style={field}>
      </div>
    </div>
    {#if error}
      <p class="text-sm text-red-400" role="alert">{error}</p>
    {/if}
    <button type="submit" class="px-5 rounded-lg min-h-[50px] font-semibold w-full sm:w-auto disabled:opacity-50"
            style="background: {$colorStore.primary}; color: {$colorStore.onPrimary};"
            disabled={busy || !isUserId(userId.trim())}>{m.common.block()}</button>
  </form>

  <section class="rounded-2xl border p-4 sm:p-6 space-y-3" style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}20;">
    <h2 class="text-base font-semibold" style="color: {$colorStore.text}">{m.wikiManage.blockedHeading()}</h2>
    {#if data.blocked.length === 0}
      <p style="color: {$colorStore.muted}">{m.wikiManage.blockedEmpty()}</p>
    {:else}
      <ul class="space-y-2">
        {#each data.blocked as user (user.userId)}
          <li class="flex flex-wrap items-center gap-x-3 gap-y-2 py-2 border-t first:border-t-0" style="border-color: {$colorStore.primary}20;">
            <div class="min-w-0 grow">
              <div class="font-semibold break-words" style="color: {$colorStore.text}">{user.displayName}</div>
              <div class="text-xs break-all" style="color: {$colorStore.muted}">{m.common.idLabel({ id: user.userId })}</div>
              <div class="text-xs" style="color: {$colorStore.muted}">{formatWhen(user.addedAt)}</div>
            </div>
            <button type="button" class="w-11 h-11 rounded-lg" aria-label={m.wikiManage.unblockNamed({ name: user.displayName })}
                    style="background: {$colorStore.accent}20; color: {$colorStore.text};"
                    onclick={() => unblock(user)}>
              <i class="fa-solid fa-trash" aria-hidden="true"></i>
            </button>
          </li>
        {/each}
      </ul>
    {/if}
  </section>
</div>
