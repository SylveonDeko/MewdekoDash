<script lang="ts">
  import { m } from "$lib/i18n";
  import { channelToolsApi, type VoiceTextLink } from "$lib/api/index.ts";
  import { colorStore } from "$lib/stores/colorStore";
  import { logger } from "$lib/logger";
  import { requestConfirmation } from "$lib/stores/confirmationStore";
  import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";
  import PluginCard from "$lib/components/plugin/PluginCard.svelte";
  import ToolRow from "../ToolRow.svelte";
  import { errorText, type Named, type Notify } from "../toolsModel";

  interface Props {
    guildId: bigint;
    textChannels: Named[];
    voiceChannels: Named[];
    notify: Notify;
  }

  let { guildId, textChannels, voiceChannels, notify }: Props = $props();

  let links: VoiceTextLink[] = $state([]);
  let loading = $state(true);
  let busy = $state(false);
  let voiceId: string | null = $state(null);
  let textId: string | null = $state(null);

  const solid = $derived(`background: ${$colorStore.primary}; color: ${$colorStore.onPrimary};`);
  const soft = $derived(
    `background: ${$colorStore.primary}10; color: ${$colorStore.text}; border: 1px solid ${$colorStore.primary}20;`
  );

  async function load() {
    try {
      links = await channelToolsApi.getVoiceText(guildId);
    } catch (err) {
      logger.error("Failed to load voice text links:", err);
      notify(errorText(err, m.serverTools.voiceTextLoadFailed()), "error");
    } finally {
      loading = false;
    }
  }

  async function add() {
    if (busy || !voiceId || !textId) return;
    busy = true;
    try {
      await channelToolsApi.setVoiceText(guildId, { voiceChannelId: BigInt(voiceId), textChannelId: BigInt(textId) });
      voiceId = null;
      textId = null;
      notify(m.serverTools.voiceTextSaved());
      await load();
    } catch (err) {
      logger.error("Failed to link voice channel:", err);
      notify(errorText(err, m.serverTools.voiceTextSaveFailed()), "error");
    } finally {
      busy = false;
    }
  }

  async function remove(link: VoiceTextLink) {
    const confirmed = await requestConfirmation({
      message: m.serverTools.voiceTextRemoveConfirm({ channel: name(voiceChannels, link.voiceChannelId) }),
      confirmText: m.common.remove()
    });
    if (!confirmed) return;
    try {
      await channelToolsApi.removeVoiceText(guildId, link.voiceChannelId);
      notify(m.serverTools.voiceTextRemoved());
    } catch (err) {
      logger.error("Failed to unlink voice channel:", err);
      notify(errorText(err, m.serverTools.voiceTextRemoveFailed()), "error");
    }
    await load();
  }

  function name(list: Named[], id: bigint | string): string {
    return list.find(channel => channel.id === String(id))?.name ?? String(id);
  }

  void load();
</script>

<PluginCard title={m.serverTools.voiceTextTitle()} alwaysOpen>
  <div class="space-y-4">
    <div class="grid gap-3 sm:grid-cols-2">
      <DiscordSelector
        type="channel"
        options={voiceChannels}
        selected={voiceId}
        placeholder={m.serverTools.voiceTextVoice()}
        ariaLabel={m.serverTools.voiceTextVoice()}
        onchange={(detail) => (voiceId = typeof detail.selected === "string" ? detail.selected : null)}
      />
      <DiscordSelector
        type="channel"
        options={textChannels}
        selected={textId}
        placeholder={m.serverTools.voiceTextText()}
        ariaLabel={m.serverTools.voiceTextText()}
        onchange={(detail) => (textId = typeof detail.selected === "string" ? detail.selected : null)}
      />
    </div>
    <button type="button" class="w-full sm:w-auto flex items-center justify-center gap-2 px-5 rounded-xl min-h-[50px] font-medium disabled:opacity-50" style={solid} disabled={busy || !voiceId || !textId} onclick={add}>
      <i class="fa-solid fa-link" aria-hidden="true"></i>{m.serverTools.voiceTextLink()}
    </button>

    {#if loading}
      <div class="flex justify-center py-6">
        <div class="w-10 h-10 border-4 rounded-full animate-spin" style="border-color: {$colorStore.primary}20; border-top-color: {$colorStore.primary}"></div>
      </div>
    {:else if links.length > 0}
      <div class="space-y-2">
        {#each links as link (String(link.voiceChannelId))}
          <ToolRow title={name(voiceChannels, link.voiceChannelId)} subtitle={`#${name(textChannels, link.textChannelId)}`}>
            {#snippet actions()}
              <button type="button" class="rounded-lg min-h-[44px] min-w-[44px]" style={soft} aria-label={m.serverTools.voiceTextRemoveAria({ channel: name(voiceChannels, link.voiceChannelId) })} onclick={() => remove(link)}>
                <i class="fa-solid fa-trash" aria-hidden="true"></i>
              </button>
            {/snippet}
          </ToolRow>
        {/each}
      </div>
    {/if}
  </div>
</PluginCard>
