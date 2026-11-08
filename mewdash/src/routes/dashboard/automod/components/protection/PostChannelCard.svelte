<script lang="ts">
  import { m } from "$lib/i18n";
  import { colorStore } from "$lib/stores/colorStore";
  import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";
  import SettingField from "$lib/components/forms/SettingField.svelte";
  import ToggleRow from "$lib/components/forms/ToggleRow.svelte";
  import PluginCard from "$lib/components/plugin/PluginCard.svelte";
  import { idString, nameOf, type Named } from "../automodModel";
  import ActionFields from "./ActionFields.svelte";
  import TriggerCount from "./TriggerCount.svelte";
  import type { Patch, Status } from "./protectionModel";

  interface Props {
    status: Status;
    onpatch: Patch;
    ontoggle: (enabled: boolean) => void;
    roles: Named[];
    channels: Named[];
    members: Named[];
    onlist: (kind: "channels" | "ignoredRoles" | "ignoredUsers", ids: string[]) => void;
  }

  let { status, onpatch, ontoggle, roles, channels, members, onlist }: Props = $props();

  let pickedUser: string | null = $state(null);

  const toggles = $derived([
    { key: "deleteMessages", label: m.automod.deleteMessages() },
    { key: "notifyUser", label: m.automod.notifyMember() },
    { key: "ignoreBots", label: m.common.ignoreBots() }
  ]);

  const iconButton = $derived(
    `background: ${$colorStore.primary}10; color: ${$colorStore.text}; border: 1px solid ${$colorStore.primary}20;`
  );

  const ignoredUsers: string[] = $derived((status.ignoredUsers ?? []).map(idString));

  function addUser() {
    if (!pickedUser) return;
    onlist("ignoredUsers", [...ignoredUsers, pickedUser]);
    pickedUser = null;
  }
</script>

<PluginCard title={m.automod.postChannelTitle()} enabled={status.enabled} onToggle={ontoggle}>
  <SettingField label={m.automod.honeypotChannels()} hint={m.automod.honeypotHint()} id="honeypot-channels">
    <DiscordSelector
      id="honeypot-channels"
      type="channel"
      options={channels}
      selected={status.channels}
      multiple
      placeholder={m.common.addAChannel()}
      onchange={({ selected }) => onlist("channels", Array.isArray(selected) ? selected : [])}
    />
  </SettingField>

  <div class="grid gap-4 sm:grid-cols-2">
    <ActionFields id="honeypot" {status} {onpatch} {roles} durationKey="punishDuration" />
  </div>

  <SettingField label={m.common.ignoredRoles()} id="honeypot-roles">
    <DiscordSelector
      id="honeypot-roles"
      type="role"
      options={roles}
      selected={status.ignoredRoles}
      multiple
      placeholder={m.common.addARole()}
      onchange={({ selected }) => onlist("ignoredRoles", Array.isArray(selected) ? selected : [])}
    />
  </SettingField>

  <div class="space-y-2">
    <h4 class="text-sm font-medium" style="color: {$colorStore.text}">{m.common.ignoredMembers()}</h4>
    {#each ignoredUsers as id (id)}
      <div
        class="flex items-center gap-3 rounded-xl border p-2 pl-3 min-w-0"
        style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}20;"
      >
        <span class="grow min-w-0 truncate text-sm" style="color: {$colorStore.text}">{nameOf(members, id)}</span>
        <button
          type="button"
          class="rounded-lg min-h-[44px] min-w-[44px] shrink-0"
          style={iconButton}
          aria-label={m.automod.removeAria({ name: nameOf(members, id) })}
          onclick={() => onlist("ignoredUsers", ignoredUsers.filter((x) => x !== id))}
        >
          <i class="fa-solid fa-xmark" aria-hidden="true"></i>
        </button>
      </div>
    {/each}
    <div class="flex gap-3 items-stretch">
      <div class="grow min-w-0">
        <DiscordSelector
          type="user"
          options={members.filter((x) => !ignoredUsers.includes(x.id))}
          selected={pickedUser}
          ariaLabel={m.common.member()}
          placeholder={m.common.addAMember()}
          onchange={({ selected }) => (pickedUser = (selected as string) ?? null)}
        />
      </div>
      <button
        type="button"
        class="px-5 rounded-xl min-h-[50px] font-medium disabled:opacity-50"
        style="background: {$colorStore.primary}; color: {$colorStore.onPrimary};"
        disabled={!pickedUser}
        onclick={addUser}
      >
        {m.common.add()}
      </button>
    </div>
  </div>

  <div class="grid gap-2 sm:grid-cols-2">
    {#each toggles as toggle (toggle.key)}
      <ToggleRow
        checked={status[toggle.key]}
        title={toggle.label}
        colors={$colorStore}
        onchange={(value) => onpatch({ [toggle.key]: value }, "now")}
      />
    {/each}
  </div>
  <TriggerCount count={Number(status.counter ?? 0)} />
</PluginCard>
