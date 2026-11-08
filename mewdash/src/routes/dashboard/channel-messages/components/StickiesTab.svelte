<script lang="ts">
  import { m } from "$lib/i18n";
  import { onMount } from "svelte";
  import { colorStore } from "$lib/stores/colorStore";
  import { logger } from "$lib/logger";
  import { requestConfirmation } from "$lib/stores/confirmationStore";
  import { stickiesApi, type Sticky, type StickyTemplate } from "$lib/api/channelmessages/channelmessages";
  import PluginCard from "$lib/components/plugin/PluginCard.svelte";
  import type { AutoSave } from "$lib/utils/autoSave.svelte";
  import type { DiscordUser } from "$lib/types/discord";
  import ListRow from "./ListRow.svelte";
  import StickySheet from "./StickySheet.svelte";
  import TemplateSheet from "./TemplateSheet.svelte";
  import { durationLabel, errorText, idString, preview, type Shared } from "./model";

  interface Props {
    shared: Shared;
    autoSave: AutoSave;
    user?: DiscordUser | null;
    onerror: (message: string) => void;
    onsuccess: (message: string) => void;
  }

  let { shared, autoSave, user = null, onerror, onsuccess }: Props = $props();

  let stickies: Sticky[] = $state([]);
  let templates: StickyTemplate[] = $state([]);
  let loading = $state(true);
  let editingChannel: string | null = $state(null);
  let creatingSticky = $state(false);
  let editingTemplate: string | null = $state(null);
  let creatingTemplate = $state(false);
  let busy = $state(false);
  let problem: string | null = $state(null);

  const sorted = $derived(
    [...stickies].sort((a, b) => channelName(a.channelId).localeCompare(channelName(b.channelId)))
  );
  const editing = $derived(stickies.find(s => idString(s.channelId) === editingChannel) ?? null);
  const editingTemplateValue = $derived(templates.find(t => t.name === editingTemplate) ?? null);

  const buttonStyle = $derived(
    `background: ${$colorStore.primary}20; color: ${$colorStore.text}; border: 1px solid ${$colorStore.primary}30;`
  );

  function channelName(id: bigint | string): string {
    const key = idString(id);
    const name = shared.channels.find(channel => channel.id === key)?.name;
    if (name) return `#${name}`;
    return shared.loading ? m.common.loading() : m.roleMenus.channelDeleted();
  }

  async function load() {
    try {
      [stickies, templates] = await Promise.all([stickiesApi.list(shared.guildId), stickiesApi.templates(shared.guildId)]);
    } catch (err) {
      logger.error("Failed to load stickies:", err);
      onerror(errorText(err, m.channelMessages.errorLoad()));
    } finally {
      loading = false;
    }
  }

  onMount(() => void load());

  function closeSticky() {
    void autoSave.flush();
    editingChannel = null;
    creatingSticky = false;
    problem = null;
  }

  function saveSticky(next: Sticky, typing: boolean) {
    const key = idString(next.channelId);
    stickies = stickies.map(s => (idString(s.channelId) === key ? next : s));
    const send = async () => {
      try {
        await stickiesApi.set(shared.guildId, next);
      } catch (err) {
        await load();
        throw err;
      }
    };
    if (typing) autoSave.schedule(`sticky:${key}`, send);
    else void autoSave.now(`sticky:${key}`, send);
  }

  async function createSticky(next: Sticky) {
    busy = true;
    problem = null;
    try {
      await stickiesApi.set(shared.guildId, next);
      await load();
      creatingSticky = false;
      editingChannel = idString(next.channelId);
      onsuccess(m.channelMessages.notifyStickyCreated());
    } catch (err) {
      logger.error("Failed to create sticky:", err);
      problem = errorText(err, m.channelMessages.errorSave());
    } finally {
      busy = false;
    }
  }

  async function removeSticky(sticky: Sticky) {
    const confirmed = await requestConfirmation({
      message: m.channelMessages.stickyDeleteConfirm({ channel: channelName(sticky.channelId) }),
      confirmText: m.common.delete()
    });
    if (!confirmed) return;
    try {
      await stickiesApi.remove(shared.guildId, sticky.channelId);
      stickies = stickies.filter(s => idString(s.channelId) !== idString(sticky.channelId));
      if (editingChannel === idString(sticky.channelId)) editingChannel = null;
      onsuccess(m.channelMessages.notifyDeleted());
    } catch (err) {
      logger.error("Failed to delete sticky:", err);
      onerror(errorText(err, m.channelMessages.errorDelete()));
    }
  }

  async function clearAll() {
    const confirmed = await requestConfirmation({
      message: m.channelMessages.stickyClearConfirm(),
      confirmText: m.channelMessages.clearAll()
    });
    if (!confirmed) return;
    try {
      await stickiesApi.clear(shared.guildId);
      stickies = [];
      onsuccess(m.channelMessages.notifyDeleted());
    } catch (err) {
      logger.error("Failed to clear stickies:", err);
      onerror(errorText(err, m.channelMessages.errorDelete()));
    }
  }

  function closeTemplate() {
    editingTemplate = null;
    creatingTemplate = false;
    problem = null;
  }

  async function saveTemplate(template: StickyTemplate) {
    busy = true;
    problem = null;
    try {
      await stickiesApi.saveTemplate(shared.guildId, template);
      templates = await stickiesApi.templates(shared.guildId);
      closeTemplate();
      onsuccess(m.channelMessages.notifySaved());
    } catch (err) {
      logger.error("Failed to save template:", err);
      problem = errorText(err, m.channelMessages.errorSave());
    } finally {
      busy = false;
    }
  }

  async function stickTemplate(name: string, channelId: string) {
    try {
      await stickiesApi.useTemplate(shared.guildId, name, BigInt(channelId));
      await load();
      closeTemplate();
      onsuccess(m.channelMessages.notifyStickyCreated());
    } catch (err) {
      logger.error("Failed to use template:", err);
      onerror(errorText(err, m.channelMessages.errorSave()));
    }
  }

  async function removeTemplate(template: StickyTemplate) {
    const confirmed = await requestConfirmation({
      message: m.channelMessages.templateDeleteConfirm({ name: template.name }),
      confirmText: m.common.delete()
    });
    if (!confirmed) return;
    try {
      await stickiesApi.deleteTemplate(shared.guildId, template.name);
      templates = templates.filter(t => t.name !== template.name);
      onsuccess(m.channelMessages.notifyDeleted());
    } catch (err) {
      logger.error("Failed to delete template:", err);
      onerror(errorText(err, m.channelMessages.errorDelete()));
    }
  }
