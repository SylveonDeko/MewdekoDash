<!-- routes/dashboard/access/+page.svelte -->
<script lang="ts">
  import { m } from "$lib/i18n";
  import { goto } from "$app/navigation";
  import { fade } from "svelte/transition";
  import { clientApi, dashboardAccessApi } from "$lib/api/index.ts";
  import type {
    DashboardAccessGrant,
    DashboardAccessManager,
    DashboardAccessSettings
  } from "$lib/api/dashboardaccess/models";
  import { currentGuild } from "$lib/stores/currentGuild.ts";
  import { currentInstance } from "$lib/stores/instanceStore.ts";
  import { colorStore } from "$lib/stores/colorStore.ts";
  import { logger } from "$lib/logger.ts";
  import { createAutoSave } from "$lib/utils/autoSave.svelte";
  import Notification from "$lib/components/ui/Notification.svelte";
  import PluginPage from "$lib/components/plugin/PluginPage.svelte";
  import PluginCard from "$lib/components/plugin/PluginCard.svelte";
  import ToggleRow from "$lib/components/forms/ToggleRow.svelte";
  import ManagersCard from "./components/ManagersCard.svelte";
  import GrantsCard from "./components/GrantsCard.svelte";
  import { errorText, type Named } from "./components/accessModel";

  let loading = $state(true);
  let settings: DashboardAccessSettings | null = $state(null);
  let managers: DashboardAccessManager[] = $state([]);
  let grants: DashboardAccessGrant[] = $state([]);
  let roles: Named[] = $state([]);
  let members: Named[] = $state([]);
  let showNotification = $state(false);
  let notificationMessage = $state("");
  let notificationType: "success" | "error" = $state("success");
  let loadedGuildId = "";

  const autoSave = createAutoSave({
    onError: (err) => notify(errorText(err, m.common.notifyUpdateFailed()), "error")
  });

  let guildId = $derived($currentGuild?.id ? BigInt($currentGuild.id) : null);

  function notify(message: string, type: "success" | "error" = "success") {
    notificationMessage = message;
    notificationType = type;
    showNotification = true;
    setTimeout(() => {
      showNotification = false;
    }, 3000);
  }

  async function loadGuildData(id: bigint) {
    loading = true;
    try {
      const [loadedSettings, loadedRoles, loadedMembers] = await Promise.all([
        dashboardAccessApi.getSettings(id),
        clientApi.getRoles(id),
        clientApi.getMembers(id)
      ]);
      roles = loadedRoles.map((r) => ({ id: r.id, name: r.name }));
      members = loadedMembers.map((u) => ({ id: u.id, name: u.displayName || u.username }));
      grants = loadedSettings.canManageAccess ? await dashboardAccessApi.getGrants(id) : [];
      managers = loadedSettings.isGuildOwner ? await dashboardAccessApi.getManagers(id) : [];
      settings = loadedSettings;
    } catch (err) {
      logger.error("Failed to load dashboard access data:", err);
      notify(errorText(err, m.access.errorLoad()), "error");
    } finally {
      loading = false;
    }
  }

  function setDelegation(value: boolean) {
    const id = guildId;
    if (!id || !settings) return;
    const previous = settings.adminsCanManageAccess;
    settings.adminsCanManageAccess = value;
    void autoSave.now("delegation", async () => {
      try {
        await dashboardAccessApi.updateSettings(id, value);
        notify(value ? m.access.notifyAdminsCanManage() : m.access.notifyAdminsCannotManage());
      } catch (err) {
        if (settings && guildId === id) settings.adminsCanManageAccess = previous;
        throw err;
      }
    });
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
      settings = null;
      void loadGuildData(BigInt($currentGuild.id));
    }
  });
</script>

{#snippet statusMessages()}
  {#if showNotification}
    <div class="fixed top-4 right-4 z-[10001]" transition:fade>
      <Notification message={notificationMessage} type={notificationType} />
    </div>
  {/if}
{/snippet}

<PluginPage
  {statusMessages}
  {autoSave}
  icon="fa-key"
  guildName={$currentGuild?.name || m.common.dashboard()}
  title={m.features.accessName()}
  subtitle={m.access.pageSubtitle()}
>
  {#if guildId}
    {#key guildId}
      {#if loading}
        <div class="flex justify-center items-center min-h-[240px]">
          <div
            class="w-10 h-10 border-4 rounded-full animate-spin"
            style="border-color: {$colorStore.primary}30; border-top-color: {$colorStore.primary};"
            role="status"
            aria-label={m.common.loading()}
          ></div>
        </div>
      {:else if !settings?.canManageAccess}
        <PluginCard title={m.access.deniedTitle()} alwaysOpen>
          <p class="text-sm" style="color: {$colorStore.muted}">{m.access.deniedHint()}</p>
        </PluginCard>
      {:else}
        <div class="space-y-4 min-w-0">
          {#if settings.isGuildOwner}
            <PluginCard title={m.access.delegationHeading()} alwaysOpen>
              <ToggleRow
                checked={settings.adminsCanManageAccess}
                title={m.access.delegationToggleLabel()}
                colors={$colorStore}
                onchange={setDelegation}
              />
            </PluginCard>
            <ManagersCard
              {guildId}
              bind:managers
              {roles}
              {members}
              onerror={(message) => notify(message, "error")}
              onsuccess={(message) => notify(message)}
            />
          {/if}
          <GrantsCard
            {guildId}
            bind:grants
            {roles}
            {members}
            onerror={(message) => notify(message, "error")}
            onsuccess={(message) => notify(message)}
          />
        </div>
      {/if}
    {/key}
  {/if}
</PluginPage>
