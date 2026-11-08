<script lang="ts">
  import { m } from "$lib/i18n";
  import { AccessGrantMode, channelAccessApi, type ChannelAccessGate } from "$lib/api/index.ts";
  import { colorStore } from "$lib/stores/colorStore";
  import { logger } from "$lib/logger";
  import { userStore } from "$lib/stores/userStore";
  import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";
  import SettingField from "$lib/components/forms/SettingField.svelte";
  import Sheet from "$lib/components/ui/Sheet.svelte";
  import { errorText, type Named } from "./channelAccessModel";

  interface Props {
    guildId: bigint;
    channels: Named[];
    roles: Named[];
    taken: string[];
    oncreated: (gate: ChannelAccessGate) => void;
    onclose: () => void;
    onerror: (message: string) => void;
  }

  let { guildId, channels, roles, taken, oncreated, onclose, onerror }: Props = $props();

  let channelId: string | null = $state(null);
  let roleId: string | null = $state(null);
  let mode = $state<AccessGrantMode>(AccessGrantMode.Role);
  let saving = $state(false);

  const grantOptions = $derived([
    { id: String(AccessGrantMode.Role), name: m.channelAccess.grantRole() },
    { id: String(AccessGrantMode.ChannelPermission), name: m.channelAccess.grantChannel() }
  ]);
  const ready = $derived(channelId !== null && (mode === AccessGrantMode.ChannelPermission || roleId !== null));

  async function create() {
    if (!channelId) {
      onerror(m.common.pickChannelFirstPlaceholder());
      return;
    }
    if (mode === AccessGrantMode.Role && !roleId) {
      onerror(m.channelAccess.errorPickRole());
      return;
    }
    saving = true;
    try {
      oncreated(
        await channelAccessApi.createGate(guildId, {
          channelId: BigInt(channelId),
          accessRoleId: mode === AccessGrantMode.Role && roleId ? BigInt(roleId) : null,
          userId: BigInt($userStore?.id ?? 0)
        })
      );
    } catch (err) {
      logger.error("Failed to create gate:", err);
      onerror(errorText(err, m.channelAccess.errorCreateGate()));
    } finally {
      saving = false;
    }
  }
</script>

<Sheet title={m.channelAccess.createTitle()} {onclose}>
  <SettingField label={m.channelAccess.createLockedChannel()} id="new-gate-channel">
    <DiscordSelector
      type="channel"
      options={channels.filter((x) => !taken.includes(x.id))}
      selected={channelId}
      placeholder={m.common.selectAChannelPlaceholder()}
      id="new-gate-channel"
      ariaLabel={m.channelAccess.createLockedChannel()}
      onchange={({ selected }) => (channelId = typeof selected === "string" ? selected : null)}
    />
  </SettingField>
  <SettingField label={m.channelAccess.createHowIn()} id="new-gate-mode">
    <DiscordSelector
      type="custom"
      options={grantOptions}
      customIcon="fa-key"
      selected={String(mode)}
      searchable={false}
      clearable={false}
      id="new-gate-mode"
      ariaLabel={m.channelAccess.createHowIn()}
      onchange={({ selected }) => {
        if (typeof selected !== "string") return;
        mode = Number(selected) as AccessGrantMode;
        if (mode === AccessGrantMode.ChannelPermission) roleId = null;
      }}
    />
  </SettingField>
  {#if mode === AccessGrantMode.Role}
    <SettingField label={m.channelAccess.createRoleOnApproval()} id="new-gate-role">
      <DiscordSelector
        type="role"
        options={roles}
        selected={roleId}
        placeholder={m.common.selectARolePlaceholder()}
        id="new-gate-role"
        ariaLabel={m.channelAccess.createRoleOnApproval()}
        onchange={({ selected }) => (roleId = typeof selected === "string" ? selected : null)}
      />
    </SettingField>
  {/if}

  {#snippet footer()}
    <button
      type="button"
      class="px-5 rounded-xl min-h-[44px] font-medium"
      style="background: {$colorStore.primary}10; color: {$colorStore.text}; border: 1px solid {$colorStore.primary}20;"
      onclick={onclose}
    >
      {m.common.cancel()}
    </button>
    <button
      type="button"
      class="px-5 rounded-xl min-h-[44px] font-medium disabled:opacity-50"
      style="background: {$colorStore.primary}; color: {$colorStore.onPrimary};"
      disabled={saving || !ready}
      onclick={create}
    >
      {m.channelAccess.createButton()}
    </button>
  {/snippet}
</Sheet>
