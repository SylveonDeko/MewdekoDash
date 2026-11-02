<!-- routes/dashboard/linkfix/+page.svelte -->
<script lang="ts">
  import { m } from "$lib/i18n";
  import { onMount, untrack } from "svelte";
  import { goto } from "$app/navigation";
  import { linkFixApi, type LinkFixSettings } from "$lib/api/index.ts";
  import { currentGuild } from "$lib/stores/currentGuild.ts";
  import { currentInstance } from "$lib/stores/instanceStore.ts";
  import { colorStore } from "$lib/stores/colorStore";
  import { logger } from "$lib/logger.ts";
  import DashboardPageLayout from "$lib/components/layout/DashboardPageLayout.svelte";
  import SettingToggle from "$lib/components/forms/SettingToggle.svelte";
  import SettingField from "$lib/components/forms/SettingField.svelte";
  import Card from "$lib/components/analytics/Card.svelte";
  import SectionHeader from "$lib/components/stats/SectionHeader.svelte";
  import AsyncState from "$lib/components/stats/AsyncState.svelte";

  const HOST_PATTERN = /^(?=.{1,253}$)([a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/i;

  let settings = $state<LinkFixSettings | null>(null);
  let hosts = $state<Record<string, string>>({});
  let loading = $state(false);
  let error = $state<string | null>(null);
  let saving = $state(false);
  let notificationMessage = $state("");
  let notificationType = $state<"success" | "error">("success");

  function notify(message: string, type: "success" | "error" = "error") {
    notificationMessage = message;
    notificationType = type;
    setTimeout(() => (notificationMessage = ""), 4000);
  }

  function apply(next: LinkFixSettings) {
    settings = next;
    hosts = Object.fromEntries(next.platforms.map((p) => [p.name, p.host]));
  }

  async function load() {
    if (!$currentGuild?.id) return;
    loading = true;
    error = null;
    try {
      apply(await linkFixApi.get($currentGuild.id));
    } catch (err) {
      error = err instanceof Error ? err.message : m.linkfix.errorLoad();
      logger.error("Failed to load link fixing settings", err);
    } finally {
      loading = false;
    }
  }

  async function update(request: Parameters<typeof linkFixApi.update>[1], announce = false) {
    if (!$currentGuild?.id) return;
    try {
      apply(await linkFixApi.update($currentGuild.id, request));
      if (announce) notify(m.linkfix.notifySaved(), "success");
    } catch (err) {
      logger.error("Failed to save link fixing settings", err);
      notify(err instanceof Error ? err.message : m.linkfix.errorSave(), "error");
    }
  }

  async function saveHosts() {
    if (!settings) return;
    const invalid = settings.platforms.find((p) => hosts[p.name]?.trim() && !HOST_PATTERN.test(hosts[p.name].trim()));
    if (invalid) {
      notify(m.linkfix.errorInvalidHost({ site: invalid.displayName }), "error");
      return;
    }
    saving = true;
    await update({ platforms: settings.platforms.map((p) => ({ name: p.name, host: hosts[p.name]?.trim() || null })) }, true);
    saving = false;
  }

  let loadedFor = $state("");

  async function loadAll() {
    if (!$currentGuild?.id) return;
    const key = `${$currentGuild.id}:${$currentInstance?.port ?? ""}`;
    if (loadedFor === key) return;
    loadedFor = key;
    await load();
  }

  onMount(async () => {
    if (!$currentGuild) {
      await goto("/dashboard");
      return;
    }
    await loadAll();
  });

  $effect(() => {
    if ($currentGuild && $currentInstance) untrack(() => loadAll());
  });

  const inputStyle = $derived(`background: ${$colorStore.primary}10; color: ${$colorStore.text};`);
</script>

<DashboardPageLayout
  title={m.features.linkfixName()}
  subtitle={m.linkfix.pageSubtitle()}
  icon="fa-link"
  guildName={$currentGuild?.name || "Dashboard"}
  bind:notificationMessage
  {notificationType}
>
  <AsyncState {loading} {error} empty={!settings}>
    {#if settings}
      <div class="space-y-6">
        <Card title={m.features.linkfixName()}>
          <SettingToggle id="lf-enabled" label={m.linkfix.enabledLabel()} hint={m.linkfix.enabledHint()} checked={settings.enabled} onchange={(v) => update({ enabled: v })} />
        </Card>

        <section>
          <SectionHeader icon="fa-globe" title={m.linkfix.sitesTitle()} subtitle={m.linkfix.sitesSubtitle()} />
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {#each settings.platforms as platform (platform.name)}
              <Card title={platform.displayName}>
                <div class="space-y-4">
                  <SettingToggle id="lf-{platform.name}" label={platform.displayName} hint={m.linkfix.siteHint({ site: platform.displayName })} checked={platform.enabled} disabled={!settings.enabled} onchange={(v) => update({ platforms: [{ name: platform.name, enabled: v, host: platform.host }] })} />
                  <SettingField label={m.linkfix.hostLabel()} hint={m.linkfix.hostHint({ host: platform.defaultHost })} id="lf-host-{platform.name}">
                    <div class="flex gap-2">
                      <input id="lf-host-{platform.name}" type="text" bind:value={hosts[platform.name]} placeholder={platform.defaultHost} class="w-full rounded-lg p-2 min-h-[44px]" style={inputStyle} />
                      <button type="button" class="px-3 min-h-[44px] rounded-lg text-sm font-medium whitespace-nowrap" style="background: {$colorStore.primary}20; color: {$colorStore.primary};" onclick={() => (hosts[platform.name] = platform.defaultHost)}>{m.linkfix.hostReset()}</button>
                    </div>
                  </SettingField>
                </div>
              </Card>
            {/each}
          </div>
          <button type="button" class="mt-4 w-full sm:w-auto px-6 min-h-[48px] rounded-xl font-medium" style="background: {$colorStore.primary}; color: #fff;" onclick={saveHosts} disabled={saving}>
            {saving ? m.common.saving() : m.linkfix.save()}
          </button>
        </section>
      </div>
    {/if}
  </AsyncState>
</DashboardPageLayout>
