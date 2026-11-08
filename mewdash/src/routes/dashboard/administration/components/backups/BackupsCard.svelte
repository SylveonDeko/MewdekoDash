<script lang="ts">
  import { m } from "$lib/i18n";
  import {
    serverBackupsApi,
    type BackupPreview,
    type RestoreMode,
    type ServerBackup,
    type ServerBackupList
  } from "$lib/api/index.ts";
  import { colorStore } from "$lib/stores/colorStore";
  import { logger } from "$lib/logger";
  import { requestConfirmation } from "$lib/stores/confirmationStore";
  import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";
  import PluginCard from "$lib/components/plugin/PluginCard.svelte";
  import ToolRow from "../ToolRow.svelte";
  import { errorText, type Named, type Notify } from "../toolsModel";
  import PreviewSheet from "./PreviewSheet.svelte";

  interface Props {
    userId: bigint | string;
    guildId: bigint;
    guildName: string;
    textChannels: Named[];
    notify: Notify;
    onrestore: () => void;
  }

  let { userId, guildId, guildName, textChannels, notify, onrestore }: Props = $props();

  let list = $state<ServerBackupList | null>(null);
  let loading = $state(true);
  let busy = $state(false);
  let messages = $state(0);
  let messageChannels: string[] = $state([]);
  let openBackup: ServerBackup | null = $state(null);
  let preview: BackupPreview | null = $state(null);
  let mode = $state<RestoreMode>("AddMissing");

  const backups = $derived(list?.backups ?? []);
  const full = $derived(list ? backups.length >= list.maxBackups : false);

  const solid = $derived(`background: ${$colorStore.primary}; color: ${$colorStore.onPrimary};`);
  const soft = $derived(
    `background: ${$colorStore.primary}10; color: ${$colorStore.text}; border: 1px solid ${$colorStore.primary}20;`
  );
  const danger = "background: #ef444420; color: #ef4444; border: 1px solid #ef444440;";

  async function load() {
    loading = true;
    try {
      list = await serverBackupsApi.list(userId);
    } catch (err) {
      logger.error("Failed to load backups:", err);
      notify(errorText(err, m.serverTools.backupLoadFailed()), "error");
    } finally {
      loading = false;
    }
  }

  async function create() {
    if (busy) return;
    busy = true;
    const count = Math.min(100, Math.max(0, Number(messages) || 0));
    try {
      await serverBackupsApi.create(userId, guildId, {
        messages: count,
        channelIds: count > 0 ? messageChannels.map(id => BigInt(id)) : []
      });
      notify(m.serverTools.backupCreated());
      await load();
    } catch (err) {
      logger.error("Failed to create backup:", err);
      notify(errorText(err, m.serverTools.backupCreateFailed()), "error");
    } finally {
      busy = false;
    }
  }

  async function open(backup: ServerBackup) {
    openBackup = backup;
    preview = null;
    mode = "AddMissing";
    try {
      preview = await serverBackupsApi.preview(userId, backup.id);
    } catch (err) {
      logger.error("Failed to load backup preview:", err);
      notify(errorText(err, m.serverTools.backupPreviewFailed()), "error");
      openBackup = null;
    }
  }

  async function remove(backup: ServerBackup) {
    const confirmed = await requestConfirmation({
      message: m.serverTools.backupDeleteConfirm({ id: backup.id }),
      confirmText: m.common.delete()
    });
    if (!confirmed) return;
    try {
      await serverBackupsApi.remove(userId, backup.id);
      if (openBackup?.id === backup.id) openBackup = null;
      notify(m.serverTools.backupDeleted());
    } catch (err) {
      logger.error("Failed to delete backup:", err);
      notify(errorText(err, m.serverTools.backupDeleteFailed()), "error");
    }
    await load();
  }

  async function restore(backup: ServerBackup) {
    const confirmed = await requestConfirmation({
      title: m.serverTools.backupRestore(),
      message:
        mode === "Replace"
          ? m.serverTools.backupRestoreReplaceConfirm({ id: backup.id, server: guildName })
          : m.serverTools.backupRestoreAddConfirm({ id: backup.id, server: guildName }),
      confirmText: m.serverTools.backupRestore(),
      variant: mode === "Replace" ? "danger" : "warning"
    });
    if (!confirmed) return;
    busy = true;
    try {
      await serverBackupsApi.restore(userId, backup.id, guildId, mode);
      openBackup = null;
      notify(m.serverTools.backupRestoreStarted());
      onrestore();
    } catch (err) {
      logger.error("Failed to start restore:", err);
      notify(errorText(err, m.serverTools.backupRestoreFailed()), "error");
    } finally {
      busy = false;
    }
  }

  function when(iso: string): string {
    return new Date(iso).toLocaleString();
  }

  function size(bytes: number): string {
    return bytes >= 1048576 ? `${(bytes / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`;
  }

  void load();
</script>

