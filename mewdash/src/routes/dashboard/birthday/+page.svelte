<!-- routes/dashboard/birthday/+page.svelte -->
<script lang="ts">
  import { m } from "$lib/i18n";
  import { goto } from "$app/navigation";
  import { fade } from "svelte/transition";
  import type { PageData } from "./$types";
  import { birthdayApi, clientApi, type BirthdayStats, type BirthdayUser } from "$lib/api/index.ts";
  import { currentGuild } from "$lib/stores/currentGuild.ts";
  import { currentInstance } from "$lib/stores/instanceStore.ts";
  import { colorStore } from "$lib/stores/colorStore.ts";
  import { logger } from "$lib/logger.ts";
  import { requestConfirmation } from "$lib/stores/confirmationStore";
  import { createAutoSave } from "$lib/utils/autoSave.svelte";
  import Notification from "$lib/components/ui/Notification.svelte";
  import PluginPage from "$lib/components/plugin/PluginPage.svelte";
  import AnnouncementsCard from "./components/AnnouncementsCard.svelte";
  import RolesCard from "./components/RolesCard.svelte";
  import TimeCard from "./components/TimeCard.svelte";
  import MembersCard from "./components/MembersCard.svelte";
  import StatsCard from "./components/StatsCard.svelte";
  import {
    errorText,
    Feature,
    hasFeature,
    senders,
    toForm,
    type FeatureBit,
    type Form,
    type Member,
    type Named,
    type Role,
    type SaveMode
  } from "./components/birthdayModel";

  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();

  let form: Form | null = $state(null);
  let channels: Named[] = $state([]);
  let roles: Role[] = $state([]);
  let members: Member[] = $state([]);
  let users: BirthdayUser[] = $state([]);
  let upcoming: BirthdayUser[] = $state([]);
  let today: BirthdayUser[] = $state([]);
  let stats: BirthdayStats | null = $state(null);
  let days = $state(7);
  let showNotification = $state(false);
  let notificationMessage = $state("");
  let notificationType: "success" | "error" = $state("success");
  let loadedGuildId = "";
  let saved: Form | null = null;

  const autoSave = createAutoSave({
    onError: (err) => notify(errorText(err, m.birthday.notifySaveFailedUndone()), "error")
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

  async function loadPeople(id: bigint) {
    const [userList, upcomingList, todayList, statList] = await Promise.all([
      birthdayApi.getBirthdayUsers(id).catch(() => []),
      birthdayApi.getBirthdayUpcoming(id, days).catch(() => []),
      birthdayApi.getBirthdayToday(id).catch(() => []),
      birthdayApi.getBirthdayStats(id).catch(() => null)
    ]);
    users = userList;
    upcoming = upcomingList;
    today = todayList;
    stats = statList;
  }

  async function loadConfig(id: bigint) {
    const config = await birthdayApi.getBirthdayConfig(id);
    form = toForm(config);
    saved = { ...form };
  }

  async function loadGuildData(id: bigint) {
    const results = await Promise.allSettled([
      loadConfig(id),
      loadPeople(id),
      clientApi.getTextChannels(id).then(list => (channels = list.map(x => ({ id: x.id.toString(), name: x.name })))),
      clientApi.getRoles(id).then(list => {
        roles = (list as any[])
          .filter(role => role.id.toString() !== id.toString() && !role.managed && !role.name.startsWith("@"))
          .map(role => ({ id: role.id.toString(), name: role.name, color: role.color || 0 }))
          .sort((a, b) => a.name.localeCompare(b.name));
      }),
      clientApi.getMembers(id).then(list => {
        members = list.map((x: any) => ({ id: x.id.toString(), name: x.username, avatarUrl: x.avatarUrl }));
      })
    ]);
    for (const result of results) {
      if (result.status === "rejected") logger.error("Failed to load birthday data:", result.reason);
    }
    if (results[0].status === "rejected") notify(m.birthday.notifyLoadFailed(), "error");
  }

  function change<K extends Exclude<keyof Form, "features">>(key: K, value: Form[K], mode: SaveMode = "now") {
    const id = guildId;
    if (!id || !form || !saved) return;
    const previous = saved[key];
    form = { ...form, [key]: value };
    const run = async () => {
      try {
        await senders[key](id, value);
        if (saved) saved[key] = value;
      } catch (err) {
        if (mode === "now" && guildId === id && form) form = { ...form, [key]: previous };
        throw err;
      }
    };
    if (mode === "now") void autoSave.now(key, run);
    else autoSave.schedule(key, run);
  }

  function setFeature(bit: FeatureBit, enabled: boolean) {
    const id = guildId;
    if (!id || !form) return;
    const flip = (on: boolean) => {
      if (!form) return;
      form = { ...form, features: on ? form.features | bit : form.features & ~bit };
    };
    flip(enabled);
    void autoSave.now(`feature:${bit}`, async () => {
      try {
        if (enabled) await birthdayApi.enableBirthdayFeature(id, bit);
        else await birthdayApi.disableBirthdayFeature(id, bit);
      } catch (err) {
        if (guildId === id) flip(!enabled);
        throw err;
      }
    });
  }

  async function changeDays(next: number) {
    days = next;
    if (guildId) upcoming = await birthdayApi.getBirthdayUpcoming(guildId, next).catch(() => []);
  }

  async function reset() {
    const id = guildId;
    if (!id) return;
    const confirmed = await requestConfirmation({ message: m.birthday.resetConfirm(), confirmText: m.common.reset() });
    if (!confirmed) return;
    try {
      await autoSave.flush();
      await birthdayApi.resetBirthdayConfig(id);
      await loadConfig(id);
      notify(m.birthday.notifyReset());
    } catch (err) {
      logger.error("Failed to reset birthday config:", err);
      notify(errorText(err, m.common.failedToResetConfiguration()), "error");
    }
  }

  const actionButtons = $derived([{ label: m.common.resetToDefault(), icon: "fa-rotate-left", action: reset }]);

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
      form = null;
      saved = null;
      void loadGuildData(BigInt($currentGuild.id));
    }
  });
</script>

<svelte:head>
  <title>{m.birthday.pageTitle()}</title>
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
  {actionButtons}
  icon="fa-cake-candles"
  guildName={$currentGuild?.name || m.common.dashboard()}
  title={m.birthday.pageTitle()}
  subtitle={m.features.birthdayDescription()}
  enabled={form ? hasFeature(form.features, Feature.Announcements) : undefined}
  onToggle={(enabled) => setFeature(Feature.Announcements, enabled)}
>
  {#if guildId}
    {#key guildId}
      <div class="space-y-4 min-w-0" onfocusout={() => void autoSave.flush()}>
        {#if form}
          <AnnouncementsCard {form} {channels} user={data.user} onchange={change} />
          <RolesCard {form} {roles} onchange={change} onfeature={setFeature} />
          <TimeCard {guildId} {form} {autoSave} onchange={change} />
        {:else}
          <div class="flex justify-center py-6">
            <div class="w-10 h-10 border-4 rounded-full animate-spin" style="border-color: {$colorStore.primary}20; border-top-color: {$colorStore.primary}"></div>
          </div>
        {/if}
        <MembersCard
          {guildId}
          {members}
          {users}
          {upcoming}
          {today}
          {days}
          ondays={changeDays}
          onchanged={() => loadPeople(guildId)}
          onerror={(message) => notify(message, "error")}
        />
        {#if stats}
          <StatsCard {stats} />
        {/if}
      </div>
    {/key}
  {/if}
</PluginPage>