</script>

{#snippet stickyActions()}
  {#if stickies.length > 0}
    <button type="button" class="flex items-center justify-center gap-2 px-5 rounded-xl min-h-[50px] font-medium" style={buttonStyle} onclick={clearAll}>
      <i class="fa-solid fa-trash" aria-hidden="true"></i>
      {m.channelMessages.clearAll()}
    </button>
  {/if}
  <button
    type="button"
    class="flex items-center justify-center gap-2 px-5 rounded-xl min-h-[50px] font-medium"
    style={buttonStyle}
    onclick={() => {
      problem = null;
      creatingSticky = true;
    }}
  >
    <i class="fa-solid fa-plus" aria-hidden="true"></i>
    {m.channelMessages.newSticky()}
  </button>
{/snippet}

{#snippet templateActions()}
  <button
    type="button"
    class="flex items-center justify-center gap-2 px-5 rounded-xl min-h-[50px] font-medium"
    style={buttonStyle}
    onclick={() => {
      problem = null;
      creatingTemplate = true;
    }}
  >
    <i class="fa-solid fa-plus" aria-hidden="true"></i>
    {m.channelMessages.newTemplate()}
  </button>
{/snippet}

{#snippet spinner()}
  <div class="flex justify-center py-6">
    <div class="w-10 h-10 border-4 rounded-full animate-spin" style="border-color: {$colorStore.primary}20; border-top-color: {$colorStore.primary}"></div>
  </div>
{/snippet}

<PluginCard title={m.channelMessages.stickiesTitle()} alwaysOpen actions={stickyActions}>
  {#if loading}
    {@render spinner()}
  {:else if sorted.length === 0}
    <div class="flex flex-col items-center gap-3 py-8 text-center">
      <i class="fa-solid fa-thumbtack" style="color: {$colorStore.muted}; font-size: 28px;" aria-hidden="true"></i>
      <p class="font-medium" style="color: {$colorStore.text}">{m.channelMessages.stickiesEmpty()}</p>
    </div>
  {:else}
    <div class="space-y-2">
      {#each sorted as sticky (idString(sticky.channelId))}
        <ListRow
          title={channelName(sticky.channelId)}
          subtitle={preview(sticky.content)}
          badges={[m.channelMessages.stickyBadge({ messages: sticky.messages, wait: durationLabel(sticky.seconds) })]}
          name={channelName(sticky.channelId)}
          onedit={() => (editingChannel = idString(sticky.channelId))}
          ondelete={() => removeSticky(sticky)}
        />
      {/each}
    </div>
  {/if}
</PluginCard>

<PluginCard title={m.channelMessages.templatesTitle()} alwaysOpen actions={templateActions}>
  {#if loading}
    {@render spinner()}
  {:else if templates.length === 0}
    <p class="text-sm py-2" style="color: {$colorStore.muted}">{m.channelMessages.templatesEmpty()}</p>
  {:else}
    <div class="space-y-2">
      {#each templates as template (template.name)}
        <ListRow
          title={template.name}
          subtitle={preview(template.content)}
          name={template.name}
          onedit={() => (editingTemplate = template.name)}
          ondelete={() => removeTemplate(template)}
        />
      {/each}
    </div>
  {/if}
</PluginCard>

{#if editing}
  {#key editingChannel}
    <StickySheet
      sticky={editing}
      channels={shared.channels}
      taken={[]}
      {autoSave}
      {user}
      creating={false}
      problem={null}
      onchange={saveSticky}
      oncreate={() => {}}
      onclose={closeSticky}
    />
  {/key}
{/if}

{#if creatingSticky}
  <StickySheet
    sticky={null}
    channels={shared.channels}
    taken={stickies.map(s => idString(s.channelId))}
    {autoSave}
    {user}
    creating={busy}
    {problem}
    onchange={() => {}}
    oncreate={createSticky}
    onclose={closeSticky}
  />
{/if}

{#if editingTemplateValue}
  {#key editingTemplate}
    <TemplateSheet
      template={editingTemplateValue}
      channels={shared.channels}
      {user}
      saving={busy}
      {problem}
      onsave={saveTemplate}
      onstick={stickTemplate}
      onclose={closeTemplate}
    />
  {/key}
{/if}

{#if creatingTemplate}
  <TemplateSheet
    template={null}
    channels={shared.channels}
    {user}
    saving={busy}
    {problem}
    onsave={saveTemplate}
    onstick={stickTemplate}
    onclose={closeTemplate}
  />
{/if}
