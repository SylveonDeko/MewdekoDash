<script lang="ts">
  import { m } from "$lib/i18n";
  import { serverTemplatesApi, type BackupPreview, type ServerTemplateList } from "$lib/api/index.ts";
  import { colorStore } from "$lib/stores/colorStore";
  import { logger } from "$lib/logger";
  import { requestConfirmation } from "$lib/stores/confirmationStore";
  import PluginCard from "$lib/components/plugin/PluginCard.svelte";
  import ToolRow from "../ToolRow.svelte";
  import { errorText, type Notify } from "../toolsModel";
  import PreviewSheet from "./PreviewSheet.svelte";

  interface Props {
    userId: bigint | string;
    guildId: bigint;
    guildName: string;
    notify: Notify;
    onrestore: () => void;
  }

  let { userId, guildId, guildName, notify, onrestore }: Props = $props();

  let list = $state<ServerTemplateList | null>(null);
  let loading = $state(true);
  let busy = $state(false);
  let name = $state("");
  let openName: string | null = $state(null);
  let openBuiltIn = $state(false);
  let preview: BackupPreview | null = $state(null);

  const saved = $derived(list?.templates ?? []);

  const solid = $derived(`background: ${$colorStore.primary}; color: ${$colorStore.onPrimary};`);
  const soft = $derived(
    `background: ${$colorStore.primary}10; color: ${$colorStore.text}; border: 1px solid ${$colorStore.primary}20;`
  );
  const danger = "background: #ef444420; color: #ef4444; border: 1px solid #ef444440;";

  async function load() {
    loading = true;
    try {
      list = await serverTemplatesApi.list(userId);
    } catch (err) {
      logger.error("Failed to load templates:", err);
      notify(errorText(err, m.serverTools.templateLoadFailed()), "error");
    } finally {
      loading = false;
    }
  }

  async function save() {
    const clean = name.trim();
    if (busy || !clean) return;
    if (saved.some(template => template.name.toLowerCase() === clean.toLowerCase())) {
      const confirmed = await requestConfirmation({
        message: m.serverTools.templateOverwriteConfirm({ name: clean }),
        confirmText: m.serverTools.templateSave(),
        variant: "warning"
      });
      if (!confirmed) return;
    }
    busy = true;
    try {
      await serverTemplatesApi.save(userId, guildId, clean);
      name = "";
      notify(m.serverTools.templateSaved());
      await load();
    } catch (err) {
      logger.error("Failed to save template:", err);
      notify(errorText(err, m.serverTools.templateSaveFailed()), "error");
    } finally {
      busy = false;
    }
  }

  async function open(templateName: string, builtIn: boolean) {
    openName = templateName;
    openBuiltIn = builtIn;
    preview = null;
    try {
      preview = await serverTemplatesApi.preview(userId, templateName);
    } catch (err) {
      logger.error("Failed to load template preview:", err);
      notify(errorText(err, m.serverTools.backupPreviewFailed()), "error");
      openName = null;
    }
  }

  async function apply(templateName: string) {
    const confirmed = await requestConfirmation({
      title: m.serverTools.templateApply(),
      message: m.serverTools.templateApplyConfirm({ name: templateName, server: guildName }),
      confirmText: m.serverTools.templateApply(),
      variant: "warning"
    });
    if (!confirmed) return;
    busy = true;
    try {
      await serverTemplatesApi.apply(userId, guildId, templateName);
      openName = null;
      notify(m.serverTools.templateApplyStarted());
      onrestore();
    } catch (err) {
      logger.error("Failed to apply template:", err);
      notify(errorText(err, m.serverTools.templateApplyFailed()), "error");
    } finally {
      busy = false;
    }
  }

  async function remove(templateName: string) {
    const confirmed = await requestConfirmation({
      message: m.serverTools.templateDeleteConfirm({ name: templateName }),
      confirmText: m.common.delete()
    });
    if (!confirmed) return;
    try {
      await serverTemplatesApi.remove(userId, templateName);
      if (openName === templateName) openName = null;
      notify(m.serverTools.templateDeleted());
    } catch (err) {
      logger.error("Failed to delete template:", err);
      notify(errorText(err, m.serverTools.templateDeleteFailed()), "error");
    }
    await load();
  }

  function title(starter: string): string {
    return starter.charAt(0).toUpperCase() + starter.slice(1);
  }

  void load();
