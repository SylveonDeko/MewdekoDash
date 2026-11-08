<!-- routes/dashboard/invites/+page.svelte -->
<script lang="ts">
  import { m } from "$lib/i18n";
  import { goto } from "$app/navigation";
  import { fade } from "svelte/transition";
  import { clientApi, inviteRolesApi, inviteTrackingApi, type InviteRolesConfig, type InviteTrackingSettings } from "$lib/api/index.ts";
  import { currentGuild } from "$lib/stores/currentGuild.ts";
  import { currentInstance } from "$lib/stores/instanceStore.ts";
  import { colorStore } from "$lib/stores/colorStore.ts";
  import { logger } from "$lib/logger.ts";
  import { createAutoSave } from "$lib/utils/autoSave.svelte";
  import Notification from "$lib/components/ui/Notification.svelte";
  import PluginPage from "$lib/components/plugin/PluginPage.svelte";
  import SettingsCard from "./components/SettingsCard.svelte";
  import RolesCard from "./components/RolesCard.svelte";
  import OverviewCard from "./components/OverviewCard.svelte";
  import LeaderboardCard from "./components/LeaderboardCard.svelte";
  import InvitedCard from "./components/InvitedCard.svelte";
  import CodesCard from "./components/CodesCard.svelte";
  import ExclusionsCard from "./components/ExclusionsCard.svelte";
  import MaintenanceCard from "./components/MaintenanceCard.svelte";
  import MemberSheet from "./components/MemberSheet.svelte";
  import { errorText, timeSpanToDays, type Member, type Named, type Role } from "./components/inviteModel";

  let members: Member[] = $state([]);
  let roles: Role[] = $state([]);
  let channels: Named[] = $state([]);
  let settings: InviteTrackingSettings | null = $state(null);
  let minAgeDays = $state(0);
  let roleConfig: InviteRolesConfig | null = $state(null);
  let memberId: string | null = $state(null);
  let boardVersion = $state(0);
  let showNotification = $state(false);
  let notificationMessage = $state("");
  let notificationType: "success" | "error" = $state("success");
  let loadedGuildId = "";

  const autoSave = createAutoSave({
    onError: (err) => notify(errorText(err, m.invites.notifySaveFailed()), "error")
  });

  let guildId = $derived($currentGuild?.id ? BigInt($currentGuild.id) : null);
  const memberName = $derived(memberId ? (members.find(member => member.id === memberId)?.name ?? memberId) : "");

  function notify(message: string, type: "success" | "error" = "success") {
    notificationMessage = message;
    notificationType = type;
    showNotification = true;
    setTimeout(() => {
      showNotification = false;
    }, 3000);
  }

  async function loadGuildData(id: bigint) {
    const results = await Promise.allSettled([
      clientApi.getMembers(id).then(list => {
        members = list.map((x: any) => ({ id: x.id.toString(), name: x.username, avatarUrl: x.avatarUrl }));
      }),
      clientApi.getRoles(id).then(list => {
        roles = list.map((x: any) => ({ id: x.id.toString(), name: x.name, color: x.color }));
      }),
      clientApi.getTextChannels(id).then(list => {
        channels = list.map(x => ({ id: x.id.toString(), name: x.name }));
      }),
      inviteTrackingApi.getInviteSettings(id).then(value => {
        settings = value;
        minAgeDays = timeSpanToDays(value.minAccountAge);
      }),
      inviteRolesApi.get(id).then(value => (roleConfig = value))
    ]);
    for (const result of results) {
      if (result.status === "rejected") logger.error("Failed to load invite data:", result.reason);
    }
  }

  function patchSetting<K extends keyof InviteTrackingSettings>(
    key: K,
    value: InviteTrackingSettings[K],
    save: (id: bigint) => Promise<unknown>
  ) {
    const id = guildId;
    if (!id || !settings) return;
    const previous = settings[key];
    settings = { ...settings, [key]: value };
    void autoSave.now(`setting:${key}`, async () => {
      try {
        await save(id);
      } catch (err) {
        if (guildId === id && settings) settings = { ...settings, [key]: previous };
        throw err;
      }
    });
  }

  function setFlag(key: "removeInviteOnLeave" | "countRejoins" | "fakeOnNoAvatar", value: boolean) {
    const calls = {
      removeInviteOnLeave: (id: bigint) => inviteTrackingApi.setRemoveOnLeave(id, value),
      countRejoins: (id: bigint) => inviteTrackingApi.setCountRejoins(id, value),
      fakeOnNoAvatar: (id: bigint) => inviteTrackingApi.setFakeOnNoAvatar(id, value)
    };
    patchSetting(key, value, calls[key]);
  }

  function setChannel(key: "linkChannelId" | "logChannelId", value: string | null) {
    const target = value ? BigInt(value) : null;
    patchSetting(key, target, id =>
      key === "linkChannelId" ? inviteTrackingApi.setLinkChannel(id, target) : inviteTrackingApi.setLogChannel(id, target)
    );
  }

  function setMinAge(days: number) {
    const id = guildId;
    if (!id) return;
    const previous = minAgeDays;
    minAgeDays = days;
    autoSave.schedule("minAge", async () => {
      try {
        await inviteTrackingApi.setMinAccountAge(id, `${days}.00:00:00`);
      } catch (err) {
        if (guildId === id) minAgeDays = previous;
        throw err;
      }
    });
  }

  function toggleTracking(enabled: boolean) {
    patchSetting("isEnabled", enabled, id => inviteTrackingApi.toggleInviteTracking(id, enabled));
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
    const key = `${$currentGuild.id}:${$currentInstance?.port ?? ""}`;
    if (loadedGuildId !== key) {
      loadedGuildId = key;
      settings = null;
      roleConfig = null;
      void loadGuildData(BigInt($currentGuild.id));
    }
  });
