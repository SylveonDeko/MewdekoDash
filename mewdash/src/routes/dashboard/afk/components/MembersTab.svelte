<script lang="ts">
  import { m } from "$lib/i18n";
  import { onMount } from "svelte";
  import { slide } from "svelte/transition";
  import { afkApi, clientApi, type UserWithAfk } from "$lib/api/index.ts";
  import { colorStore } from "$lib/stores/colorStore";
  import { logger } from "$lib/logger";
  import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";
  import SettingField from "$lib/components/forms/SettingField.svelte";
  import PluginCard from "$lib/components/plugin/PluginCard.svelte";
  import ConfirmationModal from "$lib/components/ui/ConfirmationModal.svelte";
  import { errorText, formatDate, MAX_LENGTH } from "./afkModel";

  interface Props {
    guildId: bigint;
    notify: (message: string, type?: "success" | "error") => void;
  }

  let { guildId, notify }: Props = $props();

  let users: UserWithAfk[] = $state([]);
  let members: Array<{ id: string; name: string }> = $state([]);
  let loading = $state(true);
  let selected = $state(new Set<string>());
  let expanded: string | null = $state(null);
  let pickedMember: string | null = $state(null);
  let draft = $state("");
  let setting = $state(false);
  let confirmOpen = $state(false);
  let pendingRemoval: UserWithAfk[] = $state([]);

  const iconButton = $derived(
    `background: ${$colorStore.primary}10; color: ${$colorStore.text}; border: 1px solid ${$colorStore.primary}20;`
  );
  const timedCount = $derived(users.filter((user) => user.afkStatus?.wasTimed).length);
  const allSelected = $derived(users.length > 0 && selected.size === users.length);

  async function load() {
    loading = true;
    try {
      const response = await afkApi.getAllAfkStatus(guildId);
      users = response.filter((user) => !!user.afkStatus?.message);
      selected = new Set([...selected].filter((id) => users.some((user) => String(user.userId) === id)));
    } catch (err) {
      logger.error("Failed to load AFK members:", err);
      notify(errorText(err, m.afk.fetchUsersFailed()), "error");
    } finally {
      loading = false;
    }
  }

  async function loadMembers() {
    try {
      members = (await clientApi.getMembers(guildId))
        .map((x) => ({ id: String(x.id), name: x.username ?? String(x.id) }))
        .sort((a, b) => a.name.localeCompare(b.name));
    } catch (err) {
      logger.error("Failed to load members:", err);
    }
  }

  function toggle(id: string) {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    selected = next;
  }

  function toggleAll() {
    selected = allSelected ? new Set() : new Set(users.map((user) => String(user.userId)));
  }

  function askRemove(targets: UserWithAfk[]) {
    if (targets.length === 0) return;
    pendingRemoval = targets;
    confirmOpen = true;
  }

  async function remove() {
    const targets = pendingRemoval;
    try {
      await Promise.all(targets.map((user) => afkApi.deleteAfkStatus(guildId, user.userId)));
      notify(
        targets.length === 1
          ? m.afk.notifyCleared({ name: targets[0].username })
          : m.afk.notifyBulkRemoved({ count: targets.length })
      );
      selected = new Set();
    } catch (err) {
      logger.error("Failed to clear AFK status:", err);
      notify(m.afk.notifyClearFailed({ error: errorText(err, m.common.unknownError()) }), "error");
    }
    await load();
  }

  async function setAfk() {
    const message = draft.trim();
    if (!pickedMember || !message || setting) return;
    setting = true;
    try {
      await afkApi.setAfkStatus(guildId, BigInt(pickedMember), message);
      draft = "";
      pickedMember = null;
      await load();
    } catch (err) {
      logger.error("Failed to set AFK status:", err);
      notify(errorText(err, m.afk.notifySetFailed()), "error");
    } finally {
      setting = false;
    }
  }

  onMount(() => {
    void load();
    void loadMembers();
  });
</script>

