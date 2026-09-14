<!-- routes/dashboard/filter/+page.svelte -->
<script lang="ts">
  import { onMount } from "svelte";
  import { fade, fly, slide } from "svelte/transition";
  import { colorStore } from "$lib/stores/colorStore";
  import { currentGuild } from "$lib/stores/currentGuild";
  import { clientApi, filterApi, type FilterSettings } from "$lib/api/index.ts";
  import { logger } from "$lib/logger";
  import DashboardPageLayout from "$lib/components/layout/DashboardPageLayout.svelte";
  import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";
  import StatCard from "$lib/components/monitoring/StatCard.svelte";
  import { requestConfirmation } from "$lib/stores/confirmationStore";

  type FilterKind = "word" | "invite" | "link";

  let loading = $state(true);
  let saving = $state(false);
  let message = $state("");
  let messageType: "success" | "error" | "info" = $state("info");

  let settings: FilterSettings | null = $state(null);
  let textChannels: Array<{ id: string; name: string }> = $state([]);
  let activeTab = $state("filters");

  let newWord = $state("");
  let newAutoBanWord = $state("");
  let wordSearch = $state("");
  let channelPick = $state<Record<FilterKind, string | null>>({ word: null, invite: null, link: null });

  const tabs = [
    { id: "filters", label: "Filters", icon: "fa-filter" },
    { id: "words", label: "Filtered Words", icon: "fa-comment-slash" },
    { id: "autoban", label: "Auto-ban Words", icon: "fa-ban" },
    { id: "channels", label: "Channel Overrides", icon: "fa-hashtag" }
  ];

  const filterMeta: Record<FilterKind, { title: string; hint: string; icon: string; serverKey: "filterWords" | "filterInvites" | "filterLinks"; listKey: "wordFilterChannels" | "inviteFilterChannels" | "linkFilterChannels" }> = {
    word: { title: "Word filter", hint: "Delete messages containing any filtered word", icon: "fa-comment-slash", serverKey: "filterWords", listKey: "wordFilterChannels" },
    invite: { title: "Invite filter", hint: "Delete Discord invite links posted by members", icon: "fa-paper-plane", serverKey: "filterInvites", listKey: "inviteFilterChannels" },
    link: { title: "Link filter", hint: "Delete any message containing a URL", icon: "fa-globe", serverKey: "filterLinks", listKey: "linkFilterChannels" }
  };

  let filteredWordList = $derived.by(() => {
    const term = wordSearch.trim().toLowerCase();
    const words = settings?.filteredWords ?? [];
    return term ? words.filter(w => w.toLowerCase().includes(term)) : words;
  });

  function showMessage(text: string, type: "success" | "error" | "info") {
    message = text;
    messageType = type;
    setTimeout(() => { message = ""; }, 5000);
  }

  async function loadAll() {
    if (!$currentGuild?.id) return;
    loading = true;
    try {
      const [data, channels] = await Promise.all([
        filterApi.getFilterSettings($currentGuild.id),
        clientApi.getTextChannels($currentGuild.id).catch(() => [])
      ]);
      settings = data;
      textChannels = (channels as any[]).map(c => ({ id: c.id.toString(), name: c.name }));
    } catch (err) {
      logger.error("Failed to load filter settings:", err);
      showMessage("Failed to load filter settings", "error");
    } finally {
      loading = false;
    }
  }

  async function toggleServerFilter(kind: FilterKind) {
    if (!$currentGuild?.id || !settings) return;
    const key = filterMeta[kind].serverKey;
    const next = {
      filterWords: settings.serverSettings.filterWords,
      filterInvites: settings.serverSettings.filterInvites,
      filterLinks: settings.serverSettings.filterLinks,
      [key]: !settings.serverSettings[key]
    };
    saving = true;
    try {
      await filterApi.updateServerFilterSettings($currentGuild.id, next);
      settings.serverSettings = { ...settings.serverSettings, ...next };
    } catch (err) {
      logger.error("Failed to update filter:", err);
      showMessage("Failed to update filter", "error");
    } finally {
      saving = false;
    }
  }

  async function toggleWarning(kind: "warnOnFilteredWord" | "warnOnInvite") {
    if (!$currentGuild?.id || !settings) return;
    saving = true;
    try {
      const value = !settings.serverSettings[kind];
      await filterApi.updateFilterWarnings($currentGuild.id, { [kind]: value });
      settings.serverSettings = { ...settings.serverSettings, [kind]: value };
    } catch (err) {
      logger.error("Failed to update warning setting:", err);
      showMessage("Failed to update warning setting", "error");
    } finally {
      saving = false;
    }
  }

  async function toggleWord(word: string, autoBan = false) {
    if (!$currentGuild?.id || !settings) return;
    const clean = word.trim().toLowerCase();
    if (!clean) return;
    saving = true;
    try {
      const result = autoBan
        ? await filterApi.toggleAutoBanWord($currentGuild.id, clean)
        : await filterApi.toggleFilteredWord($currentGuild.id, clean);
      const listKey = autoBan ? "autoBanWords" : "filteredWords";
      const list = settings[listKey];
      settings[listKey] = result.added ? [...list, result.word] : list.filter(w => w !== result.word);
      if (autoBan) newAutoBanWord = ""; else newWord = "";
    } catch (err) {
      logger.error("Failed to toggle word:", err);
      showMessage("Failed to update word list", "error");
    } finally {
      saving = false;
    }
  }

  async function clearWords() {
    if (!$currentGuild?.id || !settings) return;
    if (!(await requestConfirmation({
      title: "Clear filtered words?",
      message: `All ${settings.filteredWords.length} filtered words are removed.`,
      confirmText: "Clear all"
    }))) return;
    saving = true;
    try {
      await filterApi.clearFilteredWords($currentGuild.id);
      settings.filteredWords = [];
    } catch (err) {
      logger.error("Failed to clear words:", err);
      showMessage("Failed to clear words", "error");
    } finally {
      saving = false;
    }
  }

  async function toggleChannel(kind: FilterKind, channelId: string | null) {
    if (!$currentGuild?.id || !settings || !channelId) return;
    saving = true;
    try {
      const result = await filterApi.toggleChannelFilter($currentGuild.id, BigInt(channelId), kind);
      const listKey = filterMeta[kind].listKey;
      const current = settings.channelSettings[listKey].map(id => id.toString());
      settings.channelSettings[listKey] = (result.enabled
        ? [...current, channelId]
        : current.filter(id => id !== channelId)).map(id => BigInt(id));
      channelPick[kind] = null;
    } catch (err) {
      logger.error("Failed to toggle channel filter:", err);
      showMessage("Failed to update channel filter", "error");
    } finally {
      saving = false;
    }
  }

  function channelName(id: bigint | string): string {
    return textChannels.find(c => c.id === id.toString())?.name ?? id.toString();
  }

  onMount(loadAll);

  $effect(() => {
    if ($currentGuild?.id) loadAll();
  });

  let actionButtons = $derived([
    { label: "Refresh", icon: "fa-arrows-rotate", action: () => loadAll(), loading }
  ]);
