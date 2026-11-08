<!-- routes/dashboard/tickets/+page.svelte -->
<script lang="ts">
  import { m } from "$lib/i18n";
  import { goto } from "$app/navigation";
  import { fade } from "svelte/transition";
  import type { PageData } from "./$types";
  import { clientApi, ticketApi } from "$lib/api/index.ts";
  import type { BlacklistedUserResponse, Ticket, TicketCase, TicketOverview, TicketPanel, TicketPriority, TicketSettings, TicketTag } from "$lib/api/ticket/models";
  import type { GuildEmojiInfo } from "$lib/api/client/models";
  import { currentGuild } from "$lib/stores/currentGuild.ts";
  import { currentInstance } from "$lib/stores/instanceStore.ts";
  import { colorStore } from "$lib/stores/colorStore.ts";
  import { logger } from "$lib/logger.ts";
  import { createAutoSave } from "$lib/utils/autoSave.svelte";
  import Notification from "$lib/components/ui/Notification.svelte";
  import PluginPage from "$lib/components/plugin/PluginPage.svelte";
  import OverviewCard from "./components/OverviewCard.svelte";
  import PanelsCard from "./components/PanelsCard.svelte";
  import TicketsCard from "./components/TicketsCard.svelte";
  import CasesCard from "./components/CasesCard.svelte";
  import PrioritiesCard from "./components/PrioritiesCard.svelte";
  import TagsCard from "./components/TagsCard.svelte";
  import SettingsCard from "./components/SettingsCard.svelte";
  import BlacklistCard from "./components/BlacklistCard.svelte";
  import BatchCard from "./components/BatchCard.svelte";
  import { errorText, type Named } from "./ticketModel";

  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();

  let overview: TicketOverview | null = $state(null);
  let panels: TicketPanel[] = $state([]);
  let tickets: Ticket[] = $state([]);
  let cases: TicketCase[] = $state([]);
  let priorities: TicketPriority[] = $state([]);
  let tags: TicketTag[] = $state([]);
  let blocked: BlacklistedUserResponse[] = $state([]);
  let settings: TicketSettings | null = $state(null);
  let channels: Named[] = $state([]);
  let categories: Named[] = $state([]);
  let forums: Named[] = $state([]);
  let roles: Named[] = $state([]);
  let emojis: GuildEmojiInfo[] = $state([]);
  let loading = $state(true);
  let showNotification = $state(false);
  let notificationMessage = $state("");
  let notificationType: "success" | "error" = $state("success");
  let loadedGuildId = "";

  const autoSave = createAutoSave({
    onError: (err) => notify(errorText(err, m.common.failedToSaveTheSettings()), "error")
  });

  let guildId = $derived($currentGuild?.id ? BigInt($currentGuild.id) : null);
  const staffId = $derived(data.user?.id ? BigInt(String(data.user.id)) : null);
  const threadChannels = $derived([...channels, ...forums]);

  function notify(message: string, type: "success" | "error" = "success") {
    notificationMessage = message;
    notificationType = type;
    showNotification = true;
    setTimeout(() => {
      showNotification = false;
    }, 3000);
  }

  async function guarded<T>(task: Promise<T>, apply: (value: T) => void) {
    try {
      apply(await task);
    } catch (err) {
      logger.error("Failed to load ticket data:", err);
      notify(errorText(err, m.tickets.pageLoadFailed()), "error");
    }
  }

  const reloadPanels = (id: bigint) => guarded(ticketApi.getTicketPanels(id), value => (panels = value));
  const reloadTickets = (id: bigint) => guarded(ticketApi.getGuildTickets(id, true, true, false), value => (tickets = value));
  const reloadCases = (id: bigint) => guarded(ticketApi.getTicketCases(id), value => (cases = value));
  const reloadPriorities = (id: bigint) => guarded(ticketApi.getTicketPriorities(id), value => (priorities = value));
  const reloadTags = (id: bigint) => guarded(ticketApi.getTicketTags(id), value => (tags = value));
  const reloadBlocked = (id: bigint) => guarded(ticketApi.getTicketBlacklist(id), value => (blocked = value));
  const reloadOverview = (id: bigint) => guarded(ticketApi.getTicketOverview(id, 30), value => (overview = value));

  async function loadGuildData(id: bigint) {
    loading = true;
    const results = await Promise.allSettled([
      reloadOverview(id),
      reloadPanels(id),
      reloadTickets(id),
      reloadCases(id),
      reloadPriorities(id),
      reloadTags(id),
      reloadBlocked(id),
      ticketApi.getTicketSettings(id).then(value => (settings = value)),
      clientApi.getRoles(id).then(value => (roles = value as Named[])),
      clientApi.getTextChannels(id).then(value => (channels = value)),
      clientApi.getCategories(id).then(value => (categories = value as Named[])),
      clientApi.getForumChannels(id).then(value => (forums = value.map(f => ({ id: String(f.id), name: f.name })))),
      data.user?.id ? clientApi.getEmojis(BigInt(String(data.user.id)), false).then(value => (emojis = value)) : Promise.resolve()
    ]);
    for (const result of results) {
      if (result.status === "rejected") logger.error("Failed to load ticket data:", result.reason);
    }
    if (!settings) settings = {};
    loading = false;
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
  icon="fa-ticket"
  guildName={$currentGuild?.name || m.common.dashboard()}
  title={m.features.ticketsName()}
  subtitle={m.tickets.pageSubtitle()}
>
  {#if guildId}
    {#key guildId}
      <OverviewCard {overview} {priorities} {loading} />
      <PanelsCard
        {guildId}
        bind:panels
        {loading}
        {channels}
        {categories}
        {threadChannels}
        {roles}
        {emojis}
        {priorities}
        user={data.user}
        {autoSave}
        onreload={() => reloadPanels(guildId)}
        onerror={(message) => notify(message, "error")}
        onsuccess={(message) => notify(message)}
      />
      <TicketsCard
        {guildId}
        {tickets}
        {loading}
        {priorities}
        {tags}
        {cases}
        {staffId}
        onreload={async () => {
          await reloadTickets(guildId);
          await reloadOverview(guildId);
        }}
        onerror={(message) => notify(message, "error")}
        onsuccess={(message) => notify(message)}
      />
      <CasesCard
        {guildId}
        {cases}
        {tickets}
        {loading}
        {staffId}
        {autoSave}
        onreload={() => reloadCases(guildId)}
        onticketsreload={() => reloadTickets(guildId)}
        onerror={(message) => notify(message, "error")}
      />
      <PrioritiesCard
        {guildId}
        {priorities}
        {loading}
        {emojis}
        onreload={() => reloadPriorities(guildId)}
        onerror={(message) => notify(message, "error")}
      />
      <TagsCard {guildId} {tags} {loading} onreload={() => reloadTags(guildId)} onerror={(message) => notify(message, "error")} />
      {#if settings}
        <SettingsCard {guildId} {settings} {channels} {roles} {autoSave} />
      {/if}
      <BlacklistCard {guildId} users={blocked} {loading} onreload={() => reloadBlocked(guildId)} onerror={(message) => notify(message, "error")} />
      <BatchCard
        {guildId}
        {categories}
        {roles}
        onreload={async () => {
          await reloadTickets(guildId);
          await reloadOverview(guildId);
        }}
        onerror={(message) => notify(message, "error")}
        onsuccess={(message) => notify(message)}
      />
    {/key}
  {/if}
</PluginPage>
