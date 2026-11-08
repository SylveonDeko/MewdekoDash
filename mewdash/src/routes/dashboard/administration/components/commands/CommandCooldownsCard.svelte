<script lang="ts">
  import { m } from "$lib/i18n";
  import { administrationApi, type CommandCooldown } from "$lib/api/index.ts";
  import { colorStore } from "$lib/stores/colorStore";
  import { logger } from "$lib/logger";
  import { requestConfirmation } from "$lib/stores/confirmationStore";
  import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";
  import SettingField from "$lib/components/forms/SettingField.svelte";
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

  let cooldowns = $state<CommandCooldown[]>([]);
  let loading = $state(true);
  let busy = $state(false);
  let draft = $state<{ command: string | null; seconds: number } | null>(null);

  const buttonStyle = $derived(`background: ${$colorStore.primary}; color: ${$colorStore.onPrimary};`);
  const quietStyle = $derived(
    `background: ${$colorStore.primary}20; color: ${$colorStore.text}; border: 1px solid ${$colorStore.primary}30;`
  );

  async function load() {
    try {
      cooldowns = (await administrationApi.getCommandCooldowns(guildId)) ?? [];
    } catch (err) {
      logger.error("Failed to load command cooldowns:", err);
      notify(errorText(err, m.administration.commandsLoadFailed()), "error");
    } finally {
      loading = false;
    }
  }

  async function save() {
    if (!draft?.command || draft.seconds < 1 || busy) return;
    busy = true;
    try {
      await administrationApi.setCommandCooldown(guildId, draft.command, draft.seconds);
      draft = null;
      notify(m.administration.commandsCooldownSaved(), "success");
      await load();
    } catch (err) {
      logger.error("Failed to save command cooldown:", err);
      notify(errorText(err, m.administration.commandsSaveFailed()), "error");
    } finally {
      busy = false;
    }
  }

  async function remove(cooldown: CommandCooldown) {
    const confirmed = await requestConfirmation({
      message: m.administration.commandsCooldownRemoveConfirm({ command: cooldown.commandName }),
      confirmText: m.common.remove()
    });
    if (!confirmed) return;
    try {
      await administrationApi.removeCommandCooldown(guildId, cooldown.commandName);
      cooldowns = cooldowns.filter(item => item.commandName !== cooldown.commandName);
      notify(m.administration.commandsCooldownRemoved(), "success");
    } catch (err) {
      logger.error("Failed to remove command cooldown:", err);
      notify(errorText(err, m.administration.commandsSaveFailed()), "error");
    }
  }

  void load();
</script>

{#snippet addButton()}
  <button
    type="button"
    class="flex items-center justify-center gap-2 px-5 rounded-xl min-h-[50px] font-medium"
    style={quietStyle}
    onclick={() => (draft = { command: null, seconds: 5 })}
  >
    <i class="fa-solid fa-plus" aria-hidden="true"></i>
    {m.common.add()}
  </button>
{/snippet}

<PluginCard title={m.administration.automationCommandCooldownsTitle()} actions={addButton} alwaysOpen>
  {#if loading}
    <div class="flex justify-center py-6">
      <div class="w-10 h-10 border-4 rounded-full animate-spin" style="border-color: {$colorStore.primary}20; border-top-color: {$colorStore.primary}"></div>
    </div>
  {:else if cooldowns.length === 0}
    <p class="py-2" style="color: {$colorStore.muted}">{m.administration.automationCommandCooldownsEmptyTitle()}</p>
  {:else}
    <div class="space-y-2">
      {#each cooldowns as cooldown (cooldown.commandName)}
        <RemovableRow
          title={cooldown.commandName}
          subtitle={m.administration.automationCommandCooldownsSeconds({ seconds: cooldown.seconds })}
          removeLabel={m.administration.automationCommandCooldownsRemoveAria({ command: cooldown.commandName })}
          onremove={() => remove(cooldown)}
        />
      {/each}
    </div>
  {/if}
</PluginCard>

{#if draft}
  {@const form = draft}
  <Sheet title={m.administration.automationCommandCooldownsFormTitle()} onclose={() => (draft = null)}>
    <div class="space-y-1">
      <span class="block text-sm font-medium" style="color: {$colorStore.text}">{m.common.command()}</span>
      <DiscordSelector
        type="custom"
        customIcon="fa-bolt"
        ariaLabel={m.common.command()}
        options={commands}
        selected={form.command}
        clearable={false}
        placeholder={m.administration.automationCommandCooldownsCommandPlaceholder()}
        onchange={(detail) => (form.command = typeof detail.selected === "string" ? detail.selected : null)}
      />
    </div>
    <SettingField label={m.common.cooldownSeconds()} id="cooldown-seconds">
      <input
        id="cooldown-seconds"
        type="number"
        min="1"
        max="90000"
        inputmode="numeric"
        value={form.seconds}
        oninput={(e) => (form.seconds = Math.min(90000, Math.max(1, Math.floor(Number(e.currentTarget.value)) || 1)))}
        class="w-full p-3 rounded-lg border focus:ring-2 min-h-[50px]"
        style="background: {$colorStore.primary}10; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
      >
    </SettingField>
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
