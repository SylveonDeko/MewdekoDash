<script lang="ts">
  import { m } from "$lib/i18n";
  import type { GuildEmojiInfo } from "$lib/api/client/models";
  import { colorStore } from "$lib/stores/colorStore";
  import type { FormSettings } from "$lib/utils/formSettings";
  import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";
  import EmojiPicker from "$lib/components/forms/EmojiPicker.svelte";
  import SettingField from "$lib/components/forms/SettingField.svelte";
  import ToggleRow from "$lib/components/forms/ToggleRow.svelte";
  import PluginCard from "$lib/components/plugin/PluginCard.svelte";
  import NumberField from "../NumberField.svelte";
  import type { Named } from "../formsModel";

  interface Props {
    settings: FormSettings;
    roles: Named[];
    emojis: GuildEmojiInfo[];
    guildApproveEmote: string | null;
    guildRejectEmote: string | null;
  }

  let { settings = $bindable(), roles, emojis, guildApproveEmote, guildRejectEmote }: Props = $props();

  const regular = $derived(settings.formType === "Regular");
  const reviewed = $derived(settings.requireApproval || settings.formType !== "Regular");
  const inputStyle = $derived(`background: ${$colorStore.primary}10; border-color: ${$colorStore.primary}30; color: ${$colorStore.text};`);

  function pick(selected: unknown): string {
    return typeof selected === "string" ? selected : "";
  }

  function pickMany(selected: unknown): string[] {
    return Array.isArray(selected) ? (selected as string[]) : [];
  }

  function pickEmote(selected: unknown): string | null {
    return typeof selected === "string" && selected ? selected : null;
  }
</script>

