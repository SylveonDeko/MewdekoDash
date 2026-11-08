<script lang="ts">
  import { m } from "$lib/i18n";
  import { untrack } from "svelte";
  import { reputationApi } from "$lib/api/index.ts";
  import type { RoleReward } from "$lib/api/reputation/models";
  import { colorStore } from "$lib/stores/colorStore";
  import { logger } from "$lib/logger";
  import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";
  import SettingField from "$lib/components/forms/SettingField.svelte";
  import ToggleRow from "$lib/components/forms/ToggleRow.svelte";
  import Sheet from "$lib/components/ui/Sheet.svelte";
  import NumberField from "./NumberField.svelte";
  import { idString, type Named, type Notify } from "./repModel";

  interface Props {
    guildId: bigint;
    reward: RoleReward | null;
    roles: Named[];
    channels: Named[];
    notify: Notify;
    onclose: () => void;
    onsaved: () => Promise<void>;
  }

  let { guildId, reward, roles, channels, notify, onclose, onsaved }: Props = $props();

  const initial = untrack(() => reward);

  let roleId = $state<string | null>(initial ? idString(initial.roleId) : null);
  let repRequired = $state(initial?.repRequired ?? 100);
  let announceChannel = $state<string | null>(initial?.announceChannel ? idString(initial.announceChannel) : null);
  let xpReward = $state<number | null>(initial?.xpReward ?? null);
  let removeOnDrop = $state(initial?.removeOnDrop ?? true);
  let announceDM = $state(initial?.announceDM ?? false);
  let saving = $state(false);

  async function save() {
    if (!roleId) return;
    saving = true;
    try {
      await reputationApi.addOrUpdateRoleReward(guildId, {
        roleId: BigInt(roleId),
        repRequired,
        removeOnDrop,
        announceChannelId: announceChannel ? BigInt(announceChannel) : null,
        announceDM,
        xpReward: xpReward || 0
      });
      notify(m.common.roleRewardAdded());
      await onsaved();
      onclose();
    } catch (err) {
      logger.error("Failed to save a role reward:", err);
      notify(m.common.failedToAddRoleReward(), "error");
    } finally {
      saving = false;
    }
  }
</script>

<Sheet title={reward ? reward.roleName : m.common.addRoleReward()} {onclose}>
  <SettingField label={m.common.role()} id="rep-reward-role">
    <DiscordSelector
      id="rep-reward-role"
      type="role"
      options={roles}
      selected={roleId}
      placeholder={m.common.selectRolePlaceholder()}
      ariaLabel={m.common.role()}
      onchange={({ selected }) => (roleId = (selected as string) || null)}
    />
  </SettingField>

  <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
    <NumberField id="rep-reward-required" label={m.reputation.repRequiredLabel()} value={repRequired} min={0} onchange={(value) => (repRequired = value ?? 0)} />
    <NumberField id="rep-reward-xp" label={m.reputation.bonusXpLabel()} value={xpReward} min={0} nullable placeholder={m.common.none()} onchange={(value) => (xpReward = value)} />
  </div>

  <SettingField label={m.reputation.announceChannelLabel()} id="rep-reward-channel">
    <DiscordSelector
      id="rep-reward-channel"
      type="channel"
      options={channels}
      selected={announceChannel}
      placeholder={m.common.noAnnouncements()}
      ariaLabel={m.reputation.announceChannelLabel()}
      onchange={({ selected }) => (announceChannel = (selected as string) || null)}
    />
  </SettingField>

  <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
    <ToggleRow checked={removeOnDrop} title={m.reputation.removeOnDropLabel()} colors={$colorStore} class="h-full" onchange={(v) => (removeOnDrop = v)} />
    <ToggleRow checked={announceDM} title={m.reputation.sendDmLabel()} colors={$colorStore} class="h-full" onchange={(v) => (announceDM = v)} />
  </div>

  {#snippet footer()}
    <button type="button" class="px-4 rounded-lg min-h-[44px]" style="background: {$colorStore.primary}10; color: {$colorStore.text}; border: 1px solid {$colorStore.primary}20;" onclick={onclose}>
      {m.common.cancel()}
    </button>
    <button type="button" class="px-5 rounded-lg min-h-[44px] font-medium disabled:opacity-50" style="background: {$colorStore.primary}; color: {$colorStore.onPrimary};" disabled={saving || !roleId} onclick={save}>
      {saving ? m.common.saving() : m.common.save()}
    </button>
  {/snippet}
</Sheet>