</script>

<svelte:head>
  <title>{m.features.wizardInvitetrackingName()}</title>
</svelte:head>

{#snippet statusMessages()}
  {#if showNotification}
    <div class="fixed top-4 right-4 z-50" transition:fade>
      <Notification message={notificationMessage} type={notificationType} />
    </div>
  {/if}
{/snippet}

<PluginPage
  {statusMessages}
  {autoSave}
  icon="fa-user-plus"
  guildName={$currentGuild?.name || m.common.dashboard()}
  title={m.features.wizardInvitetrackingName()}
  subtitle={m.invites.pageSubtitle()}
  enabled={settings?.isEnabled}
  onToggle={toggleTracking}
>
  {#if guildId}
    {#key guildId}
      <div class="space-y-4 min-w-0">
        {#if settings}
          <SettingsCard {settings} {minAgeDays} {channels} onflag={setFlag} onchannel={setChannel} onminage={setMinAge} />
        {:else}
          <div class="flex justify-center py-6">
            <div class="w-10 h-10 border-4 rounded-full animate-spin" style="border-color: {$colorStore.primary}20; border-top-color: {$colorStore.primary}"></div>
          </div>
        {/if}
        <RolesCard
          {guildId}
          bind:config={roleConfig}
          {roles}
          {autoSave}
          onerror={(message) => notify(message, "error")}
          onsuccess={(message) => notify(message)}
        />
        <OverviewCard {guildId} onmember={(id) => (memberId = id)} onerror={(message) => notify(message, "error")} />
        <LeaderboardCard
          {guildId}
          {members}
          {roles}
          version={boardVersion}
          onmember={(id) => (memberId = id)}
          onerror={(message) => notify(message, "error")}
        />
        <InvitedCard {guildId} {members} onerror={(message) => notify(message, "error")} />
        <CodesCard {guildId} {members} {roles} {channels} {autoSave} onerror={(message) => notify(message, "error")} />
        <ExclusionsCard {guildId} {members} {roles} {autoSave} onerror={(message) => notify(message, "error")} />
        <MaintenanceCard
          {guildId}
          onchanged={() => boardVersion++}
          onerror={(message) => notify(message, "error")}
          onsuccess={(message) => notify(message)}
        />
      </div>

      {#if memberId}
        {#key memberId}
          <MemberSheet
            {guildId}
            userId={memberId}
            name={memberName}
            onchanged={() => boardVersion++}
            onclose={() => (memberId = null)}
            onerror={(message) => notify(message, "error")}
          />
        {/key}
      {/if}
    {/key}
  {/if}
</PluginPage>