<PluginCard title={m.serverTools.backupCreateTitle()} alwaysOpen>
  <div class="space-y-3">
    <div class="space-y-1">
      <label class="block text-sm font-medium" for="backup-messages" style="color: {$colorStore.text}">{m.serverTools.backupMessagesLabel()}</label>
      <input
        id="backup-messages"
        type="number"
        min="0"
        max="100"
        bind:value={messages}
        class="w-full p-3 rounded-lg border focus:ring-2 min-h-[50px]"
        style="background: {$colorStore.primary}10; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
      >
    </div>
    {#if messages > 0}
      <DiscordSelector
        type="channel"
        options={textChannels}
        selected={messageChannels}
        multiple
        placeholder={m.serverTools.backupMessageChannels()}
        onchange={(detail) => (messageChannels = Array.isArray(detail.selected) ? detail.selected : [])}
      />
    {/if}
    <button
      type="button"
      class="w-full sm:w-auto flex items-center justify-center gap-2 px-5 rounded-xl min-h-[50px] font-medium disabled:opacity-50"
      style={solid}
      disabled={busy || full || loading}
      onclick={create}
    >
      <i class="fa-solid {busy ? 'fa-spinner fa-spin' : 'fa-box-archive'}" aria-hidden="true"></i>
      {m.serverTools.backupCreate()}
    </button>
    {#if list}
      <p class="text-sm" style="color: {$colorStore.muted}">
        {m.serverTools.backupLimits({ count: backups.length, max: list.maxBackups, minutes: list.cooldownMinutes })}
      </p>
    {/if}
  </div>
</PluginCard>

<PluginCard title={m.serverTools.backupsTitle()} alwaysOpen>
  {#if loading}
    <div class="flex justify-center py-6">
      <div class="w-10 h-10 border-4 rounded-full animate-spin" style="border-color: {$colorStore.primary}20; border-top-color: {$colorStore.primary}"></div>
    </div>
  {:else if backups.length === 0}
    <div class="flex flex-col items-center gap-3 py-8 text-center">
      <i class="fa-solid fa-box-archive" style="color: {$colorStore.muted}; font-size: 28px;" aria-hidden="true"></i>
      <p style="color: {$colorStore.muted}">{m.serverTools.backupsEmpty()}</p>
    </div>
  {:else}
    <div class="space-y-2">
      {#each backups as backup (backup.id)}
        <ToolRow
          title={`#${backup.id} ${backup.sourceGuildName}`}
          subtitle={`${when(backup.createdAt)} · ${size(backup.sizeBytes)}`}
          badges={[
            m.serverTools.countRoles({ count: backup.roleCount }),
            m.serverTools.countChannels({ count: backup.channelCount }),
            m.serverTools.countEmojis({ count: backup.emojiCount }),
            ...(backup.messageCount > 0 ? [m.serverTools.countMessages({ count: backup.messageCount })] : [])
          ]}
          onopen={() => open(backup)}
        >
          {#snippet actions()}
            <button
              type="button"
              class="rounded-lg min-h-[44px] min-w-[44px]"
              style={soft}
              aria-label={m.serverTools.backupDeleteAria({ id: backup.id })}
              onclick={() => remove(backup)}
            >
              <i class="fa-solid fa-trash" aria-hidden="true"></i>
            </button>
          {/snippet}
        </ToolRow>
      {/each}
    </div>
  {/if}
</PluginCard>

{#if openBackup && preview}
  {@const backup = openBackup}
  <PreviewSheet title={`#${backup.id} ${backup.sourceGuildName}`} {preview} onclose={() => (openBackup = null)}>
    <div class="space-y-2">
      <h4 class="text-sm font-semibold" style="color: {$colorStore.text}">{m.serverTools.backupRestoreInto({ server: guildName })}</h4>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-2" role="group" aria-label={m.serverTools.backupModeAria()}>
        {#each [{ id: "AddMissing", label: m.serverTools.backupModeAdd() }, { id: "Replace", label: m.serverTools.backupModeReplace() }] as option (option.id)}
          {@const selected = mode === option.id}
          <button
            type="button"
            class="min-h-[50px] px-3 rounded-lg border text-sm font-medium"
            style="background: {selected ? $colorStore.selectedSurface : `${$colorStore.primary}08`}; border-color: {selected ? $colorStore.selectedBorder : `${$colorStore.primary}20`}; color: {$colorStore.text};"
            aria-pressed={selected}
            onclick={() => (mode = option.id as RestoreMode)}
          >
            {option.label}
          </button>
        {/each}
      </div>
    </div>
    {#snippet footer()}
      <button type="button" class="px-4 rounded-lg min-h-[44px] font-medium" style={danger} onclick={() => remove(backup)}>
        {m.common.delete()}
      </button>
      <button type="button" class="px-4 rounded-lg min-h-[44px] font-medium disabled:opacity-50" style={solid} disabled={busy} onclick={() => restore(backup)}>
        {m.serverTools.backupRestore()}
      </button>
    {/snippet}
  </PreviewSheet>
{/if}
