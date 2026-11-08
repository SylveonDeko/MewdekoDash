<script lang="ts">
  import { m } from "$lib/i18n";
  import { onMount } from "svelte";
  import { fade } from "svelte/transition";
  import { colorStore } from "$lib/stores/colorStore";
  import { currentGuild } from "$lib/stores/currentGuild";
  import { requestConfirmation } from "$lib/stores/confirmationStore";
  import {
    roleMenusApi,
    RoleMenuMode,
    RoleMenuStyle,
    type RoleMenu,
    type RoleMenuGroup,
    type RoleMenuImportSource,
    type RoleMenuLookups,
    type RoleMenuStatus
  } from "$lib/api/index.ts";
  import { logger } from "$lib/logger";
  import type { DiscordUser } from "$lib/types/discord";
  import Notification from "$lib/components/ui/Notification.svelte";
  import PluginCard from "$lib/components/plugin/PluginCard.svelte";
  import RoleMenuEditor from "./menus/RoleMenuEditor.svelte";
  import RoleMenuGroups from "./menus/RoleMenuGroups.svelte";
  import RoleMenuImport from "./menus/RoleMenuImport.svelte";
  import TabToolbar from "./TabToolbar.svelte";
  import { emojiImageUrl } from "../roleMenuDefaults";

  interface Props {
    user?: DiscordUser;
  }

  let { user }: Props = $props();

  /** Most role chips a row shows before summarizing the rest. */
  const MAX_CHIPS = 6;

  /** The menu open in the editor. A null menu means a new one; the key remounts the editor. */
  interface EditorTarget {
    menu: RoleMenu | null;
    key: number;
  }

  let loading = $state(false);
  let loaded = $state(false);
  let showNotification = $state(false);
  let notificationMessage = $state("");
  let notificationType: "success" | "error" = $state("success");
  let notificationTimer: ReturnType<typeof setTimeout> | null = null;

  let menus = $state<RoleMenu[]>([]);
  let lookups = $state<RoleMenuLookups | null>(null);
  let importSources = $state<RoleMenuImportSource[]>([]);
  let groups = $state<RoleMenuGroup[]>([]);
  let busy = $state<Record<number, boolean>>({});

  let editing = $state<EditorTarget | null>(null);
  let editorDirty = $state(false);
  let editorCounter = 0;

  let view = $state<"menus" | "move" | "groups">("menus");

  const ghostStyle = $derived(
    `background: ${$colorStore.primary}10; color: ${$colorStore.text}; border: 1px solid ${$colorStore.primary}20;`
  );
  const dangerStyle = "background: #ef444420; color: #ef4444; border: 1px solid #ef444430;";

  function notify(text: string, type: "success" | "error" = "success") {
    notificationMessage = text;
    notificationType = type;
    showNotification = true;
    if (notificationTimer) clearTimeout(notificationTimer);
    notificationTimer = setTimeout(() => {
      showNotification = false;
    }, 3000);
  }

  /** Loads menus, lookups, and older setups together. */
  async function loadAll() {
    if (!$currentGuild?.id) return;
    loading = true;
    try {
      const guildId = $currentGuild.id;
      const [menuList, lookupData, sources, groupList] = await Promise.all([
        roleMenusApi.list(guildId).catch((err) => {
          logger.error("Failed to load role menus:", err);
          return null;
        }),
        roleMenusApi.lookups(guildId).catch(() => null),
        roleMenusApi.importSources(guildId).catch(() => []),
        roleMenusApi.groups(guildId).catch(() => [])
      ]);

      if (menuList === null) {
        notify(m.roleMenus.pageLoadFailed(), "error");
      } else {
        menus = menuList;
      }
      lookups = lookupData;
      importSources = sources ?? [];
      groups = groupList ?? [];
      loaded = true;
    } finally {
      loading = false;
    }
  }

  /**
   * Visible label for a menu's mode.
   * @param mode The mode value
   */
  function modeLabel(mode: number): string {
    switch (mode) {
      case RoleMenuMode.PickOne:
        return m.roleMenus.menuModePickOne();
      case RoleMenuMode.AddOnly:
        return m.roleMenus.menuModeAddOnly();
      case RoleMenuMode.RemoveOnly:
        return m.roleMenus.menuModeRemoveOnly();
      case RoleMenuMode.Reverse:
        return m.roleMenus.menuModeReverse();
      default:
        return m.roleMenus.menuModePickAny();
    }
  }

  /** Reloads the groups after a menu save may have created one. */
  async function refreshGroups() {
    if (!$currentGuild?.id) return;
    groups = (await roleMenusApi.groups($currentGuild.id).catch(() => groups)) ?? groups;
  }

  /**
   * The channel as members see it, or "Deleted channel".
   * @param channelName The channel name, if it still exists
   */
  function channelLabel(channelName: string | null | undefined): string {
    return channelName ? `#${channelName}` : m.roleMenus.channelDeleted();
  }

  /**
   * The channel as it reads inside a sentence.
   * @param channelName The channel name, if it still exists
   */
  function channelRef(channelName: string | null | undefined): string {
    return channelName ? `#${channelName}` : m.roleMenus.channelDeletedRef();
  }

  /**
   * Visible label for a status.
   * @param status The status key
   */
  function statusLabel(status: RoleMenuStatus): string {
    switch (status) {
      case "live":
        return m.roleMenus.statusLive();
      case "paused":
        return m.common.paused();
      case "not_posted":
        return m.roleMenus.statusNotPosted();
      default:
        return m.roleMenus.statusChannelMissing();
    }
  }

  /**
   * Solid color for a status pill.
   * @param status The status key
   */
  function statusColor(status: RoleMenuStatus): string {
    switch (status) {
      case "live":
        return "#10b981";
      case "paused":
        return $colorStore.muted;
      case "not_posted":
        return $colorStore.accent;
      default:
        return "#ef4444";
    }
  }

  /**
   * Hex color for a role, or the muted color when it has none.
   * @param color 24 bit RGB value
   */
  function roleColorHex(color: number): string {
    return color ? `#${color.toString(16).padStart(6, "0")}` : $colorStore.muted;
  }

  /**
   * Asks before throwing away unsaved editor changes.
   * @returns True when it is fine to leave the editor
   */
  async function confirmDiscard(): Promise<boolean> {
    if (!editing || !editorDirty) return true;
    return requestConfirmation({
      title: m.common.discardChanges(),
      message: m.roleMenus.discardMessage(),
      confirmText: m.common.discard(),
      variant: "danger"
    });
  }

  /**
   * Opens the editor for a new menu, or for an existing one.
   * @param menu The menu, or null for a new one
   */
  async function openEditor(menu: RoleMenu | null) {
    if (!(await confirmDiscard())) return;
    editorCounter += 1;
    editorDirty = false;
    editing = { menu, key: editorCounter };
    view = "menus";
  }

  /** Leaves the editor, asking first when there are unsaved changes. */
  async function closeEditor() {
    if (!(await confirmDiscard())) return;
    editing = null;
    editorDirty = false;
  }

  /**
   * Puts a menu from a response into the list, replacing the old copy or adding it.
   * @param menu The menu
   */
  function upsertMenu(menu: RoleMenu) {
    const index = menus.findIndex((item) => item.id === menu.id);
    if (index === -1) {
      menus = [...menus, menu].sort((a, b) => a.id - b.id);
    } else {
      menus = menus.map((item) => (item.id === menu.id ? menu : item));
    }
  }

  /**
   * Closes the editor after a successful post or save.
   * @param menu The saved menu
   * @param created Whether the menu is new
   */
  function handleSaved(menu: RoleMenu, created: boolean) {
    upsertMenu(menu);
    editing = null;
    editorDirty = false;
    refreshGroups();
    notify(
      created
        ? m.roleMenus.notifyPosted({ channel: channelRef(menu.channelName) })
        : m.roleMenus.notifyUpdated({ channel: channelRef(menu.channelName) })
    );
  }

  /**
   * Pauses or resumes a menu.
   * @param menu The menu
   */
  async function toggleEnabled(menu: RoleMenu) {
    if (!$currentGuild?.id || busy[menu.id]) return;
    busy[menu.id] = true;
    try {
      upsertMenu(await roleMenusApi.setEnabled($currentGuild.id, menu.id, !menu.enabled));
    } catch (err: any) {
      logger.error("Failed to pause or resume a role menu:", err);
      notify(err?.message || m.roleMenus.pageSaveFailed(), "error");
    } finally {
      busy[menu.id] = false;
    }
  }

  /**
   * Posts a fresh copy of a menu in the same channel.
   * @param menu The menu
   */
  async function repost(menu: RoleMenu) {
    if (!$currentGuild?.id || busy[menu.id]) return;
    busy[menu.id] = true;
    try {
      const updated = await roleMenusApi.repost($currentGuild.id, menu.id, null);
      upsertMenu(updated);
      notify(m.roleMenus.notifyReposted({ channel: channelRef(updated.channelName) }));
    } catch (err: any) {
      logger.error("Failed to post a role menu again:", err);
      notify(err?.message || m.roleMenus.pageSaveFailed(), "error");
    } finally {
      busy[menu.id] = false;
    }
  }

  /**
   * Deletes a menu and its message after confirming.
   * @param menu The menu
   */
  async function deleteMenu(menu: RoleMenu) {
    if (!$currentGuild?.id) return;
    const ok = await requestConfirmation({
      title: m.common.deleteThisMenu(),
      message: m.roleMenus.deleteMessage({ channel: channelRef(menu.channelName) }),
      confirmText: m.common.deleteMenu(),
      variant: "danger"
    });
    if (!ok) return;

    busy[menu.id] = true;
    try {
      await roleMenusApi.remove($currentGuild.id, menu.id);
      menus = menus.filter((item) => item.id !== menu.id);
      if (editing?.menu?.id === menu.id) {
        editing = null;
        editorDirty = false;
      }
    } catch (err: any) {
      logger.error("Failed to delete a role menu:", err);
      notify(err?.message || m.roleMenus.pageDeleteFailed(), "error");
    } finally {
      busy[menu.id] = false;
    }
  }

  /**
   * Adds a menu moved from an older setup and returns to the list.
   * @param menu The new menu
   * @param sourceId The older setup it came from
   */
  function handleMoved(menu: RoleMenu, sourceId: number) {
    importSources = importSources.filter((s) => s.id !== sourceId);
    upsertMenu(menu);
    view = "menus";
    notify(m.roleMenus.notifyMoved({ channel: channelRef(menu.channelName) }));
  }

  onMount(() => {
    loadAll();
  });

  let actionButtons = $derived([
    {
      label: m.roleMenus.actionNewMenu(),
      icon: "fa-plus",
      action: () => openEditor(null)
    },
    ...(importSources.length > 0 || view === "move"
      ? [
          view === "move"
            ? { label: m.roleMenus.tabMenus(), icon: "fa-list-check", action: () => (view = "menus") }
            : { label: m.roleMenus.tabMove(), icon: "fa-arrow-right-arrow-left", action: () => (view = "move") }
        ]
      : []),
    view === "groups"
      ? { label: m.roleMenus.tabMenus(), icon: "fa-list-check", action: () => (view = "menus") }
      : { label: m.roleMenus.tabGroups(), icon: "fa-layer-group", action: () => (view = "groups") },
    {
      label: m.common.refresh(),
      icon: "fa-arrows-rotate",
      action: loadAll,
      loading: loading
    }
  ]);
