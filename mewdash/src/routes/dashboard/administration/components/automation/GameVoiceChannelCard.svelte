<script lang="ts">
  import { m } from "$lib/i18n";
  import { administrationApi } from "$lib/api/index.ts";
  import { colorStore } from "$lib/stores/colorStore";
  import { logger } from "$lib/logger";
  import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";
  import PluginCard from "$lib/components/plugin/PluginCard.svelte";
  import { errorText, type TabProps } from "../toolsModel";

  type Props = Pick<TabProps, "guildId" | "voiceChannels" | "autoSave" | "notify">;

  let { guildId, voiceChannels, autoSave, notify }: Props = $props();

  let channelId = $state<string | null>(null);

  async function load() {
    try {
      const value = await administrationApi.getGameVoiceChannel(guildId);
      channelId = value && value !== 0n ? String(value) : null;
    } catch (err) {
      logger.error("Failed to load game voice channel:", err);
      notify(errorText(err, m.administration.automationLoadFailed()), "error");
    }
  }

  function change(value: string | null) {
    const target = value ?? channelId;
    if (!target || value === channelId) return;
    const previous = channelId;
    channelId = value;
    autoSave.now("gameVoiceChannel", async () => {
      try {
        const result = await administrationApi.toggleGameVoiceChannel(guildId, { channelId: BigInt(target) });
        channelId = result && result !== 0n ? String(result) : null;
      } catch (err) {
        channelId = previous;
        throw err;
      }
    });
  }

  void load();
</script>

<PluginCard title={m.administration.automationGameVoiceChannelTitle()} alwaysOpen>
  <div class="space-y-1">
    <span class="block text-sm font-medium" style="color: {$colorStore.text}">{m.common.channel()}</span>
    <DiscordSelector
      type="channel"
      options={voiceChannels}
      selected={channelId}
      clearable
      placeholder={m.common.selectVoiceChannelPlaceholder()}
      onchange={(detail) => change(typeof detail.selected === "string" ? detail.selected : null)}
    />
  </div>
</PluginCard>