{#snippet roleList(id: string, label: string, value: string[], set: (next: string[]) => void)}
  <SettingField {label} {id}>
    <DiscordSelector {id} type="role" options={roles} selected={value} multiple placeholder={m.common.noRoles()} onchange={({ selected }) => set(pickMany(selected))} />
  </SettingField>
{/snippet}

<PluginCard title={m.forms.settingsWhenSomeoneSubmitsTitle()} alwaysOpen>
  <SettingField label={m.forms.settingsNotifyRole()} id="form-notify-role">
    <DiscordSelector
      id="form-notify-role"
      type="role"
      options={roles}
      selected={settings.notifyRoleId}
      placeholder={m.forms.settingsPingNobodyPlaceholder()}
      onchange={({ selected }) => (settings.notifyRoleId = pick(selected))}
    />
  </SettingField>

  {#if settings.allowAnonymous}
    <p class="text-sm" style="color: {$colorStore.muted}">{m.forms.settingsAnonymousRolesNote()}</p>
  {:else}
    {@render roleList("form-submit-roles", m.forms.settingsSubmitRoles(), settings.submitRoleIds, (next) => (settings.submitRoleIds = next))}
    <SettingField label={m.forms.settingsPendingRole()} id="form-pending-role">
      <DiscordSelector
        id="form-pending-role"
        type="role"
        options={roles}
        selected={settings.pendingRoleId}
        placeholder={m.common.noRole()}
        onchange={({ selected }) => (settings.pendingRoleId = pick(selected))}
      />
    </SettingField>
  {/if}

  <SettingField label={m.forms.settingsWebhookUrl()} id="form-webhook">
    <input
      id="form-webhook"
      type="url"
      bind:value={settings.notificationWebhookUrl}
      placeholder="https://"
      class="w-full p-3 rounded-lg border min-h-[50px]"
      style={inputStyle}
    />
  </SettingField>
</PluginCard>

<PluginCard title={m.forms.settingsReviewingAnswersTitle()} alwaysOpen>
  {#if regular}
    <ToggleRow colors={$colorStore} checked={settings.requireApproval} title={m.forms.settingsRequireApproval()} subtitle={m.forms.settingsRequireApprovalHint()} onchange={(on) => (settings.requireApproval = on)} />
  {:else}
    <p class="text-sm" style="color: {$colorStore.muted}">
      {settings.formType === "BanAppeal" ? m.forms.settingsBanAppealsReview() : m.forms.settingsJoinApplicationsReview()}
    </p>
  {/if}

  {#if reviewed}
    <SettingField label={m.forms.settingsReviewerRole()} id="form-reviewer-role">
      <DiscordSelector
        id="form-reviewer-role"
        type="role"
        options={roles}
        selected={settings.reviewerRoleId}
        placeholder={m.forms.settingsManageServerOnlyPlaceholder()}
        onchange={({ selected }) => (settings.reviewerRoleId = pick(selected))}
      />
    </SettingField>

    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <SettingField label={m.forms.settingsApproveEmote()} id="form-approve-emote">
        <EmojiPicker
          id="form-approve-emote"
          guildEmojis={emojis}
          selected={settings.approveEmote}
          multiple={false}
          placeholder={guildApproveEmote || m.forms.settingsEmoteServerDefault()}
          onchange={({ selected }) => (settings.approveEmote = pickEmote(selected))}
        />
      </SettingField>
      <SettingField label={m.forms.settingsRejectEmote()} id="form-reject-emote">
        <EmojiPicker
          id="form-reject-emote"
          guildEmojis={emojis}
          selected={settings.rejectEmote}
          multiple={false}
          placeholder={guildRejectEmote || m.forms.settingsRejectEmoteServerDefault()}
          onchange={({ selected }) => (settings.rejectEmote = pickEmote(selected))}
        />
      </SettingField>
    </div>

    {#if !settings.allowAnonymous}
      <h4 class="text-sm font-medium" style="color: {$colorStore.text}">{m.forms.settingsOnApproval()}</h4>
      {@render roleList("form-approval-add", m.forms.settingsApprovalAddRoles(), settings.approvalAddRoleIds, (next) => (settings.approvalAddRoleIds = next))}
      {@render roleList("form-approval-remove", m.forms.settingsApprovalRemoveRoles(), settings.approvalRemoveRoleIds, (next) => (settings.approvalRemoveRoleIds = next))}
      <h4 class="text-sm font-medium" style="color: {$colorStore.text}">{m.forms.settingsOnRejection()}</h4>
      {@render roleList("form-rejection-add", m.forms.settingsRejectionAddRoles(), settings.rejectionAddRoleIds, (next) => (settings.rejectionAddRoleIds = next))}
      {@render roleList("form-rejection-remove", m.forms.settingsRejectionRemoveRoles(), settings.rejectionRemoveRoleIds, (next) => (settings.rejectionRemoveRoleIds = next))}
    {/if}
  {/if}
</PluginCard>

{#if settings.formType === "BanAppeal"}
  <PluginCard title={m.forms.settingsAppealLimitsTitle()} alwaysOpen>
    <ToggleRow
      colors={$colorStore}
      checked={settings.blockReappealAfterRejection}
      title={m.forms.settingsBlockReappeal()}
      subtitle={m.forms.settingsBlockReappealHint()}
      onchange={(on) => (settings.blockReappealAfterRejection = on)}
    />
    <NumberField
      id="form-appeal-delay"
      label={m.forms.settingsAppealDelay()}
      value={settings.appealDelayDays}
      placeholder={m.forms.settingsNoWaitPlaceholder()}
      onchange={(value) => (settings.appealDelayDays = value)}
    />
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <NumberField
        id="form-max-appeals"
        label={m.forms.settingsMaxAppeals()}
        min={1}
        value={settings.maxAppealAttempts}
        disabled={settings.blockReappealAfterRejection}
        placeholder={m.forms.settingsUnlimitedPlaceholder()}
        onchange={(value) => (settings.maxAppealAttempts = value)}
      />
      <NumberField
        id="form-appeal-cooldown"
        label={m.forms.settingsReappealCooldown()}
        value={settings.reappealCooldownDays}
        disabled={settings.blockReappealAfterRejection}
        placeholder={m.forms.settingsNoWaitPlaceholder()}
        onchange={(value) => (settings.reappealCooldownDays = value)}
      />
    </div>
  </PluginCard>
{/if}

{#if settings.formType === "JoinApplication"}
  <PluginCard title={m.forms.settingsTheInviteSentOnApprovalTitle()} alwaysOpen>
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <NumberField
        id="form-invite-uses"
        label={m.forms.settingsInviteMaxUses()}
        min={1}
        value={settings.inviteMaxUses}
        onchange={(value) => (settings.inviteMaxUses = value ?? 1)}
      />
      <NumberField
        id="form-invite-age"
        label={m.forms.settingsInviteMaxAge()}
        hint={m.forms.settingsInviteMaxAgeHint()}
        value={settings.inviteMaxAge}
        onchange={(value) => (settings.inviteMaxAge = value ?? 0)}
      />
    </div>
    {@render roleList("form-auto-approve", m.forms.settingsAutoApproveRoles(), settings.autoApproveRoleIds, (next) => (settings.autoApproveRoleIds = next))}
  </PluginCard>
{/if}
