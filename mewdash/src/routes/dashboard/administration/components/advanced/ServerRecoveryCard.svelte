<script lang="ts">
  import { m } from "$lib/i18n";
  import { administrationApi, type ServerRecoveryStatus } from "$lib/api/index.ts";
  import { colorStore } from "$lib/stores/colorStore";
  import { logger } from "$lib/logger";
  import { requestConfirmation } from "$lib/stores/confirmationStore";
  import SettingField from "$lib/components/forms/SettingField.svelte";
  import PluginCard from "$lib/components/plugin/PluginCard.svelte";
  import Sheet from "$lib/components/ui/Sheet.svelte";
  import { errorText, type TabProps } from "../toolsModel";

  type Props = Pick<TabProps, "guildId" | "notify">;

  let { guildId, notify }: Props = $props();

  let status = $state<ServerRecoveryStatus | null>(null);
  let loading = $state(true);
  let busy = $state(false);
  let showKey = $state(false);
  let copied = $state(false);
  let draft = $state<{ recoveryKey: string; twoFactorKey: string } | null>(null);
  let formError = $state("");

  const buttonStyle = $derived(`background: ${$colorStore.primary}; color: ${$colorStore.onPrimary};`);
  const quietStyle = $derived(
    `background: ${$colorStore.primary}20; color: ${$colorStore.text}; border: 1px solid ${$colorStore.primary}30;`
  );
  const inputStyle = $derived(`background: ${$colorStore.primary}10; border-color: ${$colorStore.primary}30; color: ${$colorStore.text};`);

  function generateKey(): string {
    const bytes = new Uint8Array(24);
    crypto.getRandomValues(bytes);
    return Array.from(bytes, b => b.toString(16).padStart(2, "0")).join("");
  }

  async function load() {
    try {
      status = await administrationApi.getServerRecoveryStatus(guildId);
    } catch (err) {
      logger.error("Failed to load server recovery status:", err);
      notify(errorText(err, m.administration.advancedLoadFailed()), "error");
    } finally {
      loading = false;
    }
  }

  function startSetup() {
    draft = { recoveryKey: generateKey(), twoFactorKey: "" };
    formError = "";
  }

  async function save() {
    if (!draft || busy) return;
    const recoveryKey = draft.recoveryKey.trim();
    const twoFactorKey = draft.twoFactorKey.trim();
    if (recoveryKey.length < 16) {
      formError = m.administration.advancedRecoveryErrorKeyShort();
      return;
    }
    if (twoFactorKey.length < 6) {
      formError = m.administration.advancedRecoveryErrorTwoFactorShort();
      return;
    }
    busy = true;
    try {
      await administrationApi.setupServerRecovery(guildId, { recoveryKey, twoFactorKey });
      draft = null;
      notify(m.administration.advancedRecoverySaved(), "success");
      await load();
    } catch (err) {
      logger.error("Failed to set up server recovery:", err);
      formError = errorText(err, m.administration.advancedRecoveryErrorSetup());
    } finally {
      busy = false;
    }
  }

  async function remove() {
    const confirmed = await requestConfirmation({
      title: m.administration.advancedRecoveryRemoveTitle(),
      message: m.administration.advancedRecoveryRemoveMessage(),
      confirmText: m.common.remove()
    });
    if (!confirmed) return;
    busy = true;
    try {
      await administrationApi.clearServerRecovery(guildId);
      showKey = false;
      notify(m.administration.advancedRecoveryRemoved(), "success");
      await load();
    } catch (err) {
      logger.error("Failed to clear server recovery:", err);
      notify(errorText(err, m.administration.advancedRecoveryRemoveFailed()), "error");
    } finally {
      busy = false;
    }
  }

  async function copyKey() {
    if (!status?.recoveryKey) return;
    try {
      await navigator.clipboard.writeText(status.recoveryKey);
      copied = true;
      setTimeout(() => (copied = false), 2000);
    } catch (err) {
      logger.error("Failed to copy recovery key:", err);
    }
  }

  void load();
</script>

