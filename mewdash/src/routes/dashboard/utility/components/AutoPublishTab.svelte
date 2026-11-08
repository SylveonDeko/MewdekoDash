<script lang="ts">
  import { onMount } from "svelte";
  import { m } from "$lib/i18n";
  import { utilityApi, type AutoPublishChannel } from "$lib/api/index.ts";
  import { colorStore } from "$lib/stores/colorStore";
  import { logger } from "$lib/logger";
  import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";
  import PluginCard from "$lib/components/plugin/PluginCard.svelte";
  import ChipList from "./ChipList.svelte";
  import { errorText, nameOf, type Named, type TabProps } from "./utilityModel";

  interface Props extends TabProps {
    newsChannels: Named[];
    members: Named[];
  }

  let { guildId, newsChannels, members, onerror }: Props = $props();

  let entries: AutoPublishChannel[] = $state([]);
  let channelPick: string | null = $state(null);
  let userPick: Record<string, string | null> = $state({});
  let wordDraft: Record<string, string> = $state({});
  let busy = $state(false);

  const inputStyle = $derived(
    `background: ${$colorStore.primary}10; border-color: ${$colorStore.primary}30; color: ${$colorStore.text};`
  );
  const primaryButton = $derived(`background: ${$colorStore.primary}; color: ${$colorStore.onPrimary};`);

  async function load() {
    try {
      entries = await utilityApi.getAutoPublish(guildId);
    } catch (err) {
      logger.error("Failed to load auto publish:", err);
      onerror(errorText(err, m.utility.autopublishLoadFailed()));
    }
  }

  async function run(action: () => Promise<unknown>, failure: string): Promise<boolean> {
    busy = true;
    try {
      await action();
      await load();
      return true;
    } catch (err) {
      logger.error(failure, err);
      onerror(errorText(err, failure));
      return false;
    } finally {
      busy = false;
    }
  }

  async function addChannel(id: string | null) {
    if (!id) return;
    if (await run(() => utilityApi.addAutoPublish(guildId, BigInt(id)), m.utility.autopublishEnableFailed())) {
      channelPick = null;
    }
  }

  async function addUser(channelId: bigint) {
    const key = channelId.toString();
    const pick = userPick[key];
    if (!pick) return;
    if (await run(() => utilityApi.blacklistPublishUser(guildId, channelId, BigInt(pick)), m.utility.autopublishBlacklistUserFailed())) {
      userPick[key] = null;
    }
  }

  async function addWord(channelId: bigint) {
    const key = channelId.toString();
    const word = (wordDraft[key] ?? "").trim();
    if (!word) return;
    if (await run(() => utilityApi.blacklistPublishWord(guildId, channelId, word), m.utility.autopublishBlacklistWordFailed())) {
      wordDraft[key] = "";
    }
  }

  onMount(load);
</script>

<PluginCard title={m.utility.tabAutopublish()} alwaysOpen>
  <div>
    <span id="publish-channel" class="block text-sm font-medium mb-1" style="color: {$colorStore.text}">{m.utility.autopublishAddChannel()}</span>
    <DiscordSelector
      type="channel"
      options={newsChannels.filter((c) => !entries.some((e) => e.channelId.toString() === c.id))}
      selected={channelPick}
      placeholder={newsChannels.length ? m.utility.autopublishChannelPlaceholder() : m.utility.autopublishChannelNone()}
      ariaLabelledby="publish-channel"
      disabled={busy || newsChannels.length === 0}
      onchange={({ selected }) => addChannel(typeof selected === "string" ? selected : null)}
    />
  </div>

  {#each entries as entry (entry.channelId.toString())}
    {@const key = entry.channelId.toString()}
    <div class="rounded-xl border p-3 space-y-4 min-w-0" style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}20;">
      <div class="flex items-center gap-2">
        <i class="fa-solid fa-bullhorn shrink-0" style="color: {$colorStore.primary}" aria-hidden="true"></i>
        <span class="grow min-w-0 truncate text-sm font-semibold" style="color: {$colorStore.text}">#{entry.channelName ?? entry.channelId}</span>
        <button
          type="button"
          class="px-4 rounded-lg min-h-[44px] text-sm font-medium shrink-0 disabled:opacity-50"
          style="background: #ef444420; color: {$colorStore.text}; border: 1px solid #ef444440;"
          disabled={busy}
          onclick={() => run(() => utilityApi.removeAutoPublish(guildId, entry.channelId), m.utility.autopublishDisableFailed())}
        >
          {m.common.disable()}
        </button>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div class="space-y-3 min-w-0">
          <span id="skip-users-{key}" class="block text-sm font-medium" style="color: {$colorStore.text}">{m.utility.autopublishSkipUsers()}</span>
          <div class="flex flex-col sm:flex-row gap-3">
            <div class="grow min-w-0">
              <DiscordSelector
                type="user"
                options={members}
                selected={userPick[key] ?? null}
                ariaLabelledby="skip-users-{key}"
                onchange={({ selected }) => (userPick[key] = typeof selected === "string" ? selected : null)}
              />
            </div>
            <button
              type="button"
              class="px-5 rounded-xl min-h-[50px] font-medium disabled:opacity-50"
              style={primaryButton}
              disabled={busy || !userPick[key]}
              onclick={() => addUser(entry.channelId)}
            >
              {m.common.add()}
            </button>
          </div>
          <ChipList
            disabled={busy}
            items={entry.blacklistedUsers.map((id) => ({
              key: id.toString(),
              label: nameOf(members, id),
              removeLabel: m.utility.autopublishUnskipUserAria({ user: nameOf(members, id) })
            }))}
            onremove={(id) => run(() => utilityApi.unblacklistPublishUser(guildId, entry.channelId, BigInt(id)), m.utility.autopublishRemoveUserFailed())}
          />
        </div>

        <div class="space-y-3 min-w-0">
          <label for="skip-words-{key}" class="block text-sm font-medium" style="color: {$colorStore.text}">{m.utility.autopublishSkipWords()}</label>
          <form
            class="flex flex-col sm:flex-row gap-3"
            onsubmit={(e) => {
              e.preventDefault();
              void addWord(entry.channelId);
            }}
          >
            <input
              id="skip-words-{key}"
              type="text"
              bind:value={wordDraft[key]}
              placeholder={m.common.word()}
              class="grow min-w-0 p-3 rounded-lg border focus:ring-2 min-h-[50px]"
              style={inputStyle}
            >
            <button
              type="submit"
              class="px-5 rounded-xl min-h-[50px] font-medium disabled:opacity-50"
              style={primaryButton}
              disabled={busy || !(wordDraft[key] ?? "").trim()}
            >
              {m.common.add()}
            </button>
          </form>
          <ChipList
            disabled={busy}
            items={entry.blacklistedWords.map((word) => ({
              key: word,
              label: word,
              removeLabel: m.utility.autopublishUnskipWordAria({ word })
            }))}
            onremove={(word) => run(() => utilityApi.unblacklistPublishWord(guildId, entry.channelId, word), m.utility.autopublishRemoveWordFailed())}
          />
        </div>
      </div>
    </div>
  {:else}
    <p class="text-sm" style="color: {$colorStore.muted}">{m.utility.autopublishEmpty()}</p>
  {/each}
</PluginCard>
