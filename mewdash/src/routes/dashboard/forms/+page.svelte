<!-- routes/dashboard/forms/+page.svelte -->
<script lang="ts">
  import { m } from "$lib/i18n";
  import { goto } from "$app/navigation";
  import { page } from "$app/state";
  import { fade } from "svelte/transition";
  import type { PageData } from "./$types";
  import { clientApi, formsApi, type Form } from "$lib/api/index.ts";
  import type { GuildEmojiInfo } from "$lib/api/client/models";
  import { currentGuild } from "$lib/stores/currentGuild.ts";
  import { currentInstance } from "$lib/stores/instanceStore.ts";
  import { colorStore } from "$lib/stores/colorStore.ts";
  import { logger } from "$lib/logger.ts";
  import { createAutoSave } from "$lib/utils/autoSave.svelte";
  import Notification from "$lib/components/ui/Notification.svelte";
  import PluginPage from "$lib/components/plugin/PluginPage.svelte";
  import FormsTab from "./components/FormsTab.svelte";
  import FormEditor from "./components/FormEditor.svelte";
  import ResponsesTab from "./components/ResponsesTab.svelte";
  import DefaultsCard from "./components/DefaultsCard.svelte";
  import { TABS, errorText, idString, sanitizeForms, type Named, type TabId } from "./components/formsModel";

  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();

  let forms: Form[] = $state([]);
  let channels: Named[] = $state([]);
  let roles: Named[] = $state([]);
  let emojis: GuildEmojiInfo[] = $state([]);
  let approveEmote: string | null = $state(null);
  let rejectEmote: string | null = $state(null);
  let loading = $state(false);
  let editor = $state<{ id: number | null } | null>(null);
  let showNotification = $state(false);
  let notificationMessage = $state("");
  let notificationType: "success" | "error" = $state("success");
  let loadedGuildId = "";

  const autoSave = createAutoSave({
    onError: (err) => notify(errorText(err, m.forms.settingsGuildSaveFailed()), "error")
  });

  const guildId = $derived($currentGuild?.id ? BigInt($currentGuild.id) : null);
  const userId = $derived(BigInt(data.user.id));

  const tab: TabId = $derived.by(() => {
    const requested = page.url.searchParams.get("tab");
    return TABS.find((id) => id === requested) ?? "forms";
  });

  const responsesForm = $derived.by(() => {
    const requested = Number(page.url.searchParams.get("form"));
    return Number.isInteger(requested) && requested > 0 ? requested : null;
  });

  const labels = $derived<Record<TabId, { label: string; icon: string }>>({
    forms: { label: m.features.formsName(), icon: "fa-solid fa-clipboard-list" },
    responses: { label: m.common.responses(), icon: "fa-solid fa-inbox" },
    defaults: { label: m.forms.settingsGuildReviewButtons(), icon: "fa-solid fa-sliders" }
  });

  function notify(message: string, type: "success" | "error" = "success") {
    notificationMessage = message;
    notificationType = type;
    showNotification = true;
    setTimeout(() => {
      showNotification = false;
    }, 3000);
  }

  function go(next: TabId, form: number | null = null) {
    void autoSave.flush();
    const url = new URL(page.url);
    url.search = "";
    url.searchParams.set("tab", next);
    if (form) url.searchParams.set("form", String(form));
    void goto(url, { replaceState: true, noScroll: true, keepFocus: true });
  }

  async function reloadForms() {
    const id = guildId;
    if (!id) return;
    loading = true;
    try {
      const loaded = sanitizeForms(await formsApi.getGuildForms(id));
      if (guildId === id) forms = loaded;
    } catch (err) {
      logger.error("Failed to load forms:", err);
      notify(errorText(err, m.forms.pageErrorLoad()), "error");
    } finally {
      loading = false;
    }
  }

  async function loadGuildData(id: bigint) {
    const results = await Promise.allSettled([
      reloadForms(),
      clientApi.getTextChannels(id).then((value) => (channels = value.map((x) => ({ id: idString(x.id), name: x.name })))),
      clientApi.getRoles(id).then((value) => (roles = (value as Named[]).map((x) => ({ id: idString(x.id), name: x.name, color: x.color })))),
      clientApi.getEmojis(userId, false).then((value) => (emojis = value ?? [])),
      formsApi.getReviewEmotes(id).then((value) => {
        approveEmote = value?.approveEmote ?? null;
        rejectEmote = value?.rejectEmote ?? null;
      })
    ]);
    for (const result of results) {
      if (result.status === "rejected") logger.error("Failed to load forms data:", result.reason);
    }
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
  icon="fa-clipboard-check"
  guildName={$currentGuild?.name || m.common.dashboard()}
  title={m.features.formsName()}
  subtitle={m.forms.pageSubtitle()}
>
  <div class="grid grid-cols-2 sm:grid-cols-3 gap-2 [&>:last-child:nth-child(odd)]:col-span-2 sm:[&>:last-child:nth-child(odd)]:col-span-1" role="group" aria-label={m.forms.tabsAria()}>
    {#each TABS as id (id)}
      {@const selected = tab === id}
      <button
        type="button"
        class="min-h-[44px] px-2 rounded-lg border text-sm font-medium flex items-center justify-center gap-2"
        style="background: {selected ? $colorStore.selectedSurface : `${$colorStore.primary}08`}; border-color: {selected ? $colorStore.selectedBorder : `${$colorStore.primary}20`}; color: {$colorStore.text};"
        aria-pressed={selected}
        onclick={() => go(id, id === "responses" ? responsesForm : null)}
      >
        <i class={labels[id].icon} aria-hidden="true"></i>
        {labels[id].label}
      </button>
    {/each}
  </div>

  {#if guildId}
    {#if tab === "forms"}
      <FormsTab
        bind:forms
        {loading}
        {userId}
        onreload={reloadForms}
        onnew={() => (editor = { id: null })}
        onedit={(id) => (editor = { id })}
        onresponses={(id) => go("responses", id)}
        {notify}
      />
    {:else if tab === "responses"}
      <ResponsesTab {forms} formId={responsesForm} {userId} {notify} />
    {:else}
      <DefaultsCard {guildId} {emojis} bind:approveEmote bind:rejectEmote {autoSave} />
    {/if}

    {#if editor}
      {#key editor.id}
        <FormEditor
          formId={editor.id}
          {guildId}
          {userId}
          user={data.user ?? null}
          {channels}
          {roles}
          {emojis}
          guildApproveEmote={approveEmote}
          guildRejectEmote={rejectEmote}
          onclose={() => (editor = null)}
          onsaved={reloadForms}
          {notify}
        />
      {/key}
    {/if}
  {/if}
</PluginPage>
