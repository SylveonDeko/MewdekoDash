<script lang="ts">
  import { m } from "$lib/i18n";
  import { freeGamesApi, type FreeGame, type FreeGameAlert } from "$lib/api/index.ts";
  import { colorStore } from "$lib/stores/colorStore";
  import { logger } from "$lib/logger";
  import { requestConfirmation } from "$lib/stores/confirmationStore";
  import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";
  import ToggleRow from "$lib/components/forms/ToggleRow.svelte";
  import PluginCard from "$lib/components/plugin/PluginCard.svelte";
  import AlertRow from "./AlertRow.svelte";
  import Sheet from "$lib/components/ui/Sheet.svelte";
  import { channelName, errorText, type Named, type Notify } from "./alertsModel";

  interface Props {
    guildId: bigint;
    channels: Named[];
    roles: Named[];
    notify: Notify;
  }

  let { guildId, channels, roles, notify }: Props = $props();

  type Draft = { channelId: string | null; roleId: string | null; epic: boolean; steam: boolean; gog: boolean; existing: boolean };

  let alerts: FreeGameAlert[] = $state([]);
  let current: FreeGame[] = $state([]);
  let loading = $state(true);
  let busy = $state(false);
  let draft = $state<Draft | null>(null);

  const buttonStyle = $derived(`background: ${$colorStore.primary}; color: ${$colorStore.onPrimary};`);
  const quietStyle = $derived(
    `background: ${$colorStore.primary}20; color: ${$colorStore.text}; border: 1px solid ${$colorStore.primary}30;`
  );
  const canSave = $derived(!!draft && !!draft.channelId && (draft.epic || draft.steam || draft.gog));

  function stores(alert: FreeGameAlert): string[] {
    const list: string[] = [];
    if (alert.epic) list.push(m.alerts.gamesStoreEpic());
    if (alert.steam) list.push(m.alerts.gamesStoreSteam());
    if (alert.gog) list.push(m.alerts.gamesStoreGog());
    return list;
  }

  function roleName(id: bigint | null): string {
    return id === null ? m.alerts.gamesNoPing() : `@${roles.find(role => String(role.id) === String(id))?.name ?? id}`;
  }

  function endsText(game: FreeGame): string {
    return game.endsAt ? m.alerts.gamesEnds({ date: new Date(game.endsAt).toLocaleDateString(undefined, { dateStyle: "medium" }) }) : game.store;
  }

  async function load() {
    loading = true;
    try {
      const [list, now] = await Promise.all([
        freeGamesApi.getAlerts(guildId),
        freeGamesApi.getCurrent(guildId).catch(() => [] as FreeGame[])
      ]);
      alerts = list;
      current = now;
    } catch (err) {
      logger.error("Failed to load free game alerts:", err);
      notify(errorText(err, m.alerts.loadFailed()), "error");
    } finally {
      loading = false;
    }
  }

  function startNew() {
    draft = { channelId: null, roleId: null, epic: true, steam: true, gog: true, existing: false };
  }

  function edit(alert: FreeGameAlert) {
    draft = {
      channelId: String(alert.channelId),
      roleId: alert.roleId === null ? null : String(alert.roleId),
      epic: alert.epic,
      steam: alert.steam,
      gog: alert.gog,
      existing: true
    };
  }

  async function save() {
    if (!draft || !draft.channelId || busy) return;
    busy = true;
    try {
      await freeGamesApi.saveAlert(guildId, {
        channelId: BigInt(draft.channelId),
        roleId: draft.roleId ? BigInt(draft.roleId) : null,
        epic: draft.epic,
        steam: draft.steam,
        gog: draft.gog
      });
      draft = null;
      notify(m.alerts.gamesSaved());
      alerts = await freeGamesApi.getAlerts(guildId);
    } catch (err) {
      logger.error("Failed to save free game alerts:", err);
      notify(errorText(err, m.alerts.gamesSaveFailed()), "error");
    } finally {
      busy = false;
    }
  }

  async function remove(alert: FreeGameAlert) {
    const confirmed = await requestConfirmation({
      message: m.alerts.gamesRemoveConfirm({ channel: channelName(channels, alert.channelId) }),
      confirmText: m.common.remove()
    });
    if (!confirmed) return;
    try {
      await freeGamesApi.removeAlert(guildId, alert.channelId);
      alerts = alerts.filter(item => item.channelId !== alert.channelId);
      notify(m.alerts.gamesRemoved());
    } catch (err) {
      logger.error("Failed to remove free game alerts:", err);
      notify(errorText(err, m.alerts.gamesRemoveFailed()), "error");
    }
  }

  void load();
</script>

