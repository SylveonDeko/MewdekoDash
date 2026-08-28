<!-- lib/components/specialized/TriggerAdvancedSettings.svelte -->
<script lang="ts">
  import { slide } from "svelte/transition";
  import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";
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

  interface Props {
    trigger: ChatTrigger;
    colors: any;
    channelOptions?: Array<{ id: string; name: string }>;
    categories?: string[];
    onchange?: () => void;
  }

  /**
   * The trigger is a deep state proxy from the parent list, so assigning to its properties
   * here updates the parent directly. That avoids binding to an each-block argument, which
   * runes mode disallows.
   */
  let { trigger, colors, channelOptions = [], categories = [], onchange }: Props = $props();

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
      case "delivery":
        return [trigger.replyToTrigger, trigger.deleteResponseAfter > 0, trigger.dmResponse,
          trigger.noRespond, trigger.autoDeleteTrigger].filter(Boolean).length;
      case "limits":
        return [trigger.cooldownSeconds > 0, trigger.maxUses != null, trigger.expiresAt != null,
          trigger.minAccountAgeMinutes > 0, trigger.minServerMembershipMinutes > 0].filter(Boolean).length;
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
    { key: "delivery", title: "How it responds", icon: "fa-paper-plane", hint: "Replies, DMs and clean-up" },
    { key: "limits", title: "Limits", icon: "fa-gauge-high", hint: "Cooldowns, expiry and who may use it" },
    { key: "economy", title: "Costs and rewards", icon: "fa-coins", hint: "Currency and XP" },
    { key: "counter", title: "Counter requirement", icon: "fa-hashtag", hint: "Only fire within a counter range" },
    { key: "event", title: "Fire on an event", icon: "fa-bolt", hint: "Respond to level ups, joins and more" },
    { key: "organise", title: "Organisation", icon: "fa-folder-tree", hint: "Category, chaining and bots" }
  ];

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
    <div class="rounded-xl border overflow-hidden" style="border-color: {colors.primary}25;">
      <button
        type="button"
        class="w-full flex items-center gap-3 p-3 text-left transition-colors hover:brightness-110"
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

          {#if section.key === "delivery"}
            <label class="flex items-start gap-3 cursor-pointer">
              <input type="checkbox" bind:checked={trigger.replyToTrigger} onchange={() => onchange?.()}
                     class="mt-1" style="accent-color: {colors.primary};" />
              <span>
                <span class="block text-sm" style="color: {colors.text}">Reply to the message</span>
                <span class="block text-xs" style="color: {colors.muted}">
                  Shows the response as a reply so it is clear what it answered.
                </span>
              </span>
            </label>

            <div>
              <label for="del-after-{trigger.id}" class="block text-sm mb-1" style="color: {colors.text}">
                Delete the response after
              </label>
              <div class="flex items-center gap-2">
                <input id="del-after-{trigger.id}" type="number" min="0" max="86400"
                       bind:value={trigger.deleteResponseAfter} onchange={() => onchange?.()}
                       class="w-28 p-2 rounded-lg border"
                       style="border-color: {colors.primary}30; color: {colors.text}; background: {colors.primary}08;" />
                <span class="text-sm" style="color: {colors.muted}">seconds (0 keeps it)</span>
              </div>
            </div>

            <div>
              <span class="block text-sm mb-1" style="color: {colors.text}">When there are several responses</span>
              <DiscordSelector
                type="custom"
                options={responseModes}
                selected={String(trigger.responseMode ?? 0)}
                placeholder="Pick a response mode"
                onchange={(d) => { trigger.responseMode = Number(d.selected); onchange?.(); }}
              />
              <p class="text-xs mt-1" style="color: {colors.muted}">
                Add extra responses with <code>.ctaddresponse</code>. Repeat one to make it more likely.
              </p>
            </div>

          {:else if section.key === "limits"}
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label for="cd-{trigger.id}" class="block text-sm mb-1" style="color: {colors.text}">
                  Cooldown (seconds)
                </label>
                <input id="cd-{trigger.id}" type="number" min="0"
                       bind:value={trigger.cooldownSeconds} onchange={() => onchange?.()}
                       class="w-full p-2 rounded-lg border"
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
                       class="w-full p-2 rounded-lg border"
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
                       class="w-full p-2 rounded-lg border"
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
                       class="w-full p-2 rounded-lg border"
                       style="border-color: {colors.primary}30; color: {colors.text}; background: {colors.primary}08;" />
              </div>
              <div>
                <label for="member-age-{trigger.id}" class="block text-sm mb-1" style="color: {colors.text}">
                  Minimum time in server (minutes)
                </label>
                <input id="member-age-{trigger.id}" type="number" min="0"
                       bind:value={trigger.minServerMembershipMinutes} onchange={() => onchange?.()}
                       class="w-full p-2 rounded-lg border"
                       style="border-color: {colors.primary}30; color: {colors.text}; background: {colors.primary}08;" />
              </div>
            </div>
            <p class="text-xs" style="color: {colors.muted}">
              These keep brand new accounts from using a trigger. Leave at 0 for no restriction.
            </p>

          {:else if section.key === "economy"}
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label for="cost-{trigger.id}" class="block text-sm mb-1" style="color: {colors.text}">
                  Costs the user
                </label>
                <input id="cost-{trigger.id}" type="number" min="0"
                       bind:value={trigger.currencyCost} onchange={() => onchange?.()}
                       class="w-full p-2 rounded-lg border"
                       style="border-color: {colors.primary}30; color: {colors.text}; background: {colors.primary}08;" />
              </div>
              <div>
                <label for="reward-{trigger.id}" class="block text-sm mb-1" style="color: {colors.text}">
                  Pays the user
                </label>
                <input id="reward-{trigger.id}" type="number" min="0"
                       bind:value={trigger.currencyReward} onchange={() => onchange?.()}
                       class="w-full p-2 rounded-lg border"
                       style="border-color: {colors.primary}30; color: {colors.text}; background: {colors.primary}08;" />
              </div>
              <div>
                <label for="xp-{trigger.id}" class="block text-sm mb-1" style="color: {colors.text}">
                  Grants XP
                </label>
                <input id="xp-{trigger.id}" type="number" min="0"
                       bind:value={trigger.xpReward} onchange={() => onchange?.()}
                       class="w-full p-2 rounded-lg border"
                       style="border-color: {colors.primary}30; color: {colors.text}; background: {colors.primary}08;" />
              </div>
              <div>
                <label for="req-lvl-{trigger.id}" class="block text-sm mb-1" style="color: {colors.text}">
                  Requires level
                </label>
                <input id="req-lvl-{trigger.id}" type="number" min="0"
                       bind:value={trigger.requiredXpLevel} onchange={() => onchange?.()}
                       class="w-full p-2 rounded-lg border"
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
                     class="w-full p-2 rounded-lg border"
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
                     class="w-full p-2 rounded-lg border"
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
                       class="w-full p-2 rounded-lg border"
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
                       class="w-full p-2 rounded-lg border"
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
                     class="w-full p-2 rounded-lg border"
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
                     class="w-full p-2 rounded-lg border"
                     style="border-color: {colors.primary}30; color: {colors.text}; background: {colors.primary}08;" />
              <p class="text-xs mt-1" style="color: {colors.muted}">
                Runs a second trigger by ID after this one. It still checks its own rules. 0 for none.
              </p>
            </div>

            <label class="flex items-start gap-3 cursor-pointer">
              <input type="checkbox" bind:checked={trigger.allowBots} onchange={() => onchange?.()}
                     class="mt-1" style="accent-color: {colors.primary};" />
              <span>
                <span class="block text-sm" style="color: {colors.text}">Respond to bots instead of people</span>
                <span class="block text-xs" style="color: {colors.muted}">
                  Only matches messages from other bots and webhooks. Never its own.
                </span>
              </span>
            </label>
          {/if}
        </div>
      {/if}
    </div>
  {/each}
</div>
