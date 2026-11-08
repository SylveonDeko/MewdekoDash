<script lang="ts">
  import { m } from "$lib/i18n";
  import { onMount } from "svelte";
  import { administrationApi } from "$lib/api/index.ts";
  import { logger } from "$lib/logger";
  import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";
  import SettingField from "$lib/components/forms/SettingField.svelte";
  import PluginCard from "$lib/components/plugin/PluginCard.svelte";
  import type { AutoSave } from "$lib/utils/autoSave.svelte";

  interface Props {
    guildId: bigint;
    roles: Array<{ id: string; name: string; color?: number }>;
    autoSave: AutoSave;
    onerror: (message: string) => void;
  }

  let { guildId, roles, autoSave, onerror }: Props = $props();

  let memberRoles: string[] = $state([]);
  let botRoles: string[] = $state([]);

  async function load() {
    try {
      const saved = await administrationApi.getAutoAssignRoles(guildId);
      memberRoles = saved.normalRoles.map(id => id.toString());
      botRoles = saved.botRoles.map(id => id.toString());
    } catch (err) {
      logger.error("Failed to load join roles:", err);
      onerror(err instanceof Error ? err.message : m.common.failedToSaveTheSettings());
    }
  }

  function save(bots: boolean, selection: string[]) {
    const previous = bots ? botRoles : memberRoles;
    if (bots) botRoles = selection;
    else memberRoles = selection;
    return autoSave.now(bots ? "joinRolesBots" : "joinRolesMembers", async () => {
      try {
        const ids = selection.map(id => BigInt(id));
        if (bots) await administrationApi.setBotAutoAssignRoles(guildId, ids);
        else await administrationApi.setAutoAssignRoles(guildId, ids);
      } catch (err) {
        if (bots) botRoles = previous;
        else memberRoles = previous;
        throw err;
      }
    });
  }

  onMount(() => {
    void load();
  });
</script>

<PluginCard title={m.multigreets.cardRolesTitle()}>
  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
    <SettingField label={m.multigreets.rolesMembers()} id="join-roles-members">
      <DiscordSelector
        id="join-roles-members"
        type="role"
        multiple={true}
        options={roles}
        selected={memberRoles}
        placeholder={m.administration.rolesAutoAssignNormalPlaceholder()}
        onchange={(detail) => save(false, Array.isArray(detail.selected) ? detail.selected : [])}
      />
    </SettingField>
    <SettingField label={m.multigreets.rolesBots()} id="join-roles-bots">
      <DiscordSelector
        id="join-roles-bots"
        type="role"
        multiple={true}
        options={roles}
        selected={botRoles}
        placeholder={m.administration.rolesAutoAssignBotPlaceholder()}
        onchange={(detail) => save(true, Array.isArray(detail.selected) ? detail.selected : [])}
      />
    </SettingField>
  </div>
</PluginCard>
