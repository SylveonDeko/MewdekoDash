<script lang="ts">
  import { m } from "$lib/i18n";
  import { twitchApi, type TwitchHealthResponse } from "$lib/api/index.ts";
  import { colorStore } from "$lib/stores/colorStore";
  import { logger } from "$lib/logger";
  import { requestConfirmation } from "$lib/stores/confirmationStore";
  import ToggleRow from "$lib/components/forms/ToggleRow.svelte";
  import PluginCard from "$lib/components/plugin/PluginCard.svelte";
  import SettingField from "$lib/components/forms/SettingField.svelte";
  import Button from "./Button.svelte";
  import Input from "./Input.svelte";
  import { formatDate, type Notify } from "./twitchModel";
  import type { TwitchConfig } from "./twitchConfig.svelte";

  interface Props {
    guildId: bigint;
    config: TwitchConfig;
    health: TwitchHealthResponse | null;
    isBotOwner: boolean;
    notify: Notify;
    onreload: () => Promise<void>;
  }

  let { guildId, config, health, isBotOwner, notify, onreload }: Props = $props();

  let connecting: "bot" | "channel" | null = $state(null);
  let disconnecting = $state(false);

  const status = $derived(config.status);

  function connectionLabel(): string {
    if (!status) return m.twitch.statusChecking();
    if (status.isConfigured) return m.common.ready();
    if (status.hasBotAccount || status.hasChannelAuthorization) return m.twitch.statusNeedsSetup();
    return m.common.notConnected();
  }

  const overview = $derived([
    { label: m.twitch.overviewConnection(), value: connectionLabel() },
    { label: m.twitch.overviewBotAccount(), value: status?.botDisplayName || status?.botUsername || m.twitch.statusMissing() },
    { label: m.common.channel(), value: status?.channelDisplayName || status?.channelUsername || m.twitch.statusMissing() }
  ]);

  const details = $derived([
    { label: m.twitch.healthTransport(), value: status?.useEventSub ? m.twitch.healthTransportEventsub() : m.twitch.healthTransportIrc() },
    { label: m.twitch.healthLastEvent(), value: formatDate(status?.lastEventAt) },
    { label: m.common.botToken(), value: formatDate(status?.botTokenExpiry) },
    { label: m.twitch.healthChannelToken(), value: formatDate(status?.channelTokenExpiry) }
  ]);

  async function connect(mode: "bot" | "channel") {
    connecting = mode;
    try {
      const response = await twitchApi.getOAuthUrl(guildId, mode);
      window.location.href = response.authorizationUrl;
    } catch (err) {
      logger.error(`Failed to start Twitch ${mode} OAuth:`, err);
      notify(mode === "bot" ? m.twitch.notifyConnectBotFailed() : m.twitch.notifyConnectChannelFailed(), "error");
      connecting = null;
    }
  }

  async function disconnect(mode: "bot" | "channel") {
    const confirmed = await requestConfirmation({
      message: mode === "bot" ? m.twitch.confirmDisconnectBot() : m.twitch.confirmDisconnectChannel(),
      confirmText: m.twitch.confirmDisconnectButton()
    });
    if (!confirmed) return;
    disconnecting = true;
    try {
      const result = await twitchApi.disconnect(guildId, mode);
      notify(result.message);
      await onreload();
    } catch (err) {
      logger.error(`Failed to disconnect Twitch ${mode}:`, err);
      notify(mode === "bot" ? m.twitch.notifyDisconnectBotFailed() : m.twitch.notifyDisconnectChannelFailed(), "error");
    } finally {
      disconnecting = false;
    }
  }
</script>

{#snippet rows(items: Array<{ label: string; value: string }>)}
  <dl class="space-y-2">
    {#each items as item (item.label)}
      <div class="flex justify-between gap-4 text-sm">
        <dt style="color: {$colorStore.muted}">{item.label}</dt>
        <dd class="m-0 text-right break-words min-w-0" style="color: {$colorStore.text}">{item.value}</dd>
      </div>
    {/each}
  </dl>
{/snippet}

<PluginCard title={m.twitch.setupOauthTitle()} alwaysOpen>
  {@render rows(overview)}
  <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
    <Button variant="primary" disabled={connecting !== null} onclick={() => connect("channel")}>
      {connecting === "channel" ? m.twitch.setupOpening() : status?.hasChannelAuthorization ? m.twitch.setupReconnectChannel() : m.twitch.setupConnectChannel()}
    </Button>
    {#if isBotOwner}
      <Button disabled={connecting !== null} onclick={() => connect("bot")}>
        {connecting === "bot" ? m.twitch.setupOpening() : status?.hasBotAccount ? m.twitch.setupReconnectBot() : m.twitch.setupConnectBot()}
      </Button>
    {/if}
  </div>
</PluginCard>

<PluginCard title={m.twitch.botTitle()} enabled={config.form.enabled} onToggle={(value) => config.set("enabled", value)}>
  <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
    <SettingField label={m.common.commandPrefix()} id="tw-prefix">
      <Input id="tw-prefix" bind:value={config.form.commandPrefix} maxlength={5} oninput={config.typePrefix} onblur={config.blurPrefix} />
    </SettingField>
    <SettingField label={m.twitch.botLanguage()} id="tw-language">
      <Input
        id="tw-language"
        bind:value={config.form.language}
        placeholder={m.common.useServerDefault()}
        oninput={() => config.save("language")}
        onblur={() => config.flush("language")}
      />
    </SettingField>
  </div>
  <ToggleRow checked={config.form.useEventSub} title={m.twitch.botUseEventsub()} colors={$colorStore} onchange={(value) => config.set("useEventSub", value)} />
  <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
    <Button variant="danger" disabled={!status?.hasChannelAuthorization || disconnecting} onclick={() => disconnect("channel")}>
      {m.twitch.botDisconnectChannel()}
    </Button>
    {#if isBotOwner}
      <Button variant="danger" disabled={!status?.hasBotAccount || disconnecting} onclick={() => disconnect("bot")}>
        {m.twitch.botDisconnectBot()}
      </Button>
    {/if}
  </div>
</PluginCard>

<PluginCard title={m.twitch.healthTitle()} alwaysOpen>
  {@render rows(details)}
  {#if health}
    <div class="space-y-2 text-sm" style="color: {$colorStore.muted}">
      <p class="font-medium" style="color: {$colorStore.text}">{m.twitch.healthMissingScopes()}</p>
      <p>{m.twitch.healthBotScopes({ scopes: health.botMissingScopes.length ? health.botMissingScopes.join(", ") : m.common.noneLower() })}</p>
      <p>{m.twitch.healthChannelScopes({ scopes: health.channelMissingScopes.length ? health.channelMissingScopes.join(", ") : m.common.noneLower() })}</p>
      <p class="font-medium pt-2" style="color: {$colorStore.text}">{m.twitch.healthEventsub()}</p>
      {#if health.subscriptions.length === 0}
        <p>{m.twitch.healthNoSubscriptions()}</p>
      {:else}
        <ul class="space-y-1">
          {#each health.subscriptions as subscription (subscription.twitchSubscriptionId)}
            <li class="break-words">
              <strong style="color: {$colorStore.text}">{subscription.type}</strong>
              {subscription.status} · {formatDate(subscription.lastUpdatedAt)}
            </li>
          {/each}
        </ul>
      {/if}
    </div>
  {/if}
</PluginCard>
