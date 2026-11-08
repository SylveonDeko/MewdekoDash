<!-- routes/dashboard/linkfix/+page.svelte -->
<script lang="ts">
  import { m } from "$lib/i18n";
  import { goto } from "$app/navigation";
  import { fade } from "svelte/transition";
  import { linkFixApi, type LinkFixSettings } from "$lib/api/index.ts";
  import { currentGuild } from "$lib/stores/currentGuild.ts";
  import { colorStore } from "$lib/stores/colorStore";
  import { logger } from "$lib/logger.ts";
  import { createAutoSave } from "$lib/utils/autoSave.svelte";
  import Notification from "$lib/components/ui/Notification.svelte";
  import AsyncState from "$lib/components/stats/AsyncState.svelte";
  import PluginPage from "$lib/components/plugin/PluginPage.svelte";
  import PluginCard from "$lib/components/plugin/PluginCard.svelte";
  import ToggleRow from "$lib/components/forms/ToggleRow.svelte";
  import SettingField from "$lib/components/forms/SettingField.svelte";

  const HOST_PATTERN = /^(?=.{1,253}$)([a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/i;

  let settings = $state<LinkFixSettings | null>(null);
  let hosts = $state<Record<string, string>>({});
  let loading = $state(false);
  let error = $state<string | null>(null);
  let showNotification = $state(false);
  let notificationMessage = $state("");
  let notificationType = $state<"success" | "error">("success");
  let loadedFor = "";

  function notify(message: string, type: "success" | "error" = "error") {
    notificationMessage = message;
    notificationType = type;
    showNotification = true;
    setTimeout(() => (showNotification = false), 3000);
  }

  const autoSave = createAutoSave({
    onError: () => notify(m.linkfix.errorSave(), "error")
  });

  function apply(next: LinkFixSettings) {
    settings = next;
    hosts = Object.fromEntries(next.platforms.map(platform => [platform.name, platform.host]));
  }

  async function load(guildId: bigint) {
    loading = true;
    error = null;
    try {
      apply(await linkFixApi.get(guildId));
    } catch (err) {
      error = err instanceof Error ? err.message : m.linkfix.errorLoad();
      logger.error("Failed to load link fixing settings", err);
    } finally {
      loading = false;
    }
  }

  async function update(request: Parameters<typeof linkFixApi.update>[1]) {
    if (!$currentGuild?.id || !settings) return;
    const previous = settings;
    const previousHosts = { ...hosts };
    try {
      settings = await linkFixApi.update($currentGuild.id, request);
    } catch (err) {
      settings = previous;
      hosts = previousHosts;
      throw err;
    }
  }

  function hostInvalid(name: string) {
    const host = hosts[name]?.trim();
    return !!host && !HOST_PATTERN.test(host);
  }

  function saveHost(name: string) {
    if (hostInvalid(name)) return;
    const host = hosts[name]?.trim() || null;
    autoSave.schedule(`host:${name}`, () => update({ platforms: [{ name, host }] }));
  }

  function finishHost(platform: { name: string; displayName: string }) {
    if (hostInvalid(platform.name)) {
      notify(m.linkfix.errorInvalidHost({ site: platform.displayName }), "error");
      return;
    }
    void autoSave.flush(`host:${platform.name}`);
  }

  function resetHost(platform: { name: string; defaultHost: string }) {
    hosts[platform.name] = platform.defaultHost;
    saveHost(platform.name);
    void autoSave.flush(`host:${platform.name}`);
  }

  $effect(() => {
    if (!$currentGuild) {
      void goto("/dashboard");
      return;
    }
    const id = $currentGuild.id.toString();
    if (loadedFor !== id) {
      loadedFor = id;
      void load(BigInt($currentGuild.id));
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
  icon="fa-link"
  guildName={$currentGuild?.name || m.common.dashboard()}
  title={m.features.linkfixName()}
  subtitle={m.linkfix.pageSubtitle()}
  enabled={settings?.enabled}
  onToggle={(value) => autoSave.now("enabled", () => update({ enabled: value }))}
>
  <AsyncState {loading} {error} empty={!settings}>
    {#if settings?.enabled}
      <PluginCard title={m.linkfix.sitesTitle()} alwaysOpen>
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-x-6 gap-y-5">
          {#each settings.platforms as platform (platform.name)}
            <div class="space-y-2 min-w-0">
              <ToggleRow
                id="lf-{platform.name}"
                title={platform.displayName}
                checked={platform.enabled}
                colors={$colorStore}
                onchange={(value) => autoSave.now(`enabled:${platform.name}`, () => update({ platforms: [{ name: platform.name, enabled: value, host: platform.host }] }))}
              />
              <SettingField label={m.linkfix.hostLabel()} id="lf-host-{platform.name}">
                <div class="flex flex-col sm:flex-row gap-2">
                  <input
                    id="lf-host-{platform.name}"
                    type="text"
                    inputmode="url"
                    autocapitalize="none"
                    bind:value={hosts[platform.name]}
                    oninput={() => saveHost(platform.name)}
                    onblur={() => finishHost(platform)}
                    placeholder={platform.defaultHost}
                    class="grow min-w-0 p-3 rounded-lg border focus:ring-2 min-h-[50px]"
                    style="background: {$colorStore.primary}10; border-color: {hostInvalid(platform.name) ? '#ef4444' : `${$colorStore.primary}30`}; color: {$colorStore.text};"
                  >
                  <button
                    type="button"
                    class="px-4 min-h-[50px] rounded-lg text-sm font-medium"
                    style="background: {$colorStore.primary}10; color: {$colorStore.text}; border: 1px solid {$colorStore.primary}20;"
                    onclick={() => resetHost(platform)}
                  >
                    {m.linkfix.hostReset()}
                  </button>
                </div>
              </SettingField>
            </div>
          {/each}
        </div>
      </PluginCard>
    {/if}
  </AsyncState>
</PluginPage>
