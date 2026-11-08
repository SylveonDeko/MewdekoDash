<script lang="ts">
  import { m } from "$lib/i18n";
  import { clientApi, twitchApi, type TwitchAccountLinkResponse } from "$lib/api/index.ts";
  import { colorStore } from "$lib/stores/colorStore";
  import { logger } from "$lib/logger";
  import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";
  import PluginCard from "$lib/components/plugin/PluginCard.svelte";
  import AlertRow from "../AlertRow.svelte";
  import Button from "./Button.svelte";
  import Input from "./Input.svelte";
  import type { Notify } from "./twitchModel";

  interface Props {
    guildId: bigint;
    notify: Notify;
  }

  let { guildId, notify }: Props = $props();

  let links: TwitchAccountLinkResponse[] = $state([]);
  let members: Array<{ id: string; name: string }> = $state([]);
  let loading = $state(true);
  let busy = $state(false);
  let userId: string | null = $state(null);
  let username = $state("");

  function memberName(id: bigint): string {
    return members.find(member => member.id === id.toString())?.name ?? `<@${id}>`;
  }

  async function load() {
    try {
      const [list, people] = await Promise.all([
        twitchApi.getLinks(guildId).catch(() => []),
        clientApi.getMembers(guildId).catch(() => [])
      ]);
      links = list;
      members = people.map((member: any) => ({ id: member.id.toString(), name: member.username }));
    } finally {
      loading = false;
    }
  }

  async function add() {
    if (!userId || !username.trim()) return;
    busy = true;
    try {
      await twitchApi.createLink(guildId, { discordUserId: BigInt(userId), twitchUsername: username.trim() });
      userId = null;
      username = "";
      notify(m.twitch.notifyLinkSaved());
      await load();
    } catch (err) {
      logger.error("Failed to save Twitch account link:", err);
      notify(m.twitch.notifyLinkSaveFailed(), "error");
    } finally {
      busy = false;
    }
  }

  async function remove(id: bigint) {
    try {
      await twitchApi.removeLink(guildId, id);
      notify(m.twitch.notifyLinkRemoved());
      await load();
    } catch (err) {
      logger.error("Failed to remove Twitch account link:", err);
      notify(m.twitch.notifyLinkRemoveFailed(), "error");
    }
  }

  void load();
</script>

<PluginCard title={m.twitch.linksAdd()} alwaysOpen>
  <div class="space-y-1">
    <span class="block text-sm font-medium" style="color: {$colorStore.text}">{m.twitch.linksDiscordUser()}</span>
    <DiscordSelector
      type="user"
      options={members}
      selected={userId}
      placeholder={m.twitch.linksSelectUser()}
      onchange={(detail) => (userId = typeof detail.selected === "string" ? detail.selected : null)}
    />
  </div>
  <div class="flex flex-col sm:flex-row gap-3">
    <div class="grow min-w-0">
      <Input bind:value={username} label={m.twitch.linksTwitchUsername()} placeholder={m.twitch.linksTwitchPlaceholder()} />
    </div>
    <Button variant="primary" disabled={busy || !userId || !username.trim()} onclick={add}>
      <i class="fa-solid fa-plus" aria-hidden="true"></i>
      {busy ? m.common.saving() : m.twitch.linksAdd()}
    </Button>
  </div>
</PluginCard>

<PluginCard title={m.twitch.tabLinks()} alwaysOpen>
  {#if loading}
    <div class="flex justify-center py-6">
      <div class="w-10 h-10 border-4 rounded-full animate-spin" style="border-color: {$colorStore.primary}20; border-top-color: {$colorStore.primary}"></div>
    </div>
  {:else if links.length === 0}
    <p class="py-4 text-center" style="color: {$colorStore.muted}">{m.twitch.linksEmpty()}</p>
  {:else}
    <div class="space-y-2">
      {#each links as link (link.discordUserId)}
        <AlertRow
          title={memberName(link.discordUserId)}
          subtitle={`@${link.twitchUsername}`}
          removeLabel={m.common.remove()}
          onremove={() => remove(link.discordUserId)}
        />
      {/each}
    </div>
  {/if}
</PluginCard>
