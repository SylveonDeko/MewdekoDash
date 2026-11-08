<!-- routes/dashboard/automations/+page.svelte -->
<script lang="ts">
  import { m } from "$lib/i18n";
  import { goto } from "$app/navigation";
  import { fade } from "svelte/transition";
  import type { PageData } from "./$types";
  import {
    automationsApi,
    clientApi,
    type Automation,
    type AutomationSchema,
    type AutomationTemplate
  } from "$lib/api/index.ts";
  import type { GuildEmojiInfo } from "$lib/api/client/models";
  import { currentGuild } from "$lib/stores/currentGuild.ts";
  import { currentInstance } from "$lib/stores/instanceStore.ts";
  import { colorStore } from "$lib/stores/colorStore.ts";
  import { logger } from "$lib/logger.ts";
  import { requestConfirmation } from "$lib/stores/confirmationStore";
  import { createAutoSave } from "$lib/utils/autoSave.svelte";
  import Notification from "$lib/components/ui/Notification.svelte";
  import PluginCard from "$lib/components/plugin/PluginCard.svelte";
  import PluginPage from "$lib/components/plugin/PluginPage.svelte";
  import AutomationRow from "./components/AutomationRow.svelte";
  import EditorSheet from "./components/EditorSheet.svelte";
  import TemplatesCard from "./components/TemplatesCard.svelte";
  import {
    errorText,
    idString,
    label,
    validationErrors,
    type EditorContext,
    type Named
  } from "./components/automationsModel";

  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();

  let automations: Automation[] = $state([]);
  let templates: AutomationTemplate[] = $state([]);
  let schema: AutomationSchema | null = $state(null);
  let channels: Named[] = $state([]);
  let allChannels: Named[] = $state([]);
  let roles: Named[] = $state([]);
  let members: Named[] = $state([]);
  let emojis: GuildEmojiInfo[] = $state([]);
  let loading = $state(true);
  let editing: number | "new" | null = $state(null);
  let showNotification = $state(false);
  let notificationMessage = $state("");
  let notificationType: "success" | "error" = $state("success");
  let loadedGuildId = "";

  const autoSave = createAutoSave({
    onError: (err) => {
      if (validationErrors(err).length) return;
      notify(errorText(err, m.common.failedToSaveTheSettings()), "error");
    }
  });

  let guildId = $derived($currentGuild?.id ? BigInt($currentGuild.id) : null);

  const ctx: EditorContext | null = $derived(
    schema ? { schema, channels, allChannels, roles, members, emojis } : null
  );
  const open = $derived(typeof editing === "number" ? (automations.find((x) => x.id === editing) ?? null) : null);

  const buttonStyle = $derived(`background: ${$colorStore.primary}; color: ${$colorStore.onPrimary};`);

  function notify(message: string, type: "success" | "error" = "success") {
    notificationMessage = message;
    notificationType = type;
    showNotification = true;
    setTimeout(() => {
      showNotification = false;
    }, 3000);
  }

  function named(items: Array<{ id: unknown; name?: string }>): Named[] {
    return items.map((x) => ({ id: idString(x.id), name: x.name ?? idString(x.id) }));
  }

  function summary(automation: Automation): string {
    const trigger = schema?.triggers.find((x) => x.type === automation.trigger);
    return [
      label(`trigger${automation.trigger}`, trigger?.name ?? automation.trigger),
      m.automations.conditionCount({ count: automation.conditions.length }),
      m.automations.actionCount({ count: automation.actions.length })
    ].join(" · ");
  }

  async function loadList(id: bigint) {
    try {
      automations = await automationsApi.getAutomations(id);
    } catch (err) {
      logger.error("Failed to load automations:", err);
      notify(errorText(err, m.automations.errorLoad()), "error");
    }
  }

  async function loadGuildData(id: bigint) {
    loading = true;
    const results = await Promise.allSettled([
      automationsApi.getSchema(id).then((value) => (schema = value)),
      automationsApi.getTemplates(id).then((value) => (templates = value)),
      loadList(id),
      clientApi.getTextChannels(id).then((value) => (channels = named(value))),
      Promise.all([
        clientApi.getTextChannels(id),
        clientApi.getVoiceChannels(id),
        clientApi.getCategories(id)
      ]).then((value) => (allChannels = named(value.flat()))),
      clientApi.getRoles(id).then((value) => (roles = named(value as Named[]))),
      clientApi.getMembers(id).then(
        (value) =>
          (members = value
            .map((x) => ({ id: idString(x.id), name: x.displayName ?? x.username ?? idString(x.id) }))
            .sort((a, b) => a.name.localeCompare(b.name)))
      ),
      data.user?.id
        ? clientApi.getEmojis(data.user.id, true).then((value) => (emojis = value))
        : Promise.resolve()
    ]);
    for (const result of results) {
      if (result.status === "rejected") logger.error("Failed to load automation data:", result.reason);
    }
    if (!schema) notify(m.automations.errorLoad(), "error");
    loading = false;
  }

  function saved(automation: Automation) {
    const index = automations.findIndex((x) => x.id === automation.id);
    if (index === -1) automations = [...automations, automation];
    else automations = automations.map((x) => (x.id === automation.id ? automation : x));
  }

  async function toggle(automation: Automation, enabled: boolean) {
    const id = guildId;
    if (!id) return;
    const previous = automation.enabled;
    saved({ ...automation, enabled });
    await autoSave.now(`enabled:${automation.id}`, async () => {
      try {
        saved(await automationsApi.setEnabled(id, automation.id, enabled));
      } catch (err) {
        saved({ ...automation, enabled: previous });
        throw err;
      }
    });
  }

  async function remove(automation: Automation) {
    const id = guildId;
    if (!id) return;
    const confirmed = await requestConfirmation({
      message: m.automations.confirmDelete({ name: automation.name }),
      confirmText: m.common.delete()
    });
    if (!confirmed) return;
    try {
      autoSave.cancel(`automation:${automation.id}`);
      await autoSave.flush();
      await automationsApi.deleteAutomation(id, automation.id);
      notify(m.automations.deleted());
    } catch (err) {
      logger.error("Failed to delete automation:", err);
      notify(errorText(err, m.automations.errorDelete()), "error");
    }
    await loadList(id);
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
      editing = null;
      void loadGuildData(BigInt($currentGuild.id));
    }
  });
