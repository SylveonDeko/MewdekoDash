<script lang="ts">
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
        Basics
      </h2>
      <p class="text-sm mb-4" style="color: {$colorStore.muted};">
        What this form is called and where its answers go.
      </p>

      <div class="space-y-4">
        <div>
          <span class="block text-sm font-medium mb-1" style="color: {$colorStore.text};">Form type</span>
          <p class="text-xs mb-2" style="color: {$colorStore.muted};">
            Decides who may submit. {mode === "create" ? "This cannot be changed afterwards." : "Fixed once the form is created."}
          </p>

          {#if mode === "create"}
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-2" role="radiogroup" aria-label="Form type">
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
                      {choice.label}
                    </span>
                    <span class="block text-xs mt-0.5" style="color: {$colorStore.muted};">
                      {choice.description}
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
                {settings.formType === "BanAppeal" ? "Ban appeal" : settings.formType === "JoinApplication" ? "Join application" : "Regular form"}
              </span>
            </div>
          {/if}
        </div>

        <SettingField id="form-name" label="Name" hint="Shown as the title of the form and in your list of forms." required>
          <input
            id="form-name"
            type="text"
            bind:value={settings.name}
            maxlength="255"
            class="w-full p-2 rounded-lg"
            style="background: {$colorStore.primary}10; border: 1px solid {$colorStore.primary}30; color: {$colorStore.text};"
            placeholder="Staff application"
          />
        </SettingField>

        <SettingField id="form-description" label="Description" hint="Shown under the title, and used as the preview when the link is pasted into Discord.">
          <textarea
            id="form-description"
            bind:value={settings.description}
            rows="2"
            maxlength="2000"
            class="w-full p-2 rounded-lg resize-none"
            style="background: {$colorStore.primary}10; border: 1px solid {$colorStore.primary}30; color: {$colorStore.text};"
            placeholder="Tell people what this form is for."
          ></textarea>
        </SettingField>

        <SettingField id="submit-channel" label="Where answers are posted" hint="Each submission is posted here as an embed. Leave empty to keep answers on the dashboard only.">
          <DiscordSelector
            id="submit-channel"
            type="channel"
            options={channels}
            selected={settings.submitChannelId}
            placeholder="Select a channel"
            onchange={(e) => (settings.submitChannelId = e.selected as string)}
          />
        </SettingField>

        <SettingField id="success-message" label="Message after submitting" hint="Shown on the confirmation page once someone has sent their answers.">
          <textarea
            id="success-message"
            bind:value={settings.successMessage}
            rows="2"
            maxlength="1000"
            class="w-full p-2 rounded-lg resize-none"
            style="background: {$colorStore.primary}10; border: 1px solid {$colorStore.primary}30; color: {$colorStore.text};"
            placeholder="Thanks, we have your answers."
          ></textarea>
        </SettingField>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <SettingToggle
            id="is-draft"
            label="Draft"
            hint="A draft is not reachable by its link, however it is shared."
            checked={settings.isDraft}
            accent="#f59e0b"
            onchange={(v) => (settings.isDraft = v)}
          />
          <SettingToggle
            id="is-active"
            label="Accepting responses"
            hint="Turn off to close the form without deleting it."
            checked={settings.isActive}
            accent="#10B981"
            onchange={(v) => (settings.isActive = v)}
          />
        </div>
      </div>
    </div>

    <SettingsSection
      title="Who can submit"
      summary="Limits on who may open and send this form."
      icon="fa-shield"
      changed={countSet([settings.requiredRoleId, settings.minAccountAgeDays, settings.allowExternalUsers || null, settings.allowAnonymous || null])}
    >
      <FormTypeScope formType={formTypeInt} types={[0]} animate={false}>
        <SettingField id="required-role" label="Role required to submit" hint="Only people holding this role can open the form. Everyone else is turned away.">
          <DiscordSelector
            id="required-role"
            type="role"
            options={roles}
            selected={settings.requiredRoleId}
            placeholder="Anyone in the server"
            onchange={(e) => (settings.requiredRoleId = e.selected as string)}
          />
        </SettingField>
      </FormTypeScope>

      <SettingField id="min-account-age" label="Minimum Discord account age" hint="Turns away accounts newer than this many days. Useful against throwaway accounts.">
        <input
          id="min-account-age"
          type="number"
          bind:value={settings.minAccountAgeDays}
          min="0"
          class="w-full p-2 rounded-lg"
          style="background: {$colorStore.primary}10; border: 1px solid {$colorStore.primary}30; color: {$colorStore.text};"
          placeholder="No limit"
        />
      </SettingField>

      <FormTypeScope formType={formTypeInt} types={[0]} animate={false}>
        <SettingToggle
          id="allow-external"
          label="Allow people outside the server"
          hint="Lets anyone with the link submit, even if they have not joined."
          checked={settings.allowExternalUsers}
          onchange={(v) => (settings.allowExternalUsers = v)}
        />

        <SettingToggle
          id="allow-anonymous"
          label="Submit anonymously"
          hint="Answers are stored with no submitter. Nobody can be messaged, given roles, or replied to."
          checked={settings.allowAnonymous}
          accent="#8b5cf6"
          onchange={(v) => (settings.allowAnonymous = v)}
        />
      </FormTypeScope>
    </SettingsSection>

    <SettingsSection
      title="When it is open"
      summary="Scheduling, limits, and how often one person may answer."
      icon="fa-calendar"
      changed={countSet([settings.opensAt, settings.expiresAt, settings.maxResponses, settings.allowMultipleSubmissions || null, settings.announceChannelId])}
    >
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <SettingField id="opens-at" label="Opens at" hint="The form turns people away until this moment. Leave empty to open as soon as it is published.">
          <input
            id="opens-at"
            type="datetime-local"
            bind:value={settings.opensAt}
            class="w-full p-2 rounded-lg"
            style="background: {$colorStore.primary}10; border: 1px solid {$colorStore.primary}30; color: {$colorStore.text};"
          />
        </SettingField>

        <SettingField id="expires-at" label="Closes at" hint="The form stops accepting answers at this moment.">
          <input
            id="expires-at"
            type="datetime-local"
            bind:value={settings.expiresAt}
            class="w-full p-2 rounded-lg"
            style="background: {$colorStore.primary}10; border: 1px solid {$colorStore.primary}30; color: {$colorStore.text};"
          />
        </SettingField>
      </div>

      <SettingField id="max-responses" label="Total responses accepted" hint="The form closes itself once this many people have answered, across everyone.">
        <input
          id="max-responses"
          type="number"
          bind:value={settings.maxResponses}
          min="1"
          class="w-full p-2 rounded-lg"
          style="background: {$colorStore.primary}10; border: 1px solid {$colorStore.primary}30; color: {$colorStore.text};"
          placeholder="No limit"
        />
      </SettingField>

      <SettingToggle
        id="allow-multiple"
        label="Allow more than one answer per person"
        hint="Off means one submission each. Turn on for things like weekly check-ins."
        checked={settings.allowMultipleSubmissions}
        onchange={(v) => (settings.allowMultipleSubmissions = v)}
      />

      {#if !settings.allowMultipleSubmissions}
        <SettingToggle
          id="allow-resubmit"
          label="Let rejected people try again"
          hint="A rejected answer no longer counts as their one submission, so they can correct it and resend."
          checked={settings.allowResubmitAfterRejection}
          onchange={(v) => (settings.allowResubmitAfterRejection = v)}
        />
      {/if}

      <SettingToggle
        id="require-captcha"
        label="Require a captcha"
        hint="Adds a verification step before answers can be sent."
        checked={settings.requireCaptcha}
        onchange={(v) => (settings.requireCaptcha = v)}
      />

      <div class="pt-2 border-t" style="border-color: {$colorStore.primary}20;">
        <SettingField id="announce-channel" label="Announce the opening in" hint="Posts a message when the opening time passes, or immediately if you publish with no opening time.">
          <DiscordSelector
            id="announce-channel"
            type="channel"
            options={channels}
            selected={settings.announceChannelId}
            placeholder="Do not announce"
            onchange={(e) => (settings.announceChannelId = e.selected as string)}
          />
        </SettingField>

        {#if settings.announceChannelId}
          <div class="mt-4 space-y-4" transition:slide={{ duration: 150 }}>
            <SettingField id="announce-role" label="Ping with the announcement" hint="Mentioned in the launch message. Nothing else pings this role.">
              <DiscordSelector
                id="announce-role"
                type="role"
                options={roles}
                selected={settings.announceRoleId}
                placeholder="Ping nobody"
                onchange={(e) => (settings.announceRoleId = e.selected as string)}
              />
            </SettingField>

            <SettingField id="announce-message" label="Announcement text" hint="The body of the launch message. The closing time is added as a countdown.">
              <textarea
                id="announce-message"
                bind:value={settings.announceMessage}
                rows="2"
                maxlength="2000"
                class="w-full p-2 rounded-lg resize-none"
                style="background: {$colorStore.primary}10; border: 1px solid {$colorStore.primary}30; color: {$colorStore.text};"
                placeholder="This form is now open."
              ></textarea>
            </SettingField>

            {#if announcedAt}
              <p class="text-xs" style="color: {$colorStore.muted};">
                <i class="fa-solid fa-check mr-1"></i>
                Announced {new Date(announcedAt).toLocaleString()}. Changing the opening
                time will not send it again.
              </p>
            {/if}
          </div>
        {/if}
      </div>
    </SettingsSection>

    <SettingsSection
      title="When someone submits"
      summary="Who gets told, and what the person who answered receives."
      icon="fa-paper-plane"
      changed={countSet([settings.notifyRoleId, settings.submitRoleIds.length ? "y" : null, settings.pendingRoleId, settings.notificationWebhookUrl])}
    >
      <SettingField id="notify-role" label="Ping when a response arrives" hint="Mentioned in the channel above each time somebody answers, so reviewers notice.">
        <DiscordSelector
          id="notify-role"
          type="role"
          options={roles}
          selected={settings.notifyRoleId}
          placeholder="Ping nobody"
          onchange={(e) => (settings.notifyRoleId = e.selected as string)}
        />
      </SettingField>

      {#if settings.allowAnonymous}
        <p class="text-xs p-3 rounded-lg" style="background: #f59e0b15; color: #f59e0b;">
          <i class="fa-solid fa-circle-info mr-1"></i>
          This form is anonymous, so it records nobody to give roles to. The role settings below are
          hidden until you turn that off.
        </p>
      {:else}
        <SettingField id="submit-roles" label="Roles given on submitting" hint="Granted the moment somebody answers, before anyone reviews it. Useful for a waiting-room role.">
          <DiscordSelector
            id="submit-roles"
            type="role"
            options={roles}
            selected={settings.submitRoleIds}
            multiple={true}
            placeholder="No roles"
            onchange={(e) => (settings.submitRoleIds = e.selected as string[])}
          />
        </SettingField>

        <SettingField id="pending-role" label="Role while awaiting review" hint="Held only until the answer is approved or rejected, then removed automatically.">
          <DiscordSelector
            id="pending-role"
            type="role"
            options={roles}
            selected={settings.pendingRoleId}
            placeholder="No role"
            onchange={(e) => (settings.pendingRoleId = e.selected as string)}
          />
        </SettingField>
      {/if}

      <SettingField id="webhook-url" label="Send to a webhook" hint="Also posts each response to this address, for feeding another system.">
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
      title="Reviewing answers"
      summary="Whether answers are approved, by whom, and what a decision does."
      icon="fa-shield-halved"
      initiallyOpen={settings.requireApproval || settings.formType !== "Regular"}
      changed={countSet([settings.reviewerRoleId, settings.approvalAddRoleIds.length ? "y" : null, settings.rejectionAddRoleIds.length ? "y" : null])}
    >
      <FormTypeScope formType={formTypeInt} types={[0]} animate={false}>
        <SettingToggle
          id="require-approval"
          label="Answers need approving"
          hint="Each answer waits for a decision. Without this, answers are simply recorded."
          checked={settings.requireApproval}
          onchange={(v) => (settings.requireApproval = v)}
        />
      </FormTypeScope>

      {#if settings.formType !== "Regular"}
        <p class="text-xs p-3 rounded-lg" style="background: {$colorStore.primary}10; color: {$colorStore.muted};">
          <i class="fa-solid fa-circle-info mr-1"></i>
          {settings.formType === "BanAppeal" ? "Ban appeals" : "Join applications"} always go through review.
        </p>
      {/if}

      {#if settings.requireApproval || settings.formType !== "Regular"}
        <div class="space-y-4" transition:slide={{ duration: 150 }}>
          <SettingField id="reviewer-role" label="Who may approve or reject" hint="Can press the buttons on the submission in Discord. Anyone with Manage Server can regardless.">
            <DiscordSelector
              id="reviewer-role"
              type="role"
              options={roles}
              selected={settings.reviewerRoleId}
              placeholder="Manage Server only"
              onchange={(e) => (settings.reviewerRoleId = e.selected as string)}
            />
          </SettingField>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <SettingField id="approve-emote" label="Approve button emote" hint="Shown on the approve button. Empty uses the server default.">
              <EmojiPicker
                id="approve-emote"
                {guildEmojis}
                bind:selected={settings.approveEmote}
                multiple={false}
                placeholder={guildApproveEmote || "✅ server default"}
                searchable={true}
                groupByGuild={true}
              />
            </SettingField>

            <SettingField id="reject-emote" label="Reject button emote" hint="Shown on the reject button. Empty uses the server default.">
              <EmojiPicker
                id="reject-emote"
                {guildEmojis}
                bind:selected={settings.rejectEmote}
                multiple={false}
                placeholder={guildRejectEmote || "❌ server default"}
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
                On approval
              </h3>

              <SettingField id="approval-add-roles" label="Add on approval" hint="Given to the person when their answer is approved.">
                <DiscordSelector
                  id="approval-add-roles"
                  type="role"
                  options={roles}
                  selected={settings.approvalAddRoleIds}
                  multiple={true}
                  placeholder="No roles"
                  onchange={(e) => (settings.approvalAddRoleIds = e.selected as string[])}
                />
              </SettingField>

              <SettingField id="approval-remove-roles" label="Remove on approval" hint="Taken away when their answer is approved. The waiting role above is removed anyway.">
                <DiscordSelector
                  id="approval-remove-roles"
                  type="role"
                  options={roles}
                  selected={settings.approvalRemoveRoleIds}
                  multiple={true}
                  placeholder="No roles"
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
                On rejection
              </h3>

              <SettingField id="rejection-add-roles" label="Add on rejection" hint="Given to the person when their answer is turned down.">
                <DiscordSelector
                  id="rejection-add-roles"
                  type="role"
                  options={roles}
                  selected={settings.rejectionAddRoleIds}
                  multiple={true}
                  placeholder="No roles"
                  onchange={(e) => (settings.rejectionAddRoleIds = e.selected as string[])}
                />
              </SettingField>

              <SettingField id="rejection-remove-roles" label="Remove on rejection" hint="Taken away when their answer is turned down.">
                <DiscordSelector
                  id="rejection-remove-roles"
                  type="role"
                  options={roles}
                  selected={settings.rejectionRemoveRoleIds}
                  multiple={true}
                  placeholder="No roles"
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
        title="Appeal limits"
        summary="How often somebody may appeal, and how long they must wait."
        icon="fa-clock"
        changed={countSet([settings.appealDelayDays, settings.maxAppealAttempts, settings.reappealCooldownDays, settings.blockReappealAfterRejection || null])}
      >
        <SettingToggle
          id="block-reappeal"
          label="One rejection is final"
          hint="A rejected appeal is the end of it. Overrides the two limits below."
          checked={settings.blockReappealAfterRejection}
          onchange={(v) => (settings.blockReappealAfterRejection = v)}
        />

        <SettingField id="appeal-delay" label="Wait after the ban" hint="Days somebody must wait after being banned before they may appeal at all.">
          <input
            id="appeal-delay"
            type="number"
            bind:value={settings.appealDelayDays}
            min="0"
            class="w-full p-2 rounded-lg"
            style="background: {$colorStore.primary}10; border: 1px solid {$colorStore.primary}30; color: {$colorStore.text};"
            placeholder="No wait"
          />
        </SettingField>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <SettingField id="max-appeals" label="Appeals allowed" hint="How many rejected appeals before they are locked out for good.">
            <input
              id="max-appeals"
              type="number"
              bind:value={settings.maxAppealAttempts}
              min="1"
              disabled={settings.blockReappealAfterRejection}
              class="w-full p-2 rounded-lg disabled:opacity-40"
              style="background: {$colorStore.primary}10; border: 1px solid {$colorStore.primary}30; color: {$colorStore.text};"
              placeholder="Unlimited"
            />
          </SettingField>

          <SettingField id="reappeal-cooldown" label="Wait between appeals" hint="Days after a rejection before they may appeal again.">
            <input
              id="reappeal-cooldown"
              type="number"
              bind:value={settings.reappealCooldownDays}
              min="0"
              disabled={settings.blockReappealAfterRejection}
              class="w-full p-2 rounded-lg disabled:opacity-40"
              style="background: {$colorStore.primary}10; border: 1px solid {$colorStore.primary}30; color: {$colorStore.text};"
              placeholder="No wait"
            />
          </SettingField>
        </div>
      </SettingsSection>
    </FormTypeScope>

    <FormTypeScope formType={formTypeInt} types={[2]}>
      <SettingsSection
        title="The invite sent on approval"
        summary="How the invite works for people accepted into the server."
        icon="fa-user-plus"
        changed={countSet([settings.autoApproveRoleIds.length ? "y" : null])}
      >
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <SettingField id="invite-max-uses" label="Times the invite can be used" hint="Usually one, so the invite cannot be passed around.">
            <input
              id="invite-max-uses"
              type="number"
              bind:value={settings.inviteMaxUses}
              min="1"
              class="w-full p-2 rounded-lg"
              style="background: {$colorStore.primary}10; border: 1px solid {$colorStore.primary}30; color: {$colorStore.text};"
            />
          </SettingField>

          <SettingField id="invite-max-age" label="Invite expires after (seconds)" hint="How long the accepted person has to use it. 86400 is a day.">
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

        <SettingField id="auto-approve-roles" label="Roles waiting for them on join" hint="Applied when the accepted person actually joins, not when they are approved.">
          <DiscordSelector
            id="auto-approve-roles"
            type="role"
            options={roles}
            selected={settings.autoApproveRoleIds}
            multiple={true}
            placeholder="No roles"
            onchange={(e) => (settings.autoApproveRoleIds = e.selected as string[])}
          />
        </SettingField>
      </SettingsSection>
    </FormTypeScope>

</div>
