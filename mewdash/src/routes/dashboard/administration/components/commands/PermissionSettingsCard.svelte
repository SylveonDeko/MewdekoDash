<script lang="ts">
  import { m } from "$lib/i18n";
  import { administrationApi } from "$lib/api/index.ts";
  import { colorStore } from "$lib/stores/colorStore";
  import { logger } from "$lib/logger";
  import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";
  import ToggleRow from "$lib/components/forms/ToggleRow.svelte";
  import PluginCard from "$lib/components/plugin/PluginCard.svelte";
  import { errorText, type TabProps } from "../toolsModel";

  type Props = Pick<TabProps, "guildId" | "roles" | "autoSave" | "notify">;

  let { guildId, roles, autoSave, notify }: Props = $props();

  let verbose = $state(false);
  let permissionRole = $state<string | null>(null);

  async function load() {
    try {
      const data = await administrationApi.getPermissions(guildId);
      verbose = !!data?.verbose;
      permissionRole = data?.permRole ? String(data.permRole) : null;
    } catch (err) {
      logger.error("Failed to load permission settings:", err);
      notify(errorText(err, m.administration.commandsLoadFailed()), "error");
    }
  }

  function saveVerbose(value: boolean) {
    const previous = verbose;
    verbose = value;
    autoSave.now("verbosePermissions", async () => {
      try {
        await administrationApi.setVerbosePermissions(guildId, value);
      } catch (err) {
        verbose = previous;
        throw err;
      }
    });
  }

  function saveRole(value: string | null) {
    if (value === permissionRole) return;
    const previous = permissionRole;
    permissionRole = value;
    autoSave.now("permissionRole", async () => {
      try {
        await administrationApi.setPermissionRole(guildId, value ?? "");
      } catch (err) {
        permissionRole = previous;
        throw err;
      }
    });
  }

  void load();
</script>

<PluginCard title={m.administration.commandsPermissionSettingsTitle()} alwaysOpen>
  <ToggleRow
    checked={verbose}
    title={m.administration.automationPermissionsManagementVerbosePermissions()}
    subtitle={m.administration.automationPermissionsManagementVerboseHint()}
    colors={$colorStore}
    onchange={saveVerbose}
  />
  <div class="space-y-1">
    <span class="block text-sm font-medium" style="color: {$colorStore.text}">{m.administration.automationPermissionsManagementPermissionRole()}</span>
    <DiscordSelector
      type="role"
      options={roles}
      selected={permissionRole}
      clearable
      placeholder={m.administration.automationPermissionsManagementNoPermissionRole()}
      onchange={(detail) => saveRole(typeof detail.selected === "string" ? detail.selected : null)}
    />
  </div>
</PluginCard>
