<script lang="ts">
  import { m } from "$lib/i18n";
  import {
    twitchApi,
    type TwitchChatCommandResponse,
    type TwitchCustomCommandResponse,
    type TwitchVariableDocsResponse
  } from "$lib/api/index.ts";
  import { colorStore } from "$lib/stores/colorStore";
  import { logger } from "$lib/logger";
  import { requestConfirmation } from "$lib/stores/confirmationStore";
  import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";
  import SettingField from "$lib/components/forms/SettingField.svelte";
  import ToggleRow from "$lib/components/forms/ToggleRow.svelte";
  import PluginCard from "$lib/components/plugin/PluginCard.svelte";
  import AlertRow from "../AlertRow.svelte";
  import Sheet from "$lib/components/ui/Sheet.svelte";
  import Button from "./Button.svelte";
  import Input from "./Input.svelte";
  import type { Notify } from "./twitchModel";

  interface Props {
    guildId: bigint;
    prefix: string;
    notify: Notify;
    onhealth: () => void;
  }

  let { guildId, prefix, notify, onhealth }: Props = $props();

  const fallbackVariables = ["%user%", "%display%", "%channel%", "%args%", "%target%", "%discord%", "%random:yes|no%", "%count:name%", "%stream%"];

  const blank = () => ({ name: "", response: "", permission: "Everyone", cooldownSeconds: 0, enabled: true, testArgs: "" });

  let commands: TwitchCustomCommandResponse[] = $state([]);
  let chatCommands: TwitchChatCommandResponse[] = $state([]);
  let variableDocs = $state<TwitchVariableDocsResponse | null>(null);
  let loading = $state(true);
  let form = $state<ReturnType<typeof blank> | null>(null);
  let busy = $state(false);
  let preview = $state("");

  const variables = $derived(variableDocs?.groups.custom_commands ?? fallbackVariables);

  const permissionOptions = $derived([
    { id: "Everyone", name: m.common.everyone() },
    { id: "Subscriber", name: m.twitch.permSubscriber() },
    { id: "Vip", name: m.twitch.permVip() },
    { id: "Mod", name: m.twitch.permMod() },
    { id: "Broadcaster", name: m.twitch.permBroadcaster() }
  ]);

  const slashCommands = $derived([
    { name: "/twitch set", usage: "<channel> [prefix]", description: m.twitch.slashSetDescription(), permission: m.common.manageServer() },
    { name: "/twitch remove", usage: "", description: m.twitch.slashRemoveDescription(), permission: m.common.manageServer() },
    { name: "/twitch config", usage: "", description: m.twitch.slashConfigDescription(), permission: m.common.everyone() },
    { name: "/twitch golive-channel", usage: "<channel> [message]", description: m.twitch.slashGoliveChannelDescription(), permission: m.common.manageServer() },
    { name: "/twitch golive-clear", usage: "", description: m.twitch.slashGoliveClearDescription(), permission: m.common.manageServer() },
    { name: "/twitch link", usage: "<user> <twitchUsername>", description: m.twitch.slashLinkDescription(), permission: m.common.manageServer() },
    { name: "/twitch unlink", usage: "<user>", description: m.twitch.slashUnlinkDescription(), permission: m.common.manageServer() },
    { name: "/twitch links", usage: "", description: m.twitch.slashLinksDescription(), permission: m.common.everyone() },
    { name: "/twitch language", usage: "<languageTag>", description: m.twitch.slashLanguageDescription(), permission: m.common.manageServer() },
    { name: "/twitch prefix", usage: "<prefix>", description: m.twitch.slashPrefixDescription(), permission: m.common.manageServer() }
  ]);

  function escapeHtml(value: string): string {
    return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  async function load() {
    try {
      [commands, chatCommands, variableDocs] = await Promise.all([
        twitchApi.getCustomCommands(guildId).catch(() => []),
        twitchApi.getChatCommands().catch(() => []),
        twitchApi.getVariables().catch(() => null)
      ]);
    } finally {
      loading = false;
    }
  }

  function edit(command: TwitchCustomCommandResponse) {
    preview = "";
    form = {
      name: command.name,
      response: command.response,
      permission: command.permission,
      cooldownSeconds: command.cooldownSeconds,
      enabled: command.enabled,
      testArgs: ""
    };
  }

  function startNew() {
    preview = "";
    form = blank();
  }

  async function save() {
    if (!form || !form.name.trim() || !form.response.trim()) return;
    busy = true;
    try {
      await twitchApi.saveCustomCommand(guildId, {
        name: form.name.trim(),
        response: form.response,
        permission: form.permission,
        cooldownSeconds: Number(form.cooldownSeconds) || 0,
        enabled: form.enabled
      });
      notify(m.twitch.notifyCommandSaved());
      form = null;
      await load();
    } catch (err) {
      logger.error("Failed to save Twitch command:", err);
      notify(m.twitch.notifyCommandSaveFailed(), "error");
    } finally {
      busy = false;
    }
  }

  async function remove(name: string) {
    const confirmed = await requestConfirmation({
      message: m.twitch.confirmRemoveCommand({ command: `${prefix}${name}` }),
      confirmText: m.common.remove()
    });
    if (!confirmed) return;
    try {
      await twitchApi.removeCustomCommand(guildId, name);
      notify(m.twitch.notifyCommandRemoved());
      await load();
    } catch (err) {
      logger.error("Failed to remove Twitch command:", err);
      notify(m.twitch.notifyCommandRemoveFailed(), "error");
    }
  }

  async function test() {
    if (!form || !form.name.trim()) return;
    busy = true;
    try {
      const result = await twitchApi.previewCustomCommand(guildId, { name: form.name.trim(), args: form.testArgs || null });
      preview = result.response;
      notify(m.twitch.notifyCommandRendered());
      onhealth();
    } catch (err) {
      logger.error("Failed to preview Twitch command:", err);
      notify(m.twitch.notifyCommandPreviewFailed(), "error");
    } finally {
      busy = false;
    }
  }

  void load();
</script>

{#snippet newButton()}
  <Button variant="quiet" onclick={startNew}>
    <i class="fa-solid fa-plus" aria-hidden="true"></i>
    {m.common.add()}
  </Button>
{/snippet}

<PluginCard title={m.common.customCommands()} actions={newButton} alwaysOpen>
  {#if loading}
    <div class="flex justify-center py-6">
      <div class="w-10 h-10 border-4 rounded-full animate-spin" style="border-color: {$colorStore.primary}20; border-top-color: {$colorStore.primary}"></div>
    </div>
  {:else if commands.length === 0}
    <p class="py-4 text-center" style="color: {$colorStore.muted}">{m.twitch.commandEmpty()}</p>
  {:else}
    <div class="space-y-2">
      {#each commands as command (command.id)}
        <AlertRow
          title={`${prefix}${command.name}`}
          subtitle={command.response}
          removeLabel={m.common.remove()}
          badges={[command.permission, ...(command.enabled ? [] : [m.common.disabled()])]}
          onopen={() => edit(command)}
          onremove={() => remove(command.name)}
        />
      {/each}
    </div>
  {/if}
</PluginCard>

<PluginCard title={m.common.commandReference()} alwaysOpen>
  <p class="text-sm font-medium" style="color: {$colorStore.text}">{m.twitch.commandChatTitle()}</p>
  <p class="text-sm" style="color: {$colorStore.muted}">{@html m.twitch.commandChatHint({ prefix: escapeHtml(prefix) })}</p>
  {#if chatCommands.length === 0}
    <p class="text-sm" style="color: {$colorStore.muted}">{m.twitch.commandChatEmpty()}</p>
  {:else}
    <div class="flex flex-wrap gap-2">
      {#each chatCommands as command (command.name)}
        <span class="text-sm px-3 py-1.5 rounded-lg font-mono" style="background: {$colorStore.primary}12; color: {$colorStore.text};">
          {prefix}{command.name} <span style="color: {$colorStore.muted}">{command.permission}</span>
        </span>
      {/each}
    </div>
  {/if}
  <p class="text-sm font-medium pt-2" style="color: {$colorStore.text}">{m.twitch.commandSlashTitle()}</p>
  <p class="text-sm" style="color: {$colorStore.muted}">{@html m.twitch.commandSlashHint()}</p>
  <div class="space-y-2">
    {#each slashCommands as command (command.name)}
      <div class="rounded-xl border p-3 min-w-0" style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}20;">
        <p class="text-sm font-mono break-words" style="color: {$colorStore.text}">
          {command.name} <span style="color: {$colorStore.muted}">{command.usage}</span>
        </p>
        <p class="text-sm" style="color: {$colorStore.muted}">{command.description} · {command.permission}</p>
      </div>
    {/each}
  </div>
</PluginCard>

{#if form}
  {@const draft = form}
  <Sheet title={m.twitch.commandEditorTitle()} size="lg" onclose={() => (form = null)}>
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div class="min-w-0">
        <SettingField label={m.common.command()} id="tw-cmd-name">
          <Input id="tw-cmd-name" bind:value={draft.name} placeholder={m.common.helloPlaceholder()} />
        </SettingField>
      </div>
      <div class="min-w-0">
        <ToggleRow checked={draft.enabled} title={m.common.enabled()} colors={$colorStore} onchange={(value) => (draft.enabled = value)} />
      </div>
      <div class="space-y-1 min-w-0">
        <span class="block text-sm font-medium" style="color: {$colorStore.text}">{m.common.permission()}</span>
        <DiscordSelector
          type="custom"
          customIcon="fa-lock"
          searchable={false}
          clearable={false}
          ariaLabel={m.common.permission()}
          options={permissionOptions}
          selected={draft.permission}
          onchange={(detail) => (draft.permission = typeof detail.selected === "string" ? detail.selected : "Everyone")}
        />
      </div>
      <div class="min-w-0">
        <SettingField label={m.twitch.commandCooldown()} id="tw-cmd-cooldown">
          <Input id="tw-cmd-cooldown" type="number" min={0} max={86400} bind:value={draft.cooldownSeconds} />
        </SettingField>
      </div>
    </div>
    <SettingField label={m.twitch.commandResponse()} id="tw-cmd-response">
      <Input id="tw-cmd-response" rows={4} bind:value={draft.response} placeholder={m.twitch.commandResponsePlaceholder()} />
    </SettingField>
    <div class="flex flex-wrap gap-2">
      {#each variables as variable (variable)}
        <button
          type="button"
          class="rounded-full px-3 min-h-[44px] font-mono text-xs"
          style="background: {$colorStore.primary}12; color: {$colorStore.text};"
          onclick={() => (draft.response = `${draft.response}${variable}`)}
        >{variable}</button>
      {/each}
    </div>
    <div class="flex flex-col sm:flex-row gap-3">
      <div class="grow min-w-0">
        <Input bind:value={draft.testArgs} label={m.twitch.commandTestArgs()} placeholder={m.twitch.commandTestArgsPlaceholder()} />
      </div>
      <Button disabled={busy || !draft.name.trim()} onclick={test}>
        {busy ? m.twitch.commandTesting() : m.twitch.commandTest()}
      </Button>
    </div>
    {#if preview}
      <p class="p-3 rounded-lg break-words" style="background: {$colorStore.primary}08; color: {$colorStore.text};">{preview}</p>
    {/if}
    {#snippet footer()}
      <Button compact onclick={() => (form = null)}>{m.common.cancel()}</Button>
      <Button compact variant="primary" disabled={busy || !draft.name.trim() || !draft.response.trim()} onclick={save}>
        {busy ? m.common.saving() : m.twitch.commandSave()}
      </Button>
    {/snippet}
  </Sheet>
{/if}
