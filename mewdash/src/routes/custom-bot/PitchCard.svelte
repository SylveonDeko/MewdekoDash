<script lang="ts">
  import { m } from "$lib/i18n";
  import { customBotsApi } from "$lib/api/index.ts";
  import { colorStore } from "$lib/stores/colorStore";
  import { logger } from "$lib/logger";
  import { CUSTOM_BOT_SHOP_URL } from "$lib/config/customBot";

  interface Props {
    userId: string;
    hasBots: boolean;
    onclaimed: () => void;
    onerror: (message: string) => void;
  }

  let { userId, hasBots, onclaimed, onerror }: Props = $props();

  let email = $state("");
  let transactionId = $state("");
  let linking = $state(false);

  async function claim(event: SubmitEvent) {
    event.preventDefault();
    if (!email.trim() || !transactionId.trim() || linking) return;
    linking = true;
    try {
      await customBotsApi.claim(userId, email.trim(), transactionId.trim());
      email = "";
      transactionId = "";
      onclaimed();
    } catch (err) {
      logger.error("Failed to link Ko-fi purchase:", err);
      onerror(err instanceof Error && err.message ? err.message : m.customBot.claimFailed());
    } finally {
      linking = false;
    }
  }

  const field = $derived(
    `background: ${$colorStore.primary}10; border-color: ${$colorStore.primary}30; color: ${$colorStore.text};`
  );
</script>

<section
  class="rounded-2xl border p-4 sm:p-6 space-y-5"
  style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}20;"
>
  <div class="space-y-2">
    <h2 class="text-lg font-semibold" style="color: {$colorStore.text}">
      {hasBots ? m.customBot.pitchAnother() : m.customBot.pitchTitle()}
    </h2>
    <p class="text-sm" style="color: {$colorStore.text}">{m.customBot.pitchBody()}</p>
    <p class="text-sm" style="color: {$colorStore.muted}">{m.customBot.pitchFree()}</p>
  </div>

  <a
    href={CUSTOM_BOT_SHOP_URL}
    target="_blank"
    rel="noreferrer"
    class="inline-flex items-center justify-center gap-2 px-5 rounded-lg min-h-[50px] font-semibold w-full sm:w-auto"
    style="background: {$colorStore.primary}; color: {$colorStore.onPrimary};"
  >
    <i class="fa-solid fa-up-right-from-square" aria-hidden="true"></i>
    {m.customBot.pitchBuy()}
  </a>

  <form class="space-y-3 pt-4 border-t" style="border-color: {$colorStore.primary}20;" onsubmit={claim}>
    <h3 class="text-base font-semibold" style="color: {$colorStore.text}">{m.customBot.claimTitle()}</h3>
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <div>
        <label for="cb-claim-email" class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">{m.customBot.claimEmail()}</label>
        <input id="cb-claim-email" type="email" bind:value={email} autocomplete="email"
               class="w-full p-3 rounded-lg border min-h-[50px]" style={field}>
      </div>
      <div>
        <label for="cb-claim-tx" class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">{m.customBot.claimTransaction()}</label>
        <input id="cb-claim-tx" type="text" bind:value={transactionId} autocomplete="off" spellcheck="false"
               class="w-full p-3 rounded-lg border min-h-[50px]" style={field}>
      </div>
    </div>
    <button
      type="submit"
      class="px-5 rounded-lg min-h-[50px] font-semibold w-full sm:w-auto border disabled:opacity-50"
      style="background: {$colorStore.primary}10; color: {$colorStore.text}; border-color: {$colorStore.primary}30;"
      disabled={linking || !email.trim() || !transactionId.trim()}
    >
      {m.customBot.claimSubmit()}
    </button>
  </form>
</section>
