<script lang="ts">
  import { m } from "$lib/i18n";
  import { fly, slide } from "svelte/transition";
  import { colorStore } from "$lib/stores/colorStore";
  import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";

  let {
    commandCooldowns,
    expandedRoleCard = $bindable(),
    newCommandCooldown = $bindable(),
    availableCommands,
    saving,
    removeCommandCooldown,
    addCommandCooldown
  } = $props();
</script>

<div class=" rounded-2xl border p-6 shadow-2xl transition-all"
     in:fly={{ y: 20, duration: 300, delay: 300 }}
     style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15);
            border-color: {$colorStore.primary}30;">

  <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
    <div class="flex items-center gap-4">
      <div class="p-3 rounded-xl"
           style="background: linear-gradient(135deg, {$colorStore.primary}20, {$colorStore.secondary}20);">
        <i class="fa-utility-duo fa-regular fa-clock"
           style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary}; font-size: 24px;"></i>
      </div>
      <h2 class="text-xl font-bold" style="color: {$colorStore.text}">{m.administration.automationCommandCooldownsTitle()}</h2>
    </div>

    <div class="flex flex-wrap items-center gap-2">
      <button
        class="px-4 py-3 rounded-xl font-medium transition-all hover:scale-[1.02] flex items-center gap-2 min-h-[44px]"
        onclick={() => expandedRoleCard = expandedRoleCard === 'commandCooldown' ? null : 'commandCooldown'}
        style="background: {$colorStore.secondary}20; color: {$colorStore.secondary}; border: 1px solid {$colorStore.secondary}30;"
      >
        {#if expandedRoleCard === 'commandCooldown'}
          <i class="fa-solid fa-chevron-up" style="font-size: 16px;"></i>
        {:else}
          <i class="fa-solid fa-plus" style="font-size: 16px;"></i>
        {/if}
        {expandedRoleCard === 'commandCooldown' ? m.common.collapse() : m.administration.automationCommandCooldownsAdd()}
      </button>
    </div>
  </div>

  {#if commandCooldowns.length === 0}
    <div class="text-center py-8">
      <i class="fa-utility-duo fa-regular fa-clock"
         style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary}; font-size: 48px; opacity: 0.5;"></i>
      <p class="text-lg font-medium" style="color: {$colorStore.text}">{m.administration.automationCommandCooldownsEmptyTitle()}</p>
      <p class="text-sm" style="color: {$colorStore.muted}">{m.administration.automationCommandCooldownsEmptyHint()}</p>
    </div>
  {:else}
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {#each commandCooldowns as cooldown (cooldown.commandName || cooldown.command)}
        <div
          class="group relative p-4 rounded-lg transition-all duration-200 hover:shadow-lg  border"
          style="background: {$colorStore.primary}05; border-color: {$colorStore.primary}20;">

          <div class="pr-16">
            <p class="font-medium text-lg" style="color: {$colorStore.text}">
              {cooldown.commandName || cooldown.command}
            </p>
            <p class="text-sm" style="color: {$colorStore.muted}">
              {m.administration.automationCommandCooldownsSeconds({ seconds: cooldown.seconds || cooldown.cooldown })}
            </p>
          </div>

          <button
            class="absolute top-3 right-3 px-3 py-2 rounded-xl text-sm font-medium transition-all hover:scale-[1.02] opacity-60 group-hover:opacity-100 min-h-[36px] min-w-[80px]"
            style="background: {$colorStore.accent}20; color: {$colorStore.accent}; border: 1px solid {$colorStore.accent}30;"
            onclick={() => removeCommandCooldown(cooldown.commandName || cooldown.command)}
            aria-label={m.administration.automationCommandCooldownsRemoveAria({ command: cooldown.commandName || cooldown.command })}
          >
            {m.common.remove()}
          </button>
        </div>
      {/each}
    </div>
  {/if}

  <!-- Inline Add Command Cooldown Form -->
  {#if expandedRoleCard === 'commandCooldown'}
    <div transition:slide={{ duration: 300 }} class="mt-4 pt-4 border-t" style="border-color: {$colorStore.primary}20;">
      <div class="p-4 rounded-xl border-2 border-dashed"
           style="border-color: {$colorStore.secondary}30; background: {$colorStore.secondary}05;">
        <h5 class="font-medium mb-3" style="color: {$colorStore.text}">{m.administration.automationCommandCooldownsFormTitle()}</h5>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <span id="command-label" class="block text-sm font-medium mb-2"
                  style="color: {$colorStore.text}">{m.common.command()}</span>
            <DiscordSelector
              type="custom"
              options={availableCommands}
              bind:selected={newCommandCooldown.command}
              placeholder={m.administration.automationCommandCooldownsCommandPlaceholder()}
              multiple={false}
            />
          </div>

          <div>
            <label for="cooldown-seconds" class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">{m.common.cooldownSeconds()}</label>
            <input id="cooldown-seconds"
                   type="number"
                   min="1"
                   max="90000"
                   bind:value={newCommandCooldown.seconds}
                   class="w-full px-3 py-2 rounded-lg border transition-colors"
                   style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text}"
                   placeholder={m.administration.automationCommandCooldownsSecondsPlaceholder()}
            >
            <p class="text-xs mt-1" style="color: {$colorStore.muted}">
              {m.administration.automationCommandCooldownsSecondsHint()}
            </p>
          </div>
        </div>

        <div class="flex flex-col sm:flex-row gap-3 mt-4">
          <button
            class="px-4 py-2 rounded-lg font-medium transition-all hover:scale-[1.02]"
            style="background: {$colorStore.muted}20; color: {$colorStore.muted};"
            onclick={() => { expandedRoleCard = null; newCommandCooldown = { command: "", seconds: 5 }; }}
          >
            {m.common.cancel()}
          </button>
          <button
            class="px-4 py-2 rounded-lg font-medium transition-all hover:scale-[1.02] flex items-center gap-2"
            style="background: {$colorStore.secondary}20; color: {$colorStore.secondary}; border: 1px solid {$colorStore.secondary}30;"
            onclick={addCommandCooldown}
            disabled={!newCommandCooldown.command || newCommandCooldown.seconds <= 0 || saving}
          >
            {#if saving}
              <i class="fa-solid fa-rotate-right fa-spin" style="font-size: 16px;"></i>
            {:else}
              <i class="fa-solid fa-plus" style="font-size: 16px;"></i>
            {/if}
            {m.administration.automationCommandCooldownsAdd()}
          </button>
        </div>
      </div>
    </div>
  {/if}
</div>
