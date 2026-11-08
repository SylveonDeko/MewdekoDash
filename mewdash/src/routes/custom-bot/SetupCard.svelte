<script lang="ts">
  import { m } from "$lib/i18n";
  import { customBotsApi } from "$lib/api/index.ts";
  import { colorStore } from "$lib/stores/colorStore";
  import { logger } from "$lib/logger";
  import { DISCORD_DEVELOPER_PORTAL_URL } from "$lib/config/customBot";

  interface Props {
    userId: string;
    slotId: number | string;
    freeSlots: number;
    onerror: (message: string) => void;
    oncreated: () => void;
  }

  let { userId, slotId, freeSlots, onerror, oncreated }: Props = $props();

  let token = $state("");
  let creating = $state(false);

  async function create(event: SubmitEvent) {
    event.preventDefault();
    if (!token.trim() || creating) return;
    creating = true;
    try {
      await customBotsApi.createBot(userId, token.trim(), slotId);
      token = "";
      oncreated();
    } catch (err) {
      logger.error("Failed to create custom bot:", err);
      onerror(err instanceof Error && err.message ? err.message : m.customBot.setupFailed());
    } finally {
      creating = false;
    }
  }

  const steps = $derived([
    { n: 1, text: m.customBot.setupStepPortal() },
    { n: 2, text: m.customBot.setupStepToken() },
    { n: 3, text: m.customBot.setupStepCreate() },
    { n: 4, text: m.customBot.setupStepInvite() }
  ]);
</script>

<section
  class="rounded-2xl border p-4 sm:p-6 space-y-5"
  style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}20;"
>
  <div class="flex flex-wrap items-center gap-x-3 gap-y-1">
    <h2 class="text-lg font-semibold grow" style="color: {$colorStore.text}">{m.customBot.setupTitle()}</h2>
    <span class="text-sm" style="color: {$colorStore.muted}">
      {freeSlots === 1 ? m.customBot.slotFreeOne() : m.customBot.slotFreeOther({ count: freeSlots })}
    </span>
  </div>

  <ol class="space-y-2">
    {#each steps as step (step.n)}
      <li class="flex items-start gap-3 text-sm" style="color: {$colorStore.text}">
        <span
          class="w-6 h-6 rounded-full shrink-0 flex items-center justify-center text-xs font-semibold"
          style="background: {$colorStore.primary}20; color: {$colorStore.text};"
        >{step.n}</span>
        <span class="min-w-0 pt-0.5">{step.text}</span>
      </li>
    {/each}
  </ol>

  <a
    href={DISCORD_DEVELOPER_PORTAL_URL}
    target="_blank"
    rel="noreferrer"
    class="inline-flex items-center justify-center gap-2 px-5 rounded-lg min-h-[50px] font-medium border w-full sm:w-auto"
    style="background: {$colorStore.primary}10; color: {$colorStore.text}; border-color: {$colorStore.primary}30;"
  >
    <i class="fa-solid fa-up-right-from-square" aria-hidden="true"></i>
    {m.customBot.setupStepPortalLink()}
  </a>

  <form class="space-y-3" onsubmit={create}>
    <div>
      <label for="cb-setup-token" class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">{m.customBot.setupTokenLabel()}</label>
      <input
        id="cb-setup-token"
        type="password"
        bind:value={token}
        autocomplete="new-password"
        spellcheck="false"
        class="w-full p-3 rounded-lg border min-h-[50px]"
        style="background: {$colorStore.primary}10; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
      >
    </div>
    <button
      type="submit"
      class="px-5 rounded-lg min-h-[50px] font-semibold w-full sm:w-auto disabled:opacity-50"
      style="background: {$colorStore.primary}; color: {$colorStore.onPrimary};"
      disabled={creating || !token.trim()}
    >
      {creating ? m.customBot.setupCreating() : m.customBot.setupCreate()}
    </button>
  </form>
</section>
