<script lang="ts">
  import { m } from "$lib/i18n";
  import { fly, slide } from "svelte/transition";
  import { colorStore } from "$lib/stores/colorStore";
  import { administrationApi, type ServerRecoveryStatus } from "$lib/api/index.ts";
  import { currentGuild } from "$lib/stores/currentGuild";
  import { logger } from "$lib/logger";

  let { showConfirm } = $props();

  let status = $state<ServerRecoveryStatus | null>(null);
  let loading = $state(false);
  let saving = $state(false);
  let showSetup = $state(false);
  let showKey = $state(false);
  let recoveryKey = $state("");
  let twoFactorKey = $state("");
  let formError = $state("");
  let copied = $state(false);

  /** Loads the current recovery status for the selected guild */
  async function loadStatus() {
    if (!$currentGuild?.id) return;
    loading = true;
    try {
      status = await administrationApi.getServerRecoveryStatus($currentGuild.id);
    } catch (err) {
      logger.error("Failed to load server recovery status:", err);
    } finally {
      loading = false;
    }
  }

  /** Generates a random recovery key so users do not have to invent one */
  function generateKey() {
    const bytes = new Uint8Array(24);
    crypto.getRandomValues(bytes);
    recoveryKey = Array.from(bytes, b => b.toString(16).padStart(2, "0")).join("");
  }

  async function setupRecovery() {
    if (!$currentGuild?.id) return;
    formError = "";
    if (recoveryKey.trim().length < 16) {
      formError = m.administration.advancedRecoveryErrorKeyShort();
      return;
    }
    if (twoFactorKey.trim().length < 6) {
      formError = m.administration.advancedRecoveryErrorTwoFactorShort();
      return;
    }
    saving = true;
    try {
      await administrationApi.setupServerRecovery($currentGuild.id, {
        recoveryKey: recoveryKey.trim(),
        twoFactorKey: twoFactorKey.trim()
      });
      showSetup = false;
      recoveryKey = "";
      twoFactorKey = "";
      await loadStatus();
    } catch (err) {
      logger.error("Failed to set up server recovery:", err);
      formError = m.administration.advancedRecoveryErrorSetup();
    } finally {
      saving = false;
    }
  }

  async function clearRecovery() {
    if (!$currentGuild?.id) return;
    saving = true;
    try {
      await administrationApi.clearServerRecovery($currentGuild.id);
      await loadStatus();
    } catch (err) {
      logger.error("Failed to clear server recovery:", err);
    } finally {
      saving = false;
    }
  }

  async function copyKey() {
    if (!status?.recoveryKey) return;
    try {
      await navigator.clipboard.writeText(status.recoveryKey);
      copied = true;
      setTimeout(() => copied = false, 2000);
    } catch (err) {
      logger.error("Failed to copy recovery key:", err);
    }
  }

  $effect(() => {
    if ($currentGuild?.id) loadStatus();
  });
</script>

