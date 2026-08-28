<!-- lib/components/specialized/TriggerAdvancedSettings.svelte -->
<script lang="ts">
  import { slide } from "svelte/transition";
  import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";
  import ToggleRow from "$lib/components/forms/ToggleRow.svelte";
  import type { ChatTrigger } from "$lib/api/index.ts";

  /**
   * How a trigger picks between multiple responses.
   */
  const responseModes = [
    { id: "0", name: "Always the first response", icon: "fa-1" },
    { id: "1", name: "Random response", icon: "fa-shuffle" },
    { id: "2", name: "In order, one per use", icon: "fa-arrow-right-arrow-left" },
    { id: "3", name: "Send all of them", icon: "fa-layer-group" }
  ];

  /**
   * Who a trigger's cooldown applies to.
   */
  const cooldownScopes = [
    { id: "0", name: "Each member separately", icon: "fa-user" },
    { id: "1", name: "Everyone in the channel", icon: "fa-hashtag" },
    { id: "2", name: "The whole server", icon: "fa-server" }
  ];

  /**
   * Bot events a trigger can respond to instead of a message.
   */
  const eventTypes = [
    { id: "0", name: "Not an event trigger", icon: "fa-ban" },
    { id: "1", name: "Member levels up", icon: "fa-arrow-up" },
    { id: "2", name: "Member levels down", icon: "fa-arrow-down" },
    { id: "3", name: "Member joins the server", icon: "fa-door-open" },
    { id: "4", name: "Member leaves the server", icon: "fa-door-closed" },
    { id: "5", name: "Member joins a voice channel", icon: "fa-microphone" },
    { id: "6", name: "Member leaves a voice channel", icon: "fa-microphone-slash" },
    { id: "7", name: "Member starts boosting", icon: "fa-gem" },
    { id: "8", name: "Member stops boosting", icon: "fa-gem" },
    { id: "9", name: "Ticket opened", icon: "fa-ticket" },
    { id: "10", name: "Ticket closed", icon: "fa-ticket" },
    { id: "11", name: "Giveaway won", icon: "fa-gift" }
  ];

  /**
   * How a trigger's prefix requirement is resolved. Mirrors RequirePrefixType in the bot.
   */
  const prefixTypes = [
    { id: "0", name: "No prefix needed", icon: "fa-ban" },
    { id: "1", name: "Global prefix", icon: "fa-globe" },
    { id: "2", name: "Server prefix, or global", icon: "fa-server" },
    { id: "3", name: "Server prefix if one is set", icon: "fa-server" },
    { id: "4", name: "A custom prefix", icon: "fa-pen" }
  ];

  /**
   * Who receives the roles a trigger grants or removes.
   */
  const roleGrantTypes = [
    { id: "0", name: "Whoever used it", icon: "fa-user" },
    { id: "1", name: "People they mentioned", icon: "fa-at" },
    { id: "2", name: "Both", icon: "fa-users" }
  ];

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

  const sections = [
    { key: "matching", title: "When it matches", icon: "fa-crosshairs", hint: "Prefix, position and who may use it" },
    { key: "delivery", title: "How it responds", icon: "fa-paper-plane", hint: "Replies, DMs and clean-up" },
    { key: "roles", title: "Roles", icon: "fa-user-tag", hint: "Roles to grant or remove" },
    { key: "limits", title: "Limits", icon: "fa-gauge-high", hint: "Cooldowns, expiry and who may use it" },
    { key: "economy", title: "Costs and rewards", icon: "fa-coins", hint: "Currency and XP" },
    { key: "counter", title: "Counter requirement", icon: "fa-hashtag", hint: "Only fire within a counter range" },
    { key: "event", title: "Fire on an event", icon: "fa-bolt", hint: "Respond to level ups, joins and more" },
    { key: "organise", title: "Organisation", icon: "fa-folder-tree", hint: "Category, chaining and bots" }
  ];

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

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
            {count} set
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
              <span class="block text-sm mb-1" style="color: {colors.text}">Prefix requirement</span>
              <DiscordSelector
                type="custom"
                options={prefixTypes}
                selected={String(trigger.prefixType ?? 0)}
                placeholder="No prefix needed"
                onchange={(d) => { trigger.prefixType = Number(d.selected); onchange?.(); }}
              />
            </div>

            {#if trigger.prefixType === 4}
              <div>
                <label for="custom-prefix-{trigger.id}" class="block text-sm mb-1" style="color: {colors.text}">
                  Custom prefix
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
              title="Match anywhere in the message"
              subtitle="Off means the whole message has to be the trigger."
              onchange={(v) => { trigger.containsAnywhere = v; onchange?.(); }}
            />

            <ToggleRow
              {colors}
              checked={trigger.allowTarget}
              title="Allow targeting someone"
              subtitle="Lets people add a name after the trigger, used by %target%."
              onchange={(v) => { trigger.allowTarget = v; onchange?.(); }}
            />

            <ToggleRow
              {colors}
              checked={trigger.ownerOnly}
              title="Bot owner only"
              subtitle="Nobody else can use it, including server administrators."
              onchange={(v) => { trigger.ownerOnly = v; onchange?.(); }}
            />

          {:else if section.key === "roles"}
            <div>
              <span class="block text-sm mb-1" style="color: {colors.text}">Roles to grant</span>
              <DiscordSelector
                type="role"
                options={roleOptions}
                multiple={true}
                selected={roleSelection(trigger.grantedRoles)}
                placeholder="No roles granted"
                onchange={(d) => {
                  const ids = (d.selected as string[]) ?? [];
                  trigger.grantedRoles = ids.length > 0 ? ids.join("@@@") : null;
                  onchange?.();
                }}
              />
            </div>

            <div>
              <span class="block text-sm mb-1" style="color: {colors.text}">Roles to remove</span>
              <DiscordSelector
                type="role"
                options={roleOptions}
                multiple={true}
                selected={roleSelection(trigger.removedRoles)}
                placeholder="No roles removed"
                onchange={(d) => {
                  const ids = (d.selected as string[]) ?? [];
                  trigger.removedRoles = ids.length > 0 ? ids.join("@@@") : null;
                  onchange?.();
                }}
              />
            </div>

            {#if trigger.grantedRoles || trigger.removedRoles}
              <div>
                <span class="block text-sm mb-1" style="color: {colors.text}">Apply those roles to</span>
                <DiscordSelector
                  type="custom"
                  options={roleGrantTypes}
                  selected={String(trigger.roleGrantType ?? 0)}
                  placeholder="Whoever used it"
                  onchange={(d) => { trigger.roleGrantType = Number(d.selected); onchange?.(); }}
                />
              </div>
            {/if}

          {:else if section.key === "delivery"}
            <ToggleRow
              {colors}
              checked={trigger.replyToTrigger}
              title="Reply to the message"
              subtitle="Shows the response as a reply so it is clear what it answered."
              onchange={(v) => { trigger.replyToTrigger = v; onchange?.(); }}
            />

            <ToggleRow
              {colors}
              checked={trigger.dmResponse}
              title="Send the response as a DM"
              subtitle="Replies privately instead of in the channel."
              onchange={(v) => { trigger.dmResponse = v; onchange?.(); }}
            />

            <ToggleRow
              {colors}
              checked={trigger.autoDeleteTrigger}
              disabled={trigger.reactToTrigger}
              title="Delete the triggering message"
              subtitle={trigger.reactToTrigger
                ? "Unavailable while reacting to the message, since there would be nothing left to react to."
                : "Removes what the person typed once the trigger fires."}
              onchange={(v) => { trigger.autoDeleteTrigger = v; onchange?.(); }}
            />

            <ToggleRow
              {colors}
              checked={trigger.reactToTrigger}
              disabled={trigger.autoDeleteTrigger}
              title="React to the message instead"
              subtitle={trigger.autoDeleteTrigger
                ? "Unavailable while deleting the triggering message."
                : "Puts the trigger's emoji on their message rather than on the reply."}
              onchange={(v) => { trigger.reactToTrigger = v; onchange?.(); }}
            />

            <ToggleRow
              {colors}
              checked={trigger.noRespond}
              title="Send no message at all"
              subtitle="Useful when the trigger only exists to hand out roles or run another trigger."
              onchange={(v) => { trigger.noRespond = v; onchange?.(); }}
            />

            <div>
              <label for="reactions-{trigger.id}" class="block text-sm mb-1" style="color: {colors.text}">
                Emoji to react with
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
                Separate with spaces. Up to six, added one per second.
              </p>
            </div>

            <div>
              <label for="del-after-{trigger.id}" class="block text-sm mb-1" style="color: {colors.text}">
                Delete the response after
              </label>
              <div class="flex items-center gap-2">
                <input id="del-after-{trigger.id}" type="number" min="0" max="86400"
                       bind:value={trigger.deleteResponseAfter} onchange={() => onchange?.()}
                       class="w-28 min-h-[44px] px-3 rounded-lg border text-base"
                       style="border-color: {colors.primary}30; color: {colors.text}; background: {colors.primary}08;" />
                <span class="text-sm" style="color: {colors.muted}">seconds (0 keeps it)</span>
              </div>
            </div>

            <div>
              <label for="extra-responses-{trigger.id}" class="block text-sm mb-1" style="color: {colors.text}">
                Extra responses
              </label>
              <textarea
                id="extra-responses-{trigger.id}"
                rows="3"
                value={extraResponsesText}
                onchange={(e) => setExtraResponses((e.target as HTMLTextAreaElement).value)}
                placeholder="One response per line"
                class="w-full p-3 rounded-lg border font-mono text-base"
                style="border-color: {colors.primary}30; color: {colors.text}; background: {colors.primary}08;"
              ></textarea>
              <p class="text-xs mt-1" style="color: {colors.muted}">
                One per line. Repeat a line to make it more likely to be picked.
              </p>
            </div>

            {#if (trigger.additionalResponses ?? "").trim().length > 0}
              <div>
                <span class="block text-sm mb-1" style="color: {colors.text}">When there are several responses</span>
                <DiscordSelector
                  type="custom"
                  options={responseModes}
                  selected={String(trigger.responseMode ?? 0)}
                  placeholder="Pick a response mode"
                  onchange={(d) => { trigger.responseMode = Number(d.selected); onchange?.(); }}
                />
              </div>
            {/if}

          {:else if section.key === "limits"}
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label for="cd-{trigger.id}" class="block text-sm mb-1" style="color: {colors.text}">
                  Cooldown (seconds)
                </label>
                <input id="cd-{trigger.id}" type="number" min="0"
                       bind:value={trigger.cooldownSeconds} onchange={() => onchange?.()}
                       class="w-full min-h-[44px] px-3 rounded-lg border text-base"
                       style="border-color: {colors.primary}30; color: {colors.text}; background: {colors.primary}08;" />
              </div>
              <div>
                <span class="block text-sm mb-1" style="color: {colors.text}">Cooldown applies to</span>
                <DiscordSelector
                  type="custom"
                  options={cooldownScopes}
                  selected={String(trigger.cooldownScope ?? 0)}
                  placeholder="Each member separately"
                  onchange={(d) => { trigger.cooldownScope = Number(d.selected); onchange?.(); }}
                />
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label for="max-uses-{trigger.id}" class="block text-sm mb-1" style="color: {colors.text}">
                  Stop after this many uses
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
                  Used {trigger.useCount ?? 0} times so far. 0 means no limit.
                </p>
              </div>
              <div>
                <label for="expiry-{trigger.id}" class="block text-sm mb-1" style="color: {colors.text}">
                  Stop firing after
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
                  Minimum account age (minutes)
                </label>
                <input id="acct-age-{trigger.id}" type="number" min="0"
                       bind:value={trigger.minAccountAgeMinutes} onchange={() => onchange?.()}
                       class="w-full min-h-[44px] px-3 rounded-lg border text-base"
                       style="border-color: {colors.primary}30; color: {colors.text}; background: {colors.primary}08;" />
              </div>
              <div>
                <label for="member-age-{trigger.id}" class="block text-sm mb-1" style="color: {colors.text}">
                  Minimum time in server (minutes)
                </label>
                <input id="member-age-{trigger.id}" type="number" min="0"
                       bind:value={trigger.minServerMembershipMinutes} onchange={() => onchange?.()}
                       class="w-full min-h-[44px] px-3 rounded-lg border text-base"
                       style="border-color: {colors.primary}30; color: {colors.text}; background: {colors.primary}08;" />
              </div>
            </div>
            <p class="text-xs" style="color: {colors.muted}">
              These keep brand new accounts from using a trigger. Leave at 0 for no restriction.
            </p>

            <div class="pt-2 border-t" style="border-color: {colors.primary}20;">
              <div class="mb-3">
                <ToggleRow
                  {colors}
                  checked={activeHoursEnabled}
                  title="Only active at certain hours"
                  subtitle="Uses the server's timezone. An end time before the start time runs overnight."
                  onchange={(v) => toggleActiveHours(v)}
                />
              </div>

              {#if activeHoursEnabled}
                <div class="grid grid-cols-2 gap-4 mb-3">
                  <div>
                    <label for="hours-start-{trigger.id}" class="block text-sm mb-1" style="color: {colors.text}">
                      From
                    </label>
                    <input id="hours-start-{trigger.id}" type="time" value={activeHours.start}
                           onchange={(e) => setActiveHours((e.target as HTMLInputElement).value, activeHours.end, activeHours.days)}
                           class="w-full min-h-[44px] px-3 rounded-lg border text-base"
                           style="border-color: {colors.primary}30; color: {colors.text}; background: {colors.primary}08;" />
                  </div>
                  <div>
                    <label for="hours-end-{trigger.id}" class="block text-sm mb-1" style="color: {colors.text}">
                      Until
                    </label>
                    <input id="hours-end-{trigger.id}" type="time" value={activeHours.end}
                           onchange={(e) => setActiveHours(activeHours.start, (e.target as HTMLInputElement).value, activeHours.days)}
                           class="w-full min-h-[44px] px-3 rounded-lg border text-base"
                           style="border-color: {colors.primary}30; color: {colors.text}; background: {colors.primary}08;" />
                  </div>
                </div>

                <span class="block text-sm mb-2" style="color: {colors.text}">On these days</span>
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
                  No days selected means every day.
                </p>
              {/if}
            </div>

          {:else if section.key === "economy"}
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label for="cost-{trigger.id}" class="block text-sm mb-1" style="color: {colors.text}">
                  Costs the user
                </label>
                <input id="cost-{trigger.id}" type="number" min="0"
                       bind:value={trigger.currencyCost} onchange={() => onchange?.()}
                       class="w-full min-h-[44px] px-3 rounded-lg border text-base"
                       style="border-color: {colors.primary}30; color: {colors.text}; background: {colors.primary}08;" />
              </div>
              <div>
                <label for="reward-{trigger.id}" class="block text-sm mb-1" style="color: {colors.text}">
                  Pays the user
                </label>
                <input id="reward-{trigger.id}" type="number" min="0"
                       bind:value={trigger.currencyReward} onchange={() => onchange?.()}
                       class="w-full min-h-[44px] px-3 rounded-lg border text-base"
                       style="border-color: {colors.primary}30; color: {colors.text}; background: {colors.primary}08;" />
              </div>
              <div>
                <label for="xp-{trigger.id}" class="block text-sm mb-1" style="color: {colors.text}">
                  Grants XP
                </label>
                <input id="xp-{trigger.id}" type="number" min="0"
                       bind:value={trigger.xpReward} onchange={() => onchange?.()}
                       class="w-full min-h-[44px] px-3 rounded-lg border text-base"
                       style="border-color: {colors.primary}30; color: {colors.text}; background: {colors.primary}08;" />
              </div>
              <div>
                <label for="req-lvl-{trigger.id}" class="block text-sm mb-1" style="color: {colors.text}">
                  Requires level
                </label>
                <input id="req-lvl-{trigger.id}" type="number" min="0"
                       bind:value={trigger.requiredXpLevel} onchange={() => onchange?.()}
                       class="w-full min-h-[44px] px-3 rounded-lg border text-base"
                       style="border-color: {colors.primary}30; color: {colors.text}; background: {colors.primary}08;" />
              </div>
            </div>

            <div>
              <label for="fail-msg-{trigger.id}" class="block text-sm mb-1" style="color: {colors.text}">
                Message when they cannot use it
              </label>
              <input id="fail-msg-{trigger.id}" type="text"
                     bind:value={trigger.requirementFailMessage} onchange={() => onchange?.()}
                     placeholder="Leave empty to say nothing"
                     class="w-full min-h-[44px] px-3 rounded-lg border text-base"
                     style="border-color: {colors.primary}30; color: {colors.text}; background: {colors.primary}08;" />
              <p class="text-xs mt-1" style="color: {colors.muted}">
                Shown when someone cannot afford the cost or is below the required level.
              </p>
            </div>

          {:else if section.key === "counter"}
            <div>
              <label for="counter-name-{trigger.id}" class="block text-sm mb-1" style="color: {colors.text}">
                Counter name
              </label>
              <input id="counter-name-{trigger.id}" type="text"
                     bind:value={trigger.counterName} onchange={() => onchange?.()}
                     placeholder="Leave empty for no requirement"
                     class="w-full min-h-[44px] px-3 rounded-lg border text-base"
                     style="border-color: {colors.primary}30; color: {colors.text}; background: {colors.primary}08;" />
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label for="counter-min-{trigger.id}" class="block text-sm mb-1" style="color: {colors.text}">
                  At least
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
                  At most
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
              Counters are shared across the server. Read or change one from a response with
              <code>%counter:name%</code>, or <code>%counter:name+%</code> to add one.
            </p>

          {:else if section.key === "event"}
            <div>
              <span class="block text-sm mb-1" style="color: {colors.text}">Fire when</span>
              <DiscordSelector
                type="custom"
                options={eventTypes}
                selected={String(trigger.eventType ?? 0)}
                placeholder="Not an event trigger"
                onchange={(d) => { trigger.eventType = Number(d.selected); onchange?.(); }}
              />
              <p class="text-xs mt-1" style="color: {colors.muted}">
                Lets this trigger format another feature's announcement, with all the same options.
              </p>
            </div>

            {#if trigger.eventType > 0}
              <div>
                <span class="block text-sm mb-1" style="color: {colors.text}">Respond in</span>
                <DiscordSelector
                  type="channel"
                  options={channelOptions}
                  selected={trigger.eventChannelId && String(trigger.eventChannelId) !== "0"
                    ? String(trigger.eventChannelId)
                    : null}
                  placeholder="Where the event happened"
                  onchange={(d) => {
                    trigger.eventChannelId = (d.selected ? BigInt(d.selected as string) : 0n) as any;
                    onchange?.();
                  }}
                />
                <p class="text-xs mt-1" style="color: {colors.muted}">
                  Joins and boosts have no channel of their own, so pick one here or they will not respond.
                </p>
              </div>
            {/if}

          {:else if section.key === "organise"}
            <div>
              <label for="category-{trigger.id}" class="block text-sm mb-1" style="color: {colors.text}">
                Category
              </label>
              <input id="category-{trigger.id}" type="text" list="ct-categories-{trigger.id}"
                     bind:value={trigger.category} onchange={() => onchange?.()}
                     placeholder="Ungrouped"
                     class="w-full min-h-[44px] px-3 rounded-lg border text-base"
                     style="border-color: {colors.primary}30; color: {colors.text}; background: {colors.primary}08;" />
              <datalist id="ct-categories-{trigger.id}">
                {#each categories as category (category)}
                  <option value={category}></option>
                {/each}
              </datalist>
              <p class="text-xs mt-1" style="color: {colors.muted}">
                Group related triggers so you can turn them all on or off at once.
              </p>
            </div>

            <div>
              <label for="chain-{trigger.id}" class="block text-sm mb-1" style="color: {colors.text}">
                Then run trigger
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
                Runs a second trigger by ID after this one. It still checks its own rules. 0 for none.
              </p>
            </div>

            <ToggleRow
              {colors}
              checked={trigger.allowBots}
              title="Respond to bots instead of people"
              subtitle="Only matches messages from other bots and webhooks. Never its own."
              onchange={(v) => { trigger.allowBots = v; onchange?.(); }}
            />
          {/if}
        </div>
      {/if}
    </div>
  {/each}
</div>
