<script lang="ts">
  import { onMount } from "svelte";
  import { m } from "$lib/i18n";
  import { utilityApi, type StreamRoleSettings } from "$lib/api/index.ts";
  import { colorStore } from "$lib/stores/colorStore";
  import { logger } from "$lib/logger";
  import { requestConfirmation } from "$lib/stores/confirmationStore";
  import type { AutoSave } from "$lib/utils/autoSave.svelte";
  import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";
  import PluginCard from "$lib/components/plugin/PluginCard.svelte";
  import SettingField from "$lib/components/forms/SettingField.svelte";
  import ChipList from "./ChipList.svelte";
  import { errorText, type Named, type TabProps } from "./utilityModel";

  interface Props extends TabProps {
    roles: Named[];
    members: Named[];
    autoSave: AutoSave;
  }

  let { guildId, roles, members, autoSave, onerror }: Props = $props();

  type ListName = "whitelist" | "blacklist";

  let settings: StreamRoleSettings | null = $state(null);
  let fromRole: string | null = $state(null);
  let addRole: string | null = $state(null);
  let keyword = $state("");
  let picks: Record<ListName, string | null> = $state({ whitelist: null, blacklist: null });
  let busy = $state(false);

  const lists = $derived<Array<{ name: ListName; title: string; hint: string }>>([
    { name: "whitelist", title: m.common.whitelist(), hint: m.utility.streamroleWhitelistHint() },
    { name: "blacklist", title: m.common.blacklist(), hint: m.utility.streamroleBlacklistHint() }
  ]);

  function roleId(value: bigint | null | undefined): string | null {
    return value && value.toString() !== "0" ? value.toString() : null;
  }

  async function load() {
    try {
      const loaded = await utilityApi.getStreamRole(guildId);
      settings = loaded;
      fromRole = roleId(loaded.fromRoleId);
      addRole = roleId(loaded.addRoleId);
      keyword = loaded.keyword ?? "";
    } catch (err) {
      logger.error("Failed to load stream role:", err);
      onerror(errorText(err, m.utility.streamroleLoadFailed()));
    }
  }

  function applyRoles(from: string | null, add: string | null) {
    const previous = { from: fromRole, add: addRole };
    fromRole = from;
    addRole = add;
    if (!settings?.enabled || !from || !add) return;
    void autoSave.now("streamrole-roles", async () => {
      try {
        await utilityApi.setStreamRole(guildId, BigInt(from), BigInt(add));
      } catch (err) {
        fromRole = previous.from;
        addRole = previous.add;
        throw err;
      }
    });
  }

  async function toggle(value: boolean) {
    if (!settings) return;
    if (value) {
      if (!fromRole || !addRole) {
        onerror(m.utility.streamrolePickBoth());
        return;
      }
      const from = fromRole;
      const add = addRole;
      await autoSave.now("streamrole-enabled", async () => {
        await utilityApi.setStreamRole(guildId, BigInt(from), BigInt(add));
        if (settings) settings.enabled = true;
      });
      return;
    }
    const confirmed = await requestConfirmation({
      message: m.utility.streamroleDisableConfirm(),
      confirmText: m.common.disable()
    });
    if (!confirmed) return;
    await autoSave.now("streamrole-enabled", async () => {
      await utilityApi.stopStreamRole(guildId);
      if (settings) settings.enabled = false;
    });
  }

  function saveKeyword() {
    const value = keyword.trim() || null;
    autoSave.schedule("streamrole-keyword", async () => {
      await utilityApi.setStreamRoleKeyword(guildId, value);
    });
  }

  async function changeList(list: ListName, action: () => Promise<unknown>) {
    busy = true;
    try {
      await action();
      await load();
    } catch (err) {
      logger.error("Failed to update stream role list:", err);
      onerror(errorText(err, m.utility.streamroleListFailed()));
    } finally {
      busy = false;
    }
    picks[list] = null;
  }

  onMount(load);
</script>

<div onfocusout={() => autoSave.flush("streamrole-keyword")} role="presentation" class="space-y-4 min-w-0">
  <PluginCard
    title={m.utility.tabStreamrole()}
    enabled={settings?.enabled ?? false}
    onToggle={toggle}
    alwaysOpen
  >
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <SettingField label={m.utility.streamroleEligible()} id="streamrole-from">
        <DiscordSelector
          type="role"
          options={roles}
          selected={fromRole}
          placeholder={m.utility.streamroleEligiblePlaceholder()}
          id="streamrole-from"
          ariaLabel={m.utility.streamroleEligible()}
          onchange={({ selected }) => applyRoles(typeof selected === "string" ? selected : null, addRole)}
        />
      </SettingField>
      <SettingField label={m.utility.streamroleAdded()} id="streamrole-add">
        <DiscordSelector
          type="role"
          options={roles}
          selected={addRole}
          placeholder={m.common.selectARolePlaceholder()}
          id="streamrole-add"
          ariaLabel={m.utility.streamroleAdded()}
          onchange={({ selected }) => applyRoles(fromRole, typeof selected === "string" ? selected : null)}
        />
      </SettingField>
    </div>

    <SettingField label={m.utility.streamroleKeyword()} hint={m.utility.streamroleKeywordHint()} id="streamrole-keyword">
      <input
        id="streamrole-keyword"
        type="text"
        bind:value={keyword}
        oninput={saveKeyword}
        placeholder={m.utility.streamroleKeywordPlaceholder()}
        class="w-full p-3 rounded-lg border focus:ring-2 min-h-[50px]"
        style="background: {$colorStore.primary}10; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
      >
    </SettingField>
  </PluginCard>

  <PluginCard title={m.utility.streamroleExceptionsTitle()} alwaysOpen>
    {#each lists as list (list.name)}
      <div class="space-y-3 min-w-0">
        <div>
          <span id="streamrole-{list.name}" class="block text-sm font-medium" style="color: {$colorStore.text}">{list.title}</span>
          <span class="block text-xs" style="color: {$colorStore.muted}">{list.hint}</span>
        </div>
        <div class="flex flex-col sm:flex-row gap-3">
          <div class="grow min-w-0">
            <DiscordSelector
              type="user"
              options={members.filter((x) => !settings?.[list.name].some((u) => u.userId.toString() === x.id))}
              selected={picks[list.name]}
              ariaLabelledby="streamrole-{list.name}"
              onchange={({ selected }) => (picks[list.name] = typeof selected === "string" ? selected : null)}
            />
          </div>
          <button
            type="button"
            class="px-5 rounded-xl min-h-[50px] font-medium disabled:opacity-50"
            style="background: {$colorStore.primary}; color: {$colorStore.onPrimary};"
            disabled={busy || !picks[list.name]}
            onclick={() => changeList(list.name, () => utilityApi.addStreamRoleListUser(guildId, list.name, BigInt(picks[list.name]!)))}
          >
            {m.common.add()}
          </button>
        </div>
        <ChipList
          disabled={busy}
          items={(settings?.[list.name] ?? []).map((u) => ({
            key: u.userId.toString(),
            label: u.username ?? u.userId.toString(),
            removeLabel: m.utility.streamroleRemoveAria({ user: u.username ?? u.userId.toString() })
          }))}
          onremove={(id) => changeList(list.name, () => utilityApi.removeStreamRoleListUser(guildId, list.name, BigInt(id)))}
        />
      </div>
    {/each}
  </PluginCard>
</div>