<div class=" rounded-2xl border p-6 shadow-2xl transition-all"
     in:fly={{ y: 20, duration: 300, delay: 300 }}
     style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15);
            border-color: {$colorStore.primary}30;">

  <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
    <div class="flex items-center gap-4">
      <div class="p-3 rounded-xl"
           style="background: linear-gradient(135deg, {$colorStore.primary}20, {$colorStore.secondary}20);">
        <i class="fa-utility-duo fa-regular fa-life-ring"
           style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary}; font-size: 24px;"></i>
      </div>
      <div>
        <h2 class="text-xl font-bold" style="color: {$colorStore.text}">{m.administration.advancedRecoveryTitle()}</h2>
        <p class="text-sm" style="color: {$colorStore.muted}">{m.administration.advancedRecoverySubtitle()}</p>
      </div>
    </div>

    {#if status}
      <span class="px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap"
            style="background: {status.isSetup ? '#10b98120' : $colorStore.muted + '20'}; color: {status.isSetup ? '#10b981' : $colorStore.muted};">
        <i class="fa-solid {status.isSetup ? 'fa-circle-check' : 'fa-circle-minus'} mr-1"></i>
        {status.isSetup ? m.common.configured() : m.common.notConfigured()}
      </span>
    {/if}
  </div>

  {#if loading && !status}
    <div class="text-center py-8">
      <i class="fa-solid fa-spinner fa-spin" style="color: {$colorStore.primary}; font-size: 32px;"></i>
    </div>
  {:else if status?.isSetup}
    <div class="space-y-4">
      <div class="p-4 rounded-xl border" style="background: {$colorStore.primary}05; border-color: {$colorStore.primary}20;">
        <div class="text-sm font-medium mb-2" style="color: {$colorStore.text}">{m.administration.advancedRecoveryKey()}</div>
        <div class="flex flex-col sm:flex-row gap-2">
          <code class="flex-1 px-3 py-2 rounded-lg text-sm font-mono break-all min-h-[44px] flex items-center"
                style="background: {$colorStore.primary}10; color: {$colorStore.text};">
            {showKey ? status.recoveryKey : "•".repeat(Math.min(status.recoveryKey?.length ?? 24, 32))}
          </code>
          <div class="flex gap-2">
            <button class="px-3 py-2 rounded-lg text-sm transition-all hover:scale-[1.02] min-h-[44px]"
                    style="background: {$colorStore.secondary}20; color: {$colorStore.secondary};"
                    onclick={() => showKey = !showKey}
                    aria-label={showKey ? m.administration.advancedRecoveryHideKey() : m.administration.advancedRecoveryShowKey()}>
              <i class="fa-solid {showKey ? 'fa-eye-slash' : 'fa-eye'}"></i>
            </button>
            <button class="px-3 py-2 rounded-lg text-sm transition-all hover:scale-[1.02] min-h-[44px]"
                    style="background: {$colorStore.primary}20; color: {$colorStore.primary};"
                    onclick={copyKey}
                    aria-label={m.administration.advancedRecoveryCopyKey()}>
              <i class="fa-solid {copied ? 'fa-check' : 'fa-copy'}"></i>
            </button>
          </div>
        </div>
        <p class="text-xs mt-2" style="color: {$colorStore.muted}">
          {m.administration.advancedRecoveryKeyHint()}
        </p>
      </div>

      <button class="px-4 py-3 rounded-xl font-medium transition-all hover:scale-[1.02] flex items-center gap-2 min-h-[44px]"
              style="background: {$colorStore.accent}20; color: {$colorStore.accent}; border: 1px solid {$colorStore.accent}30;"
              disabled={saving}
              onclick={() => showConfirm(m.administration.advancedRecoveryRemoveTitle(), m.administration.advancedRecoveryRemoveMessage(), clearRecovery, "danger")}>
        <i class="fa-solid fa-trash"></i>
        {m.administration.advancedRecoveryRemove()}
      </button>
    </div>
  {:else}
    <div class="space-y-4">
      {#if !showSetup}
        <div class="text-center py-6 rounded-xl" style="background: {$colorStore.primary}05;">
          <i class="fa-utility-duo fa-regular fa-life-ring"
             style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary}; font-size: 32px; opacity: 0.6;"></i>
          <p class="text-sm mt-3 mb-4" style="color: {$colorStore.muted}">
            {m.administration.advancedRecoveryEmpty()}
          </p>
          <button class="px-4 py-3 rounded-xl font-medium transition-all hover:scale-[1.02] inline-flex items-center gap-2 min-h-[44px]"
                  style="background: {$colorStore.primary}20; color: {$colorStore.primary}; border: 1px solid {$colorStore.primary}30;"
                  onclick={() => { showSetup = true; if (!recoveryKey) generateKey(); }}>
            <i class="fa-solid fa-key"></i>
            {m.administration.advancedRecoverySetup()}
          </button>
        </div>
      {:else}
        <form class="space-y-4" transition:slide onsubmit={(e) => { e.preventDefault(); setupRecovery(); }}>
          <div>
            <label for="recovery-key" class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">{m.administration.advancedRecoveryKey()}</label>
            <div class="flex flex-col sm:flex-row gap-2">
              <input id="recovery-key" type="text" bind:value={recoveryKey} autocomplete="off" spellcheck="false"
                     class="flex-1 px-4 py-3 rounded-lg border font-mono text-sm min-h-[44px]"
                     style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};">
              <button type="button" class="px-4 py-3 rounded-lg text-sm transition-all hover:scale-[1.02] min-h-[44px]"
                      style="background: {$colorStore.secondary}20; color: {$colorStore.secondary};"
                      onclick={generateKey}>
                <i class="fa-solid fa-dice mr-1"></i>{m.administration.advancedRecoveryGenerate()}
              </button>
            </div>
          </div>
          <div>
            <label for="two-factor-key" class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">{m.administration.advancedRecoveryTwoFactorKey()}</label>
            <input id="two-factor-key" type="password" bind:value={twoFactorKey} autocomplete="new-password"
                   placeholder={m.administration.advancedRecoveryTwoFactorPlaceholder()}
                   class="w-full px-4 py-3 rounded-lg border min-h-[44px]"
                   style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};">
          </div>

          {#if formError}
            <div class="p-3 rounded-lg flex items-center gap-2 text-sm" role="alert"
                 style="background: #ef444420; border: 1px solid #ef444430; color: #ef4444;">
              <i class="fa-solid fa-circle-exclamation"></i>
              <span>{formError}</span>
            </div>
          {/if}

          <div class="flex flex-col sm:flex-row gap-3">
            <button type="button" class="flex-1 px-4 py-3 rounded-lg font-medium transition-all hover:scale-[1.02] min-h-[44px]"
                    style="background: {$colorStore.muted}20; color: {$colorStore.muted};"
                    onclick={() => { showSetup = false; formError = ""; }}>
              {m.common.cancel()}
            </button>
            <button type="submit" disabled={saving}
                    class="flex-1 px-4 py-3 rounded-lg font-medium transition-all hover:scale-[1.02] min-h-[44px] disabled:opacity-50"
                    style="background: {$colorStore.primary}20; color: {$colorStore.primary}; border: 1px solid {$colorStore.primary}30;">
              {#if saving}<i class="fa-solid fa-spinner fa-spin mr-2"></i>{/if}
              {m.administration.advancedRecoverySave()}
            </button>
          </div>
        </form>
      {/if}
    </div>
  {/if}
</div>
