<script lang="ts">
  import { m } from "$lib/i18n";
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";
  import { formsApi, ownershipApi, type FormFunnelRow } from "$lib/api/index.ts";
  import { colorStore } from "$lib/stores/colorStore";
  import { logger } from "$lib/logger";
  import { loadingStore } from "$lib/stores/loadingStore";
  import DashboardPageLayout from "$lib/components/layout/DashboardPageLayout.svelte";
  import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";
  import SettingField from "$lib/components/forms/SettingField.svelte";
  import PluginCard from "$lib/components/plugin/PluginCard.svelte";
  import SkeletonLoader from "$lib/components/ui/SkeletonLoader.svelte";

  let { data } = $props();

  let rows: FormFunnelRow[] = $state([]);
  let days = $state("30");
  let loading = $state(true);
  let error: string | null = $state(null);

  const windows = $derived(["7", "30", "90"].map((value) => ({ id: value, name: m.common.daysCount({ count: Number(value) }) })));

  function finishedRate(row: FormFunnelRow): string {
    if (row.anonymous || row.started === 0) return "-";
    return `${Math.round((row.startedAndSubmitted / row.started) * 100)}%`;
  }

  async function load() {
    loading = true;
    error = null;

    try {
      rows = await formsApi.getFunnel(Number(days));
    } catch (err) {
      logger.error("Failed to load the form funnel:", err);
      error = m.forms.funnelLoadFailed();
    } finally {
      loading = false;
    }
  }

  onMount(async () => {
    const allowed = await loadingStore.wrap(
      "owner-check",
      async () => {
        try {
          return await ownershipApi.isOwner(BigInt(data.user.id));
        } catch (err) {
          logger.error("Owner check failed:", err);
          return false;
        }
      },
      "critical",
      m.common.checkingPermissions(),
    );

    if (!allowed) {
      goto("/dashboard");
      return;
    }

    await load();
  });
</script>

<svelte:head>
  <title>{m.features.formFunnelName()}</title>
</svelte:head>

<DashboardPageLayout
  category="Analytics"
  guildName={m.common.botOwnerTools()}
  icon="fa-clipboard-check"
  subtitle={m.features.formFunnelDescription()}
  title={m.features.formFunnelName()}
  basePath="/owner/forms"
>
  <PluginCard title={m.features.formFunnelName()} alwaysOpen>
    <SettingField label={m.common.window()} id="funnel-window">
      <DiscordSelector
        id="funnel-window"
        type="custom"
        customIcon="fa-calendar"
        searchable={false}
        clearable={false}
        options={windows}
        selected={days}
        onchange={({ selected }) => {
          days = typeof selected === "string" ? selected : "30";
          void load();
        }}
      />
    </SettingField>

    {#if loading}
      <SkeletonLoader />
    {:else if error}
      <p class="text-sm" style="color: #ef4444;">{error}</p>
    {:else if rows.length === 0}
      <p class="text-sm" style="color: {$colorStore.muted};">{m.forms.funnelEmpty()}</p>
    {:else}
      <ul class="divide-y" style="border-color: {$colorStore.primary}20;">
        {#each rows as row (row.formId)}
          <li class="py-3 space-y-2" style="border-color: {$colorStore.primary}20;">
            <div class="min-w-0">
              <div class="font-semibold truncate" style="color: {$colorStore.text};">{row.name}</div>
              <div class="text-xs truncate" style="color: {$colorStore.muted};">{row.guildName ?? row.guildId.toString()}</div>
            </div>

            {#if row.anonymous}
              <p class="text-sm" style="color: {$colorStore.muted};">{m.forms.funnelAnonymous()}</p>
            {/if}

            <dl class="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-2 text-sm">
              <div>
                <dt style="color: {$colorStore.muted};">{m.forms.funnelColumnStarted()}</dt>
                <dd class="font-semibold" style="color: {$colorStore.text};">{row.started}</dd>
              </div>
              <div>
                <dt style="color: {$colorStore.muted};">{m.forms.funnelColumnFinished()}</dt>
                <dd class="font-semibold" style="color: {$colorStore.text};">{row.startedAndSubmitted}</dd>
              </div>
              <div>
                <dt style="color: {$colorStore.muted};">{m.forms.funnelColumnRate()}</dt>
                <dd class="font-semibold" style="color: {$colorStore.text};">{finishedRate(row)}</dd>
              </div>
              <div>
                <dt style="color: {$colorStore.muted};">{m.common.responses()}</dt>
                <dd class="font-semibold" style="color: {$colorStore.text};">{row.submitted}</dd>
              </div>
            </dl>
          </li>
        {/each}
      </ul>
    {/if}
  </PluginCard>
</DashboardPageLayout>
