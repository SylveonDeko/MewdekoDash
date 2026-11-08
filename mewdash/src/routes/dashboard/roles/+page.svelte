<!-- routes/dashboard/roles/+page.svelte -->
<script lang="ts">
  import { m } from "$lib/i18n";
  import { goto } from "$app/navigation";
  import { page } from "$app/state";
  import { currentGuild } from "$lib/stores/currentGuild.ts";
  import { colorStore } from "$lib/stores/colorStore.ts";
  import PluginPage from "$lib/components/plugin/PluginPage.svelte";
  import MenusTab from "./components/MenusTab.svelte";
  import StatesTab from "./components/StatesTab.svelte";
  import StatusTab from "./components/StatusTab.svelte";
  import StatsTab from "./components/StatsTab.svelte";
  import GreetsTab from "./components/GreetsTab.svelte";
  import TimeoutTab from "./components/TimeoutTab.svelte";
  import type { PageData } from "./$types";

  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();

  const tabs = $derived([
    { id: "menus", label: m.features.roleMenusName(), icon: "fa-list-ul" },
    { id: "states", label: m.features.rolestatesName(), icon: "fa-users" },
    { id: "status", label: m.features.statusrolesName(), icon: "fa-user-check" },
    { id: "stats", label: m.features.statrolesName(), icon: "fa-trophy" },
    { id: "greets", label: m.features.rolegreetsName(), icon: "fa-envelope" },
    { id: "timeout", label: m.roles.tabTimeout(), icon: "fa-clock" }
  ]);

  const activeTab = $derived.by(() => {
    const requested = page.url.searchParams.get("tab");
    return tabs.find(tab => tab.id === requested)?.id ?? "menus";
  });

  function select(id: string) {
    if (id === activeTab) return;
    const url = new URL(page.url);
    url.search = "";
    url.searchParams.set("tab", id);
    void goto(url, { replaceState: true, noScroll: true, keepFocus: true });
  }

  $effect(() => {
    if (!$currentGuild) void goto("/dashboard");
  });
</script>

<svelte:head>
  <title>{m.roles.pageHeadTitle()}</title>
</svelte:head>

<PluginPage
  title={m.features.rolesName()}
  subtitle={m.features.rolesDescription()}
  icon="fa-tag"
  guildName={$currentGuild?.name || m.common.dashboard()}
>
  <div class="grid grid-cols-2 sm:grid-cols-3 gap-2 [&>:last-child:nth-child(odd)]:col-span-2 sm:[&>:last-child:nth-child(odd)]:col-span-1" role="group" aria-label={m.features.rolesName()}>
    {#each tabs as item (item.id)}
      {@const selected = activeTab === item.id}
      <button
        type="button"
        class="min-h-[44px] px-2 rounded-lg border text-sm font-medium flex items-center justify-center gap-2"
        style="background: {selected ? $colorStore.selectedSurface : `${$colorStore.primary}08`}; border-color: {selected ? $colorStore.selectedBorder : `${$colorStore.primary}20`}; color: {$colorStore.text};"
        aria-pressed={selected}
        onclick={() => select(item.id)}
      >
        <i class="fa-solid {item.icon}" aria-hidden="true"></i>
        {item.label}
      </button>
    {/each}
  </div>

  {#if $currentGuild}
    {#key $currentGuild.id}
      {#if activeTab === "menus"}
        <MenusTab user={data.user} />
      {:else if activeTab === "states"}
        <StatesTab />
      {:else if activeTab === "status"}
        <StatusTab user={data.user} />
      {:else if activeTab === "stats"}
        <StatsTab />
      {:else if activeTab === "greets"}
        <GreetsTab user={data.user} />
      {:else}
        <TimeoutTab user={data.user} />
      {/if}
    {/key}
  {/if}
</PluginPage>