</script>

<svelte:head>
  <title>{m.automations.pageHeadTitle()}</title>
</svelte:head>

{#snippet statusMessages()}
  {#if showNotification}
    <div class="fixed top-4 right-4 z-[10001]" transition:fade>
      <Notification message={notificationMessage} type={notificationType} />
    </div>
  {/if}
{/snippet}

{#snippet newButton()}
  <button
    type="button"
    class="flex items-center justify-center gap-2 px-5 rounded-xl min-h-[50px] font-medium disabled:opacity-50"
    style={buttonStyle}
    disabled={!ctx}
    onclick={() => (editing = "new")}
  >
    <i class="fa-solid fa-plus" aria-hidden="true"></i>
    {m.automations.newButton()}
  </button>
{/snippet}

<PluginPage
  {statusMessages}
  {autoSave}
  icon="fa-wand-magic"
  guildName={$currentGuild?.name || m.common.dashboard()}
  title={m.automations.pageTitle()}
  subtitle={m.automations.pageSubtitle()}
>
  {#if guildId}
    {#key guildId}
      <PluginCard title={m.automations.listTitle()} actions={newButton} alwaysOpen>
        {#if loading}
          <div class="flex justify-center py-6">
            <div class="w-10 h-10 border-4 rounded-full animate-spin" style="border-color: {$colorStore.primary}20; border-top-color: {$colorStore.primary}"></div>
          </div>
        {:else if automations.length === 0}
          <div class="flex flex-col items-center gap-3 py-8 text-center">
            <i class="fa-solid fa-gears" style="color: {$colorStore.muted}; font-size: 28px;" aria-hidden="true"></i>
            <p style="color: {$colorStore.muted}">{m.automations.empty()}</p>
          </div>
        {:else}
          <div class="space-y-2">
            {#each automations as automation (automation.id)}
              <AutomationRow
                name={automation.name}
                subtitle={summary(automation)}
                enabled={automation.enabled}
                onopen={() => (editing = automation.id)}
                ontoggle={(enabled) => toggle(automation, enabled)}
                onremove={() => remove(automation)}
              />
            {/each}
          </div>
        {/if}
      </PluginCard>

      {#if ctx && templates.length}
        <TemplatesCard
          {guildId}
          {templates}
          {ctx}
          userId={data.user?.id ? String(data.user.id) : undefined}
          {notify}
          oncreated={() => loadList(guildId)}
        />
      {/if}

      {#if ctx && (editing === "new" || open)}
        {#key editing}
          <EditorSheet
            {guildId}
            automation={open}
            {ctx}
            {autoSave}
            user={data.user}
            {notify}
            onsaved={saved}
            onclose={() => (editing = null)}
          />
        {/key}
      {/if}
    {/key}
  {/if}
</PluginPage>
