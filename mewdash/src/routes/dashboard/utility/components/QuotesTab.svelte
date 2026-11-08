<script lang="ts">
  import { onMount } from "svelte";
  import { m } from "$lib/i18n";
  import { utilityApi, type GuildQuote } from "$lib/api/index.ts";
  import { colorStore } from "$lib/stores/colorStore";
  import { logger } from "$lib/logger";
  import { userStore } from "$lib/stores/userStore";
  import { requestConfirmation } from "$lib/stores/confirmationStore";
  import PluginCard from "$lib/components/plugin/PluginCard.svelte";
  import QuoteSheet from "./QuoteSheet.svelte";
  import { errorText, type TabProps } from "./utilityModel";

  let { guildId, onerror }: TabProps = $props();

  const PAGE_SIZE = 25;

  let quotes: GuildQuote[] = $state([]);
  let total = $state(0);
  let pageNumber = $state(1);
  let search = $state("");
  let editing: GuildQuote | null = $state(null);
  let creating = $state(false);
  let busy = $state(false);

  const pages = $derived(Math.max(1, Math.ceil(total / PAGE_SIZE)));
  const inputStyle = $derived(
    `background: ${$colorStore.primary}10; border-color: ${$colorStore.primary}30; color: ${$colorStore.text};`
  );
  const iconButton = $derived(
    `background: ${$colorStore.primary}10; color: ${$colorStore.text}; border: 1px solid ${$colorStore.primary}20;`
  );

  async function load(next = 1) {
    try {
      const result = await utilityApi.getQuotes(guildId, search, next, PAGE_SIZE);
      quotes = result.quotes;
      total = result.total;
      pageNumber = result.page;
    } catch (err) {
      logger.error("Failed to load quotes:", err);
      onerror(errorText(err, m.utility.quotesLoadFailed()));
    }
  }

  async function save(keyword: string, text: string): Promise<boolean> {
    const author = $userStore?.id ? BigInt($userStore.id) : null;
    const target = editing;
    try {
      if (target) {
        await utilityApi.updateQuote(guildId, target.id, { keyword: keyword || null, text: text || null });
        await load(pageNumber);
      } else {
        if (!author) return false;
        await utilityApi.addQuote(guildId, keyword, text, author);
        await load(1);
      }
      return true;
    } catch (err) {
      logger.error("Failed to save quote:", err);
      onerror(errorText(err, target ? m.utility.quotesUpdateFailed() : m.utility.quotesAddFailed()));
      return false;
    }
  }

  async function remove(quote: GuildQuote) {
    const confirmed = await requestConfirmation({
      message: m.utility.quotesDeleteConfirm({ id: quote.id, keyword: quote.keyword }),
      confirmText: m.common.delete()
    });
    if (!confirmed) return;
    busy = true;
    try {
      await utilityApi.deleteQuote(guildId, quote.id);
      await load(pageNumber);
    } catch (err) {
      logger.error("Failed to delete quote:", err);
      onerror(errorText(err, m.utility.quotesDeleteFailed()));
    } finally {
      busy = false;
    }
  }

  onMount(() => load());
</script>

<PluginCard title={m.utility.quotesCardTitle({ count: total })} alwaysOpen>
  <form
    class="flex gap-3"
    onsubmit={(e) => {
      e.preventDefault();
      void load(1);
    }}
  >
    <input
      type="text"
      bind:value={search}
      placeholder={m.utility.quotesSearchPlaceholder()}
      aria-label={m.utility.quotesSearchAria()}
      class="grow min-w-0 p-3 rounded-lg border focus:ring-2 min-h-[50px]"
      style={inputStyle}
    >
    <button
      type="submit"
      class="px-5 rounded-xl min-h-[50px] shrink-0"
      style={iconButton}
      aria-label={m.common.search()}
    >
      <i class="fa-solid fa-magnifying-glass" aria-hidden="true"></i>
    </button>
  </form>

  <div class="space-y-2">
    {#each quotes as quote (quote.id)}
      <div
        class="flex items-start gap-2 rounded-xl border p-2 pl-3 min-w-0"
        style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}20;"
      >
        <div class="grow min-w-0 py-1">
          <code class="block text-sm font-semibold truncate" style="color: {$colorStore.text}">{quote.keyword}</code>
          <p class="text-sm break-words whitespace-pre-wrap" style="color: {$colorStore.text}">{quote.text}</p>
          <p class="text-xs" style="color: {$colorStore.muted}">
            {quote.useCount === 1
              ? m.utility.quotesMetaOne({ id: quote.id, author: quote.authorName, count: quote.useCount })
              : m.utility.quotesMetaOther({ id: quote.id, author: quote.authorName, count: quote.useCount })}
          </p>
        </div>
        <button
          type="button"
          class="rounded-lg min-h-[44px] min-w-[44px] shrink-0"
          style={iconButton}
          aria-label="{m.utility.quotesEditAria()}: {quote.keyword}"
          onclick={() => (editing = quote)}
        >
          <i class="fa-solid fa-pen" aria-hidden="true"></i>
        </button>
        <button
          type="button"
          class="rounded-lg min-h-[44px] min-w-[44px] shrink-0 disabled:opacity-50"
          style={iconButton}
          aria-label="{m.utility.quotesDeleteAria()}: {quote.keyword}"
          disabled={busy}
          onclick={() => remove(quote)}
        >
          <i class="fa-solid fa-trash" aria-hidden="true"></i>
        </button>
      </div>
    {:else}
      <p class="text-sm" style="color: {$colorStore.muted}">{search ? m.utility.quotesEmptySearch() : m.utility.quotesEmpty()}</p>
    {/each}
  </div>

  {#if total > PAGE_SIZE}
    <div class="flex items-center justify-between gap-3">
      <button
        type="button"
        class="px-5 rounded-xl min-h-[44px] disabled:opacity-40"
        style={iconButton}
        disabled={pageNumber <= 1}
        onclick={() => load(pageNumber - 1)}
      >
        {m.common.previous()}
      </button>
      <span class="text-sm text-center" style="color: {$colorStore.muted}">{m.common.pageOfTotal({ page: pageNumber, total: pages })}</span>
      <button
        type="button"
        class="px-5 rounded-xl min-h-[44px] disabled:opacity-40"
        style={iconButton}
        disabled={pageNumber >= pages}
        onclick={() => load(pageNumber + 1)}
      >
        {m.common.next()}
      </button>
    </div>
  {/if}

  <button
    type="button"
    class="w-full sm:w-auto px-5 rounded-xl min-h-[50px] font-medium"
    style="background: {$colorStore.primary}; color: {$colorStore.onPrimary};"
    onclick={() => (creating = true)}
  >
    <i class="fa-solid fa-plus mr-2" aria-hidden="true"></i>{m.utility.quotesAdd()}
  </button>
</PluginCard>

{#if creating || editing}
  <QuoteSheet
    quote={editing}
    onsave={save}
    onclose={() => {
      creating = false;
      editing = null;
    }}
  />
{/if}
