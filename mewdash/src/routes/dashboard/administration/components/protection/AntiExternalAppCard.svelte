<script lang="ts">
  import { m } from "$lib/i18n";
  import { fly, slide } from "svelte/transition";
  import { colorStore } from "$lib/stores/colorStore";
  import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";

  /**
   * Anti-External App protection: watches messages members send through apps they added to their own account, which
   * post as the app and get past every check that looks at who sent a message.
   */
  let {
    protectionStatus,
    expandedProtectionCard = $bindable(),
    tempProtectionConfig = $bindable(),
    saving,
    toggleProtection,
    toggleProtectionCard,
    cancelProtectionEdit,
    saveProtectionConfig,
    formatAction
  } = $props();

  /** Punishments that make sense for app abuse, Delete meaning the message is removed and nothing else. */
  const actionOptions = $derived([
    { id: "8", name: m.administration.protectionActionDeleteOnly(), label: m.administration.protectionActionDeleteOnly() },
    { id: "9", name: m.common.warn(), label: m.common.warn() },
    { id: "10", name: m.common.timeout(), label: m.common.timeout() },
    { id: "0", name: m.common.actionMute(), label: m.common.actionMute() },
    { id: "1", name: m.common.actionKick(), label: m.common.actionKick() },
    { id: "2", name: m.common.actionBan(), label: m.common.actionBan() }
  ]);

  /** Actions that last for a set time, so the duration field only shows for them. */
  const TIMED_ACTIONS = ["0", "10"];

  /** Bot instances older than this protection leave it out of the status, which then reads as off. */
  let status = $derived(protectionStatus.antiExternalApp ?? { enabled: false });
  let showsDuration = $derived(TIMED_ACTIONS.includes(String(tempProtectionConfig.action)));

  /**
   * A limit for display, where 0 means the check is off.
   * @param value The stored limit
   */
  function limit(value: number) {
    return value > 0 ? String(value) : m.common.off();
  }

  /** The three yes/no settings, drawn as the same checkbox rows. */
  const toggles = $derived([
    { key: "blockInvites", label: m.administration.protectionExternalappRemoveInviteLinks() },
    { key: "deleteMessages", label: m.administration.protectionExternalappDeleteAppMessage() },
    { key: "notifyUser", label: m.administration.protectionExternalappNotifyMember() }
  ]);
</script>

