<script lang="ts">
  import { m } from "$lib/i18n";
  import { StatRoleLimit, StatRoleStat, statRoleLimitLabels, statRoleStatLabels } from "$lib/api/index.ts";
  import { colorStore } from "$lib/stores/colorStore";
  import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";
  import SettingField from "$lib/components/forms/SettingField.svelte";
  import ToggleRow from "$lib/components/forms/ToggleRow.svelte";
  import MessageField from "$lib/components/plugin/MessageField.svelte";
  import PluginCard from "$lib/components/plugin/PluginCard.svelte";
  import { userStore } from "$lib/stores/userStore";
  import Sheet from "$lib/components/ui/Sheet.svelte";
  import NumberField from "../../../xp/components/NumberField.svelte";
  import { usesWindow, toList, type Draft, type Option } from "./statModel";

  interface Props {
    draft: Draft;
    roles: Option[];
    members: Option[];
    channels: Option[];
    textChannels: Option[];
    saving: boolean;
    onsave: () => void;
    onclose: () => void;
  }

  let { draft = $bindable(), roles, members, channels, textChannels, saving, onsave, onclose }: Props = $props();

  const windowed = $derived(usesWindow(draft.statType));
  const channelScoped = $derived(
    draft.statType === StatRoleStat.Messages || draft.statType === StatRoleStat.VoiceMinutes
  );
  const rankLike = $derived(
    draft.limitType === StatRoleLimit.TopRank || draft.limitType === StatRoleLimit.TopPercent
  );

  const statOptions = $derived(Object.entries(statRoleStatLabels).map(([value, label]) => ({ id: value, name: label })));
  const limitOptions = $derived(
    Object.entries(statRoleLimitLabels).map(([value, label]) => ({ id: value, name: label }))
  );

  const inputStyle = $derived(
    `background: ${$colorStore.primary}10; border-color: ${$colorStore.primary}30; color: ${$colorStore.text};`
  );
  const inputClass = "w-full p-3 rounded-lg border focus:ring-2 min-h-[50px]";
</script>

