<script lang="ts">
  import { m } from "$lib/i18n";
  import { administrationApi, type PermissionOverride } from "$lib/api/index.ts";
  import { colorStore } from "$lib/stores/colorStore";
  import { logger } from "$lib/logger";
  import { requestConfirmation } from "$lib/stores/confirmationStore";
  import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";
  import PluginCard from "$lib/components/plugin/PluginCard.svelte";
  import Sheet from "$lib/components/ui/Sheet.svelte";
  import RemovableRow from "../RemovableRow.svelte";
  import { errorText, type Notify } from "../toolsModel";

  interface Props {
    guildId: bigint;
    commands: Array<{ id: string; name: string }>;
    notify: Notify;
  }

  let { guildId, commands, notify }: Props = $props();

  let overrides = $state<PermissionOverride[]>([]);
  let loading = $state(true);
  let busy = $state(false);
  let draft = $state<{ command: string | null; permission: string } | null>(null);

  const permissions = $derived([
    { id: "Administrator", name: m.common.permAdministrator() },
    { id: "ManageGuild", name: m.common.manageServer() },
    { id: "ManageRoles", name: m.common.permManageRoles() },
    { id: "ManageChannels", name: m.common.permManageChannels() },
    { id: "ManageMessages", name: m.common.permManageMessages() },
    { id: "KickMembers", name: m.common.permKickMembers() },
    { id: "BanMembers", name: m.common.permBanMembers() },
    { id: "ModerateMembers", name: m.common.permModerateMembers() },
    { id: "ViewChannel", name: m.administration.pagePermViewChannel() },
    { id: "SendMessages", name: m.common.sendMessages() },
    { id: "EmbedLinks", name: m.administration.pagePermEmbedLinks() },
    { id: "AttachFiles", name: m.administration.pagePermAttachFiles() },
    { id: "ReadMessageHistory", name: m.administration.pagePermReadMessageHistory() },
    { id: "MentionEveryone", name: m.common.mentionEveryone() },
    { id: "UseExternalEmojis", name: m.administration.pagePermUseExternalEmojis() },
    { id: "Connect", name: m.administration.pagePermConnect() },
    { id: "Speak", name: m.administration.pagePermSpeak() },
    { id: "MuteMembers", name: m.administration.pagePermMuteMembers() },
    { id: "DeafenMembers", name: m.administration.pagePermDeafenMembers() },
    { id: "MoveMembers", name: m.administration.pagePermMoveMembers() }
  ]);

  const buttonStyle = $derived(`background: ${$colorStore.primary}; color: ${$colorStore.onPrimary};`);
  const quietStyle = $derived(
    `background: ${$colorStore.primary}20; color: ${$colorStore.text}; border: 1px solid ${$colorStore.primary}30;`
  );

  function permissionName(id: string): string {
    return permissions.find(item => item.id === id)?.name ?? id;
  }

  async function load() {
    try {
      overrides = (await administrationApi.getPermissionOverrides(guildId)) ?? [];
    } catch (err) {
      logger.error("Failed to load permission overrides:", err);
      notify(errorText(err, m.administration.commandsLoadFailed()), "error");
    } finally {
      loading = false;
    }
  }

  async function save() {
    if (!draft?.command || busy) return;
    busy = true;
    try {
      await administrationApi.addPermissionOverride(guildId, { command: draft.command, permission: draft.permission });
      draft = null;
      notify(m.administration.commandsOverrideSaved(), "success");
      await load();
    } catch (err) {
      logger.error("Failed to save permission override:", err);
      notify(errorText(err, m.administration.commandsSaveFailed()), "error");
    } finally {
      busy = false;
    }
  }

  async function remove(override: PermissionOverride) {
    try {
      await administrationApi.removePermissionOverride(guildId, override.command);
      overrides = overrides.filter(item => item.command !== override.command);
      notify(m.administration.commandsOverrideRemoved(), "success");
    } catch (err) {
      logger.error("Failed to remove permission override:", err);
      notify(errorText(err, m.administration.commandsSaveFailed()), "error");
    }
  }

  async function clearAll() {
    const confirmed = await requestConfirmation({
      message: m.administration.automationPermissionOverridesClearAllCount({ count: overrides.length }),
      confirmText: m.common.clearAll()
    });
    if (!confirmed) return;
    try {
      await administrationApi.clearAllPermissionOverrides(guildId);
      overrides = [];
      notify(m.administration.commandsOverridesCleared(), "success");
    } catch (err) {
      logger.error("Failed to clear permission overrides:", err);
      notify(errorText(err, m.administration.commandsSaveFailed()), "error");
    }
  }

  void load();
