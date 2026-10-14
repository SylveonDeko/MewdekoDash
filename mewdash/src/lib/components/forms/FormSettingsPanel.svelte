<script lang="ts">
  import { m } from "$lib/i18n";
  /**
   * Every setting on a form, grouped by the question it answers.
   *
   * Shared by the create and edit screens so a form offers the same choices whichever one you are
   * on. Groups are titled by intent rather than by data type, which is what puts "role while
   * awaiting review" next to "roles given on submitting" instead of eleven role pickers apart.
   */
  import { FORM_TYPES } from "$lib/api/index.ts";
  import { type FormSettings } from "$lib/utils/formSettings";
  import { colorStore } from "$lib/stores/colorStore";
  import { slide } from "svelte/transition";
  import DiscordSelector from "./DiscordSelector.svelte";
  import EmojiPicker from "./EmojiPicker.svelte";
  import FormTypeScope from "./FormTypeScope.svelte";
  import SettingsSection from "./SettingsSection.svelte";
  import SettingField from "./SettingField.svelte";
  import SettingToggle from "./SettingToggle.svelte";
  import { formTypeToInt } from "$lib/api/forms/models";
  import { formTypeDescription, formTypeLabel } from "./formLabels";

  interface Props {
    /** The settings being edited, bound so both screens share one object. */
    settings: FormSettings;
    /** Creating offers the form type as a choice; editing shows it as settled. */
    mode: "create" | "edit";
    channels: Array<{ id: string; name: string }>;
    roles: Array<{ id: string; name: string }>;
    guildEmojis: any[];
    /** The server's default review emotes, shown as the placeholder when a form has none. */
    guildApproveEmote?: string | null;
    guildRejectEmote?: string | null;
    /** When the launch announcement already went out, so it is not promised twice. */
    announcedAt?: string | null;
  }

  let {
    settings = $bindable(),
    mode,
    channels,
    roles,
    guildEmojis,
    guildApproveEmote = null,
    guildRejectEmote = null,
    announcedAt = null
  }: Props = $props();

  let formTypeInt = $derived(formTypeToInt(settings.formType));

  /**
   * How many of a group's settings are set, shown on the collapsed header so somebody can see
   * there is something inside without opening it.
   */
  function countSet(values: Array<unknown>): number {
    return values.filter((v) => v !== null && v !== undefined && v !== "" && v !== false).length;
  }
</script>