<Sheet title={draft.id === null ? m.statroles.newRole() : m.statroles.editorEditTitle({ id: draft.id })} {onclose} size="xl">
  {#snippet footer()}
    <button
      type="button"
      class="px-5 rounded-lg min-h-[50px]"
      style="background: {$colorStore.primary}10; color: {$colorStore.text}; border: 1px solid {$colorStore.primary}20;"
      onclick={onclose}
    >
      {m.common.cancel()}
    </button>
    <button
      type="button"
      class="px-5 rounded-lg min-h-[50px] font-medium disabled:opacity-50"
      style="background: {$colorStore.primary}; color: {$colorStore.onPrimary};"
      disabled={saving}
      onclick={onsave}
    >
      {saving ? m.common.saving() : draft.id === null ? m.statroles.createRole() : m.common.saveChanges()}
    </button>
  {/snippet}

  <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
  <div class="min-w-0">
  <PluginCard title={m.common.condition()} alwaysOpen>
    <SettingField label={m.statroles.fieldRole()} id="sr-role" required>
      <DiscordSelector
        id="sr-role"
        type="role"
        options={roles}
        bind:selected={draft.roleId}
        placeholder={m.common.pickRolePlaceholder()}
      />
    </SettingField>
    <SettingField label={m.common.name()} id="sr-name">
      <input id="sr-name" type="text" maxlength="64" bind:value={draft.name} class={inputClass} style={inputStyle} />
    </SettingField>
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <SettingField label={m.statroles.fieldMeasure()} id="sr-stat">
        <DiscordSelector
          id="sr-stat"
          type="custom"
          customIcon="fa-chart-simple"
          searchable={false}
          clearable={false}
          options={statOptions}
          selected={String(draft.statType)}
          onchange={(e) => {
            if (typeof e.selected === "string") draft.statType = Number(e.selected);
          }}
        />
      </SettingField>
      <SettingField label={m.statroles.fieldQualify()} id="sr-limit">
        <DiscordSelector
          id="sr-limit"
          type="custom"
          customIcon="fa-filter"
          searchable={false}
          clearable={false}
          options={limitOptions}
          selected={String(draft.limitType)}
          onchange={(e) => {
            if (typeof e.selected === "string") draft.limitType = Number(e.selected);
          }}
        />
      </SettingField>
    </div>

    {#if draft.statType === StatRoleStat.ActivityMinutes}
      <SettingField label={m.statroles.fieldActivity()} hint={m.statroles.fieldActivityHint()} id="sr-activity">
        <input
          id="sr-activity"
          type="text"
          maxlength="128"
          placeholder={m.statroles.phAnyGame()}
          bind:value={draft.activityName}
          class={inputClass}
          style={inputStyle}
        />
      </SettingField>
    {/if}

    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {#if draft.limitType === StatRoleLimit.Threshold}
        <NumberField
          id="sr-min"
          label={m.statroles.fieldMinimum()}
          value={draft.minimum}
          onchange={(v) => (draft.minimum = v ?? 0)}
        />
        <NumberField
          id="sr-max"
          label={m.statroles.fieldMaximum()}
          value={draft.maximum}
          nullable
          onchange={(v) => (draft.maximum = v)}
        />
      {:else if rankLike}
        <NumberField
          id="sr-topstart"
          label={draft.limitType === StatRoleLimit.TopRank ? m.statroles.fieldFromRank() : m.statroles.fieldFromPercentile()}
          value={draft.topStart}
          min={1}
          onchange={(v) => (draft.topStart = v ?? 1)}
        />
        <NumberField
          id="sr-topend"
          label={draft.limitType === StatRoleLimit.TopRank ? m.statroles.fieldToRank() : m.statroles.fieldToPercentile()}
          value={draft.topEnd}
          min={1}
          max={draft.limitType === StatRoleLimit.TopPercent ? 100 : undefined}
          onchange={(v) => (draft.topEnd = v ?? 1)}
        />
      {:else}
        <NumberField
          id="sr-perday"
          label={m.statroles.fieldPerday()}
          value={draft.minimum}
          min={1}
          onchange={(v) => (draft.minimum = v ?? 1)}
        />
        <NumberField
          id="sr-days"
          label={m.statroles.fieldDays()}
          value={draft.requiredDays}
          min={1}
          onchange={(v) => (draft.requiredDays = v ?? 1)}
        />
      {/if}
    </div>
    {#if draft.limitType === StatRoleLimit.DailyStreak && !windowed}
      <p class="text-sm" style="color: {$colorStore.accent}">{m.statroles.errorStreakUnsupported()}</p>
    {/if}

    {#if windowed}
      {#if draft.limitType !== StatRoleLimit.DailyStreak}
        <ToggleRow
          id="sr-daily"
          title={m.statroles.toggleResetDaily()}
          subtitle={m.statroles.toggleResetDailyHint()}
          colors={$colorStore}
          checked={draft.lookbackDays === -1}
          onchange={(v) => (draft.lookbackDays = v ? -1 : 1)}
        />
      {/if}
      {#if draft.lookbackDays !== -1 || draft.limitType === StatRoleLimit.DailyStreak}
        <NumberField
          id="sr-lookback"
          label={m.statroles.fieldWindow()}
          hint={m.statroles.fieldWindowHint()}
          value={Math.max(draft.lookbackDays, 0)}
          min={draft.limitType === StatRoleLimit.DailyStreak ? 1 : 0}
          max={90}
          onchange={(v) => (draft.lookbackDays = v ?? 0)}
        />
      {/if}
    {/if}

    <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
      <ToggleRow
        id="sr-permanent"
        title={m.common.permanent()}
        subtitle={m.statroles.togglePermanentHint()}
        colors={$colorStore}
        checked={draft.permanent}
        onchange={(v) => (draft.permanent = v)}
      />
      <ToggleRow
        id="sr-invert"
        title={m.statroles.toggleInvert()}
        subtitle={m.statroles.toggleInvertHint()}
        colors={$colorStore}
        checked={draft.invert}
        onchange={(v) => (draft.invert = v)}
      />
      <ToggleRow
        id="sr-bots"
        title={m.statroles.toggleBots()}
        colors={$colorStore}
        checked={draft.applyToBots}
        onchange={(v) => (draft.applyToBots = v)}
      />
    </div>
  </PluginCard>
  </div>

  <div class="min-w-0 space-y-4">
  <PluginCard title={m.common.filters()} alwaysOpen>
    {#if channelScoped}
      <SettingField label={m.statroles.fieldChannels()} id="sr-channels">
        <DiscordSelector
          id="sr-channels"
          type="channel"
          options={channels}
          multiple
          selected={draft.channelFilter}
          placeholder={m.common.anyChannel()}
          onchange={(e) => (draft.channelFilter = toList(e.selected))}
        />
      </SettingField>
    {/if}
    <SettingField label={m.common.requiredRoles()} id="sr-whitelist">
      <DiscordSelector
        id="sr-whitelist"
        type="role"
        options={roles}
        multiple
        selected={draft.roleWhitelist}
        placeholder={m.statroles.phNoRequirement()}
        onchange={(e) => (draft.roleWhitelist = toList(e.selected))}
      />
    </SettingField>
    <SettingField label={m.common.excludedRoles()} id="sr-blacklist">
      <DiscordSelector
        id="sr-blacklist"
        type="role"
        options={roles}
        multiple
        selected={draft.roleBlacklist}
        placeholder={m.common.none()}
        onchange={(e) => (draft.roleBlacklist = toList(e.selected))}
      />
    </SettingField>
    <SettingField label={m.common.ignoredMembers()} id="sr-ignored">
      <DiscordSelector
        id="sr-ignored"
        type="custom"
        customIcon="fa-user"
        options={members}
        multiple
        selected={draft.ignoredUsers}
        placeholder={m.common.none()}
        onchange={(e) => (draft.ignoredUsers = toList(e.selected))}
      />
    </SettingField>
    <SettingField label={m.common.group()} hint={m.statroles.fieldGroupHint()} id="sr-group">
      <input
        id="sr-group"
        type="text"
        maxlength="32"
        placeholder={m.statroles.phGroup()}
        bind:value={draft.groupName}
        class={inputClass}
        style={inputStyle}
      />
    </SettingField>
  </PluginCard>

  <PluginCard title={m.statroles.cardSchedule()} alwaysOpen>
    <NumberField
      id="sr-interval"
      label={m.statroles.fieldInterval()}
      hint={m.statroles.fieldIntervalHint()}
      value={draft.intervalMinutes}
      min={10}
      onchange={(v) => (draft.intervalMinutes = v ?? 10)}
    />
    <SettingField label={m.statroles.fieldAnnounce()} id="sr-notify-channel">
      <DiscordSelector
        id="sr-notify-channel"
        type="channel"
        options={textChannels}
        bind:selected={draft.notifyChannelId}
        placeholder={m.common.noAnnouncements()}
        clearable
      />
    </SettingField>
    <ToggleRow
      id="sr-dm"
      title={m.statroles.toggleDm()}
      colors={$colorStore}
      checked={draft.notifyDm}
      onchange={(v) => (draft.notifyDm = v)}
    />
    <SettingField label={m.common.message()} hint={m.statroles.fieldMessageHint()} id="sr-message">
      <MessageField
        value={draft.notifyMessage}
        previewTitle={m.common.message()}
        icon="fa-trophy"
        user={$userStore}
        placeholder="%user% %action% %role%"
        onchange={(next) => (draft.notifyMessage = next)}
      />
    </SettingField>
  </PluginCard>
  </div>
  </div>
</Sheet>