{#snippet refresh()}
  <button type="button" class="flex items-center justify-center gap-2 px-5 rounded-xl min-h-[50px] font-medium"
          style={iconButton} disabled={loading} onclick={load}>
    <i class="fa-solid fa-arrows-rotate {loading ? 'fa-spin' : ''}" aria-hidden="true"></i>
    {m.common.refresh()}
  </button>
{/snippet}

<div class="space-y-4 min-w-0">
  <PluginCard title={m.afk.membersTitle()} alwaysOpen actions={refresh}>
    {#if users.length > 0}
      <div class="flex flex-wrap items-center gap-3">
        <label class="flex items-center gap-3 min-h-[44px] cursor-pointer">
          <input type="checkbox" class="w-5 h-5 shrink-0" style="accent-color: {$colorStore.primary};"
                 checked={allSelected} onchange={toggleAll}>
          <span class="text-sm font-medium" style="color: {$colorStore.text}">{m.common.selectAllCount({ count: users.length })}</span>
        </label>
        <span class="text-sm" style="color: {$colorStore.muted}">{m.afk.timedCount({ count: timedCount })}</span>
        {#if selected.size > 0}
          <button type="button" class="px-4 rounded-lg min-h-[44px] font-medium flex items-center gap-2 w-full sm:w-auto sm:ml-auto justify-center"
                  style={iconButton}
                  onclick={() => askRemove(users.filter((user) => selected.has(String(user.userId))))}>
            <i class="fa-solid fa-user-minus" aria-hidden="true"></i>
            {m.afk.actionRemoveCount({ count: selected.size })}
          </button>
        {/if}
      </div>
    {/if}

    {#if loading && users.length === 0}
      <div class="flex justify-center py-8">
        <div class="w-8 h-8 border-4 rounded-full animate-spin"
             style="border-color: {$colorStore.primary}20; border-top-color: {$colorStore.primary};"></div>
      </div>
    {:else if users.length === 0}
      <p class="text-sm" style="color: {$colorStore.muted}">{m.afk.usersEmpty()}</p>
    {:else}
      <div class="space-y-2">
        {#each users as user (String(user.userId))}
          {@const id = String(user.userId)}
          {@const open = expanded === id}
          <div class="rounded-xl border min-w-0"
               style="background: {selected.has(id) ? $colorStore.selectedSurface : `${$colorStore.primary}08`}; border-color: {selected.has(id) ? $colorStore.selectedBorder : `${$colorStore.primary}20`};">
            <div class="flex items-center gap-1 p-1 min-w-0">
              <label class="inline-flex items-center justify-center min-h-[44px] min-w-[44px] cursor-pointer shrink-0">
                <input type="checkbox" class="w-5 h-5" style="accent-color: {$colorStore.primary};"
                       aria-label={m.afk.selectAria({ name: user.username })}
                       checked={selected.has(id)} onchange={() => toggle(id)}>
              </label>
              <button type="button" class="grow min-w-0 flex items-center gap-3 text-left min-h-[44px] rounded-lg px-1"
                      aria-expanded={open} onclick={() => (expanded = open ? null : id)}>
                <img src={user.avatarUrl} alt="" class="w-10 h-10 rounded-full shrink-0">
                <span class="min-w-0 grow">
                  <span class="flex items-center gap-2 min-w-0">
                    <span class="font-medium truncate" style="color: {$colorStore.text}">{user.nickname || user.username}</span>
                    <span class="text-xs px-2 py-0.5 rounded-full shrink-0"
                          style="background: {$colorStore.primary}20; color: {$colorStore.text};">
                      {user.afkStatus?.wasTimed ? m.afk.badgeTimed() : m.afk.badgePermanent()}
                    </span>
                  </span>
                  <span class="block text-sm truncate" style="color: {$colorStore.muted}">{user.afkStatus?.message}</span>
                </span>
              </button>
              <button type="button" class="rounded-lg min-h-[44px] min-w-[44px] shrink-0" style={iconButton}
                      aria-label={m.afk.removeAria({ name: user.username })} onclick={() => askRemove([user])}>
                <i class="fa-solid fa-user-minus" aria-hidden="true"></i>
              </button>
            </div>
            {#if open}
              <div class="px-4 pb-4 pt-2 space-y-2 border-t text-sm" style="border-color: {$colorStore.primary}20;"
                   transition:slide={{ duration: 150 }}>
                <p class="break-words" style="color: {$colorStore.text}">{user.afkStatus?.message}</p>
                <p style="color: {$colorStore.muted}">{m.afk.summarySince({ date: formatDate(user.afkStatus?.dateAdded) || m.common.unknown() })}</p>
                {#if user.afkStatus?.wasTimed}
                  <p style="color: {$colorStore.muted}">{m.afk.summaryExpires({ date: formatDate(user.afkStatus?.when) || m.common.unknown() })}</p>
                {/if}
                {#if user.nickname}
                  <p style="color: {$colorStore.muted}">{user.username}</p>
                {/if}
              </div>
            {/if}
          </div>
        {/each}
      </div>
    {/if}
  </PluginCard>

  <PluginCard title={m.afk.setTitle()} alwaysOpen>
    <div class="grid gap-4 sm:grid-cols-2">
      <SettingField label={m.common.member()} id="afk-set-member">
        <DiscordSelector id="afk-set-member" type="user"
                         options={members.filter((x) => !users.some((u) => String(u.userId) === x.id))}
                         selected={pickedMember}
                         onchange={({ selected: value }) => (pickedMember = (value as string) ?? null)} />
      </SettingField>
      <SettingField label={m.afk.setMessage()} id="afk-set-message">
        <input id="afk-set-message" type="text" bind:value={draft} maxlength={MAX_LENGTH} autocomplete="off"
               class="w-full p-3 rounded-lg border focus:ring-2 min-h-[50px]"
               style="background: {$colorStore.primary}10; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
               onkeydown={(e) => e.key === "Enter" && setAfk()}>
      </SettingField>
    </div>
    <button type="button" class="px-5 rounded-xl min-h-[50px] font-medium disabled:opacity-50"
            style="background: {$colorStore.primary}; color: {$colorStore.onPrimary};"
            disabled={!pickedMember || !draft.trim() || setting} onclick={setAfk}>
      {m.afk.setButton()}
    </button>
  </PluginCard>
</div>

<ConfirmationModal
  bind:isOpen={confirmOpen}
  title={m.afk.removeTitle()}
  message={pendingRemoval.length === 1
    ? m.afk.removeMessage({ name: pendingRemoval[0].username })
    : m.afk.bulkRemoveMessage({ count: pendingRemoval.length })}
  confirmText={m.afk.removeConfirm()}
  variant="danger"
  onconfirm={remove}
  oncancel={() => (confirmOpen = false)}
/>
