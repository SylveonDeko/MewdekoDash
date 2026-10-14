<!-- lib/components/specialized/TriggerAdvancedSettings.svelte -->
<script lang="ts">
  import { m } from "$lib/i18n";
  import { slide } from "svelte/transition";
  import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";
  import ToggleRow from "$lib/components/forms/ToggleRow.svelte";
  import type { ChatTrigger } from "$lib/api/index.ts";

  /**
   * How a trigger picks between multiple responses.
   */
  const responseModes = $derived([
    { id: "0", name: m.chatTriggers.advancedModeFirst(), icon: "fa-1" },
    { id: "1", name: m.chatTriggers.advancedModeRandom(), icon: "fa-shuffle" },
    { id: "2", name: m.chatTriggers.advancedModeInOrder(), icon: "fa-arrow-right-arrow-left" },
    { id: "3", name: m.chatTriggers.advancedModeAll(), icon: "fa-layer-group" }
  ]);

  /**
   * Who a trigger's cooldown applies to.
   */
  const cooldownScopes = $derived([
    { id: "0", name: m.chatTriggers.advancedScopeMember(), icon: "fa-user" },
    { id: "1", name: m.chatTriggers.advancedScopeChannel(), icon: "fa-hashtag" },
    { id: "2", name: m.chatTriggers.advancedScopeServer(), icon: "fa-server" }
  ]);

  /**
   * Bot events a trigger can respond to instead of a message.
   */
  const eventTypes = $derived([
    { id: "0", name: m.chatTriggers.advancedEventNone(), icon: "fa-ban" },
    { id: "1", name: m.chatTriggers.advancedEventLevelUp(), icon: "fa-arrow-up" },
    { id: "2", name: m.chatTriggers.advancedEventLevelDown(), icon: "fa-arrow-down" },
    { id: "3", name: m.chatTriggers.advancedEventJoin(), icon: "fa-door-open" },
    { id: "4", name: m.chatTriggers.advancedEventLeave(), icon: "fa-door-closed" },
    { id: "5", name: m.chatTriggers.advancedEventVoiceJoin(), icon: "fa-microphone" },
    { id: "6", name: m.chatTriggers.advancedEventVoiceLeave(), icon: "fa-microphone-slash" },
    { id: "7", name: m.chatTriggers.advancedEventBoostStart(), icon: "fa-gem" },
    { id: "8", name: m.chatTriggers.advancedEventBoostStop(), icon: "fa-gem" },
    { id: "9", name: m.chatTriggers.advancedEventTicketOpen(), icon: "fa-ticket" },
    { id: "10", name: m.chatTriggers.advancedEventTicketClose(), icon: "fa-ticket" },
    { id: "11", name: m.chatTriggers.advancedEventGiveawayWon(), icon: "fa-gift" }
  ]);

  /**
   * How a trigger's prefix requirement is resolved. Mirrors RequirePrefixType in the bot.
   */
  const prefixTypes = $derived([
    { id: "0", name: m.chatTriggers.advancedPrefixNone(), icon: "fa-ban" },
    { id: "1", name: m.chatTriggers.advancedPrefixGlobal(), icon: "fa-globe" },
    { id: "2", name: m.chatTriggers.advancedPrefixServerOrGlobal(), icon: "fa-server" },
    { id: "3", name: m.chatTriggers.advancedPrefixServerIfSet(), icon: "fa-server" },
    { id: "4", name: m.chatTriggers.advancedPrefixCustom(), icon: "fa-pen" }
  ]);

  /**
   * Who receives the roles a trigger grants or removes.
   */
  const roleGrantTypes = $derived([
    { id: "0", name: m.chatTriggers.advancedGrantUser(), icon: "fa-user" },
    { id: "1", name: m.chatTriggers.advancedGrantMentioned(), icon: "fa-at" },
    { id: "2", name: m.common.both(), icon: "fa-users" }
  ]);

  interface Props {
    trigger: ChatTrigger;
    colors: any;
    channelOptions?: Array<{ id: string; name: string }>;
    roleOptions?: Array<{ id: string; name: string }>;
    categories?: string[];
    onchange?: () => void;
  }

  /**
   * The trigger is a deep state proxy from the parent list, so assigning to its properties
   * here updates the parent directly. That avoids binding to an each-block argument, which
   * runes mode disallows.
   */
  let {
    trigger,
    colors,
    channelOptions = [],
    roleOptions = [],
    categories = [],
    onchange
  }: Props = $props();

  /**
   * Normalises the role selection, which arrives as either an array or a separated string
   * depending on where the trigger came from.
   */
  function roleSelection(value: string | string[] | null): string[] {
    if (Array.isArray(value)) return value;
    if (!value) return [];
    return value.split("@@@").filter(id => id.trim().length > 0);
  }

  let openSection: string | null = $state(null);

  /**
   * Opens a section, or closes it when it is already open.
   */
  function toggleSection(name: string) {
    openSection = openSection === name ? null : name;
  }

  /**
   * Counts the settings in a section that differ from their default, so a collapsed
   * section still shows whether anything inside it is configured.
   */
  function activeCount(section: string): number {
    switch (section) {
      case "matching":
        return [trigger.containsAnywhere, trigger.allowTarget, trigger.ownerOnly,
          trigger.prefixType > 0].filter(Boolean).length;
      case "roles":
        return [!!trigger.grantedRoles, !!trigger.removedRoles].filter(Boolean).length;
      case "delivery":
        return [trigger.replyToTrigger, trigger.deleteResponseAfter > 0, trigger.dmResponse,
          trigger.noRespond, trigger.autoDeleteTrigger, trigger.reactToTrigger,
          !!trigger.additionalResponses].filter(Boolean).length;
      case "limits":
        return [trigger.cooldownSeconds > 0, trigger.maxUses != null, trigger.expiresAt != null,
          trigger.minAccountAgeMinutes > 0, trigger.minServerMembershipMinutes > 0,
          !!trigger.timeConditions].filter(Boolean).length;
      case "economy":
        return [trigger.currencyCost > 0, trigger.currencyReward > 0, trigger.xpReward > 0,
          trigger.requiredXpLevel > 0].filter(Boolean).length;
      case "counter":
        return trigger.counterName ? 1 : 0;
      case "event":
        return trigger.eventType > 0 ? 1 : 0;
      case "organise":
        return [!!trigger.category, trigger.nextTriggerId != null, trigger.allowBots].filter(Boolean).length;
      default:
        return 0;
    }
  }

  const sections = $derived([
    { key: "matching", title: m.chatTriggers.advancedSectionMatchingTitle(), icon: "fa-crosshairs", hint: m.chatTriggers.advancedSectionMatchingHint() },
    { key: "delivery", title: m.chatTriggers.advancedSectionDeliveryTitle(), icon: "fa-paper-plane", hint: m.chatTriggers.advancedSectionDeliveryHint() },
    { key: "roles", title: m.common.roles(), icon: "fa-user-tag", hint: m.chatTriggers.advancedSectionRolesHint() },
    { key: "limits", title: m.chatTriggers.advancedSectionLimitsTitle(), icon: "fa-gauge-high", hint: m.chatTriggers.advancedSectionLimitsHint() },
    { key: "economy", title: m.chatTriggers.advancedSectionEconomyTitle(), icon: "fa-coins", hint: m.chatTriggers.advancedSectionEconomyHint() },
    { key: "counter", title: m.chatTriggers.advancedSectionCounterTitle(), icon: "fa-hashtag", hint: m.chatTriggers.advancedSectionCounterHint() },
    { key: "event", title: m.chatTriggers.advancedSectionEventTitle(), icon: "fa-bolt", hint: m.chatTriggers.advancedSectionEventHint() },
    { key: "organise", title: m.chatTriggers.advancedSectionOrganiseTitle(), icon: "fa-folder-tree", hint: m.chatTriggers.advancedSectionOrganiseHint() }
  ]);

  const dayNames = $derived([m.chatTriggers.advancedDaySun(), m.chatTriggers.advancedDayMon(), m.chatTriggers.advancedDayTue(), m.chatTriggers.advancedDayWed(), m.chatTriggers.advancedDayThu(), m.chatTriggers.advancedDayFri(), m.chatTriggers.advancedDaySat()]);

  /**
   * The extra responses as one per line, converted from the "@@@" separated form the bot stores.
   */
  let extraResponsesText = $derived((trigger.additionalResponses ?? "").split("@@@").join("\n"));

  /**
   * Stores the extra responses back in the separated form, dropping blank lines.
   */
  function setExtraResponses(value: string) {
    const parts = value.split("\n").map(line => line.trim()).filter(line => line.length > 0);
    trigger.additionalResponses = parts.length > 0 ? parts.join("@@@") : null;
    onchange?.();
  }

  /**
   * The trigger's active window, parsed from the condition format shared with sticky messages.
   * Only the first condition is edited here; the bot supports several, and any extras are left
   * untouched rather than being silently dropped by this editor.
   */
  let activeHours = $derived.by(() => {
    const fallback = { start: "09:00", end: "17:00", days: [] as number[] };

    if (!trigger.timeConditions) return fallback;

    try {
      const parsed = JSON.parse(trigger.timeConditions);
      const first = Array.isArray(parsed) ? parsed[0] : null;
      if (!first) return fallback;

      return {
        start: first.StartTime ?? first.startTime ?? fallback.start,
        end: first.EndTime ?? first.endTime ?? fallback.end,
        days: (first.DaysOfWeek ?? first.daysOfWeek ?? []) as number[]
      };
    } catch {
      return fallback;
    }
  });

  let activeHoursEnabled = $derived(!!trigger.timeConditions);

  /**
   * Writes the active window back in the bot's condition format.
   */
  function setActiveHours(start: string, end: string, days: number[]) {
    trigger.timeConditions = JSON.stringify([{
      StartTime: start,
      EndTime: end,
      DaysOfWeek: days.length > 0 ? days : null,
      Enabled: true,
      Name: null
    }]);
    onchange?.();
  }

  /**
   * Turns the active window on with a sensible default, or clears it entirely.
   */
  function toggleActiveHours(enabled: boolean) {
    if (!enabled) {
      trigger.timeConditions = null;
      onchange?.();
      return;
    }

    setActiveHours(activeHours.start, activeHours.end, activeHours.days);
  }

  /**
   * Adds or removes a day from the active window.
   */
  function toggleDay(index: number) {
    const days = activeHours.days.includes(index)
      ? activeHours.days.filter(d => d !== index)
      : [...activeHours.days, index].sort((a, b) => a - b);

    setActiveHours(activeHours.start, activeHours.end, days);
  }

  /**
   * Converts the datetime-local input value to the ISO string the API stores.
   */
  function setExpiry(value: string) {
    trigger.expiresAt = value ? new Date(value).toISOString() : null;
    onchange?.();
  }

  /**
   * Formats the stored expiry for a datetime-local input.
   */
  function expiryInputValue(): string {
    if (!trigger.expiresAt) return "";
    const date = new Date(trigger.expiresAt);
    if (Number.isNaN(date.getTime())) return "";
    return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
  }