{#snippet addButton()}
  <button type="button" class="flex items-center justify-center gap-2 px-5 rounded-xl min-h-[50px] font-medium" style={quietStyle} onclick={startNew}>
    <i class="fa-solid fa-plus" aria-hidden="true"></i>
    {m.alerts.gamesAdd()}
  </button>
{/snippet}

<PluginCard title={m.alerts.gamesCardAlerts()} actions={addButton} alwaysOpen>
  {#if loading}
    <div class="flex justify-center py-6">
      <div class="w-10 h-10 border-4 rounded-full animate-spin" style="border-color: {$colorStore.primary}20; border-top-color: {$colorStore.primary}"></div>
    </div>
  {:else if alerts.length === 0}
    <div class="flex flex-col items-center gap-3 py-8 text-center">
      <i class="fa-solid fa-gamepad" style="color: {$colorStore.muted}; font-size: 28px;" aria-hidden="true"></i>
      <p style="color: {$colorStore.muted}">{m.alerts.gamesEmpty()}</p>
    </div>
  {:else}
    <div class="space-y-2">
      {#each alerts as alert (String(alert.channelId))}
        <AlertRow
          title={`#${channelName(channels, alert.channelId)}`}
          subtitle={roleName(alert.roleId)}
          removeLabel={m.alerts.gamesRemoveAria({ channel: channelName(channels, alert.channelId) })}
          badges={stores(alert)}
          onopen={() => edit(alert)}
          onremove={() => remove(alert)}
        />
      {/each}
    </div>
  {/if}
</PluginCard>

{#if !loading}
  <PluginCard title={m.alerts.gamesCardNow()} alwaysOpen>
    {#if current.length === 0}
      <p class="py-2" style="color: {$colorStore.muted}">{m.alerts.gamesNowEmpty()}</p>
    {:else}
      <div class="space-y-2">
        {#each current as game (game.store + game.key)}
          <div class="flex items-center gap-2 rounded-xl border p-2 min-w-0" style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}20;">
            <div class="grow min-w-0 px-1">
              <span class="block text-sm font-semibold truncate" style="color: {$colorStore.text}">{game.title}</span>
              <span class="block text-sm truncate" style="color: {$colorStore.muted}">{game.store} · {endsText(game)}</span>
            </div>
            <a
              href={game.url}
              target="_blank"
              rel="noopener noreferrer"
              class="shrink-0 flex items-center justify-center px-4 rounded-lg min-h-[44px] text-sm"
              style={quietStyle}
            >
              {m.common.view()}
            </a>
          </div>
        {/each}
      </div>
    {/if}
  </PluginCard>
{/if}

{#if draft}
  {@const form = draft}
  <Sheet title={form.existing ? m.alerts.gamesEditTitle() : m.alerts.gamesNewTitle()} onclose={() => (draft = null)}>
    <div class="space-y-1">
      <span class="block text-sm font-medium" style="color: {$colorStore.text}">{m.common.channel()}</span>
      <DiscordSelector
        type="channel"
        options={channels}
        selected={form.channelId}
        disabled={form.existing}
        clearable={false}
        placeholder={m.common.selectAChannelPlaceholder()}
        onchange={(detail) => (form.channelId = typeof detail.selected === "string" ? detail.selected : null)}
      />
    </div>
    <div class="space-y-1">
      <span class="block text-sm font-medium" style="color: {$colorStore.text}">{m.common.pingRole()}</span>
      <DiscordSelector
        type="role"
        options={roles}
        selected={form.roleId}
        clearable
        placeholder={m.alerts.gamesNoPing()}
        onchange={(detail) => (form.roleId = typeof detail.selected === "string" ? detail.selected : null)}
      />
    </div>
    <div class="space-y-2">
      <span class="block text-sm font-medium" style="color: {$colorStore.text}">{m.alerts.gamesStores()}</span>
      <ToggleRow checked={form.epic} title={m.alerts.gamesStoreEpic()} colors={$colorStore} onchange={(value) => (form.epic = value)} />
      <ToggleRow checked={form.steam} title={m.alerts.gamesStoreSteam()} colors={$colorStore} onchange={(value) => (form.steam = value)} />
      <ToggleRow checked={form.gog} title={m.alerts.gamesStoreGog()} colors={$colorStore} onchange={(value) => (form.gog = value)} />
      {#if !form.epic && !form.steam && !form.gog}
        <p class="text-sm" style="color: {$colorStore.muted}">{m.alerts.gamesPickStore()}</p>
      {/if}
    </div>
    {#snippet footer()}
      <button type="button" class="px-5 rounded-xl min-h-[44px] font-medium" style={quietStyle} onclick={() => (draft = null)}>
        {m.common.cancel()}
      </button>
      <button type="button" class="px-5 rounded-xl min-h-[44px] font-medium disabled:opacity-50" style={buttonStyle} disabled={!canSave || busy} onclick={save}>
        {m.common.save()}
      </button>
    {/snippet}
  </Sheet>
{/if}
