<script lang="ts">
  import { onMount } from "svelte";
  import { m } from "$lib/i18n";
  import { filterApi, type FilterSettings } from "$lib/api/index.ts";
  import { colorStore } from "$lib/stores/colorStore";
  import { logger } from "$lib/logger";
  import type { AutoSave } from "$lib/utils/autoSave.svelte";
  import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";
  import SettingField from "$lib/components/forms/SettingField.svelte";
  import ToggleRow from "$lib/components/forms/ToggleRow.svelte";
  import PluginCard from "$lib/components/plugin/PluginCard.svelte";
  import { diffIds, errorText, idString, type Named, type Notify } from "../automodModel";
  import FilterExtrasCards from "./FilterExtrasCards.svelte";
  import WordsCard from "./WordsCard.svelte";

  interface Props {
    guildId: bigint;
    channels: Named[];
    autoSave: AutoSave;
    notify: Notify;
  }

  type Kind = "word" | "invite" | "link";

  let { guildId, channels, autoSave, notify }: Props = $props();

  let settings: FilterSettings | null = $state(null);
  let loading = $state(true);

  const kinds = $derived<
    Array<{
      kind: Kind;
      title: string;
      hint: string;
      serverKey: "filterWords" | "filterInvites" | "filterLinks";
      listKey: "wordFilterChannels" | "inviteFilterChannels" | "linkFilterChannels";
    }>
  >([
    { kind: "word", title: m.common.wordFilter(), hint: m.filter.wordHint(), serverKey: "filterWords", listKey: "wordFilterChannels" },
    { kind: "invite", title: m.filter.inviteTitle(), hint: m.filter.inviteHint(), serverKey: "filterInvites", listKey: "inviteFilterChannels" },
    { kind: "link", title: m.filter.linkTitle(), hint: m.filter.linkHint(), serverKey: "filterLinks", listKey: "linkFilterChannels" }
  ]);

  async function load() {
    try {
      settings = await filterApi.getFilterSettings(guildId);
    } catch (err) {
      logger.error("Failed to load filter settings:", err);
      notify(errorText(err, m.filter.errorLoad()), "error");
    } finally {
      loading = false;
    }
  }

  function setServer(key: "filterWords" | "filterInvites" | "filterLinks", value: boolean) {
    if (!settings) return;
    settings.serverSettings = { ...settings.serverSettings, [key]: value };
    void autoSave.now("filters:server", async () => {
      const current = settings?.serverSettings;
      if (!current) return;
      try {
        await filterApi.updateServerFilterSettings(guildId, {
          filterWords: current.filterWords,
          filterInvites: current.filterInvites,
          filterLinks: current.filterLinks
        });
      } catch (err) {
        await load();
        throw err;
      }
    });
  }

  function setWarning(key: "warnOnFilteredWord" | "warnOnInvite", value: boolean) {
    if (!settings) return;
    settings.serverSettings = { ...settings.serverSettings, [key]: value };
    void autoSave.now(`filters:${key}`, async () => {
      try {
        await filterApi.updateFilterWarnings(guildId, { [key]: value });
      } catch (err) {
        await load();
        throw err;
      }
    });
  }

  async function toggleWord(word: string, autoBan: boolean) {
    if (!settings) return;
    try {
      const result = autoBan
        ? await filterApi.toggleAutoBanWord(guildId, word)
        : await filterApi.toggleFilteredWord(guildId, word);
      const key = autoBan ? "autoBanWords" : "filteredWords";
      const list = settings[key];
      settings[key] = result.added ? [...list, result.word] : list.filter((x) => x !== result.word);
    } catch (err) {
      logger.error("Failed to change word list:", err);
      notify(errorText(err, m.filter.errorUpdateWords()), "error");
    }
  }

  async function clearWords() {
    if (!settings) return;
    try {
      await filterApi.clearFilteredWords(guildId);
      settings.filteredWords = [];
    } catch (err) {
      logger.error("Failed to clear words:", err);
      notify(errorText(err, m.filter.errorClearWords()), "error");
    }
  }

  function setChannels(kind: Kind, listKey: (typeof kinds)[number]["listKey"], ids: string[]) {
    if (!settings) return;
    const before = settings.channelSettings[listKey].map(idString);
    settings.channelSettings = { ...settings.channelSettings, [listKey]: ids.map((id) => BigInt(id)) };
    void autoSave.now(`filters:channels:${kind}`, async () => {
      try {
        for (const id of diffIds(before, ids)) await filterApi.toggleChannelFilter(guildId, BigInt(id), kind);
      } catch (err) {
        await load();
        throw err;
      }
    });
  }

  onMount(() => {
    void load();
  });
</script>

{#if loading}
  <div class="flex justify-center py-8">
    <div class="w-10 h-10 border-4 rounded-full animate-spin" style="border-color: {$colorStore.primary}20; border-top-color: {$colorStore.primary}"></div>
  </div>
{:else if settings}
  <PluginCard title={m.common.filters()} alwaysOpen>
    <div class="space-y-2">
      {#each kinds as item (item.kind)}
        <ToggleRow
          checked={settings.serverSettings[item.serverKey]}
          title={item.title}
          subtitle={item.hint}
          colors={$colorStore}
          onchange={(value) => setServer(item.serverKey, value)}
        />
      {/each}
    </div>
  </PluginCard>

  <PluginCard title={m.common.warnings()} alwaysOpen>
    <div class="space-y-2">
      <ToggleRow
        checked={settings.serverSettings.warnOnFilteredWord}
        title={m.filter.warnFilteredWord()}
        colors={$colorStore}
        onchange={(value) => setWarning("warnOnFilteredWord", value)}
      />
      <ToggleRow
        checked={settings.serverSettings.warnOnInvite}
        title={m.filter.warnInvite()}
        colors={$colorStore}
        onchange={(value) => setWarning("warnOnInvite", value)}
      />
    </div>
  </PluginCard>

  <WordsCard
    title={m.filter.tabWords()}
    words={settings.filteredWords}
    ontoggle={(word) => toggleWord(word, false)}
    onclear={clearWords}
  />

  <WordsCard title={m.filter.tabAutoban()} words={settings.autoBanWords} ontoggle={(word) => toggleWord(word, true)} />

  <PluginCard title={m.common.channelOverrides()} alwaysOpen>
    {#each kinds as item (item.kind)}
      <SettingField label={item.title} id="filter-channels-{item.kind}">
        <DiscordSelector
          id="filter-channels-{item.kind}"
          type="channel"
          options={channels}
          selected={settings.channelSettings[item.listKey].map(idString)}
          multiple
          placeholder={m.common.addAChannel()}
          onchange={({ selected }) => setChannels(item.kind, item.listKey, Array.isArray(selected) ? selected : [])}
        />
      </SettingField>
    {/each}
  </PluginCard>

  <FilterExtrasCards {guildId} {channels} {autoSave} {notify} />
{/if}
