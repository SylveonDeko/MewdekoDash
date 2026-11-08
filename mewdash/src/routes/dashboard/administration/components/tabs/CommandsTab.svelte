<script lang="ts">
  import { m } from "$lib/i18n";
  import { administrationApi, type Module } from "$lib/api/index.ts";
  import { logger } from "$lib/logger";
  import CommandCooldownsCard from "../commands/CommandCooldownsCard.svelte";
  import PermissionOverridesCard from "../commands/PermissionOverridesCard.svelte";
  import PermissionSettingsCard from "../commands/PermissionSettingsCard.svelte";
  import PermissionRulesCard from "../commands/PermissionRulesCard.svelte";
  import { errorText, type TabProps } from "../toolsModel";

  let { guildId, textChannels, roles, autoSave, notify }: TabProps = $props();

  let modules = $state<Module[]>([]);

  const commands = $derived(
    [...new Set(modules.flatMap(mod => mod.commands.map(command => command.commandName)))]
      .sort((a, b) => a.localeCompare(b))
      .map(name => ({ id: name, name }))
  );

  async function load() {
    try {
      modules = (await administrationApi.getCommandsAndModules(guildId)) ?? [];
    } catch (err) {
      logger.error("Failed to load command list:", err);
      notify(errorText(err, m.administration.commandsLoadFailed()), "error");
    }
  }

  void load();
</script>

<div class="w-full space-y-6">
  <CommandCooldownsCard {guildId} {commands} {notify} />
  <PermissionOverridesCard {guildId} {commands} {notify} />
  <PermissionSettingsCard {guildId} {roles} {autoSave} {notify} />
  <PermissionRulesCard {guildId} {textChannels} {roles} {notify} {modules} />
</div>
