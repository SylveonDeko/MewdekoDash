<script lang="ts">
  import { m } from "$lib/i18n";
  import { twitchApi, type TwitchQuoteResponse } from "$lib/api/index.ts";
  import { colorStore } from "$lib/stores/colorStore";
  import { logger } from "$lib/logger";
  import { requestConfirmation } from "$lib/stores/confirmationStore";
  import SettingField from "$lib/components/forms/SettingField.svelte";
  import PluginCard from "$lib/components/plugin/PluginCard.svelte";
  import type { DiscordUser } from "$lib/types/discord";
  import AlertRow from "../AlertRow.svelte";
  import Button from "./Button.svelte";
  import Input from "./Input.svelte";
  import { formatDate, type Notify } from "./twitchModel";

  interface Props {
    guildId: bigint;
    user?: DiscordUser | null;
    notify: Notify;
    onhealth: () => void;
  }

  let { guildId, user = null, notify, onhealth }: Props = $props();

  let quotes: TwitchQuoteResponse[] = $state([]);
  let loading = $state(true);
  let busy = $state(false);
  let text = $state("");
  let author = $state("");
  let search = $state("");

  async function load() {
    try {
      quotes = await twitchApi.getQuotes(guildId, search);
    } catch (err) {
      logger.error("Failed to load Twitch quotes:", err);
    } finally {
      loading = false;
    }
  }

  async function add() {
    if (!text.trim()) return;
    busy = true;
    try {
      await twitchApi.addQuote(guildId, {
        text: text.trim(),
        author: author.trim() || null,
        addedBy: user?.username || null
      });
      text = "";
      author = "";
      notify(m.twitch.notifyQuoteSaved());
      await load();
      onhealth();
    } catch (err) {
      logger.error("Failed to save Twitch quote:", err);
      notify(m.twitch.notifyQuoteSaveFailed(), "error");
    } finally {
      busy = false;
    }
  }

  async function remove(quote: TwitchQuoteResponse) {
    const confirmed = await requestConfirmation({ message: m.twitch.confirmRemoveQuote({ id: quote.id }), confirmText: m.common.remove() });
    if (!confirmed) return;
    try {
      await twitchApi.removeQuote(guildId, quote.id);
      notify(m.twitch.notifyQuoteRemoved());
      await load();
      onhealth();
    } catch (err) {
      logger.error("Failed to remove Twitch quote:", err);
      notify(m.twitch.notifyQuoteRemoveFailed(), "error");
    }
  }

  function subtitle(quote: TwitchQuoteResponse): string {
    return quote.addedBy
      ? m.twitch.quoteAddedBy({ date: formatDate(quote.dateAdded), user: quote.addedBy })
      : m.twitch.quoteAdded({ date: formatDate(quote.dateAdded) });
  }

  void load();
</script>

<PluginCard title={m.twitch.quoteAdd()} alwaysOpen>
  <SettingField label={m.common.quoteText()} id="tw-quote-text">
    <Input id="tw-quote-text" rows={3} bind:value={text} placeholder={m.twitch.quoteTextPlaceholder()} />
  </SettingField>
  <div class="flex flex-col sm:flex-row gap-3">
    <div class="grow min-w-0">
      <Input bind:value={author} label={m.common.author()} placeholder={m.twitch.quoteAuthorPlaceholder()} />
    </div>
    <Button variant="primary" disabled={busy || !text.trim()} onclick={add}>
      <i class="fa-solid fa-plus" aria-hidden="true"></i>
      {busy ? m.common.saving() : m.twitch.quoteAdd()}
    </Button>
  </div>
</PluginCard>

<PluginCard title={m.common.quotes()} alwaysOpen>
  <div class="flex flex-col sm:flex-row gap-3">
    <div class="grow min-w-0">
      <Input bind:value={search} label={m.common.search()} placeholder={m.twitch.quoteSearchPlaceholder()} />
    </div>
    <Button onclick={load}>{m.common.search()}</Button>
  </div>
  {#if loading}
    <div class="flex justify-center py-6">
      <div class="w-10 h-10 border-4 rounded-full animate-spin" style="border-color: {$colorStore.primary}20; border-top-color: {$colorStore.primary}"></div>
    </div>
  {:else if quotes.length === 0}
    <p class="py-4 text-center" style="color: {$colorStore.muted}">{m.twitch.quoteEmpty()}</p>
  {:else}
    <div class="space-y-2">
      {#each quotes as quote (quote.id)}
        <AlertRow
          title={quote.author ? m.twitch.quoteBodyAuthor({ text: quote.text, author: quote.author }) : m.twitch.quoteBody({ text: quote.text })}
          subtitle={`#${quote.id} · ${subtitle(quote)}`}
          removeLabel={m.common.remove()}
          onremove={() => remove(quote)}
        />
      {/each}
    </div>
  {/if}
</PluginCard>