</script>

{#snippet statusMessageContent()}
  {#if message}
    <div class="mb-6 p-4 rounded-xl flex items-center gap-3 transition-all"
         style="background: {messageType === 'success' ? '#10b98120' : messageType === 'error' ? '#ef444420' : $colorStore.primary + '20'};
                border: 1px solid {messageType === 'success' ? '#10b981' : messageType === 'error' ? '#ef4444' : $colorStore.primary}30;"
         in:fly={{ x: 20, duration: 300 }}>
      <i class="fa-utility-duo fa-regular {messageType === 'success' ? 'fa-circle-check' : 'fa-circle-exclamation'}"
         style="--fa-primary-color: {messageType === 'success' ? '#10b981' : messageType === 'error' ? '#ef4444' : $colorStore.primary}; --fa-secondary-color: {$colorStore.secondary}; font-size: 20px;"></i>
      <span style="color: {messageType === 'success' ? '#10b981' : messageType === 'error' ? '#ef4444' : $colorStore.primary}">{message}</span>
    </div>
  {/if}
{/snippet}

<DashboardPageLayout
  {actionButtons}
  bind:activeTab
  guildName={$currentGuild?.name || "Dashboard"}
  icon="fa-filter"
  statusMessages={statusMessageContent}
  subtitle="Block words, invites, and links before they reach your members"
  {tabs}
  title="Message Filters"
>
  {#if loading && !settings}
    <div class="flex justify-center items-center min-h-[200px]">
      <div class="w-12 h-12 border-4 rounded-full animate-spin"
           style="border-color: {$colorStore.primary}20; border-top-color: {$colorStore.primary};"
           aria-label="Loading"></div>
    </div>
  {:else if settings}
    {#if activeTab === 'filters'}
      <div class="space-y-6" in:fade={{ duration: 200 }}>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard icon="fa-comment-slash" label="Filtered words" value={settings.filteredWords.length} subtitle="deleted on sight" iconColor="primary" animationDelay={0} />
          <StatCard icon="fa-xmark" label="Auto-ban words" value={settings.autoBanWords.length} subtitle="ban immediately" iconColor="accent" animationDelay={100} />
          <StatCard icon="fa-list-ul" label="Channel overrides" value={settings.channelSettings.wordFilterChannels.length + settings.channelSettings.inviteFilterChannels.length + settings.channelSettings.linkFilterChannels.length} subtitle="per-channel filters" iconColor="secondary" animationDelay={200} />
        </div>

        <div class=" rounded-2xl border p-6 md:p-8 shadow-2xl transition-all"
             style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15, {$colorStore.gradientEnd}10); border-color: {$colorStore.primary}30;">
          <div class="flex items-center gap-3 mb-2">
            <i class="fa-utility-duo fa-regular fa-filter" style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary}; font-size: 20px;"></i>
            <h2 class="text-xl font-bold" style="color: {$colorStore.text}">Server-wide filters</h2>
          </div>
          <p class="text-sm mb-6" style="color: {$colorStore.muted}">These apply in every channel. Use channel overrides to enable a filter only in specific places.</p>

          <div class="space-y-3">
            {#each (["word", "invite", "link"] as FilterKind[]) as kind}
              {@const meta = filterMeta[kind]}
              {@const enabled = settings.serverSettings[meta.serverKey]}
              <div class="flex items-center justify-between gap-4 p-4 rounded-xl border transition-all"
                   style="background: {$colorStore.primary}05; border-color: {enabled ? $colorStore.primary + '40' : $colorStore.primary + '20'};">
                <div class="flex items-center gap-3 min-w-0">
                  <div class="p-2 rounded-lg shrink-0" style="background: {$colorStore.primary}15;">
                    <i class="fa-solid {meta.icon}" style="color: {$colorStore.primary}; font-size: 16px;"></i>
                  </div>
                  <div class="min-w-0">
                    <div class="font-medium" style="color: {$colorStore.text}">{meta.title}</div>
                    <div class="text-sm" style="color: {$colorStore.muted}">{meta.hint}</div>
                  </div>
                </div>
                <button class="p-2 rounded-lg transition-all hover:scale-[1.02] min-h-[44px] min-w-[44px] disabled:opacity-50"
                        role="switch" aria-checked={enabled} aria-label={meta.title}
                        disabled={saving}
                        style="color: {enabled ? $colorStore.secondary : $colorStore.muted}"
                        onclick={() => toggleServerFilter(kind)}>
                  <i class="fa-solid {enabled ? 'fa-toggle-on' : 'fa-toggle-off'}" style="font-size: 26px;"></i>
                </button>
              </div>
            {/each}
          </div>
        </div>

        <div class=" rounded-2xl border p-6 md:p-8 shadow-2xl transition-all"
             style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15, {$colorStore.gradientEnd}10); border-color: {$colorStore.primary}30;">
          <div class="flex items-center gap-3 mb-2">
            <i class="fa-utility-duo fa-regular fa-circle-exclamation" style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary}; font-size: 20px;"></i>
            <h2 class="text-xl font-bold" style="color: {$colorStore.text}">Warnings</h2>
          </div>
          <p class="text-sm mb-6" style="color: {$colorStore.muted}">Give the member a warning in addition to deleting the message. Warning punishments on the Moderation page still apply.</p>
          <div class="space-y-3">
            {#each [{ key: "warnOnFilteredWord", title: "Warn on filtered word" }, { key: "warnOnInvite", title: "Warn on invite link" }] as item}
              {@const enabled = settings.serverSettings[item.key as "warnOnFilteredWord" | "warnOnInvite"]}
              <div class="flex items-center justify-between gap-4 p-4 rounded-xl border"
                   style="background: {$colorStore.primary}05; border-color: {$colorStore.primary}20;">
                <div class="font-medium" style="color: {$colorStore.text}">{item.title}</div>
                <button class="p-2 rounded-lg transition-all hover:scale-[1.02] min-h-[44px] min-w-[44px] disabled:opacity-50"
                        role="switch" aria-checked={enabled} aria-label={item.title}
                        disabled={saving}
                        style="color: {enabled ? $colorStore.secondary : $colorStore.muted}"
                        onclick={() => toggleWarning(item.key as "warnOnFilteredWord" | "warnOnInvite")}>
                  <i class="fa-solid {enabled ? 'fa-toggle-on' : 'fa-toggle-off'}" style="font-size: 26px;"></i>
                </button>
              </div>
            {/each}
          </div>
        </div>
      </div>

    {:else if activeTab === 'words' || activeTab === 'autoban'}
      {@const autoBan = activeTab === 'autoban'}
      {@const list = autoBan ? settings.autoBanWords : filteredWordList}
      <div class="w-full" in:fade={{ duration: 200 }}>
        <div class=" rounded-2xl border p-6 md:p-8 shadow-2xl transition-all"
             style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15, {$colorStore.gradientEnd}10); border-color: {$colorStore.primary}30;">
          <div class="flex flex-wrap items-center justify-between gap-3 mb-2">
            <div class="flex items-center gap-3">
              <i class="fa-utility-duo fa-regular {autoBan ? 'fa-xmark' : 'fa-comment-slash'}" style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary}; font-size: 20px;"></i>
              <h2 class="text-xl font-bold" style="color: {$colorStore.text}">{autoBan ? "Auto-ban words" : "Filtered words"} ({list.length})</h2>
            </div>
            {#if !autoBan && settings.filteredWords.length > 0}
              <button class="px-4 py-2 rounded-xl text-sm font-medium transition-all hover:scale-[1.02] min-h-[44px] disabled:opacity-50"
                      style="background: #ef444415; color: #ef4444; border: 1px solid #ef444430;"
                      disabled={saving} onclick={clearWords}>
                <i class="fa-solid fa-trash mr-1"></i>Clear all
              </button>
            {/if}
          </div>
          <p class="text-sm mb-6" style="color: {$colorStore.muted}">
            {#if autoBan}
              Members who post any of these words are banned immediately. Use with care.
            {:else}
              Messages containing these words are deleted when the word filter is enabled server-wide or in a channel.
            {/if}
          </p>

          <form class="flex flex-col sm:flex-row gap-3 mb-6"
                onsubmit={(e) => { e.preventDefault(); toggleWord(autoBan ? newAutoBanWord : newWord, autoBan); }}>
            {#if autoBan}
              <input type="text" bind:value={newAutoBanWord} placeholder="Add a word or phrase" aria-label="New auto-ban word"
                     class="flex-1 p-3 rounded-xl border min-h-[44px]"
                     style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};">
            {:else}
              <input type="text" bind:value={newWord} placeholder="Add a word or phrase" aria-label="New filtered word"
                     class="flex-1 p-3 rounded-xl border min-h-[44px]"
                     style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};">
            {/if}
            <button type="submit" disabled={saving || !(autoBan ? newAutoBanWord : newWord).trim()}
                    class="px-6 py-3 rounded-xl font-medium transition-all hover:scale-[1.02] flex items-center justify-center gap-2 min-h-[44px] disabled:opacity-50"
                    style="background: {$colorStore.primary}20; color: {$colorStore.primary}; border: 1px solid {$colorStore.primary}30;">
              <i class="fa-solid fa-plus"></i>
              Add
            </button>
          </form>

          {#if !autoBan && settings.filteredWords.length > 10}
            <input type="text" bind:value={wordSearch} placeholder="Search words" aria-label="Search filtered words"
                   class="w-full p-3 rounded-xl border min-h-[44px] mb-4"
                   style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};">
          {/if}

          {#if list.length === 0}
            <div class="text-center py-8">
              <i class="fa-utility-duo fa-regular {autoBan ? 'fa-xmark' : 'fa-comment-slash'}" style="--fa-primary-color: {$colorStore.muted}; --fa-secondary-color: {$colorStore.muted}; font-size: 40px; opacity: 0.5; display: block; margin: 0 auto 12px;"></i>
              <p style="color: {$colorStore.muted}">{wordSearch ? "No words match your search." : "No words added yet."}</p>
            </div>
          {:else}
            <div class="flex flex-wrap gap-2">
              {#each list as word (word)}
                <span class="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium"
                      style="background: {autoBan ? '#ef444415' : $colorStore.primary + '15'}; color: {$colorStore.text};" transition:fade>
                  {word}
                  <button class="rounded-sm hover:opacity-80 min-h-[24px] min-w-[24px] disabled:opacity-30" aria-label={`Remove ${word}`}
                          disabled={saving} onclick={() => toggleWord(word, autoBan)}>
                    <i class="fa-solid fa-xmark" style="color: {$colorStore.muted}; font-size: 12px;"></i>
                  </button>
                </span>
              {/each}
            </div>
          {/if}
        </div>
      </div>

    {:else if activeTab === 'channels'}
      <div class="space-y-6" in:fade={{ duration: 200 }}>
        {#each (["word", "invite", "link"] as FilterKind[]) as kind}
          {@const meta = filterMeta[kind]}
          {@const channels = settings.channelSettings[meta.listKey]}
          <div class=" rounded-2xl border p-6 md:p-8 shadow-2xl transition-all"
               style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15, {$colorStore.gradientEnd}10); border-color: {$colorStore.primary}30;">
            <div class="flex items-center gap-3 mb-2">
              <i class="fa-utility-duo fa-regular {meta.icon}" style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary}; font-size: 20px;"></i>
              <h2 id="channel-filter-{kind}" class="text-xl font-bold" style="color: {$colorStore.text}">{meta.title} channels</h2>
            </div>
            <p class="text-sm mb-4" style="color: {$colorStore.muted}">
              {#if settings.serverSettings[meta.serverKey]}
                The {meta.title.toLowerCase()} is on server-wide, so these channel entries have no extra effect.
              {:else}
                Enable the {meta.title.toLowerCase()} only in these channels.
              {/if}
            </p>
            <div class="flex flex-col sm:flex-row gap-3 mb-4">
              <div class="flex-1">
                <DiscordSelector type="channel" options={textChannels.filter(c => !channels.some(id => id.toString() === c.id))}
                                 selected={channelPick[kind]} placeholder="Add a channel"
                                 ariaLabelledby="channel-filter-{kind}" disabled={saving}
                                 onchange={(e) => toggleChannel(kind, typeof e.selected === "string" ? e.selected : null)} />
              </div>
            </div>
            {#if channels.length === 0}
              <p class="text-sm" style="color: {$colorStore.muted}">No channel overrides.</p>
            {:else}
              <div class="flex flex-wrap gap-2">
                {#each channels as id (id.toString())}
                  <span class="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium"
                        style="background: {$colorStore.primary}15; color: {$colorStore.text};" transition:slide>
                    #{channelName(id)}
                    <button class="rounded-sm hover:opacity-80 min-h-[24px] min-w-[24px] disabled:opacity-30" aria-label={`Remove #${channelName(id)}`}
                            disabled={saving} onclick={() => toggleChannel(kind, id.toString())}>
                      <i class="fa-solid fa-xmark" style="color: {$colorStore.muted}; font-size: 12px;"></i>
                    </button>
                  </span>
                {/each}
              </div>
            {/if}
          </div>
        {/each}
      </div>
    {/if}
  {/if}
</DashboardPageLayout>
