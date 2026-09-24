<script lang="ts">
  import { onMount } from "svelte";
  import { fade, fly } from "svelte/transition";
  import { colorStore } from "$lib/stores/colorStore";
  import { currentGuild } from "$lib/stores/currentGuild";
  import { requestConfirmation } from "$lib/stores/confirmationStore";
  import {
    roleMenusApi,
    RoleMenuMode,
    RoleMenuStyle,
    type RoleMenu,
    type RoleMenuImportSource,
    type RoleMenuLookups,
    type RoleMenuStatus
  } from "$lib/api/index.ts";
  import { logger } from "$lib/logger";
  import DashboardPageLayout from "$lib/components/layout/DashboardPageLayout.svelte";
  import RoleMenuEditor from "./components/RoleMenuEditor.svelte";
  import RoleMenuImport from "./components/RoleMenuImport.svelte";
  import { emojiImageUrl, MAX_MENUS } from "./roleMenuDefaults";
  import type { PageData } from "./$types";

  /** Page inputs from the server load. */
  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();

  /** Most role chips a card shows before summarizing the rest. */
  const MAX_CHIPS = 6;

  /** The menu open in the editor. A null menu means a new one; the key remounts the editor. */
  interface EditorTarget {
    menu: RoleMenu | null;
    key: number;
  }

  let loading = $state(false);
  let loaded = $state(false);
  let message = $state("");
  let messageType: "success" | "error" | "info" = $state("info");
  let messageTimer: ReturnType<typeof setTimeout> | null = null;

  let menus = $state<RoleMenu[]>([]);
  let lookups = $state<RoleMenuLookups | null>(null);
  let importSources = $state<RoleMenuImportSource[]>([]);
  let busy = $state<Record<number, boolean>>({});

  let editing = $state<EditorTarget | null>(null);
  let editorDirty = $state(false);
  let editorCounter = 0;

  let activeTab = $state("menus");

  /** Loads menus, lookups, and older setups together. */
  async function loadAll() {
    if (!$currentGuild?.id) return;
    loading = true;
    try {
      const guildId = $currentGuild.id;
      const [menuList, lookupData, sources] = await Promise.all([
        roleMenusApi.list(guildId).catch((err) => {
          logger.error("Failed to load role menus:", err);
          return null;
        }),
        roleMenusApi.lookups(guildId).catch(() => null),
        roleMenusApi.importSources(guildId).catch(() => [])
      ]);

      if (menuList === null) {
        showMessage("Couldn't load the role menus.", "error");
      } else {
        menus = menuList;
      }
      lookups = lookupData;
      importSources = sources ?? [];
      loaded = true;
    } finally {
      loading = false;
    }
  }

  /**
   * Shows the banner above the page for a few seconds.
   * @param text The message
   * @param type Banner tone
   */
  function showMessage(text: string, type: "success" | "error" | "info") {
    message = text;
    messageType = type;
    if (messageTimer) clearTimeout(messageTimer);
    messageTimer = setTimeout(() => {
      message = "";
    }, 5000);
  }

  /**
   * The channel as members see it, or "Deleted channel".
   * @param channelName The channel name, if it still exists
   */
  function channelLabel(channelName: string | null | undefined): string {
    return channelName ? `#${channelName}` : "Deleted channel";
  }

  /**
   * The channel as it reads inside a sentence.
   * @param channelName The channel name, if it still exists
   */
  function channelRef(channelName: string | null | undefined): string {
    return channelName ? `#${channelName}` : "the deleted channel";
  }

  /**
   * Visible label for a status.
   * @param status The status key
   */
  function statusLabel(status: RoleMenuStatus): string {
    switch (status) {
      case "live":
        return "Live";
      case "paused":
        return "Paused";
      case "not_posted":
        return "Not posted";
      default:
        return "Channel missing";
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
      title: "Discard changes?",
      message: "Your edits to this menu haven't been saved.",
      confirmText: "Discard",
      variant: "danger"
    });
  }

  /** Opens the editor for a new menu. */
  async function startNew() {
    if (!(await confirmDiscard())) return;
    editorCounter += 1;
    editorDirty = false;
    editing = { menu: null, key: editorCounter };
    activeTab = "menus";
  }

  /**
   * Opens the editor for an existing menu.
   * @param menu The menu
   */
  async function startEdit(menu: RoleMenu) {
    if (!(await confirmDiscard())) return;
    editorCounter += 1;
    editorDirty = false;
    editing = { menu, key: editorCounter };
    activeTab = "menus";
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
    const index = menus.findIndex((m) => m.id === menu.id);
    if (index === -1) {
      menus = [...menus, menu].sort((a, b) => a.id - b.id);
    } else {
      menus = menus.map((m) => (m.id === menu.id ? menu : m));
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
    showMessage(
      created ? `Posted in ${channelRef(menu.channelName)}` : `Message updated in ${channelRef(menu.channelName)}`,
      "success"
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
      showMessage(err?.message || "Couldn't save the menu.", "error");
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
      showMessage(`Posted again in ${channelRef(updated.channelName)}`, "success");
    } catch (err: any) {
      logger.error("Failed to post a role menu again:", err);
      showMessage(err?.message || "Couldn't save the menu.", "error");
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
      title: "Delete this menu?",
      message: `Its message in ${channelRef(menu.channelName)} is deleted too. Members keep the roles they already picked.`,
      confirmText: "Delete menu",
      variant: "danger"
    });
    if (!ok) return;

    busy[menu.id] = true;
    try {
      await roleMenusApi.remove($currentGuild.id, menu.id);
      menus = menus.filter((m) => m.id !== menu.id);
      if (editing?.menu?.id === menu.id) {
        editing = null;
        editorDirty = false;
      }
    } catch (err: any) {
      logger.error("Failed to delete a role menu:", err);
      showMessage(err?.message || "Couldn't delete the menu.", "error");
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
    activeTab = "menus";
    showMessage(`Moved to a role menu in ${channelRef(menu.channelName)}`, "success");
  }

  onMount(() => {
    loadAll();
  });

  const tabs = [
    { id: "menus", label: "Menus", icon: "fa-list-check" },
    { id: "move", label: "Move older setups", icon: "fa-arrow-right-arrow-left" }
  ];

  let actionButtons = $derived([
    {
      label: "New menu",
      icon: "fa-plus",
      action: startNew
    },
    {
      label: "Refresh",
      icon: "fa-arrows-rotate",
      action: loadAll,
      loading: loading
    }
  ]);
</script>

{#snippet statusMessageContent()}
  {#if message}
    <div class="mb-6 p-4 rounded-xl flex items-center gap-3 transition-all"
         style="background: {messageType === 'success' ? '#10b98120' : messageType === 'error' ? '#ef444420' : $colorStore.primary + '20'};
                border: 1px solid {messageType === 'success' ? '#10b981' : messageType === 'error' ? '#ef4444' : $colorStore.primary}30;"
         in:fly={{ x: 20, duration: 300 }}>
      {#if messageType === 'success'}
        <i class="fa-utility-duo fa-regular fa-circle-check"
           style="--fa-primary-color: #10b981; --fa-secondary-color: #059669; font-size: 20px;"></i>
      {:else}
        <i class="fa-utility-duo fa-regular fa-circle-exclamation"
           style="--fa-primary-color: {messageType === 'error' ? '#ef4444' : $colorStore.primary}; --fa-secondary-color: {messageType === 'error' ? '#dc2626' : $colorStore.secondary}; font-size: 20px;"></i>
      {/if}
      <span style="color: {messageType === 'success' ? '#10b981' : messageType === 'error' ? '#ef4444' : $colorStore.primary}">{message}</span>
    </div>
  {/if}

  {#if lookups && !lookups.botCanManageRoles}
    <div class="mb-6 p-4 rounded-xl flex items-center gap-3"
         style="background: {$colorStore.accent}20; border: 1px solid {$colorStore.accent}30;"
         in:fly={{ x: -20, duration: 300 }}>
      <i class="fa-utility-duo fa-regular fa-circle-exclamation"
         style="--fa-primary-color: {$colorStore.accent}; --fa-secondary-color: {$colorStore.primary}; font-size: 20px;"></i>
      <span style="color: {$colorStore.text}">The bot doesn't have Manage Roles, so menus can't give out roles until it does.</span>
    </div>
  {/if}
{/snippet}

<DashboardPageLayout
  {actionButtons}
  bind:activeTab
  guildName={$currentGuild?.name || "Dashboard"}
  icon="fa-list-ul"
  statusMessages={statusMessageContent}
  subtitle="Dropdowns and buttons that let members pick their own roles"
  {tabs}
  title="Role Menus"
>
  <div class:hidden={activeTab !== 'menus'}>
    {#if editing}
      {#key editing.key}
        <RoleMenuEditor
          menu={editing.menu}
          {lookups}
          user={data.user}
          bind:dirty={editorDirty}
          onsaved={handleSaved}
          oncancel={closeEditor}
          ondelete={() => { if (editing?.menu) deleteMenu(editing.menu); }}
          onerror={(text) => showMessage(text, "error")}
        />
      {/key}
    {:else if !loaded}
      <div class="flex items-center justify-center py-16" style="color: {$colorStore.muted}">
        <i class="fa-solid fa-spinner fa-spin text-2xl" aria-hidden="true"></i>
        <span class="sr-only">Loading</span>
      </div>
    {:else if menus.length === 0}
      <div class="rounded-2xl border p-8 md:p-12 shadow-2xl text-center"
           style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15, {$colorStore.gradientEnd}10);
                  border-color: {$colorStore.primary}30;"
           in:fade={{ duration: 200 }}>
        <i class="fa-solid fa-list-check"
           style="color: {$colorStore.primary}; font-size: 48px; opacity: 0.5;" aria-hidden="true"></i>
        <h3 class="text-lg font-semibold mt-4 mb-2" style="color: {$colorStore.text}">No role menus yet</h3>
        <p class="text-sm max-w-xl mx-auto" style="color: {$colorStore.muted}">
          Post a message with a dropdown or buttons, and members pick their own roles. Pronouns, colors, pings, regions:
          one menu each.
        </p>
        <button
          type="button"
          class="mt-6 inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl transition-all hover:scale-[1.02] min-h-[44px] font-medium"
          style="background: {$colorStore.primary}20; color: {$colorStore.primary}; border: 1px solid {$colorStore.primary}30;"
          onclick={startNew}
        >
          <i class="fa-solid fa-plus" aria-hidden="true"></i>
          Create your first menu
        </button>

        {#if importSources.length > 0}
          <p class="text-sm mt-6" style="color: {$colorStore.muted}">
            You have {importSources.length} older emoji role setups you can move over.
          </p>
          <button
            type="button"
            class="mt-3 inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl transition-all hover:scale-[1.02] min-h-[44px] font-medium"
            style="background: {$colorStore.primary}08; color: {$colorStore.text}; border: 1px solid {$colorStore.primary}20;"
            onclick={() => { activeTab = "move"; }}
          >
            <i class="fa-solid fa-arrow-right-arrow-left" aria-hidden="true"></i>
            Move older setups
          </button>
        {/if}
      </div>
    {:else}
      <div class="w-full space-y-4" in:fade={{ duration: 200 }}>
        <p class="text-sm" style="color: {$colorStore.muted}">{menus.length} of {MAX_MENUS} menus</p>

        {#each menus as menu (menu.id)}
          {@const notPosted = menu.status === "not_posted"}
          {@const rest = menu.options.length - MAX_CHIPS}
          <div class="rounded-2xl border p-5 md:p-6 shadow-2xl space-y-4"
               style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15, {$colorStore.gradientEnd}10);
                      border-color: {$colorStore.primary}30;">
            <div class="flex flex-wrap items-center gap-3">
              <h2 class="text-lg font-bold min-w-0 truncate" style="color: {$colorStore.text}">{menu.name}</h2>
              <span class="text-xs px-2 py-1 rounded-lg font-medium"
                    style="background: {statusColor(menu.status)}20; color: {statusColor(menu.status)};">
                {statusLabel(menu.status)}
              </span>
            </div>

            <p class="text-sm" style="color: {$colorStore.muted}">
              {[
                channelLabel(menu.channelName),
                menu.style === RoleMenuStyle.Buttons ? "Buttons" : "Dropdown",
                menu.mode === RoleMenuMode.PickOne ? "Pick one" : "Pick any",
                `${menu.options.length} options`
              ].join(" · ")}
            </p>

            {#if menu.options.length > 0}
              <div class="flex flex-wrap gap-2">
                {#each menu.options.slice(0, MAX_CHIPS) as option (option.id)}
                  {@const url = emojiImageUrl(option.emoji)}
                  <span class="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm"
                        style="background: {option.problem ? '#ef444420' : $colorStore.primary + '20'};
                               color: {option.problem ? '#ef4444' : $colorStore.primary};"
                        title={option.problem ?? undefined}>
                    <span class="w-2 h-2 rounded-full shrink-0" style="background: {roleColorHex(option.roleColor)};"></span>
                    {#if url}
                      <img src={url} alt="" class="w-4 h-4" />
                    {:else if option.emoji}
                      <span>{option.emoji}</span>
                    {/if}
                    <span>{option.label}</span>
                    {#if option.problem}
                      <i class="fa-solid fa-circle-exclamation" aria-hidden="true"></i>
                      <span class="sr-only">{option.problem}</span>
                    {/if}
                  </span>
                {/each}
                {#if rest > 0}
                  <span class="flex items-center px-3 py-1.5 rounded-lg text-sm"
                        style="background: {$colorStore.primary}20; color: {$colorStore.primary};">+{rest}</span>
                {/if}
              </div>
            {/if}

            {#if menu.status === "channel_missing"}
              <div class="p-3 rounded-lg flex items-center gap-2 text-sm"
                   style="background: #ef444420; color: #ef4444;">
                <i class="fa-solid fa-circle-exclamation" aria-hidden="true"></i>
                <span>Its channel was deleted. Edit the menu, pick a new channel, and save to post it again.</span>
              </div>
            {/if}

            <div class="flex flex-wrap gap-2">
              <button
                type="button"
                class="flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-all hover:scale-[1.02] min-h-[44px] text-sm font-medium"
                style={notPosted
                  ? `background: ${$colorStore.primary}08; color: ${$colorStore.text}; border: 1px solid ${$colorStore.primary}20;`
                  : `background: ${$colorStore.primary}20; color: ${$colorStore.primary}; border: 1px solid ${$colorStore.primary}30;`}
                onclick={() => startEdit(menu)}
              >
                <i class="fa-solid fa-pen" aria-hidden="true"></i>
                Edit
              </button>
              <button
                type="button"
                class="flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-all hover:scale-[1.02] min-h-[44px] text-sm font-medium disabled:opacity-50"
                style="background: {$colorStore.primary}08; color: {$colorStore.text}; border: 1px solid {$colorStore.primary}20;"
                onclick={() => toggleEnabled(menu)}
                disabled={busy[menu.id]}
              >
                <i class="fa-solid {menu.enabled ? 'fa-pause' : 'fa-play'}" aria-hidden="true"></i>
                {menu.enabled ? "Pause" : "Resume"}
              </button>
              <button
                type="button"
                class="flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-all hover:scale-[1.02] min-h-[44px] text-sm font-medium disabled:opacity-50"
                style={notPosted
                  ? `background: ${$colorStore.primary}20; color: ${$colorStore.primary}; border: 1px solid ${$colorStore.primary}30;`
                  : `background: ${$colorStore.primary}08; color: ${$colorStore.text}; border: 1px solid ${$colorStore.primary}20;`}
                onclick={() => repost(menu)}
                disabled={busy[menu.id]}
              >
                <i class="fa-solid {busy[menu.id] ? 'fa-spinner fa-spin' : 'fa-paper-plane'}" aria-hidden="true"></i>
                Post again
              </button>
              {#if menu.jumpUrl}
                <a href={menu.jumpUrl}
                   target="_blank"
                   rel="noopener noreferrer"
                   class="flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-all hover:scale-[1.02] min-h-[44px] text-sm font-medium"
                   style="background: {$colorStore.primary}08; color: {$colorStore.text}; border: 1px solid {$colorStore.primary}20;">
                  <i class="fa-solid fa-arrow-up-right-from-square" aria-hidden="true"></i>
                  Open in Discord
                </a>
              {/if}
              <button
                type="button"
                class="flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-all hover:scale-[1.02] min-h-[44px] text-sm font-medium sm:ml-auto disabled:opacity-50"
                style="background: #ef444420; color: #ef4444; border: 1px solid #ef444430;"
                onclick={() => deleteMenu(menu)}
                disabled={busy[menu.id]}
              >
                <i class="fa-solid fa-trash" aria-hidden="true"></i>
                Delete
              </button>
            </div>
          </div>
        {/each}
      </div>
    {/if}
  </div>

  <div class:hidden={activeTab !== 'move'}>
    <RoleMenuImport
      sources={importSources}
      {lookups}
      onmoved={handleMoved}
      onerror={(text) => showMessage(text, "error")}
    />
  </div>
</DashboardPageLayout>