<div class="space-y-4">
    <!-- Basics. Name, description and where answers land cover most forms; everything else is
         grouped below by the question it answers. -->
    <div
      class="rounded-xl border p-4 sm:p-6"
      style="background: {$colorStore.primary}05; border-color: {$colorStore.primary}30;"
    >
      <h2 class="text-lg sm:text-xl font-bold mb-1" style="color: {$colorStore.text};">
        <i class="fa-solid fa-gear mr-2" style="color: {$colorStore.primary};"></i>
        {m.common.basics()}
      </h2>
      <p class="text-sm mb-4" style="color: {$colorStore.muted};">
        {m.forms.settingsBasicsSummary()}
      </p>

      <div class="space-y-4">
        <div>
          <span class="block text-sm font-medium mb-1" style="color: {$colorStore.text};">{m.forms.settingsFormType()}</span>
          <p class="text-xs mb-2" style="color: {$colorStore.muted};">
            {mode === "create" ? m.forms.settingsFormTypeHintCreate() : m.forms.settingsFormTypeHintEdit()}
          </p>

          {#if mode === "create"}
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-2" role="radiogroup" aria-label={m.forms.settingsFormType()}>
              {#each FORM_TYPES as choice}
                {@const chosen = settings.formType === choice.type}
                <label
                  class="relative flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-all border-2"
                  style="border-color: {chosen ? $colorStore.primary : 'transparent'};
                         background: {chosen ? $colorStore.primary + '15' : $colorStore.primary + '08'};"
                >
                  <input
                    type="radio"
                    name="formType"
                    value={choice.type}
                    checked={chosen}
                    onchange={() => (settings.formType = choice.type)}
                    class="sr-only"
                  />
                  <i class="fa-solid {choice.icon} mt-0.5 flex-shrink-0"
                     style="color: {chosen ? $colorStore.primary : $colorStore.muted};"
                     aria-hidden="true"></i>
                  <span class="min-w-0">
                    <span class="block text-sm font-medium" style="color: {$colorStore.text};">
                      {formTypeLabel(choice.type)}
                    </span>
                    <span class="block text-xs mt-0.5" style="color: {$colorStore.muted};">
                      {formTypeDescription(choice.type)}
                    </span>
                  </span>
                </label>
              {/each}
            </div>
          {:else}
            <div
              class="p-3 rounded-lg flex items-center gap-2"
              style="background: {$colorStore.primary}10; border: 1px solid {$colorStore.primary}20;"
            >
              <i class="fa-solid {settings.formType === 'BanAppeal' ? 'fa-gavel' : settings.formType === 'JoinApplication' ? 'fa-user-plus' : 'fa-clipboard-list'}"
                 style="color: {$colorStore.primary};" aria-hidden="true"></i>
              <span class="text-sm" style="color: {$colorStore.text};">
                {formTypeLabel(settings.formType)}
              </span>
            </div>
          {/if}
        </div>

        <SettingField id="form-name" label={m.common.name()} hint={m.forms.settingsFormNameHint()} required>
          <input
            id="form-name"
            type="text"
            bind:value={settings.name}
            maxlength="255"
            class="w-full p-2 rounded-lg"
            style="background: {$colorStore.primary}10; border: 1px solid {$colorStore.primary}30; color: {$colorStore.text};"
            placeholder={m.forms.settingsStaffApplicationPlaceholder()}
          />
        </SettingField>

        <SettingField id="form-description" label={m.common.description()} hint={m.forms.settingsFormDescriptionHint()}>
          <textarea
            id="form-description"
            bind:value={settings.description}
            rows="2"
            maxlength="2000"
            class="w-full p-2 rounded-lg resize-none"
            style="background: {$colorStore.primary}10; border: 1px solid {$colorStore.primary}30; color: {$colorStore.text};"
            placeholder={m.forms.settingsTellPeopleWhatThisFormPlaceholder()}
          ></textarea>
        </SettingField>

        <SettingField id="submit-channel" label={m.forms.settingsSubmitChannel()} hint={m.forms.settingsSubmitChannelHint()}>
          <DiscordSelector
            id="submit-channel"
            type="channel"
            options={channels}
            selected={settings.submitChannelId}
            placeholder={m.common.selectAChannelPlaceholder()}
            onchange={(e) => (settings.submitChannelId = e.selected as string)}
          />
        </SettingField>

        <SettingField id="success-message" label={m.forms.settingsSuccessMessage()} hint={m.forms.settingsSuccessMessageHint()}>
          <textarea
            id="success-message"
            bind:value={settings.successMessage}
            rows="2"
            maxlength="1000"
            class="w-full p-2 rounded-lg resize-none"
            style="background: {$colorStore.primary}10; border: 1px solid {$colorStore.primary}30; color: {$colorStore.text};"
            placeholder={m.forms.settingsThanksWeHaveYourAnswersPlaceholder()}
          ></textarea>
        </SettingField>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <SettingToggle
            id="is-draft"
            label={m.forms.listDraft()}
            hint={m.forms.settingsIsDraftHint()}
            checked={settings.isDraft}
            accent="#f59e0b"
            onchange={(v) => (settings.isDraft = v)}
          />
          <SettingToggle
            id="is-active"
            label={m.forms.settingsIsActive()}
            hint={m.forms.settingsIsActiveHint()}
            checked={settings.isActive}
            accent="#10B981"
            onchange={(v) => (settings.isActive = v)}
          />
        </div>
      </div>
    </div>

    <SettingsSection
      title={m.forms.settingsWhoCanSubmitTitle()}
      summary={m.forms.settingsLimitsOnWhoMayOpenSummary()}
      icon="fa-shield"
      changed={countSet([settings.requiredRoleId, settings.minAccountAgeDays, settings.allowExternalUsers || null, settings.allowAnonymous || null])}
    >
      <FormTypeScope formType={formTypeInt} types={[0]} animate={false}>
        <SettingField id="required-role" label={m.forms.settingsRequiredRole()} hint={m.forms.settingsRequiredRoleHint()}>
          <DiscordSelector
            id="required-role"
            type="role"
            options={roles}
            selected={settings.requiredRoleId}
            placeholder={m.forms.settingsAnyoneInTheServerPlaceholder()}
            onchange={(e) => (settings.requiredRoleId = e.selected as string)}
          />
        </SettingField>
      </FormTypeScope>

      <SettingField id="min-account-age" label={m.forms.settingsMinAccountAge()} hint={m.forms.settingsMinAccountAgeHint()}>
        <input
          id="min-account-age"
          type="number"
          bind:value={settings.minAccountAgeDays}
          min="0"
          class="w-full p-2 rounded-lg"
          style="background: {$colorStore.primary}10; border: 1px solid {$colorStore.primary}30; color: {$colorStore.text};"
          placeholder={m.common.noLimit()}
        />
      </SettingField>

      <FormTypeScope formType={formTypeInt} types={[0]} animate={false}>
        <SettingToggle
          id="allow-external"
          label={m.forms.settingsAllowExternal()}
          hint={m.forms.settingsAllowExternalHint()}
          checked={settings.allowExternalUsers}
          onchange={(v) => (settings.allowExternalUsers = v)}
        />

        <SettingToggle
          id="allow-anonymous"
          label={m.forms.settingsAllowAnonymous()}
          hint={m.forms.settingsAllowAnonymousHint()}
          checked={settings.allowAnonymous}
          accent="#8b5cf6"
          onchange={(v) => (settings.allowAnonymous = v)}
        />
      </FormTypeScope>
    </SettingsSection>

    <SettingsSection
      title={m.forms.settingsWhenItIsOpenTitle()}
      summary={m.forms.settingsSchedulingLimitsAndHowOftenSummary()}
      icon="fa-calendar"
      changed={countSet([settings.opensAt, settings.expiresAt, settings.maxResponses, settings.allowMultipleSubmissions || null, settings.announceChannelId])}
    >
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <SettingField id="opens-at" label={m.forms.settingsOpensAt()} hint={m.forms.settingsOpensAtHint()}>
          <input
            id="opens-at"
            type="datetime-local"
            bind:value={settings.opensAt}
            class="w-full p-2 rounded-lg"
            style="background: {$colorStore.primary}10; border: 1px solid {$colorStore.primary}30; color: {$colorStore.text};"
          />
        </SettingField>

        <SettingField id="expires-at" label={m.forms.settingsExpiresAt()} hint={m.forms.settingsExpiresAtHint()}>
          <input
            id="expires-at"
            type="datetime-local"
            bind:value={settings.expiresAt}
            class="w-full p-2 rounded-lg"
            style="background: {$colorStore.primary}10; border: 1px solid {$colorStore.primary}30; color: {$colorStore.text};"
          />
        </SettingField>
      </div>

      <SettingField id="max-responses" label={m.forms.settingsMaxResponses()} hint={m.forms.settingsMaxResponsesHint()}>
        <input
          id="max-responses"
          type="number"
          bind:value={settings.maxResponses}
          min="1"
          class="w-full p-2 rounded-lg"
          style="background: {$colorStore.primary}10; border: 1px solid {$colorStore.primary}30; color: {$colorStore.text};"
          placeholder={m.common.noLimit()}
        />
      </SettingField>

      <SettingToggle
        id="allow-multiple"
        label={m.forms.settingsAllowMultiple()}
        hint={m.forms.settingsAllowMultipleHint()}
        checked={settings.allowMultipleSubmissions}
        onchange={(v) => (settings.allowMultipleSubmissions = v)}
      />

      {#if !settings.allowMultipleSubmissions}
        <SettingToggle
          id="allow-resubmit"
          label={m.forms.settingsAllowResubmit()}
          hint={m.forms.settingsAllowResubmitHint()}
          checked={settings.allowResubmitAfterRejection}
          onchange={(v) => (settings.allowResubmitAfterRejection = v)}
        />
      {/if}

      <SettingToggle
        id="require-captcha"
        label={m.forms.settingsRequireCaptcha()}
        hint={m.forms.settingsRequireCaptchaHint()}
        checked={settings.requireCaptcha}
        onchange={(v) => (settings.requireCaptcha = v)}
      />

      <div class="pt-2 border-t" style="border-color: {$colorStore.primary}20;">
        <SettingField id="announce-channel" label={m.forms.settingsAnnounceChannel()} hint={m.forms.settingsAnnounceChannelHint()}>
          <DiscordSelector
            id="announce-channel"
            type="channel"
            options={channels}
            selected={settings.announceChannelId}
            placeholder={m.forms.settingsDoNotAnnouncePlaceholder()}
            onchange={(e) => (settings.announceChannelId = e.selected as string)}
          />
        </SettingField>

        {#if settings.announceChannelId}
          <div class="mt-4 space-y-4" transition:slide={{ duration: 150 }}>
            <SettingField id="announce-role" label={m.forms.settingsAnnounceRole()} hint={m.forms.settingsAnnounceRoleHint()}>
              <DiscordSelector
                id="announce-role"
                type="role"
                options={roles}
                selected={settings.announceRoleId}
                placeholder={m.forms.settingsPingNobodyPlaceholder()}
                onchange={(e) => (settings.announceRoleId = e.selected as string)}
              />
            </SettingField>

            <SettingField id="announce-message" label={m.forms.settingsAnnounceMessage()} hint={m.forms.settingsAnnounceMessageHint()}>
              <textarea
                id="announce-message"
                bind:value={settings.announceMessage}
                rows="2"
                maxlength="2000"
                class="w-full p-2 rounded-lg resize-none"
                style="background: {$colorStore.primary}10; border: 1px solid {$colorStore.primary}30; color: {$colorStore.text};"
                placeholder={m.forms.settingsThisFormIsNowOpenPlaceholder()}
              ></textarea>
            </SettingField>

            {#if announcedAt}
              <p class="text-xs" style="color: {$colorStore.muted};">
                <i class="fa-solid fa-check mr-1"></i>
                {m.forms.settingsAnnounced({ date: new Date(announcedAt).toLocaleString() })}
              </p>
            {/if}
          </div>
        {/if}
      </div>
    </SettingsSection>

    <SettingsSection
      title={m.forms.settingsWhenSomeoneSubmitsTitle()}
      summary={m.forms.settingsWhoGetsToldAndWhatSummary()}
      icon="fa-paper-plane"
      changed={countSet([settings.notifyRoleId, settings.submitRoleIds.length ? "y" : null, settings.pendingRoleId, settings.notificationWebhookUrl])}
    >
      <SettingField id="notify-role" label={m.forms.settingsNotifyRole()} hint={m.forms.settingsNotifyRoleHint()}>
        <DiscordSelector
          id="notify-role"
          type="role"
          options={roles}
          selected={settings.notifyRoleId}
          placeholder={m.forms.settingsPingNobodyPlaceholder()}
          onchange={(e) => (settings.notifyRoleId = e.selected as string)}
        />
      </SettingField>

      {#if settings.allowAnonymous}
        <p class="text-xs p-3 rounded-lg" style="background: #f59e0b15; color: #f59e0b;">
          <i class="fa-solid fa-circle-info mr-1"></i>
          {m.forms.settingsAnonymousRolesNote()}
        </p>
      {:else}
        <SettingField id="submit-roles" label={m.forms.settingsSubmitRoles()} hint={m.forms.settingsSubmitRolesHint()}>
          <DiscordSelector
            id="submit-roles"
            type="role"
            options={roles}
            selected={settings.submitRoleIds}
            multiple={true}
            placeholder={m.common.noRoles()}
            onchange={(e) => (settings.submitRoleIds = e.selected as string[])}
          />
        </SettingField>

        <SettingField id="pending-role" label={m.forms.settingsPendingRole()} hint={m.forms.settingsPendingRoleHint()}>
          <DiscordSelector
            id="pending-role"
            type="role"
            options={roles}
            selected={settings.pendingRoleId}
            placeholder={m.common.noRole()}
            onchange={(e) => (settings.pendingRoleId = e.selected as string)}
          />
        </SettingField>
      {/if}

      <SettingField id="webhook-url" label={m.forms.settingsWebhookUrl()} hint={m.forms.settingsWebhookUrlHint()}>
        <input
          id="webhook-url"
          type="url"
          bind:value={settings.notificationWebhookUrl}
          class="w-full p-2 rounded-lg"
          style="background: {$colorStore.primary}10; border: 1px solid {$colorStore.primary}30; color: {$colorStore.text};"
          placeholder="https://"
        />
      </SettingField>
    </SettingsSection>

    <SettingsSection
      title={m.forms.settingsReviewingAnswersTitle()}
      summary={m.forms.settingsWhetherAnswersAreApprovedBySummary()}
      icon="fa-shield-halved"
      initiallyOpen={settings.requireApproval || settings.formType !== "Regular"}
      changed={countSet([settings.reviewerRoleId, settings.approvalAddRoleIds.length ? "y" : null, settings.rejectionAddRoleIds.length ? "y" : null])}
    >
      <FormTypeScope formType={formTypeInt} types={[0]} animate={false}>
        <SettingToggle
          id="require-approval"
          label={m.forms.settingsRequireApproval()}
          hint={m.forms.settingsRequireApprovalHint()}
          checked={settings.requireApproval}
          onchange={(v) => (settings.requireApproval = v)}
        />
      </FormTypeScope>

      {#if settings.formType !== "Regular"}
        <p class="text-xs p-3 rounded-lg" style="background: {$colorStore.primary}10; color: {$colorStore.muted};">
          <i class="fa-solid fa-circle-info mr-1"></i>
          {settings.formType === "BanAppeal" ? m.forms.settingsBanAppealsReview() : m.forms.settingsJoinApplicationsReview()}
        </p>
      {/if}

      {#if settings.requireApproval || settings.formType !== "Regular"}
        <div class="space-y-4" transition:slide={{ duration: 150 }}>
          <SettingField id="reviewer-role" label={m.forms.settingsReviewerRole()} hint={m.forms.settingsReviewerRoleHint()}>
            <DiscordSelector
              id="reviewer-role"
              type="role"
              options={roles}
              selected={settings.reviewerRoleId}
              placeholder={m.forms.settingsManageServerOnlyPlaceholder()}
              onchange={(e) => (settings.reviewerRoleId = e.selected as string)}
            />
          </SettingField>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <SettingField id="approve-emote" label={m.forms.settingsApproveEmote()} hint={m.forms.settingsApproveEmoteHint()}>
              <EmojiPicker
                id="approve-emote"
                {guildEmojis}
                bind:selected={settings.approveEmote}
                multiple={false}
                placeholder={guildApproveEmote || m.forms.settingsEmoteServerDefault()}
                searchable={true}
                groupByGuild={true}
              />
            </SettingField>

            <SettingField id="reject-emote" label={m.forms.settingsRejectEmote()} hint={m.forms.settingsRejectEmoteHint()}>
              <EmojiPicker
                id="reject-emote"
                {guildEmojis}
                bind:selected={settings.rejectEmote}
                multiple={false}
                placeholder={guildRejectEmote || m.forms.settingsRejectEmoteServerDefault()}
                searchable={true}
                groupByGuild={true}
              />
            </SettingField>
          </div>

          {#if !settings.allowAnonymous}
            <div
              class="p-4 rounded-lg space-y-4"
              style="background: #10B98108; border: 1px solid #10B98130;"
            >
              <h3 class="font-semibold text-sm" style="color: {$colorStore.text};">
                <i class="fa-solid fa-check-circle mr-2" style="color: #10B981;"></i>
                {m.forms.settingsOnApproval()}
              </h3>

              <SettingField id="approval-add-roles" label={m.forms.settingsApprovalAddRoles()} hint={m.forms.settingsApprovalAddRolesHint()}>
                <DiscordSelector
                  id="approval-add-roles"
                  type="role"
                  options={roles}
                  selected={settings.approvalAddRoleIds}
                  multiple={true}
                  placeholder={m.common.noRoles()}
                  onchange={(e) => (settings.approvalAddRoleIds = e.selected as string[])}
                />
              </SettingField>

              <SettingField id="approval-remove-roles" label={m.forms.settingsApprovalRemoveRoles()} hint={m.forms.settingsApprovalRemoveRolesHint()}>
                <DiscordSelector
                  id="approval-remove-roles"
                  type="role"
                  options={roles}
                  selected={settings.approvalRemoveRoleIds}
                  multiple={true}
                  placeholder={m.common.noRoles()}
                  onchange={(e) => (settings.approvalRemoveRoleIds = e.selected as string[])}
                />
              </SettingField>
            </div>

            <div
              class="p-4 rounded-lg space-y-4"
              style="background: #ef444408; border: 1px solid #ef444430;"
            >
              <h3 class="font-semibold text-sm" style="color: {$colorStore.text};">
                <i class="fa-solid fa-times-circle mr-2" style="color: #ef4444;"></i>
                {m.forms.settingsOnRejection()}
              </h3>

              <SettingField id="rejection-add-roles" label={m.forms.settingsRejectionAddRoles()} hint={m.forms.settingsRejectionAddRolesHint()}>
                <DiscordSelector
                  id="rejection-add-roles"
                  type="role"
                  options={roles}
                  selected={settings.rejectionAddRoleIds}
                  multiple={true}
                  placeholder={m.common.noRoles()}
                  onchange={(e) => (settings.rejectionAddRoleIds = e.selected as string[])}
                />
              </SettingField>

              <SettingField id="rejection-remove-roles" label={m.forms.settingsRejectionRemoveRoles()} hint={m.forms.settingsRejectionRemoveRolesHint()}>
                <DiscordSelector
                  id="rejection-remove-roles"
                  type="role"
                  options={roles}
                  selected={settings.rejectionRemoveRoleIds}
                  multiple={true}
                  placeholder={m.common.noRoles()}
                  onchange={(e) => (settings.rejectionRemoveRoleIds = e.selected as string[])}
                />
              </SettingField>
            </div>
          {/if}
        </div>
      {/if}
    </SettingsSection>

    <FormTypeScope formType={formTypeInt} types={[1]}>
      <SettingsSection
        title={m.forms.settingsAppealLimitsTitle()}
        summary={m.forms.settingsHowOftenSomebodyMayAppealSummary()}
        icon="fa-clock"
        changed={countSet([settings.appealDelayDays, settings.maxAppealAttempts, settings.reappealCooldownDays, settings.blockReappealAfterRejection || null])}
      >
        <SettingToggle
          id="block-reappeal"
          label={m.forms.settingsBlockReappeal()}
          hint={m.forms.settingsBlockReappealHint()}
          checked={settings.blockReappealAfterRejection}
          onchange={(v) => (settings.blockReappealAfterRejection = v)}
        />

        <SettingField id="appeal-delay" label={m.forms.settingsAppealDelay()} hint={m.forms.settingsAppealDelayHint()}>
          <input
            id="appeal-delay"
            type="number"
            bind:value={settings.appealDelayDays}
            min="0"
            class="w-full p-2 rounded-lg"
            style="background: {$colorStore.primary}10; border: 1px solid {$colorStore.primary}30; color: {$colorStore.text};"
            placeholder={m.forms.settingsNoWaitPlaceholder()}
          />
        </SettingField>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <SettingField id="max-appeals" label={m.forms.settingsMaxAppeals()} hint={m.forms.settingsMaxAppealsHint()}>
            <input
              id="max-appeals"
              type="number"
              bind:value={settings.maxAppealAttempts}
              min="1"
              disabled={settings.blockReappealAfterRejection}
              class="w-full p-2 rounded-lg disabled:opacity-40"
              style="background: {$colorStore.primary}10; border: 1px solid {$colorStore.primary}30; color: {$colorStore.text};"
              placeholder={m.forms.settingsUnlimitedPlaceholder()}
            />
          </SettingField>

          <SettingField id="reappeal-cooldown" label={m.forms.settingsReappealCooldown()} hint={m.forms.settingsReappealCooldownHint()}>
            <input
              id="reappeal-cooldown"
              type="number"
              bind:value={settings.reappealCooldownDays}
              min="0"
              disabled={settings.blockReappealAfterRejection}
              class="w-full p-2 rounded-lg disabled:opacity-40"
              style="background: {$colorStore.primary}10; border: 1px solid {$colorStore.primary}30; color: {$colorStore.text};"
              placeholder={m.forms.settingsNoWaitPlaceholder()}
            />
          </SettingField>
        </div>
      </SettingsSection>
    </FormTypeScope>

    <FormTypeScope formType={formTypeInt} types={[2]}>
      <SettingsSection
        title={m.forms.settingsTheInviteSentOnApprovalTitle()}
        summary={m.forms.settingsHowTheInviteWorksForSummary()}
        icon="fa-user-plus"
        changed={countSet([settings.autoApproveRoleIds.length ? "y" : null])}
      >
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <SettingField id="invite-max-uses" label={m.forms.settingsInviteMaxUses()} hint={m.forms.settingsInviteMaxUsesHint()}>
            <input
              id="invite-max-uses"
              type="number"
              bind:value={settings.inviteMaxUses}
              min="1"
              class="w-full p-2 rounded-lg"
              style="background: {$colorStore.primary}10; border: 1px solid {$colorStore.primary}30; color: {$colorStore.text};"
            />
          </SettingField>

          <SettingField id="invite-max-age" label={m.forms.settingsInviteMaxAge()} hint={m.forms.settingsInviteMaxAgeHint()}>
            <input
              id="invite-max-age"
              type="number"
              bind:value={settings.inviteMaxAge}
              min="0"
              class="w-full p-2 rounded-lg"
              style="background: {$colorStore.primary}10; border: 1px solid {$colorStore.primary}30; color: {$colorStore.text};"
            />
          </SettingField>
        </div>

        <SettingField id="auto-approve-roles" label={m.forms.settingsAutoApproveRoles()} hint={m.forms.settingsAutoApproveRolesHint()}>
          <DiscordSelector
            id="auto-approve-roles"
            type="role"
            options={roles}
            selected={settings.autoApproveRoleIds}
            multiple={true}
            placeholder={m.common.noRoles()}
            onchange={(e) => (settings.autoApproveRoleIds = e.selected as string[])}
          />
        </SettingField>
      </SettingsSection>
    </FormTypeScope>

</div>