</script>

<PluginCard title={m.serverTools.templatesTitle()} alwaysOpen>
  <div class="space-y-4">
    <div class="flex flex-col sm:flex-row gap-3">
      <input
        type="text"
        bind:value={name}
        maxlength="50"
        placeholder={m.serverTools.templateNamePlaceholder()}
        aria-label={m.serverTools.templateNamePlaceholder()}
        class="grow min-w-0 p-3 rounded-lg border focus:ring-2 min-h-[50px]"
        style="background: {$colorStore.primary}10; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
        onkeydown={(e) => e.key === "Enter" && save()}
      >
      <button
        type="button"
        class="flex items-center justify-center gap-2 px-5 rounded-xl min-h-[50px] font-medium disabled:opacity-50"
        style={solid}
        disabled={busy || !name.trim()}
        onclick={save}
      >
        <i class="fa-solid fa-floppy-disk" aria-hidden="true"></i>
        {m.serverTools.templateSave()}
      </button>
    </div>

    {#if loading}
      <div class="flex justify-center py-6">
        <div class="w-10 h-10 border-4 rounded-full animate-spin" style="border-color: {$colorStore.primary}20; border-top-color: {$colorStore.primary}"></div>
      </div>
    {:else}
      <div class="space-y-2">
        {#each list?.builtIn ?? [] as starter (starter)}
          <ToolRow title={title(starter)} subtitle={m.serverTools.templateStarter()} onopen={() => open(starter, true)}>
            {#snippet actions()}
              <button type="button" class="px-4 rounded-lg min-h-[44px] text-sm font-medium" style={soft} onclick={() => apply(starter)}>
                {m.serverTools.templateApply()}
              </button>
            {/snippet}
          </ToolRow>
        {/each}
        {#each saved as template (template.name)}
          <ToolRow
            title={template.name}
            subtitle={new Date(template.createdAt).toLocaleString()}
            badges={[
              m.serverTools.countRoles({ count: template.roleCount }),
              m.serverTools.countChannels({ count: template.channelCount })
            ]}
            onopen={() => open(template.name, false)}
          >
            {#snippet actions()}
              <button type="button" class="px-4 rounded-lg min-h-[44px] text-sm font-medium" style={soft} onclick={() => apply(template.name)}>
                {m.serverTools.templateApply()}
              </button>
              <button
                type="button"
                class="rounded-lg min-h-[44px] min-w-[44px]"
                style={soft}
                aria-label={m.serverTools.templateDeleteAria({ name: template.name })}
                onclick={() => remove(template.name)}
              >
                <i class="fa-solid fa-trash" aria-hidden="true"></i>
              </button>
            {/snippet}
          </ToolRow>
        {/each}
      </div>
    {/if}
  </div>
</PluginCard>

{#if openName && preview}
  {@const templateName = openName}
  <PreviewSheet title={openBuiltIn ? title(templateName) : templateName} {preview} onclose={() => (openName = null)}>
    {#snippet footer()}
      {#if !openBuiltIn}
        <button type="button" class="px-4 rounded-lg min-h-[44px] font-medium" style={danger} onclick={() => remove(templateName)}>
          {m.common.delete()}
        </button>
      {/if}
      <button type="button" class="px-4 rounded-lg min-h-[44px] font-medium disabled:opacity-50" style={solid} disabled={busy} onclick={() => apply(templateName)}>
        {m.serverTools.templateApply()}
      </button>
    {/snippet}
  </PreviewSheet>
{/if}