</script>

<div class="space-y-2">
  {#each sections as section (section.key)}
    {@const count = activeCount(section.key)}
    <div
      class="rounded-xl border"
      style="border-color: {colors.primary}25;
             position: relative;
             z-index: {openSection === section.key ? 20 : 1};"
    >
      <button
        type="button"
        class="w-full min-h-[44px] flex items-center gap-3 p-3 text-left rounded-xl transition-colors hover:brightness-110"
        class:rounded-b-none={openSection === section.key}
        style="background: {colors.primary}08;"
        aria-expanded={openSection === section.key}
        onclick={() => toggleSection(section.key)}
      >
        <i class="fa-solid {section.icon}" style="color: {colors.primary}; font-size: 15px; width: 18px;"></i>
        <span class="flex-1">
          <span class="block text-sm font-medium" style="color: {colors.text}">{section.title}</span>
          <span class="block text-xs" style="color: {colors.muted}">{section.hint}</span>
        </span>
        {#if count > 0}
          <span class="text-xs px-2 py-0.5 rounded-full font-medium"
                style="background: {colors.primary}25; color: {colors.primary};">
            {m.common.setCount({ count })}
          </span>
        {/if}
        <i class="fa-solid {openSection === section.key ? 'fa-chevron-up' : 'fa-chevron-down'}"
           style="color: {colors.muted}; font-size: 12px;"></i>
      </button>

      {#if openSection === section.key}
        <div transition:slide={{ duration: 150 }} class="p-4 space-y-4 border-t"
             style="border-color: {colors.primary}20;">

          {#if section.key === "matching"}
            <div>
              <span class="block text-sm mb-1" style="color: {colors.text}">{m.chatTriggers.pageLabelPrefixType()}</span>
              <DiscordSelector
                type="custom"
                options={prefixTypes}
                selected={String(trigger.prefixType ?? 0)}
                placeholder={m.chatTriggers.advancedPrefixNone()}
                onchange={(d) => { trigger.prefixType = Number(d.selected); onchange?.(); }}
              />
            </div>

            {#if trigger.prefixType === 4}
              <div>
                <label for="custom-prefix-{trigger.id}" class="block text-sm mb-1" style="color: {colors.text}">
                  {m.chatTriggers.advancedCustomPrefix()}
                </label>
                <input id="custom-prefix-{trigger.id}" type="text"
                       bind:value={trigger.customPrefix} onchange={() => onchange?.()}
                       class="w-full min-h-[44px] px-3 rounded-lg border text-base"
                       style="border-color: {colors.primary}30; color: {colors.text}; background: {colors.primary}08;" />
              </div>
            {/if}

            <ToggleRow
              {colors}
              checked={trigger.containsAnywhere}
              title={m.chatTriggers.advancedMatchAnywhere()}
              subtitle={m.chatTriggers.advancedMatchAnywhereHint()}
              onchange={(v) => { trigger.containsAnywhere = v; onchange?.(); }}
            />

            <ToggleRow
              {colors}
              checked={trigger.allowTarget}
              title={m.chatTriggers.advancedAllowTarget()}
              subtitle={m.chatTriggers.advancedAllowTargetHint()}
              onchange={(v) => { trigger.allowTarget = v; onchange?.(); }}
            />

            <ToggleRow
              {colors}
              checked={trigger.ownerOnly}
              title={m.chatTriggers.advancedOwnerOnly()}
              subtitle={m.chatTriggers.advancedOwnerOnlyHint()}
              onchange={(v) => { trigger.ownerOnly = v; onchange?.(); }}
            />

          {:else if section.key === "roles"}
            <div>
              <span class="block text-sm mb-1" style="color: {colors.text}">{m.common.rolesToGrant()}</span>
              <DiscordSelector
                type="role"
                options={roleOptions}
                multiple={true}
                selected={roleSelection(trigger.grantedRoles)}
                placeholder={m.chatTriggers.advancedRolesNoneGranted()}
                onchange={(d) => {
                  const ids = (d.selected as string[]) ?? [];
                  trigger.grantedRoles = ids.length > 0 ? ids.join("@@@") : null;
                  onchange?.();
                }}
              />
            </div>

            <div>
              <span class="block text-sm mb-1" style="color: {colors.text}">{m.chatTriggers.advancedRolesToRemove()}</span>
              <DiscordSelector
                type="role"
                options={roleOptions}
                multiple={true}
                selected={roleSelection(trigger.removedRoles)}
                placeholder={m.chatTriggers.advancedRolesNoneRemoved()}
                onchange={(d) => {
                  const ids = (d.selected as string[]) ?? [];
                  trigger.removedRoles = ids.length > 0 ? ids.join("@@@") : null;
                  onchange?.();
                }}
              />
            </div>

            {#if trigger.grantedRoles || trigger.removedRoles}
              <div>
                <span class="block text-sm mb-1" style="color: {colors.text}">{m.chatTriggers.advancedRolesApplyTo()}</span>
                <DiscordSelector
                  type="custom"
                  options={roleGrantTypes}
                  selected={String(trigger.roleGrantType ?? 0)}
                  placeholder={m.chatTriggers.advancedGrantUser()}
                  onchange={(d) => { trigger.roleGrantType = Number(d.selected); onchange?.(); }}
                />
              </div>
            {/if}

          {:else if section.key === "delivery"}
            <ToggleRow
              {colors}
              checked={trigger.replyToTrigger}
              title={m.chatTriggers.advancedReplyToMessage()}
              subtitle={m.chatTriggers.advancedReplyToMessageHint()}
              onchange={(v) => { trigger.replyToTrigger = v; onchange?.(); }}
            />

            <ToggleRow
              {colors}
              checked={trigger.dmResponse}
              title={m.chatTriggers.advancedSendAsDm()}
              subtitle={m.chatTriggers.advancedSendAsDmHint()}
              onchange={(v) => { trigger.dmResponse = v; onchange?.(); }}
            />

            <ToggleRow
              {colors}
              checked={trigger.autoDeleteTrigger}
              disabled={trigger.reactToTrigger}
              title={m.chatTriggers.advancedDeleteTrigger()}
              subtitle={trigger.reactToTrigger
                ? m.chatTriggers.advancedDeleteTriggerHintBlocked()
                : m.chatTriggers.advancedDeleteTriggerHint()}
              onchange={(v) => { trigger.autoDeleteTrigger = v; onchange?.(); }}
            />

            <ToggleRow
              {colors}
              checked={trigger.reactToTrigger}
              disabled={trigger.autoDeleteTrigger}
              title={m.chatTriggers.advancedReactInstead()}
              subtitle={trigger.autoDeleteTrigger
                ? m.chatTriggers.advancedReactInsteadHintBlocked()
                : m.chatTriggers.advancedReactInsteadHint()}
              onchange={(v) => { trigger.reactToTrigger = v; onchange?.(); }}
            />

            <ToggleRow
              {colors}
              checked={trigger.noRespond}
              title={m.chatTriggers.advancedNoMessage()}
              subtitle={m.chatTriggers.advancedNoMessageHint()}
              onchange={(v) => { trigger.noRespond = v; onchange?.(); }}
            />

            <div>
              <label for="reactions-{trigger.id}" class="block text-sm mb-1" style="color: {colors.text}">
                {m.common.emojiToReactWith()}
              </label>
              <input id="reactions-{trigger.id}" type="text"
                     value={(trigger.reactions ?? "").split("@@@").join(" ")}
                     onchange={(e) => {
                       const parts = (e.target as HTMLInputElement).value
                         .split(/\s+/).filter(part => part.length > 0);
                       trigger.reactions = parts.length > 0 ? parts.join("@@@") : null;
                       onchange?.();
                     }}
                     placeholder="👍 ✅ 🎉"
                     class="w-full min-h-[44px] px-3 rounded-lg border text-base"
                     style="border-color: {colors.primary}30; color: {colors.text}; background: {colors.primary}08;" />
              <p class="text-xs mt-1" style="color: {colors.muted}">
                {m.chatTriggers.advancedReactEmojiHint()}
              </p>
            </div>

            <div>
              <label for="del-after-{trigger.id}" class="block text-sm mb-1" style="color: {colors.text}">
                {m.chatTriggers.advancedDeleteResponseAfter()}
              </label>
              <div class="flex items-center gap-2">
                <input id="del-after-{trigger.id}" type="number" min="0" max="86400"
                       bind:value={trigger.deleteResponseAfter} onchange={() => onchange?.()}
                       class="w-28 min-h-[44px] px-3 rounded-lg border text-base"
                       style="border-color: {colors.primary}30; color: {colors.text}; background: {colors.primary}08;" />
                <span class="text-sm" style="color: {colors.muted}">{m.chatTriggers.advancedDeleteResponseSeconds()}</span>
              </div>
            </div>

            <div>
              <label for="extra-responses-{trigger.id}" class="block text-sm mb-1" style="color: {colors.text}">
                {m.chatTriggers.advancedExtraResponses()}
              </label>
              <textarea
                id="extra-responses-{trigger.id}"
                rows="3"
                value={extraResponsesText}
                onchange={(e) => setExtraResponses((e.target as HTMLTextAreaElement).value)}
                placeholder={m.chatTriggers.advancedExtraResponsesPlaceholder()}
                class="w-full p-3 rounded-lg border font-mono text-base"
                style="border-color: {colors.primary}30; color: {colors.text}; background: {colors.primary}08;"
              ></textarea>
              <p class="text-xs mt-1" style="color: {colors.muted}">
                {m.chatTriggers.advancedExtraResponsesHint()}
              </p>
            </div>

            {#if (trigger.additionalResponses ?? "").trim().length > 0}
              <div>
                <span class="block text-sm mb-1" style="color: {colors.text}">{m.chatTriggers.advancedResponseMode()}</span>
                <DiscordSelector
                  type="custom"
                  options={responseModes}
                  selected={String(trigger.responseMode ?? 0)}
                  placeholder={m.chatTriggers.advancedResponseModePlaceholder()}
                  onchange={(d) => { trigger.responseMode = Number(d.selected); onchange?.(); }}
                />
              </div>
            {/if}

          {:else if section.key === "limits"}
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label for="cd-{trigger.id}" class="block text-sm mb-1" style="color: {colors.text}">
                  {m.common.cooldownSeconds()}
                </label>
                <input id="cd-{trigger.id}" type="number" min="0"
                       bind:value={trigger.cooldownSeconds} onchange={() => onchange?.()}
                       class="w-full min-h-[44px] px-3 rounded-lg border text-base"
                       style="border-color: {colors.primary}30; color: {colors.text}; background: {colors.primary}08;" />
              </div>
              <div>
                <span class="block text-sm mb-1" style="color: {colors.text}">{m.chatTriggers.advancedCooldownAppliesTo()}</span>
                <DiscordSelector
                  type="custom"
                  options={cooldownScopes}
                  selected={String(trigger.cooldownScope ?? 0)}
                  placeholder={m.chatTriggers.advancedScopeMember()}
                  onchange={(d) => { trigger.cooldownScope = Number(d.selected); onchange?.(); }}
                />
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label for="max-uses-{trigger.id}" class="block text-sm mb-1" style="color: {colors.text}">
                  {m.chatTriggers.advancedMaxUses()}
                </label>
                <input id="max-uses-{trigger.id}" type="number" min="0"
                       value={trigger.maxUses ?? 0}
                       onchange={(e) => {
                         const v = Number((e.target as HTMLInputElement).value);
                         trigger.maxUses = v > 0 ? v : null;
                         onchange?.();
                       }}
                       class="w-full min-h-[44px] px-3 rounded-lg border text-base"
                       style="border-color: {colors.primary}30; color: {colors.text}; background: {colors.primary}08;" />
                <p class="text-xs mt-1" style="color: {colors.muted}">
                  {Number(trigger.useCount ?? 0) === 1 ? m.chatTriggers.advancedMaxUsesHintOne({ count: 1 }) : m.chatTriggers.advancedMaxUsesHintOther({ count: Number(trigger.useCount ?? 0) })}
                </p>
              </div>
              <div>
                <label for="expiry-{trigger.id}" class="block text-sm mb-1" style="color: {colors.text}">
                  {m.chatTriggers.advancedExpiry()}
                </label>
                <input id="expiry-{trigger.id}" type="datetime-local"
                       value={expiryInputValue()}
                       onchange={(e) => setExpiry((e.target as HTMLInputElement).value)}
                       class="w-full min-h-[44px] px-3 rounded-lg border text-base"
                       style="border-color: {colors.primary}30; color: {colors.text}; background: {colors.primary}08;" />
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label for="acct-age-{trigger.id}" class="block text-sm mb-1" style="color: {colors.text}">
                  {m.common.minimumAccountAgeMinutes()}
                </label>
                <input id="acct-age-{trigger.id}" type="number" min="0"
                       bind:value={trigger.minAccountAgeMinutes} onchange={() => onchange?.()}
                       class="w-full min-h-[44px] px-3 rounded-lg border text-base"
                       style="border-color: {colors.primary}30; color: {colors.text}; background: {colors.primary}08;" />
              </div>
              <div>
                <label for="member-age-{trigger.id}" class="block text-sm mb-1" style="color: {colors.text}">
                  {m.chatTriggers.advancedMinMembership()}
                </label>
                <input id="member-age-{trigger.id}" type="number" min="0"
                       bind:value={trigger.minServerMembershipMinutes} onchange={() => onchange?.()}
                       class="w-full min-h-[44px] px-3 rounded-lg border text-base"
                       style="border-color: {colors.primary}30; color: {colors.text}; background: {colors.primary}08;" />
              </div>
            </div>
            <p class="text-xs" style="color: {colors.muted}">
              {m.chatTriggers.advancedMinAgeHint()}
            </p>

            <div class="pt-2 border-t" style="border-color: {colors.primary}20;">
              <div class="mb-3">
                <ToggleRow
                  {colors}
                  checked={activeHoursEnabled}
                  title={m.chatTriggers.advancedActiveHours()}
                  subtitle={m.chatTriggers.advancedActiveHoursHint()}
                  onchange={(v) => toggleActiveHours(v)}
                />
              </div>

              {#if activeHoursEnabled}
                <div class="grid grid-cols-2 gap-4 mb-3">
                  <div>
                    <label for="hours-start-{trigger.id}" class="block text-sm mb-1" style="color: {colors.text}">
                      {m.common.from()}
                    </label>
                    <input id="hours-start-{trigger.id}" type="time" value={activeHours.start}
                           onchange={(e) => setActiveHours((e.target as HTMLInputElement).value, activeHours.end, activeHours.days)}
                           class="w-full min-h-[44px] px-3 rounded-lg border text-base"
                           style="border-color: {colors.primary}30; color: {colors.text}; background: {colors.primary}08;" />
                  </div>
                  <div>
                    <label for="hours-end-{trigger.id}" class="block text-sm mb-1" style="color: {colors.text}">
                      {m.chatTriggers.advancedHoursUntil()}
                    </label>
                    <input id="hours-end-{trigger.id}" type="time" value={activeHours.end}
                           onchange={(e) => setActiveHours(activeHours.start, (e.target as HTMLInputElement).value, activeHours.days)}
                           class="w-full min-h-[44px] px-3 rounded-lg border text-base"
                           style="border-color: {colors.primary}30; color: {colors.text}; background: {colors.primary}08;" />
                  </div>
                </div>

                <span class="block text-sm mb-2" style="color: {colors.text}">{m.chatTriggers.advancedHoursDays()}</span>
                <div class="flex flex-wrap gap-2">
                  {#each dayNames as day, index (day)}
                    <button
                      type="button"
                      class="min-w-[44px] min-h-[44px] px-3 rounded-lg text-sm font-medium transition-all"
                      style="background: {activeHours.days.includes(index) ? colors.primary : `${colors.primary}15`};
                             color: {activeHours.days.includes(index) ? '#fff' : colors.text};"
                      aria-pressed={activeHours.days.includes(index)}
                      onclick={() => toggleDay(index)}
                    >
                      {day}
                    </button>
                  {/each}
                </div>
                <p class="text-xs mt-2" style="color: {colors.muted}">
                  {m.chatTriggers.advancedHoursDaysHint()}
                </p>
              {/if}
            </div>

          {:else if section.key === "economy"}
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label for="cost-{trigger.id}" class="block text-sm mb-1" style="color: {colors.text}">
                  {m.chatTriggers.advancedCost()}
                </label>
                <input id="cost-{trigger.id}" type="number" min="0"
                       bind:value={trigger.currencyCost} onchange={() => onchange?.()}
                       class="w-full min-h-[44px] px-3 rounded-lg border text-base"
                       style="border-color: {colors.primary}30; color: {colors.text}; background: {colors.primary}08;" />
              </div>
              <div>
                <label for="reward-{trigger.id}" class="block text-sm mb-1" style="color: {colors.text}">
                  {m.chatTriggers.advancedReward()}
                </label>
                <input id="reward-{trigger.id}" type="number" min="0"
                       bind:value={trigger.currencyReward} onchange={() => onchange?.()}
                       class="w-full min-h-[44px] px-3 rounded-lg border text-base"
                       style="border-color: {colors.primary}30; color: {colors.text}; background: {colors.primary}08;" />
              </div>
              <div>
                <label for="xp-{trigger.id}" class="block text-sm mb-1" style="color: {colors.text}">
                  {m.chatTriggers.advancedXpReward()}
                </label>
                <input id="xp-{trigger.id}" type="number" min="0"
                       bind:value={trigger.xpReward} onchange={() => onchange?.()}
                       class="w-full min-h-[44px] px-3 rounded-lg border text-base"
                       style="border-color: {colors.primary}30; color: {colors.text}; background: {colors.primary}08;" />
              </div>
              <div>
                <label for="req-lvl-{trigger.id}" class="block text-sm mb-1" style="color: {colors.text}">
                  {m.chatTriggers.advancedRequiredLevel()}
                </label>
                <input id="req-lvl-{trigger.id}" type="number" min="0"
                       bind:value={trigger.requiredXpLevel} onchange={() => onchange?.()}
                       class="w-full min-h-[44px] px-3 rounded-lg border text-base"
                       style="border-color: {colors.primary}30; color: {colors.text}; background: {colors.primary}08;" />
              </div>
            </div>

            <div>
              <label for="fail-msg-{trigger.id}" class="block text-sm mb-1" style="color: {colors.text}">
                {m.chatTriggers.advancedFailMessage()}
              </label>
              <input id="fail-msg-{trigger.id}" type="text"
                     bind:value={trigger.requirementFailMessage} onchange={() => onchange?.()}
                     placeholder={m.chatTriggers.advancedFailMessagePlaceholder()}
                     class="w-full min-h-[44px] px-3 rounded-lg border text-base"
                     style="border-color: {colors.primary}30; color: {colors.text}; background: {colors.primary}08;" />
              <p class="text-xs mt-1" style="color: {colors.muted}">
                {m.chatTriggers.advancedFailMessageHint()}
              </p>
            </div>

          {:else if section.key === "counter"}
            <div>
              <label for="counter-name-{trigger.id}" class="block text-sm mb-1" style="color: {colors.text}">
                {m.chatTriggers.advancedCounterName()}
              </label>
              <input id="counter-name-{trigger.id}" type="text"
                     bind:value={trigger.counterName} onchange={() => onchange?.()}
                     placeholder={m.chatTriggers.advancedCounterNamePlaceholder()}
                     class="w-full min-h-[44px] px-3 rounded-lg border text-base"
                     style="border-color: {colors.primary}30; color: {colors.text}; background: {colors.primary}08;" />
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label for="counter-min-{trigger.id}" class="block text-sm mb-1" style="color: {colors.text}">
                  {m.chatTriggers.advancedCounterMin()}
                </label>
                <input id="counter-min-{trigger.id}" type="number"
                       value={trigger.counterMin ?? ""}
                       onchange={(e) => {
                         const raw = (e.target as HTMLInputElement).value;
                         trigger.counterMin = raw === "" ? null : Number(raw);
                         onchange?.();
                       }}
                       class="w-full min-h-[44px] px-3 rounded-lg border text-base"
                       style="border-color: {colors.primary}30; color: {colors.text}; background: {colors.primary}08;" />
              </div>
              <div>
                <label for="counter-max-{trigger.id}" class="block text-sm mb-1" style="color: {colors.text}">
                  {m.chatTriggers.advancedCounterMax()}
                </label>
                <input id="counter-max-{trigger.id}" type="number"
                       value={trigger.counterMax ?? ""}
                       onchange={(e) => {
                         const raw = (e.target as HTMLInputElement).value;
                         trigger.counterMax = raw === "" ? null : Number(raw);
                         onchange?.();
                       }}
                       class="w-full min-h-[44px] px-3 rounded-lg border text-base"
                       style="border-color: {colors.primary}30; color: {colors.text}; background: {colors.primary}08;" />
              </div>
            </div>
            <p class="text-xs" style="color: {colors.muted}">
              {@html m.chatTriggers.advancedCounterHint({ read: "<code>%counter:name%</code>", add: "<code>%counter:name+%</code>" })}
            </p>

          {:else if section.key === "event"}
            <div>
              <span class="block text-sm mb-1" style="color: {colors.text}">{m.chatTriggers.advancedEventFireWhen()}</span>
              <DiscordSelector
                type="custom"
                options={eventTypes}
                selected={String(trigger.eventType ?? 0)}
                placeholder={m.chatTriggers.advancedEventNone()}
                onchange={(d) => { trigger.eventType = Number(d.selected); onchange?.(); }}
              />
              <p class="text-xs mt-1" style="color: {colors.muted}">
                {m.chatTriggers.advancedEventHint()}
              </p>
            </div>

            {#if trigger.eventType > 0}
              <div>
                <span class="block text-sm mb-1" style="color: {colors.text}">{m.chatTriggers.advancedEventRespondIn()}</span>
                <DiscordSelector
                  type="channel"
                  options={channelOptions}
                  selected={trigger.eventChannelId && String(trigger.eventChannelId) !== "0"
                    ? String(trigger.eventChannelId)
                    : null}
                  placeholder={m.chatTriggers.advancedEventChannelPlaceholder()}
                  onchange={(d) => {
                    trigger.eventChannelId = (d.selected ? BigInt(d.selected as string) : 0n) as any;
                    onchange?.();
                  }}
                />
                <p class="text-xs mt-1" style="color: {colors.muted}">
                  {m.chatTriggers.advancedEventChannelHint()}
                </p>
              </div>
            {/if}

          {:else if section.key === "organise"}
            <div>
              <label for="category-{trigger.id}" class="block text-sm mb-1" style="color: {colors.text}">
                {m.common.category()}
              </label>
              <input id="category-{trigger.id}" type="text" list="ct-categories-{trigger.id}"
                     bind:value={trigger.category} onchange={() => onchange?.()}
                     placeholder={m.common.ungrouped()}
                     class="w-full min-h-[44px] px-3 rounded-lg border text-base"
                     style="border-color: {colors.primary}30; color: {colors.text}; background: {colors.primary}08;" />
              <datalist id="ct-categories-{trigger.id}">
                {#each categories as category (category)}
                  <option value={category}></option>
                {/each}
              </datalist>
              <p class="text-xs mt-1" style="color: {colors.muted}">
                {m.chatTriggers.advancedCategoryHint()}
              </p>
            </div>

            <div>
              <label for="chain-{trigger.id}" class="block text-sm mb-1" style="color: {colors.text}">
                {m.chatTriggers.advancedChain()}
              </label>
              <input id="chain-{trigger.id}" type="number" min="0"
                     value={trigger.nextTriggerId ?? 0}
                     onchange={(e) => {
                       const v = Number((e.target as HTMLInputElement).value);
                       trigger.nextTriggerId = v > 0 ? v : null;
                       onchange?.();
                     }}
                     class="w-full min-h-[44px] px-3 rounded-lg border text-base"
                     style="border-color: {colors.primary}30; color: {colors.text}; background: {colors.primary}08;" />
              <p class="text-xs mt-1" style="color: {colors.muted}">
                {m.chatTriggers.advancedChainHint()}
              </p>
            </div>

            <ToggleRow
              {colors}
              checked={trigger.allowBots}
              title={m.chatTriggers.advancedAllowBots()}
              subtitle={m.chatTriggers.advancedAllowBotsHint()}
              onchange={(v) => { trigger.allowBots = v; onchange?.(); }}
            />
          {/if}
        </div>
      {/if}
    </div>
  {/each}
</div>