</script>

{#if showNotification}
  <div class="fixed top-4 right-4 z-[60]" transition:fade>
    <Notification message={notificationMessage} type={notificationType} />
  </div>
{/if}

<div class="space-y-4 min-w-0">
  <TabToolbar buttons={actionButtons} />

  {#if lookups && !lookups.botCanManageRoles}
    <div class="p-3 rounded-xl flex items-center gap-3 text-sm"
         style="background: {$colorStore.accent}20; border: 1px solid {$colorStore.accent}30; color: {$colorStore.text};"
         role="alert">
      <i class="fa-solid fa-circle-exclamation shrink-0" aria-hidden="true"></i>
      <span>{m.roleMenus.warnBotManageRoles()}</span>
    </div>
  {/if}

  {#if view === "groups"}
    <RoleMenuGroups
      {groups}
      onchange={(list) => (groups = list)}
      onerror={(text) => notify(text, "error")}
    />
  {:else if view === "move"}
    <RoleMenuImport
      sources={importSources}
      {lookups}
      onmoved={handleMoved}
      onerror={(text) => notify(text, "error")}
    />
  {:else}
    <PluginCard title={m.roleMenus.tabMenus()} alwaysOpen>
      {#if !loaded}
        <div class="flex items-center justify-center py-8" style="color: {$colorStore.muted}">
          <i class="fa-solid fa-spinner fa-spin text-2xl" aria-hidden="true"></i>
          <span class="sr-only">{m.roleMenus.listLoading()}</span>
        </div>
      {:else if menus.length === 0}
        <div class="flex flex-col items-center gap-3 py-8 text-center">
          <i class="fa-solid fa-list-check" style="color: {$colorStore.muted}; font-size: 28px;" aria-hidden="true"></i>
          <p class="font-semibold" style="color: {$colorStore.text}">{m.roleMenus.listEmptyTitle()}</p>
          <p class="text-sm" style="color: {$colorStore.muted}">{m.roleMenus.listEmptyText()}</p>
          <button
            type="button"
            class="flex items-center justify-center gap-2 px-5 rounded-xl min-h-[50px] font-medium"
            style="background: {$colorStore.primary}; color: {$colorStore.onPrimary};"
            onclick={() => openEditor(null)}
          >
            <i class="fa-solid fa-plus" aria-hidden="true"></i>
            {m.roleMenus.listCreateFirst()}
          </button>
          {#if importSources.length > 0}
            <button
              type="button"
              class="flex items-center justify-center gap-2 px-5 rounded-xl min-h-[50px] font-medium"
              style={ghostStyle}
              onclick={() => (view = "move")}
            >
              <i class="fa-solid fa-arrow-right-arrow-left" aria-hidden="true"></i>
              {m.roleMenus.listImportHint({ count: importSources.length })}
            </button>
          {/if}
        </div>
      {:else}
        <div class="space-y-2">
          {#each menus as menu (menu.id)}
            {@const rest = menu.options.length - MAX_CHIPS}
            <div class="rounded-xl border p-3 space-y-3"
                 style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}20;">
              <button type="button" class="block w-full text-left min-h-[44px] px-1" onclick={() => openEditor(menu)}>
                <span class="flex flex-wrap items-center gap-2">
                  <span class="text-sm font-semibold truncate min-w-0" style="color: {$colorStore.text}">{menu.name}</span>
                  <span class="text-xs px-2 py-0.5 rounded-full font-medium"
                        style="background: {statusColor(menu.status)}20; color: {statusColor(menu.status)};">
                    {statusLabel(menu.status)}
                  </span>
                </span>
                <span class="block text-sm" style="color: {$colorStore.muted}">
                  {[
                    channelLabel(menu.channelName),
                    menu.style === RoleMenuStyle.Buttons ? m.common.buttons() : m.common.dropdown(),
                    modeLabel(menu.mode),
                    m.common.optionsCount({ count: menu.options.length })
                  ].join(" · ")}
                </span>
              </button>

              {#if menu.options.length > 0}
                <div class="flex flex-wrap gap-1.5">
                  {#each menu.options.slice(0, MAX_CHIPS) as option (option.id)}
                    {@const url = emojiImageUrl(option.emoji)}
                    <span class="flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs min-w-0"
                          style="background: {option.problem ? '#ef444420' : `${$colorStore.primary}15`};
                                 color: {option.problem ? '#ef4444' : $colorStore.text};"
                          title={option.problem ?? undefined}>
                      <span class="w-2 h-2 rounded-full shrink-0" style="background: {roleColorHex(option.roleColor)};"></span>
                      {#if url}
                        <img src={url} alt="" class="w-4 h-4" />
                      {:else if option.emoji}
                        <span>{option.emoji}</span>
                      {/if}
                      <span class="truncate">{option.label}</span>
                      {#if option.problem}
                        <i class="fa-solid fa-circle-exclamation" aria-hidden="true"></i>
                        <span class="sr-only">{option.problem}</span>
                      {/if}
                    </span>
                  {/each}
                  {#if rest > 0}
                    <span class="flex items-center px-2 py-1 rounded-lg text-xs"
                          style="background: {$colorStore.primary}15; color: {$colorStore.text};">+{rest}</span>
                  {/if}
                </div>
              {/if}

              {#if menu.status === "channel_missing"}
                <div class="p-3 rounded-lg flex items-center gap-2 text-sm" style="background: #ef444420; color: #ef4444;">
                  <i class="fa-solid fa-circle-exclamation shrink-0" aria-hidden="true"></i>
                  <span>{m.roleMenus.menuChannelMissing()}</span>
                </div>
              {/if}

              <div class="flex flex-wrap gap-2">
                <button
                  type="button"
                  class="flex items-center justify-center gap-2 px-4 rounded-lg min-h-[44px] text-sm font-medium"
                  style={ghostStyle}
                  onclick={() => openEditor(menu)}
                >
                  <i class="fa-solid fa-pen" aria-hidden="true"></i>
                  {m.common.edit()}
                </button>
                <button
                  type="button"
                  class="flex items-center justify-center gap-2 px-4 rounded-lg min-h-[44px] text-sm font-medium disabled:opacity-50"
                  style={ghostStyle}
                  onclick={() => toggleEnabled(menu)}
                  disabled={busy[menu.id]}
                >
                  <i class="fa-solid {menu.enabled ? 'fa-pause' : 'fa-play'}" aria-hidden="true"></i>
                  {menu.enabled ? m.common.pause() : m.roleMenus.menuResume()}
                </button>
                <button
                  type="button"
                  class="flex items-center justify-center gap-2 px-4 rounded-lg min-h-[44px] text-sm font-medium disabled:opacity-50"
                  style={ghostStyle}
                  onclick={() => repost(menu)}
                  disabled={busy[menu.id]}
                >
                  <i class="fa-solid {busy[menu.id] ? 'fa-spinner fa-spin' : 'fa-paper-plane'}" aria-hidden="true"></i>
                  {m.roleMenus.menuPostAgain()}
                </button>
                {#if menu.jumpUrl}
                  <a href={menu.jumpUrl}
                     target="_blank"
                     rel="noopener noreferrer"
                     class="flex items-center justify-center gap-2 px-4 rounded-lg min-h-[44px] text-sm font-medium"
                     style={ghostStyle}>
                    {m.roleMenus.menuOpenInDiscord()}
                  </a>
                {/if}
                <button
                  type="button"
                  class="flex items-center justify-center gap-2 px-4 rounded-lg min-h-[44px] text-sm font-medium sm:ml-auto disabled:opacity-50"
                  style={dangerStyle}
                  onclick={() => deleteMenu(menu)}
                  disabled={busy[menu.id]}
                >
                  <i class="fa-solid fa-trash" aria-hidden="true"></i>
                  {m.common.delete()}
                </button>
              </div>
            </div>
          {/each}
        </div>
      {/if}
    </PluginCard>
  {/if}
</div>

{#if editing}
  {#key editing.key}
    <RoleMenuEditor
      menu={editing.menu}
      {lookups}
      {user}
      {groups}
      bind:dirty={editorDirty}
      onsaved={handleSaved}
      oncancel={closeEditor}
      ondelete={() => { if (editing?.menu) deleteMenu(editing.menu); }}
      onerror={(text) => notify(text, "error")}
    />
  {/key}
{/if}
