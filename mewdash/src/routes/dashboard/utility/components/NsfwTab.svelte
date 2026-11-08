<script lang="ts">
  import { onMount } from "svelte";
  import { m } from "$lib/i18n";
  import { utilityApi } from "$lib/api/index.ts";
  import { colorStore } from "$lib/stores/colorStore";
  import { logger } from "$lib/logger";
  import PluginCard from "$lib/components/plugin/PluginCard.svelte";
  import ChipList from "./ChipList.svelte";
  import { errorText, type TabProps } from "./utilityModel";

  let { guildId, onerror }: TabProps = $props();

  let tags: string[] = $state([]);
  let draft = $state("");
  let busy = $state(false);

  async function load() {
    try {
      tags = (await utilityApi.getNsfwBlacklist(guildId)).slice().sort();
    } catch (err) {
      logger.error("Failed to load NSFW blacklist:", err);
      onerror(errorText(err, m.utility.nsfwLoadFailed()));
    }
  }

  async function toggle(tag: string) {
    const clean = tag.trim().toLowerCase();
    if (!clean) return;
    busy = true;
    try {
      await utilityApi.toggleNsfwTag(guildId, clean);
      draft = "";
      await load();
    } catch (err) {
      logger.error("Failed to update NSFW blacklist:", err);
      onerror(errorText(err, m.common.failedToUpdateBlacklist()));
    } finally {
      busy = false;
    }
  }

  onMount(load);
</script>

<PluginCard title={m.utility.nsfwCardTitle({ count: tags.length })} alwaysOpen>
  <form
    class="flex flex-col sm:flex-row gap-3"
    onsubmit={(e) => {
      e.preventDefault();
      void toggle(draft);
    }}
  >
    <input
      type="text"
      bind:value={draft}
      maxlength="100"
      placeholder={m.utility.nsfwTagPlaceholder()}
      aria-label={m.utility.nsfwTagAria()}
      class="grow min-w-0 p-3 rounded-lg border focus:ring-2 min-h-[50px]"
      style="background: {$colorStore.primary}10; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
    >
    <button
      type="submit"
      class="px-5 rounded-xl min-h-[50px] font-medium disabled:opacity-50"
      style="background: {$colorStore.primary}; color: {$colorStore.onPrimary};"
      disabled={busy || !draft.trim()}
    >
      <i class="fa-solid fa-plus mr-2" aria-hidden="true"></i>{m.utility.nsfwBlock()}
    </button>
  </form>

  {#if tags.length === 0}
    <p class="text-sm" style="color: {$colorStore.muted}">{m.utility.nsfwEmpty()}</p>
  {:else}
    <ChipList
      disabled={busy}
      items={tags.map((tag) => ({ key: tag, label: tag, removeLabel: m.utility.nsfwUnblockAria({ tag }) }))}
      onremove={toggle}
    />
  {/if}
</PluginCard>