{#snippet setupButton()}
  {#if status && !status.isSetup}
    <button type="button" class="flex items-center justify-center gap-2 px-5 rounded-xl min-h-[50px] font-medium" style={quietStyle} onclick={startSetup}>
      <i class="fa-solid fa-key" aria-hidden="true"></i>
      {m.administration.advancedRecoverySetup()}
    </button>
  {/if}
{/snippet}

<PluginCard title={m.administration.advancedRecoveryTitle()} actions={setupButton} alwaysOpen>
  {#if loading}
    <div class="flex justify-center py-6">
      <div class="w-10 h-10 border-4 rounded-full animate-spin" style="border-color: {$colorStore.primary}20; border-top-color: {$colorStore.primary}"></div>
    </div>
  {:else if status?.isSetup}
    <div class="space-y-1">
      <span class="block text-sm font-medium" style="color: {$colorStore.text}">{m.administration.advancedRecoveryKey()}</span>
      <div class="flex items-center gap-2 min-w-0">
        <code class="grow min-w-0 px-3 rounded-lg text-sm font-mono break-all min-h-[50px] flex items-center" style="background: {$colorStore.primary}10; color: {$colorStore.text};">
          {showKey ? status.recoveryKey : "•".repeat(Math.min(status.recoveryKey?.length ?? 24, 32))}
        </code>
        <button
          type="button"
          class="shrink-0 rounded-lg min-h-[50px] min-w-[50px]"
          style={quietStyle}
          aria-label={showKey ? m.administration.advancedRecoveryHideKey() : m.administration.advancedRecoveryShowKey()}
          onclick={() => (showKey = !showKey)}
        >
          <i class="fa-solid {showKey ? 'fa-eye-slash' : 'fa-eye'}" aria-hidden="true"></i>
        </button>
        <button type="button" class="shrink-0 rounded-lg min-h-[50px] min-w-[50px]" style={quietStyle} aria-label={m.administration.advancedRecoveryCopyKey()} onclick={copyKey}>
          <i class="fa-solid {copied ? 'fa-check' : 'fa-copy'}" aria-hidden="true"></i>
        </button>
      </div>
    </div>
    <button type="button" class="flex items-center justify-center gap-2 px-5 rounded-xl min-h-[44px] font-medium disabled:opacity-50" style={quietStyle} disabled={busy} onclick={remove}>
      <i class="fa-solid fa-trash" aria-hidden="true"></i>
      {m.administration.advancedRecoveryRemove()}
    </button>
  {:else}
    <p class="py-2" style="color: {$colorStore.muted}">{m.administration.advancedRecoveryEmpty()}</p>
  {/if}
</PluginCard>

{#if draft}
  {@const form = draft}
  <Sheet title={m.administration.advancedRecoverySetup()} onclose={() => (draft = null)}>
    <SettingField label={m.administration.advancedRecoveryKey()} id="recovery-key">
      <div class="flex items-center gap-2 min-w-0">
        <input
          id="recovery-key"
          type="text"
          bind:value={form.recoveryKey}
          autocomplete="off"
          spellcheck="false"
          class="grow min-w-0 p-3 rounded-lg border font-mono text-sm focus:ring-2 min-h-[50px]"
          style={inputStyle}
        >
        <button type="button" class="shrink-0 px-4 rounded-lg min-h-[50px]" style={quietStyle} onclick={() => (form.recoveryKey = generateKey())}>
          {m.administration.advancedRecoveryGenerate()}
        </button>
      </div>
    </SettingField>
    <SettingField label={m.administration.advancedRecoveryTwoFactorKey()} id="two-factor-key">
      <input
        id="two-factor-key"
        type="password"
        bind:value={form.twoFactorKey}
        autocomplete="new-password"
        placeholder={m.administration.advancedRecoveryTwoFactorPlaceholder()}
        class="w-full p-3 rounded-lg border focus:ring-2 min-h-[50px]"
        style={inputStyle}
      >
    </SettingField>
    {#if formError}
      <p class="text-sm" role="alert" style="color: {$colorStore.text}">
        <i class="fa-solid fa-circle-exclamation mr-1" style="color: {$colorStore.accent}" aria-hidden="true"></i>{formError}
      </p>
    {/if}
    {#snippet footer()}
      <button type="button" class="px-5 rounded-xl min-h-[44px] font-medium" style={quietStyle} onclick={() => (draft = null)}>
        {m.common.cancel()}
      </button>
      <button type="button" class="px-5 rounded-xl min-h-[44px] font-medium disabled:opacity-50" style={buttonStyle} disabled={busy} onclick={save}>
        {m.common.save()}
      </button>
    {/snippet}
  </Sheet>
{/if}