</script>

{#snippet headerActions()}
  {#if overrides.length > 1}
    <button type="button" class="flex items-center justify-center gap-2 px-5 rounded-xl min-h-[50px] font-medium" style={quietStyle} onclick={clearAll}>
      {m.common.clearAll()}
    </button>
  {/if}
  <button
    type="button"
    class="flex items-center justify-center gap-2 px-5 rounded-xl min-h-[50px] font-medium"
    style={quietStyle}
    onclick={() => (draft = { command: null, permission: "Administrator" })}
  >
    <i class="fa-solid fa-plus" aria-hidden="true"></i>
    {m.common.add()}
  </button>
{/snippet}

<PluginCard title={m.administration.automationPermissionOverridesTitle()} actions={headerActions} alwaysOpen>
  {#if loading}
    <div class="flex justify-center py-6">
      <div class="w-10 h-10 border-4 rounded-full animate-spin" style="border-color: {$colorStore.primary}20; border-top-color: {$colorStore.primary}"></div>
    </div>
  {:else if overrides.length === 0}
    <p class="py-2" style="color: {$colorStore.muted}">{m.administration.automationPermissionOverridesEmptyTitle()}</p>
  {:else}
    <div class="space-y-2">
      {#each overrides as override (override.command)}
        <RemovableRow
          title={override.command}
          subtitle={m.administration.automationPermissionOverridesRequires({ permission: permissionName(override.permission) })}
          removeLabel={m.administration.commandsOverrideRemoveAria({ command: override.command })}
          onremove={() => remove(override)}
        />
      {/each}
    </div>
  {/if}
</PluginCard>

{#if draft}
  {@const form = draft}
  <Sheet title={m.administration.automationPermissionOverridesFormTitle()} onclose={() => (draft = null)}>
    <div class="space-y-1">
      <span class="block text-sm font-medium" style="color: {$colorStore.text}">{m.common.command()}</span>
      <DiscordSelector
        type="custom"
        customIcon="fa-bolt"
        ariaLabel={m.common.command()}
        options={commands}
        selected={form.command}
        clearable={false}
        placeholder={m.administration.automationPermissionOverridesCommandPlaceholder()}
        onchange={(detail) => (form.command = typeof detail.selected === "string" ? detail.selected : null)}
      />
    </div>
    <div class="space-y-1">
      <span class="block text-sm font-medium" style="color: {$colorStore.text}">{m.administration.automationPermissionOverridesRequiredPermission()}</span>
      <DiscordSelector
        type="custom"
        customIcon="fa-lock"
        ariaLabel={m.administration.automationPermissionOverridesRequiredPermission()}
        options={permissions}
        selected={form.permission}
        clearable={false}
        onchange={(detail) => (form.permission = typeof detail.selected === "string" ? detail.selected : "Administrator")}
      />
    </div>
    {#snippet footer()}
      <button type="button" class="px-5 rounded-xl min-h-[44px] font-medium" style={quietStyle} onclick={() => (draft = null)}>
        {m.common.cancel()}
      </button>
      <button type="button" class="px-5 rounded-xl min-h-[44px] font-medium disabled:opacity-50" style={buttonStyle} disabled={!form.command || busy} onclick={save}>
        {m.common.save()}
      </button>
    {/snippet}
  </Sheet>
{/if}
