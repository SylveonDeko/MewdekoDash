<script lang="ts">
  import { m } from "$lib/i18n";
  import { onMount } from "svelte";
  import { browser } from "$app/environment";
  import { goto, invalidateAll } from "$app/navigation";
  import { ownershipApi, twitchApi, type TwitchHealthResponse } from "$lib/api/index.ts";
  import { colorStore } from "$lib/stores/colorStore";
  import SubTabs from "$lib/components/ui/SubTabs.svelte";
  import { logger } from "$lib/logger";
  import type { DiscordUser } from "$lib/types/discord";
  import type { AutoSave } from "$lib/utils/autoSave.svelte";
  import TwitchCommands from "./twitch/TwitchCommands.svelte";
  import TwitchEvents from "./twitch/TwitchEvents.svelte";
  import TwitchLinks from "./twitch/TwitchLinks.svelte";
  import TwitchLive from "./twitch/TwitchLive.svelte";
  import TwitchQuotes from "./twitch/TwitchQuotes.svelte";
  import TwitchSetup from "./twitch/TwitchSetup.svelte";
  import TwitchTimers from "./twitch/TwitchTimers.svelte";
  import { createTwitchConfig } from "./twitch/twitchConfig.svelte";
  import { TWITCH_SECTIONS, type Named, type Notify, type TwitchSection } from "./twitch/twitchModel";

  interface Props {
    guildId: bigint;
    channels: Named[];
    autoSave: AutoSave;
    user?: DiscordUser | null;
    notify: Notify;
    registerSaveError: (handler: (key: string) => string) => void;
  }

  let { guildId, channels, autoSave, user = null, notify, registerSaveError }: Props = $props();

  const config = createTwitchConfig(() => guildId, () => autoSave);

  let loading = $state(true);
  let section: TwitchSection = $state("setup");
  let health: TwitchHealthResponse | null = $state(null);
  let isBotOwner = $state(false);

  const labels = $derived<Record<TwitchSection, string>>({
    setup: m.common.setup(),
    commands: m.common.commands(),
    timers: m.twitch.subtabTimers(),
    quotes: m.common.quotes(),
    events: m.common.events(),
    live: m.twitch.subtabLive(),
    links: m.twitch.tabLinks()
  });

  $effect(() => {
    registerSaveError(config.saveErrorText);
  });

  async function refreshHealth() {
    health = await twitchApi.getHealth(guildId).catch(() => health);
  }

  async function loadData() {
    await autoSave.flush();
    try {
      const [status, settings, healthData] = await Promise.all([
        twitchApi.getOAuthStatus(guildId),
        twitchApi.getConfig(guildId).catch(() => null),
        twitchApi.getHealth(guildId).catch(() => null)
      ]);
      config.apply(status, settings?.enabled ?? true);
      health = healthData;
    } catch (err) {
      logger.error("Failed to load Twitch data:", err);
      notify(m.twitch.notifyLoadFailed(), "error");
    } finally {
      loading = false;
    }
  }

  async function handleOAuthCallback(code: string | null, state: string | null, error?: string) {
    if (error) {
      notify(decodeURIComponent(error), "error");
      return;
    }
    if (!code || !state) return;
    try {
      const result = await twitchApi.handleOAuthCallback(code, state);
      notify(result.message || m.twitch.notifyOauthComplete());
    } catch (err) {
      logger.error("Failed to complete Twitch OAuth:", err);
      notify(m.twitch.notifyOauthFailed(), "error");
    }
  }

  onMount(async () => {
    if (!browser) return;

    if (user?.id) isBotOwner = await ownershipApi.isOwner(BigInt(user.id)).catch(() => false);

    const params = new URL(window.location.href).searchParams;
    const code = params.get("code");
    const state = params.get("state");
    const error = params.get("error");

    if ((code && state) || error) {
      await handleOAuthCallback(code, state, error ?? undefined);
      const cleanUrl = new URL(window.location.href);
      for (const key of ["code", "state", "scope", "error", "error_description"]) cleanUrl.searchParams.delete(key);
      await goto(cleanUrl.toString(), { replaceState: true });
      await invalidateAll();
    }

    await loadData();
  });
</script>

<SubTabs
  tabs={TWITCH_SECTIONS.map((id) => ({ id, label: labels[id] }))}
  active={section}
  ariaLabel={m.features.twitchName()}
  onselect={(id) => (section = id as TwitchSection)}
/>

{#if loading}
  <div class="flex justify-center py-10">
    <div class="w-10 h-10 border-4 rounded-full animate-spin" style="border-color: {$colorStore.primary}20; border-top-color: {$colorStore.primary}"></div>
  </div>
{:else if section === "setup"}
  <TwitchSetup {guildId} {config} {health} {isBotOwner} {notify} onreload={loadData} />
{:else if section === "commands"}
  <TwitchCommands {guildId} prefix={config.form.commandPrefix} {notify} onhealth={refreshHealth} />
{:else if section === "timers"}
  <TwitchTimers {guildId} {notify} onhealth={refreshHealth} />
{:else if section === "quotes"}
  <TwitchQuotes {guildId} {user} {notify} onhealth={refreshHealth} />
{:else if section === "events"}
  <TwitchEvents {guildId} {config} {channels} {user} {notify} onhealth={refreshHealth} />
{:else if section === "live"}
  <TwitchLive {guildId} {notify} onhealth={refreshHealth} />
{:else}
  <TwitchLinks {guildId} {notify} />
{/if}
