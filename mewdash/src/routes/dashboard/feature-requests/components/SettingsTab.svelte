<script lang="ts">
  import { m } from "$lib/i18n";
  import { featureRequestsApi } from "$lib/api/index.ts";
  import type { FeatureRequestSettings } from "$lib/api/featurerequests/models";
  import { colorStore } from "$lib/stores/colorStore";
  import { logger } from "$lib/logger";
  import PluginCard from "$lib/components/plugin/PluginCard.svelte";
  import type { AutoSave } from "$lib/utils/autoSave.svelte";
  import { errorText, type Notify } from "./requestModel";

  interface Props {
    autoSave: AutoSave;
    notify: Notify;
  }

  let { autoSave, notify }: Props = $props();

  let settings = $state<FeatureRequestSettings | null>(null);
  let channelInput = $state("");
  let invalid = $state(false);

  const savedInput = $derived(!settings || settings.channelId === 0n ? "" : settings.channelId.toString());

  async function load() {
    try {
      settings = await featureRequestsApi.getSettings();
      channelInput = settings.channelId === 0n ? "" : settings.channelId.toString();
    } catch (err) {
      logger.error("Failed to load feature request settings:", err);
      notify(errorText(err, m.common.notifyLoadSettingsFailed()), "error");
    }
  }

  function schedule(showInvalid = false) {
    if (!settings) return;
    const trimmed = channelInput.trim();

    if (trimmed && !/^\d{17,20}$/.test(trimmed)) {
      autoSave.cancel("channel");
      invalid = showInvalid;
      return;
    }

    invalid = false;
    if (trimmed === savedInput) {
      autoSave.cancel("channel");
      return;
    }

    const channelId = trimmed ? BigInt(trimmed) : 0n;
    autoSave.schedule("channel", async () => {
      const previous = savedInput;
      try {
        settings = await featureRequestsApi.setSettings(channelId);
      } catch (err) {
        logger.error("Failed to save feature request settings:", err);
        channelInput = previous;
        notify(errorText(err, m.common.failedToSaveTheSettings()), "error");
        throw err;
      }
    });
  }

  void load();
</script>

<PluginCard title={m.featureRequests.reportChannelHeading()} alwaysOpen>
  {#if settings}
    <div class="space-y-3">
      <div>
        <label for="fr-channel" class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">{m.featureRequests.reportChannelLabel()}</label>
        <input
          id="fr-channel"
          type="text"
          inputmode="numeric"
          bind:value={channelInput}
          placeholder={m.common.leaveEmptyJoinLeaveHint()}
          class="w-full p-3 rounded-lg border focus:ring-2 min-h-[50px] font-mono"
          style="background: {$colorStore.primary}10; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
          aria-invalid={invalid}
          oninput={() => schedule()}
          onblur={() => {
            schedule(true);
            void autoSave.flush("channel");
          }}
        >
      </div>

      <p class="text-sm" style="color: {invalid || settings.effectiveChannelId === 0n || !settings.reachable ? $colorStore.text : $colorStore.muted}" role="status">
        {#if invalid}
          {m.common.invalidChannelId()}
        {:else if settings.effectiveChannelId === 0n}
          {m.featureRequests.reportChannelUnset()}
        {:else if !settings.reachable}
          {m.featureRequests.reportChannelUnreachable({ channel: settings.effectiveChannelId.toString() })}
        {:else}
          {settings.guildName
            ? m.featureRequests.reportDestinationInGuild({ channel: settings.channelName ?? "", guild: settings.guildName })
            : m.featureRequests.reportDestination({ channel: settings.channelName ?? "" })}
          {#if settings.usingFallback}{m.common.joinLeaveChannelFallbackHint()}{/if}
        {/if}
      </p>
    </div>
  {:else}
    <p class="text-sm" style="color: {$colorStore.muted}">{m.common.loading()}</p>
  {/if}
</PluginCard>
