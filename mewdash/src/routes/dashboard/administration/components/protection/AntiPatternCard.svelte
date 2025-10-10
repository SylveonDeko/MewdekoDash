<script lang="ts">
  import { fly, slide } from "svelte/transition";
  import { colorStore } from "$lib/stores/colorStore";
  import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";

  let {
    protectionStatus,
    expandedProtectionCard = $bindable(),
    tempProtectionConfig = $bindable(),
    showPatternManagement = $bindable(),
    antiPatternPatterns,
    newPattern = $bindable(),
    actionOptions,
    saving,
    toggleProtection,
    toggleProtectionCard,
    cancelProtectionEdit,
    saveProtectionConfig,
    formatAction,
    addAntiPatternPattern,
    removeAntiPatternPattern
  } = $props();
</script>

<div class="backdrop-blur-xs rounded-2xl border p-6 shadow-2xl transition-all"
     in:fly={{ y: 20, duration: 300, delay: 500 }}
     style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15);
            border-color: {$colorStore.primary}30;">

  <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
    <div class="flex items-center gap-4">
      <div class="p-3 rounded-xl"
           style="background: linear-gradient(135deg, {$colorStore.primary}20, {$colorStore.secondary}20);">
        <i class="fa-utility-duo fa-regular fa-layer-group"
           style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary}; font-size: 24px;"></i>
      </div>
      <div>
        <h2 class="text-xl font-bold" style="color: {$colorStore.text}">Anti-Pattern Protection</h2>
        <p class="text-sm" style="color: {$colorStore.muted}">Advanced user behavior analysis</p>
      </div>
    </div>

    <div class="flex flex-wrap items-center gap-2">
      <button
        class="px-4 py-3 rounded-xl font-medium transition-all hover:scale-[1.02] flex items-center gap-2 min-h-[44px]"
        onclick={() => toggleProtection('antiPattern')}
        style="background: {protectionStatus.antiPattern.enabled ? $colorStore.accent + '20' : $colorStore.secondary + '20'};
               color: {protectionStatus.antiPattern.enabled ? $colorStore.accent : $colorStore.secondary};
               border: 1px solid {protectionStatus.antiPattern.enabled ? $colorStore.accent + '30' : $colorStore.secondary + '30'};"
      >
        {#if protectionStatus.antiPattern.enabled}
          <i class="fa-solid fa-toggle-on" style="font-size: 16px;"></i>
          Enabled
        {:else}
          <i class="fa-solid fa-toggle-off" style="font-size: 16px;"></i>
          Disabled
        {/if}
      </button>

      {#if protectionStatus.antiPattern.enabled}
        <button
          class="px-4 py-3 rounded-xl font-medium transition-all hover:scale-[1.02] flex items-center gap-2 min-h-[44px]"
          style="background: {$colorStore.secondary}20; color: {$colorStore.secondary}; border: 1px solid {$colorStore.secondary}30;"
          onclick={() => toggleProtectionCard('antiPattern')}
        >
          {#if expandedProtectionCard === 'antiPattern'}
            <i class="fa-solid fa-chevron-up" style="font-size: 16px;"></i>
          {:else}
            <i class="fa-solid fa-chevron-down" style="font-size: 16px;"></i>
          {/if}
          {expandedProtectionCard === 'antiPattern' ? 'Collapse' : 'Configure'}
        </button>
        <button
          class="px-4 py-3 rounded-xl font-medium transition-all hover:scale-[1.02] flex items-center gap-2 min-h-[44px]"
          style="background: {$colorStore.primary}20; color: {$colorStore.primary}; border: 1px solid {$colorStore.primary}30;"
          onclick={() => showPatternManagement = !showPatternManagement}
        >
          {#if showPatternManagement}
            <i class="fa-solid fa-chevron-up" style="font-size: 16px;"></i>
          {:else}
            <i class="fa-solid fa-chevron-right" style="font-size: 16px;"></i>
          {/if}
          Patterns
        </button>
      {/if}
    </div>
  </div>

  {#if protectionStatus.antiPattern.enabled}
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 rounded-xl"
         style="background: {$colorStore.primary}05;">
      <div class="text-center">
        <div class="text-2xl font-bold"
             style="color: {$colorStore.primary}">{protectionStatus.antiPattern.minimumScore}</div>
        <div class="text-sm" style="color: {$colorStore.muted}">Min Score</div>
      </div>
      <div class="text-center">
        <div class="text-lg font-semibold"
             style="color: {$colorStore.primary}">{formatAction(protectionStatus.antiPattern.action)}</div>
        <div class="text-sm" style="color: {$colorStore.muted}">Punishment</div>
      </div>
      <div class="text-center">
        <div class="text-2xl font-bold"
             style="color: {$colorStore.primary}">{protectionStatus.antiPattern.patternCount}</div>
        <div class="text-sm" style="color: {$colorStore.muted}">Patterns</div>
      </div>
      <div class="text-center">
        <div class="text-2xl font-bold"
             style="color: {$colorStore.primary}">{protectionStatus.antiPattern.counter}</div>
        <div class="text-sm" style="color: {$colorStore.muted}">Triggers</div>
      </div>
    </div>

    <!-- Expanded Configuration -->
    {#if expandedProtectionCard === 'antiPattern'}
      <div transition:slide={{ duration: 300 }} class="mt-6 pt-6 border-t space-y-6"
           style="border-color: {$colorStore.primary}20;">

        <!-- Basic Settings -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <span id="antipattern-action-label" class="block text-sm font-medium mb-2"
                  style="color: {$colorStore.text}">Action</span>
            <DiscordSelector
              type="custom"
              options={actionOptions}
              bind:selected={tempProtectionConfig.action}
              placeholder="Select action..."
              multiple={false}
            />
          </div>
          <div>
            <label for="antipattern-punish-duration" class="block text-sm font-medium mb-2"
                   style="color: {$colorStore.text}">Punishment
              Duration (minutes)</label>
            <input id="antipattern-punish-duration"
                   type="number"
                   bind:value={tempProtectionConfig.punishDuration}
                   class="w-full px-3 py-2 rounded-lg border transition-colors"
                   style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text}"
                   min="0"
                   max="10080"
            >
          </div>
          <div>
            <label for="antipattern-minimum-score" class="block text-sm font-medium mb-2"
                   style="color: {$colorStore.text}">Minimum
              Score</label>
            <input id="antipattern-minimum-score"
                   type="number"
                   bind:value={tempProtectionConfig.minimumScore}
                   class="w-full px-3 py-2 rounded-lg border transition-colors"
                   style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text}"
                   min="1"
                   max="100"
            >
          </div>
        </div>

        <!-- Behavior Analysis Toggles -->
        <div class="space-y-4">
          <h4 class="font-medium" style="color: {$colorStore.text}">Behavior Analysis</h4>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <label for="antipattern-check-account-age"
                   class="flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all hover:scale-[1.02]"
                   style="background: {$colorStore.primary}08;">
              <input id="antipattern-check-account-age" type="checkbox"
                     bind:checked={tempProtectionConfig.checkAccountAge}
                     class="sr-only peer" />
              <div class="w-5 h-5 rounded-sm border-2 transition-all duration-200 flex items-center justify-center"
                   style="border-color: {tempProtectionConfig.checkAccountAge ? $colorStore.primary : $colorStore.muted};
                          background: {tempProtectionConfig.checkAccountAge ? $colorStore.primary : 'transparent'};">
                {#if tempProtectionConfig.checkAccountAge}
                  <i class="fa-solid fa-check text-white" style="font-size: 12px;"></i>
                {/if}
              </div>
              <span style="color: {$colorStore.text}">Check Account Age</span>
            </label>

            <label for="antipattern-check-join-timing"
                   class="flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all hover:scale-[1.02]"
                   style="background: {$colorStore.primary}08;">
              <input id="antipattern-check-join-timing" type="checkbox"
                     bind:checked={tempProtectionConfig.checkJoinTiming}
                     class="sr-only peer" />
              <div class="w-5 h-5 rounded-sm border-2 transition-all duration-200 flex items-center justify-center"
                   style="border-color: {tempProtectionConfig.checkJoinTiming ? $colorStore.primary : $colorStore.muted};
                          background: {tempProtectionConfig.checkJoinTiming ? $colorStore.primary : 'transparent'};">
                {#if tempProtectionConfig.checkJoinTiming}
                  <i class="fa-solid fa-check text-white" style="font-size: 12px;"></i>
                {/if}
              </div>
              <span style="color: {$colorStore.text}">Check Join Timing</span>
            </label>

            <label for="antipattern-check-batch-creation"
                   class="flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all hover:scale-[1.02]"
                   style="background: {$colorStore.primary}08;">
              <input id="antipattern-check-batch-creation" type="checkbox"
                     bind:checked={tempProtectionConfig.checkBatchCreation}
                     class="sr-only peer" />
              <div class="w-5 h-5 rounded-sm border-2 transition-all duration-200 flex items-center justify-center"
                   style="border-color: {tempProtectionConfig.checkBatchCreation ? $colorStore.primary : $colorStore.muted};
                          background: {tempProtectionConfig.checkBatchCreation ? $colorStore.primary : 'transparent'};">
                {#if tempProtectionConfig.checkBatchCreation}
                  <i class="fa-solid fa-check text-white" style="font-size: 12px;"></i>
                {/if}
              </div>
              <span style="color: {$colorStore.text}">Check Batch Creation</span>
            </label>

            <label for="antipattern-check-offline-status"
                   class="flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all hover:scale-[1.02]"
                   style="background: {$colorStore.primary}08;">
              <input id="antipattern-check-offline-status" type="checkbox"
                     bind:checked={tempProtectionConfig.checkOfflineStatus}
                     class="sr-only peer" />
              <div class="w-5 h-5 rounded-sm border-2 transition-all duration-200 flex items-center justify-center"
                   style="border-color: {tempProtectionConfig.checkOfflineStatus ? $colorStore.primary : $colorStore.muted};
                          background: {tempProtectionConfig.checkOfflineStatus ? $colorStore.primary : 'transparent'};">
                {#if tempProtectionConfig.checkOfflineStatus}
                  <i class="fa-solid fa-check text-white" style="font-size: 12px;"></i>
                {/if}
              </div>
              <span style="color: {$colorStore.text}">Check Offline Status</span>
            </label>

            <label for="antipattern-check-new-accounts"
                   class="flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all hover:scale-[1.02]"
                   style="background: {$colorStore.primary}08;">
              <input id="antipattern-check-new-accounts" type="checkbox"
                     bind:checked={tempProtectionConfig.checkNewAccounts}
                     class="sr-only peer" />
              <div class="w-5 h-5 rounded-sm border-2 transition-all duration-200 flex items-center justify-center"
                   style="border-color: {tempProtectionConfig.checkNewAccounts ? $colorStore.primary : $colorStore.muted};
                          background: {tempProtectionConfig.checkNewAccounts ? $colorStore.primary : 'transparent'};">
                {#if tempProtectionConfig.checkNewAccounts}
                  <i class="fa-solid fa-check text-white" style="font-size: 12px;"></i>
                {/if}
              </div>
              <span style="color: {$colorStore.text}">Check New Accounts</span>
            </label>
          </div>

          <!-- Conditional Advanced Settings -->
          {#if tempProtectionConfig.checkAccountAge || tempProtectionConfig.checkJoinTiming || tempProtectionConfig.checkNewAccounts}
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4" transition:slide>
              {#if tempProtectionConfig.checkAccountAge}
                <div>
                  <label for="antipattern-max-account-age" class="block text-sm font-medium mb-2"
                         style="color: {$colorStore.text}">Max Account Age (months)</label>
                  <input id="antipattern-max-account-age"
                         type="number"
                         bind:value={tempProtectionConfig.maxAccountAgeMonths}
                         class="w-full px-3 py-2 rounded-lg border transition-colors"
                         style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text}"
                         min="1"
                         max="120"
                  >
                </div>
              {/if}

              {#if tempProtectionConfig.checkJoinTiming}
                <div>
                  <label for="antipattern-max-join-hours" class="block text-sm font-medium mb-2"
                         style="color: {$colorStore.text}">Max Join Hours</label>
                  <input id="antipattern-max-join-hours"
                         type="number"
                         bind:value={tempProtectionConfig.maxJoinHours}
                         class="w-full px-3 py-2 rounded-lg border transition-colors"
                         style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text}"
                         min="1"
                         max="168"
                         step="0.5"
                  >
                </div>
              {/if}

              {#if tempProtectionConfig.checkNewAccounts}
                <div>
                  <label for="antipattern-new-account-days" class="block text-sm font-medium mb-2"
                         style="color: {$colorStore.text}">New Account Days</label>
                  <input id="antipattern-new-account-days"
                         type="number"
                         bind:value={tempProtectionConfig.newAccountDays}
                         class="w-full px-3 py-2 rounded-lg border transition-colors"
                         style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text}"
                         min="1"
                         max="30"
                  >
                </div>
              {/if}
            </div>
          {/if}
        </div>

        <!-- Save/Cancel Buttons -->
        <div class="flex flex-col sm:flex-row gap-3 justify-end">
          <button
            class="px-4 py-2 rounded-lg font-medium transition-all hover:scale-[1.02]"
            style="background: {$colorStore.muted}20; color: {$colorStore.muted};"
            onclick={cancelProtectionEdit}
          >
            Cancel
          </button>
          <button
            class="px-4 py-2 rounded-lg font-medium transition-all hover:scale-[1.02] flex items-center gap-2"
            style="background: {$colorStore.secondary}20; color: {$colorStore.secondary}; border: 1px solid {$colorStore.secondary}30;"
            onclick={saveProtectionConfig}
            disabled={saving}
          >
            <div class="flex items-center justify-center gap-2">
              {#if saving}
                <i class="fa-solid fa-rotate-right animate-spin" style="font-size: 16px;"></i>
              {:else}
                <i class="fa-solid fa-floppy-disk" style="font-size: 16px;"></i>
              {/if}
              <span>Save Configuration</span>
            </div>
          </button>
        </div>
      </div>
    {/if}

    <!-- Pattern Management Section -->
    {#if showPatternManagement}
      <div transition:slide={{ duration: 300 }} class="mt-6 pt-6 border-t space-y-4"
           style="border-color: {$colorStore.primary}20;">
        <div class="flex items-center justify-between">
          <h4 class="font-semibold" style="color: {$colorStore.text}">Pattern Management</h4>
          <span class="text-sm px-3 py-1 rounded-full"
                style="background: {$colorStore.primary}20; color: {$colorStore.primary};">
            {protectionStatus.antiPattern.patternCount} patterns
          </span>
        </div>

        <!-- Add New Pattern Form -->
        <div class="p-4 rounded-xl border-2 border-dashed transition-all"
             style="border-color: {$colorStore.primary}30; background: {$colorStore.primary}05;">
          <h5 class="font-medium mb-3" style="color: {$colorStore.text}">Add New Pattern</h5>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label for="new-pattern-name" class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">Pattern
                Name</label>
              <input id="new-pattern-name"
                     type="text"
                     bind:value={newPattern.name}
                     class="w-full px-3 py-2 rounded-lg border transition-colors"
                     style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text}"
                     placeholder="e.g., Suspicious Username Pattern"
              >
            </div>

            <div>
              <label for="new-pattern-regex" class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">Regex
                Pattern</label>
              <input id="new-pattern-regex"
                     type="text"
                     bind:value={newPattern.pattern}
                     class="w-full px-3 py-2 rounded-lg border transition-colors"
                     style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text}"
                     placeholder="^[a-z]+[0-9]&#123;4,&#125;$"
              >
            </div>
          </div>

          <div class="mt-4">
            <h6 class="text-sm font-medium mb-2" style="color: {$colorStore.text}">Check Against:</h6>
            <div class="flex flex-wrap gap-3">
              <label for="new-pattern-check-username" class="flex items-center gap-2 cursor-pointer">
                <input id="new-pattern-check-username" type="checkbox" bind:checked={newPattern.checkUsername}
                       class="sr-only peer">
                <div class="w-4 h-4 rounded-sm border transition-all peer-checked:bg-current"
                     style="border-color: {$colorStore.primary}; color: {$colorStore.primary};">
                  {#if newPattern.checkUsername}<i class="fa-solid fa-check text-white"
                                                   style="font-size: 12px;"></i>{/if}
                </div>
                <span class="text-sm" style="color: {$colorStore.text}">Username</span>
              </label>

              <label for="new-pattern-check-display-name" class="flex items-center gap-2 cursor-pointer">
                <input id="new-pattern-check-display-name" type="checkbox" bind:checked={newPattern.checkDisplayName}
                       class="sr-only peer">
                <div class="w-4 h-4 rounded-sm border transition-all peer-checked:bg-current"
                     style="border-color: {$colorStore.primary}; color: {$colorStore.primary};">
                  {#if newPattern.checkDisplayName}<i class="fa-solid fa-check text-white"
                                                      style="font-size: 12px;"></i>{/if}
                </div>
                <span class="text-sm" style="color: {$colorStore.text}">Display Name</span>
              </label>
            </div>
          </div>

          <div class="flex justify-end mt-4">
            <button
              class="px-4 py-2 rounded-lg font-medium transition-all hover:scale-[1.02] flex items-center gap-2"
              style="background: {$colorStore.primary}20; color: {$colorStore.primary}; border: 1px solid {$colorStore.primary}30;"
              onclick={addAntiPatternPattern}
              disabled={!newPattern.name.trim() || !newPattern.pattern.trim() || saving}
            >
              <i class="fa-solid fa-plus" style="font-size: 16px;"></i>
              Add Pattern
            </button>
          </div>
        </div>

        <!-- Existing Patterns List -->
        {#if antiPatternPatterns.length > 0}
          <div class="space-y-3">
            <h5 class="font-medium" style="color: {$colorStore.text}">Current Patterns</h5>
            {#each antiPatternPatterns as pattern (pattern.name)}
              <div class="flex items-center justify-between p-3 rounded-lg border"
                   style="background: {$colorStore.primary}05; border-color: {$colorStore.primary}20;">
                <div>
                  <p class="font-medium" style="color: {$colorStore.text}">{pattern.name}</p>
                  <p class="text-sm font-mono" style="color: {$colorStore.muted}">{pattern.pattern}</p>
                  <div class="flex gap-2 mt-1">
                    {#if pattern.checkUsername}
                      <span class="text-xs px-2 py-1 rounded-sm"
                            style="background: {$colorStore.secondary}20; color: {$colorStore.secondary}">Username</span>
                    {/if}
                    {#if pattern.checkDisplayName}
                      <span class="text-xs px-2 py-1 rounded-sm"
                            style="background: {$colorStore.accent}20; color: {$colorStore.accent}">Display Name</span>
                    {/if}
                  </div>
                </div>
                <button
                  class="px-3 py-2 rounded-lg text-sm font-medium transition-all hover:scale-[1.02]"
                  style="background: {$colorStore.accent}20; color: {$colorStore.accent}; border: 1px solid {$colorStore.accent}30;"
                  onclick={() => removeAntiPatternPattern(pattern.id)}
                >
                  Remove
                </button>
              </div>
            {/each}
          </div>
        {/if}
      </div>
    {/if}
  {:else}
    <div class="text-center py-8">
      <i class="fa-utility-duo fa-regular fa-layer-group"
         style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary}; font-size: 48px; opacity: 0.5;"></i>
      <p class="text-lg font-medium" style="color: {$colorStore.text}">Anti-Pattern Protection Disabled</p>
      <p class="text-sm" style="color: {$colorStore.muted}">Enable to analyze user behavior patterns</p>
    </div>
  {/if}
</div>
