<!-- routes/dashboard/settings/+page.svelte -->
<script lang="ts">
  import { m } from "$lib/i18n";
  import { goto } from "$app/navigation";
  import { fade } from "svelte/transition";
  import type { PageData } from "./$types";
  import { clientApi, guildApi } from "$lib/api/index.ts";
  import type { GuildEmojiInfo } from "$lib/api/client/models";
  import { currentGuild } from "$lib/stores/currentGuild.ts";
  import { currentInstance } from "$lib/stores/instanceStore.ts";
  import { colorStore } from "$lib/stores/colorStore.ts";
  import { logger } from "$lib/logger.ts";
  import { createAutoSave } from "$lib/utils/autoSave.svelte";
  import Notification from "$lib/components/ui/Notification.svelte";
  import PluginPage from "$lib/components/plugin/PluginPage.svelte";
  import GeneralCard from "./components/GeneralCard.svelte";
  import ModerationCard from "./components/ModerationCard.svelte";
  import ChatCard from "./components/ChatCard.svelte";
  import {
    DEFAULT_CURRENCY_EMOJI,
    DEFAULT_PREFIX,
    errorText,
    type Named,
    type SaveMode,
    type Settings
  } from "./components/settingsModel";

  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();

  let channels: Named[] = $state([]);
  let emojis: GuildEmojiInfo[] = $state([]);
  let settings: Settings | null = $state(null);
  let saved: Settings | null = null;
  let showNotification = $state(false);
  let notificationMessage = $state("");
  let notificationType: "success" | "error" = $state("success");
  let loadedGuildId = "";

  const autoSave = createAutoSave({
    onError: (err) => notify(errorText(err, m.settings.pageSaveFailed()), "error")
  });

  let guildId = $derived($currentGuild?.id ? BigInt($currentGuild.id) : null);

  function notify(message: string, type: "success" | "error" = "success") {
    notificationMessage = message;
    notificationType = type;
    showNotification = true;
    setTimeout(() => {
      showNotification = false;
    }, 3000);
  }

  async function loadGuildData(id: bigint) {
    const [loadedChannels, loadedSettings, loadedEmojis] = await Promise.allSettled([
      clientApi.getTextChannels(id),
      guildApi.getBotSettings(id),
      data.user?.id ? clientApi.getEmojis(data.user.id, true) : Promise.resolve([])
    ]);
    if (loadedChannels.status === "fulfilled") channels = loadedChannels.value;
    if (loadedEmojis.status === "fulfilled") emojis = loadedEmojis.value;
    if (loadedSettings.status === "fulfilled") {
      const value = loadedSettings.value;
      const next: Settings = {
        prefix: value.prefix || DEFAULT_PREFIX,
        commandLogChannel: value.commandLogChannel ?? 0n,
        currencyEmoji: value.currencyEmoji || DEFAULT_CURRENCY_EMOJI,
        warnlogChannelId: value.warnlogChannelId ?? 0n,
        warnExpireHours: value.warnExpireHours ?? 0,
        warnExpireAction: value.warnExpireAction ?? 0,
        locale: value.locale ?? "",
        snipeset: value.snipeset ?? false,
        previewLinks: value.previewLinks ?? false,
        muteRoleName: value.muteRoleName ?? "",
        removeRolesOnMute: value.removeRolesOnMute ?? false,
        verboseErrors: value.verboseErrors ?? false
      };
      settings = next;
      saved = { ...next };
    } else {
      logger.error("Failed to load bot settings:", loadedSettings.reason);
      notify(errorText(loadedSettings.reason, m.settings.pageFetchFailed()), "error");
    }
  }

  /**
   * Shows a change and sends only the fields in it.
   * @param changes The fields that changed
   * @param mode Whether to save now or once typing stops
   */
  function patch(changes: Partial<Settings>, mode: SaveMode = "typing") {
    const id = guildId;
    const current = settings;
    const confirmed = saved;
    if (!current || !confirmed || !id) return;
    const keys = Object.keys(changes) as (keyof Settings)[];
    const previous = Object.fromEntries(keys.map((key) => [key, confirmed[key]]));
    Object.assign(current, changes);
    const save = async () => {
      try {
        await guildApi.updateBotSettings(id, changes);
        Object.assign(confirmed, changes);
      } catch (err) {
        if (mode === "now") Object.assign(current, previous);
        throw err;
      }
    };
    if (mode === "now") void autoSave.now(keys[0], save);
    else autoSave.schedule(keys[0], save);
  }

  $effect(() => {
    if (!$currentGuild) {
      void goto("/dashboard");
      return;
    }
    if ($currentGuild.icon) {
      const serverIconUrl = `https://cdn.discordapp.com/icons/${$currentGuild.id}/${$currentGuild.icon}.${$currentGuild.icon.startsWith("a_") ? "gif" : "png"}`;
      colorStore.extractFromServerIcon(serverIconUrl);
    } else if ($currentInstance?.botAvatar) {
      colorStore.extractFromImage($currentInstance.botAvatar);
    }
    if (loadedGuildId !== $currentGuild.id.toString()) {
      loadedGuildId = $currentGuild.id.toString();
      settings = null;
      void loadGuildData(BigInt($currentGuild.id));
    }
  });
</script>

{#snippet statusMessages()}
  {#if showNotification}
    <div class="fixed top-4 right-4 z-[10001]" transition:fade>
      <Notification message={notificationMessage} type={notificationType} />
    </div>
  {/if}
{/snippet}

<PluginPage
  {statusMessages}
  {autoSave}
  icon="fa-gear"
  guildName={$currentGuild?.name || m.common.dashboard()}
  title={m.common.botSettings()}
  subtitle={m.settings.pageSubtitle()}
>
  {#if guildId && settings}
    {#key guildId}
      <div class="space-y-4 min-w-0" onfocusout={() => autoSave.flush()}>
        <GeneralCard {guildId} {settings} {emojis} {autoSave} onpatch={patch} />
        <ModerationCard {settings} {channels} onpatch={patch} />
        <ChatCard {settings} onpatch={patch} />
      </div>
    {/key}
  {/if}
</PluginPage>