<div class=" rounded-2xl border p-6 shadow-2xl transition-all"
     in:fly={{ y: 20, duration: 300, delay: 400 }}
     style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15);
            border-color: {$colorStore.primary}30;">

  <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
    <div class="flex items-center gap-4">
      <div class="p-3 rounded-xl"
           style="background: linear-gradient(135deg, {$colorStore.primary}20, {$colorStore.secondary}20);">
        <i class="fa-utility-duo fa-regular fa-grid-2"
           style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary}; font-size: 24px;"></i>
      </div>
      <div>
        <h2 class="text-xl font-bold" style="color: {$colorStore.text}">{m.administration.overviewAntiExternalApp()}</h2>
        <p class="text-sm" style="color: {$colorStore.muted}">{m.administration.protectionExternalappSubtitle()}</p>
      </div>
    </div>

    <div class="flex flex-wrap items-center gap-2">
      <button
        class="px-4 py-3 rounded-xl font-medium transition-all hover:scale-[1.02] flex items-center gap-2 min-h-[44px]"
        onclick={() => toggleProtection('antiExternalApp')}
        style="background: {status.enabled ? $colorStore.accent + '20' : $colorStore.secondary + '20'};
               color: {status.enabled ? $colorStore.accent : $colorStore.secondary};
               border: 1px solid {status.enabled ? $colorStore.accent + '30' : $colorStore.secondary + '30'};"
      >
        {#if status.enabled}
          <i class="fa-solid fa-toggle-on" style="font-size: 16px;"></i>
          {m.common.enabled()}
        {:else}
          <i class="fa-solid fa-toggle-off" style="font-size: 16px;"></i>
          {m.common.disabled()}
        {/if}
      </button>

      {#if status.enabled}
        <button
          class="px-4 py-3 rounded-xl font-medium transition-all hover:scale-[1.02] flex items-center gap-2 min-h-[44px]"
          style="background: {$colorStore.secondary}20; color: {$colorStore.secondary}; border: 1px solid {$colorStore.secondary}30;"
          onclick={() => toggleProtectionCard('antiExternalApp')}
        >
          {#if expandedProtectionCard === 'antiExternalApp'}
            <i class="fa-solid fa-chevron-up" style="font-size: 16px;"></i>
          {:else}
            <i class="fa-solid fa-chevron-down" style="font-size: 16px;"></i>
          {/if}
          {expandedProtectionCard === 'antiExternalApp' ? m.common.collapse() : m.common.configure()}
        </button>
      {/if}
    </div>
  </div>

  {#if status.enabled}
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-xl" style="background: {$colorStore.primary}05;">
      <div class="text-center">
        <div class="text-2xl font-bold" style="color: {$colorStore.primary}">{limit(status.mentionThreshold)}</div>
        <div class="text-sm" style="color: {$colorStore.muted}">{m.administration.protectionExternalappMentionLimit()}</div>
      </div>
      <div class="text-center">
        <div class="text-2xl font-bold" style="color: {$colorStore.primary}">
          {status.maxMessages > 0 ? `${status.maxMessages} / ${status.timeWindowSeconds}s` : m.common.off()}
        </div>
        <div class="text-sm" style="color: {$colorStore.muted}">{m.administration.protectionExternalappAppMessages()}</div>
      </div>
      <div class="text-center">
        <div class="text-lg font-semibold" style="color: {$colorStore.primary}">
          {formatAction(status.action)}{status.punishDuration > 0 ? ` (${status.punishDuration}m)` : ""}
        </div>
        <div class="text-sm" style="color: {$colorStore.muted}">{m.common.punishment()}</div>
      </div>
      <div class="text-center">
        <div class="text-2xl font-bold" style="color: {$colorStore.primary}">{status.counter ?? 0}</div>
        <div class="text-sm" style="color: {$colorStore.muted}">{m.administration.protectionExternalappTimesTriggered()}</div>
      </div>
    </div>

    {#if expandedProtectionCard === 'antiExternalApp'}
      <div transition:slide={{ duration: 300 }} class="mt-6 pt-6 border-t space-y-6"
           style="border-color: {$colorStore.primary}20;">
        <p class="text-sm" style="color: {$colorStore.muted}">
          {m.administration.protectionExternalappIntro()}
        </p>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label for="antiea-mention-threshold" class="block text-sm font-medium mb-2"
                   style="color: {$colorStore.text}">{m.administration.protectionExternalappMentionLimit()}</label>
            <input id="antiea-mention-threshold"
                   type="number"
                   bind:value={tempProtectionConfig.mentionThreshold}
                   class="w-full px-3 rounded-lg border transition-colors min-h-[44px]"
                   style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text}"
                   min="0"
                   max="100"
            >
          </div>
          <div>
            <label for="antiea-max-messages" class="block text-sm font-medium mb-2"
                   style="color: {$colorStore.text}">{m.administration.protectionExternalappAppMessagesAllowed()}</label>
            <input id="antiea-max-messages"
                   type="number"
                   bind:value={tempProtectionConfig.maxMessages}
                   class="w-full px-3 rounded-lg border transition-colors min-h-[44px]"
                   style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text}"
                   min="0"
                   max="100"
            >
          </div>
          <div>
            <label for="antiea-window" class="block text-sm font-medium mb-2"
                   style="color: {$colorStore.text}">{m.common.withinSeconds()}</label>
            <input id="antiea-window"
                   type="number"
                   bind:value={tempProtectionConfig.timeWindowSeconds}
                   class="w-full px-3 rounded-lg border transition-colors min-h-[44px]"
                   style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text}"
                   min="1"
                   max="300"
            >
          </div>
          <div>
            <span class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">{m.common.action()}</span>
            <DiscordSelector
              type="custom"
              options={actionOptions}
              bind:selected={tempProtectionConfig.action}
              placeholder={m.administration.protectionCommonSelectAction()}
              multiple={false}
            />
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {#if showsDuration}
            <div>
              <label for="antiea-duration" class="block text-sm font-medium mb-2"
                     style="color: {$colorStore.text}">{m.common.durationMinutes()}</label>
              <input id="antiea-duration"
                     type="number"
                     bind:value={tempProtectionConfig.punishDuration}
                     class="w-full px-3 rounded-lg border transition-colors min-h-[44px]"
                     style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text}"
                     min="1"
                     max="40320"
              >
            </div>
          {/if}

          {#each toggles as toggle (toggle.key)}
            <div class="flex items-end">
              <label for="antiea-{toggle.key}"
                     class="flex w-full items-center gap-3 px-3 rounded-lg cursor-pointer transition-all hover:scale-[1.02] min-h-[44px]"
                     style="background: {$colorStore.primary}08;">
                <input id="antiea-{toggle.key}" type="checkbox"
                       bind:checked={tempProtectionConfig[toggle.key]}
                       class="sr-only peer" />
                <div class="w-5 h-5 rounded-sm border-2 transition-all duration-200 flex items-center justify-center"
                     style="border-color: {tempProtectionConfig[toggle.key] ? $colorStore.primary : $colorStore.muted};
                            background: {tempProtectionConfig[toggle.key] ? $colorStore.primary : 'transparent'};">
                  {#if tempProtectionConfig[toggle.key]}
                    <i class="fa-solid fa-check text-white" style="font-size: 12px;"></i>
                  {/if}
                </div>
                <span style="color: {$colorStore.text}">{toggle.label}</span>
              </label>
            </div>
          {/each}
        </div>

        <div class="flex flex-col sm:flex-row gap-3 justify-end">
          <button
            class="px-4 rounded-lg font-medium transition-all hover:scale-[1.02] min-h-[44px]"
            style="background: {$colorStore.muted}20; color: {$colorStore.muted};"
            onclick={cancelProtectionEdit}
          >
            {m.common.cancel()}
          </button>
          <button
            class="px-4 rounded-lg font-medium transition-all hover:scale-[1.02] flex items-center justify-center gap-2 min-h-[44px]"
            style="background: {$colorStore.secondary}20; color: {$colorStore.secondary}; border: 1px solid {$colorStore.secondary}30;"
            onclick={saveProtectionConfig}
            disabled={saving}
          >
            {#if saving}
              <i class="fa-solid fa-rotate-right animate-spin" style="font-size: 16px;"></i>
            {:else}
              <i class="fa-solid fa-floppy-disk" style="font-size: 16px;"></i>
            {/if}
            <span>{m.common.saveConfiguration()}</span>
          </button>
        </div>
      </div>
    {/if}
  {:else}
    <div class="text-center py-8">
      <i class="fa-utility-duo fa-regular fa-grid-2"
         style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary}; font-size: 48px; opacity: 0.5;"></i>
      <p class="text-lg font-medium" style="color: {$colorStore.text}">{m.administration.protectionExternalappDisabledTitle()}</p>
      <p class="text-sm" style="color: {$colorStore.muted}">
        {m.administration.protectionExternalappDisabledHint()}
      </p>
    </div>
  {/if}
</div>
