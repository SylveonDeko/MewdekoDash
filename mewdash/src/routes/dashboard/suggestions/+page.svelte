<!-- routes/dashboard/suggestions/+page.svelte -->
<script lang="ts">
  import { m } from "$lib/i18n";
  import { goto } from "$app/navigation";
  import { fade } from "svelte/transition";
  import type { PageData } from "./$types";
  import { clientApi, type GuildEmojiInfo } from "$lib/api/index.ts";
  import { currentGuild } from "$lib/stores/currentGuild.ts";
  import { currentInstance } from "$lib/stores/instanceStore.ts";
  import { colorStore } from "$lib/stores/colorStore.ts";
  import { logger } from "$lib/logger.ts";
  import { createAutoSave } from "$lib/utils/autoSave.svelte";
  import Notification from "$lib/components/ui/Notification.svelte";
  import PluginPage from "$lib/components/plugin/PluginPage.svelte";
  import SuggestionsCard from "./components/SuggestionsCard.svelte";
  import BasicsCard from "./components/BasicsCard.svelte";
  import OutcomesCard from "./components/OutcomesCard.svelte";
  import VotingCard from "./components/VotingCard.svelte";
  import SuggestButtonCard from "./components/SuggestButtonCard.svelte";
  import { errorText, loadConfig, senders, type Cfg, type Named, type SaveMode } from "./components/suggestionsModel";

  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();

  let cfg: Cfg | null = $state(null);
  let channels: Named[] = $state([]);
  let emojis: GuildEmojiInfo[] = $state([]);
  let showNotification = $state(false);
  let notificationMessage = $state("");
  let notificationType: "success" | "error" = $state("success");
  let loadedGuildId = "";
  let saved: Cfg | null = null;

  const autoSave = createAutoSave({
    onError: (err) => notify(errorText(err, m.suggestions.notifySaveFailed()), "error")
  });

  let guildId = $derived($currentGuild?.id ? BigInt($currentGuild.id) : null);

  const placeholders = $derived(
    [
      ["%suggest.user%", m.placeholders.suggestUser()],
      ["%suggest.user.id%", m.placeholders.suggestUserId()],
      ["%suggest.user.name%", m.placeholders.suggestUserName()],
      ["%suggest.user.avatar%", m.placeholders.suggestUserAvatar()],
      ["%suggest.message%", m.placeholders.suggestMessage()],
      ["%suggest.number%", m.placeholders.suggestNumber()],
      ["%suggest.mod.user%", m.placeholders.suggestModUser()],
      ["%suggest.mod.name%", m.placeholders.suggestModName()],
      ["%suggest.mod.avatar%", m.placeholders.suggestModAvatar()],
      ["%suggest.mod.message%", m.placeholders.suggestModMessage()]
    ].map(([name, description]) => ({ category: m.placeholders.categorySuggest(), name, description }))
  );

  function notify(message: string, type: "success" | "error" = "success") {
    notificationMessage = message;
    notificationType = type;
    showNotification = true;
    setTimeout(() => {
      showNotification = false;
    }, 3000);
  }

  async function loadGuildData(id: bigint) {
    const results = await Promise.allSettled([
      loadConfig(id).then(value => {
        cfg = value;
        saved = { ...value };
      }),
      clientApi.getTextChannels(id).then(list => (channels = list.map(x => ({ id: x.id.toString(), name: x.name })))),
      data.user?.id ? clientApi.getEmojis(data.user.id, true).then(value => (emojis = value)) : Promise.resolve()
    ]);
    for (const result of results) {
      if (result.status === "rejected") logger.error("Failed to load suggestion settings:", result.reason);
    }
    if (results[0].status === "rejected") notify(m.common.notifyLoadSettingsFailed(), "error");
  }

  function change<K extends keyof Cfg>(key: K, value: Cfg[K], mode: SaveMode = "now") {
    const id = guildId;
    if (!id || !cfg || !saved) return;
    const previous = saved[key];
    cfg = { ...cfg, [key]: value };
    const run = async () => {
      try {
        await senders[key](id, value);
        if (saved) saved[key] = value;
      } catch (err) {
        if (mode === "now" && guildId === id && cfg) cfg = { ...cfg, [key]: previous };
        throw err;
      }
    };
    if (mode === "now") void autoSave.now(key, run);
    else autoSave.schedule(key, run);
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
    const key = `${$currentGuild.id}:${$currentInstance?.port ?? ""}`;
    if (loadedGuildId !== key) {
      loadedGuildId = key;
      cfg = null;
      saved = null;
      void loadGuildData(BigInt($currentGuild.id));
    }
  });
</script>

<svelte:head>
  <title>{m.features.suggestionsName()}</title>
</svelte:head>

{#snippet statusMessages()}
  {#if showNotification}
    <div class="fixed top-4 right-4 z-50" transition:fade>
      <Notification message={notificationMessage} type={notificationType} />
    </div>
  {/if}
{/snippet}

<PluginPage
  {statusMessages}
  {autoSave}
  icon="fa-comment"
  guildName={$currentGuild?.name || m.common.dashboard()}
  title={m.features.suggestionsName()}
  subtitle={m.suggestions.pageSubtitle()}
>
  {#if guildId}
    {#key guildId}
      <div class="space-y-4 min-w-0" onfocusout={() => void autoSave.flush()}>
        <SuggestionsCard {guildId} user={data.user} onerror={(message) => notify(message, "error")} onsuccess={(message) => notify(message)} />
        {#if cfg}
          <BasicsCard {cfg} {channels} {placeholders} user={data.user} onchange={change} />
          <OutcomesCard {cfg} {channels} {placeholders} user={data.user} onchange={change} />
          <VotingCard {cfg} {emojis} onchange={change} />
          <SuggestButtonCard {cfg} {channels} {emojis} {autoSave} user={data.user} onchange={change} />
        {/if}
      </div>
    {/key}
  {/if}
</PluginPage>
